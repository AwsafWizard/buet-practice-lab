// Exam-style full problems for the CE 341 index topics (wv, plast, class): seeded generator, 🎲 New problem,
// family picker, statement + figure, step checkpoints (ids `${topic}:exam:${family}:${hash}:${key}`),
// the engine's full solution in a Reveal. Modelled on the CE 315 design-problem shell.

import { useMemo, useState, type ReactNode } from 'react'
import { Answer, Choice, Md, Reveal, Section } from '../../../components/ui'
import { useSeed } from '../../../labs/common'

export interface ExStep {
  key: string
  /** heading shown when it changes from the previous step */
  group: string
  label: string
  value?: number
  unit?: string
  digits?: number
  abs?: number
  tol?: number
  /** a choice check instead of a number */
  options?: { v: string; label: string }[]
  answer?: string
}

export interface ExProblem<F extends string = string> {
  family: F
  title: string
  /** markdown statement */
  text: string
  /** data table printed after the statement */
  table?: { head: (string | number)[]; rows: (string | number)[][] }
  /** markdown after the table */
  after?: string
  /** hash of the givens */
  hash: string
  steps: ExStep[]
}

export function ExamSet<F extends string, P extends ExProblem<F>>({
  topic,
  families,
  make,
  figure,
  solution,
  foot,
  sub,
  initialSeed = 5,
}: {
  topic: string
  families: { v: F; label: string }[]
  make: (seed: number, family?: F) => P
  figure?: (p: P) => ReactNode
  solution: (p: P) => ReactNode
  foot?: ReactNode
  sub?: ReactNode
  initialSeed?: number
}) {
  const { seed, next } = useSeed(initialSeed)
  const [fam, setFam] = useState<F | 'any'>('any')
  const p = useMemo(() => make(seed, fam === 'any' ? undefined : fam), [make, seed, fam])
  const id = (k: string) => `${topic}:exam:${p.family}:${p.hash}:${k}`
  const fig = figure?.(p)
  return (
    <Section
      title="Exam-style problems"
      sub={sub ?? 'A full question as the paper sets it: work it on paper, check each step, then open the solution.'}
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
        </div>
        <div className="rounded-xl border border-line p-3 space-y-2">
          <span className="chip">{p.title}</span>
          <Md className="text-sm">{p.text}</Md>
          {p.table && (
            <div className="overflow-x-auto">
              <table className="tbl w-auto text-sm">
                <thead>
                  <tr>
                    {p.table.head.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.table.rows.map((r, i) => (
                    <tr key={i}>
                      {r.map((c, j) => (
                        <td key={j} className={j === 0 ? 'txt' : ''}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {p.after && <Md className="text-sm">{p.after}</Md>}
          {fig && <div className="rounded-xl bg-bg/60 border border-line p-2">{fig}</div>}
          {foot && <p className="text-xs text-faint">{foot}</p>}
        </div>
        <div key={p.hash} className="rounded-xl border border-line p-3">
          {p.steps.map((s, i) => (
            <div key={s.key}>
              {s.group !== p.steps[i - 1]?.group && <div className={'text-xs font-bold uppercase tracking-wider text-faint mb-1 ' + (i ? 'mt-3' : '')}>{s.group}</div>}
              {s.options ? (
                <Choice id={id(s.key)} label={s.label} options={s.options} answer={s.answer!} />
              ) : (
                <Answer id={id(s.key)} label={s.label} value={s.value!} unit={s.unit} digits={s.digits} abs={s.abs} tol={s.tol} compact />
              )}
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

/** round to n decimals (for generated givens) */
export const rd = (v: number, n = 2) => Math.round(v * 10 ** n) / 10 ** n
