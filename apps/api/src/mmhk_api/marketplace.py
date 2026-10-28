"""Owner-scoped fixed-price market with escrow and atomic player-to-player settlement.

All assets, caps, policies and balances are authoritative PostgreSQL state.
These are explicitly experimental lab rules (NO historic S2 delivery, auction,
commission or anti-transfer mechanics are asserted).
"""
from __future__ import annotations

from datetime import timedelta
from uuid import UUID, uuid4

import psycopg
from psycopg.types.json import Jsonb

from .building_effects import resolve_city_effects
from .worlds import RESOURCE_NAMES
from .merchant import _city_world

MAX_AMOUNT=1_000_000
BIGINT=2**63-1
_VALID_DURATION=(60,604800)


class MarketplaceNotFound(Exception):
    """City or offer inaccessible in the current world."""


class MarketplaceConflict(Exception):
    """A market command is unauthorized in the current economic state."""


def _positive(value: int, *, max_value: int = MAX_AMOUNT) -> bool:
    return type(value) is int and 1 <= value <= max_value


def _valid_pair(resource: str, price_resource: str) -> bool:
    return (resource in RESOURCE_NAMES and price_resource in RESOURCE_NAMES
            and resource != price_resource)


def _lock_intent(db: psycopg.Connection, order_id: UUID) -> None:
    # One global serialisation point for a duplicate UUID across separate cities.
    # All three operation types take this advisory lock before offer/city locks.
    db.execute("SELECT pg_advisory_xact_lock(hashtextextended(%s,0))",(str(order_id),))


def _replay(db: psycopg.Connection, *, order_id: UUID, actor: UUID,
            city_id: UUID, action: str, intent: dict) -> dict | None:
    record=db.execute(
        """SELECT actor_account_id,actor_city_id,operation,intent,receipt
           FROM marketplace_orders WHERE order_id=%s""",(order_id,),
    ).fetchone()
    if not record:
        return None
    if record[:4] != (actor,city_id,action,intent):
        raise MarketplaceConflict("Order identifier already used")
    return {**record[4],"replayed":True}


def _save(db: psycopg.Connection, *, order_id: UUID, offer_id: UUID,
          actor: UUID, city_id: UUID, action: str, intent: dict,
          receipt: dict, at) -> dict:
    db.execute(
        """INSERT INTO marketplace_orders
           (order_id,offer_id,actor_city_id,actor_account_id,operation,
            intent,receipt,completed_at)
           VALUES(%s,%s,%s,%s,%s,%s,%s,%s)""",
        (order_id,offer_id,city_id,actor,action,Jsonb(intent),Jsonb(receipt),at),
    )
    return {**receipt,"replayed":False}


def _lock_cities(db: psycopg.Connection, ids: list[UUID]) -> None:
    # Consistent order across simultaneous cross-city exchanges, cancellations,
    # regular city spending and stock production.
    for city_id in sorted(set(ids), key=str):
        if not db.execute(
            "SELECT city_id FROM cities WHERE city_id=%s FOR UPDATE",(city_id,),
        ).fetchone():
            raise MarketplaceConflict("A settlement city no longer exists")


def _policy(db: psycopg.Connection, world_id: str, *,
            lock: bool = False) -> dict | None:
    row=db.execute(
        """SELECT policy_id,max_quantity,max_price,min_duration_seconds,
                  max_duration_seconds,delivery_mode
           FROM marketplace_policies
           WHERE world_id=%s AND enabled""" + (" FOR SHARE" if lock else ""),
        (world_id,),
    ).fetchone()
    if not row:
        return None
    return dict(zip(("policy_id","max_quantity","max_price",
                     "min_duration_seconds","max_duration_seconds","delivery_mode"),row))


