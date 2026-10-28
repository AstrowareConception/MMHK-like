"""Idempotent expansion of an EXPLICIT local sandbox, never a public seed.

Adds options to existing demo cities without resetting existing resources,
constructions, passwords, armies or hero rosters.
"""
from __future__ import annotations

import os
from uuid import uuid4

import psycopg
from psycopg.types.json import Jsonb
from .db import connect

POLICY="LOCAL-DEMO-CITY-V2-NOT-HISTORICAL"
RESOURCES=("gold","wood","ore","crystal","gems","sulfur","mercury")
def costs(gold=0,wood=0,ore=0,crystal=0):
    partial={"gold":gold,"wood":wood,"ore":ore,"crystal":crystal}
    return {k:partial.get(k,0) for k in RESOURCES}

# Per-building profiles are clearly synthetic. Dependencies follow the existing
# city / dwelling / tavern branches, without claiming historical costs.
BUILDINGS=[
    ("tavern",1,50,costs(20,8,4),{"village_hall":1},{},{}),
    ("recruit_t1",1,65,costs(20,12,7),{"village_hall":1},{},{}),
    ("recruit_t2",1,95,costs(35,24,15),{"recruit_t1":1},{},{}),
    ("fort",1,140,costs(45,30,25),{"village_hall":1},{},{}),
    ("town_hall",1,110,costs(38,22,15),{"village_hall":2},{"gold":"0.12"},{}),
    ("blacksmith",1,85,costs(28,18,13),{"village_hall":1},{},{}),
    ("mage_guild",1,125,costs(32,15,16,5),{"village_hall":2},{},{}),
    ("stables",1,95,costs(28,18,11),{"recruit_t1":1},{},{}),
    ("watchtower",1,95,costs(20,22,16),{"fort":1},{},{}),
    ("resource_silo",2,145,costs(36,22,10),{"marketplace":1},{},{"gold":400,"wood":400}),
    ("marketplace",2,135,costs(28,22,9),{"village_hall":1},{"wood":"0.25"},{}),
]
UNITS=[
    ("militia","Miliciens du Havre","recruit_t1",1,costs(gold=3,wood=1)),
    ("archers","Archers du Havre","recruit_t2",2,costs(gold=6,wood=2,ore=1)),
]

def expand_demo(db:psycopg.Connection)->dict:
    with db.transaction():
        cities=db.execute(
            """SELECT city_id FROM cities WHERE world_id='local-sandbox'
               ORDER BY city_id FOR UPDATE"""
        ).fetchall()
        if not cities:
            return {"expanded":False,"cities":0}
        for code,level,duration,price,prereq,bonus,capacity in BUILDINGS:
            db.execute(
                """INSERT INTO urban_building_profiles
                   (building_code,target_level,policy_id,base_seconds,base_costs)
                   VALUES(%s,%s,%s,%s,%s)
                   ON CONFLICT (building_code,target_level) DO NOTHING""",
                (code,level,POLICY,duration,Jsonb(price)),
            )
            # Never overwrite an operator-managed existing building policy.
            policy=db.execute(
                """SELECT policy_id FROM urban_building_profiles
                   WHERE building_code=%s AND target_level=%s""",
                (code,level),
            ).fetchone()
            if policy and policy[0]==POLICY:
                db.execute(
                    """INSERT INTO urban_effect_profiles
                       (building_code,target_level,prerequisites,mine_additive_bonus,
                        capacity_bonus,effect_policy_id)
                       VALUES(%s,%s,%s,%s,%s,%s)
                       ON CONFLICT(building_code,target_level) DO NOTHING""",
                    (code,level,Jsonb(prereq),Jsonb(bonus),Jsonb(capacity),POLICY),
                )
        for code,label,dwelling,tier,price in UNITS:
            db.execute(
                """INSERT INTO city_unit_profiles
                   (unit_code,display_name,dwelling_code,tier,unit_costs,policy_id)
                   VALUES(%s,%s,%s,%s,%s,%s)
                   ON CONFLICT(unit_code) DO NOTHING""",
                (code,label,dwelling,tier,Jsonb(price),POLICY),
            )
        for (city_id,) in cities:
            for code,amount in (("militia",18),("archers",8)):
                db.execute(
                    """INSERT INTO city_recruit_pools(city_id,unit_code,available)
                       VALUES(%s,%s,%s) ON CONFLICT(city_id,unit_code) DO NOTHING""",
                    (city_id,code,amount),
                )
            # Give the local POC one legitimate starting hero so that
            # hero management is visible even before tavern construction.
            if not db.execute("SELECT 1 FROM city_heroes WHERE city_id=%s LIMIT 1",(city_id,)).fetchone():
                owner=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",(city_id,)).fetchone()[0]
                db.execute(
                    """INSERT INTO city_heroes
                       (hero_id,city_id,owner_account_id,name,archetype)
                       VALUES(%s,%s,%s,%s,'might')""",
                    (uuid4(),city_id,owner,"Aldric du Havre"),
                )
            if not db.execute("SELECT 1 FROM city_hero_offers WHERE city_id=%s LIMIT 1",(city_id,)).fetchone():
                for name,archetype,price in (("Éléonore de l'Aube","magic",35),
                                              ("Gauvain des Remparts","might",28)):
                    db.execute(
                        """INSERT INTO city_hero_offers
                           (offer_id,city_id,hero_name,archetype,gold_cost,policy_id)
                           VALUES(%s,%s,%s,%s,%s,%s)""",
                        (uuid4(),city_id,name,archetype,price,POLICY),
                    )
    return {"expanded":True,"cities":len(cities),"policy":POLICY}


def main():
    if os.environ.get("MMHK_LOCAL_DEMO_ENABLED")!="true" or os.environ.get("PGDATABASE")!="mmhk_local":
        raise RuntimeError("Refusing demo expansion outside mmhk_local")
    with connect() as db:
        print(expand_demo(db))


if __name__=="__main__":
    main()
