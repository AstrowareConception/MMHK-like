#!/usr/bin/env python3
"""End-to-end measured influence map (explicit lab fixture, never Ubisoft S2)."""
from __future__ import annotations

import os
import re
import sys
import time
from playwright.sync_api import sync_playwright,expect


def main():
    root=os.environ["MMHK_E2E_URL"].rstrip("/")
    user=os.environ["MMHK_E2E_USERNAME"]
    secret=os.environ["MMHK_E2E_PASSWORD"]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        page=browser.new_page(viewport={"width":1366,"height":900})
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        try:
            page.goto(root,wait_until="domcontentloaded",timeout=30000)
            page.get_by_label("Identifiant").fill(user)
            page.get_by_label("Mot de passe").fill(secret)
            page.get_by_role("button",name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(timeout=20000)
            page.get_by_role("link",name=re.compile("Royaume de démonstration")).click()
            section=page.get_by_role("region",name="Rayons d'influence territoriale")
            expect(section).to_be_visible(timeout=16000)
            # A worker cycle, never a client-calculated counter, will publish
            # a revision after the trusted four-day lab samples are seeded.
            for attempt in range(18):
                if "révision n° 1" in section.inner_text():
                    break
                time.sleep(2)
                page.reload(wait_until="domcontentloaded")
                section=page.get_by_role("region",name="Rayons d'influence territoriale")
            expect(section).to_contain_text("révision n° 1",timeout=15000)
            expect(section).to_contain_text("moyenne militaire sur 4 jours")
            expect(section).to_contain_text("Rayon 2 case(s)")
            expect(section).to_contain_text("LAB-FOUR-DAY-INVERSE-SQUARE-V1")
            # Only owner-visible computed cells, no guessed enemy discovery.
            assert page.locator('[data-world-influence]').count()>0
            assert not errors,errors[:5]
            print("PASS: operator 4-day snapshots -> worker revision -> "
                  "private toroidal influence -> browser radius and provenance")
        finally:
            browser.close()


if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: dynamic influence browser:",type(exc).__name__,
              str(exc)[:800],file=sys.stderr)
        raise SystemExit(1)
