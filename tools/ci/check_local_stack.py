#!/usr/bin/env python3
"""Validate network isolation and automatic startup dependencies of local Docker."""
from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    env = dict(os.environ)
    env.setdefault("MMHK_LOCAL_POSTGRES_PASSWORD", "test-local-db-credentials-only")
    env.setdefault("MMHK_LOGIN_RATE_KEY", "test-local-hmac-0123456789abcdef0123456789")
    env.setdefault("MMHK_LOCAL_PORT", "3000")
    raw = subprocess.check_output(
        ["docker","compose","-f","compose.local.yaml","config","--format","json"],
        cwd=ROOT, env=env, text=True,
    )
    conf=json.loads(raw)
    services=conf["services"]
    assert {"postgres","redis","migrate","api","web","worker"}<=set(services)
    for name in ("postgres","redis","migrate","api","worker"):
        assert not services[name].get("ports"), (name,"published an internal port")
    webports=services["web"].get("ports",[])
    assert len(webports)==1
    assert webports[0]["host_ip"]=="127.0.0.1"
    assert int(webports[0]["target"])==3000
    assert int(webports[0]["published"])==3000
    assert conf["networks"]["backend"]["internal"] is True
    assert services["migrate"]["depends_on"]["postgres"]["condition"]=="service_healthy"
    assert services["api"]["depends_on"]["migrate"]["condition"]=="service_completed_successfully"
    assert services["worker"]["depends_on"]["migrate"]["condition"]=="service_completed_successfully"
    assert services["web"]["depends_on"]["api"]["condition"]=="service_healthy"
    assert services["api"]["environment"]["MMHK_LOCAL_DEMO_ENABLED"]=="true"
    assert services["web"]["environment"]["MMHK_PREVIEW_LOOPBACK_ONLY"]=="true"
    for name in ("api","web","worker"):
        assert services[name]["read_only"] is True
    print("Local stack verified: 6 services, PostgreSQL-first migrations, localhost-only UI")


if __name__=="__main__":
    main()
