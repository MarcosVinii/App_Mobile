const shoppingListRepository = require('../repositories/shoppingListRepository');
const shoppingItemRepository = require('../repositories/shoppingItemRepository');
const smartSuggestionRepository = require('../repositories/smartSuggestionRepository');
const productRepository = require('../repositories/productRepository');
const shoppingListService = require('./shoppingListService');
const { runInTransaction } = require('../database/transaction');
const { normalizeText } = require('../utils/textNormalizer');

const SMART_LIST_TITLE = 'Lista inteligente';

// Ordem de urgência: sem estoque vem antes de estoque baixo
const ALERT_STATUSES = ['out_of_stock', 'low_stock'];

function isAlert(product) {
  return ALERT_STATUSES.includes(product.stock_status);
}

function compareByUrgency(a, b) {
  const priorityDiff =
    ALERT_STATUSES.indexOf(a.stock_status) - ALERT_STATUSES.indexOf(b.stock_status);

  if (priorityDiff !== 0) return priorityDiff;

  return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
}

// Regra simples: repor até o dobro do mínimo (e no mínimo 1)
function suggestQuantity(product) {
  const target = Math.max(product.min_quantity * 2, 1);
  const missing = Math.round((target - product.quantity) * 1000) / 1000;

  return missing > 0 ? missing : 1;
}

function getOrCreateSmartList(userId) {
  return (
    shoppingListRepository.findSmartByUser(userId) ||
    shoppingListRepository.create({ userId, title: SMART_LIST_TITLE, kind: 'smart' })
  );
}

function removeObsoleteSuggestions(suggestions, productsById) {
  let removed = 0;

  suggestions.forEach((suggestion) => {
    const product = productsById.get(suggestion.product_id);

    // Produto excluído ou que saiu do alerta: a sugestão não faz mais sentido
    if (!product || !isAlert(product)) {
      shoppingItemRepository.remove(suggestion.id);
      removed += 1;
    }
  });

  return removed;
}

function addMissingSuggestions(listId, alertProducts, suggestions) {
  const suggestedProductIds = new Set(suggestions.map((suggestion) => suggestion.product_id));
  let added = 0;

  alertProducts.forEach((product) => {
    if (suggestedProductIds.has(product.id)) return;

    const nameNormalized = normalizeText(product.name);
    const alreadyListed =
      shoppingItemRepository.findPendingByProduct(listId, product.id) ||
      shoppingItemRepository.findPendingByName(listId, nameNormalized);

    if (alreadyListed) return;

    shoppingItemRepository.create({
      listId,
      sectionId: null,
      productId: product.id,
      name: product.name,
      nameNormalized,
      quantity: suggestQuantity(product),
      unit: product.unit,
      origin: 'suggestion',
    });
    added += 1;
  });

  return added;
}

function syncSmartList(userId) {
  const list = getOrCreateSmartList(userId);
  const products = productRepository.findAllByUser(userId);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const alertProducts = products.filter(isAlert).sort(compareByUrgency);

  const summary = { added: 0, removed: 0 };

  runInTransaction(() => {
    const suggestions = smartSuggestionRepository.findByList(list.id);

    summary.removed = removeObsoleteSuggestions(suggestions, productsById);
    summary.added = addMissingSuggestions(list.id, alertProducts, suggestions);
  });

  return { ...shoppingListService.getListDetail(userId, list.id), sync: summary };
}

module.exports = { syncSmartList };