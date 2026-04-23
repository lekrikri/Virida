# Pour Ludo — État du projet Virida (23 avril 2026)

## Ce qui a été fait cette session

### 1. EVE Vision — Gemma 4 Multimodal ✅

**Modèle installé sur le Pi5 :**
- `mmproj-BF16.gguf` (987 MB) → `/home/virida/virida-eve/models/mmproj-BF16.gguf`
- Source : `unsloth/gemma-4-E2B-it-GGUF` sur HuggingFace
- Gemma 4 tourne maintenant **en mode multimodal** (texte + vision caméra)

**Pipeline vision complet :**
```
ESP32-CAM → MQTT snapshot → MQTTSnapshotHandler → VisionAnalyzer (Gemma 4 + mmproj) → EVE /chat
```

**Fichiers modifiés (virida-eve) :**

| Fichier | Changement |
|---------|-----------|
| `eve/phi_manager.py` | Handler Gemma4ChatHandler (natif) + fallback Llava15, mmproj BF16 > F16 |
| `eve/vision/vlm_manager.py` | Priorité mmproj-BF16.gguf, Gemma4ChatHandler avec fallback |
| `eve/vision/mqtt_snapshot_handler.py` | Auth MQTT (user/password depuis env vars) |
| `eve/flask_rag_api.py` | Vision enrichissement dans /chat + MQTT démarrage dans `_do_preload` |
| `eve/eve_hybrid_manager.py` | Fix artefacts Gemma (`<channel>`), repeat_penalty 1.25, tutoiement, résumé déterministe |

---

### 2. Corrections réponses EVE ✅

**Problèmes résolus :**
- Artefacts `<channel>`, `<end_of_turn>` dans les réponses → ajoutés aux stop tokens
- Répétitions de phrases → `repeat_penalty` 1.1 → **1.25**
- Régurgitation "ALERTE CRITIQUE" du prompt → `alert_prefix` supprimé du prompt
- Vouvoiement → `"Tutoie l'utilisateur."` dans le system_prompt

**Réponse résumé déterministe :**
Quand l'user demande "état de la serre", EVE construit une réponse directe depuis les capteurs sans passer par le LLM (plus fiable, instantané).

---

### 3. Onboarding Eve — virida_app ✅

Nouveau composant : `src/components/onboarding/OnboardingOverlay.tsx`

**Fonctionnement :**
- S'affiche **une seule fois** à la première connexion (détection via `localStorage`)
- Eve la mascotte flotte en bas à droite (CSS animation)
- Bulle de dialogue animée avec 6 étapes (Accueil → Dashboard → Plantes → Irrigation → Chat → C'est parti)
- Navigation : Suivant / Retour / Passer (touche Echap aussi)
- Barre de progression + indicateurs de step

**Stockage :**
```typescript
localStorage.setItem('virida_onboarding_done', 'true')
```

---

## Ce que tu peux faire maintenant

### Tester l'onboarding
```bash
# Build et déployer sur le Pi
cd /home/lekrikri/Projects/Virida/frontend/virida_app
npm run build
rsync -avz --delete dist/ virida@100.97.47.46:~/virida_touch_ihm/
ssh virida@100.97.47.46 'sudo systemctl restart virida-frontend && sudo systemctl restart virida-kiosk'
```

Pour re-tester l'onboarding (le reset) : ouvrir la console browser → `localStorage.removeItem('virida_onboarding_done')` → refresh.

---

### Tester la vision EVE

**Déclencher un snapshot manuel :**
```bash
# Via MQTT (simuler ESP32-CAM)
ssh virida@100.97.47.46
mosquitto_pub -h localhost -u virida -P virida123 \
  -t "virida/greenhouse-deeo-1/espcam-1/snapshot" \
  -f /home/virida/virida-eve/test_image.jpg
```

**Vérifier que Gemma 4 analyse l'image :**
```bash
sudo journalctl -u virida-eve -f | grep -iE "vision|vlm|snapshot|analyze"
```

**Vérifier l'analyse dans /chat :**
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "que vois-tu sur la caméra?", "greenhouse_id": "greenhouse-deeo-1"}'
```

---

### Variables d'environnement Pi (`.env` dans `/home/virida/virida-eve/`)

```env
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USER=virida
MQTT_PASSWORD=virida123
MQTT_TOPIC_SNAPSHOT=virida/+/+/snapshot
VLM_MODEL=gemma4
ESPCAM_SNAPSHOT_URL=http://192.168.0.100/capture
```

---

## Améliorations à faire (suite)

### Court terme
1. **Libérer l'ancien mmproj** : `rm /home/virida/virida-eve/models/mmproj-F16.gguf` (libère 940 MB)
2. **Onboarding** : ajouter framer-motion pour des animations plus fluides (`npm install framer-motion`)
3. **Onboarding** : mettre à jour les screenshots/visuels dans chaque step

### Moyen terme
4. **Tests benchmark EVE** : relancer `benchmark_eve_contexte.py` — objectif 90%+ (actuel 83%)
5. **Hybrid search chunks** : `chunks_v3.json` a 174 chunks mais le BM25 ne charge que `chunks.json` (90 chunks) → unifier
6. **Vision trigger** : ajuster le seuil de déclenchement `VisionTrigger.should_analyze()` selon les besoins réels
7. **Déploiement Clever Cloud** : `VLM_MODEL=smolvlm` (SmolVLM-500M) car pas de mmproj Gemma sur Clever

### Long terme
8. **Onboarding personnalisé** : adapter le message selon le profil user (admin vs user)
9. **EVE voix** : TTS pour que Eve puisse parler (piper-tts)

---

## Commandes utiles Pi5

```bash
# Logs EVE en direct
ssh virida@100.97.47.46 'sudo journalctl -u virida-eve -f'

# Relancer EVE (après modif)
ssh virida@100.97.47.46 'sudo systemctl restart virida-eve'

# Déployer un fichier Python EVE (exemple eve_hybrid_manager.py)
rsync -avz backend/virida-eve/eve/eve_hybrid_manager.py virida@100.97.47.46:/home/virida/virida-eve/eve/

# Status de tous les services
ssh virida@100.97.47.46 'sudo systemctl status virida-api virida-eve virida-frontend virida-kiosk'

# Espace disque
ssh virida@100.97.47.46 'df -h /home && du -sh /home/virida/virida-eve/models/*'
```

---

## Architecture rapide

```
Raspberry Pi 5 (192.168.0.107 / Tailscale 100.97.47.46)
├── virida-api     :3001  (Node.js — PostgreSQL + WebSocket)
├── virida-eve     :5000  (Flask — Gemma 4 E2B + ChromaDB + Vision)
├── virida-frontend:3000  (serve — build React IHM tactile)
└── Mosquitto      :1883  (MQTT broker)

ESP32-CAM (192.168.0.100)
└── MJPEG stream + MQTT snapshot → virida/greenhouse-deeo-1/espcam-1/snapshot

Modèles IA (Pi5 ~/virida-eve/models/)
├── gemma4-e2b.gguf      (2962 MB) — LLM texte + vision
├── mmproj-BF16.gguf     (942 MB)  — Vision projector Gemma 4 ← NOUVEAU
└── SmolVLM-500M...gguf  (417 MB)  — Fallback vision (si VLM_MODEL=smolvlm)
```

---

*Généré par Claude Code — Session 2026-04-23*
