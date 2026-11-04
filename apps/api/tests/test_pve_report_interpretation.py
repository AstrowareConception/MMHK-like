"""Jactari single-stack interpretation never turns a sentinel into casualties."""
from pytest import raises
from jactari.duel import resolve_stack_duel
from mmhk_api.pve_report_interpretation import interpret_duel


def duel(attacker, defender, modifiers=None):
    return resolve_stack_duel({
        "attacker":{"count":attacker,"unitPower":10},
        "defender":{"count":defender,"unitPower":10},
        "modifiers":modifiers or {},
    })


def test_overwhelming_victory_sentinel_is_not_negative_casualty():
    outcome=duel(100,1,{"attackStackHero":2})
    result=interpret_duel(outcome)
    assert outcome["losses"]["attacker"] == -1
    assert result["attacker"]["simulated_losses"]==0
    assert result["attacker"]["overwhelming_victory"] is True
    assert result["verdict"]=="attacker"
    assert not result["persistent_effects_applied"]
    assert result["ordinary_attacker_loss_projection"]["permanent_deaths"]==0
    assert result["ordinary_attacker_loss_projection"]["effects_applied"] is False


def test_defender_can_overwhelm_attacker_without_negative_losses():
    result=interpret_duel(duel(1,100,{"defendStackHero":2}))
    assert result["defender"]["overwhelming_victory"] is True
    assert result["defender"]["simulated_losses"]==0
    assert result["verdict"]=="defender"


def test_equality_keeps_draw_without_gameplay_effect():
    result=interpret_duel(duel(10,10))
    assert result["verdict"]=="draw"
    assert result["attacker"]["dispersed"] is True
    assert result["defender"]["dispersed"] is True
    projection=result["ordinary_attacker_loss_projection"]
    assert projection["policy_id"]=="jactari-ordinary-hero-0.30-v1"
    assert projection["effects_applied"] is False
    assert not result["terrain_liberated"]
    assert not result["xp_awarded"]
    assert not result["loot_awarded"]


def test_incomplete_report_fails_closed():
    with raises(ValueError):
        interpret_duel({"losses":{}})
