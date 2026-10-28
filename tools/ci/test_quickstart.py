#!/usr/bin/env python3
"""Dependency-free tests for the one-command local launcher (no Docker required)."""
from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parents[1] / "local" / "stack.py"
spec = importlib.util.spec_from_file_location("mmhk_local_stack", SCRIPT)
assert spec and spec.loader
stack = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stack)


class QuickstartTests(unittest.TestCase):
    def test_first_launch_builds_and_creates_demo(self):
        with (
            mock.patch.object(stack, "prerequisites") as prerequisites,
            mock.patch.object(stack, "init") as init,
            mock.patch.object(stack, "run") as run,
            mock.patch.object(stack, "demo_exists", return_value=False),
            mock.patch.object(stack, "local_url", return_value="http://localhost:3000"),
            mock.patch.object(stack.webbrowser, "open") as open_browser,
            mock.patch.object(sys, "argv", ["stack.py", "start"]),
        ):
            self.assertEqual(stack.main(), 0)
        prerequisites.assert_called_once()
        init.assert_called_once()
        self.assertEqual(
            run.call_args_list,
            [
                mock.call("up", "-d", "--build", "--wait"),
                mock.call(
                    "run", "--rm", "-T", "api", "python",
                    "-m", "mmhk_api.local_demo", "--username", "joueurdemo",
                ),
            ],
        )
        open_browser.assert_called_once_with("http://localhost:3000")

    def test_repeat_launch_preserves_demo_and_skips_browser(self):
        with (
            mock.patch.object(stack, "prerequisites"),
            mock.patch.object(stack, "init"),
            mock.patch.object(stack, "run") as run,
            mock.patch.object(stack, "demo_exists", return_value=True),
            mock.patch.object(stack, "local_url", return_value="http://localhost:3000"),
            mock.patch.object(stack.webbrowser, "open") as open_browser,
            mock.patch.object(
                sys, "argv",
                ["stack.py", "start", "--no-browser", "--no-build"],
            ),
        ):
            self.assertEqual(stack.main(), 0)
        run.assert_called_once_with("up", "-d", "--wait")
        open_browser.assert_not_called()

    def test_custom_local_port(self):
        with tempfile.TemporaryDirectory() as directory:
            env_path = Path(directory) / ".env.local"
            env_path.write_text("MMHK_LOCAL_PORT=3123\n", encoding="utf-8")
            with mock.patch.object(stack, "ENV", env_path):
                self.assertEqual(stack.local_url(), "http://localhost:3123")

    def test_no_docker_is_friendly(self):
        with mock.patch.object(stack.shutil, "which", return_value=None):
            with self.assertRaisesRegex(RuntimeError, "Docker was not found"):
                stack.prerequisites()

    def test_existing_world_is_read_from_postgres(self):
        with mock.patch.object(
            stack.subprocess, "check_output", return_value="present\n"
        ) as check:
            self.assertTrue(stack.demo_exists())
        args, kwargs = check.call_args
        self.assertIn("exec", args[0])
        self.assertIn("local-sandbox", args[0][-1])
        self.assertTrue(kwargs["text"])


if __name__ == "__main__":
    unittest.main()
