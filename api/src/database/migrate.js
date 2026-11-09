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

    CREATE TABLE IF NOT EXISTS shopping_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'custom' CHECK (kind IN ('custom', 'smart')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);

    -- Cada usuário pode ter no máximo uma lista inteligente
    CREATE UNIQUE INDEX IF NOT EXISTS idx_shopping_lists_smart
      ON shopping_lists(user_id) WHERE kind = 'smart';

    CREATE TABLE IF NOT EXISTS shopping_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'section' CHECK (type IN ('section', 'divider')),
      title TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_shopping_sections_list_id ON shopping_sections(list_id);

    CREATE TABLE IF NOT EXISTS shopping_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      section_id INTEGER,
      product_id INTEGER,
      name TEXT NOT NULL,
      name_normalized TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1 CHECK (quantity > 0),
      unit TEXT NOT NULL DEFAULT 'un',
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'purchased', 'dismissed')),
      origin TEXT NOT NULL DEFAULT 'manual' CHECK (origin IN ('manual', 'suggestion')),
      position INTEGER NOT NULL DEFAULT 0,
      purchased_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
      FOREIGN KEY (section_id) REFERENCES shopping_sections(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_shopping_items_list_id ON shopping_items(list_id);
    CREATE INDEX IF NOT EXISTS idx_shopping_items_product_id ON shopping_items(product_id);

    -- Compras que ainda não foram organizadas no estoque
    CREATE TABLE IF NOT EXISTS warehouse_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      shopping_item_id INTEGER,
      product_id INTEGER,
      list_title TEXT,
      name TEXT NOT NULL,
      name_normalized TEXT NOT NULL,
      quantity REAL NOT NULL CHECK (quantity > 0),
      unit TEXT NOT NULL DEFAULT 'un',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'organized')),
      purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
      organized_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (shopping_item_id) REFERENCES shopping_items(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_warehouse_user_status ON warehouse_items(user_id, status);

    -- Um item da lista só pode ter uma entrada no Armazém
    CREATE UNIQUE INDEX IF NOT EXISTS idx_warehouse_shopping_item
      ON warehouse_items(shopping_item_id) WHERE shopping_item_id IS NOT NULL;

    -- Histórico de tudo que mudou o estoque
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN
        ('purchase', 'warehouse_link', 'warehouse_new', 'manual_adjust', 'reversal')),
      quantity_change REAL NOT NULL,
      shopping_item_id INTEGER,
      warehouse_item_id INTEGER,
      reverts_movement_id INTEGER,
      reverted_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (shopping_item_id) REFERENCES shopping_items(id) ON DELETE SET NULL,
      FOREIGN KEY (warehouse_item_id) REFERENCES warehouse_items(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);

    -- Garante, no banco, que um item não atualize o estoque duas vezes
    CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_movements_active_item
      ON stock_movements(shopping_item_id)
      WHERE shopping_item_id IS NOT NULL AND reverted_at IS NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_movements_active_warehouse
      ON stock_movements(warehouse_item_id)
      WHERE warehouse_item_id IS NOT NULL AND reverted_at IS NULL;
  `);
}

// Acrescenta uma coluna em uma tabela que já existe (bancos criados antes desta versão)
function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();

  if (!columns.some((existing) => existing.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
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
  addColumnIfMissing('shopping_lists', 'notes', 'TEXT');
  seedCategories();
}

module.exports = { runMigrations };