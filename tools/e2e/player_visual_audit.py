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
      formationTileWidths:Array.from(document.querySelectorAll('.mmhk-formation-tile'))
        .filter(el=>el.getClientRects().length)
        .map(el=>Math.round(el.getBoundingClientRect().width)),
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
    if screen == "formation":
        assert len(metrics["formationTileWidths"]) == 7, ("Must show seven tactical slots",metrics)
        assert min(metrics["formationTileWidths"]) >= 85, (
            "The inherited 55-pixel admin columns are not acceptable game cards",metrics)
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
        expect(page.get_by_test_id("world-game-screen")).to_be_visible()
        wt=page.get_by_role("tablist",name="Écrans du monde")
        wt.get_by_role("tab",name="Carte").focus()
        page.keyboard.press("ArrowRight")
        expect(wt.get_by_role("tab",name="Mes cités")).to_have_attribute("aria-selected","true")
        page.keyboard.press("Home")
        expect(wt.get_by_role("tab",name="Carte")).to_have_attribute("aria-selected","true")
        for width,height in ((1220,900),(1440,950)):
            page.set_viewport_size({"width":width,"height":height})
            for name,key in (("Carte","map"),("Mes cités","cities"),
                             ("Influence","influence"),("Expansion","expansion")):
                wt.get_by_role("tab",name=name).click()
                expect(page.get_by_test_id("world-"+key+"-screen")).to_be_visible()
                geom=page.evaluate("""() => {
                  const outer=document.querySelector('.kingdom-screen-content');
                  const frame=document.querySelector('.mmhk-world-game-screen');
                  const panel=document.querySelector('.mmhk-world-active-screen>[role="tabpanel"]:not([hidden])');
                  const atlas=panel.querySelector('.world-atlas-interactive');
                  return {overflow:getComputedStyle(outer).overflowY,
                    outerExtra:outer.scrollHeight-outer.clientHeight,
                    frameExtra:frame.scrollHeight-frame.clientHeight,
                    panelExtra:panel.scrollHeight-panel.clientHeight,
                    width:Math.round(panel.getBoundingClientRect().width),
                    atlasHeight:atlas?Math.round(atlas.getBoundingClientRect().height):0,
                    atlasWidth:atlas?Math.round(atlas.getBoundingClientRect().width):0,
                    sidebarWidth:Math.round((panel.querySelector('.world-map-sidebar')?.getBoundingClientRect().width)||0)};
                }""")
                print("WORLD VISUAL QA",key,width,height,geom,flush=True)
                assert geom["overflow"]=="hidden" and geom["outerExtra"]<=2,(key,geom)
                assert geom["frameExtra"]<=3 and geom["panelExtra"]<=3,(key,geom)
                assert geom["width"]>=750,(key,geom)
                if key=="map":
                    assert geom["atlasHeight"]>=220,(key,geom)
                    assert geom["atlasWidth"]>=420,(key,geom)
                    assert geom["sidebarWidth"]>=240,(key,geom)
                page.screenshot(path=str(ARTIFACTS/f"WORLD-{key}-{width}x{height}.png"),
                                full_page=False,animations="disabled")
        page.set_viewport_size({"width":1220,"height":900})
        wt.get_by_role("tab",name="Mes cités").click()
        page.get_by_role("link",name="Voir la région").first.click()
        expect(page.get_by_test_id("region-game-screen")).to_be_visible()
        region_tabs=page.get_by_role("tablist",name="Écrans de la région")
        region_tabs.get_by_role("tab",name="Carte").focus()
        page.keyboard.press("ArrowRight")
        expect(region_tabs.get_by_role("tab",name="Missions")).to_have_attribute("aria-selected","true")
        page.keyboard.press("End")
        expect(region_tabs.get_by_role("tab",name="Renseignements")).to_have_attribute("aria-selected","true")
        page.keyboard.press("Home")
        expect(region_tabs.get_by_role("tab",name="Carte")).to_have_attribute("aria-selected","true")
        for width,height in ((1220,900),(1440,950)):
            page.set_viewport_size({"width":width,"height":height})
            for name,key in (("Carte","map"),("Missions","missions"),
                             ("Renseignements","intel")):
                region_tabs.get_by_role("tab",name=name).click()
                expect(page.get_by_test_id("region-"+key+"-screen")).to_be_visible()
                gm=page.evaluate("""() => {
                  const outer=document.querySelector('.kingdom-screen-content');
                  const frame=document.querySelector('.mmhk-region-game-screen');
                  const panel=document.querySelector('.mmhk-region-active-screen>[role="tabpanel"]:not([hidden])');
                  const map=panel.querySelector('svg.region-scene');
                  return {overflow:getComputedStyle(outer).overflowY,
                    outerExtra:outer.scrollHeight-outer.clientHeight,
                    frameExtra:frame.scrollHeight-frame.clientHeight,
                    panelExtra:panel.scrollHeight-panel.clientHeight,
                    width:Math.round(panel.getBoundingClientRect().width),
                    atlasHeight:map?Math.round(map.getBoundingClientRect().height):0};
                }""")
                print("REGION VISUAL QA",key,width,height,gm,flush=True)
                assert gm["overflow"]=="hidden" and gm["outerExtra"]<=2,(key,gm)
                assert gm["frameExtra"]<=3 and gm["panelExtra"]<=3,(key,gm)
                assert gm["width"]>=750,(key,gm)
                if key=="map":assert gm["atlasHeight"]>=175,(key,gm)
                page.screenshot(path=str(ARTIFACTS/f"REGION-{key}-{width}x{height}.png"),
                                full_page=False,animations="disabled")
        page.set_viewport_size({"width":1220,"height":900})
        page.get_by_role("link",name="Ouvrir la cité",exact=False).click()
        expect(page.get_by_test_id("city-game-screen")).to_be_visible()
        citytabs=page.get_by_role("tablist",name="Écrans de la cité")
        citytabs.get_by_role("tab",name="Panorama").focus()
        page.keyboard.press("ArrowRight")
        expect(citytabs.get_by_role("tab",name="Réserves")).to_have_attribute("aria-selected","true")
        page.keyboard.press("Home")
        expect(citytabs.get_by_role("tab",name="Panorama")).to_have_attribute("aria-selected","true")
        # Four exclusive city activities, each rendered at both requested sizes.
        for width,height in ((1220,900),(1440,950)):
            page.set_viewport_size({"width":width,"height":height})
            for name,key in (("Panorama","panorama"),("Réserves","reserves"),
                             ("Chantiers","construction"),("Historique","history")):
                citytabs.get_by_role("tab",name=name).click()
                expect(page.get_by_test_id("city-"+key+"-screen")).to_be_visible()
                metrics=page.evaluate("""() => {
                    const shell=document.querySelector('.kingdom-screen-content');
                    const game=document.querySelector('.mmhk-city-game-screen');
                    const panel=document.querySelector('.mmhk-city-active-screen>[role="tabpanel"]:not([hidden])');
                    const scene=document.querySelector('.city-scene-frame');
                    const inspector=document.querySelector('.mmhk-city-inspector-column');
                    const rect=x=>x?.getBoundingClientRect();
                    return {overflow:getComputedStyle(shell).overflowY,
                      shellExtra:shell.scrollHeight-shell.clientHeight,
                      gameExtra:game.scrollHeight-game.clientHeight,
                      panelExtra:panel.scrollHeight-panel.clientHeight,
                      panelWidth:Math.round(rect(panel).width),
                      sceneHeight:scene?Math.round(rect(scene).height):0,
                      svgHeight:scene?Math.round(rect(scene.querySelector('svg')).height):0,
                      sceneBottom:scene?Math.round(rect(scene).bottom):0,
                      panelBottom:Math.round(rect(panel).bottom),
                      inspectorBottom:inspector?Math.round(rect(inspector).bottom):0,
                      inspectorExtra:inspector?inspector.scrollHeight-inspector.clientHeight:0,
                      inspectorHeight:inspector?Math.round(rect(inspector).height):0};
                }""")
                print("CITY VISUAL QA",key,width,height,metrics,flush=True)
                assert metrics["overflow"]=="hidden" and metrics["shellExtra"]<=2,(key,metrics)
                assert metrics["gameExtra"]<=3 and metrics["panelExtra"]<=3,(key,metrics)
                assert metrics["panelWidth"]>=750,(key,metrics)
                if key=="panorama":
                    assert metrics["sceneHeight"]>=215,(key,metrics)
                    assert metrics["svgHeight"]<=metrics["sceneHeight"]+2,(key,metrics)
                    assert metrics["sceneBottom"]<=metrics["panelBottom"]-3,(key,metrics)
                    assert metrics["inspectorHeight"]>=200,(key,metrics)
                    assert metrics["inspectorBottom"]<=metrics["panelBottom"]-3,(key,metrics)
                page.screenshot(path=str(ARTIFACTS/f"CITY-{key}-{width}x{height}.png"),
                                full_page=False,animations="disabled")
            citytabs.get_by_role("tab",name="Panorama").click()
            page.locator(".city-plan-ribbon-list button").filter(
                has_text="Hôtel du village").click()
            inspector=page.locator("#city-inspector")
            expect(inspector).to_have_attribute("data-selected-building","village_hall")
            inspector.get_by_role("button",name="Rapide",exact=True).click()
            submit=inspector.get_by_role("button",name="Lancer le chantier")
            expect(submit).to_be_enabled()
            submit.scroll_into_view_if_needed()
            expect(submit).to_be_visible()
            page.screenshot(path=str(ARTIFACTS/f"CITY-inspector-quote-{width}x{height}.png"),
                            full_page=False,animations="disabled")
        page.set_viewport_size({"width":1220,"height":900})
        print("PASS: city panorama, reserves, construction, history and real inspector",flush=True)
        page.get_by_role("link",name="Marché",exact=True).first.click()
        expect(page.get_by_test_id("market-game-screen")).to_be_visible()
        mtabs=page.get_by_role("tablist",name="Écrans du marché")
        mtabs.get_by_role("tab",name="Marchand").focus()
        page.keyboard.press("ArrowRight")
        expect(mtabs.get_by_role("tab",name="Hôtel des ventes")).to_have_attribute("aria-selected","true")
        page.keyboard.press("Home")
        expect(mtabs.get_by_role("tab",name="Marchand")).to_have_attribute("aria-selected","true")
        for width,height in ((1220,900),(1440,950)):
            page.set_viewport_size({"width":width,"height":height})
            for name,key in (("Marchand","merchant"),("Hôtel des ventes","auctions"),
                             ("Caravanes","caravans"),("Historique","ledger")):
                mtabs.get_by_role("tab",name=name).click()
                expect(page.get_by_test_id("market-"+key+"-screen")).to_be_visible()
                measure=page.evaluate("""() => {
                  const shell=document.querySelector('.kingdom-screen-content');
                  const game=document.querySelector('.mmhk-market-game-screen');
                  const active=document.querySelector('.mmhk-market-active-screen>[role="tabpanel"]:not([hidden])');
                  const scroll=active.querySelector('.mmhk-market-scroll');
                  return {shellOverflow:getComputedStyle(shell).overflowY,
                    shellExtra:shell.scrollHeight-shell.clientHeight,
                    gameExtra:game.scrollHeight-game.clientHeight,
                    panelExtra:active.scrollHeight-active.clientHeight,
                    width:Math.round(active.getBoundingClientRect().width),
                    scrollArea:scroll.clientHeight,
                    scrollHeight:scroll.scrollHeight};
                }""")
                print("MARKET VISUAL QA",key,width,height,measure,flush=True)
                assert measure["shellOverflow"]=="hidden" and measure["shellExtra"]<=2,(key,measure)
                assert measure["gameExtra"]<=3 and measure["panelExtra"]<=3,(key,measure)
                assert measure["width"]>=750 and measure["scrollArea"]>=180,(key,measure)
                page.screenshot(path=str(ARTIFACTS/f"MARKET-{key}-{width}x{height}.png"),
                                full_page=False,animations="disabled")
        mtabs.get_by_role("tab",name="Hôtel des ventes").click()
        page.locator('.marketplace-heading a[href="#market-ledger"]').click()
        expect(mtabs.get_by_role("tab",name="Historique")).to_have_attribute("aria-selected","true")
        expect(page.locator(".mmhk-market-history-empty")).to_be_visible()
        page.get_by_role("link",name="Consulter le comptoir du marchand").click()
        expect(mtabs.get_by_role("tab",name="Marchand")).to_have_attribute("aria-selected","true")
        page.get_by_role("link",name="Entrer en ville").first.click()
        page.set_viewport_size({"width":1220,"height":900})
        page.get_by_role("link",name="Héros et artefacts").first.click()
        expect(page.get_by_test_id("hero-game-screen")).to_be_visible()
        tabs=page.get_by_role("tablist",name="Écrans du héros")
        # The fixed activity tabs must behave like accessible game tabs.
        tabs.get_by_role("tab",name="Inventaire").focus()
        page.keyboard.press("ArrowRight")
        expect(tabs.get_by_role("tab",name="Formation")).to_have_attribute("aria-selected","true")
        page.keyboard.press("Home")
        expect(tabs.get_by_role("tab",name="Inventaire")).to_have_attribute("aria-selected","true")
        for name,key in (("Inventaire","inventory"),("Formation","formation"),("Armée","army")):
            tabs.get_by_role("tab",name=name).click()
            expect(page.get_by_test_id("hero-"+key+"-screen")).to_be_visible()
            metrics=capture(page,f"PLAYER-{key}-1220x900.png")
            assert_dimensions(metrics,key)
            if key=="army":
                expect(page.get_by_text("Ce héros attend son armée")).to_be_visible()
        page.set_viewport_size({"width":1440,"height":950})
        for name,key in (("Inventaire","inventory"),("Formation","formation"),("Armée","army")):
            tabs.get_by_role("tab",name=name).click()
            expect(page.get_by_test_id("hero-"+key+"-screen")).to_be_visible()
            metrics=capture(page,f"PLAYER-{key}-1440x950.png")
            assert_dimensions(metrics,key)
        page.get_by_role("link",name="Armées").first.click()
        expect(page.get_by_test_id("military-game-screen")).to_be_visible()
        military=page.get_by_role("tablist",name="Écrans militaires")
        military.get_by_role("tab",name="Garnison").focus()
        page.keyboard.press("End")
        expect(military.get_by_role("tab",name="Taverne")).to_have_attribute("aria-selected","true")
        page.keyboard.press("Home")
        expect(military.get_by_role("tab",name="Garnison")).to_have_attribute("aria-selected","true")
        for name,key in (("Garnison","garrison"),("Recrutement","recruitment"),("Taverne","tavern")):
            military.get_by_role("tab",name=name).click()
            expect(page.get_by_test_id("military-"+key+"-screen")).to_be_visible()
            metrics=capture(page,f"PLAYER-{key}-1440x950.png")
            assert_dimensions(metrics,key)
            if key=="garrison":
                to_recruit=page.get_by_role("button",name="Ouvrir le recrutement")
                expect(to_recruit).to_be_visible()
                to_recruit.click()
                expect(page.get_by_test_id("military-recruitment-screen")).to_be_visible()
                military.get_by_role("tab",name="Garnison").click()
                expect(page.get_by_test_id("military-garrison-screen")).to_be_visible()
            if key=="tavern":
                expect(page.get_by_role("link",name="Examiner le chantier de la taverne")).to_be_visible()
        page.set_viewport_size({"width":1220,"height":900})
        for name,key in (("Garnison","garrison"),("Recrutement","recruitment"),("Taverne","tavern")):
            military.get_by_role("tab",name=name).click()
            expect(page.get_by_test_id("military-"+key+"-screen")).to_be_visible()
            metrics=capture(page,f"PLAYER-{key}-1220x900.png")
            assert_dimensions(metrics,key)
        print("PASS: 44 Chromium screens (world, region, city, market, heroes, military) at both resolutions",flush=True)
        context.close()
        browser.close()

if __name__ == "__main__":
    main()
