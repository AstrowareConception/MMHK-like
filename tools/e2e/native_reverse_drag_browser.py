#!/usr/bin/env python3
"""Real pointer reverse gesture (equipped slot -> bag), no synthetic drag.

Reproduction: Chromium freezes even on the FIRST native reverse drag in a
fresh context. Equipped items use pointerdown/move/up to reach the actual
bag target; ordinary bag -> equipped still uses certified native HTML DnD.
The server must persist the reverse operation before the test can pass.
"""
from __future__ import annotations

import os
import re
import sys
import time
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
            # Equip by click; the reverse movement must be a genuine mouse
            # gesture rather than a native HTML drag from this nested slot.
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
                for(const type of ['dragstart','dragenter','dragover','drop','dragend','pointerdown','pointerup']){
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
            assert equipped.get_attribute("draggable")=="false",(
                "equipped drag must use the pointer path, not frozen native HTML DnD")
            print("POINTER REVERSE: equipped helm -> bag, genuine mouse gesture",flush=True)
            # Drive actual Chromium pointer input; do not dispatch a
            # synthetic DragEvent or fake a click to cover the reverse.
            source=equipped.bounding_box()
            destination=bag.bounding_box()
            assert source and destination
            sx=source["x"]+source["width"]/2
            sy=source["y"]+source["height"]/2
            tx=destination["x"]+destination["width"]/2
            ty=destination["y"]+min(42,destination["height"]/2)
            print("POINTER REVERSE: mouse move to source",flush=True)
            page.mouse.move(sx,sy)
            print("NATIVE REVERSE: mouse down",flush=True)
            page.mouse.down()
            print("NATIVE REVERSE: mouse movement across the game board",flush=True)
            page.mouse.move((sx+tx)/2,(sy+ty)/2,steps=8)
            print("NATIVE REVERSE: mouse movement to bag",flush=True)
            page.mouse.move(tx,ty,steps=10)
            print("NATIVE REVERSE: mouse up",flush=True)
            page.mouse.up()
            print("POINTER REVERSE: wait for actual server persistence",flush=True)
            expect(head.locator(".artifact-card")).to_have_count(0,timeout=15000)
            expect(bag.locator(".artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible()
            page.screenshot(path=str(ART/"NATIVE-REVERSE-after-1220x900.png"),
                full_page=False,animations="disabled")
            trace=page.evaluate("() => window.__reverseDragTrace")
            print("POINTER REVERSE EVENTS:",trace,flush=True)
            assert any(e["type"]=="pointerup" and e["role"]=="bag" for e in trace),trace
            assert not any(e["type"]=="dragstart" for e in trace),(
                "equipped gesture unexpectedly fell back into native HTML DnD",trace)
            page.reload(wait_until="domcontentloaded")
            expect(page.locator("#hero-bag .artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible(timeout=15000)
            expect(page.locator('[data-slot="head"] .artifact-card')).to_have_count(0)
            assert not errors,errors[:3]
            print("PASS: real mouse pointer reverse gesture equipped -> bag, DB persistence verified",
                  flush=True)

            # Touch pointers are implicitly captured by the SOURCE element.
            # The browser's physical elementFromPoint must still resolve
            # the bag, regardless of pointerup's event target.
            print("TOUCH REVERSE: start independent touch-enabled Chromium context",flush=True)
            touch_context=browser.new_context(
                viewport={"width":1220,"height":900},is_mobile=True,has_touch=True)
            touch_page=touch_context.new_page()
            touch_page.set_default_timeout(15000)
            touch_page.goto(BASE,wait_until="domcontentloaded",timeout=30000)
            touch_page.get_by_label("Identifiant").fill(
                os.environ["MMHK_E2E_USERNAME"])
            touch_page.get_by_label("Mot de passe").fill(
                os.environ["MMHK_E2E_PASSWORD"])
            touch_page.get_by_role("button",name="Entrer dans le royaume").click()
            expect(touch_page.get_by_role("heading",name="Mes mondes")).to_be_visible()
            touch_page.get_by_role("link",name=re.compile(
                "Royaume de démonstration")).click()
            touch_page.get_by_role("tablist",name="Écrans du monde").get_by_role(
                "tab",name="Mes cités").click()
            touch_page.get_by_role("link",name="Entrer en ville").first.click()
            touch_page.get_by_role("link",name="Héros et artefacts").first.click()
            touch_bag=touch_page.locator("#hero-bag")
            touch_head=touch_page.locator(
                '[data-testid="equipment-drop-zone"][data-slot="head"]')
            touch_helm=touch_bag.locator(".artifact-card").filter(
                has_text="Heaume de bronze")
            expect(touch_helm).to_be_visible()
            touch_helm.click()
            touch_head.click()
            touch_equipped=touch_head.locator(".artifact-card").filter(
                has_text="Heaume de bronze")
            expect(touch_equipped).to_be_visible(timeout=15000)
            touch_equipped.scroll_into_view_if_needed()
            source=touch_equipped.bounding_box()
            destination=touch_bag.bounding_box()
            assert source and destination
            sx=source["x"]+source["width"]/2
            sy=source["y"]+source["height"]/2
            tx=destination["x"]+destination["width"]/2
            ty=destination["y"]+min(42,destination["height"]/2)
            assert 0<sx<1220 and 0<sy<900 and 0<tx<1220 and 0<ty<900,(
                "Touch source and bag must fit in the same viewport",source,destination)
            touch_page.screenshot(path=str(ART/"POINTER-TOUCH-before-1220x900.png"),
                full_page=False,animations="disabled")
            cdp=touch_context.new_cdp_session(touch_page)
            def finger(x,y):
                return {"x":x,"y":y,"id":1,"radiusX":3,"radiusY":3,"force":1}
            print("TOUCH REVERSE: CDP touchStart",flush=True)
            cdp.send("Input.dispatchTouchEvent",{
                "type":"touchStart","touchPoints":[finger(sx,sy)]})
            for i in range(1,17):
                f=i/16
                cdp.send("Input.dispatchTouchEvent",{
                    "type":"touchMove",
                    "touchPoints":[finger(sx+(tx-sx)*f,sy+(ty-sy)*f)]})
                time.sleep(.025)
            print("TOUCH REVERSE: CDP touchEnd",flush=True)
            cdp.send("Input.dispatchTouchEvent",{
                "type":"touchEnd","touchPoints":[]})
            expect(touch_head.locator(".artifact-card")).to_have_count(
                0,timeout=15000)
            expect(touch_bag.locator(".artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible()
            touch_page.screenshot(path=str(ART/"POINTER-TOUCH-after-1220x900.png"),
                full_page=False,animations="disabled")
            touch_page.reload(wait_until="domcontentloaded")
            expect(touch_bag.locator(".artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible(timeout=15000)
            expect(touch_head.locator(".artifact-card")).to_have_count(0)
            print("TOUCH NEGATIVE: re-equip and release outside all drop zones",flush=True)
            again=touch_bag.locator(".artifact-card").filter(
                has_text="Heaume de bronze")
            again.click()
            touch_head.click()
            equipped_again=touch_head.locator(".artifact-card").filter(
                has_text="Heaume de bronze")
            expect(equipped_again).to_be_visible(timeout=15000)
            equipped_again.scroll_into_view_if_needed()
            start=equipped_again.bounding_box()
            masthead=touch_page.locator(".kingdom-masthead").bounding_box()
            assert start and masthead, "Missing artefact or masthead position"
            x=start["x"]+start["width"]/2
            y=start["y"]+start["height"]/2
            # The top of the game's masthead is a deliberately INVALID
            # destination. A finger can cross another zone on the way,
            # but release outside must never cause an artefact transfer.
            outside_x=masthead["x"]+masthead["width"]/2
            outside_y=masthead["y"]+masthead["height"]/2
            assert touch_page.evaluate(
                """([x,y]) => {
                   const el=document.elementFromPoint(x,y);
                   return !!el?.closest('.kingdom-masthead') &&
                     !el.closest('#hero-bag,#hero-reserve,[data-slot]');
                }""",[outside_x,outside_y]),"Target is not outside drop zones"
            cdp.send("Input.dispatchTouchEvent",{
                "type":"touchStart","touchPoints":[finger(x,y)]})
            for i in range(1,13):
                t=i/12
                cdp.send("Input.dispatchTouchEvent",{
                    "type":"touchMove","touchPoints":[finger(
                        x+(outside_x-x)*t,y+(outside_y-y)*t)]})
                time.sleep(.02)
            cdp.send("Input.dispatchTouchEvent",{
                "type":"touchEnd","touchPoints":[]})
            expect(equipped_again).to_be_visible(timeout=15000)
            expect(touch_bag.locator(".artifact-card").filter(
                has_text="Heaume de bronze")).to_have_count(0)
            touch_page.reload(wait_until="domcontentloaded")
            expect(touch_head.locator(".artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible(timeout=15000)
            print("PASS: touch gesture released outside legal zones never moves an item",
                  flush=True)
            # Restore the pristine demonstration inventory for the next
            # authenticated test: use the real server-backed unequip button.
            touch_head.locator(".artifact-card").filter(
                has_text="Heaume de bronze").click()
            touch_page.get_by_role("button",name="Déséquiper Heaume de bronze").click()
            expect(touch_bag.locator(".artifact-card").filter(
                has_text="Heaume de bronze")).to_be_visible(timeout=15000)
            touch_context.close()
            print("PASS: captured touch pointer equipped -> bag, invalid drop rejected, "
                  "and PostgreSQL persistence verified",flush=True)
        finally:
            browser.close()

if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: independent pointer reverse drag",type(exc).__name__,
              str(exc)[:850],file=sys.stderr,flush=True)
        raise SystemExit(1)
