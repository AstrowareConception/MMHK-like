"""World read models, strict account scoping, and trusted development seeding."""
from __future__ import annotations

import re
from uuid import UUID, uuid4

import psycopg

RESOURCE_NAMES = ("gold", "wood", "ore", "crystal", "gems", "sulfur", "mercury")
HAVEN_FIRST_MINES = ("gold", "wood", "ore", "crystal")
WORLD_ID = re.compile(r"^[a-z0-9_-]{1,64}$")


def seed_first_haven_city(
    db: psycopg.Connection,
    *,
    world_id: str,
    world_name: str,
    size: int,
    account_id: UUID,
    city_name: str,
    x: int,
    y: int,
    amounts: dict[str, int] | None = None,
) -> UUID:
    """Administrative fixture only. Not public player registration / spawning.

    The Havre initial region's mine TYPES are a user decision (P0);
    quantities, placement and resources are test/demo values, not MMHK rules.
    """
    if not WORLD_ID.fullmatch(world_id) or not 2 <= size <= 100000:
        raise ValueError("Invalid world")
    if not 1 <= x <= size or not 1 <= y <= size:
        raise ValueError("City coordinates outside map")
    if not 1 <= len(world_name) <= 100 or not 1 <= len(city_name) <= 80:
        raise ValueError("Invalid world or city name")
    amounts = amounts or {}
    if any(k not in RESOURCE_NAMES or isinstance(v, bool)
           or not isinstance(v, int) or v < 0 or v > 2**63 - 1
           for k, v in amounts.items()):
        raise ValueError("Invalid sample stock")
    db.execute(
        """INSERT INTO worlds(world_id,name,world_size) VALUES(%s,%s,%s)""",
        (world_id, world_name, size),
    )
    db.execute(
        "INSERT INTO world_memberships(world_id,account_id) VALUES(%s,%s)",
        (world_id, account_id),
    )
    city_id = uuid4()
    db.execute(
        """INSERT INTO cities(city_id,world_id,owner_account_id,name,x,y,first_city)
           VALUES(%s,%s,%s,%s,%s,%s,true)""",
        (city_id, world_id, account_id, city_name, x, y),
    )
    for kind in RESOURCE_NAMES:
        db.execute(
            "INSERT INTO city_stocks(city_id,resource,amount) VALUES(%s,%s,%s)",
            (city_id, kind, amounts.get(kind, 0)),
        )
    for kind in HAVEN_FIRST_MINES:
        db.execute(
            "INSERT INTO city_mines(city_id,resource) VALUES(%s,%s)",
            (city_id, kind),
        )
    return city_id


def owned_worlds(db: psycopg.Connection, account_id: UUID) -> list[dict]:
    rows = db.execute(
        """SELECT w.world_id,w.name,w.world_size FROM worlds w
           JOIN world_memberships m ON m.world_id=w.world_id
           WHERE m.account_id=%s ORDER BY w.name,w.world_id""",
        (account_id,),
    ).fetchall()
    return [{"world_id":r[0], "name":r[1], "world_size":r[2]} for r in rows]


def owned_cities(db: psycopg.Connection, account_id: UUID, world_id: str) -> list[dict]:
    # Explicit authorization (membership + owner) in the query itself.
    rows = db.execute(
        """SELECT c.city_id,c.name,c.x,c.y,c.first_city
           FROM cities c JOIN world_memberships m
             ON m.world_id=c.world_id AND m.account_id=%s
           WHERE c.owner_account_id=%s AND c.world_id=%s
           ORDER BY c.founded_at,c.city_id""",
        (account_id, account_id, world_id),
    ).fetchall()
    return [
        {"city_id":r[0], "name":r[1], "x":r[2], "y":r[3], "first_city":r[4]}
        for r in rows
    ]


def owned_city_detail(db: psycopg.Connection, account_id: UUID, city_id: UUID) -> dict | None:
    row = db.execute(
        """SELECT c.city_id,c.world_id,c.name,c.x,c.y,c.first_city
           FROM cities c JOIN world_memberships m
             ON m.world_id=c.world_id AND m.account_id=%s
           WHERE c.city_id=%s AND c.owner_account_id=%s""",
        (account_id, city_id, account_id),
    ).fetchone()
    if not row:
        return None
    stocks = dict(db.execute(
        "SELECT resource,amount FROM city_stocks WHERE city_id=%s", (city_id,)
    ).fetchall())
    mines = [r[0] for r in db.execute(
        "SELECT resource FROM city_mines WHERE city_id=%s ORDER BY resource",
        (city_id,),
    ).fetchall()]
    return {
        "city_id": row[0],
        "world_id": row[1],
        "name": row[2],
        "x": row[3],
        "y": row[4],
        "first_city": row[5],
        "stocks": {kind: stocks.get(kind, 0) for kind in RESOURCE_NAMES},
        "mines": mines,
        "production_active": False,
        "historical_economy_certified": False,
    }
