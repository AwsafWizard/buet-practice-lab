// CE 315 — 2021-22 term final (held 7 May 2023), PDF pp. 11–18.
// In this paper Section A holds slabs, shear and bond; Section B holds flexure.
import { Md } from '../../../components/ui'
import { allowableMoment, f, uncracked, type ElasticInput } from '../../engine/elastic'
import { review as sgReview, type LoadInput } from '../../engine/singly'
import type { DoublyDesignIn, DoublyReviewIn } from '../../engine/doubly'
import type { BeffIn } from '../../engine/tbeam'
import type { ShearBeam, ShearSection } from '../../engine/shear'
import type { CantSlabInput } from '../../engine/oneway'
import type { TwoWayInput } from '../../engine/twoway'
import type { RcQ } from '../../types'
import {
  AID,
  ANS,
  C,
  CantSlabChecks,
  CantSlabSolution,
  DimH,
  DoublyDesignChecks,
  DoublyDesignSolution,
  DoublyReviewChecks,
  DoublyReviewSolution,
  FloorSection,
  FloorSystemsSketch,
  Model,
  NegChecks,
  NegSolution,
  PanelPlan,
  PhiChart,
  RectSection,
  Result,
  ShearChecks,
  ShearSolution,
  SinglyLoadChecks,
  SinglyLoadSolution,
  SinglyRhoChecks,
  SinglyRhoSolution,
  Sol,
  SSBeam,
  StagesSketch,
  StepList,
  Svg,
  TReviewChecks,
  TReviewSolution,
  TSupport,
  TwoWayChecks,
  TwoWaySolution,
} from './r2023'

const PAPER = '2021-22' as const

/** Fig. 1: slab strip A–B–C–D with cantilevers on brick walls */
function CantStripFig() {
  const x0 = 40,
    s = 26
  const B = x0 + 5 * s,
    Cx = B + 14 * s,
    D = Cx + 5 * s
  const top = 50,
    bot = 66
  return (
    <Svg w={D + 70} h={170} caption="Fig. 1 (redrawn): cantilevers 5 ft each side of a 14 ft clear span; brick-wall supports at B and C." max={D + 70}>
      <rect x={x0} y={top} width={D - x0} height={bot - top} fill={C.conc} stroke={C.ink} strokeWidth={1.4} />
      {[B - 12, Cx].map((x) => (
        <g key={x}>
          <rect x={x} y={bot} width={12} height={40} fill={C.conc} stroke={C.ink} />
          {[0, 10, 20, 30].map((dy) => (
            <line key={dy} x1={x} y1={bot + dy + 10} x2={x + 12} y2={bot + dy} stroke={C.mute} />
          ))}
        </g>
      ))}
      {[
        ['A', x0],
        ['B', B - 6],
        ['C', Cx + 6],
        ['D', D],
      ].map(([t, x]) => (
        <text key={t as string} x={x as number} y={top - 8} textAnchor="middle" fontWeight={700}>
          {t}
        </text>
      ))}
      <DimH x1={x0} x2={B - 12} y={bot + 58} label={`5'-0"`} below />
      <DimH x1={B} x2={Cx} y={bot + 58} label={`14'-0" clear`} below />
      <DimH x1={Cx + 12} x2={D} y={bot + 58} label={`5'-0"`} below />
      <text x={D + 8} y={(top + bot) / 2 + 4} fontSize={12}>
        t = ?
      </text>
      <text x={Cx + 20} y={bot + 30} fontSize={11} fill={C.mute}>
        brick wall
      </text>
    </Svg>
  )
}

