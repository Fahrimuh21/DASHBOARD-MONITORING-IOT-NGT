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

// ================= CONNECT =================
client.on('connect', () => {
    console.log(`[MQTT] Connected to ${BROKER}`);

    client.subscribe(TOPIC, (err) => {
        if (err) {
            console.error('[MQTT] Subscribe failed:', err.message);
            return;
        }

        console.log(`[MQTT] Subscribed to ${TOPIC}`);
    });
});

// ================= MESSAGE =================
client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());

        const device_code = data.device_code;
        const co2_ppm = parseFloat(data.co2_value);

        if (!device_code) {
            console.warn('[MQTT] Message ignored: device_code is empty');
            return;
        }

        if (isNaN(co2_ppm)) {
            console.warn(`[MQTT] Message ignored from ${device_code}: invalid co2_value`);
            return;
        }

        // ================= FIND DEVICE =================
        const [device] = await db.execute(
            'SELECT id FROM devices WHERE device_code = ? LIMIT 1',
            [device_code]
        );

        if (!device.length) {
            console.warn(`[MQTT] Device not found: ${device_code}`);
            return;
        }

        const device_id = device[0].id;

        // ================= SAVE =================
        await ReadingIngestService.ingest(
            device_id,
            co2_ppm,
            null
        );

        console.log(`[MQTT] Reading saved: ${device_code} (${co2_ppm} ppm)`);
    } catch (err) {
        console.error('[MQTT] Message error:', err.message);
    }
});

// ================= ERROR =================
client.on('error', (err) => {
    console.error('[MQTT] Error:', err.message);
});

// ================= RECONNECT =================
client.on('reconnect', () => {
    console.log('[MQTT] Reconnecting...');
});

// ================= OFFLINE =================
client.on('offline', () => {
    console.warn('[MQTT] Offline');
});

// ================= CLOSE =================
client.on('close', () => {
    console.log('[MQTT] Connection closed');
});

console.log('[MQTT] Subscriber started, waiting for connection...');

module.exports = client;
