"""V106: G11 mine level upgrade is real only after explicit LAB qualification.

A configured V104 gold mine with a real V103-vanquished guardian is the
fixture. Gold cost is charged exactly once; the rate changes after the
economy worker has finished every tick whose START predates the due time.
"""
from datetime import datetime,timedelta
from decimal import Decimal
from uuid import uuid4

import psycopg
import pytest

from test_construction_integration import city,headers,client,URL
from test_lab_mine_activation import _setup_gate
from mmhk_api.economy import run_economy_batch
from mmhk_api.mine_upgrades import (
    quote_g11_normal_step,qualify_lab_mine_upgrade,start_lab_mine_upgrade,
)


def _qualified_g11_gold(city,*,approve=True,threshold=1,starting_gold=12000):
    hero,unit,encounter,started,_=_setup_gate(city)
    with psycopg.connect(URL) as db:
        # Explicit operator sandbox rate: not inferred from a random fixture.
        db.execute("UPDATE city_mine_rates SET base_units_per_day=2000 "
                   "WHERE city_id=%s AND resource='gold'",(city["city"],))
        db.execute("UPDATE city_stocks SET amount=%s,capacity=50000 "
                   "WHERE city_id=%s AND resource='gold'",
                   (starting_gold,city["city"]))
    root=f"/api/v1/me/cities/{city['city']}"
    who=headers(city["username"])
    mission=client.post(root+"/missions",headers=who,json={
        "mission_id":str(uuid4()),"hero_id":str(hero),
        "encounter_id":str(encounter),"unit_code":unit,
    })
    assert mission.status_code==201,mission.text
    with psycopg.connect(URL,autocommit=True) as db:
        from mmhk_api.pve_missions import advance_pve_missions
        progress=advance_pve_missions(
            db,now_at=datetime.fromisoformat(mission.json()["arrival_due_at"]),
        )
        assert progress[0]["phase"]=="arrived"
        # The hero must actually return to become available to construct.
        report=client.get(root+"/missions/"+mission.json()["mission_id"]+"/report",
                          headers=who)
        assert report.status_code==200
        returned=advance_pve_missions(
            db,now_at=datetime.fromisoformat(report.json()["return_due_at"]),
        )
        assert returned[0]["phase"]=="returned"
    activation=client.post(root+"/mine-unlocks/gold/activate",
        headers=who,json={"order_id":str(uuid4())})
    assert activation.status_code==201,activation.text
    if approve:
        with psycopg.connect(URL) as db:
            proof=qualify_lab_mine_upgrade(
                db,city_id=city["city"],resource="gold",target_level=2,
                required_hero_level=threshold,
                source_ref="LAB-HERO-G11-LEVEL-V106",
            )
            assert proof["current_level"]==1
    return hero,started,root,who


def _gold(db,city):
    return db.execute(
        "SELECT amount FROM city_stocks WHERE city_id=%s AND resource='gold'",
        (city,),
    ).fetchone()[0]


def test_g11_normal_price_duration_and_known_upgrade_levels():
    for resource in ("gold","wood","ore","crystal","gems","sulfur","mercury"):
        first=quote_g11_normal_step(resource,1)
        final=quote_g11_normal_step(resource,9)
        assert first["cost_gold"]==1000
        assert first["duration_seconds"]==3600
        assert final["cost_gold"]==55000
        assert final["duration_seconds"]==55*3600
        assert Decimal(first["new_rate"])==Decimal(first["old_rate"])*2
    for level in (0,10,-1,True,"1"):
        with pytest.raises(ValueError):
            quote_g11_normal_step("gold",level)


def test_unqualified_lab_mine_has_no_executable_quote(city):
    hero,started,root,who=_qualified_g11_gold(city,approve=False)
    response=client.get(root+"/mine-upgrades",headers=who)
    assert response.status_code==200,response.text
    assert response.json()["mines"]==[]
    before=client.get(root,headers=who).json()["stocks"]["gold"]
    denied=client.post(root+"/mine-upgrades",headers=who,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    })
    assert denied.status_code==409,denied.text
    assert client.get(root,headers=who).json()["stocks"]["gold"]==before


