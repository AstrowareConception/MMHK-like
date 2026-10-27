"""Explicit, bounded operator/cron worker for PostgreSQL mine credits.

Usage: python -m mmhk_api.economy_worker --once --max-cities 25
This is NOT a daemon or a scheduler and requires a trusted server environment.
"""
from __future__ import annotations

import argparse
import json

from .db import connect
from .economy import run_economy_batch


def main() -> None:
    parser = argparse.ArgumentParser(description="MMHK experimental economy worker")
    parser.add_argument("--once", action="store_true",
                        help="Process due economy clocks once and exit")
    parser.add_argument("--max-cities", type=int, default=25)
    parser.add_argument("--max-ticks-per-city", type=int, default=96)
    args = parser.parse_args()
    if not args.once:
        parser.error("Explicit --once required; no background worker is installed")
    with connect() as db:
        # run_economy_batch owns its small atomic transactions. Avoid a long
        # transaction around the whole group of due cities.
        db.commit()
        db.autocommit = True
        events = run_economy_batch(
            db, max_cities=args.max_cities,
            max_ticks_per_city=args.max_ticks_per_city,
        )
    print(json.dumps({
        "processed": len(events), "events": events,
        "source": "postgresql", "historical_economy_certified": False,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
