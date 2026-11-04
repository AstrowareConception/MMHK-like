"""Weapon type qualification remains operator-only, validated and traceable."""
from uuid import uuid4
import pytest

from mmhk_api.weapon_qualification import (
    qualify_unit_weapon,qualify_encounter_weapon,
)


class DB:
    def __init__(self, row):
        self.row=row
        self.queries=[]
    def execute(self, sql, params):
        self.queries.append((sql,params))
        return self
    def fetchone(self):
        return self.row


def test_operator_can_qualify_an_existing_unit_with_explicit_source():
    db=DB(("militia","I"))
    result=qualify_unit_weapon(
        db,unit_code="militia",weapon="I",
        source_ref="LAB-UNIT-PROFILE-01",
    )
    assert result["weapon"]=="I"
    assert "combat_weapon_source_ref" in db.queries[0][0]
    assert db.queries[0][1]==("I","LAB-UNIT-PROFILE-01","militia")


def test_operator_can_qualify_an_encounter_without_hero_access():
    eid=uuid4()
    db=DB((eid,"E"))
    result=qualify_encounter_weapon(
        db,encounter_id=eid,weapon="E",
        source_ref="RESEARCH-ENCOUNTER-01",
    )
    assert result["encounter_id"]==str(eid)
    assert result["source_ref"]=="RESEARCH-ENCOUNTER-01"


@pytest.mark.parametrize("weapon,source",[
    ("infantry","LAB-001"),("X","LAB-001"),("", "LAB-001"),
    ("I",""),("I","  "),("I","\nBAD"),
])
def test_invalid_classification_or_provenance_has_no_writes(weapon,source):
    db=DB(("militia","I"))
    with pytest.raises(ValueError):
        qualify_unit_weapon(db,unit_code="militia",
                            weapon=weapon,source_ref=source)
    assert not db.queries


def test_qualifying_unknown_unit_fails_closed():
    db=DB(None)
    with pytest.raises(ValueError,match="Unknown unit"):
        qualify_unit_weapon(
            db,unit_code="unknown_unit",weapon="I",source_ref="LAB-001",
        )
