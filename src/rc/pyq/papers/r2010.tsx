// CE 315 term final 2010-11 (held 29 Feb 2012) — PDF pp. 74–79.
// Many parts repeat 2012-13 with new numbers; Section B Q5 is WSD design.
import { Md } from '../../../components/ui'
import type { RcQ } from '../../types'
import { elasticAt, uncracked, wsdDesign, wsdDoublyDesign } from '../../engine/elastic'
import { As as Asof, modRatio } from '../../engine/materials'
import { beamLoads, designAs, pickBars as pickSingly, review } from '../../engine/singly'
import { designDoubly, pickBars as pickD, reviewDoubly, type DoublyDesignIn, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, type TDesignIn } from '../../engine/tbeam'
import type { ShearBeam, ShearSection } from '../../engine/shear'
import { oneWayCoef } from '../../engine/oneway'
import {
  A_CUTOFF,
  A_LD,
  A_PHI_ET,
  A_ET_RHOMAX,
  A_RHOMIN,
  A_STAGES,
  A_TS,
  A_UNCERT,
  ans,
  C,
  CutoffSketch,
  Dim,
  doublyDesignSteps,
  doublyReviewSteps,
  f,
  Fig,
  Final,
  FloorSec,
  Bars,
  lazy,
  LdPairSol,
  ldPairChecks,
  Lines,
  OneWaySol,
  PhiChart,
  RectSec,
  SH,
  shearChecks,
  ShearSol,
  Sol,
  SSBeam,
  StagesSketch,
  StepList,
  T,
  Tbl,
  tDesignSteps,
} from './r2012'
import { A_CRITD, A_OVER, CritSketch } from './r2011'

// ================================================================ theory first asked here
export const A_HOOPS = `Dhaka is in a **moderate seismic zone** (BNBC 2020 zone 2, Z = 0.20), so beams of moment frames are detailed at least as **intermediate moment frames** (ACI 318 §18.4; BNBC 2020 Part 6 has the same rules):

- **Hoops** (closed stirrups with 135° seismic hooks and 6db ≥ 3 in extensions) are required at **both ends** of the beam over a length **2h** from the face of the supporting column, toward midspan.
- The **first hoop** is placed within **2 in** of the column face.
- Hoop spacing within 2h: $s \\le \\min(d/4,\\ 8d_b \\text{ of the smallest longitudinal bar},\\ 24d_b \\text{ of the hoop bar},\\ 12\\text{ in})$.
- Beyond 2h: stirrups at $s \\le d/2$ along the whole length.
- Shear design: $\\phi V_n$ must cover the shear from the beam's nominal moments at both ends plus factored gravity load (or twice the earthquake shear), so the beam yields in flexure before it fails in shear.
- Related flexural rules: positive moment strength at the column face ≥ 1/3 of the negative; at every section, both positive and negative strength ≥ 1/5 of the maximum at either face.`

export const A_COLSPLICE = `Column bars are normally lap-spliced just above each floor, where they are mainly in **compression**:

- **Compression lap** (ACI 25.5.5.1): $l_{sc} = 0.0005f_yd_b$ for $f_y \\le 60{,}000$ psi; $(0.0009f_y - 24)d_b$ for higher $f_y$; never less than **12 in**. Increase by 1/3 if $f'_c < 3000$ psi.
  - Grade 60: $l_{sc} = 30d_b$ (e.g. No. 8: 30 in; No. 10: 38 in).
- **Reductions** (ACI 10.7.5.2.1): tied column whose ties over the lap have effective area ≥ $0.0015hs$ in both directions: × **0.83**; spiral column: × **0.75** — still ≥ 12 in.
- **Different bar sizes**: lap = larger of $l_{dc}$ of the larger bar and $l_{sc}$ of the smaller bar.
- **If the bars may be in tension** (moment from lateral load): bar stress ≤ 0.5fy → Class A ($1.0l_d$) when no more than half the bars are spliced at a section and the laps are staggered by $l_d$, else Class B; bar stress > 0.5fy → **Class B** ($1.3l_d$).
- Every column face must keep a tensile strength of at least $0.25f_yA_s$ of that face across the splice region; end-bearing splices need square-cut ends and enclosing ties.`

