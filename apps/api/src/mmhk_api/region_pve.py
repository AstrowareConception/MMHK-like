"""Visibility-safe regional encounters and a no-side-effects Jactari duel lab.

Only one-stack PvE currently has an equivalent Python Jactari oracle.
The laboratory DOES NOT consume units, liberate tiles, award loot, or XP.
"""
from __future__ import annotations
from uuid import UUID
import psycopg

from jactari.duel import resolve_stack_duel
from .forces import _owned_city, RecruitmentConflict, RecruitmentNotFound

def region_encounters(db:psycopg.Connection,owner:UUID,city_id:UUID)->list[dict]:
    _owned_city(db,owner,city_id)
    rows=db.execute(
        """SELECT encounter_id,cell_i,cell_j,name,unit_code,unit_count,unit_power,source_ref
           FROM region_encounters WHERE city_id=%s AND NOT resolved
           ORDER BY cell_j,cell_i""",(city_id,),
    ).fetchall()
    return [{"encounter_id":str(eid),"i":i,"j":j,"name":name,"unit_code":unit,
            "unit_count":count,"unit_power":float(power),"source_ref":source,
            "historically_certified":False} for eid,i,j,name,unit,count,power,source in rows]

def preview_duel(db:psycopg.Connection,*,owner:UUID,city_id:UUID,
                 encounter_id:UUID,hero_id:UUID,unit_code:str)->dict:
    _owned_city(db,owner,city_id)
    monster=db.execute(
        """SELECT name,unit_code,unit_count,unit_power,cell_i,cell_j
           FROM region_encounters WHERE encounter_id=%s AND city_id=%s AND NOT resolved""",
        (encounter_id,city_id),
    ).fetchone()
    if monster is None:raise RecruitmentNotFound
    hero=db.execute(
        """SELECT name,status FROM city_heroes
           WHERE city_id=%s AND hero_id=%s AND owner_account_id=%s""",
        (city_id,hero_id,owner),
    ).fetchone()
    if hero is None:raise RecruitmentNotFound
    if hero[1]!="idle":raise RecruitmentConflict("Hero not available at city")
    row=db.execute(
        """SELECT a.quantity,p.lab_duel_power
           FROM hero_army_units a JOIN city_unit_profiles p USING(unit_code)
           WHERE a.hero_id=%s AND a.unit_code=%s""",(hero_id,unit_code),
    ).fetchone()
    if row is None or row[0]<=0:raise RecruitmentConflict("Hero has no matching troops")
    if row[1] is None:raise RecruitmentConflict("No authorized duel-power profile")
    outcome=resolve_stack_duel({
        "attacker":{"count":int(row[0]),"unitPower":float(row[1])},
        "defender":{"count":monster[2],"unitPower":float(monster[3])},
        "modifiers":{}
    })
    return {"scope":"LAB-SINGLE-STACK","preview_only":True,
        "note":"Jactari duel limited to two stacks; no casualties, XP, loot or liberation committed.",
        "hero_id":str(hero_id),"hero_name":hero[0],"unit_code":unit_code,
        "encounter_id":str(encounter_id),"encounter_name":monster[0],
        "i":monster[4],"j":monster[5],"outcome":outcome}
