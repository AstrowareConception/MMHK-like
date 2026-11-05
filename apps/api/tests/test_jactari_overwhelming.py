"""US-COM-009 strict Jactari overwhelm, sentinel and replay safety."""
from copy import deepcopy
import pytest
from jactari.duel import resolve_stack_duel
from mmhk_api.jactari_overwhelming import explain_overwhelming
from mmhk_api.pve_stack_sequence import resolve_ordinary_lines


def duel(bonus):
    return resolve_stack_duel({
        "attacker":{"count":10,"unitPower":10},
        "defender":{"count":10,"unitPower":10},
        "modifiers":{"attackStackHero":bonus},
    })


def test_exact_equality_to_base_is_not_overwhelming():
    result=duel(1.0)
    assert result["totalPower"]["attacker"]==200
    assert result["totalPower"]["defender"]==100
    assert result["losses"]["attacker"]==0
    check=explain_overwhelming(result)
    assert check["winner"]=="attacker"
    assert check["power_delta_after_floor"]==check["winner_base_power"]==100
    assert check["overwhelming"] is False


def test_strictly_above_base_triggers_negative_one_sentinel():
    result=duel(1.01)
    assert result["losses"]["attacker"]==-1
    check=explain_overwhelming(result)
    assert check["overwhelming"] is True
    assert check["power_delta_after_floor"]>check["winner_base_power"]
    assert not check["persistent_casualties_applied"]


def test_draw_never_has_overwhelming_marker():
    result=duel(0)
    assert explain_overwhelming(result)["overwhelming"] is False


def test_inconsistent_or_invented_sentinel_is_rejected():
    result=duel(1.0)
    result["losses"]["attacker"]=-1
    with pytest.raises(ValueError,match="Inconsistent"):
        explain_overwhelming(result)


def test_nonfinite_or_missing_power_is_rejected():
    result=duel(1.01)
    result["totalPower"]["attacker"]=float("nan")
    with pytest.raises(ValueError):
        explain_overwhelming(result)


def test_multistack_report_keeps_overwhelming_without_durable_changes():
    attack=[{"unit_code":"militia","count":10,"unit_power":10}]
    defend=[{"unit_code":"wolves","count":10,"unit_power":10}]
    hero={"attack_points":200,"defense_points":0,"source_ref":"LAB-HERO-OVERWHELM"}
    before=deepcopy(attack)
    outcome=resolve_ordinary_lines(attack,defend,attacker_hero=hero)
    assert outcome["events"][0]["overwhelming"]["overwhelming"] is False
    assert outcome["events"][0]["overwhelming"]["power_delta_after_floor"]==100
    assert outcome["permanent_losses_applied"] is False
    assert attack==before
    assert outcome==resolve_ordinary_lines(attack,defend,attacker_hero=hero)
