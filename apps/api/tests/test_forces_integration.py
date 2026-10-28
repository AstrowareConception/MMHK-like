"""First real city garrison and heroes: atomic costs, idempotency and isolation."""
from uuid import uuid4
from datetime import datetime, timezone

import psycopg
from psycopg.types.json import Jsonb
import pytest

from test_construction_integration import city, headers, client, URL
from mmhk_api.forces import recruit_units,hire_hero,city_forces,RecruitmentConflict,RecruitmentNotFound


def fixture_forces(city):
    unit="sentry_"+uuid4().hex[:12]
    dwelling="dwelling_"+uuid4().hex[:10]
    zero={kind:0 for kind in ("gold","wood","ore","crystal","gems","sulfur","mercury")}
    costs={**zero,"gold":3,"wood":1}
    with psycopg.connect(URL) as db:
        owner=db.execute("SELECT owner_account_id FROM cities WHERE city_id=%s",
            (city["city"],)).fetchone()[0]
        # In a sandbox fixture, construct two active buildings without changing
        # external city policies or creating fabricated historic queues.
        for building in (dwelling,"tavern"):
            db.execute("""INSERT INTO urban_city_buildings
                (city_id,building_code,level,completed_at)
                VALUES(%s,%s,1,clock_timestamp())""",(city["city"],building))
        db.execute("""INSERT INTO city_unit_profiles
          (unit_code,display_name,dwelling_code,tier,unit_costs,policy_id)
          VALUES(%s,'Sentinelles témoins',%s,1,%s,'UNIT-TEST')""",
          (unit,dwelling,Jsonb(costs)))
        db.execute("""INSERT INTO city_recruit_pools(city_id,unit_code,available)
                     VALUES(%s,%s,10)""",(city["city"],unit))
        offer=uuid4()
        db.execute("""INSERT INTO city_hero_offers
                    (offer_id,city_id,hero_name,archetype,gold_cost,policy_id)
                    VALUES(%s,%s,'Écuyer témoin','might',12,'UNIT-TEST')""",
            (offer,city["city"]))
    return owner,unit,offer


def test_recruitment_atomic_payment_idempotency_and_no_foreign_access(city):
    owner,unit,offer=fixture_forces(city)
    h=headers(city["username"])
    eh=headers(city["enemyname"])
    endpoint=f"/api/v1/me/cities/{city['city']}"
    assert client.get(endpoint+"/forces").status_code==401
    own=client.get(endpoint+"/forces",headers=h)
    assert own.status_code==200
    assert own.json()["recruitment"][0]["unit_code"]==unit
    assert own.json()["recruitment"][0]["unlocked"] is True
    assert client.get(endpoint+"/forces",headers=eh).status_code==404
    original=client.get(endpoint,headers=h).json()["stocks"]
    order=uuid4()
    payload={"order_id":str(order),"unit_code":unit,"quantity":4}
    response=client.post(endpoint+"/recruit",headers=h,json=payload)
    assert response.status_code==201,response.text
    receipt=response.json()
    assert receipt["applied_costs"]["gold"]==12
    assert receipt["applied_costs"]["wood"]==4
    assert receipt["replayed"] is False
    assert client.post(endpoint+"/recruit",headers=h,json=payload).status_code==200
    bad=client.post(endpoint+"/recruit",headers=h,json={**payload,"quantity":5})
    assert bad.status_code==409
    denied=client.post(endpoint+"/recruit",headers=eh,json={
        "order_id":str(uuid4()),"unit_code":unit,"quantity":1})
    assert denied.status_code==404
    assert client.post(endpoint+"/recruit",headers=h,json={
        "order_id":str(uuid4()),"unit_code":unit,"quantity":1001}).status_code==422
    again=client.get(endpoint+"/forces",headers=h).json()
    assert again["garrison"]==[{"unit_code":unit,"name":"Sentinelles témoins",
                                 "quantity":4,"tier":1}]
    assert again["recruitment"][0]["available"]==6
    final=client.get(endpoint,headers=h).json()["stocks"]
    assert final["gold"]==original["gold"]-12
    assert final["wood"]==original["wood"]-4


