// CE 315 term final 2009-10 (held 13 Jan 2011) — PDF pp. 80–83. "Assume reasonable value for any missing data."
// Q8 (i)–(iv) is a chained mini-problem on one 12 × 23 in beam; its 35 marks are not split on the paper.
import { Md } from '../../../components/ui'
import type { Check, RcQ } from '../../types'
import { allowableMoment, crackedStresses, uncracked, uncrackedStresses, type ElasticInput } from '../../engine/elastic'
import { As as Asof, AsMin, Ec } from '../../engine/materials'
import { designAs, pickBars as pickSingly, review } from '../../engine/singly'
import { reviewDoubly, pickBars as pickD, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, type TDesignIn } from '../../engine/tbeam'
import type { ShearBeam, ShearSection } from '../../engine/shear'
import { bar, hookFactors, ldhCalc, upIn } from '../../engine/bond'
import { cantSlab, type CantSlabResult } from '../../engine/oneway'
import {
  A_HMIN,
  A_LD,
  A_TS,
  Arrow,
  ans,
  Bars,
  C,
  Dim,
  doublyReviewSteps,
  f,
  Fig,
  Final,
  Hatch,
  lazy,
  LdPairSol,
  ldPairChecks,
  RectSec,
  SH,
  shearChecks,
  ShearSol,
  Sol,
  StepList,
  T,
  Tbl,
  tDesignSteps,
  Udl,
  type SolStep,
} from './r2012'
import { A_CRITD, CritSketch } from './r2011'

// ================================================================ theory first asked here
export const A_NOSTIRRUP = `Before cracking the whole section resists shear, and the principal tension near the neutral axis acts at about 45°. Once an **inclined (diagonal) crack** forms, a beam without stirrups carries the external shear by three mechanisms (Nilson Fig. 5.7):

$$V_{ext} = V_{cz} + V_d + V_{iy}$$

1. **Shear in the uncracked compression zone, $V_{cz}$** (≈ 20–40 %). The concrete above the crack tip carries shear and compression together.
2. **Aggregate interlock, $V_{iy}$** (≈ 35–50 %). The rough crack faces slide on each other and transmit the vertical component of the interface force $V_i$. It falls as the crack widens.
3. **Dowel action of the longitudinal bars, $V_d$** (≈ 15–25 %). The bars crossing the crack act as dowels, but this force is small and can split off the cover along the bars.

In short, deep spans near supports also carry load by **arch action**: a direct compression strut from load to support, tied by the longitudinal steel.

After cracking, the steel force at the crack is set by the moment at the top of the crack, $T = M_a/z$. Failure follows by diagonal tension (crack runs through the compression zone), shear-compression (crushing above the crack) or splitting along the bars. Because these mechanisms are erratic and brittle, ACI takes the cracking load as the strength: $V_c = 2\\lambda\\sqrt{f'_c}b_wd$, used with φ = 0.75, and asks for minimum stirrups wherever $V_u > \\tfrac12\\phi V_c$.`

export const A_SMAX = `ACI maximum spacing of vertical stirrups (Table 9.7.6.2.2), with $V_s = (V_u - \\phi V_c)/\\phi$:

**(i) $V_s \\le 4\\sqrt{f'_c}\\,b_wd$**
- $s_{max} = d/2$ and **24 in.** (smaller governs), so every 45° crack between mid-depth and the tension steel is crossed by at least one stirrup.
- Also $s \\le A_vf_{yt}/(0.75\\sqrt{f'_c}\\,b_w)$ and $\\le A_vf_{yt}/(50b_w)$ — the minimum-web-steel limit (wherever $V_u > \\tfrac12\\phi V_c$).

**(ii) $V_s > 4\\sqrt{f'_c}\\,b_wd$**
- The limits are **halved**: $s_{max} = d/4$ and **12 in.**, so at least two stirrups cross each potential crack when shear is high.

In all cases $V_s \\le 8\\sqrt{f'_c}\\,b_wd$; above that the web would crush, and the section must be enlarged. (Inclined bars at 45°: $3d/4$ replaces $d/2$.)`

export const A_VARCANT = `For a cantilever of **variable depth** with a load P at the free end (self-weight neglected), the moment falls **linearly** from $PL$ at the support face to zero at the tip. The bar capacity also falls toward the tip because $d$ decreases, so the "capacity lines" are sloping, not horizontal (sketch below).

1. Draw the moment diagram $M_u(x) = P(L - x)$.
2. Draw the capacity of all bars, $\\phi M_n = \\phi A_sf_y(d(x) - a/2)$, and of the 50 % that continue — both decrease with $d(x)$.
3. **Theoretical cut-off**: where the moment line meets the 50 %-capacity line.
4. **Actual cut-off**: extend by $d$ (at that point) or $12d_b$, whichever is larger. The cut bars must also be embedded at least $l_d$ (top-bar value, ψt = 1.3) from the support face, their point of maximum stress.
5. **Continuing bars**: run to the free end with cover. They need $l_d$ beyond the theoretical cut-off point; at the tip they are hooked down if the straight length is short.
6. All top bars are anchored into the support (column or wall) with $l_d$ or a standard hook.
7. Cut-off in a tension zone: check $V_u \\le \\tfrac23\\phi V_n$ at the cut point, or add stirrups there.`

