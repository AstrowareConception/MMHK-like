"""Read-only territorial audit contract; never alter existing city mines."""
from mmhk_api.region_integrity import check_region_invariants


def test_consistent_city_mines_and_four_deposits():
    slots=["gold","wood","ore","crystal"]
    deposits=[
        (0,"gold",0,0),(1,"wood",1,0),
        (2,"ore",3,4),(3,"crystal",4,1),
    ]
    mines=[("gold",0,0),("wood",1,0),("ore",3,4),("crystal",4,1)]
    assert check_region_invariants(slots,deposits,mines)==[]


def test_duplicate_resource_slots_are_valid():
    resources=["gold","wood","gems","gems"]
    deposits=[
        (0,"gold",0,0),(1,"wood",1,0),
        (2,"gems",0,4),(3,"gems",4,4),
    ]
    assert check_region_invariants(resources,deposits,[("gems",0,4)])==[]


def test_unknown_city_region_is_detected_not_repaired():
    assert check_region_invariants(None,[],[("wood",0,0)])==[
        "city_without_region"
    ]


def test_partial_provisioning_is_reported():
    result=check_region_invariants(
        ["gold","wood","ore","crystal"],
        [(0,"gold",0,0)],[],
    )
    assert "incomplete_deposit_layout" in result
    assert "invalid_deposit_slots" in result


def test_misaligned_mine_is_reported_not_moved():
    result=check_region_invariants(
        ["gold","wood","ore","crystal"],
        [(0,"gold",0,0),(1,"wood",0,1),
         (2,"ore",0,2),(3,"crystal",0,3)],
        [("gold",4,4)],
    )
    assert "city_mine_deposit_misalignment" in result


def test_missing_city_mine_position():
    result=check_region_invariants(
        ["gold","wood","ore","crystal"],
        [(0,"gold",0,0),(1,"wood",0,1),
         (2,"ore",0,2),(3,"crystal",0,3)],
        [("gold",None,None)],
    )
    assert "unpositioned_city_mines" in result
