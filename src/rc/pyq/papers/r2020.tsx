// CE 315 — 2020-21 term final (held 25 Oct 2022), PDF pp. 19–24.
import { Md } from '../../../components/ui'
import { allowableMoment, f, uncracked, type ElasticInput } from '../../engine/elastic'
import { review as sgReview, type LoadInput } from '../../engine/singly'
import type { DoublyDesignIn, DoublyReviewIn } from '../../engine/doubly'
import type { BeffIn } from '../../engine/tbeam'
import type { ShearBeam } from '../../engine/shear'
import type { OneWayCoefInput } from '../../engine/oneway'
import type { TwoWayInput } from '../../engine/twoway'
import { bar as bondBar, ldSimplified, upIn } from '../../engine/bond'
import type { Check, RcQ } from '../../types'
import {
  AID,
  ANS,
  C,
  CornerSketch,
  CutoffSketch,
  DimH,
  DoublyDesignChecks,
  DoublyDesignSolution,
  DoublyReviewChecks,
  DoublyReviewSolution,
  FloorSection,
  Model,
  OneWayChecks,
  OneWaySolution,
  PanelPlan,
  RatioChecks,
  RatioSolution,
  RectSection,
  Result,
  ShearChecks,
  ShearSolution,
  SinglyLoadChecks,
  SinglyLoadSolution,
  SinglyRhoChecks,
  SinglyRhoSolution,
  singlyRho,
  Sol,
  SSBeam,
  StagesSketch,
  StepList,
  Svg,
  Tbl,
  TDesignChecks,
  TDesignSolution,
  TorsionSketch,
  TwoWayChecks,
  TwoWaySolution,
} from './r2023'

const PAPER = '2020-21' as const

// ---------------------------------------------------------------- bond helper (also used by rjan21)
/** simplified ld (Table 6.1) for a list of bars, bottom and top */
export function ldRows(ids: string[], fc: number, fy: number, met = true) {
  return ids.map((id) => {
    const b = bondBar(id)
    const bot = ldSimplified({ db: b.db, small: b.small, fc, fy, met })
    const top = ldSimplified({ db: b.db, small: b.small, fc, fy, met, psiT: 1.3 })
    return { b, bot, top }
  })
}

/** Fig. 4: one-way slab over three 12 in. beams with the coefficients printed on it */
function CoefStripFig() {
  const x0 = 60,
    s = 18
  const beams = [x0, x0 + 12 / 12 * s + 14 * s, x0 + 2 * (s + 14 * s)]
  const top = 60,
    bot = 74
  return (
    <Svg w={beams[2] + s + 70} h={170} caption="Fig. 4: cross-section of one-way slab (slab continues past both end beams)." max={beams[2] + s + 70}>
      <rect x={x0 - 40} y={top} width={beams[2] + s + 80 - x0} height={bot - top} fill={C.conc} stroke={C.ink} strokeWidth={1.3} />
      {beams.map((x) => (
        <rect key={x} x={x} y={bot} width={s} height={26} fill={C.conc} stroke={C.ink} />
      ))}
      {beams.map((x) => (
        <text key={'n' + x} x={x + s / 2} y={top - 10} textAnchor="middle" fontWeight={700}>
          −1/11
        </text>
      ))}
      {[0, 1].map((j) => (
        <text key={j} x={(beams[j] + s + beams[j + 1]) / 2} y={bot + 22} textAnchor="middle" fontWeight={700}>
          +1/16
        </text>
      ))}
      {beams.map((x) => (
        <DimH key={'d' + x} x1={x} x2={x + s} y={bot + 50} label={`12"`} below />
      ))}
      {[0, 1].map((j) => (
        <DimH key={'s' + j} x1={beams[j] + s} x2={beams[j + 1]} y={bot + 50} label={`14'-0"`} below />
      ))}
      <text x={x0 - 44} y={(top + bot) / 2 + 5} fontSize={18} fill={C.mute}>
        {'{'}
      </text>
      <text x={beams[2] + s + 32} y={(top + bot) / 2 + 5} fontSize={18} fill={C.mute}>
        {'}'}
      </text>
    </Svg>
  )
}

