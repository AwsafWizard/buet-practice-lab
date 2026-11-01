// 2016-17 term final (held 19 Aug 2017), PDF pp. 36–43 (phone photos; p40 = clear re-photo of Figs 1–2).
// Attached: Nilson Tables 12.3–12.6 (pp. 41–42) and the ACI moment-coefficient summary (p. 43).
import type { RcQ } from '../../types'
import { SolSteps } from '../../topics/elastic/ui'
import { f, uncracked, allowableMoment, type ElasticInput } from '../../engine/elastic'
import { designAs, pickBars as pickBarsS, review, limits, type LoadInput, type SinglyInput } from '../../engine/singly'
import { designDoubly, reviewDoubly, type DoublyDesignIn, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, floorLoads, type BeffIn } from '../../engine/tbeam'
import { oneWayCoef, type OneWayCoefInput } from '../../engine/oneway'
import { twoWay, type TwoWayInput } from '../../engine/twoway'
import { wu as wuOf } from '../../engine/materials'
import type { ShearBeam, ShearSection } from '../../engine/shear'
import {
  ANS,
  AnsMd,
  Ans,
  barTxt,
  beffSteps,
  C,
  CutoffFig,
  DimChain,
  DimV,
  DoublyDesignSol,
  DoublyReviewSol,
  fixedDesign,
  FixedDesignSol,
  Hd,
  HoopFig,
  LdSol,
  ldRow,
  Ln,
  McrAllowSol,
  Note,
  OneWaySol,
  RectSec,
  r,
  shearKey,
  ShearSol,
  Sol,
  SSBeam,
  st,
  Svg,
  T,
  Tbl,
  tDesignSteps,
  TwoWaySol,
} from './r2017'

const PG = { A1: [36], A2: [36], A3: [36], A4: [37], B: [37], B8: [38] }
const AIDS_TABLES = [
  { label: 'Table 12.3', what: 'negative-moment coefficients', ref: 'sl-t123' },
  { label: 'Table 12.4', what: 'DL positive-moment coefficients', ref: 'sl-t124' },
  { label: 'Table 12.5', what: 'LL positive-moment coefficients', ref: 'sl-t125' },
  { label: 'Table 12.6', what: 'load ratio Wa / Wb', ref: 'sl-t126' },
]
const AID_ACI = { label: 'ACI moment coefficients', what: 'summary panels (a)–(d)', ref: 'sl-aci' }

// ================================================================ figures
/** Fig. 1 — floor of the CE building: B1 on column lines, B2 midway, B3/B4 N–S girders */
function FloorPlan({ noB2, hl }: { noB2?: boolean; hl?: 'slab' | 'B1' | 'panel' }) {
  const k = 7
  const x0 = 76
  const y0 = 24
  const X = (ft: number) => x0 + ft * k
  const Y = (ft: number) => y0 + (ft + 3) * k // B2 top line at ft = 0
  const W = X(60) + 30
  const H = Y(53) + 60
  const b1 = [12.5, 37.5]
  const b2 = noB2 ? [] : [0, 25, 50]
  const beam = (y: number, label: string, key: string, strong?: boolean) => (
    <g key={key}>
      <Ln x1={X(0)} y1={Y(y) - 2} x2={X(60)} y2={Y(y) - 2} c={strong ? C.load : C.mute} dash="6 3" w={strong ? 1.8 : 1} />
      <Ln x1={X(0)} y1={Y(y) + 2} x2={X(60)} y2={Y(y) + 2} c={strong ? C.load : C.mute} dash="6 3" w={strong ? 1.8 : 1} />
      <T x={X(15)} y={Y(y) - 9} s={11}>
        {label}
      </T>
    </g>
  )
  return (
    <Svg w={W} h={H}>
      <rect x={X(0)} y={Y(-3)} width={60 * k} height={56 * k} fill={C.conc} stroke={C.ink} />
      {hl === 'B1' && <rect x={X(0)} y={Y(37.5 - 6.25)} width={60 * k} height={12.5 * k} fill={C.load} opacity={0.12} />}
      {hl === 'panel' && <rect x={X(30)} y={Y(12.5)} width={30 * k} height={25 * k} fill={C.accent} opacity={0.14} />}
      {hl === 'slab' && <rect x={X(30)} y={Y(0)} width={30 * k} height={50 * k} fill={C.accent} opacity={0.08} />}
      {[0, 30, 60].map((x, i) => (
        <g key={x}>
          <Ln x1={X(x) - 2} y1={Y(-3)} x2={X(x) - 2} y2={Y(53)} c={C.mute} dash="6 3" />
          <Ln x1={X(x) + 2} y1={Y(-3)} x2={X(x) + 2} y2={Y(53)} c={C.mute} dash="6 3" />
          <T x={X(x) + (i === 2 ? -20 : 20)} y={Y(25) + (noB2 ? 0 : 12)} s={11}>
            {i === 1 ? 'B4' : 'B3'}
          </T>
        </g>
      ))}
      {b2.map((y, i) => beam(y, 'B2 (12″ × 30″)', 'b2' + i))}
      {b1.map((y, i) => beam(y, 'B1 (12″ × 30″)', 'b1' + i, hl === 'B1' && i === 1))}
      {b1.flatMap((y) =>
        [0, 30, 60].map((x) => <rect key={`${x}-${y}`} x={X(x) - 7} y={Y(y) - 7} width={14} height={14} fill={C.mute} stroke={C.ink} />),
      )}
      {/* break marks top and bottom */}
      {[Y(-3), Y(53)].map((y, i) => (
        <g key={i}>
          {[15, 45].map((x) => (
            <path key={x} d={`M ${X(x) - 6} ${y} l 3 -6 l 3 12 l 3 -6`} fill="none" stroke={C.ink} />
          ))}
        </g>
      ))}
      {!noB2 && (
        <>
          <T x={X(45)} y={Y(6.25)} s={11} c={C.accent}>
            ONE-WAY SLAB, 11′-6″ clear
          </T>
          <DimV x={X(52)} y1={Y(0) + 2} y2={Y(12.5) - 2} label="11′-6″" side="r" />
        </>
      )}
      {hl === 'panel' && (
        <T x={X(45)} y={Y(25)} s={11} c={C.accent}>
          two-way panel 25′ × 30′ (c/c)
        </T>
      )}
      {hl === 'B1' && (
        <T x={X(45)} y={Y(44.5)} s={11} c={C.load}>
          B1 tributary width 12′-6″
        </T>
      )}
      <T x={X(30) + 16} y={Y(12.5) + 14} s={11} a="start" c={C.mute}>
        column 24″ × 24″
      </T>
      <g>
        <Ln x1={x0 - 30} y1={Y(0)} x2={x0 - 30} y2={Y(50)} c={C.mute} />
        {(noB2 ? [12.5, 37.5] : [0, 12.5, 37.5, 50]).map((y, i, a) =>
          i < a.length - 1 ? (
            <g key={y}>
              <DimV x={x0 - 30} y1={Y(y)} y2={Y(a[i + 1])} label={ftLbl(a[i + 1] - y)} side="l" />
            </g>
          ) : null,
        )}
      </g>
      <DimChain xs={[X(0), X(30), X(60)]} y={Y(53) + 22} labels={["30′-0″", "30′-0″"]} />
      <T x={W / 2} y={Y(53) + 44} w={600}>
        Fig. 1 (Floor slab of Civil Engineering Building){noB2 ? ' — B2 removed (Q2a)' : ''}
      </T>
    </Svg>
  )
}
const ftLbl = (ft: number) => `${Math.floor(ft)}′-${Math.round((ft % 1) * 12)}″`

