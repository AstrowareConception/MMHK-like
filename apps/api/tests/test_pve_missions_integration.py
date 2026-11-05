"""Real PostgreSQL mission lifecycle: two deadlines, one hero, immutable duel report."""
from datetime import datetime,timedelta
from uuid import uuid4
import psycopg
from psycopg.types.json import Jsonb
from test_construction_integration import city,headers,client,URL
from mmhk_api.pve_missions import advance_pve_missions

def _setup(city):
    with psycopg.connect(URL) as db:
        owner=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",(city["city"],)).fetchone()[0]
        hero=uuid4()
        code="missionunit_"+uuid4().hex[:12]
        db.execute("""INSERT INTO city_unit_profiles(unit_code,display_name,dwelling_code,tier,
                   unit_costs,policy_id,lab_duel_power)
                   VALUES(%s,'Sentinelles de test','recruit_t1',1,%s,'TEST-MISSION',2.0)""",
                   (code,Jsonb({k:0 for k in ("gold","wood","ore","crystal","gems","sulfur","mercury")})))
        db.execute("""INSERT INTO city_heroes(hero_id,city_id,owner_account_id,name,archetype)
                      VALUES(%s,%s,%s,'Pèlerin de test','might')""",(hero,city["city"],owner))
        db.execute("INSERT INTO hero_army_units(hero_id,unit_code,quantity) VALUES(%s,%s,8)",(hero,code))
        encounter=uuid4()
        db.execute("""INSERT INTO region_encounters
                  (encounter_id,city_id,cell_i,cell_j,name,unit_code,unit_count,unit_power,source_ref)
                  VALUES(%s,%s,1,3,'Brigands témoins','brigands',4,1.0,'TEST-MISSION')""",
                  (encounter,city["city"]))
        db.execute("""INSERT INTO pve_travel_policies(world_id,seconds_per_step,policy_id)
                      VALUES(%s,30,'TEST-TRAVEL-V1')""",(city["world"],))
    return hero,code,encounter

def test_hero_goes_out_and_back_only_when_worker_confirms(city):
    hero,unit,encounter=_setup(city)
    root=f"/api/v1/me/cities/{city['city']}"
    h=headers(city["username"]);foreign=headers(city["enemyname"])
    payload={"mission_id":str(uuid4()),"hero_id":str(hero),
             "encounter_id":str(encounter),"unit_code":unit}
    # Free hero has eight assigned units; explicitly split them into two slots.
    layout=client.post(f"{root}/heroes/{hero}/formation",headers=h,json={
        "order_id":str(uuid4()),"positions":[
            {"position":1,"unit_code":unit,"quantity":3},
            {"position":7,"unit_code":unit,"quantity":5}
        ]})
    assert layout.status_code==201,layout.text
    assert client.post(root+"/missions",json=payload).status_code==401
    assert client.post(root+"/missions",headers=foreign,json=payload).status_code==404
    started=client.post(root+"/missions",headers=h,json=payload)
    assert started.status_code==201,started.text
    result=started.json()
    assert result["travel_seconds"]==60
    report_url=root+"/missions/"+payload["mission_id"]+"/report"
    assert client.get(report_url).status_code==401
    assert client.get(report_url,headers=foreign).status_code==404
    pending=client.get(report_url,headers=h).json()
    assert pending["duel_report"] is None
    assert [p["position"] for p in pending["formation_snapshot"]]==[1,7]
    assert pending["events"][0]["phase"]=="departed"
    arrival=datetime.fromisoformat(result["arrival_due_at"])
    return_at=datetime.fromisoformat(result["return_due_at"])
    assert (return_at-arrival).total_seconds()==60
    assert client.post(root+"/missions",headers=h,json=payload).status_code==200
    assert client.post(root+"/missions",headers=h,json={
        **payload,"mission_id":str(uuid4())}).status_code==409
    assert client.post(root+"/missions",headers=h,json={
        **payload,"mission_id":str(uuid4()),"unit_code":"wrong"}).status_code==409
    state=client.get(root+"/missions",headers=h).json()
    assert state["travel_policy"]["policy_id"]=="TEST-TRAVEL-V1"
    assert state["missions"][0]["stage"]=="outbound"
    assert state["missions"][0]["duel_report"] is None
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT status FROM city_heroes WHERE hero_id=%s",(hero,)).fetchone()[0]=="on_mission"
    with psycopg.connect(URL,autocommit=True) as db:
        assert advance_pve_missions(db,now_at=arrival-timedelta(microseconds=1))==[]
        arrived=advance_pve_missions(db,now_at=arrival)
        assert len(arrived)==1 and arrived[0]["phase"]=="arrived"
    underway=client.get(root+"/missions",headers=h).json()["missions"][0]
    assert underway["stage"]=="returning"
    assert underway["duel_report"]["scope"]=="LAB-ORDINARY-STACK-SEQUENCE"
    assert underway["duel_report"]["no_losses_applied"] is True
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT status FROM city_heroes WHERE hero_id=%s",(hero,)).fetchone()[0]=="on_mission"
    with psycopg.connect(URL,autocommit=True) as db:
        assert advance_pve_missions(db,now_at=return_at-timedelta(microseconds=1))==[]
        returned=advance_pve_missions(db,now_at=return_at)
        assert len(returned)==1 and returned[0]["phase"]=="returned"
        assert advance_pve_missions(db,now_at=return_at)==[]
    finished=client.get(root+"/missions",headers=h).json()["missions"][0]
    assert finished["stage"]=="completed"
    final_report=client.get(report_url,headers=h).json()
    assert [e["phase"] for e in final_report["events"]]==[
        "departed","arrived","returned"]
    assert final_report["formation_snapshot"]==pending["formation_snapshot"]
    assert final_report["duel_report"]["no_losses_applied"] is True
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT status FROM city_heroes WHERE hero_id=%s",(hero,)).fetchone()[0]=="idle"
        assert db.execute("SELECT quantity FROM hero_army_units WHERE hero_id=%s AND unit_code=%s",
                          (hero,unit)).fetchone()[0]==8
        assert db.execute("SELECT resolved,unit_count FROM region_encounters WHERE encounter_id=%s",
                          (encounter,)).fetchone()==(False,4)
        assert db.execute("SELECT phase FROM pve_mission_events WHERE mission_id=%s ORDER BY occurred_at",
                          (payload["mission_id"],)).fetchall()==[("departed",),("arrived",),("returned",)]

