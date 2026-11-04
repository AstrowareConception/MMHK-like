"""Compose wrapper for E2E on either the normal CI stack or a safe QA project.

Never use the optional override outside the dedicated local QA launcher.
Without environment overrides existing GitHub Actions commands are unchanged.
"""
import os
import re

def compose_cli():
    project=os.environ.get("MMHK_E2E_COMPOSE_PROJECT","")
    envfile=os.environ.get("MMHK_E2E_ENV_FILE",".env.local")
    if project and not re.fullmatch(r"mmhk-qa-[a-z0-9]{6,20}",project):
        raise ValueError("QA project name must start with mmhk-qa-")
    if not envfile or "\n" in envfile or "\r" in envfile:
        raise ValueError("Invalid local QA env file")
    cmd=["docker","compose"]
    if project:
        cmd.extend(["--project-name",project])
    cmd.extend(["--env-file",envfile,"-f","compose.local.yaml"])
    return cmd
