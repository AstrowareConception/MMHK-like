"""Read-only world/region projections for the first MMHK-like browser map.

Only account-owned cities are returned. No enemy fog, mine placements,
territory control, visible map tiles or population are guessed.
"""
from __future__ import annotations

from uuid import UUID

import psycopg

from .worlds import owned_cities, owned_worlds, HAVEN_FIRST_MINES


class MapNotFound(Exception):
    """The world or city is inaccessible to this account."""


def torus_coordinate(value: int, size: int) -> int:
    """Wrap one-indexed world-region coordinates, including both edges."""
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError("World coordinate must be an integer")
    if isinstance(size, bool) or not isinstance(size, int) or size < 2:
        raise ValueError("World dimensions must be >= 2")
    return (value - 1) % size + 1


def _accessible_world(db: psycopg.Connection, account_id: UUID, world_id: str) -> dict:
    # Same membership filter used by the other world endpoints.
    found = next(
        (world for world in owned_worlds(db, account_id)
         if world["world_id"] == world_id), None
    )
    if found is None:
        raise MapNotFound
    return found


def world_overview(db: psycopg.Connection, account_id: UUID, world_id: str) -> dict:
    """Return only *owned* settlements; no visibility/spy reports exist yet."""
    world = _accessible_world(db, account_id, world_id)
    cities = owned_cities(db, account_id, world_id)
    return {
        "world_id": world_id,
        "name": world["name"],
        "world_size": world["world_size"],
        "topology": "torus",
        "known_scope": "owned_cities_only",
        "cities": cities,
        "enemy_positions_exposed": False,
        "world_terrain_loaded": False,
    }


def own_region(db: psycopg.Connection, account_id: UUID, city_id: UUID) -> dict:
    """Schematic 5x5 region with city at centre and unlocated mine types.

    5x5 centre is the documented UI *proposal*, not yet an authoritative
    per-cell terrain or mine-position dataset.
    """
    row = db.execute(
        """SELECT c.city_id,c.world_id,c.name,c.x,c.y,w.world_size
           FROM cities c JOIN worlds w ON w.world_id=c.world_id
           JOIN world_memberships wm
             ON wm.world_id=c.world_id AND wm.account_id=%s
           WHERE c.city_id=%s AND c.owner_account_id=%s""",
        (account_id, city_id, account_id),
    ).fetchone()
    if row is None:
        raise MapNotFound
    city_id, world_id, city_name, x, y, size = row
    mines = [
        r[0] for r in db.execute(
            """SELECT resource FROM city_mines WHERE city_id=%s
               ORDER BY resource""",
            (city_id,),
        ).fetchall()
    ]
    cells = [
        {
            "i": i,
            "j": j,
            "kind": "owned_city" if (i, j) == (2, 2) else "unmapped",
            "city_id": city_id if (i, j) == (2, 2) else None,
        }
        for j in range(5) for i in range(5)
    ]
    surrounding_world_regions = [
        {
            "dx": dx,
            "dy": dy,
            "x": torus_coordinate(x + dx, size),
            "y": torus_coordinate(y + dy, size),
            "is_current": dx == 0 and dy == 0,
        }
        for dy in (-1, 0, 1) for dx in (-1, 0, 1)
    ]
    return {
        "city_id": city_id,
        "world_id": world_id,
        "city_name": city_name,
        "world_x": x,
        "world_y": y,
        "world_size": size,
        "region_width": 5,
        "region_height": 5,
        "cell_layout": "illustrative_unmapped",
        "mine_types_unlocated": mines,
        "mine_positions_known": False,
        "cells": cells,
        "surrounding_world_regions": surrounding_world_regions,
        "historical_regional_terrain_certified": False,
    }
