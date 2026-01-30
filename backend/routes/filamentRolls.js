const express = require("express");
const {
  listRolls,
  getRollById,
  getRollUsage,
  createRoll,
  updateRoll,
} = require("../services/filamentRollsService");
const { createHttpError, getErrorStatus } = require("../utils/httpErrors");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await listRolls();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load filament rolls" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid roll id");
    }

    const roll = await getRollById(id);
    if (!roll) {
      throw createHttpError(404, "Filament roll not found");
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(roll);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to load roll" });
  }
});

router.get("/:id/usage", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid roll id");
    }

    const roll = await getRollById(id);
    if (!roll) {
      throw createHttpError(404, "Filament roll not found");
    }

    const usage = await getRollUsage(id);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ roll, usage });
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to load roll usage" });
  }
});

router.post("/", async (req, res) => {
  try {
    const roll = await createRoll(req.body);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(201).json(roll);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to create roll" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid roll id");
    }

    const roll = await updateRoll(id, req.body);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(roll);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to update roll" });
  }
});

module.exports = router;
