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
        raw=error.read()
        return error.code,(json.loads(raw) if raw else None),error.headers

def signin(name,password):
    status,data,_=request("/api/v1/sessions",body={
        "username":name,"password":password
    })
    assert status==200 and data and data.get("access_token"),"Login failed"
    return data["access_token"]

# Snapshots deliberately cover BOTH owners and every principal order/ledger
# table. The parent E2E script pauses the disposable worker for the duration
# of this transaction so legitimate production ticks cannot change the baseline.
CITY_TABLES=(
    "cities","city_stocks","city_mines","city_mine_rates",
    "city_economy_clock","urban_city_buildings","city_recruit_pools",
    "city_garrison_units","city_hero_offers","city_heroes",
    "city_artifacts","hero_formation_slots","region_encounters"
)
JOURNAL_TABLES=(
    "urban_construction_orders","urban_construction_events",
    "unit_recruitment_orders","hero_hire_orders","hero_unit_transfer_orders",
    "artifact_transfer_orders","hero_formation_orders",
    "city_merchant_orders","marketplace_orders","marketplace_offers",
    "caravan_shipments","caravan_shipment_events","caravan_dispatch_programs",
    "caravan_program_stop_orders","pve_missions","pve_mission_events",
    "colonization_orders","colonization_order_events"
)

def rows_as_state(db,query,params=()):
    # Sort full row representations to detect value changes as well as new
    # inserts, without relying on an arbitrary PostgreSQL scan order.
    return tuple(sorted(repr(row) for row in db.execute(query,params).fetchall()))

def complete_snapshot():
    with connect() as db:
        cities={}
        for label,city_id in (("a",d["a_city"]),("b",d["b_city"])):
            rows={
                table:rows_as_state(db,
                    "SELECT * FROM "+table+" WHERE city_id=%s",(city_id,))
                for table in CITY_TABLES
            }
            rows["hero_army_units"]=rows_as_state(db,
                """SELECT a.* FROM hero_army_units a
                   JOIN city_heroes h ON h.hero_id=a.hero_id
                   WHERE h.city_id=%s""",(city_id,))
            cities[label]=rows
        journals={
            table:rows_as_state(db,"SELECT * FROM "+table)
            for table in JOURNAL_TABLES
        }
    return {"cities":cities,"journals":journals}

def accepted_replay_seed(token):
    """Create ONLY on the disposable second account, prior to snapshots.

    Both are valid authenticated operations, not fake database inserts.
    """
    operations=(
        ("artifact","/api/v1/me/cities/"+d["b_city"]+"/artifacts/move",{
            "order_id":uid(),"artifact_id":d["b_artifact"],
            "operation":"to_reserve","target_hero_id":None
        }),
        ("formation","/api/v1/me/cities/"+d["b_city"]+
            "/heroes/"+d["b_hero"]+"/formation",{
            "order_id":uid(),"positions":[]
        })
    )
    accepted=[]
    for label,path,body in operations:
        code,receipt,headers=request(path,token=token,body=body)
        assert code==201 and receipt and receipt.get("replayed") is False,(
            "Could not create a real replay baseline",label,code
        )
        assert "no-store" in headers.get("Cache-Control","").lower()
        accepted.append((label,path,body,receipt))
    return accepted

a=signin(d["a_username"],d["a_password"])
b=signin(d["b_username"],d["b_password"])
assert a!=b,"Two users must have independent access tokens"

# First establish two real accepted commands owned by B; both become
# immutable replay baselines, then freeze both player cities and all ledgers.
accepted=accepted_replay_seed(b)
before=complete_snapshot()
checks=0
cross_target=0
destination_indistinguishable=0
seven_resources={name:(1 if name=="wood" else 0) for name in (
    "gold","wood","ore","crystal","gems","sulfur","mercury"
)}
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
            "cargo":seven_resources,"expected_policy_id":"QA-DENIED-CONTRACT"
        }),
        ("schedule caravan",city+"/caravans/programs",{
            "program_id":uid(),"destination_city_id":own,
            "cargo_template":seven_resources,"expected_policy_id":"QA-DENIED-CONTRACT",
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
            "cargo":seven_resources,"expected_policy_id":"QA-DENIED-CONTRACT"
        })
    ]
    for label,path,body in operations:
        status,response,headers=request(path,token=actor,body=body)
        # Foreign path ownership is concealed with 404. An own-city
        # caravan to an unavailable destination instead returns the same
        # generic 409 whether that UUID is foreign or nonexistent.
        destination_case=label=="foreign caravan destination from own city"
        assert status==(409 if destination_case else 404),(label,status)
        if destination_case:
            absent={**body,"shipment_id":uid(),"destination_city_id":uid()}
            absent_status,absent_body,_=request(path,token=actor,body=absent)
            assert absent_status==409 and absent_body==response,(
                "Destination error reveals whether the city exists",
                absent_status,status
            )
            destination_indistinguishable+=1
        assert "no-store" in headers.get("Cache-Control","").lower(),(
            "Missing private API no-store header",label
        )
        checks+=1
        if "from own city" in label:
            cross_target+=1

# Successful identical retries are idempotent (200, replayed=True),
# while changed intent with the SAME UUID must be rejected (409). The other
# legitimate member of the world must not replay B's private receipts (404).
replay_success=0
replay_conflict=0
cross_replay_denial=0
for label,path,body,original in accepted:
    code,receipt,headers=request(path,token=b,body=body)
    assert code==200 and receipt and receipt.get("replayed") is True,(
        "Identical owner retry must be idempotent",label,code
    )
    assert {k:v for k,v in receipt.items() if k!="replayed"}=={
        k:v for k,v in original.items() if k!="replayed"
    },("Replay receipt does not match original",label)
    assert "no-store" in headers.get("Cache-Control","").lower()
    replay_success+=1
    changed={**body}
    if label=="artifact":
        changed["operation"]="to_bag"
    else:
        changed["positions"]=[{
            "position":1,"unit_code":"militia","quantity":1
        }]
    conflict,_,headers=request(path,token=b,body=changed)
    assert conflict==409,("Reused UUID with altered intent",label,conflict)
    assert "no-store" in headers.get("Cache-Control","").lower()
    replay_conflict+=1
    denied,_,headers=request(path,token=a,body=body)
    assert denied==404,("Foreign account replayed B receipt",label,denied)
    assert "no-store" in headers.get("Cache-Control","").lower()
    cross_replay_denial+=1

# The two legitimate city states AND complete order/journal rowsets must be
# byte-for-byte identical after the 42 forgery attempts and six replay probes.
after=complete_snapshot()
assert after["cities"]==before["cities"],(
    "Unauthorized or replayed request modified one of the two cities"
)
assert after["journals"]==before["journals"],(
    "Unauthorized or replayed request changed game order journals"
)
assert checks==42 and cross_target==8 and destination_indistinguishable==2,(
    checks,cross_target,destination_indistinguishable
)
assert (replay_success,replay_conflict,cross_replay_denial)==(2,2,2)
print(json.dumps({
    "shared_world":True,"users":2,"foreign_write_denials":checks,
    "cross_target_denials":cross_target,"second_city_unchanged":True,
    "destination_indistinguishable":destination_indistinguishable,
    "both_cities_unchanged":True,"journals_unchanged":True,
    "journal_tables_checked":len(JOURNAL_TABLES),
    "city_tables_checked":len(CITY_TABLES)+1,
    "replay_success":replay_success,"replay_conflict":replay_conflict,
    "cross_replay_denial":cross_replay_denial
}))
