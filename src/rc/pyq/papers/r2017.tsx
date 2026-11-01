// 2017-18 term final (held 23 Sep 2018), PDF pp. 31–35. No design aids attached.
// This file also holds the drawing kit and the model answers shared by r2013–r2017.
import type { ReactNode } from 'react'
import { Md } from '../../../components/ui'
import type { RcQ } from '../../types'
import { SolSteps } from '../../topics/elastic/ui'
import { allowableMoment, elasticAt, f, uncracked, type ElasticInput, type SolStep } from '../../engine/elastic'
import { beamLoads, designAs, designSection, limits, pickBars as pickBarsS, review, ZONE_LABEL, type LoadInput, type SinglyInput } from '../../engine/singly'
import { designDoubly, reviewDoubly, type DoublyDesignIn, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, reviewT, type BeffIn, type TDesignIn, type TIn } from '../../engine/tbeam'
import { designShear, shearAt, type ShearBeam, type ShearSection } from '../../engine/shear'
import { cantSlab, oneWayCoef, type CantSlabInput, type OneWayCoefInput } from '../../engine/oneway'
import { CASE_TEXT, twoWay, type TwoWayInput } from '../../engine/twoway'
import { bar, hookGeometry, ldhCalc, ldSimplified, standardCutoffs } from '../../engine/bond'
import { BARS, rhoLimits } from '../../engine/materials'

export const r = String.raw

// ================================================================ drawing kit (shared by r2013–r2017)
export const C = {
  ink: 'var(--c-ink)',
  mute: 'var(--c-mute)',
  faint: 'var(--c-faint)',
  conc: 'var(--c-conc)',
  steel: 'var(--c-steel)',
  load: 'var(--c-load)',
  line: 'var(--c-line)',
  comp: 'var(--c-comp)',
  ten: 'var(--c-tension)',
  accent: 'var(--c-accent)',
  bad: 'var(--c-bad)',
  good: 'var(--c-good)',
}

export function Svg({ w, h, max, children }: { w: number; h: number; max?: number; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-auto mx-auto" style={{ maxWidth: max ?? w }} fontSize={12} role="img">
      {children}
    </svg>
  )
}

export function T({ x, y, children, a = 'middle', c = C.ink, s = 12, w, rot }: { x: number; y: number; children: ReactNode; a?: 'start' | 'middle' | 'end'; c?: string; s?: number; w?: number; rot?: number }) {
  return (
    <text x={x} y={y} textAnchor={a} fill={c} fontSize={s} fontWeight={w} dominantBaseline="middle" transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
      {children}
    </text>
  )
}

export function Ln({ x1, y1, x2, y2, c = C.ink, w = 1.2, dash }: { x1: number; y1: number; x2: number; y2: number; c?: string; w?: number; dash?: string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeDasharray={dash} />
}

export function Arrow({ x1, y1, x2, y2, c = C.load, w = 1.6, head = 7 }: { x1: number; y1: number; x2: number; y2: number; c?: string; w?: number; head?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const p = (da: number) => `${x2 - head * Math.cos(a + da)},${y2 - head * Math.sin(a + da)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - 0.6 * head * Math.cos(a)} y2={y2 - 0.6 * head * Math.sin(a)} stroke={c} strokeWidth={w} />
      <polygon points={`${x2},${y2} ${p(0.42)} ${p(-0.42)}`} fill={c} />
    </g>
  )
}

/** horizontal dimension; `to` = y of the object (draws extension lines) */
export function DimH({ x1, x2, y, label, to, c = C.mute, below }: { x1: number; x2: number; y: number; label?: ReactNode; to?: number; c?: string; below?: boolean }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={c} strokeWidth={1} />
      {[x1, x2].map((x, i) => (
        <g key={i}>
          <line x1={x - 4} y1={y + 4} x2={x + 4} y2={y - 4} stroke={c} strokeWidth={1.3} />
          {to != null && <line x1={x} y1={to} x2={x} y2={y + (y > to ? 5 : -5)} stroke={c} strokeWidth={0.8} />}
        </g>
      ))}
      {label != null && (
        <T x={(x1 + x2) / 2} y={below ? y + 10 : y - 9}>
          {label}
        </T>
      )}
    </g>
  )
}

/** chain of horizontal dimensions through the points xs */
export function DimChain({ xs, y, labels, to }: { xs: number[]; y: number; labels: ReactNode[]; to?: number }) {
  return (
    <g>
      {xs.slice(0, -1).map((x, i) => (
        <DimH key={i} x1={x} x2={xs[i + 1]} y={y} label={labels[i]} to={to} />
      ))}
    </g>
  )
}

/** vertical dimension; label left (side 'l') or right ('r') of the line */
export function DimV({ x, y1, y2, label, side = 'r', to, c = C.mute }: { x: number; y1: number; y2: number; label?: ReactNode; side?: 'l' | 'r'; to?: number; c?: string }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={c} strokeWidth={1} />
      {[y1, y2].map((y, i) => (
        <g key={i}>
          <line x1={x - 4} y1={y + 4} x2={x + 4} y2={y - 4} stroke={c} strokeWidth={1.3} />
          {to != null && <line x1={to} y1={y} x2={x + (x > to ? 5 : -5)} y2={y} stroke={c} strokeWidth={0.8} />}
        </g>
      ))}
      {label != null && (
        <T x={side === 'r' ? x + 6 : x - 6} y={(y1 + y2) / 2} a={side === 'r' ? 'start' : 'end'}>
          {label}
        </T>
      )}
    </g>
  )
}

export function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x - 9},${y + 13} ${x + 9},${y + 13}`} fill="none" stroke={C.ink} strokeWidth={1.3} />
      <Ln x1={x - 14} y1={y + 13} x2={x + 14} y2={y + 13} />
      {[-12, -6, 0, 6].map((d) => (
        <Ln key={d} x1={x + d} y1={y + 17} x2={x + d + 4} y2={y + 13} w={0.8} />
      ))}
    </g>
  )
}

export function Roller({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y + 6.5} r={6.5} fill="none" stroke={C.ink} strokeWidth={1.3} />
      <Ln x1={x - 14} y1={y + 13} x2={x + 14} y2={y + 13} />
      {[-12, -6, 0, 6].map((d) => (
        <Ln key={d} x1={x + d} y1={y + 17} x2={x + d + 4} y2={y + 13} w={0.8} />
      ))}
    </g>
  )
}

/** distributed load: a top line and small arrows down to y + h */
export function Udl({ x1, x2, y, h = 20, c = C.load }: { x1: number; x2: number; y: number; h?: number; c?: string }) {
  const n = Math.max(2, Math.round((x2 - x1) / 18))
  return (
    <g>
      <Ln x1={x1} y1={y} x2={x2} y2={y} c={c} w={1.4} />
      {Array.from({ length: n + 1 }, (_, i) => {
        const x = x1 + ((x2 - x1) * i) / n
        return <Arrow key={i} x1={x} y1={y} x2={x} y2={y + h} c={c} w={1.1} head={5} />
      })}
    </g>
  )
}

/** feet → 12′-6″ */
export const ftIn = (ft: number) => {
  const f = Math.floor(ft + 1e-9)
  const i = Math.round((ft - f) * 12)
  return `${f}′-${i}″`
}

/** simply supported beam elevation: UDL label lines, point loads, dimension chain, note */
export function SSBeam({
  L,
  segs,
  udl,
  points = [],
  note,
  left = 'pin',
  right = 'roller',
  w = 560,
}: {
  L: number
  segs?: number[]
  udl?: string[]
  points?: { x: number; label: string }[]
  note?: string
  left?: 'pin' | 'roller'
  right?: 'pin' | 'roller'
  w?: number
}) {
  const x0 = 40
  const x1 = w - 40
  const k = (x1 - x0) / L
  const X = (ft: number) => x0 + ft * k
  const nU = udl?.length ?? 0
  let y = 14
  const udlY = y
  y += 16 * nU
  const ptY = y + 4
  if (points.length) y += 26
  const band = y + 6
  const yb = band + (udl ? 24 : 4)
  const dimY = yb + 12 + 14 + 22
  const H = dimY + (note ? 34 : 16)
  const xs = [0]
  ;(segs ?? [L]).forEach((s) => xs.push(xs[xs.length - 1] + s))
  const Sup = ({ kind, x }: { kind: 'pin' | 'roller'; x: number }) => (kind === 'pin' ? <Pin x={x} y={yb + 12} /> : <Roller x={x} y={yb + 12} />)
  return (
    <Svg w={w} h={H}>
      {udl?.map((t, i) => (
        <T key={i} x={x1} y={udlY + 16 * i} a="end" c={C.load}>
          {t}
        </T>
      ))}
      {udl && <Udl x1={X(0)} x2={X(L)} y={band} h={22} />}
      {points.map((p, i) => (
        <g key={i}>
          <T x={X(p.x)} y={ptY} c={C.load} w={600}>
            {p.label}
          </T>
          <Arrow x1={X(p.x)} y1={ptY + 10} x2={X(p.x)} y2={yb - 1} w={2} head={8} />
        </g>
      ))}
      <rect x={X(0)} y={yb} width={X(L) - X(0)} height={12} fill={C.conc} stroke={C.ink} strokeWidth={1.3} />
      <Sup kind={left} x={X(0)} />
      <Sup kind={right} x={X(L)} />
      <DimChain xs={xs.map(X)} y={dimY} labels={(segs ?? [L]).map(ftIn)} />
      {note && (
        <T x={(X(0) + X(L)) / 2} y={dimY + 22} w={600}>
          {note}
        </T>
      )}
    </Svg>
  )
}

export interface BarRow {
  /** depth of the bar centres from the top face (in) */
  y: number
  n: number
  /** bar diameter (in), for the drawn size */
  db?: number
  label?: string
}
export interface VDimSpec {
  y1: number
  y2: number
  label: string
  lvl?: number
}

/** rectangular cross-section with bar rows and dimensions (all in inches) */
export function RectSec({
  b,
  h,
  rows,
  left = [],
  right = [],
  s = 7,
  stirrup,
  title,
  bLabel,
  cover = 2.5,
}: {
  b: number
  h: number
  rows: BarRow[]
  left?: VDimSpec[]
  right?: VDimSpec[]
  s?: number
  stirrup?: boolean
  title?: string
  bLabel?: string
  cover?: number
}) {
  const ML = left.length ? 96 : 24
  const x0 = ML
  const y0 = 16
  const xr = x0 + b * s
  const yb = y0 + h * s
  const maxR = Math.max(0, ...right.map((d) => d.lvl ?? 0))
  const noteX = xr + (right.length ? 96 + 40 * maxR : 20)
  const hasNotes = rows.some((rw) => rw.label)
  const W = hasNotes ? noteX + 150 : right.length ? xr + 96 + 40 * maxR : xr + 24
  const H = yb + 44 + (title ? 20 : 0)
  return (
    <Svg w={W} h={H}>
      <rect x={x0} y={y0} width={b * s} height={h * s} fill={C.conc} stroke={C.ink} strokeWidth={1.5} />
      {stirrup && <rect x={x0 + 1.5 * s} y={y0 + 1.5 * s} width={(b - 3) * s} height={(h - 3) * s} rx={6} fill="none" stroke={C.steel} strokeWidth={1.4} />}
      {rows.map((rw, i) => {
        const rr = Math.max(3.6, ((rw.db ?? 1) * s) / 2)
        const xs = rw.n === 1 ? [b / 2] : Array.from({ length: rw.n }, (_, j) => cover + (j * (b - 2 * cover)) / (rw.n - 1))
        const yy = y0 + rw.y * s
        return (
          <g key={i}>
            {xs.map((xb, j) => (
              <circle key={j} cx={x0 + xb * s} cy={yy} r={rr} fill={C.steel} />
            ))}
            {rw.label && (
              <>
                <Ln x1={x0 + xs[xs.length - 1] * s + rr + 2} y1={yy} x2={noteX - 4} y2={yy} c={C.mute} w={0.8} />
                <T x={noteX} y={yy} a="start">
                  {rw.label}
                </T>
              </>
            )}
          </g>
        )
      })}
      {left.map((d, i) => {
        const x = x0 - 16 - 40 * (d.lvl ?? 0)
        return <DimV key={i} x={x} y1={y0 + d.y1 * s} y2={y0 + d.y2 * s} label={d.label} side="l" to={x0} />
      })}
      {right.map((d, i) => {
        const x = xr + 16 + 40 * (d.lvl ?? 0)
        return <DimV key={i} x={x} y1={y0 + d.y1 * s} y2={y0 + d.y2 * s} label={d.label} side="r" to={xr} />
      })}
      <DimH x1={x0} x2={xr} y={yb + 18} label={bLabel ?? `${b}″`} below to={yb} />
      {title && (
        <T x={(x0 + xr) / 2} y={yb + 50} w={600}>
          {title}
        </T>
      )}
    </Svg>
  )
}

/** floor cross-section: slab of thickness hf on n webs at spacing sp (inches) */
export function TFloor({
  hf,
  bw,
  sp,
  n,
  h,
  d,
  rows = 1,
  perRow = 3,
  dAt = 0,
  notes = [],
}: {
  hf: number
  bw: number
  sp: number
  n: number
  /** web depth drawn, from the slab top (in) */
  h: number
  d: number
  rows?: 1 | 2
  perRow?: number
  /** which web carries the d dimension */
  dAt?: number
  notes?: string[]
}) {
  const ov = sp * 0.42
  const tot = (n - 1) * sp + bw + 2 * ov
  const W = 580
  const s = 500 / tot
  const x0 = 30
  const y0 = 22
  const X = (inch: number) => x0 + inch * s
  const cx = (i: number) => ov + bw / 2 + i * sp
  const ys = y0 + hf * s
  const yw = y0 + h * s
  let p = `M ${X(0)} ${y0} L ${X(tot)} ${y0} L ${X(tot)} ${ys}`
  for (let i = n - 1; i >= 0; i--) {
    const a = cx(i) - bw / 2
    const b2 = cx(i) + bw / 2
    p += ` L ${X(b2)} ${ys} L ${X(b2)} ${yw} L ${X(a)} ${yw} L ${X(a)} ${ys}`
  }
  p += ` L ${X(0)} ${ys} Z`
  const chainY = yw + 44
  const H = chainY + 14 + notes.length * 18 + 6
  const barYs = rows === 1 ? [d] : [d - 0.9, d + 0.9]
  return (
    <Svg w={W} h={H}>
      <path d={p} fill={C.conc} stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
      {/* break marks */}
      {[X(0), X(tot)].map((x, i) => (
        <path key={i} d={`M ${x - 5} ${y0 - 6} L ${x + 5} ${(y0 + ys) / 2} L ${x - 5} ${ys + 6}`} fill="none" stroke={C.mute} strokeWidth={1} />
      ))}
      {Array.from({ length: n }, (_, i) =>
        barYs.map((yy, k) =>
          Array.from({ length: perRow }, (_, j) => {
            const xb = cx(i) - bw / 2 + 2.5 + (perRow === 1 ? (bw - 5) / 2 : (j * (bw - 5)) / (perRow - 1))
            return <circle key={`${i}-${k}-${j}`} cx={X(xb)} cy={y0 + yy * s} r={2.6} fill={C.steel} />
          }),
        ),
      )}
      <DimV x={X(cx(dAt) + bw / 2) + 10} y1={y0} y2={y0 + d * s} label={`d = ${d}″`} side="r" />
      <DimV x={X(tot) + 14} y1={y0} y2={ys} label={`${hf}″`} side="r" to={X(tot)} />
      <DimH x1={X(cx(0) - bw / 2)} x2={X(cx(0) + bw / 2)} y={yw + 14} label={`bw = ${bw}″`} below to={yw} />
      <DimChain xs={Array.from({ length: n }, (_, i) => X(cx(i)))} y={chainY} labels={Array.from({ length: n - 1 }, () => `${sp}″`)} />
      {notes.map((t, i) => (
        <T key={i} x={W / 2} y={chainY + 22 + 18 * i}>
          {t}
        </T>
      ))}
    </Svg>
  )
}

/** one-way slab strip elevation: supports (x = centre in ft, w = width in in), UDL, dimension chain */
export function SlabStrip({
  L,
  supports,
  dims,
  udl,
  title,
  note,
}: {
  L: number
  supports: { x: number; w: number; kind: 'beam' | 'wall' }[]
  dims: { a: number; b: number; label: string }[]
  udl?: string
  title?: string
  note?: string
}) {
  const W = 560
  const x0 = 40
  const k = (W - 80) / L
  const X = (ft: number) => x0 + ft * k
  const yU = udl ? 18 : 6
  const ys = yU + (udl ? 34 : 18)
  const t = 10
  const dimY = ys + t + 52
  const H = dimY + 16 + (title ? 20 : 0) + (note ? 18 : 0)
  return (
    <Svg w={W} h={H}>
      {udl && (
        <>
          <T x={W / 2} y={yU - 8} c={C.load}>
            {udl}
          </T>
          <Udl x1={X(0)} x2={X(L)} y={yU + 4} h={ys - yU - 6} />
        </>
      )}
      <rect x={X(0)} y={ys} width={X(L) - X(0)} height={t} fill={C.conc} stroke={C.ink} strokeWidth={1.3} />
      {supports.map((sp, i) => {
        const bw = Math.max(8, (sp.w / 12) * k)
        const xa = X(sp.x) - bw / 2
        return sp.kind === 'beam' ? (
          <rect key={i} x={xa} y={ys + t} width={bw} height={20} fill={C.conc} stroke={C.ink} strokeWidth={1.3} />
        ) : (
          <g key={i}>
            <rect x={xa} y={ys + t} width={bw} height={34} fill={C.mute} opacity={0.35} stroke={C.ink} strokeWidth={1} />
            {[8, 16, 24].map((dy) => (
              <Ln key={dy} x1={xa} y1={ys + t + dy + 6} x2={xa + bw} y2={ys + t + dy - 2} w={0.8} />
            ))}
          </g>
        )
      })}
      {dims.map((d, i) => (
        <DimH key={i} x1={X(d.a)} x2={X(d.b)} y={dimY} label={d.label} />
      ))}
      {title && (
        <T x={W / 2} y={dimY + 22} w={600}>
          {title}
        </T>
      )}
      {note && (
        <T x={W / 2} y={dimY + (title ? 40 : 22)} c={C.mute}>
          {note}
        </T>
      )}
    </Svg>
  )
}

// ================================================================ theory sketches (shared)

