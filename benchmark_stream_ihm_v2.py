#!/usr/bin/env python3
"""
benchmark_stream_ihm_v2.py — Benchmark EVE v2 : personas réalistes + langage naturel

5 Personas :
  - debutant  : Léa, 28 ans, premier jardin indoor, vocab limité, fautes possibles
  - amateur   : Marc, 45 ans, jardine depuis 5 ans, connait les bases
  - expert    : Camille, 35 ans, hydroponie avancée, questions techniques
  - urgent    : Paul, messages ultra-courts, pas le temps
  - curieux   : Sophie, explore les fonctionnalités, questions de connaissances

Métriques v2 :
  - useful       : réponse pertinente (kw_hit > 0, len > 30, non générique)
  - deterministic: fast path détecté (latence ≤ 1.5s — heuristique)
  - no_halluc    : pas de valeurs numériques inventées connues (pH 6, TDS 287, etc.)
  - actionnable  : contient un verbe d'action explicite
  - correct_scope: EVE refuse les hors-scope ET répond aux in-scope (pas de faux refus)

Usage:
  python3 benchmark_stream_ihm_v2.py [--url URL] [--save FILE] [--baseline FILE]
  python3 benchmark_stream_ihm_v2.py --cat maladies --verbose
  python3 benchmark_stream_ihm_v2.py --persona debutant --verbose
"""

import argparse
import json
import re
import sys
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime
from typing import Optional

# ─── Configuration ─────────────────────────────────────────────────────────────

DEFAULT_API_URL = "https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io"
DEFAULT_EMAIL   = "krikri@virida.com"
DEFAULT_PASS    = "test1234"
STREAM_TIMEOUT  = 60

# Valeurs numériques inventées = hallucination prouvée (si dans une réponse capteur)
HALLUCINATION_MARKERS = [
    r'\bpH\s*[:\s]*6\.0\b', r'\bph\s*[:\s]*6\b', r'\bpH\s*6\b',
    r'\bTDS\s*[:\s]*287\b', r'\btds\s*[:\s]*287\b',
    r'\bhumidité\s*[:\s]*100%', r'\btempérature\s*[:\s]*25\s*°?[Cc]',
    r'\b25\s*°C\b.*optimal', r'\bTDS\s*287\s*ppm\b',
]

# ─── Personas ──────────────────────────────────────────────────────────────────

PERSONAS = {
    "debutant": {
        "name": "Léa",
        "desc": "28 ans, premier jardin indoor, vocabulaire limité, curieuse",
        "icon": "🌱",
    },
    "amateur": {
        "name": "Marc",
        "desc": "45 ans, jardine depuis 5 ans, connait les bases de l'hydroponie",
        "icon": "🌿",
    },
    "expert": {
        "name": "Camille",
        "desc": "35 ans, hydroponie avancée, veut les corrélations précises",
        "icon": "🧪",
    },
    "urgent": {
        "name": "Paul",
        "desc": "Utilisateur pressé, messages très courts, veut l'info vite",
        "icon": "⚡",
    },
    "curieux": {
        "name": "Sophie",
        "desc": "Explore les fonctionnalités d'EVE, questions de connaissance générale",
        "icon": "🔍",
    },
}

# ─── Questions benchmark v2 ────────────────────────────────────────────────────
# 11 catégories × 4-6 questions = ~55 questions
# Chaque question : id, cat, persona, q, kw (mots-clés attendus), expect_scope

