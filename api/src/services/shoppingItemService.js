const shoppingListRepository = require('../repositories/shoppingListRepository');
const shoppingSectionRepository = require('../repositories/shoppingSectionRepository');
const shoppingItemRepository = require('../repositories/shoppingItemRepository');
const productRepository = require('../repositories/productRepository');
const purchaseService = require('./purchaseService');
const { runInTransaction } = require('../database/transaction');
const AppError = require('../utils/AppError');
const { normalizeText } = require('../utils/textNormalizer');
const { parseId } = require('../utils/validators');
const {
  parseOptionalId,
  validateItemInput,
  validateStatusInput,
} = require('../utils/shoppingValidators');

function getList(userId, listId) {
  const list = shoppingListRepository.findByIdForUser(listId, userId);

  if (!list) {
    throw new AppError('Lista não encontrada.', 404);
  }

  return list;
}

function getItem(userId, itemId) {
  const item = shoppingItemRepository.findByIdForUser(itemId, userId);

  if (!item) {
    throw new AppError('Item não encontrado.', 404);
  }

  return item;
}

function assertSectionBelongsToList(sectionId, listId) {
  const section = shoppingSectionRepository.findById(sectionId);

  if (!section || section.list_id !== listId || section.type !== 'section') {
    throw new AppError('Seção inválida.', 400);
  }
}

// Evita o mesmo item pendente duas vezes na lista (pelo nome ou pelo produto)
function assertNotDuplicated(listId, nameNormalized, productId, ignoreItemId = null) {
  const sameName = shoppingItemRepository.findPendingByName(listId, nameNormalized);
  const sameProduct =
    productId !== null
      ? shoppingItemRepository.findPendingByProduct(listId, productId)
      : undefined;

  const duplicate = [sameName, sameProduct].find(
    (found) => found && found.id !== ignoreItemId
  );

  if (duplicate) {
    throw new AppError('Este item já está na lista.', 409);
  }
}

function listItems(userId, listId) {
  getList(userId, listId);

  return shoppingItemRepository.findAllByList(listId);
}

function createItem(userId, body = {}) {
  const listId = parseId(body.list_id, 'Lista inválida.');
  getList(userId, listId);

  const sectionId = parseOptionalId(body.section_id, 'Seção inválida.');
  if (sectionId !== null) {
    assertSectionBelongsToList(sectionId, listId);
  }

  const productId = parseOptionalId(body.product_id, 'Produto inválido.');
  const product =
    productId !== null ? productRepository.findByIdForUser(productId, userId) : null;

  if (productId !== null && !product) {
    throw new AppError('Produto inválido.', 400);
  }

  const data = validateItemInput({
    ...body,
    name: body.name || product?.name,
    unit: body.unit || product?.unit,
  });
  const nameNormalized = normalizeText(data.name);

  assertNotDuplicated(listId, nameNormalized, productId);

  return shoppingItemRepository.create({
    listId,
    sectionId,
    productId,
    nameNormalized,
    ...data,
  });
}

function updateItem(userId, itemId, body) {
  const item = getItem(userId, itemId);

  if (item.status === 'purchased') {
    throw new AppError(
      'Desmarque o item como comprado antes de editar a quantidade ou o nome.',
      409
    );
  }

  const data = validateItemInput(body);
  const nameNormalized = normalizeText(data.name);

  assertNotDuplicated(item.list_id, nameNormalized, item.product_id, item.id);

  return shoppingItemRepository.update(itemId, { nameNormalized, ...data });
}

// Marca ou desmarca como comprado. Ao marcar, o estoque é atualizado
// (organização inteligente ligada) ou o item vai para o Armazém.
function changeStatus(userId, itemId, body = {}) {
  const item = getItem(userId, itemId);
  const status = validateStatusInput(body);

  if (item.status === status) {
    return { item, outcome: { type: 'none' } };
  }

  const smartOrganization = body.smart_organization === true;

  return runInTransaction(() => {
    if (status === 'purchased') {
      const updated = shoppingItemRepository.updateStatus(itemId, 'purchased');
      const outcome = purchaseService.registerPurchase(userId, updated, smartOrganization);

      return { item: updated, outcome };
    }

    const outcome = purchaseService.undoPurchase(userId, item);

    return { item: shoppingItemRepository.updateStatus(itemId, 'pending'), outcome };
  });
}

function deleteItem(userId, itemId) {
  const item = getItem(userId, itemId);
  const list = getList(userId, item.list_id);

  // Sugestão removida da lista inteligente fica "descartada",
  // para não voltar sozinha na próxima atualização
  if (list.kind === 'smart' && item.origin === 'suggestion') {
    shoppingItemRepository.updateStatus(itemId, 'dismissed');
    return;
  }

  shoppingItemRepository.remove(itemId);
}

module.exports = { listItems, createItem, updateItem, changeStatus, deleteItem };