/** strain and stress through the three flexural stages; flip = tension at the top (cantilever) */
export function StagesFig({ flip }: { flip?: boolean }) {
  const W = 600
  const H = 250
  const top = 40
  const hh = 130
  const Y = (f: number) => (flip ? top + hh - f * hh : top + f * hh) // f = 0 at compression face
  const panel = (i: number, title: string, na: number, kind: 'u' | 'c' | 'ult') => {
    const x = 10 + i * 200
    const sx = x + 8
    const ex = x + 85 // strain axis
    const fx = x + 150 // stress axis
    const ys = Y(0.88)
    return (
      <g key={i}>
        <T x={x + 95} y={16} w={700}>
          {title}
        </T>
        <rect x={sx} y={top} width={36} height={hh} fill={C.conc} stroke={C.ink} strokeWidth={1.2} />
        <circle cx={sx + 10} cy={ys} r={3} fill={C.steel} />
        <circle cx={sx + 26} cy={ys} r={3} fill={C.steel} />
        <Ln x1={sx - 4} y1={Y(na)} x2={sx + 40} y2={Y(na)} c={C.mute} dash="4 3" />
        {kind !== 'u' &&
          [10, 18, 26].map((cx) => <Ln key={cx} x1={sx + cx} y1={Y(1)} x2={sx + cx + (kind === 'ult' ? 1 : 0)} y2={Y(na + (kind === 'ult' ? 0.08 : 0.12))} c={C.bad} w={1} />)}
        {/* strain */}
        <Ln x1={ex} y1={top - 4} x2={ex} y2={top + hh + 4} c={C.mute} />
        <path d={`M ${ex} ${Y(0)} L ${ex - (kind === 'ult' ? 26 : 18)} ${Y(0)} L ${ex + (kind === 'u' ? 18 : kind === 'c' ? 34 : 50)} ${Y(1)} L ${ex} ${Y(1)} Z`} fill={C.accent} opacity={0.18} stroke={C.accent} strokeWidth={1} />
        <T x={ex - 14} y={Y(0) + (flip ? 10 : -10)} s={11}>
          {kind === 'ult' ? 'εcu = 0.003' : 'εc'}
        </T>
        <T x={ex + 26} y={ys + (flip ? -10 : 10)} s={11}>
          {kind === 'ult' ? 'εs ≥ εy' : 'εs'}
        </T>
        {/* stress */}
        <Ln x1={fx} y1={top - 4} x2={fx} y2={top + hh + 4} c={C.mute} />
        {kind === 'u' && (
          <>
            <path d={`M ${fx} ${Y(0)} L ${fx - 20} ${Y(0)} L ${fx + 20} ${Y(1)} L ${fx} ${Y(1)} Z`} fill={C.comp} opacity={0.25} stroke={C.comp} />
            <T x={fx - 18} y={Y(0) + (flip ? 10 : -10)} s={11}>
              fc
            </T>
            <T x={fx + 22} y={Y(1) + (flip ? -12 : 12)} s={11}>
              ft {'<'} fr
            </T>
          </>
        )}
        {kind === 'c' && (
          <>
            <path d={`M ${fx} ${Y(0)} L ${fx - 22} ${Y(0)} L ${fx} ${Y(na)} Z`} fill={C.comp} opacity={0.25} stroke={C.comp} />
            <T x={fx - 16} y={Y(0) + (flip ? 10 : -10)} s={11}>
              fc (linear)
            </T>
            <Arrow x1={fx} y1={ys} x2={fx + 32} y2={ys} c={C.ten} />
            <T x={fx + 36} y={ys + (flip ? -12 : 12)} s={11} a="middle">
              As·fs
            </T>
          </>
        )}
        {kind === 'ult' && (
          <>
            <path
              d={`M ${fx} ${Y(0)} C ${fx - 30} ${Y(0)}, ${fx - 32} ${Y(na * 0.45)}, ${fx - 28} ${Y(na * 0.55)} S ${fx - 8} ${Y(na * 0.95)}, ${fx} ${Y(na)} Z`}
              fill={C.comp}
              opacity={0.25}
              stroke={C.comp}
            />
            <rect x={fx - 24} y={Math.min(Y(0), Y(0.85 * na))} width={24} height={Math.abs(Y(0.85 * na) - Y(0))} fill="none" stroke={C.comp} strokeDasharray="3 2" />
            <T x={fx - 24} y={Y(0) + (flip ? 10 : -10)} s={11}>
              0.85f′c
            </T>
            <Arrow x1={fx} y1={ys} x2={fx + 32} y2={ys} c={C.ten} />
            <T x={fx + 36} y={ys + (flip ? -12 : 12)} s={11}>
              As·fy
            </T>
          </>
        )}
        <T x={x + 95} y={H - 22} s={11} c={C.mute}>
          {kind === 'u' ? 'M < Mcr — whole section works' : kind === 'c' ? 'Mcr < M ≤ service — cracked' : 'M = Mn — steel yields, concrete crushes'}
        </T>
      </g>
    )
  }
  return (
    <Svg w={W} h={H}>
      {panel(0, '1. Uncracked', 0.5, 'u')}
      {panel(1, '2. Cracked, elastic', 0.36, 'c')}
      {panel(2, '3. Ultimate', 0.22, 'ult')}
      <T x={W / 2} y={H - 6} s={11} c={C.mute}>
        each panel: section · strain (linear) · stress{flip ? ' — tension face on top (cantilever)' : ''}
      </T>
    </Svg>
  )
}

/** φ against net tensile strain εt (ACI 318-05 … 318-19, Grade 60) */
export function PhiChart() {
  const W = 520
  const H = 250
  const x0 = 60
  const y0 = 200
  const X = (e: number) => x0 + (e / 0.008) * 420
  const Y = (p: number) => y0 - ((p - 0.5) / 0.45) * 170
  return (
    <Svg w={W} h={H}>
      <Ln x1={x0} y1={y0} x2={X(0.008)} y2={y0} />
      <Ln x1={x0} y1={y0} x2={x0} y2={Y(0.95)} />
      {[0.65, 0.75, 0.9].map((p) => (
        <g key={p}>
          <Ln x1={x0 - 4} y1={Y(p)} x2={x0} y2={Y(p)} />
          <T x={x0 - 8} y={Y(p)} a="end" s={11}>
            {p.toFixed(2)}
          </T>
        </g>
      ))}
      {[0.002, 0.004, 0.005].map((e) => (
        <g key={e}>
          <Ln x1={X(e)} y1={y0} x2={X(e)} y2={Y(0.95)} c={C.line} dash="3 3" />
          <T x={X(e)} y={y0 + 14} s={11}>
            {e}
          </T>
        </g>
      ))}
      <polyline points={`${x0},${Y(0.65)} ${X(0.002)},${Y(0.65)} ${X(0.005)},${Y(0.9)} ${X(0.008)},${Y(0.9)}`} fill="none" stroke={C.accent} strokeWidth={2.2} />
      <polyline points={`${x0},${Y(0.75)} ${X(0.002)},${Y(0.75)} ${X(0.005)},${Y(0.9)}`} fill="none" stroke={C.load} strokeWidth={1.6} strokeDasharray="5 3" />
      <T x={X(0.001)} y={Y(0.65) + 12} s={11}>
        compression-controlled
      </T>
      <T x={X(0.0035)} y={Y(0.62)} s={11}>
        transition
      </T>
      <T x={X(0.0065)} y={Y(0.9) + 14} s={11}>
        tension-controlled
      </T>
      <T x={X(0.0011)} y={Y(0.75) - 10} s={11} c={C.load}>
        spiral 0.75
      </T>
      <T x={X(0.0041)} y={Y(0.817) - 12} s={11} c={C.ink}>
        εt = 0.004 → φ = 0.817
      </T>
      <circle cx={X(0.004)} cy={Y(0.817)} r={3.5} fill={C.accent} />
      <T x={X(0.004)} y={H - 12} s={12}>
        net tensile strain εt (εy = 0.002 for Grade 60)
      </T>
      <T x={18} y={Y(0.78)} s={12} rot={-90}>
        φ
      </T>
    </Svg>
  )
}

/** five floor systems used in Bangladesh (schematic sections) */
export function FloorSystemsFig() {
  const W = 600
  const H = 330
  const box = (i: number, title: string, body: ReactNode) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    return (
      <g key={i} transform={`translate(${10 + col * 197} ${10 + row * 160})`}>
        <rect x={0} y={0} width={187} height={150} rx={8} fill="none" stroke={C.line} />
        <T x={93} y={16} w={700} s={12}>
          {title}
        </T>
        {body}
      </g>
    )
  }
  const slab = (y: number, x1 = 12, x2 = 175) => <rect x={x1} y={y} width={x2 - x1} height={8} fill={C.conc} stroke={C.ink} />
  const col = (x: number, y: number, h = 50) => <rect x={x - 5} y={y} width={10} height={h} fill={C.conc} stroke={C.ink} />
  return (
    <Svg w={W} h={H}>
      {box(
        0,
        '(a) One-way slab on beams',
        <g>
          {slab(60)}
          {[30, 93, 156].map((x) => (
            <rect key={x} x={x - 7} y={68} width={14} height={18} fill={C.conc} stroke={C.ink} />
          ))}
          <T x={93} y={110} s={11}>
            lb/la ≥ 2: bends across beams
          </T>
          <T x={93} y={126} s={11}>
            residential & office floors
          </T>
        </g>,
      )}
      {box(
        1,
        '(b) Two-way slab on beams',
        <g>
          <rect x={35} y={32} width={116} height={78} fill={C.conc} stroke={C.ink} />
          <rect x={35} y={32} width={116} height={78} fill="none" stroke={C.ink} strokeWidth={5} opacity={0.35} />
          <path d="M 35 32 L 75 71 L 111 71 L 151 32 M 35 110 L 75 71 M 111 71 L 151 110" fill="none" stroke={C.mute} strokeDasharray="3 2" />
          <T x={93} y={126} s={11}>
            beams on all 4 edges, lb/la {'<'} 2
          </T>
        </g>,
      )}
      {box(
        2,
        '(c) Flat plate',
        <g>
          {slab(56)}
          {col(45, 64)}
          {col(141, 64)}
          <T x={93} y={130} s={11}>
            slab directly on columns
          </T>
        </g>,
      )}
      {box(
        3,
        '(d) Flat slab',
        <g>
          {slab(50)}
          {[45, 141].map((x) => (
            <g key={x}>
              <rect x={x - 20} y={58} width={40} height={7} fill={C.conc} stroke={C.ink} />
              <path d={`M ${x - 14} 65 L ${x - 5} 78 L ${x + 5} 78 L ${x + 14} 65 Z`} fill={C.conc} stroke={C.ink} />
              {col(x, 78, 40)}
            </g>
          ))}
          <T x={93} y={132} s={11}>
            drop panel + column capital
          </T>
        </g>,
      )}
      {box(
        4,
        '(e) Ribbed (joist) / waffle',
        <g>
          {slab(56)}
          {[28, 58, 88, 118, 148].map((x) => (
            <path key={x} d={`M ${x - 6} 64 L ${x - 4} 86 L ${x + 4} 86 L ${x + 6} 64`} fill={C.conc} stroke={C.ink} />
          ))}
          <T x={93} y={110} s={11}>
            ribs @ ≤ 30 in one way (joist)
          </T>
          <T x={93} y={126} s={11}>
            or both ways (waffle): long spans
          </T>
        </g>,
      )}
      {box(
        5,
        '(f) Slab on brick walls',
        <g>
          {slab(56)}
          {[22, 165].map((x) => (
            <rect key={x} x={x - 9} y={64} width={18} height={44} fill={C.mute} opacity={0.4} stroke={C.ink} />
          ))}
          <T x={93} y={126} s={11}>
            load-bearing masonry, low-rise
          </T>
        </g>,
      )}
    </Svg>
  )
}

/** corner reinforcement at an exterior corner of a two-way slab */
export function CornerFig() {
  const W = 520
  const H = 260
  const z = 120 // l/5 zone
  const panel = (k: 0 | 1) => {
    const x = 40 + k * 250
    const y = 30
    // bars clipped to the l/5 square: top = parallel to the diagonal, bottom = perpendicular to it
    const bars = Array.from({ length: 7 }, (_, i) => {
      const t = 17 * (i + 1)
      if (k === 0) {
        // lines x − y = c run parallel to the 45° diagonal from the corner
        const c = -z + (2 * z * (i + 0.5)) / 7
        const x1 = Math.max(0, c)
        const y1 = x1 - c
        const x2 = Math.min(z, z + c)
        const y2 = x2 - c
        return <Ln key={i} x1={x + x1} y1={y + y1} x2={x + x2} y2={y + y2} c={C.steel} w={1.6} />
      }
      const tt = Math.min(t * 1.6, 2 * z - 4)
      const x1 = Math.max(0, tt - z)
      const x2 = Math.min(z, tt)
      return <Ln key={i} x1={x + x1} y1={y + tt - x1} x2={x + x2} y2={y + tt - x2} c={C.steel} w={1.6} />
    })
    return (
      <g key={k}>
        <T x={x + 95} y={14} w={700}>
          {k === 0 ? 'Top bars (parallel to diagonal)' : 'Bottom bars (perpendicular to diagonal)'}
        </T>
        <rect x={x} y={y} width={190} height={190} fill={C.conc} stroke={C.ink} />
        <Ln x1={x} y1={y} x2={x} y2={y + 190} w={5} c={C.mute} />
        <Ln x1={x} y1={y} x2={x + 190} y2={y} w={5} c={C.mute} />
        <rect x={x} y={y} width={z} height={z} fill="none" stroke={C.load} strokeDasharray="5 3" />
        <Ln x1={x} y1={y} x2={x + z} y2={y + z} c={C.mute} dash="2 3" />
        {bars}
        <DimH x1={x} x2={x + z} y={y + 208} label="l/5 (l = longer span)" to={y + z} />
        <T x={x + 155} y={y + 160} s={11} c={C.mute}>
          panel
        </T>
      </g>
    )
  }
  return (
    <Svg w={W} h={H}>
      {panel(0)}
      {panel(1)}
      <T x={22} y={125} s={11} c={C.mute} rot={-90}>
        edge beam / wall
      </T>
    </Svg>
  )
}

/** standard cut-off and bend points, nearly equal spans with UDL (class handnote values) */
export function CutoffFig() {
  const W = 600
  const H = 300
  const x0 = 30
  const span = 260
  const X = (f: number) => x0 + f * span // f in spans from the left support
  const beam = (y: number) => (
    <g>
      <rect x={X(0)} y={y} width={2 * span} height={40} fill={C.conc} stroke={C.ink} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={X(i) - 6} y={y + 40} width={12} height={14} fill={C.mute} opacity={0.4} stroke={C.ink} />
      ))}
    </g>
  )
  return (
    <Svg w={W} h={H}>
      <T x={W / 2} y={12} w={700}>
        (a) Straight bars
      </T>
      {beam(30)}
      {/* top bars over interior support: ln/3 each side; exterior ln/4 */}
      <Ln x1={X(1 - 1 / 3)} y1={36} x2={X(1 + 1 / 3)} y2={36} c={C.steel} w={2.4} />
      <Ln x1={X(0) + 3} y1={36} x2={X(0.25)} y2={36} c={C.steel} w={2.4} />
      <Ln x1={X(2) - 3} y1={36} x2={X(1.75)} y2={36} c={C.steel} w={2.4} />
      {/* bottom: 50% full + 6 in into supports, 50% stop at ln/8 */}
      <Ln x1={X(0) + 2} y1={64} x2={X(1) + 4} y2={64} c={C.steel} w={2.4} />
      <Ln x1={X(1) - 4} y1={64} x2={X(2) - 2} y2={64} c={C.steel} w={2.4} />
      <Ln x1={X(1 / 8)} y1={59} x2={X(7 / 8)} y2={59} c={C.load} w={2.4} />
      <Ln x1={X(1 + 1 / 8)} y1={59} x2={X(2 - 1 / 8)} y2={59} c={C.load} w={2.4} />
      <DimH x1={X(1 - 1 / 3)} x2={X(1)} y={24} label="ln/3" />
      <DimH x1={X(1)} x2={X(1 + 1 / 3)} y={24} label="ln/3" />
      <DimH x1={X(0)} x2={X(0.25)} y={24} label="ln/4" />
      <DimH x1={X(0)} x2={X(1 / 8)} y={98} label="ln/8" below />
      <DimH x1={X(7 / 8)} x2={X(1)} y={98} label="ln/8" below />
      <T x={X(0.5)} y={86} s={11} c={C.load}>
        50% of +As
      </T>
      <T x={X(1.5)} y={86} s={11} c={C.steel}>
        other 50% ≥ 6 in into support
      </T>

      <T x={W / 2} y={140} w={700}>
        (b) Bent (cranked) bars
      </T>
      {beam(160)}
      <path d={`M ${X(0) + 3} 166 L ${X(1 / 7) - 10} 166 L ${X(1 / 7)} 192 L ${X(0.75)} 192 L ${X(0.75) + 10} 166 L ${X(1 + 1 / 3)} 166`} fill="none" stroke={C.load} strokeWidth={2.4} />
      <Ln x1={X(0) + 2} y1={194} x2={X(2) - 2} y2={194} c={C.steel} w={2.4} />
      <Ln x1={X(1 - 1 / 3)} y1={168} x2={X(1 + 1 / 3)} y2={168} c={C.steel} w={2.4} />
      <DimH x1={X(0)} x2={X(1 / 7)} y={226} label="ln/7" below />
      <DimH x1={X(0.75)} x2={X(1)} y={226} label="ln/4" below />
      <DimH x1={X(1)} x2={X(1 + 1 / 3)} y={226} label="ln/3" below />
      <T x={W / 2} y={262} s={11} c={C.mute}>
        ln = clear span. Bent bar bends up at ln/7 from a discontinuous end and ln/4 from a continuous support,
      </T>
      <T x={W / 2} y={278} s={11} c={C.mute}>
        then runs as top steel ln/3 into the next span. Extra straight top bars make up the rest of −As.
      </T>
    </Svg>
  )
}

/** IMRF beam end: hoop zone 2h */
export function HoopFig() {
  const W = 560
  const H = 200
  const x0 = 70
  const y0 = 50
  const hb = 60
  return (
    <Svg w={W} h={H}>
      <rect x={x0 - 40} y={20} width={40} height={150} fill={C.conc} stroke={C.ink} />
      <rect x={x0} y={y0} width={450} height={hb} fill={C.conc} stroke={C.ink} />
      <Ln x1={x0 - 30} y1={y0 + 6} x2={x0 + 450} y2={y0 + 6} c={C.steel} w={2} />
      <Ln x1={x0 - 30} y1={y0 + hb - 6} x2={x0 + 450} y2={y0 + hb - 6} c={C.steel} w={2} />
      {[6, 26, 46, 66, 86, 106, 126].map((dx) => (
        <Ln key={dx} x1={x0 + dx} y1={y0 + 3} x2={x0 + dx} y2={y0 + hb - 3} c={C.load} w={2} />
      ))}
      {[170, 230, 290, 350, 410].map((dx) => (
        <Ln key={dx} x1={x0 + dx} y1={y0 + 3} x2={x0 + dx} y2={y0 + hb - 3} c={C.steel} w={1.5} />
      ))}
      <DimH x1={x0} x2={x0 + 130} y={y0 + hb + 22} label="2h from face: hoops" below />
      <DimH x1={x0} x2={x0 + 6} y={y0 - 14} />
      <T x={x0 + 10} y={y0 - 26} a="start" s={11}>
        first hoop ≤ 2 in from face
      </T>
      <T x={x0 + 65} y={y0 + hb + 58} s={11} c={C.load}>
        s ≤ d/4, 8db, 24dhoop, 12 in
      </T>
      <T x={x0 + 300} y={y0 + hb + 30} s={11}>
        beyond 2h: stirrups at s ≤ d/2
      </T>
      <T x={x0 - 20} y={185} s={11} c={C.mute}>
        column
      </T>
      <g transform={`translate(${x0 + 380} ${y0 - 42})`}>
        <rect x={0} y={0} width={30} height={34} rx={3} fill="none" stroke={C.load} strokeWidth={1.8} />
        <Ln x1={4} y1={4} x2={14} y2={14} c={C.load} w={1.8} />
        <Ln x1={10} y1={3} x2={20} y2={13} c={C.load} w={1.8} />
        <T x={36} y={17} a="start" s={11}>
          135° hooks, 6db ≥ 3 in
        </T>
      </g>
    </Svg>
  )
}

