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

const migrateProjectColors = async () => {
  await run(
    `INSERT OR IGNORE INTO project_colors (project_id, color_id)
     SELECT id, color_id FROM projects WHERE color_id IS NOT NULL`
  );
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
      material_type TEXT,
      hex_color TEXT,
      in_stock INTEGER NOT NULL DEFAULT 1,
      grams_available INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS filament_manufacturers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL COLLATE NOCASE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  );

  await run(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_filament_manufacturers_name
     ON filament_manufacturers (LOWER(name))`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS filament_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL COLLATE NOCASE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  );

  await run(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_filament_materials_name
     ON filament_materials (LOWER(name))`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS project_colors (
      project_id INTEGER NOT NULL,
      color_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (project_id, color_id)
    );`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS filament_rolls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      color_id INTEGER NOT NULL,
      label TEXT,
      spool_weight_grams INTEGER,
      grams_total INTEGER NOT NULL,
      grams_remaining INTEGER NOT NULL,
      weight_current_grams INTEGER,
      purchase_price REAL,
      purchased_at TEXT,
      opened_at TEXT,
      last_dried_at TEXT,
      needs_drying INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS project_filament_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      roll_id INTEGER NOT NULL,
      grams_used INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  );

  await ensureColumn("projects", "color_id", "INTEGER");
  await ensureColumn("filament_colors", "material_type", "TEXT");
  await ensureColumn("filament_colors", "hex_color", "TEXT");
  await ensureColumn("filament_rolls", "spool_weight_grams", "INTEGER");
  await ensureColumn("filament_rolls", "weight_current_grams", "INTEGER");
  await ensureColumn("filament_rolls", "purchase_price", "REAL");
  await ensureColumn("filament_rolls", "purchased_at", "TEXT");
  await ensureColumn("filament_rolls", "opened_at", "TEXT");
  await ensureColumn("filament_rolls", "last_dried_at", "TEXT");
  await ensureColumn("filament_rolls", "needs_drying", "INTEGER NOT NULL DEFAULT 0");
  await migrateFilamentColors();
  await migrateProjectColors();
};

const close = () =>
  new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

module.exports = { db, run, get, all, init, close };
