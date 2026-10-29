"""Terrain qualification is independent from dynamic ownership and never grants it."""
from __future__ import annotations

from datetime import UTC,datetime,timedelta
from uuid import UUID,uuid4

import psycopg
import pytest

from test_colonization_integration import (
    colony,unlocked,order,send,route,advance,stock
)
from test_construction_integration import URL,client,headers,city
from mmhk_api.dynamic_influence import (
    configure_influence,record_daily_domination,run_influence_batch
)
from mmhk_api.terrain_catalog import (
    register_qualified_terrain,qualify_terrain_batch
)
from mmhk_api.colonization import ColonizationConflict,_approved_site
from mmhk_api.worlds import RESOURCE_NAMES

pytestmark=pytest.mark.skipif(not URL,reason="PostgreSQL required")
MINES=["gold","wood","ore","crystal"]
RATES={"gold":24,"wood":12,"ore":12,"crystal":6}
CAPS={k:1000 for k in RESOURCE_NAMES}
REF="LAB-TERRAIN-QUALIFIED-V1"


def qualify(c,*,x=3,y=1,ref=REF):
    with psycopg.connect(URL) as db:
        register_qualified_terrain(
            db,world_id=c["world"],x=x,y=y,source_ref=ref,
            mines=MINES,rates_per_day=RATES,capacities=CAPS,
            tick_seconds=60,
        )


def activate(c,*,power=100000):
    now=datetime.now(UTC).replace(microsecond=0)
    with psycopg.connect(URL) as db:
        configure_influence(db,world_id=c["world"],
                            next_refresh_at=now,period_seconds=86400)
        for day_back in range(1,5):
            record_daily_domination(
                db,world_id=c["world"],city_id=c["source"],owner=c["owner"],
                day=now.date()-timedelta(days=day_back),
                military_power=power,building_domination=0,
                source_ref="LAB-FOUR-DAY-TERRAIN-TEST",
            )
    return now


def recalculate(at):
    with psycopg.connect(URL,autocommit=True) as db:
        return run_influence_batch(db,now_at=at)


def own(c):
    return client.get(route(c),headers=headers(c["username"])).json()


def test_qualified_terrain_does_not_grant_colonization_in_manual_world(colony):
    c=colony
    unlocked(c)
    qualify(c)
    visible=own(c)
    assert not any(s["x"]==3 and s["y"]==1 for s in visible["qualified_sites"])
    assert send(c,order(c,x=3,y=1)).status_code==409
    assert any(s["x"]==2 and s["y"]==1 for s in visible["qualified_sites"])
    # Unchanged legacy qualification still works while dynamic is disabled.
    legacy=send(c,order(c,x=2,y=1))
    assert legacy.status_code==201,legacy.text
    assert legacy.json()["site_qualification"]=="legacy_operator"


def test_four_day_win_unlocks_operator_terrain_and_worker_founds_real_city(colony):
    c=colony
    unlocked(c)
    qualify(c)
    at=activate(c)
    h=headers(c["username"])
    before=stock(c["source"])
    pre=client.get(route(c)+"/quote",headers=h,params={
        "source_city_id":str(c["source"]),"hero_id":str(c["hero"]),
        "x":3,"y":1,
    })
    assert pre.status_code==409  # policy enabled but revision not computed yet
    assert own(c)["qualified_sites"]==[]
    assert stock(c["source"])==before
    assert recalculate(at)[0]["controlled_cells"]>0
    assert recalculate(at)==[]
    visible=own(c)
    qualified=next(s for s in visible["qualified_sites"]
                   if s["x"]==3 and s["y"]==1)
    assert qualified["qualification"]=="terrain_registry"
    assert qualified["mine_types"]==sorted(MINES)
    quote=client.get(route(c)+"/quote",headers=h,params={
        "source_city_id":str(c["source"]),"hero_id":str(c["hero"]),
        "x":3,"y":1,
    })
    assert quote.status_code==200,quote.text
    assert quote.json()["site_qualification"]=="terrain_registry"
    assert quote.json()["can_start"] is True
    order_data=order(c,x=3,y=1,name="Territoire conquis")
    sent=send(c,order_data)
    assert sent.status_code==201,sent.text
    assert sent.json()["site_qualification"]=="terrain_registry"
    assert stock(c["source"])==before-20
    assert len(own(c)["expeditions"])==1
    due=datetime.fromisoformat(sent.json()["due_at"])
    assert advance(due-timedelta(microseconds=1))==[]
    done=advance(due)
    assert done==[{"order_id":order_data["order_id"],"phase":"founded",
                  "city_id":done[0]["city_id"]}]
    city_id=done[0]["city_id"]
    detail=client.get("/api/v1/me/cities/"+city_id,headers=h)
    assert detail.status_code==200,detail.text
    d=detail.json()
    assert d["name"]=="Territoire conquis"
    assert d["stocks"]=={k:0 for k in RESOURCE_NAMES}
    assert set(d["mines"])==set(MINES)
    assert d["production_active"] is True
    assert own(c)["expeditions"][0]["status"]=="founded"