/** stress–strain curves: concrete in compression for several f′c, and (optionally) Grade 60 steel */
export function StressStrainFig({ steel }: { steel?: boolean }) {
  const W = steel ? 600 : 360
  const H = 260
  const cx0 = 50
  const cy0 = 220
  const CX = (e: number) => cx0 + (e / 0.004) * 250
  const CY = (f: number) => cy0 - (f / 7) * 190
  const curve = (fc: number) => {
    const e0 = 0.0017 + fc * 0.0001
    const pts: string[] = []
    for (let i = 0; i <= 40; i++) {
      const e = (0.0035 * i) / 40
      const f = e <= e0 ? fc * (2 * (e / e0) - (e / e0) ** 2) : Math.max(0, fc * (1 - (0.12 + 0.03 * fc) * ((e - e0) / 0.001)))
      if (e > e0 && f <= 0.2 * fc) break
      pts.push(`${CX(e)},${CY(f)}`)
    }
    return pts.join(' ')
  }
  const sx0 = 380
  const SX = (e: number) => sx0 + (e / 0.1) * 190
  const SY = (f: number) => cy0 - (f / 100) * 190
  return (
    <Svg w={W} h={H}>
      <T x={175} y={14} w={700}>
        Concrete in compression
      </T>
      <Ln x1={cx0} y1={cy0} x2={CX(0.004)} y2={cy0} />
      <Ln x1={cx0} y1={cy0} x2={cx0} y2={CY(7)} />
      {[3, 4, 5, 6].map((fc) => (
        <g key={fc}>
          <polyline points={curve(fc)} fill="none" stroke={fc === 4 ? C.accent : C.mute} strokeWidth={fc === 4 ? 2.2 : 1.3} />
          <T x={CX(0.0017 + fc * 0.0001)} y={CY(fc) - 9} s={11}>
            {fc} ksi
          </T>
        </g>
      ))}
      <Ln x1={CX(0.002)} y1={cy0} x2={CX(0.002)} y2={CY(4)} c={C.line} dash="3 3" />
      <Ln x1={CX(0.003)} y1={cy0} x2={CX(0.003)} y2={CY(3.4)} c={C.load} dash="4 3" />
      <T x={CX(0.002)} y={cy0 + 13} s={11}>
        ε0 ≈ 0.002
      </T>
      <T x={CX(0.003)} y={cy0 + 13} s={11} c={C.load}>
        εcu = 0.003
      </T>
      <Ln x1={cx0} y1={CY(0.45 * 4)} x2={CX(0.0006)} y2={CY(0.45 * 4)} c={C.comp} dash="3 2" />
      <T x={CX(0.0006) + 4} y={CY(1.8)} a="start" s={11} c={C.comp}>
        0.45f′c (elastic / allowable)
      </T>
      <Ln x1={cx0} y1={cy0} x2={CX(0.0011)} y2={CY(4.0)} c={C.accent} dash="2 2" />
      <T x={CX(0.0006)} y={CY(3.2)} a="end" s={11} c={C.accent}>
        Ec = 57000√f′c
      </T>
      <T x={175} y={H - 8} s={11} c={C.mute}>
        strain — higher f′c: steeper, more brittle
      </T>
      {steel && (
        <g>
          <T x={sx0 + 100} y={14} w={700}>
            Grade 60 steel in tension
          </T>
          <Ln x1={sx0} y1={cy0} x2={SX(0.11)} y2={cy0} />
          <Ln x1={sx0} y1={cy0} x2={sx0} y2={SY(100)} />
          <path d={`M ${sx0} ${cy0} L ${SX(0.00207)} ${SY(60)} L ${SX(0.012)} ${SY(60)} C ${SX(0.04)} ${SY(84)}, ${SX(0.07)} ${SY(92)}, ${SX(0.08)} ${SY(90)} L ${SX(0.1)} ${SY(80)}`} fill="none" stroke={C.steel} strokeWidth={2.2} />
          <path d={`M ${sx0} ${cy0} L ${SX(0.00207)} ${SY(60)} L ${SX(0.1)} ${SY(60)}`} fill="none" stroke={C.load} strokeDasharray="5 3" strokeWidth={1.4} />
          <T x={sx0 + 6} y={SY(60) - 10} a="start" s={11}>
            fy = 60 ksi, εy = 0.00207
          </T>
          <T x={SX(0.08)} y={SY(92) - 10} s={11}>
            fu ≈ 90 ksi
          </T>
          <T x={SX(0.06)} y={SY(52)} s={11} c={C.load}>
            design: elastic–plastic
          </T>
          <T x={SX(0.05)} y={H - 8} s={11} c={C.mute}>
            Es = 29 000 ksi; plateau to ≈ 0.01, rupture ≈ 0.12
          </T>
        </g>
      )}
    </Svg>
  )
}

// ================================================================ model answers (shared)
export const ANS = {
  uncertainty: r`### Sources of uncertainty
- **Loads** — the actual loads differ from the code-specified design loads (overloads, change of occupancy; live load is owner-controlled, dead load designer-controlled).
- **Load distribution** — the real distribution of load differs from the one assumed.
- **Analysis** — simplifying assumptions (idealised supports, elastic analysis, rigid joints) give load effects ($M$, $V$) different from the true ones.
- **Behaviour** — the real structural behaviour differs from the theory (plane sections, stress block, perfect bond …).
- **Dimensions** — member sizes differ from those drawn (construction tolerances).
- **Reinforcement** — bars placed out of position (smaller $d$, cover changes).
- **Material strength** — actual $f'_c$ and $f_y$ differ from the specified values (batching, compaction, curing, testing).
- Also the **consequence of failure** (brittle vs ductile, importance of the member) decides how large the margin must be.

### How USD ensures safety
- Basic requirement: **design strength ≥ required strength**, $\phi S_n \ge U$, e.g. $\phi M_n \ge M_u$, $\phi V_n \ge V_u$.
- **Overload provision — load factors** $\gamma > 1$: $U = 1.2D + 1.6L$ (and $1.4D$). LL gets the larger factor because it is more uncertain; factors are reduced when W or E are combined (simultaneous maxima unlikely).
- **Understrength provision — strength-reduction factor** $\phi < 1$ on the nominal strength: 0.90 tension-controlled flexure, 0.75 shear and torsion, 0.65 tied / 0.75 spiral columns, 0.65 bearing. Lower φ for brittle, less predictable or more important members.
- Combined: P(overload) ≈ 1/1000 × P(understrength) ≈ 1/100 → P(failure) ≈ 1/100 000 (reliability index β ≈ 3–4).
- Ductility rules add to safety: $\varepsilon_t \ge 0.004$ ($\rho \le \rho_{max}$), minimum steel, so a failure gives warning; serviceability checks at service loads.`,

  behaviour: r`### 1. Uncracked stage ($M < M_{cr}$)
- Tensile stress in the concrete is below the modulus of rupture $f_r = 7.5\sqrt{f'_c}$; the whole section (concrete in compression **and** tension, plus steel) resists the moment.
- Strains and stresses are linear (elastic); steel stress is small, $f_s = n f_{c,\text{steel level}}$.
- Analysed by the uncracked transformed section; cracking moment $M_{cr} = f_r I_g / y_t$.

### 2. Cracked elastic stage ($M_{cr} < M \le$ service load)
- Tension cracks open at the tension face and run up towards the neutral axis; the NA moves up and the concrete below it is ignored.
- Concrete compression stress stays roughly linear while $f_c \lesssim 0.5 f'_c$; the steel carries all the tension, $T = A_s f_s$.
- Cracked transformed section: $\tfrac12 b(kd)^2 = nA_s(d - kd)$, $j = 1 - k/3$, $f_c = 2M/(kjbd^2)$, $f_s = M/(A_s jd)$. This is the service-load (WSD) stage.

### 3. Ultimate stage ($M = M_n$)
- Strains are still linear but the concrete stress becomes non-linear (parabolic); the steel yields ($f_s = f_y$) in an under-reinforced beam; cracks widen, the NA rises further and deflections grow fast.
- Failure: the concrete crushes at $\varepsilon_{cu} = 0.003$ after the steel has yielded — ductile, with warning.
- Design replaces the curved block by Whitney's rectangle $0.85f'_c$ over $a = \beta_1 c$: $M_n = A_s f_y (d - a/2)$.
- An over-reinforced beam would instead crush before the steel yields — sudden and brittle.`,

  minSteel: r`### Purpose
- If a beam has very little steel, its cracked strength $M_n$ can be **less than the cracking moment** of the plain concrete section. At first cracking the concrete's tensile force is dumped onto the steel, which yields or even fractures at once → sudden, brittle failure without warning.
- Minimum steel makes $M_n$ comfortably larger than $M_{cr}$, so cracking is followed by ductile behaviour. It also controls shrinkage/temperature cracking and covers unforeseen loads.

### ACI / BNBC provisions
- Flexural members: $A_{s,min} = \dfrac{3\sqrt{f'_c}}{f_y} b_w d \;\ge\; \dfrac{200}{f_y} b_w d$ (psi units).
- For $f_y = 60$ ksi: $200/f_y = 0.00333$ governs while $f'_c \le 4440$ psi; at $f'_c = 5000$ psi, $3\sqrt{f'_c}/f_y = 0.00354$.
- Statically determinate T-beam with the flange in tension: use $b_w$ replaced by the smaller of $2b_w$ and $b_f$.
- Need not be applied if $A_{s,prov} \ge \tfrac43 A_{s,req}$ at every section.
- Slabs: minimum steel = temperature & shrinkage steel, $0.0018bh$ (Grade 60), $0.0020bh$ (Grade 40/50), spacing ≤ $3h$ or 18 in.`,

  rhoMax: r`### εt = 0.004 through ρmax
- Strain compatibility at nominal strength: $\dfrac{c}{d_t} = \dfrac{\varepsilon_{cu}}{\varepsilon_{cu} + \varepsilon_t}$. For $\varepsilon_t = 0.004$: $c = \dfrac{0.003}{0.007} d_t = 0.429\,d_t$.
- Equilibrium: $A_s f_y = 0.85 f'_c b a$ with $a = \beta_1 c$ → $\rho = 0.85\beta_1 \dfrac{f'_c}{f_y}\dfrac{c}{d}$.
- So $\rho_{max} = 0.85\beta_1 \dfrac{f'_c}{f_y}\dfrac{\varepsilon_{cu}}{\varepsilon_{cu} + 0.004}\dfrac{d_t}{d}$. Keeping $\rho \le \rho_{max}$ keeps $c \le 0.429 d_t$, so the steel strain at failure is at least 0.004.
- Compared with the balanced ratio (Grade 60, $\varepsilon_y = 0.00207$): $\rho_{max} = \tfrac{0.00507}{0.007}\rho_b = 0.724\rho_b$. Example $f'_c = 4$, $f_y = 60$ ksi: $\rho_b = 0.0285$, $\rho_{max} = 0.0206$, $\rho_{0.005} = 0.0181$.

### Variation of φ with εt (ACI / BNBC)
- **Tension-controlled**, $\varepsilon_t \ge 0.005$ ($c/d_t \le 0.375$): $\phi = 0.90$.
- **Compression-controlled**, $\varepsilon_t \le \varepsilon_y$ (0.002 for Grade 60, $c/d_t \ge 0.6$): $\phi = 0.65$ tied, 0.75 spiral.
- **Transition**: linear in $\varepsilon_t$ — tied $\phi = 0.65 + (\varepsilon_t - 0.002)\tfrac{250}{3} = 0.483 + 83.3\varepsilon_t$; spiral $\phi = 0.75 + 50(\varepsilon_t - 0.002)$. In terms of $c/d_t$: $\phi = 0.233 + 0.25/(c/d_t)$ (tied).
- At $\varepsilon_t = 0.004$, φ = 0.817: the extra steel above $\rho_{0.005}$ buys little extra $\phi M_n$, so designers aim for $\varepsilon_t \ge 0.005$.`,

  ts: r`### Why T&S steel is needed
- Concrete **shrinks** as it dries and expands/contracts with **temperature**. The slab is restrained by beams, walls and columns, so these movements create tensile stresses and cracks.
- In a one-way slab the main bars run in one direction only; perpendicular to them there is no steel to control these cracks.
- So **distribution (temperature & shrinkage) bars** are placed perpendicular to the main bars. They also spread concentrated loads sideways and hold the main bars in position (forming a mesh).

### How it is provided (ACI / BNBC), ratio on the gross area $bh$
- Grade 40 or 50 deformed bars: $A_s = 0.0020\,bh$.
- Grade 60 deformed bars or welded wire fabric: $A_s = 0.0018\,bh$.
- $f_y > 60$ ksi: $0.0018 \times 60\,000/f_y \ge 0.0014$.
- Spacing ≤ $5h$ or 18 in; bars placed on the inner side of (above) the bottom main bars, running the long way.
- The same ratio is the minimum flexural steel of slabs (main-bar spacing ≤ $3h$ or 18 in).`,

  floorSystems: r`- **One-way slab on beams** (beam-and-slab): panel with $l_b/l_a \ge 2$, bends across the supporting beams; most common in residential/office buildings. Slab 4–6 in, spans up to ≈ 12–15 ft.
- **Two-way slab on beams**: beams on all four edges, $l_b/l_a < 2$; load goes both ways; designed by the coefficient method.
- **Flat plate**: slab of uniform thickness carried directly on columns (no beams, drops or capitals); flat ceiling, low storey height, easy formwork; light loads, spans ≈ 15–25 ft; punching shear governs.
- **Flat slab**: flat plate thickened at columns with **drop panels** and/or **column capitals** to resist punching shear and negative moment; heavier loads (warehouses, parking).
- **Ribbed (joist) slab**: closely spaced ribs (≤ 30 in clear) under a thin topping, one way; **waffle slab** = ribs both ways (dome forms); long spans with low weight (halls, auditoria).
- Also common in low-rise Bangladesh: **slab on load-bearing brick walls** (walls act as supports).`,

  corner: r`### Why special steel is needed
- At an **exterior corner** where two discontinuous edges meet (edge beams or walls), the corner of a loaded two-way slab tends to **curl up**. When it is held down by the supports, **twisting moments** develop.
- Result: cracks on the **bottom** face along the diagonal and on the **top** face perpendicular to the diagonal, near the corner.

### Provision (ACI 318, slabs on beams with $\alpha_f > 1$ or walls)
- Provide **top and bottom** corner reinforcement over a distance **l/5** from the corner in each direction, $l$ = **longer clear span** of the corner panel.
- Area in each direction (top and bottom) = steel required for the **maximum positive moment** per unit width in the panel.
- Arrangement: top bars parallel to the diagonal and bottom bars perpendicular to it — **or** bars parallel to both edges in two layers, top and bottom.
- The top corner bars resist the negative twisting moment; the bottom bars resist the positive twisting moment.`,

  bundled: r`### Why the increase
- In a bundle the bars touch each other, so part of each bar's perimeter is **not in contact with concrete**; the inner bar of a 3- or 4-bar bundle has even less bonded surface.
- The bundle behaves like one large bar: bond stress concentrates on the outside, splitting is more likely, so a longer length is needed to transfer $A_b f_y$ to the concrete.

### Recommended increase (ACI 25.6.1.5 / BNBC)
- $l_d$ of each individual bar within the bundle = $l_d$ of that single bar × **1.20 for a 3-bar bundle**, × **1.33 for a 4-bar bundle**. No increase for 2-bar bundles.
- For the factors that depend on bar size (cover, spacing, $\psi_s$, $c_b$, confinement), the bundle is treated as **one bar of equivalent diameter** from its total area, $d_{b,eq} = \sqrt{4nA_b/\pi}$.
- Limits: at most 4 bars per bundle, enclosed by stirrups/ties; bars larger than No. 11 not bundled in beams; cut-offs of bars in a bundle staggered at least $40d_b$.`,

  colSplice: r`- Column bars are normally lap-spliced just above each floor; the splice is designed as a **compression lap** unless the bars go into tension under the factored load combinations.
- **Compression lap length** $l_{sc}$: $0.0005 f_y d_b$ for $f_y \le 60$ ksi (= **30 $d_b$** for Grade 60, 20 $d_b$ for Grade 40); $(0.0009 f_y - 24) d_b$ for $f_y > 60$ ksi; never less than **12 in**. Increase by one third if $f'_c < 3000$ psi.
- Reductions: tied column with tie effective area ≥ $0.0015hs$ in both directions → × 0.83; spiral column → × 0.75 (still ≥ 12 in).
- Different bar sizes: the larger of $l_{dc}$ of the larger bar and $l_{sc}$ of the smaller bar.
- If the bars are in **tension** under factored loads: stress ≤ $0.5f_y$ → Class B lap (Class A if ≤ half the bars are spliced at a section and splices are staggered by $l_d$); stress > $0.5f_y$ → **Class B, $1.3l_d$**. Each face must keep a tensile strength ≥ $0.25 f_y A_s$.
- Example: No. 8 Grade 60 bar → $0.0005 \times 60\,000 \times 1.0 = 30$ in.
- In frames resisting earthquake load, laps are placed in the **middle half** of the column height, enclosed by closely spaced ties.`,

  cutoff: r`Standard bar details for **approximately equal spans with uniformly distributed load** (Nilson Fig. 6.21 as used in class; $l_n$ = clear span):

- **Straight bars, top (−As)**: extend $l_n/3$ into each span from the face of an interior support, $l_n/4$ from an exterior (spandrel/column) support.
- **Straight bars, bottom (+As)**: about **50 %** may stop at $l_n/8$ from the support faces; the rest run through, at least **6 in** into the support.
- **Bent (cranked) bars**: bottom bars bend up at about $l_n/7$ from a discontinuous end and $l_n/4$ from a continuous support, then continue as top steel $l_n/3$ into the next span; extra straight top bars make up the remaining −As.
- Code checks behind the figure: every bar extends $d$ or $12d_b$ beyond its theoretical cut-off and $l_d$ beyond the point of maximum stress; ≥ 1/4 of +As (1/3 in simple spans) continues 6 in into the support; ≥ 1/3 of −As extends past the inflection point by the largest of $d$, $12d_b$, $l_n/16$.`,

  hoops: r`For beams of **intermediate moment frames** (IMRF — the minimum for a moderate seismic zone such as Dhaka, zone 2: Z = 0.15 in BNBC 1993, 0.20 in BNBC 2020):

- **Hoops** (closed stirrups with 135° seismic hooks, extension $6d_b \ge 3$ in) at both ends over a length **2h** from the face of the supporting column.
- **First hoop within 2 in** of the column face.
- Hoop spacing in that zone ≤ smallest of **d/4**, **8 × diameter of the smallest longitudinal bar**, **24 × hoop bar diameter**, **12 in**.
- Beyond $2h$: stirrups (with seismic hooks) at **≤ d/2** along the whole length.
- Related flexural rules: $M_n^+$ at the joint face ≥ $\tfrac13 M_n^-$ there; at any section both $M_n^+$ and $M_n^-$ ≥ $\tfrac15$ of the largest $M_n$ at either face. Laps not in the hoop zones.`,

  serviceability: r`- **Serviceability** = satisfactory performance of the structure under **service (working, unfactored) loads** during its life, as opposed to safety at the factored (ultimate) loads.
- **Deflection** must be small: no damage to partitions and finishes, no ponding, no sagging appearance (e.g. limits $l/360$ for LL, $l/480$ with sensitive partitions). Controlled by minimum thickness or by computing deflections with $I_e$.
- **Cracking** must be limited to hairline widths: durability (corrosion of bars), appearance, water-tightness. Controlled by bar spacing, cover and limiting $f_s$.
- **Vibration** must not be annoying (enough stiffness); **durability** (cover, concrete quality) and **fire resistance** are also serviceability requirements.`,

  cover: r`### Why cover is required
- **Corrosion protection**: the alkaline concrete keeps the steel passive; enough cover delays carbonation and chloride penetration to the bar.
- **Fire protection**: cover insulates the bars so they do not reach a temperature where $f_y$ drops sharply.
- **Bond**: cover around the bar is needed to develop its force without splitting the concrete.
- **Placement tolerance** and protection against abrasion/weathering.

### Code values (cast-in-place, non-prestressed — ACI / BNBC)
- Not exposed to weather or earth: slabs, walls, joists **¾ in** (No. 11 and smaller); **beams and columns 1½ in** (to the stirrups/ties).
- Exposed to earth or weather: **2 in** for No. 6–18 bars, **1½ in** for No. 5 and smaller.
- Cast against and permanently exposed to earth (footings): **3 in**.
- Metric equivalents commonly used: 20 mm, 40 mm, 50 mm, 75 mm.`,

  underOver: r`- **Under-reinforced** ($\rho < \rho_b$): the tension steel **yields before** the concrete crushes. Large deflections and wide cracks give warning; ductile failure; the steel strength is fully used.
- **Over-reinforced** ($\rho > \rho_b$): the concrete **crushes before** the steel yields — sudden, brittle failure with no warning; the expensive steel is not fully stressed.
- **Under-reinforced is preferred**: ductile, gives warning, economical. ACI enforces it through $\rho \le \rho_{max}$ ($\varepsilon_t \ge 0.004$) and rewards $\varepsilon_t \ge 0.005$ with φ = 0.90.`,

  classAB: r`- A **lap splice** transfers the force of one bar to the other through the surrounding concrete by bond; its length is a multiple of the tension development length $l_d$ (computed with all ψ factors but **without** the excess-steel factor).
- **Class A**: $l_{st} = 1.0\,l_d$. Allowed only when **both** (i) $A_{s,prov} \ge 2A_{s,req}$ over the whole splice length **and** (ii) **not more than half** the bars are spliced within the lap length.
- **Class B**: $l_{st} = 1.3\,l_d$ — all other cases (the normal one).
- Both: $l_{st} \ge 12$ in (for Class B the 12 in applies to $1.3l_d$).
- Splices should be placed away from the points of maximum tensile stress and staggered; No. 14 and 18 bars are not lap-spliced in tension.`,

  ldFactors: r`- **Concrete strength** — bond resistance grows with the tensile strength, $\propto \sqrt{f'_c}$ ($\sqrt{f'_c} \le 100$ psi); lightweight concrete factor $\lambda = 0.75$.
- **Steel yield strength** $f_y$ — the force to be developed, $A_b f_y$, grows with $f_y$, so $l_d \propto f_y$.
- **Bar diameter** — force $\propto d_b^2$, bonded surface per unit length $\propto d_b$, so $l_d \propto d_b$; small bars (No. 6 and smaller) get $\psi_s = 0.8$.
- **Bar location** — top bars with > 12 in of fresh concrete below: bleed water and air collect under the bar, $\psi_t = 1.3$.
- **Coating** — epoxy reduces adhesion and friction: $\psi_e = 1.5$ (cover < $3d_b$ or clear spacing < $6d_b$) or 1.2; $\psi_t\psi_e \le 1.7$.
- **Cover and bar spacing** — small cover/spacing → splitting failure; term $c_b$.
- **Confining transverse reinforcement** — stirrups crossing the splitting plane, $K_{tr}$; $(c_b + K_{tr})/d_b \le 2.5$.
- **Excess reinforcement** — $l_d$ may be reduced by $A_{s,req}/A_{s,prov}$.
- Hooks/heads at the bar end shorten the length needed ($l_{dh}$).`,
}

