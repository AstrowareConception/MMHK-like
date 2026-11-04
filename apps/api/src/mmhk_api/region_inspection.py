"""Account-scoped territorial inspection, no speculative resource generation.

A coordinate is always inspectable inside a member's world. Its unknown
content is not equivalent to an empty or unoccupied region.
"""
from __future__ import annotations

from uuid import UUID
import psycopg

from .map_views import MapNotFound
from .worlds import RESOURCE_NAMES


def inspect_region(db: psycopg.Connection, owner: UUID, world_id: str, x: int, y: int) -> dict:
    membership = db.execute(
        """SELECT w.world_size FROM worlds w JOIN world_memberships m
             ON m.world_id=w.world_id
           WHERE w.world_id=%s AND m.account_id=%s""", (world_id, owner),
    ).fetchone()
    if membership is None:
        raise MapNotFound
    size = int(membership[0])
    if not 1 <= x <= size or not 1 <= y <= size:
        raise ValueError("Coordinates outside world boundaries")

    own = db.execute(
        """SELECT city_id,name FROM cities
           WHERE world_id=%s AND x=%s AND y=%s AND owner_account_id=%s""",
        (world_id, x, y, owner),
    ).fetchone()
    foreign = None
    if not own:
        foreign = db.execute(
            """SELECT c.city_id,c.name FROM map_city_discoveries d
               JOIN cities c ON c.city_id=d.city_id AND c.world_id=d.world_id
               WHERE d.world_id=%s AND d.viewer_account_id=%s
                 AND c.x=%s AND c.y=%s AND c.owner_account_id<>%s""",
            (world_id, owner, x, y, owner),
        ).fetchone()
    mines = []
    if own:
        mines = [r[0] for r in db.execute(
            "SELECT resource FROM city_mines WHERE city_id=%s ORDER BY resource",
            (own[0],),
        ).fetchall()]

    site = db.execute(
        """SELECT s.kind,s.label FROM map_site_discoveries d
           JOIN map_world_sites s ON s.site_id=d.site_id AND s.world_id=d.world_id
           WHERE d.world_id=%s AND d.viewer_account_id=%s AND s.x=%s AND s.y=%s
           LIMIT 1""", (world_id, owner, x, y),
    ).fetchone()
    # Use the same authorization test as colonization: no unrestricted lookup
    # into hidden colony profiles of other accounts.
    qualified = db.execute(
        """SELECT p.mine_types FROM colonization_site_profiles p
           JOIN map_influence_cells i
             ON i.world_id=p.world_id AND i.x=p.x AND i.y=p.y
           WHERE p.world_id=%s AND p.x=%s AND p.y=%s AND p.enabled
             AND i.controller_account_id=%s
             AND (
               NOT EXISTS (
                 SELECT 1 FROM world_influence_policies wp
                 WHERE wp.world_id=p.world_id AND wp.enabled
               ) OR EXISTS (
                 SELECT 1 FROM world_influence_cells wc
                 WHERE wc.world_id=p.world_id AND wc.x=p.x AND wc.y=p.y
                   AND wc.state='controlled' AND wc.owner_account_id=%s
                   AND EXISTS(
                     SELECT 1 FROM world_influence_policies wp
                     WHERE wp.world_id=p.world_id AND wp.enabled AND wp.revision>0
                   )
               )
             )""",
        (world_id, x, y, owner, owner),
    ).fetchone()
    # Dynamic worlds may have a separately registered terrain profile. Reveal
    # it ONLY when the latest territory projection confirms our ownership.
    dynamic = db.execute(
        """SELECT t.mine_types FROM world_colonizable_terrain t
           JOIN world_influence_cells i
             ON i.world_id=t.world_id AND i.x=t.x AND i.y=t.y
           JOIN world_influence_policies wp ON wp.world_id=t.world_id
           WHERE t.world_id=%s AND t.x=%s AND t.y=%s AND t.enabled
             AND wp.enabled AND wp.revision>0
             AND i.state='controlled' AND i.owner_account_id=%s""",
        (world_id, x, y, owner),
    ).fetchone()
    if not own and (dynamic or qualified):
        mines = [v for v in (dynamic or qualified)[0] if v in RESOURCE_NAMES]

    # Resource composition is a separate, persistent regional fact. Membership
    # alone does not reveal it. Own-city coordinates are always visible.
    composition = db.execute(
        """SELECT r.resources,r.generation_policy
           FROM world_region_resources r
           WHERE r.world_id=%s AND r.x=%s AND r.y=%s AND (
             EXISTS (
               SELECT 1 FROM cities c WHERE c.world_id=r.world_id
                 AND c.x=r.x AND c.y=r.y AND c.owner_account_id=%s
             ) OR EXISTS (
               SELECT 1 FROM world_region_resource_discoveries d
               WHERE d.world_id=r.world_id AND d.x=r.x AND d.y=r.y
                 AND d.viewer_account_id=%s
             )
           )""",
        (world_id, x, y, owner, owner),
    ).fetchone()
    deposits = []
    if composition:
        deposits = [
            {"slot": int(slot), "resource": resource,
             "i": int(i), "j": int(j)}
            for slot,resource,i,j in db.execute(
                """SELECT slot,resource,i,j FROM world_region_deposits
                   WHERE world_id=%s AND x=%s AND y=%s ORDER BY slot""",
                (world_id,x,y),
            ).fetchall()
        ]
    return {
        "world_id": world_id, "x": x, "y": y,
        "city": ({"city_id": str(own[0]), "name": own[1], "ownership": "own"}
                 if own else
                 {"city_id": str(foreign[0]), "name": foreign[1], "ownership": "discovered"}
                 if foreign else None),
        "city_known": bool(own or foreign),
        "mines": mines,
        "mines_known": bool(own or qualified or dynamic),
        "special_site": {"kind": site[0], "label": site[1]} if site else None,
        "colonization_site_qualified": bool(qualified or dynamic),
        "regional_resources": list(composition[0]) if composition else None,
        "regional_resources_known": bool(composition),
        "natural_deposits": deposits,
        "regional_resources_policy": composition[1] if composition else None,
        "terrain": None,
        "terrain_known": False,
        "historically_certified": False,
        "note": "Unknown means not discovered; no claim about hidden occupants or terrain.",
    }
