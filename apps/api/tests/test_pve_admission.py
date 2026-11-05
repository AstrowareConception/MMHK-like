"""US-COM-011: exact Jactari PvE flight, before shots and hero bonuses."""
from copy import deepcopy
from decimal import Decimal

import pytest

from mmhk_api.pve_admission import evaluate_pve_admission
from mmhk_api.pve_stack_sequence import resolve_ordinary_lines


def stack(code,number,power=10,weapon="R"):
    return {"unit_code":code,"count":number,"unit_power":power,
            "weapon_code":weapon}


def test_us_com_011_ca03_exactly_one_seventh_flees():
    check=evaluate_pve_admission([stack("militia",10)],[stack("wolves",70)])
    assert check["attacker_raw_power"]=="100"
    assert check["defender_raw_power"]=="700"
    assert check["threshold"]=="1/7"
    assert check["threshold_inclusive"] is True
    assert check["fled"] is True
    assert check["status"]=="fled_before_combat"


def test_above_threshold_is_admitted_without_rounding():
    assert not evaluate_pve_admission(
        [stack("militia",1000001,power=1)],
        [stack("wolves",1000000,power=7)]
    )["fled"]


def test_below_threshold_flees():
    assert evaluate_pve_admission(
        [stack("militia",1,power=10)],
        [stack("wolves",100,power=10)],
    )["fled"]


def test_hero_special_bonus_never_changes_raw_admission():
    attack=[stack("militia",10,10)]
    defend=[stack("wolves",70,10)]
    with_bonus=resolve_ordinary_lines(
        attack,defend,
        attacker_hero={"attack_points":1000,"defense_points":0,"source_ref":"LAB-HERO"},
    )
    plain=resolve_ordinary_lines(attack,defend)
    assert with_bonus["admission"]==plain["admission"]
    assert with_bonus["verdict"]=="fled"
    assert with_bonus["attacker_hero_profile_applied"] is False


def test_flee_preempts_pre_shots_and_all_duels():
    attack=[stack("archers",1,10)]
    defend=[stack("wolves",70,10)]
    before_a,before_d=deepcopy(attack),deepcopy(defend)
    action={"side":"attacker","kind":"barrage",
            "percent":Decimal("1000"),"source_ref":"LAB-BARRAGE"}
    result=resolve_ordinary_lines(
        attack,defend,
        pre_shot_actions=[action],
        pre_shot_context={"attacker_has_hero":True},
    )
    assert result["verdict"]=="fled"
    assert result["combat_started"] is False
    assert result["events"]==[]
    assert result["pre_shots"]["events"]==[]
    assert result["pre_shots"]["configured"] is False
    assert result["pre_shots"]["remaining_after_shots"]=={
        "attacker":[1],"defender":[70],
    }
    assert not result["permanent_losses_applied"]
    assert not result["experience_awarded"]
    assert not result["region_liberated"]
    assert attack==before_a and defend==before_d


def test_non_flee_has_recorded_admission_and_proceeds():
    result=resolve_ordinary_lines(
        [stack("militia",8,10)],[stack("wolves",8,10)]
    )
    assert result["admission"]["fled"] is False
    assert result["combat_started"] is True
    assert len(result["events"])==1


def test_seven_stacks_use_sum_of_raw_powers_not_first_stack():
    attack=[stack("militia",1,10),stack("archers",20,10)]
    defend=[stack("wolves",70,10)]
    assert not evaluate_pve_admission(attack,defend)["fled"]
    assert evaluate_pve_admission([attack[0]],defend)["fled"]


@pytest.mark.parametrize("armies",[
    ([],[stack("wolves",10)]),
    ([stack("militia",10)],[]),
    ([stack("militia",0)],[stack("wolves",10)]),
    ([stack("militia",10)],[stack("wolves",1,power=0)]),
    ([stack("militia",10)],[stack("wolves",1,power=float("nan"))]),
])
def test_invalid_or_zero_defender_never_becomes_free_victory(armies):
    with pytest.raises(ValueError):
        evaluate_pve_admission(*armies)


def test_replay_deterministic_and_without_side_effects():
    attack=[stack("archers",1)]
    defend=[stack("wolves",70)]
    a=resolve_ordinary_lines(attack,defend)
    assert a==resolve_ordinary_lines(attack,defend)
    assert a["scope"]=="LAB-ORDINARY-STACK-SEQUENCE"
    assert a["loot_awarded"] is False