const Fig1 = () => <FloorPlan hl="slab" />
const Fig1noB2 = () => <FloorPlan noB2 hl="panel" />
const Fig1B1 = () => <FloorPlan hl="B1" />
const Fig2 = () => <SSBeam L={30} segs={[15, 15]} udl={['2.0 kip/ft (including self-wt.)']} points={[{ x: 15, label: '50 kip' }]} note="ALL LOADS ARE FACTORED — Fig. 2" />
const Fig3 = () => (
  <RectSec
    b={12}
    h={27}
    rows={[{ y: 24, n: 4, db: 1.128, label: '4 #9 bars' }]}
    left={[{ y1: 0, y2: 27, label: '27 in' }]}
    right={[
      { y1: 0, y2: 24, label: '24 in' },
      { y1: 24, y2: 27, label: '3 in', lvl: 1 },
    ]}
    title="Fig. 3 — fy = 60,000 psi, f′c = 4,000 psi"
  />
)
const Fig4 = () => (
  <RectSec
    b={14}
    h={27}
    rows={[
      { y: 2.5, n: 2, db: 0.875, label: '2 #7 (1.20 in²)' },
      { y: 24, n: 4, db: 1.27, label: '4 #10 (5.06 in²)' },
    ]}
    left={[{ y1: 0, y2: 27, label: '27 in' }]}
    right={[
      { y1: 0, y2: 2.5, label: '2½ in', lvl: 1 },
      { y1: 2.5, y2: 24, label: '21½ in' },
      { y1: 24, y2: 27, label: '3 in', lvl: 1 },
    ]}
    title="Fig. 4"
  />
)
function Fig5() {
  const k = 7
  const x0 = 40
  const X = (ft: number) => x0 + ft * k
  const y0 = 20
  const Y = (ft: number) => y0 + ft * k
  const W = X(60) + 60
  const ys = Y(32) + 70
  return (
    <Svg w={W} h={ys + 80}>
      <rect x={X(0)} y={Y(0)} width={60 * k} height={32 * k} fill={C.conc} stroke={C.ink} strokeWidth={3} />
      {[6, 18, 30, 42, 54].map((x) => (
        <Ln key={x} x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(32)} c={C.ink} dash="6 4" />
      ))}
      <T x={X(30)} y={Y(0) - 9} w={700}>
        A
      </T>
      <T x={X(30)} y={Y(32) + 11} w={700}>
        B
      </T>
      <T x={X(12)} y={Y(12)} s={11}>
        T beams (dashed)
      </T>
      <T x={X(0) - 6} y={Y(16)} s={11} a="end" rot={-90}>
        edge L beam
      </T>
      <DimV x={X(60) + 14} y1={Y(0)} y2={Y(32)} label="32 ft" side="r" />
      <DimChain xs={[X(0), X(6), X(54), X(60)]} y={Y(32) + 30} labels={['6 ft', '4 @ 12 ft = 48 ft', '6 ft']} />
      {/* section */}
      <rect x={X(0)} y={ys} width={60 * k} height={8} fill={C.conc} stroke={C.ink} />
      {[0, 6, 18, 30, 42, 54, 60].map((x, i) => {
        const w = (15 / 12) * k
        const xa = i === 0 ? X(0) : i === 6 ? X(60) - w : X(x) - w / 2
        return <rect key={x} x={xa} y={ys + 8} width={w} height={26} fill={C.conc} stroke={C.ink} />
      })}
      <T x={X(24)} y={ys - 10} s={11}>
        slab 4″ · webs bw = 15″ (T and edge L beams)
      </T>
      <T x={W / 2} y={ys + 56} w={600}>
        Fig. 5
      </T>
    </Svg>
  )
}

