"""Explicit counter-weapon-conditional hero talents, experimental US-COM-005.

The historical source confirms that SOME specializations only apply when
the relevant counter-weapon advantage exists, but does not certify a
universal name, magnitude or catalogue. Therefore a modifier must be
operator-qualified, and is evaluated on every exchange, never by unit name.
"""
from __future__ import annotations

from decimal import Decimal
from .counter_weapons import counter_weapon_bonuses

POLICY="jactari-conditional-counter-talent-lab-v1"


def conditional_attack_talent(
    *, attacker_weapon: str | None, defender_weapon: str | None,
    additional_bonus: Decimal, source_ref: str,
) -> dict:
    """Bonus is an additive proportion of base, only with counter advantage."""
    counter=counter_weapon_bonuses(attacker_weapon,defender_weapon)
    if (type(additional_bonus) is not Decimal or
        not additional_bonus.is_finite() or
        not Decimal("0")<=additional_bonus<=Decimal("1")):
        raise ValueError("Invalid qualified conditional bonus")
    if (not isinstance(source_ref,str) or
        not 3<=len(source_ref.strip())<=255 or
        any(ord(ch)<32 or ord(ch)==127 for ch in source_ref)):
        raise ValueError("Talent provenance required")
    applied=counter["qualified"] and Decimal(counter["attacker_bonus"])>0
    return {
        "active":bool(applied),
        "additional_attack_fraction":str(additional_bonus if applied else Decimal("0")),
        "configured_fraction":str(additional_bonus),
        "condition":"attacker_counter_weapon_advantage",
        "source_ref":source_ref.strip(),
        "policy_id":POLICY,
        "historically_certified_s2":False,
    }
