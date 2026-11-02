// "Which one?" drill: a situation is given, pick the formula / factor / case / value that applies.
// Each topic supplies PickSkill generators (seeded); answers come from the engines or the code-pane rules.

import { useMemo, useState, type ReactNode } from 'react'
import { Md, Section, Tex } from '../../components/ui'
import { pick, rng, useSeed } from '../../labs/common'
import { hashKey } from '../../labs/CheckTable'
import { useStore } from '../../store'
import { RC_REF_ITEMS } from '../reference'
import { openRcRef } from '../reference/pane'

export interface PickQ {
  /** markdown + $tex$ */
  q: string
  /** option labels (inline text with $tex$); the answer must be one of them */
  options: string[]
  answer: string
  /** markdown: why that one */
  why: string
  /** code-pane item that holds the rule */
  ref?: string
  /** keep the options in the given order (cases, ranges); otherwise they are shuffled */
  ordered?: boolean
}
export interface PickSkill {
  key: string
  label: string
  gen: (r: () => number) => PickQ
}

/** inline text with $tex$ segments (no block elements, so it can sit inside a button) */
export function Inline({ children }: { children: string }) {
  const parts = children.split('$')
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <Tex key={i}>{p}</Tex> : <span key={i}>{p}</span>))}
    </>
  )
}

/** answer + distractors, shuffled, duplicates dropped, at most `max` options */
export function choices(r: () => number, answer: string, wrong: string[], max = 4): string[] {
  const pool = [...new Set(wrong.filter((w) => w !== answer))]
  const out = [answer]
  while (out.length < max && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0])
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function Card({ q, skill, id, n, onDone }: { q: PickQ; skill: string; id: string; n: number; onDone: (ok: boolean) => void }) {
  const record = useStore((s) => s.record)
  const [chosen, setChosen] = useState<string | null>(null)
  const done = chosen !== null
  const right = chosen === q.answer
  const ref = q.ref ? RC_REF_ITEMS.find((it) => it.id === q.ref) : undefined
  return (
    <div className={'rounded-xl border p-3 ' + (!done ? 'border-line' : right ? 'border-good/50' : 'border-bad/50')}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-xs font-bold text-faint">{n}.</span>
        <span className="chip !py-0 !text-[10px]">{skill}</span>
      </div>
      <Md className="text-sm">{q.q}</Md>
      <div className="flex flex-wrap gap-2 mt-2">
        {q.options.map((o) => {
          const cls = !done ? '' : o === q.answer ? 'border-good! text-good' : o === chosen ? 'border-bad! text-bad' : 'opacity-60'
          return (
            <button
              key={o}
              disabled={done}
              className={'btn !py-1.5 !px-2.5 text-left !h-auto ' + cls}
              onClick={() => {
                setChosen(o)
                record(id, o === q.answer)
                onDone(o === q.answer)
              }}
            >
              <Inline>{o}</Inline>
            </button>
          )
        })}
      </div>
      {done && (
        <div className="mt-2 text-sm">
          <span className={'font-bold ' + (right ? 'text-good' : 'text-bad')}>{right ? '✓ Right.' : '✗ Not that one.'}</span>
          <Md className="text-sm mt-1">{q.why}</Md>
          {ref && (
            <button className="chip mt-1 hover:!border-load hover:text-ink" onClick={() => openRcRef(ref.id)}>
              Code pane: {ref.title} ↗
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function PickDrill({ topic, skills, n = 6, intro }: { topic: string; skills: PickSkill[]; n?: number; intro?: ReactNode }) {
  const { seed, next } = useSeed(7)
  const [off, setOff] = useState<string[]>([])
  const [score, setScore] = useState({ seed: 0, done: 0, right: 0 })
  const on = skills.filter((s) => !off.includes(s.key))
  const qs = useMemo(() => {
    const r = rng(seed * 7919 + 17)
    const order = [...on].sort(() => r() - 0.5)
    return Array.from({ length: n }, (_, i) => {
      const s = order.length >= n ? order[i] : i < order.length ? order[i] : pick(r, order)
      const g = s.gen(r)
      const q = g.ordered ? g : { ...g, options: choices(r, g.answer, g.options, g.options.length) }
      return { s, q, id: `${topic}:pick:${s.key}:${hashKey(q.q + '|' + q.answer)}` }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, off.join(','), n, topic])
  const sc = score.seed === seed ? score : { seed, done: 0, right: 0 }
  const toggle = (k: string) => setOff(off.includes(k) ? off.filter((x) => x !== k) : on.length > 1 ? [...off, k] : off)
  return (
    <div>
      {intro && <div className="text-sm text-mute mb-2">{intro}</div>}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {skills.map((s) => (
          <button key={s.key} className={'chip ' + (off.includes(s.key) ? 'opacity-50 line-through' : '!border-accent/60 text-ink')} onClick={() => toggle(s.key)} title="include / leave out">
            {s.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {qs.map((x, i) => (
          <Card key={`${seed}-${i}-${x.id}`} q={x.q} skill={x.s.label} id={x.id} n={i + 1} onDone={(ok) => setScore((p) => (p.seed === seed ? { seed, done: p.done + 1, right: p.right + (ok ? 1 : 0) } : { seed, done: 1, right: ok ? 1 : 0 }))} />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button className="btn btn-primary" onClick={next}>
          🎲 New set
        </button>
        <span className="text-sm text-mute">
          {sc.done ? `${sc.right} / ${sc.done} right` : `${n} questions`}
          {sc.done === n && sc.right === n ? ' · clean sheet' : ''}
        </span>
      </div>
    </div>
  )
}

/** the Lab-tab section that holds a topic's drill */
export function PickSection({ topic, skills }: { topic: string; skills: PickSkill[] }) {
  return (
    <Section title="Which one? Pick the formula, factor or case" sub="Each card gives a situation. Pick what applies, then read why and jump to the code-pane table. Click a skill chip to leave it out.">
      <PickDrill topic={topic} skills={skills} />
    </Section>
  )
}
