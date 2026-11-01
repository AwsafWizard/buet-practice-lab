// CE 315 term final 2011-12 (held 6 Oct 2013) — PDF pp. 70–73.
// Section A is one chained problem on the Fig. 1 cantilever: Q1 Mcr → Q2(b) service capacity and loads →
// Q3(b) φMn → Q4(a) factored loads → Q5(b) stirrups → Q6(b) anchorage in the column → Q7(b) cut-off.
// Marks are the hand-corrected values on the scan (printed values in the notes).
import { Md } from '../../../components/ui'
import type { RcQ } from '../../types'
import { allowableMoment, uncracked, type ElasticInput } from '../../engine/elastic'
import { As as Asof } from '../../engine/materials'
import { review } from '../../engine/singly'
import { designDoubly, pickBars as pickD, type DoublyDesignIn } from '../../engine/doubly'
import { designT, effectiveWidth, floorLoads, reviewT, type TDesignIn } from '../../engine/tbeam'
import type { ShearBeam, ShearSection } from '../../engine/shear'
import { bar, beamBarGeometry, columnAnchorage, cutoff, hookFactors, ldhCalc, ldSimplified, simplifiedCase, upIn } from '../../engine/bond'
import { oneWayCoef } from '../../engine/oneway'
import {
  A_COVER,
  A_LD,
  A_STAGES,
  A_TS,
  Arrow,
  C,
  Dim,
  doublyDesignSteps,
  doublyReviewSteps,
  Fig,
  Final,
  freeBeam,
  Hatch,
  lazy,
  OneWaySol,
  RectSec,
  SH,
  shearChecks,
  ShearSol,
  SlabPlan,
  Sol,
  SSBeam,
  StagesSketch,
  StepList,
  T,
  Tbl,
  tDesignSteps,
  Udl,
  ans,
  f,
  type SolStep,
} from './r2012'

// ================================================================ shared theory answers first asked in this paper
export const A_OVER = `### Under-reinforced beam
- Steel ratio below the balanced ratio ($\\rho < \\rho_b$). At failure the **tension steel yields first** ($\\varepsilon_s > \\varepsilon_y$) and keeps stretching while the concrete has not yet crushed.
- Wide cracks and large deflections appear before collapse: the failure is **ductile, with ample warning**. The steel is fully used ($f_s = f_y$).

### Over-reinforced beam
- Steel ratio above the balanced ratio ($\\rho > \\rho_b$). The **concrete crushes** ($\\varepsilon_c = 0.003$) **before the steel yields**.
- Failure is **sudden and brittle**, with little deflection or cracking as warning. The steel is not fully used (uneconomical).

### Balanced section
Steel yields exactly when the concrete reaches 0.003: $\\rho_b = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.003 + \\varepsilon_y}$.

### Which is preferred?
**Under-reinforced** — it warns before failing, allows moment redistribution, uses the steel fully and is less sensitive to variations in f'c. ACI enforces it: $\\varepsilon_t \\ge 0.004$ at nominal strength for beams ($\\rho \\le \\rho_{max} \\approx 0.71\\rho_b$ for Grade 60) and full φ = 0.90 only when $\\varepsilon_t \\ge 0.005$.`

export const A_LF = `- **Dead load** is the weight of the structure and fixed items. It is computed from member dimensions and unit weights that the designer controls, so its actual value differs little from the computed one (small coefficient of variation, ≈ 10 %). A small factor is enough: **1.2D** (1.4D alone where dead load dominates).
- **Live load** comes from occupancy and use. It varies in space and time, is controlled by the user, can be exceeded by overcrowding, storage or a change of use, and the code value is only an estimate of the lifetime maximum. Its uncertainty is much larger, so it gets a larger factor: **1.6L** (1.7L in ACI before 2002).
- Reliability basis: a load factor is roughly $1 + k V$ where $V$ is the coefficient of variation of the load. A more variable load needs a larger factor so that every combination has about the same probability of failure (β ≈ 3–4).
- Combinations with wind or earthquake use smaller factors on L because the maxima are unlikely to coincide.`

export const A_CRITD = `- Where the beam sits on a support (or frames into a column) and the load is applied at the top, the **support reaction puts the end region into vertical compression**. This compression clamps the concrete near the support and suppresses diagonal tension there.
- The inclined crack that can cause failure runs at about 45° from the tension steel up toward the load. The first such crack near a support starts roughly **d from the face**. A crack closer to the support would run into the support itself and be crossed by the compression strut.
- Loads applied within d of the face go **directly into the support by arch (strut) action** rather than by beam shear, so they do not add to the diagonal tension on the critical crack.
- Hence ACI (9.4.3.2) lets sections closer than d be designed for **Vu at d**, provided (i) the reaction introduces compression into the end region, (ii) the loads act at or near the top of the beam, and (iii) no concentrated load acts between the face and d.
- The **face** is the critical section instead when the beam is supported by a girder of similar depth or by a member in tension, when the load hangs from the bottom of the beam, or when a concentrated load acts within d of the face.`

export function CritSketch() {
  const panel = (x: number, title: string, atD: boolean, kind: 'bear' | 'col' | 'conc' | 'hang') => (
    <g>
      <T x={x + 70} y={18} b s={11}>
        {title}
      </T>
      <rect x={x + 10} y={40} width={130} height={40} fill={C.conc} stroke={C.ink} />
      {kind === 'bear' && <rect x={x + 10} y={80} width={22} height={14} fill={C.mute} opacity={0.6} />}
      {kind === 'col' && <rect x={x + 10} y={80} width={22} height={40} fill={C.conc} stroke={C.ink} />}
      {kind === 'conc' && (
        <>
          <rect x={x + 10} y={80} width={22} height={14} fill={C.mute} opacity={0.6} />
          <Arrow x1={x + 44} y1={22} x2={x + 44} y2={40} />
        </>
      )}
      {kind === 'hang' && (
        <>
          <rect x={x + 10} y={20} width={22} height={20} fill={C.conc} stroke={C.ink} />
          <Arrow x1={x + 80} y1={80} x2={x + 80} y2={100} />
          <T x={x + 96} y={100} s={11} a="start">
            hung load
          </T>
        </>
      )}
      <line x1={atD ? x + 62 : x + 32} y1={36} x2={atD ? x + 62 : x + 32} y2={84} stroke={C.load} strokeWidth={2} strokeDasharray="4 2" />
      {atD && <Dim x1={x + 32} y1={30} x2={x + 62} y2={30} label="d" />}
      <line x1={x + 34} y1={78} x2={x + 70} y2={44} stroke={C.ink} strokeWidth={1.2} />
      <T x={x + 75} y={136} s={11} c={atD ? C.ink : C.load}>
        {atD ? 'critical at d' : 'critical at the face'}
      </T>
    </g>
  )
  return (
    <Fig w={640} h={150}>
      {panel(0, '(a) bearing support', true, 'bear')}
      {panel(160, '(b) monolithic column', true, 'col')}
      {panel(320, '(c) load within d', false, 'conc')}
      {panel(480, '(d) girder / hung load', false, 'hang')}
    </Fig>
  )
}

