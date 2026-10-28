"""Opt-in localhost-only colony sites and eight-day-old synthetic membership.

This is an operator test fixture, NOT a player cancellation of 7-day newcomer
protection and NOT a normal second-city acquisition. Never enabled on public API.
All policy costs, mine types, rates and timings are labelled experimental.
"""
from __future__ import annotations

import argparse
import os
from datetime import timedelta

from .colonization import configure_colonization_policy,configure_colony_site
from .db import connect
from .security import USERNAME
from .worlds import RESOURCE_NAMES

WORLD="local-sandbox"
SOURCE_REF="LOCAL-COLONIZATION-LAB-EXPLICIT-2026"
POLICY="LOCAL-COLONY-EXPERIMENTAL-V1"
MINE_TYPES=["gold","wood","ore","crystal"]
RATES={"gold":24,"wood":12,"ore":12,"crystal":6}
COSTS={k:{"gold":20,"wood":5,"ore":5}.get(k,0) for k in RESOURCE_NAMES}
CAPACITIES={k:1000 for k in RESOURCE_NAMES}


def prepare(db,*,username:str,age_membership:bool)->dict:
    if not USERNAME.fullmatch(username):
        raise ValueError("Invalid local username")
    row=db.execute(
        """SELECT c.city_id,c.x,c.y,w.world_size,a.account_id
           FROM cities c
           JOIN worlds w ON w.world_id=c.world_id
           JOIN accounts a ON a.account_id=c.owner_account_id
           WHERE w.world_id=%s AND a.username=%s AND c.first_city""",
        (WORLD,username),
    ).fetchone()
    if not row:
        raise ValueError("The first local sandbox city must exist")
    city,x,y,size,owner=row
    with db.transaction():
        if not db.execute(
            "SELECT 1 FROM colonization_world_policies WHERE world_id=%s",
            (WORLD,),
        ).fetchone():
            configure_colonization_policy(
                db,world_id=WORLD,policy_id=POLICY,costs=COSTS,
                max_owned_cities=4,max_distance_steps=3,
                seconds_per_step=15,enabled=True,
            )
        positions=[]
        for step in (1,2):
            xx=(x+step-1)%size+1
            yy=y
            if db.execute(
                "SELECT 1 FROM cities WHERE world_id=%s AND x=%s AND y=%s",
                (WORLD,xx,yy),
            ).fetchone():
                continue
            control=db.execute(
                """SELECT controller_account_id FROM map_influence_cells
                   WHERE world_id=%s AND x=%s AND y=%s""",
                (WORLD,xx,yy),
            ).fetchone()
            if control and control[0]!=owner:
                continue   # Never overwrite someone else's existing influence.
            if not control:
                db.execute(
                    """INSERT INTO map_influence_cells
                       (world_id,x,y,controller_account_id,source_ref)
                       VALUES(%s,%s,%s,%s,%s)""",
                    (WORLD,xx,yy,owner,SOURCE_REF),
                )
            plot=db.execute(
                """SELECT source_ref FROM colonization_site_profiles
                   WHERE world_id=%s AND x=%s AND y=%s""",
                (WORLD,xx,yy),
            ).fetchone()
            if plot is not None and plot[0]!=SOURCE_REF:
                continue   # A separately qualified operator site is not reset.
            if not plot:
                configure_colony_site(
                    db,world_id=WORLD,x=xx,y=yy,source_ref=SOURCE_REF,
                    mines=MINE_TYPES,rates_per_day=RATES,
                    capacities=CAPACITIES,tick_seconds=60,enabled=True,
                )
            positions.append((xx,yy))
        if age_membership:
            db.execute(
                """UPDATE world_memberships
                   SET joined_at=LEAST(joined_at,
                     clock_timestamp()-interval '8 days')
                   WHERE world_id=%s AND account_id=%s""",
                (WORLD,owner),
            )
    return {"world":WORLD,"first_city":str(city),
            "qualified_lab_sites":positions,
            "membership_aged_for_test":age_membership,
            "historically_certified":False}


def main():
    parser=argparse.ArgumentParser(description="Manual LOCAL colonization test fixture")
    parser.add_argument("--username",default="joueurdemo")
    parser.add_argument("--enable-colony-laboratory",action="store_true")
    parser.add_argument("--age-membership-for-test",action="store_true")
    args=parser.parse_args()
    if (not args.enable_colony_laboratory or
        os.environ.get("MMHK_LOCAL_DEMO_ENABLED")!="true" or
        os.environ.get("PGDATABASE")!="mmhk_local"):
        parser.error("Denied: explicit opt-in and local database are both required")
    with connect() as db:
        data=prepare(db,username=args.username,
                     age_membership=args.age_membership_for_test)
    print("LOCAL COLONIZATION LABORATORY (NOT S2 RULES):",data)
    if args.age_membership_for_test:
        print("ONLY in this sandbox the membership was aged 8 days for tests.")
    print("Normal players never gain the ability to cancel beginner protection.")


if __name__=="__main__":
    main()
