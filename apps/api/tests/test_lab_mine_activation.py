"""V104 — only a real deposit defended by a V103 guardian can produce.

PostgreSQL is the authority for mine rates, actual credits, two-account
privacy, immutable gate enrollment and replay-safe activation.
"""
from datetime import datetime,timedelta
from decimal import Decimal
from uuid import uuid4

import psycopg
import pytest
from psycopg.types.json import Jsonb

from test_construction_integration import city,headers,client,URL
from test_pve_missions_integration import _setup,_qualify_v103_neutral
from mmhk_api.db import migrate
from mmhk_api.economy import configure_haven_mines,run_economy_batch
from mmhk_api.lab_mine_activation import (
    qualify_lab_mine_unlock,activate_lab_mine,mine_unlocks_for_city,
)
from mmhk_api.world_region_deposits import provision_deposits


def _setup_gate(city):
    hero,unit,encounter=_setup(city)
    _qualify_v103_neutral(city["world"],hero,unit,encounter)
    with psycopg.connect(URL) as db:
        x,y=db.execute("SELECT x,y FROM cities WHERE city_id=%s",
                       (city["city"],)).fetchone()
        i,j=db.execute(
            "SELECT i,j FROM city_mine_positions "
            "WHERE city_id=%s AND resource='gold'",(city["city"],),
        ).fetchone()
        db.execute("UPDATE region_encounters SET cell_i=%s,cell_j=%s "
                   "WHERE encounter_id=%s",(i,j,encounter))
        db.execute("""INSERT INTO world_region_resources(
            world_id,x,y,resources,generation_policy,source_ref
          ) VALUES(%s,%s,%s,%s,'operator-v1','TEST-V104-REAL-FOUR-DEPOSITS')""",
                   (city["world"],x,y,
                    ["gold","wood","ore","crystal"]))
        deposits=provision_deposits(db,world_id=city["world"],x=x,y=y)
        assert any(d["resource"]=="gold" and (d["i"],d["j"])==(i,j)
                   for d in deposits)
        started=db.execute("SELECT clock_timestamp()").fetchone()[0]
        configure_haven_mines(
            db,city_id=city["city"],
            rates_per_day={"gold":"24","wood":"24","ore":"0","crystal":"0"},
            capacities={"gold":10000,"wood":10000,"ore":10000,"crystal":10000},
            tick_seconds=3600,started_at=started,
        )
        qualified=qualify_lab_mine_unlock(
            db,encounter_id=encounter,source_ref="LAB-EXACT-GOLD-DEPOSIT-V104",
        )
        assert qualified["resource"]=="gold"
        assert qualified["gate_status"]=="guardian_pending"
    return hero,unit,encounter,started,(i,j)


