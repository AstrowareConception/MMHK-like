"""Bounded scheduled LAB caravan programs; not an inferred historical scheduler.

Every execution is a distinct real caravan_shipments order, committed with
the parent program's progress under one transaction. No future cargo is ever
pre-reserved. Each departure rechecks ownership, market, tariff and stocks.
A stop wins only when it obtains the program row lock before a departure.
"""
from __future__ import annotations

from datetime import UTC,datetime,timedelta
from uuid import UUID,uuid5,NAMESPACE_URL

import psycopg
from psycopg.types.json import Jsonb

from .caravans import (
    CaravanNotFound,CaravanConflict,_city,_policy,_has_market,_load,
    _stock_rows,_validated_cargo,send_caravan,
)
from .worlds import RESOURCE_NAMES

MAX_ACTIVE=5
RETRY_SECONDS=60
PROGRAM_COLUMNS="""program_id,world_id,owner_account_id,source_city_id,
 destination_city_id,policy_id,cargo_template,quantity_mode,
 shipments_total,shipments_sent,wait_seconds,capacity_units,resource_weights,
 seconds_per_tile,status,status_reason,created_at,next_departure_at,
 last_departed_at,closed_at"""


class CaravanProgramConflict(CaravanConflict):
    """The requested program action is impossible without changing the contract."""


def _read_program(db:psycopg.Connection,program_id:UUID,*,lock:bool=False)->tuple|None:
    return db.execute(
        "SELECT "+PROGRAM_COLUMNS+" FROM caravan_dispatch_programs WHERE program_id=%s"+
        (" FOR UPDATE" if lock else ""), (program_id,),
    ).fetchone()


def _view(row:tuple,*,replayed:bool=False)->dict:
    (pid,world,owner,source,target,policy,cargo,mode,total,sent,wait,capacity,
     weights,speed,status,reason,created,next_at,last_at,closed)=row
    return {
        "program_id":str(pid),"world_id":world,"source_city_id":str(source),
        "destination_city_id":str(target),"policy_id":policy,
        "cargo_template":cargo,"quantity_mode":mode,"shipments_total":total,
        "shipments_sent":sent,"wait_seconds":wait,"capacity_units":capacity,
        "resource_weights":weights,"seconds_per_tile":speed,"status":status,
        "status_reason":reason,"created_at":created.isoformat(),
        "next_departure_at":next_at.isoformat() if next_at else None,
        "last_departed_at":last_at.isoformat() if last_at else None,
        "closed_at":closed.isoformat() if closed else None,
        "replayed":replayed,"historically_certified":False,
    }


def programs_for_city(db:psycopg.Connection,*,owner:UUID,city_id:UUID)->list[dict]:
    _city(db,city_id=city_id,owner=owner)
    rows=db.execute(
        """SELECT """+PROGRAM_COLUMNS+"""
           FROM caravan_dispatch_programs
           WHERE owner_account_id=%s AND source_city_id=%s
           ORDER BY created_at DESC,program_id DESC LIMIT 24""",
        (owner,city_id),
    ).fetchall()
    return [_view(row) for row in rows]


