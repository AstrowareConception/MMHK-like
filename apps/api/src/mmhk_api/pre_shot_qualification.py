"""Operator-only qualified pre-shot capability configuration."""
from __future__ import annotations

from decimal import Decimal
from uuid import UUID

import psycopg

from .pve_pre_shots import POLICY


def qualify_pre_shot_profile(
    db: psycopg.Connection, *, hero_id: UUID,
    barrage_percent: Decimal, ballista_percent: Decimal,
    source_ref: str,
) -> dict:
    if not isinstance(hero_id,UUID):
        raise ValueError("Invalid hero ID")
    for value in (barrage_percent,ballista_percent):
        if type(value) is not Decimal or not value.is_finite() or not (
            Decimal("0") <= value <= Decimal("1000")
        ):
            raise ValueError("Invalid source-qualified pre-shot percentage")
    if barrage_percent==0 and ballista_percent==0:
        raise ValueError("At least one explicitly qualified capability is required")
    if (not isinstance(source_ref,str) or
        not 3<=len(source_ref.strip())<=255 or
        any(ord(ch)<32 or ord(ch)==127 for ch in source_ref)):
        raise ValueError("Invalid pre-shot source reference")
    ref=source_ref.strip()
    row=db.execute(
        """INSERT INTO hero_pre_shot_lab_profiles
             (hero_id,barrage_percent,ballista_percent,source_ref,policy_id)
           SELECT hero_id,%s,%s,%s,%s FROM hero_basic_combat_profiles
           WHERE hero_id=%s
           ON CONFLICT(hero_id) DO UPDATE SET
             barrage_percent=EXCLUDED.barrage_percent,
             ballista_percent=EXCLUDED.ballista_percent,
             source_ref=EXCLUDED.source_ref,
             policy_id=EXCLUDED.policy_id,
             qualified_at=clock_timestamp()
           RETURNING hero_id""",
        (barrage_percent,ballista_percent,ref,POLICY,hero_id),
    ).fetchone()
    if row is None:
        raise ValueError("Hero needs a qualified basic combat profile first")
    return {"hero_id":str(row[0]),"barrage_percent":str(barrage_percent),
            "ballista_percent":str(ballista_percent),
            "source_ref":ref,"policy_id":POLICY}
