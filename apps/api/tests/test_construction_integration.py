"""End-to-end urban construction with real PostgreSQL and FastAPI."""
from __future__ import annotations
import os
from datetime import datetime,timedelta,timezone
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient

from mmhk_api.db import migrate
from mmhk_api.main import app
from mmhk_api.security import create_account
from mmhk_api.worlds import seed_first_haven_city
from mmhk_api.construction import (
    configure_building_profile,quote,run_construction_batch,
)

URL=os.environ.get("MMHK_TEST_DATABASE_URL")
pytestmark=pytest.mark.skipif(not URL,reason="PostgreSQL test URL required")
client=TestClient(app)

@pytest.fixture
def city(monkeypatch):
    assert URL
    monkeypatch.setenv("MMHK_DATABASE_URL",URL)
    with psycopg.connect(URL) as db:
        migrate(db)
        username="b"+uuid4().hex[:16]
        enemyname="e"+uuid4().hex[:16]
        player=create_account(db,username,"test-construction-password")
        enemy=create_account(db,enemyname,"test-construction-password")
        world="build-"+uuid4().hex[:16]
        otherworld="build-"+uuid4().hex[:16]
        city=seed_first_haven_city(
            db,world_id=world,world_name="World",size=50,
            account_id=player,city_name="Havre",x=1,y=1,
            amounts={"gold":200,"wood":100,"ore":100},
        )
        other=seed_first_haven_city(
            db,world_id=otherworld,world_name="Other",size=50,
            account_id=enemy,city_name="Other",x=2,y=2,
            amounts={"gold":200,"wood":100,"ore":100},
        )
        code="hall_"+uuid4().hex[:16]
        costs={"gold":10,"wood":5,"ore":1,"crystal":0,
               "gems":0,"sulfur":0,"mercury":0}
        configure_building_profile(
            db,building_code=code,target_level=1,
            policy_id="EXPERIMENTAL_CITIES_V1",
            base_seconds=120,base_costs=costs,
        )
        configure_building_profile(
            db,building_code=code,target_level=2,
            policy_id="EXPERIMENTAL_CITIES_V1",
            base_seconds=180,base_costs=costs,
        )
    data={"city":city,"other":other,"code":code,"world":world,
          "otherworld":otherworld,"username":username,"enemyname":enemyname}
    yield data
    with psycopg.connect(URL) as db:
        db.execute("DELETE FROM cities WHERE city_id IN (%s,%s)",(city,other))
        db.execute("DELETE FROM world_memberships WHERE world_id IN (%s,%s)",
                   (world,otherworld))
        db.execute("DELETE FROM worlds WHERE world_id IN (%s,%s)",(world,otherworld))
        db.execute("DELETE FROM accounts WHERE account_id IN (%s,%s)",(player,enemy))
        db.execute("DELETE FROM urban_building_profiles WHERE building_code=%s",(code,))

def headers(username):
    res=client.post("/api/v1/sessions",json={
        "username":username,"password":"test-construction-password",
    })
    assert res.status_code==200
    return {"Authorization":"Bearer "+res.json()["access_token"]}

def start(city,h,mode="normal",order_id=None,code=None):
    return client.post(f"/api/v1/me/cities/{city['city']}/construction",
                       headers=h,json={"order_id":str(order_id or uuid4()),
                                       "building_code":code or city["code"],
                                       "mode":mode})

def stock(city,key):
    with psycopg.connect(URL) as db:
        return db.execute(
            "SELECT amount FROM city_stocks WHERE city_id=%s AND resource=%s",
            (city["city"],key),
        ).fetchone()[0]

def test_migration_catalog_and_undisclosed_enemy_buildings(city):
    h=headers(city["username"])
    e=headers(city["enemyname"])
    with psycopg.connect(URL) as db:
        assert migrate(db)==[]
        assert db.execute("SELECT version FROM app_schema_migrations ORDER BY version").fetchall()==[
            (1,),(2,),(3,),(4,),(5,),(6,),(7,),(8,),(9,),(10,),(11,),(12,),
        ]
    assert client.get(f"/api/v1/me/cities/{city['city']}/construction").status_code==401
    own=client.get(f"/api/v1/me/cities/{city['city']}/construction",headers=h)
    assert own.status_code==200
    options=own.json()["options"]
    assert len(options)==1 and options[0]["target_level"]==1
    assert [x["mode"] for x in options[0]["modes"]]==["normal","rapid","economic"]
    assert client.get(f"/api/v1/me/cities/{city['city']}/construction",
                      headers=e).status_code==404
    assert client.get(f"/api/v1/me/cities/{city['other']}/construction",
                      headers=h).status_code==404
    assert client.post(f"/api/v1/me/cities/{city['other']}/construction",
                       headers=h,json={"order_id":str(uuid4()),
                       "building_code":city["code"],"mode":"normal"}).status_code==404

