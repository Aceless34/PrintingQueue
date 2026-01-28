# Datenbank

## Speicherort

- Standard: `backend/data/printingqueue.db`
- Konfigurierbar über `DB_DIR` oder `DB_PATH`.

## Initialisierung

Beim Start ruft das Backend `init()` aus `backend/db.js` auf und erstellt Tabellen, falls sie fehlen. Zusätzlich wird die Spalte `projects.color_id` nachgerüstet, falls sie fehlt.

## Tabellen

### projects

- `id` INTEGER, PK, autoincrement
- `url` TEXT, required
- `quantity` INTEGER, required, default 1
- `notes` TEXT, optional
- `urgency` TEXT, required (Niedrig/Mittel/Hoch)
- `status` TEXT, required (Offen/In Arbeit/Fertig), default Offen
- `archived` INTEGER, required, default 0
- `created_at` TEXT, default CURRENT_TIMESTAMP
- `updated_at` TEXT, default CURRENT_TIMESTAMP
- `color_id` INTEGER, optional (kein FK erzwungen)

### filament_colors

- `id` INTEGER, PK, autoincrement
- `name` TEXT, required, UNIQUE (NOCASE)
- `in_stock` INTEGER, required, default 1
- `grams_available` INTEGER, optional
- `created_at` TEXT, default CURRENT_TIMESTAMP
- `updated_at` TEXT, default CURRENT_TIMESTAMP

## Schema-Diagramm

Eine Mermaid-Definition liegt in `database-schema.mmd`. Der Inhalt kann von der tatsächlichen DB abweichen, wenn die DB manuell erweitert wurde.
