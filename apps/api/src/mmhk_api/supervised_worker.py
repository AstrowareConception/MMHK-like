"""Explicitly supervised, bounded economy + construction worker.

The transactionally persisted PostgreSQL event queues remain authoritative.
No Redis dependency, no HTTP public worker actions, no combat automation.
Start only with --loop or --once in an operator-controlled environment.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import signal
import socket
import sys
import threading
from datetime import UTC, datetime, timedelta
from time import monotonic
from typing import Callable

import psycopg

from .construction import run_construction_batch
from .pve_missions import advance_pve_missions
from .caravans import run_caravan_batch
from .caravan_programs import run_program_batch
from .db import connect
from .economy import run_economy_batch

_WORKER_ID = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")
_STOP = threading.Event()


def identity(value: str | None = None) -> str:
    result = value or os.environ.get("MMHK_WORKER_ID") or socket.gethostname()
    if not _WORKER_ID.fullmatch(result):
        raise ValueError("Invalid stable worker ID (1..64 ASCII letters/digits/-/_)" )
    return result


def update_heartbeat(
    db: psycopg.Connection, *, worker_id: str, iteration: int,
    economy_count: int, construction_count: int, failures: int,
    state: str, error_kind: str | None = None,
) -> None:
    if state not in ("healthy", "degraded", "stopped"):
        raise ValueError("Invalid worker state")
    db.execute(
        """INSERT INTO app_worker_heartbeats(
             worker_id,started_at,heartbeat_at,state,iteration,
             last_economy_count,last_construction_count,failures,last_error_kind
           ) VALUES(%s,clock_timestamp(),clock_timestamp(),%s,%s,%s,%s,%s,%s)
           ON CONFLICT(worker_id) DO UPDATE SET
             heartbeat_at=clock_timestamp(),state=EXCLUDED.state,
             iteration=EXCLUDED.iteration,
             last_economy_count=EXCLUDED.last_economy_count,
             last_construction_count=EXCLUDED.last_construction_count,
             failures=EXCLUDED.failures,last_error_kind=EXCLUDED.last_error_kind""",
        (worker_id,state,iteration,economy_count,construction_count,
         failures,error_kind),
    )


def check_health(db: psycopg.Connection, worker_id: str, *, max_age_seconds: int = 90) -> bool:
    """Operator/container-only probe. This must not become a player API."""
    if not 5 <= max_age_seconds <= 3600:
        raise ValueError("Invalid health age limit")
    row = db.execute(
        """SELECT state,heartbeat_at > clock_timestamp() -
             (%s * interval '1 second')
           FROM app_worker_heartbeats WHERE worker_id=%s""",
        (max_age_seconds,worker_id),
    ).fetchone()
    return bool(row and row[0] == "healthy" and row[1])


def iteration(
    db: psycopg.Connection, *,
    worker_id: str, number: int, total_failures: int,
    max_cities: int, max_orders: int, max_ticks_per_city: int,
    economy_fn: Callable=run_economy_batch,
    construction_fn: Callable=run_construction_batch,
    mission_fn: Callable=advance_pve_missions,
    caravan_fn: Callable=run_caravan_batch,
    program_fn: Callable=run_program_batch,
) -> dict:
    """Isolate failure of the economic engine from construction processing.

    Failed transaction rolls back; the other domain is attempted even if
    one fails. No per-user or exception detail is written to the heartbeat.
    """
    if not db.autocommit:
        raise ValueError("A supervisor requires an autocommit connection")
    counts={"economy":0,"construction":0}
    errors=[]
    try:
        counts["economy"]=len(economy_fn(
            db,max_cities=max_cities,max_ticks_per_city=max_ticks_per_city,
        ))
    except Exception:
        errors.append("economy")
    try:
        counts["construction"]=len(construction_fn(db,max_orders=max_orders))
    except Exception:
        errors.append("construction")
    try:
        mission_count=len(mission_fn(db,max_orders=max_orders))
    except Exception:
        mission_count=0
        errors.append("missions")
    try:
        program_count=len(program_fn(db,max_orders=max_orders))
    except Exception:
        program_count=0
        errors.append("caravan_programs")
    try:
        caravan_count=len(caravan_fn(db,max_orders=max_orders))
    except Exception:
        caravan_count=0
        errors.append("caravans")
    # On an invalid/closed connection, the heartbeat fails and the outer
    # supervisor will reopen it. Fail closed, don't report healthy.
    update_heartbeat(
        db,worker_id=worker_id,iteration=number,
        economy_count=counts["economy"],construction_count=counts["construction"],
        failures=total_failures+len(errors),
        state="degraded" if errors else "healthy",
        error_kind=errors[0] if errors else None,
    )
    return {"kind":"worker_cycle","iteration":number,"worker_id":worker_id,
            "counts":counts,"state":"degraded" if errors else "healthy",
            "error_kinds":errors,"mission_transitions":mission_count,
            "caravan_transitions":caravan_count,
            "program_transitions":program_count}


def _log(item: dict) -> None:
    print(json.dumps(item,sort_keys=True,ensure_ascii=False),flush=True)


def _signal(_signum,_frame) -> None:
    _STOP.set()


def run_loop(
    *,worker_id: str,once: bool,interval: float,
    max_cities: int,max_orders: int,max_ticks_per_city:int,
    max_consecutive_failures:int=3,
) -> int:
    if not 1 <= interval <= 300:
        raise ValueError("Worker poll seconds must be 1..300")
    if not 1 <= max_consecutive_failures <= 20:
        raise ValueError("Max consecutive failures must be 1..20")
    number=0
    total_failures=0
    consecutive_failures=0
    while not _STOP.is_set():
        number+=1
        start=monotonic()
        cycle=None
        try:
            with connect() as db:
                db.commit()
                db.autocommit=True
                cycle=iteration(
                    db,worker_id=worker_id,number=number,
                    total_failures=total_failures,
                    max_cities=max_cities,max_orders=max_orders,
                    max_ticks_per_city=max_ticks_per_city,
                )
            total_failures+=len(cycle["error_kinds"])
            _log(cycle)
            if cycle["state"]=="degraded":
                consecutive_failures+=1
            else:
                consecutive_failures=0
        except Exception as exc:
            consecutive_failures+=1
            total_failures+=1
            _log({"kind":"worker_failure","worker_id":worker_id,
                  "iteration":number,
                  "error_kind":"database" if isinstance(exc,psycopg.Error) else "heartbeat",
                  "state":"degraded"})
        if once or consecutive_failures>=max_consecutive_failures:
            if consecutive_failures>=max_consecutive_failures:
                _log({"kind":"worker_exiting","reason":"failure_limit",
                      "worker_id":worker_id})
            return 1 if consecutive_failures else 0
        _STOP.wait(max(0,interval-(monotonic()-start)))
    # Avoid writing 'healthy' on shutdown. The probe will fail on stale
    # heartbeat; the container lifecycle reports stopped separately.
    try:
        with connect() as db:
            db.autocommit=True
            update_heartbeat(db,worker_id=worker_id,iteration=number,
                             economy_count=0,construction_count=0,
                             failures=total_failures,state="stopped")
    except Exception:
        pass
    return 0


def main() -> None:
    parser=argparse.ArgumentParser(description="MMHK-like supervised worker")
    group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--loop",action="store_true")
    group.add_argument("--once",action="store_true")
    group.add_argument("--check-health",action="store_true")
    parser.add_argument("--worker-id",default=None)
    parser.add_argument("--interval-seconds",type=float,default=10)
    parser.add_argument("--max-cities",type=int,default=25)
    parser.add_argument("--max-orders",type=int,default=25)
    parser.add_argument("--max-ticks-per-city",type=int,default=96)
    parser.add_argument("--max-age-seconds",type=int,default=90)
    args=parser.parse_args()
    worker_id=identity(args.worker_id)
    if args.check_health:
        try:
            with connect() as db:
                db.autocommit=True
                healthy=check_health(db,worker_id,max_age_seconds=args.max_age_seconds)
            sys.exit(0 if healthy else 1)
        except Exception:
            sys.exit(1)
    signal.signal(signal.SIGTERM,_signal)
    signal.signal(signal.SIGINT,_signal)
    sys.exit(run_loop(
        worker_id=worker_id,once=args.once,interval=args.interval_seconds,
        max_cities=args.max_cities,max_orders=args.max_orders,
        max_ticks_per_city=args.max_ticks_per_city,
    ))


if __name__=="__main__":
    main()
