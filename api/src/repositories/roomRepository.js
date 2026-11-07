const db = require('../database/connection');

const ROOM_COLUMNS = 'id, name, icon, created_at';

function findAllByUser(userId) {
  return db
    .prepare(`SELECT ${ROOM_COLUMNS} FROM rooms WHERE user_id = ? ORDER BY id`)
    .all(userId);
}

function findByIdForUser(id, userId) {
  return db
    .prepare(`SELECT ${ROOM_COLUMNS} FROM rooms WHERE id = ? AND user_id = ?`)
    .get(id, userId);
}

function findByNameForUser(name, userId) {
  return db
    .prepare(
      `SELECT ${ROOM_COLUMNS} FROM rooms
       WHERE user_id = ? AND name = ? COLLATE NOCASE`
    )
    .get(userId, name);
}

function create({ userId, name, icon }) {
  const result = db
    .prepare('INSERT INTO rooms (user_id, name, icon) VALUES (?, ?, ?)')
    .run(userId, name, icon);

  return findByIdForUser(Number(result.lastInsertRowid), userId);
}

function update(id, userId, { name, icon }) {
  db.prepare('UPDATE rooms SET name = ?, icon = ? WHERE id = ? AND user_id = ?').run(
    name,
    icon,
    id,
    userId
  );

  return findByIdForUser(id, userId);
}

function remove(id, userId) {
  db.prepare('DELETE FROM rooms WHERE id = ? AND user_id = ?').run(id, userId);
}

module.exports = {
  findAllByUser,
  findByIdForUser,
  findByNameForUser,
  create,
  update,
  remove,
};