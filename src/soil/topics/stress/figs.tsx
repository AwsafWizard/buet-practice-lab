// Stress-distribution drawings: σz–depth plots, the circle / square / strip comparison, plan of rectangles with the
// ± corner rectangles at the point, an embankment section, simple load sketches.
import type { PointerEvent as RPE } from 'react'
import { fmt } from '../../../components/DiagramView'
import { bulbRatio, embQ, type CornerTerm, type Embankment, type Rect } from '../../engine/stressdist'
import { Chart, Legend, pathOf, SERIES } from '../consol/plot'

const f1 = (v: number) => fmt(v, 1)
const f2 = (v: number) => fmt(v, 2)

/** σz against depth for one or more curves */
export function DepthChart({ curves, zMax, mark, w = 360, xLabel = 'σz (kPa)' }: { curves: { f: (z: number) => number; c?: string; label: string; dash?: boolean }[]; zMax: number; mark?: { z: number; v: number }; w?: number; xLabel?: string }) {
  const zs = Array.from({ length: 120 }, (_, i) => zMax * (0.004 + (0.996 * i) / 119))
  const vals = curves.map((c) => zs.map((z) => c.f(z)))
  // ignore the singular surface values of point / line loads when scaling (clip them instead)
  const body = vals.flatMap((v) => v.filter((_, j) => zs[j] >= 0.08 * zMax))
  const vmax = Math.max(1e-9, ...body.filter(Number.isFinite), mark && Number.isFinite(mark.v) ? mark.v : 0)
  vals.forEach((v) => v.forEach((x, j) => (v[j] = x > vmax * 1.05 ? NaN : x)))
  return (
    <div>
      <Chart w={w} h={250} xTop x={{ min: 0, max: vmax * 1.05, label: xLabel }} y={{ min: 0, max: zMax, flip: true, label: 'depth z (m)' }} label="stress against depth">
        {(s) => (
          <>
            {curves.map((c, i) => (
              <path key={i} d={pathOf(zs.map((z, j) => [vals[i][j], z]), s)} fill="none" stroke={c.c ?? SERIES[i % SERIES.length]} strokeWidth={i === 0 ? 2 : 1.3} strokeDasharray={c.dash ? '5 3' : undefined} />
            ))}
            {mark && Number.isFinite(mark.v) && (
              <g>
                <line x1={s.L} x2={s.X(mark.v)} y1={s.Y(mark.z)} y2={s.Y(mark.z)} stroke="var(--c-load)" strokeDasharray="3 2" />
                <circle cx={s.X(mark.v)} cy={s.Y(mark.z)} r={4} fill="var(--c-load)" data-tip={`z = ${fmt(mark.z, 3)} m, ${xLabel.split(' (')[0]} = ${fmt(mark.v, 4)}${xLabel.includes('(kPa)') ? ' kPa' : ''}`} />
              </g>
            )}
          </>
        )}
      </Chart>
      {curves.length > 1 && <Legend items={curves.map((c, i) => ({ c: c.c ?? SERIES[i % SERIES.length], t: c.label, dash: c.dash }))} />}
    </div>
  )
}

/** σz/q below the centre of a circle (D = B), a square (B × B) and a strip (B) against z/B — the 3-paper theory question */
export function ShapeCompareFig({ w = 360, zMax = 6 }: { w?: number; zMax?: number }) {
  const zs = Array.from({ length: 90 }, (_, i) => zMax * (0.005 + (0.995 * i) / 89))
  const shapes = [
    { k: 'circle' as const, c: 'var(--c-water)', t: 'circle, D = B' },
    { k: 'square' as const, c: 'var(--c-accent)', t: 'square, B × B' },
    { k: 'strip' as const, c: 'var(--c-load)', t: 'strip, width B' },
  ]
  return (
    <div>
      <Chart w={w} h={260} xTop x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: 'σz/q below the centre' }} y={{ min: 0, max: zMax, flip: true, ticks: Array.from({ length: zMax + 1 }, (_, i) => i), label: 'z/B' }} label="circle square strip comparison">
        {(s) => (
          <>
            <line x1={s.X(0.1)} x2={s.X(0.1)} y1={s.T} y2={s.B} stroke="var(--c-mute)" strokeDasharray="3 3" />
            <text x={s.X(0.1) + 3} y={s.B - 4} fontSize={8.5} fill="var(--c-mute)">
              0.1q
            </text>
            {shapes.map((sh) => (
              <path key={sh.k} d={pathOf(zs.map((z) => [bulbRatio(sh.k, 1, 0, z), z]), s)} fill="none" stroke={sh.c} strokeWidth={1.8} />
            ))}
            {[1, 2, 3].map((z) => (
              <text key={z} x={s.X(bulbRatio('strip', 1, 0, z)) + 4} y={s.Y(z) + 3} fontSize={8} fill="var(--c-load)">
                {fmt(bulbRatio('strip', 1, 0, z), 2)}
              </text>
            ))}
            {[1, 2].map((z) => (
              <text key={'q' + z} x={s.X(bulbRatio('square', 1, 0, z)) + 4} y={s.Y(z) - 3} fontSize={8} fill="var(--c-accent)">
                {fmt(bulbRatio('square', 1, 0, z), 2)}
              </text>
            ))}
          </>
        )}
      </Chart>
      <Legend items={shapes.map((sh) => ({ c: sh.c, t: sh.t }))} />
    </div>
  )
}

