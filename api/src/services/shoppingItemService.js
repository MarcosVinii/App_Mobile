const shoppingListRepository = require('../repositories/shoppingListRepository');
const shoppingSectionRepository = require('../repositories/shoppingSectionRepository');
const shoppingItemRepository = require('../repositories/shoppingItemRepository');
const productRepository = require('../repositories/productRepository');
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
  const data = validateItemInput(body);
  const nameNormalized = normalizeText(data.name);

  if (item.status === 'pending') {
    assertNotDuplicated(item.list_id, nameNormalized, item.product_id, item.id);
  }

  return shoppingItemRepository.update(itemId, { nameNormalized, ...data });
}

function changeStatus(userId, itemId, body) {
  const item = getItem(userId, itemId);
  const status = validateStatusInput(body);

  if (item.status === status) {
    return item;
  }

  return shoppingItemRepository.updateStatus(itemId, status);
}

function deleteItem(userId, itemId) {
  getItem(userId, itemId);
  shoppingItemRepository.remove(itemId);
}

module.exports = { listItems, createItem, updateItem, changeStatus, deleteItem };