export function VarCantSketch() {
  const X = (x: number) => 80 + x * 50 // x in "units" 0..8
  const depth = (x: number) => 70 - x * 4
  return (
    <Fig w={560} h={330}>
      <Hatch x={40} y={20} w={40} h={120} />
      <path d={`M80,30 L${X(8)},30 L${X(8)},${30 + depth(8)} L80,${30 + depth(0)} Z`} fill={C.conc} stroke={C.ink} />
      <Arrow x1={X(8) - 4} y1={0} x2={X(8) - 4} y2={28} />
      <T x={X(8) + 10} y={14} a="start" c={C.load} b>
        P
      </T>
      <path d={`M60,${36} L${X(8) - 6},36 L${X(8) - 6},46`} fill="none" stroke={C.steel} strokeWidth={2.6} />
      <line x1={60} y1={40} x2={X(5)} y2={40} stroke={C.steel} strokeWidth={2.6} strokeDasharray="7 3" />
      <T x={X(5) + 6} y={56} a="start" s={11}>
        50 % cut here
      </T>
      <T x={X(2)} y={56} s={11}>
        top bars
      </T>
      {/* moment diagram */}
      <line x1={80} y1={170} x2={X(8)} y2={170} stroke={C.ink} />
      <polygon points={`80,170 80,300 ${X(8)},170`} fill={C.load} opacity={0.18} stroke={C.load} />
      <T x={74} y={300} a="end" s={11}>
        PL
      </T>
      <line x1={80} y1={310} x2={X(8)} y2={200} stroke={C.steel} strokeWidth={1.6} />
      <line x1={80} y1={245} x2={X(8)} y2={185} stroke={C.steel} strokeWidth={1.6} strokeDasharray="6 3" />
      <T x={X(8) + 4} y={204} a="start" s={11}>
        φMn, all bars
      </T>
      <T x={X(8) + 4} y={186} a="start" s={11}>
        φMn, 50 %
      </T>
      {/* intersection approx */}
      <line x1={X(3.3)} y1={150} x2={X(3.3)} y2={318} stroke={C.mute} strokeDasharray="3 3" />
      <line x1={X(5)} y1={150} x2={X(5)} y2={318} stroke={C.mute} strokeDasharray="3 3" />
      <Dim x1={X(3.3)} y1={324} x2={X(5)} y2={324} label="d or 12db" side="a" />
      <T x={X(3.3)} y={146} s={11}>
        theoretical
      </T>
      <T x={X(5) + 30} y={146} s={11}>
        actual cut
      </T>
    </Fig>
  )
}

// ================================================================ cantilever slab solution (shared with r2008, r2007)
export function CantSlabSol({ r, note }: { r: CantSlabResult; note?: string }) {
  const L = r.loads
  const p = r.patterns
  const steps: SolStep[] = [
    {
      t: 'Thickness',
      tex: `\\text{span } \\frac{${f(r.input.span)}\\times12}{${r.spanRule === 'both' ? 28 : r.spanRule === 'one' ? 24 : 20}} = ${f(r.hSpan, 2)},\\ \\text{cantilever } \\frac{${f(Math.max(r.input.cantL, r.input.cantR))}\\times12}{10} = ${f(r.hCant, 2)}\\text{ in} \\Rightarrow h = ${f(r.h)}\\text{ in}${r.hGiven ? '\\ (\\text{given})' : ''},\\ d = ${f(r.d)}\\text{ in}`,
    },
    { t: 'Loads (1-ft strip)', tex: `D = ${f(L.D, 1)}\\text{ psf},\\ L = ${f(L.L)}\\text{ psf};\\ w_{uD} = ${L.fD}D = ${f(L.wD, 1)},\\ w_u = ${f(L.wu, 1)}\\text{ psf}` },
    { t: 'Geometry (centre-line)', tex: `L = ${f(r.geo.L, 3)}\\text{ ft between support centres};\\ \\text{overhangs } ${f(r.geo.acL, 3)},\\ ${f(r.geo.acR, 3)}\\text{ ft}` },
    {
      t: 'Critical moments (live-load patterns)',
      tex: `M^-_{cant} = \\frac{w_ua^2}{2} = ${f(r.Mneg, 3)}\\text{ k-ft/ft (from the face)};\\quad M^+ = ${f(r.Mpos, 3)}\\text{ k-ft/ft (LL on the span only, DL on overhangs)}`,
      md: `LL on the overhang(s) only: span moment ${p.cant.Mmax > 0 ? `still sagging, ${f(p.cant.Mmax, 3)}` : `hogging throughout (mid-span ${f(r.uplift.Mmid, 3)})`} k-ft/ft — top steel must then run ${r.uplift.negThrough ? 'across the whole span' : 'well into the span'}.`,
    },
    { t: 'Minimum steel', tex: `A_{s,min} = ${f(r.ts.ratio, 4)}(12)(${f(r.h)}) = ${f(r.AsMin)}\\text{ in}^2/\\text{ft},\\ s_{max} = ${f(r.smax)}\\text{ in}` },
  ]
  return (
    <Sol>
      {note && <Md className="text-mute">{note}</Md>}
      <StepList steps={steps} />
      <Tbl
        head={['section', 'Mu (k-ft/ft)', 'As req', 'As design', `bars`]}
        rows={[
          ['support / overhang (top)', f(r.Mneg, 3), f(r.asNeg.As), f(r.AsNegD), `No. ${r.bar} @ ${f(r.straight.s)} in`],
          ['span (bottom)', f(r.Mpos, 3), f(r.asPos.As), f(r.AsPosD), `No. ${r.bar} @ ${f(r.pos.s)} in`],
        ]}
      />
      <Final>{`- Bottom: No. ${r.bar} @ **${f(r.pos.s)} in** c/c, alternate bars cranked over the support(s).
- Top over the support and overhang: ${f(r.AsNegD)} in²/ft — cranked bars plus ${r.extra.n > 0 ? `**${r.extra.n} extra No. ${r.bar}** between them` : 'no extra bars'} (or straight No. ${r.bar} @ ${f(r.straight.s)} in), carried ${f(r.topExt, 2)} ft into the span and to the free edge.
- Temperature & shrinkage: **No. 3 @ ${f(r.ts.s)} in** perpendicular to the main bars.
- Shear: Vu = ${f(Math.max(r.shear.Vcant, r.shear.Vspan), 2)} k/ft vs φVc = ${f(r.shear.phiVc, 2)} k/ft ${r.shear.ok ? '✓' : '✗'}.`}</Final>
    </Sol>
  )
}

// ================================================================ figures
const fig1 = () => (
  <Fig w={420} h={230}>
    <RectSec x={70} y={20} s={6} b={14} h={29} rows={[{ n: 3, y: 25.5 }]} edge={3} />
    <Dim x1={175} y1={20} x2={175} y2={20 + 25.5 * 6} label="25.5 in" />
    <Dim x1={175} y1={20 + 25.5 * 6} x2={175} y2={20 + 29 * 6} label="3.5 in" />
    <Dim x1={70} y1={212} x2={154} y2={212} label="14 in" side="b" />
    <T x={112} y={20 + 23.5 * 6}>As</T>
    <T x={300} y={60} a="start">{"f′c = 7500 psi"}</T>
    <T x={300} y={78} a="start">fy = 60,000 psi</T>
    <T x={300} y={96} a="start">As = 4.5 in²</T>
  </Fig>
)