def test_missions_remain_private_and_worker_immune_to_replays(city):
    hero,unit,encounter=_setup(city)
    root=f"/api/v1/me/cities/{city['city']}"
    h=headers(city["username"]);e=headers(city["enemyname"])
    assert client.get(root+"/missions",headers=e).status_code==404
    assert client.get(root+"/missions",headers=h).json()["missions"]==[]
    payload={"mission_id":str(uuid4()),"hero_id":str(hero),
             "encounter_id":str(encounter),"unit_code":unit}
    assert client.post(root+"/missions",headers=h,json=payload).status_code==201
    assert client.post(root+"/missions",headers=h,json={
        **payload,"encounter_id":str(uuid4())}).status_code==409
    own_timeline=client.get("/api/v1/me/timeline",headers=h).json()["events"]
    kinds={event["type"] for event in own_timeline}
    assert "hero_arrival" in kinds and "hero_return" in kinds
    assert client.get("/api/v1/me/timeline",headers=e).json()["events"]==[]


def test_late_worker_never_shortens_the_return_leg(city):
    hero,unit,encounter=_setup(city)
    h=headers(city["username"])
    root=f"/api/v1/me/cities/{city['city']}"
    created=client.post(root+"/missions",headers=h,json={
      "mission_id":str(uuid4()),"hero_id":str(hero),
      "encounter_id":str(encounter),"unit_code":unit})
    assert created.status_code==201,created.text
    scheduled=datetime.fromisoformat(created.json()["arrival_due_at"])
    actual=scheduled+timedelta(seconds=19)
    with psycopg.connect(URL,autocommit=True) as db:
        report=advance_pve_missions(db,now_at=actual)
        assert len(report)==1 and report[0]["phase"]=="arrived"
    mission=client.get(root+"/missions",headers=h).json()["missions"][0]
    assert mission["arrived_at"]==actual.isoformat()
    adjusted=datetime.fromisoformat(mission["return_due_at"])
    assert (adjusted-actual).total_seconds()==60
    with psycopg.connect(URL,autocommit=True) as db:
        assert advance_pve_missions(db,now_at=adjusted-timedelta(seconds=1))==[]
        assert advance_pve_missions(db,now_at=adjusted)[0]["phase"]=="returned"
    assert client.get(root+"/forces",headers=h).json()["heroes"][0]["status"]=="idle"


