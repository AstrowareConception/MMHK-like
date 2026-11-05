"""US-COM-007 Jactari pre-shots: order, snapshots and non-persistent safety."""
from copy import deepcopy
from decimal import Decimal
import pytest

from mmhk_api.pve_pre_shots import resolve_pre_shots
from mmhk_api.pve_stack_sequence import resolve_ordinary_lines


def unit(code,count,weapon="R",power=10,siege=False):
    return {"unit_code":code,"count":count,"unit_power":power,
            "weapon_code":weapon,"siege":siege}


def action(side,kind,pct,ref="CODE-01-COMBAT-TEST"):
    return {"side":side,"kind":kind,"percent":Decimal(str(pct)),"source_ref":ref}


def test_no_qualified_profile_means_no_automatic_fire():
    result=resolve_pre_shots(
        [unit("archers",10)],[unit("wolves",10,weapon="I")],[],
    )
    assert result["configured"] is False
    assert result["events"]==[]
    assert result["remaining_after_shots"]=={"attacker":[10],"defender":[10]}


def test_archer_barrage_uses_ranged_units_only_and_integer_floor():
    result=resolve_pre_shots(
        [unit("archers",10),unit("militia",100,"I")],
        [unit("wolves",10,"I")],
        [action("attacker","barrage",50)],
        attacker_has_hero=True,
    )
    event=result["events"][0]
    assert event["eligible_positions"]==[1]
    assert event["shot_power"]==50.0
    assert event["projected_losses"]==[5]
    assert result["remaining_after_shots"]["defender"]==[5]


def test_attacking_and_defending_shots_use_intact_simultaneous_snapshots():
    shots=[action("attacker","barrage",50),
           action("defender","barrage",50)]
    a=[unit("archers",10)]
    d=[unit("shooters",10)]
    first=resolve_pre_shots(a,d,shots,attacker_has_hero=True,
                            defender_has_hero=True)
    second=resolve_pre_shots(a,d,list(reversed(shots)),
                             attacker_has_hero=True,defender_has_hero=True)
    assert first==second
    assert [e["side"] for e in first["events"]]==["attacker","defender"]
    assert first["remaining_after_shots"]=={"attacker":[5],"defender":[5]}
    assert a[0]["count"]==d[0]["count"]==10


def test_multiple_volley_overlaps_are_capped_without_negative_troops():
    report=resolve_pre_shots(
        [unit("archers",10)],
        [unit("wolves",5,"I")],
        [action("attacker","barrage",100),
         action("attacker","ballista",100)],
        attacker_has_hero=True,
    )
    assert report["projected_losses"]["defender"]==[10]
    assert report["simulated_losses"]["defender"]==[5]
    assert report["remaining_after_shots"]["defender"]==[0]
    assert report["overlap_capped"] is True


def test_ballista_uses_all_ordinary_stack_types():
    report=resolve_pre_shots(
        [unit("militia",2,"I",power=10)],
        [unit("wolves",10,"C",power=10)],
        [action("attacker","ballista",50)],
    )
    assert report["events"][0]["eligible_positions"]==[1]
    assert report["remaining_after_shots"]["defender"]==[9]


def test_bombardment_requires_source_context_and_siege_units():
    source=[unit("siege_machine",1,"E",power=300,siege=True)]
    target=[unit("infantry",20,"I",power=100)]
    shot=[action("defender","bombardment",100)]
    result=resolve_pre_shots(target,source,shot,season=2,location_code=3,
                             defender_has_hero=True)
    assert result["events"][0]["shot_power"]==1100.0
    assert result["simulated_losses"]["attacker"]==[11]
    with pytest.raises(ValueError):
        resolve_pre_shots(target,source,shot,season=1,location_code=3,
                          defender_has_hero=True)


def test_barrage_requires_hero_and_duplicate_events_rejected():
    source=[unit("archers",10)]
    defender=[unit("wolves",10,"I")]
    with pytest.raises(ValueError):
        resolve_pre_shots(source,defender,[action("attacker","barrage",10)])
    with pytest.raises(ValueError):
        resolve_pre_shots(
            source,defender,[action("attacker","ballista",10)]*2,
        )


@pytest.mark.parametrize("pct",[-1,0,1001,"10",float("nan")])
def test_invalid_ability_percent_does_not_fall_back_to_guessed_value(pct):
    with pytest.raises(ValueError):
        resolve_pre_shots(
            [unit("archers",10)],[unit("wolves",10,"I")],
            [action("attacker","ballista",pct) if isinstance(pct,(int,float))
             else {"side":"attacker","kind":"ballista",
                   "percent":pct,"source_ref":"CODE-TEST"}],
        )


def test_pre_shot_phase_precedes_duel_and_can_remove_entire_first_stack():
    attacker=[unit("archers",10,"R",power=10)]
    defender=[unit("wolves",4,"I",power=10),unit("bandits",20,"I",power=10)]
    snapshot_a,snapshot_d=deepcopy(attacker),deepcopy(defender)
    report=resolve_ordinary_lines(
        attacker,defender,
        pre_shot_actions=[action("attacker","barrage",50)],
        pre_shot_context={"attacker_has_hero":True},
    )
    assert report["pre_shots"]["simulated_losses"]["defender"]==[4,1]
    assert report["defender"][0]["dispersed"] is True
    assert report["events"][0]["defender_position"]==2
    assert attacker==snapshot_a and defender==snapshot_d
    assert report["permanent_losses_applied"] is False
    assert report["region_liberated"] is False
