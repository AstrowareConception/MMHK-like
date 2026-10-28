"""Real PostgreSQL regression tests: two players, escrow, sale, expiry, replays."""
from __future__ import annotations

import os
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from uuid import uuid4

import psycopg
import pytest

from test_construction_integration import city, client, headers, URL
from mmhk_api.security import create_account
from mmhk_api.marketplace import (
    configure_marketplace_policy, buy_offer, withdraw_offer, MarketplaceConflict,
)

pytestmark=pytest.mark.skipif(not URL,reason="PostgreSQL test URL required")

RESOURCES=("gold","wood","ore","crystal","gems","sulfur","mercury")


@pytest.fixture
def neighbors(city):
    """One real world with three independently owned cities; no shared wallet."""
    world=city["world"]
    seller_city=city["city"]
    other_world_city=city["other"]
    extra_name="auction"+uuid4().hex[:12]
    with psycopg.connect(URL) as db:
        seller=db.execute(
            "SELECT owner_account_id FROM cities WHERE city_id=%s",(seller_city,),
        ).fetchone()[0]
        buyer=db.execute(
            "SELECT owner_account_id FROM cities WHERE city_id=%s",(other_world_city,),
        ).fetchone()[0]
        extra=create_account(db,extra_name,"test-construction-password")
        first_buy_city=uuid4()
        second_buy_city=uuid4()
        for player,cid,x in ((buyer,first_buy_city,9),(extra,second_buy_city,10)):
            db.execute(
                """INSERT INTO world_memberships(world_id,account_id)
                   VALUES(%s,%s)""",(world,player),
            )
            db.execute(
                """INSERT INTO cities(city_id,world_id,owner_account_id,name,x,y,first_city)
                   VALUES(%s,%s,%s,%s,%s,4,false)""",
                (cid,world,player,"Cité témoin",x),
            )
            for resource in RESOURCES:
                db.execute(
                    """INSERT INTO city_stocks(city_id,resource,amount,capacity)
                       VALUES(%s,%s,%s,500)""",
                    (cid,resource,250 if resource=="gold" else 20),
                )
        for cid in (seller_city,first_buy_city,second_buy_city):
            for building in ("village_hall","marketplace"):
                db.execute(
                    """INSERT INTO urban_city_buildings(
                       city_id,building_code,level,completed_at)
                       VALUES(%s,%s,1,clock_timestamp())""",(cid,building),
                )
        configure_marketplace_policy(
            db,world_id=world,policy_id="TEST-FIXED-PRICE-V1",
            max_quantity=100,max_price=500,
            min_duration_seconds=60,max_duration_seconds=3600,
        )
    yield {
        "seller_city":seller_city,"seller":seller,
        "buyer_city":first_buy_city,"buyer":buyer,
        "other_buyer_city":second_buy_city,"other_buyer":extra,
        "other_world_city":other_world_city,"world":world,
        "seller_name":city["username"],"buyer_name":city["enemyname"],
        "other_buyer_name":extra_name,
    }
    with psycopg.connect(URL) as db:
        # Real settlement history references buyer_city_id. The fixture must
        # remove its isolated market offers before dropping either buyer city.
        db.execute("DELETE FROM marketplace_offers WHERE seller_city_id=%s",
                   (seller_city,))
        db.execute("DELETE FROM cities WHERE city_id IN (%s,%s)",
                   (first_buy_city,second_buy_city))
        db.execute(
            """DELETE FROM world_memberships WHERE world_id=%s
               AND account_id IN (%s,%s)""",(world,buyer,extra),
        )
        db.execute("DELETE FROM accounts WHERE account_id=%s",(extra,))


def path(city_id):
    return f"/api/v1/me/cities/{city_id}/market/offers"


def stock(city_id, resource):
    with psycopg.connect(URL) as db:
        return db.execute(
            """SELECT amount FROM city_stocks WHERE city_id=%s AND resource=%s""",
            (city_id,resource),
        ).fetchone()[0]


def publish(data, h, *, order_id=None, quantity=10, price=25, duration=600):
    payload={"order_id":str(order_id or uuid4()),"resource":"wood",
             "quantity":quantity,"price_resource":"gold",
             "price_amount":price,"duration_seconds":duration}
    return client.post(path(data["seller_city"]),headers=h,json=payload),payload


def buy_payload(offer, *, order_id=None):
    return {
        "order_id":str(order_id or uuid4()),
        "expected_resource":offer["resource"],
        "expected_quantity":offer["quantity"],
        "expected_price_resource":offer["price_resource"],
        "expected_price_amount":offer["price_amount"],
    }


