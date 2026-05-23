#!/usr/bin/env python3
"""
benchmark_stream_ihm_v3.py — Benchmark EVE v3 : questions ultra-naturelles utilisateurs réels
90 questions — 16 catégories — personas débutant/amateur/expert/enfant/vocal

Focus : formulations exactement comme un vrai utilisateur les tape dans l'IHM —
  abréviations, fautes, langage SMS, questions implicites, urgence, suivi temporel,
  combinaisons plante+capteur, croissance, caméra, pédagogie, jardinage général.

Catégories :
  plant_named      — questions sur une plante nommée (tomate, basilic...)
  plant_health     — santé / diagnostic plante spécifique
  plant_compare    — comparaison entre plantes
  temporal         — "depuis hier", "ça fait 3 jours", "ce matin"
  urgence          — "c'est grave ?", "que faire maintenant ?"
  implicit         — "est-ce normal que...", "pourquoi ça..."
  combined         — plante + capteur dans même question
  followup         — questions de suivi après alerte
  typo             — fautes d'orthographe / SMS / abréviations
  voice            — questions comme si parlées à voix haute
  multi_context    — combinaison riche de plusieurs éléments
  croissance       — accélération croissance, floraison, fruits
  vision_camera    — analyse visuelle, taches, suggestion caméra
  pedagogie        — EVE professeur/compagnon, enfants, bases hydroponie
  jardinage_general— nouvelles plantes, conseils pratiques débutants
  offtopic         — hors périmètre EVE (scope: False)

Usage:
  python3 benchmark_stream_ihm_v3.py --verbose --save bench_v3.json
  python3 benchmark_stream_ihm_v3.py --cat croissance --verbose
  python3 benchmark_stream_ihm_v3.py --cat vision_camera --verbose
"""

import argparse, json, re, sys, time, urllib.request, urllib.error
from datetime import datetime
from typing import Optional

DEFAULT_API_URL = "https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io"
DEFAULT_EMAIL   = "krikri@virida.com"
DEFAULT_PASS    = "test1234"
STREAM_TIMEOUT  = 60

# Valeurs inventées = hallucination prouvée
HALLUC_PATTERNS = [
    r'\bpH\s*[:\s]*6\.0\b', r'\bph\s*[:\s]*6\b(?!\.\d)',
    r'\bTDS\s*[:\s]*287\b', r'\btempérature\s*[:\s]*25\s*°?[Cc]\b(?!.*capteur)',
    r'\bhumidité\s*[:\s]*100\s*%.*optimal',
    r'Enserreuse',  # hallucination connue Qwen
]

# ─── Questions ────────────────────────────────────────────────────────────────

