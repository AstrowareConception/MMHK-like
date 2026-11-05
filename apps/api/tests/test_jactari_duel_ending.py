"""US-COM-010/013: Jactari equality markers and temporary dispersions."""
import pytest

from jactari.duel import resolve_stack_duel
from mmhk_api.jactari_duel_ending import classify_jactari_exchange
from mmhk_api.pve_stack_sequence import resolve_ordinary_lines
from mmhk_api.pve_report_interpretation import interpret_duel


def duel(ac=10,dc=10,modifiers=None):
    return resolve_stack_duel({
        "attacker":{"count":ac,"unitPower":10},
        "defender":{"count":dc,"unitPower":10},
        "modifiers":modifiers or {},
    })


def army(code,count,weapon=None,power=10):
    return {"unit_code":code,"count":count,"unit_power":power,
            "weapon_code":weapon}


def test_true_draw_disperses_both_but_does_not_commit_deaths():
    outcome=duel()
    ending=classify_jactari_exchange(outcome)
    assert ending["kind"]=="true_draw"
    assert ending["verdict"]=="draw"
    assert ending["theoretical_dispersions"]=={"attacker":10,"defender":10}
    assert ending["removed_from_line"]=={"attacker":True,"defender":True}
    assert ending["permanent_deaths_applied"] is False


def test_source_backed_false_draw_plus_one_keeps_winner_marker_with_zero_count():
    # A fractional bonus lets total attacker power exceed defender power,
    # while integer floors still exhaust both: Jactari falseDraw=+1.
    outcome=duel(modifiers={"attackStackHero":0.001})
    assert outcome["falseDraw"]==1
    ending=classify_jactari_exchange(outcome)
    assert ending["kind"]=="false_draw"
    assert ending["verdict"]=="attacker"
    assert ending["exhausted_without_dispersion"]["attacker"] is True
    assert ending["dispersed"]["attacker"] is False
    assert ending["removed_from_line"]["attacker"] is True
    assert ending["remaining"]["attacker"]==0
    assert interpret_duel(outcome)["verdict"]=="attacker"


def test_false_draw_minus_one_is_distinguished_without_rng():
    # The source has a symmetric marker -1. Preserve it even before a
    # real historical input fixture covering this rare edge exists.
    sample={
        "remaining":{"attacker":0,"defender":0},
        "losses":{"attacker":10,"defender":10},
        "dispersed":{"attacker":True,"defender":False},
        "draw":False,"falseDraw":-1,
    }
    ending=classify_jactari_exchange(sample)
    assert ending["kind"]=="false_draw"
    assert ending["verdict"]=="defender"
    assert ending["exhausted_without_dispersion"]["defender"] is True


def test_stacked_combat_no_longer_rejects_a_false_draw():
    combat=resolve_ordinary_lines(
        [army("militia",10)],[army("wolves",10)],
        attacker_hero={"attack_points":0,"defense_points":0,
                       "attack_per_unit":__import__("decimal").Decimal("0.01"),
                       "source_ref":"LAB-FALSE-DRAW"},
    )
    event=combat["events"][0]
    assert event["ending"]["kind"]=="false_draw"
    assert event["jactari_false_draw"]==1
    assert event["attacker_survives_to_next_exchange"] is False
    assert event["defender_survives_to_next_exchange"] is False
    assert combat["verdict"]=="attacker"
    assert combat["technical_tiebreak"]==1
    assert not combat["permanent_losses_applied"]


def test_exhausted_winner_cannot_replay_against_next_enemy_stack():
    # Even if Jactari awards a technical false draw to this first line,
    # a zero-remaining peloton must not fight the second enemy stack.
    combat=resolve_ordinary_lines(
        [army("militia",10)],
        [army("wolves",10),army("bandits",1)],
        attacker_hero={"attack_points":0,"defense_points":0,
                       "attack_per_unit":__import__("decimal").Decimal("0.01"),
                       "source_ref":"LAB-FALSE-DRAW"},
    )
    assert combat["events"][0]["ending"]["kind"]=="false_draw"
    assert len(combat["events"])==1
    assert combat["verdict"]=="defender"
    assert combat["technical_tiebreak"]==0


def test_known_counter_weapon_disperse_example_fifty_one_hundred():
    combat=resolve_ordinary_lines(
        [army("infantry",100,"I",100)],
        [army("cavalry",100,"C",100)],
    )
    e=combat["events"][0]
    assert e["total_power"]=={"attacker":15000.0,"defender":10000.0}
    assert e["theoretical_dispersions"]=={"attacker":50,"defender":100}
    assert e["remaining"]=={"attacker":50,"defender":0}
    assert e["ending"]["permanent_deaths_applied"] is False


def test_source_rounding_can_yield_true_draw_even_if_totals_not_equal():
    outcome=duel(modifiers={"defendStackHero":0.001})
    assert outcome["totalPower"]["defender"]>outcome["totalPower"]["attacker"]
    assert classify_jactari_exchange(outcome)["kind"]=="true_draw"


def test_invalid_or_fabricated_ending_is_rejected():
    outcome=duel()
    outcome["falseDraw"]=1
    with pytest.raises(ValueError):
        classify_jactari_exchange(outcome)


@pytest.mark.parametrize("attacker,defender,winner",[
    (10,11,"defender"),(11,10,"attacker"),
])
def test_one_unit_boundary_is_stable_and_not_random(attacker,defender,winner):
    outcome=duel(ac=attacker,dc=defender)
    ending=classify_jactari_exchange(outcome)
    assert ending["kind"]=="ordinary"
    assert ending["verdict"]==winner
    assert ending["false_draw_marker"]==0
    assert ending==classify_jactari_exchange(duel(ac=attacker,dc=defender))
