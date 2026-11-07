// Shared pieces for the "playground" labs: x-aligned 1-D plots under a drawing, responsive drawing
// width, small chips and readout rows.

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { fmt } from '../components/DiagramView'
import { GhostPts, tipName } from '../components/PointTip'
import type { Transform } from '../components/StructureView'
import { ildAt, type ILD, type Pt } from '../engine/ild'

export const PG_PAD = 56
export const PG_W_MAX = 820
export const PG_W_MIN = 380

/** drawing width that follows the column it sits in (clamped), so text stays readable on a phone */
export function useColumnWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(PG_W_MAX)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setW(Math.round(Math.min(PG_W_MAX, Math.max(PG_W_MIN, e.contentRect.width - 16)))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

/** pointer event → world x/y in a StructureView drawing (handles the svg's scaling) */
export function eventToWorld(e: React.PointerEvent, t: Transform, pad = PG_PAD) {
  const svg = (e.currentTarget as SVGGraphicsElement).ownerSVGElement
  const ctm = svg?.getScreenCTM()
  if (!svg || !ctm) return null
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(ctm.inverse())
  return { x: t.minX + (p.x - pad) / t.k, y: t.minY + (t.y(t.minY) - p.y) / t.k }
}

/** sweep a value from lo to hi and wrap, ~`seconds` per pass, while `on` */
export function useSweep(on: boolean, lo: number, hi: number, set: (f: (x: number) => number) => void, seconds = 7) {
  useEffect(() => {
    if (!on) return
    let raf = 0
    let last = performance.now()
    const speed = (hi - lo) / seconds
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      set((x) => {
        const nx = x + speed * dt
        return nx > hi ? lo : nx
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [on, lo, hi])
}

export function Chip({ children, onRemove, active }: { children: ReactNode; onRemove?: () => void; active?: boolean }) {
  return (
    <span className={'inline-flex items-center gap-1 rounded-full border bg-panel2 pl-2.5 py-0.5 text-xs font-semibold ' + (onRemove ? 'pr-1 ' : 'pr-2.5 ') + (active ? 'border-accent text-accent' : 'border-line')}>
      {children}
      {onRemove && (
        <button className="ml-0.5 w-4 h-4 rounded-full text-mute hover:text-bad hover:bg-bad/10 leading-none" title="remove" onClick={onRemove}>
          ×
        </button>
      )}
    </span>
  )
}

export function Row({ k, v, strong }: { k: ReactNode; v: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm py-0.5">
      <span className="text-mute">{k}</span>
      <span className={'num ' + (strong ? 'font-bold' : 'font-semibold')}>{v}</span>
    </div>
  )
}

/** "value from the solve" = P × ILD ordinate (+ any fixed part), with a tick */
export function TwoWays({ name, value, P, eta, unit, rest }: { name: ReactNode; value: number; P: number; eta: number; unit: string; rest?: { label: string; value: number } }) {
  const viaILD = P * eta + (rest?.value ?? 0)
  const ok = Math.abs(viaILD - value) <= 1e-6 * Math.max(1, Math.abs(value))
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-2 items-baseline text-sm py-1 border-t border-line/50 first-of-type:border-0">
      <span className="font-bold">{name}</span>
      <span className="num text-right">
        <span>{fmt(value)}</span>
        <span className="text-mute">
          {' '}
          = {fmt(P)} × {fmt(eta, 3)}
          {rest && ` + ${fmt(rest.value)} (${rest.label})`}
        </span>
        <span className={'ml-1 ' + (ok ? 'text-good' : 'text-bad')}>{ok ? '✓' : '≠'}</span>
        <span className="text-faint text-xs"> {unit}</span>
      </span>
    </div>
  )
}

export function StatusBox({ c, t, d, children }: { c: string; t: ReactNode; d?: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-xl px-3 py-2 text-sm" style={{ background: `color-mix(in oklab, ${c} 10%, transparent)`, borderLeft: `3px solid ${c}` }}>
      <div className="font-bold" style={{ color: c }}>
        {t}
      </div>
      {d && <div className="text-mute text-xs mt-0.5">{d}</div>}
      {children}
    </div>
  )
}

export function Tries({ children }: { children: ReactNode }) {
  return (
    <div className="card p-3 text-xs leading-relaxed">
      <div className="font-bold text-sm mb-1">Things to try</div>
      <ul className="list-disc pl-4 space-y-1 text-mute">{children}</ul>
    </div>
  )
}

// ---------------------------------------------------------------- 1-D plot aligned with a drawing

export interface PlotProps {
  title: ReactNode
  badge?: string
  pts: Pt[]
  /** x range drawn (must match the drawing above: same pad, same width) */
  x0?: number
  x1: number
  W: number
  pad?: number
  color: string
  /** green / red fill by sign (ILDs) instead of a single colour */
  sign?: boolean
  /** plot positive values downward */
  flip?: boolean
  digits?: number
  labelXs?: number[]
  secX?: number
  loadX?: number
  /** ILD trace mode: only draw up to this x */
  clipTo?: number
  dot?: { x: number; y?: number; color: string }
  /** dashed comparison curve (same scale) */
  ghost?: Pt[]
  ghostLabel?: string
  height?: number
}

export function valueAt(pts: Pt[], x: number, side: -1 | 1 = 1) {
  if (!pts.length) return 0
  const ild: ILD = { pts, xmin: pts[0].x, xmax: pts[pts.length - 1].x }
  return ildAt(ild, x, side)
}

export function Plot(p: PlotProps) {
  const cid = useId().replace(/:/g, '')
  const pad = p.pad ?? PG_PAD
  const x0 = p.x0 ?? 0
  const H = p.height ?? 150
  const top = 24
  const k = (p.W - 2 * pad) / Math.max(p.x1 - x0, 1e-6)
  const X = (x: number) => pad + (x - x0) * k
  const yMax = Math.max(1e-9, ...p.pts.map((q) => Math.abs(q.y)), ...(p.ghost ?? []).map((q) => Math.abs(q.y)))
  const allZero = Math.max(0, ...p.pts.map((q) => Math.abs(q.y))) < 1e-7
  const ky = ((H - top) / 2 - 18) / yMax
  const mid = top + (H - top) / 2
  const sgn = p.flip ? -1 : 1
  const Y = (v: number) => mid - sgn * v * ky
  const digits = p.digits ?? 2

  const fills = useMemo(() => {
    const pos: string[] = []
    const neg: string[] = []
    const pts = p.pts
    const seg = (u: Pt, v: Pt, arr: string[]) => arr.push(`M${X(u.x)},${Y(0)} L${X(u.x)},${Y(u.y)} L${X(v.x)},${Y(v.y)} L${X(v.x)},${Y(0)} Z`)
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      if (b.x - a.x < 1e-9) continue
      if (a.y >= 0 && b.y >= 0) seg(a, b, pos)
      else if (a.y <= 0 && b.y <= 0) seg(a, b, neg)
      else {
        const z = { x: a.x + (a.y / (a.y - b.y)) * (b.x - a.x), y: 0 }
        seg(a, z, a.y > 0 ? pos : neg)
        seg(z, b, a.y > 0 ? neg : pos)
      }
    }
    return { pos: pos.join(' '), neg: neg.join(' ') }
  }, [p.pts, p.W, x0, p.x1, p.flip, yMax])

  // value labels: requested stations (both sides of jumps) + interior extremes, thinned so they don't collide
  const labels = useMemo(() => {
    if (allZero) return []
    const cands: { x: number; v: number; dx: number }[] = []
    for (const x of p.labelXs ?? []) {
      const l = valueAt(p.pts, x, -1)
      const r = valueAt(p.pts, x, 1)
      if (Math.abs(l - r) > 1e-7 && x > x0 + 1e-9 && x < p.x1 - 1e-9) cands.push({ x, v: l, dx: -7 }, { x, v: r, dx: 7 })
      else cands.push({ x, v: x >= p.x1 - 1e-9 ? l : r, dx: 0 })
    }
    for (let i = 1; i < p.pts.length - 1; i++) {
      const a = p.pts[i - 1].y
      const b = p.pts[i].y
      const c = p.pts[i + 1].y
      if ((b > a && b > c) || (b < a && b < c)) cands.push({ x: p.pts[i].x, v: b, dx: 0 })
    }
    // one label per flat run (SFD steps): same value with nothing different in between
    const flat = (xa: number, xb: number, v: number) => {
      const lo = Math.min(xa, xb)
      const hi = Math.max(xa, xb)
      return p.pts.every((q) => q.x <= lo + 1e-9 || q.x >= hi - 1e-9 || Math.abs(q.y - v) < 1e-7)
    }
    const placed: { px: number; py: number }[] = []
    const out: { x: number; v: number; dx: number }[] = []
    for (const c of cands.sort((a, b) => Math.abs(b.v) - Math.abs(a.v))) {
      if (Math.abs(c.v) < 5e-4 * Math.max(1, yMax)) continue
      if (p.clipTo !== undefined && c.x > p.clipTo + 1e-9) continue
      const px = X(c.x) + c.dx
      const py = Y(c.v)
      if (placed.some((q) => Math.abs(q.px - px) < 34 && Math.abs(q.py - py) < 15)) continue
      if (out.some((q) => Math.abs(q.v - c.v) < 1e-7 && flat(q.x, c.x, c.v))) continue
      placed.push({ px, py })
      out.push(c)
    }
    return out
  }, [p.pts, p.labelXs, p.clipTo, p.W, x0, p.x1, p.flip, yMax])

  const path = (pts: Pt[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${X(q.x)},${Y(q.y)}`).join(' ')
  const clip = p.clipTo !== undefined ? `url(#c${cid})` : undefined
  const dotV = p.dot ? (p.dot.y ?? valueAt(p.pts, p.dot.x, 1)) : 0
  const dotVisible = p.dot && (p.clipTo === undefined || p.dot.x <= p.clipTo + 1e-9)

  return (
    <svg viewBox={`0 0 ${p.W} ${H}`} className="w-full h-auto">
      {p.clipTo !== undefined && (
        <defs>
          <clipPath id={`c${cid}`}>
            <rect x={0} y={0} width={X(p.clipTo)} height={H} />
          </clipPath>
        </defs>
      )}
      <text x={8} y={16} fontSize={12.5} fontWeight={700} fill="var(--c-mute)">
        {p.title}
      </text>
      {p.badge && (
        <text x={p.W - 8} y={16} fontSize={12.5} fontWeight={700} textAnchor="end" fill="var(--c-ink)" className="num">
          {p.badge}
        </text>
      )}
      <line x1={X(x0)} y1={Y(0)} x2={X(p.x1)} y2={Y(0)} stroke="var(--c-faint)" strokeWidth={1.2} />
      {p.secX !== undefined && <line x1={X(p.secX)} x2={X(p.secX)} y1={top} y2={H - 4} stroke="var(--c-accent)" strokeWidth={1.2} strokeDasharray="5 3" opacity={0.8} />}
      {p.loadX !== undefined && <line x1={X(p.loadX)} x2={X(p.loadX)} y1={top} y2={H - 4} stroke="var(--c-load)" strokeWidth={1.2} strokeDasharray="2 3" opacity={0.9} />}
      {p.ghost && <path d={path(p.ghost)} fill="none" stroke="var(--c-faint)" strokeWidth={1.6} strokeDasharray="5 4" />}
      {p.ghost && p.ghostLabel && (
        <text x={p.W - 8} y={H - 6} fontSize={10.5} textAnchor="end" fill="var(--c-faint)">
          - - - {p.ghostLabel}
        </text>
      )}
      <g clipPath={clip}>
        {p.sign ? (
          <>
            <path d={fills.pos} fill="var(--c-good)" fillOpacity={0.15} />
            <path d={fills.neg} fill="var(--c-bad)" fillOpacity={0.15} />
          </>
        ) : (
          <>
            <path d={fills.pos} fill={p.color} fillOpacity={0.16} />
            <path d={fills.neg} fill={p.color} fillOpacity={0.16} />
          </>
        )}
        <path d={path(p.pts)} fill="none" stroke={p.color} strokeWidth={2.2} strokeLinejoin="round" />
      </g>
      {!allZero && (
        <GhostPts
          pts={p.pts
            .filter((q) => p.clipTo === undefined || q.x <= p.clipTo + 1e-9)
            .map((q) => ({ x: X(q.x), y: Y(q.y), tip: `${tipName(p.title) ? tipName(p.title) + ': ' : ''}${fmt(q.y, digits + 1)} at x = ${fmt(q.x, 3)}` }))}
        />
      )}
      {allZero && (
        <text x={X((x0 + p.x1) / 2)} y={Y(0) - 8} textAnchor="middle" fontSize={12} fill="var(--c-mute)">
          zero everywhere
        </text>
      )}
      {labels.map((c, i) => (
        <text
          key={i}
          x={X(c.x) + c.dx}
          y={Y(c.v) + (sgn * c.v >= 0 ? -7 : 15)}
          fontSize={11}
          textAnchor={c.dx < 0 ? 'end' : c.dx > 0 ? 'start' : 'middle'}
          fill="var(--c-ink)"
          className="num"
          fontWeight={600}
          style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}
        >
          {fmt(c.v, digits)}
        </text>
      ))}
      {p.dot && dotVisible && <circle cx={X(p.dot.x)} cy={Y(dotV)} r={5.5} fill={p.dot.color} stroke="var(--c-panel)" strokeWidth={2} data-tip={`${tipName(p.title) ? tipName(p.title) + ': ' : ''}${fmt(dotV, digits + 1)} at x = ${fmt(p.dot.x, 3)}`} />}
    </svg>
  )
}

/** toolbar of mutually exclusive tool buttons */
export function ToolBar<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { v: T; label: ReactNode }[] }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-line overflow-hidden">
      {items.map((x) => (
        <button key={x.v} onClick={() => onChange(x.v)} className={'px-2.5 py-1 text-sm font-semibold ' + (value === x.v ? 'bg-accent text-bg' : 'bg-panel2 text-mute hover:text-ink')}>
          {x.label}
        </button>
      ))}
    </div>
  )
}
