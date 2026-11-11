// A drawing surface for the stress calculators: a metre grid in plan (y up) or in cross-section (y = −depth, soil
// below y = 0), pointer events in world coordinates snapped to 0.5 m, and a render prop for the drawing itself.
import { useState, type PointerEvent as RPE, type ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import type { XY } from '../../engine/stressdist'

export const SNAP = 0.5
export const snap = (v: number, g = SNAP) => Math.round(v / g) * g

export interface View {
  x0: number
  y0: number
  x1: number
  y1: number
}
export interface Scale {
  X: (x: number) => number
  Y: (y: number) => number
  /** px per metre */
  k: number
  v: View
  w: number
  h: number
}

/** a view that holds every point with `pad` metres around, and at least the `base` box */
export function fitView(pts: XY[], base: View, pad = 2): View {
  const ok = pts.filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
  const xs = ok.map((p) => p[0])
  const ys = ok.map((p) => p[1])
  return {
    x0: Math.min(base.x0, ...xs.map((x) => x - pad)),
    x1: Math.max(base.x1, ...xs.map((x) => x + pad)),
    y0: Math.min(base.y0, ...ys.map((y) => y - pad)),
    y1: Math.max(base.y1, ...ys.map((y) => y + pad)),
  }
}

/** distance from (x, y) to the segment a–b */
export function segDist(a: XY, b: XY, x: number, y: number) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L2 = dx * dx + dy * dy
  const t = L2 > 0 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)) : 0
  return Math.hypot(a[0] + t * dx - x, a[1] + t * dy - y)
}
/** index of the nearest item within `tol`, or −1 */
export function nearest<T>(arr: T[], dist: (t: T) => number, tol: number) {
  let bi = -1
  let bd = tol
  arr.forEach((t, i) => {
    const d = dist(t)
    if (d <= bd) {
      bd = d
      bi = i
    }
  })
  return bi
}

const union = (a: View, b: View): View => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) })

/**
 * A view that stays put while you draw: it never moves while the pointer is down, and afterwards only grows when the
 * content runs off the edge (so a click never rescales the plan under the next click). `reset` refits it, for a newly
 * loaded case.
 */
export function useFrozenView(pts: XY[], base: View, pad = 2) {
  const [cur, setCur] = useState<View | null>(null)
  const [held, setHeld] = useState(false)
  const fit = fitView(pts, base, pad)
  // after the first touch, grow only when something comes within 1 m of the edge
  const view = cur === null ? fit : held ? cur : union(cur, fitView(pts, cur, 1))
  return {
    view,
    freeze: () => {
      setCur(view)
      setHeld(true)
    },
    thaw: () => setHeld(false),
    reset: () => {
      setCur(null)
      setHeld(false)
    },
  }
}

export function DrawCanvas({
  view,
  w = 460,
  grid = 1,
  section,
  onDown,
  onMove,
  onUp,
  children,
  label = 'drawing',
  maxH = 460,
}: {
  view: View
  w?: number
  grid?: number
  /** cross-section: soil below y = 0, depth labels */
  section?: boolean
  /** world coordinates (unsnapped) and the pick tolerance in metres */
  onDown?: (x: number, y: number, tol: number) => void
  onMove?: (x: number, y: number) => void
  onUp?: () => void
  children: (s: Scale) => ReactNode
  label?: string
  maxH?: number
}) {
  const pad = 18
  const kw = (w - 2 * pad) / (view.x1 - view.x0)
  const kh = (maxH - 2 * pad) / (view.y1 - view.y0)
  const k = Math.min(kw, kh)
  const h = (view.y1 - view.y0) * k + 2 * pad
  const ox = (w - (view.x1 - view.x0) * k) / 2
  const X = (x: number) => ox + (x - view.x0) * k
  const Y = (y: number) => pad + (view.y1 - y) * k
  const toWorld = (e: RPE<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect()
    const sx = ((e.clientX - b.left) / b.width) * w
    const sy = ((e.clientY - b.top) / b.height) * h
    return [view.x0 + (sx - ox) / k, view.y1 - (sy - pad) / k] as const
  }
  const g = grid
  const gx: number[] = []
  for (let x = Math.ceil(view.x0 / g) * g; x <= view.x1 + 1e-9; x += g) gx.push(x)
  const gy: number[] = []
  for (let y = Math.ceil(view.y0 / g) * g; y <= view.y1 + 1e-9; y += g) gy.push(y)
  const major = g * (view.x1 - view.x0 > 30 ? 10 : 5)
  const s: Scale = { X, Y, k, v: view, w, h }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={'w-full ' + (onDown ? 'touch-none cursor-crosshair select-none' : '')}
      role="img"
      aria-label={label}
      onPointerDown={
        onDown
          ? (e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              onDown(...toWorld(e), 12 / k)
            }
          : undefined
      }
      onPointerMove={onMove ? (e) => onMove(...toWorld(e)) : undefined}
      onPointerUp={onUp ? () => onUp() : undefined}
    >
      {section && <rect x={X(view.x0)} y={Y(0)} width={(view.x1 - view.x0) * k} height={Math.max(0, Y(view.y0) - Y(0))} fill="var(--c-soil)" opacity={0.16} />}
      {gx.map((x) => (
        <line key={'gx' + x} x1={X(x)} x2={X(x)} y1={Y(view.y0)} y2={Y(view.y1)} stroke="var(--c-line)" strokeWidth={Math.abs(x % major) < 1e-9 ? 0.9 : 0.4} />
      ))}
      {gy.map((y) => (
        <line key={'gy' + y} y1={Y(y)} y2={Y(y)} x1={X(view.x0)} x2={X(view.x1)} stroke="var(--c-line)" strokeWidth={Math.abs(y % major) < 1e-9 ? 0.9 : 0.4} />
      ))}
      {section && (
        <>
          <line x1={X(view.x0)} x2={X(view.x1)} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" strokeWidth={1.4} />
          {gy
            .filter((y) => y < 0 && Math.abs(y % (g * 2)) < 1e-9)
            .map((y) => (
              <text key={'zl' + y} x={X(view.x0) + 3} y={Y(y) - 2} fontSize={8} fill="var(--c-faint)">
                {fmt(-y, 1)} m
              </text>
            ))}
        </>
      )}
      {children(s)}
      <text x={w - 4} y={h - 4} fontSize={8.5} textAnchor="end" fill="var(--c-faint)">
        grid {fmt(g, 1)} m
      </text>
    </svg>
  )
}

/** the point P as a marker with a label */
export function PMark({ s, at, label = 'P' }: { s: Scale; at: XY; label?: string }) {
  if (!Number.isFinite(at[0]) || !Number.isFinite(at[1])) return null
  return (
    <g>
      <circle cx={s.X(at[0])} cy={s.Y(at[1])} r={5} fill="var(--c-accent)" stroke="var(--c-bg)" strokeWidth={1.5} data-tip={`${label} at (${fmt(at[0], 2)}, ${fmt(at[1], 2)}) m`} />
      <text x={s.X(at[0]) + 7} y={s.Y(at[1]) - 6} fontSize={11} fontWeight={700} fill="var(--c-accent)">
        {label}
      </text>
    </g>
  )
}
