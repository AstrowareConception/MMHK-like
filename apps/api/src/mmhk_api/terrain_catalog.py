"""Trusted terrain qualifications, strictly independent of changing ownership.

Only operator/import functions write these site definitions. A qualified plot
does not itself grant influence, ownership, knowledge, or a right to colonize.
No randomly generated mines or fictitious historic distributions are used.
"""
from __future__ import annotations
from uuid import UUID
import psycopg
from psycopg.types.json import Jsonb
from .colonization import _validate_site


def register_qualified_terrain(
    db:psycopg.Connection,*,world_id:str,x:int,y:int,
    source_ref:str,mines:list[str],rates_per_day:dict,
    capacities:dict,tick_seconds:int,enabled:bool=True,
)->None:
    if (not isinstance(world_id,str) or not 1<=len(world_id)<=64
        or type(x) is not int or type(y) is not int
        or not isinstance(source_ref,str) or not 3<=len(source_ref)<=255
        or type(tick_seconds) is not int or not 1<=tick_seconds<=86400
        or type(enabled) is not bool):
        raise ValueError("Invalid qualified terrain provenance")
    types,rates,caps=_validate_site(mines,rates_per_day,capacities)
    with db.transaction():
        world=db.execute(
            "SELECT world_size FROM worlds WHERE world_id=%s",(world_id,),
        ).fetchone()
        if not world or not 1<=x<=world[0] or not 1<=y<=world[0]:
            raise ValueError("Terrain coordinates outside the registered world")
        db.execute(
            """INSERT INTO world_colonizable_terrain
               (world_id,x,y,source_ref,mine_types,rates_per_day,
                stock_capacities,tick_seconds,enabled)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (world_id,x,y,source_ref,Jsonb(types),Jsonb(rates),
             Jsonb(caps),tick_seconds,enabled),
        )


def qualify_terrain_batch(
    db:psycopg.Connection,*,world_id:str,entries:list[dict],
    expected_source_ref:str,
)->int:
    """Transactional manifest import: no partial publication on invalid entries."""
    if (not isinstance(entries,list) or not 1<=len(entries)<=250
        or not isinstance(expected_source_ref,str)
        or not 3<=len(expected_source_ref)<=255):
        raise ValueError("Invalid bounded operator terrain manifest")
    if len({(x.get("x"),x.get("y")) for x in entries if isinstance(x,dict)})!=len(entries):
        raise ValueError("Duplicate position in operator terrain manifest")
    with db.transaction():
        for entry in entries:
            if not isinstance(entry,dict) or set(entry)!={
                "x","y","source_ref","mines","rates_per_day","capacities",
                "tick_seconds"
            } or entry["source_ref"]!=expected_source_ref:
                raise ValueError("Manifest entry must contain a complete common provenance")
            register_qualified_terrain(
                db,world_id=world_id,x=entry["x"],y=entry["y"],
                source_ref=entry["source_ref"],mines=entry["mines"],
                rates_per_day=entry["rates_per_day"],
                capacities=entry["capacities"],
                tick_seconds=entry["tick_seconds"],enabled=True,
            )
    return len(entries)
