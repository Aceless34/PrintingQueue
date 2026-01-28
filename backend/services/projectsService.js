const { run, get, all } = require("../db");
const { createHttpError } = require("../utils/httpErrors");

const allowedUrgency = ["Niedrig", "Mittel", "Hoch"];
const allowedStatus = ["Offen", "In Arbeit", "Fertig"];

const listProjects = async (includeArchived) =>
  all(
    `SELECT projects.*, filament_colors.name AS color_name, filament_colors.manufacturer AS color_manufacturer, filament_colors.in_stock AS color_in_stock
     FROM projects
     LEFT JOIN filament_colors ON filament_colors.id = projects.color_id
     ${includeArchived ? "" : "WHERE projects.archived = 0"}
     ORDER BY datetime(projects.created_at) DESC`
  );

const resolveColorId = async ({ colorId, colorName, colorManufacturer }) => {
  if (colorId !== undefined && colorId !== null && colorId !== "") {
    const parsedColorId = Number(colorId);
    if (!Number.isInteger(parsedColorId)) {
      throw createHttpError(400, "Color id must be an integer");
    }
    const colorRow = await get(`SELECT id FROM filament_colors WHERE id = ?`, [
      parsedColorId,
    ]);
    if (!colorRow) {
      throw createHttpError(400, "Color not found");
    }
    return parsedColorId;
  }

  if (!colorName || typeof colorName !== "string") return null;
  const trimmedName = colorName.trim();
  if (!trimmedName) {
    throw createHttpError(400, "Color name cannot be empty");
  }

  const trimmedManufacturer =
    typeof colorManufacturer === "string" ? colorManufacturer.trim() : "";
  const normalizedManufacturer = trimmedManufacturer ? trimmedManufacturer : null;

  const existing = await get(
    `SELECT id FROM filament_colors
     WHERE LOWER(name) = LOWER(?)
       AND LOWER(IFNULL(manufacturer, '')) = LOWER(IFNULL(?, ''))`,
    [trimmedName, normalizedManufacturer]
  );
  if (existing) return existing.id;

  const insertColor = await run(
    `INSERT INTO filament_colors (name, manufacturer, in_stock) VALUES (?, ?, 0)`,
    [trimmedName, normalizedManufacturer]
  );
  return insertColor.lastID;
};

const createProject = async ({ url, quantity, notes, urgency, colorId, colorName, colorManufacturer }) => {
  if (!url || typeof url !== "string") {
    throw createHttpError(400, "URL is required");
  }

  const parsedQty = Number(quantity);
  if (!Number.isInteger(parsedQty) || parsedQty < 1) {
    throw createHttpError(400, "Quantity must be a positive integer");
  }

  if (!allowedUrgency.includes(urgency)) {
    throw createHttpError(400, "Urgency must be Niedrig, Mittel, or Hoch");
  }

  const resolvedColorId = await resolveColorId({
    colorId,
    colorName,
    colorManufacturer,
  });

  const result = await run(
    `INSERT INTO projects (url, quantity, notes, urgency, status, color_id)
     VALUES (?, ?, ?, ?, 'Offen', ?)`,
    [url.trim(), parsedQty, notes || "", urgency, resolvedColorId]
  );

  return get(
    `SELECT projects.*, filament_colors.name AS color_name, filament_colors.manufacturer AS color_manufacturer, filament_colors.in_stock AS color_in_stock
     FROM projects
     LEFT JOIN filament_colors ON filament_colors.id = projects.color_id
     WHERE projects.id = ?`,
    [result.lastID]
  );
};

const updateProject = async (id, { status, archived }) => {
  const updates = [];
  const params = [];

  if (status) {
    if (!allowedStatus.includes(status)) {
      throw createHttpError(400, "Status must be Offen, In Arbeit, or Fertig");
    }
    updates.push("status = ?");
    params.push(status);
  }

  if (archived !== undefined) {
    updates.push("archived = ?");
    params.push(archived ? 1 : 0);
  }

  if (updates.length === 0) {
    throw createHttpError(400, "No valid fields to update");
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);

  await run(`UPDATE projects SET ${updates.join(", ")} WHERE id = ?`, params);

  const project = await get(
    `SELECT projects.*, filament_colors.name AS color_name, filament_colors.manufacturer AS color_manufacturer, filament_colors.in_stock AS color_in_stock
     FROM projects
     LEFT JOIN filament_colors ON filament_colors.id = projects.color_id
     WHERE projects.id = ?`,
    [id]
  );

  if (!project) {
    throw createHttpError(404, "Project not found");
  }

  return project;
};

const deleteProject = async (id) => {
  const existing = await get(`SELECT id FROM projects WHERE id = ?`, [id]);
  if (!existing) {
    throw createHttpError(404, "Project not found");
  }
  await run(`DELETE FROM projects WHERE id = ?`, [id]);
};

module.exports = {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
};