// ================================================================ figures
const secFig = (o: { b: number; h: number; s: number; rows: { n: number; y: number }[]; dLab: string; dY: number; given: string[]; topLab?: string; botLab: string; botY: number; hLab?: string; dp?: number }) => () => (
  <Fig w={470} h={Math.max(230, o.h * o.s + 60)}>
    <RectSec x={70} y={20} s={o.s} b={o.b} h={o.h} rows={o.rows} />
    <Dim x1={70 + o.b * o.s + 22} y1={20} x2={70 + o.b * o.s + 22} y2={20 + o.dY * o.s} label={o.dLab} />
    {o.hLab && <Dim x1={50} y1={20} x2={50} y2={20 + o.h * o.s} label={o.hLab} side="l" />}
    {o.dp && <Dim x1={50} y1={20} x2={50} y2={20 + o.dp * o.s} label={`${o.dp}"`} side="l" />}
    <Dim x1={70} y1={20 + o.h * o.s + 16} x2={70 + o.b * o.s} y2={20 + o.h * o.s + 16} label={`${o.b}"`} side="b" />
    {o.topLab && <T x={70 + (o.b * o.s) / 2} y={20 + 5.6 * o.s}>{o.topLab}</T>}
    <T x={70 + (o.b * o.s) / 2} y={20 + o.botY * o.s}>
      {o.botLab}
    </T>
    <Lines x={290} y={40} lines={o.given} />
  </Fig>
)

const fig1 = secFig({ b: 12, h: 28, s: 6, rows: [{ n: 3, y: 25 }], dLab: 'd = 25"', dY: 25, hLab: '28"', botLab: '3 #10', botY: 23, given: ['Given:', "f′c = 4 ksi", 'fy = 60 ksi', 'fs = 24 ksi', 'fr = 7.5√f′c psi', 'n = 8'] })
const fig3 = secFig({ b: 14, h: 31, s: 5.6, rows: [{ n: 3, y: 26.5 }, { n: 3, y: 29.5 }], dLab: 'd = 28"', dY: 28, botLab: '6 #10', botY: 24.6, given: ['Given:', "f′c = 5 ksi", 'fy = 60 ksi', 'd = 28 in.', 'dt = 29.5 in.'] })
const fig5 = secFig({ b: 12, h: 29, s: 6, rows: [{ n: 2, y: 2.5 }, { n: 3, y: 24 }, { n: 3, y: 27 }], dLab: 'd = 25"', dY: 25, dp: 2.5, topLab: '2 #9', botLab: '6 #9', botY: 22.3, given: ['Given:', "f′c = 3 ksi", 'fy = 60 ksi', 'd = 25 in.', 'dt = 26.5 in.'] })

const fig2 = () => (
  <Fig w={600} h={210}>
    <T x={230} y={30} c={C.load}>
      Service live load = 2.0 k/ft
    </T>
    <T x={230} y={46} c={C.load}>
      Unfactored superimposed DL = 1.0 k/ft (excluding self wt of beam)
    </T>
    <SSBeam x0={30} y={90} len={380} L={20} />
    <RectSec x={470} y={50} s={4.4} b={12} h={24} rows={[]} />
    <Dim x1={535} y1={50} x2={535} y2={50 + 24 * 4.4} label={'h = 24"'} />
    <Dim x1={470} y1={170} x2={470 + 12 * 4.4} y2={170} label={'12"'} side="b" />
    <T x={495} y={200} s={11} c={C.mute}>
      Section A-A
    </T>
  </Fig>
)

const fig4 = () => (
  <Fig w={540} h={230}>
    <FloorSec x={30} y={30} s={2.5} hf={3} bw={12} sp={50} hw={24} />
    <Bars n={3} x1={30 + 14 * 2.5 + 8} x2={30 + 26 * 2.5 - 8} y={30 + 22 * 2.5} r={2.6} />
    <Bars n={3} x1={30 + 14 * 2.5 + 8} x2={30 + 26 * 2.5 - 8} y={30 + 24.5 * 2.5} r={2.6} />
    <Dim x1={18} y1={30} x2={18} y2={30 + 3 * 2.5} label={'3"'} side="l" />
    <Dim x1={30 + 30 * 2.5} y1={30} x2={30 + 30 * 2.5} y2={30 + 24 * 2.5} label={'d = 24"'} />
    <Dim x1={30 + 20 * 2.5} y1={150} x2={30 + 70 * 2.5} y2={150} label={'50"'} side="b" />
    <Dim x1={30 + 70 * 2.5} y1={150} x2={30 + 120 * 2.5} y2={150} label={'50"'} side="b" />
    <T x={30 + 20 * 2.5} y={120} s={11}>
      {'bw = 12"'}
    </T>
    <Lines x={120} y={192} lines={["f′c = 3 ksi, fy = 60 ksi", 'Beam span = 30 ft,  Mu = 700 kip-ft']} />
  </Fig>
)