QUESTIONS = [

    # ══════════════════════════════════════════════════════════════════════
    # 1. PLANTE NOMMÉE — variations naturelles de "comment va ma tomate"
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V01", "cat": "plant_named",
     "q": "comment vont mes tomates cerises dans ma serre stp ?",
     "kw": ["tomate", "ph", "stade", "santé", "condition"], "scope": True,
     "note": "Question IHM screenshot — déclencheur du benchmark v3"},

    {"id": "V02", "cat": "plant_named",
     "q": "comment va mon basilic ?",
     "kw": ["basilic", "ph", "condition", "stade"], "scope": True},

    {"id": "V03", "cat": "plant_named",
     "q": "ma tomate cerise elle va bien ?",
     "kw": ["tomate", "cerise", "ph", "stade"], "scope": True},

    {"id": "V04", "cat": "plant_named",
     "q": "est-ce que mon basilic se porte bien ?",
     "kw": ["basilic", "ph", "condition"], "scope": True},

    {"id": "V05", "cat": "plant_named",
     "q": "ma tomate elle aime les conditions actuelles ?",
     "kw": ["tomate", "ph", "condition", "optimal"], "scope": True},

    {"id": "V06", "cat": "plant_named",
     "q": "t'as des infos sur ma tomate cerise ?",
     "kw": ["tomate", "cerise", "stade", "santé"], "scope": True},

    {"id": "V07", "cat": "plant_named",
     "q": "dis moi tout sur mon basilic stp",
     "kw": ["basilic", "stade", "ph", "condition"], "scope": True},

    {"id": "V08", "cat": "plant_named",
     "q": "c'est quoi l'état de mes tomates cerises",
     "kw": ["tomate", "cerise", "stade", "ph"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 2. SANTÉ / DIAGNOSTIC PLANTE SPÉCIFIQUE
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V09", "cat": "plant_health",
     "q": "ma tomate cerise souffre-t-elle des conditions actuelles ?",
     "kw": ["tomate", "cerise", "ph", "condition", "souffre"], "scope": True},

    {"id": "V10", "cat": "plant_health",
     "q": "est-ce que le pH actuel nuit à mes tomates cerises ?",
     "kw": ["ph", "tomate", "cerise", "acide", "4."], "scope": True},

    {"id": "V11", "cat": "plant_health",
     "q": "mes tomates cerises sont-elles en danger avec ce pH ?",
     "kw": ["ph", "tomate", "danger", "acide", "4."], "scope": True},

    {"id": "V12", "cat": "plant_health",
     "q": "mon basilic peut-il pousser dans ces conditions ?",
     "kw": ["basilic", "ph", "condition", "pousse"], "scope": True},

    {"id": "V13", "cat": "plant_health",
     "q": "est-ce que mes plantes sont stressées là ?",
     "kw": ["ph", "stress", "condition", "capteur"], "scope": True},

    {"id": "V14", "cat": "plant_health",
     "q": "mes tomates elles risquent quoi avec un pH aussi bas ?",
     "kw": ["ph", "tomate", "risque", "racine", "4."], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 3. COMPARAISON ENTRE PLANTES
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V15", "cat": "plant_compare",
     "q": "qui s'en sort mieux entre ma tomate et mon basilic ?",
     "kw": ["tomate", "basilic", "stade", "santé"], "scope": True},

    {"id": "V16", "cat": "plant_compare",
     "q": "laquelle de mes plantes souffre le plus en ce moment ?",
     "kw": ["tomate", "basilic", "ph", "condition"], "scope": True},

    {"id": "V17", "cat": "plant_compare",
     "q": "mes deux plantes vont-elles bien ?",
     "kw": ["tomate", "basilic", "stade", "ph"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 4. TEMPOREL — "depuis hier", "ça fait X jours", "ce matin"
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V18", "cat": "temporal",
     "q": "ça fait 3 jours que j'ai pas arrosé c'est grave ?",
     "kw": ["arros", "sol", "humidité", "urgence"], "scope": True},

    {"id": "V19", "cat": "temporal",
     "q": "ce matin le pH était bon maintenant il est comment ?",
     "kw": ["ph", "4.", "acide", "valeur"], "scope": True},

    {"id": "V20", "cat": "temporal",
     "q": "depuis hier mes feuilles jaunissent c'est quoi ?",
     "kw": ["jauni", "azote", "carence", "feuille"], "scope": True},

    {"id": "V21", "cat": "temporal",
     "q": "j'ai planté ma tomate cerise il y a 2 semaines, elle est à quel stade ?",
     "kw": ["tomate", "stade", "seedling", "végétatif", "plantule"], "scope": True},

    {"id": "V22", "cat": "temporal",
     "q": "ça fait combien de temps avant que je puisse récolter mes tomates ?",
     "kw": ["récolte", "jour", "stade", "tomate"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 5. URGENCE — "c'est grave ?", "que faire maintenant ?"
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V23", "cat": "urgence",
     "q": "le pH est à 4.49 c'est grave pour mes plantes ??",
     "kw": ["ph", "4.", "grave", "racine", "acide", "urgent"], "scope": True},

    {"id": "V24", "cat": "urgence",
     "q": "que faire en urgence là pour ma serre ?",
     "kw": ["ph", "urgent", "ajoute", "corriger", "action"], "scope": True},

    {"id": "V25", "cat": "urgence",
     "q": "j'ai des alertes critiques que faire maintenant ?",
     "kw": ["ph", "critique", "ajoute", "action", "urgent"], "scope": True},

    {"id": "V26", "cat": "urgence",
     "q": "SOS ma serre va pas bien du tout !",
     "kw": ["ph", "critique", "alerte", "action"], "scope": True},

    {"id": "V27", "cat": "urgence",
     "q": "mes tomates vont mourir si je fais rien ?",
     "kw": ["ph", "tomate", "acide", "racine", "action"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 6. QUESTIONS IMPLICITES — "est-ce normal que...", "pourquoi..."
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V28", "cat": "implicit",
     "q": "est-ce normal que mes feuilles soient toutes molles ?",
     "kw": ["caméra", "symptôme", "visuel", "feuille", "diagnostic"], "scope": True},

    {"id": "V29", "cat": "implicit",
     "q": "pourquoi mes tomates poussent pas vite ?",
     "kw": ["ph", "croissance", "nutriment", "lumière"], "scope": True},

    {"id": "V30", "cat": "implicit",
     "q": "c'est normal que la lumière soit aussi faible ?",
     "kw": ["lux", "lumière", "led", "obscurité", "24."], "scope": True},

    {"id": "V31", "cat": "implicit",
     "q": "pourquoi mon basilic ne pousse presque plus ?",
     "kw": ["ph", "basilic", "croissance", "nutriment"], "scope": True},

    {"id": "V32", "cat": "implicit",
     "q": "est-ce que 60% d'humidité c'est bien pour mes plantes ?",
     "kw": ["humidité", "60", "optimal", "plante"], "scope": True},

    {"id": "V33", "cat": "implicit",
     "q": "est-ce que 27°C c'est trop chaud pour du basilic ?",
     "kw": ["température", "basilic", "27", "optimal", "chaud"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 7. COMBINÉ — plante + capteur dans même question
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V34", "cat": "combined",
     "q": "le pH de 4.49 c'est bon ou pas pour mes tomates cerises ?",
     "kw": ["ph", "4.", "tomate", "acide", "optimal"], "scope": True},

    {"id": "V35", "cat": "combined",
     "q": "avec 27°C dans la serre est-ce que mon basilic est bien ?",
     "kw": ["température", "basilic", "27", "optimal"], "scope": True},

    {"id": "V36", "cat": "combined",
     "q": "ma tomate cerise a besoin de combien de lux par jour ?",
     "kw": ["lux", "lumière", "tomate", "heure", "led"], "scope": True},

    {"id": "V37", "cat": "combined",
     "q": "le TDS est correct pour la phase végétative de ma tomate ?",
     "kw": ["tds", "ppm", "tomate", "végétatif", "nutriment"], "scope": True},

    {"id": "V38", "cat": "combined",
     "q": "avec ce pH est-ce que mon basilic peut absorber les nutriments ?",
     "kw": ["ph", "basilic", "absorption", "nutriment", "4."], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 8. SUIVI APRÈS ALERTE — questions qui arrivent après avoir vu une alerte
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V39", "cat": "followup",
     "q": "j'ai ajouté du pH+ hier, le pH est remonté ?",
     "kw": ["ph", "4.", "valeur", "remonte", "actuel"], "scope": True},

    {"id": "V40", "cat": "followup",
     "q": "combien de pH+ je dois ajouter pour remonter à 6 ?",
     "kw": ["ph+", "correction", "augment", "solution"], "scope": True},

    {"id": "V41", "cat": "followup",
     "q": "après avoir corrigé le pH combien de temps attendre avant de voir des résultats ?",
     "kw": ["ph", "correction", "temps", "attendre", "résultat"], "scope": True},

    {"id": "V42", "cat": "followup",
     "q": "j'ai arrosé, l'humidité sol est toujours à 100% ?",
     "kw": ["humidité", "sol", "100", "arros"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 9. TYPOS & SMS — fautes + abréviations fréquentes
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V43", "cat": "typo",
     "q": "cmt va ma tomate cerise stp",
     "kw": ["tomate", "cerise", "stade", "ph"], "scope": True,
     "note": "SMS court avec abréviation 'cmt'"},

    {"id": "V44", "cat": "typo",
     "q": "le ph est a combian la ?",
     "kw": ["ph", "4.", "acide"], "scope": True,
     "note": "Faute 'combian' au lieu de 'combien'"},

    {"id": "V45", "cat": "typo",
     "q": "ya un prob dans ma sere ?",
     "kw": ["ph", "critique", "alerte", "problème"], "scope": True,
     "note": "Faute 'sere' au lieu de 'serre'"},

    {"id": "V46", "cat": "typo",
     "q": "tomate cerise ok ?",
     "kw": ["tomate", "cerise", "stade", "ph"], "scope": True,
     "note": "Ultra court"},

    {"id": "V47", "cat": "typo",
     "q": "basilic ok ou pas ?",
     "kw": ["basilic", "stade", "ph", "condition"], "scope": True},

    {"id": "V48", "cat": "typo",
     "q": "kelé le ph actuel de ma solution ?",
     "kw": ["ph", "4.", "acide"], "scope": True,
     "note": "Phonétique SMS"},

    # ══════════════════════════════════════════════════════════════════════
    # 10. STYLE VOCAL — questions parlées, dictée vocale
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V49", "cat": "voice",
     "q": "eve dis moi comment vont mes tomates cerises dans ma serre",
     "kw": ["tomate", "cerise", "ph", "stade", "condition"], "scope": True},

    {"id": "V50", "cat": "voice",
     "q": "eve est-ce que le pH de la serre est bon pour mes plantes",
     "kw": ["ph", "4.", "acide", "plante", "optimal"], "scope": True},

    {"id": "V51", "cat": "voice",
     "q": "dis moi ce qui va pas dans ma serre en ce moment",
     "kw": ["ph", "critique", "alerte", "4."], "scope": True},

    {"id": "V52", "cat": "voice",
     "q": "eve j'ai besoin de savoir si mes plantes vont bien",
     "kw": ["tomate", "basilic", "ph", "stade", "condition"], "scope": True},

    {"id": "V53", "cat": "voice",
     "q": "qu'est-ce qui se passe dans ma serre là",
     "kw": ["ph", "critique", "serre", "alerte"], "scope": True},

    {"id": "V54", "cat": "voice",
     "q": "eve donne moi les dernières nouvelles de ma serre",
     "kw": ["ph", "critique", "capteur", "serre"], "scope": True},

    {"id": "V55", "cat": "voice",
     "q": "tout va bien dans ma serre aujourd'hui ?",
     "kw": ["ph", "critique", "ok", "alerte"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 11. MULTI-CONTEXTE — questions riches qui combinent plusieurs éléments
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V56", "cat": "multi_context",
     "q": "j'ai une tomate cerise en végétatif et un basilic, lequel a besoin d'attention maintenant ?",
     "kw": ["tomate", "basilic", "ph", "stade", "attention"], "scope": True},

    {"id": "V57", "cat": "multi_context",
     "q": "pH bas + lumière faible + sol humide c'est la catastrophe pour mes plantes ?",
     "kw": ["ph", "lumière", "sol", "plante", "critique"], "scope": True},

    {"id": "V58", "cat": "multi_context",
     "q": "ma tomate cerise est en végétatif, est-ce que le TDS actuel lui convient ?",
     "kw": ["tomate", "tds", "ppm", "végétatif", "nutriment"], "scope": True},

    {"id": "V59", "cat": "multi_context",
     "q": "j'ai planté du basilic et des tomates cerises, donne moi un bilan pour chaque plante",
     "kw": ["tomate", "basilic", "stade", "ph", "condition"], "scope": True},

    {"id": "V60", "cat": "multi_context",
     "q": "avec un pH de 4.49 et un TDS de 287 ppm, qu'est-ce qui risque d'arriver à mes plants ?",
     "kw": ["ph", "tds", "tomate", "racine", "nutriment", "blocage"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 12. CROISSANCE & ACCÉLÉRATION — comment faire pousser plus vite
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V61", "cat": "croissance",
     "q": "comment accélérer la croissance de mes tomates cerises ?",
     "kw": ["lumière", "ph", "nutriment", "tds", "croissance", "conseil"], "scope": True,
     "note": "Question clé growth acceleration"},

    {"id": "V62", "cat": "croissance",
     "q": "comment faire pousser ma salade plus vite dans la serre ?",
     "kw": ["lumière", "ph", "température", "nutriment", "croissance"], "scope": True},

    {"id": "V63", "cat": "croissance",
     "q": "je veux des fraises rapidement, que faire ?",
     "kw": ["fraise", "serre", "ajouter", "cultivez"],
     "kw_absent": ["ph 4", "19.17", "lux"],
     "scope": True,
     "note": "EVE doit signaler que fraise n'est pas dans la serre — ne pas appliquer les données capteurs"},

    {"id": "V64", "cat": "croissance",
     "q": "mes tomates cerises grandissent pas assez vite, c'est le pH ?",
     "kw": ["ph", "4.", "croissance", "acide", "nutriment", "tomate"], "scope": True},

    {"id": "V65", "cat": "croissance",
     "q": "comment faire pour que mes tomates cerises fleurissent ?",
     "kw": ["lumière", "tomate", "floraison", "fleur", "ph", "nutriment"], "scope": True},

    {"id": "V66", "cat": "croissance",
     "q": "quand est-ce que ma tomate cerise va faire ses premiers fruits ?",
     "kw": ["tomate", "stade", "fruit", "floraison", "jour", "semaine"], "scope": True},

    {"id": "V67", "cat": "croissance",
     "q": "c'est quoi le secret pour avoir de belles tomates cerises ?",
     "kw": ["ph", "lumière", "nutriment", "tds", "température", "tomate"], "scope": True},

    {"id": "V68", "cat": "croissance",
     "q": "ma fille veut voir des fruits dans la serre bientôt, c'est possible ?",
     "kw": ["tomate", "stade", "fruit", "floraison", "semaine"], "scope": True,
     "note": "Persona enfant implicite"},

    # ══════════════════════════════════════════════════════════════════════
    # 13. VISION CAMÉRA — suggestion d'analyse visuelle mobile
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V69", "cat": "vision_camera",
     "q": "mes feuilles ont des taches, c'est quoi ?",
     "kw": ["tache", "maladie", "champignon", "carence", "caméra"], "scope": True,
     "note": "Fast path maladie + suggestion caméra"},

    {"id": "V70", "cat": "vision_camera",
     "q": "j'ai une photo de ma plante tu peux analyser ?",
     "kw": ["caméra", "photo", "analyse", "vision"], "scope": True,
     "note": "Demande explicite caméra"},

    {"id": "V71", "cat": "vision_camera",
     "q": "mes feuilles jaunissent par le bas, tu vois ça ?",
     "kw": ["jauni", "azote", "carence", "caméra", "feuille"], "scope": True},

    {"id": "V72", "cat": "vision_camera",
     "q": "tu peux regarder ma tomate cerise et me dire ce qui va pas ?",
     "kw": ["caméra", "tomate", "analyse", "photo", "vision"], "scope": True},

    {"id": "V73", "cat": "vision_camera",
     "q": "mes tomates ont des feuilles qui se recroquevillent, c'est grave ?",
     "kw": ["feuille", "carence", "stress", "chaleur", "caméra"], "scope": True},

    {"id": "V74", "cat": "vision_camera",
     "q": "y a quelque chose de bizarre sur mes feuilles de basilic",
     "kw": ["tache", "maladie", "basilic", "caméra", "analyse"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 14. PÉDAGOGIE & ENFANT — EVE comme professeur/compagnon jardinière
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V75", "cat": "pedagogie",
     "q": "ma petite fille veut savoir comment la tomate cerise va grandir",
     "kw": ["tomate", "grandir", "stade", "fruit", "racine"], "scope": True,
     "note": "Persona enfant — EVE compagnon pédagogique"},

    {"id": "V76", "cat": "pedagogie",
     "q": "tu peux m'expliquer simplement c'est quoi le pH et pourquoi c'est important ?",
     "kw": ["ph", "acidité", "nutriment", "plante", "expliquer"], "scope": True},

    {"id": "V77", "cat": "pedagogie",
     "q": "comment la photosynthèse marche dans ma serre ?",
     "kw": ["lumière", "photosynthèse", "lux", "led", "plante", "énergie"], "scope": True},

    {"id": "V78", "cat": "pedagogie",
     "q": "dis à ma fille de 8 ans pourquoi les plantes ont besoin de lumière",
     "kw": ["lumière", "lux", "plante", "croissance", "énergie"], "scope": True,
     "note": "Persona enfant explicite — langue simple attendue"},

    {"id": "V79", "cat": "pedagogie",
     "q": "apprends moi les bases du jardinage hydroponique stp",
     "kw": ["hydroponie", "ph", "tds", "nutriment", "eau", "racine"], "scope": True},

    {"id": "V80", "cat": "pedagogie",
     "q": "mon fils veut comprendre comment marche la serre, tu peux expliquer ?",
     "kw": ["capteur", "ph", "serre", "expliquer", "plante", "eau"], "scope": True},

    {"id": "V81", "cat": "pedagogie",
     "q": "c'est quoi la différence entre le stade seedling et le stade végétatif ?",
     "kw": ["stade", "seedling", "végétatif", "plantule", "racine", "feuille"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 15. JARDINAGE GÉNÉRAL — conseils pratiques, nouvelles plantes
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V82", "cat": "jardinage_general",
     "q": "quelles plantes je peux faire pousser dans ma serre en ce moment ?",
     "kw": ["plante", "ph", "condition", "tomate", "basilic", "laitue"], "scope": True},

    {"id": "V83", "cat": "jardinage_general",
     "q": "est-ce que je peux planter de la laitue dans ma serre ?",
     "kw": ["laitue", "ph", "condition", "compatible", "serre"], "scope": True},

    {"id": "V84", "cat": "jardinage_general",
     "q": "quels légumes sont faciles à faire en hydroponie pour un débutant ?",
     "kw": ["hydroponie", "débutant", "légume", "facile", "laitue", "basilic"], "scope": True},

    {"id": "V85", "cat": "jardinage_general",
     "q": "je veux faire des herbes aromatiques, par où je commence ?",
     "kw": ["herbe", "aromatique", "basilic", "ph", "serre", "conseil"], "scope": True},

    {"id": "V86", "cat": "jardinage_general",
     "q": "comment préparer ma solution nutritive pour mon basilic ?",
     "kw": ["solution", "tds", "nutriment", "ph", "basilic", "eau"], "scope": True},

    {"id": "V87", "cat": "jardinage_general",
     "q": "est-ce que je peux faire pousser des fraises dans ma serre hydroponique ?",
     "kw": ["fraise", "ph", "hydroponie", "condition", "serre"], "scope": True},

    {"id": "V88", "cat": "jardinage_general",
     "q": "j'ai jamais fait de jardinage, par où commencer avec cette serre ?",
     "kw": ["débutant", "serre", "hydroponie", "ph", "nutriment", "conseil"], "scope": True,
     "note": "Persona débutant absolu"},

    # ══════════════════════════════════════════════════════════════════════
    # 16. HORS SUJET (scope: False) — EVE doit refuser poliment
    # ══════════════════════════════════════════════════════════════════════
    {"id": "V89", "cat": "offtopic",
     "q": "c'est quoi la meilleure recette de tarte aux tomates ?",
     "kw": [], "scope": False,
     "note": "Cuisine — hors périmètre EVE"},

    {"id": "V90", "cat": "offtopic",
     "q": "tu peux m'aider à faire mes devoirs de maths ?",
     "kw": [], "scope": False,
     "note": "Devoirs scolaires — hors périmètre"},
]


# ─── Auth + SSE helpers ────────────────────────────────────────────────────────

def login(api_url, email, password):
    url  = f"{api_url}/api/auth/login"
    data = json.dumps({"email": email, "password": password}).encode()
    req  = urllib.request.Request(url, data=data, method="POST",
                                   headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body  = json.loads(resp.read())
            token = (body.get("data", {}) or {}).get("token") or body.get("token")
            return token
    except Exception as e:
        print(f"❌ Login: {e}")
        return None


def call_stream(api_url, token, message):
    url     = f"{api_url}/api/eve/chat/stream"
    payload = json.dumps({"message": message}).encode()
    req     = urllib.request.Request(url, data=payload, method="POST",
                                      headers={"Content-Type": "application/json",
                                               "Authorization": f"Bearer {token}"})
    t0        = time.time()
    full_text = ""
    status    = "ok"
    try:
        with urllib.request.urlopen(req, timeout=STREAM_TIMEOUT) as resp:
            buf = b""
            for chunk in iter(lambda: resp.read(256), b""):
                buf += chunk
                while b"\n\n" in buf:
                    evt, buf = buf.split(b"\n\n", 1)
                    for line in evt.split(b"\n"):
                        line = line.strip()
                        if line.startswith(b"data:"):
                            try:
                                obj = json.loads(line[5:].strip())
                                full_text += obj.get("token", "")
                                if obj.get("done"):
                                    break
                            except Exception:
                                pass
    except urllib.error.HTTPError as e:
        status = f"http_{e.code}"
    except Exception as e:
        status = f"err:{type(e).__name__}"
    return full_text.strip(), round(time.time() - t0, 2), status


GENERIC = [
    "je ne peux pas", "désolé", "je suis désolé", "désolée", "je suis désolée",
    "informations non disponibles", "hors de mes capacités", "je ne sais pas",
    "impossible de répondre", "enserreuse", "je ne peux pas répondre",
]

def evaluate(answer, q, latency):
    a   = answer.lower()
    cat = q.get("cat", "")
    kw_hits = [kw for kw in q["kw"] if kw.lower() in a]
    generic  = any(p in a for p in GENERIC)
    halluc   = any(re.search(p, answer, re.IGNORECASE) for p in HALLUC_PATTERNS)

    # Pour offtopic, utile = refus poli (pas de contenu hors périmètre)
    if not q.get("scope", True):
        useful = bool(re.search(
            r'p[eé]rim[eè]tre|hors\s*(sujet|scope|domaine|comp[eé]tence)|ne\s*(pas|peux)|'
            r'sp[eé]cialis[eé]|serre|culture|jardinage|je\s+suis\s+eve', a))
        return {
            "useful": useful, "deterministic": latency <= 1.5, "hallucination": halluc,
            "actionnable": False, "generic": True,
            "mentions_real_ph": False, "kw_hit": 0, "kw_hits": [],
        }

    kw_absent_fail = any(kw.lower() in a for kw in q.get("kw_absent", []))
    useful   = len(kw_hits) > 0 and len(answer) > 25 and not generic and not kw_absent_fail
    det      = latency <= 1.5
    action   = bool(re.search(
        r'\b(ajout|corriger|arros|traiter|vérifi|activ|augment|diminu'
        r'|surveill|calibr|nettoyer|diluer|ventil|ajoute|active|vérifie'
        r'|commence|essaie|utilise|fais|lance|arrête|prends|utilise)\b', a))
    mentions_real_ph = bool(re.search(r'4\.4[0-9]', answer))
    # vision_camera : EVE doit suggérer la caméra
    suggests_camera = cat == "vision_camera" and bool(
        re.search(r'cam[eé]ra|photo|analyse\s*visuel|prends?\s*(une\s*)?photo|fonction\s*cam', a))
    # pedagogie : EVE doit expliquer simplement (pas de jargon lourd)
    pedagogie_ok = cat == "pedagogie" and len(answer) > 40 and bool(
        re.search(r'expliqu|imagine|pense|c\'est|comme\s*(si|un)', a))

    return {
        "useful": useful, "deterministic": det, "hallucination": halluc,
        "actionnable": action, "generic": generic,
        "mentions_real_ph": mentions_real_ph,
        "suggests_camera": suggests_camera,
        "pedagogie_ok": pedagogie_ok,
        "kw_hit": len(kw_hits), "kw_hits": kw_hits,
    }


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Benchmark EVE v3 — questions utilisateurs réels")
    parser.add_argument("--url",      default=DEFAULT_API_URL)
    parser.add_argument("--email",    default=DEFAULT_EMAIL)
    parser.add_argument("--password", default=DEFAULT_PASS)
    parser.add_argument("--save",     metavar="FILE")
    parser.add_argument("--baseline", metavar="FILE")
    parser.add_argument("--verbose",  "-v", action="store_true")
    parser.add_argument("--cat",      metavar="CAT")
    parser.add_argument("--delay",    type=float, default=1.5)
    args = parser.parse_args()

    print(f"\n{'='*72}")
    print(f"  BENCHMARK EVE v3 — Questions Utilisateurs Réels (90q/16cat) | {args.url}")
    print(f"{'='*72}\n")

    print(f"🔑 Login {args.email}... ", end="", flush=True)
    token = login(args.url, args.email, args.password)
    if not token:
        print("ÉCHEC"); sys.exit(1)
    print("OK ✅\n")

    questions = QUESTIONS
    if args.cat:
        questions = [q for q in questions if q["cat"] == args.cat]
        print(f"  → Catégorie: {args.cat} ({len(questions)} questions)\n")

    baseline = {}
    if args.baseline:
        try:
            with open(args.baseline) as f:
                for r in json.load(f).get("results", []):
                    baseline[r["id"]] = r
            print(f"📊 Baseline: {args.baseline} ({len(baseline)} entrées)\n")
        except Exception as e:
            print(f"⚠️ Baseline non chargée: {e}\n")

    results  = []
    cats     = {}
    t_useful = t_det = t_action = t_halluc = t_ph = t_generic = 0

    CAT_ICONS = {
        "plant_named":      "🌱",
        "plant_health":     "🩺",
        "plant_compare":    "⚖️",
        "temporal":         "⏱️",
        "urgence":          "🚨",
        "implicit":         "🤔",
        "combined":         "🔗",
        "followup":         "↩️",
        "typo":             "💬",
        "voice":            "🎙️",
        "multi_context":    "🧩",
        "croissance":       "🚀",
        "vision_camera":    "📷",
        "pedagogie":        "🎓",
        "jardinage_general":"🌿",
        "offtopic":         "🚫",
    }

    for i, q in enumerate(questions, 1):
        cat  = q["cat"]
        icon = CAT_ICONS.get(cat, "")
        note = f" [{q['note']}]" if q.get("note") else ""
        print(f"[{i:02d}/{len(questions)}] {q['id']} {icon}({cat}){note}")
        print(f"  Q: {q['q']}")

        answer, latency, status = call_stream(args.url, token, q["q"])
        ev = evaluate(answer, q, latency)

        sla_sym = "✅" if latency <= 1.5 else "🟡" if latency <= 8 else "🔴"
        ok_sym  = "✅" if ev["useful"] else "❌"
        det_sym = "⚡det" if ev["deterministic"] else "🤖llm"
        marks   = []
        if ev["hallucination"]:    marks.append("🎭HALLUC")
        if ev["generic"]:          marks.append("⚠️GEN")
        if ev["mentions_real_ph"]: marks.append("✅pH_réel")

        print(f"  {ok_sym} {det_sym} [{latency:.1f}s {sla_sym}] kw:{ev['kw_hit']} {' '.join(marks)} status={status}")

        if args.verbose:
            preview = answer[:240].replace('\n', ' ')
            print(f"  → {preview}{'...' if len(answer) > 240 else ''}")
        if ev["kw_hits"] and args.verbose:
            print(f"  🔑 {ev['kw_hits']}")

        if q["id"] in baseline:
            b     = baseline[q["id"]]
            was   = "✅" if b.get("useful") else "❌"
            now   = ok_sym
            delta = round(latency - b.get("latency", latency), 2)
            if was != now:
                print(f"  ⚡ RÉGRESSION? {was} → {now} Δ{delta:+.1f}s")
            elif was == "❌" and now == "✅":
                print(f"  ✅ AMÉLIORATION! {was} → {now}")
        print()

        t_useful  += ev["useful"]
        t_det     += ev["deterministic"]
        t_action  += ev["actionnable"]
        t_halluc  += ev["hallucination"]
        t_ph      += ev["mentions_real_ph"]
        t_generic += ev["generic"]

        if cat not in cats:
            cats[cat] = {"n": 0, "useful": 0, "halluc": 0, "action": 0,
                         "det": 0, "real_ph": 0, "lats": []}
        cats[cat]["n"]       += 1
        cats[cat]["useful"]  += ev["useful"]
        cats[cat]["halluc"]  += ev["hallucination"]
        cats[cat]["action"]  += ev["actionnable"]
        cats[cat]["det"]     += ev["deterministic"]
        cats[cat]["real_ph"] += ev["mentions_real_ph"]
        cats[cat]["lats"].append(latency)

        results.append({
            "id": q["id"], "cat": cat, "question": q["q"],
            "answer": answer, "latency": latency, "status": status, **ev
        })

        if args.delay > 0 and i < len(questions):
            time.sleep(args.delay)

    # ─── Résumé ───────────────────────────────────────────────────────────────
    n       = len(questions)
    all_lat = [r["latency"] for r in results]
    med_lat = sorted(all_lat)[len(all_lat) // 2]

    print(f"\n{'='*72}")
    print(f"  RÉSUMÉ GLOBAL — {n} questions")
    print(f"{'='*72}")
    print(f"  Utiles         : {t_useful}/{n} ({100*t_useful//n}%)")
    print(f"  Déterministes  : {t_det}/{n}   (fast path ≤1.5s)")
    print(f"  Actionnables   : {t_action}/{n}")
    print(f"  pH réel cité   : {t_ph}/{n}   (mentionne 4.4x)")
    print(f"  Hallucinations : {t_halluc}/{n}  {'✅ aucune' if t_halluc==0 else '🎭 PRÉSENTES !'}")
    print(f"  Génériques     : {t_generic}/{n}")
    print(f"  Latence med.   : {med_lat:.2f}s | max: {max(all_lat):.1f}s")

    print(f"\n  {'Cat.':<15} {CAT_ICONS.get('plant_named','')} {'Utiles':>6} {'Det':>5} {'Halluc':>7} {'pH_réel':>8} {'Médiane':>9}")
    print(f"  {'-'*62}")
    for cat_name, cs in cats.items():
        icon = CAT_ICONS.get(cat_name, " ")
        med  = sorted(cs["lats"])[len(cs["lats"]) // 2]
        h    = f"🎭{cs['halluc']}" if cs["halluc"] else "✅0"
        print(f"  {icon}{cat_name:<14} {cs['useful']}/{cs['n']:>2}  {cs['det']}/{cs['n']:>2}  {h:>8}  {cs['real_ph']}/{cs['n']:>2}   {med:>6.1f}s")

    # Liste des questions échouées
    failed = [r for r in results if not r["useful"]]
    if failed:
        print(f"\n  QUESTIONS ÉCHOUÉES ({len(failed)}) :")
        for r in failed:
            icon = CAT_ICONS.get(r["cat"], "")
            print(f"  ❌ {r['id']} {icon} — {r['question'][:65]}")
            marks = []
            if r["hallucination"]: marks.append("🎭HALLUC")
            if r["generic"]:       marks.append("⚠️GEN")
            print(f"       {' '.join(marks) or 'kw_hit=0'} [{r['latency']:.1f}s] → {r['answer'][:80].replace(chr(10),' ')}...")

    print(f"{'='*72}\n")

    if args.save:
        out = {
            "timestamp": datetime.now().isoformat(), "url": args.url,
            "n_questions": n, "useful": t_useful, "deterministic": t_det,
            "actionnable": t_action, "hallucinations": t_halluc,
            "generic": t_generic, "median_latency": med_lat,
            "results": results,
        }
        with open(args.save, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        print(f"💾 Résultats sauvegardés: {args.save}")


if __name__ == "__main__":
    main()
