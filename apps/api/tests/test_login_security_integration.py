"""Real PostgreSQL authentication throttling and session-boundary tests."""
from __future__ import annotations

import os
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient

from mmhk_api.db import migrate
from mmhk_api.login_limits import (
    digest_identifier, prune_login_history, reserve_login_attempt,
    RateLimitConfigurationError,
)
from mmhk_api.main import app
from mmhk_api.security import create_account

URL=os.environ.get("MMHK_TEST_DATABASE_URL")
pytestmark=pytest.mark.skipif(not URL, reason="PostgreSQL test URL required")
client=TestClient(app)

@pytest.fixture
def subject(monkeypatch):
    assert URL
    monkeypatch.setenv("MMHK_DATABASE_URL",URL)
    monkeypatch.setenv("MMHK_LOGIN_RATE_KEY","test-only-hmac-key-for-login-limits-0123456789abcdef")
    with psycopg.connect(URL) as db:
        migrate(db)
        username="login"+uuid4().hex[:15]
        player=create_account(db,username,"valid-password-for-lab-123")
    yield username
    # A test may deliberately remove the rate-limit key; restore it before
    # HMAC-keyed fixture cleanup.
    monkeypatch.setenv("MMHK_LOGIN_RATE_KEY",
                       "test-only-hmac-key-for-login-limits-0123456789abcdef")
    with psycopg.connect(URL) as db:
        db.execute("DELETE FROM accounts WHERE username=%s",(username,))
        db.execute("DELETE FROM auth_login_events WHERE username_digest=%s",
                   (digest_identifier("username",username),))
        db.execute("DELETE FROM auth_login_buckets WHERE bucket_digest=%s",
                   (digest_identifier("username",username),))
        # The source budget is shared by all TestClient requests; remove only
        # this test's own source budget after each fixture.
        db.execute("DELETE FROM auth_login_buckets WHERE bucket_digest=%s",
                   (digest_identifier("source","testclient"),))

def _login(username,password):
    return client.post("/api/v1/sessions",json={
        "username":username,"password":password,
    })

def test_wrong_password_limits_account_even_across_retries(subject):
    for _ in range(8):
        res=_login(subject,"incorrect-password")
        assert res.status_code==401, res.text
        assert res.headers["cache-control"]=="no-store"
        assert "x-content-type-options" in res.headers
    ninth=_login(subject,"valid-password-for-lab-123")
    assert ninth.status_code==429
    assert int(ninth.headers["retry-after"])>0
    assert ninth.json()=={"detail":"Too many login attempts"}
    with psycopg.connect(URL) as db:
        ev=db.execute(
            """SELECT event_kind FROM auth_login_events
               WHERE username_digest=%s ORDER BY event_id""",
            (digest_identifier("username",subject),),
        ).fetchall()
        assert ev==[("rejected",)]*8+[("limited",)]
        assert db.execute(
            """SELECT COUNT(*) FROM sessions s
               JOIN accounts a ON a.account_id=s.account_id WHERE a.username=%s""",
            (subject,),
        ).fetchone()[0]==0

def test_valid_login_resets_username_limit_and_keeps_cookie_private(subject):
    for _ in range(3):
        assert _login(subject,"incorrect-password").status_code==401
    accepted=_login(subject,"valid-password-for-lab-123")
    assert accepted.status_code==200
    assert accepted.headers["cache-control"]=="no-store"
    token=accepted.json()["access_token"]
    assert len(token)>=32
    secret={"Authorization":"Bearer "+token}
    response=client.get("/api/v1/me/worlds",headers=secret)
    assert response.status_code==200
    assert response.headers["cache-control"]=="no-store"
    assert response.headers["referrer-policy"]=="no-referrer"
    assert response.headers["x-frame-options"]=="DENY"
    # Successful password proof resets the account budget.
    assert all(_login(subject,"invalid").status_code==401 for _ in range(8))
    assert _login(subject,"valid-password-for-lab-123").status_code==429
    assert client.delete("/api/v1/sessions/current",headers=secret).status_code==204
    assert client.get("/api/v1/me/worlds",headers=secret).status_code==401

