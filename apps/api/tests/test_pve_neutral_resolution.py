"""V103 neutral-without-hero Jactari branch and fail-closed LAB resolution."""
from copy import deepcopy
from decimal import Decimal
from uuid import uuid4

import pytest

from mmhk_api.pve_neutral_resolution import (
    POLICY_ID, ordinary_neutral_casualties,
    validate_neutral_resolution_snapshot,plan_neutral_resolution,
    resolve_neutral_if_qualified,
)


def policy(**changes):
    p={
        "policy_id":POLICY_ID,"enabled":True,
        "source_ref":"LAB-NEUTRAL-POLICY-TEST",
        "no_hero_verified":True,"no_attrition_verified":True,
        "profile_source_ref":"LAB-NO-HERO-NO-ATTRITION",
    }
    p.update(changes)
    return p


def line():
    return {"defender":[{
        "position":1,"unit_code":"wolves","count":4,
        "unit_power":1.0,"source_ref":"LAB-ENCOUNTER",
    }]}


def sequence(**changes):
    s={
        "verdict":"attacker","weapon_classification_complete":True,
        "pre_shots":{"configured":False},
        "events":[{"ending":{"kind":"ordinary"}}],
        "defender":[{
            "position":1,"unit_code":"wolves","initial":4,"remaining":0,
        }],
    }
    s.update(changes)
    return s


def test_jactari_nohero_noattrition_pnj_is_not_30_percent():
    win=ordinary_neutral_casualties(
        100,attacker_victory=True,no_hero_confirmed=True,
        no_attrition_confirmed=True,
    )
    loss=ordinary_neutral_casualties(
        100,attacker_victory=False,no_hero_confirmed=True,
        no_attrition_confirmed=True,
    )
    assert win["permanent_deaths"]==100 and win["survivors"]==0
    assert loss["permanent_deaths"]==0 and loss["survivors"]==100


@pytest.mark.parametrize("attr",[
    {"no_hero_confirmed":False},{"no_attrition_confirmed":False},
    {"no_hero_confirmed":None},{"no_attrition_confirmed":None},
])
def test_neutral_special_profiles_do_not_inherit_ordinary_rule(attr):
    args={"no_hero_confirmed":True,"no_attrition_confirmed":True}
    args.update(attr)
    with pytest.raises(ValueError):
        ordinary_neutral_casualties(50,attacker_victory=True,**args)


@pytest.mark.parametrize("count",[0,-1,True,1.0,1_000_001])
def test_invalid_neutral_count_rejected(count):
    with pytest.raises(ValueError):
        ordinary_neutral_casualties(
            count,attacker_victory=True,
            no_hero_confirmed=True,no_attrition_confirmed=True,
        )


def test_successful_neutral_plan_has_no_mine_or_rewards():
    p=plan_neutral_resolution(policy(),line(),sequence(),{"status":"applied"})
    assert p["status"]=="eligible"
    assert p["neutral_deaths"]==4
    assert p["neutral_casualties"]["survivors"]==0
    assert p["encounter_resolved"] is False
    assert p["mine_activated"] is False
    assert p["territory_captured"] is False
    assert p["loot_awarded"] is False and p["experience_awarded"] is False


@pytest.mark.parametrize("snapshot,seq,settlement,expected",[
    (None,{},{},"pre_v103_not_applicable"),
    (policy(enabled=False),sequence(),{"status":"applied"},"policy_disabled"),
    (policy(no_hero_verified=False,profile_source_ref=None,
            no_attrition_verified=False),sequence(),
     {"status":"applied"},"neutral_profile_unqualified"),
    (policy(),sequence(),{"status":"not_enabled"},"attacker_settlement_not_qualified"),
    (policy(),sequence(verdict="fled"),{"status":"applied"},"flight_no_resolution"),
    (policy(),sequence(verdict="draw"),{"status":"applied"},"draw_or_unknown_outcome"),
    (policy(),sequence(weapon_classification_complete=False),
     {"status":"applied"},"weapon_classification_incomplete"),
    (policy(),sequence(pre_shots={"configured":True}),
     {"status":"applied"},"pre_shots_not_qualified"),
    (policy(),sequence(events=[{"ending":{"kind":"false_draw"}}]),
     {"status":"applied"},"special_ending_not_qualified"),
])
def test_unqualified_neutral_does_not_resolve(snapshot,seq,settlement,expected):
    p=plan_neutral_resolution(snapshot,line(),seq,settlement)
    assert p["status"]==expected
    assert p["encounter_resolved"] is False


