"""Real PostgreSQL integration tests for atomic, versioned merchant trades."""
from __future__ import annotations

from datetime import datetime
from uuid import uuid4

import psycopg
import pytest

from test_construction_integration import city, headers, client, URL
from mmhk_api.merchant import configure_merchant_rate
from mmhk_api.building_effects import set_building_operational


def setup_market(city, *, built=True):
    with psycopg.connect(URL) as db:
        configure_merchant_rate(
            db,world_id=city["world"],pay_resource="wood",
            receive_resource="ore",policy_id="TEST-TRADER-1",
            numerator=1,denominator=2)
        configure_merchant_rate(
            db,world_id=city["world"],pay_resource="gold",
            receive_resource="wood",policy_id="TEST-TRADER-G",
            numerator=3,denominator=2)
        if built:
            db.execute(
                """INSERT INTO urban_city_buildings
                   (city_id,building_code,level,completed_at)
                   VALUES(%s,'marketplace',1,clock_timestamp())""",
                (city["city"],),
            )


def uri(city):
    return f"/api/v1/me/cities/{city['city']}/market"


def balances(city, *kinds):
    with psycopg.connect(URL) as db:
        return dict(db.execute(
            """SELECT resource,amount FROM city_stocks WHERE city_id=%s
               AND resource = ANY(%s)""",(city["city"],list(kinds)),
        ).fetchall())


def request_for(quote, *, order=None):
    return {
        "order_id":str(order or uuid4()),
        "pay_resource":quote["pay_resource"],
        "receive_resource":quote["receive_resource"],
        "pay_amount":quote["pay_amount"],
        "expected_policy_id":quote["policy_id"],
        "expected_receive_amount":quote["receive_amount"],
    }


def quote_url(city, *, amount=6, pay="wood", receive="ore"):
    return uri(city)+f"/quote?pay_resource={pay}&receive_resource={receive}&pay_amount={amount}"


def test_market_locked_until_marketplace_operational(city):
    setup_market(city,built=False)
    owner=headers(city["username"])
    outsider=headers(city["enemyname"])
    path=uri(city)
    assert client.get(path).status_code==401
    locked=client.get(path,headers=owner)
    assert locked.status_code==200
    assert locked.json()["merchant_unlocked"] is False
    assert locked.json()["auctions_available"] is False
    assert locked.json()["caravans_available"] is False
    assert locked.json()["rates"]==[]
    assert client.get(quote_url(city),headers=owner).status_code==409
    assert client.get(path,headers=outsider).status_code==404
    assert client.get(quote_url(city),headers=outsider).status_code==404
    payload={"order_id":str(uuid4()),"pay_resource":"wood","receive_resource":"ore",
             "pay_amount":6,"expected_receive_amount":3,
             "expected_policy_id":"TEST-TRADER-1"}
    assert client.post(path,headers=owner,json=payload).status_code==409
    assert client.post(path,headers=outsider,json=payload).status_code==404
    assert balances(city,"wood","ore")=={"wood":100,"ore":100}


def test_quote_atomic_trade_and_idempotent_replay(city):
    setup_market(city)
    h=headers(city["username"])
    before=balances(city,"wood","ore")
    quote=client.get(quote_url(city),headers=h)
    assert quote.status_code==200,quote.text
    q=quote.json()
    assert q["receive_amount"]==3
    assert q["policy_id"]=="TEST-TRADER-1"
    assert q["can_execute"] is True
    assert q["expected_pay_balance"]==before["wood"]-6
    assert q["expected_receive_balance"]==before["ore"]+3
    payload=request_for(q)
    first=client.post(uri(city),headers=h,json=payload)
    assert first.status_code==201,first.text
    assert first.json()["replayed"] is False
    assert first.json()["receive_amount"]==3
    after=balances(city,"wood","ore")
    assert after=={"wood":before["wood"]-6,"ore":before["ore"]+3}
    twice=client.post(uri(city),headers=h,json=payload)
    assert twice.status_code==200,twice.text
    assert twice.json()["replayed"] is True
    assert twice.json()["completed_at"]==first.json()["completed_at"]
    assert balances(city,"wood","ore")==after
    changed=client.post(uri(city),headers=h,json={**payload,"pay_amount":8})
    assert changed.status_code==409
    assert balances(city,"wood","ore")==after
    log=client.get(uri(city),headers=h).json()["history"]
    assert len(log)==1
    assert log[0]["order_id"]==payload["order_id"]
    assert log[0]["pay_amount"]==6 and log[0]["receive_amount"]==3
    assert log[0]["policy_id"]=="TEST-TRADER-1"