export const AnsMd = ({ a, fig }: { a: string; fig?: ReactNode }) => (
  <div className="space-y-3">
    <Md>{a}</Md>
    {fig && <div className="rounded-xl bg-bg/60 border border-line p-2">{fig}</div>}
  </div>
)

// ================================================================ solution kit (engine-driven, shared by r2013–r2017)
export const st = (t: string, tex?: string, md?: string): SolStep => ({ t, tex, md })
const sgn = (v: number, d = 3) => (v >= 0 ? `+ ${f(v, d)}` : `- ${f(-v, d)}`)
export const ft2 = (inch: number) => f(inch / 12, 2)

export const Sol = ({ children }: { children: ReactNode }) => <div className="space-y-3 text-sm">{children}</div>
export const Hd = ({ children }: { children: ReactNode }) => <div className="font-bold text-accent pt-1">{children}</div>
export const Ans = ({ children }: { children: string }) => (
  <div className="rounded-lg border border-good/50 bg-good/5 px-3 py-2">
    <Md>{children}</Md>
  </div>
)
export const Note = ({ children }: { children: string }) => <Md className="text-xs text-mute">{children}</Md>

/** simple table: header row + rows of strings (markdown/TeX allowed in cells) */
export function Tbl({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="text-xs border-collapse min-w-full">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className="border border-line px-2 py-1 text-left bg-panel2/60 font-semibold">
                <Md>{h}</Md>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="border border-line px-2 py-1 num">
                  {typeof c === 'number' ? f(c) : <Md>{c}</Md>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const roman = (i: number) => ['i', 'ii', 'iii', 'iv', 'v'][i]
export const barTxt = (n: number, no: number | string) => `${n} No. ${no}`

// ---------------------------------------------------------------- elastic
export function ElasticAtSol({ inp, Ms, fcAllow, fsAllow }: { inp: ElasticInput; Ms: number[]; fcAllow?: number; fsAllow?: number }) {
  const u = uncracked(inp)
  return (
    <Sol>
      <Hd>Uncracked transformed section and the cracking moment</Hd>
      <SolSteps steps={u.steps} />
      {Ms.map((M, i) => {
        const e = elasticAt(inp, M)
        const steps = e.state === 'uncracked' ? e.steps.slice(u.steps.length) : e.steps
        return (
          <div key={i} className="space-y-2">
            <Hd>
              ({roman(i)}) M = {M} kip-ft — {e.state}
            </Hd>
            <SolSteps steps={steps} start={u.steps.length + 1} />
            <Ans>{`**(${roman(i)})** $f_c = ${f(e.fc * 1000, 0)}$ psi (compression)${e.state === 'uncracked' ? `, bottom-fibre tension $${f(e.fct * 1000, 0)}$ psi` : ''}, $f_s = ${f(e.fs * 1000, 0)}$ psi${fcAllow ? ` — allowables $f_c = ${f(fcAllow * 1000, 0)}$, $f_s = ${f((fsAllow ?? 24) * 1000, 0)}$ psi: ${e.fc <= fcAllow && e.fs <= (fsAllow ?? 24) ? 'both OK' : 'exceeded'}` : ''}.`}</Ans>
          </div>
        )
      })}
    </Sol>
  )
}

export function McrAllowSol({ inp, fcAllow, fsAllow, note }: { inp: ElasticInput; fcAllow: number; fsAllow: number; note?: string }) {
  const u = uncracked(inp)
  const a = allowableMoment(inp, fcAllow, fsAllow)
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <Hd>(i) Cracking moment — uncracked transformed section</Hd>
      <SolSteps steps={u.steps} />
      <Hd>(ii) Allowable working moment — cracked transformed section</Hd>
      <SolSteps steps={a.steps} start={u.steps.length + 1} />
      <Ans>{`$M_{cr} = ${f(u.Mcr, 1)}$ k-ft (gross section ${f(u.McrG, 1)} k-ft); $M_{all} = ${f(a.M, 1)}$ k-ft, ${a.governs} governs ($kd = ${f(a.kd)}$ in, $j = ${f(a.j)}$).`}</Ans>
    </Sol>
  )
}

// ---------------------------------------------------------------- singly reinforced
export function SinglyReviewSol({ inp, extra }: { inp: SinglyInput; extra?: ReactNode }) {
  const r = review(inp)
  return (
    <Sol>
      <SolSteps steps={r.steps} />
      <Ans>{`$a = ${f(r.a)}$ in, $c = ${f(r.c)}$ in, $\\varepsilon_t = ${f(r.epsT, 5)}$ (${ZONE_LABEL[r.zone]}), $\\phi = ${f(r.phi)}$: **$M_n = ${f(r.Mn, 1)}$ k-ft, $\\phi M_n = ${f(r.phiMn, 1)}$ k-ft**.`}</Ans>
      {extra}
    </Sol>
  )
}

/** design As for a fixed section under beam loads; falls back to the doubly design when ρ > ρmax */
export function fixedDesign(load: LoadInput, b: number, d: number, fc: number, fy: number) {
  const L = beamLoads(load)
  const D = designAs(L.Mu, b, d, fc, fy)
  const bars = Number.isFinite(D.As) ? pickBarsS(D.As, b) : undefined
  const R = bars ? review({ b, fc, fy, layers: [{ As: bars.As, d }] }) : undefined
  return { L, D, bars, R }
}

export function FixedDesignSol({ load, b, d, fc, fy, note }: { load: LoadInput; b: number; d: number; fc: number; fy: number; note?: string }) {
  const { L, D, bars, R } = fixedDesign(load, b, d, fc, fy)
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <Hd>Loads and design moment</Hd>
      <SolSteps steps={L.steps} />
      <Hd>Steel for Mu (b = {b} in, d = {f(d)} in)</Hd>
      <SolSteps steps={D.steps} start={L.steps.length + 1} />
      {bars && R && (
        <>
          <Hd>Bars and check</Hd>
          <SolSteps
            steps={[
              st('Choose bars', `A_{s,req} = ${f(D.As)}\\text{ in}^2 \\Rightarrow \\text{${barTxt(bars.n, bars.bar)}} = ${f(bars.As)}\\text{ in}^2`, `${bars.layers === 1 ? 'Fits in one layer' : 'Needs two layers'}: clear spacing ${f(bars.clear, 2)} in ≥ ${f(bars.req, 2)} in required (1.5 in cover, No. 3 stirrups).`),
              st('Review', `a = ${f(R.a)}\\text{ in},\\ \\varepsilon_t = ${f(R.epsT, 5)},\\ \\phi M_n = ${f(R.phiMn, 1)}\\ ${R.phiMn >= L.Mu ? '\\ge' : '<'}\\ M_u = ${f(L.Mu, 1)}\\text{ k-ft}`),
            ]}
            start={L.steps.length + D.steps.length + 1}
          />
          <Ans>{`$w_u = ${f(L.wu)}$ k/ft, $M_u = ${f(L.Mu, 1)}$ k-ft, $A_s = ${f(D.As)}$ in² → **${barTxt(bars.n, bars.bar)}** (${f(bars.As)} in²), $\\phi M_n = ${f(R.phiMn, 1)}$ k-ft.`}</Ans>
          <RectSec b={b} h={d + 2.5} rows={[{ y: d, n: bars.n, db: bars.db, label: barTxt(bars.n, bars.bar) }]} left={[{ y1: 0, y2: d + 2.5, label: `h = ${f(d + 2.5)}″` }]} right={[{ y1: 0, y2: d, label: `d = ${f(d)}″` }]} stirrup s={5} />
        </>
      )}
    </Sol>
  )
}

/** design b × h with ρ = k ρmax, iterating the self-weight when the loads are service loads */
export function kRhoDesign(o: { L: number; b: number; k: number; fc: number; fy: number; sdl?: number; ll?: number; MuFixed?: number }) {
  const lim = rhoLimits(o.fc, o.fy)
  const rho = o.k * lim.rhoMax
  const run = (layers: 1 | 2) => {
    const it: { h: number; sw: number; Mu: number; d: number; hNew: number }[] = []
    let h = Math.ceil((o.L * 12) / 14)
    let sec = designSection(o.MuFixed ?? 1, o.fc, o.fy, rho, { b: o.b, layers })
    let loads = o.MuFixed ? undefined : beamLoads({ span: o.L, support: 'ss', b: o.b, h, sdl: o.sdl ?? 0, ll: o.ll ?? 0 })
    for (let i = 0; i < 8; i++) {
      loads = o.MuFixed ? undefined : beamLoads({ span: o.L, support: 'ss', b: o.b, h, sdl: o.sdl ?? 0, ll: o.ll ?? 0 })
      const Mu = o.MuFixed ?? loads!.Mu
      sec = designSection(Mu, o.fc, o.fy, rho, { b: o.b, layers })
      it.push({ h, sw: loads?.sw ?? 0, Mu, d: sec.d, hNew: sec.h })
      if (o.MuFixed || sec.h === h) break
      h = sec.h
    }
    return { it, sec, loads, layers }
  }
  let R = run(1)
  const As0 = R.sec.As
  if (pickBarsS(As0, o.b).layers !== 1) R = run(2)
  const Mu = o.MuFixed ?? R.loads!.Mu
  const D = designAs(Mu, o.b, R.sec.dAct, o.fc, o.fy, R.layers === 2 ? R.sec.dAct + 1 : R.sec.dAct)
  const bars = pickBarsS(D.As, o.b)
  return { lim, rho, ...R, Mu, D, bars }
}

export function KRhoSol({ o, note }: { o: Parameters<typeof kRhoDesign>[0]; note?: string }) {
  const g = kRhoDesign(o)
  const L = g.loads
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <Hd>Steel ratio</Hd>
      <SolSteps steps={[...limits(o.fc, o.fy).steps.slice(0, 3), st('Chosen ratio', `\\rho = ${o.k}\\rho_{max} = ${o.k}\\times${f(g.lim.rhoMax, 5)} = ${f(g.rho, 5)}`)]} />
      <Hd>Section {L ? '(self-weight iterated)' : ''}</Hd>
      <SolSteps steps={g.sec.steps} start={5} />
      {L && (
        <>
          <Tbl head={['trial h (in)', 'self-wt (k/ft)', '$M_u$ (k-ft)', 'd req (in)', 'new h (in)']} rows={g.it.map((t) => [f(t.h), f(t.sw), f(t.Mu, 1), f(t.d, 2), f(t.hNew)])} />
          <SolSteps steps={L.steps} start={5 + g.sec.steps.length} />
        </>
      )}
      <Hd>Final steel for the rounded section</Hd>
      <SolSteps steps={g.D.steps} start={5 + g.sec.steps.length + (L ? L.steps.length : 0)} />
      <Ans>{`$b = ${o.b}$ in, $h = ${g.sec.h}$ in (${g.layers === 2 ? 'two layers, d = h − 3.5' : 'd = h − 2.5'} = ${f(g.sec.dAct)} in), $M_u = ${f(g.Mu, 1)}$ k-ft, $A_s = ${f(g.D.As)}$ in² → **${barTxt(g.bars.n, g.bars.bar)}** (${f(g.bars.As)} in², ${g.bars.layers} layer${g.bars.layers > 1 ? 's' : ''}).`}</Ans>
    </Sol>
  )
}

// ---------------------------------------------------------------- doubly reinforced
export function doublyReviewSteps(p: DoublyReviewIn) {
  const r = reviewDoubly(p)
  const { b, d, dp, As, Asp, fc, fy } = p
  const dt = p.dt ?? d
  const s: SolStep[] = [
    st('Steel ratios', `\\rho = \\frac{${f(As)}}{${f(b)}\\times${f(d)}} = ${f(r.rho, 4)},\\quad \\rho' = \\frac{${f(Asp)}}{${f(b)}\\times${f(d)}} = ${f(r.rhoP, 4)},\\quad \\beta_1 = ${f(r.b1)}`),
    st('Trial: both steels yield', `a = \\frac{(A_s - A'_s)f_y}{0.85f'_cb} = \\frac{(${f(As)} - ${f(Asp)})(${f(fy)})}{0.85(${f(fc)})(${f(b)})} = ${f(r.trial.a)}\\text{ in},\\quad c = \\frac{a}{\\beta_1} = ${f(r.trial.c)}\\text{ in}`),
    st(
      'Does A′s yield?',
      `\\varepsilon'_s = 0.003\\frac{c - d'}{c} = 0.003\\frac{${f(r.trial.c)} - ${f(dp)}}{${f(r.trial.c)}} = ${f(r.trial.epsSp, 5)}\\ ${r.trial.epsSp >= r.ey ? '\\ge' : '<'}\\ \\varepsilon_y = ${f(r.ey, 5)}`,
      r.method === 'both-yield' ? 'Compression steel yields: the trial stands.' : "Compression steel does **not** yield: find c from equilibrium with $f'_s = E_s\\varepsilon'_s = 87(c - d')/c$ ksi.",
    ),
  ]
  if (r.method === 'quadratic' && r.quad)
    s.push(
      st(
        'Solve for c',
        `0.85f'_cb\\beta_1 c + A'_s\\left(87\\frac{c - d'}{c}${r.dispUsed ? " - 0.85f'_c" : ''}\\right) = A_sf_y \\Rightarrow ${f(r.quad.A)}c^2 ${sgn(r.quad.B)}c ${sgn(r.quad.C, 1)} = 0 \\Rightarrow c = ${f(r.c)}\\text{ in}`,
        r.dispUsed ? "Displaced concrete $0.85f'_cA'_s$ subtracted (class convention when A′s has not yielded)." : undefined,
      ),
    )
  if (r.method === 'general') s.push(st('Strain compatibility (tension steel not yielding)', `c = ${f(r.c)}\\text{ in},\\ f_s = ${f(r.fs)}\\text{ ksi}`))
  s.push(
    st('Stress block and steel stress', `a = \\beta_1 c = ${f(r.a)}\\text{ in},\\quad f'_s = ${r.fsp >= fy - 1e-9 ? `f_y = ${f(fy)}` : `87\\frac{${f(r.c)} - ${f(dp)}}{${f(r.c)}} = ${f(r.fsp)}`}\\text{ ksi}`),
    st('Forces', `C_c = 0.85f'_cab = ${f(r.Cc)}\\text{ k},\\quad C_s = A'_s(f'_s${r.dispUsed ? " - 0.85f'_c" : ''}) = ${f(r.Cs)}\\text{ k},\\quad T = A_sf_s = ${f(r.T)}\\text{ k}`),
    st('Net tensile strain', `\\varepsilon_t = 0.003\\frac{d_t - c}{c} = 0.003\\frac{${f(dt)} - ${f(r.c)}}{${f(r.c)}} = ${f(r.epsT, 5)} \\Rightarrow \\phi = ${f(r.phi)}`, `${ZONE_LABEL[r.zone]}; ${r.ductileOk ? 'εt ≥ 0.004 ✓ (permitted for a beam)' : 'εt < 0.004 ✗ not permitted for a beam'}.`),
    st('Nominal moment', `M_n = C_c\\left(d - \\frac a2\\right) + C_s(d - d') = ${f(r.Cc)}(${f(d - r.a / 2)}) + ${f(r.Cs)}(${f(d - dp)}) = ${f(r.Mn, 0)}\\text{ in-k} = ${f(r.MnFt, 1)}\\text{ k-ft}`),
    st('Design strength', `\\phi M_n = ${f(r.phi)}\\times${f(r.MnFt, 1)} = ${f(r.phiMn, 1)}\\text{ k-ft}`),
  )
  return { r, s }
}

