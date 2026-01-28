# Architektur

## Komponenten

- **Frontend**: React + Vite + Tailwind. Enthält Formular, Dashboard, Filamentfarben-Verwaltung.
- **Backend**: Node.js + Express. REST-API, SQLite-DB, optionale MQTT-Publikation.
- **Datenbank**: SQLite-Datei in `backend/data`.

## Datenfluss

1) Frontend sendet Requests an die REST-API.
2) Backend validiert die Eingaben, schreibt/liest aus SQLite.
3) Bei Änderungen werden MQTT-Topics aktualisiert (falls konfiguriert).

## Verzeichnisstruktur (vereinfacht)

```
backend/
  data/                SQLite-DB
  db.js                DB-Helper + Schema-Init
  mqtt.js              MQTT-Client
  server.js            Express-App + Routen
frontend/
  src/
    App.jsx            UI + API-Calls
    main.jsx           Entry
  index.html
```

## CORS-Strategie

- In `server.js` wird `CORS_ORIGINS` verwendet.
- Falls leer, sind `http://localhost:5173` und `http://127.0.0.1:5173` erlaubt.

## Static Hosting

Im Produktionsmodus (`NODE_ENV=production`) wird `backend/public` als statisches Verzeichnis ausgeliefert. Die gebaute Vite-App (`frontend/dist`) wird in das Backend kopiert.
