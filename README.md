# Printing Queue

Fullstack-App für 3D-Druck-Aufträge mit React + Tailwind (Frontend) und Node/Express + SQLite (Backend).

## Starten

### Backend

```powershell
cd backend
npm install
npm run dev
```

Backend läuft standardmäßig auf `http://localhost:4000`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend läuft standardmäßig auf `http://localhost:5173`.

## API

- `GET /projects?includeArchived=0|1`
- `POST /projects`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
# Docker

## Build & Run (single container)

```powershell
docker build -t printingqueue .
docker run -p 4000:4000 -v ${PWD}\backend\data:/app/data printingqueue
```

## With Docker Compose

```powershell
docker compose up --build
```

App ist danach unter `http://localhost:4000` erreichbar.

## ENV-Konfiguration

### Backend (.env)

```powershell
Copy-Item backend\.env.example backend\.env
```

Wichtige Variablen:
- `PORT`
- `DB_DIR`
- `DB_PATH`
- `CORS_ORIGINS`

### Frontend (.env)

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Wichtige Variablen:
- `VITE_API_BASE`

### Docker Compose

Die folgenden ENV-Werte sind in `docker-compose.yml` gesetzt und können dort angepasst werden:
- `PORT`
- `DB_DIR`
- `CORS_ORIGINS`

## Home Assistant (MQTT)

Backend published zwei Topics (retain=true):
- `printingqueue/count_open` -> `{ "count": 3 }`
- `printingqueue/latest_high_urgent` -> komplettes Projekt-JSON oder `{}`

### Beispiel: MQTT Sensoren

```yaml
mqtt:
  sensor:
    - name: printingqueue_count_open
      state_topic: "printingqueue/count_open"
      value_template: "{{ value_json.count }}"
      unit_of_measurement: "Projekte"
    - name: printingqueue_latest_high_urgent
      state_topic: "printingqueue/latest_high_urgent"
      value_template: "{{ value_json.url if value_json.url is defined else 'none' }}"
      json_attributes_topic: "printingqueue/latest_high_urgent"
```

Danach kannst du z.B. per Template den Projekttitel/URL, Dringlichkeit und Status anzeigen:

```yaml
template:
  - sensor:
      - name: printingqueue_latest_status
        state: "{{ state_attr('sensor.printingqueue_latest_high_urgent','status') or 'none' }}"
      - name: printingqueue_latest_urgency
        state: "{{ state_attr('sensor.printingqueue_latest_high_urgent','urgency') or 'none' }}"
```

### MQTT ENV Variablen

- `MQTT_URL` (z.B. `mqtt://192.168.1.10:1883`)
- `MQTT_USERNAME`
- `MQTT_PASSWORD`
- `MQTT_BASE_TOPIC` (Default: `printingqueue`)