def test_v100_departure_snapshot_survives_encounter_changes_and_replay(city):
    """Real PostgreSQL: combat inputs are frozen even when the world changes."""
    hero,unit,encounter=_setup(city)
    h=headers(city["username"])
    root=f"/api/v1/me/cities/{city['city']}"
    payload={"mission_id":str(uuid4()),"hero_id":str(hero),
             "encounter_id":str(encounter),"unit_code":unit}
    started=client.post(root+"/missions",headers=h,json=payload)
    assert started.status_code==201,started.text
    arrival=datetime.fromisoformat(started.json()["arrival_due_at"])
    with psycopg.connect(URL) as db:
        snapshot=db.execute(
            "SELECT defender_snapshot FROM pve_missions WHERE mission_id=%s",
            (payload["mission_id"],),
        ).fetchone()[0]
        assert snapshot["policy_id"]=="LAB-PVE-DEFENDER-AT-DEPARTURE-V1"
        assert snapshot["unit_code"]=="brigands"
        assert snapshot["unit_count"]==4
        assert float(snapshot["unit_power"])==1.0
        assert snapshot["source_ref"]=="TEST-MISSION"
        # An administrator changes the encounter AFTER the hero departed.
        db.execute("UPDATE region_encounters SET unit_count=1000,unit_power=99 "
                   "WHERE encounter_id=%s",(encounter,))

    with psycopg.connect(URL,autocommit=True) as db:
        arrived=advance_pve_missions(db,now_at=arrival)
        assert arrived==[{"mission_id":payload["mission_id"],"phase":"arrived"}]
        assert advance_pve_missions(db,now_at=arrival)==[]
    report=client.get(root+"/missions/"+payload["mission_id"]+"/report",
                      headers=h).json()
    inputs=report["duel_report"]["engagement_inputs"]
    assert inputs["source_status"]=="frozen_at_departure"
    assert inputs["defender"]==snapshot
    assert inputs["combat_scope"]=="LAB-ORDINARY-STACK-SEQUENCE-V1"
    assert inputs["defender_line"][0]["count"]==4
    assert inputs["attacker_line"][0]["count"]==8
    assert report["duel_report"]["admission"]["defender_raw_power"]=="4.0"
    assert report["duel_report"]["fled_before_combat"] is False

    # The snapshot cannot be edited to replay the encounter at a new power.
    with psycopg.connect(URL) as db:
        with db.transaction():
            with __import__("pytest").raises(psycopg.errors.CheckViolation):
                db.execute(
                    """UPDATE pve_missions
                       SET defender_snapshot=jsonb_set(
                         defender_snapshot,'{unit_count}','100'::jsonb
                       ) WHERE mission_id=%s""",
                    (payload["mission_id"],),
                )
    with psycopg.connect(URL) as db:
        events=db.execute(
            "SELECT phase FROM pve_mission_events WHERE mission_id=%s",
            (payload["mission_id"],),
        ).fetchall()
        assert events.count(("arrived",))==1

    # A replay, edit or changed formation cannot modify an already
    # confirmed report or attacker input. SQL enforces this for ALL writers.
    import pytest
    for statement in (
        "UPDATE pve_missions SET stack_count=stack_count+1 WHERE mission_id=%s",
        "UPDATE pve_missions SET duel_report='{}'::jsonb WHERE mission_id=%s",
        "UPDATE pve_missions SET stage='outbound' WHERE mission_id=%s",
    ):
        with psycopg.connect(URL) as db:
            with pytest.raises(psycopg.errors.CheckViolation):
                db.execute(statement,(payload["mission_id"],))



