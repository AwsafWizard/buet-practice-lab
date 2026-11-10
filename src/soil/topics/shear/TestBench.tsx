// Test bench: run a UU, CU or CD test in a triaxial cell or a shear box and watch the apparatus, the stress–strain
// curve, the pore-pressure / volume-change curve and the Mohr circles (or τ–σ points) build together.
// Every reading comes from engine/testsim.ts. Colours: warm = soil that contracts, teal = soil that dilates,
// blue = water; on the Mohr diagram accent = total stress, accent2 dashed = effective stress.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { tipAxes } from '../../../components/PointTip'
import { Seg } from '../../../components/ui'
import { Slider } from '../../../labs/common'
import type { Circle, Envelope } from '../../engine/mohr'
import { fitCircles, fitLine } from '../../engine/shear'
import { DISP_MAX, DS_H0, dsPeak, dsState, dsUltimate, effTest, EPS_MAX, failAt, rise, SIGMA0, SIM_SOILS, txCircles, txFailure, txState, type SimSoil, type SimTest, type TxState } from '../../engine/testsim'

type Rig = 'tx' | 'ds'
interface Cfg {
  rig: Rig
  test: SimTest
  soil: SimSoil
  /** σ3 (triaxial) or σn (shear box), kPa */
  sig: number
  compare: boolean
}

const C_WATER = 'var(--c-water)'
const C_TOTAL = 'var(--c-accent)'
const C_EFF = 'var(--c-accent2)'
const soilColor = (s: SimSoil) => (SIM_SOILS[s].dilative ? 'var(--c-shear)' : 'var(--c-load)')
const f0 = (v: number) => fmt(v, 0)
const f1 = (v: number) => fmt(v, 1)
const deg = (r: number) => (r * 180) / Math.PI

const RUN_S = 13
const SAMPLES = 100

/** which stage the timeline is in (0 apply pressure, 1 consolidate, 2 shear) and how far through it */
export function stageOf(t: number, test: SimTest) {
  const a = test === 'uu' ? 0.18 : 0.12
  const b = test === 'uu' ? 0.18 : 0.32
  if (t < a) return { stage: 0 as const, f: t / a }
  if (t < b) return { stage: 1 as const, f: (t - a) / (b - a) }
  return { stage: 2 as const, f: Math.min(1, (t - b) / (1 - b)) }
}

// ---------------------------------------------------------------- charts

interface Series {
  name: string
  pts: [number, number][]
  color: string
  dash?: boolean
  w?: number
  opacity?: number
  /** draw only up to this x and put a dot there */
  upto?: number
  /** label at the end of the curve */
  end?: string
}
interface Mark {
  x: number
  y: number
  color: string
  label?: string
  tip: string
  hollow?: boolean
}

const niceStep = (span: number, n = 4) => [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000].find((s) => span / s <= n) ?? 5000

const at = (pts: [number, number][], x: number) => {
  for (let i = 1; i < pts.length; i++)
    if (pts[i][0] >= x) {
      const [x0, y0] = pts[i - 1],
        [x1, y1] = pts[i]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1)
    }
  return pts[pts.length - 1][1]
}

