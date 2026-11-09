const db = require('../database/connection');

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findById(id) {
  return db
    .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
    .get(id);
}

// Inclui o hash da senha: use só para conferir senhas, nunca para responder ao app
function findByIdWithHash(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function create({ name, email, passwordHash }) {
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, passwordHash);

  return findById(Number(result.lastInsertRowid));
}

function updateProfile(id, { name, email }) {
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);

  return findById(id);
}

function updatePasswordHash(id, passwordHash) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
}

module.exports = {
  findByEmail,
  findById,
  findByIdWithHash,
  create,
  updateProfile,
  updatePasswordHash,
};