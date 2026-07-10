#!/bin/bash
# SessionStart hook — a fresh web container arrives ready to build and check.
set -euo pipefail

# web sessions only; local checkouts manage their own node_modules
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# npm install (not ci): the container state is cached after the hook runs,
# and install reuses it. The remote image ships chromium at /opt/pw-browsers,
# so playwright must not download its own (tests/story.mjs knows the path).
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund

# a fresh dist so `npm run check` works from the first turn
npm run build
