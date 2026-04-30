#!/usr/bin/env python3
"""
benchmark_vision.py — Benchmark du pipeline vision Virida (virida_api + virida-eve)

Calcule les métriques de qualité à partir des annotations admin (GOOD/PARTIAL/WRONG)
stockées en base PostgreSQL.

Usage :
    python benchmark_vision.py [--since YYYY-MM-DD] [--greenhouse GREENHOUSE_ID]

Métriques calculées :
  - Accuracy globale (GOOD / total annoté)
  - Distribution GOOD / PARTIAL / WRONG
  - Corrélation confidence ↔ annotation
  - Précision par type de trigger (on_demand / scheduled / scene_change / sensor_alert)
  - Taux structured vs fallback texte libre
  - Top issues signalées vs confirmées

Pré-requis :
    pip install psycopg2-binary tabulate
    DATABASE_URL=postgresql://virida:virida123@localhost:5432/virida_prod
"""

import os
import sys
import argparse
import json
from collections import defaultdict, Counter
from datetime import datetime, timedelta

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("❌ psycopg2 requis : pip install psycopg2-binary")
    sys.exit(1)

try:
    from tabulate import tabulate
    HAS_TABULATE = True
except ImportError:
    HAS_TABULATE = False


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://virida:virida123@localhost:5432/virida_prod",
)


def _connect():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def _print_table(headers, rows, title=""):
    if title:
        print(f"\n{'─' * 60}")
        print(f"  {title}")
        print(f"{'─' * 60}")
    if HAS_TABULATE:
        print(tabulate(rows, headers=headers, tablefmt="rounded_outline"))
    else:
        print("  " + "  |  ".join(headers))
        for row in rows:
            print("  " + "  |  ".join(str(v) for v in row))


