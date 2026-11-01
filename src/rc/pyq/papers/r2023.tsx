// CE 315 — 2023-24 term final (held 9 Sep 2025), PDF pp. 2–10.
// This file also holds the figure kit and the recurring theory model answers that
// r2021 / r2020 / rjan21 reuse (same questions recur almost word for word).
import type { ReactNode } from 'react'
import { Md, Tex } from '../../../components/ui'
import { allowableMoment, f, uncracked, type ElasticInput, type SolStep } from '../../engine/elastic'
import { beamLoads, designAs, designSection, limits, phiSteps, pickBars as sgPickBars, review as sgReview, type LoadInput } from '../../engine/singly'
import { designDoubly, pickBars as dbPickBars, reviewDoubly, type DoublyDesignIn, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, reviewRect, reviewT, type BeffIn } from '../../engine/tbeam'
import { designShear, shearAt, type ShearBeam, type ShearDesign, type ShearSection } from '../../engine/shear'
import { cantSlab, oneWayCoef, type CantSlabInput, type OneWayCoefInput, type OneWayCoefResult } from '../../engine/oneway'
import { twoWay, type TwoWayInput, type TwoWayResult } from '../../engine/twoway'
import { beta1 } from '../../engine/materials'
import type { Check, RcGiven, RcQ } from '../../types'

// ============================================================== figure kit
export const C = {
  ink: 'var(--c-ink)',
  mute: 'var(--c-mute)',
  faint: 'var(--c-faint)',
  load: 'var(--c-load)',
  conc: 'var(--c-conc)',
  steel: 'var(--c-steel)',
  comp: 'var(--c-comp)',
  ten: 'var(--c-tension)',
}

export function Svg({ w, h, children, caption, max }: { w: number; h: number; children: ReactNode; caption?: ReactNode; max?: number }) {
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: max ?? w, display: 'block', margin: '0 auto' }} fontSize={12} fill={C.ink} role="img">
        {children}
      </svg>
      {caption && <figcaption className="text-xs text-mute text-center mt-1">{caption}</figcaption>}
    </figure>
  )
}

/** horizontal dimension line with slash ticks; label above (or below with `below`) */
export function DimH({ x1, x2, y, label, below, color = C.mute }: { x1: number; x2: number; y: number; label: ReactNode; below?: boolean; color?: string }) {
  return (
    <g stroke={color} fill={color}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1 - 4} y1={y + 4} x2={x1 + 4} y2={y - 4} />
      <line x1={x2 - 4} y1={y + 4} x2={x2 + 4} y2={y - 4} />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} strokeWidth={0.7} />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} strokeWidth={0.7} />
      <text x={(x1 + x2) / 2} y={below ? y + 15 : y - 5} textAnchor="middle" stroke="none" fontSize={12}>
        {label}
      </text>
    </g>
  )
}

/** vertical dimension line; label to the right (or left) */
export function DimV({ x, y1, y2, label, left, color = C.mute, ly }: { x: number; y1: number; y2: number; label: ReactNode; left?: boolean; color?: string; ly?: number }) {
  return (
    <g stroke={color} fill={color}>
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <line x1={x - 4} y1={y1 + 4} x2={x + 4} y2={y1 - 4} />
      <line x1={x - 4} y1={y2 + 4} x2={x + 4} y2={y2 - 4} />
      <line x1={x - 6} y1={y1} x2={x + 6} y2={y1} strokeWidth={0.7} />
      <line x1={x - 6} y1={y2} x2={x + 6} y2={y2} strokeWidth={0.7} />
      <text x={left ? x - 6 : x + 6} y={ly ?? (y1 + y2) / 2 + 4} textAnchor={left ? 'end' : 'start'} stroke="none" fontSize={12}>
        {label}
      </text>
    </g>
  )
}

export function ArrowDown({ x, y1, y2, color = C.load, w = 1.6 }: { x: number; y1: number; y2: number; color?: string; w?: number }) {
  return (
    <g stroke={color} fill={color}>
      <line x1={x} y1={y1} x2={x} y2={y2 - 6} strokeWidth={w} />
      <polygon points={`${x - 4},${y2 - 8} ${x + 4},${y2 - 8} ${x},${y2}`} stroke="none" />
    </g>
  )
}

/** arrow from (x1,y1) to (x2,y2) with a head at the end */
export function Arrow({ x1, y1, x2, y2, color = C.load, w = 1.6 }: { x1: number; y1: number; x2: number; y2: number; color?: string; w?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - 8 * Math.cos(a),
    hy = y2 - 8 * Math.sin(a)
  const px = 4 * Math.sin(a),
    py = -4 * Math.cos(a)
  return (
    <g stroke={color} fill={color}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} strokeWidth={w} />
      <polygon points={`${hx + px},${hy + py} ${hx - px},${hy - py} ${x2},${y2}`} stroke="none" />
    </g>
  )
}

/** zig-zag break line between two points */
export function Break({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const mx = (x1 + x2) / 2,
    my = (y1 + y2) / 2
  const dx = x2 - x1,
    dy = y2 - y1
  const L = Math.hypot(dx, dy)
  const nx = (-dy / L) * 6,
    ny = (dx / L) * 6
  return (
    <polyline
      points={`${x1},${y1} ${mx - dx * 0.12},${my - dy * 0.12} ${mx + nx},${my + ny} ${mx - nx},${my - ny} ${mx + dx * 0.12},${my + dy * 0.12} ${x2},${y2}`}
      fill="none"
      stroke={C.ink}
      strokeWidth={1}
    />
  )
}

const DB: Record<number, number> = { 3: 0.375, 4: 0.5, 5: 0.625, 6: 0.75, 7: 0.875, 8: 1, 9: 1.128, 10: 1.27, 11: 1.41 }
const inch = (v: number) => `${v}"`

function GivenBox({ x, y, lines }: { x: number; y: number; lines: string[] }) {
  return (
    <g>
      <text x={x} y={y} fontWeight={700} textDecoration="underline">
        Given:
      </text>
      {lines.map((l, i) => (
        <text key={i} x={x} y={y + 15 * (i + 1)}>
          {l}
        </text>
      ))}
    </g>
  )
}

/** rectangular beam cross-section (singly or doubly), bars drawn to scale */
export function RectSection(p: {
  b: number
  d: number
  dt?: number
  dp?: number
  h?: number
  bar: number
  rows: number[]
  top?: number
  topBar?: number
  botText: string
  topText?: string
  given?: string[]
  showH?: boolean
  caption?: ReactNode
}) {
  const s = 8
  const dt = p.dt ?? p.d
  const H = p.h ?? dt + 2.5
  const x0 = p.showH ? 140 : 110,
    y0 = 26
  const W = p.b * s,
    Hh = H * s
  const rowY = p.rows.length >= 2 ? [dt, 2 * p.d - dt] : [dt]
  const r = (n: number) => Math.max(3.5, (DB[n] * s) / 2)
  const xs = (n: number) => Array.from({ length: n }, (_, i) => x0 + (2.5 + (n === 1 ? (p.b - 5) / 2 : (i * (p.b - 5)) / (n - 1))) * s)
  const xr = x0 + W
  const lab = xr + 96
  const w = lab + 150
  const h = y0 + Hh + 46
  return (
    <Svg w={w} h={h} caption={p.caption} max={w}>
      <rect x={x0} y={y0} width={W} height={Hh} fill={C.conc} stroke={C.ink} strokeWidth={1.5} />
      {/* stirrup */}
      <rect x={x0 + 1.5 * s} y={y0 + 1.5 * s} width={W - 3 * s} height={Hh - 3 * s} rx={6} fill="none" stroke={C.steel} strokeWidth={1} strokeDasharray="1 0" opacity={0.6} />
      {p.rows.map((n, k) => xs(n).map((x, i) => <circle key={`${k}-${i}`} cx={x} cy={y0 + rowY[k] * s} r={r(p.bar)} fill={C.steel} />))}
      {p.rows.length >= 2 && <line x1={x0 - 22} y1={y0 + p.d * s} x2={xr + 66} y2={y0 + p.d * s} stroke={C.mute} strokeDasharray="6 3 1 3" />}
      {p.top && p.dp && xs(p.top).map((x, i) => <circle key={'t' + i} cx={x} cy={y0 + p.dp! * s} r={r(p.topBar ?? p.bar)} fill={C.steel} />)}
      {/* dimensions */}
      {p.dp && <DimV x={xr + 18} y1={y0} y2={y0 + p.dp * s} label={`d' = ${inch(p.dp)}`} ly={y0 - 8} />}
      <DimV x={xr + 60} y1={y0} y2={y0 + p.d * s} label={`d = ${inch(p.d)}`} />
      {p.dt && p.dt !== p.d && <DimV x={x0 - 22} y1={y0} y2={y0 + dt * s} label={<tspan>d<tspan fontSize={9} dy={3}>t</tspan><tspan dy={-3}> = {inch(dt)}</tspan></tspan>} left />}
      {p.showH && <DimV x={x0 - 60} y1={y0} y2={y0 + Hh} label={`h = ${inch(H)}`} left />}
      <DimH x1={x0} x2={xr} y={y0 + Hh + 22} label={`b = ${inch(p.b)}`} below />
      {/* bar labels */}
      {p.top && p.dp && p.topText && (
        <g>
          <line x1={xs(p.top)[p.top - 1] + 4} y1={y0 + p.dp * s} x2={lab - 4} y2={y0 + p.dp * s + 22} stroke={C.mute} strokeWidth={0.8} />
          <text x={lab} y={y0 + p.dp * s + 26}>
            {p.topText}
          </text>
        </g>
      )}
      <line x1={xs(p.rows[0])[p.rows[0] - 1] + 4} y1={y0 + rowY[rowY.length - 1] * s} x2={lab - 4} y2={y0 + rowY[rowY.length - 1] * s - 26} stroke={C.mute} strokeWidth={0.8} />
      <text x={lab} y={y0 + rowY[rowY.length - 1] * s - 24}>
        {p.botText}
      </text>
      {p.given && <GivenBox x={lab} y={y0 + Hh - 15 * p.given.length} lines={p.given} />}
    </Svg>
  )
}

/** continuous T-beam floor: several webs under one slab (section across the beams) */
export function FloorSection(p: {
  webs: number
  hf: number
  bw: number
  d: number
  spacing: string
  span: string
  bars: number
  barText?: string
  top?: boolean
  title: string
  given?: string[]
}) {
  const s = 5
  const h = p.d + 2.5
  const y0 = 34
  const gap = 190
  const x1 = 70
  const bw = p.bw * s
  const webX = Array.from({ length: p.webs }, (_, i) => x1 + i * gap)
  const right = webX[p.webs - 1] + bw + 60
  const yB = y0 + h * s
  const w = right + 150
  const H = yB + 70
  const slabB = y0 + p.hf * s
  const barsAt = (x: number) => {
    const n = p.top ? 3 : p.bars
    const xs = Array.from({ length: n }, (_, i) => x + 2.5 * s + ((bw - 5 * s) * i) / Math.max(1, n - 1))
    if (!p.top) return xs.map((cx, i) => <circle key={i} cx={cx} cy={y0 + p.d * s} r={3} fill={C.steel} />)
    return [2.5, 5].flatMap((dy, k) => xs.map((cx, i) => <circle key={`${k}${i}`} cx={cx} cy={y0 + dy * s} r={2.8} fill={C.steel} />))
  }
  // outline: slab + webs
  let path = `M ${x1 - 50} ${y0} L ${right} ${y0} L ${right} ${slabB}`
  for (let i = p.webs - 1; i >= 0; i--) {
    const x = webX[i]
    path += ` L ${x + bw} ${slabB} L ${x + bw} ${yB} L ${x} ${yB} L ${x} ${slabB}`
  }
  path += ` L ${x1 - 50} ${slabB} Z`
  return (
    <Svg w={w} h={H} caption={p.title} max={w}>
      <path d={path} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      <Break x1={x1 - 50} y1={y0 - 8} x2={x1 - 50} y2={slabB + 8} />
      <Break x1={right} y1={y0 - 8} x2={right} y2={slabB + 8} />
      {webX.map((x) => (
        <g key={x}>{barsAt(x)}</g>
      ))}
      <DimV x={webX[0] + bw + 14} y1={p.top ? yB : y0} y2={p.top ? y0 + 3.75 * s : y0 + p.d * s} label={`d = ${inch(p.d)}`} />
      <DimH x1={webX[0]} x2={webX[0] + bw} y={yB + 14} label={`bw = ${inch(p.bw)}`} below />
      {webX.slice(1).map((x, i) => (
        <DimH key={x} x1={webX[i] + bw / 2} x2={x + bw / 2} y={yB + 44} label={p.spacing} />
      ))}
      <DimV x={right + 16} y1={y0} y2={slabB} label={inch(p.hf)} />
      <rect x={right + 44} y={y0 + 24} width={96} height={24} fill="none" stroke={C.ink} />
      <text x={right + 92} y={y0 + 40} textAnchor="middle">
        {p.span}
      </text>
      {p.barText && (
        <text x={webX[0] + bw / 2} y={p.top ? y0 - 8 : yB + 66} textAnchor="middle" fill={C.mute}>
          {p.barText}
        </text>
      )}
      {p.given && <GivenBox x={right + 44} y={y0 + 76} lines={p.given} />}
    </Svg>
  )
}

/** T-beam section at an interior support: negative moment, bars in the slab, flange broken both sides */
export function TSupport(p: { bw: number; hf: number; d: number; dt: number; bar: number; n: number; barText: string; title: string; given?: string[] }) {
  const s = 7
  const h = p.dt + 2.5
  const x0 = 120
  const y0 = 24
  const bw = p.bw * s
  const fl = 110 // flange overhang drawn each side
  const yB = y0 + h * s
  const slabB = y0 + p.hf * s
  const per = p.n / 2
  const xs = Array.from({ length: per }, (_, i) => x0 + 2.5 * s + ((bw - 5 * s) * i) / Math.max(1, per - 1))
  const rUp = y0 + 2.5 * s // extreme (upper) row
  const rLo = y0 + (h - (2 * p.d - p.dt)) * s
  const yd = y0 + (h - p.d) * s
  const w = x0 + bw + fl + 170
  const H = yB + 44
  const path = `M ${x0 - fl} ${y0} L ${x0 + bw + fl} ${y0} L ${x0 + bw + fl} ${slabB} L ${x0 + bw} ${slabB} L ${x0 + bw} ${yB} L ${x0} ${yB} L ${x0} ${slabB} L ${x0 - fl} ${slabB} Z`
  return (
    <Svg w={w} h={H} caption={p.title} max={w}>
      <path d={path} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      <Break x1={x0 - fl} y1={y0 - 8} x2={x0 - fl} y2={slabB + 8} />
      <Break x1={x0 + bw + fl} y1={y0 - 8} x2={x0 + bw + fl} y2={slabB + 8} />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={rUp} r={Math.max(3.5, (DB[p.bar] * s) / 2)} fill={C.steel} />
          <circle cx={x} cy={rLo} r={Math.max(3.5, (DB[p.bar] * s) / 2)} fill={C.steel} />
        </g>
      ))}
      <line x1={x0 - 30} y1={yd} x2={x0 + bw + 30} y2={yd} stroke={C.mute} strokeDasharray="6 3 1 3" />
      <DimV x={x0 - 18} y1={rUp} y2={yB} label={<tspan>d<tspan fontSize={9} dy={3}>t</tspan><tspan dy={-3}> = {inch(p.dt)}</tspan></tspan>} left />
      <DimV x={x0 + bw + 18} y1={yd} y2={yB} label={`d = ${inch(p.d)}`} />
      <DimH x1={x0} x2={x0 + bw} y={yB + 18} label={`bw = ${inch(p.bw)}`} below />
      <DimV x={x0 + bw + fl + 16} y1={y0} y2={slabB} label={inch(p.hf)} />
      <line x1={xs[per - 1] + 4} y1={rLo + 2} x2={x0 + bw + 40} y2={slabB + 30} stroke={C.mute} strokeWidth={0.8} />
      <text x={x0 + bw + 44} y={slabB + 36}>
        {p.barText}
      </text>
      {p.given && <GivenBox x={x0 + bw + 110} y={slabB + 74} lines={p.given} />}
    </Svg>
  )
}

/** simply supported beam elevation: point loads, UDL, segment dimensions, optional section inset */
export function SSBeam(p: {
  spans: number[]
  loads: { at: number; label: string }[]
  udl: string
  note?: string
  left?: 'pin' | 'roller'
  right?: 'pin' | 'roller'
  section?: { b: number; d: number; n: number; stirrup?: boolean }
  segLabels?: string[]
  caption?: ReactNode
}) {
  const L = p.spans.reduce((a, b) => a + b, 0)
  const x0 = 40,
    Wd = 440
  const sx = (ft: number) => x0 + (ft / L) * Wd
  const yb = 120
  const insetX = x0 + Wd + 50
  const w = insetX + (p.section ? 150 : 0)
  const h = 210
  const support = (x: number, t: 'pin' | 'roller') =>
    t === 'pin' ? (
      <g stroke={C.ink} fill="none" strokeWidth={1.3}>
        <polygon points={`${x},${yb + 6} ${x - 10},${yb + 24} ${x + 10},${yb + 24}`} />
        <line x1={x - 16} y1={yb + 24} x2={x + 16} y2={yb + 24} />
      </g>
    ) : (
      <g stroke={C.ink} fill="none" strokeWidth={1.3}>
        <circle cx={x} cy={yb + 14} r={8} />
        <line x1={x - 16} y1={yb + 23} x2={x + 16} y2={yb + 23} />
      </g>
    )
  let acc = 0
  const cuts = [0, ...p.spans.map((s) => (acc += s))]
  return (
    <Svg w={w} h={h} caption={p.caption} max={w}>
      {/* UDL */}
      <rect x={x0} y={yb - 30} width={Wd} height={24} fill={C.load} opacity={0.08} />
      <line x1={x0} y1={yb - 30} x2={x0 + Wd} y2={yb - 30} stroke={C.load} />
      {Array.from({ length: 23 }, (_, i) => x0 + (i * Wd) / 22).map((x) => (
        <ArrowDown key={x} x={x} y1={yb - 30} y2={yb - 6} w={1} />
      ))}
      <text x={x0 + Wd} y={yb - 104} textAnchor="end" fill={C.load}>
        {p.udl}
      </text>
      {/* beam */}
      <rect x={x0} y={yb - 6} width={Wd} height={12} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      {support(x0, p.left ?? 'pin')}
      {support(x0 + Wd, p.right ?? 'roller')}
      {/* point loads */}
      {p.loads.map((ld, i) => (
        <g key={i}>
          <ArrowDown x={sx(ld.at)} y1={yb - 82} y2={yb - 32} w={2.4} />
          <text x={sx(ld.at)} y={yb - 88} textAnchor="middle" fontWeight={700} fill={C.load}>
            {ld.label}
          </text>
        </g>
      ))}
      {/* dimensions */}
      {p.spans.map((s, i) => (
        <DimH key={i} x1={sx(cuts[i])} x2={sx(cuts[i + 1])} y={yb + 46} label={p.segLabels?.[i] ?? `${s}'-0"`} below />
      ))}
      {p.note && (
        <text x={x0 + Wd / 2} y={yb + 84} textAnchor="middle" fontWeight={600}>
          {p.note}
        </text>
      )}
      {p.section && (
        <g>
          {(() => {
            const s = 4.2
            const hh = (p.section.d + 2.5) * s,
              bb = p.section.b * s
            const top = 40
            return (
              <g>
                <rect x={insetX} y={top} width={bb} height={hh} fill={C.conc} stroke={C.ink} strokeWidth={1.3} />
                {p.section.stirrup && <rect x={insetX + 6} y={top + 6} width={bb - 12} height={hh - 12} rx={4} fill="none" stroke={C.steel} strokeWidth={1} />}
                {Array.from({ length: p.section.n }, (_, i) => insetX + 10 + ((bb - 20) * i) / Math.max(1, p.section!.n - 1)).map((x) => (
                  <circle key={x} cx={x} cy={top + p.section!.d * s} r={4} fill={C.steel} />
                ))}
                <DimV x={insetX + bb + 12} y1={top} y2={top + p.section.d * s} label={`d = ${p.section.d}"`} />
                <DimH x1={insetX} x2={insetX + bb} y={top + hh + 14} label={`b = ${p.section.b}"`} below />
                <text x={insetX + bb / 2} y={top + hh + 50} textAnchor="middle" fill={C.mute}>
                  Beam section
                </text>
              </g>
            )
          })()}
        </g>
      )}
    </Svg>
  )
}

