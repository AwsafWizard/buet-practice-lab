// CE 315 — January 2021 semester term final (2.5 hours), PDF pp. 25–30.
// Section A: 7 questions × 21 marks (answer 5); Section B: 4 × 35 (answer 3) on a common building plan (Fig. 4).
import { Md } from '../../../components/ui'
import { allowableMoment, f, uncracked, type ElasticInput, type SolStep } from '../../engine/elastic'
import type { DoublyDesignIn, DoublyReviewIn } from '../../engine/doubly'
import type { BeffIn } from '../../engine/tbeam'
import type { ShearBeam, ShearSection } from '../../engine/shear'
import type { OneWayCoefInput } from '../../engine/oneway'
import { slabLoads } from '../../engine/oneway'
import { ddmColumnStrip, ddmMo, hTwoWay } from '../../engine/twoway'
import { ldhCalc, standardCutoffs, tensionLap, upIn } from '../../engine/bond'
import type { Check, RcQ } from '../../types'
import {
  AID,
  ANS,
  C,
  CutoffSketch,
  DimH,
  DimV,
  DoublyDesignChecks,
  DoublyDesignSolution,
  DoublyReviewChecks,
  DoublyReviewSolution,
  FloorSection,
  Model,
  NegChecks,
  NegSolution,
  OneWayChecks,
  OneWaySolution,
  RectSection,
  Result,
  ShearChecks,
  ShearSolution,
  Sol,
  SSBeam,
  StepList,
  Svg,
  Tbl,
  TReviewChecks,
  TReviewSolution,
  TSupport,
} from './r2023'
import { ldRows } from './r2020'

const PAPER = 'jan-2021' as const
const COMMON =
  'Figure 4 shows a 4-storied commercial building plan at Dhaka with both one-way and two-way slab systems. All columns are 15 in. × 15 in.; all beams are 15 in. × 20 in., cast monolithically with the slab. The floor slab carries a service live load of 80 psf in addition to its self-weight; floor finish FF = 30 psf, partition wall PW = 50 psf. $f\'_c = 3.0$ ksi, $f_y = 60.0$ ksi.'

// ---------------------------------------------------------------- Fig. 4 plan
function BuildingPlan({ hl }: { hl: ('S1' | 'S2' | 'B1')[] }) {
  const s = 5,
    x0 = 70,
    y0 = 50
  const xs = [0, 24, 48, 72].map((v) => x0 + v * s)
  const ys = [0, 20, 40, 60, 72].map((v) => y0 + v * s)
  const bw = (15 / 12) * s
  const on = (k: 'S1' | 'S2' | 'B1') => hl.includes(k)
  return (
    <Svg w={xs[3] + 150} h={ys[4] + 60} caption="Fig. 4 — plan of the 4-storied building (redrawn, grids in ft c/c)." max={xs[3] + 150}>
      <rect x={xs[0]} y={ys[0]} width={xs[3] - xs[0]} height={ys[4] - ys[0]} fill={C.conc} />
      {on('S2') && <rect x={xs[1]} y={ys[1]} width={xs[2] - xs[1]} height={ys[2] - ys[1]} fill={C.load} opacity={0.15} />}
      {on('S1') && <rect x={xs[1]} y={ys[3]} width={xs[2] - xs[1]} height={ys[4] - ys[3]} fill={C.load} opacity={0.15} />}
      {ys.map((y) => (
        <rect key={'h' + y} x={xs[0] - bw / 2} y={y - bw / 2} width={xs[3] - xs[0] + bw} height={bw} fill="none" stroke={C.ink} strokeWidth={0.9} />
      ))}
      {xs.map((x) => (
        <rect key={'v' + x} x={x - bw / 2} y={ys[0] - bw / 2} width={bw} height={ys[4] - ys[0] + bw} fill="none" stroke={C.ink} strokeWidth={0.9} />
      ))}
      {xs.flatMap((x) => ys.map((y) => <rect key={`${x}-${y}`} x={x - bw / 2} y={y - bw / 2} width={bw} height={bw} fill={C.steel} />))}
      {on('B1') && <rect x={xs[1] - bw / 2} y={ys[1]} width={bw} height={ys[2] - ys[1]} fill={C.load} />}
      {/* stair */}
      {Array.from({ length: 11 }, (_, i) => xs[0] + 5 * s + i * s).map((x) => (
        <line key={x} x1={x} x2={x} y1={ys[3] + 3} y2={ys[4] - 3} stroke={C.mute} strokeWidth={0.6} />
      ))}
      <text x={xs[0] + 36 * s / 3} y={ys[3] + 36} fontSize={11} fill={C.mute} textAnchor="middle">
        stair
      </text>
      {['A', 'B', 'C', 'D'].map((t, i) => (
        <text key={t} x={xs[i]} y={y0 - 22} textAnchor="middle" fontWeight={700}>
          {t}
        </text>
      ))}
      {['01', '02', '03', '04', '05'].map((t, i) => (
        <text key={t} x={x0 - 40} y={ys[i] + 4} textAnchor="middle" fontWeight={700}>
          {t}
        </text>
      ))}
      {[0, 1, 2].map((i) => (
        <DimH key={i} x1={xs[i]} x2={xs[i + 1]} y={y0 - 12} label={`24'-0"`} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <DimV key={i} x={xs[3] + 22} y1={ys[i]} y2={ys[i + 1]} label={i < 3 ? `20'-0"` : `12'-0"`} />
      ))}
      <text x={(xs[1] + xs[2]) / 2} y={(ys[1] + ys[2]) / 2 + 5} textAnchor="middle" fontWeight={700} fontSize={16}>
        S2
      </text>
      <text x={(xs[1] + xs[2]) / 2} y={(ys[3] + ys[4]) / 2 + 5} textAnchor="middle" fontWeight={700} fontSize={16}>
        S1
      </text>
      <text x={xs[1] - 8} y={(ys[1] + ys[2]) / 2} textAnchor="end" fontSize={11} fontWeight={700}>
        B1
      </text>
      <text x={xs[3] + 70} y={ys[2] + 4} fontSize={11}>
        columns 15"×15"
      </text>
      <text x={xs[3] + 70} y={ys[2] + 20} fontSize={11}>
        beams 15"×20"
      </text>
      <text x={(xs[1] + xs[2]) / 2} y={ys[1] + 18} textAnchor="middle" fontSize={11} fill={C.mute}>
        22'-9" × 18'-9" clear
      </text>
      <text x={(xs[1] + xs[2]) / 2} y={ys[3] + 16} textAnchor="middle" fontSize={11} fill={C.mute}>
        22'-9" × 10'-9" clear
      </text>
    </Svg>
  )
}

