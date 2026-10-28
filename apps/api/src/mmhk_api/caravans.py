"""Real worker-settled caravan transfers between TWO owned cities in one world.

Only versioned LAB policies define integer load weights and per-world-tile
travel times. P0 confirms caravans are non-interceptable; no ally permissions,
PvP transfers, historical mixed-load rates or repeated dispatches are assumed.
Cargo is debited at dispatch and stays in escrow if delivery is impossible.
"""
from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb

from .building_effects import resolve_city_effects
from .worlds import RESOURCE_NAMES

MAX_UNITS = 1_000_000
BIGINT = 2**63 - 1
MAX_CAPACITY = 1_000_000_000
MAX_DURATION = 2_592_000
RETRY_SECONDS = 30


class CaravanNotFound(Exception):
    """An unowned or nonexistent source city is always masked as 404."""


class CaravanConflict(Exception):
    """The submitted plan cannot be carried out in the present state."""


def _validated_cargo(cargo: dict) -> dict[str,int]:
    if (not isinstance(cargo,dict) or set(cargo) != set(RESOURCE_NAMES)
        or any(type(v) is not int or v<0 or v>MAX_UNITS for v in cargo.values())
        or not any(cargo.values())):
        raise CaravanConflict("Cargo must specify seven nonnegative resources and a nonempty load")
    return {kind:cargo[kind] for kind in RESOURCE_NAMES}


def _validated_weights(weights: dict) -> dict[str,int]:
    if (not isinstance(weights,dict) or set(weights)!=set(RESOURCE_NAMES)
        or any(type(v) is not int or not 1<=v<=1_000_000 for v in weights.values())):
        raise ValueError("Seven positive versioned cargo weights are required")
    return {kind:weights[kind] for kind in RESOURCE_NAMES}


def configure_caravan_policy(
    db: psycopg.Connection, *, world_id: str, policy_id: str,
    capacity_units: int, weights: dict, seconds_per_tile: int,
    enabled: bool = True,
) -> None:
    """Trusted insert-only operator policy. A world may have one active version."""
    if (not isinstance(world_id,str) or not 1<=len(world_id)<=64
        or not isinstance(policy_id,str) or not 3<=len(policy_id)<=100
        or type(capacity_units) is not int or not 1<=capacity_units<=MAX_CAPACITY
        or type(seconds_per_tile) is not int or not 1<=seconds_per_tile<=86400
        or type(enabled) is not bool):
        raise ValueError("Invalid experimental caravan policy")
    clean = _validated_weights(weights)
    with db.transaction():
        db.execute(
            """INSERT INTO caravan_transport_policies
               (world_id,policy_id,capacity_units,resource_weights,seconds_per_tile,enabled)
               VALUES(%s,%s,%s,%s,%s,%s)""",
            (world_id,policy_id,capacity_units,Jsonb(clean),seconds_per_tile,enabled),
        )


def _city(db:psycopg.Connection, *, city_id:UUID, owner:UUID,
          world_id:str|None=None, lock:bool=False) -> tuple:
    row=db.execute(
        """SELECT c.world_id,c.name,c.x,c.y,w.world_size
           FROM cities c
           JOIN world_memberships m ON m.world_id=c.world_id AND m.account_id=%s
           JOIN worlds w ON w.world_id=c.world_id
           WHERE c.city_id=%s AND c.owner_account_id=%s""" +
        (" AND c.world_id=%s" if world_id is not None else "") +
        (" FOR UPDATE OF c" if lock else ""),
        (owner,city_id,owner,*((world_id,) if world_id is not None else ())),
    ).fetchone()
    if row is None:
        if world_id is None:
            raise CaravanNotFound
        raise CaravanConflict("Destination unavailable for the sending player")
    return row


