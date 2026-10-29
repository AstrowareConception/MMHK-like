#!/usr/bin/env python3
"""Worker-published influence plus operator-proven terrain -> actual fourth city."""
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
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(timeout=20000)
            page.goto(root+"/worlds/local-sandbox/colonize",
                      wait_until="domcontentloaded",timeout=30000)
            expect(page.get_by_role("heading",level=1,name="Fonder une nouvelle cité")).to_be_visible()
            expect(page.get_by_text("Période initiale terminée")).to_be_visible()
            options=page.locator("select[name='plot'] option")
            verified=options.filter(has_text="terrain qualifié")
            expect(verified).not_to_have_count(0)
            selected=None
            # Earlier E2E scenarios may already have founded a second or
            # third city on one of the prepared laboratory squares. Select
            # the first remaining allowed plot instead of assuming index 0.
            for item in verified.all():
                plot=item.get_attribute("value")
                if not plot or ":" not in plot:
                    continue
                page.locator("select[name='plot']").select_option(plot)
                page.get_by_role("button",name="Examiner l'emplacement").click()
                start=page.get_by_role("button",name="Engager le héros et réserver les ressources")
                if start.count() and start.is_enabled():
                    selected=plot
                    break
            assert selected, "No unoccupied operator-qualified plot remains"
            expect(page.get_by_text("registre indépendant de l'influence")).to_be_visible(timeout=15000)
            expect(start).to_be_enabled()
            page.locator('input[name="colonyName"]').fill("Territoire qualifié de la Brume")
            start.click()
            expect(page.get_by_text("Expédition enregistrée :",exact=False)).to_be_visible(timeout=25000)
            order=page.get_by_test_id("colonization-order").first
            expect(order).to_contain_text("Territoire qualifié de la Brume")
            expect(order).to_contain_text("Cité fondée et opérationnelle",timeout=120000)
            order.get_by_role("link",name="Entrer dans la cité fondée").click()
            expect(page.get_by_role("heading",level=1,
                name="Territoire qualifié de la Brume")).to_be_visible(timeout=20000)
            expect(page.locator(".resource-grid article")).to_have_count(7)
            assert not errors,errors[:5]
            print("PASS: independent operator terrain + 4-day dynamic control -> "
                  "server quote -> atomic founder order -> worker-built fourth city")
        finally:
            browser.close()


if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: qualified terrain browser:",type(exc).__name__,
              str(exc)[:800],file=sys.stderr)
        raise SystemExit(1)
