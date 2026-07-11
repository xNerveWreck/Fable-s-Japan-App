# Sign & Etiquette Decoder — Design

**Date:** 2026-07-10 · **Roadmap item:** 🤖 AI companion, "Sign & Etiquette Decoder" (`S · AI`)
**Status:** design + plan committed; **build deferred** until the owner says go.
**Unblocks:** resolves DECISIONS.md #14 — the API-key architecture is decided (below).

## Intent

Camera on any onsen rules placard, shrine instruction board, or coin-locker screen; back
comes not a translation but *what this means and what your family should do next*,
faux-pas warnings first.

Compass fit: **offline-first, never offline-only** — the first Tabi feature to use the
network at runtime; with no signal it degrades to a calm explanation, and nothing else in
the app depends on it. **Quiet by default** — no prompts until the card is tapped; the tap
is the camera-permission gesture. **The ink is the interface** — the answer renders as a
painted card, not a chat bubble.

## Key architecture (owner decision, 2026-07-10 — resolves #14)

**Bring-your-own key, on-device.** The owner pastes an Anthropic API key once per phone
into Kit → settings. Stored in `localStorage` as `tabi:claude-key` (via `useStored`),
masked after save, **never** added to `collectState()` in `src/lib/sync.ts` (the voice
recordings precedent, DECISIONS.md #11), never in the repo or bundle. The browser calls
`https://api.anthropic.com/v1/messages` directly — officially supported CORS mode via the
`anthropic-dangerous-direct-browser-access: true` request header, whose intended use case
is exactly this BYO-key pattern. Safety posture: use a key from a dedicated Console
workspace with a monthly spend cap, so a lost phone bounds the blast radius; the key is
revocable in Console at any time. No backend exists or is planned for this feature.

**Model (owner decision):** `claude-opus-4-8` — best vision + judgment; ≈ 2¢ per decode
(one ~1080p photo + ~400-token answer), a heavy trip's use ≈ $2.

## Where it lives

**Speak tab**, a card below the search box: "Decode a sign · 読む" with a one-line promise
("photograph any sign — learn what it means and what to do"). Decoding is a communication
verb; it belongs with the phrasebook. No new tab, no floating button.

**Kit settings** gains an "AI key" row: password-type input, paste once, ✓ shown when a
key is present, "clear" affordance. A short note explains where to get a key and the
spend-cap recommendation.

## The flow

1. Tap the card → hidden `<input type="file" accept="image/*" capture="environment">`
   opens the **native camera** (no getUserMedia, no permission plumbing).
2. Photo → canvas downscale to ≤ 1568 px long edge, JPEG ≈ 0.8 → base64 (data-URI prefix
   stripped).
3. `fetch` POST `https://api.anthropic.com/v1/messages` with headers `content-type:
   application/json`, `x-api-key: <stored key>`, `anthropic-version: 2023-06-01`,
   `anthropic-dangerous-direct-browser-access: true`. Body:
   - `model: "claude-opus-4-8"`, `max_tokens: 1024`, **no `thinking` param** (on Opus 4.8
     omitting it runs without thinking — the right latency trade for a street-corner
     lookup; structured output keeps the answer tight),
   - `system`: the family context — parents + two kids, first Japan trip, decode the
     photographed sign/notice; kid-plain English; faux-pas warnings first; if the image
     isn't a sign or is unreadable, say so plainly,
   - `messages`: one user turn — the image block (`type: "image"`, base64, `image/jpeg`)
     then a text block ("What does this say, and what should our family do?"),
   - `output_config.format`: JSON schema `{ reads: string, means: string, do: string[],
     warnings: string[] }`, `additionalProperties: false`, all required (empty arrays
     allowed) — guaranteed parseable, no prefill (prefill 400s on Opus 4.8).
4. While in flight: ink-brush spinner, "Reading the sign…".
5. Render the result card: **warnings first** in vermillion, then *What it says* (`reads`),
   *What it means* (`means`), *What to do* (`do` as brush-tick list). A "decode another"
   affordance resets.

## Every failure has a face

| State | Card says |
|---|---|
| No key stored | "The decoder needs a key. Paste yours in Kit → AI key." (one tap navigates there) |
| Offline / fetch throws | "The decoder needs the sky — no signal here. The painting still works." |
| 401 | "That key didn't work — check it in Kit." |
| 429 / 529 / 5xx | "Claude is busy — try again in a moment." |
| `stop_reason: "refusal"` | "Claude declined to read this one." |
| Unparseable / non-sign image | The schema's `reads`/`means` carry the model's plain "this doesn't look like a sign" — rendered like any result |

Errors are branched on HTTP status and the response `error.type` — never string-matched
messages.

## Verification (offline, deterministic)

The story suite must never hit the network. A `?lens=<fixture>` query hook (same pattern
as `?ride`/`?clock`/`?vg`) short-circuits **only the fetch** with bundled fixture JSON:
`?lens=ok` (full result with one warning), `?lens=offline` (simulated network failure),
`?lens=badkey` (simulated 401). Key present/absent is driven by seeding `localStorage`
in the test, not by fixtures. Checks: card renders in Speak; no key → Kit pointer;
`?lens=ok` with a seeded key → warnings render first; `?lens=offline` → sky message;
**the sync payload never contains the key** (assert `collectState()` output lacks it
after a key is stored). Field-note-1 visual pass, day and
night.

## Out of scope (v1)

Menu Lens (allergy cross-checking is its own roadmap item with higher stakes); decode
history/persistence; pinning a decode into the Kioku journal; speaking the answer aloud;
photo upload from the library (camera only keeps the flow honest — revisit if the family
asks); any backend.
