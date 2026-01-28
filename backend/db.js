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

const ensureColumn = async (tableName, columnName, columnDef) => {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((col) => col.name === columnName);
  if (!exists) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
  }
};

const migrateFilamentColors = async () => {
  const columns = await all(`PRAGMA table_info(filament_colors)`);
  if (columns.length === 0) return;

  const hasManufacturer = columns.some((col) => col.name === "manufacturer");
  const indexes = await all(`PRAGMA index_list(filament_colors)`);
  const uniqueIndexes = indexes.filter((index) => index.unique);
  let hasNameOnlyUnique = false;

  for (const index of uniqueIndexes) {
    const info = await all(`PRAGMA index_info(${index.name})`);
    if (info.length === 1 && info[0].name === "name") {
      hasNameOnlyUnique = true;
      break;
    }
  }

  if (hasManufacturer && !hasNameOnlyUnique) {
    await run(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_filament_colors_name_manufacturer
       ON filament_colors (LOWER(name), LOWER(IFNULL(manufacturer, '')))`
    );
    return;
  }

  await run("BEGIN");
  try {
    await run(
      `CREATE TABLE filament_colors_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL COLLATE NOCASE,
        manufacturer TEXT,
        in_stock INTEGER NOT NULL DEFAULT 1,
        grams_available INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`
    );

    if (hasManufacturer) {
      await run(
        `INSERT INTO filament_colors_new (
          id, name, manufacturer, in_stock, grams_available, created_at, updated_at
        )
        SELECT id, name, manufacturer, in_stock, grams_available, created_at, updated_at
        FROM filament_colors;`
      );
    } else {
      await run(
        `INSERT INTO filament_colors_new (
          id, name, manufacturer, in_stock, grams_available, created_at, updated_at
        )
        SELECT id, name, NULL, in_stock, grams_available, created_at, updated_at
        FROM filament_colors;`
      );
    }

    await run(`DROP TABLE filament_colors`);
    await run(`ALTER TABLE filament_colors_new RENAME TO filament_colors`);
    await run(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_filament_colors_name_manufacturer
       ON filament_colors (LOWER(name), LOWER(IFNULL(manufacturer, '')))`
    );
    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }
};

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

  await run(
    `CREATE TABLE IF NOT EXISTS filament_colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL COLLATE NOCASE,
      manufacturer TEXT,
      in_stock INTEGER NOT NULL DEFAULT 1,
      grams_available INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  );

  await ensureColumn("projects", "color_id", "INTEGER");
  await migrateFilamentColors();
};

const close = () =>
  new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

module.exports = { db, run, get, all, init, close };
