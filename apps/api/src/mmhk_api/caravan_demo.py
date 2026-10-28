"""Opt-in, localhost-only SECOND city fixture for testing caravan deliveries.

Never executed by the production game or a normal local 'start'. Creating a
second city during newbie protection is LAB-ONLY and not permitted game logic.
"""
from __future__ import annotations

import argparse
import os
from uuid import uuid4

from .db import connect
from .security import USERNAME
from .worlds import RESOURCE_NAMES


def seed_second_lab_city(db, *, username: str) -> str:
    if not USERNAME.fullmatch(username):
        raise ValueError("Invalid demo username")
    row=db.execute(
        """SELECT c.city_id,c.x,c.y,w.world_size,a.account_id
           FROM cities c JOIN worlds w ON w.world_id=c.world_id
           JOIN accounts a ON a.account_id=c.owner_account_id
           WHERE w.world_id='local-sandbox' AND c.first_city
             AND a.username=%s""",(username,),
    ).fetchone()
    if not row:
        raise ValueError("Local demo world and first city required")
    first_id,x,y,size,owner=row
    existing=db.execute(
        """SELECT city_id FROM cities WHERE world_id='local-sandbox'
           AND owner_account_id=%s AND name='Comptoir des caravanes (laboratoire)'""",
        (owner,),
    ).fetchone()
    if existing:
        return str(existing[0])
    # Only inside sandbox; choose free position, do not displace player cities.
    nearby=[((x+offset-1)%size+1,y) for offset in range(3,size+1)]
    cell=next(((xx,yy) for xx,yy in nearby if not db.execute(
        "SELECT 1 FROM cities WHERE world_id='local-sandbox' AND x=%s AND y=%s",
        (xx,yy),
    ).fetchone()),None)
    if not cell:
        raise ValueError("No free demo location for caravan test")
    new_id=uuid4()
    db.execute(
        """INSERT INTO cities(city_id,world_id,owner_account_id,name,x,y,first_city)
           VALUES(%s,'local-sandbox',%s,'Comptoir des caravanes (laboratoire)',%s,%s,false)""",
        (new_id,owner,cell[0],cell[1]),
    )
    for resource in RESOURCE_NAMES:
        db.execute(
            """INSERT INTO city_stocks(city_id,resource,amount,capacity)
               VALUES(%s,%s,0,1000)""",
            (new_id,resource),
        )
    return str(new_id)


def main() -> None:
    parser=argparse.ArgumentParser(description="Explicit LAB second-city fixture for caravans")
    parser.add_argument("--username",required=True)
    parser.add_argument("--enable-second-city",action="store_true")
    args=parser.parse_args()
    if (not args.enable_second_city or os.environ.get("MMHK_LOCAL_DEMO_ENABLED")!="true"
        or os.environ.get("PGDATABASE")!="mmhk_local"):
        parser.error("Denied outside explicit LOCAL experiment")
    with connect() as db:
        with db.transaction():
            cid=seed_second_lab_city(db,username=args.username)
    print("Laboratory destination created/preserved:",cid)
    print("This is NOT a valid second-city acquisition during seven-day newbie protection.")


if __name__=="__main__":
    main()
