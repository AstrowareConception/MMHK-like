"""Timeline HTTP contract: real construction jobs and per-account privacy."""
from datetime import datetime, timedelta
from uuid import uuid4

from test_construction_integration import city, headers, start, client


def test_timeline_empty_and_hours_validation(city):
    h = headers(city["username"])
    own = client.get("/api/v1/me/timeline", headers=h)
    assert own.status_code == 200
    body = own.json()
    assert body["events"] == []
    assert body["horizon_hours"] == 12 and body["truncated"] is False
    assert datetime.fromisoformat(body["server_now"]).tzinfo is not None
    assert client.get("/api/v1/me/timeline").status_code == 401
    for hval in (0, -1, 49, "invalid"):
        assert client.get("/api/v1/me/timeline", headers=h, params={"hours":hval}).status_code == 422


def test_timeline_uses_actual_postgresql_job_and_hides_other_player(city):
    own = headers(city["username"])
    other = headers(city["enemyname"])
    order = start(city, own)
    assert order.status_code == 201, order.text
    created = order.json()
    visible = client.get("/api/v1/me/timeline", headers=own)
    assert visible.status_code == 200, visible.text
    events = visible.json()["events"]
    assert len(events) == 1
    event = events[0]
    assert event["type"] == "construction_complete"
    assert event["id"] == "construction-" + created["order_id"]
    assert event["city_id"] == str(city["city"])
    assert event["world_id"] == city["world"]
    assert datetime.fromisoformat(event["occurs_at"]) == datetime.fromisoformat(created["due_at"])
    assert event["target_url"] == "/cities/" + str(city["city"])
    assert client.get("/api/v1/me/timeline", headers=other).json()["events"] == []
    # No synthetic attacks, hero returns or resource production notifications.
    assert all(e["type"] == "construction_complete" for e in events)
