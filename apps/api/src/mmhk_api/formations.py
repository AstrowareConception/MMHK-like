"""Seven ordinary ordered Jactari army slots on actual owned hero troops.

Maintains the exact per-unit totals of hero_army_units. Transactions serialize
with all city recruit / army-transfer / mission operations. No combat damage or
hero skills are assumed here; this is an editor and immutable deployment record.
"""
from __future__ import annotations

import re
from collections import defaultdict
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb
from .forces import _owned_city, RecruitmentConflict, RecruitmentNotFound

_CODE=re.compile(r"^[a-z][a-z0-9_]{1,47}$")
MAX_QUANTITY=1000000

def _hero(db:psycopg.Connection,owner:UUID,city_id:UUID,hero_id:UUID,
          *,lock:bool=False)->str:
    record=db.execute(
        """SELECT status FROM city_heroes WHERE city_id=%s AND hero_id=%s
           AND owner_account_id=%s""" + (" FOR UPDATE" if lock else ""),
        (city_id,hero_id,owner),
    ).fetchone()
    if record is None:raise RecruitmentNotFound
    return record[0]

def _troops(db:psycopg.Connection,hero_id:UUID,*,lock:bool=False)->dict[str,int]:
    rows=db.execute(
        """SELECT unit_code,quantity FROM hero_army_units
           WHERE hero_id=%s AND quantity>0 ORDER BY unit_code""" +
        (" FOR UPDATE" if lock else ""), (hero_id,),
    ).fetchall()
    return dict(rows)

def _positions(db:psycopg.Connection,hero_id:UUID)->list[dict]:
    rows=db.execute(
        """SELECT position,unit_code,quantity FROM hero_formation_slots
           WHERE hero_id=%s ORDER BY position""",(hero_id,),
    ).fetchall()
    return [{"position":pos,"jactari_index":pos+1,"unit_code":code,
             "quantity":int(quantity)} for pos,code,quantity in rows]

def formation_for_hero(db:psycopg.Connection,*,owner:UUID,city_id:UUID,hero_id:UUID)->dict:
    _owned_city(db,owner,city_id)
    status=_hero(db,owner,city_id,hero_id)
    troops=_troops(db,hero_id)
    names=dict(db.execute(
        """SELECT p.unit_code,p.display_name FROM city_unit_profiles p
           JOIN hero_army_units a ON a.unit_code=p.unit_code
           WHERE a.hero_id=%s AND a.quantity>0""",(hero_id,),
    ).fetchall())
    stored=_positions(db,hero_id)
    # A stable suggestion is not saved until the owner explicitly confirms it.
    proposed=[{"position":index,"jactari_index":index+1,
               "unit_code":code,"quantity":int(count)}
              for index,(code,count) in enumerate(sorted(troops.items())[:7],start=1)]
    planned=stored or proposed
    return {"city_id":str(city_id),"hero_id":str(hero_id),"status":status,
            "slots_count":7,"historically_certified_s2":False,
            "positions":planned,"saved":bool(stored),
            "available_units":[{"unit_code":code,"name":names.get(code,code),"quantity":int(count)}
                               for code,count in sorted(troops.items())],
            "needs_configuration":len(troops)>7 and not stored,
            "jactari_scope":"ordinary indices 2–8; not yet a full combat order"}

def _normalize(positions:list[dict])->list[dict]:
    if not isinstance(positions,list) or len(positions)>7:
        raise RecruitmentConflict("A maximum of seven ordinary army positions is allowed")
    result=[]
    used=set()
    for row in positions:
        if not isinstance(row,dict) or set(row)!={"position","unit_code","quantity"}:
            raise RecruitmentConflict("Invalid formation payload")
        pos,code,qty=row["position"],row["unit_code"],row["quantity"]
        if type(pos) is not int or not 1<=pos<=7 or pos in used:
            raise RecruitmentConflict("Invalid or duplicate position")
        if type(qty) is not int or not 1<=qty<=MAX_QUANTITY:
            raise RecruitmentConflict("An occupied slot requires a positive integer count")
        if not isinstance(code,str) or not _CODE.fullmatch(code):
            raise RecruitmentConflict("Unknown unit identifier")
        used.add(pos)
        result.append({"position":pos,"unit_code":code,"quantity":qty})
    return sorted(result,key=lambda x:x["position"])

def save_formation(db:psycopg.Connection,*,owner:UUID,city_id:UUID,hero_id:UUID,
                   order_id:UUID,positions:list[dict])->dict:
    normalized=_normalize(positions)
    with db.transaction():
        _owned_city(db,owner,city_id,lock=True)
        # Replay must be harmless even when the hero has since departed.
        old=db.execute(
            """SELECT city_id,hero_id,actor_account_id,positions,accepted_at
               FROM hero_formation_orders WHERE order_id=%s""",(order_id,),
        ).fetchone()
        if old:
            if (old[0],old[1],old[2],old[3])!=(
                city_id,hero_id,owner,normalized):
                raise RecruitmentConflict("Formation order ID already used")
            return {"hero_id":str(hero_id),"order_id":str(order_id),
                    "replayed":True,"saved":True,
                    "accepted_at":old[4].isoformat()}
        if _hero(db,owner,city_id,hero_id,lock=True)!="idle":
            raise RecruitmentConflict("Army preparation is locked during travel")
        available=_troops(db,hero_id,lock=True)
        requested=defaultdict(int)
        for row in normalized:
            requested[row["unit_code"]]+=row["quantity"]
        if dict(requested)!=available:
            raise RecruitmentConflict("Formation must contain exactly the assigned units")
        db.execute("DELETE FROM hero_formation_slots WHERE hero_id=%s",(hero_id,))
        for row in normalized:
            db.execute(
                """INSERT INTO hero_formation_slots
                   (city_id,hero_id,position,unit_code,quantity)
                   VALUES(%s,%s,%s,%s,%s)""",
                (city_id,hero_id,row["position"],row["unit_code"],row["quantity"]),
            )
        when=db.execute("SELECT clock_timestamp()").fetchone()[0]
        db.execute(
            """INSERT INTO hero_formation_orders
               (order_id,city_id,hero_id,actor_account_id,positions,accepted_at)
               VALUES(%s,%s,%s,%s,%s,%s)""",
            (order_id,city_id,hero_id,owner,Jsonb(normalized),when),
        )
        return {"hero_id":str(hero_id),"order_id":str(order_id),"replayed":False,
                "saved":True,"accepted_at":when.isoformat()}
