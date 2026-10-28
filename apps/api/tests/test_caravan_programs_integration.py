"""Scheduled caravan programs: transactional repeat, exact/available policy, stop race.

Each case uses PostgreSQL with two real owned cities and the same source
stocks shared with urban construction, recruitment and one-off caravans.
"""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from threading import Barrier
from uuid import UUID,uuid4

import psycopg
import pytest

from test_construction_integration import city,client,headers,URL
from test_caravan_integration import two_cities,route,cargo,stock
from mmhk_api.caravan_programs import run_program_batch,stop_program,CaravanProgramConflict
from mmhk_api.caravans import run_caravan_batch

pytestmark=pytest.mark.skipif(not URL,reason="PostgreSQL test URL required")


def program_endpoint(site):
    return route(site)+"/programs"


def program_payload(site,*,amount=3,mode="exact",total=2,wait=60,
                    pid=None,destination=None):
    return {
        "program_id":str(pid or uuid4()),
        "destination_city_id":str(destination or site["destination"]),
        "cargo_template":cargo(wood=amount),
        "expected_policy_id":"LAB-TEST-CONVOYS-1",
        "quantity_mode":mode,
        "shipments_total":total,
        "wait_seconds":wait,
    }


def submit(site,payload,*,user=None):
    return client.post(program_endpoint(site),
        headers=headers(user or site["username"]),json=payload)


def list_programs(site,*,user=None):
    r=client.get(route(site),headers=headers(user or site["username"]))
    assert r.status_code==200,r.text
    return r.json()["programs"]


def batch(now,limit=5):
    with psycopg.connect(URL,autocommit=True) as db:
        return run_program_batch(db,now_at=now,max_orders=limit)


def due_at(text):
    return datetime.fromisoformat(text)


def test_program_is_persisted_without_reserving_future_stocks(two_cities):
    site=two_cities;before=stock(site["source"],"wood")
    payload=program_payload(site,amount=4,total=4)
    r=submit(site,payload)
    assert r.status_code==201,r.text
    p=r.json()
    assert p["program_id"]==payload["program_id"]
    assert p["shipments_total"]==4
    assert p["shipments_sent"]==0 and p["status"]=="active"
    assert p["next_departure_at"] is not None
    assert p["quantity_mode"]=="exact"
    assert stock(site["source"],"wood")==before
    own=list_programs(site)
    assert len(own)==1 and own[0]["program_id"]==payload["program_id"]
    replay=submit(site,payload)
    assert replay.status_code==200,replay.text
    assert replay.json()["replayed"] is True
    changed=submit(site,{**payload,"shipments_total":3})
    assert changed.status_code==409
    assert len(list_programs(site))==1
    assert client.get(route(site),headers=headers(site["stranger_name"])).status_code==404
    assert client.post(program_endpoint(site),headers=headers(site["stranger_name"]),
                       json=payload).status_code==404


def test_real_two_departures_real_delivery_and_final_completion(two_cities):
    site=two_cities
    before=stock(site["source"],"wood")
    p=submit(site,program_payload(site,amount=3,total=2,wait=60)).json()
    first=due_at(p["next_departure_at"])
    events=batch(first)
    assert len(events)==1 and events[0]["phase"]=="dispatched"
    assert events[0]["sequence"]==1 and events[0]["total"]==2
    assert stock(site["source"],"wood")==before-3
    history=client.get(route(site),headers=headers(site["username"])).json()
    assert history["shipments"][0]["program_id"]==p["program_id"]
    assert history["shipments"][0]["program_sequence"]==1
    next_at=due_at(history["programs"][0]["next_departure_at"])
    assert next_at==first+timedelta(seconds=60)
    assert batch(first)==[]
    second=batch(next_at)
    assert len(second)==1
    assert second[0]["phase"]=="completed"
    assert second[0]["sequence"]==2
    assert batch(next_at)==[]
    assert stock(site["source"],"wood")==before-6
    final=client.get(route(site),headers=headers(site["username"])).json()
    assert final["programs"][0]["status"]=="completed"
    assert final["programs"][0]["shipments_sent"]==2
    assert final["programs"][0]["next_departure_at"] is None
    assert sorted(s["program_sequence"] for s in final["shipments"])==[1,2]
    with psycopg.connect(URL,autocommit=True) as db:
        assert len(run_caravan_batch(db,now_at=next_at+timedelta(seconds=100)))==2
        assert run_caravan_batch(db,now_at=next_at+timedelta(seconds=100))==[]
    assert stock(site["destination"],"wood")==6


