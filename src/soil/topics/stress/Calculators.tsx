// Quick calculators for exam questions: plug in the numbers, read σz with the working laid out the way the script
// wants it. Point loads and wall line loads in plan (any number), Fadum / Steinbrenner rectangles, Newmark (count →
// σz, chart construction), strips, Osterberg blocks, circles and 2:1.
import { useState, type ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { KV, Md, Seg } from '../../../components/ui'
import { NumIn } from '../../../reference/common'
import {
  boussinesq,
  circleCentre,
  cornerTerms,
  Irect,
  lineEnd,
  lineInPlan,
  maxOnVertical,
  newmarkRadii,
  osterberg,
  osterbergAngles,
  piBranch,
  pointInPlan,
  rectI,
  stripAngles,
  stripAt,
  triStripDas,
  twoToOneCircle,
  twoToOneRect,
  twoToOneStrip,
  westergaard,
  type XY,
} from '../../engine/stressdist'
import { openSmRef } from '../../reference/pane'
import { DepthChart } from './figs'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)
const R = String.raw
const fin = (...v: number[]) => v.every(Number.isFinite)

type Tab = 'point' | 'line' | 'rect' | 'newmark' | 'other'
const TABS: { v: Tab; label: string }[] = [
  { v: 'point', label: 'Point loads' },
  { v: 'line', label: 'Line loads' },
  { v: 'rect', label: 'Fadum / Steinbrenner' },
  { v: 'newmark', label: 'Newmark' },
  { v: 'other', label: 'Strip · Osterberg · circle · 2:1' },
]

// ---------------------------------------------------------------- shared bits

function Cell({ value, onChange, step = 0.5, w = 'w-14' }: { value: number; onChange: (v: number) => void; step?: number; w?: string }) {
  return <input type="number" className={'field !py-0.5 !px-1 !text-xs num ' + w} value={Number.isFinite(value) ? value : ''} step={step} onChange={(e) => onChange(e.target.value === '' ? NaN : +e.target.value)} />
}

function Card({ title, inputs, children, chart }: { title: ReactNode; inputs?: ReactNode; children: ReactNode; chart?: string }) {
  return (
    <div className="rounded-xl border border-line p-3 space-y-2 min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-bold text-sm">{title}</div>
        {chart && (
          <button className="text-xs text-accent underline shrink-0" onClick={() => openSmRef(chart)}>
            chart ↗
          </button>
        )}
      </div>
      {inputs && <div className="flex flex-wrap items-center gap-2">{inputs}</div>}
      {children}
    </div>
  )
}

function Big({ label, value, unit }: { label: ReactNode; value: number; unit?: string }) {
  return (
    <div className="rounded-lg bg-accent/10 border border-accent/30 px-3 py-1.5 flex items-baseline justify-between gap-3">
      <span className="text-sm font-semibold">{label}</span>
      <span className="num text-lg font-bold text-accent">
        {Number.isFinite(value) ? f3(value) : '—'}
        {unit && <span className="text-sm text-mute font-normal ml-1">{unit}</span>}
      </span>
    </div>
  )
}

const Work = ({ children }: { children: string }) => (
  <div className="rounded-lg bg-panel2/50 border border-line px-3 py-2 text-sm">
    <Md>{children}</Md>
  </div>
)