export const A_EXT12 = `A bar is "theoretically no longer required" where the moment diagram drops to the capacity of the remaining bars. ACI still asks it to run on by $d$ or $12d_b$ (the larger), because:

1. **Shift of the tension diagram by diagonal cracking.** Once an inclined crack forms, the steel force at the bottom of the crack is set by the moment at the *top* of the crack, $T \\approx M_a/z$, which is about $d$ further toward the higher moment. The steel tension curve is therefore shifted about $d$ away from the moment diagram, so the bar is needed roughly $d$ beyond the theoretical point.
2. **Uncertain moment diagram.** Actual loads, load patterns, support settlements and analysis approximations make the real moment curve differ from the one used, so the cut-off point may move.
3. **Stress concentration at the bar end.** Stopping a bar causes a sudden change of steel area, local cracking and loss of shear strength. Running the bar on keeps that discontinuity away from where the bar is still stressed.
4. **Construction tolerance** in placing and cutting bars.

The rule does not apply at the supports of simple spans or at the free ends of cantilevers. Separately, the bar must be embedded at least $l_d$ beyond the point of maximum stress, and the continuing bars need $l_d$ beyond the cut-off point.`

export const A_CRACKS = `(sketch below)

1. **Shear (diagonal-tension) cracks** — inclined at about 45°, in the web near the supports where the shear is large. Web-shear cracks start near mid-depth; flexure-shear cracks start as short vertical flexural cracks and bend over toward the load.
2. **Shrinkage cracks** — caused by restrained drying shrinkage (and temperature). Fine cracks roughly perpendicular to the restrained direction, spread fairly evenly along the member, or a random map pattern on surfaces. They are not related to the loading.
3. **Flexural cracks** — vertical cracks starting at the tension face where the moment is largest (bottom near midspan, top over supports). They are widest at the steel level and die out near the neutral axis.
4. **Bond (splitting) cracks** — longitudinal cracks along the line of the bars, on the bottom or side face, where cover or bar spacing is small and bar forces change rapidly (anchorage zones, splices, cut-offs). They precede bond failure.`

export function CracksSketch() {
  const beam = (y: number, title: string) => (
    <g>
      <rect x={30} y={y} width={260} height={46} fill={C.conc} stroke={C.ink} />
      <polygon points={`${30},${y + 46} ${22},${y + 60} ${38},${y + 60}`} fill="none" stroke={C.ink} />
      <circle cx={290} cy={y + 53} r={6} fill="none" stroke={C.ink} />
      <T x={30} y={y - 6} a="start" b s={11}>
        {title}
      </T>
    </g>
  )
  const st = { stroke: C.load, strokeWidth: 1.6, fill: 'none' }
  return (
    <Fig w={640} h={190}>
      {beam(30, '(i) diagonal-tension (shear) cracks')}
      {[50, 70, 230, 250].map((x, i) => (
        <path key={i} d={i < 2 ? `M${x},${74} l22,-32` : `M${x + 20},${74} l-22,-32`} {...st} />
      ))}
      {beam(120, '(iii) flexural cracks')}
      {[130, 150, 170, 190].map((x, i) => (
        <path key={i} d={`M${x},${166} l${i % 2},-${24 - Math.abs(160 - x) / 10}`} {...st} />
      ))}
      <g transform="translate(320,0)">
        {beam(30, '(ii) shrinkage cracks')}
        {[60, 100, 140, 180, 220, 260].map((x) => (
          <path key={x} d={`M${x},31 l1,44`} {...st} strokeWidth={1} />
        ))}
        {beam(120, '(iv) bond (splitting) cracks')}
        <line x1={40} y1={158} x2={280} y2={158} stroke={C.steel} strokeWidth={3} />
        <path d="M50,162 l40,0 M110,162 l50,1 M60,154 l30,-1" {...st} />
      </g>
    </Fig>
  )
}

// ================================================================ figures
const fig1 = () => (
  <Fig w={640} h={250}>
    <Hatch x={30} y={20} w={54} h={210} />
    <path d="M30,20 l10,-8 l10,8 l10,-8 l10,8 l14,-8" fill="none" stroke={C.mute} />
    <rect x={84} y={80} width={432} height={63} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
    <Udl x1={90} x2={512} y={80} />
    <T x={300} y={52} c={C.load}>
      Dead load plus live load
    </T>
    <path d="M36,140 L36,89 L508,89" fill="none" stroke={C.steel} strokeWidth={2.6} />
    <path d="M40,93 L300,93" fill="none" stroke={C.steel} strokeWidth={2.6} strokeDasharray="7 3" />
    <T x={210} y={110} s={11}>
      3 #9
    </T>
    <T x={320} y={110} s={11} a="start">
      1 bar discontinued (location to find)
    </T>
    <T x={440} y={110} s={11}>
      2 #9
    </T>
    <T x={48} y={160} s={11} a="start">
      standard hook
    </T>
    <Dim x1={30} y1={60} x2={36} y2={60} label={'2"'} />
    <Dim x1={30} y1={240} x2={84} y2={240} label={'18"'} side="b" />
    <Dim x1={84} y1={170} x2={516} y2={170} label={"12'-0\""} side="b" />
    <Dim x1={526} y1={80} x2={526} y2={143} label={'21"'} />
    <RectSec x={575} y={80} s={3} b={10} h={21} rows={[{ n: 3, y: 3 }]} edge={2} />
    <Dim x1={575} y1={160} x2={605} y2={160} label={'10"'} side="b" />
    <Dim x1={612} y1={80} x2={612} y2={89} label={'3"'} />
    <T x={590} y={200} s={11} c={C.mute}>
      support section
    </T>
    <T x={330} y={212} s={11}>
      {"f′c = 4000 psi, fy = 60,000 psi, normal-weight concrete"}
    </T>
  </Fig>
)

const fig2 = () => (
  <Fig w={470} h={240}>
    <SlabPlan x={60} y={40} s={6} cols={[30, 30]} rows={[14, 14]} t={6} colLabels={["30'-0\"", "30'-0\""]} rowLabels={["14'-0\"", "14'-0\""]} />
    <T x={260} y={225} s={11} c={C.mute}>
      hatched = brick walls (all edges)
    </T>
  </Fig>
)

