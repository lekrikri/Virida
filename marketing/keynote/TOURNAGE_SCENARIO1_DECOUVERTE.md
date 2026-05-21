# 🎬 TOURNAGE — Scénario 1 : La Première Connexion
> Document de production · Équipe Virida · Keynote 10 min
> Durée scénario : ~2 min · Émotion cible : Découverte, confiance, "wow c'est simple"

---

## 📋 RÉSUMÉ DU SCÉNARIO

**Ce qu'on raconte :**
Christophe ouvre l'application Virida pour la première fois. Le logo Virida apparaît
en splash screen animé (fond noir, lueurs vertes, barre de progression). Puis EVE l'accueille
et lui fait découvrir le dashboard avec toutes les données de sa serre en temps réel :
température, humidité, pH, lumière — tout est vert, tout va bien.

**L'émotion :** "C'est beau. C'est simple. Je comprends d'un coup d'œil."

**Ce qui est réel :**
- Le splash screen Virida est désormais animé (déployé le 2026-05-21)
- Le dashboard affiche les vraies données de la serre (Pi live)
- L'onboarding EVE en 32 étapes est fonctionnel sur app.virida.org

---

## 👤 COMPTE À UTILISER

| App | URL | Email | Mot de passe |
|-----|-----|-------|--------------|
| Virida App | app.virida.org | krikri@virida.com | test1234 |

> ⚠️ **Avant de filmer :** se déconnecter de l'app pour que le splash screen s'affiche.
> Le splash ne s'affiche qu'à chaque rechargement complet de la page.

---

## 📱 FLOW EXACT À FILMER — 4 ÉCRANS

### ÉCRAN 0 — Splash Screen Virida (3 sec) ← NOUVEAU
**Comment le déclencher :** Ouvrir app.virida.org dans un onglet vierge, ou recharger la page (F5)