def test_contested_or_lost_dynamic_cell_revokes_site_without_deleting_profile(colony):
    c=colony
    unlocked(c)
    qualify(c)
    at=activate(c)
    recalculate(at)
    with psycopg.connect(URL) as db:
        db.execute(
            """UPDATE world_influence_cells
               SET state='contested',owner_account_id=NULL
               WHERE world_id=%s AND x=3 AND y=1""",
            (c["world"],),
        )
        with pytest.raises(ColonizationConflict):
            _approved_site(db,world_id=c["world"],owner=c["owner"],x=3,y=1)
    assert not any(s["x"]==3 and s["y"]==1 for s in own(c)["qualified_sites"])
    assert send(c,order(c,x=3,y=1)).status_code==409
    with psycopg.connect(URL) as db:
        assert db.execute(
            "SELECT enabled FROM world_colonizable_terrain WHERE world_id=%s AND x=3 AND y=1",
            (c["world"],),
        ).fetchone()==(True,)
        db.execute(
            """UPDATE world_influence_cells SET state='controlled',
               owner_account_id=%s WHERE world_id=%s AND x=3 AND y=1""",
            (c["owner"],c["world"]),
        )
    assert any(s["x"]==3 for s in own(c)["qualified_sites"])


def test_founder_loses_dynamic_border_during_travel_escrow_blocks_and_can_refund(colony):
    c=colony;unlocked(c);qualify(c);at=activate(c);recalculate(at)
    cmd=order(c,x=3,y=1)
    sent=send(c,cmd)
    assert sent.status_code==201,sent.text
    due=datetime.fromisoformat(sent.json()["due_at"])
    with psycopg.connect(URL) as db:
        db.execute(
            """UPDATE world_influence_cells
               SET state='contested',owner_account_id=NULL
               WHERE world_id=%s AND x=3 AND y=1""",(c["world"],),
        )
    assert advance(due)==[{
        "order_id":cmd["order_id"],"phase":"blocked",
        "reason":"founding_site_or_rights_changed",
    }]
    assert own(c)["expeditions"][0]["status"]=="blocked"
    assert stock(c["source"])==180
    key=str(uuid4())
    uri=route(c)+"/"+cmd["order_id"]+"/reclaim"
    h=headers(c["username"])
    assert client.post(uri,headers=h,json={"refund_order_id":key}).status_code==201
    repeat=client.post(uri,headers=h,json={"refund_order_id":key})
    assert repeat.status_code==200 and repeat.json()["replayed"] is True
    assert stock(c["source"])==200


def test_operator_manifest_atomic_and_validated_independently_of_ownership(colony):
    c=colony
    def row(x,y,ref=REF):
        return {"x":x,"y":y,"source_ref":ref,"mines":MINES,
                "rates_per_day":RATES,"capacities":CAPS,"tick_seconds":60}
    with psycopg.connect(URL) as db:
        with pytest.raises(ValueError):
            qualify_terrain_batch(db,world_id=c["world"],expected_source_ref=REF,
                                  entries=[row(4,1),row(4,1)])
        with pytest.raises(ValueError):
            qualify_terrain_batch(db,world_id=c["world"],expected_source_ref=REF,
                                  entries=[row(4,1),row(51,1)])
        assert db.execute(
            "SELECT count(*) FROM world_colonizable_terrain WHERE world_id=%s",
            (c["world"],),
        ).fetchone()[0]==0
        assert qualify_terrain_batch(
            db,world_id=c["world"],expected_source_ref=REF,
            entries=[row(3,1),row(4,1)],
        )==2
        with pytest.raises(psycopg.errors.UniqueViolation):
            with db.transaction():
                qualify_terrain_batch(db,world_id=c["world"],
                                      expected_source_ref=REF,entries=[row(3,1)])
        assert db.execute(
            "SELECT count(*) FROM world_colonizable_terrain WHERE world_id=%s",
            (c["world"],),
        ).fetchone()[0]==2
