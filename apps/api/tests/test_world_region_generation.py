"""Tests for the experimental, immutable four-resource world registry."""
from collections import Counter
from uuid import uuid4

import pytest

from mmhk_api.world_region_generation import composition_for, provision_rectangle


def test_four_resources_are_stable_and_valid():
    possibilities={"gold","wood","ore","crystal","gems","sulfur","mercury"}
    for x in range(1,30):
        slots=composition_for("sandbox",x,7)
        assert len(slots)==4
        assert set(slots)<=possibilities
        assert slots==composition_for("sandbox",x,7)
        assert "gold" in slots and "wood" in slots


def test_regions_can_have_duplicate_rare_slots():
    examples=[composition_for("sandbox",x,y)
              for x in range(1,40) for y in range(1,7)]
    assert any(any(v==2 and k in {"crystal","gems","sulfur","mercury"}
                   for k,v in Counter(row).items()) for row in examples)
    assert len(set(examples))>1


@pytest.mark.parametrize("x,y",[(0,1),(1,-2),(True,1)])
def test_invalid_coordinate_rejected(x,y):
    with pytest.raises(ValueError):
        composition_for("sandbox",x,y)


@pytest.mark.parametrize("bounds",[
    (1,1,25,25), (0,1,2,2), (3,3,2,5), (1,1,1,401)
])
def test_overlarge_or_invalid_batches_rejected_before_sql(bounds):
    class UnusedDB:
        def execute(self,*args,**kwargs):
            raise AssertionError("Invalid batches should not touch DB")
    with pytest.raises(ValueError):
        provision_rectangle(
            UnusedDB(),world_id="sandbox",
            x_min=bounds[0],y_min=bounds[1],
            x_max=bounds[2],y_max=bounds[3]
        )