const E5: ElasticInput = { b: 14, h: 20, d: 17.5, As: 4.0, fc: 4000, fy: 60000, frPsi: 474, EcPsi: 3600000 }
const Q5B = `$b = 14$ in., $d = 17.5$ in., $h = 20$ in.; $f'_c = 4.0$ ksi, $f_y = 60$ ksi; modulus of rupture $f_r = 474$ psi; $E_c = 3600$ ksi, $E_s = 29000$ ksi; tension steel four No. 9 bars ($A_s = 4.00$ in²).`
const Fig5b = () => <RectSection b={14} d={17.5} h={20} bar={9} rows={[4]} botText="Four No. 9 bars" showH given={["f'c = 4.0 ksi, fy = 60 ksi", 'fr = 474 psi, Ec = 3600 ksi']} />
const CS1a: CantSlabInput = { span: 14, support: 12, cantL: 5, cantR: 5, ll: 100, ff: 30, pw: 60, fc: 3500, fy: 60000 }
const TW2a: TwoWayInput = { lx: 25, ly: 20, edges: { top: true, right: true, bottom: false, left: false }, ll: 80, ff: 40, pw: 60, fc: 3000, fy: 60000 }
const SB3a: ShearBeam = { kind: 'ss', L: 36, wD: 2, P: [{ x: 10, P: 40 }, { x: 26, P: 40 }], factored: true }
const SS3a: ShearSection = { bw: 14, d: 26, fc: 4000, fy: 60000 }
const L4a: LoadInput = { span: 32, support: 'ss', sdl: 2.5, ll: 1.5, points: [{ D: 50, L: 0, x: 16 }], factored: true }
const D6c: DoublyDesignIn = { b: 14, d: 24, dt: 25.5, dp: 2.5, fc: 4, fy: 60, Mu: 700 }
const T7: BeffIn = { kind: 'interior', L: 30, bw: 12, hf: 6, cc: 150, rule: 'aci08' }
const R8a: DoublyReviewIn = { b: 14, d: 23, dt: 24.5, dp: 2.5, As: 6.32, Asp: 3.16, fc: 5, fy: 60 }
const SS8b: LoadInput = { span: 25, support: 'ss', b: 14, h: 28, sdl: 1.5, ll: 2 }

