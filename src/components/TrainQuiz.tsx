import { useMemo, useState } from 'react'
import { quizQuestions } from '../data/quiz'
import { animalEmoji, type Traveler } from '../data/travelers'
import { useStored } from '../hooks/useStored'
import { play } from '../lib/sound'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** The Train Quiz — sixteen questions to pass around the shinkansen,
 *  scored like an omikuji fortune, with the family leaderboard. */
export function TrainQuiz() {
  const [best, setBest] = useStored<number>('quiz-best', 0)
  const [travelers] = useStored<Traveler[]>('travelers', [])
  const [scores, setScores] = useStored<Record<string, number>>('quiz-scores', {})
  const [round, setRound] = useState(0) // bump to reshuffle
  const questions = useMemo(() => shuffle(quizQuestions), [round])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const q = questions[index]
  const finished = index >= questions.length

  const claimScore = (travelerId: string) => {
    setScores((s) => ({ ...s, [travelerId]: Math.max(s[travelerId] ?? 0, score) }))
    play('stamp')
  }

  const pick = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (i === q.answer) {
      setScore((s) => s + 1)
      play('right')
    } else {
      play('wrong')
    }
  }

  const next = () => {
    setPicked(null)
    if (index + 1 >= questions.length && score > best) setBest(score)
    setIndex((i) => i + 1)
  }

  if (finished) {
    const grade =
      score === questions.length
        ? '大吉 — Great blessing! Perfect score.'
        : score >= questions.length * 0.7
          ? '吉 — Blessing. The family travels well.'
          : score >= questions.length * 0.4
            ? '小吉 — Small blessing. Read the field guide on the train!'
            : '凶 — Curse! Tie this score to a rack and leave it behind.'
    return (
      <div className="quiz-wrap">
        <div className="card quiz-card" style={{ textAlign: 'center' }}>
          <div className="hanko" style={{ width: 56, height: 56, fontSize: 22, margin: '0 auto' }}>
            {score}
          </div>
          <h3 style={{ marginTop: 12 }}>
            {score} of {questions.length}
          </h3>
          <p className="quiz-why" style={{ marginTop: 6 }}>{grade}</p>
          <p className="t-soft" style={{ fontSize: 13, marginTop: 8 }}>
            Family best: {Math.max(best, score)}
          </p>
          {travelers.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="t-kicker">Who played? Claim the score</div>
              <div className="quick-refs" style={{ justifyContent: 'center', marginTop: 8 }}>
                {travelers.map((t) => (
                  <button key={t.id} className="chip chip-sakura" onClick={() => claimScore(t.id)}>
                    {animalEmoji(t.animal)} {t.name}
                    {scores[t.id] !== undefined && ` · best ${scores[t.id]}`}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            className="show-card-btn pressable"
            onClick={() => {
              setRound((r) => r + 1)
              setIndex(0)
              setScore(0)
              setPicked(null)
            }}
          >
            Play again — もう一回!
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-wrap">
      <p className="guide-intro">
        The Train Quiz — pass the phone around the shinkansen. Every answer hides somewhere in this app.
      </p>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="chip chip-indigo">
          {index + 1} / {questions.length}
        </span>
        <span className="chip chip-gold">Score {score}</span>
        {best > 0 && <span className="chip chip-sakura">Best {best}</span>}
      </div>
      {travelers.some((t) => scores[t.id] !== undefined) && (
        <div className="quick-refs" style={{ marginBottom: 10 }}>
          {travelers
            .filter((t) => scores[t.id] !== undefined)
            .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
            .map((t, i) => (
              <span key={t.id} className={`chip ${i === 0 ? 'chip-gold' : 'chip-indigo'}`}>
                {i === 0 && '👑 '}
                {animalEmoji(t.animal)} {t.name} {scores[t.id]}
              </span>
            ))}
        </div>
      )}
      <div className="card quiz-card">
        <h3>{q.q}</h3>
        <div className="quiz-options">
          {q.options.map((opt, i) => {
            let cls = 'quiz-opt'
            if (picked !== null) {
              if (i === q.answer) cls += ' right'
              else if (i === picked) cls += ' wrong'
              else cls += ' dim'
            }
            return (
              <button key={i} className={cls} onClick={() => pick(i)}>
                {opt}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <>
            <p className="quiz-why">
              {picked === q.answer ? '⭕️ Seikai! ' : '❌ Zannen… '}
              {q.why}
            </p>
            <button className="show-card-btn pressable" onClick={next}>
              {index + 1 === questions.length ? 'See the verdict' : 'Next question →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