def _policy(db:psycopg.Connection, world_id:str, *,lock:bool=False) -> dict:
    row=db.execute(
        """SELECT policy_id,capacity_units,resource_weights,seconds_per_tile
           FROM caravan_transport_policies WHERE world_id=%s AND enabled""" +
        (" FOR SHARE" if lock else ""),
        (world_id,),
    ).fetchone()
    if row is None:
        raise CaravanConflict("No active caravan policy in this world")
    policy,capacity,weights,rate=row
    return {"policy_id":policy,"capacity_units":capacity,
            "resource_weights":weights,"seconds_per_tile":rate}


def _has_market(db:psycopg.Connection, city_id:UUID) -> bool:
    return any(x["building_code"]=="marketplace" and x["active"]
               for x in resolve_city_effects(db,city_id)["buildings"])


def _load(cargo:dict, policy:dict) -> int:
    weight=sum(cargo[k]*policy["resource_weights"][k] for k in RESOURCE_NAMES)
    if weight>MAX_CAPACITY or weight>policy["capacity_units"]:
        raise CaravanConflict("Mixed cargo exceeds the single caravan capacity")
    return weight


def _distance(a:tuple,b:tuple) -> int:
    if a[0]!=b[0] or a[4]!=b[4]:
        raise CaravanConflict("Destination must belong to the same world")
    size=a[4]
    dx=abs(a[2]-b[2]);dy=abs(a[3]-b[3])
    return min(dx,size-dx)+min(dy,size-dy)


def _stock_rows(db:psycopg.Connection,city_id:UUID,*,lock:bool) -> dict:
    rows=db.execute(
        """SELECT resource,amount,capacity FROM city_stocks
           WHERE city_id=%s ORDER BY resource""" + (" FOR UPDATE" if lock else ""),
        (city_id,),
    ).fetchall()
    if {r[0] for r in rows} != set(RESOURCE_NAMES):
        raise CaravanConflict("City stocks incomplete")
    return {k:(int(amount),capacity) for k,amount,capacity in rows}


def _receipt(row:tuple,*,replayed:bool=False) -> dict:
    (shipment_id,world_id,owner,origin,destination,policy_id,cargo,weights,
     load_units,capacity_units,distance_steps,travel_seconds,dispatched_at,
     arrival_due_at,return_due_at,next_attempt_at,completed_at,status,return_leg)=row
    return {
        "shipment_id":str(shipment_id),"world_id":world_id,
        "source_city_id":str(origin),"destination_city_id":str(destination),
        "policy_id":policy_id,"cargo":cargo,"resource_weights":weights,
        "load_units":load_units,"capacity_units":capacity_units,
        "distance_steps":distance_steps,"travel_seconds":travel_seconds,
        "dispatched_at":dispatched_at.isoformat(),
        "arrival_due_at":arrival_due_at.isoformat(),
        "return_due_at":return_due_at.isoformat() if return_due_at else None,
        "next_attempt_at":next_attempt_at.isoformat() if next_attempt_at else None,
        "completed_at":completed_at.isoformat() if completed_at else None,
        "status":status,"return_leg":return_leg,
        "replayed":replayed,"historically_certified":False,
    }


_COLUMNS = """shipment_id,world_id,owner_account_id,source_city_id,
               destination_city_id,policy_id,cargo,resource_weights,load_units,
               capacity_units,distance_steps,travel_seconds,dispatched_at,
               arrival_due_at,return_due_at,next_attempt_at,completed_at,
               status,return_leg"""


