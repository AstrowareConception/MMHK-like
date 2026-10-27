"""Real PostgreSQL tests for versioned building effects and prerequisites."""
from __future__ import annotations
import os
from datetime import timedelta
from decimal import Decimal
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient

from mmhk_api.db import migrate
from mmhk_api.main import app
from mmhk_api.security import create_account
from mmhk_api.worlds import seed_first_haven_city
from mmhk_api.construction import (
    ConstructionConflict, catalog_for_city, configure_building_profile,
    run_construction_batch, start_construction,
)
from mmhk_api.building_effects import (
    configure_effect_profile, resolve_city_effects, set_building_operational,
)
from mmhk_api.economy import configure_haven_mines, run_economy_batch

URL=os.getenv("MMHK_TEST_DATABASE_URL")
pytestmark=pytest.mark.skipif(not URL,reason="No test PostgreSQL configured")
RES=("gold","wood","ore","crystal","gems","sulfur","mercury")
def costs(gold=0):
    return {r:gold if r=="gold" else 0 for r in RES}

@pytest.fixture
def site(monkeypatch):
    assert URL
    monkeypatch.setenv("MMHK_DATABASE_URL",URL)
    with psycopg.connect(URL) as db:
        migrate(db)
        acc_name="eff"+uuid4().hex[:14]
        user=create_account(db,acc_name,"effect-test-password-123")
        world="effects-"+uuid4().hex[:12]
        city=seed_first_haven_city(db,world_id=world,world_name="Lab",size=50,
            account_id=user,city_name="Havre",x=2,y=2,
            amounts={"gold":25})
        base="store_"+uuid4().hex[:12]
        bonus="forge_"+uuid4().hex[:12]
        for code in (base,bonus):
            configure_building_profile(db,building_code=code,target_level=1,
                policy_id="LAB-EFFECTS-V1",base_seconds=60,base_costs=costs(1))
        configure_effect_profile(db,building_code=base,target_level=1,
            policy_id="LAB-EXPERIMENTAL-001",prerequisites={},
            mine_additive_bonus={"gold":"0.5"},capacity_bonus={"gold":10})
        configure_effect_profile(db,building_code=bonus,target_level=1,
            policy_id="LAB-EXPERIMENTAL-001",prerequisites={base:1},
            mine_additive_bonus={"gold":"0.25"},capacity_bonus={"gold":5})
    yield {"city":city,"user":user,"name":acc_name,"world":world,
           "base":base,"bonus":bonus}
    with psycopg.connect(URL) as db:
        db.execute("DELETE FROM cities WHERE city_id=%s",(city,))
        db.execute("DELETE FROM world_memberships WHERE world_id=%s",(world,))
        db.execute("DELETE FROM worlds WHERE world_id=%s",(world,))
        db.execute("DELETE FROM accounts WHERE account_id=%s",(user,))
        db.execute("DELETE FROM urban_effect_profiles WHERE building_code IN (%s,%s)",
                   (base,bonus))
        db.execute("DELETE FROM urban_building_profiles WHERE building_code IN (%s,%s)",
                   (base,bonus))

def start(db,site,code):
    return start_construction(db,account_id=site["user"],city_id=site["city"],
        order_id=uuid4(),building_code=code,mode="normal")

def settle(db,order):
    return run_construction_batch(db,now_at=order["due_at"],max_orders=1)

def get_gold(db,city):
    return db.execute("SELECT amount FROM city_stocks WHERE city_id=%s AND resource='gold'",
                      (city,)).fetchone()[0]

def test_prereq_gate_complete_activation_and_operator_suspension(site):
    with psycopg.connect(URL,autocommit=True) as db:
        options=catalog_for_city(db,site["user"],site["city"])["options"]
        by_code={o["building_code"]:o for o in options}
        assert by_code[site["base"]]["available"] is True
        assert by_code[site["bonus"]]["available"] is False
        assert by_code[site["bonus"]]["missing_prerequisites"]==[site["base"]]
        with pytest.raises(ConstructionConflict,match="prerequisites"):
            start(db,site,site["bonus"])
        before=get_gold(db,site["city"])
        first=start(db,site,site["base"])
        assert before-get_gold(db,site["city"])==1
        assert settle(db,first)[0]["target_level"]==1
        effects=resolve_city_effects(db,site["city"])
        assert effects["mine_additive_bonus"]["gold"]=="0.5"
        assert effects["capacity_bonus"]["gold"]==10
        assert catalog_for_city(db,site["user"],site["city"])["options"][0]["available"]
        second=start(db,site,site["bonus"])
        assert settle(db,second)[0]["target_level"]==1
        effects=resolve_city_effects(db,site["city"])
        assert Decimal(effects["mine_additive_bonus"]["gold"])==Decimal("0.75")
        assert effects["capacity_bonus"]["gold"]==15
        inactive=set_building_operational(db,city_id=site["city"],
            building_code=site["base"],enabled=False)
        assert all(not x["active"] for x in inactive["buildings"])
        assert inactive["mine_additive_bonus"]=={}
        assert inactive["capacity_bonus"]=={}
        # Built structures persist: they are inactive, not deleted.
        assert len(inactive["buildings"])==2
        restored=set_building_operational(db,city_id=site["city"],
            building_code=site["base"],enabled=True)
        assert all(x["active"] for x in restored["buildings"])
        assert restored["capacity_bonus"]["gold"]==15
        count=db.execute("SELECT count(*) FROM city_economy_effect_snapshots WHERE city_id=%s",
                         (site["city"],)).fetchone()[0]
        assert count==4 # two completions + suspension + reactivation
        assert run_construction_batch(db,now_at=second["due_at"]+timedelta(days=2))==[]

