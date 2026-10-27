"""Urban construction: experimental profiles, atomic payment, due-time worker.

P0: ONE active city project, no queue/cancel, no hero, cost paid immediately.
No historic prices, durations or rounding are assumed.
"""
from __future__ import annotations

import re
from datetime import UTC, datetime, timedelta
from decimal import Decimal, ROUND_CEILING
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb

from .worlds import RESOURCE_NAMES
from .building_effects import resolve_city_effects, persist_effect_snapshot

_CODE = re.compile(r"^[a-z][a-z0-9_]{1,47}$")
_BIGINT = 2**63-1
# P0 explicitly approves the percentage modifiers; upward rounding is a
# separate, EXPERIMENTAL, named convention, not attested Ubisoft behavior.
_MODES = {
    "normal": (Decimal("1"), Decimal("1")),
    "rapid": (Decimal("1.4"), Decimal("0.8")),
    "economic": (Decimal("0.8"), Decimal("1.4")),
}
_ROUNDING_POLICY = "experimental-ceiling-v1"


class ConstructionConflict(Exception):
    """A valid player command cannot be applied in the current state."""


class ConstructionNotFound(Exception):
    """Hide non-owned cities under a common 404."""


def _validate_costs(costs: dict[str, int]) -> dict[str, int]:
    if not isinstance(costs, dict) or set(costs) != set(RESOURCE_NAMES):
        raise ValueError("Seven explicit resource costs are required")
    if any(isinstance(v, bool) or not isinstance(v, int) or not 0 <= v <= _BIGINT
           for v in costs.values()):
        raise ValueError("Resource prices must be nonnegative bigint integers")
    return {resource: costs[resource] for resource in RESOURCE_NAMES}


def configure_building_profile(
    db: psycopg.Connection, *, building_code: str, target_level: int,
    policy_id: str, base_seconds: int, base_costs: dict[str, int],
) -> None:
    """One-time administrative catalog insert (no public HTTP endpoint)."""
    if not isinstance(building_code, str) or not _CODE.fullmatch(building_code):
        raise ValueError("Invalid building code")
    if isinstance(target_level, bool) or not isinstance(target_level, int) or not 1 <= target_level <= 100:
        raise ValueError("Invalid building level")
    if not isinstance(policy_id, str) or not 1 <= len(policy_id) <= 100:
        raise ValueError("Explicit versioned building policy required")
    if isinstance(base_seconds, bool) or not isinstance(base_seconds, int) or not 1 <= base_seconds <= 2592000:
        raise ValueError("Invalid base construction time")
    clean = _validate_costs(base_costs)
    with db.transaction():
        db.execute(
            """INSERT INTO urban_building_profiles
               (building_code,target_level,policy_id,base_seconds,base_costs)
               VALUES (%s,%s,%s,%s,%s)""",
            (building_code,target_level,policy_id,base_seconds,Jsonb(clean)),
        )


def quote(base_costs: dict[str, int], base_seconds: int, mode: str) -> dict:
    if mode not in _MODES:
        raise ValueError("Unsupported construction mode")
    costs = _validate_costs(base_costs)
    cf, tf = _MODES[mode]
    paid = {
        key: int((Decimal(value)*cf).to_integral_value(rounding=ROUND_CEILING))
        for key, value in costs.items()
    }
    if max(paid.values()) > _BIGINT:
        raise ValueError("Adjusted construction price exceeds bigint")
    duration = int((Decimal(base_seconds)*tf).to_integral_value(rounding=ROUND_CEILING))
    return {
        "mode": mode, "costs": paid, "duration_seconds": duration,
        "rounding_policy": _ROUNDING_POLICY, "historically_certified": False,
    }


def _owned_city(db: psycopg.Connection, account_id: UUID, city_id: UUID, *, lock=False) -> bool:
    row = db.execute(
        """SELECT c.city_id FROM cities c
           JOIN world_memberships wm ON wm.world_id=c.world_id
              AND wm.account_id=%s
           WHERE c.city_id=%s AND c.owner_account_id=%s""" +
        (" FOR UPDATE OF c" if lock else ""),
        (account_id,city_id,account_id),
    ).fetchone()
    return row is not None


