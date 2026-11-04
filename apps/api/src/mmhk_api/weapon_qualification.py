"""Operator-only assignment of Jactari weapon families with provenance.

Never derive I/R/C/E from a faction, unit name, or tier. These commands
are explicit maintenance actions; no player endpoint exposes writes.
"""
from __future__ import annotations

import re
from uuid import UUID

import psycopg

VALID_WEAPONS = frozenset(("I", "R", "C", "E"))
_UNIT = re.compile(r"^[a-z][a-z0-9_]{1,47}$")


def _validate(weapon: str, source_ref: str) -> None:
    if type(weapon) is not str or weapon not in VALID_WEAPONS:
        raise ValueError("Weapon must be I, R, C, or E")
    if (type(source_ref) is not str or
        not 3 <= len(source_ref.strip()) <= 255 or
        any(ord(c)<32 or ord(c)==127 for c in source_ref)):
        raise ValueError("Source reference must be a printable 3–255 character string")


def qualify_unit_weapon(db: psycopg.Connection, *, unit_code: str,
                        weapon: str, source_ref: str) -> dict:
    _validate(weapon,source_ref)
    if type(unit_code) is not str or not _UNIT.fullmatch(unit_code):
        raise ValueError("Invalid unit code")
    row=db.execute(
        """UPDATE city_unit_profiles
           SET combat_weapon_code=%s,combat_weapon_source_ref=%s
           WHERE unit_code=%s RETURNING unit_code,combat_weapon_code""",
        (weapon,source_ref.strip(),unit_code),
    ).fetchone()
    if row is None:
        raise ValueError("Unknown unit code")
    return {"unit_code":row[0],"weapon":row[1],"source_ref":source_ref.strip()}


def qualify_encounter_weapon(db: psycopg.Connection, *, encounter_id: UUID,
                             weapon: str, source_ref: str) -> dict:
    _validate(weapon,source_ref)
    if not isinstance(encounter_id,UUID):
        raise ValueError("Invalid encounter identifier")
    row=db.execute(
        """UPDATE region_encounters
           SET combat_weapon_code=%s,combat_weapon_source_ref=%s
           WHERE encounter_id=%s RETURNING encounter_id,combat_weapon_code""",
        (weapon,source_ref.strip(),encounter_id),
    ).fetchone()
    if row is None:
        raise ValueError("Unknown encounter")
    return {"encounter_id":str(row[0]),"weapon":row[1],"source_ref":source_ref.strip()}
