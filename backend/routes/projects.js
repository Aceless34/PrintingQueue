const express = require("express");
const {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../services/projectsService");
const { publishProjectStats } = require("../services/statsService");
const { createHttpError, getErrorStatus } = require("../utils/httpErrors");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "1";
    const rows = await listProjects(includeArchived);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load projects" });
  }
});

router.post("/", async (req, res) => {
  try {
    const project = await createProject(req.body);
    await publishProjectStats();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(201).json(project);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to create project" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid project id");
    }

    const project = await updateProject(id, req.body);
    await publishProjectStats();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(project);
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw createHttpError(400, "Invalid project id");
    }

    await deleteProject(id);
    await publishProjectStats();
    res.status(204).send();
  } catch (err) {
    const status = getErrorStatus(err);
    res.status(status).json({ error: err.message || "Failed to delete project" });
  }
});

module.exports = router;