function XYChart({ title, xl, yl, xn, yn, xUnit, yUnit, xmax, ymin, ymax, series, marks = [], note, wide }: { title: string; xl: string; yl: string; xn: string; yn: string; xUnit: string; yUnit: string; xmax: number; ymin: number; ymax: number; series: Series[]; marks?: Mark[]; note?: string; wide?: boolean }) {
  const W = wide ? 560 : 330,
    H = wide ? 236 : 200,
    L = 40,
    R = 10,
    T = 22,
    B = 26
  const clip = useId()
  const X = (x: number) => L + (x / xmax) * (W - L - R)
  const Y = (v: number) => T + ((ymax - v) / (ymax - ymin)) * (H - T - B)
  const sy = niceStep(ymax - ymin)
  const yt: number[] = []
  for (let v = Math.ceil(ymin / sy) * sy; v <= ymax + 1e-9; v += sy) yt.push(+v.toFixed(6))
  const sx = niceStep(xmax, 5)
  const xt: number[] = []
  for (let v = sx; v <= xmax + 1e-9; v += sx) xt.push(+v.toFixed(6))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title} {...tipAxes({ X, Y, x: xn, y: yn, xUnit, yUnit })}>
      <clipPath id={clip}>
        <rect x={L} y={T - 4} width={W - L - R + 6} height={H - T - B + 8} />
      </clipPath>
      <text x={L} y={12} fontSize={10.5} fontWeight={700} fill="var(--c-ink)">
        {title}
      </text>
      {yt.map((v) => (
        <g key={'y' + v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="var(--c-line)" strokeWidth={0.6} data-nocurve />
          <text x={L - 4} y={Y(v) + 3} fontSize={8.5} textAnchor="end" fill="var(--c-mute)">
            {v}
          </text>
        </g>
      ))}
      {xt.map((v) => (
        <text key={'x' + v} x={X(v)} y={H - B + 11} fontSize={8.5} textAnchor="middle" fill="var(--c-mute)">
          {v}
        </text>
      ))}
      <line x1={L} x2={W - R} y1={Y(Math.max(ymin, 0))} y2={Y(Math.max(ymin, 0))} stroke="var(--c-ink)" data-nocurve />
      <line x1={L} x2={L} y1={T} y2={H - B} stroke="var(--c-ink)" data-nocurve />
      <text x={W - R} y={H - 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
        {xl}
      </text>
      <text x={10} y={(T + H - B) / 2} fontSize={9} textAnchor="middle" fill="var(--c-mute)" transform={`rotate(-90 10 ${(T + H - B) / 2})`}>
        {yl}
      </text>
      {series.map((s) => {
        const lim = s.upto ?? xmax
        const pts = s.pts.filter((p) => p[0] <= lim + 1e-9)
        const head: [number, number] | null = s.upto !== undefined ? [lim, at(s.pts, lim)] : null
        if (head) pts.push(head)
        const last = pts[pts.length - 1]
        return (
          <g key={s.name} data-name={s.name} opacity={s.opacity ?? 1}>
            {pts.length > 1 && <polyline points={pts.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={s.w ?? 2.2} strokeDasharray={s.dash ? '5 3' : undefined} strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#${clip})`} />}
            {head && <circle cx={X(head[0])} cy={Y(head[1])} r={3.6} fill={s.color} stroke="var(--c-panel)" strokeWidth={1.2} />}
            {s.end && last && (
              <text x={Math.min(X(last[0]), W - R) - 3} y={Math.max(T + 7, Y(last[1]) - 5)} fontSize={8.5} fontWeight={600} textAnchor="end" fill={s.color}>
                {s.end}
                {last[1] > ymax ? ' ↑ off scale' : ''}
              </text>
            )}
          </g>
        )
      })}
      {marks.map((m, i) => (
        <g key={i}>
          <circle cx={X(m.x)} cy={Y(m.y)} r={4} fill={m.hollow ? 'var(--c-panel)' : m.color} stroke={m.color} strokeWidth={1.4} data-tip={m.tip} />
          {m.label && (
            <text x={X(m.x) + 6} y={Y(m.y) - 6} fontSize={8.5} fontWeight={600} fill={m.color}>
              {m.label}
            </text>
          )}
        </g>
      ))}
      {note && (
        <text x={(L + W - R) / 2} y={(T + H - B) / 2 - 14} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
          {note}
        </text>
      )}
    </svg>
  )
}

interface CircSpec {
  c: Circle
  color: string
  dash?: boolean
  w?: number
  opacity?: number
  name: string
}
interface EnvSpec {
  env: Envelope
  color: string
  dash?: string
}

function MohrChart({ circles, envs, smax, tmax, hint }: { circles: CircSpec[]; envs: EnvSpec[]; smax: number; tmax: number; hint?: string }) {
  const W = 560,
    H = 236,
    L = 36,
    R = 12,
    T = 10,
    B = 24
  const k = Math.min((W - L - R) / smax, (H - T - B) / tmax)
  const X = (s: number) => L + s * k
  const Y = (t: number) => H - B - t * k
  const sR = (W - L - R) / k,
    tT = (H - T - B) / k
  const step = niceStep(sR, 8)
  const ticks: number[] = []
  for (let v = step; v <= sR; v += step) ticks.push(v)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Mohr circles" {...tipAxes({ X, Y, x: 'σ', xUnit: ' kPa', y: 'τ', yUnit: ' kPa' })}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={X(v)} x2={X(v)} y1={Y(0)} y2={Y(0) + 3} stroke="var(--c-mute)" data-nocurve />
          <text x={X(v)} y={Y(0) + 13} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
            {v}
          </text>
        </g>
      ))}
      <line x1={L} x2={W - R} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" data-nocurve />
      <line x1={L} x2={L} y1={T} y2={Y(0)} stroke="var(--c-ink)" data-nocurve />
      <text x={W - R} y={H - 2} fontSize={9.5} textAnchor="end" fill="var(--c-mute)">
        σ, σ′ (kPa)
      </text>
      <text x={L + 4} y={T + 8} fontSize={9.5} fill="var(--c-mute)">
        τ
      </text>
      {envs.map((e, i) => {
        const tp = Math.tan((e.env.phi * Math.PI) / 180)
        const sEnd = tp > 1e-9 ? Math.min(sR, (tT - e.env.c) / tp) : sR
        return <line key={i} x1={X(0)} y1={Y(e.env.c)} x2={X(sEnd)} y2={Y(e.env.c + sEnd * tp)} stroke={e.color} strokeWidth={1.6} strokeDasharray={e.dash} data-name="envelope" />
      })}
      {circles.map((c, i) => (
        <path
          key={i}
          d={`M${X(c.c.C - c.c.R)},${Y(0)} A${c.c.R * k},${c.c.R * k} 0 0 1 ${X(c.c.C + c.c.R)},${Y(0)}`}
          fill="none"
          stroke={c.color}
          strokeWidth={c.w ?? 1.5}
          strokeDasharray={c.dash ? '5 3' : undefined}
          opacity={c.opacity ?? 1}
          data-name={c.name}
        />
      ))}
      {hint && (
        <text x={W - R - 4} y={T + 10} fontSize={9.5} textAnchor="end" fill="var(--c-mute)">
          {hint}
        </text>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- apparatus

function Valve({ x, y, open }: { x: number; y: number; open: boolean }) {
  const c = open ? 'var(--c-good)' : 'var(--c-bad)'
  return (
    <g>
      <path d={`M${x - 8},${y - 5} l8,5 l-8,5 Z M${x + 8},${y - 5} l-8,5 l8,5 Z`} fill={c} />
      <text x={x} y={y + 17} fontSize={8} fontWeight={600} textAnchor="middle" fill={c}>
        {open ? 'valve open' : 'valve closed'}
      </text>
    </g>
  )
}

function Gauge({ x, y, v, max, label }: { x: number; y: number; v: number; max: number; label: string }) {
  const a = Math.max(-1, Math.min(1, v / max)) * 2.1
  return (
    <g>
      <circle cx={x} cy={y} r={15} fill="var(--c-panel)" stroke="var(--c-ink)" />
      <path d={`M${x - 11},${y + 6} A12.5,12.5 0 1 1 ${x + 11},${y + 6}`} fill="none" stroke="var(--c-line)" strokeWidth={2} />
      <line x1={x} y1={y - 15} x2={x} y2={y - 11} stroke="var(--c-mute)" />
      <line x1={x} y1={y} x2={x + 11 * Math.sin(a)} y2={y - 11 * Math.cos(a)} stroke={v < -0.5 ? 'var(--c-shear)' : C_WATER} strokeWidth={1.8} strokeLinecap="round" />
      <circle cx={x} cy={y} r={1.8} fill="var(--c-ink)" />
      <text x={x} y={y + 27} fontSize={8} textAnchor="middle" fill="var(--c-mute)">
        {label}
      </text>
    </g>
  )
}

/** soil body texture: grains for sand, flat flecks for clay, laid out in the unit square and mapped by the caller */
function Texture({ clay, map, rows, cols, r }: { clay: boolean; map: (a: number, b: number) => [number, number]; rows: number; cols: number; r: number }) {
  const out: ReactNode[] = []
  for (let q = 0; q < rows; q++)
    for (let i = 0; i < cols; i++) {
      const [x, y] = map((i + 0.5 + (q % 2 ? 0.25 : -0.25) * (clay ? 1 : 0.6)) / cols, (q + 0.5) / rows)
      out.push(clay ? <line key={q + '-' + i} x1={x - r} x2={x + r} y1={y} y2={y} stroke="var(--c-ink)" strokeWidth={0.8} opacity={0.45} /> : <circle key={q + '-' + i} cx={x} cy={y} r={r} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth={0.6} opacity={0.8} />)
    }
  return <>{out}</>
}

interface RigProps {
  soil: SimSoil
  test: SimTest
  stage: 0 | 1 | 2
  f: number
  t: number
  sig: number
}

/** pressures before shearing: how much of σ has been applied, how much has consolidated, and the pore pressure */
function preShear(test: SimTest, stage: 0 | 1 | 2, f: number, sig: number) {
  const applied = stage === 0 ? f : 1
  const cons = test === 'uu' ? 0 : stage === 0 ? 0 : stage === 1 ? rise(f, 4) : 1
  const u = test === 'uu' ? applied * sig - SIGMA0 : applied * sig * (1 - cons)
  return { applied, cons, u }
}

function TriaxialRig({ soil, test, stage, f, t, sig, cur }: RigProps & { cur: TxState }) {
  const m = SIM_SOILS[soil]
  const { applied, cons } = preShear(test, stage, f, sig)
  const u01 = stage === 2 ? f : 0
  const eps = cur.eps / 100,
    ev = cur.ev / 100
  // specimen geometry
  const cx = 140,
    base = 241,
    H0 = 112,
    W0 = 40
  const sh = 1 - 0.015 * cons
  const Hs = H0 * sh * (1 - eps)
  const top = base - Hs
  const Wend = W0 * sh
  const Wavg = Wend * Math.sqrt((1 + ev) / (1 - eps))
  const b = (1.5 * (Wavg - Wend)) / 2 // extra half-width at mid-height (barrel)
  const x0 = cx - Wend / 2,
    x1 = cx + Wend / 2,
    mid = (top + base) / 2
  const body = `M${x0},${top} Q${x0 - 2 * b},${mid} ${x0},${base} L${x1},${base} Q${x1 + 2 * b},${mid} ${x1},${top} Z`
  const map = (a: number, bb: number): [number, number] => {
    const y = top + bb * Hs
    const half = Wend / 2 + b * (1 - (2 * bb - 1) ** 2)
    return [cx + (2 * a - 1) * half * 0.86, y]
  }
  const drainOpen = test !== 'uu' && (stage === 1 || (stage === 2 && test === 'cd'))
  // water moving along the drain: out while consolidating or contracting, in while dilating
  const rate = stage === 1 ? -1 : stage === 2 && test === 'cd' ? txState(soil, test, sig, u01 + 0.01).ev - txState(soil, test, sig, Math.max(0, u01 - 0.01)).ev : 0
  const flowing = drainOpen && Math.abs(rate) > 0.02 && !(stage === 1 && f > 0.97)
  const level = 236 - 14 * cons + 5 * cur.ev
  const duTint = cur.du >= 0 ? 'var(--c-load)' : 'var(--c-shear)'
  const failDev = txFailure(soil, test, sig).dev
  const theta = 45 + m.peak.phi / 2
  const lp = Wend / 2 / Math.cos((theta * Math.PI) / 180)
  const planeO = m.dilative && stage === 2 ? Math.max(0, Math.min(1, (u01 - failAt(soil, test) * 0.8) / 0.12)) : 0
  const aLen = 6 + 16 * (cur.s3 / 400)
  return (
    <svg viewBox="0 0 300 322" className="w-full max-w-[360px] mx-auto" role="img" aria-label="Triaxial cell">
      {/* cell */}
      <rect x={72} y={66} width={136} height={190} fill={C_WATER} opacity={0.06 + 0.2 * applied * (sig / 400)} />
      <rect x={70} y={66} width={2.5} height={190} fill="var(--c-mute)" />
      <rect x={207.5} y={66} width={2.5} height={190} fill="var(--c-mute)" />
      <rect x={60} y={57} width={160} height={9} rx={2} fill="var(--c-steel)" />
      <rect x={52} y={256} width={176} height={10} rx={2} fill="var(--c-steel)" />
      <text x={214} y={92} fontSize={8.5} fill={C_WATER}>
        cell water
      </text>
      <text x={214} y={103} fontSize={9} fontWeight={700} fill={C_WATER}>
        σ3 = {f0(cur.s3)}
      </text>
      {/* confining pressure arrows */}
      {[0.22, 0.5, 0.78].map((q) => {
        const y = top + q * Hs
        const hw = Wend / 2 + b * (1 - (2 * q - 1) ** 2)
        return (
          <g key={q} opacity={0.25 + 0.75 * applied} stroke={C_WATER} strokeWidth={1.4} fill="none">
            <path d={`M${cx - hw - 6 - aLen},${y} L${cx - hw - 5},${y} m-4,-3 l4,3 l-4,3`} />
            <path d={`M${cx + hw + 6 + aLen},${y} L${cx + hw + 5},${y} m4,-3 l-4,3 l4,3`} />
          </g>
        )
      })}
      {/* ram, top cap, pedestal, porous stones */}
      <rect x={137} y={30} width={6} height={top - 6 - 30} fill="var(--c-steel)" />
      <rect x={x0 - 3} y={top - 6} width={Wend + 6} height={6} fill="var(--c-steel)" />
      <rect x={x0} y={base} width={Wend} height={5} fill="var(--c-faint)" />
      <rect x={116} y={246} width={48} height={10} fill="var(--c-steel)" />
      {stage === 2 && (
        <g>
          <path d={`M140,${28 - 6 - 18 * Math.min(1, cur.dev / (failDev || 1))} L140,27 m-4,-6 l4,6 l4,-6`} fill="none" stroke="var(--c-ink)" strokeWidth={2} />
          <text x={150} y={20} fontSize={9} fontWeight={700} fill="var(--c-ink)">
            deviator Δσd = {f0(cur.dev)}
          </text>
        </g>
      )}
      {/* specimen */}
      <path d={body} fill="var(--c-soil)" stroke="var(--c-ink)" strokeWidth={1} />
      <path d={body} fill={duTint} opacity={test === 'cd' ? 0 : Math.min(0.65, (Math.abs(cur.du) / (failDev || 1)) * 0.9)} />
      <Texture clay={m.clay} map={map} rows={6} cols={3} r={m.clay ? 4 : 3.2} />
      {planeO > 0 && (
        <g opacity={planeO}>
          <line x1={cx - lp * Math.cos((theta * Math.PI) / 180)} y1={mid + lp * Math.sin((theta * Math.PI) / 180)} x2={cx + lp * Math.cos((theta * Math.PI) / 180)} y2={mid - lp * Math.sin((theta * Math.PI) / 180)} stroke="var(--c-bad)" strokeWidth={1.8} />
          <text x={214} y={122} fontSize={8} fill="var(--c-bad)">
            shear plane
          </text>
          <text x={214} y={132} fontSize={8} fill="var(--c-bad)">
            ≈ 45 + φ′/2
          </text>
        </g>
      )}
      {/* drain line: pedestal → gauge (left) and → valve → burette (right) */}
      <path d="M140,256 L140,290 L246,290 L270,290 L270,284" fill="none" stroke={C_WATER} strokeWidth={2} opacity={0.65} />
      <path d="M140,290 L58,290" fill="none" stroke={C_WATER} strokeWidth={2} opacity={0.65} />
      <Gauge x={42} y={290} v={stage === 2 ? cur.u : preShear(test, stage, f, sig).u} max={Math.max(sig, Math.abs(txFailure(soil, test, sig).u))} label="pore pressure u" />
      <Valve x={206} y={290} open={drainOpen} />
      <rect x={266} y={150} width={8} height={134} rx={2} fill="none" stroke="var(--c-mute)" />
      <rect x={267} y={Math.min(283, Math.max(152, level))} width={6} height={Math.max(0, 284 - Math.min(283, Math.max(152, level)))} fill={C_WATER} opacity={0.75} />
      <text x={270} y={144} fontSize={8} textAnchor="middle" fill="var(--c-mute)">
        burette
      </text>
      {flowing &&
        [0, 1, 2, 3].map((i) => {
          const ph = (t * 55 + i / 4) % 1
          const q = rate < 0 ? ph : 1 - ph
          return <circle key={i} cx={146 + q * 120} cy={290} r={2.3} fill={C_WATER} />
        })}
      <text x={150} y={316} fontSize={8.5} textAnchor="middle" fill={drainOpen ? 'var(--c-good)' : 'var(--c-mute)'}>
        {!drainOpen ? 'no water can enter or leave' : !flowing ? 'drain open, no flow' : rate < 0 ? 'water squeezed out →' : '← water drawn in'}
      </text>
    </svg>
  )
}

function ShearBoxRig({ soil, test, stage, f, t, sig, tau, dH }: RigProps & { tau: number; dH: number }) {
  const m = SIM_SOILS[soil]
  const { applied, cons } = preShear(test, stage, f, sig)
  const u01 = stage === 2 ? f : 0
  const drained = effTest(soil, test) === 'cd'
  const x0 = 86,
    bw = 120,
    base = 236,
    h0 = 34
  const upper = h0 - 3 * cons + h0 * 2 * (dH / DS_H0) * 4 // height change drawn ×4
  const midY = base - h0
  const topY = midY - upper
  const s = 18 * u01
  const peak = dsPeak(soil, test, sig)
  const rate = stage === 1 ? -1 : stage === 2 && drained ? dsState(soil, test, sig, u01 + 0.01).dH - dsState(soil, test, sig, Math.max(0, u01 - 0.01)).dH : 0
  const flowing = (stage === 1 && f < 0.97) || (stage === 2 && drained && Math.abs(rate) > 0.004)
  const a = Math.max(-1.6, Math.min(1.6, (dH - 0.15 * cons) * 2.2))
  return (
    <svg viewBox="0 0 300 322" className="w-full max-w-[360px] mx-auto" role="img" aria-label="Direct shear box">
      {/* water bath */}
      <path d="M18,150 L18,262 L282,262 L282,150" fill="none" stroke="var(--c-mute)" strokeWidth={2} />
      <rect x={19} y={176} width={262} height={85} fill={C_WATER} opacity={0.12} />
      <text x={24} y={256} fontSize={8} fill={C_WATER}>
        water bath
      </text>
      {/* normal load */}
      <g opacity={0.3 + 0.7 * applied}>
        <rect x={x0 + s + bw / 2 - 26} y={40} width={52} height={14} rx={2} fill="var(--c-steel)" />
        <line x1={x0 + s + bw / 2} x2={x0 + s + bw / 2} y1={54} y2={topY - 9} stroke="var(--c-steel)" strokeWidth={3} />
        <text x={x0 + s + bw / 2} y={34} fontSize={9} fontWeight={700} textAnchor="middle" fill="var(--c-ink)">
          N → σn = {f0(applied * sig)}
        </text>
      </g>
      {/* dial gauge for the cap */}
      <line x1={x0 + s + bw - 14} x2={x0 + s + bw - 14} y1={topY - 9} y2={topY - 24} stroke="var(--c-steel)" strokeWidth={1.5} />
      <circle cx={x0 + s + bw - 14} cy={topY - 34} r={10} fill="var(--c-panel)" stroke="var(--c-ink)" />
      <line x1={x0 + s + bw - 14} y1={topY - 34} x2={x0 + s + bw - 14 + 8 * Math.sin(a)} y2={topY - 34 - 8 * Math.cos(a)} stroke={dH >= 0 ? 'var(--c-shear)' : 'var(--c-load)'} strokeWidth={1.6} />
      <text x={x0 + s + bw + 1} y={topY - 31} fontSize={8.5} fill="var(--c-mute)">
        ΔH
      </text>
      {/* loading cap + porous stones */}
      <rect x={x0 + s + 3} y={topY - 9} width={bw - 6} height={6} fill="var(--c-steel)" />
      <rect x={x0 + s + 3} y={topY - 3} width={bw - 6} height={4} fill="var(--c-faint)" />
      <rect x={x0 + 3} y={base} width={bw - 6} height={4} fill="var(--c-faint)" />
      {/* soil: upper half moves, lower half stays */}
      <rect x={x0 + s} y={topY + 1} width={bw} height={upper - 1} fill="var(--c-soil)" />
      <rect x={x0} y={midY} width={bw} height={h0} fill="var(--c-soil)" />
      <Texture clay={m.clay} map={(p, q) => [x0 + s + p * bw, topY + 1 + q * (upper - 1)]} rows={m.dilative ? 3 : 2} cols={m.dilative ? 9 : 7} r={m.clay ? 5 : m.dilative ? 4.2 : 4.6} />
      <Texture clay={m.clay} map={(p, q) => [x0 + p * bw, midY + q * h0]} rows={m.dilative ? 3 : 2} cols={m.dilative ? 9 : 7} r={m.clay ? 5 : m.dilative ? 4.2 : 4.6} />
      <path d={`M${x0 + s - 4},${midY - 1} L${x0 + s - 4},${topY - 2} M${x0 + s + bw + 4},${midY - 1} L${x0 + s + bw + 4},${topY - 2}`} stroke="var(--c-ink)" strokeWidth={4} fill="none" />
      <path d={`M${x0 - 4},${midY + 1} L${x0 - 4},${base + 6} L${x0 + bw + 4},${base + 6} L${x0 + bw + 4},${midY + 1}`} stroke="var(--c-ink)" strokeWidth={4} fill="none" />
      <line x1={x0 - 22} x2={x0 + bw + 30} y1={midY} y2={midY} stroke="var(--c-bad)" strokeDasharray="4 3" strokeWidth={1} />
      <text x={278} y={midY + 12} fontSize={8} textAnchor="end" fill="var(--c-bad)">
        forced plane
      </text>
      {/* shear force */}
      {stage === 2 && (
        <g>
          <path d={`M${x0 + s - 12 - 8 - 22 * Math.min(1, tau / (peak || 1))},${(topY + midY) / 2} L${x0 + s - 8},${(topY + midY) / 2} m-6,-4 l6,4 l-6,4`} fill="none" stroke="var(--c-ink)" strokeWidth={2} />
          <text x={22} y={(topY + midY) / 2 - 9} fontSize={8.5} fontWeight={700} fill="var(--c-ink)">
            T → τ = {f0(tau)}
          </text>
        </g>
      )}
      {/* water through the stones */}
      {flowing &&
        [0, 1, 2].map((i) => {
          const ph = (t * 55 + i / 3) % 1
          const q = rate < 0 ? ph : 1 - ph
          return (
            <g key={i} fill={C_WATER}>
              <circle cx={x0 + bw + 8 + q * 22} cy={base + 2 - q * 10} r={2.2} />
              <circle cx={x0 - 8 - q * 22} cy={base + 2 - q * 10} r={2.2} />
            </g>
          )
        })}
      <text x={150} y={282} fontSize={8.5} textAnchor="middle" fill="var(--c-mute)">
        porous stones top and bottom: there is no valve and no u gauge
      </text>
      <text x={150} y={298} fontSize={9} fontWeight={600} textAnchor="middle" fill={stage !== 2 ? 'var(--c-mute)' : drained ? 'var(--c-good)' : 'var(--c-bad)'}>
        {stage === 0 ? 'placing the normal load' : stage === 1 ? 'consolidating: water leaves, the cap settles' : drained ? '⏱ slow shear: water has time to move (drained)' : '⚡ quick shear: no time to drain (undrained)'}
      </text>
      <text x={150} y={312} fontSize={7.5} textAnchor="middle" fill="var(--c-faint)">
        height change drawn ×4
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- words

function Stages({ rig, test, stage }: { rig: Rig; test: SimTest; stage: number }) {
  const items =
    rig === 'tx'
      ? [
          { t: '1 · Cell pressure σ3', d: 'all round, valve closed' },
          { t: '2 · Consolidation', d: test === 'uu' ? 'skipped → Unconsolidated' : 'valve open → Consolidated', skip: test === 'uu' },
          { t: '3 · Shear (add Δσd)', d: test === 'cd' ? 'valve open, slow → Drained' : 'valve closed → Undrained' },
        ]
      : [
          { t: '1 · Normal load σn', d: 'on the cap' },
          { t: '2 · Consolidation', d: test === 'uu' ? 'skipped → Unconsolidated' : 'wait for settlement → Consolidated', skip: test === 'uu' },
          { t: '3 · Shear (push T)', d: test === 'cd' ? 'slowly → Drained' : 'quickly → Undrained' },
        ]
  return (
    <div className="grid grid-cols-3 gap-1.5 text-xs">
      {items.map((it, i) => (
        <div key={i} className={'rounded-lg border px-2 py-1 ' + (i === stage ? 'border-accent bg-accent/10' : 'border-line') + (it.skip ? ' opacity-50' : '')}>
          <div className={'font-bold ' + (it.skip ? 'line-through' : '')}>{it.t}</div>
          <div className="text-mute">{it.d}</div>
        </div>
      ))}
    </div>
  )
}

function caption(rig: Rig, test: SimTest, soil: SimSoil, stage: number, u01: number): ReactNode {
  const m = SIM_SOILS[soil]
  const name = <b style={{ color: soilColor(soil) }}>{m.name}</b>
  if (rig === 'tx') {
    if (stage === 0)
      return test === 'uu' ? (
        <>
          The specimen comes from the field still holding σ′ = {SIGMA0} kPa, by suction (u = −{SIGMA0}). The cell pressure goes on with the valve <b>closed</b>. The clay is saturated (B = 1), so the water takes all of it: u rises by σ3 and <b>σ′ stays {SIGMA0} kPa</b>. Whatever σ3 you pick, the soil skeleton never feels it.
        </>
      ) : (
        <>
          Cell pressure σ3 is applied all round. At this instant the <b style={{ color: C_WATER }}>water</b> carries it (u = σ3, σ′ ≈ 0): nothing has drained yet.
        </>
      )
    if (stage === 1)
      return (
        <>
          <b>Consolidation</b> (the “C”). The valve is open: water drains to the burette, u falls to zero and the pressure passes to the soil skeleton until σ′3 = σ3. The specimen gets a little smaller. Shearing waits until the flow stops.
        </>
      )
    if (test === 'uu')
      return (
        <>
          <b>Undrained shear</b>, valve closed, done in 10 to 20 minutes. No water moves, so the volume stays constant and {name} only changes shape. Its effective stress was {SIGMA0} kPa before shearing whatever σ3 was, so the deviator at failure is the same every time: all the total circles have one size, <b>φu = 0 and cu = Δσf/2</b>.
        </>
      )
    if (test === 'cu')
      return m.dilative ? (
        <>
          <b>Undrained shear</b>, valve closed, u measured at the base. {name} compresses a little first (small +Δu), then wants to <b>dilate</b>; no water can come in, so the pore water is pulled: Δu turns <b>negative</b> and σ′3 = σ3 − u rises above σ3. The dashed effective circle ends up to the <b>right</b> of the total one. (A back pressure keeps the water from cavitating.)
        </>
      ) : (
        <>
          <b>Undrained shear</b>, valve closed, u measured at the base. {name} wants to <b>contract</b> but no water can leave, so the pore pressure climbs. σ′3 = σ3 − u falls as the test goes on: the dashed effective circle slides to the <b>left</b> of the total one, with the same diameter.
        </>
      )
    return m.dilative ? (
      u01 < failAt(soil, test) ? (
        <>
          <b>Drained shear</b>, valve open, loaded slowly enough (days for clay) that u stays zero, so every stress is effective. {name} compresses slightly, then <b>dilates</b> and draws water in from the burette. The deviator is climbing to a <b>peak</b>.
        </>
      ) : (
        <>
          Past the <b>peak</b>: it came where the specimen was dilating fastest. A shear plane forms at about 45 + φ′/2 and the deviator drops to the <b>ultimate</b> (critical-state) value, where the volume stops changing.
        </>
      )
    ) : (
      <>
        <b>Drained shear</b>, valve open, loaded slowly enough (days for clay) that u stays zero, so every stress is effective. {name} <b>contracts</b>: water is squeezed out into the burette and the specimen bulges. The deviator climbs to its ultimate value with <b>no peak</b>.
      </>
    )
  }
  if (stage === 0)
    return (
      <>
        A normal load N is hung on the cap: σn = N/A. {test === 'uu' && <>Shearing starts at once, before the clay can consolidate under it.</>} The box is split at mid-height, so the failure plane is <b>forced</b> to be horizontal.
      </>
    )
  if (stage === 1)
    return (
      <>
        <b>Consolidation</b> under σn: water leaves through the porous stones and the cap settles (the vertical dial gauge shows it). The box has no drainage valve and no pore-pressure gauge.
      </>
    )
  if (effTest(soil, test) !== 'cd')
    return (
      <>
        <b>Quick shear.</b> The box cannot be sealed, so “undrained” only means sheared too fast for water to move. Pore pressure builds up but <b>cannot be measured</b>, so only total-stress values come out, and the height stays constant. {test === 'uu' ? <>τf is the same at every σn: a flat line, <b>cu</b>.</> : <>τf rises with σn: total <b>c, φ</b>.</>}
      </>
    )
  return m.dilative ? (
    u01 < failAt(soil, test) ? (
      <>
        <b>Slow (drained) shear.</b> {name} grains are interlocked and must ride up over each other: after a slight compression the cap <b>rises</b> (ΔH positive) and water is drawn in. τ is climbing to a <b>peak</b>.
      </>
    ) : (
      <>
        Past the <b>peak</b>: it came where the cap was rising fastest. τ falls to the <b>ultimate</b> value and the height stops changing (critical state). Plot both: peak points give the peak line, ultimate points the ultimate line.
      </>
    )
  ) : (
    <>
      <b>Slow (drained) shear.</b> {name} grains roll into the voids: the cap <b>settles</b> (ΔH negative), water is squeezed out, and τ rises to its ultimate value with <b>no peak</b>.
    </>
  )
}

const GIVES: Record<Rig, Record<SimTest, string>> = {
  tx: {
    uu: 'Gives cu with φu = 0 (total stress only). Field case: end of construction on saturated clay, loaded faster than it can drain (embankment or footing built quickly).',
    cu: 'Gives c, φ from the total circles and, because u is measured, c′, φ′ from the effective circles, plus Af = uf/Δσf. Field case: soil already consolidated, then loaded fast (staged construction, rapid drawdown).',
    cd: 'Gives c′, φ′ directly (u = 0, so total = effective). Field case: long-term stability, or any loading slow enough to drain; sand is always in this case.',
  },
  ds: {
    uu: 'Quick test: gives cu only. Cheap and fast, but drainage is not really controlled.',
    cu: 'Consolidated-quick test: gives total c, φ only, because u cannot be measured in the box.',
    cd: 'Slow test: gives c′, φ′ (peak and ultimate). The usual shear-box test, and the one in the past papers.',
  },
}

// ---------------------------------------------------------------- the bench

const START: Cfg = { rig: 'tx', test: 'cu', soil: 'nc', sig: 200, compare: true }
const sortNum = (a: number[]) => [...a].sort((x, y) => x - y)

export function TestBench() {
  const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [cfg, setCfg] = useState<Cfg>(START)
  const [kept, setKept] = useState<number[]>(reduced ? [START.sig] : [])
  const [t, setT] = useState(reduced ? 1 : 0)
  const [play, setPlay] = useState(!reduced)
  const [visible, setVisible] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const live = useRef({ t: reduced ? 1 : 0, sig: START.sig })
  live.current.sig = cfg.sig
  const { rig, soil, sig, compare } = cfg
  const test = effTest(soil, cfg.test)
  const m = SIM_SOILS[soil]

  const go = (v: number) => {
    live.current.t = v
    setT(v)
    if (v >= 1) {
      setPlay(false)
      const s = live.current.sig
      setKept((k) => (k.includes(s) ? k : sortNum([...k, s])))
    }
  }
  const change = (o: Partial<Cfg>) => {
    const n = { ...cfg, ...o }
    if (o.soil && !SIM_SOILS[n.soil].clay) n.test = 'cd'
    if (o.test && o.test !== 'cd' && !SIM_SOILS[n.soil].clay) n.soil = n.soil === 'dense' ? 'oc' : 'nc'
    if (o.rig && o.rig !== cfg.rig) n.sig = o.rig === 'tx' ? 200 : 100
    setCfg(n)
    const same = n.rig === cfg.rig && n.test === cfg.test && n.soil === cfg.soil
    const k = same ? kept : []
    live.current = { t: reduced ? 1 : 0, sig: n.sig }
    setKept(reduced && !k.includes(n.sig) ? sortNum([...k, n.sig]) : k)
    setT(live.current.t)
    setPlay(!reduced)
  }

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!play || !visible) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const v = Math.min(1, live.current.t + dt / RUN_S)
      go(v)
      if (v < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, visible])

  const st = stageOf(t, test)
  const u01 = st.stage === 2 ? st.f : 0
  const fu = failAt(soil, test)
  const partner = m.partner
  const col = soilColor(soil)
  const xmax = rig === 'tx' ? EPS_MAX : DISP_MAX
  const sigs = useMemo(() => sortNum([...new Set([...kept, sig])]), [kept, sig])

  // curves for the two strain charts
  const data = useMemo(() => {
    const us = Array.from({ length: SAMPLES + 1 }, (_, i) => i / SAMPLES)
    const run = (s: SimSoil, v: number) =>
      us.map((u) => {
        if (rig === 'tx') {
          const q = txState(s, test, v, u)
          return { x: q.eps, a: q.dev, b: test === 'cd' ? q.ev : q.du }
        }
        const q = dsState(s, test, v, u)
        return { x: q.disp, a: q.tau, b: q.dH }
      })
    const cur = run(soil, sig)
    const others = kept.filter((v) => v !== sig).map((v) => ({ v, pts: run(soil, v) }))
    const cmp = compare ? run(partner, sig) : null
    const all = [cur, ...others.map((o) => o.pts), ...(cmp ? [cmp] : [])].flat()
    // keep the specimen being tested readable: a much stronger comparison soil runs off the top instead of squashing it
    const own = Math.max(1, ...[cur, ...others.map((o) => o.pts)].flat().map((p) => p.a))
    const top = Math.max(1, ...all.map((p) => p.a))
    const aMax = top > 2.2 * own ? own * 1.7 : top * 1.14
    const bLo = Math.min(0, ...all.map((p) => p.b)),
      bHi = Math.max(0, ...all.map((p) => p.b))
    const pad = Math.max(0.12 * (bHi - bLo), rig === 'ds' ? 0.1 : test === 'cd' ? 0.5 : 5)
    return { cur, others, cmp, aMax, bMin: bLo - pad, bMax: bHi + pad }
  }, [rig, soil, test, sig, kept, compare, partner])

  const xNow = u01 * xmax
  type P = { x: number; a: number; b: number }
  const sA = (pts: P[]): [number, number][] => pts.map((p) => [p.x, p.a])
  const sB = (pts: P[]): [number, number][] => pts.map((p) => [p.x, p.b])
  const tagS = rig === 'tx' ? 'σ3' : 'σn'
  const seriesFor = (pick: typeof sA): Series[] => [
    ...(data.cmp ? [{ name: SIM_SOILS[partner].name, pts: pick(data.cmp), color: soilColor(partner), dash: true, w: 1.4, opacity: 0.8, end: SIM_SOILS[partner].name }] : []),
    ...data.others.map((o) => ({ name: `${m.name}, ${tagS} = ${o.v}`, pts: pick(o.pts), color: col, w: 1.3, opacity: 0.5, end: `${tagS} ${o.v}` })),
    { name: `${m.name}, ${tagS} = ${sig}`, pts: pick(data.cur), color: col, w: 2.6, upto: st.stage === 2 ? xNow : 0 },
  ]

  // readings now
  const tx = txState(soil, test, sig, u01)
  const ds = dsState(soil, test, sig, u01)
  const pre = preShear(test, st.stage, st.f, sig)
  const s3Now = st.stage === 2 ? tx.s3 : pre.applied * sig
  const uNow = st.stage === 2 ? tx.u : pre.u
  const failTx = txFailure(soil, test, sig)
  const failed = st.stage === 2 && u01 >= fu - 1e-9
  const xFail = fu * xmax

  const marksA: Mark[] = failed ? [{ x: xFail, y: rig === 'tx' ? failTx.dev : dsPeak(soil, test, sig), color: 'var(--c-bad)', label: m.dilative && test === 'cd' ? 'peak = failure' : 'failure', tip: rig === 'tx' ? `failure: Δσf = ${f1(failTx.dev)} kPa at ε = ${f1(xFail)} %` : `failure: τf = ${f1(dsPeak(soil, test, sig))} kPa` }] : []
  const marksB: Mark[] = failed && rig === 'tx' && test !== 'cd' ? [{ x: xFail, y: failTx.du, color: 'var(--c-bad)', label: `uf → Af = ${fmt(failTx.du / failTx.dev, 2)}`, tip: `Δuf = ${f1(failTx.du)} kPa, Af = Δuf/Δσf = ${fmt(failTx.du / failTx.dev, 2)}` }] : []

  // Mohr circles / τ–σ points
  const fails = kept.map((v) => ({ v, f: txFailure(soil, test, v), c: txCircles(txFailure(soil, test, v)) }))
  const ults = kept.map((v) => txCircles(txState(soil, test, v, 1)).eff)
  const showEff = test !== 'cd'
  const fitT = kept.length >= 2 ? fitCircles(fails.map((x) => x.c.total)) : null
  const fitE = kept.length >= 2 && test === 'cu' ? fitCircles(fails.map((x) => x.c.eff)) : null
  const fitU = kept.length >= 2 && test === 'cd' && m.dilative ? fitCircles(ults) : null
  const ext = sigs.map((v) => txFailure(soil, test, v))
  const smax = Math.max(...ext.map((e) => Math.max(e.s1, e.s1p))) * 1.06
  const tmax = Math.max(...ext.map((e) => e.dev / 2)) * 1.25
  const liveC = txCircles(st.stage === 2 ? tx : { ...tx, s1: s3Now, s3: s3Now, s1p: s3Now - uNow, s3p: s3Now - uNow })
  const circles: CircSpec[] = [
    ...fails.flatMap((x): CircSpec[] => [
      { c: x.c.total, color: C_TOTAL, name: test === 'cd' ? `σ3 = ${x.v}: effective = total` : `σ3 = ${x.v}: total`, opacity: 0.9 },
      ...(showEff ? [{ c: x.c.eff, color: C_EFF, dash: true, name: `σ3 = ${x.v}: effective`, opacity: 0.9 }] : []),
    ]),
    ...(st.stage === 2 && t < 1 ? [{ c: liveC.total, color: C_TOTAL, w: 2.6, name: 'now: total' }, ...(showEff ? [{ c: liveC.eff, color: C_EFF, w: 2.6, dash: true, name: 'now: effective' }] : [])] : []),
  ]
  const envs: EnvSpec[] = [...(fitT ? [{ env: fitT, color: C_TOTAL }] : []), ...(fitE ? [{ env: fitE, color: C_EFF, dash: '6 3' }] : []), ...(fitU ? [{ env: fitU, color: 'var(--c-mute)', dash: '2 3' }] : [])]

  const dsPts = kept.map((v) => ({ v, p: dsPeak(soil, test, v), u: dsUltimate(soil, test, v) }))
  const dsFitP = dsPts.length >= 2 ? fitLine(dsPts.map((d) => d.v), dsPts.map((d) => d.p)) : null
  const dsFitU = dsPts.length >= 2 && test === 'cd' && m.dilative ? fitLine(dsPts.map((d) => d.v), dsPts.map((d) => d.u)) : null
  const dsYmax = Math.max(...sigs.map((v) => dsPeak(soil, test, v)), 20) * 1.2
  const line = (fit: { a: number; b: number }): [number, number][] => [
    [0, fit.a],
    [330, fit.a + fit.b * 330],
  ]

  const prime = test === 'cd' ? '′' : ''
  const stageName = ['applying ' + (rig === 'tx' ? 'σ3' : 'σn'), 'consolidating', rig === 'tx' ? `shearing, ε = ${f1(tx.eps)} %` : `shearing, δ = ${f1(ds.disp)} mm`][st.stage]
  const KV = ({ k, v, c }: { k: ReactNode; v: string; c?: string }) => (
    <div className="flex items-baseline justify-between gap-2 rounded-md border border-line px-2 py-0.5">
      <span className="text-mute">{k}</span>
      <span className="num font-semibold" style={{ color: c }}>
        {v}
      </span>
    </div>
  )

  return (
    <div ref={ref} className="space-y-3">
      {/* what to test */}
      <div className="flex flex-wrap items-center gap-2">
        <Seg value={rig} onChange={(v) => change({ rig: v })} items={[{ v: 'tx', label: 'Triaxial cell' }, { v: 'ds', label: 'Direct shear box' }]} />
        <Seg value={test} onChange={(v) => change({ test: v })} items={[{ v: 'uu', label: 'UU' }, { v: 'cu', label: 'CU' }, { v: 'cd', label: 'CD' }]} />
        <Seg
          value={soil}
          onChange={(v) => change({ soil: v })}
          items={[
            { v: 'nc', label: 'NC clay' },
            { v: 'oc', label: 'Heavily OC clay' },
            { v: 'loose', label: 'Loose sand' },
            { v: 'dense', label: 'Dense sand' },
          ]}
        />
      </div>
      <div className="grid cq-md:grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-center">
        <Slider label={rig === 'tx' ? 'Cell pressure σ3' : 'Normal stress σn'} value={sig} min={rig === 'tx' ? 100 : 50} max={rig === 'tx' ? 400 : 300} step={50} onChange={(v) => change({ sig: v })} unit=" kPa" />
        <label className="flex items-center gap-1.5 text-xs text-mute">
          <input type="checkbox" checked={compare} onChange={(e) => change({ compare: e.target.checked })} className="accent-[var(--c-accent)]" />
          sketch <b style={{ color: soilColor(partner) }}>{SIM_SOILS[partner].name.toLowerCase()}</b> too (dashed)
        </label>
      </div>
      {!m.clay && <div className="text-xs text-mute">Sand drains almost at once, so a test on sand is always drained: UU and CU are for clay. Pick UU or CU and the bench switches to the matching clay.</div>}

      <Stages rig={rig} test={test} stage={st.stage} />

      <div className="grid gap-3 cq-lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] items-start">
        {/* apparatus and its readings */}
        <div className="rounded-xl border border-line bg-bg/50 p-2">
          {rig === 'tx' ? <TriaxialRig soil={soil} test={test} stage={st.stage} f={st.f} t={t} sig={sig} cur={tx} /> : <ShearBoxRig soil={soil} test={test} stage={st.stage} f={st.f} t={t} sig={sig} tau={st.stage === 2 ? ds.tau : 0} dH={st.stage === 2 ? ds.dH : 0} />}
          {rig === 'tx' ? (
            <div className="grid grid-cols-2 gap-1 text-xs mt-1">
              <KV k="σ3" v={f0(s3Now)} c={C_WATER} />
              <KV k="deviator Δσd" v={f0(st.stage === 2 ? tx.dev : 0)} />
              <KV k="σ1 = σ3 + Δσd" v={f0(st.stage === 2 ? tx.s1 : s3Now)} c={C_TOTAL} />
              <KV k="pore pressure u" v={f0(uNow)} c={C_WATER} />
              <KV k="σ′3 = σ3 − u" v={f0(s3Now - uNow)} c={C_EFF} />
              <KV k="σ′1 = σ1 − u" v={f0((st.stage === 2 ? tx.s1 : s3Now) - uNow)} c={C_EFF} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 text-xs mt-1">
              <KV k="σn = N/A" v={f0(pre.applied * sig)} />
              <KV k="τ = T/A" v={f0(st.stage === 2 ? ds.tau : 0)} c={col} />
              <KV k="displacement δ" v={f1(st.stage === 2 ? ds.disp : 0) + ' mm'} />
              <KV k="height change ΔH" v={fmt(st.stage === 2 ? ds.dH : -0.15 * pre.cons, 2) + ' mm'} />
            </div>
          )}
          <div className="text-[10px] text-faint mt-1 text-right">stresses in kPa</div>
        </div>

        {/* charts */}
        <div className="grid grid-cols-1 cq-sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-line bg-bg/50 p-1.5">
            {rig === 'tx' ? (
              <XYChart title="Deviator stress vs axial strain" xl="axial strain ε (%)" yl="σ1 − σ3 (kPa)" xn="ε" yn="Δσd" xUnit=" %" yUnit=" kPa" xmax={xmax} ymin={0} ymax={data.aMax} series={seriesFor(sA)} marks={marksA} />
            ) : (
              <XYChart title="Shear stress vs shear displacement" xl="shear displacement δ (mm)" yl="τ (kPa)" xn="δ" yn="τ" xUnit=" mm" yUnit=" kPa" xmax={xmax} ymin={0} ymax={data.aMax} series={seriesFor(sA)} marks={marksA} />
            )}
          </div>
          <div className="rounded-xl border border-line bg-bg/50 p-1.5">
            {rig === 'tx' && test !== 'cd' && <XYChart title="Pore pressure change vs axial strain" xl="axial strain ε (%)" yl="Δu (kPa)" xn="ε" yn="Δu" xUnit=" %" yUnit=" kPa" xmax={xmax} ymin={data.bMin} ymax={data.bMax} series={seriesFor(sB)} marks={marksB} />}
            {rig === 'tx' && test === 'cd' && <XYChart title="Volume change vs axial strain (+ = expansion)" xl="axial strain ε (%)" yl="εv (%)" xn="ε" yn="εv" xUnit=" %" yUnit=" %" xmax={xmax} ymin={data.bMin} ymax={data.bMax} series={seriesFor(sB)} />}
            {rig === 'ds' && <XYChart title="Height change vs displacement (+ = expansion)" xl="shear displacement δ (mm)" yl="ΔH (mm)" xn="δ" yn="ΔH" xUnit=" mm" yUnit=" mm" xmax={xmax} ymin={test === 'cd' ? data.bMin : -0.5} ymax={test === 'cd' ? data.bMax : 0.5} series={seriesFor(sB)} note={test === 'cd' ? undefined : 'quick test: no drainage, so no height change (and u is not measured)'} />}
          </div>
          <div className="rounded-xl border border-line bg-bg/50 p-1.5 cq-sm:col-span-2">
            {rig === 'tx' ? (
              <>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-1 text-[11px]">
                  <b className="text-xs">Mohr circles at failure</b>
                  <span style={{ color: C_TOTAL }}>━ total{test === 'cd' ? ' = effective (u = 0)' : ''}</span>
                  {showEff && <span style={{ color: C_EFF }}>╌ effective (shifted by u)</span>}
                  {fitU && <span className="text-mute">┄ ultimate</span>}
                </div>
                <MohrChart circles={circles} envs={envs} smax={smax} tmax={tmax} hint={kept.length < 2 ? `run a specimen at another σ3 to draw the envelope (${kept.length}/2)` : undefined} />
                <div className="px-1 text-xs space-y-0.5">
                  {fitT && test === 'uu' && (
                    <div>
                      <b style={{ color: C_TOTAL }}>φu = {f1(Math.abs(fitT.phi))}°, cu = {f1(fitT.c)} kPa</b>: every total circle has the same diameter. The effective circles all fall on one circle, so UU cannot give c′ and φ′.
                    </div>
                  )}
                  {fitT && test !== 'uu' && (
                    <div>
                      <b style={{ color: C_TOTAL }}>
                        c{prime} = {f1(fitT.c)} kPa, φ{prime} = {f1(fitT.phi)}°
                      </b>{' '}
                      {test === 'cd' ? '(effective: u = 0 throughout)' : '(total stress)'}
                    </div>
                  )}
                  {fitE && (
                    <div>
                      <b style={{ color: C_EFF }}>
                        c′ = {f1(fitE.c)} kPa, φ′ = {f1(fitE.phi)}°
                      </b>{' '}
                      (effective: each circle moved {m.dilative ? 'right, because uf is negative' : 'left by its uf'})
                    </div>
                  )}
                  {fitU && (
                    <div className="text-mute">
                      At large strain (ultimate): c′ = {f1(Math.abs(fitU.c))} kPa, φ′ = {f1(fitU.phi)}°
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-x-3 px-1 text-[11px]">
                  <b className="text-xs">Shear strength vs normal stress</b>
                  <span style={{ color: col }}>● peak τf</span>
                  {test === 'cd' && m.dilative && <span className="text-mute">○ ultimate</span>}
                </div>
                <XYChart
                  wide
                  title=""
                  xl="normal stress σn (kPa)"
                  yl="τ (kPa)"
                  xn="σn"
                  yn="τ"
                  xUnit=" kPa"
                  yUnit=" kPa"
                  xmax={330}
                  ymin={0}
                  ymax={dsYmax}
                  series={[
                    ...(dsFitP ? [{ name: 'peak line', pts: line(dsFitP), color: col, w: 1.6 }] : []),
                    ...(dsFitU ? [{ name: 'ultimate line', pts: line(dsFitU), color: 'var(--c-mute)', w: 1.3, dash: true }] : []),
                    ...(st.stage === 2 && t < 1 ? [{ name: 'this specimen', pts: [[sig, 0], [sig, ds.tau]] as [number, number][], color: col, w: 1.2, opacity: 0.6 }] : []),
                  ]}
                  marks={[
                    ...(st.stage === 2 && t < 1 ? [{ x: sig, y: ds.tau, color: col, hollow: true, label: 'now', tip: `now: σn = ${sig}, τ = ${f1(ds.tau)} kPa` }] : []),
                    ...dsPts.map((d) => ({ x: d.v, y: d.p, color: col, tip: `σn = ${d.v}, peak τf = ${f1(d.p)} kPa` })),
                    ...(test === 'cd' && m.dilative ? dsPts.map((d) => ({ x: d.v, y: d.u, color: 'var(--c-mute)', hollow: true, tip: `σn = ${d.v}, ultimate τ = ${f1(d.u)} kPa` })) : []),
                  ]}
                  note={kept.length < 2 ? `run a specimen at another σn to draw the line (${kept.length}/2)` : undefined}
                />
                <div className="px-1 text-xs space-y-0.5">
                  {dsFitP && (
                    <div>
                      <b style={{ color: col }}>
                        {test === 'uu' ? `cu = ${f1(dsFitP.a)} kPa, φu = ${f1(Math.abs(deg(Math.atan(dsFitP.b))))}°` : `c${prime} = ${f1(Math.abs(dsFitP.a))} kPa, φ${prime} = ${f1(deg(Math.atan(dsFitP.b)))}°`}
                      </b>{' '}
                      {test === 'cd' ? '(effective, peak)' : '(total stress)'}
                    </div>
                  )}
                  {dsFitU && (
                    <div className="text-mute">
                      Ultimate: c′ = {f1(Math.abs(dsFitU.a))} kPa, φ′ = {f1(deg(Math.atan(dsFitU.b)))}°
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* transport */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button className="btn !py-1 !px-3 !text-xs" onClick={() => (t >= 1 ? (go(0), setPlay(true)) : setPlay(!play))}>
          {t >= 1 ? '↺ Run again' : play ? '❚❚ Pause' : '▶ Run the test'}
        </button>
        <input type="range" min={0} max={1} step={0.002} value={t} onChange={(e) => (setPlay(false), go(+e.target.value))} className="flex-1 min-w-[140px] accent-[var(--c-accent)]" aria-label="Test progress" />
        <span className="num text-mute whitespace-nowrap">{stageName}</span>
      </div>
      <div className="rounded-lg border border-line bg-panel2/60 px-3 py-2 text-sm leading-relaxed cq-md:min-h-[5.2rem]">{caption(rig, test, soil, st.stage, u01)}</div>

      {/* specimens */}
      <div className="rounded-xl border border-line p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <b className="text-sm">Specimens tested ({kept.length})</b>
          <span className="text-xs text-mute">each finished run is kept; change {tagS} and run again to build the envelope</span>
          <button className="btn !py-0.5 !px-2 !text-xs ml-auto" onClick={() => setKept([100, 200, 300])}>
            ⚡ Three at once (100, 200, 300)
          </button>
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setKept([])} disabled={!kept.length}>
            Clear
          </button>
        </div>
        {kept.length > 0 && (
          <div className="overflow-x-auto">
            <table className="text-xs num w-full max-w-xl">
              <thead>
                <tr className="text-mute text-left">
                  {(rig === 'tx' ? ['σ3', 'Δσf', 'σ1f', ...(test === 'cd' ? [] : ['uf', 'σ′3f', 'σ′1f', 'Af'])] : ['σn', 'τf (peak)', ...(test === 'cd' ? ['τ ultimate', 'ΔH at end (mm)'] : [])]).map((h) => (
                    <th key={h} className="font-semibold pr-3 py-0.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rig === 'tx'
                  ? fails.map(({ v, f }) => (
                      <tr key={v} className="border-t border-line/60">
                        <td className="pr-3 py-0.5">{v}</td>
                        <td className="pr-3">{f1(f.dev)}</td>
                        <td className="pr-3">{f1(f.s1)}</td>
                        {test !== 'cd' && (
                          <>
                            <td className="pr-3">{f1(f.u)}</td>
                            <td className="pr-3">{f1(f.s3p)}</td>
                            <td className="pr-3">{f1(f.s1p)}</td>
                            <td className="pr-3">{fmt(f.du / f.dev, 2)}</td>
                          </>
                        )}
                      </tr>
                    ))
                  : dsPts.map((d) => (
                      <tr key={d.v} className="border-t border-line/60">
                        <td className="pr-3 py-0.5">{d.v}</td>
                        <td className="pr-3">{f1(d.p)}</td>
                        {test === 'cd' && (
                          <>
                            <td className="pr-3">{f1(d.u)}</td>
                            <td className="pr-3">{fmt(dsState(soil, test, d.v, 1).dH, 2)}</td>
                          </>
                        )}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="text-xs text-mute">
          <b className="text-ink">{rig === 'tx' ? 'Triaxial' : 'Shear box'} {test.toUpperCase()}:</b> {GIVES[rig][test]}
        </div>
      </div>
      <div className="text-[11px] text-faint">
        A teaching model: curve shapes are the standard qualitative sketches, failure values follow Mohr–Coulomb with c′ = {m.peak.c} kPa, φ′ = {m.peak.phi}°{m.clay ? `, Af = ${m.Af}` : ''}
        {test === 'uu' ? `, field σ′ = ${SIGMA0} kPa` : ''}. Not test data.
      </div>
    </div>
  )
}