const fig2 = () => {
  const s = 7
  return (
    <Fig w={440} h={250}>
      <path d={`M${60 + 2 * s},20 h${12 * s} v${4 * s} h${2 * s} v${21 * s} h${-16 * s} v${-21 * s} h${2 * s} Z`} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      <Bars n={6} x1={60 + 2 * s} x2={60 + 14 * s} y={20 + 22.5 * s} r={3.5} />
      <Dim x1={60} y1={12} x2={60 + 2 * s} y2={12} label="2 in" />
      <Dim x1={60 + 2 * s} y1={12} x2={60 + 14 * s} y2={12} label="12 in" />
      <Dim x1={60 + 14 * s} y1={12} x2={60 + 16 * s} y2={12} label="2 in" />
      <Dim x1={60 + 16 * s + 14} y1={20} x2={60 + 16 * s + 14} y2={20 + 4 * s} label="4 in" />
      <Dim x1={60 + 16 * s + 14} y1={20 + 4 * s} x2={60 + 16 * s + 14} y2={20 + 22.5 * s} label="18.5 in" />
      <Dim x1={60 + 16 * s + 14} y1={20 + 22.5 * s} x2={60 + 16 * s + 14} y2={20 + 25 * s} label="2.5 in" />
      <Dim x1={60} y1={20 + 25 * s + 16} x2={60 + 16 * s} y2={20 + 25 * s + 16} label="16 in" side="b" />
      <T x={60 + 8 * s} y={20 + 20.5 * s}>6 #8 bars</T>
      <T x={300} y={70} a="start">{"f′c = 7000 psi"}</T>
      <T x={300} y={88} a="start">fy = 60,000 psi</T>
    </Fig>
  )
}

const fig3 = () => (
  <Fig w={420} h={220}>
    <RectSec x={80} y={20} s={7} b={12} h={24} rows={[{ n: 2, y: 2.5 }, { n: 4, y: 21.5 }]} />
    <rect x={80 + 4 * 7} y={20 + 8 * 7} width={4 * 7} height={2.5 * 7} fill="var(--c-bg)" stroke={C.ink} />
    <path d={`M${80 + 4 * 7},${20 + 8 * 7} l${4 * 7},${2.5 * 7} M${80 + 8 * 7},${20 + 8 * 7} l${-4 * 7},${2.5 * 7}`} stroke={C.ink} />
    <T x={80 + 6 * 7} y={20 + 7.4 * 7} s={11}>hole</T>
    <T x={80 + 6 * 7} y={20 + 4.6 * 7} s={11}>2 #8</T>
    <T x={80 + 6 * 7} y={20 + 20 * 7} s={11}>4 #9</T>
    <Dim x1={60} y1={20} x2={60} y2={20 + 8 * 7} label="8 in" side="l" />
    <Dim x1={180} y1={20 + 2.5 * 7} x2={180} y2={20 + 21.5 * 7} label="19 in" />
    <Dim x1={240} y1={20} x2={240} y2={20 + 24 * 7} label="24 in" />
    <Dim x1={180} y1={20 + 21.5 * 7} x2={180} y2={20 + 24 * 7} label="2.5 in" />
    <Dim x1={80} y1={20 + 24 * 7 + 16} x2={80 + 12 * 7} y2={20 + 24 * 7 + 16} label="12 in" side="b" />
  </Fig>
)

const fig4 = () => (
  <Fig w={560} h={210}>
    <Hatch x={40} y={20} w={30} h={170} />
    <Hatch x={470} y={20} w={30} h={170} />
    <rect x={70} y={70} width={400} height={50} fill={C.conc} stroke={C.ink} />
    <Udl x1={74} x2={466} y={70} />
    <T x={270} y={44} c={C.load}>wu</T>
    <Dim x1={70} y1={150} x2={470} y2={150} label="ln = 25′" side="b" />
    <T x={55} y={14} s={11}>Exterior column</T>
    <T x={485} y={14} s={11}>Interior column</T>
    <T x={270} y={200} s={11} c={C.mute}>Beam elevation (end span of a continuous beam)</T>
  </Fig>
)

