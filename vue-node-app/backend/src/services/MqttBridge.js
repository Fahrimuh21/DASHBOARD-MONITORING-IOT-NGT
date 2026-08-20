const mqtt = require('mqtt');

function parseBoolean(value) {
  return String(value).toLowerCase() === 'true';
}

function startMqttBridge() {
  if (!parseBoolean(process.env.MQTT_BRIDGE_ENABLED)) return null;

  const broker = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
  const topic = process.env.MQTT_TOPIC || 'ngtpkmkcundip/co2/sensor/+';
  const backendUrl = process.env.MQTT_BACKEND_URL || 'http://localhost:3001/api/sensor/reading';
  const deviceToken = process.env.MQTT_DEVICE_TOKEN;

  if (!deviceToken) {
    console.error('[MQTT] MQTT_DEVICE_TOKEN belum dikonfigurasi. Bridge tidak dimulai.');
    return null;
  }

  console.log(`[MQTT] Menghubungkan ke ${broker}`);
  const client = mqtt.connect(broker, {
    clientId: `ngt-mqtt-bridge-${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log(`[MQTT] Terhubung; subscribe ${topic}`);
    client.subscribe(topic, (error) => {
      if (error) console.error('[MQTT] Subscribe gagal:', error.message);
    });
  });

  client.on('error', (error) => console.error('[MQTT] Error:', error.message));

  client.on('message', async (messageTopic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const co2Value = data.co2_value ?? data.co2_ppm;
      const deviceCode = data.device_code;

      if (!deviceCode || !Number.isFinite(Number(co2Value))) {
        console.error(`[MQTT] Payload diabaikan dari ${messageTopic}: device_code/co2 tidak valid`);
        return;
      }

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-token': deviceToken,
        },
        body: JSON.stringify({
          ...data,
          device_code: deviceCode,
          co2_value: Number(co2Value),
          device_token: deviceToken,
        }),
      });

      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseBody.message || 'request gagal'}`);
      }
      console.log(`[MQTT] ${deviceCode}: ${responseBody.message || 'data diteruskan'}`);
    } catch (error) {
      console.error('[MQTT] Gagal meneruskan data:', error.message);
    }
  });

  return client;
}

module.exports = startMqttBridge;