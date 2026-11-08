const db = require('../database/connection');

const ITEM_COLUMNS = `i.id, i.list_id, i.section_id, i.product_id, i.name, i.quantity,
  i.unit, i.status, i.origin, i.position, i.purchased_at, i.created_at, i.updated_at`;

function findAllByList(listId) {
  return db
    .prepare(
      `SELECT ${ITEM_COLUMNS} FROM shopping_items i
       WHERE i.list_id = ? AND i.status != 'dismissed'
       ORDER BY i.position, i.id`
    )
    .all(listId);
}

function findById(id) {
  return db
    .prepare(`SELECT ${ITEM_COLUMNS} FROM shopping_items i WHERE i.id = ?`)
    .get(id);
}

// Só devolve o item se a lista dele pertencer ao usuário
function findByIdForUser(id, userId) {
  return db
    .prepare(
      `SELECT ${ITEM_COLUMNS} FROM shopping_items i
       JOIN shopping_lists l ON l.id = i.list_id
       WHERE i.id = ? AND l.user_id = ? AND i.status != 'dismissed'`
    )
    .get(id, userId);
}

function findPendingByName(listId, nameNormalized) {
  return db
    .prepare(
      `SELECT id FROM shopping_items
       WHERE list_id = ? AND name_normalized = ? AND status = 'pending'`
    )
    .get(listId, nameNormalized);
}

function findPendingByProduct(listId, productId) {
  return db
    .prepare(
      `SELECT id FROM shopping_items
       WHERE list_id = ? AND product_id = ? AND status = 'pending'`
    )
    .get(listId, productId);
}

function create({
  listId,
  sectionId,
  productId,
  name,
  nameNormalized,
  quantity,
  unit,
  origin = 'manual',
}) {
  const { next } = db
    .prepare(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next FROM shopping_items
       WHERE list_id = ? AND section_id IS ?`
    )
    .get(listId, sectionId);

  const result = db
    .prepare(
      `INSERT INTO shopping_items
         (list_id, section_id, product_id, name, name_normalized, quantity, unit, origin, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(listId, sectionId, productId, name, nameNormalized, quantity, unit, origin, next);

  return findById(Number(result.lastInsertRowid));
}

function update(id, { name, nameNormalized, quantity, unit }) {
  db.prepare(
    `UPDATE shopping_items
     SET name = ?, name_normalized = ?, quantity = ?, unit = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(name, nameNormalized, quantity, unit, id);

  return findById(id);
}

function updateStatus(id, status) {
  db.prepare(
    `UPDATE shopping_items
     SET status = ?,
         purchased_at = CASE WHEN ? = 'purchased' THEN datetime('now') ELSE NULL END,
         updated_at = datetime('now')
     WHERE id = ?`
  ).run(status, status, id);

  return findById(id);
}

function updatePlacement(id, sectionId, position) {
  db.prepare('UPDATE shopping_items SET section_id = ?, position = ? WHERE id = ?').run(
    sectionId,
    position,
    id
  );
}

function remove(id) {
  db.prepare('DELETE FROM shopping_items WHERE id = ?').run(id);
}

module.exports = {
  findAllByList,
  findById,
  findByIdForUser,
  findPendingByName,
  findPendingByProduct,
  create,
  update,
  updateStatus,
  updatePlacement,
  remove,
};