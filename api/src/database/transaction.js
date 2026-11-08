const db = require('./connection');

// Executa várias operações como uma só: se uma falhar, nenhuma é gravada
function runInTransaction(work) {
  db.exec('BEGIN');

  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = { runInTransaction };