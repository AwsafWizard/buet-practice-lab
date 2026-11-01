// CE 315 term final 2008-09 (held 6 Apr 2010) — PDF pp. 84–87.
// Q5 (a)–(c) is a chained mini-problem on one 12 × 20 in beam; Q8(b) (i)–(iii) on the tapered cantilever of Fig. 5.
import { Md } from '../../../components/ui'
import type { RcQ } from '../../types'
import { allowableMoment, elasticAt, wsdDesign, type ElasticInput } from '../../engine/elastic'
import { As as Asof } from '../../engine/materials'
import { beamLoads, designAs, pickBars as pickSingly, review } from '../../engine/singly'
import { designDoubly, pickBars as pickD, reviewDoubly, type DoublyDesignIn, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, floorLoads, type TDesignIn } from '../../engine/tbeam'
import { bwdRequired, type ShearBeam, type ShearSection } from '../../engine/shear'
import { bar, beamBarGeometry, hookFactors, hookGeometry, ldhCalc, ldSimplified, phiMnRect, simplifiedCase, upIn } from '../../engine/bond'
import { cantSlab } from '../../engine/oneway'
import {
  A_ET_RHOMAX,
  A_LD,
  A_PHI_ET,
  A_RHOMIN,
  A_TS,
  ans,
  Arrow,
  C,
  Dim,
  doublyDesignSteps,
  doublyReviewSteps,
  f,
  Fig,
  Final,
  FloorSec,
  Hatch,
  lazy,
  Lines,
  PhiChart,
  RectSec,
  SH,
  shearChecks,
  ShearSol,
  Sol,
  SSBeam,
  StepList,
  T,
  Tbl,
  tDesignSteps,
  Udl,
  type SolStep,
} from './r2012'
import { A_LF } from './r2011'
import { CantSlabSol } from './r2009'

// ================================================================ theory first asked here
export const A_SERV = `**Serviceability** means that the structure performs satisfactorily under the **service (unfactored) loads** during its life — it is usable, comfortable and durable — as distinct from **strength** (safety against collapse under factored loads). The serviceability limit states are:

1. **Deflection** — must not damage partitions, finishes or equipment, cause ponding, or look unsafe. ACI controls it by the minimum-thickness tables or by computed deflections (immediate deflection with $I_e$, plus long-term creep/shrinkage deflection $\\lambda_\\Delta = \\xi/(1 + 50\\rho')$) checked against limits such as $l/360$ (live load, floors) and $l/480$ (after attachment of partitions).
2. **Cracking** — cracks are unavoidable in RC, but they must stay hairline for appearance and corrosion protection. ACI controls crack width by limiting bar spacing, $s \\le 15(40{,}000/f_s) - 2.5c_c \\le 12(40{,}000/f_s)$, with $f_s \\approx \\tfrac23f_y$.
3. **Vibration** — floors should be stiff enough not to vibrate perceptibly under walking or machinery.
4. **Durability** — adequate cover, concrete quality and crack control against corrosion and deterioration.

Serviceability is checked at service loads with elastic (cracked-section) behaviour, not at ultimate.`

export const A_BEFF = `Because of **shear lag**, the compressive stress in a wide flange is largest over the web and falls off away from it. The **effective width** is the width that, carrying the peak stress uniformly, gives the same total force. ACI 318 (Table 6.3.2.1; 318-08 §8.12):

**T-beam** (slab on both sides) — the overhang on each side is the smallest of
- $8h_f$,
- half the clear distance to the next web, $s_w/2$,
- $l_n/8$ (one-eighth of the span).

Equivalently $b_{eff} \\le b_w + 16h_f$, $\\le$ centre-to-centre spacing of beams, and $\\le L/4$ (ACI 318-08 form).

**L-beam** (slab on one side only) — overhang is the smallest of $6h_f$, $s_w/2$ and $l_n/12$, i.e. $b_{eff} \\le b_w + 6h_f$, $\\le b_w + s_w/2$, $\\le b_w + L/12$.

**Isolated T-beam** (flange used only for extra compression area) — flange thickness $h_f \\ge b_w/2$ and effective width $b \\le 4b_w$.`

export const A_TRUSS = `### Behaviour after diagonal cracking
- Before cracking the stirrups are almost unstressed. When an inclined crack forms, every stirrup it crosses is suddenly stretched and starts to carry shear.
- The external shear is then resisted by $V_n = V_c + V_s$: the concrete contribution $V_c$ (uncracked compression zone, aggregate interlock, dowel action) plus the stirrup force $V_s$.
- Stirrups also **limit the growth and width of the crack** (keeping more compression zone and aggregate interlock), **hold the crack faces together**, and **tie the longitudinal bars** (more dowel action, less splitting).
- The beam acts like a **truss** (Ritter–Mörsch analogy): the concrete compression zone is the top chord, the longitudinal steel the bottom chord, the stirrups vertical ties, and the concrete between cracks inclined struts at about 45°.
- Failure is near when the stirrups crossing the critical crack **yield**: the crack then widens and the compression zone fails.

### Spacing of vertical stirrups
The crack is assumed at 45°, so its horizontal projection is $p \\approx d$. The number of stirrups crossing it is $n = p/s = d/s$, each carrying $A_vf_{yt}$ at failure:
$$V_s = nA_vf_{yt} = \\frac{A_vf_{yt}d}{s}$$
Design: $V_u \\le \\phi V_n = \\phi\\left(V_c + \\frac{A_vf_{yt}d}{s}\\right)$, so
$$s = \\frac{\\phi A_vf_{yt}d}{V_u - \\phi V_c}$$
(for inclined stirrups at angle α: $V_s = A_vf_{yt}d(\\sin\\alpha + \\cos\\alpha)/s$). The spacing is then limited by $s \\le d/2$ and 24 in (halved when $V_s > 4\\sqrt{f'_c}b_wd$) and by the minimum web steel. Tests show the equation is conservative (actual strength ≈ 45 % higher).`

