"""V104: qualify an EXISTING mine/deposit and let its owner unlock it.

Operator-only enrollment, player-controlled activation. No arbitrary rate,
resource, or position is ever inferred from a combat report. Only the
qualified guardian's persisted V103 clearance makes the gate unlockable.
"""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

import psycopg

from .forces import RecruitmentConflict, RecruitmentNotFound, _owned_city
from .worlds import RESOURCE_NAMES


def _valid_source(source: object) -> bool:
    return (type(source) is str and 3 <= len(source.strip()) <= 255 and
            not any(ord(ch) < 32 or ord(ch) == 127 for ch in source))


def qualify_lab_mine_unlock(
    db: psycopg.Connection, *, encounter_id: UUID, source_ref: str,
) -> dict:
    """Trusted operator command, only for a populated undisputed LAB deposit.

    The clock must have no unpaid whole ticks; otherwise enrolling a gate
    mid-catch-up would erase or retroactively credit prior mine production.
    This never changes the mine's rate, ownership, or stored resources.
    """
    if type(encounter_id) is not UUID or not _valid_source(source_ref):
        raise ValueError("A valid encounter UUID and attested source are required")
    with db.transaction():
        lookup=db.execute(
            "SELECT city_id FROM region_encounters WHERE encounter_id=%s",
            (encounter_id,),
        ).fetchone()
        if lookup is None:
            raise ValueError("Unknown laboratory encounter")
        city_id=lookup[0]
        db.execute("SELECT city_id FROM cities WHERE city_id=%s FOR UPDATE",
                   (city_id,))
        row=db.execute(
            """SELECT p.resource,d.slot,r.base_units_per_day,r.fractional_units,
                      clock.last_tick_at,clock.tick_seconds
               FROM region_encounters e
               JOIN cities c ON c.city_id=e.city_id
               JOIN city_mine_positions p ON p.city_id=c.city_id
                  AND p.i=e.cell_i AND p.j=e.cell_j
               JOIN world_region_deposits d
                  ON d.world_id=c.world_id AND d.x=c.x AND d.y=c.y
                  AND d.i=e.cell_i AND d.j=e.cell_j AND d.resource=p.resource
               JOIN world_region_resources wr
                  ON wr.world_id=d.world_id AND wr.x=d.x AND wr.y=d.y
               JOIN city_mine_rates r ON r.city_id=c.city_id
                  AND r.resource=p.resource
               JOIN city_economy_clock clock ON clock.city_id=c.city_id
               JOIN pve_travel_policies travel ON travel.world_id=c.world_id
               JOIN pve_lab_casualty_policies casualties
                  ON casualties.world_id=c.world_id
               JOIN pve_lab_neutral_resolution_policies neutral
                  ON neutral.world_id=c.world_id
               JOIN pve_lab_neutral_defender_profiles profile
                  ON profile.encounter_id=e.encounter_id
               WHERE e.encounter_id=%s AND NOT e.resolved
                  AND travel.historically_certified=false
                  AND left(travel.policy_id,4)='LAB-'
                  AND casualties.enabled AND neutral.enabled
                  AND profile.no_hero_confirmed AND profile.no_attrition_confirmed
                  AND clock.enabled AND r.base_units_per_day>0
                  AND cardinality(wr.resources)=4
               FOR UPDATE OF clock,r""",
            (encounter_id,),
        ).fetchone()
        if row is None:
            raise ValueError(
                "LAB mine requires an unresolved qualified guardian, a "
                "matching persisted natural deposit, and an existing active rate"
            )
        resource,slot,rate,fraction,last_at,tick_seconds=row
        if resource not in RESOURCE_NAMES or fraction != 0:
            raise ValueError("LAB mine requires an eligible resource with no accrued fraction")
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        if now < last_at or now >= last_at + __import__("datetime").timedelta(seconds=tick_seconds):
            raise ValueError("Settle unpaid economic ticks before qualifying a mine gate")
        prior=db.execute(
            "SELECT encounter_id,source_ref FROM city_lab_mine_unlocks "
            "WHERE city_id=%s AND resource=%s FOR UPDATE",
            (city_id,resource),
        ).fetchone()
        if prior:
            if prior!=(encounter_id,source_ref.strip()):
                raise ValueError("Mine already qualified with another guardian or source")
        else:
            db.execute(
                """INSERT INTO city_lab_mine_unlocks(
                    city_id,resource,encounter_id,deposit_slot,source_ref
                   ) VALUES(%s,%s,%s,%s,%s)""",
                (city_id,resource,encounter_id,slot,source_ref.strip()),
            )
    return {"city_id":str(city_id),"resource":resource,
            "encounter_id":str(encounter_id),"deposit_slot":slot,
            "base_units_per_day":str(rate),"gate_status":"guardian_pending",
            "source_ref":source_ref.strip(),"historically_certified":False}


