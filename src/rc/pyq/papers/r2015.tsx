// 2015-16 term final (held 4 Feb 2017), PDF pp. 44–52. Attached: Tables 12.3–12.6 (pp. 50–51), ACI coefficient summary (p. 52).
import type { RcQ } from '../../types'
import { SolSteps } from '../../topics/elastic/ui'
import { f, elasticAt, uncracked, type ElasticInput } from '../../engine/elastic'
import { beamLoads, review, type LoadInput, type SinglyInput } from '../../engine/singly'
import { designDoubly, reviewDoubly, type DoublyDesignIn, type DoublyReviewIn } from '../../engine/doubly'
import { effectiveWidth, type BeffIn } from '../../engine/tbeam'
import { oneWayCoef, type OneWayCoefInput } from '../../engine/oneway'
import { twoWay, type TwoWayInput } from '../../engine/twoway'
import type { ShearBeam, ShearSection } from '../../engine/shear'
import {
  ANS,
  Ans,
  AnsMd,
  beffSteps,
  C,
  CutoffFig,
  DimChain,
  DimV,
  doublyDesignSteps,
  DoublyDesignSol,
  DoublyReviewSol,
  ElasticAtSol,
  fixedDesign,
  FixedDesignSol,
  kRhoDesign,
  KRhoSol,
  Note,
  OneWaySol,
  PhiChart,
  r,
  RectSec,
  shearKey,
  ShearSol,
  SinglyReviewSol,
  Sol,
  SSBeam,
  st,
  StagesFig,
  Svg,
  T,
  tDesignSteps,
  TFloor,
  TwoWaySol,
  barTxt,
} from './r2017'

const PG = { A1: [44], A2: [44], A3: [44, 45], A4: [45], B5: [45], B6: [46], B7: [46], B8: [46] }
const AIDS_TABLES = [
  { label: 'Table 12.3', what: 'negative-moment coefficients', ref: 'sl-t123' },
  { label: 'Table 12.4', what: 'DL positive-moment coefficients', ref: 'sl-t124' },
  { label: 'Table 12.5', what: 'LL positive-moment coefficients', ref: 'sl-t125' },
  { label: 'Table 12.6', what: 'load ratio Wa / Wb', ref: 'sl-t126' },
]
const AID_ACI = { label: 'ACI moment coefficients', what: 'summary panels (a)–(d)', ref: 'sl-aci' }

