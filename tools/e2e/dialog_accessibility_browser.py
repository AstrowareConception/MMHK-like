#!/usr/bin/env python3
"""Read-only accessibility regression for authentic MMHK modal and auth boundaries.

Runs alongside player screenshots, BEFORE irreversible gameplay actions:
- focus return, keyboard trap, Escape and backdrop dismissal
- desktop and narrow-mobile modal bounding boxes
- unchanged server-backed hero state when opening/closing dialogs
- no private city/hero details without a valid session
"""
from __future__ import annotations
import json
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=os.environ["MMHK_E2E_URL"].rstrip("/")
OUT=Path("test-output/visuals")
OUT.mkdir(parents=True,exist_ok=True)

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={"width":1220,"height":900})
        page=context.new_page()
        page.set_default_timeout(12000)
        errors=[]
        page.on("pageerror",lambda err:errors.append(str(err)))
        page.goto(ROOT,wait_until="domcontentloaded",timeout=30000)
        page.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
        page.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
        page.get_by_role("button",name="Entrer dans le royaume").click()
        expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible()
        page.get_by_role("link",name=re.compile("Royaume de démonstration")).click()
        page.get_by_role("tablist",name="Écrans du monde").get_by_role(
            "tab",name="Mes cités").click()
        city_href=page.get_by_role("link",name="Entrer en ville").first.get_attribute("href")
        assert city_href and city_href.startswith("/cities/"),city_href
        page.goto(ROOT+city_href+"/heroes",wait_until="domcontentloaded")
        expect(page.get_by_test_id("hero-game-screen")).to_be_visible()
        page.get_by_role("tablist",name="Écrans du héros").get_by_role(
            "tab",name="Formation").click()
        expect(page.get_by_test_id("hero-formation-screen")).to_be_visible()

        before_state=page.locator(".formation-state").inner_text()
        for width,height in ((1220,900),(390,844)):
            page.set_viewport_size({"width":width,"height":height})
            opener=page.get_by_role("button",name="Ajuster les effectifs…")
            opener.scroll_into_view_if_needed()
            opener.focus()
            assert opener.evaluate("(el)=>el===document.activeElement")
            opener.click()
            dialog=page.get_by_test_id("formation-advanced-dialog")
            expect(dialog).to_be_visible()
            expect(dialog).to_have_attribute("role","dialog")
            expect(dialog).to_have_attribute("aria-modal","true")
            expect(dialog.get_by_role("heading",name="Répartir les effectifs")).to_be_visible()
            expect(dialog.locator("select")).to_have_count(7)
            expect(dialog.locator(".mmhk-form-quantity-empty")).to_have_count(7)
            expect(dialog.locator('input[type="number"]')).to_have_count(0)
            # A portal cannot inherit .mmhk-heritage-formation text colors:
            # assert high contrast on the actual parchment dialog.
            assert dialog.evaluate("""el=>{
              const label=el.querySelector('.mmhk-formation-edit-grid label');
              const rgb=getComputedStyle(label).color.match(/\\d+/g).map(Number);
              return rgb.length>=3 && rgb[0]<130 && rgb[1]<110 && rgb[2]<90;
            }"""),"Formation labels are unreadable on modal parchment"
            assert page.evaluate("document.body.style.overflow")=="hidden"
            close=dialog.get_by_role("button",name="Fermer la fenêtre")
            expect(close).to_be_focused()
            geom=dialog.evaluate("""el=>{
                const r=el.getBoundingClientRect();
                return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,
                  visibleW:innerWidth,visibleH:innerHeight,
                  scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
            }""")
            print("MODAL ACCESSIBILITY",width,height,json.dumps(geom),flush=True)
            assert geom["left"]>=-2 and geom["top"]>=-2,geom
            assert geom["right"]<=width+2 and geom["bottom"]<=height+2,geom
            assert geom["scrollHeight"]<=geom["clientHeight"]+3,geom
            page.screenshot(path=str(OUT/f"DIALOG-formation-{width}x{height}.png"),
                            full_page=False,animations="disabled")

            # The first control is the close button; the final one is
            # the modal's explicit return-to-formation footer button.
            footer=dialog.get_by_role("button",name="Revenir à la formation")
            footer.focus()
            page.keyboard.press("Tab")
            expect(close).to_be_focused()
            page.keyboard.press("Shift+Tab")
            expect(footer).to_be_focused()
            page.keyboard.press("Escape")
            expect(dialog).to_have_count(0)
            assert page.evaluate("document.body.style.overflow")!="hidden"
            expect(opener).to_be_focused()

            # Backdrop can dismiss, but must not call the formation
            # save server action. The editor stays clean.
            opener.click()
            dialog=page.get_by_test_id("formation-advanced-dialog")
            expect(dialog).to_be_visible()
            # Interactions inside a modal must not be mistaken for clicking
            # the backdrop and must not submit any server-side formation.
            dialog.get_by_role("heading",name="Répartir les effectifs").click()
            expect(dialog).to_be_visible()
            overlay=page.get_by_test_id("formation-advanced-dialog-overlay")
            overlay.click(position={"x":3,"y":3})
            expect(dialog).to_have_count(0)
            expect(opener).to_be_focused()
            assert page.locator(".formation-state").inner_text()==before_state,(
                "Opening or dismissing a modal changed the game formation")
        assert not errors,errors[:3]
        context.close()

        # Direct navigation without a session must not leak owner-only
        # hero state (world/city metadata and bag). Use a NEW context.
        guest=browser.new_context(viewport={"width":390,"height":844})
        anonymous=guest.new_page()
        anonymous.goto(ROOT+city_href+"/heroes",wait_until="domcontentloaded")
        expect(anonymous.get_by_role("heading",name="Accéder au royaume")).to_be_visible()
        expect(anonymous.get_by_test_id("hero-equipment-board")).to_have_count(0)
        assert not any(c["name"]=="mmhk_session" for c in guest.cookies())
        guest.close()
        browser.close()
        print("PASS: modal keyboard trap, Escape, backdrop, focus restoration, "
              "desktop/mobile bounds and guest authorization",flush=True)

if __name__=="__main__":
    main()
