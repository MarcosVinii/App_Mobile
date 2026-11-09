const db = require('../database/connection');

// Itens descartados (dismissed) não entram nas contagens
const SELECT_LIST = `
  SELECT l.id, l.title, l.kind, l.notes, l.created_at, l.updated_at,
         COUNT(i.id) AS total_items,
         COALESCE(SUM(CASE WHEN i.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_items,
         COALESCE(SUM(CASE WHEN i.status = 'purchased' THEN 1 ELSE 0 END), 0) AS purchased_items
  FROM shopping_lists l
  LEFT JOIN shopping_items i ON i.list_id = l.id AND i.status != 'dismissed'
`;

function findAllCustomByUser(userId) {
  return db
    .prepare(
      `${SELECT_LIST} WHERE l.user_id = ? AND l.kind = 'custom' GROUP BY l.id ORDER BY l.id`
    )
    .all(userId);
}

function findSmartByUser(userId) {
  return db
    .prepare(`${SELECT_LIST} WHERE l.user_id = ? AND l.kind = 'smart' GROUP BY l.id`)
    .get(userId);
}

function findByIdForUser(id, userId) {
  return db
    .prepare(`${SELECT_LIST} WHERE l.id = ? AND l.user_id = ? GROUP BY l.id`)
    .get(id, userId);
}

function create({ userId, title, kind = 'custom', notes = null }) {
  const result = db
    .prepare('INSERT INTO shopping_lists (user_id, title, kind, notes) VALUES (?, ?, ?, ?)')
    .run(userId, title, kind, notes);

  return findByIdForUser(Number(result.lastInsertRowid), userId);
}

function update(id, userId, { title, notes }) {
  db.prepare(
    `UPDATE shopping_lists SET title = ?, notes = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`
  ).run(title, notes, id, userId);

  return findByIdForUser(id, userId);
}

function remove(id, userId) {
  db.prepare('DELETE FROM shopping_lists WHERE id = ? AND user_id = ?').run(id, userId);
}

module.exports = {
  findAllCustomByUser,
  findSmartByUser,
  findByIdForUser,
  create,
  update,
  remove,
};