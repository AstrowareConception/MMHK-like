#!/usr/bin/env python3
"""Two truly different users in one MMHK world, live FastAPI + Chromium.

Runs only AFTER the authenticated gameplay campaign on the disposable CI
Docker stack. Creates a second account, owner-only city/hero/artifact via an
in-container fixture guarded by PGDATABASE=mmhk_local. Asserts genuine API
HTTP 404 on foreign GET and artifact mutation, plus actual browser 404 on
foreign screens and own-only world listings. No production route or signup.
Never print cookies, tokens, usernames/passwords or private payloads.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path

from playwright.sync_api import expect,sync_playwright

ROOT=os.environ["MMHK_E2E_URL"].rstrip("/")
ART=Path("test-output/visuals")
ART.mkdir(parents=True,exist_ok=True)
COMPOSE=["docker","compose","--env-file",".env.local","-f","compose.local.yaml"]
FIXTURE=Path("tools/e2e/two_player_fixture.py")

def create_local_player():
    assert FIXTURE.is_file(), "Missing explicit local-only fixture"
    run=subprocess.run(
        [*COMPOSE,"exec","-T","api","python","-"],
        input=FIXTURE.read_text(encoding="utf-8"),text=True,
        capture_output=True,check=False,timeout=90)
    if run.returncode:
        # Do not dump the in-container payload or credentials into CI logs.
        raise RuntimeError("Disposable second-player database fixture failed")
    return json.loads(run.stdout.strip())

API_CONTRACT=r"""
import json,sys,urllib.error,urllib.request
from uuid import uuid4

d=json.load(sys.stdin)
base="http://127.0.0.1:8000"
def request(path,token=None,method="GET",payload=None):
    data=json.dumps(payload).encode() if payload is not None else None
    headers={"Content-Type":"application/json"}
    if token:
        headers["Authorization"]="Bearer "+token
    req=urllib.request.Request(base+path,data=data,headers=headers,method=method)
    try:
        with urllib.request.urlopen(req,timeout=8) as res:
            raw=res.read()
            return res.status,json.loads(raw) if raw else None,res.headers
    except urllib.error.HTTPError as err:
        return err.code,None,err.headers
def login(username,password):
    status,payload,_=request("/api/v1/sessions",method="POST",payload={
        "username":username,"password":password
    })
    assert status==200 and payload.get("access_token"),"CI login failed"
    return payload["access_token"]
a=login(d["a_username"],d["a_password"])
b=login(d["b_username"],d["b_password"])
world="/api/v1/me/worlds/local-sandbox"
for token,own,foreign in (
    (a,d["a_city"],d["b_city"]),
    (b,d["b_city"],d["a_city"])
):
    s,worlds,_=request("/api/v1/me/worlds",token)
    assert s==200 and any(w["world_id"]=="local-sandbox" for w in worlds)
    s,cities,_=request(world+"/cities",token)
    assert s==200 and any(c["city_id"]==own for c in cities)
    assert all(c["city_id"]!=foreign for c in cities),"Foreign city leaked into own list"
    s,overview,_=request(world+"/overview",token)
    assert s==200
    assert any(c["city_id"]==own for c in overview["cities"])
    assert all(c["city_id"]!=foreign for c in overview["cities"])
    s,detail,headers=request("/api/v1/me/cities/"+own,token)
    assert s==200 and "no-store" in headers.get("Cache-Control","")
    assert detail["city_id"]==own
    checked=0
    for suffix in (
        "","/construction","/market","/market/offers",
        "/caravans","/forces","/artifacts","/region","/missions"
    ):
        s,_,headers=request("/api/v1/me/cities/"+foreign+suffix,token)
        assert s==404,("Foreign scoped GET did not hide city",suffix,s)
        assert "no-store" in headers.get("Cache-Control","")
        checked+=1
    foreign_hero=d["b_hero"] if token==a else d["a_hero"]
    s,_,_=request("/api/v1/me/cities/"+foreign+"/heroes/"+
                    foreign_hero+"/formation",token)
    assert s==404,("Foreign hero formation exposed",s)
    checked+=1
    foreign_art=d["b_artifact"] if token==a else d["a_artifact"]
    s,_,_=request("/api/v1/me/cities/"+foreign+"/artifacts/move",token,
                  method="POST",payload={
                    "order_id":str(uuid4()),"artifact_id":foreign_art,
                    "operation":"to_reserve","target_hero_id":None
                  })
    assert s==404,("Foreign artifact mutation not hidden",s)
    checked+=1
    assert checked==11