def configure_marketplace_policy(db: psycopg.Connection, *, world_id: str,
                                 policy_id: str, max_quantity: int,
                                 max_price: int, min_duration_seconds: int,
                                 max_duration_seconds: int,
                                 enabled: bool = True) -> None:
    """Operator-only insert; game has NO public tariff/auction administration."""
    if (not isinstance(world_id,str) or not 1<=len(world_id)<=64 or
        not isinstance(policy_id,str) or not 3<=len(policy_id)<=100 or
        not _positive(max_quantity) or not _positive(max_price) or
        type(min_duration_seconds) is not int or
        type(max_duration_seconds) is not int or
        not 60<=min_duration_seconds<=max_duration_seconds<=604800 or
        type(enabled) is not bool):
        raise ValueError("Invalid versioned marketplace policy")
    with db.transaction():
        db.execute(
            """INSERT INTO marketplace_policies
               (world_id,policy_id,max_quantity,max_price,
                min_duration_seconds,max_duration_seconds,enabled)
               VALUES(%s,%s,%s,%s,%s,%s,%s)""",
            (world_id,policy_id,max_quantity,max_price,
             min_duration_seconds,max_duration_seconds,enabled),
        )


def _active_market(db: psycopg.Connection, city_id: UUID) -> dict | None:
    effects=resolve_city_effects(db,city_id)
    return effects if any(
        x["building_code"]=="marketplace" and x["active"]
        for x in effects["buildings"]
    ) else None


def _current_stock(db: psycopg.Connection, *, city_id: UUID, resource: str,
                   effects: dict, lock: bool = True) -> tuple[int,int]:
    row=db.execute(
        """SELECT amount,capacity FROM city_stocks
           WHERE city_id=%s AND resource=%s""" + (" FOR UPDATE" if lock else ""),
        (city_id,resource),
    ).fetchone()
    if not row:
        raise MarketplaceConflict("City resource stock is incomplete")
    amount,base_cap=row
    cap=BIGINT if base_cap is None else int(base_cap)+int(
        effects["capacity_bonus"].get(resource,0))
    if cap>BIGINT:
        raise MarketplaceConflict("Storage capacity cannot be represented")
    return int(amount),cap


def _locked_stocks(db: psycopg.Connection, city_id: UUID) -> dict:
    """Lock all city stocks lexically: mirrors economy worker's row order."""
    return {resource:(int(amount),capacity) for resource,amount,capacity in db.execute(
        """SELECT resource,amount,capacity FROM city_stocks
           WHERE city_id=%s ORDER BY resource FOR UPDATE""",(city_id,),
    ).fetchall()}


def _stock_balance(stocks: dict, resource: str, effects: dict) -> tuple[int,int]:
    if resource not in stocks:
        raise MarketplaceConflict("City stock row missing")
    balance,base_cap=stocks[resource]
    maximum=(BIGINT if base_cap is None else
             int(base_cap)+int(effects["capacity_bonus"].get(resource,0)))
    if maximum>BIGINT:
        raise MarketplaceConflict("Storage capacity exceeds signed bigint")
    return balance,maximum


def _offer(db: psycopg.Connection, offer_id: UUID, *, lock: bool = False) -> tuple:
    row=db.execute(
        """SELECT offer_id,world_id,seller_city_id,seller_account_id,policy_id,
                  resource,quantity,price_resource,price_amount,created_at,
                  expires_at,status,buyer_city_id,purchase_order_id,purchased_at,
                  closed_at,escrow_claimed_at
           FROM marketplace_offers WHERE offer_id=%s""" + (" FOR UPDATE" if lock else ""),
        (offer_id,),
    ).fetchone()
    if row is None:
        raise MarketplaceNotFound
    return row


def _offer_view(row: tuple, *, now, own: bool = False) -> dict:
    (offer_id,_world,seller_city,seller,policy,resource,quantity,price_resource,
     price_amount,created,expires,status,buyer_city,purchase_id,purchased,
     closed,claimed)=row
    stage="expired" if status=="active" and expires<=now else status
    result={
        "offer_id":str(offer_id),"resource":resource,"quantity":int(quantity),
        "price_resource":price_resource,"price_amount":int(price_amount),
        "policy_id":policy,"status":stage,
        "created_at":created.isoformat(),"expires_at":expires.isoformat(),
    }
    if own:
        result.update({
            "escrow_claimed":claimed is not None,
            "can_withdraw":(stage in ("active","cancelled","expired") and claimed is None),
            "closed_at":closed.isoformat() if closed else None,
        })
    return result


