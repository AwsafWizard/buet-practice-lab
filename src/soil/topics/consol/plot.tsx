// Small SVG chart kit for the consolidation and stress-distribution labs and chart-pane items:
// linear or log axes, grid, tick labels, and a render prop with the scales. Theme tokens only.
import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { axisName, tipAxes } from '../../../components/PointTip'

export interface Axis {
  min: number
  max: number
  log?: boolean
  /** reverse the axis (e.g. depth or Tv downwards) */
  flip?: boolean
  ticks?: number[]
  label?: ReactNode
  fmt?: (v: number) => string
  /** extra unlabeled grid lines (log axes: 2…9 in each decade by default) */
  minor?: boolean
}
export interface Scales {
  X: (v: number) => number
  Y: (v: number) => number
  L: number
  R: number
  T: number
  B: number
}

export const SERIES = ['var(--c-accent)', 'var(--c-load)', 'var(--c-water)', 'var(--c-shear)', 'var(--c-moment)', 'var(--c-axial)', 'var(--c-good)', 'var(--c-accent2)', 'var(--c-steel)', 'var(--c-bad)']

export function logTicks(min: number, max: number) {
  const out: number[] = []
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) {
    const v = 10 ** e
    if (v >= min * 0.999 && v <= max * 1.001) out.push(v)
  }
  return out
}
export function linTicks(min: number, max: number, n = 5) {
  const span = max - min
  const raw = span / n
  const p = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((k) => k * p).find((s) => span / s <= n + 0.5) ?? p * 10
  const out: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v)
  return out
}

function scale(a: Axis, lo: number, hi: number) {
  const f = (v: number) => (a.log ? Math.log10(Math.max(v, 1e-12)) : v)
  const m0 = f(a.min)
  const m1 = f(a.max)
  return (v: number) => {
    const t = (f(v) - m0) / (m1 - m0)
    return a.flip ? hi - t * (hi - lo) : lo + t * (hi - lo)
  }
}

export const pathOf = (pts: [number, number][], s: Scales) =>
  pts
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
    .map(([x, y], i) => `${i ? 'L' : 'M'}${s.X(x).toFixed(1)},${s.Y(y).toFixed(1)}`)
    .join(' ')

/** a framed chart; y axis drawn on the left, x on the bottom (or the top with xTop) */
export function Chart({
  w = 360,
  h = 230,
  x,
  y,
  xTop,
  pad = { l: 44, r: 12, t: 12, b: 34 },
  children,
  label,
  className,
}: {
  w?: number
  h?: number
  x: Axis
  y: Axis
  xTop?: boolean
  pad?: { l: number; r: number; t: number; b: number }
  children?: (s: Scales) => ReactNode
  label?: string
  className?: string
}) {
  const L = pad.l
  const R = w - pad.r
  const T = pad.t + (xTop ? 18 : 0)
  const B = h - pad.b + (xTop ? 20 : 0)
  // y grows downward in SVG: a y axis that is not flipped must map min → bottom
  const X = scale(x, L, R)
  const Yraw = scale({ ...y, flip: !y.flip }, T, B)
  const s: Scales = { X, Y: Yraw, L, R, T, B }
  const xt = x.ticks ?? (x.log ? logTicks(x.min, x.max) : linTicks(x.min, x.max))
  const yt = y.ticks ?? (y.log ? logTicks(y.min, y.max) : linTicks(y.min, y.max))
  const minor = (a: Axis) => {
    if (!a.log || a.minor === false) return []
    const out: number[] = []
    for (let e = Math.floor(Math.log10(a.min)); e <= Math.ceil(Math.log10(a.max)); e++)
      for (let k = 2; k <= 9; k++) {
        const v = k * 10 ** e
        if (v > a.min && v < a.max) out.push(v)
      }
    return out
  }
  const fx = x.fmt ?? ((v: number) => fmt(v, 3))
  const fy = y.fmt ?? ((v: number) => fmt(v, 3))
  const xLabY = xTop ? T - 6 : B + 13
  const xn = axisName(x.label, 'x')
  const yn = axisName(y.label, 'y')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className ?? 'w-full'} role="img" aria-label={label ?? 'chart'} style={{ maxWidth: w * 1.6 }} {...tipAxes({ X, Y: Yraw, xLog: x.log, yLog: y.log, x: xn.name, y: yn.name, xUnit: xn.unit, yUnit: yn.unit })}>
      <rect x={L} y={T} width={R - L} height={B - T} fill="none" stroke="var(--c-line)" />
      {minor(x).map((v) => (
        <line key={'mx' + v} x1={X(v)} x2={X(v)} y1={T} y2={B} stroke="var(--c-line)" strokeWidth={0.4} opacity={0.6} />
      ))}
      {minor(y).map((v) => (
        <line key={'my' + v} y1={Yraw(v)} y2={Yraw(v)} x1={L} x2={R} stroke="var(--c-line)" strokeWidth={0.4} opacity={0.6} />
      ))}
      {xt.map((v) => (
        <g key={'x' + v}>
          <line x1={X(v)} x2={X(v)} y1={T} y2={B} stroke="var(--c-line)" strokeWidth={0.7} />
          <text x={X(v)} y={xLabY} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
            {fx(v)}
          </text>
        </g>
      ))}
      {yt.map((v) => (
        <g key={'y' + v}>
          <line y1={Yraw(v)} y2={Yraw(v)} x1={L} x2={R} stroke="var(--c-line)" strokeWidth={0.7} />
          <text x={L - 4} y={Yraw(v) + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
            {fy(v)}
          </text>
        </g>
      ))}
      {x.label && (
        <text x={(L + R) / 2} y={xTop ? 10 : h - 4} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
          {x.label}
        </text>
      )}
      {y.label && (
        <text x={10} y={(T + B) / 2} fontSize={10} textAnchor="middle" fill="var(--c-ink)" transform={`rotate(-90 10 ${(T + B) / 2})`}>
          {y.label}
        </text>
      )}
      <g>{children?.(s)}</g>
    </svg>
  )
}

/** a small legend row */
export function Legend({ items }: { items: { c: string; t: ReactNode; dash?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-mute">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <svg width={18} height={8}>
            <line x1={1} x2={17} y1={4} y2={4} stroke={it.c} strokeWidth={2} strokeDasharray={it.dash ? '4 2' : undefined} />
          </svg>
          {it.t}
        </span>
      ))}
    </div>
  )
}
