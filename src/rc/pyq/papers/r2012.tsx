// CE 315 term final 2012-13 (held 31 May 2014) — PDF pp. 63–69.
// This file also holds the small SVG kit and the theory answers that the older
// papers (r2011 … r2007) reuse: an answer lives in the newest paper that asks it.
import { useId, type FC, type ReactNode } from 'react'
import { Md, Tex } from '../../../components/ui'
import type { Check, RcQ } from '../../types'
import { elasticAt, f, uncracked, type SolStep } from '../../engine/elastic'
import { As as Asof } from '../../engine/materials'
import { beamLoads, designAs, designSection, limits, pickBars as pickSingly, review } from '../../engine/singly'
import { designDoubly, pickBars as pickD, reviewDoubly, type DoublyDesign, type DoublyDesignIn, type DoublyReview, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, type BeffOut, type TDesign, type TDesignIn } from '../../engine/tbeam'
import { designShear, shearAt, type ShearBeam, type ShearSection } from '../../engine/shear'
import { bar, ldSimplified, upIn } from '../../engine/bond'
import { oneWayCoef, type OneWayCoefResult } from '../../engine/oneway'
import { twoWay } from '../../engine/twoway'

// ================================================================ SVG kit (shared by r2007–r2012)
export const C = { conc: 'var(--c-conc)', steel: 'var(--c-steel)', ink: 'var(--c-ink)', load: 'var(--c-load)', mute: 'var(--c-mute)' }

export function Fig({ w, h, children, max }: { w: number; h: number; children: ReactNode; max?: number }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto mx-auto block" style={{ maxWidth: max ?? w }} fontSize={12}>
      {children}
    </svg>
  )
}

export function T({ x, y, children, a = 'middle', s = 12, c = C.ink, b, it }: { x: number; y: number; children: ReactNode; a?: 'start' | 'middle' | 'end'; s?: number; c?: string; b?: boolean; it?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={a} fontSize={s} fill={c} fontWeight={b ? 700 : undefined} fontStyle={it ? 'italic' : undefined}>
      {children}
    </text>
  )
}

/** dimension line with architectural ticks; side: a(bove)/b(elow) for horizontal, l/r for vertical */
export function Dim({ x1, y1, x2, y2, label, side }: { x1: number; y1: number; x2: number; y2: number; label: string; side?: 'a' | 'b' | 'l' | 'r' }) {
  const hz = Math.abs(x2 - x1) >= Math.abs(y2 - y1)
  const tick = (x: number, y: number) => <line x1={x - 4} y1={y + 4} x2={x + 4} y2={y - 4} stroke={C.ink} strokeWidth={1.2} />
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const s = side ?? (hz ? 'a' : 'r')
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.mute} strokeWidth={1} />
      {tick(x1, y1)}
      {tick(x2, y2)}
      {hz ? (
        <T x={mx} y={s === 'b' ? my + 15 : my - 5}>
          {label}
        </T>
      ) : (
        <T x={s === 'l' ? mx - 6 : mx + 6} y={my + 4} a={s === 'l' ? 'end' : 'start'}>
          {label}
        </T>
      )}
    </g>
  )
}

export function Arrow({ x1, y1, x2, y2, c = C.load, w = 1.6 }: { x1: number; y1: number; x2: number; y2: number; c?: string; w?: number }) {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const h = 7
  const p1 = `${x2 - h * Math.cos(ang - 0.4)},${y2 - h * Math.sin(ang - 0.4)}`
  const p2 = `${x2 - h * Math.cos(ang + 0.4)},${y2 - h * Math.sin(ang + 0.4)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} />
      <polygon points={`${x2},${y2} ${p1} ${p2}`} fill={c} />
    </g>
  )
}

export function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x - 9},${y + 14} ${x + 9},${y + 14}`} fill="none" stroke={C.ink} strokeWidth={1.3} />
      <line x1={x - 14} y1={y + 14} x2={x + 14} y2={y + 14} stroke={C.ink} strokeWidth={1.3} />
    </g>
  )
}

export function Roller({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y + 7} r={6.5} fill="none" stroke={C.ink} strokeWidth={1.3} />
      <line x1={x - 14} y1={y + 14} x2={x + 14} y2={y + 14} stroke={C.ink} strokeWidth={1.3} />
    </g>
  )
}

/** hatched rectangle (wall, column, fixed support) */
export function Hatch({ x, y, w, h, fill = C.conc }: { x: number; y: number; w: number; h: number; fill?: string }) {
  const id = 'rch' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <g>
      <defs>
        <pattern id={id} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={7} stroke={C.mute} strokeWidth={1.2} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} stroke={C.ink} strokeWidth={1.2} />
    </g>
  )
}

/** uniform load: arrows from y−hgt down to y */
export function Udl({ x1, x2, y, hgt = 18 }: { x1: number; x2: number; y: number; hgt?: number }) {
  const n = Math.max(2, Math.round((x2 - x1) / 22))
  return (
    <g>
      <line x1={x1} y1={y - hgt} x2={x2} y2={y - hgt} stroke={C.load} strokeWidth={1.4} />
      {Array.from({ length: n + 1 }, (_, i) => {
        const x = x1 + (i * (x2 - x1)) / n
        return <Arrow key={i} x1={x} y1={y - hgt} x2={x} y2={y} w={1.1} />
      })}
    </g>
  )
}

/** concentrated load arrow ending at y */
export function PL({ x, y, label, len = 38 }: { x: number; y: number; label: string; len?: number }) {
  return (
    <g>
      <Arrow x1={x} y1={y - len} x2={x} y2={y} w={2} />
      <T x={x} y={y - len - 5} c={C.load} b>
        {label}
      </T>
    </g>
  )
}

export function Bars({ n, x1, x2, y, r = 4 }: { n: number; x1: number; x2: number; y: number; r?: number }) {
  const xs = n === 1 ? [(x1 + x2) / 2] : Array.from({ length: n }, (_, i) => x1 + (i * (x2 - x1)) / (n - 1))
  return (
    <g>
      {xs.map((cx, i) => (
        <circle key={i} cx={cx} cy={y} r={r} fill={C.steel} stroke={C.ink} strokeWidth={0.8} />
      ))}
    </g>
  )
}

/** rectangular section, (x, y) = top-left, s px per inch; rows: n bars at depth y (in) */
export function RectSec({ x, y, s, b, h, rows, edge = 2.5 }: { x: number; y: number; s: number; b: number; h: number; rows: { n: number; y: number; r?: number }[]; edge?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={b * s} height={h * s} fill={C.conc} stroke={C.ink} strokeWidth={1.5} />
      {rows.map((r, k) => (
        <Bars key={k} n={r.n} x1={x + s * edge} x2={x + s * (b - edge)} y={y + s * r.y} r={r.r ?? Math.max(3.5, s * 0.5)} />
      ))}
    </g>
  )
}

/** lines of text (a "Given:" box) */
export function Lines({ x, y, lines, s = 12, step = 17 }: { x: number; y: number; lines: string[]; s?: number; step?: number }) {
  return (
    <g>
      {lines.map((l, i) => (
        <T key={i} x={x} y={y + i * step} a="start" s={s} b={i === 0 && l.endsWith(':')}>
          {l}
        </T>
      ))}
    </g>
  )
}

/** simply supported (or end-reaction) beam elevation with optional UDL and point loads; L in ft */
export function SSBeam({
  x0 = 40,
  y = 110,
  len = 420,
  L,
  cuts = [],
  pls = [],
  udl = true,
  dimLabels,
  sup = 'pin-roller',
}: {
  x0?: number
  y?: number
  len?: number
  L: number
  cuts?: number[]
  pls?: { at: number; label: string }[]
  udl?: boolean
  dimLabels?: string[]
  sup?: 'pin-roller' | 'arrows'
}) {
  const X = (ft: number) => x0 + (ft / L) * len
  const marks = [0, ...cuts, L]
  return (
    <g>
      {udl && <Udl x1={x0} x2={x0 + len} y={y} />}
      {pls.map((p, i) => (
        <PL key={i} x={X(p.at)} y={udl ? y - 18 : y} label={p.label} />
      ))}
      <rect x={x0} y={y} width={len} height={12} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      {sup === 'pin-roller' ? (
        <>
          <Pin x={x0} y={y + 12} />
          <Roller x={x0 + len} y={y + 12} />
        </>
      ) : (
        <>
          <Arrow x1={x0} y1={y + 44} x2={x0} y2={y + 14} c={C.ink} />
          <Arrow x1={x0 + len} y1={y + 44} x2={x0 + len} y2={y + 14} c={C.ink} />
        </>
      )}
      {marks.slice(1).map((m, i) => (
        <Dim key={i} x1={X(marks[i])} y1={y + 56} x2={X(m)} y2={y + 56} label={dimLabels?.[i] ?? `${m - marks[i]}'`} side="b" />
      ))}
    </g>
  )
}

/** plan of a slab on a grid of walls/beams; cols/rows in ft, s px per ft */
export function SlabPlan({ x, y, s, cols, rows, t = 7, colLabels, rowLabels }: { x: number; y: number; s: number; cols: number[]; rows: number[]; t?: number; colLabels?: string[]; rowLabels?: string[] }) {
  const W = cols.reduce((a, b) => a + b, 0) * s
  const H = rows.reduce((a, b) => a + b, 0) * s
  const xs = [0, ...cols.map((_, i) => cols.slice(0, i + 1).reduce((a, b) => a + b, 0) * s)]
  const ys = [0, ...rows.map((_, i) => rows.slice(0, i + 1).reduce((a, b) => a + b, 0) * s)]
  return (
    <g>
      <rect x={x} y={y} width={W} height={H} fill={C.conc} opacity={0.5} />
      {xs.map((cx, i) => (
        <Hatch key={'v' + i} x={x + cx - t / 2} y={y - t / 2} w={t} h={H + t} />
      ))}
      {ys.map((cy, i) => (
        <Hatch key={'h' + i} x={x - t / 2} y={y + cy - t / 2} w={W + t} h={t} />
      ))}
      {cols.map((c, i) => (
        <Dim key={'dc' + i} x1={x + xs[i]} y1={y - 18} x2={x + xs[i + 1]} y2={y - 18} label={colLabels?.[i] ?? `${c}'`} />
      ))}
      {rows.map((r, i) => (
        <Dim key={'dr' + i} x1={x - 20} y1={y + ys[i]} x2={x - 20} y2={y + ys[i + 1]} label={rowLabels?.[i] ?? `${r}'`} side="l" />
      ))}
    </g>
  )
}

/** slab-and-web floor cross-section (T-beams); dims in inches, s px per inch */
export function FloorSec({ x, y, s, hf, bw, sp, hw, n = 3, over = 14 }: { x: number; y: number; s: number; hf: number; bw: number; sp: number; hw: number; n?: number; over?: number }) {
  const W = ((n - 1) * sp + bw + 2 * over) * s
  const webX = (i: number) => x + (over + i * sp) * s
  return (
    <g>
      <rect x={x} y={y} width={W} height={hf * s} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={webX(i)} y={y + hf * s - 0.7} width={bw * s} height={hw * s} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <rect key={'m' + i} x={webX(i) + 1} y={y + hf * s - 2} width={bw * s - 2} height={3} fill={C.conc} />
      ))}
      <path d={`M${x - 3},${y - 4} l6,${hf * s / 2} l-6,${hf * s / 2 + 8}`} fill="none" stroke={C.mute} />
      <path d={`M${x + W - 3},${y - 4} l6,${hf * s / 2} l-6,${hf * s / 2 + 8}`} fill="none" stroke={C.mute} />
    </g>
  )
}

