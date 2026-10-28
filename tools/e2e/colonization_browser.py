#!/usr/bin/env python3
"""Full Chromium founding journey, intentionally not run in this development turn.

Prerequisite: disposable localhost stack + explicit colony-demo lab fixture.
The founding test never uses an HTTP endpoint to bypass beginner protection:
an operator backdates an *isolated synthetic* membership in the fixture only.
"""
from __future__ import annotations

import os
import re
import sys
from playwright.sync_api import expect,sync_playwright


def main():
    root=os.environ["MMHK_E2E_URL"].rstrip("/")
    username=os.environ["MMHK_E2E_USERNAME"]
    password=os.environ["MMHK_E2E_PASSWORD"]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        page=browser.new_page(viewport={"width":1366,"height":900})
        errors=[]
        page.on("pageerror",lambda err:errors.append(str(err)))
        try:
            page.goto(root,wait_until="domcontentloaded",timeout=30000)
            page.get_by_label("Identifiant").fill(username)
            page.get_by_label("Mot de passe").fill(password)
            page.get_by_role("button",name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(timeout=25000)
            page.get_by_role("link",name=re.compile("Royaume de démonstration")).click()
            expect(page.get_by_role("heading",name="Mes positions dans le monde")).to_be_visible()
            page.get_by_role("link",name="Examiner les droits de colonisation").click()
            expect(page.get_by_role("heading",level=1,name="Fonder une nouvelle cité")).to_be_visible()
            expect(page.get_by_text("Période initiale terminée")).to_be_visible()
            expect(page.get_by_text("Devis serveur",exact=False)).to_be_visible()
            button=page.get_by_role("button",name="Engager le héros et réserver les ressources")
            expect(button).to_be_enabled()
            label=page.locator("form.colony-confirm input[name='colonyName']")
            label.fill("Nouvel Havre des Brumes")
            button.click()
            expect(page.get_by_text("Expédition enregistrée :",exact=False)).to_be_visible(timeout=25000)
            expedition=page.get_by_test_id("colonization-order").first
            expect(expedition).to_contain_text("Nouvel Havre des Brumes")
            expect(expedition).to_contain_text("En marche vers",timeout=20000)
            # Only the server-side founding worker can materialize the city.
            expect(expedition).to_contain_text("Cité fondée et opérationnelle",timeout=120000)
            expedition.get_by_role("link",name="Entrer dans la cité fondée").click()
            expect(page.get_by_role("heading",level=1,name="Nouvel Havre des Brumes")).to_be_visible()
            expect(page.get_by_role("heading",name="Réserves de la ville")).to_be_visible()
            expect(page.get_by_text("Mine présente").first).to_be_visible()
            # New settlements have seven distinct zero-starting stock balances
            # (production may accrue afterward), no free buildings or troops.
            expect(page.locator(".resource-grid article")).to_have_count(7)
            expect(page.get_by_role("navigation",name="Changer de cité")).to_be_visible()
            picker=page.get_by_role("navigation",name="Changer de cité")
            picker.get_by_role("link",name=re.compile("Premier Havre")).click()
            expect(page.get_by_role("heading",level=1,name="Premier Havre")).to_be_visible()
            page.get_by_role("link",name="Marché",exact=True).click()
            dest=page.locator("select[name='destination_city_id']")
            expect(dest).to_contain_text("Nouvel Havre des Brumes")
            page.locator('a[href="/worlds/local-sandbox"]').first.click()
            world_cities=page.locator(".world-city-link")
            assert world_cities.count()==3,world_cities.all_text_contents()
            expect(world_cities.filter(has_text="Nouvel Havre des Brumes")).to_have_count(1)
            if errors:
                raise AssertionError("Browser script failures: "+repr(errors[:4]))
            print("PASS: seven-day eligible world -> qualified plot -> hero founding -> "+
                  "worker-built city -> independent stocks -> multicity switcher -> "+
                  "real caravan destination")
        finally:
            browser.close()


if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: colony browser regression:",type(exc).__name__,
              str(exc)[:750],file=sys.stderr)
        raise SystemExit(1)