// ================================================================ figures
const Fig1 = () => <RectSec b={12} h={28} rows={[{ y: 25, n: 3, db: 1.27, label: '3 #10' }]} left={[{ y1: 0, y2: 25, label: 'd = 25″' }]} right={[{ y1: 0, y2: 28, label: '28″' }]} title="Fig. 1" />
const Fig2 = () => <TFloor hf={3} bw={12} sp={48} n={3} h={24} d={21} rows={2} dAt={2} notes={['Beam span = 25 ft · Mu = 550 kip-ft', 'Fig. 2']} />
const Fig3 = () => (
  <RectSec
    b={14}
    h={31}
    rows={[
      { y: 2.5, n: 4, db: 1, label: '4 #8 bars' },
      { y: 25.5, n: 4, db: 1, label: '8 #8 bars' },
      { y: 28.5, n: 4, db: 1 },
    ]}
    right={[
      { y1: 0, y2: 27, label: 'd = 27″' },
      { y1: 0, y2: 2.5, label: '2.5″', lvl: 1 },
    ]}
    title="Fig. 3 — dt = 28.5″ (h not dimensioned)"
  />
)
const Fig4 = () => (
  <div className="flex flex-wrap items-end justify-center gap-4">
    <div className="flex-1 min-w-[18rem]">
      <SSBeam L={20} udl={['Service live load = 2 kip/ft', 'Unfactored superimposed dead load = 1.0 kip/ft (excluding self-wt of beam)']} note="Fig. 4" />
    </div>
    <div className="w-40">
      <RectSec b={12} h={24} rows={[]} right={[{ y1: 0, y2: 24, label: 'h = 24″' }]} s={5} title="Section A-A" />
    </div>
  </div>
)
const Fig5 = () => (
  <RectSec
    b={14}
    h={28}
    rows={[
      { y: 22.5, n: 4, db: 1.128, label: '8 #9 bars' },
      { y: 25.5, n: 4, db: 1.128 },
    ]}
    right={[{ y1: 0, y2: 24, label: 'd = 24″' }]}
    title="Fig. 5 — dt = 25.5″"
  />
)
/** Fig. 6 — S-1 (two-way), S-2 / S-3 (one-way) on 10″ brick walls, beam B1 */
function Fig6({ hl }: { hl?: 'S1' | 'S23' | 'B1' }) {
  const k = 8
  const w = 10 / 12
  const x0 = 70
  const y0 = 40
  const X = (ft: number) => x0 + ft * k
  const ys = [0, w, w + 18, 2 * w + 18, 2 * w + 29, 2 * w + 30, 2 * w + 41, 3 * w + 41] // wall/slab boundaries
  const Y = (ft: number) => y0 + ft * k
  const Wt = 24 + 2 * w
  const W = X(Wt) + 140
  const H = Y(ys[7]) + 50
  const wall = (x: number, y: number, wd: number, ht: number, key: string) => <rect key={key} x={X(x)} y={Y(y)} width={wd * k} height={ht * k} fill={C.mute} opacity={0.45} stroke={C.ink} strokeWidth={0.8} />
  const slab = (a: number, b: number, lbl: string, on: boolean) => (
    <g key={lbl}>
      <rect x={X(w)} y={Y(a)} width={24 * k} height={(b - a) * k} fill={C.conc} />
      {on && <rect x={X(w)} y={Y(a)} width={24 * k} height={(b - a) * k} fill={C.accent} opacity={0.15} />}
      <T x={X(Wt / 2)} y={Y((a + b) / 2)}>
        {lbl} · thickness = 6″
      </T>
    </g>
  )
  return (
    <Svg w={W} h={H}>
      {slab(ys[1], ys[2], 'S-1', hl === 'S1')}
      {slab(ys[3], ys[4], 'S-2', hl === 'S23')}
      {slab(ys[5], ys[6], 'S-3', hl === 'S23')}
      <rect x={X(w)} y={Y(ys[4])} width={24 * k} height={k} fill={hl === 'B1' ? C.load : C.conc} opacity={hl === 'B1' ? 0.5 : 1} stroke={C.ink} strokeDasharray="2 2" />
      <T x={X(Wt) + 8} y={Y(ys[4] + 0.5)} a="start" s={11}>
        BEAM B1 (12″ × 18″)
      </T>
      {wall(0, 0, Wt, w, 'top')}
      {wall(0, ys[2], Wt, w, 'mid')}
      {wall(0, ys[6], Wt, w, 'bot')}
      {wall(0, 0, w, ys[7], 'l')}
      {wall(24 + w, 0, w, ys[7], 'r')}
      <T x={X(Wt) + 8} y={Y(w / 2)} a="start" s={11}>
        10″ BRICK WALL
      </T>
      <DimChain xs={[X(0), X(w), X(24 + w), X(Wt)]} y={y0 - 14} labels={['', "24'-0\"", '']} />
      {[
        [ys[1], ys[2], "18'-0\""],
        [ys[3], ys[4], "11'-0\""],
        [ys[4], ys[5], "1'-0\""],
        [ys[5], ys[6], "11'-0\""],
      ].map(([a, b, l]) => (
        <DimV key={String(l) + a} x={x0 - 16} y1={Y(a as number)} y2={Y(b as number)} label={l as string} side="l" />
      ))}
      <T x={X(Wt / 2)} y={H - 14} w={600}>
        Fig. 6 (walls 10″ thick)
      </T>
    </Svg>
  )
}
const Fig7 = () => <SSBeam L={30} segs={[15, 15]} udl={['2.0 kip/ft (including self-wt.)']} points={[{ x: 15, label: '40 kip' }]} note="ALL LOADS ARE FACTORED — Fig. 7" />

// ================================================================ data
const E1c: ElasticInput = { b: 12, h: 28, d: 25, As: 3.81, fc: 4000, n: 8 }
const P2c: DoublyDesignIn = { b: 12, d: 21, dt: 22.5, dp: 2.5, fc: 3, fy: 60, Mu: 475 }
const B3a: BeffIn = { kind: 'interior', L: 25, bw: 12, hf: 3, cc: 48 }
const T3a = (beff: number) => ({ Mu: 550, beff, bw: 12, hf: 3, d: 21, dt: 22, fc: 3, fy: 60 })
const P3b: DoublyReviewIn = { b: 14, d: 27, dt: 28.5, dp: 2.5, As: 6.32, Asp: 3.16, fc: 3.5, fy: 60 }
const L4a: LoadInput = { span: 20, support: 'ss', b: 12, h: 24, sdl: 1.0, ll: 2.0 }
const I4b: SinglyInput = { b: 14, fc: 5000, fy: 60000, layers: [ { As: 4, d: 22.5 }, { As: 4, d: 25.5 } ] }
const S5a: TwoWayInput = { lx: 24, ly: 18, edges: { top: false, bottom: true, left: false, right: false }, h: 6, ll: 60, ff: 25, pw: 50, fc: 3500, fy: 60000 }
const S6a: OneWayCoefInput = { spans: [11, 11], ends: ['unrestrained', 'unrestrained'], h: 6, ll: 60, ff: 25, pw: 50, fc: 3500, fy: 60000 }

