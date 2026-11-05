"""V107 real PostgreSQL extension, +5% and G11 stop-production rule.

No historical price, duration, stacking or tile occupancy is invented:
operator certifies each physical LAB site and explicit experiment parameters.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import uuid4

import psycopg
import pytest

from test_construction_integration import city, headers, client, URL
from test_lab_mine_upgrades import _qualified_g11_gold
from mmhk_api.mine_extensions import (
    BONUS, qualify_lab_mine_extension, extensions_for_city,
    start_lab_mine_extension,
)
from mmhk_api.economy import run_economy_batch


def _free_adjacent_site(db,city_id):
    i,j=db.execute(
        """SELECT i,j FROM city_mine_positions
           WHERE city_id=%s AND resource='gold'""",(city_id,),
    ).fetchone()
    occupied=set(db.execute(
        "SELECT i,j FROM city_mine_positions WHERE city_id=%s",(city_id,),
    ).fetchall())
    occupied.update(db.execute(
        "SELECT cell_i,cell_j FROM region_encounters WHERE city_id=%s",
        (city_id,),
    ).fetchall())
    occupied.update(db.execute(
        """SELECT d.i,d.j FROM world_region_deposits d
           JOIN cities c ON c.world_id=d.world_id AND c.x=d.x AND c.y=d.y
           WHERE c.city_id=%s""",(city_id,),
    ).fetchall())
    available=[
        (i+di,j+dj) for di,dj in ((0,1),(1,0),(-1,0),(0,-1))
        if 0<=i+di<=4 and 0<=j+dj<=4
        and (i+di,j+dj)!=(2,2)
        and (i+di,j+dj) not in occupied
    ]
    assert available, "Gold test mine needs one empty adjacent regional tile"
    return available[0]


def _qualify(city,*,cost=1000,minutes=120,required=1):
    hero,start,root,owner=_qualified_g11_gold(city,approve=False)
    with psycopg.connect(URL) as db:
        site=_free_adjacent_site(db,city["city"])
        info=qualify_lab_mine_extension(
            db,city_id=city["city"],resource="gold",
            site_i=site[0],site_j=site[1],cost_gold=cost,
            duration_seconds=minutes*60,required_hero_level=required,
            source_ref="LAB-G11-EXPLICIT-EXTENSION-TEST",
        )
        assert (info["site_i"],info["site_j"])==site
    return hero,start,root,owner,site


def test_extension_unqualified_mines_are_not_commandable(city):
    hero,start,root,owner=_qualified_g11_gold(city,approve=False)
    response=client.get(root+"/mine-extensions",headers=owner)
    assert response.status_code==200,response.text
    assert response.json()["mines"]==[]
    rejected=client.post(root+"/mine-extensions",headers=owner,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    })
    assert rejected.status_code==409,rejected.text
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT amount FROM city_stocks "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==12000


def test_extension_site_and_pricing_are_operator_attested_not_G11_guesses(city):
    hero,start,root,owner,site=_qualify(city)
    owner_view=client.get(root+"/mine-extensions",headers=owner)
    assert owner_view.status_code==200,owner_view.text
    row=owner_view.json()["mines"][0]
    assert (row["site_i"],row["site_j"])==site
    assert row["cost_gold"]==1000 and row["duration_seconds"]==7200
    assert row["extension_bonus_percent"]=="5"
    assert row["order"] is None
    assert row["source_ref"]=="LAB-G11-EXPLICIT-EXTENSION-TEST"
    assert client.get(root+"/mine-extensions",headers=headers(
        city["enemyname"])).status_code==404
    assert client.get(root+"/mine-extensions").status_code==401
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT additive_bonus FROM city_mine_rates "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==0


def test_extension_suspends_only_target_mine_and_adds_five_percent_after_due(city):
    hero,start,root,owner,site=_qualify(city)
    oid=str(uuid4())
    payload={"order_id":oid,"hero_id":str(hero),"resource":"gold"}
    response=client.post(root+"/mine-extensions",headers=owner,json=payload)
    assert response.status_code==201,response.text
    receipt=response.json()
    assert receipt["status"]=="building"
    assert receipt["cost_gold"]==1000 and not receipt["replayed"]
    assert client.post(root+"/mine-extensions",headers=owner,json=payload).status_code==200
    assert client.post(root+"/mine-extensions",headers=owner,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    }).status_code==409
    assert client.post(root+"/mine-extensions",
        headers=headers(city["enemyname"]),json={
            "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
        }).status_code==404
    due=datetime.fromisoformat(receipt["due_at"])
    assert start+timedelta(hours=2)<due<start+timedelta(hours=3)
    city_view=client.get(root,headers=owner).json()
    assert city_view["production_per_day"]["gold"]=="0"
    assert Decimal(city_view["production_per_day"]["wood"])==24
    with psycopg.connect(URL) as db:
        gold=db.execute("SELECT amount FROM city_stocks "
                        "WHERE city_id=%s AND resource='gold'",
                        (city["city"],)).fetchone()[0]
        assert gold==11000
    # One tick per batch: V104 gate, then two suspended V107 intervals,
    # then 5%-boosted output starting with the first eligible full tick.
    credits=[]
    completed=[]
    with psycopg.connect(URL,autocommit=True) as db:
        for _ in range(4):
            event=run_economy_batch(
                db,now_at=start+timedelta(hours=4),
                max_cities=1,max_ticks_per_city=1,
            )[0]
            assert event["ticks"]==1
            credits.append(event["credits"]["gold"])
            completed.extend(event["extensions_completed"])
            assert event["credits"]["wood"]==1
        assert credits==[0,0,0,87]
        assert len(completed)==1
        assert completed[0]["resource"]=="gold"
        assert run_economy_batch(db,now_at=start+timedelta(hours=4))==[]
        next_event=run_economy_batch(
            db,now_at=start+timedelta(hours=5),max_cities=1,
        )[0]
        assert next_event["credits"]["gold"]==88
        assert next_event["extensions_completed"]==[]
        assert run_economy_batch(db,now_at=start+timedelta(hours=5))==[]
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT amount FROM city_stocks "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==11175
        assert db.execute("SELECT additive_bonus FROM city_mine_rates "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==BONUS
        assert db.execute("SELECT status FROM city_lab_mine_extension_orders "
                          "WHERE order_id=%s",(oid,)).fetchone()[0]=="completed"
        assert db.execute("SELECT count(*) FROM city_lab_mine_extension_orders "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==1
    assert Decimal(client.get(root,headers=owner).json()[
        "production_per_day"]["gold"])==2100
    finished=client.get(root+"/mine-extensions",headers=owner).json()
    assert finished["mines"][0]["order"]["status"]=="completed"
    assert client.post(root+"/mine-extensions",headers=owner,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    }).status_code==409


def test_hero_threshold_and_cost_refusals_apply_before_expense(city):
    hero,start,root,owner,site=_qualify(city,required=2,cost=13000)
    bad=client.post(root+"/mine-extensions",headers=owner,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    })
    assert bad.status_code==409,bad.text
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT amount FROM city_stocks "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==12000
        assert db.execute("SELECT count(*) FROM city_lab_mine_extension_orders "
                          "WHERE city_id=%s",(city["city"],)).fetchone()[0]==0


def test_extension_site_is_immutable_and_future_occupancy_is_rejected(city):
    hero,start,root,owner,site=_qualify(city)
    i,j=site
    for query,values in (
        ("UPDATE city_lab_mine_extension_sites SET site_i=%s "
         "WHERE city_id=%s AND resource='gold'",(0 if i!=0 else 1,city["city"])),
        ("DELETE FROM city_lab_mine_extension_sites WHERE city_id=%s "
         "AND resource='gold'",(city["city"],)),
    ):
        with psycopg.connect(URL) as db:
            with pytest.raises(psycopg.errors.CheckViolation):
                db.execute(query,values)
    with psycopg.connect(URL) as db:
        orig=db.execute("SELECT unit_code FROM region_encounters "
                        "WHERE city_id=%s LIMIT 1",(city["city"],)).fetchone()[0]
    with psycopg.connect(URL) as db:
        with pytest.raises(psycopg.errors.CheckViolation):
            db.execute(
                """INSERT INTO region_encounters(
                     encounter_id,city_id,cell_i,cell_j,name,
                     unit_code,unit_count,unit_power,source_ref
                   ) VALUES(%s,%s,%s,%s,'Forbidden extension occupant',
                            %s,1,1,'LAB-OVERLAP-TEST')""",
                (uuid4(),city["city"],i,j,orig),
            )


def test_operator_cannot_requalify_different_extension_or_occupied_tile(city):
    hero,start,root,owner,site=_qualify(city)
    with psycopg.connect(URL) as db:
        with pytest.raises(ValueError,match="immutable"):
            qualify_lab_mine_extension(
                db,city_id=city["city"],resource="gold",
                site_i=site[0],site_j=site[1],
                required_hero_level=1,cost_gold=2000,duration_seconds=7200,
                source_ref="LAB-G11-EXPLICIT-EXTENSION-TEST",
            )
        p=db.execute(
            "SELECT i,j FROM city_mine_positions WHERE city_id=%s "
            "AND resource='gold'",(city["city"],),
        ).fetchone()
        with pytest.raises(ValueError,match="adjacent"):
            qualify_lab_mine_extension(
                db,city_id=city["city"],resource="gold",
                site_i=p[0],site_j=p[1],
                required_hero_level=1,cost_gold=1000,duration_seconds=7200,
                source_ref="LAB-G11-EXPLICIT-EXTENSION-TEST",
            )


def test_level_and_extension_builds_are_mutually_exclusive(city):
    hero,start,root,owner,site=_qualify(city)
    from mmhk_api.mine_upgrades import qualify_lab_mine_upgrade
    with psycopg.connect(URL) as db:
        qualify_lab_mine_upgrade(
            db,city_id=city["city"],resource="gold",target_level=2,
            required_hero_level=1,source_ref="LAB-G11-HERO-L1",
        )
    extension=client.post(root+"/mine-extensions",headers=owner,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    })
    assert extension.status_code==201,extension.text
    upgrade=client.post(root+"/mine-upgrades",headers=owner,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    })
    assert upgrade.status_code==409,upgrade.text
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT level FROM city_lab_mine_levels "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==1
        assert db.execute("SELECT amount FROM city_stocks "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==11000


def test_revoke_lab_world_blocks_new_extension_orders(city):
    hero,start,root,owner,site=_qualify(city)
    with psycopg.connect(URL) as db:
        db.execute("UPDATE pve_travel_policies SET policy_id='REVOKED-V107' "
                   "WHERE world_id=%s",(city["world"],))
    assert client.get(root+"/mine-extensions",headers=owner).json()["mines"]==[]
    attempted=client.post(root+"/mine-extensions",headers=owner,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    })
    assert attempted.status_code==409,attempted.text
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT amount FROM city_stocks "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==12000
