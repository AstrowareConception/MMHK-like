"""Operator-only pre-shot qualification and fail-closed provenance checks."""
from decimal import Decimal
from uuid import uuid4

import pytest

from mmhk_api.pre_shot_qualification import qualify_pre_shot_profile


class DB:
    def __init__(self,hero):
        self.hero=hero
        self.writes=[]
    def execute(self,sql,params):
        self.writes.append((sql,params))
        return self
    def fetchone(self):
        return (self.hero,) if self.hero else None


def test_qualified_barrage_is_versioned_and_source_backed():
    hero=uuid4()
    db=DB(hero)
    result=qualify_pre_shot_profile(
        db,hero_id=hero,barrage_percent=Decimal("25"),
        ballista_percent=Decimal("0"),source_ref="CODE-01-COMBAT-LAB",
    )
    assert result["hero_id"]==str(hero)
    assert result["policy_id"]=="jactari-pre-shots-lab-v1"
    assert result["barrage_percent"]=="25"
    assert len(db.writes)==1
    assert "FROM hero_basic_combat_profiles" in db.writes[0][0]
    assert db.writes[0][1][2]=="CODE-01-COMBAT-LAB"


def test_missing_hero_profile_cannot_get_pre_shots():
    db=DB(None)
    with pytest.raises(ValueError,match="basic combat profile"):
        qualify_pre_shot_profile(
            db,hero_id=uuid4(),barrage_percent=Decimal("10"),
            ballista_percent=Decimal("0"),source_ref="LAB-SOURCE",
        )


@pytest.mark.parametrize("barrage,ballista,ref",[
    (Decimal("0"),Decimal("0"),"LAB-SOURCE"),
    (Decimal("-1"),Decimal("0"),"LAB-SOURCE"),
    (Decimal("1001"),Decimal("0"),"LAB-SOURCE"),
    (Decimal("NaN"),Decimal("0"),"LAB-SOURCE"),
    (10,Decimal("0"),"LAB-SOURCE"),
    (Decimal("10"),Decimal("0")," "),
])
def test_invalid_profile_never_issues_write(barrage,ballista,ref):
    db=DB(uuid4())
    with pytest.raises(ValueError):
        qualify_pre_shot_profile(
            db,hero_id=uuid4(),barrage_percent=barrage,
            ballista_percent=ballista,source_ref=ref,
        )
    assert db.writes==[]
