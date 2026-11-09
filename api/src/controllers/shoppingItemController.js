const shoppingItemService = require('../services/shoppingItemService');
const { parseId } = require('../utils/validators');

function itemId(req) {
  return parseId(req.params.id, 'Item inválido.');
}

function list(req, res, next) {
  try {
    const listId = parseId(req.query.list_id, 'Informe a lista (list_id).');
    res.json({ items: shoppingItemService.listItems(req.userId, listId) });
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const item = shoppingItemService.createItem(req.userId, req.body);
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const item = shoppingItemService.updateItem(req.userId, itemId(req), req.body);
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

// Responde { item, outcome }; outcome diz o que aconteceu com o estoque
function changeStatus(req, res, next) {
  try {
    res.json(shoppingItemService.changeStatus(req.userId, itemId(req), req.body));
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    shoppingItemService.deleteItem(req.userId, itemId(req));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, update, changeStatus, remove };