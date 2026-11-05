// Shear-strength figures: a general Mohr diagram (circles, envelopes, pole, plane), a stress element with the
// plane and failure planes, the direct-shear τ–σ plot, and the theory sketches.
import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import type { Circle, Envelope } from '../../engine/mohr'

const f1 = (v: number) => fmt(v, 1)

export interface MohrCircleSpec {
  c: Circle
  color: string
  dash?: boolean
  label?: string
  /** draw the lower half too */
  full?: boolean
}
export interface EnvSpec {
  env: Envelope
  color: string
  label?: string
  dash?: boolean
}

/** a Mohr diagram that fits its circles; returns the scale so callers can overlay */
export function MohrFig({
  circles,
  envs = [],
  points = [],
  lines = [],
  width = 640,
  height = 300,
  full = false,
  onDrag,
  children,
}: {
  circles: MohrCircleSpec[]
  envs?: EnvSpec[]
  points?: { s: number; t: number; color: string; label?: string; r?: number; dx?: number; dy?: number }[]
  lines?: { s1: number; t1: number; s2: number; t2: number; color: string; dash?: boolean; w?: number }[]
  width?: number
  height?: number
  full?: boolean
  /** drag handler (σ value under the pointer, which handle) */
  onDrag?: (sigma: number, tau: number) => void
  children?: (X: (s: number) => number, Y: (t: number) => number) => ReactNode
}) {
  const L = 44,
    Rm = 14,
    Tm = 14,
    B = 30
  const smax = Math.max(10, ...circles.map((c) => c.c.C + c.c.R), ...points.map((p) => p.s)) * 1.08
  const smin = Math.min(0, ...circles.map((c) => c.c.C - c.c.R), ...points.map((p) => p.s)) * 1.08
  const tmaxData = Math.max(1, ...circles.map((c) => c.c.R), ...points.map((p) => Math.abs(p.t)))
  const kx = (width - L - Rm) / (smax - smin)
  const availY = full ? (height - Tm - B) / 2 : height - Tm - B
  const k = Math.min(kx, availY / (tmaxData * 1.1))
  const X = (s: number) => L + (s - smin) * k
  const y0 = full ? Tm + availY : height - B
  const Y = (t: number) => y0 - t * k
  const tTop = (y0 - Tm) / k
  const sRight = (width - Rm - L) / k + smin
  const ticks = (() => {
    const span = sRight - smin
    const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000].find((s) => span / s <= 8) ?? 10000
    const out: number[] = []
    for (let v = Math.ceil(smin / step) * step; v <= sRight; v += step) out.push(v)
    return out
  })()
  const handle = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onDrag || !(e.buttons & 1)) return
    const svg = e.currentTarget
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(ctm.inverse())
    onDrag(smin + (p.x - L) / k, (y0 - p.y) / k)
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={'w-full ' + (onDrag ? 'touch-none cursor-crosshair' : '')} role="img" aria-label="Mohr diagram" onPointerDown={handle} onPointerMove={handle}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={X(v)} x2={X(v)} y1={Y(0) - 3} y2={Y(0) + 3} stroke="var(--c-mute)" />
          <text x={X(v)} y={Y(0) + 14} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
            {v}
          </text>
        </g>
      ))}
      <line x1={L} x2={width - Rm} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" />
      <line x1={X(0)} x2={X(0)} y1={Tm} y2={full ? height - B + 6 : Y(0)} stroke="var(--c-ink)" />
      <text x={width - Rm} y={Y(0) - 5} fontSize={10} textAnchor="end" fill="var(--c-ink)">
        σ (kPa)
      </text>
      <text x={X(0) + 4} y={Tm + 8} fontSize={10} fill="var(--c-ink)">
        τ
      </text>
      {envs.map((e, i) => {
        const tp = Math.tan((e.env.phi * Math.PI) / 180)
        const s0 = e.env.c > 0 || tp <= 0 ? 0 : 0
        const sEnd = tp > 1e-9 ? Math.min(sRight, (tTop - e.env.c) / tp) : sRight
        return (
          <g key={i}>
            <line x1={X(s0)} y1={Y(e.env.c + s0 * tp)} x2={X(sEnd)} y2={Y(e.env.c + sEnd * tp)} stroke={e.color} strokeWidth={1.6} strokeDasharray={e.dash ? '6 3' : undefined} />
            {e.label && (
              <g>
                <line x1={L + 22} x2={L + 40} y1={Tm + 10 + i * 14} y2={Tm + 10 + i * 14} stroke={e.color} strokeWidth={1.6} strokeDasharray={e.dash ? '6 3' : undefined} />
                <text x={L + 44} y={Tm + 13 + i * 14} fontSize={9.5} fill={e.color}>
                  {e.label}
                </text>
              </g>
            )}
          </g>
        )
      })}
      {circles.map((c, i) => (
        <g key={i}>
          <path
            d={`M${X(c.c.C - c.c.R)},${Y(0)} A${c.c.R * k},${c.c.R * k} 0 0 1 ${X(c.c.C + c.c.R)},${Y(0)}${c.full || full ? ` A${c.c.R * k},${c.c.R * k} 0 0 1 ${X(c.c.C - c.c.R)},${Y(0)}` : ''}`}
            fill="none"
            stroke={c.color}
            strokeWidth={1.7}
            strokeDasharray={c.dash ? '5 3' : undefined}
          />
          {c.label && (
            <text x={X(c.c.C)} y={Y(c.c.R) - 4} fontSize={9} textAnchor="middle" fill={c.color}>
              {c.label}
            </text>
          )}
        </g>
      ))}
      {lines.map((l, i) => (
        <line key={i} x1={X(l.s1)} y1={Y(l.t1)} x2={X(l.s2)} y2={Y(l.t2)} stroke={l.color} strokeWidth={l.w ?? 1.3} strokeDasharray={l.dash ? '4 3' : undefined} />
      ))}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={X(p.s)} cy={Y(p.t)} r={p.r ?? 3.5} fill={p.color} />
          {p.label && (
            <text x={X(p.s) + (p.dx ?? 5)} y={Y(p.t) + (p.dy ?? -5)} fontSize={9.5} fill={p.color}>
              {p.label}
            </text>
          )}
        </g>
      ))}
      {children?.(X, Y)}
    </svg>
  )
}