// ================================================================ data
const S1a: OneWayCoefInput = { spans: [11.5, 11.5, 11.5, 11.5], ends: ['spandrel', 'spandrel'], ll: 60, ff: 30, pw: 50, fc: 3000, fy: 60000 }
let s1aCache: ReturnType<typeof oneWayCoef> | undefined
const s1a = () => (s1aCache ??= oneWayCoef(S1a))
const S2a: TwoWayInput = { lx: 29, ly: 24, edges: { top: true, bottom: true, left: false, right: true }, ll: 60, ff: 30, pw: 50, fc: 3000, fy: 60000 }
const bm4a: ShearBeam = { kind: 'ss', L: 30, wD: 2.0, P: [{ x: 15, P: 50 }], factored: true }
const sec4a: ShearSection = { bw: 12, d: 24, fc: 3500, fy: 60000 }
const E5a: ElasticInput = { b: 12, h: 24, d: 21.5, As: 3.0, fc: 3000, EcPsi: 3.2e6, frPsi: 400 }
const L5b: LoadInput = { span: 22, support: 'ss', b: 12, h: 24, sdl: 1, ll: 2 }
const P6c: DoublyDesignIn = { b: 12, d: 21, dt: 22.5, dp: 2.5, fc: 4, fy: 60, Mu: 625 }
const I7b: SinglyInput = { b: 12, h: 27, fc: 4000, fy: 60000, layers: [{ As: 4, d: 24 }] }
const P7c: DoublyReviewIn = { b: 14, d: 24, dp: 2.5, As: 5.06, Asp: 1.2, fc: 4, fy: 60 }
const Bedge: BeffIn = { kind: 'edge', L: 32, bw: 15, hf: 4, cc: 72 }
const Bint: BeffIn = { kind: 'interior', L: 32, bw: 15, hf: 4, cc: 144 }
const fl8 = () => floorLoads({ hf: 4, spacing: 12, bw: 15, h: 27, sdl: 30 + 60, ll: 80 })
const t8 = () => {
  const fl = fl8()
  const Mu = (fl.wu * 32 * 32) / 8
  const beff = effectiveWidth(Bint).b
  return { fl, Mu, beff, ...tDesignSteps({ Mu, beff, bw: 15, hf: 4, d: 24, fc: 4, fy: 60 }) }
}

/** Q3(a): two-span B1 by ACI coefficients (−1/16, +1/14, −1/9), fy = 72.5 ksi */
function b1Design() {
  const slab = s1a()
  const h = slab.h
  const trib = 12.5
  const D = slab.loads.D // psf incl. slab self-weight
  const web = ((12 * (30 - h)) / 144) * 0.15
  const wD = (D * trib) / 1000 + web
  const wL = (60 * trib) / 1000
  const wu = wuOf(wD, wL)
  const ln = 28
  const secs = [
    { key: 'ext', label: 'Exterior support (−)', den: 16, top: true },
    { key: 'pos', label: 'End span (+)', den: 14, top: false },
    { key: 'int', label: 'Interior support (−)', den: 9, top: true },
  ].map((s) => {
    const Mu = (wu * ln * ln) / s.den
    let d = 27.5
    let D2 = designAs(Mu, 12, d, 4000, 72500)
    let bars = pickBarsS(D2.As, 12)
    if (bars.layers > 1) {
      d = 26.5
      D2 = designAs(Mu, 12, d, 4000, 72500, 27.5)
      bars = pickBarsS(D2.As, 12)
    }
    return { ...s, Mu, d, D: D2, bars }
  })
  return { h, D, web, wD, wL, wu, ln, trib, secs }
}

function Sol3a() {
  const g = b1Design()
  return (
    <Sol>
      <Note>{`Slab from Q1(a): h = ${f(g.h)} in, service DL = ${f(g.D, 1)} psf (incl. self-weight), LL = 60 psf. B1 carries a ${f(g.trib, 1)} ft strip (half the slab to each adjacent B2) plus its web below the slab. T-beam action is ignored (conservative, as the paper says nothing about it).`}</Note>
      <SolSteps
        steps={[
          st('Line loads on B1', `w_D = ${f(g.D, 1)}(${f(g.trib, 1)})/1000 + \\frac{12(30 - ${f(g.h)})}{144}(0.150) = ${f(g.wD)}\\text{ k/ft},\\quad w_L = 0.060(${f(g.trib, 1)}) = ${f(g.wL)}\\text{ k/ft}`),
          st('Factored', `w_u = 1.2(${f(g.wD)}) + 1.6(${f(g.wL)}) = ${f(g.wu)}\\text{ k/ft},\\quad l_n = 30 - 2 = ${g.ln}\\text{ ft}`),
          st('ACI coefficients (two spans, integral with columns — panel (b))', `M_u = \\frac{w_ul_n^2}{16},\\ \\frac{w_ul_n^2}{14},\\ \\frac{w_ul_n^2}{9}`),
          ...g.secs.map((s) =>
            st(
              s.label,
              `M_u = \\frac{${f(g.wu)}(${g.ln})^2}{${s.den}} = ${f(s.Mu, 1)}\\text{ k-ft};\\ R_n = ${f(s.D.Rn, 0)}\\text{ psi},\\ \\rho = ${f(s.D.rho, 5)},\\ A_s = ${f(s.D.As)}\\text{ in}^2 \\Rightarrow \\text{${barTxt(s.bars.n, s.bars.bar)}}\\ (d = ${f(s.d)}\\text{ in})`,
              `$\\varepsilon_t = ${f(s.D.epsT, 4)}$${s.D.As === s.D.AsMin ? ', As,min governs' : ''}${s.D.needsComp ? ' — exceeds ρmax!' : ''}.`,
            ),
          ),
        ]}
      />
      <Tbl head={['section', '$M_u$ (k-ft)', '$A_s$ (in²)', 'bars', 'position']} rows={g.secs.map((s) => [s.label, f(s.Mu, 1), f(s.D.As), barTxt(s.bars.n, s.bars.bar), s.top ? 'top' : 'bottom'])} />
      <Ans>{`$w_u = ${f(g.wu)}$ k/ft; exterior support ${barTxt(g.secs[0].bars.n, g.secs[0].bars.bar)} top, midspan ${barTxt(g.secs[1].bars.n, g.secs[1].bars.bar)} bottom, interior support ${barTxt(g.secs[2].bars.n, g.secs[2].bars.bar)} top. Long section: top bars ln/4 (exterior) and ln/3 (interior) past the faces, half the bottom bars stopped ln/8 from the faces.`}</Ans>
    </Sol>
  )
}

