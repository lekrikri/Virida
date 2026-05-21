# 🎬 TOURNAGE — Scénario 2 : L'Alerte Luminosité (EVE allume les LEDs)
> Document de production · Équipe Virida · Keynote 10 min
> Durée scénario : ~2 min 30s · Émotion cible : Urgence résolue, soulagement, "EVE a agi avant moi"

---

## 📋 RÉSUMÉ DU SCÉNARIO

**Ce qu'on raconte :**
Christophe reçoit une alerte Virida : la luminosité de sa serre est tombée à 101 lux —
bien en dessous des 500 lux nécessaires pour ses plantes.
Il ouvre l'app. EVE a déjà analysé la situation et déclenché automatiquement
la règle "Boost LED Croissance" — l'intensité des LEDs augmente en temps réel.
Christophe regarde les LEDs de la serre s'allumer devant ses yeux, directement depuis l'app.

**L'émotion :** "Les LEDs viennent de s'allumer. EVE l'a fait avant même que je réagisse."

**Ce qui est 100% réel — zéro simulation :**
- La luminosité actuelle est **101 lux** (seuil 500 lux) → alerte déjà visible sur le dashboard
- Les LEDs de la serre sont pilotables via l'automatisation Virida
- L'effet visuel des LEDs qui s'intensifient est filmable directement dans la serre

---

## 👤 COMPTE À UTILISER

| App | URL | Email | Mot de passe |
|-----|-----|-------|--------------|
| Virida App | app.virida.org | krikri@virida.com | test1234 |

---

## ⚙️ PRÉPARATION EN AMONT

### Vérifier / créer la règle d'automatisation "Boost LED"
Dans app.virida.org → Automatisation → vérifier qu'une règle existe :

```
Règle : "Boost LED Croissance"
Condition : Luminosité < 500 lux
Action    : Augmenter intensité LED à 100% pendant 2h
Statut    : ACTIVE
```

Si elle n'existe pas → la créer la veille du tournage (5 min).

### Préparer le déclenchement manuel pour le tournage
Pour que la règle se déclenche pendant la prise :
- Soit la luminosité est naturellement basse (matin tôt, temps couvert) → parfait
- Soit baisser manuellement les LEDs avant la prise pour que la valeur soit sous 500 lux,
  puis laisser l'automatisation les remonter devant la caméra

### Test la veille
- Vérifier que la carte luminosité apparaît bien en orange/rouge sur le dashboard
- Vérifier que la règle LED se déclenche et que les LEDs répondent visuellement
- Chronométrer le délai entre déclenchement et allumage LED (~2-5 secondes)

---

## 📱 FLOW EXACT À FILMER — 5 ÉCRANS

### ÉCRAN 1 — Notification alerte luminosité (3 sec)
**Ce qu'on filme :**
La tablette affiche la notification ou le badge d'alerte Virida :
*"⚠️ Luminosité insuffisante — 101 lux détectés dans Serre Principale"*

**Action de Christophe :**
- Tablette posée sur un rebord de la serre, une plante au premier plan
- Christophe attrape la tablette, lit la notification
- Expression : légère inquiétude — "mes plantes manquent de lumière"

**Cadrage :**
- Vue de dessus légère : tablette posée, main qui la saisit
- Lumière ambiante de la serre volontairement basse (avant le boost LED) — c'est cohérent avec le scénario

---

### ÉCRAN 2 — Dashboard — Carte Luminosité en alerte (4 sec)
**URL :** app.virida.org → Dashboard

**Ce qui doit apparaître :**
- Carte **Luminosité** : valeur **101 lux** en orange, badge **"EN DESSOUS DU SEUIL"**
- Message EVE sur le dashboard : *"Luminosité insuffisante — En dessous du seuil (500 lux) → Augmenter durée ou intensité LED"*
- Les autres capteurs en vert (température OK, humidité OK)

**Action de Christophe :**
- Tenir la tablette d'une main, pointer la carte luminosité
- Lire le message EVE
- Expression de lecture active : "EVE a déjà identifié le problème"

---

### ÉCRAN 3 — Page Capteurs — Historique luminosité (3 sec)
**URL :** app.virida.org → Capteurs → clic sur le capteur luminosité

**Ce qui doit apparaître :**
- Graphique 24h de la luminosité avec la chute visible
- Sparkline descendante
- Seuil 500 lux matérialisé en ligne pointillée rouge

**Action de Christophe :**
- Swipe vers le capteur lumière
- Lire l'historique : "Ça a chuté ce matin"

---

### ÉCRAN 4 — Automatisation — Règle déclenchée (4 sec)
**URL :** app.virida.org → Automatisation

**Ce qui doit apparaître :**
- Règle **"Boost LED Croissance"** avec toggle **ON** vert
- Statut : **"Déclenché automatiquement"** avec l'heure
- Condition visible : "Si Luminosité < 500 lux → LED 100% pendant 2h"

**Action de Christophe :**
- Voir la règle active
- Expression de soulagement : "EVE a déjà réagi"
- Taper sur la règle pour voir le détail

---

### ÉCRAN 5 — LEDs qui s'allument dans la serre (5 sec) ← PLAN SIGNATURE
**Ce qu'on filme :**
Christophe baisse la tablette, regarde la serre physique.
Les LEDs viennent de se déclencher (ou se déclenchent pendant la prise).
La serre passe d'une lumière faible à une lumière vive verte/blanche.
Les plantes sont illuminées.