def test_v101_qualified_full_formation_survives_profile_mutation(city):
    """PostgreSQL freezes both ordinary slots and qualified weapon classes."""
    import pytest
    hero,unit,encounter=_setup(city)
    extra="labreserve_"+uuid4().hex[:12]
    with psycopg.connect(URL) as db:
        db.execute("""INSERT INTO city_unit_profiles(
            unit_code,display_name,dwelling_code,tier,unit_costs,policy_id,
            lab_duel_power,combat_weapon_code,combat_weapon_source_ref)
          VALUES(%s,'Réserve qualifiée','recruit_t1',1,%s,
                 'TEST-V101',5,'R','TEST-COUNTER-V101')""",
                   (extra,Jsonb({k:0 for k in (
                       "gold","wood","ore","crystal","gems","sulfur","mercury"
                   )})))
        db.execute("INSERT INTO hero_army_units(hero_id,unit_code,quantity) "
                   "VALUES(%s,%s,3)",(hero,extra))
        db.execute("""UPDATE city_unit_profiles SET
            combat_weapon_code='I',combat_weapon_source_ref='TEST-COUNTER-V101'
            WHERE unit_code=%s""",(unit,))
        db.execute("""UPDATE region_encounters SET
            combat_weapon_code='C',combat_weapon_source_ref='TEST-COUNTER-V101'
            WHERE encounter_id=%s""",(encounter,))
    h=headers(city["username"])
    root=f"/api/v1/me/cities/{city['city']}"
    saved=client.post(f"{root}/heroes/{hero}/formation",headers=h,json={
        "order_id":str(uuid4()),
        "positions":[{"position":1,"unit_code":unit,"quantity":8},
                     {"position":7,"unit_code":extra,"quantity":3}],
    })
    assert saved.status_code==201,saved.text
    mid=str(uuid4())
    start=client.post(root+"/missions",headers=h,json={
        "mission_id":mid,"hero_id":str(hero),
        "encounter_id":str(encounter),"unit_code":unit,
    })
    assert start.status_code==201,start.text
    with psycopg.connect(URL) as db:
        line,defender=db.execute(
            "SELECT ordinary_line_snapshot,defender_snapshot "
            "FROM pve_missions WHERE mission_id=%s",(mid,),
        ).fetchone()
        assert [s["position"] for s in line["attacker"]]==[1,7]
        assert [s["count"] for s in line["attacker"]]==[8,3]
        assert [s["weapon_code"] for s in line["attacker"]]==["I","R"]
        assert line["defender"][0]["weapon_code"]=="C"
        assert defender["unit_count"]==4
        # External administrative edits after dispatch must not change the duel.
        db.execute("UPDATE city_unit_profiles SET lab_duel_power=900,"
                   "combat_weapon_code='E' WHERE unit_code=%s",(unit,))
        db.execute("UPDATE city_unit_profiles SET lab_duel_power=400 "
                   "WHERE unit_code=%s",(extra,))
        db.execute("UPDATE region_encounters SET unit_count=700,unit_power=200,"
                   "combat_weapon_code='E' WHERE encounter_id=%s",(encounter,))
    with psycopg.connect(URL,autocommit=True) as db:
        assert advance_pve_missions(
            db,now_at=datetime.fromisoformat(start.json()["arrival_due_at"])
        )==[{"mission_id":mid,"phase":"arrived"}]
    result=client.get(root+"/missions/"+mid+"/report",headers=h)
    assert result.status_code==200,result.text
    duel=result.json()["duel_report"]
    assert duel["engagement_inputs"]["attacker_line"]==line["attacker"]
    assert duel["engagement_inputs"]["defender_line"]==line["defender"]
    assert duel["line_outcome"]["policy_id"]=="jactari-sequential-ordinary-v1"
    assert [s["initial"] for s in duel["line_outcome"]["attacker"]]==[8,3]
    assert [s["position"] for s in duel["line_outcome"]["attacker"]]==[1,7]
    assert duel["line_outcome"]["weapon_classification_complete"] is True
    assert duel["no_losses_applied"] is True and duel["no_rewards"] is True
    assert duel["admission"]["defender_raw_power"]=="4.0"
    with psycopg.connect(URL) as db:
        for sql in (
            "UPDATE pve_missions SET ordinary_line_snapshot=NULL WHERE mission_id=%s",
            "UPDATE pve_missions SET ordinary_line_snapshot=jsonb_set("
            "ordinary_line_snapshot,'{attacker,0,count}','100'::jsonb) "
            "WHERE mission_id=%s",
        ):
            with db.transaction():
                with pytest.raises(psycopg.errors.CheckViolation):
                    db.execute(sql,(mid,))
        assert db.execute("SELECT quantity FROM hero_army_units "
                          "WHERE hero_id=%s AND unit_code=%s",(hero,unit)
                         ).fetchone()[0]==8


