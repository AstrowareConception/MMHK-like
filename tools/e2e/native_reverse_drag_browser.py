#!/usr/bin/env python3
"""Isolated first native reverse artefact drag (equipped slot -> hero bag).

Playwright/Chromium used to freeze on a SECOND native drag in a shared
context. This independent test equips by an accessible click, and then
performs the FIRST native HTML drag in a brand-new browser session.
An external CI timeout makes a real browser hang fail visibly.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from playwright.sync_api import expect,sync_playwright

BASE=os.environ["MMHK_E2E_URL"].rstrip("/")
ART=Path("test-output/visuals")
ART.mkdir(parents=True,exist_ok=True)

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        page=browser.new_page(viewport={"width":1220,"height":900})
        page.set_default_timeout(15000)
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        try:
            page.goto(BASE,wait_until="domcontentloaded",timeout=30000)
            page.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
            page.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
            page.get_by_role("button",name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible()
            page.get_by_role("link",name=re.compile("Royaume de démonstration")).click()
            page.get_by_role("tablist",name="Écrans du monde").get_by_role(
                "tab",name="Mes cités").click()
            page.get_by_role("link",name="Entrer en ville").first.click()
            page.get_by_role("link",name="Héros et artefacts").first.click()

            board=page.get_by_test_id("hero-equipment-board")
            expect(board).to_have_attribute("data-ready","true",timeout=15000)
            bag=page.locator("#hero-bag")
            helm=bag.locator(".artifact-card").filter(has_text="Heaume de bronze")
            head=page.locator('[data-testid="equipment-drop-zone"][data-slot="head"]')
            expect(helm).to_be_visible()
            expect(head.locator(".artifact-card")).to_have_count(0)
            # Equip by click: reserve the FIRST Chromium native drag for
            # the historically unreliable reverse direction.
            helm.click()
            expect(page.locator(".mmhk-selection-hint")).to_contain_text("Heaume de bronze")
            head.click()
            equipped=head.locator(".artifact-card").filter(has_text="Heaume de bronze")
            expect(equipped).to_be_visible(timeout=15000)
            page.screenshot(path=str(ART/"NATIVE-REVERSE-before-1220x900.png"),
                full_page=False,animations="disabled")
            # Trace event types only; never include session details, tokens
            # or API payloads in artifacts/logs.
            page.evaluate("""() => {
                window.__reverseDragTrace=[];
                for(const type of ['dragstart','dragenter','dragover','drop','dragend']){
                  document.addEventListener(type,event=>{
                    const trace=window.__reverseDragTrace;
                    if(trace.length<80)trace.push({
                      type,
                      role:event.target?.closest?.('#hero-bag')?'bag':
                        event.target?.closest?.('[data-slot="head"]')?'head':'other',
                      mime:Array.from(event.dataTransfer?.types??[])
                    });
                  },true);
                }
            }""")
            print("NATIVE REVERSE: first native gesture equipped helm -> bag",flush=True)
            # Drive actual browser pointer input rather than Playwright's
            # high-level drag_to; no synthetic HTML DragEvent is created.
            source=equipped.bounding_box()
            destination=bag.bounding_box()
            assert source and destination
            sx=source["x"]+source["width"]/2
            sy=source["y"]+source["height"]/2
            tx=destination["x"]+destination["width"]/2
            ty=destination["y"]+min(42,destination["height"]/2)
            print("NATIVE REVERSE: mouse move to source",flush=True)
            page.mouse.move(sx,sy)
            print("NATIVE REVERSE: mouse down",flush=True)
            page.mouse.down()
            print("NATIVE REVERSE: mouse movement across the game board",flush=True)
            page.mouse.move((sx+tx)/2,(sy+ty)/2,steps=8)
            print("NATIVE REVERSE: mouse movement to bag",flush=True)
            page.mouse.move(tx,ty,steps=10)
            print("NATIVE REVERSE: mouse up",flush=True)
            page.mouse.up()
            print("NATIVE REVERSE: wait for actual server persistence",flush=True)
            expect(head.locator(".artifact-card")).to_have_count(0,timeout=15000)
            expect(bag.locator(".artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible()
            page.screenshot(path=str(ART/"NATIVE-REVERSE-after-1220x900.png"),
                full_page=False,animations="disabled")
            print("NATIVE REVERSE EVENTS:",page.evaluate(
                "() => window.__reverseDragTrace"),flush=True)
            page.reload(wait_until="domcontentloaded")
            expect(page.locator("#hero-bag .artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible(timeout=15000)
            expect(page.locator('[data-slot="head"] .artifact-card')).to_have_count(0)
            assert not errors,errors[:3]
            print("PASS: FIRST native mouse reverse drag equipped -> bag, DB persistence verified",
                  flush=True)
        finally:
            browser.close()

if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: independent native reverse drag",type(exc).__name__,
              str(exc)[:850],file=sys.stderr,flush=True)
        raise SystemExit(1)
