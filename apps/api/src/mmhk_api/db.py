"""PostgreSQL connection and explicit one-way application migrations."""
from __future__ import annotations

import os
from collections.abc import Iterator
from pathlib import Path

import psycopg
from fastapi import HTTPException

_MIGRATIONS = Path(__file__).resolve().parent / "sql"


def connect() -> psycopg.Connection:
    url = os.environ.get("MMHK_DATABASE_URL")
    if url:
        return psycopg.connect(url, connect_timeout=4)
    # Libpq parameters avoid constructing a password-bearing URL; a random
    # password can contain %, @, :, / etc. without manual URL escaping.
    required = ("PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD")
    if all(os.environ.get(key) for key in required):
        return psycopg.connect(
            host=os.environ["PGHOST"],
            dbname=os.environ["PGDATABASE"],
            user=os.environ["PGUSER"],
            password=os.environ["PGPASSWORD"],
            port=int(os.environ.get("PGPORT", "5432")),
            connect_timeout=4,
        )
    raise RuntimeError("MMHK_DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD required")


def connection() -> Iterator[psycopg.Connection]:
    try:
        with connect() as db:
            yield db
    except psycopg.OperationalError as exc:
        raise HTTPException(status_code=503, detail="World storage unavailable") from exc


def migrate(db: psycopg.Connection) -> list[int]:
    """Explicit, transactional schema migration. Call from a maintenance process."""
    applied = []
    with db.transaction():
        # Serialise competing maintenance commands without relying on HTTP.
        db.execute("SELECT pg_advisory_xact_lock(9012701)")
        db.execute("""
            CREATE TABLE IF NOT EXISTS app_schema_migrations (
              version integer PRIMARY KEY,
              applied_at timestamptz NOT NULL DEFAULT now()
            )
        """)
        for file in sorted(_MIGRATIONS.glob("[0-9][0-9][0-9]_*.sql")):
            version = int(file.name[:3])
            exists = db.execute(
                "SELECT 1 FROM app_schema_migrations WHERE version=%s",
                (version,),
            ).fetchone()
            if exists:
                continue
            db.execute(file.read_text(encoding="utf-8"))
            db.execute(
                "INSERT INTO app_schema_migrations(version) VALUES(%s)", (version,)
            )
            applied.append(version)
    return applied
