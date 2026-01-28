const mqtt = require("mqtt");

let client = null;
let baseTopic = "printingqueue";

const initMqtt = () => {
  const url = process.env.MQTT_URL;
  if (!url) return null;

  baseTopic = process.env.MQTT_BASE_TOPIC || "printingqueue";

  client = mqtt.connect(url, {
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
  });

  client.on("connect", () => {
    console.log(`MQTT connected to ${url}`);
  });

  client.on("error", (err) => {
    console.error("MQTT error", err);
  });

  return client;
};

const publish = (topic, payload, options = { retain: true }) => {
  if (!client || !client.connected) return;
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  client.publish(`${baseTopic}/${topic}`, data, options);
};

module.exports = { initMqtt, publish };
