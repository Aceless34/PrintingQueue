# Setup & Betrieb

## Voraussetzungen

- Node.js 20+
- npm
- Optional: Docker / Docker Compose
- Optional: MQTT-Broker (z.B. Mosquitto)

## Lokaler Dev-Workflow

### Backend

```powershell
cd backend
npm install
npm run dev
```

- Standard-Port: `http://localhost:4000`
- Datenbank-Datei: `backend/data/printingqueue.db`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

- Standard-Port: `http://localhost:5173`
- API-Base: via `VITE_API_BASE` konfigurierbar

## Environment-Variablen

### Backend (.env)

```powershell
Copy-Item backend\.env.example backend\.env
```

Wichtige Variablen:

- `PORT` – HTTP-Port
- `DB_DIR` – Ordner für SQLite-Datei
- `DB_PATH` – Pfad zur DB-Datei (überschreibt `DB_DIR`)
- `CORS_ORIGINS` – Komma-separierte Origins (z.B. `http://localhost:5173`)
- `MQTT_URL` – z.B. `mqtt://192.168.1.10:1883`
- `MQTT_USERNAME`
- `MQTT_PASSWORD`
- `MQTT_BASE_TOPIC` – Default: `printingqueue`

### Frontend (.env)

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Wichtige Variablen:

- `VITE_API_BASE` – URL des Backends, z.B. `http://localhost:4000`

## Produktionsbetrieb (ohne Docker)

1) Frontend bauen

```powershell
cd frontend
npm install
npm run build
```

2) Backend starten und `frontend/dist` nach `backend/public` kopieren

- Das Backend liefert in `NODE_ENV=production` statische Dateien aus `backend/public`.
- Port und CORS-Origin müssen für die Zielumgebung gesetzt sein.
