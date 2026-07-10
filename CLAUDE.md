# CLAUDE.md — working in the Tabi repo

Tabi (旅) is a self-contained React 18 + TypeScript + Vite PWA — a family's 14-day Japan trip companion.
No backend, no external assets; state lives in localStorage/IndexedDB. Read **ROADMAP.md** (what to build,
sequenced v2.1 → v5) and **PROCESS.md** (how this project works: constraint-first method, ten field notes)
before starting substantive work.

## Commands

```bash
npm run dev        # local dev server
npm run build      # typecheck + production build → dist/
npm run check      # the story suite: 33 Playwright checks at iPhone viewport (build first)
```

## The full wrap-up (required before ending any work session)

Never end a turn with work half-landed. After finishing any change:

1. **Verify** — `npm run build` and `npm run check` are green. For visual work, *look at the real render*
   at iPhone viewport across contexts (solar phases, not just noon) — PROCESS.md field note 1.
2. **Commit & push** — clean tree, everything pushed to the session branch. `git status` shows nothing.
3. **Ledger** — when roadmap items ship, update ROADMAP.md's Part IV table (shipped vs. remaining).
   The living ledger is a rule here, not a nicety (PROCESS.md, question 4).
4. **Docs** — update README (and `docs/screens/` screenshots) when a change is user-visible.
5. **Report** — the final message states what shipped, what was verified and how, and anything
   intentionally left open (e.g., no PR without an explicit ask).

A Stop hook (`.claude/hooks/wrapup-check.sh`, wired in `.claude/settings.json`) enforces step 2:
stopping with uncommitted or unpushed work gets bounced back once with a reminder. To stop dirty on
purpose (e.g., awaiting the user's decision about the changes themselves), say why and stop again.

## Conventions

- The ink is the interface: no default-widget UI; artwork is inline SVG driven by CSS custom properties
  (`--art-*`), so every new painting inherits all solar phases for free.
- Semantic tokens per role — never let one token serve two meanings (the `--art-snow` lesson).
- Content is product: itinerary prose, kid tips, and phrase notes are first-class work, not filler.
- Never strand state: any schema change to stored data ships with a silent migration (see src/main.tsx).
- Offline-first, never offline-only: features may use the network, none may require it.
