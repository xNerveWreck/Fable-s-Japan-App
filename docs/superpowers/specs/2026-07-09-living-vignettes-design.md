# Living Vignettes — Design

**Date:** 2026-07-09 · **Roadmap item:** v3 *Ikiteiru*, "Living vignettes" (`L · offline`)
**Approach chosen:** CSS animation layer + one small tilt hook (approved by owner; "music box, not puppeteer")

## Intent

The six city paintings on the day screens become inhabited. The roadmap's words: "tilt-parallax
planes like an unrolling emakimono, a heron crossing the Kamo every few minutes, the ropeway
gondola inching along its cable, Osaka's lanterns flickering after sunset."

Every scene follows the same quiet formula — **depth layers that tilt, one slow ambient motion,
one timed visitor, one after-dark detail** — so the life reads as one system, not six gimmicks.
Nothing fast, nothing loud, at most one event at a time (compass: quiet by default).

## The life plan, per city

| City | Parallax depth | Ambient (always) | Timed visitor (~minutes apart) | After dark (lantern/night) |
|---|---|---|---|---|
| Tokyo | far skyline / near skyline / tower | sketch birds drift across the sky | — (birds are the life) | lit windows twinkle, one at a time |
| Hakone | Fuji / mist / lake+ship | mist band drifts; pirate ship bobs | ropeway gondola inches along a new cable | — |
| Kyoto | receding torii planes (deepest scene) | blossom clouds sway | heron crosses the sky | — |
| Nara | ground / lantern / deer | grass strokes sway | deer dips into a slow bow and rises | stone lantern flame flickers |
| Osaka | castle / neon / crab | crab blinks occasionally | one slow claw-wave | neon circles flicker to life (dark by day) |
| Home | clouds / sea / plane | waves roll; plane rides the air gently | — (the plane is the life) | — |

Each city runs on a different visitor period (e.g. Kyoto ~3 min, Osaka ~2.5 min) with different
offsets, so nothing feels metronomic.

## Tilt & fallback

- Vignette SVGs are regrouped into named depth planes (`vg-sky`, `vg-far`, `vg-mid`, `vg-near`).
  Planes translate a few px, proportional to depth — smoothed/damped so it feels like heavy paper.
- **iOS constraint:** the motion-permission popup can only be summoned from a user tap. Flow:
  first tap on a painting requests permission; a grant is remembered (`tabi:tilt` in localStorage)
  and re-armed silently on later visits. Android/older iOS need no prompt.
- **Fallback ladder:** permission denied or no sensor (desktop) → slow autonomous drift of the same
  planes (the emakimono unrolls by itself). `prefers-reduced-motion: reduce` → painting is fully
  still (no drift, no visitors, no flicker), matching the app's existing petal/ink behavior.

## Architecture

- `src/art/Vignettes.tsx` — same file, scenes regrouped into layer `<g>` elements with classes;
  inhabitants get their own classed groups (`vg-heron`, `vg-gondola`, `vg-windows`, …).
  New elements added: Hakone ropeway cable + gondola, Kyoto heron. Everything stays inline SVG on
  `--art-*` tokens, so all motion inherits every solar phase for free (field note 6).
- `src/hooks/useTilt.ts` — the only new JS. Listens to `deviceorientation`, writes damped
  `--vg-x` / `--vg-y` custom properties on the vignette container; handles the iOS permission
  dance + `tabi:tilt` persistence; early-returns on reduced motion (same pattern as `lib/ink.ts`).
- CSS (screens.css, vignette section) — all motion is CSS keyframes. "Every few minutes" =
  long-duration cycles idle ~90% of the time. After-dark details gate on the existing
  `:root[data-phase='lantern'/'night']` selectors. One `prefers-reduced-motion` block stills all.
- **Demo/test hook:** demo mode (`?demo=1`) and the story suite set a root attribute
  (`data-vg='now'`, also settable via `?vg=now`) that zeroes the long delays so visitors are
  immediately mid-scene — field note 10, seed the demo.

## Data

One new localStorage key: `tabi:tilt` = `'granted' | 'denied'` (absent = never asked).
No schema change to existing stored data → no migration needed.

## Error handling

- Permission request throws / sensor silent → drift fallback, no error surfaced (quiet by default).
- Background tab → browser throttles CSS animations natively; no timers to leak.

## Verification

Story-suite additions (deterministic, using `?clock` + `?vg=now`):

1. Each city painting renders its depth planes and inhabitant groups.
2. An inhabitant's animation is actually running (computed `animation-name`).
3. Osaka neon flickers at the lantern clock, is dark/still at noon; Tokyo windows twinkle at night.
4. A `reducedMotion: 'reduce'` browser context shows no vignette animation.

Plus the human check (field note 1): real render at iPhone viewport across all five solar phases.

## Out of scope

Sound, Sumi, geofencing, the hero painting, the route map, vignettes on any screen other than
day detail, and tilt physics beyond gentle damped translation.
