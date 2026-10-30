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
        page=browser.new_page(viewport={"width":1220,"height":900})
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
            # The shared game UI components render real navigation and a
            # readable hero summary without fictitious Talent/Spell screens.
            tabs=page.get_by_role("tablist",name="Écrans du héros")
            expect(tabs).to_be_visible()
            expect(tabs.get_by_role("tab",name="Inventaire")).to_have_attribute("aria-selected","true")
            expect(page.get_by_test_id("hero-inventory-screen")).to_be_visible()
            expect(page.get_by_test_id("hero-formation-screen")).to_be_hidden()
            # Visual regression gate at the same 1220x900 viewport as the
            # player's supplied screenshots. Detect large blank content
            # regions, clipped slots, overlapping assets and the old mistake
            # of using screenshots of MMHK UI as character portraits.
            layout=page.evaluate("""() => {
              const rect=selector=>document.querySelector(selector)?.getBoundingClientRect();
              const outer=rect('.mmhk-single-hero-screen');
              const grid=rect('.mmhk-hero-screen-grid');
              const workspace=rect('.mmhk-hero-active-screen');
              const portrait=document.querySelector('.mmhk-hero-portrait');
              const targets=Array.from(document.querySelectorAll('.mmhk-equip-target'));
              const boxes=targets.map(x=>x.getBoundingClientRect());
              const inside=targets.every(t=>{
                const a=t.getBoundingClientRect();
                return Array.from(t.querySelectorAll('.mmhk-item')).every(item=>{
                  const b=item.getBoundingClientRect();
                  return b.left>=a.left-1 && b.right<=a.right+1 &&
                         b.top>=a.top-1 && b.bottom<=a.bottom+1;
                });
              });
              let overlaps=0;
              for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
                const a=boxes[i],b=boxes[j];
                if(a.right>b.left+2&&b.right>a.left+2&&
                   a.bottom>b.top+2&&b.bottom>a.top+2)overlaps++;
              }
              return {outerWidth:outer?.width,gridWidth:grid?.width,
                workspaceWidth:workspace?.width,ratio:grid?.width/outer?.width,
                workRatio:workspace?.width/outer?.width,
                overlaps,inside,
                screenshotPortrait:portrait?.dataset.historicalPainting==="true"};
            }""")
            print("HERO VISUAL GEOMETRY 1220x900:",layout,flush=True)
            assert layout["ratio"]>=0.97, "Hero workspace leaves a giant empty side region"
            assert layout["workRatio"]>=0.72, "Interactive hero panel is too narrow"
            assert layout["overlaps"]==0, "Equipment slots overlap each other"
            assert layout["inside"], "Artefact tile overflows or overlaps its equipment slot"
            assert not layout["screenshotPortrait"], "A historic interface screenshot is NOT a hero portrait"
            page.screenshot(path="test-output/visuals/hero-inventory-1220x900.png",
                            full_page=False)
            expect(page.get_by_test_id("hero-formation-screen")).to_be_hidden()
            tabs.get_by_role("tab",name="Formation").click()
            expect(page.get_by_test_id("hero-formation-screen")).to_be_visible()
            assert page.evaluate("""() => {
              const screen=document.querySelector('[data-testid="hero-formation-screen"]');
              return screen.scrollHeight<=screen.clientHeight+2;
            }"""), "Formation screen overflow: whole panels may not scroll"
            page.screenshot(path="test-output/visuals/hero-formation-1220x900.png",full_page=False)
            expect(page.get_by_test_id("hero-inventory-screen")).to_be_hidden()
            tabs.get_by_role("tab",name="Armée").click()
            expect(page.get_by_test_id("hero-army-screen")).to_be_visible()
            expect(page.locator(".gui-panel#hero-army")).to_be_visible()
            assert page.evaluate("""() => {
              const screen=document.querySelector('[data-testid="hero-army-screen"]');
              return screen.scrollHeight<=screen.clientHeight+2;
            }"""), "Army screen overflow: only unit listings should scroll"
            tabs.get_by_role("tab",name="Inventaire").click()
            expect(page.get_by_test_id("hero-inventory-screen")).to_be_visible()
            page.set_viewport_size({"width":1440,"height":950})
            page.screenshot(path="test-output/visuals/hero-inventory-1440x950.png",
                            full_page=False)
            # A game screen must fit within the viewport and not rely on a
            # page-long scroll to reach its principal command.
            assert page.evaluate("""() => {
              const screen=document.querySelector('.mmhk-single-hero-screen');
              const viewport=document.querySelector('.kingdom-screen-content');
              return screen.scrollHeight<=screen.clientHeight+2 &&
                getComputedStyle(viewport).overflowY==='hidden';
            }"""), "The game must not be a long page nested inside a viewport"
            # A quiet demo has no pending orders: its chronicle must occupy
            # only one compact bar rather than a large empty game header.
            timeline=page.locator(".kingdom-timeline")
            if "Aucune échéance annoncée" in timeline.inner_text():
                expect(timeline).to_have_class(re.compile(r"kingdom-timeline--quiet"))
                expect(timeline.locator(".timeline-track")).to_be_hidden()
            expect(board).to_have_attribute("data-ready","true",timeout=15000)
            # The stage is fixed AND the current screen does not scroll.
            # Only hero/item lists are independently scrollable.
            controls=page.get_by_test_id("game-viewport-controls")
            expect(controls).to_be_visible()
            screen=page.locator(".kingdom-screen-content")
            assert page.evaluate("""() =>
                getComputedStyle(document.querySelector('.kingdom-screen-content')).overflowY
            """) == "hidden"
            assert page.evaluate("""() => {
                const panel=document.querySelector('.mmhk-single-hero-screen');
                return panel.scrollHeight<=panel.clientHeight+2;
            }"""), "Entire hero screen must fit without vertical scrolling"
            assert page.evaluate("""() => {
                const board=document.querySelector('#hero-equipment');
                return board.scrollHeight<=board.clientHeight+2;
            }"""), "Equipment must fit in a screen, never become a long article"
            assert page.evaluate("""() => {
                const shell=document.querySelector('#mmhk-game-viewport');
                return shell.getBoundingClientRect().height <= innerHeight;
            }""")
            controls.get_by_role("button",name="Compact").click()
            expect(page.locator("#mmhk-game-viewport")).to_have_attribute("data-game-density","compact")
            controls.get_by_role("button",name="Normal").click()
            expect(page.locator("#mmhk-game-viewport")).to_have_attribute("data-game-density","comfortable")
            bag=page.locator("#hero-bag .artifact-card").filter(has_text="Heaume de bronze")
            slot=page.locator('[data-testid="equipment-drop-zone"][data-slot="head"]')
            expect(bag).to_be_visible()
            page.screenshot(path="test-output/visuals/hero-before-drag.png",full_page=True)
            page.evaluate("""() => {
              window.__mmhkDragTrace = [];
              for (const type of ['dragstart','dragenter','dragover','drop','dragend','pointerdown','pointerup','click']) {
                document.addEventListener(type, event => {
                  const element=event.target;
                  if(window.__mmhkDragTrace.length < 100)
                    window.__mmhkDragTrace.push({
                      type,cls:String(element?.className??'').slice(0,120),
                      tag:element?.tagName,
                      target:element?.closest?.('[data-slot]')?.dataset.slot,
                      kinds:event.dataTransfer?.types?Array.from(event.dataTransfer.types):[]
                    });
                },true);
              }
            }""")
            post_requests=[]
            page.on("request",lambda req:post_requests.append(req.url) if req.method=="POST" else None)
            # A selected object must not move if the user drops unrelated
            # text or a file on the slot. Only the game's MIME is accepted.
            bag.click()
            expect(page.locator(".mmhk-selection-hint")).to_contain_text("Heaume de bronze")
            page.evaluate("""() => {
              const target=document.querySelector('[data-testid="equipment-drop-zone"][data-slot="head"]');
              const foreign=new DataTransfer();
              foreign.setData('text/plain','outside-the-game');
              target.dispatchEvent(new DragEvent('drop',{
                bubbles:true,cancelable:true,dataTransfer:foreign
              }));
            }""")
            expect(page.locator(".equipment-slot.filled")).to_have_count(0)
            bag.drag_to(slot)
            page.screenshot(path="test-output/visuals/hero-after-drag.png",full_page=True)
            print("EQUIP DEBUG",{
                "url":page.url,"selection":page.locator(".mmhk-selection-hint").all_text_contents(),
                "error":page.locator(".mmhk-equipment .error").all_text_contents(),
                "slots":page.locator(".equipment-slot.filled").count(),
                "bag":page.locator("#hero-bag .artifact-card").count(),
                "trace":page.evaluate("window.__mmhkDragTrace"),
                "post_requests":post_requests
            },flush=True)
            try:
                expect(page.get_by_text("Artefact déplacé : équipement mis à jour.")).to_be_visible(timeout=8000)
            except AssertionError:
                print("CLICK-FALLBACK CHECK: attempting selection + target",flush=True)
                still=page.locator("#hero-bag .artifact-card").filter(has_text="Heaume de bronze")
                if still.count():
                    still.click()
                    print("CLICK SELECTED",page.locator(".mmhk-selection-hint").all_text_contents(),flush=True)
                    slot.click()
                    try:
                        expect(page.get_by_text("Artefact déplacé : équipement mis à jour.")).to_be_visible(timeout=8000)
                        print("CLICK FALLBACK SUCCEEDED, NATIVE DRAG DID NOT",flush=True)
                    except AssertionError:
                        print("CLICK FALLBACK ALSO FAILED",
                            "url",page.url,
                            "errors",page.locator(".mmhk-equipment .error").all_text_contents(),
                            flush=True)
                raise AssertionError("Native artifact drag did not submit a real server order")
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
