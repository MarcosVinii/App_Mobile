const productService = require('../services/productService');
const { parseId } = require('../utils/validators');

function list(req, res, next) {
  try {
    const roomId = req.query.room_id
      ? parseId(req.query.room_id, 'Cômodo inválido.')
      : null;

    res.json({ products: productService.listProducts(req.userId, roomId) });
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    const product = productService.getProduct(req.userId, parseId(req.params.id));
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const product = productService.createProduct(req.userId, req.body);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const product = productService.updateProduct(
      req.userId,
      parseId(req.params.id),
      req.body
    );
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

function changeQuantity(req, res, next) {
  try {
    const product = productService.changeQuantity(
      req.userId,
      parseId(req.params.id),
      req.body
    );
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    productService.deleteProduct(req.userId, parseId(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create, update, changeQuantity, remove };