/** a stress element: σz on the horizontal faces, σx on the vertical faces, τ; a plane at θ and the failure planes */
export function StressElement({ sx, sz, txz, planeDeg, failDegs = [], majorDeg, size = 230 }: { sx: number; sz: number; txz: number; planeDeg?: number; failDegs?: number[]; majorDeg?: number; size?: number }) {
  const c = size / 2,
    a = size * 0.2
  const big = Math.max(Math.abs(sx), Math.abs(sz), Math.abs(txz), 1)
  const len = (v: number) => 10 + 26 * (Math.abs(v) / big)
  const ln = (deg: number, col: string, dash?: string, L = size * 0.44, w = 1.6) => {
    const r = (deg * Math.PI) / 180
    return <line x1={c - L * Math.cos(r)} y1={c + L * Math.sin(r)} x2={c + L * Math.cos(r)} y2={c - L * Math.sin(r)} stroke={col} strokeWidth={w} strokeDasharray={dash} />
  }
  const arr = (x1: number, y1: number, x2: number, y2: number, key: string) => <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--c-load)" strokeWidth={2} markerEnd="url(#searr)" />
  // τ (Das τxy, positive = counter-clockwise couple on the vertical faces): right face up, top face to the right
  const t = txz
  const ts = Math.min(a * 0.9, 6 + 20 * (Math.abs(t) / big))
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px]" role="img" aria-label="stress element">
      <defs>
        <marker id="searr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-load)" />
        </marker>
      </defs>
      <rect x={c - a} y={c - a} width={2 * a} height={2 * a} fill="var(--c-soil)" opacity={0.5} stroke="var(--c-ink)" />
      {/* normal stresses (compression → arrows pointing at the faces) */}
      {arr(c, c - a - len(sz) - 2, c, c - a - 2, 'zt')}
      {arr(c, c + a + len(sz) + 2, c, c + a + 2, 'zb')}
      {arr(c - a - len(sx) - 2, c, c - a - 2, c, 'xl')}
      {arr(c + a + len(sx) + 2, c, c + a + 2, c, 'xr')}
      {Math.abs(t) > 1e-9 && (
        <g>
          {arr(c + a + 5, c + (t > 0 ? ts : -ts), c + a + 5, c + (t > 0 ? -ts : ts), 'tr')}
          {arr(c - a - 5, c + (t > 0 ? -ts : ts), c - a - 5, c + (t > 0 ? ts : -ts), 'tl')}
          {arr(c + (t > 0 ? -ts : ts), c - a - 5, c + (t > 0 ? ts : -ts), c - a - 5, 'tt')}
          {arr(c + (t > 0 ? ts : -ts), c + a + 5, c + (t > 0 ? -ts : ts), c + a + 5, 'tb')}
        </g>
      )}
      <text x={c + 5} y={c - a - len(sz) + 6} fontSize={10} fill="var(--c-ink)">
        σz = {f1(sz)}
      </text>
      <text x={c + a + len(sx) - 6} y={c + 16} fontSize={10} textAnchor="end" fill="var(--c-ink)">
        σx = {f1(sx)}
      </text>
      {Math.abs(t) > 1e-9 && (
        <text x={c + a + 9} y={c - ts - 4} fontSize={9.5} fill="var(--c-load)">
          τ = {f1(t)}
        </text>
      )}
      {majorDeg !== undefined && ln(majorDeg, 'var(--c-mute)', '2 3', size * 0.3, 1)}
      {failDegs.map((d, i) => (
        <g key={i}>{ln(d, 'var(--c-bad)', '6 3')}</g>
      ))}
      {planeDeg !== undefined && ln(planeDeg, 'var(--c-accent)', undefined, size * 0.46, 2.2)}
    </svg>
  )
}

