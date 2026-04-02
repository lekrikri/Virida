#include "Arduino.h"
#include "esp_camera.h"
#include "esp_http_server.h"
#include "WiFi.h"
#include "PubSubClient.h"
#include "config.h"

// ── Variables globales ─────────────────────────────────────────────────────
WiFiClient   wifiClient;
PubSubClient mqtt(wifiClient);
httpd_handle_t stream_httpd = NULL;
httpd_handle_t camera_httpd = NULL;

unsigned long lastSnapshot = 0;
unsigned long lastStatus   = 0;
bool cameraOk = false;

// ── Caméra — init ──────────────────────────────────────────────────────────
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = CAM_PIN_D0;
  config.pin_d1       = CAM_PIN_D1;
  config.pin_d2       = CAM_PIN_D2;
  config.pin_d3       = CAM_PIN_D3;
  config.pin_d4       = CAM_PIN_D4;
  config.pin_d5       = CAM_PIN_D5;
  config.pin_d6       = CAM_PIN_D6;
  config.pin_d7       = CAM_PIN_D7;
  config.pin_xclk     = CAM_PIN_XCLK;
  config.pin_pclk     = CAM_PIN_PCLK;
  config.pin_vsync    = CAM_PIN_VSYNC;
  config.pin_href     = CAM_PIN_HREF;
  config.pin_sscb_sda = CAM_PIN_SIOD;
  config.pin_sscb_scl = CAM_PIN_SIOC;
  config.pin_pwdn     = CAM_PIN_PWDN;
  config.pin_reset    = CAM_PIN_RESET;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location  = CAMERA_FB_IN_PSRAM;

  if (psramFound()) {
    config.frame_size   = FRAMESIZE_SVGA;  // 800x600
    config.jpeg_quality = 12;
    config.fb_count     = 2;
  } else {
    config.frame_size   = FRAMESIZE_VGA;   // 640x480
    config.jpeg_quality = 20;
    config.fb_count     = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAM] Init failed: 0x%x\n", err);
    return false;
  }
  Serial.println("[CAM] Init OK");
  return true;
}

// ── WiFi — connexion multi-réseau ─────────────────────────────────────────
bool connectWifi() {
  for (int i = 0; i < WIFI_NETWORK_COUNT; i++) {
    Serial.printf("[WiFi] Essai: %s\n", WIFI_NETWORKS[i].ssid);
    WiFi.begin(WIFI_NETWORKS[i].ssid, WIFI_NETWORKS[i].password);
    unsigned long t = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - t < WIFI_TIMEOUT_MS) {
      delay(200); Serial.print('.');
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.printf("\n[WiFi] Connecté: %s | IP: %s\n",
        WIFI_NETWORKS[i].ssid, WiFi.localIP().toString().c_str());
      return true;
    }
    WiFi.disconnect(true);
    Serial.println("\n[WiFi] Echec");
  }
  return false;
}

// ── HTTP — handler MJPEG stream ───────────────────────────────────────────
#define PART_BOUNDARY "123456789000000000000987654321"
static const char* STREAM_CONTENT_TYPE =
  "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* STREAM_BOUNDARY     = "\r\n--" PART_BOUNDARY "\r\n";
static const char* STREAM_PART         =
  "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

esp_err_t streamHandler(httpd_req_t* req) {
  camera_fb_t* fb = NULL;
  esp_err_t res = ESP_OK;
  char part_buf[64];

  res = httpd_resp_set_type(req, STREAM_CONTENT_TYPE);
  if (res != ESP_OK) return res;

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) { res = ESP_FAIL; break; }

    httpd_resp_send_chunk(req, STREAM_BOUNDARY, strlen(STREAM_BOUNDARY));
    size_t hlen = snprintf(part_buf, 64, STREAM_PART, fb->len);
    httpd_resp_send_chunk(req, part_buf, hlen);
    httpd_resp_send_chunk(req, (const char*)fb->buf, fb->len);
    esp_camera_fb_return(fb);

    if (res != ESP_OK) break;
  }
  return res;
}

// ── HTTP — handler snapshot ───────────────────────────────────────────────
esp_err_t snapshotHandler(httpd_req_t* req) {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }
  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Content-Disposition",
    "inline; filename=virida_snapshot.jpg");
  httpd_resp_send(req, (const char*)fb->buf, fb->len);
  esp_camera_fb_return(fb);
  return ESP_OK;
}

// ── HTTP — handler status JSON ────────────────────────────────────────────
esp_err_t statusHandler(httpd_req_t* req) {
  char json[256];
  snprintf(json, sizeof(json),
    "{\"device\":\"%s\",\"greenhouse\":\"%s\",\"ip\":\"%s\","
    "\"rssi\":%d,\"uptime\":%lu,\"camera\":%s}",
    DEVICE_ID, GREENHOUSE_ID, WiFi.localIP().toString().c_str(),
    WiFi.RSSI(), millis() / 1000, cameraOk ? "true" : "false");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_send(req, json, strlen(json));
  return ESP_OK;
}

