# Backend

## Einstieg

- Hauptdatei: `backend/server.js`
- DB-Helper: `backend/db.js`
- MQTT-Integration: `backend/mqtt.js`

## Express-App

- JSON-Parser aktiviert.
- CORS-Whitelist über `CORS_ORIGINS` oder Dev-Default.
- `/health` für Liveness-Checks.
- In `NODE_ENV=production`: statische Dateien in `backend/public`.

## Validierung (Auswahl)

- `url`: erforderlich, String.
- `quantity`: positive Ganzzahl.
- `urgency`: `Niedrig | Mittel | Hoch`.
- `status`: `Offen | In Arbeit | Fertig`.
- `colorId`: falls gesetzt, muss existieren.
- `colorName`: falls gesetzt, wird erzeugt oder wiederverwendet.

## Fehlerbehandlung

- Validierungsfehler: `400` mit `error`-Nachricht.
- Nicht gefunden: `404`.
- Standardfehler: `500`.

## MQTT

- Verbindung nur, wenn `MQTT_URL` gesetzt ist.
- Topics werden nach jeder Änderung an Projekten publiziert.
- Retain-Flag ist aktiv.

Details siehe [MQTT](mqtt.md).
