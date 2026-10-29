#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Python 3.10+ requis.' >&2
  exit 1
fi
exec python3 tools/local/stack.py start --historical "$@"
