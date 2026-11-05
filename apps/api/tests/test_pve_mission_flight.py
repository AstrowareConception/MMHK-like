"""US-COM-011: timed PvE worker records one flight report, never a duel."""
from contextlib import nullcontext
from datetime import UTC,datetime,timedelta
from decimal import Decimal
from uuid import uuid4

import pytest

from mmhk_api.pve_missions import advance_pve_missions
import mmhk_api.pve_missions as missions


class MissionDB:
    autocommit=True

    def __init__(self, now, *, attacker=10, defender=70, snapshot=None, ordinary_line=None):
        self.now=now
        self.mid,self.hid,self.eid=uuid4(),uuid4(),uuid4()
        self.attacker=attacker
        self.defender=defender
        self.snapshot=snapshot
        self.ordinary_line=ordinary_line
        self.stage="outbound"
        self.return_due=now+timedelta(hours=1)
        self.travel_seconds=5
        self.arrival_due=now-timedelta(seconds=1)
        self.last_row=None
        self.events=[]
        self.report=None
        self.hero_status="on_mission"
        self.queries=[]

    def transaction(self):
        return nullcontext()

    def execute(self,sql,params=None):
        normalized=" ".join(sql.split())
        self.queries.append(normalized)
        if "FROM pve_missions m WHERE" in normalized:
            date_a,date_b=params
            if (self.stage=="outbound" and self.arrival_due<=date_a or
                self.stage=="returning" and self.return_due<=date_b):
                self.last_row=(self.mid,self.stage,self.hid,self.eid,"militia",
                    self.attacker,10,self.travel_seconds,self.arrival_due,self.return_due,
                    self.snapshot,self.ordinary_line)
            else:
                self.last_row=None
        elif "SELECT unit_count,unit_power FROM region_encounters" in normalized:
            self.last_row=(self.defender,10)
        elif "UPDATE pve_missions SET stage='returning'" in normalized:
            self.stage="returning"
            self.report=params[1].obj
            self.return_due=params[2]
            self.last_row=None
        elif "UPDATE pve_missions SET stage='completed'" in normalized:
            self.stage="completed"
            self.last_row=None
        elif "UPDATE city_heroes SET status='idle'" in normalized:
            self.hero_status="idle"
            self.last_row=None
        elif "INSERT INTO pve_mission_events" in normalized:
            phase="arrived" if "'arrived'" in normalized else "returned"
            self.events.append(phase)
            self.last_row=None
        else:
            raise AssertionError("Unexpected query: "+normalized)
        return self

    def fetchone(self):
        return self.last_row


def test_flight_is_persisted_once_without_running_duel(monkeypatch):
    now=datetime(2026,11,5,8,0,tzinfo=UTC)
    db=MissionDB(now,attacker=10,defender=70)

    def forbidden(*args,**kwargs):
        raise AssertionError("No duel may start during PvE flight")

    monkeypatch.setattr(missions,"resolve_stack_duel",forbidden)
    arrived=advance_pve_missions(db,max_orders=1,now_at=now)
    assert arrived==[{"mission_id":str(db.mid),"phase":"arrived"}]
    assert db.stage=="returning"
    assert db.report["fled_before_combat"] is True
    assert db.report["outcome"] is None
    assert db.report["admission"]["threshold"]=="1/7"
    assert db.report["admission"]["fled"] is True
    assert db.report["engagement_inputs"]["source_status"]=="legacy_live_at_arrival"
    assert db.events==["arrived"]
    assert db.hero_status=="on_mission"

    # Calling a second worker at the same timestamp must not resolve twice.
    assert advance_pve_missions(db,max_orders=1,now_at=now)==[]
    assert db.events==["arrived"]

    # The hero still returns normally; flight is not a magically completed trip.
    later=now+timedelta(seconds=6)
    completed=advance_pve_missions(db,max_orders=1,now_at=later)
    assert completed==[{"mission_id":str(db.mid),"phase":"returned"}]
    assert db.hero_status=="idle"
    assert db.stage=="completed"
    assert db.events==["arrived","returned"]
    assert advance_pve_missions(db,max_orders=1,now_at=later)==[]


def test_admitted_mission_still_executes_existing_duel(monkeypatch):
    now=datetime(2026,11,5,8,0,tzinfo=UTC)
    db=MissionDB(now,attacker=70,defender=10)
    calls=[]

    def dummy(request):
        calls.append(request)
        return {
            "losses":{"attacker":-1,"defender":10},
            "remaining":{"attacker":70,"defender":0},
            "dispersed":{"attacker":False,"defender":True},
            "draw":False,"falseDraw":0,
        }

    monkeypatch.setattr(missions,"resolve_stack_duel",dummy)
    advance_pve_missions(db,max_orders=1,now_at=now)
    assert len(calls)==1
    assert db.report["fled_before_combat"] is False
    assert db.report["admission"]["fled"] is False
    assert db.report["outcome"] is not None


