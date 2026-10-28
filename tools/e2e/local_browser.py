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
            # Existing US-MON-001/004 and US-UIX-002/003: navigate and zoom
            # without exposing hidden cities or creating a military order.
            expect(page.get_by_test_id("world-center")).to_have_text("(17, 23)")
            page.get_by_role("button", name="Déplacer vers l'est").click()
            expect(page.get_by_test_id("world-center")).to_have_text("(18, 23)")
            page.get_by_role("button", name="Recentrer sur Premier Havre").click()
            expect(page.get_by_test_id("world-center")).to_have_text("(17, 23)")
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
            expect(page.get_by_text("Actualisation automatique", exact=False)).to_be_visible()

            # The actual first townhall can be built from the demo fixture.
            rapid = page.locator(
                "form.build-option:has(input[name='buildingCode'][value='village_hall'])"
                ":has(input[name='mode'][value='rapid'])"
            )
            expect(rapid.get_by_role("button", name="Lancer ce chantier")).to_be_enabled()
            rapid.get_by_role("button", name="Lancer ce chantier").click()
            expect(page.get_by_text("Chantier enregistré et ressources payées.")).to_be_visible(timeout=20000)
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
            # The user can navigate back and log out via the real server action.
            page.get_by_role("link", name="Carte du monde").click()
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