def caravan_for_city(db:psycopg.Connection,*,owner:UUID,city_id:UUID)->dict:
    source=_city(db,city_id=city_id,owner=owner)
    policy=None
    try:
        policy=_policy(db,source[0])
    except CaravanConflict:
        pass
    destinations=db.execute(
        """SELECT c.city_id,c.name,c.x,c.y FROM cities c
           JOIN world_memberships m ON m.world_id=c.world_id AND m.account_id=%s
           WHERE c.owner_account_id=%s AND c.world_id=%s AND c.city_id<>%s
           ORDER BY c.name,c.city_id""",
        (owner,owner,source[0],city_id),
    ).fetchall()
    shipments=db.execute(
        """SELECT """+_COLUMNS+"""
           FROM caravan_shipments
           WHERE owner_account_id=%s AND
             (source_city_id=%s OR destination_city_id=%s)
           ORDER BY dispatched_at DESC,shipment_id DESC LIMIT 24""",
        (owner,city_id,city_id),
    ).fetchall()
    # Destination names in the read model are names of *currently owned* cities
    # only. A transferred city's private state/name must not leak.
    safe_names={str(city_id):source[1]}
    safe_names.update({str(c[0]):c[1] for c in destinations})
    results=[]
    for row in shipments:
        entry=_receipt(row)
        entry["source_name"]=safe_names.get(entry["source_city_id"],"Cité indisponible")
        entry["destination_name"]=safe_names.get(entry["destination_city_id"],"Cité indisponible")
        results.append(entry)
    return {
        "city_id":str(city_id),
        "marketplace_active":_has_market(db,city_id),
        "transport_policy":policy,
        "destinations":[{"city_id":str(c[0]),"name":c[1],"x":c[2],"y":c[3]}
                        for c in destinations],
        "shipments":results,
        "repetition_enabled":False,
        "ally_destinations_enabled":False,
        "historically_certified":False,
    }


def quote_caravan(db:psycopg.Connection,*,owner:UUID,city_id:UUID,
                  destination_city_id:UUID,cargo:dict)->dict:
    origin=_city(db,city_id=city_id,owner=owner)
    if city_id==destination_city_id:
        raise CaravanConflict("A convoy requires another city")
    target=_city(db,city_id=destination_city_id,owner=owner,world_id=origin[0])
    policy=_policy(db,origin[0])
    load=_validated_cargo(cargo)
    weight=_load(load,policy)
    distance=_distance(origin,target)
    if distance<1:
        raise CaravanConflict("A different city position is required")
    duration=distance*policy["seconds_per_tile"]
    if duration>MAX_DURATION:
        raise CaravanConflict("Route exceeds the experimental time horizon")
    balances=_stock_rows(db,city_id,lock=False)
    missing={k:max(0,load[k]-balances[k][0]) for k in RESOURCE_NAMES if load[k]>balances[k][0]}
    market_open=_has_market(db,city_id)
    return {
        "city_id":str(city_id),"destination_city_id":str(destination_city_id),
        "destination_name":target[1],"cargo":load,
        "load_units":weight,"capacity_units":policy["capacity_units"],
        "distance_steps":distance,"travel_seconds":duration,
        "policy_id":policy["policy_id"],"resource_weights":policy["resource_weights"],
        "marketplace_active":market_open,
        "missing_stocks":missing,
        "can_send":market_open and not missing,
        "historically_certified":False,
    }


