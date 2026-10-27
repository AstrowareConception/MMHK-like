"""Real PostgreSQL economic production, concurrency and saturation tests."""
from __future__ import annotations

import os
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient

from mmhk_api.db import migrate
from mmhk_api.economy import configure_haven_mines, run_economy_batch
from mmhk_api.main import app
from mmhk_api.security import create_account
from mmhk_api.worlds import seed_first_haven_city

URL = os.getenv("MMHK_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not URL, reason="No PostgreSQL test URL")

START = datetime(2026, 1, 1, tzinfo=UTC)
HOUR = timedelta(hours=1)


@pytest.fixture
def city(monkeypatch):
    assert URL
    monkeypatch.setenv("MMHK_DATABASE_URL", URL)
    with psycopg.connect(URL) as db:
        migrate(db)
        account = create_account(db, "econ" + uuid4().hex[:12], "strong-demo-test-password")
        world_id = "eco-" + uuid4().hex[:15]
        city_id = seed_first_haven_city(
            db, world_id=world_id, world_name="Economic test", size=100,
            account_id=account, city_name="Capital", x=1, y=1,
        )
    yield city_id
    with psycopg.connect(URL) as db:
        db.execute("DELETE FROM cities WHERE city_id=%s", (city_id,))
        db.execute("DELETE FROM world_memberships WHERE world_id=%s", (world_id,))
        db.execute("DELETE FROM worlds WHERE world_id=%s", (world_id,))
        db.execute("DELETE FROM accounts WHERE account_id=%s", (account,))


def _config(db, city_id, *, rate_gold="3", rate_wood="0.5", cap=100, tick=3600):
    configure_haven_mines(
        db, city_id=city_id, tick_seconds=tick, started_at=START,
        rates_per_day={
            "gold": rate_gold, "wood": rate_wood, "ore": "0", "crystal": "0",
        },
        capacities={r: cap for r in ("gold", "wood", "ore", "crystal")},
    )


def _stock(db, city_id, kind):
    return db.execute(
        "SELECT amount FROM city_stocks WHERE city_id=%s AND resource=%s",
        (city_id, kind),
    ).fetchone()[0]


def _fraction(db, city_id, kind):
    return db.execute(
        "SELECT fractional_units FROM city_mine_rates WHERE city_id=%s AND resource=%s",
        (city_id, kind),
    ).fetchone()[0]


def test_frac_carry_and_idempotent_repeated_tick(city):
    with psycopg.connect(URL, autocommit=True) as db:
        _config(db, city)
        first = run_economy_batch(db, now_at=START + 4*HOUR)
        assert len(first) == 1 and first[0]["ticks"] == 4
        assert first[0]["credits"]["gold"] == 0
        assert _fraction(db, city, "gold") == Decimal("0.5")
        assert _stock(db, city, "gold") == 0
        assert run_economy_batch(db, now_at=START + 4*HOUR) == []
        second = run_economy_batch(db, now_at=START + 8*HOUR)
        assert second[0]["credits"]["gold"] == 1
        assert _stock(db, city, "gold") == 1
        assert _fraction(db, city, "gold") == 0
        assert len(db.execute(
            "SELECT 1 FROM city_economy_events WHERE city_id=%s",
            (city,),
        ).fetchall()) == 2
        assert db.execute(
            "SELECT revision FROM city_economy_clock WHERE city_id=%s",
            (city,),
        ).fetchone()[0] == 2


def test_remainder_persists_across_connection_reopen_and_no_clock_backdating(city):
    with psycopg.connect(URL, autocommit=True) as db:
        _config(db, city)
        assert run_economy_batch(db, now_at=START + 24*HOUR)[0]["credits"]["wood"] == 0
        assert _fraction(db, city, "wood") == Decimal("0.5")
    with psycopg.connect(URL, autocommit=True) as restarted:
        assert run_economy_batch(restarted, now_at=START + 48*HOUR)[0]["credits"]["wood"] == 1
        assert _stock(restarted, city, "wood") == 1
        assert _fraction(restarted, city, "wood") == 0
        assert run_economy_batch(restarted, now_at=START + 48*HOUR) == []
        assert run_economy_batch(restarted, now_at=START + HOUR) == []


def test_capacity_drops_excess_and_remainder_not_banked_when_full(city):
    with psycopg.connect(URL, autocommit=True) as db:
        _config(db, city, rate_gold="48", rate_wood="0", cap=3)
        first = run_economy_batch(db, now_at=START + 2*HOUR)
        assert first[0]["credits"]["gold"] == 3
        assert first[0]["overflow"]["gold"] == 1
        assert _stock(db, city, "gold") == 3
        assert _fraction(db, city, "gold") == 0
        second = run_economy_batch(db, now_at=START + 4*HOUR)
        assert second[0]["credits"]["gold"] == 0
        assert second[0]["overflow"]["gold"] == 4
        assert _stock(db, city, "gold") == 3
        assert _fraction(db, city, "gold") == 0


def test_unconfigured_city_does_not_earn_and_no_historical_rates_are_inserted(city):
    with psycopg.connect(URL, autocommit=True) as db:
        assert run_economy_batch(db, now_at=START + 365*24*HOUR) == []
        assert db.execute(
            "SELECT COUNT(*) FROM city_mine_rates WHERE city_id=%s", (city,)
        ).fetchone()[0] == 0
        assert _stock(db, city, "gold") == 0


def test_bounded_catchup_does_not_create_future_credit(city):
    with psycopg.connect(URL, autocommit=True) as db:
        _config(db, city, rate_gold="24", rate_wood="0")
        result = run_economy_batch(
            db, now_at=START + 10*HOUR, max_cities=1, max_ticks_per_city=2,
        )
        assert result[0]["ticks"] == 2
        assert _stock(db, city, "gold") == 2
        assert db.execute(
            "SELECT last_tick_at FROM city_economy_clock WHERE city_id=%s", (city,)
        ).fetchone()[0] == START + 2*HOUR
        result = run_economy_batch(
            db, now_at=START + 10*HOUR, max_cities=1, max_ticks_per_city=2,
        )
        assert result[0]["ticks"] == 2
        assert _stock(db, city, "gold") == 4


def test_two_workers_do_not_process_locked_city_simultaneously(city):
    with psycopg.connect(URL, autocommit=True) as db1, psycopg.connect(URL, autocommit=True) as db2:
        _config(db1, city, rate_gold="24", rate_wood="0")
        with db1.transaction():
            db1.execute(
                "SELECT city_id FROM city_economy_clock WHERE city_id=%s FOR UPDATE",
                (city,),
            )
            assert run_economy_batch(db2, now_at=START + HOUR) == []
        assert run_economy_batch(db2, now_at=START + HOUR)[0]["credits"]["gold"] == 1
        assert run_economy_batch(db1, now_at=START + HOUR) == []


def test_bad_rates_or_capacities_do_not_create_partial_configuration(city):
    with psycopg.connect(URL, autocommit=True) as db:
        for rates, caps in [
            ({"gold": "-1", "wood": "1", "ore": "1", "crystal": "1"}, {r: 100 for r in ("gold","wood","ore","crystal")}),
            ({"gold": "nan", "wood": "1", "ore": "1", "crystal": "1"}, {r: 100 for r in ("gold","wood","ore","crystal")}),
            ({"gold": "1", "wood": "1", "ore": "1", "crystal": "1"}, {"gold": -1, "wood": 100, "ore": 100, "crystal": 100}),
        ]:
            with pytest.raises(ValueError):
                configure_haven_mines(
                    db, city_id=city, rates_per_day=rates,
                    capacities=caps, tick_seconds=900, started_at=START,
                )
        assert db.execute(
            "SELECT COUNT(*) FROM city_economy_clock WHERE city_id=%s", (city,)
        ).fetchone()[0] == 0
        _config(db, city)
        with pytest.raises(psycopg.errors.UniqueViolation):
            _config(db, city)
        assert db.execute(
            "SELECT COUNT(*) FROM city_mine_rates WHERE city_id=%s", (city,)
        ).fetchone()[0] == 4


def test_authenticated_api_displays_economy_without_leaking_other_city(city):
    with psycopg.connect(URL, autocommit=True) as db:
        _config(db, city)
        run_economy_batch(db, now_at=START + 8*HOUR)
        account_name = db.execute(
            """SELECT a.username FROM accounts a
               JOIN cities c ON c.owner_account_id=a.account_id
               WHERE c.city_id=%s""", (city,)
        ).fetchone()[0]
    # Auth fixture created a strong password; the session token is returned
    # only after login and the account-scoped query.
    client = TestClient(app)
    answer = client.post("/api/v1/sessions", json={
        "username": account_name,
        "password": "strong-demo-test-password",
    })
    assert answer.status_code == 200
    headers = {"Authorization": "Bearer " + answer.json()["access_token"]}
    response = client.get(f"/api/v1/me/cities/{city}", headers=headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["production_active"] is True
    assert body["historical_economy_certified"] is False
    assert body["tick_seconds"] == 3600
    assert body["stocks"]["gold"] == 1
    assert Decimal(body["production_per_day"]["gold"]) == Decimal("3")
    assert body["next_credit_at"] is not None
    assert client.get(f"/api/v1/me/cities/{uuid4()}", headers=headers).status_code == 404