def test_v101_refuses_unqualified_secondary_stack_before_mission(city):
    hero,unit,encounter=_setup(city)
    extra="unrated_"+uuid4().hex[:12]
    with psycopg.connect(URL) as db:
        db.execute("""INSERT INTO city_unit_profiles(
             unit_code,display_name,dwelling_code,tier,unit_costs,policy_id)
             VALUES(%s,'Unité sans puissance','recruit_t1',1,%s,'TEST-UNRATED')""",
             (extra,Jsonb({k:0 for k in (
                 "gold","wood","ore","crystal","gems","sulfur","mercury"
             )})))
        db.execute("INSERT INTO hero_army_units(hero_id,unit_code,quantity) "
                   "VALUES(%s,%s,2)",(hero,extra))
    root=f"/api/v1/me/cities/{city['city']}"
    h=headers(city["username"])
    saved=client.post(f"{root}/heroes/{hero}/formation",headers=h,json={
        "order_id":str(uuid4()),
        "positions":[{"position":1,"unit_code":unit,"quantity":8},
                     {"position":7,"unit_code":extra,"quantity":2}],
    })
    assert saved.status_code==201,saved.text
    launched=client.post(root+"/missions",headers=h,json={
        "mission_id":str(uuid4()),"hero_id":str(hero),
        "encounter_id":str(encounter),"unit_code":unit,
    })
    assert launched.status_code==409,launched.text
    assert "qualified" in launched.text
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT status FROM city_heroes WHERE hero_id=%s",
                          (hero,)).fetchone()[0]=="idle"
        assert db.execute("SELECT count(*) FROM pve_missions WHERE hero_id=%s",
                          (hero,)).fetchone()[0]==0



def _enable_v102_lab(world, hero):
    """Explicit, reversible-for-FUTURE-missions opt-in on an isolated test world."""
    with psycopg.connect(URL) as db:
        db.execute("""UPDATE pve_travel_policies SET policy_id='LAB-TEST-TRAVEL-V102'
                      WHERE world_id=%s""",(world,))
        db.execute("""INSERT INTO pve_lab_casualty_policies(
                        world_id,enabled,source_ref)
                      VALUES(%s,true,'TEST-LAB-EXPLICIT-V102')""",(world,))
        db.execute("""INSERT INTO hero_basic_combat_profiles(
                        hero_id,attack_points,defense_points,
                        attack_per_unit,defense_per_unit,source_ref)
                      VALUES(%s,0,0,0,0,'TEST-ZERO-HERO-V102')""",(hero,))