def send_caravan(db:psycopg.Connection,*,owner:UUID,city_id:UUID,
                 destination_city_id:UUID,shipment_id:UUID,cargo:dict,
                 expected_policy_id:str)->dict:
    with db.transaction():
        origin=_city(db,city_id=city_id,owner=owner)
        if not isinstance(expected_policy_id,str) or not 3<=len(expected_policy_id)<=100:
            raise CaravanConflict("Invalid transport contract")
        load=_validated_cargo(cargo)
        # Serialize peer city operations and protect against double spending.
        for cid in sorted((city_id,destination_city_id),key=str):
            if cid==city_id:
                _city(db,city_id=cid,owner=owner,lock=True)
            else:
                _city(db,city_id=cid,owner=owner,world_id=origin[0],lock=True)
        existing=db.execute(
            "SELECT "+_COLUMNS+" FROM caravan_shipments WHERE shipment_id=%s",
            (shipment_id,),
        ).fetchone()
        if existing:
            if (existing[2]!=owner or existing[3]!=city_id or
                existing[4]!=destination_city_id or existing[6]!=load or
                existing[5]!=expected_policy_id):
                raise CaravanConflict("Shipment ID is already assigned to a different intent")
            return _receipt(existing,replayed=True)
        if city_id==destination_city_id:
            raise CaravanConflict("Cannot send a caravan to itself")
        target=_city(db,city_id=destination_city_id,owner=owner,world_id=origin[0])
        if not _has_market(db,city_id):
            raise CaravanConflict("Sending city marketplace must be completed and active")
        policy=_policy(db,origin[0],lock=True)
        if policy["policy_id"]!=expected_policy_id:
            raise CaravanConflict("Policy changed since quote")
        weight=_load(load,policy)
        distance=_distance(origin,target)
        seconds=distance*policy["seconds_per_tile"]
        if distance<1 or seconds>MAX_DURATION:
            raise CaravanConflict("Unsupported experimental route")
        stocks=_stock_rows(db,city_id,lock=True)
        if any(stocks[k][0]<load[k] for k in RESOURCE_NAMES):
            raise CaravanConflict("Insufficient source stock")
        for kind in RESOURCE_NAMES:
            if load[kind]:
                updated=db.execute(
                    """UPDATE city_stocks SET amount=amount-%s
                       WHERE city_id=%s AND resource=%s AND amount>=%s""",
                    (load[kind],city_id,kind,load[kind]),
                )
                if updated.rowcount!=1:
                    raise CaravanConflict("Cargo reservation conflicted")
        started=db.execute("SELECT clock_timestamp()").fetchone()[0]
        arrives=started+timedelta(seconds=seconds)
        db.execute(
            """INSERT INTO caravan_shipments(
              shipment_id,world_id,owner_account_id,source_city_id,
              destination_city_id,policy_id,cargo,resource_weights,
              load_units,capacity_units,distance_steps,travel_seconds,
              dispatched_at,arrival_due_at,next_attempt_at,status)
              VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'in_transit')""",
            (shipment_id,origin[0],owner,city_id,destination_city_id,
             policy["policy_id"],Jsonb(load),Jsonb(policy["resource_weights"]),
             weight,policy["capacity_units"],distance,seconds,started,arrives,arrives),
        )
        db.execute(
            """INSERT INTO caravan_shipment_events
               (shipment_id,phase,occurred_at,details)
               VALUES(%s,'departed',%s,%s)""",
            (shipment_id,started,Jsonb({"load_units":weight,"cargo":load})),
        )
        row=db.execute(
            "SELECT "+_COLUMNS+" FROM caravan_shipments WHERE shipment_id=%s",
            (shipment_id,),
        ).fetchone()
        return _receipt(row)


def _settlement_target(db:psycopg.Connection,row:tuple) -> tuple[UUID,bool]:
    """If destination has lost ownership, cargo goes back to sender."""
    owner,origin,destination,world,status,is_returning=row
    if is_returning:
        return origin,True
    still_owned=db.execute(
        """SELECT 1 FROM cities c
           JOIN world_memberships m ON m.world_id=c.world_id AND m.account_id=%s
           WHERE c.city_id=%s AND c.owner_account_id=%s AND c.world_id=%s""",
        (owner,destination,owner,world),
    ).fetchone()
    if still_owned:
        return destination,False
    return origin,True


