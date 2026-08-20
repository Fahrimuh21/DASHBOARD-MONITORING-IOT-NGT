#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <math.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SCD30.h>
#include <Adafruit_SSD1306.h>

// SCD30 -> MQTT. Baseline ini adalah referensi aplikasi, bukan kalibrasi FRC.
constexpr uint8_t I2C_SDA = 21;
constexpr uint8_t I2C_SCL = 22;
constexpr uint8_t SCD30_ADDRESS = 0x61;
constexpr uint16_t MEASUREMENT_INTERVAL_SECONDS = 2;
constexpr uint8_t SCREEN_WIDTH = 128;
constexpr uint8_t SCREEN_HEIGHT = 64;
constexpr int8_t OLED_RESET = -1;
constexpr uint8_t OLED_ADDRESS = 0x3C;

const char *WIFI_SSID = "NAMA_WIFI";
const char *WIFI_PASSWORD = "PASSWORD_WIFI";
const char *MQTT_SERVER = "broker.hivemq.com";
constexpr uint16_t MQTT_PORT = 1883;
const char *MQTT_TOPIC = "ngtpkmkcundip/co2/sensor/001";
const char *DEVICE_CODE = "001";
const char *SERVER_URL = "https://api.naspiontech.com/api/sensor/reading";
const char *DEVICE_TOKEN = "NGT-4EKN8E";

constexpr uint32_t WIFI_RETRY_MS = 15000UL;
constexpr uint32_t MQTT_RETRY_MS = 5000UL;
constexpr uint32_t MQTT_SEND_MS = 2000UL;
constexpr uint32_t SENSOR_STALE_MS = 8000UL;
constexpr uint32_t BASELINE_MIN_SETTLING_MS = 180000UL;
constexpr uint32_t BASELINE_STABLE_HOLD_MS = 120000UL;
constexpr uint32_t BASELINE_TIMEOUT_MS = 1800000UL;
constexpr size_t WINDOW_SAMPLES = 30;
constexpr float MAX_BASELINE_RANGE_PPM = 10.0f;
constexpr float MAX_BASELINE_SLOPE_PPM_MIN = 3.0f;

Adafruit_SCD30 scd30;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
WiFiClient wifiClient;
WiFiClientSecure httpsClient;
PubSubClient mqtt(wifiClient);

float latestCO2 = NAN;
float latestTemperature = NAN;
float latestHumidity = NAN;
float baselinePpm = NAN;
float co2Window[WINDOW_SAMPLES];
uint32_t sampleTimes[WINDOW_SAMPLES];
size_t windowCount = 0;
size_t windowNext = 0;
uint32_t sessionStartedAt = 0;
uint32_t stableStartedAt = 0;
uint32_t baselineCapturedAt = 0;
uint32_t lastSampleAt = 0;
uint32_t lastWiFiAttemptAt = 0;
uint32_t lastMqttAttemptAt = 0;
uint32_t lastPublishAt = 0;
uint32_t lastDisplayAt = 0;
bool baselineTimedOut = false;
bool haveSample = false;
bool oledReady = false;

struct WindowStats {
  bool available;
  float mean;
  float range;
  float slopePerMinute;
};

WindowStats stats = {false, NAN, NAN, NAN};

void resetBaselineSession(const char *reason) {
  windowCount = 0;
  windowNext = 0;
  baselinePpm = NAN;
  baselineCapturedAt = 0;
  stableStartedAt = 0;
  baselineTimedOut = false;
  sessionStartedAt = millis();
  stats = {false, NAN, NAN, NAN};
  Serial.print(F("[Baseline] Session dimulai: "));
  Serial.println(reason);
}

size_t windowIndex(size_t index) {
  return windowCount < WINDOW_SAMPLES ? index : (windowNext + index) % WINDOW_SAMPLES;
}

void addSample(float co2, uint32_t capturedAt) {
  co2Window[windowNext] = co2;
  sampleTimes[windowNext] = capturedAt;
  windowNext = (windowNext + 1U) % WINDOW_SAMPLES;
  if (windowCount < WINDOW_SAMPLES) windowCount++;
}

