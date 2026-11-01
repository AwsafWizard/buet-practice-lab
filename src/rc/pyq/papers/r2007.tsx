// CE 315 term final 2007-08 (held 10 Feb 2009) — PDF pp. 88–92.
// Section A (eight questions of 17½, answer six) is one chained problem on the Fig. 1 beam:
// Q1 service stresses → Q2(b) Mcr and load → Q3(b) allowable moment → Q4(b) φMn and load → Q5(b) stirrups →
// Q6(b) load for no / minimum web steel → Q7(b) bar cut-off → Q8 extra steel for a heavier load.
// Graph A.1a/A.1b (R vs ρ) was supplied with Section A.
import { Md } from '../../../components/ui'
import type { RcGiven, RcQ } from '../../types'
import { allowableMoment, elasticAt, uncracked, wsdDoublyDesign, type ElasticInput } from '../../engine/elastic'
import { As as Asof, BARS, Ec } from '../../engine/materials'
import { designAs, review } from '../../engine/singly'
import { designT, effectiveWidth, floorLoads, wsdTDesign, type TDesignIn } from '../../engine/tbeam'
import { pickBars as pickD } from '../../engine/doubly'
import { shearLimits, type ShearBeam, type ShearSection } from '../../engine/shear'
import { bar, cutoff, ldSimplified, upIn } from '../../engine/bond'
import { cantSlab } from '../../engine/oneway'
import {
  A_STAGES,
  A_TS,
  ans,
  C,
  Dim,
  f,
  Fig,
  Final,
  FloorSec,
  Hatch,
  lazy,
  Lines,
  RectSec,
  SH,
  shearChecks,
  ShearSol,
  Sol,
  SSBeam,
  StagesSketch,
  StepList,
  T,
  tDesignSteps,
  Udl,
} from './r2012'
import { A_OVER, A_CRITD, CritSketch } from './r2011'
import { A_SMAX, CantSlabSol } from './r2009'
import { A_BEFF } from './r2008'


// ================================================================ theory first asked here
export const A_BALSTRESS = `### Balanced-stress steel ratio (WSD)
The steel ratio at which, under the **service moment**, the concrete reaches its allowable stress $f_c$ (= 0.45f'c) and the steel its allowable stress $f_s$ **at the same time**, with linear (cracked elastic) stresses:
$$k = \\frac{n}{n + f_s/f_c},\\qquad \\rho_{bal} = \\frac{f_c\\,k}{2f_s}$$
Example: f'c = 4 ksi, n = 8, fc = 1.8 ksi, fs = 24 ksi → k = 0.375, ρbal = 0.0141.

### Balanced steel ratio (USD)
The steel ratio at which, at **ultimate**, the steel just reaches yield ($\\varepsilon_y$) when the concrete reaches its crushing strain $\\varepsilon_u = 0.003$:
$$\\rho_b = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.003 + \\varepsilon_y}$$
Example: f'c = 4 ksi, fy = 60 ksi → ρb = 0.0285.

### Differences
- **Load level**: service loads (elastic) vs ultimate (inelastic) condition.
- **Criterion**: allowable *stresses* reached together vs limiting *strains* reached together.
- **Stress distribution**: triangular concrete stress vs equivalent rectangular block.
- **Value**: ρbal (WSD) is roughly half of ρb (USD) for the same materials.
- **Use**: WSD sections with ρ < ρbal are governed by the steel stress; USD limits ρ to ρmax (εt ≥ 0.004 ≈ 0.72ρb), well below ρb, to ensure ductility.`

export const A_SINGLY_DOUBLY = `### (i) Singly and doubly reinforced beams
- **Singly reinforced**: longitudinal steel only on the **tension** side. The concrete alone carries the compression ($C = 0.85f'_cab$). Used when the section is large enough for the moment.
- **Doubly reinforced**: steel on **both** the tension and the compression side ($A'_s$). Used when the size is limited (architecture, headroom) and the singly reinforced capacity at the ductility limit is not enough, at supports where moments reverse, or to reduce long-term deflection (creep) and to hold stirrups. Compression steel lets more tension steel be used while keeping εt high.

### (ii) Over- and under-reinforced beams
` + A_OVER

export const A_SPLICE = `Bars are lapped (overlapped side by side) to transfer force from one bar to the next through the surrounding concrete. ACI 318 (25.5.2) defines two classes of **tension lap splice**:

- **Class A**: $l_{st} = 1.0\\,l_d$ — allowed only where **both**
  1. the steel provided is at least **twice** that required by analysis over the whole splice length ($A_{s,prov}/A_{s,req} \\ge 2$), **and**
  2. **no more than half** of the bars are spliced within the lap length (splices staggered).
- **Class B**: $l_{st} = 1.3\\,l_d$ — **all other cases** (the usual one).
- Both ≥ **12 in**. $l_d$ is computed with all ψ factors but **without** the excess-reinforcement reduction (the classes already reward excess steel).
- Splices should be placed away from points of maximum tensile stress and staggered. Bars larger than No. 11 are not lap spliced (use mechanical or welded splices).
- Example: No. 7 bottom bars, f'c = 4000 psi, $l_d$ = 41.5 in: all bars spliced → Class B, 54 in; half spliced where As,prov/As,req ≥ 2 → Class A, 42 in.`

export const A_COMPSTEEL = `**No, not always — and usually only a little.**

- In an **under-reinforced** singly reinforced beam the tension steel already yields: $T = A_sf_y$ is fixed. Adding $A'_s$ alone only redistributes the same compression between concrete and steel: the stress block gets shallower ($a = (A_sf_y - A'_sf'_s)/0.85f'_cb$), the lever arm grows slightly, and $M_n$ rises by just a few percent. To gain real capacity, **extra tension steel** $A_{s2} = A'_sf'_s/f_y$ must be added with it ($M_{n2} = A'_sf'_s(d - d')$).
- If $A'_s$ lies **close to or below the neutral axis** (shallow c, large d′), its strain is small or even tensile, and it adds nothing.
- In an **over-reinforced** section (tension steel not yielding), compression steel does help noticeably: it relieves the concrete, reduces c, can make the tension steel yield and raises εt.
- Compression steel is still useful for other reasons: **ductility** (larger εt, higher φ), **less long-term deflection** (creep is restrained), **moment reversal** at supports, and **holding stirrups** in place.

So: compression bars alone do not substantially increase moment capacity; they must be paired with additional tension steel.`

