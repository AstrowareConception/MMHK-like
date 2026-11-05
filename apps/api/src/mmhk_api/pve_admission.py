"""Jactari PvE pre-combat admission, US-COM-011 (laboratory only).

CODE-01-COMBAT sums ordinary stack base powers before heroes, talents,
magic, counters or pre-shots. An attacker with power ratio <= 1/7 flees.
Unknown / zero defender power is NOT guessed to be an automatic victory.

Integer power comparisons use exact Decimals to preserve the 1/7 boundary.
The report is a preview and never changes heroes, troops or encounter state.
"""
from __future__ import annotations

from decimal import Decimal
from math import isfinite

POLICY_ID = "jactari-pve-admission-v1"
MAX_STACKS = 7
MAX_COUNT = 1_000_000
MAX_UNIT_POWER = 1_000_000


def _base_power(stacks: list[dict], side: str) -> Decimal:
    if not isinstance(stacks,list) or not 1 <= len(stacks) <= MAX_STACKS:
        raise ValueError(f"{side}: expected 1..7 ordinary stacks")
    total=Decimal(0)
    for stack in stacks:
        if not isinstance(stack,dict):
            raise ValueError(f"{side}: invalid stack")
        count,power=stack.get("count"),stack.get("unit_power")
        if (type(count) is not int or not 1<=count<=MAX_COUNT
            or type(power) not in (int,float) or not isfinite(power)
            or not 0<power<=MAX_UNIT_POWER):
            raise ValueError(f"{side}: invalid raw unit power or count")
        total+=Decimal(count)*Decimal(str(power))
    return total


def evaluate_pve_admission(attacker: list[dict], defender: list[dict]) -> dict:
    """Pure, replay-safe check before ALL battle modifiers and ranged shots."""
    a=_base_power(attacker,"attacker")
    d=_base_power(defender,"defender")
    if d<=0:
        raise ValueError("Unqualified zero-power defender; admission denied")
    flee=(a*Decimal(7)<=d)
    return {
        "policy_id":POLICY_ID,
        "scope":"LAB-PVE-ORDINARY-POWER",
        "attacker_raw_power":str(a),
        "defender_raw_power":str(d),
        "ratio":str(a/d),
        "threshold":"1/7",
        "threshold_inclusive":True,
        "fled":bool(flee),
        "status":"fled_before_combat" if flee else "admitted_to_laboratory",
        "comparison":"attacker_raw_power * 7 <= defender_raw_power",
        "hero_bonuses_included":False,
        "counter_weapons_included":False,
        "pre_shots_included":False,
        "effects_applied_to_database":False,
        "historically_certified_s2":False,
    }