WindowStats calculateStats() {
  WindowStats result = {false, NAN, NAN, NAN};
  if (windowCount == 0) return result;

  float sum = 0.0f;
  float minimum = co2Window[windowIndex(0)];
  float maximum = minimum;
  for (size_t index = 0; index < windowCount; index++) {
    float value = co2Window[windowIndex(index)];
    sum += value;
    minimum = min(minimum, value);
    maximum = max(maximum, value);
  }

  float slopePerSecond = 0.0f;
  if (windowCount >= 2) {
    float sumX = 0.0f;
    float sumXX = 0.0f;
    float sumXY = 0.0f;
    uint32_t firstAt = sampleTimes[windowIndex(0)];
    for (size_t index = 0; index < windowCount; index++) {
      float x = (sampleTimes[windowIndex(index)] - firstAt) / 1000.0f;
      float y = co2Window[windowIndex(index)];
      sumX += x;
      sumXX += x * x;
      sumXY += x * y;
    }
    float count = (float)windowCount;
    float denominator = count * sumXX - sumX * sumX;
    if (fabsf(denominator) > 0.0001f) {
      slopePerSecond = (count * sumXY - sumX * sum) / denominator;
    }
  }

  result.available = true;
  result.mean = sum / windowCount;
  result.range = maximum - minimum;
  result.slopePerMinute = slopePerSecond * 60.0f;
  return result;
}

bool baselineCandidate(uint32_t now) {
  return windowCount == WINDOW_SAMPLES && stats.available &&
         now - sessionStartedAt >= BASELINE_MIN_SETTLING_MS &&
         stats.mean >= 400.0f && stats.mean <= 2000.0f &&
         stats.range <= MAX_BASELINE_RANGE_PPM &&
         fabsf(stats.slopePerMinute) <= MAX_BASELINE_SLOPE_PPM_MIN;
}

void updateBaseline(uint32_t now) {
  if (!isnan(baselinePpm) || baselineTimedOut) return;
  if (now - sessionStartedAt >= BASELINE_TIMEOUT_MS) {
    baselineTimedOut = true;
    stableStartedAt = 0;
    Serial.println(F("[Baseline] Timeout; baseline tidak dibuat."));
    return;
  }
  if (!baselineCandidate(now)) {
    stableStartedAt = 0;
    return;
  }
  if (stableStartedAt == 0) {
    stableStartedAt = now;
    Serial.println(F("[Baseline] Jendela stabil dimulai."));
    return;
  }
  if (now - stableStartedAt >= BASELINE_STABLE_HOLD_MS) {
    baselinePpm = stats.mean;
    baselineCapturedAt = now;
    stableStartedAt = 0;
    Serial.printf("[Baseline] Tersimpan: %.1f ppm\n", baselinePpm);
  }
}

const char *benchState(uint32_t now) {
  if (baselineTimedOut) return "BASELINE_TIMEOUT";
  if (!isnan(baselinePpm)) return "BASELINE_SET";
  if (now - sessionStartedAt < BASELINE_MIN_SETTLING_MS) return "SETTLING";
  if (windowCount < WINDOW_SAMPLES) return "WINDOW_FILL";
  if (!baselineCandidate(now)) return "WAIT_STABLE";
  return "AUTO_HOLD";
}

void maintainWiFi(uint32_t now) {
  if (WiFi.status() == WL_CONNECTED || now - lastWiFiAttemptAt < WIFI_RETRY_MS) return;
  lastWiFiAttemptAt = now;
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println(F("[WiFi] Reconnect attempt"));
}

void maintainMqtt(uint32_t now) {
  if (WiFi.status() != WL_CONNECTED) return;
  if (mqtt.connected()) {
    mqtt.loop();
    return;
  }
  if (now - lastMqttAttemptAt < MQTT_RETRY_MS) return;
  lastMqttAttemptAt = now;
  char clientId[40];
  snprintf(clientId, sizeof(clientId), "ESP32_CO2_%08lX",
           (unsigned long)(ESP.getEfuseMac() & 0xFFFFFFFFULL));
  if (mqtt.connect(clientId)) {
    Serial.println(F("[MQTT] Connected"));
    lastPublishAt = 0;
  } else {
    Serial.printf("[MQTT] Connect failed rc=%d\n", mqtt.state());
  }
}

