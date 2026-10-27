"""Restricted first-slice credentials. No self-signup or battle authorization.

Production launch requires rate limiting, reset flow, CSRF/session review,
secrets management and an external security review.
"""
from __future__ import annotations

import hashlib
import hmac
import re
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import psycopg

USERNAME = re.compile(r"^[a-z0-9_]{3,32}$")
# Fixed work factor: deterministic verification of records without plaintext.
_N = 2**14
_FAKE_SALT = b"mmhk-not-an-account"
_FAKE_HASH = hashlib.scrypt(b"unavailable", salt=_FAKE_SALT, n=_N, r=8, p=1)


def hash_password(password: str, salt: bytes) -> bytes:
    if not 12 <= len(password) <= 128:
        raise ValueError("Passwords must be 12 to 128 characters")
    return hashlib.scrypt(password.encode("utf-8"), salt=salt, n=_N, r=8, p=1)


def create_account(db: psycopg.Connection, username: str, password: str) -> UUID:
    from uuid import uuid4

    if not USERNAME.fullmatch(username):
        raise ValueError("Username must use 3..32 lowercase letters, digits or underscore")
    salt = secrets.token_bytes(16)
    digest = hash_password(password, salt)
    account_id = uuid4()
    db.execute(
        """INSERT INTO accounts(account_id,username,password_salt,password_hash)
           VALUES(%s,%s,%s,%s)""",
        (account_id, username, salt, digest),
    )
    return account_id


def start_session(db: psycopg.Connection, username: str, password: str) -> str | None:
    if not USERNAME.fullmatch(username) or len(password) > 128:
        return None
    row = db.execute(
        """SELECT account_id,password_salt,password_hash FROM accounts
           WHERE username=%s""",
        (username,),
    ).fetchone()
    salt, expected = (bytes(row[1]), bytes(row[2])) if row else (
        _FAKE_SALT, _FAKE_HASH
    )
    candidate = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=_N, r=8, p=1)
    if not hmac.compare_digest(candidate, expected) or not row:
        return None
    token = secrets.token_urlsafe(32)
    db.execute(
        """INSERT INTO sessions(token_digest,account_id,expires_at)
           VALUES(%s,%s,%s)""",
        (hashlib.sha256(token.encode("ascii")).digest(),
         row[0], datetime.now(UTC) + timedelta(hours=8)),
    )
    return token


def get_authenticated_id(db: psycopg.Connection, token: str) -> UUID | None:
    if len(token) > 256 or not token:
        return None
    digest = hashlib.sha256(token.encode("utf-8")).digest()
    row = db.execute(
        """SELECT a.account_id FROM sessions s
           JOIN accounts a ON a.account_id=s.account_id
           WHERE s.token_digest=%s AND s.expires_at > now()""",
        (digest,),
    ).fetchone()
    return row[0] if row else None


def revoke_session(db: psycopg.Connection, token: str) -> None:
    if 0 < len(token) <= 256:
        db.execute(
            "DELETE FROM sessions WHERE token_digest=%s",
            (hashlib.sha256(token.encode("utf-8")).digest(),),
        )