def test_effects_are_not_backdated_into_precompletion_economy_ticks(site):
    with psycopg.connect(URL,autocommit=True) as db:
        # Fixed rate 24/day, 1 unit per hour; storage base 40.
        first=start(db,site,site["base"])
        started=first["started_at"]
        base=started-timedelta(hours=2,minutes=10)
        configure_haven_mines(db,city_id=site["city"],tick_seconds=3600,
            started_at=base,
            rates_per_day={"gold":"24","wood":"0","ore":"0","crystal":"0"},
            capacities={"gold":100,"wood":100,"ore":100,"crystal":100})
        before=run_economy_batch(db,now_at=first["due_at"]-timedelta(seconds=1),
                                 max_cities=1)
        assert before[0]["credits"]["gold"]==2
        assert settle(db,first)[0]["target_level"]==1
        snapshot=db.execute(
            "SELECT effective_at FROM city_economy_effect_snapshots WHERE city_id=%s",
            (site["city"],)).fetchone()[0]
        assert snapshot==first["due_at"]
        # Existing partial period began before completion: old base applies.
        e1=run_economy_batch(db,now_at=base+timedelta(hours=3),max_cities=1)
        assert e1[0]["credits"]["gold"]==1
        # Next period starts after effect activation, so 50% bonus accrues.
        e2=run_economy_batch(db,now_at=base+timedelta(hours=4),max_cities=1)
        assert e2[0]["credits"]["gold"]==1
        fraction=db.execute(
            "SELECT fractional_units FROM city_mine_rates WHERE city_id=%s AND resource='gold'",
            (site["city"],)).fetchone()[0]
        assert fraction==Decimal("0.5")
        assert run_economy_batch(db,now_at=base+timedelta(hours=4),max_cities=1)==[]
        # Next two ticks use the accrued fraction, becoming 3 integer credits.
        e3=run_economy_batch(db,now_at=base+timedelta(hours=6),max_cities=1)
        assert e3[0]["credits"]["gold"]==3
        detail=TestClient(app).post("/api/v1/sessions",json={
            "username":site["name"],"password":"effect-test-password-123"})
        assert detail.status_code==200
        h={"Authorization":"Bearer "+detail.json()["access_token"]}
        body=TestClient(app).get(f"/api/v1/me/cities/{site['city']}",headers=h)
        assert body.status_code==200
        data=body.json()
        assert Decimal(data["production_per_day"]["gold"])==Decimal("36")
        assert data["stock_capacities"]["gold"]==110
        assert data["building_effects"]["capacity_bonus"]["gold"]==10

def test_policy_is_versioned_insert_only_and_nonretroactive(site):
    with psycopg.connect(URL,autocommit=True) as db:
        with pytest.raises(psycopg.errors.UniqueViolation):
            configure_effect_profile(db,building_code=site["base"],target_level=1,
                policy_id="LAB-OTHER",prerequisites={},
                mine_additive_bonus={"gold":"0.1"},capacity_bonus={})
        with pytest.raises(ValueError,match="Bonus"):
            configure_effect_profile(db,building_code=site["bonus"],target_level=1,
                policy_id="INVALID",prerequisites={},
                mine_additive_bonus={"gold":"nan"},capacity_bonus={})
        first=start(db,site,site["base"])
        settle(db,first)
        with pytest.raises(ValueError,match="retroactive"):
            configure_effect_profile(db,building_code=site["base"],target_level=1,
                policy_id="REWRITE",prerequisites={},
                mine_additive_bonus={"gold":"0"},capacity_bonus={})
