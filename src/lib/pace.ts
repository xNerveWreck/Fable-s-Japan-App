/**
 * The spend pace — Kit's answer to "are we okay?" at a konbini register.
 * The math is pure and offline (offline-first, DECISIONS.md #1): the family
 * sets a cash budget once, logs what a day cost, and the forecast divides
 * what's left across the days that remain. The coach is the optional AI
 * garnish riding the lenses' BYO key (#17) on the same fast brush (#28) —
 * it sees the per-day log AND the itinerary still ahead, so its advice knows
 * that USJ is coming. `?pace=` fixtures keep the story suite off the network.
 */

import { itinerary, TRIP_LENGTH } from '../data/itinerary'
import { daysBetween, jstToday } from './dates'
import { askClaude, LensError, type LensFail } from './lens'

export interface Pace {
  spent: number
  remaining: number
  /** 1-based trip day; null before a departure date exists, may be <1 pre-trip. */
  tripDay: number | null
  /** Days still to fund, today included; 0 once the family is home. */
  daysLeft: number
  todaySpent: number
  /** Today's fair share minus today's spend — negative means over. */
  todayLeft: number
  /** Even split of what's left across the days after today. */
  perDayAhead: number
}

export function paceMath(budget: number, log: Record<string, number>, departure: string): Pace {
  const today = jstToday()
  const tripDay = departure ? daysBetween(departure, today) + 1 : null
  const daysLeft = tripDay === null || tripDay < 1 ? TRIP_LENGTH : Math.max(0, TRIP_LENGTH - tripDay + 1)
  const spent = Object.values(log).reduce((a, b) => a + b, 0)
  const todaySpent = log[today] ?? 0
  const remaining = budget - spent
  const todayShare = daysLeft > 0 ? Math.floor((remaining + todaySpent) / daysLeft) : 0
  return {
    spent,
    remaining,
    tripDay,
    daysLeft,
    todaySpent,
    todayLeft: todayShare - todaySpent,
    perDayAhead: daysLeft > 1 ? Math.floor(remaining / (daysLeft - 1)) : 0,
  }
}

/* ---------- the coach: the key reads the pouch ---------- */

export interface PaceCoach {
  verdict: string
  plan: string
  advice: string[]
}

const COACH_FIXTURES: Record<string, PaceCoach | LensFail> = {
  ok: {
    verdict: 'You are a touch ahead of pace — the pouch is healthy.',
    plan: 'Hold today near ¥14,000 and the days ahead settle at about ¥15,500 each.',
    advice: [
      'The USJ day will run hot — bank ¥3,000 on the quieter Kyoto mornings',
      'Keep the gachapon budget sacred; trim from admissions, not joy',
    ],
  },
  offline: 'offline',
}

/** ?pace=<name> short-circuits the network — same trick as ?lens=. */
export function paceFixture(): PaceCoach | LensFail | null {
  const name = new URLSearchParams(location.search).get('pace')
  return name ? (COACH_FIXTURES[name] ?? null) : null
}

const COACH_SYSTEM = [
  'You are the calm family treasurer for four (two adults, two kids) on a',
  `${TRIP_LENGTH}-day Japan trip. From their cash budget, what each day has`,
  'cost so far, and the itinerary days still ahead, judge the spending pace.',
  'In verdict, say in one warm sentence how they are doing. In plan, give the',
  'numbers to hold: roughly what is left to spend today and what each',
  'remaining day can carry, yen rounded to hundreds. In advice, give two or',
  'three short tips tied to the specific days still to come — flag the',
  'expensive ones early so the quiet days can bank for them. Plain,',
  'kid-friendly English; never scold.',
].join(' ')

const COACH_FORMAT = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      verdict: { type: 'string', description: 'One warm sentence: how the pace looks' },
      plan: { type: 'string', description: 'The numbers to hold today and per remaining day, yen rounded to hundreds' },
      advice: { type: 'array', items: { type: 'string' }, description: 'Two or three short tips tied to the days still ahead' },
    },
    required: ['verdict', 'plan', 'advice'],
    additionalProperties: false,
  },
} as const

/** The trip's numbers, written down for the treasurer. */
function rundown(budget: number, log: Record<string, number>, departure: string): string {
  const pace = paceMath(budget, log, departure)
  const dayLabel = (date: string) => {
    const n = departure ? daysBetween(departure, date) + 1 : 0
    const day = itinerary[n - 1]
    return day ? `Day ${n} — ${day.title} (${day.city})` : date
  }
  const lines = [
    `Cash budget: ¥${budget.toLocaleString()} for the whole ${TRIP_LENGTH}-day trip.`,
    pace.tripDay !== null && pace.tripDay >= 1 && pace.daysLeft > 0
      ? `Today is day ${pace.tripDay} of ${TRIP_LENGTH}; ${pace.daysLeft} days still to fund, today included.`
      : pace.daysLeft === 0
        ? 'The trip is over — this is a look back.'
        : 'The trip has not started yet.',
    `Spent so far: ¥${pace.spent.toLocaleString()} (¥${pace.remaining.toLocaleString()} left).`,
  ]
  const logged = Object.keys(log).sort()
  if (logged.length) {
    lines.push('The log so far:')
    for (const date of logged) lines.push(`- ${dayLabel(date)}: ¥${log[date].toLocaleString()}`)
  } else {
    lines.push('Nothing logged yet.')
  }
  if (pace.tripDay !== null && pace.tripDay >= 1 && pace.daysLeft > 0) {
    lines.push('Still ahead:')
    for (const day of itinerary.slice(pace.tripDay - 1)) lines.push(`- Day ${day.id} — ${day.title} (${day.city})`)
  }
  return lines.join('\n')
}

export async function coachPace(key: string, budget: number, log: Record<string, number>, departure: string): Promise<PaceCoach> {
  const fx = paceFixture()
  if (fx) {
    await new Promise((r) => setTimeout(r, 300)) // let the brush spinner show
    if (typeof fx === 'string') throw new LensError(fx)
    return fx
  }
  if (!key) throw new LensError('no-key')
  return (await askClaude(key, COACH_SYSTEM, COACH_FORMAT, [
    { type: 'text', text: rundown(budget, log, departure) },
  ], 768)) as PaceCoach
}