// ── HTTP — démarrage serveurs ──────────────────────────────────────────────
void startHttpd() {
  // Serveur stream (port 81)
  httpd_config_t stream_config = HTTPD_DEFAULT_CONFIG();
  stream_config.server_port = 81;
  stream_config.ctrl_port   = 32769;
  httpd_uri_t stream_uri = { "/stream", HTTP_GET, streamHandler, NULL };
  if (httpd_start(&stream_httpd, &stream_config) == ESP_OK)
    httpd_register_uri_handler(stream_httpd, &stream_uri);

  // Serveur principal (port 80)
  httpd_config_t cam_config = HTTPD_DEFAULT_CONFIG();
  cam_config.server_port = 80;
  httpd_uri_t snap_uri   = { "/capture",  HTTP_GET, snapshotHandler, NULL };
  httpd_uri_t status_uri = { "/status",   HTTP_GET, statusHandler,   NULL };
  if (httpd_start(&camera_httpd, &cam_config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &snap_uri);
    httpd_register_uri_handler(camera_httpd, &status_uri);
  }

  Serial.printf("[HTTP] Stream : http://%s:81/stream\n",
    WiFi.localIP().toString().c_str());
  Serial.printf("[HTTP] Snapshot: http://%s/capture\n",
    WiFi.localIP().toString().c_str());
  Serial.printf("[HTTP] Status  : http://%s/status\n",
    WiFi.localIP().toString().c_str());
}

// ── MQTT ───────────────────────────────────────────────────────────────────
void mqttCallback(char* topic, byte* payload, unsigned int len) {
  String msg = String((char*)payload).substring(0, len);
  Serial.printf("[MQTT] Commande reçue: %s\n", msg.c_str());
  // Extension future : commandes (ex: {"cmd":"snapshot"})
}

bool mqttConnect() {
  if (mqtt.connected()) return true;
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(512);

  String clientId = String("espcam-") + String(random(0xffff), HEX);
  bool ok = mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD,
              TOPIC_STATUS, 0, true, "{\"online\":false}");
  if (ok) {
    mqtt.subscribe(TOPIC_COMMAND);
    Serial.printf("[MQTT] Connecté → %s:%d\n", MQTT_BROKER, MQTT_PORT);
  }
  return ok;
}

void publishStatus(bool online) {
  if (!mqtt.connected()) return;
  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"online\":%s,\"ip\":\"%s\",\"rssi\":%d,\"device\":\"%s\","
    "\"greenhouse\":\"%s\",\"stream\":\"http://%s:81/stream\","
    "\"snapshot\":\"http://%s/capture\"}",
    online ? "true" : "false",
    WiFi.localIP().toString().c_str(),
    WiFi.RSSI(),
    DEVICE_ID, GREENHOUSE_ID,
    WiFi.localIP().toString().c_str(),
    WiFi.localIP().toString().c_str());
  mqtt.publish(TOPIC_STATUS, payload, true);  // retained
}

void publishSnapshot() {
  if (!cameraOk || !mqtt.connected()) return;
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) return;

  // Encode en base64
  size_t b64len = (fb->len / 3 + 1) * 4 + 4;
  uint8_t* b64 = (uint8_t*)ps_malloc(b64len);
  if (b64) {
    size_t out = 0;
    const char* chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (size_t i = 0; i < fb->len; i += 3) {
      uint32_t buf = (fb->buf[i] << 16)
                   | (i+1 < fb->len ? fb->buf[i+1] << 8 : 0)
                   | (i+2 < fb->len ? fb->buf[i+2]      : 0);
      b64[out++] = chars[(buf >> 18) & 0x3f];
      b64[out++] = chars[(buf >> 12) & 0x3f];
      b64[out++] = i+1 < fb->len ? chars[(buf >> 6) & 0x3f] : '=';
      b64[out++] = i+2 < fb->len ? chars[buf        & 0x3f] : '=';
    }
    b64[out] = 0;

    char meta[128];
    snprintf(meta, sizeof(meta),
      "{\"device\":\"%s\",\"ts\":%lu,\"size\":%u,\"format\":\"jpeg/b64\"}",
      DEVICE_ID, millis() / 1000, fb->len);

    // Publie metadata (petit) + image (grand, best-effort)
    mqtt.publish(TOPIC_SNAPSHOT "/meta", meta);
    mqtt.beginPublish(TOPIC_SNAPSHOT "/image", out, false);
    mqtt.write(b64, out);
    mqtt.endPublish();

    free(b64);
    Serial.printf("[MQTT] Snapshot publié (%u bytes JPEG → %u b64)\n", fb->len, out);
  }
  esp_camera_fb_return(fb);
}

// ── Setup ──────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== Virida ESP32-CAM ===");
  Serial.printf("Device: %s | Serre: %s\n", DEVICE_ID, GREENHOUSE_ID);

  // Caméra
  cameraOk = initCamera();

  // WiFi
  if (!connectWifi()) {
    Serial.println("[WiFi] Impossible de se connecter. Redémarrage dans 10s...");
    delay(10000);
    ESP.restart();
  }

  // HTTP serveurs
  if (cameraOk) startHttpd();

  // MQTT
  mqttConnect();
  publishStatus(true);

  Serial.println("[OK] Virida ESP32-CAM opérationnel !");
}

// ── Loop ───────────────────────────────────────────────────────────────────
void loop() {
  // Reconnexion WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Déconnecté, reconnexion...");
    connectWifi();
  }

  // Reconnexion MQTT
  if (!mqtt.connected()) {
    static unsigned long lastRetry = 0;
    if (millis() - lastRetry > 5000) {
      lastRetry = millis();
      if (mqttConnect()) publishStatus(true);
    }
  }
  mqtt.loop();

  unsigned long now = millis();

  // Heartbeat MQTT
  if (now - lastStatus >= STATUS_INTERVAL_MS) {
    lastStatus = now;
    publishStatus(true);
  }

  // Snapshot périodique
  if (now - lastSnapshot >= SNAPSHOT_INTERVAL_MS) {
    lastSnapshot = now;
    publishSnapshot();
  }

  delay(10);
}
