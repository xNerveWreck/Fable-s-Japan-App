#!/usr/bin/env bash
# Stop hook: bounce the stop once if work is left uncommitted or unpushed,
# pointing at the full wrap-up checklist in CLAUDE.md. Passes silently on a
# clean, pushed tree — and always passes the second time (stop_hook_active)
# so an intentional dirty stop is possible after explaining why.
set -u

input=$(cat 2>/dev/null || true)
if printf '%s' "$input" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

problems=()
[ -n "$(git status --porcelain 2>/dev/null)" ] && problems+=("uncommitted changes in the working tree")
if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  [ -n "$(git log --oneline '@{u}..HEAD' 2>/dev/null)" ] && problems+=("commits not pushed to upstream")
else
  # no upstream configured: fine if HEAD already exists on some remote branch
  [ -z "$(git branch -r --contains HEAD 2>/dev/null)" ] && problems+=("local commits on a branch that was never pushed")
fi

if [ ${#problems[@]} -gt 0 ]; then
  reason="Wrap-up incomplete: $(IFS='; ' && echo "${problems[*]}"). Do the full wrap-up in CLAUDE.md: verify (npm run build && npm run check), commit, push, update the ROADMAP ledger (and README/screenshots if user-visible), then report the final state. If stopping here is intentional — e.g. you are waiting on user input about these exact changes — say so explicitly and stop again."
  jq -cn --arg r "$reason" '{decision: "block", reason: $r}'
fi
exit 0
