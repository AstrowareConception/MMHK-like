#!/usr/bin/env python3
"""CI assertion: browser preview binds ONLY to loopback; DB/API remain internal."""
from __future__ import annotations

import json
import os
import subprocess


def main() -> None:
    environ = dict(os.environ)
    environ.update({
        "MMHK_PREVIEW_POSTGRES_PASSWORD": "CI-preview-only-not-a-secret",
        "MMHK_LOGIN_RATE_KEY": "ci-preview-login-hmac-test-key-0123456789abcdef",
        "MMHK_PREVIEW_PORT": "3001",
    })
    raw = subprocess.check_output(
        ["docker", "compose", "-f", "compose.preview.yaml", "config", "--format", "json"],
        env=environ,
        text=True,
    )
    config = json.loads(raw)
    services = config["services"]
    assert {"postgres", "redis", "api", "web"} <= set(services)
    for service in ("postgres", "redis", "api", "worker"):
        if service in services:
            assert not services[service].get("ports"), (
                service, "internal service must not publish a port"
            )
    ports = services["web"].get("ports", [])
    assert len(ports) == 1, "Exactly one SSH-tunnel port is permitted"
    port = ports[0]
    assert port.get("host_ip") == "127.0.0.1", port
    assert int(port["target"]) == 3000, port
    assert int(port["published"]) == 3001, port
    assert services["web"]["environment"]["MMHK_PREVIEW_LOOPBACK_ONLY"] == "true"
    assert services["api"]["environment"]["PGHOST"] == "postgres"
    assert services["web"]["environment"]["MMHK_API_INTERNAL_URL"] == "http://api:8000"
    print("Private preview network gate OK: web loopback; API/DB/Redis internal")


if __name__ == "__main__":
    main()
