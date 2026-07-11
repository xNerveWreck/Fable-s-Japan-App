# Decisions — Tabi (旅)

Settled choices, numbered and dated, with the why. Never silently edit an entry —
a reversal gets a NEW dated entry pointing back at the old number. Decisions made
before this file existed (2026-07-10) were reconstructed from ROADMAP.md,
PROCESS.md, and the docs/superpowers specs; the founding ones live in PROCESS.md's
narrative and are summarized as #1–#3 here.

| # | Date | Decision | Why |
|---|------|----------|-----|
| 1 | pre-2026-07 | **Offline-first, never offline-only** (the retired "no network ever" rule, graduated to a principle) | The painting must work in a tunnel under Osaka; see PROCESS.md for the full story |
| 2 | pre-2026-07 | **The ink is the interface**: all art is inline SVG on CSS custom properties (`--art-*`), no image assets, no hardcoded colors | One set of brushwork renders every solar phase for free; semantic tokens per role (the `--art-snow` lesson) |
| 3 | pre-2026-07 | **Test the story, not the functions**: one Playwright suite (`tests/story.mjs`) walking real narratives at iPhone viewport | Story tests catch what unit tests structurally cannot; see PROCESS.md field note 4 |
| 4 | 2026-07-09 | Story suite spawns vite via `process.execPath`, never `npx` | `spawn('npx')` is ENOENT on Windows; a shell would orphan the preview server on kill() |
| 5 | 2026-07-10 | Living vignettes are **CSS-animation only** (no rAF engine, no SMIL) | Battery on 12-hour trip days; inherits solar phases and reduced-motion for free; the trade-off (fixed visitor schedules) accepted knowingly |
| 6 | 2026-07-10 | **Tilt by default** (owner's pick over my drift-first recommendation): first tap on a painting summons the iOS motion prompt; grant remembered in `tabi:tilt`; drift fallback everywhere else | Owner chose immersion; iOS only allows the prompt from a tap, so "default" means first-tap |
| 7 | 2026-07-10 | Reduced motion = **still painting, same scene** — night neon stays lit statically | Accessibility must remove motion, not change the art (caught in review when the neon went dark) |
| 8 | 2026-07-10 | Night-time test assertions use `?clock=00:30`, never a computed Tokyo lantern minute | Mid-trip the solar clock follows the current city's sun; Kyoto's sunset is ~15 min after Tokyo's |
| 9 | 2026-07-10 | Fuji Window is a **day-7 card** (flag `fujiWindow: true` in itinerary data), GPS begun only by the tap, `?ride=` as the offline test/demo hook | Invitation not interruption; the tap doubles as the geolocation permission gesture |
| 10 | 2026-07-10 | Feature branches that touch the same ROADMAP/README lines are **stacked** (fuji-window on living-vignettes) and merged in order | Basing both on main guarantees the owner a merge conflict |
| 11 | 2026-07-10 | Voice recordings live in **IndexedDB only, deliberately NOT in Family Sync** | Audio blobs are far too big for the sync link; each phone keeps its own voices |
| 12 | 2026-07-10 | Side Quests v1 ships **without photo proof** (the find is the family's word); geo unlock only when permission is already granted — never prompts | Scope for the flight deadline; quiet-by-default forbids a new prompt for a bonus feature. Photo proof is the named v2 |
| 13 | 2026-07-10 | Trip-critical work is delegated via **executor-grade plan + Sonnet executor waves + orchestrator review between waves**; the executor definition is versioned at `.claude/agents/executor.md` | Owner-directed workflow; caught real bugs in both directions (plan arithmetic, React state-lifting) |
| 14 | 2026-07-10 | The runtime-AI layer (Sign Decoder etc.) is **deferred until an API-key architecture is decided**; Haiku Engraver, when built, uses **build-time generation** (no runtime AI) | A key has to live somewhere — that's an architecture/security decision, not a feature; haiku describe static stops so CI can pre-bake them |
| 15 | 2026-07-10 | Versioning starts at **v3.1.0** on the trip-pack merge (first git tag; earlier "v2.1"/"v3" were conceptual labels only), with a GitHub Release carrying a zipped `dist/` | Owner's cross-project standard (project-wrapup skill); pre-tag history stays as ROADMAP narrative |
| 16 | 2026-07-10 | Haiku Engraver content is **authored in-session by the model and committed as data** (`src/data/haiku.ts`) — supersedes #14's CI-pre-bake mechanism; the no-runtime-AI principle stands | Strictly less machinery than CI generation: no key in GitHub secrets, no per-build cost, and the diff is the review; the story suite enforces 73/73 coverage |
| 17 | 2026-07-10 | Runtime-AI key architecture (**resolves #14's deferral**): bring-your-own Anthropic key pasted on-device into Kit (localStorage, deliberately never in `collectState()`), browser calls the API directly via the officially supported CORS header; decoder model `claude-opus-4-8` | Owner decision. No backend to build or babysit mid-trip; blast radius bounded by a spend-capped Console workspace and instant revocability; #11 precedent for never-synced device secrets |