/** model-answer helper */
export const ans = (md: string, Sketch?: FC) => () => (
  <div className="space-y-3">
    <Md>{md}</Md>
    {Sketch && (
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <Sketch />
      </div>
    )}
  </div>
)

// ================================================================ shared theory answers + sketches
export const A_UNCERT = `### Sources of uncertainty
1. **Loads** — the actual loads may differ from those assumed (live load is the least certain: it is controlled by the user, not the designer).
2. **Load distribution** — the actual loads may be distributed differently from the assumed pattern.
3. **Analysis** — the assumptions and simplifications of analysis give load effects (M, V, P) that differ from the real ones.
4. **Behaviour** — the actual structural behaviour may differ from that assumed, because our knowledge is imperfect.
5. **Dimensions** — the actual member dimensions may differ from those specified (construction tolerances).
6. **Reinforcement position** — bars may not be in their proper position (smaller d, wrong cover).
7. **Material strength** — the actual f'c and fy may differ from the specified values (batching, compaction, curing, mill scatter).

The safety margin must also reflect the **consequence of failure** (life, cost) and the **type of failure** (ductile with warning or sudden and brittle).

### How USD provides safety
- Basic requirement: **design strength ≥ required strength**, $\\phi S_n \\ge U$, i.e. $\\phi M_n \\ge M_u$, $\\phi V_n \\ge V_u$, $\\phi P_n \\ge P_u$.
- **Load factors γ > 1** (overload side) are applied to the service loads. The less certain load gets the larger factor: $U = 1.2D + 1.6L$ (older ACI: $1.4D + 1.7L$). Combinations with wind or earthquake use reduced factors because the maxima are unlikely to act together.
- **Strength reduction factors φ < 1** (understrength side) are applied to the nominal strength. They cover variations in material strength, dimensions, bar placement and design equations. They also reflect how important the member is and how it fails: 0.90 for tension-controlled flexure, 0.75 for shear and torsion, 0.65 for tied columns (0.75 spiral), 0.65 for bearing.
- **Probabilistic basis**: safety margin $M = S - Q$. The factors are chosen so that P(overload) ≈ 1/1000 × P(understrength) ≈ 1/100 gives P(failure) ≈ 1/100,000 (reliability index β ≈ 3–4).
- **Ductility rules** give warning before failure: εt ≥ 0.004 for beams, with a smaller φ if εt < 0.005, plus minimum steel and detailing rules.
- **Serviceability** (deflection, cracking) is checked separately at service loads, e.g. through the minimum-thickness rules.`

export const A_STAGES = `As the load on a rectangular RC beam increases it passes through three stages:

1. **Uncracked elastic stage** ($M < M_{cr}$). The concrete tensile stress at the bottom is below the modulus of rupture $f_r = 7.5\\sqrt{f'_c}$. The whole section works. Strains and stresses are linear and both materials are elastic. The steel stress is small ($n$ × the concrete stress at that level). Analyse it with the **uncracked transformed section**, $A_g + (n-1)A_s$, and $M_{cr} = f_r I_{ut}/y_t$ (or $f_r I_g/y_t$).
2. **Cracked elastic stage** ($M_{cr} < M$, $f_c \\lesssim 0.5f'_c$, service loads). Tension cracks form at the bottom and run up close to the neutral axis, so the NA moves up. The concrete below the NA is ignored and the steel carries all the tension. Strains are still linear (plane sections) and the concrete stress is still roughly linear. $kd$ comes from $b(kd)^2/2 = nA_s(d - kd)$; then $M = C\\,jd = T\\,jd$, $f_s = M/(A_s jd)$, $f_c = 2M/(k j b d^2)$. **WSD** is based on this stage.
3. **Ultimate stage** (failure). The concrete stress block becomes curved (non-linear). In an under-reinforced beam the steel **yields first** ($f_s = f_y$); the cracks widen and rise, the NA moves up, and failure comes when the extreme concrete strain reaches $\\varepsilon_{cu} = 0.003$ and the concrete crushes. The curved block is replaced by Whitney's rectangle $0.85f'_c$ over $a = \\beta_1 c$: $M_n = A_s f_y (d - a/2)$. **USD** is based on this stage. (In an over-reinforced beam the concrete crushes before the steel yields, which is a sudden, brittle failure.)

The moment–curvature (load–deflection) curve has three slopes: steep before cracking, flatter after cracking, and almost flat after yielding.`

export function StagesSketch() {
  const top = 36
  const bot = 156
  const bar = 144
  const panels = [
    { t: 'Uncracked', na: 96, k: 0.18 },
    { t: 'Cracked (elastic)', na: 80, k: 0.35 },
    { t: 'Ultimate', na: 66, k: 0.55 },
  ]
  return (
    <Fig w={620} h={215}>
      {panels.map((p, i) => {
        const X = 10 + i * 205
        const sx = X + 85
        const tx = X + 150
        const et = p.k * (p.na - top)
        const eb = p.k * (bot - p.na)
        const es = p.k * (bar - p.na)
        return (
          <g key={i}>
            <T x={X + 95} y={16} b>
              {`${i + 1}. ${p.t}`}
            </T>
            <rect x={X + 10} y={top} width={36} height={bot - top} fill={C.conc} stroke={C.ink} strokeWidth={1.3} />
            <Bars n={3} x1={X + 18} x2={X + 38} y={bar} r={3} />
            {i > 0 &&
              [16, 28, 40].map((cx, j) => <line key={j} x1={X + cx} y1={bot} x2={X + cx + (j - 1)} y2={p.na + 8 + j * 3} stroke={C.ink} strokeWidth={1} />)}
            <line x1={X + 4} y1={p.na} x2={X + 196} y2={p.na} stroke={C.mute} strokeDasharray="4 3" />
            <T x={X + 196} y={p.na - 3} a="end" s={11} c={C.mute}>
              NA
            </T>
            {/* strain */}
            <line x1={sx} y1={top} x2={sx} y2={bot} stroke={C.ink} />
            <polygon points={`${sx},${top} ${sx - et},${top} ${sx},${p.na}`} fill={C.load} opacity={0.35} stroke={C.load} />
            <polygon points={`${sx},${p.na} ${sx + eb},${bot} ${sx},${bot}`} fill={C.steel} opacity={0.25} stroke={C.steel} />
            <T x={sx - et} y={top - 4} a="middle" s={11}>
              {i === 2 ? 'εcu = 0.003' : 'εc'}
            </T>
            <T x={sx + es + 3} y={bar + 4} a="start" s={11}>
              {i === 2 ? 'εs > εy' : 'εs'}
            </T>
            <T x={sx} y={bot + 16} s={11} c={C.mute}>
              strain
            </T>
            {/* stress */}
            <line x1={tx} y1={top} x2={tx} y2={bot} stroke={C.ink} />
            {i === 0 && (
              <>
                <polygon points={`${tx},${top} ${tx - 20},${top} ${tx},${p.na}`} fill={C.load} opacity={0.35} stroke={C.load} />
                <polygon points={`${tx},${p.na} ${tx + 18},${bot} ${tx},${bot}`} fill={C.steel} opacity={0.25} stroke={C.steel} />
                <T x={tx + 20} y={bot - 2} a="start" s={11}>
                  {'ft < fr'}
                </T>
                <T x={tx - 22} y={top + 4} a="end" s={11}>
                  fc
                </T>
              </>
            )}
            {i === 1 && (
              <>
                <polygon points={`${tx},${top} ${tx - 26},${top} ${tx},${p.na}`} fill={C.load} opacity={0.35} stroke={C.load} />
                <T x={tx - 28} y={top + 4} a="end" s={11}>
                  {'fc < 0.5f′c'}
                </T>
                <Arrow x1={tx} y1={bar} x2={tx + 30} y2={bar} c={C.ink} />
                <T x={tx + 32} y={bar - 6} a="start" s={11}>
                  T = As fs
                </T>
              </>
            )}
            {i === 2 && (
              <>
                <path d={`M${tx},${top} L${tx - 26},${top} C${tx - 30},${top + 14} ${tx - 22},${p.na - 10} ${tx},${p.na} Z`} fill={C.load} opacity={0.35} stroke={C.load} />
                <rect x={tx - 24} y={top} width={24} height={(p.na - top) * 0.85} fill="none" stroke={C.ink} strokeDasharray="3 2" />
                <T x={tx - 28} y={top + 4} a="end" s={11}>
                  0.85f′c
                </T>
                <T x={tx - 28} y={top + 22} a="end" s={11}>
                  a = β1c
                </T>
                <Arrow x1={tx} y1={bar} x2={tx + 30} y2={bar} c={C.ink} />
                <T x={tx + 32} y={bar - 6} a="start" s={11}>
                  T = As fy
                </T>
              </>
            )}
            <T x={tx} y={bot + 16} s={11} c={C.mute}>
              stress
            </T>
          </g>
        )
      })}
      <T x={310} y={208} s={11} c={C.mute}>
        cracks rise and the neutral axis moves up as the load grows
      </T>
    </Fig>
  )
}

export const A_RHOMIN = `### Purpose
- With very little steel, the **cracking moment** of the plain section, $M_{cr} = f_r I_g/y_t$, can exceed the strength of the cracked RC section, $M_n = A_s f_y\\,jd$. At the first crack the concrete's tension is suddenly passed to the steel, which cannot carry it: the steel yields or even fractures at once and the beam fails **suddenly, without warning**.
- A minimum $A_s$ makes the cracked-section strength comfortably larger than $M_{cr}$, so the beam cracks in a distributed, ductile way. It also covers shrinkage and temperature stresses and unforeseen loads.

### ACI 318 / BNBC 2020 provisions (beams)
$$A_{s,min} = \\frac{3\\sqrt{f'_c}}{f_y}\\,b_w d \\;\\ge\\; \\frac{200}{f_y}\\,b_w d \\qquad (f'_c,\\ f_y \\text{ in psi})$$
- The $200/f_y$ term governs when $f'_c < 4444$ psi. For $f_y = 60$ ksi: $\\rho_{min} = 0.00333$ (f'c ≤ 4444 psi), $0.00354$ for 5000 psi.
- **T-beams**: for statically determinate T-beams with the **flange in tension** (e.g. a cantilever), replace $b_w$ by the smaller of $2b_w$ and $b_f$ (ACI 318-02/05 wrote this as $6\\sqrt{f'_c}\\,b_w d/f_y$).
- The rule is waived if the steel provided at every section is at least **4/3 of that required by analysis**.
- **Slabs and footings**: $A_{s,min}$ = temperature-and-shrinkage steel, $0.0020bh$ (Grade 40/50) or $0.0018bh$ (Grade 60), spacing ≤ 3h and ≤ 18 in.`

export const A_PHI_ET = `### Why φ is chosen from the net tensile strain εt
- φ should reflect **ductility and warning**. If the tension steel is strained well past yield at nominal strength (large εt), the beam cracks widely and deflects a lot before failure, and moments can redistribute. A smaller safety reduction is then justified.
- If εt is small, the concrete crushes while the steel is still elastic. The failure is sudden and brittle, so a larger reduction (smaller φ) is needed.
- εt is found directly from strain compatibility at nominal strength. It applies to **any member** (beam, column, combined P + M), so ACI's **unified design provisions** (318-02 onwards) use it instead of a φ fixed by member type with the old ρ ≤ 0.75ρb limit.

### Variation of φ with εt (ACI, Grade 60, εty = 0.002)
- **Compression-controlled**, $\\varepsilon_t \\le \\varepsilon_{ty} = 0.002$ ($c/d_t \\ge 0.600$): φ = 0.65 (tied), 0.75 (spiral).
- **Transition zone**, $0.002 < \\varepsilon_t < 0.005$: linear, $\\phi = 0.65 + (\\varepsilon_t - 0.002)\\frac{250}{3} = 0.483 + 83.3\\varepsilon_t$ (tied); $\\phi = 0.75 + 50(\\varepsilon_t - 0.002)$ (spiral).
- **Tension-controlled**, $\\varepsilon_t \\ge 0.005$ ($c/d_t \\le 0.375$): φ = 0.90.`

