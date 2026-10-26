// VW lab: a fresh exam-style problem each click — statement, figure, step checks, full solution on demand.

import { useMemo, useState } from 'react'
import { StructureView } from '../../components/StructureView'
import { Answer, Md } from '../../components/ui'
import { VWSolution } from '../../kit/solutions'
import { useSeed } from '../../labs/common'
import { FAMILIES, makeFull, type Family, type FullStep } from './full'

const GROUP: Record<string, string> = { R: 'Step 1 — real system', N: 'Step 1 — real system', r: 'Step 2 — virtual system', n: 'Step 2 — virtual system', b: 'Step 3 — energy terms', el: 'Step 3 — the two parts', fab: 'Step 3 — error term', ans: 'Answer' }

export function FullProblems() {
  const { seed, next } = useSeed(31)
  const [fam, setFam] = useState<Family | 'any'>('any')
  const [show, setShow] = useState(false)
  const p = useMemo(() => makeFull(seed, fam === 'any' ? undefined : fam), [seed, fam])
  const renew = () => {
    next()
    setShow(false)
  }
  const step = (s: FullStep) => (
    <Answer
      key={`${seed}:${p.family}:${s.key}`}
      id={`vw:full:${p.family}:${seed}:${s.key}`}
      label={s.key === 'ans' ? <b className="text-ink">{s.label}</b> : s.label}
      value={s.value}
      unit={s.unit}
      digits={s.small ? 6 : 4}
      abs={s.small ? Math.max(Math.abs(s.value) * 0.002, 1e-7) : undefined}
      compact
    />
  )
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {[{ v: 'any' as const, label: 'Any type' }, ...FAMILIES].map((f) => (
          <button
            key={f.v}
            className={'btn !py-1 !text-xs ' + (f.v === fam ? '!border-accent text-accent' : '')}
            onClick={() => {
              setFam(f.v)
              setShow(false)
            }}
          >
            {f.label}
          </button>
        ))}
        <button className="btn !py-1 ml-auto" onClick={renew}>
          ↻ New problem
        </button>
      </div>
      <div className="rounded-xl border border-line p-3 space-y-2">
        <span className="chip">{p.title}</span>
        <Md className="text-sm">{p.text}</Md>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <StructureView model={p.m} autoDimX autoDimY={p.m.nodes.some((n) => n.y !== 0)} memberLabels={p.labels} maxHeight={260} />
        </div>
        <p className="text-xs text-faint">
          Lengths in ft, loads in kip, E = 29000 ksi unless stated. Give deflections in inches and rotations in radians; signs as in each label (rotation sign follows the sidebar setting).
        </p>
      </div>
      <div className="rounded-xl border border-line p-3">
        {p.steps.map((s, i) => (
          <div key={s.key}>
            {GROUP[s.key] && GROUP[s.key] !== GROUP[p.steps[i - 1]?.key] && <div className={'text-xs font-bold uppercase tracking-wider text-faint mb-1 ' + (i ? 'mt-3' : '')}>{GROUP[s.key]}</div>}
            {step(s)}
          </div>
        ))}
      </div>
      <button className="btn" onClick={() => setShow(!show)}>
        {show ? 'Hide' : 'Reveal'} full solution
      </button>
      {show && (
        <div className="rounded-xl border border-line p-3">
          <p className="text-sm mb-2">Virtual system: {p.virtualNote}.</p>
          <VWSolution
            model={p.m}
            real={p.m.loads}
            virtual={p.virtual}
            opts={p.opts}
            scale={p.unit === 'in' ? 12 : 1}
            resultUnit={p.unit}
            what={p.what}
            unitNote={p.unit === 'in' ? 'EI in k-ft² (I/144), EA and GA in kip, lengths in ft → each term in ft, × 12 for inches.' : 'EI in k-ft² (I/144) → rotation in radians directly.'}
          />
        </div>
      )}
    </div>
  )
}
