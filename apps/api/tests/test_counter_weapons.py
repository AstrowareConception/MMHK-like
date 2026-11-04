"""US-COM-004 — explicit counter-weapon fixtures and battle sequencing."""
import pytest

from mmhk_api.counter_weapons import counter_weapon_bonuses
from mmhk_api.pve_stack_sequence import resolve_ordinary_lines


def unit(code, weapon, count=100, power=100):
    return {
        "unit_code":code, "weapon_code":weapon,
        "count":count,"unit_power":power,
    }


@pytest.mark.parametrize("attacker,defender",[
    ("I","C"),("R","I"),("C","R"),
])
def test_us_com_004_ca01_only_advantaged_side_receives_fifty_percent(attacker,defender):
    bonus=counter_weapon_bonuses(attacker,defender)
    assert bonus["qualified"] is True
    assert bonus["attacker_bonus"]=="0.50"
    assert bonus["defender_bonus"]=="0"
    swapped=counter_weapon_bonuses(defender,attacker)
    assert swapped["attacker_bonus"]=="0"
    assert swapped["defender_bonus"]=="0.50"


@pytest.mark.parametrize("attacker,defender",[
    ("E","I"),("I","E"),("E","R"),("C","E"),("E","E"),
    ("I","I"),("R","R"),("C","C"),
])
def test_us_com_004_ca02_other_and_equal_weapons_have_no_invented_relation(attacker,defender):
    bonus=counter_weapon_bonuses(attacker,defender)
    assert bonus["qualified"] is True
    assert bonus["attacker_bonus"]=="0"
    assert bonus["defender_bonus"]=="0"


def test_us_com_004_ca03_fictitious_hundred_units_power_hundred():
    report=resolve_ordinary_lines(
        [unit("infantry","I")],
        [unit("cavalry","C")],
    )
    event=report["events"][0]
    assert event["total_power"]=={"attacker":15000.0,"defender":10000.0}
    assert event["counter_weapons"]["attacker_bonus"]=="0.50"
    assert report["counter_weapon_policy"]=="jactari-counter-weapons-v1"
    assert report["weapon_classification_complete"] is True
    assert report["permanent_losses_applied"] is False


def test_counter_relation_is_recomputed_for_next_defender_stack():
    report=resolve_ordinary_lines(
        [unit("infantry","I",count=100)],
        [unit("cavalry","C",count=1),unit("archer","R",count=1)],
    )
    assert len(report["events"])==2
    assert report["events"][0]["counter_weapons"]["attacker_bonus"]=="0.50"
    assert report["events"][1]["counter_weapons"]["attacker_bonus"]=="0"
    assert report["events"][1]["counter_weapons"]["defender_bonus"]=="0.50"
    assert report["events"][1]["started"]["attacker"] == report["events"][0]["remaining"]["attacker"]


def test_unknown_weapon_never_inferred_from_name():
    report=resolve_ordinary_lines(
        [unit("infantry","I",count=100)],
        [unit("cavalry",None,count=1)],
    )
    assert report["weapon_classification_complete"] is False
    assert report["events"][0]["counter_weapons"]["qualified"] is False
    assert report["events"][0]["counter_weapons"]["attacker_bonus"]=="0"


@pytest.mark.parametrize("invalid",["A","infantry","",1,True])
def test_reject_unsupported_weapon_codes(invalid):
    with pytest.raises(ValueError):
        counter_weapon_bonuses(invalid,"I")
    with pytest.raises(ValueError):
        resolve_ordinary_lines(
            [unit("infantry",invalid)], [unit("archers","R")],
        )


def test_ca04_is_pure_no_side_effect_or_fatigue():
    attacker=[unit("infantry","I",count=90)]
    defender=[unit("cavalry","C",count=2),unit("cavalry_two","C",count=2)]
    first=resolve_ordinary_lines(attacker,defender)
    assert first==resolve_ordinary_lines(attacker,defender)
    assert first["region_liberated"] is False
    assert first["experience_awarded"] is False
    assert first["events"][1]["started"]["attacker"]==first["events"][0]["remaining"]["attacker"]
