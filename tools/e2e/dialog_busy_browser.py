#!/usr/bin/env python3
"""Chromium integration regression for the REAL GameDialog busy property.

Runs against a CI-only, localhost-guarded React fixture; no game mutations.
Opening busy: no enabled controls, Tab/Shift+Tab, Escape, backdrop and
programmatic background focus. Busy transitions: disabled focused button,
unlock and return-to-opener after dismissal.
"""
from __future__ import annotations

import os
from pathlib import Path
from playwright.sync_api import expect,sync_playwright

ROOT=os.environ["MMHK_E2E_URL"].rstrip("/")
OUT=Path("test-output/visuals")
OUT.mkdir(parents=True,exist_ok=True)

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        page=browser.new_page(viewport={"width":390,"height":844})
        page.set_default_timeout(12000)
        errors=[]
        page.on("pageerror",lambda err:errors.append(str(err)))
        page.goto(ROOT+"/__qa/dialog",wait_until="domcontentloaded",timeout=30000)
        expect(page.get_by_role("heading",name="Recette locale des fenêtres")).to_be_visible()
        opener=page.get_by_test_id("qa-open-busy")
        opener.click()
        modal=page.get_by_test_id("qa-busy-dialog")
        expect(modal).to_be_visible()
        expect(modal).to_have_attribute("role","dialog")
        expect(modal).to_have_attribute("aria-modal","true")
        expect(modal).to_have_attribute("aria-busy","true")
        expect(modal).to_be_focused()
        close=modal.get_by_role("button",name="Fermer la fenêtre",include_hidden=True)
        expect(close).to_be_disabled()
        assert page.evaluate("document.body.style.overflow")=="hidden"
        page.screenshot(path=str(OUT/"DIALOG-busy-390x844.png"),
                        full_page=False,animations="disabled")
        for key in ("Tab","Shift+Tab","Escape"):
            page.keyboard.press(key)
            expect(modal).to_be_focused()
            expect(modal).to_be_visible()
        overlay=page.get_by_test_id("qa-busy-dialog-overlay")
        overlay.click(position={"x":3,"y":3})
        expect(modal).to_be_visible()
        # Even explicit external focus() must not bypass aria-modal.
        opener.focus()
        expect(modal).to_be_focused()
        expect(page.get_by_test_id("qa-close-count")).to_have_text("Fermetures : 0")
        page.evaluate("window.dispatchEvent(new Event('mmhk-qa-release-dialog'))")
        expect(modal).to_have_attribute("aria-busy","false")
        expect(close).to_be_enabled()
        expect(close).to_be_focused()
        page.keyboard.press("Escape")
        expect(modal).to_have_count(0)
        expect(opener).to_be_focused()
        assert page.evaluate("document.body.style.overflow")!="hidden"
        expect(page.get_by_test_id("qa-close-count")).to_have_text("Fermetures : 1")

        page.set_viewport_size({"width":1220,"height":900})
        ready=page.get_by_test_id("qa-open-transition")
        ready.click()
        modal=page.get_by_test_id("qa-busy-dialog")
        expect(modal).to_be_visible()
        close=modal.get_by_role("button",name="Fermer la fenêtre")
        expect(close).to_be_focused()
        modal.get_by_role("button",name="Commencer le traitement").click()
        expect(modal).to_have_attribute("aria-busy","true")
        expect(modal.get_by_role("button",name="Commencer le traitement",
                                 include_hidden=True)).to_be_disabled()
        expect(close).to_be_disabled()
        expect(modal).to_be_focused()
        page.keyboard.press("Tab")
        expect(modal).to_be_focused()
        page.screenshot(path=str(OUT/"DIALOG-busy-1220x900.png"),
                        full_page=False,animations="disabled")
        page.evaluate("window.dispatchEvent(new Event('mmhk-qa-release-dialog'))")
        expect(modal).to_have_attribute("aria-busy","false")
        expect(close).to_be_focused()
        page.get_by_test_id("qa-busy-dialog-overlay").click(position={"x":3,"y":3})
        expect(modal).to_have_count(0)
        expect(ready).to_be_focused()
        expect(page.get_by_test_id("qa-close-count")).to_have_text("Fermetures : 2")
        assert not errors,errors[:3]
        browser.close()
        print("PASS: busy GameDialog opens keyboard-safe without controls, "
              "blocks Escape/backdrop, recaptures background focus, "
              "unlocks, closes once and restores opener on mobile/desktop")

if __name__=="__main__":
    main()
