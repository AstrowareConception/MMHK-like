"""Versioned, owner-scoped instant merchant exchange in a PostgreSQL city.

US-ECH-001/002/003. Every rate is an insert-only *operator experiment*, not
a verified MMHK S2 exchange formula. All debit/credit and receipt writes are
atomic. No auction, caravan, arbitrary gold fee, or speculative storage rule.
"""
from __future__ import annotations

from uuid import UUID

import psycopg

from .building_effects import resolve_city_effects
from .worlds import RESOURCE_NAMES

BIGINT = 2**63 - 1
MAX_TRADE = 1_000_000
MAX_RATIO = 1_000_000


class MerchantNotFound(Exception):
    """Unauthorized and missing cities are indistinguishable."""


class MerchantConflict(Exception):
    """State, rate, or stock changed since the last quote."""


def _city_world(db: psycopg.Connection, *, owner: UUID, city_id: UUID,
                lock: bool = False) -> str:
    row = db.execute(
        """SELECT c.world_id FROM cities c
           JOIN world_memberships m ON m.world_id=c.world_id AND m.account_id=%s
           WHERE c.city_id=%s AND c.owner_account_id=%s""" +
        (" FOR UPDATE OF c" if lock else ""),
        (owner, city_id, owner),
    ).fetchone()
    if row is None:
        raise MerchantNotFound
    return row[0]


def _market_active(db: psycopg.Connection, *, city_id: UUID) -> tuple[bool, dict]:
    effects = resolve_city_effects(db, city_id)
    active = any(b["building_code"] == "marketplace" and b["active"]
                 for b in effects["buildings"])
    return active, effects


def _validate_trade(*, pay_resource: str, receive_resource: str, pay_amount: int) -> None:
    if (pay_resource not in RESOURCE_NAMES or
        receive_resource not in RESOURCE_NAMES or
        pay_resource == receive_resource or
        type(pay_amount) is not int or not 1 <= pay_amount <= MAX_TRADE):
        raise MerchantConflict("Invalid merchant pair or quantity")


def configure_merchant_rate(db: psycopg.Connection, *, world_id: str,
                            pay_resource: str, receive_resource: str,
                            policy_id: str, numerator: int, denominator: int,
                            enabled: bool = True) -> None:
    """Trusted, insert-only configuration; intentionally no player HTTP route.

    To revise a quote, an operator disables the former version and enables a
    NEW policy_id in one transaction. Active pairs are unique at database level.
    """
    if (pay_resource not in RESOURCE_NAMES or
        receive_resource not in RESOURCE_NAMES or pay_resource == receive_resource or
        not isinstance(world_id, str) or not 1 <= len(world_id) <= 64 or
        not isinstance(policy_id, str) or not 3 <= len(policy_id) <= 100 or
        type(enabled) is not bool or
        type(numerator) is not int or not 1 <= numerator <= MAX_RATIO or
        type(denominator) is not int or not 1 <= denominator <= MAX_RATIO):
        raise ValueError("Invalid versioned merchant rate")
    with db.transaction():
        db.execute(
            """INSERT INTO merchant_rate_policies
               (world_id,pay_resource,receive_resource,policy_id,
                numerator,denominator,enabled)
               VALUES(%s,%s,%s,%s,%s,%s,%s)""",
            (world_id,pay_resource,receive_resource,policy_id,
             numerator,denominator,enabled),
        )


def _active_rate(db: psycopg.Connection, *, world_id: str,
                 pay_resource: str, receive_resource: str,
                 lock: bool = False) -> tuple:
    rate = db.execute(
        """SELECT policy_id,numerator,denominator
           FROM merchant_rate_policies
           WHERE world_id=%s AND pay_resource=%s AND receive_resource=%s
             AND enabled""" + (" FOR SHARE" if lock else ""),
        (world_id,pay_resource,receive_resource),
    ).fetchone()
    if rate is None:
        raise MerchantConflict("No active operator-approved rate for this pair")
    return rate


def _amount(num: int, den: int, pay_amount: int) -> int:
    # Exact integer arithmetic, no floating point and no hidden rounding.
    result = pay_amount * num // den
    if not 1 <= result <= BIGINT:
        raise MerchantConflict("Quantity produces no transferable resource")
    return result


