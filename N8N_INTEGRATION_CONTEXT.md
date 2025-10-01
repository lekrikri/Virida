# 🤖 Contexte d'Intégration n8n - Virida Smart Greenhouse

## 📋 Vue d'ensemble

**n8n** est déployé sur Clever Cloud comme plateforme d'automatisation pour le projet Virida Smart Greenhouse. Il gère les workflows IoT, les alertes automatiques, et l'intégration entre capteurs et actions.

## 🚀 Déploiement n8n sur Clever Cloud

### 📍 URLs et Accès
- **n8n Interface** : https://app-5c3113e8-1093-4eab-9fa1-cc5d355e9ee3.cleverapps.io/
- **API Virida** : https://viridaapi-app-5c3113e8-1093-4eab-9fa1-cc5d355e9ee3.cleverapps.io/
- **Frontend Virida** : https://app-4fdbaf24-6225-4bc5-a2bb-84319ea72bfb.cleverapps.io/

### 🔧 Configuration Technique

#### Structure du projet n8n
```
\\wsl.localhost\Ubuntu\home\lekrikri\Projects\Virida\backend\n8n\
├── start.js                 # Script de démarrage avec fallback
├── package.json            # Dépendances n8n
├── .env                    # Variables d'environnement
├── .clever.json            # Configuration Clever Cloud
└── .clevercloud/           # Scripts de déploiement
```

#### Script de démarrage (`start.js`)
- **Fonction** : Configure automatiquement PostgreSQL depuis les variables Clever Cloud
- **Fallback** : Serveur HTTP temporaire pendant le démarrage de n8n
- **Auto-configuration** : Parse `POSTGRESQL_ADDON_URI` pour configurer la DB

#### Variables d'environnement n8n
```bash
# Base de données (auto-configurée)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${POSTGRESQL_ADDON_HOST}
DB_POSTGRESDB_PORT=${POSTGRESQL_ADDON_PORT}
DB_POSTGRESDB_DATABASE=${POSTGRESQL_ADDON_DB}
DB_POSTGRESDB_USER=${POSTGRESQL_ADDON_USER}
DB_POSTGRESDB_PASSWORD=${POSTGRESQL_ADDON_PASSWORD}

# Configuration n8n
N8N_HOST=0.0.0.0
N8N_PORT=${PORT}
N8N_PROTOCOL=https
N8N_EDITOR_BASE_URL=https://app-5c3113e8-1093-4eab-9fa1-cc5d355e9ee3.cleverapps.io/
WEBHOOK_URL=https://app-5c3113e8-1093-4eab-9fa1-cc5d355e9ee3.cleverapps.io/
```

## 🔄 Workflows Créés et Déployés

### 📂 Localisation des workflows
```
\\wsl.localhost\Ubuntu\home\lekrikri\Projects\Virida\backend\virida_api\n8n-workflows\
├── auto-irrigation.json           # ✅ ACTIF - Arrosage automatique
├── temperature-alert.json         # Alertes température
├── humidity-irrigation.json       # Contrôle humidité avancé
├── multi-sensor-dashboard.json    # Dashboard multi-capteurs
├── daily-report.json             # Rapports quotidiens
└── temperature-monitoring.json    # Monitoring température
```

### 🌊 1. Workflow "Virida - Arrosage Automatique" (ACTIF)

**Status** : ✅ Déployé et fonctionnel

**Structure** :
```
Webhook (POST /virida/humidity)
    ↓
IF (humidité < 30%)
    ↓ TRUE                    ↓ FALSE
HTTP Request              (Rien - fin)
(Start Irrigation)
    ↓
Email Notification
```

**Configuration** :
- **Webhook URL** : `/webhook/virida/humidity`
- **Condition** : `{{ $node["Webhook"].json["value"] }} < 30`
- **Action irrigation** : POST vers API Virida
- **Notification** : Email admin@virida.com

**Test** :
```bash
curl -X POST https://app-5c3113e8-1093-4eab-9fa1-cc5d355e9ee3.cleverapps.io/webhook/virida/humidity \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "humidity_sensor_01",
    "sensorType": "humidity",
    "value": 25,
    "unit": "%"
  }'
```

### 🌡️ 2. Workflow "Temperature Alert"

