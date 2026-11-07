// Chart pane, group "Index & classification" (c- items) + step checklists for W–V, plasticity, USCS, AASHTO.
// Charts are drawn from their definitions (A-line, U-line, USDA boundaries, Fig. 5.2 lines), never from scans.
// The chart components are exported so the CE 341 labs draw the same pictures.

import { useRef, useState, type PointerEvent as RPE, type ReactNode } from 'react'
import { fmt } from '../../components/DiagramView'
import { tipAxes } from '../../components/PointTip'
import { Md, Seg, Tex } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { AASHTO_GROUPS, aashto, fig52, groupIndex, SIEVES, USDA_POLY, usda, usdaXY, type UsdaClass } from '../engine/classify'
import { DR_LAMBE, DR_SLIDE, drClass, nf, relDensity, sandCone, solvePhase, UNIT_SYSTEMS, type UnitSys } from '../engine/phase'
import { aLine, BURMISTER, burmisterIndex, casagrandeZone, chartZone, indices, liComment, uLine } from '../engine/plasticity'
import { useUsed, type SmRefItem } from './pane'

const f = (v: number, d = 2) => fmt(v, d)

// ---------------------------------------------------------------- svg helpers
/** pointer position in the svg's own coordinates */
function svgPoint(svg: SVGSVGElement | null, e: { clientX: number; clientY: number }) {
  if (!svg) return null
  const m = svg.getScreenCTM()
  if (!m) return null
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
  return { x: p.x, y: p.y }
}

const TXT = { fill: 'var(--c-ink)', fontSize: 10 } as const
const MUTE = { fill: 'var(--c-mute)', fontSize: 9 } as const

// ---------------------------------------------------------------- plasticity chart (Das Fig. 5.3 / Casagrande 1932)
export interface ChartPt {
  LL: number
  PI: number
  label?: string
  color?: string
}