export function DoublyReviewSol({ p }: { p: DoublyReviewIn }) {
  const { r, s } = doublyReviewSteps(p)
  return (
    <Sol>
      <SolSteps steps={s} />
      <Ans>{`$c = ${f(r.c)}$ in, $f'_s = ${f(r.fsp, 1)}$ ksi (${r.compYields ? 'yields' : 'does not yield'}), $\\varepsilon_t = ${f(r.epsT, 5)}$, $\\phi = ${f(r.phi)}$: **$\\phi M_n = ${f(r.phiMn, 1)}$ k-ft**.`}</Ans>
    </Sol>
  )
}

export function doublyDesignSteps(p: DoublyDesignIn) {
  const g = designDoubly(p)
  const { d, dp, fy, Mu } = p
  const sm = g.sm
  const s: SolStep[] = [
    st('Largest singly reinforced section (εt = 0.005)', `\\rho_{0.005} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.008} = ${f(sm.rho005, 5)},\\quad A_{s1} = \\rho_{0.005}bd = ${f(sm.As1)}\\text{ in}^2`),
    st('Its capacity', `a = \\frac{A_{s1}f_y}{0.85f'_cb} = ${f(sm.a)}\\text{ in},\\ c = ${f(sm.c)}\\text{ in},\\ \\varepsilon_t = ${f(sm.epsT, 5)},\\quad \\phi M_{n1} = ${f(sm.phi)}\\frac{${f(sm.As1)}(${f(fy)})(${f(d)} - ${f(sm.a / 2)})}{12} = ${f(sm.phiMn1, 1)}\\text{ k-ft}`),
  ]
  if (!g.needed) s.push(st('Compression steel?', `M_u = ${f(Mu)} \\le \\phi M_{n1} = ${f(sm.phiMn1, 1)}\\text{ k-ft}`, 'Not needed: singly reinforced.'), st('Steel', `A_s = ${f(g.As)}\\text{ in}^2`))
  else
    s.push(
      st('Compression steel needed', `M_u = ${f(Mu)} > \\phi M_{n1} \\Rightarrow M_{n2} = \\frac{M_u - \\phi M_{n1}}{0.9} = \\frac{${f(Mu)} - ${f(sm.phiMn1, 1)}}{0.9} = ${f(g.Mn2 / 12, 1)}\\text{ k-ft}`),
      st('Stress in A′s (strain at c of the singly part)', `\\varepsilon'_s = 0.003\\frac{${f(sm.c)} - ${f(dp)}}{${f(sm.c)}} = ${f(g.epsSp, 5)}\\ ${g.compYields ? '\\ge' : '<'}\\ \\varepsilon_y \\Rightarrow f'_s = ${f(g.fsp)}\\text{ ksi}`),
      st('Compression steel', `A'_s = \\frac{M_{n2}}{f'_s(d - d')} = \\frac{${f(g.Mn2, 0)}}{${f(g.fsp)}(${f(d - dp)})} = ${f(g.Asp)}\\text{ in}^2`),
      st('Tension steel', `A_s = A_{s1} + A'_s\\frac{f'_s}{f_y} = ${f(sm.As1)} + ${f(g.As2)} = ${f(g.As)}\\text{ in}^2`),
    )
  s.push(
    st('Bars', `\\text{tension: ${barTxt(g.tension.n, g.tension.no)}} = ${f(g.tension.A)}\\text{ in}^2\\ (${g.tension.layers}\\text{ layer${g.tension.layers > 1 ? 's' : ''}})${g.comp ? `,\\quad \\text{compression: ${barTxt(g.comp.n, g.comp.no)}} = ${f(g.comp.A)}\\text{ in}^2` : ''}`),
    st('Check with the bars provided', `c = ${f(g.review.c)}\\text{ in},\\ f'_s = ${f(g.review.fsp, 1)}\\text{ ksi},\\ \\varepsilon_t = ${f(g.review.epsT, 5)},\\ \\phi = ${f(g.review.phi)},\\ \\phi M_n = ${f(g.review.phiMn, 1)}\\ ${g.review.phiMn >= Mu - 0.05 ? '\\ge' : '<'}\\ M_u = ${f(Mu)}\\text{ k-ft}`),
  )
  return { g, s }
}

export function DoublyDesignSol({ p, note }: { p: DoublyDesignIn; note?: string }) {
  const { g, s } = doublyDesignSteps(p)
  const h = p.d + (p.dt - p.d) * 2 + 2.5
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <SolSteps steps={s} />
      <Ans>{`${g.needed ? `$A'_s = ${f(g.Asp)}$ in² → **${barTxt(g.comp!.n, g.comp!.no)}**; ` : ''}$A_s = ${f(g.As)}$ in² → **${barTxt(g.tension.n, g.tension.no)}**; check $\\phi M_n = ${f(g.review.phiMn, 1)}$ k-ft.`}</Ans>
      <RectSec
        b={p.b}
        h={Math.max(h, p.dt + 2)}
        s={5}
        stirrup
        rows={[
          ...(g.comp ? [{ y: p.dp, n: Math.min(g.comp.n, 4), db: BARS[g.comp.no].d, label: barTxt(g.comp.n, g.comp.no) }] : []),
          ...(g.tension.layers > 1
            ? [
                { y: p.dt, n: Math.ceil(g.tension.n / 2), db: BARS[g.tension.no].d, label: barTxt(g.tension.n, g.tension.no) },
                { y: p.dt - 2 * (p.dt - p.d), n: Math.floor(g.tension.n / 2), db: BARS[g.tension.no].d },
              ]
            : [{ y: p.dt, n: g.tension.n, db: BARS[g.tension.no].d, label: barTxt(g.tension.n, g.tension.no) }]),
        ]}
        right={[{ y1: 0, y2: p.d, label: `d = ${f(p.d)}″` }]}
      />
    </Sol>
  )
}

// ---------------------------------------------------------------- T-beams
export function beffSteps(b: BeffIn) {
  const o = effectiveWidth(b)
  return { o, s: [st('Effective flange width', `b_{eff} = \\min(${o.cands.map((c) => `${c.label.replace('½ clear', '\\tfrac12\\text{clear}').replace('c/c spacing', '\\text{c/c}').replace('actual flange', '\\text{actual}')} = ${f(c.value, 1)}`).join(',\\ ')}) = ${f(o.b, 1)}\\text{ in}`)] }
}

export function tReviewSteps(p: TIn) {
  const r = reviewT(p)
  const s: SolStep[] = [st('Assume rectangular (a ≤ hf)', `a = \\frac{A_sf_y}{0.85f'_cb_{eff}} = \\frac{${f(p.As)}(${f(p.fy)})}{0.85(${f(p.fc)})(${f(p.beff)})} = ${f(r.aRect)}\\text{ in}\\ ${r.rect ? '\\le' : '>'}\\ h_f = ${f(p.hf)}\\text{ in}`, r.rect ? 'Stress block inside the flange: rectangular beam of width beff.' : 'Block goes below the flange: true T-beam.')]
  if (r.rect) s.push(st('Moment', `c = ${f(r.c)}\\text{ in},\\ M_n = A_sf_y\\left(d - \\frac a2\\right) = ${f(p.As)}(${f(p.fy)})(${f(p.d)} - ${f(r.a / 2)}) = ${f(r.Mn, 0)}\\text{ in-k} = ${f(r.Mn / 12, 1)}\\text{ k-ft}`))
  else
    s.push(
      st('Flange overhangs', `C_f = 0.85f'_c(b_{eff} - b_w)h_f = 0.85(${f(p.fc)})(${f(p.beff - p.bw)})(${f(p.hf)}) = ${f(r.Cf)}\\text{ k},\\quad A_{sf} = C_f/f_y = ${f(r.Asf)}\\text{ in}^2`),
      st('Web', `A_{sw} = ${f(p.As)} - ${f(r.Asf)} = ${f(r.Asw)}\\text{ in}^2,\\quad a = \\frac{A_{sw}f_y}{0.85f'_cb_w} = ${f(r.a)}\\text{ in},\\ c = ${f(r.c)}\\text{ in}`),
      st('Moment', `M_n = A_{sf}f_y\\left(d - \\frac{h_f}{2}\\right) + A_{sw}f_y\\left(d - \\frac a2\\right) = ${f(r.Mn1, 0)} + ${f(r.Mn2, 0)} = ${f(r.Mn, 0)}\\text{ in-k} = ${f(r.Mn / 12, 1)}\\text{ k-ft}`),
    )
  s.push(st('Strain and φ', `\\varepsilon_t = 0.003\\frac{d_t - c}{c} = ${f(r.epsT, 5)} \\Rightarrow \\phi = ${f(r.phi)},\\quad \\phi M_n = ${f(r.phiMn, 1)}\\text{ k-ft}`, `${ZONE_LABEL[r.zone]}; $A_{s,min} = ${f(r.AsMin)}$ in² ${r.AsMinOk ? '✓' : '✗'}`))
  return { r, s }
}

export function tDesignSteps(p: TDesignIn) {
  const t = designT(p)
  const s: SolStep[] = [
    st('Can the flange alone carry Mu?', `\\phi M_{n,f} = 0.9(0.85f'_c)b_{eff}h_f\\left(d - \\frac{h_f}{2}\\right) = 0.9(0.85)(${f(p.fc)})(${f(p.beff)})(${f(p.hf)})(${f(p.d - p.hf / 2)})/12 = ${f(t.phiMnFlange, 1)}\\text{ k-ft}\\ ${t.rect ? '\\ge' : '<'}\\ M_u = ${f(p.Mu)}`, t.rect ? 'Yes → a ≤ hf: design as a rectangle of width beff.' : 'No → a > hf: true T-beam.'),
  ]
  if (t.rect) s.push(st('Rectangular design (b = beff)', `A_s = ${f(t.As)}\\text{ in}^2,\\ a = ${f(t.a)}\\text{ in}\\ (\\le h_f)`))
  else
    s.push(
      st('Flange-overhang steel', `A_{sf} = \\frac{0.85f'_c(b_{eff} - b_w)h_f}{f_y} = \\frac{0.85(${f(p.fc)})(${f(p.beff - p.bw)})(${f(p.hf)})}{${f(p.fy)}} = ${f(t.Asf)}\\text{ in}^2,\\quad \\phi M_{n1} = 0.9A_{sf}f_y\\left(d - \\frac{h_f}{2}\\right) = ${f(t.phiMn1, 1)}\\text{ k-ft}`),
      st('Web part', `\\phi M_{n2} = ${f(p.Mu)} - ${f(t.phiMn1, 1)} = ${f(t.phiMn2, 1)}\\text{ k-ft} \\Rightarrow A_{sw} = ${f(t.Asw)}\\text{ in}^2\\ (a = ${f(t.a)}\\text{ in on } b_w = ${f(p.bw)})`, 'From $\\phi M_{n2} = \\phi A_{sw}f_y(d - a/2)$, $a = A_{sw}f_y/(0.85f\'_cb_w)$, solved exactly.'),
      st('Total', `A_s = A_{sf} + A_{sw} = ${f(t.Asf)} + ${f(t.Asw)} = ${f(t.As)}\\text{ in}^2`),
    )
  s.push(st('Checks', `c = ${f(t.c)}\\text{ in},\\ \\varepsilon_t = ${f(t.epsT, 5)}\\ (\\phi = ${f(t.phi)}),\\quad A_{s,min} = ${f(t.AsMin)}\\text{ in}^2\\ ${t.As >= t.AsMin ? '\\le A_s\\ \\checkmark' : '> A_s'}`, t.tooHeavy ? 'εt < 0.004: enlarge the web or add compression steel.' : t.epsT >= 0.005 ? 'Tension-controlled, φ = 0.9 ✓' : 'Transition zone: φ re-evaluated.'))
  return { t, s }
}

// ---------------------------------------------------------------- shear
export function ShearSol({ bm, sec, note, run = 'sL' }: { bm: ShearBeam; sec: ShearSection; note?: string; run?: string }) {
  const g = designShear(bm, sec)
  const R = g.runs.find((x) => x.id === run) ?? g.runs[0]
  const L = g.lim
  const at = shearAt(R.Vd, sec)
  const sp = g.spacings[R.id] ?? []
  const lay = g.layouts[R.id]
  const steps: SolStep[] = [
    st('Factored loads and reactions', `w_u = ${f(g.dg.wu)}\\text{ k/ft}${g.dg.Pu.length ? `,\\ P_u = ${g.dg.Pu.map((p) => `${f(p.P)}\\text{ k @ }${f(p.x)}\\text{ ft}`).join(',\\ ')}` : ''},\\quad R = ${g.dg.R.map((x) => f(x, 2)).join(',\\ ')}\\text{ k}`, g.dg.wsw ? `Self-weight ${f(g.dg.wsw)} k/ft included.` : undefined),
    st('Critical section', `V_{u,face} = ${f(R.Vface, 2)}\\text{ k},\\quad V_u\\text{ at } d = ${f(R.Vd, 2)}\\text{ k}`, R.critAtFace ? 'A point load is within d of the face: design for Vu at the face.' : `Vu at d = ${f(sec.d)} in from the face.`),
    st('Concrete shear', `V_c = 2\\lambda\\sqrt{f'_c}b_wd = 2(${f(L.sqrtFc, 2)})(${f(sec.bw)})(${f(sec.d)})/1000 = ${f(L.Vc, 2)}\\text{ k},\\quad \\phi V_c = ${f(L.phiVc, 2)}\\text{ k},\\quad \\tfrac12\\phi V_c = ${f(L.halfPhiVc, 2)}\\text{ k}`),
    st('Limits', `\\phi 4\\sqrt{f'_c}b_wd = ${f(L.phiVs4, 2)}\\text{ k},\\quad \\phi 8\\sqrt{f'_c}b_wd = ${f(L.phiVs8, 2)}\\text{ k},\\quad V_{u,max} = \\phi V_c + \\phi 8\\sqrt{f'_c}b_wd = ${f(L.VuMax, 1)}\\text{ k}`),
    st(
      `Case at the critical section: ${at.case}`,
      `\\phi V_s = V_u - \\phi V_c = ${f(R.Vd, 2)} - ${f(L.phiVc, 2)} = ${f(at.phiVs, 2)}\\text{ k}\\ ${at.case === 'D' ? '>' : '\\le'}\\ \\phi4\\sqrt{f'_c}b_wd = ${f(L.phiVs4, 2)}`,
      at.case === 'D' ? 'High shear: $s_{max} = d/4$ or 12 in.' : at.case === 'C' ? '$s_{max} = d/2$ or 24 in.' : undefined,
    ),
    st(
      'Required Av/s',
      `\\frac{A_v}{s} = \\max\\left(\\frac{V_u - \\phi V_c}{\\phi f_{yt}d},\\ \\frac{0.75\\sqrt{f'_c}b_w}{f_{yt}},\\ \\frac{50b_w}{f_{yt}}\\right) = \\max(${f(at.avsExcess, 4)},\\ ${f(at.avsMin1, 4)},\\ ${f(at.avsMin2, 4)}) = ${f(at.avs, 4)}\\text{ in}^2/\\text{in}`,
    ),
    st('Spacing at the critical section', `s = \\frac{A_v}{A_v/s} = \\frac{${f(L.Av)}}{${f(at.avs, 4)}} = ${f(at.sCalc, 2)}\\text{ in};\\ s_{max} = ${f(at.sMax, 2)}\\text{ in} \\Rightarrow s = ${f(at.s, 2)}\\text{ in}`, `No. 3 two-legged stirrups, $A_v = ${f(L.Av)}$ in², $f_{yt} = ${f(sec.fy / 1000)}$ ksi.`),
    st(
      'Where the zones end (from the face)',
      `V_u = \\phi V_c\\text{ at } ${R.uPhiVc !== null ? `${ft2(R.uPhiVc)}\\text{ ft}` : '\\text{—}'},\\quad V_u = \\tfrac12\\phi V_c\\text{ at } ${R.uHalf !== null ? `${ft2(R.uHalf)}\\text{ ft}` : '\\text{— (stirrups needed throughout)}'}${R.uSmax !== null ? `,\\quad s_{max}\\text{ governs from } ${ft2(R.uSmax)}\\text{ ft}` : ''}`,
      'Similar triangles on the Vu diagram (Vu held at Vu(d) inside d).',
    ),
  ]
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <SolSteps steps={steps} />
      {lay && lay.count > 0 && (
        <>
          <Hd>Stirrup layout ({sp.length} sets of spacing, each half{bm.kind === 'cant' ? ' — from the fixed end' : ' — symmetric'})</Hd>
          <Tbl
            head={['zone', 'spacing (in)', 'number of spaces', 'from – to (in from face)', 'required s at the zone start (in)']}
            rows={[['first stirrup', '—', '—', `${f(lay.first)}`, '—'], ...lay.zones.map((z, i) => [`${i + 1}`, f(z.s), `${z.n}`, `${f(z.from)} – ${f(z.to)}`, f(R.sReq(Math.min(R.len, z.from + 0.01)), 2)])]}
          />
          <Ans>{`No. 3 two-legged stirrups: 1 @ ${f(lay.first)} in, ${lay.zones.map((z) => `${z.n} @ ${f(z.s)} in`).join(', ')} (last at ${f(lay.last)} in = ${ft2(lay.last)} ft from the face)${bm.kind === 'cant' ? '' : ', each end'}; ${R.uHalf !== null ? `beyond ${ft2(R.uHalf)} ft no stirrups are required (nominal ones at $s_{max}$ are good practice)` : 'stirrups are required over the whole length'}.`}</Ans>
        </>
      )}
      {g.flags.map((x, i) => (
        <Note key={i}>{`⚑ ${x}`}</Note>
      ))}
    </Sol>
  )
}