// ---------------------------------------------------------------- DDM for slab S2 / beam B1 (local arithmetic; the twoway engine has hTwoWay, ddmMo, ddmColumnStrip)
const FC = 3000,
  FY = 60000
/** I of an interior T-beam (overhang each side = min(hw, 4hf)), in⁴ */
function tI(bw: number, h: number, hf: number) {
  const hw = h - hf
  const ov = Math.min(hw, 4 * hf)
  const bf = bw + 2 * ov
  const A1 = bf * hf,
    A2 = bw * hw
  const y = (A1 * (hf / 2) + A2 * (hf + hw / 2)) / (A1 + A2)
  const I = (bf * hf ** 3) / 12 + A1 * (y - hf / 2) ** 2 + (bw * hw ** 3) / 12 + A2 * (hf + hw / 2 - y) ** 2
  return { hw, ov, bf, y, I }
}
function ddm() {
  const la = 18.75,
    lb = 22.75
  const th = hTwoWay(la, lb, FY)
  const h = th.use
  const Ib = tI(15, 20, h)
  const IsLong = (20 * 12 * h ** 3) / 12 // beams on grids 02, 03 (span 24 ft): slab width 20 ft
  const IsShort = (24 * 12 * h ** 3) / 12 // beams on grids B, C (span 20 ft): slab width 24 ft
  const aLong = Ib.I / IsLong,
    aShort = Ib.I / IsShort
  const afm = (2 * aLong + 2 * aShort) / 4
  const loads = slabLoads({ h, ll: 80, ff: 30, pw: 50 })
  // short direction: l1 = 20 ft, l2 = 24 ft, ln = 18.75 ft
  const l1 = 20,
    l2 = 24,
    ln = 18.75
  const Mo = ddmMo(loads.wu / 1000, l2, ln)
  const neg = 0.65 * Mo,
    pos = 0.35 * Mo
  const a1 = aShort // beam parallel to l1
  const aL = (a1 * l2) / l1
  const pct = ddmColumnStrip('intNeg', l2 / l1, aL)
  const pctP = ddmColumnStrip('pos', l2 / l1, aL)
  const cs = { neg: (pct / 100) * neg, pos: (pctP / 100) * pos }
  const ms = { neg: neg - cs.neg, pos: pos - cs.pos }
  const beamShare = aL >= 1 ? 0.85 : 0.85 * aL
  // beam B1: 85 % of the column strip + its own stem weight (factored) with the same 0.65 / 0.35 split
  const wStem = 1.2 * ((15 * (20 - h)) / 144) * 0.15
  const MoStem = (wStem * ln * ln) / 8
  const B1 = { neg: beamShare * cs.neg + 0.65 * MoStem, pos: beamShare * cs.pos + 0.35 * MoStem }
  // ACI coefficients for B1: triangular slab load from both sides → equivalent UDL wu·la/3 per side
  const wSlab = 2 * ((loads.wu / 1000) * la) / 3
  const wB1 = wSlab + wStem
  const aci = { neg: (wB1 * ln * ln) / 11, pos: (wB1 * ln * ln) / 16 }
  return { la, lb, th, h, Ib, IsLong, IsShort, aLong, aShort, afm, loads, l1, l2, ln, Mo, neg, pos, aL, pct, pctP, cs, ms, beamShare, wStem, MoStem, B1, wSlab, wB1, aci }
}

const E1: ElasticInput = { b: 12, h: 28, d: 25, As: 3.81, fc: 3000, fy: 60000, n: 8 }
const Q1T = "A singly reinforced RC beam section has a width of 12 in., effective depth of 25 in. and total depth of 28 in. The tension reinforcement consists of three No. 10 bars in one row. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $f_r = 7.5\\sqrt{f'_c}$ psi, $n = 8$."
const Fig1 = () => <RectSection b={12} d={25} h={28} bar={10} rows={[3]} botText="Three No. 10 bars" showH given={["f'c = 3 ksi, fy = 60 ksi", 'n = 8']} />
const D2: DoublyDesignIn = { b: 14, d: 20, dt: 21.5, dp: 2.5, fc: 4, fy: 60, Mu: 475 }
const R3: DoublyReviewIn = { b: 12, d: 25, dt: 26.5, dp: 2.5, As: 6.32, Asp: 3.16, fc: 4, fy: 60 }
const T4: BeffIn = { kind: 'interior', L: 30, bw: 12, hf: 6, cc: 150, rule: 'aci08' }
const OW8a: OneWayCoefInput = { spans: [10.75, 10.75], ends: ['spandrel', 'spandrel'], ll: 80, ff: 30, pw: 50, fc: 3000, fy: 60000, den: { s0: 24, p0: 14, s1: 10 } }
const SB11: ShearBeam = { kind: 'ss', L: 36, wD: 2, P: [{ x: 10, P: 50 }, { x: 26, P: 50 }], factored: true }
const SS11: ShearSection = { bw: 14, d: 26, fc: 3000, fy: 60000 }
const DDM_FLAG = 'Direct Design Method — not in the current slides (only this paper asks it)'

