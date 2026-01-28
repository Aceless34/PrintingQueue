# API-Referenz

Basis-URL: `http://localhost:4000`

## Health

### GET /health

Antwort:

```json
{ "ok": true }
```

## Projekte

### GET /projects

Query-Parameter:

- `includeArchived=0|1`

Antwort: Array von Projekten, absteigend nach `created_at`.

### POST /projects

Body:

```json
{
  "url": "https://www.printables.com/",
  "quantity": 2,
  "notes": "PETG, 0.2mm",
  "urgency": "Mittel",
  "colorId": 3,
  "colorName": "Pastell Blau"
}
```

Hinweise:

- `colorId` oder `colorName` sind optional.
- `colorName` erstellt eine neue Farbe (falls nicht vorhanden) und setzt sie als nicht vorhanden.

Antwort: Projekt-Objekt (201).

### PATCH /projects/:id

Body (Beispiele):

```json
{ "status": "In Arbeit" }
```

```json
{ "archived": true }
```

Antwort: aktualisiertes Projekt.

### DELETE /projects/:id

Antwort: `204 No Content`.

## Filamentfarben

### GET /filament-colors

Antwort: Array der Farben.

### POST /filament-colors

Body:

```json
{ "name": "Schwarz", "in_stock": true }
```

Antwort:

- `201` wenn neu angelegt
- `200` wenn schon vorhanden

### PATCH /filament-colors/:id

Body:

```json
{ "in_stock": false }
```

Antwort: aktualisierte Farbe.

## Projekt-Objekt (Beispiel)

```json
{
  "id": 1,
  "url": "https://www.printables.com/...",
  "quantity": 2,
  "notes": "PETG, 0.2mm",
  "urgency": "Mittel",
  "status": "Offen",
  "archived": 0,
  "created_at": "2026-01-28 12:00:00",
  "updated_at": "2026-01-28 12:00:00",
  "color_id": 3,
  "color_name": "Pastell Blau",
  "color_in_stock": 0
}
```
