const db = require('../database/connection');
const { STOCK_STATUS_SQL } = require('./stockStatusSql');

const SELECT_PRODUCT = `
  SELECT p.id, p.room_id, r.name AS room_name,
         p.category_id, c.name AS category_name, c.icon AS category_icon,
         p.name, p.description, p.image, p.quantity, p.min_quantity, p.unit,
         ${STOCK_STATUS_SQL} AS stock_status,
         p.created_at, p.updated_at
  FROM products p
  JOIN rooms r ON r.id = p.room_id
  JOIN categories c ON c.id = p.category_id
`;

const ORDER_BY_NAME = 'ORDER BY p.name COLLATE NOCASE';

function findAllByUser(userId, roomId = null) {
  if (roomId) {
    return db
      .prepare(`${SELECT_PRODUCT} WHERE p.user_id = ? AND p.room_id = ? ${ORDER_BY_NAME}`)
      .all(userId, roomId);
  }

  return db
    .prepare(`${SELECT_PRODUCT} WHERE p.user_id = ? ${ORDER_BY_NAME}`)
    .all(userId);
}

function findByIdForUser(id, userId) {
  return db
    .prepare(`${SELECT_PRODUCT} WHERE p.id = ? AND p.user_id = ?`)
    .get(id, userId);
}

function create({
  userId,
  roomId,
  categoryId,
  name,
  description,
  image = null,
  quantity,
  minQuantity,
  unit,
}) {
  const result = db
    .prepare(
      `INSERT INTO products
         (user_id, room_id, category_id, name, description, image, quantity, min_quantity, unit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(userId, roomId, categoryId, name, description, image, quantity, minQuantity, unit);

  return findByIdForUser(Number(result.lastInsertRowid), userId);
}

function update(id, userId, data) {
  db.prepare(
    `UPDATE products
     SET room_id = ?, category_id = ?, name = ?, description = ?, image = ?,
         quantity = ?, min_quantity = ?, unit = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`
  ).run(
    data.roomId,
    data.categoryId,
    data.name,
    data.description,
    data.image,
    data.quantity,
    data.minQuantity,
    data.unit,
    id,
    userId
  );

  return findByIdForUser(id, userId);
}

// Soma a variação direto no banco (operação atômica).
// Só aplica se o resultado não ficar negativo; devolve true se aplicou.
function adjustQuantity(id, userId, delta) {
  const result = db
    .prepare(
      `UPDATE products
       SET quantity = ROUND(quantity + ?, 3), updated_at = datetime('now')
       WHERE id = ? AND user_id = ? AND ROUND(quantity + ?, 3) >= 0`
    )
    .run(delta, id, userId, delta);

  return result.changes > 0;
}

function remove(id, userId) {
  db.prepare('DELETE FROM products WHERE id = ? AND user_id = ?').run(id, userId);
}

module.exports = {
  findAllByUser,
  findByIdForUser,
  create,
  update,
  adjustQuantity,
  remove,
};