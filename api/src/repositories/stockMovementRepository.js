const db = require('../database/connection');

function findById(id) {
  return db.prepare('SELECT * FROM stock_movements WHERE id = ?').get(id);
}

function create({
  userId,
  productId,
  type,
  quantityChange,
  shoppingItemId = null,
  warehouseItemId = null,
  revertsMovementId = null,
}) {
  const result = db
    .prepare(
      `INSERT INTO stock_movements
         (user_id, product_id, type, quantity_change,
          shopping_item_id, warehouse_item_id, reverts_movement_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      productId,
      type,
      quantityChange,
      shoppingItemId,
      warehouseItemId,
      revertsMovementId
    );

  return findById(Number(result.lastInsertRowid));
}

// Movimentação de compra ainda válida (não revertida) de um item da lista
function findActiveByShoppingItem(shoppingItemId) {
  return db
    .prepare(
      `SELECT * FROM stock_movements
       WHERE shopping_item_id = ? AND reverted_at IS NULL`
    )
    .get(shoppingItemId);
}

function markReverted(id) {
  db.prepare("UPDATE stock_movements SET reverted_at = datetime('now') WHERE id = ?").run(id);
}

function findAllByUser(userId, productId = null, limit = 100) {
  const base = `
    SELECT m.id, m.product_id, p.name AS product_name, m.type, m.quantity_change,
           m.reverted_at, m.created_at
    FROM stock_movements m
    JOIN products p ON p.id = m.product_id
    WHERE m.user_id = ?
  `;

  if (productId) {
    return db
      .prepare(`${base} AND m.product_id = ? ORDER BY m.id DESC LIMIT ?`)
      .all(userId, productId, limit);
  }

  return db.prepare(`${base} ORDER BY m.id DESC LIMIT ?`).all(userId, limit);
}

module.exports = {
  create,
  findById,
  findActiveByShoppingItem,
  markReverted,
  findAllByUser,
};