def catalog_for_city(db: psycopg.Connection, account_id: UUID, city_id: UUID) -> dict:
    """Current levels, active project and server-only experimental quotes."""
    if not _owned_city(db,account_id,city_id):
        raise ConstructionNotFound
    effect_state = resolve_city_effects(db, city_id)
    levels = {r["building_code"]: r["level"] for r in effect_state["buildings"]}
    active_codes = {r["building_code"] for r in effect_state["buildings"] if r["active"]}
    current = db.execute(
        """SELECT order_id,building_code,target_level,mode,policy_id,
                  applied_costs,started_at,due_at,status,completed_at
           FROM urban_construction_orders
           WHERE city_id=%s AND status='building'""",
        (city_id,),
    ).fetchone()
    options = []
    for code,level,policy,duration,costs,req in db.execute(
        """SELECT b.building_code,b.target_level,b.policy_id,b.base_seconds,
                  b.base_costs,COALESCE(p.prerequisites,'{}'::jsonb)
           FROM urban_building_profiles b
           LEFT JOIN urban_effect_profiles p
             ON p.building_code=b.building_code AND p.target_level=b.target_level
           WHERE b.enabled ORDER BY b.building_code,b.target_level"""
    ).fetchall():
        if level == levels.get(code,0)+1:
            missing = [
                dep for dep,required in req.items()
                if dep not in active_codes or levels.get(dep,0)<required
            ]
            if level>1 and code not in active_codes:
                missing.append(code)
            options.append({
                "building_code":code, "target_level":level, "policy_id":policy,
                "modes":[quote(costs,duration,mode) for mode in _MODES],
                "available":not missing,"missing_prerequisites":sorted(set(missing)),
            })
    finished = db.execute(
        """SELECT building_code,level FROM urban_city_buildings
           WHERE city_id=%s ORDER BY building_code""",(city_id,),
    ).fetchall()
    return {
        "buildings":effect_state["buildings"],
        "active":_order_view(current) if current else None,
        "options":options,
        "effects":{
            "mine_additive_bonus":effect_state["mine_additive_bonus"],
            "capacity_bonus":effect_state["capacity_bonus"],
        },
    }


def _order_view(row: tuple) -> dict:
    return {
        "order_id":row[0], "building_code":row[1], "target_level":row[2],
        "mode":row[3], "policy_id":row[4],
        "applied_costs":row[5], "started_at":row[6],
        "due_at":row[7], "status":row[8], "completed_at":row[9],
        "historically_certified":False,
    }


def start_construction(
    db: psycopg.Connection, *,
    account_id: UUID, city_id: UUID, order_id: UUID,
    building_code: str, mode: str,
) -> dict:
    """Charge once, register job and audit in one transaction.

    Replays of the same order UUID reproduce the original receipt.
    No attacker, resource price or timestamp supplied by clients is trusted.
    """
    if not isinstance(building_code,str) or not _CODE.fullmatch(building_code):
        raise ValueError("Invalid building code")
    if mode not in _MODES:
        raise ValueError("Invalid urban build mode")
    with db.transaction():
        if not _owned_city(db,account_id,city_id,lock=True):
            raise ConstructionNotFound
        past = db.execute(
            """SELECT order_id,building_code,target_level,mode,policy_id,
                      applied_costs,started_at,due_at,status,completed_at,
                      actor_account_id,city_id
               FROM urban_construction_orders WHERE order_id=%s""",
            (order_id,),
        ).fetchone()
        if past:
            if past[10]!=account_id or past[11]!=city_id or past[1]!=building_code or past[3]!=mode:
                raise ConstructionConflict("Idempotency key belongs to another order")
            return {**_order_view(past[:10]),"replayed":True}
        busy = db.execute(
            """SELECT 1 FROM urban_construction_orders
               WHERE city_id=%s AND status='building'""",(city_id,),
        ).fetchone()
        if busy:
            raise ConstructionConflict("Only one active urban construction is permitted")
        existing = db.execute(
            "SELECT level FROM urban_city_buildings WHERE city_id=%s AND building_code=%s",
            (city_id,building_code),
        ).fetchone()
        next_level = (existing[0] if existing else 0)+1
        profile = db.execute(
            """SELECT b.policy_id,b.base_seconds,b.base_costs,
                      COALESCE(e.prerequisites,'{}'::jsonb)
               FROM urban_building_profiles b
               LEFT JOIN urban_effect_profiles e
                 ON e.building_code=b.building_code AND e.target_level=b.target_level
               WHERE b.building_code=%s AND b.target_level=%s AND b.enabled""",
            (building_code,next_level),
        ).fetchone()
        if not profile:
            raise ConstructionConflict("This building or upgrade has no approved experimental profile")
        policy_id,seconds,base_costs,prerequisites = profile
        active=resolve_city_effects(db,city_id)
        active_levels={x["building_code"]:x["level"]
                       for x in active["buildings"] if x["active"]}
        if any(active_levels.get(dep,0)<level for dep,level in prerequisites.items()):
            raise ConstructionConflict("Building prerequisites are not satisfied")
        if next_level>1 and active_levels.get(building_code,0)<next_level-1:
            raise ConstructionConflict("Cannot upgrade an inactive building")
        quoted = quote(base_costs,seconds,mode)
        resources = db.execute(
            """SELECT resource,amount FROM city_stocks WHERE city_id=%s
               ORDER BY resource FOR UPDATE""",(city_id,),
        ).fetchall()
        available = dict(resources)
        if any(available.get(resource,-1) < cost
               for resource,cost in quoted["costs"].items()):
            raise ConstructionConflict("Not enough resources to start construction")
        started = db.execute("SELECT clock_timestamp()").fetchone()[0]
        due = started+timedelta(seconds=quoted["duration_seconds"])
        for resource,cost in quoted["costs"].items():
            if cost:
                db.execute(
                    """UPDATE city_stocks SET amount=amount-%s
                       WHERE city_id=%s AND resource=%s AND amount >= %s""",
                    (cost,city_id,resource,cost),
                )
        db.execute(
            """INSERT INTO urban_construction_orders
               (order_id,city_id,actor_account_id,building_code,target_level,
                mode,policy_id,applied_costs,started_at,due_at,status)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'building')""",
            (order_id,city_id,account_id,building_code,next_level,mode,policy_id,
             Jsonb(quoted["costs"]),started,due),
        )
        db.execute(
            """INSERT INTO urban_construction_events
               (order_id,phase,occurred_at,details)
               VALUES(%s,'started',%s,%s)""",
            (order_id,started,Jsonb({
                "mode":mode,"costs":quoted["costs"],"policy_id":policy_id,
                "rounding_policy":_ROUNDING_POLICY,
            })),
        )
        return {**_order_view((
            order_id,building_code,next_level,mode,policy_id,quoted["costs"],
            started,due,"building",None,
        )),"replayed":False}


