#!/usr/bin/env python3
"""Cross-breakpoint game UI audit on authenticated, server-backed demo screens.

The existing 50 screen matrix covers 1220x900 and 1440x950. This audit
covers compact desktop, breakpoint-width tablet and narrow mobile views,
using the PUBLIC-SAFE theme only; it never uploads recovered private art.
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=os.environ["MMHK_E2E_URL"].rstrip("/")
OUT=Path("test-output/visuals")
OUT.mkdir(parents=True,exist_ok=True)

METRICS="""() => {
  const active=document.querySelector(
    '.mmhk-world-active-screen>[role="tabpanel"]:not([hidden]),'+
    '.mmhk-city-active-screen>[role="tabpanel"]:not([hidden]),'+
    '.mmhk-market-active-screen>[role="tabpanel"]:not([hidden]),'+
    '.mmhk-region-active-screen>[role="tabpanel"]:not([hidden]),'+
    '.mmhk-hero-active-screen>[role="tabpanel"]:not([hidden]),'+
    '.mmhk-military-active-screen>[role="tabpanel"]:not([hidden]),'+
    '.mmhk-colony-active-screen>[role="tabpanel"]:not([hidden])');
  const frame=document.querySelector('#mmhk-game-viewport');
  const content=document.querySelector('.kingdom-screen-content');
  const tabs=Array.from(document.querySelectorAll('[role="tab"][aria-selected="true"]'));
  const r=active?.getBoundingClientRect();
  return {viewport:{w:innerWidth,h:innerHeight},
    documentWidth:document.documentElement.scrollWidth,
    bodyWidth:document.body.scrollWidth,
    horizontalOverflow:Math.max(document.documentElement.scrollWidth,
      document.body.scrollWidth)-innerWidth,
    frameWidth:Math.round(frame?.getBoundingClientRect().width??0),
    panelWidth:Math.round(r?.width??0),
    panelLeft:Math.round(r?.left??0),
    panelRight:Math.round(r?.right??0),
    contentOverflow:content?getComputedStyle(content).overflowY:"missing",
    contentExtra:content?(content.scrollHeight-content.clientHeight):null,
    selectedTabs:tabs.length
  };
}"""

def record(page,screen,width,height,failures):
    expect(page.get_by_test_id(screen)).to_be_visible()
    image=OUT/f"RESPONSIVE-{screen}-{width}x{height}.png"
    page.screenshot(path=str(image),full_page=False,animations="disabled")
    m=page.evaluate(METRICS)
    print("RESPONSIVE QA",screen,json.dumps(m,ensure_ascii=False),flush=True)
    if m["horizontalOverflow"]>4:
        failures.append((screen,width,height,"horizontal scroll",m))
    if m["frameWidth"]>width+3 or m["frameWidth"]<min(width-35,400):
        failures.append((screen,width,height,"wrong game frame width",m))
    if m["panelWidth"]>width+3 or m["panelRight"]>width+4:
        failures.append((screen,width,height,"active panel clipped horizontally",m))
    if width>=901 and (m["contentOverflow"]!="hidden" or (m["contentExtra"] or 0)>4):
        failures.append((screen,width,height,"desktop game has global scroll",m))
    if m["selectedTabs"]!=1:
        failures.append((screen,width,height,"ambiguous selected game activity",m))

def main():
    errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={"width":1024,"height":768})
        page=context.new_page()
        page.set_default_timeout(12000)
        page.goto(ROOT,wait_until="domcontentloaded",timeout=30000)
        page.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
        page.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
        page.get_by_role("button",name="Entrer dans le royaume").click()
        expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible()

        for width,height in ((1024,768),(900,800),(390,844)):
            page.set_viewport_size({"width":width,"height":height})
            page.goto(ROOT+"/worlds/local-sandbox",wait_until="domcontentloaded")
            expect(page.get_by_test_id("world-game-screen")).to_be_visible()
            record(page,"world-map-screen",width,height,errors)
            page.get_by_role("tablist",name="Écrans du monde").get_by_role("tab",name="Mes cités").click()
            record(page,"world-cities-screen",width,height,errors)
            page.get_by_role("link",name="Entrer en ville").first.click()
            record(page,"city-panorama-screen",width,height,errors)
            page.get_by_role("tablist",name="Écrans de la cité").get_by_role("tab",name="Chantiers").click()
            record(page,"city-construction-screen",width,height,errors)
            page.get_by_role("link",name="Héros et artefacts").first.click()
            record(page,"hero-inventory-screen",width,height,errors)
            page.get_by_role("link",name="Armées").first.click()
            record(page,"military-garrison-screen",width,height,errors)
            page.locator('.kingdom-navbar a[href$="/market"]').first.click()
            record(page,"market-merchant-screen",width,height,errors)
            page.get_by_role("link",name="Ma région").first.click()
            record(page,"region-map-screen",width,height,errors)
            page.goto(ROOT+"/worlds/local-sandbox/colonize",wait_until="domcontentloaded")
            record(page,"colony-rights-screen",width,height,errors)
            print("RESPONSIVE MILESTONE",width,height,"9 real scenes captured",flush=True)
        context.close()
        browser.close()
    if errors:
        print("RESPONSIVE FAILURES:",json.dumps(errors,ensure_ascii=False),flush=True)
        raise AssertionError(f"{len(errors)} breakpoint layout failure(s)")
    print("PASS: 27 desktop, tablet and mobile screenshots; no horizontal overflow",flush=True)

if __name__=="__main__":
    main()
