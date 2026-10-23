#!/usr/bin/env python3
"""Offline regression tests for the archived-MMHK Wayback downloader."""
from __future__ import annotations

import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tools/recover-wayback-cdn.py"
spec = importlib.util.spec_from_file_location("mmhk_wayback_recovery", SOURCE)
assert spec is not None and spec.loader is not None
recovery = importlib.util.module_from_spec(spec)
spec.loader.exec_module(recovery)


class PathTests(unittest.TestCase):
    root = "http://static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/"

    def test_regular_historical_location(self):
        url = self.root + "4.1.13-MTR/img/worldMap/zoom1/background.jpg"
        self.assertEqual(str(recovery.safe_path(url)),
                         "4.1.13-MTR/img/worldMap/zoom1/background.jpg")

    def test_old_duplicate_slashes(self):
        for suffix in ["4.1.13-MTR/img//portal/icon.png",
                       "/slideShow/img/big/1.jpg",
                       "4.1.13-MTR///img/frame/item.gif"]:
            with self.subTest(suffix=suffix):
                got = recovery.safe_path(self.root + suffix).as_posix()
                self.assertNotIn("//", got)
                self.assertFalse(got.startswith("/"))
                self.assertNotIn("..", got.split("/"))

    def test_reject_other_domains(self):
        with self.assertRaises(ValueError):
            recovery.safe_path("https://evil.example/u/HOMMK/mmhk/a.png")

    def test_reject_parent_encoded_and_plain(self):
        for suffix in ["4.1.13-MTR/../secrets.txt",
                       "4.1.13-MTR/%2e%2e/secrets.txt",
                       "4.1.13-MTR/img/%5cwindows"]:
            with self.subTest(suffix=suffix):
                with self.assertRaises(ValueError):
                    recovery.safe_path(self.root + suffix)

    def test_query_variants_are_not_merged(self):
        with self.assertRaises(ValueError):
            recovery.safe_path(self.root + "4.1.13-MTR/x.png?different=1")


class SignatureTests(unittest.TestCase):
    def test_supported_images(self):
        recovery.verify_content(b"\x89PNG\r\n\x1a\nmore", "image/png")
        recovery.verify_content(b"GIF89a12345678", "image/gif")
        recovery.verify_content(b"\xff\xd8\xff\x00more", "image/jpeg")

    def test_invalid_signatures_and_archive_error_html(self):
        for value, mime in [
            (b"not a png", "image/png"),
            (b"bad", "image/gif"),
            (b"\x89PNG", "image/jpeg"),
            (b"<!doctype html><html>Wayback unavailable</html>", "image/png"),
            (b"<html>not real JavaScript</html>", "application/x-javascript"),
            (b"", "text/css"),
        ]:
            with self.subTest(mime=mime):
                with self.assertRaises(ValueError):
                    recovery.verify_content(value, mime)

    def test_file_types(self):
        self.assertEqual(recovery.category("image/png"), "images")
        self.assertEqual(recovery.category("application/x-javascript"), "code")
        self.assertEqual(recovery.category("text/xml"), "xml")
        self.assertEqual(recovery.category("video/x-flv"), "video")


class InventoryTests(unittest.TestCase):
    root = PathTests.root

    def test_tiny_inventory_with_invalid_and_conflicting_records(self):
        records = [
            ["original", "mimetype", "timestamp", "digest"],
            [self.root + "v1/img//sample.png", "image/png", "20130524000314", "DIGEST1"],
            [self.root + "v1/img/sample.png", "image/png", "20130524000314", "DIGEST2"],
            [self.root + "v1/../bad.png", "image/png", "20130524000314", "D3"],
            [self.root + "v1/js/prod.js", "application/x-javascript", "20130524000314", "D4"],
        ]
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "cdx.json"
            p.write_text(json.dumps(records), encoding="utf-8")
            found, rejected = recovery.load_inventory(
                p, {"images", "code", "xml", "other", "flash", "video"}, None)
            self.assertEqual(len(found), 2)
            self.assertEqual(len(rejected), 2)
            self.assertEqual(found[0]["relative_path"], "v1/img/sample.png")
            only_js, rejected = recovery.load_inventory(p, {"code"}, None)
            self.assertEqual(len(only_js), 1)
            self.assertEqual(rejected, [])
            only_wrong_version, _ = recovery.load_inventory(
                p, {"code"}, r"^4\.1\.")
            self.assertEqual(only_wrong_version, [])

    def test_pinned_cdx_is_parseable_and_safe(self):
        pinned = ROOT / "data/analysis/wayback-mmhk-cdx-2026-10-23.json"
        if not pinned.is_file():
            self.skipTest("Pinned source inventory not installed")
        found, rejected = recovery.load_inventory(
            pinned, {"images", "code", "xml", "other", "flash", "video"}, None)
        self.assertEqual(len(rejected), 0, rejected[:10])
        self.assertEqual(len(found), 3906)
        self.assertEqual(len({r["relative_path"] for r in found}), len(found))

    def test_replay_url_contains_exact_timestamp(self):
        record = {"timestamp": "20130524000314", "original": self.root + "abc.js"}
        self.assertEqual(
            recovery.replay_url(record),
            "https://web.archive.org/web/20130524000314id_/" + record["original"])


class LedgerTests(unittest.TestCase):
    def test_log_and_resumption_filter(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "ledger.jsonl"
            record = {
                "relative_path": "version/a.gif", "timestamp": "20130524000314",
                "original": PathTests.root + "version/a.gif", "mime": "image/gif",
                "cdx_digest": "ORIGINAL", "kind": "images",
            }
            with p.open("w", encoding="utf-8") as f:
                recovery.add_ledger(f, record, "failed", error="not yet available")
                recovery.add_ledger(f, record, "downloaded", sha256="abcd", bytes=16)
            success = recovery.load_success_ledger(p)
            self.assertEqual(success["version/a.gif"]["sha256"], "abcd")
            self.assertEqual(success["version/a.gif"]["cdx_digest"], "ORIGINAL")


if __name__ == "__main__":
    unittest.main(verbosity=2)
