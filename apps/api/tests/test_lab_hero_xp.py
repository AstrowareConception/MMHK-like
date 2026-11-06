"""V109: genuine CODE-01 hero thresholds, opt-in LAB awards, and rollback.

All persisted mutations run through PostgreSQL 17. A test-only amount is
operator attested, not presented as the game's historical XP calculation.
"""
from datetime import datetime
import json
from pathlib import Path
from uuid import uuid4

import psycopg
import pytest

from test_construction_integration import city,headers,client,URL
from test_pve_missions_integration import (
    _setup,_qualify_v103_neutral,advance_pve_missions,
)
from mmhk_api.hero_experience import (
    MAX_XP,hero_progress,historical_hero_level,
    qualify_lab_xp_reward,configure_lab_xp_policy,validate_xp_snapshot,
)


def _setup_xp(city,*,amount=800,qualify=True,enable=True):
    hero,unit,encounter=_setup(city)
    _qualify_v103_neutral(city["world"],hero,unit,encounter)
    with psycopg.connect(URL) as db:
        if qualify:
            q=qualify_lab_xp_reward(
                db,encounter_id=encounter,experience_amount=amount,
                source_ref="LAB-OPERATOR-ATTESTED-XP-NOT-S2",
            )
            assert q["experience_amount"]==amount
        if enable:
            state=configure_lab_xp_policy(
                db,world_id=city["world"],enabled=True,
                source_ref="LAB-V109-EXPLICIT-ONLY",
            )
            assert state["enabled_for_future_missions_only"]
    return hero,unit,encounter


def _launch(city,hero,unit,encounter,mid):
    root=f"/api/v1/me/cities/{city['city']}"
    owner=headers(city["username"])
    payload={"mission_id":mid,"hero_id":str(hero),
             "encounter_id":str(encounter),"unit_code":unit}
    r=client.post(root+"/missions",headers=owner,json=payload)
    assert r.status_code==201,r.text
    return root,owner,payload,r


def _arrive(launched):
    due=datetime.fromisoformat(launched.json()["arrival_due_at"])
    with psycopg.connect(URL,autocommit=True) as db:
        assert advance_pve_missions(db,now_at=due)==[
            {"mission_id":launched.json()["mission_id"],"phase":"arrived"}
        ]
        assert advance_pve_missions(db,now_at=due)==[]


def test_historical_xp_table_matches_unmodified_jactari_source(city):
    source=Path(__file__).resolve().parents[3]/"data/reference/heros.json"
    levels=json.loads(source.read_text(encoding="utf-8"))["_niveaux"]
    with psycopg.connect(URL) as db:
        rows=db.execute(
            "SELECT level,required_xp FROM hero_xp_thresholds_v109 ORDER BY level"
        ).fetchall()
        assert rows==[(i,levels[i][0]) for i in range(1,41)]
        assert rows[0]==(1,0) and rows[1]==(2,800)
        assert rows[-1]==(40,MAX_XP)
        for value,expected in ((0,1),(799,1),(800,2),
                               (3003583,39),(3003584,40)):
            assert historical_hero_level(db,value)==expected
        p=hero_progress(db,level=1,xp=799)
        assert p["next_level"]==2 and p["experience_to_next_level"]==1
        assert p["level_consistent_with_thresholds"]
        p=hero_progress(db,level=40,xp=MAX_XP)
        assert p["next_level"] is None
        assert not p["max_level_rule_qualified"]
        with pytest.raises(psycopg.errors.CheckViolation):
            db.execute(
                "UPDATE hero_xp_thresholds_v109 SET required_xp=1 WHERE level=1"
            )


@pytest.mark.parametrize("bad",[
    {}, {"policy_id":"LAB-PVE-QUALIFIED-XP-V1"},
    {"policy_id":"LAB-PVE-QUALIFIED-XP-V1","enabled":True,
     "policy_source_ref":"source","reward_source_ref":"source",
     "experience_amount":True},
    {"policy_id":"LAB-PVE-QUALIFIED-XP-V1","enabled":True,
     "policy_source_ref":"source","reward_source_ref":"source",
     "experience_amount":-1},
])
def test_invalid_frozen_xp_is_never_silently_repaired(bad):
    with pytest.raises(ValueError):
        validate_xp_snapshot(bad)
    assert validate_xp_snapshot(None) is None


def test_xp_requires_operator_neutral_qualification_and_lab_world(city):
    hero,unit,encounter=_setup(city)
    with psycopg.connect(URL) as db:
        with pytest.raises(ValueError,match="qualified"):
            qualify_lab_xp_reward(
                db,encounter_id=encounter,experience_amount=800,
                source_ref="LAB-DENIED-UNQUALIFIED",
            )
        with pytest.raises(psycopg.errors.CheckViolation):
            db.execute(
                """INSERT INTO pve_lab_xp_policies(world_id,enabled,source_ref)
                   VALUES(%s,true,'LAB-DENIED')""",(city["world"],),
            )


