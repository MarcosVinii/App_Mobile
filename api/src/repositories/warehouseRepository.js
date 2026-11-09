const db = require('../database/connection');

const COLUMNS = `w.id, w.shopping_item_id, w.product_id, w.list_title, w.name, w.quantity,
  w.unit, w.status, w.purchased_at, w.organized_at, w.created_at`;

function findByUser(userId, status = 'pending') {
  return db
    .prepare(
      `SELECT ${COLUMNS} FROM warehouse_items w
       WHERE w.user_id = ? AND w.status = ? ORDER BY w.id`
    )
    .all(userId, status);
}

function findByIdForUser(id, userId) {
  return db
    .prepare(`SELECT ${COLUMNS} FROM warehouse_items w WHERE w.id = ? AND w.user_id = ?`)
    .get(id, userId);
}

function findByShoppingItem(shoppingItemId) {
  return db
    .prepare(`SELECT ${COLUMNS} FROM warehouse_items w WHERE w.shopping_item_id = ?`)
    .get(shoppingItemId);
}

function countPendingByUser(userId) {
  const { total } = db
    .prepare(
      "SELECT COUNT(*) AS total FROM warehouse_items WHERE user_id = ? AND status = 'pending'"
    )
    .get(userId);

  return total;
}

function create({
  userId,
  shoppingItemId = null,
  listTitle = null,
  name,
  nameNormalized,
  quantity,
  unit,
}) {
  const result = db
    .prepare(
      `INSERT INTO warehouse_items
         (user_id, shopping_item_id, list_title, name, name_normalized, quantity, unit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(userId, shoppingItemId, listTitle, name, nameNormalized, quantity, unit);

  return findByIdForUser(Number(result.lastInsertRowid), userId);
}

function update(id, userId, { name, nameNormalized, quantity, unit }) {
  db.prepare(
    `UPDATE warehouse_items SET name = ?, name_normalized = ?, quantity = ?, unit = ?
     WHERE id = ? AND user_id = ?`
  ).run(name, nameNormalized, quantity, unit, id, userId);

  return findByIdForUser(id, userId);
}

function markOrganized(id, userId, productId) {
  db.prepare(
    `UPDATE warehouse_items
     SET status = 'organized', product_id = ?, organized_at = datetime('now')
     WHERE id = ? AND user_id = ?`
  ).run(productId, id, userId);

  return findByIdForUser(id, userId);
}

function remove(id, userId) {
  db.prepare('DELETE FROM warehouse_items WHERE id = ? AND user_id = ?').run(id, userId);
}

module.exports = {
  findByUser,
  findByIdForUser,
  findByShoppingItem,
  countPendingByUser,
  create,
  update,
  markOrganized,
  remove,
};