/** plan sketch: point loads, line loads (segments or infinite lines) and the point P */
function PlanSketch({ points = [], lines = [], P, w = 320 }: { points?: { at: XY; label: string }[]; lines?: { a: XY; b: XY; label: string; inf?: boolean }[]; P: XY; w?: number }) {
  const xs = [P[0], ...points.map((p) => p.at[0]), ...lines.flatMap((l) => [l.a[0], l.b[0]])].filter(Number.isFinite)
  const ys = [P[1], ...points.map((p) => p.at[1]), ...lines.flatMap((l) => [l.a[1], l.b[1]])].filter(Number.isFinite)
  const span = Math.max(4, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  const pad = span * 0.18
  const x0 = Math.min(...xs) - pad
  const x1 = Math.max(...xs) + pad
  // keep the view at least half as tall as it is wide, so loads in one row still get a readable sketch
  const yc = (Math.min(...ys) + Math.max(...ys)) / 2
  const yh = Math.max((Math.max(...ys) - Math.min(...ys)) / 2 + pad, (x1 - x0) / 4)
  const y0 = yc - yh
  const y1 = yc + yh
  const k = w / (x1 - x0)
  const h = Math.min(260, (y1 - y0) * k)
  const kk = Math.min(k, h / (y1 - y0))
  const ox = (w - (x1 - x0) * kk) / 2
  const X = (x: number) => ox + (x - x0) * kk
  const Y = (y: number) => (y1 - y) * kk
  const g = span > 30 ? 5 : span > 12 ? 2 : 1
  const gx: number[] = []
  for (let x = Math.ceil(x0 / g) * g; x <= x1; x += g) gx.push(x)
  const gy: number[] = []
  for (let y = Math.ceil(y0 / g) * g; y <= y1; y += g) gy.push(y)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-sm" role="img" aria-label="plan of the loads and the point">
      {gx.map((x) => (
        <line key={'x' + x} x1={X(x)} x2={X(x)} y1={0} y2={h} stroke="var(--c-line)" strokeWidth={0.6} />
      ))}
      {gy.map((y) => (
        <line key={'y' + y} x1={0} x2={w} y1={Y(y)} y2={Y(y)} stroke="var(--c-line)" strokeWidth={0.6} />
      ))}
      {lines.map((l, i) => {
        if (!fin(...l.a, ...l.b)) return null
        const L = Math.hypot(l.b[0] - l.a[0], l.b[1] - l.a[1]) || 1
        const e = l.inf ? span * 4 : 0
        const ux = (l.b[0] - l.a[0]) / L
        const uy = (l.b[1] - l.a[1]) / L
        const mx = (l.a[0] + l.b[0]) / 2
        const my = (l.a[1] + l.b[1]) / 2
        return (
          <g key={'l' + i}>
            <line x1={X(l.a[0] - ux * e)} y1={Y(l.a[1] - uy * e)} x2={X(l.b[0] + ux * e)} y2={Y(l.b[1] + uy * e)} stroke="var(--c-load)" strokeWidth={4} strokeLinecap="round" opacity={0.85} strokeDasharray={l.inf ? '10 4' : undefined} />
            <text x={X(mx) + 5} y={Y(my) - 5} fontSize={10} fill="var(--c-load)" fontWeight={700}>
              {l.label}
            </text>
          </g>
        )
      })}
      {points.map((p, i) =>
        fin(...p.at) ? (
          <g key={'p' + i}>
            <circle cx={X(p.at[0])} cy={Y(p.at[1])} r={6} fill="var(--c-load)" />
            <text x={X(p.at[0]) + 8} y={Y(p.at[1]) - 6} fontSize={10} fill="var(--c-load)" fontWeight={700}>
              {p.label}
            </text>
          </g>
        ) : null,
      )}
      {fin(...P) && (
        <g>
          <circle cx={X(P[0])} cy={Y(P[1])} r={4.5} fill="var(--c-accent)" stroke="var(--c-bg)" strokeWidth={1.5} />
          <text x={X(P[0]) + 7} y={Y(P[1]) + 14} fontSize={11} fill="var(--c-accent)" fontWeight={700}>
            P
          </text>
        </g>
      )}
      <text x={w - 4} y={h - 4} fontSize={9} textAnchor="end" fill="var(--c-faint)">
        grid {g} m
      </text>
    </svg>
  )
}

const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button className="text-faint hover:text-bad text-xs px-1" onClick={onClick} aria-label="remove row">
    ✕
  </button>
)

// ---------------------------------------------------------------- point loads

interface PL {
  Q: number
  x: number
  y: number
}
const POINT_PRESETS: { label: string; loads: PL[]; P: XY; z: number }[] = [
  { label: '2021-22 Q4(a): two 300 kN footings 5 m apart, 8.5 m below one', loads: [{ Q: 300, x: 0, y: 0 }, { Q: 300, x: 5, y: 0 }], P: [0, 0], z: 8.5 },
  { label: 'Practice: 1500 kN, 3 m deep, 2 m off the axis', loads: [{ Q: 1500, x: 0, y: 0 }], P: [2, 0], z: 3 },
  { label: 'Four columns on a 4 m grid, below the middle', loads: [{ Q: 500, x: 0, y: 0 }, { Q: 500, x: 4, y: 0 }, { Q: 500, x: 0, y: 4 }, { Q: 500, x: 4, y: 4 }], P: [2, 2], z: 3 },
]

