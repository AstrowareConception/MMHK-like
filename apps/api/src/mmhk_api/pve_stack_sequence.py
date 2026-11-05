"""Bounded multi-stack sequencing laboratory for US-COM-008.

This module intentionally reuses the verified single-stack Jactari port
without pretending to reproduce spells, pre-shots, hero bonuses
and resurrection. Counter-weapons are applied only with known weapon codes. It resolves an ordered encounter without persistent effects.
A stack dispersed once never returns to the active line.
"""
from __future__ import annotations

from typing import Any
from math import isfinite

from jactari.duel import resolve_stack_duel
from .counter_weapons import counter_weapon_bonuses
from .hero_combat_modifiers import hero_combat_modifiers
from .conditional_hero_talents import conditional_attack_talent
from .pve_pre_shots import resolve_pre_shots
from .pve_admission import evaluate_pve_admission
from .jactari_duel_ending import classify_jactari_exchange

MAX_STACKS = 7
MAX_EXCHANGES = 98


def _validate_army(stacks: list[dict[str, Any]], label: str) -> list[dict]:
    if not isinstance(stacks, list) or not 1 <= len(stacks) <= MAX_STACKS:
        raise ValueError(f"{label}: expected one to seven ordinary stacks")
    result = []
    for index, stack in enumerate(stacks):
        if (not isinstance(stack, dict) or
            not {"unit_code", "count", "unit_power"}.issubset(stack)
            or set(stack) - {"unit_code", "count", "unit_power", "weapon_code"}):
            raise ValueError(f"{label}: malformed stack")
        code, count, power = (stack["unit_code"], stack["count"], stack["unit_power"])
        weapon = stack.get("weapon_code")
        counter_weapon_bonuses(weapon, weapon)  # Validate without guessing a class.
        if (not isinstance(code, str) or not 1 <= len(code) <= 48
            or not code.replace("_", "").isalnum()
            or type(count) is not int or not 1 <= count <= 1_000_000
            or type(power) not in (int, float)
            or not isfinite(power) or power <= 0 or power > 1_000_000):
            raise ValueError(f"{label}: invalid unit stack")
        result.append({
            "position": index + 1, "unit_code": code, "initial": count,
            "remaining": count, "unit_power": float(power),
            "weapon_code": weapon, "dispersed": False,
        })
    return result