def market_for_city(db: psycopg.Connection, *, owner: UUID, city_id: UUID) -> dict:
    world_id = _city_world(db,owner=owner,city_id=city_id)
    unlocked, _ = _market_active(db,city_id=city_id)
    rates = db.execute(
        """SELECT pay_resource,receive_resource,policy_id,numerator,denominator
           FROM merchant_rate_policies WHERE world_id=%s AND enabled
           ORDER BY pay_resource,receive_resource""",
        (world_id,),
    ).fetchall() if unlocked else []
    entries = db.execute(
        """SELECT order_id,pay_resource,receive_resource,pay_amount,
                  receive_amount,rate_policy_id,rate_numerator,
                  rate_denominator,completed_at
           FROM city_merchant_orders WHERE city_id=%s
           ORDER BY completed_at DESC,order_id DESC LIMIT 12""",
        (city_id,),
    ).fetchall()
    return {
        "city_id":str(city_id),
        "merchant_unlocked":unlocked,
        "auctions_available":False,
        "caravans_available":False,
        "rounding_policy":"experimental-floor-received-v1",
        "historically_certified":False,
        "rates":[{
            "pay_resource":a,"receive_resource":b,"policy_id":policy,
            "numerator":int(n),"denominator":int(d)
        } for a,b,policy,n,d in rates],
        "history":[{
            "order_id":str(oid),"pay_resource":pay,"receive_resource":receive,
            "pay_amount":int(paid),"receive_amount":int(gained),
            "policy_id":policy,"numerator":int(num),"denominator":int(den),
            "completed_at":completed.isoformat()
        } for oid,pay,receive,paid,gained,policy,num,den,completed in entries],
    }


def quote_merchant(db: psycopg.Connection, *, owner: UUID, city_id: UUID,
                   pay_resource: str, receive_resource: str, pay_amount: int) -> dict:
    world_id = _city_world(db,owner=owner,city_id=city_id)
    _validate_trade(pay_resource=pay_resource,receive_resource=receive_resource,
                    pay_amount=pay_amount)
    unlocked,effects=_market_active(db,city_id=city_id)
    if not unlocked:
        raise MerchantConflict("An operational marketplace is required")
    policy,num,den=_active_rate(
        db,world_id=world_id,pay_resource=pay_resource,
        receive_resource=receive_resource)
    received=_amount(num,den,pay_amount)
    stocks={r:(int(amount),cap) for r,amount,cap in db.execute(
        """SELECT resource,amount,capacity FROM city_stocks
           WHERE city_id=%s ORDER BY resource""",(city_id,),
    ).fetchall()}
    if pay_resource not in stocks or receive_resource not in stocks:
        raise MerchantConflict("City resource stock is incomplete")
    have=stocks[pay_resource][0]
    target,base_cap=stocks[receive_resource]
    max_stock=(base_cap+int(effects["capacity_bonus"].get(receive_resource,0))
               if base_cap is not None else BIGINT)
    affordable=have>=pay_amount
    capacity_ok=received <= BIGINT-target and target+received<=max_stock
    return {
        "city_id":str(city_id),"pay_resource":pay_resource,
        "receive_resource":receive_resource,"pay_amount":pay_amount,
        "receive_amount":received,"policy_id":policy,
        "numerator":int(num),"denominator":int(den),
        "current_pay_stock":have,"current_receive_stock":target,
        "expected_pay_balance":have-pay_amount if affordable else None,
        "expected_receive_balance":target+received if capacity_ok else None,
        "affordable":affordable,"capacity_sufficient":capacity_ok,
        "can_execute":affordable and capacity_ok,
        "rounding_policy":"experimental-floor-received-v1",
        "historically_certified":False,
    }