/** two-way slab panel plan; continuous edges drawn with the slab running on past a break line */
export function PanelPlan(p: {
  lb: string
  la: string
  cont: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean }
  name?: string
  beam?: string
  column?: string
  note?: string
  caption?: ReactNode
}) {
  const x0 = 130,
    y0 = 50,
    W = 300,
    H = 250,
    bw = 16
  const w = x0 + W + 190
  const h = y0 + H + 70
  const edge = (c?: boolean) => (c ? 'continuous' : 'discontinuous')
  return (
    <Svg w={w} h={h} caption={p.caption} max={w}>
      {/* slab beyond continuous edges */}
      {p.cont.top && <rect x={x0 - bw / 2} y={y0 - 40} width={W + bw} height={40} fill={C.conc} opacity={0.6} />}
      {p.cont.right && <rect x={x0 + W} y={y0 - bw / 2} width={44} height={H + bw} fill={C.conc} opacity={0.6} />}
      {p.cont.bottom && <rect x={x0 - bw / 2} y={y0 + H} width={W + bw} height={40} fill={C.conc} opacity={0.6} />}
      {p.cont.left && <rect x={x0 - 44} y={y0 - bw / 2} width={44} height={H + bw} fill={C.conc} opacity={0.6} />}
      {p.cont.top && <Break x1={x0 - 20} y1={y0 - 34} x2={x0 + W + 20} y2={y0 - 34} />}
      {p.cont.right && <Break x1={x0 + W + 38} y1={y0 - 20} x2={x0 + W + 38} y2={y0 + H + 20} />}
      {p.cont.bottom && <Break x1={x0 - 20} y1={y0 + H + 34} x2={x0 + W + 20} y2={y0 + H + 34} />}
      {p.cont.left && <Break x1={x0 - 38} y1={y0 - 20} x2={x0 - 38} y2={y0 + H + 20} />}
      {/* panel */}
      <rect x={x0} y={y0} width={W} height={H} fill={C.conc} />
      {/* beams on grid lines */}
      {[
        [x0 - bw / 2, y0 - bw / 2, W + bw, bw],
        [x0 - bw / 2, y0 + H - bw / 2, W + bw, bw],
        [x0 - bw / 2, y0 - bw / 2, bw, H + bw],
        [x0 + W - bw / 2, y0 - bw / 2, bw, H + bw],
      ].map(([x, y, ww, hh], i) => (
        <rect key={i} x={x} y={y} width={ww} height={hh} fill="none" stroke={C.ink} strokeWidth={1.2} />
      ))}
      {[
        [x0, y0],
        [x0 + W, y0],
        [x0, y0 + H],
        [x0 + W, y0 + H],
      ].map(([x, y], i) => (
        <rect key={i} x={x - bw / 2} y={y - bw / 2} width={bw} height={bw} fill={C.steel} />
      ))}
      <text x={x0 + W / 2} y={y0 + H / 2 + 6} textAnchor="middle" fontSize={18} fontWeight={700}>
        {p.name ?? 'S1'}
      </text>
      {p.beam && (
        <text x={x0 + W / 2} y={y0 + 22} textAnchor="middle" fill={C.mute}>
          {p.beam} beams all round
        </text>
      )}
      {p.column && (
        <text x={x0 + W / 2} y={y0 + H - 14} textAnchor="middle" fill={C.mute}>
          {p.column} columns at corners
        </text>
      )}
      <DimH x1={x0} x2={x0 + W} y={y0 + H + 54} label={p.lb} />
      <DimV x={x0 - 62} y1={y0} y2={y0 + H} label={p.la} left />
      <text x={x0 + W / 2} y={y0 - 12} textAnchor="middle" fontSize={11} fill={C.mute}>
        {edge(p.cont.top)}
      </text>
      <text x={x0 + W / 2} y={y0 + H + 26} textAnchor="middle" fontSize={11} fill={C.mute}>
        {edge(p.cont.bottom)}
      </text>
      <text x={x0 + W + 14} y={y0 + H / 2} fontSize={11} fill={C.mute} transform={`rotate(90 ${x0 + W + 14} ${y0 + H / 2})`} textAnchor="middle">
        {edge(p.cont.right)}
      </text>
      <text x={x0 - 14} y={y0 + H / 2} fontSize={11} fill={C.mute} transform={`rotate(-90 ${x0 - 14} ${y0 + H / 2})`} textAnchor="middle">
        {edge(p.cont.left)}
      </text>
      {p.note && (
        <text x={x0 + W + 50} y={y0 + 20} fontSize={11} fill={C.mute}>
          {p.note.split('\n').map((l, i) => (
            <tspan key={i} x={x0 + W + 50} dy={i ? 14 : 0}>
              {l}
            </tspan>
          ))}
        </text>
      )}
    </Svg>
  )
}

// ============================================================== theory sketches
/** RC beam in flexure: strain and stress at the three stages */
export function StagesSketch() {
  const rows = [
    { y: 40, name: '(a) Uncracked', sub: 'M < Mcr', na: 0.5, crack: 0 },
    { y: 175, name: '(b) Cracked, elastic', sub: 'Mcr < M ≤ service', na: 0.36, crack: 1 },
    { y: 310, name: '(c) Ultimate', sub: 'M = Mn (failure)', na: 0.24, crack: 2 },
  ]
  const H = 100,
    sx = 150,
    sw = 50
  const ex = 300,
    fx = 470
  return (
    <Svg w={640} h={430} caption="Strain is linear at every stage (plane sections remain plane); only the stress shape changes." max={640}>
      {['Section', 'Strain', 'Stress'].map((t, i) => (
        <text key={t} x={[sx + sw / 2, ex, fx + 20][i]} y={22} textAnchor="middle" fontWeight={700}>
          {t}
        </text>
      ))}
      {rows.map((r, k) => {
        const yNA = r.y + r.na * H
        const ys = r.y + 0.88 * H
        const yb = r.y + H
        return (
          <g key={k}>
            <text x={6} y={r.y + 40} fontWeight={700}>
              {r.name}
            </text>
            <text x={6} y={r.y + 56} fill={C.mute} fontSize={11}>
              {r.sub}
            </text>
            {/* section */}
            <rect x={sx} y={r.y} width={sw} height={H} fill={C.conc} stroke={C.ink} />
            {[0.25, 0.5, 0.75].map((f) => (
              <circle key={f} cx={sx + f * sw} cy={ys} r={3} fill={C.steel} />
            ))}
            {r.crack > 0 &&
              [0.2, 0.5, 0.8].map((f) => <line key={f} x1={sx + f * sw} y1={yb} x2={sx + f * sw + 2} y2={yNA + (r.crack === 2 ? 4 : 10)} stroke={C.comp} strokeWidth={1} />)}
            <line x1={sx - 8} y1={yNA} x2={sx + sw + 8} y2={yNA} stroke={C.mute} strokeDasharray="4 3" />
            <text x={sx + sw + 10} y={yNA + 4} fontSize={11} fill={C.mute}>
              NA
            </text>
            {/* strain */}
            <line x1={ex} y1={r.y} x2={ex} y2={yb} stroke={C.ink} />
            <polygon points={`${ex},${r.y} ${ex - (r.crack === 2 ? 40 : 22)},${r.y} ${ex},${yNA}`} fill={C.comp} opacity={0.25} stroke={C.comp} />
            <polygon points={`${ex},${yNA} ${ex + ((yb - yNA) / (yNA - r.y)) * (r.crack === 2 ? 40 : 22)},${yb} ${ex},${yb}`} fill={C.ten} opacity={0.2} stroke={C.ten} />
            <text x={ex - 44} y={r.y - 4} fontSize={11} fill={C.comp}>
              {r.crack === 2 ? 'εcu = 0.003' : 'εc'}
            </text>
            <text x={ex + 6} y={ys + 4} fontSize={11} fill={C.ten}>
              {r.crack === 2 ? 'εs ≥ εy' : 'εs'}
            </text>
            {/* stress */}
            <line x1={fx} y1={r.y} x2={fx} y2={yb} stroke={C.ink} />
            {r.crack === 0 && (
              <g>
                <polygon points={`${fx},${r.y} ${fx - 30},${r.y} ${fx},${yNA}`} fill={C.comp} opacity={0.3} stroke={C.comp} />
                <polygon points={`${fx},${yNA} ${fx + 30},${yb} ${fx},${yb}`} fill={C.ten} opacity={0.25} stroke={C.ten} />
                <text x={fx - 30} y={r.y - 4} fontSize={11}>
                  fc (linear)
                </text>
                <text x={fx + 34} y={yb} fontSize={11}>
                  ft ≤ fr = 7.5√f'c
                </text>
                <text x={fx + 34} y={ys - 8} fontSize={11} fill={C.steel}>
                  fs = n·fc (at steel)
                </text>
              </g>
            )}
            {r.crack === 1 && (
              <g>
                <polygon points={`${fx},${r.y} ${fx - 40},${r.y} ${fx},${yNA}`} fill={C.comp} opacity={0.3} stroke={C.comp} />
                <text x={fx - 40} y={r.y - 4} fontSize={11}>
                  fc ≤ ~0.5f'c (triangle)
                </text>
                <Arrow x1={fx} y1={ys} x2={fx + 50} y2={ys} color={C.steel} />
                <text x={fx + 56} y={ys + 4} fontSize={11}>
                  T = As·fs (fs {'<'} fy)
                </text>
                <text x={fx + 8} y={yNA + 22} fontSize={11} fill={C.mute}>
                  cracked concrete: no tension
                </text>
                <text x={fx + 8} y={r.y + 14} fontSize={11} fill={C.mute}>
                  C = ½·fc·b·kd
                </text>
              </g>
            )}
            {r.crack === 2 && (
              <g>
                <path d={`M ${fx} ${r.y} C ${fx - 48} ${r.y} ${fx - 52} ${r.y + 0.6 * (yNA - r.y)} ${fx} ${yNA}`} fill={C.comp} opacity={0.3} stroke={C.comp} />
                <rect x={fx - 44} y={r.y} width={44} height={0.8 * (yNA - r.y)} fill="none" stroke={C.ink} strokeDasharray="4 2" />
                <text x={fx - 52} y={r.y - 4} fontSize={11}>
                  0.85f'c over a = β1c
                </text>
                <Arrow x1={fx} y1={ys} x2={fx + 50} y2={ys} color={C.steel} />
                <text x={fx + 56} y={ys + 4} fontSize={11}>
                  T = As·fy
                </text>
                <text x={fx + 8} y={r.y + 14} fontSize={11} fill={C.mute}>
                  curved block → Whitney block
                </text>
              </g>
            )}
          </g>
        )
      })}
    </Svg>
  )
}

/** free body left of a diagonal crack in a beam without stirrups */
export function CrackedShearSketch() {
  return (
    <Svg w={600} h={250} caption="Internal shear at a diagonal crack: V = Vcz + Vd + Viy (beam without web steel)." max={600}>
      <polygon points="40,50 340,50 340,82 252,170 40,170" fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      <line x1={340} y1={82} x2={252} y2={170} stroke={C.comp} strokeWidth={2} />
      <line x1={40} y1={155} x2={262} y2={155} stroke={C.steel} strokeWidth={3} />
      {/* reaction and load */}
      <Arrow x1={70} y1={225} x2={70} y2={172} color={C.ink} w={2} />
      <text x={78} y={222}>
        R
      </text>
      <ArrowDown x={160} y1={8} y2={48} w={2} />
      <text x={168} y={22} fill={C.load}>
        P
      </text>
      {/* compression zone */}
      <Arrow x1={400} y1={62} x2={342} y2={62} color={C.comp} w={2} />
      <text x={404} y={66}>
        C (compression)
      </text>
      <Arrow x1={350} y1={52} x2={350} y2={98} color={C.ink} w={2} />
      <text x={356} y={98}>
        Vcz — uncracked compression zone
      </text>
      {/* aggregate interlock */}
      <Arrow x1={318} y1={112} x2={286} y2={145} color={C.load} w={2} />
      <text x={330} y={130}>
        Va — aggregate interlock along the crack
      </text>
      <text x={330} y={145} fill={C.mute} fontSize={11}>
        (its vertical part Viy resists shear)
      </text>
      {/* dowel and steel */}
      <Arrow x1={262} y1={155} x2={322} y2={155} color={C.steel} w={2} />
      <text x={328} y={170}>
        T = As fs (steel force)
      </text>
      <Arrow x1={258} y1={157} x2={258} y2={205} color={C.ink} w={2} />
      <text x={266} y={205}>
        Vd — dowel action of the bars
      </text>
      <text x={40} y={244} fontSize={12} fontWeight={600}>
        Vext = R − P = Vcz + Vd + Viy
      </text>
    </Svg>
  )
}

/** equilibrium vs compatibility torsion */
export function TorsionSketch() {
  const torque = (cx: number, cy: number) => (
    <g stroke={C.load} fill="none" strokeWidth={1.6}>
      <path d={`M ${cx - 24} ${cy + 8} A 26 26 0 1 1 ${cx + 8} ${cy + 24}`} />
      <polygon points={`${cx + 8},${cy + 24} ${cx + 18},${cy + 18} ${cx + 14},${cy + 30}`} fill={C.load} stroke="none" />
    </g>
  )
  return (
    <Svg w={620} h={230} caption="Left: torque is needed for equilibrium. Right: torque arises only because the slab and beam rotate together." max={620}>
      <text x={20} y={20} fontWeight={700}>
        Equilibrium (primary) torsion
      </text>
      <rect x={60} y={60} width={40} height={90} fill={C.conc} stroke={C.ink} />
      <rect x={100} y={60} width={160} height={16} fill={C.conc} stroke={C.ink} />
      {[130, 160, 190, 220, 250].map((x) => (
        <ArrowDown key={x} x={x} y1={36} y2={58} w={1.2} />
      ))}
      <text x={110} y={100} fill={C.mute} fontSize={11}>
        cantilever canopy slab
      </text>
      {torque(80, 105)}
      <text x={20} y={185} fontSize={11}>
        Beam must resist T = load × eccentricity;
      </text>
      <text x={20} y={200} fontSize={11}>
        no other load path, so ignoring T = collapse.
      </text>
      <text x={340} y={20} fontWeight={700}>
        Compatibility (secondary) torsion
      </text>
      <rect x={360} y={60} width={40} height={90} fill={C.conc} stroke={C.ink} />
      <rect x={400} y={60} width={190} height={16} fill={C.conc} stroke={C.ink} />
      <rect x={570} y={76} width={20} height={74} fill={C.conc} stroke={C.ink} />
      <path d="M 400 76 Q 470 98 570 76" fill="none" stroke={C.comp} strokeDasharray="4 3" />
      <text x={430} y={110} fill={C.mute} fontSize={11}>
        continuous slab / floor beam
      </text>
      {torque(380, 105)}
      <text x={340} y={185} fontSize={11}>
        Spandrel twists because the slab end rotates;
      </text>
      <text x={340} y={200} fontSize={11}>
        if it cracks, T drops and moments redistribute.
      </text>
    </Svg>
  )
}

/** Nilson Fig 5.20 / 6.21 — standard cut-off and bend points (approx. equal spans, UDL) */
export function CutoffSketch({ ln }: { ln?: number }) {
  const ftin = (ft: number) => {
    const tot = Math.round(ft * 12)
    return `${Math.floor(tot / 12)}'-${tot % 12}"`
  }
  const lab = (f: string, div: number) => (ln ? `${f} = ${ftin(ln / div)}` : f)
  const A = 46,
    B = 330,
    Cc = 346,
    D = 630
  const L = B - A
  const pane = (y: number, kind: 'a' | 'b') => {
    const top = y,
      bot = y + 56
    return (
      <g>
        <rect x={30} y={top - 18} width={16} height={92} fill={C.conc} stroke={C.ink} />
        <rect x={B} y={bot} width={16} height={36} fill={C.conc} stroke={C.ink} />
        <rect x={B} y={top - 18} width={16} height={18} fill={C.conc} stroke={C.ink} />
        <rect x={A} y={top} width={D - A} height={bot - top} fill={C.conc} stroke={C.ink} />
        <Break x1={D} y1={top - 6} x2={D} y2={bot + 6} />
        {kind === 'a' ? (
          <g stroke={C.steel} strokeWidth={2.4} fill="none">
            {/* exterior top bar, hooked */}
            <polyline points={`${A + L / 4},${top + 8} ${36},${top + 8} ${36},${top + 30}`} />
            {/* interior top bar */}
            <line x1={B - L / 3} y1={top + 8} x2={Cc + L / 3} y2={top + 8} />
            {/* bottom bars */}
            <line x1={36} y1={bot - 8} x2={B + 8} y2={bot - 8} />
            <line x1={A} y1={bot - 14} x2={B - L / 8} y2={bot - 14} strokeDasharray="8 4" />
            <line x1={Cc + L / 8} y1={bot - 14} x2={D} y2={bot - 14} strokeDasharray="8 4" />
            <line x1={B + 8} y1={bot - 8} x2={D} y2={bot - 8} />
          </g>
        ) : (
          <g stroke={C.steel} strokeWidth={2.4} fill="none">
            {/* straight bottom bars */}
            <line x1={36} y1={bot - 8} x2={B + 8} y2={bot - 8} />
            <line x1={B + 8} y1={bot - 8} x2={D} y2={bot - 8} />
            {/* cranked bar: exterior bend at L/7, interior bend at L/4, top extends L/3 past interior face */}
            <polyline
              points={`${36},${top + 30} ${36},${top + 8} ${A + L / 7 - 12},${top + 8} ${A + L / 7 + 12},${bot - 14} ${B - L / 4 - 12},${bot - 14} ${B - L / 4 + 12},${top + 8} ${Cc + L / 3},${top + 8}`}
              strokeDasharray="8 4"
            />
            <polyline points={`${B - L / 3},${top + 14} ${Cc + L / 4 - 12},${top + 14} ${Cc + L / 4 + 12},${bot - 14} ${D},${bot - 14}`} strokeDasharray="2 3" />
          </g>
        )}
        {/* dims */}
        {kind === 'a' ? (
          <g>
            <DimH x1={A} x2={A + L / 4} y={top - 26} label={lab('ln/4', 4)} />
            <DimH x1={B - L / 3} x2={B} y={top - 26} label={lab('ln/3', 3)} />
            <DimH x1={Cc} x2={Cc + L / 3} y={top - 26} label={lab('ln/3', 3)} />
            <DimH x1={B - L / 8} x2={B} y={bot + 18} label={lab('ln/8', 8)} below />
            <DimH x1={Cc} x2={Cc + L / 8} y={bot + 18} label={lab('ln/8', 8)} below />
            <text x={140} y={bot + 50} fill={C.mute} fontSize={11}>
              other half of the bottom bars: 6 in. into the supports
            </text>
          </g>
        ) : (
          <g>
            <DimH x1={A} x2={A + L / 7} y={bot + 18} label={lab('ln/7', 7)} below />
            <DimH x1={B - L / 4} x2={B} y={bot + 18} label={lab('ln/4', 4)} below />
            <DimH x1={Cc} x2={Cc + L / 4} y={bot + 18} label={lab('ln/4', 4)} below />
            <DimH x1={B - L / 3} x2={B} y={top - 26} label={lab('ln/3', 3)} />
            <DimH x1={Cc} x2={Cc + L / 3} y={top - 26} label={lab('ln/3', 3)} />
          </g>
        )}
      </g>
    )
  }
  return (
    <Svg w={660} h={380} caption={ln ? `Standard cut-off / bend points, ln = ${ln} ft (Nilson Fig. 5.20).` : 'Standard cut-off / bend points for approximately equal spans with UDL (Nilson Fig. 5.20).'} max={660}>
      <text x={6} y={16} fontWeight={700}>
        (a) straight bars
      </text>
      {pane(66, 'a')}
      <text x={6} y={206} fontWeight={700}>
        (b) cranked (bent) bars
      </text>
      {pane(256, 'b')}
    </Svg>
  )
}

/** ACI standard hooks */
export function HookSketch() {
  return (
    <Svg w={620} h={250} caption="Standard hooks (ACI 318 §25.3). ldh is measured from the critical section to the outside of the hook." max={620}>
      <text x={10} y={18} fontWeight={700}>
        90° hook
      </text>
      <line x1={40} y1={30} x2={40} y2={200} stroke={C.mute} strokeDasharray="5 3" />
      <text x={44} y={212} fontSize={11} fill={C.mute}>
        critical section
      </text>
      <path d="M 40 60 L 180 60 A 26 26 0 0 1 206 86 L 206 180" fill="none" stroke={C.steel} strokeWidth={6} />
      <DimH x1={40} x2={209} y={36} label="ldh (to outside of bar)" />
      <DimV x={226} y1={86} y2={180} label="12db extension" />
      <text x={56} y={100} fontSize={11}>
        inside bend dia D:
      </text>
      <text x={56} y={115} fontSize={11}>
        6db (#3–#8), 8db (#9–#11)
      </text>
      <text x={56} y={130} fontSize={11}>
        10db (#14, #18)
      </text>
      <text x={340} y={18} fontWeight={700}>
        180° hook
      </text>
      <line x1={350} y1={30} x2={350} y2={200} stroke={C.mute} strokeDasharray="5 3" />
      <path d="M 350 70 L 520 70 A 30 30 0 0 1 520 130 L 480 130" fill="none" stroke={C.steel} strokeWidth={6} />
      <DimH x1={350} x2={553} y={40} label="ldh" />
      <DimH x1={480} x2={520} y={150} label="4db ≥ 2.5 in." below />
      <text x={10} y={228} fontSize={11}>
        Stirrup / tie hooks: 90° — 6db ≥ 3 in. (#3–#5), 12db (#6–#8);
      </text>
      <text x={10} y={243} fontSize={11}>
        135° — 6db ≥ 3 in.; bend dia 4db for #3–#5 stirrups.
      </text>
    </Svg>
  )
}

/** corner reinforcement at an exterior corner of a two-way slab */
export function CornerSketch() {
  const x0 = 80,
    y0 = 40
  return (
    <Svg w={580} h={300} caption="Exterior corner: top steel resists cracks across the diagonal, bottom steel resists cracks along it; zone = l/5 of the longer span each way." max={560}>
      <rect x={x0} y={y0} width={240} height={220} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      <rect x={x0} y={y0 + 220 - 70} width={70} height={70} fill={C.load} opacity={0.12} stroke={C.load} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} stroke={C.steel} strokeWidth={1.4}>
          <line x1={x0 + 8 + i * 14} y1={y0 + 150} x2={x0 + 8 + i * 14} y2={y0 + 220} />
          <line x1={x0} y1={y0 + 158 + i * 14} x2={x0 + 70} y2={y0 + 158 + i * 14} />
        </g>
      ))}
      <line x1={x0} y1={y0 + 220} x2={x0 + 90} y2={y0 + 130} stroke={C.comp} strokeDasharray="5 3" strokeWidth={1.5} />
      <line x1={x0 + 20} y1={y0 + 130} x2={x0 + 100} y2={y0 + 210} stroke={C.ten} strokeDasharray="2 3" strokeWidth={1.5} />
      <DimH x1={x0} x2={x0 + 70} y={y0 + 244} label="l/5" below />
      <DimV x={x0 - 14} y1={y0 + 150} y2={y0 + 220} label="l/5" left />
      <text x={x0 + 120} y={y0 + 110} fontSize={11} fill={C.mute}>
        panel
      </text>
      <text x={x0 - 40} y={y0 + 4} fontSize={11} fill={C.mute} transform={`rotate(-90 ${x0 - 40} ${y0 + 4})`} textAnchor="end">
        discontinuous edge
      </text>
      <text x={x0 + 120} y={y0 + 290 - 30} fontSize={11} fill={C.mute}>
        discontinuous edge
      </text>
      <g fontSize={11}>
        <text x={340} y={70} fill={C.comp}>
          - - bottom crack along the diagonal
        </text>
        <text x={340} y={88} fill={C.ten}>
          ··· top crack across the diagonal
        </text>
        <text x={340} y={118}>
          Top AND bottom bars, both directions,
        </text>
        <text x={340} y={133}>
          in the shaded l/5 × l/5 corner zone
        </text>
        <text x={340} y={148}>
          (l = longer clear span).
        </text>
        <text x={340} y={172}>
          Area each way, each face = As for the
        </text>
        <text x={340} y={187}>
          maximum positive moment in the panel.
        </text>
        <text x={340} y={211}>
          Alternative: top bars parallel to the
        </text>
        <text x={340} y={226}>
          diagonal, bottom bars perpendicular to it.
        </text>
      </g>
    </Svg>
  )
}

