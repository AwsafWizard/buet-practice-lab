// Practice problems on lecture topics never asked in the 13 past papers: Westergaard vs Boussinesq for a point load, and
// the triangular strip load (Das angles formula).
import { fmt } from '../../../components/DiagramView'
import { Md } from '../../../components/ui'
import { boussinesq, KB, KW, triStripDas, westergaard } from '../../engine/stressdist'
import type { SmQ } from '../../types'
import { DepthChart } from './figs'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)

// ---------------------------------------------------------------- Westergaard vs Boussinesq
const Q = 800
const PTS: { n: string; r: number; z: number }[] = [
  { n: 'A', r: 0, z: 2 },
  { n: 'B', r: 2, z: 2 },
  { n: 'C', r: 0, z: 4 },
  { n: 'D', r: 3, z: 4 },
  { n: 'E', r: 6, z: 3 },
]
/** r/z where KB = KW (bisection on the engine factors) */
function crossover() {
  let a = 0.1
  let b = 3
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2
    if (KB(m) > KW(m)) a = m
    else b = m
  }
  return (a + b) / 2
}

// ---------------------------------------------------------------- triangular strip
const TS = { q: 90, B: 6 }
const TP: { n: string; x: number; z: number }[] = [
  { n: '1', x: 0, z: 3 },
  { n: '2', x: 3, z: 3 },
  { n: '3', x: 6, z: 3 },
  { n: '4', x: 8, z: 3 },
  { n: '5', x: 6, z: 6 },
]

function TriFig({ w = 420 }: { w?: number }) {
  const W = 420
  const H = 220
  const s = 26
  const ox = 90
  const gy = 70
  const X = (x: number) => ox + x * s
  const Y = (z: number) => gy + z * s
  const qh = 42
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: w, maxWidth: '100%' }} role="img" aria-label="triangular strip load">
      <rect x={10} y={gy} width={W - 20} height={H - gy - 6} fill="var(--c-soil)" opacity={0.3} />
      <line x1={10} y1={gy} x2={W - 10} y2={gy} stroke="var(--c-ink)" strokeWidth={1.5} />
      <polygon points={`${X(0)},${gy} ${X(TS.B)},${gy} ${X(TS.B)},${gy - qh}`} fill="var(--c-load)" opacity={0.3} stroke="var(--c-load)" />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={X(i)} y1={gy - (qh * i) / TS.B + 2} x2={X(i)} y2={gy - 2} stroke="var(--c-load)" strokeWidth={1} />
      ))}
      <text x={X(TS.B) + 4} y={gy - qh + 4} fontSize={10} fill="var(--c-load)">
        q = {TS.q} kPa
      </text>
      <text x={X(0) - 4} y={gy - 4} fontSize={10} textAnchor="end" fill="var(--c-load)">
        0
      </text>
      <line x1={X(0)} y1={gy - qh - 12} x2={X(TS.B)} y2={gy - qh - 12} stroke="var(--c-mute)" />
      <text x={X(TS.B / 2)} y={gy - qh - 16} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        B = {TS.B} m (infinitely long)
      </text>
      {TP.map((p) => (
        <g key={p.n}>
          <line x1={X(p.x)} y1={gy} x2={X(p.x)} y2={Y(p.z)} stroke="var(--c-line)" strokeDasharray="3 3" />
          <circle cx={X(p.x)} cy={Y(p.z)} r={3.5} fill="var(--c-accent)" />
          <text x={X(p.x) + 6} y={Y(p.z) + 4} fontSize={10} fill="var(--c-ink)">
            {p.n} ({p.x}, {p.z})
          </text>
        </g>
      ))}
      <text x={14} y={H - 10} fontSize={9.5} fill="var(--c-mute)">
        (x from the zero edge, z depth) in m
      </text>
    </svg>
  )
}

