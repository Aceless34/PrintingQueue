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
  "colorIds": [3, 5],
  "colorName": "Pastell Blau",
  "colorManufacturer": "Prusament"
}
```

Hinweise:

- `colorIds` ist optional und erlaubt Mehrfarbendruck.
- `colorId` (Singular) wird weiterhin akzeptiert.
- `colorName` erstellt eine neue Farbe (falls nicht vorhanden) und fuegt sie dem Projekt hinzu.

Antwort: Projekt-Objekt (201).

### PATCH /projects/:id

Body (Beispiele):

```json
{ "status": "In Arbeit" }
```

```json
{ "archived": true }
```

```json
{
  "status": "Fertig",
  "consumptions": [{ "rollId": 4, "grams": 120 }]
}
```

Hinweise:

- Beim Setzen von `status=Fertig` ist `consumptions` Pflicht, falls noch kein Verbrauch erfasst wurde.

Antwort: aktualisiertes Projekt.

### DELETE /projects/:id

Antwort: `204 No Content`.

## Filamentfarben

### GET /filament-colors

Antwort: Array der Farben.

### POST /filament-colors

Body:

```json
{
  "name": "Schwarz",
  "manufacturer": "Prusament",
  "material_type": "PLA",
  "hex_color": "#1E1E1E",
  "in_stock": true
}
```

Antwort:

- `201` wenn neu angelegt
- `200` wenn schon vorhanden

### PATCH /filament-colors/:id

Body (Beispiele):

```json
{ "in_stock": false }
```

```json
{ "material_type": "PETG", "hex_color": "#0F4C81" }
```

Antwort: aktualisierte Farbe.

## Filamentrollen

### GET /filament-rolls

Antwort: Array der Rollen (inkl. Farbinfos).

### GET /filament-rolls/:id

Antwort: Einzelne Rolle (inkl. Farbinfos).

### POST /filament-rolls

Body:

```json
{
  "colorId": 3,
  "label": "Rolle A",
  "gramsTotal": 1000,
  "spoolWeightGrams": 220,
  "weightCurrentGrams": 780,
  "purchasePrice": 24.9,
  "purchasedAt": "2026-01-12",
  "openedAt": "2026-01-20"
}
```

Hinweise:

- Wenn `weightCurrentGrams` und `spoolWeightGrams` gesetzt sind, wird `grams_remaining` automatisch berechnet.

Antwort: Rolle (201).

### PATCH /filament-rolls/:id

Body (Beispiele):

```json
{ "weightCurrentGrams": 640 }
```

```json
{ "spoolWeightGrams": 215, "openedAt": "2026-02-01" }
```

Antwort: aktualisierte Rolle.

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
  "color_in_stock": 0,
  "colors": [{ "id": 3, "name": "Pastell Blau", "manufacturer": null, "material_type": "PLA", "hex_color": "#88B9E2", "in_stock": 0 }],
  "usage": [{ "id": 9, "roll_id": 4, "grams_used": 120, "color_name": "Pastell Blau" }],
  "total_grams_used": 120
}
```
