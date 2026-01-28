# Frontend

## Einstieg

- Hauptkomponente: `frontend/src/App.jsx`
- Einstiegspunkt: `frontend/src/main.jsx`
- Styles: Tailwind + `frontend/src/index.css`

## Funktionen

- Formular für neue Projekte (URL, Menge, Notizen, Dringlichkeit, Filamentfarbe).
- Projektliste mit Status-Änderung, Archivierung und Löschen.
- Filamentfarben-Verwaltung mit Bestandsmarkierung.
- Anzeige von Anzahl aktiver Projekte.

## API-Integration

Die API-Basis wird über `VITE_API_BASE` konfiguriert:

```
VITE_API_BASE=http://localhost:4000
```

Fallback: `http://localhost:4000`.

## UI-Zustände

- Ladezustand für Projekte.
- Fehlerbanner bei API-Fehlern.
- Disabled-State während Submit oder Farbanlage.

## Hinweise zur Verwendung

- Archivierte Projekte werden optional eingeblendet.
- Filamentfarben mit `in_stock = 0` werden visuell markiert.
