"""Explicit, administrator-only hero combat attribute qualification."""
from __future__ import annotations

from decimal import Decimal
from uuid import UUID

import psycopg

from .hero_combat_modifiers import hero_combat_modifiers


def qualify_hero_basic_combat(
    db:psycopg.Connection,*,hero_id:UUID,
    attack_points:int,defense_points:int,
    attack_per_unit:Decimal=Decimal("0"),
    defense_per_unit:Decimal=Decimal("0"),
    source_ref:str,
)->dict:
    if not isinstance(hero_id,UUID):
        raise ValueError("Invalid hero ID")
    qualified=hero_combat_modifiers(
        attack_points=attack_points,defense_points=defense_points,
        attack_per_unit=attack_per_unit,defense_per_unit=defense_per_unit,
        source_ref=source_ref,
    )
    row=db.execute(
        """INSERT INTO hero_basic_combat_profiles
           (hero_id,attack_points,defense_points,attack_per_unit,
            defense_per_unit,source_ref,policy_id)
           VALUES(%s,%s,%s,%s,%s,%s,%s)
           ON CONFLICT(hero_id) DO UPDATE SET
             attack_points=EXCLUDED.attack_points,
             defense_points=EXCLUDED.defense_points,
             attack_per_unit=EXCLUDED.attack_per_unit,
             defense_per_unit=EXCLUDED.defense_per_unit,
             source_ref=EXCLUDED.source_ref,
             policy_id=EXCLUDED.policy_id,
             qualified_at=clock_timestamp()
           RETURNING hero_id""",
        (hero_id,attack_points,defense_points,attack_per_unit,
         defense_per_unit,qualified["source_ref"],qualified["policy_id"]),
    ).fetchone()
    if row is None:
        raise ValueError("Hero combat profile not recorded")
    return {"hero_id":str(row[0]),"combat_profile":qualified}