def run_construction_batch(
    db: psycopg.Connection, *, now_at: datetime | None = None, max_orders: int = 25,
) -> list[dict]:
    """One bounded worker batch; rows claimed through transactions, not Redis.

    PostgreSQL row locks fence simultaneous workers. A crash before commit
    rolls back the building level, finished state and audit together.
    """
    if not db.autocommit:
        raise ValueError("Construction worker needs an autocommit connection")
    if isinstance(max_orders,bool) or not isinstance(max_orders,int) or not 1 <= max_orders <= 500:
        raise ValueError("Invalid construction batch limit")
    if now_at is None:
        now_at = db.execute("SELECT clock_timestamp()").fetchone()[0]
    if not isinstance(now_at,datetime) or now_at.tzinfo is None or now_at.utcoffset() is None:
        raise ValueError("Worker clock must be timezone aware")
    now_at = now_at.astimezone(UTC)
    events = []
    for _ in range(max_orders):
        with db.transaction():
            job = db.execute(
                """SELECT order_id,city_id,building_code,target_level,due_at
                   FROM urban_construction_orders
                   WHERE status='building' AND due_at<=%s
                   ORDER BY due_at,order_id
                   FOR UPDATE SKIP LOCKED LIMIT 1""",
                (now_at,),
            ).fetchone()
            if job is None:
                break
            order_id,city_id,code,level,due = job
            if not db.execute(
                "SELECT city_id FROM cities WHERE city_id=%s FOR UPDATE",(city_id,),
            ).fetchone():
                raise RuntimeError("Construction lost its parent city")
            current = db.execute(
                """SELECT level FROM urban_city_buildings
                   WHERE city_id=%s AND building_code=%s FOR UPDATE""",
                (city_id,code),
            ).fetchone()
            if (current[0] if current else 0) + 1 != level:
                raise RuntimeError("Building level changed while job was pending")
            if current:
                db.execute(
                    """UPDATE urban_city_buildings SET level=%s,completed_at=%s
                       WHERE city_id=%s AND building_code=%s""",
                    (level,due,city_id,code),
                )
            else:
                db.execute(
                    """INSERT INTO urban_city_buildings
                       (city_id,building_code,level,completed_at)
                       VALUES(%s,%s,%s,%s)""",
                    (city_id,code,level,due),
                )
            count = db.execute(
                """UPDATE urban_construction_orders
                   SET status='completed',completed_at=%s
                   WHERE order_id=%s AND status='building'""",
                (due,order_id),
            )
            if count.rowcount != 1:
                raise RuntimeError("Construction completion CAS failed")
            db.execute(
                """INSERT INTO urban_construction_events
                   (order_id,phase,occurred_at,details)
                   VALUES(%s,'completed',%s,%s)""",
                (order_id,due,Jsonb({"building_code":code,"level":level})),
            )
            # Effects become eligible only from worker COMMIT time.
            # The economy worker uses as-of-tick START snapshots, so old
            # unsettled ticks never gain a newly finished building's bonus.
            persist_effect_snapshot(db,city_id=city_id,effective_at=now_at)
            events.append({
                "order_id":str(order_id),"city_id":str(city_id),
                "building_code":code,"target_level":level,
                "completed_at":due.isoformat(),
            })
    return events
