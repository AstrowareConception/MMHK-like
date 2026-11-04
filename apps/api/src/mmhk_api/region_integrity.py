"""Operator-only, read-only regional cartography integrity audit.

The report never generates or fixes data. Missing region/deposit rows are
reported distinctly from contradictions; legacy cities remain untouched.
"""
from __future__ import annotations

from collections import Counter
from uuid import UUID

import psycopg

from .worlds import RESOURCE_NAMES

MAX_AUDIT_REGIONS = 400


def check_region_invariants(
    resources: list[str] | None,
    deposits: list[tuple[int,str,int,int]],
    mines: list[tuple[str,int|None,int|None]],
) -> list[str]:
    """Pure checks, usable without PostgreSQL."""
    failures: list[str] = []
    if resources is None:
        if deposits:
            failures.append("deposits_without_region")
        if mines:
            failures.append("city_without_region")
        return failures
    if len(resources) != 4 or any(r not in RESOURCE_NAMES for r in resources):
        failures.append("invalid_resource_composition")
        return failures

    if len(deposits) != 4:
        failures.append("incomplete_deposit_layout")
    slots = [row[0] for row in deposits]
    if sorted(slots) != list(range(4)):
        failures.append("invalid_deposit_slots")
    if len(deposits) == 4 and all(0 <= slot < 4 for slot in slots):
        # Ordering is by the stable slot ID, independent of query row order.
        by_slot = {slot: resource for slot,resource,*_ in deposits}
        if [by_slot.get(slot) for slot in range(4)] != resources:
            failures.append("resource_deposit_mismatch")

    locations = [(i,j) for _,_,i,j in deposits]
    if len(locations) != len(set(locations)) or any(
        type(i) is not int or type(j) is not int or
        not 0 <= i <= 4 or not 0 <= j <= 4 or (i,j)==(2,2)
        for i,j in locations
    ):
        failures.append("invalid_deposit_positions")

    if any(resource not in RESOURCE_NAMES or resource not in resources
           for resource,*_ in mines):
        failures.append("city_mine_resource_mismatch")
    if len(mines) > 4 or any(
        i is None or j is None for _,i,j in mines
    ):
        failures.append("unpositioned_city_mines")
    # A mine may retain its historical/legacy position even when the deposit
    # registry is being repaired; report rather than move its coordinates.
    deposit_positions = {
        (resource,i,j) for _,resource,i,j in deposits
    }
    if len(deposits)==4 and any(
        (resource,i,j) not in deposit_positions for resource,i,j in mines
    ):
        failures.append("city_mine_deposit_misalignment")
    return failures


def audit_world_regions(
    db: psycopg.Connection, world_id: str, limit: int = MAX_AUDIT_REGIONS,
) -> dict:
    if type(limit) is not int or not 1 <= limit <= MAX_AUDIT_REGIONS:
        raise ValueError("Audit limit must be between 1 and 400")
    world = db.execute(
        "SELECT 1 FROM worlds WHERE world_id=%s",(world_id,),
    ).fetchone()
    if world is None:
        raise ValueError("Unknown world")

    # Include city regions even if their resource rows are absent.
    regions = db.execute(
        """SELECT x,y FROM (
             SELECT x,y FROM world_region_resources WHERE world_id=%s
             UNION
             SELECT x,y FROM cities WHERE world_id=%s
           ) known
           ORDER BY x,y LIMIT %s""",
        (world_id,world_id,limit+1),
    ).fetchall()
    truncated=len(regions)>limit
    findings=[]
    for x,y in regions[:limit]:
        record=db.execute(
            """SELECT resources FROM world_region_resources
               WHERE world_id=%s AND x=%s AND y=%s""",
            (world_id,x,y),
        ).fetchone()
        deposits=db.execute(
            """SELECT slot,resource,i,j FROM world_region_deposits
               WHERE world_id=%s AND x=%s AND y=%s ORDER BY slot""",
            (world_id,x,y),
        ).fetchall()
        mines=db.execute(
            """SELECT m.resource,p.i,p.j FROM cities c
               JOIN city_mines m ON m.city_id=c.city_id
               LEFT JOIN city_mine_positions p
                 ON p.city_id=m.city_id AND p.resource=m.resource
               WHERE c.world_id=%s AND c.x=%s AND c.y=%s
               ORDER BY m.resource""",
            (world_id,x,y),
        ).fetchall()
        issues=check_region_invariants(
            list(record[0]) if record else None,
            list(deposits),list(mines),
        )
        if issues:
            findings.append({"x":x,"y":y,"issues":issues})
    return {
        "world_id":world_id,
        "inspected":min(limit,len(regions)),
        "truncated":truncated,
        "affected_regions":len(findings),
        "findings":findings,
        "read_only":True,
    }
