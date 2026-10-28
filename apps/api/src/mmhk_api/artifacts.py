"""Account-scoped real artifact inventory and atomic moves between local heroes.

An item is ONE persistent row, never a virtual stack. No cross-city teleport
or guessed equipment bonuses. Slot rules and level budget are a versioned
LABORATORY policy, not a claim about a particular historic season.
"""
from __future__ import annotations

from uuid import UUID
import psycopg

from .forces import _owned_city, RecruitmentNotFound, RecruitmentConflict

SLOTS=("head","neck","chest","weapon","shield","hands","feet","ring")
ACTIONS=frozenset(("equip","unequip","to_reserve","to_bag","to_hero"))

def artifact_inventory(db:psycopg.Connection,owner:UUID,city_id:UUID)->dict:
    _owned_city(db,owner,city_id)
    rows=db.execute(
        """SELECT i.artifact_id,p.artifact_code,p.name,p.slot,p.required_level,
                  p.effects,p.policy_id,p.historically_certified,
                  i.location,i.hero_id,i.equipped_slot
           FROM city_artifacts i JOIN artifact_profiles p USING(artifact_code)
           WHERE i.city_id=%s ORDER BY i.created_at,i.artifact_id""",(city_id,),
    ).fetchall()
    return {"city_id":str(city_id),"slots":list(SLOTS),
            "equipment_budget_policy":"LAB-LEVEL-SUM-V1",
            "effects_applied_to_combat":False,
            "artifacts":[{
              "artifact_id":str(aid),"artifact_code":code,"name":name,"slot":slot,
              "required_level":level,"effects":effect,"policy_id":policy,
              "historically_certified":certified,"location":location,
              "hero_id":str(hero) if hero else None,"equipped_slot":equipped
            } for aid,code,name,slot,level,effect,policy,certified,location,hero,equipped in rows]}


def move_artifact(db:psycopg.Connection,*,owner:UUID,city_id:UUID,order_id:UUID,
                  artifact_id:UUID,operation:str,target_hero_id:UUID|None)->dict:
    if operation not in ACTIONS:raise RecruitmentConflict("Invalid artifact operation")
    with db.transaction():
        _owned_city(db,owner,city_id,lock=True)
        old=db.execute(
            """SELECT city_id,actor_account_id,artifact_id,operation,target_hero_id,created_at
               FROM artifact_transfer_orders WHERE order_id=%s""",(order_id,),
        ).fetchone()
        if old:
            if old[:5]!=(city_id,owner,artifact_id,operation,target_hero_id):
                raise RecruitmentConflict("Order ID already used")
            return {"order_id":str(order_id),"artifact_id":str(artifact_id),
                    "replayed":True,"completed_at":old[5].isoformat()}
        item=db.execute(
            """SELECT i.location,i.hero_id,i.equipped_slot,p.slot,p.required_level
               FROM city_artifacts i JOIN artifact_profiles p USING(artifact_code)
               WHERE i.artifact_id=%s AND i.city_id=%s FOR UPDATE OF i""",
            (artifact_id,city_id),
        ).fetchone()
        if not item:raise RecruitmentNotFound
        location,current_hero,equipped_slot,allowed_slot,item_level=item
        # Explicit target hero must belong to the same city AND account.
        hero_ids=[hid for hid in (current_hero,target_hero_id) if hid is not None]
        seen={}
        for hid in sorted(set(hero_ids)):
            row=db.execute(
                """SELECT status,level FROM city_heroes
                   WHERE hero_id=%s AND city_id=%s AND owner_account_id=%s FOR UPDATE""",
                (hid,city_id,owner),
            ).fetchone()
            if not row:raise RecruitmentNotFound
            if row[0]!="idle":raise RecruitmentConflict("Hero must be at the city and available")
            seen[hid]=row[1]
        if operation=="equip":
            if location!="bag" or current_hero is None or target_hero_id not in (None,current_hero):
                raise RecruitmentConflict("Equip only from the hero's own bag")
            other=db.execute(
                """SELECT 1 FROM city_artifacts WHERE hero_id=%s AND equipped_slot=%s
                   AND location='equipped' LIMIT 1""",(current_hero,allowed_slot),
            ).fetchone()
            if other:raise RecruitmentConflict("Equipment slot already occupied")
            budget=db.execute(
                """SELECT COALESCE(sum(p.required_level),0)
                   FROM city_artifacts i JOIN artifact_profiles p USING(artifact_code)
                   WHERE i.hero_id=%s AND i.location='equipped'""",(current_hero,),
            ).fetchone()[0]
            if budget+item_level>seen[current_hero]:
                raise RecruitmentConflict("Laboratory equipment-level budget exceeded")
            new_location,new_hero,new_slot="equipped",current_hero,allowed_slot
        elif operation=="unequip":
            if location!="equipped" or target_hero_id not in (None,current_hero):
                raise RecruitmentConflict("Only equipped objects can be unequipped")
            new_location,new_hero,new_slot="bag",current_hero,None
        elif operation=="to_reserve":
            if location=="reserve" or target_hero_id is not None:
                raise RecruitmentConflict("Artifact must belong to a hero")
            new_location,new_hero,new_slot="reserve",None,None
        elif operation=="to_bag":
            if location!="reserve" or target_hero_id is None:
                raise RecruitmentConflict("Withdraw requires a reserve object and one hero")
            new_location,new_hero,new_slot="bag",target_hero_id,None
        else:  # to_hero: within SAME city only; moving an equipped item removes its bonus.
            if current_hero is None or target_hero_id is None or current_hero==target_hero_id:
                raise RecruitmentConflict("Transfer requires two different local heroes")
            new_location,new_hero,new_slot="bag",target_hero_id,None
        db.execute(
            """UPDATE city_artifacts SET location=%s,hero_id=%s,equipped_slot=%s
               WHERE artifact_id=%s""",(new_location,new_hero,new_slot,artifact_id),
        )
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        db.execute(
            """INSERT INTO artifact_transfer_orders(order_id,city_id,actor_account_id,
                artifact_id,operation,target_hero_id,created_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s)""",
            (order_id,city_id,owner,artifact_id,operation,target_hero_id,now),
        )
        return {"order_id":str(order_id),"artifact_id":str(artifact_id),
                "replayed":False,"completed_at":now.isoformat()}
