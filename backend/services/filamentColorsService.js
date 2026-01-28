const { run, get, all } = require("../db");
const { createHttpError } = require("../utils/httpErrors");

const listColors = async () =>
  all(
    `SELECT * FROM filament_colors ORDER BY LOWER(name) ASC, LOWER(IFNULL(manufacturer, '')) ASC`
  );

const createColor = async ({ name, manufacturer, in_stock }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw createHttpError(400, "Name is required");
  }

  const trimmedName = name.trim();
  const trimmedManufacturer =
    typeof manufacturer === "string" ? manufacturer.trim() : "";
  const normalizedManufacturer = trimmedManufacturer ? trimmedManufacturer : null;
  const stockValue = in_stock ? 1 : 0;

  try {
    const insert = await run(
      `INSERT INTO filament_colors (name, manufacturer, in_stock) VALUES (?, ?, ?)`,
      [trimmedName, normalizedManufacturer, stockValue]
    );
    const color = await get(`SELECT * FROM filament_colors WHERE id = ?`, [
      insert.lastID,
    ]);
    return { color, created: true };
  } catch (err) {
    const existing = await get(
      `SELECT * FROM filament_colors
       WHERE LOWER(name) = LOWER(?)
         AND LOWER(IFNULL(manufacturer, '')) = LOWER(IFNULL(?, ''))`,
      [trimmedName, normalizedManufacturer]
    );
    if (!existing) throw err;
    return { color: existing, created: false };
  }
};

const updateColorStock = async (id, in_stock) => {
  if (in_stock === undefined) {
    throw createHttpError(400, "No fields to update");
  }

  await run(
    `UPDATE filament_colors SET in_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [in_stock ? 1 : 0, id]
  );
  const color = await get(`SELECT * FROM filament_colors WHERE id = ?`, [id]);
  if (!color) {
    throw createHttpError(404, "Color not found");
  }
  return color;
};

module.exports = { listColors, createColor, updateColorStock };