def execute_merchant(db: psycopg.Connection, *, owner: UUID, city_id: UUID,
                     order_id: UUID, pay_resource: str, receive_resource: str,
                     pay_amount: int, expected_policy_id: str,
                     expected_receive_amount: int, expected_numerator: int,
                     expected_denominator: int) -> dict:
    _validate_trade(pay_resource=pay_resource,receive_resource=receive_resource,
                    pay_amount=pay_amount)
    if (not isinstance(expected_policy_id,str) or not 3<=len(expected_policy_id)<=100 or
        type(expected_receive_amount) is not int or
        not 1<=expected_receive_amount<=BIGINT or
        type(expected_numerator) is not int or
        not 1<=expected_numerator<=MAX_RATIO or
        type(expected_denominator) is not int or
        not 1<=expected_denominator<=MAX_RATIO):
        raise MerchantConflict("Invalid quote confirmation")
    with db.transaction():
        world_id=_city_world(db,owner=owner,city_id=city_id,lock=True)
        # Replays return the original receipt, even after the rate or the
        # building changed; an altered request using that UUID is rejected.
        past=db.execute(
            """SELECT city_id,actor_account_id,pay_resource,receive_resource,
                      pay_amount,receive_amount,rate_policy_id,rate_numerator,
                      rate_denominator,completed_at
               FROM city_merchant_orders WHERE order_id=%s""",
            (order_id,),
        ).fetchone()
        if past:
            if past[:9] != (city_id,owner,pay_resource,receive_resource,
                           pay_amount,expected_receive_amount,expected_policy_id,
                           expected_numerator,expected_denominator):
                raise MerchantConflict("Order identifier already used")
            return _receipt(order_id,pay_resource,receive_resource,
                            pay_amount,past[5],past[6],past[7],past[8],
                            past[9],replayed=True)
        unlocked,effects=_market_active(db,city_id=city_id)
        if not unlocked:
            raise MerchantConflict("An operational marketplace is required")
        policy,num,den=_active_rate(
            db,world_id=world_id,pay_resource=pay_resource,
            receive_resource=receive_resource,lock=True)
        received=_amount(num,den,pay_amount)
        if (policy!=expected_policy_id or received!=expected_receive_amount or
            num!=expected_numerator or den!=expected_denominator):
            raise MerchantConflict("Merchant quote has changed; request a new quote")
        # City lock serializes with builds and recruitment. Lock both
        # stock rows in a deterministic order for economy-worker compatibility.
        rows=db.execute(
            """SELECT resource,amount,capacity FROM city_stocks
               WHERE city_id=%s AND resource IN (%s,%s)
               ORDER BY resource FOR UPDATE""",
            (city_id,pay_resource,receive_resource),
        ).fetchall()
        stocks={r:(int(amount),cap) for r,amount,cap in rows}
        if len(stocks)!=2:
            raise MerchantConflict("City resource stock is incomplete")
        balance=stocks[pay_resource][0]
        target,base_cap=stocks[receive_resource]
        max_stock=(base_cap+int(effects["capacity_bonus"].get(receive_resource,0))
                   if base_cap is not None else BIGINT)
        if balance<pay_amount:
            raise MerchantConflict("Insufficient resources")
        if received > BIGINT-target or target+received>max_stock:
            raise MerchantConflict("Destination storage cannot accept the exchange")
        debit=db.execute(
            """UPDATE city_stocks SET amount=amount-%s
               WHERE city_id=%s AND resource=%s AND amount>=%s""",
            (pay_amount,city_id,pay_resource,pay_amount),
        )
        if debit.rowcount!=1:
            raise MerchantConflict("Resource balance changed")
        credit=db.execute(
            """UPDATE city_stocks SET amount=amount+%s
               WHERE city_id=%s AND resource=%s""",
            (received,city_id,receive_resource),
        )
        if credit.rowcount!=1:
            raise MerchantConflict("Resource credit failed")
        now=db.execute("SELECT clock_timestamp()").fetchone()[0]
        db.execute(
            """INSERT INTO city_merchant_orders
               (order_id,city_id,actor_account_id,pay_resource,
                receive_resource,pay_amount,receive_amount,rate_policy_id,
                rate_numerator,rate_denominator,completed_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (order_id,city_id,owner,pay_resource,receive_resource,
             pay_amount,received,policy,num,den,now),
        )
        return _receipt(order_id,pay_resource,receive_resource,
                        pay_amount,received,policy,num,den,now,replayed=False)


def _receipt(order_id: UUID, pay_resource: str, receive_resource: str,
             pay_amount: int, received: int, policy: str,
             numerator: int, denominator: int,
             completed, *, replayed: bool) -> dict:
    return {
        "order_id":str(order_id),"pay_resource":pay_resource,
        "receive_resource":receive_resource,"pay_amount":pay_amount,
        "receive_amount":received,"policy_id":policy,
        "numerator":int(numerator),"denominator":int(denominator),
        "completed_at":completed.isoformat(),
        "replayed":replayed,"historically_certified":False,
    }
