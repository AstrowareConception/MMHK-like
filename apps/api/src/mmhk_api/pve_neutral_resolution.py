"""V103 qualified no-hero, no-attrition neutral encounter resolution.

Historical Jactari reference: combat.min.js defender report when statut=0
and id_heros is null. Without attrition_pnj, attacking victory loses the
whole neutral starting line; defending victory loses none.

Only an explicitly selected LAB world and qualified neutral profile may
persist the resolved encounter flag. Mine yields, territory, XP and loot
remain untouched and are NEVER inferred.
"""
from __future__ import annotations

from decimal import Decimal, InvalidOperation
from uuid import UUID

import psycopg

POLICY_ID="LAB-NEUTRAL-NO-HERO-RESOLUTION-V1"
_KEYS=frozenset({
    "policy_id","enabled","source_ref","no_hero_verified",
    "no_attrition_verified","profile_source_ref",
})


def _source(value: object) -> bool:
    return (type(value) is str and 3<=len(value.strip())<=255
            and not any(ord(c)<32 or ord(c)==127 for c in value))


def validate_neutral_resolution_snapshot(raw: object) -> dict | None:
    if raw is None:
        return None
    if type(raw) is not dict or set(raw)!=_KEYS:
        raise ValueError("Invalid frozen neutral resolution input")
    if raw["policy_id"]!=POLICY_ID:
        raise ValueError("Unsupported frozen neutral resolution policy")
    if any(type(raw[f]) is not bool for f in (
        "enabled","no_hero_verified","no_attrition_verified"
    )):
        raise ValueError("Invalid frozen neutral qualification flags")
    for field in ("source_ref","profile_source_ref"):
        if raw[field] is not None and not _source(raw[field]):
            raise ValueError("Invalid frozen neutral provenance")
    if raw["enabled"] and raw["source_ref"] is None:
        raise ValueError("Enabled neutral resolution lacks policy provenance")
    if (raw["no_hero_verified"] or raw["no_attrition_verified"]) and (
        raw["profile_source_ref"] is None
    ):
        raise ValueError("Qualified neutral resolution lacks profile provenance")
    return dict(raw)


def ordinary_neutral_casualties(
    initial: int, *, attacker_victory: bool,
    no_hero_confirmed: bool, no_attrition_confirmed: bool,
) -> dict:
    """No hero/no attrition: attacker victory kills all, otherwise zero.

    This is NOT the usual 0.30 hero-soldier conversion. Other neutral
    profiles must use separately qualified code.
    """
    if type(initial) is not int or not 1<=initial<=1_000_000:
        raise ValueError("Invalid neutral original unit count")
    if any(type(x) is not bool for x in (
        attacker_victory,no_hero_confirmed,no_attrition_confirmed
    )):
        raise ValueError("Neutral victory and qualification must be boolean")
    if not (no_hero_confirmed and no_attrition_confirmed):
        raise ValueError("No-hero and non-attrition neutral evidence required")
    deaths=initial if attacker_victory else 0
    return {
        "initial":initial,"permanent_deaths":deaths,
        "survivors":initial-deaths,
        "policy_id":POLICY_ID,
        "source_branch":"JACTARI-PNJ-DEFENDER-NO-HERO-NO-ATTRITION",
        "historically_certified_s2":False,
    }


def _result(snap: dict | None, status: str) -> dict:
    return {
        "status":status,"policy_id":POLICY_ID,
        "policy_source_ref":snap["source_ref"] if snap else None,
        "profile_source_ref":snap["profile_source_ref"] if snap else None,
        "neutral_deaths":0,"encounter_resolved":False,
        "mine_activated":False,"loot_awarded":False,
        "experience_awarded":False,"territory_captured":False,
        "historically_certified_s2":False,
    }


def plan_neutral_resolution(
    snapshot: object, verified_line: dict, sequence: dict,
    attacker_settlement: dict,
) -> dict:
    """Explicit status or independently qualified plan; never silent fallback."""
    saved=validate_neutral_resolution_snapshot(snapshot)
    if saved is None:
        return _result(None,"pre_v103_not_applicable")
    if not saved["enabled"]:
        return _result(saved,"policy_disabled")
    if not (saved["no_hero_verified"] and saved["no_attrition_verified"]):
        return _result(saved,"neutral_profile_unqualified")
    if type(attacker_settlement) is not dict or attacker_settlement.get("status")!="applied":
        return _result(saved,"attacker_settlement_not_qualified")
    verdict=sequence.get("verdict")
    if verdict=="fled":
        return _result(saved,"flight_no_resolution")
    if verdict=="defender":
        # With no attrition the defending NPC remains unchanged after victory.
        result=_result(saved,"neutral_defended")
        result["neutral_casualties"]=ordinary_neutral_casualties(
            verified_line["defender"][0]["count"],
            attacker_victory=False,
            no_hero_confirmed=True,no_attrition_confirmed=True,
        )
        return result
    if verdict!="attacker":
        return _result(saved,"draw_or_unknown_outcome")
    if not sequence.get("weapon_classification_complete"):
        return _result(saved,"weapon_classification_incomplete")
    if sequence.get("pre_shots",{}).get("configured"):
        return _result(saved,"pre_shots_not_qualified")
    events=sequence.get("events")
    if type(events) is not list or not events or any(
        e.get("ending",{}).get("kind")!="ordinary" for e in events
    ):
        return _result(saved,"special_ending_not_qualified")
    original=verified_line.get("defender")
    ended=sequence.get("defender")
    if type(original) is not list or type(ended) is not list or len(original)!=1 or len(ended)!=1:
        raise ValueError("Invalid frozen neutral defender line")
    initial=original[0]["count"]
    if (type(initial) is not int or
        ended[0].get("initial")!=initial or
        ended[0].get("unit_code")!=original[0]["unit_code"] or
        ended[0].get("remaining")!=0 or
        ended[0].get("position")!=original[0]["position"]):
        raise ValueError("Neutral result contradicts the frozen defender")
    casualties=ordinary_neutral_casualties(
        initial,attacker_victory=True,
        no_hero_confirmed=True,no_attrition_confirmed=True,
    )
    out=_result(saved,"eligible")
    out["neutral_deaths"]=casualties["permanent_deaths"]
    out["neutral_casualties"]=casualties
    return out


