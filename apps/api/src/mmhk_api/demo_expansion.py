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
        # Fully local test policies. Effects are descriptive and never
        # inserted as actual battle modifiers before verified integration.
        for code,name,slot,level,description in [
            ("bronze_helm","Heaume de bronze","head",1,"Protection légère, effet de combat non implémenté"),
            ("runic_sigil","Sceau des anciens","ring",1,"Inscription arcanique, bonus non appliqué"),
            ("warden_blade","Lame du veilleur","weapon",1,"Épée de garde, bonus non appliqué")
        ]:
            db.execute(
                """INSERT INTO artifact_profiles
                   (artifact_code,name,slot,required_level,effects,policy_id)
                   VALUES(%s,%s,%s,%s,%s,'LOCAL-DEMO-ARTIFACT-V1')
                   ON CONFLICT(artifact_code) DO NOTHING""",
                (code,name,slot,level,Jsonb({"description":description})),
            )
        for unit_code,lab_power in (("militia","2.000"),("archers","2.700")):
            db.execute(
                """UPDATE city_unit_profiles SET lab_duel_power=%s
                   WHERE unit_code=%s AND policy_id=%s AND lab_duel_power IS NULL""",
                (lab_power,unit_code,POLICY),
            )
        # Local-only route speed. 25 seconds per logical tile step, each leg
        # separately; NO assumption about Ubisoft travel, truce or rest rules.
        db.execute(
            """INSERT INTO pve_travel_policies(world_id,seconds_per_step,policy_id)
               VALUES('local-sandbox',25,'LAB-REGIONAL-TILE-STEPS-V1')
               ON CONFLICT(world_id) DO NOTHING"""
        )
        # Explicitly fictitious merchant rates, versioned and local-only.
        # Running the expansion again never changes a player's past purchases.
        for pay,receive,numerator,denominator in [
            ("wood","ore",1,2),("ore","wood",1,2),
            ("wood","crystal",1,4),("gold","ore",2,1),
        ]:
            db.execute(
                """INSERT INTO merchant_rate_policies
                   (world_id,pay_resource,receive_resource,policy_id,
                    numerator,denominator,enabled)
                   VALUES('local-sandbox',%s,%s,'LOCAL-DEMO-MERCHANT-V1',%s,%s,true)
                   ON CONFLICT DO NOTHING""",
                (pay,receive,numerator,denominator),
            )
        # Fixed-price offers are a separate, explicitly experimental lab.
        # No fee, auction or transport rate is taken from the archived client.
        db.execute(
            """INSERT INTO marketplace_policies
               (world_id,policy_id,enabled,max_quantity,max_price,
                min_duration_seconds,max_duration_seconds)
               VALUES('local-sandbox','LOCAL-FIXED-MARKET-V1',true,200,1000,60,86400)
               ON CONFLICT DO NOTHING"""
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
            # Populate the existing world only with declared laboratory opponents,
            # never with invented historic/production world placements.
            for i,j,name,unit,count,power in [
                (1,3,"Loups des bois","wolves",3,"1.100"),
                (3,1,"Brigands de la lisière","brigands",4,"1.400"),
            ]:
                db.execute(
                    """INSERT INTO region_encounters
                       (encounter_id,city_id,cell_i,cell_j,name,unit_code,
                        unit_count,unit_power,source_ref)
                       VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)
                       ON CONFLICT(city_id,cell_i,cell_j) DO NOTHING""",
                    (uuid4(),city_id,i,j,name,unit,count,power,"LOCAL-DEMO-PVE-V1"),
                )
            first_hero=db.execute(
                """SELECT hero_id FROM city_heroes WHERE city_id=%s
                   ORDER BY hired_at,hero_id LIMIT 1""",(city_id,),
            ).fetchone()
            if first_hero:
                for code,kind,hero in [
                    ("bronze_helm","bag",first_hero[0]),
                    ("runic_sigil","reserve",None),
                    ("warden_blade","reserve",None),
                ]:
                    seed_key=str(city_id)+":starter:"+code
                    db.execute(
                        """INSERT INTO city_artifacts
                           (artifact_id,city_id,artifact_code,location,hero_id,seed_key)
                           VALUES(%s,%s,%s,%s,%s,%s) ON CONFLICT(seed_key) DO NOTHING""",
                        (uuid4(),city_id,code,kind,hero,seed_key),
                    )
    return {"expanded":True,"cities":len(cities),"policy":POLICY}


def main():
    if os.environ.get("MMHK_LOCAL_DEMO_ENABLED")!="true" or os.environ.get("PGDATABASE")!="mmhk_local":
        raise RuntimeError("Refusing demo expansion outside mmhk_local")
    with connect() as db:
        print(expand_demo(db))


if __name__=="__main__":
    main()
