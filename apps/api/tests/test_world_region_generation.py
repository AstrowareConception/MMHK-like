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
        assert len(set(slots)) in (3,4)
        assert max(Counter(slots).values())<=2
        assert sum(v==2 for v in Counter(slots).values())<=1


def test_no_resource_is_mandatory_in_ordinary_regions():
    samples=[composition_for("sandbox",x,y)
             for x in range(1,50) for y in range(1,15)]
    for kind in ("gold","wood","ore","crystal","gems","sulfur","mercury"):
        assert any(kind not in slots for slots in samples)
        assert any(kind in slots for slots in samples)


def test_all_four_rare_resources_are_symmetrical_over_sample():
    samples=[composition_for("sandbox",x,y)
             for x in range(1,70) for y in range(1,20)]
    counts=Counter(r for slots in samples for r in slots)
    rare=[counts[k] for k in ("crystal","gems","sulfur","mercury")]
    assert max(rare)-min(rare)<len(samples)*0.15


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


class QualifiedRegionDB:
    """Deterministic test double for operator-approved terrain preservation."""
    def __init__(self, qualified):
        self.qualified=qualified
        self.record=None
        self.current=None
    def execute(self, sql, params):
        if "SELECT world_size FROM worlds" in sql:
            self.current=(100,)
        elif "SELECT city_id FROM cities" in sql:
            self.current=None
        elif "SELECT mine_types,source_ref" in sql:
            self.current=self.qualified
        elif "INSERT INTO world_region_resources" in sql:
            self.record=list(params[3])
            self.current=None
        elif "SELECT resources,generation_policy,source_ref" in sql:
            self.current=(self.record,"regional-composition-v1","test-source")
        else:
            raise AssertionError("Unexpected SQL in provisioning: "+sql)
        return self
    def fetchone(self):
        return self.current
    def fetchall(self):
        return self.current


def test_qualified_three_mine_site_keeps_its_resources(monkeypatch):
    from mmhk_api.world_region_generation import provision_region
    monkeypatch.setattr("mmhk_api.world_region_generation.provision_deposits",
                        lambda *args, **kwargs: [])
    db=QualifiedRegionDB([(["gold","wood","sulfur"],"operator-proof")])
    result=provision_region(db,world_id="sandbox",x=8,y=10)
    assert set(["gold","wood","sulfur"]).issubset(result["resources"])
    assert len(result["resources"])==4
    assert len(set(result["resources"]))==4


def test_conflicting_qualified_profiles_require_operator_resolution():
    from mmhk_api.world_region_generation import provision_region
    db=QualifiedRegionDB([
        (["gold","wood","ore"],"operator-one"),
        (["gold","wood","crystal"],"operator-two"),
    ])
    with pytest.raises(ValueError,match="Conflicting"):
        provision_region(db,world_id="sandbox",x=8,y=10)
    assert db.record is None
