"""US-COM-008 contract: sequenced survivors, dispersion, no invented fatigue."""
from copy import deepcopy

import pytest

from mmhk_api.pve_stack_sequence import resolve_ordinary_lines


def stack(code, count, power=10):
    return {"unit_code":code,"count":count,"unit_power":power}


def test_surviving_stack_fights_next_line_with_reduced_count():
    attacker=[stack("militia",10,20)]
    defender=[stack("wolves",2,10),stack("bandits",4,10)]
    initial_a=deepcopy(attacker)
    initial_d=deepcopy(defender)
    report=resolve_ordinary_lines(attacker,defender)
    assert report["verdict"]=="attacker"
    assert len(report["events"])==2
    first,second=report["events"]
    assert first["attacker_position"]==second["attacker_position"]==1
    assert second["started"]["attacker"]==first["remaining"]["attacker"]
    assert second["started"]["attacker"]<=10
    assert report["permanent_losses_applied"] is False
    assert attacker==initial_a and defender==initial_d


def test_disperse_stack_does_not_restart_as_intact():
    attacker=[stack("militia",1,10),stack("archers",20,40)]
    defender=[stack("wolves",10,30)]
    report=resolve_ordinary_lines(attacker,defender)
    assert report["verdict"]=="attacker"
    assert len(report["events"])==2
    assert report["events"][0]["attacker_position"]==1
    assert report["events"][1]["attacker_position"]==2
    assert report["attacker"][0]["dispersed"] is True
    assert report["attacker"][0]["remaining"]==0


def test_equal_duel_stops_without_replaying():
    report=resolve_ordinary_lines([stack("militia",5)],[stack("wolves",5)])
    assert report["verdict"]=="draw"
    assert len(report["events"])==1
    assert report["events"][0]["jactari_draw"] is True


def test_no_fatigue_multiplier_between_exchanges():
    a=[stack("militia",100,10)]
    d=[stack("wolves",1,10),stack("bandits",1,10)]
    report=resolve_ordinary_lines(a,d)
    assert len(report["events"])==2
    assert report["events"][1]["started"]["attacker"]==report["events"][0]["remaining"]["attacker"]
    assert report["excluded_mechanics"]


@pytest.mark.parametrize("army",[
    [],[stack("militia",0)],[stack("militia",-1)],
    [stack("militia",True)],[stack("militia",1,float("inf"))],
    [stack("militia",1,0)],[stack("militia",1)]*8,
])
def test_bad_stack_is_rejected(army):
    with pytest.raises(ValueError):
        resolve_ordinary_lines(army,[stack("wolves",1)])


def test_replay_is_deterministic_without_db_side_effects():
    attack=[stack("militia",20),stack("archers",4)]
    defend=[stack("wolves",7),stack("bandits",5)]
    result=resolve_ordinary_lines(attack,defend)
    assert result==resolve_ordinary_lines(attack,defend)
    assert result["region_liberated"] is False
    assert result["experience_awarded"] is False


def test_sparse_formation_positions_are_not_renumbered():
    left=[
        {"position":1,**stack("militia",1,10)},
        {"position":7,**stack("archers",20,40)},
    ]
    result=resolve_ordinary_lines(left,[stack("wolves",10,30)])
    assert [s["position"] for s in result["attacker"]]==[1,7]
    assert [e["attacker_position"] for e in result["events"]]==[1,7]