def fetch_annotated(conn, since=None, greenhouse_id=None):
    """Récupère toutes les analyses annotées avec leurs métadonnées."""
    where_clauses = []
    params = []

    if since:
        where_clauses.append("a.\"createdAt\" >= %s")
        params.append(since)
    if greenhouse_id:
        where_clauses.append('a."greenhouseId" = %s')
        params.append(greenhouse_id)

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    sql = f"""
        SELECT
            a.id,
            a."greenhouseId",
            a."plantName",
            a.confidence,
            a."triggerReason",
            a."sensorSnapshot",
            a.description,
            a."modelUsed",
            a."latencyMs",
            a."createdAt",
            ann.label,
            ann.note,
            ann.annotator
        FROM "VisionAnalysis" a
        JOIN "VisionAnnotation" ann ON ann."analysisId" = a.id
        {where_sql}
        ORDER BY a."createdAt" DESC
    """

    with conn.cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def fetch_all_recent(conn, since=None, greenhouse_id=None):
    """Récupère toutes les analyses (annotées ou non) pour les stats générales."""
    where_clauses = []
    params = []

    if since:
        where_clauses.append('"createdAt" >= %s')
        params.append(since)
    if greenhouse_id:
        where_clauses.append('"greenhouseId" = %s')
        params.append(greenhouse_id)

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    sql = f"""
        SELECT
            id, "greenhouseId", confidence, "triggerReason",
            "modelUsed", "latencyMs", "sensorSnapshot", "createdAt"
        FROM "VisionAnalysis"
        {where_sql}
        ORDER BY "createdAt" DESC
        LIMIT 1000
    """

    with conn.cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def run_benchmark(since=None, greenhouse_id=None):
    print("\n🔬 Benchmark Vision Virida")
    print(f"   Connexion : {DATABASE_URL.split('@')[-1]}")
    if since:
        print(f"   Depuis     : {since.date()}")
    if greenhouse_id:
        print(f"   Serre      : {greenhouse_id}")

    conn = _connect()

    annotated = fetch_annotated(conn, since, greenhouse_id)
    all_recent = fetch_all_recent(conn, since, greenhouse_id)

    conn.close()

    total_annotated = len(annotated)
    total_analyses  = len(all_recent)

    if total_annotated == 0:
        print("\n⚠️  Aucune annotation trouvée. Annotez des images via l'admin UI d'abord.")
        return

    # ── 1. Distribution globale ───────────────────────────────────────────────
    label_counts = Counter(r["label"] for r in annotated)
    good    = label_counts.get("GOOD", 0)
    partial = label_counts.get("PARTIAL", 0)
    wrong   = label_counts.get("WRONG", 0)
    accuracy = round(good / total_annotated * 100, 1)

    _print_table(
        ["Métrique", "Valeur"],
        [
            ["Total analyses", total_analyses],
            ["Annotées", total_annotated],
            ["Taux annotation", f"{round(total_annotated/total_analyses*100,1)}%"],
            ["GOOD", f"{good} ({round(good/total_annotated*100,1)}%)"],
            ["PARTIAL", f"{partial} ({round(partial/total_annotated*100,1)}%)"],
            ["WRONG", f"{wrong} ({round(wrong/total_annotated*100,1)}%)"],
            ["Accuracy (GOOD/total)", f"{accuracy}%"],
        ],
        title="Résultats globaux",
    )

    # ── 2. Corrélation confidence ↔ label ─────────────────────────────────────
    conf_label = defaultdict(Counter)
    for r in annotated:
        conf_label[r["confidence"] or "unknown"][r["label"]] += 1

    rows = []
    for conf in ["high", "medium", "low", "unknown"]:
        dist = conf_label.get(conf, Counter())
        total_c = sum(dist.values())
        if total_c == 0:
            continue
        acc_c = round(dist.get("GOOD", 0) / total_c * 100, 1)
        rows.append([conf, total_c, dist.get("GOOD", 0), dist.get("PARTIAL", 0), dist.get("WRONG", 0), f"{acc_c}%"])

    _print_table(
        ["Confiance", "Total", "GOOD", "PARTIAL", "WRONG", "Accuracy"],
        rows,
        title="Corrélation confiance → qualité",
    )

    # ── 3. Par trigger ────────────────────────────────────────────────────────
    trigger_label = defaultdict(Counter)
    for r in annotated:
        trigger_label[r["triggerReason"] or "unknown"][r["label"]] += 1

    rows = []
    for trigger, dist in sorted(trigger_label.items()):
        total_t = sum(dist.values())
        acc_t   = round(dist.get("GOOD", 0) / total_t * 100, 1)
        rows.append([trigger, total_t, dist.get("GOOD", 0), dist.get("PARTIAL", 0), dist.get("WRONG", 0), f"{acc_t}%"])

    _print_table(
        ["Trigger", "Total", "GOOD", "PARTIAL", "WRONG", "Accuracy"],
        rows,
        title="Accuracy par type de déclenchement",
    )

    # ── 4. Structured vs fallback ──────────────────────────────────────────────
    structured_counts = {"structured": Counter(), "fallback": Counter()}
    for r in annotated:
        snap = r.get("sensorSnapshot")
        if isinstance(snap, str):
            try:
                snap = json.loads(snap)
            except Exception:
                snap = {}
        vlm = (snap or {}).get("_vlm", {}) if isinstance(snap, dict) else {}
        key = "structured" if vlm.get("structured") else "fallback"
        structured_counts[key][r["label"]] += 1

    rows = []
    for mode in ["structured", "fallback"]:
        dist  = structured_counts[mode]
        total_m = sum(dist.values())
        if total_m == 0:
            continue
        acc_m = round(dist.get("GOOD", 0) / total_m * 100, 1)
        rows.append([mode, total_m, dist.get("GOOD", 0), dist.get("PARTIAL", 0), dist.get("WRONG", 0), f"{acc_m}%"])

    _print_table(
        ["Mode VLM", "Total", "GOOD", "PARTIAL", "WRONG", "Accuracy"],
        rows,
        title="JSON structuré vs texte libre (fallback)",
    )

    # ── 5. Latence ────────────────────────────────────────────────────────────
    latencies = [r["latencyMs"] for r in all_recent if r["latencyMs"] is not None]
    if latencies:
        avg_ms = round(sum(latencies) / len(latencies))
        med_ms = sorted(latencies)[len(latencies) // 2]
        p95_ms = sorted(latencies)[int(len(latencies) * 0.95)]
        _print_table(
            ["Percentile", "Latence (ms)"],
            [["Moyenne", avg_ms], ["Médiane (p50)", med_ms], ["p95", p95_ms], ["Max", max(latencies)]],
            title="Latence EVE (toutes analyses)",
        )

    # ── 6. Modèles utilisés ───────────────────────────────────────────────────
    model_counts = Counter(r["modelUsed"] or "inconnu" for r in all_recent)
    if model_counts:
        _print_table(
            ["Modèle", "Utilisations"],
            sorted(model_counts.items(), key=lambda x: -x[1]),
            title="Modèles VLM utilisés",
        )

    # ── Résumé ─────────────────────────────────────────────────────────────────
    print(f"\n{'═' * 60}")
    grade = "🟢 Excellent" if accuracy >= 80 else "🟡 Correct" if accuracy >= 60 else "🔴 À améliorer"
    print(f"  Score global : {accuracy}%  {grade}")
    if accuracy < 80:
        print("  → Vérifier le prompt JSON, la qualité des images (lux, nuit)")
        print("  → Comparer structured vs fallback — favoriser Gemma 4 E2B")
    print(f"{'═' * 60}\n")


def main():
    parser = argparse.ArgumentParser(description="Benchmark vision Virida")
    parser.add_argument("--since", type=str, default=None,
                        help="Date de début ISO (ex: 2026-04-01). Défaut: 30 derniers jours")
    parser.add_argument("--greenhouse", type=str, default=None,
                        help="Filtrer par greenhouse ID")
    args = parser.parse_args()

    since = None
    if args.since:
        since = datetime.fromisoformat(args.since)
    else:
        since = datetime.utcnow() - timedelta(days=30)

    run_benchmark(since=since, greenhouse_id=args.greenhouse)


if __name__ == "__main__":
    main()