export const R2021: RcQ[] = [
  {
    id: 'rc-2021-22-1a',
    paper: PAPER,
    sec: 'A',
    no: '1(a)',
    marks: 25,
    topics: ['rc-oneway'],
    title: 'One-way slab, 14 ft span with 5 ft cantilevers both sides (LL patterns)',
    text: "A 14 ft clear span one-way slab with an overhanging cantilever span of 5 ft on both sides, as shown in Fig. 1, is to be designed. The slab supports a live load of 100 psf in addition to its own weight. Assume partition wall (PW) load 60 psf and floor finish (FF) load 30 psf. Design the slab for maximum positive and negative moments considering that live load can occupy any position in the slab. Show reinforcement details in neat sketches. $f'_c = 3.5$ ksi, $f_y = 60$ ksi.",
    pages: [11, 15],
    given: [],
    figure: () => <CantStripFig />,
    checks: () => CantSlabChecks(CS1a),
    solution: () => <CantSlabSolution p={CS1a} />,
    notes: [
      'Brick-wall width not given: 12 in. assumed (as in the solutions PDF), so the span is 15 ft c/c and the cantilevers reach 5.5 ft to the wall centre; cantilever moments are taken at the wall face (5 ft).',
      'ACI coefficients do not apply to slabs with cantilevers: use statics with live-load patterns (LL on cantilevers → max −M; LL on the span only → max +M).',
    ],
  },
  {
    id: 'rc-2021-22-1b',
    paper: PAPER,
    sec: 'A',
    no: '1(b)',
    marks: 10,
    topics: ['rc-oneway'],
    title: 'Why and how T&S reinforcement in a one-way slab',
    text: 'Discuss why and how temperature and shrinkage reinforcement is provided in a one-way slab.',
    pages: [11],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.ts} />,
  },
  {
    id: 'rc-2021-22-2a',
    paper: PAPER,
    sec: 'A',
    no: '2(a)',
    marks: 23,
    topics: ['rc-twoway'],
    title: 'Two-way corner panel 20 × 25 ft, coefficient method',
    text: "Design a slab panel 20 ft by 25 ft to support a uniform live load of 80 psf. The panel is a corner panel of a group. Consider partition wall load 60 psf and floor finish load 40 psf in addition to the self-weight of the slab. $f'_c = 3.0$ ksi, $f_y = 60$ ksi. Use ACI moment coefficients from the supplied tables. Show the slab reinforcement with a neat sketch.",
    pages: [11, 16, 17, 18],
    given: [
      { ...AID.t123, label: 'Table 1' },
      { ...AID.t124, label: 'Table 2' },
      { ...AID.t125, label: 'Table 3' },
    ],
    figure: () => <PanelPlan lb={`25'-0"`} la={`20'-0"`} cont={{ top: true, right: true }} note={'Corner panel:\none long + one short\nedge continuous\n→ Case 4'} caption="Sketch (no figure in the paper): corner panel, exterior corner bottom-left." />,
    checks: () => TwoWayChecks(TW2a),
    solution: () => <TwoWaySolution p={TW2a} note="20 × 25 ft taken as clear spans (as the solutions PDF does); beams assumed stiff (αm > 2). Table 12.6 is not attached, so the slab-shear / beam-load step is extra." />,
    notes: ['Clear vs c/c and beam sizes are not given: the panel size is used as the clear span, m = 0.80, Case 4.'],
  },
  {
    id: 'rc-2021-22-2b',
    paper: PAPER,
    sec: 'A',
    no: '2(b)',
    marks: 6,
    topics: ['rc-basics'],
    title: 'Sources of uncertainty in RC design',
    text: 'What are the sources of uncertainties in RC design? Explain.',
    pages: [11],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.uncertainty} />,
  },
  {
    id: 'rc-2021-22-2c',
    paper: PAPER,
    sec: 'A',
    no: '2(c)',
    marks: 6,
    topics: ['rc-bond'],
    title: 'Class A and Class B tension splices',
    text: 'Explain briefly the class A and class B splices in tension rebars.',
    pages: [11],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.splices} />,
  },
  {
    id: 'rc-2021-22-3a',
    paper: PAPER,
    sec: 'A',
    no: '3(a)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Stirrup design, 3 spacings: 36 ft beam, two 40 k loads + 2 k/ft',
    text: "Design the stirrups for the beam shown in Fig. 2. Use $f'_c = 4$ ksi and $f_y = 60$ ksi. Calculate stirrups with 3 sets of spacing. Show the stirrups in a neat sketch. (Fig. 2: simply supported, 10 ft + 16 ft + 10 ft; 40 k point loads at 10 ft and 26 ft; UDL 2 kip/ft including self-weight; all loads factored; section 14 in. wide, $d = 26$ in.)",
    pages: [11, 15],
    given: [],
    figure: () => (
      <SSBeam spans={[10, 16, 10]} loads={[{ at: 10, label: '40k' }, { at: 26, label: '40k' }]} udl="2 kip/ft (including self-wt)" note="ALL LOADS ARE FACTORED" section={{ b: 14, d: 26, n: 1 }} caption="Fig. 2 (redrawn)" />
    ),
    checks: () => ShearChecks(SB3a, SS3a),
    solution: () => <ShearSolution bm={SB3a} sec={SS3a} />,
    notes: ['Stirrups: #3 two-legged (Av = 0.22 in²) assumed. Supports treated as knife-edge; Vu at d from the support.'],
  },
  {
    id: 'rc-2021-22-3b',
    paper: PAPER,
    sec: 'A',
    no: '3(b)',
    marks: 8,
    topics: ['rc-shear'],
    title: 'Maximum stirrup spacing when Vs ≤ or > 4√f′c bw d',
    text: "What are the maximum spacings of stirrups in shear design for the following cases: (i) when $V_s \\le 4\\sqrt{f'_c}\\,b_wd$; (ii) when $V_s > 4\\sqrt{f'_c}\\,b_wd$?",
    pages: [11],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.stirrupSpacing} />,
  },
  {
    id: 'rc-2021-22-3c',
    paper: PAPER,
    sec: 'A',
    no: '3(c)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'What is "serviceability" in RC design?',
    text: 'What do you understand by the term "serviceability" in RC design?',
    pages: [11],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.serviceability} />,
  },
  {
    id: 'rc-2021-22-4a',
    paper: PAPER,
    sec: 'A',
    no: '4(a)',
    marks: 20,
    topics: ['rc-singly'],
    title: 'Singly design with b = 12 in., ρ = 0.6ρmax: 32 ft beam, 50 k at midspan',
    text: "Design a singly reinforced beam for the loads shown in Fig. 3. All loads are factored. Assume $f'_c = 3500$ psi, $f_y = 60{,}000$ psi, $b = 12$ in. and $\\rho = 0.6\\rho_{max}$. (Fig. 3: simply supported 16 ft + 16 ft; 50 kip at midspan; UDL DL = 2.5 k/ft, LL = 1.5 k/ft; dead load includes self-weight of the beam.)",
    pages: [11, 15],
    given: [],
    figure: () => <SSBeam spans={[16, 16]} loads={[{ at: 16, label: '50 kip' }]} udl="DL = 2.5 k/ft, LL = 1.5 k/ft" note="All loads are factored. DL includes self-wt." caption="Fig. 3 (redrawn)" />,
    checks: () => SinglyRhoChecks(L4a, 12, 0.6, 3500, 60000),
    solution: () => <SinglyRhoSolution load={L4a} b={12} frac={0.6} fc={3500} fy={60000} />,
    notes: ['DL and LL are listed separately but declared factored: wu = 2.5 + 1.5 = 4.0 k/ft (re-applying 1.2/1.6 would give Mu ≈ 1091 k-ft).'],
  },
  {
    id: 'rc-2021-22-4b',
    paper: PAPER,
    sec: 'A',
    no: '4(b)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Factors that influence development length',
    text: 'Discuss briefly the factors that influence the development length of a reinforcing bar.',
    pages: [12],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.ldFactors} />,
  },
  {
    id: 'rc-2021-22-4c',
    paper: PAPER,
    sec: 'A',
    no: '4(c)',
    marks: 8,
    topics: ['rc-basics'],
    title: 'Five RC floor systems used in Bangladesh (sketches)',
    text: 'Describe with neat sketches five reinforced concrete floor systems commonly used in Bangladesh.',
    pages: [12],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.floorSystems} fig={<FloorSystemsSketch />} />,
  },
  {
    id: 'rc-2021-22-5a',
    paper: PAPER,
    sec: 'B',
    no: '5(a)',
    marks: 7,
    topics: ['rc-elastic'],
    title: 'Beam behaviour under increasing load: uncracked, cracked, ultimate',
    text: 'Discuss the behaviour of an RC rectangular beam in flexure under increasing load by drawing neat sketches of the strain and stress distributions for the uncracked, cracked and ultimate conditions.',
    pages: [12],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.stages} fig={<StagesSketch />} />,
  },
  {
    id: 'rc-2021-22-5b-i',
    paper: PAPER,
    sec: 'B',
    no: '5(b)(i)',
    marks: 8,
    topics: ['rc-elastic'],
    title: 'Cracking moment Mcr (14 × 20 in., 4 #9, f′c = 4 ksi)',
    text: `${Q5B}\n\n(i) Determine the cracking moment $M_{cr}$.`,
    pages: [12],
    given: [],
    figure: Fig5b,
    checks: () => {
      const u = uncracked(E5)
      return [
        { key: 'n', label: 'Modular ratio n (rounded)', value: u.n },
        { key: 'Mcr', label: '$M_{cr}$ (transformed section)', value: u.Mcr, unit: 'k-ft' },
        { key: 'McrG', label: '$M_{cr}$ (gross section)', value: u.McrG, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const u = uncracked(E5)
      return (
        <Sol>
          <StepList steps={u.steps.slice(0, 6)} />
          <Result>{`$M_{cr} = ${f(u.Mcr, 1)}$ k-ft (transformed, n = ${u.n}); gross section $${f(u.McrG, 1)}$ k-ft.`}</Result>
        </Sol>
      )
    },
    notes: ['n is not given: Es/Ec = 29000/3600 = 8.06 → n = 8.'],
  },
  {
    id: 'rc-2021-22-5b-ii',
    paper: PAPER,
    sec: 'B',
    no: '5(b)(ii)',
    marks: 4,
    topics: ['rc-elastic'],
    title: 'Steel stress and strain just before cracking',
    text: `${Q5B}\n\n(ii) Determine the steel stress and strain just before cracking.`,
    pages: [12],
    given: [],
    figure: Fig5b,
    checks: () => {
      const u = uncracked(E5)
      return [
        { key: 'fs', label: 'Steel stress $f_s$', value: u.fsCr, unit: 'ksi' },
        { key: 'es', label: 'Steel strain $\\varepsilon_s \\times 10^6$', value: u.epsSCr * 1e6, unit: 'με' },
      ]
    },
    solution: () => {
      const u = uncracked(E5)
      return (
        <Sol>
          <StepList steps={[u.steps[0], u.steps[3], u.steps[6]]} />
          <Result>{`$f_s = ${f(u.fsCr, 2)}$ ksi, $\\varepsilon_s = ${f(u.epsSCr)}$.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2021-22-5b-iii',
    paper: PAPER,
    sec: 'B',
    no: '5(b)(iii)',
    marks: 8,
    topics: ['rc-elastic'],
    title: 'Allowable service moment (0.45 f′c, 0.4 fy)',
    text: `${Q5B}\n\n(iii) Find the maximum service-load moment that can be resisted without stressing the concrete above $0.45f'_c$ or the steel above $0.4f_y$.`,
    pages: [12],
    given: [],
    figure: Fig5b,
    checks: () => {
      const a = allowableMoment(E5, 1.8, 24)
      return [
        { key: 'kd', label: '$kd$', value: a.kd, unit: 'in' },
        { key: 'Mc', label: 'Moment at $f_c = 1.8$ ksi', value: a.Mc, unit: 'k-ft' },
        { key: 'Ms', label: 'Moment at $f_s = 24$ ksi', value: a.Ms, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const a = allowableMoment(E5, 1.8, 24)
      return (
        <Sol>
          <Md>{`Allowables $f_c = 0.45(4) = 1.8$ ksi, $f_s = 0.4(60) = 24$ ksi; cracked transformed section, n = ${a.n}.`}</Md>
          <StepList steps={a.steps} />
          <Result>{`$M_{allow} = ${f(a.M, 1)}$ k-ft — the **${a.governs}** governs here (unlike 2023-24).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2021-22-5b-iv',
    paper: PAPER,
    sec: 'B',
    no: '5(b)(iv)',
    marks: 8,
    topics: ['rc-singly'],
    title: 'Maximum moment before failure and steel strain',
    text: `${Q5B}\n\n(iv) What is the maximum moment that can be carried by this beam before failure? Find the steel strain at this moment.`,
    pages: [12],
    given: [],
    figure: Fig5b,
    checks: () => {
      const r = sgReview({ b: 14, fc: 4000, fy: 60000, layers: [{ As: 4, d: 17.5 }] })
      return [
        { key: 'c', label: '$c$', value: r.c, unit: 'in' },
        { key: 'Mn', label: '$M_n$', value: r.Mn, unit: 'k-ft' },
        { key: 'es', label: 'Steel strain $\\varepsilon_s$', value: r.epsS, tol: 0.03 },
      ]
    },
    solution: () => {
      const r = sgReview({ b: 14, fc: 4000, fy: 60000, layers: [{ As: 4, d: 17.5 }] })
      return (
        <Sol>
          <StepList steps={r.steps.slice(0, 5)} />
          <Result>{`$M_n = ${f(r.Mn, 1)}$ k-ft ($\\phi M_n = ${f(r.phiMn, 1)}$ k-ft); steel strain at failure $\\varepsilon_s = ${f(r.epsS, 4)}$.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2021-22-6a',
    paper: PAPER,
    sec: 'B',
    no: '6(a)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'USD vs WSD — how safety is ensured in each',
    text: 'Explain the differences between the USD and WSD methods of design with particular emphasis on how safety is ensured in both design methods.',
    pages: [12],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.usdWsd} />,
  },
  {
    id: 'rc-2021-22-6b',
    paper: PAPER,
    sec: 'B',
    no: '6(b)',
    marks: 8,
    topics: ['rc-singly'],
    title: 'Derive ρmax; εt = 0.004; φ vs εt',
    text: 'Derive the equation for finding $\\rho_{max}$ and discuss how a minimum tensile strain ($\\varepsilon_t = 0.004$) at failure is ensured by not exceeding the maximum reinforcement ratio. Also discuss the variation of φ with $\\varepsilon_t$ as given in the ACI/BNBC code.',
    pages: [12],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.rhoMax} fig={<PhiChart />} />,
  },
  {
    id: 'rc-2021-22-6c',
    paper: PAPER,
    sec: 'B',
    no: '6(c)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Doubly design: 14 × 28 in. section for Mu = 700 k-ft',
    text: "A beam section is limited to width $b = 14$ in. and total depth $h = 28$ in. Calculate the required reinforcement if the beam has to resist a factored moment $M_u = 700$ kip-ft. Assume two-layer tensile reinforcement with $d = 24$ in. and $d_t = 25.5$ in. Also assume $d' = 2.5$ in. if compression steel is required. Given: $f'_c = 4.0$ ksi, $f_y = 60$ ksi.",
    pages: [12],
    given: [],
    checks: () => DoublyDesignChecks(D6c),
    solution: () => <DoublyDesignSolution p={D6c} />,
  },
  {
    id: 'rc-2021-22-7a',
    paper: PAPER,
    sec: 'B',
    no: '7(a)',
    marks: 17,
    topics: ['rc-tbeam'],
    title: 'T-beam positive capacity at midspan: 3 #9, 6 in. slab, 12′-6″ spacing',
    text: "A floor system consists of a 6 in. slab supported by continuous beams with 30 ft span and centre-to-centre spacing of 12 ft 6 in., as shown in Figure 4. Slab and beam are monolithically cast. Beam web width $b_w = 12$ in. and effective depth $d = 24$ in. At midspan of the beam there are 3 #9 bars at the bottom. What are the nominal and design positive moment capacities of the beam at midspan? Check $\\varepsilon_t$. Given: $f'_c = 4.0$ ksi, $f_y = 60$ ksi.",
    pages: [13],
    given: [],
    figure: () => <FloorSection webs={2} hf={6} bw={12} d={24} spacing={`12'-6"`} span="Span = 30 ft" bars={3} barText="3- No. 9 bars" title="Figure 4: Section at mid span" />,
    checks: () => TReviewChecks(T7, 24, 3, 4, 60),
    solution: () => <TReviewSolution beff={T7} d={24} As={3} fc={4} fy={60} bars="3 #9" />,
    notes: ['beff = min(16hf + bw, span/4, c/c spacing) as on the class slides (14th ed.) = 90 in. The 15th-ed rule L/4 + bw gives 102 in.; a ≪ hf either way, so φMn barely changes.'],
  },
  {
    id: 'rc-2021-22-7b',
    paper: PAPER,
    sec: 'B',
    no: '7(b)',
    marks: 18,
    topics: ['rc-tbeam'],
    title: 'Negative capacity at the support: 6 #7 top, bw = 12 in.',
    text: "For the same floor system as in Question 7(a), at the support there are 6 #7 bars in two rows at the top, as shown in Figure 5. Assume $d = 24.0$ in., $d_t = 25.5$ in. as shown in detail in Figure 6. What are the nominal and design negative moment capacities of the beam at the support? Check $\\varepsilon_t$. Given: $f'_c = 4.0$ ksi, $f_y = 60$ ksi.",
    pages: [13, 14],
    given: [],
    figure: () => (
      <div className="space-y-2">
        <FloorSection webs={2} hf={6} bw={12} d={24} spacing={`12'-6"`} span="Span = 30 ft" bars={6} top barText="6- No. 7 bars" title="Figure 5: Section at support" />
        <TSupport bw={12} hf={6} d={24} dt={25.5} bar={7} n={6} barText="Six No. 7 bars" title="Figure 6: Beam section at support in detail" />
      </div>
    ),
    checks: () => NegChecks(12, 24, 25.5, 3.6, 4, 60),
    solution: () => <NegSolution bw={12} d={24} dt={25.5} As={3.6} fc={4} fy={60} bars="6 #7" />,
  },
  {
    id: 'rc-2021-22-8a',
    paper: PAPER,
    sec: 'B',
    no: '8(a)',
    marks: 18,
    topics: ['rc-doubly'],
    title: 'Doubly review: 14 in. wide, 8 #8 + 4 #8, d = 23 in.',
    text: "A rectangular RC beam as shown in Figure 7 measures 14 in. wide and has an effective depth of 23 in. Tension steel consists of eight No. 8 bars in two layers ($d = 23$ in., $d_t = 24.5$ in.) and compression steel consists of four No. 8 bars located 2.5 in. from the compression face. What is the design moment capacity of the beam according to the ACI/BNBC code? Given: $f'_c = 5.0$ ksi, $f_y = 60$ ksi.",
    pages: [14],
    given: [],
    figure: () => <RectSection b={14} d={23} dt={24.5} dp={2.5} bar={8} rows={[4, 4]} top={4} topText="Four No. 8 bars" botText="Eight No. 8 bars" caption="Figure 7" />,
    checks: () => DoublyReviewChecks(R8a),
    solution: () => <DoublyReviewSolution p={R8a} />,
    notes: ['The figure clearly reads "Four No. 8 bars" (the OCR layer misreads No. 9). A yield check of A′s is needed even though not asked explicitly.'],
  },
  {
    id: 'rc-2021-22-8b',
    paper: PAPER,
    sec: 'B',
    no: '8(b)',
    marks: 17,
    topics: ['rc-singly'],
    title: 'Singly design: 14 × 28 in. beam, 25 ft span, service D + L',
    text: "A rectangular beam carries a service live load (unfactored) of 2.0 kip/ft and an unfactored superimposed dead load of 1.5 kip/ft (in addition to the self-weight of the beam) on a 25 ft simple span. The beam will have a cross-section of 14 in. × 28 in. for architectural reasons. Design the beam for flexure. Given: $f'_c = 4.0$ ksi, $f_y = 60$ ksi.",
    pages: [14],
    given: [],
    checks: () => SinglyLoadChecks(SS8b, 14, 25.5, 4000, 60000),
    solution: () => <SinglyLoadSolution load={SS8b} b={14} d={25.5} fc={4000} fy={60000} dNote="One layer assumed: $d = h - 2.5 = 25.5$ in." />,
    notes: ['Load factors not stated: 1.2D + 1.6L used.'],
  },
]
