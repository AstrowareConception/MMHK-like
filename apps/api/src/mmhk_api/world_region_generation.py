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
from .world_region_deposits import provision_deposits

POLICY = "regional-composition-v2"
RARE = ("crystal", "gems", "sulfur", "mercury")


def composition_for(world_id: str, x: int, y: int) -> tuple[str, str, str, str]:
    if not isinstance(world_id, str) or not world_id or any(
        type(v) is not int or v < 1 for v in (x, y)
    ):
        raise ValueError("Invalid region identity")
    # P0 Q11-Q15: ordinary regions have NO mandatory gold/wood/ore.
    # Pick three or four distinct types without replacement from all seven.
    # At most one duplicate, never a triple or two pairs. Every rare type
    # has symmetrical probability. The exact weights are a LAB hypothesis.
    seed=f"{POLICY}:{world_id}:{x}:{y}"
    ranked=sorted(
        RESOURCE_NAMES,
        key=lambda resource:sha256(f"{seed}:{resource}".encode()).digest(),
    )
    entropy=sha256(seed.encode()).digest()
    if entropy[0] < 32:
        # 12.5% laboratory hypothesis for one duplicate resource.
        unique=ranked[:3]
        duplicate=unique[entropy[1] % 3]
        result=[*unique,duplicate]
    else:
        result=ranked[:4]
    # Shuffle the presentation independently of the resource selection.
    return tuple(
        resource for _,resource in sorted(
            enumerate(result),
            key=lambda pair:sha256(
                f"{seed}:slot:{pair[0]}:{pair[1]}".encode()
            ).digest(),
        )
    )

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
        # Respect previously qualified mining sites before synthesizing any
        # remaining experimental resource slot. This prevents a world batch
        # from invalidating an operator-approved colonization location.
        qualified = db.execute(
            """SELECT mine_types,source_ref FROM world_colonizable_terrain
               WHERE world_id=%s AND x=%s AND y=%s AND enabled
               UNION ALL
               SELECT mine_types,source_ref FROM colonization_site_profiles
               WHERE world_id=%s AND x=%s AND y=%s AND enabled
               LIMIT 2""",
            (world_id, x, y, world_id, x, y),
        ).fetchall()
        if qualified:
            signatures = {tuple(sorted(row[0])) for row in qualified}
            if len(signatures) != 1:
                raise ValueError("Conflicting operator-qualified regional mine profiles")
            approved = list(next(iter(signatures)))
            if len(approved) not in (3,4) or len(set(approved)) != len(approved):
                raise ValueError("Invalid operator-qualified mine composition")
            proposed = approved[:]
            if len(proposed) == 3:
                # The fourth slot is a declared procedural hypothesis, not
                # an additional operational mine or a historical assertion.
                candidate = composition_for(world_id, x, y)
                proposed.append(next((r for r in candidate if r not in proposed),
                                     next(r for r in RESOURCE_NAMES if r not in proposed)))
            policy = POLICY
            source = "qualified-site-plus-procedural:" + ",".join(row[1] for row in qualified)
            source = source[:255]
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
    deposits = provision_deposits(db,world_id=world_id,x=x,y=y)
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
        "deposits": deposits,
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
