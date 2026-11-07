const db = require('../database/connection');

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findById(id) {
  return db
    .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
    .get(id);
}

function create({ name, email, passwordHash }) {
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, passwordHash);

  return findById(Number(result.lastInsertRowid));
}

module.exports = { findByEmail, findById, create };