def create_program(
    db:psycopg.Connection,*,owner:UUID,city_id:UUID,
    destination_city_id:UUID,program_id:UUID,cargo_template:dict,
    expected_policy_id:str,quantity_mode:str,shipments_total:int,
    wait_seconds:int,
)->dict:
    if (not isinstance(expected_policy_id,str) or not 3<=len(expected_policy_id)<=100
        or quantity_mode not in ("exact","available_up_to")
        or type(shipments_total) is not int or not 2<=shipments_total<=12
        or type(wait_seconds) is not int or not 60<=wait_seconds<=86400):
        raise CaravanProgramConflict("Invalid bounded repeating caravan configuration")
    requested=_validated_cargo(cargo_template)
    with db.transaction():
        source=_city(db,city_id=city_id,owner=owner)
        # Duplicate UUID synchronizes via database-wide advisory lock. Replays
        # do not create a second program, even if the policy is now disabled.
        db.execute("SELECT pg_advisory_xact_lock(hashtextextended(%s,2))",
                   (str(program_id),))
        prior=_read_program(db,program_id)
        if prior is not None:
            if (prior[2]!=owner or prior[3]!=city_id or prior[4]!=destination_city_id
                or prior[5]!=expected_policy_id or prior[6]!=requested
                or prior[7]!=quantity_mode or prior[8]!=shipments_total
                or prior[10]!=wait_seconds):
                raise CaravanProgramConflict("Program identifier already used")
            return _view(prior,replayed=True)
        if city_id==destination_city_id:
            raise CaravanProgramConflict("Source and destination must differ")
        # Deterministic city locks match send_caravan and settlement worker.
        for cid in sorted((city_id,destination_city_id),key=str):
            _city(db,city_id=cid,owner=owner,world_id=source[0],lock=True)
        if not _has_market(db,city_id):
            raise CaravanProgramConflict("A completed marketplace is required")
        policy=_policy(db,source[0],lock=True)
        if policy["policy_id"]!=expected_policy_id:
            raise CaravanProgramConflict("Transport policy changed")
        _load(requested,policy)
        if db.execute(
            """SELECT count(*) FROM caravan_dispatch_programs
               WHERE source_city_id=%s AND owner_account_id=%s
                 AND status IN ('active','waiting_stock','paused')""",
            (city_id,owner),
        ).fetchone()[0]>=MAX_ACTIVE:
            raise CaravanProgramConflict("Too many unfinished caravan programs")
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        # Creation schedules an attempt immediately, but reserves no stock.
        db.execute(
            """INSERT INTO caravan_dispatch_programs(
               program_id,world_id,owner_account_id,source_city_id,
               destination_city_id,policy_id,cargo_template,quantity_mode,
               shipments_total,shipments_sent,wait_seconds,capacity_units,
               resource_weights,seconds_per_tile,status,created_at,next_departure_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,0,%s,%s,%s,%s,'active',%s,%s)""",
            (program_id,source[0],owner,city_id,destination_city_id,
             policy["policy_id"],Jsonb(requested),quantity_mode,shipments_total,
             wait_seconds,policy["capacity_units"],Jsonb(policy["resource_weights"]),
             policy["seconds_per_tile"],now,now),
        )
        return _view(_read_program(db,program_id))


def stop_program(
    db:psycopg.Connection,*,owner:UUID,city_id:UUID,
    program_id:UUID,order_id:UUID,
)->dict:
    with db.transaction():
        _city(db,city_id=city_id,owner=owner)
        # Lock the program first; the worker and cancellation have a
        # deterministic winner for a departure due exactly now.
        row=_read_program(db,program_id,lock=True)
        if row is None or row[2]!=owner or row[3]!=city_id:
            raise CaravanNotFound
        old=db.execute(
            """SELECT program_id,actor_account_id,city_id,receipt
               FROM caravan_program_stop_orders WHERE order_id=%s""",
            (order_id,),
        ).fetchone()
        if old is not None:
            if old[:3]!=(program_id,owner,city_id):
                raise CaravanProgramConflict("Stop order ID already used")
            return {**old[3],"replayed":True}
        if row[14] not in ("active","waiting_stock","paused"):
            raise CaravanProgramConflict("No remaining departures to stop")
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        db.execute(
            """UPDATE caravan_dispatch_programs
               SET status='stopped',status_reason='stopped_by_owner',
                   next_departure_at=NULL,closed_at=%s
               WHERE program_id=%s""",(now,program_id),
        )
        receipt={
            "program_id":str(program_id),"status":"stopped",
            "shipments_sent":row[9],"shipments_total":row[8],
            "accepted_at":now.isoformat(),
            "already_departed_unchanged":True,
            "historically_certified":False,
        }
        db.execute(
            """INSERT INTO caravan_program_stop_orders(
               order_id,program_id,actor_account_id,city_id,receipt,accepted_at)
               VALUES(%s,%s,%s,%s,%s,%s)""",
            (order_id,program_id,owner,city_id,Jsonb(receipt),now),
        )
        return {**receipt,"replayed":False}


def _change_state(db:psycopg.Connection,program_id:UUID,*,status:str,
                  reason:str|None,next_at:datetime|None,
                  closed_at:datetime|None) -> None:
    db.execute(
        """UPDATE caravan_dispatch_programs
           SET status=%s,status_reason=%s,next_departure_at=%s,closed_at=%s
           WHERE program_id=%s""",
        (status,reason,next_at,closed_at,program_id),
    )


def _consistent_policy(policy:dict,old:tuple)->bool:
    return (
        policy["policy_id"]==old[5]
        and policy["capacity_units"]==old[11]
        and policy["resource_weights"]==old[12]
        and policy["seconds_per_tile"]==old[13]
    )


def _defer(db:psycopg.Connection,program_id:UUID,*,now:datetime,
           reason:str)->dict:
    _change_state(
        db,program_id,status="waiting_stock",reason=reason,
        next_at=now+timedelta(seconds=RETRY_SECONDS),closed_at=None,
    )
    return {"program_id":str(program_id),"phase":"waiting_stock",
            "reason":reason}


