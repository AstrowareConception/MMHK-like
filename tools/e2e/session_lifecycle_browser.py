#!/usr/bin/env python3
"""Test independent real browser sessions, expiry, revocation and write guards.

The CI sandbox is disposable and localhost-only. Tokens are passed to the
existing FastAPI container via STDIN, never command-line args or job logs.
No game command is accepted; the synthetic write UUID is checked in PostgreSQL.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=os.environ["MMHK_E2E_URL"].rstrip("/")
COMPOSE=["docker","compose","--env-file",".env.local","-f","compose.local.yaml"]
OUT=Path("test-output/visuals")
OUT.mkdir(parents=True,exist_ok=True)

EXPIRE=r"""
import hashlib,json,os,sys
from mmhk_api.db import connect
if os.getenv("MMHK_LOCAL_DEMO_ENABLED")!="true" or os.getenv("PGDATABASE")!="mmhk_local":
    raise RuntimeError("Session lifecycle fixture is localhost only")
token=json.load(sys.stdin)["token"]
digest=hashlib.sha256(token.encode("utf-8")).digest()
with connect() as db:
    affected=db.execute(
        "UPDATE sessions SET expires_at=now()-interval '1 second' "
        "WHERE token_digest=%s AND expires_at > now()",(digest,)
    ).rowcount
assert affected==1,"Only the chosen session should expire"
print(json.dumps({"expired":True}))
"""

PROBE=r"""
import json,sys,urllib.error,urllib.request
from uuid import uuid4
from mmhk_api.db import connect

data=json.load(sys.stdin)
base="http://127.0.0.1:8000"
def request(path,method="GET",payload=None):
    encoded=json.dumps(payload).encode() if payload is not None else None
    req=urllib.request.Request(base+path,data=encoded,method=method,headers={
        "Authorization":"Bearer "+data["token"],
        "Content-Type":"application/json"
    })
    try:
        with urllib.request.urlopen(req,timeout=8) as res:
            res.read()
            return res.status,res.headers.get("Cache-Control","")
    except urllib.error.HTTPError as exc:
        exc.read()
        return exc.code,exc.headers.get("Cache-Control","")
get_status,get_cache=request("/api/v1/me/worlds")
assert get_status==data["expected"],("GET session guard",get_status)
assert "no-store" in get_cache
if data["expected"]==401:
    order=str(uuid4())
    status,cache=request(
        "/api/v1/me/cities/"+data["city_id"]+"/construction",
        method="POST",payload={"order_id":order,"building_code":"village_hall",
                               "mode":"normal"}
    )
    assert status==401,("Expired/revoked token accepted game write",status)
    assert "no-store" in cache
    with connect() as db:
        assert db.execute(
            "SELECT count(*) FROM urban_construction_orders WHERE order_id=%s",
            (order,)
        ).fetchone()[0]==0,"Rejected write created an order"
print(json.dumps({"get_status":get_status,"denied_write":data["expected"]==401}))
"""

def inside_api(code,payload):
    result=subprocess.run(
        [*COMPOSE,"exec","-T","api","python","-c",code],
        input=json.dumps(payload),capture_output=True,text=True,timeout=35,
        check=False
    )
    if result.returncode:
        # No secret-bearing stdin or backend exceptions appear in job logs.
        raise AssertionError("Local-only session boundary assertion failed")
    return json.loads(result.stdout.strip())

def token(context):
    cookies=[c for c in context.cookies() if c["name"]=="mmhk_session"]
    assert len(cookies)==1 and cookies[0]["httpOnly"]
    assert cookies[0]["sameSite"]=="Lax"
    return cookies[0]["value"]

def login(page):
    page.goto(ROOT,wait_until="domcontentloaded",timeout=30000)
    page.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
    page.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
    page.get_by_role("button",name="Entrer dans le royaume").click()
    expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(timeout=20000)

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        first=browser.new_context(viewport={"width":1220,"height":900})
        second=browser.new_context(viewport={"width":390,"height":844})
        p1=first.new_page()
        p2=second.new_page()
        p1.set_default_timeout(20000)
        p2.set_default_timeout(20000)
        errors=[]
        for page in (p1,p2):
            page.on("pageerror",lambda error:errors.append(str(error)))
        try:
            login(p1)
            login(p2)
            a,b=token(first),token(second)
            assert a!=b,"Separate logins must have unique bearers"
            world=p2.get_by_role("link",name=re.compile("Royaume de démonstration"))
            world.click()
            p2.get_by_role("tablist",name="Écrans du monde").get_by_role(
                "tab",name="Mes cités").click()
            city=p2.get_by_role("link",name="Entrer en ville").first.get_attribute("href")
            assert city and re.fullmatch(r"/cities/[a-f0-9-]{36}",city,re.I)
            city_id=city.split("/")[-1]

            assert inside_api(PROBE,{"token":a,"city_id":city_id,"expected":200})["get_status"]==200
            assert inside_api(PROBE,{"token":b,"city_id":city_id,"expected":200})["get_status"]==200
            assert inside_api(EXPIRE,{"token":a})=={"expired":True}

            result=inside_api(PROBE,{"token":a,"city_id":city_id,"expected":401})
            assert result=={"get_status":401,"denied_write":True}
            p1.goto(ROOT+"?session-expired=1",wait_until="domcontentloaded",timeout=30000)
            expect(p1.get_by_role("heading",name="Accéder au royaume")).to_be_visible()
            expect(p1.get_by_text(
                "Votre session a expiré ou a été refusée.")).to_be_visible()
            expect(p1.get_by_test_id("hero-equipment-board")).to_have_count(0)
            assert token(first)==a,"Expiry unexpectedly cleared unrelated cookie"
            p1.screenshot(path=str(OUT/"SESSION-expired-1220x900.png"),
                          full_page=False,animations="disabled")
            print("PASS: targeted expiry produces 401 for GET and game POST "
                  "without deleting a different session",flush=True)

            p2.goto(ROOT+"?other-session-alive=1",wait_until="domcontentloaded",
                    timeout=30000)
            expect(p2.get_by_role("heading",name="Mes mondes")).to_be_visible()
            assert token(second)==b
            assert inside_api(PROBE,{"token":b,"city_id":city_id,"expected":200})[
                "get_status"]==200
            p2.get_by_role("button",name="Déconnexion").first.click()
            expect(p2.get_by_role("heading",name="Accéder au royaume")).to_be_visible()
            assert not any(c["name"]=="mmhk_session" for c in second.cookies())
            result=inside_api(PROBE,{"token":b,"city_id":city_id,"expected":401})
            assert result=={"get_status":401,"denied_write":True}
            assert inside_api(PROBE,{"token":a,"city_id":city_id,"expected":401})[
                "get_status"]==401
            print("PASS: browser logout removes HttpOnly cookie AND revokes "
                  "the bearer server-side; revoked and expired writes denied",flush=True)

            login(p2)
            c=token(second)
            assert c not in (a,b),"Fresh login reused an old expired/revoked bearer"
            assert inside_api(PROBE,{"token":c,"city_id":city_id,"expected":200})[
                "get_status"]==200
            assert not errors,errors[:3]
            print("PASS: reauthentication creates a new independent "
                  "valid session; no private data exposed",flush=True)
        finally:
            first.close()
            second.close()
            browser.close()

if __name__=="__main__":
    main()
