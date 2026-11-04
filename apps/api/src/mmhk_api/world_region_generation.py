"""Bounded, trusted world-region composition provisioning.

A persisted region has exactly four resource *slots*, not necessarily four
distinct mine buildings. Generation is a proposed MMHK-like rule (not a
certified historical distribution). Gameplay GETs never generate entries.
"""
from __future__ import annotations

from hashlib import sha256
from uuid import UUID

import psycopg

from .worlds import RESOURCE_NAMES

POLICY = "regional-composition-v1"
RARE = ("crystal", "gems", "sulfur", "mercury")


def composition_for(world_id: str, x: int, y: int) -> tuple[str, str, str, str]:
    if not isinstance(world_id, str) or not world_id or any(
        type(v) is not int or v < 1 for v in (x, y)
    ):
        raise ValueError("Invalid region identity")
    entropy = sha256(f"{POLICY}:{world_id}:{x}:{y}".encode()).digest()
    rare = RARE[entropy[0] % len(RARE)]
    # Model hypothesis: gold/wood/ore are common. The second unusual pattern
    # deliberately permits a duplicate rare resource in a minority of regions.
    if entropy[1] < 20:
        result = ["gold", "wood", rare, rare]
    else:
        result = ["gold", "wood", "ore", rare]
    rotation = entropy[2] % 4
    return tuple(result[rotation:] + result[:rotation])


def provision_region(
    db: psycopg.Connection, *, world_id: str, x: int, y: int,
    reveal_to: UUID | None = None,
) -> dict:
    """Operator-only insert-if-absent, safe under concurrent provisioning.

    Existing authoritative records and city mine profiles are NEVER rewritten.
    The caller owns the transaction and decides whether to commit.
    """
    world = db.execute(
        "SELECT world_size FROM worlds WHERE world_id=%s", (world_id,),
    ).fetchone()
    if not world or type(x) is not int or type(y) is not int or not (
        1 <= x <= world[0] and 1 <= y <= world[0]
    ):
        raise ValueError("Unknown world or invalid coordinates")
    # Existing city economics always win over newly proposed generation.
    city = db.execute(
        "SELECT city_id FROM cities WHERE world_id=%s AND x=%s AND y=%s",
        (world_id, x, y),
    ).fetchone()
    if city:
        mines = [
            r[0] for r in db.execute(
                "SELECT resource FROM city_mines WHERE city_id=%s ORDER BY resource",
                (city[0],),
            ).fetchall()
        ]
        if len(mines) != 4:
            raise ValueError("Existing city must have exactly four mines before provisioning")
        proposed = mines
        policy = "existing-city-v1"
        source = "existing-city-mines:" + str(city[0])
    else:
        proposed = list(composition_for(world_id, x, y))
        policy = POLICY
        source = "procedural:" + POLICY
    db.execute(
        """INSERT INTO world_region_resources
           (world_id,x,y,resources,generation_policy,source_ref)
           VALUES (%s,%s,%s,%s,%s,%s)
           ON CONFLICT (world_id,x,y) DO NOTHING""",
        (world_id, x, y, proposed, policy, source),
    )
    result = db.execute(
        """SELECT resources,generation_policy,source_ref
           FROM world_region_resources
           WHERE world_id=%s AND x=%s AND y=%s""",
        (world_id, x, y),
    ).fetchone()
    if reveal_to is not None:
        authorized = db.execute(
            """SELECT 1 FROM world_memberships
               WHERE world_id=%s AND account_id=%s""",
            (world_id, reveal_to),
        ).fetchone()
        if not authorized:
            raise ValueError("Viewer is not a world member")
        db.execute(
            """INSERT INTO world_region_resource_discoveries
               (world_id,x,y,viewer_account_id)
               VALUES (%s,%s,%s,%s)
               ON CONFLICT DO NOTHING""",
            (world_id, x, y, reveal_to),
        )
    return {
        "world_id": world_id, "x": x, "y": y,
        "resources": list(result[0]),
        "generation_policy": result[1], "source_ref": result[2],
        "historically_certified": False,
    }


def provision_rectangle(
    db: psycopg.Connection, *, world_id: str,
    x_min: int, y_min: int, x_max: int, y_max: int,
    reveal_to: UUID | None = None, limit: int = 400,
) -> int:
    """Explicit operator action; bound the operation and do not scan the world."""
    if any(type(v) is not int for v in (x_min,y_min,x_max,y_max,limit)):
        raise ValueError("Coordinates and limit must be integers")
    count = (x_max - x_min + 1) * (y_max - y_min + 1)
    if x_min < 1 or y_min < 1 or count < 1 or limit < 1 or limit > 400 or count > limit:
        raise ValueError("Invalid or excessive region batch")
    for y in range(y_min, y_max + 1):
        for x in range(x_min, x_max + 1):
            provision_region(db, world_id=world_id, x=x, y=y, reveal_to=reveal_to)
    return count
