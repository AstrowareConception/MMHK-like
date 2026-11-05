"""V102 opt-in atomic casualties for an explicitly qualified LAB ordinary hero.

Only the attacking hero's ordinary troops can lose durable units here. A
full S2 outcome would require distinct NPC, magic, summons, resurrection,
talent, XP, loot and tile-control rules. No such effects are inferred.
"""
from __future__ import annotations

from collections import defaultdict
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb

from .pve_casualties import ordinary_hero_permanent_losses

POLICY_ID = "LAB-PVE-ORDINARY-HERO-030-V1"
_KEYS = frozenset({
    "policy_id", "enabled", "source_ref", "zero_hero_profile",
    "hero_profile_source_ref",
})


def validate_casualty_policy_snapshot(raw: object) -> dict | None:
    """NULL is only a pre-V102 order; a malformed non-NULL snapshot fails."""
    if raw is None:
        return None
    if type(raw) is not dict or set(raw) != _KEYS:
        raise ValueError("Invalid frozen PvE attacker casualty policy")
    if raw["policy_id"] != POLICY_ID:
        raise ValueError("Unsupported frozen PvE attacker casualty policy")
    if type(raw["enabled"]) is not bool or type(raw["zero_hero_profile"]) is not bool:
        raise ValueError("Invalid frozen PvE attacker casualty flags")
    for field in ("source_ref", "hero_profile_source_ref"):
        v = raw[field]
        if v is not None and (type(v) is not str or not 3 <= len(v) <= 255):
            raise ValueError("Invalid frozen PvE attacker casualty source")
    if raw["enabled"] and raw["source_ref"] is None:
        raise ValueError("Enabled frozen PvE casualty policy has no provenance")
    if raw["zero_hero_profile"] and raw["hero_profile_source_ref"] is None:
        raise ValueError("Qualified zero-profile PvE hero has no provenance")
    return dict(raw)


def _status(raw: dict | None, status: str) -> dict:
    return {
        "status": status,
        "policy_id": POLICY_ID,
        "source_ref": raw["source_ref"] if raw else None,
        "hero_profile_source_ref": raw["hero_profile_source_ref"] if raw else None,
        "entries": [],
        "total_deaths": 0,
        "effects_applied": False,
        "attacker_only": True,
        "no_npc_losses": True,
        "no_xp": True,
        "no_loot": True,
        "no_liberation": True,
        "historically_certified": False,
    }


def plan_attacker_losses(snapshot: object, verified_line: dict, sequence: dict) -> dict:
    """Compute a controlled 30% baseline; zero missing data is not assumed.

    An unsupported duel does not mutate stocks but still produces an explicit
    status in the immutable mission report. A corrupt policy always raises.
    """
    policy = validate_casualty_policy_snapshot(snapshot)
    if policy is None:
        return _status(None, "pre_v102_no_settlement")
    if not policy["enabled"]:
        return _status(policy, "not_enabled")
    if not policy["zero_hero_profile"]:
        return _status(policy, "zero_hero_profile_not_qualified")
    if sequence.get("verdict") == "fled":
        return _status(policy, "fled_without_combat")
    if not sequence.get("weapon_classification_complete"):
        return _status(policy, "weapon_classification_incomplete")
    if sequence.get("pre_shots", {}).get("configured"):
        return _status(policy, "pre_shots_not_qualified")
    if sequence.get("verdict") not in ("attacker", "defender"):
        return _status(policy, "nonordinary_verdict")
    if (not sequence.get("events") or any(
        event.get("ending", {}).get("kind") != "ordinary"
        for event in sequence["events"]
    )):
        return _status(policy, "special_jactari_ending_not_qualified")
    attacker = sequence.get("attacker")
    originals = verified_line.get("attacker")
    if (type(attacker) is not list or type(originals) is not list
        or len(attacker) != len(originals)):
        raise ValueError("V102 sequence differs from frozen original formation")
    entries = []
    for actual, original in zip(attacker, originals):
        initial, remaining = actual.get("initial"), actual.get("remaining")
        if (actual.get("position") != original["position"]
            or actual.get("unit_code") != original["unit_code"]
            or type(initial) is not int or initial != original["count"]
            or type(remaining) is not int or not 0 <= remaining <= initial):
            raise ValueError("V102 sequence contradicts frozen attacking stack")
        dispersed = initial - remaining
        conversion = ordinary_hero_permanent_losses(dispersed)
        entries.append({
            "position": original["position"],
            "unit_code": original["unit_code"],
            "initial": initial,
            "simulated_remaining": remaining,
            "dispersed": dispersed,
            "permanent_deaths": conversion["permanent_deaths"],
            "conversion_policy_id": conversion["policy_id"],
        })
    result = _status(policy, "eligible")
    result["entries"] = entries
    result["total_deaths"] = sum(v["permanent_deaths"] for v in entries)
    return result


