const productRepository = require('../repositories/productRepository');
const roomRepository = require('../repositories/roomRepository');
const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');
const {
  validateProductInput,
  validateQuantityDelta,
} = require('../utils/validators');

function assertReferencesAreValid(userId, { roomId, categoryId }) {
  if (!roomRepository.findByIdForUser(roomId, userId)) {
    throw new AppError('Cômodo inválido.', 400);
  }
  if (!categoryRepository.findById(categoryId)) {
    throw new AppError('Categoria inválida.', 400);
  }
}

function listProducts(userId, roomId = null) {
  return productRepository.findAllByUser(userId, roomId);
}

function getProduct(userId, productId) {
  const product = productRepository.findByIdForUser(productId, userId);

  if (!product) {
    throw new AppError('Produto não encontrado.', 404);
  }

  return product;
}

function createProduct(userId, body) {
  const data = validateProductInput(body);
  assertReferencesAreValid(userId, data);

  return productRepository.create({ userId, ...data });
}

function updateProduct(userId, productId, body) {
  getProduct(userId, productId);

  const data = validateProductInput(body);
  assertReferencesAreValid(userId, data);

  return productRepository.update(productId, userId, data);
}

function changeQuantity(userId, productId, body) {
  getProduct(userId, productId);

  const delta = validateQuantityDelta(body);
  const wasApplied = productRepository.adjustQuantity(productId, userId, delta);

  if (!wasApplied) {
    throw new AppError('A quantidade não pode ficar negativa.', 400);
  }

  return productRepository.findByIdForUser(productId, userId);
}

function deleteProduct(userId, productId) {
  getProduct(userId, productId);
  productRepository.remove(productId, userId);
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  changeQuantity,
  deleteProduct,
};