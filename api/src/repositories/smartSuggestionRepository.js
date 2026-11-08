const db = require('../database/connection');

// Todas as sugestões automáticas da lista, inclusive as descartadas e as compradas
function findByList(listId) {
  return db
    .prepare(
      `SELECT id, product_id, status FROM shopping_items
       WHERE list_id = ? AND origin = 'suggestion'`
    )
    .all(listId);
}

module.exports = { findByList };