"""Ensure multi-stack laboratory previews remain owner-scoped and read-only."""
from uuid import uuid4

import pytest

from mmhk_api.forces import RecruitmentConflict, RecruitmentNotFound
from mmhk_api.region_pve import preview_ordinary_line_sequence


class FakeDB:
    def __init__(self, *, own=True, hero="idle", formation=None):
        self.city=uuid4()
        self.hero=uuid4()
        self.encounter=uuid4()
        self.owner=uuid4()
        self.own=own
        self.hero_state=hero
        self.formation=formation if formation is not None else [
            ("militia",12,20,"I"),("archers",5,12,"R")
        ]
        self.queries=[]
        self.rows=[]
    def execute(self,query,params):
        normalized=" ".join(query.split())
        self.queries.append((normalized,params))
        if "SELECT c.city_id FROM cities c" in normalized:
            self.rows=[(self.city,)] if self.own else []
        elif "SELECT name,unit_code,unit_count,unit_power" in normalized:
            self.rows=[("Wolves","wolves",3,10,"C")] if self.own else []
        elif "SELECT name,status FROM city_heroes" in normalized:
            self.rows=[("Hero",self.hero_state)] if self.own else []
        elif "FROM hero_formation_slots s" in normalized:
            self.rows=self.formation
        elif "FROM hero_army_units a" in normalized:
            self.rows=self.formation
        elif "FROM hero_basic_combat_profiles" in normalized:
            self.rows=[]
        elif "SELECT count(*) FROM hero_formation_slots" in normalized:
            self.rows=[(len(self.formation),)]
        else:
            raise AssertionError("Unexpected SQL: "+normalized)
        return self
    def fetchone(self):
        return self.rows[0] if self.rows else None
    def fetchall(self):
        return self.rows


def preview(db):
    return preview_ordinary_line_sequence(
        db,owner=db.owner,city_id=db.city,
        encounter_id=db.encounter,hero_id=db.hero,
    )


def test_multistack_preview_uses_own_hero_and_no_writes():
    db=FakeDB()
    result=preview(db)
    assert result["preview_only"] is True
    assert result["sequence"]["events"]
    assert result["weapon_classification_complete"] is True
    assert result["sequence"]["events"][0]["counter_weapons"]["qualified"] is True
    assert not result["sequence"]["permanent_losses_applied"]
    assert all(q.startswith("SELECT") for q,_ in db.queries)


def test_foreign_city_is_refused_before_encounter():
    db=FakeDB(own=False)
    with pytest.raises(RecruitmentNotFound):
        preview(db)
    assert len(db.queries)==1


def test_busy_hero_is_refused():
    db=FakeDB(hero="on_mission")
    with pytest.raises(RecruitmentConflict):
        preview(db)


def test_invalid_formation_is_refused():
    db=FakeDB(formation=[("militia",3,None,"I")])
    with pytest.raises(RecruitmentConflict):
        preview(db)


def test_unknown_weapon_remains_unqualified_without_name_based_guess():
    db=FakeDB(formation=[("militia",12,20,None)])
    result=preview(db)
    assert result["weapon_classification_complete"] is False
    event=result["sequence"]["events"][0]
    assert event["counter_weapons"]["qualified"] is False
    assert event["counter_weapons"]["attacker_bonus"]=="0"
    assert all(q.startswith("SELECT") for q,_ in db.queries)
