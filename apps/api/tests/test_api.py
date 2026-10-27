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
    assert set(paths) == {"/api/v1/health", "/api/v1/jactari/status"}