# A 401 without a token is not a 404 and reveals no private body.
s,_,_=request("/api/v1/me/cities/"+d["a_city"])
assert s==401
print(json.dumps({"users":2,"foreign_checks":22,"same_world":True}))
"""

def verify_live_api(fixture):
    payload=dict(fixture)
    payload.update({
        "a_username":os.environ["MMHK_E2E_USERNAME"],
        "a_password":os.environ["MMHK_E2E_PASSWORD"]
    })
    run=subprocess.run(
        [*COMPOSE,"exec","-T","api","python","-c",API_CONTRACT],
        input=json.dumps(payload),capture_output=True,text=True,
        check=False,timeout=140)
    if run.returncode:
        # The child intentionally emits no bearer, cookies or credentials.
        raise AssertionError("Cross-account FastAPI boundary failed: "+
                             run.stderr[-1300:])
    result=json.loads(run.stdout.strip())
    assert result=={"users":2,"foreign_checks":22,"same_world":True},result
    print("PASS: 22 foreign API GET/POST concealment checks, "
          "own-world scoping, independent bearers, 401 and no-store",flush=True)

def worker_control(*command):
    """Pause ONLY the disposable local worker while taking rowset snapshots.

    This avoids mistaking legitimate production ticks and asynchronous
    completions for unauthorized game mutations in the test itself.
    """
    result=subprocess.run(
        [*COMPOSE,*command],capture_output=True,text=True,
        check=False,timeout=180)
    if result.returncode:
        raise RuntimeError("Unable to control disposable CI worker")


def verify_live_writes(fixture):
    """Run the hardened two-account POST matrix inside disposable FastAPI.

    Its only input is a JSON pipe; no account secrets or bearer appear in
    command arguments, job logs or screenshot artifacts.
    """
    path=Path("tools/e2e/two_player_write_contract.py")
    assert path.is_file(),"Missing two-account write authorization contract"
    payload=dict(fixture)
    payload.update({
        "a_username":os.environ["MMHK_E2E_USERNAME"],
        "a_password":os.environ["MMHK_E2E_PASSWORD"]
    })
    run=subprocess.run(
        [*COMPOSE,"exec","-T","api","python","-c",
         path.read_text(encoding="utf-8")],
        input=json.dumps(payload),capture_output=True,text=True,
        check=False,timeout=190)
    if run.returncode:
        # Only the case name/status of a denied write may be printed; not the
        # input JSON or any private credential used for setup.
        raise AssertionError("Cross-account write authorization failed: "+
                             run.stderr[-1700:])
    result=json.loads(run.stdout.strip())
    assert result=={
        "shared_world":True,"users":2,"foreign_write_denials":42,
        "cross_target_denials":8,"second_city_unchanged":True,
        "destination_indistinguishable":2,
        "both_cities_unchanged":True,"journals_unchanged":True,
        "journal_tables_checked":18,"city_tables_checked":14,
        "replay_success":2,"replay_conflict":2,"cross_replay_denial":2
    },result
    print("PASS: 42 cross-account write denials (40 concealed 404, "
          "2 indistinguishable 409); BOTH cities and 18 order journals "
          "unchanged; 2 safe owner replays, 2 altered-UUID conflicts, "
          "2 rejected foreign replay attempts",flush=True)


def check_cookie(context):
    cookies=[c for c in context.cookies() if c["name"]=="mmhk_session"]
    assert len(cookies)==1 and cookies[0]["httpOnly"]
    return cookies[0]["value"]

def login(page,username,password):
    page.goto(ROOT,wait_until="domcontentloaded",timeout=35000)
    page.get_by_label("Identifiant").fill(username)
    page.get_by_label("Mot de passe").fill(password)
    page.get_by_role("button",name="Entrer dans le royaume").click()
    expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(timeout=25000)

def main():
    fixture=create_local_player()
    verify_live_api(fixture)
    # The worker is normally vital to the game. Pause it only around the
    # security snapshots, and always resume it before Chromium navigation
    # or the CI's PostgreSQL backup validation.
    worker_control("stop","worker")
    try:
        verify_live_writes(fixture)
    finally:
        worker_control("up","-d","--wait","--no-build","--no-deps","worker")
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        a=browser.new_context(viewport={"width":1220,"height":900})
        b=browser.new_context(viewport={"width":390,"height":844})
        pa=a.new_page()
        pb=b.new_page()
        for p in (pa,pb):
            p.set_default_timeout(20000)
        errors=[]
        pa.on("pageerror",lambda e:errors.append(str(e)))
        pb.on("pageerror",lambda e:errors.append(str(e)))
        try:
            login(pa,os.environ["MMHK_E2E_USERNAME"],os.environ["MMHK_E2E_PASSWORD"])
            login(pb,fixture["b_username"],fixture["b_password"])
            token_a=check_cookie(a)
            token_b=check_cookie(b)
            assert token_a!=token_b,"Two accounts share the same session"
            # Both are legitimate members of the SAME world, but a city's
            # ownership must never follow from world membership alone.
            for p,own_name,foreign_name,label in (
                (pa,fixture["a_city_name"],fixture["b_city_name"],"first"),
                (pb,fixture["b_city_name"],fixture["a_city_name"],"second")
            ):
                p.goto(ROOT+"/worlds/local-sandbox",wait_until="domcontentloaded")
                expect(p.get_by_role("tablist",name="Écrans du monde")).to_be_visible()
                p.get_by_role("tablist",name="Écrans du monde").get_by_role(
                    "tab",name="Mes cités").click()
                cards=p.locator(".world-city-link")
                expect(cards.filter(has_text=own_name).first).to_be_visible()
                expect(cards.filter(has_text=foreign_name)).to_have_count(0)
                p.screenshot(path=str(ART/f"ISOLATION-{label}-owned-cities.png"),
                             animations="disabled",full_page=False)
            for p,foreign,foreign_name,label in (
                (pa,fixture["b_city"],fixture["b_city_name"],"first"),
                (pb,fixture["a_city"],fixture["a_city_name"],"second")
            ):
                for suffix in ("","/heroes","/forces","/region","/market"):
                    response=p.goto(ROOT+"/cities/"+foreign+suffix,
                                    wait_until="domcontentloaded",timeout=35000)
                    assert response and response.status==404,(
                        "Owner-only page was not hidden",label,suffix,
                        response.status if response else "no response"
                    )
                    expect(p.get_by_test_id("hero-equipment-board")).to_have_count(0)
                    expect(p.get_by_test_id("city-game-screen")).to_have_count(0)
                    expect(p.get_by_test_id("private-screen-failure")).to_have_count(0)
                    assert foreign_name not in p.content(),(
                        "Private owner identity leaked in error page",label,suffix
                    )
                ctx=a if label=="first" else b
                assert check_cookie(ctx)==(token_a if label=="first" else token_b)
                print("PASS: foreign city/hero/forces/region/market hidden",
                      label,flush=True)
            pb.goto(ROOT+"/cities/"+fixture["b_city"],
                    wait_until="domcontentloaded",timeout=35000)
            expect(pb.get_by_test_id("city-game-screen")).to_be_visible()
            assert fixture["b_city_name"] in pb.content()
            assert check_cookie(a)==token_a and check_cookie(b)==token_b
            assert not errors,errors[:3]
            print("PASS: same-world two-player Chromium isolation, "
                  "own-only city listings, reciprocal 404s, intact HttpOnly sessions",
                  flush=True)
        finally:
            a.close()
            b.close()
            browser.close()

if __name__=="__main__":
    main()