def test_invalid_rates_stale_quote_and_insufficient_stock_are_rejected(city):
    setup_market(city)
    h=headers(city["username"])
    before=balances(city,"wood","ore")
    for url in [
        quote_url(city,amount=0),
        quote_url(city,amount=-2),
        quote_url(city,amount=1000001),
        quote_url(city,amount=1,pay="wood",receive="wood"),
        quote_url(city,amount=1,pay="gems",receive="ore"),
    ]:
        assert client.get(url,headers=h).status_code in (409,422)
    assert client.get(quote_url(city,amount=1),headers=h).status_code==409
    q=client.get(quote_url(city,amount=6),headers=h).json()
    assert client.post(uri(city),headers=h,json={
        **request_for(q),"expected_policy_id":"TEST-OLD-QUOTE",
    }).status_code==409
    assert client.post(uri(city),headers=h,json={
        **request_for(q),"expected_receive_amount":4,
    }).status_code==409
    assert client.post(uri(city),headers=h,json={
        **request_for(q),"pay_amount":0,
    }).status_code==422
    with psycopg.connect(URL) as db:
        db.execute("""UPDATE city_stocks SET amount=2
                   WHERE city_id=%s AND resource='wood'""",(city["city"],))
    poor=client.get(quote_url(city,amount=6),headers=h).json()
    assert poor["affordable"] is False
    assert poor["can_execute"] is False
    assert client.post(uri(city),headers=h,json=request_for(poor)).status_code==409
    assert balances(city,"wood","ore")=={"wood":2,"ore":before["ore"]}


def test_destination_capacity_market_suspension_and_rate_revision(city):
    setup_market(city)
    h=headers(city["username"])
    path=uri(city)
    q=client.get(quote_url(city),headers=h).json()
    with psycopg.connect(URL) as db:
        db.execute(
            """UPDATE city_stocks SET capacity=101
               WHERE city_id=%s AND resource='ore'""",(city["city"],),
        )
    no_space=client.get(quote_url(city),headers=h).json()
    assert no_space["capacity_sufficient"] is False
    original=balances(city,"wood","ore")
    assert client.post(path,headers=h,json=request_for(q)).status_code==409
    assert balances(city,"wood","ore")==original
    with psycopg.connect(URL) as db:
        db.execute(
            """UPDATE city_stocks SET capacity=1000
               WHERE city_id=%s AND resource='ore'""",(city["city"],),
        )
        # A different rate version requires a new explicit confirmation.
        db.execute("""UPDATE merchant_rate_policies SET enabled=false
                   WHERE world_id=%s AND pay_resource='wood'
                     AND receive_resource='ore'""",(city["world"],))
        configure_merchant_rate(
            db,world_id=city["world"],pay_resource="wood",
            receive_resource="ore",policy_id="TEST-TRADER-2",
            numerator=2,denominator=3)
    assert client.post(path,headers=h,json=request_for(q)).status_code==409
    latest=client.get(quote_url(city),headers=h).json()
    assert latest["receive_amount"]==4
    assert latest["policy_id"]=="TEST-TRADER-2"
    assert client.post(path,headers=h,json=request_for(latest)).status_code==201
    before=balances(city,"wood","ore")
    with psycopg.connect(URL) as db:
        set_building_operational(
            db,city_id=city["city"],building_code="marketplace",enabled=False)
    assert client.get(path,headers=h).json()["merchant_unlocked"] is False
    assert client.post(path,headers=h,json={
        **request_for(latest),"order_id":str(uuid4()),
    }).status_code==409
    assert balances(city,"wood","ore")==before
    assert len(client.get(path,headers=h).json()["history"])==1


def test_quote_read_is_side_effect_free_and_cross_city_state_private(city):
    setup_market(city)
    h=headers(city["username"])
    eh=headers(city["enemyname"])
    before=balances(city,"gold","wood","ore")
    for _ in range(3):
        assert client.get(uri(city),headers=h).status_code==200
        assert client.get(quote_url(city),headers=h).status_code==200
    assert balances(city,"gold","wood","ore")==before
    assert client.get(uri(city),headers=eh).status_code==404
    q=client.get(quote_url(city),headers=h).json()
    assert client.post(uri(city),headers=eh,json=request_for(q)).status_code==404
    assert client.get(uri(city).replace(str(city["city"]),str(city["other"])),
                      headers=h).status_code==404
    assert balances(city,"gold","wood","ore")==before