const fig5 = () => {
  const s = 12
  return (
    <Fig w={620} h={250}>
      <T x={150} y={16} b s={11}>Plan</T>
      <rect x={40} y={30} width={(12 + 10 / 12 * 2 + 5) * s} height={20 * 9} fill={C.conc} opacity={0.5} stroke={C.ink} />
      <Hatch x={40} y={30} w={(10 / 12) * s} h={180} />
      <Hatch x={40 + (10 / 12 + 12) * s} y={30} w={(10 / 12) * s} h={180} />
      <Dim x1={30} y1={30} x2={30} y2={210} label={"20'-0\""} side="l" />
      <Dim x1={40 + (10 / 12) * s} y1={226} x2={40 + (10 / 12 + 12) * s} y2={226} label={"12'-0\""} side="b" />
      <Dim x1={40 + (20 / 12 + 12) * s} y1={226} x2={40 + (20 / 12 + 17) * s} y2={226} label={"5'-0\""} side="b" />
      <T x={130} y={120} s={11}>brick walls (10")</T>
      <T x={470} y={16} b s={11}>Section 1-1</T>
      <rect x={360} y={70} width={(12 + 20 / 12 + 5) * s} height={12} fill={C.conc} stroke={C.ink} />
      <Udl x1={362} x2={360 + (12 + 20 / 12 + 5) * s - 2} y={70} />
      <T x={470} y={44} c={C.load} s={11}>D.L + L.L</T>
      <Hatch x={360} y={82} w={(10 / 12) * s} h={80} />
      <Hatch x={360 + (10 / 12 + 12) * s} y={82} w={(10 / 12) * s} h={80} />
      <Dim x1={360 + (12 + 20 / 12 + 5) * s + 10} y1={70} x2={360 + (12 + 20 / 12 + 5) * s + 10} y2={82} label={'6"'} />
      <T x={470} y={190} s={11} c={C.mute}>{"10\" | 12'-0\" | 10\" | 5'-0\""}</T>
    </Fig>
  )
}

const fig6 = () => (
  <Fig w={560} h={200}>
    <Hatch x={30} y={30} w={20} h={110} />
    <rect x={50} y={50} width={340} height={63} fill={C.conc} stroke={C.ink} />
    <Udl x1={54} x2={386} y={50} />
    <T x={330} y={24} c={C.load} s={11}>D.L + L.L</T>
    <line x1={40} y1={59} x2={384} y2={59} stroke={C.steel} strokeWidth={2.4} />
    <line x1={40} y1={63} x2={220} y2={63} stroke={C.steel} strokeWidth={2.4} strokeDasharray="6 3" />
    <T x={150} y={80} s={11}>3-#7 (one cut)</T>
    <Dim x1={50} y1={150} x2={390} y2={150} label={"12'-0\""} side="b" />
    <Dim x1={22} y1={50} x2={22} y2={113} label={'21"'} side="l" />
    <RectSec x={460} y={50} s={3} b={10} h={21} rows={[{ n: 3, y: 3 }]} edge={2} />
    <Dim x1={500} y1={50} x2={500} y2={50 + 21 * 3} label={'21"'} />
    <Dim x1={448} y1={59} x2={448} y2={50 + 21 * 3} label={'18"'} side="l" />
    <Dim x1={460} y1={128} x2={490} y2={128} label={'10"'} side="b" />
    <T x={475} y={160} s={11} c={C.mute}>END VIEW</T>
  </Fig>
)

// ================================================================ numerical data
const r1a = lazy(() => review({ b: 14, h: 29, fc: 7500, fy: 60000, layers: [{ As: 4.5, d: 25.5 }] }))
const r1b = lazy(() => {
  const r = review({ b: 12, h: 25, fc: 7000, fy: 60000, layers: [{ As: Asof(6, 8), d: 22.5 }] })
  return { r, AsMin16: AsMin(7000, 60000, 16, 22.5), AsMin12: AsMin(7000, 60000, 12, 22.5) }
})
const p2: DoublyReviewIn = { b: 12, d: 21.5, dp: 2.5, As: Asof(4, 9), Asp: Asof(2, 8), fc: 4, fy: 60 }
const r2 = lazy(() => reviewDoubly(p2))
const q3a = lazy(() => {
  const neg = designAs(300, 12, 21.5, 5000, 60000)
  const negBars = pickSingly(neg.As, 12)
  const bf = effectiveWidth({ kind: 'interior', L: 18, bw: 12, hf: 3, cc: 96 })
  const inp: TDesignIn = { Mu: 200, beff: bf.b, bw: 12, hf: 3, d: 21.5, fc: 5, fy: 60 }
  const pos = designT(inp)
  return { neg, negBars, bf, inp, pos, posBars: pickD(pos.As, 12, [7, 8, 9], 1) }
})
// end span of a continuous beam: ACI shear Vu = wu ln/2 (exterior face), 1.15 wu ln/2 (interior face).
// Each side is a linear diagram falling at wu from the face, i.e. a "cantilever" of length V_face/wu.
const q4 = lazy(() => {
  const wu = 1.2 * 1.6 + 1.6 * 3.6
  const Vext = (wu * 25) / 2
  const Vint = 1.15 * Vext
  const sec: ShearSection = { bw: 14, d: 25.5, fc: 4000, fy: 40000 }
  const ext: ShearBeam = { kind: 'cant', L: Vext / wu, wD: wu, factored: true }
  const int: ShearBeam = { kind: 'cant', L: Vint / wu, wD: wu, factored: true }
  return { wu, Vext, Vint, sec, ext, int }
})
const s5c = lazy(() => cantSlab({ span: 12, support: 10, cantL: 0, cantR: 5, ll: 95, dlTotal: 125, fc: 4000, fy: 60000, h: 6 }))
const q6d = lazy(() => {
  const b20 = bar('20mm')
  const l0 = ldhCalc({ db: b20.db, fc: 3000, fy: 60000 })
  const hc = hookFactors({ no: b20.no, sideCover: 2.5, tailCover: 2 })
  const lc = ldhCalc({ db: b20.db, fc: 3000, fy: 60000, psiC: hc.psiC })
  return { b20, l0, lc, hc, col0: l0.final + 2, colC: lc.final + 2 }
})
const bm7c: ShearBeam = { kind: 'cant', L: 12, wD: 1.5, wL: 2.0 }
const sec7c: ShearSection = { bw: 10, d: 18, fc: 3000, fy: 60000 }
const q8in: ElasticInput = { b: 12, h: 23, d: 20, As: Asof(3, 9), fc: 4000, frPsi: 400 }
const q8 = lazy(() => {
  const u = uncracked(q8in)
  const us = uncrackedStresses(q8in, u.Mcr)
  const usG = uncrackedStresses(q8in, u.McrG)
  const E = Ec(4000) / 1000 // ksi
  const al = allowableMoment(q8in, 1.8, 24)
  const cs = crackedStresses(q8in, al.M)
  const rv = review({ b: 12, h: 23, fc: 4000, fy: 60000, layers: [{ As: Asof(3, 9), d: 20 }] })
  return { u, us, usG, E, al, cs, rv }
})

const prefix = (p: string, cs: Check[]) => cs.map((c) => ({ ...c, key: p + c.key, label: `${p === 'e' ? 'Exterior' : 'Interior'} face: ${c.label}` }))

// ================================================================ questions
const P = '2009-10' as const
const PG = { s1: [80], s2: [81], s3: [82], f1: [82], f2: [83] }

export const R2009: RcQ[] = [
  {
    id: 'rc-2009-10-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 18,
    topics: ['rc-singly'],
    title: 'High-strength concrete (7500 psi): crushing or yielding first? ACI limits',
    pages: [...PG.s1, ...PG.f1],
    text: `For the beam cross section shown in Figure-1 determine whether failure of the beam will be initiated by crushing of concrete or yielding of steel. Also determine whether the cross section satisfies ACI CODE requirement. Given $f'_c = 7500$ psi, $f_y = 60{,}000$ psi, $A_s = 4.5$ in².

Figure 1: b = 14 in, d = 25.5 in, bars 3.5 in above the soffit (h = 29 in), one row.`,
    given: [],
    figure: fig1,
    notes: ['β1 = 0.85 − 0.05(7.5 − 4) = 0.675 tests the β1 formula. "ACI requirement" = ρmin and εt ≥ 0.004.'],
    checks: () => [
      { key: 'c', label: 'Neutral-axis depth c', value: r1a().c, unit: 'in' },
      { key: 'et', label: 'εt', value: r1a().epsT, tol: 0.02 },
      { key: 'pmn', label: 'φMn', value: r1a().phiMn, unit: 'k-ft' },
    ],
    solution: () => {
      const r = r1a()
      return (
        <Sol>
          <StepList steps={[...r.lim.steps.slice(0, 2), ...r.steps]} />
          <Final>{`εs = ${f(r.epsS, 4)} ${r.yields ? '>' : '<'} εy = 0.00207: the **steel ${r.yields ? 'yields first' : 'does not yield'}** — failure is initiated by ${r.yields ? 'yielding of steel (ductile, under-reinforced)' : 'crushing of concrete'}. ACI: As = 4.5 ${r.minOk ? '≥' : '<'} As,min = ${f(r.AsMin)} in² ${r.minOk ? '✓' : '✗'}; εt = ${f(r.epsT, 4)} ${r.maxOk ? '≥' : '<'} 0.004 ${r.maxOk ? '✓' : '✗'} (φ = ${f(r.phi)}, φMn = ${f(r.phiMn, 1)} k-ft).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 17,
    topics: ['rc-singly'],
    title: 'Mn of a stepped section (12 in top, 16 in bottom); ACI minimum steel',
    pages: [...PG.s1, ...PG.f1],
    text: `Calculate the nominal moment capacity of the beam shown in Figure 2. Given $f'_c = 7000$ psi, $f_y = 60{,}000$ psi. Also determine whether the section satisfies minimum ACI code requirement.

Figure 2: the top 4 in of the section is 12 in wide (2 in shoulders each side); below it the section is 16 in wide. Six #8 bars in one row, 18.5 in below the shoulder and 2.5 in above the soffit (d = 22.5 in, h = 25 in).`,
    given: [],
    figure: fig2,
    notes: ['If a ≤ 4 in the compression zone is a 12 in rectangle; otherwise it would be T-shaped (wider below).', 'ρmin is checked with the 16 in width of the tension zone (and with 12 in for comparison).'],
    checks: () => [
      { key: 'a', label: 'Depth of stress block a (b = 12 in)', value: r1b().r.a, unit: 'in' },
      { key: 'mn', label: 'Mn', value: r1b().r.Mn, unit: 'k-ft' },
    ],
    solution: () => {
      const { r, AsMin16, AsMin12 } = r1b()
      return (
        <Sol>
          <StepList steps={r.steps.slice(0, -1)} />
          <Md>{`a = ${f(r.a, 2)} in ${r.a <= 4 ? '≤' : '>'} 4 in: the whole compression block lies in the 12 in wide top part ${r.a <= 4 ? '✓ (rectangular analysis valid)' : '— a T-shaped compression zone is needed'}. β1 = ${f(r.b1, 3)} for 7000 psi.`}</Md>
          <Final>{`**Mn = ${f(r.Mn, 1)} k-ft** (φMn = ${f(r.phiMn, 1)} k-ft). Minimum steel: As,min = 3√7000/60,000 × b d = ${f(AsMin16, 2)} in² (b = 16 in; ${f(AsMin12, 2)} in² with 12 in) < As = 4.74 in² ✓; εt = ${f(r.epsT, 4)} ≥ 0.004 ✓.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-2',
    paper: P,
    sec: 'A',
    no: '2',
    marks: 35,
    topics: ['rc-doubly'],
    title: 'Doubly reinforced section with a web hole: Mn and f′s',
    pages: [...PG.s1, ...PG.f1],
    text: `Compute the ultimate moment and also compute the stresses in compression steel, for the cross section shown in Figure 3.

Figure 3: b = 12 in, h = 24 in; 2 #8 near the top and 4 #9 at 2.5 in above the soffit, 19 in apart (d = 21.5 in, d′ = 2.5 in). A rectangular hole (about one-third of the width, centred) has its top 8 in below the top face; its size is not dimensioned.`,
    given: [],
    figure: fig3,
    flag: 'Material strengths not printed: f′c = 4 ksi, fy = 60 ksi assumed',
    notes: ['"Assume reasonable value for any missing data": f′c = 4000 psi, fy = 60,000 psi.', 'The hole only matters if the stress block reaches 8 in below the top; it does not.', 'One layer of tension bars: dt = d = 21.5 in.'],
    checks: () => [
      { key: 'c', label: 'Neutral-axis depth c', value: r2().c, unit: 'in' },
      { key: 'fsp', label: "Stress in the compression steel f′s", value: r2().fsp, unit: 'ksi' },
      { key: 'mn', label: 'Mn (ultimate moment)', value: r2().MnFt, unit: 'k-ft' },
    ],
    solution: () => {
      const r = r2()
      return (
        <Sol>
          <StepList steps={doublyReviewSteps(p2, r)} />
          <Final>{`a = ${f(r.a, 2)} in < 8 in, so the hole lies in the cracked tension zone and does not affect the result. **f′s = ${f(r.fsp, 1)} ksi** (${r.compYields ? 'yields' : 'below fy'}); **Mn = ${f(r.MnFt, 1)} k-ft**, φMn = ${f(r.phiMn, 1)} k-ft.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 25,
    topics: ['rc-tbeam'],
    title: 'T-beam for +200 and −300 k-ft (L = 18 ft, beams at 8 ft, h ≤ 24 in)',
    pages: PG.s1,
    text: `Design a T-beam with a length of $L_1$ = 18′ and spacing between beam $L_2$ = 8′. The beam must be designed to handle a positive moment of 200 k-ft and a negative moment of 300 k-ft, with a maximum depth 24 in and slab thickness of 3 in. Use $f'_c$ = 5 ksi, $f_y$ = 60 ksi.`,
    given: [],
    notes: ['Moments treated as factored. bw is free: 12 in chosen and checked against the negative moment (flange in tension → rectangle bw × d).', 'h = 24 in, d = 21.5 in (one layer). "L₂ = 8′" is faint on the scan.'],
    checks: () => [
      { key: 'asn', label: 'Negative-moment steel (top, b = bw = 12 in)', value: q3a().neg.As, unit: 'in²' },
      { key: 'beff', label: 'Effective flange width', value: q3a().bf.b, unit: 'in' },
      { key: 'asp', label: 'Positive-moment steel (bottom)', value: q3a().pos.As, unit: 'in²' },
    ],
    solution: () => {
      const Q = q3a()
      return (
        <Sol>
          <SH>Negative moment (support): flange in tension → rectangle 12 × 24 in</SH>
          <StepList steps={Q.neg.steps} />
          <Md>{`As = ${f(Q.neg.As)} in² → ${Q.negBars.n} No. ${Q.negBars.bar}${Q.negBars.fits ? '' : ' (two layers)'}; εt = ${f(Q.neg.epsT, 4)} ✓, so bw = 12 in is adequate.`}</Md>
          <SH>Positive moment (midspan): T-section</SH>
          <StepList steps={tDesignSteps(Q.inp, Q.pos, Q.bf)} />
          <Final>{`Section bw = 12 in, h = 24 in, hf = 3 in, beff = ${f(Q.bf.b)} in. Top steel at the supports **${f(Q.neg.As)} in²** (${Q.negBars.n} No. ${Q.negBars.bar}); bottom steel at midspan **${f(Q.pos.As)} in²** (${Q.posBars.n} No. ${Q.posBars.no}).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 10,
    topics: ['rc-shear'],
    title: 'How a beam without stirrups resists shear',
    pages: PG.s1,
    theory: true,
    text: 'Describe mechanism of shear resistance in RC beam without vertical stirrups.',
    given: [],
    solution: ans(A_NOSTIRRUP),
  },
  {
    id: 'rc-2009-10-4',
    paper: P,
    sec: 'A',
    no: '4',
    marks: 35,
    topics: ['rc-shear'],
    title: 'End span of a continuous beam: stirrups with Grade 40 stirrups',
    pages: [...PG.s1, ...PG.f2],
    text: `The uniformly distributed load on the beam is $W_{DL}$ = 1.6 k/ft (including self weight) and $W_{LL}$ = 3.6 k/ft. The beam has an $f'_c$ = 4 ksi, $f_y$ = 60 ksi, b = 14 in, d = 25.5 in, concrete cover = 1.5 in, and the strength of the shear reinforcement is $f_{sy}$ = 40 ksi. Determine the shear reinforcement for the beam shown in Figure 4. Draw the stirrup layout for the beam.

Figure 4: beam elevation between an exterior column and an interior column, clear span $l_n$ = 25′, uniform $w_u$.`,
    given: [],
    figure: fig4,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['ACI shear coefficients: Vu = wu ln/2 at the exterior face, 1.15 wu ln/2 at the face of the first interior support.', 'Stirrups No. 3 two-legged, fyt = 40 ksi.'],
    checks: () => {
      const Q = q4()
      return [...prefix('e', shearChecks(Q.ext, Q.sec)).slice(0, 1), ...prefix('i', shearChecks(Q.int, Q.sec)).slice(0, 1), ...prefix('i', shearChecks(Q.int, Q.sec)).slice(2)]
    },
    solution: () => {
      const Q = q4()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Factored load', tex: `w_u = 1.2(1.6) + 1.6(3.6) = ${f(Q.wu)}\\text{ k/ft}` },
              { t: 'Face shears (ACI coefficients)', tex: `V_{ext} = \\frac{w_ul_n}{2} = \\frac{${f(Q.wu)}(25)}{2} = ${f(Q.Vext, 1)}\\text{ k},\\quad V_{int} = 1.15\\frac{w_ul_n}{2} = ${f(Q.Vint, 1)}\\text{ k}` },
            ]}
          />
          <Md className="text-mute">{`From each face the shear falls at wu = ${f(Q.wu)} k/ft, reaching zero ${f(Q.Vext / Q.wu, 2)} ft from the exterior face and ${f(Q.Vint / Q.wu, 2)} ft from the interior face (the ACI envelope overlaps at midspan). Each side is designed separately:`}</Md>
          <SH>Exterior end</SH>
          <ShearSol bm={Q.ext} sec={Q.sec} />
          <SH>Interior end</SH>
          <ShearSol bm={Q.int} sec={Q.sec} />
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 8,
    topics: ['rc-oneway'],
    title: 'ACI minimum thickness of one-way slabs',
    pages: PG.s1,
    theory: true,
    text: 'Write down the minimum thickness for one-way slab for different end conditions specified by the ACI code.',
    given: [],
    solution: ans(A_HMIN),
  },
  {
    id: 'rc-2009-10-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 8,
    topics: ['rc-oneway'],
    title: 'Why and how T&S steel is provided; ACI values',
    pages: PG.s1,
    theory: true,
    text: 'Discuss why and how temperature and shrinkage reinforcement is provided in one-way slabs. What are the ACI recommended values for such steel?',
    given: [],
    solution: ans(A_TS),
  },
  {
    id: 'rc-2009-10-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 19,
    topics: ['rc-oneway'],
    title: '6 in slab on two brick walls with a 5 ft overhang: critical moments',
    pages: [...PG.s2, ...PG.f2],
    text: `A 6″ thick slab (one-way) is supported by brick walls as shown in Fig. 5. The calculated dead load (including self wt.) on the slab is 125 psf and the slab is subjected to a working live load of 95 psf. Compute the critical design moments and show the necessary reinforcements in sketches. Follow USD method. Given: $f'_c$ = 4000 psi, $f_y$ = 60000 psi.

Fig. 5: slab 20′-0″ long on two parallel 10″ brick walls 12′-0″ apart (clear); it overhangs 5′-0″ beyond the right wall and ends flush with the left wall.`,
    given: [],
    figure: fig5,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['Overhang read as 5′-0″ from the wall face (the slab-solutions PDF reads 5′-6″).', 'Span taken centre-to-centre of walls for statics; live load placed to maximise each moment.'],
    checks: () => [
      { key: 'mneg', label: 'Negative moment at the wall face (cantilever)', value: s5c().Mneg, unit: 'k-ft/ft' },
      { key: 'mpos', label: 'Maximum positive moment in the span', value: s5c().Mpos, unit: 'k-ft/ft' },
    ],
    solution: () => <CantSlabSol r={s5c()} />,
  },
  {
    id: 'rc-2009-10-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Cut-off sketch: variable-depth cantilever with a tip load',
    pages: PG.s2,
    theory: true,
    text: 'Show with sketches the cut off points for bars in a cantilever beam with variable depth and subjected to a concentrated load at the free end. Neglect the self wt. of the beam and 50% rebars shall be continued.',
    given: [],
    solution: ans(A_VARCANT, VarCantSketch),
  },
  {
    id: 'rc-2009-10-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Factors influencing development length',
    pages: PG.s2,
    theory: true,
    text: 'Discuss briefly the factors that influence development length of a reinforcing bar.',
    given: [],
    solution: ans(A_LD),
  },
  {
    id: 'rc-2009-10-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'ld of 20 mm and 25 mm uncoated bars: top and other',
    pages: PG.s2,
    text: `Calculate the development length of 20 mm and 25 mm uncoated top bars in USD. Repeat the calculation for other bars also. Use $f'_c$ = 3000 psi, $f_y$ = 60000 psi and assume appropriate value for any missing data.`,
    given: [],
    notes: ['Favourable spacing/cover case with minimum stirrups assumed; normal-weight concrete.'],
    checks: () => ldPairChecks(['20mm', '25mm'], 3000, 60000),
    solution: () => <LdPairSol ids={['20mm', '25mm']} fc={3000} fy={60000} />,
  },
  {
    id: 'rc-2009-10-6d',
    paper: P,
    sec: 'B',
    no: '6(d)',
    marks: 9,
    topics: ['rc-bond'],
    title: 'Minimum column width for hooked 20 mm top bars',
    pages: PG.s2,
    text: `Calculate the minimum column width to accommodate 20 mm dia hooked top rebars subjected to a stress level of 60000 psi. Assume clear cover of rebar to be 2″ and any other data appropriate for your calculations.`,
    given: [],
    notes: ['f′c = 3000 psi assumed (as in 6(c)); uncoated bars, normal weight.'],
    checks: () => [
      { key: 'ldh', label: 'ldh of the 20 mm hooked bar (ψc = 1.0)', value: q6d().l0.final, unit: 'in', tol: 0.03 },
      { key: 'col', label: 'Minimum column width (ldh + 2 in cover)', value: q6d().col0, unit: 'in', tol: 0.03 },
    ],
    solution: () => {
      const Q = q6d()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Hook development length', tex: `l_{dh} = \\frac{f_y\\psi_e}{50\\lambda\\sqrt{f'_c}}d_b = \\frac{60000}{50\\sqrt{3000}}(${f(Q.b20.db, 3)}) = ${f(Q.l0.final, 2)}\\text{ in}\\ \\ (\\ge 8d_b = ${f(8 * Q.b20.db, 2)},\\ 6\\text{ in})` },
              { t: 'Column width', tex: `h_{col} = l_{dh} + \\text{cover} = ${f(Q.l0.final, 2)} + 2 = ${f(Q.col0, 2)}\\text{ in}` },
              { t: 'With cover credit', tex: `\\psi_c = 0.7:\\ l_{dh} = ${f(Q.lc.final, 2)}\\text{ in} \\Rightarrow h_{col} = ${f(Q.colC, 2)}\\text{ in}`, md: 'Only if the side cover is ≥ 2.5 in and the cover beyond the hook tail ≥ 2 in.' },
            ]}
          />
          <Final>{`Minimum column width ≈ **${upIn(Q.col0)} in** (or ${upIn(Q.colC)} in with ψc = 0.7). Standard 90° hook: bend diameter 6db, tail 12db = ${f(12 * Q.b20.db, 1)} in.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 8,
    topics: ['rc-shear'],
    title: 'Why and when design shear is taken at d from the face',
    pages: PG.s2,
    theory: true,
    text: "Why and when the maximum shear to be considered for design is computed at a distance of 'd' from face of the support? Explain.",
    given: [],
    solution: ans(A_CRITD, CritSketch),
  },
  {
    id: 'rc-2009-10-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 8,
    topics: ['rc-shear'],
    title: 'ACI maximum stirrup spacing for Vs ≤ and > 4√f′c bw d',
    pages: PG.s2,
    theory: true,
    text: 'Write down the maximum spacing of stirrups (according to ACI recommendation) in shear design for the following cases: (i) when $V_s \\le 4\\sqrt{f\'_c}\\,b_wd$; (ii) when $V_s > 4\\sqrt{f\'_c}\\,b_wd$. The symbols convey their usual meaning.',
    given: [],
    solution: ans(A_SMAX),
  },
  {
    id: 'rc-2009-10-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 19,
    topics: ['rc-shear'],
    title: '12 ft cantilever: where stirrups are needed, s at the critical section vs smax',
    pages: [...PG.s2, ...PG.f2],
    text: `If a dead load of 1.5 k/ft (including self weight) and a working live load of 2.0 k/ft acts on the beam in Fig. 6, for what part of the beam is web reinforcement required? Select stirrup size and calculate the stirrup spacing corresponding to the maximum shear at first critical section and compare with the maximum spacing recommended by the ACI code. Follow any method and use $f'_c$ = 3000 psi, $f_y$ = 60000 psi.

Fig. 6: cantilever 12′-0″ from a wall, 21″ deep; end view b = 10″, h = 21″, d = 18″, top bars 3-#7.`,
    given: [],
    figure: fig6,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    checks: () => shearChecks(bm7c, sec7c),
    solution: () => <ShearSol bm={bm7c} sec={sec7c} note="USD with 1.2D + 1.6L; critical section at d = 18 in from the wall face." />,
  },
  {
    id: 'rc-2009-10-8-i',
    paper: P,
    sec: 'B',
    no: '8(i)',
    marks: 8.75,
    topics: ['rc-elastic'],
    title: 'Mcr (gross and transformed), and stresses/strains at cracking',
    pages: PG.s2,
    text: `A rectangular reinforced concrete beam has dimensions b = 12″, d = 20″, h = 23″ and is reinforced with three No. 9 bars. Material strengths are $f_y$ = 60000 psi, $f'_c$ = 4000 psi and $f_r$ = 400 psi.

(i) Find the moment that will produce the first cracking at the bottom surface of the beam, based on the moment of inertia of the gross concrete section. Repeat the calculation using the uncracked transformed section. Also, compute the stresses and strain in steel and top concrete corresponding to this cracking moment.`,
    given: [],
    notes: ['Q8 carries 35 marks for (i)–(iv) together; split 8.75 each here.', 'n = Es/Ec = 8.04 → 8.'],
    checks: () => [
      { key: 'mcrg', label: 'Mcr (gross section)', value: q8().u.McrG, unit: 'k-ft' },
      { key: 'mcr', label: 'Mcr (uncracked transformed)', value: q8().u.Mcr, unit: 'k-ft' },
      { key: 'fs', label: 'Steel stress at Mcr (transformed)', value: q8().us.fs, unit: 'ksi' },
    ],
    solution: () => {
      const { u, us, E } = q8()
      return (
        <Sol>
          <StepList steps={[{ t: 'Gross section', tex: `I_g = \\frac{12(23)^3}{12} = ${f(u.Ig, 0)}\\text{ in}^4,\\ M_{cr} = \\frac{400(${f(u.Ig, 0)})}{11.5} = ${f(u.McrG, 2)}\\text{ k-ft}` }, ...u.steps, ...us.stressSteps]} />
          <Final>{`Mcr = **${f(u.McrG, 1)} k-ft** (gross), **${f(u.Mcr, 1)} k-ft** (transformed). At Mcr (transformed): top concrete fc = ${f(us.fcTop * 1000, 0)} psi, εc = fc/Ec = ${f(us.fcTop / E, 6)}; steel fs = ${f(us.fs * 1000, 0)} psi, εs = ${f(us.fs / 29000, 6)}.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-8-ii',
    paper: P,
    sec: 'B',
    no: '8(ii)',
    marks: 8.75,
    topics: ['rc-elastic'],
    title: 'Service capacity at 0.45f′c / 0.4fy, with strains',
    pages: PG.s3,
    text: `(ii) Determine the maximum moment that can be carried without stressing the concrete beyond $0.45f'_c$ or the steel beyond $0.4f_y$. Also, compute the strains in steel and top concrete corresponding to this moment.

(b = 12″, d = 20″, h = 23″, three No. 9; $f_y$ = 60000 psi, $f'_c$ = 4000 psi.)`,
    given: [],
    flag: 'WSD (service-stress) analysis',
    checks: () => [
      { key: 'm', label: 'Allowable service moment', value: q8().al.M, unit: 'k-ft' },
      { key: 'es', label: 'Steel strain at that moment', value: q8().cs.fs / 29000, tol: 0.02 },
    ],
    solution: () => {
      const { al, cs, E } = q8()
      return (
        <Sol>
          <StepList steps={al.steps} />
          <Final>{`**M = ${f(al.M, 1)} k-ft** (${al.governs} governs). At M: fc = ${f(cs.fc, 3)} ksi → εc = ${f(cs.fc / E, 6)}; fs = ${f(cs.fs, 2)} ksi → εs = ${f(cs.fs / 29000, 6)}.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-8-iii',
    paper: P,
    sec: 'B',
    no: '8(iii)',
    marks: 8.75,
    topics: ['rc-singly'],
    title: 'Nominal and design flexural strength',
    pages: PG.s3,
    text: `(iii) Find the nominal flexural strength and design strength of this beam. (b = 12″, d = 20″, three No. 9; $f_y$ = 60000 psi, $f'_c$ = 4000 psi.)`,
    given: [],
    checks: () => [
      { key: 'mn', label: 'Mn', value: q8().rv.Mn, unit: 'k-ft' },
      { key: 'pmn', label: 'φMn', value: q8().rv.phiMn, unit: 'k-ft' },
    ],
    solution: () => {
      const r = q8().rv
      return (
        <Sol>
          <StepList steps={r.steps} />
          <Final>{`**Mn = ${f(r.Mn, 1)} k-ft, φMn = ${f(r.phiMn, 1)} k-ft.**`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2009-10-8-iv',
    paper: P,
    sec: 'B',
    no: '8(iv)',
    marks: 8.75,
    topics: ['rc-singly', 'rc-elastic'],
    title: 'Ratio of design strength to service capacity; comment',
    pages: PG.s3,
    text: '(iv) Compute the ratio of design strength (iii) to service capacity (ii) and make comments.',
    given: [],
    checks: () => [{ key: 'ratio', label: 'φMn / M_service', value: q8().rv.phiMn / q8().al.M }],
    solution: () => {
      const { rv, al } = q8()
      const k = rv.phiMn / al.M
      return (
        <Sol>
          <Final>{`φMn / M_service = ${f(rv.phiMn, 1)} / ${f(al.M, 1)} = **${f(k, 2)}** (Mn / M_service = ${f(rv.Mn / al.M, 2)}).`}</Final>
          <Md>{`**Comment.** A beam designed by WSD to its allowable stresses still has about ${f(k, 1)} times its service capacity available as design strength. USD needs Mu = γM with γ ≈ 1.2–1.6 (average ≈ 1.4 for typical D/L), so the WSD design is more conservative than USD for this section: USD would accept a service moment of about φMn/1.4 = ${f(rv.phiMn / 1.4, 1)} k-ft. WSD's safety margin is not uniform — it is fixed by the stress ratio and the steel ratio, not by load uncertainty — which is one reason ACI moved to strength design.`}</Md>
        </Sol>
      )
    },
  },
]
