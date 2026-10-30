#!/usr/bin/env python3
"""Real Chromium end-to-end exercise of the LOCAL Docker stack.

Browser -> Next.js Server Actions -> FastAPI -> PostgreSQL -> scheduled worker.
No historic S2 numbers are asserted and no Ubisoft images are distributed.
Required env: MMHK_E2E_USERNAME, MMHK_E2E_PASSWORD, MMHK_E2E_URL.
"""
from __future__ import annotations

import os
import re
import sys
import time

from playwright.sync_api import sync_playwright, expect


def main() -> int:
    username = os.environ["MMHK_E2E_USERNAME"]
    password = os.environ["MMHK_E2E_PASSWORD"]
    root = os.environ.get("MMHK_E2E_URL", "http://127.0.0.1:3000").rstrip("/")
    errors: list[str] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1366, "height": 900})
        page.on("pageerror", lambda error: errors.append(str(error)))
        try:
            page.goto(root, wait_until="domcontentloaded", timeout=20000)
            expect(page.get_by_role("heading", name="Accéder au royaume")).to_be_visible()
            page.get_by_label("Identifiant").fill(username)
            page.get_by_label("Mot de passe").fill(password)
            page.get_by_role("button", name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading", name="Mes mondes")).to_be_visible(timeout=20000)
            expect(page.get_by_role("region", name="Frise temporelle du royaume")).to_be_visible()
            # Session bearer stays in an HttpOnly Lax cookie, not exposed to JS.
            sessions = [cookie for cookie in page.context.cookies()
                        if cookie["name"] == "mmhk_session"]
            assert len(sessions) == 1, "Expected one browser session cookie"
            assert sessions[0]["httpOnly"] is True, "Session must be HttpOnly"
            assert sessions[0]["sameSite"] == "Lax", "Session must be SameSite=Lax"
            assert sessions[0]["path"] == "/", "Session must cover private routes"
            expect(page.get_by_text("Royaume de démonstration")).to_be_visible()
            page.get_by_role("link", name=re.compile("Royaume de démonstration")).click()
            expect(page.get_by_role("heading", name="Mes positions dans le monde")).to_be_visible()
            assert "local-sandbox" in page.url
            # Server-side scoped world intel: sandbox has no registered sites.
            expect(page.get_by_text("Cités découvertes : 0")).to_be_visible()
            expect(page.get_by_text("Sites découverts : 0")).to_be_visible()
            expect(page.get_by_text("Cases d'influence connues : 0")).to_be_visible()
            page.get_by_label("Sites", exact=True).uncheck()
            page.get_by_label("Sites", exact=True).check()
            # Existing US-MON-001/004 and US-UIX-002/003: navigate and zoom
            # without exposing hidden cities or creating a military order.
            expect(page.get_by_test_id("world-center")).to_have_text("(17, 23)")
            page.get_by_role("button", name="Déplacer vers l'est").click()
            expect(page.get_by_test_id("world-center")).to_have_text("(18, 23)")
            page.get_by_role("button", name="Recentrer sur Premier Havre").click()
            expect(page.get_by_test_id("world-center")).to_have_text("(17, 23)")
            # The four arrows are painted in the historic JPEG; their real
            # overlay controls must move the authoritative camera.
            page.get_by_role("button", name="Flèche de carte : nord-est").click()
            expect(page.get_by_test_id("world-center")).to_have_text("(18, 22)")
            page.get_by_role("button", name="Recentrer sur Premier Havre").click()
            # The decorative grid must not be enabled by default.
            expect(page.get_by_label("Grille indicative")).not_to_be_checked()
            page.get_by_label("Grille indicative").check()
            expect(page.get_by_label("Grille indicative")).to_be_checked()
            page.get_by_label("Grille indicative").uncheck()
            # Keyboard navigation is available without mouse.
            map_surface = page.get_by_role("group", name=re.compile("Monde .* déplacement"))
            map_surface.focus()
            page.keyboard.press("ArrowRight")
            expect(page.get_by_test_id("world-center")).to_have_text("(18, 23)")
            page.get_by_role("button", name="Recentrer sur Premier Havre").click()

            page.get_by_role("button", name="Zoom arrière").click()
            expect(page.get_by_text("Vue éloignée", exact=True)).to_be_visible()
            page.get_by_role("button", name="Zoom avant").click()
            expect(page.get_by_text("Vue détaillée", exact=True)).to_be_visible()
            page.get_by_label("Coordonnée X").fill("101")
            page.get_by_label("Coordonnée Y").fill("23")
            page.get_by_role("button", name="Centrer", exact=True).click()
            expect(page.locator(".map-navigation-error")).to_contain_text("Coordonnées invalides")
            page.get_by_label("Coordonnée X").fill("100")
            page.get_by_role("button", name="Centrer", exact=True).click()
            expect(page.get_by_test_id("world-center")).to_have_text("(100, 23)")
            page.get_by_role("button", name="Déplacer vers l'est").click()
            expect(page.get_by_test_id("world-center")).to_have_text("(1, 23)")
            page.get_by_role("button", name="Recentrer sur Premier Havre").click()
            page.get_by_role("link", name="Voir la région").click()
            expect(page.get_by_role("heading", name="Autour de Premier Havre")).to_be_visible()
            # Native resolution matches original historical region imagery.
            expect(page.locator("svg.region-scene")).to_have_attribute("viewBox", "0 0 680 562")
            expect(page.locator(".region-selectable-cell")).to_have_count(25)
            # The region is explicitly a 25-cell schematic, not made-up mine positions.
            expect(page.get_by_text("25 emplacements schématiques")).to_be_visible()
            # US-REG-001 + US-UIX-003: a genuine local 5x5 tile,
            # with unknown terrain left explicitly undiscovered.
            target = page.locator('[data-region-i="1"][data-region-j="2"] polygon')
            target.hover()
            expect(page.get_by_test_id("region-hover")).to_have_text("(1, 2)")
            target.click()
            expect(page.get_by_test_id("region-selection")).to_have_text("(1, 2)")
            expect(page.get_by_text("Terrain, forêt, mine, site ou PNJ : non cartographié")).to_be_visible()
            page.get_by_role("link", name="Entrer en ville").first.click()
            expect(page.get_by_role("heading", level=1, name="Premier Havre", exact=True)).to_be_visible()
            expect(page.get_by_role("heading", name="Réserves de la ville")).to_be_visible()
            expect(page.get_by_role("link", name="Héros et artefacts").first).to_be_visible()
            expect(page.get_by_role("link", name="Garnison et recrutement").first).to_be_visible()
            expect(page.get_by_test_id("city-interactive-district")).to_be_visible()
            assert page.locator(".city-plan-ribbon-list button").count() >= 8
            expect(page.locator(".city-plan-ribbon-list button").filter(
                has_text="Demeure des miliciens")).to_be_visible()
            # The long technical directory is opt-in; it never dominates the game screen.
            directory=page.get_by_test_id("construction-directory")
            expect(directory).not_to_have_attribute("open", "")
            directory.locator("summary").click()
            assert page.locator(".building-plan").count() >= 8, "Expanded Haven catalogue not provisioned"
            directory.locator("summary").click()
            # A building with no certified scene anchor remains accessible
            # through the same in-game blueprint ribbon.
            page.locator(".city-plan-ribbon-list button").filter(
                has_text="Tour de guet").click()
            expect(page.locator("#city-inspector")).to_have_attribute(
                "data-selected-building","watchtower")
            assert "inspect=watchtower" in page.url, page.url
            page.locator("#city-inspector").get_by_role(
                "button",name="Fermer la fiche du bâtiment").click()
            expect(page.locator("#city-inspector")).to_have_attribute(
                "data-selected-building","")

            print("E2E MILESTONE: world and city navigation OK",flush=True)
            # US-ART-001/003/006: hero inventory is a separate readable screen.
            page.get_by_role("link", name="Héros et artefacts").first.click()
            expect(page.get_by_role("heading", level=1, name="Héros et équipement")).to_be_visible()
            expect(page.get_by_text("Aldric du Havre", exact=True).first).to_be_visible()
            expect(page.get_by_text("Heaume de bronze")).to_be_visible()
            expect(page.get_by_text("Sceau des anciens")).to_be_visible()
            # Authentic gameplay affordance: native mouse DnD from the
            # hero's bag to the helmet slot. The mutation is PostgreSQL-backed.
            expect(page.get_by_test_id("hero-equipment-board")).to_have_attribute(
                "data-ready","true",timeout=15000)
            helm=page.locator("#hero-bag .artifact-card").filter(has_text="Heaume de bronze")
            helmet=page.locator('.mmhk-equip-target[data-slot="head"]')
            expect(helm).to_be_visible()
            os.makedirs("test-output/visuals",exist_ok=True)
            helm.drag_to(helmet)
            page.screenshot(path="test-output/visuals/artifact-after-native-drop.png",full_page=True)
            try:
                expect(page.get_by_text("Artefact déplacé : les inventaires ont été mis à jour.")).to_be_visible(timeout=20000)
            except AssertionError:
                print("Artifact drag diagnostics:",
                      "url=",page.url,
                      "selected=",page.locator(".mmhk-selection-hint").all_text_contents(),
                      "errors=",page.locator(".mmhk-equipment .error").all_text_contents(),
                      "inventory=",page.locator(".mmhk-item").all_text_contents())
                raise
            expect(page.locator(".equipment-slot.filled")).to_have_count(1)
            page.screenshot(path="test-output/visuals/hero-equipment-desktop.png",full_page=True)
            print("E2E MILESTONE: hero equipment drag persisted",flush=True)
            page.get_by_role("link", name="Ville", exact=True).click()
            expect(page.get_by_role("heading", level=1, name="Premier Havre")).to_be_visible()

            expect(page.get_by_text("Actualisation automatique", exact=False)).to_be_visible()

            # Select a verified Haven building: inspect actual server quotes,
            # then submit the construction order from its contextual inspector.
            page.locator(".haven-plot[data-building-code='village_hall']").click()
            inspector=page.locator("#city-inspector")
            expect(page.get_by_test_id("city-interactive-district")).to_be_visible()
            assert "inspect=village_hall" in page.url, page.url
            expect(inspector).to_have_attribute("data-selected-building","village_hall")
            expect(inspector.get_by_role("heading",name="Hôtel du village")).to_be_visible()
            expect(inspector.get_by_text("Projet proposé : niveau 1")).to_be_visible()
            expect(inspector.locator(".city-inspector-quote")).to_have_count(1)
            inspector.get_by_role("button", name="Rapide", exact=True).click()
            expect(inspector.get_by_role("button",name="Rapide",exact=True)).to_have_attribute(
                "aria-pressed","true")
            os.makedirs("test-output/visuals",exist_ok=True)
            page.screenshot(path="test-output/visuals/haven-city-building-inspector.png",
                            full_page=True)
            rapid = inspector.locator(
                "form.city-inspector-quote:has(input[name='buildingCode'][value='village_hall'])"
                ":has(input[name='mode'][value='rapid'])"
            )
            expect(rapid.get_by_role("button", name="Lancer le chantier")).to_be_enabled()
            construction_responses=[]
            page.on("response",lambda response:construction_responses.append({
                "status":response.status,"url":response.url,
                "method":response.request.method
            }) if response.request.method=="POST" else None)
            rapid.get_by_role("button", name="Lancer le chantier").click()
            try:
                expect(page.get_by_text("Chantier enregistré et ressources payées.")).to_be_visible(timeout=20000)
            except AssertionError:
                os.makedirs("test-output/visuals",exist_ok=True)
                page.screenshot(path="test-output/visuals/haven-city-construction-error.png",full_page=True)
                print("BUILD DIAGNOSTICS",{
                    "url":page.url,
                    "responses":construction_responses[-6:],
                    "notices":page.locator(".construction-notice,.error").all_text_contents(),
                    "inspector":page.locator("#city-inspector").all_text_contents()[:1],
                    "browser_errors":errors[:3],
                },flush=True)
                raise
            page.screenshot(path="test-output/visuals/haven-city-active-project.png",
                            full_page=True)
            expect(page.locator("#city-history .construction-history-entry")).to_have_count(1)
            expect(page.locator("#city-history .construction-history-entry").first).to_contain_text("Hôtel du village")
            snap = page.request.get(root + "/api/game-timeline?hours=12")
            payload = snap.json() if snap.ok else {}
            print("Timeline construction diagnostics:",
                  "http", snap.status,
                  "server_events", len(payload.get("events", [])),
                  "visual_events", page.locator(".timeline-event").count(),
                  "clusters", page.locator(".timeline-cluster").count(),
                  "message", page.locator(".kingdom-timeline").inner_text()[:180], flush=True)
            expect(page.locator(".timeline-event")).to_have_count(1, timeout=20000)
            expect(page.locator(".active-project")).to_contain_text("En construction")
            # One active site, no queue and no second payment option.
            assert page.locator("form.build-option").count() == 0

            # The real worker should complete this 36s experimental job.
            # Check that Next.js refreshes it without a manual browser reload.
            finished = page.get_by_text("village_hall niveau 1", exact=False)
            deadline = time.monotonic() + 105
            while time.monotonic() < deadline:
                if finished.count() and finished.first.is_visible():
                    break
                page.wait_for_timeout(2500)
            expect(finished.first).to_be_visible(timeout=5000)
            expect(page.locator(".timeline-event")).to_have_count(0, timeout=45000)
            expect(page.get_by_text("Bonus de mine actifs", exact=False)).to_be_visible()
            expect(page.locator("#city-history .construction-history-entry").first).to_contain_text("Terminé")
            # US-ECH: local test rate policies are not enough on their own:
            # the real marketplace must be constructed and completed first.
            page.get_by_role("link", name="Marché", exact=True).click()
            expect(page.get_by_role("heading", name="Marché de Premier Havre")).to_be_visible()
            expect(page.get_by_role("heading", name="Le marché attend son ouverture")).to_be_visible()
            page.get_by_role("link", name="Voir le bâtiment Marché").click()
            expect(page.locator("#city-inspector")).to_have_attribute(
                "data-selected-building", "marketplace")
            page.locator("#city-inspector").get_by_role(
                "button",name="Rapide",exact=True).click()
            market_job=page.locator(
                "form.city-inspector-quote:has(input[name='buildingCode'][value='marketplace'])"
                ":has(input[name='mode'][value='rapid'])"
            )
            expect(market_job.get_by_role("button",name="Lancer le chantier")).to_be_enabled()
            market_job.get_by_role("button",name="Lancer le chantier").click()
            expect(page.get_by_text("Chantier enregistré et ressources payées.")).to_be_visible(timeout=20000)
            market_ready=page.get_by_text("marketplace niveau 1",exact=False)
            deadline=time.monotonic()+115
            while time.monotonic()<deadline:
                if market_ready.count() and market_ready.first.is_visible():
                    break
                page.wait_for_timeout(2500)
            expect(market_ready.first).to_be_visible(timeout=5000)
            page.get_by_role("link",name="Marché",exact=True).click()
            expect(page.get_by_role("heading",name="La halle des échanges")).to_be_visible()
            wood_for_ore=page.locator(
                "form.merchant-rate:has(input[name='pay_resource'][value='wood'])"
                ":has(input[name='receive_resource'][value='ore'])"
            )
            wood_for_ore.locator("input[name='pay_amount']").fill("6")
            wood_for_ore.get_by_role("button",name="Obtenir un devis").click()
            expect(page.locator("#market-quote")).to_contain_text("3 minerai")
            page.get_by_role("button",name="Confirmer cet échange").click()
            expect(page.get_by_text("Échange confirmé :",exact=False)).to_be_visible(timeout=20000)
            expect(page.get_by_test_id("market-history-row")).to_have_count(1)
            expect(page.get_by_test_id("market-history-row").first).to_contain_text("6 bois vers 3 minerai")
            # US-ECH-004/005/008: actually reserve a lot outside spendable stock,
            # display its state and withdraw it to the same city.
            publish=page.get_by_test_id("marketplace-publish")
            expect(publish.get_by_role("button",name="Publier et réserver le lot")).to_be_enabled()
            publish.locator('input[name="quantity"]').fill("4")
            publish.locator('input[name="priceAmount"]').fill("6")
            publish.get_by_role("button",name="Publier et réserver le lot").click()
            expect(page.get_by_text("Offre publiée :",exact=False)).to_be_visible(timeout=20000)
            expect(page.get_by_test_id("marketplace-my-offer")).to_have_count(1)
            own_lot=page.get_by_test_id("marketplace-my-offer").first
            expect(own_lot).to_contain_text("4 Bois")
            expect(own_lot).to_contain_text("En vente")
            own_lot.get_by_role("button",name="Retirer l'offre").click()
            expect(page.get_by_text("Lot retiré et remis",exact=False)).to_be_visible(timeout=20000)
            expect(page.get_by_test_id("marketplace-my-offer").first).to_contain_text("Retiré")
            page.get_by_role("link",name="Retourner dans la cité.").click()
            expect(page.get_by_role("heading",level=1,name="Premier Havre")).to_be_visible()
            # Progression: after exchanging resources, build the first dwelling
            # and recruit the army used by the next journey.
            page.locator(".city-plan-ribbon-list button").filter(
                has_text="Demeure des miliciens").click()
            inspector=page.locator("#city-inspector")
            expect(inspector).to_have_attribute("data-selected-building","recruit_t1")
            inspector.get_by_role("button",name="Rapide",exact=True).click()
            tier_one=inspector.locator(
                "form.city-inspector-quote:has(input[name='buildingCode'][value='recruit_t1'])"
                ":has(input[name='mode'][value='rapid'])"
            )
            expect(tier_one.get_by_role("button",name="Lancer le chantier")).to_be_enabled()
            # Build the first actual dwelling via the in-scene inspector.
            tier_one.get_by_role("button",name="Lancer le chantier").click()
            expect(page.get_by_text("Chantier enregistré et ressources payées.")).to_be_visible(timeout=20000)
            next_ready = page.get_by_text("recruit_t1 niveau 1", exact=False)
            deadline = time.monotonic() + 125
            while time.monotonic() < deadline:
                if next_ready.count() and next_ready.first.is_visible():
                    break
                page.wait_for_timeout(2500)
            expect(next_ready.first).to_be_visible(timeout=5000)
            # Recruitment is now isolated in the military workspace.
            page.get_by_role("link", name="Garnison et recrutement").first.click()
            expect(page.get_by_role("heading", name="Gestion des armées")).to_be_visible()
            expect(page.locator(".hero-profile-info").get_by_text("Aldric du Havre")).to_be_visible()
            expect(page.get_by_test_id("military-garrison-screen")).to_be_visible()
            page.get_by_role("tab",name="Recrutement").click()
            expect(page.get_by_test_id("military-recruitment-screen")).to_be_visible()
            expect(page.get_by_test_id("military-garrison-screen")).to_be_hidden()
            assert page.locator(".unit-recruit-offer").count() == 2
            # Recruit units and transfer a subset to the starting hero.
            militia = page.locator("form.unit-recruit-offer:has(input[name='unitCode'][value='militia'])")
            expect(militia.get_by_role("button", name="Recruter")).to_be_enabled()
            militia.locator('input[name="quantity"]').fill("3")
            militia.get_by_role("button", name="Recruter").click()
            expect(page.get_by_text("Recrutement confirmé.", exact=False)).to_be_visible(timeout=20000)
            page.get_by_role("tab",name="Garnison").click()
            expect(page.get_by_text("3 soldats", exact=False)).to_be_visible()
            # Real drag of a garrison troop card onto the idle hero.
            # A game-like quantity confirmation replaces the old admin form.
            expect(page.get_by_test_id("troop-deployment-board")).to_have_attribute(
                "data-ready","true",timeout=15000)
            troop=page.locator('[data-testid="troop-stack"][data-holder="garrison"][data-unit-code="militia"]')
            recipient=page.locator('[data-testid="hero-drop-zone"]').first
            expect(troop).to_be_visible()
            # Split is a local planning gesture. It must conserve the real
            # three soldiers until the transfer order is confirmed.
            troop.get_by_role("button",name=re.compile("Diviser Miliciens")).click()
            split=page.get_by_test_id("garrison-split-dialog")
            expect(split).to_be_visible()
            expect(split).to_have_attribute("role","dialog")
            split.get_by_test_id("garrison-split-quantity").locator('input[type="number"]').fill("1")
            split.get_by_role("button",name="Diviser le peloton").click()
            expect(split).to_have_count(0)
            expect(page.locator('[data-testid="troop-stack"][data-holder="garrison"][data-unit-code="militia"]')).to_have_count(2)
            assert sorted(int(x.lstrip("×")) for x in page.locator(
              '[data-testid="troop-stack"][data-holder="garrison"][data-unit-code="militia"] .mmhk-stack-count'
              ).all_text_contents()) == [1,2]
            page.get_by_role("button",name=re.compile("Fusionner les groupes")).first.click()
            expect(page.locator('[data-testid="troop-stack"][data-holder="garrison"][data-unit-code="militia"]')).to_have_count(1)
            troop.drag_to(recipient)
            confirmation=page.get_by_test_id("transfer-confirmation")
            expect(confirmation).to_be_visible()
            expect(confirmation).to_have_attribute("role","dialog")
            expect(confirmation).to_have_attribute("aria-modal","true")
            expect(confirmation.get_by_role("heading",name="Transférer des troupes")).to_be_visible()
            assert page.evaluate("document.body.style.overflow") == "hidden"
            # Closing a dialog must not send an order or consume a soldier.
            page.keyboard.press("Escape")
            expect(confirmation).to_have_count(0)
            assert page.evaluate("document.body.style.overflow") != "hidden"
            expect(page.locator('[data-testid="troop-stack"][data-holder="garrison"]')).to_contain_text("3")
            troop.drag_to(recipient)
            confirmation=page.get_by_test_id("transfer-confirmation")
            expect(confirmation).to_be_visible()
            expect(confirmation.get_by_role("button",name="Max")).to_be_disabled()
            confirmation.locator('input[type="number"]').fill("2")
            expect(confirmation.get_by_role("button",name="Max")).to_be_enabled()
            confirmation.get_by_role("button",name="Confirmer le transfert").click()
            expect(page.get_by_text("Transfert confirmé",exact=False)).to_be_visible(timeout=20000)
            expect(page.locator('[data-testid="troop-stack"][data-holder="garrison"][data-unit-code="militia"]')).to_contain_text("1")
            expect(page.locator('[data-testid="troop-stack"][data-unit-code="militia"]').filter(has_text="2")).to_have_count(1)
            page.screenshot(path="test-output/visuals/garrison-deployment-desktop.png",full_page=True)
            # Prepare seven-slot army without changing real soldier counts.
            page.locator('a[href$="/heroes"]').first.click()
            # The immersive hero page renamed the heading; assert the real
            # interactive seven-position board, not obsolete editorial copy.
            page.get_by_role("tab",name="Formation").click()
            expect(page.get_by_test_id("hero-formation-screen")).to_be_visible()
            expect(page.get_by_test_id("hero-inventory-screen")).to_be_hidden()
            expect(page.get_by_test_id("formation-visual-board")).to_be_visible(timeout=20000)
            expect(page.locator(".formation-slot")).to_have_count(7)
            # Reorder actual seven Jactari positions using the illustrated
            # troop cards, not select/quantity administration fields.
            expect(page.get_by_test_id("formation-visual-board")).to_have_attribute(
                "data-ready","true",timeout=15000)
            source_slot=page.locator(".mmhk-formation-tile").nth(0)
            target_slot=page.locator(".mmhk-formation-tile").nth(1)
            expect(source_slot).to_contain_text("Miliciens du Havre")
            # An unrelated native drop must not parse an empty payload as
            # slot index zero, which would silently rearrange the formation.
            page.evaluate("""() => {
              const tile=document.querySelectorAll('.mmhk-formation-tile')[1];
              const foreign=new DataTransfer();
              foreign.setData('text/plain','outside-the-game');
              tile.dispatchEvent(new DragEvent('drop',{
                bubbles:true,cancelable:true,dataTransfer:foreign
              }));
            }""")
            expect(source_slot).to_contain_text("Miliciens du Havre")
            expect(target_slot).not_to_contain_text("Miliciens du Havre")
            source_slot.drag_to(target_slot)
            expect(target_slot).to_contain_text("Miliciens du Havre")
            page.screenshot(path="test-output/visuals/seven-slot-formation-desktop.png",full_page=True)
            page.get_by_role("button", name="Enregistrer les sept positions").click()
            expect(page.get_by_text("Formation enregistrée sans modifier les effectifs.", exact=False)).to_be_visible(timeout=20000)
            page.locator('a[href$="/region"]').first.click()
            # Two seeded laboratory encounters, genuinely scoped to this city.
            # Region is already open through the main kingdom navbar.
            expect(page.get_by_role("heading", name="Autour de Premier Havre")).to_be_visible()
            wolf = page.locator('[data-region-i="1"][data-region-j="3"] polygon')
            wolf.click()
            expect(page.get_by_role("heading", name="Loups des bois")).to_be_visible()
            page.get_by_role("button", name="Tester un duel Jactari").click()
            expect(page.get_by_text("Rapport de simulation", exact=False)).to_be_visible(timeout=15000)
            expect(page.get_by_text("Rien n'est débité, libéré ou attribué dans PostgreSQL.", exact=False)).to_be_visible()




            # Real two-legged journey is controlled by the worker, not the UI.
            page.get_by_role("button", name="Lancer la marche et préparer le retour").click()
            expect(page.get_by_text("Le héros est parti. Son trajet est désormais suivi par le worker.")).to_be_visible(timeout=20000)
            expect(page.get_by_test_id("region-selection")).to_have_text("(1, 3)")
            expect(page.locator(".region-mission-map [data-mission-stage='outbound']")).to_have_count(1)
            expect(page.get_by_text("En marche vers", exact=False)).to_be_visible()
            expect(page.locator(".region-mission-map text").filter(has_text="Aller").first).to_be_visible()
            expect(page.locator(".region-mission-map [data-mission-stage='returning']")).to_have_count(1,timeout=100000)
            expect(page.get_by_text("Sur le chemin du retour", exact=False)).to_be_visible()
            expect(page.locator(".region-mission-map [data-mission-stage='outbound']")).to_have_count(0)
            expect(page.locator(".region-mission-map [data-mission-stage='returning']")).to_have_count(0,timeout=100000)
            expect(page.get_by_text("Aucun héros actuellement en déplacement.")).to_be_visible()
            expect(page.get_by_role("heading", name="Loups des bois")).to_be_visible()
            # Mission history is collapsed by default. Reveal its report link.
            page.get_by_text("Dernières missions achevées").click()
            page.get_by_role("link", name="Rapport", exact=True).first.click()
            expect(page.get_by_role("heading", level=1, name="Chronique de mission")).to_be_visible()
            expect(page.locator(".mission-report-events li")).to_have_count(3)
            expect(page.locator(".mission-report-formation > div")).to_have_count(7)
            expect(page.get_by_text("Peloton du duel expérimental")).to_be_visible()
            page.get_by_role("link", name="Suivre sur la carte").click()
            expect(page.get_by_role("heading", name="Autour de Premier Havre")).to_be_visible()

            # The user can navigate back and log out via the real server action.
            page.get_by_role("link", name="Revenir à la carte du monde").click()
            expect(page.get_by_role("heading", name="Mes positions dans le monde")).to_be_visible()
            page.get_by_role("button", name="Déconnexion").click()
            expect(page.get_by_role("heading", name="Accéder au royaume")).to_be_visible()
            assert not any(cookie["name"] == "mmhk_session"
                           for cookie in page.context.cookies()), "Cookie not cleared on logout"
            page.goto(root + "/worlds/local-sandbox", wait_until="domcontentloaded")
            expect(page.get_by_role("heading", name="Accéder au royaume")).to_be_visible()
            if errors:
                raise AssertionError("Uncaught browser errors: " + repr(errors[:4]))
            print("PASS: browser login -> world -> 25-cell region -> city -> construction -> worker -> logout")
            return 0
        finally:
            if os.getenv("MMHK_E2E_SCREENSHOT"):
                page.screenshot(path=os.environ["MMHK_E2E_SCREENSHOT"], full_page=True)
            browser.close()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        # Do not print env variables (particularly the generated demo password).
        print("FAIL: browser journey:", type(exc).__name__, str(exc)[:600], file=sys.stderr)
        raise SystemExit(1)
