"""Validate alternate mine configurations independently from database access."""
import pytest

from mmhk_api.region_layout import validate_mine_layout


def test_valid_alternative_configurations():
    resources={"gold","wood","ore","crystal"}
    validate_mine_layout(resources, {
        "gold":(0,0),"wood":(4,0),"ore":(0,4),"crystal":(4,4),
    })
    validate_mine_layout(resources, {
        "gold":(1,0),"wood":(3,1),"ore":(0,3),"crystal":(3,4),
    })


@pytest.mark.parametrize("positions",[
    {"gold":(0,0),"wood":(0,0)},
    {"gold":(2,2),"wood":(0,1)},
    {"gold":(-1,1),"wood":(0,1)},
    {"gold":(4,5),"wood":(0,1)},
    {"gold":(True,1),"wood":(0,1)},
    {"gold":(0,0)},
])
def test_invalid_mine_configurations(positions):
    with pytest.raises(ValueError):
        validate_mine_layout({"gold","wood"},positions)
