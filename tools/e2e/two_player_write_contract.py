"""Real API cross-account write denials in the shared local MMHK world.

Run via docker compose exec -T api python -c with a JSON fixture on stdin.
The caller never prints account credentials, bearer tokens or payloads.
No test-only HTTP route, no production seed. This script does not perform
any authorized game mutation; even the malformed cross-identity writes
are fully schema-valid and must be hidden by HTTP 404.
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from uuid import uuid4

from mmhk_api.db import connect

d=json.load(sys.stdin)
base="http://127.0.0.1:8000"

def uid():
    return str(uuid4())

def request(path,token=None,body=None):
    data=json.dumps(body).encode("utf-8") if body is not None else None
    headers={"Content-Type":"application/json"}
    if token:
        headers["Authorization"]="Bearer "+token
    req=urllib.request.Request(
        base+path,data=data,headers=headers,
        method="POST" if body is not None else "GET"
    )
    try:
        with urllib.request.urlopen(req,timeout=12) as response:
            raw=response.read()
            return response.status, (
                json.loads(raw) if raw else None
            ),response.headers
    except urllib.error.HTTPError as error:
        return error.code,None,error.headers

def signin(name,password):
    status,data,_=request("/api/v1/sessions",body={
        "username":name,"password":password
    })
    assert status==200 and data and data.get("access_token"),"Login failed"
    return data["access_token"]

def city_snapshot(city_id):
    """Snapshot the second player's actual resource and object balances."""
    with connect() as db:
        stocks=db.execute(
            "SELECT resource,amount FROM city_stocks WHERE city_id=%s ORDER BY resource",
            (city_id,)
        ).fetchall()
        arts=db.execute(
            """SELECT artifact_id,location,hero_id,equipped_slot
               FROM city_artifacts WHERE city_id=%s ORDER BY artifact_id""",
            (city_id,)
        ).fetchall()
        heroes=db.execute(
            """SELECT hero_id,owner_account_id,name,level,experience
               FROM city_heroes WHERE city_id=%s ORDER BY hero_id""",
            (city_id,)
        ).fetchall()
        return {
            "stocks":tuple(stocks),"artifacts":tuple(arts),"heroes":tuple(heroes)
        }

a=signin(d["a_username"],d["a_password"])
b=signin(d["b_username"],d["b_password"])
assert a!=b,"Two users must have independent access tokens"

