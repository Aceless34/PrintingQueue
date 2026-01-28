# Überblick

Printing Queue ist eine Fullstack-App zur Verwaltung von 3D-Druck-Aufträgen. Nutzer:innen erfassen Projekte mit URL, Menge, Notizen, Dringlichkeit und optionaler Filamentfarbe. Ein Admin-Dashboard zeigt den aktuellen Stand, erlaubt Status-Updates, Archivierung und Löschen. Optional sendet das Backend Status- und Prioritätsdaten per MQTT an Home Assistant.

## Ziele

- Schnelles Erfassen neuer 3D-Druck-Projekte über ein kompaktes Formular.
- Klare Priorisierung über Dringlichkeit und Status.
- Einfache Verwaltung inkl. Archivierung erledigter Projekte.
- Optional: Echtzeit-Übersicht in Home Assistant via MQTT.

## Nicht-Ziele

- Benutzer-Login oder Rollenverwaltung.
- Datei-Uploads (STL/3MF) oder integrierter Slicer.
- Benachrichtigungen per E-Mail/Push.
- Mehrsprachigkeit.

## Hauptfunktionen

- Projekt-Formular mit Pflichtfeldern (URL, Menge, Dringlichkeit).
- Admin-Dashboard mit Tabelle, Statuswechsel und Archivierung.
- Filamentfarben-Verwaltung (vorhanden/fehlend).
- REST-API für Projekte und Filamentfarben.
- MQTT-Integration für Kennzahlen und höchste Priorität.

## Zielgruppe

- Einzelpersonen oder kleine Teams, die 3D-Druck-Aufträge sammeln und priorisieren.
- Admin-User, die den Status der Aufträge verwalten.
