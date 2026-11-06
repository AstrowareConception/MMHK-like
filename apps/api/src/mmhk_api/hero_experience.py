"""V109: source-backed levels and explicit LAB-only PvE experience.

The historical Jactari _niveaux thresholds are stored in migration 107.
Award amounts are NOT reconstructed from an incomplete combat report: a
trusted operator qualifies each neutral encounter, before mission dispatch.
The worker awards only when V102 + V103 actually settle the same victory.
"""
from __future__ import annotations

from uuid import UUID

import psycopg

POLICY_ID = "LAB-PVE-QUALIFIED-XP-V1"
MAX_XP = 3_003_584
_KEYS = frozenset({
    "policy_id", "enabled", "policy_source_ref",
    "reward_source_ref", "experience_amount",
})


def _source(value: object) -> bool:
    return (
        type(value) is str and 3 <= len(value.strip()) <= 255
        and not any(ord(ch) < 32 or ord(ch) == 127 for ch in value)
    )


def validate_xp_snapshot(value: object) -> dict | None:
    """Legacy NULL is distinct from a malformed or deliberately disabled record."""
    if value is None:
        return None
    if type(value) is not dict or set(value) != _KEYS:
        raise ValueError("Corrupt frozen PvE experience snapshot")
    if value["policy_id"] != POLICY_ID or type(value["enabled"]) is not bool:
        raise ValueError("Unsupported frozen PvE experience policy")
    for name in ("policy_source_ref", "reward_source_ref"):
        if value[name] is not None and not _source(value[name]):
            raise ValueError("Invalid frozen PvE experience provenance")
    amount = value["experience_amount"]
    if amount is not None and (
        type(amount) is not int or not 1 <= amount <= MAX_XP
    ):
        raise ValueError("Invalid frozen PvE experience amount")
    if value["enabled"] and value["policy_source_ref"] is None:
        raise ValueError("Enabled XP policy has no source")
    if (amount is None) != (value["reward_source_ref"] is None):
        raise ValueError("Incomplete frozen XP qualification")
    return dict(value)


def historical_hero_level(db: psycopg.Connection, xp: int) -> int:
    if type(xp) is not int or not 0 <= xp <= 2**63-1:
        raise ValueError("Invalid stored hero experience")
    row = db.execute(
        """SELECT level FROM hero_xp_thresholds_v109
           WHERE required_xp<=%s ORDER BY level DESC LIMIT 1""",
        (xp,),
    ).fetchone()
    if row is None:
        raise ValueError("Missing verified historical level thresholds")
    return row[0]


def hero_progress(db: psycopg.Connection, *, level: int, xp: int) -> dict:
    expected = historical_hero_level(db, xp)
    next_row = db.execute(
        "SELECT level,required_xp FROM hero_xp_thresholds_v109 "
        "WHERE level=%s", (expected+1,),
    ).fetchone() if expected < 40 else None
    return {
        "level":level, "experience":xp,
        "source_policy":"JACTARI-CODE-01-LEVELS-1-40",
        "next_level":next_row[0] if next_row else None,
        "next_level_experience":next_row[1] if next_row else None,
        "experience_to_next_level":max(0,next_row[1]-xp) if next_row else None,
        "level_consistent_with_thresholds":level==expected,
        "max_level_rule_qualified":False,
        "historically_certified_s2":False,
    }


def qualify_lab_xp_reward(
    db: psycopg.Connection, *, encounter_id: UUID, experience_amount: int,
    source_ref: str,
) -> dict:
    if (type(encounter_id) is not UUID or
        type(experience_amount) is not int or
        not 1 <= experience_amount <= MAX_XP or not _source(source_ref)):
        raise ValueError("LAB XP needs an explicit source and a positive amount")
    source_ref = source_ref.strip()
    with db.transaction():
        neutral = db.execute(
            """SELECT e.encounter_id FROM region_encounters e
               JOIN cities c ON c.city_id=e.city_id
               JOIN pve_travel_policies t ON t.world_id=c.world_id
               JOIN pve_lab_neutral_defender_profiles n ON n.encounter_id=e.encounter_id
               WHERE e.encounter_id=%s AND NOT e.resolved
                 AND t.policy_id LIKE 'LAB-%%' AND NOT t.historically_certified
                 AND n.no_hero_confirmed AND n.no_attrition_confirmed
               FOR UPDATE OF e""",
            (encounter_id,),
        ).fetchone()
        if neutral is None:
            raise ValueError("Unresolved qualified LAB neutral required")
        previous = db.execute(
            """SELECT experience_amount,source_ref
               FROM pve_lab_xp_reward_qualifications WHERE encounter_id=%s""",
            (encounter_id,),
        ).fetchone()
        if previous is None:
            db.execute(
                """INSERT INTO pve_lab_xp_reward_qualifications(
                    encounter_id,experience_amount,source_ref)
                   VALUES(%s,%s,%s)""",
                (encounter_id,experience_amount,source_ref),
            )
        elif previous != (experience_amount,source_ref):
            raise ValueError("Existing LAB XP qualification is immutable")
    return {
        "encounter_id":str(encounter_id),
        "experience_amount":experience_amount,
        "source_ref":source_ref,
        "historically_certified_s2":False,
    }


