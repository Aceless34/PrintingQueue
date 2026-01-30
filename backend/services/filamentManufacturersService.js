const { run, get, all } = require("../db");
const { createHttpError } = require("../utils/httpErrors");

const listManufacturers = async () =>
  all(`SELECT * FROM filament_manufacturers ORDER BY LOWER(name) ASC`);

const createManufacturer = async ({ name }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw createHttpError(400, "Name is required");
  }

  const trimmedName = name.trim();
  try {
    const insert = await run(
      `INSERT INTO filament_manufacturers (name) VALUES (?)`,
      [trimmedName]
    );
    return await get(`SELECT * FROM filament_manufacturers WHERE id = ?`, [
      insert.lastID,
    ]);
  } catch (err) {
    const existing = await get(
      `SELECT * FROM filament_manufacturers WHERE LOWER(name) = LOWER(?)`,
      [trimmedName]
    );
    if (!existing) throw err;
    return existing;
  }
};

const updateManufacturer = async (id, { name }) => {
  if (name === undefined) {
    throw createHttpError(400, "No fields to update");
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    throw createHttpError(400, "Name is required");
  }

  const existing = await get(
    `SELECT * FROM filament_manufacturers WHERE id = ?`,
    [id]
  );
  if (!existing) {
    throw createHttpError(404, "Manufacturer not found");
  }

  const trimmedName = name.trim();
  try {
    await run("BEGIN");
    await run(`UPDATE filament_manufacturers SET name = ? WHERE id = ?`, [
      trimmedName,
      id,
    ]);
    await run(
      `UPDATE filament_colors
       SET manufacturer = ?
       WHERE LOWER(IFNULL(manufacturer, '')) = LOWER(IFNULL(?, ''))`,
      [trimmedName, existing.name]
    );
    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    if (err && String(err.message || "").includes("UNIQUE")) {
      throw createHttpError(400, "Manufacturer already exists");
    }
    throw err;
  }

  return get(`SELECT * FROM filament_manufacturers WHERE id = ?`, [id]);
};

const deleteManufacturer = async (id) => {
  const existing = await get(
    `SELECT id FROM filament_manufacturers WHERE id = ?`,
    [id]
  );
  if (!existing) {
    throw createHttpError(404, "Manufacturer not found");
  }

  const inUse = await get(
    `SELECT COUNT(*) as count FROM filament_colors WHERE manufacturer = (
       SELECT name FROM filament_manufacturers WHERE id = ?
     )`,
    [id]
  );
  if (inUse?.count > 0) {
    throw createHttpError(400, "Manufacturer is in use and cannot be deleted");
  }

  await run(`DELETE FROM filament_manufacturers WHERE id = ?`, [id]);
};

module.exports = {
  listManufacturers,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
};