export function shearKey(bm: ShearBeam, sec: ShearSection, run = 'sL') {
  const g = designShear(bm, sec)
  const R = g.runs.find((x) => x.id === run) ?? g.runs[0]
  return { g, R, at: shearAt(R.Vd, sec), lay: g.layouts[R.id] }
}

// ---------------------------------------------------------------- one-way slabs
export function CantSlabSol({ p, note }: { p: CantSlabInput; note?: string }) {
  const r = cantSlab(p)
  const ld = r.loads
  const steps: SolStep[] = [
    st('Thickness', `h_{min} = \\max\\left(\\frac{l}{${p.cantL && p.cantR ? 28 : p.cantL || p.cantR ? 24 : 20}} = ${f(r.hSpan, 2)},\\ \\frac{l_c}{10} = ${f(r.hCant, 2)}\\right)${r.fyF !== 1 ? `\\times${f(r.fyF)}` : ''} = ${f(r.hReq, 2)}\\text{ in} \\Rightarrow h = ${f(r.h)}\\text{ in},\\ d = h - 1 = ${f(r.d)}\\text{ in}`, r.hGiven ? 'h as given.' : 'Span: both/one end continuous (cantilevers act as continuity); cantilever l/10.'),
    st('Loads (1 ft strip)', ld.given ? `D = ${f(ld.D)}\\text{ psf (given)},\\ L = ${f(ld.L)}\\text{ psf}` : `D = ${f(ld.sw)} + ${f(p.ff ?? 0)} + ${f(p.pw ?? 0)} = ${f(ld.D)}\\text{ psf},\\ L = ${f(ld.L)}\\text{ psf}`, `Self-weight = h/12 × 150 = ${f(ld.sw)} psf.`),
    st('Factored', `w_D = 1.2D = ${f(ld.wDk, 4)}\\text{ k/ft},\\quad w_u = 1.2D + 1.6L = ${f(ld.wuk, 4)}\\text{ k/ft}`),
    st('Geometry (support centrelines)', `L = ${f(p.span)} + ${f(p.support)}/12 = ${f(r.geo.L, 3)}\\text{ ft},\\quad a_L = ${f(r.geo.acL, 3)},\\ a_R = ${f(r.geo.acR, 3)}\\text{ ft}`),
    st('Max −M (LL on the cantilever, at the support face)', `M_u^- = \\frac{w_u l_c^2}{2} = \\frac{${f(ld.wuk, 4)}(${f(Math.max(p.cantL, p.cantR))})^2}{2} = ${f(r.Mneg, 2)}\\text{ k-ft/ft}`),
    st('Max +M (LL on the span only, DL on the cantilevers)', `M_u^+ = ${f(r.Mpos, 2)}\\text{ k-ft/ft}`, `Statics: reactions ${f(r.patterns.span.RA, 3)} / ${f(r.patterns.span.RB, 3)} k, zero shear at ${f(r.patterns.span.xm, 2)} ft from the left support.`),
    st('Uplift pattern (LL on cantilevers only)', `M_{mid} = ${f(r.uplift.Mmid, 2)}\\text{ k-ft}`, r.uplift.negThrough ? 'Whole span hogs: run the top steel through the span.' : `Top steel must extend ${f(r.topExt, 2)} ft into the span (≥ ln/3 and the hogging region).`),
    st('Depth check', `d_{req} = ${f(r.depth.dreq, 2)}\\text{ in}\\ ${r.depth.dreq <= r.d ? '\\le' : '>'}\\ d = ${f(r.d)}\\ ${r.depth.dreq <= r.d ? '\\checkmark' : ''}`, 'From ρ at εt = 0.005.'),
    st('Steel', `A_s^+ = ${f(r.asPos.As)},\\ A_s^- = ${f(r.asNeg.As)}\\text{ in}^2/\\text{ft};\\ A_{s,min} = 0.0018bh = ${f(r.AsMin)}\\text{ in}^2/\\text{ft}`, 'Iterating $A_s = M_u/[0.9f_y(d - a/2)]$, $a = A_sf_y/(0.85f\'_c b)$.'),
    st('Bottom bars', `\\text{No. ${r.bar} @ } ${f(r.pos.s)}\\text{ in c/c}\\ (s_{max} = ${f(r.smax)}\\text{ in}),\\ \\text{alternate bars cranked}`),
    st('Top bars over the supports', `\\text{need } ${f(r.extra.need)}\\text{ in}^2\\text{ in } 2s = ${f(r.extra.width)}\\text{ in; cranked bar gives } ${f(r.extra.cranked)} \\Rightarrow ${r.extra.n}\\text{ extra No. ${r.bar}}`, `Straight-bar alternative: No. ${r.bar} @ ${f(r.straight.s)} in top.`),
    st('T&S steel', `A_s = ${f(r.ts.ratio, 4)}bh = ${f(r.ts.As)}\\text{ in}^2/\\text{ft} \\Rightarrow \\text{No. ${r.ts.bar} @ } ${f(r.ts.s)}\\text{ in}`),
    st('Shear', `V_u = ${f(Math.max(r.shear.Vcant, r.shear.Vspan), 2)}\\text{ k}\\ ${r.shear.ok ? '\\le' : '>'}\\ \\phi V_c = ${f(r.shear.phiVc, 2)}\\text{ k}\\ ${r.shear.ok ? '\\checkmark' : ''}`),
  ]
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <SolSteps steps={steps} />
      <Ans>{`$h = ${f(r.h)}$ in; $M_u^+ = ${f(r.Mpos, 2)}$, $M_u^- = ${f(r.Mneg, 2)}$ k-ft/ft; bottom No. ${r.bar} @ ${f(r.pos.s)} in (alt. cranked) + ${r.extra.n} extra top No. ${r.bar} between cranked bars; T&S No. ${r.ts.bar} @ ${f(r.ts.s)} in.`}</Ans>
    </Sol>
  )
}

export function OneWaySol({ p, note }: { p: OneWayCoefInput; note?: string }) {
  const r = oneWayCoef(p)
  const ld = r.loads
  const steps: SolStep[] = [
    st('Thickness', `h_{min} = ${r.hmin.map((x) => `\\frac{${f(x.l, 2)}\\times12}{${x.rule === 'ss' ? 20 : x.rule === 'one' ? 24 : 28}} = ${f(x.h, 2)}`).filter((v, i, a) => a.indexOf(v) === i).join(',\\ ')} \\Rightarrow h = ${f(r.h)}\\text{ in},\\ d = ${f(r.d)}\\text{ in}`, r.hGiven ? 'Thickness as given.' : 'End span: one end continuous (l/24); interior: both ends continuous (l/28).'),
    st('Loads', ld.given ? `D = ${f(ld.D)}\\text{ psf (given)}` : `D = ${f(ld.sw)} + ${f(p.ff ?? 0)} + ${f(p.pw ?? 0)} = ${f(ld.D)}\\text{ psf},\\quad L = ${f(ld.L)}\\text{ psf}`, `w_u = 1.2D + 1.6L = ${f(ld.wu, 1)} psf = ${f(ld.wuk, 4)} k/ft per ft width.`),
    st('Depth check', `d_{req} = ${f(r.depth.dreq, 2)}\\text{ in}\\ ${r.depth.dreq <= r.d ? '\\le' : '>'}\\ d = ${f(r.d)}\\text{ in}`),
    st('Minimum steel', `A_{s,min} = 0.0018bh = ${f(r.AsMin)}\\text{ in}^2/\\text{ft},\\quad s_{max} = \\min(3h, 18) = ${f(r.smax)}\\text{ in}`),
  ]
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <SolSteps steps={steps} />
      <Hd>ACI coefficients, steel and bars (No. {r.bar})</Hd>
      <Tbl
        head={['section', 'coef', '$l_n$ (ft)', '$M_u$ (k-ft/ft)', '$A_s$ (in²/ft)', 'design $A_s$', 'straight bars']}
        rows={r.sections.filter((s) => !s.mirror).map((s) => [s.label, `${s.kind === 'neg' ? '−' : '+'}1/${s.den}`, f(s.ln, 2), f(s.Mu, 2), f(s.as.As), f(s.AsD) + (s.usesMin ? ' (min)' : ''), `No. ${r.bar} @ ${f(s.sp.s)} in`])}
      />
      <SolSteps
        steps={[
          st('Bottom bars (alternate cranked)', r.spanBars.filter((_, j) => j <= (r.n - 1) / 2).map((b, j) => `\\text{span ${j + 1}: No. ${r.bar} @ ${f(b.s)} in}`).join(',\\quad ')),
          ...r.supports
            .filter((x) => !x.sec.mirror)
            .map((x) => st(`Top at ${x.sec.label.replace(' (−)', '')}`, `\\text{need } ${f(x.extra.need)}\\text{ in}^2\\text{ in } 2s = ${f(x.extra.width)}\\text{ in},\\ \\text{cranked } ${f(x.extra.cranked)} \\Rightarrow ${x.extra.n}\\text{ extra No. ${r.bar}}`)),
          st('T&S steel', `\\text{No. ${r.ts.bar} @ } ${f(r.ts.s)}\\text{ in}\\ (A_s = ${f(r.ts.As)}\\text{ in}^2/\\text{ft})`),
          st('Shear', `V_u\\text{ at } d = ${f(r.shear.Vd, 2)}\\text{ k}\\ ${r.shear.ok ? '\\le' : '>'}\\ \\phi V_c = ${f(r.shear.phiVc, 2)}\\text{ k}`, `${r.shear.c === 1.15 ? '1.15 wu ln/2 at the first interior support.' : ''}`),
        ]}
        start={5}
      />
      {r.warnings.map((w, i) => (
        <Note key={i}>{`⚑ ${w}`}</Note>
      ))}
      <Ans>{`$h = ${f(r.h)}$ in; bottom No. ${r.bar} @ ${f(r.spanBars[0].s)} in (end span); largest $M_u = ${f(r.Mumax, 2)}$ k-ft/ft; T&S No. ${r.ts.bar} @ ${f(r.ts.s)} in.`}</Ans>
    </Sol>
  )
}

export function TwoWaySol({ p, note }: { p: TwoWayInput; note?: string }) {
  const r = twoWay(p)
  const ld = r.loads
  const C = r.C
  const steps: SolStep[] = [
    st('Panel', `l_a = ${f(r.geo.la, 2)}\\text{ ft},\\ l_b = ${f(r.geo.lb, 2)}\\text{ ft},\\ m = l_a/l_b = ${f(r.m)}\\ \\Rightarrow\\ \\text{Case ${r.case}}`, `${CASE_TEXT[r.case]}.`),
    st('Thickness', `h = \\frac{l_n(0.8 + f_y/200{,}000)}{36 + 9\\beta} = \\frac{${f(r.geo.lb * 12, 1)}(${f(0.8 + p.fy / 200000)})}{36 + 9(${f(r.th.beta)})} = ${f(r.th.raw, 2)}\\text{ in} \\Rightarrow h = ${f(r.h)}\\text{ in}`, r.hGiven ? 'Thickness as given.' : 'Perimeter/180 also checked by the class.'),
    st('Loads', `D = ${ld.given ? f(ld.D) : `${f(ld.sw)} + ${f(p.ff ?? 0)} + ${f(p.pw ?? 0)} = ${f(ld.D)}`}\\text{ psf},\\ w_{D,u} = ${f(ld.wD, 1)},\\ w_{L,u} = ${f(ld.wL, 1)},\\ w_u = ${f(ld.wu, 1)}\\text{ psf}`),
    st('Coefficients (Tables 12.3–12.5)', `C_{a,neg} = ${C.aNeg ?? '—'},\\ C_{b,neg} = ${C.bNeg ?? '—'},\\ C_{a,dl} = ${f(C.aDL, 4)},\\ C_{b,dl} = ${f(C.bDL, 4)},\\ C_{a,ll} = ${f(C.aLL, 4)},\\ C_{b,ll} = ${f(C.bLL, 4)}`),
    st('Effective depths', `d_{short} = ${f(r.d.short)},\\ d_{long} = ${f(r.d.long)},\\ d_{top} = ${f(r.d.top)}\\text{ in};\\ A_{s,min} = ${f(r.AsMin)}\\text{ in}^2/\\text{ft},\\ s_{max} = 2h = ${f(r.smax)}\\text{ in}`),
  ]
  const stl = r.steel
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <SolSteps steps={steps} />
      <Tbl head={['middle-strip section', '$M_u$ (k-ft/ft)', 'd (in)', '$A_s$ (in²/ft)', 'design $A_s$']} rows={stl.map((x) => [x.label, f(x.Mu, 3), f(x.d), f(x.as.As), f(x.AsD) + (x.usesMin ? ' (min)' : '')])} />
      <SolSteps
        steps={[
          st('Middle strips, bottom (alt. cranked)', `\\text{short: No. ${r.bar} @ } ${f(r.midA.s)}\\text{ in},\\quad \\text{long: No. ${r.bar} @ } ${f(r.midB.s)}\\text{ in}`, `Positive M: short ${f(r.M.aPosDL, 3)} + ${f(r.M.aPosLL, 3)}, long ${f(r.M.bPosDL, 3)} + ${f(r.M.bPosLL, 3)} k-ft/ft (DL + LL tables).`),
          st(
            'Extra top at the edges',
            (['aNeg', 'aDisc', 'bNeg', 'bDisc'] as const)
              .filter((k) => r.extra[k])
              .map((k) => `\\text{${k.startsWith('a') ? 'short' : 'long'} ${k.endsWith('Neg') ? 'cont.' : 'disc.'}: } ${r.extra[k]!.n}\\text{ extra}`)
              .join(',\\quad '),
            'Discontinuous edge: −M = ⅓ of the positive moment.',
          ),
          st('Column strips', `\\text{short: @ } ${f(r.col.a.s)}\\text{ in},\\ \\text{long: @ } ${f(r.col.b.s)}\\text{ in}`, '1.5 × middle-strip spacing, ≤ 2h, ≥ As,min.'),
          st('Corner steel', r.corner.corners.length ? `\\text{No. ${r.bar} @ } ${f(r.corner.sp.s)}\\text{ in top and bottom over } l_b/5 = ${f(r.corner.zone, 2)}\\text{ ft}` : '\\text{no exterior corner}'),
          st('Shear / beam loads (Table 12.6)', `W_a = ${f(C.Wa)},\\ W_b = ${f(C.Wb)};\\ V_u = ${f(r.shear.Vu, 2)}\\text{ k/ft}\\ ${r.shear.ok ? '\\le' : '>'}\\ \\phi V_c = ${f(r.shear.phiVc, 2)}\\text{ k/ft}`),
        ]}
        start={6}
      />
      <Ans>{`Case ${r.case}, $m = ${f(r.m)}$, $h = ${f(r.h)}$ in: short-way No. ${r.bar} @ ${f(r.midA.s)} in, long-way No. ${r.bar} @ ${f(r.midB.s)} in (middle strips), column strips @ ${f(r.col.a.s)} / ${f(r.col.b.s)} in.`}</Ans>
    </Sol>
  )
}

// ---------------------------------------------------------------- development length
export function ldRow(id: string, fc: number, fy: number, top: boolean, met = true) {
  const b = bar(id)
  const r = ldSimplified({ db: b.db, small: b.small, fc, fy, met, psiT: top ? 1.3 : 1 })
  return { b, r }
}
export function LdSol({ ids, fc, fy, hooks, note }: { ids: string[]; fc: number; fy: number; hooks?: boolean; note?: string }) {
  const rows = ids.flatMap((id) => [true, false].map((top) => ({ top, ...ldRow(id, fc, fy, top) })))
  const sf = Math.sqrt(fc)
  return (
    <Sol>
      {note && <Note>{note}</Note>}
      <SolSteps
        steps={[
          st('Simplified equation (ACI Table 25.4.2.3, clear spacing ≥ 2db and cover ≥ db, or ≥ db with min. stirrups)', `\\ell_d = \\left(\\frac{f_y\\psi_t\\psi_e}{25\\lambda\\sqrt{f'_c}}\\right)d_b\\ \\ (\\text{No. 6 and smaller}),\\qquad \\ell_d = \\left(\\frac{f_y\\psi_t\\psi_e}{20\\lambda\\sqrt{f'_c}}\\right)d_b\\ \\ (\\text{No. 7 and larger})`, `$\\sqrt{f'_c} = ${f(sf, 2)}$ psi; uncoated $\\psi_e = 1.0$; normal weight $\\lambda = 1$; top bars $\\psi_t = 1.3$, other bars 1.0.`),
          ...rows.map((x) =>
            st(
              `${x.b.label} — ${x.top ? 'top bar' : 'other (bottom) bar'}`,
              `\\ell_d = \\frac{${f(fy, 0)}(${x.top ? '1.3' : '1.0'})}{${x.b.small ? 25 : 20}(${f(sf, 2)})}(${f(x.b.db)}) = ${f(x.r.ratio, 1)}d_b = ${f(x.r.ld, 1)}\\text{ in} \\to ${Math.ceil(x.r.final - 1e-6)}\\text{ in}`,
              x.b.mm ? `${x.b.mm} mm = ${f(x.b.db)} in, treated like No. ${x.b.no} (${x.b.small ? 'No. 6 and smaller' : 'No. 7 and larger'}).` : undefined,
            ),
          ),
          ...(hooks
            ? ids.map((id) => {
                const b = bar(id)
                const h = ldhCalc({ db: b.db, fc, fy })
                const g = hookGeometry(b.no, b.db, 90)
                return st(`${b.label} with a 90° standard hook`, `\\ell_{dh} = \\frac{f_y\\psi_e}{50\\lambda\\sqrt{f'_c}}d_b = \\frac{${f(fy, 0)}}{50(${f(sf, 2)})}(${f(b.db)}) = ${f(h.ld, 1)}\\text{ in}\\ (\\ge 8d_b = ${f(8 * b.db, 1)},\\ 6\\text{ in}) \\to ${Math.ceil(h.final - 1e-6)}\\text{ in}`, `Hook: bend diameter ${g.Dk}db = ${f(g.D, 2)} in, extension 12db = ${f(g.tail, 2)} in. Same ldh for top and other bars (no ψt for hooks). ψc = 0.7 could apply with side cover ≥ 2.5 in.`)
              })
            : []),
        ]}
      />
      <Tbl head={['bar', 'top bar ℓd (in)', 'other bar ℓd (in)', ...(hooks ? ['90° hook ℓdh (in)'] : [])]} rows={ids.map((id) => [bar(id).label, `${Math.ceil(ldRow(id, fc, fy, true).r.final - 1e-6)}`, `${Math.ceil(ldRow(id, fc, fy, false).r.final - 1e-6)}`, ...(hooks ? [`${Math.ceil(ldhCalc({ db: bar(id).db, fc, fy }).final - 1e-6)}`] : [])])} />
    </Sol>
  )
}

