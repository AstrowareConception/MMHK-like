"""One-stack Jactari PvE lab can inspect regional monsters without state mutations."""
from uuid import uuid4
import psycopg
from psycopg.types.json import Jsonb
from test_construction_integration import city,headers,client,URL


def test_regional_encounter_visible_and_duel_preview_is_read_only(city):
    owned=headers(city["username"])
    foreign=headers(city["enemyname"])
    region=f"/api/v1/me/cities/{city['city']}/region"
    with psycopg.connect(URL) as db:
        owner=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",
                         (city["city"],)).fetchone()[0]
        hero=uuid4()
        code="lab_unit_"+uuid4().hex[:12]
        db.execute("""INSERT INTO city_unit_profiles
          (unit_code,display_name,dwelling_code,tier,unit_costs,policy_id,lab_duel_power)
          VALUES(%s,'Milice témoin','recruit_t1',1,%s,'LAB-COMBAT','2.000')""",
          (code,Jsonb({k:0 for k in ("gold","wood","ore","crystal","gems","sulfur","mercury")})))
        db.execute("""INSERT INTO city_heroes(hero_id,city_id,owner_account_id,name,archetype)
          VALUES(%s,%s,%s,'Combattant témoin','might')""",(hero,city["city"],owner))
        db.execute("""INSERT INTO hero_army_units(hero_id,unit_code,quantity)
          VALUES(%s,%s,5)""",(hero,code))
        eid=uuid4()
        db.execute("""INSERT INTO region_encounters
          (encounter_id,city_id,cell_i,cell_j,name,unit_code,unit_count,unit_power,source_ref)
          VALUES(%s,%s,1,3,'Loups témoins','wolves',4,1.0,'TEST-PVE')""",
          (eid,city["city"]))
    assert client.get(region,headers=owned).json()["encounters"][0]["name"]=="Loups témoins"
    assert client.get(region,headers=foreign).status_code==404
    endpoint=f"/api/v1/me/cities/{city['city']}/encounters/{eid}/preview"
    request={"hero_id":str(hero),"unit_code":code}
    assert client.post(endpoint,json=request).status_code==401
    assert client.post(endpoint,headers=foreign,json=request).status_code==404
    result=client.post(endpoint,headers=owned,json=request)
    assert result.status_code==200,result.text
    report=result.json()
    assert report["scope"]=="LAB-SINGLE-STACK"
    assert report["preview_only"] is True
    assert report["outcome"]["basePower"]["attacker"]==10
    assert report["outcome"]["basePower"]["defender"]==4
    # Same state after repeated tests; this is not a game battle yet.
    assert client.post(endpoint,headers=owned,json=request).json()["outcome"]==report["outcome"]
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT quantity FROM hero_army_units WHERE hero_id=%s AND unit_code=%s",
                          (hero,code)).fetchone()[0]==5
        assert db.execute("SELECT unit_count,resolved FROM region_encounters WHERE encounter_id=%s",
                          (eid,)).fetchone()==(4,False)
    assert client.post(endpoint,headers=owned,json={
      "hero_id":str(uuid4()),"unit_code":code}).status_code==404
