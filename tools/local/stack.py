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
import shutil
import webbrowser
import subprocess
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
ENV = ROOT / ".env.local"
COMPOSE = ROOT / "compose.local.yaml"
PROJECT = ("docker", "compose", "--env-file", str(ENV), "-f", str(COMPOSE))
HISTORICAL = False


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
        (*PROJECT, *(("-f", str(ROOT / "compose.historical.yaml")) if HISTORICAL else ()), *command),
        cwd=ROOT, check=check,
        stdout=output,
    )


def prerequisites() -> None:
    """Explain missing local tooling before attempting to start containers."""
    if sys.version_info < (3, 10):
        raise RuntimeError("Python 3.10 or newer is required.")
    if not shutil.which("docker"):
        raise RuntimeError(
            "Docker was not found. Install Docker Desktop (Windows/macOS) "
            "or Docker Engine + Compose v2 (Linux)."
        )
    for command, description in (
        (("docker", "compose", "version"), "Docker Compose v2"),
        (("docker", "info", "--format", "{{.ServerVersion}}"), "Docker engine"),
    ):
        check = subprocess.run(
            command, cwd=ROOT, stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL, check=False,
        )
        if check.returncode:
            raise RuntimeError(
                f"{description} is not available. Start Docker Desktop "
                "and check that Docker Compose v2 works."
            )


def demo_exists() -> bool:
    """Read the actual local database; a marker file can become stale."""
    query = (
        "from mmhk_api.db import connect; "
        "db = connect(); "
        "found = db.execute("
        "'SELECT EXISTS (SELECT 1 FROM worlds WHERE world_id = %s)', "
        "('local-sandbox',)).fetchone()[0]; "
        "print('present' if found else 'absent'); db.close()"
    )
    output = subprocess.check_output(
        (*PROJECT, "exec", "-T", "api", "python", "-c", query),
        cwd=ROOT, text=True,
    ).strip()
    if output not in ("present", "absent"):
        raise RuntimeError("Unable to verify whether the local demo exists.")
    return output == "present"


def local_url() -> str:
    """Read the configured localhost port, keeping the service private."""
    for line in ENV.read_text(encoding="utf-8").splitlines():
        if line.startswith("MMHK_LOCAL_PORT="):
            port = line.partition("=")[2].strip()
            if port.isdigit() and 1 <= int(port) <= 65535:
                return f"http://localhost:{int(port)}"
            raise RuntimeError("Invalid MMHK_LOCAL_PORT in .env.local")
    return "http://localhost:3000"


def provision_demo(username: str) -> None:
    run("run", "--rm", "-T", "api", "python", "-m", "mmhk_api.local_demo",
        "--username", username)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="MMHK-like all-in-one local Docker stack: localhost only"
    )
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("init", help="Generate ignored .env.local secrets once")
    sub.add_parser("up", help="Build and start all six services including migrations")
    start = sub.add_parser(
        "start", help="One command: check Docker, boot stack, seed demo once and open browser"
    )
    start.add_argument("--username", default="joueurdemo")
    start.add_argument("--historical", action="store_true",
                       help="Enable private restored MMHK art only for this local launch")
    start.add_argument("--no-browser", action="store_true")
    start.add_argument("--no-build", action="store_true",
                       help="Reuse local images instead of rebuilding")
    sub.add_parser("ps", help="Show service state and health")
    logs = sub.add_parser("logs", help="View service logs")
    logs.add_argument("--follow", action="store_true")
    demo = sub.add_parser("demo", help="Create ONE local demo account, world and city")
    demo.add_argument("--username", default="joueurdemo")
    convoy_demo = sub.add_parser(
        "convoy-demo",help="Opt-in LAB-only second owned city for caravan end-to-end tests"
    )
    convoy_demo.add_argument("--username",default="joueurdemo")
    convoy_demo.add_argument("--enable-second-city",action="store_true")
    colony_demo = sub.add_parser(
        "colony-demo",help="Opt-in LAB colony plots; optional synthetic 8-day membership"
    )
    colony_demo.add_argument("--username",default="joueurdemo")
    colony_demo.add_argument("--enable-colony-laboratory",action="store_true")
    colony_demo.add_argument("--age-membership-for-test",action="store_true")
    sub.add_parser("stop", help="Stop containers without destroying persistent data")
    sub.add_parser("down", help="Remove containers but retain PostgreSQL volume")
    reset = sub.add_parser("reset", help="DANGER: delete all LOCAL PostgreSQL data")
    reset.add_argument("--yes-delete-local-data", action="store_true")
    sub.add_parser("backup", help="Write a timestamped PostgreSQL .dump to ./backups")
    args = parser.parse_args()

    if args.command == "init":
        init()
        return 0
    if args.command == "start":
        prerequisites()
        init()
        if args.historical:
            if not shutil.which("node"):
                raise RuntimeError("Node.js is required to prepare the private historical theme.")
            subprocess.run(["node", "tools/prepare-private-historical.mjs"],
                           cwd=ROOT, check=True)
            (ROOT / "data/assets-private-reconstructed").mkdir(
                parents=True, exist_ok=True)
            global HISTORICAL
            HISTORICAL = True
            print("Historical theme enabled for this localhost launch.", flush=True)
        print("\n[1/3] Starting the isolated Docker stack...", flush=True)
        command = ("up", "-d", "--wait") if args.no_build else (
            "up", "-d", "--build", "--wait"
        )
        run(*command)
        print("[2/3] Checking the persistent demo world...", flush=True)
        if demo_exists():
            print("Existing demo preserved. No account, world or password reset.")
            print("Use the password saved when this world was first created.")
        else:
            print("Creating your first demo account. SAVE THE PASSWORD BELOW.",
                  flush=True)
            provision_demo(args.username)
        # Extend the existing sandbox without deleting any original player state.
        # This executable is guarded by MMHK_LOCAL_DEMO_ENABLED and PGDATABASE.
        run("exec", "-T", "api", "python", "-m", "mmhk_api.demo_expansion")
        url = local_url()
        print(f"\n[3/3] Ready: {url}", flush=True)
        print("Close this terminal only after saving the generated password.")
        print("Use 'python tools/local/stack.py stop' to stop the stack.")
        if not args.no_browser:
            webbrowser.open(url)
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
        provision_demo(args.username)
    elif args.command == "convoy-demo":
        if not args.enable_second_city:
            parser.error("convoy-demo requires --enable-second-city")
        run("exec","-T","api","python","-m","mmhk_api.caravan_demo",
            "--username",args.username,"--enable-second-city")
    elif args.command == "colony-demo":
        if not args.enable_colony_laboratory:
            parser.error("colony-demo requires --enable-colony-laboratory")
        command=("exec","-T","api","python","-m","mmhk_api.colony_demo",
                 "--username",args.username,"--enable-colony-laboratory")
        if args.age_membership_for_test:
            command+=("--age-membership-for-test",)
        run(*command)
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
    except (OSError, subprocess.CalledProcessError, RuntimeError) as exc:
        print(f"Docker stack operation failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