const fig6 = () => (
  <Fig w={600} h={200}>
    <T x={220} y={30} c={C.load}>
      W (DL + LL)
    </T>
    <SSBeam x0={30} y={80} len={380} L={20} dimLabels={["20'-0\""]} />
    <RectSec x={480} y={40} s={4.6} b={12} h={18} rows={[]} />
    <Dim x1={545} y1={40} x2={545} y2={40 + 18 * 4.6} label={'18"'} />
    <Dim x1={480} y1={135} x2={480 + 12 * 4.6} y2={135} label={'12"'} side="b" />
    <Lines x={30} y={160} s={11} step={15} lines={['WDL = 2.2 kip/ft (including self-wt.), WLL = 1.8 kip/ft', "f′c = 4 ksi, fs = 20 ksi, n = 8"]} />
  </Fig>
)

const fig7 = () => (
  <Fig w={620} h={210}>
    <SSBeam x0={30} y={95} len={420} L={35} cuts={[10, 25]} pls={[{ at: 10, label: '40 k' }, { at: 25, label: '40 k' }]} dimLabels={["10'-0\"", "15'-0\"", "10'-0\""]} />
    <T x={450} y={60} a="end" c={C.load}>
      2.0 k/ft (excluding self-wt.)
    </T>
    <T x={240} y={200} b>
      ALL LOADS ARE FACTORED
    </T>
    <RectSec x={520} y={50} s={3} b={14} h={28} rows={[{ n: 3, y: 25 }]} edge={2} />
    <Dim x1={572} y1={50} x2={572} y2={50 + 25 * 3} label={'25"'} />
    <Dim x1={520} y1={145} x2={562} y2={145} label={'14"'} side="b" />
  </Fig>
)

// ================================================================ numerical data
const s1c = { b: 12, h: 28, d: 25, As: Asof(3, 10), fc: 4000, n: 8 }
const u1c = lazy(() => uncracked(s1c))
const e1c = lazy(() => elasticAt(s1c, 100))
const p2c: DoublyDesignIn = { b: 10, d: 17.5, dt: 18.5, dp: 2.5, fc: 3, fy: 50, Mu: 200 }
const d2c = lazy(() => designDoubly(p2c))
const q3b = lazy(() => {
  const L = beamLoads({ span: 20, support: 'ss', b: 12, h: 24, sdl: 1, ll: 2 })
  const D = designAs(L.Mu, 12, 21.5, 3000, 60000)
  return { L, D, bars: pickSingly(D.As, 12) }
})
const r3c = lazy(() => review({ b: 14, fc: 5000, fy: 60000, layers: [{ As: Asof(3, 10), d: 26.5 }, { As: Asof(3, 10), d: 29.5 }] }))
const t4a = lazy(() => {
  const bf = effectiveWidth({ kind: 'interior', L: 30, bw: 12, hf: 3, cc: 50 })
  const inp: TDesignIn = { Mu: 700, beff: bf.b, bw: 12, hf: 3, d: 24, dt: 25, fc: 3, fy: 60 }
  const r = designT(inp)
  return { bf, inp, r, bars: pickD(r.As, 12, [8, 9, 10], 2) }
})
const p4b: DoublyReviewIn = { b: 12, d: 25, dt: 26.5, dp: 2.5, As: Asof(6, 9), Asp: Asof(2, 9), fc: 3, fy: 60 }
const r4b = lazy(() => reviewDoubly(p4b))
const w5a = lazy(() => {
  const M = ((2.2 + 1.8) * 20 ** 2) / 8
  return { M, r: wsdDoublyDesign(M, 12, 14.5, 2.5, 8, 1.8, 20) }
})
const w5b = lazy(() => {
  const n = Math.round(modRatio(3000))
  const fcA = 1.35
  const fsA = 20
  const b = 12
  let h = 18
  const hist: { h: number; sw: number; M: number; dReq: number }[] = []
  let M = 0
  for (let i = 0; i < 8; i++) {
    const sw = ((b * h) / 144) * 0.15
    M = ((sw + 1.2) * 18 ** 2) / 8 + (3 * 18) / 4
    const r = wsdDesign(M, b, n, fcA, fsA)
    hist.push({ h, sw, M, dReq: r.dReq })
    const hNew = Math.ceil(r.dReq + 2.5)
    if (hNew === h) break
    h = hNew
  }
  const r = wsdDesign(M, b, n, fcA, fsA, h - 2.5)
  return { n, b, h, d: h - 2.5, M, hist, r, bars: pickSingly(r.As, b) }
})
const bm6a: ShearBeam = { kind: 'ss', L: 35, wD: 2.0, P: [{ x: 10, P: 40 }, { x: 25, P: 40 }], factored: true, selfWeight: { b: 14, h: 28 } }
const sec6a: ShearSection = { bw: 14, d: 25, fc: 3500, fy: 60000 }
const s8a = lazy(() => oneWayCoef({ spans: [16, 16], ends: ['spandrel', 'spandrel'], ll: 120, fc: 3000, fy: 60000 }))

