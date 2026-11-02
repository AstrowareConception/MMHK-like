#!/usr/bin/env python3
"""Real entry-gate and guest-access UX, without mutating game-world data.

Public-safe Chromium screenshots and controls for:
- actual wrong credentials (one attempt only)
- explicit, accessible, non-leaking error
- anonymous access refusal for protected world and hero routes
- successful login, world selection and clean logout
- narrow mobile and desktop entry layouts
"""
from __future__ import annotations

import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

BASE=os.environ["MMHK_E2E_URL"].rstrip("/")
ART=Path("test-output/visuals")
ART.mkdir(parents=True,exist_ok=True)

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        bad=browser.new_context(viewport={"width":1220,"height":900})
        page=bad.new_page()
        page.set_default_timeout(15000)
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.goto(BASE,wait_until="domcontentloaded",timeout=30000)
        expect(page.get_by_role("heading",name="Accéder au royaume")).to_be_visible()
        expect(page.get_by_label("Identifiant")).to_be_visible()
        expect(page.get_by_label("Mot de passe")).to_be_visible()
        expect(page.get_by_role("button",name="Entrer dans le royaume")).to_be_enabled()
        for width,height in ((1220,900),(390,844)):
            page.set_viewport_size({"width":width,"height":height})
            geom=page.evaluate("""() => {
              const card=document.querySelector('section.panel');
              const form=document.querySelector('.login-form');
              const r=card.getBoundingClientRect();
              return {viewport:innerWidth,width:document.documentElement.scrollWidth,
                cardLeft:r.left,cardRight:r.right,
                formVisible:getComputedStyle(form).display!=='none',
                inputCount:form.querySelectorAll('input').length};
            }""")
            print("PUBLIC LOGIN QA",width,height,geom,flush=True)
            assert geom["width"]<=width+3,geom
            assert geom["cardLeft"]>=-3 and geom["cardRight"]<=width+3,geom
            assert geom["formVisible"] and geom["inputCount"]==2,geom
            page.screenshot(path=str(ART/f"LOGIN-public-{width}x{height}.png"),
                            full_page=False,animations="disabled")

        # Use a single nonexistent account. Never send a real user's secret
        # through this negative test, and do not log the submitted password.
        page.get_by_label("Identifiant").fill("ci_unknown_account_2026")
        page.get_by_label("Mot de passe").fill("invalid-demo-password")
        page.get_by_role("button",name="Entrer dans le royaume").click()
        expect(page.get_by_role("alert")).to_contain_text(
            "Identifiants invalides ou connexion refusée",timeout=20000)
        expect(page.get_by_role("heading",name="Accéder au royaume")).to_be_visible()
        expect(page.get_by_test_id("hero-equipment-board")).to_have_count(0)
        assert not any(c["name"]=="mmhk_session" for c in bad.cookies())
        assert not errors,errors[:3]
        page.screenshot(path=str(ART/"LOGIN-invalid-390x844.png"),
                        full_page=False,animations="disabled")
        page.goto(BASE+"/worlds/local-sandbox",wait_until="domcontentloaded")
        expect(page.get_by_role("heading",name="Accéder au royaume")).to_be_visible()
        bad.close()

        good=browser.new_context(viewport={"width":1220,"height":900})
        user=good.new_page()
        user.goto(BASE,wait_until="domcontentloaded")
        user.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
        user.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
        user.get_by_role("button",name="Entrer dans le royaume").click()
        expect(user.get_by_role("heading",name="Mes mondes")).to_be_visible(
            timeout=20000)
        expect(user.get_by_role("link",name=re.compile("Royaume de démonstration"))).to_be_visible()
        for width,height in ((1220,900),(390,844)):
            user.set_viewport_size({"width":width,"height":height})
            metrics=user.evaluate("""() => ({
              viewport:innerWidth,
              documentWidth:document.documentElement.scrollWidth,
              worlds:document.querySelectorAll('.tile-links a').length
            })""")
            print("WORLD ENTRY QA",width,height,metrics,flush=True)
            assert metrics["documentWidth"]<=width+3,metrics
            assert metrics["worlds"]>=1,metrics
            user.screenshot(path=str(ART/f"LOGIN-world-selection-{width}x{height}.png"),
                            full_page=False,animations="disabled")
        user.get_by_role("button",name="Déconnexion").first.click()
        expect(user.get_by_role("heading",name="Accéder au royaume")).to_be_visible(
            timeout=20000)
        assert not any(c["name"]=="mmhk_session" for c in good.cookies())
        good.close()
        browser.close()
        print("PASS: public entry, real denied credentials, anonymous guard, "
              "private world selection, logout and desktop/mobile bounds",flush=True)

if __name__=="__main__":
    main()