def test_defending_neutral_without_attrition_has_no_durable_losses():
    p=plan_neutral_resolution(
        policy(),line(),sequence(verdict="defender"),{"status":"applied"},
    )
    assert p["status"]=="neutral_defended"
    assert p["neutral_casualties"]["permanent_deaths"]==0
    assert p["neutral_deaths"]==0


@pytest.mark.parametrize("broken",[
    {"enabled":1},{"no_hero_verified":1},{"no_attrition_verified":1},
    {"policy_id":"FAKE"},{"source_ref":None},{"source_ref":"a"},
    {"profile_source_ref":None},{"extra":"injected"},
])
def test_malformed_frozen_neutral_input_fails_explicitly(broken):
    with pytest.raises(ValueError):
        validate_neutral_resolution_snapshot({**policy(),**broken})


def test_neutral_remaining_count_must_agree_with_frozen_winner():
    broken=sequence(defender=[{
        "position":1,"unit_code":"wolves","initial":4,"remaining":1,
    }])
    with pytest.raises(ValueError,match="contradicts"):
        plan_neutral_resolution(policy(),line(),broken,{"status":"applied"})


class DB:
    def __init__(self):
        self.events=[]
        self.live=(False,"wolves",4,Decimal("1.0"),"LAB-ENCOUNTER")
        self.resolved=False
        self.ledger=0
    def execute(self,sql,params):
        self.events.append(sql)
        if "SELECT e.resolved" in sql:
            self.result=self.live
        elif "UPDATE region_encounters SET resolved=true" in sql:
            self.resolved=True
            self.result=(params[0],)
        elif "INSERT INTO pve_lab_neutral_resolutions" in sql:
            self.ledger+=1
            self.result=None
        else:
            raise AssertionError("Unexpected SQL")
        return self
    def fetchone(self):
        return self.result


def test_disabled_resolution_does_not_touch_database():
    db=DB()
    out=resolve_neutral_if_qualified(
        db,mission_id=uuid4(),encounter_id=uuid4(),
        snapshot=policy(enabled=False),verified_line=line(),
        sequence=sequence(),attacker_settlement={"status":"applied"},
    )
    assert out["status"]=="policy_disabled"
    assert db.events==[]


def test_enabled_resolution_updates_encounter_and_ledger_once():
    db=DB()
    out=resolve_neutral_if_qualified(
        db,mission_id=uuid4(),encounter_id=uuid4(),
        snapshot=policy(),verified_line=line(),
        sequence=sequence(),attacker_settlement={"status":"applied"},
    )
    assert out["status"]=="resolved"
    assert out["encounter_resolved"] and out["neutral_deaths"]==4
    assert not out["mine_activated"] and not out["territory_captured"]
    assert db.resolved and db.ledger==1


def test_live_encounter_mismatch_refuses_before_side_effects():
    db=DB()
    db.live=(False,"wolves",5,Decimal("1.0"),"LAB-ENCOUNTER")
    with pytest.raises(ValueError,match="changed"):
        resolve_neutral_if_qualified(
            db,mission_id=uuid4(),encounter_id=uuid4(),
            snapshot=policy(),verified_line=line(),sequence=sequence(),
            attacker_settlement={"status":"applied"},
        )
    assert not db.resolved and db.ledger==0