export const A_WEB = `Points to consider when proportioning the **web** ($b_w$, $d$) of a T-beam:

1. **Shear** — $b_w d$ must give enough $V_c = 2\\sqrt{f'_c}b_wd$ and keep $V_s \\le 8\\sqrt{f'_c}b_wd$ (else the web crushes). Web shear often decides $b_w$.
2. **Negative moment at supports** — over continuous supports the flange is in tension and the bottom of the web is in compression, so the rectangle $b_w \\times d$ alone must resist $-M_u$ (with compression steel if needed) and satisfy $\\varepsilon_t \\ge 0.004$. This usually fixes the depth.
3. **Bar placement** — the web must hold the tension bars with the required cover, clear spacing (≥ db, 1 in) and stirrups, preferably in one or two layers.
4. **Deflection and stiffness** — depth not less than the ACI minimum ($l/16$, $l/18.5$, $l/21$, $l/8$) unless deflections are computed.
5. **Economy and practicality** — $d/b_w$ about 1.5–3; standard form widths; matching column widths for easy framing; storey-height and headroom limits.
6. **Positive moment** — the flange usually gives ample compression area, so the positive moment rarely governs the web.`

export const A_FY = `- After yielding, steel strains a lot with no increase in stress (the **yield plateau**, up to about 10–15 εy) before strain hardening. Reaching $f_u$ would need strains of the order of 0.05–0.15.
- In a beam the concrete crushes at $\\varepsilon_{cu} \\approx 0.003$ long before the steel could reach such strains, so **$f_u$ is never developed** in flexure.
- Once the steel yields, cracks open wide and deflections grow rapidly: the member has effectively failed in service terms, even though the stress could rise later.
- The design model is therefore **elastic–perfectly plastic** steel: $f_s = E_s\\varepsilon_s \\le f_y$. Ignoring strain hardening is conservative and simple, and $f_y$ is the reliably specified property (minimum yield).
- Using $f_y$ also keeps the yielding (ductile) failure mode — the warning before collapse — at the heart of the design.`

// ================================================================ figures
const GRAPH: RcGiven = { label: 'Graph A.1a / A.1b', what: 'R = Mn/bd² vs ρ', ref: 'f-graphA1' }

const fig1 = () => (
  <Fig w={620} h={260}>
    <Hatch x={30} y={60} w={30} h={120} />
    <Hatch x={430} y={60} w={30} h={120} />
    <rect x={30} y={60} width={430} height={45} fill={C.conc} stroke={C.ink} />
    <Udl x1={34} x2={456} y={60} />
    <T x={330} y={30} c={C.load} s={11}>
      D.L + L.L
    </T>
    <line x1={40} y1={97} x2={450} y2={97} stroke={C.steel} strokeWidth={2.6} />
    <line x1={140} y1={93} x2={350} y2={93} stroke={C.steel} strokeWidth={2.6} strokeDasharray="7 3" />
    <T x={100} y={124} s={11}>2-#8 (full length)</T>
    <T x={300} y={124} s={11}>1-#8 (cut where not needed)</T>
    <Dim x1={60} y1={200} x2={430} y2={200} label={"20'-0\" clear"} side="b" />
    <Dim x1={30} y1={236} x2={60} y2={236} label={'10"'} side="b" />
    <Dim x1={430} y1={236} x2={460} y2={236} label={'10"'} side="b" />
    <Dim x1={30} y1={48} x2={40} y2={48} label={'2"'} />
    <T x={480} y={180} a="start" s={11}>
      brick walls
    </T>
    <RectSec x={520} y={60} s={4} b={12} h={20} rows={[{ n: 3, y: 17 }]} />
    <Dim x1={510} y1={60} x2={510} y2={60 + 17 * 4} label={'17"'} side="l" />
    <Dim x1={580} y1={60} x2={580} y2={140} label={'20"'} />
    <Dim x1={520} y1={156} x2={568} y2={156} label={'12"'} side="b" />
    <Lines x={480} y={200} s={11} step={15} lines={["f′c = 4000 psi", 'fy = 60,000 psi', 'fr = 400 psi']} />
  </Fig>
)

const fig2 = () => (
  <Fig w={600} h={190}>
    <T x={220} y={26} c={C.load}>
      Working DL = 1.6 k/ft, service LL = 1.2 k/ft
    </T>
    <SSBeam x0={30} y={76} len={380} L={30} dimLabels={["30'"]} />
    <RectSec x={480} y={30} s={3.6} b={12} h={32} rows={[]} />
    <Dim x1={533} y1={30} x2={533} y2={30 + 32 * 3.6} label={'32"'} />
    <Dim x1={480} y1={160} x2={523} y2={160} label={'12"'} side="b" />
  </Fig>
)

const fig3 = () => (
  <Fig w={560} h={170}>
    <FloorSec x={20} y={30} s={1.15} hf={5} bw={14} sp={144} hw={23} />
    <Dim x1={20 + 21 * 1.15} y1={110} x2={20 + 165 * 1.15} y2={110} label={"12'-0\""} side="b" />
    <Dim x1={20 + 165 * 1.15} y1={110} x2={20 + 309 * 1.15} y2={110} label={"12'-0\""} side="b" />
    <T x={280} y={20} s={11}>
      5" slab; webs 14" wide, 23" below the slab; span of beams = 30 ft
    </T>
  </Fig>
)

const fig4 = () => (
  <Fig w={560} h={300}>
    <rect x={40} y={30} width={28 * 17} height={16 * 10} fill={C.conc} opacity={0.5} stroke={C.ink} />
    {[6, 21].map((x) => (
      <rect key={x} x={40 + x * 17} y={30} width={17} height={160} fill="none" stroke={C.ink} strokeDasharray="5 3" />
    ))}
    <T x={278} y={22} s={11}>
      Free edge
    </T>
    <Dim x1={28} y1={30} x2={28} y2={190} label={"16'"} side="l" />
    {[
      [0, 6, "6'"],
      [6, 7, "1'"],
      [7, 21, "14'-0\""],
      [21, 22, "1'"],
      [22, 28, "6'-0\""],
    ].map(([a, b, l], i) => (
      <Dim key={i} x1={40 + (a as number) * 17} y1={206} x2={40 + (b as number) * 17} y2={206} label={l as string} side="b" />
    ))}
    <rect x={40} y={244} width={28 * 17} height={10} fill={C.conc} stroke={C.ink} />
    {[6, 21].map((x) => (
      <rect key={x} x={40 + x * 17} y={253} width={17} height={24} fill={C.conc} stroke={C.ink} />
    ))}
    <T x={278} y={294} s={11} c={C.mute}>
      Sec A-A: 6" slab on two 1′ beams, 6′ overhangs both sides
    </T>
  </Fig>
)

