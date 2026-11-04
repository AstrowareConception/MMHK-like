"""US-COM-005: conditional specialized attack bonus only with counter advantage."""
from decimal import Decimal
import pytest

from mmhk_api.conditional_hero_talents import conditional_attack_talent
from mmhk_api.pve_stack_sequence import resolve_ordinary_lines


def stack(code,weapon,count=100,power=100):
    return {"unit_code":code,"weapon_code":weapon,"count":count,"unit_power":power}


HERO={"attack_points":0,"defense_points":0,"source_ref":"LAB-HERO-00"}
TALENT={"additional_bonus":Decimal("0.15"),"source_ref":"LAB-TALENT-015"}


@pytest.mark.parametrize("a,d",[("I","C"),("R","I"),("C","R")])
def test_conditional_bonus_active_only_with_counter_advantage(a,d):
    result=conditional_attack_talent(
        attacker_weapon=a,defender_weapon=d,**TALENT,
    )
    assert result["active"] is True
    assert result["additional_attack_fraction"]=="0.15"
    reverse=conditional_attack_talent(
        attacker_weapon=d,defender_weapon=a,**TALENT,
    )
    assert reverse["active"] is False
    assert reverse["additional_attack_fraction"]=="0"


@pytest.mark.parametrize("a,d",[
    ("I","R"),("I","E"),("E","C"),("E","E"),("I",None),
    (None,"C"),("R","R"),
])
def test_conditional_bonus_is_zero_when_matchup_inactive_or_unknown(a,d):
    result=conditional_attack_talent(
        attacker_weapon=a,defender_weapon=d,**TALENT,
    )
    assert result["active"] is False
    assert result["additional_attack_fraction"]=="0"


def test_battle_adds_counter_and_conditional_talent_as_separate_base_fractions():
    result=resolve_ordinary_lines(
        [stack("militia","I")],[stack("riders","C")],
        attacker_hero=HERO,attacker_talent=TALENT,
    )
    event=result["events"][0]
    assert event["counter_weapons"]["attacker_bonus"]=="0.50"
    assert event["conditional_talent"]["additional_attack_fraction"]=="0.15"
    # Base 10000: +5000 counter bonus and +1500 conditional talent.
    assert event["total_power"]["attacker"]==16500.0
    assert event["total_power"]["defender"]==10000.0
    assert result["permanent_losses_applied"] is False


def test_talent_is_retested_at_every_subsequent_exchange():
    report=resolve_ordinary_lines(
        [stack("militia","I",count=100)],
        [stack("cavalry","C",count=1),stack("archers","R",count=1)],
        attacker_hero=HERO,attacker_talent=TALENT,
    )
    assert len(report["events"])==2
    assert report["events"][0]["conditional_talent"]["active"] is True
    assert report["events"][1]["conditional_talent"]["active"] is False
    assert report["events"][1]["conditional_talent"]["additional_attack_fraction"]=="0"


def test_unknown_hero_profile_cannot_use_a_qualified_talent_alone():
    with pytest.raises(ValueError,match="requires qualified"):
        resolve_ordinary_lines(
            [stack("militia","I")],[stack("riders","C")],
            attacker_talent=TALENT,
        )


@pytest.mark.parametrize("wrong",[
    Decimal("-0.01"),Decimal("1.01"),Decimal("NaN"),0.2,"0.2",
])
def test_invalid_modifier_is_rejected_before_any_state_change(wrong):
    with pytest.raises(ValueError):
        conditional_attack_talent(
            attacker_weapon="I",defender_weapon="C",
            additional_bonus=wrong,source_ref="LAB-TALENT",
        )


def test_replay_is_deterministic_and_never_applies_effects():
    army=[stack("militia","I",count=30)]
    defender=[stack("cavalry","C",count=2)]
    a=resolve_ordinary_lines(army,defender,attacker_hero=HERO,attacker_talent=TALENT)
    b=resolve_ordinary_lines(army,defender,attacker_hero=HERO,attacker_talent=TALENT)
    assert a==b
    assert not a["region_liberated"]
    assert not a["loot_awarded"]