def run_caravan_batch(db:psycopg.Connection,*,now_at:datetime|None=None,
                      max_orders:int=25)->list[dict]:
    """Bounded worker. Durable escrow prevents loss or double credit after a crash."""
    if not db.autocommit:
        raise ValueError("Caravan worker requires an autocommit PostgreSQL connection")
    if type(max_orders) is not int or not 1<=max_orders<=500:
        raise ValueError("Invalid worker batch limit")
    if now_at is None:
        now_at=db.execute("SELECT clock_timestamp()").fetchone()[0]
    if not isinstance(now_at,datetime) or now_at.tzinfo is None or now_at.utcoffset() is None:
        raise ValueError("Worker time must be timezone aware")
    now_at=now_at.astimezone(UTC)
    result=[]
    for _ in range(max_orders):
        with db.transaction():
            due=db.execute(
                """SELECT """+_COLUMNS+"""
                   FROM caravan_shipments
                   WHERE status IN ('in_transit','returning','awaiting_storage')
                     AND next_attempt_at<=%s
                   ORDER BY next_attempt_at,shipment_id
                   FOR UPDATE SKIP LOCKED LIMIT 1""",
                (now_at,),
            ).fetchone()
            if due is None:
                break
            (sid,world,owner,source,target,policy,cargo,weights,weight,capacity,
             distance,travel,depart,arrives,return_due,retry,finished,status,back) = due
            # Lock cities in fixed order, also matching player order acquisition.
            # Operator deletion of a city is RESTRICTED while cargo is in flight.
            for cid in sorted((source,target),key=str):
                if not db.execute("SELECT 1 FROM cities WHERE city_id=%s FOR UPDATE",(cid,)).fetchone():
                    raise RuntimeError("Caravan lost a referenced city")
            destination,should_return=_settlement_target(
                db,(owner,source,target,world,status,back))
            if should_return and not back:
                at=now_at
                return_time=at+timedelta(seconds=travel)
                db.execute(
                    """UPDATE caravan_shipments
                       SET status='returning',return_leg=true,
                           return_due_at=%s,next_attempt_at=%s
                       WHERE shipment_id=%s""",
                    (return_time,return_time,sid),
                )
                db.execute(
                    """INSERT INTO caravan_shipment_events
                       (shipment_id,phase,occurred_at)
                       VALUES(%s,'returning',%s)
                       ON CONFLICT DO NOTHING""",(sid,at),
                )
                result.append({"shipment_id":str(sid),"phase":"returning"})
                continue
            target_status="returned" if back else "delivered"
            # Never release cargo into a different owner's city.
            owned=db.execute(
                """SELECT 1 FROM cities c JOIN world_memberships m
                   ON m.world_id=c.world_id AND m.account_id=%s
                   WHERE c.city_id=%s AND c.owner_account_id=%s
                     AND c.world_id=%s""",
                (owner,destination,owner,world),
            ).fetchone()
            if not owned:
                # Ownership changed even for the origin: retain goods in escrow.
                event="awaiting_ownership"
                ok=False
            else:
                effects=resolve_city_effects(db,destination)
                stocks=_stock_rows(db,destination,lock=True)
                ok=True
                for k in RESOURCE_NAMES:
                    requested=int(cargo.get(k,0))
                    base,cap=stocks[k]
                    storage=(BIGINT if cap is None else
                             int(cap)+int(effects["capacity_bonus"].get(k,0)))
                    if (storage>BIGINT or requested>BIGINT-base or
                        base+requested>storage):
                        ok=False
                        break
                event="awaiting_storage"
            if not ok:
                db.execute(
                    """UPDATE caravan_shipments
                       SET status='awaiting_storage',next_attempt_at=%s
                       WHERE shipment_id=%s""",
                    (now_at+timedelta(seconds=RETRY_SECONDS),sid),
                )
                db.execute(
                    """INSERT INTO caravan_shipment_events
                       (shipment_id,phase,occurred_at)
                       VALUES(%s,%s,%s) ON CONFLICT DO NOTHING""",
                    (sid,event,now_at),
                )
                result.append({"shipment_id":str(sid),"phase":event})
                continue
            for k in RESOURCE_NAMES:
                if cargo[k]:
                    credited=db.execute(
                        """UPDATE city_stocks SET amount=amount+%s
                           WHERE city_id=%s AND resource=%s""",
                        (cargo[k],destination,k),
                    )
                    if credited.rowcount!=1:
                        raise RuntimeError("Lost atomic caravan credit")
            changed=db.execute(
                """UPDATE caravan_shipments
                   SET status=%s,completed_at=%s,next_attempt_at=NULL
                   WHERE shipment_id=%s AND completed_at IS NULL""",
                (target_status,now_at,sid),
            )
            if changed.rowcount!=1:
                raise RuntimeError("Caravan completion compare-and-swap failed")
            db.execute(
                """INSERT INTO caravan_shipment_events
                   (shipment_id,phase,occurred_at)
                   VALUES(%s,%s,%s) ON CONFLICT DO NOTHING""",
                (sid,target_status,now_at),
            )
            result.append({"shipment_id":str(sid),"phase":target_status})
    return result
