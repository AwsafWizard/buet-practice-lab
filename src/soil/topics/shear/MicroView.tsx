// Inside the soil: a few grains, magnified, driven by the same readings as the test bench.
//   packing   dense soil starts interlocked (each grain in the hollow of the row below), loose soil starts stacked
//             with large voids. Drained shear takes both to the same in-between packing (the critical void ratio):
//             the dense one by opening up, the loose one by closing. Undrained shear keeps the row spacing fixed.
//   lines     contact forces between grains: thickness follows the effective stress (σ′1 on the inclined / vertical
//             contacts, σ′3 on the lateral ones)
//   water     background tint follows the pore pressure (blue = pushed, teal = suction); drops show flow
//   bars      who carries the confining stress: grains (σ′) or water (u)
import { useId, type ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { rise } from '../../engine/testsim'

export const R = 13 // lattice radius
export const RV = R * 0.88 // drawn radius (a little slack, so near-contacts do not overlap)
const A_END = 0.5 * R // row offset at the critical state
const H_END = Math.sqrt(4 * R * R - A_END * A_END)
const WIN_W = 268
const WIN_H = 190
const C_WATER = 'var(--c-water)'
const C_SUCTION = 'var(--c-shear)'

export interface MicroProps {
  dilative: boolean
  clay: boolean
  stage: 0 | 1 | 2
  /** progress of the shear stage, 0…1 */
  u01: number
  /** how far consolidation has gone, 0…1 (1 for a specimen that arrives already consolidated) */
  cons: number
  /** shearing with no drainage: the packing cannot change volume */
  undrained: boolean
  /** drained shear: fraction of the final volume change reached so far (dips below 0 at first for dense soil) */
  w: number
  /** effective stress on the vertical / inclined contacts and on the lateral contacts */
  sigV: number
  sigH: number
  /** stress that draws a full-thickness contact line */
  ref: number
  /** pore pressure, or null when the apparatus cannot measure it */
  u: number | null
  /** when u is not measured: its direction, −1…1 */
  uTrend?: number
  total: number
  totalName: string
  barMax: number
  /** water crossing the boundary: −1 leaving, +1 entering, 0 none */
  flow: -1 | 0 | 1
  /** can water cross at all right now */
  open: boolean
  /** timeline, for the moving drops */
  t: number
}

/** row offset a, row spacing h and slip of the upper half, in lattice units */
export function packing(p: Pick<MicroProps, 'dilative' | 'stage' | 'u01' | 'undrained' | 'w'>) {
  const a0 = p.dilative ? R : 0
  const h0 = Math.sqrt(4 * R * R - a0 * a0)
  if (p.stage !== 2) return { a: a0, h: h0, slip: 0 }
  if (p.undrained) return { a: p.dilative ? R - 0.4 * R * rise(p.u01, 3) : 0.45 * R * rise(p.u01, 3), h: h0, slip: 0 }
  const h = h0 + (H_END - h0) * Math.max(-0.12, Math.min(1, p.w))
  const a = Math.min(R, Math.sqrt(Math.max(0, 4 * R * R - h * h)))
  // once the packing is loose enough the two halves can slide past each other with no more volume change
  const slip = p.dilative ? 2.5 * R * Math.max(0, (p.u01 - 0.3) / 0.7) : 1.5 * R * Math.max(0, (p.u01 - 0.45) / 0.55)
  return { a, h, slip }
}

const ROWS = 6
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export function MicroView(p: MicroProps) {
  const clip = useId()
  const { a, h, slip } = packing(p)
  const c = 1 + 0.045 * (1 - p.cons) // before consolidation the grains sit slightly apart
  const dir = p.dilative ? -1 : 1
  const cy = WIN_H / 2
  const rows: { x: number; y: number }[][] = []
  for (let i = 0; i < ROWS; i++) {
    const row: { x: number; y: number }[] = []
    const y = cy + (2.5 - i) * h * c
    for (let j = -6; j <= 17; j++) {
      const x = 8 + (j * 2 * R + dir * i * a + (i >= ROWS / 2 ? slip : 0)) * c
      if (x > -R && x < WIN_W + R) row.push({ x, y })
    }
    rows.push(row)
  }
  const lw = (s: number) => 0.6 + 4.4 * clamp(s / p.ref, 0, 1.2)
  const lo = (s: number) => 0.35 + 0.6 * clamp(s / p.ref, 0, 1)
  // a contact force is drawn as a short strut across the contact point
  const strut = (key: string, g: { x: number; y: number }, q: { x: number; y: number }, sg: number) => <line key={key} x1={g.x + 0.3 * (q.x - g.x)} y1={g.y + 0.3 * (q.y - g.y)} x2={g.x + 0.7 * (q.x - g.x)} y2={g.y + 0.7 * (q.y - g.y)} strokeWidth={lw(sg)} opacity={lo(sg)} />
  const touch = 2.1 * R
  const contacts: ReactNode[] = []
  rows.forEach((row, i) => {
    row.forEach((g, j) => {
      const nx = row[j + 1]
      if (nx && nx.x - g.x <= touch) contacts.push(strut(`h${i}-${j}`, g, nx, p.sigH))
      const up = rows[i + 1]
      if (up) up.forEach((q, k) => Math.hypot(q.x - g.x, q.y - g.y) <= touch && contacts.push(strut(`v${i}-${j}-${k}`, g, q, p.sigV)))
    })
  })
  const uSign = p.u !== null ? p.u / p.barMax : (p.uTrend ?? 0) * 0.6
  const tint = uSign >= 0 ? C_WATER : C_SUCTION
  const planeY = cy + (2.5 - (ROWS / 2 - 0.5)) * h * c
  const waterTag = p.u !== null ? (Math.abs(p.u) < 0.5 ? 'pore water: u = 0' : p.u > 0 ? `pore water pushed: u = +${fmt(p.u, 0)} kPa` : `pore water stretched: u = ${fmt(p.u, 0)} kPa (suction)`) : uSign > 0.03 ? 'pore water pushed: u rises (not measured)' : uSign < -0.03 ? 'pore water stretched: u falls (not measured)' : 'pore water'
  const flowTag = !p.open ? 'sealed: no water in or out' : p.flow < 0 ? 'water squeezed out →' : p.flow > 0 ? '← water drawn in' : 'free to drain, no flow now'
  // bars: grains vs water
  const BX = 284
  const base = 128
  const k = 96 / p.barMax
  const bar = (x: number, v: number, col: string, name: string) => (
    <g>
      <rect x={x} y={v >= 0 ? base - v * k : base} width={30} height={Math.abs(v) * k} fill={col} opacity={0.85} rx={2} />
      <text x={x + 15} y={Math.abs(v) * k > 18 ? (v >= 0 ? base - v * k + 12 : base + Math.abs(v) * k - 5) : v >= 0 ? base - v * k - 4 : base + Math.abs(v) * k + 10} fontSize={11} fontWeight={700} textAnchor="middle" fill={Math.abs(v) * k > 18 ? 'var(--c-bg)' : col}>
        {fmt(v, 0)}
      </text>
      <text x={x + 15} y={185} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)">
        {name}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 400 192" className="w-full" role="img" aria-label="Soil grains, magnified">
      <clipPath id={clip}>
        <rect x={1} y={1} width={WIN_W - 2} height={WIN_H - 2} rx={10} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x={0} y={0} width={WIN_W} height={WIN_H} fill="var(--c-panel)" />
        <rect x={0} y={0} width={WIN_W} height={WIN_H} fill={tint} opacity={0.12 + 0.5 * clamp(Math.abs(uSign), 0, 1)} />
        {rows.flat().map((g, i) => (
          <circle key={i} cx={g.x} cy={g.y} r={RV * (p.clay ? 0.97 : 1)} fill="var(--c-soil)" stroke="var(--c-ink)" strokeWidth={0.7} />
        ))}
        <g stroke="var(--c-ink)" strokeLinecap="round">
          {contacts}
        </g>
        {slip > 0.5 && <line x1={0} x2={WIN_W} y1={planeY} y2={planeY} stroke="var(--c-bad)" strokeWidth={1} strokeDasharray="5 4" opacity={0.8} />}
        {p.flow !== 0 &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const ph = (p.t * 60 + i / 6) % 1
            const q = p.flow < 0 ? ph : 1 - ph
            return <circle key={i} cx={WIN_W - 70 + q * 78} cy={22 + (i % 3) * 68 + (i > 2 ? 30 : 0)} r={3} fill={C_WATER} stroke="var(--c-panel)" strokeWidth={0.8} opacity={0.3 + 0.7 * Math.sin(Math.PI * q)} />
          })}
        <rect x={5} y={5} width={waterTag.length * 5.3 + 10} height={16} rx={4} fill="var(--c-panel)" opacity={0.86} />
        <text x={10} y={16} fontSize={10} fontWeight={700} fill={tint}>
          {waterTag}
        </text>
        <rect x={5} y={WIN_H - 20} width={flowTag.length * 5.3 + 10} height={16} rx={4} fill="var(--c-panel)" opacity={0.86} />
        <text x={10} y={WIN_H - 9} fontSize={10} fontWeight={700} fill={!p.open ? 'var(--c-bad)' : p.flow !== 0 ? C_WATER : 'var(--c-good)'}>
          {flowTag}
        </text>
      </g>
      <rect x={1} y={1} width={WIN_W - 2} height={WIN_H - 2} rx={10} fill="none" stroke={p.open ? 'var(--c-line)' : 'var(--c-bad)'} strokeWidth={p.open ? 1.2 : 1.8} strokeDasharray={p.open ? '6 4' : undefined} />
      {/* who carries the stress */}
      <text x={BX + 56} y={11} fontSize={10.5} fontWeight={700} textAnchor="middle" fill="var(--c-ink)">
        who carries {p.totalName} = {fmt(p.total, 0)}?
      </text>
      <line x1={BX} x2={BX + 112} y1={base} y2={base} stroke="var(--c-ink)" />
      {p.u !== null ? (
        <>
          {bar(BX + 14, p.total - p.u, 'var(--c-accent2)', 'grains σ′')}
          {bar(BX + 68, p.u, p.u >= 0 ? C_WATER : C_SUCTION, 'water u')}
          <line x1={BX} x2={BX + 112} y1={base - p.total * k} y2={base - p.total * k} stroke="var(--c-ink)" strokeDasharray="3 3" strokeWidth={0.9} />
        </>
      ) : (
        <>
          <text x={BX + 56} y={60} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
            the shear box has
          </text>
          <text x={BX + 56} y={72} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
            no pore-pressure gauge:
          </text>
          <text x={BX + 56} y={84} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
            the split is unknown
          </text>
          <text x={BX + 56} y={110} fontSize={22} fontWeight={700} textAnchor="middle" fill="var(--c-faint)">
            ?
          </text>
        </>
      )}
    </svg>
  )
}
