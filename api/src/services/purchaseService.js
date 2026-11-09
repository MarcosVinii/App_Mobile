const productRepository = require('../repositories/productRepository');
const shoppingListRepository = require('../repositories/shoppingListRepository');
const stockMovementRepository = require('../repositories/stockMovementRepository');
const warehouseRepository = require('../repositories/warehouseRepository');
const productMatchService = require('./productMatchService');
const AppError = require('../utils/AppError');
const { normalizeText } = require('../utils/textNormalizer');
const { convertQuantity } = require('../utils/unitConversion');

// Produto que pode ser atualizado sem risco de engano:
// o vinculado ao item ou o único com nome idêntico.
function findProductToUpdate(userId, item) {
  if (item.product_id) {
    const linkedProduct = productRepository.findByIdForUser(item.product_id, userId);

    if (linkedProduct) return linkedProduct;
  }

  const products = productRepository.findAllByUser(userId);
  const { exact } = productMatchService.findMatches(products, item.name);

  return exact.length === 1 ? exact[0] : null;
}

function tryUpdateStock(userId, item) {
  const product = findProductToUpdate(userId, item);
  if (!product) return null;

  const added = convertQuantity(item.quantity, item.unit, product.unit);
  if (added === null) return null;

  productRepository.adjustQuantity(product.id, userId, added);
  stockMovementRepository.create({
    userId,
    productId: product.id,
    type: 'purchase',
    quantityChange: added,
    shoppingItemId: item.id,
  });

  return {
    type: 'stock_updated',
    added,
    product: productRepository.findByIdForUser(product.id, userId),
  };
}

function sendToWarehouse(userId, item) {
  const list = shoppingListRepository.findByIdForUser(item.list_id, userId);
  const entry = warehouseRepository.create({
    userId,
    shoppingItemId: item.id,
    listTitle: list ? list.title : null,
    name: item.name,
    nameNormalized: normalizeText(item.name),
    quantity: item.quantity,
    unit: item.unit,
  });

  return { type: 'warehouse', warehouse_item_id: entry.id };
}

// Chamado quando um item vira "comprado". Deve rodar dentro de uma transação.
function registerPurchase(userId, item, smartOrganization) {
  const stockOutcome = smartOrganization ? tryUpdateStock(userId, item) : null;

  return stockOutcome || sendToWarehouse(userId, item);
}

function revertStockMovement(userId, movement) {
  // Subtrai só o que a compra somou, preservando mudanças feitas depois
  const wasApplied = productRepository.adjustQuantity(
    movement.product_id,
    userId,
    -movement.quantity_change
  );

  if (!wasApplied) {
    throw new AppError(
      'O estoque deste produto já foi alterado e não dá para desfazer a compra com segurança. Ajuste o produto manualmente.',
      409
    );
  }

  stockMovementRepository.markReverted(movement.id);
  stockMovementRepository.create({
    userId,
    productId: movement.product_id,
    type: 'reversal',
    quantityChange: -movement.quantity_change,
    revertsMovementId: movement.id,
  });
}

// Chamado quando um item deixa de ser "comprado". Deve rodar dentro de uma transação.
function undoPurchase(userId, item) {
  const movement = stockMovementRepository.findActiveByShoppingItem(item.id);

  if (movement) {
    revertStockMovement(userId, movement);
    return { type: 'stock_reverted' };
  }

  const entry = warehouseRepository.findByShoppingItem(item.id);

  if (!entry) {
    return { type: 'none' };
  }

  if (entry.status === 'organized') {
    throw new AppError(
      'Este item já foi organizado no estoque. Ajuste o produto manualmente se precisar.',
      409
    );
  }

  warehouseRepository.remove(entry.id, userId);
  return { type: 'warehouse_removed' };
}

module.exports = { registerPurchase, undoPurchase };