// Quick calculators for exam questions, each on a drawing you can edit like the Fadum builder: put point loads, walls,
// a rectangle, a Newmark plan, a strip, an embankment, a circle or a 2:1 footing on the grid, move P, read σz with the
// working laid out the way the script wants it. Plan tabs here; cross-section tabs in CalcSections.
import { useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { KV, Seg } from '../../../components/ui'
import { NumIn } from '../../../reference/common'
import { boussinesq, cornerTerms, Irect, lineEnd, lineInPlan, maxOnVertical, NEWMARK_IF, newmarkCount, newmarkRadii, piBranch, pointInPlan, rectsInside, shapeI, simplifyTerms, twoToOneRect, westergaard, type Rect, type XY } from '../../engine/stressdist'
import { Big, Card, Cell, f2, f3, f4, fin, Hint, Modes, Presets, R, RemoveBtn, Split, Work } from './calcKit'
import { CircleCalc, EmbCalc, StripCalc, TwoOneCalc } from './CalcSections'
import { DrawCanvas, nearest, PMark, segDist, snap, useFrozenView } from './DrawCanvas'
import { DepthChart, PlanFig } from './figs'
import { NewmarkChart } from './newmark'
import { randomShape, SHAPES } from './shapes'

type Tab = 'point' | 'line' | 'rect' | 'newmark' | 'strip' | 'emb' | 'circle' | 'two'
const TABS: { v: Tab; label: string }[] = [
  { v: 'point', label: 'Point loads' },
  { v: 'line', label: 'Line loads' },
  { v: 'rect', label: 'Fadum / Steinbrenner' },
  { v: 'newmark', label: 'Newmark' },
  { v: 'strip', label: 'Strip' },
  { v: 'emb', label: 'Embankment' },
  { v: 'circle', label: 'Circle' },
  { v: 'two', label: '2:1' },
]

const PLAN_BASE = { x0: -4, y0: -3, x1: 8, y1: 5 }

// ---------------------------------------------------------------- point loads

interface PL {
  Q: number
  x: number
  y: number
}
const POINT_PRESETS: { label: string; v: { loads: PL[]; P: XY; z: number } }[] = [
  {
    label: '2021-22 Q4(a): two 300 kN footings 5 m apart, 8.5 m below one',
    v: {
      loads: [
        { Q: 300, x: 0, y: 0 },
        { Q: 300, x: 5, y: 0 },
      ],
      P: [0, 0],
      z: 8.5,
    },
  },
  {
    label: 'Practice: 1500 kN, 3 m deep, 2 m off the axis',
    v: { loads: [{ Q: 1500, x: 0, y: 0 }], P: [2, 0], z: 3 },
  },
  {
    label: 'Four columns on a 4 m grid, below the middle',
    v: {
      loads: [
        { Q: 500, x: 0, y: 0 },
        { Q: 500, x: 4, y: 0 },
        { Q: 500, x: 0, y: 4 },
        { Q: 500, x: 4, y: 4 },
      ],
      P: [2, 2],
      z: 3,
    },
  },
]

export function PointCalc() {
  const [loads, setLoads] = useState<PL[]>(POINT_PRESETS[0].v.loads)
  const [P, setP] = useState<XY>(POINT_PRESETS[0].v.P)
  const [z, setZ] = useState(POINT_PRESETS[0].v.z)
  const [mode, setMode] = useState<'load' | 'P' | 'erase'>('load')
  const [drag, setDrag] = useState<number | null>(null)
  const [mx, setMx] = useState({ Q: 1500, r: 2 })
  const fv = useFrozenView([P, ...loads.map((l) => [l.x, l.y] as XY)], PLAN_BASE, 2.5)
  const upd = (i: number, k: keyof PL) => (v: number) => setLoads(loads.map((l, j) => (j === i ? { ...l, [k]: v } : l)))
  const ok = loads.length > 0 && z > 0 && fin(z, ...P) && loads.every((l) => fin(l.Q, l.x, l.y))
  const rows = ok ? loads.map((l) => pointInPlan(l.Q, [l.x, l.y], P, z)) : []
  const sB = rows.reduce((s, r) => s + r.sB, 0)
  const sW = rows.reduce((s, r) => s + r.sW, 0)
  const m = mx.r > 0 && fin(mx.Q) ? maxOnVertical(mx.Q, mx.r) : null
  const down = (x: number, y: number, tol: number) => {
    fv.freeze()
    const hit = nearest(loads, (l) => Math.hypot(l.x - x, l.y - y), tol * 1.5)
    if (mode === 'erase') {
      if (hit >= 0) setLoads(loads.filter((_, j) => j !== hit))
      return
    }
    if (mode === 'P' || Math.hypot(P[0] - x, P[1] - y) <= tol) {
      setP([snap(x), snap(y)])
      setDrag(-1)
      return
    }
    if (hit >= 0) return setDrag(hit)
    setLoads([...loads, { Q: loads.at(-1)?.Q ?? 100, x: snap(x), y: snap(y) }])
    setDrag(loads.length)
  }
  const move = (x: number, y: number) => {
    if (drag === null) return
    const p: XY = [snap(x), snap(y)]
    if (drag === -1) setP(p)
    else setLoads(loads.map((l, j) => (j === drag ? { ...l, x: p[0], y: p[1] } : l)))
  }
  const up = () => (setDrag(null), fv.thaw())
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Presets items={POINT_PRESETS} onPick={(p) => (fv.reset(), setLoads(p.loads), setP(p.P), setZ(p.z))} />
        <Modes
          value={mode}
          onChange={setMode}
          items={[
            { v: 'load', label: '● add / drag load' },
            { v: 'P', label: '• move P' },
            { v: 'erase', label: '✕ erase' },
          ]}
        />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setLoads([])}>
          clear
        </button>
      </div>
      <Split>
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">
          <DrawCanvas view={fv.view} onDown={down} onMove={move} onUp={up} label="plan of the point loads">
            {(s) => (
              <>
                {ok &&
                  rows.map((r, i) =>
                    r.r > 0.01 ? (
                      <g key={'r' + i}>
                        <line x1={s.X(P[0])} y1={s.Y(P[1])} x2={s.X(loads[i].x)} y2={s.Y(loads[i].y)} stroke="var(--c-accent)" strokeDasharray="4 3" strokeWidth={1} />
                        <text x={(s.X(P[0]) + s.X(loads[i].x)) / 2 + 3} y={(s.Y(P[1]) + s.Y(loads[i].y)) / 2 - 4} fontSize={9} fill="var(--c-accent)">
                          r = {f2(r.r)}
                        </text>
                      </g>
                    ) : null,
                  )}
                {loads.map((l, i) => (
                  <g key={'q' + i}>
                    <circle cx={s.X(l.x)} cy={s.Y(l.y)} r={7} fill="var(--c-load)" stroke={drag === i ? 'var(--c-ink)' : 'none'} strokeWidth={1.5} />
                    <text x={s.X(l.x) + (s.X(l.x) > s.w * 0.7 ? -9 : 9)} y={s.Y(l.y) + 13} textAnchor={s.X(l.x) > s.w * 0.7 ? 'end' : 'start'} fontSize={10} fontWeight={700} fill="var(--c-load)">
                      Q{i + 1} = {fmt(l.Q, 0)} kN
                    </text>
                  </g>
                ))}
                <PMark s={s} at={P} />
              </>
            )}
          </DrawCanvas>
          <Hint>Click to drop a load (snaps to 0.5 m), drag a load or P to move it. Q values are typed in the table. P is the point at depth z below the dot.</Hint>
        </div>
        <div className="space-y-2">
          {ok ? (
            <>
              <Big label="σz (Boussinesq)" value={sB} unit="kPa" />
              <KV k="Westergaard (μ = 0)" v={f3(sW)} unit="kPa" />
              <DepthChart
                w={320}
                zMax={Math.max(2 * z, 4)}
                mark={{ z, v: sB }}
                curves={[
                  {
                    f: (zz) => loads.reduce((s, l) => s + boussinesq(l.Q, Math.hypot(l.x - P[0], l.y - P[1]), zz), 0),
                    label: 'Boussinesq, below P',
                  },
                  {
                    f: (zz) => loads.reduce((s, l) => s + westergaard(l.Q, Math.hypot(l.x - P[0], l.y - P[1]), zz), 0),
                    label: 'Westergaard',
                    dash: true,
                  },
                ]}
              />
            </>
          ) : (
            <div className="text-bad text-sm">Drop at least one load; z must be positive.</div>
          )}
        </div>
      </Split>
      <div className="overflow-x-auto">
        <table className="tbl text-xs num">
          <thead>
            <tr>
              <th className="txt">#</th>
              <th>Q (kN)</th>
              <th>x (m)</th>
              <th>y (m)</th>
              <th>r</th>
              <th>r/z</th>
              <th>KB</th>
              <th>σz Bous.</th>
              <th>KW</th>
              <th>σz Wester.</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loads.map((l, i) => (
              <tr key={i}>
                <td className="txt">Q{i + 1}</td>
                <td>
                  <Cell value={l.Q} onChange={upd(i, 'Q')} step={50} w="w-16" />
                </td>
                <td>
                  <Cell value={l.x} onChange={upd(i, 'x')} />
                </td>
                <td>
                  <Cell value={l.y} onChange={upd(i, 'y')} />
                </td>
                <td>{rows[i] ? f3(rows[i].r) : '—'}</td>
                <td>{rows[i] ? f3(rows[i].rz) : '—'}</td>
                <td>{rows[i] ? f4(rows[i].KB) : '—'}</td>
                <td className="font-semibold">{rows[i] ? f3(rows[i].sB) : '—'}</td>
                <td>{rows[i] ? f4(rows[i].KW) : '—'}</td>
                <td>{rows[i] ? f3(rows[i].sW) : '—'}</td>
                <td>
                  <RemoveBtn onClick={() => setLoads(loads.filter((_, j) => j !== i))} />
                </td>
              </tr>
            ))}
            {ok && (
              <tr className="font-bold">
                <td className="txt" colSpan={7}>
                  Σ (kPa)
                </td>
                <td>{f3(sB)}</td>
                <td />
                <td>{f3(sW)}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <NumIn label="P x" value={P[0]} onChange={(v) => setP([v, P[1]])} step={0.5} unit="m" w="w-14" />
        <NumIn label="P y" value={P[1]} onChange={(v) => setP([P[0], v])} step={0.5} unit="m" w="w-14" />
      </div>
      {ok && (
        <Work>{R`$\sigma_z = \sum K_B\frac{Q}{z^2}$, $K_B = \frac{3/2\pi}{[1+(r/z)^2]^{5/2}}$: ${rows.map((r, i) => R`Q${i + 1}: r/z = ${f3(r.rz)}, $K_B$ = ${f4(r.KB)} → ${f4(r.KB)}(${f2(loads[i].Q)})/${f2(z)}² = ${f3(r.sB)}`).join('; ')}. **σz = ${f3(sB)} kPa.** Westergaard: $K_W = \frac{1/\pi}{[1+2(r/z)^2]^{3/2}}$ → ${f3(sW)} kPa.`}</Work>
      )}
      <Card
        title="Maximum σz on a vertical line at radius r"
        chart="d-kb"
        inputs={
          <>
            <NumIn label="Q" value={mx.Q} onChange={(v) => setMx({ ...mx, Q: v })} step={50} unit="kN" w="w-16" />
            <NumIn label="r" value={mx.r} onChange={(v) => setMx({ ...mx, r: v })} step={0.5} unit="m" w="w-14" />
          </>
        }
      >
        {m && (
          <>
            <div className="grid cq-md:grid-cols-3 gap-x-4">
              <KV k="depth z = r/0.8165" v={f3(m.z)} unit="m" />
              <KV k="σz,max = 0.0888Q/r²" v={f3(m.sigma)} unit="kPa" />
              <KV k="angle from the axis" v={f2(m.beta)} unit="°" />
            </div>
            <Hint>dσz/dz = 0 gives r/z = √(2/3) = 0.8165 (β = 39.23°), KB = 0.1332, σmax = 0.1332 × (2/3) Q/r² = 0.0888 Q/r².</Hint>
          </>
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------- line loads

interface LL {
  q: number
  x1: number
  y1: number
  x2: number
  y2: number
  inf: boolean
}
const LINE_PRESETS: { label: string; v: { lines: LL[]; P: XY; z: number } }[] = [
  {
    label: '2012-13 Q12(c): T of walls, BA 75 kN/m (9 m) and CD 100 kN/m (6 + 6 m), 3 m below A',
    v: {
      lines: [
        { q: 75, x1: 0, y1: 9, x2: 0, y2: 0, inf: false },
        { q: 100, x1: -6, y1: 0, x2: 6, y2: 0, inf: false },
      ],
      P: [0, 0],
      z: 3,
    },
  },
  {
    label: 'One infinite line, point 2 m to the side, 3 m deep',
    v: {
      lines: [{ q: 100, x1: 0, y1: -3, x2: 0, y2: 3, inf: true }],
      P: [2, 0],
      z: 3,
    },
  },
  {
    label: 'L of walls, point 2 m inside the corner',
    v: {
      lines: [
        { q: 80, x1: 0, y1: 0, x2: 8, y2: 0, inf: false },
        { q: 80, x1: 0, y1: 0, x2: 0, y2: 6, inf: false },
      ],
      P: [2, 2],
      z: 2,
    },
  },
]

type LDrag = { k: 'new' } | { k: 'end'; i: number; e: 1 | 2 } | { k: 'P' } | null

export function LineCalc() {
  const [lines, setLines] = useState<LL[]>(LINE_PRESETS[0].v.lines)
  const [P, setP] = useState<XY>(LINE_PRESETS[0].v.P)
  const [z, setZ] = useState(LINE_PRESETS[0].v.z)
  const [mode, setMode] = useState<'draw' | 'P' | 'erase'>('draw')
  const [drag, setDrag] = useState<LDrag>(null)
  const [draft, setDraft] = useState<LL | null>(null)
  const fv = useFrozenView([P, ...lines.flatMap((l) => [[l.x1, l.y1] as XY, [l.x2, l.y2] as XY])], PLAN_BASE, 2.5)
  const upd = (i: number, k: keyof LL) => (v: number | boolean) => setLines(lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)))
  const ok = lines.length > 0 && z > 0 && fin(z, ...P) && lines.every((l) => fin(l.q, l.x1, l.y1, l.x2, l.y2))
  const rows = ok ? lines.map((l) => lineInPlan(l.q, [l.x1, l.y1], [l.x2, l.y2], P, z, l.inf)) : []
  const sum = rows.reduce((s, r) => s + r.sigma, 0)
  const down = (x: number, y: number, tol: number) => {
    fv.freeze()
    if (mode === 'erase') {
      const i = nearest(lines, (l) => segDist([l.x1, l.y1], [l.x2, l.y2], x, y), tol * 1.5)
      if (i >= 0) setLines(lines.filter((_, j) => j !== i))
      return
    }
    if (mode === 'P' || Math.hypot(P[0] - x, P[1] - y) <= tol) {
      setP([snap(x), snap(y)])
      return setDrag({ k: 'P' })
    }
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i]
      if (Math.hypot(l.x1 - x, l.y1 - y) <= tol) return setDrag({ k: 'end', i, e: 1 })
      if (Math.hypot(l.x2 - x, l.y2 - y) <= tol) return setDrag({ k: 'end', i, e: 2 })
    }
    setDraft({
      q: lines.at(-1)?.q ?? 50,
      x1: snap(x),
      y1: snap(y),
      x2: snap(x),
      y2: snap(y),
      inf: false,
    })
    setDrag({ k: 'new' })
  }
  const move = (x: number, y: number) => {
    const sx = snap(x)
    const sy = snap(y)
    if (!drag) return
    if (drag.k === 'P') setP([sx, sy])
    else if (drag.k === 'new') setDraft((d) => (d ? { ...d, x2: sx, y2: sy } : d))
    else setLines(lines.map((l, j) => (j === drag.i ? (drag.e === 1 ? { ...l, x1: sx, y1: sy } : { ...l, x2: sx, y2: sy }) : l)))
  }
  const up = () => {
    if (drag?.k === 'new' && draft && Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1) > 0) setLines([...lines, draft])
    setDraft(null)
    setDrag(null)
    fv.thaw()
  }
  const step = (l: LL, r: (typeof rows)[number], i: number) => {
    if (l.inf) return R`L${i + 1} (infinite, x = ${f3(r.d)}): $\frac{2q'z^3}{\pi(x^2+z^2)^2} = \frac{2(${f2(l.q)})(${f2(z)})^3}{\pi(${f3(r.d * r.d + z * z)})^2} = ${f3(r.sigma)}$`
    const lo = Math.min(r.t1, r.t2)
    const hi = Math.max(r.t1, r.t2)
    if (r.d < 1e-9) {
      const end = (L: number) => R`\frac{${f2(l.q)}(${f2(L)})(${f3(3 * z * z + 2 * L * L)})}{2\pi(${f2(z)})(${f3(z * z + L * L)})^{1.5}}`
      if (Math.abs(lo) < 1e-9 || Math.abs(hi) < 1e-9) {
        const L = Math.max(Math.abs(lo), Math.abs(hi))
        return R`L${i + 1} (P below one end, L = ${f2(L)}): $\frac{q'L(3z^2+2L^2)}{2\pi z(z^2+L^2)^{3/2}} = ${end(L)} = ${f3(r.sigma)}$`
      }
      if (lo < 0 && hi > 0) return R`L${i + 1} (passes over P: split there into ${f2(-lo)} m and ${f2(hi)} m, each ending above P): $${end(-lo)} + ${end(hi)} = ${f3(lineEnd(l.q, -lo, z))} + ${f3(lineEnd(l.q, hi, z))} = ${f3(r.sigma)}$`
      const n = Math.min(Math.abs(lo), Math.abs(hi))
      const fr = Math.max(Math.abs(lo), Math.abs(hi))
      return R`L${i + 1} (in line with P, ${f2(n)} to ${f2(fr)} m away: a ${f2(fr)} m wall minus a ${f2(n)} m wall, both ending above P): ${f3(lineEnd(l.q, fr, z))} − ${f3(lineEnd(l.q, n, z))} = ${f3(r.sigma)}`
    }
    return R`L${i + 1} (x = ${f3(r.d)}, y from ${f3(lo)} to ${f3(hi)}): $\frac{q'z^3}{2\pi}\left[\frac{y(2y^2+3a^2)}{a^4(a^2+y^2)^{3/2}}\right]_{${f2(lo)}}^{${f2(hi)}}$, $a^2 = ${f3(r.d * r.d + z * z)}$ → ${f3(r.sigma)}`
  }
  const shown = draft ? [...lines, draft] : lines
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Presets items={LINE_PRESETS} onPick={(p) => (fv.reset(), setLines(p.lines), setP(p.P), setZ(p.z))} />
        <Modes
          value={mode}
          onChange={setMode}
          items={[
            { v: 'draw', label: '╱ draw wall' },
            { v: 'P', label: '• move P' },
            { v: 'erase', label: '✕ erase' },
          ]}
        />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setLines([])}>
          clear
        </button>
      </div>
      <Split>
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">
          <DrawCanvas view={fv.view} onDown={down} onMove={move} onUp={up} label="plan of the walls">
            {(s) => {
              const span = (s.v.x1 - s.v.x0) * 3
              return (
                <>
                  <defs>
                    <clipPath id="ll-clip">
                      <rect x={0} y={0} width={s.w} height={s.h} />
                    </clipPath>
                  </defs>
                  {shown.map((l, i) => {
                    const L = Math.hypot(l.x2 - l.x1, l.y2 - l.y1)
                    if (!fin(l.x1, l.y1, l.x2, l.y2)) return null
                    const ux = L > 0 ? (l.x2 - l.x1) / L : 1
                    const uy = L > 0 ? (l.y2 - l.y1) / L : 0
                    const e = l.inf ? span : 0
                    const r = ok && i < rows.length ? rows[i] : null
                    // foot of the perpendicular from P
                    const t0 = (P[0] - l.x1) * ux + (P[1] - l.y1) * uy
                    const foot: XY = [l.x1 + t0 * ux, l.y1 + t0 * uy]
                    const outside = !l.inf && (t0 < -1e-9 || t0 > L + 1e-9)
                    const nearEnd: XY = t0 < 0 ? [l.x1, l.y1] : [l.x2, l.y2]
                    return (
                      <g key={'l' + i} clipPath="url(#ll-clip)">
                        {r && outside && <line x1={s.X(nearEnd[0])} y1={s.Y(nearEnd[1])} x2={s.X(foot[0])} y2={s.Y(foot[1])} stroke="var(--c-load)" strokeDasharray="2 3" opacity={0.6} />}
                        {r && r.d > 0.01 && (
                          <g>
                            <line x1={s.X(P[0])} y1={s.Y(P[1])} x2={s.X(foot[0])} y2={s.Y(foot[1])} stroke="var(--c-accent)" strokeDasharray="4 3" />
                            <text x={(s.X(P[0]) + s.X(foot[0])) / 2 + 4} y={(s.Y(P[1]) + s.Y(foot[1])) / 2 - 3} fontSize={9} fill="var(--c-accent)">
                              x = {f2(r.d)}
                            </text>
                          </g>
                        )}
                        <line x1={s.X(l.x1 - ux * e)} y1={s.Y(l.y1 - uy * e)} x2={s.X(l.x2 + ux * e)} y2={s.Y(l.y2 + uy * e)} stroke={i >= lines.length ? 'var(--c-accent)' : 'var(--c-load)'} strokeWidth={5} strokeLinecap="round" opacity={0.85} strokeDasharray={l.inf ? '12 5' : undefined} />
                        {!l.inf &&
                          [
                            [l.x1, l.y1],
                            [l.x2, l.y2],
                          ].map(([x, y], j) => <circle key={j} cx={s.X(x)} cy={s.Y(y)} r={3.5} fill="var(--c-bg)" stroke="var(--c-load)" strokeWidth={1.5} />)}
                        <text x={s.X(l.x1 + 0.72 * (l.x2 - l.x1)) + (s.X(l.x1 + 0.72 * (l.x2 - l.x1)) > s.w * 0.65 ? -7 : 7)} y={s.Y(l.y1 + 0.72 * (l.y2 - l.y1)) - 7} textAnchor={s.X(l.x1 + 0.72 * (l.x2 - l.x1)) > s.w * 0.65 ? 'end' : 'start'} fontSize={10} fontWeight={700} fill="var(--c-load)">
                          L{i + 1}: {fmt(l.q, 0)} kN/m
                          {l.inf ? ' (∞)' : ` · ${f2(L)} m`}
                        </text>
                      </g>
                    )
                  })}
                  <PMark s={s} at={P} />
                </>
              )
            }}
          </DrawCanvas>
          <Hint>Drag to draw a wall (snaps to 0.5 m); drag a wall's end dot or P to move it. Dashed = the offset x of P from each wall's line; a dotted extension means P's foot falls beyond the wall's end.</Hint>
        </div>
        <div className="space-y-2">
          {ok ? (
            <>
              <Big label="σz" value={sum} unit="kPa" />
              <DepthChart
                w={320}
                zMax={Math.max(3 * z, 4)}
                mark={{ z, v: sum }}
                curves={[
                  {
                    f: (zz) => lines.reduce((s, l) => s + lineInPlan(l.q, [l.x1, l.y1], [l.x2, l.y2], P, zz, l.inf).sigma, 0),
                    label: 'σz below P',
                  },
                ]}
              />
            </>
          ) : (
            <div className="text-bad text-sm">Draw at least one wall; z must be positive.</div>
          )}
        </div>
      </Split>
      <div className="overflow-x-auto">
        <table className="tbl text-xs num">
          <thead>
            <tr>
              <th className="txt">#</th>
              <th>q′ (kN/m)</th>
              <th>from x, y</th>
              <th>to x, y</th>
              <th className="txt">∞</th>
              <th>offset x</th>
              <th>y range</th>
              <th>σz</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i}>
                <td className="txt">L{i + 1}</td>
                <td>
                  <Cell value={l.q} onChange={upd(i, 'q')} step={10} />
                </td>
                <td className="whitespace-nowrap">
                  <Cell value={l.x1} onChange={upd(i, 'x1')} w="w-12" /> <Cell value={l.y1} onChange={upd(i, 'y1')} w="w-12" />
                </td>
                <td className="whitespace-nowrap">
                  <Cell value={l.x2} onChange={upd(i, 'x2')} w="w-12" /> <Cell value={l.y2} onChange={upd(i, 'y2')} w="w-12" />
                </td>
                <td className="txt">
                  <input type="checkbox" checked={l.inf} onChange={(e) => upd(i, 'inf')(e.target.checked)} aria-label="infinite line" />
                </td>
                <td>{rows[i] ? f3(rows[i].d) : '—'}</td>
                <td>{rows[i] ? (l.inf ? '−∞ … ∞' : `${f2(Math.min(rows[i].t1, rows[i].t2))} … ${f2(Math.max(rows[i].t1, rows[i].t2))}`) : '—'}</td>
                <td className="font-semibold">{rows[i] ? f3(rows[i].sigma) : '—'}</td>
                <td>
                  <RemoveBtn onClick={() => setLines(lines.filter((_, j) => j !== i))} />
                </td>
              </tr>
            ))}
            {ok && (
              <tr className="font-bold">
                <td className="txt" colSpan={7}>
                  Σ (kPa)
                </td>
                <td>{f3(sum)}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <NumIn label="P x" value={P[0]} onChange={(v) => setP([v, P[1]])} step={0.5} unit="m" w="w-14" />
        <NumIn label="P y" value={P[1]} onChange={(v) => setP([P[0], v])} step={0.5} unit="m" w="w-14" />
        <Hint>Tick ∞ for a line with no ends. y range = the wall's ends measured along its line from the foot of the perpendicular from P.</Hint>
      </div>
      {ok && <Work>{lines.map((l, i) => step(l, rows[i], i)).join('; ') + R`. **Σσz = ${f3(sum)} kPa.** A wall passing over P = two segments ending there (each the end formula).`}</Work>}
    </div>
  )
}

