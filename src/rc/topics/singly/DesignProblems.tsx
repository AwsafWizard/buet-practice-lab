// "Design problems" block shared by the singly, doubly and elastic labs (modelled on CE 311's VW full-problems lab):
// family / difficulty pickers, 🎲 New problem, statement + small figure, step checkpoints, full solution in Reveal.

import { useMemo, useState } from 'react'
import { Answer, Choice, Md, Reveal } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { f } from '../../engine/elastic'
import { SectionSketch, SolSteps } from '../elastic/ui'
import { DIFFS, type BeamFigSpec, type Diff, type DProblem, type DStep } from './designCore'

const newSeed = () => Math.floor(Math.random() * 1e9)

export function DesignProblems<F extends string>({ topic, families, make, note }: { topic: string; families: { v: F; label: string }[]; make: (seed: number, fam: F | undefined, diff: Diff) => DProblem<F>; note?: string }) {
  const [seed, setSeed] = useState(() => newSeed())
  const [fam, setFam] = useState<F | 'any'>('any')
  const [diff, setDiff] = useState<Diff>('exam')
  const p = useMemo(() => make(seed, fam === 'any' ? undefined : fam, diff), [make, seed, fam, diff])
  const key = hashKey(p.text)
  const id = (s: DStep) => `${topic}:design:${p.family}:${key}:${s.key}`
  const btn = (on: boolean) => 'btn !py-1 !text-xs ' + (on ? '!border-accent text-accent' : '')
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {[{ v: 'any' as const, label: 'Any type' }, ...families].map((x) => (
          <button key={x.v} className={btn(x.v === fam)} onClick={() => setFam(x.v)}>
            {x.label}
          </button>
        ))}
        <span className="mx-1 text-faint">|</span>
        {DIFFS.map((x) => (
          <button key={x.v} className={btn(x.v === diff)} onClick={() => setDiff(x.v)}>
            {x.label}
          </button>
        ))}
        <button className="btn !py-1 ml-auto" onClick={() => setSeed(newSeed())}>
          🎲 New problem
        </button>
      </div>
      <div className="rounded-xl border border-line p-3 space-y-2">
        <span className="chip">{p.title}</span>
        <Md className="text-sm">{p.text}</Md>
        {(p.beam || p.section) && (
          <div className="rounded-xl bg-bg/60 border border-line p-2 grid gap-2 cq-md:grid-cols-[2fr_1fr] items-center">
            {p.beam ? <BeamFig spec={p.beam} /> : <div />}
            {p.section && (
              <div className="max-w-[220px] mx-auto w-full">
                <SectionSketch b={p.section.b} h={p.section.h} rows={p.section.rows ?? []} flipTension={p.section.flip} height={150} tag={p.section.tag} />
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-faint">{note ?? 'US units: ft, kip, in, ksi; moments in k-ft. Answers within 2 % are accepted; carry the engine values forward (each step uses the exact value of the previous ones).'}</p>
      </div>
      <div key={key} className="rounded-xl border border-line p-3 text-sm">
        {p.steps.map((s, i) => (
          <div key={s.key}>
            {s.group !== p.steps[i - 1]?.group && <div className={'text-xs font-bold uppercase tracking-wider text-faint mb-1 ' + (i ? 'mt-3' : '')}>{s.group}</div>}
            {s.choice ? <Choice id={id(s)} label={s.label} options={s.choice.options} answer={s.choice.answer} /> : <Answer id={id(s)} label={s.label} value={s.value ?? NaN} unit={s.unit} digits={s.digits} tol={s.tol} compact />}
          </div>
        ))}
      </div>
      <Reveal key={'r' + key} id={`${topic}:design:${p.family}:${key}:sol`} title="Full solution">
        <div className="space-y-4">
          {p.sol.map((sec, i) => (
            <div key={i}>
              <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1.5">{sec.title}</div>
              <SolSteps steps={sec.steps} />
            </div>
          ))}
          {p.final && (
            <div className="max-w-[260px]">
              <SectionSketch b={p.final.b} h={p.final.h} rows={p.final.rows ?? []} flipTension={p.final.flip} height={170} tag={p.final.tag} />
            </div>
          )}
          <Md className="text-sm font-semibold">{p.answer}</Md>
        </div>
      </Reveal>
    </div>
  )
}

/** small beam elevation: supports, UDL band, point loads, span dimensions */
export function BeamFig({ spec }: { spec: BeamFigSpec }) {
  const { support, span } = spec
  const over = support === 'overhang' ? spec.over ?? 0 : 0
  const total = span + over
  const W = 460,
    x0 = 30,
    x1 = W - 30
  const X = (x: number) => x0 + ((x1 - x0) * x) / total
  const yb = 92
  const tri = (x: number, roller = false) => (
    <g key={x} stroke="var(--c-ink)" strokeWidth={1.3} fill="none">
      <path d={`M${X(x)},${yb + 5} l-8,13 h16 z`} />
      {roller ? <line x1={X(x) - 10} x2={X(x) + 10} y1={yb + 22} y2={yb + 22} /> : <line x1={X(x) - 11} x2={X(x) + 11} y1={yb + 18} y2={yb + 18} />}
    </g>
  )
  const wall = (x: number, side: 1 | -1) => (
    <g key={'w' + x} stroke="var(--c-ink)" strokeWidth={1.3}>
      <line x1={X(x)} x2={X(x)} y1={yb - 26} y2={yb + 30} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={X(x)} x2={X(x) - 7 * side} y1={yb - 22 + i * 10} y2={yb - 15 + i * 10} />
      ))}
    </g>
  )
  const nArrows = 14
  return (
    <svg viewBox={`0 0 ${W} 160`} className="w-full h-auto" style={{ maxHeight: 170 }}>
      {/* UDL band */}
      <rect x={X(0)} y={yb - 30} width={X(total) - X(0)} height={12} fill="var(--c-accent)" fillOpacity={0.12} stroke="var(--c-accent)" strokeWidth={0.8} />
      {Array.from({ length: nArrows + 1 }, (_, i) => {
        const x = X(0) + ((X(total) - X(0)) * i) / nArrows
        return <path key={i} d={`M${x},${yb - 18} V${yb - 6} m-3,-5 l3,5 l3,-5`} stroke="var(--c-accent)" strokeWidth={1} fill="none" />
      })}
      <text x={(X(0) + X(total)) / 2} y={yb - 36} textAnchor="middle" fontSize={10.5} fill="var(--c-accent)">
        {spec.udl}
      </text>
      {/* beam */}
      <rect x={X(0)} y={yb - 4} width={X(total) - X(0)} height={9} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.4} />
      {/* supports */}
      {support === 'ss' && [tri(0), tri(span, true)]}
      {support === 'overhang' && [tri(0), tri(span, true)]}
      {support === 'cant' && wall(0, 1)}
      {support === 'fixed' && [wall(0, 1), wall(span, -1)]}
      {/* point loads */}
      {(spec.points ?? []).map((p, i) => (
        <g key={i}>
          <path d={`M${X(p.x)},${yb - 62} V${yb - 6} m-4,-7 l4,7 l4,-7`} stroke="var(--c-bad)" strokeWidth={1.6} fill="none" />
          <text x={X(p.x) + 5} y={yb - 54} fontSize={10.5} fill="var(--c-bad)">
            {p.label}
          </text>
        </g>
      ))}
      {/* dimensions */}
      <g fontSize={10.5} fill="var(--c-mute)" stroke="var(--c-mute)" strokeWidth={0.8}>
        <line x1={X(0)} x2={X(span)} y1={yb + 34} y2={yb + 34} />
        <line x1={X(0)} x2={X(0)} y1={yb + 29} y2={yb + 39} />
        <line x1={X(span)} x2={X(span)} y1={yb + 29} y2={yb + 39} />
        <text x={(X(0) + X(span)) / 2} y={yb + 48} textAnchor="middle" stroke="none">
          {f(span)} ft
        </text>
        {over > 0 && (
          <>
            <line x1={X(span)} x2={X(total)} y1={yb + 34} y2={yb + 34} />
            <line x1={X(total)} x2={X(total)} y1={yb + 29} y2={yb + 39} />
            <text x={(X(span) + X(total)) / 2} y={yb + 48} textAnchor="middle" stroke="none">
              {f(over)} ft
            </text>
          </>
        )}
      </g>
      {support === 'overhang' && (
        <g fontSize={10} fill="var(--c-ink)">
          <text x={X(0) - 4} y={yb - 8} textAnchor="end">A</text>
          <text x={X(span) + 4} y={yb + 20}>B</text>
          <text x={X(total) + 4} y={yb - 8}>C</text>
        </g>
      )}
    </svg>
  )
}