// ================================================================ questions
export const R2016: RcQ[] = [
  // solve: continuous one-way slab by ACI coefficients — hmin, loads, Mu at each section, bars (alt. cranked + extra top), T&S
  {
    id: 'rc-2016-17-1a',
    paper: '2016-17',
    sec: 'A',
    no: '1(a)',
    marks: 25,
    topics: ['rc-oneway'],
    title: 'CE-building floor: continuous one-way slab by ACI coefficients',
    pages: [36, 40, 43],
    text: r`Figure 1 shows the one-way reinforced concrete floor system of the Civil Engineering Building, BUET. Design the one-way slab supported by beams cast monolithically with the slab. The slab is to carry a service live load (LL) of 60 psf in addition to its self-weight. Assume floor finish (FF) load of 30 psf and partition wall load of 50 psf.

Given: $f'_c = 3000$ psi and $f_y = 60\,000$ psi. Follow USD method and ACI moment co-efficients. Show the reinforcements in plan and section.

(Fig. 1: slab spans N–S between beams B1/B2 at 12′-6″ c/c, 11′-6″ clear; beams 12″ × 30″; floor continues N and S.)`,
    given: [AID_ACI],
    figure: Fig1,
    checks: () => {
      const r0 = s1a()
      const s1 = r0.sections.find((s) => s.id === 's1')!
      const p0 = r0.sections.find((s) => s.id === 'p0')!
      return [
        { key: 'h', label: 'Slab thickness h', value: r0.h, unit: 'in' },
        { key: 'wu', label: 'Factored load $w_u$', value: r0.loads.wu, unit: 'psf' },
        { key: 'm1', label: 'Mu at the first interior support (−1/10)', value: s1.Mu, unit: 'k-ft/ft' },
        { key: 'mp', label: 'Mu at midspan of the end span (+1/14)', value: p0.Mu, unit: 'k-ft/ft' },
      ]
    },
    solution: () => <OneWaySol p={S1a} note="Four spans of 11.5 ft clear are modelled between the outer B2 lines, ends integral with spandrel beams (B2): −1/24, +1/14, −1/10, +1/16, −1/11. The break lines suggest the floor continues; then every span is interior (+1/16, −1/11) — the design steel barely changes." />,
    notes: ['Slab thickness is not given. The end condition is open: the slab-solutions PDF used a spandrel end (−1/24, −1/10 at the first interior support), as here.'],
  },
  {
    id: 'rc-2016-17-1b',
    paper: '2016-17',
    sec: 'A',
    no: '1(b)',
    marks: 10,
    topics: ['rc-oneway'],
    title: 'Why T&S steel in one-way slabs; recommended ratios',
    pages: PG.A1,
    theory: true,
    text: 'Why are temperature and shrinkage reinforcement required in one-way slab? What are the recommended ratios for such steel?',
    solution: () => <AnsMd a={ANS.ts} />,
  },
  // solve: two-way panel 24 × 29 clear by the coefficient method — case, h, Tables 12.3–12.5, middle/column strips
  {
    id: 'rc-2016-17-2a',
    paper: '2016-17',
    sec: 'A',
    no: '2(a)',
    marks: 20,
    topics: ['rc-twoway'],
    title: 'Same floor without B2: two-way panels 25′ × 30′',
    pages: [36, 40, 41, 42],
    text: r`Design the slab as two-way floor slab system, when there are no secondary beams B2 in the floor system of Fig. 1. The two-way slab panels are 25′ × 30′ in plan, supported by column-line beams only.

Given: LL = 60 psf; FF = 30 psf; $P_\omega$ (partition wall) = 50 psf; $f'_c = 3$ ksi and $f_y = 60$ ksi. Use moment co-efficient method. Show the reinforcements with neat sketches.`,
    given: AIDS_TABLES,
    figure: Fig1noB2,
    checks: () => {
      const t = twoWay(S2a)
      return [
        { key: 'm', label: 'm = la/lb (clear spans)', value: t.m },
        { key: 'h', label: 'Slab thickness h', value: t.h, unit: 'in' },
        { key: 'ma', label: 'Short-direction negative moment at the continuous edge', value: t.M.aNeg ?? 0, unit: 'k-ft/ft' },
        { key: 'mp', label: 'Short-direction positive moment', value: t.M.aPos, unit: 'k-ft/ft' },
      ]
    },
    solution: () => <TwoWaySol p={S2a} note="Panel between the two B1 lines and between B3 (exterior) and B4: clear 24 ft (N–S) × 29 ft (E–W). Both long edges (B1) are continuous (the floor repeats N–S), the short edge on B4 is continuous and the one on B3 is not → Case 9." />,
    notes: ['The panel to design is not stated. The figure makes three edges continuous (Case 9, used here); the slab-solutions PDF designed a corner panel (Case 4) and calls the part "Q1(e)". Slab thickness not given.'],
  },
  // solve: ld of 20 mm and 25 mm bars, top and bottom, simplified ACI equations
  {
    id: 'rc-2016-17-2b',
    paper: '2016-17',
    sec: 'A',
    no: '2(b)',
    marks: 9,
    topics: ['rc-bond'],
    title: 'ℓd of 20 mm and 25 mm bars, top and bottom',
    pages: PG.A2,
    text: r`Calculate the development length of 20 mm and 25 mm uncoated top bars in USD. Repeat the calculation for bottom bars also. Use $f'_c = 3$ ksi and $f_y = 60$ ksi and assume appropriate value for any missing data.`,
    given: [],
    checks: () => [
      { key: 't20', label: '20 mm top bar ℓd', value: ldRow('20mm', 3000, 60000, true).r.final, unit: 'in', tol: 0.03 },
      { key: 't25', label: '25 mm top bar ℓd', value: ldRow('25mm', 3000, 60000, true).r.final, unit: 'in', tol: 0.03 },
      { key: 'b20', label: '20 mm bottom bar ℓd', value: ldRow('20mm', 3000, 60000, false).r.final, unit: 'in', tol: 0.03 },
      { key: 'b25', label: '25 mm bottom bar ℓd', value: ldRow('25mm', 3000, 60000, false).r.final, unit: 'in', tol: 0.03 },
    ],
    solution: () => <LdSol ids={['20mm', '25mm']} fc={3000} fy={60000} note="Assumed: clear spacing ≥ 2db and clear cover ≥ db (or ≥ db with minimum stirrups), uncoated, normal-weight concrete. 20 mm (0.79 in) falls in the No. 6-and-smaller group, 25 mm (0.98 in) in the No. 7-and-larger group." />,
    notes: ['20 mm and 25 mm fall on opposite sides of the ACI bar-size split (1/25 vs 1/20 coefficient).'],
  },
  {
    id: 'rc-2016-17-2c',
    paper: '2016-17',
    sec: 'A',
    no: '2(c)',
    marks: 6,
    topics: ['rc-bond'],
    title: 'Minimum lap length for column splices (ACI/BNBC)',
    pages: PG.A2,
    theory: true,
    text: 'What is the minimum length of lap for column splices as per ACI/BNBC code?',
    solution: () => <AnsMd a={ANS.colSplice} />,
  },
  // solve: B1 two-span beam by ACI coefficients — tributary load + web, −1/16, +1/14, −1/9, As with fy = 72.5 ksi
  {
    id: 'rc-2016-17-3a',
    paper: '2016-17',
    sec: 'A',
    no: '3(a)',
    marks: 23,
    topics: ['rc-singly', 'rc-tbeam'],
    title: 'Beam B1 on three columns: + and − steel (fy = 72.5 ksi)',
    pages: [36, 40, 43],
    text: r`Determine both positive and negative reinforcements for the beam B1 supported on three columns as shown in Fig. 1. The beam B1 is to carry load from one-way slab given in question 1(a) above. Consider also the self-weight of the beam. The size of the beam is 12″ × 30″.

Given: $f'_c = 4$ ksi; $f_y = 72.5$ ksi. Follow USD method. Show the reinforcements in long section.`,
    given: [AID_ACI],
    figure: Fig1B1,
    checks: () => {
      const g = b1Design()
      return [
        { key: 'wu', label: 'Factored line load on B1 $w_u$', value: g.wu, unit: 'k/ft', tol: 0.03 },
        { key: 'mint', label: 'Mu at the interior support (−1/9)', value: g.secs[2].Mu, unit: 'k-ft', tol: 0.03 },
        { key: 'asint', label: 'As at the interior support', value: g.secs[2].D.As, unit: 'in²', tol: 0.04 },
        { key: 'aspos', label: 'As at midspan (+1/14)', value: g.secs[1].D.As, unit: 'in²', tol: 0.04 },
      ]
    },
    solution: () => <Sol3a />,
    notes: ['fy = 72.5 ksi (≈ 500 MPa) is clearly printed. The slab thickness comes from Q1(a). Spans 30 ft c/c with 24 in columns → ln = 28 ft. Whether the slab reaction includes the 1.15 interior-support factor is a convention choice (not used here).'],
  },
  {
    id: 'rc-2016-17-3b',
    paper: '2016-17',
    sec: 'A',
    no: '3(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Standard cut-off / bend points, nearly equal spans with UDL',
    pages: PG.A3,
    theory: true,
    text: 'Show with neat sketches cut off or bend points for bars in approximately equal spans with uniformly distributed loads.',
    solution: () => <AnsMd a={ANS.cutoff} fig={<CutoffFig />} />,
  },
  {
    id: 'rc-2016-17-3c',
    paper: '2016-17',
    sec: 'A',
    no: '3(c)',
    marks: 4,
    topics: ['rc-basics'],
    title: 'Meaning of serviceability',
    pages: PG.A3,
    theory: true,
    text: 'What do you understand by the term "serviceability" in RC design?',
    solution: () => <AnsMd a={ANS.serviceability} />,
  },
  // solve: stirrups, SS 30 ft, Pu = 50 k at midspan + wu = 2.0 k/ft, 3 sets of spacing
  {
    id: 'rc-2016-17-4a',
    paper: '2016-17',
    sec: 'A',
    no: '4(a)',
    marks: 26,
    topics: ['rc-shear'],
    title: 'Stirrups, 3 sets: 30 ft beam, 50 k at midspan + 2.0 k/ft',
    pages: [37, 40],
    text: r`Design the stirrups for the beam shown in Fig. 2. All loads are factored. Calculate the stirrups with 3 sets of spacings. Width of beam $b = 12''$ and effective depth $d = 24''$.

Given: $f'_c = 3.5$ ksi and $f_y = 60$ ksi.

(Fig. 2: simple span 15′-0″ + 15′-0″; $P_u = 50$ kip at midspan; $w_u = 2.0$ kip/ft including self-weight.)`,
    given: [],
    figure: Fig2,
    checks: () => {
      const { R, at, g } = shearKey(bm4a, sec4a)
      return [
        { key: 'vd', label: 'Vu at d from the support', value: R.Vd, unit: 'k' },
        { key: 'pvc', label: 'φVc', value: g.lim.phiVc, unit: 'k' },
        { key: 's', label: 'Required spacing at the critical section', value: at.s, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => <ShearSol bm={bm4a} sec={sec4a} />,
    notes: ['The UDL reads 2.0 k/ft on the clear re-photo (p40); the blurry p39 could be misread as 2.8.'],
  },
  {
    id: 'rc-2016-17-4b',
    paper: '2016-17',
    sec: 'A',
    no: '4(b)',
    marks: 9,
    topics: ['rc-shear'],
    title: 'Seismic hoops in beams, moderate seismic zone (Dhaka)',
    pages: PG.A4,
    theory: true,
    flag: 'Seismic detailing (IMRF hoops) — not in the current CE 315 slides',
    text: 'What are the BNBC/ACI code provisions for beam stirrups (hoops) for moderate seismic risk region e.g. Dhaka.',
    solution: () => <AnsMd a={ANS.hoops} fig={<HoopFig />} />,
  },
  // solve: Mcr (uncracked transformed, n = 9) and allowable working moment (cracked, fc = 0.45f'c, fs = 24 ksi)
  {
    id: 'rc-2016-17-5a',
    paper: '2016-17',
    sec: 'B',
    no: '5(a)',
    marks: 20,
    topics: ['rc-elastic'],
    title: 'Mcr and maximum allowable working moment (12 × 24, 3 No. 9)',
    pages: PG.B,
    text: r`A singly reinforced rectangular section has 12 inch width and 24 inch total depth. The tension reinforcement consists of 3 No. 9 bar.

Given: $f'_c = 3$ ksi, $E_c = 3200$ ksi, $f_r = 0.40$ ksi, $f_y = 60$ ksi and $E_s = 29\,000$ ksi. Allowable concrete stress $f_c = 0.45f'_c$ and allowable steel stress $f_s = 24$ ksi. Determine:
- (i) Cracking moment
- (ii) Maximum allowable working moment`,
    given: [],
    checks: () => {
      const u = uncracked(E5a)
      const a = allowableMoment(E5a, 1.35, 24)
      return [
        { key: 'n', label: 'Modular ratio n (rounded)', value: u.n },
        { key: 'mcr', label: '(i) Cracking moment', value: u.Mcr, unit: 'k-ft' },
        { key: 'kd', label: 'Cracked neutral axis kd', value: a.kd, unit: 'in' },
        { key: 'ma', label: '(ii) Allowable working moment', value: a.M, unit: 'k-ft' },
      ]
    },
    solution: () => <McrAllowSol inp={E5a} fcAllow={1.35} fsAllow={24} note="d is not given: d = 24 − 2.5 = 21.5 in assumed. n = 29 000/3200 = 9.06 → 9." />,
    notes: ['d is not given (assume about 21.5 in). Twin of 2014-15 Q6(c).'],
  },
  // solve: design As, SS 22 ft, 12 × 24 assumed, DL 1 + sw, LL 2; bar detailing sketch
  {
    id: 'rc-2016-17-5b',
    paper: '2016-17',
    sec: 'B',
    no: '5(b)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Design a 12 × 24 beam, 22 ft simple span; detailing sketch',
    pages: PG.B,
    text: r`Design a rectangular beam for 22 ft simple span if a dead load of 1 k/ft (not including the self-weight of the beam) and a live load of 2 k/ft are to be supported. Show rebar detailing in a neat sketch showing rebar size, arrangement and spacing.

Given: $f'_c = 4$ ksi and $f_y = 60$ ksi. Assume a beam section 12″ × 24″.`,
    given: [],
    checks: () => {
      const g = fixedDesign(L5b, 12, 21.5, 4000, 60000)
      return [
        { key: 'mu', label: 'Design moment $M_u$', value: g.L.Mu, unit: 'k-ft' },
        { key: 'as', label: 'Required $A_s$ (d = 21.5 in)', value: g.D.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => <FixedDesignSol load={L5b} b={12} d={21.5} fc={4000} fy={60000} note="d = 24 − 2.5 = 21.5 in assumed; self-weight of the 12 × 24 section added to the DL." />,
  },
  {
    id: 'rc-2016-17-6a',
    paper: '2016-17',
    sec: 'B',
    no: '6(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Purpose of minimum flexural steel; ACI/BNBC ρmin',
    pages: PG.B,
    theory: true,
    text: 'What is the purpose of providing minimum amount of flexural steel in beam? Write the ACI/BNBC code provisions for minimum reinforcement ratios.',
    solution: () => <AnsMd a={ANS.minSteel} />,
  },
  {
    id: 'rc-2016-17-6b',
    paper: '2016-17',
    sec: 'B',
    no: '6(b)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Reasons for minimum cover; recommended values',
    pages: PG.B,
    theory: true,
    text: "Give reasons for the minimum cover requirements in the ACI/BNBC code. What are the recommended values of 'cover' as per ACI/BNBC code?",
    solution: () => <AnsMd a={ANS.cover} />,
  },
  // solve: doubly design, 12 × 25 fixed, Mu = 625 k-ft, d 21 / dt 22.5 / d' 2.5; detailing sketch
  {
    id: 'rc-2016-17-6c',
    paper: '2016-17',
    sec: 'B',
    no: '6(c)',
    marks: 25,
    topics: ['rc-doubly'],
    title: 'Size-restricted 12 × 25 section for Mu = 625 kip-ft',
    pages: PG.B,
    text: r`A RC beam section is limited to a width of 12 inch and total depth of 25 inch. Calculate the required reinforcement if the beam has to resist a total factored moment of 625 k-ft including self-weight. Assume two layer tensile reinforcement with $d = 21$ inch and $d_t = 22.5$ inch. Also, assume $d' = 2.5$ inch, if compression steel is required. Show the rebar detailing in a neat sketch.

Given: $f'_c = 4$ ksi and $f_y = 60$ ksi.`,
    given: [],
    checks: () => {
      const g = designDoubly(P6c)
      return [
        { key: 'm1', label: 'φMn of the largest singly reinforced section', value: g.sm.phiMn1, unit: 'k-ft' },
        { key: 'asp', label: "Compression steel $A'_s$", value: g.Asp, unit: 'in²', tol: 0.03 },
        { key: 'as', label: 'Tension steel $A_s$', value: g.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => <DoublyDesignSol p={P6c} />,
  },
  {
    id: 'rc-2016-17-7a',
    paper: '2016-17',
    sec: 'B',
    no: '7(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Tension-controlled vs compression-controlled beams',
    pages: PG.B,
    theory: true,
    text: 'Distinguish between tension controlled and compression controlled beams.',
    solution: () => (
      <AnsMd
        a={r`- **Tension-controlled**: net tensile strain $\varepsilon_t \ge 0.005$ at nominal strength ($c/d_t \le 0.375$). The steel yields long before the concrete crushes → large deflections and cracks give warning; ductile. ACI rewards it with **φ = 0.90**.
- **Compression-controlled**: $\varepsilon_t \le \varepsilon_y$ (0.002 for Grade 60, $c/d_t \ge 0.6$). The concrete reaches 0.003 and crushes while the steel is still elastic → sudden, brittle. **φ = 0.65** (tied) / 0.75 (spiral).
- **Transition zone** in between: φ varies linearly, $\phi = 0.483 + 83.3\varepsilon_t$ (Grade 60, tied).
- ACI does not allow a flexural member (Pu small) with $\varepsilon_t < 0.004$; beams are normally designed to be tension-controlled. Columns are usually compression-controlled.`}
      />
    ),
  },
  // solve: singly review — ρ vs ρb (or εt vs εy): which fails first
  {
    id: 'rc-2016-17-7b',
    paper: '2016-17',
    sec: 'B',
    no: '7(b)',
    marks: 10,
    topics: ['rc-singly'],
    title: 'Crushing or yielding first? 12 × 27, 4 #9, d = 24',
    pages: [37, 39],
    text: r`For the beam section shown in Fig. 3 determine whether the failure of the beam will be initiated by crushing of concrete or yielding of steel.

Given: $f'_c = 4$ ksi and $f_y = 60$ ksi. (Fig. 3: $b = 12$ in, $d = 24$ in, $h = 27$ in, 4 #9 bars.)`,
    given: [],
    figure: Fig3,
    checks: () => {
      const r0 = review(I7b)
      return [
        { key: 'rho', label: 'ρ = As/bd', value: r0.rho, tol: 0.01 },
        { key: 'rhob', label: 'Balanced ratio ρb', value: r0.lim.rhoB, tol: 0.01 },
        { key: 'et', label: 'Steel strain εt at nominal strength', value: r0.epsT, tol: 0.03 },
      ]
    },
    solution: () => {
      const r0 = review(I7b)
      const lim = limits(4000, 60000)
      return (
        <Sol>
          <SolSteps steps={[...lim.steps.slice(0, 2), ...r0.steps.slice(0, 4)]} />
          <Ans>{`$\\rho = ${f(r0.rho, 4)} < \\rho_b = ${f(r0.lim.rhoB, 4)}$ and $\\varepsilon_t = ${f(r0.epsT, 5)} > \\varepsilon_y = 0.00207$: the steel **yields first** (under-reinforced) — failure starts by yielding of steel, followed by crushing of concrete. ($\\phi M_n = ${f(r0.phiMn, 1)}$ k-ft.)`}</Ans>
        </Sol>
      )
    },
  },
  // solve: doubly review — f's from the quadratic (A's does not yield), φMn
  {
    id: 'rc-2016-17-7c',
    paper: '2016-17',
    sec: 'B',
    no: '7(c)',
    marks: 20,
    topics: ['rc-doubly'],
    title: "Doubly reinforced review: f′s and φMn (14 × 27, 4 #10 / 2 #7)",
    pages: [37, 39],
    text: r`Compute the stresses in the compression steel $f'_s$ for the doubly reinforced beam section shown in Fig. 4. Also compute the design moment strength for the section.

Given: $f'_c = 4$ ksi and $f_y = 60$ ksi. (Fig. 4: $b = 14$ in, $h = 27$ in; 2 #7 (1.20 in²) at 2½ in from the top; 4 #10 (5.06 in²) at 3 in from the bottom, $d = 24$ in.)`,
    given: [],
    figure: Fig4,
    checks: () => {
      const r0 = reviewDoubly(P7c)
      return [
        { key: 'c', label: 'Neutral-axis depth c', value: r0.c, unit: 'in' },
        { key: 'fsp', label: "Compression-steel stress $f'_s$", value: r0.fsp, unit: 'ksi', tol: 0.03 },
        { key: 'pmn', label: 'Design moment strength $\\phi M_n$', value: r0.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => <DoublyReviewSol p={P7c} />,
  },
  // solve: effective flange width of the edge L-beam and the interior T-beam AB
  {
    id: 'rc-2016-17-8a',
    paper: '2016-17',
    sec: 'B',
    no: '8(a)',
    marks: 10,
    topics: ['rc-tbeam'],
    title: 'Effective width: edge L-beam and T-beam AB',
    pages: [38, 39],
    text: r`For the floor system shown in Fig. 5 calculate the effective width for the edge L-beam and T-beam AB.

(Fig. 5: beam span A–B = 32 ft; T-beams at 12 ft c/c; edge L-beams 6 ft outside the outer T-beams; slab 4 in; $b_w = 15$ in.)`,
    given: [],
    figure: Fig5,
    checks: () => [
      { key: 'l', label: 'Edge L-beam effective width', value: effectiveWidth(Bedge).b, unit: 'in' },
      { key: 't', label: 'T-beam AB effective width', value: effectiveWidth(Bint).b, unit: 'in' },
    ],
    solution: () => {
      const e = beffSteps(Bedge)
      const t = beffSteps(Bint)
      return (
        <Sol>
          <Hd>Edge L-beam (overhang on one side; next beam 6 ft = 72 in away)</Hd>
          <SolSteps steps={e.s} />
          <Hd>Interior T-beam AB (beams 12 ft = 144 in c/c)</Hd>
          <SolSteps steps={t.s} start={2} />
          <Ans>{`Edge L-beam $b_{eff} = ${f(e.o.b)}$ in; T-beam AB $b_{eff} = ${f(t.o.b)}$ in.`}</Ans>
          <Note>Overhang limits: L-beam min(6hf, L/12, ½ clear distance); T-beam min(8hf, ½ clear, ln/8) each side (ACI 318-14), or b ≤ L/4 (318-08) — same answer here.</Note>
        </Sol>
      )
    },
    notes: ['Slab 4″, bw = 15″ and the 6′/12′ spacings are handwritten on a printed figure (consistent with the Q8(b) text).'],
  },
  // solve: T-beam design, SS 32 ft, floor loads × 12 ft + web, beff from 8(a)
  {
    id: 'rc-2016-17-8b',
    paper: '2016-17',
    sec: 'B',
    no: '8(b)',
    marks: 25,
    topics: ['rc-tbeam'],
    title: 'Design T-beam AB (32 ft simple span, 12 ft spacing)',
    pages: [38, 39],
    text: r`Determine the required reinforcement for the T-beam AB of the floor system shown in Fig. 5. Assume simple supports at A and B. The floor is to support a live load of 80 psf, floor finish of 30 psf and partition wall load of 60 psf in addition to its self-weight. The slab is 4 inch thick, while $d = 24$ inch and $b_w = 15$ inch.

Given: $f'_c = 4$ ksi and $f_y = 60$ ksi.`,
    given: [],
    figure: Fig5,
    checks: () => {
      const g = t8()
      return [
        { key: 'wu', label: 'Factored load on AB $w_u$', value: g.fl.wu, unit: 'k/ft', tol: 0.03 },
        { key: 'mu', label: 'Design moment $M_u$', value: g.Mu, unit: 'k-ft', tol: 0.03 },
        { key: 'as', label: 'Required $A_s$', value: g.t.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => {
      const g = t8()
      const bars = pickBarsS(g.t.As, 15)
      return (
        <Sol>
          <Note>Overall depth h is not given: h = d + 3 = 27 in assumed for the web self-weight (web below the slab only).</Note>
          <SolSteps
            steps={[
              st('Dead load per ft', `\\text{slab } \\frac{4}{12}(0.150)(12) = ${f(g.fl.slab)},\\ \\text{web } \\frac{15(27 - 4)}{144}(0.150) = ${f(g.fl.web)},\\ \\text{FF + PW } 0.090(12) = ${f(g.fl.sdl)} \\Rightarrow w_D = ${f(g.fl.wD)}\\text{ k/ft}`),
              st('Live load and factored load', `w_L = 0.080(12) = ${f(g.fl.wL)}\\text{ k/ft},\\quad w_u = 1.2(${f(g.fl.wD)}) + 1.6(${f(g.fl.wL)}) = ${f(g.fl.wu)}\\text{ k/ft}`),
              st('Design moment', `M_u = \\frac{w_uL^2}{8} = \\frac{${f(g.fl.wu)}(32)^2}{8} = ${f(g.Mu, 1)}\\text{ k-ft}`),
              st('Effective width (from 8a)', `b_{eff} = ${f(g.beff)}\\text{ in}`),
              ...g.s,
              st('Bars', `A_s = ${f(g.t.As)}\\text{ in}^2 \\Rightarrow \\text{${barTxt(bars.n, bars.bar)}} = ${f(bars.As)}\\text{ in}^2\\ (${bars.layers}\\text{ layer})`),
            ]}
          />
          <Ans>{`$w_u = ${f(g.fl.wu)}$ k/ft, $M_u = ${f(g.Mu, 1)}$ k-ft, ${g.t.rect ? 'a within the flange (rectangular)' : 'true T'}: $A_s = ${f(g.t.As)}$ in² → **${barTxt(bars.n, bars.bar)}**.`}</Ans>
        </Sol>
      )
    },
    notes: ['The overall depth h is not given; web self-weight uses h ≈ 27 in.'],
  },
]

