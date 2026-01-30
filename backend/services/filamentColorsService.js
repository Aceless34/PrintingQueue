const { run, get, all } = require("../db");
const { createHttpError } = require("../utils/httpErrors");

const listColors = async () =>
  all(
    `SELECT * FROM filament_colors ORDER BY LOWER(name) ASC, LOWER(IFNULL(manufacturer, '')) ASC`
  );

const normalizeHex = (value) => {
  if (!value) return null;
  if (typeof value !== "string") {
    throw createHttpError(400, "Hex color must be a string");
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw createHttpError(400, "Hex color must be in format #RRGGBB");
  }
  return hex.toUpperCase();
};

const createColor = async ({ name, manufacturer, material_type, hex_color, in_stock }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw createHttpError(400, "Name is required");
  }

  const trimmedName = name.trim();
  const trimmedManufacturer =
    typeof manufacturer === "string" ? manufacturer.trim() : "";
  const normalizedManufacturer = trimmedManufacturer ? trimmedManufacturer : null;
  const trimmedMaterial =
    typeof material_type === "string" ? material_type.trim() : "";
  const normalizedMaterial = trimmedMaterial ? trimmedMaterial : null;
  const normalizedHex = normalizeHex(hex_color);
  const stockValue = in_stock ? 1 : 0;

  try {
    const insert = await run(
      `INSERT INTO filament_colors (name, manufacturer, material_type, hex_color, in_stock)
       VALUES (?, ?, ?, ?, ?)`,
      [trimmedName, normalizedManufacturer, normalizedMaterial, normalizedHex, stockValue]
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

const updateColor = async (id, payload) => {
  const updates = [];
  const params = [];

  if (payload.name !== undefined) {
    if (typeof payload.name !== "string" || !payload.name.trim()) {
      throw createHttpError(400, "Name is required");
    }
    updates.push("name = ?");
    params.push(payload.name.trim());
  }

  if (payload.manufacturer !== undefined) {
    const trimmedManufacturer =
      typeof payload.manufacturer === "string" ? payload.manufacturer.trim() : "";
    updates.push("manufacturer = ?");
    params.push(trimmedManufacturer ? trimmedManufacturer : null);
  }

  if (payload.material_type !== undefined) {
    const trimmedMaterial =
      typeof payload.material_type === "string" ? payload.material_type.trim() : "";
    updates.push("material_type = ?");
    params.push(trimmedMaterial ? trimmedMaterial : null);
  }

  if (payload.hex_color !== undefined) {
    const normalizedHex = normalizeHex(payload.hex_color);
    updates.push("hex_color = ?");
    params.push(normalizedHex);
  }

  if (payload.in_stock !== undefined) {
    updates.push("in_stock = ?");
    params.push(payload.in_stock ? 1 : 0);
  }

  if (updates.length === 0) {
    throw createHttpError(400, "No fields to update");
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);

  try {
    await run(`UPDATE filament_colors SET ${updates.join(", ")} WHERE id = ?`, params);
  } catch (err) {
    if (err && String(err.message || "").includes("UNIQUE")) {
      throw createHttpError(400, "Color already exists");
    }
    throw err;
  }

  const color = await get(`SELECT * FROM filament_colors WHERE id = ?`, [id]);
  if (!color) {
    throw createHttpError(404, "Color not found");
  }
  return color;
};

const deleteColor = async (id) => {
  const existing = await get(`SELECT id FROM filament_colors WHERE id = ?`, [
    id,
  ]);
  if (!existing) {
    throw createHttpError(404, "Color not found");
  }

  const usageRows = await all(
    `SELECT COUNT(*) as count FROM filament_rolls WHERE color_id = ?
     UNION ALL
     SELECT COUNT(*) as count FROM project_colors WHERE color_id = ?
     UNION ALL
     SELECT COUNT(*) as count FROM projects WHERE color_id = ?`,
    [id, id, id]
  );
  const inUse = usageRows.some((row) => row.count > 0);
  if (inUse) {
    throw createHttpError(
      400,
      "Color is in use and cannot be deleted"
    );
  }

  await run(`DELETE FROM filament_colors WHERE id = ?`, [id]);
};

module.exports = { listColors, createColor, updateColor, deleteColor };