export function PlasticityChart({ pts = [], onPick, variant = 'uscs', w = 460 }: { pts?: ChartPt[]; onPick?: (LL: number, PI: number) => void; variant?: 'uscs' | 'casagrande'; w?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState(false)
  const ml = 34,
    mr = 10,
    mt = 10,
    mb = 30
  const W = 460 - ml - mr
  const H = 300 - mt - mb
  const X = (LL: number) => ml + (LL / 100) * W
  const Y = (PI: number) => mt + H - (PI / 70) * H
  const pick = (e: RPE<SVGSVGElement>) => {
    if (!onPick) return
    const p = svgPoint(ref.current, e)
    if (!p) return
    const LL = Math.max(0, Math.min(100, ((p.x - ml) / W) * 100))
    const PI = Math.max(0, Math.min(70, ((mt + H - p.y) / H) * 70))
    onPick(Math.round(LL * 2) / 2, Math.round(PI * 2) / 2)
  }
  const uEnd = 8 + 70 / 0.9
  const line = (fn: (x: number) => number, a: number, b: number) =>
    Array.from({ length: 41 }, (_, i) => a + ((b - a) * i) / 40)
      .map((x, i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(Math.min(70, fn(x))).toFixed(1)}`)
      .join(' ')
  const hatch = [
    [8 + 4 / 0.9, 4],
    [20 + 4 / 0.73, 4],
    [20 + 7 / 0.73, 7],
    [8 + 7 / 0.9, 7],
  ]
  return (
    <svg
      ref={ref}
      viewBox="0 0 460 300"
      style={{ width: '100%', maxWidth: w, touchAction: onPick ? 'none' : undefined, cursor: onPick ? 'crosshair' : undefined }}
      onPointerDown={(e) => {
        if (!onPick) return
        ;(e.target as Element).setPointerCapture?.(e.pointerId)
        setDrag(true)
        pick(e)
      }}
      onPointerMove={(e) => drag && pick(e)}
      onPointerUp={() => setDrag(false)}
      {...tipAxes({ X, Y, x: 'LL', y: 'PI' })}
    >
      <defs>
        <pattern id="clml-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--c-accent2)" strokeWidth="1.4" opacity="0.55" />
        </pattern>
      </defs>
      {Array.from({ length: 11 }, (_, i) => (
        <g key={'x' + i}>
          <line x1={X(i * 10)} x2={X(i * 10)} y1={mt} y2={mt + H} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={X(i * 10)} y={mt + H + 12} textAnchor="middle" {...MUTE}>
            {i * 10}
          </text>
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={'y' + i}>
          <line x1={ml} x2={ml + W} y1={Y(i * 10)} y2={Y(i * 10)} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={ml - 4} y={Y(i * 10) + 3} textAnchor="end" {...MUTE}>
            {i * 10}
          </text>
        </g>
      ))}
      <text x={ml + W / 2} y={298} textAnchor="middle" {...TXT}>
        Liquid limit, LL
      </text>
      <text x={9} y={mt + H / 2} textAnchor="middle" transform={`rotate(-90 9 ${mt + H / 2})`} {...TXT}>
        Plasticity index, PI
      </text>
      {variant === 'uscs' && <polygon points={hatch.map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')} fill="url(#clml-hatch)" stroke="var(--c-accent2)" strokeWidth={0.6} data-name="CL-ML zone" />}
      <path d={line(uLine, variant === 'uscs' ? 16 : 8, uEnd)} stroke="var(--c-mute)" strokeWidth={1.3} strokeDasharray="5 3" fill="none" data-name="U-line" />
      <path d={line(aLine, 20, 100)} stroke="var(--c-ink)" strokeWidth={1.6} fill="none" data-name="A-line" />
      {(variant === 'uscs' ? [50] : [30, 50]).map((L) => (
        <line key={L} x1={X(L)} x2={X(L)} y1={Y(0)} y2={Y(uLine(L))} stroke="var(--c-ink)" strokeWidth={1.1} data-curve />
      ))}
      <text x={X(58)} y={Y(uLine(58)) - 4} {...MUTE} transform={`rotate(-36 ${X(58)} ${Y(uLine(58)) - 4})`}>
        U-line PI = 0.9(LL − 8)
      </text>
      <text x={X(74)} y={Y(aLine(74)) + 12} {...MUTE} transform={`rotate(-30 ${X(74)} ${Y(aLine(74)) + 12})`}>
        A-line PI = 0.73(LL − 20)
      </text>
      {variant === 'uscs' ? (
        <>
          <text x={X(31)} y={Y(19)} {...TXT} fontWeight={700}>CL or OL</text>
          <text x={X(62)} y={Y(40)} {...TXT} fontWeight={700}>CH or OH</text>
          <text x={X(33)} y={Y(3)} {...TXT} fontWeight={700}>ML or OL</text>
          <text x={X(68)} y={Y(13)} {...TXT} fontWeight={700}>MH or OH</text>
          <text x={X(5)} y={Y(10)} {...MUTE} fill="var(--c-accent2)">CL-ML</text>
        </>
      ) : (
        <>
          {[
            ['CL', 23, 9],
            ['CM', 36, 17],
            ['CH', 64, 38],
            ['ML', 22, 1.5],
            ['MM', 38, 3],
            ['MH', 70, 12],
          ].map(([t, a, b]) => (
            <text key={t as string} x={X(a as number)} y={Y(b as number)} {...TXT} fontWeight={700}>
              {t}
            </text>
          ))}
          <text x={X(10)} y={Y(40)} {...MUTE}>cohesionless (above U)</text>
        </>
      )}
      {pts.map((p, i) =>
        ok(p.LL) && ok(p.PI) ? (
          <g key={i}>
            <line x1={X(p.LL)} x2={X(p.LL)} y1={Y(0)} y2={Y(p.PI)} stroke={p.color ?? 'var(--c-load)'} strokeDasharray="2 2" strokeWidth={0.8} />
            <line x1={X(0)} x2={X(p.LL)} y1={Y(p.PI)} y2={Y(p.PI)} stroke={p.color ?? 'var(--c-load)'} strokeDasharray="2 2" strokeWidth={0.8} />
            <circle cx={X(p.LL)} cy={Y(Math.min(70, p.PI))} r={4.5} fill={p.color ?? 'var(--c-load)'} stroke="var(--c-panel)" strokeWidth={1.2} data-tip={`${p.label ? p.label + ': ' : ''}LL = ${f(p.LL)}, PI = ${f(p.PI)}`} />
            {p.label && (
              <text x={X(p.LL) + 6} y={Y(Math.min(70, p.PI)) - 5} {...TXT} fontWeight={700} fill={p.color ?? 'var(--c-load)'}>
                {p.label}
              </text>
            )}
          </g>
        ) : null,
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- AASHTO Fig. 5.2
export function AashtoFig52({ pt, F200, w = 420 }: { pt?: { LL: number; PI: number }; F200?: number; w?: number }) {
  const ml = 34,
    mt = 10,
    W = 380,
    H = 230
  const X = (LL: number) => ml + (LL / 100) * W
  const Y = (PI: number) => mt + H - (PI / 70) * H
  const reg = pt ? fig52(pt.LL, pt.PI, F200) : ''
  const lab = (t: string, LL: number, PI: number) => (
    <text x={X(LL)} y={Y(PI)} textAnchor="middle" {...TXT} fontWeight={700} fill={reg && t.includes(reg) ? 'var(--c-load)' : 'var(--c-ink)'}>
      {t}
    </text>
  )
  return (
    <svg viewBox="0 0 430 270" style={{ width: '100%', maxWidth: w }} {...tipAxes({ X, Y, x: 'LL', y: 'PI' })}>
      {Array.from({ length: 11 }, (_, i) => (
        <g key={'x' + i}>
          <line x1={X(i * 10)} x2={X(i * 10)} y1={mt} y2={mt + H} stroke="var(--c-line)" strokeWidth={0.5} />
          <text x={X(i * 10)} y={mt + H + 12} textAnchor="middle" {...MUTE}>
            {i * 10}
          </text>
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={'y' + i}>
          <line x1={ml} x2={ml + W} y1={Y(i * 10)} y2={Y(i * 10)} stroke="var(--c-line)" strokeWidth={0.5} />
          <text x={ml - 4} y={Y(i * 10) + 3} textAnchor="end" {...MUTE}>
            {i * 10}
          </text>
        </g>
      ))}
      <line x1={X(0)} x2={X(100)} y1={Y(10)} y2={Y(10)} stroke="var(--c-ink)" strokeWidth={1.4} data-curve />
      <line x1={X(40)} x2={X(40)} y1={Y(0)} y2={Y(70)} stroke="var(--c-ink)" strokeWidth={1.4} data-curve />
      <line x1={X(40)} x2={X(100)} y1={Y(10)} y2={Y(70)} stroke="var(--c-ink)" strokeWidth={1.4} />
      <text x={X(88)} y={Y(60)} {...MUTE}>PI = LL − 30</text>
      {lab('A-2-4 / A-4', 20, 4)}
      {lab('A-2-5 / A-5', 70, 4)}
      {lab('A-2-6 / A-6', 20, 35)}
      {lab('A-7-6', 55, 45)}
      {lab('A-2-7 / A-7-5', 80, 25)}
      <text x={ml + W / 2} y={266} textAnchor="middle" {...TXT}>
        Liquid limit
      </text>
      <text x={9} y={mt + H / 2} textAnchor="middle" transform={`rotate(-90 9 ${mt + H / 2})`} {...TXT}>
        Plasticity index
      </text>
      {pt && ok(pt.LL) && ok(pt.PI) && <circle cx={X(pt.LL)} cy={Y(Math.min(70, pt.PI))} r={4.5} fill="var(--c-load)" stroke="var(--c-panel)" strokeWidth={1.2} data-tip={`LL = ${f(pt.LL)}, PI = ${f(pt.PI)}`} />}
    </svg>
  )
}

// ---------------------------------------------------------------- USDA triangle (Das Fig. 5.1)
export function UsdaTriangle({ pt, onPick, w = 420 }: { pt?: { sand: number; silt: number; clay: number; label?: string }; onPick?: (p: { sand: number; silt: number; clay: number }) => void; w?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState(false)
  const s = 3.6
  const ox = 30
  const oy = 340
  const P = (silt: number, clay: number) => {
    const q = usdaXY(silt, clay)
    return { x: ox + q.x * s, y: oy - q.y * s }
  }
  const poly = (v: [number, number][]) =>
    v
      .map(([sand, clay]) => P(100 - sand - clay, clay))
      .map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`)
      .join(' ')
  const cls = pt ? usda({ sand: pt.sand, silt: pt.silt, clay: pt.clay }).cls : null
  const pick = (e: RPE<SVGSVGElement>) => {
    if (!onPick) return
    const q = svgPoint(ref.current, e)
    if (!q) return
    const y = (oy - q.y) / s
    const x = (q.x - ox) / s
    let clay = (2 * y) / Math.sqrt(3)
    let silt = x - clay / 2
    clay = Math.max(0, Math.min(100, clay))
    silt = Math.max(0, Math.min(100 - clay, silt))
    const sand = 100 - silt - clay
    onPick({ sand: Math.round(sand), silt: Math.round(silt), clay: Math.round(clay) })
  }
  const centroid = (v: [number, number][]) => {
    const ps = v.map(([sand, clay]) => P(100 - sand - clay, clay))
    return { x: ps.reduce((a, b) => a + b.x, 0) / ps.length, y: ps.reduce((a, b) => a + b.y, 0) / ps.length }
  }
  const short: Partial<Record<UsdaClass, string>> = { 'Silty clay loam': 'Silty clay\nloam', 'Sandy clay loam': 'Sandy clay\nloam', 'Loamy sand': 'Loamy\nsand', 'Sandy clay': 'Sandy\nclay', 'Silty clay': 'Silty\nclay' }
  const nudge: Partial<Record<UsdaClass, [number, number]>> = { Sand: [-6, 4], 'Loamy sand': [4, 6], Clay: [0, 10], Silt: [4, 0], 'Silt loam': [6, 4] }
  const p = pt ? P(pt.silt, pt.clay) : null
  return (
    <svg
      ref={ref}
      viewBox="0 0 420 372"
      style={{ width: '100%', maxWidth: w, touchAction: onPick ? 'none' : undefined, cursor: onPick ? 'crosshair' : undefined }}
      onPointerDown={(e) => {
        if (!onPick) return
        ;(e.target as Element).setPointerCapture?.(e.pointerId)
        setDrag(true)
        pick(e)
      }}
      onPointerMove={(e) => drag && pick(e)}
      onPointerUp={() => setDrag(false)}
    >
      {(Object.keys(USDA_POLY) as UsdaClass[]).map((k) => (
        <polygon key={k} points={poly(USDA_POLY[k])} fill={k === cls ? 'color-mix(in oklab, var(--c-load) 22%, transparent)' : 'color-mix(in oklab, var(--c-soil) 14%, transparent)'} stroke="var(--c-ink)" strokeWidth={0.9} />
      ))}
      {(Object.keys(USDA_POLY) as UsdaClass[]).map((k) => {
        const c = centroid(USDA_POLY[k])
        const [dx, dy] = nudge[k] ?? [0, 0]
        const lines = (short[k] ?? k).split('\n')
        return (
          <text key={k} x={c.x + dx} y={c.y + dy} textAnchor="middle" fontSize={8.5} fill={k === cls ? 'var(--c-load)' : 'var(--c-ink)'} fontWeight={k === cls ? 700 : 500}>
            {lines.map((l, i) => (
              <tspan key={i} x={c.x + dx} dy={i ? 9 : 0}>
                {l}
              </tspan>
            ))}
          </text>
        )
      })}
      {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((v) => {
        const L = P(0, v) // clay axis (left side): sand side
        const R = P(100 - v, 0) // base: silt value 100 − v → sand v
        const Rt = P(v, 100 - v) // right side: silt v
        return (
          <g key={v}>
            <text x={L.x - 4} y={L.y + 3} textAnchor="end" {...MUTE}>
              {v}
            </text>
            <text x={R.x} y={R.y + 12} textAnchor="middle" {...MUTE}>
              {100 - v}
            </text>
            <text x={Rt.x + 5} y={Rt.y + 3} {...MUTE}>
              {v}
            </text>
          </g>
        )
      })}
      <text x={ox + 18 * s} y={oy - 52 * s} {...TXT} transform={`rotate(-60 ${ox + 18 * s} ${oy - 52 * s})`}>
        % clay ↑
      </text>
      <text x={ox + 84 * s} y={oy - 50 * s} {...TXT} transform={`rotate(60 ${ox + 84 * s} ${oy - 50 * s})`}>
        % silt ↓
      </text>
      <text x={ox + 50 * s} y={oy + 26} textAnchor="middle" {...TXT}>
        ← % sand
      </text>
      {p && (
        <>
          <circle cx={p.x} cy={p.y} r={4.5} fill="var(--c-load)" stroke="var(--c-panel)" strokeWidth={1.2} data-tip={pt ? `${pt.label ? pt.label + ': ' : ''}sand ${f(pt.sand, 1)} %, silt ${f(pt.silt, 1)} %, clay ${f(pt.clay, 1)} %` : undefined} />
          {pt?.label && (
            <text x={p.x + 6} y={p.y - 6} {...TXT} fontWeight={700} fill="var(--c-load)">
              {pt.label}
            </text>
          )}
        </>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- static phase diagram for the sheet
export function PhaseSketch({ w = 300 }: { w?: number }) {
  const bx = 110,
    bw = 80
  const rows = [
    { t: 'Air', y: 10, h: 40, fill: 'transparent', W: 'W_a ≈ 0', V: 'V_a' },
    { t: 'Water', y: 50, h: 50, fill: 'color-mix(in oklab, var(--c-water) 30%, transparent)', W: 'W_w', V: 'V_w' },
    { t: 'Solids', y: 100, h: 80, fill: 'color-mix(in oklab, var(--c-soil) 70%, transparent)', W: 'W_s', V: 'V_s' },
  ]
  return (
    <svg viewBox="0 0 300 192" style={{ width: '100%', maxWidth: w }}>
      {rows.map((r) => (
        <g key={r.t}>
          <rect x={bx} y={r.y} width={bw} height={r.h} fill={r.fill} stroke="var(--c-ink)" />
          <text x={bx + bw / 2} y={r.y + r.h / 2 + 4} textAnchor="middle" {...TXT}>
            {r.t}
          </text>
          <text x={bx - 8} y={r.y + r.h / 2 + 4} textAnchor="end" {...TXT}>
            {r.W}
          </text>
          <text x={bx + bw + 8} y={r.y + r.h / 2 + 4} {...TXT}>
            {r.V}
          </text>
        </g>
      ))}
      <path d={`M ${bx + bw + 40} 10 h 6 v 90 h -6`} fill="none" stroke="var(--c-mute)" />
      <text x={bx + bw + 52} y={58} {...MUTE}>
        V_v
      </text>
      <path d={`M ${bx + bw + 70} 10 h 6 v 170 h -6`} fill="none" stroke="var(--c-mute)" />
      <text x={bx + bw + 82} y={98} {...MUTE}>
        V
      </text>
      <path d={`M ${bx - 50} 50 h -6 v 130 h 6`} fill="none" stroke="var(--c-mute)" />
      <text x={bx - 64} y={118} textAnchor="end" {...MUTE}>
        W
      </text>
      <text x={150} y={190} textAnchor="middle" {...MUTE}>
        weights (left) · volumes (right)
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- clay mineral sketches
/** silica sheet symbol S (trapezoid), gibbsite sheet G (rectangle) */
function Sheet({ x, y, kind, w = 120, flip }: { x: number; y: number; kind: 'S' | 'G'; w?: number; flip?: boolean }) {
  const h = 14
  if (kind === 'G') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="color-mix(in oklab, var(--c-accent) 22%, transparent)" stroke="var(--c-ink)" />
        <text x={x + w / 2} y={y + 10} textAnchor="middle" fontSize={9} fill="var(--c-ink)">
          G
        </text>
      </g>
    )
  }
  const d = 10
  const pts = flip ? `${x},${y} ${x + w},${y} ${x + w - d},${y + h} ${x + d},${y + h}` : `${x + d},${y} ${x + w - d},${y} ${x + w},${y + h} ${x},${y + h}`
  return (
    <g>
      <polygon points={pts} fill="color-mix(in oklab, var(--c-soil) 55%, transparent)" stroke="var(--c-ink)" />
      <text x={x + w / 2} y={y + 10} textAnchor="middle" fontSize={9} fill="var(--c-ink)">
        S
      </text>
    </g>
  )
}

export type MineralKind = 'kaolinite' | 'illite' | 'montmorillonite'
/** stacked-sheet sketch of a clay mineral (slides 24–26) */
export function MineralStack({ kind, w = 230, swell = 1 }: { kind: MineralKind; w?: number; swell?: number }) {
  const x = 20
  const out: ReactNode[] = []
  let y = 8
  const units = 3
  for (let u = 0; u < units; u++) {
    if (kind === 'kaolinite') {
      out.push(<Sheet key={`s${u}`} x={x} y={y} kind="S" flip />, <Sheet key={`g${u}`} x={x} y={y + 14} kind="G" />)
      y += 28
      if (u < units - 1) {
        out.push(
          <g key={`b${u}`}>
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={x + 10 + i * 14} x2={x + 10 + i * 14} y1={y} y2={y + 5} stroke="var(--c-mute)" strokeDasharray="1.5 1.5" />
            ))}
          </g>,
        )
        y += 5
      }
    } else {
      out.push(<Sheet key={`s1${u}`} x={x} y={y} kind="S" flip />, <Sheet key={`g${u}`} x={x} y={y + 14} kind="G" />, <Sheet key={`s2${u}`} x={x} y={y + 28} kind="S" />)
      y += 42
      if (u < units - 1) {
        const gap = kind === 'illite' ? 8 : 8 + 14 * swell
        if (kind === 'illite')
          out.push(
            <g key={`k${u}`}>
              {Array.from({ length: 6 }, (_, i) => (
                <g key={i}>
                  <circle cx={x + 12 + i * 19} cy={y + gap / 2} r={3} fill="var(--c-load)" />
                </g>
              ))}
            </g>,
          )
        else
          out.push(
            <g key={`w${u}`}>
              <rect x={x} y={y} width={120} height={gap} fill="color-mix(in oklab, var(--c-water) 25%, transparent)" />
              {Array.from({ length: 5 }, (_, i) => (
                <text key={i} x={x + 8 + i * 24} y={y + gap / 2 + 3} fontSize={7} fill="var(--c-water)">
                  nH₂O
                </text>
              ))}
            </g>,
          )
        y += gap
      }
    }
  }
  const label: Record<MineralKind, [string, string]> = {
    kaolinite: ['1:1 (S–G) · ≈ 7 Å', 'H-bond: strong → little swelling'],
    illite: ['2:1 (S–G–S) · ≈ 10 Å', 'K⁺ bond: intermediate'],
    montmorillonite: ['2:1 (S–G–S) · ≈ 10 Å + water', 'van der Waals: weak → swells'],
  }
  return (
    <svg viewBox={`0 0 230 ${Math.max(150, y + 10)}`} style={{ width: '100%', maxWidth: w }}>
      {out}
      <text x={150} y={20} fontSize={9.5} fontWeight={700} fill="var(--c-ink)">
        {kind[0].toUpperCase() + kind.slice(1)}
      </text>
      <text x={150} y={34} fontSize={8.5} fill="var(--c-mute)">
        {label[kind][0]}
      </text>
      <text x={150} y={46} fontSize={8.5} fill="var(--c-mute)">
        {label[kind][1].split(':')[0]}:
      </text>
      <text x={150} y={57} fontSize={8.5} fill="var(--c-mute)">
        {label[kind][1].split(':')[1]}
      </text>
    </svg>
  )
}

/** silica tetrahedron and alumina octahedron (slides 20–22) */
export function SheetUnits({ w = 360 }: { w?: number }) {
  const O = (x: number, y: number, k: string, lab = 'O') => (
    <g key={k}>
      <circle cx={x} cy={y} r={9} fill="color-mix(in oklab, var(--c-accent) 18%, var(--c-panel))" stroke="var(--c-ink)" strokeWidth={0.8} />
      <text x={x} y={y + 3} textAnchor="middle" fontSize={7} fill="var(--c-ink)">
        {lab}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 360 150" style={{ width: '100%', maxWidth: w }}>
      {/* tetrahedron */}
      <polygon points="40,110 120,110 80,30" fill="none" stroke="var(--c-mute)" />
      <line x1="80" y1="30" x2="85" y2="95" stroke="var(--c-mute)" strokeDasharray="2 2" />
      <line x1="40" y1="110" x2="85" y2="95" stroke="var(--c-mute)" strokeDasharray="2 2" />
      <line x1="120" y1="110" x2="85" y2="95" stroke="var(--c-mute)" strokeDasharray="2 2" />
      {O(80, 30, 'o1')}
      {O(40, 110, 'o2')}
      {O(120, 110, 'o3')}
      {O(85, 95, 'o4')}
      <circle cx={80} cy={80} r={5} fill="var(--c-load)" />
      <text x={90} y={78} fontSize={8} fill="var(--c-load)">
        Si⁴⁺
      </text>
      <text x={80} y={140} textAnchor="middle" fontSize={9} fill="var(--c-ink)">
        silica tetrahedron (S)
      </text>
      {/* octahedron */}
      <polygon points="250,20 300,75 250,130 200,75" fill="none" stroke="var(--c-mute)" />
      <line x1="200" y1="75" x2="300" y2="75" stroke="var(--c-mute)" strokeDasharray="2 2" />
      {O(250, 20, 'h1', 'OH')}
      {O(250, 130, 'h2', 'OH')}
      {O(200, 75, 'h3', 'OH')}
      {O(300, 75, 'h4', 'OH')}
      {O(228, 58, 'h5', 'OH')}
      {O(272, 92, 'h6', 'OH')}
      <circle cx={250} cy={75} r={5} fill="var(--c-load)" />
      <text x={258} y={70} fontSize={8} fill="var(--c-load)">
        Al³⁺
      </text>
      <text x={250} y={147} textAnchor="middle" fontSize={9} fill="var(--c-ink)">
        alumina octahedron (G)
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- bodies
function UnitPick({ u, setU }: { u: UnitSys['key']; setU: (k: UnitSys['key']) => void }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs">
      <span className="text-mute">units</span>
      <select className="field !py-0.5 !text-xs" value={u} onChange={(e) => setU(e.target.value as UnitSys['key'])}>
        {UNIT_SYSTEMS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function PhaseBody() {
  const used = useUsed('c-phase')
  const [u, setU] = useState<UnitSys['key']>('kN')
  const [Gs, setGs] = useState(2.7)
  const [e, setE] = useState(0.65)
  const [w, setW] = useState(18)
  const us = UNIT_SYSTEMS.find((x) => x.key === u)!
  const s = [Gs, e, w].every(ok) && Gs > 0 && e > 0 && w >= 0 ? solvePhase({ Gs, e, w: w / 100 }, us.gw) : null
  const v = s?.status === 'ok' ? s.vals : null
  return (
    <>
      <div className="grid sm:grid-cols-[auto_1fr] gap-3 items-center">
        <PhaseSketch w={250} />
        <Md>{`- **AJK sir's method:** draw the block diagram, assume $V = 1$ or $V_s = 1$ if no size is given, fill the weights (left) and volumes (right) one block at a time, then read the answers off. "No derived expression has been used!" Das Table 3.1 is crossed out.
- $V = V_s + V_v,\\ V_v = V_w + V_a$; $W = W_s + W_w$ ($W_a \\approx 0$)
- $W_s = G_s\\gamma_wV_s$, $W_w = \\gamma_wV_w$`}</Md>
      </div>
      <RT
        head={['Quantity', 'Definition', 'Range']}
        rows={[
          ['Void ratio e', <Tex key="e">{'V_v/V_s'}</Tex>, 'e > 0 (can exceed 1)'],
          ['Porosity n', <Tex key="n">{'V_v/V'}</Tex>, '0 < n < 1'],
          ['Degree of saturation S', <Tex key="s">{'V_w/V_v'}</Tex>, '0–100 %'],
          ['Water content w', <Tex key="w">{'W_w/W_s'}</Tex>, '≥ 0 (can exceed 100 %)'],
          ['Moist unit weight γ', <Tex key="g">{'W/V'}</Tex>, 'γd < γ ≤ γsat'],
          ['Dry unit weight γd', <Tex key="gd">{'W_s/V'}</Tex>, ''],
          ['Saturated γsat', <Tex key="gs">{'(W_s+\\gamma_wV_v)/V'}</Tex>, 'S = 100 %'],
          ["Submerged γ′", <Tex key="gp">{"\\gamma_{sat}-\\gamma_w"}</Tex>, 'not on the slides'],
          ['Specific gravity Gs', <Tex key="G">{'\\gamma_s/\\gamma_w = W_s/(V_s\\gamma_w)'}</Tex>, '≈ 2.6–2.8'],
          ['Air content / % air voids', <Tex key="a">{'a_c = V_a/V_v,\\ n_a = V_a/V'}</Tex>, 'not on the slides'],
        ]}
        cap="“100 % saturation does not mean 100 % water content and vice versa” (slide 8)."
      />
      <Md>{`**Formula route — use only as a check** (Vs = 1 diagram):
$$Se = wG_s,\\quad n = \\frac{e}{1+e},\\quad \\gamma = \\frac{(G_s+Se)\\gamma_w}{1+e},\\quad \\gamma_d = \\frac{G_s\\gamma_w}{1+e} = \\frac{\\gamma}{1+w}$$
$$\\gamma_{sat} = \\frac{(G_s+e)\\gamma_w}{1+e},\\quad \\gamma' = \\frac{(G_s-1)\\gamma_w}{1+e},\\quad \\gamma_d = \\frac{G_s\\gamma_w}{1+wG_s/S}$$
**Units:** γw = 9.81 kN/m³ = 62.4 pcf; ρw = 1 g/cm³ = 1 t/m³ = 1000 kg/m³; 1 in = 2.54 cm; cylinder V = πD²H/4.`}</Md>
      <Lookup
        result={
          v ? (
            <span>
              S = <b>{f(v.S * 100, 1)} %</b> · n = {f(v.n, 3)} · γ = <b>{f(v.g, 3)}</b> · γd = {f(v.gd, 3)} · γsat = {f(v.gsat, 3)} · γ′ = {f(v.gsub, 3)} {us.g}
              {v.S > 1.001 && <span className="text-bad"> · S over 100 %: impossible data</span>}
            </span>
          ) : (
            '—'
          )
        }
      >
        <UnitPick u={u} setU={setU} />
        <NumIn label="Gs" value={Gs} onChange={setGs} step={0.01} w="w-16" />
        <NumIn label="e" value={e} onChange={setE} step={0.01} w="w-16" />
        <NumIn label="w" value={w} onChange={setW} step={1} unit="%" w="w-14" />
      </Lookup>
      {used && (
        <div className="text-[11px] text-faint mt-1">
          Lab: e = {used.e}, S = {used.S} %, w = {used.w} %, Gs = {used.Gs}
        </div>
      )}
    </>
  )
}

function DrBody() {
  const used = useUsed('c-dr')
  const [mode, setMode] = useState<'e' | 'g'>('e')
  const [e, setE] = useState(0.65)
  const [emax, setEmax] = useState(0.85)
  const [emin, setEmin] = useState(0.5)
  const [gd, setGd] = useState(16.5)
  const [gmin, setGmin] = useState(14.2)
  const [gmax, setGmax] = useState(18.0)
  const r = mode === 'e' ? relDensity({ e, emax, emin }) : relDensity({ gd, gdMin: gmin, gdMax: gmax, Gs: 2.65 })
  const pct = mode === 'e' ? r.pct : ((gd - gmin) / (gmax - gmin)) * (gmax / gd) * 100
  const iUsed = used ? Number(used.cls) : -1
  return (
    <>
      <Md>{`$$D_r = \\frac{e_{\\max}-e}{e_{\\max}-e_{\\min}} = \\frac{1/\\gamma_{d\\min} - 1/\\gamma_d}{1/\\gamma_{d\\min} - 1/\\gamma_{d\\max}} = \\left[\\frac{\\gamma_d-\\gamma_{d\\min}}{\\gamma_{d\\max}-\\gamma_{d\\min}}\\right]\\frac{\\gamma_{d\\max}}{\\gamma_d}$$
"Density/unit weight is inversely related to void ratio" — e_max goes with γd,min. Get e from γd by $e = G_s\\gamma_w/\\gamma_d - 1$ and from n by $e = n/(1-n)$. Lab limits: γd,min = Ws/Vm (pour through a funnel, 2830 cm³ mould); γd,max = Ws/Vf (vibrating table, 14 kN/m² surcharge, 3600 cycles/min, 0.635 mm, 8 min).`}</Md>
      <RT
        head={['Dr (%) — slide 28 (Das Table 3.3)', 'Description']}
        rows={DR_SLIDE.map((c) => [`${c.lo}–${c.hi}`, c.label + (c.label === 'Dense' ? ' ← good for EQ (Dr > 70 %)' : '')])}
        hl={(i) => i === iUsed}
        cap="The red rule on the slide sits between Medium and Dense: dense deposits are “Good for EQ”."
      />
      <RT head={['Dr (%) — other scale (Lambe; QBank)', 'Description']} rows={DR_LAMBE.map((c) => [`${c.lo}–${c.hi}`, c.label])} cap="Some books and the QBank use 15 / 35 / 65 / 85. Quote the slide scale and name the other if the answer changes." />
      <Lookup
        result={
          ok(pct) ? (
            <span>
              {mode === 'g' && <>e from γd needs Gs; Dr from the γd form: </>}D_r = <b>{f(pct, 1)} %</b> → {drClass(pct)} (other scale: {drClass(pct, DR_LAMBE)})
            </span>
          ) : (
            '—'
          )
        }
      >
        <Seg size="xs" value={mode} onChange={setMode} items={[{ v: 'e', label: 'from e' }, { v: 'g', label: 'from γd' }]} />
        {mode === 'e' ? (
          <>
            <NumIn label="e" value={e} onChange={setE} step={0.01} w="w-16" />
            <NumIn label="e_max" value={emax} onChange={setEmax} step={0.01} w="w-16" />
            <NumIn label="e_min" value={emin} onChange={setEmin} step={0.01} w="w-16" />
          </>
        ) : (
          <>
            <NumIn label="γd" value={gd} onChange={setGd} step={0.1} w="w-16" />
            <NumIn label="γd,min" value={gmin} onChange={setGmin} step={0.1} w="w-16" />
            <NumIn label="γd,max" value={gmax} onChange={setGmax} step={0.1} w="w-16" />
          </>
        )}
      </Lookup>
    </>
  )
}

function SandConeBody() {
  const [W1, setW1] = useState(7.59)
  const [W4, setW4] = useState(4.78)
  const [Wc, setWc] = useState(0.545)
  const [gs, setGs] = useState(1570)
  const [W2, setW2] = useState(3.007)
  const [w, setW] = useState(10.2)
  const r = sandCone({ W1, W4, Wc, gdSand: gs, W2, w: w / 100 })
  return (
    <>
      <Md>{`ASTM D1556 (slides 25–26). Jar + cone + Ottawa sand of known dry density; dig a hole through the base plate, keep the soil, pour sand into the hole.
- $W_1$ jar + cone + sand; $W_4$ after filling; $W_5 = W_1 - W_4$ sand in hole + cone; $W_c$ sand in the cone alone (calibration)
- $W_2$ moist soil from the hole, w its water content → $W_3 = W_2/(1+w)$
- $$V = \\frac{W_5 - W_c}{\\gamma_{d(sand)}},\\qquad \\gamma_d = \\frac{W_3}{V},\\qquad R = \\frac{\\gamma_d}{\\gamma_{d\\max}}\\ \\text{(relative compaction)}$$`}</Md>
      <Lookup
        result={
          ok(r.gd) ? (
            <span>
              W₅ = {f(r.W5, 3)} · V = (W₅ − W_c)/ρd = {nf(r.V, 4)} · W₃ = {f(r.W3, 3)} · γd = W₃/V = <b>{nf(r.gd, 4)}</b> · γ = {nf(r.g, 4)} (units of the sand density: kg and kg/m³ here)
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="W₁" value={W1} onChange={setW1} step={0.01} w="w-16" />
        <NumIn label="W₄" value={W4} onChange={setW4} step={0.01} w="w-16" />
        <NumIn label="W_c" value={Wc} onChange={setWc} step={0.01} w="w-16" />
        <NumIn label="ρd sand" value={gs} onChange={setGs} step={10} w="w-16" />
        <NumIn label="W₂" value={W2} onChange={setW2} step={0.01} w="w-16" />
        <NumIn label="w" value={w} onChange={setW} step={0.5} unit="%" w="w-14" />
      </Lookup>
    </>
  )
}

const SIZE_ROWS: [string, string, string, string, string][] = [
  ['MIT', '> 2.0', '2.0 – 0.06', '0.06 – 0.002', '< 0.002'],
  ['USDA', '> 2.0', '2.0 – 0.05', '0.05 – 0.002', '< 0.002'],
  ['AASHTO', '76.2 – 2.0', '2.0 – 0.075', '0.075 – 0.002', '< 0.002'],
  ['ASTM', '76.2 – 4.75', '4.75 – 0.075', '0.075 – 0.005', '< 0.005'],
  ['BNBC 2020', '76.2 – 4.75', '4.75 – 0.075', '0.075 – 0.002', '< 0.002'],
  ['USCS', '76.2 – 4.75', '4.75 – 0.075', '< 0.075 (fines)', ''],
]
function SizesBody() {
  const used = useUsed('c-sizes')
  return (
    <>
      <RT head={['Organization', 'Gravel (mm)', 'Sand', 'Silt', 'Clay']} rows={SIZE_ROWS} hl={(i) => !!used && String(used.org).split(',').includes(SIZE_ROWS[i][0])} cap="Slide 3 of Topic 2. Gravel + sand: coarse-grained, cohesionless (flow freely when dry, not sticky). Silt + clay: fine-grained, cohesive (powdery when dry, sticky when wet)." />
      <RT
        head={['ASTM D422 subdivision', 'Size (mm)']}
        rows={[
          ['Gravel', '> 4.75 (No. 4)'],
          ['Coarse sand', '4.75 – 2.0 (No. 4 – No. 10)'],
          ['Medium sand', '2.0 – 0.425 (No. 10 – No. 40)'],
          ['Fine sand', '0.425 – 0.075 (No. 40 – No. 200)'],
          ['Silt', '0.075 – 0.005'],
          ['Clay', '< 0.005 (colloids < 0.001)'],
        ]}
        cap="Asked in 2021-22 Q5(c). AASHTO M 145: coarse sand 2.0–0.425, fine sand 0.425–0.075; boulders/cobbles over 75 mm are left out."
      />
      <RT head={['Sieve', 'Opening (mm)']} rows={SIEVES.slice(4).map((s) => [s.no, String(s.d)])} />
    </>
  )
}

function AtterbergBody() {
  const used = useUsed('c-atterberg')
  const [LL, setLL] = useState(57)
  const [PL, setPL] = useState(34)
  const [w, setW] = useState(40)
  const k = [LL, PL, w].every(ok) && LL > PL ? indices({ LL, PL, w }) : null
  return (
    <>
      <Md>{`**States** (slides 4–7): solid → *SL* → semi-solid → *PL* → plastic → *LL* → liquid. Each limit is a water content $W_w/W_s$ on the same solids (ASTM D4318 LL/PL, D427 SL; disturbed samples).
- **LL** (cup): w at **25 blows** on the flow curve (w against log N); groove closes 12.7 mm. **Flow index** $I_F = (w_1-w_2)/\\log(N_2/N_1)$.
- **LL** (fall cone, BS 1377): 30° cone, **80 g (0.78 N)**, 5 s; LL = w at **20 mm** penetration.
- **PL**: thread crumbles at 3.2 mm (⅛ in) when rolled. **PI = LL − PL**.
- $LI = \\dfrac{w_N - PL}{PI}$ (0 at PL "high strength, competent"; 1 at LL "low strength, incompetent"); $CI = \\dfrac{LL - w_N}{PI} = 1 - LI$
- *Not on the slides:* toughness $I_T = PI/I_F$; activity $A = PI/(\\%\\ \\text{clay} < 2\\,\\mu m)$ (< 0.75 inactive, 0.75–1.25 normal, > 1.25 active); one-point cup $LL = w_N(N/25)^{0.121}$; one-point cone $w_L = w_y/(0.77\\log y)$; CI scale: < 0 liquid, 0–0.25 very soft, 0.25–0.5 soft, 0.5–0.75 medium stiff, 0.75–1 stiff, > 1 very stiff.
- **Shrinkage** (*not on the slides*): $SL = \\dfrac{(m_1-m_2)-(V_1-V_2)\\rho_w}{m_2}$ (Gs unknown); $SL = \\left(\\dfrac{V_2\\rho_w}{m_2} - \\dfrac{1}{G_s}\\right)$ (Gs known); $SL = e_{SL}/G_s$; shrinkage ratio $SR = m_2/(V_2\\rho_w) = G_s/(1+e_{SL})$; volumetric shrinkage $VS = (w_1 - SL)\\,SR$; linear shrinkage $LS = 1 - (100/(VS+100))^{1/3}$ or $1 - L_d/L_0$; $PI \\approx 2.13\\,LS$. Below the SL the volume does not change.`}</Md>
      <Lookup
        result={
          k ? (
            <span>
              PI = <b>{f(k.PI, 2)}</b> ({k.burmister}) · LI = <b>{f(k.LI, 3)}</b> · CI = {f(k.CI, 3)} → {k.state} ({k.ciDesc}) · {liComment(k.LI)}
            </span>
          ) : (
            'LL must exceed PL'
          )
        }
      >
        <NumIn label="LL" value={LL} onChange={setLL} step={1} unit="%" w="w-14" />
        <NumIn label="PL" value={PL} onChange={setPL} step={1} unit="%" w="w-14" />
        <NumIn label="w_N" value={w} onChange={setW} step={1} unit="%" w="w-14" />
      </Lookup>
      {used && (
        <div className="text-[11px] text-faint mt-1">
          Lab: LL = {used.LL}, PL = {used.PL}, w = {used.w}
        </div>
      )}
    </>
  )
}

function BurmisterBody() {
  const used = useUsed('c-burmister')
  const i = used ? Number(used.i) : -1
  return (
    <RT
      head={['PI', 'Description', 'Soil (brace on slide 16)']}
      rows={BURMISTER.map((b) => [b.lo === 0 && b.hi === 0 ? '0' : b.hi === Infinity ? '> 40' : `${b.lo} – ${b.hi}`, b.label, b.soil])}
      hl={(k) => k === i}
      cap="Class example: PI = 57 − 34 = 23 % → High plasticity. “High PI: lots of water needed to reach the liquid state; less erosion prone, less sensitive to changes in water content.”"
    />
  )
}

function PlChartBody() {
  const used = useUsed('c-plchart')
  const [variant, setVariant] = useState<'uscs' | 'casagrande'>('uscs')
  const [LL, setLL] = useState(57)
  const [PI, setPI] = useState(23)
  const z = ok(LL) && ok(PI) ? chartZone(LL, PI) : null
  const cz = ok(LL) && ok(PI) ? casagrandeZone(LL, PI) : null
  const pts: ChartPt[] = [{ LL, PI, label: 'you' }, ...(used && ok(Number(used.LL)) ? [{ LL: Number(used.LL), PI: Number(used.PI), label: 'lab', color: 'var(--c-accent)' }] : [])]
  return (
    <>
      <Seg size="xs" value={variant} onChange={setVariant} items={[{ v: 'uscs', label: 'USCS (Das Fig. 5.3)' }, { v: 'casagrande', label: 'Casagrande 1932 (slide 17)' }]} />
      <PlasticityChart pts={pts} variant={variant} onPick={(a, b) => (setLL(a), setPI(b))} />
      <Md>{`A-line $PI = 0.73(LL-20)$, U-line $PI = 0.9(LL-8)$ (no soil above it), LL = 50 divides L and H; hatched **CL-ML** band 4 ≤ PI ≤ 7 above the A-line. On/above A: clay (C); below: silt (M) or organic (O, if LL oven-dried/LL < 0.75). Click or drag on the chart.`}</Md>
      <Lookup
        result={
          z && cz ? (
            <span>
              A-line PI = {f(z.aPI, 2)} · U-line PI = {f(z.uPI, 2)} → <b>{z.zone}</b> (or {z.alt} if organic){z.aboveU ? ' · above the U-line: check the data' : ''} · slide 17 chart: {cz.sym} ({cz.words})
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="LL" value={LL} onChange={setLL} step={1} w="w-14" />
        <NumIn label="PI" value={PI} onChange={setPI} step={1} w="w-14" />
      </Lookup>
    </>
  )
}

function AashtoBody() {
  const used = useUsed('c-aashto')
  const [F, setF] = useState(58)
  const [LL, setLL] = useState(30)
  const [PI, setPI] = useState(10)
  const r = ok(F) ? aashto({ P200: F, LL, PI }) : null
  const ug = used ? String(used.group) : ''
  const rowIds = [...AASHTO_GROUPS.map((g) => g.id).slice(0, 10), 'A-7-5', 'A-7-6']
  const cell = (id: string, k: string) => {
    const g = AASHTO_GROUPS.find((x) => x.id === (id.startsWith('A-7') ? 'A-7' : id))!
    const c = g.crit.find((x) => x.k === k)
    if (!c) return '—'
    if (c.np) return 'NP'
    return c.max !== undefined ? `${c.max} max` : `${c.min} min`
  }
  return (
    <>
      <RT
        groups={[
          ['', 1],
          ['% passing', 3],
          ['minus No. 40 fraction', 2],
          ['', 2],
        ]}
        head={['Group', 'No. 10', 'No. 40', 'No. 200', 'LL', 'PI', 'Usual materials', 'Subgrade · lecturer’s GI row']}
        rows={rowIds.map((id) => {
          const g = AASHTO_GROUPS.find((x) => x.id === (id.startsWith('A-7') ? 'A-7' : id))!
          return [id + (id === 'A-7-5' ? ' (PI ≤ LL − 30)' : id === 'A-7-6' ? ' (PI > LL − 30)' : ''), cell(id, 'P10'), cell(id, 'P40'), cell(id, 'P200'), cell(id, 'LL'), cell(id, 'PI'), g.material, `${g.rating} · ${g.giRow}`]
        })}
        hl={(i) => rowIds[i] === ug}
        cap="Das Table 5.1 = AASHTO M 145 Table 2. Granular (≤ 35 % passing No. 200): A-1-a … A-2-7; silt-clay (> 35 %): A-4 … A-7. Go left to right; the first group that fits is the answer (A-3 before A-2 only for the elimination). Silty: PI ≤ 10; clayey: PI ≥ 11. Test values are rounded to whole numbers. Peat/muck: A-8 (M 145 note, visual)."
      />
      <Md>{`**Group index** (Das eq. 5.1; *F* = % passing No. 200):
$$GI = (F-35)[0.2 + 0.005(LL-40)] + 0.01(F-15)(PI-10)$$
1. Negative → 0. 2. Round to the nearest whole number (3.4 → 3, 3.5 → 4). 3. No upper limit. 4. A-1-a, A-1-b, A-2-4, A-2-5, A-3: GI = 0. 5. A-2-6, A-2-7: PI part only, $GI = 0.01(F-15)(PI-10)$. Write it in brackets: A-7-6(42). Quality as subgrade is inversely proportional to GI (M 145: 0 good, ≥ 20 very poor).`}</Md>
      <AashtoFig52 pt={ok(LL) && ok(PI) ? { LL, PI } : undefined} F200={F} />
      <Lookup
        result={
          r ? (
            <span>
              {r.part} → <b>{r.label}</b> · GI terms {f(r.gi.t1, 2)} + {f(r.gi.t2, 2)} = {f(r.gi.raw, 2)}
              {r.gi.rule === 'pi-only' ? ' (PI part only)' : r.gi.rule === 'zero-group' ? ' (group GI = 0)' : ''} · {r.material}, {r.rating.toLowerCase()} · plain formula GI = {groupIndex(F, LL, PI).gi}
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="F (No. 200)" value={F} onChange={setF} step={1} unit="%" w="w-14" />
        <NumIn label="LL" value={LL} onChange={setLL} step={1} w="w-14" />
        <NumIn label="PI" value={PI} onChange={setPI} step={1} w="w-14" />
      </Lookup>
    </>
  )
}

const USCS_ROWS: { sym: string; div: string; cond: string }[] = [
  { sym: 'GW', div: 'Gravels (> 50 % of coarse fraction retained on No. 4) · clean, < 5 % fines', cond: 'Cu ≥ 4 and 1 ≤ Cc ≤ 3' },
  { sym: 'GP', div: '″', cond: 'Cu < 4 and/or Cc < 1 or Cc > 3' },
  { sym: 'GM', div: 'Gravels with fines, > 12 % fines', cond: 'PI < 4 or plots below A-line' },
  { sym: 'GC', div: '″', cond: 'PI > 7 and plots on or above A-line' },
  { sym: 'SW', div: 'Sands (≥ 50 % of coarse fraction passes No. 4) · clean, < 5 % fines', cond: 'Cu ≥ 6 and 1 ≤ Cc ≤ 3' },
  { sym: 'SP', div: '″', cond: 'Cu < 6 and/or Cc < 1 or Cc > 3' },
  { sym: 'SM', div: 'Sands with fines, > 12 % fines', cond: 'PI < 4 or plots below A-line' },
  { sym: 'SC', div: '″', cond: 'PI > 7 and plots on or above A-line' },
  { sym: 'CL', div: 'Fine-grained (≥ 50 % passes No. 200) · LL < 50 · inorganic', cond: 'PI > 7 and on or above A-line (4–7 hatched: CL-ML)' },
  { sym: 'ML', div: '″', cond: 'PI < 4 or below A-line' },
  { sym: 'OL', div: 'LL < 50 · organic', cond: 'LL(oven dried)/LL(not dried) < 0.75' },
  { sym: 'CH', div: 'LL ≥ 50 · inorganic', cond: 'PI on or above A-line' },
  { sym: 'MH', div: '″', cond: 'PI below A-line' },
  { sym: 'OH', div: 'LL ≥ 50 · organic', cond: 'LL(oven dried)/LL(not dried) < 0.75' },
  { sym: 'Pt', div: 'Highly organic soils', cond: 'primarily organic matter, dark colour, organic odour' },
]
function UscsBody() {
  const used = useUsed('c-uscs')
  const rows = used ? String(used.rows).split(',') : []
  return (
    <>
      <RT head={['Symbol', 'Group', 'Criterion']} rows={USCS_ROWS.map((r) => [r.sym, r.div, r.cond])} hl={(i) => rows.includes(USCS_ROWS[i].sym)} />
      <Md>{`Based on the material passing 76.2 mm. **Footnotes:** (a) gravels with 5–12 % fines: GW-GM, GW-GC, GP-GM, GP-GC; (b) sands with 5–12 % fines: SW-SM, SW-SC, SP-SM, SP-SC; (c) $C_u = D_{60}/D_{10}$, $C_c = D_{30}^2/(D_{60}D_{10})$; (d) 4 ≤ PI ≤ 7 in the hatched area: GC-GM or SC-SM; (e) fine soil in the hatched area: CL-ML. Symbols: G gravel, S sand, M silt, C clay, O organic, Pt peat; W well / P poorly graded; L low (LL < 50) / H high (LL ≥ 50) plasticity.`}</Md>
    </>
  )
}

const G_NAMES: [string, string, string][] = [
  ['GW', 'Well-graded gravel', 'Well-graded gravel with sand'],
  ['GP', 'Poorly graded gravel', 'Poorly graded gravel with sand'],
  ['GW-GM', 'Well-graded gravel with silt', 'Well-graded gravel with silt and sand'],
  ['GW-GC', 'Well-graded gravel with clay (or silty clay)', 'Well-graded gravel with clay and sand (or silty clay and sand)'],
  ['GP-GM', 'Poorly graded gravel with silt', 'Poorly graded gravel with silt and sand'],
  ['GP-GC', 'Poorly graded gravel with clay (or silty clay)', 'Poorly graded gravel with clay and sand (or silty clay and sand)'],
  ['GM', 'Silty gravel', 'Silty gravel with sand'],
  ['GC', 'Clayey gravel', 'Clayey gravel with sand'],
  ['GC-GM', 'Silty clayey gravel', 'Silty clayey gravel with sand'],
]
const S_NAMES: [string, string, string][] = G_NAMES.map(([s, a, b]) => [s.replace(/G/g, 'S'), a.replace(/gravel/g, 'sand'), b.replace(/gravel/g, 'SAND').replace(/sand/g, 'gravel').replace(/SAND/g, 'sand')])
const F_BASE: [string, string][] = [
  ['CL', 'lean clay'],
  ['CL-ML', 'silty clay'],
  ['ML', 'silt'],
  ['CH', 'fat clay'],
  ['MH', 'elastic silt'],
  ['OL / OH', 'organic clay (on/above A; OL also PI ≥ 4) · organic silt (below A)'],
]
const BRANCHES: [string, string, string][] = [
  ['lt15', '< 30 % plus No. 200 · < 15 % plus No. 200', 'X'],
  ['15-29s', '< 30 % · 15–29 % plus No. 200 · % sand ≥ % gravel', 'X with sand'],
  ['15-29g', '< 30 % · 15–29 % plus No. 200 · % sand < % gravel', 'X with gravel'],
  ['ge30s-lt15g', '≥ 30 % plus No. 200 · sand ≥ gravel · < 15 % gravel', 'Sandy X'],
  ['ge30s-ge15g', '≥ 30 % · sand ≥ gravel · ≥ 15 % gravel', 'Sandy X with gravel'],
  ['ge30g-lt15s', '≥ 30 % · sand < gravel · < 15 % sand', 'Gravelly X'],
  ['ge30g-ge15s', '≥ 30 % · sand < gravel · ≥ 15 % sand', 'Gravelly X with sand'],
]
function UscsNamesBody() {
  const used = useUsed('c-uscs-names')
  const sym = used ? String(used.symbol) : ''
  const br = used ? String(used.branch) : ''
  return (
    <>
      <div className="text-xs font-bold text-mute mb-1">Fig. 5.4 — gravels (split on % sand) and sands (split on % gravel)</div>
      <RT head={['Symbol', '< 15 %', '≥ 15 %']} rows={G_NAMES} hl={(i) => G_NAMES[i][0] === sym} />
      <RT head={['Symbol', '< 15 % gravel', '≥ 15 % gravel']} rows={S_NAMES} hl={(i) => S_NAMES[i][0] === sym} cap="The slide's scan misprints GW-GM (< 15 % sand) as “Well-graded sand with silt”; ASTM: well-graded gravel with silt. Example 5.6: SC, gravel 30 % → clayey sand with gravel." />
      <div className="text-xs font-bold text-mute mb-1 mt-2">Figs 5.5 / 5.6 — fine-grained soils: base name X, then the plus-No. 200 tree</div>
      <RT head={['Symbol', 'X']} rows={F_BASE} hl={(i) => F_BASE[i][0].split(' / ').includes(sym)} />
      <RT head={['Condition (plus No. 200 = 100 − F200)', 'Name']} rows={BRANCHES.map((b) => [b[1], b[2]])} hl={(i) => BRANCHES[i][0] === br} cap="Fig. 5.5 prints “OL” for the LL ≥ 50 organic branch — it should be OH (Table 5.2). Example 5.5 soil B: CL-ML, 39 % sand → sandy silty clay." />
    </>
  )
}

function UsdaBody() {
  const used = useUsed('c-usda')
  const [g, setG] = useState(20)
  const [sa, setSa] = useState(10)
  const [si, setSi] = useState(30)
  const [cl, setCl] = useState(40)
  const sum = g + sa + si + cl
  const r = Math.abs(sum - 100) < 0.6 ? usda({ gravel: g, sand: sa, silt: si, clay: cl }) : null
  const pt = used ? { sand: Number(used.sand), silt: Number(used.silt), clay: Number(used.clay), label: 'lab' } : r ? { sand: r.sand, silt: r.silt, clay: r.clay } : undefined
  return (
    <>
      <UsdaTriangle pt={pt} onPick={(p) => (setG(0), setSa(p.sand), setSi(p.silt), setCl(p.clay))} />
      <Md>{`USDA sizes: gravel > 2 mm, sand 2–0.05, silt 0.05–0.002, clay < 0.002 mm. **Gravel correction** (Das Ex. 5.1): modified % = % × 100/(100 − % gravel); read the triangle; add "gravelly" when there is a large amount of gravel (Das did it for 10, 12 and 21 %; the slides give no threshold). Loam ≈ 40 % sand, 40 % silt, 20 % clay.`}</Md>
      <Lookup result={r ? <span>modified: sand {f(r.sand, 1)} · silt {f(r.silt, 1)} · clay {f(r.clay, 1)} → <b>{r.name}</b></span> : `percentages add to ${f(sum, 1)}, not 100`}>
        <NumIn label="gravel" value={g} onChange={setG} step={1} unit="%" w="w-14" />
        <NumIn label="sand" value={sa} onChange={setSa} step={1} unit="%" w="w-14" />
        <NumIn label="silt" value={si} onChange={setSi} step={1} unit="%" w="w-14" />
        <NumIn label="clay" value={cl} onChange={setCl} step={1} unit="%" w="w-14" />
      </Lookup>
    </>
  )
}

function MineralsBody() {
  const [sw, setSw] = useState(1)
  return (
    <>
      <SheetUnits w={320} />
      <Md>{`- **Silica (tetrahedral) sheet, S:** Si⁴⁺ with four O²⁻; base oxygens shared, net charge per unit (−2) + (+4) + 3(−1) = **−1**.
- **Alumina / gibbsite (octahedral) sheet, G:** Al³⁺ with six OH⁻. **Brucite:** Mg²⁺ in place of Al³⁺.
- **Isomorphous substitution:** a metal ion replaced by one of lower valence but the same size (e.g. Al³⁺ for Si⁴⁺) → net negative charge.
- Gravel, sand, silt: quartz and feldspar, strong and electrically inert. Clay minerals carry surface charges (− faces, + edges), large surface area: surface forces exceed gravity. Not every clay-sized particle is a clay mineral (rock flour is not plastic).`}</Md>
      <div className="grid grid-cols-3 gap-1">
        <MineralStack kind="kaolinite" />
        <MineralStack kind="illite" />
        <MineralStack kind="montmorillonite" swell={sw} />
      </div>
      <label className="text-xs text-mute flex items-center gap-2">
        wet the montmorillonite <input type="range" min={0} max={2} step={0.1} value={sw} onChange={(e) => setSw(+e.target.value)} />
      </label>
      <RT
        head={['Mineral', 'Structure', 'Spacing', 'Bond between units', 'Water / swelling']}
        rows={[
          ['Kaolinite', '1:1 (S–G)', '≈ 7 Å', 'Hydrogen bond (OH of G to O of S), strong', 'Least active; little swelling'],
          ['Illite', '2:1 (S–G–S), some Si replaced by Al', '≈ 10 Å', 'K⁺ ions between units', 'Intermediate'],
          ['Montmorillonite', '2:1 (S–G–S)', '≈ 10 Å + water', 'van der Waals, very weak', 'Water enters between units: large swelling and shrinkage — endangers structures'],
        ]}
        cap="Slides 24–26. More water attracted → more plasticity, more swelling and shrinkage."
      />
    </>
  )
}

function StructureBody() {
  return (
    <RT
      head={['Structure', 'Soil', 'Description', 'Behaviour']}
      rows={[
        ['Single grained (dense)', 'Gravel, sand', 'Grains settle under gravity, each in contact with its neighbours; packed', 'Low e, low permeability, high strength, low compressibility'],
        ['Single grained (loose)', 'Gravel, sand', 'Same, large voids', 'High e, high permeability; unstable (vibration densifies)'],
        ['Honeycomb', 'Silt (fine sand)', 'Grains form arches of chains, large voids', 'Carries static load by bridge action; collapses under vibration/shock'],
        ['Flocculated', 'Clay', 'Edge (+) to face (−) contacts, random, large voids', 'High e; less sensitive to vibration; light, strong-ish'],
        ['Dispersed', 'Clay', 'Parallel, face-to-face (remoulded / deposited in fresh water)', 'Low e; remoulding changes flocculated → dispersed'],
        ['Coarse-grained skeleton', 'Mixed, coarse > fine', 'Coarse grains form a framework, fines fill the voids', 'Stable, less compressible, takes heavy loads'],
        ['Cohesive matrix', 'Mixed, fines dominate', 'Coarse grains float in clay, no direct contact', 'Behaves like a clay'],
      ]}
      cap="AJK sir's Topic 4A slides 2–15. Structure = geometric arrangement + inter-particle forces; fabric = the arrangement alone."
    />
  )
}

// ---------------------------------------------------------------- step checklists
function StepsWv() {
  return (
    <Md>{`1. List the givens with units; convert (1 in = 2.54 cm, ρw = 1 g/cc, γw = 9.81 kN/m³ or 62.4 pcf).
2. Draw the block diagram: air / water / solids, W on the left, V on the right.
3. No size given? Assume **V = 1** (if γ, γd, n are given) or **Vs = 1** (if e is given).
4. Fill the weights: $W_s = W/(1+w)$, $W_w = wW_s$, $W_s = \\gamma_dV$ …
5. Fill the volumes: $V_s = W_s/(G_s\\gamma_w)$, $V_w = W_w/\\gamma_w$, $V_v = V - V_s$, $V_a = V_v - V_w$.
6. Read off e, n, S, w, γ, γd, γsat (γsat = (Ws + γwVv)/V).
7. Check with Se = wGs; comment (S = 100 % ⇒ γ = γsat; Dr class).`}</Md>
  )
}
function StepsPlast() {
  return (
    <Md>{`1. w for every can: $w = (W_2 - W_3)/(W_3 - W_1)$.
2. Cup: plot w against **log N**, best straight line, LL at N = 25; flow index = drop per log cycle. Cone: w against penetration, LL at **20 mm**.
3. PL = mean of the thread tests. PI = LL − PL → Burmister description.
4. LI = (w − PL)/PI, CI = (LL − w)/PI → state (solid / semi-solid / plastic / liquid), strength comment.
5. Plot (LL, PI) on the plasticity chart: A-line 0.73(LL − 20) → CL / ML / CH / MH.
6. Shrinkage: SL = [(m₁ − m₂) − (V₁ − V₂)ρw]/m₂; SR = m₂/(V₂ρw); Gs = 1/(1/SR − SL).`}</Md>
  )
}
function StepsUscs() {
  return (
    <Md>{`1. F200 ≥ 50 → fine (go to 6). Else coarse.
2. Gravel = 100 − F4, sand = F4 − F200. Gravel > sand → G, else S.
3. Fines < 5 % → W/P by Cu, Cc (G: Cu ≥ 4, S: Cu ≥ 6, 1 ≤ Cc ≤ 3).
4. Fines 5–12 % → dual: (W/P)–(M/C).
5. Fines > 12 % → M (PI < 4 or below A), C (PI > 7, on/above A), C-M (4–7, hatched).
6. Fine: organic if LL(oven)/LL < 0.75 → OL/OH. Else LL < 50: CL / CL-ML / ML; LL ≥ 50: CH / MH by the A-line.
7. Name: Fig. 5.4 (15 % sand or gravel split) or Figs 5.5/5.6 (plus-No. 200 tree).`}</Md>
  )
}
function StepsAashto() {
  return (
    <Md>{`1. F200 ≤ 35 → granular (Part 1), else silt-clay (Part 2): cross out the other part.
2. Left to right: A-1-a (No. 10 ≤ 50, No. 40 ≤ 30, No. 200 ≤ 15, PI ≤ 6), A-1-b, A-3 (NP), A-2-4 … A-2-7 / A-4 … A-7. First fit wins.
3. A-7: PI ≤ LL − 30 → A-7-5, else A-7-6. Confirm on Fig. 5.2.
4. GI = (F − 35)[0.2 + 0.005(LL − 40)] + 0.01(F − 15)(PI − 10); A-2-6/7 PI term only; A-1, A-3, A-2-4/5 → 0; negative → 0; round.
5. Answer like **A-7-6(42)** + material + subgrade rating.`}</Md>
  )
}

// ---------------------------------------------------------------- items
export const IDX_ITEMS: SmRefItem[] = [
  { id: 'c-phase', group: 'idx', title: 'Weight–volume relations sheet', tag: 'Topic 1', keywords: 'phase diagram block e n S w gamma Gs void ratio porosity saturation unit weight Se=wGs', Body: PhaseBody },
  { id: 'c-dr', group: 'idx', title: 'Relative density and its classes', tag: 'Das Table 3.3', keywords: 'Dr density index emax emin loose dense very loose medium earthquake', Body: DrBody },
  { id: 'c-sandcone', group: 'idx', title: 'Sand cone field density', tag: 'ASTM D1556', keywords: 'field density sand cone Ottawa hole relative compaction', Body: SandConeBody },
  { id: 'c-sizes', group: 'idx', title: 'Grain-size limits by organization', tag: 'Topic 2 slide 3', keywords: 'MIT USDA AASHTO ASTM BNBC USCS gravel sand silt clay sieve opening D422', Body: SizesBody },
  { id: 'c-atterberg', group: 'idx', title: 'Atterberg limits, indices and shrinkage', tag: 'Topic 2', keywords: 'LL PL SL PI LI CI flow index toughness activity cone cup shrinkage ratio linear', Body: AtterbergBody },
  { id: 'c-burmister', group: 'idx', title: 'Plasticity descriptions (Burmister)', tag: 'Burmister 1949', keywords: 'PI plasticity index non-plastic slightly low medium high', Body: BurmisterBody },
  { id: 'c-plchart', group: 'idx', title: 'Plasticity chart (A-line, U-line)', tag: 'Das Fig. 5.3', exam: true, keywords: 'Casagrande A-line U-line CL ML CH MH OL OH CL-ML hatched', Body: PlChartBody },
  { id: 'c-aashto', group: 'idx', title: 'AASHTO table + group index', tag: 'Das Table 5.1 / M 145', exam: true, keywords: 'A-1-a A-2-6 A-7-6 group index GI subgrade Fig 5.2', Body: AashtoBody },
  { id: 'c-uscs', group: 'idx', title: 'USCS group symbols', tag: 'Das Table 5.2', exam: true, keywords: 'unified GW GP GM GC SW SP SM SC CL ML CH MH OL OH Pt dual Cu Cc', Body: UscsBody },
  { id: 'c-uscs-names', group: 'idx', title: 'USCS group names (flowcharts)', tag: 'Das Figs 5.4–5.6', keywords: 'group name with sand gravelly sandy lean clay fat clay elastic silt organic', Body: UscsNamesBody },
  { id: 'c-usda', group: 'idx', title: 'USDA textural triangle', tag: 'Das Fig. 5.1', keywords: 'USDA texture loam silty clay gravelly triangle', Body: UsdaBody },
  { id: 'c-minerals', group: 'idx', title: 'Clay minerals', tag: 'Topic 4B', keywords: 'kaolinite illite montmorillonite silica gibbsite brucite tetrahedral octahedral isomorphous swelling', Body: MineralsBody },
  { id: 'c-structure', group: 'idx', title: 'Soil structures', tag: 'Topic 4A', keywords: 'single grained honeycomb flocculated dispersed skeleton matrix fabric', Body: StructureBody },
  { id: 'st-wv', group: 'steps', title: 'Steps: weight–volume problem', keywords: 'phase diagram block', Body: StepsWv },
  { id: 'st-plast', group: 'steps', title: 'Steps: Atterberg limits problem', keywords: 'liquid limit flow curve cone', Body: StepsPlast },
  { id: 'st-uscs', group: 'steps', title: 'Steps: USCS classification', keywords: 'unified symbol name', Body: StepsUscs },
  { id: 'st-aashto', group: 'steps', title: 'Steps: AASHTO classification', keywords: 'group index elimination', Body: StepsAashto },
]
void burmisterIndex