**Action de Christophe :**
- Regard qui quitte l'écran de la tablette pour regarder la serre
- Les LEDs s'allument (ou sont déjà allumées à fond)
- Sourire de satisfaction : "C'est fait. EVE a géré."
- Optionnel : il lève légèrement la tablette dans le champ pour faire le lien app ↔ réel

**Cadrage — le plan le plus fort du scénario :**
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   [Main droite tient la tablette — app visible]         │
│                                                          │
│         → regard de Christophe vers la serre            │
│                                                          │
│   [Arrière-plan : LEDs de la serre qui s'allument]      │
│   Transition lumière faible → lumière vive verte        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Texte à voix off :**
> "101 lux détectés. En 4 secondes, EVE a activé le boost LED. Les plantes ont leur lumière."

---

## 🎥 SETUP TECHNIQUE

### Matériel
- Tablette standard (scénarios 1-4)
- **Critique :** les LEDs de la serre doivent être pilotables et leur effet visible à la caméra
- Régler la caméra sur **balance des blancs manuel** — la lumière LED va changer de température entre les plans

### Réglages caméra pour le plan LEDs (Écran 5)
- **Exposition :** laisser en automatique pour capturer la montée de lumière naturellement
- **Balance des blancs :** régler sur la lumière LED finale (pas sur la lumière ambiante du début)
- **Cadrage :** inclure plusieurs rangées de plantes dans le champ pour maximiser l'effet visuel
- **Durée du plan :** filmer au moins 8-10 sec pour capturer la transition complète

### Ordre de tournage recommandé
Tourner l'Écran 5 en premier (LEDs allumées = meilleure lumière pour filmer les autres plans).
Puis éteindre les LEDs et retourner à l'état "alerte" pour les Écrans 1 à 4.

---

## ✅ CHECKLIST AVANT TOURNAGE

### La veille
- [ ] Créer/vérifier la règle "Boost LED Croissance" dans Automatisation
- [ ] Tester le déclenchement de la règle : LEDs répondent visuellement ?
- [ ] Vérifier que la carte luminosité est bien en orange sur le dashboard (101 lux < 500 lux)
- [ ] Chronométrer le délai déclenchement → LEDs allumées

### Le matin du tournage
- [ ] Pi en marche + virida-api actif
- [ ] Dashboard : carte luminosité visible en alerte
- [ ] LEDs de la serre en position "faible" ou éteintes pour le début du scénario
- [ ] Appareil photo/vidéo réglé pour gérer la variation de lumière LED

### Sur le plateau
- [ ] **Tourner Écran 5 en premier** pendant que les LEDs sont à fond (meilleure lumière)
- [ ] Pour les plans app (Écrans 1-4) : LEDs à 20-30% max pour que la serre soit "sombre"
- [ ] Pour le plan signature (Écran 5) : LEDs à 100% → effet maximal
- [ ] Prévoir 5 prises minimum pour l'Écran 5 (transition LED)

---

## 🎙️ DIRECTION DE JEU — CHRISTOPHE

**Écran 1 (notification) :**
> "Tu vois l'alerte. 101 lux. Tes plantes ne reçoivent pas assez de lumière ce matin. C'est urgent — sans lumière, la photosynthèse s'arrête. Tu ouvres l'app."

**Écran 2 (dashboard alerte) :**
> "La carte lumière est en orange. EVE te dit exactement quoi faire. Mais en fait… elle l'a déjà fait. Tu le réalises en naviguant vers Automatisation."

**Écran 4 (automatisation) :**
> "La règle s'est déclenchée automatiquement à 7h34. EVE a agi pendant que tu dormais. Tu expires doucement. 'Elle a tout géré.'"

**Écran 5 (LEDs — plan signature) :**
> "Tu baisses la tablette. Tu regardes ta serre. Les LEDs brillent à fond. Tes plantes sont baignées de lumière. Ce n'est pas toi qui as fait ça. C'est EVE. Sourire lent, sincère. C'est ça, l'agriculture intelligente."

---

## 🗂️ ORGANISATION DES FICHIERS RUSHES

```
virida_storytelling_shoots/
└── scenario2_alerte_lumiere/
    ├── ecran1_notification/
    ├── ecran2_dashboard_alerte/
    ├── ecran3_historique_lux/
    ├── ecran4_automatisation/
    └── ecran5_leds_allumees/     ← plan signature, 5+ prises
```

---

## ⏱️ TIMING DE TOURNAGE

| Étape | Durée estimée |
|-------|---------------|
| Setup LEDs + vérification règle automatisation | 15 min |
| Écran 5 — LEDs allumées (5 prises, LEDs à fond) | 15 min |
| Reset LEDs à 20% pour plans app | 5 min |
| Écran 1 — Notification (3 prises) | 8 min |
| Écran 2 — Dashboard alerte (4 prises) | 10 min |
| Écran 3 — Historique luminosité (3 prises) | 8 min |
| Écran 4 — Automatisation (4 prises) | 10 min |
| **TOTAL** | **~70 min** |

---

## 🎵 MUSIQUE SUGGÉRÉE (post-prod)

- Type : Tension légère au début → libération progressive
- Référence : Bonobo — "Kong" (montée) ou Nils Frahm — "Says"
- Moment LEDs : montée musicale qui coïncide avec l'allumage des LEDs
- BPM : 90-100, puis descente apaisée après le déclenchement
- Pas de lyrics

---

*Document créé le 2026-05-21 · Équipe Virida*
*Scénario 100% réel — luminosité actuelle 101 lux, seuil 500 lux, alerte live sur dashboard*
