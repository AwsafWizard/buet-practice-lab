// Shared UI for the slab "Design problems" sections (one-way and two-way): family / difficulty pickers,
// 🎲 New problem, statement + figure, grouped checkpoints, full solution in a Reveal. Plus the plan figures.
import { useMemo, useState, type ReactNode } from 'react'
import { Answer, Choice, Md, Reveal, Seg } from '../../../components/ui'
import { useSeed } from '../../../labs/common'
import type { CantSlabInput } from '../../engine/oneway'
import type { DesignBase, Diff, DStep, GridFig } from './design'
import { DIFFS } from './design'

export function DesignShell<P extends DesignBase, F extends string>({
  tid,
  families,
  make,
  figure,
  solution,
  note,
  seed0 = 7,
}: {
  tid: string
  families: { v: F; label: string }[]
  make: (seed: number, fam: F | undefined, diff: Diff) => P
  figure: (p: P) => ReactNode
  solution: (p: P) => ReactNode
  note?: ReactNode
  seed0?: number
}) {
  const { seed, next } = useSeed(seed0)
  const [fam, setFam] = useState<F | 'any'>('any')
  const [diff, setDiff] = useState<Diff>('paper')
  const p = useMemo(() => make(seed, fam === 'any' ? undefined : fam, diff), [make, seed, fam, diff])
  const id = (k: string) => `${tid}:design:${p.hash}:${k}`
  const step = (s: DStep) =>
    s.options ? (
      <Choice key={p.hash + s.key} id={id(s.key)} label={s.label} options={s.options} answer={s.answer!} />
    ) : (
      <Answer key={p.hash + s.key} id={id(s.key)} label={s.label} value={s.value!} unit={s.unit} abs={s.abs} digits={s.digits} compact />
    )
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {[{ v: 'any' as const, label: 'Any type' }, ...families].map((x) => (
          <button key={x.v} className={'btn !py-1 !text-xs ' + (x.v === fam ? '!border-accent text-accent' : '')} onClick={() => setFam(x.v)}>
            {x.label}
          </button>
        ))}
        <button className="btn !py-1 ml-auto" onClick={next}>
          🎲 New problem
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Difficulty:</span>
        <Seg value={diff} onChange={setDiff} items={DIFFS} size="xs" />
      </div>
      <div className="rounded-xl border border-line p-3 space-y-2">
        <span className="chip">{p.title}</span>
        <Md className="text-sm">{p.text}</Md>
        <div className="rounded-xl bg-bg/60 border border-line p-2">{figure(p)}</div>
        {note && <p className="text-xs text-faint">{note}</p>}
      </div>
      <div className="rounded-xl border border-line p-3" key={p.hash}>
        {p.steps.map((s, i) => (
          <div key={s.key}>
            {s.group !== p.steps[i - 1]?.group && <div className={'text-xs font-bold uppercase tracking-wider text-faint mb-1 ' + (i ? 'mt-3' : '')}>{s.group}</div>}
            {step(s)}
          </div>
        ))}
      </div>
      <Reveal key={p.hash} id={id('sol')} title="Full solution with sketches">
        {solution(p)}
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- plan of a grid of bays
export function GridPlan({ g }: { g: GridFig }) {
  const W = 600
  const H = 300
  const mL = 46
  const mT = 34
  const totX = g.cols.reduce((a, b) => a + b, 0)
  const totY = g.rows.reduce((a, b) => a + b, 0)
  const k = Math.min((W - mL - 24) / totX, (H - mT - 30) / totY)
  const xs = g.cols.reduce<number[]>((a, c) => [...a, a[a.length - 1] + c * k], [mL])
  const ys = g.rows.reduce<number[]>((a, c) => [...a, a[a.length - 1] + c * k], [mT])
  const has = (i: number, j: number) => i >= 0 && j >= 0 && i < g.cols.length && j < g.rows.length && (g.mask ? g.mask[j][i] : true)
  const segs = new Map<string, { x1: number; y1: number; x2: number; y2: number; kind: 'beam' | 'wall' | 'free' }>()
  g.rows.forEach((_, j) =>
    g.cols.forEach((__, i) => {
      if (!has(i, j)) return
      const vk = (ii: number): 'beam' | 'wall' => (ii === 0 && g.sides?.left ? g.sides.left : ii === g.cols.length && g.sides?.right ? g.sides.right : g.support)
      segs.set(`v${i},${j}`, { x1: xs[i], y1: ys[j], x2: xs[i], y2: ys[j + 1], kind: vk(i) })
      segs.set(`v${i + 1},${j}`, { x1: xs[i + 1], y1: ys[j], x2: xs[i + 1], y2: ys[j + 1], kind: vk(i + 1) })
      const hk = g.tb ? g.support : 'free'
      segs.set(`h${i},${j}`, { x1: xs[i], y1: ys[j], x2: xs[i + 1], y2: ys[j], kind: hk })
      segs.set(`h${i},${j + 1}`, { x1: xs[i], y1: ys[j + 1], x2: xs[i + 1], y2: ys[j + 1], kind: hk })
    }),
  )
  const midRow = Math.floor(g.rows.length / 2)
  const yStrip = g.rows.length % 2 ? (ys[midRow] + ys[midRow + 1]) / 2 : ys[midRow]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-2xl">
      <defs>
        <pattern id="gp-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--c-mute)" strokeWidth="1.2" />
        </pattern>
      </defs>
      {g.rows.map((_, j) =>
        g.cols.map((__, i) =>
          has(i, j) ? (
            <rect
              key={`c${i},${j}`}
              x={xs[i]}
              y={ys[j]}
              width={xs[i + 1] - xs[i]}
              height={ys[j + 1] - ys[j]}
              fill={g.target && g.target[0] === i && g.target[1] === j ? 'var(--c-accent)' : 'var(--c-panel2)'}
              fillOpacity={g.target && g.target[0] === i && g.target[1] === j ? 0.18 : 0.6}
            />
          ) : null,
        ),
      )}
      {g.strip && <rect x={xs[0]} y={yStrip - 5} width={xs[xs.length - 1] - xs[0]} height={10} fill="var(--c-accent)" fillOpacity={0.25} />}
      {[...segs.entries()].map(([key, s]) => {
        const vert = s.x1 === s.x2
        if (s.kind === 'free') return <line key={key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="var(--c-ink)" strokeWidth={1.2} />
        if (s.kind === 'wall') return <rect key={key} x={vert ? s.x1 - 4 : s.x1 - 4} y={vert ? s.y1 - 4 : s.y1 - 4} width={vert ? 8 : s.x2 - s.x1 + 8} height={vert ? s.y2 - s.y1 + 8 : 8} fill="url(#gp-hatch)" stroke="var(--c-ink)" strokeWidth={0.8} />
        const o = 3.5
        return (
          <g key={key} stroke="var(--c-ink)" strokeWidth={1} strokeDasharray="6 3">
            <line x1={s.x1 - (vert ? o : 0)} y1={s.y1 - (vert ? 0 : o)} x2={s.x2 - (vert ? o : 0)} y2={s.y2 - (vert ? 0 : o)} />
            <line x1={s.x1 + (vert ? o : 0)} y1={s.y1 + (vert ? 0 : o)} x2={s.x2 + (vert ? o : 0)} y2={s.y2 + (vert ? 0 : o)} />
          </g>
        )
      })}
      {g.rows.map((_, j) =>
        g.cols.map((__, i) => {
          const lab = g.labels?.[`${i},${j}`]
          return lab && has(i, j) ? (
            <text key={`l${i},${j}`} x={(xs[i] + xs[i + 1]) / 2} y={(ys[j] + ys[j + 1]) / 2 + 4} fontSize={13} fontWeight={700} textAnchor="middle" fill={g.target && g.target[0] === i && g.target[1] === j ? 'var(--c-accent)' : 'var(--c-mute)'}>
              {lab}
            </text>
          ) : null
        }),
      )}
      {g.colTxt.map((t, i) => (
        <text key={`ct${i}`} x={(xs[i] + xs[i + 1]) / 2} y={mT - 12} fontSize={11} textAnchor="middle" fill="var(--c-mute)">
          {t}
        </text>
      ))}
      {g.rowTxt.map((t, j) => {
        const y = (ys[j] + ys[j + 1]) / 2
        return (
          <text key={`rt${j}`} x={mL - 16} y={y} fontSize={11} textAnchor="middle" fill="var(--c-mute)" transform={`rotate(-90 ${mL - 16} ${y})`}>
            {t}
          </text>
        )
      })}
      {g.note && (
        <text x={W - 4} y={H - 6} fontSize={9.5} textAnchor="end" fill="var(--c-faint)">
          {g.note}
        </text>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- section of a strip with cantilever(s)
export function CantElevation({ p }: { p: CantSlabInput }) {
  const W = 600
  const H = 150
  const bw = p.support / 12
  const tot = p.cantL + bw + p.span + bw + p.cantR
  const m = 30
  const k = (W - 2 * m) / tot
  const X = (ft: number) => m + ft * k
  const yT = 62
  const t = 12
  const sL = p.cantL
  const sR = p.cantL + bw + p.span
  const dims: { a: number; b: number; txt: string }[] = [
    ...(p.cantL > 0 ? [{ a: 0, b: sL, txt: `${p.cantL}′` }] : []),
    { a: sL, b: sL + bw, txt: `${p.support}″` },
    { a: sL + bw, b: sR, txt: `${p.span}′-0″ clear` },
    { a: sR, b: sR + bw, txt: `${p.support}″` },
    ...(p.cantR > 0 ? [{ a: sR + bw, b: tot, txt: `${p.cantR}′` }] : []),
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-2xl">
      {Array.from({ length: 24 }, (_, i) => {
        const x = X(0) + ((X(tot) - X(0)) * (i + 0.5)) / 24
        return <line key={i} x1={x} y1={yT - 22} x2={x} y2={yT - 3} stroke="var(--c-bad)" strokeWidth={1} markerEnd="" />
      })}
      <line x1={X(0)} x2={X(tot)} y1={yT - 22} y2={yT - 22} stroke="var(--c-bad)" strokeWidth={1.2} />
      <text x={X(tot / 2)} y={yT - 28} fontSize={10.5} textAnchor="middle" fill="var(--c-bad)">
        DL + LL (LL anywhere)
      </text>
      <rect x={X(0)} y={yT} width={X(tot) - X(0)} height={t} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      {[sL, sR].map((s, i) => (
        <rect key={i} x={X(s)} y={yT + t} width={X(s + bw) - X(s)} height={30} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      ))}
      {p.cantL === 0 && <text x={X(0) - 4} y={yT + 9} fontSize={9} textAnchor="end" fill="var(--c-mute)">end</text>}
      {dims.map((d, i) => (
        <g key={i}>
          <line x1={X(d.a)} x2={X(d.b)} y1={yT + t + 48} y2={yT + t + 48} stroke="var(--c-mute)" />
          <line x1={X(d.a)} x2={X(d.a)} y1={yT + t + 43} y2={yT + t + 53} stroke="var(--c-mute)" />
          <line x1={X(d.b)} x2={X(d.b)} y1={yT + t + 43} y2={yT + t + 53} stroke="var(--c-mute)" />
          <text x={(X(d.a) + X(d.b)) / 2} y={yT + t + 64 + (d.b - d.a < 2 ? 10 : 0)} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)">
            {d.txt}
          </text>
        </g>
      ))}
      <text x={X(tot) - 2} y={yT - 6 + 40} fontSize={9.5} textAnchor="end" fill="var(--c-faint)">
        {p.h ? `h = ${p.h}″` : 'h = ?'}
      </text>
    </svg>
  )
}