def test_time_window_expires_without_losing_audit(subject):
    for _ in range(9):
        _login(subject,"invalid")
    with psycopg.connect(URL) as db:
        db.execute(
            """UPDATE auth_login_buckets SET window_ends_at=clock_timestamp()-interval '1 second'
               WHERE bucket_digest=%s""",
            (digest_identifier("username",subject),),
        )
        db.execute(
            """UPDATE auth_login_buckets SET window_ends_at=clock_timestamp()-interval '1 second'
               WHERE bucket_digest=%s""",
            (digest_identifier("source","testclient"),),
        )
    allowed=_login(subject,"valid-password-for-lab-123")
    assert allowed.status_code==200,allowed.text
    with psycopg.connect(URL) as db:
        assert db.execute(
            "SELECT COUNT(*) FROM auth_login_events WHERE username_digest=%s",
            (digest_identifier("username",subject),),
        ).fetchone()[0]==10

def test_ignores_untrusted_forwarded_headers(subject):
    for _ in range(8):
        result=client.post("/api/v1/sessions",json={
            "username":subject,"password":"bad",
        },headers={"X-Forwarded-For":str(uuid4()),"X-Real-IP":"1.2.3.4"})
        assert result.status_code==401
    result=client.post("/api/v1/sessions",json={
        "username":subject,"password":"valid-password-for-lab-123",
    },headers={"X-Forwarded-For":"8.8.8.8"})
    assert result.status_code==429

def test_missing_limiter_secret_fails_closed(subject,monkeypatch):
    monkeypatch.delenv("MMHK_LOGIN_RATE_KEY")
    denied=_login(subject,"valid-password-for-lab-123")
    assert denied.status_code==503
    assert denied.json()=={"detail":"Authentication unavailable"}
    with psycopg.connect(URL) as db:
        assert db.execute(
            """SELECT COUNT(*) FROM sessions s
               JOIN accounts a ON a.account_id=s.account_id WHERE a.username=%s""",
            (subject,),
        ).fetchone()[0]==0

def test_pruning_is_operator_only_and_bounded(subject):
    with psycopg.connect(URL) as db:
        with pytest.raises(ValueError):
            prune_login_history(db,retention_days=0)
        db.execute(
            """INSERT INTO auth_login_events(username_digest,event_kind,occurred_at)
               VALUES(%s,'rejected',clock_timestamp()-interval '40 days')""",
            (digest_identifier("username",subject),),
        )
    with psycopg.connect(URL) as db:
        _buckets,deleted=prune_login_history(db,retention_days=30)
        assert deleted>=1


def test_source_wide_budget_cannot_be_bypassed_by_rotating_usernames(subject):
    from uuid import uuid4
    source = "synthetic-source-" + uuid4().hex
    with psycopg.connect(URL) as db:
        for number in range(40):
            retry=reserve_login_attempt(
                db,username="nonexistent-"+str(number),source_ip=source,
            )
            assert retry==0
        assert reserve_login_attempt(
            db,username="last-account",source_ip=source,
        )>0
        count=db.execute(
            "SELECT attempts FROM auth_login_buckets WHERE bucket_digest=%s",
            (digest_identifier("source",source),),
        ).fetchone()[0]
        assert count==41
        db.execute("DELETE FROM auth_login_buckets WHERE bucket_digest=%s",
                   (digest_identifier("source",source),))
        for number in range(40):
            db.execute("DELETE FROM auth_login_buckets WHERE bucket_digest=%s",
                       (digest_identifier("username","nonexistent-"+str(number)),))
        db.execute("DELETE FROM auth_login_buckets WHERE bucket_digest=%s",
                   (digest_identifier("username","last-account"),))
