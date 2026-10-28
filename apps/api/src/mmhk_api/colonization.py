"""Authoritative, opt-in colonization: seven-day protection and timed city founding.

The existing verified influence table is the ONLY territorial authority here:
no undocumented influence formula, faction mine generation, city rights or
historical season-two costs are silently inferred. Players never configure
world/site policies. Every founding order snapshots the qualified mine profile
and reserves its exact local stock under PostgreSQL locks.
"""
from __future__ import annotations

from datetime import UTC,datetime,timedelta
from uuid import UUID,uuid4

import psycopg
from psycopg.types.json import Jsonb

from .worlds import RESOURCE_NAMES

NEWBIE_DAYS = 7
NEWBIE_SECONDS = NEWBIE_DAYS * 86400
BIGINT = 2**63 - 1
MAX_COST = 1_000_000_000
ORDER_COLUMNS = """order_id,world_id,source_city_id,owner_account_id,hero_id,
  new_city_id,colony_name,x,y,policy_id,applied_costs,mine_types,rates_per_day,
  stock_capacities,tick_seconds,site_source_ref,travel_seconds,started_at,
  due_at,status,completed_at,blocked_at,blocked_reason,refunded_at,refund_order_id"""


class ColonizationNotFound(Exception):
    """The requested world, city or expedition is not owned by the requester."""


class ColonizationConflict(Exception):
    """A founding request conflicts with protected, territorial or stock state."""


def _now(db:psycopg.Connection)->datetime:
    return db.execute("SELECT clock_timestamp()").fetchone()[0]


def _validate_costs(data:dict)->dict[str,int]:
    if (not isinstance(data,dict) or set(data)!=set(RESOURCE_NAMES)
        or any(type(v) is not int or not 0<=v<=MAX_COST for v in data.values())
        or not any(data.values())):
        raise ValueError("Versioned colony costs must contain seven nonnegative values")
    return {key:data[key] for key in RESOURCE_NAMES}


def _validate_site(mines:list[str],rates:dict,caps:dict)->tuple[list[str],dict,dict]:
    if (not isinstance(mines,list) or not 3<=len(mines)<=4
        or any(not isinstance(r,str) or r not in RESOURCE_NAMES for r in mines)
        or len(set(mines))!=len(mines)
        or not isinstance(rates,dict) or set(rates)!=set(mines)
        or any(type(v) is not int or not 0<=v<=100000 for v in rates.values())
        or not isinstance(caps,dict) or set(caps)!=set(RESOURCE_NAMES)
        or any(type(v) is not int or not 1<=v<=BIGINT for v in caps.values())):
        raise ValueError("Colony site requires 3/4 declared mine types and matching rates, seven caps")
    return sorted(mines),{k:rates[k] for k in sorted(rates)},{k:caps[k] for k in RESOURCE_NAMES}


def configure_colonization_policy(
    db:psycopg.Connection,*,world_id:str,policy_id:str,costs:dict,
    max_owned_cities:int,max_distance_steps:int,seconds_per_step:int,
    enabled:bool=True,
)->None:
    """Trusted insert-only operator configuration, never a public HTTP call."""
    if (not isinstance(world_id,str) or not 1<=len(world_id)<=64
        or not isinstance(policy_id,str) or not 3<=len(policy_id)<=100
        or type(max_owned_cities) is not int or not 2<=max_owned_cities<=10
        or type(max_distance_steps) is not int or not 1<=max_distance_steps<=20
        or type(seconds_per_step) is not int or not 5<=seconds_per_step<=86400
        or type(enabled) is not bool):
        raise ValueError("Invalid versioned colonization policy")
    clean=_validate_costs(costs)
    with db.transaction():
        db.execute(
            """INSERT INTO colonization_world_policies
               (world_id,policy_id,costs,max_owned_cities,max_distance_steps,
                seconds_per_step,enabled)
               VALUES(%s,%s,%s,%s,%s,%s,%s)""",
            (world_id,policy_id,Jsonb(clean),max_owned_cities,
             max_distance_steps,seconds_per_step,enabled),
        )


