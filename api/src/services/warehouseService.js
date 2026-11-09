const productRepository = require('../repositories/productRepository');
const stockMovementRepository = require('../repositories/stockMovementRepository');
const warehouseRepository = require('../repositories/warehouseRepository');
const productMatchService = require('./productMatchService');
const productService = require('./productService');
const { runInTransaction } = require('../database/transaction');
const AppError = require('../utils/AppError');
const { normalizeText } = require('../utils/textNormalizer');
const { convertQuantity } = require('../utils/unitConversion');
const { parseId } = require('../utils/validators');
const { validateItemInput } = require('../utils/shoppingValidators');

function getEntry(userId, entryId) {
  const entry = warehouseRepository.findByIdForUser(entryId, userId);

  if (!entry) {
    throw new AppError('Item do Armazém não encontrado.', 404);
  }

  return entry;
}

function assertPending(entry, message) {
  if (entry.status !== 'pending') {
    throw new AppError(message, 409);
  }
}

function countPending(userId) {
  return warehouseRepository.countPendingByUser(userId);
}

// Itens aguardando organização, cada um com os produtos que podem corresponder
function listPending(userId) {
  const entries = warehouseRepository.findByUser(userId, 'pending');
  const products = productRepository.findAllByUser(userId);

  const items = entries.map((entry) => ({
    ...entry,
    candidates: productMatchService.toCandidates(
      productMatchService.findMatches(products, entry.name)
    ),
  }));

  return { items, pending_count: items.length };
}

function createEntry(userId, body) {
  const data = validateItemInput(body);

  return warehouseRepository.create({
    userId,
    listTitle: 'Adicionado manualmente',
    nameNormalized: normalizeText(data.name),
    ...data,
  });
}

function updateEntry(userId, entryId, body) {
  const entry = getEntry(userId, entryId);
  assertPending(entry, 'Itens já organizados não podem ser editados.');

  const data = validateItemInput(body);

  return warehouseRepository.update(entryId, userId, {
    nameNormalized: normalizeText(data.name),
    ...data,
  });
}

function deleteEntry(userId, entryId) {
  const entry = getEntry(userId, entryId);
  assertPending(entry, 'Itens já organizados não podem ser excluídos.');

  warehouseRepository.remove(entryId, userId);
}

function linkToExistingProduct(userId, entry, rawProductId) {
  const productId = parseId(rawProductId, 'Produto inválido.');
  const product = productRepository.findByIdForUser(productId, userId);

  if (!product) {
    throw new AppError('Produto inválido.', 400);
  }

  const added = convertQuantity(entry.quantity, entry.unit, product.unit);

  if (added === null) {
    throw new AppError(
      'A unidade do item não é compatível com a do produto. Escolha outro produto ou crie um novo.',
      400
    );
  }

  productRepository.adjustQuantity(product.id, userId, added);
  stockMovementRepository.create({
    userId,
    productId: product.id,
    type: 'warehouse_link',
    quantityChange: added,
    warehouseItemId: entry.id,
  });

  return {
    item: warehouseRepository.markOrganized(entry.id, userId, product.id),
    product: productRepository.findByIdForUser(product.id, userId),
  };
}

function createNewProduct(userId, entry, productData) {
  const product = productService.createProduct(userId, {
    name: entry.name,
    quantity: entry.quantity,
    unit: entry.unit,
    ...productData,
  });

  if (product.quantity > 0) {
    stockMovementRepository.create({
      userId,
      productId: product.id,
      type: 'warehouse_new',
      quantityChange: product.quantity,
      warehouseItemId: entry.id,
    });
  }

  return {
    item: warehouseRepository.markOrganized(entry.id, userId, product.id),
    product,
  };
}

// body: { product_id } para somar a um produto existente
//   ou { product: { room_id, category_id, min_quantity, ... } } para criar um novo
function organizeEntry(userId, entryId, body = {}) {
  const entry = getEntry(userId, entryId);
  assertPending(entry, 'Este item já foi organizado.');

  return runInTransaction(() => {
    if (body.product_id !== undefined && body.product_id !== null) {
      return linkToExistingProduct(userId, entry, body.product_id);
    }

    if (body.product && typeof body.product === 'object') {
      return createNewProduct(userId, entry, body.product);
    }

    throw new AppError(
      'Informe o produto existente ou os dados do novo produto.',
      400
    );
  });
}

module.exports = {
  countPending,
  listPending,
  createEntry,
  updateEntry,
  deleteEntry,
  organizeEntry,
};