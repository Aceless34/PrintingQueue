# PRD – Printing Queue

## Zusammenfassung
Printing Queue ist eine Fullstack-App zur Verwaltung von 3D-Druck-Aufträgen. Nutzer:innen erfassen Projekte mit URL, Menge, Notizen und Dringlichkeit. Ein Admin-Dashboard zeigt den aktuellen Stand, erlaubt Status-Updates, Archivierung und Löschen. Optional sendet das Backend Status- und Prioritätsdaten per MQTT an Home Assistant.

## Ziele
- Schnelles Erfassen neuer 3D-Druck-Projekte über ein kompaktes Formular.
- Klare Priorisierung über Dringlichkeit und Status.
- Einfache Verwaltung inkl. Archivierung erledigter Projekte.
- Optional: Echtzeit-Übersicht in Home Assistant via MQTT.

## Nicht-Ziele (Out of Scope)
- Benutzer-Login oder Rollenverwaltung.
- Dateiuploads (STL/3MF) oder integrierter Slicer.
- Benachrichtigungen per E‑Mail/Push.
- Mehrsprachigkeit.

## Zielgruppe
- Einzelpersonen/kleine Teams, die 3D-Druck-Aufträge sammeln und priorisieren.
- Admin-User, die den Status der Aufträge verwalten.

## Nutzerbedürfnisse (User Stories)
- Als Nutzer:in möchte ich eine Modell-URL, Menge, Notizen und Dringlichkeit angeben, um einen Druckauftrag einzureichen.
- Als Admin möchte ich alle offenen Projekte sehen, um den Arbeitsvorrat zu verstehen.
- Als Admin möchte ich den Status aktualisieren, um den Fortschritt sichtbar zu machen.
- Als Admin möchte ich Projekte archivieren, um die Liste schlank zu halten.
- Als Admin möchte ich Projekte löschen können, um fehlerhafte Einträge zu entfernen.
- Als Smart-Home-Nutzer möchte ich Kennzahlen per MQTT beziehen, um sie in Home Assistant anzuzeigen.

## Funktionsumfang (MVP)

### Frontend
- Formular zum Anlegen eines Projekts:
  - Pflicht: URL, Menge (>= 1), Dringlichkeit (Niedrig/Mittel/Hoch)
  - Optional: Notizen
- Dashboard:
  - Liste aller Projekte (optional inkl. archivierter)
  - Status-Änderung (Offen, In Arbeit, Fertig)
  - Archivieren eines Projekts
  - Löschen eines Projekts (Bestätigungsdialog)
- UI-Zustände:
  - Ladezustand für Projektliste
  - Fehlerzustände für Fetch/Submit

### Backend
- REST API:
  - `GET /projects?includeArchived=0|1`
  - `POST /projects`
  - `PATCH /projects/:id`
  - `DELETE /projects/:id`
- Validierung:
  - URL: vorhanden, String
  - Menge: positive Ganzzahl
  - Dringlichkeit: Niedrig, Mittel, Hoch
  - Status: Offen, In Arbeit, Fertig
- DB: SQLite
- MQTT (optional, wenn `MQTT_URL` gesetzt):
  - `printingqueue/count_open` → `{ "count": number }`
  - `printingqueue/latest_high_urgent` → Projekt-JSON oder `{}`

## Datenmodell
Tabelle `projects`:
- `id` INTEGER, PK, autoincrement
- `url` TEXT, required
- `quantity` INTEGER, required, default 1
- `notes` TEXT, optional
- `urgency` TEXT, required (Niedrig/Mittel/Hoch)
- `status` TEXT, required (Offen/In Arbeit/Fertig), default Offen
- `archived` INTEGER, required, default 0
- `created_at` TEXT, default CURRENT_TIMESTAMP
- `updated_at` TEXT, default CURRENT_TIMESTAMP

## API-Details

### GET /projects
- Query: `includeArchived=0|1`
- Response: Liste der Projekte, sortiert nach `created_at` absteigend.

### POST /projects
- Body:
  - `url` string (required)
  - `quantity` number (required)
  - `notes` string (optional)
  - `urgency` string (required)
- Response: Erstelltes Projekt (201)

### PATCH /projects/:id
- Body:
  - `status` string (optional)
  - `archived` boolean (optional)
- Response: Aktualisiertes Projekt

### DELETE /projects/:id
- Response: 204 (no content)

## UX / UI
- Startseite als Dashboard mit zwei Spalten:
  - Links: Formular „Neues Projekt anlegen“
  - Rechts: Admin-Dashboard mit Tabelle
- Dringlichkeit farblich markiert (Low/Mid/High)
- Status als Select-Dropdown in der Tabelle
- Archivierte Projekte optional sichtbar via Checkbox

## Nicht-funktionale Anforderungen
- Einfacher lokaler Betrieb per `npm run dev`.
- Docker & Docker Compose Support.
- UTF-8 Responses im Backend.
- Keine Authentifizierung erforderlich.

## Abhängigkeiten
- Frontend: React, Vite, Tailwind
- Backend: Node/Express, SQLite, mqtt (optional)
- Docker-Setup

## Risiken & Offene Punkte
- Keine Authentifizierung: Daten sind frei zugänglich im lokalen Netz.
- Fehlende URL-Validierung über „String vorhanden“ hinaus.
- MQTT-Ausfälle werden nur geloggt, nicht retried.

## Erfolgskriterien
- Projekt kann in < 60 Sekunden angelegt werden.
- Admin kann Status ändern und Archivierung mit max. 2 Klicks durchführen.
- MQTT-Topics zeigen stets den korrekten offenen Count und letzte „Hoch“-Prio.

## Milestones (Vorschlag)
1. MVP: CRUD + Dashboard (fertig im Projekt)
2. MQTT-Integration (fertig im Projekt)
3. Optional: Authentifizierung + Rollen
4. Optional: Datei-Uploads/Attachments