QUESTIONS = [

    # ══════════════════════════════════════════════════════════════
    # 1. CAPTEURS DIRECTS — questions formelles sur les valeurs IoT
    # ══════════════════════════════════════════════════════════════
    {"id": "Q01", "cat": "capteurs_direct", "persona": "amateur",
     "q": "Quel est le pH actuel de la solution nutritive ?",
     "kw": ["ph", "4.", "5.", "acide", "bas"], "scope": True},

    {"id": "Q02", "cat": "capteurs_direct", "persona": "expert",
     "q": "Quelle est la température exacte dans la serre en ce moment ?",
     "kw": ["°c", "température", "27", "28", "chaud", "optimal"], "scope": True},

    {"id": "Q03", "cat": "capteurs_direct", "persona": "amateur",
     "q": "Quelle est l'humidité de l'air dans la serre ?",
     "kw": ["%", "humidité", "air", "optimal"], "scope": True},

    {"id": "Q04", "cat": "capteurs_direct", "persona": "expert",
     "q": "Quelle est la valeur TDS de la solution nutritive ?",
     "kw": ["tds", "ppm", "nutriment", "concentration"], "scope": True},

    {"id": "Q05", "cat": "capteurs_direct", "persona": "amateur",
     "q": "Combien de lux y a-t-il dans ma serre en ce moment ?",
     "kw": ["lux", "lumière", "led", "éclairage"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 2. CAPTEURS INFORMELS — langage naturel / SMS / urgent
    # ══════════════════════════════════════════════════════════════
    {"id": "Q06", "cat": "capteurs_informel", "persona": "urgent",
     "q": "le ph ?",
     "kw": ["ph", "4.", "acide", "bas"], "scope": True},

    {"id": "Q07", "cat": "capteurs_informel", "persona": "urgent",
     "q": "temp serre",
     "kw": ["°c", "température", "27", "28"], "scope": True},

    {"id": "Q08", "cat": "capteurs_informel", "persona": "debutant",
     "q": "c'est quoi le niveau de lumière stp",
     "kw": ["lux", "lumière", "led"], "scope": True},

    {"id": "Q09", "cat": "capteurs_informel", "persona": "debutant",
     "q": "ya combien de ppm dans l'eau",
     "kw": ["tds", "ppm", "nutriment"], "scope": True},

    {"id": "Q10", "cat": "capteurs_informel", "persona": "urgent",
     "q": "humidité ?",
     "kw": ["%", "humidité", "optimal"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 3. DIAGNOSTIC GLOBAL — résumé, bilan, état général
    # ══════════════════════════════════════════════════════════════
    {"id": "Q11", "cat": "diagnostic", "persona": "urgent",
     "q": "ça va la serre ?",
     "kw": ["ph", "critique", "alerte", "capteur"], "scope": True},

    {"id": "Q12", "cat": "diagnostic", "persona": "urgent",
     "q": "résumé stp",
     "kw": ["ph", "critique", "serre", "capteur"], "scope": True},

    {"id": "Q13", "cat": "diagnostic", "persona": "expert",
     "q": "Fais-moi un diagnostic complet de la serre avec tous les capteurs",
     "kw": ["ph", "température", "diagnostic", "capteur"], "scope": True},

    {"id": "Q14", "cat": "diagnostic", "persona": "debutant",
     "q": "tout est ok dans ma serre ?",
     "kw": ["ph", "critique", "ok", "alerte"], "scope": True},

    {"id": "Q15", "cat": "diagnostic", "persona": "amateur",
     "q": "donne moi un bilan de ma serre",
     "kw": ["ph", "capteur", "serre"], "scope": True},

    {"id": "Q16", "cat": "diagnostic", "persona": "debutant",
     "q": "dis moi si mes plantes vont bien",
     "kw": ["ph", "capteur", "plante", "serre"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 4. CAPTEURS HORS OPTIMAL — qu'est-ce qui va mal ?
    # ══════════════════════════════════════════════════════════════
    {"id": "Q17", "cat": "hors_optimal", "persona": "amateur",
     "q": "Quels capteurs sont en dehors des valeurs optimales ?",
     "kw": ["ph", "4.", "critique", "optimal"], "scope": True},

    {"id": "Q18", "cat": "hors_optimal", "persona": "debutant",
     "q": "ya des problèmes dans ma serre ?",
     "kw": ["ph", "critique", "problème", "alerte"], "scope": True},

    {"id": "Q19", "cat": "hors_optimal", "persona": "urgent",
     "q": "c'est quoi les alertes ?",
     "kw": ["ph", "critique", "alerte"], "scope": True},

    {"id": "Q20", "cat": "hors_optimal", "persona": "expert",
     "q": "Quels paramètres sont hors des seuils recommandés pour mes cultures ?",
     "kw": ["ph", "seuil", "capteur", "critique"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 5. LISTE PLANTES — quoi dans la serre
    # ══════════════════════════════════════════════════════════════
    {"id": "Q21", "cat": "plantes_liste", "persona": "debutant",
     "q": "ya quoi comme plante dans ma serre stp",
     "kw": ["tomate", "basilic", "serre", "plante"], "scope": True},

    {"id": "Q22", "cat": "plantes_liste", "persona": "urgent",
     "q": "mes plantes",
     "kw": ["tomate", "basilic", "plante"], "scope": True},

    {"id": "Q23", "cat": "plantes_liste", "persona": "curieux",
     "q": "qu'est-ce qui pousse dans ma serre en ce moment ?",
     "kw": ["tomate", "basilic", "plante", "pousse"], "scope": True},

    {"id": "Q24", "cat": "plantes_liste", "persona": "amateur",
     "q": "liste toutes mes cultures actuelles",
     "kw": ["tomate", "basilic", "culture", "serre"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 6. PLANTES SPÉCIFIQUES — tomate cerise & basilic
    # ══════════════════════════════════════════════════════════════
    {"id": "Q25", "cat": "plantes_spec", "persona": "amateur",
     "q": "Comment va ma tomate cerise ?",
     "kw": ["tomate", "cerise", "ph", "stade", "santé"], "scope": True},

    {"id": "Q26", "cat": "plantes_spec", "persona": "debutant",
     "q": "est-ce que mon basilic souffre des conditions actuelles ?",
     "kw": ["basilic", "ph", "condition", "température"], "scope": True},

    {"id": "Q27", "cat": "plantes_spec", "persona": "debutant",
     "q": "ma tomate cerise elle aime les conditions qu'il y a là ?",
     "kw": ["tomate", "cerise", "ph", "condition"], "scope": True},

    {"id": "Q28", "cat": "plantes_spec", "persona": "debutant",
     "q": "quand je pourrai récolter mes tomates ?",
     "kw": ["récolte", "jour", "stade", "plante"], "scope": True},

    {"id": "Q29", "cat": "plantes_spec", "persona": "expert",
     "q": "Quel est le stade de croissance actuel de mes cultures ?",
     "kw": ["stade", "seedling", "végétatif", "croissance"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 7. MALADIES & SYMPTÔMES — langage naturel utilisateur
    # ══════════════════════════════════════════════════════════════
    {"id": "Q30", "cat": "maladies", "persona": "debutant",
     "q": "j'ai une poudre blanche sur mes feuilles c'est quoi",
     "kw": ["oïdium", "champignon", "fongique", "traitement"], "scope": True},

    {"id": "Q31", "cat": "maladies", "persona": "debutant",
     "q": "mes feuilles jaunissent par le bas que faire",
     "kw": ["azote", "carence", "jaune", "nutrition"], "scope": True},

    {"id": "Q32", "cat": "maladies", "persona": "amateur",
     "q": "le bout de mes tomates devient tout noir et marron c'est grave ?",
     "kw": ["nécrose", "apicale", "calcium", "bout"], "scope": True},

    {"id": "Q33", "cat": "maladies", "persona": "amateur",
     "q": "j'observe des taches brunes avec un contour jaune sur les feuilles",
     "kw": ["mildiou", "fongique", "tache", "traitement"], "scope": True},

    {"id": "Q34", "cat": "maladies", "persona": "debutant",
     "q": "ya des petits insectes verts sur mes plants",
     "kw": ["puceron", "insecte", "traitement", "savon"], "scope": True},

    {"id": "Q35", "cat": "maladies", "persona": "debutant",
     "q": "mes plantes ont l'air malades pourquoi ?",
     "kw": ["ph", "symptôme", "maladie", "carence", "traitement"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 8. RECOMMANDATIONS HORTICOLES — conseils d'action
    # ══════════════════════════════════════════════════════════════
    {"id": "Q36", "cat": "recommandations", "persona": "amateur",
     "q": "Comment corriger un pH trop bas dans ma solution ?",
     "kw": ["ph+", "correction", "augment", "bicarbonate"], "scope": True},

    {"id": "Q37", "cat": "recommandations", "persona": "expert",
     "q": "Quel engrais NPK utiliser pour mes tomates cerises en phase végétative ?",
     "kw": ["npk", "azote", "engrais", "végétatif"], "scope": True},

    {"id": "Q38", "cat": "recommandations", "persona": "amateur",
     "q": "Combien d'heures de lumière par jour pour des tomates cerises ?",
     "kw": ["heure", "lumière", "led", "lux", "tomate"], "scope": True},

    {"id": "Q39", "cat": "recommandations", "persona": "curieux",
     "q": "Comment améliorer la pollinisation dans ma serre fermée ?",
     "kw": ["pollinat", "vibration", "pinceau", "ventilateur"], "scope": True},

    {"id": "Q40", "cat": "recommandations", "persona": "expert",
     "q": "Mon capteur pH dérive, comment procéder à sa calibration ?",
     "kw": ["calibr", "tampon", "kcl", "dérive", "électrode"], "scope": True},

    {"id": "Q41", "cat": "recommandations", "persona": "debutant",
     "q": "j'ai oublié d'arroser depuis 3 jours c'est grave ?",
     "kw": ["arros", "humidité", "sol", "urgence"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 9. CORRÉLATIONS MULTI-CAPTEURS — raisonnement cause-effet
    # ══════════════════════════════════════════════════════════════
    {"id": "Q42", "cat": "correlations", "persona": "expert",
     "q": "Le pH est bas et le TDS est élevé simultanément, est-ce dangereux pour mes racines ?",
     "kw": ["ph", "tds", "blocage", "racine", "nutriment"], "scope": True},

    {"id": "Q43", "cat": "correlations", "persona": "amateur",
     "q": "L'humidité est haute et la température basse, que risque-je comme maladie ?",
     "kw": ["mildiou", "botrytis", "fongique", "ventilation"], "scope": True},

    {"id": "Q44", "cat": "correlations", "persona": "expert",
     "q": "Pourquoi mes plantes n'absorbent-elles pas les nutriments malgré un TDS élevé ?",
     "kw": ["ph", "absorption", "blocage", "nutriment"], "scope": True},

    {"id": "Q45", "cat": "correlations", "persona": "amateur",
     "q": "sol sec, chaleur et faible humidité en même temps — que se passe-t-il ?",
     "kw": ["stress", "dessiccation", "arros", "urgent"], "scope": True},

    # ══════════════════════════════════════════════════════════════
    # 10. HORS-SCOPE — EVE doit refuser poliment
    # ══════════════════════════════════════════════════════════════
    {"id": "Q46", "cat": "hors_scope", "persona": "debutant",
     "q": "donne moi une recette de sauce tomate",
     "kw": ["hors", "périmètre", "culture", "serre"], "scope": False},

    {"id": "Q47", "cat": "hors_scope", "persona": "curieux",
     "q": "qui va gagner la ligue 1 cette saison ?",
     "kw": ["hors", "périmètre", "serre", "jardinage"], "scope": False},

    {"id": "Q48", "cat": "hors_scope", "persona": "urgent",
     "q": "météo Paris demain",
     "kw": ["hors", "périmètre", "météo", "serre"], "scope": False},

    {"id": "Q49", "cat": "hors_scope", "persona": "curieux",
     "q": "c'est quoi le bitcoin ?",
     "kw": ["hors", "périmètre", "serre"], "scope": False},

    # ══════════════════════════════════════════════════════════════
    # 11. IDENTITÉ EVE & UX — qui est EVE, que peut-elle faire
    # ══════════════════════════════════════════════════════════════
    {"id": "Q50", "cat": "identite", "persona": "debutant",
     "q": "bonjour !",
     "kw": ["bonjour", "eve", "serre", "aide"], "scope": True},

    {"id": "Q51", "cat": "identite", "persona": "curieux",
     "q": "qui t'a créée ?",
     "kw": ["virida", "eve", "assistante", "créée"], "scope": True},

    {"id": "Q52", "cat": "identite", "persona": "debutant",
     "q": "que peux-tu faire pour moi ?",
     "kw": ["capteur", "plante", "serre", "aide"], "scope": True},

    {"id": "Q53", "cat": "identite", "persona": "amateur",
     "q": "Explique-moi comment fonctionne le pH en hydroponie",
     "kw": ["ph", "hydroponie", "nutriment", "absorption"], "scope": True},

    {"id": "Q54", "cat": "identite", "persona": "debutant",
     "q": "c'est quoi la différence entre TDS et pH ?",
     "kw": ["tds", "ph", "concentration", "nutriment"], "scope": True},

    {"id": "Q55", "cat": "identite", "persona": "expert",
     "q": "Donne-moi 3 conseils concrets pour améliorer ma serre immédiatement",
     "kw": ["conseil", "ph", "améliorer", "serre"], "scope": True},
]


# ─── Auth + SSE helpers ────────────────────────────────────────────────────────

def login(api_url: str, email: str, password: str) -> Optional[str]:
    url = f"{api_url}/api/auth/login"
    data = json.dumps({"email": email, "password": password}).encode()
    req = urllib.request.Request(url, data=data, method="POST",
                                  headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read())
            token = (body.get("data", {}) or {}).get("token") or body.get("token")
            if token:
                return token
            print(f"❌ Login: pas de token: {list(body.keys())}")
            return None
    except Exception as e:
        print(f"❌ Login échoué: {e}")
        return None


def call_stream(api_url: str, token: str, message: str) -> tuple:
    url = f"{api_url}/api/eve/chat/stream"
    payload = json.dumps({"message": message}).encode()
    req = urllib.request.Request(url, data=payload, method="POST",
                                  headers={
                                      "Content-Type": "application/json",
                                      "Authorization": f"Bearer {token}",
                                  })
    t0 = time.time()
    full_text = ""
    status = "ok"
    try:
        with urllib.request.urlopen(req, timeout=STREAM_TIMEOUT) as resp:
            buffer = b""
            for chunk in iter(lambda: resp.read(256), b""):
                buffer += chunk
                while b"\n\n" in buffer:
                    event, buffer = buffer.split(b"\n\n", 1)
                    for line in event.split(b"\n"):
                        line = line.strip()
                        if line.startswith(b"data:"):
                            raw = line[5:].strip()
                            try:
                                obj = json.loads(raw)
                                tok = obj.get("token", "")
                                full_text += tok
                                if obj.get("done"):
                                    break
                            except Exception:
                                pass
    except urllib.error.HTTPError as e:
        status = f"http_{e.code}"
    except urllib.error.URLError as e:
        status = f"url_error: {e.reason}"
    except Exception as e:
        status = f"error: {type(e).__name__}"
    latency = round(time.time() - t0, 2)
    return full_text.strip(), latency, status


# ─── Évaluation ───────────────────────────────────────────────────────────────

GENERIC_PHRASES = [
    "je ne peux pas", "désolée", "je suis désolée", "je suis désolé",
    "je ne sais pas", "veuillez réessayer", "je ne peux pas répondre",
    "informations non disponibles", "pas en mesure", "hors de mes capacités",
    "impossible de répondre", "enserreuse",  # hallucination connue
]

def evaluate(answer: str, q: dict) -> dict:
    a_lower = answer.lower()
    kw_hits  = [kw for kw in q["kw"] if kw.lower() in a_lower]
    generic  = any(p in a_lower for p in GENERIC_PHRASES)
    is_scope = q.get("scope", True)

    # Utile : réponse pertinente + non générique
    if is_scope:
        useful = len(kw_hits) > 0 and len(answer) > 30 and not generic
    else:
        # Hors-scope : EVE doit refuser — la réponse utile est un refus poli
        useful = any(kw.lower() in a_lower for kw in q["kw"]) or (
            any(p in a_lower for p in ["hors", "périmètre", "jardinage", "serre", "culture"])
            and not any(p in a_lower for p in ["recette", "bitcoin", "ligue", "météo"])
        )

    # Fast path déterministe : réponse en < 1.5s (heuristique)
    deterministic = q.get("_latency", 999) <= 1.5

    # Hallucination détectée : valeurs numériques inventées connues
    hallucination = False
    if is_scope and q["cat"] in ("capteurs_direct", "capteurs_informel", "diagnostic", "hors_optimal"):
        for pattern in HALLUCINATION_MARKERS:
            if re.search(pattern, answer, re.IGNORECASE):
                hallucination = True
                break

    # Actionnable : contient un verbe d'action
    actionnable = bool(re.search(
        r'\b(ajout|corriger|arros|traiter|vérifi|activ|augment|diminu'
        r'|surveill|calibr|nettoyer|diluer|ventil|ajoute|active|vérifie'
        r'|commence|essaie|utilise)\b',
        a_lower))

    # LLM path : réponse longue (> 120 chars)
    llm_path = len(answer) > 120

    return {
        "useful":        useful,
        "actionnable":   actionnable,
        "llm_path":      llm_path,
        "deterministic": deterministic,
        "hallucination": hallucination,
        "generic":       generic,
        "kw_hit":        len(kw_hits),
        "kw_hits":       kw_hits,
    }


# ─── Rapport par persona ───────────────────────────────────────────────────────

def print_persona_report(results: list):
    per_persona: dict = {}
    for r in results:
        p = r.get("persona", "?")
        if p not in per_persona:
            per_persona[p] = {"n": 0, "useful": 0, "halluc": 0, "action": 0}
        per_persona[p]["n"] += 1
        per_persona[p]["useful"] += r["useful"]
        per_persona[p]["halluc"] += r["hallucination"]
        per_persona[p]["action"] += r["actionnable"]

    print(f"\n  {'Persona':<12} {'Profil':<40} {'Utiles':>7} {'Halluc':>7} {'Action':>7}")
    print(f"  {'-'*72}")
    for p, stats in per_persona.items():
        icon = PERSONAS.get(p, {}).get("icon", "")
        name = PERSONAS.get(p, {}).get("name", p)
        desc = PERSONAS.get(p, {}).get("desc", "")[:35]
        n = stats["n"]
        print(f"  {icon}{name:<11} {desc:<40} {stats['useful']}/{n:>2}   "
              f"{stats['halluc']}/{n:>2}   {stats['action']}/{n:>2}")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Benchmark EVE v2 — Personas + langage naturel")
    parser.add_argument("--url",      default=DEFAULT_API_URL)
    parser.add_argument("--email",    default=DEFAULT_EMAIL)
    parser.add_argument("--password", default=DEFAULT_PASS)
    parser.add_argument("--save",     metavar="FILE")
    parser.add_argument("--baseline", metavar="FILE")
    parser.add_argument("--verbose",  "-v", action="store_true")
    parser.add_argument("--cat",      metavar="CAT",     help="Filtrer par catégorie")
    parser.add_argument("--persona",  metavar="PERSONA", help="Filtrer par persona")
    parser.add_argument("--delay",    type=float, default=1.0,
                        help="Délai entre questions en secondes (défaut: 1.0)")
    args = parser.parse_args()

    print(f"\n{'='*72}")
    print(f"  BENCHMARK EVE v2 — Personas + Langage Naturel  |  {args.url}")
    print(f"{'='*72}\n")

    # Auth
    print(f"🔑 Login {args.email}... ", end="", flush=True)
    token = login(args.url, args.email, args.password)
    if not token:
        print("ÉCHEC")
        sys.exit(1)
    print("OK ✅\n")

    # Filtres
    questions = QUESTIONS
    if args.cat:
        questions = [q for q in questions if q["cat"] == args.cat]
        print(f"  → Catégorie: {args.cat} ({len(questions)} questions)\n")
    if args.persona:
        questions = [q for q in questions if q["persona"] == args.persona]
        print(f"  → Persona: {args.persona} ({len(questions)} questions)\n")

    if not questions:
        print("❌ Aucune question correspondant aux filtres.")
        sys.exit(1)

    # Baseline
    baseline = {}
    if args.baseline:
        try:
            with open(args.baseline) as f:
                for r in json.load(f).get("results", []):
                    baseline[r["id"]] = r
            print(f"📊 Baseline: {args.baseline} ({len(baseline)} entrées)\n")
        except Exception as e:
            print(f"⚠️ Baseline non chargée: {e}\n")

    results = []
    cats:    dict = {}
    total_useful = total_llm = total_action = total_halluc = total_generic = total_det = 0

    for i, q in enumerate(questions, 1):
        cat     = q["cat"]
        persona = q["persona"]
        p_icon  = PERSONAS.get(persona, {}).get("icon", "")
        p_name  = PERSONAS.get(persona, {}).get("name", persona)

        print(f"[{i:02d}/{len(questions)}] {q['id']} ({cat}) {p_icon}{p_name} — {q['q'][:55]}...")

        answer, latency, status = call_stream(args.url, token, q["q"])
        q["_latency"] = latency  # injecter pour evaluate()
        ev = evaluate(answer, q)

        sla        = "✅" if latency <= 1.5 else "🟡" if latency <= 8 else "🔴"
        useful_mk  = "✅" if ev["useful"] else "❌"
        halluc_mk  = "🎭HALLUC" if ev["hallucination"] else ""
        det_mk     = "⚡det" if ev["deterministic"] else "🤖llm"
        generic_mk = "⚠️GEN" if ev["generic"] else ""

        print(f"  {useful_mk} {det_mk} [{latency:.1f}s {sla}] kw:{ev['kw_hit']} "
              f"{halluc_mk} {generic_mk} status={status}")

        if args.verbose:
            preview = answer[:220].replace('\n', ' ')
            print(f"  → {preview}{'...' if len(answer) > 220 else ''}")
        if ev["kw_hits"] and args.verbose:
            print(f"  🔑 {ev['kw_hits']}")

        # Comparaison baseline
        if q["id"] in baseline:
            b = baseline[q["id"]]
            delta = round(latency - b.get("latency", latency), 2)
            was = "✅" if b.get("useful") else "❌"
            if was != useful_mk:
                trend = f"Δ{delta:+.1f}s"
                print(f"  ⚡ RÉGRESSION? baseline={was} → {useful_mk} {trend}")

        total_useful  += ev["useful"]
        total_llm     += ev["llm_path"]
        total_action  += ev["actionnable"]
        total_halluc  += ev["hallucination"]
        total_generic += ev["generic"]
        total_det     += ev["deterministic"]

        if cat not in cats:
            cats[cat] = {"n": 0, "useful": 0, "halluc": 0, "action": 0, "latencies": []}
        cats[cat]["n"]         += 1
        cats[cat]["useful"]    += ev["useful"]
        cats[cat]["halluc"]    += ev["hallucination"]
        cats[cat]["action"]    += ev["actionnable"]
        cats[cat]["latencies"].append(latency)

        results.append({
            "id": q["id"], "cat": cat, "persona": persona, "question": q["q"],
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
    print(f"  Utiles          : {total_useful}/{n} ({100*total_useful//n}%)")
    print(f"  Déterministes   : {total_det}/{n}   (fast path ≤1.5s)")
    print(f"  Actionnables    : {total_action}/{n}")
    print(f"  Hallucinations  : {total_halluc}/{n}  {'✅ aucune' if total_halluc==0 else '🎭 présentes!'}")
    print(f"  Génériques      : {total_generic}/{n}")
    print(f"  Latence med.    : {med_lat:.2f}s | max: {max(all_lat):.1f}s")

    print(f"\n  {'Catégorie':<20} {'Utiles':>7} {'Halluc':>7} {'Action':>7} {'Médiane':>9}")
    print(f"  {'-'*52}")
    for cat_name, cs in cats.items():
        med = sorted(cs["latencies"])[len(cs["latencies"]) // 2]
        h_str = f"🎭{cs['halluc']}" if cs["halluc"] else f"✅0"
        print(f"  {cat_name:<20} {cs['useful']}/{cs['n']:>2}   {h_str:>8}   "
              f"{cs['action']}/{cs['n']:>2}   {med:>6.1f}s")

    # Rapport par persona
    print(f"\n{'='*72}")
    print(f"  RAPPORT PAR PERSONA")
    print(f"{'='*72}")
    print_persona_report(results)

    print(f"{'='*72}\n")

    # Sauvegarder
    if args.save:
        out = {
            "timestamp":      datetime.now().isoformat(),
            "url":            args.url,
            "n_questions":    n,
            "useful":         total_useful,
            "deterministic":  total_det,
            "llm_path":       total_llm,
            "actionnable":    total_action,
            "hallucinations": total_halluc,
            "generic":        total_generic,
            "median_latency": med_lat,
            "results":        results,
        }
        with open(args.save, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        print(f"💾 Résultats sauvegardés: {args.save}")


if __name__ == "__main__":
    main()
