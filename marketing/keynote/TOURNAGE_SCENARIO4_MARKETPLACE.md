# 🎬 TOURNAGE — Scénario 4 : Le Marketplace Virida
> Document de production · Équipe Virida · Keynote 10 min
> Durée scénario : ~1 min 30s · Émotion cible : Enthousiasme, projection, "je veux en faire partie"

---

## 📋 RÉSUMÉ DU SCÉNARIO

**Ce qu'on raconte :**
EVE détecte que le capteur d'humidité sol de la serre est défaillant (érosion électrolytique).
Elle alerte l'utilisateur directement depuis le dashboard de l'app Virida, et lui propose d'aller commander un capteur de remplacement sur le Marketplace Virida.
L'utilisateur clique, arrive sur le catalogue Équipements avec de vraies photos de capteurs, choisit son produit et l'ajoute au panier.

**Ce qui est réel (pas une maquette) :**
- L'application virida_app est en production sur `app.virida.org`
- Le Marketplace est en production sur `marketplace.virida.org`
- Les produits existent avec de vraies photos
- Le compte krikri@virida.com fonctionne sur les deux apps

---

## 👤 COMPTES À UTILISER

| App | URL | Email | Mot de passe |
|-----|-----|-------|--------------|
| Virida App | app.virida.org | krikri@virida.com | test1234 |
| Marketplace | marketplace.virida.org | krikri@virida.com | test1234 |

> ⚠️ Même identifiant sur les deux. Pas besoin de se souvenir de deux mots de passe.

---

## 📱 FLOW EXACT À FILMER — 5 ÉCRANS

### ÉCRAN 1 — Dashboard virida_app avec alerte EVE (4 sec)
**URL :** `app.virida.org` (connecté krikri@virida.com)

**Ce qui doit apparaître :**
- En haut du dashboard : une carte rouge/orange intitulée **"CAPTEUR DÉFAILLANT DÉTECTÉ"**
- Dans la carte : le capteur `soil_moisture` avec le message EVE *"⚡ Érosion électrolytique — Le capteur résistif montre des valeurs saturées…"*
- Un bouton vert **"Marketplace"** à droite de l'anomalie

**Action de Christophe :**
- Tenir la tablette des deux mains, légèrement inclinée vers la caméra
- Lire la carte EVE naturellement, laisser un moment de compréhension s'installer
- Expression : légère préoccupation ("mon capteur est mort") → curiosité vers le bouton Marketplace

**Cadrage :**
- Vue rapprochée mains + tablette
- Arrière-plan flou : serre, plants, LED verte ambiante
- f/1.8 si possible, bokeh prononcé

---

### ÉCRAN 2 — Clic bouton Marketplace (2 sec)
**Ce qui se passe :**
- Christophe clique sur le bouton vert **"Marketplace"** dans la carte EVE
- Le navigateur ouvre `marketplace.virida.org/products?category=EQUIPMENT`

**Action de Christophe :**
- Geste naturel du pouce ou de l'index vers le bouton
- Pas besoin de filmer la navigation — couper directement à l'écran suivant

---

### ÉCRAN 3 — Catalogue Équipements avec les vraies photos (6 sec)
**URL :** `marketplace.virida.org/products?category=EQUIPMENT`

**Ce qui apparaît (5 produits avec vraies photos) :**
| Produit | Prix | Photo |
|---------|------|-------|
| Capteur d'humidité sol capacitif — Compatible Virida | 18.90€ | capteur vert dans pot terre cuite |
| Sonde DHT22 — Humidité Air & Température IoT | 12.50€ | module bleu + feuille |
| Kit Capteurs Serre Pro — 4 sondes + boitier IP67 | 89.00€ | flat lay pro |
| Capteur Chirp! — Triple Mesure Sol | 24.90€ | capteur dans succulent blanc |
| Kit pH complet — Solution + Capteur + Étalonnage | 24.00€ | solutions pH 4.0 et 7.0 |

**Action de Christophe :**
- Scroll lent vers le bas pour montrer les produits
- S'arrêter sur **"Capteur d'humidité sol capacitif"** (le 1er, le plus pertinent)
- Geste naturel de la main pour pointer/hover sur ce produit

---

### ÉCRAN 4 — Fiche produit Capteur capacitif (4 sec)
**Action :** Cliquer sur la carte "Capteur d'humidité sol capacitif — 18.90€"

**Ce qui apparaît :**
- Grande photo du capteur dans le pot de plante
- Description, prix 18.90€, badge "Équipements"
- Informations du vendeur (Michel P. — Le Jardin de Provence, Lyon)

**Action de Christophe :**
- Lire la fiche, hochement de tête approbateur
- Expression : "c'est exactement ce qu'il me faut"

---

### ÉCRAN 5 — Connexion + Ajout au panier (4 sec) *(optionnel selon temps)*
**Si on veut montrer l'achat complet :**
- Cliquer "Ajouter au panier" ou "Contacter le vendeur"
- Si non connecté : formulaire de connexion → krikri@virida.com / test1234
- Panier avec le produit ajouté

---

## 🎥 SETUP TECHNIQUE

