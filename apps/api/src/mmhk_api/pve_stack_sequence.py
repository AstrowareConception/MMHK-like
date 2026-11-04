"""Bounded multi-stack sequencing laboratory for US-COM-008.

This module intentionally reuses the verified single-stack Jactari port
without pretending to reproduce spells, pre-shots, hero bonuses, counterarm
and resurrection. It resolves an ordered encounter without persistent effects.
A stack dispersed once never returns to the active line.
"""
from __future__ import annotations

from typing import Any
from math import isfinite

from jactari.duel import resolve_stack_duel

MAX_STACKS = 7
MAX_EXCHANGES = 98


def _validate_army(stacks: list[dict[str, Any]], label: str) -> list[dict]:
    if not isinstance(stacks, list) or not 1 <= len(stacks) <= MAX_STACKS:
        raise ValueError(f"{label}: expected one to seven ordinary stacks")
    result = []
    for index, stack in enumerate(stacks):
        if not isinstance(stack, dict) or set(stack) != {"unit_code", "count", "unit_power"}:
            raise ValueError(f"{label}: malformed stack")
        code, count, power = (stack["unit_code"], stack["count"], stack["unit_power"])
        if (not isinstance(code, str) or not 1 <= len(code) <= 48
            or not code.replace("_", "").isalnum()
            or type(count) is not int or not 1 <= count <= 1_000_000
            or type(power) not in (int, float)
            or not isfinite(power) or power <= 0 or power > 1_000_000):
            raise ValueError(f"{label}: invalid unit stack")
        result.append({
            "position": index + 1, "unit_code": code, "initial": count,
            "remaining": count, "unit_power": float(power), "dispersed": False,
        })
    return result


def resolve_ordinary_lines(attacker: list[dict], defender: list[dict]) -> dict:
    """Pure, deterministic, unmodified stack sequence.

    Only neutral, single-pair arithmetic is qualified here. The loser of an
    exchange is dispersed and removed from the active line; a winner carries
    the *remaining* count into the next exchange. Never infer durable deaths,
    XP or tile control from this output.
    """
    a = _validate_army(attacker, "attacker")
    d = _validate_army(defender, "defender")
    events: list[dict] = []
    a_index = d_index = 0

    while a_index < len(a) and d_index < len(d):
        if len(events) >= MAX_EXCHANGES:
            raise RuntimeError("Unexpectedly long laboratory combat")
        left, right = a[a_index], d[d_index]
        before_a, before_d = left["remaining"], right["remaining"]
        result = resolve_stack_duel({
            "attacker": {"count": before_a, "unitPower": left["unit_power"]},
            "defender": {"count": before_d, "unitPower": right["unit_power"]},
            "modifiers": {},
        })
        ra = result["remaining"]["attacker"]
        rd = result["remaining"]["defender"]
        lost_a = result["dispersed"]["attacker"]
        lost_d = result["dispersed"]["defender"]
        # An undecided state must not cause an infinite retry, nor be silently
        # adjudicated as a victory. Jactari marks false draws separately.
        if (type(ra) is not int or type(rd) is not int
            or not 0 <= ra <= before_a or not 0 <= rd <= before_d
            or not (lost_a or lost_d)
            or (lost_a and ra != 0) or (lost_d and rd != 0)):
            raise ValueError("Unsupported or inconsistent Jactari duel outcome")
        left["remaining"], right["remaining"] = ra, rd
        left["dispersed"] = lost_a
        right["dispersed"] = lost_d
        events.append({
            "exchange": len(events) + 1,
            "attacker_position": left["position"],
            "defender_position": right["position"],
            "attacker_unit_code": left["unit_code"],
            "defender_unit_code": right["unit_code"],
            "started": {"attacker": before_a, "defender": before_d},
            "remaining": {"attacker": ra, "defender": rd},
            "dispersed": {"attacker": lost_a, "defender": lost_d},
            "jactari_false_draw": result["falseDraw"],
            "jactari_draw": result["draw"],
            "attacker_survives_to_next_exchange": not lost_a,
            "defender_survives_to_next_exchange": not lost_d,
        })
        if lost_a:
            a_index += 1
        if lost_d:
            d_index += 1

    attack_alive = a_index < len(a)
    defend_alive = d_index < len(d)
    verdict = (
        "attacker" if attack_alive and not defend_alive else
        "defender" if defend_alive and not attack_alive else "draw"
    )
    return {
        "scope": "LAB-ORDINARY-STACK-SEQUENCE",
        "policy_id": "jactari-sequential-ordinary-v1",
        "verdict": verdict,
        "events": events,
        "attacker": a,
        "defender": d,
        "permanent_losses_applied": False,
        "experience_awarded": False,
        "loot_awarded": False,
        "region_liberated": False,
        "historically_certified": False,
        "excluded_mechanics": [
            "pre_shots", "counter_weapons", "hero_modifiers", "magic",
            "summons", "resurrections", "admission", "npc_casualty_policy",
        ],
    }