export const A_ET_RHOMAX = `### How εt limits the maximum steel ratio
- Strain compatibility: $c = \\dfrac{\\varepsilon_u}{\\varepsilon_u + \\varepsilon_t}d_t$. Equilibrium $A_s f_y = 0.85f'_c\\,\\beta_1 c\\,b$ gives
$$\\rho = 0.85\\beta_1\\frac{f'_c}{f_y}\\,\\frac{\\varepsilon_u}{\\varepsilon_u + \\varepsilon_t}$$
More steel gives a deeper c and a **smaller εt**, so fixing a minimum εt fixes a maximum ρ.
- ACI requires **εt ≥ 0.004** at nominal strength for beams (members with $P_u < 0.1f'_cA_g$): $\\rho_{max} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.007}$, where φ = 0.812.
- To keep φ = 0.90, design for $\\varepsilon_t \\ge 0.005$: $\\rho_{0.005} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.008}$.
- Example, f'c = 4 ksi, fy = 60 ksi (β1 = 0.85): ρb = 0.0285, ρmax = 0.0206, ρ0.005 = 0.0181.`

export function PhiChart() {
  const X = (e: number) => 60 + (e / 0.008) * 420
  const Y = (p: number) => 180 - ((p - 0.5) / 0.5) * 150
  const tied = [
    [0, 0.65],
    [0.002, 0.65],
    [0.005, 0.9],
    [0.008, 0.9],
  ]
  const spiral = [
    [0, 0.75],
    [0.002, 0.75],
    [0.005, 0.9],
  ]
  const path = (pts: number[][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])},${Y(p[1])}`).join(' ')
  return (
    <Fig w={520} h={230}>
      <line x1={X(0)} y1={Y(0.5)} x2={X(0.008)} y2={Y(0.5)} stroke={C.ink} />
      <line x1={X(0)} y1={Y(0.5)} x2={X(0)} y2={Y(1)} stroke={C.ink} />
      {[0.65, 0.75, 0.9].map((p) => (
        <g key={p}>
          <line x1={X(0) - 4} y1={Y(p)} x2={X(0)} y2={Y(p)} stroke={C.ink} />
          <T x={X(0) - 7} y={Y(p) + 4} a="end" s={11}>
            {p.toFixed(2)}
          </T>
        </g>
      ))}
      {[0.002, 0.004, 0.005].map((e) => (
        <g key={e}>
          <line x1={X(e)} y1={Y(0.5)} x2={X(e)} y2={Y(0.92)} stroke={C.mute} strokeDasharray="3 3" />
          <T x={X(e)} y={Y(0.5) + 15} s={11}>
            {String(e)}
          </T>
        </g>
      ))}
      <path d={path(spiral)} fill="none" stroke={C.mute} strokeWidth={1.6} strokeDasharray="6 3" />
      <path d={path(tied)} fill="none" stroke={C.load} strokeWidth={2.2} />
      <T x={X(0.0004)} y={Y(0.65) + 14} a="start" s={11}>
        tied 0.65
      </T>
      <T x={X(0.0004)} y={Y(0.75) - 6} a="start" s={11} c={C.mute}>
        spiral 0.75
      </T>
      <T x={X(0.001)} y={Y(0.98)} s={11}>
        compression-
      </T>
      <T x={X(0.001)} y={Y(0.98) + 13} s={11}>
        controlled
      </T>
      <T x={X(0.0035)} y={Y(0.98)} s={11}>
        transition
      </T>
      <T x={X(0.0065)} y={Y(0.98)} s={11}>
        tension-controlled
      </T>
      <T x={X(0.0042)} y={Y(0.79)} a="start" s={11} c={C.mute}>
        beams: εt ≥ 0.004
      </T>
      <T x={X(0.004)} y={224} s={12}>
        net tensile strain εt
      </T>
      <T x={22} y={Y(0.78)} s={12}>
        φ
      </T>
    </Fig>
  )
}

export const A_COVER = `### Why cover is needed
1. **Bond** — concrete must surround the bar to develop bond and resist splitting; too little cover leads to splitting cracks along the bar.
2. **Corrosion protection** — cover keeps moisture, oxygen, chlorides and CO₂ away from the steel and keeps it in an alkaline (passive) environment.
3. **Fire protection** — concrete insulates the steel, which loses strength quickly at high temperature; cover sets the fire rating.
4. **Construction** — room for the concrete to flow and be compacted around the bars, and allowance for placing tolerances.

### ACI 318 specified cover (cast-in-place, non-prestressed; Table 20.6.1.3.1)
- Cast against and permanently exposed to earth: **3 in.**
- Exposed to weather or in contact with ground: No. 6–18 bars **2 in.**; No. 5 and smaller **1½ in.**
- Not exposed to weather or ground:
  - slabs, joists, walls: No. 14, 18 bars 1½ in.; No. 11 and smaller **¾ in.**
  - beams, columns (main bars, stirrups, ties, spirals): **1½ in.**
- So in design: beam $d \\approx h - 2.5$ in (one layer, 1½ in clear to No. 3 stirrups); slab $d \\approx h - 1$ in. Use more cover in aggressive (coastal, industrial) environments.`

export const A_HMIN = `ACI 318 minimum thickness of non-prestressed **beams and one-way slabs** that do not support (or are not attached to) partitions likely to be damaged by large deflections — deflections need not be computed if these are met (ACI 318-08 Table 9.5(a); 318-14 Tables 7.3.1.1 and 9.3.1.1):

- **Solid one-way slabs**: simply supported $l/20$; one end continuous $l/24$; both ends continuous $l/28$; cantilever $l/10$.
- **Beams or ribbed one-way slabs**: simply supported $l/16$; one end continuous $l/18.5$; both ends continuous $l/21$; cantilever $l/8$.

Notes:
- Values are for normal-weight concrete and $f_y = 60{,}000$ psi. For other $f_y$ multiply by $(0.4 + f_y/100{,}000)$.
- For lightweight concrete ($w_c$ = 90–115 pcf) multiply by $(1.65 - 0.005w_c) \\ge 1.09$.
- $l$ = span length in inches; round $h$ up (slabs to ½ in).
- Example: a 16 ft one-end-continuous slab needs $h = 16 \\times 12/24 = 8$ in.`

export const A_TS = `### What it is
Reinforcement placed **perpendicular to the main flexural bars** of a one-way slab (it is also called distribution steel) to resist the stresses caused by **shrinkage** of the concrete and **temperature** changes.

### Why it is important
- Concrete shrinks as it dries and expands or contracts with temperature. The slab is restrained by beams, walls and columns, so these movements create tensile stresses that crack the concrete.
- A one-way slab has main steel in one direction only. Without T&S bars, the other direction would develop a few wide cracks.
- T&S steel keeps the cracks fine and well distributed. It also spreads concentrated loads sideways, ties the main bars into a mat that holds them in position, and improves structural integrity.

### ACI 318 / BNBC limits (ratio to the gross area bh)
- Grade 40 or 50 deformed bars: **0.0020**
- Grade 60 deformed bars or welded wire reinforcement: **0.0018**
- $f_y$ > 60 ksi: $0.0018 \\times 60{,}000/f_y \\ge 0.0014$
- Spacing ≤ **5h** and ≤ **18 in.** (main flexural bars: ≤ 3h and ≤ 18 in.).
- The same ratio is the minimum flexural steel of a slab. T&S bars must be able to develop $f_y$ where they are needed.
- Example: 6 in slab, Grade 60: $A_s = 0.0018 \\times 12 \\times 6 = 0.13$ in²/ft, giving No. 3 @ 10 in c/c.`

export const A_CUTOFF = `For **approximately equal spans with uniformly distributed load**, ACI/Nilson give standard cut-off and bend points, so no moment-envelope calculation is needed (sketch below; $l_n$ = clear span).

**(a) Straight bars**
- Top bars over an interior support extend $l_n/3$ beyond the face of the support (into each span).
- Top bars at an exterior (discontinuous) support extend $l_n/4$ beyond the face and are hooked into the support.
- Half of the bottom bars stop $l_n/8$ from the support faces. The other half run the full span and at least 6 in into the support.

**(b) Bent (cranked) bars**
- Bottom bars are bent up at $l_n/7$ from the face of a discontinuous support and at $l_n/4$ from the face of a continuous support.
- The bent bar runs over the interior support as a top bar and extends $l_n/3$ beyond the face into the next span.
- The remaining bottom bars stay straight and run 6 in into the supports.

**General ACI rules behind the standard figure**
- Extend each bar $d$ or $12d_b$ (larger) beyond the point where it is theoretically no longer needed.
- Continuing bars must have $l_d$ beyond the point where the cut bars stop.
- At least 1/3 (simple spans) or 1/4 (continuous spans) of the positive steel runs at least 6 in into the support.
- At least 1/3 of the negative steel extends beyond the inflection point by the largest of $d$, $12d_b$ and $l_n/16$.
- Avoid cut-offs in a tension zone unless $V_u \\le \\tfrac{2}{3}\\phi V_n$, extra stirrups are added, or the continuing bars give twice the area needed.`

export function CutoffSketch() {
  const panel = (y0: number, bent: boolean) => {
    const yt = y0 + 8
    const yb = y0 + 40
    const ln = 280
    const fE = 50 // exterior face
    const fI = 330 // interior face (left)
    const fI2 = 350 // interior face (right)
    return (
      <g>
        <rect x={30} y={y0} width={580} height={48} fill={C.conc} stroke={C.ink} strokeWidth={1.2} />
        <rect x={30} y={y0 + 48} width={20} height={26} fill={C.conc} stroke={C.ink} />
        <rect x={330} y={y0 + 48} width={20} height={26} fill={C.conc} stroke={C.ink} />
        <path d={`M600,${y0 - 4} l8,24 l-8,32`} fill="none" stroke={C.mute} />
        <T x={190} y={y0 + 90} s={11} c={C.mute}>{`exterior span, clear span ln`}</T>
        {!bent ? (
          <g stroke={C.steel} strokeWidth={2.4} fill="none">
            <path d={`M36,${yb - 6} L36,${yt} L${fE + ln / 4},${yt}`} />
            <line x1={fI - ln / 3} y1={yt} x2={fI2 + ln / 3} y2={yt} />
            <line x1={36} y1={yb} x2={600} y2={yb} />
            <line x1={fE + ln / 8} y1={yb - 5} x2={fI - ln / 8} y2={yb - 5} />
            <line x1={fI2 + ln / 8} y1={yb - 5} x2={600} y2={yb - 5} />
          </g>
        ) : (
          <g stroke={C.steel} strokeWidth={2.4} fill="none">
            <path d={`M36,${yb - 6} L36,${yt} L${fE + ln / 7},${yt} L${fE + ln / 7 + 28},${yb - 5} L${fI - ln / 4 - 28},${yb - 5} L${fI - ln / 4},${yt} L${fI2 + ln / 3},${yt}`} />
            <path d={`M${fI - ln / 3},${yt + 4} L${fI2 + ln / 4},${yt + 4} L${fI2 + ln / 4 + 28},${yb - 5} L600,${yb - 5}`} />
            <line x1={36} y1={yb} x2={600} y2={yb} />
          </g>
        )}
        {/* dimension labels */}
        {!bent ? (
          <>
            <Dim x1={fE} y1={y0 - 10} x2={fE + ln / 4} y2={y0 - 10} label="ln/4" />
            <Dim x1={fI - ln / 3} y1={y0 - 10} x2={fI} y2={y0 - 10} label="ln/3" />
            <Dim x1={fI2} y1={y0 - 10} x2={fI2 + ln / 3} y2={y0 - 10} label="ln/3" />
            <Dim x1={fE} y1={y0 + 60} x2={fE + ln / 8} y2={y0 + 60} label="ln/8" side="b" />
            <Dim x1={fI - ln / 8} y1={y0 + 60} x2={fI} y2={y0 + 60} label="ln/8" side="b" />
          </>
        ) : (
          <>
            <Dim x1={fE} y1={y0 - 10} x2={fE + ln / 7} y2={y0 - 10} label="ln/7" />
            <Dim x1={fI - ln / 4} y1={y0 - 10} x2={fI} y2={y0 - 10} label="ln/4" />
            <Dim x1={fI2} y1={y0 - 10} x2={fI2 + ln / 3} y2={y0 - 10} label="ln/3" />
          </>
        )}
        <T x={36} y={y0 - 26} a="start" b>
          {bent ? '(b) bent bars' : '(a) straight bars'}
        </T>
      </g>
    )
  }
  return (
    <Fig w={640} h={300}>
      {panel(40, false)}
      {panel(190, true)}
    </Fig>
  )
}

export const A_LD = `**Development length** $l_d$ is the shortest embedment that lets a bar reach its yield stress without pulling out or splitting the concrete. The factors that influence it:

