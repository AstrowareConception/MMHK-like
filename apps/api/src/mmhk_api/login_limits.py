"""PostgreSQL-backed login throttling with no plaintext account/IP logs.

Shared across API processes: reservations are atomic and committed BEFORE
password verification. Non-verified reverse-proxy headers are never trusted.
"""
from __future__ import annotations

import hashlib
import hmac
import math
import os
from datetime import UTC, datetime, timedelta

import psycopg

_USERNAME_ATTEMPTS = 8
_SOURCE_ATTEMPTS = 40
_WINDOW_SECONDS = 15 * 60


class RateLimitConfigurationError(RuntimeError):
    """Fail closed when the HMAC secret has not been configured."""


def _key() -> bytes:
    secret = os.environ.get("MMHK_LOGIN_RATE_KEY", "")
    if len(secret) < 32:
        raise RateLimitConfigurationError(
            "MMHK_LOGIN_RATE_KEY must be a randomly generated >=32 character secret"
        )
    return secret.encode("utf-8")


def digest_identifier(scope: str, value: str) -> bytes:
    if scope not in ("username", "source"):
        raise ValueError("Invalid limiter scope")
    return hmac.new(_key(), (scope+"\0"+value).encode("utf-8"), hashlib.sha256).digest()


def _reserve(db: psycopg.Connection, *, scope: str, value: str) -> tuple[int,datetime]:
    digest = digest_identifier(scope, value)
    row = db.execute(
        """INSERT INTO auth_login_buckets
             (bucket_digest,scope,window_ends_at,attempts)
           VALUES(%s,%s,clock_timestamp() + interval '15 minutes',1)
           ON CONFLICT(bucket_digest) DO UPDATE SET
             attempts=CASE
               WHEN auth_login_buckets.window_ends_at <= clock_timestamp() THEN 1
               ELSE auth_login_buckets.attempts+1 END,
             window_ends_at=CASE
               WHEN auth_login_buckets.window_ends_at <= clock_timestamp()
                 THEN clock_timestamp() + interval '15 minutes'
               ELSE auth_login_buckets.window_ends_at END,
             updated_at=clock_timestamp()
           RETURNING attempts,window_ends_at""",
        (digest,scope),
    ).fetchone()
    return row[0],row[1]


def reserve_login_attempt(
    db: psycopg.Connection, *, username: str, source_ip: str,
) -> int:
    """Reserve every attempt before slow password hashing.

    Return Retry-After seconds (>0 if denied). Explicit db.commit() is
    intentional: FastAPI's generator dependency rolls back on HTTPException.
    """
    if not isinstance(username,str) or not isinstance(source_ip,str):
        raise ValueError("Invalid login identifier")
    # First source then username in a consistent order across processes.
    source_count,source_end=_reserve(db,scope="source",value=source_ip)
    account_count,account_end=_reserve(db,scope="username",value=username)
    limited=source_count>_SOURCE_ATTEMPTS or account_count>_USERNAME_ATTEMPTS
    # Auth reservation must survive later 401/429 exceptions.
    db.commit()
    if not limited:
        return 0
    now=datetime.now(UTC)
    cutoff=max(
        source_end if source_count>_SOURCE_ATTEMPTS else now,
        account_end if account_count>_USERNAME_ATTEMPTS else now,
    )
    return max(1,math.ceil((cutoff-now).total_seconds()))


def audit_login(db:psycopg.Connection, *, username:str, kind:str) -> None:
    if kind not in ("accepted","rejected","limited"):
        raise ValueError("Invalid audit event kind")
    db.execute(
        """INSERT INTO auth_login_events(username_digest,event_kind)
           VALUES(%s,%s)""",
        (digest_identifier("username",username),kind),
    )


def reset_account_limit_after_login(db:psycopg.Connection, *, username:str) -> None:
    """Successful password proof restores the account-specific budget.

    The source-IP budget is deliberately not reset, preventing one known
    valid login from bypassing the source-wide rate limit.
    """
    db.execute(
        "DELETE FROM auth_login_buckets WHERE bucket_digest=%s",
        (digest_identifier("username",username),),
    )


def prune_login_history(
    db:psycopg.Connection, *, retention_days:int=30,
) -> tuple[int,int]:
    """Operator housekeeping, separate from HTTP authentication."""
    if isinstance(retention_days,bool) or not 1<=retention_days<=365:
        raise ValueError("Invalid retention")
    counts=[]
    with db.transaction():
        counts.append(db.execute(
            "DELETE FROM auth_login_buckets WHERE window_ends_at < clock_timestamp()"
        ).rowcount)
        counts.append(db.execute(
            """DELETE FROM auth_login_events
               WHERE occurred_at < clock_timestamp()-(%s * interval '1 day')""",
            (retention_days,),
        ).rowcount)
    return counts[0],counts[1]
