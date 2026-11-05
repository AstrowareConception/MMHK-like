"""Immutable PvE opponent validation, including legacy transparency."""
import pytest

from mmhk_api.pve_encounter_snapshot import (
    POLICY_ID,validate_defender_snapshot,legacy_opponent_at_arrival,
)


def valid():
    return {
        "policy_id":POLICY_ID,
        "unit_code":"wolves",
        "unit_count":12,
        "unit_power":1.25,
        "source_ref":"TEST-MISSION",
    }


def test_current_snapshot_keeps_original_inputs():
    source=valid()
    out=validate_defender_snapshot(source)
    assert out==source
    source["unit_count"]=999
    assert out["unit_count"]==12


@pytest.mark.parametrize("field,value",[
    ("policy_id","unsupported"),
    ("unit_code",""),
    ("unit_code","../../hack"),
    ("unit_count",0),
    ("unit_count",True),
    ("unit_count",1000001),
    ("unit_power",0),
    ("unit_power",float("inf")),
    ("unit_power",float("nan")),
    ("source_ref","a"),
])
def test_frozen_snapshot_invalid_input_rejected(field,value):
    source=valid()
    source[field]=value
    with pytest.raises(ValueError):
        validate_defender_snapshot(source)


def test_missing_or_extra_keys_fail_closed():
    for damaged in (
        {k:v for k,v in valid().items() if k!="unit_count"},
        {**valid(),"secret":"unsigned"},
        [],
        None,
    ):
        with pytest.raises(ValueError):
            validate_defender_snapshot(damaged)


def test_legacy_source_is_not_disguised_as_a_departure_snapshot():
    legacy=legacy_opponent_at_arrival(4,1.0)
    assert legacy["policy_id"]=="LEGACY-PVE-LIVE-AT-ARRIVAL"
    assert legacy["unit_count"]==4
    assert legacy["unit_code"] is None
    assert legacy["source_ref"] is None


@pytest.mark.parametrize("count,power",[(0,1.0),(True,1.0),(4,0),(4,float("nan"))])
def test_corrupt_legacy_opponent_rejected(count,power):
    with pytest.raises(ValueError):
        legacy_opponent_at_arrival(count,power)