/** τf against σ with the regression line (direct shear) */
export function TauSigmaFig({ pts, env, env2, width = 520, height = 260 }: { pts: { sigma: number; tau: number }[]; env: Envelope; env2?: { env: Envelope; color: string; label: string; pts?: { sigma: number; tau: number }[] }; width?: number; height?: number }) {
  const L = 44,
    B = 30,
    Tm = 12,
    Rm = 12
  const allPts = [...pts, ...(env2?.pts ?? [])]
  const smax = Math.max(10, ...allPts.map((p) => p.sigma)) * 1.15
  const tmax = Math.max(10, ...allPts.map((p) => p.tau), env.c + smax * Math.tan((env.phi * Math.PI) / 180)) * 1.1
  const k = Math.min((width - L - Rm) / smax, (height - B - Tm) / tmax)
  const X = (s: number) => L + s * k
  const Y = (t: number) => height - B - t * k
  const tp = Math.tan((env.phi * Math.PI) / 180)
  const line = (e: Envelope) => {
    const t2 = Math.tan((e.phi * Math.PI) / 180)
    return { x1: X(0), y1: Y(e.c), x2: X(smax), y2: Y(e.c + smax * t2) }
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="shear stress against normal stress">
      <line x1={L} x2={width - Rm} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" />
      <line x1={L} x2={L} y1={Tm} y2={Y(0)} stroke="var(--c-ink)" />
      <text x={width - Rm} y={Y(0) + 14} fontSize={10} textAnchor="end" fill="var(--c-ink)">
        σ (kPa)
      </text>
      <text x={L + 4} y={Tm + 8} fontSize={10} fill="var(--c-ink)">
        τf (kPa)
      </text>
      <line {...line(env)} stroke="var(--c-accent)" strokeWidth={1.6} />
      <text x={X(smax) - 2} y={Y(env.c + smax * tp) + 14} fontSize={9.5} textAnchor="end" fill="var(--c-accent)">
        τ = {fmt(env.c, 2)} + σ tan {fmt(env.phi, 2)}°
      </text>
      {env2 && <line {...line(env2.env)} stroke={env2.color} strokeWidth={1.4} strokeDasharray="5 3" />}
      {env2 && (
        <text x={X(smax) - 2} y={Y(env2.env.c + smax * Math.tan((env2.env.phi * Math.PI) / 180)) - 6} fontSize={9.5} textAnchor="end" fill={env2.color}>
          {env2.label}
        </text>
      )}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={X(p.sigma)} cy={Y(p.tau)} r={4} fill="var(--c-load)" />
          <text x={X(p.sigma) + 5} y={Y(p.tau) + 12} fontSize={9} fill="var(--c-mute)">
            ({fmt(p.sigma, 1)}, {fmt(p.tau, 1)})
          </text>
        </g>
      ))}
      {env2?.pts?.map((p, i) => <circle key={`b${i}`} cx={X(p.sigma)} cy={Y(p.tau)} r={3.5} fill={env2.color} />)}
    </svg>
  )
}

