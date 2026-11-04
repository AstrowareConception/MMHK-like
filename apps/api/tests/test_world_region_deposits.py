"""Deposit invariants: four slots, no overlap, stable positions, mine alignment."""
from collections import Counter

import pytest

from mmhk_api.world_region_deposits import calculate_deposit_positions


def test_deposits_are_stable_and_unique():
    composition=["gold","wood","gems","gems"]
    first=calculate_deposit_positions("sandbox",7,8,composition)
    assert first==calculate_deposit_positions("sandbox",7,8,composition)
    assert [d["resource"] for d in first]==composition
    assert [d["slot"] for d in first]==[0,1,2,3]
    assert len({(d["i"],d["j"]) for d in first})==4
    assert all(0<=d["i"]<=4 and 0<=d["j"]<=4 for d in first)
    assert all((d["i"],d["j"])!=(2,2) for d in first)
    assert Counter(d["resource"] for d in first)["gems"]==2


def test_existing_mines_keep_their_positions():
    positions=[("gold",4,0),("wood",0,2),("gems",3,3)]
    result=calculate_deposit_positions(
        "sandbox",9,12,["gold","wood","gems","gems"],positions,
    )
    assert {(r["resource"],r["i"],r["j"]) for r in result}>=set(positions)
    assert len({(r["i"],r["j"]) for r in result})==4


def test_multiple_city_mines_must_not_overlap():
    with pytest.raises(ValueError):
        calculate_deposit_positions(
            "sandbox",1,1,["gold","wood","ore","crystal"],
            [("gold",0,0),("wood",0,0)],
        )


def test_mismatched_city_mine_fails_closed():
    with pytest.raises(ValueError):
        calculate_deposit_positions(
            "sandbox",1,1,["gold","wood","gems","gems"],
            [("ore",0,0)],
        )


@pytest.mark.parametrize("bad",[
    ["gold"],["gold","wood","ore",""],[],
])
def test_invalid_composition_fails_closed(bad):
    with pytest.raises(ValueError):
        calculate_deposit_positions("sandbox",3,4,bad)
