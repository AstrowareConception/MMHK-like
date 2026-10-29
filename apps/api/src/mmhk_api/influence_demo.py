"""Explicit LOCAL-ONLY four-day synthetic influence samples.

Nothing here is a historical power calculation. Each datum is labeled lab
fixture and never made available as a player-controlled API action.
"""
from __future__ import annotations
import argparse
import os
from datetime import UTC,datetime,timedelta

from .db import connect
from .dynamic_influence import configure_influence,record_daily_domination

WORLD="local-sandbox"
POLICY="LAB-FOUR-DAY-INVERSE-SQUARE-V1"
REF="LOCAL-INFLUENCE-OPERATOR-FIXTURE-2026"

def prepare(db,*,username:str,military_power:int)->dict:
    if not 0<=military_power<=1000000:
        raise ValueError("Invalid explicit laboratory military value")
    with db.transaction():
        owner=db.execute(
            """SELECT account_id FROM accounts WHERE username=%s""",
            (username,),
        ).fetchone()
        if not owner:
            raise ValueError("Sandbox demo account must already exist")
        owner=owner[0]
        cities=db.execute(
            """SELECT city_id FROM cities
               WHERE world_id=%s AND owner_account_id=%s""",
            (WORLD,owner),
        ).fetchall()
        if not cities:
            raise ValueError("Sandbox demo's first city must exist")
        if not db.execute(
            "SELECT 1 FROM world_influence_policies WHERE world_id=%s",
            (WORLD,),
        ).fetchone():
            configure_influence(db,world_id=WORLD,policy_id=POLICY,
                                period_seconds=86400,enabled=True)
        today=datetime.now(UTC).date()
        inserted=0
        for (city_id,) in cities:
            for day_back in range(1,5):
                day=today-timedelta(days=day_back)
                if db.execute(
                    """SELECT 1 FROM city_domination_samples
                       WHERE world_id=%s AND city_id=%s AND sample_day=%s""",
                    (WORLD,city_id,day),
                ).fetchone():
                    continue
                record_daily_domination(db,world_id=WORLD,city_id=city_id,
                                        owner=owner,day=day,
                                        military_power=military_power,
                                        building_domination=0,source_ref=REF)
                inserted+=1
        return {"world":WORLD,"owned_cities":len(cities),
                "new_daily_samples":inserted,"daily_power":military_power,
                "historically_certified_s2":False}

def main():
    parser=argparse.ArgumentParser(description="Opt-in local dynamic influence laboratory")
    parser.add_argument("--username",default="joueurdemo")
    parser.add_argument("--enable-influence-laboratory",action="store_true")
    parser.add_argument("--military-power",type=int,default=30000)
    args=parser.parse_args()
    if (not args.enable_influence_laboratory or
        os.environ.get("MMHK_LOCAL_DEMO_ENABLED")!="true" or
        os.environ.get("PGDATABASE")!="mmhk_local"):
        parser.error("Denied outside the explicit private mmhk_local experiment")
    with connect() as db:
        result=prepare(db,username=args.username,
                       military_power=args.military_power)
    print("LOCAL FOUR-DAY INFLUENCE (not S2 power):",result)
    print("The normal worker will publish the next territorial revision.")

if __name__=="__main__":
    main()
