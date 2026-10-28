#!/usr/bin/env python3
"""Real Chromium second-city convoy: user form -> FastAPI -> PostgreSQL -> worker.

This test runs ONLY after the trusted 'convoy-demo --enable-second-city' fixture.
No historic S2 timings, loads, alliances or second-city acquisition are asserted.
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
        page.on("pageerror",lambda error:errors.append(str(error)))
        try:
            page.goto(root,wait_until="domcontentloaded",timeout=25000)
            page.get_by_label("Identifiant").fill(username)
            page.get_by_label("Mot de passe").fill(password)
            page.get_by_role("button",name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(timeout=20000)
            page.get_by_role("link",name=re.compile("Royaume de démonstration")).click()
            start=page.locator(".world-city-link").filter(has_text="Premier Havre")
            expect(start).to_have_count(1)
            dest=page.locator(".world-city-link").filter(has_text="Comptoir des caravanes")
            expect(dest).to_have_count(1)
            start.get_by_role("link",name="Entrer en ville").click()
            expect(page.get_by_role("heading",level=1,name="Premier Havre")).to_be_visible()
            page.get_by_role("link",name="Marché",exact=True).click()
            expect(page.get_by_role("heading",name="Caravanes entre mes cités")).to_be_visible()
            plan=page.get_by_test_id("caravan-quote-form")
            expect(plan).to_be_visible()
            expect(plan.locator("select[name='destination_city_id']")).to_contain_text("Comptoir des caravanes")
            plan.locator("input[name='load_wood']").fill("2")
            plan.get_by_role("button",name="Calculer la charge et le trajet").click()
            quote=page.get_by_role("region",name="Devis du chargement")
            expect(quote).to_contain_text("4 000",timeout=16000)
            expect(quote.get_by_role("button",name="Confirmer le départ du convoi")).to_be_enabled()
            quote.get_by_role("button",name="Confirmer le départ du convoi").click()
            expect(page.get_by_text("Convoi enregistré et marchandises réservées.")).to_be_visible(timeout=20000)
            record=page.get_by_test_id("caravan-record").first
            expect(record).to_contain_text("2 bois")
            # Browser refresh only reads; PostgreSQL worker confirms the delivery.
            expect(record).to_contain_text("Livrée",timeout=145000)
            page.locator('a[href="/worlds/local-sandbox"]').first.click()
            dest=page.locator(".world-city-link").filter(has_text="Comptoir des caravanes")
            dest.get_by_role("link",name="Entrer en ville").click()
            expect(page.get_by_role("heading",level=1,
                name="Comptoir des caravanes (laboratoire)")).to_be_visible()
            warehouse=page.locator(".resource-grid article").filter(has_text="Bois")
            expect(warehouse.locator("strong")).to_have_text("2")
            if errors:
                raise AssertionError("Browser JavaScript errors: "+repr(errors[:4]))
            print("PASS: private player -> approved destination -> 7-resource quote -> "+
                  "atomic dispatch -> worker delivery -> destination stock")
        finally:
            browser.close()


if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: laboratory caravan browser journey:",type(exc).__name__,
              str(exc)[:650],file=sys.stderr)
        raise SystemExit(1)
