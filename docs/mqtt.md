# MQTT / Home Assistant

## Aktivierung

Die MQTT-Integration ist optional und wird nur aktiviert, wenn `MQTT_URL` gesetzt ist.

## Topics

- `<MQTT_BASE_TOPIC>/count_open`
  - Payload: `{ "count": number }`
- `<MQTT_BASE_TOPIC>/latest_high_urgent`
  - Payload: Projekt-JSON oder `{}`

Standard-Topic: `printingqueue` (wenn `MQTT_BASE_TOPIC` nicht gesetzt ist).

## Beispiel Home Assistant

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

Optional weitere Sensoren:

```yaml
template:
  - sensor:
      - name: printingqueue_latest_status
        state: "{{ state_attr('sensor.printingqueue_latest_high_urgent','status') or 'none' }}"
      - name: printingqueue_latest_urgency
        state: "{{ state_attr('sensor.printingqueue_latest_high_urgent','urgency') or 'none' }}"
```
