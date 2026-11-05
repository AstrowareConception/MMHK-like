"""Ensure multi-stack laboratory previews remain owner-scoped and read-only."""
from uuid import uuid4

import pytest

from mmhk_api.forces import RecruitmentConflict, RecruitmentNotFound
from mmhk_api.region_pve import preview_ordinary_line_sequence


class FakeDB:
    def __init__(self, *, own=True, hero="idle", formation=None, profile=None, talent=None, pre_shots=None):
        self.city=uuid4()
        self.hero=uuid4()
        self.encounter=uuid4()
        self.owner=uuid4()
        self.own=own
        self.hero_state=hero
        self.profile=profile
        self.talent=talent
        self.pre_shots=pre_shots
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
            self.rows=[self.profile] if self.profile is not None else []
        elif "FROM hero_conditional_counter_talents" in normalized:
            self.rows=[self.talent] if self.talent is not None else []
        elif "FROM hero_pre_shot_lab_profiles" in normalized:
            self.rows=[self.pre_shots] if self.pre_shots is not None else []
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


def test_explicit_hero_profile_applies_percentage_and_flat_bonus():
    from decimal import Decimal
    db=FakeDB(formation=[("militia",100,100,"E")],
              profile=(10,0,Decimal("3"),Decimal("0"),"LAB-HERO-10"))
    # Neutral defender has 3 creatures of power 10, no hero profile.
    result=preview(db)
    assert result["attacker_hero_profile_applied"] is True
    event=result["sequence"]["events"][0]
    assert event["total_power"]["attacker"]==10800.0
    assert event["hero_attributes"]["source_ref"]=="LAB-HERO-10"
    assert event["hero_attributes"]["conditional_talents_applied"] is False
    assert all(q.startswith("SELECT") for q,_ in db.queries)


def test_source_qualified_conditional_talent_applies_only_when_counter_active():
    from decimal import Decimal
    db=FakeDB(formation=[("militia",100,100,"I")],
              profile=(0,0,Decimal("0"),Decimal("0"),"LAB-HERO"),
              talent=(Decimal("0.15"),"LAB-TALENT"))
    result=preview(db)
    assert result["attacker_conditional_talent_configured"] is True
    event=result["sequence"]["events"][0]
    assert event["conditional_talent"]["active"] is True
    assert event["counter_weapons"]["attacker_bonus"]=="0.50"
    assert event["total_power"]["attacker"]==16500.0
    assert all(q.startswith("SELECT") for q,_ in db.queries)


def test_conditional_talent_without_basic_hero_profile_fails_closed():
    from decimal import Decimal
    db=FakeDB(talent=(Decimal("0.15"),"LAB-TALENT"))
    with pytest.raises(RecruitmentConflict,match="requires qualified"):
        preview(db)
    assert all(q.startswith("SELECT") for q,_ in db.queries)


def test_pre_shot_profile_executes_before_duel_without_database_writes():
    from decimal import Decimal
    # 12 militia (I, no barrage), 5 archers (R) at power 12,
    # 100% ranged barrage produces 60 shot power; one enemy C stack
    # of 3 × 10 is exhausted before ordinary exchanges.
    db=FakeDB(pre_shots=(Decimal("100"),Decimal("0"),"LAB-BARRAGE-100"))
    result=preview(db)
    pres=result["sequence"]["pre_shots"]
    assert result["pre_shot_capabilities_configured"] is True
    assert pres["configured"] is True
    assert pres["events"][0]["kind"]=="barrage"
    assert pres["events"][0]["eligible_positions"]==[2]
    assert pres["remaining_after_shots"]["defender"]==[0]
    assert result["sequence"]["events"]==[]
    assert result["sequence"]["verdict"]=="attacker"
    assert not result["sequence"]["permanent_losses_applied"]
    assert all(q.startswith("SELECT") for q,_ in db.queries)


def test_no_pre_shot_profile_means_no_automatic_shots():
    db=FakeDB()
    result=preview(db)
    assert result["pre_shot_capabilities_configured"] is False
    assert result["sequence"]["pre_shots"]["events"]==[]