def mine_unlocks_for_city(
    db: psycopg.Connection, *, owner: UUID, city_id: UUID,
) -> dict:
    """Owner-private view; no discovery of unqualified foreign deposits."""
    _owned_city(db,owner,city_id)
    rows=db.execute(
        """SELECT g.resource,g.deposit_slot,p.i,p.j,g.source_ref,
                  g.activated_at,g.activated_order_id,e.resolved,
                  n.mission_id,r.base_units_per_day
           FROM city_lab_mine_unlocks g
           JOIN city_mine_positions p
             ON p.city_id=g.city_id AND p.resource=g.resource
           JOIN city_mine_rates r
             ON r.city_id=g.city_id AND r.resource=g.resource
           JOIN region_encounters e ON e.encounter_id=g.encounter_id
             AND e.city_id=g.city_id
           LEFT JOIN pve_lab_neutral_resolutions n
             ON n.encounter_id=e.encounter_id
           WHERE g.city_id=%s ORDER BY g.resource""",
        (city_id,),
    ).fetchall()
    return {
        "city_id":str(city_id),"historically_certified":False,
        "scope":"LAB-QUALIFIED-NATURAL-MINES-V1",
        "mines":[{
            "resource":resource,"deposit_slot":slot,"i":i,"j":j,
            "state":("active" if activated_at else
                     "ready" if resolved and mission_id else "guarded"),
            "source_ref":source,"base_units_per_day":str(rate),
            "activated_at":activated_at.isoformat() if activated_at else None,
            "activated_order_id":str(oid) if oid else None,
        } for resource,slot,i,j,source,activated_at,oid,
              resolved,mission_id,rate in rows],
    }


def activate_lab_mine(
    db: psycopg.Connection, *, owner: UUID, city_id: UUID,
    resource: str, order_id: UUID,
) -> dict:
    """One and only one activation, validated against a persisted V103 victory.

    Caller owns the city and sends a stable idempotency UUID. A newer
    activation UUID cannot silently reactivate the same mine. Previous
    economic ticks are never recalculated or credited by this action.
    """
    if type(resource) is not str or resource not in RESOURCE_NAMES:
        raise RecruitmentConflict("Unknown mine resource")
    if type(order_id) is not UUID:
        raise RecruitmentConflict("Invalid idempotency UUID")
    with db.transaction():
        _owned_city(db,owner,city_id,lock=True)
        clock=db.execute(
            "SELECT last_tick_at,enabled FROM city_economy_clock "
            "WHERE city_id=%s FOR UPDATE",
            (city_id,),
        ).fetchone()
        if clock is None or not clock[1]:
            raise RecruitmentConflict("Mine economy is not configured")
        found=db.execute(
            """SELECT g.encounter_id,g.deposit_slot,g.activated_at,
                      g.activated_order_id,g.source_ref,
                      p.i,p.j,e.resolved,n.mission_id,
                      d.slot,r.base_units_per_day
               FROM city_lab_mine_unlocks g
               JOIN city_mine_positions p
                 ON p.city_id=g.city_id AND p.resource=g.resource
               JOIN region_encounters e ON e.encounter_id=g.encounter_id
                  AND e.city_id=g.city_id AND p.i=e.cell_i AND p.j=e.cell_j
               JOIN cities c ON c.city_id=g.city_id
               JOIN world_region_deposits d
                 ON d.world_id=c.world_id AND d.x=c.x AND d.y=c.y
                 AND d.i=p.i AND d.j=p.j AND d.resource=g.resource
               JOIN city_mine_rates r
                 ON r.city_id=g.city_id AND r.resource=g.resource
               LEFT JOIN pve_lab_neutral_resolutions n
                 ON n.encounter_id=g.encounter_id
               WHERE g.city_id=%s AND g.resource=%s
               FOR UPDATE OF g""",
            (city_id,resource),
        ).fetchone()
        if found is None:
            raise RecruitmentNotFound
        (encounter,slot,activated_at,previous_order,source,i,j,resolved,
         mission_id,deposit_slot,rate)=found
        if previous_order is not None:
            if previous_order!=order_id:
                raise RecruitmentConflict("Mine already activated with another order")
            return {"city_id":str(city_id),"resource":resource,
                    "status":"active","activated_at":activated_at.isoformat(),
                    "replayed":True,"source_ref":source,
                    "historically_certified":False}
        if slot!=deposit_slot or not resolved or mission_id is None:
            raise RecruitmentConflict("Qualifying neutral must be resolved before activation")
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        if now<clock[0]:
            raise RecruitmentConflict("Mine economy clock is ahead of server time")
        updated=db.execute(
            """UPDATE city_lab_mine_unlocks
               SET activated_at=%s,activated_order_id=%s,activated_by=%s
               WHERE city_id=%s AND resource=%s AND activated_at IS NULL
               RETURNING activated_at""",
            (now,order_id,owner,city_id,resource),
        ).fetchone()
        if updated is None:
            raise RecruitmentConflict("Mine activation already processed")
        return {"city_id":str(city_id),"resource":resource,
                "status":"active","activated_at":updated[0].isoformat(),
                "replayed":False,"source_ref":source,
                "historically_certified":False}
