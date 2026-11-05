"""V102: durable losses are opt-in and never infer missing S2 rules."""
from copy import deepcopy
from uuid import uuid4

import pytest

from mmhk_api.pve_lab_settlement import (
    POLICY_ID, plan_attacker_losses, settle_attacker_if_qualified,
    validate_casualty_policy_snapshot,
)


def policy(**changes):
    p = {
        "policy_id": POLICY_ID, "enabled": True,
        "source_ref": "LAB-EXPLICIT-TEST",
        "zero_hero_profile": True,
        "hero_profile_source_ref": "LAB-ZERO-HERO-TEST",
    }
    p.update(changes)
    return p


def frozen():
    return {"attacker": [
        {"position": 1, "unit_code": "militia", "count": 100},
        {"position": 7, "unit_code": "archers", "count": 50},
    ]}


def sequence():
    return {
        "verdict": "attacker",
        "weapon_classification_complete": True,
        "pre_shots": {"configured": False},
        "events": [{"ending": {"kind": "ordinary"}}],
        "attacker": [
            {"position": 1, "unit_code": "militia", "initial": 100, "remaining": 50},
            {"position": 7, "unit_code": "archers", "initial": 50, "remaining": 0},
        ],
    }


def test_two_positions_get_15_and_15_deaths_from_50_dispersals_each():
    result = plan_attacker_losses(policy(), frozen(), sequence())
    assert result["status"] == "eligible"
    assert [e["position"] for e in result["entries"]] == [1, 7]
    assert [e["dispersed"] for e in result["entries"]] == [50, 50]
    assert [e["permanent_deaths"] for e in result["entries"]] == [15, 15]
    assert result["total_deaths"] == 30
    assert result["no_npc_losses"] and result["no_loot"] and result["no_xp"]


def test_zero_dispersions_means_zero_durable_deaths():
    report = sequence()
    for s in report["attacker"]:
        s["remaining"] = s["initial"]
    result = plan_attacker_losses(policy(), frozen(), report)
    assert result["status"] == "eligible"
    assert result["total_deaths"] == 0


@pytest.mark.parametrize("change,expected", [
    ({"enabled": False}, "not_enabled"),
    ({"zero_hero_profile": False, "hero_profile_source_ref": None},
     "zero_hero_profile_not_qualified"),
])
def test_policy_controls_activation(change, expected):
    assert plan_attacker_losses(policy(**change), frozen(), sequence())["status"] == expected


def test_missing_v102_snapshot_is_explicit_and_never_mutates():
    assert plan_attacker_losses(None, frozen(), sequence())["status"] == "pre_v102_no_settlement"


@pytest.mark.parametrize("changed,expected", [
    ({"verdict": "fled"}, "fled_without_combat"),
    ({"verdict": "draw"}, "nonordinary_verdict"),
    ({"weapon_classification_complete": False}, "weapon_classification_incomplete"),
    ({"pre_shots": {"configured": True}}, "pre_shots_not_qualified"),
    ({"events": [{"ending": {"kind": "false_draw"}}]},
     "special_jactari_ending_not_qualified"),
])
def test_unqualified_outcomes_never_change_armies(changed, expected):
    report = {**sequence(), **changed}
    assert plan_attacker_losses(policy(), frozen(), report)["status"] == expected


@pytest.mark.parametrize("damage", [
    {"policy_id": "OTHER"}, {"enabled": 1},
    {"enabled": True, "source_ref": None},
    {"zero_hero_profile": True, "hero_profile_source_ref": None},
    {"source_ref": "a"}, {"hero_profile_source_ref": []},
    {"unknown": True},
])
def test_malformed_nonnull_snapshot_is_not_silently_disabled(damage):
    broken = {**policy(), **damage}
    with pytest.raises(ValueError):
        validate_casualty_policy_snapshot(broken)


def test_corrupt_survivor_counts_cannot_debit_anything():
    report = sequence()
    report["attacker"][0]["remaining"] = 101
    with pytest.raises(ValueError, match="contradicts"):
        plan_attacker_losses(policy(), frozen(), report)


class FakeDB:
    def __init__(self):
        self.current = {"militia": 100, "archers": 50}
        self.queries = []
        self.ledger = 0
        self.deleted_formation = False

    def execute(self, sql, params):
        self.queries.append(sql)
        if "SELECT unit_code,quantity FROM hero_army_units" in sql:
            self.result = sorted(self.current.items())
        elif "UPDATE hero_army_units SET" in sql:
            deaths, hero, code, expected = params
            assert self.current[code] == expected
            self.current[code] -= deaths
            self.result = (self.current[code],)
        elif "DELETE FROM hero_formation_slots" in sql:
            self.deleted_formation = True
            self.result = None
        elif "INSERT INTO pve_lab_casualty_settlements" in sql:
            self.ledger += 1
            self.result = None
        else:
            raise AssertionError(f"Unexpected SQL: {sql}")
        return self

    def fetchall(self):
        return self.result

    def fetchone(self):
        return self.result


def test_pure_disabled_path_does_not_query_or_debit_db():
    db = FakeDB()
    result = settle_attacker_if_qualified(
        db, mission_id=uuid4(), hero_id=uuid4(),
        snapshot=policy(enabled=False), verified_line=frozen(), sequence=sequence(),
    )
    assert result["status"] == "not_enabled"
    assert db.queries == []


def test_pure_qualified_path_has_ledger_and_exact_debits():
    db = FakeDB()
    result = settle_attacker_if_qualified(
        db, mission_id=uuid4(), hero_id=uuid4(),
        snapshot=policy(), verified_line=frozen(), sequence=sequence(),
    )
    assert result["status"] == "applied"
    assert result["total_deaths"] == 30
    assert db.current == {"militia": 85, "archers": 35}
    assert db.ledger == 1 and db.deleted_formation
