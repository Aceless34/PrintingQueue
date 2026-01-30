const { run, get, all } = require("../db");
const { createHttpError } = require("../utils/httpErrors");

const allowedUrgency = ["Niedrig", "Mittel", "Hoch"];
const allowedStatus = ["Offen", "In Arbeit", "Fertig"];

const listProjectColors = async (projectIds) => {
  if (projectIds.length === 0) return new Map();
  const placeholders = projectIds.map(() => "?").join(", ");
  const rows = await all(
    `SELECT project_colors.project_id,
            filament_colors.id AS id,
            filament_colors.name AS name,
            filament_colors.manufacturer AS manufacturer,
            filament_colors.material_type AS material_type,
            filament_colors.hex_color AS hex_color,
            filament_colors.in_stock AS in_stock
     FROM project_colors
     INNER JOIN filament_colors ON filament_colors.id = project_colors.color_id
     WHERE project_colors.project_id IN (${placeholders})
     ORDER BY LOWER(filament_colors.name) ASC, LOWER(IFNULL(filament_colors.manufacturer, '')) ASC`,
    projectIds
  );

  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.project_id)) {
      map.set(row.project_id, []);
    }
    map.get(row.project_id).push({
      id: row.id,
      name: row.name,
      manufacturer: row.manufacturer,
      material_type: row.material_type,
      hex_color: row.hex_color,
      in_stock: row.in_stock,
    });
  }
  return map;
};

const listProjectUsage = async (projectIds) => {
  if (projectIds.length === 0) return new Map();
  const placeholders = projectIds.map(() => "?").join(", ");
  const rows = await all(
    `SELECT project_filament_usage.project_id AS project_id,
            project_filament_usage.id AS id,
            project_filament_usage.roll_id AS roll_id,
            project_filament_usage.grams_used AS grams_used,
            project_filament_usage.created_at AS created_at,
            filament_rolls.label AS roll_label,
            filament_colors.id AS color_id,
            filament_colors.name AS color_name,
            filament_colors.manufacturer AS color_manufacturer
     FROM project_filament_usage
     INNER JOIN filament_rolls ON filament_rolls.id = project_filament_usage.roll_id
     INNER JOIN filament_colors ON filament_colors.id = filament_rolls.color_id
     WHERE project_filament_usage.project_id IN (${placeholders})
     ORDER BY datetime(project_filament_usage.created_at) DESC`,
    projectIds
  );

  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.project_id)) {
      map.set(row.project_id, []);
    }
    map.get(row.project_id).push({
      id: row.id,
      roll_id: row.roll_id,
      grams_used: row.grams_used,
      created_at: row.created_at,
      roll_label: row.roll_label,
      color_id: row.color_id,
      color_name: row.color_name,
      color_manufacturer: row.color_manufacturer,
    });
  }
  return map;
};

const listProjects = async (includeArchived) => {
  const projects = await all(
    `SELECT projects.*, filament_colors.name AS color_name, filament_colors.manufacturer AS color_manufacturer, filament_colors.in_stock AS color_in_stock
     FROM projects
     LEFT JOIN filament_colors ON filament_colors.id = projects.color_id
     ${includeArchived ? "" : "WHERE projects.archived = 0"}
     ORDER BY datetime(projects.created_at) DESC`
  );

  if (projects.length === 0) return [];

  const projectIds = projects.map((project) => project.id);
  const colorsMap = await listProjectColors(projectIds);
  const usageMap = await listProjectUsage(projectIds);

  return projects.map((project) => {
    const colors = colorsMap.get(project.id) || [];
    const usage = usageMap.get(project.id) || [];
    const totalGramsUsed = usage.reduce(
      (sum, entry) => sum + Number(entry.grams_used || 0),
      0
    );
    return {
      ...project,
      colors,
      usage,
      total_grams_used: totalGramsUsed,
    };
  });
};

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

const resolveColorIds = async ({ colorIds, colorId, colorName, colorManufacturer }) => {
  const ids = new Set();

  if (Array.isArray(colorIds)) {
    for (const value of colorIds) {
      const parsedId = Number(value);
      if (!Number.isInteger(parsedId)) {
        throw createHttpError(400, "Color ids must be integers");
      }
      ids.add(parsedId);
    }
  }

  if (colorId !== undefined && colorId !== null && colorId !== "") {
    const parsedId = Number(colorId);
    if (!Number.isInteger(parsedId)) {
      throw createHttpError(400, "Color id must be an integer");
    }
    ids.add(parsedId);
  }

  const createdId = await resolveColorId({
    colorId: null,
    colorName,
    colorManufacturer,
  });
  if (createdId) ids.add(createdId);

  if (ids.size === 0) return [];

  const idList = Array.from(ids);
  const placeholders = idList.map(() => "?").join(", ");
  const rows = await all(
    `SELECT id FROM filament_colors WHERE id IN (${placeholders})`,
    idList
  );
  if (rows.length !== idList.length) {
    throw createHttpError(400, "Color not found");
  }

  return idList;
};

