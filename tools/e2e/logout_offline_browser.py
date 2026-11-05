#!/usr/bin/env python3
"""Real localhost-only logout outage: no false promise of server revocation.

An isolated Playwright browser signs in, then the sandbox API is stopped.
The browser must clear its cookie while explaining that revocation is unknown.
After FastAPI is restored we PROVE the old bearer remains temporarily valid
and revoke it explicitly to clean the disposable sandbox. No production API.
"""
from __future__ import annotations
import json
import os
import re
import subprocess
from pathlib import Path
from playwright.sync_api import expect,sync_playwright
from compose_qa import compose_cli

BASE=os.environ["MMHK_E2E_URL"].rstrip("/")
OUT=Path("test-output/visuals")
OUT.mkdir(parents=True,exist_ok=True)
COMPOSE=compose_cli()

PROBE=r"""
import json,sys,urllib.request,urllib.error
data=json.load(sys.stdin)
base="http://127.0.0.1:8000/api/v1/"
token=data["token"]
headers={"Authorization":"Bearer "+token}
req=urllib.request.Request(base+"me/worlds",headers=headers)
with urllib.request.urlopen(req,timeout=8) as res:
    assert res.status==200
revoke=urllib.request.Request(
    base+"sessions/current",headers=headers,method="DELETE"
)
with urllib.request.urlopen(revoke,timeout=8) as res:
    assert res.status==204
try:
    urllib.request.urlopen(req,timeout=8)
except urllib.error.HTTPError as error:
    assert error.code==401
else:
    raise AssertionError("Expired session still accepted after explicit revoke")
print(json.dumps({"old_token_accepted_after_outage":True,"cleanup_revoked":True}))
"""

def docker(*args):
    r=subprocess.run([*COMPOSE,*args],text=True,capture_output=True,
                     timeout=150,check=False)
    if r.returncode:
        raise RuntimeError("Local disposable API operation failed")

def probe(token):
    p=subprocess.run([*COMPOSE,"exec","-T","api","python","-c",PROBE],
                     input=json.dumps({"token":token}),text=True,capture_output=True,
                     timeout=45,check=False)
    if p.returncode:
        raise AssertionError("Local offline logout probe/revocation failed")
    return json.loads(p.stdout.strip())

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={"width":1220,"height":900})
        page=context.new_page()
        page.set_default_timeout(20000)
        try:
            page.goto(BASE,wait_until="domcontentloaded",timeout=30000)
            page.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
            page.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
            page.get_by_role("button",name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible()
            cookies=[c for c in context.cookies() if c["name"]=="mmhk_session"]
            assert len(cookies)==1 and cookies[0]["httpOnly"]
            bearer=cookies[0]["value"]
            # The existing GameShell contains the normal logout form.
            docker("stop","api")
            try:
                page.get_by_role("button",name="Déconnexion").first.click()
                expect(page.get_by_role(
                    "heading",name="Accéder au royaume")).to_be_visible(timeout=28000)
                expect(page.get_by_test_id(
                    "logout-revocation-unconfirmed")).to_be_visible()
                expect(page.get_by_test_id(
                    "logout-revocation-confirmed")).to_have_count(0)
                assert not any(c["name"]=="mmhk_session" for c in context.cookies())
                page.screenshot(path=str(OUT/"LOGOUT-api-offline-warning.png"),
                                full_page=False,animations="disabled")
            finally:
                docker("up","-d","--wait","--no-build","--no-deps","api")
            # This is a NEGATIVE security assertion: the browser cannot claim
            # revocation when the API was unreachable. Explicitly revoke after
            # proving the warning was truthful.
            assert probe(bearer)=={
                "old_token_accepted_after_outage":True,"cleanup_revoked":True
            }
            page.goto(BASE,wait_until="domcontentloaded",timeout=30000)
            expect(page.get_by_role("heading",name="Accéder au royaume")).to_be_visible()
            print("PASS: offline logout cleared local HttpOnly cookie, "
                  "warned remote revocation unconfirmed and avoided a false success",
                  flush=True)
        finally:
            context.close()
            browser.close()

if __name__=="__main__":
    main()
