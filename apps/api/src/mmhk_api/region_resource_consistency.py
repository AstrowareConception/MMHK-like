"""Validate compatibility between a persistent region and its possible mines."""
from __future__ import annotations

from collections import Counter
from typing import Sequence

import psycopg

from .worlds import RESOURCE_NAMES


def profile_fits_region(resources: Sequence[str], mines: Sequence[str]) -> bool:
    """Every operational mine needs one matching resource slot.

    Duplicate regional slots are allowed, but mines remain distinct under
    the current city_mines schema.
    """
    if (len(resources) != 4 or not 3 <= len(mines) <= 4
        or any(r not in RESOURCE_NAMES for r in resources)
        or any(r not in RESOURCE_NAMES for r in mines)
        or len(set(mines)) != len(mines)):
        return False
    available = Counter(resources)
    return all(available[m] >= 1 for m in mines)


def region_accepts_mines(
    db: psycopg.Connection, world_id: str, x: int, y: int,
    mines: Sequence[str],
) -> bool:
    """Unknown legacy composition is not evidence of a contradiction."""
    row = db.execute(
        "SELECT resources FROM world_region_resources WHERE world_id=%s AND x=%s AND y=%s",
        (world_id, x, y),
    ).fetchone()
    return row is None or profile_fits_region(row[0], mines)
