#!/usr/bin/env python3
"""Fast browser regression for the GAME UI, before lengthy mission tests.

Equips one real helm, verifies PostgreSQL-backed state after navigation,
then unequips it to restore the original demo for the full gameplay run.
"""
from __future__ import annotations
import os
import re
import sys
from playwright.sync_api import sync_playwright,expect

def main():
    root=os.environ["MMHK_E2E_URL"].rstrip("/")
    username=os.environ["MMHK_E2E_USERNAME"]
    password=os.environ["MMHK_E2E_PASSWORD"]
    os.makedirs("test-output/visuals",exist_ok=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        page=browser.new_page(viewport={"width":1440,"height":950})
        failures=[]
        page.on("pageerror",lambda e:failures.append(str(e)))
        try:
            page.goto(root,wait_until="domcontentloaded",timeout=30000)
            page.get_by_label("Identifiant").fill(username)
            page.get_by_label("Mot de passe").fill(password)
            page.get_by_role("button",name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(timeout=20000)
            page.get_by_role("link",name=re.compile("Royaume de démonstration")).click()
            page.get_by_role("link",name="Entrer en ville").first.click()
            page.get_by_role("link",name="Héros et artefacts").first.click()
            board=page.get_by_test_id("hero-equipment-board")
            expect(board).to_be_visible()
            expect(board).to_have_attribute("data-ready","true",timeout=15000)
            bag=page.locator("#hero-bag .artifact-card").filter(has_text="Heaume de bronze")
            slot=page.locator('[data-testid="equipment-drop-zone"][data-slot="head"]')
            expect(bag).to_be_visible()
            page.screenshot(path="test-output/visuals/hero-before-drag.png",full_page=True)
            bag.drag_to(slot)
            page.screenshot(path="test-output/visuals/hero-after-drag.png",full_page=True)
            print("EQUIP DEBUG",{
                "url":page.url,"selection":page.locator(".mmhk-selection-hint").all_text_contents(),
                "error":page.locator(".mmhk-equipment .error").all_text_contents(),
                "slots":page.locator(".equipment-slot.filled").count(),
                "bag":page.locator("#hero-bag .artifact-card").count()
            },flush=True)
            expect(page.get_by_text("Artefact déplacé : les inventaires ont été mis à jour.")).to_be_visible(timeout=15000)
            expect(page.locator(".equipment-slot.filled")).to_have_count(1)
            equipped=page.locator('.mmhk-equip-target[data-slot="head"] .artifact-card')
            expect(equipped).to_be_visible()
            equipped.drag_to(page.locator("#hero-bag"))
            expect(page.locator(".equipment-slot.filled")).to_have_count(0,timeout=20000)
            expect(page.locator("#hero-bag .artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible()
            assert not failures,failures[:3]
            print("PASS: helmet drag -> server equip -> drag back -> server unequip",flush=True)
        finally:
            browser.close()

if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: visual drag smoke:",type(exc).__name__,
              str(exc)[:750],file=sys.stderr,flush=True)
        raise SystemExit(1)
