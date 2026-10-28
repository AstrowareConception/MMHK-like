"""Incremental real recruit and hero roster, scoped to owned city.

All state is PostgreSQL; player never supplies prices, hero stats, unit stock
or building prerequisites. Policies are explicitly experimental, and available
only where a trusted administrator has configured city pools / tavern offers.
"""
from __future__ import annotations

from uuid import UUID, uuid4

import psycopg
from psycopg.types.json import Jsonb

from .building_effects import resolve_city_effects
from .worlds import RESOURCE_NAMES


class RecruitmentNotFound(Exception):
    pass


class RecruitmentConflict(Exception):
    pass


def _owned_city(db: psycopg.Connection, owner: UUID, city_id: UUID, *, lock: bool = False) -> None:
    found = db.execute(
        """SELECT c.city_id FROM cities c
           JOIN world_memberships w ON w.world_id=c.world_id AND w.account_id=%s
           WHERE c.city_id=%s AND c.owner_account_id=%s""" +
        (" FOR UPDATE OF c" if lock else ""),
        (owner, city_id, owner),
    ).fetchone()
    if found is None:
        raise RecruitmentNotFound


def _levels(db: psycopg.Connection, city_id: UUID) -> set[str]:
    return {r["building_code"] for r in resolve_city_effects(db, city_id)["buildings"] if r["active"]}


def city_forces(db: psycopg.Connection, *, owner: UUID, city_id: UUID) -> dict:
    _owned_city(db, owner, city_id)
    buildings = _levels(db, city_id)
    troops = db.execute(
        """SELECT g.unit_code,p.display_name,g.quantity,p.tier
           FROM city_garrison_units g JOIN city_unit_profiles p USING(unit_code)
           WHERE g.city_id=%s AND g.quantity>0
           ORDER BY p.tier,p.unit_code""", (city_id,),
    ).fetchall()
    recruits = db.execute(
        """SELECT p.unit_code,p.display_name,p.dwelling_code,p.tier,p.unit_costs,
                  p.policy_id,COALESCE(q.available,0)
           FROM city_unit_profiles p
           LEFT JOIN city_recruit_pools q ON q.unit_code=p.unit_code AND q.city_id=%s
           WHERE p.enabled AND (q.city_id IS NOT NULL)
           ORDER BY p.tier,p.unit_code""", (city_id,),
    ).fetchall()
    heroes = db.execute(
        """SELECT hero_id,name,archetype,level,experience,status,hired_at
           FROM city_heroes WHERE city_id=%s AND owner_account_id=%s
           ORDER BY hired_at,hero_id""", (city_id,owner),
    ).fetchall()
    offers = db.execute(
        """SELECT offer_id,hero_name,archetype,gold_cost,policy_id
           FROM city_hero_offers WHERE city_id=%s AND available
           ORDER BY hero_name,offer_id""", (city_id,),
    ).fetchall()
    return {
        "city_id": str(city_id),
        "garrison": [
            {"unit_code":a,"name":b,"quantity":c,"tier":d} for a,b,c,d in troops
        ],
        "recruitment": [
            {"unit_code":code,"name":name,"dwelling_code":dwelling,"tier":tier,
             "unit_costs":costs,"policy_id":policy,
             "available":available,"unlocked":dwelling in buildings}
            for code,name,dwelling,tier,costs,policy,available in recruits
        ],
        "heroes": [
            {"hero_id":str(hid),"name":name,"archetype":arc,"level":level,
             "experience":xp,"status":status,"hired_at":time.isoformat()}
            for hid,name,arc,level,xp,status,time in heroes
        ],
        "hero_offers": [
            {"offer_id":str(oid),"name":name,"archetype":arc,
             "gold_cost":cost,"policy_id":policy}
            for oid,name,arc,cost,policy in offers
        ] if "tavern" in buildings else [],
        "tavern_unlocked": "tavern" in buildings,
        "hero_capacity": 3,  # experimental slice, not a certified S2 limit
        "historically_certified": False,
    }


