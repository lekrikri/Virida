#!/usr/bin/env python3
"""
benchmark_stream_ihm.py — Benchmark EVE via l'API virida_api (endpoint /chat/stream SSE)

Simule exactement le chemin du ChatBot.tsx :
  virida_app → POST /api/eve/chat/stream → virida_api → EVE Flask (virida-eve)

Inclut : JWT auth, sensor_context réel (Pi IoT), plant_context réel,
         user_level (BEGINNER), streaming SSE → reconstruit la réponse complète.

Usage:
  python3 benchmark_stream_ihm.py [--url URL] [--save FILE] [--baseline FILE] [--verbose]

Environnements testés :
  --url https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io  (Clever Cloud)
  --url http://100.97.47.46:3001  (Pi Tailscale)
  --url http://localhost:3001      (dev local)
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

# ─── Configuration ────────────────────────────────────────────────────────────

DEFAULT_API_URL = "https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io"
DEFAULT_EMAIL   = "krikri@virida.com"
DEFAULT_PASS    = "test1234"
STREAM_TIMEOUT  = 60  # secondes max par question

# ─── Questions benchmark ──────────────────────────────────────────────────────
# 8 catégories × ~5 questions = 40 questions
# Couvre : capteurs IoT réels, KB (maladies/carences/corrélations), plantes DB,
#          recommandations agronomiques, hors-scope, identité EVE

QUESTIONS = [
    # 1. CAPTEURS & ALERTES (données IoT réelles depuis la serre)
    {"id": "Q01", "cat": "capteurs", "q": "Quel est le pH actuel de la solution ?",
     "expect": ["ph", "pH", "4.", "5.", "6.", "7."], "kw": ["ph", "acide", "bas", "élevé"]},
    {"id": "Q02", "cat": "capteurs", "q": "Quelle est la température dans la serre ?",
     "expect": ["°C", "température", "temp"], "kw": ["°c", "température", "chaud", "froid"]},
    {"id": "Q03", "cat": "capteurs", "q": "L'humidité du sol est-elle correcte ?",
     "expect": ["%", "humidité", "sol", "arros"], "kw": ["%", "sol", "arros"]},
    {"id": "Q04", "cat": "capteurs", "q": "Combien de lux y a-t-il dans ma serre ?",
     "expect": ["lux", "lumière", "éclairage", "led"], "kw": ["lux", "lumière"]},
    {"id": "Q05", "cat": "capteurs", "q": "Est-ce que les conditions sont bonnes pour mes plantes ?",
     "expect": ["capteur", "condition", "température", "humidité", "pH", "serre"],
     "kw": ["condition", "capteur", "serre"]},

    # 2. DIAGNOSTIC SERRE (vue d'ensemble)
    {"id": "Q06", "cat": "diagnostic", "q": "Comment va la serre ?",
     "expect": ["pH", "température", "capteur", "serre", "alerte", "critique"],
     "kw": ["ph", "température", "capteur", "serre"]},
    {"id": "Q07", "cat": "diagnostic", "q": "Y a-t-il des alertes critiques dans ma serre ?",
     "expect": ["alerte", "critique", "pH", "lumière", "humidité", "capteur"],
     "kw": ["alerte", "critique", "attention", "problème"]},
    {"id": "Q08", "cat": "diagnostic", "q": "Fais-moi un diagnostic complet de la serre",
     "expect": ["pH", "température", "lumière", "humidité", "sol"],
     "kw": ["ph", "température", "diagnostic", "capteur"]},
    {"id": "Q09", "cat": "diagnostic", "q": "Quels capteurs sont en dehors des valeurs optimales ?",
     "expect": ["pH", "optimal", "valeur", "capteur", "seuil"],
     "kw": ["optimal", "seuil", "capteur"]},

    # 3. PLANTES SPÉCIFIQUES (données DB réelles)
    {"id": "Q10", "cat": "plantes", "q": "Comment va ma tomate cerise ?",
     "expect": ["tomate", "cerise", "pH", "santé", "stade", "SEEDLING", "VEGETATIVE"],
     "kw": ["tomate", "cerise", "santé", "stade"]},
    {"id": "Q11", "cat": "plantes", "q": "Est-ce que ma tomate cerise va bien ?",
     "expect": ["tomate", "cerise", "pH", "nutriment", "lumière", "diagnostic"],
     "kw": ["tomate", "cerise", "pH", "condition"]},
    {"id": "Q12", "cat": "plantes", "q": "Mon basilic souffre-t-il des conditions actuelles ?",
     "expect": ["basilic", "pH", "température", "humidité", "condition"],
     "kw": ["basilic", "ph", "condition"]},
    {"id": "Q13", "cat": "plantes", "q": "Quel est le stade de croissance de mes plantes ?",
     "expect": ["stade", "SEEDLING", "VEGETATIVE", "croissance", "plante"],
     "kw": ["stade", "croissance", "plante"]},
    {"id": "Q14", "cat": "plantes", "q": "Quand est-ce que je pourrai récolter ?",
     "expect": ["récolte", "jour", "stade", "plante", "semaine"],
     "kw": ["récolte", "jour", "stade"]},

    # 4. MALADIES & RAVAGEURS (KB EVE)
    {"id": "Q15", "cat": "maladies", "q": "J'ai une poudre blanche sur mes feuilles, qu'est-ce que c'est ?",
     "expect": ["oïdium", "champignon", "fongique", "traitement", "soufre", "bicarbonate"],
     "kw": ["oïdium", "champignon", "fongique"]},
    {"id": "Q16", "cat": "maladies", "q": "Mes feuilles jaunissent par le bas, que faire ?",
     "expect": ["azote", "carence", "nutrition", "feuille", "jaune", "bas"],
     "kw": ["azote", "carence", "nutrition", "jaune"]},
    {"id": "Q17", "cat": "maladies", "q": "Le bout de mes tomates devient noir et marron",
     "expect": ["nécrose", "apicale", "calcium", "pH", "cul-de-sac", "arrosage"],
     "kw": ["nécrose", "calcium", "apical"]},
    {"id": "Q18", "cat": "maladies", "q": "J'observe des taches brunes avec contour jaune sur les feuilles",
     "expect": ["mildiou", "Phytophthora", "fongique", "traitement", "ventilation"],
     "kw": ["mildiou", "fongique", "tache"]},
    {"id": "Q19", "cat": "maladies", "q": "J'ai des petits insectes verts sur mes plants",
     "expect": ["pucerons", "insecte", "traitement", "savon", "neem", "coccinelle"],
     "kw": ["puceron", "insecte", "traitement"]},

    # 5. CORRÉLATIONS MULTI-CAPTEURS (règles agronomiques EVE)
    {"id": "Q20", "cat": "correlations", "q": "Le pH est bas et le TDS est élevé, est-ce dangereux ?",
     "expect": ["pH", "TDS", "nécrose", "blocage", "racinaire", "nutriment"],
     "kw": ["ph", "tds", "blocage", "nécrose"]},
    {"id": "Q21", "cat": "correlations", "q": "L'humidité est haute et la température basse, que risque-je ?",
     "expect": ["mildiou", "botrytis", "fongique", "humidité", "ventilation"],
     "kw": ["mildiou", "botrytis", "fongique"]},
    {"id": "Q22", "cat": "correlations", "q": "Sol sec, chaleur, faible humidité — quels risques ?",
     "expect": ["stress", "dessiccation", "sécheresse", "arrosage", "urgent"],
     "kw": ["stress", "dessiccation", "arros"]},
    {"id": "Q23", "cat": "correlations", "q": "Pourquoi mes plantes n'absorbent-elles pas les nutriments malgré le TDS élevé ?",
     "expect": ["pH", "absorption", "blocage", "nutriment", "optimal"],
     "kw": ["ph", "absorption", "blocage", "nutriment"]},

    # 6. RECOMMANDATIONS HORTICOLES (KB jardinage/KB v4)
    {"id": "Q24", "cat": "horticulture", "q": "Comment corriger un pH trop bas dans ma solution ?",
     "expect": ["pH+", "pH plus", "bicarbonate", "potasse", "correction", "solution"],
     "kw": ["ph+", "correction", "augment", "solution"]},
    {"id": "Q25", "cat": "horticulture", "q": "Quel engrais utiliser pour mes tomates cerise en végétatif ?",
     "expect": ["NPK", "azote", "phosphore", "potassium", "engrais", "tomate"],
     "kw": ["npk", "azote", "engrais", "nutriment"]},
    {"id": "Q26", "cat": "horticulture", "q": "Combien d'heures de lumière pour des tomates cerises ?",
     "expect": ["heure", "lumière", "LED", "lux", "tomate", "photopériode"],
     "kw": ["heure", "lumière", "led", "lux"]},
    {"id": "Q27", "cat": "horticulture", "q": "Comment améliorer la pollinisation dans ma serre fermée ?",
     "expect": ["pollinat", "vibration", "ventilateur", "pinceau", "serre"],
     "kw": ["pollinat", "vibr", "pinceau"]},
    {"id": "Q28", "cat": "horticulture", "q": "Mon capteur pH dérive, comment le calibrer ?",
     "expect": ["calibr", "pH", "tampon", "KCl", "dérive", "électrode"],
     "kw": ["calibr", "tampon", "kcl", "dérive"]},

    # 7. MARKETPLACE (produits recommandés)
    {"id": "Q29", "cat": "marketplace", "q": "Quel produit pour corriger mon pH acide dans la serre ?",
     "expect": ["pH+", "solution", "produit", "marché", "recommand", "correction", "store"],
     "kw": ["ph+", "produit", "solution", "recommand"]},
    {"id": "Q30", "cat": "marketplace", "q": "Qu'est-ce que vous vendez pour traiter l'oïdium ?",
     "expect": ["soufre", "produit", "traitement", "oïdium", "marché"],
     "kw": ["soufre", "produit", "traitement"]},
    {"id": "Q31", "cat": "marketplace", "q": "Avez-vous des capteurs pH de remplacement ?",
     "expect": ["capteur", "pH", "produit", "marché", "boutique", "store"],
     "kw": ["capteur", "ph", "produit"]},

    # 8. HORS-SCOPE (EVE doit refuser poliment)
    {"id": "Q32", "cat": "hors_scope", "q": "Donne-moi une recette de sauce tomate",
     "expect": ["hors", "périmètre", "recette", "culinaire", "culture"],
     "kw": ["hors", "périmètre", "culture", "serre"]},
    {"id": "Q33", "cat": "hors_scope", "q": "Qui va gagner la Ligue 1 cette saison ?",
     "expect": ["hors", "périmètre", "serre", "plante"],
     "kw": ["hors", "périmètre", "serre"]},
    {"id": "Q34", "cat": "hors_scope", "q": "Quelle est la météo demain à Paris ?",
     "expect": ["hors", "périmètre", "météo", "serre"],
     "kw": ["hors", "périmètre", "météo"]},

    # 9. IDENTITÉ & UX
    {"id": "Q35", "cat": "identite", "q": "Qui t'a créée ?",
     "expect": ["EVE", "Virida", "assistante", "créée"],
     "kw": ["virida", "eve", "assistante"]},
    {"id": "Q36", "cat": "identite", "q": "Bonjour EVE !",
     "expect": ["Bonjour", "EVE", "serre", "plante", "aider"],
     "kw": ["bonjour", "eve", "serre"]},
    {"id": "Q37", "cat": "identite", "q": "Que peux-tu faire pour moi ?",
     "expect": ["capteur", "plante", "serre", "aide", "diagnostic"],
     "kw": ["capteur", "serre", "plante", "aide"]},
    {"id": "Q38", "cat": "identite", "q": "Explique-moi comment fonctionne le pH en hydroponie",
     "expect": ["pH", "hydroponie", "nutriment", "absorption", "optimal"],
     "kw": ["ph", "hydroponie", "nutriment"]},
    {"id": "Q39", "cat": "identite", "q": "C'est quoi la différence entre TDS et pH ?",
     "expect": ["TDS", "pH", "électrique", "concentration", "nutriment"],
     "kw": ["tds", "ph", "concentration", "nutriment"]},
    {"id": "Q40", "cat": "identite", "q": "Donne-moi 3 conseils pour améliorer ma serre",
     "expect": ["conseil", "serre", "pH", "lumière", "ventilation", "améliorer"],
     "kw": ["conseil", "serre", "améliorer"]},
]


# ─── Auth + SSE helpers ────────────────────────────────────────────────────────

def login(api_url: str, email: str, password: str) -> Optional[str]:
    """Obtenir un JWT depuis /api/auth/login"""
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
            print(f"❌ Login: pas de token dans la réponse: {list(body.keys())}")
            return None
    except Exception as e:
        print(f"❌ Login échoué: {e}")
        return None


def call_stream(api_url: str, token: str, message: str) -> tuple[str, float, str]:
    """
    Appelle /api/eve/chat/stream et reconstruit la réponse depuis les SSE.
    Retourne (texte_complet, latence_s, statut)
    """
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

def evaluate(answer: str, q: dict) -> dict:
    a_lower = answer.lower()
    # Utile = contient au moins 1 mot-clé attendu
    kw_hits = [kw for kw in q["kw"] if kw.lower() in a_lower]
    useful = len(kw_hits) > 0 and len(answer) > 30
    # Actionnable = contient un verbe d'action ou une mesure
    actionnable = bool(re.search(
        r'\b(ajout|corriger|arros|traiter|vérifi|activ|augment|diminu|surveill|calibr|nettoyer)\b',
        a_lower))
    # LLM path = réponse longue et détaillée (>100 chars) — heuristique
    llm_path = len(answer) > 120
    # Générique = réponse passe-partout
    generic_phrases = [
        "surveillez ce paramètre", "je ne peux pas", "désolée", "veuillez réessayer",
        "je suis désolée", "je ne sais pas"
    ]
    generic = any(p in a_lower for p in generic_phrases)

    return {
        "useful": useful and not generic,
        "actionnable": actionnable,
        "llm_path": llm_path,
        "kw_hit": len(kw_hits),
        "generic": generic,
        "kw_hits": kw_hits,
    }


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Benchmark EVE via API virida_api /chat/stream")
    parser.add_argument("--url", default=DEFAULT_API_URL, help="URL base de virida_api")
    parser.add_argument("--email", default=DEFAULT_EMAIL)
    parser.add_argument("--password", default=DEFAULT_PASS)
    parser.add_argument("--save", metavar="FILE", help="Sauvegarder résultats JSON")
    parser.add_argument("--baseline", metavar="FILE", help="Comparer avec baseline JSON")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--cat", metavar="CAT", help="Tester seulement une catégorie")
    args = parser.parse_args()

    print(f"\n{'='*70}")
    print(f"  BENCHMARK EVE — IHM Stream  |  {args.url}")
    print(f"{'='*70}\n")

    # Auth
    print(f"🔑 Login {args.email}... ", end="", flush=True)
    token = login(args.url, args.email, args.password)
    if not token:
        print("ÉCHEC — vérifiez les credentials et l'URL")
        sys.exit(1)
    print("OK ✅\n")

    questions = QUESTIONS
    if args.cat:
        questions = [q for q in questions if q["cat"] == args.cat]
        print(f"  → Filtre catégorie: {args.cat} ({len(questions)} questions)\n")

    # Charger baseline
    baseline = {}
    if args.baseline:
        try:
            with open(args.baseline) as f:
                for r in json.load(f).get("results", []):
                    baseline[r["id"]] = r
            print(f"📊 Baseline chargée: {args.baseline} ({len(baseline)} entrées)\n")
        except Exception as e:
            print(f"⚠️ Impossible de charger baseline: {e}\n")

    results = []
    cats: dict = {}
    total_useful = total_llm = total_action = total_generic = 0

    for i, q in enumerate(questions, 1):
        cat = q["cat"]
        print(f"[{i:02d}/{len(questions)}] {q['id']} ({cat}) — {q['q'][:55]}...")

        answer, latency, status = call_stream(args.url, token, q["q"])
        ev = evaluate(answer, q)

        sla = "✅ fast" if latency <= 2 else "🟡 ok" if latency <= 8 else "🔴 slow"
        useful_mark = "✅" if ev["useful"] else "❌"
        llm_mark = "🤖" if ev["llm_path"] else "⚡"

        print(f"  {useful_mark} {llm_mark} [{latency:.1f}s {sla}] kw:{ev['kw_hit']} "
              f"{'⚠️GENERIC' if ev['generic'] else ''} status={status}")
        if args.verbose:
            preview = answer[:200].replace('\n', ' ')
            print(f"  → {preview}{'...' if len(answer) > 200 else ''}")
        if ev["kw_hits"] and args.verbose:
            print(f"  🔑 kw trouvés: {ev['kw_hits']}")

        # Comparaison baseline
        if q["id"] in baseline:
            b = baseline[q["id"]]
            delta = round(latency - b.get("latency", latency), 2)
            trend = f"Δ{delta:+.1f}s" if abs(delta) > 0.3 else "≈"
            useful_was = "✅" if b.get("useful") else "❌"
            if useful_was != useful_mark:
                print(f"  ⚡ RÉGRESSION? baseline={useful_was} → maintenant={useful_mark} {trend}")

        # Accumulation stats
        total_useful += ev["useful"]
        total_llm += ev["llm_path"]
        total_action += ev["actionnable"]
        total_generic += ev["generic"]

        if cat not in cats:
            cats[cat] = {"n": 0, "useful": 0, "llm": 0, "latencies": []}
        cats[cat]["n"] += 1
        cats[cat]["useful"] += ev["useful"]
        cats[cat]["llm"] += ev["llm_path"]
        cats[cat]["latencies"].append(latency)

        results.append({
            "id": q["id"], "cat": cat, "question": q["q"],
            "answer": answer, "latency": latency, "status": status, **ev
        })

    # ─── Résumé ───────────────────────────────────────────────────────────────
    n = len(questions)
    all_lat = [r["latency"] for r in results]
    median_lat = sorted(all_lat)[len(all_lat)//2]

    print(f"\n{'='*70}")
    print(f"  RÉSUMÉ GLOBAL")
    print(f"{'='*70}")
    print(f"  Utiles       : {total_useful}/{n} ({100*total_useful//n}%)")
    print(f"  LLM path     : {total_llm}/{n} ({100*total_llm//n}%)")
    print(f"  Actionnables : {total_action}/{n} ({100*total_action//n}%)")
    print(f"  Génériques   : {total_generic}/{n}")
    print(f"  Latence med. : {median_lat:.2f}s | max: {max(all_lat):.1f}s")
    print()
    print(f"  {'Catégorie':<15} {'Utiles':>7} {'LLM':>5} {'Médiane':>9}")
    print(f"  {'-'*38}")
    for cat_name, cs in cats.items():
        med = sorted(cs["latencies"])[len(cs["latencies"])//2]
        print(f"  {cat_name:<15} {cs['useful']}/{cs['n']:>3}   {cs['llm']}/{cs['n']:>3}   {med:>6.1f}s")
    print(f"{'='*70}\n")

    # Sauvegarder
    if args.save:
        out = {
            "timestamp": datetime.now().isoformat(),
            "url": args.url,
            "n_questions": n,
            "useful": total_useful,
            "llm_path": total_llm,
            "actionnable": total_action,
            "generic": total_generic,
            "median_latency": median_lat,
            "results": results
        }
        with open(args.save, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        print(f"💾 Résultats sauvegardés: {args.save}")


if __name__ == "__main__":
    main()
