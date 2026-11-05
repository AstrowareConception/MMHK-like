"""Immutable encounter inputs for an already dispatched PvE laboratory mission.

V100 freezes new mission opponents in a PostgreSQL BEFORE INSERT trigger,
not from mutable encounter rows at arrival. Older missions retain NULL
snapshots and must be reported as a distinct, explicitly legacy path.
"""
from __future__ import annotations

from math import isfinite
import re

POLICY_ID="LAB-PVE-DEFENDER-AT-DEPARTURE-V1"
_UNIT=re.compile(r"^[a-z][a-z0-9_]{0,47}$")


def validate_defender_snapshot(raw: object) -> dict:
    """Reject corrupt snapshots; never substitute a live opponent silently."""
    if type(raw) is not dict or set(raw)!={
        "policy_id","unit_code","unit_count","unit_power","source_ref",
    }:
        raise ValueError("Missing or malformed frozen PvE opponent")
    if raw["policy_id"] != POLICY_ID:
        raise ValueError("Unsupported frozen PvE opponent policy")
    code,count,power,reference=(
        raw["unit_code"],raw["unit_count"],
        raw["unit_power"],raw["source_ref"],
    )
    if type(code) is not str or not _UNIT.fullmatch(code):
        raise ValueError("Invalid frozen opponent unit")
    if type(count) is not int or not 1 <= count <= 1_000_000:
        raise ValueError("Invalid frozen opponent count")
    if (type(power) not in (int,float) or not isfinite(power)
        or not 0<power<=1_000_000):
        raise ValueError("Invalid frozen opponent power")
    if reference is not None and (
        type(reference) is not str or not 3<=len(reference)<=255
    ):
        raise ValueError("Invalid frozen opponent provenance")
    return {
        "policy_id":POLICY_ID,"unit_code":code,
        "unit_count":count,"unit_power":float(power),
        "source_ref":reference,
    }


def legacy_opponent_at_arrival(count: object,power: object) -> dict:
    """Explicitly mark old, non-frozen missions (never counterfeit a snapshot)."""
    if (type(count) is not int or not 1<=count<=1_000_000
        or type(power) not in (int,float) or not isfinite(power)
        or not 0<power<=1_000_000):
        raise ValueError("Legacy PvE opponent has invalid current strength")
    return {
        "policy_id":"LEGACY-PVE-LIVE-AT-ARRIVAL",
        "unit_code":None,"unit_count":count,
        "unit_power":float(power),"source_ref":None,
    }