const fetchProjectById = async (id) => {
  const project = await get(
    `SELECT projects.*, filament_colors.name AS color_name, filament_colors.manufacturer AS color_manufacturer, filament_colors.in_stock AS color_in_stock
     FROM projects
     LEFT JOIN filament_colors ON filament_colors.id = projects.color_id
     WHERE projects.id = ?`,
    [id]
  );
  if (!project) return null;

  const colorsMap = await listProjectColors([id]);
  const usageMap = await listProjectUsage([id]);
  const colors = colorsMap.get(id) || [];
  const usage = usageMap.get(id) || [];
  const totalGramsUsed = usage.reduce(
    (sum, entry) => sum + Number(entry.grams_used || 0),
    0
  );

  return {
    ...project,
    colors,
    usage,
    total_grams_used: totalGramsUsed,
  };
};

const createProject = async ({
  url,
  quantity,
  notes,
  urgency,
  colorId,
  colorIds,
  colorName,
  colorManufacturer,
}) => {
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

  const resolvedColorIds = await resolveColorIds({
    colorIds,
    colorId,
    colorName,
    colorManufacturer,
  });

  const primaryColorId = resolvedColorIds[0] || null;

  await run("BEGIN");
  try {
    const result = await run(
      `INSERT INTO projects (url, quantity, notes, urgency, status, color_id)
       VALUES (?, ?, ?, ?, 'Offen', ?)`,
      [url.trim(), parsedQty, notes || "", urgency, primaryColorId]
    );

    for (const color of resolvedColorIds) {
      await run(
        `INSERT OR IGNORE INTO project_colors (project_id, color_id)
         VALUES (?, ?)`,
        [result.lastID, color]
      );
    }

    await run("COMMIT");
    const project = await fetchProjectById(result.lastID);
    return project;
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }
};

const updateProject = async (id, { status, archived, consumptions }) => {
  const existing = await get(`SELECT * FROM projects WHERE id = ?`, [id]);
  if (!existing) {
    throw createHttpError(404, "Project not found");
  }

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

  const consumptionEntries = Array.isArray(consumptions)
    ? consumptions
    : consumptions === undefined
      ? null
      : [];

  if (consumptions !== undefined && consumptionEntries === null) {
    throw createHttpError(400, "Consumptions must be an array");
  }

  if (consumptionEntries && consumptionEntries.length === 0) {
    throw createHttpError(400, "Consumptions cannot be empty");
  }

  const hasConsumptions = Array.isArray(consumptionEntries);

  if (hasConsumptions) {
    if (status !== "Fertig" && existing.status !== "Fertig") {
      throw createHttpError(
        400,
        "Filamentverbrauch kann nur fuer fertige Projekte gebucht werden"
      );
    }
  }

  if (status === "Fertig" && existing.status !== "Fertig") {
    const usageCount = await get(
      `SELECT COUNT(*) as count FROM project_filament_usage WHERE project_id = ?`,
      [id]
    );
    if ((!hasConsumptions || consumptionEntries.length === 0) && usageCount.count === 0) {
      throw createHttpError(
        400,
        "Bitte den Filamentverbrauch angeben, bevor das Projekt abgeschlossen wird"
      );
    }
  }

  if (updates.length === 0 && !hasConsumptions) {
    throw createHttpError(400, "No valid fields to update");
  }

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
  }

  await run("BEGIN");
  try {
    if (updates.length > 0) {
      params.push(id);
      await run(`UPDATE projects SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    if (hasConsumptions) {
      for (const entry of consumptionEntries) {
        const rollId = Number(entry?.rollId);
        const gramsUsed = Number(entry?.grams);
        if (!Number.isInteger(rollId)) {
          throw createHttpError(400, "Roll id must be an integer");
        }
        if (!Number.isFinite(gramsUsed) || gramsUsed <= 0) {
          throw createHttpError(400, "Grams must be a positive number");
        }

        const roll = await get(
          `SELECT id, color_id, grams_remaining FROM filament_rolls WHERE id = ?`,
          [rollId]
        );
        if (!roll) {
          throw createHttpError(400, "Filament roll not found");
        }
        if (roll.grams_remaining < gramsUsed) {
          throw createHttpError(400, "Nicht genuegend Filament auf der Rolle");
        }

        await run(
          `UPDATE filament_rolls
           SET grams_remaining = grams_remaining - ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [gramsUsed, rollId]
        );

        await run(
          `INSERT INTO project_filament_usage (project_id, roll_id, grams_used)
           VALUES (?, ?, ?)`,
          [id, rollId, gramsUsed]
        );

        await run(
          `INSERT OR IGNORE INTO project_colors (project_id, color_id)
           VALUES (?, ?)`,
          [id, roll.color_id]
        );

        if (!existing.color_id) {
          await run(
            `UPDATE projects SET color_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [roll.color_id, id]
          );
        }
      }
    }

    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }

  const project = await fetchProjectById(id);
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
