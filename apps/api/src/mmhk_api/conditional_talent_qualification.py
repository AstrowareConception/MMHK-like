"""Operator-only opt-in for experimental counter-weapon conditional hero talent."""
from __future__ import annotations
from decimal import Decimal
from uuid import UUID
import psycopg

from .conditional_hero_talents import conditional_attack_talent


def qualify_conditional_counter_talent(
    db:psycopg.Connection,*,hero_id:UUID,
    additional_bonus:Decimal,source_ref:str,
)->dict:
    if not isinstance(hero_id,UUID):
        raise ValueError("Invalid hero ID")
    # Validate the magnitude/provenance independently from whether a
    # particular enemy matchup would activate the talent.
    rule=conditional_attack_talent(
        attacker_weapon="I",defender_weapon="C",
        additional_bonus=additional_bonus,source_ref=source_ref,
    )
    row=db.execute(
        """INSERT INTO hero_conditional_counter_talents
           (hero_id,additional_attack_fraction,source_ref,policy_id)
           SELECT hero_id,%s,%s,%s FROM hero_basic_combat_profiles
           WHERE hero_id=%s
           ON CONFLICT(hero_id) DO UPDATE SET
             additional_attack_fraction=EXCLUDED.additional_attack_fraction,
             source_ref=EXCLUDED.source_ref,
             policy_id=EXCLUDED.policy_id,
             qualified_at=clock_timestamp()
           RETURNING hero_id""",
        (additional_bonus,rule["source_ref"],rule["policy_id"],hero_id),
    ).fetchone()
    if row is None:
        raise ValueError("Hero needs a qualified basic combat profile first")
    return {
        "hero_id":str(row[0]),
        "additional_attack_fraction":str(additional_bonus),
        "condition":rule["condition"],
        "policy_id":rule["policy_id"],
        "source_ref":rule["source_ref"],
    }