const fig5 = () => (
  <Fig w={620} h={210}>
    <SSBeam x0={30} y={95} len={420} L={36} cuts={[10, 26]} pls={[{ at: 10, label: '40 k' }, { at: 26, label: '40 k' }]} dimLabels={["10'-0\"", "16'-0\"", "10'-0\""]} sup="arrows" />
    <T x={450} y={60} a="end" c={C.load}>
      2 k/ft (including self-wt.)
    </T>
    <T x={240} y={200} b>
      ALL LOADS ARE FACTORED
    </T>
    <RectSec x={520} y={50} s={3} b={14} h={29} rows={[{ n: 3, y: 26 }]} edge={2} />
    <Dim x1={572} y1={50} x2={572} y2={50 + 26 * 3} label={'d = 26"'} />
    <Dim x1={520} y1={150} x2={562} y2={150} label={'14"'} side="b" />
  </Fig>
)

// ================================================================ the Fig. 1 beam (Section A)
const L1 = 20 // clear span, ft (as printed)
const beam: ElasticInput = { b: 12, h: 20, d: 17, As: Asof(3, 8), fc: 4000, frPsi: 400 }
const EcK = Ec(4000) / 1000
const q1 = lazy(() => elasticAt(beam, ((0.3 + 0.2) * L1 ** 2) / 8))
const q2 = lazy(() => {
  const u = uncracked(beam)
  return { u, wG: (8 * u.McrG) / L1 ** 2, wT: (8 * u.Mcr) / L1 ** 2 }
})
const q3 = lazy(() => allowableMoment(beam, 1.8, 24))
const q4 = lazy(() => {
  const r = review({ b: 12, h: 20, fc: 4000, fy: 60000, layers: [{ As: Asof(3, 8), d: 17 }] })
  const wu = (8 * r.phiMn) / L1 ** 2
  const LL = wu / (1.2 * 2 + 1.6) // D = 2L
  return { r, wu, LL, DL: 2 * LL, w: 3 * LL, wOld: (3 * wu) / (1.4 * 2 + 1.7) }
})
const bm5: ShearBeam = { kind: 'ss', L: L1 + 10 / 12, wD: 1.5, wL: 2.0, supportWidth: 10 }
const sec5: ShearSection = { bw: 12, d: 17, fc: 4000, fy: 60000 }
const q6 = lazy(() => {
  const k = shearLimits(sec5)
  const arm = L1 / 2 - 17 / 12 // ft from midspan to the critical section
  const wNone = k.halfPhiVc / arm
  const wMin = k.phiVc / arm
  return { k, arm, wNone, wMin, sNone: wNone / ((1.2 * 2 + 1.6) / 3), sMin: wMin / ((1.2 * 2 + 1.6) / 3) }
})
const b8 = bar('#8')
const q7 = lazy(() => {
  const wu = 1.2 * 1.5 + 1.6 * 2
  const ld = ldSimplified({ db: b8.db, small: false, fc: 4000, fy: 60000, met: true })
  return { wu, ld, r: cutoff({ dg: { kind: 'ss', L: L1, wu }, b: 12, d: 17, fc: 4000, fy: 60000, bar: b8, nTotal: 3, nCut: 1, ld: ld.final, endEmbed: 8 }) }
})
const q8 = lazy(() => {
  const wu = 1.2 * 1.0 + 1.6 * 2.0
  const Mu = (wu * L1 ** 2) / 8
  const D = designAs(Mu, 12, 17, 4000, 60000)
  const add = D.As - Asof(3, 8)
  const opts = [6, 7, 8].map((no) => ({ no, n: Math.max(1, Math.ceil(add / BARS[no].A - 1e-9)) }))
  const pick = opts.find((o) => o.n <= 2) ?? opts[opts.length - 1]
  const MuOld = ((1.4 * 1.0 + 1.7 * 2.0) * L1 ** 2) / 8
  const DOld = designAs(MuOld, 12, 17, 4000, 60000)
  const exist = review({ b: 12, h: 20, fc: 4000, fy: 60000, layers: [{ As: Asof(3, 8), d: 17 }] })
  return { wu, Mu, D, add, pick, MuOld, DOld, exist }
})

// ================================================================ Section B data
const q9 = lazy(() => {
  const M = ((1.6 + 1.2) * 30 ** 2) / 8
  const W = wsdDoublyDesign(M, 12, 28.5, 2.5, 8, 1.5, 20)
  const Mu = ((1.2 * 1.6 + 1.6 * 1.2) * 30 ** 2) / 8
  const U = designAs(Mu, 12, 29.5, 4000, 60000)
  return { M, W, Mu, U }
})
const q10 = lazy(() => {
  const ld = floorLoads({ hf: 5, spacing: 12, bw: 14, h: 28, sdl: 70, ll: 90 })
  const bf = effectiveWidth({ kind: 'interior', L: 30, bw: 14, hf: 5, cc: 144 })
  const M = ((ld.wD + ld.wL) * 30 ** 2) / 8
  const W = wsdTDesign({ M, beff: bf.b, hf: 5, d: 25.5, n: 8, fcAllow: 1.8, fsAllow: 24 })
  const Mu = (ld.wu * 30 ** 2) / 8
  const inp: TDesignIn = { Mu, beff: bf.b, bw: 14, hf: 5, d: 25.5, fc: 4, fy: 60 }
  const U = designT(inp)
  return { ld, bf, M, W, Mu, inp, U, barsW: pickD(W.As, 14, [8, 9, 10], 1), barsU: pickD(U.As, 14, [8, 9, 10], 1) }
})
const s11 = lazy(() => cantSlab({ span: 14, support: 12, cantL: 6, cantR: 6, ll: 80, dlTotal: 140, fc: 3000, fy: 60000, h: 6 }))
const bm12: ShearBeam = { kind: 'ss', L: 36, wD: 2.0, P: [{ x: 10, P: 40 }, { x: 26, P: 40 }], factored: true }
const sec12: ShearSection = { bw: 14, d: 26, fc: 4000, fy: 60000 }

// ================================================================ questions
const P = '2007-08' as const
const PG = { s1: [88], s2: [89], s3: [90], fig1: [89], fig: [91], aid: [92] }
const FIG1 = 'Fig. 1: simply supported on two 10″ brick walls, clear span 20′-0″; section 12″ × 20″, d = 17″, 3 No. 8 bottom bars (2 run full length and stop 2″ from the beam ends, the centre bar is discontinued where no longer needed); $f\'_c$ = 4000 psi, $f_y$ = 60,000 psi, $f_r$ = 400 psi.'