// ---------------------------------------------------------------- theory sketches
function Panel({ title, xl, yl, children, w = 250, h = 160, zeroMid = false }: { title: string; xl: string; yl: string; children: ReactNode; w?: number; h?: number; zeroMid?: boolean }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={title}>
      <text x={w / 2} y={11} fontSize={10} fontWeight={600} textAnchor="middle" fill="var(--c-ink)">
        {title}
      </text>
      <line x1={30} x2={w - 8} y1={zeroMid ? (h - 22 + 18) / 2 : h - 22} y2={zeroMid ? (h - 22 + 18) / 2 : h - 22} stroke="var(--c-ink)" />
      <line x1={30} x2={30} y1={18} y2={h - 22} stroke="var(--c-ink)" />
      <text x={w - 8} y={h - 8} fontSize={9} textAnchor="end" fill="var(--c-mute)">
        {xl}
      </text>
      <text x={12} y={(h - 4) / 2} fontSize={9} textAnchor="middle" fill="var(--c-mute)" transform={`rotate(-90 12 ${(h - 4) / 2})`}>
        {yl}
      </text>
      {children}
    </svg>
  )
}
const Lbl = ({ x, y, c, t }: { x: number; y: number; c: string; t: string }) => (
  <text x={x} y={y} fontSize={9} fill={c}>
    {t}
  </text>
)

/** dense sand / OC clay vs loose sand / NC clay in direct shear (slides 24–27) */
export function DSCurvesSketch() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Panel title="Shear stress vs displacement" xl="shear displacement" yl="τ">
        <path d="M30,138 C50,60 70,40 95,42 C120,46 140,70 230,72" fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
        <path d="M30,138 C70,100 120,78 230,72" fill="none" stroke="var(--c-load)" strokeWidth={1.8} />
        <Lbl x={96} y={36} c="var(--c-accent)" t="peak τf (dense / OC)" />
        <Lbl x={150} y={66} c="var(--c-mute)" t="ultimate τult" />
        <Lbl x={120} y={104} c="var(--c-load)" t="loose / NC" />
      </Panel>
      <Panel title="Change in height (volume) vs displacement" xl="shear displacement" yl="ΔH" zeroMid>
        <path d="M30,79 C45,84 60,86 75,80 C110,62 170,42 230,38" fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
        <path d="M30,79 C70,100 130,112 230,116" fill="none" stroke="var(--c-load)" strokeWidth={1.8} />
        <Lbl x={150} y={36} c="var(--c-accent)" t="dense: dilation" />
        <Lbl x={140} y={128} c="var(--c-load)" t="loose: contraction" />
        <Lbl x={34} y={74} c="var(--c-mute)" t="expansion ↑" />
      </Panel>
    </div>
  )
}

