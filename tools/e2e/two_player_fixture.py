"""Create an ephemeral second player in the isolated local CI sandbox only.

Executed over STDIN inside the already-running local FastAPI container.
Credentials are returned only to the caller's captured pipe, never logs.
No public endpoint and no historic-game economy assumptions.
"""
from __future__ import annotations
import json
import os
import secrets
from uuid import uuid4

from mmhk_api.db import connect
from mmhk_api.security import create_account

if os.environ.get("MMHK_LOCAL_DEMO_ENABLED")!="true" or os.environ.get("PGDATABASE")!="mmhk_local":
    raise RuntimeError("Cross-account fixture prohibited outside mmhk_local")
name="qa_iso_"+secrets.token_hex(6)
password=secrets.token_urlsafe(25)
city_name="Citadelle du second joueur QA"
hero_name="Sentinelle du second joueur QA"
with connect() as db:
    account=db.execute(
        "SELECT account_id FROM accounts WHERE username=%s",("demo_ci",)
    ).fetchone()
    world=db.execute(
        "SELECT world_size FROM worlds WHERE world_id='local-sandbox'"
    ).fetchone()
    if not account or not world:
        raise RuntimeError("Expected disposable CI demo fixture not found")
    first=db.execute(
        """SELECT city_id,name FROM cities
           WHERE world_id='local-sandbox' AND owner_account_id=%s
             AND first_city=true ORDER BY founded_at LIMIT 1""",
        (account[0],)
    ).fetchone()
    if not first:
        raise RuntimeError("Main demo player must have a first city")
    hero=db.execute(
        "SELECT hero_id FROM city_heroes WHERE city_id=%s ORDER BY hired_at LIMIT 1",
        (first[0],)
    ).fetchone()
    art=db.execute(
        "SELECT artifact_id FROM city_artifacts WHERE city_id=%s ORDER BY created_at LIMIT 1",
        (first[0],)
    ).fetchone()
    if not hero or not art:
        raise RuntimeError("Demo hero and artifact needed for foreign permission checks")
    used=set(db.execute(
        "SELECT x,y FROM cities WHERE world_id='local-sandbox'"
    ).fetchall())
    size=int(world[0])
    position=next(((x,y) for x in range(size,0,-1)
                   for y in range(size,0,-1) if (x,y) not in used),None)
    if position is None:
        raise RuntimeError("No free world coordinate in the disposable sandbox")
    second=create_account(db,name,password)
    db.execute(
        "INSERT INTO world_memberships(world_id,account_id) VALUES(%s,%s)",
        ("local-sandbox",second)
    )
    second_city=uuid4()
    db.execute(
        """INSERT INTO cities(city_id,world_id,owner_account_id,name,x,y,first_city)
           VALUES(%s,'local-sandbox',%s,%s,%s,%s,true)""",
        (second_city,second,city_name,*position)
    )
    for resource,amount in (
        ("gold",247),("wood",113),("ore",71),("crystal",19),
        ("gems",0),("sulfur",0),("mercury",0)
    ):
        db.execute(
            "INSERT INTO city_stocks(city_id,resource,amount) VALUES(%s,%s,%s)",
            (second_city,resource,amount)
        )
    for resource in ("gold","wood","ore","crystal"):
        db.execute(
            "INSERT INTO city_mines(city_id,resource) VALUES(%s,%s)",
            (second_city,resource)
        )
    second_hero=uuid4()
    db.execute(
        """INSERT INTO city_heroes(hero_id,city_id,owner_account_id,name,archetype)
           VALUES(%s,%s,%s,%s,'might')""",
        (second_hero,second_city,second,hero_name)
    )
    second_art=uuid4()
    db.execute(
        """INSERT INTO city_artifacts(artifact_id,city_id,artifact_code,location,hero_id,seed_key)
           VALUES(%s,%s,'bronze_helm','bag',%s,%s)""",
        (second_art,second_city,second_hero,str(second_city)+":ci-qa-helm")
    )
# The parent test captures this JSON and never prints credentials.
print(json.dumps({
    "a_city":str(first[0]),"a_city_name":first[1],
    "a_hero":str(hero[0]),"a_artifact":str(art[0]),
    "b_city":str(second_city),"b_city_name":city_name,
    "b_hero":str(second_hero),"b_hero_name":hero_name,
    "b_artifact":str(second_art),"b_username":name,"b_password":password
}))
