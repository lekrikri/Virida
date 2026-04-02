# Virida — Guide d'onboarding développeur

> Ce document est destiné aux nouveaux membres de l'équipe Virida.
> Il couvre la connexion au Pi 5, la gestion des services, et le développement firmware ESP32 (Leafnode).

---

## Table des matières

1. [Architecture du projet](#1-architecture-du-projet)
2. [Accès au Raspberry Pi 5](#2-accès-au-raspberry-pi-5)
3. [Services sur le Pi 5](#3-services-sur-le-pi-5)
4. [Workflow de développement](#4-workflow-de-développement)
5. [ESP32 Leafnode — Firmware Rust](#5-esp32-leafnode--firmware-rust)
6. [Ajouter un nouveau capteur](#6-ajouter-un-nouveau-capteur)
7. [Base de données](#7-base-de-données)
8. [Claude Code — Configuration recommandée](#8-claude-code--configuration-recommandée)

---

## 1. Architecture du projet

```
ESP32 (Leafnode)
    │  MQTT (port 1883)
    ▼
Raspberry Pi 5  ──────────────────────────────────────────────────────────
│                                                                          │
│  virida-api (Node.js :3001)   virida-eve (Python/Flask :5000)           │
│  virida-frontend (serve :3000) Mosquitto MQTT broker                    │
│  PostgreSQL 17 + TimescaleDB                                             │
│                                                                          │
────────────────────────────────────────────────────────────────────────────
    │  Tailscale (VPN mesh)
    ▼
Développeur local (WSL Ubuntu / macOS / Linux)
```

**Serres en production :**
| ID | Nom | Capteurs |
|----|-----|---------|
| `greenhouse-deeo-1` | Serre Principale | ESP32 actif |
| `greenhouse-deeo-2` | Serre Expérimentale | vide |

---

## 2. Accès au Raspberry Pi 5

### Prérequis — Tailscale

Le Pi 5 est accessible uniquement via **Tailscale** (VPN mesh, pas besoin d'être sur le même réseau WiFi).

```bash
# Installer Tailscale sur ta machine
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Demander une invitation au réseau Virida à un autre membre de l'équipe
```

### Connexion SSH

```bash
ssh virida@100.97.47.46
# mot de passe : virida123
```

> IP locale de la serre (réseau 4G-CPE-ADC1) : `10.38.24.32`
> L'IP locale peut changer — toujours préférer l'IP Tailscale `100.97.47.46`.

### Réseau WiFi de la serre

| SSID | Mot de passe |
|------|-------------|
| `4G-CPE-ADC1` | `12345678` |

L'ESP32 se connecte automatiquement à ce réseau (+ réseau de backup `Krikri` si configuré dans `config.rs`).

---

## 3. Services sur le Pi 5

### Liste des services systemd

```bash
# Statut de tous les services Virida
sudo systemctl status virida-api virida-eve virida-frontend virida-kiosk

# Redémarrer un service
sudo systemctl restart virida-api
sudo systemctl restart virida-eve
sudo systemctl restart virida-frontend
sudo systemctl restart virida-kiosk      # Chromium kiosk (écran tactile)
```

### Logs en temps réel

```bash
# API backend
sudo journalctl -u virida-api -f

# EVE (IA jardinière)
sudo journalctl -u virida-eve -f

# Voir les capteurs qui arrivent en MQTT
sudo journalctl -u virida-api -f | grep "Processed leafnode"
```

### Ports exposés

| Port | Service |
|------|---------|
| `3001` | API REST + WebSocket |
| `5000` | EVE IA (Flask/Gunicorn) |
| `3000` | Frontend IHM tactile |
| `1883` | MQTT broker (Mosquitto) |

---

## 4. Workflow de développement

### ⚠️ Règle absolue — Ne jamais modifier directement sur le Pi

```
Local WSL/Linux  →  git commit + push  →  git pull sur Pi  →  restart service
```

```bash
# Déployer virida_api après une modif locale
cd backend/virida_api
git add . && git commit -m "feat: ..."
git push origin master
ssh virida@100.97.47.46 'cd ~/virida_api && git pull && sudo systemctl restart virida-api'

# Déployer virida-eve
cd backend/virida-eve
git add . && git commit -m "feat: ..."
git push origin master
ssh virida@100.97.47.46 'cd ~/virida-eve && git pull && sudo systemctl restart virida-eve'

# Déployer le frontend IHM tactile (build local + rsync)
cd frontend/virida_touch_ihm
npm run build
rsync -az --delete dist/ virida@100.97.47.46:~/virida_touch_ihm/
ssh virida@100.97.47.46 'sudo systemctl restart virida-frontend virida-kiosk'
```

### Repos Git

| Repo | Remote | Branche principale |
|------|--------|-------------------|
| `virida_api` | GitHub `Virida-ghouse/virida_api` | `master` |
| `virida-eve` | GitHub `Virida-ghouse/virida-eve` | `master` |
| `leafnode` | **Gitea** `gitea.virida.org/Virida/leafnode` | `master` (PR depuis `feat/`) |
| `virida_touch_ihm` | GitHub | `main` |

> Leafnode est sur notre **Gitea auto-hébergé** — pas sur GitHub public.

---

## 5. ESP32 Leafnode — Firmware Rust

### Prérequis build

Le firmware se compile dans un **Distrobox** (container Linux avec les outils Espressif) car `esp-idf` et `xtensa-esp32` nécessitent des dépendances spécifiques.

```bash
# Créer le container (première fois seulement)
distrobox create --name leafnode-dev --image ubuntu:22.04
distrobox enter leafnode-dev

# Dans le container : installer Rust + esp toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
cargo install espup
espup install
source ~/export-esp.sh
cargo install cargo-espflash   # pour monitor série
```

### Configurer le firmware (secrets)

```bash
cd backend/leafnode/firmware/leafnode/src

# Copier le fichier exemple (ne jamais committer config.rs !)
cp config.example.rs config.rs

# Editer config.rs avec les valeurs réelles :
nano config.rs
```

Valeurs à renseigner dans `config.rs` :

```rust
// Réseaux WiFi (ordre de priorité)
pub const WIFI_NETWORKS: &[(&str, &str)] = &[
    ("4G-CPE-ADC1", "12345678"),   // réseau serre (principal)
    ("Krikri", "MOT_DE_PASSE"),    // réseau backup dev
];

// MQTT broker = IP locale du Pi dans le réseau de la serre
pub const MQTT_BROKER: &str = "10.38.24.32";
pub const MQTT_PORT:   u16  = 1883;

// Identité de l'appareil
pub const DEVICE_ID:      &str = "esp32-deeo-1";   // unique par ESP32
pub const MQTT_CLIENT_ID: &str = "leafnode-deeo-1";
```

### Compiler le firmware

```bash
# Dans distrobox leafnode-dev
source ~/export-esp.sh
cd backend/leafnode/firmware/leafnode
cargo build --release
```

### Flasher l'ESP32

L'ESP32 se branche en USB. Sur WSL Windows, il faut d'abord attacher le périphérique USB :

```powershell
# Dans PowerShell Admin (Windows) — trouver le busid
usbipd list
# Chercher "CP2102" ou "Silicon Labs" → ex: 1-11

# Attacher à WSL
usbipd attach --wsl --busid 1-11
```

```bash
# Dans WSL Ubuntu — script tout-en-un
cd backend/leafnode
./flash_leafnode.sh             # flash le binaire existant
./flash_leafnode.sh --build     # recompile puis flash
./flash_leafnode.sh --monitor   # flash puis affiche les logs série
```

### Vérifier que l'ESP32 envoie des données

```bash
# Sur le Pi 5 — écouter les messages MQTT bruts
ssh virida@100.97.47.46 'mosquitto_sub -h localhost -u virida -P virida123 -t "virida/#" -v'
```

Exemple de message attendu :
```
virida/greenhouse-deeo-1/esp32-ph-1/telemetry  {"value":6.8,"unit":"pH","ts":1711234567}
virida/greenhouse-deeo-1/esp32-soil-1/telemetry {"value":44,"unit":"%","ts":1711234568}
```

---

## 6. Ajouter un nouveau capteur

### Étape 1 — Créer le driver Rust

```bash
# Créer le fichier driver
touch backend/leafnode/firmware/leafnode/src/sensors/mon_capteur.rs
```

Structure minimale d'un driver :

```rust
// mon_capteur.rs
// Wiring:
//   VCC → 3.3V
//   GND → GND
//   DATA → GPIO[X]

pub struct MonCapteur { /* ... */ }

impl MonCapteur {
    pub fn new(/* ... */) -> Result<Self, EspError> {
        // initialisation
    }

    pub fn read(&mut self) -> Result<f32, EspError> {
        // lecture + retourner valeur
    }
}
```

### Étape 2 — Enregistrer dans mod.rs

```rust
// sensors/mod.rs
pub mod mon_capteur;
pub use mon_capteur::MonCapteur;
```

### Étape 3 — Publier en MQTT dans main.rs

```rust
// Dans la boucle principale de main.rs
let valeur = mon_capteur.read()?;
mqtt_publish(&client, &format!("{}/mon-capteur-1/telemetry", topic_prefix),
    &format!(r#"{{"value":{:.2},"unit":"unité","ts":{}}}"#, valeur, timestamp))?;
```

### Étape 4 — Enregistrer le capteur en base de données

```bash
# Sur le Pi 5 — via l'API
curl -X POST http://localhost:3001/api/sensors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "esp32-mon-capteur-1",
    "name": "Mon Capteur",
    "type": "MON_TYPE",
    "unit": "unité",
    "greenhouseId": "greenhouse-deeo-1"
  }'
```

### Capteurs existants et leur brochage ESP32

| Capteur | GPIO | Type ADC | Driver |
|---------|------|----------|--------|
| BH1750 Lumière | I2C SDA=21 SCL=22 | I2C | `bh1750.rs` |
| FC28 Humidité sol | GPIO34 | ADC1_CH6 | `fc28.rs` |
| pH sensor | GPIO35 | ADC1_CH7 | `ph.rs` |
| TDS capteur | GPIO32 | ADC1_CH4 | `tds.rs` |
| HC-SR04 Niveau eau | Trig=5 Echo=18 | GPIO | `hcsr04.rs` |

> ⚠️ **ADC partagé** : FC28, pH et TDS partagent le même handle ADC1 (`adc1.rs`).
> Ne crée pas un nouveau `Adc1::new()` — passe `&adc1` existant au constructeur du driver.

---

## 7. Base de données

### Connexion directe (sur le Pi 5)

```bash
ssh virida@100.97.47.46
sudo -u postgres psql -d virida_prod

# Requêtes utiles
\dt                              -- lister les tables
SELECT * FROM sensors;           -- capteurs enregistrés
SELECT * FROM greenhouses;       -- serres

-- Dernières 10 lectures d'un capteur
SELECT value, timestamp FROM sensor_readings
WHERE sensor_id = 'esp32-ph-1'
ORDER BY timestamp DESC LIMIT 10;
```

### Modèles Prisma (dans virida_api)

> Toujours utiliser les noms **pluriels** dans Prisma :

```javascript
prisma.users          // ✅
prisma.sensors        // ✅
prisma.sensor_readings // ✅
prisma.plant_tasks    // ✅
prisma.greenhouses    // ✅
```

---

## 8. Claude Code — Configuration recommandée

```bash
# Installer Claude Code
npm install -g @anthropic-ai/claude-code

# Lancer dans le repo Virida
cd /home/ton-user/Projects/Virida
claude
```

### Tips Claude Code pour ce projet

- Le contexte du projet est dans `VIRIDA_CONTEXTE_COMPLET.md` à la racine — Claude Code le lit automatiquement
- Les commandes bash doivent passer par WSL : `wsl -d Ubuntu -e bash -c "..."`
- Pour les outils `Read/Write/Edit/Grep/Glob` utiliser les chemins Linux `/home/...` (pas `\\wsl.localhost\...`)
- Pour déployer sur le Pi : toujours `git push` en local puis `git pull` sur le Pi

### Commandes Claude Code utiles

```
/help              -- aide générale
/compact           -- résumer la conversation (libère le contexte)
Shift+Tab          -- mode auto (Claude exécute sans demander)
```

---

## Contacts équipe

| Rôle | Contact |
|------|---------|
| Lead Dev / IA | lekrikri |
| Gitea admin | `gitea.virida.org` — compte `LeCrabe` |
| Pi 5 SSH | `virida@100.97.47.46` (Tailscale) |

---

*Dernière mise à jour : 2026-03-26*
