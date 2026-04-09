#!/usr/bin/env python3
"""
Benchmark EVE Gemma 4 E2B — Pi 5 local
Teste directement http://100.97.47.46:5000/chat
"""
import requests, json, time

API_URL   = "http://100.97.47.46:3001"
EVE_URL   = "http://100.97.47.46:5000"
EMAIL     = "admin@virida.local"
PASSWORD  = "virida123"

# Contexte simulé pour le benchmark (plantes + capteurs)
BENCH_PLANT_CTX = [
    {"name": "Basilic", "growthStage": "VEGETATIVE", "health": 85},
    {"name": "Tomate Cerise", "growthStage": "SEEDLING", "health": 90}
]
BENCH_SENSOR_CTX = {
    "temperature": {"value": 23.5, "unit": "°C"},
    "humidity":    {"value": 65,   "unit": "%"},
    "light":       {"value": 820,  "unit": "lux"},
    "ph":          {"value": 6.5,  "unit": "pH"}
}

GREEN = "\033[92m"; RED = "\033[91m"; YELLOW = "\033[93m"
CYAN = "\033[96m"; BOLD = "\033[1m"; RESET = "\033[0m"

results = []

def login():
    r = requests.post(f"{API_URL}/api/auth/login",
                      json={"email": EMAIL, "password": PASSWORD}, timeout=10)
    data = r.json()
    token = data.get("token") or data.get("data", {}).get("token")
    if token:
        print(f"{GREEN}✅ Login OK ({EMAIL}){RESET}\n")
    else:
        print(f"{RED}❌ Login échoué: {data}{RESET}")
    return token

def chat(token, message, history=None):
    """Appel direct à EVE (port 5000) avec contexte simulé.
    history : liste de {role, content} des tours précédents (ou None).
    Retourne (reply, new_history, elapsed).
    """
    body = {
        "question": message,
        "user_id": "benchmark_user",
        "sensor_context": BENCH_SENSOR_CTX,
        "plant_context": BENCH_PLANT_CTX
    }
    if history:
        body["conversation_history"] = history
    t0 = time.time()
    try:
        r = requests.post(f"{EVE_URL}/chat", json=body, timeout=120)
    except Exception as e:
        return None, history, time.time() - t0
    elapsed = time.time() - t0
    if r.status_code != 200:
        return f"[HTTP {r.status_code}] {r.text[:100]}", history, elapsed
    data = r.json()
    reply = data.get("answer") or data.get("response") or ""
    # Accumuler l'historique pour le prochain tour
    new_history = list(history or [])
    new_history.append({"role": "user", "content": message})
    new_history.append({"role": "assistant", "content": reply})
    return reply, new_history, elapsed

def evaluate(reply, checks_pass=None, checks_fail=None):
    if not reply: return False, "pas de réponse"
    rep = reply.lower()
    for w in (checks_pass or []):
        if w.lower() not in rep: return False, f"manque '{w}'"
    for w in (checks_fail or []):
        if w.lower() in rep: return False, f"contient '{w}'"
    return True, "OK"

def test(token, name, message, checks_pass=None, checks_fail=None, history=None):
    print(f"  {CYAN}▶ {name}{RESET}")
    print(f"    Q: {message[:90]}{'...' if len(message)>90 else ''}")
    reply, new_history, elapsed = chat(token, message, history)
    if reply is None:
        print(f"    {RED}❌ ERREUR réseau{RESET}\n")
        results.append({"name": name, "ok": False, "reason": "réseau"})
        return None
    artifacts = any(a in (reply or "") for a in ["<|im_start|>", "<|assistant|>", "<|im_end|>", "<|end|>"])
    ok, reason = evaluate(reply, checks_pass, checks_fail)
    if artifacts:
        ok, reason = False, "artefacts ChatML"
    color = GREEN if ok else RED
    icon  = "✅" if ok else "❌"
    print(f"    R: {reply[:120]}{'...' if len(reply)>120 else ''}")
    print(f"    {color}{icon} {reason} — {elapsed:.1f}s{RESET}\n")
    results.append({"name": name, "ok": ok, "reason": reason, "time": elapsed})
    return new_history

# ─────────────────────────────────────────────────────────────────────────────

def main():
    print(f"\n{BOLD}{'='*60}")
    print(f"  BENCHMARK EVE — Gemma 4 E2B — Pi 5")
    print(f"{'='*60}{RESET}\n")

    token = login()
    if not token:
        return

    # ── AXE 1 : Connaissance botanique générale ──────────────────
    print(f"{BOLD}{YELLOW}📚 AXE 1 — Connaissance botanique{RESET}")
    test(token, "Arrosage basilic",
         "Mon basilic a besoin de combien d'eau par semaine ?",
         checks_pass=["basilic"])

    test(token, "Conditions tomate",
         "Quelle température idéale pour mes tomates cerises ?",
         checks_pass=["tomate"])

    # ── AXE 2 : Contexte plantes utilisateur ─────────────────────
    print(f"{BOLD}{YELLOW}🌱 AXE 2 — Contexte plantes utilisateur{RESET}")
    test(token, "Stade de croissance",
         "Quel est le stade de croissance de mes plantes ?",
         checks_pass=["basilic"])

    test(token, "Santé plante",
         "Comment va mon basilic en ce moment ?",
         checks_pass=["basilic"])

    # ── AXE 3 : Données capteurs temps réel ──────────────────────
    print(f"{BOLD}{YELLOW}📡 AXE 3 — Données capteurs{RESET}")
    test(token, "Température serre",
         "Quelle est la température actuelle dans ma serre ?",
         checks_pass=["°c", "température", "temp"],
         checks_fail=["je ne sais pas", "pas d'information"])

    test(token, "Humidité serre",
         "L'humidité dans ma serre est-elle bonne pour mes plantes ?",
         checks_pass=["%"])

    # ── AXE 4 : Multi-tours (mémoire conversation) ───────────────
    print(f"{BOLD}{YELLOW}🔄 AXE 4 — Mémoire de conversation{RESET}")
    hist = test(token, "Init conversation",
                "J'ai un basilic en stade végétatif.",
                checks_pass=["basilic"])

    test(token, "Suite conversation",
         "Quand dois-je le tailler ?",
         checks_pass=["basilic"],
         history=hist)

    # ── RÉSUMÉ ────────────────────────────────────────────────────
    ok_count = sum(1 for r in results if r["ok"])
    total = len(results)
    avg_time = sum(r.get("time", 0) for r in results) / total if total else 0
    pct = ok_count * 100 // total if total else 0
    color = GREEN if pct >= 80 else (YELLOW if pct >= 60 else RED)

    print(f"\n{BOLD}{'='*60}")
    print(f"  SCORE : {color}{ok_count}/{total} ({pct}%){RESET}{BOLD}")
    print(f"  Temps moyen : {avg_time:.1f}s / réponse")
    print(f"{'='*60}{RESET}\n")

    for r in results:
        icon = "✅" if r["ok"] else "❌"
        print(f"  {icon} {r['name']} — {r['reason']}")
    print()

if __name__ == "__main__":
    main()