void publishReading(uint32_t now) {
  if (WiFi.status() != WL_CONNECTED || !haveSample || now - lastSampleAt > SENSOR_STALE_MS ||
      now - lastPublishAt < MQTT_SEND_MS) return;
  lastPublishAt = now;

  char payload[512];
  bool baselineValid = !isnan(baselinePpm);
  float delta = baselineValid ? latestCO2 - baselinePpm : NAN;
  int written = snprintf(payload, sizeof(payload),
      "{\"device_code\":\"%s\",\"co2_value\":%d,\"temperature\":%.1f,"
      "\"humidity\":%.1f,\"status\":\"%s\",\"baseline_valid\":%s,"
      "\"baseline_ppm\":%s,\"delta_ppm\":%s,\"range_ppm\":%.1f,"
      "\"slope_ppm_min\":%.1f,\"bench_state\":\"%s\"}",
      DEVICE_CODE, (int)lroundf(latestCO2), latestTemperature, latestHumidity,
      baselineValid ? "BELUM_TERKONFIRMASI" : "STABILISASI",
      baselineValid ? "true" : "false",
      baselineValid ? String(baselinePpm, 1).c_str() : "null",
      baselineValid ? String(delta, 1).c_str() : "null",
      stats.available ? stats.range : 0.0f,
      stats.available ? stats.slopePerMinute : 0.0f, benchState(now));
  if (written <= 0 || written >= (int)sizeof(payload)) {
    Serial.println(F("[Data] Payload overflow"));
    return;
  }

  if (mqtt.connected() && mqtt.publish(MQTT_TOPIC, payload)) {
    Serial.println(F("[MQTT] Payload published"));
  }

  HTTPClient http;
  if (!http.begin(httpsClient, SERVER_URL)) {
    Serial.println(F("[HTTP] Cannot initialize HTTPS request"));
    return;
  }
  http.setTimeout(5000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", DEVICE_TOKEN);
  int httpCode = http.POST((uint8_t *)payload, strlen(payload));
  if (httpCode > 0) {
    Serial.print(F("[HTTP] POST status: "));
    Serial.println(httpCode);
    String response = http.getString();
    if (response.length() > 0) {
      Serial.print(F("[HTTP] Response: "));
      Serial.println(response);
    }
  } else {
    Serial.print(F("[HTTP] POST error: "));
    Serial.println(http.errorToString(httpCode));
  }
  http.end();
}

void updateDisplay(uint32_t now) {
  if (!oledReady || now - lastDisplayAt < 250UL) return;
  lastDisplayAt = now;
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("W:"));
  display.print(WiFi.status() == WL_CONNECTED ? F("OK") : F("--"));
  display.print(F(" M:"));
  display.println(mqtt.connected() ? F("OK") : F("--"));
  if (haveSample && now - lastSampleAt <= SENSOR_STALE_MS) {
    display.setTextSize(2);
    display.setCursor(0, 14);
    display.print((int)lroundf(latestCO2));
    display.setTextSize(1);
    display.print(F(" ppm"));
    display.setCursor(0, 40);
    display.println(benchState(now));
    display.setCursor(0, 53);
    display.print(F("B:"));
    if (isnan(baselinePpm)) display.print(F("AUTO..."));
    else display.print((int)lroundf(baselinePpm));
  } else {
    display.setCursor(0, 28);
    display.println(F("NO FRESH SENSOR DATA"));
  }
  display.display();
}

void readSensor() {
  if (!scd30.dataReady() || !scd30.read()) return;
  float co2 = scd30.CO2;
  float temperature = scd30.temperature;
  float humidity = scd30.relative_humidity;
  if (!isfinite(co2) || !isfinite(temperature) || !isfinite(humidity) ||
      co2 < 0.0f || co2 > 40000.0f) return;

  uint32_t now = millis();
  latestCO2 = co2;
  latestTemperature = temperature;
  latestHumidity = humidity;
  lastSampleAt = now;
  haveSample = true;
  addSample(co2, now);
  stats = calculateStats();
  updateBaseline(now);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(100000);

  oledReady = display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);

  if (!scd30.begin(SCD30_ADDRESS, &Wire)) {
    Serial.println(F("[SCD30] Sensor tidak ditemukan"));
    while (true) delay(1000);
  }
  scd30.setMeasurementInterval(MEASUREMENT_INTERVAL_SECONDS);
  scd30.selfCalibrationEnabled(false);
  resetBaselineSession("power on");

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  httpsClient.setInsecure();
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setBufferSize(512);
  mqtt.setKeepAlive(30);
  Serial.print(F("[WiFi] SSID: "));
  Serial.println(WIFI_SSID);
  Serial.print(F("[HTTP] URL: "));
  Serial.println(SERVER_URL);
  Serial.print(F("[Device] Code: "));
  Serial.println(DEVICE_CODE);
  Serial.println(F("[System] SCD30 MQTT bridge mode aktif"));
}

void loop() {
  readSensor();
  uint32_t now = millis();
  maintainWiFi(now);
  maintainMqtt(now);
  publishReading(now);
  updateDisplay(now);
  delay(25);

}