const E1: ElasticInput = { b: 14, h: 20, d: 17.5, As: 3.16, fc: 5000, fy: 60000, n: 7, frPsi: 530, EcPsi: 4030000 }
const Q1C = `Simply supported beam, span 20 ft; $b = 14$ in., $d = 17.5$ in., $h = 20$ in.; $f'_c = 5.0$ ksi, $f_y = 60$ ksi; $f_r = 530$ psi; $E_c = 4030$ ksi, $E_s = 29000$ ksi; $n = 7$; tension steel four No. 8 bars.`
const Fig1c = () => <RectSection b={14} d={17.5} h={20} bar={8} rows={[4]} botText="Four No. 8 bars" showH given={["f'c = 5.0 ksi, fy = 60 ksi", 'n = 7, fr = 530 psi']} />
const D2c: DoublyDesignIn = { b: 14, d: 25, dt: 26.5, dp: 2.5, fc: 4, fy: 60, Mu: 750 }
const T3a: BeffIn = { kind: 'interior', L: 25, bw: 12, hf: 6, cc: 150, rule: 'aci08' }
const R3b: DoublyReviewIn = { b: 14, d: 26, dt: 27.5, dp: 2.5, As: 8 * 1.27, Asp: 3 * 1.0, fc: 4, fy: 60 }
const SS4a: LoadInput = { span: 22, support: 'ss', b: 12, h: 24, sdl: 1, ll: 2 }
const L4b = [
  { As: 4, d: 25.5 },
  { As: 4, d: 22.5 },
]
const OW5a: OneWayCoefInput = { spans: [14, 14], ends: ['spandrel', 'spandrel'], ll: 100, ff: 30, pw: 50, fc: 3500, fy: 60000, den: { s0: 11, p0: 16, s1: 11, p1: 16, s2: 11 } }
const L6a: LoadInput = { span: 36, support: 'ss', sdl: 2.4, ll: 1.6, points: [{ D: 40, L: 0, x: 12 }, { D: 40, L: 0, x: 24 }], factored: true }
const d6 = () => singlyRho(L6a, 12, 0.6, 3000, 60000).ds.dAct
const SB6b: ShearBeam = { kind: 'ss', L: 36, wD: 4, P: [{ x: 12, P: 40 }, { x: 24, P: 40 }], factored: true }
const TW7a: TwoWayInput = { lx: 24, ly: 20, edges: { top: true, right: true, bottom: false, left: false }, ll: 100, ff: 35, pw: 50, fc: 3000, fy: 60000 }

