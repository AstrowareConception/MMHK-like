"""Read-only world/region projections for the first MMHK-like browser map.

Only account-owned cities are returned. No enemy fog, mine placements,
territory control, visible map tiles or population are guessed.
"""
from __future__ import annotations

from uuid import UUID

import psycopg

from .worlds import owned_cities, owned_worlds, HAVEN_FIRST_MINES
from .region_pve import region_encounters


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
    # Discoveries are independently scoped to membership; mere storage does not
    # reveal an opposing city, a relic or territorial information.
    discovered = db.execute(
        """SELECT c.city_id,c.name,c.x,c.y
           FROM map_city_discoveries d
           JOIN cities c ON c.world_id=d.world_id AND c.city_id=d.city_id
           WHERE d.world_id=%s AND d.viewer_account_id=%s
             AND c.owner_account_id<>%s
           ORDER BY c.city_id""",(world_id,account_id,account_id),
    ).fetchall()
    sites = db.execute(
        """SELECT s.site_id,s.kind,s.label,s.x,s.y
           FROM map_site_discoveries d
           JOIN map_world_sites s ON s.site_id=d.site_id AND s.world_id=d.world_id
           WHERE d.world_id=%s AND d.viewer_account_id=%s
           ORDER BY s.site_id""",(world_id,account_id),
    ).fetchall()
    influence_mode=db.execute(
        """SELECT enabled,revision,last_refresh_at
           FROM world_influence_policies WHERE world_id=%s""",
        (world_id,),
    ).fetchone()
    dynamic_ready=bool(influence_mode and influence_mode[0] and
                       influence_mode[1]>0)
    influence = db.execute(
        """SELECT i.x,i.y,i.controller_account_id,a.username,i.observed_at
           FROM map_influence_cells i
           JOIN accounts a ON a.account_id=i.controller_account_id
           WHERE i.world_id=%s AND
             (i.controller_account_id=%s OR EXISTS(
               SELECT 1 FROM map_influence_discoveries d
               WHERE d.world_id=i.world_id AND d.x=i.x AND d.y=i.y
                 AND d.viewer_account_id=%s))
           ORDER BY i.x,i.y LIMIT 10000""",(world_id,account_id,account_id),
    ).fetchall()
    if dynamic_ready:
        # Map fog of war stays private: own cells are visible; enemy
        # coordinates are visible ONLY through explicit per-cell grants.
        influence=db.execute(
            """SELECT i.x,i.y,i.owner_account_id,COALESCE(a.username,'Contestée'),i.refreshed_at
               FROM world_influence_cells i
               LEFT JOIN accounts a ON a.account_id=i.owner_account_id
               WHERE i.world_id=%s AND (
                 i.owner_account_id=%s OR EXISTS(
                   SELECT 1 FROM world_influence_visibility d
                   WHERE d.world_id=i.world_id AND d.x=i.x AND d.y=i.y
                     AND d.viewer_account_id=%s))
               ORDER BY i.x,i.y LIMIT 10000""",
            (world_id,account_id,account_id),
        ).fetchall()
    return {
        "world_id": world_id,
        "name": world["name"],
        "world_size": world["world_size"],
        "topology": "torus",
        "influence_mode":"experimental_dynamic" if dynamic_ready else "qualified_manual",
        "influence_revision":influence_mode[1] if dynamic_ready else None,
        "known_scope": "owned_and_discovered" if (discovered or sites or influence) else "owned_cities_only",
        "cities": cities,
        "enemy_positions_exposed": bool(discovered),
        "world_terrain_loaded": False,
        "discovered_cities": [
            {"city_id":str(r[0]),"name":r[1],"x":r[2],"y":r[3]}
            for r in discovered
        ],
        "visible_sites": [
            {"site_id":str(r[0]),"kind":r[1],"label":r[2],"x":r[3],"y":r[4]}
            for r in sites
        ],
        "visible_influence": [
            {"x":r[0],"y":r[1],"controller":r[3],
             "is_mine":r[2]==account_id,
             "observed_at":r[4].isoformat()}
            for r in influence
        ],
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
        "encounters": region_encounters(db,account_id,city_id),
    }