def settle_attacker_if_qualified(
    db: psycopg.Connection, *, mission_id: UUID, hero_id: UUID,
    snapshot: object, verified_line: dict, sequence: dict,
) -> dict:
    """Execute inside the worker's existing transaction, never via HTTP."""
    plan = plan_attacker_losses(snapshot, verified_line, sequence)
    if plan["status"] != "eligible":
        return plan
    expected = defaultdict(int)
    dead = defaultdict(int)
    for v in plan["entries"]:
        expected[v["unit_code"]] += v["initial"]
        dead[v["unit_code"]] += v["permanent_deaths"]
    current = dict(db.execute(
        """SELECT unit_code,quantity FROM hero_army_units WHERE hero_id=%s AND quantity>0
           ORDER BY unit_code FOR UPDATE""", (hero_id,),
    ).fetchall())
    # No direct or concurrent DB writer may make original troops reappear.
    if current != dict(expected):
        raise ValueError("V102 live hero stock differs from frozen dispatch")
    for code in sorted(dead):
        deaths = dead[code]
        if not deaths:
            continue
        result = db.execute(
            """UPDATE hero_army_units SET quantity=quantity-%s
               WHERE hero_id=%s AND unit_code=%s AND quantity=%s
               RETURNING quantity""",
            (deaths, hero_id, code, expected[code]),
        ).fetchone()
        if result is None or result[0] != expected[code] - deaths:
            raise ValueError("V102 atomic troop debit failed")
    if plan["total_deaths"] > 0:
        # The frozen mission report retains the old formation; the new
        # post-return formation must be explicitly confirmed by the player.
        db.execute("DELETE FROM hero_formation_slots WHERE hero_id=%s", (hero_id,))
    db.execute(
        """INSERT INTO pve_lab_casualty_settlements(
             mission_id,hero_id,policy_id,source_ref,total_deaths,entries
           ) VALUES(%s,%s,%s,%s,%s,%s)""",
        (mission_id, hero_id, POLICY_ID, plan["source_ref"],
         plan["total_deaths"], Jsonb(plan["entries"])),
    )
    plan["status"] = "applied"
    plan["effects_applied"] = plan["total_deaths"] > 0
    return plan


def configure_lab_casualties(
    db: psycopg.Connection, *, world_id: str, enabled: bool,
    source_ref: str,
) -> dict:
    """Trusted maintenance command. Never exposed to player API."""
    if type(enabled) is not bool:
        raise ValueError("Enabled must be boolean")
    if (type(source_ref) is not str or not 3 <= len(source_ref.strip()) <= 255
        or any(ord(ch) < 32 or ord(ch) == 127 for ch in source_ref)):
        raise ValueError("Documented experimental policy source is required")
    if type(world_id) is not str or not 1 <= len(world_id) <= 120:
        raise ValueError("Invalid world ID")
    with db.transaction():
        found = db.execute(
            "SELECT world_id FROM worlds WHERE world_id=%s FOR UPDATE", (world_id,),
        ).fetchone()
        if found is None:
            raise ValueError("Unknown world; policy not configured")
        db.execute(
            """INSERT INTO pve_lab_casualty_policies(
                 world_id,policy_id,enabled,source_ref
               ) VALUES(%s,%s,%s,%s)
               ON CONFLICT(world_id) DO UPDATE SET
                 enabled=EXCLUDED.enabled,source_ref=EXCLUDED.source_ref,
                 configured_at=clock_timestamp()""",
            (world_id,POLICY_ID,enabled,source_ref.strip()),
        )
    return {
        "world_id": world_id, "policy_id": POLICY_ID,
        "enabled_for_future_missions_only": enabled,
        "source_ref": source_ref.strip(),
        "historically_certified": False,
    }
