# Troubleshooting

## CORS-Fehler im Browser

- Prüfe `CORS_ORIGINS` im Backend.
- Für Dev: `http://localhost:5173` oder `http://127.0.0.1:5173`.

## Frontend lädt, aber API-Calls schlagen fehl

- Prüfe `VITE_API_BASE`.
- Backend erreichbar unter `http://localhost:4000`?

## MQTT sendet nichts

- `MQTT_URL` gesetzt?
- Broker erreichbar?
- Logs prüfen: Backend schreibt MQTT-Errors in die Konsole.

## Datenbank leer oder weg

- Prüfe, ob `backend/data` gemountet/persistiert wird.
- Prüfe `DB_DIR` / `DB_PATH`.

## Produktions-Build zeigt weiße Seite

- Stelle sicher, dass das Frontend-Build nach `backend/public` kopiert wurde.
- `NODE_ENV=production` aktivieren.