export const R2020: RcQ[] = [
  {
    id: 'rc-2020-21-1a',
    paper: PAPER,
    sec: 'A',
    no: '1(a)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Sources of uncertainty and how USD ensures safety',
    text: 'What are the sources of uncertainty in the analysis, design and construction of RC structures? How does the Strength Design method take care of these uncertainties and ensure safety in design?',
    pages: [19],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.uncertainty} />,
  },
  {
    id: 'rc-2020-21-1b',
    paper: PAPER,
    sec: 'A',
    no: '1(b)',
    marks: 8,
    topics: ['rc-elastic'],
    title: 'Beam behaviour under increasing load: uncracked, cracked, ultimate',
    text: 'Discuss the behaviour of an RC rectangular beam in flexure under increasing load by drawing neat sketches of the strain and stress distributions for the uncracked, cracked and ultimate conditions.',
    pages: [19],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.stages} fig={<StagesSketch />} />,
  },
  {
    id: 'rc-2020-21-1c-i',
    paper: PAPER,
    sec: 'A',
    no: '1(c)(i)',
    marks: 10,
    topics: ['rc-elastic'],
    title: 'Cracking moment Mcr (14 × 20 in., 4 #8, f′c = 5 ksi)',
    text: `${Q1C}\n\n(i) Determine the cracking moment $M_{cr}$.`,
    pages: [19],
    given: [],
    figure: Fig1c,
    checks: () => {
      const u = uncracked(E1)
      return [
        { key: 'Mcr', label: '$M_{cr}$ (transformed section)', value: u.Mcr, unit: 'k-ft' },
        { key: 'McrG', label: '$M_{cr}$ (gross section)', value: u.McrG, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const u = uncracked(E1)
      return (
        <Sol>
          <StepList steps={u.steps.slice(0, 6)} />
          <Result>{`$M_{cr} = ${f(u.Mcr, 1)}$ k-ft (transformed), $${f(u.McrG, 1)}$ k-ft (gross).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2020-21-1c-ii',
    paper: PAPER,
    sec: 'A',
    no: '1(c)(ii)',
    marks: 10,
    topics: ['rc-elastic'],
    title: 'Allowable service moment (0.45 f′c, 0.4 fy)',
    text: `${Q1C}\n\n(ii) Find the maximum service-load moment that can be resisted without stressing the concrete above $0.45f'_c$ or the steel above $0.4f_y$.`,
    pages: [19],
    given: [],
    figure: Fig1c,
    checks: () => {
      const a = allowableMoment(E1, 2.25, 24)
      return [
        { key: 'kd', label: '$kd$', value: a.kd, unit: 'in' },
        { key: 'Mc', label: 'Moment at $f_c = 2.25$ ksi', value: a.Mc, unit: 'k-ft' },
        { key: 'Ms', label: 'Moment at $f_s = 24$ ksi', value: a.Ms, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const a = allowableMoment(E1, 2.25, 24)
      return (
        <Sol>
          <Md>{`Allowables $f_c = 0.45(5) = 2.25$ ksi, $f_s = 0.4(60) = 24$ ksi; cracked transformed section with $n = 7$.`}</Md>
          <StepList steps={a.steps} />
          <Result>{`$M_{allow} = ${f(a.M, 1)}$ k-ft (${a.governs} governs).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2020-21-2a',
    paper: PAPER,
    sec: 'A',
    no: '2(a)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Why minimum cover? ACI/BNBC cover for beams and slabs',
    text: 'Why should a minimum concrete cover be maintained outside the steel? What are the ACI/BNBC cover requirements for beams and slabs?',
    pages: [19],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.cover} />,
  },
  {
    id: 'rc-2020-21-2b',
    paper: PAPER,
    sec: 'A',
    no: '2(b)',
    marks: 8,
    topics: ['rc-singly'],
    title: 'ρb, ρmax = ρ0.004, ρ0.005 and ρmin (f′c = 4, fy = 60)',
    text: "If $f'_c = 4$ ksi and $f_y = 60$ ksi, find: (i) $\\rho_b$; (ii) $\\rho_{max} = \\rho_{0.004}$; (iii) $\\rho_{0.005}$; (iv) $\\rho_{min}$.",
    pages: [19],
    given: [],
    checks: () => RatioChecks(4000, 60000),
    solution: () => <RatioSolution fc={4000} fy={60000} />,
  },
  {
    id: 'rc-2020-21-2c',
    paper: PAPER,
    sec: 'A',
    no: '2(c)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Doubly design: 14 × 29 in. section for Mu = 750 k-ft',
    text: "A beam section is limited to width $b = 14$ in. and total depth $h = 29$ in. Calculate the required reinforcement if the beam has to resist a factored moment $M_u = 750$ kip-ft. Assume two layers of tensile reinforcement with $d = 25$ in. and $d_t = 26.5$ in. Also assume $d' = 2.5$ in. if compression steel is required. Given: $f'_c = 4$ ksi, $f_y = 60$ ksi.",
    pages: [19, 20],
    given: [],
    checks: () => DoublyDesignChecks(D2c),
    solution: () => <DoublyDesignSolution p={D2c} />,
  },
  {
    id: 'rc-2020-21-3a',
    paper: PAPER,
    sec: 'A',
    no: '3(a)',
    marks: 15,
    topics: ['rc-tbeam'],
    title: 'T-beam design at midspan: 6 in. slab, 25 ft span, Mu = 500 k-ft',
    text: "A floor system consists of a 6 in. slab supported by continuous T-beams with a 25 ft span and centre-to-centre spacing of 12 ft 6 in. (Fig. 1). The web dimensions, as determined by the negative moment requirements at the supports, are $b_w = 12$ in. and $d = 21$ in. What tensile reinforcement is required at midspan to resist a factored moment $M_u = 500$ kip-ft? Check minimum reinforcement and $\\varepsilon_t$. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi.",
    pages: [20, 22],
    given: [],
    figure: () => <FloorSection webs={2} hf={6} bw={12} d={21} spacing={`12'-6"`} span="Span = 25 ft" bars={3} title="Fig. 1" given={["f'c = 3 ksi", 'fy = 60 ksi']} />,
    checks: () => TDesignChecks(T3a, 500, 21, 3, 60),
    solution: () => <TDesignSolution beff={T3a} Mu={500} d={21} fc={3} fy={60} />,
    notes: ['beff by the class (14th-ed) rule: min(16hf + bw, L/4, c/c) = L/4 = 75 in.'],
  },
  {
    id: 'rc-2020-21-3b',
    paper: PAPER,
    sec: 'A',
    no: '3(b)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Doubly review: 8 #10 + 3 #9, b = 14 in., d = 26 in.',
    text: "A rectangular RC beam as shown in Fig. 2 measures 14 in. wide. Tension steel consists of eight No. 10 bars in two layers ($d = 26$ in., $d_t = 27.5$ in.) and compression steel consists of three No. 9 bars located 2.5 in. from the compression face. Find the nominal and design moment capacities of the beam according to ACI/BNBC. Check for yielding of the compression steel and $\\varepsilon_t$. Given: $f'_c = 4$ ksi, $f_y = 60$ ksi.",
    pages: [20, 22],
    given: [],
    figure: () => <RectSection b={14} d={26} dt={27.5} dp={2.5} bar={10} rows={[4, 4]} top={3} topBar={9} topText="Three No. 9 bars" botText="Eight No. 10 bars" given={["f'c = 4.0 ksi", 'fy = 60 ksi']} caption="Fig. 2" />,
    checks: () => DoublyReviewChecks(R3b),
    solution: () => <DoublyReviewSolution p={R3b} />,
    notes: ["This is the paper where A's yields (the other three doubly reviews of this batch need the quadratic)."],
  },
  {
    id: 'rc-2020-21-4a',
    paper: PAPER,
    sec: 'A',
    no: '4(a)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Singly design: 12 × 24 in. beam, 22 ft span, service D + L',
    text: "A rectangular beam carries a service live load (unfactored) of 2.0 kip/ft and an unfactored superimposed dead load of 1.0 kip/ft (in addition to the self-weight of the beam) on a 22 ft simple span. The beam will have a cross-section of 12 in. × 24 in. for architectural reasons. Design the beam for flexure using USD. Given: $f'_c = 3.0$ ksi, $f_y = 60$ ksi.",
    pages: [20],
    given: [],
    checks: () => SinglyLoadChecks(SS4a, 12, 21.5, 3000, 60000),
    solution: () => <SinglyLoadSolution load={SS4a} b={12} d={21.5} fc={3000} fy={60000} dNote="One layer assumed: $d = h - 2.5 = 21.5$ in. ρ ends up just above ρ0.005, so φ is iterated slightly below 0.9." />,
    notes: ['Load factors 1.2D + 1.6L assumed; d = 21.5 in. assumed (one layer).'],
  },
  {
    id: 'rc-2020-21-4b',
    paper: PAPER,
    sec: 'A',
    no: '4(b)',
    marks: 14,
    topics: ['rc-singly'],
    title: 'Singly review, two rows: 8 #9, b = 14 in. (transition zone)',
    text: "A rectangular beam (Fig. 3) is 14 in. wide with eight No. 9 bars in two rows ($d = 24.0$ in., $d_t = 25.5$ in.). Find the nominal flexural strength $M_n$ and the maximum moment $\\phi M_n$ that can be utilised in design. Given: $f'_c = 5.0$ ksi, $f_y = 60$ ksi.",
    pages: [20, 22],
    given: [],
    figure: () => <RectSection b={14} d={24} dt={25.5} bar={9} rows={[4, 4]} botText="Eight No. 9 bars" given={["f'c = 5.0 ksi", 'fy = 60 ksi']} caption="Fig. 3" />,
    checks: () => {
      const r = sgReview({ b: 14, fc: 5000, fy: 60000, layers: L4b })
      return [
        { key: 'c', label: '$c$', value: r.c, unit: 'in' },
        { key: 'et', label: '$\\varepsilon_t$', value: r.epsT, tol: 0.03 },
        { key: 'Mn', label: '$M_n$', value: r.Mn, unit: 'k-ft' },
        { key: 'phiMn', label: '$\\phi M_n$', value: r.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = sgReview({ b: 14, fc: 5000, fy: 60000, layers: L4b })
      return (
        <Sol>
          <Md>{`$A_s = 8(1.00) = 8.00$ in², $\\beta_1 = 0.80$ for 5 ksi. Strains are measured at $d_t$ (extreme layer), the moment arm at $d$ (centroid).`}</Md>
          <StepList steps={r.steps} />
          <Result>{`$M_n = ${f(r.Mn, 1)}$ k-ft; $\\varepsilon_t = ${f(r.epsT, 4)}$ (transition), $\\phi = ${f(r.phi)}$ → $\\phi M_n = ${f(r.phiMn, 1)}$ k-ft.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2020-21-4c',
    paper: PAPER,
    sec: 'A',
    no: '4(c)',
    marks: 6,
    topics: ['rc-torsion'],
    title: 'Primary vs secondary torsion',
    text: 'What are primary and secondary torsion? Explain the difference.',
    pages: [20],
    theory: true,
    given: [],
    solution: () => <Model md={`Primary torsion = **equilibrium** torsion; secondary torsion = **compatibility** torsion.\n\n${ANS.torsionTypes}`} fig={<TorsionSketch />} />,
  },
  {
    id: 'rc-2020-21-5a',
    paper: PAPER,
    sec: 'B',
    no: '5(a)',
    marks: 23,
    topics: ['rc-oneway'],
    title: 'One-way slab with the coefficients given (two 14 ft spans, −1/11, +1/16)',
    text: "Design the one-way slab shown in Fig. 4 for a service live load of 100 psf. Consider floor finish load 30 psf and partition wall load 50 psf, excluding the self-weight of the slab. $f'_c = 3500$ psi, $f_y = 60{,}000$ psi. Moment coefficients are shown in Fig. 4 ($-1/11$ over each of the three 12 in. beams, $+1/16$ at each midspan; clear spans 14 ft). Show the slab reinforcement with a neat sketch.",
    pages: [21, 22],
    given: [],
    figure: () => <CoefStripFig />,
    checks: () => OneWayChecks(OW5a),
    solution: () => <OneWaySolution p={OW5a} endNote="Moments use the coefficients printed in Fig. 4 (interior-span values), Mu = C·wu·ln² with ln = 14 ft." />,
    notes: ['The braces show the slab continuing past both end beams (interior spans), but h is sized as an end span (ln/24 = 7 in.) like the solutions PDF; ln/28 would give 6 in.'],
  },
  {
    id: 'rc-2020-21-5b',
    paper: PAPER,
    sec: 'B',
    no: '5(b)',
    marks: 12,
    topics: ['rc-oneway'],
    title: 'T&S reinforcement and its necessity in slabs',
    text: 'Explain temperature and shrinkage reinforcement and discuss its necessity in RC design with reference to slabs.',
    pages: [21],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.ts} />,
  },
  {
    id: 'rc-2020-21-6a',
    paper: PAPER,
    sec: 'B',
    no: '6(a)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Singly design with b = 12 in., ρ = 0.6ρmax: 36 ft beam, two 40 k loads',
    text: "Design a singly reinforced beam for the loads shown in Fig. 5. All loads are factored. Assume $f'_c = 3000$ psi, $f_y = 60{,}000$ psi, $b = 12$ in. and $\\rho = 0.6\\rho_{max}$. (Fig. 5: simply supported 12 ft + 12 ft + 12 ft; point loads DL = 40 k at 12 ft and 24 ft; UDL DL = 2.4 k/ft and LL = 1.6 k/ft; dead load includes self-weight.)",
    pages: [21, 22],
    given: [],
    figure: () => <SSBeam spans={[12, 12, 12]} loads={[{ at: 12, label: 'DL = 40k' }, { at: 24, label: 'DL = 40k' }]} udl="DL = 2.4 k/ft, LL = 1.6 k/ft" note="All loads are factored. DL includes self-wt." caption="Fig. 5 (redrawn)" />,
    checks: () => SinglyRhoChecks(L6a, 12, 0.6, 3000, 60000),
    solution: () => <SinglyRhoSolution load={L6a} b={12} frac={0.6} fc={3000} fy={60000} />,
    notes: ['Loads declared factored even though DL and LL are listed: wu = 2.4 + 1.6 = 4.0 k/ft, Pu = 40 k.'],
  },
  {
    id: 'rc-2020-21-6b',
    paper: PAPER,
    sec: 'B',
    no: '6(b)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Stirrups for the beam of Q6(a), 3 spacings',
    text: 'Design the shear reinforcement (stirrups) for the beam in Q. 6(a). Calculate stirrups with 3 sets of spacing. Show the stirrups with a neat sketch.',
    pages: [21, 22],
    given: [],
    figure: () => <SSBeam spans={[12, 12, 12]} loads={[{ at: 12, label: '40k' }, { at: 24, label: '40k' }]} udl="wu = 4.0 k/ft" note="All loads factored" caption="Fig. 5 (redrawn)" />,
    checks: () => ShearChecks(SB6b, { bw: 12, d: d6(), fc: 3000, fy: 60000 }),
    solution: () => (
      <Sol>
        <Md>{`Section from Q6(a): $b_w = 12$ in., $d = ${f(d6())}$ in.`}</Md>
        <ShearSolution bm={SB6b} sec={{ bw: 12, d: d6(), fc: 3000, fy: 60000 }} />
      </Sol>
    ),
    notes: ['Chains on from Q6(a): d is the rounded effective depth of that design.'],
  },
  {
    id: 'rc-2020-21-7a',
    paper: PAPER,
    sec: 'B',
    no: '7(a)',
    marks: 25,
    topics: ['rc-twoway'],
    title: 'Two-way corner panel 20 × 24 ft, coefficient method',
    text: "Design a slab panel 20 ft by 24 ft to support a uniform live load of 100 psf. The panel is a corner panel of a group. Consider partition wall load 50 psf and floor finish load 35 psf in addition to the self-weight of the slab. $f'_c = 3.0$ ksi, $f_y = 60.0$ ksi. Use ACI moment coefficients from the supplied tables. Show the slab reinforcement with a neat sketch.",
    pages: [21, 23, 24],
    given: [
      { ...AID.t123, label: 'Table 4.2' },
      { ...AID.t124, label: 'Table 4.3' },
      { ...AID.t125, label: 'Table 4.4' },
    ],
    figure: () => <PanelPlan lb={`24'-0"`} la={`20'-0"`} cont={{ top: true, right: true }} note={'Corner panel → Case 4'} caption="Sketch (no figure in the paper)." />,
    checks: () => TwoWayChecks(TW7a),
    solution: () => <TwoWaySolution p={TW7a} note="20 × 24 ft taken as clear spans; beams assumed stiff (αm > 2). The attached tables (4.2–4.4, older Nilson numbering, A = short span) hold the same values as Tables 12.3–12.5." />,
    notes: ['Clear vs c/c and beam sizes not given: the panel size is used as the clear span (m = 0.833, Case 4), as in the solutions PDF.'],
  },
  {
    id: 'rc-2020-21-7b',
    paper: PAPER,
    sec: 'B',
    no: '7(b)',
    marks: 10,
    topics: ['rc-twoway'],
    title: 'Special reinforcement at exterior corners',
    text: 'Discuss in short the special reinforcement provided at the exterior corners of a two-way slab system.',
    pages: [21],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.corner} fig={<CornerSketch />} />,
  },
  {
    id: 'rc-2020-21-8a',
    paper: PAPER,
    sec: 'B',
    no: '8(a)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'Factors that influence development length',
    text: 'Discuss briefly the factors that influence the development length of a reinforcing bar.',
    pages: [21],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.ldFactors} />,
  },
  {
    id: 'rc-2020-21-8b',
    paper: PAPER,
    sec: 'B',
    no: '8(b)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'Development length of 16 mm and 25 mm bars (simplified)',
    text: "Calculate the development length for 16 mm and 25 mm uncoated bars when $f'_c = 3.5$ ksi and $f_y = 6.0$ ksi (sic — read 60 ksi).",
    pages: [21],
    given: [],
    checks: (): Check[] => {
      const r = ldRows(['16mm', '25mm'], 3500, 60000)
      return [
        { key: 'l16', label: '$l_d$, 16 mm bottom bar', value: r[0].bot.final, unit: 'in' },
        { key: 'l25', label: '$l_d$, 25 mm bottom bar', value: r[1].bot.final, unit: 'in' },
      ]
    },
    solution: () => {
      const r = ldRows(['16mm', '25mm'], 3500, 60000)
      const o = ldRows(['16mm', '25mm'], 3500, 60000, false)
      return (
        <Sol>
          <Md>{`ACI simplified equations (Table 6.1), uncoated ($\\psi_e = 1$), normal-weight ($\\lambda = 1$), $\\sqrt{3500} = ${f(r[0].bot.sqrtFc, 2)}$ psi. 16 mm (${f(r[0].b.db)} in. ≈ #5) uses the "#6 and smaller" column $l_d = \\frac{f_y\\psi_t\\psi_e}{25\\lambda\\sqrt{f'_c}}d_b$; 25 mm (${f(r[1].b.db)} in. ≈ #8) uses $\\frac{1}{20}$. Clear spacing ≥ db, cover ≥ db with minimum stirrups assumed (first row).`}</Md>
          <Tbl
            head={['Bar', 'db (in)', 'ld/db', 'bottom ld (in)', 'top bar ld (ψt = 1.3)', '"other cases" row']}
            rows={r.map((x, i) => [x.b.label, f(x.b.db), f(x.bot.ratio, 1), `${f(x.bot.ld0, 1)} → ${upIn(x.bot.final)}`, `${f(x.top.ld0, 1)} → ${upIn(x.top.final)}`, `${f(o[i].bot.ld0, 1)} in.`])}
          />
          <Result>{`$l_d$ ≈ **${upIn(r[0].bot.final)} in.** for 16 mm and **${upIn(r[1].bot.final)} in.** for 25 mm bottom bars (×1.3 if top bars), all ≥ 12 in.`}</Result>
        </Sol>
      )
    },
    notes: ['"fy = 6.0 ksi" is a typo for 60 ksi. Bar location, cover and spacing are not given: bottom bars with the first-row conditions assumed; the top-bar and "other cases" values are shown for comparison.'],
  },
  {
    id: 'rc-2020-21-8c',
    paper: PAPER,
    sec: 'B',
    no: '8(c)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Minimum lap lengths for column splices (ACI/BNBC)',
    text: 'What is the minimum length of lap for column splices as per the ACI/BNBC code?',
    pages: [21],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.columnLap} />,
  },
  {
    id: 'rc-2020-21-8d',
    paper: PAPER,
    sec: 'B',
    no: '8(d)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Sketch: cut-off and bend points, equal spans with UDL',
    text: 'Show with neat sketches the cut-off or bend points for bars in approximately equal spans with uniformly distributed loads.',
    pages: [21],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.cutoff} fig={<CutoffSketch />} />,
  },
]