def test_xp_award_freezes_before_departure_and_is_atomic_replay_safe(city):
    hero,unit,encounter=_setup_xp(city)
    mid=str(uuid4())
    root,owner,payload,launched=_launch(city,hero,unit,encounter,mid)
    with psycopg.connect(URL) as db:
        snap=db.execute(
            "SELECT xp_reward_snapshot FROM pve_missions WHERE mission_id=%s",
            (mid,),
        ).fetchone()[0]
        assert snap["enabled"] and snap["experience_amount"]==800
        assert snap["reward_source_ref"]=="LAB-OPERATOR-ATTESTED-XP-NOT-S2"
        # Policy changes are allowed for FUTURE dispatches, never this order.
        configure_lab_xp_policy(
            db,world_id=city["world"],enabled=False,
            source_ref="LAB-POLICY-REVOKED-AFTER-DISPATCH",
        )
        with psycopg.connect(URL) as immutable_db:
            with pytest.raises(psycopg.errors.CheckViolation):
                immutable_db.execute(
                    "UPDATE pve_missions SET xp_reward_snapshot=NULL WHERE mission_id=%s",
                    (mid,),
                )
    _arrive(launched)
    report=client.get(root+"/missions/"+mid+"/report",headers=owner)
    assert report.status_code==200,report.text
    assert client.get(root+"/missions/"+mid+"/report",
                      headers=headers(city["enemyname"])).status_code==404
    duel=report.json()["duel_report"]
    assert duel["neutral_resolution"]["encounter_resolved"]
    assert duel["neutral_resolution"]["experience_awarded"] is True
    assert duel["hero_experience"]["status"]=="awarded"
    assert duel["hero_experience"]["experience_awarded"]==800
    assert duel["hero_experience"]["before_level"]==1
    assert duel["hero_experience"]["after_level"]==2
    assert duel["no_rewards"] is False
    roster=client.get(root+"/forces",headers=owner)
    assert roster.status_code==200,roster.text
    owned=next(h for h in roster.json()["heroes"] if h["hero_id"]==str(hero))
    assert owned["experience"]==800 and owned["level"]==2
    assert owned["experience_progress"]["next_level"]==3
    assert owned["experience_progress"]["next_level_experience"]==2000
    with psycopg.connect(URL) as db:
        assert db.execute(
            "SELECT experience,level FROM city_heroes WHERE hero_id=%s",(hero,),
        ).fetchone()==(800,2)
        assert db.execute(
            "SELECT experience_awarded,before_level,after_level "
            "FROM pve_lab_xp_awards WHERE mission_id=%s",(mid,),
        ).fetchone()==(800,1,2)
        assert db.execute("SELECT count(*) FROM pve_lab_xp_awards "
                          "WHERE encounter_id=%s",(encounter,)).fetchone()[0]==1
        with psycopg.connect(URL) as immutable_db:
            with pytest.raises(psycopg.errors.CheckViolation):
                immutable_db.execute(
                    "UPDATE pve_lab_xp_awards SET experience_awarded=1 "
                    "WHERE mission_id=%s",(mid,),
                )
            with pytest.raises(psycopg.errors.CheckViolation):
                immutable_db.execute(
                    "DELETE FROM pve_lab_xp_awards WHERE mission_id=%s",(mid,),
                )
    replay=client.post(root+"/missions",headers=owner,json=payload)
    assert replay.status_code==200
    assert replay.json()["replayed"] is True
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT experience FROM city_heroes WHERE hero_id=%s",
                          (hero,)).fetchone()[0]==800


def test_unqualified_reward_never_invents_xp_on_qualified_neutral_win(city):
    hero,unit,encounter=_setup_xp(city,qualify=False)
    root,owner,_,launch=_launch(city,hero,unit,encounter,str(uuid4()))
    _arrive(launch)
    r=client.get(root+"/missions/"+launch.json()["mission_id"]+"/report",
                 headers=owner).json()["duel_report"]
    assert r["neutral_resolution"]["status"]=="resolved"
    assert r["hero_experience"]["status"]=="reward_not_qualified"
    assert r["hero_experience"]["experience_awarded"]==0
    assert r["no_rewards"] is True
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT experience,level FROM city_heroes WHERE hero_id=%s",
                          (hero,)).fetchone()==(0,1)
        assert db.execute("SELECT count(*) FROM pve_lab_xp_awards "
                          "WHERE hero_id=%s",(hero,)).fetchone()[0]==0


def test_past_maximum_requires_new_policy_instead_of_guessing_cap(city):
    hero,unit,encounter=_setup_xp(city,amount=100)
    # This is a TEST setup of an existing source-derived level, not a reward.
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_heroes SET experience=%s,level=39 "
                   "WHERE hero_id=%s",(MAX_XP-50,hero))
    root,owner,_,launch=_launch(city,hero,unit,encounter,str(uuid4()))
    _arrive(launch)
    r=client.get(root+"/missions/"+launch.json()["mission_id"]+"/report",
                 headers=owner).json()["duel_report"]
    assert r["neutral_resolution"]["status"]=="resolved"
    assert r["hero_experience"]["status"]=="max_level_reward_not_qualified"
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT experience,level FROM city_heroes WHERE hero_id=%s",
                          (hero,)).fetchone()==(MAX_XP-50,39)
