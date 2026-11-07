// Plasticity figures: flow curve (cup or cone, draggable points), consistency-state bar, strength across the
// plastic range, volume–water content (shrinkage) plot.
import { useRef, useState } from 'react'
import { nf } from '../../engine/phase'
import { tipAxes } from '../../../components/PointTip'

const MUTE = { fill: 'var(--c-mute)', fontSize: 10 } as const
const TXT = { fill: 'var(--c-ink)', fontSize: 11 } as const

function svgPt(svg: SVGSVGElement | null, e: { clientX: number; clientY: number }) {
  const m = svg?.getScreenCTM()
  if (!m) return null
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
  return { x: p.x, y: p.y }
}

const niceLo = (v: number, s = 5) => Math.floor(v / s) * s
const niceHi = (v: number, s = 5) => Math.ceil(v / s) * s

export interface FlowPt {
  x: number
  w: number
}

/**
 * w against log N (cup) or against penetration d (cone; linear, or log when `logX`).
 * a, b: best fit w = a + b·X(x). LL marked at N = 25 / d = 20 mm.
 */
export function FlowPlot({ mode, pts, a, b, LL, logX, onDrag, w = 520 }: { mode: 'cup' | 'cone'; pts: FlowPt[]; a: number; b: number; LL: number; logX?: boolean; onDrag?: (i: number, x: number, w: number) => void; w?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<number | null>(null)
  const lg = mode === 'cup' || !!logX
  const ml = 44,
    mt = 12,
    W = 440,
    H = 220
  const xs = pts.map((p) => p.x).filter((v) => v > 0)
  const ws = [...pts.map((p) => p.w), LL].filter(Number.isFinite)
  const xLo = mode === 'cup' ? 5 : lg ? 5 : 0
  const xHi = mode === 'cup' ? 100 : Math.max(40, niceHi(Math.max(...xs, 20) + 2, 5))
  const yLo = niceLo(Math.min(...ws) - 3)
  const yHi = niceHi(Math.max(...ws) + 3)
  const T = (x: number) => (lg ? Math.log10(x) : x)
  const X = (x: number) => ml + ((T(x) - T(xLo)) / (T(xHi) - T(xLo))) * W
  const Y = (v: number) => mt + H - ((v - yLo) / (yHi - yLo)) * H
  const inv = (px: number, py: number) => {
    const tx = T(xLo) + ((px - ml) / W) * (T(xHi) - T(xLo))
    return { x: lg ? 10 ** tx : tx, w: yLo + ((mt + H - py) / H) * (yHi - yLo) }
  }
  const xTicks = mode === 'cup' ? [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100] : lg ? [5, 10, 15, 20, 25, 30, 40] : Array.from({ length: xHi / 5 + 1 }, (_, i) => i * 5)
  const yStep = yHi - yLo > 40 ? 10 : 5
  const yTicks = Array.from({ length: Math.floor((yHi - yLo) / yStep) + 1 }, (_, i) => yLo + i * yStep)
  const fx = mode === 'cup' ? 25 : 20
  const line = Number.isFinite(a) && Number.isFinite(b)
  return (
    <svg
      ref={ref}
      viewBox="0 0 500 262"
      style={{ width: '100%', maxWidth: w, touchAction: onDrag ? 'none' : undefined }}
      {...tipAxes({ X, Y, xLog: lg, x: mode === 'cup' ? 'N' : 'd', xUnit: mode === 'cup' ? '' : ' mm', y: 'w', yUnit: ' %' })}
      onPointerMove={(e) => {
        if (drag === null || !onDrag) return
        const p = svgPt(ref.current, e)
        if (!p) return
        const q = inv(p.x, p.y)
        const x = mode === 'cup' ? Math.max(5, Math.min(100, Math.round(q.x))) : Math.max(1, Math.min(xHi, Math.round(q.x * 10) / 10))
        onDrag(drag, x, Math.round(q.w * 10) / 10)
      }}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      {xTicks.map((t) => (
        <g key={'x' + t}>
          <line x1={X(t)} x2={X(t)} y1={mt} y2={mt + H} stroke="var(--c-line)" strokeWidth={t === fx ? 0 : 0.6} />
          <text x={X(t)} y={mt + H + 13} textAnchor="middle" {...MUTE}>
            {t}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={'y' + t}>
          <line x1={ml} x2={ml + W} y1={Y(t)} y2={Y(t)} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={ml - 5} y={Y(t) + 3} textAnchor="end" {...MUTE}>
            {t}
          </text>
        </g>
      ))}
      <text x={ml + W / 2} y={258} textAnchor="middle" {...TXT}>
        {mode === 'cup' ? 'Number of blows N (log scale)' : `Cone penetration d, mm${lg ? ' (log scale)' : ''}`}
      </text>
      <text x={12} y={mt + H / 2} textAnchor="middle" transform={`rotate(-90 12 ${mt + H / 2})`} {...TXT}>
        Water content w (%)
      </text>
      {line && <line x1={X(xLo)} x2={X(xHi)} y1={Y(a + b * T(xLo))} y2={Y(a + b * T(xHi))} stroke="var(--c-accent)" strokeWidth={1.8} data-curve />}
      {Number.isFinite(LL) && LL >= yLo && LL <= yHi && (
        <g>
          <line x1={X(fx)} x2={X(fx)} y1={mt} y2={mt + H} stroke="var(--c-load)" strokeDasharray="4 3" />
          <line x1={ml} x2={X(fx)} y1={Y(LL)} y2={Y(LL)} stroke="var(--c-load)" strokeDasharray="4 3" />
          <text x={X(fx) + 5} y={Y(LL) - 6} fontSize={11} fontWeight={700} fill="var(--c-load)">
            LL = {nf(LL, 4)} %
          </text>
          <text x={X(fx) + 3} y={mt + 10} fontSize={10} fill="var(--c-load)">
            {mode === 'cup' ? 'N = 25' : 'd = 20 mm'}
          </text>
        </g>
      )}
      {pts.map((p, i) =>
        p.x > 0 && Number.isFinite(p.w) ? (
          <circle
            key={i}
            cx={X(p.x)}
            cy={Y(p.w)}
            r={drag === i ? 7 : 5.5}
            data-tip={`${mode === 'cup' ? 'N' : 'd'} = ${nf(p.x, 4)}${mode === 'cup' ? '' : ' mm'}, w = ${nf(p.w, 4)} %`}
            fill="var(--c-panel)"
            stroke="var(--c-ink)"
            strokeWidth={1.8}
            style={{ cursor: onDrag ? 'grab' : undefined }}
            onPointerDown={(e) => {
              if (!onDrag) return
              ;(e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture?.(e.pointerId)
              setDrag(i)
            }}
          />
        ) : null,
      )}
    </svg>
  )
}

/** solid → semi-solid → plastic → liquid along the water-content axis, LI of the natural w marked */
export function StateBar({ SL, PL, LL, w, w2, wMax, h = 96 }: { SL?: number; PL: number; LL: number; w?: number; w2?: number; wMax?: number; h?: number }) {
  const hi = wMax ?? niceHi(Math.max(LL * 1.25, (w ?? 0) + 8, (w2 ?? 0) + 8), 10)
  const x0 = 16,
    W = 488
  const X = (v: number) => x0 + (Math.max(0, Math.min(hi, v)) / hi) * W
  const sl = SL !== undefined && Number.isFinite(SL) ? SL : PL * 0.55
  const zones = [
    { a: 0, b: sl, t: 'solid', c: 0.75 },
    { a: sl, b: PL, t: 'semi-solid', c: 0.5 },
    { a: PL, b: LL, t: 'plastic', c: 0.3 },
    { a: LL, b: hi, t: 'liquid', c: 0.12 },
  ]
  const LIof = (v: number) => (v - PL) / (LL - PL)
  const mark = (v: number, col: string, lab: string, dy: number) => (
    <g>
      <polygon points={`${X(v)},${30} ${X(v) - 6},${18} ${X(v) + 6},${18}`} fill={col} />
      <text x={X(v)} y={14 - dy} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={col}>
        {lab} = {nf(v, 3)} % (LI {nf(LIof(v), 2)})
      </text>
    </g>
  )
  return (
    <svg viewBox={`0 0 520 ${h}`} style={{ width: '100%', maxWidth: 560 }}>
      {zones.map((z) => (
        <g key={z.t}>
          <rect x={X(z.a)} y={30} width={Math.max(0, X(z.b) - X(z.a))} height={26} fill={`color-mix(in oklab, var(--c-soil) ${z.c * 100}%, color-mix(in oklab, var(--c-water) ${(1 - z.c) * 30}%, transparent))`} stroke="var(--c-line)" />
          <text x={(X(z.a) + X(z.b)) / 2} y={47} textAnchor="middle" fontSize={10.5} fill="var(--c-ink)">
            {z.t}
          </text>
        </g>
      ))}
      {[
        [sl, SL !== undefined && Number.isFinite(SL) ? 'SL' : 'SL?'],
        [PL, 'PL'],
        [LL, 'LL'],
      ].map(([v, t]) => (
        <g key={t as string}>
          <line x1={X(v as number)} x2={X(v as number)} y1={28} y2={62} stroke="var(--c-ink)" strokeWidth={1.2} />
          <text x={X(v as number)} y={74} textAnchor="middle" fontSize={10} fill="var(--c-ink)">
            {t} {t !== 'SL?' ? nf(v as number, 3) : ''}
          </text>
        </g>
      ))}
      <text x={X(PL)} y={88} textAnchor="middle" {...MUTE}>
        LI = 0: high strength
      </text>
      <text x={X(LL)} y={88} textAnchor="middle" {...MUTE}>
        LI = 1: low strength
      </text>
      {w !== undefined && Number.isFinite(w) && mark(w, 'var(--c-load)', 'w', 0)}
      {w2 !== undefined && Number.isFinite(w2) && mark(w2, 'var(--c-accent2)', 'w₂', 0)}
      <text x={x0} y={h - 2} {...MUTE}>
        0
      </text>
      <text x={x0 + W} y={h - 2} textAnchor="end" {...MUTE}>
        w (%) → {hi}
      </text>
    </svg>
  )
}

/** undrained strength across the plastic range (qualitative: about 100 × from LL to PL; Wroth & Wood cu ≈ 170·e^(−4.6 LI) kPa) */
export function StrengthCurve({ PL, LL, w1, w2 }: { PL: number; LL: number; w1: number; w2?: number }) {
  const ml = 46,
    mt = 10,
    W = 420,
    H = 150
  const cu = (w: number) => 170 * Math.exp((-4.6 * (w - PL)) / (LL - PL))
  const X = (w: number) => ml + ((w - PL) / (LL - PL)) * W
  const Y = (c: number) => mt + H - ((Math.log10(c) - Math.log10(1)) / (Math.log10(200) - Math.log10(1))) * H
  const path = Array.from({ length: 41 }, (_, i) => PL + ((LL - PL) * i) / 40)
    .map((w, i) => `${i ? 'L' : 'M'}${X(w).toFixed(1)},${Y(cu(w)).toFixed(1)}`)
    .join(' ')
  const dot = (w: number, col: string) =>
    Number.isFinite(w) && w >= PL && w <= LL ? (
      <g>
        <circle cx={X(w)} cy={Y(cu(w))} r={5} fill={col} data-tip={`w = ${nf(w, 4)} %, LI = ${nf((w - PL) / (LL - PL), 3)}, cu ≈ ${nf(cu(w), 3)} kPa`} />
        <text x={X(w) + 7} y={Y(cu(w)) - 6} fontSize={10.5} fontWeight={700} fill={col}>
          ≈ {nf(cu(w), 2)} kPa
        </text>
      </g>
    ) : null
  return (
    <svg viewBox="0 0 490 196" style={{ width: '100%', maxWidth: 520 }} {...tipAxes({ X, Y, yLog: true, x: 'w', xUnit: ' %', y: 'cu', yUnit: ' kPa' })}>
      {[1, 10, 100].map((c) => (
        <g key={c}>
          <line x1={ml} x2={ml + W} y1={Y(c)} y2={Y(c)} stroke="var(--c-line)" />
          <text x={ml - 5} y={Y(c) + 3} textAnchor="end" {...MUTE}>
            {c}
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      <text x={X(PL)} y={mt + H + 14} textAnchor="middle" {...MUTE}>
        PL (LI = 0)
      </text>
      <text x={X(LL)} y={mt + H + 14} textAnchor="middle" {...MUTE}>
        LL (LI = 1)
      </text>
      <text x={ml + W / 2} y={mt + H + 30} textAnchor="middle" {...TXT}>
        water content →
      </text>
      <text x={12} y={mt + H / 2} textAnchor="middle" transform={`rotate(-90 12 ${mt + H / 2})`} fontSize={10} fill="var(--c-ink)">
        cu (kPa, log)
      </text>
      {dot(w1, 'var(--c-load)')}
      {w2 !== undefined && dot(w2, 'var(--c-accent2)')}
    </svg>
  )
}

/** volume against water content: straight line down to the SL, flat below (shrinkage test) */
export function ShrinkPlot({ w1, SL, V1, V2 }: { w1: number; SL: number; V1: number; V2: number }) {
  const ml = 46,
    mt = 12,
    W = 400,
    H = 150
  const wHi = niceHi(w1 + 5, 10)
  const vHi = niceHi(V1 * 1.1, 2)
  const X = (w: number) => ml + (w / wHi) * W
  const Y = (v: number) => mt + H - (v / vHi) * H
  return (
    <svg viewBox="0 0 470 196" style={{ width: '100%', maxWidth: 480 }} {...tipAxes({ X, Y, x: 'w', xUnit: ' %', y: 'V' })}>
      <line x1={ml} x2={ml + W} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" />
      <line x1={ml} x2={ml} y1={mt} y2={Y(0)} stroke="var(--c-ink)" />
      <polyline points={`${X(0)},${Y(V2)} ${X(SL)},${Y(V2)} ${X(w1)},${Y(V1)}`} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      <line x1={X(SL)} x2={X(SL)} y1={Y(V2)} y2={Y(0)} stroke="var(--c-load)" strokeDasharray="4 3" />
      <text x={X(SL)} y={Y(0) + 13} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--c-load)">
        SL = {nf(SL, 3)} %
      </text>
      <text x={X(w1)} y={Y(0) + 13} textAnchor="middle" {...MUTE}>
        w₁ = {nf(w1, 3)}
      </text>
      <circle cx={X(w1)} cy={Y(V1)} r={4.5} fill="var(--c-ink)" data-tip={`wet pat: w = ${nf(w1, 4)} %, V = ${nf(V1, 4)}`} />
      <text x={X(w1) - 6} y={Y(V1) - 7} textAnchor="end" fontSize={10} fill="var(--c-ink)">
        wet pat V₁ = {nf(V1, 4)}
      </text>
      <circle cx={X(0)} cy={Y(V2)} r={4.5} fill="var(--c-ink)" data-tip={`dry pat: w = 0, V = ${nf(V2, 4)}`} />
      <text x={X(0) + 6} y={Y(V2) - 7} fontSize={10} fill="var(--c-ink)">
        dry V₂ = {nf(V2, 4)}
      </text>
      <text x={X((SL + w1) / 2) + 6} y={Y((V1 + V2) / 2) + 14} {...MUTE}>
        saturated: ΔV = Δw·m₂/ρw
      </text>
      <text x={ml + W / 2} y={190} textAnchor="middle" {...TXT}>
        water content w (%)
      </text>
      <text x={14} y={mt + H / 2} textAnchor="middle" transform={`rotate(-90 14 ${mt + H / 2})`} fontSize={10} fill="var(--c-ink)">
        volume
      </text>
    </svg>
  )
}

/** three-phase blocks at the PL and at the LL (saturated, same solids) — 2023-24 Q1(b) */
export function LimitPhases({ PL, LL, Gs = 2.7 }: { PL: number; LL: number; Gs?: number }) {
  const H = 150
  const Vs = 1
  const vMax = Vs + (LL / 100) * Gs
  const block = (x: number, w: number, lab: string) => {
    const Vw = (w / 100) * Gs
    const hs = (Vs / vMax) * H
    const hw = (Vw / vMax) * H
    const yTop = 20 + H - hs - hw
    return (
      <g>
        <rect x={x} y={yTop} width={90} height={hw} fill="color-mix(in oklab, var(--c-water) 32%, transparent)" stroke="var(--c-ink)" />
        <text x={x + 45} y={yTop + hw / 2 + 4} textAnchor="middle" fontSize={10.5} fill="var(--c-ink)">
          water
        </text>
        <rect x={x} y={20 + H - hs} width={90} height={hs} fill="color-mix(in oklab, var(--c-soil) 72%, transparent)" stroke="var(--c-ink)" />
        <text x={x + 45} y={20 + H - hs / 2 + 4} textAnchor="middle" fontSize={10.5} fill="var(--c-ink)">
          solids
        </text>
        <text x={x + 96} y={yTop + hw / 2 + 4} fontSize={10} fill="var(--c-mute)">
          Vw = wGs = {nf(Vw, 3)}
        </text>
        <text x={x + 96} y={20 + H - hs / 2 + 4} fontSize={10} fill="var(--c-mute)">
          Vs = 1, Ws = Gsγw
        </text>
        <text x={x + 45} y={yTop - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--c-ink)">
          {lab} (w = {nf(w, 3)} %)
        </text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 520 186" style={{ width: '100%', maxWidth: 540 }}>
      {block(20, PL, 'at the PL')}
      {block(280, LL, 'at the LL')}
      <text x={260} y={184} textAnchor="middle" fontSize={10} fill="var(--c-mute)">
        both saturated (no air), same solids; e = wGs grows from {nf((PL / 100) * Gs, 3)} to {nf((LL / 100) * Gs, 3)}
      </text>
    </svg>
  )
}