export interface PlanView {
  x0: number
  y0: number
  x1: number
  y1: number
}
export function viewFor(rects: Rect[], P: [number, number], pad = 2): PlanView {
  const xs = [P[0], ...rects.flatMap((r) => [r.x1, r.x2])]
  const ys = [P[1], ...rects.flatMap((r) => [r.y1, r.y2])]
  return { x0: Math.min(...xs) - pad, y0: Math.min(...ys) - pad, x1: Math.max(...xs) + pad, y1: Math.max(...ys) + pad }
}

/** plan with the loaded rectangles, the point and (optionally) the signed corner rectangles */
export function PlanFig({
  rects,
  P,
  terms,
  view,
  w = 460,
  grid = 1,
  draft,
  onDown,
  onMove,
  onUp,
  dims = true,
}: {
  rects: Rect[]
  P: [number, number]
  terms?: CornerTerm[]
  view?: PlanView
  w?: number
  grid?: number
  draft?: Rect | null
  onDown?: (x: number, y: number) => void
  onMove?: (x: number, y: number) => void
  onUp?: (x: number, y: number) => void
  dims?: boolean
}) {
  const v = view ?? viewFor(rects, P)
  const pad = 22
  const k = (w - 2 * pad) / (v.x1 - v.x0)
  const h = (v.y1 - v.y0) * k + 2 * pad
  const X = (x: number) => pad + (x - v.x0) * k
  const Y = (y: number) => pad + (v.y1 - y) * k
  const toWorld = (e: RPE<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect()
    const sx = ((e.clientX - b.left) / b.width) * w
    const sy = ((e.clientY - b.top) / b.height) * h
    return [v.x0 + (sx - pad) / k, v.y1 - (sy - pad) / k] as const
  }
  const gl: number[] = []
  for (let x = Math.ceil(v.x0 / grid) * grid; x <= v.x1 + 1e-9; x += grid) gl.push(x)
  const gy: number[] = []
  for (let y = Math.ceil(v.y0 / grid) * grid; y <= v.y1 + 1e-9; y += grid) gy.push(y)
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={'w-full ' + (onDown ? 'touch-none cursor-crosshair select-none' : '')}
      role="img"
      aria-label="plan of the loaded area"
      onPointerDown={
        onDown
          ? (e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              onDown(...toWorld(e))
            }
          : undefined
      }
      onPointerMove={onMove ? (e) => onMove(...toWorld(e)) : undefined}
      onPointerUp={onUp ? (e) => onUp(...toWorld(e)) : undefined}
    >
      {gl.map((x) => (
        <line key={'gx' + x} x1={X(x)} x2={X(x)} y1={Y(v.y0)} y2={Y(v.y1)} stroke="var(--c-line)" strokeWidth={Math.abs(x) < 1e-9 ? 0.9 : 0.4} />
      ))}
      {gy.map((y) => (
        <line key={'gy' + y} y1={Y(y)} y2={Y(y)} x1={X(v.x0)} x2={X(v.x1)} stroke="var(--c-line)" strokeWidth={Math.abs(y) < 1e-9 ? 0.9 : 0.4} />
      ))}
      {rects.map((r, i) => (
        <g key={i}>
          <rect x={X(Math.min(r.x1, r.x2))} y={Y(Math.max(r.y1, r.y2))} width={Math.abs(r.x2 - r.x1) * k} height={Math.abs(r.y2 - r.y1) * k} fill="var(--c-load)" fillOpacity={0.18} stroke="var(--c-load)" strokeWidth={1.4} />
          {dims && (
            <text x={X((r.x1 + r.x2) / 2)} y={Y((r.y1 + r.y2) / 2) + 3} fontSize={9} textAnchor="middle" fill="var(--c-load)">
              {f2(Math.abs(r.x2 - r.x1))} × {f2(Math.abs(r.y2 - r.y1))}
            </text>
          )}
        </g>
      ))}
      {draft && <rect x={X(Math.min(draft.x1, draft.x2))} y={Y(Math.max(draft.y1, draft.y2))} width={Math.abs(draft.x2 - draft.x1) * k} height={Math.abs(draft.y2 - draft.y1) * k} fill="var(--c-accent)" fillOpacity={0.15} stroke="var(--c-accent)" strokeDasharray="4 3" />}
      {terms?.map((t, i) => (
        <rect
          key={'t' + i}
          x={X(Math.min(P[0], P[0] + t.ax)) + 2 * (i % 3)}
          y={Y(Math.max(P[1], P[1] + t.ay)) + 2 * (i % 3)}
          width={Math.max(0, Math.abs(t.ax) * k - 4 * (i % 3))}
          height={Math.max(0, Math.abs(t.ay) * k - 4 * (i % 3))}
          fill="none"
          stroke={t.sign > 0 ? 'var(--c-good)' : 'var(--c-bad)'}
          strokeWidth={1.3}
          strokeDasharray="5 3"
        />
      ))}
      <circle cx={X(P[0])} cy={Y(P[1])} r={4} fill="var(--c-accent)" stroke="var(--c-bg)" data-tip={`P at (${f2(P[0])}, ${f2(P[1])}) m`} />
      <text x={X(P[0]) + 6} y={Y(P[1]) - 5} fontSize={11} fontWeight={700} fill="var(--c-accent)">
        P
      </text>
      <text x={w - pad} y={h - 5} fontSize={8.5} textAnchor="end" fill="var(--c-mute)">
        grid {grid} m
      </text>
    </svg>
  )
}