def recruit_units(db: psycopg.Connection, *, owner: UUID, city_id: UUID, order_id: UUID,
                  unit_code: str, quantity: int) -> dict:
    if type(quantity) is not int or not 1 <= quantity <= 1000:
        raise RecruitmentConflict("Quantity must be between 1 and 1000")
    with db.transaction():
        _owned_city(db, owner, city_id, lock=True)
        prior = db.execute(
            """SELECT city_id,actor_account_id,unit_code,quantity,applied_costs,completed_at
               FROM unit_recruitment_orders WHERE order_id=%s""", (order_id,),
        ).fetchone()
        if prior:
            if prior[:4] != (city_id,owner,unit_code,quantity):
                raise RecruitmentConflict("Order ID already used")
            return {"order_id":str(order_id),"unit_code":unit_code,"quantity":quantity,
                    "applied_costs":prior[4],"completed_at":prior[5].isoformat(),
                    "replayed":True}
        profile = db.execute(
            """SELECT dwelling_code,unit_costs FROM city_unit_profiles
               WHERE unit_code=%s AND enabled""",(unit_code,),
        ).fetchone()
        if profile is None or profile[0] not in _levels(db,city_id):
            raise RecruitmentConflict("Dwelling unavailable")
        pool = db.execute(
            """SELECT available FROM city_recruit_pools
               WHERE city_id=%s AND unit_code=%s FOR UPDATE""",(city_id,unit_code),
        ).fetchone()
        if pool is None or pool[0] < quantity:
            raise RecruitmentConflict("Not enough recruits available")
        costs = profile[1]
        if set(costs) != set(RESOURCE_NAMES):
            raise RecruitmentConflict("Unit policy invalid")
        total = {k:int(value)*quantity for k,value in costs.items()}
        stocks = dict(db.execute(
            "SELECT resource,amount FROM city_stocks WHERE city_id=%s FOR UPDATE",
            (city_id,),
        ).fetchall())
        if any(stocks.get(k,-1) < amount for k,amount in total.items()):
            raise RecruitmentConflict("Insufficient resources")
        for kind,amount in total.items():
            if amount:
                result=db.execute(
                    """UPDATE city_stocks SET amount=amount-%s
                       WHERE city_id=%s AND resource=%s AND amount>=%s""",
                    (amount,city_id,kind,amount),
                )
                if result.rowcount != 1:
                    raise RecruitmentConflict("Resource balance changed")
        db.execute(
            """UPDATE city_recruit_pools SET available=available-%s
               WHERE city_id=%s AND unit_code=%s""",(quantity,city_id,unit_code),
        )
        db.execute(
            """INSERT INTO city_garrison_units(city_id,unit_code,quantity)
               VALUES(%s,%s,%s)
               ON CONFLICT(city_id,unit_code)
               DO UPDATE SET quantity=city_garrison_units.quantity+EXCLUDED.quantity""",
            (city_id,unit_code,quantity),
        )
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        db.execute(
            """INSERT INTO unit_recruitment_orders
               (order_id,city_id,actor_account_id,unit_code,quantity,applied_costs,completed_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s)""",
            (order_id,city_id,owner,unit_code,quantity,Jsonb(total),now),
        )
        return {"order_id":str(order_id),"unit_code":unit_code,"quantity":quantity,
                "applied_costs":total,"completed_at":now.isoformat(),"replayed":False}


def hire_hero(db: psycopg.Connection, *, owner: UUID, city_id: UUID,
              order_id: UUID, offer_id: UUID) -> dict:
    with db.transaction():
        _owned_city(db,owner,city_id,lock=True)
        prior=db.execute(
            """SELECT city_id,actor_account_id,offer_id,hero_id,gold_paid,completed_at
               FROM hero_hire_orders WHERE order_id=%s""",(order_id,),
        ).fetchone()
        if prior:
            if prior[:3] != (city_id,owner,offer_id):
                raise RecruitmentConflict("Order ID already used")
            return {"order_id":str(order_id),"hero_id":str(prior[3]),"gold_paid":prior[4],
                    "completed_at":prior[5].isoformat(),"replayed":True}
        if "tavern" not in _levels(db,city_id):
            raise RecruitmentConflict("Tavern must be active")
        offer=db.execute(
            """SELECT hero_name,archetype,gold_cost FROM city_hero_offers
               WHERE offer_id=%s AND city_id=%s AND available FOR UPDATE""",
            (offer_id,city_id),
        ).fetchone()
        if not offer:
            raise RecruitmentConflict("Offer unavailable")
        count=db.execute(
            "SELECT count(*) FROM city_heroes WHERE city_id=%s AND owner_account_id=%s",
            (city_id,owner),
        ).fetchone()[0]
        if count>=3:
            raise RecruitmentConflict("Experimental hero capacity reached")
        if db.execute(
            """UPDATE city_stocks SET amount=amount-%s
               WHERE city_id=%s AND resource='gold' AND amount>=%s""",
            (offer[2],city_id,offer[2]),
        ).rowcount != 1:
            raise RecruitmentConflict("Insufficient gold")
        hero_id=uuid4()
        db.execute(
            """INSERT INTO city_heroes(hero_id,city_id,owner_account_id,name,archetype)
               VALUES(%s,%s,%s,%s,%s)""",(hero_id,city_id,owner,offer[0],offer[1]),
        )
        db.execute(
            "UPDATE city_hero_offers SET available=false WHERE offer_id=%s",(offer_id,),
        )
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        db.execute(
            """INSERT INTO hero_hire_orders(order_id,city_id,actor_account_id,
                      offer_id,hero_id,gold_paid,completed_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s)""",
            (order_id,city_id,owner,offer_id,hero_id,offer[2],now),
        )
        return {"order_id":str(order_id),"hero_id":str(hero_id),
                "gold_paid":offer[2],"completed_at":now.isoformat(),"replayed":False}
