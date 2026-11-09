const stockMovementService = require('../services/stockMovementService');
const { parseId } = require('../utils/validators');

function list(req, res, next) {
  try {
    const productId = req.query.product_id
      ? parseId(req.query.product_id, 'Produto inválido.')
      : null;

    res.json({ movements: stockMovementService.listMovements(req.userId, productId) });
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const result = stockMovementService.registerManualAdjustment(req.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create };