/** embankment cross-section with points at depth */
export function EmbFig({ e, pts, w = 520 }: { e: Embankment; pts: { x: number; z: number; label: string }[]; w?: number }) {
  const total = e.aL + e.c + e.aR
  const zMax = Math.max(4, ...pts.map((p) => p.z)) + 1
  const pad = 26
  const k = (w - 2 * pad) / (total + 4)
  const H0 = pad + e.h * k + 8
  const hh = H0 + zMax * k + 16
  const X = (x: number) => pad + (x + 2) * k
  const Yg = H0
  return (
    <svg viewBox={`0 0 ${w} ${hh}`} className="w-full" role="img" aria-label="embankment section">
      <rect x={pad} y={Yg} width={w - 2 * pad} height={zMax * k} fill="var(--c-soil)" opacity={0.2} />
      <line x1={pad} x2={w - pad} y1={Yg} y2={Yg} stroke="var(--c-ink)" />
      <path d={`M${X(0)},${Yg} L${X(e.aL)},${Yg - e.h * k} L${X(e.aL + e.c)},${Yg - e.h * k} L${X(total)},${Yg} Z`} fill="var(--c-load)" fillOpacity={0.2} stroke="var(--c-load)" strokeWidth={1.4} />
      <text x={X(e.aL + e.c / 2)} y={Yg - e.h * k - 5} fontSize={9.5} textAnchor="middle" fill="var(--c-ink)">
        crest {f1(e.c)} m · H = {f1(e.h)} m · γ = {f1(e.gamma)} → q = {f1(embQ(e))} kPa
      </text>
      <text x={X(e.aL / 2) - 4} y={Yg - (e.h * k) / 2} fontSize={9} textAnchor="end" fill="var(--c-mute)">
        {f1(e.aL)} m
      </text>
      <text x={X(e.aL + e.c + e.aR / 2) + 4} y={Yg - (e.h * k) / 2} fontSize={9} fill="var(--c-mute)">
        {f1(e.aR)} m
      </text>
      {pts.map((p, i) => (
        <g key={i}>
          <line x1={X(p.x)} x2={X(p.x)} y1={Yg - e.h * k} y2={Yg + p.z * k} stroke="var(--c-accent)" strokeDasharray="3 3" />
          <circle cx={X(p.x)} cy={Yg + p.z * k} r={4} fill="var(--c-accent)" data-tip={`${p.label}: x = ${f2(p.x)} m, z = ${f2(p.z)} m`} />
          <text x={X(p.x) + 6} y={Yg + p.z * k + 4} fontSize={10} fontWeight={700} fill="var(--c-accent)">
            {p.label} ({f1(p.z)} m)
          </text>
        </g>
      ))}
    </svg>
  )
}