def test_payment_at_start_one_active_replay_and_next_upgrade(city):
    h=headers(city["username"])
    oid=uuid4()
    created=start(city,h,"rapid",oid)
    assert created.status_code==201,created.text
    obj=created.json()
    assert obj["target_level"]==1
    assert obj["mode"]=="rapid"
    assert obj["applied_costs"]["gold"]==14
    assert obj["applied_costs"]["wood"]==7
    assert obj["applied_costs"]["ore"]==2
    assert obj["historically_certified"] is False
    assert (datetime.fromisoformat(obj["due_at"])-datetime.fromisoformat(obj["started_at"])
           ).total_seconds()==96
    assert stock(city,"gold")==186
    assert stock(city,"wood")==93
    assert stock(city,"ore")==98
    replay=start(city,h,"rapid",oid)
    assert replay.status_code==200
    assert replay.json()["replayed"] is True
    assert stock(city,"gold")==186
    assert start(city,h,"normal").status_code==409
    assert start(city,h,"normal",oid).status_code==409
    with psycopg.connect(URL,autocommit=True) as db:
        assert run_construction_batch(db,now_at=datetime.fromisoformat(obj["due_at"])-timedelta(microseconds=1))==[]
        completed=run_construction_batch(db,now_at=datetime.fromisoformat(obj["due_at"]))
        assert len(completed)==1
        assert run_construction_batch(db,now_at=datetime.fromisoformat(obj["due_at"]))==[]
        events=db.execute("SELECT phase FROM urban_construction_events WHERE order_id=%s ORDER BY phase",(oid,)).fetchall()
        assert events==[("completed",),("started",)]
    catalog=client.get(f"/api/v1/me/cities/{city['city']}/construction",headers=h).json()
    assert catalog["active"] is None
    assert catalog["buildings"]==[{"building_code":city["code"],
       "level":1,"active":True,"operator_disabled":False,"prerequisites":{}}]
    assert next(o["target_level"] for o in catalog["options"]
        if o["building_code"]==city["code"])==2
    second=start(city,h,"economic")
    assert second.status_code==201,second.text
    assert second.json()["applied_costs"]["gold"]==8
    assert (datetime.fromisoformat(second.json()["due_at"])-
            datetime.fromisoformat(second.json()["started_at"])).total_seconds()==252

def test_insufficient_funds_does_not_open_order_or_write_partial_debits(city):
    h=headers(city["username"])
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_stocks SET amount=0 WHERE city_id=%s AND resource='gold'",(city["city"],))
    response=start(city,h)
    assert response.status_code==409,response.text
    assert stock(city,"wood")==100
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT COUNT(*) FROM urban_construction_orders WHERE city_id=%s",
                          (city["city"],)).fetchone()[0]==0
    assert client.get(f"/api/v1/me/cities/{city['city']}/construction",
                      headers=h).json()["active"] is None

def test_worker_lock_skips_other_connection_and_reopens(city):
    h=headers(city["username"])
    data=start(city,h).json()
    due=datetime.fromisoformat(data["due_at"])
    with psycopg.connect(URL,autocommit=True) as a, psycopg.connect(URL,autocommit=True) as b:
        with a.transaction():
            a.execute("SELECT order_id FROM urban_construction_orders WHERE order_id=%s FOR UPDATE",
                      (data["order_id"],))
            assert run_construction_batch(b,now_at=due)==[]
        done=run_construction_batch(b,now_at=due)
        assert len(done)==1
        assert run_construction_batch(a,now_at=due)==[]
    with psycopg.connect(URL) as db:
        row=db.execute("SELECT status,completed_at FROM urban_construction_orders WHERE order_id=%s",
                       (data["order_id"],)).fetchone()
        assert row[0]=="completed" and row[1]==due
        assert db.execute("SELECT level FROM urban_city_buildings WHERE city_id=%s AND building_code=%s",
                          (city["city"],city["code"])).fetchone()[0]==1

def test_modes_round_up_and_bad_inputs_rejected(city):
    cost={"gold":1,"wood":3,"ore":0,"crystal":0,
          "gems":0,"sulfur":0,"mercury":0}
    q=quote(cost,11,"economic")
    assert q["costs"]["gold"]==1 and q["costs"]["wood"]==3
    assert q["duration_seconds"]==16
    assert quote(cost,11,"rapid")["duration_seconds"]==9
    assert quote(cost,11,"rapid")["costs"]["gold"]==2
    h=headers(city["username"])
    assert client.post(f"/api/v1/me/cities/{city['city']}/construction",
                       headers=h,json={"order_id":str(uuid4()),
                       "building_code":city["code"],"mode":"invalid"}).status_code==422
    assert client.post(f"/api/v1/me/cities/{city['city']}/construction",
                       headers=h,json={"order_id":str(uuid4()),
                       "building_code":city["code"],"mode":"normal",
                       "applied_costs":{"gold":0}}).status_code==422

def test_construction_history_is_private_and_preserves_accepted_prices(city):
    owner=headers(city["username"])
    stranger=headers(city["enemyname"])
    path=f"/api/v1/me/cities/{city['city']}/construction"
    assert client.get(path,headers=owner).json()["history"]==[]
    oid=uuid4()
    created=start(city,owner,"rapid",oid)
    assert created.status_code==201,created.text
    receipt=created.json()
    during=client.get(path,headers=owner).json()["history"]
    assert len(during)==1 and during[0]["order_id"]==str(oid)
    assert during[0]["status"]=="building"
    assert during[0]["mode"]=="rapid"
    assert during[0]["applied_costs"]==receipt["applied_costs"]
    assert "actor_account_id" not in during[0]
    assert client.get(path,headers=stranger).status_code==404
    assert client.get(f"/api/v1/me/cities/{city['other']}/construction",
                      headers=owner).status_code==404
    with psycopg.connect(URL,autocommit=True) as db:
        assert len(run_construction_batch(
            db,now_at=datetime.fromisoformat(receipt["due_at"])))==1
    done=client.get(path,headers=owner).json()["history"]
    assert done[0]["status"]=="completed"
    assert done[0]["completed_at"]==receipt["due_at"]
    assert done[0]["applied_costs"]==receipt["applied_costs"]
    next_order=start(city,owner,"economic")
    assert next_order.status_code==201,next_order.text
    latest=client.get(path,headers=owner).json()["history"]
    assert [entry["order_id"] for entry in latest]==[
        next_order.json()["order_id"],str(oid)]
    assert latest[1]["applied_costs"]==receipt["applied_costs"]
