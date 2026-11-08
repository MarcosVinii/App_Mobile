const shoppingListService = require('../services/shoppingListService');
const shoppingSectionService = require('../services/shoppingSectionService');
const { parseId } = require('../utils/validators');

function listId(req) {
  return parseId(req.params.id, 'Lista inválida.');
}

function list(req, res, next) {
  try {
    res.json({ lists: shoppingListService.listLists(req.userId) });
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    res.json(shoppingListService.getListDetail(req.userId, listId(req)));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const created = shoppingListService.createList(req.userId, req.body);
    res.status(201).json({ list: created });
  } catch (error) {
    next(error);
  }
}

function rename(req, res, next) {
  try {
    const renamed = shoppingListService.renameList(req.userId, listId(req), req.body);
    res.json({ list: renamed });
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    shoppingListService.deleteList(req.userId, listId(req));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

function reorder(req, res, next) {
  try {
    res.json(shoppingListService.reorderList(req.userId, listId(req), req.body));
  } catch (error) {
    next(error);
  }
}

function createSection(req, res, next) {
  try {
    const section = shoppingSectionService.createSection(
      req.userId,
      listId(req),
      req.body
    );
    res.status(201).json({ section });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create, rename, remove, reorder, createSection };