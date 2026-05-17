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

## Reste à faire (backlog)

- **GraphRAG / Hierarchical RAG** : relations causales entre entités agronomes (long terme)
- **Mode Ultra-simple** : sélectionnable par l'utilisateur dans l'interface (format Problème → Cause → Action → Surveillance)
- **A/B testing + feedback thumbs** : évaluation réelle utilisateur (taux d'abandon, satisfaction)
- **Calibration capteurs** : rappel mensuel EVE pour recalibration avec solution tampon
- **BioCLIP/K-NN** : classification espèce zero-shot (priorité réduite — VLM-first couvre déjà)
- **YOLO-seg segmentation** : YOLOv8n-seg pour isoler uniquement les pixels feuilles (effort élevé)
- **Active Learning margin sampling** : `top1_prob - top2_prob` pour prioriser les images incertaines à annoter
