const productRepository = require('../repositories/productRepository');
const stockMovementRepository = require('../repositories/stockMovementRepository');
const { runInTransaction } = require('../database/transaction');
const AppError = require('../utils/AppError');
const { parseId, validateQuantityDelta } = require('../utils/validators');

function listMovements(userId, productId = null) {
  return stockMovementRepository.findAllByUser(userId, productId);
}

// Ajuste manual: muda o estoque e registra a movimentação na mesma operação
function applyManualAdjustment(userId, productId, delta) {
  return runInTransaction(() => {
    const wasApplied = productRepository.adjustQuantity(productId, userId, delta);

    if (!wasApplied) {
      throw new AppError('A quantidade não pode ficar negativa.', 400);
    }

    return stockMovementRepository.create({
      userId,
      productId,
      type: 'manual_adjust',
      quantityChange: delta,
    });
  });
}

function registerManualAdjustment(userId, body = {}) {
  const productId = parseId(body.product_id, 'Produto inválido.');

  if (!productRepository.findByIdForUser(productId, userId)) {
    throw new AppError('Produto não encontrado.', 404);
  }

  const delta = validateQuantityDelta({ delta: body.quantity_change });
  const movement = applyManualAdjustment(userId, productId, delta);

  return {
    movement,
    product: productRepository.findByIdForUser(productId, userId),
  };
}

module.exports = { listMovements, applyManualAdjustment, registerManualAdjustment };