require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { init } = require("./db");
const { initMqtt } = require("./mqtt");
const { publishProjectStats } = require("./services/statsService");
const projectsRouter = require("./routes/projects");
const filamentColorsRouter = require("./routes/filamentColors");
const filamentManufacturersRouter = require("./routes/filamentManufacturers");
const filamentMaterialsRouter = require("./routes/filamentMaterials");
const filamentRollsRouter = require("./routes/filamentRolls");

const PORT = process.env.PORT || 4000;
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const devOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = corsOrigins.length > 0 ? corsOrigins : devOrigins;

const createApp = () => {
  const app = express();
  initMqtt();

  app.use(
    cors({
      origin: allowedOrigins,
    })
  );
  app.use(express.json());

  if (process.env.NODE_ENV === "production") {
    const staticDir = path.join(__dirname, "public");
    app.use(
      express.static(staticDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".html")) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
          } else if (filePath.endsWith(".js")) {
            res.setHeader(
              "Content-Type",
              "application/javascript; charset=utf-8"
            );
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

  app.use("/projects", projectsRouter);
  app.use("/filament-colors", filamentColorsRouter);
  app.use("/filament-manufacturers", filamentManufacturersRouter);
  app.use("/filament-materials", filamentMaterialsRouter);
  app.use("/filament-rolls", filamentRollsRouter);

  return { app };
};

const startServer = async () => {
  await init();
  const { app } = createApp();
  await publishProjectStats();
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to initialize database", err);
    process.exit(1);
  });
}

module.exports = { createApp, init, startServer };
