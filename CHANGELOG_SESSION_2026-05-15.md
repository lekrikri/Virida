# Changelog Session — 15-18 Mai 2026

## Frontend — virida_app

### Navigation mobile (BottomNav)
- Labels traduits en français : `Home` → `Accueil`, `Crops` → `Cultures`, `Energy` → `Énergie`
- Fichier : `frontend/virida_app/src/components/layout/BottomNav.tsx`

### Fix voix EVE — Autoplay bloqué sur mobile
- **Problème :** La politique d'autoplay du navigateur bloquait `audio.play()` car le `await` du streaming brisait la chaîne d'interaction utilisateur.
- **Fix :** `AudioContext` singleton (`audioCtxRef`) déverrouillé au moment exact du clic (`unlockAudio()`). Remplacement de `new Audio().play()` par `ctx.decodeAudioData()` + `createBufferSource()` (contourne l'autoplay restriction). `unlockAudio()` appelé au début de `handleSendMessage` et au `onstart` du micro.
- Streaming accéléré : chunks de 3 mots à 20ms au lieu de 1 mot à 18ms (~3x plus rapide visuellement)
- Fichier : `frontend/virida_app/src/components/chatbot/ChatBotNew.tsx`

### Fix suppression conversations — Messages locaux non effacés
- **Problème :** `clearAllHistory()` effaçait le context React et localStorage mais le state local `messages` dans le chatbot restait intact.
- **Fix :** Nouveau `useEffect` avec `prevConvCountRef` qui détecte quand `conversations.length` passe de N → 0 → `setMessages([])` + `isInitialized.current = false` → re-initialisation propre.
- Fichier : `frontend/virida_app/src/components/chatbot/ChatBotNew.tsx`

---

## Backend IA — virida-eve

### 1. Prompt système EVE — Langage actionnable pour débutants
- Ciblé explicitement jardiniers débutants sans jargon technique.
- Format obligatoire alertes : `🔴 Problème → Cause (analogie) → 👉 Action maintenant → 👀 Ce que tu observeras dans Xh`
- Analogies systématiques injectées dans le prompt :
  - pH = *"eau aussi acide que du jus de citron"*
  - TDS = *"le repas de ta plante dans l'eau"*
  - Sol sec = *"ta plante a soif"*
  - Température haute = *"ta plante fait de la fièvre"*
  - Humidité haute = *"sauna = les champignons adorent ça"*
- Fin de chaque réponse par une question ouverte pour engager l'utilisateur.
- Fichier : `backend/virida-eve/eve/eve_hybrid_manager.py` — `_build_eve_prompt()`

### 2. Fast-path reformulé — Réponses déterministes (<500ms)
Toutes les réponses directes (sans LLM) réécrites avec analogies débutant.

Exemple pH critique :
- **Avant :** `"pH DANGEREUX (4.2). Corriger immédiatement avec solution pH+."`
- **Après :** `"🔴 L'eau est aussi acide que du jus de citron (4.2) — les racines brûlent ! 👉 Ajoute une solution pH+ maintenant. 👀 Dans 2h le pH devrait remonter vers 6."`

Fichiers modifiés :
- `SENSOR_ACTIONS` → alertes injectées dans le contexte LLM
- `ACTIONS` dans `_try_direct_sensor_response()` → réponses directes sans LLM
- `CRITICAL_ACTIONS` dans `_build_summary_response()` → résumé serre
- Warnings enrichis avec hints contextuels ("eau un peu acide", "plante sous-alimentée")

### 3. Cross-validation capteurs — Détection dérive
Nouvelle fonction `_detect_sensor_drift()` avec 4 règles automatiques :

| Règle | Condition | Action EVE |
|-------|-----------|------------|
| 1 | pH critique MAIS TDS normal | Signale probable dérive capteur pH — recalibre avant d'intervenir |
| 2 | Température >35°C ET humidité >85% simultanément | Valeurs suspectes, vérifie positionnement capteur |
| 3 | pH chute >1.5 en 3h sans changement TDS | Variation suspecte, possible capteur défaillant |
| 4 | Sol très sec MAIS air très humide | Incohérence — vérifier si plante sous cloche |

Les warnings sont injectés comme `<drift_alerts>` dans le contexte XML, EVE les signale avec doute explicite.

### 4. RAG — Scoring dynamique par métadonnées utilisateur
Nouveau re-scoring des chunks avant injection dans le LLM :

| Condition | Boost |
|-----------|-------|
| Chunk parle d'une espèce cultivée par l'utilisateur | +20% |
| Chunk mentionne le stade de croissance actif | +15% |
| Chunk lié à un capteur actuellement en alerte | +25% |

- Pool candidats élargi : 8 chunks évalués → 3 meilleurs gardés (vs 3 filtrés à plat avant)
- Seuil RRF abaissé à 0.55 (plus robuste), contexte élargi à 120 mots/chunk

### 5. Vision — Indices spectraux avancés + détection texture fongique

Nouvelles métriques calculées dans `vision_cv_analyzer.py` :

| Indice | Formule | Usage |
|--------|---------|-------|
| **VARI** | (G-R)/(G+R-B) | Résistant aux variations lumière — <0.05 = stress sévère |
| **GLI** | (2G-R-B)/(2G+R+B) | Normalisé, complément ExG |
| **NGRDI** | (G-R)/(G+R) | <0 = rouge domine → chlorose/nécrose |
| **ExR** | 1.4R-G (normalisé) | Élevé = stress nutritionnel |
| **CIVE** | 0.441R-0.811G+0.385B+18.78 | Plus robuste sur fond complexe |
| **TGI** | G-0.39R-0.61B (normalisé) | Corrèle avec teneur en chlorophylle |
| **LBP entropy** | scikit-image LBP uniforme P=8,R=1 | >3.5 = texture irrégulière → champignon/nécrose |
| **Hue entropy** | Entropie HSV H-channel | >3.8 = palette multicouleur → maladie mixte |

Nouvelles règles dans `_apply_business_rules` :
- **Règle 4b** : `LBP_entropy > 3.5 + humidité > 70% + spots > 4%` → ajoute `mold`, force `stressed`
- **Règle 4c** : `VARI < 0 ET NGRDI < -0.05` → override `healthy` → `stressed` (stress spectral)

Les indices sont injectés dans `build_cv_prompt` avec leurs seuils interprétatifs pour guider le LLM.

### 6. Vision — Suivi temporel EWMA + indices spectraux historiques

Amélioration de `get_health_trend()` dans `flask_rag_api.py` :
- **EWMA (alpha=0.3)** : lisse les fluctuations journalières (plus robuste que la simple différence first→last)
- **Delta EWMA** : seuil de détection `±0.12` (vs `±0.15` avant) — plus sensible
- **Persistance `spectral_indices` (JSONB)** : stockage ExG, VARI, NGRDI, GLI, LBP_entropy à chaque analyse
- **Requête SQL** : extraction `avg_exg` et `avg_vari` journaliers via `spectral_indices->>'exg_index'`
- **Nouvelles alertes spectrales** : chute VARI > 0.10/7j → déclin photosynthèse ; chute ExG > 0.08/7j → carence azote
- **Query EVE enrichie** : `delta_exg` et `delta_vari` injectés dans la requête si variations significatives (>0.05)

Déploiement : `_ensure_vision_columns` ajoute la colonne `spectral_indices JSONB` automatiquement (migration idempotente).

---

## Déploiements

| Service | Méthode | Commit |
|---------|---------|--------|
| `virida_app` (Clever Cloud) | `git push clever master` | `92a932b` |
| `virida-eve` (Pi 5) | `scp` direct + `systemctl restart` | `64281a3` |
| `virida-eve` (Clever Cloud) | `git push viridaapirag master --force` | `5a040f0` |
| `virida-eve` (Pi 5) | `scp` direct + `systemctl restart` | `eb2b9ab` |
| `virida-eve` (Clever Cloud) | `git push viridaapirag master` | `eb2b9ab` |

---

### 7. Vision — Segmentation pixel-par-pixel (masque feuilles)

Modification de `vision_cv_analyzer.py` — tous les indices spectraux sont maintenant calculés **uniquement sur les pixels feuilles** (pas le fond, pot, terre, mur).

- Masque HSV multi-couche : vert sain (H 15-95) + brun nécrose (H 8-22) + morphologie close/open
- Helper `_masked_mean(arr2d)` : moyenne sur `arr[mask_bool]` si >100 pixels végétaux, sinon fallback global
- Nouveau champ `leaf_pixel_ratio` : fraction de pixels dans le masque (indicateur qualité segmentation)
- Gain : ExG, VARI, NGRDI etc. ne sont plus "pollués" par les pixels de fond → diagnostics plus précis

### 8. Active Learning — Margin Sampling

Modification de `yolo_plant_analyzer.py` :

| Nouveau champ | Formule | Interprétation |
|--------------|---------|----------------|
| `_yolo_margin` | `top1_prob - top2_prob` | 0 = très incertain, 1 = certain |
| `_yolo_top2_class` | 2e classe la plus probable | utile pour comprendre les confusions |
| `_yolo_top2_prob` | probabilité du 2e candidat | — |
| `_yolo_entropy` | entropie de la distribution | mesure d'incertitude globale |

Modification de `log_low_confidence_image()` :
- Stocke `margin_score`, `uncertainty` (0→1), `yolo_entropy`, `yolo_top2` dans `metadata.json`
- `uncertainty = 1 - margin` si YOLO dispo, sinon déduit de `confidence` LLM

Nouveaux endpoints :
- **`GET /vision/active-learning-queue`** : retourne les images triées par `uncertainty DESC` — les annotateurs savent lesquelles traiter en priorité
- **`POST /vision/active-learning-annotate`** : marquer une image avec son label correct (`healthy`/`stressed`/`diseased`/`discard`)

### 9. Species Detector — K-NN spectral zéro-shot (`species_detector.py`)

Nouveau module `eve/vision/species_detector.py` — classification d'espèce **sans CLIP ni modèle lourd** (~0 MB supplémentaire).

**Principe** : distance euclidienne pondérée dans l'espace des 11 features spectrales :

| Feature | Poids | Rôle |
|---------|-------|------|
| `exg_index` | 2.0 | Intensité chlorophylle |
| `vari_index` | 2.0 | Végétation robuste |
| `gli_index` | 1.5 | Complémentaire ExG |
| `ngrdi_index` | 1.5 | Ratio vert/rouge |
| `lbp_entropy` | 1.5 | Texture (distingue feuilles lisses vs frisées) |
| `hue_entropy` | 1.5 | Palette teintes (fraise = mélange vert/rouge) |
| `exr_index` | 1.0 | Excès rouge |
| `chlorosis_index` | 1.0 | Rapport R/G |
| `avg_saturation` | 0.5 | Brillance (basilic = très saturé) |
| `green_ratio` | 1.0 | — |
| `yellow_ratio` | 0.8 | — |

**8 espèces couvertes** : basilic génois, tomate cerise, laitue beurre, menthe, fraise, persil frisé, épinard, coriandre.

**Auto-détection** : si `plant_name` est générique ("plante", vide), l'espèce est détectée avant l'analyse VLM et injectée automatiquement dans le pipeline.

**Apprentissage en ligne** : `update_profile(species, cv, weight=0.05)` — EWMA sur les analyses high-confidence pour adapter les profils aux conditions réelles de la serre.

**Réponse enrichie** : le champ `species_detected` est ajouté à la réponse `/vision/analyze` quand l'auto-détection est activée.

---

## Déploiements

| Service | Méthode | Commit |
|---------|---------|--------|
| `virida_app` (Clever Cloud) | `git push clever master` | `92a932b` |
| `virida-eve` (Pi 5) | `scp` direct + `systemctl restart` | `64281a3` |
| `virida-eve` (Clever Cloud) | `git push viridaapirag master --force` | `5a040f0` |
| `virida-eve` (Pi 5) | `scp` direct + `systemctl restart` | `eb2b9ab` |
| `virida-eve` (Clever Cloud) | `git push viridaapirag master` | `eb2b9ab` |
| `virida-eve` (Pi 5) | `scp` direct + `systemctl restart` | `6de8346` |
| `virida-eve` (Clever Cloud) | `git push viridaapirag master` | `6de8346` |

---

## Reste à faire (backlog)

- **GraphRAG / Hierarchical RAG** : relations causales entre entités agronomes (long terme)
- **Mode Ultra-simple** : sélectionnable par l'utilisateur dans l'interface (format Problème → Cause → Action → Surveillance)
- **A/B testing + feedback thumbs** : évaluation réelle utilisateur (taux d'abandon, satisfaction)
- **Calibration capteurs** : rappel mensuel EVE pour recalibration avec solution tampon
- **YOLO-seg instance segmentation** : YOLOv8n-seg réel avec modèle PlantVillage-seg (long terme, modèle non disponible publiquement)
- **Species detector — calibration** : collecter des images réelles par espèce pour affiner les profils K-NN
