const roomRepository = require('../repositories/roomRepository');
const AppError = require('../utils/AppError');
const { validateRoomInput } = require('../utils/validators');
const { parseImage } = require('../utils/imageValidator');

function assertNameAvailable(userId, name, ignoreRoomId = null) {
  const existing = roomRepository.findByNameForUser(name, userId);

  if (existing && existing.id !== ignoreRoomId) {
    throw new AppError('Você já tem um cômodo com esse nome.', 409);
  }
}

function listRooms(userId) {
  return roomRepository.findAllByUser(userId);
}

function getRoom(userId, roomId) {
  const room = roomRepository.findByIdForUser(roomId, userId);

  if (!room) {
    throw new AppError('Cômodo não encontrado.', 404);
  }

  return room;
}

function createRoom(userId, body) {
  const data = validateRoomInput(body);
  const image = parseImage(body?.image) ?? null;

  assertNameAvailable(userId, data.name);

  return roomRepository.create({ userId, ...data, image });
}

function updateRoom(userId, roomId, body) {
  const current = getRoom(userId, roomId);

  const data = validateRoomInput(body);
  const imageInput = parseImage(body?.image);
  const image = imageInput === undefined ? current.image : imageInput;

  assertNameAvailable(userId, data.name, roomId);

  return roomRepository.update(roomId, userId, { ...data, image });
}

function deleteRoom(userId, roomId) {
  getRoom(userId, roomId);
  roomRepository.remove(roomId, userId);
}

module.exports = { listRooms, getRoom, createRoom, updateRoom, deleteRoom };