def test_owner_scoping_policy_and_historic_features_disabled(city):
    owner=headers(city["username"])
    stranger=headers(city["enemyname"])
    location=path(city["city"])
    assert client.get(location).status_code==401
    assert client.get(location,headers=stranger).status_code==404
    empty=client.get(location,headers=owner)
    assert empty.status_code==200,empty.text
    assert empty.json()["marketplace_unlocked"] is False
    assert empty.json()["offers"]==[]
    p={"order_id":str(uuid4()),"resource":"wood","quantity":3,
       "price_resource":"gold","price_amount":2,"duration_seconds":600}
    assert client.post(location,headers=owner,json=p).status_code==409
    assert client.post(location,headers=stranger,json=p).status_code==404


def test_publish_debits_once_public_list_anonymous_and_private_world(neighbors):
    s=headers(neighbors["seller_name"])
    b=headers(neighbors["buyer_name"])
    city_id=neighbors["seller_city"]
    beginning=stock(city_id,"wood")
    order=uuid4()
    first,payload=publish(neighbors,s,order_id=order)
    assert first.status_code==201,first.text
    receipt=first.json()
    assert receipt["status"]=="active" and receipt["escrow_reserved"] is True
    assert stock(city_id,"wood")==beginning-10
    replay=client.post(path(city_id),headers=s,json=payload)
    assert replay.status_code==200 and replay.json()["replayed"] is True
    assert replay.json()["offer_id"]==receipt["offer_id"]
    assert stock(city_id,"wood")==beginning-10
    stale=client.post(path(city_id),headers=s,json={**payload,"quantity":11})
    assert stale.status_code==409
    found=client.get(path(neighbors["buyer_city"]),headers=b)
    assert found.status_code==200
    offers=found.json()["offers"]
    assert len(offers)==1
    assert offers[0]["quantity"]==10 and offers[0]["price_amount"]==25
    assert "seller_city_id" not in offers[0] and "seller_account_id" not in offers[0]
    assert "world_id" not in offers[0] and "buyer_city_id" not in offers[0]
    own=client.get(path(city_id),headers=s).json()
    assert own["offers"]==[]
    assert own["my_offers"][0]["offer_id"]==receipt["offer_id"]
    assert own["my_offers"][0]["can_withdraw"] is True
    foreign=path(neighbors["other_world_city"])
    assert client.get(foreign,headers=s).status_code==404
    assert client.get(foreign,headers=b).status_code==200
    assert client.get(foreign,headers=b).json()["offers"]==[]


def test_atomic_sale_snapshot_replay_and_no_self_purchase(neighbors):
    s=headers(neighbors["seller_name"])
    b=headers(neighbors["buyer_name"])
    receipt,_=publish(neighbors,s)
    offer=client.get(path(neighbors["buyer_city"]),headers=b).json()["offers"][0]
    oid=offer["offer_id"]
    assert client.post(path(neighbors["seller_city"])+f"/{oid}/buy",
                       headers=s,json=buy_payload(offer)).status_code==409
    before=(stock(neighbors["buyer_city"],"gold"),
            stock(neighbors["buyer_city"],"wood"),
            stock(neighbors["seller_city"],"gold"))
    payload=buy_payload(offer)
    bought=client.post(path(neighbors["buyer_city"])+f"/{oid}/buy",
                       headers=b,json=payload)
    assert bought.status_code==201,bought.text
    assert bought.json()["status"]=="sold"
    assert bought.json()["delivery_mode"]=="instant_lab"
    after=(stock(neighbors["buyer_city"],"gold"),
           stock(neighbors["buyer_city"],"wood"),
           stock(neighbors["seller_city"],"gold"))
    assert after==(before[0]-25,before[1]+10,before[2]+25)
    replay=client.post(path(neighbors["buyer_city"])+f"/{oid}/buy",
                       headers=b,json=payload)
    assert replay.status_code==200
    assert replay.json()["replayed"] is True
    assert replay.json()["completed_at"]==bought.json()["completed_at"]
    assert after==(stock(neighbors["buyer_city"],"gold"),
                   stock(neighbors["buyer_city"],"wood"),
                   stock(neighbors["seller_city"],"gold"))
    changed=client.post(path(neighbors["buyer_city"])+f"/{oid}/buy",
                        headers=b,json={**payload,"expected_price_amount":26})
    assert changed.status_code==409
    second=client.post(path(neighbors["other_buyer_city"])+f"/{oid}/buy",
                       headers=headers(neighbors["other_buyer_name"]),
                       json=buy_payload(offer))
    assert second.status_code==409
    assert client.post(path(neighbors["seller_city"])+f"/{oid}/withdraw",
                       headers=s,json={"order_id":str(uuid4())}).status_code==409
    mine=client.get(path(neighbors["seller_city"]),headers=s).json()["my_offers"]
    assert mine[0]["status"]=="sold" and mine[0]["can_withdraw"] is False