// ============================================================== recurring model answers
export const ANS = {
  stages: String.raw`As the load on a simply supported RC beam increases it passes through three stages (sketch below).

**1. Uncracked elastic stage** ($M < M_{cr}$)
- Tensile stress at the bottom is below the modulus of rupture $f_r = 7.5\sqrt{f'_c}$, so the whole concrete section (tension side included) works.
- Strain and stress are both linear (triangular) above and below the NA; concrete and steel are elastic.
- Steel strain = concrete strain at that level, so $f_s = n f_c$; analyse with the **uncracked transformed section** ($A_g + (n-1)A_s$).
- $M_{cr} = f_r I_g / y_t$ (or $I_{ut}$ of the transformed section). Steel stress is tiny (a few ksi).

**2. Cracked elastic stage** ($M_{cr} < M \le$ service, $f_c \lesssim 0.5f'_c$, $f_s < f_y$)
- Tension concrete cracks; cracks rise towards the NA, which moves up to $kd$. Concrete below the NA carries no tension — the steel takes all of it.
- Strain still linear; compressive stress is still about linear, so the compression block is a **triangle**: $C = \tfrac12 f_c b(kd)$, $T = A_s f_s$, lever arm $jd = d - kd/3$.
- **Cracked transformed section**: $b(kd)^2/2 = nA_s(d - kd)$, $f_c = M\,kd/I_{cr}$, $f_s = nM(d-kd)/I_{cr}$. This is the service-load (WSD) state used for deflection and crack checks.

**3. Ultimate (inelastic) stage** (approaching $M_n$)
- Concrete stress becomes non-linear, following the $\sigma$–$\varepsilon$ curve (curved block). In an under-reinforced beam the steel **yields** first ($f_s = f_y$), cracks widen, deflection grows quickly, the NA rises.
- Failure when the extreme fibre reaches $\varepsilon_{cu} = 0.003$ and the concrete crushes — a ductile, well-warned failure.
- The curved block is replaced by the **Whitney block** $0.85f'_c$ over $a = \beta_1 c$: $C = 0.85f'_c ab = A_s f_y = T$, $M_n = A_s f_y(d - a/2)$.

The moment–deflection curve shows a kink at cracking (stiffness drops), a nearly straight cracked-elastic part, then a flat plateau after yielding up to crushing.`,

  uncertainty: String.raw`**Sources of uncertainty** (why capacity cannot be set equal to demand):
1. Actual loads may differ from the assumed (code) loads.
2. Actual loads may be distributed differently from what was assumed.
3. Assumptions and simplifications in the analysis — computed load effects (M, V, P) differ from the real ones.
4. Actual structural behaviour may differ from the assumed behaviour (imperfect knowledge).
5. Actual member dimensions may differ from those specified.
6. Reinforcement may not be in its proper position (cover, spacing).
7. Actual material strengths (f'c, fy) may differ from the specified values.

Also weighed: the consequence of failure (loss of life, cost) and the type of failure (ductile with warning vs. sudden).

**How the Strength (USD) method handles them** — partial safety factors on both sides:
$$\phi S_n \ge U = \gamma_D D + \gamma_L L + \dots$$
- **Load factors** $\gamma > 1$ cover load uncertainty: $U = 1.2D + 1.6L$ (check $1.4D$). LL gets the larger factor because it is less predictable than DL; combinations with wind/earthquake use reduced factors because maxima are unlikely to coincide.
- **Strength reduction factors** $\phi < 1$ cover strength, dimension and analysis uncertainty, ductility and importance: 0.90 tension-controlled flexure, 0.75 shear and torsion, 0.65 tied / 0.75 spiral compression-controlled members, 0.65 bearing. Brittle or important members get smaller φ.
- **Probability basis**: margin $M = S - Q$; the factors are calibrated so that the safety index $\beta \approx 3$–$4$: P(overload) ≈ 1/1000 × P(understrength) ≈ 1/100 → P(failure) ≈ 1/100,000.
- **Ductility rules** make failures gradual: $\varepsilon_t \ge 0.004$ ($\rho \le \rho_{max}$), φ falls in the transition zone, $A_{s,min}$, minimum stirrups; plus **serviceability** checks (deflection, cracking) at service loads.`,

  shearComponents: String.raw`In a beam **without web reinforcement**, once an inclined (diagonal tension) crack forms, the external shear $V_{ext} = R - P$ on the free body left of the crack is resisted by:
$$V_{int} = V_{cz} + V_d + V_{iy}$$
- **$V_{cz}$ — shear in the uncracked compression zone** above the crack tip (the concrete that is still intact; roughly 20–40 % of the total).
- **$V_{iy}$ — vertical component of the aggregate-interlock force $V_a$** — friction/interlock of aggregate particles across the rough crack faces, acting along the crack (roughly 33–50 %). Lost if the crack opens wide.
- **$V_d$ — dowel action** of the longitudinal tension bars that cross the crack (roughly 15–25 %); limited because it can split the cover along the bars.

Moment equilibrium about the compression resultant gives the bar force $T = (M - V_d p + V_a m)/z \approx M_a/z$ — the steel at the crack bottom carries the force set by the moment at the crack **top**, so diagonal cracking also raises steel stress. In shallow beams this redistribution fails almost immediately (splitting along the bars or crushing of the compression zone), which is why the code takes $V_c = 2\lambda\sqrt{f'_c}b_wd$ as the cracking shear and asks for stirrups beyond it.`,

  torsionTypes: String.raw`- **Origin** — Equilibrium: the torque is needed to keep the structure in equilibrium; it is found from statics alone (statically determinate). Compatibility: it comes from continuity — the member is twisted because a connected member rotates (statically indeterminate).
- **Alternative load path** — Equilibrium: none. Compatibility: yes — if the member cracks and loses torsional stiffness, the forces redistribute to other members.
- **If ignored** — Equilibrium: collapse. Compatibility: extensive cracking, but no collapse.
- **Examples** — Equilibrium: beam supporting a cantilever canopy/balcony slab, eccentrically loaded beam, curved bridge girder, helical stair. Compatibility: spandrel (edge) beam of a monolithic floor, twisted by the end rotation of the slab or floor beams framing into it.
- **Design** — Equilibrium: must be designed for the full factored $T_u$. Compatibility: ACI allows $T_u$ to be reduced to the cracking torque $\phi T_{cr}$ (redistribution), and torsion may be neglected altogether when $T_u \le \phi T_{th} = \phi\lambda\sqrt{f'_c}\,A_{cp}^2/p_{cp}$ (one quarter of $T_{cr}$).

With a stiff spandrel the slab end behaves as nearly fixed; with a cracked, flexible spandrel it behaves as hinged and the slab positive moment increases — the slab must then be designed for that altered moment.`,

  ldFactors: String.raw`**Development length** $l_d$ = the embedment needed to develop the bar's full yield stress by bond (before pull-out or splitting). It increases or decreases with:
- **Bar yield strength $f_y$** — larger force to develop → longer $l_d$ ($l_d \propto f_y$).
- **Concrete strength** — bond/splitting resistance $\propto \sqrt{f'_c}$ → $l_d \propto 1/\sqrt{f'_c}$ (with $\sqrt{f'_c} \le 100$ psi).
- **Bar diameter $d_b$** — force $\propto d_b^2$ but bonded perimeter $\propto d_b$, so $l_d \propto d_b$. Small bars (#6 and smaller) get $\psi_s = 0.8$.
- **Cover and bar spacing** ($c_b$) — small cover/spacing leads to splitting at lower stress → longer $l_d$; benefit capped at $(c_b + K_{tr})/d_b \le 2.5$ (pull-out then governs).
- **Transverse reinforcement** ($K_{tr} = 40A_{tr}/sn$) — stirrups crossing the splitting plane confine the bar → shorter $l_d$.
- **Bar location (casting position)** $\psi_t = 1.3$ for top bars with more than 12 in. of fresh concrete below — bleed water and air collect under them.
- **Epoxy coating** $\psi_e = 1.5$ (cover < 3$d_b$ or clear spacing < 6$d_b$) or 1.2 — coating destroys adhesion and reduces friction; $\psi_t\psi_e \le 1.7$.
- **Lightweight concrete** $\lambda = 0.75$ — lower tensile strength → longer $l_d$.
- **Excess reinforcement** — $l_d \times A_{s,req}/A_{s,prov}$ (not for splices).

ACI general equation: $\;l_d = \dfrac{3}{40}\dfrac{f_y}{\lambda\sqrt{f'_c}}\dfrac{\psi_t\psi_e\psi_s}{(c_b + K_{tr})/d_b}\,d_b \ge 12$ in.; simplified forms $f_y\psi_t\psi_e d_b/(20\lambda\sqrt{f'_c})$ (#7 and larger, "good" spacing/cover) or $/25$ (#6 and smaller).`,

  splices: String.raw`**Splicing** — bars come in limited lengths (usually 40 ft; also cut for handling/construction joints), so bars must be joined to make the reinforcement continuous. Methods: **lap splices** (bars overlapped; force transferred bar → concrete → bar by bond), mechanical couplers, and welded splices. Splices should be located away from points of maximum stress and staggered. Lap splices are not allowed for bars larger than #11.

**Tension lap splices (ACI 25.5.2):** length is a multiple of $l_d$ (computed with all ψ factors but **without** the $A_{s,req}/A_{s,prov}$ reduction), and never less than 12 in.
- **Class A: $l_{st} = 1.0\,l_d$** — allowed only when **both** (i) $A_{s,provided} \ge 2A_{s,required}$ over the whole splice length, and (ii) **not more than 50 %** of the bars are spliced within the required lap length.
- **Class B: $l_{st} = 1.3\,l_d$** — all other cases (the default).

Reason: where the steel is lightly stressed and only half the bars are spliced at a section, the risk of splitting is low, so a shorter lap is acceptable. Example: if $l_d$ of a #8 bar is 50 in., Class A = 50 in., Class B = 1.3 × 50 = 65 in.`,

  columnLap: String.raw`Column bars are usually lap-spliced just above each floor, and are designed for the stress expected under all load combinations:

**Compression lap splices (ACI 25.5.5)**
- $f_y \le 60{,}000$ psi: $l_{sc} = 0.0005 f_y d_b$ (= **30 $d_b$** for Grade 60).
- $f_y > 60{,}000$ psi: $l_{sc} = (0.0009 f_y - 24)\,d_b$.
- Never less than **12 in.**; increase by **one-third** if $f'_c < 3000$ psi.
- **Tied columns:** × **0.83** if the ties over the splice length have effective area ≥ 0.0015$hs$ in both directions. **Spiral columns:** × **0.75**. Still ≥ 12 in.
- Bars of different size: length = larger of $l_{dc}$ of the larger bar and $l_{sc}$ of the smaller bar.
- End-bearing splices (bars square-cut, held in contact) allowed for compression-only bars in tied/spiral columns, if the continuing bars in each face can carry ≥ 0.25$f_y$ × area of that face.

**When the bars may be in tension (load combinations with M)** (ACI 10.7.5.2):
- Bar stress ≤ 0.5$f_y$: **Class A** if ≤ half the bars are spliced at any section and alternate splices are staggered by $l_d$; otherwise **Class B**.
- Bar stress > 0.5$f_y$: **Class B** ($1.3\,l_d$).
- Every column splice must also provide a minimum tensile strength (at least 0.25$f_y A_s$ per face).`,

  cutoff: String.raw`For continuous beams/one-way slabs with **approximately equal spans** (larger ≤ 1.2 × smaller) and **uniformly distributed load**, ACI/Nilson give standard cut-off and bend points (Nilson Fig. 5.20) instead of working from the moment envelope ($l_n$ = clear span):

**(a) Straight bars**
- Bottom (positive) bars: about half run the full span and extend **6 in. into the supports**; the other half may stop at **$l_n/8$** from the face of the interior supports (and close to the exterior face).
- Top (negative) bars at an **interior support**: extend **$l_n/3$** past the face on each side.
- Top bars at the **exterior (integral) support**: extend **$l_n/4$** into the span and are hooked into the spandrel/wall.

**(b) Cranked (bent-up) bars** — alternate bottom bars are bent up to serve as top steel:
- Bend up at **$l_n/7$** from the face of a discontinuous (exterior) support and at **$l_n/4$** from the face of an interior support.
- The bent bar continues as top steel **$l_n/3$** past the face of the interior support; the straight bottom bars run 6 in. into the supports.

General ACI rules behind the figure: every bar extends $d$ or $12d_b$ beyond the point where it is no longer needed and at least $l_d$ beyond the point of maximum stress; at least 1/4 of +$A_s$ (1/3 for simple spans) runs ≥ 6 in. into the support; at least 1/3 of −$A_s$ extends past the inflection point by $d$, $12d_b$ or $l_n/16$; bars should not be cut in a tension zone unless the shear conditions of ACI 9.7.3.5 are met.`,

  hooks: String.raw`**Why hooks are provided**
- Where there is not enough room to develop a bar by a straight embedment (exterior beam–column joints, ends of cantilevers, simple supports, footings), a standard hook anchors it in a much shorter length — the hook resists by **bearing** on the concrete inside the bend, in addition to bond. $l_{dh} = \dfrac{f_y\psi_e\psi_c\psi_r}{50\lambda\sqrt{f'_c}}d_b \ge 8d_b,\ 6$ in. is roughly one-third of the straight $l_d$.
- Hooks anchor stirrups and ties around the longitudinal bars so they can develop their yield stress, and they hold the cage together.
- Hooks are only effective in tension; they do **not** help bars in compression.

**ACI standard hook dimensions** (sketch below):
- **90° hook:** bend + extension of **12$d_b$** at the free end.
- **180° hook:** bend + extension of **4$d_b$, but not less than 2.5 in.**
- Minimum inside bend diameter: **6$d_b$** for #3–#8, **8$d_b$** for #9–#11, **10$d_b$** for #14 and #18.
- **Stirrup and tie hooks:** 90° — 6$d_b$ ≥ 3 in. for #3–#5, 12$d_b$ for #6–#8; 135° — 6$d_b$ ≥ 3 in.; 180° — 4$d_b$ ≥ 2.5 in.; inside bend diameter 4$d_b$ for #3–#5.
- $l_{dh}$ is measured from the critical section to the **outside edge** of the hook.`,

  ts: String.raw`**Why.** Concrete **shrinks** as it dries and expands/contracts with **temperature**. A slab is restrained by its supporting beams and walls, so these volume changes are prevented and tensile stresses develop; concrete is weak in tension, so it cracks. In a one-way slab the main (flexural) bars run in one direction only, so nothing controls cracking in the **perpendicular** direction. Temperature & shrinkage (T&S) bars:
- keep shrinkage/temperature cracks fine and well distributed;
- tie the slab together and distribute concentrated loads sideways (hence also called **distribution bars**);
- hold the main bars in position during casting.

**How (ACI 24.4.3).** Bars are placed **perpendicular to the main bars** (usually on top of the bottom main layer), with area based on the **gross** section $bh$:
- Grade 40 or 50 deformed bars: $A_s = 0.0020\,bh$
- Grade 60 deformed bars or welded wire: $A_s = 0.0018\,bh$
- $f_y > 60$ ksi: $0.0018 \times 60{,}000/f_y \ge 0.0014\,bh$
- Spacing ≤ **5h or 18 in.** (whichever is smaller). Small bars at close spacing work better than large bars far apart.
- The same ratio is also the **minimum flexural steel** of a slab (main-bar spacing ≤ 3h or 18 in.).

Example: $h = 6$ in., Grade 60 → $A_s = 0.0018 \times 12 \times 6 = 0.13$ in²/ft → #3 @ 10 in. c/c (≤ 5h = 30 in., ≤ 18 in.).`,

  minThick: String.raw`**ACI minimum thickness of non-prestressed one-way slabs** (deflection not computed), normal-weight concrete, $f_y = 60$ ksi ($l$ = span):
- Simply supported: **$l/20$**
- One end continuous: **$l/24$**
- Both ends continuous: **$l/28$**
- Cantilever: **$l/10$**
- (Beams / ribbed one-way slabs: $l/16$, $l/18.5$, $l/21$, $l/8$.)
- For $f_y \ne 60$ ksi multiply by $(0.4 + f_y/100{,}000)$; for lightweight concrete by $(1.65 - 0.005w_c) \ge 1.09$.

**Two-way slabs with beams on all sides:** for $\alpha_{fm} > 2.0$, $h = \dfrac{l_n(0.8 + f_y/200{,}000)}{36 + 9\beta} \ge 3.5$ in.; for $0.2 < \alpha_{fm} \le 2.0$, $h = \dfrac{l_n(0.8 + f_y/200{,}000)}{36 + 5\beta(\alpha_{fm} - 0.2)} \ge 5$ in. (flat plates without beams: about $l_n/30$–$l_n/33$, ≥ 5 in.). Older practice: $h \ge$ perimeter/180.

**Why a minimum thickness even when flexure and shear do not need it** — it is a **serviceability** (deflection) requirement. A thin slab with a high steel ratio is flexible: its immediate deflection plus long-term creep/shrinkage deflection can crack partitions and finishes, cause ponding, sagging and vibration and alarm occupants. Slabs are rarely checked for deflection by calculation, so the code instead specifies a span/depth limit that keeps deflections acceptable. Higher-strength steel means less steel area, a smaller cracked $I$ and larger deflection, hence the $f_y$ correction.`,

  corner: String.raw`At an **exterior corner** of a two-way slab supported on stiff beams or walls, where two discontinuous edges meet, the corners tend to **curl up / lift** when the slab is loaded. If they are held down (by the walls or columns above, or by the beams), large **twisting moments** develop there, giving:
- cracks on the **bottom** surface roughly **along the diagonal**, and
- cracks on the **top** surface roughly **perpendicular to the diagonal** (across the corner).

**Special corner reinforcement (ACI 8.7.3):**
- Provided at exterior corners in **both the top and bottom** faces.
- Extends from the corner a distance of **one-fifth of the longer clear span** ($l/5$) in each direction.
- Area in each direction, top and bottom, = the steel required for the **maximum positive moment** per foot in the panel.
- Arrangement: either **bands of bars parallel to the edges** in both directions, top and bottom (common in practice), or **top bars parallel to the diagonal and bottom bars perpendicular to it**.
- Not needed at corners where the slab is continuous (interior corners), nor in flat plates/slabs supported directly on columns.`,
  stirrupSpacing: String.raw`Maximum spacing of vertical stirrups (ACI 9.7.6.2.2), with $V_s = (V_u - \phi V_c)/\phi$:

**(i) When $V_s \le 4\sqrt{f'_c}\,b_wd$:**
- $s_{max} = d/2$ or **24 in.**, whichever is smaller;
- and not more than the spacing given by minimum web steel: $s \le \dfrac{A_vf_{yt}}{0.75\sqrt{f'_c}\,b_w}$ and $\le \dfrac{A_vf_{yt}}{50b_w}$.

**(ii) When $4\sqrt{f'_c}\,b_wd < V_s \le 8\sqrt{f'_c}\,b_wd$:**
- the limits are **halved**: $s_{max} = d/4$ or **12 in.**, whichever is smaller.
- If $V_s > 8\sqrt{f'_c}\,b_wd$ no spacing is allowed — the web would crush; **enlarge the section**.

**Why:** a diagonal crack runs at about 45° from the tension steel up to mid-depth, covering a horizontal length of about $d/2$; with $s \le d/2$ every such crack is crossed by at least one stirrup. When the shear is very high the cracks are wider and more numerous, so at least two stirrups must cross each crack ($s \le d/4$). (Class Case method: Case B/C use $d/2$, 24 in.; Case D uses $d/4$, 12 in.)`,

  serviceability: String.raw`**Serviceability** means the structure must perform satisfactorily under **normal service (unfactored) loads** throughout its life — not just be strong enough not to collapse. A member that is safe but deflects, cracks or vibrates excessively has failed a *serviceability limit state*. Requirements:
- **Deflection** — immediate plus long-term (creep and shrinkage) deflections must be small enough not to damage partitions, finishes and fittings, cause ponding, or look unsafe (e.g. span/360 for live-load deflection, span/240 total, span/480 when sensitive partitions are attached). Controlled by minimum thickness (Table 7.3.1.1 / 9.3.1.1) or by computing deflections with $I_e$.
- **Cracking** — cracks must stay narrow (hairline) for appearance, water-tightness and to protect the steel from corrosion; controlled by bar spacing limits, distributing steel in small bars, cover, and minimum T&S steel.
- **Vibration** — floors must be stiff enough that walking or machinery does not cause annoying vibration.
- **Durability** — adequate cover and concrete quality so the structure resists weathering, corrosion and fire over its design life.

In USD, strength is checked at factored loads and serviceability is checked at service loads (elastic, cracked-section behaviour).`,

  floorSystems: String.raw`Five RC floor systems common in Bangladesh (sketches below):
1. **One-way slab on beams (beam–slab system)** — panels with long/short side ≥ 2; the slab spans the short way onto parallel beams, which carry the load to girders/columns. Simple formwork; economical for spans of about 10–15 ft.
2. **Two-way slab with beams on all sides (edge-supported)** — panels with long/short < 2, beams on the column lines on all four edges; the slab bends in both directions. The most common system in residential and office buildings in Bangladesh.
3. **Flat plate** — a slab of uniform thickness supported directly on columns, no beams, no drops. Minimum storey height and simple formwork (popular for apartments); punching shear at the columns governs; spans about 15–25 ft.
4. **Flat slab** — like a flat plate but thickened round the columns with **drop panels** and/or **column capitals** to resist punching shear and negative moment; suited to heavier loads (car parks, warehouses, markets).
5. **Ribbed (joist) slab / waffle slab** — closely spaced ribs (one-way joists, or two-way ribs forming a waffle) with a thin topping slab, made with removable pans; light and stiff for long spans with moderate loads (auditoria, lobbies).

(Other: precast/hollow-core planks, post-tensioned flat plates.)`,

  usdWsd: String.raw`- **Loads** — WSD: actual service (unfactored) loads. USD: loads multiplied by load factors, $U = 1.2D + 1.6L$ etc.
- **Material behaviour** — WSD: elastic, linear stress–strain; cracked transformed section with modular ratio $n$; concrete stress triangle. USD: inelastic, at the ultimate (failure) state; concrete at $\varepsilon_{cu} = 0.003$ with the $0.85f'_c$ stress block, steel at $f_y$.
- **How safety is ensured** — WSD: a single factor of safety on the **materials**: stresses under service loads must not exceed **allowable stresses**, e.g. $f_c \le 0.45f'_c$, $f_s \le 0.4f_y$ (≈ 24 ksi Grade 60) — effectively FS ≈ 2.2 (concrete), 2.5 (steel). USD: **partial safety factors** on both sides: load factors $\gamma > 1$ (larger for the more uncertain LL) and strength reduction factors $\phi < 1$ (0.90 flexure, 0.75 shear, 0.65 columns) so that $\phi S_n \ge U$ (e.g. $\phi M_n \ge M_u$).
- **Merits** — WSD: simple, controls service stresses, cracking and deflection directly; but the true margin against collapse is unknown and the same FS is applied to DL and LL. USD: uniform, probability-based reliability; uses the real reserve of strength; different factors for different load types and member behaviour (ductile vs brittle); usually more economical. Serviceability must be checked separately.
- **Status** — WSD: an "alternate method" in older ACI/BNBC; still used for water-retaining structures and service checks. USD: the current ACI 318 / BNBC 2020 method.`,

  rhoMax: String.raw`**Derivation of $\rho_{max}$.** For a singly reinforced rectangular section at failure ($\varepsilon_{cu} = 0.003$), similar triangles in the strain diagram give
$$\frac{c}{d_t} = \frac{0.003}{0.003 + \varepsilon_t}$$
Equilibrium $C = T$: $0.85f'_c\,ab = A_sf_y$ with $a = \beta_1c$, so $\rho = \dfrac{A_s}{bd} = 0.85\beta_1\dfrac{f'_c}{f_y}\dfrac{c}{d}$. Putting $c$ for a chosen strain (and $d_t = d$ for one layer):
$$\rho = 0.85\beta_1\frac{f'_c}{f_y}\frac{0.003}{0.003 + \varepsilon_t}$$
ACI/BNBC require $\varepsilon_t \ge 0.004$ at nominal strength for beams, hence
$$\rho_{max} = \rho_{0.004} = 0.85\beta_1\frac{f'_c}{f_y}\frac{0.003}{0.007}\quad\left(\text{and } \rho_{0.005} = 0.85\beta_1\frac{f'_c}{f_y}\frac{0.003}{0.008}\right)$$
e.g. $f'_c = 4$ ksi, $f_y = 60$ ksi: $\rho_{max} = 0.85(0.85)(4/60)(0.4286) = 0.0206$.

**How ρmax ensures $\varepsilon_t \ge 0.004$.** More steel means a larger tension force, so the compression block and $c$ must grow; a deeper $c$ means a smaller $\varepsilon_t = 0.003(d_t - c)/c$. Keeping $\rho \le \rho_{max}$ keeps $c \le \tfrac37 d_t$, i.e. $\varepsilon_t \ge 0.004$: the steel is well past yield ($\varepsilon_y = 0.00207$) when the concrete crushes, so the beam shows large deflection and cracking (ductile, warned failure) instead of sudden crushing.

**Variation of φ with $\varepsilon_t$ (ACI 21.2.2 / BNBC):**
- $\varepsilon_t \ge 0.005$ — **tension-controlled**, $\phi = 0.90$ ($c/d_t \le 0.375$).
- $\varepsilon_t \le \varepsilon_y$ (0.002 for Grade 60) — **compression-controlled**, $\phi = 0.65$ (tied) / 0.75 (spiral) ($c/d_t \ge 0.6$).
- In between — **transition**: φ varies linearly, $\phi = 0.65 + 0.25\dfrac{\varepsilon_t - \varepsilon_y}{0.005 - \varepsilon_y}$ ($= 0.483 + 83.3\varepsilon_t$ for Grade 60). At $\varepsilon_t = 0.004$, $\phi = 0.817$.
So a beam with $\rho$ between $\rho_{0.005}$ and $\rho_{max}$ is allowed but penalised with a lower φ — adding steel beyond $\rho_{0.005}$ gains little design strength.`,

  cover: String.raw`**Why a minimum concrete cover** (clear distance from the outer bar/stirrup to the concrete surface):
- **Corrosion protection / durability** — the alkaline concrete keeps the steel passive; cover delays carbonation and chloride penetration and keeps moisture and oxygen away.
- **Fire protection** — concrete insulates the steel, which loses strength rapidly above ~500 °C; cover provides the fire rating.
- **Bond** — enough concrete round the bar to develop bond and prevent splitting along the bar (cover enters $c_b$ in $l_d$).
- Allowance for placing tolerances and for the concrete to flow round the bars.

**ACI 318 (20.5.1.3) / BNBC 2020 minimum clear cover, cast-in-place, non-prestressed:**
- Cast against and permanently exposed to earth: **3 in.**
- Exposed to earth or weather: #6–#18 bars **2 in.**; #5 bars and smaller **1½ in.**
- Not exposed to weather or in contact with ground:
  - slabs, joists and walls: #11 and smaller **¾ in.**; #14 and #18 1½ in.
  - **beams and columns** (to stirrups, ties or spirals): **1½ in.**
- Typical design values in class: beams 1.5 in. clear to the stirrup (so $d \approx h - 2.5$ in. for one layer), slabs ¾ in. (so $d \approx h - 1$ in.). More cover is used in aggressive (coastal) environments.`,

  epsT: String.raw`With $b$ and $d$ fixed, adding tension steel raises $T = A_sf_y$; equilibrium $0.85f'_c\,ab = A_sf_y$ then needs a deeper compression block, so $a$ and $c = a/\beta_1$ **increase**. From the strain diagram (concrete fixed at 0.003 at failure)
$$\varepsilon_t = 0.003\,\frac{d_t - c}{c}$$
so a larger $c$ gives a **smaller** $\varepsilon_t$: the steel is stretched less when the concrete crushes. The moment capacity $M_n = A_sf_y(d - a/2)$ still rises, but at a decreasing rate (the lever arm shrinks), the beam becomes less ductile, and once $\varepsilon_t < 0.005$ the strength reduction factor drops below 0.90 — so the design strength $\phi M_n$ hardly increases.

**ACI/BNBC minimum:** for beams (members with axial load below $0.1f'_cA_g$) the net tensile strain at nominal strength must be at least **$\varepsilon_t = 0.004$** (i.e. $\rho \le \rho_{max} = \rho_{0.004}$). For $\phi = 0.90$ (tension-controlled) $\varepsilon_t \ge 0.005$ is needed. If more capacity is required, use compression steel or a deeper section rather than more tension steel.`,

}