// ================================================================ 2017-18 figures
const PG = { A1: [31], A2: [31], A3: [31, 32], B: [32], B7: [33], B8: [33] }

const Fig1 = () => (
  <RectSec b={12} h={25} rows={[{ y: 22, n: 3, db: 1.27, label: 'Three No. 10 bars' }]} left={[{ y1: 0, y2: 25, label: 'h = 25″' }]} right={[{ y1: 0, y2: 22, label: 'd = 22″' }]} title="Fig. 1" />
)
const Fig2 = () => <TFloor hf={3} bw={12} sp={48} n={4} h={23} d={20} notes={['Span = 24 ft (continuous T-beams)', 'Fig. 2']} />
const Fig3 = () => (
  <div className="flex flex-wrap items-end justify-center gap-4">
    <div className="flex-1 min-w-[18rem]">
      <SSBeam L={20} udl={['service LL (unfactored) = 2.5 kip/ft', '+ superimposed DL (unfactored) = 1.5 kip/ft (in addition to self-weight)']} note="Fig. 3" />
    </div>
    <div className="w-40">
      <RectSec b={12} h={24} rows={[]} right={[{ y1: 0, y2: 24, label: '24″' }]} s={5} title="Section of beam" />
    </div>
  </div>
)
const Fig4 = () => (
  <RectSec
    b={14}
    h={29}
    rows={[
      { y: 23.5, n: 4, db: 1.128, label: 'Eight No. 9 bars' },
      { y: 26.5, n: 4, db: 1.128 },
    ]}
    left={[{ y1: 0, y2: 26.5, label: 'dt = 26.5″' }]}
    right={[{ y1: 0, y2: 25, label: 'd = 25″' }]}
    title="Fig. 4"
  />
)
const Fig5 = () => (
  <RectSec
    b={12}
    h={31}
    rows={[
      { y: 2.5, n: 3, db: 1.27, label: 'Three No. 10 bars' },
      { y: 25.5, n: 3, db: 1.27, label: 'Six No. 10 bars' },
      { y: 28.5, n: 3, db: 1.27 },
    ]}
    left={[{ y1: 0, y2: 28.5, label: 'dt = 28.5″' }]}
    right={[
      { y1: 0, y2: 27, label: 'd = 27″' },
      { y1: 0, y2: 2.5, label: 'd′ = 2.5″', lvl: 1 },
    ]}
    title="Fig. 5"
  />
)
const Fig6 = () => (
  <SlabStrip
    L={24}
    supports={[
      { x: 5, w: 10, kind: 'wall' },
      { x: 19, w: 10, kind: 'wall' },
    ]}
    dims={[
      { a: 0, b: 5, label: "5'-0\"" },
      { a: 5, b: 19, label: "14'-0\"" },
      { a: 19, b: 24, label: "5'-0\"" },
    ]}
    udl="LL 100 psf + PW 50 psf + FF 30 psf + self-weight"
    title="Fig. 6"
  />
)
const Fig7 = () => <SSBeam L={36} udl={['DL = 2.0 kip/ft (excluding self-wt.)', 'LL = 1.6 kip/ft']} note="Fig. 7" />

function Fig8() {
  const W = 600
  const H = 210
  const x0 = 30
  const L = 4 * 28 + 12
  const k = 540 / L
  const X = (ft: number) => x0 + ft * k
  const yb = 56
  const cols = ['A', 'B', 'C', 'D', 'E']
  const neg = ['', '4.8', '4.4', '4.4', '5.2']
  const pos = ['4.3', '2.96', '2.96', '2.3']
  return (
    <Svg w={W} h={H}>
      <rect x={X(0) - 4} y={yb} width={X(L) - X(0) + 4} height={16} fill={C.conc} stroke={C.ink} strokeWidth={1.3} />
      {cols.map((c, i) => (
        <g key={c}>
          <rect x={X(28 * i) - 4} y={yb + 16} width={8} height={40} fill={C.mute} opacity={0.4} stroke={C.ink} />
          <T x={X(28 * i)} y={yb - 36} w={700}>
            {c}
          </T>
          {neg[i] && (
            <T x={X(28 * i)} y={yb - 16} s={11} c={C.load}>
              −As = {neg[i]} in²
            </T>
          )}
        </g>
      ))}
      {pos.map((p, i) => (
        <T key={i} x={X(28 * i + 14)} y={yb + 34} s={11} c={C.accent}>
          +As = {p} in²
        </T>
      ))}
      <DimChain xs={[0, 28, 56, 84, 112, 124].map(X)} y={yb + 76} labels={["28'", "28'", "28'", "28'", "12'"]} />
      <T x={W / 2} y={yb + 104} s={11} c={C.mute}>
        columns 24″ × 24″ · beam 12″ × 24″ · −As at A not given
      </T>
      <T x={W / 2} y={yb + 126} w={600}>
        Fig. 8
      </T>
    </Svg>
  )
}


// ================================================================ 2017-18 data (inputs to the engines)
const E1c: ElasticInput = { b: 12, h: 25, d: 22, As: 3.81, fc: 4000, n: 8 }
const P2c: DoublyDesignIn = { b: 12, d: 21, dt: 22.5, dp: 2.5, fc: 4, fy: 60, Mu: 500 }
const B3a: BeffIn = { kind: 'interior', L: 24, bw: 12, hf: 3, cc: 48 }
const T3a = { bw: 12, hf: 3, d: 20, fc: 4, fy: 60 }
const L3b: LoadInput = { span: 20, support: 'ss', b: 12, h: 24, sdl: 1.5, ll: 2.5 }
const I4a: SinglyInput = { b: 14, fc: 5000, fy: 60000, layers: [ { As: 4, d: 23.5 }, { As: 4, d: 26.5 } ] }
const P4b: DoublyReviewIn = { b: 12, d: 27, dt: 28.5, dp: 2.5, As: 7.62, Asp: 3.81, fc: 4.5, fy: 60 }
const S5a: CantSlabInput = { span: 14, support: 10, cantL: 5, cantR: 5, ll: 100, ff: 30, pw: 50, fc: 3000, fy: 60000 }
const O6a = { L: 36, b: 12, k: 0.7, fc: 3000, fy: 60000, sdl: 2.0, ll: 1.6 }
let k6aCache: ReturnType<typeof kRhoDesign> | undefined
const k6a = () => (k6aCache ??= kRhoDesign(O6a))
const bm6b = (): ShearBeam => ({ kind: 'ss', L: 36, wD: 2.0, wL: 1.6, selfWeight: { b: 12, h: k6a().sec.h } })
const sec6b = (): ShearSection => ({ bw: 12, d: k6a().sec.dAct, fc: 3000, fy: 60000 })

/** Q8(a): bar selection + standard cut-offs for the 4-span beam (f'c = 4 ksi, fy = 60 ksi assumed) */
function Det8a() {
  const b = 12
  const d = 21.5
  const ln = 28 - 2
  const c = standardCutoffs(ln)
  const asMin = (200 / 60000) * b * d
  const locs: { at: string; As: number; top: boolean }[] = [
    { at: 'A (exterior, top)', As: asMin, top: true },
    { at: 'Span A–B (bottom)', As: 4.3, top: false },
    { at: 'B (top)', As: 4.8, top: true },
    { at: 'Span B–C (bottom)', As: 2.96, top: false },
    { at: 'C (top)', As: 4.4, top: true },
    { at: 'Span C–D (bottom)', As: 2.96, top: false },
    { at: 'D (top)', As: 4.4, top: true },
    { at: 'Span D–E (bottom)', As: 2.3, top: false },
    { at: 'E and cantilever (top)', As: 5.2, top: true },
  ]
  const rows = locs.map((l) => {
    const p = pickBarsS(l.As, b)
    return { ...l, p }
  })
  const ld9 = ldRow('#9', 4000, 60000, true).r
  const ld8 = ldRow('#8', 4000, 60000, false).r
  return (
    <Sol>
      <Note>Assumed: f′c = 4 ksi, fy = 60 ksi, d = 24 − 2.5 = 21.5 in, 1.5 in cover, No. 3 stirrups; spans read c/c, so the clear span ln = 28 − 2 = 26 ft and the cantilever is 12 − 1 = 11 ft from the face of E.</Note>
      <Hd>1. Bars for each required area</Hd>
      <Tbl head={['location', '$A_s$ req (in²)', 'bars', '$A_s$ prov (in²)', 'layers']} rows={rows.map((r) => [r.at + (r.at.startsWith('A (') ? ' — nominal $200b_wd/f_y$' : ''), f(r.As, 2), barTxt(r.p.n, r.p.bar), f(r.p.As, 2), `${r.p.layers}`])} />
      <Hd>2. Cut-off and bend points (standard detail, nearly equal spans with UDL)</Hd>
      <SolSteps
        steps={[
          st('Top bars at interior supports B, C, D', `\\text{extend } \\frac{l_n}{3} = \\frac{${ln}}{3} = ${f(c.topInterior, 2)}\\text{ ft past each face}`, 'About half the bars may stop here; at least 1/3 of −As continues past the inflection point by d, 12db or ln/16.'),
          st('Top bars at the exterior support A', `\\frac{l_n}{4} = ${f(c.topExterior, 2)}\\text{ ft from the face of A, hooked into the column}`),
          st('Bottom bars', `\\text{half stop at } \\frac{l_n}{8} = ${f(c.bottomCut, 2)}\\text{ ft from each face; the rest run 6 in into the supports}`, 'At least 1/4 of +As must continue into the support.'),
          st('Cantilever top steel at E', `\\ell_d(\\text{No. 9 top}) = ${f(ld9.ld, 1)}\\text{ in} = ${f(ld9.ld / 12, 2)}\\text{ ft};\\ \\text{run to the tip (11 ft) and back into D–E by } \\max(l_n/3, \\ell_d) = ${f(Math.max(c.topInterior, ld9.ld / 12), 2)}\\text{ ft}`, 'The cantilever moment is resisted only by these bars, so none are cut short of the free end except about half beyond the point where the remaining bars suffice (+ d or 12db).'),
          st('Bottom bars of D–E at E', `\\ell_d(\\text{No. 8 bottom}) = ${f(ld8.ld, 1)}\\text{ in}`, 'Continue 2 bottom bars into the cantilever as hanger/compression bars.'),
        ]}
      />
      <Hd>3. Long section (schematic) and sections</Hd>
      <Fig8Det topExt={c.topInterior} botCut={c.bottomCut} extA={c.topExterior} />
      <div className="grid grid-cols-2 gap-2">
        <RectSec b={12} h={24} s={5} stirrup title="Section at B" rows={[{ y: 2.5, n: Math.min(rows[2].p.n, 4), db: rows[2].p.db, label: barTxt(rows[2].p.n, rows[2].p.bar) }, { y: 21.5, n: 2, db: rows[1].p.db, label: '2 bottom bars continued' }]} />
        <RectSec b={12} h={24} s={5} stirrup title="Section at midspan A–B" rows={[{ y: 2.5, n: 2, db: 0.75, label: '2 hanger bars' }, { y: 21.5, n: Math.min(rows[1].p.n, 4), db: rows[1].p.db, label: barTxt(rows[1].p.n, rows[1].p.bar) }]} />
      </div>
      <Ans>{`Top bars extend ${f(c.topInterior, 2)} ft past B, C, D, ${f(c.topExterior, 2)} ft past A; half the bottom bars stop ${f(c.bottomCut, 2)} ft from the faces; cantilever bars (${barTxt(rows[8].p.n, rows[8].p.bar)}) run to the tip and ${f(Math.max(c.topInterior, ld9.ld / 12), 2)} ft into span D–E.`}</Ans>
    </Sol>
  )
}

/** schematic long section for Q8(a) */
function Fig8Det({ topExt, botCut, extA }: { topExt: number; botCut: number; extA: number }) {
  const W = 600
  const x0 = 20
  const k = 560 / 124
  const X = (ft: number) => x0 + ft * k
  const y = 40
  return (
    <Svg w={W} h={120}>
      <rect x={X(0)} y={y} width={X(124) - X(0)} height={30} fill={C.conc} stroke={C.ink} />
      {[0, 28, 56, 84, 112].map((s) => (
        <rect key={s} x={X(s) - 4.5} y={y + 30} width={9} height={26} fill={C.mute} opacity={0.4} stroke={C.ink} />
      ))}
      {/* bottom bars */}
      {[0, 28, 56, 84].map((s) => (
        <g key={s}>
          <Ln x1={X(s) + 2} y1={y + 26} x2={X(s + 28) - 2} y2={y + 26} c={C.steel} w={2} />
          <Ln x1={X(s + 1 + botCut)} y1={y + 22} x2={X(s + 27 - botCut)} y2={y + 22} c={C.load} w={2} />
        </g>
      ))}
      {/* top bars */}
      <Ln x1={X(0) + 2} y1={y + 4} x2={X(1 + extA)} y2={y + 4} c={C.steel} w={2} />
      {[28, 56, 84].map((s) => (
        <Ln key={s} x1={X(s - 1 - topExt)} y1={y + 4} x2={X(s + 1 + topExt)} y2={y + 4} c={C.steel} w={2} />
      ))}
      <Ln x1={X(112 - 1 - topExt)} y1={y + 4} x2={X(124) - 2} y2={y + 4} c={C.load} w={2.4} />
      {['A', 'B', 'C', 'D', 'E'].map((t, i) => (
        <T key={t} x={X(28 * i)} y={y - 12} w={700}>
          {t}
        </T>
      ))}
      <T x={W / 2} y={y + 72} s={11} c={C.mute}>
        steel colour: continuous bars · load colour: bars cut at ln/8 (bottom) / cantilever top bars
      </T>
    </Svg>
  )
}