// ---------------------------------------------------------------- rectangles: Fadum and Steinbrenner

type RectCase = { rects: Rect[]; P: XY; z: number; q: number; note?: string }
// the paper plans (L, T, notched, outside points, centres) plus a plain corner case
const RECT_PRESETS: { label: string; v: RectCase }[] = [
  ...[...SHAPES.filter((s) => s.key === 'c2324'), ...SHAPES.filter((s) => s.key !== 'c2324')].map((s) => ({
    label: s.label,
    v: { rects: s.rects, P: s.P, z: s.z, q: s.q, note: s.note },
  })),
  {
    label: 'Practice: 3 × 6 m, 150 kPa, below a corner, 3 m',
    v: { rects: [{ x1: 0, y1: 0, x2: 3, y2: 6 }], P: [0, 0], z: 3, q: 150 },
  },
]
const norm = (r: Rect): Rect => ({
  x1: Math.min(r.x1, r.x2),
  y1: Math.min(r.y1, r.y2),
  x2: Math.max(r.x1, r.x2),
  y2: Math.max(r.y1, r.y2),
})
function overlaps(rs: Rect[]) {
  for (let i = 0; i < rs.length; i++)
    for (let j = i + 1; j < rs.length; j++) {
      const w = Math.min(rs[i].x2, rs[j].x2) - Math.max(rs[i].x1, rs[j].x1)
      const h = Math.min(rs[i].y2, rs[j].y2) - Math.max(rs[i].y1, rs[j].y1)
      if (w > 1e-9 && h > 1e-9) return true
    }
  return false
}

