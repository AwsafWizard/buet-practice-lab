// CE 315 term final 2006-07 (held 20 Nov 2007), PDF pp. 93–100.
// Section A: 4 questions, answer 3 (35 each). Section B: 8 questions, answer 6 (17.5 each; Q12 prints 18.5).
// Every Section B question uses the cantilever of Fig. 5. Attached aids: Graph A.1a/A.1b (pp. 99–100);
// WSD T-beam k, j, z formulas inside Fig. 3.
//
// This file also exports the small SVG kit and the model answers that the other old papers
// (r2005, r2004, r2002) reuse.
import type { ReactNode } from 'react'
import { tipAxes } from '../../../components/PointTip'
import { Md, Step, Steps, Tex } from '../../../components/ui'
import type { Check, RcGiven, RcQ } from '../../types'
import { allowableMoment, f, uncracked, wsdDoublyDesign } from '../../engine/elastic'
import { pickBars as pickDoubly, reviewDoubly, singlyMax, type DoublyReview, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, floorLoads, reviewT, wsdTDesign, wsdTj, type TDesign, type TDesignIn, type WsdTDesign } from '../../engine/tbeam'
import { designShear, selfWeight, shearAt, type ShearDesign, type ShearSection } from '../../engine/shear'
import { cantSlab, type CantSlabResult } from '../../engine/oneway'
import { beamLoads, designAs, limits, pickBars as pickSingly, review } from '../../engine/singly'
import { bar, beamBarGeometry, columnAnchorage, cutoff, hookGeometry, ldhCalc, ldSimplified, simplifiedCase } from '../../engine/bond'

// ================================================================ SVG kit (shared by r2005 / r2004 / r2002)
export const INK = 'var(--c-ink)'
export const CONC = 'var(--c-conc)'
export const STEEL = 'var(--c-steel)'
export const LOAD = 'var(--c-load)'
export const MUTE = 'var(--c-mute)'

export function Fig({ w, h, children, max = 600 }: { w: number; h: number; children: ReactNode; max?: number }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: max, display: 'block', margin: '0 auto' }} fontSize={12} fill={INK}>
      {children}
    </svg>
  )
}

export function T({ x, y, children, a = 'middle', c = INK, s = 12, b = false, it = false }: { x: number; y: number; children: ReactNode; a?: 'start' | 'middle' | 'end'; c?: string; s?: number; b?: boolean; it?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={a} fontSize={s} fill={c} fontWeight={b ? 700 : 400} fontStyle={it ? 'italic' : undefined}>
      {children}
    </text>
  )
}

export function Ln({ x1, y1, x2, y2, c = INK, w = 1.2, dash }: { x1: number; y1: number; x2: number; y2: number; c?: string; w?: number; dash?: string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeDasharray={dash} />
}

/** arrow head with its tip at (x, y) */
export function Head({ x, y, dir, c = INK, s = 6 }: { x: number; y: number; dir: 'u' | 'd' | 'l' | 'r'; c?: string; s?: number }) {
  const h = s / 2
  const pts =
    dir === 'd'
      ? `${x},${y} ${x - h},${y - s} ${x + h},${y - s}`
      : dir === 'u'
        ? `${x},${y} ${x - h},${y + s} ${x + h},${y + s}`
        : dir === 'l'
          ? `${x},${y} ${x + s},${y - h} ${x + s},${y + h}`
          : `${x},${y} ${x - s},${y - h} ${x - s},${y + h}`
  return <polygon points={pts} fill={c} />
}

export function DimH({ x1, x2, y, label, c = MUTE, below = false }: { x1: number; x2: number; y: number; label: ReactNode; c?: string; below?: boolean }) {
  return (
    <g>
      <Ln x1={x1} y1={y} x2={x2} y2={y} c={c} w={0.9} />
      <Ln x1={x1} y1={y - 5} x2={x1} y2={y + 5} c={c} w={0.9} />
      <Ln x1={x2} y1={y - 5} x2={x2} y2={y + 5} c={c} w={0.9} />
      {Math.abs(x2 - x1) > 16 && (
        <>
          <Head x={x1} y={y} dir="l" c={c} s={5} />
          <Head x={x2} y={y} dir="r" c={c} s={5} />
        </>
      )}
      <T x={(x1 + x2) / 2} y={below ? y + 15 : y - 5} c={INK}>
        {label}
      </T>
    </g>
  )
}

export function DimV({ y1, y2, x, label, c = MUTE, left = false }: { y1: number; y2: number; x: number; label: ReactNode; c?: string; left?: boolean }) {
  return (
    <g>
      <Ln x1={x} y1={y1} x2={x} y2={y2} c={c} w={0.9} />
      <Ln x1={x - 5} y1={y1} x2={x + 5} y2={y1} c={c} w={0.9} />
      <Ln x1={x - 5} y1={y2} x2={x + 5} y2={y2} c={c} w={0.9} />
      {Math.abs(y2 - y1) > 16 && (
        <>
          <Head x={x} y={y1} dir="u" c={c} s={5} />
          <Head x={x} y={y2} dir="d" c={c} s={5} />
        </>
      )}
      <T x={left ? x - 7 : x + 7} y={(y1 + y2) / 2 + 4} a={left ? 'end' : 'start'} c={INK}>
        {label}
      </T>
    </g>
  )
}

export function Conc({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} fill={CONC} stroke={INK} strokeWidth={1.2} />
}

export function Bar({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={STEEL} stroke={INK} strokeWidth={0.6} />
}

/** row of n bars centred between x1 and x2 */
export function Bars({ x1, x2, y, n, r = 4 }: { x1: number; x2: number; y: number; n: number; r?: number }) {
  if (n === 1) return <Bar x={(x1 + x2) / 2} y={y} r={r} />
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Bar key={i} x={x1 + ((x2 - x1) * i) / (n - 1)} y={y} r={r} />
      ))}
    </g>
  )
}

/** uniform load drawn above a beam whose top is at y */
export function Udl({ x1, x2, y, label, h = 16, c = LOAD, n }: { x1: number; x2: number; y: number; label?: ReactNode; h?: number; c?: string; n?: number }) {
  const k = n ?? Math.max(3, Math.round((x2 - x1) / 22))
  return (
    <g>
      <Ln x1={x1} y1={y - h} x2={x2} y2={y - h} c={c} w={1.2} />
      {Array.from({ length: k + 1 }, (_, i) => {
        const x = x1 + ((x2 - x1) * i) / k
        return (
          <g key={i}>
            <Ln x1={x} y1={y - h} x2={x} y2={y - 2} c={c} w={1} />
            <Head x={x} y={y - 1} dir="d" c={c} s={5} />
          </g>
        )
      })}
      {label && (
        <T x={(x1 + x2) / 2} y={y - h - 5} c={c}>
          {label}
        </T>
      )}
    </g>
  )
}

/** point load with its tip at (x, y) */
export function PLoad({ x, y, label, len = 34, c = LOAD }: { x: number; y: number; label?: ReactNode; len?: number; c?: string }) {
  return (
    <g>
      <Ln x1={x} y1={y - len} x2={x} y2={y - 2} c={c} w={1.6} />
      <Head x={x} y={y} dir="d" c={c} s={7} />
      {label && (
        <T x={x} y={y - len - 4} c={c} b>
          {label}
        </T>
      )}
    </g>
  )
}

export function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x - 8},${y + 13} ${x + 8},${y + 13}`} fill="none" stroke={INK} strokeWidth={1.2} />
      <Ln x1={x - 12} y1={y + 13} x2={x + 12} y2={y + 13} />
    </g>
  )
}

export function Roller({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x - 8},${y + 10} ${x + 8},${y + 10}`} fill="none" stroke={INK} strokeWidth={1.2} />
      <circle cx={x - 4} cy={y + 13} r={2.6} fill="none" stroke={INK} />
      <circle cx={x + 4} cy={y + 13} r={2.6} fill="none" stroke={INK} />
      <Ln x1={x - 12} y1={y + 16} x2={x + 12} y2={y + 16} />
    </g>
  )
}

/** hatched masonry / column block */
export function Hatch({ x, y, w, h, c = MUTE }: { x: number; y: number; w: number; h: number; c?: string }) {
  const lines: ReactNode[] = []
  const step = 6
  for (let s = -h; s < w; s += step) {
    const xa = Math.max(x, x + s)
    const ya = y + h - Math.max(0, -s)
    const xb = Math.min(x + w, x + s + h)
    const yb = y + h - (xb - (x + s))
    lines.push(<Ln key={s} x1={xa} y1={ya} x2={xb} y2={yb} c={c} w={0.6} />)
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={1.1} />
      {lines}
    </g>
  )
}

