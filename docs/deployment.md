# Docker & Deployment

## Dockerfile

Das Dockerfile baut zuerst das Frontend, kopiert das Build in das Backend und startet dann `server.js` im Production-Modus.

## Einzelcontainer

```powershell
docker build -t printingqueue .
docker run -p 4000:4000 -v ${PWD}\backend\data:/app/data printingqueue
```

- Die SQLite-Datei wird über das Volume persistiert.

## Docker Compose

```powershell
docker compose up --build
```

In `docker-compose.yml` können Ports, DB-Pfad und MQTT gesetzt werden.

## Reverse Proxy / Hosting

- Stelle sicher, dass `CORS_ORIGINS` die Frontend-URL enthält.
- Bei eigenem Frontend-Hosting kann `VITE_API_BASE` auf das Backend zeigen.