### Matériel
- **Tablette :** iPad Pro 12.9" ou Samsung Tab S9 (grand écran = meilleur rendu)
- **Appareil photo/vidéo :** iPhone 15 Pro mode Cinématique OU Sony A7 avec objectif 50mm f/1.8
- **Stabilisateur :** Gimbal ou appui sur le rack de la serre
- **Lumière :** LEDs serre à 80% + lumière naturelle atténuée. Pas de lumière directe sur l'écran tablette (reflets)

### Cadrage type
```
┌─────────────────────────────────────┐
│                                     │
│   👐 Mains de Christophe           │
│      Tablette inclinée 30°          │
│      vers la caméra                 │
│                                     │
│  ░░░░░░ Serre en bokeh ░░░░░░░░░   │
│  (plants, LED verte, rack)          │
└─────────────────────────────────────┘
```

### Réglages recommandés
- **Résolution :** 4K si possible, minimum 1080p
- **Framerate :** 25 ou 30fps (pas 60 — trop fluide pour une keynote)
- **Exposition tablette :** Baisser légèrement la luminosité de la tablette (70%) pour éviter le surexposé à l'écran
- **Profondeur de champ :** Maximum de bokeh sur l'arrière-plan serre

---

## ✅ CHECKLIST AVANT TOURNAGE

### La veille (à faire à la maison / au bureau)
- [ ] Tablette chargée à 100%
- [ ] Mode **Ne pas déranger** activé sur la tablette
- [ ] Notifications désactivées
- [ ] Luminosité tablette réglée à 70%
- [ ] app.virida.org — login krikri@virida.com / test1234 → dashboard affiché, carte EVE visible
- [ ] marketplace.virida.org — en favori / onglet ouvert à l'avance
- [ ] Vérifier sur tablette que les images produits s'affichent bien
- [ ] Vérifier orientation tablette : **portrait ou paysage** selon le cadrage choisi

### Le matin du tournage (sur place)
- [ ] Vérifier que le Raspberry Pi envoie des données live
  - Se connecter en SSH : `ssh virida@100.97.47.46`
  - Commande : `sudo systemctl status virida-api`
- [ ] Recharger le dashboard app.virida.org → la carte EVE rouge doit être visible
- [ ] Si la carte EVE n'apparaît pas → vérifier avec le dev (données capteur sol manquantes)
- [ ] LEDs serre allumées, plante de basilic ou tomate accessible pour arrière-plan
- [ ] Faire une prise test pour vérifier l'absence de reflets sur l'écran

### Pendant le tournage
- [ ] **5 prises minimum** par écran clé (Écran 1, Écran 3, Écran 4)
- [ ] 1 prise large (mains + serre visible), 1 prise serrée (focus sur l'écran)
- [ ] Christophe : gestes lents, fluides. Pas de tap brusque. Scroll 2x plus lent que d'habitude.
- [ ] Vérifier après chaque prise que l'écran tablette est lisible dans le rush

---

## 🎙️ DIRECTION DE JEU — CHRISTOPHE

**Scène 1 (carte EVE) :**
> "Tu ouvres l'application le matin pour regarder l'état de ta serre. Tu vois le message rouge d'EVE. Tu lis : ton capteur d'humidité est mort par érosion électrolytique. C'est une mauvaise nouvelle mais EVE t'a déjà trouvé la solution. Tu vois le bouton Marketplace. Légère surprise, puis soulagement."

**Scène 3 (catalogue) :**
> "Tu arrives sur le marketplace comme si c'était Amazon mais pour ta serre. Tu scrolles doucement, tu regardes les produits. C'est précis, c'est beau, c'est professionnel. Tu t'arrêtes sur le capteur capacitif. C'est exactement ce qu'il te faut."

**Scène 4 (fiche produit) :**
> "Tu lis la fiche. 18,90€. Compatible Virida. Photo nette. Vendeur vérifié. Hochement de tête. Tu es prêt à commander."

---

## 🗂️ ORGANISATION DES FICHIERS RUSHES

```
virida_storytelling_shoots/
└── scenario4_marketplace/
    ├── ecran1_dashboard_eve/
    │   ├── prise_01.mp4
    │   ├── prise_02.mp4
    │   └── prise_03.mp4  ← meilleure
    ├── ecran3_catalogue_equipment/
    ├── ecran4_fiche_produit/
    └── bonus_ajout_panier/
```

---

## ⏱️ TIMING DE TOURNAGE

| Étape | Durée estimée |
|-------|---------------|
| Setup tablette + vérifications | 10 min |
| Écran 1 — Dashboard EVE (5 prises) | 15 min |
| Écran 2 — Clic transition (3 prises) | 5 min |
| Écran 3 — Catalogue scroll (5 prises) | 15 min |
| Écran 4 — Fiche produit (5 prises) | 10 min |
| Écran 5 — Panier (3 prises, optionnel) | 10 min |
| **TOTAL** | **~65 min** |

---

## 🎵 MUSIQUE SUGGÉRÉE (post-prod)

- Type : Énergique, futuriste, montée progressive
- Référence : Tycho — "Awake" ou "Dive"
- BPM : 110-125
- Pas de lyrics
- Fade out sur le dernier écran (panier / CTA)

---

*Document créé le 2026-05-21 · Équipe Virida*
*Scénario 4 Marketplace : APP EN PRODUCTION — pas une maquette*
