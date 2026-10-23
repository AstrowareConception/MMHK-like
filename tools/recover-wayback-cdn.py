#!/usr/bin/env python3
"""Recover historical MMHK CDN snapshots from the pinned Wayback CDX inventory.

No external Python dependencies. The input is an archived index, not a list of
verified downloadable objects: 200 in CDX does not guarantee a working replay.
Images, client JS/CSS, XML, Flash and videos are kept as historical evidence.

Usage:
    python3 tools/recover-wayback-cdn.py --dry-run --limit 20
    python3 tools/recover-wayback-cdn.py --limit 100
    python3 tools/recover-wayback-cdn.py --limit 0 --kinds images,code,xml,flash,video,other

Do not publish the recovered Ubisoft binaries as a newly licensed asset pack.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlsplit
from urllib.request import Request, urlopen


REPO = Path(__file__).resolve().parent.parent
INDEX = REPO / "data/analysis/wayback-mmhk-cdx-2026-10-23.json"
OUTPUT = REPO / "data/assets-recovered/cdn-bulk"
LEDGER = REPO / "data/analysis/wayback-recovery-ledger.jsonl"
CDN_PREFIX = "/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/"
IMAGE_MIMES = {"image/gif", "image/png", "image/jpeg", "image/x-icon"}
CODE_MIMES = {"text/css", "text/javascript", "application/javascript", "application/x-javascript"}
XML_MIMES = {"application/xml", "text/xml", "application/xhtml+xml"}
FLASH_MIMES = {"application/x-shockwave-flash"}
VIDEO_MIMES = {"video/x-flv", "video/mp4"}
KNOWN_KINDS = {"images", "code", "xml", "flash", "video", "other"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def category(mime: str) -> str:
    mime = mime.strip().lower().split(";", 1)[0]
    if mime in IMAGE_MIMES:
        return "images"
    if mime in CODE_MIMES:
        return "code"
    if mime in XML_MIMES:
        return "xml"
    if mime in FLASH_MIMES:
        return "flash"
    if mime in VIDEO_MIMES:
        return "video"
    return "other"


def safe_path(original: str) -> Path:
    """Map one original archive URL to a relative path without traversal."""
    u = urlsplit(original)
    if u.scheme not in {"http", "https"} or u.hostname != "static5.cdn.ubi.com":
        raise ValueError("Unsupported CDN origin")
    path = "/" + u.path.lstrip("/")
    if not path.startswith(CDN_PREFIX):
        raise ValueError("Unknown CDX path prefix")
    raw_suffix = unquote(path[len(CDN_PREFIX):])
    if not raw_suffix or "\x00" in raw_suffix or "\\" in raw_suffix:
        raise ValueError("Invalid filename")
    if any(p in {".", ".."} for p in raw_suffix.split("/")):
        raise ValueError("Relative / parent path segment")
    # Wayback indexed old client URLs containing redundant slashes such as
    # img//portal. Keep the original URL in the ledger, normalize the disk path.
    suffix = re.sub(r"/+", "/", raw_suffix)
    if suffix.startswith("/") or suffix.endswith("/"):
        raise ValueError("Unsafe absolute or directory-only URL")
    parts = PurePosixPath(suffix).parts
    if not parts or any(":" in p for p in parts):
        raise ValueError("Unsafe filename")
    if u.query or u.fragment:
        # Never silently overwrite a query-variant using the same target path.
        raise ValueError("Query / fragment variant needs explicit classification")
    return Path(*parts)


def load_inventory(path: Path, allowed: set[str], version: str | None):
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data:
        raise ValueError("The CDX inventory is not a nonempty JSON array")
    records = []
    rejected = []
    destinations = {}
    for row in data[1:]:
        if not isinstance(row, list) or len(row) != 4:
            rejected.append({"record": str(row)[:120], "reason": "Malformed CDX row"})
            continue
        original, mime, timestamp, digest = row
        if category(mime) not in allowed:
            continue
        try:
            rel = safe_path(original)
            if version and not re.search(version, rel.parts[0]):
                continue
            if not re.fullmatch(r"\d{14}", timestamp):
                raise ValueError("Malformed timestamp")
            if rel.as_posix() in destinations:
                prior = destinations[rel.as_posix()]
                # Multiple historical captures of an identical path require
                # human selection; preserve only the earliest candidate.
                if prior["digest"] != digest:
                    rejected.append({
                        "record": original, "reason": "Version collision, different digest",
                        "previous": prior["original"],
                    })
                continue
            record = {
                "original": original,
                "mime": mime,
                "kind": category(mime),
                "timestamp": timestamp,
                "cdx_digest": digest,
                "relative_path": rel.as_posix(),
            }
            records.append(record)
            destinations[rel.as_posix()] = {"original": original, "digest": digest}
        except (TypeError, ValueError, IndexError) as ex:
            rejected.append({"record": str(original)[:220], "reason": str(ex)})
    return records, rejected


def replay_url(record: dict) -> str:
    return "https://web.archive.org/web/" + record["timestamp"] + "id_/" + record["original"]


def load_success_ledger(path: Path) -> dict:
    success = {}
    if not path.is_file():
        return success
    with path.open(encoding="utf-8") as f:
        for line in f:
            try:
                record = json.loads(line)
            except (ValueError, TypeError):
                continue
            if record.get("status") in {"downloaded", "verified-existing"}:
                success[record["relative_path"]] = record
    return success


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            block = f.read(1024 * 1024)
            if not block:
                break
            h.update(block)
    return h.hexdigest()


def verify_content(body: bytes, mime: str) -> None:
    head = body[:2048].lstrip().lower()
    if not body:
        raise ValueError("Empty Wayback response")
    if head.startswith((b"<html", b"<!doctype html", b"<head", b"<body")):
        raise ValueError("HTML replay / error page, not the archived original")
    m = mime.lower()
    if m == "image/png" and not body.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("Invalid PNG signature")
    if m == "image/gif" and not body.startswith((b"GIF87a", b"GIF89a")):
        raise ValueError("Invalid GIF signature")
    if m == "image/jpeg" and not body.startswith(b"\xff\xd8\xff"):
        raise ValueError("Invalid JPEG signature")
    if m == "application/x-shockwave-flash" and body[:3] not in (b"FWS", b"CWS", b"ZWS"):
        raise ValueError("Invalid Flash signature")
    if m == "video/x-flv" and not body.startswith(b"FLV"):
        raise ValueError("Invalid FLV signature")


def fetch(record: dict, timeout: int, retries: int, max_bytes: int) -> tuple[bytes, str]:
    url = replay_url(record)
    error = None
    for attempt in range(retries + 1):
        try:
            req = Request(url, headers={
                "User-Agent": "MMHK-Historical-Research/1.0 (one-request-at-a-time)",
                "Accept": "*/*",
            })
            with urlopen(req, timeout=timeout) as response:
                declared = response.headers.get("Content-Length", "")
                if declared.isdigit() and int(declared) > max_bytes:
                    raise ValueError("Snapshot exceeds max bytes (Content-Length)")
                pieces = []
                length = 0
                while True:
                    piece = response.read(min(65536, max_bytes - length + 1))
                    if not piece:
                        break
                    length += len(piece)
                    if length > max_bytes:
                        raise ValueError("Snapshot exceeds max bytes (stream)")
                    pieces.append(piece)
                body = b"".join(pieces)
                verify_content(body, record["mime"])
                return body, response.headers.get("Content-Type", "unknown")
        except (HTTPError, URLError, TimeoutError, ValueError, OSError) as ex:
            error = str(ex)
            if attempt < retries:
                time.sleep(min(2 ** attempt, 16))
    raise RuntimeError(error or "Unknown download failure")


def add_ledger(f, record: dict, status: str, **extra):
    entry = {
        **record,
        "snapshot_url": replay_url(record),
        "status": status,
        "checked_at": utc_now(),
        **extra,
    }
    f.write(json.dumps(entry, ensure_ascii=False, sort_keys=True) + "\n")
    f.flush()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--index", type=Path, default=INDEX, help="CDX JSON archive inventory")
    parser.add_argument("--output", type=Path, default=OUTPUT, help="Archive root for recovered assets")
    parser.add_argument("--ledger", type=Path, default=LEDGER, help="Append-only JSONL provenance")
    parser.add_argument("--kinds", default="images,code,xml,flash,video,other",
                        help="Comma-separated: images,code,xml,flash,video,other")
    parser.add_argument("--version", help="Optional regex for version directory, e.g. 4\\.1\\.13-MTR")
    parser.add_argument("--limit", type=int, default=0, help="Count of URL attempts; 0 = complete catalogue")
    parser.add_argument("--timeout", type=int, default=45)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--delay", type=float, default=1.0, help="Polite delay between snapshots in seconds")
    parser.add_argument("--max-bytes", type=int, default=40 * 1024 * 1024)
    parser.add_argument("--dry-run", action="store_true", help="Report candidates, do not download")
    args = parser.parse_args()

    allowed = {part.strip() for part in args.kinds.split(",")}
    if not allowed or not allowed.issubset(KNOWN_KINDS):
        parser.error("Invalid kinds; choose from " + ",".join(sorted(KNOWN_KINDS)))
    if args.limit < 0 or args.retries < 0 or args.delay < 0 or args.max_bytes < 1:
        parser.error("Negative limits, delays or retries are not supported")
    if not args.index.is_file():
        parser.error("No inventory at " + str(args.index))
    records, rejected = load_inventory(args.index, allowed, args.version)
    selected = records[:args.limit] if args.limit else records
    counts = {kind: sum(r["kind"] == kind for r in records) for kind in sorted(allowed)}
    print(json.dumps({
        "index": str(args.index), "candidates": len(records),
        "selected": len(selected), "kinds": counts, "rejected": len(rejected),
        "dry_run": args.dry_run,
    }, ensure_ascii=False))
    if args.dry_run:
        for r in selected[:20]:
            print(r["kind"], r["relative_path"], replay_url(r))
        if rejected:
            print("Rejected examples:", json.dumps(rejected[:5], ensure_ascii=False))
        return 0

    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    args.ledger.parent.mkdir(parents=True, exist_ok=True)
    success = load_success_ledger(args.ledger)
    totals = {"downloaded": 0, "skipped_verified": 0, "failed": 0, "existing_untracked": 0}
    with args.ledger.open("a", encoding="utf-8") as log:
        for pos, r in enumerate(selected, 1):
            rel = r["relative_path"]
            target = (output / rel).resolve()
            if not target.is_relative_to(output):
                add_ledger(log, r, "rejected", error="Destination escapes output root")
                totals["failed"] += 1
                continue
            old = success.get(rel)
            if target.is_file():
                existing_hash = sha256(target)
                if (old and existing_hash == old.get("sha256")
                        and old.get("cdx_digest") == r["cdx_digest"]):
                    totals["skipped_verified"] += 1
                    continue
                if not old:
                    add_ledger(log, r, "existing-untracked", sha256=existing_hash,
                               error="Preserved local file with no verified provenance")
                    totals["existing_untracked"] += 1
                    continue
                # Never overwrite files with mismatched hash or provenance silently.
                add_ledger(log, r, "hash-mismatch", sha256=existing_hash,
                           expected_sha256=old.get("sha256"))
                totals["failed"] += 1
                continue
            try:
                body, server_type = fetch(r, args.timeout, args.retries, args.max_bytes)
                target.parent.mkdir(parents=True, exist_ok=True)
                temp = target.with_name(target.name + ".partial-" + str(os.getpid()))
                try:
                    with temp.open("wb") as f:
                        f.write(body)
                    os.replace(temp, target)
                finally:
                    temp.unlink(missing_ok=True)
                digest = hashlib.sha256(body).hexdigest()
                add_ledger(log, r, "downloaded", sha256=digest, bytes=len(body),
                           response_type=server_type)
                success[rel] = {"sha256": digest}
                totals["downloaded"] += 1
            except (RuntimeError, ValueError, OSError) as ex:
                add_ledger(log, r, "failed", error=str(ex))
                totals["failed"] += 1
            print(f"[{pos}/{len(selected)}] {rel}: "
                  f"ok={totals['downloaded']} failure={totals['failed']}", flush=True)
            if args.delay and pos < len(selected):
                time.sleep(args.delay)
    print(json.dumps(totals, ensure_ascii=False))
    return 0 if totals["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
