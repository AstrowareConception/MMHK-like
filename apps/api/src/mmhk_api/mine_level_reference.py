"""Read-only G11 mine progression reference, NOT an executable upgrade.

The November 2013 guide supplies nine normal price/duration levels and a
base daily yield per mine level. Actual city mine levels, hero prerequisites,
historical rounding and extension stacking have NOT been qualified.
Never mutate city_mine_rates or infer levels from an experimental rate.
"""
from __future__ import annotations

from uuid import UUID

import psycopg

from .forces import _owned_city
from .worlds import RESOURCE_NAMES

G11_UPGRADE_GOLD_COSTS=(1000,2000,3000,5000,8000,13000,21000,34000,55000)
G11_BASE_DAILY_PER_LEVEL={
    "gold":2000,"wood":2,"ore":2,"crystal":1,
    "gems":1,"sulfur":1,"mercury":1,
}
SOURCE_REF="G11-NOVEMBER-2013-MINE-GUIDE"
POLICY_ID="G11-DOCUMENTARY-MINE-LEVELS-V1"


def g11_level_steps(resource: str) -> list[dict]:
    """Every normal 1->2 .. 9->10 step; no unqualified fast/economy rounding."""
    if type(resource) is not str or resource not in G11_BASE_DAILY_PER_LEVEL:
        raise ValueError("Unknown mine resource")
    per_level=G11_BASE_DAILY_PER_LEVEL[resource]
    return [{
        "from_level":i,
        "to_level":i+1,
        "cost_gold":gold,
        "base_duration_hours":gold//1000,
        "base_daily_before":per_level*i,
        "base_daily_after":per_level*(i+1),
        "production_continues_during_level_work":True,
        "reference_only":True,
    } for i,gold in enumerate(G11_UPGRADE_GOLD_COSTS,1)]


def owned_city_mine_level_reference(
    db: psycopg.Connection, *, owner: UUID, city_id: UUID,
) -> dict:
    """A player sees reference values only for owned EXISTING mine types.

    No level or cost is manufactured for a city where no current mine-level
    data exists. No orders, expenses or stock updates occur.
    """
    _owned_city(db,owner,city_id)
    names=[row[0] for row in db.execute(
        "SELECT resource FROM city_mines WHERE city_id=%s ORDER BY resource",
        (city_id,),
    ).fetchall()]
    if any(resource not in RESOURCE_NAMES for resource in names):
        raise ValueError("Unrecognized city mine resource")
    return {
        "city_id":str(city_id),
        "source_ref":SOURCE_REF,
        "policy_id":POLICY_ID,
        "mine_max_level":10,
        "documentary_only":True,
        "current_mine_levels_known":False,
        "hero_prerequisites_qualified":False,
        "fast_economic_mode_rounding_qualified":False,
        "extension_stacking_qualified":False,
        "upgrades_executable":False,
        "historically_certified_s2":False,
        "mines":[{"resource":code,"steps":g11_level_steps(code)} for code in names],
    }