def resolve_neutral_if_qualified(
    db: psycopg.Connection, *, mission_id: UUID, encounter_id: UUID,
    snapshot: object, verified_line: dict, sequence: dict,
    attacker_settlement: dict,
) -> dict:
    """Within the worker's atomic V102 transaction; caller owns the mission lock."""
    result=plan_neutral_resolution(
        snapshot,verified_line,sequence,attacker_settlement,
    )
    if result["status"]!="eligible":
        return result
    original=verified_line["defender"][0]
    row=db.execute(
        """SELECT e.resolved,e.unit_code,e.unit_count,e.unit_power,e.source_ref
           FROM region_encounters e
           JOIN pve_missions m ON m.encounter_id=e.encounter_id
              AND m.city_id=e.city_id
           WHERE m.mission_id=%s AND e.encounter_id=%s
           FOR UPDATE OF e""",
        (mission_id,encounter_id),
    ).fetchone()
    if row is None or row[0]:
        raise ValueError("Neutral encounter is missing or already resolved")
    if (row[1]!=original["unit_code"] or row[2]!=original["count"]
        or row[4]!=original["source_ref"]
        or Decimal(row[3])!=Decimal(str(original["unit_power"]))):
        raise ValueError("Neutral encounter changed after frozen dispatch")
    updated=db.execute(
        """UPDATE region_encounters SET resolved=true
           WHERE encounter_id=%s AND NOT resolved
           RETURNING encounter_id""",(encounter_id,),
    ).fetchone()
    if updated is None:
        raise ValueError("Neutral resolution lost concurrent eligibility")
    db.execute(
        """INSERT INTO pve_lab_neutral_resolutions(
             mission_id,encounter_id,policy_id,source_ref,
             profile_source_ref,original_count,neutral_deaths)
           VALUES(%s,%s,%s,%s,%s,%s,%s)""",
        (mission_id,encounter_id,POLICY_ID,
         result["policy_source_ref"],result["profile_source_ref"],
         original["count"],result["neutral_deaths"]),
    )
    result["status"]="resolved"
    result["encounter_resolved"]=True
    return result


def qualify_lab_neutral_defender(
    db: psycopg.Connection, *, encounter_id: UUID, source_ref: str,
) -> dict:
    if not _source(source_ref):
        raise ValueError("Explicit neutral source reference required")
    with db.transaction():
        row=db.execute(
            """SELECT e.encounter_id FROM region_encounters e
               JOIN cities c ON c.city_id=e.city_id
               JOIN pve_travel_policies t ON t.world_id=c.world_id
               WHERE e.encounter_id=%s AND NOT e.resolved
                 AND left(t.policy_id,4)='LAB-' AND NOT t.historically_certified
               FOR UPDATE OF e""",(encounter_id,),
        ).fetchone()
        if row is None:
            raise ValueError("Neutral must belong to an unresolved LAB encounter")
        existing=db.execute(
            """SELECT source_ref FROM pve_lab_neutral_defender_profiles
               WHERE encounter_id=%s""",(encounter_id,),
        ).fetchone()
        if existing is not None and existing[0]!=source_ref.strip():
            raise ValueError("Neutral qualification is already recorded with another source")
        if existing is None:
            db.execute(
                """INSERT INTO pve_lab_neutral_defender_profiles(
                     encounter_id,no_hero_confirmed,
                     no_attrition_confirmed,source_ref)
                   VALUES(%s,true,true,%s)""",
                (encounter_id,source_ref.strip()),
            )
    return {
        "encounter_id":str(encounter_id),"no_hero_confirmed":True,
        "no_attrition_confirmed":True,"source_ref":source_ref.strip(),
        "historically_certified":False,
    }


def configure_lab_neutral_resolution(
    db: psycopg.Connection, *, world_id: str, enabled: bool,
    source_ref: str,
) -> dict:
    if type(world_id) is not str or not 1<=len(world_id)<=120:
        raise ValueError("Invalid world ID")
    if type(enabled) is not bool or not _source(source_ref):
        raise ValueError("Invalid explicitly documented neutral resolution policy")
    with db.transaction():
        world=db.execute(
            "SELECT world_id FROM worlds WHERE world_id=%s FOR UPDATE",
            (world_id,),
        ).fetchone()
        if world is None:
            raise ValueError("Unknown world")
        db.execute(
            """INSERT INTO pve_lab_neutral_resolution_policies(
                 world_id,enabled,source_ref)
               VALUES(%s,%s,%s)
               ON CONFLICT(world_id) DO UPDATE SET
                 enabled=EXCLUDED.enabled,source_ref=EXCLUDED.source_ref,
                 configured_at=clock_timestamp()""",
            (world_id,enabled,source_ref.strip()),
        )
    return {
        "world_id":world_id,"enabled_for_future_missions_only":enabled,
        "policy_id":POLICY_ID,"source_ref":source_ref.strip(),
        "historically_certified":False,
    }
