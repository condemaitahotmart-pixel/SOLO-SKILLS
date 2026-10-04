#!/bin/bash
set -euo pipefail

# Only needed in Claude Code cloud sessions; locally, install graphify yourself.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install the graphify CLI used by the graphify skill and its hooks.
if ! command -v graphify >/dev/null 2>&1; then
  pip install --quiet graphifyy
fi
