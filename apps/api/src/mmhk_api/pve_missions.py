"""Timed, server-authoritative PvE journey with two separate travel legs.

The LAB mission records a bounded one-stack Jactari report on arrival.
It neither applies permanent losses nor frees cells/awards loot or XP.
This remains separate from the future fully qualified US-COM combat engine.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb
from jactari.duel import resolve_stack_duel
from .forces import _owned_city, RecruitmentNotFound, RecruitmentConflict

def start_pve_mission(db:psycopg.Connection,*,owner:UUID,city_id:UUID,
                      mission_id:UUID,hero_id:UUID,encounter_id:UUID,unit_code:str)->dict:
    with db.transaction():
        _owned_city(db,owner,city_id,lock=True)
        old=db.execute(
            """SELECT city_id,actor_account_id,hero_id,encounter_id,unit_code
               FROM pve_missions WHERE mission_id=%s""",(mission_id,),
        ).fetchone()
        if old:
            if old!=(city_id,owner,hero_id,encounter_id,unit_code):
                raise RecruitmentConflict("Mission ID already used")
            return {"mission_id":str(mission_id),"replayed":True}
        hero=db.execute(
            """SELECT status FROM city_heroes WHERE hero_id=%s AND city_id=%s
               AND owner_account_id=%s FOR UPDATE""",(hero_id,city_id,owner),
        ).fetchone()
        if hero is None:raise RecruitmentNotFound
        if hero[0]!="idle":raise RecruitmentConflict("Hero already travelling")
        enemy=db.execute(
            """SELECT cell_i,cell_j FROM region_encounters WHERE encounter_id=%s
               AND city_id=%s AND NOT resolved FOR UPDATE""",(encounter_id,city_id),
        ).fetchone()
        if enemy is None:raise RecruitmentNotFound
        if db.execute(
            """SELECT 1 FROM pve_missions WHERE encounter_id=%s
               AND stage<>'completed'""",(encounter_id,),
        ).fetchone():
            raise RecruitmentConflict("Another mission targets this encounter")
        stack=db.execute(
            """SELECT a.quantity,p.lab_duel_power
               FROM hero_army_units a JOIN city_unit_profiles p USING(unit_code)
               WHERE a.hero_id=%s AND a.unit_code=%s FOR UPDATE OF a""",
            (hero_id,unit_code),
        ).fetchone()
        if stack is None or stack[0]<=0 or stack[0]>1000000:
            raise RecruitmentConflict("No usable troop stack assigned to this hero")
        if stack[1] is None:raise RecruitmentConflict("Unverified troop combat profile")
        policy=db.execute(
            """SELECT p.seconds_per_step,p.policy_id FROM pve_travel_policies p
               JOIN cities c ON c.world_id=p.world_id WHERE c.city_id=%s""",
            (city_id,),
        ).fetchone()
        if policy is None:raise RecruitmentConflict("No verified travel policy for this world")
        # The only supported scope is local 5x5 region. A taxicab tile-step
        # model is explicitly experimental and versioned; never a Ubisoft claim.
        distance=abs(enemy[0]-2)+abs(enemy[1]-2)
        if distance<1:raise RecruitmentConflict("Cannot attack city centre")
        seconds=distance*policy[0]
        if seconds>172800:raise RecruitmentConflict("Unsupported journey length")
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        arrival=now+timedelta(seconds=seconds)
        returning=arrival+timedelta(seconds=seconds)
        db.execute(
            """INSERT INTO pve_missions(
              mission_id,city_id,hero_id,encounter_id,actor_account_id,
              unit_code,stack_count,stack_power,target_i,target_j,travel_seconds,
              travel_policy_id,stage,started_at,arrival_due_at,return_due_at)
              VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'outbound',%s,%s,%s)""",
            (mission_id,city_id,hero_id,encounter_id,owner,unit_code,
             stack[0],stack[1],enemy[0],enemy[1],seconds,policy[1],now,arrival,returning),
        )
        db.execute(
            "UPDATE city_heroes SET status='on_mission' WHERE hero_id=%s",(hero_id,),
        )
        db.execute("""INSERT INTO pve_mission_events(mission_id,phase,occurred_at)
                      VALUES(%s,'departed',%s)""",(mission_id,now))
        return {"mission_id":str(mission_id),"replayed":False,
                "stage":"outbound","started_at":now.isoformat(),
                "arrival_due_at":arrival.isoformat(),"return_due_at":returning.isoformat(),
                "travel_seconds":seconds,"target_i":enemy[0],"target_j":enemy[1],
                "historically_certified":False}


def missions_for_city(db:psycopg.Connection,owner:UUID,city_id:UUID,*,limit:int=40)->dict:
    _owned_city(db,owner,city_id)
    now=db.execute("SELECT clock_timestamp()").fetchone()[0]
    rows=db.execute(
        """SELECT m.mission_id,m.hero_id,h.name,e.name,m.target_i,m.target_j,
                  m.stage,m.unit_code,m.stack_count,m.travel_seconds,
                  m.started_at,m.arrival_due_at,m.return_due_at,m.arrived_at,
                  m.returned_at,m.duel_report,m.travel_policy_id
           FROM pve_missions m JOIN city_heroes h ON h.hero_id=m.hero_id
           JOIN region_encounters e ON e.encounter_id=m.encounter_id
           WHERE m.city_id=%s AND m.actor_account_id=%s
           ORDER BY (m.stage<>'completed') DESC,m.started_at DESC LIMIT %s""",
        (city_id,owner,limit),
    ).fetchall()
    result=[]
    for (mid,hid,hname,ename,i,j,stage,unit,count,seconds,started,arrival,
         returning,arrived,returned,report,policy) in rows:
        result.append({"mission_id":str(mid),"hero_id":str(hid),"hero_name":hname,
          "encounter_name":ename,"target_i":i,"target_j":j,"stage":stage,
          "unit_code":unit,"stack_count":count,"travel_seconds":seconds,
          "travel_policy_id":policy,"started_at":started.isoformat(),
          "arrival_due_at":arrival.isoformat(),"return_due_at":returning.isoformat(),
          "arrived_at":arrived.isoformat() if arrived else None,
          "returned_at":returned.isoformat() if returned else None,
          "duel_report":report})
    route=db.execute(
        """SELECT p.seconds_per_step,p.policy_id FROM pve_travel_policies p
           JOIN cities c ON c.world_id=p.world_id WHERE c.city_id=%s""",(city_id,),
    ).fetchone()
    return {"server_now":now.isoformat(),"city_id":str(city_id),
            "historically_certified":False,
            "travel_policy":{"seconds_per_step":route[0],"policy_id":route[1]} if route else None,
            "missions":result}


def advance_pve_missions(db:psycopg.Connection,*,max_orders:int=25,
                         now_at:datetime|None=None)->list[dict]:
    if not db.autocommit:raise ValueError("Mission supervisor must use autocommit")
    if not 1<=max_orders<=200:raise ValueError("Invalid mission batch limit")
    processed=[]
    for _ in range(max_orders):
        with db.transaction():
            now=now_at or db.execute("SELECT clock_timestamp()").fetchone()[0]
            row=db.execute(
                """SELECT m.mission_id,m.stage,m.hero_id,m.encounter_id,
                          m.unit_code,m.stack_count,m.stack_power,m.travel_seconds,
                          m.arrival_due_at,m.return_due_at
                   FROM pve_missions m WHERE
                     (m.stage='outbound' AND m.arrival_due_at<=%s) OR
                     (m.stage='returning' AND m.return_due_at<=%s)
                   ORDER BY CASE WHEN m.stage='outbound' THEN m.arrival_due_at
                                 ELSE m.return_due_at END,m.mission_id
                   FOR UPDATE OF m SKIP LOCKED LIMIT 1""",(now,now),
            ).fetchone()
            if row is None:break
            mid,stage,hid,eid,unit,count,power,travel_seconds,arrival,returning=row
            if stage=="outbound":
                enemy=db.execute(
                    """SELECT unit_count,unit_power FROM region_encounters
                       WHERE encounter_id=%s""",(eid,),
                ).fetchone()
                if enemy is None:raise RuntimeError("Mission encounter missing")
                outcome=resolve_stack_duel({
                    "attacker":{"count":count,"unitPower":float(power)},
                    "defender":{"count":enemy[0],"unitPower":float(enemy[1])},
                    "modifiers":{}
                })
                report={"scope":"LAB-SINGLE-STACK","preview_only":True,
                        "outcome":outcome,"no_losses_applied":True,"no_rewards":True}
                # Late workers do not consume part of the return leg.
                # Return duration begins with the confirmed arrival timestamp.
                confirmed_return=now+timedelta(seconds=travel_seconds)
                db.execute(
                    """UPDATE pve_missions SET stage='returning',arrived_at=%s,
                       duel_report=%s,return_due_at=%s WHERE mission_id=%s""",
                    (now,Jsonb(report),confirmed_return,mid),
                )
                db.execute(
                    """INSERT INTO pve_mission_events(mission_id,phase,occurred_at)
                       VALUES(%s,'arrived',%s) ON CONFLICT DO NOTHING""",(mid,now),
                )
                processed.append({"mission_id":str(mid),"phase":"arrived"})
            else:
                db.execute(
                    """UPDATE pve_missions SET stage='completed',returned_at=%s
                       WHERE mission_id=%s""",(now,mid),
                )
                db.execute(
                    "UPDATE city_heroes SET status='idle' WHERE hero_id=%s",(hid,),
                )
                db.execute(
                    """INSERT INTO pve_mission_events(mission_id,phase,occurred_at)
                       VALUES(%s,'returned',%s) ON CONFLICT DO NOTHING""",(mid,now),
                )
                processed.append({"mission_id":str(mid),"phase":"returned"})
    return processed
