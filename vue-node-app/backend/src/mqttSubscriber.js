const mqtt = require('mqtt');
const db = require('./config/db');
const ReadingIngestService = require('./services/ReadingIngestService');

// ================= CONFIG =================
const BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
const TOPIC = process.env.MQTT_TOPIC || 'ngtpkmkcundip/co2/sensor/+';

// ================= MQTT CLIENT =================
const client = mqtt.connect(BROKER, {
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 2000,
});


// ================= MESSAGE HANDLER =================
client.on('message', async (topic, message) => {
  try {

    const data = JSON.parse(message.toString());

    const device_code = data.device_code;
    const co2_ppm = parseFloat(data.co2_value);

    if (!device_code || isNaN(co2_ppm)) {
      return;
    }

    // ================= FIND DEVICE =================
    const [device] = await db.execute(
      'SELECT id FROM devices WHERE device_code = ? LIMIT 1',
      [device_code]
    );

    if (!device.length) {
      return;
    }

    const device_id = device[0].id;

    // ================= INGEST (live update + hourly/danger persistence + alert) =================
    const result = await ReadingIngestService.ingest(device_id, co2_ppm, null);

  } catch (err) {
    console.log('❌ MQTT ERROR:', err.message);
  }
});

// ================= ERROR HANDLER =================
client.on('error', (err) => {
  console.log('MQTT ERROR:', err.message);
});

client.on('reconnect', () => {
  console.log('MQTT RECONNECTING...');
});

client.on('close', () => {
  console.log('MQTT CONNECTION CLOSED');
});

console.log('MQTT SUBSCRIBER STARTED');

module.exports = client;