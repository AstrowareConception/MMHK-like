"""Real two-city PostgreSQL caravans: owner isolation, mixed load, escrow and worker."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timedelta
from threading import Barrier
from uuid import UUID,uuid4

import psycopg
import pytest

from test_construction_integration import city,client,headers,URL
from mmhk_api.caravans import (
    CaravanConflict,configure_caravan_policy,quote_caravan,
    send_caravan,run_caravan_batch,
)
from mmhk_api.worlds import RESOURCE_NAMES

pytestmark=pytest.mark.skipif(not URL,reason="PostgreSQL test URL required")

WEIGHTS={"gold":1,"wood":2000,"ore":2000,"crystal":5000,
         "gems":5000,"sulfur":5000,"mercury":5000}


@pytest.fixture
def two_cities(city):
    """Second owned and one unowned destination, both in original world."""
    with psycopg.connect(URL) as db:
        owner=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",
                         (city["city"],)).fetchone()[0]
        outsider=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",
                            (city["other"],)).fetchone()[0]
        recipient,foreign=uuid4(),uuid4()
        db.execute(
            "INSERT INTO world_memberships(world_id,account_id) VALUES(%s,%s)",
            (city["world"],outsider),
        )
        for cid,account,name,x in (
            (recipient,owner,"Comptoir témoin",3),
            (foreign,outsider,"Cité étrangère",5),
        ):
            db.execute(
                """INSERT INTO cities(
                   city_id,world_id,owner_account_id,name,x,y,first_city)
                   VALUES(%s,%s,%s,%s,%s,1,false)""",
                (cid,city["world"],account,name,x),
            )
            for key in RESOURCE_NAMES:
                db.execute(
                    """INSERT INTO city_stocks(city_id,resource,amount,capacity)
                       VALUES(%s,%s,0,100)""",(cid,key),
                )
        db.execute(
            """INSERT INTO urban_city_buildings(city_id,building_code,level,completed_at)
               VALUES(%s,'marketplace',1,clock_timestamp())""",
            (city["city"],),
        )
        configure_caravan_policy(
            db,world_id=city["world"],policy_id="LAB-TEST-CONVOYS-1",
            capacity_units=30000,weights=WEIGHTS,seconds_per_tile=15,
        )
    yield {"source":city["city"],"destination":recipient,
           "foreign":foreign,"owner":owner,"outsider":outsider,
           "world":city["world"],"username":city["username"],
           "stranger_name":city["enemyname"]}
    with psycopg.connect(URL) as db:
        db.execute("DELETE FROM caravan_shipments WHERE world_id=%s",
                   (city["world"],))
        db.execute("DELETE FROM cities WHERE city_id IN (%s,%s)",
                   (recipient,foreign))
        db.execute(
            "DELETE FROM world_memberships WHERE world_id=%s AND account_id=%s",
            (city["world"],outsider),
        )


def route(site):
    return f"/api/v1/me/cities/{site['source']}/caravans"


def cargo(**kwargs):
    return {key:kwargs.get(key,0) for key in RESOURCE_NAMES}


def stock(cid,kind):
    with psycopg.connect(URL) as db:
        return db.execute(
            "SELECT amount FROM city_stocks WHERE city_id=%s AND resource=%s",
            (cid,kind),
        ).fetchone()[0]


def plan(site, *, destination=None, **load):
    return {
        "shipment_id":str(uuid4()),
        "destination_city_id":str(destination or site["destination"]),
        "cargo":cargo(**load),
        "expected_policy_id":"LAB-TEST-CONVOYS-1",
    }


def quote(site, h, destination=None, **load):
    return client.get(route(site)+"/quote",headers=h,params={
        "destination_city_id":str(destination or site["destination"]),**load,
    })


def test_private_destinations_read_does_not_change_stocks(two_cities):
    site=two_cities
    h=headers(site["username"])
    rival=headers(site["stranger_name"])
    endpoint=route(site)
    assert client.get(endpoint).status_code==401
    assert client.get(endpoint,headers=rival).status_code==404
    start=stock(site["source"],"wood")
    data=client.get(endpoint,headers=h).json()
    assert data["marketplace_active"] is True
    assert data["transport_policy"]["capacity_units"]==30000
    assert data["repetition_enabled"] is False
    assert data["ally_destinations_enabled"] is False
    assert data["destinations"]==[{
        "city_id":str(site["destination"]),
        "name":"Comptoir témoin","x":3,"y":1,
    }]
    good=quote(site,h,wood=4)
    assert good.status_code==200,good.text
    q=good.json()
    assert q["load_units"]==8000
    assert q["distance_steps"]==2
    assert q["travel_seconds"]==30
    assert q["can_send"] is True
    assert good.headers["cache-control"]=="private, no-store"
    assert stock(site["source"],"wood")==start
    assert quote(site,h,destination=site["foreign"],wood=4).status_code==409
    assert quote(site,rival,wood=4).status_code==404
    assert client.post(endpoint,headers=rival,json=plan(site,wood=4)).status_code==404
    assert stock(site["source"],"wood")==start


def test_mixed_load_caps_quote_expensive_and_invalid_inputs(two_cities):
    site=two_cities;h=headers(site["username"])
    assert quote(site,h,wood=10,crystal=2).json()["load_units"]==30000
    over=quote(site,h,wood=11,crystal=2)
    assert over.status_code==409
    assert quote(site,h,wood=0).status_code==409
    assert quote(site,h,wood=-1).status_code==422
    assert quote(site,h,wood=1000001).status_code==422
    blocked=client.post(route(site),headers=h,json=plan(site,wood=11,crystal=2))
    assert blocked.status_code==409
    assert client.post(route(site),headers=h,json=plan(site)).status_code==409
    invalid=client.post(route(site),headers=h,json={
        **plan(site,wood=3),"cargo":{"gold":1},
    })
    assert invalid.status_code==409
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_stocks SET amount=1 WHERE city_id=%s AND resource='wood'",
                   (site["source"],))
    short=quote(site,h,wood=4).json()
    assert short["can_send"] is False and short["missing_stocks"]=={"wood":3}
    assert client.post(route(site),headers=h,json=plan(site,wood=4)).status_code==409


def test_real_dispatch_and_one_worker_delivery_with_idempotency(two_cities):
    site=two_cities;h=headers(site["username"])
    endpoint=route(site)
    before=stock(site["source"],"wood")
    send=plan(site,wood=4,ore=2)
    shipment=client.post(endpoint,headers=h,json=send)
    assert shipment.status_code==201,shipment.text
    record=shipment.json()
    assert record["status"]=="in_transit" and record["replayed"] is False
    assert record["load_units"]==12000
    assert record["travel_seconds"]==30
    assert stock(site["source"],"wood")==before-4
    assert stock(site["destination"],"wood")==0
    repeat=client.post(endpoint,headers=h,json=send)
    assert repeat.status_code==200 and repeat.json()["replayed"] is True
    assert stock(site["source"],"wood")==before-4
    assert client.post(endpoint,headers=h,json={
        **send,"cargo":cargo(wood=5,ore=2),
    }).status_code==409
    due=datetime.fromisoformat(record["arrival_due_at"])
    with psycopg.connect(URL,autocommit=True) as db:
        assert run_caravan_batch(db,now_at=due-timedelta(microseconds=1))==[]
        done=run_caravan_batch(db,now_at=due)
        assert len(done)==1 and done[0]["phase"]=="delivered"
        assert run_caravan_batch(db,now_at=due)==[]
        events=db.execute(
            "SELECT phase FROM caravan_shipment_events WHERE shipment_id=%s ORDER BY phase",
            (record["shipment_id"],),
        ).fetchall()
        assert events==[("delivered",),("departed",)]
    assert stock(site["destination"],"wood")==4
    assert stock(site["destination"],"ore")==2
    finished=client.get(endpoint,headers=h).json()["shipments"][0]
    assert finished["status"]=="delivered"
    assert finished["completed_at"] is not None
    assert finished["cargo"]==send["cargo"]


def test_destination_full_keeps_escrow_until_retry(two_cities):
    site=two_cities;h=headers(site["username"])
    sent=client.post(route(site),headers=h,json=plan(site,wood=8))
    assert sent.status_code==201,sent.text
    due=datetime.fromisoformat(sent.json()["arrival_due_at"])
    original=stock(site["source"],"wood")
    with psycopg.connect(URL) as db:
        db.execute(
            """UPDATE city_stocks SET capacity=6
               WHERE city_id=%s AND resource='wood'""",
            (site["destination"],),
        )
    with psycopg.connect(URL,autocommit=True) as db:
        stalled=run_caravan_batch(db,now_at=due)
        assert stalled==[{"shipment_id":sent.json()["shipment_id"],"phase":"awaiting_storage"}]
        assert run_caravan_batch(db,now_at=due)==[]
    pending=client.get(route(site),headers=h).json()["shipments"][0]
    assert pending["status"]=="awaiting_storage"
    assert pending["completed_at"] is None
    assert stock(site["destination"],"wood")==0
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_stocks SET capacity=10 WHERE city_id=%s AND resource='wood'",
                   (site["destination"],))
    with psycopg.connect(URL,autocommit=True) as db:
        now=datetime.fromisoformat(pending["next_attempt_at"])
        assert run_caravan_batch(db,now_at=now)[0]["phase"]=="delivered"
        assert run_caravan_batch(db,now_at=now)==[]
    assert stock(site["source"],"wood")==original
    assert stock(site["destination"],"wood")==8
    assert client.get(route(site),headers=h).json()["shipments"][0]["status"]=="delivered"


def test_ownership_change_forces_secure_return_not_enemy_delivery(two_cities):
    site=two_cities;h=headers(site["username"])
    sent=client.post(route(site),headers=h,json=plan(site,wood=3))
    assert sent.status_code==201,sent.text
    due=datetime.fromisoformat(sent.json()["arrival_due_at"])
    after_dispatch=stock(site["source"],"wood")
    with psycopg.connect(URL) as db:
        db.execute(
            "UPDATE cities SET owner_account_id=%s WHERE city_id=%s",
            (site["outsider"],site["destination"]),
        )
    with psycopg.connect(URL,autocommit=True) as db:
        returning=run_caravan_batch(db,now_at=due)
        assert returning[0]["phase"]=="returning"
        status=db.execute(
            "SELECT status,return_due_at FROM caravan_shipments WHERE shipment_id=%s",
            (sent.json()["shipment_id"],),
        ).fetchone()
        assert status[0]=="returning"
        assert run_caravan_batch(db,now_at=status[1]-timedelta(seconds=1))==[]
        result=run_caravan_batch(db,now_at=status[1])
        assert result[0]["phase"]=="returned"
    assert stock(site["source"],"wood")==after_dispatch+3
    assert stock(site["destination"],"wood")==0


def test_two_concurrent_departures_cannot_spend_same_resources(two_cities):
    site=two_cities
    with psycopg.connect(URL) as db:
        db.execute(
            "UPDATE city_stocks SET amount=7 WHERE city_id=%s AND resource='wood'",
            (site["source"],),
        )
    gate=Barrier(2)
    def attempt():
        with psycopg.connect(URL) as db:
            gate.wait(timeout=10)
            try:
                return send_caravan(
                    db,owner=site["owner"],city_id=site["source"],
                    destination_city_id=site["destination"],shipment_id=uuid4(),
                    cargo=cargo(wood=5),expected_policy_id="LAB-TEST-CONVOYS-1",
                )["status"]
            except CaravanConflict:
                return "refused"
    with ThreadPoolExecutor(max_workers=2) as pool:
        result=[pool.submit(attempt) for _ in range(2)]
        values=[x.result(timeout=30) for x in result]
    assert sorted(values)==["in_transit","refused"]
    assert stock(site["source"],"wood")==2
    assert stock(site["destination"],"wood")==0


def test_caravan_worker_skips_locked_shipments(two_cities):
    site=two_cities
    sent=client.post(route(site),headers=headers(site["username"]),
                     json=plan(site,wood=2))
    due=datetime.fromisoformat(sent.json()["arrival_due_at"])
    sid=UUID(sent.json()["shipment_id"])
    with psycopg.connect(URL,autocommit=True) as a,psycopg.connect(URL,autocommit=True) as b:
        with a.transaction():
            a.execute("SELECT shipment_id FROM caravan_shipments WHERE shipment_id=%s FOR UPDATE",
                      (sid,))
            assert run_caravan_batch(b,now_at=due)==[]
        assert run_caravan_batch(b,now_at=due)[0]["phase"]=="delivered"
        assert run_caravan_batch(a,now_at=due)==[]


def test_marketplace_absent_blocks_dispatch_and_policy_is_not_inferred(city):
    with psycopg.connect(URL) as db:
        owner=db.execute(
            "SELECT owner_account_id FROM cities WHERE city_id=%s",(city["city"],),
        ).fetchone()[0]
        configure_caravan_policy(
            db,world_id=city["world"],policy_id="LAB-NOT-BUILT",
            capacity_units=30000,weights=WEIGHTS,seconds_per_tile=15,
        )
    h=headers(city["username"])
    view=client.get(f"/api/v1/me/cities/{city['city']}/caravans",headers=h)
    assert view.status_code==200
    assert view.json()["destinations"]==[]
    assert view.json()["marketplace_active"] is False
    assert view.json()["transport_policy"]["capacity_units"]==30000



def test_timeline_shows_only_real_private_caravan_events(two_cities):
    site=two_cities;h=headers(site["username"])
    outsider=headers(site["stranger_name"])
    assert client.get("/api/v1/me/timeline",headers=h).json()["events"]==[]
    shipment=client.post(route(site),headers=h,json=plan(site,wood=2))
    assert shipment.status_code==201
    own=client.get("/api/v1/me/timeline",headers=h).json()["events"]
    assert len(own)==1
    assert own[0]["type"]=="caravan_arrival"
    assert own[0]["city_id"]==str(site["source"])
    assert own[0]["target_url"]=="/cities/"+str(site["source"])+"/market#caravans"
    assert client.get("/api/v1/me/timeline",headers=outsider).json()["events"]==[]
    due=datetime.fromisoformat(shipment.json()["arrival_due_at"])
    with psycopg.connect(URL,autocommit=True) as db:
        assert run_caravan_batch(db,now_at=due)[0]["phase"]=="delivered"
    assert client.get("/api/v1/me/timeline",headers=h).json()["events"]==[]
