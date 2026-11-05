#!/usr/bin/env python3
"""Real API outage across authenticated private world/city views (localhost CI)."""
from __future__ import annotations

import os
from compose_qa import compose_cli
import re
import subprocess
from pathlib import Path
from playwright.sync_api import expect,sync_playwright

BASE=os.environ["MMHK_E2E_URL"].rstrip("/")
ART=Path("test-output/visuals")
ART.mkdir(parents=True,exist_ok=True)
COMPOSE=compose_cli()

def docker(*args):
    p=subprocess.run([*COMPOSE,*args],capture_output=True,text=True,
                     timeout=150,check=False)
    if p.returncode: raise RuntimeError("Disposable API restore/stop failed")

def session(context):
    cookies=[x for x in context.cookies() if x["name"]=="mmhk_session"]
    assert len(cookies)==1 and cookies[0]["httpOnly"]
    return cookies[0]["value"]

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={"width":1220,"height":900})
        page=context.new_page()
        page.set_default_timeout(20000)
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        try:
            page.goto(BASE,wait_until="domcontentloaded",timeout=30000)
            page.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
            page.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
            page.get_by_role("button",name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible()
            link=page.get_by_role("link",name=re.compile("Royaume de démonstration"))
            world_href=link.get_attribute("href")
            assert world_href and world_href.startswith("/worlds/")
            original=session(context)
            link.click()
            expect(page.get_by_role("heading",name="Mes positions dans le monde")).to_be_visible()
            page.get_by_role("tablist",name="Écrans du monde").get_by_role("tab",name="Mes cités").click()
            city_href=page.get_by_role("link",name="Entrer en ville").first.get_attribute("href")
            assert city_href and city_href.startswith("/cities/")
            routes=[
                ("world",world_href),
                ("city",city_href),
                ("heroes",city_href+"/heroes"),
                ("forces",city_href+"/forces"),
                ("region",city_href+"/region"),
                ("market",city_href+"/market"),
                ("colonization",world_href+"/colonize")
            ]
            docker("stop","api")
            try:
                for name,path in routes:
                    sizes=((1220,900),(390,844)) if name in ("world","city") else ((390,844),)
                    for width,height in sizes:
                        page.set_viewport_size({"width":width,"height":height})
                        page.goto(BASE+path,wait_until="domcontentloaded",timeout=30000)
                        failure=page.get_by_test_id("private-screen-failure")
                        expect(failure).to_be_visible(timeout=20000)
                        expect(failure).to_have_attribute("data-failure-kind","unavailable")
                        expect(failure.get_by_role("heading",
                            name="Service momentanément indisponible")).to_be_visible()
                        expect(failure.locator('[role="alert"]')).to_contain_text(
                            "Votre session est conservée")
                        retry=page.get_by_test_id("private-screen-retry")
                        expect(retry).to_be_visible()
                        assert retry.get_attribute("href")==path
                        expect(page.locator(".kingdom-shell")).to_have_count(0)
                        expect(page.get_by_test_id("hero-equipment-board")).to_have_count(0)
                        assert session(context)==original,(name,"session changed")
                        document_width=page.evaluate("document.documentElement.scrollWidth")
                        assert document_width<=width+3,(name,width,document_width)
                        if name in ("world","city"):
                            page.screenshot(path=str(ART / Path(f"PRIVATE-{name}-outage-{width}x{height}.png")),
                                            full_page=False,animations="disabled")
                    print("PASS PRIVATE OUTAGE",name,flush=True)
            finally:
                docker("up","-d","--wait","--no-build","--no-deps","api")
            # The retry is a hard GET, not a mutation nor a cached RSC refresh.
            page.get_by_test_id("private-screen-retry").click()
            expect(page.get_by_role("heading",name="Fonder une nouvelle cité")).to_be_visible(timeout=25000)
            assert session(context)==original
            page.goto(BASE+city_href,wait_until="domcontentloaded",timeout=30000)
            expect(page.get_by_test_id("city-game-screen")).to_be_visible()
            assert session(context)==original
            print("PASS: seven private views recover without another login",flush=True)
            current=[c for c in context.cookies() if c["name"]=="mmhk_session"][0]
            context.add_cookies([{**current,"value":"invalid_local_ci_session"}])
            page.goto(BASE+city_href,wait_until="domcontentloaded",timeout=30000)
            expect(page.get_by_role("heading",name="Accéder au royaume")).to_be_visible()
            expect(page.get_by_test_id("private-screen-failure")).to_have_count(0)
            expect(page.get_by_test_id("city-game-screen")).to_have_count(0)
            assert not errors,errors[:3]
            print("PASS: invalid token remains 401/login",flush=True)
        finally:
            context.close()
            browser.close()

if __name__=="__main__":
    main()