**Fonction** : Surveille la température et envoie des alertes si > 35°C ou < 10°C
- **Webhook** : `/webhook/virida-temperature`
- **Actions** : Alerte email + log en base de données
- **Intégration** : API Virida pour commandes ventilation/chauffage

### 📊 3. Workflow "Multi-Sensor Dashboard"

**Fonction** : Traite tous types de capteurs IoT
- **Webhook** : `/webhook/virida-iot-data`
- **Actions** : Classification automatique + envoi vers analytics
- **Intégration** : ClickHouse/PostgreSQL pour métriques

### 📅 4. Workflow "Daily Report"

**Fonction** : Génère des rapports quotidiens automatiques
- **Déclencheur** : Cron job (8h00 quotidien)
- **Actions** : Récupération analytics + génération PDF + email

## 🔗 Intégrations avec l'Écosystème Virida

### 🔄 API Virida ↔ n8n
```
API Virida (Backend)
    ↓ (Webhook calls)
n8n Workflows
    ↓ (HTTP Requests)
API Virida (Actions)
    ↓ (WebSocket)
Frontend Virida (Notifications)
```

### 📡 Flux de données IoT
```
Capteurs IoT
    ↓ (HTTP POST)
API Virida (/api/iot/sensors/data)
    ↓ (Trigger webhook)
n8n Workflows
    ↓ (Automated actions)
Devices + Notifications
```

### 🎯 Endpoints d'intégration

#### Webhooks n8n → API Virida
- **Irrigation** : `POST /api/iot/devices/irrigation_pump_01/command`
- **Ventilation** : `POST /api/iot/devices/ventilation_01/command`
- **Logging** : `POST /api/automation/log`

#### API Virida → n8n Webhooks
- **Humidité** : `POST /webhook/virida/humidity`
- **Température** : `POST /webhook/virida-temperature`
- **Multi-capteurs** : `POST /webhook/virida-iot-data`

## 🛠️ Configuration et Maintenance

### 🔑 Credentials n8n
- **PostgreSQL** : Auto-configuré via variables Clever Cloud
- **Email SMTP** : Configuration manuelle requise
- **API Virida** : Headers d'authentification JWT

### 📊 Monitoring
- **Interface n8n** : Onglet "Executions" pour voir les logs
- **Logs Clever Cloud** : Dashboard Clever Cloud → Logs
- **API Virida** : Endpoint `/api/automation/logs` pour historique

### 🔧 Dépannage

#### Workflow ne se déclenche pas
1. Vérifier que le workflow est **ACTIF** (switch vert)
2. Vérifier l'URL du webhook
3. Tester avec curl

#### Problèmes de mémoire (résolu)
- **Cause** : Double build causé par `postinstall`
- **Solution** : Suppression du `postinstall` problématique
- **Status** : ✅ Résolu

## 🎯 Prochaines Étapes

### 🔄 Workflows à créer
1. **Contrôle pH** : Monitoring acidité du sol
2. **Gestion CO2** : Optimisation photosynthèse
3. **Contrôle luminosité** : Gestion éclairage artificiel
4. **Prédictions météo** : Intégration API météo
5. **Maintenance préventive** : Alertes équipements

### 🚀 Améliorations techniques
1. **RabbitMQ** : Message queue pour haute performance
2. **Grafana** : Dashboards avancés
3. **IA/ML** : Prédictions et optimisations
4. **Mobile App** : Contrôle à distance
5. **Edge Computing** : Traitement local capteurs

## 📚 Documentation Technique

### 🔍 Fichiers de référence
- **Setup complet** : `\\wsl.localhost\Ubuntu\home\lekrikri\Projects\Virida\backend\virida_api\WORKFLOWS_SETUP.md`
- **Workflows JSON** : `\\wsl.localhost\Ubuntu\home\lekrikri\Projects\Virida\backend\virida_api\n8n-workflows\`
- **Script démarrage** : `\\wsl.localhost\Ubuntu\home\lekrikri\Projects\Virida\backend\n8n\start.js`

### 🎯 Points clés pour Claude Code
1. **n8n est opérationnel** sur Clever Cloud avec interface accessible
2. **Workflow d'arrosage automatique** créé et testé avec succès
3. **Intégration complète** avec API Virida et Frontend
4. **Architecture scalable** prête pour nouveaux workflows
5. **Documentation complète** disponible pour développement futur

---

🌱 **Virida Smart Greenhouse - Automatisation IoT avec n8n** 🤖
