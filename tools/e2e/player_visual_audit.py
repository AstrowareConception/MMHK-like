#!/usr/bin/env python3
"""Fast *read-only* player visual audit.

Run Chromium BEFORE full gameplay mutation tests; always create screenshots
at the user's viewport resolution. Report actual bounding boxes, occupied
width, clipping, line-height and interactions that are hidden offscreen.

Images used are the public-safe variant; no restricted MMHK source art gets
published as a GitHub Actions artifact.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright, expect

BASE = os.environ["MMHK_E2E_URL"].rstrip("/")
ARTIFACTS = Path("test-output/visuals")
ARTIFACTS.mkdir(parents=True, exist_ok=True)

METRICS = """() => {
    const locate = css => document.querySelector(css);
    const rect = el => el && ({
       x: Math.round(el.getBoundingClientRect().x),
       y: Math.round(el.getBoundingClientRect().y),
       w: Math.round(el.getBoundingClientRect().width),
       h: Math.round(el.getBoundingClientRect().height),
       scrollW: el.scrollWidth, scrollH: el.scrollHeight,
       clientW: el.clientWidth, clientH: el.clientHeight
    });
    const shell = locate('#mmhk-game-viewport');
    const game = locate('.mmhk-single-hero-screen, .mmhk-military-game-screen');
    const active = locate('.mmhk-hero-active-screen, .mmhk-military-active-screen');
    const grid = locate('.mmhk-hero-screen-grid');
    const portrait = locate('.mmhk-hero-portrait');
    const slots = Array.from(document.querySelectorAll('.mmhk-equip-target'))
       .filter(el => el.getClientRects().length);
    const cards = Array.from(document.querySelectorAll('.mmhk-item'))
       .filter(el => el.getClientRects().length);
    const clippedCards = cards.filter(el => {
       const b = el.getBoundingClientRect();
       const parent = el.closest('.mmhk-equip-target, .mmhk-storage-items');
       if (!parent) return false;
       const a = parent.getBoundingClientRect();
       return b.left < a.left-2 || b.right > a.right+2 ||
         b.top < a.top-2 || b.bottom > a.bottom+2;
    }).length;
    let collisions = 0;
    for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++){
        const a=slots[i].getBoundingClientRect(),b=slots[j].getBoundingClientRect();
        if(a.right>b.left+1&&b.right>a.left+1&&a.bottom>b.top+1&&b.bottom>a.top+1)
           collisions++;
    }
    const all = Array.from(document.querySelectorAll('button,[role="button"],a'));
    const tinyControls = all.filter(el => {
        const r=el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.height < 22;
    }).length;
    return {
      viewport: {w:innerWidth,h:innerHeight},
      shell:rect(shell),screen:rect(game),active:rect(active),grid:rect(grid),
      portrait:rect(portrait),
      widthRatio:grid&&game?(grid.clientWidth/game.clientWidth):null,
      activeRatio:active&&game?(active.clientWidth/game.clientWidth):null,
      slotCollisions:collisions,clippedCards,tinyControls,
      screenshotUsedAsPortrait:portrait?.dataset.historicalPainting==='true',
      bodyScroll:getComputedStyle(document.body).overflowY,
      contentScroll:locate('.kingdom-screen-content') &&
         getComputedStyle(locate('.kingdom-screen-content')).overflowY
    };
}"""

def capture(page, filename: str):
    page.screenshot(path=str(ARTIFACTS / filename), full_page=False,
                    animations="disabled")
    metrics=page.evaluate(METRICS)
    print("VISUAL QA", filename, json.dumps(metrics,ensure_ascii=False),flush=True)
    return metrics

def assert_dimensions(metrics, screen):
    assert metrics["screen"] is not None, (screen,metrics)
    assert metrics["screen"]["w"] > 750, (screen,"game occupies too little width",metrics)
    assert metrics["screen"]["scrollH"] <= metrics["screen"]["clientH"] + 3, (
        screen,"screen would scroll or clip a full page",metrics
    )
    if screen == "inventory":
        assert metrics["widthRatio"] is not None and metrics["widthRatio"] > .97, (
            "Large empty area caused by grid",metrics)
        assert metrics["activeRatio"] is not None and metrics["activeRatio"] > .70, (
            "Hero inventory uses less than 70% of available game panel",metrics)
        assert not metrics["screenshotUsedAsPortrait"], "Archived UI screenshot used as hero face"
        assert metrics["slotCollisions"] == 0, ("Overlapping equipment slots",metrics)
        assert metrics["clippedCards"] == 0, ("Items clipped in their slots",metrics)

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={"width":1220,"height":900})
        page=context.new_page()
        page.set_default_timeout(10000)
        page.goto(BASE,wait_until="domcontentloaded",timeout=30000)
        page.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
        page.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
        page.get_by_role("button",name="Entrer dans le royaume").click()
        expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible()
        page.get_by_role("link",name="Royaume de démonstration",exact=False).click()
        page.get_by_role("link",name="Entrer en ville").first.click()
        page.get_by_role("link",name="Héros et artefacts").first.click()
        expect(page.get_by_test_id("hero-game-screen")).to_be_visible()
        tabs=page.get_by_role("tablist",name="Écrans du héros")
        for name,key in (("Inventaire","inventory"),("Formation","formation"),("Armée","army")):
            tabs.get_by_role("tab",name=name).click()
            expect(page.get_by_test_id("hero-"+key+"-screen")).to_be_visible()
            metrics=capture(page,f"PLAYER-{key}-1220x900.png")
            assert_dimensions(metrics,key)
            if key=="army":
                expect(page.get_by_text("Ce héros attend son armée")).to_be_visible()
        page.set_viewport_size({"width":1440,"height":950})
        tabs.get_by_role("tab",name="Inventaire").click()
        capture(page,"PLAYER-inventory-1440x950.png")
        page.get_by_role("link",name="Armées").first.click()
        expect(page.get_by_test_id("military-game-screen")).to_be_visible()
        military=page.get_by_role("tablist",name="Écrans militaires")
        for name,key in (("Garnison","garrison"),("Recrutement","recruitment"),("Taverne","tavern")):
            military.get_by_role("tab",name=name).click()
            expect(page.get_by_test_id("military-"+key+"-screen")).to_be_visible()
            capture(page,f"PLAYER-{key}-1440x950.png")
            if key=="garrison":
                expect(page.get_by_role("button",name="Ouvrir le recrutement")).to_be_visible()
            if key=="tavern":
                expect(page.get_by_role("link",name="Examiner le chantier de la taverne")).to_be_visible()
        print("PASS: early read-only Chromium player visual capture",flush=True)
        context.close()
        browser.close()

if __name__ == "__main__":
    main()
