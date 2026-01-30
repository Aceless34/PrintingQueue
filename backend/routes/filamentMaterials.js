const express = require("express");
const {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../services/filamentMaterialsService");
const { createHttpError, getErrorStatus } = require("../utils/httpErrors");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await listMaterials();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load materials" });
  }
});

router.post("/", async (req, res) => {
  try {
    const material = await createMaterial(req.body);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(201).json(material);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to save material" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid material id");
    }
    const updated = await updateMaterial(id, req.body);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(updated);
  } catch (err) {
    const status = getErrorStatus(err);
    res
      .status(status)
      .json({ error: err.message || "Failed to update material" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid material id");
    }
    await deleteMaterial(id);
    res.status(204).send();
  } catch (err) {
    const status = getErrorStatus(err);
    res
      .status(status)
      .json({ error: err.message || "Failed to delete material" });
  }
});

module.exports = router;
