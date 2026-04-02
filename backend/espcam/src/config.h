#pragma once

// ============================================================
// config.h — Virida ESP32-CAM
// NE PAS COMMITTER si tu as rempli les vrais identifiants !
// ============================================================

// --- WiFi (ordre de priorité) ---
struct WifiNetwork { const char* ssid; const char* password; };
static const WifiNetwork WIFI_NETWORKS[] = {
  { "4G-CPE-ADC1", "12345678" },  // réseau serre (principal)
  { "Krikri",      "REMPLACER" }, // réseau dev backup
};
static const int WIFI_NETWORK_COUNT = 2;
static const int WIFI_TIMEOUT_MS    = 15000;

// --- MQTT ---
#define MQTT_BROKER   "192.168.0.107"  // IP locale du Pi dans le réseau serre
#define MQTT_PORT     1883
#define MQTT_USER     "virida"
#define MQTT_PASSWORD "virida123"

// --- Identité appareil ---
#define GREENHOUSE_ID  "greenhouse-deeo-1"
#define DEVICE_ID      "espcam-1"
#define DEVICE_NAME    "Caméra Serre Principale"

// --- Topics MQTT ---
#define TOPIC_STATUS    "virida/" GREENHOUSE_ID "/" DEVICE_ID "/status"
#define TOPIC_SNAPSHOT  "virida/" GREENHOUSE_ID "/" DEVICE_ID "/snapshot"
#define TOPIC_COMMAND   "virida/" GREENHOUSE_ID "/" DEVICE_ID "/command"

// --- Intervalles ---
#define SNAPSHOT_INTERVAL_MS  (5UL * 60UL * 1000UL)  // snapshot MQTT toutes les 5min
#define STATUS_INTERVAL_MS    (30UL * 1000UL)          // heartbeat toutes les 30s

// --- Caméra (AI Thinker ESP32-CAM) ---
#define CAM_PIN_PWDN   32
#define CAM_PIN_RESET  -1
#define CAM_PIN_XCLK    0
#define CAM_PIN_SIOD   26
#define CAM_PIN_SIOC   27
#define CAM_PIN_D7     35
#define CAM_PIN_D6     34
#define CAM_PIN_D5     39
#define CAM_PIN_D4     36
#define CAM_PIN_D3     21
#define CAM_PIN_D2     19
#define CAM_PIN_D1     18
#define CAM_PIN_D0      5
#define CAM_PIN_VSYNC  25
#define CAM_PIN_HREF   23
#define CAM_PIN_PCLK   22
