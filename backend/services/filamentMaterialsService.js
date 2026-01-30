const { run, get, all } = require("../db");
const { createHttpError } = require("../utils/httpErrors");

const listMaterials = async () =>
  all(`SELECT * FROM filament_materials ORDER BY LOWER(name) ASC`);

const createMaterial = async ({ name }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw createHttpError(400, "Name is required");
  }

  const trimmedName = name.trim();
  try {
    const insert = await run(`INSERT INTO filament_materials (name) VALUES (?)`, [
      trimmedName,
    ]);
    return await get(`SELECT * FROM filament_materials WHERE id = ?`, [
      insert.lastID,
    ]);
  } catch (err) {
    const existing = await get(
      `SELECT * FROM filament_materials WHERE LOWER(name) = LOWER(?)`,
      [trimmedName]
    );
    if (!existing) throw err;
    return existing;
  }
};

const updateMaterial = async (id, { name }) => {
  if (name === undefined) {
    throw createHttpError(400, "No fields to update");
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    throw createHttpError(400, "Name is required");
  }

  const existing = await get(
    `SELECT * FROM filament_materials WHERE id = ?`,
    [id]
  );
  if (!existing) {
    throw createHttpError(404, "Material not found");
  }

  const trimmedName = name.trim();
  try {
    await run("BEGIN");
    await run(`UPDATE filament_materials SET name = ? WHERE id = ?`, [
      trimmedName,
      id,
    ]);
    await run(
      `UPDATE filament_colors
       SET material_type = ?
       WHERE LOWER(IFNULL(material_type, '')) = LOWER(IFNULL(?, ''))`,
      [trimmedName, existing.name]
    );
    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    if (err && String(err.message || "").includes("UNIQUE")) {
      throw createHttpError(400, "Material already exists");
    }
    throw err;
  }

  return get(`SELECT * FROM filament_materials WHERE id = ?`, [id]);
};

const deleteMaterial = async (id) => {
  const existing = await get(`SELECT id FROM filament_materials WHERE id = ?`, [
    id,
  ]);
  if (!existing) {
    throw createHttpError(404, "Material not found");
  }

  const inUse = await get(
    `SELECT COUNT(*) as count FROM filament_colors WHERE material_type = (
       SELECT name FROM filament_materials WHERE id = ?
     )`,
    [id]
  );
  if (inUse?.count > 0) {
    throw createHttpError(400, "Material is in use and cannot be deleted");
  }

  await run(`DELETE FROM filament_materials WHERE id = ?`, [id]);
};

module.exports = { listMaterials, createMaterial, updateMaterial, deleteMaterial };