export function TrussSketch() {
  return (
    <Fig w={560} h={170}>
      <rect x={30} y={30} width={500} height={90} fill={C.conc} stroke={C.ink} />
      {[70, 120, 170, 220, 270, 320, 370, 420, 470].map((x) => (
        <line key={x} x1={x} y1={36} x2={x} y2={114} stroke={C.steel} strokeWidth={2} />
      ))}
      <line x1={36} y1={108} x2={524} y2={108} stroke={C.steel} strokeWidth={3} />
      <path d="M150,112 L250,44" stroke={C.load} strokeWidth={2} fill="none" strokeDasharray="6 3" />
      <Dim x1={150} y1={140} x2={250} y2={140} label="p ≈ d → n = d/s stirrups cross" side="b" />
      <Dim x1={270} y1={20} x2={320} y2={20} label="s" />
      <T x={430} y={60} s={11}>
        diagonal crack
      </T>
      <Arrow x1={190} y1={100} x2={190} y2={60} c={C.ink} w={1.2} />
      <T x={196} y={84} a="start" s={11}>
        Av fyt each
      </T>
    </Fig>
  )
}

// ================================================================ figures
const fig1 = () => (
  <Fig w={620} h={210}>
    <T x={220} y={30} c={C.load}>
      W (DL + LL)
    </T>
    <SSBeam x0={30} y={80} len={360} L={26} dimLabels={["26'-0\""]} />
    <RectSec x={430} y={30} s={4.4} b={12} h={30} rows={[]} />
    <Dim x1={495} y1={30} x2={495} y2={30 + 30 * 4.4} label={'30"'} />
    <Dim x1={430} y1={172} x2={430 + 12 * 4.4} y2={172} label={'12"'} side="b" />
    <Lines x={20} y={160} s={11} step={15} lines={['WDL = 1.2 kip/ft (excluding self-wt.), WLL = 1.0 kip/ft', "f′c = 3 ksi, fy = 40 ksi, fs = 18 ksi, n = 9"]} />
  </Fig>
)

const fig2 = () => (
  <Fig w={520} h={150}>
    <FloorSec x={30} y={30} s={1.6} hf={4} bw={12} sp={120} hw={24} n={2} over={60} />
    <Dim x1={30 + 66 * 1.6} y1={110} x2={30 + 186 * 1.6} y2={110} label={"10'-0\""} side="b" />
    <Dim x1={30 + 192 * 1.6 + 30} y1={30 + 4 * 1.6} x2={30 + 192 * 1.6 + 30} y2={30 + 28 * 1.6} label={'24"'} />
    <T x={150} y={22} s={11}>
      4" slab; webs 12" × 24" below the slab; span 30 ft (simply supported)
    </T>
  </Fig>
)

const fig3 = () => (
  <Fig w={560} h={300}>
    <rect x={40} y={30} width={26 * 18} height={16 * 10} fill={C.conc} opacity={0.5} stroke={C.ink} />
    {[5, 20].map((x) => (
      <rect key={x} x={40 + x * 18} y={30} width={18} height={160} fill="none" stroke={C.ink} strokeDasharray="5 3" />
    ))}
    <T x={274} y={22} s={11}>
      Free edge (all edges free except at the beams)
    </T>
    <Dim x1={28} y1={30} x2={28} y2={190} label={"16'-0\""} side="l" />
    {[
      [0, 5, "5'-0\""],
      [5, 6, '12"'],
      [6, 20, "14'-0\""],
      [20, 21, '12"'],
      [21, 26, "5'-0\""],
    ].map(([a, b, l], i) => (
      <Dim key={i} x1={40 + (a as number) * 18} y1={206} x2={40 + (b as number) * 18} y2={206} label={l as string} side="b" />
    ))}
    <rect x={40} y={244} width={26 * 18} height={10} fill={C.conc} stroke={C.ink} />
    {[5, 20].map((x) => (
      <rect key={x} x={40 + x * 18} y={253} width={18} height={24} fill={C.conc} stroke={C.ink} />
    ))}
    <T x={274} y={294} s={11} c={C.mute}>
      Section B-B: slab on two 12" beams with 5 ft overhangs
    </T>
  </Fig>
)

const fig4 = () => (
  <Fig w={620} h={210}>
    <SSBeam x0={30} y={95} len={420} L={36} cuts={[18]} pls={[{ at: 18, label: '80 kip' }]} dimLabels={["18'-0\"", "18'-0\""]} />
    <T x={450} y={60} a="end" c={C.load}>
      5.0 kip/ft (including self-wt.)
    </T>
    <T x={240} y={200} b>
      ALL LOADS ARE FACTORED
    </T>
    <RectSec x={520} y={40} s={3.2} b={14} h={33} rows={[{ n: 1, y: 30 }]} />
    <Dim x1={572} y1={40} x2={572} y2={40 + 30 * 3.2} label="d = 30″" />
    <Dim x1={520} y1={156} x2={565} y2={156} label="b = 14″" side="b" />
  </Fig>
)

const fig5 = () => (
  <Fig w={620} h={240}>
    <Hatch x={30} y={20} w={54} h={200} />
    <path d="M84,60 L372,60 L372,108 L84,132 Z" fill={C.conc} stroke={C.ink} />
    <Udl x1={90} x2={368} y={60} />
    <T x={300} y={30} c={C.load} s={11}>
      D.L = 2.0 k/ft, L.L = 3.0 k/ft (unfactored)
    </T>
    <path d="M36,120 L36,69 L363,69" fill="none" stroke={C.steel} strokeWidth={2.6} />
    <line x1={40} y1={73} x2={240} y2={73} stroke={C.steel} strokeWidth={2.6} strokeDasharray="7 3" />
    <T x={160} y={92} s={11}>
      3 No. 9 (centre bar to be cut)
    </T>
    <Dim x1={30} y1={150} x2={36} y2={150} label={'2" clear'} side="b" />
    <Dim x1={30} y1={200} x2={84} y2={200} label={'18"'} side="b" />
    <Dim x1={84} y1={170} x2={372} y2={170} label={'96" = 8\'-0"'} side="b" />
    <Dim x1={390} y1={60} x2={390} y2={132} label={'24"'} />
    <Dim x1={420} y1={60} x2={420} y2={108} label={'16"'} />
    <T x={340} y={124} s={11}>3" clear</T>
    <RectSec x={500} y={60} s={3} b={12} h={24} rows={[{ n: 3, y: 3 }]} edge={2.2} />
    <Dim x1={545} y1={69} x2={545} y2={60 + 72} label={'21"'} />
    <Dim x1={500} y1={148} x2={536} y2={148} label={'12"'} side="b" />
  </Fig>
)

