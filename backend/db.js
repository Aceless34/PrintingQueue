const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const defaultDir = path.join(__dirname, "data");
const dataDir = process.env.DB_DIR || defaultDir;
fs.mkdirSync(dataDir, { recursive: true });

const dbPath =
  process.env.DB_PATH || path.join(dataDir, "printingqueue.db");
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const init = async () => {
  await run(
    `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      urgency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Offen',
      archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  );
};

module.exports = { db, run, get, all, init };