/** Q7(a): B1 carries 1.15 wu ln/2 from S-2 and from S-3 plus its web; span = c/c of the walls */
function b1() {
  const o = oneWayCoef(S6a)
  const wuk = o.loads.wuk
  const R1 = (1.15 * wuk * 11) / 2
  const web = ((12 * (18 - 6)) / 144) * 0.15
  const w = 2 * R1 + 1.2 * web
  const L = 24 + 10 / 12
  const Mu = (w * L * L) / 8
  const p: DoublyDesignIn = { b: 12, d: 15, dt: 15, dp: 2.5, fc: 3.5, fy: 60, Mu }
  return { wuk, R1, web, w, L, Mu, p }
}
const L8a = () => beamLoads({ span: 30, support: 'ss', sdl: 2.0, ll: 0, points: [{ D: 40, L: 0, x: 15 }], factored: true })
const O8a = () => ({ L: 30, b: 12, k: 0.6, fc: 4000, fy: 60000, MuFixed: L8a().Mu })
let k8Cache: ReturnType<typeof kRhoDesign> | undefined
const k8 = () => (k8Cache ??= kRhoDesign(O8a()))
const bm8b: ShearBeam = { kind: 'ss', L: 30, wD: 2.0, P: [{ x: 15, P: 40 }], factored: true }
const sec8b = (): ShearSection => ({ bw: 12, d: k8().sec.dAct, fc: 4000, fy: 60000 })

