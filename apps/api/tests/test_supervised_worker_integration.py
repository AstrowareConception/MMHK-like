"""Live PostgreSQL health and isolation for supervised workers."""
from __future__ import annotations

import os
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import psycopg
import pytest

from mmhk_api.construction import configure_building_profile, start_construction
from mmhk_api.db import migrate
from mmhk_api.economy import configure_haven_mines
from mmhk_api.security import create_account
from mmhk_api.supervised_worker import (
    check_health, identity, iteration, update_heartbeat,
)
from mmhk_api.worlds import seed_first_haven_city

URL = os.environ.get("MMHK_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not URL, reason="PostgreSQL test URL not configured")

def _costs():
    return {r: 2 if r == "gold" else 0 for r in
            ("gold", "wood", "ore", "crystal", "gems", "sulfur", "mercury")}

@pytest.fixture
def context(monkeypatch):
    assert URL is not None
    monkeypatch.setenv("MMHK_DATABASE_URL", URL)
    ident = uuid4().hex[:16]
    with psycopg.connect(URL) as db:
        migrate(db)
        account=create_account(db,"worker"+ident,"worker-test-password-123")
        world="workers-"+ident
        city=seed_first_haven_city(
            db,world_id=world,world_name="Worker simulation",
            size=50,account_id=account,city_name="Worker city",
            x=1,y=1,amounts={"gold":50},
        )
        building="tower_"+ident
        configure_building_profile(
            db,building_code=building,target_level=1,policy_id="WORKER-TEST",
            base_seconds=60,base_costs=_costs(),
        )
        configure_haven_mines(
            db,city_id=city,tick_seconds=3600,
            started_at=datetime.now(UTC)-timedelta(hours=2),
            rates_per_day={"gold":"24","wood":"0","ore":"0","crystal":"0"},
            capacities={r:100 for r in ("gold","wood","ore","crystal")},
        )
        order=start_construction(
            db,account_id=account,city_id=city,order_id=uuid4(),
            building_code=building,mode="normal",
        )
        # Test fixture only: reschedule the entire interval into the past.
        db.execute(
            """UPDATE urban_construction_orders
               SET started_at=clock_timestamp()-interval '2 hour',
                   due_at=clock_timestamp()-interval '1 hour'
               WHERE order_id=%s""",(order["order_id"],),
        )
    worker_id="worker_"+ident
    yield {"worker_id":worker_id,"account":account,"world":world,
           "city":city,"building":building,"order":order["order_id"]}
    with psycopg.connect(URL) as db:
        db.execute("DELETE FROM app_worker_heartbeats WHERE worker_id=%s",
                   (worker_id,))
        db.execute("DELETE FROM cities WHERE city_id=%s",(city,))
        db.execute("DELETE FROM world_memberships WHERE world_id=%s",(world,))
        db.execute("DELETE FROM worlds WHERE world_id=%s",(world,))
        db.execute("DELETE FROM accounts WHERE account_id=%s",(account,))
        db.execute("DELETE FROM urban_building_profiles WHERE building_code=%s",
                   (building,))

def test_supervisor_commits_both_domains_once_and_writes_healthy_heartbeat(context):
    with psycopg.connect(URL,autocommit=True) as db:
        result=iteration(
            db,worker_id=context["worker_id"],number=1,total_failures=0,
            max_cities=1,max_orders=1,max_ticks_per_city=2,
        )
        assert result["state"]=="healthy"
        assert result["counts"]=={"economy":1,"construction":1}
        assert check_health(db,context["worker_id"])
        order=db.execute(
            "SELECT status FROM urban_construction_orders WHERE order_id=%s",
            (context["order"],),
        ).fetchone()
        assert order == ("completed",)
        credit=db.execute(
            "SELECT SUM((credits->>'gold')::int) FROM city_economy_events WHERE city_id=%s",
            (context["city"],),
        ).fetchone()[0]
        assert credit == 2
        second=iteration(
            db,worker_id=context["worker_id"],number=2,total_failures=0,
            max_cities=1,max_orders=1,max_ticks_per_city=2,
        )
        assert second["counts"]["construction"]==0
        assert db.execute(
            "SELECT COUNT(*) FROM urban_construction_events WHERE order_id=%s AND phase='completed'",
            (context["order"],),
        ).fetchone()[0] == 1

def test_degraded_worker_is_not_healthy_and_other_domain_still_runs(context):
    def fail_economy(_db,**_args):
        raise RuntimeError("Synthetic unavailable economic policy")
    with psycopg.connect(URL,autocommit=True) as db:
        result=iteration(
            db,worker_id=context["worker_id"],number=1,total_failures=0,
            max_cities=1,max_orders=1,max_ticks_per_city=2,
            economy_fn=fail_economy,
        )
        assert result["state"]=="degraded"
        assert result["error_kinds"]==["economy"]
        assert result["counts"]["construction"]==1
        assert not check_health(db,context["worker_id"])
        assert db.execute(
            "SELECT failures,last_error_kind FROM app_worker_heartbeats WHERE worker_id=%s",
            (context["worker_id"],),
        ).fetchone() == (1,"economy")
        ok=iteration(db,worker_id=context["worker_id"],number=2,
            total_failures=1,max_cities=1,max_orders=1,max_ticks_per_city=2)
        assert ok["state"]=="healthy"
        assert check_health(db,context["worker_id"])

def test_stale_or_stopped_heartbeat_fails_probe(context):
    with psycopg.connect(URL,autocommit=True) as db:
        update_heartbeat(db,worker_id=context["worker_id"],iteration=1,
            economy_count=0,construction_count=0,failures=0,state="healthy")
        assert check_health(db,context["worker_id"])
        db.execute(
            """UPDATE app_worker_heartbeats
               SET heartbeat_at=clock_timestamp()-interval '200 seconds'
               WHERE worker_id=%s""",(context["worker_id"],),
        )
        assert not check_health(db,context["worker_id"])
        update_heartbeat(db,worker_id=context["worker_id"],iteration=2,
            economy_count=0,construction_count=0,failures=0,state="stopped")
        assert not check_health(db,context["worker_id"])
        assert not check_health(db,"unknown_worker")

def test_worker_ids_must_be_safe_and_health_parameters_are_bounded():
    for bad in ("", "contains space", "../etc/passwd", "a"*65):
        with pytest.raises(ValueError):
            identity(bad) if bad else identity("invalid worker id")
    if URL:
        with psycopg.connect(URL,autocommit=True) as db:
            for invalid in (0,3,3601):
                with pytest.raises(ValueError):
                    check_health(db,"harmless_id",max_age_seconds=invalid)
