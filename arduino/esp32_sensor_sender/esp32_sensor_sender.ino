#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "NAMA_WIFI";
const char* WIFI_PASSWORD = "PASSWORD_WIFI";
const char* SERVER_URL = "http://192.168.1.10:8000/api/sensor/readings";
const char* DEVICE_CODE = "ESP32-CO2-001";
const char* DEVICE_TOKEN = "TOKEN_DEVICE_DARI_LARAVEL";

const unsigned long SEND_INTERVAL_MS = 5000;
unsigned long lastSendAt = 0;

struct SensorData {
  float co2Ppm;
  float temperatureC;
  float humidity;
  bool hasTemperature;
  bool hasHumidity;
};

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("Connecting WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
}

float readCo2Ppm() {
  /*
    Ganti fungsi ini sesuai sensor CO2 yang dipakai.
    Karena target batas CO2 sangat rendah (0-3 ppm), pilih sensor low-range/high-precision
    yang memang mampu membaca area rendah. Jangan memakai rumus ini untuk produksi.
  */
  return NAN;
}

float readTemperatureC() {
  /*
    Ganti dengan pembacaan DHT22, DS18B20, SHT31, atau sensor suhu lain.
  */
  return NAN;
}

float readHumidity() {
  /*
    Isi jika sensor menyediakan kelembaban. Kembalikan NAN jika tidak tersedia.
  */
  return NAN;
}

SensorData readSensors() {
  float co2 = readCo2Ppm();
  float temperature = readTemperatureC();
  float humidity = readHumidity();
  return {
    co2,
    temperature,
    humidity,
    !isnan(temperature),
    !isnan(humidity)
  };
}

bool sendReading(const SensorData& data) {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (isnan(data.co2Ppm)) {
    Serial.println("CO2 tidak terbaca. Data tidak dikirim.");
    return false;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", DEVICE_TOKEN);

  StaticJsonDocument<256> doc;
  doc["device_code"] = DEVICE_CODE;
  doc["co2_ppm"] = data.co2Ppm;
  if (data.hasTemperature) doc["temperature_c"] = data.temperatureC;
  if (data.hasHumidity) doc["humidity"] = data.humidity;

  String body;
  serializeJson(doc, body);
  Serial.print("POST ");
  Serial.println(body);

  int httpCode = http.POST(body);
  String response = http.getString();
  http.end();

  Serial.print("HTTP ");
  Serial.print(httpCode);
  Serial.print(" ");
  Serial.println(response);
  return httpCode >= 200 && httpCode < 300;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (millis() - lastSendAt >= SEND_INTERVAL_MS) {
    lastSendAt = millis();
    SensorData data = readSensors();
    sendReading(data);
  }
}