/** small wrapper so theory solutions read as markdown + optional sketch */
export function Model({ md, fig }: { md: string; fig?: ReactNode }) {
  return (
    <div className="space-y-3 text-sm">
      <Md>{md}</Md>
      {fig}
    </div>
  )
}

// canonical code-pane givens (attached design aids)
export const AID = {
  aci: { label: 'ACI moment & shear coefficients', what: 'one-way, Table 12.1', ref: 'sl-aci' } satisfies RcGiven,
  t123: { label: 'Table 12.3', what: 'negative moments', ref: 'sl-t123' } satisfies RcGiven,
  t124: { label: 'Table 12.4', what: 'DL positive moments', ref: 'sl-t124' } satisfies RcGiven,
  t125: { label: 'Table 12.5', what: 'LL positive moments', ref: 'sl-t125' } satisfies RcGiven,
  t126: { label: 'Table 12.6', what: 'load ratio Wa/Wb', ref: 'sl-t126' } satisfies RcGiven,
  h2way: { label: 'Eq. 13.8b', what: 'two-way h, αfm > 2', ref: 'sl-h2way', formula: true } satisfies RcGiven,
  t134: { label: 'Table 13.4', what: 'column-strip % (DDM)', ref: 'sl-t134' } satisfies RcGiven,
}

// ============================================================== solution kit (numbers from src/rc/engine)
export { f }
const sg = (v: number, d = 3) => (v >= 0 ? `+ ${f(v, d)}` : `- ${f(-v, d)}`)

