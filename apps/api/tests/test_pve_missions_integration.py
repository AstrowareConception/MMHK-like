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
    assert underway["duel_report"]["scope"]=="LAB-SINGLE-STACK"
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
