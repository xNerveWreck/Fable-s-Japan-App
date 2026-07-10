# Fuji Window — Design

**Date:** 2026-07-10 · **Roadmap item:** v3 *Ikiteiru*, "Fuji Window" (`L · offline`)
**Why now:** the Tokyo→Kyoto shinkansen runs once, on Day 7. This is the only roadmap item
with a hard real-world deadline. Owner delegated design ("do what you believe to be best").

## Intent

On the bullet-train day, the app becomes a painted Tōkaidō emakimono: a horizontal scroll of
the route Tokyo→Kyoto that tracks the train's real GPS position, counts down to the moment
Mount Fuji appears — "Fuji on the right in N minutes" — and blooms the mountain across the
painting during the real viewing window (the train passes ~20 km south of the summit around
Shin-Fuji; Fuji is on the RIGHT side heading west).

Compass fit: **invitation, never interruption** — the watch starts only when someone taps
"Begin the watch" (that tap is also the geolocation-permission gesture). **Offline-first** —
GPS works with zero signal; route data and art ship in the bundle. **Kids are protagonists** —
the live speed readout and the LOOK RIGHT moment are theirs.

## Where it lives

A `fujiWindow: true` flag on itinerary Day 7 renders a **Fuji Window card** on that day's
detail screen, below the vignette: the painted scroll strip, a status line, the live speed,
and the begin button. No overlay, no new route — one card.

## The scroll

Inline SVG strip (viewBox `0 0 1560 120`, ~4 stages wide) on existing `--art-*` tokens:
Tokyo skyline → Sagami bay → Odawara/Hakone hills → **Fuji (large, with three bloom washes)**
→ tea-field rows → Lake Hamana → Nagoya castle glyph → rice plains → Kyoto pagoda.
Major stations tick the base line with names. A hanko-red train dot sits at the exact
km-proportional x; the strip pans (CSS transform) to keep the dot centered. Art positions are
impressionistic; the dot and zone geometry are exact.

## Geometry (`src/lib/tokaido.ts`, pure functions)

- 16 Tōkaidō station coordinates Tokyo→Kyoto; cumulative km by haversine (internally
  consistent; absolute rail km not required).
- `project({lat,lon})` → `{ km, s, offKm }`: nearest point on the station polyline
  (per-segment equirectangular projection), distance along route, fraction, and
  perpendicular offset.
- Fuji zone: `km(Mishima)` → `km(Shin-Fuji) + 20` km.
- `statusFor(km, speedKmh, staleSec)` →
  `rolling` (far out) · `soon N` (ETA ≤ 20 min to zone) · `look` (in zone, bloom) ·
  `past` (behind you) · `kyoto` (s > 0.93) · `tunnel` (no fix > 25 s — "tunnels eat the
  signal; the scroll waits").
- Speed: GPS `coords.speed` when present, else derived from successive fixes,
  else 240 km/h assumed.

## GPS & fallbacks

`watchPosition` starts on the button tap (permission prompt has context), stops on unmount.
Denied/unavailable → the card stays a beautiful static painting of the route with the Fuji
zone marked; nothing breaks. `?ride=<fraction>` (e.g. `?ride=0.24`) drives the scroll without
GPS — the demo seed, the screenshot state, and the deterministic test hook.

## Verification

Story-suite section 9: card renders on day 7 (not day 6); `?ride` fractions produce the
countdown, LOOK-RIGHT + bloom, and behind-you states; a geolocation-granted Playwright
context with `setGeolocation` near Shin-Yokohama then near Shin-Fuji drives the REAL
projection path (tap begin → progress → LOOK RIGHT). Field-note-1 visual pass at iPhone
width, day and night.

## Out of scope (v1)

Sound/haptic on zone entry, notifications while backgrounded (PWA can't anyway), the opening
cinematic tie-in, per-city icons, any hero changes. Return-leg (Kyoto→Tokyo doesn't exist in
this trip — day 14 flies from Osaka).
