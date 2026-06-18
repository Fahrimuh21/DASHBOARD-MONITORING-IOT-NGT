const mqtt = require('mqtt');
const db = require('./config/db');
const RiskService = require('./services/NgtStatusService');
const AlertService = require('./services/AlertService');

// ================= CONFIG =================
const BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
const TOPIC = process.env.MQTT_TOPIC || 'ngtpkmkcundip/co2/sensor/+';

// ================= MQTT CLIENT =================
const client = mqtt.connect(BROKER, {
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 2000,
});

// ================= CONNECT =================
client.on('connect', () => {
  console.log('====================================');
  console.log('✅ MQTT CONNECTED');
  console.log('📡 BROKER:', BROKER);
  console.log('📡 TOPIC :', TOPIC);
  console.log('====================================');

  client.subscribe(TOPIC, { qos: 1 }, (err) => {
    if (err) {
      console.log('❌ SUBSCRIBE ERROR:', err.message);
    } else {
      console.log('📡 SUBSCRIBE SUCCESS');
    }
  });
});

// ================= MESSAGE HANDLER =================
client.on('message', async (topic, message) => {
  try {
    console.log('====================================');
    console.log('🔥 MQTT MESSAGE RECEIVED');
    console.log('📡 TOPIC:', topic);
    console.log('📦 RAW:', message.toString());

    const data = JSON.parse(message.toString());

    const device_code = data.device_code;
    const co2_ppm = parseFloat(data.co2_value);

    if (!device_code || isNaN(co2_ppm)) {
      console.log('❌ INVALID PAYLOAD');
      return;
    }

    // ================= FIND DEVICE =================
    const [device] = await db.execute(
      'SELECT id FROM devices WHERE device_code = ? LIMIT 1',
      [device_code]
    );

    if (!device.length) {
      console.log('❌ DEVICE NOT FOUND:', device_code);
      return;
    }

    const device_id = device[0].id;

    // ================= RISK ENGINE =================
    const risk = RiskService.evaluate(co2_ppm);

    // ================= INSERT READINGS =================
    const [result] = await db.execute(
      `INSERT INTO readings
       (device_id, co2_ppm, risk_level, created_at)
       VALUES (?, ?, ?, NOW())`,
      [device_id, co2_ppm, risk.risk_level]
    );

    const reading_id = result.insertId;

    // ================= ALERT SYSTEM =================
    await AlertService.createIfNeeded(
      null,
      device_id,
      reading_id,
      risk.risk_level,
      0,
      risk.message
    );

    console.log('✅ SAVED TO DB:', co2_ppm);
    console.log('====================================');

  } catch (err) {
    console.log('❌ MQTT ERROR:', err.message);
  }
});

// ================= ERROR HANDLER =================
client.on('error', (err) => {
  console.log('❌ MQTT ERROR:', err.message);
});

client.on('reconnect', () => {
  console.log('🔄 MQTT RECONNECTING...');
});

client.on('close', () => {
  console.log('⚠️ MQTT CONNECTION CLOSED');
});

console.log('🚀 MQTT SUBSCRIBER STARTED');

module.exports = client;