const fig3 = () => (
  <Fig w={640} h={300}>
    <Hatch x={30} y={30} w={80} h={240} />
    <T x={70} y={154} s={11}>
      Supports
    </T>
    <rect x={110} y={30} width={160} height={240} fill={C.conc} stroke={C.ink} />
    {[36, 150, 264].map((y) => (
      <rect key={y} x={30} y={y - 6} width={240} height={12} fill="none" stroke={C.ink} strokeDasharray="5 3" />
    ))}
    <T x={190} y={100}>T = 5"</T>
    <Dim x1={110} y1={285} x2={270} y2={285} label={"16'-0\""} side="b" />
    <Dim x1={285} y1={36} x2={285} y2={150} label={"12'-0\""} />
    <Dim x1={285} y1={150} x2={285} y2={264} label={"12'-0\""} />
    <T x={470} y={100} b>
      Section A-A
    </T>
    <rect x={350} y={170} width={260} height={12} fill={C.conc} stroke={C.ink} />
    {[352, 474, 596].map((x) => (
      <rect key={x} x={x} y={130} width={12} height={41} fill={C.conc} stroke={C.ink} />
    ))}
    <T x={480} y={210} s={11}>
      5" slab at the bottom; 12" wide beams project upward
    </T>
    <Dim x1={358} y1={120} x2={480} y2={120} label={"12'-0\""} />
    <Dim x1={480} y1={120} x2={602} y2={120} label={"12'-0\""} />
    <T x={480} y={240} s={11} c={C.mute}>
      (beam depth not given; not to scale)
    </T>
  </Fig>
)

const fig4 = () => (
  <Fig w={520} h={170}>
    <T x={250} y={30} c={C.load}>
      DL = 1.5 kip/ft (excluding self-wt.),  LL = 1 kip/ft
    </T>
    <SSBeam x0={40} y={76} len={420} L={36} sup="arrows" dimLabels={["36'-0\""]} />
  </Fig>
)

// ================================================================ the chained cantilever (Section A)
const cant: ElasticInput = { b: 10, h: 21, d: 18, As: Asof(3, 9), fc: 4000 }
const u1 = lazy(() => uncracked(cant))
const a2 = lazy(() => {
  const r = allowableMoment(cant, 1.8, 30)
  const w = (2 * r.M) / 12 ** 2
  return { r, w, D: (2 / 3) * w, L: (1 / 3) * w }
})
const r3 = lazy(() => review({ b: 10, h: 21, fc: 4000, fy: 60000, layers: [{ As: Asof(3, 9), d: 18 }] }))
const f4 = lazy(() => {
  const { D, L } = a2()
  const wu = 1.2 * D + 1.6 * L
  const wuOld = 1.4 * D + 1.7 * L
  return { D, L, wu, Mu: (wu * 144) / 2, Vu: wu * 12, wuOld, MuOld: (wuOld * 144) / 2 }
})
const bm5 = lazy((): ShearBeam => ({ kind: 'cant', L: 12, wD: a2().D, wL: a2().L }))
const sec5: ShearSection = { bw: 10, d: 18, fc: 4000, fy: 60000 }
const b9 = bar('#9')
const anch = lazy(() => {
  const g = beamBarGeometry({ b: 10, cover: 1.5, ds: 0.375, db: b9.db, n: 3, faceCenter: 3 })
  const sc = simplifiedCase({ db: b9.db, clearSpacing: g.clearSpacing, clearCover: g.clearCover, stirrupsMin: true })
  const ld = ldSimplified({ db: b9.db, small: false, fc: 4000, fy: 60000, met: sc.met, psiT: 1.3 })
  const hf0 = hookFactors({ no: 9 })
  const hfc = hookFactors({ no: 9, sideCover: 2.5, tailCover: 2 })
  const ldh = ldhCalc({ db: b9.db, fc: 4000, fy: 60000 })
  const ldhC = ldhCalc({ db: b9.db, fc: 4000, fy: 60000, psiC: hfc.psiC })
  const col = columnAnchorage({ colDepth: 18, backCover: 2, ldStraight: ld.final, ldh: ldh.final })
  return { g, sc, ld, hf0, hfc, ldh, ldhC, col }
})
const cut7 = lazy(() => {
  const wu = f4().wu
  return { wu, r: cutoff({ dg: { kind: 'cant', L: 12, wu, P: 0 }, b: 10, d: 18, fc: 4000, fy: 60000, bar: b9, nTotal: 3, nCut: 1, ld: anch().ld.final, endEmbed: 2 }) }
})

function SfdBmd({ wu, L, Vu, Mu }: { wu: number; L: number; Vu: number; Mu: number }) {
  const X = (x: number) => 60 + (x / L) * 400
  const pts = Array.from({ length: 25 }, (_, i) => {
    const x = (L * i) / 24
    return `${X(x)},${190 + (110 * ((wu * (L - x) ** 2) / 2)) / Mu}`
  }).join(' ')
  return (
    <Fig w={520} h={320}>
      <T x={260} y={18} b>
        Shear force (k)
      </T>
      <line x1={X(0)} y1={110} x2={X(L)} y2={110} stroke={C.ink} />
      <polygon points={`${X(0)},110 ${X(0)},40 ${X(L)},110`} fill={C.load} opacity={0.3} stroke={C.load} />
      <T x={X(0) - 6} y={44} a="end">
        {f(Vu, 1)}
      </T>
      <T x={260} y={175} b>
        Bending moment (k-ft, hogging)
      </T>
      <line x1={X(0)} y1={190} x2={X(L)} y2={190} stroke={C.ink} />
      <polyline points={`${X(0)},190 ${pts}`} fill={C.steel} fillOpacity={0.2} stroke={C.steel} />
      <T x={X(0) - 6} y={300} a="end">
        {f(Mu, 1)}
      </T>
      <T x={X(L)} y={135} s={11} c={C.mute}>
        free end
      </T>
      <T x={X(0)} y={135} s={11} c={C.mute}>
        support face
      </T>
      <T x={260} y={316} s={11} c={C.mute}>
        {`wu = ${f(wu)} k/ft over 12 ft`}
      </T>
    </Fig>
  )
}

// ================================================================ Section B data
const s8 = lazy(() => oneWayCoef({ spans: [14, 14], ends: ['unrestrained', 'unrestrained'], ll: 30, other: 30, fc: 3000, fy: 40000 }))

