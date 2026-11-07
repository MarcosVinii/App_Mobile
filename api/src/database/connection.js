const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { databasePath } = require('../config/env');

const fullPath = path.resolve(databasePath);
fs.mkdirSync(path.dirname(fullPath), { recursive: true });

const db = new DatabaseSync(fullPath);
db.exec('PRAGMA foreign_keys = ON');

module.exports = db;