# No changes to the legitimate second player's resources, owned artifacts or
# hero roster are permitted. This city has no background production clock.
before=city_snapshot(d["b_city"])
checks=0
cross_target=0
for actor,foreign,foreign_hero,foreign_art,own in (
    (a,d["b_city"],d["b_hero"],d["b_artifact"],d["a_city"]),
    (b,d["a_city"],d["a_hero"],d["a_artifact"],d["b_city"])
):
    city="/api/v1/me/cities/"+foreign
    offer=uid()
    program=uid()
    encounter=uid()
    operations=[
        ("construction",city+"/construction",{
            "order_id":uid(),"building_code":"village_hall","mode":"normal"
        }),
        ("merchant exchange",city+"/market",{
            "order_id":uid(),"pay_resource":"wood","receive_resource":"ore",
            "pay_amount":1,"expected_policy_id":"QA-DENIED-CONTRACT",
            "expected_receive_amount":1,"expected_numerator":1,
            "expected_denominator":1
        }),
        ("publish market offer",city+"/market/offers",{
            "order_id":uid(),"resource":"wood","quantity":1,
            "price_resource":"gold","price_amount":1,"duration_seconds":60
        }),
        ("buy market offer",city+"/market/offers/"+offer+"/buy",{
            "order_id":uid(),"expected_resource":"wood",
            "expected_quantity":1,"expected_price_resource":"gold",
            "expected_price_amount":1
        }),
        ("withdraw market offer",city+"/market/offers/"+offer+"/withdraw",{
            "order_id":uid()
        }),
        ("send caravan",city+"/caravans",{
            "shipment_id":uid(),"destination_city_id":own,
            "cargo":{"wood":1},"expected_policy_id":"QA-DENIED-CONTRACT"
        }),
        ("schedule caravan",city+"/caravans/programs",{
            "program_id":uid(),"destination_city_id":own,
            "cargo_template":{"wood":1},"expected_policy_id":"QA-DENIED-CONTRACT",
            "quantity_mode":"exact","shipments_total":2,"wait_seconds":60
        }),
        ("stop caravan program",city+"/caravans/programs/"+program+"/stop",{
            "order_id":uid()
        }),
        ("recruit units",city+"/recruit",{
            "order_id":uid(),"unit_code":"militia","quantity":1
        }),
        ("hire hero",city+"/heroes/hire",{
            "order_id":uid(),"offer_id":uid()
        }),
        ("transfer soldiers",city+"/forces/transfer",{
            "order_id":uid(),"hero_id":foreign_hero,"unit_code":"militia",
            "quantity":1,"direction":"to_hero"
        }),
        ("move artifact",city+"/artifacts/move",{
            "order_id":uid(),"artifact_id":foreign_art,"operation":"to_reserve",
            "target_hero_id":None
        }),
        ("preview encounter",city+"/encounters/"+encounter+"/preview",{
            "hero_id":foreign_hero,"unit_code":"militia"
        }),
        ("dispatch mission",city+"/missions",{
            "mission_id":uid(),"hero_id":foreign_hero,
            "encounter_id":encounter,"unit_code":"militia"
        }),
        ("save hero formation",city+"/heroes/"+foreign_hero+"/formation",{
            "order_id":uid(),"positions":[]
        }),
        ("colonize using foreign city",
         "/api/v1/me/worlds/local-sandbox/colonization",{
            "order_id":uid(),"source_city_id":foreign,"hero_id":foreign_hero,
            "x":1,"y":1,"colony_name":"QA occupation interdite",
            "expected_policy_id":"QA-DENIED-CONTRACT"
        }),
        ("reclaim foreign colony",
         "/api/v1/me/worlds/local-sandbox/colonization/"+uid()+"/reclaim",{
            "refund_order_id":uid()
        }),
        # An owned city may not smuggle a foreign hero or artifact reference
        # in a well-formed request. This also tests indirect object IDs.
        ("foreign artifact from own city",
         "/api/v1/me/cities/"+own+"/artifacts/move",{
            "order_id":uid(),"artifact_id":foreign_art,"operation":"to_reserve",
            "target_hero_id":None
        }),
        ("foreign hero from own city",
         "/api/v1/me/cities/"+own+"/heroes/"+foreign_hero+"/formation",{
            "order_id":uid(),"positions":[]
        }),
        ("foreign unit recipient from own city",
         "/api/v1/me/cities/"+own+"/forces/transfer",{
            "order_id":uid(),"hero_id":foreign_hero,
            "unit_code":"militia","quantity":1,"direction":"to_hero"
        }),
        ("foreign caravan destination from own city",
         "/api/v1/me/cities/"+own+"/caravans",{
            "shipment_id":uid(),"destination_city_id":foreign,
            "cargo":{"wood":1},"expected_policy_id":"QA-DENIED-CONTRACT"
        })
    ]
    for label,path,body in operations:
        status,_,headers=request(path,token=actor,body=body)
        assert status==404,(label,status)
        assert "no-store" in headers.get("Cache-Control","").lower(),(
            "Missing private API no-store header",label
        )
        checks+=1
        if "from own city" in label:
            cross_target+=1

# Mutation controls: a successful 200/201 from an unauthorized request would
# be caught above. The independently seeded second player's stocks/objects and
# roster must also be byte-for-byte stable after all 42 attempts.
after=city_snapshot(d["b_city"])
assert after==before,"Unauthorized attempts changed foreign private state"
assert checks==42 and cross_target==8,(checks,cross_target)
print(json.dumps({
    "shared_world":True,"users":2,"foreign_write_denials":checks,
    "cross_target_denials":cross_target,"second_city_unchanged":True
}))
