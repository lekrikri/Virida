#!/usr/bin/env python3
"""
benchmark_stream_ihm_v4.py — Benchmark EVE v4 : validation chunks_v5 (nouvelles espèces)
40 questions — nouvelles espèces poivron, fraise, concombre, herbes, stades tomate, compagnonnage

Vérifie que les 15 chunks_v5.json sont bien chargés et interrogeables dans ChromaDB.

Usage:
  python3 benchmark_stream_ihm_v4.py --verbose
  python3 benchmark_stream_ihm_v4.py --cat poivron --verbose
  python3 benchmark_stream_ihm_v4.py --save bench_v4.json
"""

import argparse, json, re, sys, time, urllib.request, urllib.error
from datetime import datetime
from typing import Optional

DEFAULT_API_URL = "https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io"
DEFAULT_EMAIL   = "krikri@virida.com"
DEFAULT_PASS    = "test1234"
STREAM_TIMEOUT  = 60

HALLUC_PATTERNS = [
    r'Enserreuse',
    r'\bpH\s*[:\s]*6\.0\b(?!.*(?:poivron|concombre|menthe|thym|ciboulette|fraise|herbe|capsicum|cucumis))',
]

QUESTIONS = [

    # ══════════════════════════════════════════════════════════════════════
    # 1. POIVRON — seuils + maladies
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W01", "cat": "poivron",
     "q": "c'est quoi les conditions optimales pour le poivron dans ma serre ?",
     "kw": ["poivron", "température", "22", "28", "ph", "6"], "scope": True},

    {"id": "W02", "cat": "poivron",
     "q": "mon poivron perd ses fleurs, c'est normal ?",
     "kw": ["poivron", "fleur", "température", "32", "15", "chute"], "scope": True},

    {"id": "W03", "cat": "poivron",
     "q": "il y a des toiles fines sous les feuilles de mon poivron",
     "kw": ["poivron", "araignée", "rouge", "humidité", "40"], "scope": True},

    {"id": "W04", "cat": "poivron",
     "q": "quel pH pour le poivron ?",
     "kw": ["poivron", "6.0", "6.8", "ph"], "scope": True},

    {"id": "W05", "cat": "poivron",
     "q": "mon poivron a des taches huileuses sur les feuilles",
     "kw": ["poivron", "phytophthora", "capsici", "drainage", "eau"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 2. FRAISE — seuils + maladies
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W06", "cat": "fraise",
     "q": "quelles sont les conditions pour cultiver des fraises en serre ?",
     "kw": ["fraise", "température", "18", "22", "ph", "5.8"], "scope": True},

    {"id": "W07", "cat": "fraise",
     "q": "mes fraises ont une moisissure grise, qu'est-ce que c'est ?",
     "kw": ["fraise", "botrytis", "pourriture", "grise", "humidité", "aération"], "scope": True},

    {"id": "W08", "cat": "fraise",
     "q": "comment faire fleurir mes fraises en serre ?",
     "kw": ["fraise", "nuit", "fraîch", "floraison", "10", "15"], "scope": True},

    {"id": "W09", "cat": "fraise",
     "q": "mes fraises ont une poudre blanche sur les feuilles",
     "kw": ["fraise", "oïdium", "soufre", "feuille"], "scope": True},

    {"id": "W10", "cat": "fraise",
     "q": "le TDS pour les fraises c'est combien ?",
     "kw": ["fraise", "tds", "1200", "1800", "ppm"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 3. CONCOMBRE — seuils + maladies
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W11", "cat": "concombre",
     "q": "je veux planter du concombre dans ma serre, c'est possible ?",
     "kw": ["concombre", "chaleur", "22", "30", "ph", "tds"], "scope": True},

    {"id": "W12", "cat": "concombre",
     "q": "mon concombre a des taches angulaires jaunes sur les feuilles",
     "kw": ["concombre", "mildiou", "cucurbitacée", "ventilation", "feuille"], "scope": True},

    {"id": "W13", "cat": "concombre",
     "q": "c'est quoi le mildiou du concombre et comment l'éviter ?",
     "kw": ["concombre", "mildiou", "humidité", "ventilation", "pseudoperonospora"], "scope": True},

    {"id": "W14", "cat": "concombre",
     "q": "comment tailler le concombre en serre ?",
     "kw": ["concombre", "taille", "nœud", "gourmand", "tuteurage"], "scope": True},

    {"id": "W15", "cat": "concombre",
     "q": "le concombre a besoin de pollinisation en serre fermée ?",
     "kw": ["concombre", "parthénocarpique", "pollinisation", "serre"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 4. HERBES AROMATIQUES — menthe, thym, ciboulette
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W16", "cat": "herbes",
     "q": "comment cultiver de la menthe dans ma serre ?",
     "kw": ["menthe", "humide", "lux", "ph"], "scope": True},

    {"id": "W17", "cat": "herbes",
     "q": "mon thym ne pousse pas bien dans la serre",
     "kw": ["thym", "soleil", "drain", "sécheresse", "lux"], "scope": True},

    {"id": "W18", "cat": "herbes",
     "q": "comment faire pousser de la ciboulette en serre hydroponique ?",
     "kw": ["ciboulette", "ph", "tds", "arrosage", "repousse"], "scope": True},

    {"id": "W19", "cat": "herbes",
     "q": "quelles herbes aromatiques sont les plus faciles en serre ?",
     "kw": ["menthe", "thym", "ciboulette", "serre", "ph"], "scope": True},

    {"id": "W20", "cat": "herbes",
     "q": "c'est quoi le TDS pour les herbes aromatiques ?",
     "kw": ["tds", "800", "1200", "herbe", "aromatique"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 5. STADES TOMATE — SEEDLING / VEGETATIVE / FLOWERING / FRUITING
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W21", "cat": "stades_tomate",
     "q": "ma tomate cerise est au stade semis, que faire ?",
     "kw": ["semis", "400", "800", "tds", "lumière", "18"], "scope": True},

    {"id": "W22", "cat": "stades_tomate",
     "q": "ma tomate est en phase végétative, quel TDS et NPK ?",
     "kw": ["végétatif", "1400", "2000", "azote", "tds"], "scope": True},

    {"id": "W23", "cat": "stades_tomate",
     "q": "ma tomate cerise est en floraison, comment optimiser ?",
     "kw": ["floraison", "potassium", "phosphore", "18", "24", "vibr"], "scope": True},

    {"id": "W24", "cat": "stades_tomate",
     "q": "mes tomates cerises commencent à former des fruits, que faire ?",
     "kw": ["fructification", "tds", "2000", "arrosage", "régulier"], "scope": True},

    {"id": "W25", "cat": "stades_tomate",
     "q": "quand récolter mes tomates cerises ?",
     "kw": ["récolte", "coloré", "grappe", "80", "maturité"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 6. COMPAGNONNAGE — associations bénéfiques
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W26", "cat": "compagnonnage",
     "q": "est-ce que je peux planter du basilic avec mes tomates ?",
     "kw": ["basilic", "tomate", "puceron", "compagnon", "bénéfique"], "scope": True},

    {"id": "W27", "cat": "compagnonnage",
     "q": "quelles plantes associer avec mon concombre ?",
     "kw": ["concombre", "aneth", "prédateur", "association"], "scope": True},

    {"id": "W28", "cat": "compagnonnage",
     "q": "peut-on planter des tomates et du fenouil ensemble ?",
     "kw": ["tomate", "fenouil", "éviter", "allélopathie"], "scope": True},

    {"id": "W29", "cat": "compagnonnage",
     "q": "quelles associations de plantes sont à éviter dans ma serre ?",
     "kw": ["éviter", "tomate", "fenouil", "pomme", "concombre", "sauge"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 7. CO2 / VENTILATION
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W30", "cat": "co2_ventilation",
     "q": "quel est le taux de CO2 optimal dans ma serre ?",
     "kw": ["co2", "800", "1200", "ppm", "photosynthèse"], "scope": True},

    {"id": "W31", "cat": "co2_ventilation",
     "q": "pourquoi le ventilateur est important dans ma serre ?",
     "kw": ["ventilateur", "humidité", "pollinisation", "fongique", "air"], "scope": True},

    {"id": "W32", "cat": "co2_ventilation",
     "q": "comment ventiler ma serre pour éviter les maladies fongiques ?",
     "kw": ["ventilation", "humidité", "fongique", "air", "maladie"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 8. FERTILISATION NPK PAR STADE
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W33", "cat": "fertilisation",
     "q": "quel engrais NPK pour mes tomates en floraison ?",
     "kw": ["npk", "potassium", "phosphore", "floraison", "1", "2", "3"], "scope": True},

    {"id": "W34", "cat": "fertilisation",
     "q": "comment fertiliser en stade végétatif ?",
     "kw": ["végétatif", "azote", "npk", "3", "1", "2", "ec"], "scope": True},

    {"id": "W35", "cat": "fertilisation",
     "q": "mon TDS est trop bas, que faire ?",
     "kw": ["tds", "engrais", "nutriment", "ec", "solution"], "scope": True},

    {"id": "W36", "cat": "fertilisation",
     "q": "c'est quoi la carence calcium sur tomate et comment la corriger ?",
     "kw": ["calcium", "nécrose", "apicale", "ph", "arrosage", "magnésium"], "scope": True},

    # ══════════════════════════════════════════════════════════════════════
    # 9. RÉCOLTE & CONSERVATION
    # ══════════════════════════════════════════════════════════════════════
    {"id": "W37", "cat": "recolte",
     "q": "comment conserver mes tomates cerises après la récolte ?",
     "kw": ["tomate", "conservation", "ambiant", "réfrigér", "3", "5"], "scope": True},

    {"id": "W38", "cat": "recolte",
     "q": "quand récolter le poivron vert et le poivron rouge ?",
     "kw": ["poivron", "vert", "rouge", "maturité", "semaine"], "scope": True},

    {"id": "W39", "cat": "recolte",
     "q": "comment conserver le basilic après la cueillette ?",
     "kw": ["basilic", "conserver", "verre", "eau", "tige"], "scope": True},

    {"id": "W40", "cat": "recolte",
     "q": "quand récolter le concombre pour qu'il soit bon ?",
     "kw": ["concombre", "15", "20", "cm", "jeune", "récolter"], "scope": True},
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
        print(f"[AUTH ERROR] {e}"); return None


def stream_question(api_url: str, token: str, question: str) -> tuple[str, float]:
    url  = f"{api_url}/api/eve/chat/stream"
    data = json.dumps({"message": question}).encode()
    req  = urllib.request.Request(url, data=data, method="POST", headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    })
    t0   = time.time()
    buf  = b""
    full = ""
    try:
        with urllib.request.urlopen(req, timeout=STREAM_TIMEOUT) as resp:
            while True:
                chunk = resp.read(512)
                if not chunk:
                    break
                buf += chunk
                while b"\n\n" in buf:
                    part, buf = buf.split(b"\n\n", 1)
                    line = part.decode("utf-8", errors="replace")
                    if line.startswith("data: "):
                        try:
                            payload = json.loads(line[6:])
                            if payload.get("token"):
                                full += payload["token"]
                            if payload.get("done"):
                                break
                        except json.JSONDecodeError:
                            pass
    except Exception as e:
        return f"[ERROR: {e}]", time.time() - t0
    return full.strip(), time.time() - t0


def evaluate(q: dict, answer: str) -> tuple[bool, list[str]]:
    a_lower = answer.lower()
    missing = [kw for kw in q.get("kw", []) if kw.lower() not in a_lower]
    # Vérifier kw_absent (mots qui NE doivent PAS être dans la réponse)
    false_positives = [kw for kw in q.get("kw_absent", []) if kw.lower() in a_lower]

    in_scope  = q.get("scope", True)
    scope_ok  = True

    if not in_scope:
        # Question hors-périmètre : EVE doit refuser (mot "périmètre" ou "jardinage")
        scope_ok = any(w in a_lower for w in ["périmètre", "jardin", "plante", "serre", "botanique", "spécialisée"])

    # Vérif hallucination
    halluc = [p for p in HALLUC_PATTERNS if re.search(p, answer)]

    ok = (len(missing) == 0) and scope_ok and (len(false_positives) == 0) and (len(halluc) == 0)
    issues = []
    if missing:         issues.append(f"mots manquants: {missing}")
    if not scope_ok:    issues.append("scope_filter manquant")
    if false_positives: issues.append(f"hallucinations détectées: {false_positives}")
    if halluc:          issues.append(f"pattern hallucination: {halluc}")
    return ok, issues


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api",     default=DEFAULT_API_URL)
    parser.add_argument("--email",   default=DEFAULT_EMAIL)
    parser.add_argument("--pass",    dest="password", default=DEFAULT_PASS)
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--cat",     default=None, help="Filtrer par catégorie")
    parser.add_argument("--save",    default=None, help="Sauvegarder résultats JSON")
    args = parser.parse_args()

    print(f"🔑 Authentification sur {args.api}...")
    token = login(args.api, args.email, args.password)
    if not token:
        print("❌ Authentification échouée"); sys.exit(1)
    print(f"✅ Token obtenu")

    # Warm-up actif : attendre qu'EVE soit complètement initialisé (LLM chargé)
    print("⏳ Warm-up EVE en cours (attente LLM prêt)...")
    for attempt in range(15):
        ans, _ = stream_question(args.api, token, "ça va ?")
        if ans and "démarre" not in ans and len(ans) > 15:
            print(f"✅ EVE warm ({attempt+1} essai{'s' if attempt>0 else ''}) — début benchmark\n")
            break
        print(f"  [{attempt+1}/15] EVE pas encore prêt... attente 10s")
        time.sleep(10)
    else:
        print("⚠️ EVE peut ne pas être complètement chaud — lancement quand même\n")

    questions = [q for q in QUESTIONS if not args.cat or q["cat"] == args.cat]
    results, passed, failed = [], 0, 0
    cats: dict[str, list] = {}

    for i, q in enumerate(questions, 1):
        print(f"[{i:02d}/{len(questions)}] {q['id']} ({q['cat']}) — {q['q'][:60]}...")
        answer, elapsed = stream_question(args.api, token, q["q"])
        ok, issues = evaluate(q, answer)

        if ok: passed += 1; symbol = "✅"
        else:  failed += 1; symbol = "❌"

        cats.setdefault(q["cat"], []).append(ok)

        if args.verbose or not ok:
            print(f"  {symbol} {elapsed:.1f}s")
            if args.verbose:
                print(f"  EVE: {answer[:200]}")
            if not ok:
                for issue in issues:
                    print(f"  ⚠️  {issue}")
        else:
            print(f"  {symbol} {elapsed:.1f}s")

        results.append({"id": q["id"], "cat": q["cat"], "q": q["q"],
                         "ok": ok, "elapsed": round(elapsed, 2),
                         "answer": answer[:300], "issues": issues})

    # ── Résumé ──────────────────────────────────────────────────────────────
    total = passed + failed
    pct   = passed / total * 100 if total else 0
    print(f"\n{'='*60}")
    print(f"BENCHMARK v4 — Nouvelles espèces KB (chunks_v5)")
    print(f"Score : {passed}/{total} ({pct:.1f}%) — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}")
    for cat, oks in sorted(cats.items()):
        n = len(oks); p = sum(oks)
        bar = "█" * p + "░" * (n - p)
        print(f"  {cat:<20} {p}/{n}  {bar}")

    if args.save:
        with open(args.save, "w") as f:
            json.dump({"score": f"{passed}/{total}", "pct": pct,
                       "timestamp": datetime.now().isoformat(), "results": results}, f, ensure_ascii=False, indent=2)
        print(f"\n💾 Résultats sauvegardés : {args.save}")

if __name__ == "__main__":
    main()