def test_invalid_lot_and_stale_terms_do_not_transfer(neighbors):
    s=headers(neighbors["seller_name"])
    b=headers(neighbors["buyer_name"])
    origin=stock(neighbors["seller_city"],"wood")
    for change in [
        {"resource":"gold","price_resource":"gold"},
        {"quantity":0},{"quantity":101},{"price_amount":501},
        {"duration_seconds":59},{"duration_seconds":3601},
    ]:
        body={"order_id":str(uuid4()),"resource":"wood","quantity":10,
              "price_resource":"gold","price_amount":25,"duration_seconds":600,**change}
        assert client.post(path(neighbors["seller_city"]),headers=s,json=body).status_code in (409,422)
    assert stock(neighbors["seller_city"],"wood")==origin
    offer,_=publish(neighbors,s)
    listed=client.get(path(neighbors["buyer_city"]),headers=b).json()["offers"][0]
    assert client.post(path(neighbors["buyer_city"])+f"/{listed['offer_id']}/buy",
                       headers=b,json=buy_payload({**listed,"price_amount":17})).status_code==409
    assert client.post(path(neighbors["other_world_city"])+f"/{listed['offer_id']}/buy",
                       headers=b,json=buy_payload(listed)).status_code==404
    assert stock(neighbors["seller_city"],"wood")==origin-10


def test_cancel_reserves_refund_if_storage_full_and_claim_later(neighbors):
    s=headers(neighbors["seller_name"])
    city_id=neighbors["seller_city"]
    original=stock(city_id,"wood")
    created,_=publish(neighbors,s)
    offer_id=created.json()["offer_id"]
    # Seller has refilled the stock while the lot was in escrow.
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_stocks SET capacity=%s WHERE city_id=%s AND resource='wood'",
                   (original-10,city_id))
    cancel={"order_id":str(uuid4())}
    first=client.post(path(city_id)+f"/{offer_id}/withdraw",headers=s,json=cancel)
    assert first.status_code==201,first.text
    assert first.json()["escrow_recovered"] is False
    assert first.json()["pending_quantity"]==10
    assert stock(city_id,"wood")==original-10
    assert client.post(path(city_id)+f"/{offer_id}/withdraw",
                       headers=s,json=cancel).json()["replayed"] is True
    assert client.get(path(city_id),headers=s).json()["my_offers"][0]["status"]=="cancelled"
    assert client.get(path(city_id),headers=s).json()["my_offers"][0]["can_withdraw"] is True
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_stocks SET capacity=%s WHERE city_id=%s AND resource='wood'",
                   (original,city_id))
    recovered=client.post(path(city_id)+f"/{offer_id}/withdraw",
                          headers=s,json={"order_id":str(uuid4())})
    assert recovered.status_code==201,recovered.text
    assert recovered.json()["escrow_recovered"] is True
    assert recovered.json()["pending_quantity"]==0
    assert stock(city_id,"wood")==original
    assert client.post(path(city_id)+f"/{offer_id}/withdraw",
                       headers=s,json={"order_id":str(uuid4())}).status_code==409
    assert client.get(path(city_id),headers=s).json()["my_offers"][0]["escrow_claimed"] is True


def test_expired_offer_is_unbuyable_and_reclaimable(neighbors):
    s=headers(neighbors["seller_name"])
    b=headers(neighbors["buyer_name"])
    original=stock(neighbors["seller_city"],"wood")
    created,_=publish(neighbors,s)
    offer_id=created.json()["offer_id"]
    # Operator-controlled time fixture: retain DB check expires_at > created_at.
    with psycopg.connect(URL) as db:
        db.execute(
            """UPDATE marketplace_offers
               SET created_at=clock_timestamp()-interval '2 day',
                   expires_at=clock_timestamp()-interval '1 day'
               WHERE offer_id=%s""",(offer_id,),
        )
    assert client.get(path(neighbors["buyer_city"]),headers=b).json()["offers"]==[]
    own=client.get(path(neighbors["seller_city"]),headers=s).json()["my_offers"]
    assert own[0]["status"]=="expired"
    assert client.post(
        path(neighbors["buyer_city"])+f"/{offer_id}/buy",headers=b,
        json=buy_payload(own[0]),
    ).status_code==409
    claimed=client.post(path(neighbors["seller_city"])+f"/{offer_id}/withdraw",
                        headers=s,json={"order_id":str(uuid4())})
    assert claimed.status_code==201
    assert claimed.json()["status"]=="expired"
    assert claimed.json()["escrow_recovered"] is True
    assert stock(neighbors["seller_city"],"wood")==original


