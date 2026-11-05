"""V106 real, normal-mode G11 LAB mine upgrades with server-time economics.

A mine has no game level unless an operator explicitly qualified its
actual L1 state against the configured production rate. Each NEXT level
and builder hero requirement needs a separate documented operator action.
The game does not invent historical class/hero prerequisites.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID

import psycopg

from .forces import _owned_city, RecruitmentConflict, RecruitmentNotFound
from .mine_level_reference import (
    G11_UPGRADE_GOLD_COSTS, G11_BASE_DAILY_PER_LEVEL, SOURCE_REF,
)

POLICY_ID="LAB-G11-MINE-NORMAL-UPGRADE-V1"


def _source(value: object) -> bool:
    return (type(value) is str and 3<=len(value.strip())<=255
            and not any(ord(ch)<32 or ord(ch)==127 for ch in value))


def _rate(resource: str, level: int) -> Decimal:
    if resource not in G11_BASE_DAILY_PER_LEVEL or type(level) is not int or not 1<=level<=10:
        raise ValueError("Unqualified resource/level")
    return Decimal(G11_BASE_DAILY_PER_LEVEL[resource]*level)


def quote_g11_normal_step(resource: str, current_level: int) -> dict:
    if type(current_level) is not int or not 1<=current_level<=9:
        raise ValueError("G11 mine has no next normal step")
    old=_rate(resource,current_level)
    gold=G11_UPGRADE_GOLD_COSTS[current_level-1]
    return {
        "from_level":current_level,"target_level":current_level+1,
        "cost_gold":gold,"duration_seconds":gold//1000*3600,
        "old_rate":str(old),"new_rate":str(_rate(resource,current_level+1)),
        "source_ref":SOURCE_REF,"policy_id":POLICY_ID,
        "mode":"normal","historically_certified_s2":False,
    }


def qualify_lab_mine_upgrade(
    db: psycopg.Connection, *, city_id: UUID, resource: str,
    target_level: int, required_hero_level: int,
    source_ref: str,
) -> dict:
    """Operator attests the current mine level/rate and the next hero gate.

    No stock or rate change. First enrollment is ONLY explicitly verified L1;
    later levels must have been reached via committed V106 jobs.
    """
    if (type(city_id) is not UUID or resource not in G11_BASE_DAILY_PER_LEVEL
        or type(target_level) is not int or not 2<=target_level<=10
        or type(required_hero_level) is not int or not 1<=required_hero_level<=100
        or not _source(source_ref)):
        raise ValueError("Incomplete LAB G11 qualification")
    with db.transaction():
        city=db.execute(
            "SELECT world_id FROM cities WHERE city_id=%s FOR UPDATE",
            (city_id,),
        ).fetchone()
        if city is None:
            raise ValueError("Unknown mine city")
        clock=db.execute(
            "SELECT last_tick_at,tick_seconds,enabled FROM city_economy_clock "
            "WHERE city_id=%s FOR UPDATE",(city_id,),
        ).fetchone()
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        if (not clock or not clock[2] or now<clock[0]
            or now>=clock[0]+timedelta(seconds=clock[1])):
            raise ValueError("Reconcile all economy ticks before G11 qualification")
        row=db.execute(
            """SELECT g.activated_at,r.base_units_per_day
               FROM city_lab_mine_unlocks g
               JOIN city_mine_rates r USING(city_id,resource)
               JOIN cities c ON c.city_id=g.city_id
               JOIN pve_travel_policies t ON t.world_id=c.world_id
               WHERE g.city_id=%s AND g.resource=%s
                 AND left(t.policy_id,4)='LAB-'
                 AND NOT t.historically_certified
               FOR UPDATE OF g,r""",
            (city_id,resource),
        ).fetchone()
        if not row or row[0] is None:
            raise ValueError("A real activated V104 LAB mine is required")
        existing=db.execute(
            "SELECT level FROM city_lab_mine_levels "
            "WHERE city_id=%s AND resource=%s FOR UPDATE",
            (city_id,resource),
        ).fetchone()
        current_level=existing[0] if existing else 1
        if target_level!=current_level+1:
            raise ValueError("Operator may qualify only the next mine step")
        if Decimal(row[1])!=_rate(resource,current_level):
            raise ValueError("Configured rate differs from attested G11 mine level")
        if db.execute(
            """SELECT 1 FROM city_lab_mine_upgrade_orders
               WHERE city_id=%s AND resource=%s AND status='building'""",
            (city_id,resource),
        ).fetchone():
            raise ValueError("Complete the pending mine upgrade before requalifying")
        if existing is None:
            db.execute(
                """INSERT INTO city_lab_mine_levels(city_id,resource,level,source_ref)
                   VALUES(%s,%s,1,%s)""",
                (city_id,resource,source_ref.strip()),
            )
        old=db.execute(
            """SELECT required_hero_level,source_ref
               FROM city_lab_mine_level_qualifications
               WHERE city_id=%s AND resource=%s AND target_level=%s""",
            (city_id,resource,target_level),
        ).fetchone()
        if old is None:
            db.execute(
                """INSERT INTO city_lab_mine_level_qualifications(
                     city_id,resource,target_level,required_hero_level,source_ref)
                   VALUES(%s,%s,%s,%s,%s)""",
                (city_id,resource,target_level,required_hero_level,
                 source_ref.strip()),
            )
        elif old!=(required_hero_level,source_ref.strip()):
            raise ValueError("Qualified hero threshold and source are immutable")
    return {
        "city_id":str(city_id),"resource":resource,
        "current_level":current_level,"target_level":target_level,
        "required_hero_level":required_hero_level,
        "source_ref":source_ref.strip(),
        "quote":quote_g11_normal_step(resource,current_level),
        "historically_certified_s2":False,
    }


def _view_order(row: tuple) -> dict:
    return {
        "order_id":str(row[0]),"resource":row[1],
        "hero_id":str(row[2]),"from_level":row[3],
        "target_level":row[4],"cost_gold":row[5],
        "started_at":row[6].isoformat(),"due_at":row[7].isoformat(),
        "status":row[8],
        "completed_at":row[9].isoformat() if row[9] else None,
        "historically_certified_s2":False,
    }


def mine_upgrades_for_city(
    db: psycopg.Connection, *, owner: UUID, city_id: UUID,
) -> dict:
    _owned_city(db,owner,city_id)
    rows=db.execute(
        """SELECT l.resource,l.level,q.required_hero_level,q.source_ref,
                  g.activated_at
           FROM city_lab_mine_levels l
           JOIN city_lab_mine_unlocks g
             ON g.city_id=l.city_id AND g.resource=l.resource
           JOIN cities c ON c.city_id=l.city_id
           JOIN pve_travel_policies t ON t.world_id=c.world_id
             AND left(t.policy_id,4)='LAB-' AND NOT t.historically_certified
           LEFT JOIN city_lab_mine_level_qualifications q
             ON q.city_id=l.city_id AND q.resource=l.resource
             AND q.target_level=l.level+1
           WHERE l.city_id=%s ORDER BY l.resource""",
        (city_id,),
    ).fetchall()
    active=db.execute(
        """SELECT order_id,resource,hero_id,from_level,target_level,
                  cost_gold,started_at,due_at,status,completed_at
           FROM city_lab_mine_upgrade_orders
           WHERE city_id=%s AND status='building' ORDER BY resource""",
        (city_id,),
    ).fetchall()
    heroes=db.execute(
        """SELECT hero_id,name,level,status FROM city_heroes
           WHERE city_id=%s AND owner_account_id=%s
           ORDER BY name,hero_id""",
        (city_id,owner),
    ).fetchall()
    active_by_resource={v[1]:_view_order(v) for v in active}
    extension_pending={row[0] for row in db.execute(
        """SELECT resource FROM city_lab_mine_extension_orders
           WHERE city_id=%s AND status='building'""",(city_id,),
    ).fetchall()}
    return {
        "city_id":str(city_id),"policy_id":POLICY_ID,
        "historically_certified_s2":False,
        "available_heroes":[{
            "hero_id":str(i),"name":name,"level":level,"status":status,
        } for i,name,level,status in heroes],
        "mines":[{
            "resource":resource,"level":level,
            "required_hero_level":required_level,
            "qualification_source_ref":source,
            "gate_activated":activated_at is not None,
            "quote":(
                quote_g11_normal_step(resource,level)
                if level<10 and required_level is not None
                   and resource not in extension_pending else None
            ),
            "active_order":active_by_resource.get(resource),
        } for resource,level,required_level,source,activated_at in rows],
    }


def start_lab_mine_upgrade(
    db: psycopg.Connection, *, owner: UUID, city_id: UUID, resource: str,
    hero_id: UUID, order_id: UUID,
) -> dict:
    if (resource not in G11_BASE_DAILY_PER_LEVEL or type(resource) is not str
        or type(hero_id) is not UUID or type(order_id) is not UUID):
        raise RecruitmentConflict("Invalid LAB mine upgrade request")
    with db.transaction():
        _owned_city(db,owner,city_id,lock=True)
        old=db.execute(
            """SELECT order_id,resource,hero_id,from_level,target_level,
                      cost_gold,started_at,due_at,status,completed_at,
                      actor_account_id,city_id
               FROM city_lab_mine_upgrade_orders
               WHERE order_id=%s""",(order_id,),
        ).fetchone()
        if old:
            if old[10]!=owner or old[11]!=city_id or old[1]!=resource or old[2]!=hero_id:
                raise RecruitmentConflict("Mine upgrade idempotency key is in use")
            return {**_view_order(old[:10]),"replayed":True}
        clock=db.execute(
            "SELECT last_tick_at,tick_seconds,enabled FROM city_economy_clock "
            "WHERE city_id=%s FOR UPDATE",(city_id,),
        ).fetchone()
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        if not clock or not clock[2] or now<clock[0] or now>=clock[0]+timedelta(seconds=clock[1]):
            raise RecruitmentConflict("Reconcile due economy ticks before a mine upgrade")
        row=db.execute(
            """SELECT l.level,r.base_units_per_day,g.activated_at
               FROM city_lab_mine_levels l
               JOIN city_mine_rates r USING(city_id,resource)
               JOIN city_lab_mine_unlocks g USING(city_id,resource)
               JOIN cities c ON c.city_id=l.city_id
               JOIN pve_travel_policies t ON t.world_id=c.world_id
               WHERE l.city_id=%s AND l.resource=%s
                 AND left(t.policy_id,4)='LAB-' AND NOT t.historically_certified
               FOR UPDATE OF l,r,g""",
            (city_id,resource),
        ).fetchone()
        if not row or row[2] is None or row[0]>=10:
            raise RecruitmentConflict("Mine level is not explicitly approved for an upgrade")
        level,base_rate,_=row
        quote=quote_g11_normal_step(resource,level)
        if Decimal(base_rate)!=Decimal(quote["old_rate"]):
            raise RecruitmentConflict("Real mine rate differs from qualified G11 baseline")
        approved=db.execute(
            """SELECT required_hero_level,source_ref
               FROM city_lab_mine_level_qualifications
               WHERE city_id=%s AND resource=%s AND target_level=%s""",
            (city_id,resource,level+1),
        ).fetchone()
        if not approved:
            raise RecruitmentConflict("Operator has not qualified this next mine level")
        hero=db.execute(
            """SELECT level,status FROM city_heroes
               WHERE hero_id=%s AND city_id=%s AND owner_account_id=%s
               FOR UPDATE""",(hero_id,city_id,owner),
        ).fetchone()
        if hero is None:
            raise RecruitmentNotFound
        if hero[1]!="idle" or hero[0]<approved[0]:
            raise RecruitmentConflict("Qualified hero level or availability insufficient")
        pending=db.execute(
            """SELECT 1 FROM city_lab_mine_upgrade_orders
               WHERE city_id=%s AND resource=%s AND status='building'""",
            (city_id,resource),
        ).fetchone()
        if pending:
            raise RecruitmentConflict("Mine already upgrading")
        if db.execute(
            """SELECT 1 FROM city_lab_mine_extension_orders
               WHERE city_id=%s AND resource=%s AND status='building'""",
            (city_id,resource),
        ).fetchone():
            raise RecruitmentConflict("Cannot upgrade mine level during extension works")
        gold=db.execute(
            "SELECT amount FROM city_stocks WHERE city_id=%s AND resource='gold' FOR UPDATE",
            (city_id,),
        ).fetchone()
        if gold is None or gold[0]<quote["cost_gold"]:
            raise RecruitmentConflict("Insufficient gold for G11 mine upgrade")
        due=now+timedelta(seconds=quote["duration_seconds"])
        result=db.execute(
            """UPDATE city_stocks SET amount=amount-%s
               WHERE city_id=%s AND resource='gold' AND amount>=%s
               RETURNING amount""",
            (quote["cost_gold"],city_id,quote["cost_gold"]),
        ).fetchone()
        if result is None:
            raise RecruitmentConflict("Mine upgrade gold debit failed")
        db.execute(
            """INSERT INTO city_lab_mine_upgrade_orders(
                 order_id,city_id,resource,actor_account_id,hero_id,
                 from_level,target_level,hero_level_at_start,required_hero_level,
                 source_ref,cost_gold,old_rate,new_rate,started_at,due_at,status)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'building')""",
            (order_id,city_id,resource,owner,hero_id,
             level,level+1,hero[0],approved[0],approved[1],
             quote["cost_gold"],Decimal(quote["old_rate"]),
             Decimal(quote["new_rate"]),now,due),
        )
        return {**_view_order((
            order_id,resource,hero_id,level,level+1,quote["cost_gold"],
            now,due,"building",None,
        )),"replayed":False}


def complete_mine_upgrades_at_clock(
    db: psycopg.Connection, city_id: UUID, cutoff: datetime,
) -> list[dict]:
    """Only invoked with the economy-clock row locked inside a worker tx.

    All ticks whose START was before due_at have already used the old rate.
    The rate increases from the first subsequent tick, never retroactively.
    """
    rows=db.execute(
        """SELECT order_id,resource,from_level,target_level,old_rate,new_rate
           FROM city_lab_mine_upgrade_orders
           WHERE city_id=%s AND status='building' AND due_at<=%s
           ORDER BY due_at,order_id FOR UPDATE""",
        (city_id,cutoff),
    ).fetchall()
    completed=[]
    for oid,resource,from_level,target,old_rate,new_rate in rows:
        level=db.execute(
            "SELECT level FROM city_lab_mine_levels "
            "WHERE city_id=%s AND resource=%s FOR UPDATE",
            (city_id,resource),
        ).fetchone()
        if not level or level[0]!=from_level:
            raise RuntimeError("G11 level changed outside ordered upgrade")
        rate=db.execute(
            "UPDATE city_mine_rates SET base_units_per_day=%s "
            "WHERE city_id=%s AND resource=%s AND base_units_per_day=%s "
            "RETURNING base_units_per_day",
            (new_rate,city_id,resource,old_rate),
        ).fetchone()
        if rate is None:
            raise RuntimeError("G11 real rate changed while upgrade awaited")
        db.execute(
            """UPDATE city_lab_mine_levels SET level=%s
               WHERE city_id=%s AND resource=%s""",
            (target,city_id,resource),
        )
        updated=db.execute(
            """UPDATE city_lab_mine_upgrade_orders
               SET status='completed',completed_at=%s
               WHERE order_id=%s AND status='building' RETURNING order_id""",
            (cutoff,oid),
        ).fetchone()
        if updated is None:
            raise RuntimeError("Mine upgrade completion already claimed")
        completed.append({
            "order_id":str(oid),"resource":resource,"target_level":target,
            "effective_at":cutoff.isoformat(),
        })
    return completed
