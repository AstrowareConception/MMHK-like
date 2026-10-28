"""Seven-slot army preparation: no units created, lost or moved to other heroes."""
from uuid import uuid4
import psycopg
from psycopg.types.json import Jsonb
from test_construction_integration import city,client,headers,URL

def create_hero_army(city):
    with psycopg.connect(URL) as db:
        owner=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",
                         (city["city"],)).fetchone()[0]
        hero=uuid4()
        db.execute("""INSERT INTO city_heroes
            (hero_id,city_id,owner_account_id,name,archetype)
            VALUES(%s,%s,%s,'Capitaine de test','might')""",
            (hero,city["city"],owner))
        codes=[]
        for label,amount in (("militia",6),("archers",4)):
            code=label+"_"+uuid4().hex[:12]
            db.execute("""INSERT INTO city_unit_profiles
             (unit_code,display_name,dwelling_code,tier,unit_costs,policy_id)
             VALUES(%s,%s,'recruit_t1',1,%s,'TEST-7-SLOT')""",
             (code,label,Jsonb({k:0 for k in
               ("gold","wood","ore","crystal","gems","sulfur","mercury")})))
            db.execute("INSERT INTO hero_army_units(hero_id,unit_code,quantity) VALUES(%s,%s,%s)",
                       (hero,code,amount))
            codes.append(code)
    return hero,codes

def test_split_merge_reorder_and_slot_bounds(city):
    hero,(militia,archers)=create_hero_army(city)
    h=headers(city["username"]);enemy=headers(city["enemyname"])
    url=f"/api/v1/me/cities/{city['city']}/heroes/{hero}/formation"
    assert client.get(url).status_code==401
    assert client.get(url,headers=enemy).status_code==404
    initial=client.get(url,headers=h).json()
    assert initial["saved"] is False
    assert initial["slots_count"]==7
    assert sum(x["quantity"] for x in initial["positions"])==10
    slots=[{"position":1,"unit_code":militia,"quantity":2},
           {"position":2,"unit_code":archers,"quantity":4},
           {"position":6,"unit_code":militia,"quantity":4}]
    order=str(uuid4())
    response=client.post(url,headers=h,json={"order_id":order,"positions":slots})
    assert response.status_code==201,response.text
    assert client.post(url,headers=h,json={"order_id":order,"positions":slots}).status_code==200
    assert client.post(url,headers=h,json={"order_id":order,
       "positions":slots[:1]}).status_code==409
    own=client.get(url,headers=h).json()
    assert own["saved"] is True
    assert [p["position"] for p in own["positions"]]==[1,2,6]
    assert [p["jactari_index"] for p in own["positions"]]==[2,3,7]
    # Reorder the stacks without creating troops.
    shifted=[{"position":4,"unit_code":militia,"quantity":6},
             {"position":7,"unit_code":archers,"quantity":4}]
    assert client.post(url,headers=h,json={
        "order_id":str(uuid4()),"positions":shifted}).status_code==201
    assert [p["position"] for p in client.get(url,headers=h).json()["positions"]]==[4,7]
    for invalid in [
        [dict(position=8,unit_code=militia,quantity=6)],
        [dict(position=i,unit_code=militia,quantity=1) for i in range(1,9)],
        [dict(position=1,unit_code=militia,quantity=6),
         dict(position=1,unit_code=archers,quantity=4)],
        [dict(position=1,unit_code=militia,quantity=7),
         dict(position=2,unit_code=archers,quantity=4)],
    ]:
        denied=client.post(url,headers=h,json={
            "order_id":str(uuid4()),"positions":invalid})
        assert denied.status_code in (409,422),denied.text
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT sum(quantity) FROM hero_army_units WHERE hero_id=%s",
                          (hero,)).fetchone()[0]==10
        assert db.execute("SELECT sum(quantity) FROM hero_formation_slots WHERE hero_id=%s",
                          (hero,)).fetchone()[0]==10

def test_hero_travel_locks_army_and_transfer_invalidates_saved_layout(city):
    hero,(militia,archers)=create_hero_army(city)
    h=headers(city["username"])
    base=f"/api/v1/me/cities/{city['city']}"
    url=base+f"/heroes/{hero}/formation"
    slots=[{"position":1,"unit_code":militia,"quantity":6},
           {"position":2,"unit_code":archers,"quantity":4}]
    order=str(uuid4())
    assert client.post(url,headers=h,json={"order_id":order,"positions":slots}).status_code==201
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_heroes SET status='on_mission' WHERE hero_id=%s",(hero,))
    assert client.post(url,headers=h,json={
        "order_id":str(uuid4()),"positions":slots}).status_code==409
    assert client.post(url,headers=h,json={
        "order_id":order,"positions":slots}).status_code==200
    with psycopg.connect(URL) as db:
        db.execute("UPDATE city_heroes SET status='idle' WHERE hero_id=%s",(hero,))
    move=client.post(base+"/forces/transfer",headers=h,json={
        "order_id":str(uuid4()),"hero_id":str(hero),
        "unit_code":militia,"quantity":2,"direction":"to_garrison"})
    assert move.status_code==201,move.text
    after=client.get(url,headers=h).json()
    assert after["saved"] is False
    assert sum(x["quantity"] for x in after["available_units"])==8
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT count(*) FROM hero_formation_slots WHERE hero_id=%s",
                          (hero,)).fetchone()[0]==0