def test_hero_hire_requires_tavern_and_consumes_one_offer(city):
    owner,unit,offer=fixture_forces(city)
    h=headers(city["username"])
    eh=headers(city["enemyname"])
    endpoint=f"/api/v1/me/cities/{city['city']}"
    original=client.get(endpoint,headers=h).json()["stocks"]["gold"]
    initial=client.get(endpoint+"/forces",headers=h).json()
    assert initial["tavern_unlocked"] is True
    assert len(initial["hero_offers"])==1
    receipt_id=str(uuid4())
    request={"order_id":receipt_id,"offer_id":str(offer)}
    response=client.post(endpoint+"/heroes/hire",headers=h,json=request)
    assert response.status_code==201,response.text
    first=response.json()
    assert first["gold_paid"]==12
    assert client.post(endpoint+"/heroes/hire",headers=h,json=request).json()["hero_id"]==first["hero_id"]
    assert client.post(endpoint+"/heroes/hire",headers=h,json={
        "order_id":str(uuid4()),"offer_id":str(offer)}).status_code==409
    assert client.post(endpoint+"/heroes/hire",headers=eh,json={
        "order_id":str(uuid4()),"offer_id":str(offer)}).status_code==404
    current=client.get(endpoint+"/forces",headers=h).json()
    assert current["hero_offers"]==[]
    assert current["heroes"][0]["name"]=="Écuyer témoin"
    assert current["heroes"][0]["status"]=="idle"
    assert client.get(endpoint,headers=h).json()["stocks"]["gold"]==original-12


def test_unbuilt_dwelling_cannot_recruit(city):
    owner,unit,offer=fixture_forces(city)
    with psycopg.connect(URL) as db:
        db.execute("UPDATE urban_city_buildings SET operator_disabled=true WHERE city_id=%s AND building_code LIKE 'dwelling_%%'",(city["city"],))
    h=headers(city["username"])
    p={"order_id":str(uuid4()),"unit_code":unit,"quantity":1}
    assert client.post(f"/api/v1/me/cities/{city['city']}/recruit",headers=h,json=p).status_code==409
    forces=client.get(f"/api/v1/me/cities/{city['city']}/forces",headers=h).json()
    assert forces["recruitment"][0]["unlocked"] is False


def test_unit_transfers_are_atomic_reversible_idempotent_and_private(city):
    owner,unit,offer=fixture_forces(city)
    h=headers(city["username"])
    eh=headers(city["enemyname"])
    endpoint=f"/api/v1/me/cities/{city['city']}"
    p={"order_id":str(uuid4()),"unit_code":unit,"quantity":5}
    assert client.post(endpoint+"/recruit",headers=h,json=p).status_code==201
    hero_request={"order_id":str(uuid4()),"offer_id":str(offer)}
    hired=client.post(endpoint+"/heroes/hire",headers=h,json=hero_request)
    assert hired.status_code==201,hired.text
    hero_id=hired.json()["hero_id"]
    move={"order_id":str(uuid4()),"hero_id":hero_id,"unit_code":unit,
          "quantity":3,"direction":"to_hero"}
    first=client.post(endpoint+"/forces/transfer",headers=h,json=move)
    assert first.status_code==201,first.text
    assert first.json()["replayed"] is False
    second=client.post(endpoint+"/forces/transfer",headers=h,json=move)
    assert second.status_code==200
    assert second.json()["replayed"] is True
    forces=client.get(endpoint+"/forces",headers=h).json()
    assert forces["garrison"][0]["quantity"]==2
    assert forces["hero_armies"][0]["hero_id"]==hero_id
    assert forces["hero_armies"][0]["quantity"]==3
    assert client.post(endpoint+"/forces/transfer",headers=eh,json={
        **move,"order_id":str(uuid4())}).status_code==404
    assert client.post(endpoint+"/forces/transfer",headers=h,json={
        **move,"order_id":str(uuid4()),"quantity":4}).status_code==409
    back={"order_id":str(uuid4()),"hero_id":hero_id,"unit_code":unit,
          "quantity":2,"direction":"to_garrison"}
    assert client.post(endpoint+"/forces/transfer",headers=h,json=back).status_code==201
    current=client.get(endpoint+"/forces",headers=h).json()
    assert current["garrison"][0]["quantity"]==4
    assert current["hero_armies"][0]["quantity"]==1
    assert current["garrison"][0]["quantity"]+current["hero_armies"][0]["quantity"]==5
