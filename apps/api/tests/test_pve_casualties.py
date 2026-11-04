"""US-COM-014 ordinary-hero durability conversion fixtures (Jactari baseline)."""
from decimal import Decimal
import pytest

from mmhk_api.pve_casualties import (
    ordinary_hero_permanent_losses,
    UnsupportedCasualtyProfile,
)


@pytest.mark.parametrize("dispersed,expected",[
    (0,0),(1,1),(2,1),(3,1),(4,1),(7,2),
    (50,15),(100,30),(101,30),
])
def test_ordinary_hero_jactari_baseline(dispersed,expected):
    result=ordinary_hero_permanent_losses(dispersed)
    assert result["permanent_deaths"]==expected
    assert result["effects_applied"] is False
    assert result["nonfatal_dispersions"]==dispersed-expected


@pytest.mark.parametrize("dispersed",[-1,-2,True,1.5,"12"])
def test_invalid_dispersion_rejected(dispersed):
    with pytest.raises(ValueError):
        ordinary_hero_permanent_losses(dispersed)


def test_nonhero_and_nonordinary_must_use_special_branch():
    with pytest.raises(UnsupportedCasualtyProfile):
        ordinary_hero_permanent_losses(50,with_hero=False)
    with pytest.raises(UnsupportedCasualtyProfile):
        ordinary_hero_permanent_losses(50,ordinary_units=False)


def test_unverified_modifier_fails_closed():
    with pytest.raises(UnsupportedCasualtyProfile):
        ordinary_hero_permanent_losses(50,loss_factor=Decimal("0.2"))
    result=ordinary_hero_permanent_losses(
        50,loss_factor=Decimal("0.2"),modifiers_verified=True,
    )
    assert result["permanent_deaths"]==10


@pytest.mark.parametrize("factor",[Decimal("-0.1"),Decimal("1.1"),Decimal("NaN"),0.3])
def test_invalid_factor_rejected(factor):
    with pytest.raises(ValueError):
        ordinary_hero_permanent_losses(5,loss_factor=factor)