def test_v102_applies_only_opted_in_attacker_deaths_once_under_transaction(city):
    hero,unit,encounter=_setup(city)
    _enable_v102_lab(city["world"],hero)
    with psycopg.connect(URL) as db:
        db.execute("""UPDATE city_unit_profiles SET combat_weapon_code='I',
                         combat_weapon_source_ref='TEST-WEAPON-V102'
                      WHERE unit_code=%s""",(unit,))
        db.execute("""UPDATE region_encounters SET combat_weapon_code='I',
                         combat_weapon_source_ref='TEST-WEAPON-V102'
                      WHERE encounter_id=%s""",(encounter,))
    root=f"/api/v1/me/cities/{city['city']}"
    own=headers(city["username"]);other=headers(city["enemyname"])
    mid=str(uuid4())
    response=client.post(root+"/missions",headers=own,json={
        "mission_id":mid,"hero_id":str(hero),
        "encounter_id":str(encounter),"unit_code":unit,
    })
    assert response.status_code==201,response.text
    with psycopg.connect(URL) as db:
        frozen=db.execute(
            "SELECT attacker_settlement_snapshot FROM pve_missions WHERE mission_id=%s",
            (mid,),
        ).fetchone()[0]
        assert frozen["enabled"] is True
        assert frozen["zero_hero_profile"] is True
        assert frozen["source_ref"]=="TEST-LAB-EXPLICIT-V102"
        # Subsequent policy or qualified hero changes never revise this order.
        db.execute("UPDATE pve_lab_casualty_policies SET enabled=false WHERE world_id=%s",
                   (city["world"],))
        db.execute("UPDATE hero_basic_combat_profiles SET attack_points=100 "
                   "WHERE hero_id=%s",(hero,))
        db.execute("UPDATE region_encounters SET unit_count=500,unit_power=100 "
                   "WHERE encounter_id=%s",(encounter,))
    arrival=datetime.fromisoformat(response.json()["arrival_due_at"])
    with psycopg.connect(URL,autocommit=True) as db:
        assert advance_pve_missions(db,now_at=arrival)==[
            {"mission_id":mid,"phase":"arrived"}]
        assert advance_pve_missions(db,now_at=arrival)==[]
    report=client.get(root+"/missions/"+mid+"/report",headers=own)
    assert report.status_code==200,report.text
    assert client.get(root+"/missions/"+mid+"/report",headers=other).status_code==404
    body=report.json()
    settlement=body["duel_report"]["settlement"]
    assert settlement["status"]=="applied"
    assert settlement["total_deaths"]>0
    assert settlement["total_deaths"]<8
    assert body["duel_report"]["no_losses_applied"] is False
    assert body["duel_report"]["no_rewards"] is True
    assert body["duel_report"]["line_outcome"]["experience_awarded"] is False
    with psycopg.connect(URL) as db:
        stock=db.execute("SELECT quantity FROM hero_army_units "
                         "WHERE hero_id=%s AND unit_code=%s",(hero,unit)).fetchone()[0]
        assert stock==8-settlement["total_deaths"]
        assert db.execute("SELECT resolved,unit_count FROM region_encounters "
                          "WHERE encounter_id=%s",(encounter,)).fetchone()==(False,500)
        ledger=db.execute(
            "SELECT total_deaths,entries FROM pve_lab_casualty_settlements "
            "WHERE mission_id=%s",(mid,),
        ).fetchone()
        assert ledger[0]==settlement["total_deaths"]
        assert ledger[1]==settlement["entries"]
        assert db.execute("SELECT count(*) FROM hero_formation_slots "
                          "WHERE hero_id=%s",(hero,)).fetchone()[0]==0
    # Reconnect and return: no second debit or ledger entry.
    returning=datetime.fromisoformat(body["return_due_at"])
    with psycopg.connect(URL,autocommit=True) as db:
        assert advance_pve_missions(db,now_at=returning)==[
            {"mission_id":mid,"phase":"returned"}]
        assert advance_pve_missions(db,now_at=returning)==[]
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT quantity FROM hero_army_units "
                          "WHERE hero_id=%s AND unit_code=%s",(hero,unit)).fetchone()[0]==stock
        assert db.execute("SELECT count(*) FROM pve_lab_casualty_settlements "
                          "WHERE mission_id=%s",(mid,)).fetchone()[0]==1
        assert db.execute("SELECT status FROM city_heroes WHERE hero_id=%s",
                          (hero,)).fetchone()[0]=="idle"


def test_v102_qualified_policy_without_zero_hero_remains_non_mutating(city):
    hero,unit,encounter=_setup(city)
    with psycopg.connect(URL) as db:
        db.execute("UPDATE pve_travel_policies SET policy_id='LAB-TEST-V102' "
                   "WHERE world_id=%s",(city["world"],))
        db.execute("""INSERT INTO pve_lab_casualty_policies(
                        world_id,enabled,source_ref)
                      VALUES(%s,true,'TEST-LAB-V102')""",(city["world"],))
    h=headers(city["username"])
    root=f"/api/v1/me/cities/{city['city']}"
    mid=str(uuid4())
    created=client.post(root+"/missions",headers=h,json={
        "mission_id":mid,"hero_id":str(hero),"encounter_id":str(encounter),
        "unit_code":unit,
    })
    assert created.status_code==201,created.text
    with psycopg.connect(URL,autocommit=True) as db:
        advance_pve_missions(db,now_at=datetime.fromisoformat(
            created.json()["arrival_due_at"]))
    report=client.get(root+"/missions/"+mid+"/report",headers=h).json()
    assert report["duel_report"]["settlement"]["status"]=="zero_hero_profile_not_qualified"
    assert report["duel_report"]["no_losses_applied"] is True
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT quantity FROM hero_army_units "
                          "WHERE hero_id=%s AND unit_code=%s",(hero,unit)).fetchone()[0]==8
        assert db.execute("SELECT count(*) FROM pve_lab_casualty_settlements "
                          "WHERE mission_id=%s",(mid,)).fetchone()[0]==0


