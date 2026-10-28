"""Read-only prediction of authorized construction completions.

PostgreSQL and the construction worker remain the only sources of truth.
No synthetic military movements, rediscovery of enemy positions, or client time.
"""
from __future__ import annotations

from datetime import timedelta
from uuid import UUID
import psycopg


def timeline_for_player(
    db: psycopg.Connection, account_id: UUID, *, hours: int = 12, limit: int = 200,
) -> dict:
    if isinstance(hours, bool) or not 1 <= hours <= 48:
        raise ValueError("hours must be between 1 and 48")
    if isinstance(limit, bool) or not 1 <= limit <= 200:
        raise ValueError("limit must be between 1 and 200")
    now = db.execute("SELECT clock_timestamp()").fetchone()[0]
    horizon = now + timedelta(hours=hours)
    rows = db.execute(
        """SELECT o.order_id, o.building_code, o.target_level, o.due_at,
                  c.city_id, c.name, c.world_id
           FROM urban_construction_orders o
           JOIN cities c ON c.city_id = o.city_id
           JOIN world_memberships wm ON wm.world_id = c.world_id
              AND wm.account_id = %s
           WHERE c.owner_account_id = %s
             AND o.status = 'building'
             AND o.due_at <= %s
           ORDER BY o.due_at, o.order_id
           LIMIT %s""",
        (account_id, account_id, horizon, limit + 1),
    ).fetchall()
    return {
        "server_now": now,
        "horizon_hours": hours,
        "truncated": len(rows) > limit,
        "events": [
            {
                "id": "construction-" + str(order_id),
                "type": "construction_complete",
                "title": f"{code.replace('_', ' ').capitalize()} — niveau {level}",
                "occurs_at": due,
                "world_id": world_id,
                "city_id": str(city_id),
                "city_name": city_name,
                "target_url": "/cities/" + str(city_id),
                "icon": "timeline.construction",
                "priority": "normal",
            }
            for order_id, code, level, due, city_id, city_name, world_id
            in rows[:limit]
        ],
    }
