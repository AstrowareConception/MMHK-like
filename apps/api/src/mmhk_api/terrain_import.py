"""Strict LOCAL-only import of operator-supplied qualified terrain JSON.

No random mine rolls or undocumented historical location weights. Supports
absolute coordinates or offsets around this synthetic player's first city.
There is deliberately no HTTP import route.
"""
from __future__ import annotations
import argparse
import json
import os
import sys

from .db import connect
from .terrain_catalog import qualify_terrain_batch

MAX_MANIFEST_BYTES=512_000


def prepare(db,*,username:str,manifest:dict)->dict:
    if not isinstance(manifest,dict) or set(manifest)!={
        "world_id","source_ref","coordinate_mode","plots"
    }:
        raise ValueError("Terrain manifest has missing/unknown top-level fields")
    world=manifest["world_id"]
    source=manifest["source_ref"]
    mode=manifest["coordinate_mode"]
    plots=manifest["plots"]
    if world!="local-sandbox" or mode not in ("absolute","relative_to_first_city"):
        raise ValueError("Only explicit local-sandbox coordinates may be imported")
    if not isinstance(plots,list) or not 1<=len(plots)<=250:
        raise ValueError("Invalid bounded terrain catalog")
    world_row=db.execute(
        "SELECT world_size FROM worlds WHERE world_id=%s",(world,),
    ).fetchone()
    if not world_row:
        raise ValueError("Create the sandbox world before importing terrain")
    size=world_row[0]
    anchor=None
    if mode=="relative_to_first_city":
        anchor=db.execute(
            """SELECT c.x,c.y FROM cities c
               JOIN accounts a ON a.account_id=c.owner_account_id
               WHERE c.world_id=%s AND a.username=%s AND c.first_city""",
            (world,username),
        ).fetchone()
        if not anchor:
            raise ValueError("Local demo first city missing")
    entries=[]
    for plot in plots:
        if not isinstance(plot,dict) or not isinstance(source,str):
            raise ValueError("Malformed terrain catalog entry")
        expected={"mines","rates_per_day","capacities","tick_seconds"}
        coords={"x","y"} if mode=="absolute" else {"dx","dy"}
        if set(plot)!=expected|coords:
            raise ValueError("Unexpected per-plot fields")
        if mode=="absolute":
            x,y=plot["x"],plot["y"]
        else:
            dx,dy=plot["dx"],plot["dy"]
            if (type(dx) is not int or type(dy) is not int
                or not -20<=dx<=20 or not -20<=dy<=20
                or (dx==0 and dy==0)):
                raise ValueError("Invalid explicit relative laboratory coordinate")
            x=(anchor[0]-1+dx)%size+1
            y=(anchor[1]-1+dy)%size+1
        entries.append({
            "x":x,"y":y,"source_ref":source,
            "mines":plot["mines"],"rates_per_day":plot["rates_per_day"],
            "capacities":plot["capacities"],"tick_seconds":plot["tick_seconds"],
        })
    count=qualify_terrain_batch(
        db,world_id=world,entries=entries,expected_source_ref=source,
    )
    return {"world":world,"new_sites":count,"source_ref":source,
            "historically_certified_s2":False}


def main()->None:
    parser=argparse.ArgumentParser(description="Explicit LAB-only qualified terrain import")
    parser.add_argument("--username",default="joueurdemo")
    parser.add_argument("--enable-terrain-laboratory",action="store_true")
    args=parser.parse_args()
    if (not args.enable_terrain_laboratory or
        os.environ.get("PGDATABASE")!="mmhk_local" or
        os.environ.get("MMHK_LOCAL_DEMO_ENABLED")!="true"):
        parser.error("Denied outside the explicitly enabled local sandbox")
    raw=sys.stdin.buffer.read(MAX_MANIFEST_BYTES+1)
    if len(raw)>MAX_MANIFEST_BYTES:
        parser.error("Terrain manifest exceeds size limit")
    try:
        manifest=json.loads(raw)
    except (UnicodeError,ValueError) as exc:
        parser.error("Invalid UTF-8 JSON manifest: "+str(exc)[:100])
    with connect() as db:
        result=prepare(db,username=args.username,manifest=manifest)
    print("LOCAL qualified-terrain import; NOT MMHK S2:",result)

if __name__=="__main__":
    main()