def resolve_ordinary_lines(attacker: list[dict], defender: list[dict],
                           *, attacker_hero: dict | None = None,
                           attacker_talent: dict | None = None,
                           pre_shot_actions: list[dict] | None = None,
                           pre_shot_context: dict | None = None) -> dict:
    """Pure, deterministic, unmodified stack sequence.

    Only neutral, single-pair arithmetic is qualified here. The loser of an
    exchange is dispersed and removed from the active line; a winner carries
    the *remaining* count into the next exchange. Never infer durable deaths,
    XP or tile control from this output.
    """
    # This PvE laboratory supports only an explicitly qualified ATTACKER
    # hero; the neutral defender has no hero and gains no fictional stats.
    hero = hero_combat_modifiers(**attacker_hero) if attacker_hero is not None else None
    if attacker_talent is not None and hero is None:
        raise ValueError("Conditional hero talent requires qualified hero attributes")
    a = _validate_army(attacker, "attacker")
    d = _validate_army(defender, "defender")
    # US-COM-011: this gate precedes and ignores all battle modifiers,
    # even a qualified hero bonus or a configured pre-shot capability.
    admission=evaluate_pve_admission(attacker,defender)
    if admission["fled"]:
        empty_shots=resolve_pre_shots(
            [{"count":v["remaining"],"unit_power":v["unit_power"],
              "weapon_code":v["weapon_code"]} for v in a],
            [{"count":v["remaining"],"unit_power":v["unit_power"],
              "weapon_code":v["weapon_code"]} for v in d],
            [],
        )
        return {
            "scope":"LAB-ORDINARY-STACK-SEQUENCE",
            "policy_id":"jactari-sequential-ordinary-v1",
            "verdict":"fled","combat_started":False,
            "admission":admission,
            "events":[],"pre_shots":empty_shots,
            "attacker":a,"defender":d,
            "permanent_losses_applied":False,
            "experience_awarded":False,"loot_awarded":False,
            "region_liberated":False,"historically_certified":False,
            "counter_weapon_policy":"jactari-counter-weapons-v1",
            "attacker_hero_profile_applied":False,
            "attacker_conditional_talent_configured":attacker_talent is not None,
            "attacker_hero_profile":hero,
            "weapon_classification_complete":all(
                v["weapon_code"] is not None for v in [*a,*d]
            ),
            "excluded_mechanics":["pre_shots","all_duels","other_hero_talents",
                "magic","summons","resurrections","npc_casualty_policy"],
        }
    pre_shots=resolve_pre_shots(
        [{"count":stack["remaining"],"unit_power":stack["unit_power"],
          "weapon_code":stack["weapon_code"],"siege":stack.get("siege",False)}
         for stack in a],
        [{"count":stack["remaining"],"unit_power":stack["unit_power"],
          "weapon_code":stack["weapon_code"],"siege":stack.get("siege",False)}
         for stack in d],
        pre_shot_actions or [],**(pre_shot_context or {}),
    )
    for side,army in (("attacker",a),("defender",d)):
        for stack,lost in zip(army,pre_shots["simulated_losses"][side]):
            stack["pre_shot_losses"]=lost
            stack["remaining"]-=lost
            if stack["remaining"]==0:
                stack["dispersed"]=True
    events: list[dict] = []
    last_duel_ending: dict | None = None
    a_index = d_index = 0

    while True:
        while a_index<len(a) and a[a_index]["dispersed"]:
            a_index+=1
        while d_index<len(d) and d[d_index]["dispersed"]:
            d_index+=1
        if a_index>=len(a) or d_index>=len(d):
            break
        if len(events) >= MAX_EXCHANGES:
            raise RuntimeError("Unexpectedly long laboratory combat")
        left, right = a[a_index], d[d_index]
        before_a, before_d = left["remaining"], right["remaining"]
        counter = counter_weapon_bonuses(left["weapon_code"],right["weapon_code"])
        talent = conditional_attack_talent(
            attacker_weapon=left["weapon_code"],
            defender_weapon=right["weapon_code"],
            **attacker_talent,
        ) if attacker_talent is not None else None
        result = resolve_stack_duel({
            "attacker": {"count": before_a, "unitPower": left["unit_power"]},
            "defender": {"count": before_d, "unitPower": right["unit_power"]},
            "modifiers": {
                "attackWeapon": float(counter["attacker_bonus"]),
                "attackStackHero": float(hero["attackStackHero"]) if hero else 0,
                "attackSpecial": float(talent["additional_attack_fraction"]) if talent else 0,
                "attackUnitsHero": float(hero["attackUnitsHero"]) if hero else 0,
                "defendWeapon": float(counter["defender_bonus"]),
            },
        })
        ending=classify_jactari_exchange(result)
        ra = ending["remaining"]["attacker"]
        rd = ending["remaining"]["defender"]
        lost_a = ending["dispersed"]["attacker"]
        lost_d = ending["dispersed"]["defender"]
        # A source-backed false draw can exhaust the nominal winner
        # without marking that stack dispersed. Never replay a zero-count
        # stack, but preserve Jactari's final tiebreak marker separately.
        if not 0<=ra<=before_a or not 0<=rd<=before_d:
            raise ValueError("Invalid Jactari remaining count")
        left["remaining"], right["remaining"] = ra, rd
        left["dispersed"] = lost_a
        right["dispersed"] = lost_d
        left["exhausted"] = ending["exhausted_without_dispersion"]["attacker"]
        right["exhausted"] = ending["exhausted_without_dispersion"]["defender"]
        last_duel_ending=ending
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
            "ending":ending,
            "theoretical_dispersions":ending["theoretical_dispersions"],
            "removed_from_line":ending["removed_from_line"],
            "counter_weapons": counter,
            "hero_attributes": hero,
            "conditional_talent": talent,
            "total_power": result["totalPower"],
            "attacker_survives_to_next_exchange": not ending["removed_from_line"]["attacker"],
            "defender_survives_to_next_exchange": not ending["removed_from_line"]["defender"],
        })
        if ending["removed_from_line"]["attacker"]:
            a_index += 1
        if ending["removed_from_line"]["defender"]:
            d_index += 1

    attack_alive = a_index < len(a)
    defend_alive = d_index < len(d)
    verdict = (
        "attacker" if attack_alive and not defend_alive else
        "defender" if defend_alive and not attack_alive else
        last_duel_ending["verdict"]
        if last_duel_ending and last_duel_ending["kind"]=="false_draw"
        else "draw"
    )
    return {
        "scope": "LAB-ORDINARY-STACK-SEQUENCE",
        "policy_id": "jactari-sequential-ordinary-v1",
        "verdict": verdict,
        "combat_started":True,
        "admission":admission,
        "events": events,
        "last_duel_ending":last_duel_ending,
        "technical_tiebreak":last_duel_ending["false_draw_marker"]
          if not attack_alive and not defend_alive and
             last_duel_ending and last_duel_ending["kind"]=="false_draw" else 0,
        "pre_shots": pre_shots,
        "attacker": a,
        "defender": d,
        "permanent_losses_applied": False,
        "experience_awarded": False,
        "loot_awarded": False,
        "region_liberated": False,
        "historically_certified": False,
        "counter_weapon_policy": "jactari-counter-weapons-v1",
        "attacker_hero_profile_applied": hero is not None,
        "attacker_conditional_talent_configured": attacker_talent is not None,
        "attacker_hero_profile": hero,
        "weapon_classification_complete": all(
            t["weapon_code"] is not None for t in [*a,*d]
        ),
        "excluded_mechanics": [
            *([] if pre_shots["configured"] else ["pre_shots"]),
            "other_hero_talents", "magic",
            "summons", "resurrections", "admission", "npc_casualty_policy",
        ],
    }