def test_exact_quantity_waits_without_partial_or_negative_debit(two_cities):
    site=two_cities
    with psycopg.connect(URL) as db:
        db.execute(
            "UPDATE city_stocks SET amount=4 WHERE city_id=%s AND resource='wood'",
            (site["source"],),
        )
    program=submit(site,program_payload(site,amount=5,mode="exact")).json()
    first=due_at(program["next_departure_at"])
    state=batch(first)
    assert state==[{"program_id":program["program_id"],
                    "phase":"waiting_stock","reason":"insufficient_stock"}]
    assert stock(site["source"],"wood")==4
    pending=list_programs(site)[0]
    assert pending["status"]=="waiting_stock"
    assert pending["shipments_sent"]==0
    assert batch(first)==[]
    with psycopg.connect(URL) as db:
        db.execute(
            "UPDATE city_stocks SET amount=5 WHERE city_id=%s AND resource='wood'",
            (site["source"],),
        )
    second=due_at(pending["next_departure_at"])
    assert batch(second)[0]["phase"]=="dispatched"
    assert stock(site["source"],"wood")==0
    assert list_programs(site)[0]["shipments_sent"]==1


def test_available_quantity_sends_partial_then_waits_for_replenishment(two_cities):
    site=two_cities
    with psycopg.connect(URL) as db:
        db.execute(
            "UPDATE city_stocks SET amount=4 WHERE city_id=%s AND resource='wood'",
            (site["source"],),
        )
    p=submit(site,program_payload(site,amount=6,mode="available_up_to")).json()
    first=due_at(p["next_departure_at"])
    assert batch(first)[0]["cargo"]["wood"]==4
    assert stock(site["source"],"wood")==0
    next_at=due_at(list_programs(site)[0]["next_departure_at"])
    no_stock=batch(next_at)
    assert no_stock[0]["phase"]=="waiting_stock"
    assert list_programs(site)[0]["shipments_sent"]==1
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_stocks SET amount=2 WHERE city_id=%s AND resource='wood'",
                   (site["source"],))
    retry=due_at(list_programs(site)[0]["next_departure_at"])
    assert batch(retry)[0]["cargo"]["wood"]==2
    final=list_programs(site)[0]
    assert final["shipments_sent"]==2 and final["status"]=="completed"
    assert stock(site["source"],"wood")==0


def test_stop_is_idempotent_and_preserves_already_departed_cargo(two_cities):
    site=two_cities
    p=submit(site,program_payload(site,amount=2,total=4)).json()
    first=due_at(p["next_departure_at"])
    assert batch(first)[0]["phase"]=="dispatched"
    before=stock(site["source"],"wood")
    command={"order_id":str(uuid4())}
    url=program_endpoint(site)+"/"+p["program_id"]+"/stop"
    stopped=client.post(url,headers=headers(site["username"]),json=command)
    assert stopped.status_code==201,stopped.text
    assert stopped.json()["shipments_sent"]==1
    assert stopped.json()["already_departed_unchanged"] is True
    duplicate=client.post(url,headers=headers(site["username"]),json=command)
    assert duplicate.status_code==200
    assert duplicate.json()["replayed"] is True
    assert duplicate.json()["accepted_at"]==stopped.json()["accepted_at"]
    assert client.post(url,headers=headers(site["username"]),json={
        "order_id":str(uuid4()),
    }).status_code==409
    assert client.post(url,headers=headers(site["stranger_name"]),json={
        "order_id":str(uuid4()),
    }).status_code==404
    assert batch(first+timedelta(days=5))==[]
    assert stock(site["source"],"wood")==before
    own=list_programs(site)[0]
    assert own["status"]=="stopped" and own["next_departure_at"] is None
    # Already-dispatched caravan continues to destination after cancellation.
    with psycopg.connect(URL,autocommit=True) as db:
        assert run_caravan_batch(db,now_at=first+timedelta(days=5))[0]["phase"]=="delivered"
    assert stock(site["destination"],"wood")==2