def test_frozen_encounter_ignores_later_live_strength_changes():
    """A frozen opponent cannot turn an admitted mission into a flight."""
    from mmhk_api.pve_encounter_snapshot import POLICY_ID
    now=datetime(2026,11,5,8,0,tzinfo=UTC)
    frozen={
        "policy_id":POLICY_ID,
        "unit_code":"wolves",
        "unit_count":40,"unit_power":10,
        "source_ref":"LAB-MISSION-FROZEN",
    }
    db=MissionDB(now,attacker=10,defender=800,snapshot=frozen)
    result=advance_pve_missions(db,max_orders=1,now_at=now)
    assert result[0]["phase"]=="arrived"
    assert db.report["fled_before_combat"] is False
    assert db.report["engagement_inputs"]["source_status"]=="frozen_at_departure"
    assert db.report["engagement_inputs"]["defender"]["unit_count"]==40
    assert Decimal(db.report["admission"]["defender_raw_power"])==Decimal("400")
    assert not any("SELECT unit_count,unit_power FROM region_encounters" in q
                   for q in db.queries)
    assert advance_pve_missions(db,max_orders=1,now_at=now)==[]


def test_corrupt_frozen_opponent_is_rejected_without_live_fallback():
    from mmhk_api.pve_encounter_snapshot import POLICY_ID
    now=datetime(2026,11,5,8,0,tzinfo=UTC)
    corrupt={
        "policy_id":POLICY_ID,
        "unit_code":"wolves",
        "unit_count":0,"unit_power":10,
        "source_ref":"LAB-MISSION",
    }
    db=MissionDB(now,attacker=10,defender=800,snapshot=corrupt)
    with pytest.raises(ValueError,match="frozen opponent"):
        advance_pve_missions(db,max_orders=1,now_at=now)
    assert db.stage=="outbound"
    assert db.report is None
    assert db.events==[]
    assert not any("SELECT unit_count,unit_power FROM region_encounters" in q
                   for q in db.queries)



def test_v101_complete_line_uses_only_frozen_positions_and_never_live_fallback():
    """The entire 1..7 line is resolved from frozen values, not catalogues."""
    from mmhk_api.pve_ordinary_line_snapshot import POLICY_ID as LINE_POLICY
    from mmhk_api.pve_encounter_snapshot import POLICY_ID as DEF_POLICY
    now=datetime(2026,11,5,11,0,tzinfo=UTC)
    defender={"policy_id":DEF_POLICY,"unit_code":"wolves",
              "unit_count":4,"unit_power":1,"source_ref":"TEST-V101"}
    attacker=[
        {"position":1,"unit_code":"militia","count":10,
         "unit_power":10,"weapon_code":None,"weapon_source_ref":None,
         "profile_policy_id":"TEST-V101"},
        {"position":7,"unit_code":"archers","count":5,
         "unit_power":20,"weapon_code":None,"weapon_source_ref":None,
         "profile_policy_id":"TEST-V101"},
    ]
    enemy=[{"position":1,"unit_code":"wolves","count":4,
            "unit_power":1,"weapon_code":None,"weapon_source_ref":None,
            "profile_policy_id":DEF_POLICY,"source_ref":"TEST-V101"}]
    db=MissionDB(now,attacker=10,defender=10000,snapshot=defender,
                 ordinary_line={"policy_id":LINE_POLICY,
                                "attacker":attacker,"defender":enemy})
    assert advance_pve_missions(db,max_orders=1,now_at=now)[0]["phase"]=="arrived"
    line=db.report["line_outcome"]
    assert line["policy_id"]=="jactari-sequential-ordinary-v1"
    assert [s["initial"] for s in line["attacker"]]==[10,5]
    assert db.report["admission"]["attacker_raw_power"]=="200.0"
    assert db.report["engagement_inputs"]["combat_scope"]=="LAB-ORDINARY-STACK-SEQUENCE-V1"
    assert db.report["no_losses_applied"] is True
    assert db.report["no_rewards"] is True
    assert db.report["outcome"] is None
    assert db.events==["arrived"]
    assert not any("region_encounters" in q for q in db.queries)
    assert advance_pve_missions(db,max_orders=1,now_at=now)==[]


def test_v101_corrupt_line_blocks_without_mutation_or_live_reinterpretation():
    from mmhk_api.pve_ordinary_line_snapshot import POLICY_ID as LINE_POLICY
    from mmhk_api.pve_encounter_snapshot import POLICY_ID as DEF_POLICY
    now=datetime(2026,11,5,11,0,tzinfo=UTC)
    defender={"policy_id":DEF_POLICY,"unit_code":"wolves","unit_count":4,
              "unit_power":1,"source_ref":"TEST-V101"}
    line={"policy_id":LINE_POLICY,"attacker":[],
          "defender":[]}
    db=MissionDB(now,attacker=10,defender=4000,
                 snapshot=defender,ordinary_line=line)
    with pytest.raises(ValueError,match="frozen ordinary line"):
        advance_pve_missions(db,max_orders=1,now_at=now)
    assert db.stage=="outbound"
    assert db.report is None and db.events==[]
    assert not any("region_encounters" in q for q in db.queries)