export const RJAN21: RcQ[] = [
  {
    id: 'rc-jan-2021-1-i',
    paper: PAPER,
    sec: 'A',
    no: '1(i)',
    marks: 10,
    topics: ['rc-elastic'],
    title: 'Cracking moment (12 × 28 in., 3 #10, f′c = 3 ksi)',
    text: `${Q1T}\n\nFind (i) the cracking moment.`,
    pages: [25],
    given: [],
    figure: Fig1,
    checks: () => {
      const u = uncracked(E1)
      return [
        { key: 'fr', label: '$f_r$', value: u.fr, unit: 'psi' },
        { key: 'Mcr', label: '$M_{cr}$ (transformed)', value: u.Mcr, unit: 'k-ft' },
        { key: 'McrG', label: '$M_{cr}$ (gross)', value: u.McrG, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const u = uncracked(E1)
      return (
        <Sol>
          <StepList steps={u.steps.slice(0, 6)} />
          <Result>{`$M_{cr} = ${f(u.Mcr, 1)}$ k-ft (transformed section), $${f(u.McrG, 1)}$ k-ft (gross section).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-jan-2021-1-ii',
    paper: PAPER,
    sec: 'A',
    no: '1(ii)',
    marks: 11,
    topics: ['rc-elastic'],
    title: 'Allowable service moment (0.45 f′c, fs = 24 ksi)',
    text: `${Q1T}\n\nFind (ii) the allowable service-load moment that can be resisted without stressing the concrete above $0.45f'_c$ or the steel above $0.4f_y$.`,
    pages: [25],
    given: [],
    figure: Fig1,
    checks: () => {
      const a = allowableMoment(E1, 1.35, 24)
      return [
        { key: 'kd', label: '$kd$', value: a.kd, unit: 'in' },
        { key: 'Icr', label: '$I_{cr}$', value: a.Icr, unit: 'in⁴' },
        { key: 'M', label: 'Allowable moment', value: a.M, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const a = allowableMoment(E1, 1.35, 24)
      return (
        <Sol>
          <Md>{`Allowables $f_c = 0.45(3) = 1.35$ ksi, $f_s = 24$ ksi; cracked transformed section, $n = 8$.`}</Md>
          <StepList steps={a.steps} />
          <Result>{`$M_{allow} = ${f(a.M, 1)}$ k-ft (${a.governs} governs).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'rc-jan-2021-2',
    paper: PAPER,
    sec: 'A',
    no: '2',
    marks: 21,
    topics: ['rc-doubly'],
    title: 'Doubly design: 14 × 24 in. section for Mu = 475 k-ft',
    text: "A beam section is limited to width $b = 14$ in. and total depth $h = 24$ in. due to architectural reasons. Calculate the required reinforcement if the beam has to resist a factored moment $M_u = 475$ kip-ft. Assume two layers of tensile reinforcement with $d = 20$ in. and $d_t = 21.5$ in. Also assume $d' = 2.5$ in. if compression steel is required. Given: $f'_c = 4$ ksi, $f_y = 60$ ksi.",
    pages: [25],
    given: [],
    checks: () => DoublyDesignChecks(D2),
    solution: () => <DoublyDesignSolution p={D2} />,
  },
  {
    id: 'rc-jan-2021-3',
    paper: PAPER,
    sec: 'A',
    no: '3',
    marks: 21,
    topics: ['rc-doubly'],
    title: 'Doubly review: 12 in. wide, 8 #8 + 4 #8, d = 25 in.',
    text: "A rectangular RC beam as shown in Fig. 1 measures 12 in. wide and has an effective depth of 25 in. Tension steel consists of eight No. 8 bars in two layers ($d = 25$ in., $d_t = 26.5$ in.) and compression steel consists of four No. 8 bars located 2.5 in. from the compression face. What is the design moment capacity of the beam according to the ACI/BNBC code? Check for yielding of compression steel and find $\\varepsilon_t$. Given: $f'_c = 4$ ksi, $f_y = 60$ ksi.",
    pages: [25],
    given: [],
    figure: () => <RectSection b={12} d={25} dt={26.5} dp={2.5} bar={8} rows={[4, 4]} top={4} topText="Four No. 8 bars" botText="Eight No. 8 bars" caption="Fig. 1" />,
    checks: () => DoublyReviewChecks(R3),
    solution: () => <DoublyReviewSolution p={R3} />,
  },
  {
    id: 'rc-jan-2021-4a',
    paper: PAPER,
    sec: 'A',
    no: '4(a)',
    marks: 15,
    topics: ['rc-tbeam'],
    title: 'T-beam positive capacity at midspan: 3 #9, f′c = 3 ksi',
    text: "A floor system consists of a 6 in. slab supported by continuous beams with a 30 ft span and centre-to-centre spacing of 12 ft 6 in. (Fig. 2). Slab and beam are monolithically cast. $b_w = 12$ in., $d = 24$ in. At midspan there are 3 #9 bars at the bottom. What are the nominal and design positive moment capacities of the beam at midspan? Check $\\varepsilon_t$. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi.",
    pages: [26],
    given: [],
    figure: () => <FloorSection webs={2} hf={6} bw={12} d={24} spacing={`12'-6"`} span="Span = 30 ft" bars={3} barText="3- No. 9 bars" title="Fig. 2: Section at mid span" />,
    checks: () => TReviewChecks(T4, 24, 3, 3, 60),
    solution: () => <TReviewSolution beff={T4} d={24} As={3} fc={3} fy={60} bars="3 #9" />,
    notes: ['Same figure as 2021-22 Q7(a) with f′c = 3 ksi. beff = L/4 = 90 in. (class rule).'],
  },
  {
    id: 'rc-jan-2021-4b',
    paper: PAPER,
    sec: 'A',
    no: '4(b)',
    marks: 6,
    topics: ['rc-singly'],
    title: 'Why εt drops when As is added at constant d; ACI minimum εt',
    text: 'Explain why the net tensile strain $\\varepsilon_t$ decreases when the moment capacity is increased by adding tension steel while keeping $d$ constant. What is the minimum $\\varepsilon_t$ permitted by ACI/BNBC?',
    pages: [26],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.epsT} />,
  },
  {
    id: 'rc-jan-2021-5',
    paper: PAPER,
    sec: 'A',
    no: '5',
    marks: 21,
    topics: ['rc-tbeam'],
    title: 'Negative capacity at the support: 6 #7 top, f′c = 3 ksi',
    text: "For the same floor system as Question 4(a), at the support there are 6 #7 bars in two rows at the top (Fig. 3). Assume $d = 24.0$ in., $d_t = 25.5$ in. What are the nominal and design negative moment capacities of the beam at the support? Check $\\varepsilon_t$. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi.",
    pages: [26, 27],
    given: [],
    figure: () => <TSupport bw={12} hf={6} d={24} dt={25.5} bar={7} n={6} barText="Six No. 7 bars" title="Fig. 3 (contd.): beam section at support in detail" />,
    checks: () => NegChecks(12, 24, 25.5, 3.6, 3, 60),
    solution: () => <NegSolution bw={12} d={24} dt={25.5} As={3.6} fc={3} fy={60} bars="6 #7" />,
  },
  {
    id: 'rc-jan-2021-6',
    paper: PAPER,
    sec: 'A',
    no: '6',
    marks: 21,
    topics: ['rc-bond'],
    title: 'ld of #6 and #9: top vs other bars, and with 90° hooks',
    text: "Calculate the development length (for tension rebars) for #6 and #9 uncoated bars when used as (i) top bars and (ii) other bars in a beam section of 12 in. × 20 in. Compare the values when these rebars are 90° hooked. Use the simplified formula. Assume any missing data. Given: $f'_c = 4$ ksi, $f_y = 60$ ksi.",
    pages: [27],
    given: [],
    checks: (): Check[] => {
      const r = ldRows(['#6', '#9'], 4000, 60000)
      return [
        { key: 'l6', label: '$l_d$, #6 other (bottom) bar', value: r[0].bot.final, unit: 'in' },
        { key: 'l6t', label: '$l_d$, #6 top bar', value: r[0].top.final, unit: 'in' },
        { key: 'l9', label: '$l_d$, #9 other bar', value: r[1].bot.final, unit: 'in' },
        { key: 'l9t', label: '$l_d$, #9 top bar', value: r[1].top.final, unit: 'in' },
      ]
    },
    solution: () => {
      const r = ldRows(['#6', '#9'], 4000, 60000)
      const h = r.map((x) => ldhCalc({ db: x.b.db, fc: 4000, fy: 60000 }))
      const h7 = r.map((x) => ldhCalc({ db: x.b.db, fc: 4000, fy: 60000, psiC: 0.7 }))
      return (
        <Sol>
          <Md>{`Assumed: normal-weight concrete, uncoated ($\\psi_e = 1$), clear cover ≥ $d_b$ and clear spacing ≥ $2d_b$ (or minimum stirrups) → first row of Table 6.1. "Top bars" have more than 12 in. of fresh concrete below them ($\\psi_t = 1.3$) — true for negative bars in a 20 in. deep beam. $\\sqrt{4000} = 63.25$ psi.`}</Md>
          <Md>{`- #6 (No. 6 and smaller): $l_d = \\dfrac{f_y\\psi_t\\psi_e}{25\\lambda\\sqrt{f'_c}}d_b$; #9: $l_d = \\dfrac{f_y\\psi_t\\psi_e}{20\\lambda\\sqrt{f'_c}}d_b$.\n- 90° hook: $l_{dh} = \\dfrac{f_y\\psi_e\\psi_c\\psi_r}{50\\lambda\\sqrt{f'_c}}d_b \\ge 8d_b,\\ 6$ in.; $\\psi_c = 0.7$ if side cover ≥ 2.5 in. and tail cover ≥ 2 in.`}</Md>
          <Tbl
            head={['Bar', 'db', 'other bar ld', 'top bar ld', '90° hook ldh (basic)', 'ldh with ψc = 0.7']}
            rows={r.map((x, i) => [x.b.label, f(x.b.db), `${f(x.bot.ld0, 1)} → ${upIn(x.bot.final)} in.`, `${f(x.top.ld0, 1)} → ${upIn(x.top.final)} in.`, `${f(h[i].final, 1)} → ${upIn(h[i].final)} in.`, `${f(h7[i].final, 1)} in.`])}
          />
          <Result>{`Top bars need 30 % more length than other bars. A 90° hook cuts the anchorage to roughly ${f((h[0].final / r[0].bot.final) * 100, 0)} % (#6) and ${f((h[1].final / r[1].bot.final) * 100, 0)} % (#9) of the straight $l_d$ — the hook does not depend on bar position (no $\\psi_t$), so the saving is even larger for top bars.`}</Result>
        </Sol>
      )
    },
    notes: ['Cover/spacing not given: the "first row" conditions of Table 6.1 are assumed; with "other cases" ld is 1.5× larger.'],
  },
  {
    id: 'rc-jan-2021-7a',
    paper: PAPER,
    sec: 'A',
    no: '7(a)',
    marks: 14,
    topics: ['rc-bond'],
    theory: true,
    title: 'Cut-off / bend points, three equal 20 ft spans (straight and cranked)',
    text: 'Show with neat sketches the cut-off or bend points for bars for a case where a beam carries uniformly distributed loads over three equal 20 ft clear spans. Show both straight and cranked bar situations.',
    pages: [27],
    given: [],
    solution: () => {
      const c = standardCutoffs(20)
      const ft = (v: number) => {
        const t = Math.round(v * 12)
        return `${Math.floor(t / 12)}'-${t % 12}"`
      }
      return (
        <Model
          md={`${ANS.cutoff}\n\n### With $l_n = 20$ ft\n- Top bars at the interior supports extend $l_n/3$ = **${ft(c.topInterior)}** past each face; at the exterior supports $l_n/4$ = **${ft(c.topExterior)}**.\n- Half the bottom bars stop $l_n/8$ = **${ft(c.bottomCut)}** from the support faces; the rest run 6 in. into the supports.\n- Cranked bars bend at $l_n/7$ = **${ft(c.bendExterior)}** from the exterior face and $l_n/4$ = **${ft(c.bendInterior)}** from each interior face; the middle span is symmetric (bend $l_n/4$ from both faces).`}
          fig={<CutoffSketch ln={20} />}
        />
      )
    },
  },
  {
    id: 'rc-jan-2021-7b',
    paper: PAPER,
    sec: 'A',
    no: '7(b)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Class A / B lap splices; laps for a #8 bar with ld = 50 in.',
    text: 'Explain briefly the Class A and Class B lap splices for tension rebars. If the tension development length of a #8 bar is 50 in., what will be the required tension lap lengths for Class A and Class B lap splices?',
    pages: [27],
    given: [],
    checks: () => [
      { key: 'A', label: 'Class A lap', value: tensionLap(50, 'A').final, unit: 'in' },
      { key: 'B', label: 'Class B lap', value: tensionLap(50, 'B').final, unit: 'in' },
    ],
    solution: () => (
      <Sol>
        <Md>{ANS.splices}</Md>
        <Result>{`With $l_d = 50$ in.: **Class A** $= 1.0\\,l_d = ${f(tensionLap(50, 'A').final)}$ in.; **Class B** $= 1.3\\,l_d = ${f(tensionLap(50, 'B').final)}$ in. (both ≥ 12 in.).`}</Result>
      </Sol>
    ),
  },
  {
    id: 'rc-jan-2021-8a',
    paper: PAPER,
    sec: 'B',
    no: '8(a)',
    marks: 23,
    topics: ['rc-oneway'],
    title: 'One-way slab S1 from the building plan (10′-9″ clear span)',
    text: `${COMMON}\n\nDesign the one-way slab "S1" of Fig. 4 following the provisions of the ACI/BNBC code and show the reinforcement in plan and section. (S1: bay B–C, grids 04–05; clear 22′-9″ × 10′-9″.)`,
    pages: [28, 29, 30],
    given: [AID.aci],
    figure: () => <BuildingPlan hl={['S1']} />,
    checks: () => OneWayChecks(OW8a),
    solution: () => (
      <Sol>
        <Md>{`$22.75/10.75 = ${f(22.75 / 10.75, 2)} > 2$ → **one-way**, spanning N–S ($l_n = 10.75$ ft) between beam 05 (spandrel, $-1/24$) and beam 04 (continuous into the two-way panel, $-1/10$); end span $+1/14$.`}</Md>
        <OneWaySolution p={OW8a} noSketch endNote="Only the S1 span is designed (the second span in the coefficient set is a stand-in for the continuity over grid 04). Main bars run N–S; T&S bars run E–W. Plan: bottom bars at the spacing above across the 22′-9″ width, alternate bars cranked over beam 04 and beam 05, extra top bars over beam 04 extending ln/3 into S1." />
      </Sol>
    ),
    notes: ['Continuity across grid 04 is into a two-way panel, so the ACI coefficients are approximate (as in the solutions PDF: −1/24, +1/14, −1/10; h = ln/24 → 5.5 in.).'],
  },
  {
    id: 'rc-jan-2021-8b',
    paper: PAPER,
    sec: 'B',
    no: '8(b)',
    marks: 12,
    topics: ['rc-oneway'],
    title: 'Why T&S steel in one-way slabs; code ratios',
    text: 'Why are temperature and shrinkage reinforcements required in a one-way slab? What are the code-recommended ratios for such steel?',
    pages: [28],
    theory: true,
    given: [],
    solution: () => <Model md={ANS.ts} />,
  },
  {
    id: 'rc-jan-2021-9a',
    paper: PAPER,
    sec: 'B',
    no: '9(a)',
    marks: 18,
    topics: ['rc-twoway'],
    title: 'DDM: αfm of slab S2 and thickness by eq. 13.8b',
    text: `${COMMON}\n\nFind $\\alpha_{fm}$ for slab "S2" of Fig. 4 using the Direct Design Method (DDM). Find the thickness of the slab using equation (13.8b): for $\\alpha_{fm} > 2.0$, $h = \\dfrac{l_n(0.8 + f_y/200{,}000)}{36 + 9\\beta} \\ge 3.5$ in., $l_n$ = clear span in the long direction (in.), $\\beta$ = long/short clear span. (S2: bay B–C, grids 02–03; 24 ft × 20 ft c/c, 22′-9″ × 18′-9″ clear; all four edge beams interior.)`,
    pages: [28, 29],
    flag: DDM_FLAG,
    given: [AID.h2way],
    figure: () => <BuildingPlan hl={['S2']} />,
    checks: () => {
      const r = ddm()
      return [
        { key: 'h', label: 'Slab thickness h', value: r.h, unit: 'in' },
        { key: 'Ib', label: '$I_b$ of the T-beam', value: r.Ib.I, unit: 'in⁴' },
        { key: 'afm', label: '$\\alpha_{fm}$', value: r.afm },
      ]
    },
    solution: () => {
      const r = ddm()
      const steps: SolStep[] = [
        { t: 'Trial thickness (assume αfm > 2)', tex: `\\beta = \\frac{22.75}{18.75} = ${f(r.th.beta, 3)},\\quad h = \\frac{22.75(12)(0.8 + 0.3)}{36 + 9(${f(r.th.beta, 3)})} = ${f(r.th.raw, 2)}\\text{ in} \\Rightarrow h = ${f(r.h)}\\text{ in}` },
        {
          t: 'Beam as a T-section (ACI 8.4.1.8)',
          tex: `h_w = 20 - ${f(r.h)} = ${f(r.Ib.hw)}\\text{ in},\\ \\text{overhang} = \\min(h_w, 4h_f) = ${f(r.Ib.ov)}\\text{ in},\\ b_f = 15 + 2(${f(r.Ib.ov)}) = ${f(r.Ib.bf)}\\text{ in}`,
          md: 'Interior beams have slab on both sides. "15 in. × 20 in." is taken as the overall beam depth including the slab.',
        },
        { t: 'Moment of inertia of the beam', tex: `\\bar y = ${f(r.Ib.y, 2)}\\text{ in from the top},\\quad I_b = ${f(r.Ib.I, 0)}\\text{ in}^4` },
        {
          t: 'Slab strips',
          tex: `\\text{beams on 02, 03 (24 ft span): } I_s = \\frac{(20\\times12)(${f(r.h)})^3}{12} = ${f(r.IsLong, 0)}\\text{ in}^4;\\quad \\text{beams on B, C (20 ft span): } I_s = \\frac{(24\\times12)(${f(r.h)})^3}{12} = ${f(r.IsShort, 0)}\\text{ in}^4`,
          md: 'Each slab strip is bounded by the panel centre lines on either side of the beam (width = average of the adjacent panel dimensions).',
        },
        { t: 'αf of each edge beam', tex: `\\alpha_f = \\frac{E_{cb}I_b}{E_{cs}I_s}:\\quad \\alpha_{f,02/03} = \\frac{${f(r.Ib.I, 0)}}{${f(r.IsLong, 0)}} = ${f(r.aLong, 2)},\\quad \\alpha_{f,B/C} = \\frac{${f(r.Ib.I, 0)}}{${f(r.IsShort, 0)}} = ${f(r.aShort, 2)}` },
        { t: 'Average', tex: `\\alpha_{fm} = \\frac{2(${f(r.aLong, 2)}) + 2(${f(r.aShort, 2)})}{4} = ${f(r.afm, 2)}\\ ${r.afm > 2 ? '> 2 \\checkmark' : '< 2'}`, md: r.afm > 2 ? `The assumption is confirmed, so h = ${f(r.h)} in. by eq. 13.8b (≥ 3.5 in.).` : 'αfm < 2: use the 0.2 < αfm ≤ 2 equation instead.' },
      ]
      return (
        <Sol>
          <StepList steps={steps} />
          <Result>{`$\\alpha_{fm} = ${f(r.afm, 2)}$ (> 2); slab thickness **h = ${f(r.h)} in.**`}</Result>
        </Sol>
      )
    },
    notes: ['αf needs h first: a trial h from eq. 13.8b (αfm > 2) is checked afterwards.', 'β = 22.75/18.75 (clear spans), ln = 22.75 ft.'],
  },
  {
    id: 'rc-jan-2021-9b',
    paper: PAPER,
    sec: 'B',
    no: '9(b)',
    marks: 17,
    topics: ['rc-twoway'],
    title: 'DDM: column- and middle-strip moments of S2, short direction',
    text: `${COMMON}\n\nFind the column-strip and middle-strip positive and negative moments in the short direction (20 ft span) only for slab "S2". Use Table 13.4 for your calculation.`,
    pages: [28, 29, 30],
    flag: DDM_FLAG,
    given: [AID.t134],
    figure: () => <BuildingPlan hl={['S2']} />,
    checks: () => {
      const r = ddm()
      return [
        { key: 'Mo', label: 'Total static moment $M_o$', value: r.Mo, unit: 'k-ft' },
        { key: 'csn', label: 'Column-strip negative moment', value: r.cs.neg, unit: 'k-ft' },
        { key: 'msp', label: 'Middle-strip positive moment', value: r.ms.pos, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = ddm()
      const steps: SolStep[] = [
        { t: 'Factored load', tex: `h = ${f(r.h)}\\text{ in}:\\ D = ${f(r.loads.D, 1)}\\text{ psf},\\ w_u = 1.2(${f(r.loads.D, 1)}) + 1.6(80) = ${f(r.loads.wu, 1)}\\text{ psf}` },
        { t: 'Total static moment (short direction)', tex: `l_1 = 20\\text{ ft},\\ l_2 = 24\\text{ ft},\\ l_n = 20 - 1.25 = 18.75\\text{ ft}:\\quad M_o = \\frac{w_ul_2l_n^2}{8} = \\frac{${f(r.loads.wu / 1000, 4)}(24)(18.75)^2}{8} = ${f(r.Mo, 1)}\\text{ k-ft}` },
        { t: 'Interior span split', tex: `M^- = 0.65M_o = ${f(r.neg, 1)}\\text{ k-ft},\\quad M^+ = 0.35M_o = ${f(r.pos, 1)}\\text{ k-ft}` },
        { t: 'Table 13.4 parameters', tex: `\\frac{l_2}{l_1} = 1.2,\\quad \\alpha_{f1}\\frac{l_2}{l_1} = ${f(r.aShort, 2)}(1.2) = ${f(r.aL, 2)} \\ge 1` },
        { t: 'Column-strip share (interpolating 1.0 → 2.0)', tex: `\\text{negative: } 75 + 0.2(45 - 75) = ${f(r.pct, 1)}\\%,\\quad \\text{positive: } ${f(r.pctP, 1)}\\%` },
      ]
      return (
        <Sol>
          <StepList steps={steps} />
          <Tbl
            head={['Moment', 'Total (k-ft)', 'Column strip (k-ft)', 'Middle strip (k-ft)']}
            rows={[
              ['Negative (interior supports)', f(r.neg, 1), `${f(r.pct, 1)}% → ${f(r.cs.neg, 1)}`, f(r.ms.neg, 1)],
              ['Positive (midspan)', f(r.pos, 1), `${f(r.pctP, 1)}% → ${f(r.cs.pos, 1)}`, f(r.ms.pos, 1)],
            ]}
          />
          <Md>{`Column strip width = $2 \\times 0.25\\min(l_1, l_2) = 10$ ft; the two half middle strips together are $24 - 10 = 14$ ft wide. Of the column-strip moment, ${f(r.beamShare * 100, 0)} % goes to the beam ($\\alpha_{f1}l_2/l_1 \\ge 1$) and the rest to the slab part of the column strip.`}</Md>
          <Md>{`DDM limitation: the N–S spans are 20/20/20/12 ft — successive spans differ by more than one-third, so strictly DDM does not apply to the end bay; the paper ignores this for the interior panel S2.`}</Md>
        </Sol>
      )
    },
    notes: ['S2 is an interior panel in the short direction (grid 02–03): 0.65 / 0.35 split.', 'Table 13.4 interpolated linearly in l2/l1 between 1.0 and 2.0 (αf1 l2/l1 ≥ 1 row).'],
  },
  {
    id: 'rc-jan-2021-10a',
    paper: PAPER,
    sec: 'B',
    no: '10(a)',
    marks: 15,
    topics: ['rc-twoway'],
    title: 'DDM: positive and negative moments in short-direction beam B1',
    text: `${COMMON}\n\nFind the positive and negative moments in short-direction beam "B1" using DDM. Beam B1 carries load from both sides. (B1: grid B between 02 and 03, 15 in. × 20 in., 20 ft c/c span.)`,
    pages: [28, 29, 30],
    flag: DDM_FLAG,
    given: [AID.t134],
    figure: () => <BuildingPlan hl={['B1']} />,
    checks: () => {
      const r = ddm()
      return [
        { key: 'n', label: 'B1 negative moment', value: r.B1.neg, unit: 'k-ft' },
        { key: 'p', label: 'B1 positive moment', value: r.B1.pos, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = ddm()
      const steps: SolStep[] = [
        { t: 'Column-strip moments (from 9(b), frame along grid B, l2 = 24 ft)', tex: `M_{cs}^- = ${f(r.cs.neg, 1)}\\text{ k-ft},\\quad M_{cs}^+ = ${f(r.cs.pos, 1)}\\text{ k-ft}` },
        { t: 'Beam share', tex: `\\alpha_{f1}l_2/l_1 = ${f(r.aL, 2)} \\ge 1.0 \\Rightarrow \\text{beam takes } 85\\%:\\ 0.85(${f(r.cs.neg, 1)}) = ${f(0.85 * r.cs.neg, 1)},\\ 0.85(${f(r.cs.pos, 1)}) = ${f(0.85 * r.cs.pos, 1)}\\text{ k-ft}` },
        { t: 'Beam stem self-weight (not in the slab load)', tex: `w = 1.2\\frac{15(20 - ${f(r.h)})}{144}(0.150) = ${f(r.wStem, 3)}\\text{ k/ft},\\ M_o = \\frac{${f(r.wStem, 3)}(18.75)^2}{8} = ${f(r.MoStem, 2)}\\text{ k-ft} \\to 0.65M_o = ${f(0.65 * r.MoStem, 2)},\\ 0.35M_o = ${f(0.35 * r.MoStem, 2)}` },
      ]
      return (
        <Sol>
          <StepList steps={steps} />
          <Result>{`B1: $M^- = ${f(r.B1.neg, 1)}$ k-ft (at the supports), $M^+ = ${f(r.B1.pos, 1)}$ k-ft (midspan).`}</Result>
        </Sol>
      )
    },
    notes: ['The stem weight is distributed with the same 0.65 / 0.35 split (a common simplification).'],
  },
  {
    id: 'rc-jan-2021-10b',
    paper: PAPER,
    sec: 'B',
    no: '10(b)',
    marks: 20,
    topics: ['rc-twoway'],
    title: 'B1 moments by ACI coefficients; compare with DDM',
    text: `${COMMON}\n\nFind also the positive and negative moments in beam "B1" using the ACI moment coefficients (Table 12.1). Calculate $w_u$ from both sides of the slab in addition to the self-weight of the beam. Compare the results and comment on them.`,
    pages: [28, 29, 30],
    given: [AID.aci],
    figure: () => <BuildingPlan hl={['B1']} />,
    checks: () => {
      const r = ddm()
      return [
        { key: 'w', label: '$w_u$ on B1 (slab both sides + stem)', value: r.wB1, unit: 'k/ft' },
        { key: 'n', label: '$M^-$ (1/11)', value: r.aci.neg, unit: 'k-ft' },
        { key: 'p', label: '$M^+$ (1/16)', value: r.aci.pos, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = ddm()
      const steps: SolStep[] = [
        {
          t: 'Slab load to B1',
          tex: `B1 \\text{ is on the short edge of the panels: triangular load, equivalent UDL } \\frac{w_ul_a}{3}\\text{ per side} = \\frac{${f(r.loads.wu / 1000, 4)}(18.75)}{3} = ${f(r.wSlab / 2, 3)}\\text{ k/ft}`,
          md: '45° lines from the corners split each panel: the short-span beam receives a triangle of height $l_a/2$; $w_u l_a/3$ gives the same midspan moment.',
        },
        { t: 'Total factored load', tex: `w_u = 2(${f(r.wSlab / 2, 3)}) + ${f(r.wStem, 3)} = ${f(r.wB1, 3)}\\text{ k/ft}` },
        { t: 'ACI coefficients (interior span, ln = 18.75 ft)', tex: `M^- = \\frac{w_ul_n^2}{11} = ${f(r.aci.neg, 1)}\\text{ k-ft},\\quad M^+ = \\frac{w_ul_n^2}{16} = ${f(r.aci.pos, 1)}\\text{ k-ft}` },
      ]
      return (
        <Sol>
          <StepList steps={steps} />
          <Tbl
            head={['Moment', 'DDM 10(a)', 'ACI coefficients', 'Ratio ACI/DDM']}
            rows={[
              ['Negative', f(r.B1.neg, 1), f(r.aci.neg, 1), f(r.aci.neg / r.B1.neg, 2)],
              ['Positive', f(r.B1.pos, 1), f(r.aci.pos, 1), f(r.aci.pos / r.B1.pos, 2)],
            ]}
          />
          <Md>{`**Comment.** The two methods give moments of the same order but not equal. DDM treats the slab and beams as one frame and gives the beam 85 % of the column-strip moment, i.e. it uses the full panel width $l_2$ and the beam's actual stiffness; the ACI-coefficient method treats B1 as a continuous beam carrying only the 45° tributary (triangular) slab load. Because the stiff beams ($\\alpha_{fm} > 2$) attract more moment than the tributary area suggests, the DDM values are the more realistic for a monolithic slab–beam system; the coefficient approach is simpler and is acceptable for a quick design. Both rely on approximately equal spans and uniform load, which the 12 ft end bay violates.`}</Md>
        </Sol>
      )
    },
    notes: ['Table 12.6 is not attached to this paper, so the 45° (wu·la/3) load transfer is used.'],
  },
  {
    id: 'rc-jan-2021-11a',
    paper: PAPER,
    sec: 'B',
    no: '11(a)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Stirrup design, 3 spacings: 36 ft beam, two 50 k loads + 2 k/ft',
    text: "Design the stirrups for the beam shown in Figure 5. All loads are factored. Calculate the stirrups with 3 sets of spacing. $f'_c = 3.0$ ksi, $f_y = 60.0$ ksi. (Fig. 5: simply supported 10 ft + 16 ft + 10 ft; 50 kip at 10 ft and 26 ft; 2.0 kip/ft including self-weight; section 14 in. wide, $d = 26$ in.)",
    pages: [28, 29],
    given: [],
    figure: () => <SSBeam spans={[10, 16, 10]} loads={[{ at: 10, label: '50 kip' }, { at: 26, label: '50 kip' }]} udl="2.0 kip/ft (including self-wt.)" note="ALL LOADS ARE FACTORED" section={{ b: 14, d: 26, n: 2, stirrup: true }} caption="Fig. 5 (redrawn)" />,
    checks: () => ShearChecks(SB11, SS11),
    solution: () => <ShearSolution bm={SB11} sec={SS11} />,
    notes: ['#3 two-legged stirrups assumed; Vu at d from the support.'],
  },
  {
    id: 'rc-jan-2021-11b',
    paper: PAPER,
    sec: 'B',
    no: '11(b)',
    marks: 15,
    topics: ['rc-bond'],
    title: 'Factors for ld (tension and compression); column lap lengths',
    text: 'What are the factors that influence the development length of tension and compression bars? What is the minimum length of lap for column splices as per the ACI/BNBC code?',
    pages: [28],
    theory: true,
    given: [],
    solution: () => (
      <Model
        md={`### Tension bars\n${ANS.ldFactors}\n\n### Compression bars\n$l_{dc} = \\max\\left(\\dfrac{f_y\\psi_r}{50\\lambda\\sqrt{f'_c}}d_b,\\ 0.0003f_y\\psi_rd_b\\right) \\ge 8$ in. Compression bars need a **shorter** length: there are no flexural tension cracks to weaken the bond and part of the force is carried by end bearing of the bar on the concrete. Factors: $f_y$, $d_b$, $\\sqrt{f'_c}$, $\\lambda$, confinement ($\\psi_r = 0.75$ inside a spiral or #4 ties at ≤ 4 in.), and excess steel ($A_{s,req}/A_{s,prov}$). Bar position and coating do **not** matter in compression.\n\n### Column splices\n${ANS.columnLap}`}
      />
    ),
  },
]
