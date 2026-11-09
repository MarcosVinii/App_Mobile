const warehouseService = require('../services/warehouseService');
const { parseId } = require('../utils/validators');

function entryId(req) {
  return parseId(req.params.id, 'Item do Armazém inválido.');
}

function list(req, res, next) {
  try {
    res.json(warehouseService.listPending(req.userId));
  } catch (error) {
    next(error);
  }
}

function count(req, res, next) {
  try {
    res.json({ pending_count: warehouseService.countPending(req.userId) });
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const item = warehouseService.createEntry(req.userId, req.body);
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const item = warehouseService.updateEntry(req.userId, entryId(req), req.body);
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    warehouseService.deleteEntry(req.userId, entryId(req));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

function organize(req, res, next) {
  try {
    res.json(warehouseService.organizeEntry(req.userId, entryId(req), req.body));
  } catch (error) {
    next(error);
  }
}

module.exports = { list, count, create, update, remove, organize };