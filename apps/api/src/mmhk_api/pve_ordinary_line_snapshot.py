"""Validate V101 server-frozen 1..7 ordinary lines without live fallbacks.

No unknown weapon classification, hero skill, reward, or durable casualty
rule is inferred from these inputs. V100-only missions remain separate.
"""
from __future__ import annotations

from math import isfinite
from re import compile as regex

from .pve_encounter_snapshot import validate_defender_snapshot

POLICY_ID = "LAB-PVE-ORDINARY-LINE-AT-DEPARTURE-V1"
_UNIT = regex(r"^[a-z][a-z0-9_]{0,47}$")
_WEAPONS = {None, "I", "R", "C", "E"}
_ATTACK_KEYS = frozenset({
    "position", "unit_code", "count", "unit_power", "weapon_code",
    "weapon_source_ref", "profile_policy_id",
})
_DEFEND_KEYS = _ATTACK_KEYS | {"source_ref"}


def _validated_stack(value: object, *, defender: bool) -> dict:
    expected = _DEFEND_KEYS if defender else _ATTACK_KEYS
    if type(value) is not dict or set(value) != expected:
        raise ValueError("Invalid frozen ordinary line stack shape")
    pos, code = value["position"], value["unit_code"]
    count, power = value["count"], value["unit_power"]
    weapon, wref = value["weapon_code"], value["weapon_source_ref"]
    policy = value["profile_policy_id"]
    if type(pos) is not int or not 1 <= pos <= 7:
        raise ValueError("Invalid frozen ordinary line position")
    if type(code) is not str or not _UNIT.fullmatch(code):
        raise ValueError("Invalid frozen ordinary line unit")
    if type(count) is not int or not 1 <= count <= 1_000_000:
        raise ValueError("Invalid frozen ordinary line quantity")
    if type(power) not in (int, float) or not isfinite(power) or not 0 < power <= 1_000_000:
        raise ValueError("Invalid frozen ordinary line unit power")
    if weapon is not None and (
        type(weapon) is not str or weapon not in _WEAPONS
    ):
        raise ValueError("Invalid frozen ordinary line weapon classification")
    if (weapon is None) != (wref is None):
        raise ValueError("Frozen ordinary line weapon provenance mismatch")
    if wref is not None and (
        type(wref) is not str or not 3 <= len(wref) <= 255
    ):
        raise ValueError("Invalid frozen ordinary line weapon source")
    if type(policy) is not str or not 3 <= len(policy) <= 120:
        raise ValueError("Invalid frozen ordinary line profile policy")
    if defender:
        source = value["source_ref"]
        if source is not None and (
            type(source) is not str or not 3 <= len(source) <= 255
        ):
            raise ValueError("Invalid frozen ordinary line defender source")
    return dict(value, unit_power=float(power))


def validate_ordinary_line_snapshot(raw: object, defender_v100: object) -> dict:
    """Refuse corrupted V101 input instead of rereading changed live profiles."""
    defender_original = validate_defender_snapshot(defender_v100)
    if type(raw) is not dict or set(raw) != {"policy_id", "attacker", "defender"}:
        raise ValueError("Missing or malformed frozen ordinary line")
    if raw["policy_id"] != POLICY_ID:
        raise ValueError("Unsupported frozen ordinary line policy")
    a, d = raw["attacker"], raw["defender"]
    if (type(a) is not list or not 1 <= len(a) <= 7
        or type(d) is not list or len(d) != 1):
        raise ValueError("Invalid frozen ordinary line army sizes")
    attacker = [_validated_stack(x, defender=False) for x in a]
    defender = [_validated_stack(x, defender=True) for x in d]
    positions = [s["position"] for s in attacker]
    if positions != sorted(set(positions)) or defender[0]["position"] != 1:
        raise ValueError("Frozen ordinary line positions are not unique/ordered")
    original = defender[0]
    if (original["unit_code"] != defender_original["unit_code"]
        or original["count"] != defender_original["unit_count"]
        or original["unit_power"] != defender_original["unit_power"]
        or original["source_ref"] != defender_original["source_ref"]
        or original["profile_policy_id"] != defender_original["policy_id"]):
        raise ValueError("Frozen ordinary line defender contradicts V100")
    return {"policy_id": POLICY_ID, "attacker": attacker, "defender": defender}


def laboratory_lines(verified: dict) -> tuple[list[dict], list[dict]]:
    """Project frozen data into the existing seven-peloton laboratory."""
    def project(stacks: list[dict]) -> list[dict]:
        return [
            {"unit_code": s["unit_code"], "count": s["count"],
             "unit_power": s["unit_power"], "weapon_code": s["weapon_code"]}
            for s in stacks
        ]
    return project(verified["attacker"]), project(verified["defender"])