function PointCalc() {
  const [loads, setLoads] = useState<PL[]>(POINT_PRESETS[0].loads)
  const [P, setP] = useState<XY>(POINT_PRESETS[0].P)
  const [z, setZ] = useState(POINT_PRESETS[0].z)
  const [mx, setMx] = useState({ Q: 1500, r: 2 })
  const upd = (i: number, k: keyof PL) => (v: number) => setLoads(loads.map((l, j) => (j === i ? { ...l, [k]: v } : l)))
  const ok = z > 0 && fin(z, ...P) && loads.every((l) => fin(l.Q, l.x, l.y))
  const rows = ok ? loads.map((l) => pointInPlan(l.Q, [l.x, l.y], P, z)) : []
  const sB = rows.reduce((s, r) => s + r.sB, 0)
  const sW = rows.reduce((s, r) => s + r.sW, 0)
  const m = mx.r > 0 && fin(mx.Q) ? maxOnVertical(mx.Q, mx.r) : null
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          className="field !py-1 !text-xs max-w-full"
          value=""
          onChange={(e) => {
            const p = POINT_PRESETS[+e.target.value]
            if (p) (setLoads(p.loads), setP(p.P), setZ(p.z))
          }}
        >
          <option value="">Load a case…</option>
          {POINT_PRESETS.map((p, i) => (
            <option key={i} value={i}>
              {p.label}
            </option>
          ))}
        </select>
        <NumIn label="P x" value={P[0]} onChange={(v) => setP([v, P[1]])} step={0.5} unit="m" w="w-14" />
        <NumIn label="P y" value={P[1]} onChange={(v) => setP([P[0], v])} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
      </div>
      <div className="grid cq-lg:grid-cols-[1fr_20rem] gap-4">
        <div className="space-y-2 min-w-0">
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
                    <td>{loads.length > 1 && <RemoveBtn onClick={() => setLoads(loads.filter((_, j) => j !== i))} />}</td>
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
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setLoads([...loads, { Q: 100, x: (loads.at(-1)?.x ?? 0) + 2, y: loads.at(-1)?.y ?? 0 }])}>
            + add a load
          </button>
          {ok && (
            <>
              <Big label="σz (Boussinesq)" value={sB} unit="kPa" />
              <KV k="Westergaard (μ = 0)" v={f3(sW)} unit="kPa" />
              <Work>{R`$\sigma_z = \sum K_B\frac{Q}{z^2}$, $K_B = \frac{3/2\pi}{[1+(r/z)^2]^{5/2}}$: ${rows.map((r, i) => R`Q${i + 1}: r/z = ${f3(r.rz)}, $K_B$ = ${f4(r.KB)} → ${f4(r.KB)}(${f2(loads[i].Q)})/${f2(z)}² = ${f3(r.sB)}`).join('; ')}. **σz = ${f3(sB)} kPa.** Westergaard: $K_W = \frac{1/\pi}{[1+2(r/z)^2]^{3/2}}$ → ${f3(sW)} kPa.`}</Work>
            </>
          )}
        </div>
        <div className="space-y-2">
          {ok && <PlanSketch P={P} points={loads.map((l, i) => ({ at: [l.x, l.y] as XY, label: `Q${i + 1}` }))} />}
          {ok && <DepthChart w={320} zMax={Math.max(2 * z, 4)} mark={{ z, v: sB }} curves={[{ f: (zz) => loads.reduce((s, l) => s + boussinesq(l.Q, Math.hypot(l.x - P[0], l.y - P[1]), zz), 0), label: 'Boussinesq, below P' }, { f: (zz) => loads.reduce((s, l) => s + westergaard(l.Q, Math.hypot(l.x - P[0], l.y - P[1]), zz), 0), label: 'Westergaard', dash: true }]} />}
        </div>
      </div>
      <Card title="Maximum σz on a vertical line at radius r" chart="d-kb" inputs={<><NumIn label="Q" value={mx.Q} onChange={(v) => setMx({ ...mx, Q: v })} step={50} unit="kN" w="w-16" /><NumIn label="r" value={mx.r} onChange={(v) => setMx({ ...mx, r: v })} step={0.5} unit="m" w="w-14" /></>}>
        {m && (
          <>
            <div className="grid cq-md:grid-cols-3 gap-x-4">
              <KV k="depth z = r/0.8165" v={f3(m.z)} unit="m" />
              <KV k="σz,max = 0.0888Q/r²" v={f3(m.sigma)} unit="kPa" />
              <KV k="angle from the axis" v={f2(m.beta)} unit="°" />
            </div>
            <div className="text-xs text-faint">dσz/dz = 0 gives r/z = √(2/3) = 0.8165 (β = 39.23°), KB = 0.1332, σmax = 0.1332 × (2/3) Q/r² = 0.0888 Q/r².</div>
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
const LINE_PRESETS: { label: string; lines: LL[]; P: XY; z: number }[] = [
  {
    label: '2012-13 Q12(c): T of walls, BA 75 kN/m (9 m) and CD 100 kN/m (6 + 6 m), 3 m below A',
    lines: [
      { q: 75, x1: 0, y1: 9, x2: 0, y2: 0, inf: false },
      { q: 100, x1: -6, y1: 0, x2: 6, y2: 0, inf: false },
    ],
    P: [0, 0],
    z: 3,
  },
  { label: 'One infinite line, point 2 m to the side, 3 m deep', lines: [{ q: 100, x1: 0, y1: -5, x2: 0, y2: 5, inf: true }], P: [2, 0], z: 3 },
  {
    label: 'L of walls (corner at A), point 2 m inside the corner',
    lines: [
      { q: 80, x1: 0, y1: 0, x2: 8, y2: 0, inf: false },
      { q: 80, x1: 0, y1: 0, x2: 0, y2: 6, inf: false },
    ],
    P: [2, 2],
    z: 2,
  },
]

function LineCalc() {
  const [lines, setLines] = useState<LL[]>(LINE_PRESETS[0].lines)
  const [P, setP] = useState<XY>(LINE_PRESETS[0].P)
  const [z, setZ] = useState(LINE_PRESETS[0].z)
  const upd = (i: number, k: keyof LL) => (v: number | boolean) => setLines(lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)))
  const ok = z > 0 && fin(z, ...P) && lines.every((l) => fin(l.q, l.x1, l.y1, l.x2, l.y2))
  const rows = ok ? lines.map((l) => lineInPlan(l.q, [l.x1, l.y1], [l.x2, l.y2], P, z, l.inf)) : []
  const sum = rows.reduce((s, r) => s + r.sigma, 0)
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
      if (lo < 0 && hi > 0)
        return R`L${i + 1} (passes over P: split there into ${f2(-lo)} m and ${f2(hi)} m, each ending above P): $${end(-lo)} + ${end(hi)} = ${f3(lineEnd(l.q, -lo, z))} + ${f3(lineEnd(l.q, hi, z))} = ${f3(r.sigma)}$`
      const n = Math.min(Math.abs(lo), Math.abs(hi))
      const fr = Math.max(Math.abs(lo), Math.abs(hi))
      return R`L${i + 1} (in line with P, ${f2(n)} to ${f2(fr)} m away: a ${f2(fr)} m wall minus a ${f2(n)} m wall, both ending above P): ${f3(lineEnd(l.q, fr, z))} − ${f3(lineEnd(l.q, n, z))} = ${f3(r.sigma)}`
    }
    return R`L${i + 1} (x = ${f3(r.d)}, y from ${f3(lo)} to ${f3(hi)}): $\frac{q'z^3}{2\pi}\left[\frac{y(2y^2+3a^2)}{a^4(a^2+y^2)^{3/2}}\right]_{${f2(lo)}}^{${f2(hi)}}$, $a^2 = ${f3(r.d * r.d + z * z)}$ → ${f3(r.sigma)}`
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          className="field !py-1 !text-xs max-w-full"
          value=""
          onChange={(e) => {
            const p = LINE_PRESETS[+e.target.value]
            if (p) (setLines(p.lines), setP(p.P), setZ(p.z))
          }}
        >
          <option value="">Load a case…</option>
          {LINE_PRESETS.map((p, i) => (
            <option key={i} value={i}>
              {p.label}
            </option>
          ))}
        </select>
        <NumIn label="P x" value={P[0]} onChange={(v) => setP([v, P[1]])} step={0.5} unit="m" w="w-14" />
        <NumIn label="P y" value={P[1]} onChange={(v) => setP([P[0], v])} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
      </div>
      <div className="grid cq-lg:grid-cols-[1fr_20rem] gap-4">
        <div className="space-y-2 min-w-0">
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
                    <td>{lines.length > 1 && <RemoveBtn onClick={() => setLines(lines.filter((_, j) => j !== i))} />}</td>
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
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setLines([...lines, { q: 50, x1: 0, y1: -4, x2: 0, y2: 4, inf: false }])}>
            + add a wall / line
          </button>
          <div className="text-xs text-faint">Each wall is a segment from (x, y) to (x, y) in plan; tick ∞ for a line with no ends. Offset x = perpendicular distance of P from the line, y range = the ends measured along the line from the foot of that perpendicular.</div>
          {ok && (
            <>
              <Big label="σz" value={sum} unit="kPa" />
              <Work>{lines.map((l, i) => step(l, rows[i], i)).join('; ') + R`. **Σσz = ${f3(sum)} kPa.** A wall passing through P's vertical = two segments ending there (each the end formula).`}</Work>
            </>
          )}
        </div>
        <div className="space-y-2">{ok && <PlanSketch P={P} lines={lines.map((l, i) => ({ a: [l.x1, l.y1] as XY, b: [l.x2, l.y2] as XY, label: `L${i + 1}: ${f2(l.q)} kN/m`, inf: l.inf }))} />}</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- rectangles: Fadum and Steinbrenner