const q9a = lazy(() => {
  const h = 24
  const d = h - 2.5
  const ld = floorLoads({ hf: 5, spacing: 12, bw: 12, h, sdl: 25, ll: 100 })
  const Mu = (ld.wu * 16 ** 2) / 2
  const bf = effectiveWidth({ kind: 'interior', L: 16, bw: 12, hf: 5, cc: 144 })
  const inp: TDesignIn = { Mu, beff: bf.b, bw: 12, hf: 5, d, fc: 3, fy: 60 }
  const r = designT(inp)
  const bars = pickD(r.As, 12, [8, 9, 10], 2)
  const bm: ShearBeam = { kind: 'cant', L: 16, wD: ld.wD, wL: ld.wL }
  const sec: ShearSection = { bw: 12, d, fc: 3000, fy: 60000 }
  return { h, d, ld, Mu, bf, inp, r, bars, bm, sec }
})
const b9b = lazy(() => freeBeam(36, 1.5, 1.0, 3500, 60000, 14))
const p10: DoublyDesignIn = { b: 24, d: 13, dt: 13, dp: 3, fc: 4, fy: 72.5, Mu: 450 }
const d10 = lazy(() => designDoubly(p10))
/** T-beam As with φ fixed at 0.9 (the paper-era method), then reviewed by the current φ–εt rule */
const t11 = lazy(() => {
  const inp: TDesignIn = { Mu: 500, beff: 20, bw: 10, hf: 5, d: 20, fc: 4, fy: 60 }
  const { beff, bw, hf, d, fc, fy, Mu } = inp
  const Asf = (0.85 * fc * (beff - bw) * hf) / fy
  const Mn1 = Asf * fy * (d - hf / 2) // k-in
  const Mn = (Mu * 12) / 0.9
  const Mn2 = Mn - Mn1
  // Mn2 = Asw fy (d − a/2), a = Asw fy / (0.85 fc bw)  →  (0.85fc bw) a (d − a/2) = Mn2
  const k = 0.85 * fc * bw
  const a = d - Math.sqrt(d * d - (2 * Mn2) / k)
  const Asw = (k * a) / fy
  const As = Asf + Asw
  const rv = reviewT({ beff, bw, hf, d, As, fc, fy })
  const cur = designT(inp) // current-ACI fixed point (runs away: section too small without A′s)
  return { inp, Asf, Mn1, Mn, Mn2, a, Asw, As, rv, cur, bars: pickD(As, 10, [8, 9, 10], 2) }
})

// ================================================================ questions
const P = '2011-12' as const
const PG = { s1: [70], s2: [71], s3: [72], fig: [73] }
const FIG1_TEXT = 'Fig. 1: cantilever beam projecting 12′-0″ from the face of an 18″ column; uniform dead load plus live load; overall depth 21″. Support section b = 10″, h = 21″, top steel 3 #9 at 3″ from the top (d = 18″), ending in standard hooks 2″ from the back face of the column; one bar is discontinued along the span and 2 #9 run to the free end. $f\'_c = 4000$ psi, $f_y = 60{,}000$ psi, normal-weight concrete.'