// ================================================================ questions
export const R2015: RcQ[] = [
  {
    id: 'rc-2015-16-1a',
    paper: '2015-16',
    sec: 'A',
    no: '1(a)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Sources of uncertainty and how USD provides safety',
    pages: PG.A1,
    theory: true,
    text: 'What are the sources of uncertainties in analysis, design and construction of RC structure? Discuss how safety is ensured against these uncertainties in USD method.',
    solution: () => <AnsMd a={ANS.uncertainty} />,
  },
  {
    id: 'rc-2015-16-1b',
    paper: '2015-16',
    sec: 'A',
    no: '1(b)',
    marks: 8,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Beam behaviour under increasing load: uncracked, cracked, ultimate',
    pages: PG.A1,
    theory: true,
    text: 'Discuss the behavior of RC rectangular beam in flexure under increasing load by drawing neat sketches for strain and stress distribution of uncracked, cracked and ultimate conditions.',
    solution: () => <AnsMd a={ANS.behaviour} fig={<StagesFig />} />,
  },
  // solve: Mcr (uncracked transformed, n = 8) and cracked stresses at M = 100 k-ft
  {
    id: 'rc-2015-16-1c',
    paper: '2015-16',
    sec: 'A',
    no: '1(c)',
    marks: 20,
    topics: ['rc-elastic'],
    title: 'Mcr and stresses at M = 100 kip-ft (12 × 28, 3 #10)',
    pages: [44, 47],
    text: r`A singly reinforced RC beam section, as shown in Fig. 1, has a width of 12 in., effective depth of 25 in. and total depth of 28 in. The tension reinforcement consists of three No. 10 bars in one row.

Given: $f'_c = 4$ ksi and $f_y = 60$ ksi, $f_s = 24$ ksi, $f_r = 7.5\sqrt{f'_c}$ psi, $n = 8$. Find:
- (i) Cracking moment (10)
- (ii) Stresses in concrete and steel caused by bending moment $M = 100$ kip-ft (10)`,
    given: [],
    figure: Fig1,
    checks: () => {
      const u = uncracked(E1c)
      const e = elasticAt(E1c, 100)
      return [
        { key: 'mcr', label: '(i) Cracking moment (transformed section)', value: u.Mcr, unit: 'k-ft' },
        { key: 'fc', label: '(ii) concrete stress at M = 100 k-ft', value: e.fc * 1000, unit: 'psi' },
        { key: 'fs', label: '(ii) steel stress at M = 100 k-ft', value: e.fs * 1000, unit: 'psi' },
      ]
    },
    solution: () => <ElasticAtSol inp={E1c} Ms={[100]} fcAllow={1.8} fsAllow={24} />,
    notes: ['Mcr on the gross section is about 62 kip-ft, on the transformed section a little higher; either way M = 100 kip-ft is cracked.'],
  },
  {
    id: 'rc-2015-16-2a',
    paper: '2015-16',
    sec: 'A',
    no: '2(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Purpose of minimum flexural steel; ACI/BNBC ρmin',
    pages: PG.A2,
    theory: true,
    text: 'What is the purpose of providing minimum amount of flexural steel in beam? Write ACI/BNBC code provisions for minimum reinforcement ratios.',
    solution: () => <AnsMd a={ANS.minSteel} />,
  },
  {
    id: 'rc-2015-16-2b',
    paper: '2015-16',
    sec: 'A',
    no: '2(b)',
    marks: 10,
    topics: ['rc-singly'],
    title: 'εt = 0.004 through ρmax; φ against εt',
    pages: PG.A2,
    theory: true,
    text: r`Discuss how a minimum tensile strain ($\varepsilon_t = 0.004$) at failure is ensured by not exceeding maximum reinforcement ratio. Also discuss the variation of $\phi$ with $\varepsilon_t$ as given in ACI/BNBC code.`,
    solution: () => <AnsMd a={ANS.rhoMax} fig={<PhiChart />} />,
  },
  // solve: doubly design, 12 × 25 fixed, Mu = 475 k-ft, f'c = 3 ksi
  {
    id: 'rc-2015-16-2c',
    paper: '2015-16',
    sec: 'A',
    no: '2(c)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Size-restricted 12 × 25 section for Mu = 475 kip-ft (f′c = 3 ksi)',
    pages: PG.A2,
    text: r`A beam section is limited to width $b = 12$ in. and total depth $h = 25$ in. Calculate the required reinforcement if the beam has to resist a factored moment $M_u = 475$ kip-ft. Assume two layer tensile reinforcement with $d = 21$ in. and $d_t = 22.5$ in. Also assume $d' = 2.5$ in. if compression steel is required.

Given: $f'_c = 3$ ksi, $f_y = 60$ ksi.`,
    given: [],
    checks: () => {
      const g = designDoubly(P2c)
      return [
        { key: 'm1', label: 'φMn of the largest singly reinforced section', value: g.sm.phiMn1, unit: 'k-ft' },
        { key: 'asp', label: "Compression steel $A'_s$", value: g.Asp, unit: 'in²', tol: 0.03 },
        { key: 'as', label: 'Tension steel $A_s$', value: g.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => <DoublyDesignSol p={P2c} />,
  },
  // solve: T-beam design — beff, flange-alone check (borderline), Asf + Asw, As,min and εt
  {
    id: 'rc-2015-16-3a',
    paper: '2015-16',
    sec: 'A',
    no: '3(a)',
    marks: 15,
    topics: ['rc-tbeam'],
    title: 'T-beam midspan steel for Mu = 550 kip-ft (borderline true T)',
    pages: [44, 47],
    text: r`A floor system consists of a 3 in. slab supported by continuous T-beams with 25 ft span, 48 in. on centres as shown in Fig. 2. Web dimensions as determined by negative moment requirements at support are $b_w = 12$ in. and $d = 21$ in. What tensile reinforcement is required at midspan to resist a factored moment $M_u = 550$ kip-ft? Also, check minimum reinforcement and $\varepsilon_t$.

Given: $f'_c = 3$ ksi, $f_y = 60$ ksi.`,
    given: [],
    figure: Fig2,
    checks: () => {
      const b = effectiveWidth(B3a).b
      const { t } = tDesignSteps(T3a(b))
      return [
        { key: 'beff', label: 'Effective flange width', value: b, unit: 'in' },
        { key: 'pf', label: 'φMn with the whole flange stressed', value: t.phiMnFlange, unit: 'k-ft' },
        { key: 'as', label: 'Required $A_s$', value: t.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => {
      const { o, s } = beffSteps(B3a)
      const { t, s: s2 } = tDesignSteps(T3a(o.b))
      return (
        <Sol>
          <Note>Two rows of bars (Fig. 2): d = 21 in to the centroid, dt = 22 in assumed for εt.</Note>
          <SolSteps steps={[...s, ...s2]} />
          <Ans>{`$b_{eff} = ${f(o.b)}$ in; $\\phi M_{n,flange} = ${f(t.phiMnFlange, 1)} < 550$ k-ft → true T: $A_{sf} = ${f(t.Asf)}$, $A_{sw} = ${f(t.Asw)}$, **$A_s = ${f(t.As)}$ in²**; $\\varepsilon_t = ${f(t.epsT, 4)}$ ✓, $A_{s,min} = ${f(t.AsMin)}$ in² ✓.`}</Ans>
        </Sol>
      )
    },
    notes: ['Printed "bw = 12." (inch mark missing). beff = min(L/4, bw + 16hf, c/c) = 48 in.'],
  },
  // solve: doubly review — A's does not yield (quadratic), εt, φMn
  {
    id: 'rc-2015-16-3b',
    paper: '2015-16',
    sec: 'A',
    no: '3(b)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Doubly reinforced review: 8 #8 / 4 #8, check f′s and εt',
    pages: [45, 47],
    text: r`A rectangular RC beam as shown in Fig. 3 measures 14 in. wide and has an effective depth of 27 in. Tension steel consists of eight No. 8 bars in two layers ($d = 27$ in., $d_t = 28.5$ in.) and compression steel consists of four No. 8 bars located 2.5 in. from the compression face. What is the design moment capacity of the beam according to ACI/BNBC code? Check for yielding of compression steel and $\varepsilon_t$.

Given: $f'_c = 3.5$ ksi, $f_y = 60$ ksi.`,
    given: [],
    figure: Fig3,
    checks: () => {
      const g = reviewDoubly(P3b)
      return [
        { key: 'c', label: 'Neutral-axis depth c', value: g.c, unit: 'in' },
        { key: 'fsp', label: "Compression-steel stress $f'_s$", value: g.fsp, unit: 'ksi', tol: 0.03 },
        { key: 'pmn', label: 'Design moment capacity $\\phi M_n$', value: g.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => <DoublyReviewSol p={P3b} />,
  },
  // solve: design As, fixed 12 × 24, SS 20 ft, SDL 1.0 + sw, LL 2.0, f'c = 3 ksi
  {
    id: 'rc-2015-16-4a',
    paper: '2015-16',
    sec: 'A',
    no: '4(a)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Design As for a 12 × 24 beam, 20 ft simple span (f′c = 3 ksi)',
    pages: [45, 48],
    text: r`A rectangular beam carries a service live load (unfactored) of 2.0 kip/ft and an unfactored superimposed dead load of 1.0 kip/ft (in addition to self-weight of beam) on a 20 ft simple span as shown in Fig. 4. The beam will have a cross-section of 12″ × 24″ for architectural reason. Design the beam for flexure using USD method.

Given: $f'_c = 3.0$ ksi, $f_y = 60$ ksi.`,
    given: [],
    figure: Fig4,
    checks: () => {
      const g = fixedDesign(L4a, 12, 21.5, 3000, 60000)
      return [
        { key: 'mu', label: 'Design moment $M_u$', value: g.L.Mu, unit: 'k-ft' },
        { key: 'as', label: 'Required $A_s$ (d = 21.5 in)', value: g.D.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => <FixedDesignSol load={L4a} b={12} d={21.5} fc={3000} fy={60000} note="d = 24 − 2.5 = 21.5 in assumed (one layer)." />,
  },
  // solve: singly review, two rows — a, c, εt (transition), φ, Mn, φMn
  {
    id: 'rc-2015-16-4b',
    paper: '2015-16',
    sec: 'A',
    no: '4(b)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Mn and φMn of 14 × d24 with 8 #9 (transition zone)',
    pages: [45, 48],
    text: r`A rectangular beam has width 14 in. and effective depth 24 in. as shown in Fig. 5. It is reinforced with eight No. 9 bars in two rows ($d = 24''$, $d_t = 25.5''$). What is the nominal flexural strength $M_n$ and what is the maximum moment $\phi M_n$ that can be utilized in the design?

Given: $f'_c = 5.0$ ksi, $f_y = 60$ ksi.`,
    given: [],
    figure: Fig5,
    checks: () => {
      const g = review(I4b)
      return [
        { key: 'et', label: 'Net tensile strain εt', value: g.epsT, tol: 0.03 },
        { key: 'mn', label: 'Nominal strength $M_n$', value: g.Mn, unit: 'k-ft' },
        { key: 'pmn', label: 'Design strength $\\phi M_n$', value: g.phiMn, unit: 'k-ft', tol: 0.03 },
      ]
    },
    solution: () => <SinglyReviewSol inp={I4b} />,
  },
  {
    id: 'rc-2015-16-4c',
    paper: '2015-16',
    sec: 'A',
    no: '4(c)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Under- vs over-reinforced beams: which is preferable',
    pages: PG.A4,
    theory: true,
    text: 'What is the difference between under-reinforced and over-reinforced beam? Which one is preferable and why?',
    solution: () => <AnsMd a={ANS.underOver} />,
  },
  // solve: two-way S-1 on brick walls (18 × 24 clear, h = 6) — Case 6, coefficient tables, strips
  {
    id: 'rc-2015-16-5a',
    paper: '2015-16',
    sec: 'B',
    no: '5(a)',
    marks: 20,
    topics: ['rc-twoway'],
    title: 'Two-way slab S-1 (18′ × 24′ clear) on 10″ brick walls',
    pages: [45, 49, 50, 51],
    text: r`Fig. 6 shows the slab system of a building. Design the two-way slab "S-1" of Fig. 6 which is supported on 10″ brick wall. The slab is to carry a service live load (LL) of 60 psf in addition to its self-weight. Assume floor finish (FF) load of 25 psf and partition wall (PW) load of 50 psf.

Given: slab thickness = 6″; $f'_c = 3.5$ ksi and $f_y = 60$ ksi. Use moment co-efficient method. Show the reinforcements with neat sketches.`,
    given: AIDS_TABLES,
    figure: () => <Fig6 hl="S1" />,
    checks: () => {
      const t = twoWay(S5a)
      return [
        { key: 'm', label: 'm = la/lb', value: t.m },
        { key: 'ma', label: 'Short-direction positive moment', value: t.M.aPos, unit: 'k-ft/ft' },
        { key: 'mn', label: 'Short-direction negative moment at the continuous edge', value: t.M.aNeg ?? 0, unit: 'k-ft/ft' },
      ]
    },
    solution: () => <TwoWaySol p={S5a} note="S-1 is taken continuous with S-2 across the interior wall (one long edge continuous → Case 6), as the slab-solutions PDF does. If the wall is treated as a simple support, all edges are discontinuous (Case 1)." />,
    notes: ['The case hinges on whether S-1 is continuous with S-2 across the interior 10″ wall: Case 6 (used) or Case 1.'],
  },
  {
    id: 'rc-2015-16-5b',
    paper: '2015-16',
    sec: 'B',
    no: '5(b)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Class A and class B tension splices',
    pages: PG.B5,
    theory: true,
    text: 'Explain briefly the class A and class B splices for tension rebars.',
    solution: () => <AnsMd a={ANS.classAB} />,
  },
  {
    id: 'rc-2015-16-5c',
    paper: '2015-16',
    sec: 'B',
    no: '5(c)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Factors affecting development length',
    pages: PG.B5,
    theory: true,
    text: 'Describe in brief the factors which affect the development length of tension rebars.',
    solution: () => <AnsMd a={ANS.ldFactors} />,
  },
  // solve: two-span one-way slab S-2/S-3 over B1, brick-wall ends: +1/11, −1/9; bars, T&S
  {
    id: 'rc-2015-16-6a',
    paper: '2015-16',
    sec: 'B',
    no: '6(a)',
    marks: 20,
    topics: ['rc-oneway'],
    title: 'One-way slabs S-2 and S-3 over beam B1 (ACI coefficients)',
    pages: [46, 49, 52],
    text: r`Design the one-way slabs S-2 and S-3 of Fig. 6.

Given: slab thickness = 6″; LL = 60 psf; FF = 25 psf; PW = 50 psf; $f'_c = 3.5$ ksi and $f_y = 60$ ksi. Use ACI moment co-efficients and show the reinforcements in plan and section.`,
    given: [AID_ACI],
    figure: () => <Fig6 hl="S23" />,
    checks: () => {
      const o = oneWayCoef(S6a)
      const s1 = o.sections.find((s) => s.id === 's1')!
      const p0 = o.sections.find((s) => s.id === 'p0')!
      return [
        { key: 'wu', label: 'Factored load $w_u$', value: o.loads.wu, unit: 'psf' },
        { key: 'mn', label: 'Mu over beam B1 (−1/9)', value: s1.Mu, unit: 'k-ft/ft' },
        { key: 'mp', label: 'Mu at midspan (+1/11)', value: p0.Mu, unit: 'k-ft/ft' },
      ]
    },
    solution: () => <OneWaySol p={S6a} note="Two spans of 11 ft clear, continuous over B1, outer ends on brick walls (unrestrained): +1/11 in the spans, −1/9 over B1." />,
    notes: ['The north edge of S-2 is the interior wall shared with S-1, so some continuity is possible there; treated as unrestrained, as in the slab-solutions PDF.'],
  },
  {
    id: 'rc-2015-16-6b',
    paper: '2015-16',
    sec: 'B',
    no: '6(b)',
    marks: 9,
    topics: ['rc-oneway'],
    title: 'Why T&S steel in one-way slabs; ACI/BNBC ratios',
    pages: PG.B6,
    theory: true,
    text: 'Why temperature and shrinkage reinforcements are required in one-way slab? What are the ACI/BNBC recommended ratios for such steel?',
    solution: () => <AnsMd a={ANS.ts} />,
  },
  {
    id: 'rc-2015-16-6c',
    paper: '2015-16',
    sec: 'B',
    no: '6(c)',
    marks: 6,
    topics: ['rc-oneway', 'rc-basics'],
    title: 'Why a minimum slab thickness is essential',
    pages: PG.B6,
    theory: true,
    text: 'Why is it essential to provide minimum thickness for slabs?',
    solution: () => (
      <AnsMd
        a={r`- **Deflection control without calculation.** A slab chosen only for strength can be very thin and deflect excessively; the code's minimum thickness keeps deflections within limits so they need not be computed.
- **Long-term deflection** (creep, shrinkage) keeps growing for years; excessive sag cracks partitions and finishes (limit ≈ span/480 with sensitive partitions), causes ponding, misaligns doors/windows and looks unsafe.
- **Vibration**: a thin, flexible slab is lively and uncomfortable; stiffness reduces vibration.
- **Shear and punching**: slabs rarely get stirrups, so the concrete alone must carry shear — enough depth is needed.
- **Practical reasons**: room for two layers of bars plus ¾ in cover, embedded conduits, fire resistance.
- ACI one-way values ($f_y = 60$ ksi, normal weight): simply supported $l/20$, one end continuous $l/24$, both ends continuous $l/28$, cantilever $l/10$; multiply by $(0.4 + f_y/100\,000)$ for other $f_y$. Two-way: $h = l_n(0.8 + f_y/200\,000)/(36 + 9\beta) \ge 3.5$ in (with stiff beams).`}
      />
    ),
  },
  // solve: B1 simply supported carrying slab reactions — wu, Mu, doubly design (h = 18, d = 15, d' = 2.5)
  {
    id: 'rc-2015-16-7a',
    paper: '2015-16',
    sec: 'B',
    no: '7(a)',
    marks: 20,
    topics: ['rc-doubly'],
    title: 'Beam B1 under slab load, depth limited to 18 in',
    pages: [46, 49],
    text: r`Determine the tension steel (and compression steel, if required) for the simply supported beam B1 as shown in Fig. 6. The beam B1 is to carry the load from slab given in question 7(a) above [read: 6(a)]. The total depth of the beam is restricted to 18″ from architectural considerations.

Given: $b = 12''$; $f'_c = 3.5$ ksi and $f_y = 60$ ksi. Assume $d = 15''$ and $d' = 2.5''$.`,
    given: [],
    figure: () => <Fig6 hl="B1" />,
    checks: () => {
      const g = b1()
      const dd = designDoubly(g.p)
      return [
        { key: 'w', label: 'Factored line load on B1', value: g.w, unit: 'k/ft', tol: 0.03 },
        { key: 'mu', label: 'Design moment $M_u$', value: g.Mu, unit: 'k-ft', tol: 0.03 },
        { key: 'asp', label: "Compression steel $A'_s$", value: dd.Asp, unit: 'in²', tol: 0.05 },
        { key: 'as', label: 'Tension steel $A_s$', value: dd.As, unit: 'in²', tol: 0.04 },
      ]
    },
    solution: () => {
      const g = b1()
      const { g: dd, s } = doublyDesignSteps(g.p)
      return (
        <Sol>
          <Note>Each slab delivers the ACI end-span shear at the first interior support, 1.15wu ln/2; B1 spans between the 10″ walls, taken c/c = 24′-10″. dt = d = 15 in used for εt (conservative).</Note>
          <SolSteps
            steps={[
              st('Slab load (from 6a)', `w_u = ${f(g.wuk * 1000, 1)}\\text{ psf};\\quad \\text{reaction per slab } 1.15\\frac{w_ul_n}{2} = 1.15\\frac{${f(g.wuk, 3)}(11)}{2} = ${f(g.R1)}\\text{ k/ft}`),
              st('Beam web self-weight', `\\frac{12(18 - 6)}{144}(0.150) = ${f(g.web)}\\text{ k/ft} \\Rightarrow 1.2(${f(g.web)}) = ${f(1.2 * g.web)}\\text{ k/ft}`),
              st('Total and moment', `w_u = 2(${f(g.R1)}) + ${f(1.2 * g.web)} = ${f(g.w)}\\text{ k/ft},\\quad M_u = \\frac{w_uL^2}{8} = \\frac{${f(g.w)}(${f(g.L, 3)})^2}{8} = ${f(g.Mu, 1)}\\text{ k-ft}`),
              ...s,
            ]}
          />
          <Ans>{`$M_u = ${f(g.Mu, 1)}$ k-ft > singly limit ${f(dd.sm.phiMn1, 1)} k-ft → $A'_s = ${f(dd.Asp)}$ in² (**${barTxt(dd.comp?.n ?? 0, dd.comp?.no ?? 0)}**), $A_s = ${f(dd.As)}$ in² (**${barTxt(dd.tension.n, dd.tension.no)}**, ${dd.tension.layers} layers).`}</Ans>
        </Sol>
      )
    },
    notes: ['Printed typo: "question 7(a) above" means 6(a). Tributary-width (≈ 12 ft) loading or clear-span basis are acceptable alternatives.'],
  },
  {
    id: 'rc-2015-16-7b',
    paper: '2015-16',
    sec: 'B',
    no: '7(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Cut-off and bend points, nearly equal spans with UDL',
    pages: PG.B7,
    theory: true,
    text: 'Show with neat sketches the location of bar cut-off and bent points for beams for nearly equal span and uniformly distributed load.',
    solution: () => <AnsMd a={ANS.cutoff} fig={<CutoffFig />} />,
  },
  {
    id: 'rc-2015-16-7c',
    paper: '2015-16',
    sec: 'B',
    no: '7(c)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Why concrete cover matters; code values for beams and slabs',
    pages: PG.B7,
    theory: true,
    text: 'Why is concrete cover over rebar important? What are the code recommended values of cover for beams and slabs?',
    solution: () => <AnsMd a={ANS.cover} />,
  },
  // solve: design h and As with ρ = 0.6ρmax, Mu = wuL²/8 + PuL/4 (factored)
  {
    id: 'rc-2015-16-8a',
    paper: '2015-16',
    sec: 'B',
    no: '8(a)',
    marks: 17,
    topics: ['rc-singly'],
    title: 'Total depth and steel with ρ = 0.6ρmax (30 ft, 40 k + 2.0 k/ft)',
    pages: [46, 49],
    text: r`Determine the total depth and tensile reinforcement for the simply supported beam shown in Fig. 7. All loads are factored. Assume $b = 12''$; $\rho = 0.6\rho_{max}$; $f'_c = 4$ ksi and $f_y = 60$ ksi.

(Fig. 7: span 15′-0″ + 15′-0″; 40 kip at midspan; 2.0 kip/ft including self-weight.)`,
    given: [],
    figure: Fig7,
    checks: () => {
      const g = k8()
      return [
        { key: 'mu', label: 'Design moment $M_u$', value: g.Mu, unit: 'k-ft' },
        { key: 'd', label: 'Required effective depth d', value: g.sec.d, unit: 'in', tol: 0.03 },
        { key: 'h', label: 'Total depth h (rounded)', value: g.sec.h, unit: 'in', tol: 0.04 },
        { key: 'as', label: 'Tension steel $A_s$', value: g.D.As, unit: 'in²', tol: 0.04 },
      ]
    },
    solution: () => (
      <Sol>
        <SolSteps steps={L8a().steps} />
        <KRhoSol o={O8a()} />
      </Sol>
    ),
  },
  // solve: stirrups for the 8(a) beam, 3 sets of spacing, Pu = 40 k at midspan + 2.0 k/ft
  {
    id: 'rc-2015-16-8b',
    paper: '2015-16',
    sec: 'B',
    no: '8(b)',
    marks: 18,
    topics: ['rc-shear'],
    title: 'Stirrups, 3 sets: 30 ft beam, 40 k at midspan + 2.0 k/ft',
    pages: [46, 49],
    text: r`Design the stirrups for the beam shown in Fig. 7. Calculate the stirrups with 3 sets of spacing. Show the stirrups in a neat sketch.

(Fig. 7: span 30 ft, $P_u = 40$ kip at midspan, $w_u = 2.0$ kip/ft including self-weight, all factored; $b = 12''$, $d$ from Q8(a); $f'_c = 4$ ksi, $f_y = 60$ ksi.)`,
    given: [],
    figure: Fig7,
    checks: () => {
      const { R, at, g } = shearKey(bm8b, sec8b())
      return [
        { key: 'vd', label: 'Vu at d from the support', value: R.Vd, unit: 'k' },
        { key: 'pvc', label: 'φVc', value: g.lim.phiVc, unit: 'k' },
        { key: 's', label: 'Required spacing at the critical section', value: at.s, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => <ShearSol bm={bm8b} sec={sec8b()} note={`d = ${f(k8().sec.dAct)} in from Q8(a).`} />,
    notes: ['Vu,max = 50 kip at the support; depends on the d chosen in Q8(a).'],
  },
]
