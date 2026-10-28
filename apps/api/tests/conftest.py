"""Isolation for integration tests sharing one in-process TestClient IP.

The real login rate limiter remains unchanged. GitHub Actions uses a single
PostgreSQL database and TestClient presents the same ASGI peer ("testclient")
for every test. Clear only that synthetic peer's reservation BETWEEN test
cases, not DURING a case, so the tests of source-wide throttling remain real.

Never activate this fixture against an unspecified or production database.
"""
from __future__ import annotations

import os

import psycopg
import pytest

from mmhk_api.login_limits import digest_identifier


@pytest.fixture(autouse=True)
def isolate_test_client_source_budget():
    url = os.environ.get("MMHK_TEST_DATABASE_URL")
    key = os.environ.get("MMHK_LOGIN_RATE_KEY", "")
    if url and len(key) >= 32:
        with psycopg.connect(url) as db:
            exists = db.execute(
                "SELECT to_regclass('public.auth_login_buckets')"
            ).fetchone()[0]
            if exists is not None:
                db.execute(
                    "DELETE FROM auth_login_buckets WHERE bucket_digest=%s",
                    (digest_identifier("source", "testclient"),),
                )
    yield
