// Quiz runner for the CE 104 bank: MCQ, true/false and fill-in-the-blank.
// Practice = feedback after every question; Test = timed, marked at the end (like the instruments quiz).

import { useEffect, useMemo, useRef, useState } from 'react'
import { Md } from '../../components/ui'
import { useStore, type Attempt } from '../../store'
import { qKey } from '../content'
import { svTopicById } from '../registry'
import type { SvQuestion } from '../types'

export type QuizMode = 'practice' | 'test'

const shuffle = <T,>(a: T[]) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

/** loose match for typed answers: case, spaces, dots, hyphens, quotes and degree marks don't matter; numbers within 1 % */
export function blankOk(typed: string, accepted: string[]): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[\s.\-–—'’"“”°_,()]/g, '')
      .replace(/^(the|a|an)(?=[a-z])/, '')
  const t = norm(typed)
  if (!t) return false
  const tn = Number(typed.replace(/[^0-9.\-]/g, ''))
  return accepted.some((a) => {
    if (norm(a) === t) return true
    const an = Number(a.replace(/[^0-9.\-]/g, ''))
    return /^[\s\d.,\-+]+[a-z°′″'"\s%²³/]*$/i.test(a.trim()) && isFinite(an) && isFinite(tn) && a.replace(/[^0-9]/g, '') !== '' && Math.abs(tn - an) <= Math.abs(an) * 0.01 + 1e-9
  })
}

/** order a pool: missed ones first, then never tried, then the rest — each group shuffled */
export function pickQuestions(pool: SvQuestion[], attempts: Record<string, Attempt>, n: number): SvQuestion[] {
  const missed: SvQuestion[] = [],
    fresh: SvQuestion[] = [],
    known: SvQuestion[] = []
  for (const q of pool) {
    const a = attempts[qKey(q)]
    if (!a || a.cleared) fresh.push(q)
    else if (!a.correct || !a.firstTry) missed.push(q)
    else known.push(q)
  }
  return [...shuffle(missed), ...shuffle(fresh), ...shuffle(known)].slice(0, n)
}

interface Shown {
  q: SvQuestion
  /** option order for an mcq (indices into q.opts) */
  order: number[]
}

type Answer = number | boolean | string | null

function isRight(s: Shown, ans: Answer): boolean {
  const q = s.q
  if (ans === null || ans === '') return false
  if (q.kind === 'mcq') return typeof ans === 'number' && s.order[ans] === q.a
  if (q.kind === 'tf') return ans === q.a
  return typeof ans === 'string' && blankOk(ans, q.a)
}

function correctText(q: SvQuestion) {
  if (q.kind === 'mcq') return q.opts[q.a]
  if (q.kind === 'tf') return q.a ? 'True' : 'False'
  return q.a[0]
}

export function QuizRunner({ questions, mode, minutes, onExit, title }: { questions: SvQuestion[]; mode: QuizMode; minutes?: number; onExit: () => void; title?: string }) {
  const record = useStore((s) => s.record)
  const shown = useMemo<Shown[]>(() => questions.map((q) => ({ q, order: q.kind === 'mcq' ? shuffle(q.opts.map((_, i) => i)) : [] })), [questions])
  const [pos, setPos] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>(() => shown.map(() => null))
  const [checked, setChecked] = useState<boolean[]>(() => shown.map(() => false))
  const [finished, setFinished] = useState(false)
  const [left, setLeft] = useState(minutes ? minutes * 60 : 0)
  const started = useRef(Date.now())

  // test timer
  useEffect(() => {
    if (mode !== 'test' || !minutes || finished) return
    const t = setInterval(() => {
      const l = Math.max(0, minutes * 60 - Math.round((Date.now() - started.current) / 1000))
      setLeft(l)
      if (l === 0) submit()
    }, 500)
    return () => clearInterval(t)
  })

  const s = shown[pos]
  const ans = answers[pos]
  const setAns = (a: Answer) => setAnswers((x) => x.map((v, i) => (i === pos ? a : v)))

  const check = () => {
    if (checked[pos]) return
    const ok = isRight(s, ans)
    record(qKey(s.q), ok, s.q.topic)
    setChecked((c) => c.map((v, i) => (i === pos ? true : v)))
  }
  const submit = () => {
    if (finished) return
    shown.forEach((x, i) => {
      if (answers[i] !== null && answers[i] !== '') record(qKey(x.q), isRight(x, answers[i]), x.q.topic)
    })
    setFinished(true)
  }
  const next = () => (pos + 1 < shown.length ? setPos(pos + 1) : mode === 'practice' ? setFinished(true) : null)

  // keys: 1–4 / a–d choose, t/f, Enter checks or moves on
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
      if (finished || !s) return
      if (e.key === 'Enter') {
        e.preventDefault()
        if (mode === 'practice') {
          if (!checked[pos]) {
            if (ans !== null && ans !== '') check()
          } else next()
        } else next()
        return
      }
      if (typing || (mode === 'practice' && checked[pos])) return
      if (s.q.kind === 'mcq') {
        const k = '1234abcd'.indexOf(e.key.toLowerCase())
        if (k >= 0 && k % 4 < s.order.length) setAns(k % 4)
      } else if (s.q.kind === 'tf') {
        if (e.key === 't' || e.key === '1') setAns(true)
        if (e.key === 'f' || e.key === '2') setAns(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const score = shown.reduce((n, x, i) => n + (isRight(x, answers[i]) ? 1 : 0), 0)

  if (finished) return <Summary shown={shown} answers={answers} score={score} onExit={onExit} secs={Math.round((Date.now() - started.current) / 1000)} />
  if (!s) return <div className="card p-6 text-mute">No questions in this selection yet.</div>

  const reveal = mode === 'practice' && checked[pos]
  const ok = reveal && isRight(s, ans)
  const t = svTopicById(s.q.topic)
  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
        {title && <b>{title}</b>}
        <span className="text-mute">
          Question <b className="num text-ink">{pos + 1}</b> of <span className="num">{shown.length}</span>
        </span>
        {mode === 'practice' && (
          <span className="text-mute">
            · <b className="num text-good">{shown.filter((x, i) => checked[i] && isRight(x, answers[i])).length}</b> right so far
          </span>
        )}
        {mode === 'test' && minutes ? (
          <span className={'ml-auto num font-bold ' + (left < 60 ? 'text-bad' : 'text-accent')}>
            ⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
          </span>
        ) : null}
        <button className="btn btn-ghost !text-xs ml-auto" onClick={mode === 'test' ? submit : () => setFinished(true)}>
          {mode === 'test' ? 'Submit now' : 'End'}
        </button>
      </div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden mb-4">
        <div className="h-full bg-accent transition-all" style={{ width: `${(pos / shown.length) * 100}%` }} />
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-2">
          {t && (
            <span className="chip" style={{ color: t.color }}>
              {t.short}
            </span>
          )}
          <span className="chip">{s.q.kind === 'mcq' ? 'MCQ' : s.q.kind === 'tf' ? 'True / false' : 'Fill in the blank'}</span>
          {s.q.lvl === 3 && <span className="chip text-load">numerical / tricky</span>}
        </div>
        <div className="text-[17px] font-semibold leading-snug mb-4">
          <Md>{s.q.kind === 'blank' ? s.q.q.replace(/_{3,}/g, '＿＿＿＿＿') : s.q.q}</Md>
        </div>

        {s.q.kind === 'mcq' && (
          <div className="grid gap-2">
            {s.order.map((oi, i) => {
              const picked = ans === i
              const isAns = oi === (s.q as { a: number }).a
              const cls = reveal ? (isAns ? 'border-good bg-good/10' : picked ? 'border-bad bg-bad/10' : 'opacity-70') : picked ? 'border-accent bg-accent/10' : 'hover:border-accent'
              return (
                <button key={i} type="button" disabled={reveal} onClick={() => setAns(i)} className={'text-left rounded-xl border border-line px-3.5 py-2.5 flex gap-3 items-start transition-colors ' + cls}>
                  <span className="num text-xs font-bold text-mute mt-0.5 w-4">{'ABCD'[i]}</span>
                  <span className="flex-1">
                    <Md>{(s.q as { opts: string[] }).opts[oi]}</Md>
                  </span>
                  {reveal && isAns && <span className="text-good">✓</span>}
                  {reveal && picked && !isAns && <span className="text-bad">✗</span>}
                </button>
              )
            })}
          </div>
        )}
        {s.q.kind === 'tf' && (
          <div className="grid grid-cols-2 gap-2 max-w-sm">
            {[true, false].map((v) => {
              const picked = ans === v
              const isAns = v === s.q.a
              const cls = reveal ? (isAns ? 'border-good bg-good/10' : picked ? 'border-bad bg-bad/10' : 'opacity-70') : picked ? 'border-accent bg-accent/10' : 'hover:border-accent'
              return (
                <button key={String(v)} type="button" disabled={reveal} onClick={() => setAns(v)} className={'rounded-xl border border-line px-3 py-2.5 font-bold transition-colors ' + cls}>
                  {v ? 'True' : 'False'}
                </button>
              )
            })}
          </div>
        )}
        {s.q.kind === 'blank' && (
          <input
            key={pos}
            autoFocus
            className={'field w-full max-w-md ' + (reveal ? (ok ? '!border-good' : '!border-bad') : '')}
            placeholder="type the missing word / number"
            value={typeof ans === 'string' ? ans : ''}
            disabled={reveal}
            onChange={(e) => setAns(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        )}

        {reveal && (
          <div className={'mt-4 rounded-xl p-3 text-sm ' + (ok ? 'bg-good/10' : 'bg-bad/10')}>
            <div className={'font-bold mb-1 ' + (ok ? 'text-good' : 'text-bad')}>{ok ? '✓ Right' : `✗ Answer: ${correctText(s.q)}`}</div>
            <Md>{s.q.why}</Md>
            <div className="text-[11px] text-faint mt-1">Source: {s.q.src}</div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {mode === 'practice' ? (
            !checked[pos] ? (
              <button className="btn btn-primary" onClick={check} disabled={ans === null || ans === ''}>
                Check ⏎
              </button>
            ) : (
              <button className="btn btn-primary" onClick={next}>
                {pos + 1 < shown.length ? 'Next ⏎' : 'See the summary'}
              </button>
            )
          ) : (
            <>
              <button className="btn" onClick={() => setPos(Math.max(0, pos - 1))} disabled={pos === 0}>
                ← Back
              </button>
              {pos + 1 < shown.length ? (
                <button className="btn btn-primary" onClick={next}>
                  Next ⏎
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submit}>
                  Submit the quiz
                </button>
              )}
            </>
          )}
          {mode === 'practice' && !checked[pos] && (
            <button className="btn btn-ghost" onClick={() => (setAns(null), check())}>
              Don’t know — show me
            </button>
          )}
        </div>
      </div>
      {mode === 'test' && (
        <div className="flex flex-wrap gap-1 mt-3">
          {shown.map((_, i) => (
            <button key={i} onClick={() => setPos(i)} className={'w-7 h-7 rounded-md text-[11px] num border ' + (i === pos ? 'border-accent text-accent' : answers[i] !== null && answers[i] !== '' ? 'bg-accent/15 border-transparent' : 'border-line text-faint')}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <div className="text-xs text-faint mt-3">Keys: 1–4 or A–D pick · T / F · Enter checks and moves on.</div>
    </div>
  )
}

function Summary({ shown, answers, score, onExit, secs }: { shown: Shown[]; answers: Answer[]; score: number; onExit: () => void; secs: number }) {
  const n = shown.length
  const pct = n ? Math.round((score / n) * 100) : 0
  const [only, setOnly] = useState(true)
  const list = shown.map((s, i) => ({ s, a: answers[i], ok: isRight(s, answers[i]) })).filter((x) => !only || !x.ok)
  const shownAns = (s: Shown, a: Answer) => (a === null || a === '' ? '—' : s.q.kind === 'mcq' ? (s.q.opts[s.order[a as number]] ?? '—') : s.q.kind === 'tf' ? (a ? 'True' : 'False') : String(a))
  return (
    <div className="max-w-3xl">
      <div className="card p-6 text-center mb-4">
        <div className="text-5xl font-extrabold num text-accent">
          {score}/{n}
        </div>
        <div className="text-mute mt-1">
          {pct}% · {Math.floor(secs / 60)} min {secs % 60} s · {pct >= 80 ? 'solid — keep it warm' : pct >= 50 ? 'getting there — redo the misses below' : 'read the Learn tab, then try again'}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <button className="btn btn-primary" onClick={onExit}>
            New quiz
          </button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm mb-2">
        <input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> show only the ones I missed
      </label>
      <div className="space-y-2">
        {list.map(({ s, a, ok }) => (
          <div key={s.q.id} className={'card p-3.5 border-l-4 ' + (ok ? 'border-l-good' : 'border-l-bad')}>
            <div className="font-semibold text-sm">
              <Md>{s.q.q}</Md>
            </div>
            <div className="text-sm mt-1">
              <span className="text-mute">You: </span>
              <span className={ok ? 'text-good' : 'text-bad'}>{shownAns(s, a)}</span>
              {!ok && (
                <>
                  <span className="text-mute"> · Answer: </span>
                  <b className="text-good">{correctText(s.q)}</b>
                </>
              )}
            </div>
            <div className="text-xs text-mute mt-1">
              <Md>{s.q.why}</Md>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-mute text-sm">Nothing missed. 🎯</div>}
      </div>
    </div>
  )
}
