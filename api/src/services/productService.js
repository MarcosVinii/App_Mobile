const productRepository = require('../repositories/productRepository');
const roomRepository = require('../repositories/roomRepository');
const categoryRepository = require('../repositories/categoryRepository');
const stockMovementService = require('./stockMovementService');
const AppError = require('../utils/AppError');
const { parseImage } = require('../utils/imageValidator');
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
  const image = parseImage(body?.image) ?? null;

  assertReferencesAreValid(userId, data);

  return productRepository.create({ userId, ...data, image });
}

function updateProduct(userId, productId, body) {
  const current = getProduct(userId, productId);

  const data = validateProductInput(body);
  const imageInput = parseImage(body?.image);
  const image = imageInput === undefined ? current.image : imageInput;

  assertReferencesAreValid(userId, data);

  return productRepository.update(productId, userId, { ...data, image });
}

function changeQuantity(userId, productId, body) {
  getProduct(userId, productId);

  const delta = validateQuantityDelta(body);
  stockMovementService.applyManualAdjustment(userId, productId, delta);

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