export function StepList({ steps, start = 1 }: { steps: SolStep[]; start?: number }) {
  return (
    <ol className="space-y-2" style={{ listStyle: 'none', paddingLeft: 0 }}>
      {steps.map((s, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent font-bold text-xs grid place-items-center mt-0.5">{start + i}</span>
          <div className="flex-1 min-w-0 text-sm">
            {s.t && <div className="font-semibold">{s.t}</div>}
            {s.tex && (
              <div className="overflow-x-auto scroll-thin">
                <Tex block>{s.tex}</Tex>
              </div>
            )}
            {s.md && <Md className="text-mute">{s.md}</Md>}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Sol({ children }: { children: ReactNode }) {
  return <div className="space-y-3 text-sm">{children}</div>
}
export function SH({ children }: { children: ReactNode }) {
  return <div className="font-bold text-accent pt-1">{children}</div>
}
export function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className="text-left font-semibold border-b border-line px-2 py-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="border-b border-line/50 px-2 py-1 num">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export function Result({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-good/40 bg-good/5 px-3 py-2">
      <Md>{children}</Md>
    </div>
  )
}
const ftin = (ft: number) => {
  const t = Math.round(ft * 12)
  return `${Math.floor(t / 12)}'-${t % 12}"`
}

// ---------------------------------------------------------------- doubly review
export function doublyReview(p: DoublyReviewIn) {
  const r = reviewDoubly(p)
  const dt = p.dt ?? p.d
  const k = 0.85 * p.fc
  const steps: SolStep[] = [
    { t: 'Data', tex: `A_s = ${f(p.As)}\\text{ in}^2,\\ A'_s = ${f(p.Asp)}\\text{ in}^2,\\ \\beta_1 = ${f(r.b1, 3)},\\ \\varepsilon_y = \\frac{f_y}{E_s} = \\frac{${f(p.fy)}}{29000} = ${f(r.ey, 5)}` },
    {
      t: "Trial: assume A's yields",
      tex: `a = \\frac{(A_s - A'_s)f_y}{0.85f'_cb} = \\frac{(${f(p.As)} - ${f(p.Asp)})(${f(p.fy)})}{0.85(${f(p.fc)})(${f(p.b)})} = ${f(r.trial.a)}\\text{ in},\\quad c = \\frac{a}{\\beta_1} = ${f(r.trial.c)}\\text{ in}`,
    },
    {
      t: "Check A's",
      tex: `\\varepsilon'_s = 0.003\\frac{c - d'}{c} = 0.003\\frac{${f(r.trial.c)} - ${f(p.dp)}}{${f(r.trial.c)}} = ${f(r.trial.epsSp, 5)}\\ ${r.trial.epsSp >= r.ey ? '\\ge' : '<'}\\ \\varepsilon_y = ${f(r.ey, 5)}`,
      md: r.method === 'both-yield' ? "Compression steel **yields**: the trial is correct, $f'_s = f_y$." : "Compression steel does **not** yield: put $f'_s = E_s\\varepsilon'_s = 87\\,\\frac{c-d'}{c}$ ksi and solve for c.",
    },
  ]
  if (r.method === 'both-yield')
    steps.push({ t: 'Forces', tex: `C_c = 0.85f'_cab = 0.85(${f(p.fc)})(${f(r.a)})(${f(p.b)}) = ${f(r.Cc, 1)}\\text{ k},\\quad C_s = A'_sf_y = ${f(r.Cs, 1)}\\text{ k},\\quad T = A_sf_y = ${f(r.T, 1)}\\text{ k}` })
  else if (r.method === 'quadratic' && r.quad)
    steps.push(
      {
        t: 'Equilibrium → quadratic in c',
        tex: `0.85f'_c\\beta_1bc + A'_s\\left(87\\frac{c-d'}{c}${r.dispUsed ? " - 0.85f'_c" : ''}\\right) = A_sf_y \\Rightarrow ${f(r.quad.A, 3)}c^2 ${sg(r.quad.B, 2)}c ${sg(r.quad.C, 1)} = 0`,
        md: r.dispUsed ? "The concrete displaced by $A'_s$ ($0.85f'_c$ per in²) is subtracted, as in the class handnote." : undefined,
      },
      { t: 'Neutral axis', tex: `c = ${f(r.c)}\\text{ in},\\quad a = \\beta_1c = ${f(r.a)}\\text{ in},\\quad f'_s = 87\\frac{${f(r.c)} - ${f(p.dp)}}{${f(r.c)}} = ${f(r.fsp, 2)}\\text{ ksi} < f_y`, v: r.c, u: 'in' },
      { t: 'Forces', tex: `C_c = 0.85f'_cab = ${f(r.Cc, 1)}\\text{ k},\\quad C_s = A'_s(f'_s${r.dispUsed ? " - 0.85f'_c" : ''}) = ${f(r.Cs, 1)}\\text{ k},\\quad C_c + C_s = ${f(r.Cc + r.Cs, 1)} \\approx T = A_sf_y = ${f(r.T, 1)}\\text{ k}\\ \\checkmark` },
    )
  else
    steps.push({ t: 'Strain compatibility', tex: `c = ${f(r.c)}\\text{ in},\\ f_s = ${f(r.fs, 1)}\\text{ ksi},\\ f'_s = ${f(r.fsp, 1)}\\text{ ksi}`, md: 'The tension steel does not yield either: c found by trial so that $C_c + C_s = A_sf_s$ with both stresses from strains.' })
  steps.push(
    { t: 'Nominal moment', tex: `M_n = C_c\\left(d - \\frac a2\\right) + C_s(d - d') = ${f(r.Cc, 1)}(${f(p.d)} - ${f(r.a / 2)}) + ${f(r.Cs, 1)}(${f(p.d - p.dp)}) = ${f(r.Mn, 0)}\\text{ k-in} = ${f(r.MnFt, 1)}\\text{ k-ft}`, v: r.MnFt, u: 'k-ft' },
    { t: 'Net tensile strain', tex: `\\varepsilon_t = 0.003\\frac{d_t - c}{c} = 0.003\\frac{${f(dt)} - ${f(r.c)}}{${f(r.c)}} = ${f(r.epsT, 5)}` },
    phiSteps(r.epsT, p.fy * 1000),
    { t: 'Design strength', tex: `\\phi M_n = ${f(r.phi)}\\times${f(r.MnFt, 1)} = ${f(r.phiMn, 1)}\\text{ k-ft}`, v: r.phiMn, u: 'k-ft', md: r.ductileOk ? '$\\varepsilon_t \\ge 0.004$: permitted for a beam ✓' : '$\\varepsilon_t < 0.004$: not permitted for a beam ✗' },
  )
  return { r, steps }
}

// ---------------------------------------------------------------- doubly design (b × h fixed)
export function doublyDesign(p: DoublyDesignIn) {
  const dd = designDoubly(p)
  const sm = dd.sm
  const b1 = beta1(p.fc * 1000)
  const steps: SolStep[] = [
    {
      t: 'Largest singly reinforced capacity (εt = 0.005, φ = 0.9)',
      tex: `\\rho_{0.005} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.003+0.005} = 0.85(${f(b1, 3)})\\frac{${f(p.fc)}}{${f(p.fy)}}(0.375) = ${f(sm.rho005, 5)},\\quad A_{s1} = \\rho bd = ${f(sm.As1)}\\text{ in}^2`,
    },
    { t: '', tex: `a = \\frac{A_{s1}f_y}{0.85f'_cb} = ${f(sm.a)}\\text{ in},\\ c = \\frac{a}{\\beta_1} = ${f(sm.c)}\\text{ in},\\ \\varepsilon_t = 0.003\\frac{${f(p.dt)} - ${f(sm.c)}}{${f(sm.c)}} = ${f(sm.epsT, 5)}\\ (\\phi = ${f(sm.phi)})` },
    {
      t: '',
      tex: `\\phi M_{n1} = \\phi A_{s1}f_y\\left(d - \\frac a2\\right) = ${f(sm.phi)}(${f(sm.As1)})(${f(p.fy)})(${f(p.d)} - ${f(sm.a / 2)})/12 = ${f(sm.phiMn1, 1)}\\text{ k-ft}\\ ${dd.needed ? '<' : '\\ge'}\\ M_u = ${f(p.Mu)}\\text{ k-ft}`,
      md: dd.needed ? '**Compression steel is required.**' : 'A singly reinforced section is enough.',
    },
  ]
  if (dd.needed && dd.comp) {
    steps.push(
      { t: 'Moment for the steel couple', tex: `\\phi M_{n2} = M_u - \\phi M_{n1} = ${f(p.Mu)} - ${f(sm.phiMn1, 1)} = ${f(dd.phiMn2, 1)}\\text{ k-ft},\\quad M_{n2} = \\frac{${f(dd.phiMn2, 1)}\\times12}{0.9} = ${f(dd.Mn2, 0)}\\text{ k-in}` },
      { t: "Stress in A's (c from the singly part)", tex: `\\varepsilon'_s = 0.003\\frac{c - d'}{c} = 0.003\\frac{${f(sm.c)} - ${f(p.dp)}}{${f(sm.c)}} = ${f(dd.epsSp, 5)}\\ ${dd.compYields ? '\\ge' : '<'}\\ \\varepsilon_y = ${f(p.fy / 29000, 5)} \\Rightarrow f'_s = ${f(dd.fsp, 2)}\\text{ ksi}` },
      { t: 'Compression steel', tex: `A'_s = \\frac{M_{n2}}{f'_s(d - d')} = \\frac{${f(dd.Mn2, 0)}}{${f(dd.fsp, 2)}(${f(p.d)} - ${f(p.dp)})} = ${f(dd.Asp)}\\text{ in}^2`, v: dd.Asp, u: 'in²' },
      { t: 'Tension steel', tex: `A_{s2} = \\frac{A'_sf'_s}{f_y} = ${f(dd.As2)}\\text{ in}^2,\\quad A_s = A_{s1} + A_{s2} = ${f(sm.As1)} + ${f(dd.As2)} = ${f(dd.As)}\\text{ in}^2`, v: dd.As, u: 'in²' },
      {
        t: 'Choose bars',
        tex: `\\text{tension: } ${dd.tension.n}\\ \\#${dd.tension.no} = ${f(dd.tension.A)}\\text{ in}^2\\ (${dd.tension.layers}\\text{ layer${dd.tension.layers > 1 ? 's' : ''}}),\\qquad \\text{compression: } ${dd.comp.n}\\ \\#${dd.comp.no} = ${f(dd.comp.A)}\\text{ in}^2`,
      },
    )
  } else if (dd.singly) {
    steps.push({ t: 'Singly reinforced steel', tex: `A_s = ${f(dd.As)}\\text{ in}^2 \\to ${dd.tension.n}\\ \\#${dd.tension.no}` })
  }
  const r = dd.review
  steps.push({
    t: 'Check the section provided',
    tex: `c = ${f(r.c)}\\text{ in},\\ f'_s = ${f(r.fsp, 1)}\\text{ ksi},\\ \\varepsilon_t = ${f(r.epsT, 5)} \\Rightarrow \\phi = ${f(r.phi)},\\ \\phi M_n = ${f(r.phiMn, 1)}\\text{ k-ft}\\ ${r.phiMn >= p.Mu ? '\\ge' : '<'}\\ ${f(p.Mu)}\\ ${r.phiMn >= p.Mu ? '\\checkmark' : '\\times'}`,
    md: r.epsT < 0.005 ? 'The provided section falls in the transition zone; φMn still covers Mu.' : undefined,
  })
  return { dd, steps }
}

// ---------------------------------------------------------------- singly design for loads on a simple span
export function singlyLoadDesign(load: LoadInput, b: number, d: number, fc: number, fy: number) {
  const bl = beamLoads(load)
  const da = designAs(bl.Mu, b, d, fc, fy)
  const bars = sgPickBars(da.As, b)
  const rv = sgReview({ b, fc, fy, layers: [{ As: bars.As, d }] })
  return { bl, da, bars, rv }
}

// ---------------------------------------------------------------- T-beam design and reviews
export function tDesign(beff: BeffIn, Mu: number, d: number, fc: number, fy: number, dt = d) {
  const bf = effectiveWidth(beff)
  const t = designT({ Mu, beff: bf.b, bw: beff.bw, hf: beff.hf, d, dt, fc, fy })
  const bars = dbPickBars(t.As, beff.bw, [8, 9, 10, 11], 2)
  const steps: SolStep[] = [
    { t: 'Effective flange width (interior beam)', tex: bf.cands.map((c) => `${c.label} = ${f(c.value, 1)}`).join(',\\quad ') + `\\ \\Rightarrow\\ b = ${f(bf.b, 1)}\\text{ in}` },
    { t: 'Can the flange alone carry Mu?', tex: `\\phi M_{n,f} = 0.9(0.85f'_c b h_f)\\left(d - \\frac{h_f}{2}\\right) = 0.9(0.85)(${f(fc)})(${f(bf.b, 1)})(${f(beff.hf)})(${f(d)} - ${f(beff.hf / 2)})/12 = ${f(t.phiMnFlange, 1)}\\text{ k-ft}\\ ${t.rect ? '\\ge' : '<'}\\ M_u = ${f(Mu)}`, md: t.rect ? 'a ≤ hf → design as a **rectangular** beam of width b.' : 'a > hf → **true T-section**: split into the flange overhangs and the web.' },
  ]
  if (t.rect) {
    steps.push({ t: 'Steel (rectangular, b = beff)', tex: `A_s = ${f(t.As)}\\text{ in}^2,\\ a = ${f(t.a)}\\text{ in} \\le h_f,\\ c = ${f(t.c)}\\text{ in},\\ \\varepsilon_t = ${f(t.epsT, 5)}\\ (\\phi = ${f(t.phi)})`, v: t.As, u: 'in²' })
  } else {
    steps.push(
      { t: 'Flange overhangs', tex: `A_{sf} = \\frac{0.85f'_c(b - b_w)h_f}{f_y} = \\frac{0.85(${f(fc)})(${f(bf.b, 1)} - ${f(beff.bw)})(${f(beff.hf)})}{${f(fy)}} = ${f(t.Asf)}\\text{ in}^2,\\quad \\phi M_{n1} = 0.9A_{sf}f_y\\left(d - \\frac{h_f}{2}\\right) = ${f(t.phiMn1, 1)}\\text{ k-ft}` },
      { t: 'Web', tex: `\\phi M_{n2} = M_u - \\phi M_{n1} = ${f(Mu)} - ${f(t.phiMn1, 1)} = ${f(t.phiMn2, 1)}\\text{ k-ft} \\Rightarrow A_{sw} = ${f(t.Asw)}\\text{ in}^2\\ \\ (b = b_w,\\ \\text{solved as a rectangle})` },
      { t: 'Check', tex: `a = \\frac{A_{sw}f_y}{0.85f'_cb_w} = ${f(t.a)}\\text{ in} > h_f\\ \\checkmark,\\quad c = ${f(t.c)}\\text{ in},\\quad \\varepsilon_t = 0.003\\frac{${f(dt)} - ${f(t.c)}}{${f(t.c)}} = ${f(t.epsT, 5)}\\ (\\phi = ${f(t.phi)})` },
      { t: 'Total steel', tex: `A_s = A_{sf} + A_{sw} = ${f(t.Asf)} + ${f(t.Asw)} = ${f(t.As)}\\text{ in}^2`, v: t.As, u: 'in²' },
    )
  }
  steps.push({ t: 'Bars and minimum steel', tex: `${bars.n}\\ \\#${bars.no} = ${f(bars.A)}\\text{ in}^2\\ (${bars.layers}\\text{ layer${bars.layers > 1 ? 's' : ''}}),\\quad A_{s,min} = ${f(t.AsMin)}\\text{ in}^2\\ \\checkmark` })
  return { bf, t, bars, steps }
}

export function tReview(beff: BeffIn, d: number, As: number, fc: number, fy: number, dt = d) {
  const bf = effectiveWidth(beff)
  const r = reviewT({ beff: bf.b, bw: beff.bw, hf: beff.hf, d, dt, As, fc, fy })
  const steps: SolStep[] = [
    { t: 'Effective flange width (interior beam)', tex: bf.cands.map((c) => `${c.label} = ${f(c.value, 1)}`).join(',\\quad ') + `\\ \\Rightarrow\\ b = ${f(bf.b, 1)}\\text{ in}` },
    { t: 'Stress block in the flange?', tex: `a = \\frac{A_sf_y}{0.85f'_cb} = \\frac{${f(As)}(${f(fy)})}{0.85(${f(fc)})(${f(bf.b, 1)})} = ${f(r.aRect)}\\text{ in}\\ ${r.rect ? '\\le' : '>'}\\ h_f = ${f(beff.hf)}\\text{ in}`, md: r.rect ? 'Rectangular behaviour with b = beff.' : 'True T: split into flange and web.' },
  ]
  if (!r.rect)
    steps.push(
      { t: 'Flange and web', tex: `A_{sf} = ${f(r.Asf)},\\ A_{sw} = ${f(r.Asw)}\\text{ in}^2,\\ a = \\frac{A_{sw}f_y}{0.85f'_cb_w} = ${f(r.a)}\\text{ in}` },
      { t: 'Nominal moment', tex: `M_n = A_{sf}f_y(d - h_f/2) + A_{sw}f_y(d - a/2) = ${f(r.Mn1, 0)} + ${f(r.Mn2, 0)} = ${f(r.Mn, 0)}\\text{ k-in} = ${f(r.Mn / 12, 1)}\\text{ k-ft}`, v: r.Mn / 12, u: 'k-ft' },
    )
  else steps.push({ t: 'Nominal moment', tex: `M_n = A_sf_y\\left(d - \\frac a2\\right) = ${f(As)}(${f(fy)})(${f(d)} - ${f(r.a / 2)}) = ${f(r.Mn, 0)}\\text{ k-in} = ${f(r.Mn / 12, 1)}\\text{ k-ft}`, v: r.Mn / 12, u: 'k-ft' })
  steps.push(
    { t: 'Net tensile strain', tex: `c = \\frac{a}{\\beta_1} = \\frac{${f(r.a)}}{${f(r.b1, 3)}} = ${f(r.c)}\\text{ in},\\quad \\varepsilon_t = 0.003\\frac{${f(dt)} - ${f(r.c)}}{${f(r.c)}} = ${f(r.epsT, 5)}` },
    phiSteps(r.epsT, fy * 1000),
    { t: 'Design strength', tex: `\\phi M_n = ${f(r.phi)}\\times${f(r.Mn / 12, 1)} = ${f(r.phiMn, 1)}\\text{ k-ft}`, v: r.phiMn, u: 'k-ft', md: `$A_{s,min} = ${f(r.AsMin)}$ in² ${r.AsMinOk ? '≤' : '>'} $A_s$ ${r.AsMinOk ? '✓' : '✗'}` },
  )
  return { bf, r, steps }
}

/** negative moment at an interior support: flange in tension → rectangle bw × d */
export function negReview(bw: number, d: number, dt: number, As: number, fc: number, fy: number) {
  const r = reviewRect(bw, d, dt, As, fc, fy)
  const steps: SolStep[] = [
    { t: 'Section', md: `Negative moment: the slab (flange) is in **tension** and cracked, the compression zone is the bottom of the web → rectangle $b = b_w = ${f(bw)}$ in.` },
    { t: 'Stress block', tex: `a = \\frac{A_sf_y}{0.85f'_cb_w} = \\frac{${f(As)}(${f(fy)})}{0.85(${f(fc)})(${f(bw)})} = ${f(r.a)}\\text{ in},\\quad c = \\frac{a}{\\beta_1} = \\frac{${f(r.a)}}{${f(r.b1, 3)}} = ${f(r.c)}\\text{ in}` },
    { t: 'Strains', tex: `\\varepsilon_s = 0.003\\frac{${f(d)} - ${f(r.c)}}{${f(r.c)}} = ${f(r.epsS, 5)}\\ (${r.tensionYields ? '\\ge\\varepsilon_y:\\text{ yields}' : '<\\varepsilon_y'}),\\quad \\varepsilon_t = 0.003\\frac{${f(dt)} - ${f(r.c)}}{${f(r.c)}} = ${f(r.epsT, 5)}` },
    phiSteps(r.epsT, fy * 1000),
    { t: 'Moments', tex: `M_n = A_sf_y\\left(d - \\frac a2\\right) = ${f(As)}(${f(fy)})(${f(d)} - ${f(r.a / 2)}) = ${f(r.Mn, 0)}\\text{ k-in} = ${f(r.Mn / 12, 1)}\\text{ k-ft},\\quad \\phi M_n = ${f(r.phiMn, 1)}\\text{ k-ft}`, v: r.phiMn, u: 'k-ft' },
    {
      t: 'Steel limits',
      tex: `A_{s,min} = \\frac{\\max(3\\sqrt{f'_c},200)}{f_y}b_wd = ${f(r.AsMin)}\\text{ in}^2 \\le ${f(As)}\\ \\checkmark,\\quad \\rho = ${f(r.rho, 4)}\\ ${r.rho <= r.rhoMax ? '\\le' : '>'}\\ \\rho_{max} = ${f(r.rhoMax, 4)}`,
      md: r.epsT >= 0.004 ? '$\\varepsilon_t \\ge 0.004$ ✓' : '$\\varepsilon_t < 0.004$ ✗ (not permitted for a beam)',
    },
  ]
  return { r, steps }
}

// ---------------------------------------------------------------- shear (Case A–D, 3 spacings)
export function shearCase(bm: ShearBeam, sec: ShearSection) {
  const sd = designShear(bm, sec)
  const run = sd.runs.find((r) => r.id === 'sL') ?? sd.runs[0]
  const lim = sd.lim
  const lay = sd.layouts[run.id]
  const sp = sd.spacings[run.id]
  const pts: { label: string; u: number }[] = [{ label: `at d (${f(sec.d)} in from face)`, u: sec.d }]
  for (const u of run.uLoads) {
    pts.push({ label: `just left of the load (${f(u / 12, 2)} ft)`, u: u - 0.01 })
    pts.push({ label: `just right of the load`, u: u + 0.01 })
  }
  const rows = pts.map((p) => ({ ...p, a: shearAt(run.VuAt(p.u), sec) }))
  return { sd, run, lim, lay, sp, rows }
}

export function ShearSolution({ bm, sec, swNote }: { bm: ShearBeam; sec: ShearSection; swNote?: string }) {
  const { sd, run, lim, lay, sp, rows } = shearCase(bm, sec)
  const dg = sd.dg
  const Av = lim.Av
  const steps: SolStep[] = [
    {
      t: 'Loads and reactions',
      tex: `w_u = ${f(dg.wu)}\\text{ k/ft}${dg.wsw ? `\\ (\\text{incl. } ${f(bm.factored ? bm.swFactor ?? 1.2 : 1.2)}\\times${f(dg.wsw)}\\text{ self-weight})` : ''},\\quad R = ${f(dg.R[0], 2)}\\text{ k}`,
      md: swNote,
    },
    { t: 'Design shear', tex: `V_u(\\text{face}) = ${f(run.Vface, 2)}\\text{ k},\\quad V_u(d) = ${f(run.Vface, 2)} - ${f(dg.wu)}\\times\\frac{${f(sec.d)}}{12} = ${f(run.Vd, 2)}\\text{ k}` },
    {
      t: 'Concrete capacity',
      tex: `V_c = 2\\sqrt{f'_c}b_wd = 2\\sqrt{${sec.fc}}(${f(sec.bw)})(${f(sec.d)})/1000 = ${f(lim.Vc, 2)}\\text{ k},\\quad \\phi V_c = ${f(lim.phiVc, 2)}\\text{ k},\\quad \\tfrac12\\phi V_c = ${f(lim.halfPhiVc, 2)}\\text{ k}`,
    },
    { t: 'Case limits', tex: `\\phi\\,4\\sqrt{f'_c}b_wd = ${f(lim.phiVs4, 1)}\\text{ k},\\quad \\phi\\,8\\sqrt{f'_c}b_wd = ${f(lim.phiVs8, 1)}\\text{ k},\\quad V_{u,max} = \\phi V_c + \\phi8\\sqrt{f'_c}b_wd = ${f(lim.VuMax, 1)}\\text{ k}` },
    {
      t: 'Minimum steel and maximum spacing',
      tex: `\\frac{A_v}{s} \\ge \\max\\left(\\frac{0.75\\sqrt{f'_c}b_w}{f_y},\\frac{50b_w}{f_y}\\right) = \\max(${f(lim.avsMin1, 4)},\\ ${f(lim.avsMin2, 4)}) = ${f(lim.avsMin, 4)}\\text{ in}^2/\\text{in},\\quad s_{max} = \\min(d/2, 24) = ${f(lim.smaxC, 2)}\\text{ in}`,
      md: `#3 two-legged stirrups: $A_v = ${f(Av, 2)}$ in².`,
    },
  ]
  return (
    <Sol>
      <StepList steps={steps} />
      <SH>Required spacing at the key sections (Case method)</SH>
      <Tbl
        head={['Section', 'Vu (k)', 'Case', 'φVs (k)', 'Av/s (in²/in)', 's calc (in)', 's max (in)', 's (in)']}
        rows={rows.map((r) => [
          r.label,
          f(r.a.Vu, 2),
          r.a.case,
          r.a.case === 'A' ? '—' : f(r.a.phiVs, 2),
          r.a.case === 'A' ? '0' : f(r.a.avs, 4),
          Number.isFinite(r.a.sCalc) ? f(r.a.sCalc, 2) : '—',
          Number.isFinite(r.a.sMax) ? f(r.a.sMax, 2) : '—',
          Number.isFinite(r.a.s) ? f(r.a.s, 2) : 'none',
        ])}
      />
      <Md>{`Stirrups needed from the face to where $V_u = \\tfrac12\\phi V_c$: ${f(run.uReqEnd / 12, 2)} ft${run.uPhiVc !== null ? ` (Vu falls below φVc at ${f(run.uPhiVc / 12, 2)} ft)` : ''}. Beyond that (Case A) no stirrups are required by strength — nominal stirrups at $s_{max}$ are good practice to hold the top bars.`}</Md>
      <SH>Three sets of spacing (each half, symmetric)</SH>
      <Md>{`Spacings chosen: **${sp.map((s) => f(s)).join(' in., ')} in.** (smallest = required at d, rounded down to ½ in.; largest = minimum steel / $s_{max}$).`}</Md>
      <Tbl head={['Zone', 'Spaces', 'From (in)', 'To (in)']} rows={[['first stirrup', '—', '0', f(lay.first)], ...lay.zones.map((z, i) => [`set ${i + 1}`, `${z.n} @ ${f(z.s)} in.`, f(z.from), f(z.to)])]} />
      <Result>{`**#3 two-legged stirrups:** 1 @ ${f(lay.first)} in. + ${lay.zones.map((z) => `${z.n} @ ${f(z.s)} in.`).join(' + ')} = ${f(lay.last)} in. (${ftin(lay.last / 12)}) from each support face — ${lay.count} stirrups per half${sd.midStirrup ? ', plus one at midspan' : ''}.`}</Result>
      <StirrupSketch sd={sd} />
      {sd.flags.length > 0 && <Md>{sd.flags.map((x) => `- ${x}`).join('\n')}</Md>}
    </Sol>
  )
}

/** shear-force diagram with φVc lines and the stirrup layout below */
export function StirrupSketch({ sd }: { sd: ShearDesign }) {
  const dg = sd.dg
  const x0 = 30,
    W = 560,
    L = dg.Ltot
  const sx = (x: number) => x0 + (x / L) * W
  const Vmax = Math.max(...dg.pts.map((p) => Math.abs(p.V)))
  const yc = 90,
    sc = 70 / Vmax
  const sy = (V: number) => yc - V * sc
  const path = dg.pts.map((p, i) => `${i ? 'L' : 'M'} ${sx(p.x)} ${sy(p.V)}`).join(' ')
  const yb = 220
  const lim = sd.lim
  const ticks: number[] = []
  for (const r of sd.runs) for (const u of sd.layouts[r.id].pos) ticks.push(r.face + (r.dir * u) / 12)
  const L0 = sd.layouts.sL
  return (
    <Svg w={620} h={300} caption="Top: factored shear with φVc and φVc/2. Bottom: stirrup layout (symmetric)." max={620}>
      <line x1={x0} y1={yc} x2={x0 + W} y2={yc} stroke={C.ink} />
      <path d={`${path} L ${sx(L)} ${yc} L ${x0} ${yc} Z`} fill={C.ten} opacity={0.12} />
      <path d={path} fill="none" stroke={C.ten} strokeWidth={1.6} />
      {[lim.phiVc, lim.halfPhiVc, -lim.phiVc, -lim.halfPhiVc].map((v, i) => (
        <line key={i} x1={x0} x2={x0 + W} y1={sy(v)} y2={sy(v)} stroke={C.load} strokeDasharray={i % 2 ? '2 3' : '6 3'} />
      ))}
      <text x={x0 + W + 4} y={sy(lim.phiVc) + 4} fontSize={11} fill={C.load}>
        φVc
      </text>
      <text x={x0 + W + 4} y={sy(lim.halfPhiVc) + 4} fontSize={11} fill={C.load}>
        ½φVc
      </text>
      <text x={x0 + 4} y={sy(dg.pts[0].V) - 4} fontSize={11}>
        {f(dg.pts[0].V, 1)} k
      </text>
      <rect x={x0} y={yb} width={W} height={34} fill={C.conc} stroke={C.ink} />
      {ticks.map((x, i) => (
        <line key={i} x1={sx(x)} x2={sx(x)} y1={yb + 3} y2={yb + 31} stroke={C.steel} strokeWidth={1.2} />
      ))}
      {L0 &&
        L0.zones.map((z, i) => {
          const a = sx(dg.faces[0][1] + z.from / 12),
            b = sx(dg.faces[0][1] + z.to / 12)
          return (
            <g key={i}>
              <DimH x1={a} x2={b} y={i % 2 ? yb - 14 : yb + 50} label={`${z.n} @ ${f(z.s)}"`} below={i % 2 === 0} />
            </g>
          )
        })}
    </Svg>
  )
}

// ---------------------------------------------------------------- one-way slab with ACI coefficients
export function OneWaySolution({ p, endNote }: { p: OneWayCoefInput; endNote?: string }) {
  const r = oneWayCoef(p)
  const sec = r.sections.filter((s) => !s.mirror)
  const steps: SolStep[] = [
    { t: 'Minimum thickness', tex: r.hmin.map((x) => `l_n/${x.rule === 'one' ? 24 : x.rule === 'both' ? 28 : 20} = \\frac{${f(x.l)}\\times12}{${x.rule === 'one' ? 24 : x.rule === 'both' ? 28 : 20}} = ${f(x.h, 2)}`).filter((v, i, a) => a.indexOf(v) === i).join(',\\ ') + `\\text{ in} \\Rightarrow h = ${f(r.h)}\\text{ in},\\ d = h - 1 = ${f(r.d)}\\text{ in}`, md: r.hGiven ? 'Thickness as given.' : 'Round h up; d = h − 1 in. (¾ in. cover + half a #3–#4 bar).' },
    { t: 'Loads (per ft²)', tex: `\\text{self-wt} = \\frac{${f(r.h)}}{12}(150) = ${f(r.loads.sw, 1)},\\ D = ${f(r.loads.D, 1)}\\text{ psf},\\ L = ${f(r.loads.L)}\\text{ psf},\\ w_u = 1.2(${f(r.loads.D, 1)}) + 1.6(${f(r.loads.L)}) = ${f(r.loads.wu, 1)}\\text{ psf}` },
    { t: 'Depth check', tex: `d_{req} = \\sqrt{\\frac{M_{u,max}}{\\phi\\rho_{0.005} f_y b(1 - 0.59\\rho f_y/f'_c)}} = ${f(r.depth.dreq, 2)}\\text{ in}\\ ${r.depth.dreq <= r.d ? '\\le' : '>'}\\ d = ${f(r.d)}\\ ${r.depth.dreq <= r.d ? '\\checkmark' : ''}` },
    { t: 'Minimum steel and spacing', tex: `A_{s,min} = 0.0018bh = 0.0018(12)(${f(r.h)}) = ${f(r.AsMin)}\\text{ in}^2/\\text{ft},\\quad s_{max} = \\min(3h, 18) = ${f(r.smax)}\\text{ in}` },
  ]
  return (
    <Sol>
      <StepList steps={steps} />
      <SH>Moments and steel (Mu = C·wu·ln², As by iterating a)</SH>
      <Tbl
        head={['Section', 'C', 'ln (ft)', 'Mu (k-ft/ft)', 'As req', 'As design', `#${r.bar} spacing`]}
        rows={sec.map((s) => [s.label, `1/${s.den}`, f(s.ln), f(s.Mu, 2), f(s.as.As), `${f(s.AsD)}${s.usesMin ? ' (min)' : ''}`, `${f(s.sp.s)} in.`])}
      />
      <SH>Detailing — bottom bars with alternate bars cranked</SH>
      <Md>{[
        ...r.spanBars.filter((_, j, a) => j < Math.ceil(a.length / 2)).map((b, j) => `- Span ${j + 1}: **#${r.bar} @ ${f(b.s)} in. c/c** bottom, alternate bars cranked.`),
        ...r.supports
          .filter((s) => !s.sec.mirror)
          .map((s) => `- ${s.sec.label}: need ${f(s.extra.As)} in²/ft → in ${f(s.extra.width)} in. width ${f(s.extra.need)} in²; one cranked bar gives ${f(s.extra.cranked)} → **${s.extra.n} #${r.bar} extra top** between the cranked bars${s.extra.sExtra ? ` (spacing form: #${r.bar} @ ${f(s.extra.sExtra)} in. extra)` : ''}.`),
        `- Temperature & shrinkage (perpendicular): $0.0018bh = ${f(r.ts.As)}$ in²/ft → **#${r.ts.bar} @ ${f(r.ts.s)} in. c/c** (≤ 5h, 18 in.).`,
        `- Bend cranked bars at $l_n/7$ from a discontinuous end and $l_n/4$ from an interior support; top steel extends $l_n/3$ past the support face.`,
      ].join('\n')}</Md>
      <StepList
        start={steps.length + 1}
        steps={[
          {
            t: 'Shear check',
            tex: `V_u(d) = ${f(r.shear.c)}\\frac{w_ul_n}{2} - w_u\\frac{d}{12} = ${f(r.shear.Vd, 2)}\\text{ k/ft},\\quad \\phi V_c = 0.75(2\\sqrt{f'_c})(12)(${f(r.d)}) = ${f(r.shear.phiVc, 2)}\\text{ k/ft}\\ ${r.shear.ok ? '\\checkmark' : '\\times'}`,
          },
        ]}
      />
      <SlabStripSketch r={r} />
      {endNote && <Md>{endNote}</Md>}
      {r.warnings.length > 0 && <Md>{r.warnings.map((w) => `- ${w}`).join('\n')}</Md>}
    </Sol>
  )
}

/** elevation of a continuous one-way slab with cranked bars and extra top bars */
export function SlabStripSketch({ r }: { r: OneWayCoefResult }) {
  const n = r.n
  const x0 = 30,
    W = 600
  const spanW = W / n
  const top = 50,
    bot = 80
  const sup = Array.from({ length: n + 1 }, (_, i) => x0 + i * spanW)
  return (
    <Svg w={680} h={190} caption="Reinforcement (section along the main bars): blue straight bottom, dashed alternate cranked bars, top extras over supports." max={680}>
      <rect x={x0 - 8} y={top} width={W + 16} height={bot - top} fill={C.conc} stroke={C.ink} />
      {sup.map((x, i) => (
        <rect key={i} x={x - 8} y={bot} width={16} height={40} fill={C.conc} stroke={C.ink} />
      ))}
      <line x1={x0 - 4} y1={bot - 6} x2={x0 + W + 4} y2={bot - 6} stroke={C.steel} strokeWidth={2} />
      {Array.from({ length: n }, (_, j) => {
        const a = sup[j],
          b = sup[j + 1]
        const L = b - a
        const bendL = j === 0 ? L / 7 : L / 4
        const bendR = j === n - 1 ? L / 7 : L / 4
        return (
          <polyline
            key={j}
            points={`${a - (j === 0 ? 4 : L / 3)},${top + 6} ${a + bendL - 8},${top + 6} ${a + bendL + 8},${bot - 10} ${b - bendR - 8},${bot - 10} ${b - bendR + 8},${top + 6} ${b + (j === n - 1 ? 4 : L / 3)},${top + 6}`}
            fill="none"
            stroke={C.steel}
            strokeWidth={1.6}
            strokeDasharray="6 3"
          />
        )
      })}
      {r.supports.map((s, i) => {
        const x = sup[s.sec.at]
        const L = spanW
        return (
          <g key={i}>
            <line x1={x - (s.sec.at === 0 ? 0 : L / 3)} x2={x + (s.sec.at === n ? 0 : L / 3)} y1={top + 12} y2={top + 12} stroke={C.load} strokeWidth={2} />
            <text x={x} y={top - 8} textAnchor={s.sec.at === 0 ? 'start' : s.sec.at === n ? 'end' : 'middle'} fontSize={11}>
              {s.extra.n > 0 ? `${s.extra.n} #${r.bar} extra top` : 'cranked bars only'}
            </text>
          </g>
        )
      })}
      {r.spanBars.map((b, j) => (
        <text key={j} x={(sup[j] + sup[j + 1]) / 2} y={bot + 22} textAnchor="middle" fontSize={11}>
          #{r.bar} @ {f(b.s)}" bottom, alt. cranked
        </text>
      ))}
      <text x={x0} y={bot + 58} fontSize={11} fill={C.mute}>
        T&S: #{r.ts.bar} @ {f(r.ts.s)}" c/c perpendicular · h = {f(r.h)}" · clear cover ¾"
      </text>
    </Svg>
  )
}

// ---------------------------------------------------------------- two-way slab (moment coefficient method)
export function TwoWaySolution({ p, note }: { p: TwoWayInput; note?: string }) {
  const r = twoWay(p)
  const { geo } = r
  const steps: SolStep[] = [
    { t: 'Panel and case', tex: `l_a = ${f(r.geo.la)}\\text{ ft},\\ l_b = ${f(r.geo.lb)}\\text{ ft},\\ m = \\frac{l_a}{l_b} = ${f(r.m)}\\ (l_b/l_a = ${f(geo.ratio, 2)} < 2:\\ \\text{two-way})`, md: `${geo.nLong} long and ${geo.nShort} short edge(s) continuous → **Case ${r.case}**.` },
    { t: 'Thickness (αm > 2)', tex: `h = \\frac{l_n(0.8 + f_y/200{,}000)}{36 + 9\\beta} = \\frac{${f(geo.lb)}\\times12\\,(0.8 + ${f(p.fy / 200000, 2)})}{36 + 9(${f(r.th.beta)})} = ${f(r.th.raw, 2)}\\text{ in} \\Rightarrow h = ${f(r.h)}\\text{ in}`, md: `d = h − 1 = ${f(r.d.short)} in. (short way, lower layer); long way ${f(r.d.long)} in.` },
    { t: 'Loads', tex: `D = ${f(r.loads.D, 1)}\\text{ psf},\\ L = ${f(r.loads.L)}\\text{ psf}:\\quad w_{u,DL} = ${f(r.loads.wD, 1)},\\ w_{u,LL} = ${f(r.loads.wL, 1)},\\ w_u = ${f(r.loads.wu, 1)}\\text{ psf}` },
  ]
  const C3 = r.C
  const rows: ReactNode[][] = [
    ['Negative, continuous edge (Table 12.3, total load)', C3.aNeg !== null && r.M.aNeg !== null ? f(C3.aNeg, 4) : '—', r.M.aNeg !== null ? f(r.M.aNeg, 2) : '—', C3.bNeg !== null && r.M.bNeg !== null ? f(C3.bNeg, 4) : '—', r.M.bNeg !== null ? f(r.M.bNeg, 2) : '—'],
    ['Positive, DL (Table 12.4)', f(C3.aDL, 4), f(r.M.aPosDL, 2), f(C3.bDL, 4), f(r.M.bPosDL, 2)],
    ['Positive, LL (Table 12.5)', f(C3.aLL, 4), f(r.M.aPosLL, 2), f(C3.bLL, 4), f(r.M.bPosLL, 2)],
    ['Total positive', '', f(r.M.aPos, 2), '', f(r.M.bPos, 2)],
    ['Discontinuous edge = ⅓(+M)', '', r.M.aDisc !== null ? f(r.M.aDisc, 2) : '—', '', r.M.bDisc !== null ? f(r.M.bDisc, 2) : '—'],
  ]
  return (
    <Sol>
      <StepList steps={steps} />
      <SH>Middle-strip moments (k-ft/ft): M = C·w·l²</SH>
      <Tbl head={['Moment', 'Ca', 'Ma (short)', 'Cb', 'Mb (long)']} rows={rows} />
      <SH>Steel (per ft), As,min = 0.0018bh = {f(r.AsMin)} in²/ft, s ≤ 2h = {f(r.smax)} in.</SH>
      <Tbl head={['Location', 'Mu', 'd (in)', 'As req', 'As design']} rows={r.steel.map((s) => [s.label, f(s.Mu, 2), f(s.d), f(s.as.As), `${f(s.AsD)}${s.usesMin ? ' (min)' : ''}`])} />
      <Md>{[
        `- **Short direction, middle strip** (width $l_b/2 = ${f(r.strips.aMid, 1)}$ ft): #${r.bar} @ ${f(r.midA.s)} in. bottom, alternate bars cranked.`,
        `- **Long direction, middle strip** (width $l_a/2 = ${f(r.strips.bMid, 1)}$ ft): #${r.bar} @ ${f(r.midB.s)} in. bottom, alternate bars cranked.`,
        ...(['aNeg', 'aDisc', 'bNeg', 'bDisc'] as const)
          .filter((k) => r.extra[k])
          .map((k) => `- ${r.st[k]!.label}: need ${f(r.extra[k]!.need)} in² in ${f(r.extra[k]!.width)} in., cranked bar gives 0.11 → **${r.extra[k]!.n} #${r.bar} extra top**.`),
        `- **Column strips** (outer $l/4$): spacing $1.5s$ but ≤ As,min spacing and ≤ 2h → short way #${r.bar} @ ${f(r.col.a.s)} in., long way #${r.bar} @ ${f(r.col.b.s)} in.`,
        `- **Corner steel** at the exterior corner(s): As for the max positive moment = ${f(r.corner.As)} in²/ft → #${r.bar} @ ${f(r.corner.sp.s)} in. **top and bottom, both ways**, over $l_b/5 = ${f(r.corner.zone, 1)}$ ft (${ftin(r.corner.zone)}) from the corner.`,
        `- Bend points: $l/4$ from continuous edges, $l/7$ from discontinuous edges; top bars run $l/3$ past the support faces.`,
      ].join('\n')}</Md>
      <StepList
        start={steps.length + 1}
        steps={[
          { t: 'Depth check', tex: `d_{req} = ${f(r.depth.dreq, 2)}\\text{ in} \\le d = ${f(r.d.short)}\\text{ in}\\ ${r.depth.dreq <= r.d.short ? '\\checkmark' : '\\times'}` },
          { t: 'Shear (Table 12.6)', tex: `W_a = ${f(r.C.Wa, 3)},\\ W_b = ${f(r.C.Wb, 3)}:\\ \\text{long-edge beam } ${f(r.beams.wLongBeam, 2)}\\text{ k/ft},\\ \\text{short-edge beam } ${f(r.beams.wShortBeam, 2)}\\text{ k/ft};\\ \\phi V_c = ${f(r.shear.phiVc, 2)}\\text{ k/ft}\\ ${r.shear.ok ? '\\checkmark' : '\\times'}` },
        ]}
      />
      <TwoWaySketch r={r} />
      {note && <Md>{note}</Md>}
    </Sol>
  )
}

/** plan of the panel: middle strips, column strips, corner zone, bar labels */
export function TwoWaySketch({ r }: { r: TwoWayResult }) {
  const horiz = r.geo.horizLong
  const W = horiz ? 340 : Math.round((340 * r.geo.la) / r.geo.lb),
    H = horiz ? Math.round((340 * r.geo.la) / r.geo.lb) : 340
  const x0 = 60,
    y0 = 30
  const e = r.input.edges
  const corners = r.corner.corners
  const z = (r.corner.zone / r.geo.lb) * Math.max(W, H)
  const cx = (c: string) => (c === 'left' ? x0 : x0 + W - z)
  const cy = (c: string) => (c === 'top' ? y0 : y0 + H - z)
  return (
    <Svg w={x0 + W + 230} h={y0 + H + 50} caption={horiz ? 'Plan (long span horizontal). Shaded: middle strips; orange: corner zone.' : 'Plan (long span vertical). Shaded: middle strips; orange: corner zone.'} max={x0 + W + 230}>
      <rect x={x0} y={y0} width={W} height={H} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      <rect x={x0 + W / 4} y={y0} width={W / 2} height={H} fill={C.ten} opacity={0.08} />
      <rect x={x0} y={y0 + H / 4} width={W} height={H / 2} fill={C.ten} opacity={0.08} />
      {(['top', 'right', 'bottom', 'left'] as const).map((k) =>
        e[k] ? (
          <line
            key={k}
            x1={k === 'right' ? x0 + W : x0}
            x2={k === 'left' ? x0 : x0 + W}
            y1={k === 'bottom' ? y0 + H : y0}
            y2={k === 'top' ? y0 : y0 + H}
            stroke={C.ink}
            strokeWidth={5}
            opacity={0.5}
          />
        ) : null,
      )}
      {corners.map(([a, b], i) => {
        const [v, h] = a === 'top' || a === 'bottom' ? [a, b] : [b, a]
        return <rect key={i} x={cx(h)} y={cy(v)} width={z} height={z} fill={C.load} opacity={0.25} stroke={C.load} />
      })}
      <text x={x0 + W / 2} y={y0 + H / 2 + 5} textAnchor="middle" fontWeight={700}>
        Case {r.case}
      </text>
      <DimH x1={x0} x2={x0 + W} y={y0 + H + 22} label={`${f(horiz ? r.geo.lb : r.geo.la)} ft`} below />
      <DimV x={x0 - 18} y1={y0} y2={y0 + H} label={`${f(horiz ? r.geo.la : r.geo.lb)} ft`} left />
      <g fontSize={11}>
        <text x={x0 + W + 16} y={y0 + 12}>
          Short way: #{r.bar} @ {f(r.midA.s)}" (mid), @ {f(r.col.a.s)}" (col)
        </text>
        <text x={x0 + W + 16} y={y0 + 28}>
          Long way: #{r.bar} @ {f(r.midB.s)}" (mid), @ {f(r.col.b.s)}" (col)
        </text>
        <text x={x0 + W + 16} y={y0 + 44}>
          alternate bars cranked, extra top at edges
        </text>
        <text x={x0 + W + 16} y={y0 + 60}>
          thick edge = continuous
        </text>
        <text x={x0 + W + 16} y={y0 + 76}>
          corner: #{r.bar} @ {f(r.corner.sp.s)}" T & B, {ftin(r.corner.zone)} each way
        </text>
        <text x={x0 + W + 16} y={y0 + 92}>
          h = {f(r.h)}" , clear cover ¾"
        </text>
      </g>
    </Svg>
  )
}

// ---------------------------------------------------------------- ready-made checks + solutions per template
export const RatioChecks = (fc: number, fy: number): Check[] => {
  const L = limits(fc, fy)
  const row = (key: string, label: string, v: number): Check => ({ key, label: `${label} (enter ×1000)`, value: v * 1000, tol: 0.01 })
  return [row('rb', '$\\rho_b$', L.rhoB), row('rmax', '$\\rho_{max} = \\rho_{0.004}$', L.rhoMax), row('r005', '$\\rho_{0.005}$', L.rho005), row('rmin', '$\\rho_{min}$', L.rhoMin)]
}
export function RatioSolution({ fc, fy }: { fc: number; fy: number }) {
  const L = limits(fc, fy)
  return (
    <Sol>
      <Md>{`$\\varepsilon_y = f_y/E_s = ${f(L.epsY, 5)}$, $\\varepsilon_u = 0.003$. All ratios come from the strain diagram with the steel strain set to $\\varepsilon_y$, 0.004 and 0.005.`}</Md>
      <StepList steps={L.steps} />
      <Result>{`$\\rho_b = ${f(L.rhoB, 4)}$, $\\rho_{max} = ${f(L.rhoMax, 4)}$, $\\rho_{0.005} = ${f(L.rho005, 4)}$, $\\rho_{min} = ${f(L.rhoMin, 5)}$.`}</Result>
    </Sol>
  )
}

export const DoublyDesignChecks = (p: DoublyDesignIn): Check[] => {
  const dd = designDoubly(p)
  const out: Check[] = [{ key: 'm1', label: 'Max singly $\\phi M_{n1}$ (εt = 0.005)', value: dd.sm.phiMn1, unit: 'k-ft' }]
  if (dd.needed) out.push({ key: 'asp', label: "Compression steel $A'_s$", value: dd.Asp, unit: 'in²', tol: 0.03 })
  out.push({ key: 'as', label: 'Total tension steel $A_s$', value: dd.As, unit: 'in²', tol: 0.03 })
  return out
}
export function DoublyDesignSolution({ p }: { p: DoublyDesignIn }) {
  const { dd, steps } = doublyDesign(p)
  return (
    <Sol>
      <StepList steps={steps} />
      <Result>{dd.needed && dd.comp ? `**Tension:** ${dd.tension.n} #${dd.tension.no} (${f(dd.tension.A)} in², ${dd.tension.layers} layers) · **Compression:** ${dd.comp.n} #${dd.comp.no} (${f(dd.comp.A)} in²) · check $\\phi M_n = ${f(dd.review.phiMn, 1)}$ k-ft ≥ $M_u$.` : `Singly reinforced: ${dd.tension.n} #${dd.tension.no}.`}</Result>
      <Md>{`Some solutions subtract the displaced concrete ($f'_s - 0.85f'_c$) when sizing $A'_s$; it raises $A'_s$ by a few per cent.`}</Md>
    </Sol>
  )
}

export const DoublyReviewChecks = (p: DoublyReviewIn): Check[] => {
  const r = reviewDoubly(p)
  return [
    { key: 'c', label: 'Neutral axis $c$', value: r.c, unit: 'in' },
    { key: 'fsp', label: "Compression-steel stress $f'_s$", value: r.fsp, unit: 'ksi' },
    { key: 'Mn', label: '$M_n$', value: r.MnFt, unit: 'k-ft' },
    { key: 'phiMn', label: '$\\phi M_n$', value: r.phiMn, unit: 'k-ft' },
  ]
}
export function DoublyReviewSolution({ p }: { p: DoublyReviewIn }) {
  const { r, steps } = doublyReview(p)
  return (
    <Sol>
      <StepList steps={steps} />
      <Result>{`$M_n = ${f(r.MnFt, 1)}$ k-ft, $\\phi M_n = ${f(r.phiMn, 1)}$ k-ft. Compression steel ${r.compYields ? '**yields**' : `does **not** yield ($f'_s = ${f(r.fsp, 1)}$ ksi)`}; $\\varepsilon_t = ${f(r.epsT, 4)}$ (${r.zone === 'tension' ? 'tension-controlled' : r.zone === 'transition' ? 'transition zone' : 'compression-controlled'}).`}</Result>
    </Sol>
  )
}

export const SinglyLoadChecks = (load: LoadInput, b: number, d: number, fc: number, fy: number): Check[] => {
  const { bl, da } = singlyLoadDesign(load, b, d, fc, fy)
  return [
    { key: 'wu', label: 'Factored load $w_u$', value: bl.wu, unit: 'k/ft' },
    { key: 'Mu', label: '$M_u$', value: bl.Mu, unit: 'k-ft' },
    { key: 'As', label: 'Required $A_s$', value: da.As, unit: 'in²', tol: 0.03 },
  ]
}
export function SinglyLoadSolution({ load, b, d, fc, fy, dNote }: { load: LoadInput; b: number; d: number; fc: number; fy: number; dNote?: string }) {
  const { bl, da, bars, rv } = singlyLoadDesign(load, b, d, fc, fy)
  return (
    <Sol>
      <StepList steps={bl.steps} />
      {dNote && <Md>{dNote}</Md>}
      <StepList start={bl.steps.length + 1} steps={da.steps} />
      <StepList
        start={bl.steps.length + da.steps.length + 1}
        steps={[
          { t: 'Choose bars', tex: `${bars.n}\\ \\#${bars.bar} = ${f(bars.As)}\\text{ in}^2\\ (\\text{one layer needs } b \\ge ${f(bars.bmin, 1)}\\text{ in}\\ ${bars.fits ? '\\le' : '>'}\\ ${f(b)})` },
          { t: 'Check the section provided', tex: `a = ${f(rv.a)}\\text{ in},\\ \\varepsilon_t = ${f(rv.epsT, 5)}\\ (\\phi = ${f(rv.phi)}),\\ \\phi M_n = ${f(rv.phiMn, 1)}\\text{ k-ft}\\ ${rv.phiMn >= bl.Mu ? '\\ge' : '<'}\\ M_u = ${f(bl.Mu, 1)}`, md: `$A_{s,min} = ${f(rv.AsMin)}$ in² ${rv.minOk ? '≤' : '>'} $A_s$ ✓; $\\rho = ${f(rv.rho, 4)}$ ${rv.maxOk ? '≤' : '>'} $\\rho_{max} = ${f(rv.lim.rhoMax, 4)}$ ${rv.maxOk ? '✓' : '✗'}` },
        ]}
      />
      <Result>{`Provide **${bars.n} #${bars.bar}** ($A_s = ${f(bars.As)}$ in²) in one layer; tension-controlled ($\\varepsilon_t = ${f(rv.epsT, 4)}$), $\\rho_{min} \\le \\rho \\le \\rho_{max}$.`}</Result>
    </Sol>
  )
}

export const TDesignChecks = (beff: BeffIn, Mu: number, d: number, fc: number, fy: number): Check[] => {
  const { bf, t } = tDesign(beff, Mu, d, fc, fy)
  return [
    { key: 'b', label: 'Effective flange width', value: bf.b, unit: 'in' },
    { key: 'As', label: 'Required $A_s$', value: t.As, unit: 'in²', tol: 0.03 },
    { key: 'et', label: '$\\varepsilon_t$ of the designed section', value: t.epsT, tol: 0.05 },
  ]
}
export function TDesignSolution({ beff, Mu, d, fc, fy }: { beff: BeffIn; Mu: number; d: number; fc: number; fy: number }) {
  const { t, bars, steps } = tDesign(beff, Mu, d, fc, fy)
  return (
    <Sol>
      <StepList steps={steps} />
      <Result>{`$A_s = ${f(t.As)}$ in² → **${bars.n} #${bars.no}** (${f(bars.A)} in²); ${t.rect ? 'rectangular behaviour' : 'true T-section'}, $\\varepsilon_t = ${f(t.epsT, 4)}$ ${t.epsT >= 0.005 ? '≥ 0.005: tension-controlled, φ = 0.9 ✓' : `(φ = ${f(t.phi)})`}.`}</Result>
    </Sol>
  )
}

export const TReviewChecks = (beff: BeffIn, d: number, As: number, fc: number, fy: number): Check[] => {
  const { bf, r } = tReview(beff, d, As, fc, fy)
  return [
    { key: 'b', label: 'Effective flange width', value: bf.b, unit: 'in' },
    { key: 'a', label: 'Depth of stress block $a$', value: r.a, unit: 'in' },
    { key: 'Mn', label: '$M_n$', value: r.Mn / 12, unit: 'k-ft' },
    { key: 'phiMn', label: '$\\phi M_n$', value: r.phiMn, unit: 'k-ft' },
  ]
}
export function TReviewSolution({ beff, d, As, fc, fy, bars }: { beff: BeffIn; d: number; As: number; fc: number; fy: number; bars: string }) {
  const { r, steps } = tReview(beff, d, As, fc, fy)
  return (
    <Sol>
      <Md>{`Positive moment at midspan: the slab is in compression, so the section acts as a T-beam. $A_s$ = ${bars} = ${f(As)} in².`}</Md>
      <StepList steps={steps} />
      <Result>{`$M_n = ${f(r.Mn / 12, 1)}$ k-ft, $\\phi M_n = ${f(r.phiMn, 1)}$ k-ft; $\\varepsilon_t = ${f(r.epsT, 4)}$ — ${r.zone === 'tension' ? 'tension-controlled' : r.zone}.`}</Result>
    </Sol>
  )
}

export const NegChecks = (bw: number, d: number, dt: number, As: number, fc: number, fy: number): Check[] => {
  const r = reviewRect(bw, d, dt, As, fc, fy)
  return [
    { key: 'a', label: 'Stress-block depth $a$', value: r.a, unit: 'in' },
    { key: 'et', label: '$\\varepsilon_t$', value: r.epsT, tol: 0.03 },
    { key: 'Mn', label: '$M_n$', value: r.Mn / 12, unit: 'k-ft' },
    { key: 'phiMn', label: '$\\phi M_n$', value: r.phiMn, unit: 'k-ft' },
  ]
}
export function NegSolution({ bw, d, dt, As, fc, fy, bars }: { bw: number; d: number; dt: number; As: number; fc: number; fy: number; bars: string }) {
  const { r, steps } = negReview(bw, d, dt, As, fc, fy)
  return (
    <Sol>
      <Md>{`$A_s$ = ${bars} = ${f(As)} in², $\\beta_1 = ${f(r.b1, 3)}$.`}</Md>
      <StepList steps={steps} />
      <Result>{`Negative capacity: $M_n = ${f(r.Mn / 12, 1)}$ k-ft, $\\phi M_n = ${f(r.phiMn, 1)}$ k-ft; $\\varepsilon_t = ${f(r.epsT, 4)}$ (${r.zone === 'tension' ? 'tension-controlled' : r.zone === 'transition' ? 'transition zone' : 'compression-controlled'}); $A_s \\ge A_{s,min}$ ✓.`}</Result>
    </Sol>
  )
}

export const ShearChecks = (bm: ShearBeam, sec: ShearSection): Check[] => {
  const { run, lim, rows } = shearCase(bm, sec)
  return [
    { key: 'Vd', label: '$V_u$ at d from the support', value: run.Vd, unit: 'k' },
    { key: 'phiVc', label: '$\\phi V_c$', value: lim.phiVc, unit: 'k' },
    { key: 's', label: 'Required spacing at d (#3 two-legged)', value: rows[0].a.s, unit: 'in', tol: 0.03 },
  ]
}

export const OneWayChecks = (p: OneWayCoefInput): Check[] => {
  const r = oneWayCoef(p)
  const big = r.sections.reduce((m, s) => (s.Mu > m.Mu ? s : m), r.sections[0])
  return [
    { key: 'h', label: 'Slab thickness h', value: r.h, unit: 'in' },
    { key: 'wu', label: 'Factored load $w_u$', value: r.loads.wu, unit: 'psf' },
    { key: 'Mu', label: `Largest moment (${big.label})`, value: big.Mu, unit: 'k-ft/ft' },
    { key: 'As', label: `$A_s$ there`, value: big.AsD, unit: 'in²/ft', tol: 0.03 },
  ]
}
export const TwoWayChecks = (p: TwoWayInput): Check[] => {
  const r = twoWay(p)
  const out: Check[] = [
    { key: 'h', label: 'Slab thickness h', value: r.h, unit: 'in' },
    { key: 'wu', label: 'Factored load $w_u$', value: r.loads.wu, unit: 'psf' },
    { key: 'Map', label: 'Short-direction positive moment $M_{a,pos}$', value: r.M.aPos, unit: 'k-ft/ft' },
  ]
  if (r.M.aNeg !== null) out.push({ key: 'Man', label: 'Short-direction negative moment $M_{a,neg}$', value: r.M.aNeg, unit: 'k-ft/ft' })
  return out
}

// ---------------------------------------------------------------- more theory sketches
/** φ vs net tensile strain εt (Grade 60) */
export function PhiChart() {
  const x0 = 60,
    y0 = 20,
    W = 460,
    H = 180
  const sx = (e: number) => x0 + (e / 0.008) * W
  const sy = (p: number) => y0 + H - ((p - 0.5) / 0.5) * H
  const ey = 0.00207
  return (
    <Svg w={600} h={260} caption="ACI/BNBC strength reduction factor for flexure vs εt (Grade 60)." max={600}>
      <line x1={x0} y1={y0 + H} x2={x0 + W} y2={y0 + H} stroke={C.ink} />
      <line x1={x0} y1={y0} x2={x0} y2={y0 + H} stroke={C.ink} />
      <polyline points={`${sx(0)},${sy(0.65)} ${sx(ey)},${sy(0.65)} ${sx(0.005)},${sy(0.9)} ${sx(0.008)},${sy(0.9)}`} fill="none" stroke={C.ten} strokeWidth={2.2} />
      <polyline points={`${sx(0)},${sy(0.75)} ${sx(ey)},${sy(0.75)} ${sx(0.005)},${sy(0.9)}`} fill="none" stroke={C.ten} strokeWidth={1.2} strokeDasharray="5 3" />
      {[ey, 0.004, 0.005].map((e) => (
        <line key={e} x1={sx(e)} x2={sx(e)} y1={y0} y2={y0 + H} stroke={C.mute} strokeDasharray="3 3" />
      ))}
      {[0.65, 0.75, 0.9].map((p) => (
        <text key={p} x={x0 - 6} y={sy(p) + 4} textAnchor="end" fontSize={11}>
          {p.toFixed(2)}
        </text>
      ))}
      <text x={sx(ey)} y={y0 + H + 16} textAnchor="middle" fontSize={11}>
        εy = 0.002
      </text>
      <text x={sx(0.004)} y={y0 + H + 30} textAnchor="middle" fontSize={11}>
        0.004 (ρmax)
      </text>
      <text x={sx(0.005)} y={y0 + H + 16} textAnchor="middle" fontSize={11}>
        0.005
      </text>
      <text x={x0 + W} y={y0 + H + 16} textAnchor="end" fontSize={11}>
        εt
      </text>
      <text x={sx(0.001)} y={y0 + 16} textAnchor="middle" fontSize={11} fill={C.mute}>
        compression-controlled
      </text>
      <text x={sx(0.0035)} y={y0 + 16} textAnchor="middle" fontSize={11} fill={C.mute}>
        transition
      </text>
      <text x={sx(0.0065)} y={y0 + 16} textAnchor="middle" fontSize={11} fill={C.mute}>
        tension-controlled
      </text>
      <text x={sx(0.0034)} y={sy(0.78) + 18} fontSize={11}>
        φ = 0.483 + 83.3εt
      </text>
      <text x={sx(0.0003)} y={sy(0.75) - 6} fontSize={11} fill={C.mute}>
        spiral (dashed)
      </text>
      <text x={14} y={y0 + H / 2} fontSize={12} transform={`rotate(-90 14 ${y0 + H / 2})`} textAnchor="middle">
        φ
      </text>
    </Svg>
  )
}

/** five floor systems in plan (and a small section) */
export function FloorSystemsSketch() {
  const box = (i: number, title: string, body: ReactNode) => {
    const x = 10 + (i % 3) * 205,
      y = 10 + Math.floor(i / 3) * 175
    return (
      <g key={i} transform={`translate(${x} ${y})`}>
        <rect x={0} y={0} width={190} height={150} fill="none" stroke={C.faint} />
        <text x={95} y={146} textAnchor="middle" fontSize={11} fontWeight={700}>
          {title}
        </text>
        {body}
      </g>
    )
  }
  const cols = (pts: [number, number][], s = 8) => pts.map(([x, y], k) => <rect key={k} x={x - s / 2} y={y - s / 2} width={s} height={s} fill={C.steel} />)
  const grid: [number, number][] = [20, 95, 170].flatMap((x) => [20, 70, 120].map((y) => [x, y] as [number, number]))
  return (
    <Svg w={630} h={360} caption="Plans: grey = slab, thick lines = beams, black squares = columns." max={630}>
      {box(0, '1. One-way slab on beams', (
        <g>
          <rect x={20} y={20} width={150} height={100} fill={C.conc} />
          {[20, 45, 70, 95, 120].map((y) => (
            <line key={y} x1={20} x2={170} y1={y} y2={y} stroke={C.ink} strokeWidth={3} />
          ))}
          {[20, 170].map((x) => (
            <line key={x} x1={x} x2={x} y1={20} y2={120} stroke={C.ink} strokeWidth={4} />
          ))}
          {cols([[20, 20], [170, 20], [20, 120], [170, 120]])}
        </g>
      ))}
      {box(1, '2. Two-way slab with beams', (
        <g>
          <rect x={20} y={20} width={150} height={100} fill={C.conc} />
          {[20, 70, 120].map((y) => (
            <line key={y} x1={20} x2={170} y1={y} y2={y} stroke={C.ink} strokeWidth={3} />
          ))}
          {[20, 95, 170].map((x) => (
            <line key={x} x1={x} x2={x} y1={20} y2={120} stroke={C.ink} strokeWidth={3} />
          ))}
          {cols(grid)}
        </g>
      ))}
      {box(2, '3. Flat plate', (
        <g>
          <rect x={20} y={20} width={150} height={100} fill={C.conc} />
          {cols(grid)}
        </g>
      ))}
      {box(3, '4. Flat slab (drop panels)', (
        <g>
          <rect x={20} y={20} width={150} height={100} fill={C.conc} />
          {grid.map(([x, y], k) => (
            <rect key={k} x={x - 14} y={y - 14} width={28} height={28} fill="none" stroke={C.ink} strokeDasharray="3 2" />
          ))}
          {cols(grid)}
        </g>
      ))}
      {box(4, '5. Ribbed / waffle slab', (
        <g>
          <rect x={20} y={20} width={150} height={100} fill={C.conc} />
          {Array.from({ length: 9 }, (_, k) => 20 + k * 18.75).map((x) => (
            <line key={x} x1={x} x2={x} y1={20} y2={120} stroke={C.ink} strokeWidth={1.5} />
          ))}
          {Array.from({ length: 6 }, (_, k) => 20 + k * 20).map((y) => (
            <line key={y} x1={20} x2={170} y1={y} y2={y} stroke={C.ink} strokeWidth={1.5} />
          ))}
          {cols([[20, 20], [170, 20], [20, 120], [170, 120]])}
        </g>
      ))}
      {box(5, 'Sections', (
        <g fontSize={10}>
          <path d="M 15 30 L 175 30 L 175 38 L 105 38 L 105 60 L 85 60 L 85 38 L 15 38 Z" fill={C.conc} stroke={C.ink} />
          <text x={95} y={74} textAnchor="middle">
            beam-slab
          </text>
          <path d="M 15 92 L 175 92 L 175 100 L 15 100 Z" fill={C.conc} stroke={C.ink} />
          <rect x={80} y={100} width={30} height={7} fill={C.conc} stroke={C.ink} />
          <rect x={88} y={107} width={14} height={18} fill={C.steel} />
          <text x={140} y={120} textAnchor="middle">
            flat slab + drop
          </text>
        </g>
      ))}
    </Svg>
  )
}

// ---------------------------------------------------------------- one-way slab with cantilevers (statics + LL patterns)
export const CantSlabChecks = (p: CantSlabInput): Check[] => {
  const r = cantSlab(p)
  return [
    { key: 'h', label: 'Slab thickness h', value: r.h, unit: 'in' },
    { key: 'wu', label: 'Factored load $w_u$', value: r.loads.wu, unit: 'psf' },
    { key: 'Mn', label: 'Max negative moment (at the support face)', value: r.Mneg, unit: 'k-ft/ft' },
    { key: 'Mp', label: 'Max positive moment (LL on the span only)', value: r.Mpos, unit: 'k-ft/ft' },
  ]
}
export function CantSlabSolution({ p }: { p: CantSlabInput }) {
  const r = cantSlab(p)
  const g = r.geo
  const steps: SolStep[] = [
    { t: 'Thickness', tex: `\\text{span: } \\frac{l}{${r.spanRule === 'both' ? 28 : r.spanRule === 'one' ? 24 : 20}} = ${f(r.hSpan, 2)}\\text{ in},\\quad \\text{cantilever: } \\frac{l}{10} = \\frac{${f(Math.max(p.cantL, p.cantR))}\\times12}{10} = ${f(r.hCant, 2)}\\text{ in} \\Rightarrow h = ${f(r.h)}\\text{ in},\\ d = ${f(r.d)}\\text{ in}` },
    { t: 'Loads', tex: `D = ${f(r.h)}/12(150) + ${f(p.ff ?? 0)} + ${f(p.pw ?? 0)} = ${f(r.loads.D, 1)}\\text{ psf},\\quad w_{u} = 1.2(${f(r.loads.D, 1)}) + 1.6(${f(r.loads.L)}) = ${f(r.loads.wu, 1)}\\text{ psf},\\quad 1.2D = ${f(r.loads.wD, 1)}\\text{ psf}` },
    { t: 'Geometry', tex: `L_{c/c} = ${f(p.span)} + ${f(p.support / 12, 2)} = ${f(g.L, 2)}\\text{ ft},\\quad a_{cant} = ${f(Math.max(p.cantL, p.cantR))} + ${f(p.support / 24, 2)} = ${f(Math.max(g.acL, g.acR), 2)}\\text{ ft (to the support centre)}` },
    { t: 'Max negative moment — LL on the cantilevers', tex: `M_u^- = \\frac{w_ua^2}{2} = \\frac{${f(r.loads.wuk, 3)}(${f(Math.max(p.cantL, p.cantR))})^2}{2} = ${f(r.Mneg, 2)}\\text{ k-ft/ft}`, md: 'Taken at the support face. LL on the span does not change it.' },
    {
      t: 'Max positive moment — LL on the span only (cantilevers carry 1.2D)',
      tex: `M_u^+ = \\frac{w_uL^2}{8} - \\frac{(1.2D)a^2}{2} = ${f(r.simple, 2)} - ${f(r.reliefSym, 2)} = ${f(r.Mpos, 2)}\\text{ k-ft/ft}`,
      md: 'Loading the cantilevers would relieve the span moment, so the critical pattern leaves them with dead load only.',
    },
    { t: 'Uplift pattern (LL on cantilevers only)', tex: `M_{mid} = ${f(r.uplift.Mmid, 2)}\\text{ k-ft/ft}`, md: r.uplift.negThrough ? 'Negative all along the span → run top bars through the whole span.' : `Small sagging at midspan; the hogging region from each support reaches about ${f(r.topExt, 2)} ft (≥ ln/3 and ≥ cantilever length) — top bars extend at least that far.` },
    { t: 'Depth check', tex: `d_{req} = ${f(r.depth.dreq, 2)}\\text{ in} \\le d = ${f(r.d)}\\text{ in}\\ \\checkmark` },
    { t: 'Steel', tex: `A_s^+ = ${f(r.asPos.As)},\\quad A_s^- = ${f(r.asNeg.As)},\\quad A_{s,min} = 0.0018(12)(${f(r.h)}) = ${f(r.AsMin)}\\text{ in}^2/\\text{ft}`, md: 'As by iterating $A_s = M_u/[0.9f_y(d - a/2)]$, $a = A_sf_y/(0.85f\'_c b)$ from $a = 0.5$ in.' },
  ]
  return (
    <Sol>
      <StepList steps={steps} />
      <Md>{[
        `- **Bottom (span):** #${r.bar} @ ${f(r.pos.s)} in. c/c, alternate bars cranked up over the supports into the cantilevers.`,
        `- **Top at the supports / cantilevers:** need ${f(r.AsNegD)} in²/ft; in ${f(r.extra.width)} in. one cranked bar gives ${f(r.extra.cranked)} in² → **${r.extra.n} #${r.bar} extra top** between them (straight-bar option: #${r.bar} @ ${f(r.straight.s)} in. top). Top bars run to the free end of the cantilever and ${f(r.topExt, 2)} ft into the span.`,
        `- **T&S bars:** #${r.ts.bar} @ ${f(r.ts.s)} in. c/c perpendicular to the main bars (both faces of the cantilever top layer).`,
      ].join('\n')}</Md>
      <StepList
        start={steps.length + 1}
        steps={[{ t: 'Shear', tex: `V_{u,cant}(d) = ${f(r.shear.Vcant, 2)},\\ V_{u,span} \\approx \\frac{w_uL}{2} + \\frac{M^-}{L} = ${f(r.shear.Vspan, 2)}\\text{ k/ft} \\le \\phi V_c = ${f(r.shear.phiVc, 2)}\\text{ k/ft}\\ ${r.shear.ok ? '\\checkmark' : '\\times'}` }]}
      />
      <Result>{`h = ${f(r.h)} in.; bottom #${r.bar} @ ${f(r.pos.s)} in. (alt. cranked); ${r.extra.n} #${r.bar} extra top over each support; T&S #${r.ts.bar} @ ${f(r.ts.s)} in.`}</Result>
    </Sol>
  )
}

// ---------------------------------------------------------------- singly design with b and ρ given (d from ρ)
export function singlyRho(load: LoadInput, b: number, frac: number, fc: number, fy: number) {
  const bl = beamLoads(load)
  const L = limits(fc, fy)
  const rho = frac * L.rhoMax
  let ds = designSection(bl.Mu, fc, fy, rho, { b, layers: 1 })
  let bars = sgPickBars(ds.As, b)
  if (bars.layers !== 1) {
    ds = designSection(bl.Mu, fc, fy, rho, { b, layers: 2 })
    bars = sgPickBars(ds.As, b)
  }
  const two = bars.layers !== 1
  const da = designAs(bl.Mu, b, ds.dAct, fc, fy, ds.dAct + (two ? 1 : 0))
  bars = sgPickBars(da.As, b)
  const layers = two ? [{ As: bars.As / 2, d: ds.dAct + 1 }, { As: bars.As / 2, d: ds.dAct - 1 }] : [{ As: bars.As, d: ds.dAct }]
  const rv = sgReview({ b, fc, fy, layers })
  return { bl, L, rho, ds, da, bars, two, rv }
}
export const SinglyRhoChecks = (load: LoadInput, b: number, frac: number, fc: number, fy: number): Check[] => {
  const x = singlyRho(load, b, frac, fc, fy)
  return [
    { key: 'Mu', label: '$M_u$', value: x.bl.Mu, unit: 'k-ft' },
    { key: 'rho', label: 'Design ρ = 0.6ρmax (enter ×1000)', value: x.rho * 1000, tol: 0.01 },
    { key: 'd', label: 'Required d', value: x.ds.d, unit: 'in' },
    { key: 'As', label: '$A_s$ (at the required d)', value: x.ds.As, unit: 'in²', tol: 0.03 },
  ]
}
export function SinglyRhoSolution({ load, b, frac, fc, fy }: { load: LoadInput; b: number; frac: number; fc: number; fy: number }) {
  const x = singlyRho(load, b, frac, fc, fy)
  const steps: SolStep[] = [...x.bl.steps, { t: 'Design steel ratio', tex: `\\rho_{max} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.007} = ${f(x.L.rhoMax, 5)},\\quad \\rho = ${f(frac)}\\rho_{max} = ${f(x.rho, 5)}` }, ...x.ds.steps]
  return (
    <Sol>
      <StepList steps={steps} />
      <StepList
        start={steps.length + 1}
        steps={[
          { t: 'Steel for the final section', tex: `d = ${f(x.ds.dAct)}\\text{ in}:\\ A_s = ${f(x.da.As)}\\text{ in}^2 \\to ${x.bars.n}\\ \\#${x.bars.bar} = ${f(x.bars.As)}\\text{ in}^2\\ (${x.two ? 'two layers' : 'one layer'})`, md: x.two ? `The bars do not fit in one layer of a ${f(b)} in. web, so two layers: $h = d + 3.5$ in.` : undefined },
          { t: 'Check', tex: `\\varepsilon_t = ${f(x.rv.epsT, 5)}\\ (\\phi = ${f(x.rv.phi)}),\\quad \\phi M_n = ${f(x.rv.phiMn, 1)}\\text{ k-ft}\\ ${x.rv.phiMn >= x.bl.Mu ? '\\ge' : '<'}\\ M_u = ${f(x.bl.Mu, 1)}` },
        ]}
      />
      <Result>{`Section **${f(b)} in. × ${f(x.ds.h)} in.** ($d = ${f(x.ds.dAct)}$ in.), **${x.bars.n} #${x.bars.bar}** ${x.two ? 'in two layers' : ''}. The deep section is the price of the narrow 12 in. width and the low ρ.`}</Result>
    </Sol>
  )
}

// ============================================================== 2023-24 paper
const PAPER = '2023-24' as const
const Q1B = `Simply supported beam, span 20 ft, $b = 14$ in., $d = 18.5$ in., $h = 21$ in.; $f'_c = 6.0$ ksi, $f_y = 60$ ksi; modulus of rupture $f_r = 581$ psi; $E_c = 4415$ ksi, $E_s = 29000$ ksi; tension steel four No. 8 bars; assume $n = 7$.`
const E1: ElasticInput = { b: 14, h: 21, d: 18.5, As: 3.16, fc: 6000, fy: 60000, n: 7, frPsi: 581, EcPsi: 4415000 }
const Fig1b = () => <RectSection b={14} d={18.5} h={21} bar={8} rows={[4]} botText="Four No. 8 bars" showH given={["f'c = 6.0 ksi, fy = 60 ksi", 'n = 7, fr = 581 psi']} />
const SS3a: LoadInput = { span: 25, support: 'ss', b: 12, h: 25, sdl: 1, ll: 2 }
const D2c: DoublyDesignIn = { b: 16, d: 26, dt: 27.5, dp: 2.5, fc: 5, fy: 60, Mu: 1200 }
const R3b: DoublyReviewIn = { b: 14, d: 21, dt: 22.5, dp: 2.5, As: 6.32, Asp: 2.37, fc: 5, fy: 72.5 }
const T4a: BeffIn = { kind: 'interior', L: 24, bw: 10, hf: 3, cc: 48 }
const SB5c: ShearBeam = { kind: 'ss', L: 35, wD: 2, P: [{ x: 10, P: 40 }, { x: 25, P: 40 }], factored: true, selfWeight: { b: 14, h: 28 } }
const SS5c: ShearSection = { bw: 14, d: 25, fc: 3500, fy: 60000 }
const OW7a: OneWayCoefInput = { spans: [16, 16], ends: ['spandrel', 'spandrel'], ll: 80, ff: 30, pw: 50, fc: 3000, fy: 60000 }
const TW8a: TwoWayInput = { lx: 28, ly: 23, edges: { top: true, right: true, bottom: false, left: false }, ll: 40, ff: 25, pw: 50, fc: 3500, fy: 60000 }

export const R2023: RcQ[] = [
  {
    id: 'rc-2023-24-1a',
    paper: PAPER,
    sec: 'A',
    no: '1(a)',
    marks: 7,
    topics: ['rc-elastic'],
    title: 'Beam behaviour under increasing load: uncracked, cracked, ultimate',
    text: 'Discuss the behaviour of an RC rectangular beam in flexure under increasing load by drawing neat sketches of the strain and stress distributions for the **uncracked**, **cracked** and **ultimate** conditions.',
    pages: [2],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.stages} fig={<StagesSketch />} />,
  },
  {
    id: 'rc-2023-24-1b-i',
    paper: PAPER,
    sec: 'A',
    no: '1(b)(i)',
    marks: 8,
    topics: ['rc-elastic'],
    title: 'Cracking moment Mcr (14 × 21 in., 4 #8, f′c = 6 ksi)',
    text: `${Q1B}\n\n(i) Determine the cracking moment $M_{cr}$.`,
    pages: [2],
    given: [],
    figure: Fig1b,
    checks: () => {
      const u = uncracked(E1)
      return [
        { key: 'yb', label: 'Neutral axis $\\bar y$ from the top (transformed)', value: u.ybar, unit: 'in' },
        { key: 'I', label: '$I_{ut}$ (uncracked transformed)', value: u.I, unit: 'in⁴' },
        { key: 'Mcr', label: '$M_{cr}$ (transformed section)', value: u.Mcr, unit: 'k-ft' },
        { key: 'McrG', label: '$M_{cr}$ (gross section, steel ignored)', value: u.McrG, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const u = uncracked(E1)
      return (
        <Sol>
          <StepList steps={u.steps.slice(0, 6)} />
          <Result>{`$M_{cr} = ${f(u.Mcr, 1)}$ k-ft with the uncracked transformed section ($${f(u.McrG, 1)}$ k-ft on the gross section, $f_r bh^2/6$). Either is accepted if stated.`}</Result>
        </Sol>
      )
    },
    notes: ['The paper gives n = 7, so the uncracked transformed section can be used; many solutions use the gross section (simpler). Show which one you use.', 'The 20 ft span is not needed in any part.'],
  },
  {
    id: 'rc-2023-24-1b-ii',
    paper: PAPER,
    sec: 'A',
    no: '1(b)(ii)',
    marks: 4,
    topics: ['rc-elastic'],
    title: 'Steel stress and strain just before cracking',
    text: `${Q1B}\n\n(ii) Determine the steel stress and strain just before cracking.`,
    pages: [2],
    given: [],
    figure: Fig1b,
    checks: () => {
      const u = uncracked(E1)
      return [
        { key: 'fs', label: 'Steel stress $f_s$ at $M_{cr}$', value: u.fsCr, unit: 'ksi' },
        { key: 'es', label: 'Steel strain $\\varepsilon_s \\times 10^6$', value: u.epsSCr * 1e6, unit: 'με' },
      ]
    },
    solution: () => {
      const u = uncracked(E1)
      return (
        <Sol>
          <Md>{`Just before cracking the bottom fibre is at $f_r$ and the section is uncracked; the steel strain equals the concrete strain at its level, so $f_s = n f_c$ there (linear stress from the NA).`}</Md>
          <StepList steps={[...u.steps.slice(3, 4), u.steps[6]]} />
          <Result>{`$f_s = ${f(u.fsCr, 2)}$ ksi, $\\varepsilon_s = ${f(u.epsSCr)}$ — tiny compared with $f_y$: before cracking the steel does almost nothing.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2023-24-1b-iii',
    paper: PAPER,
    sec: 'A',
    no: '1(b)(iii)',
    marks: 8,
    topics: ['rc-elastic'],
    title: 'Allowable service moment (0.45 f′c, 0.4 fy) — cracked section',
    text: `${Q1B}\n\n(iii) Find the maximum service-load moment that can be resisted without stressing the concrete above $0.45f'_c$ or the steel above $0.4f_y$.`,
    pages: [2],
    given: [],
    figure: Fig1b,
    checks: () => {
      const a = allowableMoment(E1, 2.7, 24)
      return [
        { key: 'kd', label: 'Cracked neutral axis $kd$', value: a.kd, unit: 'in' },
        { key: 'Icr', label: '$I_{cr}$', value: a.Icr, unit: 'in⁴' },
        { key: 'Mc', label: 'Moment at $f_c = 2.7$ ksi', value: a.Mc, unit: 'k-ft' },
        { key: 'M', label: 'Allowable moment', value: a.M, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const a = allowableMoment(E1, 2.7, 24)
      return (
        <Sol>
          <Md>{`Allowables: $f_c = 0.45(6) = 2.7$ ksi, $f_s = 0.4(60) = 24$ ksi. At service load the section is cracked — use the cracked transformed section with $n = 7$.`}</Md>
          <StepList steps={a.steps} />
          <Result>{`$M_{allow} = ${f(a.M, 1)}$ k-ft — the **${a.governs}** limit governs.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2023-24-1b-iv',
    paper: PAPER,
    sec: 'A',
    no: '1(b)(iv)',
    marks: 8,
    topics: ['rc-singly'],
    title: 'Maximum moment before failure and strains at failure',
    text: `${Q1B}\n\n(iv) What is the maximum moment that this beam can carry before failure? Find the concrete and steel strains at this moment.`,
    pages: [2],
    given: [],
    figure: Fig1b,
    checks: () => {
      const r = sgReview({ b: 14, fc: 6000, fy: 60000, layers: [{ As: 3.16, d: 18.5 }] })
      return [
        { key: 'c', label: 'Neutral axis depth $c$', value: r.c, unit: 'in' },
        { key: 'Mn', label: 'Maximum (nominal) moment $M_n$', value: r.Mn, unit: 'k-ft' },
        { key: 'es', label: 'Steel strain at failure $\\varepsilon_s$', value: r.epsS, tol: 0.03 },
      ]
    },
    solution: () => {
      const r = sgReview({ b: 14, fc: 6000, fy: 60000, layers: [{ As: 3.16, d: 18.5 }] })
      return (
        <Sol>
          <Md>{`At failure the extreme concrete fibre reaches $\\varepsilon_{cu} = 0.003$. $\\beta_1 = 0.85 - 0.05(6 - 4) = 0.75$.`}</Md>
          <StepList steps={r.steps.slice(0, 5)} />
          <Result>{`$M_n = ${f(r.Mn, 1)}$ k-ft (design value $\\phi M_n = ${f(r.phiMn, 1)}$ k-ft). Strains at failure: concrete $\\varepsilon_c = 0.003$, steel $\\varepsilon_s = ${f(r.epsS, 4)}$ (≫ $\\varepsilon_y = 0.00207$ — under-reinforced, ductile).`}</Result>
        </Sol>
      )
    },
    notes: ['"Maximum moment before failure" is the nominal strength Mn (not φMn); the concrete strain at failure is εcu = 0.003.'],
  },
  {
    id: 'rc-2023-24-2a',
    paper: PAPER,
    sec: 'A',
    no: '2(a)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Sources of uncertainty and how USD ensures safety',
    text: 'What are the sources of uncertainty in the analysis, design and construction of RC structures? How does the Strength Design method take care of these uncertainties and ensure safety in design?',
    pages: [2],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.uncertainty} />,
  },
  {
    id: 'rc-2023-24-2b',
    paper: PAPER,
    sec: 'A',
    no: '2(b)',
    marks: 8,
    topics: ['rc-singly'],
    title: 'ρb, ρmax = ρ0.004, ρ0.005 and ρmin (f′c = 4, fy = 60)',
    text: "If $f'_c = 4$ ksi and $f_y = 60$ ksi, find: (i) the balanced reinforcement ratio $\\rho_b$; (ii) the maximum reinforcement ratio $\\rho_{max} = \\rho_{0.004}$; (iii) the reinforcement ratio $\\rho_{0.005}$; (iv) the minimum reinforcement ratio $\\rho_{min}$.",
    pages: [2],
    given: [],
    checks: () => RatioChecks(4000, 60000),
    solution: () => <RatioSolution fc={4000} fy={60000} />,
  },
  {
    id: 'rc-2023-24-2c',
    paper: PAPER,
    sec: 'A',
    no: '2(c)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Doubly design: 16 × 30 in. section for Mu = 1200 k-ft',
    text: "A beam section is limited to width $b = 16$ in. and total depth $h = 30$ in. Calculate the required reinforcement if the beam has to resist a factored moment $M_u = 1200$ kip-ft. Assume two layers of tensile reinforcement with $d = 26$ in. and $d_t = 27.5$ in. Also assume $d' = 2.5$ in. if compression steel is required. Given: $f'_c = 5$ ksi, $f_y = 60$ ksi.",
    pages: [3],
    given: [],
    checks: () => DoublyDesignChecks(D2c),
    solution: () => <DoublyDesignSolution p={D2c} />,
    notes: ['The unit of dt is missing in print (27.5 in.).'],
  },
  {
    id: 'rc-2023-24-3a',
    paper: PAPER,
    sec: 'A',
    no: '3(a)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Singly design: 12 × 25 in. beam, 25 ft simple span, service D + L',
    text: "A rectangular beam carries a service live load (unfactored) of 2.0 kip/ft and an unfactored superimposed dead load of 1.0 kip/ft (in addition to the self-weight of the beam) on a 25 ft simple span. The beam will have a cross-section of 12 in. × 25 in. for architectural reasons. Design the beam for flexure using the USD method. Check minimum and maximum reinforcement. Given: $f'_c = 4.0$ ksi, $f_y = 60$ ksi.",
    pages: [3],
    given: [],
    checks: () => SinglyLoadChecks(SS3a, 12, 22.5, 4000, 60000),
    solution: () => <SinglyLoadSolution load={SS3a} b={12} d={22.5} fc={4000} fy={60000} dNote="One layer assumed: $d = h - 2.5 = 22.5$ in." />,
    notes: ['Load factors are not stated: use 1.2D + 1.6L (check 1.4D). Self-weight = 12 × 25/144 × 0.150 k/ft.', 'd is not given: assume one layer, d = h − 2.5 in. (revise to two layers if the bars do not fit in 12 in.).'],
  },
  {
    id: 'rc-2023-24-3b',
    paper: PAPER,
    sec: 'A',
    no: '3(b)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Doubly review: 14 in. wide, 8 #8 + 3 #8, fy = 72.5 ksi',
    text: "A rectangular RC beam as shown in Fig. 1 measures 14 in. wide and has an effective depth of 21 in. Tension steel consists of eight No. 8 bars in two layers ($d = 21$ in., $d_t = 22.5$ in.) and compression steel consists of three No. 8 bars located 2.5 in. from the compression face. Find the nominal and design moment capacities of the beam according to the ACI/BNBC code. Check for yielding of the compression steel and $\\varepsilon_t$. Given: $f'_c = 5$ ksi, $f_y = 72.5$ ksi.",
    pages: [3],
    given: [],
    figure: () => (
      <RectSection b={14} d={21} dt={22.5} dp={2.5} bar={8} rows={[4, 4]} top={3} topText="Three No. 8 bars" botText="Eight No. 8 bars" given={["f'c = 5.0 ksi", 'fy = 72.5 ksi']} caption="Fig. 1" />
    ),
    checks: () => DoublyReviewChecks(R3b),
    solution: () => <DoublyReviewSolution p={R3b} />,
    notes: ['fy = 72.5 ksi is printed in both the text and the figure: εy = 72.5/29000 = 0.0025.', 'Overall depth is not dimensioned; it is not needed (h ≈ 25 in. is used only for the sketch).'],
  },
  {
    id: 'rc-2023-24-4a',
    paper: PAPER,
    sec: 'A',
    no: '4(a)',
    marks: 17,
    topics: ['rc-tbeam'],
    title: 'T-beam design at midspan: 3 in. slab, 4 ft spacing, Mu = 700 k-ft',
    text: "A floor system consists of a 3 in. slab supported by continuous beams with a 24 ft clear span and centre-to-centre spacing of 4 ft, as shown in Fig. 2. Slab and beam are monolithically cast. Beam web width $b_w = 10$ in. and effective depth $d = 24$ in. At the mid-span of the beam the required factored moment is $M_u = 700$ kip-ft. Design the flexural reinforcement at the mid-span. Check $\\varepsilon_t$ for the designed section. Given: $f'_c = 3.0$ ksi, $f_y = 60$ ksi.",
    pages: [4],
    given: [],
    figure: () => <FloorSection webs={3} hf={3} bw={10} d={24} spacing={`4'-0"`} span="Span = 24 ft" bars={3} title="Fig. 2 — Section at mid-span" given={["f'c = 3.0 ksi", 'fy = 60 ksi']} />,
    checks: () => TDesignChecks(T4a, 700, 24, 3, 60),
    solution: () => <TDesignSolution beff={T4a} Mu={700} d={24} fc={3} fy={60} />,
    notes: ['Bar size and number are not given in the figure (three bars per web are drawn only schematically).', 'εt is computed at d (dt not given); with two layers dt would be about 1.5 in. deeper, which only helps.'],
  },
  {
    id: 'rc-2023-24-4b',
    paper: PAPER,
    sec: 'A',
    no: '4(b)',
    marks: 18,
    topics: ['rc-tbeam'],
    title: 'Negative-moment capacity at the support: 6 #9 top, bw = 12 in.',
    text: "There are six No. 9 bars in two rows at the top of the support, as shown in the beam section in Fig. 3. What is the nominal and design negative moment capacity of the beam at the support? Check $\\varepsilon_t$ and minimum reinforcement. Given: $d = 21.0$ in., $d_t = 22.5$ in., $f'_c = 5.0$ ksi, $f_y = 60$ ksi; web width 12 in., slab 6 in.",
    pages: [4],
    given: [],
    figure: () => <TSupport bw={12} hf={6} d={21} dt={22.5} bar={9} n={6} barText="Six No. 9 bars" title="Fig. 3 — Beam section at support" given={["f'c = 5.0 ksi", 'fy = 60 ksi']} />,
    checks: () => NegChecks(12, 21, 22.5, 6, 5, 60),
    solution: () => <NegSolution bw={12} d={21} dt={22.5} As={6} fc={5} fy={60} bars="6 #9" />,
    notes: [
      'At the support the flange is in tension, so the compression zone is the 12 in. web: analyse as a rectangular beam b = bw = 12 in.',
      'For As,min with the flange in tension older codes use the smaller of 2bw and the flange width; bf is not given, so As,min is checked with bw (the current rule).',
      'This section (6 in. slab, 12 in. web) is independent of the 3 in. slab floor of Q4(a).',
    ],
  },
  {
    id: 'rc-2023-24-5a',
    paper: PAPER,
    sec: 'B',
    no: '5(a)',
    marks: 6,
    topics: ['rc-shear'],
    title: 'Shear-resisting components at a diagonal crack (no stirrups)',
    text: 'What are the components that resist shear in a diagonally cracked section of a beam without any shear reinforcement? Show them with neat sketches.',
    pages: [5],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.shearComponents} fig={<CrackedShearSketch />} />,
  },
  {
    id: 'rc-2023-24-5b',
    paper: PAPER,
    sec: 'B',
    no: '5(b)',
    marks: 5,
    topics: ['rc-torsion'],
    title: 'Equilibrium vs compatibility torsion',
    text: 'Differentiate between equilibrium and compatibility torsion.',
    pages: [5],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.torsionTypes} fig={<TorsionSketch />} />,
  },
  {
    id: 'rc-2023-24-5c',
    paper: PAPER,
    sec: 'B',
    no: '5(c)',
    marks: 24,
    topics: ['rc-shear'],
    title: 'Stirrup design, 3 spacings: 35 ft beam, two 40 k loads + 2 k/ft',
    text: "Design the stirrups for the beam shown in Fig. 4. All loads are factored. Calculate stirrups with 3 sets of spacing. Width of the beam $b = 14$ in. and effective depth $d = 25$ in. Simply supported, spans 10 ft + 15 ft + 10 ft; 40 kip point loads at 10 ft and 25 ft from the left support; uniform load 2 kip/ft (excluding self-weight). Given: $f'_c = 3.5$ ksi, $f_y = 60$ ksi.",
    pages: [5],
    given: [],
    figure: () => (
      <SSBeam spans={[10, 15, 10]} loads={[{ at: 10, label: '40 kip' }, { at: 25, label: '40 kip' }]} udl="2 kip/ft (excluding self-wt)" note="All loads are factored" section={{ b: 14, d: 25, n: 4 }} caption="Fig. 4" />
    ),
    checks: () => ShearChecks(SB5c, SS5c),
    solution: () => <ShearSolution bm={SB5c} sec={SS5c} swNote="Self-weight with h ≈ 28 in. (assumed): 14 × 28/144 × 0.150, factored by 1.2 — the printed loads are already factored." />,
    notes: [
      'The UDL excludes self-weight and h is not given: assume h ≈ d + 3 = 28 in., self-weight = 14 × 28/144 × 0.150 = 0.408 k/ft, factored 1.2 × 0.408 = 0.49 k/ft (the loads shown are already factored, the self-weight is not).',
      'Stirrup size is not given: use #3 two-legged (Av = 0.22 in²). The figure label "Fig. 1" was corrected by hand to "Fig. 4".',
      'Supports are taken as knife-edge (face = centreline); Vu is taken at d from the support.',
    ],
  },
  {
    id: 'rc-2023-24-6a',
    paper: PAPER,
    sec: 'B',
    no: '6(a)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Factors that influence development length',
    text: 'Discuss briefly the factors that influence the development length of a reinforcing bar.',
    pages: [5],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.ldFactors} />,
    notes: ['Printed "reinforcing barrier" — a typo for bar.'],
  },
  {
    id: 'rc-2023-24-6b',
    paper: PAPER,
    sec: 'B',
    no: '6(b)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Splicing; Class A and Class B tension splices',
    text: 'What is splicing? Explain briefly the class A and class B splices in tension.',
    pages: [5],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.splices} />,
  },
  {
    id: 'rc-2023-24-6c',
    paper: PAPER,
    sec: 'B',
    no: '6(c)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Minimum lap lengths for column splices (ACI)',
    text: 'What are the minimum lengths of lap for column splices as per ACI code?',
    pages: [5],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.columnLap} />,
  },
  {
    id: 'rc-2023-24-6d',
    paper: PAPER,
    sec: 'B',
    no: '6(d)',
    marks: 6,
    topics: ['rc-bond'],
    title: 'Sketch: cut-off and bend points, equal spans with UDL',
    text: 'Show with neat sketches the cut-off or bend points for bars in approximately equal spans with uniformly distributed loads.',
    pages: [5],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.cutoff} fig={<CutoffSketch />} />,
  },
  {
    id: 'rc-2023-24-6e',
    paper: PAPER,
    sec: 'B',
    no: '6(e)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Why hooks? Standard hook dimensions (ACI)',
    text: 'Why are hooks provided in reinforcing bars? Draw the standard hook dimensions according to the ACI code.',
    pages: [5],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.hooks} fig={<HookSketch />} />,
  },
  {
    id: 'rc-2023-24-7a',
    paper: PAPER,
    sec: 'B',
    no: '7(a)',
    marks: 23,
    topics: ['rc-oneway'],
    title: 'One-way slab, two equal 16 ft spans, ACI coefficients',
    text: "A reinforced concrete one-way slab is built integrally with its supports and consists of two equal spans, each with a clear span of 16 ft. The slab is to carry a service live load (LL) of 80 psf in addition to its self-weight. Assume floor finish load of 30 psf and partition wall load of 50 psf. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi. Design the slab and show the reinforcement with neat sketches. Use the ACI moment coefficients table provided herewith.",
    pages: [5, 7],
    given: [AID.aci],
    checks: () => OneWayChecks(OW7a),
    solution: () => <OneWaySolution p={OW7a} />,
    notes: ['Two spans, integral with supports: −1/24 at the exterior (spandrel) supports, +1/14 in each span, −1/9 at the interior support; h from the "one end continuous" limit ln/24.'],
  },
  {
    id: 'rc-2023-24-7b',
    paper: PAPER,
    sec: 'B',
    no: '7(b)',
    marks: 6,
    topics: ['rc-oneway'],
    title: 'Why and how T&S reinforcement in a one-way slab',
    text: 'Discuss why and how temperature and shrinkage reinforcement is provided in a one-way slab.',
    pages: [5],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.ts} />,
  },
  {
    id: 'rc-2023-24-7c',
    paper: PAPER,
    sec: 'B',
    no: '7(c)',
    marks: 6,
    topics: ['rc-oneway'],
    title: 'ACI minimum slab thickness and why it is needed',
    text: 'Provide the list of minimum thicknesses for slabs with different support systems as per ACI code. Why is minimum thickness necessary even though it is not required from flexural or shear criteria?',
    pages: [6],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.minThick} />,
  },
  {
    id: 'rc-2023-24-8a',
    paper: PAPER,
    sec: 'B',
    no: '8(a)',
    marks: 28,
    topics: ['rc-twoway'],
    title: 'Two-way corner panel S1 (25 × 30 ft c/c), coefficient method',
    text: "Design slab panel S1 shown in Fig. 5 to support a uniform live load of 40 psf. The panel is a corner panel of a group. Consider 50 psf partition wall load and 25 psf floor finish load in addition to the self-weight of the slab. Given: $f'_c = 3.5$ ksi, $f_y = 60$ ksi. Assume that the beams are stiff ($\\alpha_m > 2.0$). Show all reinforcement in sketches. Use the moment coefficient method with the help of the supplied tables. (Fig. 5: panel 25 ft × 30 ft centre-to-centre, beams 24 in. × 30 in. on all four sides, columns 24 in. × 24 in.)",
    pages: [6, 7, 8, 9, 10],
    given: [AID.t123, AID.t124, AID.t125, AID.t126],
    figure: () => (
      <PanelPlan
        lb={`30'-0" (c/c)`}
        la={`25'-0" (c/c)`}
        cont={{ top: true, right: true }}
        beam={'24" × 30"'}
        column={'24" × 24"'}
        note={'Clear spans:\n30 − 2 = 28 ft (lb)\n25 − 2 = 23 ft (la)\nm = la/lb\nCorner panel → Case 4'}
        caption="Fig. 5 — slab panel S1 (redrawn; the slab continues past the top and right beams)"
      />
    ),
    checks: () => TwoWayChecks(TW8a),
    solution: () => <TwoWaySolution p={TW8a} note="Clear spans 28 × 23 ft (c/c minus the 2 ft beams). Exterior corner bottom-left (break lines at the top and right edges of Fig. 5)." />,
    notes: [
      'Clear spans = c/c − beam width: la = 23 ft, lb = 28 ft. h from eq. 13.8b with ln = 28 ft (long clear span) and β = 28/23.',
      'The scan has break lines (slab continuing) at the top and right edges, so the exterior corner is bottom-left. The solutions PDF draws it top-right — only the corner-steel location changes; it is Case 4 either way.',
    ],
  },
  {
    id: 'rc-2023-24-8b',
    paper: PAPER,
    sec: 'B',
    no: '8(b)',
    marks: 7,
    topics: ['rc-twoway'],
    title: 'Special reinforcement at exterior corners of two-way slabs',
    text: 'Elaborate on the special reinforcement provided at the exterior corners of a two-way slab system.',
    pages: [6],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.corner} fig={<CornerSketch />} />,
  },
]
