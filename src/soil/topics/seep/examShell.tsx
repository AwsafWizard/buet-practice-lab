// "Exam-style problems" shell for the CE 341 water topics (compaction, permeability, seepage): seeded generator,
// 🎲 New problem, family + difficulty pickers, statement + figure, step checkpoints
// (ids `${topic}:exam:${family}:${hash}:${key}`), full engine solution in a Reveal.

import { useMemo, useState, type ReactNode } from 'react'
import { Answer, Choice, Md, Reveal, Section } from '../../../components/ui'
import { useSeed } from '../../../labs/common'

export type Level = 'basic' | 'exam' | 'tough'
export const LEVELS: { v: Level; label: string }[] = [
  { v: 'basic', label: 'Warm-up' },
  { v: 'exam', label: 'Exam' },
  { v: 'tough', label: 'Tough' },
]

export interface XStep {
  key: string
  /** heading shown when it changes from the previous step */
  group: string
  label: string
  value?: number
  unit?: string
  digits?: number
  abs?: number
  tol?: number
  options?: { v: string; label: string }[]
  answer?: string
}

export interface XProblem<F extends string = string> {
  family: F
  level: Level
  title: string
  /** markdown statement */
  text: string
  hash: string
  steps: XStep[]
}

export function ExamProblems<F extends string, P extends XProblem<F>>({
  topic,
  families,
  make,
  figure,
  solution,
  foot,
  sub,
  initialSeed = 11,
}: {
  topic: string
  families: { v: F; label: string }[]
  make: (seed: number, family?: F, level?: Level) => P
  figure?: (p: P) => ReactNode
  solution: (p: P) => ReactNode
  foot?: ReactNode
  sub?: ReactNode
  initialSeed?: number
}) {
  const { seed, next } = useSeed(initialSeed)
  const [fam, setFam] = useState<F | 'any'>('any')
  const [lvl, setLvl] = useState<Level>('exam')
  const p = useMemo(() => make(seed, fam === 'any' ? undefined : fam, lvl), [make, seed, fam, lvl])
  const id = (k: string) => `${topic}:exam:${p.family}:${p.hash}:${k}`
  const fig = figure?.(p)
  return (
    <Section
      title="Exam-style problems"
      sub={sub ?? 'A full question in the papers’ style: work it on paper, check each step, then open the solution.'}
      right={
        <button className="btn !py-1 !px-3" onClick={next} title="new random problem">
          🎲 New problem
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[{ v: 'any' as const, label: 'Any type' }, ...families].map((f) => (
            <button key={f.v} className={'btn !py-1 !text-xs ' + (f.v === fam ? '!border-accent text-accent' : '')} onClick={() => setFam(f.v)}>
              {f.label}
            </button>
          ))}
          <span className="ml-auto flex gap-1">
            {LEVELS.map((l) => (
              <button key={l.v} className={'btn !py-1 !text-xs ' + (l.v === lvl ? '!border-accent text-accent' : '')} onClick={() => setLvl(l.v)}>
                {l.label}
              </button>
            ))}
          </span>
        </div>
        <div className="rounded-xl border border-line p-3 space-y-2">
          <span className="chip">{p.title}</span>
          <Md className="text-sm">{p.text}</Md>
          {fig && <div className="rounded-xl bg-bg/60 border border-line p-2">{fig}</div>}
          {foot && <p className="text-xs text-faint">{foot}</p>}
        </div>
        <div key={p.hash} className="rounded-xl border border-line p-3">
          {p.steps.map((s, i) => (
            <div key={s.key}>
              {s.group !== p.steps[i - 1]?.group && <div className={'text-xs font-bold uppercase tracking-wider text-faint mb-1 ' + (i ? 'mt-3' : '')}>{s.group}</div>}
              {s.options ? <Choice id={id(s.key)} label={s.label} options={s.options} answer={s.answer!} /> : <Answer id={id(s.key)} label={s.label} value={s.value!} unit={s.unit} digits={s.digits} abs={s.abs} tol={s.tol} compact />}
            </div>
          ))}
        </div>
        <Reveal key={`sol-${p.hash}`} id={id('sol')} title="Full solution (as you would write it)">
          {solution(p)}
        </Reveal>
      </div>
    </Section>
  )
}

/** whole-number counts (truck loads …) */
export const COUNT = { abs: 0.4, tol: 0, digits: 0 }