/** zig-zag break line: vertical (cuts a horizontal member at x) */
export function BrkV({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  const m = (y1 + y2) / 2
  return <polyline points={`${x},${y1} ${x},${m - 5} ${x - 5},${m - 2} ${x + 5},${m + 2} ${x},${m + 5} ${x},${y2}`} fill="none" stroke={INK} strokeWidth={1.1} />
}

/** zig-zag break line: horizontal (cuts a vertical member at y) */
export function BrkH({ y, x1, x2 }: { y: number; x1: number; x2: number }) {
  const m = (x1 + x2) / 2
  return <polyline points={`${x1},${y} ${m - 5},${y} ${m - 2},${y - 5} ${m + 2},${y + 5} ${m + 5},${y} ${x2},${y}`} fill="none" stroke={INK} strokeWidth={1.1} />
}

/** "Given" box drawn inside a figure */
export function GivenBox({ x, y, lines, title = 'Given' }: { x: number; y: number; lines: ReactNode[]; title?: string }) {
  return (
    <g>
      <T x={x} y={y} a="start" b>
        {title}
      </T>
      {lines.map((l, i) => (
        <T key={i} x={x} y={y + 17 * (i + 1)} a="start">
          {l}
        </T>
      ))}
    </g>
  )
}

// ================================================================ shared answer sketches
/** φ vs εt chart (ACI 318-02 values printed, current spiral value noted) */
export function PhiChart() {
  const X = (e: number) => 60 + (e / 0.007) * 420
  const Y = (p: number) => 200 - ((p - 0.5) / 0.45) * 170
  return (
    <Fig w={520} h={250} max={520}>
      <Ln x1={X(0)} y1={Y(0.5)} x2={X(0.007)} y2={Y(0.5)} />
      <Ln x1={X(0)} y1={Y(0.5)} x2={X(0)} y2={Y(0.95)} />
      {[0.65, 0.7, 0.9].map((p) => (
        <g key={p}>
          <Ln x1={X(0)} y1={Y(p)} x2={X(0.007)} y2={Y(p)} c={MUTE} w={0.5} dash="3 3" />
          <T x={X(0) - 6} y={Y(p) + 4} a="end">
            {p.toFixed(2)}
          </T>
        </g>
      ))}
      {[0.002, 0.005].map((e) => (
        <g key={e}>
          <Ln x1={X(e)} y1={Y(0.5)} x2={X(e)} y2={Y(0.95)} c={MUTE} w={0.5} dash="3 3" />
          <T x={X(e)} y={Y(0.5) + 15}>
            {e}
          </T>
        </g>
      ))}
      <g {...tipAxes({ X, Y, x: 'εt', y: 'φ' })}>
        <polyline points={`${X(0)},${Y(0.65)} ${X(0.002)},${Y(0.65)} ${X(0.005)},${Y(0.9)} ${X(0.007)},${Y(0.9)}`} fill="none" stroke={LOAD} strokeWidth={2.2} data-name="tied / other" />
        <polyline points={`${X(0)},${Y(0.7)} ${X(0.002)},${Y(0.7)} ${X(0.005)},${Y(0.9)}`} fill="none" stroke={STEEL} strokeWidth={1.6} strokeDasharray="6 3" data-name="spiral" />
      </g>
      <T x={X(0.001)} y={Y(0.65) + 15} c={LOAD}>
        tied / other
      </T>
      <T x={X(0.001)} y={Y(0.7) - 6}>
        spiral
      </T>
      <T x={X(0.001)} y={Y(0.93)} s={11}>
        compression-
      </T>
      <T x={X(0.001)} y={Y(0.93) + 13} s={11}>
        controlled
      </T>
      <T x={X(0.0035)} y={Y(0.93)} s={11}>
        transition
      </T>
      <T x={X(0.006)} y={Y(0.93)} s={11}>
        tension-
      </T>
      <T x={X(0.006)} y={Y(0.93) + 13} s={11}>
        controlled
      </T>
      <T x={X(0.0035)} y={240}>
        net tensile strain εt (at dt)
      </T>
      <T x={X(0.002)} y={Y(0.5) + 28} s={11} c={MUTE}>
        c/dt = 0.600
      </T>
      <T x={X(0.005)} y={Y(0.5) + 28} s={11} c={MUTE}>
        c/dt = 0.375
      </T>
      <T x={18} y={Y(0.72)} a="middle">
        φ
      </T>
    </Fig>
  )
}

/** uncracked → cracked elastic → ultimate, strain and stress. tensionTop = cantilever / negative moment. */
export function ThreeStages({ tensionTop = false }: { tensionTop?: boolean }) {
  const H = 90 // section height
  const rows = [
    { name: 'Uncracked', sub: 'M < Mcr', c: 0.52 },
    { name: 'Cracked, elastic', sub: 'Mcr < M ≤ service', c: 0.36 },
    { name: 'Ultimate', sub: 'M = Mn', c: 0.24 },
  ]
  const dd = 0.86 // d/h
  return (
    <Fig w={620} h={rows.length * 130 + 30} max={620}>
      <T x={150} y={16} b>
        section
      </T>
      <T x={300} y={16} b>
        strain
      </T>
      <T x={480} y={16} b>
        stress / forces
      </T>
      {rows.map((r, i) => {
        const top = 34 + i * 130
        // local y: 0 = compression face, H = tension face
        const Y = (v: number) => top + (tensionTop ? H - v : v)
        const c = r.c * H
        const d = dd * H
        const xs = 300 // strain zero line
        const xf = 480 // stress zero line
        const comp = 40
        const ten = i === 0 ? 34 : i === 1 ? (comp * (d - c)) / c : 60
        return (
          <g key={i}>
            <T x={8} y={top + 30} a="start" b>
              {`${i + 1}. ${r.name}`}
            </T>
            <T x={8} y={top + 47} a="start" c={MUTE}>
              {r.sub}
            </T>
            {/* section */}
            <Conc x={128} y={top} w={44} h={H} />
            <Bars x1={138} x2={162} y={Y(d)} n={3} r={3.5} />
            {i > 0 &&
              [0.55, 0.75].map((f) => {
                const yy0 = Y(H)
                const yy1 = Y(H - (H - c) * f)
                return <Ln key={f} x1={150 + (f - 0.6) * 30} y1={yy0} x2={150 + (f - 0.6) * 30} y2={yy1} c={LOAD} w={1} />
              })}
            <Ln x1={122} y1={Y(c)} x2={178} y2={Y(c)} c={MUTE} w={0.8} dash="4 3" />
            <T x={182} y={Y(c) + 4} a="start" s={11} c={MUTE}>
              N.A.
            </T>
            {/* strain */}
            <Ln x1={xs} y1={top - 4} x2={xs} y2={top + H + 4} c={MUTE} w={0.8} />
            <polygon points={`${xs},${Y(0)} ${xs - comp},${Y(0)} ${xs},${Y(c)}`} fill={CONC} stroke={INK} strokeWidth={1} />
            <polygon points={`${xs},${Y(c)} ${xs + (ten * (H - c)) / (d - c)},${Y(H)} ${xs},${Y(H)}`} fill="none" stroke={INK} strokeWidth={1} />
            <T x={xs - comp - 4} y={Y(0) + 4} a="end" s={11}>
              {i === 2 ? 'εcu = 0.003' : 'εc'}
            </T>
            <T x={xs + ten + 6} y={Y(d) + 4} a="start" s={11}>
              {i === 0 ? 'εs = εct (small)' : i === 1 ? 'εs = fs/Es < εy' : 'εs ≥ εy'}
            </T>
            {/* stress */}
            <Ln x1={xf} y1={top - 4} x2={xf} y2={top + H + 4} c={MUTE} w={0.8} />
            {i === 0 && (
              <>
                <polygon points={`${xf},${Y(0)} ${xf - comp},${Y(0)} ${xf},${Y(c)} ${xf + comp * ((H - c) / c)},${Y(H)} ${xf},${Y(H)}`} fill={CONC} stroke={INK} strokeWidth={1} />
                <T x={xf - comp - 4} y={Y(0) + 4} a="end" s={11}>
                  fc
                </T>
                <T x={xf + comp + 4} y={Y(H) + 4} a="start" s={11}>
                  ft {'<'} fr (concrete in tension works)
                </T>
              </>
            )}
            {i === 1 && (
              <>
                <polygon points={`${xf},${Y(0)} ${xf - comp},${Y(0)} ${xf},${Y(c)}`} fill={CONC} stroke={INK} strokeWidth={1} />
                <T x={xf - comp - 4} y={Y(0) + 4} a="end" s={11}>
                  fc ≤ ~0.5f′c (linear)
                </T>
                <Ln x1={xf} y1={Y(d)} x2={xf + 50} y2={Y(d)} c={STEEL} w={2} />
                <Head x={xf + 54} y={Y(d)} dir="r" c={STEEL} />
                <T x={xf + 60} y={Y(d) + 4} a="start" s={11}>
                  T = As fs
                </T>
                <T x={xf + 6} y={Y((c + H) / 2) + 4} a="start" s={11} c={MUTE}>
                  cracked: no tension in concrete
                </T>
              </>
            )}
            {i === 2 && (
              <>
                <path d={`M${xf},${Y(0)} L${xf - comp},${Y(0)} Q${xf - comp * 1.15},${Y(c * 0.55)} ${xf},${Y(c)} Z`} fill={CONC} stroke={INK} strokeWidth={1} />
                <rect x={xf - comp * 0.85} y={Math.min(Y(0), Y(0.85 * c))} width={comp * 0.85} height={0.85 * c} fill="none" stroke={LOAD} strokeWidth={1.2} strokeDasharray="4 2" />
                <T x={xf - comp - 4} y={Y(0) + 4} a="end" s={11}>
                  0.85f′c, a = β1c
                </T>
                <Ln x1={xf} y1={Y(d)} x2={xf + 50} y2={Y(d)} c={STEEL} w={2} />
                <Head x={xf + 54} y={Y(d)} dir="r" c={STEEL} />
                <T x={xf + 60} y={Y(d) + 4} a="start" s={11}>
                  T = As fy
                </T>
              </>
            )}
          </g>
        )
      })}
      <T x={310} y={rows.length * 130 + 22} s={11} c={MUTE}>
        {tensionTop ? 'Cantilever (negative moment): tension face and bars at the TOP, compression at the bottom.' : 'Positive moment: compression at the top, tension steel at the bottom.'}
      </T>
    </Fig>
  )
}

/** strain profiles at failure: under-, balanced, over-reinforced */
export function StrainProfiles() {
  const top = 30
  const H = 150
  const d = 140
  const x0 = 90
  const sc = 22 / 0.003
  const cases = [
    { name: 'under-reinforced', es: 0.006, c: 'ρ < ρb: εs > εy' },
    { name: 'balanced', es: 0.00207, c: 'ρ = ρb: εs = εy' },
    { name: 'over-reinforced', es: 0.001, c: 'ρ > ρb: εs < εy' },
  ]
  return (
    <Fig w={560} h={230} max={560}>
      <Conc x={20} y={top} w={40} h={H} />
      <Bars x1={30} x2={50} y={top + d} n={2} r={3.5} />
      <T x={40} y={top + H + 16}>
        section
      </T>
      <Ln x1={x0} y1={top - 6} x2={x0} y2={top + H + 6} c={MUTE} w={0.8} />
      <Ln x1={x0 - 22} y1={top} x2={x0} y2={top} c={INK} />
      <T x={x0 - 24} y={top - 6} a="end" s={11}>
        0.003
      </T>
      {cases.map((k, i) => {
        const c = (0.003 / (0.003 + k.es)) * d
        const xe = x0 + k.es * sc
        const col = i === 0 ? STEEL : i === 1 ? LOAD : INK
        return (
          <g key={i}>
            <Ln x1={x0 - 22} y1={top} x2={xe} y2={top + d} c={col} w={1.6} dash={i === 1 ? '6 3' : undefined} />
            <Ln x1={x0 - 6} y1={top + c} x2={x0 + 6} y2={top + c} c={col} w={1.6} />
            <T x={360} y={top + 30 + i * 36} a="start" c={col} b>
              {k.name}
            </T>
            <T x={360} y={top + 45 + i * 36} a="start" s={11}>
              {k.c}
            </T>
          </g>
        )
      })}
      <Ln x1={x0 + 0.00207 * sc} y1={top + d - 8} x2={x0 + 0.00207 * sc} y2={top + d + 8} c={MUTE} dash="2 2" />
      <T x={x0 + 0.00207 * sc} y={top + d + 22} s={11} c={MUTE}>
        εy
      </T>
      <T x={200} y={top + H + 40} s={11} c={MUTE}>
        deeper neutral axis (larger c) = more steel = less steel strain at failure
      </T>
    </Fig>
  )
}

// ================================================================ shared model answers (markdown)
export const A_LOAD_FACTORS = String.raw`**Why load factors exist.** In USD the required strength is $U = \gamma_D D + \gamma_L L$ and we design for $\phi S_n \ge U$. The load factor $\gamma$ (> 1) covers the chance that the real load is larger than the code load, plus errors in computing the load effect (analysis simplifications).

**Why $\gamma_D \ne \gamma_L$ — they are not equally uncertain.**
- **Dead load** = self-weight of members, finishes, fixed partitions. It is computed from known dimensions and unit weights (concrete 150 pcf, brick 120 pcf), stays in place and is controlled by the designer, so its scatter is small → **low factor: 1.2** (1.4 when D acts alone).
- **Live load** = occupancy, furniture, people, storage. It is movable, changes with time and use, is controlled by the owner (overloading, change of occupancy) and the code value is only a minimum estimate → much larger scatter → **higher factor: 1.6**.
- The factors come from probability: each is set according to the statistical variability of that load so that every member reaches the same target reliability (safety index $\beta \approx 3$–4, $P_{failure} \approx 1/100{,}000$). One common factor would be wasteful for dead-load-dominated members (long-span slabs) and unsafe for live-load-dominated ones.
- In combinations with wind or earthquake the factors are reduced, because all loads reaching their maxima together is unlikely.

**Values.** ACI 318-02 onward / BNBC 2020: $U = 1.2D + 1.6L$ (check $1.4D$). Older ACI (up to 318-99): $U = 1.4D + 1.7L$ — same logic, the live-load factor is always the larger one.`

export const A_PHI_WHY = String.raw`**What φ covers.** The design strength is $\phi S_n$ with $\phi < 1$. φ allows for
- variation of material strengths ($f'_c$, $f_y$) and of member dimensions and bar positions (under-strength),
- approximations in the design equations,
- the **mode and consequence of failure**: how ductile it is, how much warning it gives, and how important the member is.

**Why φ differs** — the last item changes from case to case:
- **Flexure, tension-controlled: 0.90.** The steel yields first, the beam deflects and cracks a lot before failing (ductile, warning), and $M_n$ depends mainly on $A_s f_y$, which is reliably known.
- **Shear and torsion: 0.75** (0.85 in ACI 318-99). Diagonal-tension failure is sudden and brittle, and the shear equations are empirical with large test scatter.
- **Compression-controlled (columns): 0.65 tied, 0.75 spiral** (0.70 / 0.75 in 318-99; 0.65 / 0.70 in 318-02). Columns fail suddenly by concrete crushing, the result depends more on the variable concrete strength, and losing one column can bring down everything above it. Spirals confine the core and give a more ductile failure, so they get a higher φ.
- **Bearing on concrete: 0.65**; plain concrete: 0.60 (0.55 in 318-02).
- Between tension- and compression-controlled, φ varies linearly with the net tensile strain $\varepsilon_t$.

Together with the load factors this gives P(overload) ≈ 1/1000 × P(under-strength) ≈ 1/100 → P(failure) ≈ 1/100,000.`

export const A_TS = String.raw`**Why.** Concrete shrinks as it dries and expands or contracts with temperature. A slab is restrained by its supports (beams, walls, columns), so these volume changes cause tensile stresses and cracks. In a **one-way slab** the main bars run only in the span direction; in the other direction there is no flexural steel, so ACI requires **temperature & shrinkage (distribution) steel** there. It also
- keeps the shrinkage and temperature cracks fine and well distributed,
- spreads concentrated loads sideways to more of the main bars,
- ties the main bars into a mat and holds them in place while concrete is cast.

**How it is provided.**
- Bars **perpendicular to the main bars**, uniformly spaced, placed on the inside of the main steel (on top of the bottom bars in the span, under the top bars at the supports).
- Area based on the **gross** section $b \times h$ (per ft width, $b = 12$ in).
- Spacing $\le 5h$ and $\le 18$ in.

**ACI minimum ratios** (to $bh$):
- Grade 40 or 50 deformed bars: **0.0020**
- Grade 60 deformed bars or welded wire fabric: **0.0018**
- $f_y > 60$ ksi: $0.0018 \times 60{,}000/f_y$, but not less than **0.0014**

The same ratio is also the minimum **flexural** steel of a slab (then spacing $\le 3h$, 18 in).
Example: 6.5 in slab, Grade 60 → $0.0018 \times 12 \times 6.5 = 0.140$ in²/ft → #3 @ 9 in c/c.`

export const A_COVER = String.raw`**Reasons for a minimum clear cover**
- **Corrosion protection:** concrete keeps moisture, oxygen and chlorides away from the steel; its alkalinity keeps the bar passive until carbonation reaches it. More cover is needed for weather, earth or sea exposure.
- **Fire protection:** steel loses strength quickly above about 500 °C; the cover insulates the bars for the required fire rating.
- **Bond:** enough concrete must surround a bar to develop bond and to prevent splitting cracks along it (development length depends on cover).
- **Construction tolerance:** bars are never placed exactly; the cover leaves room for that.

**ACI minimum clear cover (cast-in-place, non-prestressed)**
- Not exposed to weather or earth: beams and columns **1.5 in** (to stirrups/ties); slabs, walls, joists with #11 and smaller **¾ in**.
- Exposed to earth or weather: #6–#18 **2 in**; #5 and smaller **1.5 in**.
- Cast against and permanently exposed to earth (footings): **3 in**.

So a beam with #3 stirrups and #8 bars has $d \approx h - (1.5 + 0.375 + 0.5) \approx h - 2.5$ in.`

export const A_OVER_UNDER = String.raw`Compare the steel ratio $\rho = A_s/bd$ with the **balanced ratio** $\rho_b = 0.85\beta_1 \dfrac{f'_c}{f_y}\dfrac{87{,}000}{87{,}000 + f_y}$, at which the steel reaches $\varepsilon_y$ exactly when the concrete reaches $\varepsilon_{cu} = 0.003$.

- **Under-reinforced section ($\rho < \rho_b$):** the steel yields first. It keeps stretching at constant stress, cracks widen, the neutral axis rises and the beam deflects a lot; only then does the concrete crush. Failure is **ductile, with plenty of warning**. $M_n \approx A_s f_y(d - a/2)$ depends mainly on the reliable steel strength. ACI requires this (net tensile strain $\varepsilon_t \ge 0.004$, i.e. $\rho \le \rho_{max}$; older codes $\rho \le 0.75\rho_b$).
- **Over-reinforced section ($\rho > \rho_b$):** the concrete crushes before the steel yields ($f_s < f_y$). Failure is **sudden and brittle, with no warning**, and the expensive steel is not fully used. Not permitted.
- **Balanced section ($\rho = \rho_b$):** both happen together — the dividing line.`

// ================================================================ solution kit (engine output → steps)
export type St = { t: string; tex?: string; md?: string }

/** numbered steps (title, block TeX, markdown note) + an answer box */
export function Sol({ steps, end, children }: { steps: St[]; end?: string; children?: ReactNode }) {
  return (
    <div className="space-y-3 text-sm">
      <Steps>
        {steps.map((s, i) => (
          <Step key={i} n={i + 1} title={s.t}>
            {s.tex && <Tex block>{s.tex}</Tex>}
            {s.md && <Md>{s.md}</Md>}
          </Step>
        ))}
      </Steps>
      {children}
      {end && (
        <div className="rounded-lg border border-good/40 bg-good/5 p-2">
          <Md>{end}</Md>
        </div>
      )}
    </div>
  )
}

export const ck = (key: string, label: string, value: number, unit?: string, tol?: number): Check => ({ key, label, value, unit, tol })

export function doublySteps(p: DoublyReviewIn, r: DoublyReview): St[] {
  const dt = p.dt ?? p.d
  const out: St[] = [
    { t: 'Steel ratios', tex: `\\rho = \\frac{A_s}{bd} = \\frac{${f(p.As)}}{${f(p.b)}\\times${f(p.d)}} = ${f(r.rho, 4)},\\quad \\rho' = \\frac{${f(p.Asp)}}{${f(p.b * p.d)}} = ${f(r.rhoP, 4)},\\quad \\beta_1 = ${f(r.b1)}` },
    {
      t: 'Trial: assume both steels yield',
      tex: `a = \\frac{(A_s - A'_s)f_y}{0.85f'_cb} = \\frac{(${f(p.As)} - ${f(p.Asp)})(${f(p.fy)})}{0.85(${f(p.fc)})(${f(p.b)})} = ${f(r.trial.a)}\\text{ in},\\quad c = \\frac{a}{\\beta_1} = ${f(r.trial.c)}\\text{ in}`,
    },
    {
      t: 'Does the compression steel yield?',
      tex: `\\varepsilon'_s = 0.003\\frac{c - d'}{c} = 0.003\\frac{${f(r.trial.c)} - ${f(p.dp)}}{${f(r.trial.c)}} = ${f(r.trial.epsSp, 5)}\\ ${r.trial.epsSp >= r.ey ? '\\ge' : '<'}\\ \\varepsilon_y = ${f(r.ey, 5)}`,
      md: r.trial.epsSp >= r.ey ? "Yes: $f'_s = f_y$ and the trial values stand." : "No: $f'_s = E_s\\varepsilon'_s = 87(c - d')/c$ ksi; find c from $C_c + C_s = T$.",
    },
  ]
  if (r.method === 'quadratic' && r.quad)
    out.push({
      t: 'Solve for c',
      tex: `0.85f'_c\\beta_1 b\\,c^2 + \\left(87A'_s${r.dispUsed ? " - 0.85f'_cA'_s" : ''} - A_sf_y\\right)c - 87A'_sd' = 0 \\;\\Rightarrow\\; ${f(r.quad.A, 3)}c^2 ${r.quad.B >= 0 ? '+' : '-'} ${f(Math.abs(r.quad.B), 3)}c - ${f(-r.quad.C, 3)} = 0`,
      md: r.dispUsed ? "The displaced concrete $0.85f'_cA'_s$ is subtracted (class handnote, non-yielding branch)." : undefined,
    })
  if (r.method === 'general') out.push({ t: 'Tension steel does not yield', md: 'Solved by strain compatibility for both steels (over-reinforced).' })
  out.push(
    { t: 'Neutral axis and steel stresses', tex: `c = ${f(r.c)}\\text{ in},\\ a = \\beta_1 c = ${f(r.a)}\\text{ in},\\ f'_s = ${f(r.fsp, 2)}\\text{ ksi},\\ f_s = ${f(r.fs, 2)}\\text{ ksi}` },
    {
      t: 'Forces',
      tex: `C_c = 0.85f'_cab = ${f(r.Cc, 1)}\\text{ k},\\quad C_s = A'_s(f'_s${r.dispUsed ? " - 0.85f'_c" : ''}) = ${f(r.Cs, 1)}\\text{ k},\\quad T = A_sf_s = ${f(r.T, 1)}\\text{ k}`,
    },
    {
      t: 'Nominal moment',
      tex: `M_n = C_c\\left(d - \\frac a2\\right) + C_s(d - d') = ${f(r.Cc, 1)}(${f(p.d - r.a / 2)}) + ${f(r.Cs, 1)}(${f(p.d - p.dp)}) = ${f(r.Mn, 0)}\\text{ in-k} = ${f(r.MnFt, 1)}\\text{ k-ft}`,
    },
    {
      t: 'Net tensile strain and φ',
      tex: `\\varepsilon_t = 0.003\\frac{d_t - c}{c} = 0.003\\frac{${f(dt)} - ${f(r.c)}}{${f(r.c)}} = ${f(r.epsT, 5)} \\Rightarrow \\phi = ${f(r.phi)}\\ \\ (\\text{${r.zone}})`,
      md: r.ductileOk ? undefined : '**εt < 0.004: not permitted for a beam.**',
    },
    { t: 'Design strength', tex: `\\phi M_n = ${f(r.phi)}\\times${f(r.MnFt, 1)} = ${f(r.phiMn, 1)}\\text{ k-ft}` },
  )
  return out
}

export function tDesignSteps(p: TDesignIn, r: TDesign): St[] {
  const fd = `${f(p.d)} - ${f(p.hf / 2)}`
  const out: St[] = [
    {
      t: 'Does the flange alone carry Mu?',
      tex: `\\phi M_{n,flange} = 0.9(0.85f'_c)b_{eff}h_f\\left(d - \\frac{h_f}{2}\\right) = 0.9(0.85)(${f(p.fc)})(${f(p.beff)})(${f(p.hf)})(${fd}) = ${f(r.phiMnFlange, 1)}\\text{ k-ft}\\ ${r.rect ? '\\ge' : '<'}\\ M_u = ${f(p.Mu, 1)}`,
      md: r.rect ? '$a \\le h_f$: design as a **rectangular beam with $b = b_{eff}$**.' : '$a > h_f$: **true T-beam** — split into flange overhangs + web.',
    },
    { t: 'Class trial (a = hf)', tex: `A_s = \\frac{M_u}{0.9f_y(d - h_f/2)} = \\frac{${f(p.Mu * 12, 0)}}{0.9(${f(p.fy)})(${fd})} = ${f(r.trial.As)}\\text{ in}^2,\\quad a = \\frac{A_sf_y}{0.85f'_cb_{eff}} = ${f(r.trial.a)}\\text{ in}` },
  ]
  if (r.rect)
    out.push({
      t: 'Steel (rectangle beff × d)',
      tex: `A_s = ${f(r.As)}\\text{ in}^2,\\quad a = ${f(r.a)}\\text{ in} \\le h_f,\\quad c = ${f(r.c)}\\text{ in},\\quad \\varepsilon_t = ${f(r.epsT, 5)} \\Rightarrow \\phi = ${f(r.phi)}`,
      md: 'From $M_u = \\phi A_sf_y(d - a/2)$ solved exactly (same as iterating on a).',
    })
  else
    out.push(
      { t: 'Flange overhangs', tex: `A_{sf} = \\frac{0.85f'_c(b_{eff} - b_w)h_f}{f_y} = \\frac{0.85(${f(p.fc)})(${f(p.beff - p.bw)})(${f(p.hf)})}{${f(p.fy)}} = ${f(r.Asf)}\\text{ in}^2,\\quad \\phi M_{n1} = ${f(r.phiMn1, 1)}\\text{ k-ft}` },
      { t: 'Web', tex: `\\phi M_{n2} = M_u - \\phi M_{n1} = ${f(r.phiMn2, 1)}\\text{ k-ft} \\Rightarrow A_{sw} = ${f(r.Asw)}\\text{ in}^2,\\ a = ${f(r.a)}\\text{ in}` },
      { t: 'Total steel and strain', tex: `A_s = A_{sf} + A_{sw} = ${f(r.As)}\\text{ in}^2,\\quad c = ${f(r.c)}\\text{ in},\\ \\varepsilon_t = ${f(r.epsT, 5)} \\Rightarrow \\phi = ${f(r.phi)}` },
    )
  out.push({ t: 'Minimum steel', tex: `A_{s,min} = \\frac{\\max(3\\sqrt{f'_c},200)}{f_y}b_wd = ${f(r.AsMin)}\\text{ in}^2\\ ${r.As >= r.AsMin ? '\\le A_s\\ \\checkmark' : '> A_s \\Rightarrow \\text{use } A_{s,min}'}` })
  return out
}

export function wsdTSteps(p: { M: number; beff: number; hf: number; d: number; n: number; fcAllow: number; fsAllow: number }, r: WsdTDesign): St[] {
  const s = r.sec
  const jPrinted = wsdTj(s.rho, p.n, p.hf, p.d)
  return [
    { t: 'First trial', tex: `jd \\approx d - \\frac t2 = ${f(p.d - p.hf / 2)}\\text{ in},\\quad A_s = \\frac{M}{f_s\\,jd} = \\frac{${f(p.M * 12, 0)}}{${f(p.fsAllow)}\\times${f(p.d - p.hf / 2)}} = ${f(r.iters[0].As)}\\text{ in}^2` },
    {
      t: 'Neutral axis (T formula)',
      tex: s.rect
        ? `\\rho = \\frac{A_s}{bd} = ${f(s.rho, 5)},\\ k = \\sqrt{(\\rho n)^2 + 2\\rho n} - \\rho n = ${f(s.k)},\\ kd = ${f(s.kd)}\\text{ in} \\le t = ${f(p.hf)}`
        : `\\rho = \\frac{A_s}{b_{eff}d} = ${f(s.rho, 5)},\\quad k = \\frac{n\\rho + \\tfrac12(t/d)^2}{n\\rho + t/d} = ${f(s.k)},\\quad kd = ${f(s.kd)}\\text{ in} > t = ${f(p.hf)}`,
      md: s.rect ? 'Neutral axis inside the flange: rectangular formulas with b = beff.' : undefined,
    },
    {
      t: 'Lever arm',
      tex: s.rect
        ? `jd = d - \\frac{kd}{3} = ${f(s.jd)}\\text{ in}`
        : `z = \\frac{3kd - 2t}{2kd - t}\\cdot\\frac t3 = ${f(s.z)}\\text{ in},\\quad jd = d - z = ${f(s.jd)}\\text{ in}\\ \\ (j = ${f(s.j, 4)};\\ \\text{printed formula } j = ${f(jPrinted, 4)})`,
    },
    { t: 'Steel (iterated until As settles)', tex: `A_s = \\frac{M}{f_s\\,jd} = \\frac{${f(p.M * 12, 0)}}{${f(p.fsAllow)}\\times${f(s.jd)}} = ${f(r.As)}\\text{ in}^2`, md: `Iterations: ${r.iters.slice(0, 4).map((i) => `$${f(i.As)}$`).join(' → ')} in².` },
    {
      t: 'Concrete stress check',
      tex: `f_c = \\frac{f_s}{n}\\cdot\\frac{k}{1-k} = \\frac{${f(p.fsAllow)}}{${p.n}}\\cdot\\frac{${f(s.k)}}{${f(1 - s.k)}} = ${f(r.fcAct)}\\text{ ksi}\\ ${r.concreteOk ? '\\le' : '>'}\\ ${f(p.fcAllow)}\\ ${r.concreteOk ? '\\checkmark' : '\\times'}`,
    },
  ]
}

/** shear design summary from designShear */
export function ShearSol({ D, sec, pre = [], end }: { D: ShearDesign; sec: ShearSection; pre?: St[]; end?: string }) {
  const k = D.lim
  const steps: St[] = [
    ...pre,
    {
      t: 'Concrete capacity',
      tex: `\\phi V_c = ${f(k.phi)}(2)\\sqrt{${sec.fc}}(${f(sec.bw)})(${f(sec.d)}) = ${f(k.phiVc, 2)}\\text{ k},\\quad \\tfrac12\\phi V_c = ${f(k.halfPhiVc, 2)}\\text{ k}`,
      md: `Case limits on $\\phi V_s$: $\\phi 4\\sqrt{f'_c}b_wd = ${f(k.phiVs4, 1)}$ k, $\\phi 8\\sqrt{f'_c}b_wd = ${f(k.phiVs8, 1)}$ k; $V_{u,max} = ${f(k.VuMax, 1)}$ k. Minimum $A_v/s = \\max(0.75\\sqrt{f'_c}b_w/f_y,\\ 50b_w/f_y) = ${f(k.avsMin, 4)}$ in²/in → $s = ${f(k.sMinSteel, 1)}$ in for $A_v = ${f(k.Av, 2)}$ in².`,
    },
  ]
  for (const r of D.runs) {
    const a = shearAt(r.Vd, sec)
    const lay = D.layouts[r.id]
    steps.push({
      t: r.label,
      tex: `V_{u,face} = ${f(r.Vface, 2)}\\text{ k},\\ V_u${r.critAtFace ? '' : '(d)'} = ${f(r.Vd, 2)}\\text{ k} \\Rightarrow \\text{Case ${a.case}}${a.case === 'A' ? '' : `,\\ \\phi V_s = ${f(a.phiVs, 2)}\\text{ k},\\ A_v/s = ${f(a.avs, 4)},\\ s = \\min(${f(a.sCalc, 2)},\\ ${f(a.sMax, 2)}) = ${f(a.s, 2)}\\text{ in}`}`,
      md:
        [
          r.uPhiVc !== null ? `$V_u = \\phi V_c$ at ${f(r.uPhiVc / 12, 2)} ft from the face` : '',
          r.uReqEnd > 0 ? `stirrups required to ${f(r.uReqEnd / 12, 2)} ft from the face${r.uReqEnd >= r.len - 0.1 ? ' (the whole run)' : ' (where $V_u = \\tfrac12\\phi V_c$)'}` : 'no stirrups required',
          lay.count ? `layout: **1 @ ${f(lay.first)} in + ${lay.zones.map((z) => `${z.n} @ ${f(z.s)} in`).join(' + ')}** (${lay.count} stirrups, last at ${f(lay.last)} in)` : '',
        ]
          .filter(Boolean)
          .join('; ') + '.',
    })
  }
  return (
    <Sol steps={steps} end={end}>
      {D.flags.length > 0 && (
        <ul className="text-xs text-mute list-disc pl-5">
          {D.flags.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      )}
    </Sol>
  )
}

/** one-way slab strip with cantilever(s): steps from cantSlab */
export function cantSlabSteps(r: CantSlabResult, factorNote?: string): St[] {
  const L = r.loads
  return [
    {
      t: 'Thickness',
      tex: `h = ${f(r.h)}\\text{ in}${r.hGiven ? '\\ (\\text{given})' : ''},\\quad d = h - 1 = ${f(r.d)}\\text{ in}`,
      md: `ACI minimum: span ${r.spanRule === 'both' ? 'l/28' : r.spanRule === 'one' ? 'l/24' : 'l/20'} = ${f(r.hSpan, 2)} in${r.nC ? `, cantilever l/10 = ${f(r.hCant, 2)} in` : ''}${r.fyF !== 1 ? ` (× ${f(r.fyF, 2)} for fy)` : ''}.`,
    },
    {
      t: 'Loads (1 ft strip)',
      tex: `w_D = ${f(L.fD)}(${f(L.D, 1)}) = ${f(L.wD, 1)}\\text{ psf},\\quad w_L = ${f(L.fL)}(${f(L.L, 1)}) = ${f(L.wL, 1)}\\text{ psf},\\quad w_u = ${f(L.wu, 1)}\\text{ psf}`,
      md: (L.given ? 'Dead load as given (includes self-weight).' : `Dead load = self-weight ${f(L.sw, 1)} psf + superimposed.`) + (factorNote ? ' ' + factorNote : ''),
    },
    { t: 'Geometry', tex: `L_{c/c} = ${f(r.geo.L, 3)}\\text{ ft}${r.geo.acL ? `,\\ a_{left} = ${f(r.geo.acL, 3)}\\text{ ft}` : ''}${r.geo.acR ? `,\\ a_{right} = ${f(r.geo.acR, 3)}\\text{ ft}` : ''}`, md: 'Cantilever lengths here are measured to the support centre (used for the span statics).' },
    {
      t: 'Max negative moment (LL on the cantilever; at the support face)',
      tex: `M_u^- = \\frac{w_u a^2}{2} = \\frac{${f(L.wuk, 4)}\\times${f(Math.max(r.input.cantL, r.input.cantR))}^2}{2} = ${f(r.Mneg, 2)}\\text{ k-ft/ft}`,
    },
    {
      t: 'Max positive moment (LL on the span only, cantilevers DL only)',
      tex: `M_u^+ = ${f(r.Mpos, 2)}\\text{ k-ft/ft at } x = ${f(r.patterns.span.xm, 2)}\\text{ ft}`,
      md: `Simple-span value $w_uL^2/8 = ${f(r.simple, 2)}$ k-ft/ft less the relief from the dead-loaded cantilever(s).`,
    },
    {
      t: 'Pattern with LL on the cantilever(s) only',
      md: r.uplift.negThrough
        ? `Moment stays negative through the span (max ${f(r.uplift.Mmax, 2)} k-ft/ft): top bars must run through.`
        : `Span moment still positive (max ${f(r.uplift.Mmax, 2)} k-ft/ft). Reactions ${f(r.uplift.RA, 2)} / ${f(r.uplift.RB, 2)} k/ft${r.uplift.RB < 0 || r.uplift.RA < 0 ? ' — **uplift at a support: anchor the slab**' : ' (no uplift)'}.`,
    },
    { t: 'Depth check', tex: `d_{req} = ${f(r.depth.dreq, 2)}\\text{ in} ${r.depth.dreq <= r.d ? '\\le' : '>'} d = ${f(r.d)}\\text{ in}\\ ${r.depth.dreq <= r.d ? '\\checkmark' : '\\times'}`, md: 'Effective depth needed at $\\rho_{0.005}$ (tension-controlled).' },
    {
      t: 'Steel',
      tex: `A_s^+ = ${f(r.asPos.As)},\\quad A_s^- = ${f(r.asNeg.As)},\\quad A_{s,min} = ${f(r.AsMin)}\\text{ in}^2/\\text{ft}`,
      md: "Iterating $A_s = M_u/[0.9f_y(d - a/2)]$ with $a = A_sf_y/(0.85f'_c\\cdot 12)$; $A_{s,min}$ = T&S ratio × 12h.",
    },
    {
      t: 'Bars',
      md: `Bottom: **#${r.bar} @ ${f(r.pos.s)} in c/c** ($\\le 3h$, 18 in). Top over the cantilever support: alternate bottom bars cranked up (one per ${f(r.extra.width)} in) + ${r.extra.sExtra ? `**extra #${r.bar} @ ${f(Math.min(r.extra.sExtra, r.smax))} in c/c**${r.extra.sExtra > r.smax ? ' (calculated ' + f(r.extra.sExtra) + ' in; spacing limit used)' : ''}` : 'no extra bars needed'} (or straight top bars #${r.bar} @ ${f(r.straight.s)} in). Top bars run ${f(r.topExt, 2)} ft into the span. T&S: **#3 @ ${f(r.ts.s)} in c/c** perpendicular.`,
    },
    {
      t: 'Shear',
      tex: `V_u = ${f(Math.max(r.shear.Vcant, r.shear.Vspan), 2)}\\text{ k/ft}\\ ${r.shear.ok ? '\\le' : '>'}\\ \\phi V_c = ${f(r.shear.phiVc, 2)}\\text{ k/ft}\\ ${r.shear.ok ? '\\checkmark' : '\\times'}`,
    },
  ]
}

/** reinforcement sketch of a slab strip: supports, bottom bars, cranked bars, extra top bars */
export function SlabSketch({ r, beams = false }: { r: CantSlabResult; beams?: boolean }) {
  const cl = r.input.cantL
  const cr = r.input.cantR
  const bw = r.input.support / 12
  const sp = r.input.span
  const tot = cl + bw + sp + bw + cr
  const s = 520 / tot
  const X = (ft: number) => 40 + ft * s
  const xs1 = X(cl)
  const xs2 = X(cl + bw + sp)
  const yT = 60
  const t = 26
  const top = yT + 5
  const bot = yT + t - 5
  const ext = r.topExt
  const kL = cl ? xs1 + bw * s + 0.25 * sp * s : xs1 + 0.15 * sp * s
  const kR = cr ? xs2 - 0.25 * sp * s : xs2 - 0.15 * sp * s
  return (
    <Fig w={600} h={210}>
      <rect x={X(0)} y={yT} width={tot * s} height={t} fill={CONC} stroke={INK} />
      {beams ? (
        <>
          <rect x={xs1} y={yT + t} width={bw * s} height={40} fill={CONC} stroke={INK} />
          <rect x={xs2} y={yT + t} width={bw * s} height={40} fill={CONC} stroke={INK} />
        </>
      ) : (
        <>
          <Hatch x={xs1} y={yT + t} w={bw * s} h={40} />
          <Hatch x={xs2} y={yT + t} w={bw * s} h={40} />
        </>
      )}
      <Ln x1={xs1 - 3} y1={bot} x2={xs2 + bw * s + 3} y2={bot} c={STEEL} w={2} />
      <polyline
        points={`${cl ? X(0) + 4 : xs1 + 3},${cl ? top : bot} ${kL},${cl ? top : bot} ${kL + 12},${bot} ${kR - 12},${bot} ${kR},${cr ? top : bot} ${cr ? X(tot) - 4 : xs2 + bw * s - 3},${cr ? top : bot}`}
        fill="none"
        stroke={LOAD}
        strokeWidth={1.8}
      />
      {cl > 0 && <Ln x1={X(0) + 4} y1={top + 3} x2={xs1 + bw * s + ext * s} y2={top + 3} c={STEEL} w={2} dash="6 3" />}
      {cr > 0 && <Ln x1={xs2 - ext * s} y1={top + 3} x2={X(tot) - 4} y2={top + 3} c={STEEL} w={2} dash="6 3" />}
      <T x={300} y={28} s={11}>
        {`bottom #${r.bar} @ ${f(r.pos.s)}″ c/c, alternate bars cranked (orange)`}
      </T>
      <T x={300} y={44} s={11}>
        {r.extra.sExtra ? `extra top #${r.bar} @ ${f(Math.min(r.extra.sExtra, r.smax))}″ c/c (dashed), ${f(ext, 2)}′ past the support face` : `top: cranked bars suffice, ${f(ext, 2)}′ past the support face`}
      </T>
      {cl > 0 && <DimH x1={X(0)} x2={xs1} y={yT + t + 20} label={`${f(cl)}′`} below />}
      <DimH x1={xs1 + bw * s} x2={xs2} y={yT + t + 20} label={`${f(sp)}′ clear`} below />
      {cr > 0 && <DimH x1={xs2 + bw * s} x2={X(tot)} y={yT + t + 20} label={`${f(cr)}′`} below />}
      <T x={300} y={yT + t + 70} s={11}>
        {`T&S: #3 @ ${f(r.ts.s)}″ c/c perpendicular · h = ${f(r.h)}″, d = ${f(r.d)}″`}
      </T>
    </Fig>
  )
}

// ================================================================ figures (2006-07)
const G = (label: string, ref: string, what?: string, formula?: boolean): RcGiven => ({ label, ref, what, formula })
const graphA1 = G('Graph A.1a / A.1b', 'f-graphA1', 'R = Mn/bd² vs ρ, pp. 99–100')

function Fig1() {
  // beam 28 ft and section A-A 12 x 30
  const x0 = 30
  const x1 = 330
  const yb = 90
  return (
    <Fig w={600} h={250}>
      <Udl x1={x0} x2={x1} y={yb - 7} label="w (DL + LL)" />
      <rect x={x0} y={yb - 7} width={x1 - x0} height={7} fill={CONC} stroke={INK} />
      <Pin x={x0} y={yb} />
      <Roller x={x1} y={yb} />
      <Ln x1={130} y1={yb - 40} x2={130} y2={yb + 16} c={MUTE} dash="4 3" />
      <T x={130} y={yb + 30} s={11} c={MUTE}>
        A–A
      </T>
      <DimH x1={x0} x2={x1} y={yb + 46} label="28′-0″" />
      <GivenBox x={30} y={170} lines={['wLL = 1.0 k/ft, wDL = 0.8 k/ft (excluding self-wt)', "f′c = 3 ksi, fy = 40 ksi, fs = 20 ksi, n = 9"]} />
      {/* section 12 x 30 at 4 px/in */}
      <Conc x={430} y={40} w={48} h={120} />
      <DimV y1={40} y2={160} x={500} label="30″" />
      <DimH x1={430} x2={478} y={180} label="12″" below />
      <T x={454} y={222} b>
        Section A–A
      </T>
      <T x={454} y={100} s={11} c={MUTE}>
        bars
      </T>
      <T x={454} y={113} s={11} c={MUTE}>
        to design
      </T>
    </Fig>
  )
}

function Fig2Sec({ x, two, label }: { x: number; two: boolean; label: string }) {
  const s = 7 // px per in
  const y0 = 30
  const b = 12 * s
  const h = 28.5 * s
  return (
    <g>
      <Conc x={x} y={y0} w={b} h={h} />
      <Bars x1={x + 2.5 * s} x2={x + b - 2.5 * s} y={y0 + 2.5 * s} n={2} r={0.5 * s} />
      <Bars x1={x + 2.4 * s} x2={x + b - 2.4 * s} y={y0 + (two ? 26.5 : 25) * s} n={3} r={0.564 * s} />
      {two && <Bars x1={x + 2.4 * s} x2={x + b - 2.4 * s} y={y0 + 23.5 * s} n={3} r={0.564 * s} />}
      <DimV y1={y0} y2={y0 + 2.5 * s} x={x - 12} label="2.5″" left />
      <DimV y1={y0} y2={y0 + 25 * s} x={x + b + 14} label="d = 25″" />
      {two && <DimV y1={y0} y2={y0 + 26.5 * s} x={x + b + 74} label="dt = 26.5″" />}
      <DimH x1={x} x2={x + b} y={y0 + h + 14} label="12″" below />
      <T x={x + b / 2} y={y0 + 2.5 * s + 22} s={11}>
        A′s = 2 #8
      </T>
      <T x={x + b / 2} y={y0 + h + 46} b>
        {label}
      </T>
    </g>
  )
}

function Fig2() {
  return (
    <Fig w={600} h={310}>
      <Fig2Sec x={60} two={false} label="(i) As = 3 #9, one layer (dt = d)" />
      <Fig2Sec x={340} two label="(ii) As = 6 #9, two layers" />
      <T x={300} y={300} s={11} c={MUTE}>
        f′c = 3 ksi, fy = 60 ksi. Total depth not given (not needed).
      </T>
    </Fig>
  )
}

function Fig3() {
  // 4" slab over webs 12" x 20" at 10'-0" c/c; px: 2.6/in horizontally, 4/in vertically
  const sx = 2.6
  const sy = 4
  const yT = 40
  const xA = 120 // left web centre
  const xB = xA + 120 * sx
  const web = (xc: number) => (
    <g key={xc}>
      <rect x={xc - 6 * sx} y={yT + 4 * sy - 1} width={12 * sx} height={20 * sy + 1} fill={CONC} stroke={INK} strokeWidth={1.2} />
    </g>
  )
  return (
    <Fig w={600} h={230}>
      <rect x={30} y={yT} width={540} height={4 * sy} fill={CONC} stroke={INK} strokeWidth={1.2} />
      {web(xA)}
      {web(xB)}
      <rect x={xA - 6 * sx + 1} y={yT + 4 * sy - 1} width={12 * sx - 2} height={3} fill={CONC} />
      <rect x={xB - 6 * sx + 1} y={yT + 4 * sy - 1} width={12 * sx - 2} height={3} fill={CONC} />
      <Bars x1={xA - 3.5 * sx} x2={xA + 3.5 * sx} y={yT + 24 * sy - 4 * sy} n={3} r={3.2} />
      <BrkV x={30} y1={yT - 4} y2={yT + 4 * sy + 4} />
      <BrkV x={570} y1={yT - 4} y2={yT + 4 * sy + 4} />
      <T x={300} y={yT - 8}>
        4″ slab
      </T>
      <DimV y1={yT + 4 * sy} y2={yT + 24 * sy} x={xB + 6 * sx + 14} label="20″" />
      <DimV y1={yT + 20 * sy} y2={yT + 24 * sy} x={xA - 6 * sx - 12} label="4″" left />
      <DimH x1={xB - 6 * sx} x2={xB + 6 * sx} y={yT + 24 * sy + 16} label="12″" below />
      <DimH x1={xA} x2={xB} y={yT + 24 * sy + 52} label="10′-0″ c/c" />
      <T x={300} y={215} s={11} c={MUTE}>
        f′c = 3 ksi, fy = 60 ksi, fc = 1.35 ksi, fs = 24 ksi, n = 9 · simply supported span 25 ft
      </T>
    </Fig>
  )
}

function Fig4() {
  // section A-A: 5'-0" cantilever | 10" wall | 12'-0" clear | 10" wall; 2.3 px/in
  const s = 2.3
  const x0 = 40
  const xw1 = x0 + 60 * s
  const xw2 = xw1 + 10 * s + 144 * s
  const xe = xw2 + 10 * s
  const yS = 70
  const t = 15
  return (
    <Fig w={600} h={210}>
      <Udl x1={x0} x2={xe} y={yS} label="DL 140 psf (incl. self-wt) + LL 80 psf on any portion" n={20} />
      <rect x={x0} y={yS} width={xe - x0} height={t} fill={CONC} stroke={INK} strokeWidth={1.2} />
      <Hatch x={xw1} y={yS + t} w={10 * s} h={50} />
      <Hatch x={xw2} y={yS + t} w={10 * s} h={50} />
      <T x={(xw1 + xw2) / 2} y={yS + t + 30}>
        6.5″ slab
      </T>
      <DimH x1={x0} x2={xw1} y={yS + t + 72} label="5′-0″" />
      <DimH x1={xw1} x2={xw1 + 10 * s} y={yS + t + 72} label="" />
      <T x={xw1 + 5 * s} y={yS + t + 92} s={11}>
        10″
      </T>
      <DimH x1={xw1 + 10 * s} x2={xw2} y={yS + t + 72} label="12′-0″ clear" />
      <DimH x1={xw2} x2={xe} y={yS + t + 72} label="" />
      <T x={xw2 + 5 * s} y={yS + t + 92} s={11}>
        10″
      </T>
      <T x={300} y={200} s={11} c={MUTE}>
        10″ brick walls; slab ends flush with the right wall (no right overhang). f′c = 3 ksi, fy = 60 ksi.
      </T>
    </Fig>
  )
}

function Fig5({ cut = true }: { cut?: boolean }) {
  // column 20" wide, cantilever 10 ft, beam 20" deep; 2.6 px/in
  const s = 2.6
  const xc0 = 80
  const xc1 = xc0 + 20 * s
  const xe = xc1 + 120 * s
  const yT = 70
  const yB = yT + 20 * s
  const yBar = yT + 2.5 * s
  const xs = 452 // section 1-1, 5 px/in
  return (
    <Fig w={600} h={300}>
      {/* column */}
      <rect x={xc0} y={20} width={20 * s} height={200} fill={CONC} stroke="none" />
      <Ln x1={xc0} y1={20} x2={xc0} y2={220} />
      <Ln x1={xc1} y1={20} x2={xc1} y2={yT} />
      <Ln x1={xc1} y1={yB} x2={xc1} y2={220} />
      <BrkH y={20} x1={xc0} x2={xc1} />
      <BrkH y={220} x1={xc0} x2={xc1} />
      {/* beam */}
      <rect x={xc1 - 1} y={yT} width={xe - xc1 + 1} height={20 * s} fill={CONC} stroke="none" />
      <Ln x1={xc1} y1={yT} x2={xe} y2={yT} />
      <Ln x1={xc1} y1={yB} x2={xe} y2={yB} />
      <Ln x1={xe} y1={yT} x2={xe} y2={yB} />
      <Udl x1={xc1 + 4} x2={xe} y={yT} />
      <T x={xe} y={yT - 22} a="end" c={LOAD}>
        live load (UDL)
      </T>
      {/* bars: 2 continue, centre bar stops; standard hooks turned down in the column */}
      <polyline points={`${xc0 + 9},${yT + 52} ${xc0 + 9},${yBar} ${xe - 6},${yBar}`} fill="none" stroke={STEEL} strokeWidth={2.6} strokeLinejoin="round" />
      {cut && <Ln x1={xc0 + 14} y1={yBar + 4} x2={xc1 + 40 * s} y2={yBar + 4} c={STEEL} w={2.4} dash="7 3" />}
      <T x={xc1 + 8} y={yBar + 34} a="start" s={11}>
        3-#8 at column face
      </T>
      <T x={xe - 8} y={yBar + 34} a="end" s={11}>
        2-#8 continue to the end
      </T>
      {cut && (
        <T x={xc1 + 40 * s} y={yBar + 18} s={11}>
          centre 1-#8 stops (location?)
        </T>
      )}
      <T x={xc0 - 4} y={yT + 40} a="end" s={11}>
        standard
      </T>
      <T x={xc0 - 4} y={yT + 53} a="end" s={11}>
        hook
      </T>
      <Ln x1={xc1 + 4} y1={yT - 34} x2={xc1 + 4} y2={yB + 10} c={MUTE} dash="4 3" />
      <T x={xc1 + 8} y={yT - 26} a="start" s={11} c={MUTE}>
        1
      </T>
      <T x={xc1 + 8} y={yB + 14} a="start" s={11} c={MUTE}>
        1
      </T>
      <DimH x1={xc1} x2={xe} y={yB + 44} label="10.0 ft" />
      <DimH x1={xc0} x2={xc1} y={242} label="20″" />
      <DimV y1={yT} y2={yB} x={xe + 14} label="20″" />
      {/* section 1-1 */}
      <Conc x={xs} y={70} w={50} h={100} />
      <Bars x1={xs + 8} x2={xs + 42} y={70 + 2.5 * 5} n={3} r={3.2} />
      <DimV y1={70} y2={82.5} x={xs + 62} label="2.5″" />
      <DimV y1={82.5} y2={170} x={xs + 86} label="17.5″" />
      <DimH x1={xs} x2={xs + 50} y={186} label="10″" below />
      <T x={xs + 25} y={222} b>
        Sec. 1–1
      </T>
      <T x={300} y={270} s={11} c={MUTE}>
        Beam: f′c = 4000 psi, fy = 60,000 psi, fr = 350 psi, fs = 24,000 psi, Es = 29×10⁶ psi, n = 8.
      </T>
      <T x={300} y={287} s={11} c={MUTE}>
        Also consider self-weight of the beam when required.
      </T>
    </Fig>
  )
}

const PG = { A1: [93], A1f: [93, 96], A2: [93], A2f: [93, 96], A3: [94, 97], A4: [94], A4f: [94, 97], B5: [94, 98], B6: [94], B6f: [94, 98], B7: [95], B7f: [95, 98] }

const F5 = String.raw`**Fig. 5:** the short beam cantilevers from a supporting column at the left; span 10.0 ft from the column face, $b = 10$ in, $h = 20$ in, $d = 17.5$ in, 3 #8 top bars at section 1–1 (2 #8 continue to the free end), standard hooks in the 20 in column. Beam: $f'_c = 4000$ psi, $f_y = 60{,}000$ psi, $f_r = 350$ psi, $f_s = 24{,}000$ psi, $E_s = 29\times10^6$ psi, $n = 8$; consider self-weight of the beam when required.`

const T_FIG1 = String.raw`A rectangular beam carries a service live load of 1.0 kips/ft and an unfactored superimposed dead load of 0.8 kips/ft (in addition to self weight of beam) on a 28 ft simple span as shown in Fig. 1. The beam will have a cross-section of 12″ × 30″ for architectural reasons. Given $f'_c = 3$ ksi, $f_y = 40$ ksi, $f_s = 20$ ksi, $n = 9$. Design the beam for flexure:`

const T_FIG2 = String.raw`A rectangular RC beam as shown in Fig. 2 measures 12 in wide and has an effective depth of 25 in. Compression steel consisting of two No. 8 bars is located 2.5 in from the compression face of the beam. If $f'_c = 3$ ksi and $f_y = 60$ ksi, what is the design moment capacity of the beam according to ACI Code (2002), for the following alternative tensile steel areas:`

const T_FIG3 = String.raw`A floor slab 4″ thick is supported by reinforced concrete beams, 10 ft centre to centre, which together with slab act as T-beams. The cross-section of each beam below the slab is 12″ × 20″ as shown in Fig. 3. The beams are simply supported and their span is 25 ft. The effective depth will be taken 4 in. less than the total depth. The slab supports a service live load of 100 psf and a superimposed dead load (for floor finish and partition wall) of 75 psf in addition to self weight. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi, $f_c = 1.35$ ksi, $f_s = 24$ ksi, $n = 9$. Using ACI Code provisions, find:`

const LF02 = 'Load factors are not printed. The paper cites ACI 318-02, so use 1.2D + 1.6L (an examiner of that era may also accept 1.4D + 1.7L); say which you use.'

const BASE: RcQ[] = [
  // ---------------------------------------------------------------- Section A
  {
    id: 'rc-2006-07-1a',
    paper: '2006-07',
    sec: 'A',
    no: '1(a)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Why different load factors for dead and live load?',
    text: 'Why are load factors different for dead and live loads in USD method? Explain.',
    pages: PG.A1,
    theory: true,
    given: [G('Load combinations', 'm-loads')],
    solution: () => <Md>{A_LOAD_FACTORS}</Md>,
  },
  {
    id: 'rc-2006-07-1b',
    paper: '2006-07',
    sec: 'A',
    no: '1(b)',
    marks: 5,
    topics: ['rc-doubly', 'rc-elastic'],
    title: 'Why 2n for compression steel in WSD?',
    text: String.raw`Why is a value of 2 recommended by ACI in the WSD equation for calculating $f'_s$?`,
    pages: PG.A1,
    theory: true,
    flag: 'WSD (ACI Alternate Design Method) — not in the current slides',
    given: [],
    solution: () => (
      <Md>{String.raw`**The equation.** In WSD (ACI Alternate Design Method) the compression-steel stress is
$$f'_s = 2n\,f_c\,\frac{kd - d'}{kd} \le f_s$$
and the compression steel is transformed with area $(2n - 1)A'_s$ (the $-1$ removes the concrete the bars displace).

**Why 2.** An elastic analysis with $n$ alone would give $f'_s = n f_c (kd - d')/kd$, the stress just after loading. But service loads (especially dead load) are **sustained**:
- Under sustained compression, concrete **creeps**: its strain keeps growing (to roughly 2–3 times the instantaneous strain) at the same stress. **Shrinkage** adds more compressive strain.
- The compression bars are bonded to that concrete, so their strain grows by the same amount — but steel does not creep, so its **stress grows**. Load is gradually transferred from the concrete to the compression steel.
- Tests and long-term measurements showed the steel stress roughly doubles, so ACI uses an **effective modular ratio of 2n** for compression steel. Using $n$ would badly underestimate how much work the compression bars actually do.
- Also, near the compression face at service the concrete is already slightly nonlinear, which pushes the same way.

**Limit.** The computed $f'_s$ may not exceed the allowable tensile stress $f_s$ (e.g. 20 ksi for Grade 40, 24 ksi for Grade 60).`}</Md>
    ),
  },
  {
    id: 'rc-2006-07-1c-i',
    paper: '2006-07',
    sec: 'A',
    no: '1(c)(i)',
    marks: 13,
    topics: ['rc-elastic', 'rc-doubly'],
    title: 'Fixed 12″×30″ beam, 28 ft span — design by WSD',
    text: `${T_FIG1}\n\n**(i) by WSD method.**`,
    pages: PG.A1f,
    flag: 'WSD design — not in the current slides',
    given: [G('WSD allowable stresses', 'f-wsd')],
    figure: () => <Fig1 />,
    notes: [
      'd and cover are not given: take d = 30 − 2.5 = 27.5 in for one layer (26.5 in for two layers).',
      'Allowable concrete stress is not printed: fc = 0.45f′c = 1.35 ksi.',
      'Self-weight of the 12″ × 30″ beam is added to the 0.8 k/ft superimposed dead load.',
    ],
  },
  {
    id: 'rc-2006-07-1c-ii',
    paper: '2006-07',
    sec: 'A',
    no: '1(c)(ii)',
    marks: 12,
    topics: ['rc-singly'],
    title: 'Same beam — design by USD',
    text: `${T_FIG1}\n\n**(ii) by USD method.**`,
    pages: PG.A1f,
    given: [graphA1],
    figure: () => <Fig1 />,
    notes: [LF02, 'd not given: take d = 27.5 in (one layer) and check.'],
  },
  {
    id: 'rc-2006-07-2a',
    paper: '2006-07',
    sec: 'A',
    no: '2(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Purpose of minimum flexural steel; ACI ratios',
    text: 'What is the purpose of providing minimum amount of flexural steel in a beam? Write ACI provisions for minimum reinforcement ratios.',
    pages: PG.A2,
    theory: true,
    given: [G('ρ limits (Table A.4)', 'f-rho')],
    solution: () => (
      <Md>{String.raw`**Purpose.**
- If a beam is very lightly reinforced, its cracked-section strength $M_n$ can be **less than the cracking moment** $M_{cr} = f_r I_g / y_t$ of the plain concrete section.
- When the first crack forms, the tension the concrete was carrying is dumped suddenly onto the steel. If there is too little steel it yields or even fractures at once: a **sudden, brittle failure with no warning** (the beam behaves like plain concrete).
- Minimum steel makes $\phi M_n$ comfortably larger than $M_{cr}$, so after cracking the steel can carry the load and the failure stays ductile. It also controls crack widths and covers shrinkage, temperature and unforeseen loads (common in oversized "architectural" members).

**ACI provisions** ($f'_c$, $f_y$ in psi):
$$A_{s,min} = \frac{3\sqrt{f'_c}}{f_y}\,b_w d \;\ge\; \frac{200}{f_y}\,b_w d$$
- The $200/f_y$ term governs when $f'_c < 4444$ psi. For Grade 60: $\rho_{min} = 0.00333$ for $f'_c$ = 3000 and 4000 psi; 0.00354 for 5000 psi. Grade 40: 0.0050.
- Statically determinate T-beam with the **flange in tension**: use $b_w$ = the smaller of $2b_w$ and the flange width.
- The minimum need not be provided if the steel provided is at least **4/3 of that required** by analysis at every section.
- **Slabs and footings:** minimum = temperature & shrinkage steel ($0.0020bh$ Grade 40/50, $0.0018bh$ Grade 60), spacing $\le 3h$ and 18 in.`}</Md>
    ),
  },
  {
    id: 'rc-2006-07-2b',
    paper: '2006-07',
    sec: 'A',
    no: '2(b)',
    marks: 8,
    topics: ['rc-singly', 'rc-basics'],
    title: 'φ from net tensile strain εt (ACI 2002)',
    text: String.raw`What is the justification of determining strength reduction factor $\phi$ based on net tensile strain $\varepsilon_t$? Discuss the variation of strength reduction factor with $\varepsilon_t$ as given in ACI Code (2002).`,
    pages: PG.A2,
    theory: true,
    given: [G('φ factors and φ–εt chart', 'm-phi')],
    solution: () => (
      <div className="space-y-3">
        <Md>{String.raw`**Justification.**
- φ should reflect how **ductile** a section's failure is, not what the member is called. A beam and a column carrying moment can fail in the same way.
- The failure mode is decided by the strain in the **extreme tension steel** at nominal strength, $\varepsilon_t = 0.003\,(d_t - c)/c$ (net of creep, shrinkage and temperature strains).
  - Large $\varepsilon_t$: the steel has yielded well before the concrete crushes. There are wide cracks, large deflection and warning, moments can redistribute, and $M_n$ is governed by the reliable $A_s f_y$. A high φ is justified.
  - Small $\varepsilon_t$ (steel elastic): the concrete crushes suddenly with little warning, and the strength depends on the variable $f'_c$. A low φ is justified.
- So $\varepsilon_t$ is a direct, rational measure of ductility. It gives one continuous rule for beams, beam-columns and columns (ACI 318-02 Unified Design Provisions, replacing "0.9 for beams, 0.7 for columns" with axial-load interpolation, and the $0.75\rho_b$ limit).

**Variation (ACI 318-02, Grade 60, $\varepsilon_y \approx 0.002$):**
- **Compression-controlled:** $\varepsilon_t \le 0.002$ ($c/d_t \ge 0.600$) → φ = **0.65** (tied / other), **0.70** (spiral).
- **Tension-controlled:** $\varepsilon_t \ge 0.005$ ($c/d_t \le 0.375$) → φ = **0.90**.
- **Transition zone** ($0.002 < \varepsilon_t < 0.005$): φ varies linearly,
$$\phi = 0.48 + 83\,\varepsilon_t \;\;(\text{tied}),\qquad \phi = 0.57 + 67\,\varepsilon_t \;\;(\text{spiral})$$
- Flexural members (factored axial load $< 0.10 f'_c A_g$) must have $\varepsilon_t \ge 0.004$ at nominal strength. This replaces $\rho \le 0.75\rho_b$.
- Today (ACI 318-08 onward) the spiral value is 0.75 and the class writes the tied line as $\phi = 0.483 + 83.3\varepsilon_t$.`}</Md>
        <PhiChart />
      </div>
    ),
  },
  {
    id: 'rc-2006-07-2c-i',
    paper: '2006-07',
    sec: 'A',
    no: '2(c)(i)',
    marks: 11,
    topics: ['rc-doubly'],
    title: 'Doubly reinforced review, As = 3 #9 in one layer',
    text: `${T_FIG2}\n\n**(i)** $A_s$ = 3 No. 9 bars in one layer ($d = 25$ in, $d_t = 25$ in).\n\nCheck for yielding of compression steel in each case. Use USD method of design.`,
    pages: PG.A2f,
    given: [G('Stress block & β1', 'f-block'), G('φ factors and φ–εt chart', 'm-phi')],
    figure: () => <Fig2 />,
  },
  {
    id: 'rc-2006-07-2c-ii',
    paper: '2006-07',
    sec: 'A',
    no: '2(c)(ii)',
    marks: 11,
    topics: ['rc-doubly'],
    title: 'Doubly reinforced review, As = 6 #9 in two layers',
    text: `${T_FIG2}\n\n**(ii)** $A_s$ = 6 No. 9 bars in two layers ($d = 25$ in, $d_t = 26.5$ in).\n\nCheck for yielding of compression steel in each case. Use USD method of design.`,
    pages: PG.A2f,
    given: [G('Stress block & β1', 'f-block'), G('φ factors and φ–εt chart', 'm-phi')],
    figure: () => <Fig2 />,
    notes: ['Two layers of 3 #9 presumably at 26.5 in and 23.5 in (centroid 25 in).'],
  },
  {
    id: 'rc-2006-07-3a-i',
    paper: '2006-07',
    sec: 'A',
    no: '3(a)(i)',
    marks: 5,
    topics: ['rc-tbeam'],
    title: 'T-beam floor: effective flange width',
    text: `${T_FIG3}\n\n**(i)** the effective flange width.`,
    pages: PG.A3,
    given: [G('Effective flange width', 'f-beff')],
    figure: () => <Fig3 />,
  },
  {
    id: 'rc-2006-07-3a-ii',
    paper: '2006-07',
    sec: 'A',
    no: '3(a)(ii)',
    marks: 15,
    topics: ['rc-tbeam'],
    title: 'T-beam floor: As by USD',
    text: `${T_FIG3}\n\n**(ii)** the tensile steel area and select bars for a typical interior beam by USD method.`,
    pages: PG.A3,
    given: [G('Effective flange width', 'f-beff'), graphA1],
    figure: () => <Fig3 />,
    notes: [LF02, 'h = 4 + 20 = 24 in, d = 24 − 4 = 20 in. Self-weight = slab (10 ft strip) + web below the slab.'],
  },
  {
    id: 'rc-2006-07-3a-iii',
    paper: '2006-07',
    sec: 'A',
    no: '3(a)(iii)',
    marks: 15,
    topics: ['rc-tbeam', 'rc-elastic'],
    title: 'T-beam floor: As by WSD (k, j, z formulas given)',
    text:
      `${T_FIG3}\n\n**(iii)** the tensile steel area and select bars for a typical interior beam by WSD method.\n\nNote: Equations for finding k, j, z are given in Fig. 3:` +
      String.raw`
$$k = \frac{n\rho + \tfrac12 (t/d)^2}{n\rho + t/d},\qquad z = \frac{3kd - 2t}{2kd - t}\cdot\frac{t}{3}$$
$$j = \frac{6 - 6\,\tfrac{t}{d} + 2\left(\tfrac{t}{d}\right)^2 + \left(\tfrac{t}{d}\right)^3\tfrac{1}{2\rho n}}{6 - 3\,\tfrac{t}{d}}$$`,
    pages: PG.A3,
    flag: 'WSD design — not in the current slides',
    given: [G('WSD T-beam k, j, z', 'f-wsdT', 'printed in Fig. 3', true), G('Effective flange width', 'f-beff')],
    figure: () => <Fig3 />,
  },
  {
    id: 'rc-2006-07-4a',
    paper: '2006-07',
    sec: 'A',
    no: '4(a)',
    marks: 7,
    topics: ['rc-oneway'],
    title: 'Temperature & shrinkage steel in one-way slabs',
    text: 'Discuss why and how temperature and shrinkage reinforcement is provided in one-way slab. What are the ACI recommended ratios for such steel.',
    pages: PG.A4,
    theory: true,
    given: [G('T&S steel', 'sl-ts')],
    solution: () => <Md>{A_TS}</Md>,
  },
  {
    id: 'rc-2006-07-4b',
    paper: '2006-07',
    sec: 'A',
    no: '4(b)',
    marks: 7,
    topics: ['rc-oneway', 'rc-basics'],
    title: 'Why minimum slab thickness? ACI one-way values',
    text: 'Why is minimum thickness necessary for slabs? Write down minimum thickness for RC one-way slabs for different end conditions as per ACI Code.',
    pages: PG.A4,
    theory: true,
    given: [G('One-way minimum thickness', 'sl-hmin')],
    solution: () => (
      <Md>{String.raw`**Why.** Strength alone would allow very thin slabs, but a thin slab is too flexible:
- large immediate deflection, then creep and shrinkage roughly double it over time;
- cracked partitions and finishes, sagging ceilings, ponding, doors and windows that stick;
- vibration and an uncomfortable, "springy" floor;
- wider cracks. Also not enough room for cover, fire protection and two layers of steel.

ACI therefore gives minimum thicknesses. If $h$ is at least the tabulated value, **deflections need not be calculated** (for members not supporting partitions likely to be damaged by large deflection).

**Minimum thickness $h$, solid one-way slabs** (ACI Table 9.5(a); 7.3.1.1 today; normal-weight concrete, Grade 60):
- Simply supported: **$l/20$**
- One end continuous: **$l/24$**
- Both ends continuous: **$l/28$**
- Cantilever: **$l/10$**

(Beams and ribbed one-way slabs: $l/16$, $l/18.5$, $l/21$, $l/8$.)

**Modifications.**
- $f_y \ne 60$ ksi: multiply by $(0.4 + f_y/100{,}000)$, e.g. × 0.8 for Grade 40.
- Lightweight concrete (90–115 pcf): multiply by $(1.65 - 0.005w_c) \ge 1.09$.
- $l$ = span length (centre to centre of supports, or clear span plus depth if smaller). Round $h$ up to the next ½ in; practical minimum about 4 in.`}</Md>
    ),
  },
  {
    id: 'rc-2006-07-4c',
    paper: '2006-07',
    sec: 'A',
    no: '4(c)',
    marks: 21,
    topics: ['rc-oneway'],
    title: 'Slab on brick walls with a 5 ft cantilever — critical moments and steel',
    text: String.raw`A 6.5 in thick one-way slab is supported on brickwall as shown in Fig. 4. The calculated dead load on the slab is 140 psf (including self weight) and the slab is subjected to a working live load of 80 psf. The live load can occupy any portion on the slab. Calculate the critical design moments and show the necessary reinforcements in sketches. Use USD. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi.`,
    pages: PG.A4f,
    given: [G('T&S steel', 'sl-ts'), G('As per ft for bar spacing', 'm-asft')],
    figure: () => <Fig4 />,
    notes: [
      'Fig. 4: 5′-0″ cantilever (free edge to outer face of the left wall), 10″ wall, 12′-0″ clear span, 10″ wall; slab flush with the outer face of the right wall. Span for the simply supported part taken centre to centre of walls (12′-10″).',
      LF02,
    ],
  },
  // ---------------------------------------------------------------- Section B (Fig. 5 cantilever)
  {
    id: 'rc-2006-07-5',
    paper: '2006-07',
    sec: 'B',
    no: '5',
    marks: 17.5,
    topics: ['rc-elastic'],
    title: 'Cantilever: live load at first cracking',
    text: `${F5}\n\nCompute the value of live load that will produce the first cracking at the face of the column.`,
    pages: PG.B5,
    given: [G('Cracked / uncracked section formulas', 'f-elastic')],
    figure: () => <Fig5 cut={false} />,
    notes: ['Gross section or uncracked transformed section is not specified — show which you use (the transformed section with (n − 1)As gives a slightly larger Mcr).', 'Self-weight = 10 × 20/144 × 0.15 = 0.208 k/ft.'],
  },
  {
    id: 'rc-2006-07-6a',
    paper: '2006-07',
    sec: 'B',
    no: '6(a)',
    marks: 7.5,
    topics: ['rc-singly'],
    title: 'Over-reinforced vs under-reinforced sections',
    text: 'Explain briefly the meaning of overreinforced and underreinforced section.',
    pages: PG.B6,
    theory: true,
    given: [],
    solution: () => (
      <div className="space-y-3">
        <Md>{A_OVER_UNDER}</Md>
        <StrainProfiles />
      </div>
    ),
  },
  {
    id: 'rc-2006-07-6b',
    paper: '2006-07',
    sec: 'B',
    no: '6(b)',
    marks: 10,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Behaviour of the cantilever under increasing live load (stress & strain)',
    text: 'Explain the behaviour of reinforced concrete beam of Fig. 5 under increasing live load. Consider appropriate stress and strain distribution diagram for your explanation.',
    pages: PG.B6f,
    theory: true,
    given: [],
    figure: () => <Fig5 cut={false} />,
    solution: () => (
      <div className="space-y-3">
        <Md>{String.raw`The Fig. 5 beam is a **cantilever**, so the moment is negative: the **top** is in tension (that is why the 3 #8 are at the top) and the bottom is in compression. The critical section is 1–1 at the column face. As the live load grows the section passes through three stages.

**1. Uncracked elastic stage** ($M < M_{cr}$).
- The top-fibre tensile stress is below the modulus of rupture ($f_r = 350$ psi). Concrete carries tension too, and the **whole section** works.
- Strain and stress are both linear (plane sections, Hooke's law). The steel is transformed as $(n - 1)A_s$ with $n = 8$; the steel stress is only $n$ times the adjacent concrete stress — tiny.
- First cracking at the column face when $f_{top} = f_r$, i.e. $M_{cr} = f_r I / y_t$ (this is Q5).

**2. Cracked elastic stage** ($M_{cr} < M \le$ service).
- Flexural cracks open at the top near the column face and run down toward the neutral axis. Concrete below the crack tips (on the tension side) is ignored.
- The neutral axis moves toward the compression (bottom) face, at $kd$ from it. Concrete compressive stress is still linear (up to about $0.5f'_c$), the steel carries all the tension, $f_s = n f_c (d - kd)/kd$. Stiffness drops (cracked $I_{cr}$).
- This is the service / WSD state: limits $f_c \le 0.45f'_c$, $f_s \le 0.4f_y$ (Q7(b)).

**3. Ultimate stage** ($M \to M_n$).
- The concrete stress becomes nonlinear (parabolic), represented by the equivalent block $0.85f'_c$ over $a = \beta_1 c$.
- Here $\rho = 2.37/(10 \times 17.5) = 0.0135$, well below $\rho_b$, so the beam is **under-reinforced**: the top steel **yields first** ($f_s = f_y$, $\varepsilon_s \ge \varepsilon_y$), cracks widen and deflection grows rapidly, the neutral axis moves further toward the bottom face, and finally the bottom concrete **crushes** at $\varepsilon_{cu} = 0.003$ near the column face. Ductile failure with warning, at $M_n = A_s f_y (d - a/2)$ (Q8(b)).`}</Md>
        <ThreeStages tensionTop />
      </div>
    ),
  },
  {
    id: 'rc-2006-07-7a',
    paper: '2006-07',
    sec: 'B',
    no: '7(a)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Reasons for minimum cover',
    text: 'Give reasons for the minimum cover requirements in the ACI Code.',
    pages: PG.B7,
    theory: true,
    given: [G('Cover & spacing rules', 'm-cover')],
    solution: () => <Md>{A_COVER}</Md>,
  },
  {
    id: 'rc-2006-07-7b',
    paper: '2006-07',
    sec: 'B',
    no: '7(b)',
    marks: 12.5,
    topics: ['rc-elastic'],
    title: 'Cantilever: allowable live load (0.45f′c, 0.4fy)',
    text: String.raw`${F5}

Compute the value of live load that can be applied on the beam of Fig. 5 without stressing the concrete beyond $0.45f'_c$ or the steel above $0.4f_y$.`,
    pages: PG.B7f,
    given: [G('Cracked / uncracked section formulas', 'f-elastic'), G('WSD allowable stresses', 'f-wsd')],
    figure: () => <Fig5 cut={false} />,
  },
  {
    id: 'rc-2006-07-8a',
    paper: '2006-07',
    sec: 'B',
    no: '8(a)',
    marks: 5.5,
    topics: ['rc-basics'],
    title: 'Reasons for minimum bar spacing',
    text: 'Give reasons for the minimum bar spacing requirements in the ACI code.',
    pages: PG.B7,
    theory: true,
    given: [G('Cover & spacing rules', 'm-cover')],
    solution: () => (
      <Md>{String.raw`**Reasons for a minimum clear spacing between bars**
- **Placing concrete:** the coarse aggregate must pass between the bars so the concrete flows around and below them and fills the forms completely, with no honeycombing or voids. There must also be room for an internal vibrator.
- **Bond:** each bar needs enough concrete around it to develop its bond stress. Bars too close together create a weak plane through the row and fail by **splitting** along that plane (development length rises as spacing falls).
- **Load transfer:** the concrete between bars must transfer forces into the bars without crushing.

**ACI rules (beams)**
- Clear spacing between parallel bars in a layer $\ge d_b$, $\ge 1$ in, and $\ge \tfrac43$ × maximum aggregate size.
- Bars in two or more layers: upper bars directly above the lower ones, clear distance between layers $\ge 1$ in.
- Columns: clear spacing between longitudinal bars $\ge 1.5d_b$ and $\ge 1.5$ in.
- The same limits apply to the clear distance between lap splices and adjacent bars.

**Maximum spacing (the other side of the rule):** for crack control, beam bars are spaced at most $s = 15(40{,}000/f_s) - 2.5c_c \le 12(40{,}000/f_s)$; slab main bars $\le 3h$ and 18 in; T&S bars $\le 5h$ and 18 in.`}</Md>
    ),
  },
  {
    id: 'rc-2006-07-8b',
    paper: '2006-07',
    sec: 'B',
    no: '8(b)',
    marks: 12,
    topics: ['rc-singly'],
    title: 'Cantilever: design ultimate strength and the corresponding live load',
    text: `${F5}\n\nCompute the design ultimate strength of the beam section shown in Fig. 5 and hence calculate the value of live load which will produce such stress conditions in concrete and steel of the beam.`,
    pages: PG.B7f,
    given: [graphA1, G('φ factors and φ–εt chart', 'm-phi')],
    figure: () => <Fig5 cut={false} />,
    notes: [LF02, 'Ambiguous whether the live load is back-figured with load factors (wu L²/2 = φMn) or as the actual load at which the section reaches Mn. Show the factored reading; mention the other.'],
  },
  {
    id: 'rc-2006-07-9a',
    paper: '2006-07',
    sec: 'B',
    no: '9(a)',
    marks: 17.5,
    topics: ['rc-shear'],
    title: 'Cantilever: where are stirrups needed? Design them (LL 2 k/ft)',
    text: String.raw`${F5}

If the beam of Fig. 5 carries a live load of 2 k/ft (unfactored) for what part of the beam is web reinforcement required? Design the shear reinforcement, basing $V_c$ on approximate method. Follow USD method.`,
    pages: PG.B7f,
    given: [G('Vc and limits', 's-vc'), G('Case A–D table', 's-cases')],
    figure: () => <Fig5 cut={false} />,
    notes: [LF02, 'Approximate method: Vc = 2√f′c bw d. Stirrup size not given: #3 two-legged (Av = 0.22 in²). Critical section at d from the column face.'],
  },
  {
    id: 'rc-2006-07-10a',
    paper: '2006-07',
    sec: 'B',
    no: '10(a)',
    marks: 6,
    topics: ['rc-singly'],
    title: "'Secondary compression failure' in a beam",
    text: "Explain briefly the 'Secondary Compression Failure' in a beam.",
    pages: PG.B7,
    theory: true,
    given: [],
    solution: () => (
      <div className="space-y-3">
        <Md>{String.raw`**Secondary compression failure** is how an **under-reinforced** beam ($\rho < \rho_b$) finally fails in flexure.
1. As the load increases, the tension steel reaches $f_y$ first. This is the *primary* event: tension (yield) failure begins while the concrete stress is still below its capacity.
2. With a little more load the steel stretches at constant stress along its yield plateau. Cracks widen and climb toward the compression face, and the **neutral axis rises**, so the compression zone gets shallower.
3. The same compressive force $C = T = A_s f_y$ now acts on a smaller area, so the concrete strain at the top grows quickly. When it reaches about 0.003 the concrete **crushes**. This crushing, which comes *after* the steel has yielded, is the **secondary compression failure**.

**Character:** ductile — large deflection and wide cracks give clear warning before collapse. The strength is governed by the steel, $M_n = A_s f_y (d - a/2)$.

**Contrast:** in an over-reinforced beam the concrete crushes **before** the steel yields (*primary compression failure*): sudden and brittle, with no warning.`}</Md>
        <StrainProfiles />
      </div>
    ),
  },
  {
    id: 'rc-2006-07-10b',
    paper: '2006-07',
    sec: 'B',
    no: '10(b)',
    marks: 11.5,
    topics: ['rc-bond'],
    title: 'Anchorage of the cantilever top bars in the column — straight or hooked?',
    text: String.raw`${F5}

If the column material strengths are $f_y = 60$ ksi and $f'_c = 5.0$ ksi, check to see if adequate embedment can be provided within the column (shown in Fig. 5) without hooks. If hooks are required, specify detailed dimensions. Simplified equation for development length calculation can be considered in this case. Assume the steel at column face is stressed to $f_y$.`,
    pages: PG.B7f,
    given: [G('ld simplified + general', 'b-ld'), G('ψ factors', 'b-psi'), G('Hook ldh', 'b-hook')],
    figure: () => <Fig5 cut={false} />,
    notes: ['#8 top bars (more than 12 in of concrete below in the 20 in beam → ψt = 1.3). Cover in the column not given: assume 1.5 in clear to the far face plus ties.'],
  },
  {
    id: 'rc-2006-07-11a',
    paper: '2006-07',
    sec: 'B',
    no: '11(a)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Why φ differs for different cases',
    text: "Why strength reduction factor 'φ' used in the ACI code are different for different cases? Explain very briefly.",
    pages: PG.B7,
    theory: true,
    given: [G('φ factors and φ–εt chart', 'm-phi')],
    solution: () => <Md>{A_PHI_WHY}</Md>,
  },
  {
    id: 'rc-2006-07-11b',
    paper: '2006-07',
    sec: 'B',
    no: '11(b)',
    marks: 12.5,
    topics: ['rc-bond'],
    title: 'Cantilever: cut-off point of the centre bar + embedment checks',
    text: `${F5}\n\nIf the beam of Fig. 5 carries a live load of 2.0 k/ft (unfactored), calculate the point where the centre bar can be discontinued. Check to be sure that adequate embedded length is provided for continued and discontinued bars.`,
    pages: PG.B7f,
    given: [G('Cut-off rules', 'b-cutoff'), G('ld simplified + general', 'b-ld'), G('ψ factors', 'b-psi')],
    figure: () => <Fig5 />,
    notes: [LF02],
  },
  {
    id: 'rc-2006-07-12a',
    paper: '2006-07',
    sec: 'B',
    no: '12(a)',
    marks: 6,
    topics: ['rc-singly'],
    title: 'Is the Fig. 5 section balanced? If not, how to make it so?',
    text: `${F5}\n\nDo you think, the section of Fig. 5 is a balanced section? If not how will you make it a balanced section?`,
    pages: PG.B7f,
    given: [G('ρ limits (Table A.4)', 'f-rho')],
    figure: () => <Fig5 cut={false} />,
    notes: ['The printed word "such" is struck out and replaced in pencil by a student; read as "balanced section".'],
  },
  {
    id: 'rc-2006-07-12b',
    paper: '2006-07',
    sec: 'B',
    no: '12(b)',
    marks: 12.5,
    topics: ['rc-doubly'],
    title: 'Cantilever made doubly reinforced (2 #6 in compression) — As and live load',
    text: `${F5}\n\nTo carry more live load (more than the beam can carry as a single reinforced) the beam of Fig. 1 needs to be designed as a doubly reinforced beam and accordingly 2-#6 bar is provided in compression zone of the beam for this purpose. Calculate the reinforcement in tension zone (at sec 1-1) and the live load that can be applied on the beam under such condition. Follow any method.`,
    pages: PG.B7f,
    given: [G('Stress block & β1', 'f-block'), G('ρ limits (Table A.4)', 'f-rho')],
    figure: () => <Fig5 cut={false} />,
    notes: [
      'The paper says "beam of Fig. 1" but section 1-1 exists only in Fig. 5 (Fig. 1 is the Section A simple span): read as Fig. 5.',
      'd′ for the 2 #6 (bottom, compression side) not given: take 2.5 in. Open-ended: choose As, e.g. (ρ − ρ′) at the code maximum.',
      'Q12 prints 6 + 12½ = 18½ marks (other Section B questions are 17½).',
    ],
  },
]

// ================================================================ numerical solutions (engines)
type SolPart = Pick<RcQ, 'checks' | 'solution'>
const FT = (v: number, d = 2) => f(v, d)

// ---- Q1(c) fixed 12 x 30 beam, 28 ft
const q1 = (() => {
  const sw = selfWeight(12, 30)
  const wD = 0.8 + sw
  const w = wD + 1.0
  const M = (w * 28 * 28) / 8
  const dW = 26.5
  const W = wsdDoublyDesign(M, 12, dW, 2.5, 9, 1.35, 20)
  const tW = pickDoubly(W.As, 12)
  const cW = pickDoubly(W.Asp, 12, [5, 6, 7, 8, 9], 1)
  const L = beamLoads({ span: 28, support: 'ss', b: 12, h: 30, sdl: 0.8, ll: 1.0 })
  const D = designAs(L.Mu, 12, 27.5, 3000, 40000)
  const bU = pickSingly(D.As, 12)
  const dU = bU.layers === 2 ? 26.5 : 27.5
  const R = review({ b: 12, fc: 3000, fy: 40000, layers: [{ As: bU.As, d: dU }] })
  return { sw, wD, w, M, dW, W, tW, cW, L, D, bU, dU, R }
})()

// ---- Q2(c)
const q2in = (As: number, dt: number): DoublyReviewIn => ({ b: 12, d: 25, dt, dp: 2.5, As, Asp: 2 * 0.79, fc: 3, fy: 60 })
const q2 = [q2in(3 * 1.0, 25), q2in(6 * 1.0, 26.5)].map((p) => ({ p, r: reviewDoubly(p) }))

// ---- Q3 T-beam floor
const q3 = (() => {
  const B = effectiveWidth({ kind: 'interior', L: 25, bw: 12, hf: 4, cc: 120, rule: 'aci08' })
  const B14 = effectiveWidth({ kind: 'interior', L: 25, bw: 12, hf: 4, cc: 120, rule: 'aci14' })
  const FL = floorLoads({ hf: 4, spacing: 10, bw: 12, h: 24, sdl: 75, ll: 100 })
  const Mu = (FL.wu * 25 * 25) / 8
  const tin: TDesignIn = { Mu, beff: B.b, bw: 12, hf: 4, d: 20, fc: 3, fy: 60 }
  const TD = designT(tin)
  const bars = pickDoubly(TD.As, 12)
  const RT = reviewT({ beff: B.b, bw: 12, hf: 4, d: 20, As: bars.A, fc: 3, fy: 60 })
  const M = ((FL.wD + FL.wL) * 25 * 25) / 8
  const win = { M, beff: B.b, hf: 4, d: 20, n: 9, fcAllow: 1.35, fsAllow: 24 }
  const WT = wsdTDesign(win)
  const wbars = pickDoubly(WT.As, 12)
  return { B, B14, FL, Mu, tin, TD, bars, RT, M, win, WT, wbars }
})()

// ---- Q4(c) slab
const q4 = cantSlab({ span: 12, support: 10, cantL: 5, cantR: 0, ll: 80, dlTotal: 140, fc: 3000, fy: 60000, h: 6.5 })

// ---- Section B cantilever
const SW5 = selfWeight(10, 20)
const SEC5 = { b: 10, h: 20, d: 17.5, As: 3 * 0.79, fc: 4000 }
const q5 = (() => {
  const U = uncracked({ ...SEC5, n: 8, frPsi: 350 })
  const w = (2 * U.Mcr) / 100
  const wg = (2 * U.McrG) / 100
  return { U, w, LL: w - SW5, LLg: wg - SW5 }
})()
const q7 = (() => {
  const A = allowableMoment({ ...SEC5, n: 8 }, 1.8, 24)
  const w = (2 * A.M) / 100
  return { A, w, LL: w - SW5 }
})()
const q8 = (() => {
  const R = review({ b: 10, fc: 4000, fy: 60000, layers: [{ As: SEC5.As, d: 17.5 }] })
  const wu = (2 * R.phiMn) / 100
  const LL = (wu - 1.2 * SW5) / 1.6
  const LLn = (2 * R.Mn) / 100 - SW5
  return { R, wu, LL, LLn }
})()
const SEC9: ShearSection = { bw: 10, d: 17.5, fc: 4000, fy: 60000 }
const q9 = designShear({ kind: 'cant', L: 10, wL: 2, selfWeight: { b: 10, h: 20 } }, SEC9)
const b8 = bar('#8')
const geo5 = beamBarGeometry({ b: 10, cover: 1.5, ds: 0.375, db: b8.db, n: 3 })
const case5 = simplifiedCase({ db: b8.db, clearSpacing: geo5.clearSpacing, clearCover: geo5.clearCover, stirrupsMin: true })
const q10 = (() => {
  const ld = ldSimplified({ db: b8.db, small: false, fc: 5000, fy: 60000, met: case5.met, psiT: 1.3 })
  const lh = ldhCalc({ db: b8.db, fc: 5000, fy: 60000 })
  const lh7 = ldhCalc({ db: b8.db, fc: 5000, fy: 60000, psiC: 0.7 })
  const hg = hookGeometry(8, b8.db)
  const ca = columnAnchorage({ colDepth: 20, backCover: 2, ldStraight: ld.final, ldh: lh.final })
  return { ld, lh, lh7, hg, ca }
})()
const q11 = (() => {
  const wu = 1.2 * SW5 + 1.6 * 2
  const ld = ldSimplified({ db: b8.db, small: false, fc: 4000, fy: 60000, met: case5.met, psiT: 1.3 })
  const C = cutoff({ dg: { kind: 'cant', L: 10, wu, P: 0 }, b: 10, d: 17.5, fc: 4000, fy: 60000, bar: b8, nTotal: 3, nCut: 1, ld: ld.final, endEmbed: 2 })
  return { wu, ld, C }
})()
const q12a = (() => {
  const Lm = limits(4000, 60000)
  const rho = SEC5.As / (10 * 17.5)
  return { Lm, rho, AsBal: Lm.rhoB * 10 * 17.5, AsMax: Lm.rhoMax * 10 * 17.5 }
})()
const q12b = (() => {
  const Asp = 2 * 0.44
  const sm = singlyMax(10, 17.5, 17.5, 4, 60)
  const epsSp = (0.003 * (sm.c - 2.5)) / sm.c
  const fsp = Math.min(60, 29000 * epsSp)
  const As2 = (Asp * fsp) / 60
  const AsReq = sm.As1 + As2
  const n = Math.ceil(AsReq / 0.79 - 1e-9)
  const n2 = Math.max(0, n - 3)
  const dTop = (3 * 2.5 + n2 * 4.5) / n // centroid from the tension (top) face
  const p: DoublyReviewIn = { b: 10, d: 20 - dTop, dt: 17.5, dp: 2.5, As: n * 0.79, Asp, fc: 4, fy: 60 }
  const r = reviewDoubly(p)
  const LL = ((2 * r.phiMn) / 100 - 1.2 * SW5) / 1.6
  return { Asp, sm, epsSp, fsp, As2, AsReq, n, n2, p, r, LL, single: q8.LL }
})()

const SOL: Record<string, SolPart> = {
  'rc-2006-07-1c-i': {
    checks: () => [ck('M', 'Service moment M (incl. self-weight)', q1.M, 'k-ft'), ck('M1', 'Moment the 12×30 can take without compression steel', q1.W.M1, 'k-ft'), ck('Asp', "Compression steel A′s", q1.W.Asp, 'in²', 0.04), ck('As', 'Tension steel As', q1.W.As, 'in²', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Service load', tex: `w_{sw} = \\frac{12\\times30}{144}(0.150) = ${FT(q1.sw, 3)}\\text{ k/ft},\\quad w = 0.8 + ${FT(q1.sw, 3)} + 1.0 = ${FT(q1.w, 3)}\\text{ k/ft}` },
          { t: 'Service moment', tex: `M = \\frac{wL^2}{8} = \\frac{${FT(q1.w, 3)}\\times28^2}{8} = ${FT(q1.M, 1)}\\text{ k-ft}` },
          { t: 'Effective depth', md: `Two layers of tension bars will be needed in a 12 in width, so $d = 30 - 3.5 = ${q1.dW}$ in; $d' = 2.5$ in. Allowables $f_c = 0.45(3) = 1.35$ ksi, $f_s = 20$ ksi, $n = 9$.` },
          ...q1.W.steps,
        ]}
        end={`$M = ${FT(q1.M, 1)}$ k-ft $>$ $M_1 = ${FT(q1.W.M1, 1)}$ k-ft, so the fixed 12″×30″ section **needs compression steel** (this is why Q1(b) asks about 2n). Provide **tension ${q1.tW.n} #${q1.tW.no}** (${FT(q1.tW.A)} in², ${q1.tW.layers} layer${q1.tW.layers > 1 ? 's' : ''}) and **compression ${q1.cW.n} #${q1.cW.no}** (${FT(q1.cW.A)} in²).`}
      />
    ),
  },
  'rc-2006-07-1c-ii': {
    checks: () => [ck('Mu', 'Factored moment Mu', q1.L.Mu, 'k-ft'), ck('As', 'Required As', q1.D.As, 'in²', 0.03), ck('phiMn', 'φMn of the bars provided', q1.R.phiMn, 'k-ft')],
    solution: () => (
      <Sol
        steps={[
          ...q1.L.steps,
          { t: 'Effective depth', md: 'One layer assumed: $d = 30 - 2.5 = 27.5$ in. $f\'_c = 3000$ psi, $f_y = 40{,}000$ psi.' },
          ...q1.D.steps,
          { t: 'Bars', md: `${q1.bU.n} #${q1.bU.bar} = ${FT(q1.bU.As)} in² (${q1.bU.layers === 1 ? `one layer, needs $b \\ge ${FT(q1.bU.bmin)}$ in` : 'two layers, d = 26.5 in'}).` },
          ...q1.R.steps,
        ]}
        end={`USD: singly reinforced is enough — **${q1.bU.n} #${q1.bU.bar}**, $\\phi M_n = ${FT(q1.R.phiMn, 1)}$ k-ft $\\ge M_u = ${FT(q1.L.Mu, 1)}$ k-ft. Compare WSD, which needed compression steel for the same beam: USD uses the real (plastic) capacity of the concrete.`}
      />
    ),
  },
  ...Object.fromEntries(
    q2.map(({ p, r }, i) => [
      i === 0 ? 'rc-2006-07-2c-i' : 'rc-2006-07-2c-ii',
      {
        checks: () => [ck('c', 'Neutral axis depth c', r.c, 'in'), ck('fsp', "Stress in compression steel f′s", r.fsp, 'ksi'), ck('phi', 'φ', r.phi, '', 0.01), ck('phiMn', 'Design moment φMn', r.phiMn, 'k-ft')],
        solution: () => (
          <Sol
            steps={doublySteps(p, r)}
            end={`Compression steel **${r.compYields ? 'yields' : `does not yield ($f'_s = ${FT(r.fsp, 1)}$ ksi)`}**; $\\varepsilon_t = ${FT(r.epsT, 5)}$ → ${r.zone}, $\\phi = ${FT(r.phi, 3)}$. **$\\phi M_n = ${FT(r.phiMn, 1)}$ k-ft.**`}
          />
        ),
      } as SolPart,
    ]),
  ),
  'rc-2006-07-3a-i': {
    checks: () => [ck('beff', 'Effective flange width', q3.B.b, 'in')],
    solution: () => (
      <Sol
        steps={[
          { t: 'Interior T-beam (ACI 318-02)', tex: q3.B.cands.map((c) => `${c.label} = ${FT(c.value, 1)}`).join(',\\quad ') + `\\ \\text{in}`, md: 'Span/4 = 25 × 12/4 = 75 in; 16hf + bw = 16(4) + 12 = 76 in; c/c spacing = 120 in.' },
          { t: 'Current slides (ACI 318-14)', md: `Overhang ≤ L/8 each side: ${q3.B14.cands.map((c) => `$${c.label} = ${FT(c.value, 1)}$`).join(', ')} → ${FT(q3.B14.b, 1)} in.` },
        ]}
        end={`$b_{eff} = ${FT(q3.B.b, 1)}$ in (ACI 2002, the code of this paper; ${FT(q3.B14.b, 1)} in by the newer rule).`}
      />
    ),
  },
  'rc-2006-07-3a-ii': {
    checks: () => [ck('wu', 'Factored load per beam wu', q3.FL.wu, 'k/ft'), ck('Mu', 'Mu', q3.Mu, 'k-ft'), ck('As', 'Required As', q3.TD.As, 'in²', 0.03)],
    solution: () => (
      <Sol
        steps={[
          {
            t: 'Loads on one interior beam (10 ft strip)',
            tex: `w_D = \\underbrace{${FT(q3.FL.slab, 3)}}_{\\text{slab}} + \\underbrace{${FT(q3.FL.web, 3)}}_{\\text{web } 12\\times20} + \\underbrace{${FT(q3.FL.sdl, 3)}}_{75\\text{ psf}} = ${FT(q3.FL.wD, 3)}\\text{ k/ft},\\quad w_L = ${FT(q3.FL.wL, 3)}\\text{ k/ft}`,
          },
          { t: 'Factored moment', tex: `w_u = 1.2(${FT(q3.FL.wD, 3)}) + 1.6(${FT(q3.FL.wL, 3)}) = ${FT(q3.FL.wu, 3)}\\text{ k/ft},\\quad M_u = \\frac{w_uL^2}{8} = \\frac{${FT(q3.FL.wu, 3)}(25)^2}{8} = ${FT(q3.Mu, 1)}\\text{ k-ft}` },
          { t: 'Section', md: `$b_{eff} = ${FT(q3.B.b)}$ in (part i), $b_w = 12$ in, $h_f = 4$ in, $d = 24 - 4 = 20$ in.` },
          ...tDesignSteps(q3.tin, q3.TD),
          { t: 'Bars and check', md: `${q3.bars.n} #${q3.bars.no} = ${FT(q3.bars.A)} in² (${q3.bars.layers} layer${q3.bars.layers > 1 ? 's' : ''}); review: $\\phi M_n = ${FT(q3.RT.phiMn, 1)}$ k-ft ≥ $M_u$ ✓.` },
        ]}
        end={`$A_s = ${FT(q3.TD.As)}$ in² → **${q3.bars.n} #${q3.bars.no}**. ${q3.TD.rect ? 'The stress block stays in the flange (rectangular behaviour).' : 'True T-beam action.'}`}
      />
    ),
  },
  'rc-2006-07-3a-iii': {
    checks: () => [ck('M', 'Service moment M', q3.M, 'k-ft'), ck('kd', 'Neutral axis kd', q3.WT.sec.kd, 'in'), ck('As', 'Required As (WSD)', q3.WT.As, 'in²', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Service moment', tex: `w = w_D + w_L = ${FT(q3.FL.wD, 3)} + ${FT(q3.FL.wL, 3)} = ${FT(q3.FL.wD + q3.FL.wL, 3)}\\text{ k/ft},\\quad M = \\frac{wL^2}{8} = ${FT(q3.M, 1)}\\text{ k-ft}` },
          ...wsdTSteps(q3.win, q3.WT),
          { t: 'Bars', md: `${q3.wbars.n} #${q3.wbars.no} = ${FT(q3.wbars.A)} in².` },
        ]}
        end={`WSD: $A_s = ${FT(q3.WT.As)}$ in² → **${q3.wbars.n} #${q3.wbars.no}** (USD needed ${FT(q3.TD.As)} in²). Concrete stress ${FT(q3.WT.fcAct, 3)} ksi ≤ 1.35 ksi.`}
      />
    ),
  },
  'rc-2006-07-4c': {
    checks: () => [ck('wu', 'Factored load wu', q4.loads.wu, 'psf'), ck('Mneg', 'Max −Mu at the left wall', q4.Mneg, 'k-ft/ft'), ck('Mpos', 'Max +Mu in the span', q4.Mpos, 'k-ft/ft'), ck('s', 'Bottom bar spacing', q4.pos.s, 'in', 0.05)],
    solution: () => (
      <Sol steps={cantSlabSteps(q4, 'Load factors 1.2D + 1.6L (ACI 318-02).')} end={`Critical moments: $M_u^- = ${FT(q4.Mneg)}$ k-ft/ft over the left wall, $M_u^+ = ${FT(q4.Mpos)}$ k-ft/ft in the span. Right end on the brick wall: simply supported (provide nominal top bars ≈ 0.15L to control cracking).`}>
        <SlabSketch r={q4} />
      </Sol>
    ),
  },
  'rc-2006-07-5': {
    checks: () => [ck('Mcr', 'Cracking moment (uncracked transformed section)', q5.U.Mcr, 'k-ft'), ck('LL', 'Live load at first cracking', q5.LL, 'k/ft')],
    solution: () => (
      <Sol
        steps={[
          { t: 'Section', md: 'Cantilever: tension at the top. Distances below are measured from the compression (bottom) face, so the 3 #8 sit at $d = 17.5$ in. $f_r = 350$ psi and $n = 8$ as given.' },
          ...q5.U.steps,
          { t: 'Load at cracking', tex: `M_{cr} = \\frac{wL^2}{2} \\Rightarrow w = \\frac{2M_{cr}}{L^2} = \\frac{2(${FT(q5.U.Mcr)})}{10^2} = ${FT(q5.w, 3)}\\text{ k/ft}` },
          { t: 'Subtract self-weight', tex: `w_{sw} = \\frac{10\\times20}{144}(0.15) = ${FT(SW5, 3)}\\text{ k/ft},\\quad LL = ${FT(q5.w, 3)} - ${FT(SW5, 3)} = ${FT(q5.LL, 3)}\\text{ k/ft}` },
        ]}
        end={`First cracking at the column face under **LL ≈ ${FT(q5.LL, 3)} k/ft** (gross section, steel ignored: ${FT(q5.LLg, 3)} k/ft).`}
      />
    ),
  },
  'rc-2006-07-7b': {
    checks: () => [ck('kd', 'Cracked neutral axis kd', q7.A.kd, 'in'), ck('M', 'Allowable moment', q7.A.M, 'k-ft'), ck('LL', 'Allowable live load', q7.LL, 'k/ft')],
    solution: () => (
      <Sol
        steps={[
          { t: 'Allowables', md: "$f_c = 0.45(4000) = 1800$ psi, $f_s = 0.4(60{,}000) = 24{,}000$ psi, $n = 8$; cracked transformed section (d measured from the bottom = compression face)." },
          ...q7.A.steps,
          { t: 'Load', tex: `w = \\frac{2M}{L^2} = \\frac{2(${FT(q7.A.M, 1)})}{100} = ${FT(q7.w, 3)}\\text{ k/ft},\\quad LL = ${FT(q7.w, 3)} - ${FT(SW5, 3)} = ${FT(q7.LL, 3)}\\text{ k/ft}` },
        ]}
        end={`Allowable **LL = ${FT(q7.LL, 3)} k/ft** (${q7.A.governs} governs).`}
      />
    ),
  },
  'rc-2006-07-8b': {
    checks: () => [ck('phiMn', 'Design strength φMn', q8.R.phiMn, 'k-ft'), ck('LL', 'Live load (wu L²/2 = φMn, 1.2D + 1.6L)', q8.LL, 'k/ft')],
    solution: () => (
      <Sol
        steps={[
          ...q8.R.steps,
          { t: 'Live load that uses the full design strength', tex: `\\frac{w_uL^2}{2} = \\phi M_n \\Rightarrow w_u = \\frac{2(${FT(q8.R.phiMn, 1)})}{100} = ${FT(q8.wu, 3)}\\text{ k/ft} = 1.2(${FT(SW5, 3)}) + 1.6\\,LL \\Rightarrow LL = ${FT(q8.LL, 3)}\\text{ k/ft}` },
          { t: 'Other reading', md: `Actual (unfactored) load at which the section reaches $M_n$: $w = 2M_n/L^2 = ${FT((2 * q8.R.Mn) / 100, 3)}$ k/ft → LL = ${FT(q8.LLn, 3)} k/ft.` },
        ]}
        end={`$\\phi M_n = ${FT(q8.R.phiMn, 1)}$ k-ft; safe service **LL = ${FT(q8.LL, 3)} k/ft** (the beam actually fails at about ${FT(q8.LLn, 2)} k/ft).`}
      />
    ),
  },
  'rc-2006-07-9a': {
    checks: () => [ck('Vf', 'Vu at the column face', q9.runs[0].Vface, 'k'), ck('Vd', 'Vu at d', q9.runs[0].Vd, 'k'), ck('phiVc', 'φVc', q9.lim.phiVc, 'k'), ck('x', 'Stirrups needed up to (ft from the face)', q9.runs[0].uReqEnd / 12, 'ft', 0.03)],
    solution: () => (
      <ShearSol
        D={q9}
        sec={SEC9}
        pre={[{ t: 'Factored load', tex: `w_u = 1.2(${FT(SW5, 3)}) + 1.6(2.0) = ${FT(q9.dg.wu, 3)}\\text{ k/ft},\\quad V_u(x) = w_u(10 - x)`, md: 'Critical section at d = 17.5 in from the column face (column support, load on top).' }]}
        end={`Web reinforcement is required from the column face to **${FT(q9.runs[0].uReqEnd / 12, 2)} ft** (beyond that $V_u \\le \\tfrac12\\phi V_c$). #3 two-legged stirrups: **1 @ ${FT(q9.layouts.c.first)} in, ${q9.layouts.c.zones.map((z) => `${z.n} @ ${FT(z.s)} in`).join(', ')}** (s = d/2 governs).`}
      />
    ),
  },
  'rc-2006-07-10b': {
    checks: () => [ck('ld', 'Straight development length ld (top bar)', q10.ld.final, 'in', 0.03), ck('ldh', 'Hook development length ldh', q10.lh.final, 'in', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Bar spacing and cover (beam 10 in, 3 #8, #3 stirrups)', md: `Clear spacing ${FT(geo5.clearSpacing)} in, clear cover ${FT(geo5.clearCover)} in → ${case5.why}.` },
          { t: 'Straight bar (simplified, #7 and larger)', tex: `\\ell_d = \\frac{f_y\\psi_t\\psi_e}{20\\lambda\\sqrt{f'_c}}d_b = \\frac{60{,}000(1.3)(1.0)}{20\\sqrt{5000}}(1.0) = ${FT(q10.ld.final, 1)}\\text{ in}`, md: 'ψt = 1.3: top bars with more than 12 in of concrete below.' },
          { t: 'Available in the column', tex: `20 - 2\\ (\\text{cover}) = ${FT(q10.ca.available)}\\text{ in}\\ ${q10.ca.straightOK ? '\\ge' : '<'}\\ ${FT(q10.ld.final, 1)}`, md: q10.ca.straightOK ? 'Straight embedment is enough.' : '**Not enough — hooks are required.**' },
          { t: 'Standard 90° hook', tex: `\\ell_{dh} = \\frac{f_y\\psi_e\\psi_c\\psi_r}{50\\lambda\\sqrt{f'_c}}d_b = \\frac{60{,}000}{50\\sqrt{5000}}(1.0) = ${FT(q10.lh.final, 1)}\\text{ in} \\ge 8d_b, 6\\text{ in}`, md: `With side cover ≥ 2.5 in and tail cover ≥ 2 in, ψc = 0.7 → ${FT(q10.lh7.final, 1)} in. Available ${FT(q10.ca.available)} in ${q10.ca.hookOK ? '≥' : '<'} ${FT(q10.lh.final, 1)} in ${q10.ca.hookOK ? '✓' : '✗'}.` },
          { t: 'Hook geometry', md: `Inside bend diameter $${q10.hg.Dk}d_b = ${FT(q10.hg.D)}$ in; straight tail $12d_b = ${FT(q10.hg.tail)}$ in turned down into the column; the hook sits against the far face, inside the column ties.` },
        ]}
        end={`Straight bars need ${FT(q10.ld.final, 1)} in > ${FT(q10.ca.available)} in available → **use standard 90° hooks**: $\\ell_{dh} = ${FT(q10.lh.final, 1)}$ in (≤ ${FT(q10.ca.available)} in ✓), bend diameter ${FT(q10.hg.D)} in, tail ${FT(q10.hg.tail)} in.`}
      />
    ),
  },
  'rc-2006-07-11b': {
    checks: () => [ck('xTheo', 'Theoretical cut-off of the centre bar (ft from the face)', q11.C.xTheo, 'ft', 0.03), ck('xCut', 'Actual cut-off point (ft from the face)', q11.C.xCut, 'ft', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Factored load and moment', tex: `w_u = 1.2(${FT(SW5, 3)}) + 1.6(2) = ${FT(q11.wu, 3)}\\text{ k/ft},\\quad M_u(\\text{face}) = \\frac{w_uL^2}{2} = ${FT(q11.C.Mmax, 1)}\\text{ k-ft}` },
          { t: 'Capacities', tex: `\\phi M_n(3\\#8) = ${FT(q11.C.all.phiMn, 1)}\\text{ k-ft},\\quad \\phi M_n(2\\#8) = ${FT(q11.C.remain.phiMn, 1)}\\text{ k-ft}`, md: q11.C.adequate ? undefined : `Note: with 1.2D + 1.6L the 3 #8 give ${FT(q11.C.all.phiMn, 1)} < ${FT(q11.C.Mmax, 1)} k-ft (about ${FT((q11.C.Mmax / q11.C.all.phiMn - 1) * 100, 0)}% short — see Q8(b)); the cut-off is located the same way.` },
          { t: 'Theoretical cut-off', tex: `\\frac{w_u a^2}{2} = ${FT(q11.C.remain.phiMn, 1)} \\Rightarrow a = ${FT(10 - q11.C.xTheo)}\\text{ ft from the tip} \\Rightarrow x = ${FT(q11.C.xTheo)}\\text{ ft from the face}` },
          { t: 'Extend past it', tex: `\\max(d, 12d_b) = \\max(17.5, 12) = ${FT(q11.C.ext)}\\text{ in} \\Rightarrow x = ${FT(q11.C.xExt)}\\text{ ft}` },
          { t: 'Development of the cut bar', tex: `\\ell_d = \\frac{60{,}000(1.3)}{20\\sqrt{4000}}(1.0) = ${FT(q11.ld.final, 1)}\\text{ in} = ${FT(q11.ld.final / 12)}\\text{ ft from the face (point of max stress)}`, md: q11.C.ldGoverns ? 'ld governs over the extension rule.' : 'The extension rule governs.' },
          { t: 'Continuing 2 #8', md: `Length available beyond the theoretical cut-off to the tip (less 2 in cover) = ${FT(q11.C.availCont, 1)} in ${q11.C.contOK ? '≥' : '<'} ld = ${FT(q11.ld.final, 1)} in ${q11.C.contOK ? '✓' : '✗ — hook or bend the bars down at the free end'}. At the column all three bars are anchored by the standard hooks of Q10(b).` },
        ]}
        end={`Stop the centre #8 at **${FT(q11.C.xCut, 2)} ft** from the column face (say ${Math.ceil(q11.C.xCut * 2) / 2} ft).`}
      />
    ),
  },
  'rc-2006-07-12a': {
    checks: () => [ck('rho', 'ρ provided', q12a.rho, '', 0.01), ck('rhob', 'ρb', q12a.Lm.rhoB, '', 0.01)],
    solution: () => (
      <Sol
        steps={[{ t: 'Steel ratio', tex: `\\rho = \\frac{2.37}{10\\times17.5} = ${FT(q12a.rho, 5)}` }, ...q12a.Lm.steps.slice(0, 3)]}
        end={`$\\rho = ${FT(q12a.rho, 4)} < \\rho_b = ${FT(q12a.Lm.rhoB, 4)}$: **not balanced — under-reinforced**. It would become balanced with $A_s = \\rho_b bd = ${FT(q12a.AsBal)}$ in² (or by reducing d until $\\rho = \\rho_b$). The code does not allow that: a beam must keep $\\varepsilon_t \\ge 0.004$, i.e. $A_s \\le \\rho_{max}bd = ${FT(q12a.AsMax)}$ in²; to carry more, add compression steel (Q12(b)).`}
      />
    ),
  },
  'rc-2006-07-12b': {
    checks: () => [ck('As', 'Tension steel required', q12b.AsReq, 'in²', 0.03), ck('phiMn', 'φMn of the doubly reinforced section', q12b.r.phiMn, 'k-ft'), ck('LL', 'Live load', q12b.LL, 'k/ft')],
    solution: () => (
      <Sol
        steps={[
          { t: 'Method', md: "USD. Take the singly part at the tension-controlled limit $\\rho_{0.005}$, then the 2 #6 ($A'_s = 0.88$ in², $d' = 2.5$ in at the bottom) with an equal extra tension area." },
          { t: 'Singly part', tex: `A_{s1} = \\rho_{0.005}bd = ${FT(q12b.sm.rho005, 5)}(10)(17.5) = ${FT(q12b.sm.As1)}\\text{ in}^2,\\ a = ${FT(q12b.sm.a)}\\text{ in},\\ c = ${FT(q12b.sm.c)}\\text{ in}` },
          { t: 'Compression steel stress', tex: `\\varepsilon'_s = 0.003\\frac{${FT(q12b.sm.c)} - 2.5}{${FT(q12b.sm.c)}} = ${FT(q12b.epsSp, 5)} \\Rightarrow f'_s = ${FT(q12b.fsp, 2)}\\text{ ksi}` },
          { t: 'Tension steel', tex: `A_{s2} = \\frac{A'_sf'_s}{f_y} = \\frac{0.88(${FT(q12b.fsp, 2)})}{60} = ${FT(q12b.As2)},\\quad A_s = ${FT(q12b.sm.As1)} + ${FT(q12b.As2)} = ${FT(q12b.AsReq)}\\text{ in}^2` },
          { t: 'Bars', md: `${q12b.n} #8 = ${FT(q12b.n * 0.79)} in²: 3 in the top layer + ${q12b.n2} in a second layer (1 in clear) → centroid $d = ${FT(q12b.p.d)}$ in, $d_t = 17.5$ in.` },
          ...doublySteps(q12b.p, q12b.r),
          { t: 'Live load', tex: `w_u = \\frac{2\\phi M_n}{L^2} = ${FT((2 * q12b.r.phiMn) / 100, 3)} = 1.2(${FT(SW5, 3)}) + 1.6\\,LL \\Rightarrow LL = ${FT(q12b.LL, 3)}\\text{ k/ft}` },
        ]}
        end={`Tension steel **${q12b.n} #8** (${FT(q12b.AsReq)} in² required) with 2 #6 in compression: $\\phi M_n = ${FT(q12b.r.phiMn, 1)}$ k-ft → **LL = ${FT(q12b.LL, 2)} k/ft** (vs ${FT(q12b.single, 2)} k/ft singly reinforced).`}
      />
    ),
  },
}

export const R2006: RcQ[] = BASE.map((q) => (SOL[q.id] ? { ...q, ...SOL[q.id] } : q))