1. **Concrete tensile strength** ($\\sqrt{f'_c}$, capped at 100 psi). Bond strength grows with $\\sqrt{f'_c}$, so $l_d \\propto 1/\\sqrt{f'_c}$. Lightweight concrete has lower tensile strength: λ = 0.75 increases $l_d$.
2. **Bar diameter** $d_b$. The force to develop grows with the area ($\\propto d_b^2$) but the bonded surface only with the perimeter ($\\propto d_b$), so $l_d \\propto d_b$. Small bars (No. 6 and smaller) do relatively better: $\\psi_s = 0.8$.
3. **Yield strength** $f_y$. A higher bar stress needs a longer length: $l_d \\propto f_y$.
4. **Cover and bar spacing** ($c_b$). Small cover or close spacing leads to splitting failure, so $l_d$ goes up. Beyond $(c_b + K_{tr})/d_b = 2.5$ pull-out governs and there is no further gain.
5. **Transverse reinforcement** ($K_{tr} = 40A_{tr}/sn$). Stirrups crossing the splitting plane confine the bar and shorten $l_d$.
6. **Bar location** ($\\psi_t$). Top bars with more than 12 in of fresh concrete below collect bleed water and air underneath, which weakens bond: $\\psi_t = 1.3$.
7. **Epoxy coating** ($\\psi_e$). Coating reduces adhesion and friction: 1.5 if cover < $3d_b$ or clear spacing < $6d_b$, otherwise 1.2; $\\psi_t\\psi_e \\le 1.7$.
8. **Excess reinforcement**. If more steel is provided than required, the bar stress is lower and $l_d$ may be multiplied by $A_{s,req}/A_{s,prov}$ (not for lap splices).
9. **Bar surface and end anchorage**. Deformed bars bond by rib bearing, far better than plain bars. Hooks and heads shorten the straight length needed.

ACI general equation:
$$l_d = \\left(\\frac{3}{40}\\,\\frac{f_y}{\\lambda\\sqrt{f'_c}}\\,\\frac{\\psi_t\\psi_e\\psi_s}{(c_b + K_{tr})/d_b}\\right)d_b \\;\\ge\\; 12\\text{ in.}$$`

export const A_FAILURE = `Concrete structures rarely fail from a single cause. The main factors are:

1. **Design errors**: wrong or under-estimated loads; mistakes in analysis; ignoring a load case, torsion or continuity; poor detailing (anchorage, laps, joints, too little shear steel).
2. **Construction faults**: poor materials; too much water (high w/c ratio); poor compaction and curing (honeycombing, low f'c); bars misplaced (wrong d or cover); premature formwork removal; weak shoring.
3. **Overloading or change of use**: loads above the design values, added storeys, storage on floors designed for residential use.
4. **Exceptional or environmental actions**: earthquake, wind, flood, impact, explosion, fire, differential settlement of foundations.
5. **Deterioration (durability)**: corrosion of steel from chlorides or carbonation through thin or cracked cover; sulphate attack; alkali–aggregate reaction; creep and shrinkage cracking.
6. **Lack of inspection and maintenance**: small defects (leaks, cracks, spalling) left to grow.
7. **Type of failure**: brittle modes (shear, compression of over-reinforced or column sections, bond/splitting) give no warning. This is why codes use smaller φ for them and require ductile, under-reinforced flexural behaviour.`

export const A_FLOORS = `Common RC floor systems in Bangladesh (sketches below):

1. **One-way slab on beams** (beam–slab, $l_b/l_a \\ge 2$). The slab bends in the short direction only and carries load to the long beams, then to girders and columns. Typical for long, narrow panels and verandas. A slab on **load-bearing brick walls** is the low-rise version.
2. **Two-way edge-supported slab** ($l_b/l_a < 2$, beams on all four sides). The slab bends in both directions. It is the most common system in residential and office buildings and is designed by the moment-coefficient method.
3. **Flat plate**. The slab rests directly on columns with no beams, drops or capitals. It gives a flat ceiling, simple formwork and low storey height (apartments, hotels). Punching shear at the columns governs.
4. **Flat slab**. Like a flat plate, but with **drop panels** and/or **column capitals** to resist punching shear and negative moment. Used for heavier loads (parking, warehouses, markets).
5. **Ribbed (joist) and waffle (grid) slabs**. A thin top slab sits on closely spaced ribs in one direction (joist floor) or both directions (waffle). This saves concrete and weight for long spans (auditoriums, malls).`

export function FloorsSketch() {
  const plan = (x: number, w: number, h: number, both: boolean) => (
    <g>
      <rect x={x} y={40} width={w} height={h} fill={C.conc} stroke={C.ink} strokeWidth={1.2} />
      <rect x={x} y={36} width={w} height={6} fill={C.mute} opacity={0.6} />
      <rect x={x} y={36 + h} width={w} height={6} fill={C.mute} opacity={0.6} />
      {both && (
        <>
          <rect x={x - 4} y={36} width={6} height={h + 10} fill={C.mute} opacity={0.6} />
          <rect x={x + w - 2} y={36} width={6} height={h + 10} fill={C.mute} opacity={0.6} />
          <Arrow x1={x + w / 2 - 22} y1={40 + h / 2} x2={x + w / 2 + 22} y2={40 + h / 2} c={C.load} />
        </>
      )}
      <Arrow x1={x + w / 2} y1={40 + h / 2 - 18} x2={x + w / 2} y2={40 + h / 2 + 18} c={C.load} />
    </g>
  )
  return (
    <Fig w={640} h={250}>
      <T x={65} y={22} b>
        1. one-way
      </T>
      {plan(15, 100, 50, false)}
      <T x={65} y={112} s={11} c={C.mute}>
        beams on long sides
      </T>
      <T x={195} y={22} b>
        2. two-way
      </T>
      {plan(155, 80, 64, true)}
      <T x={195} y={126} s={11} c={C.mute}>
        beams all round
      </T>
      {/* flat plate */}
      <T x={330} y={22} b>
        3. flat plate
      </T>
      <rect x={270} y={50} width={120} height={8} fill={C.conc} stroke={C.ink} />
      {[290, 370].map((cx) => (
        <rect key={cx} x={cx - 5} y={58} width={10} height={50} fill={C.conc} stroke={C.ink} />
      ))}
      {/* flat slab */}
      <T x={480} y={22} b>
        4. flat slab
      </T>
      <rect x={420} y={50} width={120} height={8} fill={C.conc} stroke={C.ink} />
      {[440, 520].map((cx) => (
        <g key={cx}>
          <rect x={cx - 16} y={58} width={32} height={6} fill={C.conc} stroke={C.ink} />
          <polygon points={`${cx - 12},64 ${cx + 12},64 ${cx + 5},76 ${cx - 5},76`} fill={C.conc} stroke={C.ink} />
          <rect x={cx - 5} y={76} width={10} height={32} fill={C.conc} stroke={C.ink} />
        </g>
      ))}
      <T x={480} y={124} s={11} c={C.mute}>
        drop panel + capital
      </T>
      {/* ribbed / waffle */}
      <T x={200} y={160} b>
        5. ribbed (joist) / waffle slab
      </T>
      <rect x={60} y={175} width={280} height={7} fill={C.conc} stroke={C.ink} />
      {Array.from({ length: 8 }, (_, i) => (
        <polygon key={i} points={`${72 + i * 36},182 ${84 + i * 36},182 ${82 + i * 36},212 ${74 + i * 36},212`} fill={C.conc} stroke={C.ink} />
      ))}
      <T x={200} y={232} s={11} c={C.mute}>
        thin top slab on closely spaced ribs (both ways = waffle)
      </T>
      <rect x={400} y={160} width={180} height={70} fill="none" stroke={C.mute} />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={'a' + i} x1={400 + (i + 1) * 30} y1={160} x2={400 + (i + 1) * 30} y2={230} stroke={C.mute} />
      ))}
      {Array.from({ length: 2 }, (_, i) => (
        <line key={'b' + i} x1={400} y1={160 + (i + 1) * 23} x2={580} y2={160 + (i + 1) * 23} stroke={C.mute} />
      ))}
      <T x={490} y={246} s={11} c={C.mute}>
        waffle plan (ribs both ways)
      </T>
    </Fig>
  )
}


// ================================================================ solution kit (numbers from src/rc/engine)
export { f }
export type { SolStep }
/** signed term for TeX polynomials */
export const sg = (v: number, d = 3) => (v >= 0 ? `+ ${f(v, d)}` : `- ${f(-v, d)}`)
/** compute once, on first use (keeps engine calls out of module load) */
export const lazy = <T,>(fn: () => T) => {
  let v: T | undefined
  return () => (v === undefined ? (v = fn()) : v)
}

export function StepList({ steps, start = 1 }: { steps: SolStep[]; start?: number }) {
  return (
    <ol className="space-y-2" style={{ listStyle: 'none', paddingLeft: 0 }}>
      {steps.map((s, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent font-bold text-xs grid place-items-center mt-0.5">{start + i}</span>
          <div className="flex-1 min-w-0 text-sm">
            {s.t && <div className="font-semibold">{s.t}</div>}
            {s.tex && (
              <div className="overflow-x-auto scroll-thin">
                <Tex block>{s.tex}</Tex>
              </div>
            )}
            {s.md && <Md className="text-mute">{s.md}</Md>}
          </div>
        </li>
      ))}
    </ol>
  )
}
export function Sol({ children }: { children: ReactNode }) {
  return <div className="space-y-3 text-sm">{children}</div>
}
export function SH({ children }: { children: ReactNode }) {
  return <div className="font-bold text-accent pt-1">{children}</div>
}
export function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className="text-left font-semibold border-b border-line px-2 py-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/50">
              {r.map((c, j) => (
                <td key={j} className="px-2 py-1 num">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
/** boxed final answer (markdown) */
export function Final({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-good/40 bg-good/5 px-3 py-2">
      <Md>{children}</Md>
    </div>
  )
}
const barTxt = (n: number, no: number | string) => `${n} No. ${no}`

// ---------------------------------------------------------------- doubly reinforced: review + design steps
export function doublyReviewSteps(p: DoublyReviewIn, r: DoublyReview): SolStep[] {
  const dt = p.dt ?? p.d
  const k = 0.85 * p.fc
  const s: SolStep[] = [
    { t: 'Data', tex: `A_s = ${f(p.As)}\\text{ in}^2,\\ A'_s = ${f(p.Asp)}\\text{ in}^2,\\ b = ${f(p.b)},\\ d = ${f(p.d)},\\ d_t = ${f(dt)},\\ d' = ${f(p.dp)}\\text{ in};\\ \\beta_1 = ${f(r.b1)},\\ \\varepsilon_y = ${f(p.fy)}/29000 = ${f(r.ey, 5)}` },
    { t: 'Trial: assume both steels yield', tex: `a = \\frac{(A_s - A'_s)f_y}{0.85f'_cb} = \\frac{(${f(p.As)} - ${f(p.Asp)})(${f(p.fy)})}{${f(k)}(${f(p.b)})} = ${f(r.trial.a)}\\text{ in},\\quad c = \\frac{a}{\\beta_1} = ${f(r.trial.c)}\\text{ in}` },
    {
      t: "Does A′s yield?",
      tex: `\\varepsilon'_s = 0.003\\frac{c - d'}{c} = 0.003\\frac{${f(r.trial.c)} - ${f(p.dp)}}{${f(r.trial.c)}} = ${f(r.trial.epsSp, 5)}\\ ${r.trial.epsSp >= r.ey ? '\\ge' : '<'}\\ \\varepsilon_y = ${f(r.ey, 5)}`,
      md: r.trial.epsSp >= r.ey ? "**Yes** — compression steel yields, f′s = fy; the trial values stand." : "**No** — compression steel has not yielded. Find c from equilibrium with f′s = Es·ε′s = 87(c − d′)/c ksi.",
    },
  ]
  if (r.method === 'quadratic' && r.quad)
    s.push({
      t: 'Solve for c',
      tex: `0.85f'_c\\beta_1b\\,c + A'_s\\left(87\\frac{c - d'}{c}${r.dispUsed ? " - 0.85f'_c" : ''}\\right) = A_sf_y \\Rightarrow ${f(r.quad.A)}c^2 ${sg(r.quad.B)}c ${sg(r.quad.C)} = 0 \\Rightarrow c = ${f(r.c)}\\text{ in}`,
      md: r.dispUsed ? "The concrete displaced by A′s (0.85f′c·A′s) is subtracted, as in the class handnotes." : undefined,
    })
  if (r.method === 'general') s.push({ t: 'Solve for c (strain compatibility)', md: `The tension steel does not yield either (εs = ${f(r.epsS, 5)} < εy), so c comes from full strain compatibility: **c = ${f(r.c)} in**.` })
  s.push(
    {
      t: 'Stresses and forces',
      tex: `a = \\beta_1c = ${f(r.a)}\\text{ in},\\ f'_s = ${f(r.fsp, 2)}\\text{ ksi};\\quad C_c = 0.85f'_cab = ${f(r.Cc, 1)}\\text{ k},\\ C_s = A'_s(f'_s${r.dispUsed ? " - 0.85f'_c" : ''}) = ${f(r.Cs, 1)}\\text{ k},\\ T = A_sf_s = ${f(r.T, 1)}\\text{ k}`,
    },
    {
      t: 'Net tensile strain and φ',
      tex: `\\varepsilon_t = 0.003\\frac{d_t - c}{c} = 0.003\\frac{${f(dt)} - ${f(r.c)}}{${f(r.c)}} = ${f(r.epsT, 5)}\\ \\Rightarrow\\ \\phi = ${f(r.phi)}\\ (${r.zone === 'tension' ? 'tension-controlled' : r.zone === 'transition' ? 'transition: 0.483 + 83.3\\varepsilon_t' : 'compression-controlled'})`,
      md: r.ductileOk ? 'εt ≥ 0.004: permitted for a beam ✓' : '**εt < 0.004: not permitted for a beam.**',
    },
    {
      t: 'Nominal and design moment',
      tex: `M_n = C_c\\left(d - \\frac a2\\right) + C_s(d - d') = ${f(r.Cc, 1)}(${f(p.d - r.a / 2)}) + ${f(r.Cs, 1)}(${f(p.d - p.dp)}) = ${f(r.Mn, 0)}\\text{ k-in} = ${f(r.MnFt, 1)}\\text{ k-ft};\\quad \\phi M_n = ${f(r.phiMn, 1)}\\text{ k-ft}`,
    },
  )
  return s
}

export function doublyDesignSteps(p: DoublyDesignIn, dd: DoublyDesign): SolStep[] {
  const sm = dd.sm
  const s: SolStep[] = [
    {
      t: 'Largest singly reinforced capacity (εt = 0.005)',
      tex: `\\rho_{0.005} = ${f(sm.rho005, 5)},\\ A_{s1} = \\rho bd = ${f(sm.rho005, 5)}(${f(p.b)})(${f(p.d)}) = ${f(sm.As1)}\\text{ in}^2,\\ a = \\frac{A_{s1}f_y}{0.85f'_cb} = ${f(sm.a)}\\text{ in},\\ c = ${f(sm.c)}\\text{ in}`,
    },
    { t: 'φMn1', tex: `\\phi M_{n1} = ${f(sm.phi)}\\times${f(sm.As1)}\\times${f(p.fy)}\\left(${f(p.d)} - \\frac{${f(sm.a)}}{2}\\right)/12 = ${f(sm.phiMn1, 1)}\\text{ k-ft}\\ ${p.Mu > sm.phiMn1 ? '<' : '\\ge'}\\ M_u = ${f(p.Mu, 1)}`, md: dd.needed ? '**Compression steel is required.**' : 'A singly reinforced section is enough.' },
  ]
  if (!dd.needed) {
    s.push({ t: 'Singly reinforced steel', tex: `A_s = ${f(dd.As)}\\text{ in}^2 \\to ${dd.tension.n}\\text{ No. }${dd.tension.no}\\ (${f(dd.tension.A, 2)}\\text{ in}^2)` })
    return s
  }
  s.push(
    { t: 'Moment for the steel couple', tex: `\\phi M_{n2} = M_u - \\phi M_{n1} = ${f(p.Mu, 1)} - ${f(sm.phiMn1, 1)} = ${f(dd.phiMn2, 1)}\\text{ k-ft},\\quad M_{n2} = \\frac{${f(dd.phiMn2, 1)}\\times12}{0.9} = ${f(dd.Mn2, 0)}\\text{ k-in}` },
    {
      t: "Stress in A′s (at c of the singly part)",
      tex: `\\varepsilon'_s = 0.003\\frac{c - d'}{c} = 0.003\\frac{${f(sm.c)} - ${f(p.dp)}}{${f(sm.c)}} = ${f(dd.epsSp, 5)}\\ ${dd.compYields ? '\\ge' : '<'}\\ \\varepsilon_y\\ \\Rightarrow\\ f'_s = ${f(dd.fsp, 2)}\\text{ ksi}`,
    },
    { t: 'Compression steel', tex: `A'_s = \\frac{M_{n2}}{f'_s(d - d')} = \\frac{${f(dd.Mn2, 0)}}{${f(dd.fsp, 2)}(${f(p.d - p.dp)})} = ${f(dd.Asp)}\\text{ in}^2` },
    { t: 'Tension steel', tex: `A_{s2} = \\frac{A'_sf'_s}{f_y} = ${f(dd.As2)}\\text{ in}^2,\\quad A_s = A_{s1} + A_{s2} = ${f(sm.As1)} + ${f(dd.As2)} = ${f(dd.As)}\\text{ in}^2` },
    {
      t: 'Bars',
      md: `Tension: **${barTxt(dd.tension.n, dd.tension.no)}** (${f(dd.tension.A, 2)} in², ${dd.tension.layers} layer${dd.tension.layers > 1 ? 's' : ''}); compression: **${barTxt(dd.comp!.n, dd.comp!.no)}** (${f(dd.comp!.A, 2)} in²)${dd.bumped ? ` — ${dd.bumped} bar${dd.bumped > 1 ? 's' : ''} added after the review below came up short` : ''}.`,
    },
  )
  return s
}

// ---------------------------------------------------------------- T-beam design steps
export function tDesignSteps(p: TDesignIn, r: TDesign, bf?: BeffOut): SolStep[] {
  const dt = p.dt ?? p.d
  const s: SolStep[] = []
  if (bf) s.push({ t: 'Effective flange width', tex: `b_{eff} = \\min(${bf.cands.map((c) => `${c.label} = ${f(c.value, 1)}`).join(',\\ ')}) = ${f(bf.b, 1)}\\text{ in}` })
  s.push(
    { t: 'Trial with a = hf', tex: `A_s = \\frac{M_u}{\\phi f_y(d - h_f/2)} = \\frac{${f(p.Mu * 12, 0)}}{0.9(${f(p.fy)})(${f(p.d - p.hf / 2)})} = ${f(r.trial.As)}\\text{ in}^2,\\ a = \\frac{A_sf_y}{0.85f'_cb_{eff}} = ${f(r.trial.a)}\\text{ in}\\ ${r.trial.a > p.hf ? '>' : '\\le'}\\ h_f = ${f(p.hf)}` },
    { t: 'Flange capacity', tex: `\\phi M_{n,f} = 0.9(0.85f'_c)b_{eff}h_f(d - h_f/2) = ${f(r.phiMnFlange, 1)}\\text{ k-ft}\\ ${p.Mu > r.phiMnFlange ? '<' : '\\ge'}\\ M_u`, md: r.rect ? 'The stress block stays in the flange: **rectangular beam of width beff**.' : '**True T-section**: the stress block goes into the web.' },
  )
  if (r.rect) s.push({ t: 'Steel (rectangle b = beff)', tex: `A_s = ${f(r.As)}\\text{ in}^2,\\ a = ${f(r.a)}\\text{ in} \\le h_f` })
  else
    s.push(
      { t: 'Overhang steel', tex: `A_{sf} = \\frac{0.85f'_c(b_{eff} - b_w)h_f}{f_y} = \\frac{0.85(${f(p.fc)})(${f(p.beff - p.bw)})(${f(p.hf)})}{${f(p.fy)}} = ${f(r.Asf)}\\text{ in}^2,\\ \\phi M_{n1} = \\phi A_{sf}f_y(d - h_f/2) = ${f(r.phiMn1, 1)}\\text{ k-ft}` },
      { t: 'Web steel', tex: `\\phi M_{n2} = M_u - \\phi M_{n1} = ${f(r.phiMn2, 1)}\\text{ k-ft} \\Rightarrow A_{sw} = ${f(r.Asw)}\\text{ in}^2\\ (a = \\frac{A_{sw}f_y}{0.85f'_cb_w} = ${f(r.a)}\\text{ in})`, md: 'Asw from $M_{n2} = A_{sw}f_y(d - a/2)$ with $b = b_w$ (quadratic, or iterate a).' },
      { t: 'Total', tex: `A_s = A_{sf} + A_{sw} = ${f(r.Asf)} + ${f(r.Asw)} = ${f(r.As)}\\text{ in}^2` },
    )
  s.push(
    { t: 'Strain check', tex: `c = \\frac{a}{\\beta_1} = ${f(r.c)}\\text{ in},\\ \\varepsilon_t = 0.003\\frac{${f(dt)} - ${f(r.c)}}{${f(r.c)}} = ${f(r.epsT, 5)}\\ \\Rightarrow\\ \\phi = ${f(r.phi)}`, md: r.epsT >= 0.005 ? 'Tension-controlled ✓ (φ = 0.9 as assumed).' : r.epsT >= 0.004 ? 'Transition zone: φ re-evaluated and As iterated.' : '**εt < 0.004 — not permitted.**' },
    { t: 'Minimum steel', tex: `A_{s,min} = \\frac{\\max(3\\sqrt{f'_c},200)}{f_y}b_wd = ${f(r.AsMin)}\\text{ in}^2\\ ${r.As >= r.AsMin ? '<' : '>'}\\ A_s\\ ${r.As >= r.AsMin ? '\\checkmark' : ''}` },
  )
  return s
}

// ---------------------------------------------------------------- stirrup design (Case A–D) for a whole beam
export function shearDesignOf(bm: ShearBeam, sec: ShearSection) {
  const D = designShear(bm, sec)
  const run = D.runs[0]
  const at = shearAt(run.Vd, sec)
  return { ...D, run, at, lay: D.layouts[run.id], sp: D.spacings[run.id] }
}
export function shearChecks(bm: ShearBeam, sec: ShearSection): Check[] {
  const S = shearDesignOf(bm, sec)
  return [
    { key: 'vd', label: 'Vu at the critical section (d from the face)', value: S.run.Vd, unit: 'k' },
    { key: 'phivc', label: 'φVc = φ2√f′c bw d', value: S.lim.phiVc, unit: 'k' },
    { key: 's1', label: 'Required stirrup spacing there (No. 3 U, before rounding)', value: Math.min(S.at.sCalc, S.at.sMax), unit: 'in', tol: 0.03 },
  ]
}
export function ShearSol({ bm, sec, note }: { bm: ShearBeam; sec: ShearSection; note?: string }) {
  const S = shearDesignOf(bm, sec)
  const { dg, lim, run, at, lay } = S
  const both = S.runs.length > 1
  const ft = (u: number | null) => (u === null ? '—' : `${f(u / 12, 2)} ft`)
  // shear table at the breaks along the run
  const xs = dg.breaks.filter((x) => (run.dir === 1 ? x >= run.face - 1e-9 && x <= run.face + run.len / 12 + 1e-9 : x <= run.face + 1e-9 && x >= run.face - run.len / 12 - 1e-9))
  const rows = xs.map((x) => {
    const u = Math.abs(x - run.face) * 12
    const V = run.VrawAt(Math.min(u + 0.01, run.len))
    const sa = shearAt(run.VuAt(Math.min(u + 0.01, run.len)), sec)
    return [`${f(x, 2)} ft`, f(V, 1), sa.case, Number.isFinite(sa.s) ? f(sa.s, 2) : 'none']
  })
  const steps: SolStep[] = [
    {
      t: 'Loads and reactions',
      tex: `w_u = ${f(dg.wu)}\\text{ k/ft}${dg.Pu.length ? `,\\ P_u = ${dg.Pu.map((p) => `${f(p.P, 1)}\\text{ k @ }${f(p.x)}\\text{ ft}`).join(',\\ ')}` : ''};\\quad ${dg.fixed ? `V_{face} = ${f(dg.R[0], 1)}` : `R = ${dg.R.map((r) => f(r, 1)).join(',\\ ')}`}\\text{ k}`,
      md: dg.wsw ? `Includes self-weight ${f(dg.wsw)} k/ft.` : undefined,
    },
    {
      t: 'Concrete capacity',
      tex: `V_c = 2\\sqrt{f'_c}b_wd = 2\\sqrt{${sec.fc}}(${f(sec.bw)})(${f(sec.d)})/1000 = ${f(lim.Vc, 1)}\\text{ k};\\ \\phi V_c = ${f(lim.phiVc, 1)},\\ \\tfrac12\\phi V_c = ${f(lim.halfPhiVc, 1)},\\ \\phi4\\sqrt{f'_c}b_wd = ${f(lim.phiVs4, 1)},\\ \\phi8\\sqrt{f'_c}b_wd = ${f(lim.phiVs8, 1)}\\text{ k}`,
      md: `φ = ${lim.phi}. Minimum steel: $A_v/s \\ge \\max(0.75\\sqrt{f'_c}b_w/f_y,\\ 50b_w/f_y) = \\max(${f(lim.avsMin1, 4)},\\ ${f(lim.avsMin2, 4)})$ in²/in → s ≤ ${f(lim.sMinSteel, 1)} in with No. 3 U (Av = ${f(lim.Av, 2)} in²).`,
    },
    {
      t: run.critAtFace ? 'Critical section (at the face: load within d)' : 'Critical section at d from the face',
      tex: `V_{u,face} = ${f(run.Vface, 1)}\\text{ k},\\quad V_u = ${f(run.Vd, 1)}\\text{ k}`,
    },
    {
      t: `Case ${at.case}`,
      tex:
        at.case === 'A'
          ? `V_u \\le \\tfrac12\\phi V_c:\\ \\text{no stirrups required}`
          : `\\phi V_s = V_u - \\phi V_c = ${f(at.phiVs, 1)}\\text{ k};\\ \\frac{A_v}{s} = \\max\\left(\\frac{V_u - \\phi V_c}{\\phi f_yd},\\ ${f(at.avsMin1, 4)},\\ ${f(at.avsMin2, 4)}\\right) = ${f(at.avs, 4)}\\text{ in}^2/\\text{in}\\Rightarrow s = \\frac{${f(lim.Av, 2)}}{${f(at.avs, 4)}} = ${f(at.sCalc, 2)}\\text{ in};\\ s_{max} = ${f(at.sMax, 1)}\\text{ in}`,
      md: at.case === 'redesign' ? '**Vu exceeds the upper limit: enlarge the section.**' : at.case !== 'A' ? `Use s = ${f(at.s, 2)} in (Case ${at.case}: s_max = ${at.case === 'D' ? 'd/4, 12 in' : 'd/2, 24 in'}).` : undefined,
    },
    { t: 'Where the requirements change', md: `Vu drops to φVc at ${ft(run.uPhiVc)} and to ½φVc at ${ft(run.uHalf)} from the face; stirrups are required up to ${ft(run.uReqEnd)}${run.uSmax !== null ? `; s_max governs beyond ${ft(run.uSmax)}` : ''}.` },
  ]
  return (
    <Sol>
      {note && <Md className="text-mute">{note}</Md>}
      <StepList steps={steps} />
      <SH>Required spacing along the beam (from the {dg.fixed ? 'fixed end' : 'left support'})</SH>
      <Tbl head={['just past x', 'V (k)', 'case', 's req (in)']} rows={rows} />
      <SH>Stirrup layout (No. 3 two-legged)</SH>
      <Final>
        {lay.count
          ? `From ${both ? 'each' : 'the'} support face: first stirrup at ${f(lay.first)} in, then ${lay.zones.map((z) => `${z.n} @ ${f(z.s)} in`).join(', ')} (to ${f(lay.last)} in = ${f(lay.last / 12, 2)} ft) — ${lay.count} stirrups${both ? ' each side' : ''}${S.midStirrup ? ', plus one at midspan' : ''}. ${both ? 'Mirror the pattern from the other support.' : ''}`
          : 'No stirrups are required by calculation (provide nominal stirrups at s_max for practice).'}
      </Final>
      {S.flags.length > 0 && <Md className="text-xs text-mute">{S.flags.map((x) => `- ${x}`).join('\n')}</Md>}
    </Sol>
  )
}

// ---------------------------------------------------------------- one-way slab (ACI coefficients) solution
export function OneWaySol({ r, endNote }: { r: OneWayCoefResult; endNote?: string }) {
  const L = r.loads
  const steps: SolStep[] = [
    { t: 'Thickness', tex: r.hmin.map((x) => `\\frac{${f(x.l)}\\times12}{${x.rule === 'one' ? 24 : x.rule === 'both' ? 28 : 20}}${r.input.fy !== 60000 ? `(0.4 + \\tfrac{${r.input.fy}}{100000})` : ''} = ${f(x.h, 2)}`).filter((v, i, a) => a.indexOf(v) === i).join(',\\ ') + `\\text{ in} \\Rightarrow h = ${f(r.h)}\\text{ in},\\ d = h - 1 = ${f(r.d)}\\text{ in}`, md: 'End spans: one end continuous, l/24.' },
    { t: 'Loads (1-ft strip)', tex: `D = ${f(L.D, 1)}\\text{ psf}${L.given ? '' : ` (self-weight ${f(L.sw, 1)})`},\\ L = ${f(L.L, 1)}\\text{ psf};\\ w_u = ${L.fD}(${f(L.D, 1)}) + ${L.fL}(${f(L.L, 1)}) = ${f(L.wu, 1)}\\text{ psf} = ${f(L.wuk, 4)}\\text{ k/ft}` },
    { t: 'Depth check', tex: `d_{req} = \\sqrt{\\frac{M_{u,max}}{\\phi\\rho_{0.005}f_y b(1 - 0.59\\rho f_y/f'_c)}} = ${f(r.depth.dreq, 2)}\\text{ in}\\ ${r.depth.dreq <= r.d ? '\\le' : '>'}\\ d = ${f(r.d)}\\ ${r.depth.dreq <= r.d ? '\\checkmark' : ''}` },
    { t: 'Minimum steel and spacing', tex: `A_{s,min} = ${f(r.ts.ratio, 4)}bh = ${f(r.AsMin)}\\text{ in}^2/\\text{ft};\\quad s_{max} = \\min(3h, 18) = ${f(r.smax)}\\text{ in}` },
  ]
  return (
    <Sol>
      <StepList steps={steps} />
      <SH>Moments (Mu = wu ln² / C) and steel</SH>
      <Tbl
        head={['section', 'C', 'ln (ft)', 'Mu (k-ft/ft)', 'As req (in²/ft)', 'As design', `No. ${r.bar} @`]}
        rows={r.sections.filter((s) => !s.mirror).map((s) => [s.label, `1/${s.den}`, f(s.ln), f(s.Mu, 2), f(s.as.As), f(s.AsD) + (s.usesMin ? ' (min)' : ''), `${f(s.sp.s)} in`])}
      />
      <SH>Detailing (alternate bars cranked)</SH>
      <Md>{`- Bottom: No. ${r.bar} @ ${r.spanBars.map((s) => f(s.s)).filter((v, i, a) => a.indexOf(v) === i).join(' / ')} in c/c; alternate bars cranked up at the supports.
${r.supports
  .filter((x) => !x.sec.mirror)
  .map((x) => `- ${x.sec.label}: needs ${f(x.sec.AsD)} in²/ft; cranked bars give one bar per ${f(x.extra.width)} in → ${x.extra.n > 0 ? `**${x.extra.n} extra No. ${r.bar}** between the cranked bars (or No. ${r.bar} @ ${x.extra.sExtra ?? '—'} in extra top)` : 'no extra top bars needed'}; straight-bar alternative No. ${r.bar} @ ${f(x.straight.s)} in top.`)
  .join('\n')}
- Temperature & shrinkage: $${f(r.ts.ratio, 4)}\\times12\\times${f(r.h)} = ${f(r.ts.As)}$ in²/ft → **No. 3 @ ${f(r.ts.s)} in** perpendicular to the main bars.
- Shear: $V_u = ${f(r.shear.c, 2)}w_ul_n/2 - w_ud = ${f(r.shear.Vd, 2)}$ k/ft vs $\\phi V_c = ${f(r.shear.phiVc, 2)}$ k/ft ${r.shear.ok ? '✓' : '✗'}.`}</Md>
      {endNote && <Md className="text-mute text-xs">{endNote}</Md>}
      {r.warnings.length > 0 && <Md className="text-xs text-mute">{r.warnings.map((w) => `- ${w}`).join('\n')}</Md>}
    </Sol>
  )
}

// ================================================================ figures for this paper
const fig1 = () => (
  <Fig w={460} h={230}>
    <RectSec x={70} y={20} s={6.5} b={12} h={27} rows={[{ n: 3, y: 24 }]} />
    <Dim x1={50} y1={20} x2={50} y2={20 + 27 * 6.5} label={'27"'} side="l" />
    <Dim x1={170} y1={20} x2={170} y2={20 + 24 * 6.5} label={'d = 24"'} />
    <Dim x1={70} y1={208} x2={70 + 12 * 6.5} y2={208} label={'12"'} side="b" />
    <T x={110} y={20 + 24 * 6.5 - 12}>3 #10</T>
    <Lines x={270} y={40} lines={['Given:', "f′c = 4 ksi", 'fy = 60 ksi', 'fs = 24 ksi', 'fr = 7.5√f′c psi', 'n = 8']} />
  </Fig>
)

const fig2 = () => (
  <Fig w={600} h={210}>
    <T x={230} y={30} c={C.load}>
      Service live load = 2.0 kip/ft
    </T>
    <T x={230} y={46} c={C.load}>
      Unfactored superimposed DL = 1.5 kip/ft (excluding self-wt of beam)
    </T>
    <SSBeam x0={30} y={90} len={380} L={22} />
    <RectSec x={470} y={50} s={4.2} b={14} h={26} rows={[]} />
    <Dim x1={540} y1={50} x2={540} y2={50 + 26 * 4.2} label={'h = 26"'} />
    <Dim x1={470} y1={176} x2={470 + 14 * 4.2} y2={176} label={'14"'} side="b" />
    <T x={500} y={205} s={11} c={C.mute}>
      Section A-A
    </T>
    <T x={220} y={196} s={11}>
      {"f′c = 3 ksi, fy = 60 ksi"}
    </T>
  </Fig>
)

const fig3 = (comp: boolean, title: string, given: string[]) => () => (
  <Fig w={460} h={250}>
    <RectSec x={70} y={20} s={6.2} b={12} h={30.5} rows={[...(comp ? [{ n: 3, y: 2.5 }] : []), { n: 4, y: 26.5 }, { n: 4, y: 29.5 }]} />
    <Dim x1={165} y1={20} x2={165} y2={20 + 27 * 6.2} label={'d = 27"'} />
    <Dim x1={70} y1={228} x2={70 + 12 * 6.2} y2={228} label={'12"'} side="b" />
    {comp && <Dim x1={50} y1={20} x2={50} y2={20 + 2.5 * 6.2} label={'2.5"'} side="l" />}
    {comp && <T x={107} y={56}>3 #7 bars</T>}
    <T x={107} y={20 + 25.2 * 6.2}>8 #8 bars</T>
    <Lines x={270} y={40} lines={['Given:', ...given, 'd = 27 in.', 'dt = 28.5 in.']} />
    <T x={270} y={200} s={11} c={C.mute}>
      {title}
    </T>
  </Fig>
)

const fig4 = () => (
  <Fig w={520} h={230}>
    <FloorSec x={30} y={30} s={2.6} hf={3} bw={12} sp={48} hw={21} />
    <Bars n={3} x1={30 + 14 * 2.6 + 8} x2={30 + 26 * 2.6 - 8} y={30 + 19 * 2.6} r={2.6} />
    <Bars n={3} x1={30 + 14 * 2.6 + 8} x2={30 + 26 * 2.6 - 8} y={30 + 21.5 * 2.6} r={2.6} />
    <Dim x1={18} y1={30} x2={18} y2={30 + 3 * 2.6} label={'3"'} side="l" />
    <Dim x1={30 + 30 * 2.6} y1={30} x2={30 + 30 * 2.6} y2={30 + 21 * 2.6} label={'d = 21"'} />
    {[0, 1, 2].map((i) => (
      <Dim key={i} x1={30 + (14 + i * 48) * 2.6} y1={110} x2={30 + (26 + i * 48) * 2.6} y2={110} label={'12"'} side="b" />
    ))}
    <Dim x1={30 + 20 * 2.6} y1={140} x2={30 + 68 * 2.6} y2={140} label={'48"'} side="b" />
    <Dim x1={30 + 68 * 2.6} y1={140} x2={30 + 116 * 2.6} y2={140} label={'48"'} side="b" />
    <Lines x={120} y={182} lines={["f′c = 3 ksi, fy = 60 ksi", 'Beam span = 25 ft,  Mu = 600 kip-ft']} />
  </Fig>
)

const fig6 = () => (
  <Fig w={620} h={210}>
    <SSBeam x0={30} y={95} len={400} L={40} cuts={[10, 20, 30]} pls={[{ at: 10, label: '30k' }, { at: 20, label: '30k' }, { at: 30, label: '30k' }]} />
    <T x={430} y={70} a="end" c={C.load}>
      2.5 kip/ft
    </T>
    <T x={230} y={200} b>
      All loads are factored
    </T>
    <rect x={470} y={50} width={120} height={14} fill={C.conc} stroke={C.ink} />
    <rect x={510} y={63} width={15 * 2.7} height={24 * 2.7 - 14} fill={C.conc} stroke={C.ink} />
    <rect x={511} y={61} width={15 * 2.7 - 2} height={4} fill={C.conc} />
    <circle cx={530} cy={50 + 24 * 2.7} r={4} fill={C.steel} stroke={C.ink} />
    <Dim x1={605} y1={50} x2={605} y2={50 + 24 * 2.7} label={'24"'} />
    <Dim x1={510} y1={135} x2={510 + 15 * 2.7} y2={135} label={'15"'} side="b" />
    <T x={530} y={170} s={11} c={C.mute}>
      SECTION
    </T>
  </Fig>
)

const fig7 = () => (
  <Fig w={520} h={170}>
    <T x={250} y={36} c={C.load}>
      LL = 1.0 kip/ft,  DL = 1.5 kip/ft (excluding self wt)
    </T>
    <SSBeam x0={40} y={78} len={420} L={36} dimLabels={["36'-0\""]} />
  </Fig>
)

const fig8 = () => (
  <Fig w={460} h={290}>
    <SlabPlan x={60} y={40} s={6.4} cols={[25, 25]} rows={[20, 20]} t={7} />
    <T x={395} y={150} a="start" s={11}>
      10" brick
    </T>
    <T x={395} y={164} a="start" s={11}>
      wall (all edges)
    </T>
    <T x={220} y={312 - 20} s={11} c={C.mute}>
      2 × 2 panels, each 25′ × 20′
    </T>
  </Fig>
)

// ================================================================ questions
const P = '2012-13' as const
const PG = { s1: [63], s2: [64], s3: [65], f1: [66], f2: [67], tab: [68, 69] }

export const R2012: RcQ[] = [
  {
    id: 'rc-2012-13-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 8,
    topics: ['rc-basics'],
    title: 'Sources of uncertainty and how USD ensures safety',
    pages: PG.s1,
    theory: true,
    text: 'What are the sources of uncertainties in analysis, design and construction of RC structures? Discuss how safety is ensured against these uncertainties in USD method.',
    given: [],
    solution: ans(A_UNCERT),
  },
  {
    id: 'rc-2012-13-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 9,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Flexural behaviour under increasing load: uncracked, cracked, ultimate',
    pages: PG.s1,
    theory: true,
    text: 'Discuss the behaviour of reinforced concrete rectangular beam in flexure under increasing load by drawing neat sketches for strain and stress distribution of uncracked, cracked and ultimate conditions.',
    given: [],
    solution: ans(A_STAGES, StagesSketch),
  },
  // needs: elastic engine — Mcr from Ig (and I_ut with n = 8)
  {
    id: 'rc-2012-13-1c-i',
    paper: P,
    sec: 'A',
    no: '1(c)(i)',
    marks: 9,
    topics: ['rc-elastic'],
    title: 'Cracking moment of a 12 × 27 in section (3 No. 10)',
    pages: [...PG.s1, ...PG.f1],
    text: `A singly reinforced RC beam section, as shown in Fig. 1, has a width of 12 in., effective depth of 24 in. and total depth of 27 in. The tension reinforcement consists of three No. 10 bars in one row.

Given: $f'_c = 4$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $f_r = 7.5\\sqrt{f'_c}$ psi, $n = 8$.

Find: (i) Cracking moment.`,
    given: [],
    figure: fig1,
    notes: ['The paper does not say whether to use the gross section or the uncracked transformed section for Mcr; work both (gross is the usual exam answer).'],
  },
  // needs: elastic engine — cracked transformed section (kd, Icr), fc and fs at M = 125 k-ft
  {
    id: 'rc-2012-13-1c-ii',
    paper: P,
    sec: 'A',
    no: '1(c)(ii)',
    marks: 9,
    topics: ['rc-elastic'],
    title: 'Service stresses fc and fs at M = 125 k-ft (cracked section)',
    pages: [...PG.s1, ...PG.f1],
    text: `For the beam section of Fig. 1 (b = 12 in., d = 24 in., h = 27 in., three No. 10 bars in one row; $f'_c = 4$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $f_r = 7.5\\sqrt{f'_c}$ psi, $n = 8$):

Find: (ii) Stresses in concrete and steel caused by a bending moment $M = 125$ kip-ft.`,
    given: [],
    figure: fig1,
    notes: ['M = 125 k-ft is well above Mcr from (i), so the section is cracked; fs = 24 ksi is the allowable to compare the steel stress with.'],
  },
  {
    id: 'rc-2012-13-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Purpose of minimum flexural steel; ACI/BNBC ρmin',
    pages: PG.s1,
    theory: true,
    text: 'What is the purpose of providing minimum amount of flexural steel in a beam? Write ACI/BNBC code provisions for minimum reinforcement ratios.',
    given: [],
    solution: ans(A_RHOMIN),
  },
  {
    id: 'rc-2012-13-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 10,
    topics: ['rc-singly'],
    title: 'φ from εt: justification, variation, and the ρmax limit',
    pages: PG.s1,
    theory: true,
    text: 'What is the justification of selecting strength reduction factor φ based on net tensile strain εt? Discuss the variation of φ with εt as given in ACI code? Also, explain how εt controls maximum reinforcement ratio.',
    given: [],
    solution: ans(A_PHI_ET + '\n\n' + A_ET_RHOMAX, PhiChart),
  },
  // needs: doubly design engine — b = 12, h = 24, d = 20, dt = 21.5, d' = 2.5, Mu = 375, f'c 3, fy 50
  {
    id: 'rc-2012-13-2c',
    paper: P,
    sec: 'A',
    no: '2(c)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Design As (and A′s) for Mu = 375 k-ft, 12 × 24 in, fy = 50 ksi',
    pages: PG.s1,
    text: `A beam section is limited to width $b = 12$ in. and total depth $h = 24$ in. Calculate the required reinforcement if the beam has to resist a factored moment $M_u = 375$ kip-ft. Assume two layer tensile reinforcement with $d = 20$ in. and $d_t = 21.5$ in. Also, assume $d' = 2.5$ in. if compression steel is required.

Given: $f'_c = 3$ ksi and $f_y = 50$ ksi.`,
    given: [],
    notes: ['Check the singly reinforced capacity at εt = 0.005 first; it falls well short of 375 k-ft, so compression steel is needed. fy = 50 ksi (εy = 0.00172).'],
  },
  {
    id: 'rc-2012-13-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 6,
    topics: ['rc-basics'],
    title: 'Why concrete cover matters; ACI cover values',
    pages: PG.s1,
    theory: true,
    text: "Why is concrete cover over rebar important? What are the recommended values of 'cover' as per ACI code?",
    given: [],
    solution: ans(A_COVER),
  },
  // needs: load combo + singly design engine — 22 ft SS, 14 × 26, self-weight added, f'c 3, fy 60
  {
    id: 'rc-2012-13-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 16,
    topics: ['rc-singly'],
    title: 'Flexural design of a 22 ft simple beam, section fixed at 14 × 26 in',
    pages: [...PG.s1, ...PG.f1],
    text: `A rectangular beam carries a service live load (unfactored) of 2.0 kip/ft and an unfactored superimposed dead load of 1.5 kip/ft (in addition to self weight of beam) on a 22 ft simple span as shown in Fig. 2. The beam will have a cross-section of 14″ × 26″ for architectural reasons.

Given: $f'_c = 3$ ksi and $f_y = 60$ ksi. Design the beam for flexure.`,
    given: [],
    figure: fig2,
    flag: 'Load factors not printed: solve with 1.2D + 1.6L (paper era: 1.4D + 1.7L)',
    notes: ['d is not given: take d = h − 2.5 in = 23.5 in (one layer).', 'Self-weight = (14 × 26/144) × 0.150 = 0.379 k/ft, added to the 1.5 k/ft superimposed dead load.'],
  },
  // needs: singly review engine (two layers, φ from εt) — b 12, d 27, dt 28.5, 8 #8, f'c 4, fy 60
  {
    id: 'rc-2012-13-3c',
    paper: P,
    sec: 'A',
    no: '3(c)',
    marks: 13,
    topics: ['rc-singly'],
    title: 'Mn and φMn of a 12 in beam with 8 No. 8 in two rows',
    pages: [...PG.s2, ...PG.f1],
    text: `A rectangular beam has a width 12 in. and an effective depth 27 in. as shown in Fig. 3. It is reinforced with eight No. 8 bars in two rows ($d = 27$ in., $d_t = 28.5$ in.). If $f_y = 60$ ksi and $f'_c = 4$ ksi, what is the nominal flexural strength $M_n$ and what is the maximum moment $\\phi M_n$ that can be utilized in the design?`,
    given: [],
    figure: fig3(false, 'Fig. 3 (h not shown)', ["f′c = 4 ksi", 'fy = 60 ksi']),
    notes: ['εt lands in the transition zone (just under 0.005), so φ is a little below 0.90 — that is the point of the question.'],
  },
  // needs: T-beam design engine — beff rules, true-T split, As,min and εt checks
  {
    id: 'rc-2012-13-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 18,
    topics: ['rc-tbeam'],
    title: 'T-beam As at midspan for Mu = 600 k-ft (3 in slab, beams at 48 in)',
    pages: [...PG.s2, ...PG.f2],
    text: `A floor system consists of a 3 in. slab supported by continuous T-beams with 25 ft span, 48 in. on centres as shown in Fig. 4. Web dimensions as determined by negative moment requirement at support are $b_w = 12$ in. and $d = 21$ in. What tensile reinforcement is required at midspan to resist a factored moment $M_u = 600$ kip-ft, if $f_y = 60$ ksi and $f'_c = 3$ ksi? Also, check minimum reinforcement and $\\varepsilon_t$.`,
    given: [],
    figure: fig4,
    notes: ['beff = min(L/4 = 75 in, bw + 16hf = 60 in, c/c spacing = 48 in) = 48 in.', 'A rectangular trial gives a greater than hf = 3 in, so the section acts as a true T.'],
  },
  // needs: doubly review engine (strain compatibility, f's check) — b 12, d 27, dt 28.5, 8 #8, 3 #7 @ 2.5, f'c 3.5, fy 60
  {
    id: 'rc-2012-13-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 17,
    topics: ['rc-doubly'],
    title: 'φMn of a doubly reinforced beam; does A′s yield?',
    pages: [...PG.s2, ...PG.f2],
    text: `A rectangular RC beam as shown in Fig. 5 measures 12 in. wide and has an effective depth of 27 in. Tension steel consists of eight No. 8 bars in two layers ($d = 27$ in., $d_t = 28.5$ in.) and compression steel consisting of three No. 7 bars is located 2.5 in. from the compression face. If $f'_c = 3.5$ ksi and $f_y = 60$ ksi, what is the design moment capacity of the beam according to ACI code. Check for yielding of compression steel.`,
    given: [],
    figure: fig3(true, 'Fig. 5', ["f′c = 3.5 ksi", 'fy = 60 ksi']),
  },
  // needs: shear engine (Case A–D, zones) — SS 40 ft, 3 × 30 k @ 10/20/30 + 2.5 k/ft factored, bw 15, d 24, f'c 3
  {
    id: 'rc-2012-13-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Stirrup design: 40 ft beam, three 30 k loads + 2.5 k/ft (factored)',
    pages: [...PG.s2, ...PG.f2],
    text: `A simply supported beam carries the factored load as shown in Fig. 6. Design the stirrups and make a neat sketch showing the stirrups. Given: $f'_c = 3$ ksi and $f_y = 60$ ksi.

Fig. 6: span 40 ft (4 × 10 ft); 30 k at 10, 20 and 30 ft plus 2.5 kip/ft over the whole span — all loads are factored. Section: web $b_w = 15$ in., $d = 24$ in.`,
    given: [],
    figure: fig6,
    notes: [
      'Support width is not shown: the critical section is taken d = 2 ft from the support (treat the support as a point/face).',
      'Self-weight is not mentioned; the loads are used as given (factored). The flange size does not matter for shear (bw = 15 in).',
    ],
  },
  // needs: singly design engine with self-weight iteration — SS 36 ft, DL 1.5 (excl. sw), LL 1.0, f'c 3.5, fy 60
  {
    id: 'rc-2012-13-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Design a singly reinforced 36 ft simple beam (choose b, d, As)',
    pages: [...PG.s2, ...PG.f2],
    text: `Design a singly reinforced beam shown in Fig. 7. The dead load does not include self weight of the beam. Given: $f'_c = 3.5$ ksi and $f_y = 60$ ksi.

Fig. 7: simple span 36′-0″; LL = 1.0 kip/ft, DL = 1.5 kip/ft (excluding self wt).`,
    given: [],
    figure: fig7,
    flag: 'Load factors not printed: solve with 1.2D + 1.6L (paper era: 1.4D + 1.7L)',
    notes: ['Section size is free: assume self-weight, pick ρ (e.g. ρ0.005 or about 0.5ρmax) and b/d ≈ 0.5, then recheck the self-weight.'],
  },
  // needs: one-way slab engine (h_min, ACI coefficients, As per ft, T&S) — 2 spans × 16 ft clear, LL 120 psf, f'c 3, fy 60
  {
    id: 'rc-2012-13-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 20,
    topics: ['rc-oneway'],
    title: 'Two-span one-way slab (16 ft clear spans, LL 120 psf) by ACI coefficients',
    pages: PG.s2,
    text: `A reinforced concrete one-way slab is built integrally with its supports and consists of two equal spans, each with a clear span of 16 ft. The service live load on the slab is 120 psf. Design the slab by USD method and show the reinforcements with neat sketches. Given: $f'_c = 3.0$ ksi and $f_y = 60$ ksi.`,
    given: [],
    flag: 'Load factors not printed: solve with 1.2D + 1.6L (paper era: 1.4D + 1.7L)',
    notes: ['No floor finish or partitions are given: DL = self-weight only.', 'h from the one-end-continuous rule l/24; supports are integral (spandrel beams) for the exterior negative coefficient.'],
  },
  {
    id: 'rc-2012-13-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 6,
    topics: ['rc-basics', 'rc-oneway'],
    title: 'ACI minimum thickness of beams and one-way slabs',
    pages: PG.s2,
    theory: true,
    text: 'Write down the minimum thickness for RC beams and one-way slabs for different end conditions as per ACI code.',
    given: [],
    solution: ans(A_HMIN),
  },
  {
    id: 'rc-2012-13-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 9,
    topics: ['rc-oneway'],
    title: 'Temperature & shrinkage reinforcement: purpose and ACI/BNBC limits',
    pages: PG.s2,
    theory: true,
    text: 'What is meant by temperature and shrinkage reinforcement? Discuss their importances mentioning the limitations for minimum amount and spacing of such reinforcements as per ACI/BNBC code.',
    given: [],
    solution: ans(A_TS),
  },
  {
    id: 'rc-2012-13-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Cut-off and bend points for approximately equal spans (sketch)',
    pages: PG.s3,
    theory: true,
    text: 'Show with neat sketches cut off or bend points for bars in approximately equal spans with uniformly distributed loads.',
    given: [],
    solution: ans(A_CUTOFF, CutoffSketch),
  },
  {
    id: 'rc-2012-13-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Factors influencing development length',
    pages: PG.s3,
    theory: true,
    text: 'Discuss briefly the factors that influence development length of a reinforcing bar.',
    given: [],
    solution: ans(A_LD),
  },
  {
    id: 'rc-2012-13-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 9,
    topics: ['rc-basics'],
    title: 'Factors affecting failure of concrete structures',
    pages: PG.s3,
    theory: true,
    text: 'Describe in brief the factors affecting failure in concrete structures.',
    given: [],
    flag: 'General question, not on the current slides',
    solution: ans(A_FAILURE),
  },
  // needs: bond engine (simplified ld, ψt, mm bars) — 16 mm and 25 mm, f'c 3500, fy 60000
  {
    id: 'rc-2012-13-7d',
    paper: P,
    sec: 'B',
    no: '7(d)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'ld of 16 mm and 25 mm bars, top bars and other bars',
    pages: PG.s3,
    text: `Calculate the development length by USD method for 16 mm and 25 mm bars when used as (i) top bars, (ii) for other bars. Given: $f'_c = 3500$ psi and $f_y = 60{,}000$ psi.`,
    given: [],
    notes: ['Cover, spacing and stirrups are not given: assume the favourable case (clear spacing ≥ db, cover ≥ db, minimum stirrups), uncoated bars, normal-weight concrete.', '16 mm (≈ No. 5) uses the No. 6-and-smaller equation; 25 mm (≈ No. 8) the No. 7-and-larger one. Top bars: ψt = 1.3.'],
  },
  // needs: two-way slab engine (case 4, m = 0.8, Tables 12.3–12.5) — 25 × 20 ft panels, LL 80, FF 25, PW 30, f'c 3, fy 60
  {
    id: 'rc-2012-13-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 25,
    topics: ['rc-twoway'],
    title: 'Two-way slab, four 25 × 20 ft panels on brick walls (coefficient method)',
    pages: [...PG.s3, ...PG.f2, ...PG.tab],
    text: `For the slabs shown in Fig. 8, calculate design moments by USD method and corresponding reinforcements. Show all the reinforcements in neat sketches (in plan and in two sections). Given: LL = 80 psf; FF = 25 psf (as DL), random partition wall = 30 psf (as DL). $f'_c = 3$ ksi and $f_y = 60$ ksi. Use Tables.

Fig. 8: 2 × 2 panels, each 25′ × 20′ (50′ × 40′ overall); every panel edge rests on a 10″ brick wall.`,
    given: [
      { label: 'Table 12.3', what: 'negative-moment coefficients', ref: 'sl-t123' },
      { label: 'Table 12.4', what: 'DL positive-moment coefficients', ref: 'sl-t124' },
      { label: 'Table 12.5', what: 'LL positive-moment coefficients', ref: 'sl-t125' },
    ],
    figure: fig8,
    flag: 'Load factors not printed: solve with 1.2D + 1.6L (paper era: 1.4D + 1.7L)',
    notes: [
      'Every panel is a corner panel: Case 4 (two adjacent edges continuous), m = la/lb = 20/25 = 0.80.',
      '25′ and 20′ are taken as clear spans (as in the slab solutions PDF). Slab thickness is not given: h from perimeter/180 = 2(25 + 20)(12)/180 = 6 in.',
      'No load-distribution (wa/wb) table was attached, so loads on the walls are not asked.',
    ],
  },
  {
    id: 'rc-2012-13-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 10,
    topics: ['rc-basics'],
    title: 'Five RC floor systems used in Bangladesh (sketches)',
    pages: PG.s3,
    theory: true,
    text: 'Describe with neat sketches five reinforced concrete floor systems commonly used in Bangladesh.',
    given: [],
    solution: ans(A_FLOORS, FloorsSketch),
  },
]
