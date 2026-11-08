const db = require('./connection');

const DEFAULT_CATEGORIES = [
  { name: 'Alimentos', icon: 'food-apple' },
  { name: 'Bebidas', icon: 'bottle-soda' },
  { name: 'Limpeza', icon: 'spray-bottle' },
  { name: 'Higiene', icon: 'toothbrush-paste' },
  { name: 'Casa e utilidades', icon: 'hammer-wrench' },
  { name: 'Outros', icon: 'package-variant' },
];

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'door',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      quantity REAL NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      min_quantity REAL NOT NULL DEFAULT 0 CHECK (min_quantity >= 0),
      unit TEXT NOT NULL DEFAULT 'un',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
    CREATE INDEX IF NOT EXISTS idx_products_room_id ON products(room_id);
  `);
}

function seedCategories() {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO categories (name, icon) VALUES (?, ?)'
  );

  DEFAULT_CATEGORIES.forEach((category) => {
    insert.run(category.name, category.icon);
  });
}

function runMigrations() {
  createTables();
  seedCategories();
}

module.exports = { runMigrations };