"""Experimental urban effects and prerequisite graph; never inferred S2 rules.

Effects become available when the construction worker *commits*, not at its
scheduled ETA. A dated snapshot is used per mine tick to avoid retroactive
production after downtime, and every completed level replaces its predecessor.
"""
from __future__ import annotations

import re
from datetime import datetime
from decimal import Decimal, InvalidOperation
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb

from .worlds import RESOURCE_NAMES

_CODE = re.compile(r"^[a-z][a-z0-9_]{1,47}$")
_BIGINT = 2**63-1
_MAX_BONUS = Decimal("100")

def validate_effect_profile(
    *, prerequisites: dict, mine_additive_bonus: dict,
    capacity_bonus: dict,
) -> tuple[dict[str,int],dict[str,str],dict[str,int]]:
    if not isinstance(prerequisites,dict) or not all(
        isinstance(k,str) and _CODE.fullmatch(k)
        and isinstance(v,int) and not isinstance(v,bool) and 1<=v<=100
        for k,v in prerequisites.items()
    ):
        raise ValueError("Invalid prerequisite building-level mapping")
    if not isinstance(mine_additive_bonus,dict) or not set(mine_additive_bonus) <= set(RESOURCE_NAMES):
        raise ValueError("Invalid mine bonus resources")
    bonuses={}
    for k,v in mine_additive_bonus.items():
        if isinstance(v,bool):
            raise ValueError("Invalid mine additive bonus")
        try:
            d=Decimal(str(v))
        except (InvalidOperation,ValueError,TypeError) as exc:
            raise ValueError("Invalid mine additive bonus") from exc
        if not d.is_finite() or not -1<=d<=_MAX_BONUS or d.as_tuple().exponent < -6:
            raise ValueError("Bonus requires [-1,100] and <=6 decimal places")
        bonuses[k]=str(d)
    if not isinstance(capacity_bonus,dict) or not set(capacity_bonus) <= set(RESOURCE_NAMES):
        raise ValueError("Invalid capacity bonus resources")
    if not all(isinstance(v,int) and not isinstance(v,bool) and 0<=v<=_BIGINT
               for v in capacity_bonus.values()):
        raise ValueError("Capacity bonuses must be nonnegative bigint")
    return dict(prerequisites),bonuses,dict(capacity_bonus)

def configure_effect_profile(
    db: psycopg.Connection, *, building_code: str, target_level: int,
    policy_id: str, prerequisites: dict, mine_additive_bonus: dict,
    capacity_bonus: dict,
) -> None:
    """Trusted, insert-only policy; cannot rewrite an already built level."""
    if not isinstance(building_code,str) or not _CODE.fullmatch(building_code):
        raise ValueError("Invalid building code")
    if not isinstance(target_level,int) or isinstance(target_level,bool) or not 1<=target_level<=100:
        raise ValueError("Invalid level")
    if not isinstance(policy_id,str) or not 1<=len(policy_id)<=100:
        raise ValueError("Versioned effects policy required")
    req,bonuses,caps=validate_effect_profile(
        prerequisites=prerequisites,mine_additive_bonus=mine_additive_bonus,
        capacity_bonus=capacity_bonus,
    )
    with db.transaction():
        if db.execute(
            "SELECT 1 FROM urban_city_buildings WHERE building_code=%s AND level>=%s LIMIT 1",
            (building_code,target_level),
        ).fetchone():
            raise ValueError("Cannot register retroactive effects for an already completed level")
        db.execute(
            """INSERT INTO urban_effect_profiles
               (building_code,target_level,prerequisites,mine_additive_bonus,
                capacity_bonus,effect_policy_id)
               VALUES(%s,%s,%s,%s,%s,%s)""",
            (building_code,target_level,Jsonb(req),Jsonb(bonuses),Jsonb(caps),policy_id),
        )

