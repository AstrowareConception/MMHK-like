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
            assert page.locator(".building-plan").count() >= 8, "Expanded Haven catalogue not provisioned"
            expect(page.get_by_text("Demeure des miliciens", exact=True)).to_be_visible()

            # US-ART-001/003/006: hero inventory is a separate readable screen.
            page.get_by_role("link", name="Héros et artefacts").first.click()
            expect(page.get_by_role("heading", level=1, name="Héros et équipement")).to_be_visible()
            expect(page.get_by_text("Aldric du Havre", exact=True).first).to_be_visible()
            expect(page.get_by_text("Heaume de bronze")).to_be_visible()
            expect(page.get_by_text("Sceau des anciens")).to_be_visible()
            helm=page.locator(".artifact-card").filter(has_text="Heaume de bronze")
            helm.get_by_role("button", name="Équiper").click()
            expect(page.get_by_text("Artefact déplacé : les inventaires ont été mis à jour.")).to_be_visible(timeout=20000)
            expect(page.locator(".equipment-slot.filled")).to_have_count(1)
            page.get_by_role("link", name="Ville", exact=True).click()
            expect(page.get_by_role("heading", level=1, name="Premier Havre")).to_be_visible()

            expect(page.get_by_text("Actualisation automatique", exact=False)).to_be_visible()

            # Select a verified Haven building: inspect actual server quotes,
            # then submit the construction order from its contextual inspector.
            page.locator(".haven-plot[data-building-code='village_hall']").click()
            inspector=page.locator("#city-inspector")
            expect(inspector).to_have_attribute("data-selected-building","village_hall")
            expect(inspector.get_by_role("heading",name="Hôtel du village")).to_be_visible()
            expect(inspector.get_by_text("Projet proposé : niveau 1")).to_be_visible()
            expect(inspector.locator(".city-inspector-quote")).to_have_count(3)
            rapid = inspector.locator(
                "form.city-inspector-quote:has(input[name='buildingCode'][value='village_hall'])"
                ":has(input[name='mode'][value='rapid'])"
            )
            expect(rapid.get_by_role("button", name="Lancer ce chantier")).to_be_enabled()
            rapid.get_by_role("button", name="Lancer ce chantier").click()
            expect(page.get_by_text("Chantier enregistré et ressources payées.")).to_be_visible(timeout=20000)
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
            expect(page.get_by_text("En construction", exact=False)).to_be_visible()
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
            tier_one = page.locator(
                "form.build-option:has(input[name='buildingCode'][value='recruit_t1'])"
                ":has(input[name='mode'][value='rapid'])"
            )
            expect(tier_one.get_by_role("button", name="Lancer ce chantier")).to_be_enabled()
            # Build the first actual dwelling: no pre-existing units are fabricated.
            tier_one.get_by_role("button", name="Lancer ce chantier").click()
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
            expect(page.get_by_role("heading", name="Armées et héros")).to_be_visible()
            expect(page.locator(".hero-profile-info").get_by_text("Aldric du Havre")).to_be_visible()
            assert page.locator(".unit-recruit-offer").count() == 2
            # Recruit units and transfer a subset to the starting hero.
            militia = page.locator("form.unit-recruit-offer:has(input[name='unitCode'][value='militia'])")
            expect(militia.get_by_role("button", name="Recruter")).to_be_enabled()
            militia.locator('input[name="quantity"]').fill("3")
            militia.get_by_role("button", name="Recruter").click()
            expect(page.get_by_text("Recrutement confirmé.", exact=False)).to_be_visible(timeout=20000)
            expect(page.get_by_text("3 soldats", exact=False)).to_be_visible()
            page.locator(".hero-transfer-box summary").click()
            transfer = page.locator('form.hero-transfer-row:has(input[name="direction"][value="to_hero"])').first
            transfer.locator('input[name="quantity"]').fill("2")
            transfer.get_by_role("button", name="Affecter").click()
            expect(page.get_by_text("Transfert confirmé", exact=False)).to_be_visible(timeout=20000)
            expect(page.get_by_text("Miliciens du Havre : 2")).to_be_visible()
            # Two seeded laboratory encounters, genuinely scoped to this city.
            page.get_by_role("link", name="Région et rencontres").click()
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
