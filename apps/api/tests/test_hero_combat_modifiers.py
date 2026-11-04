"""US-COM-005: hero percentage versus per-unit fixed bonus."""
from decimal import Decimal

import pytest

from mmhk_api.hero_combat_modifiers import hero_combat_modifiers
from mmhk_api.pve_stack_sequence import resolve_ordinary_lines


def soldier(code,count=100,power=100):
    return {"unit_code":code,"count":count,"unit_power":power,"weapon_code":"E"}


def test_half_percent_per_hero_attack_point():
    bonus=hero_combat_modifiers(
        attack_points=10,defense_points=6,source_ref="LAB-HERO-10",
    )
    assert bonus["attackStackHero"]=="0.050"
    assert bonus["defendStackHero"]=="0.030"
    assert bonus["conditional_talents_applied"] is False


def test_fixed_per_unit_is_not_a_percent():
    hero={
        "attack_points":10,"defense_points":0,
        "attack_per_unit":Decimal("3"),
        "defense_per_unit":Decimal("0"),
        "source_ref":"LAB-HERO-10",
    }
    report=resolve_ordinary_lines(
        [soldier("militia")],[soldier("wolves")],attacker_hero=hero,
    )
    event=report["events"][0]
    # Base 100*100=10000; hero 10*0.5%=500; flat 100*3=300.
    assert event["total_power"]["attacker"]==10800.0
    assert event["total_power"]["defender"]==10000.0
    assert event["hero_attributes"]["attackStackHero"]=="0.050"
    assert event["hero_attributes"]["attackUnitsHero"]=="3"
    assert report["attacker_hero_profile_applied"] is True
    assert report["permanent_losses_applied"] is False


def test_unqualified_hero_does_not_gain_fabricated_attributes():
    report=resolve_ordinary_lines(
        [soldier("militia")],[soldier("wolves")],
    )
    assert report["attacker_hero_profile_applied"] is False
    assert report["events"][0]["hero_attributes"] is None
    assert report["events"][0]["total_power"]["attacker"]==10000.0


@pytest.mark.parametrize("wrong",[
    {"attack_points":None,"defense_points":0,"source_ref":"LAB-01"},
    {"attack_points":True,"defense_points":0,"source_ref":"LAB-01"},
    {"attack_points":-1,"defense_points":0,"source_ref":"LAB-01"},
    {"attack_points":1001,"defense_points":0,"source_ref":"LAB-01"},
    {"attack_points":1,"defense_points":0,"source_ref":""},
    {"attack_points":1,"defense_points":0,
     "attack_per_unit":Decimal("NaN"),"source_ref":"LAB-01"},
])
def test_unknown_or_invalid_hero_profile_rejected(wrong):
    with pytest.raises(ValueError):
        hero_combat_modifiers(**wrong)


def test_hero_attributes_are_recomputed_without_fatigue():
    hero={"attack_points":5,"defense_points":0,"source_ref":"LAB-01"}
    report=resolve_ordinary_lines(
        [soldier("militia",100)],[soldier("wolves",1),soldier("bandits",1)],
        attacker_hero=hero,
    )
    assert len(report["events"])==2
    assert all(e["hero_attributes"]["attackStackHero"]=="0.025"
               for e in report["events"])
    assert report["events"][1]["started"]["attacker"]==report["events"][0]["remaining"]["attacker"]
