"""V107 — one source-qualified LAB extension per existing natural mine.

G11 documents +5% and suspended production while an extension is built.
Its prices, durations, placement, stacking and hero requirements are NOT
source-qualified; trusted operator explicitly supplies an experimental
cost, build duration, separate site and hero level per mine.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID

import psycopg

from .forces import _owned_city, RecruitmentConflict, RecruitmentNotFound
from .worlds import RESOURCE_NAMES

POLICY_ID = "LAB-G11-SINGLE-EXTENSION-005-V1"
BONUS = Decimal("0.0500")


def _source(value: object) -> bool:
    return (type(value) is str and 3 <= len(value.strip()) <= 255
            and not any(ord(ch) < 32 or ord(ch) == 127 for ch in value))


def _lab_mine(
    db: psycopg.Connection, city_id: UUID, resource: str, *,
    lock: bool,
) -> tuple | None:
    return db.execute(
        """SELECT c.world_id,c.x,c.y,g.activated_at,
                  p.i,p.j,r.base_units_per_day,r.additive_bonus
           FROM city_lab_mine_unlocks g
           JOIN city_mine_positions p USING(city_id,resource)
           JOIN city_mine_rates r USING(city_id,resource)
           JOIN cities c ON c.city_id=g.city_id
           JOIN pve_travel_policies t ON t.world_id=c.world_id
           WHERE g.city_id=%s AND g.resource=%s
             AND left(t.policy_id,4)='LAB-' AND NOT t.historically_certified"""
        + (" FOR UPDATE OF g,r" if lock else ""),
        (city_id,resource),
    ).fetchone()


def _clock_is_current(clock: tuple | None, now: datetime) -> bool:
    return bool(
        clock and clock[2] and clock[0] <= now
        and now < clock[0] + timedelta(seconds=clock[1])
    )


def qualify_lab_mine_extension(
    db: psycopg.Connection, *, city_id: UUID, resource: str,
    site_i: int, site_j: int, required_hero_level: int,
    cost_gold: int, duration_seconds: int, source_ref: str,
) -> dict:
    """Trusted operator enrollment, not a rule inferred from Ubisoft G11."""
    if (type(city_id) is not UUID
        or type(resource) is not str or resource not in RESOURCE_NAMES
        or type(site_i) is not int or type(site_j) is not int
        or not (0 <= site_i <= 4 and 0 <= site_j <= 4)
        or (site_i,site_j)==(2,2)
        or type(required_hero_level) is not int or not 1 <= required_hero_level <= 100
        or type(cost_gold) is not int or not 1 <= cost_gold <= 1_000_000_000
        or type(duration_seconds) is not int or not 60 <= duration_seconds <= 2592000
        or not _source(source_ref)):
        raise ValueError("Invalid or incomplete LAB mine extension qualification")
    source = source_ref.strip()
    with db.transaction():
        if db.execute("SELECT city_id FROM cities WHERE city_id=%s FOR UPDATE",
                      (city_id,)).fetchone() is None:
            raise ValueError("Unknown city")
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        clock=db.execute(
            """SELECT last_tick_at,tick_seconds,enabled
               FROM city_economy_clock WHERE city_id=%s FOR UPDATE""",
            (city_id,),
        ).fetchone()
        if not _clock_is_current(clock,now):
            raise ValueError("Settle all existing economy ticks before qualifying an extension")
        mine=_lab_mine(db,city_id,resource,lock=True)
        if not mine or mine[3] is None or mine[6] <= 0 or Decimal(mine[7]) != 0:
            raise ValueError("Qualified LAB extension needs an active zero-bonus V104 mine")
        world,x,y,active,mine_i,mine_j,rate,bonus=mine
        if abs(mine_i-site_i)+abs(mine_j-site_j)!=1:
            raise ValueError("LAB extension tile must be directly adjacent to its mine")
        if db.execute(
            """SELECT 1 FROM city_mine_positions
               WHERE city_id=%s AND i=%s AND j=%s""",
            (city_id,site_i,site_j),
        ).fetchone() or db.execute(
            """SELECT 1 FROM region_encounters
               WHERE city_id=%s AND cell_i=%s AND cell_j=%s""",
            (city_id,site_i,site_j),
        ).fetchone() or db.execute(
            """SELECT 1 FROM world_region_deposits
               WHERE world_id=%s AND x=%s AND y=%s AND i=%s AND j=%s""",
            (world,x,y,site_i,site_j),
        ).fetchone():
            raise ValueError("LAB extension site is already occupied")
        if db.execute(
            """SELECT 1 FROM city_lab_mine_upgrade_orders
               WHERE city_id=%s AND resource=%s AND status='building'""",
            (city_id,resource),
        ).fetchone():
            raise ValueError("G11 level upgrade must finish before extension qualification")
        latest=db.execute(
            """SELECT mine_additive_bonus
               FROM city_economy_effect_snapshots
               WHERE city_id=%s AND effective_at<=%s
               ORDER BY effective_at DESC,revision DESC LIMIT 1""",
            (city_id,now),
        ).fetchone()
        if latest and Decimal(latest[0].get(resource,"0")) != 0:
            raise ValueError("Other mine bonuses need a separate stacking policy")
        old=db.execute(
            """SELECT site_i,site_j,required_hero_level,cost_gold,
                      duration_seconds,source_ref
               FROM city_lab_mine_extension_sites
               WHERE city_id=%s AND resource=%s""",
            (city_id,resource),
        ).fetchone()
        signature=(site_i,site_j,required_hero_level,cost_gold,duration_seconds,source)
        if old is not None:
            if old!=signature:
                raise ValueError("Existing LAB mine extension qualification is immutable")
        else:
            db.execute(
                """INSERT INTO city_lab_mine_extension_sites(
                     city_id,resource,site_i,site_j,source_ref,
                     required_hero_level,cost_gold,duration_seconds
                   ) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)""",
                (city_id,resource,site_i,site_j,source,
                 required_hero_level,cost_gold,duration_seconds),
            )
    return {
        "city_id":str(city_id),"resource":resource,
        "site_i":site_i,"site_j":site_j,
        "required_hero_level":required_hero_level,"cost_gold":cost_gold,
        "duration_seconds":duration_seconds,"bonus_percent":"5",
        "source_ref":source,"policy_id":POLICY_ID,
        "historically_certified_s2":False,
    }


def _view_order(row: tuple) -> dict:
    return {
        "order_id":str(row[0]),"resource":row[1],"hero_id":str(row[2]),
        "cost_gold":row[3],"started_at":row[4].isoformat(),
        "due_at":row[5].isoformat(),"status":row[6],
        "completed_at":row[7].isoformat() if row[7] else None,
        "bonus_percent":"5","historically_certified_s2":False,
    }


def extensions_for_city(
    db: psycopg.Connection, *, owner: UUID, city_id: UUID,
) -> dict:
    _owned_city(db,owner,city_id)
    rows=db.execute(
        """SELECT s.resource,s.site_i,s.site_j,s.cost_gold,
                  s.duration_seconds,s.required_hero_level,s.source_ref,
                  g.activated_at
           FROM city_lab_mine_extension_sites s
           JOIN city_lab_mine_unlocks g USING(city_id,resource)
           JOIN cities c ON c.city_id=s.city_id
           JOIN pve_travel_policies t ON t.world_id=c.world_id
           WHERE s.city_id=%s AND left(t.policy_id,4)='LAB-'
             AND NOT t.historically_certified
           ORDER BY s.resource""",
        (city_id,),
    ).fetchall()
    orders=db.execute(
        """SELECT order_id,resource,hero_id,cost_gold,
                  started_at,due_at,status,completed_at
           FROM city_lab_mine_extension_orders
           WHERE city_id=%s ORDER BY resource""",
        (city_id,),
    ).fetchall()
    by_resource={row[1]:_view_order(row) for row in orders}
    heroes=db.execute(
        """SELECT hero_id,name,level,status FROM city_heroes
           WHERE city_id=%s AND owner_account_id=%s
           ORDER BY name,hero_id""",
        (city_id,owner),
    ).fetchall()
    return {
        "city_id":str(city_id),"policy_id":POLICY_ID,
        "historically_certified_s2":False,"max_extensions_per_mine_lab":1,
        "available_heroes":[{
            "hero_id":str(hid),"name":name,"level":level,"status":status,
        } for hid,name,level,status in heroes],
        "mines":[{
            "resource":resource,"site_i":i,"site_j":j,
            "cost_gold":cost,"duration_seconds":duration,
            "required_hero_level":required,"source_ref":source,
            "gate_activated":activated is not None,
            "extension_bonus_percent":"5","order":by_resource.get(resource),
        } for resource,i,j,cost,duration,required,source,activated in rows],
    }


def start_lab_mine_extension(
    db: psycopg.Connection, *, owner: UUID, city_id: UUID,
    resource: str, hero_id: UUID, order_id: UUID,
) -> dict:
    if (type(resource) is not str or resource not in RESOURCE_NAMES
        or type(hero_id) is not UUID or type(order_id) is not UUID):
        raise RecruitmentConflict("Invalid LAB mine extension command")
    with db.transaction():
        _owned_city(db,owner,city_id,lock=True)
        past=db.execute(
            """SELECT order_id,resource,hero_id,cost_gold,started_at,
                      due_at,status,completed_at,actor_account_id,city_id
               FROM city_lab_mine_extension_orders WHERE order_id=%s""",
            (order_id,),
        ).fetchone()
        if past:
            if (past[8]!=owner or past[9]!=city_id
                or past[1]!=resource or past[2]!=hero_id):
                raise RecruitmentConflict("Extension idempotency key has another owner")
            return {**_view_order(past[:8]),"replayed":True}
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        clock=db.execute(
            "SELECT last_tick_at,tick_seconds,enabled FROM city_economy_clock "
            "WHERE city_id=%s FOR UPDATE",(city_id,),
        ).fetchone()
        if not _clock_is_current(clock,now):
            raise RecruitmentConflict("Reconcile the economy clock before extension construction")
        mine=_lab_mine(db,city_id,resource,lock=True)
        if not mine or mine[3] is None or Decimal(mine[7])!=0:
            raise RecruitmentConflict("Extension requires an active LAB mine with no prior bonus")
        qualified=db.execute(
            """SELECT site_i,site_j,required_hero_level,cost_gold,
                      duration_seconds,source_ref
               FROM city_lab_mine_extension_sites
               WHERE city_id=%s AND resource=%s FOR UPDATE""",
            (city_id,resource),
        ).fetchone()
        if qualified is None:
            raise RecruitmentConflict("No operator-qualified extension site")
        if db.execute(
            """SELECT 1 FROM city_lab_mine_extension_orders
               WHERE city_id=%s AND resource=%s""",
            (city_id,resource),
        ).fetchone():
            raise RecruitmentConflict("Mine already has an extension or ongoing construction")
        if db.execute(
            """SELECT 1 FROM city_lab_mine_upgrade_orders
               WHERE city_id=%s AND resource=%s AND status='building'""",
            (city_id,resource),
        ).fetchone():
            raise RecruitmentConflict("Level and extension works cannot overlap")
        h=db.execute(
            """SELECT level,status FROM city_heroes
               WHERE hero_id=%s AND city_id=%s AND owner_account_id=%s FOR UPDATE""",
            (hero_id,city_id,owner),
        ).fetchone()
        if h is None:
            raise RecruitmentNotFound
        i,j,required,cost,duration,source=qualified
        if h[1]!="idle" or h[0]<required:
            raise RecruitmentConflict("Hero level or availability insufficient for extension")
        latest=db.execute(
            """SELECT mine_additive_bonus FROM city_economy_effect_snapshots
               WHERE city_id=%s AND effective_at<=%s
               ORDER BY effective_at DESC,revision DESC LIMIT 1""",
            (city_id,now),
        ).fetchone()
        if latest and Decimal(latest[0].get(resource,"0"))!=0:
            raise RecruitmentConflict("Existing regional bonus requires a separately qualified stacking rule")
        money=db.execute(
            """SELECT amount FROM city_stocks
               WHERE city_id=%s AND resource='gold' FOR UPDATE""",
            (city_id,),
        ).fetchone()
        if money is None or money[0]<cost:
            raise RecruitmentConflict("Insufficient gold for qualified extension")
        charged=db.execute(
            """UPDATE city_stocks SET amount=amount-%s
               WHERE city_id=%s AND resource='gold' AND amount>=%s
               RETURNING amount""",(cost,city_id,cost),
        ).fetchone()
        if charged is None:
            raise RecruitmentConflict("Atomic extension debit failed")
        due=now+timedelta(seconds=duration)
        db.execute(
            """INSERT INTO city_lab_mine_extension_orders(
                 order_id,city_id,resource,actor_account_id,hero_id,
                 source_ref,site_i,site_j,required_hero_level,
                 hero_level_at_start,cost_gold,started_at,due_at,status)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'building')""",
            (order_id,city_id,resource,owner,hero_id,source,
             i,j,required,h[0],cost,now,due),
        )
        return {**_view_order((
            order_id,resource,hero_id,cost,now,due,"building",None,
        )),"replayed":False}


def complete_lab_mine_extensions_at_clock(
    db: psycopg.Connection, city_id: UUID, cutoff: datetime,
) -> list[dict]:
    """Called inside economy transaction after all earlier ticks paid.

    One extension at most per mine; bonus deliberately additive LAB 0.05
    with no other qualified bonus at the time of approval/launch.
    """
    jobs=db.execute(
        """SELECT order_id,resource FROM city_lab_mine_extension_orders
           WHERE city_id=%s AND status='building' AND due_at<=%s
           ORDER BY due_at,order_id FOR UPDATE""",
        (city_id,cutoff),
    ).fetchall()
    finished=[]
    for oid,resource in jobs:
        changed=db.execute(
            """UPDATE city_mine_rates
               SET additive_bonus=%s
               WHERE city_id=%s AND resource=%s AND additive_bonus=0
               RETURNING additive_bonus""",
            (BONUS,city_id,resource),
        ).fetchone()
        if changed is None:
            raise RuntimeError("Qualified mine bonus was changed before extension completion")
        completed=db.execute(
            """UPDATE city_lab_mine_extension_orders
               SET status='completed',completed_at=%s
               WHERE order_id=%s AND status='building'
               RETURNING order_id""",
            (cutoff,oid),
        ).fetchone()
        if completed is None:
            raise RuntimeError("Extension already completed")
        finished.append({
            "order_id":str(oid),"resource":resource,
            "bonus_percent":"5","effective_at":cutoff.isoformat(),
        })
    return finished