def offers_for_city(db: psycopg.Connection, *, owner: UUID, city_id: UUID) -> dict:
    world_id=_city_world(db,owner=owner,city_id=city_id)
    active=_active_market(db,city_id) is not None
    policy=_policy(db,world_id) if active else None
    now=db.execute("SELECT clock_timestamp()").fetchone()[0]
    offers=db.execute(
        """SELECT offer_id,world_id,seller_city_id,seller_account_id,policy_id,
                  resource,quantity,price_resource,price_amount,created_at,
                  expires_at,status,buyer_city_id,purchase_order_id,purchased_at,
                  closed_at,escrow_claimed_at
           FROM marketplace_offers
           WHERE world_id=%s AND seller_account_id<>%s
             AND status='active' AND expires_at>%s
           ORDER BY created_at DESC,offer_id DESC LIMIT 50""",
        (world_id,owner,now),
    ).fetchall() if policy else []
    mine=db.execute(
        """SELECT offer_id,world_id,seller_city_id,seller_account_id,policy_id,
                  resource,quantity,price_resource,price_amount,created_at,
                  expires_at,status,buyer_city_id,purchase_order_id,purchased_at,
                  closed_at,escrow_claimed_at
           FROM marketplace_offers
           WHERE seller_city_id=%s AND seller_account_id=%s
           ORDER BY created_at DESC,offer_id DESC LIMIT 24""",
        (city_id,owner),
    ).fetchall()
    return {
        "city_id":str(city_id),"marketplace_unlocked":bool(policy),
        "marketplace_policy":policy,"historically_certified":False,
        "delivery_mode":"instant_lab" if policy else None,
        "offers":[_offer_view(row,now=now) for row in offers],
        "my_offers":[_offer_view(row,now=now,own=True) for row in mine],
    }