export const R2007: RcQ[] = [
  {
    id: 'rc-2007-08-1',
    paper: P,
    sec: 'A',
    no: '1',
    marks: 17.5,
    topics: ['rc-elastic'],
    title: 'Service stresses and strains at midspan (DL 0.3, LL 0.2 k/ft)',
    pages: [...PG.s1, ...PG.fig1],
    text: `The simply supported beam of Fig. 1 with a clear span of 20 ft is to carry a distributed dead load (including its own weight) and live load in service. The loads are unfactored and the reinforcement consists of three No. 8 bars at 17 inch depth, one of which is discontinued where no longer needed. Material strengths are $f'_c$ = 4000 psi; $f_y$ = 60000 psi and tensile strength of concrete ($f_r$) = 400 psi. Determine the stresses and strains in concrete and steel caused by a live load of 0.2 k/ft and dead load of 0.3 k/ft acting on the beam. Consider midspan section.

${FIG1}`,
    given: [GRAPH],
    figure: fig1,
    notes: ['Span taken as the 20 ft clear span throughout Section A (c/c of walls = 20′-10″ would raise moments by 8.5 %). n = 8.', 'Whether the section is cracked must be checked first.'],
    checks: () => [
      { key: 'm', label: 'Service moment at midspan', value: (0.5 * L1 ** 2) / 8, unit: 'k-ft' },
      { key: 'fc', label: 'Top concrete stress', value: q1().fc, unit: 'ksi' },
      { key: 'fs', label: 'Steel stress', value: q1().fs, unit: 'ksi' },
    ],
    solution: () => {
      const e = q1()
      return (
        <Sol>
          <StepList steps={[{ t: 'Service moment', tex: `M = \\frac{(0.3 + 0.2)(20)^2}{8} = 25\\text{ k-ft}` }, ...e.steps]} />
          <Final>{`Section is **${e.state}** (M = 25 ${e.state === 'uncracked' ? '≤' : '>'} Mcr = ${f(e.Mcr, 1)} k-ft). Top concrete fc = ${f(e.fc * 1000, 0)} psi (εc = ${f(e.fc / EcK, 6)}); ${e.state === 'uncracked' ? `bottom ft = ${f(e.fct * 1000, 0)} psi < 400; ` : ''}steel fs = ${f(e.fs * 1000, 0)} psi (εs = ${f(e.fs / 29000, 6)}).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 6,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Balanced-stress steel ratio vs balanced steel ratio',
    pages: PG.s1,
    theory: true,
    text: 'What is balanced-stress steel ratio? Explain briefly the difference between balanced-stress steel ratio and balanced steel ratio.',
    given: [],
    solution: ans(A_BALSTRESS),
  },
  {
    id: 'rc-2007-08-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 11.5,
    topics: ['rc-elastic'],
    title: 'Cracking moment and the distributed load that causes it',
    pages: [...PG.s1, ...PG.fig1],
    text: `Find the moment that will produce the first cracking at the bottom surface of the beam (Fig. 1). Also, calculate the distributed load that can act on the beam of Fig. 1 corresponding to the above cracking moment.

${FIG1}`,
    given: [GRAPH],
    figure: fig1,
    checks: () => [
      { key: 'mcrg', label: 'Mcr (gross section)', value: q2().u.McrG, unit: 'k-ft' },
      { key: 'mcr', label: 'Mcr (uncracked transformed)', value: q2().u.Mcr, unit: 'k-ft' },
      { key: 'w', label: 'Distributed load for Mcr (transformed)', value: q2().wT, unit: 'k/ft' },
    ],
    solution: () => {
      const { u, wG, wT } = q2()
      return (
        <Sol>
          <StepList steps={[{ t: 'Gross section', tex: `M_{cr} = \\frac{f_rI_g}{y_t} = \\frac{400(${f(u.Ig, 0)})}{10} = ${f(u.McrG * 12000, 0)}\\text{ in-lb} = ${f(u.McrG, 2)}\\text{ k-ft}` }, ...u.steps]} />
          <Final>{`Mcr = **${f(u.McrG, 1)} k-ft** (gross) / **${f(u.Mcr, 1)} k-ft** (transformed). Load: $w = 8M_{cr}/L^2$ → **${f(wG, 3)} k/ft** (gross) / **${f(wT, 3)} k/ft** (transformed), total service load including self-weight.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 6,
    topics: ['rc-singly', 'rc-doubly'],
    title: 'Singly vs doubly reinforced; over- vs under-reinforced',
    pages: PG.s1,
    theory: true,
    text: 'Explain the meaning of (i) Singly reinforced and doubly reinforced (ii) Over reinforced and under reinforced beam.',
    given: [],
    solution: ans(A_SINGLY_DOUBLY),
  },
  {
    id: 'rc-2007-08-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 11.5,
    topics: ['rc-elastic'],
    title: 'Maximum moment at the ACI allowable stresses',
    pages: [...PG.s1, ...PG.fig1],
    text: `Determine the maximum moment that can be carried by the beam of Fig. 1 without stressing concrete and steel beyond the allowable stresses recommended by the ACI code.

${FIG1}`,
    given: [GRAPH],
    figure: fig1,
    flag: 'WSD (ACI alternate design method)',
    notes: ['ACI allowables: fc = 0.45f′c = 1.8 ksi, fs = 24 ksi (Grade 60).'],
    checks: () => [
      { key: 'kd', label: 'Cracked neutral axis kd', value: q3().kd, unit: 'in' },
      { key: 'm', label: 'Allowable moment', value: q3().M, unit: 'k-ft' },
    ],
    solution: () => {
      const a = q3()
      return (
        <Sol>
          <StepList steps={a.steps} />
          <Final>{`**M_allow = ${f(a.M, 1)} k-ft** (${a.governs} governs).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 6,
    topics: ['rc-singly', 'rc-tbeam'],
    title: 'Why a lower limit on ρ; values for rectangular and T-beams',
    pages: PG.s1,
    theory: true,
    text: 'Why the ACI code recommends a lower limit for steel ratio of beams in flexure? Give the values of this limit for rectangular and T-beams.',
    given: [],
    solution: ans(`### Why
A beam with very little steel has a cracked-section strength below its cracking moment $M_{cr} = f_rI_g/y_t$. At first cracking the concrete's tension is dumped on the steel, which yields or fractures at once — a sudden failure without warning. A minimum ratio keeps $\\phi M_n$ comfortably above $M_{cr}$ (and covers shrinkage and temperature effects).

### Values (ACI 318)
- **Rectangular beams, and T-beams with the flange in compression**: $A_{s,min} = \\dfrac{3\\sqrt{f'_c}}{f_y}b_wd \\ge \\dfrac{200}{f_y}b_wd$ (psi). For Grade 60: $\\rho_{min} = 0.0033$ up to 4444 psi.
- **T-beams with the flange in tension** (statically determinate, e.g. cantilever): replace $b_w$ by the smaller of $2b_w$ and $b_f$ (older ACI: $6\\sqrt{f'_c}\\,b_wd/f_y$).
- Waived if the steel provided is at least 4/3 of that required by analysis.
- Slabs: $0.0018bh$ (Grade 60), $0.0020bh$ (Grade 40/50).`),
  },
  {
    id: 'rc-2007-08-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 11.5,
    topics: ['rc-singly'],
    title: 'Mn, φMn and the unfactored load (D/L = 2) they correspond to',
    pages: [...PG.s1, ...PG.fig1],
    text: `Find the nominal flexural strength and design strength of the beam shown in Fig. 1. Also, calculate the distributed load (unfactored) that can act on the beam corresponding to the above flexural strength. Assume dead load/live load ratio = 2.0.

${FIG1}`,
    given: [GRAPH],
    figure: fig1,
    flag: 'Load factors not printed: 1.2D + 1.6L used (1.4D + 1.7L also shown)',
    checks: () => [
      { key: 'mn', label: 'Mn', value: q4().r.Mn, unit: 'k-ft' },
      { key: 'pmn', label: 'φMn', value: q4().r.phiMn, unit: 'k-ft' },
      { key: 'w', label: 'Total unfactored load D + L', value: q4().w, unit: 'k/ft' },
    ],
    solution: () => {
      const Q = q4()
      return (
        <Sol>
          <StepList steps={Q.r.steps} />
          <StepList
            start={Q.r.steps.length + 1}
            steps={[
              { t: 'Factored load capacity', tex: `w_u = \\frac{8\\phi M_n}{L^2} = \\frac{8(${f(Q.r.phiMn, 1)})}{20^2} = ${f(Q.wu, 3)}\\text{ k/ft}` },
              { t: 'Unfactored loads (D = 2L)', tex: `1.2(2L) + 1.6L = 4.0L = ${f(Q.wu, 3)} \\Rightarrow L = ${f(Q.LL, 3)},\\ D = ${f(Q.DL, 3)},\\ D + L = ${f(Q.w, 3)}\\text{ k/ft}` },
            ]}
          />
          <Final>{`**Mn = ${f(Q.r.Mn, 1)} k-ft, φMn = ${f(Q.r.phiMn, 1)} k-ft**; service load **D + L = ${f(Q.w, 2)} k/ft** (D = ${f(Q.DL, 2)}, L = ${f(Q.LL, 2)}). With 1.4D + 1.7L: ${f(Q.wOld, 2)} k/ft.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-5a',
    paper: P,
    sec: 'A',
    no: '5(a)',
    marks: 5,
    topics: ['rc-shear'],
    title: 'Why design shear is taken at d from the support face',
    pages: PG.s2,
    theory: true,
    text: "Where the reaction from the support surface introduces vertical compression at the end of the beam, the maximum shear to be considered for design will be computed at a distance of 'd' from face of the support, explain why?",
    given: [],
    solution: ans(A_CRITD, CritSketch),
  },
  {
    id: 'rc-2007-08-5b',
    paper: P,
    sec: 'A',
    no: '5(b)',
    marks: 12.5,
    topics: ['rc-shear'],
    title: 'Fig. 1 beam, DL 1.5 + LL 2.0 k/ft: where stirrups are needed, s at d vs smax',
    pages: [...PG.s2, ...PG.fig1],
    text: `If a dead load of 1.5 k/ft and live load of 2.0 k/ft acts on the beam of Fig. 1, what part of the beam will require web reinforcement? Select the stirrup size and calculate the stirrup spacing corresponding to the shear at a distance 'd' from face of the support and compare with the maximum spacing recommended by the ACI code. Follow any method for your calculation.

${FIG1}`,
    given: [GRAPH],
    figure: fig1,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['Supports are the 10″ walls: centre-line span 20′-10″, faces 20 ft apart; critical section d = 17 in from the wall face.'],
    checks: () => shearChecks(bm5, sec5),
    solution: () => <ShearSol bm={bm5} sec={sec5} note="USD, wu = 1.2(1.5) + 1.6(2.0) = 5.0 k/ft; No. 3 two-legged stirrups." />,
  },
  {
    id: 'rc-2007-08-6a',
    paper: P,
    sec: 'A',
    no: '6(a)',
    marks: 8,
    topics: ['rc-shear'],
    title: 'ACI maximum stirrup spacing for Vs ≤ and ≥ 4√f′c bw d',
    pages: PG.s2,
    theory: true,
    text: 'What are the maximum spacing of stirrups in shear design for the following cases: (i) When $V_s \\le 4\\sqrt{f\'_c}\\,b_wd$; (ii) When $V_s \\ge 4\\sqrt{f\'_c}\\,b_wd$.',
    given: [],
    solution: ans(A_SMAX),
  },
  {
    id: 'rc-2007-08-6b',
    paper: P,
    sec: 'A',
    no: '6(b)',
    marks: 9.5,
    topics: ['rc-shear'],
    title: 'Load the Fig. 1 beam can carry with no / only minimum web steel',
    pages: [...PG.s2, ...PG.fig1],
    text: `Compute the total distributed load that the beam of Fig. 1 can carry for which (i) no web reinforcement will be required (ii) Only the minimum web reinforcement is provided. Follow any method for your calculation.

${FIG1}`,
    given: [GRAPH],
    figure: fig1,
    notes: ['Critical section at d = 17 in from the face; clear span 20 ft, so Vu(d) = wu(10 − 17/12).', 'Service totals assume D/L = 2 as in Q4(b) (average load factor 4.0/3).'],
    checks: () => [
      { key: 'w1', label: '(i) factored load with no web steel (Vu ≤ ½φVc)', value: q6().wNone, unit: 'k/ft' },
      { key: 'w2', label: '(ii) factored load with minimum web steel (Vu ≤ φVc)', value: q6().wMin, unit: 'k/ft' },
    ],
    solution: () => {
      const Q = q6()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Concrete capacity', tex: `\\phi V_c = 0.75(2\\sqrt{4000})(12)(17)/1000 = ${f(Q.k.phiVc, 2)}\\text{ k},\\quad \\tfrac12\\phi V_c = ${f(Q.k.halfPhiVc, 2)}\\text{ k}` },
              { t: 'Shear at d', tex: `V_u = w_u\\left(\\frac{20}{2} - \\frac{17}{12}\\right) = ${f(Q.arm, 3)}w_u` },
              { t: '(i) no web steel', tex: `${f(Q.arm, 3)}w_u \\le ${f(Q.k.halfPhiVc, 2)} \\Rightarrow w_u = ${f(Q.wNone, 3)}\\text{ k/ft}` },
              { t: '(ii) minimum web steel', tex: `${f(Q.arm, 3)}w_u \\le ${f(Q.k.phiVc, 2)} \\Rightarrow w_u = ${f(Q.wMin, 3)}\\text{ k/ft}`, md: `Minimum stirrups: No. 3 U at s ≤ min(d/2 = 8.5 in, ${f(Q.k.sMinSteel, 1)} in).` },
            ]}
          />
          <Final>{`(i) **wu = ${f(Q.wNone, 2)} k/ft** (≈ ${f(Q.sNone, 2)} k/ft service); (ii) **wu = ${f(Q.wMin, 2)} k/ft** (≈ ${f(Q.sMin, 2)} k/ft service).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-7a',
    paper: P,
    sec: 'A',
    no: '7(a)',
    marks: 6,
    topics: ['rc-bond'],
    title: 'Class A and Class B tension splices',
    pages: PG.s2,
    theory: true,
    text: 'Explain briefly the class A and class B splices in tension rebars.',
    given: [],
    solution: ans(A_SPLICE),
  },
  {
    id: 'rc-2007-08-7b',
    paper: P,
    sec: 'A',
    no: '7(b)',
    marks: 11.5,
    topics: ['rc-bond'],
    title: 'Cut-off point of the centre bar; ld of continued and cut bars',
    pages: [...PG.s2, ...PG.fig1],
    text: `Calculate the point where the centre rebar of beam shown in Fig. 1 can be discontinued. Check to be sure that adequate development length is provided for continued and discontinued rebars. Follow any method for your calculation. Consider simplified equation for calculation of Development length.

${FIG1}`,
    given: [GRAPH],
    figure: fig1,
    flag: 'Loads not stated here: Q5(b) loads (DL 1.5, LL 2.0 k/ft) used',
    notes: ['Continuing bars run 10 − 2 = 8 in past the wall face.', 'Bottom bars, favourable spacing case: ld = fy db/(20√f′c).'],
    checks: () => [
      { key: 'pm2', label: 'φMn of the 2 continuing No. 8 bars', value: q7().r.remain.phiMn, unit: 'k-ft' },
      { key: 'xt', label: 'Theoretical cut-off point from the support face', value: q7().r.xTheo, unit: 'ft' },
      { key: 'xc', label: 'Actual cut-off point from the support face', value: q7().r.xCut, unit: 'ft' },
    ],
    solution: () => {
      const { wu, ld, r } = q7()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Moments', tex: `w_u = 5.0\\text{ k/ft},\\ M_u = \\frac{5(20)^2}{8} = ${f(r.Mmax, 1)}\\text{ k-ft};\\ \\phi M_n(3\\#8) = ${f(r.all.phiMn, 1)}\\ ${r.adequate ? '\\ge' : '<'}\\ M_u` },
              { t: 'Two bars', tex: `\\phi M_n(2\\#8) = ${f(r.remain.phiMn, 1)}\\text{ k-ft}` },
              { t: 'Theoretical cut-off', tex: `\\frac{w_ux(20 - x)}{2} = ${f(r.remain.phiMn, 1)} \\Rightarrow x = ${f(r.xTheo, 2)}\\text{ ft from the face}` },
              { t: 'Extension', tex: `\\max(d, 12d_b) = \\max(17, 12) = ${f(r.ext)}\\text{ in} \\Rightarrow x = ${f(r.xExt, 2)}\\text{ ft}` },
              { t: 'Development of the cut bar', tex: `l_d = \\frac{60000}{20\\sqrt{4000}}(1.0) = ${f(ld.final, 1)}\\text{ in};\\ \\text{midspan to cut} = ${f(r.availCut, 1)}\\text{ in}\\ ${r.availCut >= ld.final ? '\\ge' : '<'}\\ l_d`, md: r.ldGoverns ? 'ld governs — the cut point moves toward the support.' : 'Extension governs ✓' },
              { t: 'Continuing bars', tex: `x_{theo}\\times12 + 8 = ${f(r.availCont, 1)}\\text{ in}\\ ${r.contOK ? '\\ge' : '<'}\\ l_d = ${f(ld.final, 1)}\\text{ in}`, md: `${r.contOK ? 'Adequate ✓' : 'Short: hook the continuing bars at the walls.'} At the support: $l_d \\le 1.3M_n/V_u + l_a = ${f(r.ssCheck!.limit, 1)}$ in ${r.ssCheck!.ok ? '✓' : '✗'}.` },
            ]}
          />
          <Final>{`Stop the centre bar **${f(r.xCut, 2)} ft (${upIn(r.xCut * 12)} in) from each wall face** (so it is ${f(20 - 2 * r.xCut, 2)} ft long). ${r.fracOK ? 'Two of three bars (≥ 1/3) continue into the supports ✓.' : ''} wu = ${f(wu)} k/ft.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-8',
    paper: P,
    sec: 'A',
    no: '8',
    marks: 17.5,
    topics: ['rc-singly'],
    title: 'Extra steel for DL 1.0 + LL 2.0 k/ft on the Fig. 1 beam',
    pages: [...PG.s2, ...PG.fig1],
    text: `If the beam of Fig. 1 is subjected to a live load of 2.0 k/ft and dead load of 1.0 k/ft, what additional reinforcement will be required to resist the moment at midspan? Follow any method for your calculation.

${FIG1}`,
    given: [GRAPH],
    figure: fig1,
    flag: 'Load factors not printed: 1.2D + 1.6L used (1.4D + 1.7L also shown)',
    notes: ['Self-weight taken as included in the 1.0 k/ft dead load.'],
    checks: () => [
      { key: 'mu', label: 'Mu at midspan', value: q8().Mu, unit: 'k-ft' },
      { key: 'as', label: 'Total As required', value: q8().D.As, unit: 'in²' },
      { key: 'add', label: 'Additional As over 3 No. 8 (2.37 in²)', value: q8().add, unit: 'in²' },
    ],
    solution: () => {
      const Q = q8()
      return (
        <Sol>
          <StepList steps={[{ t: 'Moment', tex: `w_u = 1.2(1.0) + 1.6(2.0) = ${f(Q.wu)}\\text{ k/ft},\\ M_u = \\frac{${f(Q.wu)}(20)^2}{8} = ${f(Q.Mu, 1)}\\text{ k-ft}\\ >\\ \\phi M_n(3\\#8) = ${f(Q.exist.phiMn, 1)}` }, ...Q.D.steps]} />
          <Final>{`Required As = ${f(Q.D.As)} in² → additional **${f(Q.add)} in²**: add **${Q.pick.n} No. ${Q.pick.no}** (${f(Q.pick.n * BARS[Q.pick.no].A, 2)} in²)${Q.D.needsComp ? ' — but ρ exceeds ρmax: compression steel is needed' : ''}. If they must go in a second layer, d drops to about 16 in: recheck. With 1.4D + 1.7L: Mu = ${f(Q.MuOld, 1)} k-ft, As = ${Number.isFinite(Q.DOld.As) ? f(Q.DOld.As) : '—'} in²${Q.DOld.needsComp ? ' (beyond the singly reinforced limit: add compression steel)' : ''}. Graph A.1: R = Mu/(φbd²) = ${f((Q.Mu * 12000) / (0.9 * 12 * 17 * 17), 0)} psi → read ρ ≈ ${f(Q.D.rho, 4)}.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-9a',
    paper: P,
    sec: 'B',
    no: '9(a)',
    marks: 28,
    topics: ['rc-elastic', 'rc-singly'],
    title: '30 ft beam, 12 × 32 in: WSD (k, j given) vs USD, and comments',
    pages: [...PG.s3, ...PG.fig],
    text: `A rectangular beam carries a service load of DL = 1.6 k/′ including self wt. of the beam and LL = 1.2 k/′. The beam has a simple span of 30 ft and the cross section of the beam is limited to 12″ × 32″ (Fig. 2). Given $f'_c$ = 4 ksi, $f_y$ = 60 ksi, $f_s$ = 20 ksi, n = 8, k = 0.375, j = 0.875. Design the beam for flexure (i) by WSD method (ii) by USD method (iii) Give your comments on the designs.`,
    given: [],
    figure: fig2,
    flag: 'WSD design + load factors not printed (1.2D + 1.6L used)',
    notes: ['The given k = 0.375 implies fc = fs k/(n(1 − k)) = 1.5 ksi (not 0.45f′c = 1.8); the given k and j are used.', 'WSD needs two layers: d = 32 − 3.5 = 28.5 in, d′ = 2.5 in. USD: one layer, d = 29.5 in.'],
    checks: () => [
      { key: 'm', label: 'Service moment', value: q9().M, unit: 'k-ft' },
      { key: 'asw', label: 'WSD tension steel As', value: q9().W.As, unit: 'in²' },
      { key: 'aspw', label: "WSD compression steel A′s", value: q9().W.Asp, unit: 'in²' },
      { key: 'asu', label: 'USD As', value: q9().U.As, unit: 'in²' },
    ],
    solution: () => {
      const Q = q9()
      return (
        <Sol>
          <SH>(i) WSD</SH>
          <StepList steps={[{ t: 'Service moment', tex: `M = \\frac{(1.6 + 1.2)(30)^2}{8} = ${f(Q.M, 1)}\\text{ k-ft}` }, ...Q.W.steps]} />
          <SH>(ii) USD</SH>
          <StepList steps={[{ t: 'Factored moment', tex: `M_u = \\frac{[1.2(1.6) + 1.6(1.2)](30)^2}{8} = ${f(Q.Mu, 1)}\\text{ k-ft}` }, ...Q.U.steps]} />
          <Final>{`WSD: R = ${f(Q.W.R * 1000, 0)} psi gives M1 = ${f(Q.W.M1, 1)} k-ft < ${f(Q.M, 1)} k-ft, so the 12 × 32 section needs **A′s = ${f(Q.W.Asp, 2)} in²** and **As = ${f(Q.W.As, 2)} in²**. USD: **As = ${f(Q.U.As, 2)} in²**, singly reinforced, εt = ${f(Q.U.epsT, 4)}.
(iii) WSD uses low allowable stresses (fs = 20 ksi, fc = 1.5 ksi) on service loads, so the same section needs about ${f(Q.W.As / Q.U.As, 1)}× the tension steel plus compression steel. USD uses the real strength with load factors where they matter, giving a lighter, more consistent design; WSD's margin varies with the steel ratio. Serviceability (deflection, cracking) still has to be checked in USD.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-9b',
    paper: P,
    sec: 'B',
    no: '9(b)',
    marks: 7,
    topics: ['rc-doubly'],
    title: 'Does compression steel always increase moment capacity?',
    pages: PG.s3,
    theory: true,
    text: 'Do you think addition of bars in the compression zone of a singly reinforced beam will always increase the moment capacity of that particular section? Justify your answer.',
    given: [],
    solution: ans(A_COMPSTEEL),
  },
  {
    id: 'rc-2007-08-10a',
    paper: P,
    sec: 'B',
    no: '10(a)',
    marks: 7,
    topics: ['rc-tbeam'],
    title: 'Selecting the web proportions of a T-beam',
    pages: PG.s3,
    theory: true,
    text: 'What are the points to be considered to select the proportion of the web in a T-beam? Explain briefly.',
    given: [],
    solution: ans(A_WEB),
  },
  {
    id: 'rc-2007-08-10b',
    paper: P,
    sec: 'B',
    no: '10(b)',
    marks: 5,
    topics: ['rc-tbeam'],
    title: 'Code rules for the effective width of a T-beam',
    pages: PG.s3,
    theory: true,
    text: 'Mention the code requirements for the determination of effective width of a T-beam.',
    given: [],
    solution: ans(A_BEFF),
  },
  {
    id: 'rc-2007-08-10c',
    paper: P,
    sec: 'B',
    no: '10(c)',
    marks: 23,
    topics: ['rc-tbeam', 'rc-elastic'],
    title: 'Interior T-beam (5 in slab, beams 12 ft c/c, 30 ft span) by WSD and USD',
    pages: [...PG.s3, ...PG.fig],
    text: `A 5″ thick slab is supported by parallel simply supported beams 12′-0″ c.c, 30 ft span as shown in Fig. 3. The web of the beams is 14″ × 23″. The slab is subjected to a floor finish = 30 psf, partition wall load = 40 psf and a working live load, LL = 90 psf. Using $f'_c$ = 4 ksi, $f_y$ = 60 ksi, $f_s$ = 24 ksi. Design a beam for flexure only by (i) WSD and (ii) USD.`,
    given: [],
    figure: fig3,
    flag: 'WSD design + load factors not printed (1.2D + 1.6L used)',
    notes: ['h = 5 + 23 = 28 in, d = 25.5 in; n = 8, fc = 0.45f′c = 1.8 ksi.', 'beff by ACI 318-14: min(16hf + bw, L/4 + bw, c/c).'],
    checks: () => [
      { key: 'beff', label: 'Effective flange width', value: q10().bf.b, unit: 'in' },
      { key: 'asw', label: 'WSD As', value: q10().W.As, unit: 'in²' },
      { key: 'asu', label: 'USD As', value: q10().U.As, unit: 'in²' },
    ],
    solution: () => {
      const Q = q10()
      const W = Q.W
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Loads per beam (12 ft strip)', tex: `\\text{slab } ${f(Q.ld.slab)} + \\text{web } ${f(Q.ld.web)} + \\text{FF+PW } ${f(Q.ld.sdl)} = D = ${f(Q.ld.wD)}\\text{ k/ft};\\ L = ${f(Q.ld.wL)}\\text{ k/ft}` },
              { t: 'Effective width', tex: `b_{eff} = \\min(${Q.bf.cands.map((c) => `${c.label} = ${f(c.value, 1)}`).join(',\\ ')}) = ${f(Q.bf.b, 1)}\\text{ in}` },
            ]}
          />
          <SH>(i) WSD</SH>
          <StepList
            start={3}
            steps={[
              { t: 'Service moment', tex: `M = \\frac{(${f(Q.ld.wD)} + ${f(Q.ld.wL)})(30)^2}{8} = ${f(Q.M, 1)}\\text{ k-ft}` },
              { t: 'Trial', tex: `jd \\approx d - h_f/2 = 23\\text{ in} \\Rightarrow A_s = \\frac{M}{f_sjd} = ${f(W.iters[0].As)}\\text{ in}^2` },
              { t: 'Neutral axis and lever arm', tex: `kd = ${f(W.sec.kd, 2)}\\text{ in}\\ ${W.sec.rect ? '\\le' : '>'}\\ h_f;\\ jd = ${f(W.sec.jd, 2)}\\text{ in} \\Rightarrow A_s = ${f(W.As)}\\text{ in}^2`, md: W.sec.rect ? 'NA within the flange: rectangular formulas with b = beff.' : 'NA below the flange: T-section formulas (web compression neglected).' },
              { t: 'Concrete stress', tex: `f_c = ${f(W.fcAct, 3)}\\text{ ksi}\\ ${W.concreteOk ? '\\le' : '>'}\\ 1.8\\text{ ksi}` },
            ]}
          />
          <SH>(ii) USD</SH>
          <StepList steps={[{ t: 'Factored moment', tex: `w_u = ${f(Q.ld.wu)}\\text{ k/ft},\\ M_u = ${f(Q.Mu, 1)}\\text{ k-ft}` }, ...tDesignSteps(Q.inp, Q.U)]} start={7} />
          <Final>{`WSD: **As = ${f(W.As)} in²** (${Q.barsW.n} No. ${Q.barsW.no}); USD: **As = ${f(Q.U.As)} in²** (${Q.barsU.n} No. ${Q.barsU.no}). USD needs about ${f((1 - Q.U.As / W.As) * 100, 0)} % less steel.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2007-08-11a',
    paper: P,
    sec: 'B',
    no: '11(a)',
    marks: 10,
    topics: ['rc-oneway'],
    title: 'Temperature & shrinkage reinforcement and why slabs need it',
    pages: PG.s3,
    theory: true,
    text: 'Explain temperature and shrinkage reinforcements and discuss their necessity in RC designs with reference to slabs.',
    given: [],
    solution: ans(A_TS),
  },
  {
    id: 'rc-2007-08-11b',
    paper: P,
    sec: 'B',
    no: '11(b)',
    marks: 25,
    topics: ['rc-oneway'],
    title: '6 in slab on two beams with 6 ft overhangs (LL patterns), WSD or USD',
    pages: [...PG.s3, ...PG.fig],
    text: `A 6″ thick slab (one way) is supported on RC beams as shown in Fig. 4. The calculated dead load on the slab is 140 psf (total) and the slab is subjected to a working live load of 80 psf. The live load can occupy any portion or any position on the slab. Calculate the critical moments and design the slab and sketch the reinforcements. Use either WSD or USD. Use $f'_c$ = 3 ksi, $f_y$ = 60 ksi, $f_s$ = 24 ksi, k = 0.336.

Fig. 4: slab 16′ long; 6′ overhang | 1′ beam | 14′-0″ | 1′ beam | 6′-0″ overhang.`,
    given: [],
    figure: fig4,
    flag: 'Load factors not printed: solved by USD with 1.2D + 1.6L',
    notes: ['k = 0.336 corresponds to n = 9, fc = 1.35 ksi, fs = 24 ksi (for a WSD solution).', 'The 6 in slab is thinner than l/10 = 7.2 in for a 6 ft cantilever; the given thickness is used.'],
    checks: () => [
      { key: 'mneg', label: 'Negative moment at the beam face', value: s11().Mneg, unit: 'k-ft/ft' },
      { key: 'mpos', label: 'Maximum positive moment (LL on span only)', value: s11().Mpos, unit: 'k-ft/ft' },
    ],
    solution: () => <CantSlabSol r={s11()} />,
  },
  {
    id: 'rc-2007-08-12a',
    paper: P,
    sec: 'B',
    no: '12(a)',
    marks: 6,
    topics: ['rc-basics'],
    title: 'Why USD uses the yield (not ultimate) strength of steel',
    pages: PG.s3,
    theory: true,
    text: 'In ultimate strength design, the yield strength not the ultimate strength of the reinforcing steel is used. Explain why?',
    given: [],
    solution: ans(A_FY),
  },
  {
    id: 'rc-2007-08-12b',
    paper: P,
    sec: 'B',
    no: '12(b)',
    marks: 9,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Strain and stress sketches: uncracked, cracked, ultimate',
    pages: PG.s3,
    theory: true,
    text: 'Draw the sketches for strain and stress distribution of a rectangular RC beam for uncracked, cracked and ultimate conditions.',
    given: [],
    solution: ans(A_STAGES, StagesSketch),
  },
  {
    id: 'rc-2007-08-12c',
    paper: P,
    sec: 'B',
    no: '12(c)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Stirrups in 3 sets: 36 ft beam, two 40 k loads + 2 k/ft (factored)',
    pages: [...PG.s3, ...PG.fig],
    text: `Design the stirrups for the beam shown in Fig. 5. Use $f'_c$ = 4 ksi, $f_y$ = 60 ksi. Calculate stirrups with 3 sets of spacing. Show the stirrups in a neat sketch.

Fig. 5: simple span 10′-0″ + 16′-0″ + 10′-0″ = 36′; 40 k at 10 ft from each support and 2 k/ft (including self-wt.) — all loads factored. Section b = 14″, d = 26″.`,
    given: [],
    figure: fig5,
    checks: () => shearChecks(bm12, sec12),
    solution: () => <ShearSol bm={bm12} sec={sec12} note="All loads factored; supports treated as points." />,
  },
]
