# 型 Kata — The Process Behind Tabi

> *Kata: a form practiced until it becomes instinct.* This document extracts the working method that
> produced this project — an app built inside a strict constraint, then a roadmap built by deliberately
> dissolving it. It exists so the next project starts with the method as a choice instead of an accident.

---

## What happened here, in four beats

1. **A constraint was adopted** — *self-contained: no network, no backend, no external assets, ever.*
   It was chosen instinctively, not declared.
2. **Version 1 was built entirely inside it.** The constraint generated the identity: no image files
   forced hand-drawn SVG; no font CDN forced New York and Hiragino off the device; no server forced
   "the link *is* the data" sync; no runtime AI forced the content to be written with care up front.
   The best things in the app were not ideas — they were **consequences**.
3. **The constraint was interrogated** ("why did you economize?") and found to be partly unexamined —
   a protective habit wearing a generative costume. Ambitious work (vignettes, the route map, stamps)
   had been silently cut with no record it was ever considered.
4. **The constraint was deliberately dissolved** and an unconstrained divergence produced the roadmap —
   which is good *precisely because* every wild idea had to answer to an identity that already existed.
   What survived came back as principles, not rules ("offline-first, never offline-only").

## Why the order worked

Classic design thinking says **diverge first, converge second**. This project did the opposite, and the
reversal was the point:

> Divergence-first assumes imagination is the bottleneck. For a maker who can generate essentially
> anything, imagination is not the scarce resource — **coherence is**. Unlimited option-space produces
> the everything-app. A single sharp constraint forces every decision through one gate, and that gate is
> where identity comes from. Diverge *after* something coherent exists, so the wild ideas have a spine
> to push against.

## The kata

```
1. DECLARE   Choose one generative constraint, out loud, with the reason
             and the owner attached. "I'm building X under constraint Y
             because Z — veto anytime."
2. BUILD     Make v1 entirely inside it. Let the constraint make the
             decisions. Keep a written ledger of everything it cuts.
3. DISSOLVE  When v1 is real, lift the constraint deliberately and
             diverge without judgment. The ledger seeds the roadmap.
4. GRADUATE  Retire the rule; keep what it taught as principles.
             The constraint dies, its consequences live.
```

## The six questions

Ask at the start, at every milestone, and at the end.

| # | Question | When | The trap it catches |
|---|----------|------|---------------------|
| 1 | **What one constraint gives this project its identity?** Choose it on purpose. | Start | Zero constraints isn't freedom — it's entropy. |
| 2 | **Whose constraint is it — and who can lift it?** | Start | Holding a veto that belongs to someone else. The builder adopted a rule the owner never asked for. |
| 3 | **Is it generative or merely protective?** Generative constraints *produce* design decisions; protective ones just limit downside. | Start | Risk-aversion wearing taste's costume. "Economizing" is this trap's name. |
| 4 | **What is it silently costing?** Write the cut list down — a living ledger, not a memory. | Always | Trimmed ambition evaporates without a record. This project's roadmap had to be reconstructed by interrogation; it should have been a file from day one. |
| 5 | **Is the constraint still paying rent?** | Each milestone | A rule defended out of habit is a ritual, not a tool. |
| 6 | **What does it leave behind?** Which rules retire; which graduate to principles. | End | Throwing away the lesson with the rule. "No network ever" died; "the ink is the interface" lives. |

## Field notes — ten transferable skills

Smaller than the kata, learned the hard way, worth carrying to any project.

1. **Look at the work, not the build output.** A passing build proves the code compiles; it says nothing
   about whether the deer looks like a deer. Render the real thing at the real viewport and review it like
   an art director. Every visual bug in this project (the clipped title, the capybara-deer, the invisible
   night plane) was caught by *looking*, never by the compiler.
2. **Audit the second context.** Bugs hide where you aren't looking: the dark theme, the second phone, the
   malformed link, the returning user with old data. Everything painted in `--paper` vanished at night until
   snow got its own token. Whatever your "second context" is — visit it deliberately, every time.
3. **Give every meaning its own name.** The `--art-snow` lesson generalized: a color token doing double duty
   (paper *and* snow) works until the themes diverge, then betrays you silently. Semantic tokens per role,
   even when two roles share a value today.
4. **Test the story, not the functions.** The valuable tests here mirrored the narrative of use: set a date →
   check off a moment → reload → it survived; share a link → second phone → merge → both stamped. Include one
   villain (the garbage sync link). A story test catches what unit tests structurally cannot.
5. **Content is product.** More than half of this app is *writing* — the itinerary, the kid tips, the
   phrasebook notes. Most software treats content as filler to be added later; scheduling the prose as a
   first-class build task is why the app feels alive. If the words are placeholder, the product is.
6. **Choose representations that multiply.** CSS variables inside inline SVG meant one set of brushwork
   renders both day and night — every new painting inherited both themes for free. Before building assets,
   ask: is there a representation where the work multiplies instead of duplicates?
7. **Never strand state.** The first schema change (checkboxes → tri-state) shipped with a silent migration,
   even though the only user was hypothetical. Local data is production data from the first commit; the habit
   costs ten lines and the lack of it costs trust.
8. **Parallelize generation, never taste.** The roadmap came from eight parallel brainstorms — but the
   curation, deduplication, and voice stayed in one hand. Fan out for breadth; converge with a single
   sensibility. Bonus signal: when four independent lenses propose the same idea (the printed scroll), that
   convergence is the market talking.
9. **Audit the cut list for bias.** The tell that "economizing" was fear, not taste: everything cut was
   expensive-but-magical, everything kept was safe-but-useful. One systematic skew in what you trim is a
   constraint you haven't admitted to.
10. **Seed the demo.** Screenshots and demos ran on a lived-in trip — day 7, six stamps earned, a reservation
    filed — because empty states hide magic. Craft the demo state as deliberately as the feature.

## Three prompts that changed the project (the owner's side)

The human half of the collaboration had its own technique. Three prompts did disproportionate work:

- **"Why did you choose to economize, when I gave you no guardrails?"** — The interrogation. It didn't ask
  for more work; it asked for the *reasoning behind the trimming*, which surfaced the hidden constraint.
  Reusable form: after any delivery, ask the builder what they traded away and why.
- **"Don't hold back whatsoever. No judgment."** — The permission grant. Explicit license to be ambitious
  produced a categorically different artifact than the initial "full creative control" did, because it
  removed the builder's incentive to pre-shrink ideas to look sensible. Permission must be *specific* to work.
- **"Wait — let's reflect on this for a second. Is this a workflow?"** — The extraction. Pausing at the
  moment of insight and asking "is this generalizable?" is what turned a one-off lesson into PROCESS.md.
  Insights not extracted at the moment they surface are usually lost.

## The one-sentence rule (for human ↔ agent work)

When creative control is handed over, the most valuable thing the builder can do is not to work without
constraints — it is to **surface every self-imposed constraint at the moment of adoption, with the reason
attached.** One declared sentence turns a silent limitation into a shared decision, and turns the eventual
"why didn't you—?" conversation into one that never needs to happen.

---

*Extracted from the building of Tabi (旅), July 2026 — see [ROADMAP.md](ROADMAP.md) for what the method
produced. Constraints first, ambition second; both on purpose.* 🌸