// ================================================================ questions
const P = '2010-11' as const
const PG = { s1: [74], s2: [75], s3: [76], f1: [77], f2: [78], f3: [79] }

export const R2010: RcQ[] = [
  {
    id: 'rc-2010-11-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 9,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Flexural behaviour under increasing load: uncracked, cracked, ultimate',
    pages: PG.s1,
    theory: true,
    text: 'Discuss the behaviour of reinforced concrete rectangular beam in flexure under increasing load by drawing neat sketches for strain and stress distribution of uncracked, cracked and ultimate conditions.',
    given: [],
    solution: ans(A_STAGES, StagesSketch),
  },
  {
    id: 'rc-2010-11-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 6,
    topics: ['rc-singly'],
    title: 'Under- vs over-reinforced: difference and which is preferable',
    pages: PG.s1,
    theory: true,
    text: 'What is the difference between under-reinforced and over-reinforced beam? Which one is preferable and why?',
    given: [],
    solution: ans(A_OVER),
  },
  {
    id: 'rc-2010-11-1c-i',
    paper: P,
    sec: 'A',
    no: '1(c)(i)',
    marks: 10,
    topics: ['rc-elastic'],
    title: 'Cracking moment of a 12 × 28 in section (3 No. 10)',
    pages: [...PG.s1, ...PG.f1],
    text: `A singly reinforced RC beam section, as shown in Fig. 1, has a width of 12 in., effective depth of 25 in. and total depth of 28 in. The tension reinforcement consists of three No. 10 bars in one row.

Given: $f'_c = 4$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $f_r = 7.5\\sqrt{f'_c}$ psi, $n = 8$.

Find: (i) Cracking moment.`,
    given: [],
    figure: fig1,
    notes: ['Gross or uncracked transformed section is not specified: both are worked.'],
    checks: () => [
      { key: 'mcrg', label: 'Mcr from the gross section', value: u1c().McrG, unit: 'k-ft' },
      { key: 'mcr', label: 'Mcr from the uncracked transformed section', value: u1c().Mcr, unit: 'k-ft' },
    ],
    solution: () => {
      const u = u1c()
      return (
        <Sol>
          <StepList steps={[{ t: 'Gross section', tex: `I_g = \\frac{12(28)^3}{12} = ${f(u.Ig, 0)}\\text{ in}^4,\\ y_t = 14\\text{ in},\\ M_{cr} = \\frac{${f(u.fr, 0)}\\times${f(u.Ig, 0)}}{14} = ${f(u.McrG, 1)}\\text{ k-ft}` }, ...u.steps]} />
          <Final>{`Mcr = **${f(u.McrG, 1)} k-ft** (gross) or **${f(u.Mcr, 1)} k-ft** (uncracked transformed).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-1c-ii',
    paper: P,
    sec: 'A',
    no: '1(c)(ii)',
    marks: 10,
    topics: ['rc-elastic'],
    title: 'Service stresses fc and fs at M = 100 k-ft (cracked section)',
    pages: [...PG.s1, ...PG.f1],
    text: `For the beam section of Fig. 1 (b = 12 in., d = 25 in., h = 28 in., three No. 10 bars; $f'_c = 4$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $f_r = 7.5\\sqrt{f'_c}$ psi, $n = 8$):

Find: (ii) Stresses in concrete and steel caused by a bending moment $M = 100$ kip-ft.`,
    given: [],
    figure: fig1,
    checks: () => [
      { key: 'kd', label: 'Neutral-axis depth kd', value: e1c().na, unit: 'in' },
      { key: 'fc', label: 'Concrete stress fc', value: e1c().fc, unit: 'ksi' },
      { key: 'fs', label: 'Steel stress fs', value: e1c().fs, unit: 'ksi' },
    ],
    solution: () => {
      const e = e1c()
      return (
        <Sol>
          <StepList steps={e.steps} />
          <Final>{`**fc = ${f(e.fc, 3)} ksi** (≤ 1.8 ksi), **fs = ${f(e.fs, 2)} ksi** (${e.fs <= 24 ? '≤' : '>'} 24 ksi).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Purpose of minimum flexural steel; ACI ρmin',
    pages: PG.s1,
    theory: true,
    text: 'What is the purpose of providing minimum amount of flexural steel in a beam? Write ACI code provisions for minimum reinforcement ratios.',
    given: [],
    solution: ans(A_RHOMIN),
  },
  {
    id: 'rc-2010-11-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 10,
    topics: ['rc-singly'],
    title: 'φ from εt: justification, variation, and the ρmax limit',
    pages: PG.s1,
    theory: true,
    text: 'What is the justification of selecting strength reduction factor φ based on net tensile strain εt? Discuss the variation of φ with εt as given in ACI code. Also explain how εt controls maximum reinforcement ratio.',
    given: [],
    solution: ans(A_PHI_ET + '\n\n' + A_ET_RHOMAX, PhiChart),
  },
  {
    id: 'rc-2010-11-2c',
    paper: P,
    sec: 'A',
    no: '2(c)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Design As (and A′s) for Mu = 200 k-ft, 10 × 21 in, fy = 50 ksi',
    pages: PG.s1,
    text: `A beam section is limited to a width b = 10 in. and total depth h = 21 in. and has to resist a factored moment $M_u$ of 200 kip-ft. Calculate the required reinforcements. Given: $f'_c = 3$ ksi, and $f_y = 50$ ksi.`,
    given: [],
    notes: ['d, d′ not given: two layers of tension steel assumed, d = h − 3.5 = 17.5 in, dt = 18.5 in, d′ = 2.5 in.'],
    checks: () => [
      { key: 'pm1', label: 'φMn of the largest singly reinforced section', value: d2c().sm.phiMn1, unit: 'k-ft' },
      { key: 'asp', label: "A′s required", value: d2c().Asp, unit: 'in²' },
      { key: 'as', label: 'As required', value: d2c().As, unit: 'in²' },
    ],
    solution: () => {
      const dd = d2c()
      return (
        <Sol>
          <StepList steps={doublyDesignSteps(p2c, dd)} />
          {dd.comp && (
            <>
              <SH>Review of the bars chosen</SH>
              <StepList steps={doublyReviewSteps({ ...p2c, As: dd.tension.A, Asp: dd.comp.A }, dd.review)} />
            </>
          )}
          <Final>{`Tension **${dd.tension.n} No. ${dd.tension.no}**${dd.comp ? `, compression **${dd.comp.n} No. ${dd.comp.no}**` : ''}: φMn = ${f(dd.review.phiMn, 1)} k-ft ${dd.ok ? '≥ 200 k-ft ✓' : '(short)'}.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 9,
    topics: ['rc-basics'],
    title: 'Sources of uncertainty and how USD ensures safety',
    pages: PG.s1,
    theory: true,
    text: 'What are the sources of uncertainties in analysis, design and construction of RC structures? Discuss how safety is ensured against these uncertainties in USD method.',
    given: [],
    solution: ans(A_UNCERT),
  },
  {
    id: 'rc-2010-11-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 14,
    topics: ['rc-singly'],
    title: 'Flexural design of a 20 ft simple beam, section fixed at 12 × 24 in',
    pages: [...PG.s1, ...PG.f1],
    text: `A rectangular beam carries a service live load (unfactored) of 2.0 kip/ft and an unfactored superimposed dead load of 1.0 kip/ft (in addition to self weight of beam) on a 20 ft simple span as shown in Fig. 2. The beam will have a cross-section of 12″ × 24″ for architectural reasons. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi. Design the beam for flexure using USD method.`,
    given: [],
    figure: fig2,
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['d = h − 2.5 = 21.5 in (one layer).'],
    checks: () => [
      { key: 'mu', label: 'Mu at midspan', value: q3b().L.Mu, unit: 'k-ft' },
      { key: 'as', label: 'Required As', value: q3b().D.As, unit: 'in²' },
    ],
    solution: () => {
      const { L, D, bars } = q3b()
      return (
        <Sol>
          <StepList steps={[...L.steps, ...D.steps]} />
          <Final>{`As = ${f(D.As)} in² → **${bars.n} No. ${bars.bar}** (${f(bars.As, 2)} in²). εt = ${f(D.epsT, 4)} ✓.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-3c',
    paper: P,
    sec: 'A',
    no: '3(c)',
    marks: 12,
    topics: ['rc-singly'],
    title: 'Mn and φMn: 14 in beam, 6 No. 10 in two rows, f′c = 5 ksi',
    pages: [...PG.s2, ...PG.f1],
    text: `A rectangular beam has width 14 in. and effective depth 28 in. as shown in Fig. 3. It is reinforced with six No. 10 bars in two rows (d = 28″, $d_t$ = 29.5″). If $f_y = 60{,}000$ psi and $f'_c = 5{,}000$ psi, what is the nominal flexure strength $M_n$ and what is the maximum moment $\\phi M_n$ that can be utilized in the design?`,
    given: [],
    figure: fig3,
    checks: () => [
      { key: 'a', label: 'a', value: r3c().a, unit: 'in' },
      { key: 'mn', label: 'Mn', value: r3c().Mn, unit: 'k-ft' },
      { key: 'pmn', label: 'φMn', value: r3c().phiMn, unit: 'k-ft' },
    ],
    solution: () => {
      const r = r3c()
      return (
        <Sol>
          <StepList steps={r.steps} />
          <Final>{`β1 = 0.80; **Mn = ${f(r.Mn, 1)} k-ft**, εt = ${f(r.epsT, 4)} → φ = ${f(r.phi)}, **φMn = ${f(r.phiMn, 1)} k-ft**.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 20,
    topics: ['rc-tbeam'],
    title: 'T-beam As at midspan for Mu = 700 k-ft (3 in slab, beams at 50 in)',
    pages: [...PG.s2, ...PG.f2],
    text: `A floor system consists of a 3 in slab supported by continuous T-beams with 30 ft span, 50 in on centres as shown in Fig. 4. Web dimensions as determined by negative moment requirement at the support are, $b_w$ = 12 in. and d = 24 in. What tensile area is required at midspan to resist a factored moment $M_u$ of 700 kip-ft, if $f_y = 60$ ksi and $f'_c = 3$ ksi?`,
    given: [],
    figure: fig4,
    notes: ['Two rows of bars drawn: dt = d + 1 = 25 in.'],
    checks: () => [
      { key: 'beff', label: 'Effective flange width', value: t4a().bf.b, unit: 'in' },
      { key: 'as', label: 'Required As', value: t4a().r.As, unit: 'in²' },
    ],
    solution: () => {
      const { bf, inp, r, bars } = t4a()
      return (
        <Sol>
          <StepList steps={tDesignSteps(inp, r, bf)} />
          <Final>{`As = ${f(r.As)} in² → **${bars.n} No. ${bars.no}** (${bars.layers} layers).`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 15,
    topics: ['rc-doubly'],
    title: 'φMn of a doubly reinforced beam (6 No. 9 / 2 No. 9); does A′s yield?',
    pages: [...PG.s2, ...PG.f2],
    text: `A rectangular RC beam as shown in Fig. 5 measures 12 in wide and has an effective depth of 25 in. Tension steel consists of six No. 9 bars in two layers (d = 25 in, $d_t$ = 26.5 in) and compression steel consisting of two No. 9 bars is located 2.5 in from the compression face. If $f'_c = 3$ ksi and $f_y = 60$ ksi, what is the design moment capacity of the beam according to ACI code. Check for yielding of compression steel. Use USD method of design.`,
    given: [],
    figure: fig5,
    checks: () => [
      { key: 'c', label: 'Neutral-axis depth c', value: r4b().c, unit: 'in' },
      { key: 'fsp', label: "f′s", value: r4b().fsp, unit: 'ksi' },
      { key: 'pmn', label: 'φMn', value: r4b().phiMn, unit: 'k-ft' },
    ],
    solution: () => {
      const r = r4b()
      return (
        <Sol>
          <StepList steps={doublyReviewSteps(p4b, r)} />
          <Final>{`A′s ${r.compYields ? 'yields' : `does not yield (f′s = ${f(r.fsp, 1)} ksi)`}; **φMn = ${f(r.phiMn, 1)} k-ft**.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 20,
    topics: ['rc-elastic', 'rc-doubly'],
    title: 'WSD design of a 12 × 18 in beam, 20 ft span (needs compression steel)',
    pages: [...PG.s2, ...PG.f3],
    text: `A simply supported rectangular beam with a span of 20 ft is limited by architectural considerations to a width of 12″ and a total depth of 18″ as shown in Fig. 6. The beam carries a service DL = 2.2 kip/ft (including self wt of beam) and LL = 1.8 kip/ft. Given $f_s$ = 20 ksi; $f'_c$ = 4 ksi and n = 8. What reinforcement is required for flexural design by WSD method?`,
    given: [],
    figure: fig6,
    flag: 'WSD design (older method, outside the current slides)',
    notes: ['fc,allow = 0.45f′c = 1.8 ksi (not printed). Heavy steel: two layers, d = 18 − 3.5 = 14.5 in; d′ = 2.5 in.', 'Compression steel stress by the ACI alternate method: f′s = 2n·fc(kd − d′)/kd ≤ fs.'],
    checks: () => [
      { key: 'm', label: 'Service moment M', value: w5a().M, unit: 'k-ft' },
      { key: 'm1', label: 'Balanced capacity M1 = Rbd²', value: w5a().r.M1, unit: 'k-ft' },
      { key: 'asp', label: "A′s", value: w5a().r.Asp, unit: 'in²' },
      { key: 'as', label: 'As', value: w5a().r.As, unit: 'in²' },
    ],
    solution: () => {
      const { M, r } = w5a()
      return (
        <Sol>
          <StepList steps={[{ t: 'Service moment', tex: `M = \\frac{(2.2 + 1.8)(20)^2}{8} = ${f(M, 1)}\\text{ k-ft}` }, ...r.steps]} />
          <Final>{`M1 = ${f(r.M1, 1)} k-ft < M = ${f(M, 1)} k-ft, so compression steel is needed: **A′s = ${f(r.Asp, 2)} in²**, **As = ${f(r.As, 2)} in²** (two layers). A singly reinforced 12 × 18 section is far too small for this load by WSD.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 15,
    topics: ['rc-elastic'],
    title: 'WSD: size the section and steel for an 18 ft beam (UDL LL + point DL)',
    pages: PG.s2,
    text: `A simply supported rectangular beam with a span of 18 ft supports a uniform live load of 1200 plf and a concentrated dead load of 3000 lb at the middle of the span in addition to its self-wt. With $f'_c = 3000$ psi and $f_s = 20{,}000$ psi, determine the required cross-section and steel area.`,
    given: [],
    flag: 'WSD design (older method, outside the current slides)',
    notes: ['n = Es/Ec = 9.29 → 9; fc,allow = 0.45f′c = 1350 psi (not printed); b = 12 in chosen; self-weight iterated.'],
    checks: () => [
      { key: 'm', label: 'Service moment M (final self-weight)', value: w5b().M, unit: 'k-ft', tol: 0.03 },
      { key: 'd', label: 'Required d (b = 12 in)', value: w5b().hist[w5b().hist.length - 1].dReq, unit: 'in', tol: 0.03 },
      { key: 'as', label: 'As', value: w5b().r.As, unit: 'in²', tol: 0.04 },
    ],
    solution: () => {
      const W = w5b()
      return (
        <Sol>
          <Md>{`n = ${W.n}, fc = 1.35 ksi, fs = 20 ksi; b = ${W.b} in. $M = \\frac{(w_{sw} + 1.2)(18)^2}{8} + \\frac{3(18)}{4}$, iterating the self-weight:`}</Md>
          <Tbl head={['trial h (in)', 'self-wt (k/ft)', 'M (k-ft)', 'd req (in)']} rows={W.hist.map((x) => [f(x.h), f(x.sw), f(x.M, 2), f(x.dReq, 2)])} />
          <StepList steps={W.r.steps} />
          <Final>{`Section **${W.b} × ${W.h} in** (d = ${f(W.d)} in), **As = ${f(W.r.As, 2)} in²** → ${W.bars.n} No. ${W.bars.bar}.`}</Final>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2010-11-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 22,
    topics: ['rc-shear'],
    title: 'Stirrups in 3 sets: 35 ft beam, two 40 k loads + 2.0 k/ft (factored)',
    pages: [...PG.s2, ...PG.f3],
    text: `Design the stirrups for the beam shown in Fig. 7. Use $f'_c$ = 3.5 ksi; $f_y$ = 60 ksi. Calculate stirrups with 3 sets of spacing. Show the stirrups in a neat sketch.

Fig. 7: simple span 10′ + 15′ + 10′ = 35′; 40 k at 10 ft from each support and 2.0 k/ft (excluding self-wt.) — all loads factored. Section b = 14″, d = 25″.`,
    given: [],
    figure: fig7,
    notes: ['The UDL excludes self-weight: a 14 × 28 in section (h = d + 3) is assumed and its weight factored by 1.2.', 'Printed marks for Q6 add to 40 (22 + 9 + 9), probably a misprint.'],
    checks: () => shearChecks(bm6a, sec6a),
    solution: () => <ShearSol bm={bm6a} sec={sec6a} note="Factored self-weight 1.2 × (14 × 28/144)(0.150) added to the 2.0 k/ft. Supports treated as points." />,
  },
  {
    id: 'rc-2010-11-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 9,
    topics: ['rc-shear'],
    title: 'ACI/BNBC hoop requirements for beams in Dhaka (moderate seismic risk)',
    pages: PG.s2,
    theory: true,
    text: 'Write down the ACI/BNBC code provisions for beam stirrups (hoops) for Dhaka-moderate seismic risk region.',
    given: [],
    flag: 'Seismic detailing — not on the CE 315 slides',
    solution: ans(A_HOOPS),
  },
  {
    id: 'rc-2010-11-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 9,
    topics: ['rc-shear'],
    title: 'Sketches: location of the critical section for shear',
    pages: PG.s2,
    theory: true,
    text: 'Show with neat sketches location of critical section for shear design for different conditions of beam supports.',
    given: [],
    solution: ans(A_CRITD, CritSketch),
  },
  {
    id: 'rc-2010-11-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'Cut-off and bend points for approximately equal spans (sketch)',
    pages: PG.s3,
    theory: true,
    text: 'Show with neat sketches cut off or bend points for bars in approximately equal spans with uniformly distributed loads.',
    given: [],
    solution: ans(A_CUTOFF, CutoffSketch),
  },
  {
    id: 'rc-2010-11-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'Factors influencing development length',
    pages: PG.s3,
    theory: true,
    text: 'Discuss briefly the factors that influence development length of a reinforcing bar.',
    given: [],
    solution: ans(A_LD),
  },
  {
    id: 'rc-2010-11-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 5,
    topics: ['rc-bond'],
    title: 'Minimum lap length for column splices',
    pages: PG.s3,
    theory: true,
    text: 'What is the minimum length of lap for column splices as per ACI/BNBC code?',
    given: [],
    solution: ans(A_COLSPLICE),
  },
  {
    id: 'rc-2010-11-7d',
    paper: P,
    sec: 'B',
    no: '7(d)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'ld of 16 mm and 25 mm bars, top bars and other bars',
    pages: PG.s3,
    text: `Calculate the development length by USD method for 16 mm and 25 mm bars when used as (i) top bars, (ii) for other bars. Given: $f'_c = 3500$ psi and $f_y = 60{,}000$ psi.`,
    given: [],
    notes: ['Identical to 2012-13 Q7(d). Favourable spacing/cover case assumed; uncoated bars.'],
    checks: () => ldPairChecks(['16mm', '25mm'], 3500, 60000),
    solution: () => <LdPairSol ids={['16mm', '25mm']} fc={3500} fy={60000} />,
  },
  {
    id: 'rc-2010-11-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 25,
    topics: ['rc-oneway'],
    title: 'Two-span one-way slab (16 ft clear spans, LL 120 psf) by ACI coefficients',
    pages: PG.s3,
    text: `A reinforced concrete one-way slab is built integrally with its supports and consists of two equal spans, each with a clear span of 16 ft. The service live load on the slab is 120 psf. Design the slab by USD and show the reinforcements with neat sketches. Given: $f'_c$ = 3000 psi and $f_y$ = 60,000 psi.`,
    given: [],
    flag: 'Load factors not printed: 1.2D + 1.6L used',
    notes: ['Word-for-word the same as 2012-13 Q6(a). DL = self-weight only; exterior supports taken as integral spandrel beams.'],
    checks: () => [
      { key: 'h', label: 'Slab thickness h', value: s8a().h, unit: 'in' },
      { key: 'mneg', label: 'Mu at the interior support (−1/9)', value: s8a().sections.find((s) => s.id === 's1')!.Mu, unit: 'k-ft/ft' },
    ],
    solution: () => <OneWaySol r={s8a()} endNote="Exterior supports integral spandrel beams (−1/24); two spans → −1/9 at the interior support, +1/14 in the spans." />,
  },
  {
    id: 'rc-2010-11-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 10,
    topics: ['rc-oneway'],
    title: 'Why one-way slabs need T&S steel; ACI/BNBC ratios',
    pages: PG.s3,
    theory: true,
    text: 'Why temperature and shrinkage reinforcements are required in one-way slab? What are the ACI/BNBC recommended ratios for such steel?',
    given: [],
    solution: ans(A_TS),
  },
]
