#!/usr/bin/env python3
"""Prevent protected source material leaking into public Next/Docker distribution."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "apps/web/public"
FORBIDDEN = {"ubisoft", "cdn-bulk", "assets-recovered", "jactari", "acidcave", "screenshots"}
def main():
    assert (ROOT / "apps/web/lib/assets/registry.ts").is_file()
    assert (ROOT / "apps/web/lib/assets/runtime.ts").is_file()
    assert (ROOT / "apps/web/app/api/theme-assets/[id]/route.ts").is_file()
    docker = (ROOT / ".dockerignore").read_text()
    assert "data" in [line.strip() for line in docker.splitlines()], "data/ not excluded from Docker context"
    for p in PUBLIC.rglob("*"):
        if not p.is_file():
            continue
        path = p.relative_to(PUBLIC).as_posix().lower()
        assert not any(x in path for x in FORBIDDEN), f"protected path in public: {path}"
        assert path.startswith("themes/public-safe/"), f"unreviewed public file: {path}"
        assert p.suffix == ".svg", f"unexpected media in public theme: {path}"
        text = p.read_text(encoding="utf-8")
        assert "<svg" in text and "<script" not in text and "<foreignObject" not in text
        safe_text = text.replace("http://www.w3.org/2000/svg", "")
        assert "http://" not in safe_text and "https://" not in safe_text, path
    print("Public-safe assets isolated; private data excluded from Docker context")

if __name__ == "__main__":
    main()