// ================================================================ 2017-18 questions
export const R2017: RcQ[] = [
  {
    id: 'rc-2017-18-1a',
    paper: '2017-18',
    sec: 'A',
    no: '1(a)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Sources of uncertainty and how USD provides safety',
    pages: PG.A1,
    theory: true,
    text: 'What are the sources of uncertainties in analysis, design and construction of RC structure? Discuss how safety is ensured against these uncertainties in USD method.',
    solution: () => <AnsMd a={ANS.uncertainty} />,
  },
  {
    id: 'rc-2017-18-1b',
    paper: '2017-18',
    sec: 'A',
    no: '1(b)',
    marks: 8,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Beam behaviour under increasing load: uncracked, cracked, ultimate',
    pages: PG.A1,
    theory: true,
    text: 'Discuss the behavior of RC rectangular beam in flexure under increasing load by drawing neat sketches for strain and stress distribution of uncracked, cracked and ultimate conditions.',
    solution: () => <AnsMd a={ANS.behaviour} fig={<StagesFig />} />,
  },
  // solve: elastic stresses at M = 50 and 100 k-ft — Mcr check, uncracked transformed vs cracked transformed (n = 8)
  {
    id: 'rc-2017-18-1c',
    paper: '2017-18',
    sec: 'A',
    no: '1(c)',
    marks: 20,
    topics: ['rc-elastic'],
    title: 'Service stresses at M = 50 and 100 kip-ft (12 × 25, 3 No. 10)',
    pages: [31, 34],
    text: r`A singly reinforced RC beam section, as shown in Fig. 1, has a width of 12 in., effective depth of 22 in. and total depth of 25 in. The tension reinforcement consists of three No. 10 bars in one row.

Given: $f'_c = 4$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $f_r = 7.5\sqrt{f'_c}$ psi, $n = 8$.

Find the stresses in concrete and steel caused by bending moments:
- (i) $M = 50$ kip-ft
- (ii) $M = 100$ kip-ft`,
    given: [],
    checks: () => {
      const u = uncracked(E1c)
      const a = elasticAt(E1c, 50)
      const b = elasticAt(E1c, 100)
      return [
        { key: 'mcr', label: 'Cracking moment $M_{cr}$ (uncracked transformed section)', value: u.Mcr, unit: 'k-ft' },
        { key: 'fs50', label: '(i) steel stress at M = 50 k-ft', value: a.fs * 1000, unit: 'psi', tol: 0.03 },
        { key: 'fc100', label: '(ii) concrete stress at M = 100 k-ft', value: b.fc * 1000, unit: 'psi' },
        { key: 'fs100', label: '(ii) steel stress at M = 100 k-ft', value: b.fs * 1000, unit: 'psi' },
      ]
    },
    solution: () => <ElasticAtSol inp={E1c} Ms={[50, 100]} fcAllow={1.8} fsAllow={24} />,
    figure: Fig1,
    notes: [
      'M = 50 kip-ft sits right at cracking: Mcr ≈ 49.4 kip-ft on the gross section but ≈ 60 kip-ft on the uncracked transformed section. Case (i) is uncracked only with the transformed-section convention (Nilson Ex. 3.1 style) — state which one you use.',
      'As = 3 × 1.27 = 3.81 in² (standard bar area, not printed).',
    ],
  },
  {
    id: 'rc-2017-18-2a',
    paper: '2017-18',
    sec: 'A',
    no: '2(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Purpose of minimum flexural steel; ACI/BNBC ρmin',
    pages: PG.A2,
    theory: true,
    text: 'What is the purpose of providing minimum amount of flexural steel in beam? Write ACI/BNBC code provisions for minimum reinforcement ratios.',
    solution: () => <AnsMd a={ANS.minSteel} />,
  },
  {
    id: 'rc-2017-18-2b',
    paper: '2017-18',
    sec: 'A',
    no: '2(b)',
    marks: 10,
    topics: ['rc-singly'],
    title: 'εt = 0.004 through ρmax; φ against εt',
    pages: PG.A2,
    theory: true,
    text: r`Discuss how a minimum tensile strain ($\varepsilon_t = 0.004$) at failure is ensured by not exceeding maximum reinforcement ratio. Also discuss the variation of $\phi$ with $\varepsilon_t$ as given in ACI/BNBC code.`,
    solution: () => <AnsMd a={ANS.rhoMax} fig={<PhiChart />} />,
  },
  // solve: doubly design, b × h fixed — singly limit at εt = 0.005 (dt 22.5), then A's and As for Mu = 500 k-ft
  {
    id: 'rc-2017-18-2c',
    paper: '2017-18',
    sec: 'A',
    no: '2(c)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Size-restricted 12 × 25 section for Mu = 500 kip-ft',
    pages: PG.A2,
    text: r`A beam section is limited to width $b = 12$ in. and total depth $h = 25$ in. Calculate the required reinforcement if the beam has to resist a factored moment $M_u = 500$ kip-ft. Assume two layer tensile reinforcement with $d = 21$ in. and $d_t = 22.5$ in. Also, assume $d' = 2.5$ in. if compression steel is required.

Given: $f'_c = 4$ ksi, $f_y = 60$ ksi.`,
    given: [],
    checks: () => {
      const g = designDoubly(P2c)
      return [
        { key: 'm1', label: 'φMn of the largest singly reinforced section (εt = 0.005)', value: g.sm.phiMn1, unit: 'k-ft' },
        { key: 'asp', label: "Compression steel $A'_s$", value: g.Asp, unit: 'in²', tol: 0.03 },
        { key: 'as', label: 'Tension steel $A_s$', value: g.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => <DoublyDesignSol p={P2c} />,
    notes: ['The singly reinforced limit (εt = 0.005 at dt = 22.5 in) is about 380 kip-ft, so compression steel is needed.'],
  },
  // solve: T-beam review — beff, then φMn for As = 6 (rectangular, a < hf) and As = 9 in² (true T)
  {
    id: 'rc-2017-18-3a',
    paper: '2017-18',
    sec: 'A',
    no: '3(a)',
    marks: 20,
    topics: ['rc-tbeam'],
    title: 'T-beam capacity for As = 6 and 9 in² (3 in slab, 48 in c/c)',
    pages: [31, 34],
    text: r`A floor system consists of a 3 in. concrete slab supported by continuous T beams with a 24 ft span, 48 in. on centres as shown in Fig. 2. Web dimensions are $b_w = 12$ in. and $d = 20$ in. Find the nominal and design positive moment capacity of the section if tensile steel area is:
- (i) $A_s = 6$ in²
- (ii) $A_s = 9$ in²

Given: $f'_c = 4$ ksi, $f_y = 60$ ksi.`,
    given: [],
    checks: () => {
      const b = effectiveWidth(B3a).b
      const r1 = reviewT({ ...T3a, beff: b, As: 6 })
      const r2 = reviewT({ ...T3a, beff: b, As: 9 })
      return [
        { key: 'beff', label: 'Effective flange width', value: b, unit: 'in' },
        { key: 'm1', label: '(i) φMn for As = 6 in²', value: r1.phiMn, unit: 'k-ft' },
        { key: 'a2', label: '(ii) depth of stress block a for As = 9 in²', value: r2.a, unit: 'in' },
        { key: 'm2', label: '(ii) φMn for As = 9 in²', value: r2.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const { o, s } = beffSteps(B3a)
      const r1 = tReviewSteps({ ...T3a, beff: o.b, As: 6 })
      const r2 = tReviewSteps({ ...T3a, beff: o.b, As: 9 })
      return (
        <Sol>
          <SolSteps steps={s} />
          <Hd>(i) As = 6 in²</Hd>
          <SolSteps steps={r1.s} start={2} />
          <Hd>(ii) As = 9 in²</Hd>
          <SolSteps steps={r2.s} start={2 + r1.s.length} />
          <Ans>{`$b_{eff} = ${f(o.b)}$ in. (i) rectangular behaviour: $M_n = ${f(r1.r.Mn / 12, 1)}$, $\\phi M_n = ${f(r1.r.phiMn, 1)}$ k-ft. (ii) true T: $M_n = ${f(r2.r.Mn / 12, 1)}$, $\\phi M_n = ${f(r2.r.phiMn, 1)}$ k-ft.`}</Ans>
        </Sol>
      )
    },
    figure: Fig2,
    notes: ['beff = min(L/4 = 72 in, bw + 16hf = 60 in, c/c = 48 in) = 48 in. Expect (i) to act as a rectangle (a < 3 in) and (ii) as a true T.'],
  },
  // solve: design As, fixed 12 × 24, SS 20 ft, wu = 1.2(1.5 + sw) + 1.6(2.5), d = h − 2.5
  {
    id: 'rc-2017-18-3b',
    paper: '2017-18',
    sec: 'A',
    no: '3(b)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Design As for a 12 × 24 beam, 20 ft simple span',
    pages: [32, 34],
    text: r`A rectangular beam carries a service live load (unfactored) of 2.5 kip/ft and an unfactored superimposed dead load of 1.5 kip/ft (in addition to self-weight of beam) on a 20 ft simple span as shown in Fig. 3. The beam will have a cross-section of 12″ × 24″ for architectural reason. Design the beam for flexure using USD method.

Given: $f'_c = 3.5$ ksi, $f_y = 60$ ksi.`,
    given: [],
    checks: () => {
      const g = fixedDesign(L3b, 12, 21.5, 3500, 60000)
      return [
        { key: 'wu', label: 'Factored load $w_u$ (incl. self-weight)', value: g.L.wu, unit: 'k/ft' },
        { key: 'mu', label: 'Design moment $M_u$', value: g.L.Mu, unit: 'k-ft' },
        { key: 'as', label: 'Required $A_s$ (d = 21.5 in)', value: g.D.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => <FixedDesignSol load={L3b} b={12} d={21.5} fc={3500} fy={60000} note="d = h − 2.5 = 21.5 in assumed (one layer, 1.5 in cover + No. 3 stirrup + half bar)." />,
    figure: Fig3,
    notes: ['d is not given: take d = 24 − 2.5 = 21.5 in (one layer). Self-weight = 12 × 24/144 × 0.150 = 0.30 k/ft. Load factors 1.2D + 1.6L.'],
  },
  // solve: singly review, two rows — a, c, εt (transition zone), φ, Mn and φMn
  {
    id: 'rc-2017-18-4a',
    paper: '2017-18',
    sec: 'A',
    no: '4(a)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Mn and φMn of 14 × d25 with 8 No. 9 (transition zone)',
    pages: [32, 35],
    text: r`A rectangular beam has width 14 in. and effective depth 25 in. as shown in Fig. 4. It is reinforced with eight No. 9 bars in two rows ($d = 25''$, $d_t = 26.5''$). What is the nominal flexural strength $M_n$ and what is the maximum moment $\phi M_n$ that can be utilized in the design?

Given: $f'_c = 5.0$ ksi, $f_y = 60$ ksi.`,
    given: [],
    checks: () => {
      const r = review(I4a)
      return [
        { key: 'c', label: 'Neutral-axis depth c', value: r.c, unit: 'in' },
        { key: 'et', label: 'Net tensile strain εt', value: r.epsT, tol: 0.03 },
        { key: 'mn', label: 'Nominal strength $M_n$', value: r.Mn, unit: 'k-ft' },
        { key: 'pmn', label: 'Design strength $\\phi M_n$', value: r.phiMn, unit: 'k-ft', tol: 0.03 },
      ]
    },
    solution: () => <SinglyReviewSol inp={I4a} />,
    figure: Fig4,
    notes: ['β1 = 0.80; εt comes out just under 0.005, so φ is in the transition zone and depends on the φ formula used (class: φ = 0.483 + 83.3εt).', 'h is not printed; the drawing uses h ≈ 29 in.'],
  },
  // solve: doubly review — A's does not yield (quadratic for c), f's, εt, φMn
  {
    id: 'rc-2017-18-4b',
    paper: '2017-18',
    sec: 'A',
    no: '4(b)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Doubly reinforced review: 6 No. 10 / 3 No. 10, check f′s and εt',
    pages: [32, 35],
    text: r`A rectangular RC beam as shown in Fig. 5 measures 12 in. wide and has an effective depth of 27 in. Tension steel consists of six No. 10 bars in two layers ($d = 27$ in., $d_t = 28.5$ in.) and compression steel consists of three No. 10 bars located 2.5 in. from the compression face. What is the design moment capacity of the beam according to ACI/BNBC code? Check for yielding of compression steel and $\varepsilon_t$.

Given: $f'_c = 4.5$ ksi, $f_y = 60$ ksi.`,
    given: [],
    checks: () => {
      const r = reviewDoubly(P4b)
      return [
        { key: 'c', label: 'Neutral-axis depth c', value: r.c, unit: 'in' },
        { key: 'fsp', label: "Compression-steel stress $f'_s$", value: r.fsp, unit: 'ksi', tol: 0.03 },
        { key: 'et', label: 'Net tensile strain εt', value: r.epsT, tol: 0.03 },
        { key: 'pmn', label: 'Design moment capacity $\\phi M_n$', value: r.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => <DoublyReviewSol p={P4b} />,
    figure: Fig5,
    notes: ['β1 = 0.825. The compression steel does not yield here, so use the non-yield branch (quadratic in c).', 'h is not printed; the drawing uses h ≈ 31 in.'],
  },
  // solve: one-way slab strip with overhangs — h, loads, LL patterns for max +M (span) and max −M (support), As, T&S
  {
    id: 'rc-2017-18-5a',
    paper: '2017-18',
    sec: 'B',
    no: '5(a)',
    marks: 23,
    topics: ['rc-oneway'],
    title: 'One-way slab, 14 ft span with 5 ft overhangs, LL patterns',
    pages: [32, 35],
    text: r`A 14 ft clear span one-way slab with an overhanging cantilever span of 5 ft as shown in Fig. 6 is to be designed. The slab supports live load 100 psf in addition to its own weight. Design the slab for maximum positive and negative moments. The live load can occupy any portion or any position on the slab.

Given: PW load = 50 psf; FF load = 30 psf; $f'_c = 3000$ psi and $f_y = 60\,000$ psi.`,
    given: [],
    checks: () => {
      const r = cantSlab(S5a)
      return [
        { key: 'h', label: 'Slab thickness h', value: r.h, unit: 'in' },
        { key: 'mn', label: 'Max negative moment (support face)', value: r.Mneg, unit: 'k-ft/ft' },
        { key: 'mp', label: 'Max positive moment (LL on span only)', value: r.Mpos, unit: 'k-ft/ft', tol: 0.03 },
      ]
    },
    solution: () => <CantSlabSol p={S5a} note="Read as Fig. 6: 5 ft cantilevers on both sides, measured from the support faces; supports taken as 10 in walls." />,
    figure: Fig6,
    notes: [
      'Text and figure disagree: the text says "an overhanging cantilever span of 5 ft" (one), but Fig. 6 draws 5 ft cantilevers on both sides. The redrawn figure follows the scan (both sides).',
      'Slab thickness and support widths are not given; supports drawn as narrow walls.',
    ],
  },
  {
    id: 'rc-2017-18-5b',
    paper: '2017-18',
    sec: 'B',
    no: '5(b)',
    marks: 12,
    topics: ['rc-oneway', 'rc-twoway'],
    title: 'Minimum slab steel and spacing; why and how T&S steel',
    pages: PG.B,
    theory: true,
    text: 'What are the minimum reinforcements and their maximum spacing for two-way and one-way slabs? Discuss why and how temperature and shrinkage reinforcement is provided in one-way slab.',
    solution: () => (
      <AnsMd
        a={
          r`### Minimum reinforcement and maximum spacing
- **One-way slab**: minimum main (flexural) steel = T&S ratio on the gross section — $0.0018bh$ for Grade 60, $0.0020bh$ for Grade 40/50, $0.0018 \times 60\,000/f_y \ge 0.0014$ for $f_y > 60$ ksi. Main-bar spacing ≤ **3h or 18 in**. Distribution (T&S) bars ≤ **5h or 18 in**.
- **Two-way slab**: the same minimum ratio ($0.0018bh$ Grade 60) in **each** direction. Spacing at critical sections ≤ **2h** (and ≤ 18 in); elsewhere ≤ 3h.
- Practical lower limit on spacing ≈ 4–4.5 in so bars do not congest.

` + ANS.ts
        }
      />
    ),
  },
  // solve: design SS beam with ρ = 0.7ρmax — d from R, h, self-weight iteration, As
  {
    id: 'rc-2017-18-6a',
    paper: '2017-18',
    sec: 'B',
    no: '6(a)',
    marks: 17,
    topics: ['rc-singly'],
    title: 'Design a 36 ft simply supported beam with ρ = 0.7ρmax',
    pages: [32, 35],
    text: r`Design a singly reinforced beam shown in Fig. 7. The dead load does not include self-weight of the beam. Assume $f'_c = 3.0$ ksi; $f_y = 60$ ksi; $b = 12''$ and $\rho = 0.7\rho_{max}$.

Fig. 7: simple span 36′-0″; DL = 2.0 kip/ft (excluding self-weight); LL = 1.6 kip/ft.`,
    given: [],
    checks: () => {
      const g = k6a()
      return [
        { key: 'rho', label: 'ρ = 0.7ρmax', value: g.rho, tol: 0.01 },
        { key: 'mu', label: 'Design moment $M_u$ (with self-weight)', value: g.Mu, unit: 'k-ft', tol: 0.03 },
        { key: 'h', label: 'Total depth h (rounded)', value: g.sec.h, unit: 'in', tol: 0.03 },
        { key: 'as', label: 'Tension steel $A_s$', value: g.D.As, unit: 'in²', tol: 0.04 },
      ]
    },
    solution: () => <KRhoSol o={O6a} note="Self-weight estimated, then iterated until h stops changing. Two layers of bars are needed in a 12 in web, so d = h − 3.5 in." />,
    figure: Fig7,
    notes: ['Self-weight must be estimated and iterated. ρmax is taken at εt = 0.004.'],
  },
  // solve: stirrups for the 6(a) beam — UDL only, Vu at d, φVc, zones (Case A–D), #3 two-legged spacing, sketch
  {
    id: 'rc-2017-18-6b',
    paper: '2017-18',
    sec: 'B',
    no: '6(b)',
    marks: 18,
    topics: ['rc-shear'],
    title: 'Stirrups for the 36 ft beam of Q6(a)',
    pages: [32, 35],
    text: r`Design the stirrups for the beam in Q. 6(a) and make a neat sketch showing the stirrups.

(Fig. 7: 36′-0″ simple span, DL = 2.0 kip/ft excluding self-weight, LL = 1.6 kip/ft; $b = 12''$, $d$ from Q6(a); $f'_c = 3.0$ ksi, $f_y = 60$ ksi.)`,
    given: [],
    checks: () => {
      const { R, at, g } = shearKey(bm6b(), sec6b())
      return [
        { key: 'vd', label: 'Vu at d from the support', value: R.Vd, unit: 'k' },
        { key: 'pvc', label: 'φVc', value: g.lim.phiVc, unit: 'k' },
        { key: 's', label: 'Required stirrup spacing at the critical section (No. 3 U)', value: at.s, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => <ShearSol bm={bm6b()} sec={sec6b()} note={`b = 12 in, h = ${k6a().sec.h} in and d = ${f(k6a().sec.dAct)} in from Q6(a); self-weight of that section included.`} />,
    figure: Fig7,
    notes: ['Depends on d chosen in Q6(a). Unlike the other stirrup questions there is no "3 sets of spacing" wording. Stirrup fyt taken as 60 ksi.'],
  },
  {
    id: 'rc-2017-18-7a',
    paper: '2017-18',
    sec: 'B',
    no: '7(a)',
    marks: 10,
    topics: ['rc-basics'],
    title: 'Five RC floor slabs used in Bangladesh',
    pages: PG.B7,
    theory: true,
    text: 'Describe with neat sketches five reinforced concrete floor slabs commonly used in Bangladesh.',
    solution: () => <AnsMd a={ANS.floorSystems} fig={<FloorSystemsFig />} />,
  },
  {
    id: 'rc-2017-18-7b',
    paper: '2017-18',
    sec: 'B',
    no: '7(b)',
    marks: 10,
    topics: ['rc-twoway'],
    title: 'Corner reinforcement at exterior corners of two-way slabs',
    pages: PG.B7,
    theory: true,
    text: 'Discuss in short about the special reinforcements provided at exterior corners of a two-way slab system.',
    solution: () => <AnsMd a={ANS.corner} fig={<CornerFig />} />,
  },
  {
    id: 'rc-2017-18-7c',
    paper: '2017-18',
    sec: 'B',
    no: '7(c)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Development length of bundled bars',
    pages: PG.B7,
    theory: true,
    text: 'Why does ACI/BNBC code recommend increased development lengths for bars in a bundled group of reinforcements? Mention the recommended increased lengths for such bars.',
    solution: () => <AnsMd a={ANS.bundled} />,
  },
  {
    id: 'rc-2017-18-7d',
    paper: '2017-18',
    sec: 'B',
    no: '7(d)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Minimum lap length for column splices (BNBC)',
    pages: PG.B7,
    theory: true,
    text: 'What are the minimum length of lap for column splices as per BNBC code?',
    solution: () => <AnsMd a={ANS.colSplice} />,
  },
  // solve: detailing — choose bars for each As, standard cut-offs (ln/3, ln/4, ln/8), cantilever top steel anchored into D–E, long section + sections
  {
    id: 'rc-2017-18-8a',
    paper: '2017-18',
    sec: 'B',
    no: '8(a)',
    marks: 20,
    topics: ['rc-bond'],
    title: 'Detail a 4-span beam with cantilever from given As',
    pages: [33, 35],
    text: r`A 4-span beam with a cantilever on one side is shown in Fig. 8. For a certain loading system the required flexural reinforcement areas calculated from corresponding design moments at different positions are given in Fig. 8. Make a detail drawing showing all the reinforcements. Columns are 24″ × 24″ and beam size is 12″ × 24″. Make sections also.

Fig. 8: spans A–B = B–C = C–D = D–E = 28′, cantilever beyond E = 12′.
- $+A_s$(A–B) = 4.3 in², $-A_s$(B) = 4.8 in²
- $+A_s$(B–C) = 2.96 in², $-A_s$(C) = 4.4 in²
- $+A_s$(C–D) = 2.96 in², $-A_s$(D) = 4.4 in²
- $+A_s$(D–E) = 2.3 in², $-A_s$(E) = 5.2 in²`,
    given: [],
    checks: () => {
      const c = standardCutoffs(26)
      return [
        { key: 'top', label: 'Top bars at B, C, D: extension past each support face (ln = 26 ft)', value: c.topInterior, unit: 'ft' },
        { key: 'bot', label: 'Half the bottom bars stop this far from the support faces', value: c.bottomCut, unit: 'ft' },
        { key: 'ld', label: 'ℓd of the cantilever top bars (No. 9 top bars, simplified)', value: ldRow('#9', 4000, 60000, true).r.final, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => <Det8a />,
    figure: Fig8,
    notes: [
      '−As at A is not given (provide minimum/nominal top steel). The 28′ dimensions are drawn between column lines, read as c/c.',
      'f′c and fy are not given: assume e.g. 3–4 ksi and 60 ksi. The 5.2 in² cantilever top steel at E must be anchored back into span D–E.',
    ],
  },
  {
    id: 'rc-2017-18-8b',
    paper: '2017-18',
    sec: 'B',
    no: '8(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Standard cut-off / bend points, nearly equal spans with UDL',
    pages: PG.B8,
    theory: true,
    text: 'Show with neat sketches cut off or bend points for bars in approximately equal spans with uniformly distributed loads.',
    solution: () => <AnsMd a={ANS.cutoff} fig={<CutoffFig />} />,
  },
  {
    id: 'rc-2017-18-8c',
    paper: '2017-18',
    sec: 'B',
    no: '8(c)',
    marks: 7,
    topics: ['rc-shear'],
    title: 'Seismic hoops in beams, moderate seismic zone (Dhaka)',
    pages: PG.B8,
    theory: true,
    flag: 'Seismic detailing (IMRF hoops) — not in the current CE 315 slides',
    text: 'What are the BNBC/ACI code provisions for beam stirrups (hoops) for moderate seismic risk region e.g., Dhaka?',
    solution: () => <AnsMd a={ANS.hoops} fig={<HoopFig />} />,
  },
]