def configure_lab_xp_policy(
    db: psycopg.Connection, *, world_id: str, enabled: bool,
    source_ref: str,
) -> dict:
    if (type(world_id) is not str or not 1 <= len(world_id) <= 120
        or type(enabled) is not bool or not _source(source_ref)):
        raise ValueError("Invalid LAB XP policy")
    with db.transaction():
        if db.execute(
            "SELECT world_id FROM worlds WHERE world_id=%s FOR UPDATE",
            (world_id,),
        ).fetchone() is None:
            raise ValueError("Unknown world")
        db.execute(
            """INSERT INTO pve_lab_xp_policies(
                 world_id,enabled,source_ref)
               VALUES(%s,%s,%s)
               ON CONFLICT(world_id) DO UPDATE SET
                 enabled=EXCLUDED.enabled,
                 source_ref=EXCLUDED.source_ref,
                 configured_at=clock_timestamp()""",
            (world_id,enabled,source_ref.strip()),
        )
    return {
        "world_id":world_id, "policy_id":POLICY_ID,
        "enabled_for_future_missions_only":enabled,
        "source_ref":source_ref.strip(),
        "historically_certified_s2":False,
    }


def award_pve_xp_if_qualified(
    db: psycopg.Connection, *, mission_id: UUID, hero_id: UUID,
    encounter_id: UUID, snapshot: object, neutral_resolution: dict,
) -> dict:
    """Runs under the due-mission row lock and its V102/V103 SQL transaction."""
    saved = validate_xp_snapshot(snapshot)
    result = {
        "status":"pre_v109_not_applicable" if saved is None else "policy_disabled",
        "policy_id":POLICY_ID, "experience_awarded":0,
        "before_level":None, "after_level":None,
        "historically_certified_s2":False,
    }
    if saved is None:
        return result
    if not saved["enabled"]:
        return result
    if saved["experience_amount"] is None:
        result["status"]="reward_not_qualified"
        return result
    if neutral_resolution.get("status")!="resolved" or not neutral_resolution.get("encounter_resolved"):
        result["status"]="neutral_not_resolved"
        return result
    row = db.execute(
        """SELECT h.experience,h.level FROM city_heroes h
           JOIN pve_missions m ON m.hero_id=h.hero_id AND m.city_id=h.city_id
           WHERE h.hero_id=%s AND m.mission_id=%s
             AND m.encounter_id=%s AND m.stage='outbound'
           FOR UPDATE OF h""",
        (hero_id,mission_id,encounter_id),
    ).fetchone()
    if row is None:
        raise ValueError("Hero or mission changed before XP settlement")
    before, level = row
    if level != historical_hero_level(db,before):
        raise ValueError("Stored hero level disagrees with Jactari XP thresholds")
    amount = saved["experience_amount"]
    after = before + amount
    if after > MAX_XP:
        # Never guess whether S2 caps XP, carries excess, or pays another reward.
        result["status"]="max_level_reward_not_qualified"
        return result
    next_level = historical_hero_level(db,after)
    db.execute(
        """UPDATE city_heroes SET experience=%s,level=%s
           WHERE hero_id=%s AND experience=%s AND level=%s""",
        (after,next_level,hero_id,before,level),
    )
    db.execute(
        """INSERT INTO pve_lab_xp_awards(
             mission_id,hero_id,encounter_id,policy_id,
             policy_source_ref,reward_source_ref,
             experience_awarded,before_experience,after_experience,
             before_level,after_level)
           VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (mission_id,hero_id,encounter_id,POLICY_ID,
         saved["policy_source_ref"],saved["reward_source_ref"],
         amount,before,after,level,next_level),
    )
    return {
        **result, "status":"awarded", "experience_awarded":amount,
        "before_experience":before, "after_experience":after,
        "before_level":level, "after_level":next_level,
        "policy_source_ref":saved["policy_source_ref"],
        "reward_source_ref":saved["reward_source_ref"],
    }
