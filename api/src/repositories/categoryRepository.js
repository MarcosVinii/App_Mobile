const db = require('../database/connection');

function findAll() {
  return db.prepare('SELECT id, name, icon FROM categories ORDER BY id').all();
}

function findById(id) {
  return db.prepare('SELECT id, name, icon FROM categories WHERE id = ?').get(id);
}

module.exports = { findAll, findById };