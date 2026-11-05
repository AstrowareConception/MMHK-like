"""V101 contract: immutable complete PvE lines and honest provenance."""
from copy import deepcopy

import pytest

from mmhk_api.pve_ordinary_line_snapshot import (
    POLICY_ID, laboratory_lines, validate_ordinary_line_snapshot,
)

def original():
    return {
        "policy_id": "LAB-PVE-DEFENDER-AT-DEPARTURE-V1",
        "unit_code": "wolves", "unit_count": 4,
        "unit_power": 1.25, "source_ref": "TEST-V101",
    }

def line():
    return {
        "policy_id": POLICY_ID,
        "attacker": [
            {"position": 1, "unit_code": "militia", "count": 3,
             "unit_power": 2.0, "weapon_code": "I",
             "weapon_source_ref": "LAB-CLASS-I",
             "profile_policy_id": "TEST-V101"},
            {"position": 7, "unit_code": "archers", "count": 5,
             "unit_power": 10, "weapon_code": None,
             "weapon_source_ref": None, "profile_policy_id": "TEST-V101"},
        ],
        "defender": [
            {"position": 1, "unit_code": "wolves", "count": 4,
             "unit_power": 1.25, "weapon_code": "C",
             "weapon_source_ref": "LAB-CLASS-C",
             "profile_policy_id": "LAB-PVE-DEFENDER-AT-DEPARTURE-V1",
             "source_ref": "TEST-V101"},
        ],
    }

def test_full_line_validation_preserves_slots_and_honest_unknowns():
    source = line()
    saved = validate_ordinary_line_snapshot(source, original())
    a, d = laboratory_lines(saved)
    assert [s["count"] for s in a] == [3, 5]
    assert [s["weapon_code"] for s in a] == ["I", None]
    assert d[0]["weapon_code"] == "C"
    source["attacker"][0]["count"] = 99
    assert a[0]["count"] == 3
    assert saved["attacker"][0]["position"] == 1

@pytest.mark.parametrize("field,value", [
    ("count", 0), ("count", True), ("count", 1_000_001),
    ("unit_power", 0), ("unit_power", float("inf")),
    ("position", 9), ("weapon_code", "X"), ("weapon_code", []),
    ("weapon_source_ref", None),
    ("profile_policy_id", "x"),
])
def test_invalid_attacker_snapshot_rejected(field, value):
    damaged = line()
    damaged["attacker"][0][field] = value
    with pytest.raises(ValueError, match="(?i)frozen ordinary line"):
        validate_ordinary_line_snapshot(damaged, original())

def test_reject_out_of_order_duplicate_or_too_many_slots():
    for changed in (
        list(reversed(line()["attacker"])),
        [line()["attacker"][0], line()["attacker"][0]],
        line()["attacker"] * 4,
    ):
        damaged = line()
        damaged["attacker"] = changed
        with pytest.raises(ValueError):
            validate_ordinary_line_snapshot(damaged, original())

def test_reject_divergence_from_v100_without_live_substitution():
    damaged = line()
    damaged["defender"][0]["count"] = 400
    with pytest.raises(ValueError, match="contradicts V100"):
        validate_ordinary_line_snapshot(damaged, original())
    broken = deepcopy(line())
    broken["defender"][0]["weapon_code"] = "I"
    broken["defender"][0]["weapon_source_ref"] = None
    with pytest.raises(ValueError):
        validate_ordinary_line_snapshot(broken, original())

def test_extra_field_or_unexpected_policy_fails_closed():
    for damaged in ({"policy_id": POLICY_ID}, {**line(), "extra": 1},
                    {**line(), "policy_id": "UNTRUSTED"}):
        with pytest.raises(ValueError):
            validate_ordinary_line_snapshot(damaged, original())
