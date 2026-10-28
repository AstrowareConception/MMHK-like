"""Artifact inventory ownership, conservation, slot and budget tests."""
from uuid import uuid4
import psycopg
from psycopg.types.json import Jsonb
from test_construction_integration import city, headers, client, URL


def test_artifacts_equip_transfer_and_reserve_are_atomic(city):
    own=headers(city["username"])
    enemy=headers(city["enemyname"])
    endpoint=f"/api/v1/me/cities/{city['city']}/artifacts"
    with psycopg.connect(URL) as db:
        owner=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",
                         (city["city"],)).fetchone()[0]
        a,b=uuid4(),uuid4()
        for hid,name in [(a,"Veilleur témoin"),(b,"Mage témoin")]:
            db.execute("""INSERT INTO city_heroes
                (hero_id,city_id,owner_account_id,name,archetype)
                VALUES(%s,%s,%s,%s,'might')""",(hid,city["city"],owner,name))
        code="amulet_"+uuid4().hex[:12]
        db.execute("""INSERT INTO artifact_profiles
          (artifact_code,name,slot,required_level,effects,policy_id)
          VALUES(%s,'Amulette témoin','neck',1,%s,'TEST-ART')""",
          (code,Jsonb({"description":"bonus non simulé"})))
        aid=uuid4()
        db.execute("""INSERT INTO city_artifacts
          (artifact_id,city_id,artifact_code,location,hero_id)
          VALUES(%s,%s,%s,'bag',%s)""",(aid,city["city"],code,a))
    assert client.get(endpoint).status_code==401
    assert client.get(endpoint,headers=enemy).status_code==404
    first=client.get(endpoint,headers=own).json()
    assert first["artifacts"][0]["hero_id"]==str(a)
    assert first["artifacts"][0]["location"]=="bag"
    assert first["effects_applied_to_combat"] is False
    def move(op,target=None,key=None):
        return client.post(endpoint+"/move",headers=own,json={
            "order_id":str(key or uuid4()),"artifact_id":str(aid),
            "operation":op,"target_hero_id":str(target) if target else None})
    key=uuid4()
    assert move("equip",key=key).status_code==201
    assert move("equip",key=key).status_code==200
    assert move("equip").status_code==409
    state=client.get(endpoint,headers=own).json()["artifacts"][0]
    assert state["location"]=="equipped" and state["equipped_slot"]=="neck"
    assert move("to_hero",target=b).status_code==201
    assert (x:=client.get(endpoint,headers=own).json()["artifacts"][0])["hero_id"]==str(b)
    assert x["location"]=="bag" and x["equipped_slot"] is None
    assert move("to_reserve").status_code==201
    assert (x:=client.get(endpoint,headers=own).json()["artifacts"][0])["hero_id"] is None
    assert x["location"]=="reserve"
    assert move("to_bag",target=a).status_code==201
    assert move("unequip").status_code==409
    assert move("equip").status_code==201
    assert len(client.get(endpoint,headers=own).json()["artifacts"])==1
    assert client.post(endpoint+"/move",headers=enemy,json={
       "order_id":str(uuid4()),"artifact_id":str(aid),"operation":"unequip"}).status_code==404


def test_artifact_slot_and_equipment_level_budget(city):
    own=headers(city["username"])
    endpoint=f"/api/v1/me/cities/{city['city']}/artifacts"
    with psycopg.connect(URL) as db:
        owner=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",
                         (city["city"],)).fetchone()[0]
        hero=uuid4()
        db.execute("""INSERT INTO city_heroes(hero_id,city_id,owner_account_id,name,archetype)
                      VALUES(%s,%s,%s,'Témoin','might')""",(hero,city["city"],owner))
        ids=[]
        for n,slot in enumerate(("ring","ring","weapon")):
            code="test_item_"+uuid4().hex[:12]
            db.execute("""INSERT INTO artifact_profiles
                      (artifact_code,name,slot,required_level,effects,policy_id)
                      VALUES(%s,%s,%s,1,'{}'::jsonb,'TEST-ART')""",
                      (code,"Objet "+str(n+1),slot))
            aid=uuid4()
            ids.append(aid)
            db.execute("""INSERT INTO city_artifacts(artifact_id,city_id,artifact_code,location,hero_id)
                          VALUES(%s,%s,%s,'bag',%s)""",(aid,city["city"],code,hero))
    def equip(aid):
        return client.post(endpoint+"/move",headers=own,json={
            "order_id":str(uuid4()),"artifact_id":str(aid),"operation":"equip"})
    assert equip(ids[0]).status_code==201
    assert equip(ids[1]).status_code==409 # ring slot occupied
    assert equip(ids[2]).status_code==409 # total level budget 1
    items=client.get(endpoint,headers=own).json()["artifacts"]
    assert sum(i["location"]=="equipped" for i in items)==1
    assert sum(i["location"]=="bag" for i in items)==2