**Ce qui s'anime (3 secondes) :**
1. Fond noir `#050d08`
2. Halo vert qui pulse du centre
3. Logo Virida (l'icône feuille) qui apparaît avec scale + fade
4. Wordmark **"Virida."** qui monte progressivement
5. Tagline "Agriculture 4.0" en vert pâle
6. Barre de chargement verte de gauche à droite
7. Fondu sortant → LandingPage

**Action de Christophe :**
- Tenir la tablette des deux mains
- Laisser le splash se dérouler sans toucher l'écran
- Légère curiosité sur le visage pendant l'animation

**Cadrage :**
- Vue légèrement de côté (15-20°) pour voir l'écran + les mains
- Arrière-plan serre en bokeh
- Lumière LED verte ambiante de la serre qui "répond" aux couleurs de l'écran

---

### ÉCRAN 1 — Landing page virida.org (3 sec)
**Ce qui apparaît :**
- Hero : "Cultivez le futur. Laissez **EVE** faire le reste."
- Deux bulles EVE flottantes sur les côtés ("Vos tomates sont prêtes" / "Humidité optimale")
- Bouton vert "Lancer l'expérience"

**Action de Christophe :**
- Lire le titre, léger sourire
- Appuyer sur **"Lancer l'expérience"** → page de connexion

---

### ÉCRAN 2 — Connexion + Welcome EVE Onboarding (5 sec)
**URL après connexion :** app.virida.org (dashboard + overlay onboarding)

**Ce qui apparaît :**
- Login avec krikri@virida.com / test1234
- **Step 1/32** — Carte EVE centrée : *"Salut ! Je suis EVE, ton assistante jardinage. Laisse-moi te faire visiter !"*
- Mascotte EVE animée (abeille qui flotte)
- Bouton "Commencer la visite →"

**Action de Christophe :**
- Taper l'email et le mot de passe (geste naturel)
- Lire le message d'EVE, sourire
- Appuyer sur "Commencer la visite"

> 💡 **Astuce tournage :** pré-remplir l'email pour que le geste soit rapide. Ne filmer que le tap sur "Connexion" et le welcome EVE.

---

### ÉCRAN 3 — Dashboard — Capteurs en live (6 sec)
**Ce qui doit s'afficher (données réelles Pi) :**

| Capteur | Valeur attendue | Statut |
|---------|----------------|--------|
| Température | ~24-25°C | ✅ |
| Humidité air | ~65-75% | ✅ |
| pH solution | ~5.5-7.0 | ✅ |
| Luminosité | variable | ✅ |
| Humidité sol | ⚠️ 100% (capteur érodé) | 🔴 ← parfait pour scénario 4 |

**Action de Christophe :**
- Faire un lent scroll du dashboard vers le bas
- S'arrêter sur les cartes capteurs
- Expression : satisfaction, "tout est là d'un coup d'œil"

**Texte à voix off (si keynote avec VO) :**
> "Une seule vue. L'état complet de la serre. En temps réel."

---

## 🎥 SETUP TECHNIQUE

### Matériel
- **Tablette :** iPad Pro 12.9" ou Samsung Tab S9
- **Appareil :** iPhone 15 Pro mode Cinématique OU Sony A7 + 50mm f/1.8
- **Stabilisateur :** Gimbal recommandé (le splash screen = plan fixe, mais les autres ont du mouvement)
- **Lumière :** LEDs serre à 60-70% (pas trop fort pour ne pas surexposer l'écran tablette)

### Cadrage type
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   [Tablette en portrait ou paysage selon résolution]     │
│                                                          │
│         👐 Mains Christophe                             │
│              Tablette inclinée 25° vers caméra          │
│                                                          │
│  ░░░░░░░░ Serre floue ░░░░░░░░░░░░░░░░░░░               │
│  (plants tomates/basilic, LED verte, rack)              │
└──────────────────────────────────────────────────────────┘
```

### Réglages
- **Expo tablette :** 65% de luminosité (éviter surexposition de l'écran)
- **FPS caméra :** 25 fps (keynote) ou 60 fps (pour slow motion sur le splash)
- **Balance des blancs :** Manuel, réglé sur le vert LED de la serre (~4200K)

---

## ✅ CHECKLIST AVANT TOURNAGE

### La veille
- [ ] app.virida.org rechargé → vérifier que le splash screen s'affiche (3 secondes, logo animé, barre verte)
- [ ] krikri@virida.com / test1234 → connexion OK
- [ ] Déconnexion avant le tournage (pour que le splash s'affiche)
- [ ] Historique de navigation vidé sur la tablette
- [ ] Onboarding EVE réinitialisé → **Paramètres → "Relancer la visite guidée"**
- [ ] Tablette chargée 100% + mode Ne pas déranger

### Le matin du tournage
- [ ] Pi en marche et données en live :
  ```
  ssh virida@100.97.47.46 'sudo systemctl status virida-api --no-pager'
  ```
- [ ] Dashboard : au moins température + pH + lumière visibles
- [ ] Ouvrir un onglet sur app.virida.org sans être connecté → prêt pour le splash

### Sur le plateau
- [ ] Test d'une prise splash screen avant le tournage officiel
- [ ] Vérifier l'absence de reflets de la LED serre sur la vitre de la tablette
- [ ] Vérifier que les notifications systèmes (WhatsApp, email) ne coupent pas le splash

---

## 🎙️ DIRECTION DE JEU — CHRISTOPHE

**Splash screen :**
> "C'est la première fois que tu ouvres l'app. Tu attends que ça charge. Ton regard suit doucement la barre verte. C'est élégant. Tu es curieux de ce qui va suivre."

**Landing page :**
> "Tu lis le titre. 'Cultivez le futur. Laissez EVE faire le reste.' Tu hocheses la tête — c'est exactement ce que tu cherchais. Tu appuies sur le bouton vert."

**Welcome EVE :**
> "EVE apparaît. C'est ton assistante. Elle est là pour toi. Tu souris. Tu appuies sur Commencer la visite."

**Dashboard live :**
> "Tu vois ta serre. Tout. D'un coup d'œil. 24°C, pH 6.2, lumière OK. Tu soupires de soulagement. Tout va bien."

---

## 🗂️ ORGANISATION DES FICHIERS RUSHES

```
virida_storytelling_shoots/
└── scenario1_decouverte/
    ├── ecran0_splash_logo/
    │   ├── prise_01.mp4  ← fixe, tablette des deux mains
    │   ├── prise_02.mp4  ← légèrement de côté
    │   └── prise_03.mp4  ← meilleure
    ├── ecran1_landing/
    ├── ecran2_welcome_eve/
    └── ecran3_dashboard_live/
```

---

## ⏱️ TIMING DE TOURNAGE

| Étape | Durée estimée |
|-------|---------------|
| Setup tablette + vérifications | 10 min |
| Écran 0 — Splash logo (5 prises) | 10 min |
| Écran 1 — Landing page (3 prises) | 8 min |
| Écran 2 — Login + Welcome EVE (5 prises) | 15 min |
| Écran 3 — Dashboard live (5 prises) | 15 min |
| **TOTAL** | **~60 min** |

---

## 🎵 MUSIQUE SUGGÉRÉE (post-prod)

- Type : Doux, curiosité, découverte
- Référence : Bonobo — "Kerala" ou "Cirrus"
- BPM : 80-90
- Pas de lyrics
- Intro silencieuse sur le splash (0.5s), puis musique qui monte

---

*Document créé le 2026-05-21 · Équipe Virida*
*Splash screen logo Virida animé déployé sur app.virida.org le 2026-05-21*