def test_unguarded_other_mines_produce_but_qualified_guarded_one_does_not(city):
    hero,unit,encounter,started,_=_setup_gate(city)
    owner=headers(city["username"])
    root=f"/api/v1/me/cities/{city['city']}"
    own=client.get(root+"/mine-unlocks",headers=owner)
    assert own.status_code==200,own.text
    assert own.json()["mines"][0]["state"]=="guarded"
    assert client.get(root+"/mine-unlocks",headers=headers(
        city["enemyname"])).status_code==404
    assert client.get(root,headers=owner).json()["production_per_day"]["gold"]=="0"
    assert client.post(root+"/mine-unlocks/gold/activate",headers=owner,json={
        "order_id":str(uuid4()),
    }).status_code==409
    with psycopg.connect(URL,autocommit=True) as db:
        progress=run_economy_batch(db,now_at=started+timedelta(hours=3))
        assert len(progress)==1
        assert progress[0]["credits"]["gold"]==0
        assert progress[0]["credits"]["wood"]==3
        assert db.execute("SELECT fractional_units FROM city_mine_rates "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==0
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT activated_at FROM city_lab_mine_unlocks "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0] is None
        assert db.execute("SELECT base_units_per_day FROM city_mine_rates "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==24


def test_guardian_victory_player_activation_and_no_backfill(city):
    hero,unit,encounter,started,pos=_setup_gate(city)
    root=f"/api/v1/me/cities/{city['city']}"
    owner=headers(city["username"])
    enemy=headers(city["enemyname"])
    mid=str(uuid4())
    launched=client.post(root+"/missions",headers=owner,json={
        "mission_id":mid,"hero_id":str(hero),
        "encounter_id":str(encounter),"unit_code":unit,
    })
    assert launched.status_code==201,launched.text
    with psycopg.connect(URL,autocommit=True) as db:
        outcome=__import__("mmhk_api.pve_missions",fromlist=["advance_pve_missions"]).advance_pve_missions(
            db,now_at=datetime.fromisoformat(launched.json()["arrival_due_at"]),
        )
        assert outcome[0]["phase"]=="arrived"
    before=client.get(root+"/mine-unlocks",headers=owner)
    assert before.status_code==200,before.text
    assert before.json()["mines"][0]["state"]=="ready"
    assert before.json()["mines"][0]["i"]==pos[0]
    assert before.json()["mines"][0]["j"]==pos[1]
    assert client.post(root+"/mine-unlocks/gold/activate",
                       headers=enemy,json={"order_id":str(uuid4())}).status_code==404
    order=str(uuid4())
    confirmed=client.post(root+"/mine-unlocks/gold/activate",headers=owner,json={
        "order_id":order,
    })
    assert confirmed.status_code==201,confirmed.text
    assert confirmed.json()["status"]=="active"
    assert confirmed.json()["replayed"] is False
    replay=client.post(root+"/mine-unlocks/gold/activate",headers=owner,json={
        "order_id":order,
    })
    assert replay.status_code==200,replay.text
    assert replay.json()["replayed"] is True
    assert replay.json()["activated_at"]==confirmed.json()["activated_at"]
    assert client.post(root+"/mine-unlocks/gold/activate",headers=owner,json={
        "order_id":str(uuid4()),
    }).status_code==409
    assert client.post(root+"/mine-unlocks/mercury/activate",headers=owner,json={
        "order_id":str(uuid4()),
    }).status_code==404
    now_state=client.get(root+"/mine-unlocks",headers=owner).json()
    assert now_state["mines"][0]["state"]=="active"
    assert Decimal(client.get(root,headers=owner).json()["production_per_day"]["gold"])==Decimal(24)
    # The first whole tick began before activation, so it must not pay gold.
    with psycopg.connect(URL,autocommit=True) as db:
        one=run_economy_batch(db,now_at=started+timedelta(hours=4),
                              max_cities=1)
        assert one[0]["ticks"]==1
        assert one[0]["credits"]["gold"]==0
        assert one[0]["credits"]["wood"]==1
        remaining=run_economy_batch(db,now_at=started+timedelta(hours=4),
                                    max_cities=1)
        assert remaining[0]["ticks"]==3
        assert remaining[0]["credits"]["gold"]==3
        assert remaining[0]["credits"]["wood"]==3
        assert run_economy_batch(db,now_at=started+timedelta(hours=4))==[]
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT amount FROM city_stocks "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==203
        assert db.execute("SELECT amount FROM city_stocks "
                          "WHERE city_id=%s AND resource='wood'",
                          (city["city"],)).fetchone()[0]==104
        assert db.execute("SELECT count(*) FROM pve_lab_neutral_resolutions "
                          "WHERE encounter_id=%s",(encounter,)).fetchone()[0]==1
        assert db.execute("SELECT count(*) FROM city_lab_mine_unlocks "
                          "WHERE city_id=%s",(city["city"],)).fetchone()[0]==1


def test_live_gate_cannot_be_deleted_or_rebound_to_undeserved_resource(city):
    hero,unit,encounter,started,_=_setup_gate(city)
    with psycopg.connect(URL) as db:
        with pytest.raises(psycopg.errors.CheckViolation):
            db.execute("DELETE FROM city_lab_mine_unlocks "
                       "WHERE city_id=%s AND resource='gold'",(city["city"],))
    with psycopg.connect(URL) as db:
        with pytest.raises(psycopg.errors.CheckViolation):
            db.execute("UPDATE city_lab_mine_unlocks SET resource='wood' "
                       "WHERE city_id=%s AND resource='gold'",(city["city"],))


def test_qualification_is_idempotent_and_requires_correct_evidence(city):
    hero,unit,encounter,started,_=_setup_gate(city)
    with psycopg.connect(URL) as db:
        repeated=qualify_lab_mine_unlock(
            db,encounter_id=encounter,source_ref="LAB-EXACT-GOLD-DEPOSIT-V104",
        )
        assert repeated["resource"]=="gold"
        with pytest.raises(ValueError,match="another guardian or source"):
            qualify_lab_mine_unlock(
                db,encounter_id=encounter,source_ref="LAB-CHANGED-SOURCE",
            )



def test_enrolled_real_deposit_and_guardian_cannot_move(city):
    hero,unit,encounter,started,pos=_setup_gate(city)
    with psycopg.connect(URL) as db:
        slot=db.execute(
            "SELECT deposit_slot FROM city_lab_mine_unlocks "
            "WHERE city_id=%s AND resource='gold'",(city["city"],),
        ).fetchone()[0]
        x,y=db.execute(
            "SELECT x,y FROM cities WHERE city_id=%s",(city["city"],),
        ).fetchone()
    for stmt,params in (
        ("UPDATE city_mine_positions SET i=%s WHERE city_id=%s AND resource='gold'",
         (1 if pos[0]!=1 else 0,city["city"])),
        ("DELETE FROM world_region_deposits WHERE world_id=%s AND x=%s AND y=%s AND slot=%s",
         (city["world"],x,y,slot)),
        ("UPDATE world_region_deposits SET resource='mercury' "
         "WHERE world_id=%s AND x=%s AND y=%s AND slot=%s",
         (city["world"],x,y,slot)),
        ("UPDATE region_encounters SET cell_j=%s WHERE encounter_id=%s",
         (0 if pos[1]!=0 else 1,encounter)),
    ):
        with psycopg.connect(URL) as db:
            with pytest.raises(psycopg.errors.CheckViolation):
                db.execute(stmt,params)
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT cell_i,cell_j FROM region_encounters "
                          "WHERE encounter_id=%s",(encounter,)).fetchone()==pos
        assert db.execute("SELECT i,j FROM city_mine_positions "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()==pos
