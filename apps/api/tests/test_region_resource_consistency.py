"""Mine-to-region consistency contract for founding expeditions."""
import pytest
from mmhk_api.region_resource_consistency import (
    profile_fits_region, region_accepts_mines,
)


def test_four_distinct_mines_match_four_resource_slots():
    assert profile_fits_region(
        ["gold","wood","ore","crystal"],
        ["crystal","gold","wood","ore"],
    )


def test_three_mines_can_be_subset_of_four_region_slots():
    assert profile_fits_region(
        ["gold","wood","ore","sulfur"],
        ["gold","wood","ore"],
    )


def test_duplicate_region_slots_are_not_duplicate_mines():
    assert profile_fits_region(
        ["gold","wood","gems","gems"],
        ["gold","wood","gems"],
    )
    assert not profile_fits_region(
        ["gold","wood","gems","gems"],
        ["gold","wood","ore"],
    )


@pytest.mark.parametrize("resources,mines", [
    (["gold","wood","ore","crystal"],["gold","wood","ore","mercury"]),
    (["gold","wood","ore","crystal"],["gold","gold","ore"]),
    (["gold","wood","ore"],["gold","wood","ore"]),
    (["gold","wood","ore","crystal"],["gold","wood"]),
    (["gold","wood","ore","crystal"],["gold","wood","ore","gems","sulfur"]),
])
def test_mismatch_rejected(resources,mines):
    assert not profile_fits_region(resources,mines)


class Lookup:
    def __init__(self, slots):
        self.slots=slots
        self.params=None
    def execute(self, sql, params):
        assert "world_region_resources" in sql
        self.params=params
        return self
    def fetchone(self):
        return None if self.slots is None else (self.slots,)


def test_absent_registry_keeps_legacy_colonization_available():
    db=Lookup(None)
    assert region_accepts_mines(db,"sandbox",5,6,["gold","wood","ore"])
    assert db.params==("sandbox",5,6)


def test_registered_conflict_is_enforced():
    db=Lookup(["gold","wood","ore","gems"])
    assert not region_accepts_mines(db,"sandbox",5,6,
                                    ["gold","wood","ore","sulfur"])
