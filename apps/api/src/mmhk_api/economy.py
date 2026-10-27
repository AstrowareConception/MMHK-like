"""Deterministic, transactionally credited PostgreSQL mine production.

Purely experimental rates: no Ubisoft S2 production coefficients inferred.
PostgreSQL is the authority; Redis must never own stock balances.
"""
from __future__ import annotations

from datetime import UTC, datetime, timedelta
from decimal import Decimal, InvalidOperation, ROUND_DOWN, localcontext
from uuid import UUID

import psycopg

from .worlds import HAVEN_FIRST_MINES

_DAY = Decimal(86400)
_PRECISION = Decimal("0.000000000000000001")
_BIGINT = 2**63 - 1


def _decimal(value: object, name: str) -> Decimal:
    if isinstance(value, bool):
        raise ValueError(f"Invalid {name}")
    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"Invalid {name}") from exc
    if not result.is_finite():
        raise ValueError(f"Invalid {name}")
    return result


def configure_haven_mines(
    db: psycopg.Connection,
    *,
    city_id: UUID,
    rates_per_day: dict[str, object],
    capacities: dict[str, int],
    tick_seconds: int,
    started_at: datetime | None = None,
) -> None:
    """Trusted administrative configuration, not a player/API operation.

    Configuration is intentionally insert-only. Editing a live rate requires
    a future explicit catch-up + audit procedure, not silent retroactivity.
    """
    if isinstance(tick_seconds, bool) or not isinstance(tick_seconds, int) or not 1 <= tick_seconds <= 86400:
        raise ValueError("Invalid tick duration")
    if set(rates_per_day) != set(HAVEN_FIRST_MINES) or set(capacities) != set(HAVEN_FIRST_MINES):
        raise ValueError("All four Haven mine types need explicit rates and capacities")
    valid_rates: dict[str, Decimal] = {}
    for resource, value in rates_per_day.items():
        rate = _decimal(value, f"{resource} rate")
        if not 0 <= rate <= Decimal("999999999999.999999") or rate.as_tuple().exponent < -6:
            raise ValueError("Rate must be a nonnegative decimal with up to six digits after the point")
        valid_rates[resource] = rate
    for resource, cap in capacities.items():
        if isinstance(cap, bool) or not isinstance(cap, int) or not 0 <= cap <= _BIGINT:
            raise ValueError(f"Invalid {resource} capacity")
    if started_at is not None and (started_at.tzinfo is None or started_at.utcoffset() is None):
        raise ValueError("Start time must be timezone aware")
    with db.transaction():
        first = db.execute(
            """SELECT first_city FROM cities WHERE city_id=%s FOR UPDATE""",
            (city_id,),
        ).fetchone()
        if not first or not first[0]:
            raise ValueError("Only an existing first city can use the initial Haven fixture")
        mines = {r[0] for r in db.execute(
            "SELECT resource FROM city_mines WHERE city_id=%s", (city_id,)
        ).fetchall()}
        if mines != set(HAVEN_FIRST_MINES):
            raise ValueError("This city does not have the designated Haven mines")
        if started_at is None:
            started_at = db.execute("SELECT clock_timestamp()").fetchone()[0]
        db.execute(
            """INSERT INTO city_economy_clock
               (city_id,tick_seconds,last_tick_at,enabled)
               VALUES(%s,%s,%s,true)""",
            (city_id, tick_seconds, started_at),
        )
        for resource in HAVEN_FIRST_MINES:
            result = db.execute(
                """UPDATE city_stocks SET capacity=%s
                   WHERE city_id=%s AND resource=%s AND amount<=%s""",
                (capacities[resource], city_id, resource, capacities[resource]),
            )
            if result.rowcount != 1:
                raise ValueError("Stock missing or higher than configured capacity")
            db.execute(
                """INSERT INTO city_mine_rates(city_id,resource,base_units_per_day)
                   VALUES(%s,%s,%s)""",
                (city_id, resource, valid_rates[resource]),
            )


def _utc(value: datetime) -> datetime:
    if not isinstance(value, datetime) or value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("A timezone-aware server clock is required")
    return value.astimezone(UTC)


