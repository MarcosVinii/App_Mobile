const db = require('../database/connection');
const { STOCK_STATUS_SQL } = require('./stockStatusSql');

function countByStatus(status) {
  return `COALESCE(SUM(CASE
    WHEN p.id IS NOT NULL AND ${STOCK_STATUS_SQL} = '${status}' THEN 1
    ELSE 0
  END), 0)`;
}

// O LEFT JOIN mantém cômodos sem nenhum produto (com contagens zeradas)
const SELECT_ROOM = `
  SELECT r.id, r.name, r.icon, r.image, r.created_at,
         COUNT(p.id) AS total_products,
         ${countByStatus('normal')} AS normal_products,
         ${countByStatus('low_stock')} AS low_stock_products,
         ${countByStatus('out_of_stock')} AS out_of_stock_products
  FROM rooms r
  LEFT JOIN products p ON p.room_id = r.id
`;

function findAllByUser(userId) {
  return db
    .prepare(`${SELECT_ROOM} WHERE r.user_id = ? GROUP BY r.id ORDER BY r.id`)
    .all(userId);
}

function findByIdForUser(id, userId) {
  return db
    .prepare(`${SELECT_ROOM} WHERE r.id = ? AND r.user_id = ? GROUP BY r.id`)
    .get(id, userId);
}

function findByNameForUser(name, userId) {
  return db
    .prepare(
      `SELECT id, name, icon, created_at FROM rooms
       WHERE user_id = ? AND name = ? COLLATE NOCASE`
    )
    .get(userId, name);
}

function create({ userId, name, icon, image = null }) {
  const result = db
    .prepare('INSERT INTO rooms (user_id, name, icon, image) VALUES (?, ?, ?, ?)')
    .run(userId, name, icon, image);

  return findByIdForUser(Number(result.lastInsertRowid), userId);
}

function update(id, userId, { name, icon, image }) {
  db.prepare(
    'UPDATE rooms SET name = ?, icon = ?, image = ? WHERE id = ? AND user_id = ?'
  ).run(name, icon, image, id, userId);

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