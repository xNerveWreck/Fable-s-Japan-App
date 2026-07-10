---
name: pickup
description: Resume work on Tabi in a fresh session — audit where the project stands and propose the next increment. Use when the user says "pick up", "continue", "resume", "where were we", or opens a session with no specific ask.
---

# /pickup — resume the journey

Run this audit in order, then report. On the web, the SessionStart hook has already
installed dependencies and built once, so everything below works from the first turn.

0. **Sync** — `git fetch origin`, then make sure the local default branch matches
   `origin/main` (`git merge --ff-only origin/main` from main). Web sessions clone
   fresh so this is a no-op there; a desktop clone lives on between sessions and
   must catch up before anything else, or you'll be building on stale ground.
1. **State** — `git log --oneline -10` and `git status`. Note anything unpushed,
   dirty, or surprising. If the designated session branch's PR was already merged,
   restart the branch from `origin/main` before any new work.
2. **Ledger** — read ROADMAP.md Part IV: what's shipped, what remains in the
   current version. Read CLAUDE.md's conventions if this is your first turn.
3. **Live** — check the latest "Deploy to GitHub Pages" workflow run on `main`;
   the deployed app should match the merge history.
4. **Ground truth** — `npm run check` must be green before proposing new work.
5. **Report** — one short summary: where the project stands, what's live, and a
   recommended next increment from the ledger (respect the compass in ROADMAP
   Part V — offline-first, the ink is the interface, kids are protagonists).
   Wait for the user's pick unless they've said "your call".