def test_hero_threshold_rejected_before_any_gold_debit(city):
    hero,started,root,who=_qualified_g11_gold(city,threshold=2)
    response=client.get(root+"/mine-upgrades",headers=who)
    assert response.status_code==200
    mine=response.json()["mines"][0]
    assert mine["level"]==1 and mine["required_hero_level"]==2
    assert mine["quote"]["cost_gold"]==1000
    order=client.post(root+"/mine-upgrades",headers=who,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    })
    assert order.status_code==409
    with psycopg.connect(URL) as db:
        assert _gold(db,city["city"])==12000
        assert db.execute("SELECT count(*) FROM city_lab_mine_upgrade_orders "
                          "WHERE city_id=%s",(city["city"],)).fetchone()[0]==0


def test_real_paid_upgrade_replay_and_correct_tick_boundary(city):
    hero,started,root,who=_qualified_g11_gold(city)
    other=headers(city["enemyname"])
    assert client.get(root+"/mine-upgrades",headers=other).status_code==404
    assert client.get(root+"/mine-upgrades").status_code==401
    aid=str(uuid4())
    order=client.post(root+"/mine-upgrades",headers=who,json={
        "order_id":aid,"hero_id":str(hero),"resource":"gold",
    })
    assert order.status_code==201,order.text
    receipt=order.json()
    assert receipt["target_level"]==2 and receipt["status"]=="building"
    assert receipt["cost_gold"]==1000 and receipt["replayed"] is False
    assert client.post(root+"/mine-upgrades",headers=other,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    }).status_code==404
    again=client.post(root+"/mine-upgrades",headers=who,json={
        "order_id":aid,"hero_id":str(hero),"resource":"gold",
    })
    assert again.status_code==200,again.text
    assert again.json()["replayed"] is True
    assert again.json()["due_at"]==receipt["due_at"]
    assert client.post(root+"/mine-upgrades",headers=who,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    }).status_code==409
    with psycopg.connect(URL) as db:
        assert _gold(db,city["city"])==11000
        assert db.execute("SELECT level FROM city_lab_mine_levels "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==1
        assert db.execute("SELECT base_units_per_day FROM city_mine_rates "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==2000
    # The job is due shortly after 'started + 1 hour', so TWO entire
    # ticks still started before due_at. No period is retroactively repriced.
    due=datetime.fromisoformat(receipt["due_at"])
    assert started+timedelta(hours=1)<due<started+timedelta(hours=2)
    with psycopg.connect(URL,autocommit=True) as db:
        first=run_economy_batch(db,now_at=started+timedelta(hours=3),
                                max_cities=1)[0]
        assert first["ticks"]==1
        # V104 first splits at activation: the tick begun BEFORE the
        # player opened the mine earns no gold at all.
        assert first["credits"]["gold"]==0
        assert first["upgrades_completed"]==[]
        middle=run_economy_batch(db,now_at=started+timedelta(hours=3),
                                 max_cities=1)[0]
        assert middle["ticks"]==1
        assert middle["credits"]["gold"]==83
        assert middle["upgrades_completed"][0]["target_level"]==2
        later=run_economy_batch(db,now_at=started+timedelta(hours=3),
                                max_cities=1)[0]
        assert later["ticks"]==1
        # Fractional carry is retained at 18 decimals. A one-unit credit
        # may move to the following tick when 1/3 + 2/3 is truncated.
        assert later["credits"]["gold"]==166
        assert later["upgrades_completed"]==[]
        assert run_economy_batch(db,now_at=started+timedelta(hours=3))==[]
    with psycopg.connect(URL) as db:
        assert _gold(db,city["city"])==11249
        carry=db.execute("SELECT fractional_units FROM city_mine_rates "
                         "WHERE city_id=%s AND resource='gold'",
                         (city["city"],)).fetchone()[0]
        assert carry >= Decimal("0.999999999999999998")
        assert db.execute("SELECT level FROM city_lab_mine_levels "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==2
        assert db.execute("SELECT base_units_per_day FROM city_mine_rates "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==4000
        assert db.execute("SELECT status,completed_at FROM city_lab_mine_upgrade_orders "
                          "WHERE order_id=%s",(aid,)).fetchone()[0]=="completed"
        assert db.execute("SELECT count(*) FROM city_lab_mine_upgrade_orders "
                          "WHERE order_id=%s",(aid,)).fetchone()[0]==1
    with psycopg.connect(URL,autocommit=True) as db:
        fourth=run_economy_batch(db,now_at=started+timedelta(hours=4),
                                 max_cities=1)[0]
        assert fourth["credits"]["gold"]==167
        assert fourth["upgrades_completed"]==[]
        assert run_economy_batch(db,now_at=started+timedelta(hours=4))==[]
    with psycopg.connect(URL) as db:
        # 83 + 166 + 167 = 416; no old tick was repriced.
        assert _gold(db,city["city"])==11416
    current=client.get(root+"/mine-upgrades",headers=who).json()
    assert current["mines"][0]["level"]==2
    assert current["mines"][0]["quote"] is None


def test_g11_insufficient_gold_and_immutable_qualification(city):
    hero,started,root,who=_qualified_g11_gold(city,starting_gold=300)
    with psycopg.connect(URL) as db:
        with pytest.raises(ValueError,match="immutable"):
            qualify_lab_mine_upgrade(
                db,city_id=city["city"],resource="gold",target_level=2,
                required_hero_level=7,source_ref="LAB-HERO-G11-LEVEL-V106",
            )
    response=client.post(root+"/mine-upgrades",headers=who,json={
        "order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold",
    })
    assert response.status_code==409,response.text
    with psycopg.connect(URL) as db:
        assert _gold(db,city["city"])==300
        assert db.execute("SELECT count(*) FROM city_lab_mine_upgrade_orders "
                          "WHERE city_id=%s",(city["city"],)).fetchone()[0]==0


def test_order_facts_protected_from_admin_rewriting(city):
    hero,started,root,who=_qualified_g11_gold(city)
    aid=str(uuid4())
    started_order=client.post(root+"/mine-upgrades",headers=who,json={
        "order_id":aid,"hero_id":str(hero),"resource":"gold",
    })
    assert started_order.status_code==201
    for stmt in (
        "UPDATE city_lab_mine_upgrade_orders SET cost_gold=0 WHERE order_id=%s",
        "UPDATE city_lab_mine_upgrade_orders SET old_rate=1 WHERE order_id=%s",
        "UPDATE city_lab_mine_upgrade_orders SET status='completed',"
        "completed_at=started_at WHERE order_id=%s",
    ):
        with psycopg.connect(URL) as db:
            with pytest.raises(psycopg.errors.CheckViolation):
                db.execute(stmt,(aid,))
    with psycopg.connect(URL) as db:
        assert _gold(db,city["city"])==11000
        assert db.execute("SELECT status FROM city_lab_mine_upgrade_orders "
                          "WHERE order_id=%s",(aid,)).fetchone()[0]=="building"



def test_immutable_hero_qualification_and_direct_level_cheating_blocked(city):
    hero,started,root,who=_qualified_g11_gold(city)
    statements=(
        ("UPDATE city_lab_mine_levels SET level=2 "
         "WHERE city_id=%s AND resource='gold'",(city["city"],)),
        ("UPDATE city_lab_mine_level_qualifications "
         "SET required_hero_level=99 WHERE city_id=%s AND resource='gold'",
         (city["city"],)),
        ("DELETE FROM city_lab_mine_level_qualifications "
         "WHERE city_id=%s AND resource='gold'",(city["city"],)),
    )
    for query,args in statements:
        with psycopg.connect(URL) as db:
            with pytest.raises(psycopg.errors.CheckViolation):
                db.execute(query,args)
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT level FROM city_lab_mine_levels "
                          "WHERE city_id=%s AND resource='gold'",
                          (city["city"],)).fetchone()[0]==1


def test_occupied_hero_and_revoked_lab_world_refuse_before_debit(city):
    hero,started,root,who=_qualified_g11_gold(city)
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_heroes SET status='wounded' WHERE hero_id=%s",
                   (hero,))
    payload={"order_id":str(uuid4()),"hero_id":str(hero),"resource":"gold"}
    assert client.post(root+"/mine-upgrades",headers=who,json=payload).status_code==409
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_heroes SET status='idle' WHERE hero_id=%s",(hero,))
        db.execute("UPDATE pve_travel_policies SET policy_id='REVOKED-LAB-V106' "
                   "WHERE world_id=%s",(city["world"],))
    assert client.get(root+"/mine-upgrades",headers=who).json()["mines"]==[]
    denied=client.post(root+"/mine-upgrades",headers=who,json=payload)
    assert denied.status_code==409,denied.text
    with psycopg.connect(URL) as db:
        assert _gold(db,city["city"])==12000
        assert db.execute("SELECT count(*) FROM city_lab_mine_upgrade_orders "
                          "WHERE city_id=%s",(city["city"],)).fetchone()[0]==0
