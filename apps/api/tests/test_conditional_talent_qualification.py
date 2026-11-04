"""Operator-only conditional hero talent provenance and profile precondition."""
from decimal import Decimal
from uuid import uuid4
import pytest
from mmhk_api.conditional_talent_qualification import qualify_conditional_counter_talent


class FakeDB:
    def __init__(self,hero=None):
        self.hero=hero
        self.writes=[]
    def execute(self,sql,params):
        self.writes.append((sql,params))
        return self
    def fetchone(self):
        return (self.hero,) if self.hero else None


def test_qualified_experimental_talent_stores_source_and_precondition():
    hero=uuid4()
    db=FakeDB(hero)
    result=qualify_conditional_counter_talent(
        db,hero_id=hero,additional_bonus=Decimal("0.15"),
        source_ref="LAB-CONDITIONAL-015",
    )
    assert result["condition"]=="attacker_counter_weapon_advantage"
    assert result["source_ref"]=="LAB-CONDITIONAL-015"
    assert "FROM hero_basic_combat_profiles" in db.writes[0][0]
    assert db.writes[0][1][0]==Decimal("0.15")


def test_hero_without_basic_profile_is_rejected():
    db=FakeDB()
    with pytest.raises(ValueError,match="basic combat profile"):
        qualify_conditional_counter_talent(
            db,hero_id=uuid4(),additional_bonus=Decimal("0.15"),
            source_ref="LAB-CASE",
        )


@pytest.mark.parametrize("bonus",[
    Decimal("-0.1"),Decimal("1.01"),Decimal("NaN"),0.2,
])
def test_invalid_bonus_never_writes(bonus):
    db=FakeDB(uuid4())
    with pytest.raises(ValueError):
        qualify_conditional_counter_talent(
            db,hero_id=uuid4(),additional_bonus=bonus,
            source_ref="LAB-CASE",
        )
    assert db.writes==[]
