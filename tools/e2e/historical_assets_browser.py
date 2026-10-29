#!/usr/bin/env python3
"""Verify Jactari's MMHK sprite sheets in the authenticated local theme.

No screenshots of copyright-restricted original art are ever generated.
The route must refuse unauthenticated requests and remain loopback-only.
"""
from __future__ import annotations
import os
import re
from playwright.sync_api import sync_playwright, expect

def main() -> None:
    root = os.environ["MMHK_E2E_URL"].rstrip("/")
    user = os.environ["MMHK_E2E_USERNAME"]
    password = os.environ["MMHK_E2E_PASSWORD"]
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        anonymous = browser.new_context()
        for key in ("hero.sheet.haven","army.sheet.haven"):
            result = anonymous.request.get(root+"/api/theme-assets/"+key)
            assert result.status == 404, (key,result.status)
        anonymous.close()
        page = browser.new_page(viewport={"width":1300,"height":900})
        page.goto(root,wait_until="domcontentloaded")
        page.get_by_label("Identifiant").fill(user)
        page.get_by_label("Mot de passe").fill(password)
        page.get_by_role("button",name="Entrer dans le royaume").click()
        expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(timeout=20000)
        for key in ("hero.sheet.haven","hero.sheet.academy",
                    "hero.sheet.inferno","hero.sheet.necropolis",
                    "hero.sheet.sylvan","army.sheet.haven"):
            res = page.request.get(root+"/api/theme-assets/"+key)
            assert res.status == 200, (key,res.status)
            assert res.headers.get("content-type","").startswith("image/jpeg"),key
            assert res.body()[:3] == bytes((0xff,0xd8,0xff)),key
            assert res.headers.get("cache-control") == "private, no-store"
        page.get_by_role("link",name=re.compile("Royaume de démonstration")).click()
        page.get_by_role("link",name="Entrer en ville").first.click()
        page.get_by_role("link",name="Héros et artefacts").first.click()
        board=page.get_by_test_id("heritage-heroes")
        expect(board).to_be_visible(timeout=20000)
        face=board.locator(".heritage-portrait-sprite").first
        expect(face).to_be_visible()
        assert "/api/theme-assets/hero.sheet.haven" in face.get_attribute("style")
        print("PASS: five MMHK portrait sheets, Haven units, hero UI and private access",flush=True)
        browser.close()

if __name__ == "__main__":
    main()
