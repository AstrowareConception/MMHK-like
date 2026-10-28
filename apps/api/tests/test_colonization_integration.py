"""PostgreSQL regression scenarios for seven-day protection and real colonization.

Written for the next CI session: not executed during this development batch.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timedelta
from threading import Barrier
from uuid import uuid4,UUID
import psycopg
import pytest
from test_construction_integration import URL,city,client,headers
from mmhk_api.colonization import (
    configure_colonization_policy,configure_colony_site,
    start_colonization,run_colonization_batch,ColonizationConflict,
)
from mmhk_api.worlds import RESOURCE_NAMES

pytestmark=pytest.mark.skipif(not URL,reason="PostgreSQL test URL required")
COSTS={k:({"gold":20,"wood":5,"ore":5}.get(k,0)) for k in RESOURCE_NAMES}
CAPS={k:100 for k in RESOURCE_NAMES}
MINES=["gold","wood","ore","crystal"]
RATES={"gold":24,"wood":12,"ore":12,"crystal":6}

@pytest.fixture
def colony(city):
    with psycopg.connect(URL) as db:
        owner=db.execute(
            "SELECT owner_account_id FROM cities WHERE city_id=%s",(city["city"],)
        ).fetchone()[0]
        hero=uuid4()
        db.execute(
            """INSERT INTO city_heroes(hero_id,city_id,owner_account_id,name,archetype)
               VALUES(%s,%s,%s,'Éclaireur fondateur','might')""",
            (hero,city["city"],owner),
        )
        configure_colonization_policy(db,world_id=city["world"],
            policy_id="LAB-COLONY-TEST-V1",costs=COSTS,
            max_owned_cities=3,max_distance_steps=3,seconds_per_step=15)
        for x,y in ((2,1),(1,2)):
            db.execute(
                """INSERT INTO map_influence_cells
                   (world_id,x,y,controller_account_id,source_ref)
                   VALUES(%s,%s,%s,%s,'LAB-OWN-CONTROL')""",
                (city["world"],x,y,owner),
            )
            configure_colony_site(db,world_id=city["world"],x=x,y=y,
                source_ref="LAB-QUALIFIED-PLOT",mines=MINES,
                rates_per_day=RATES,capacities=CAPS,tick_seconds=60)
    data={"world":city["world"],"owner":owner,"source":city["city"],
          "hero":hero,"username":city["username"],
          "other_username":city["enemyname"]}
    yield data
    with psycopg.connect(URL) as db:
        children=db.execute(
            "SELECT new_city_id FROM colonization_orders WHERE world_id=%s",
            (data["world"],),
        ).fetchall()
        db.execute("DELETE FROM colonization_orders WHERE world_id=%s",(data["world"],))
        for (cid,) in children:
            db.execute("DELETE FROM cities WHERE city_id=%s",(cid,))
        db.execute("DELETE FROM colonization_site_profiles WHERE world_id=%s",
                   (data["world"],))
        db.execute("DELETE FROM map_influence_cells WHERE world_id=%s",
                   (data["world"],))

def route(c):
    return "/api/v1/me/worlds/"+c["world"]+"/colonization"

def unlocked(c):
    with psycopg.connect(URL) as db:
        db.execute(
            """UPDATE world_memberships
               SET joined_at=clock_timestamp()-interval '8 days'
               WHERE world_id=%s AND account_id=%s""",
            (c["world"],c["owner"]),
        )

def order(c,*,x=2,y=1,hero=None,oid=None,name="Comptoir des Brumes"):
    return {"order_id":str(oid or uuid4()),"source_city_id":str(c["source"]),
            "hero_id":str(hero or c["hero"]),"x":x,"y":y,"colony_name":name,
            "expected_policy_id":"LAB-COLONY-TEST-V1"}

def send(c,data=None):
    return client.post(route(c),headers=headers(c["username"]),json=data or order(c))

def stock(cid,kind="gold"):
    with psycopg.connect(URL) as db:
        return db.execute(
            "SELECT amount FROM city_stocks WHERE city_id=%s AND resource=%s",
            (cid,kind),
        ).fetchone()[0]

def advance(at):
    with psycopg.connect(URL,autocommit=True) as db:
        return run_colonization_batch(db,now_at=at)

def test_seven_day_protection_is_visible_and_never_bypassed_by_post(colony):
    h=headers(colony["username"])
    assert client.get(route(colony)).status_code==401
    assert client.get(route(colony),headers=headers(colony["other_username"])).status_code==404
    model=client.get(route(colony),headers=h).json()
    assert model["newbie_protected"] is True
    assert model["newbie_protection_days"]==7
    assert model["protection_cannot_be_cancelled"] is True
    assert model["owned_cities"]==1
    assert len(model["qualified_sites"])==2
    quote=client.get(route(colony)+"/quote",headers=h,params={
        "source_city_id":str(colony["source"]),
        "hero_id":str(colony["hero"]),"x":2,"y":1,
    })
    assert quote.status_code==200,quote.text
    assert quote.json()["blocking_reasons"]==["newbie_protection"]
    before=stock(colony["source"])
    assert send(colony).status_code==409
    assert stock(colony["source"])==before
    assert client.get(route(colony),headers=h).json()["expeditions"]==[]

def test_founding_creates_real_child_city_and_returns_hero_without_double_debit(colony):
    unlocked(colony)
    h=headers(colony["username"])
    before={k:stock(colony["source"],k) for k in RESOURCE_NAMES}
    cmd=order(colony)
    first=send(colony,cmd)
    assert first.status_code==201,first.text
    shipment=first.json()
    assert shipment["status"]=="traveling" and shipment["new_city_id"] is None
    assert shipment["applied_costs"]==COSTS
    assert send(colony,cmd).status_code==200
    assert send(colony,{**cmd,"colony_name":"Autre nom"}).status_code==409
    assert stock(colony["source"])==before["gold"]-20
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT status FROM city_heroes WHERE hero_id=%s",
                          (colony["hero"],)).fetchone()==("colonizing",)
    due=datetime.fromisoformat(shipment["due_at"])
    assert advance(due-timedelta(microseconds=1))==[]
    result=advance(due)
    assert len(result)==1 and result[0]["phase"]=="founded"
    assert advance(due)==[]
    cid=result[0]["city_id"]
    detail=client.get("/api/v1/me/cities/"+cid,headers=h)
    assert detail.status_code==200,detail.text
    data=detail.json()
    assert data["name"]=="Comptoir des Brumes" and data["first_city"] is False
    assert data["stocks"]=={k:0 for k in RESOURCE_NAMES}
    assert set(data["mines"])==set(MINES)
    assert data["stock_capacities"]==CAPS and data["production_active"] is True
    assert set(data["production_per_day"])==set(MINES)
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT status FROM city_heroes WHERE hero_id=%s",
                          (colony["hero"],)).fetchone()==("idle",)
        assert db.execute("SELECT count(*) FROM cities WHERE world_id=%s",
                          (colony["world"],)).fetchone()[0]==2
    assert client.post(route(colony),headers=h,json=cmd).json()["replayed"] is True
    assert stock(colony["source"])==before["gold"]-20

def test_unknown_region_special_site_or_busy_hero_do_not_expose_secrets(colony):
    unlocked(colony)
    h=headers(colony["username"])
    assert send(colony,order(colony,x=8,y=8)).status_code==409
    assert send(colony,order(colony,hero=uuid4())).status_code==409
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_heroes SET status='wounded' WHERE hero_id=%s",
                   (colony["hero"],))
    assert send(colony).status_code==409
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_heroes SET status='idle' WHERE hero_id=%s",
                   (colony["hero"],))
        db.execute(
            """INSERT INTO map_world_sites(site_id,world_id,kind,x,y,label,source_ref)
               VALUES(%s,%s,'relic',2,1,'Secret ennemi','LAB-SECRET-TEST')""",
            (uuid4(),colony["world"]),
        )
    answer=send(colony)
    assert answer.status_code==409
    assert "Secret ennemi" not in answer.text
    with psycopg.connect(URL) as db:
        db.execute("DELETE FROM map_world_sites WHERE world_id=%s",
                   (colony["world"],))

def test_concurrent_founders_cannot_reserve_one_plot_twice(colony):
    unlocked(colony)
    second=uuid4()
    with psycopg.connect(URL) as db:
        db.execute(
            """INSERT INTO city_heroes(hero_id,city_id,owner_account_id,name,archetype)
               VALUES(%s,%s,%s,'Deuxième explorateur','might')""",
            (second,colony["source"],colony["owner"]),
        )
    gate=Barrier(2)
    def race(hero):
        with psycopg.connect(URL) as db:
            gate.wait(timeout=10)
            try:
                return start_colonization(
                    db,owner=colony["owner"],world_id=colony["world"],
                    order_id=uuid4(),source_city_id=colony["source"],hero_id=hero,
                    x=2,y=1,colony_name="Avant-poste",
                    expected_policy_id="LAB-COLONY-TEST-V1",
                )["status"]
            except ColonizationConflict:
                return "refused"
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures=[pool.submit(race,h) for h in (colony["hero"],second)]
        assert sorted(f.result(timeout=30) for f in futures)==["refused","traveling"]
    with psycopg.connect(URL) as db:
        assert db.execute(
            "SELECT count(*) FROM colonization_orders WHERE world_id=%s",
            (colony["world"],),
        ).fetchone()[0]==1
    assert stock(colony["source"])==180

def test_cap_includes_inflight_and_hero_is_busy_while_colonizing(colony):
    unlocked(colony)
    with psycopg.connect(URL) as db:
        db.execute("UPDATE colonization_world_policies SET max_owned_cities=2 WHERE world_id=%s",
                   (colony["world"],))
    assert send(colony).status_code==201
    hero=uuid4()
    with psycopg.connect(URL) as db:
        db.execute(
            """INSERT INTO city_heroes(hero_id,city_id,owner_account_id,name,archetype)
               VALUES(%s,%s,%s,'Troisième fondateur','might')""",
            (hero,colony["source"],colony["owner"]),
        )
    assert send(colony,order(colony,x=1,y=2,hero=hero)).status_code==409
    assert stock(colony["source"])==180
