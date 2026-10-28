#!/usr/bin/env python3
"""Convenience wrapper for the COMPLETE LOCAL (never public) MMHK-like stack.

Requires Python >=3.10 and Docker Compose v2; no Python dependencies.
Secrets are generated on the host and held in .env.local (gitignored).
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import secrets
import subprocess
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
ENV = ROOT / ".env.local"
COMPOSE = ROOT / "compose.local.yaml"
PROJECT = ("docker", "compose", "--env-file", str(ENV), "-f", str(COMPOSE))


def init() -> None:
    if ENV.exists():
        print(f"Using existing local configuration: {ENV.name}")
        return
    content = (
        "# GENERATED for localhost only; DO NOT COMMIT. Keep these secrets.\n"
        "# Edit the port if 3000 is occupied; run 'down' before editing.\n"
        "MMHK_LOCAL_PORT=3000\n"
        f"MMHK_LOCAL_POSTGRES_PASSWORD={secrets.token_hex(32)}\n"
        f"MMHK_LOGIN_RATE_KEY={secrets.token_hex(32)}\n"
    )
    fd = os.open(ENV, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(content)
    except Exception:
        ENV.unlink(missing_ok=True)
        raise
    print("Local secrets created in .env.local (not printed, gitignored).")


def run(*command: str, check: bool = True, output=None) -> subprocess.CompletedProcess:
    return subprocess.run(
        (*PROJECT, *command), cwd=ROOT, check=check,
        stdout=output,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="MMHK-like all-in-one local Docker stack: localhost only"
    )
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("init", help="Generate ignored .env.local secrets once")
    sub.add_parser("up", help="Build and start all six services including migrations")
    sub.add_parser("ps", help="Show service state and health")
    logs = sub.add_parser("logs", help="View service logs")
    logs.add_argument("--follow", action="store_true")
    demo = sub.add_parser("demo", help="Create ONE local demo account, world and city")
    demo.add_argument("--username", default="joueurdemo")
    sub.add_parser("stop", help="Stop containers without destroying persistent data")
    sub.add_parser("down", help="Remove containers but retain PostgreSQL volume")
    reset = sub.add_parser("reset", help="DANGER: delete all LOCAL PostgreSQL data")
    reset.add_argument("--yes-delete-local-data", action="store_true")
    sub.add_parser("backup", help="Write a timestamped PostgreSQL .dump to ./backups")
    args = parser.parse_args()

    if args.command == "init":
        init()
        return 0
    if args.command == "reset":
        if not args.yes_delete_local_data:
            parser.error("reset requires --yes-delete-local-data (irreversible)")
        if not ENV.exists():
            parser.error(".env.local not found; refusing to identify a stack to reset")
        run("down", "--volumes", "--remove-orphans")
        print("Local stack and database volume removed. The .env.local secrets remain.")
        return 0

    if not ENV.exists():
        if args.command in ("up", "demo"):
            init()
        else:
            parser.error(".env.local not found; run 'init' or 'up' first")

    if args.command == "up":
        run("up", "-d", "--build", "--wait")
        print("Local application: http://localhost:3000")
        print("Create a player and sample data: python3 tools/local/stack.py demo")
    elif args.command == "ps":
        run("ps", "--all")
    elif args.command == "logs":
        run("logs", "--tail", "150", *(["--follow"] if args.follow else []))
    elif args.command == "demo":
        # No default password in the repository, environment or process list.
        # The trusted Python CLI prints a newly generated password ONCE.
        run("run", "--rm", "-T", "api", "python", "-m", "mmhk_api.local_demo",
            "--username", args.username)
    elif args.command == "stop":
        run("stop")
    elif args.command == "down":
        run("down", "--remove-orphans")
        print("PostgreSQL volume preserved. To delete it, use reset explicitly.")
    elif args.command == "backup":
        directory = ROOT / "backups"
        directory.mkdir(mode=0o700, exist_ok=True)
        filename = directory / ("mmhk-local-" +
            datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%SZ") + ".dump")
        with filename.open("xb") as stream:
            try:
                run("exec", "-T", "postgres", "pg_dump", "-U", "mmhk_local",
                    "-d", "mmhk_local", "-Fc", output=stream)
            except BaseException:
                filename.unlink(missing_ok=True)
                raise
        os.chmod(filename, 0o600)
        print(f"Database backup created: {filename.relative_to(ROOT)}")
        print("Verify restoration on a SEPARATE disposable database before relying on it.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, subprocess.CalledProcessError) as exc:
        print(f"Docker stack operation failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
