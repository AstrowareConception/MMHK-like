"""Hero basic combat profiles are operator-owned, never populated implicitly."""
from decimal import Decimal
from uuid import uuid4

import pytest

from mmhk_api.hero_combat_qualification import qualify_hero_basic_combat


class DB:
    def __init__(self, hero):
        self.hero=hero
        self.writes=[]
    def execute(self,sql,params):
        self.writes.append((sql,params))
        return self
    def fetchone(self):
        return (self.hero,)


def test_qualified_profile_is_written_with_provenance():
    hero=uuid4()
    db=DB(hero)
    result=qualify_hero_basic_combat(
        db,hero_id=hero,attack_points=8,defense_points=4,
        attack_per_unit=Decimal("2"),source_ref="LAB-COM-005-01",
    )
    assert result["hero_id"]==str(hero)
    assert result["combat_profile"]["attackStackHero"]=="0.040"
    assert result["combat_profile"]["defendStackHero"]=="0.020"
    assert result["combat_profile"]["attackUnitsHero"]=="2"
    assert result["combat_profile"]["conditional_talents_applied"] is False
    assert len(db.writes)==1
    assert db.writes[0][1][5]=="LAB-COM-005-01"


@pytest.mark.parametrize("attack,source",[
    (True,"LAB-01"),(-1,"LAB-01"),(1001,"LAB-01"),(10,""),
])
def test_invalid_profile_never_writes(attack,source):
    db=DB(uuid4())
    with pytest.raises(ValueError):
        qualify_hero_basic_combat(
            db,hero_id=uuid4(),
            attack_points=attack,defense_points=0,source_ref=source,
        )
    assert db.writes==[]
