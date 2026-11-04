"""Military readiness: private target discovery and owned hero scope."""
from uuid import uuid4
import pytest
from mmhk_api.map_views import MapNotFound
from mmhk_api.military_readiness import military_readiness


class FakeDB:
    def __init__(self, member=True,own=False,discovered=False):
        self.member=member
        self.own=own
        self.discovered=discovered
        self.calls=[]
        self.rows=[]
    def execute(self,query,params):
        self.calls.append((query,params))
        if "SELECT w.world_size" in query:
            self.rows=[(100,)] if self.member else []
        elif "SELECT c.city_id,c.name FROM map_city_discoveries" in query:
            self.rows=[(uuid4(),"Known enemy")] if self.discovered else []
        elif "SELECT city_id FROM cities" in query:
            self.rows=[(uuid4(),)] if self.own else []
        elif "FROM cities c" in query and "JOIN city_heroes h" in query:
            self.rows=[]
        else:
            raise AssertionError("Unexpected query: "+query)
        return self
    def fetchone(self):
        return self.rows[0] if self.rows else None
    def fetchall(self):
        return self.rows


def test_non_member_does_not_learn_targets_or_heroes():
    db=FakeDB(member=False)
    with pytest.raises(MapNotFound):
        military_readiness(db,uuid4(),"hidden",5,6)
    assert len(db.calls)==1


def test_unknown_target_remains_unidentified():
    db=FakeDB()
    result=military_readiness(db,uuid4(),"sandbox",5,6)
    assert result["target_kind"]=="target_not_identified"
    assert result["target_name"] is None
    assert result["heroes"]==[]
    assert not result["attack_enabled"] and not result["raid_enabled"]


def test_discovered_enemy_does_not_activate_combat():
    db=FakeDB(discovered=True)
    result=military_readiness(db,uuid4(),"sandbox",5,6)
    assert result["target_kind"]=="discovered_opponent"
    assert result["target_name"]=="Known enemy"
    assert result["attack_enabled"] is False


def test_own_city_is_not_attackable():
    db=FakeDB(own=True)
    result=military_readiness(db,uuid4(),"sandbox",5,6)
    assert result["target_kind"]=="own_city"
    assert "self_attack_forbidden" in result["blocking_reasons"]


@pytest.mark.parametrize("x,y",[(0,1),(101,1),(1,101)])
def test_invalid_coordinates_denied_before_target_queries(x,y):
    db=FakeDB()
    with pytest.raises(ValueError):
        military_readiness(db,uuid4(),"sandbox",x,y)
    assert len(db.calls)==1