def test_cross_city_storage_and_building_suspension_block_sale(neighbors):
    s=headers(neighbors["seller_name"])
    b=headers(neighbors["buyer_name"])
    created,_=publish(neighbors,s)
    oid=created.json()["offer_id"]
    listed=client.get(path(neighbors["buyer_city"]),headers=b).json()["offers"][0]
    before_buyer=stock(neighbors["buyer_city"],"gold")
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_stocks SET capacity=20 WHERE city_id=%s AND resource='wood'",
                   (neighbors["buyer_city"],))
    blocked=client.post(path(neighbors["buyer_city"])+f"/{oid}/buy",
                        headers=b,json=buy_payload(listed))
    assert blocked.status_code==409
    assert stock(neighbors["buyer_city"],"gold")==before_buyer
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_stocks SET capacity=500 WHERE city_id=%s AND resource='wood'",
                   (neighbors["buyer_city"],))
        db.execute(
            """UPDATE urban_city_buildings SET operator_disabled=true
               WHERE city_id=%s AND building_code='marketplace'""",
            (neighbors["seller_city"],),
        )
    assert client.post(path(neighbors["buyer_city"])+f"/{oid}/buy",
                       headers=b,json=buy_payload(listed)).status_code==409
    # Seller must be able to recover escrow even with a suspended market.
    withdraw=client.post(path(neighbors["seller_city"])+f"/{oid}/withdraw",
                         headers=s,json={"order_id":str(uuid4())})
    assert withdraw.status_code==201
    assert withdraw.json()["escrow_recovered"] is True


def test_competing_buyers_exactly_one_wins(neighbors):
    s=headers(neighbors["seller_name"])
    created,_=publish(neighbors,s)
    offer_id=created.json()["offer_id"]
    buyer_cities=[(neighbors["buyer"],neighbors["buyer_city"]),
                  (neighbors["other_buyer"],neighbors["other_buyer_city"])]
    gate=Barrier(2)
    def race(actor,actor_city):
        with psycopg.connect(URL) as db:
            gate.wait(timeout=10)
            try:
                result=buy_offer(db,owner=actor,city_id=actor_city,
                    offer_id=__import__("uuid").UUID(offer_id),order_id=uuid4(),
                    expected_resource="wood",expected_quantity=10,
                    expected_price_resource="gold",expected_price_amount=25)
                return result["status"]
            except MarketplaceConflict:
                return "rejected"
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures=[pool.submit(race,*args) for args in buyer_cities]
        outcomes=[future.result(timeout=30) for future in futures]
    assert sorted(outcomes)==["rejected","sold"]
    # Only one price is transferred. Every unit is either in a player stock or
    # in the (already settled) offer, never duplicated.
    assert stock(neighbors["seller_city"],"gold")==225
    buyer_gold=[stock(cid,"gold") for _,cid in buyer_cities]
    assert sorted(buyer_gold)==[225,250]
    buyer_wood=[stock(cid,"wood") for _,cid in buyer_cities]
    assert sorted(buyer_wood)==[20,30]
    assert len(client.get(path(neighbors["seller_city"]),
                          headers=s).json()["my_offers"])==1



def test_purchase_and_withdrawal_race_never_settle_the_same_escrow_twice(neighbors):
    """US-ECH-008 CA03: seller cancellation vs last-moment purchase."""
    created,_=publish(neighbors,headers(neighbors["seller_name"]))
    offer_id=__import__("uuid").UUID(created.json()["offer_id"])
    first_order=uuid4()
    second_order=uuid4()
    gate=Barrier(2)
    def try_buy():
        with psycopg.connect(URL) as db:
            gate.wait(timeout=10)
            try:
                return buy_offer(db,owner=neighbors["buyer"],
                    city_id=neighbors["buyer_city"],offer_id=offer_id,
                    order_id=first_order,expected_resource="wood",
                    expected_quantity=10,expected_price_resource="gold",
                    expected_price_amount=25)["status"]
            except MarketplaceConflict:
                return "blocked"
    def try_withdraw():
        with psycopg.connect(URL) as db:
            gate.wait(timeout=10)
            try:
                return withdraw_offer(db,owner=neighbors["seller"],
                    city_id=neighbors["seller_city"],offer_id=offer_id,
                    order_id=second_order)["status"]
            except MarketplaceConflict:
                return "blocked"
    with ThreadPoolExecutor(max_workers=2) as pool:
        a=pool.submit(try_buy)
        b=pool.submit(try_withdraw)
        result=[a.result(timeout=30),b.result(timeout=30)]
    assert "blocked" in result
    assert ("sold" in result) != ("cancelled" in result)
    seller_goods=stock(neighbors["seller_city"],"wood")
    seller_gold=stock(neighbors["seller_city"],"gold")
    buyer_goods=stock(neighbors["buyer_city"],"wood")
    buyer_gold=stock(neighbors["buyer_city"],"gold")
    if "sold" in result:
        assert (seller_goods,seller_gold,buyer_goods,buyer_gold)==(90,225,30,225)
    else:
        assert (seller_goods,seller_gold,buyer_goods,buyer_gold)==(100,200,20,250)
