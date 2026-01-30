const { run, get, all } = require("../db");
const { createHttpError } = require("../utils/httpErrors");

const listRolls = async () =>
  all(
    `SELECT filament_rolls.*, filament_colors.name AS color_name, filament_colors.manufacturer AS color_manufacturer, filament_colors.material_type AS material_type, filament_colors.hex_color AS hex_color, filament_colors.in_stock AS color_in_stock
     FROM filament_rolls
     INNER JOIN filament_colors ON filament_colors.id = filament_rolls.color_id
     ORDER BY datetime(filament_rolls.created_at) DESC`
  );

const getRollById = async (id) =>
  get(
    `SELECT filament_rolls.*, filament_colors.name AS color_name, filament_colors.manufacturer AS color_manufacturer, filament_colors.material_type AS material_type, filament_colors.hex_color AS hex_color, filament_colors.in_stock AS color_in_stock
     FROM filament_rolls
     INNER JOIN filament_colors ON filament_colors.id = filament_rolls.color_id
     WHERE filament_rolls.id = ?`,
    [id]
  );

const getRollUsage = async (id) =>
  all(
    `SELECT project_filament_usage.id AS id,
            project_filament_usage.grams_used AS grams_used,
            project_filament_usage.created_at AS created_at,
            projects.id AS project_id,
            projects.url AS project_url,
            projects.status AS project_status
     FROM project_filament_usage
     INNER JOIN projects ON projects.id = project_filament_usage.project_id
     WHERE project_filament_usage.roll_id = ?
     ORDER BY datetime(project_filament_usage.created_at) DESC`,
    [id]
  );

