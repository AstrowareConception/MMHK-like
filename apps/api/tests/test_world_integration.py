"""PostgreSQL integration: real migrations, sessions and account isolation.

Without MMHK_TEST_DATABASE_URL these tests are skipped locally. GitHub Actions
starts a disposable PostgreSQL service and executes the complete set.
"""
from __future__ import annotations

import os
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient

from mmhk_api.db import migrate
from mmhk_api.main import app
from mmhk_api.security import create_account
from mmhk_api.worlds import HAVEN_FIRST_MINES, seed_first_haven_city

URL = os.environ.get("MMHK_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not URL, reason="MMHK_TEST_DATABASE_URL not configured")
client = TestClient(app)


@pytest.fixture
def scenario(monkeypatch):
    assert URL is not None
    monkeypatch.setenv("MMHK_DATABASE_URL", URL)
    with psycopg.connect(URL) as db:
        migrate(db)
        name = "p" + uuid4().hex[:14]
        enemy = "e" + uuid4().hex[:14]
        player = create_account(db, name, "secure-test-password-123")
        outsider = create_account(db, enemy, "secure-test-password-456")
        world_id = "w-" + uuid4().hex[:16]
        other_id = "w-" + uuid4().hex[:16]
        city = seed_first_haven_city(
            db, world_id=world_id, world_name="Monde de test",
            size=100, account_id=player, city_name="Havre",
            x=1, y=100,
        )
        other_city = seed_first_haven_city(
            db, world_id=other_id, world_name="Autre monde",
            size=70, account_id=outsider, city_name="Ville étrangère",
            x=3, y=4, amounts={"gold": 120},
        )
    yield {
        "username": name, "other_name": enemy,
        "world_id": world_id, "other_id": other_id,
        "city": str(city), "other_city": str(other_city),
        "player": player, "outsider": outsider,
    }
    with psycopg.connect(URL) as db:
        # Dependents intentionally use restrictive foreign keys in the game.
        db.execute("DELETE FROM cities WHERE world_id IN (%s,%s)",
                   (world_id, other_id))
        db.execute("DELETE FROM world_memberships WHERE world_id IN (%s,%s)",
                   (world_id, other_id))
        db.execute("DELETE FROM worlds WHERE world_id IN (%s,%s)",
                   (world_id, other_id))
        db.execute("DELETE FROM accounts WHERE account_id IN (%s,%s)",
                   (player, outsider))


def _headers(username: str, password: str) -> tuple[str, dict]:
    answer = client.post("/api/v1/sessions",
                         json={"username": username, "password": password})
    assert answer.status_code == 200, answer.text
    token = answer.json()["access_token"]
    return token, {"Authorization": "Bearer " + token}


def test_schema_migration_is_reusable(scenario):
    with psycopg.connect(URL) as db:
        assert migrate(db) == []
        rows = db.execute("SELECT version FROM app_schema_migrations").fetchall()
        assert rows == [(1,), (2,), (3,), (4,), (5,), (6,), (7,), (8,), (9,)]


def test_private_world_and_city_are_readable_only_by_their_owner(scenario):
    assert client.get("/api/v1/me/worlds").status_code == 401
    assert client.get(f"/api/v1/me/cities/{scenario['city']}").status_code == 401
    assert client.post("/api/v1/sessions", json={
        "username": scenario["username"], "password": "wrong-password"
    }).status_code == 401

    token, headers = _headers(scenario["username"], "secure-test-password-123")
    world = client.get("/api/v1/me/worlds", headers=headers)
    assert world.status_code == 200
    assert world.json() == [{
        "world_id": scenario["world_id"],
        "name": "Monde de test",
        "world_size": 100,
    }]
    cities = client.get(
        f"/api/v1/me/worlds/{scenario['world_id']}/cities", headers=headers
    )
    assert cities.status_code == 200
    assert len(cities.json()) == 1
    assert cities.json()[0]["city_id"] == scenario["city"]
    assert cities.json()[0]["first_city"] is True
    detail = client.get(f"/api/v1/me/cities/{scenario['city']}", headers=headers)
    assert detail.status_code == 200
    data = detail.json()
    assert data["world_id"] == scenario["world_id"]
    assert data["stocks"] == {
        kind: 0 for kind in
        ("gold", "wood", "ore", "crystal", "gems", "sulfur", "mercury")
    }
    assert set(data["mines"]) == set(HAVEN_FIRST_MINES)
    assert data["production_active"] is False
    assert data["historical_economy_certified"] is False

    _, enemy_headers = _headers(scenario["other_name"], "secure-test-password-456")
    assert client.get(f"/api/v1/me/cities/{scenario['city']}",
                      headers=enemy_headers).status_code == 404
    assert client.get(f"/api/v1/me/worlds/{scenario['world_id']}/cities",
                      headers=enemy_headers).status_code == 404
    assert client.get(f"/api/v1/me/cities/{scenario['other_city']}",
                      headers=headers).status_code == 404
    assert client.get(f"/api/v1/me/worlds/{scenario['other_id']}/cities",
                      headers=headers).status_code == 404

    # A session is stored as SHA-256, never the plaintext bearer.
    with psycopg.connect(URL) as db:
        rows = db.execute("SELECT token_digest FROM sessions WHERE account_id=%s",
                          (scenario["player"],)).fetchall()
        assert rows and bytes(rows[0][0]) != token.encode("ascii")


def test_expiring_and_revoking_sessions(scenario):
    token, headers = _headers(scenario["username"], "secure-test-password-123")
    assert client.get("/api/v1/me/worlds", headers=headers).status_code == 200
    assert client.delete("/api/v1/sessions/current", headers=headers).status_code == 204
    assert client.get("/api/v1/me/worlds", headers=headers).status_code == 401

    _, headers = _headers(scenario["username"], "secure-test-password-123")
    with psycopg.connect(URL) as db:
        db.execute("UPDATE sessions SET expires_at=now() - interval '1 minute' "
                   "WHERE account_id=%s", (scenario["player"],))
    assert client.get("/api/v1/me/worlds", headers=headers).status_code == 401


def test_server_rejects_cross_world_or_invalid_seed_data(scenario):
    with psycopg.connect(URL) as db:
        with pytest.raises(ValueError, match="outside"):
            seed_first_haven_city(
                db, world_id="invalid-" + uuid4().hex[:12],
                world_name="Erreur", size=50, account_id=scenario["player"],
                city_name="Trop loin", x=51, y=1,
            )
        with pytest.raises(ValueError, match="stock"):
            seed_first_haven_city(
                db, world_id="bad-" + uuid4().hex[:12],
                world_name="Erreur", size=50, account_id=scenario["player"],
                city_name="Ressources invalides", x=2, y=1,
                amounts={"crystal": -1},
            )
        with pytest.raises(psycopg.errors.UniqueViolation):
            with db.transaction():
                db.execute(
                    """INSERT INTO cities(city_id,world_id,owner_account_id,
                         name,x,y,first_city) VALUES(%s,%s,%s,%s,%s,%s,true)""",
                    (uuid4(), scenario["world_id"], scenario["player"],
                     "Autre capitale", 10, 10),
                )


def test_no_public_undocumented_city_mutations_or_combat(scenario):
    _, headers = _headers(scenario["username"], "secure-test-password-123")
    for pathname in (
        "/api/v1/battles",
        "/api/v1/jactari/duel",
        "/api/v1/me/cities",
        "/api/v1/me/worlds",
    ):
        assert client.post(pathname, json={}, headers=headers).status_code in (404, 405)