def test_two_workers_claim_only_one_departure_for_same_sequence(two_cities):
    site=two_cities
    p=submit(site,program_payload(site,amount=5,total=2)).json()
    first=due_at(p["next_departure_at"])
    gate=Barrier(2)
    def attempt():
        with psycopg.connect(URL,autocommit=True) as db:
            gate.wait(timeout=12)
            return run_program_batch(db,now_at=first,max_orders=1)
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures=[pool.submit(attempt) for _ in range(2)]
        result=[f.result(timeout=30) for f in futures]
    events=[event for batch in result for event in batch]
    assert len(events)==1 and events[0]["sequence"]==1
    assert list_programs(site)[0]["shipments_sent"]==1
    assert stock(site["source"],"wood")==95
    with psycopg.connect(URL) as db:
        assert db.execute(
            "SELECT count(*) FROM caravan_shipments WHERE program_id=%s",
            (p["program_id"],),
        ).fetchone()[0]==1


def test_worker_cannot_dispatch_new_leg_after_concurrent_stop(two_cities):
    site=two_cities
    p=submit(site,program_payload(site,amount=3,total=4)).json()
    first=due_at(p["next_departure_at"])
    gate=Barrier(2)
    def dispatch():
        with psycopg.connect(URL,autocommit=True) as db:
            gate.wait(timeout=10)
            return run_program_batch(db,now_at=first,max_orders=1)
    def stop():
        with psycopg.connect(URL) as db:
            gate.wait(timeout=10)
            return stop_program(
                db,owner=site["owner"],city_id=site["source"],
                program_id=UUID(p["program_id"]),order_id=uuid4(),
            )
    with ThreadPoolExecutor(max_workers=2) as pool:
        a=pool.submit(dispatch)
        b=pool.submit(stop)
        a_result=a.result(timeout=30)
        stopped=b.result(timeout=30)
    assert stopped["status"]=="stopped"
    assert list_programs(site)[0]["status"]=="stopped"
    with psycopg.connect(URL) as db:
        count=db.execute(
            "SELECT count(*) FROM caravan_shipments WHERE program_id=%s",
            (p["program_id"],),
        ).fetchone()[0]
    assert count in (0,1)
    assert stock(site["source"],"wood")==100-count*3
    assert batch(first+timedelta(days=10))==[]


def test_revalidation_pauses_on_destination_loss_or_policy_change(two_cities):
    site=two_cities
    p=submit(site,program_payload(site,amount=2)).json()
    with psycopg.connect(URL) as db:
        db.execute("UPDATE cities SET owner_account_id=%s WHERE city_id=%s",
                   (site["outsider"],site["destination"]))
    attempted=batch(due_at(p["next_departure_at"]))
    assert attempted[0]["phase"]=="paused"
    assert list_programs(site)[0]["status"]=="paused"
    assert list_programs(site)[0]["shipments_sent"]==0
    assert stock(site["source"],"wood")==100
    assert batch(due_at(p["next_departure_at"])+timedelta(hours=2))==[]


def test_rejects_invalid_modes_durations_and_hidden_destinations(two_cities):
    site=two_cities; h=headers(site["username"])
    endpoint=program_endpoint(site)
    for changed in [
        {"shipments_total":1},{"shipments_total":13},
        {"wait_seconds":0},{"wait_seconds":59},
        {"wait_seconds":86401},{"quantity_mode":"all"},
        {"cargo_template":cargo()},
        {"cargo_template":{"wood":2}},
        {"destination_city_id":str(site["source"])},
        {"destination_city_id":str(site["foreign"])},
        {"expected_policy_id":"UNKNOWN-RATE"},
    ]:
        payload={**program_payload(site,amount=2),**changed}
        response=client.post(endpoint,headers=h,json=payload)
        assert response.status_code in (409,422),response.text
    assert list_programs(site)==[]
