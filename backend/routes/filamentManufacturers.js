const express = require("express");
const {
  listManufacturers,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
} = require("../services/filamentManufacturersService");
const { createHttpError, getErrorStatus } = require("../utils/httpErrors");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await listManufacturers();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load manufacturers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const manufacturer = await createManufacturer(req.body);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(201).json(manufacturer);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to save manufacturer" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid manufacturer id");
    }
    const updated = await updateManufacturer(id, req.body);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(updated);
  } catch (err) {
    const status = getErrorStatus(err);
    res
      .status(status)
      .json({ error: err.message || "Failed to update manufacturer" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid manufacturer id");
    }
    await deleteManufacturer(id);
    res.status(204).send();
  } catch (err) {
    const status = getErrorStatus(err);
    res
      .status(status)
      .json({ error: err.message || "Failed to delete manufacturer" });
  }
});

module.exports = router;
