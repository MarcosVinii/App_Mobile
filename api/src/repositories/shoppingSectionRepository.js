const db = require('../database/connection');

const SECTION_COLUMNS = 's.id, s.list_id, s.type, s.title, s.position, s.created_at';

function findAllByList(listId) {
  return db
    .prepare(
      `SELECT ${SECTION_COLUMNS} FROM shopping_sections s
       WHERE s.list_id = ? ORDER BY s.position, s.id`
    )
    .all(listId);
}

function findById(id) {
  return db
    .prepare(`SELECT ${SECTION_COLUMNS} FROM shopping_sections s WHERE s.id = ?`)
    .get(id);
}

// Só devolve a seção se a lista dela pertencer ao usuário
function findByIdForUser(id, userId) {
  return db
    .prepare(
      `SELECT ${SECTION_COLUMNS} FROM shopping_sections s
       JOIN shopping_lists l ON l.id = s.list_id
       WHERE s.id = ? AND l.user_id = ?`
    )
    .get(id, userId);
}

function create({ listId, type, title }) {
  const { next } = db
    .prepare(
      'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM shopping_sections WHERE list_id = ?'
    )
    .get(listId);

  const result = db
    .prepare('INSERT INTO shopping_sections (list_id, type, title, position) VALUES (?, ?, ?, ?)')
    .run(listId, type, title, next);

  return findById(Number(result.lastInsertRowid));
}

function updateTitle(id, title) {
  db.prepare('UPDATE shopping_sections SET title = ? WHERE id = ?').run(title, id);

  return findById(id);
}

function updatePosition(id, position) {
  db.prepare('UPDATE shopping_sections SET position = ? WHERE id = ?').run(position, id);
}

function remove(id) {
  db.prepare('DELETE FROM shopping_sections WHERE id = ?').run(id);
}

module.exports = {
  findAllByList,
  findById,
  findByIdForUser,
  create,
  updateTitle,
  updatePosition,
  remove,
};