// ================================================================ numerical data
const q1a = lazy(() => {
  const L = beamLoads({ span: 26, support: 'ss', b: 12, h: 30, sdl: 1.2, ll: 1.0 })
  const D = designAs(L.Mu, 12, 27.5, 3000, 40000)
  const usdBars = pickSingly(D.As, 12)
  const M = ((1.2 + L.sw + 1.0) * 26 ** 2) / 8
  const W = wsdDesign(M, 12, 9, 1.35, 18, 27.5)
  return { L, D, usdBars, M, W, wsdBars: pickSingly(W.As, 12) }
})
const q2a = lazy(() => {
  const ld = floorLoads({ hf: 4, spacing: 10, bw: 12, h: 28, sdl: 90, ll: 100 })
  const Mu = (ld.wu * 30 ** 2) / 8
  const bf = effectiveWidth({ kind: 'interior', L: 30, bw: 12, hf: 4, cc: 120 })
  const inp: TDesignIn = { Mu, beff: bf.b, bw: 12, hf: 4, d: 24, fc: 4, fy: 60 }
  const r = designT(inp)
  return { ld, Mu, bf, inp, r, bars: pickD(r.As, 12, [8, 9, 10], 1) }
})
const s3a = lazy(() => cantSlab({ span: 14, support: 12, cantL: 5, cantR: 5, ll: 100, dlTotal: 180, fc: 3000, fy: 60000 }))
const p4a: DoublyDesignIn = { b: 24, d: 15, dt: 15, dp: 3, fc: 4, fy: 60, Mu: 550 }
const d4a = lazy(() => designDoubly(p4a))
const bm4b: ShearBeam = { kind: 'ss', L: 36, wD: 5.0, P: [{ x: 18, P: 80 }], factored: true }
const sec4b: ShearSection = { bw: 14, d: 30, fc: 3000, fy: 60000 }
const q5in: ElasticInput = { b: 12, h: 20, d: 17.5, As: Asof(3, 8), fc: 4000, frPsi: 400, EcPsi: 2.9e6 }
const q5 = lazy(() => {
  const e = elasticAt(q5in, 20)
  const al = allowableMoment(q5in, 1.8, 24)
  const rv = review({ b: 12, h: 20, fc: 4000, fy: 60000, layers: [{ As: Asof(3, 8), d: 17.5 }] })
  return { e, al, rv }
})
const p6c: DoublyReviewIn = { b: 10, d: 21, dt: 22, dp: 2.5, As: Asof(6, 9), Asp: Asof(2, 8), fc: 5, fy: 60 }
const r6c = lazy(() => reviewDoubly(p6c))
const q7b = lazy(() => {
  const cases = [
    { key: 'a', label: '(a) no web reinforcement: Vu ≤ ½φVc', bwd: bwdRequired(45, 4000) },
    { key: 'b', label: '(b) minimum web reinforcement: Vu ≤ φVc', bwd: bwdRequired(45, 4000, { withMin: true }) },
    // (c) Vs = 2Vc → Vn = 3Vc: Vu ≤ φ·3·2√f'c·bw·d
    { key: 'c', label: '(c) Vs = 2Vc: Vu ≤ 3φVc', bwd: bwdRequired(45, 4000, { withMin: true }) / 3 },
  ]
  return cases.map((c) => {
    const b = Math.sqrt(c.bwd / 2) // d = 2b → 2b² = bwd
    const bUse = Math.ceil(b)
    return { ...c, b, d: 2 * b, bUse, dUse: 2 * bUse, h: 2 * bUse + 2.5 }
  })
})
// Q8(b): tapered cantilever, 8 ft from the column face, h = 24 in → 16 in, d = h − 3
const b9 = bar('#9')
const q8 = lazy(() => {
  const wu = 1.2 * 2 + 1.6 * 3
  const g = beamBarGeometry({ b: 12, cover: 1.5, ds: 0.375, db: b9.db, n: 3, faceCenter: 3 })
  const sc = simplifiedCase({ db: b9.db, clearSpacing: g.clearSpacing, clearCover: g.clearCover, stirrupsMin: true })
  const ldBeam = ldSimplified({ db: b9.db, small: false, fc: 3000, fy: 60000, met: sc.met, psiT: 1.3 })
  const availBeam = 96 - 3
  const ldCol = ldSimplified({ db: b9.db, small: false, fc: 4000, fy: 60000, met: sc.met, psiT: 1.3 })
  const ldh = ldhCalc({ db: b9.db, fc: 4000, fy: 60000 })
  const hfC = hookFactors({ no: 9, sideCover: 2.5, tailCover: 2 })
  const ldhC = ldhCalc({ db: b9.db, fc: 4000, fy: 60000, psiC: hfC.psiC })
  const hook = hookGeometry(9, b9.db, 90)
  // (iii) cut-off: Mu(x) = wu(8 − x)²/2 vs φMn of 2 bars with d(x) = 21 − x (x in ft from the face, d in in)
  const dAt = (x: number) => 21 - x
  const Mu = (x: number) => (wu * (8 - x) ** 2) / 2
  const cap2 = (x: number) => phiMnRect(2 * b9.Ab, 12, dAt(x), 3000, 60000).phiMn
  const all3 = phiMnRect(3 * b9.Ab, 12, 21, 3000, 60000)
  let lo = 0
  let hi = 8
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2
    if (Mu(m) > cap2(m)) lo = m
    else hi = m
  }
  const xTheo = Mu(0) <= cap2(0) ? 0 : (lo + hi) / 2
  const ext = Math.max(dAt(xTheo), 12 * b9.db)
  const xExt = xTheo + ext / 12
  const xCut = Math.max(xExt, ldBeam.final / 12)
  const availCont = availBeam - xTheo * 12
  return { wu, g, sc, ldBeam, availBeam, ldCol, ldh, ldhC, hfC, hook, Mu0: Mu(0), all3, cap2At: cap2(xTheo), xTheo, ext, xExt, xCut, availCont, dTheo: dAt(xTheo) }
})