def run_economy_batch(
    db: psycopg.Connection, *, now_at: datetime | None = None,
    max_cities: int = 25, max_ticks_per_city: int = 96,
) -> list[dict]:
    """Process due cities one transaction each, with FOR UPDATE SKIP LOCKED.

    Pass an AUTOCOMMIT connection. A fixed clock can be injected for tests;
    production uses PostgreSQL's clock_timestamp(), never a browser timestamp.
    """
    if not db.autocommit:
        raise ValueError("Economy worker needs an autocommit connection")
    if isinstance(max_cities, bool) or not isinstance(max_cities, int) or not 1 <= max_cities <= 500:
        raise ValueError("Invalid economy batch limit")
    if isinstance(max_ticks_per_city, bool) or not isinstance(max_ticks_per_city, int) or not 1 <= max_ticks_per_city <= 10000:
        raise ValueError("Invalid catch-up limit")
    now = _utc(now_at if now_at is not None else db.execute("SELECT clock_timestamp()").fetchone()[0])
    events: list[dict] = []
    for _ in range(max_cities):
        with db.transaction():
            row = db.execute(
                """SELECT city_id,tick_seconds,last_tick_at,revision
                   FROM city_economy_clock
                   WHERE enabled AND last_tick_at +
                     tick_seconds * interval '1 second' <= %s
                   ORDER BY last_tick_at,city_id
                   FOR UPDATE SKIP LOCKED
                   LIMIT 1""",
                (now,),
            ).fetchone()
            if row is None:
                break
            city_id, tick_seconds, previous_at, revision = row
            elapsed = now - previous_at
            elapsed_microseconds = ((elapsed.days * 86400 + elapsed.seconds) * 1_000_000
                                    + elapsed.microseconds)
            elapsed_ticks = elapsed_microseconds // (tick_seconds * 1_000_000)
            ticks = min(elapsed_ticks, max_ticks_per_city)
            # Latest snapshot at the START of the first unpaid tick.
            active_effect = db.execute(
                """SELECT mine_additive_bonus,capacity_bonus
                   FROM city_economy_effect_snapshots
                   WHERE city_id=%s AND effective_at<=%s
                   ORDER BY effective_at DESC,revision DESC LIMIT 1""",
                (city_id,previous_at),
            ).fetchone()
            effective_bonus,effective_cap = active_effect or ({},{})
            # A newer effect cannot be applied to ticks that started before it
            # became effective. Split catch-up at that tick boundary.
            upcoming = db.execute(
                """SELECT effective_at FROM city_economy_effect_snapshots
                   WHERE city_id=%s AND effective_at>%s
                   ORDER BY effective_at,revision LIMIT 1""",
                (city_id,previous_at),
            ).fetchone()
            if upcoming:
                until = upcoming[0] - previous_at
                micros = ((until.days*86400+until.seconds)*1000000
                          +until.microseconds)
                # Number of whole intervals whose START is before change.
                pre_change_ticks = (micros + tick_seconds*1000000-1)//(
                    tick_seconds*1000000)
                ticks = min(ticks,pre_change_ticks)
            if ticks < 1:
                raise RuntimeError("Due-city clock calculation violated its invariant")
            delta = timedelta(seconds=ticks * tick_seconds)
            to_at = previous_at + delta
            rates = db.execute(
                """SELECT r.resource,r.base_units_per_day,r.additive_bonus,
                          r.fractional_units,s.amount,s.capacity
                   FROM city_mine_rates r JOIN city_stocks s
                   ON s.city_id=r.city_id AND s.resource=r.resource
                   WHERE r.city_id=%s
                   ORDER BY r.resource FOR UPDATE OF r,s""",
                (city_id,),
            ).fetchall()
            if {r[0] for r in rates} != set(HAVEN_FIRST_MINES):
                raise RuntimeError("An enabled economy city needs exactly its four configured Haven mines")
            credits: dict[str, int] = {}
            overflow: dict[str, int] = {}
            for resource, base, bonus, carry, amount, cap in rates:
                if cap is None:
                    raise RuntimeError("Every producing mine needs a storage capacity")
                bonus = bonus + Decimal(effective_bonus.get(resource,"0"))
                cap = cap + int(effective_cap.get(resource,0))
                if bonus < -1 or bonus > 100 or cap > _BIGINT:
                    raise RuntimeError("Building economic effect exceeds safe bounds")
                # Avoid losing the remainder of very large yet valid
                # rate*duration values under Decimal's default 28-digit context.
                with localcontext() as context:
                    context.prec = 60
                    generated = (base * (Decimal(1) + bonus) *
                                 Decimal(ticks * tick_seconds) / _DAY + carry)
                    whole = int(generated.to_integral_value(rounding=ROUND_DOWN))
                    fractional = (generated - whole).quantize(
                        _PRECISION, rounding=ROUND_DOWN,
                    )
                credited = min(whole, max(0, cap - amount))
                wasted = whole - credited
                if amount + credited > _BIGINT:
                    raise OverflowError("Resource stock exceeds signed bigint")
                # When storage fills, all subsequent production is lost, not banked.
                if (amount + credited >= cap) and generated > 0:
                    fractional = Decimal(0)
                db.execute(
                    """UPDATE city_stocks SET amount=amount+%s
                       WHERE city_id=%s AND resource=%s""",
                    (credited, city_id, resource),
                )
                db.execute(
                    """UPDATE city_mine_rates SET fractional_units=%s
                       WHERE city_id=%s AND resource=%s""",
                    (fractional, city_id, resource),
                )
                credits[resource] = credited
                overflow[resource] = wasted
            changed = db.execute(
                """UPDATE city_economy_clock
                   SET last_tick_at=%s,revision=revision+1
                   WHERE city_id=%s AND revision=%s""",
                (to_at, city_id, revision),
            )
            if changed.rowcount != 1:
                raise RuntimeError("Economy clock revision conflict")
            db.execute(
                """INSERT INTO city_economy_events
                   (city_id,revision,from_at,to_at,ticks,credits,overflow)
                   VALUES(%s,%s,%s,%s,%s,%s,%s)""",
                (city_id, revision + 1, previous_at, to_at, ticks,
                 psycopg.types.json.Jsonb(credits),
                 psycopg.types.json.Jsonb(overflow)),
            )
            events.append({
                "city_id": str(city_id), "revision": revision + 1,
                "ticks": ticks, "to_at": to_at.isoformat(),
                "credits": credits, "overflow": overflow,
            })
    return events
