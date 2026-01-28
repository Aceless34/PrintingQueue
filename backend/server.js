require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { init, run, all, get } = require("./db");
const { initMqtt, publish } = require("./mqtt");

const app = express();
const PORT = process.env.PORT || 4000;
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const mqttClient = initMqtt();

if (corsOrigins.length > 0) {
  app.use(
    cors({
      origin: corsOrigins,
    })
  );
}
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  const staticDir = path.join(__dirname, "public");
  app.use(
    express.static(staticDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
        } else if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
        }
      },
    })
  );
}

app.get("/health", (_req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json({ ok: true });
});

if (process.env.NODE_ENV === "production") {
  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

app.get("/projects", async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "1";
    const rows = await all(
      `SELECT * FROM projects ${includeArchived ? "" : "WHERE archived = 0"} ORDER BY datetime(created_at) DESC`
    );
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load projects" });
  }
});

const publishProjectStats = async () => {
  if (!mqttClient) return;

  const openCountRow = await get(
    `SELECT COUNT(*) as count FROM projects WHERE archived = 0 AND status = 'Offen'`
  );
  const latestHighUrgent = await get(
    `SELECT * FROM projects WHERE archived = 0 AND urgency = 'Hoch' AND status IN ('Offen', 'In Arbeit') ORDER BY datetime(created_at) DESC LIMIT 1`
  );

  publish("count_open", { count: openCountRow?.count || 0 });
  publish("latest_high_urgent", latestHighUrgent || {});
};

app.post("/projects", async (req, res) => {
  try {
    const { url, quantity, notes, urgency } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1) {
      return res.status(400).json({ error: "Quantity must be a positive integer" });
    }

    const allowedUrgency = ["Niedrig", "Mittel", "Hoch"];
    if (!allowedUrgency.includes(urgency)) {
      return res.status(400).json({ error: "Urgency must be Niedrig, Mittel, or Hoch" });
    }

    const result = await run(
      `INSERT INTO projects (url, quantity, notes, urgency, status)
       VALUES (?, ?, ?, ?, 'Offen')`,
      [url.trim(), parsedQty, notes || "", urgency]
    );

    const project = await get(`SELECT * FROM projects WHERE id = ?`, [result.lastID]);
    await publishProjectStats();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

app.patch("/projects/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid project id" });
    }

    const { status, archived } = req.body;
    const updates = [];
    const params = [];

    if (status) {
      const allowedStatus = ["Offen", "In Arbeit", "Fertig"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: "Status must be Offen, In Arbeit, or Fertig" });
      }
      updates.push("status = ?");
      params.push(status);
    }

    if (archived !== undefined) {
      updates.push("archived = ?");
      params.push(archived ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    await run(`UPDATE projects SET ${updates.join(", ")} WHERE id = ?`, params);
    const project = await get(`SELECT * FROM projects WHERE id = ?`, [id]);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await publishProjectStats();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

app.delete("/projects/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid project id" });
    }

    const existing = await get(`SELECT id FROM projects WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }

    await run(`DELETE FROM projects WHERE id = ?`, [id]);
    await publishProjectStats();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

init()
  .then(() => {
    publishProjectStats();
    app.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database", err);
    process.exit(1);
  });