// ================================================================ questions
const P = '2008-09' as const
const PG = { s1: [84], s2: [85], s3: [86], fig: [87] }

export const R2008: RcQ[] = [
  {
    id: 'rc-2008-09-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 28,
    topics: ['rc-singly', 'rc-elastic'],
    title: 'Same 26 ft beam (12 × 30 in, Grade 40) designed by USD and by WSD',
    pages: [...PG.s1, ...PG.fig],
    text: `A rectangular beam with its cross-section is shown in Fig. 1. For service dead loads $W_{DL}$ = 1.2 kip/ft (excluding self-weight of beam) and live loads $W_{LL}$ = 1.0 kip/ft, design the beam for flexure using both USD and WSD methods. Given: $f'_c$ = 3 ksi; $f_y$ = 40 ksi; $f_s$ = 18 ksi and n = 9.

Fig. 1: simple span 26′-0″; section 12″ × 30″.`,
    given: [],
    figure: fig1,
    flag: 'WSD design + load factors not printed (1.2D + 1.6L used)',
    notes: ['d = 30 − 2.5 = 27.5 in. WSD fc,allow = 0.45f′c = 1.35 ksi (not printed).'],
    checks: () => [
      { key: 'mu', label: 'USD: Mu', value: q1a().L.Mu, unit: 'k-ft' },
      { key: 'asu', label: 'USD: As required', value: q1a().D.As, unit: 'in²' },
      { key: 'm', label: 'WSD: service moment M', value: q1a().M, unit: 'k-ft' },
      { key: 'asw', label: 'WSD: As required', value: q1a().W.As, unit: 'in²' },
    ],
    solution: () => {
      const Q = q1a()
      return (
        <Sol>
          <SH>(i) USD</SH>
          <StepList steps={[...Q.L.steps, ...Q.D.steps]} />
          <Md>{`USD: As = ${f(Q.D.As)} in² → **${Q.usdBars.n} No. ${Q.usdBars.bar}**.`}</Md>
          <SH>(ii) WSD</SH>
          <StepList steps={[{ t: 'Service moment', tex: `M = \\frac{(1.2 + ${f(Q.L.sw)} + 1.0)(26)^2}{8} = ${f(Q.M, 1)}\\text{ k-ft}` }, ...Q.W.steps]} />
          <Final>{`USD: **As = ${f(Q.D.As)} in²** (${Q.usdBars.n} No. ${Q.usdBars.bar}); WSD: d required ${f(Q.W.dReq, 1)} in ≤ 27.5 in ✓, **As = ${f(Q.W.As)} in²** (${Q.wsdBars.n} No. ${Q.wsdBars.bar}). WSD needs about ${f((Q.W.As / Q.D.As - 1) * 100, 0)} % more steel here because fs = 18 ksi is only 45 % of fy.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Why load factors differ for dead and live load',
    pages: PG.s1,
    theory: true,
    text: 'Why load factors are different for dead and live load? Explain.',
    given: [],
    solution: ans(A_LF),
  },
  {
    id: 'rc-2008-09-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 25,
    topics: ['rc-tbeam'],
    title: 'Interior T-beam: 4 in slab, beams 10 ft c/c, 30 ft simple span',
    pages: [...PG.s1, ...PG.fig],
    text: `A floor slab 4 in. thick is supported by RC beams, 10 ft centre to centre, which together with slab act as T-beams. The web of the beams is 12″ × 24″ as shown in Fig. 2. The beams are simply supported and their span is 30 ft. Assume effective depth of beam 24″. The slab supports a service live load of 100 psf and a superimposed dead load (for floor finish and partition wall) of 90 psf in addition to its self weight. Using $f'_c$ = 4 ksi and $f_y$ = 60 ksi, design a typical interior beam for flexure only by USD method.`,
    given: [],
    figure: fig2,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['The web projects 24 in below the 4 in slab (h = 28 in) and d = 24 in is given; the web self-weight uses the 24 in below the slab.'],
    checks: () => [
      { key: 'wu', label: 'Factored load on the beam', value: q2a().ld.wu, unit: 'k/ft' },
      { key: 'beff', label: 'Effective flange width', value: q2a().bf.b, unit: 'in' },
      { key: 'as', label: 'Required As', value: q2a().r.As, unit: 'in²' },
    ],
    solution: () => {
      const Q = q2a()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Loads per beam (10 ft strip)', tex: `\\text{slab } ${f(Q.ld.slab)} + \\text{web } ${f(Q.ld.web)} + \\text{SDL } ${f(Q.ld.sdl)} = D = ${f(Q.ld.wD)}\\text{ k/ft};\\ L = ${f(Q.ld.wL)}\\text{ k/ft};\\ w_u = ${f(Q.ld.wu)}\\text{ k/ft}` },
              { t: 'Moment', tex: `M_u = \\frac{w_uL^2}{8} = \\frac{${f(Q.ld.wu)}(30)^2}{8} = ${f(Q.Mu, 1)}\\text{ k-ft}` },
            ]}
          />
          <StepList steps={tDesignSteps(Q.inp, Q.r, Q.bf)} start={3} />
          <Final>{`As = ${f(Q.r.As)} in² → **${Q.bars.n} No. ${Q.bars.no}** (${Q.r.rect ? 'stress block within the flange: rectangular beam of width beff' : 'true T'}).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 10,
    topics: ['rc-singly'],
    title: 'φ from εt: justification and variation',
    pages: PG.s1,
    theory: true,
    text: 'What is the justification of selecting strength reduction factor φ based on net tensile strain εt? Discuss the variation of φ with εt as given in ACI code.',
    given: [],
    solution: ans(A_PHI_ET, PhiChart),
  },
  {
    id: 'rc-2008-09-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 22,
    topics: ['rc-oneway'],
    title: 'One-way slab on two beams with 5 ft overhangs both sides (LL patterns)',
    pages: [...PG.s1, ...PG.fig],
    text: `A one-way slab is supported on RC beams as shown in Fig. 3. The calculated dead load on the slab is 180 psf (total) and the slab is subjected to a working live load of 100 psf. The live load can occupy any portion or any position on the slab. Calculate the critical moments and design the slab using USD method and sketch the reinforcements. Use $f'_c$ = 3 ksi and $f_y$ = 60 ksi.

Fig. 3: slab 16′-0″ long; 5′-0″ overhang | 12″ beam | 14′-0″ | 12″ beam | 5′-0″ overhang; all edges free except at the beams.`,
    given: [],
    figure: fig3,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['DL 180 psf is the total (self-weight included); h is chosen only for depth (cantilever l/10 governs).'],
    checks: () => [
      { key: 'h', label: 'Slab thickness h', value: s3a().h, unit: 'in' },
      { key: 'mneg', label: 'Negative moment at the beam face', value: s3a().Mneg, unit: 'k-ft/ft' },
      { key: 'mpos', label: 'Maximum positive moment (LL on span only)', value: s3a().Mpos, unit: 'k-ft/ft' },
    ],
    solution: () => <CantSlabSol r={s3a()} />,
  },
  {
    id: 'rc-2008-09-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Factors influencing development length',
    pages: PG.s1,
    theory: true,
    text: 'Discuss briefly the factors that influence development length of a reinforcing bar.',
    given: [],
    solution: ans(A_LD),
  },
  {
    id: 'rc-2008-09-3c',
    paper: P,
    sec: 'A',
    no: '3(c)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'What "serviceability" means',
    pages: PG.s1,
    theory: true,
    text: 'What do you understand by the term "serviceability" in reinforced concrete design?',
    given: [],
    solution: ans(A_SERV),
  },
  {
    id: 'rc-2008-09-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Wide shallow beam 24 × 18 in, Mu = 550 k-ft (compression steel)',
    pages: PG.s1,
    text: `A rectangular concrete beam of width b = 24″ is limited by architectural considerations to a maximum total depth h = 18″. The beam must carry a total factored (ultimate) load moment $M_u$ = 550 kip-ft. Design the flexural reinforcement for the beam using compression steel if necessary. Assume single layer reinforcement and d = 15″ and d′ = 3″. Use $f'_c$ = 4 ksi and $f_y$ = 60 ksi.`,
    given: [],
    checks: () => [
      { key: 'pm1', label: 'φMn of the largest singly reinforced section', value: d4a().sm.phiMn1, unit: 'k-ft' },
      { key: 'asp', label: "A′s required", value: d4a().Asp, unit: 'in²' },
      { key: 'as', label: 'As required', value: d4a().As, unit: 'in²' },
    ],
    solution: () => {
      const dd = d4a()
      return (
        <Sol>
          <StepList steps={doublyDesignSteps(p4a, dd)} />
          {dd.comp && (
            <>
              <SH>Review of the bars chosen</SH>
              <StepList steps={doublyReviewSteps({ ...p4a, As: dd.tension.A, Asp: dd.comp.A }, dd.review)} />
            </>
          )}
          <Final>{`Tension **${dd.tension.n} No. ${dd.tension.no}**${dd.comp ? `, compression **${dd.comp.n} No. ${dd.comp.no}**` : ''}: φMn = ${f(dd.review.phiMn, 1)} k-ft ${dd.ok ? '≥ 550 ✓' : '(short)'}.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 15,
    topics: ['rc-shear'],
    title: 'Stirrups: 36 ft beam, 80 k at midspan + 5.0 k/ft (factored)',
    pages: [...PG.s1, ...PG.fig],
    text: `Using USD method, design shear reinforcement of the beam as shown in Fig. 4. The loads shown in figure are factored. Show the reinforcement details in a neat sketch. Use $f'_c$ = 3 ksi and $f_y$ = 60 ksi.

Fig. 4: simple span 18′-0″ + 18′-0″; 80 kip at midspan and 5.0 kip/ft (including self-wt.) — all loads factored. Beam section b = 14″, d = 30″.`,
    given: [],
    figure: fig4,
    checks: () => shearChecks(bm4b, sec4b),
    solution: () => <ShearSol bm={bm4b} sec={sec4b} note="All loads factored; supports treated as points. The shear never drops below 40 k (half the midspan load), so stirrups run the full length." />,
  },
  {
    id: 'rc-2008-09-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 12,
    topics: ['rc-elastic'],
    title: 'Stresses and strains at M = 20 k-ft (uncracked, n = 10)',
    pages: PG.s2,
    text: `A rectangular beam made using concrete with $f'_c$ = 4000 psi and steel with $f_y$ = 60 ksi has width b = 12″, total depth h = 20″ and effective depth d = 17.5″. Concrete modulus of rupture $f_r$ = 400 psi. The elastic modulus of the steel and concrete are, respectively, 29 × 10⁶ psi and 2.9 × 10⁶ psi. The tensile steel area $A_s$ = three No. 8 bars.

(a) Calculate the stresses and strains in concrete and steel when the above section is subjected to a moment of 20 kip-ft. Show the transformed section and distribution of your calculated stresses and strains.`,
    given: [],
    notes: ['n = 29/2.9 = 10 exactly. M = 20 k-ft is below Mcr, so the section is uncracked.'],
    checks: () => [
      { key: 'fc', label: 'Top concrete stress', value: q5().e.fc, unit: 'ksi' },
      { key: 'fct', label: 'Bottom concrete (tension) stress', value: q5().e.fct, unit: 'ksi' },
      { key: 'fs', label: 'Steel stress', value: q5().e.fs, unit: 'ksi' },
    ],
    solution: () => {
      const e = q5().e
      return (
        <Sol>
          <StepList steps={e.steps} />
          <Final>{`Uncracked (M = 20 ≤ Mcr = ${f(e.Mcr, 1)} k-ft). Top fc = ${f(e.fc * 1000, 0)} psi (εc = ${f(e.fc / 2900, 6)}); bottom ft = ${f(e.fct * 1000, 0)} psi < 400 psi; steel fs = ${f(e.fs * 1000, 0)} psi (εs = ${f(e.fs / 29000, 6)}). Transformed section: 12 × 20 concrete + (n − 1)As = 9(2.37) = ${f(9 * 2.37, 2)} in² at 17.5 in.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 12,
    topics: ['rc-elastic'],
    title: 'Maximum service moment at 0.45f′c / 0.4fy (cracked section)',
    pages: PG.s2,
    text: `(b) Find the maximum service load moment that can be resisted by the section without stressing concrete higher than $0.45f'_c$ or the steel above $0.4f_y$. (Section of 5(a): b = 12″, h = 20″, d = 17.5″, 3 No. 8, n = 10.)`,
    given: [],
    flag: 'WSD (service-stress) analysis',
    checks: () => [
      { key: 'kd', label: 'Cracked neutral axis kd', value: q5().al.kd, unit: 'in' },
      { key: 'm', label: 'Allowable service moment', value: q5().al.M, unit: 'k-ft' },
    ],
    solution: () => {
      const al = q5().al
      return (
        <Sol>
          <StepList steps={al.steps} />
          <Final>{`**M = ${f(al.M, 1)} k-ft** (${al.governs} governs: Mc = ${f(al.Mc, 1)}, Ms = ${f(al.Ms, 1)} k-ft).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 11,
    topics: ['rc-singly'],
    title: 'Mn, φMn and the ratio φMn / service moment',
    pages: PG.s2,
    text: `(c) Compute the nominal flexural strength of the beam section. Also, calculate the design strength and hence determine the ratio of flexural strength to be used for design and service load moment. (Section of 5(a).)`,
    given: [],
    checks: () => [
      { key: 'mn', label: 'Mn', value: q5().rv.Mn, unit: 'k-ft' },
      { key: 'pmn', label: 'φMn', value: q5().rv.phiMn, unit: 'k-ft' },
      { key: 'ratio', label: 'φMn / M_service', value: q5().rv.phiMn / q5().al.M },
    ],
    solution: () => {
      const { rv, al } = q5()
      return (
        <Sol>
          <StepList steps={rv.steps} />
          <Final>{`**Mn = ${f(rv.Mn, 1)} k-ft, φMn = ${f(rv.phiMn, 1)} k-ft**; φMn / M_service = ${f(rv.phiMn, 1)} / ${f(al.M, 1)} = **${f(rv.phiMn / al.M, 2)}** — the margin between working-stress capacity and design strength, of the order of an average load factor.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 8,
    topics: ['rc-tbeam'],
    title: 'ACI effective width of T- and L-beams',
    pages: PG.s2,
    theory: true,
    text: 'Write down the ACI specifications for determining the effective width of T-beams and L-beams.',
    given: [],
    solution: ans(A_BEFF),
  },
  {
    id: 'rc-2008-09-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 8,
    topics: ['rc-singly'],
    title: 'ACI minimum and maximum steel in beams, and why',
    pages: PG.s2,
    theory: true,
    text: 'What are the recommendations of ACI code regarding the minimum and maximum permissible reinforcement in beams? Explain the necessity for these.',
    given: [],
    solution: ans(A_RHOMIN + '\n\n### Maximum steel — why\nA heavily reinforced beam fails by crushing of concrete before the steel yields: suddenly, with little warning. Limiting the steel keeps the failure ductile.\n\n' + A_ET_RHOMAX),
  },
  {
    id: 'rc-2008-09-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 19,
    topics: ['rc-doubly'],
    title: 'Design capacity of a 10 in doubly reinforced beam, f′c = 5 ksi',
    pages: PG.s2,
    text: `A rectangular beam has a width of 10 inch and an effective depth to the centroid of the tension reinforcement of 21 inch. The tension reinforcement consists of six No. 9 bars in two rows. Compression reinforcement consisting of two No. 8 bars is placed 2.5 inch from the compression face of the beam. If $f_y$ = 60000 psi and $f'_c$ = 5000 psi, what is the design moment capacity of the beam? Follow any method.`,
    given: [],
    notes: ['dt not given: two rows, dt = d + 1 = 22 in. β1 = 0.80.'],
    checks: () => [
      { key: 'c', label: 'Neutral-axis depth c', value: r6c().c, unit: 'in' },
      { key: 'fsp', label: "f′s", value: r6c().fsp, unit: 'ksi' },
      { key: 'pmn', label: 'φMn', value: r6c().phiMn, unit: 'k-ft' },
    ],
    solution: () => {
      const r = r6c()
      return (
        <Sol>
          <StepList steps={doublyReviewSteps(p6c, r)} />
          <Final>{`**φMn = ${f(r.phiMn, 1)} k-ft** (Mn = ${f(r.MnFt, 1)} k-ft, φ = ${f(r.phi)}; f′s = ${f(r.fsp, 1)} ksi).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 15,
    topics: ['rc-shear'],
    title: 'Diagonally cracked beam with stirrups; derive the stirrup spacing',
    pages: PG.s2,
    theory: true,
    text: 'Explain the behaviour of a diagonally cracked beam with vertical stirrups and hence derive the expression for spacing of vertical stirrups of the beam.',
    given: [],
    solution: ans(A_TRUSS, TrussSketch),
  },
  {
    id: 'rc-2008-09-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Size b and d (d = 2b) for Vu = 45 k: no stirrups / minimum / Vs = 2Vc',
    pages: PG.s2,
    text: `A beam is to be designed for factored loads causing a maximum shear of 45.0 k, using concrete with $f'_c$ = 4000 psi, $f_y$ = 60,000 psi. Assuming that the concrete dimensions will be determined by diagonal tension, select the appropriate width and effective depth (a) for a beam in which no web reinforcement is to be used, (b) for a beam in which only the minimum web reinforcement is provided as given by $A_v = 0.75\\sqrt{f'_c}\\frac{b_ws}{f_y} \\ge 50\\frac{b_ws}{f_y}$, where the symbols have the usual meaning, (c) for a beam in which web reinforcement provides shear strength $V_s = 2V_c$. Follow ACI code requirements, and let d = 2b in each case. Calculations may be used on the more approximate value of $V_c$.`,
    given: [{ label: 'Av,min formula', what: "0.75√f′c bw s/fy ≥ 50 bw s/fy", ref: 's-cases', formula: true }],
    notes: ['Vc = 2√f′c bw d (approximate). φ = 0.75 (current ACI); the paper-era φ = 0.85 would give sections about 12 % smaller in bw·d.'],
    checks: () => q7b().map((c) => ({ key: c.key, label: `${c.label}: required bw·d`, value: c.bwd, unit: 'in²' })),
    solution: () => {
      const rows = q7b()
      return (
        <Sol>
          <Md>{`$\\phi V_c = 0.75 \\times 2\\sqrt{4000}\\,b_wd = 94.9\\,b_wd$ lb. With d = 2b, $b_wd = 2b^2$.`}</Md>
          <Tbl head={['case', 'condition', 'bw·d (in²)', 'b (in)', 'd = 2b (in)', 'use b × d']} rows={rows.map((c) => [c.key, c.label.slice(4), f(c.bwd, 1), f(c.b, 2), f(c.d, 2), `${c.bUse} × ${c.dUse}`])} />
          <Final>{rows.map((c) => `- ${c.label}: bw·d ≥ ${f(c.bwd, 0)} in² → **b = ${c.bUse} in, d = ${c.dUse} in**`).join('\n') + `\n- (c) also satisfies Vs = 2Vc = 4√f′c bw d, so s_max = d/2 still applies.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 10,
    topics: ['rc-oneway'],
    title: 'Temperature & shrinkage reinforcement in one-way slabs',
    pages: PG.s3,
    theory: true,
    text: 'Discuss Temperature and Shrinkage Reinforcement used in one-way slab.',
    given: [],
    solution: ans(A_TS),
  },
  {
    id: 'rc-2008-09-8b-i',
    paper: P,
    sec: 'B',
    no: '8(b)(i)',
    marks: 9,
    topics: ['rc-bond'],
    title: 'Tapered cantilever: can the No. 9 top bars be developed? (simplified ld)',
    pages: PG.s3,
    text: `(b) Fig. 5 shows a cantilever beam subjected to uniformly distributed load (including self wt). Tensile flexural reinforcement (uncoated) consists of three No. 9. Transverse No. 3 U stirrups with 1.5 inch cover are provided at 4 inch spacing from the face of the column. Loads are unfactored.

(i) If the flexural and shear steel of $f_y$ = 60 ksi and if the beam uses normal weight concrete having $f'_c$ = 3000 psi; check to see if proper development length can be provided for No. 9 bars. Use the simplified development length equations.

Fig. 5: cantilever 96″ (8′-0″) from the face of an 18″ column; depth 24″ at the face tapering to 16″ at the tip; support section 12″ wide, 3 No. 9 at 3″ from the top (d = 21″); bars stop 3″ clear of the tip and are hooked in the column 2″ clear of its back face; D.L = 2.0 k/ft, L.L = 3.0 k/ft (unfactored).`,
    given: [],
    figure: fig5,
    checks: () => [
      { key: 'ld', label: 'ld of the No. 9 top bars (f′c = 3000 psi)', value: q8().ldBeam.final, unit: 'in', tol: 0.03 },
      { key: 'av', label: 'Straight length available in the beam', value: q8().availBeam, unit: 'in' },
    ],
    solution: () => {
      const Q = q8()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Spacing and cover', tex: `\\text{clear spacing} = ${f(Q.g.clearSpacing, 2)}\\text{ in},\\ \\text{clear cover} = ${f(Q.g.clearCover, 2)}\\text{ in},\\ d_b = ${f(b9.db, 3)}\\text{ in}`, md: Q.sc.why },
              { t: 'Top bars (ψt = 1.3), No. 7 and larger', tex: `l_d = \\frac{f_y\\psi_t}{${Q.sc.met ? 20 : '40/3'}\\sqrt{f'_c}}d_b = \\frac{60000(1.3)}{${Q.sc.met ? 20 : '13.3'}(54.77)}(${f(b9.db, 3)}) = ${f(Q.ldBeam.final, 1)}\\text{ in}` },
              { t: 'Available', tex: `96 - 3 = ${f(Q.availBeam)}\\text{ in}\\ ${Q.ldBeam.final <= Q.availBeam ? '\\ge' : '<'}\\ l_d` },
            ]}
          />
          <Final>{`ld = **${upIn(Q.ldBeam.final)} in** ${Q.ldBeam.final <= Q.availBeam ? '≤' : '>'} 93 in available from the column face to the bar ends: the continuing bars ${Q.ldBeam.final <= Q.availBeam ? '**can** be developed in the beam ✓' : 'cannot be developed straight — hook them at the tip'}. On the column side, see (ii).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-8b-ii',
    paper: P,
    sec: 'B',
    no: '8(b)(ii)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Anchorage in the 18 in column (f′c = 4000 psi): straight or hooked',
    pages: PG.s3,
    text: `(ii) If the column material strength are $f_y$ = 60000 psi and $f'_c$ = 4000 psi, check to see if adequate embedment can be provided within the column for the No. 9 bars. If hooks are provided, specify detailed dimensions. (Fig. 5: column 18″, bars 2″ clear of the back face.)`,
    given: [],
    figure: fig5,
    checks: () => [
      { key: 'ld', label: 'Straight ld in the column (top bars)', value: q8().ldCol.final, unit: 'in', tol: 0.03 },
      { key: 'ldh', label: 'ldh of a standard 90° hook (ψc = 1.0)', value: q8().ldh.final, unit: 'in', tol: 0.03 },
    ],
    solution: () => {
      const Q = q8()
      const steps: SolStep[] = [
        { t: 'Available', tex: `18 - 2 = 16\\text{ in}` },
        { t: 'Straight', tex: `l_d = \\frac{60000(1.3)}{20\\sqrt{4000}}(${f(b9.db, 3)}) = ${f(Q.ldCol.final, 1)}\\text{ in} > 16`, md: 'Not possible straight.' },
        { t: '90° hook', tex: `l_{dh} = \\frac{60000}{50\\sqrt{4000}}(${f(b9.db, 3)}) = ${f(Q.ldh.final, 1)}\\text{ in}\\ ${Q.ldh.final <= 16 ? '\\le' : '>'}\\ 16;\\quad \\psi_c = 0.7 \\Rightarrow ${f(Q.ldhC.final, 1)}\\text{ in}\\ ${Q.ldhC.final <= 16 ? '\\le' : '>'}\\ 16` },
        { t: 'Hook details (No. 9)', tex: `D = ${Q.hook.Dk}d_b = ${f(Q.hook.D, 2)}\\text{ in (inside bend)},\\quad \\text{tail} = ${Q.hook.tailText} = ${f(Q.hook.tail, 1)}\\text{ in}` },
      ]
      return (
        <Sol>
          <StepList steps={steps} />
          <Final>{`Use standard 90° hooks: ldh = ${upIn(Q.ldhC.final)} in with side cover ≥ 2.5 in and tail cover ≥ 2 in (ψc = 0.7) — fits in 16 in ✓ (without that cover credit ${upIn(Q.ldh.final)} in would not fit). Bend diameter ${f(Q.hook.D, 1)} in (8db), vertical tail ${upIn(Q.hook.tail)} in (12db) turned down into the column.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2008-09-8b-iii',
    paper: P,
    sec: 'B',
    no: '8(b)(iii)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Cut-off point of the centre bar in the tapered cantilever',
    pages: PG.s3,
    text: `(iii) Calculate the point where the centre bar can be discontinued. (Fig. 5: 8 ft tapered cantilever, d = 21″ at the face reducing to 13″ at the tip; D.L = 2.0 k/ft, L.L = 3.0 k/ft unfactored; $f'_c$ = 3000 psi, $f_y$ = 60 ksi.)`,
    given: [],
    figure: fig5,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['d varies linearly: d(x) = 21 − x in, x in ft from the face (1 in per ft).'],
    checks: () => [
      { key: 'mu', label: 'Mu at the column face', value: q8().Mu0, unit: 'k-ft' },
      { key: 'xt', label: 'Theoretical cut-off point from the face', value: q8().xTheo, unit: 'ft' },
      { key: 'xc', label: 'Actual cut-off point from the face', value: q8().xCut, unit: 'ft' },
    ],
    solution: () => {
      const Q = q8()
      return (
        <Sol>
          <StepList
            steps={[
              { t: 'Factored load and support moment', tex: `w_u = 1.2(2) + 1.6(3) = ${f(Q.wu)}\\text{ k/ft},\\ M_u(0) = \\frac{${f(Q.wu)}(8)^2}{2} = ${f(Q.Mu0, 1)}\\text{ k-ft} \\le \\phi M_n(3\\#9) = ${f(Q.all3.phiMn, 1)}\\ \\checkmark` },
              { t: 'Capacity of 2 bars along the taper', tex: `\\phi M_n(x) = \\phi(2.0)(60)\\left(d(x) - \\frac{a}{2}\\right),\\ a = \\frac{2.0(60)}{0.85(3)(12)} = ${f((2 * 60) / (0.85 * 3 * 12), 2)}\\text{ in},\\ d(x) = 21 - x` },
              { t: 'Theoretical cut-off', tex: `\\frac{${f(Q.wu)}(8 - x)^2}{2} = \\phi M_n(x) \\Rightarrow x = ${f(Q.xTheo, 2)}\\text{ ft}\\ (d = ${f(Q.dTheo, 2)}\\text{ in},\\ \\phi M_n = ${f(Q.cap2At, 1)}\\text{ k-ft})`, md: 'Solved numerically (both sides change with x).' },
              { t: 'Extension', tex: `\\max(d,\\ 12d_b) = \\max(${f(Q.dTheo, 1)},\\ ${f(12 * b9.db, 1)}) = ${f(Q.ext, 1)}\\text{ in} \\Rightarrow ${f(Q.xExt, 2)}\\text{ ft}` },
              { t: 'Development of the cut bar from the face', tex: `l_d = ${f(Q.ldBeam.final, 1)}\\text{ in} = ${f(Q.ldBeam.final / 12, 2)}\\text{ ft}`, md: Q.xCut > Q.xExt + 1e-6 ? 'ld from the face governs over the extension rule.' : 'The extension rule governs.' },
              { t: 'Continuing bars', tex: `\\text{length beyond the theoretical point} = 93 - ${f(Q.xTheo * 12, 1)} = ${f(Q.availCont, 1)}\\text{ in}\\ ${Q.availCont >= Q.ldBeam.final ? '\\ge' : '<'}\\ l_d`, md: Q.availCont >= Q.ldBeam.final ? 'Adequate ✓' : 'Not enough: hook the two continuing bars down at the tip.' },
            ]}
          />
          <Final>{`Cut the centre bar **${f(Q.xCut, 2)} ft (${upIn(Q.xCut * 12)} in) from the column face**${Q.xCut > 7.75 ? ' — practically the whole length, so running all three bars to the tip is simpler' : ''}.`}</Final>
        </Sol>
      )
    },
  },
]