export const STRESS_NEW: SmQ[] = [
  {
    id: 'sm-own-stress-new1',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: 'N1',
    marks: 0,
    topics: ['sm-stress'],
    title: 'Point load: Westergaard vs Boussinesq at several points · not asked yet',
    text: `*${NOT_ASKED}*

A column load of ${Q} kN acts at the ground surface. Find the vertical stress increase by both Boussinesq's and Westergaard's (μ = 0) solutions at ${PTS.map((p) => `${p.n} (r = ${p.r} m, z = ${p.z} m)`).join(', ')}.

Tabulate the two answers and comment: why is Westergaard's value lower below the load, and where does the order reverse? For which soil is Westergaard's solution meant?`,
    pages: [],
    checks: () => [
      { key: 'ba', label: 'Boussinesq at A', value: boussinesq(Q, 0, 2), unit: 'kPa' },
      { key: 'wa', label: 'Westergaard at A', value: westergaard(Q, 0, 2), unit: 'kPa' },
      { key: 'bd', label: 'Boussinesq at D', value: boussinesq(Q, 3, 4), unit: 'kPa' },
      { key: 'wd', label: 'Westergaard at D', value: westergaard(Q, 3, 4), unit: 'kPa' },
      { key: 'we', label: 'Westergaard at E', value: westergaard(Q, 6, 3), unit: 'kPa' },
      { key: 'x', label: 'r/z where the two are equal', value: crossover() },
    ],
    solution: () => {
      const rx = crossover()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`
$$\\sigma_z = K\\frac{Q}{z^2},\\qquad K_B = \\frac{3/2\\pi}{[1 + (r/z)^2]^{5/2}},\\qquad K_W = \\frac{1/\\pi}{[1 + 2(r/z)^2]^{3/2}}$$
`}</Md>
          <div className="overflow-x-auto">
            <table className="tbl w-auto">
              <thead>
                <tr>
                  <th>Point</th>
                  <th>r/z</th>
                  <th>K_B</th>
                  <th>σz Boussinesq (kPa)</th>
                  <th>K_W</th>
                  <th>σz Westergaard (kPa)</th>
                  <th>W/B</th>
                </tr>
              </thead>
              <tbody>
                {PTS.map((p) => (
                  <tr key={p.n}>
                    <td>{p.n}</td>
                    <td>{f3(p.r / p.z)}</td>
                    <td>{f4(KB(p.r / p.z))}</td>
                    <td>{f2(boussinesq(Q, p.r, p.z))}</td>
                    <td>{f4(KW(p.r / p.z))}</td>
                    <td>{f2(westergaard(Q, p.r, p.z))}</td>
                    <td>{f3(westergaard(Q, p.r, p.z) / boussinesq(Q, p.r, p.z))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DepthChart
            zMax={6}
            curves={[
              { f: (z) => boussinesq(Q, 0, z), label: 'Boussinesq, r = 0' },
              { f: (z) => westergaard(Q, 0, z), label: 'Westergaard, r = 0', dash: true },
              { f: (z) => boussinesq(Q, 3, z), label: 'Boussinesq, r = 3 m', c: 'var(--c-load)' },
              { f: (z) => westergaard(Q, 3, z), label: 'Westergaard, r = 3 m', c: 'var(--c-load)', dash: true },
            ]}
          />
          <Md>{`**Comment.**
- On the load axis $K_W/K_B = (1/\\pi)/(3/2\\pi) = 2/3$: Westergaard gives **${f2((2 / 3) * 100)} %** of Boussinesq (A and C).
- Westergaard models a layered deposit (e.g. clay with closely spaced thin sand / silt seams) as an elastic soil reinforced by **rigid horizontal sheets** that prevent lateral strain (μ = 0). The sheets carry part of the load sideways, so the stress is **spread out** — less concentrated under the load and relatively more at a distance.
- The two factors are equal at $r/z = ${f3(rx)}$; beyond that (point E, r/z = ${f2(6 / 3)}) Westergaard is the larger, although both stresses are small there.
- Use Boussinesq for homogeneous, isotropic soil (sands, uniform clays) — it is also the conservative value under the load; Westergaard for stratified / varved clays with stiff thin layers.`}</Md>
        </div>
      )
    },
    notes: [NOT_ASKED, 'SJMY sir, Lecture 25 (Westergaard, with the KB–KW comparison plot: KW ≈ ⅔KB for r/z below 0.8, equal near r/z = 1.5) and Lecture 21 (Boussinesq).'],
  },
  {
    id: 'sm-own-stress-new2',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: 'N2',
    marks: 0,
    topics: ['sm-stress'],
    title: 'Triangular strip load at five points · not asked yet',
    text: `*${NOT_ASKED}*

A long stockpile edge applies a strip load that increases linearly from zero to ${TS.q} kPa over a width of ${TS.B} m (zero at the left edge, ${TS.q} kPa at the right edge, nothing beyond). Using $\\sigma_z = \\dfrac{q}{\\pi}\\left[\\dfrac{x}{B}\\alpha - \\dfrac12\\sin 2\\delta\\right]$, find σz at points 1–5 shown (x measured from the zero edge, z below the surface). Where under the load is the stress greatest at z = 3 m?`,
    pages: [],
    figure: () => <TriFig />,
    checks: () => TP.map((p) => ({ key: 's' + p.n, label: `σz at ${p.n}`, value: triStripDas(TS.q, TS.B, p.x, p.z).sigma, unit: 'kPa' })),
    solution: () => (
      <div className="space-y-2 text-sm">
        <TriFig />
        <Md>{`α = angle subtended at the point by the loaded width $= \\tan^{-1}\\dfrac{x}{z} - \\tan^{-1}\\dfrac{x - B}{z}$; δ = angle from the vertical to the line joining the point to the **high (q) edge** $= \\tan^{-1}\\dfrac{x - B}{z}$ (negative when that edge is to the right of the point). Angles in radians.`}</Md>
        <div className="overflow-x-auto">
          <table className="tbl w-auto">
            <thead>
              <tr>
                <th>Point</th>
                <th>x, z (m)</th>
                <th>α (rad)</th>
                <th>δ (rad)</th>
                <th>(x/B)α − ½ sin 2δ</th>
                <th>σz (kPa)</th>
                <th>σz/q</th>
              </tr>
            </thead>
            <tbody>
              {TP.map((p) => {
                const r = triStripDas(TS.q, TS.B, p.x, p.z)
                return (
                  <tr key={p.n}>
                    <td>{p.n}</td>
                    <td>
                      {p.x}, {p.z}
                    </td>
                    <td>{f4(r.alpha)}</td>
                    <td>{f4(r.delta)}</td>
                    <td>{f4(r.I * Math.PI)}</td>
                    <td>{f2(r.sigma)}</td>
                    <td>{f3(r.I)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <DepthChart
          zMax={10}
          curves={[
            { f: (z) => triStripDas(TS.q, TS.B, 0, z).sigma, label: 'below the zero edge (x = 0)', c: 'var(--c-mute)' },
            { f: (z) => triStripDas(TS.q, TS.B, 4, z).sigma, label: 'x = 4 m' },
            { f: (z) => triStripDas(TS.q, TS.B, 6, z).sigma, label: 'below the peak (x = B)', c: 'var(--c-load)' },
          ]}
        />
        <Md>{`**Comment.** At z = 3 m the stress is largest inside the load, not under its peak: point 2 (mid-width, ${f2(triStripDas(TS.q, TS.B, 3, 3).sigma)} kPa) exceeds point 3 under the ${TS.q} kPa edge (${f2(triStripDas(TS.q, TS.B, 6, 3).sigma)} kPa), because the peak has no load beyond it. Check at point 5 (z = B under the peak): α = π/4, δ = 0, so σz = q/4 = ${f2(triStripDas(TS.q, TS.B, 6, 6).sigma)} kPa. The values equal the exact integral of the line-load formula over the strip (the lab's strip calculator, triangular option).`}</Md>
      </div>
    ),
    notes: [NOT_ASKED, 'SJMY sir, Lecture 23 (Das eq. for a linearly increasing strip load, used again to split embankments). Chart pane: d-strip.'],
  },
]
