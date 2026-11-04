#!/usr/bin/env python3
"""Actual localhost API outage regression against the signed-in Next.js app.

CI starts a disposable six-service Docker stack and synthetic demo account.
This test stops ONLY the disposable FastAPI container, checks the real browser
page preserves its HttpOnly session and does not leak private worlds, then
restores API health and retries without ever entering credentials again.
"""
from __future__ import annotations

import os
from compose_qa import compose_cli
import re
import subprocess
import time
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

BASE = os.environ["MMHK_E2E_URL"].rstrip("/")
ART = Path("test-output/visuals")
ART.mkdir(parents=True, exist_ok=True)
COMPOSE = compose_cli()

def docker(*args):
    result = subprocess.run([*COMPOSE, *args], check=False,
                            capture_output=True, text=True, timeout=150)
    if result.returncode != 0:
        raise RuntimeError("Disposable API compose operation failed")
    return result

def cookie_value(ctx):
    found = [c for c in ctx.cookies() if c["name"] == "mmhk_session"]
    assert len(found) == 1, "Expected exactly one HttpOnly session"
    assert found[0]["httpOnly"] is True
    return found[0]["value"]

def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width":1220,"height":900})
        page = context.new_page()
        page.set_default_timeout(20000)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        try:
            page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
            page.get_by_label("Identifiant").fill(os.environ["MMHK_E2E_USERNAME"])
            page.get_by_label("Mot de passe").fill(os.environ["MMHK_E2E_PASSWORD"])
            page.get_by_role("button", name="Entrer dans le royaume").click()
            expect(page.get_by_role("heading", name="Mes mondes")).to_be_visible()
            expect(page.get_by_role("link", name=re.compile("Royaume de démonstration"))).to_be_visible()
            original = cookie_value(context)

            docker("stop", "api")
            try:
                for width,height in ((1220,900),(390,844)):
                    page.set_viewport_size({"width":width,"height":height})
                    page.goto(BASE+"?outage-check=1",wait_until="domcontentloaded",
                              timeout=30000)
                    expect(page.get_by_role(
                        "heading",name="Service momentanément indisponible"
                    )).to_be_visible()
                    expect(page.get_by_test_id(
                        "session-service-unavailable")).to_be_visible()
                    expect(page.get_by_role(
                        "button", name="Réessayer d’accéder au royaume")).to_be_visible()
                    expect(page.get_by_label("Identifiant")).to_have_count(0)
                    expect(page.get_by_role(
                        "link",name=re.compile("Royaume de démonstration"))).to_have_count(0)
                    assert cookie_value(context)==original, "Session lost during outage"
                    width_px=page.evaluate("document.documentElement.scrollWidth")
                    assert width_px<=width+3,(width,width_px)
                    page.screenshot(
                        path=str(ART/f"LOGIN-api-outage-{width}x{height}.png"),
                        full_page=False,animations="disabled")
                print("PASS: authenticated 503 does not become login, no private "
                      "world leaked, HttpOnly cookie preserved, mobile/desktop",
                      flush=True)
            finally:
                # Restore FastAPI even when an assertion above fails.
                docker("up","-d","--wait","--no-build","--no-deps","api")

            page.get_by_role(
                "button",name="Réessayer d’accéder au royaume").click()
            expect(page.get_by_role("heading",name="Mes mondes")).to_be_visible(
                timeout=25000)
            expect(page.get_by_role(
                "link",name=re.compile("Royaume de démonstration"))).to_be_visible()
            assert cookie_value(context)==original, "Retry replaced player session"
            assert not errors, errors[:3]
            print("PASS: same preserved session resumes when FastAPI is healthy",
                  flush=True)

            # 401 must remain distinguishable from a 503 outage. This is an
            # invalid, synthetic cookie, never a production account/token.
            current=[c for c in context.cookies() if c["name"]=="mmhk_session"][0]
            context.add_cookies([{**current,"value":"invalid_ci_session_token"}])
            page.goto(BASE+"?auth-check=1",wait_until="domcontentloaded",
                      timeout=30000)
            expect(page.get_by_role(
                "heading",name="Accéder au royaume")).to_be_visible()
            expect(page.get_by_text(
                "Votre session a expiré ou a été refusée.")).to_be_visible()
            expect(page.get_by_label("Identifiant")).to_be_visible()
            expect(page.get_by_test_id("session-service-unavailable")).to_have_count(0)
            expect(page.get_by_role(
                "link",name=re.compile("Royaume de démonstration"))).to_have_count(0)
            print("PASS: invalid synthetic cookie returns login state (401), "
                  "never an outage banner",flush=True)
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    main()
