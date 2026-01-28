const express = require("express");
const {
  listColors,
  createColor,
  updateColorStock,
} = require("../services/filamentColorsService");
const { createHttpError, getErrorStatus } = require("../utils/httpErrors");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await listColors();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load filament colors" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { color, created } = await createColor(req.body);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(created ? 201 : 200).json(color);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to save filament color" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid color id");
    }

    const { in_stock } = req.body;
    const color = await updateColorStock(id, in_stock);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(color);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to update filament color" });
  }
});

module.exports = router;
