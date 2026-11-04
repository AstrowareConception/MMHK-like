"""Source-qualified ordinary hero combat attributes (US-COM-005 slice).

Reference Jactari/04-COMBAT: each attack/defense point contributes 0.5%
of the matching stack's *base* power; fixed points per unit are additive
and NOT percentages. Talents and conditional bonuses are excluded until
an independent rule specifies and activates them.
"""
from __future__ import annotations

from decimal import Decimal, InvalidOperation

POINT_FACTOR = Decimal("0.005")
POLICY = "jactari-hero-basic-attributes-v1"


def hero_combat_modifiers(
    *, attack_points: int | None, defense_points: int | None,
    attack_per_unit: Decimal = Decimal("0"),
    defense_per_unit: Decimal = Decimal("0"),
    source_ref: str | None = None,
) -> dict:
    """Calculate a versioned basic-characteristic preview, fail closed.

    Unknown characteristics are NOT zero. Both sides require explicit
    numeric attributes; a normal neutral creature without a hero should be
    handled independently with no hero profile, not by fabricating one.
    """
    if any(type(v) is not int or not 0 <= v <= 1000
           for v in (attack_points, defense_points)):
        raise ValueError("Hero attack and defense must be qualified integer values")
    if not isinstance(source_ref,str) or not 3 <= len(source_ref.strip()) <= 255:
        raise ValueError("Combat profile provenance is required")
    for value in (attack_per_unit,defense_per_unit):
        if (not isinstance(value,Decimal) or not value.is_finite()
            or not Decimal("0") <= value <= Decimal("100000")):
            raise ValueError("Invalid verified fixed bonus")
    return {
        "attackStackHero": str(POINT_FACTOR * attack_points),
        "defendStackHero": str(POINT_FACTOR * defense_points),
        "attackUnitsHero": str(attack_per_unit),
        "defendUnitsHero": str(defense_per_unit),
        "attack_points": attack_points,
        "defense_points": defense_points,
        "source_ref":source_ref.strip(),
        "policy_id":POLICY,
        "conditional_talents_applied":False,
        "historically_certified_s2":False,
    }