def run_program_batch(
    db:psycopg.Connection,*,now_at:datetime|None=None,max_orders:int=25,
)->list[dict]:
    """One due-program transition per transaction, and a bounded total.

    Same deterministic locking as manual caravans: program row, two cities
    sorted by UUID, operator rate row, and source stocks in resource order.
    One real shipment UUID is derived from (program_id,sequence). Neither
    retries nor two simultaneous workers can create a second shipment.
    """
    if not db.autocommit:
        raise ValueError("Program worker requires an autocommit connection")
    if type(max_orders) is not int or not 1<=max_orders<=500:
        raise ValueError("Invalid program worker batch limit")
    if now_at is None:
        now_at=db.execute("SELECT clock_timestamp()").fetchone()[0]
    if not isinstance(now_at,datetime) or now_at.tzinfo is None:
        raise ValueError("Program clock must be timezone-aware")
    now=now_at.astimezone(UTC)
    events=[]
    for _ in range(max_orders):
        with db.transaction():
            row=db.execute(
                """SELECT """+PROGRAM_COLUMNS+"""
                   FROM caravan_dispatch_programs
                   WHERE status IN ('active','waiting_stock')
                     AND next_departure_at<=%s
                   ORDER BY next_departure_at,program_id
                   FOR UPDATE SKIP LOCKED LIMIT 1""",
                (now,),
            ).fetchone()
            if not row:
                break
            (pid,world,owner,origin,target,policy_id,template,mode,total,sent,wait,
             capacity,weights,speed,status,reason,created,due,last,closed) = row
            # Locks source and destination regardless of ownership so
            # concurrent capture/transfer has a definitive winner.
            for cid in sorted((origin,target),key=str):
                db.execute("SELECT city_id FROM cities WHERE city_id=%s FOR UPDATE",
                           (cid,)).fetchone()
            try:
                _city(db,city_id=origin,owner=owner,world_id=world)
                _city(db,city_id=target,owner=owner,world_id=world)
                if not _has_market(db,origin):
                    raise CaravanProgramConflict("Source market suspended")
                policy=_policy(db,world,lock=True)
                if not _consistent_policy(policy,row):
                    raise CaravanProgramConflict("Operator policy changed")
                requested=_validated_cargo(template)
                _load(requested,policy)
            except (CaravanNotFound,CaravanConflict,ValueError) as exc:
                _change_state(db,pid,status="paused",
                    reason="rights_market_or_policy_changed",
                    next_at=None,closed_at=now)
                events.append({"program_id":str(pid),"phase":"paused",
                               "reason":"rights_market_or_policy_changed"})
                continue
            stocks=_stock_rows(db,origin,lock=True)
            selected={
                k:(requested[k] if mode=="exact" else
                   min(requested[k],stocks[k][0]))
                for k in RESOURCE_NAMES
            }
            if (not any(selected.values()) or
                any(stocks[k][0]<selected[k] for k in RESOURCE_NAMES)):
                events.append(_defer(db,pid,now=now,reason="insufficient_stock"))
                continue
            # Direct dispatcher rechecks everything and records its shipment
            # in a nested SAVEPOINT inside this program transaction.
            sequence=sent+1
            shipment_id=uuid5(NAMESPACE_URL,
                "mmhk-caravan-program:"+str(pid)+":"+str(sequence))
            try:
                shipment=send_caravan(
                    db,owner=owner,city_id=origin,destination_city_id=target,
                    shipment_id=shipment_id,cargo=selected,
                    expected_policy_id=policy_id,depart_at=now,
                )
            except CaravanConflict:
                _change_state(db,pid,status="paused",
                              reason="dispatch_rejected",
                              next_at=None,closed_at=now)
                events.append({"program_id":str(pid),"phase":"paused",
                               "reason":"dispatch_rejected"})
                continue
            link=db.execute(
                """UPDATE caravan_shipments SET program_id=%s,program_sequence=%s
                   WHERE shipment_id=%s AND program_id IS NULL""",
                (pid,sequence,shipment_id),
            )
            if link.rowcount!=1:
                raise RuntimeError("Program shipment link conflict")
            finished=sequence>=total
            db.execute(
                """UPDATE caravan_dispatch_programs
                   SET shipments_sent=%s,last_departed_at=%s,
                       status=%s,status_reason=NULL,
                       next_departure_at=%s,closed_at=%s
                   WHERE program_id=%s AND shipments_sent=%s""",
                (sequence,now,"completed" if finished else "active",
                 None if finished else now+timedelta(seconds=wait),
                 now if finished else None,pid,sent),
            )
            events.append({
                "program_id":str(pid),"phase":"completed" if finished else "dispatched",
                "shipment_id":str(shipment_id),"sequence":sequence,
                "total":total,"cargo":selected,
            })
    return events
