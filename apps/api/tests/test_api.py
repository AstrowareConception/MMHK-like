"""FastAPI contract tests: status only, no public battle execution."""
from fastapi.testclient import TestClient
from mmhk_api.main import app

client = TestClient(app)


def test_live_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "service": "mmhk-api"}


def test_jactari_reports_experimental_status():
    r = client.get("/api/v1/jactari/status")
    assert r.status_code == 200
    assert r.json() == {
        "engine": "Jactari",
        "python_port_scope": "single-stack-experimental",
        "js_oracle_retained": True,
        "historically_certified_s2": False,
        "public_battle_api_enabled": False,
    }


def test_combat_not_publicly_exposed():
    for method in (client.get, client.post):
        assert method("/api/v1/jactari/duel").status_code == 404
        assert method("/api/v1/battles").status_code == 404


def test_openapi_contains_no_unapproved_game_commands():
    paths = client.get("/openapi.json").json()["paths"]
    assert set(paths) == {
        "/api/v1/health",
        "/api/v1/jactari/status",
        "/api/v1/sessions",
        "/api/v1/sessions/current",
        "/api/v1/me/timeline",
        "/api/v1/me/worlds",
        "/api/v1/me/worlds/{world_id}/cities",
        "/api/v1/me/cities/{city_id}",
        "/api/v1/me/cities/{city_id}/construction",
        "/api/v1/me/cities/{city_id}/forces",
        "/api/v1/me/cities/{city_id}/recruit",
        "/api/v1/me/cities/{city_id}/heroes/hire",
        "/api/v1/me/cities/{city_id}/forces/transfer",
        "/api/v1/me/cities/{city_id}/artifacts",
        "/api/v1/me/cities/{city_id}/artifacts/move",
        "/api/v1/me/cities/{city_id}/encounters/{encounter_id}/preview",
        "/api/v1/me/worlds/{world_id}/overview",
        "/api/v1/me/cities/{city_id}/region",
    }
    assert not any("battle" in path or "duel" in path for path in paths)