/** qualitative curves asked in 2017-18, 2020-21, 2021-22, Jan 2021 */
export function QualCurvesSketch() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Panel title="(i) CU: pore pressure vs axial strain" xl="axial strain ε" yl="Δu" zeroMid>
        <path d="M30,79 C60,40 90,30 230,30" fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
        <path d="M30,79 C60,62 100,58 230,62" fill="none" stroke="var(--c-load)" strokeWidth={1.8} />
        <path d="M30,79 C45,70 60,72 80,85 C120,110 170,120 230,122" fill="none" stroke="var(--c-bad)" strokeWidth={1.8} />
        <Lbl x={150} y={26} c="var(--c-accent)" t="NC (+)" />
        <Lbl x={150} y={56} c="var(--c-load)" t="lightly OC" />
        <Lbl x={130} y={112} c="var(--c-bad)" t="heavily OC (−)" />
      </Panel>
      <Panel title="(ii) CD: volume change vs strain" xl="axial strain / displacement" yl="expansion ↑ ΔV" zeroMid>
        <path d="M30,79 C70,100 130,112 230,116" fill="none" stroke="var(--c-load)" strokeWidth={1.8} />
        <path d="M30,79 C45,86 60,88 75,82 C110,62 170,44 230,40" fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
        <Lbl x={110} y={128} c="var(--c-load)" t="loose / NC: contracts" />
        <Lbl x={110} y={40} c="var(--c-accent)" t="dense sand / OC: dilates" />
      </Panel>
      <Panel title="(iii) B vs degree of saturation" xl="S (%) → 100" yl="B">
        <path d="M30,136 C120,134 170,128 200,100 C215,80 222,40 228,26" fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
        <line x1={30} x2={230} y1={26} y2={26} stroke="var(--c-line)" strokeDasharray="3 3" />
        <Lbl x={34} y={24} c="var(--c-mute)" t="B = 1" />
        <Lbl x={60} y={128} c="var(--c-mute)" t="dry: B ≈ 0" />
      </Panel>
      <Panel title="(iv) Af vs OCR" xl="OCR (log)" yl="Af" zeroMid>
        <path d="M34,32 C80,50 120,70 160,90 C190,104 210,112 230,116" fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
        <Lbl x={38} y={28} c="var(--c-mute)" t="NC ≈ 0.7–1" />
        <Lbl x={140} y={76} c="var(--c-mute)" t="0 near OCR ≈ 4" />
        <Lbl x={170} y={128} c="var(--c-mute)" t="negative" />
      </Panel>
    </div>
  )
}

export function StressStrainSketch() {
  return (
    <Panel title="Stress–strain of soil: yield, peak, ultimate (critical), residual" xl="shear strain / displacement" yl="τ" w={520} h={190}>
      <path d="M30,168 C50,110 70,60 110,42 C140,32 170,50 230,74 C300,92 380,100 510,104" fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
      <path d="M30,168 C80,120 140,90 230,76 C300,72 380,72 510,72" fill="none" stroke="var(--c-load)" strokeWidth={1.6} strokeDasharray="5 3" />
      <circle cx={58} cy={100} r={3} fill="var(--c-ink)" />
      <Lbl x={62} y={104} c="var(--c-ink)" t="yield (end of linear part)" />
      <Lbl x={112} y={36} c="var(--c-accent)" t="peak (dense / OC)" />
      <Lbl x={300} y={66} c="var(--c-load)" t="ultimate = critical state (loose / NC reaches it without a peak)" />
      <Lbl x={380} y={116} c="var(--c-accent)" t="residual (large displacement, clay)" />
    </Panel>
  )
}

export function MCSketch() {
  return (
    <MohrFig
      circles={[
        { c: { C: 150, R: 60, s1: 210, s3: 90 }, color: 'var(--c-mute)', dash: true, label: 'safe' },
        { c: { C: 200, R: 120, s1: 320, s3: 80 }, color: 'var(--c-accent)', label: 'failure: touches' },
      ]}
      envs={[{ env: { c: 30, phi: 30 }, color: 'var(--c-bad)', label: 'τf = c + σ tan φ' }]}
      points={[{ s: 200 - 120 * 0.5, t: 120 * 0.866, color: 'var(--c-bad)', label: '(σf, τf) on the failure plane' }]}
      height={240}
    />
  )
}