const RECT_PRESETS = [
  { label: "2023-24 Q8(b): 4 × 6 m, 4800 kN, 6 m below the centre (Steinbrenner)", o: { q: 200, B: 4, L: 6, x: 2, y: 3, z: 6 } },
  { label: 'Practice: 3 × 6 m, 150 kPa, below a corner, 3 m', o: { q: 150, B: 3, L: 6, x: 0, y: 0, z: 3 } },
  { label: '2020-21 Q4(d): 3 × 2 m, 150 kPa, 1 m outside a short side on the mid-line, 2 m', o: { q: 150, B: 3, L: 2, x: -1, y: 1, z: 2 } },
]

function RectCalc() {
  const [o, setO] = useState(RECT_PRESETS[0].o)
  const [lk, setLk] = useState({ m: 0.5, n: 1, zb: 2, lb: 1.5 })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const ok = fin(o.q, o.B, o.L, o.x, o.y, o.z) && o.B > 0 && o.L > 0 && o.z > 0
  const rect = { x1: 0, y1: 0, x2: o.B, y2: o.L }
  // group the corner rectangles of equal size and sign (the centre gives 4 × the same one)
  const groups = new Map<string, { sign: number; b: number; l: number; k: number }>()
  if (ok)
    for (const t of cornerTerms(rect, o.x, o.y, o.z)) {
      const b = Math.min(t.B, t.L)
      const l = Math.max(t.B, t.L)
      const key = `${t.sign}|${b.toFixed(6)}|${l.toFixed(6)}`
      const g = groups.get(key)
      if (g) g.k++
      else groups.set(key, { sign: t.sign, b, l, k: 1 })
    }
  const gs = [...groups.values()].sort((a, b) => b.sign - a.sign || b.b * b.l - a.b * a.l)
  const I = ok ? rectI(rect, o.x, o.y, o.z) : NaN
  const s = o.q * I
  const centre = Math.abs(o.x - o.B / 2) < 1e-9 && Math.abs(o.y - o.L / 2) < 1e-9
  const Ilk = Irect(lk.m, lk.n)
  const Ist = Irect(1 / lk.zb, lk.lb / lk.zb)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          className="field !py-1 !text-xs max-w-full"
          value=""
          onChange={(e) => {
            const p = RECT_PRESETS[+e.target.value]
            if (p) setO(p.o)
          }}
        >
          <option value="">Load a case…</option>
          {RECT_PRESETS.map((p, i) => (
            <option key={i} value={i}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <NumIn label="q" value={o.q} onChange={set('q')} step={10} unit="kPa" w="w-16" />
        <NumIn label="B" value={o.B} onChange={set('B')} step={0.5} unit="m" w="w-14" />
        <NumIn label="L" value={o.L} onChange={set('L')} step={0.5} unit="m" w="w-14" />
        <NumIn label="P x (from a corner)" value={o.x} onChange={set('x')} step={0.5} unit="m" w="w-14" />
        <NumIn label="P y" value={o.y} onChange={set('y')} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={o.z} onChange={set('z')} step={0.5} unit="m" w="w-14" />
        <span className="inline-flex gap-1">
          {[
            ['corner', 0, 0],
            ['centre', o.B / 2, o.L / 2],
            ['mid of B side', o.B / 2, 0],
            ['mid of L side', 0, o.L / 2],
          ].map(([t, x, y]) => (
            <button key={t as string} className="btn !py-0.5 !px-2 !text-xs" onClick={() => setO({ ...o, x: x as number, y: y as number })}>
              {t}
            </button>
          ))}
        </span>
      </div>
      <div className="text-xs text-faint">Q given instead of q? q = Q/(B·L){fin(o.B, o.L) && o.B * o.L > 0 ? ` — e.g. 4800/(${f2(o.B)} × ${f2(o.L)}) = ${f2(4800 / (o.B * o.L))} kPa` : ''}. P may be outside the rectangle (negative or beyond B, L).</div>
      {ok && (
        <div className="grid cq-lg:grid-cols-[1fr_20rem] gap-4">
          <div className="space-y-2 min-w-0">
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
                    const Ig = Irect(g.b / o.z, g.l / o.z)
                    return (
                      <tr key={i}>
                        <td className="txt whitespace-nowrap">
                          {g.sign > 0 ? '+' : '−'}
                          {g.k > 1 ? ` ${g.k} ×` : ''}
                        </td>
                        <td>
                          {f2(g.b)} × {f2(g.l)}
                        </td>
                        <td>{f3(g.b / o.z)}</td>
                        <td>{f3(g.l / o.z)}</td>
                        <td>{f3(o.z / g.b)}</td>
                        <td>{f3(g.l / g.b)}</td>
                        <td>
                          {f4(Ig)}
                          {piBranch(g.b / o.z, g.l / o.z) ? ' (+π)' : ''}
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
            <Big label="σz = qΣI" value={s} unit="kPa" />
            {centre && <KV k="2:1 average, Q/((B+z)(L+z))" v={f3(twoToOneRect(o.q * o.B * o.L, o.B, o.L, o.z))} unit="kPa" />}
            <Work>{R`Every rectangle has a corner at P (+ loaded, − fictitious). Fadum reads $I(m, n)$ with $m = b/z$, $n = l/z$; Steinbrenner reads the same $I$ against $z/b$ on the $l/b$ curve (b = shorter side). ${gs.map((g) => R`${g.sign > 0 ? '+' : '−'}${g.k > 1 ? `${g.k}×` : ''}I(${f3(g.b / o.z)}, ${f3(g.l / o.z)}) = ${f4(Irect(g.b / o.z, g.l / o.z))}`).join('; ')}. ΣI = ${f4(I)} → σz = ${f2(o.q)} × ${f4(I)} = **${f3(s)} kPa**.`}</Work>
          </div>
          <div className="space-y-2">
            <Card title="Fadum: I from m, n" chart="d-fadum" inputs={<><NumIn label="m" value={lk.m} onChange={(v) => setLk({ ...lk, m: v })} step={0.1} w="w-14" /><NumIn label="n" value={lk.n} onChange={(v) => setLk({ ...lk, n: v })} step={0.1} w="w-14" /></>}>
              <KV k="I(m, n)" v={fin(Ilk) ? f4(Ilk) : '—'} />
              {piBranch(lk.m, lk.n) && <div className="text-xs text-bad">m²n² &gt; m² + n² + 1: add π to the tan⁻¹ (the calculator trap).</div>}
            </Card>
            <Card title="Steinbrenner: I from z/b, l/b" chart="d-steinbrenner" inputs={<><NumIn label="z/b" value={lk.zb} onChange={(v) => setLk({ ...lk, zb: v })} step={0.1} w="w-14" /><NumIn label="l/b" value={lk.lb} onChange={(v) => setLk({ ...lk, lb: v })} step={0.5} w="w-14" /></>}>
              <KV k="I (corner)" v={lk.zb > 0 && lk.lb > 0 ? f4(Ist) : '—'} />
              <div className="text-xs text-faint">= Fadum with m = 1/(z/b) = {lk.zb > 0 ? f3(1 / lk.zb) : '—'}, n = (l/b)/(z/b) = {lk.zb > 0 ? f3(lk.lb / lk.zb) : '—'}.</div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Newmark

function NewmarkCalc() {
  const [o, setO] = useState({ N: 66, q: 150, rings: 10, sectors: 20, target: 50 })
  const [c, setC] = useState({ z: 5, AB: 3 })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const IV = o.rings > 0 && o.sectors > 0 ? 1 / (o.rings * o.sectors) : NaN
  const s = IV * o.N * o.q
  const radii = c.z > 0 ? newmarkRadii(c.z, 10) : []
  return (
    <div className="grid cq-lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <Card title="σz from a mesh count" chart="d-newmark" inputs={<><NumIn label="N (meshes)" value={o.N} onChange={set('N')} step={1} w="w-16" /><NumIn label="q" value={o.q} onChange={set('q')} step={10} unit="kPa" w="w-16" /></>}>
          <div className="flex flex-wrap items-center gap-2">
            <NumIn label="rings" value={o.rings} onChange={set('rings')} step={1} w="w-12" />
            <NumIn label="sectors" value={o.sectors} onChange={set('sectors')} step={1} w="w-12" />
            <span className="text-xs text-mute">
              IV = 1/(rings × sectors) = <b className="num">{fin(IV) ? fmt(IV, 5) : '—'}</b>
            </span>
          </div>
          <Big label="σz = IV · N · q" value={s} unit="kPa" />
          <Work>{R`σz = ${fin(IV) ? fmt(IV, 5) : '—'} × ${f2(o.N)} × ${f2(o.q)} = **${f3(s)} kPa** (ΣI = IV·N = ${fin(IV) ? f4(IV * o.N) : '—'}). Count part-meshes as fractions; the whole chart (all meshes) = rings × sectors = 1.0q.`}</Work>
        </Card>
        <Card title="Meshes needed for a target σz">
          <div className="flex flex-wrap items-center gap-2">
            <NumIn label="target σz" value={o.target} onChange={set('target')} step={5} unit="kPa" w="w-16" />
            <span className="text-xs text-mute">with q = {f2(o.q)} kPa, IV = {fin(IV) ? fmt(IV, 5) : '—'}</span>
          </div>
          <KV k="N = σz/(IV·q)" v={fin(IV) && o.q ? fmt(o.target / (IV * o.q), 1) : '—'} />
        </Card>
        <Card title="Influence value from the ratio">
          <div className="text-sm text-mute">
            A chart with circles at σz/q = 0.1, 0.2 … 0.9, 1.0 has 10 rings; 20 rays make 200 meshes → IV = 0.1/20 = 0.005. Each ring is worth 0.1q whatever its size.
          </div>
        </Card>
      </div>
      <Card title="Chart construction: the circle radii" chart="d-newmark" inputs={<><NumIn label="z (= AB)" value={c.z} onChange={(v) => setC({ ...c, z: v })} step={0.5} unit="m" w="w-14" /><NumIn label="AB drawn as" value={c.AB} onChange={(v) => setC({ ...c, AB: v })} step={0.5} unit="cm" w="w-14" /></>}>
        {c.z > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="tbl text-xs num">
                <thead>
                  <tr>
                    <th>σz/q</th>
                    <th>R/z</th>
                    <th>R (m) at z = {f2(c.z)}</th>
                    {c.AB > 0 && <th>R on paper (cm)</th>}
                  </tr>
                </thead>
                <tbody>
                  {radii.map((r) => (
                    <tr key={r.s}>
                      <td>{fmt(r.s, 1)}</td>
                      <td>{f3(r.rz)}</td>
                      <td>{f3(r.R)}</td>
                      {c.AB > 0 && <td>{f2(r.rz * c.AB)}</td>}
                    </tr>
                  ))}
                  <tr>
                    <td>1.0</td>
                    <td>∞</td>
                    <td>∞</td>
                    {c.AB > 0 && <td>∞</td>}
                  </tr>
                </tbody>
              </table>
            </div>
            <Work>{R`From $\sigma_z = q\{1 - [1+(R/z)^2]^{-3/2}\}$: $R/z = \sqrt{(1-\sigma_z/q)^{-2/3} - 1}$. Draw the plan at the scale AB = z, i.e. ${c.AB > 0 ? `${f2(c.AB)} cm on paper = ${f2(c.z)} m → 1 : ${fmt((c.z * 100) / c.AB, 0)}` : 'AB on paper = z'}; a new plan is needed for every depth.`}</Work>
          </>
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------- strips, Osterberg, circle, 2:1

function OtherCalc() {
  const [st, setSt] = useState({ q: 100, B: 3, x: 0, z: 3 })
  const [tr, setTr] = useState({ q: 100, B: 4, x: 4, z: 2 })
  const [os, setOs] = useState({ a: 10, b: 4, z: 3, q: 95 })
  const [ci, setCi] = useState({ q: 200, R: 4, z: 4 })
  const [tw, setTw] = useState({ Q: 1200, B: 2, L: 3, z: 4, shape: 'rect' as 'rect' | 'strip' | 'circle' })
  const sa = stripAngles(st.B, st.x, st.z)
  const ss = stripAt(st.q, st.B, st.x, st.z)
  const td = triStripDas(tr.q, tr.B, tr.x, tr.z)
  const oa = osterbergAngles(os.a, os.b, os.z)
  const oI = osterberg(os.a, os.b, os.z)
  const cs = circleCentre(ci.q, ci.R, ci.z)
  const tws = tw.shape === 'rect' ? twoToOneRect(tw.Q, tw.B, tw.L, tw.z) : tw.shape === 'strip' ? twoToOneStrip(tw.Q, tw.B, tw.z) : twoToOneCircle(tw.Q, tw.B, tw.z)
  const ok = (...v: number[]) => fin(...v)
  return (
    <div className="grid cq-lg:grid-cols-2 gap-4">
      <Card title="Uniform strip (infinitely long)" chart="d-strip" inputs={<><NumIn label="q" value={st.q} onChange={(v) => setSt({ ...st, q: v })} step={10} unit="kPa" w="w-16" /><NumIn label="B" value={st.B} onChange={(v) => setSt({ ...st, B: v })} unit="m" step={0.5} w="w-14" /><NumIn label="x from centre" value={st.x} onChange={(v) => setSt({ ...st, x: v })} unit="m" step={0.5} w="w-14" /><NumIn label="z" value={st.z} onChange={(v) => setSt({ ...st, z: v })} unit="m" step={0.5} w="w-14" /></>}>
        {ok(ss) && st.z > 0 && st.B > 0 && (
          <>
            <Big label="σz" value={ss} unit="kPa" />
            <Work>{R`$\alpha = ${f4(sa.alpha)}$ rad (${f2((sa.alpha * 180) / Math.PI)}°), $\delta = ${f4(sa.delta)}$ rad: $\sigma_z = \frac q\pi[\alpha + \sin\alpha\cos(\alpha+2\delta)] = ${f4(ss / st.q)}q$ = **${f3(ss)} kPa**.`}</Work>
          </>
        )}
      </Card>
      <Card title="Triangular strip, 0 → q" chart="d-strip" inputs={<><NumIn label="q (max)" value={tr.q} onChange={(v) => setTr({ ...tr, q: v })} step={10} unit="kPa" w="w-16" /><NumIn label="B" value={tr.B} onChange={(v) => setTr({ ...tr, B: v })} unit="m" step={0.5} w="w-14" /><NumIn label="x from the zero edge" value={tr.x} onChange={(v) => setTr({ ...tr, x: v })} unit="m" step={0.5} w="w-14" /><NumIn label="z" value={tr.z} onChange={(v) => setTr({ ...tr, z: v })} unit="m" step={0.5} w="w-14" /></>}>
        {ok(td.sigma) && tr.z > 0 && tr.B > 0 && (
          <>
            <Big label="σz" value={td.sigma} unit="kPa" />
            <Work>{R`$\alpha = ${f4(td.alpha)}$ rad, $\delta = \tan^{-1}\frac{x-B}{z} = ${f4(td.delta)}$ rad: $\sigma_z = \frac q\pi\left[\frac xB\alpha - \tfrac12\sin2\delta\right] = ${f4(td.I)}q$ = **${f3(td.sigma)} kPa**.`}</Work>
          </>
        )}
      </Card>
      <Card title="Osterberg: one embankment block" chart="d-osterberg" inputs={<><NumIn label="a (slope, horiz.)" value={os.a} onChange={(v) => setOs({ ...os, a: v })} unit="m" step={0.5} w="w-14" /><NumIn label="b (flat part)" value={os.b} onChange={(v) => setOs({ ...os, b: v })} unit="m" step={0.5} w="w-14" /><NumIn label="z" value={os.z} onChange={(v) => setOs({ ...os, z: v })} unit="m" step={0.5} w="w-14" /><NumIn label="q = γH" value={os.q} onChange={(v) => setOs({ ...os, q: v })} unit="kPa" step={5} w="w-16" /></>}>
        {ok(oI) && os.z > 0 && os.a >= 0 && os.b >= 0 && (
          <>
            <div className="grid grid-cols-2 gap-x-4">
              <KV k="a/z" v={f3(os.a / os.z)} />
              <KV k="b/z" v={f3(os.b / os.z)} />
              <KV k="Iz (one block)" v={f4(oI)} />
              <KV k="σz (one block)" v={f3(oI * os.q)} unit="kPa" />
            </div>
            <Work>{R`$\alpha_1+\alpha_2 = \tan^{-1}\frac{a+b}{z} = ${f4(oa.a12)}$, $\alpha_2 = \tan^{-1}\frac bz = ${f4(oa.a2)}$ rad: $I_z = \frac1\pi\left[\frac{a+b}{a}(\alpha_1+\alpha_2) - \frac ba\alpha_2\right] = ${f4(oI)}$. Add the block on the other side of the point (symmetric: ×2). Use the Embankment lab above for a whole section.`}</Work>
          </>
        )}
      </Card>
      <Card title="Circle, below the centre" chart="d-circle" inputs={<><NumIn label="q" value={ci.q} onChange={(v) => setCi({ ...ci, q: v })} step={10} unit="kPa" w="w-16" /><NumIn label="R" value={ci.R} onChange={(v) => setCi({ ...ci, R: v })} unit="m" step={0.5} w="w-14" /><NumIn label="z" value={ci.z} onChange={(v) => setCi({ ...ci, z: v })} unit="m" step={0.5} w="w-14" /></>}>
        {ok(cs) && ci.z > 0 && ci.R > 0 && (
          <>
            <Big label="σz" value={cs} unit="kPa" />
            <Work>{R`$\sigma_z = q\{1-[1+(R/z)^2]^{-3/2}\}$, R/z = ${f3(ci.R / ci.z)} → ${f4(cs / ci.q)}q = **${f3(cs)} kPa**. Off the centre: Newmark.`}</Work>
          </>
        )}
      </Card>
      <Card
        title="2:1 method (average σz)"
        chart="d-21"
        inputs={
          <>
            <Seg size="xs" value={tw.shape} onChange={(v) => setTw({ ...tw, shape: v })} items={[{ v: 'rect', label: 'rectangle' }, { v: 'strip', label: 'strip' }, { v: 'circle', label: 'circle' }]} />
            <NumIn label={tw.shape === 'strip' ? 'Q (kN/m)' : 'Q (kN)'} value={tw.Q} onChange={(v) => setTw({ ...tw, Q: v })} step={50} w="w-16" />
            <NumIn label={tw.shape === 'circle' ? 'D' : 'B'} value={tw.B} onChange={(v) => setTw({ ...tw, B: v })} unit="m" step={0.5} w="w-14" />
            {tw.shape === 'rect' && <NumIn label="L" value={tw.L} onChange={(v) => setTw({ ...tw, L: v })} unit="m" step={0.5} w="w-14" />}
            <NumIn label="z" value={tw.z} onChange={(v) => setTw({ ...tw, z: v })} unit="m" step={0.5} w="w-14" />
          </>
        }
      >
        {ok(tws) && tw.z >= 0 && (
          <>
            <Big label="σz,avg" value={tws} unit="kPa" />
            <Work>{tw.shape === 'rect' ? R`$\frac{Q}{(B+z)(L+z)} = \frac{${f2(tw.Q)}}{(${f2(tw.B + tw.z)})(${f2(tw.L + tw.z)})}$ = **${f3(tws)} kPa**.` : tw.shape === 'strip' ? R`$\frac{Q}{B+z} = \frac{${f2(tw.Q)}}{${f2(tw.B + tw.z)}}$ = **${f3(tws)} kPa**.` : R`$\frac{Q}{\pi(D+z)^2/4} = \frac{${f2(tw.Q)}}{\pi(${f2(tw.B + tw.z)})^2/4}$ = **${f3(tws)} kPa**.`}</Work>
          </>
        )}
      </Card>
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
      {t === 'point' ? <PointCalc /> : t === 'line' ? <LineCalc /> : t === 'rect' ? <RectCalc /> : t === 'newmark' ? <NewmarkCalc /> : <OtherCalc />}
    </div>
  )
}
