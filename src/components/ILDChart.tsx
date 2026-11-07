import { useMemo, useRef, useState } from 'react'
import { ildAt, type ILD, type Pt } from '../engine/ild'
import { fmt } from './DiagramView'
import { tipAxes, tipName } from './PointTip'

export interface ILDChartProps {
  ild?: ILD | null
  guess?: Pt[] | null
  minX: number
  maxX: number
  maxWidth?: number
  pad?: number
  height?: number
  /** x positions where ordinates are labelled */
  labelXs?: number[]
  title?: string
  unit?: string
  color?: string
  /** draw a marker at a moving load position */
  marker?: number | null
  /** extra vertical scale reference so several charts share a scale */
  yAbsMax?: number
  children?: (m: { X: (x: number) => number; Y: (y: number) => number; H: number }) => React.ReactNode
}

export function niceStep(max: number) {
  const raw = max / 40
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1)))
  const n = raw / p
  return (n < 1.5 ? 1 : n < 3.5 ? 2.5 : n < 7.5 ? 5 : 10) * p
}

export function ILDChart(p: ILDChartProps) {
  const W = p.maxWidth ?? 820
  const pad = p.pad ?? 70
  const H = (p.height ?? 170) + (p.title ? 22 : 0)
  const k = (W - 2 * pad) / Math.max(p.maxX - p.minX, 1e-6)
  const X = (x: number) => pad + (x - p.minX) * k
  const yMax = useMemo(() => {
    let m = p.yAbsMax ?? 0
    for (const q of p.ild?.pts ?? []) m = Math.max(m, Math.abs(q.y))
    for (const q of p.guess ?? []) m = Math.max(m, Math.abs(q.y))
    return m || 1
  }, [p.ild, p.guess, p.yAbsMax])
  const top = p.title ? 22 : 0
  const ky = ((H - top) / 2 - 22) / yMax
  const Y = (y: number) => top + (H - top) / 2 - y * ky
  const col = p.color ?? 'var(--c-accent)'

  const fillPolys = useMemo(() => {
    if (!p.ild) return null
    const pts = p.ild.pts
    const pos: string[] = []
    const neg: string[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        b = pts[i + 1]
      if (b.x - a.x < 1e-9) continue
      const seg = (u: Pt, v: Pt, arr: string[]) => arr.push(`M${X(u.x)},${Y(0)} L${X(u.x)},${Y(u.y)} L${X(v.x)},${Y(v.y)} L${X(v.x)},${Y(0)} Z`)
      if (a.y >= 0 && b.y >= 0) seg(a, b, pos)
      else if (a.y <= 0 && b.y <= 0) seg(a, b, neg)
      else {
        const x0 = a.x + (a.y / (a.y - b.y)) * (b.x - a.x)
        const z = { x: x0, y: 0 }
        if (a.y > 0) {
          seg(a, z, pos)
          seg(z, b, neg)
        } else {
          seg(a, z, neg)
          seg(z, b, pos)
        }
      }
    }
    return { pos: pos.join(' '), neg: neg.join(' ') }
  }, [p.ild, yMax, p.minX, p.maxX])

  const path = (pts: Pt[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${X(q.x)},${Y(q.y)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" data-name={tipName(p.title) || undefined} {...tipAxes({ X, Y, y: 'ordinate', yUnit: p.unit ? ' ' + p.unit : '' })}>
      <line x1={X(p.minX)} y1={Y(0)} x2={X(p.maxX)} y2={Y(0)} stroke="var(--c-faint)" strokeWidth={1.2} />
      {p.title && (
        <text x={8} y={16} fontSize={12.5} fontWeight={700} fill="var(--c-mute)">
          {p.title}
        </text>
      )}
      {fillPolys && (
        <>
          <path d={fillPolys.pos} fill="var(--c-good)" fillOpacity={0.14} />
          <path d={fillPolys.neg} fill="var(--c-bad)" fillOpacity={0.14} />
        </>
      )}
      {p.ild && <path d={path(p.ild.pts)} fill="none" stroke={col} strokeWidth={2.4} strokeLinejoin="round" />}
      {p.guess && <path d={path(p.guess)} fill="none" stroke="var(--c-load)" strokeWidth={2} strokeDasharray="6 5" />}
      {p.ild &&
        [...new Set((p.labelXs ?? []).map((x) => Math.round(x * 1000) / 1000))].map((x, i) => {
          const l = ildAt(p.ild!, x, -1)
          const r = ildAt(p.ild!, x, 1)
          const vals = Math.abs(l - r) > 1e-9 ? [l, r] : [r]
          return vals.map((v, j) =>
            Math.abs(v) < 1e-9 ? null : (
              <text
                key={`${i}-${j}`}
                x={X(x) + (vals.length > 1 ? (j ? 6 : -6) : 0)}
                y={Y(v) + (v >= 0 ? -7 : 15)}
                fontSize={11.5}
                textAnchor={vals.length > 1 ? (j ? 'start' : 'end') : 'middle'}
                fill="var(--c-ink)"
                className="num"
                fontWeight={600}
                style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}
              >
                {fmt(v, 3)}
              </text>
            ),
          )
        })}
      {p.marker !== undefined && p.marker !== null && p.ild && (
        <g>
          <line x1={X(p.marker)} y1={8} x2={X(p.marker)} y2={H - 8} stroke="var(--c-load)" strokeDasharray="3 3" />
          <circle cx={X(p.marker)} cy={Y(ildAt(p.ild, p.marker))} r={5} fill="var(--c-load)" data-tip={`load at x = ${fmt(p.marker, 3)}, ordinate = ${fmt(ildAt(p.ild, p.marker), 4)}${p.unit ? ' ' + p.unit : ''}`} />
        </g>
      )}
      {p.children?.({ X, Y, H })}
    </svg>
  )
}

// ------------------------------------------------------------------ editor

export interface Handle {
  x: number
  side?: -1 | 1 // for jumps: -1 left value, +1 right value
}

export interface ILDEditorProps {
  truth: ILD
  handles: Handle[]
  minX: number
  maxX: number
  maxWidth?: number
  pad?: number
  height?: number
  revealed: boolean
  onCheck?: (ok: boolean, details: { x: number; side?: number; guess: number; truth: number; ok: boolean }[]) => void
  values: number[]
  setValues: (v: number[]) => void
  results?: boolean[] | null
}

/** Drag-the-ordinates editor: the student shapes the ILD at key points, then checks. */
export function ILDEditor(p: ILDEditorProps) {
  const W = p.maxWidth ?? 820
  const pad = p.pad ?? 70
  const H = p.height ?? 230
  const svgRef = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<number | null>(null)
  const k = (W - 2 * pad) / Math.max(p.maxX - p.minX, 1e-6)
  const X = (x: number) => pad + (x - p.minX) * k
  const tMax = Math.max(...p.truth.pts.map((q) => Math.abs(q.y)), 1e-6)
  const yMax = tMax * 1.6
  const ky = (H / 2 - 18) / yMax
  const Y = (y: number) => H / 2 - y * ky
  const step = niceStep(tMax)

  const guessPts: Pt[] = p.handles.map((h, i) => ({ x: h.x, y: p.values[i] ?? 0 }))

  const onMove = (e: React.PointerEvent) => {
    if (drag === null || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const py = ((e.clientY - r.top) / r.height) * H
    let v = (H / 2 - py) / ky
    v = Math.round(v / step) * step
    v = Math.max(-yMax, Math.min(yMax, v))
    const nv = p.values.slice()
    nv[drag] = Math.abs(v) < step / 2 ? 0 : +v.toFixed(6)
    p.setValues(nv)
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto touch-none select-none"
      {...tipAxes({ X, Y, y: 'ordinate' })}
      onPointerMove={onMove}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      {/* grid */}
      {[-1, -0.5, 0.5, 1].map((f) => (
        <line key={f} x1={X(p.minX)} x2={X(p.maxX)} y1={Y(f * tMax)} y2={Y(f * tMax)} stroke="var(--c-line)" strokeDasharray="2 5" />
      ))}
      <line x1={X(p.minX)} y1={Y(0)} x2={X(p.maxX)} y2={Y(0)} stroke="var(--c-faint)" strokeWidth={1.3} />
      {p.handles.map((h, i) => (
        <line key={'v' + i} x1={X(h.x)} x2={X(h.x)} y1={10} y2={H - 10} stroke="var(--c-line)" strokeWidth={1} />
      ))}
      {p.revealed && (
        <path d={p.truth.pts.map((q, i) => `${i ? 'L' : 'M'}${X(q.x)},${Y(q.y)}`).join(' ')} fill="none" stroke="var(--c-good)" strokeWidth={3} opacity={0.75} />
      )}
      <path d={guessPts.map((q, i) => `${i ? 'L' : 'M'}${X(q.x)},${Y(q.y)}`).join(' ')} fill="none" stroke="var(--c-load)" strokeWidth={2.4} strokeLinejoin="round" />
      {p.handles.map((h, i) => {
        const res = p.results?.[i]
        const fill = res === undefined || res === null ? 'var(--c-load)' : res ? 'var(--c-good)' : 'var(--c-bad)'
        const cx = X(h.x) + (h.side ? h.side * 5 : 0)
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={Y(p.values[i] ?? 0)}
              r={drag === i ? 9 : 7}
              data-tip={`your ordinate at x = ${fmt(h.x, 3)}: ${fmt(p.values[i] ?? 0, 3)}`}
              fill={fill}
              stroke="var(--c-panel)"
              strokeWidth={2}
              style={{ cursor: 'ns-resize' }}
              onPointerDown={(e) => {
                ;(e.target as Element).setPointerCapture?.(e.pointerId)
                setDrag(i)
              }}
            />
            <text x={cx} y={Y(p.values[i] ?? 0) + ((p.values[i] ?? 0) >= 0 ? -13 : 22)} fontSize={11} textAnchor="middle" className="num" fill="var(--c-ink)" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
              {fmt(p.values[i] ?? 0, 3)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** compare a guess to the truth at handle points */
export function checkILD(truth: ILD, handles: Handle[], values: number[], relTol = 0.04) {
  const tMax = Math.max(...truth.pts.map((q) => Math.abs(q.y)), 1e-9)
  const details = handles.map((h, i) => {
    const tv = ildAt(truth, h.x, h.side ?? 1)
    const g = values[i] ?? 0
    const ok = Math.abs(g - tv) <= Math.max(relTol * Math.abs(tv), 0.02 * tMax)
    return { x: h.x, side: h.side, guess: g, truth: tv, ok }
  })
  return { ok: details.every((d) => d.ok), details }
}

/** handles at every breakpoint of the truth (jumps get two handles) */
export function handlesFor(truth: ILD, extraXs: number[] = []): Handle[] {
  const xs = [...new Set([...truth.pts.map((q) => q.x), ...extraXs])].sort((a, b) => a - b)
  const out: Handle[] = []
  for (const x of xs) {
    const l = ildAt(truth, x, -1)
    const r = ildAt(truth, x, 1)
    if (Math.abs(l - r) > 1e-9) {
      out.push({ x, side: -1 }, { x, side: 1 })
    } else out.push({ x })
  }
  return out
}
