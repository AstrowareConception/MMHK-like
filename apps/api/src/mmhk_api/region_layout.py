"""Explicit operator-approved regional mine layout overrides.

The normal layout is persisted by migration 090. This helper permits a
designer to apply an alternative 5x5 arrangement without changing stocks,
rates, mine ownership, or the historical provenance of the world.
It is not exposed through the public game API.
"""
from __future__ import annotations

from uuid import UUID

import psycopg

from .worlds import RESOURCE_NAMES


def validate_mine_layout(resources: set[str], slots: dict[str, tuple[int, int]]) -> None:
    if set(slots) != resources:
        raise ValueError("Layout must position every existing mine exactly once")
    if not resources.issubset(set(RESOURCE_NAMES)):
        raise ValueError("Unknown resource")
    seen: set[tuple[int, int]] = set()
    for point in slots.values():
        if (not isinstance(point, (tuple, list)) or len(point) != 2
            or any(type(n) is not int or not 0 <= n <= 4 for n in point)):
            raise ValueError("Mine coordinates must be integer 5x5 tile positions")
        position = tuple(point)
        if position == (2, 2):
            raise ValueError("The central tile belongs to the city")
        if position in seen:
            raise ValueError("Two mines cannot occupy the same tile")
        seen.add(position)


def configure_mine_layout(
    db: psycopg.Connection, city_id: UUID,
    positions: dict[str, tuple[int, int]],
) -> None:
    """Trusted operator action, atomic and fully validated before replacement."""
    with db.transaction():
        city = db.execute(
            "SELECT city_id FROM cities WHERE city_id=%s FOR UPDATE", (city_id,),
        ).fetchone()
        if not city:
            raise ValueError("Unknown city")
        resources = {
            row[0] for row in db.execute(
                "SELECT resource FROM city_mines WHERE city_id=%s ORDER BY resource",
                (city_id,),
            ).fetchall()
        }
        validate_mine_layout(resources, positions)
        # Replace under one transaction; readers see either the previous
        # complete layout or the new complete layout.
        db.execute("DELETE FROM city_mine_positions WHERE city_id=%s", (city_id,))
        for resource, (i, j) in sorted(positions.items()):
            db.execute(
                """INSERT INTO city_mine_positions
                   (city_id,resource,i,j,layout_policy)
                   VALUES(%s,%s,%s,%s,'operator-layout-v1')""",
                (city_id, resource, i, j),
            )