const parseOptionalDate = (value, field) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throw createHttpError(400, `${field} must be a string`);
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const createRoll = async ({
  colorId,
  label,
  gramsTotal,
  gramsRemaining,
  spoolWeightGrams,
  weightCurrentGrams,
  purchasePrice,
  purchasedAt,
  openedAt,
  lastDriedAt,
  needsDrying,
}) => {
  const parsedColorId = Number(colorId);
  if (!Number.isInteger(parsedColorId)) {
    throw createHttpError(400, "Color id must be an integer");
  }

  const color = await get(`SELECT id FROM filament_colors WHERE id = ?`, [
    parsedColorId,
  ]);
  if (!color) {
    throw createHttpError(400, "Color not found");
  }

  const parsedTotal = Number(gramsTotal);
  if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
    throw createHttpError(400, "Total grams must be a positive number");
  }

  let parsedSpoolWeight = null;
  if (spoolWeightGrams !== undefined && spoolWeightGrams !== null && spoolWeightGrams !== "") {
    parsedSpoolWeight = Number(spoolWeightGrams);
    if (!Number.isFinite(parsedSpoolWeight) || parsedSpoolWeight < 0) {
      throw createHttpError(400, "Spool weight must be a non-negative number");
    }
  }

  let parsedWeightCurrent = null;
  if (weightCurrentGrams !== undefined && weightCurrentGrams !== null && weightCurrentGrams !== "") {
    parsedWeightCurrent = Number(weightCurrentGrams);
    if (!Number.isFinite(parsedWeightCurrent) || parsedWeightCurrent < 0) {
      throw createHttpError(400, "Current weight must be a non-negative number");
    }
  }

  let parsedRemaining = null;
  if (gramsRemaining !== undefined && gramsRemaining !== null && gramsRemaining !== "") {
    parsedRemaining = Number(gramsRemaining);
    if (!Number.isFinite(parsedRemaining) || parsedRemaining < 0) {
      throw createHttpError(400, "Remaining grams must be a non-negative number");
    }
  } else if (parsedWeightCurrent !== null && parsedSpoolWeight !== null) {
    parsedRemaining = parsedWeightCurrent - parsedSpoolWeight;
    if (parsedRemaining < 0) {
      throw createHttpError(400, "Current weight must exceed spool weight");
    }
  } else {
    parsedRemaining = parsedTotal;
  }

  if (parsedRemaining > parsedTotal) {
    throw createHttpError(400, "Remaining grams cannot exceed total grams");
  }

  let parsedPrice = null;
  if (purchasePrice !== undefined && purchasePrice !== null && purchasePrice !== "") {
    parsedPrice = Number(purchasePrice);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw createHttpError(400, "Purchase price must be a non-negative number");
    }
  }

  const trimmedLabel = typeof label === "string" ? label.trim() : "";
  const normalizedPurchasedAt = parseOptionalDate(purchasedAt, "purchasedAt");
  const normalizedOpenedAt = parseOptionalDate(openedAt, "openedAt");
  const normalizedLastDriedAt = parseOptionalDate(
    lastDriedAt,
    "lastDriedAt"
  );
  const needsDryingValue = needsDrying ? 1 : 0;

  const insert = await run(
    `INSERT INTO filament_rolls (
      color_id,
      label,
      spool_weight_grams,
      grams_total,
      grams_remaining,
      weight_current_grams,
      purchase_price,
      purchased_at,
      opened_at,
      last_dried_at,
      needs_drying
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      parsedColorId,
      trimmedLabel || null,
      parsedSpoolWeight,
      parsedTotal,
      parsedRemaining,
      parsedWeightCurrent,
      parsedPrice,
      normalizedPurchasedAt,
      normalizedOpenedAt,
      normalizedLastDriedAt,
      needsDryingValue,
    ]
  );

  const roll = await getRollById(insert.lastID);
  return roll;
};

const updateRoll = async (
  id,
  {
    label,
    gramsTotal,
    gramsRemaining,
    spoolWeightGrams,
    weightCurrentGrams,
    purchasePrice,
    purchasedAt,
    openedAt,
    lastDriedAt,
    needsDrying,
  }
) => {
  const existing = await get(`SELECT * FROM filament_rolls WHERE id = ?`, [id]);
  if (!existing) {
    throw createHttpError(404, "Filament roll not found");
  }

  let nextSpoolWeight =
    spoolWeightGrams !== undefined
      ? spoolWeightGrams
      : existing.spool_weight_grams;
  let nextWeightCurrent =
    weightCurrentGrams !== undefined
      ? weightCurrentGrams
      : existing.weight_current_grams;
  let nextTotal =
    gramsTotal !== undefined ? gramsTotal : existing.grams_total;
  let nextRemaining =
    gramsRemaining !== undefined ? gramsRemaining : existing.grams_remaining;

  if (nextSpoolWeight !== null && nextSpoolWeight !== "") {
    nextSpoolWeight = Number(nextSpoolWeight);
    if (!Number.isFinite(nextSpoolWeight) || nextSpoolWeight < 0) {
      throw createHttpError(400, "Spool weight must be a non-negative number");
    }
  } else {
    nextSpoolWeight = null;
  }

  if (nextWeightCurrent !== null && nextWeightCurrent !== "") {
    nextWeightCurrent = Number(nextWeightCurrent);
    if (!Number.isFinite(nextWeightCurrent) || nextWeightCurrent < 0) {
      throw createHttpError(400, "Current weight must be a non-negative number");
    }
  } else {
    nextWeightCurrent = null;
  }

  nextTotal = Number(nextTotal);
  if (!Number.isFinite(nextTotal) || nextTotal <= 0) {
    throw createHttpError(400, "Total grams must be a positive number");
  }

  if (nextRemaining !== null && nextRemaining !== "") {
    nextRemaining = Number(nextRemaining);
    if (!Number.isFinite(nextRemaining) || nextRemaining < 0) {
      throw createHttpError(400, "Remaining grams must be a non-negative number");
    }
  } else {
    nextRemaining = null;
  }

  if (nextWeightCurrent !== null && nextSpoolWeight !== null) {
    const computedRemaining = nextWeightCurrent - nextSpoolWeight;
    if (computedRemaining < 0) {
      throw createHttpError(400, "Current weight must exceed spool weight");
    }
    nextRemaining = computedRemaining;
  }

  if (nextRemaining === null) {
    nextRemaining = existing.grams_remaining;
  }

  if (nextRemaining > nextTotal) {
    throw createHttpError(400, "Remaining grams cannot exceed total grams");
  }

  const updates = [];
  const params = [];

  if (label !== undefined) {
    const trimmedLabel = typeof label === "string" ? label.trim() : "";
    updates.push("label = ?");
    params.push(trimmedLabel || null);
  }

  if (spoolWeightGrams !== undefined) {
    updates.push("spool_weight_grams = ?");
    params.push(nextSpoolWeight);
  }

  if (gramsTotal !== undefined) {
    updates.push("grams_total = ?");
    params.push(nextTotal);
  }

  const shouldUpdateRemaining =
    gramsRemaining !== undefined || nextRemaining !== existing.grams_remaining;
  if (shouldUpdateRemaining) {
    updates.push("grams_remaining = ?");
    params.push(nextRemaining);
  }

  if (weightCurrentGrams !== undefined) {
    updates.push("weight_current_grams = ?");
    params.push(nextWeightCurrent);
  }

  if (purchasePrice !== undefined) {
    let parsedPrice = null;
    if (purchasePrice !== null && purchasePrice !== "") {
      parsedPrice = Number(purchasePrice);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        throw createHttpError(400, "Purchase price must be a non-negative number");
      }
    }
    updates.push("purchase_price = ?");
    params.push(parsedPrice);
  }

  if (purchasedAt !== undefined) {
    updates.push("purchased_at = ?");
    params.push(parseOptionalDate(purchasedAt, "purchasedAt"));
  }

  if (openedAt !== undefined) {
    updates.push("opened_at = ?");
    params.push(parseOptionalDate(openedAt, "openedAt"));
  }

  if (lastDriedAt !== undefined) {
    updates.push("last_dried_at = ?");
    params.push(parseOptionalDate(lastDriedAt, "lastDriedAt"));
  }

  if (needsDrying !== undefined) {
    updates.push("needs_drying = ?");
    params.push(needsDrying ? 1 : 0);
  }

  if (updates.length === 0) {
    throw createHttpError(400, "No valid fields to update");
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);

  await run("BEGIN");
  try {
    await run(
      `UPDATE filament_rolls SET ${updates.join(", ")} WHERE id = ?`,
      params
    );
    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }

  return getRollById(id);
};

module.exports = {
  listRolls,
  getRollById,
  getRollUsage,
  createRoll,
  updateRoll,
};