def test_v102_policy_cannot_enable_non_lab_world(city):
    hero,unit,encounter=_setup(city)
    import pytest
    with psycopg.connect(URL) as db:
        with pytest.raises(psycopg.errors.CheckViolation):
            db.execute("""INSERT INTO pve_lab_casualty_policies(
                            world_id,enabled,source_ref)
                          VALUES(%s,true,'INVALID-TEST-WORLD')""",(city["world"],))
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT count(*) FROM pve_lab_casualty_policies "
                          "WHERE world_id=%s",(city["world"],)).fetchone()[0]==0


def test_v102_cannot_edit_or_delete_committed_ledger(city):
    hero,unit,encounter=_setup(city)
    _enable_v102_lab(city["world"],hero)
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_unit_profiles SET combat_weapon_code='I',"
                   "combat_weapon_source_ref='TEST-V102' WHERE unit_code=%s",(unit,))
        db.execute("UPDATE region_encounters SET combat_weapon_code='I',"
                   "combat_weapon_source_ref='TEST-V102' WHERE encounter_id=%s",(encounter,))
    root=f"/api/v1/me/cities/{city['city']}"
    mid=str(uuid4())
    created=client.post(root+"/missions",headers=headers(city["username"]),json={
        "mission_id":mid,"hero_id":str(hero),"encounter_id":str(encounter),
        "unit_code":unit,
    })
    assert created.status_code==201,created.text
    with psycopg.connect(URL,autocommit=True) as db:
        advance_pve_missions(db,now_at=datetime.fromisoformat(
            created.json()["arrival_due_at"]))
    import pytest
    for query in (
        "UPDATE pve_lab_casualty_settlements SET total_deaths=0 WHERE mission_id=%s",
        "DELETE FROM pve_lab_casualty_settlements WHERE mission_id=%s",
        "UPDATE pve_missions SET attacker_settlement_snapshot=NULL WHERE mission_id=%s",
    ):
        with psycopg.connect(URL) as db:
            with pytest.raises(psycopg.errors.CheckViolation):
                db.execute(query,(mid,))



def test_v102_rolls_back_arrival_on_tampered_assigned_stock(city):
    """No partial ledger, report, or arrived event when troops were altered."""
    import pytest
    hero,unit,encounter=_setup(city)
    _enable_v102_lab(city["world"],hero)
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_unit_profiles SET combat_weapon_code='I', "
                   "combat_weapon_source_ref='TEST-ROLLBACK-V102' "
                   "WHERE unit_code=%s",(unit,))
        db.execute("UPDATE region_encounters SET combat_weapon_code='I', "
                   "combat_weapon_source_ref='TEST-ROLLBACK-V102' "
                   "WHERE encounter_id=%s",(encounter,))
    root=f"/api/v1/me/cities/{city['city']}"
    mid=str(uuid4())
    created=client.post(root+"/missions",headers=headers(city["username"]),json={
        "mission_id":mid,"hero_id":str(hero),"encounter_id":str(encounter),
        "unit_code":unit,
    })
    assert created.status_code==201,created.text
    arrival=datetime.fromisoformat(created.json()["arrival_due_at"])
    with psycopg.connect(URL) as db:
        db.execute("UPDATE hero_army_units SET quantity=7 "
                   "WHERE hero_id=%s AND unit_code=%s",(hero,unit))
    with psycopg.connect(URL,autocommit=True) as db:
        with pytest.raises(ValueError,match="stock differs"):
            advance_pve_missions(db,now_at=arrival)
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT stage,duel_report FROM pve_missions "
                          "WHERE mission_id=%s",(mid,)).fetchone()==("outbound",None)
        assert db.execute("SELECT count(*) FROM pve_lab_casualty_settlements "
                          "WHERE mission_id=%s",(mid,)).fetchone()[0]==0
        assert db.execute("SELECT phase FROM pve_mission_events "
                          "WHERE mission_id=%s",(mid,)).fetchall()==[("departed",)]
        # Restore the exact inventory to permit the previously frozen order.
        db.execute("UPDATE hero_army_units SET quantity=8 "
                   "WHERE hero_id=%s AND unit_code=%s",(hero,unit))
    with psycopg.connect(URL,autocommit=True) as db:
        assert advance_pve_missions(db,now_at=arrival)==[
            {"mission_id":mid,"phase":"arrived"}]
        assert advance_pve_missions(db,now_at=arrival)==[]
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT count(*) FROM pve_lab_casualty_settlements "
                          "WHERE mission_id=%s",(mid,)).fetchone()[0]==1
