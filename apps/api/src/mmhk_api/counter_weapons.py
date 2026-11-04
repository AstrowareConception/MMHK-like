"""Jactari counter-weapon relation — US-COM-004, ordinary stacks only.

The CODE-01-COMBAT source and story require I > C, R > I, C > R,
each granting +50% to the advantageous side, without penalizing the
other side. E is not part of this cycle. Unknown weapon classifications
must never be guessed from unit names or tier.
"""
from __future__ import annotations

from decimal import Decimal

WEAPONS = frozenset(("I", "R", "C", "E"))
ADVANTAGE = {"I": "C", "R": "I", "C": "R"}
REFERENCE_BONUS = Decimal("0.50")
POLICY_ID = "jactari-counter-weapons-v1"


def counter_weapon_bonuses(attacker: str | None, defender: str | None) -> dict:
    """Return two directional bonus factors, preserving unknown classifications.

    None is a genuinely unqualified unit, not a neutral/known type E.
    Callers must not treat zero bonus from an unknown type as evidence that
    a complete battle has been calculated.
    """
    for value in (attacker, defender):
        if value is not None and (type(value) is not str or value not in WEAPONS):
            raise ValueError("Invalid or unsupported weapon classification")
    qualified = attacker is not None and defender is not None
    a_bonus = qualified and ADVANTAGE.get(attacker) == defender
    d_bonus = qualified and ADVANTAGE.get(defender) == attacker
    return {
        "attacker_weapon": attacker,
        "defender_weapon": defender,
        "attacker_bonus": str(REFERENCE_BONUS if a_bonus else Decimal("0")),
        "defender_bonus": str(REFERENCE_BONUS if d_bonus else Decimal("0")),
        "qualified": qualified,
        "policy_id": POLICY_ID,
        "historically_certified_s2": False,
    }
