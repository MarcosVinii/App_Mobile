const roomService = require('../services/roomService');
const { parseId } = require('../utils/validators');

function list(req, res, next) {
  try {
    res.json({ rooms: roomService.listRooms(req.userId) });
  } catch (error) {
    next(error);
  }
}

function getById(req, res, next) {
  try {
    const room = roomService.getRoom(req.userId, parseId(req.params.id));
    res.json({ room });
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    const room = roomService.createRoom(req.userId, req.body);
    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const room = roomService.updateRoom(
      req.userId,
      parseId(req.params.id),
      req.body
    );
    res.json({ room });
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    roomService.deleteRoom(req.userId, parseId(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create, update, remove };