---
name: brainstorm
description: Multi-lens parallel brainstorm — fan out 6–10 ideation agents, each attacking the subject from a different professional angle, then converge with a single hand into a tiered, sequenced idea document. Use when the user wants to brainstorm a new idea or product, generate a roadmap or vision doc, explore a possibility space, or says things like "don't hold back", "what else could this be", "give me every idea".
---

# 多面 Tamen — The Multi-Lens Brainstorm

One mind brainstorming produces variations on its first idea. Eight minds that cannot see each other
produce a *possibility space*. This skill fans out parallel ideation agents — each locked to a single
professional lens — then converges their output through one editorial hand.

**The two laws (violate neither):**
1. **Parallelize generation, never taste.** Agents diverge blind to each other; deduplication, tiering,
   and voice belong to ONE synthesizer (you), never to a committee.
2. **Convergent evidence is signal.** When 3+ independent lenses propose the same idea, flag it in the
   output — independent convergence is the closest a brainstorm gets to market proof.

## Step 1 — Frame (do this before any fan-out)

Write a compact CONTEXT block (10–20 lines) that every agent will receive verbatim:
- What the subject is, and its current state (finished v1? blank page? struggling product?)
- Who it is for — the specific audience, not a demographic
- What already exists, so agents extend rather than restate (list features/ideas already known)
- Which constraints are LIFTED for this brainstorm and which still bind (budget? platform? ethics?)
- The register: showcase project, commercial product, personal tool?

If the subject is genuinely underspecified (no audience, no medium), ask the user 1–2 questions first.
Otherwise infer from the repo/conversation and proceed — a sharp guess beats an interrupted flow.

## Step 2 — Choose the lenses (6–10)

Adapt to the domain; never run generic "marketing/engineering/design" lenses — each lens must be a
*specific professional obsession* with taste of its own. The palette that works:

| Lens archetype | The obsession | Tabi example |
|---|---|---|
| **Primary-persona delight** | What makes the most important user the protagonist? | Kids' play & agency |
| **Ground-truth operations** | What removes real friction at the moment of use? | Parents' logistics in Japan |
| **Platform maximalism** | Deepest possible integration with the host platform | iOS widgets, Watch, UWB, Live Activities |
| **AI-native** | What only becomes possible with a model in the loop? | Menu Lens, bedtime-story generator |
| **Memory & emotion** | What turns usage data into something kept for 20 years? | Printed scrolls, voice heirlooms |
| **Multi-user / social** | What changes when it stops being single-player? | Family sync, grandparents' window |
| **Craft & aesthetics** | The design language as a living system | Weather-painted skies, ink physics |
| **Founder ambition** | The product line, the platform, versions 3 and 5 | Destination packs, marketplace |

Swap freely per domain (a CLI tool might want: power-user, newcomer, ecosystem, performance-fanatic,
docs-as-product, monetization, contrarian, accessibility). **Always consider one contrarian lens** —
e.g. "argue the strongest version of keeping the constraint everyone else is breaking" (Tabi's
Build-Time Lore Press came from exactly this instinct).

## Step 3 — Fan out (Workflow tool)

Launch one agent per lens **in parallel** with a structured-output schema. Template:

```js
export const meta = {
  name: 'multi-lens-brainstorm',
  description: 'Parallel ideation across N professional lenses',
  phases: [{ title: 'Ideate', detail: 'one agent per lens' }],
}
const CONTEXT = `<the Step-1 frame, verbatim>`
const SCHEMA = {
  type: 'object',
  properties: { ideas: { type: 'array', items: { type: 'object', properties: {
    title:  { type: 'string' },
    pitch:  { type: 'string', description: '2-4 sentences: what it is and why the audience would love it' },
    effort: { type: 'string', enum: ['S', 'M', 'L', 'XL'] },
    wow:    { type: 'number', description: '1-5 how magical / showcase-worthy' },
    breaks_constraints: { type: 'boolean' },
  }, required: ['title', 'pitch', 'effort', 'wow', 'breaks_constraints'] } } },
  required: ['ideas'],
}
const LENSES = [ ['key', 'You are <specific obsessive professional>. <what they hunt for>.'], /* ... */ ]
phase('Ideate')
const results = await parallel(LENSES.map(([key, brief]) => () =>
  agent(
    `${CONTEXT}\nYour lens: ${brief}\n\nProduce 12-15 distinct, concrete ideas through this lens.` +
    ` No idea too small or too wild — include at least 2 moonshots. Do not restate existing features;` +
    ` extend or transcend them. Be specific to THIS subject, not generic filler.`,
    { label: `lens:${key}`, phase: 'Ideate', schema: SCHEMA }
  ).then((r) => ({ lens: key, ideas: r.ideas }))
))
return results.filter(Boolean)
```

Prompt rules that matter: demand **12–15 ideas** (the first five are always obvious — the gold lives
past idea eight); demand **2+ moonshots** explicitly (permission must be specific to work); forbid
restating what exists; forbid generic filler by name.

If the Workflow tool is unavailable, launch the lenses as parallel Agent-tool calls in one message —
same prompts, same schema instruction in prose.

## Step 4 — Converge with a single hand

You, alone, now:
1. **Dedupe** across lenses; when merging, keep the sharpest pitch and note which lenses converged.
2. **Flag convergent evidence** — "N independent lenses proposed this" goes in the document.
3. **Tier**: *Committed next* (few, specced) → *The Field* (organized by theme, everything worth doing)
   → *Moonshot Shelf* (the wildest, kept loud on purpose — never delete a moonshot for being absurd).
4. **Tag** every idea: effort (S/M/L/XL) + dependency class (offline/net/backend/AI/native/physical —
   adapt tags to domain).
5. **Sequence** into named versions with themes, so the document reads as a story, not a pile.
6. **Add a compass**: 3–5 principles that decide future arguments (what may never be violated, what is
   merely preferred).

## Step 5 — Deliver

Write the result as a durable document (`ROADMAP.md` / `IDEAS.md`) in the project — an idea that lives
only in chat is an idea scheduled for deletion. Commit it if in a repo. Close the loop with the user on
the 3–5 ideas YOU would build first, with reasons — the synthesis is not neutral; taste is the deliverable.

## Anti-patterns

- **Committee convergence** — letting an agent "vote" or merge ideas. Voting kills weirdness; weirdness
  is the point of the fan-out.
- **Generic lenses** — "a marketer" produces marketing copy; "a battle-scarred family-travel logistics
  expert" produces the takkyubin luggage-forwarding wizard. Specificity in, specificity out.
- **Quietly dropping moonshots** — the shelf exists because ideas that make no economic sense sometimes
  define the product. Keep them loud, tagged XL, undeleted.
- **Skipping the frame** — agents without the "what already exists" list will proudly reinvent the
  current feature set.

---
*Extracted from the Tabi (旅) project, where 8 lenses × ~15 ideas → 117 raw → one roadmap — and the
best validation was four lenses independently inventing the same printed trip scroll. See PROCESS.md
in that repo for the wider method.*