def publish_offer(db: psycopg.Connection, *, owner: UUID, city_id: UUID,
                  order_id: UUID, resource: str, quantity: int,
                  price_resource: str, price_amount: int,
                  duration_seconds: int) -> dict:
    intent={"resource":resource,"quantity":quantity,
            "price_resource":price_resource,"price_amount":price_amount,
            "duration_seconds":duration_seconds}
    with db.transaction():
        world_id=_city_world(db,owner=owner,city_id=city_id)
        _lock_intent(db,order_id)
        replay=_replay(db,order_id=order_id,actor=owner,city_id=city_id,
                       action="publish",intent=intent)
        if replay:
            return replay
        if (not _valid_pair(resource,price_resource) or
            not _positive(quantity) or not _positive(price_amount) or
            type(duration_seconds) is not int or
            not _VALID_DURATION[0]<=duration_seconds<=_VALID_DURATION[1]):
            raise MarketplaceConflict("Invalid lot or fixed price")
        _lock_cities(db,[city_id])
        if _active_market(db,city_id) is None:
            raise MarketplaceConflict("An operational marketplace is required")
        policy=_policy(db,world_id,lock=True)
        if (policy is None or quantity>policy["max_quantity"] or
            price_amount>policy["max_price"] or
            not policy["min_duration_seconds"]<=duration_seconds<=policy["max_duration_seconds"]):
            raise MarketplaceConflict("No authorized offer policy for this amount/duration")
        effects=resolve_city_effects(db,city_id)
        available,_=_current_stock(db,city_id=city_id,resource=resource,effects=effects)
        if available<quantity:
            raise MarketplaceConflict("Insufficient resources for escrow")
        if db.execute(
            """UPDATE city_stocks SET amount=amount-%s
               WHERE city_id=%s AND resource=%s AND amount>=%s""",
            (quantity,city_id,resource,quantity),
        ).rowcount!=1:
            raise MarketplaceConflict("Escrow reservation lost a stock race")
        at=db.execute("SELECT clock_timestamp()").fetchone()[0]
        due=at+timedelta(seconds=duration_seconds)
        offer_id=uuid4()
        db.execute(
            """INSERT INTO marketplace_offers(
               offer_id,world_id,seller_city_id,seller_account_id,policy_id,
               resource,quantity,price_resource,price_amount,created_at,expires_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (offer_id,world_id,city_id,owner,policy["policy_id"],
             resource,quantity,price_resource,price_amount,at,due),
        )
        receipt={
            "offer_id":str(offer_id),"status":"active",
            "resource":resource,"quantity":quantity,
            "price_resource":price_resource,"price_amount":price_amount,
            "policy_id":policy["policy_id"],
            "expires_at":due.isoformat(),"completed_at":at.isoformat(),
            "escrow_reserved":True,"historically_certified":False,
        }
        return _save(db,order_id=order_id,offer_id=offer_id,actor=owner,
                     city_id=city_id,action="publish",intent=intent,
                     receipt=receipt,at=at)


def buy_offer(db: psycopg.Connection, *, owner: UUID, city_id: UUID,
              offer_id: UUID, order_id: UUID, expected_resource: str,
              expected_quantity: int, expected_price_resource: str,
              expected_price_amount: int) -> dict:
    intent={"offer_id":str(offer_id),"resource":expected_resource,
            "quantity":expected_quantity,"price_resource":expected_price_resource,
            "price_amount":expected_price_amount}
    with db.transaction():
        world_id=_city_world(db,owner=owner,city_id=city_id)
        _lock_intent(db,order_id)
        replay=_replay(db,order_id=order_id,actor=owner,city_id=city_id,
                       action="buy",intent=intent)
        if replay:
            return replay
        if not _valid_pair(expected_resource,expected_price_resource) or (
            not _positive(expected_quantity) or not _positive(expected_price_amount)):
            raise MarketplaceConflict("Invalid offer confirmation")
        offer=_offer(db,offer_id,lock=True)
        if offer[1]!=world_id:
            raise MarketplaceNotFound
        if offer[3]==owner:
            raise MarketplaceConflict("You cannot buy your own lot")
        _lock_cities(db,[city_id,offer[2]])
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        if offer[11]!="active" or offer[10]<=now:
            raise MarketplaceConflict("Offer is no longer available")
        if (offer[5],offer[6],offer[7],offer[8])!=(
            expected_resource,expected_quantity,
            expected_price_resource,expected_price_amount):
            raise MarketplaceConflict("Offer conditions changed; refresh the offer")
        buyer_effects=_active_market(db,city_id)
        seller_effects=_active_market(db,offer[2])
        if buyer_effects is None or seller_effects is None:
            raise MarketplaceConflict("Both marketplaces must be operational")
        policy=_policy(db,world_id,lock=True)
        if policy is None or offer[4]!=policy["policy_id"]:
            raise MarketplaceConflict("Offer policy has been withdrawn")
        # Economy worker locks stock rows ordered by resource. Lock all stocks
        # using the same order, across cities, to prevent a two-resource deadlock.
        city_stocks={}
        for cid in sorted({city_id,offer[2]},key=str):
            city_stocks[cid]=_locked_stocks(db,cid)
        price_balance,_=_stock_balance(city_stocks[city_id],offer[7],buyer_effects)
        goods_balance,goods_cap=_stock_balance(city_stocks[city_id],offer[5],buyer_effects)
        proceeds_balance,proceeds_cap=_stock_balance(city_stocks[offer[2]],offer[7],seller_effects)
        if (price_balance<offer[8] or goods_balance+offer[6]>goods_cap or
            proceeds_balance+offer[8]>proceeds_cap or
            goods_balance+offer[6]>BIGINT or proceeds_balance+offer[8]>BIGINT):
            raise MarketplaceConflict("Settlement unavailable: funds or storage")
        if db.execute(
            """UPDATE city_stocks SET amount=amount-%s
               WHERE city_id=%s AND resource=%s AND amount>=%s""",
            (offer[8],city_id,offer[7],offer[8]),
        ).rowcount!=1:
            raise MarketplaceConflict("Buyer stock changed")
        if db.execute(
            """UPDATE city_stocks SET amount=amount+%s
               WHERE city_id=%s AND resource=%s""",
            (offer[6],city_id,offer[5]),
        ).rowcount!=1:
            raise MarketplaceConflict("Buyer lot credit failed")
        if db.execute(
            """UPDATE city_stocks SET amount=amount+%s
               WHERE city_id=%s AND resource=%s""",
            (offer[8],offer[2],offer[7]),
        ).rowcount!=1:
            raise MarketplaceConflict("Seller price credit failed")
        if db.execute(
            """UPDATE marketplace_offers
               SET status='sold',buyer_city_id=%s,
                   purchase_order_id=%s,purchased_at=%s
               WHERE offer_id=%s AND status='active'""",
            (city_id,order_id,now,offer_id),
        ).rowcount!=1:
            raise MarketplaceConflict("Offer already settled")
        receipt={
            "offer_id":str(offer_id),"status":"sold",
            "resource":offer[5],"quantity":offer[6],
            "price_resource":offer[7],"price_amount":offer[8],
            "completed_at":now.isoformat(),
            "delivery_mode":"instant_lab","historically_certified":False,
        }
        return _save(db,order_id=order_id,offer_id=offer_id,actor=owner,
                     city_id=city_id,action="buy",intent=intent,
                     receipt=receipt,at=now)


def withdraw_offer(db: psycopg.Connection, *, owner: UUID, city_id: UUID,
                   offer_id: UUID, order_id: UUID) -> dict:
    """Cancel/close a lot; preserve escrow if destination storage is full.

    A subsequent withdrawal command can claim it later, without duplicating it.
    The offer becomes unbuyable immediately even when recovery must be deferred.
    """
    intent={"offer_id":str(offer_id)}
    with db.transaction():
        world_id=_city_world(db,owner=owner,city_id=city_id)
        _lock_intent(db,order_id)
        replay=_replay(db,order_id=order_id,actor=owner,city_id=city_id,
                       action="withdraw",intent=intent)
        if replay:
            return replay
        offer=_offer(db,offer_id,lock=True)
        if offer[1]!=world_id or offer[2]!=city_id or offer[3]!=owner:
            raise MarketplaceNotFound
        _lock_cities(db,[city_id])
        if offer[11]=="sold" or offer[16] is not None:
            raise MarketplaceConflict("Lot already sold or recovered")
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        status=("expired" if offer[11]=="active" and offer[10]<=now
                else "cancelled" if offer[11]=="active" else offer[11])
        if status not in ("cancelled","expired"):
            raise MarketplaceConflict("Offer cannot be withdrawn")
        effects=resolve_city_effects(db,city_id)
        balance,cap=_current_stock(
            db,city_id=city_id,resource=offer[5],effects=effects)
        recovered=(offer[6]<=BIGINT-balance and balance+offer[6]<=cap)
        if recovered:
            if db.execute(
                """UPDATE city_stocks SET amount=amount+%s
                   WHERE city_id=%s AND resource=%s""",
                (offer[6],city_id,offer[5]),
            ).rowcount!=1:
                raise MarketplaceConflict("Recovery failed")
        if db.execute(
            """UPDATE marketplace_offers
               SET status=%s,closed_at=COALESCE(closed_at,%s),
                   escrow_claimed_at=CASE WHEN %s THEN %s ELSE escrow_claimed_at END
               WHERE offer_id=%s AND status<>'sold' AND escrow_claimed_at IS NULL""",
            (status,now,recovered,now,offer_id),
        ).rowcount!=1:
            raise MarketplaceConflict("Offer changed while withdrawing")
        receipt={
            "offer_id":str(offer_id),"status":status,
            "escrow_recovered":recovered,
            "pending_quantity":0 if recovered else offer[6],
            "resource":offer[5],"completed_at":now.isoformat(),
            "historically_certified":False,
        }
        return _save(db,order_id=order_id,offer_id=offer_id,actor=owner,
                     city_id=city_id,action="withdraw",intent=intent,
                     receipt=receipt,at=now)