def resolve_city_effects(db: psycopg.Connection,city_id: UUID) -> dict:
    rows=db.execute(
        """SELECT b.building_code,b.level,b.operator_disabled,
                  COALESCE(p.prerequisites,'{}'::jsonb),
                  COALESCE(p.mine_additive_bonus,'{}'::jsonb),
                  COALESCE(p.capacity_bonus,'{}'::jsonb)
           FROM urban_city_buildings b
           LEFT JOIN urban_effect_profiles p
             ON p.building_code=b.building_code AND p.target_level=b.level
           WHERE b.city_id=%s ORDER BY b.building_code""",(city_id,),
    ).fetchall()
    entries={r[0]:r for r in rows}
    state:dict[str,bool]={}
    stack:set[str]=set()
    def enabled(code:str)->bool:
        if code not in entries:
            return False
        if code in state:
            return state[code]
        if code in stack:
            raise ValueError("Cyclic building prerequisites")
        stack.add(code)
        _name,level,disabled,prereqs,*_=entries[code]
        active=(not disabled) and all(
            enabled(dep) and entries[dep][1]>=required
            for dep,required in prereqs.items()
        )
        stack.remove(code)
        state[code]=active
        return active

    bonuses={r:Decimal(0) for r in RESOURCE_NAMES}
    capacities={r:0 for r in RESOURCE_NAMES}
    buildings=[]
    for code,level,disabled,req,mine,cap in rows:
        active=enabled(code)
        buildings.append({
            "building_code":code,"level":level,"active":active,
            "operator_disabled":disabled,
            "prerequisites":req,
        })
        if active:
            for resource,value in mine.items():
                bonuses[resource]+=Decimal(value)
            for resource,value in cap.items():
                capacities[resource]+=int(value)
    # A combined 100%+100% debuff may go below -1. Avoid negative production.
    if any(value < -1 or value>_MAX_BONUS for value in bonuses.values()):
        raise ValueError("Combined building bonuses outside safe range")
    if any(value>_BIGINT for value in capacities.values()):
        raise OverflowError("Combined storage bonus exceeds bigint")
    return {
        "buildings":buildings,
        "mine_additive_bonus":{k:str(v) for k,v in bonuses.items() if v},
        "capacity_bonus":{k:v for k,v in capacities.items() if v},
    }

def persist_effect_snapshot(
    db: psycopg.Connection, *, city_id:UUID, effective_at:datetime,
) -> dict:
    """Caller MUST own city row lock within its write transaction."""
    result=resolve_city_effects(db,city_id)
    revision=db.execute(
        """SELECT COALESCE(MAX(revision),0)+1 FROM city_economy_effect_snapshots
           WHERE city_id=%s""",(city_id,),
    ).fetchone()[0]
    db.execute(
        """INSERT INTO city_economy_effect_snapshots
           (city_id,revision,effective_at,mine_additive_bonus,capacity_bonus)
           VALUES(%s,%s,%s,%s,%s)""",
        (city_id,revision,effective_at,
         Jsonb(result["mine_additive_bonus"]),Jsonb(result["capacity_bonus"])),
    )
    return result

def set_building_operational(
    db:psycopg.Connection, *,city_id:UUID,building_code:str,enabled:bool,
) -> dict:
    """Operator-only suspension; dependents become INACTIVE, not destroyed."""
    if not isinstance(enabled,bool) or not _CODE.fullmatch(building_code):
        raise ValueError("Invalid operator action")
    with db.transaction():
        city=db.execute("SELECT city_id FROM cities WHERE city_id=%s FOR UPDATE",
                        (city_id,)).fetchone()
        if not city:
            raise ValueError("Unknown city")
        state=db.execute(
            "SELECT operator_disabled FROM urban_city_buildings WHERE city_id=%s AND building_code=%s",
            (city_id,building_code),
        ).fetchone()
        if not state:
            raise ValueError("Unknown completed building")
        if state[0] == (not enabled):
            return resolve_city_effects(db,city_id)
        db.execute(
            "UPDATE urban_city_buildings SET operator_disabled=%s WHERE city_id=%s AND building_code=%s",
            (not enabled,city_id,building_code),
        )
        at=db.execute("SELECT clock_timestamp()").fetchone()[0]
        return persist_effect_snapshot(db,city_id=city_id,effective_at=at)