export function UCSketch() {
  return (
    <MohrFig
      circles={[{ c: { C: 100, R: 100, s1: 200, s3: 0 }, color: 'var(--c-accent)', label: 'σ3 = 0, σ1 = qu' }]}
      envs={[{ env: { c: 100, phi: 0 }, color: 'var(--c-bad)', label: 'φu = 0: τf = cu = qu/2' }]}
      points={[{ s: 100, t: 100, color: 'var(--c-bad)', label: 'tangent at the top, failure plane 45°' }]}
      height={230}
    />
  )
}

export function UUSketch() {
  return (
    <MohrFig
      circles={[
        { c: { C: 130, R: 80, s1: 210, s3: 50 }, color: 'var(--c-accent)', label: 'σ3 = 50' },
        { c: { C: 230, R: 80, s1: 310, s3: 150 }, color: 'var(--c-accent)', label: 'σ3 = 150' },
        { c: { C: 330, R: 80, s1: 410, s3: 250 }, color: 'var(--c-accent)', label: 'σ3 = 250' },
        { c: { C: 180, R: 80, s1: 260, s3: 100 }, color: 'var(--c-load)', dash: true, label: 'single effective circle' },
      ]}
      envs={[{ env: { c: 80, phi: 0 }, color: 'var(--c-bad)', label: 'φu = 0, τf = cu' }]}
      height={230}
    />
  )
}

/** field cases: UU, CU, CD (sketch of embankment / footing on clay) */
export function FieldCasesSketch() {
  const Box = ({ x, title, sub, kind }: { x: number; title: string; sub: string; kind: 'emb' | 'foot' | 'cut' }) => (
    <g>
      <rect x={x} y={70} width={150} height={60} fill="var(--c-soil)" opacity={0.45} />
      {kind === 'emb' && <path d={`M${x + 20},70 L${x + 55},40 L${x + 95},40 L${x + 130},70 Z`} fill="var(--c-soil)" stroke="var(--c-ink)" />}
      {kind === 'foot' && <rect x={x + 55} y={52} width={40} height={18} fill="var(--c-mute)" />}
      {kind === 'cut' && <path d={`M${x},70 L${x},40 L${x + 50},40 L${x + 100},70`} fill="var(--c-bg)" stroke="var(--c-ink)" />}
      <path d={`M${x + 25},70 Q${x + 75},125 ${x + 128},70`} fill="none" stroke="var(--c-bad)" strokeDasharray="4 3" />
      <text x={x + 75} y={146} fontSize={10} fontWeight={600} textAnchor="middle" fill="var(--c-ink)">
        {title}
      </text>
      <text x={x + 75} y={158} fontSize={8.5} textAnchor="middle" fill="var(--c-mute)">
        {sub}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 500 165" className="w-full" role="img" aria-label="UU CU CD field cases">
      <Box x={8} title="UU (end of construction)" sub="embankment / footing placed fast on soft clay" kind="emb" />
      <Box x={175} title="CU (staged / drawdown)" sub="raise a consolidated embankment quickly" kind="foot" />
      <Box x={342} title="CD (long term)" sub="cut slope / embankment years later" kind="cut" />
    </svg>
  )
}

export function VaneSketch() {
  return (
    <svg viewBox="0 0 300 170" className="w-full max-w-[340px]" role="img" aria-label="vane">
      <line x1={150} x2={150} y1={6} y2={50} stroke="var(--c-ink)" strokeWidth={3} />
      <rect x={110} y={50} width={80} height={90} fill="var(--c-soil)" opacity={0.35} stroke="var(--c-ink)" />
      <line x1={150} x2={150} y1={50} y2={140} stroke="var(--c-ink)" strokeWidth={2} />
      <line x1={110} x2={190} y1={95} y2={95} stroke="var(--c-ink)" strokeWidth={2} />
      <text x={200} y={100} fontSize={10} fill="var(--c-ink)">
        H (= 2D)
      </text>
      <text x={150} y={156} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
        D
      </text>
      <text x={160} y={22} fontSize={10} fill="var(--c-load)">
        torque T
      </text>
      <text x={10} y={70} fontSize={9} fill="var(--c-mute)">
        side: cu·πDH·D/2
      </text>
      <text x={10} y={84} fontSize={9} fill="var(--c-mute)">
        each end: cu·πD³/12
      </text>
    </svg>
  )
}