export function RectCalc() {
  const [c, setC] = useState<RectCase>(RECT_PRESETS[0].v)
  const { rects, P, z, q } = c
  const set = (o: Partial<RectCase>) => setC({ ...c, ...o, note: undefined })
  const setP = (p: XY) => set({ P: p })
  const [mode, setMode] = useState<'draw' | 'P' | 'erase'>('draw')
  const [draft, setDraft] = useState<Rect | null>(null)
  const [dragP, setDragP] = useState(false)
  const [lk, setLk] = useState({ m: 0.5, n: 1, zb: 2, lb: 1.5 })
  const fv = useFrozenView([P, ...rects.flatMap((r) => [[r.x1, r.y1] as XY, [r.x2, r.y2] as XY])], PLAN_BASE, 2.5)
  const one = rects.length === 1 ? rects[0] : null
  const B = one ? one.x2 - one.x1 : NaN
  const L = one ? one.y2 - one.y1 : NaN
  const area = rects.reduce((s, r) => s + (r.x2 - r.x1) * (r.y2 - r.y1), 0)
  const ok = rects.length > 0 && fin(q, z, ...P) && z > 0
  const terms = ok ? simplifyTerms(rects.flatMap((r) => cornerTerms(r, P[0], P[1], z))) : []
  // group the corner rectangles of equal size and sign (the centre gives 4 × the same one)
  const groups = new Map<string, { sign: number; b: number; l: number; k: number }>()
  for (const t of terms) {
    const b = Math.min(t.B, t.L)
    const l = Math.max(t.B, t.L)
    const key = `${t.sign}|${b.toFixed(6)}|${l.toFixed(6)}`
    const g = groups.get(key)
    if (g) g.k++
    else groups.set(key, { sign: t.sign, b, l, k: 1 })
  }
  const gs = [...groups.values()].sort((a, b) => b.sign - a.sign || b.b * b.l - a.b * a.l)
  const I = ok ? shapeI(rects, P[0], P[1], z) : NaN
  const s = q * I
  const centre = !!one && Math.abs(P[0] - (one.x1 + one.x2) / 2) < 1e-9 && Math.abs(P[1] - (one.y1 + one.y2) / 2) < 1e-9
  const Ilk = Irect(lk.m, lk.n)
  const Ist = Irect(1 / lk.zb, lk.lb / lk.zb)
  const down = (x: number, y: number) => {
    fv.freeze()
    if (mode === 'erase') {
      const i = rects.findIndex((r) => x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2)
      if (i >= 0) set({ rects: rects.filter((_, j) => j !== i) })
    } else if (mode === 'P' || Math.hypot(P[0] - x, P[1] - y) <= 0.4) {
      setP([snap(x), snap(y)])
      setDragP(true)
    } else setDraft({ x1: snap(x), y1: snap(y), x2: snap(x), y2: snap(y) })
  }
  const move = (x: number, y: number) => {
    if (dragP) setP([snap(x), snap(y)])
    else if (draft) setDraft({ ...draft, x2: snap(x), y2: snap(y) })
  }
  const up = () => {
    if (draft && Math.abs(draft.x2 - draft.x1) > 0 && Math.abs(draft.y2 - draft.y1) > 0) set({ rects: [...rects, norm(draft)] })
    setDraft(null)
    setDragP(false)
    fv.thaw()
  }
  const at = (fx: number, fy: number) => one && setP([one.x1 + fx * B, one.y1 + fy * L])
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Presets items={RECT_PRESETS} onPick={(p) => (fv.reset(), setC(p))} />
        <button
          className="btn !py-0.5 !px-2 !text-xs"
          onClick={() => {
            const r = randomShape(Math.floor(Math.random() * 1e9))
            fv.reset()
            setC({ rects: r.rects, P: r.P, z: r.z, q: r.q })
          }}
        >
          🎲 random plan
        </button>
        <Modes
          value={mode}
          onChange={setMode}
          items={[
            { v: 'draw', label: '▭ draw rectangle' },
            { v: 'P', label: '• move P' },
            { v: 'erase', label: '✕ erase' },
          ]}
        />
        <NumIn label="z" value={z} onChange={(v) => set({ z: v })} step={0.5} unit="m" w="w-14" />
        <NumIn label="q" value={q} onChange={(v) => set({ q: v })} step={10} unit="kPa" w="w-16" />
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ rects: [] })}>
          clear
        </button>
      </div>
      {c.note && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{c.note}</div>}
      {one && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <NumIn label="B" value={B} onChange={(v) => set({ rects: [{ ...one, x2: one.x1 + v }] })} step={0.5} unit="m" w="w-14" />
          <NumIn label="L" value={L} onChange={(v) => set({ rects: [{ ...one, y2: one.y1 + v }] })} step={0.5} unit="m" w="w-14" />
          <span className="text-xs text-mute">P at</span>
          {(
            [
              ['corner', 0, 0],
              ['centre', 0.5, 0.5],
              ['mid of B side', 0.5, 0],
              ['mid of L side', 0, 0.5],
            ] as const
          ).map(([t, fx, fy]) => (
            <button key={t} className="btn !py-0.5 !px-2 !text-xs" onClick={() => at(fx, fy)}>
              {t}
            </button>
          ))}
        </div>
      )}
      <Hint>
        Q given instead of q? q = Q/area
        {area > 0 ? ` (loaded area here ${f2(area)} m², so 4800 kN → ${f2(4800 / area)} kPa)` : ''}. Build L, T or notched plans from several rectangles; P may sit inside, on an edge or outside. B and L boxes appear when there is a single rectangle.
      </Hint>
      <Split>
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">
          <PlanFig rects={rects} P={P} terms={terms} view={fv.view} draft={draft} onDown={down} onMove={move} onUp={up} grid={1} />
          <Hint>Drag to add a loaded rectangle (they must not overlap), drag P to move it. Green dashed = + corner rectangle at P, red = − (fictitious).</Hint>
        </div>
        <div className="space-y-2">
          {overlaps(rects) && <div className="text-bad text-sm">Two rectangles overlap — that area would be counted twice.</div>}
          {ok && <Big label="σz = qΣI" value={s} unit="kPa" />}
          {ok && centre && <KV k="2:1 average, Q/((B+z)(L+z))" v={f3(twoToOneRect(q * B * L, B, L, z))} unit="kPa" />}
          <Card
            title="Fadum: I from m, n"
            chart="d-fadum"
            inputs={
              <>
                <NumIn label="m" value={lk.m} onChange={(v) => setLk({ ...lk, m: v })} step={0.1} w="w-14" />
                <NumIn label="n" value={lk.n} onChange={(v) => setLk({ ...lk, n: v })} step={0.1} w="w-14" />
              </>
            }
          >
            <KV k="I(m, n)" v={fin(Ilk) ? f4(Ilk) : '—'} />
            {piBranch(lk.m, lk.n) && <div className="text-xs text-bad">m²n² &gt; m² + n² + 1: add π to the tan⁻¹ (the calculator trap).</div>}
          </Card>
          <Card
            title="Steinbrenner: I from z/b, l/b"
            chart="d-steinbrenner"
            inputs={
              <>
                <NumIn label="z/b" value={lk.zb} onChange={(v) => setLk({ ...lk, zb: v })} step={0.1} w="w-14" />
                <NumIn label="l/b" value={lk.lb} onChange={(v) => setLk({ ...lk, lb: v })} step={0.5} w="w-14" />
              </>
            }
          >
            <KV k="I (corner)" v={lk.zb > 0 && lk.lb > 0 ? f4(Ist) : '—'} />
            <Hint>
              = Fadum with m = 1/(z/b) = {lk.zb > 0 ? f3(1 / lk.zb) : '—'}, n = (l/b)/(z/b) = {lk.zb > 0 ? f3(lk.lb / lk.zb) : '—'}.
            </Hint>
          </Card>
        </div>
      </Split>
      {ok && (
        <>
          <div className="overflow-x-auto">
            <table className="tbl text-xs num">
              <thead>
                <tr>
                  <th className="txt">±</th>
                  <th>b × l (corner at P)</th>
                  <th>m = b/z</th>
                  <th>n = l/z</th>
                  <th>z/b</th>
                  <th>l/b</th>
                  <th>I</th>
                  <th>× I</th>
                </tr>
              </thead>
              <tbody>
                {gs.map((g, i) => {
                  const Ig = Irect(g.b / z, g.l / z)
                  return (
                    <tr key={i}>
                      <td className="txt whitespace-nowrap">
                        {g.sign > 0 ? '+' : '−'}
                        {g.k > 1 ? ` ${g.k} ×` : ''}
                      </td>
                      <td>
                        {f2(g.b)} × {f2(g.l)}
                      </td>
                      <td>{f3(g.b / z)}</td>
                      <td>{f3(g.l / z)}</td>
                      <td>{f3(z / g.b)}</td>
                      <td>{f3(g.l / g.b)}</td>
                      <td>
                        {f4(Ig)}
                        {piBranch(g.b / z, g.l / z) ? ' (+π)' : ''}
                      </td>
                      <td className="font-semibold">{f4(g.sign * g.k * Ig)}</td>
                    </tr>
                  )
                })}
                <tr className="font-bold">
                  <td className="txt" colSpan={7}>
                    ΣI
                  </td>
                  <td>{f4(I)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Work>{R`Every rectangle has a corner at P (+ loaded, − fictitious). Fadum reads $I(m, n)$ with $m = b/z$, $n = l/z$; Steinbrenner reads the same $I$ against $z/b$ on the $l/b$ curve (b = shorter side). ${gs.map((g) => R`${g.sign > 0 ? '+' : '−'}${g.k > 1 ? `${g.k}×` : ''}I(${f3(g.b / z)}, ${f3(g.l / z)}) = ${f4(Irect(g.b / z, g.l / z))}`).join('; ')}. ΣI = ${f4(I)} → σz = ${f2(q)} × ${f4(I)} = **${f3(s)} kPa**.`}</Work>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Newmark

export function NewmarkCalc() {
  const [rects, setRects] = useState<Rect[]>(SHAPES[0].rects)
  const [P, setP] = useState<XY>(SHAPES[0].P)
  const [z, setZ] = useState(SHAPES[0].z)
  const [q, setQ] = useState(150)
  const [mode, setMode] = useState<'draw' | 'P' | 'erase'>('draw')
  const [draft, setDraft] = useState<Rect | null>(null)
  const [dragP, setDragP] = useState(false)
  const [o, setO] = useState({ N: 66, rings: 10, sectors: 20, target: 50 })
  const [AB, setAB] = useState(3)
  const fv = useFrozenView([P, ...rects.flatMap((r) => [[r.x1, r.y1] as XY, [r.x2, r.y2] as XY])], PLAN_BASE, 2)
  const ok = rects.length > 0 && z > 0 && fin(z, q, ...P)
  const cnt = useMemo(() => (ok ? newmarkCount((x, y) => rectsInside(rects)(x + P[0], y + P[1]), z, 8) : null), [ok, rects, P, z])
  const exact = ok ? shapeI(rects, P[0], P[1], z) : NaN
  const rel = rects.map((r) => ({
    x1: r.x1 - P[0],
    y1: r.y1 - P[1],
    x2: r.x2 - P[0],
    y2: r.y2 - P[1],
  }))
  const IV = o.rings > 0 && o.sectors > 0 ? 1 / (o.rings * o.sectors) : NaN
  const radii = z > 0 ? newmarkRadii(z, 10) : []
  const down = (x: number, y: number) => {
    fv.freeze()
    if (mode === 'erase') {
      const i = rects.findIndex((r) => x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2)
      if (i >= 0) setRects(rects.filter((_, j) => j !== i))
    } else if (mode === 'P' || Math.hypot(P[0] - x, P[1] - y) <= 0.4) {
      setP([snap(x), snap(y)])
      setDragP(true)
    } else setDraft({ x1: snap(x), y1: snap(y), x2: snap(x), y2: snap(y) })
  }
  const move = (x: number, y: number) => {
    if (dragP) setP([snap(x), snap(y)])
    else if (draft) setDraft({ ...draft, x2: snap(x), y2: snap(y) })
  }
  const up = () => {
    if (draft && Math.abs(draft.x2 - draft.x1) > 0 && Math.abs(draft.y2 - draft.y1) > 0) setRects([...rects, norm(draft)])
    setDraft(null)
    setDragP(false)
    fv.thaw()
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Presets items={SHAPES.map((s) => ({ label: s.label, v: s }))} onPick={(s) => (fv.reset(), setRects(s.rects), setP(s.P), setZ(s.z), setQ(s.key === 't2122' ? 150 : s.q))} />
        <Modes
          value={mode}
          onChange={setMode}
          items={[
            { v: 'draw', label: '▭ draw rectangle' },
            { v: 'P', label: '• move P' },
            { v: 'erase', label: '✕ erase' },
          ]}
        />
        <NumIn label="z (= AB)" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
        <NumIn label="q" value={q} onChange={setQ} step={10} unit="kPa" w="w-16" />
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setRects([])}>
          clear
        </button>
      </div>
      <div className="grid cq-lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">
          <PlanFig rects={rects} P={P} view={fv.view} draft={draft} onDown={down} onMove={move} onUp={up} grid={1} />
          <Hint>Draw the loaded area from rectangles (they must not overlap) and place P. The chart is the same plan redrawn at AB = z with P at the centre; shading = covered fraction of each mesh.</Hint>
        </div>
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">{cnt ? <NewmarkChart size={380} z={z} rects={rel} meshes={cnt.meshes} /> : <div className="text-bad text-sm">Draw at least one rectangle; z must be positive.</div>}</div>
      </div>
      {cnt && (
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Big label="σz = 0.005 N q" value={NEWMARK_IF * cnt.N * q} unit="kPa" />
            <KV k="meshes covered N" v={fmt(cnt.N, 1)} />
            <KV k="Fadum superposition (exact)" v={`ΣI = ${f4(exact)} → ${f3(q * exact)}`} unit="kPa" />
          </div>
          <div className="overflow-x-auto">
            <table className="tbl text-xs num">
              <thead>
                <tr>
                  <th className="txt">ring</th>
                  {cnt.perRing.map((_, i) => (
                    <th key={i}>{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="txt">meshes</td>
                  {cnt.perRing.map((v, i) => (
                    <td key={i}>{fmt(v, 1)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="grid cq-lg:grid-cols-2 gap-4">
        <Card
          title="σz from your own mesh count"
          chart="d-newmark"
          inputs={
            <>
              <NumIn label="N (meshes)" value={o.N} onChange={(v) => setO({ ...o, N: v })} step={1} w="w-16" />
              <NumIn label="rings" value={o.rings} onChange={(v) => setO({ ...o, rings: v })} step={1} w="w-12" />
              <NumIn label="sectors" value={o.sectors} onChange={(v) => setO({ ...o, sectors: v })} step={1} w="w-12" />
            </>
          }
        >
          <Big label="σz = IV · N · q" value={IV * o.N * q} unit="kPa" />
          <NumIn label="target σz" value={o.target} onChange={(v) => setO({ ...o, target: v })} step={5} unit="kPa" w="w-16" />
          <Work>{R`IV = 1/(rings × sectors) = ${fin(IV) ? fmt(IV, 5) : '—'}; σz = ${fin(IV) ? fmt(IV, 5) : '—'} × ${f2(o.N)} × ${f2(q)} = **${f3(IV * o.N * q)} kPa**. Count part-meshes as fractions. For the target ${f2(o.target)} kPa you need N = σz/(IV·q) = ${fin(IV) && q ? fmt(o.target / (IV * q), 1) : '—'} meshes.`}</Work>
        </Card>
        <Card title="Chart construction: the circle radii" chart="d-newmark" inputs={<NumIn label="AB drawn as" value={AB} onChange={setAB} step={0.5} unit="cm" w="w-14" />}>
          {z > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="tbl text-xs num">
                  <thead>
                    <tr>
                      <th>σz/q</th>
                      <th>R/z</th>
                      <th>R (m) at z = {f2(z)}</th>
                      {AB > 0 && <th>R on paper (cm)</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {radii.map((r) => (
                      <tr key={r.s}>
                        <td>{fmt(r.s, 1)}</td>
                        <td>{f3(r.rz)}</td>
                        <td>{f3(r.R)}</td>
                        {AB > 0 && <td>{f2(r.rz * AB)}</td>}
                      </tr>
                    ))}
                    <tr>
                      <td>1.0</td>
                      <td>∞</td>
                      <td>∞</td>
                      {AB > 0 && <td>∞</td>}
                    </tr>
                  </tbody>
                </table>
              </div>
              <Work>{R`$R/z = \sqrt{(1-\sigma_z/q)^{-2/3} - 1}$ from the circle formula. 10 rings × 20 rays = 200 meshes → IV = 0.005. Plan scale AB = z: ${AB > 0 ? `${f2(AB)} cm = ${f2(z)} m → 1 : ${fmt((z * 100) / AB, 0)}` : 'AB = z'}; a new plan for every depth.`}</Work>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export function StressCalculators() {
  const [t, setT] = useState<Tab>('point')
  return (
    <div className="space-y-3">
      <div className="max-w-full overflow-x-auto">
        <Seg value={t} onChange={setT} items={TABS} />
      </div>
      {t === 'point' ? <PointCalc /> : t === 'line' ? <LineCalc /> : t === 'rect' ? <RectCalc /> : t === 'newmark' ? <NewmarkCalc /> : t === 'strip' ? <StripCalc /> : t === 'emb' ? <EmbCalc /> : t === 'circle' ? <CircleCalc /> : <TwoOneCalc />}
    </div>
  )
}