def configure_colony_site(
    db:psycopg.Connection,*,world_id:str,x:int,y:int,source_ref:str,
    mines:list[str],rates_per_day:dict,capacities:dict,tick_seconds:int,
    enabled:bool=True,
)->None:
    """Records an operator-qualified location; does NOT manufacture influence."""
    if (not isinstance(world_id,str) or not 1<=len(world_id)<=64
        or not isinstance(source_ref,str) or not 3<=len(source_ref)<=255
        or type(x) is not int or type(y) is not int
        or type(tick_seconds) is not int or not 1<=tick_seconds<=86400
        or type(enabled) is not bool):
        raise ValueError("Invalid qualified colony site")
    mine_types,rates,caps=_validate_site(mines,rates_per_day,capacities)
    with db.transaction():
        size=db.execute(
            "SELECT world_size FROM worlds WHERE world_id=%s",(world_id,),
        ).fetchone()
        if not size or not 1<=x<=size[0] or not 1<=y<=size[0]:
            raise ValueError("Colony site outside world")
        # Must have an explicit recorded territorial controller first.
        if not db.execute(
            """SELECT 1 FROM map_influence_cells
               WHERE world_id=%s AND x=%s AND y=%s""",(world_id,x,y),
        ).fetchone():
            raise ValueError("Site requires an existing operator-controlled influence record")
        db.execute(
            """INSERT INTO colonization_site_profiles
               (world_id,x,y,source_ref,mine_types,rates_per_day,
                stock_capacities,tick_seconds,enabled)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (world_id,x,y,source_ref,Jsonb(mine_types),Jsonb(rates),
             Jsonb(caps),tick_seconds,enabled),
        )


def _membership(db:psycopg.Connection,world_id:str,owner:UUID,
                *,lock:bool=False)->tuple[datetime,int]:
    row=db.execute(
        """SELECT m.joined_at,w.world_size FROM world_memberships m
           JOIN worlds w ON w.world_id=m.world_id
           WHERE m.world_id=%s AND m.account_id=%s""" +
        (" FOR UPDATE OF m" if lock else ""),
        (world_id,owner),
    ).fetchone()
    if not row:
        raise ColonizationNotFound
    return row[0],int(row[1])


def _source(db:psycopg.Connection,*,world_id:str,owner:UUID,city_id:UUID,
            lock:bool=False)->tuple:
    row=db.execute(
        """SELECT city_id,name,x,y,first_city FROM cities
           WHERE world_id=%s AND owner_account_id=%s AND city_id=%s""" +
        (" FOR UPDATE" if lock else ""),
        (world_id,owner,city_id),
    ).fetchone()
    if not row:
        raise ColonizationNotFound
    return row


def _active_policy(db:psycopg.Connection,world_id:str,*,lock:bool=False)->dict|None:
    row=db.execute(
        """SELECT policy_id,costs,max_owned_cities,max_distance_steps,
                  seconds_per_step
           FROM colonization_world_policies
           WHERE world_id=%s AND enabled""" + (" FOR SHARE" if lock else ""),
        (world_id,),
    ).fetchone()
    if not row:
        return None
    return dict(zip(("policy_id","costs","max_owned_cities","max_distance_steps",
                     "seconds_per_step"),row))


def _approved_site(db:psycopg.Connection,*,world_id:str,owner:UUID,
                   x:int,y:int,lock:bool=False)->tuple:
    row=db.execute(
        """SELECT p.mine_types,p.rates_per_day,p.stock_capacities,
                  p.tick_seconds,p.source_ref
           FROM colonization_site_profiles p
           JOIN map_influence_cells i
             ON i.world_id=p.world_id AND i.x=p.x AND i.y=p.y
           WHERE p.world_id=%s AND p.x=%s AND p.y=%s AND p.enabled
             AND i.controller_account_id=%s""" +
        (" FOR SHARE OF p,i" if lock else ""),
        (world_id,x,y,owner),
    ).fetchone()
    if not row:
        raise ColonizationConflict("Region is not an approved location under your own influence")
    return row


def _site_clear(db:psycopg.Connection,*,world_id:str,x:int,y:int)->bool:
    # No opponent city names or hidden region contents are returned.
    return not (
        db.execute("SELECT 1 FROM cities WHERE world_id=%s AND x=%s AND y=%s",
                   (world_id,x,y)).fetchone()
        or db.execute("SELECT 1 FROM map_world_sites WHERE world_id=%s AND x=%s AND y=%s",
                      (world_id,x,y)).fetchone()
        or db.execute(
            """SELECT 1 FROM colonization_orders
               WHERE world_id=%s AND x=%s AND y=%s
                 AND status IN ('traveling','blocked')""",
            (world_id,x,y),
        ).fetchone()
    )


def _distance(source:tuple,x:int,y:int,size:int)->int:
    dx=abs(source[2]-x);dy=abs(source[3]-y)
    return min(dx,size-dx)+min(dy,size-dy)


def _counts(db:psycopg.Connection,world_id:str,owner:UUID)->tuple[int,int]:
    cities=db.execute(
        """SELECT count(*) FROM cities WHERE world_id=%s AND owner_account_id=%s""",
        (world_id,owner),
    ).fetchone()[0]
    pending=db.execute(
        """SELECT count(*) FROM colonization_orders
           WHERE world_id=%s AND owner_account_id=%s
             AND status IN ('traveling','blocked')""",
        (world_id,owner),
    ).fetchone()[0]
    return int(cities),int(pending)


def _stocks(db:psycopg.Connection,city_id:UUID,*,lock:bool=False)->dict:
    data=db.execute(
        """SELECT resource,amount,capacity FROM city_stocks
           WHERE city_id=%s ORDER BY resource""" + (" FOR UPDATE" if lock else ""),
        (city_id,),
    ).fetchall()
    if {r[0] for r in data}!=set(RESOURCE_NAMES):
        raise ColonizationConflict("Source city stock registry is incomplete")
    return {kind:(int(amount),cap) for kind,amount,cap in data}


def _hero(db:psycopg.Connection,*,city_id:UUID,owner:UUID,hero_id:UUID,
          lock:bool=False)->str:
    row=db.execute(
        """SELECT status FROM city_heroes
           WHERE hero_id=%s AND city_id=%s AND owner_account_id=%s""" +
        (" FOR UPDATE" if lock else ""),
        (hero_id,city_id,owner),
    ).fetchone()
    if not row:
        raise ColonizationConflict("No available hero belongs to the source city")
    return row[0]


def _name(value:str)->str:
    if (not isinstance(value,str) or not 2<=len(value.strip())<=80
        or any(ord(c)<32 or ord(c)==127 for c in value)):
        raise ColonizationConflict("A colony name of 2–80 printable characters is required")
    return value.strip()


def _order(db:psycopg.Connection,order_id:UUID,*,lock:bool=False)->tuple|None:
    return db.execute(
        "SELECT "+ORDER_COLUMNS+" FROM colonization_orders WHERE order_id=%s"+
        (" FOR UPDATE" if lock else ""),
        (order_id,),
    ).fetchone()


def _receipt(row:tuple,*,replayed:bool=False)->dict:
    (oid,world,source,owner,hero,new_id,name,x,y,policy,costs,mines,rates,caps,
     tick,source_ref,travel,started,due,status,finished,blocked,reason,
     refunded,refund_id)=row
    return {
        "order_id":str(oid),"world_id":world,
        "source_city_id":str(source),"hero_id":str(hero),
        "new_city_id":str(new_id) if status=="founded" else None,
        "colony_name":name,"x":x,"y":y,"policy_id":policy,
        "applied_costs":costs,"mine_types":mines,"travel_seconds":travel,
        "started_at":started.isoformat(),"due_at":due.isoformat(),
        "status":status,"completed_at":finished.isoformat() if finished else None,
        "blocked_at":blocked.isoformat() if blocked else None,
        "blocked_reason":reason,"refunded_at":refunded.isoformat() if refunded else None,
        "replayed":replayed,"historically_certified":False,
    }


def colonies_for_world(db:psycopg.Connection,*,owner:UUID,world_id:str)->dict:
    joined,size=_membership(db,world_id,owner)
    now=_now(db)
    protection_until=joined+timedelta(days=NEWBIE_DAYS)
    policy=_active_policy(db,world_id)
    current,pending=_counts(db,world_id,owner)
    cities=db.execute(
        """SELECT c.city_id,c.name,c.x,c.y,c.first_city
           FROM cities c
           WHERE c.world_id=%s AND c.owner_account_id=%s
           ORDER BY c.first_city DESC,c.founded_at,c.city_id""",
        (world_id,owner),
    ).fetchall()
    heroes=db.execute(
        """SELECT h.hero_id,h.city_id,h.name,h.status
           FROM city_heroes h JOIN cities c ON c.city_id=h.city_id
           WHERE c.world_id=%s AND c.owner_account_id=%s
             AND h.owner_account_id=%s
           ORDER BY h.city_id,h.hired_at,h.hero_id""",
        (world_id,owner,owner),
    ).fetchall()
    # Site list needs BOTH an operator-qualified plot and its current *own*
    # influence. A foreign city on it does not expose hidden details.
    sites=db.execute(
        """SELECT p.x,p.y,p.mine_types,p.source_ref
           FROM colonization_site_profiles p
           JOIN map_influence_cells i
             ON i.world_id=p.world_id AND i.x=p.x AND i.y=p.y
           WHERE p.world_id=%s AND p.enabled AND i.controller_account_id=%s
           ORDER BY p.x,p.y LIMIT 100""",(world_id,owner),
    ).fetchall()
    orders=db.execute(
        """SELECT """+ORDER_COLUMNS+"""
           FROM colonization_orders
           WHERE world_id=%s AND owner_account_id=%s
           ORDER BY started_at DESC,order_id DESC LIMIT 30""",
        (world_id,owner),
    ).fetchall()
    source_names={str(cid):name for cid,name,_,_,_ in cities}
    hero_names={str(hid):name for hid,_,name,_ in heroes}
    ids=[row[0] for row in orders]
    events_by_order={}
    if ids:
        for oid,phase,occurred,details in db.execute(
            """SELECT order_id,phase,occurred_at,details
               FROM colonization_order_events
               WHERE order_id=ANY(%s::uuid[])
               ORDER BY occurred_at,phase""",
            (ids,),
        ).fetchall():
            events_by_order.setdefault(str(oid),[]).append({
                "phase":phase,"occurred_at":occurred.isoformat(),
                "details":details,
            })
    histories=[]
    for row in orders:
        entry=_receipt(row)
        entry["source_city_name"]=source_names.get(entry["source_city_id"],
                                                      "Cité indisponible")
        entry["hero_name"]=hero_names.get(entry["hero_id"],"Héros")
        entry["events"]=events_by_order.get(entry["order_id"],[])
        histories.append(entry)
    return {
        "world_id":world_id,"world_size":size,"server_now":now.isoformat(),
        "protection_until":protection_until.isoformat(),
        "newbie_protected":now<protection_until,
        "newbie_protection_days":NEWBIE_DAYS,"protection_cannot_be_cancelled":True,
        "colonization_policy":policy,
        "owned_cities":current,"pending_expeditions":pending,
        "cities":[{"city_id":str(cid),"name":name,"x":x,"y":y,"first_city":first}
                  for cid,name,x,y,first in cities],
        "heroes":[{"hero_id":str(hid),"city_id":str(cid),"name":name,"status":status}
                  for hid,cid,name,status in heroes],
        "qualified_sites":[{"x":x,"y":y,"mine_types":mines,"source_ref":ref}
                            for x,y,mines,ref in sites],
        "expeditions":histories,
        "historically_certified":False,
        "influence_source":"operator_qualified_record_only",
    }


def quote_colony(db:psycopg.Connection,*,owner:UUID,world_id:str,
                 source_city_id:UUID,hero_id:UUID,x:int,y:int)->dict:
    joined,size=_membership(db,world_id,owner)
    if type(x) is not int or type(y) is not int or not 1<=x<=size or not 1<=y<=size:
        raise ColonizationConflict("Coordinates outside your campaign world")
    source=_source(db,world_id=world_id,owner=owner,city_id=source_city_id)
    _approved_site(db,world_id=world_id,owner=owner,x=x,y=y)
    policy=_active_policy(db,world_id)
    if not policy:
        raise ColonizationConflict("Colonization policy is not enabled for this world")
    distance=_distance(source,x,y,size)
    if not 1<=distance<=policy["max_distance_steps"]:
        raise ColonizationConflict("Colony must lie within the approved local radius")
    if not _site_clear(db,world_id=world_id,x=x,y=y):
        raise ColonizationConflict("Location currently unavailable")
    status=_hero(db,city_id=source_city_id,owner=owner,hero_id=hero_id)
    current,pending=_counts(db,world_id,owner)
    now=_now(db)
    until=joined+timedelta(days=NEWBIE_DAYS)
    costs=policy["costs"]
    stocks=_stocks(db,source_city_id)
    missing={k:max(0,costs[k]-stocks[k][0]) for k in RESOURCE_NAMES
             if costs[k]>stocks[k][0]}
    duration=distance*policy["seconds_per_step"]
    if duration>1728000:
        raise ColonizationConflict("Unsupported expedition time horizon")
    reasons=[]
    if now<until: reasons.append("newbie_protection")
    if current+pending>=policy["max_owned_cities"]:reasons.append("city_cap")
    if status!="idle":reasons.append("hero_busy")
    if missing:reasons.append("resources")
    return {
        "world_id":world_id,"source_city_id":str(source_city_id),
        "hero_id":str(hero_id),"x":x,"y":y,
        "policy_id":policy["policy_id"],"applied_costs":costs,
        "distance_steps":distance,"travel_seconds":duration,
        "protection_until":until.isoformat(),"protected":now<until,
        "current_cities":current,"pending_expeditions":pending,
        "max_owned_cities":policy["max_owned_cities"],
        "hero_available":status=="idle","missing_resources":missing,
        "can_start":not reasons,"blocking_reasons":reasons,
        "historically_certified":False,
    }


def start_colonization(db:psycopg.Connection,*,owner:UUID,world_id:str,
                       order_id:UUID,source_city_id:UUID,hero_id:UUID,
                       x:int,y:int,colony_name:str,expected_policy_id:str)->dict:
    name=_name(colony_name)
    if (type(x) is not int or type(y) is not int
        or not isinstance(expected_policy_id,str) or not 3<=len(expected_policy_id)<=100):
        raise ColonizationConflict("Invalid colonization order")
    with db.transaction():
        joined,size=_membership(db,world_id,owner,lock=True)
        # A single UUID cannot be submitted twice to reserve multiple sites or
        # charge the same city a second time. The member lock serializes this
        # player's colony capacity checks, across all their source cities.
        previous=_order(db,order_id)
        if previous:
            if (previous[1]!=world_id or previous[2]!=source_city_id or
                previous[3]!=owner or previous[4]!=hero_id or
                previous[6]!=name or previous[7]!=x or previous[8]!=y or
                previous[9]!=expected_policy_id):
                raise ColonizationConflict("Order identifier already used")
            return _receipt(previous,replayed=True)
        now=_now(db)
        if now<joined+timedelta(days=NEWBIE_DAYS):
            raise ColonizationConflict("Seven-day newcomer protection forbids a second city")
        if not 1<=x<=size or not 1<=y<=size:
            raise ColonizationConflict("Coordinates outside the campaign world")
        # A world row lock serializes competing founders of the same position.
        # The final city UNIQUE(world_id,x,y) is an independent hard invariant.
        db.execute("SELECT world_id FROM worlds WHERE world_id=%s FOR UPDATE",
                   (world_id,)).fetchone()
        source=_source(db,world_id=world_id,owner=owner,
                       city_id=source_city_id,lock=True)
        if _hero(db,city_id=source_city_id,owner=owner,
                 hero_id=hero_id,lock=True)!="idle":
            raise ColonizationConflict("An idle hero is required for colonization")
        policy=_active_policy(db,world_id,lock=True)
        if not policy or policy["policy_id"]!=expected_policy_id:
            raise ColonizationConflict("The world colonization policy changed")
        current,pending=_counts(db,world_id,owner)
        if current==0 or current+pending>=policy["max_owned_cities"]:
            raise ColonizationConflict("The current city right is exhausted")
        distance=_distance(source,x,y,size)
        if not 1<=distance<=policy["max_distance_steps"]:
            raise ColonizationConflict("The colony is outside your permitted local influence")
        mines,rates,caps,tick,site_ref=_approved_site(
            db,world_id=world_id,owner=owner,x=x,y=y,lock=True,
        )
        if not _site_clear(db,world_id=world_id,x=x,y=y):
            raise ColonizationConflict("Location unavailable or already reserved")
        duration=distance*policy["seconds_per_step"]
        if duration>1728000:
            raise ColonizationConflict("Unsupported founding expedition duration")
        costs=_validate_costs(policy["costs"])
        stocks=_stocks(db,source_city_id,lock=True)
        if any(stocks[k][0]<costs[k] for k in RESOURCE_NAMES):
            raise ColonizationConflict("Insufficient resources for the expedition")
        # Stock reservation and hero lock must either commit with the order
        # or not happen at all. Zero units may be absent from an UPDATE.
        for kind in RESOURCE_NAMES:
            if costs[kind]:
                if db.execute(
                    """UPDATE city_stocks SET amount=amount-%s
                       WHERE city_id=%s AND resource=%s AND amount>=%s""",
                    (costs[kind],source_city_id,kind,costs[kind]),
                ).rowcount!=1:
                    raise ColonizationConflict("Source resources changed during dispatch")
        next_id=uuid4()
        due=now+timedelta(seconds=duration)
        db.execute(
            """INSERT INTO colonization_orders(
              order_id,world_id,source_city_id,owner_account_id,hero_id,
              new_city_id,colony_name,x,y,policy_id,applied_costs,
              mine_types,rates_per_day,stock_capacities,tick_seconds,
              site_source_ref,travel_seconds,started_at,due_at,status)
              VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                     'traveling')""",
            (order_id,world_id,source_city_id,owner,hero_id,next_id,name,x,y,
             policy["policy_id"],Jsonb(costs),Jsonb(mines),Jsonb(rates),
             Jsonb(caps),tick,site_ref,duration,now,due),
        )
        db.execute(
            """UPDATE city_heroes SET status='colonizing'
               WHERE hero_id=%s AND city_id=%s AND owner_account_id=%s
                 AND status='idle'""",
            (hero_id,source_city_id,owner),
        )
        db.execute(
            """INSERT INTO colonization_order_events(order_id,phase,occurred_at,details)
               VALUES(%s,'departed',%s,%s)""",
            (order_id,now,Jsonb({"policy_id":policy["policy_id"],
                                 "reserved_costs":costs})),
        )
        return _receipt(_order(db,order_id))


def _block(db:psycopg.Connection,row:tuple,at:datetime,reason:str)->dict:
    oid,world,source,owner,hero=row[:5]
    db.execute(
        """UPDATE colonization_orders
           SET status='blocked',blocked_at=%s,blocked_reason=%s
           WHERE order_id=%s AND status='traveling'""",(at,reason,oid),
    )
    db.execute(
        """UPDATE city_heroes SET status='idle'
           WHERE hero_id=%s AND owner_account_id=%s AND status='colonizing'""",
        (hero,owner),
    )
    db.execute(
        """INSERT INTO colonization_order_events(order_id,phase,occurred_at,details)
           VALUES(%s,'blocked',%s,%s) ON CONFLICT DO NOTHING""",
        (oid,at,Jsonb({"reason":reason})),
    )
    return {"order_id":str(oid),"phase":"blocked","reason":reason}


def run_colonization_batch(
    db:psycopg.Connection,*,now_at:datetime|None=None,max_orders:int=25,
)->list[dict]:
    """Worker-only timed founding. Never executed from a public HTTP handler."""
    if not db.autocommit:
        raise ValueError("Founding worker requires autocommit PostgreSQL")
    if type(max_orders) is not int or not 1<=max_orders<=500:
        raise ValueError("Invalid worker batch limit")
    if now_at is None:
        now_at=_now(db)
    if not isinstance(now_at,datetime) or now_at.tzinfo is None or now_at.utcoffset() is None:
        raise ValueError("Worker clock must be timezone aware")
    now=now_at.astimezone(UTC)
    result=[]
    for _ in range(max_orders):
        with db.transaction():
            row=db.execute(
                """SELECT """+ORDER_COLUMNS+"""
                   FROM colonization_orders
                   WHERE status='traveling' AND due_at<=%s
                   ORDER BY due_at,order_id
                   FOR UPDATE SKIP LOCKED LIMIT 1""",
                (now,),
            ).fetchone()
            if row is None:
                break
            (oid,world,source,owner,hero,new_city_id,name,x,y,policy,costs,
             mines,rates,caps,tick,site_ref,seconds,started,due,status,
             completed,blocked,blocked_reason,refunded,refund_order)=row
            db.execute("SELECT world_id FROM worlds WHERE world_id=%s FOR UPDATE",
                       (world,)).fetchone()
            # Lock both sources; cross-world / operator ownership changes must
            # never complete a founding into someone else's territory.
            source_owned=db.execute(
                """SELECT c.city_id FROM cities c
                   JOIN world_memberships m
                     ON m.world_id=c.world_id AND m.account_id=%s
                   WHERE c.city_id=%s AND c.world_id=%s
                     AND c.owner_account_id=%s FOR UPDATE OF c""",
                (owner,source,world,owner),
            ).fetchone()
            hero_state=db.execute(
                """SELECT status,city_id FROM city_heroes
                   WHERE hero_id=%s AND owner_account_id=%s FOR UPDATE""",
                (hero,owner),
            ).fetchone()
            region_owned=db.execute(
                """SELECT 1 FROM map_influence_cells WHERE world_id=%s
                   AND x=%s AND y=%s AND controller_account_id=%s""",
                (world,x,y,owner),
            ).fetchone()
            site_present=db.execute(
                """SELECT 1 FROM colonization_site_profiles
                   WHERE world_id=%s AND x=%s AND y=%s""",
                (world,x,y),
            ).fetchone()
            occupied=db.execute(
                """SELECT 1 FROM cities WHERE world_id=%s AND x=%s AND y=%s""",
                (world,x,y),
            ).fetchone()
            special=db.execute(
                """SELECT 1 FROM map_world_sites WHERE world_id=%s AND x=%s AND y=%s""",
                (world,x,y),
            ).fetchone()
            if (not source_owned or hero_state!=("colonizing",source)
                or not region_owned or not site_present or occupied or special):
                result.append(_block(db,row,now,"founding_site_or_rights_changed"))
                continue
            # All city artifacts remain in the original city. The founder
            # hero returns there as idle after establishing the new settlement.
            # Its army/inventory are never moved or silently duplicated.
            try:
                with db.transaction():
                    db.execute(
                        """INSERT INTO cities(city_id,world_id,owner_account_id,
                           name,x,y,first_city,founded_at)
                           VALUES(%s,%s,%s,%s,%s,%s,false,%s)""",
                        (new_city_id,world,owner,name,x,y,now),
                    )
                    for kind in RESOURCE_NAMES:
                        db.execute(
                            """INSERT INTO city_stocks(city_id,resource,amount,capacity)
                               VALUES(%s,%s,0,%s)""",
                            (new_city_id,kind,caps[kind]),
                        )
                    for kind in mines:
                        db.execute(
                            "INSERT INTO city_mines(city_id,resource) VALUES(%s,%s)",
                            (new_city_id,kind),
                        )
                    db.execute(
                        """INSERT INTO city_economy_clock
                           (city_id,tick_seconds,last_tick_at,enabled)
                           VALUES(%s,%s,%s,true)""",
                        (new_city_id,tick,now),
                    )
                    for kind in mines:
                        db.execute(
                            """INSERT INTO city_mine_rates
                               (city_id,resource,base_units_per_day)
                               VALUES(%s,%s,%s)""",
                            (new_city_id,kind,rates[kind]),
                        )
            except psycopg.errors.UniqueViolation:
                result.append(_block(db,row,now,"founding_destination_occupied"))
                continue
            db.execute(
                """UPDATE colonization_orders
                   SET status='founded',completed_at=%s
                   WHERE order_id=%s AND status='traveling'""",
                (now,oid),
            )
            db.execute(
                """UPDATE city_heroes SET status='idle'
                   WHERE hero_id=%s AND owner_account_id=%s
                     AND status='colonizing'""",(hero,owner),
            )
            db.execute(
                """INSERT INTO colonization_order_events
                   (order_id,phase,occurred_at,details)
                   VALUES(%s,'founded',%s,%s) ON CONFLICT DO NOTHING""",
                (oid,now,Jsonb({"city_id":str(new_city_id),"site_source_ref":site_ref})),
            )
            result.append({"order_id":str(oid),"phase":"founded",
                           "city_id":str(new_city_id)})
    return result


def reclaim_blocked_colony(
    db:psycopg.Connection,*,owner:UUID,world_id:str,
    order_id:UUID,refund_order_id:UUID,
)->dict:
    """Refund a permanently blocked founding, never an in-flight/finished one.

    Overflow is explicitly refused with the original escrow intact, so the
    player can free warehouse space and retry the same refund order.
    """
    with db.transaction():
        _membership(db,world_id,owner)
        row=_order(db,order_id,lock=True)
        if row is None or row[1]!=world_id or row[3]!=owner:
            raise ColonizationNotFound
        if row[19]=="refunded" and row[24]==refund_order_id:
            return {"order_id":str(order_id),"reclaimed":True,
                    "replayed":True,"applied_refund":row[10],
                    "refunded_at":row[23].isoformat()}
        if row[19]!="blocked":
            raise ColonizationConflict("Only a blocked founding can be refunded")
        src=row[2]
        _source(db,world_id=world_id,owner=owner,city_id=src,lock=True)
        from .building_effects import resolve_city_effects
        effects=resolve_city_effects(db,src)
        stocks=_stocks(db,src,lock=True)
        for kind in RESOURCE_NAMES:
            amount=row[10][kind]
            balance,cap=stocks[kind]
            limit=BIGINT if cap is None else int(cap)+int(
                effects["capacity_bonus"].get(kind,0))
            if amount>BIGINT-balance or balance+amount>limit:
                raise ColonizationConflict("Refund requires free storage in the original city")
        for kind in RESOURCE_NAMES:
            amount=row[10][kind]
            if amount:
                db.execute(
                    """UPDATE city_stocks SET amount=amount+%s
                       WHERE city_id=%s AND resource=%s""",
                    (amount,src,kind),
                )
        now=_now(db)
        db.execute(
            """UPDATE colonization_orders SET status='refunded',
                 refunded_at=%s,refund_order_id=%s
               WHERE order_id=%s AND status='blocked'""",
            (now,refund_order_id,order_id),
        )
        db.execute(
            """INSERT INTO colonization_order_events
               (order_id,phase,occurred_at,details)
               VALUES(%s,'refunded',%s,%s)""",
            (order_id,now,Jsonb({"applied_refund":row[10]})),
        )
        return {"order_id":str(order_id),"reclaimed":True,"replayed":False,
                "applied_refund":row[10],"refunded_at":now.isoformat()}