export const R2011: RcQ[] = [
  {
    id: 'rc-2011-12-1',
    paper: P,
    sec: 'A',
    no: '1',
    marks: 21,
    topics: ['rc-elastic'],
    title: 'Cantilever support section: cracking moment (top tension), gross vs transformed',
    pages: PG.s1,
    text: `Fig. 1 shows a cantilever beam and the cross section at the support. The concrete strength is 4000 psi and yield strength ($f_y$) of steel rebars is 60000 psi. The concrete is normal weight concrete.

Find the moment that will produce the first flexural crack at the top of the beam. Use moment of inertia 'I' for both gross area and uncracked transformed section and compare the results.

${FIG1_TEXT}`,
    given: [],
    figure: fig1,
    notes: ['Printed marks 24, hand-corrected to 21 (Section A total 105).', 'Negative moment: the tension face is the top, so all distances are measured from the bottom (compression) face: d = 18 in from the bottom. n = Es/Ec = 8.04 → 8; fr = 7.5√f′c.'],
    checks: () => [
      { key: 'mcrg', label: 'Mcr from the gross section', value: u1().McrG, unit: 'k-ft' },
      { key: 'mcr', label: 'Mcr from the uncracked transformed section', value: u1().Mcr, unit: 'k-ft' },
    ],
    solution: () => {
      const u = u1()
      return (
        <Sol>
          <Md>{`Tension is at the **top**; measure from the bottom (compression) face, so the steel is at d = 18 in from that face.`}</Md>
          <StepList steps={[{ t: 'Gross section', tex: `I_g = \\frac{10(21)^3}{12} = ${f(u.Ig, 0)}\\text{ in}^4,\\ y_t = 10.5\\text{ in},\\ M_{cr} = \\frac{${f(u.fr, 0)}\\times${f(u.Ig, 0)}}{10.5} = ${f(u.McrG * 12000, 0)}\\text{ in-lb} = ${f(u.McrG, 2)}\\text{ k-ft}` }, ...u.steps]} />
          <Final>{`Mcr = **${f(u.McrG, 1)} k-ft** (gross) vs **${f(u.Mcr, 1)} k-ft** (uncracked transformed): the steel near the tension face raises I and moves the neutral axis toward it, so the transformed value is ${f((u.Mcr / u.McrG - 1) * 100, 0)} % higher. The gross-section value is the usual, slightly conservative estimate.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Over-reinforced vs under-reinforced beams',
    pages: PG.s1,
    theory: true,
    text: 'Explain the meaning of "over reinforced" and "under reinforced" beams.',
    given: [],
    solution: ans(A_OVER),
  },
  {
    id: 'rc-2011-12-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 16,
    topics: ['rc-elastic'],
    title: 'Allowable service moment (0.45f′c, 0.5fy) and the D + L that produce it',
    pages: PG.s1,
    text: `Determine the maximum moment for the support section of beam of Fig. 1, that can be carried without stressing the concrete beyond $0.45f'_c$ and steel beyond $0.5f_y$. If the ratio of uniformly distributed dead load and live load is 2, calculate the loads that will produce the above moment at the support.

${FIG1_TEXT}`,
    given: [],
    figure: fig1,
    flag: 'WSD (service-stress) analysis',
    notes: ['Printed marks 19, hand-corrected to 16.', 'fc,allow = 0.45(4000) = 1800 psi; fs,allow = 0.5(60,000) = 30 ksi (as the question says, not the usual 24 ksi).', 'M = wL²/2 at the support face, L = 12 ft; D taken as the total dead load (self-weight included).', 'Later parts (3b, 4a, 5b, 7b) use these loads.'],
    checks: () => [
      { key: 'm', label: 'Allowable service moment', value: a2().r.M, unit: 'k-ft' },
      { key: 'wd', label: 'Dead load D', value: a2().D, unit: 'k/ft' },
      { key: 'wl', label: 'Live load L', value: a2().L, unit: 'k/ft' },
    ],
    solution: () => {
      const { r, w, D, L } = a2()
      const steps: SolStep[] = [...r.steps, { t: 'Loads that produce M', tex: `M = \\frac{wL^2}{2} \\Rightarrow w = \\frac{2(${f(r.M, 1)})}{12^2} = ${f(w)}\\text{ k/ft};\\ D = 2L \\Rightarrow D = \\tfrac23w = ${f(D)}\\text{ k/ft},\\ L = \\tfrac13w = ${f(L)}\\text{ k/ft}` }]
      return (
        <Sol>
          <StepList steps={steps} />
          <Final>{`Service capacity **M = ${f(r.M, 1)} k-ft** (${r.governs} governs). Uniform loads: **D = ${f(D)} k/ft, L = ${f(L)} k/ft** (total ${f(w)} k/ft).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Reasons for the ACI minimum cover',
    pages: PG.s1,
    theory: true,
    text: 'Give reasons for the provision of minimum cover requirements in the ACI code.',
    given: [],
    solution: ans(A_COVER),
  },
  {
    id: 'rc-2011-12-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 16,
    topics: ['rc-singly'],
    title: 'Mn, φMn of the support section and the ratio φMn / service capacity',
    pages: PG.s1,
    text: `Compute the nominal flexural strength and the flexural strength to be used for design for the beam shown in Fig. 1. Compute the ratio of the flexural strength and the service capacity from 2(b).

${FIG1_TEXT}`,
    given: [],
    figure: fig1,
    notes: ['Printed marks 19, hand-corrected to 16.'],
    checks: () => [
      { key: 'mn', label: 'Mn', value: r3().Mn, unit: 'k-ft' },
      { key: 'pmn', label: 'φMn', value: r3().phiMn, unit: 'k-ft' },
      { key: 'ratio', label: 'φMn / M_service', value: r3().phiMn / a2().r.M },
    ],
    solution: () => {
      const r = r3()
      const M = a2().r.M
      return (
        <Sol>
          <StepList steps={r.steps} />
          <Final>{`**Mn = ${f(r.Mn, 1)} k-ft, φMn = ${f(r.phiMn, 1)} k-ft.** Ratio φMn / M_service = ${f(r.phiMn, 1)} / ${f(M, 1)} = **${f(r.phiMn / M, 2)}** (Mn / M_service = ${f(r.Mn / M, 2)}): the hidden margin between service stresses and strength, close to a typical load factor.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 16,
    topics: ['rc-basics'],
    title: 'Factored load, Mu, and the SFD/BMD of the cantilever',
    pages: PG.s1,
    text: `Using the calculated dead load and live load of 2(b), compute the factored load ($W_u$) and the maximum moment due to factored loads ($M_u$), and sketch the shear force and bending moment diagrams.

${FIG1_TEXT}`,
    given: [],
    figure: fig1,
    flag: 'Load factors not printed: 1.2D + 1.6L used (paper era: 1.4D + 1.7L, shown too)',
    notes: ['Printed marks 19, hand-corrected to 16.'],
    checks: () => [
      { key: 'wu', label: 'Factored load wu (1.2D + 1.6L)', value: f4().wu, unit: 'k/ft' },
      { key: 'mu', label: 'Mu at the support face', value: f4().Mu, unit: 'k-ft' },
      { key: 'vu', label: 'Vu at the support face', value: f4().Vu, unit: 'k' },
    ],
    solution: () => {
      const F = f4()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Factored load', tex: `w_u = 1.2D + 1.6L = 1.2(${f(F.D)}) + 1.6(${f(F.L)}) = ${f(F.wu)}\\text{ k/ft}\\ (\\ge 1.4D = ${f(1.4 * F.D)})` },
              { t: 'Support moment and shear', tex: `M_u = \\frac{w_uL^2}{2} = \\frac{${f(F.wu)}(12)^2}{2} = ${f(F.Mu, 1)}\\text{ k-ft},\\quad V_u = w_uL = ${f(F.Vu, 1)}\\text{ k}` },
            ]}
          />
          <SfdBmd wu={F.wu} L={12} Vu={F.Vu} Mu={F.Mu} />
          <Final>{`wu = **${f(F.wu)} k/ft**, Mu = **${f(F.Mu, 1)} k-ft** (hogging, at the face), Vu = ${f(F.Vu, 1)} k. Shear falls linearly and moment parabolically to zero at the free end. With 1.4D + 1.7L: wu = ${f(F.wuOld)} k/ft, Mu = ${f(F.MuOld, 1)} k-ft.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Why the live-load factor is higher than the dead-load factor',
    pages: PG.s1,
    theory: true,
    text: 'Why higher load factor is used for live load compared to the dead load?',
    given: [],
    solution: ans(A_LF),
  },
  {
    id: 'rc-2011-12-5a',
    paper: P,
    sec: 'A',
    no: '5(a)',
    marks: 6,
    topics: ['rc-shear'],
    title: 'Why design shear is taken at d from the support face',
    pages: PG.s2,
    theory: true,
    text: "Where the reaction from the support introduces vertical compression to the beam, the maximum shear to be considered for design will be computed at a distance of 'd' from face of the support, explain why?",
    given: [],
    solution: ans(A_CRITD, CritSketch),
  },
  {
    id: 'rc-2011-12-5b',
    paper: P,
    sec: 'A',
    no: '5(b)',
    marks: 15,
    topics: ['rc-shear'],
    title: 'Cantilever: where stirrups are needed, s at d vs ACI smax',
    pages: PG.s2,
    text: `What part of the beam of prob. 2(b) requires web reinforcement? Select stirrup size and calculate the stirrup spacing corresponding to the shear at a distance 'd' from face of the support and compare with the maximum spacing recommended by the ACI code.

${FIG1_TEXT}`,
    given: [],
    figure: fig1,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['Printed marks 18, hand-corrected to 15.', 'Loads from 2(b); No. 3 two-legged stirrups, fyt = 60 ksi.'],
    checks: () => shearChecks(bm5(), sec5),
    solution: () => <ShearSol bm={bm5()} sec={sec5} note="Service loads from 2(b), factored 1.2D + 1.6L. The column face supports the cantilever and compresses its end region, so the critical section is at d = 18 in." />,
  },
  {
    id: 'rc-2011-12-6a',
    paper: P,
    sec: 'A',
    no: '6(a)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Factors influencing development length of deformed tension bars',
    pages: PG.s2,
    theory: true,
    text: 'Write down the factors that influence the development length of deformed tension rebars.',
    given: [],
    notes: ['Printed marks 8, hand-corrected to 7.'],
    solution: ans(A_LD),
  },
  {
    id: 'rc-2011-12-6b',
    paper: P,
    sec: 'A',
    no: '6(b)',
    marks: 14,
    topics: ['rc-bond'],
    title: 'Can the #9 top bars be anchored in the 18 in column?',
    pages: PG.s2,
    text: `Check to see if proper development length can be provided (in column) for top rebars of Fig. 1. Use the simplified equation for development length of rebars.

${FIG1_TEXT}`,
    given: [],
    figure: fig1,
    notes: ['Printed marks 16, hand-corrected to 14.', 'Available embedment = 18 − 2 = 16 in (critical section at the column face, bars end 2 in from the back face). Column concrete taken as 4000 psi.'],
    checks: () => [
      { key: 'ld', label: 'Straight ld of the top No. 9 bars (simplified)', value: anch().ld.final, unit: 'in', tol: 0.03 },
      { key: 'ldh', label: 'ldh of a standard hook (ψc = 1.0)', value: anch().ldh.final, unit: 'in', tol: 0.03 },
      { key: 'avail', label: 'Embedment available in the column', value: anch().col.available, unit: 'in' },
    ],
    solution: () => {
      const A = anch()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Bar geometry', tex: `d_b = ${f(b9.db, 3)}\\text{ in};\\ \\text{clear spacing} = ${f(A.g.clearSpacing, 2)}\\text{ in},\\ \\text{clear cover} = ${f(A.g.clearCover, 2)}\\text{ in}`, md: A.sc.why },
              { t: 'Straight bar (top bar, ψt = 1.3)', tex: `l_d = \\frac{f_y\\psi_t\\psi_e}{${A.sc.met ? 20 : '40/3'}\\lambda\\sqrt{f'_c}}d_b = ${f(A.ld.ratio, 1)}d_b = ${f(A.ld.final, 1)}\\text{ in}\\ \\gg\\ 16\\text{ in}`, md: 'A straight bar cannot be developed in the column.' },
              { t: 'Standard 90° hook', tex: `l_{dh} = \\frac{f_y\\psi_e}{50\\lambda\\sqrt{f'_c}}d_b = \\frac{60000}{50(63.25)}(${f(b9.db, 3)}) = ${f(A.ldh.final, 1)}\\text{ in}\\ ${A.ldh.final <= A.col.available ? '\\le' : '>'}\\ ${f(A.col.available)}\\text{ in}` },
              { t: 'With the cover factor', tex: `\\psi_c = 0.7 \\Rightarrow l_{dh} = ${f(A.ldhC.final, 1)}\\text{ in}\\ ${A.ldhC.final <= A.col.available ? '\\le' : '>'}\\ ${f(A.col.available)}\\text{ in}`, md: `Applies if the side cover in the column is ≥ 2.5 in and the cover on the tail ≥ 2 in (${A.hfc.cNote}). Min ldh = max(8db, 6 in) = ${f(A.ldh.min, 1)} in.` },
            ]}
          />
          <Final>{`Straight development is impossible (ld = ${upIn(A.ld.final)} in vs 16 in). The hooked bars need ldh = ${upIn(A.ldh.final)} in without cover credit — ${A.col.hookOK ? 'OK' : '**not adequate**'} — and ${upIn(A.ldhC.final)} in with ψc = 0.7 — ${A.ldhC.final <= A.col.available ? 'adequate if the column cover is at least 2.5 in on the side' : 'still short'}. Otherwise a column at least ${upIn(A.col.minColumn)} in deep is needed.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-7a',
    paper: P,
    sec: 'A',
    no: '7(a)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Why bars extend d or 12db past the theoretical cut-off',
    pages: PG.s2,
    theory: true,
    text: 'Explain, why every rebar shall be continued at least by a distance equal to the effective depth of the beam or 12 bar diameters (whichever is longer) beyond the point at which it is theoretically no longer required to resist stresses?',
    given: [],
    notes: ['Printed marks 8, hand-corrected to 7.'],
    solution: ans(A_EXT12),
  },
  {
    id: 'rc-2011-12-7b',
    paper: P,
    sec: 'A',
    no: '7(b)',
    marks: 14,
    topics: ['rc-bond'],
    title: 'Cut-off point of the middle bar; embedment of continued and cut bars',
    pages: PG.s2,
    text: `Calculate the point where the middle bar of Prob. 2(b) can be discontinued. Check to be sure that adequate embedded length is provided for continued and discontinued bar.

${FIG1_TEXT}`,
    given: [],
    figure: fig1,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['Printed marks 16, hand-corrected to 14.', 'Factored load from 4(a); top-bar ld from 6(b); bars stop 2 in from the free end.'],
    checks: () => [
      { key: 'pm2', label: 'φMn of the 2 continuing No. 9 bars', value: cut7().r.remain.phiMn, unit: 'k-ft' },
      { key: 'xt', label: 'Theoretical cut-off point from the support face', value: cut7().r.xTheo, unit: 'ft' },
      { key: 'xc', label: 'Actual cut-off point from the support face', value: cut7().r.xCut, unit: 'ft' },
    ],
    solution: () => {
      const { wu, r } = cut7()
      const ld = anch().ld.final
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Capacity of 3 and of 2 bars', tex: `\\phi M_n(3\\#9) = ${f(r.all.phiMn, 1)}\\text{ k-ft} \\ge M_u = ${f(r.Mmax, 1)};\\quad \\phi M_n(2\\#9) = ${f(r.remain.phiMn, 1)}\\text{ k-ft}`, md: `a = ${f(r.remain.a, 2)} in for two bars, φ = ${f(r.remain.phi)}.` },
              r.xTheo > 0
                ? { t: 'Theoretical cut-off', tex: `\\frac{w_u(12 - x)^2}{2} = ${f(r.remain.phiMn, 1)} \\Rightarrow 12 - x = \\sqrt{\\frac{2(${f(r.remain.phiMn, 1)})}{${f(wu)}}} \\Rightarrow x = ${f(r.xTheo, 2)}\\text{ ft from the face}` }
                : { t: 'Theoretical cut-off', tex: `\\phi M_n(2\\#9) = ${f(r.remain.phiMn, 1)} \\ge M_u = ${f(r.Mmax, 1)}\\text{ k-ft}`, md: 'The two continuing bars alone carry the full factored moment (the section was sized by the service stresses of 2(b)), so the middle bar is **theoretically not needed anywhere**: x = 0 at the face. Only its development length controls where it may stop.' },
              { t: 'Extension', tex: `\\max(d,\\ 12d_b) = \\max(18,\\ ${f(12 * b9.db, 1)}) = ${f(r.ext, 1)}\\text{ in} \\Rightarrow x = ${f(r.xTheo, 2)} + ${f(r.ext / 12, 2)} = ${f(r.xExt, 2)}\\text{ ft}` },
              { t: 'Embedment of the cut bar', tex: `\\text{from the face (max stress) to the cut: } ${f(r.availCut, 1)}\\text{ in}\\ ${r.availCut >= ld ? '\\ge' : '<'}\\ l_d = ${f(ld, 1)}\\text{ in}`, md: r.ldGoverns ? `ld governs: cut the bar at **${f(r.xCut, 2)} ft** from the face.` : 'Extension governs.' },
              { t: 'Continuing bars', tex: `\\text{beyond the theoretical point to the free end: } ${f(r.availCont, 1)}\\text{ in}\\ ${r.contOK ? '\\ge' : '<'}\\ l_d = ${f(ld, 1)}\\text{ in}`, md: r.contOK ? 'Adequate ✓' : 'Not enough straight length: hook the continuing bars at the free end or carry all bars through.' },
            ]}
          />
          <Final>{`Cut the middle bar **${f(r.xCut, 2)} ft (${upIn(r.xCut * 12)} in) from the column face**${r.xCut >= 12 - 0.2 ? ' — practically the whole length, so all three bars should be run to the end' : ''}. Its anchorage on the column side is the standard hook of 6(b).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 26,
    topics: ['rc-oneway'],
    title: 'Roof slab on brick walls, 30 × 14 ft panels (one-way, two spans)',
    pages: [...PG.s2, ...PG.fig],
    text: `A roof slab is shown in Fig. 2 supported on brick walls. Design the slab and draw neat sketches of: (i) plan showing reinforcement details; (ii) 2 sections (one through shorter direction and the other through longer direction) showing the details of rebars.

Given: weight of lime terracing: 30 psf. Live load = 30 psf; $f'_c = 3000$ psi and $f_y = 40{,}000$ psi.

Fig. 2: 2 × 2 panels, each 30′-0″ × 14′-0″, on brick walls all round and one interior wall each way.`,
    given: [],
    figure: fig2,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['lb/la = 30/14 = 2.14 ≥ 2: one-way slab spanning 14 ft, continuous over the middle wall (two spans).', 'Wall thickness not given: 14 ft taken as the clear span; brick walls are unrestrained ends.', 'fy = 40 ksi: h_min × (0.4 + 40,000/100,000) = 0.8 and T&S steel 0.0020bh.'],
    checks: () => [
      { key: 'h', label: 'Slab thickness h', value: s8().h, unit: 'in' },
      { key: 'wu', label: 'Factored load wu', value: s8().loads.wu, unit: 'psf' },
      { key: 'mneg', label: 'Mu at the middle wall (−1/9)', value: s8().sections.find((s) => s.id === 's1')!.Mu, unit: 'k-ft/ft' },
    ],
    solution: () => <OneWaySol r={s8()} endNote="Long direction (30 ft): only temperature & shrinkage bars, plus top bars along the walls to control cracking. Exterior ends on brick walls are unrestrained (+1/11 in the spans, no exterior negative coefficient)." />,
  },
  {
    id: 'rc-2011-12-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
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
    id: 'rc-2011-12-9a',
    paper: P,
    sec: 'B',
    no: '9(a)',
    marks: 20,
    topics: ['rc-tbeam', 'rc-shear'],
    title: 'Inverted beams under a 16 ft cantilever slab: flexure and shear of the middle beam',
    pages: [...PG.s2, ...PG.fig],
    text: `A 16 ft cantilever slab, 5″ thick is supported by 3 inverted beams as shown in Fig. 3. The slab supports a floor finish (FF) = 25 psf and a live load (LL) = 100 psf. Design the middle beam for both flexure and shear. Given: $f'_c = 3$ ksi; $f_y = 60$ ksi. Use USD.

Fig. 3: the slab projects 16′-0″ from the support; it is 24′ wide with three 12″ beams at 12′-0″ c/c running in the 16′ direction; the beams project **upward** from the 5″ slab (section A-A).`,
    given: [],
    figure: fig3,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: [
      'Beam depth not given: h = 24 in assumed (≥ l/8 = 16 × 12/8 = 24 in for a cantilever), d = 21.5 in.',
      'Under the cantilever (hogging) moment the top of the upstand is in tension and the slab at the bottom is the compression flange — a T-beam. Middle beam tributary width 12 ft.',
      'beff by ACI 318-14: min(16hf + bw, L/4 + bw, c/c).',
    ],
    checks: () => [
      { key: 'wu', label: 'Factored load on the middle beam', value: q9a().ld.wu, unit: 'k/ft' },
      { key: 'mu', label: 'Mu at the support', value: q9a().Mu, unit: 'k-ft' },
      { key: 'as', label: 'Required As (top of the upstand)', value: q9a().r.As, unit: 'in²' },
    ],
    solution: () => {
      const Q = q9a()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Loads on the middle beam (12 ft strip)', tex: `\\text{slab } ${f(Q.ld.slab)},\\ \\text{stem } ${f(Q.ld.web)},\\ FF\\ ${f(Q.ld.sdl)} \\Rightarrow D = ${f(Q.ld.wD)}\\text{ k/ft};\\ L = ${f(Q.ld.wL)}\\text{ k/ft};\\ w_u = ${f(Q.ld.wu)}\\text{ k/ft}` },
              { t: 'Cantilever moment', tex: `M_u = \\frac{w_uL^2}{2} = \\frac{${f(Q.ld.wu)}(16)^2}{2} = ${f(Q.Mu, 1)}\\text{ k-ft}` },
            ]}
          />
          <SH>Flexure (T-section, flange = slab in compression)</SH>
          <StepList steps={tDesignSteps(Q.inp, Q.r, Q.bf)} start={3} />
          <Final>{`Top steel: As = ${f(Q.r.As)} in² → **${Q.bars.n} No. ${Q.bars.no}** at the top of the 12 × 24 in upstand, anchored into the support.`}</Final>
          <SH>Shear</SH>
          <ShearSol bm={Q.bm} sec={Q.sec} />
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-9b',
    paper: P,
    sec: 'B',
    no: '9(b)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Design a singly reinforced 36 ft simple beam (choose b, d, As)',
    pages: [...PG.s3, ...PG.fig],
    text: `Design a singly reinforced beam shown in Fig. 4. The dead load does not include self-wt of the beam. Given: $f'_c = 3{,}500$ psi, $f_y = 60{,}000$ psi.

Fig. 4: simple span 36′-0″; DL = 1.5 kip/ft (excluding self-wt.), LL = 1 kip/ft.`,
    given: [],
    figure: fig4,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['Identical to 2012-13 Q5(b). The continuation header on p72 is misprinted "Q. No. 6".', 'b = 14 in and ρ = 0.6ρmax chosen; h ≥ l/16 = 27 in; self-weight iterated.'],
    checks: () => [
      { key: 'h', label: 'Overall depth h chosen (b = 14 in)', value: b9b().h, unit: 'in', tol: 0.08 },
      { key: 'as', label: 'Required As', value: b9b().D.As, unit: 'in²', tol: 0.08 },
    ],
    solution: () => {
      const B = b9b()
      return (
        <Sol>
          <Md>{`b = ${B.b} in, ρ = 0.6ρmax = ${f(B.rho, 5)}, h ≥ l/16 = ${B.hmin} in; self-weight from the trial h.`}</Md>
          <Tbl head={['trial h (in)', 'self-wt (k/ft)', 'Mu (k-ft)', 'd req (in)']} rows={B.hist.map((x) => [f(x.h), f(x.sw), f(x.Mu, 1), f(x.dReq, 2)])} />
          <StepList steps={[...B.L.steps, ...B.D.steps]} />
          <Final>{`Section **${B.b} × ${B.h} in** (d = ${f(B.d)} in), As = ${f(B.D.As)} in² → **${B.bars.n} No. ${B.bars.bar}**.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-10a',
    paper: P,
    sec: 'B',
    no: '10(a)',
    marks: 27,
    topics: ['rc-doubly'],
    title: 'Wide shallow beam 24 × 16 in, Mu = 450 k-ft, fy = 72.5 ksi (compression steel)',
    pages: PG.s3,
    text: `A rectangular concrete beam of width b = 24″ is limited by architectural considerations to a maximum total depth h = 16″. It must carry a total factored load moment Mu = 450 kip-ft. Design the flexural reinforcement for this member, using compression steel if necessary. Allow 3 inch to the centre of the bars from the compression or tension face of the beam. Material strengths are $f'_c = 4000$ psi, $f_y = 72{,}500$ psi.`,
    given: [],
    notes: ['d = 16 − 3 = 13 in, d′ = 3 in, one layer (dt = d). fy = 72.5 ksi: εy = 0.0025, so whether A′s yields is the key check.'],
    checks: () => [
      { key: 'pm1', label: 'φMn of the largest singly reinforced section', value: d10().sm.phiMn1, unit: 'k-ft' },
      { key: 'asp', label: "A′s required", value: d10().Asp, unit: 'in²' },
      { key: 'as', label: 'As required', value: d10().As, unit: 'in²' },
    ],
    solution: () => {
      const dd = d10()
      return (
        <Sol>
          <StepList steps={doublyDesignSteps(p10, dd)} />
          <SH>Review of the bars chosen</SH>
          <StepList steps={doublyReviewSteps({ ...p10, As: dd.tension.A, Asp: dd.comp!.A }, dd.review)} />
          <Final>{`Tension **${dd.tension.n} No. ${dd.tension.no}**, compression **${dd.comp!.n} No. ${dd.comp!.no}**: φMn = ${f(dd.review.phiMn, 1)} k-ft ${dd.ok ? '≥' : '<'} 450 k-ft${dd.ok ? ' ✓' : ''}.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-10b',
    paper: P,
    sec: 'B',
    no: '10(b)',
    marks: 8,
    topics: ['rc-basics', 'rc-shear'],
    title: 'Sketch shear, shrinkage, flexural and bond cracks',
    pages: PG.s3,
    theory: true,
    text: 'Show with neat sketches the following cracks in beam: (i) Shear crack, diagonal tension; (ii) Shrinkage cracks; (iii) Flexural cracks due to bending, and (iv) Bond cracks.',
    given: [],
    solution: ans(A_CRACKS, CracksSketch),
  },
  {
    id: 'rc-2011-12-11a',
    paper: P,
    sec: 'B',
    no: '11(a)',
    marks: 26,
    topics: ['rc-tbeam'],
    title: 'T-beam As for Mu = 500 k-ft (b = 20, bw = 10, hf = 5, d = 20 in)',
    pages: PG.s3,
    text: `A tensile-reinforced T beam is to be designed to carry a uniformly distributed load on a 20 ft simple span. The total factored moment to be carried is $M_u = 500$ kip-ft. Concrete dimensions, governed by web shear and clearance requirements, are b = 20 inch; $b_w$ = 10 inch; $h_f$ = 5 inch and d = 20 inch. If $f_y = 60$ ksi and $f'_c = 4$ ksi, what tensile reinforcement is required at midspan?`,
    given: [],
    notes: ['Flange width is given (b = 20 in), so no beff calculation is needed. One layer assumed: dt = d = 20 in.'],
    flag: 'Mu is just above the current-ACI singly reinforced T capacity: solved with φ = 0.9 (paper era) and checked',
    checks: () => [
      { key: 'asf', label: 'Asf (flange overhangs)', value: t11().Asf, unit: 'in²' },
      { key: 'as', label: 'Total As (φ = 0.9)', value: t11().As, unit: 'in²' },
      { key: 'et', label: 'εt with that As', value: t11().rv.epsT, tol: 0.03 },
    ],
    solution: () => {
      const Q = t11()
      const { inp, rv } = Q
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Is it a true T?', tex: `\\phi M_{n,f} = 0.9(0.85)(4)(20)(5)(20 - 2.5)/12 = ${f((0.9 * 0.85 * 4 * 20 * 5 * 17.5) / 12, 1)}\\text{ k-ft} < 500`, md: 'The flange alone is not enough: the stress block enters the web.' },
              { t: 'Overhang steel', tex: `A_{sf} = \\frac{0.85f'_c(b - b_w)h_f}{f_y} = \\frac{0.85(4)(10)(5)}{60} = ${f(Q.Asf)}\\text{ in}^2,\\ M_{n1} = A_{sf}f_y(d - h_f/2) = ${f(Q.Mn1, 0)}\\text{ k-in}` },
              { t: 'Web steel (φ = 0.9)', tex: `M_{n2} = \\frac{500(12)}{0.9} - ${f(Q.Mn1, 0)} = ${f(Q.Mn2, 0)}\\text{ k-in} = 0.85(4)(10)a(20 - a/2) \\Rightarrow a = ${f(Q.a)}\\text{ in},\\ A_{sw} = ${f(Q.Asw)}\\text{ in}^2` },
              { t: 'Total', tex: `A_s = ${f(Q.Asf)} + ${f(Q.Asw)} = ${f(Q.As)}\\text{ in}^2` },
              { t: 'Check by the current φ–εt rule', tex: `c = ${f(rv.c)}\\text{ in},\\ \\varepsilon_t = 0.003\\frac{20 - ${f(rv.c)}}{${f(rv.c)}} = ${f(rv.epsT, 5)} \\Rightarrow \\phi = ${f(rv.phi)},\\ \\phi M_n = ${f(rv.phiMn, 1)}\\text{ k-ft}`, md: `εt is just under 0.005, so φ drops slightly and φMn falls ${f((1 - rv.phiMn / 500) * 100, 1)} % short of 500 k-ft. Adding tension steel only lowers εt further (the current-ACI iteration runs away to εt = ${f(Q.cur.epsT, 4)}), so a strict modern design needs a little compression steel or a deeper web.` },
            ]}
          />
          <Final>{`As ≈ **${f(Q.As, 2)} in²** → ${Q.bars.n} No. ${Q.bars.no} (${f(Q.bars.A, 2)} in², ${Q.bars.layers} layers in the 10 in web). This is the intended answer (φ = 0.9); by today's φ–εt rule the section is marginal (φMn = ${f(rv.phiMn, 1)} k-ft).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2011-12-11b',
    paper: P,
    sec: 'B',
    no: '11(b)',
    marks: 9,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Strain and stress diagrams: uncracked, cracked, ultimate',
    pages: PG.s3,
    theory: true,
    text: 'Draw sketches for strain and stress distribution diagrams of a reinforced concrete beam section when subjected to bending for uncracked, cracked and ultimate condition.',
    given: [],
    solution: ans(A_STAGES, StagesSketch),
  },
]
