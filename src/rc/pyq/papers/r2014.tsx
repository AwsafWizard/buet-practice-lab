// 2014-15 term final (held 4 Feb 2016), PDF pp. 53–57. Attached: Tables 12.3–12.6 (pp. 56–57); no ACI coefficient page.
import type { RcQ } from '../../types'
import { SolSteps } from '../../topics/elastic/ui'
import { f, allowableMoment, uncracked, type ElasticInput } from '../../engine/elastic'
import { beamLoads, review, type SinglyInput } from '../../engine/singly'
import { designDoubly, type DoublyDesignIn } from '../../engine/doubly'
import { effectiveWidth, type BeffIn } from '../../engine/tbeam'
import { cantSlab, type CantSlabInput } from '../../engine/oneway'
import { twoWay, type TwoWayInput } from '../../engine/twoway'
import { bar, cutoff, ldSimplified } from '../../engine/bond'
import type { ShearBeam, ShearSection } from '../../engine/shear'
import {
  ANS,
  Ans,
  AnsMd,
  Arrow,
  barTxt,
  beffSteps,
  C,
  CantSlabSol,
  DimChain,
  DoublyDesignSol,
  Hd,
  kRhoDesign,
  KRhoSol,
  LdSol,
  ldRow,
  Ln,
  McrAllowSol,
  Note,
  r,
  RectSec,
  shearKey,
  ShearSol,
  SinglyReviewSol,
  SlabStrip,
  Sol,
  SSBeam,
  st,
  StressStrainFig,
  Svg,
  T,
  tDesignSteps,
  TFloor,
  TwoWaySol,
} from './r2017'

const PG = { A: [53], B: [54] }
const AIDS_TABLES = [
  { label: 'Table 12.3', what: 'negative-moment coefficients', ref: 'sl-t123' },
  { label: 'Table 12.4', what: 'DL positive-moment coefficients', ref: 'sl-t124' },
  { label: 'Table 12.5', what: 'LL positive-moment coefficients', ref: 'sl-t125' },
  { label: 'Table 12.6', what: 'load ratio Wa / Wb', ref: 'sl-t126' },
]

// ================================================================ figures
const Fig1 = () => (
  <SlabStrip
    L={19}
    supports={[
      { x: 0.5, w: 12, kind: 'beam' },
      { x: 13.5, w: 12, kind: 'beam' },
    ]}
    dims={[
      { a: 1, b: 13, label: "12'-0\"" },
      { a: 14, b: 19, label: "5'-0\"" },
    ]}
    udl="LL 60 psf + PW 50 psf + FF 30 psf + self-weight"
    title="Fig. 1 — ONE WAY SLAB"
    note="edge beam at the left end; beam widths not dimensioned (12 in assumed)"
  />
)
const Fig2 = () => <TFloor hf={3} bw={16} sp={48} n={3} h={27} d={24} dAt={2} notes={['SPAN OF BEAMS = 25′-0″ · Mu = 720 kip-ft', 'Fig. 2']} />
/** Fig. 3 — three 20′ × 20′ panels in an L on 10″ brick walls */
function Fig3() {
  const k = 7
  const w = 10 / 12
  const x0 = 60
  const y0 = 20
  const X = (ft: number) => x0 + ft * k
  const Y = (ft: number) => y0 + ft * k
  const S = 20
  const tot = 2 * S + 3 * w
  const panel = (x: number, y: number, lbl: string, tint?: boolean) => (
    <g key={lbl}>
      <rect x={X(x)} y={Y(y)} width={S * k} height={S * k} fill={C.conc} />
      {tint && <rect x={X(x)} y={Y(y)} width={S * k} height={S * k} fill={C.accent} opacity={0.15} />}
      <T x={X(x + S / 2)} y={Y(y + S / 2)} s={11}>
        {lbl}
      </T>
    </g>
  )
  const wall = (x: number, y: number, a: number, b: number, key: string) => <rect key={key} x={X(x)} y={Y(y)} width={a * k} height={b * k} fill={C.mute} opacity={0.45} stroke={C.ink} strokeWidth={0.7} />
  return (
    <Svg w={X(tot) + 150} h={Y(tot) + 54}>
      {panel(w, w, 'end panel (Case 6)')}
      {panel(w, S + 2 * w, 'corner panel (Case 4)', true)}
      {panel(S + 2 * w, S + 2 * w, 'end panel (Case 6)')}
      {wall(0, 0, S + 2 * w, w, 'a')}
      {wall(0, 0, w, tot, 'b')}
      {wall(S + w, 0, w, tot, 'c')}
      {wall(0, S + w, tot, w, 'd')}
      {wall(0, tot - w, tot, w, 'e')}
      {wall(tot - w, S + w, w, S + 2 * w, 'f')}
      <T x={X(S + 2 * w) + 8} y={Y(S / 2)} a="start" s={11}>
        10″ brick walls
      </T>
      <T x={X(tot) + 8} y={Y(S + 6)} a="start" s={11}>
        LL = 60 psf, PW = 50 psf
      </T>
      <T x={X(tot) + 8} y={Y(S + 9)} a="start" s={11}>
        FF = 25 psf, f′c = 3 ksi
      </T>
      <T x={X(tot) + 8} y={Y(S + 12)} a="start" s={11}>
        fy = 40 ksi
      </T>
      <DimChain xs={[X(w), X(S + w), X(S + 2 * w), X(2 * S + 2 * w)]} y={Y(tot) + 18} labels={["20'-0\"", '10″', "20'-0\""]} />
      <T x={X(tot / 2)} y={Y(tot) + 42} w={600}>
        Fig. 3
      </T>
    </Svg>
  )
}
const Fig4 = () => (
  <div className="flex flex-wrap items-end justify-center gap-4">
    <div className="flex-1 min-w-[18rem]">
      <SSBeam
        L={38}
        segs={[12, 14, 12]}
        udl={['2.0 kip/ft (including self-wt.)']}
        points={[
          { x: 12, label: '40 kip' },
          { x: 26, label: '40 kip' },
        ]}
        note="ALL LOADS ARE FACTORED — Fig. 4"
      />
    </div>
    <div className="w-40">
      <RectSec b={12} h={20} rows={[{ y: 17.5, n: 2, db: 1 }]} right={[{ y1: 0, y2: 20, label: '20″' }]} stirrup s={6} title="BEAM SECTION" />
    </div>
  </div>
)
const Fig5 = () => <SSBeam L={20} udl={['w kip/ft (total working load)']} note="Fig. 5" />
const Fig6 = () => <SSBeam L={24} udl={['L.L = 1.2 kip/ft', 'D.L = 1.5 kip/ft (excluding self wt)']} left="roller" right="pin" note="Fig. 6 — loads unfactored" />

/** crack patterns in a beam and a slab */
function CracksFig() {
  const W = 600
  const H = 250
  const x0 = 30
  const y0 = 40
  const L = 400
  const h = 60
  return (
    <Svg w={W} h={H}>
      <T x={x0 + L / 2} y={14} w={700}>
        Beam (simply supported, UDL)
      </T>
      <rect x={x0} y={y0} width={L} height={h} fill={C.conc} stroke={C.ink} />
      <Ln x1={x0} y1={y0 + h - 8} x2={x0 + L} y2={y0 + h - 8} c={C.steel} w={2} />
      {/* flexural cracks near midspan */}
      {[150, 175, 200, 225, 250].map((x) => (
        <Ln key={x} x1={x0 + x} y1={y0 + h} x2={x0 + x} y2={y0 + h - (x === 200 ? 38 : 30)} c={C.bad} w={1.4} />
      ))}
      {/* diagonal tension near supports */}
      {[40, 70].map((x) => (
        <path key={x} d={`M ${x0 + x} ${y0 + h} q 10 -14 ${30} ${-42}`} fill="none" stroke={C.bad} strokeWidth={1.4} />
      ))}
      {[40, 70].map((x) => (
        <path key={'r' + x} d={`M ${x0 + L - x} ${y0 + h} q -10 -14 ${-30} ${-42}`} fill="none" stroke={C.bad} strokeWidth={1.4} />
      ))}
      {/* bond / splitting along the bar */}
      <Ln x1={x0 + 290} y1={y0 + h - 8} x2={x0 + 340} y2={y0 + h - 8} c={C.load} w={2.6} />
      <T x={x0 + 70} y={y0 + h + 16} s={11}>
        (i) diagonal tension (shear)
      </T>
      <T x={x0 + 200} y={y0 + h + 30} s={11}>
        (iii) flexural cracks
      </T>
      <T x={x0 + 330} y={y0 + h + 16} s={11} c={C.load}>
        (iv) bond / splitting along bar
      </T>
      <T x={x0 + L + 80} y={y0 + 20} s={11} c={C.mute}>
        vertical at max M,
      </T>
      <T x={x0 + L + 80} y={y0 + 36} s={11} c={C.mute}>
        inclined ≈ 45° near
      </T>
      <T x={x0 + L + 80} y={y0 + 52} s={11} c={C.mute}>
        supports (high V)
      </T>
      {/* slab plan with shrinkage cracks */}
      <T x={x0 + 100} y={140} w={700}>
        Slab plan — (ii) shrinkage
      </T>
      <rect x={x0} y={150} width={200} height={90} fill={C.conc} stroke={C.ink} strokeWidth={3} />
      <path d={`M ${x0 + 30} 150 l 8 20 l -6 18 l 10 22 M ${x0 + 90} 240 l -4 -18 l 9 -16 l -3 -20 M ${x0 + 150} 150 l 6 15 l -8 20 l 6 18 M ${x0 + 200} 150 l -26 24`} fill="none" stroke={C.bad} strokeWidth={1.2} />
      <T x={x0 + 300} y={170} s={11} a="start">
        shrinkage: fine cracks across the restrained direction,
      </T>
      <T x={x0 + 300} y={186} s={11} a="start">
        map cracking, and at re-entrant corners;
      </T>
      <T x={x0 + 300} y={202} s={11} a="start">
        uniform along the member, not tied to M or V
      </T>
    </Svg>
  )
}

/** curtailment in a tapered cantilever: moment demand against the stepped capacity */
function CantCurtailFig() {
  const W = 560
  const H = 230
  const x0 = 60
  const L = 420
  const X = (u: number) => x0 + u * L
  const y0 = 20
  return (
    <Svg w={W} h={H}>
      <rect x={x0 - 30} y={y0} width={30} height={90} fill={C.mute} opacity={0.4} stroke={C.ink} />
      <path d={`M ${x0} ${y0} L ${x0 + L} ${y0} L ${x0 + L} ${y0 + 30} L ${x0} ${y0 + 80} Z`} fill={C.conc} stroke={C.ink} />
      <Ln x1={x0 - 20} y1={y0 + 6} x2={x0 + L - 4} y2={y0 + 6} c={C.steel} w={2} />
      <Ln x1={x0 - 20} y1={y0 + 10} x2={X(0.55)} y2={y0 + 10} c={C.load} w={2} />
      <T x={X(0.75)} y={y0 + 46} s={11}>
        depth decreases → d(x) and φMn(x) fall too
      </T>
      {/* diagram */}
      {(() => {
        const yb = 210
        const sc = 80
        const M = (u: number) => (1 - u) ** 2
        const pts = Array.from({ length: 21 }, (_, i) => `${X(i / 20)},${yb - M(i / 20) * sc}`).join(' ')
        const cap = (n: number) => (u: number) => n * (0.36 + 0.64 * (1 - u)) * 0.36
        const c3 = Array.from({ length: 21 }, (_, i) => `${X(i / 20)},${yb - cap(3)(i / 20) * sc}`).join(' ')
        const c2 = Array.from({ length: 21 }, (_, i) => `${X(i / 20)},${yb - cap(2)(i / 20) * sc}`).join(' ')
        return (
          <g>
            <Ln x1={x0} y1={yb} x2={X(1)} y2={yb} />
            <polyline points={pts} fill="none" stroke={C.load} strokeWidth={2} />
            <polyline points={c3} fill="none" stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 3" />
            <polyline points={c2} fill="none" stroke={C.steel} strokeWidth={1.5} strokeDasharray="5 3" />
            <T x={X(0.12)} y={yb - 92} s={11} c={C.load} a="start">
              Mu(x)
            </T>
            <T x={X(0.6)} y={yb - 62} s={11} c={C.accent}>
              φMn(x), all bars
            </T>
            <T x={X(0.7)} y={yb - 30} s={11} c={C.steel}>
              φMn(x), bars left after the cut
            </T>
            <Arrow x1={X(0.28)} y1={yb - 10} x2={X(0.28)} y2={yb - 40} c={C.ink} w={1} head={5} />
            <T x={X(0.28)} y={yb + 10} s={11}>
              theoretical cut-off (curves cross), then + d or 12db
            </T>
          </g>
        )
      })()}
    </Svg>
  )
}

// ================================================================ data
const S1a: CantSlabInput = { span: 12, support: 12, cantL: 0, cantR: 5, ll: 60, ff: 30, pw: 50, fc: 3000, fy: 60000 }
const L2 = () => beamLoads({ span: 21, support: 'ss', sdl: 1.8, ll: 2.0 })
const O2a = () => ({ L: 21, b: 12, k: 0.6, fc: 3000, fy: 60000, MuFixed: L2().Mu })
const P2b = (): DoublyDesignIn => ({ b: 12, d: 12.5, dt: 12.5, dp: 2.5, fc: 3.5, fy: 60, Mu: L2().Mu })
const B3a: BeffIn = { kind: 'interior', L: 25, bw: 16, hf: 3, cc: 48 }
const T3a = (beff: number) => ({ Mu: 720, beff, bw: 16, hf: 3, d: 24, dt: 25, fc: 3, fy: 60 })
const P3corner: TwoWayInput = { lx: 20, ly: 20, edges: { top: true, right: true, bottom: false, left: false }, ll: 60, ff: 25, pw: 50, fc: 3000, fy: 40000 }
const P3end: TwoWayInput = { lx: 20, ly: 20, edges: { top: false, right: false, bottom: true, left: false }, ll: 60, ff: 25, pw: 50, fc: 3000, fy: 40000 }
const bm4a: ShearBeam = {
  kind: 'ss',
  L: 38,
  wD: 2.0,
  P: [
    { x: 12, P: 40 },
    { x: 26, P: 40 },
  ],
  factored: true,
}
const sec4a: ShearSection = { bw: 12, d: 17.5, fc: 4000, fy: 60000 }
const E5c: ElasticInput = { b: 10, h: 24, d: 21.5, As: 2.37, fc: 4000 }
const E6c: ElasticInput = { b: 12, h: 24, d: 21.5, As: 3.0, fc: 4000, n: 9, frPsi: 400 }
const I6c: SinglyInput = { b: 12, fc: 4000, fy: 60000, layers: [{ As: 3.0, d: 21.5 }] }
const w5c = () => {
  const a = allowableMoment(E5c, 1.8, 24)
  return { a, W: (8 * a.M) / (20 * 20) }
}

/** Q8(a): ρ = 0.6ρmax design with self-weight, then cut-off of part of the bars */
const O8a = { L: 24, b: 12, k: 0.6, fc: 4000, fy: 60000, sdl: 1.5, ll: 1.2 }
let k8c: ReturnType<typeof kRhoDesign> | undefined
const k8 = () => (k8c ??= kRhoDesign(O8a))
const cut8 = () => {
  const g = k8()
  const no = +g.bars.bar
  const b0 = bar(`#${no}`)
  const ld = ldSimplified({ db: b0.db, small: b0.small, fc: 4000, fy: 60000, met: true }).final
  const nCut = g.bars.n >= 3 ? Math.floor(g.bars.n / 2) : 0
  const wu = g.loads!.wu
  const c = nCut ? cutoff({ dg: { kind: 'ss', L: 24, wu }, b: 12, d: g.sec.dAct, fc: 4000, fy: 60000, bar: b0, nTotal: g.bars.n, nCut, ld }) : undefined
  return { g, no, ld, nCut, wu, c }
}

function Sol8a() {
  const { g, no, ld, nCut, wu, c } = cut8()
  return (
    <Sol>
      <Note>No section is given: b = 12 in and ρ = 0.6ρmax chosen (gives a ductile, economical beam), self-weight iterated.</Note>
      <KRhoSol o={O8a} />
      <Hd>Bar cut-off from the moment diagram</Hd>
      {c ? (
        <>
          <SolSteps
            steps={[
              st('Development length (bottom bars, simplified)', `\\ell_d = \\frac{f_y}{${b0small(no) ? 25 : 20}\\sqrt{f'_c}}d_b = ${f(ld, 1)}\\text{ in}`),
              st('Capacity of the bars left', `${g.bars.n - nCut}\\text{ No. ${no}}: a = ${f(c.remain.a)}\\text{ in},\\ \\phi M_n = ${f(c.remain.phiMn, 1)}\\text{ k-ft}\\quad (\\text{all ${g.bars.n} bars: } ${f(c.all.phiMn, 1)}\\text{ k-ft vs } M_u = ${f(c.Mmax, 1)})`),
              st('Theoretical cut-off', `M(x) = \\frac{w_ux(L - x)}{2} = ${f(c.remain.phiMn, 1)} \\Rightarrow x = ${f(c.xTheo, 2)}\\text{ ft from the support}`, `$w_u = ${f(wu)}$ k/ft.`),
              st('Actual cut-off', `\\text{extend } \\max(d, 12d_b) = ${f(c.ext, 2)}\\text{ in} \\Rightarrow x = ${f(c.xExt, 2)}\\text{ ft};\\ \\ell_d\\text{ from midspan} \\Rightarrow x \\le ${f(12 - ld / 12, 2)}\\text{ ft} \\Rightarrow \\text{cut at } ${f(c.xCut, 2)}\\text{ ft}`),
              st('Continuing bars', `\\text{available } ${f(c.availCont, 1)}\\text{ in} ${c.contOK ? '\\ge' : '<'} \\ell_d = ${f(ld, 1)}\\text{ in};\\ ${f(c.fracRemain * 100, 0)}\\%\\text{ continue into the supports } (\\ge 1/3)`, c.ssCheck ? `Simple-support check $\\ell_d \\le 1.3M_n/V_u + \\ell_a = ${f(c.ssCheck.limit, 1)}$ in ${c.ssCheck.ok ? '✓' : '✗'}.` : undefined),
            ]}
          />
          <Note>Cutting bars in a tension zone is permitted only if one ACI condition holds (e.g. Vu ≤ ⅔φVn at the cut point, extra stirrups, or the continuing bars give twice the area required and Vu ≤ ¾φVn) — check with the shear at the cut point.</Note>
          <Ans>{`${barTxt(g.bars.n, no)} bottom; ${nCut} bars cut ${f(c.xCut, 2)} ft from each support, ${g.bars.n - nCut} bars run ≥ 6 in into the supports.`}</Ans>
        </>
      ) : (
        <Note>Only two bars are needed, so no bar is cut off (at least two bars must run the full length).</Note>
      )}
    </Sol>
  )
}
const b0small = (no: number) => no <= 6

// ================================================================ questions
export const R2014: RcQ[] = [
  // solve: one-way slab, 12 ft span + 5 ft cantilever, LL patterns, statics; bars and sketch
  {
    id: 'rc-2014-15-1a',
    paper: '2014-15',
    sec: 'A',
    no: '1(a)',
    marks: 23,
    topics: ['rc-oneway'],
    title: 'One-way slab: 12 ft span + 5 ft cantilever, LL patterns',
    pages: [53, 55],
    text: r`A 12 ft clear span one-way slab with an overhanging cantilever slab of 5 ft is shown in Fig. 1. The slab supports live load 60 psf in addition to its own self-wt. The live load can occupy any portion or any position on the slab. Assume partition wall load 50 psf and floor finish load 30 psf. Design the slab using USD method. Show reinforcement details in neat sketches.

Material strength: $f'_c = 3$ ksi and $f_y = 60$ ksi.`,
    given: [],
    figure: Fig1,
    checks: () => {
      const c = cantSlab(S1a)
      return [
        { key: 'h', label: 'Slab thickness h', value: c.h, unit: 'in' },
        { key: 'mn', label: 'Max negative moment (cantilever face)', value: c.Mneg, unit: 'k-ft/ft' },
        { key: 'mp', label: 'Max positive moment (LL on the span only)', value: c.Mpos, unit: 'k-ft/ft', tol: 0.03 },
      ]
    },
    solution: () => <CantSlabSol p={S1a} note="12 in beams assumed; the left edge beam is treated as a simple support (its partial restraint is ignored, giving a conservative +M)." />,
    notes: ['h is not given. The left support is a monolithic edge beam (partial restraint). The slab-solutions PDF also assumed 12″ beams.'],
  },
  {
    id: 'rc-2014-15-1b',
    paper: '2014-15',
    sec: 'A',
    no: '1(b)',
    marks: 12,
    topics: ['rc-basics', 'rc-shear', 'rc-bond'],
    title: 'Sketch shear, shrinkage, flexural and bond cracks',
    pages: PG.A,
    theory: true,
    text: 'Show with neat sketches the following cracks in beam and slab: (i) shear crack, diagonal tension; (ii) shrinkage cracks; (iii) flexural cracks due to bending; (iv) bond cracks.',
    solution: () => (
      <AnsMd
        a={r`- **(i) Shear / diagonal-tension cracks**: inclined at about 45°, in the high-shear zones near supports (or near concentrated loads). *Web-shear* cracks start near mid-depth where M is small; *flexure-shear* cracks start as vertical flexural cracks and bend over towards the load. Controlled by stirrups.
- **(ii) Shrinkage cracks**: drying shrinkage restrained by supports/steel → fine cracks roughly uniform along the member, across the restrained direction; map cracking on slab surfaces and diagonal cracks at re-entrant corners. Controlled by T&S steel, curing and joints.
- **(iii) Flexural cracks**: vertical, start at the tension face where M is largest (bottom at midspan, top over supports and cantilevers), widest at the face and closing towards the neutral axis. Controlled by well-distributed bars and limiting $f_s$.
- **(iv) Bond (splitting) cracks**: longitudinal cracks running **along** the bar on the bottom or side face, caused by the radial wedging of the bar ribs when cover or bar spacing is small (anchorage zones, laps). Controlled by enough cover, spacing, $\ell_d$ and confining stirrups.`}
        fig={<CracksFig />}
      />
    ),
  },
  // solve: full design — Mu from service DL + LL, choose b = 12, ρ = 0.6ρmax → d, h, As
  {
    id: 'rc-2014-15-2a',
    paper: '2014-15',
    sec: 'A',
    no: '2(a)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Design a 21 ft simply supported beam (choose b, h, As)',
    pages: PG.A,
    text: r`Design a simply supported rectangular beam with a span of 21 ft that is to carry a service DL of 1.8 kip/ft (including self-wt) and a service LL of 2.0 kip/ft. Follow USD method. Material strengths are: $f'_c = 3$ ksi and $f_y = 60$ ksi.`,
    given: [],
    checks: () => {
      const g = kRhoDesign(O2a())
      return [
        { key: 'mu', label: 'Design moment $M_u$', value: g.Mu, unit: 'k-ft' },
        { key: 'd', label: 'Required d for b = 12 in, ρ = 0.6ρmax', value: g.sec.d, unit: 'in', tol: 0.03 },
        { key: 'as', label: 'Tension steel $A_s$ for the rounded section', value: g.D.As, unit: 'in²', tol: 0.04 },
      ]
    },
    solution: () => (
      <Sol>
        <Note>The section is free: b = 12 in and ρ = 0.6ρmax are chosen (any reasonable choice with εt ≥ 0.005 earns the marks).</Note>
        <SolSteps steps={L2().steps} />
        <KRhoSol o={O2a()} />
      </Sol>
    ),
  },
  // solve: same beam, 12 × 15 restricted — doubly design (d = 12.5, d' = 2.5, f'c = 3.5)
  {
    id: 'rc-2014-15-2b',
    paper: '2014-15',
    sec: 'A',
    no: '2(b)',
    marks: 15,
    topics: ['rc-doubly'],
    title: 'Same beam restricted to 12″ × 15″: compression steel',
    pages: PG.A,
    text: r`From architectural considerations if the size of the beam is restricted to 12″ width and 15″ total depth, determine the flexural reinforcement for the beam including compression steel if necessary. Assume $d' = 2.5''$; $f'_c = 3.5$ ksi and $f_y = 60$ ksi.

(Beam of Q2(a): 21 ft simple span, service DL 1.8 kip/ft including self-weight, LL 2.0 kip/ft.)`,
    given: [],
    checks: () => {
      const g = designDoubly(P2b())
      return [
        { key: 'm1', label: 'φMn of the largest singly reinforced section', value: g.sm.phiMn1, unit: 'k-ft' },
        { key: 'asp', label: "Compression steel $A'_s$", value: g.Asp, unit: 'in²', tol: 0.04 },
        { key: 'as', label: 'Tension steel $A_s$', value: g.As, unit: 'in²', tol: 0.04 },
      ]
    },
    solution: () => <DoublyDesignSol p={P2b()} note={`Mu = ${f(L2().Mu, 1)} k-ft from Q2(a) (the given DL already includes self-weight). d = 15 − 2.5 = 12.5 in assumed; such heavy steel in a 12 × 15 section is impractical — a deeper section is the real answer.`} />,
    notes: ['d is not given (≈ 12.5 in for one layer). The given self-weight belongs to the original section, a minor inconsistency.'],
  },
  {
    id: 'rc-2014-15-2c',
    paper: '2014-15',
    sec: 'A',
    no: '2(c)',
    marks: 5,
    topics: ['rc-doubly'],
    title: 'Effect of compression steel on ultimate strength',
    pages: PG.A,
    theory: true,
    text: 'What is the effect of compression steel on the ultimate strength of beam?',
    solution: () => (
      <AnsMd
        a={r`- In an **under-reinforced** beam adding $A'_s$ increases $M_n$ only slightly (a few %): the compression force just moves from concrete to steel, the lever arm grows a little ($a$ becomes smaller).
- Its real value: it lets a **size-restricted** section carry much more moment while staying ductile — $M_n = (A_s - A'_s)f_y(d - a/2) + A'_sf_y(d - d')$ — because extra tension steel is balanced by $A'_s$ instead of by more concrete; the neutral axis rises and $\varepsilon_t$ increases (ρmax rises to $\bar\rho_{max} = \rho_{max} + \rho' f'_s/f_y$).
- Other benefits: **ductility** (larger strain at failure), **less long-term deflection** (creep of the compression zone is restrained), resists **moment reversal**, and holds stirrups in place.
- $A'_s$ is fully effective only if it yields: $\varepsilon'_s = 0.003(c - d')/c \ge \varepsilon_y$; otherwise use $f'_s = E_s\varepsilon'_s$.`}
      />
    ),
  },
  // solve: T-beam design, Mu = 720 k-ft, true T (Asf + Asw)
  {
    id: 'rc-2014-15-3a',
    paper: '2014-15',
    sec: 'A',
    no: '3(a)',
    marks: 17,
    topics: ['rc-tbeam'],
    title: 'T-beam midspan steel for Mu = 720 kip-ft (bw = 16, d = 24)',
    pages: [53, 55],
    text: r`A floor system consists of a 3.0 inch slab supported by continuous T-beams with 25 ft span, 48″ on centres as shown in Fig. 2. Web dimensions as determined by negative moment requirement at the support area is $b_w = 16''$ and $d = 24''$. What tensile area is required at midspan to resist a factored moment $M_u = 720$ kip-ft; if $f_y = 60$ ksi and $f'_c = 3$ ksi?`,
    given: [],
    figure: Fig2,
    checks: () => {
      const b = effectiveWidth(B3a).b
      const { t } = tDesignSteps(T3a(b))
      return [
        { key: 'beff', label: 'Effective flange width', value: b, unit: 'in' },
        { key: 'asf', label: 'Steel balancing the flange overhangs $A_{sf}$', value: t.Asf, unit: 'in²' },
        { key: 'as', label: 'Required $A_s$', value: t.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => {
      const { o, s } = beffSteps(B3a)
      const { t, s: s2 } = tDesignSteps(T3a(o.b))
      return (
        <Sol>
          <Note>dt = 25 in assumed for εt (bars in one row, d = 24 to the bar centre is used for strength).</Note>
          <SolSteps steps={[...s, ...s2]} />
          <Ans>{`$b_{eff} = ${f(o.b)}$ in; true T: $A_{sf} = ${f(t.Asf)}$, $A_{sw} = ${f(t.Asw)}$ → **$A_s = ${f(t.As)}$ in²** ($\\varepsilon_t = ${f(t.epsT, 4)}$).`}</Ans>
        </Sol>
      )
    },
  },
  // solve: L-shaped slab of three 20 × 20 panels on walls, fy = 40 ksi — corner (Case 4) and end panels (Case 6)
  {
    id: 'rc-2014-15-3b',
    paper: '2014-15',
    sec: 'A',
    no: '3(b)',
    marks: 18,
    topics: ['rc-twoway'],
    title: 'Three 20′ × 20′ two-way panels in an L (fy = 40 ksi)',
    pages: [53, 55, 56, 57],
    text: r`Design the slab system shown in Fig. 3. The slab is to carry a service live load of 60 psf. In addition to self-wt of slab, assume floor finish load to be 25 psf and partition wall load 50 psf. Given: $f'_c = 3$ ksi and $f_y = 40$ ksi. Use moment co-efficient method. Show all reinforcements in sketches.

(Fig. 3: three panels, each 20′-0″ × 20′-0″ clear, in an L on 10″ brick walls.)`,
    given: AIDS_TABLES,
    figure: Fig3,
    checks: () => {
      const c = twoWay(P3corner)
      const e = twoWay(P3end)
      return [
        { key: 'h', label: 'Slab thickness h (fy = 40 ksi)', value: c.h, unit: 'in' },
        { key: 'mc', label: 'Corner panel: negative moment at a continuous edge', value: c.M.aNeg ?? 0, unit: 'k-ft/ft' },
        { key: 'mp', label: 'Corner panel: positive moment (each way)', value: c.M.aPos, unit: 'k-ft/ft' },
        { key: 'me', label: 'End panel: positive moment, direction ⊥ to the continuous edge', value: e.M.aPos, unit: 'k-ft/ft' },
      ]
    },
    solution: () => (
      <Sol>
        <Hd>Corner panel — two adjacent edges continuous (Case 4)</Hd>
        <TwoWaySol p={P3corner} />
        <Hd>End panels — one edge continuous (Case 6, m = 1)</Hd>
        <TwoWaySol p={P3end} note="Same thickness as the corner panel. At the shared edges use the larger of the two panels' negative steel." />
      </Sol>
    ),
    notes: ['m = 1.0 for every panel. Square panels: the continuous edge is put on the "long" side (Case 6 rather than 7), as the handnote does. h is not given.'],
  },
  // solve: stirrups, SS 38 ft, two 40 k loads at 12 ft + 2.0 k/ft, d = 17.5, 3 sets
  {
    id: 'rc-2014-15-4a',
    paper: '2014-15',
    sec: 'A',
    no: '4(a)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Stirrups, 3 sets: 38 ft beam, two 40 k loads + 2.0 k/ft',
    pages: [53, 55],
    text: r`Design the stirrups for the beam shown in Fig. 4. Use $f'_c = 4$ ksi and $f_y = 60$ ksi. Calculate stirrups with 3 sets of spacing. Show the stirrups in a neat sketch.

(Fig. 4: span 12′ + 14′ + 12′ = 38 ft; $P_u = 40$ kip at 12 ft from each support; $w_u = 2.0$ kip/ft including self-weight; all loads factored; section 12″ × 20″ total.)`,
    given: [],
    figure: Fig4,
    checks: () => {
      const { R, at, g } = shearKey(bm4a, sec4a)
      return [
        { key: 'vd', label: 'Vu at d from the support', value: R.Vd, unit: 'k' },
        { key: 'pvc', label: 'φVc', value: g.lim.phiVc, unit: 'k' },
        { key: 's', label: 'Required spacing at the critical section', value: at.s, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => <ShearSol bm={bm4a} sec={sec4a} note="d = 20 − 2.5 = 17.5 in assumed. Near the supports φVs exceeds φ4√f′c·bw·d, so s ≤ d/4." />,
    notes: ['d is not given (≈ 17.5 in). Between the loads Vu is only 14 → 0 kip.'],
  },
  {
    id: 'rc-2014-15-4b',
    paper: '2014-15',
    sec: 'A',
    no: '4(b)',
    marks: 8,
    topics: ['rc-singly', 'rc-tbeam'],
    title: 'Why a lower limit on ρ; values for rectangular and T-beams',
    pages: PG.A,
    theory: true,
    text: 'Why ACI code recommends a lower limit for steel ratio of beams in flexure? Give the values of this limit for rectangular and T-beams.',
    solution: () => (
      <AnsMd
        a={
          ANS.minSteel +
          r`

### T-beams in particular
- Flange in compression (positive moment): use $b_w$ in the formula, $A_{s,min} = \max(3\sqrt{f'_c}, 200)b_wd/f_y$.
- Statically determinate T-beam with the **flange in tension** (e.g. a cantilever T): the cracking moment is larger, so ACI 318-08 replaces $b_w$ by the smaller of $2b_w$ and $b_f$ (older codes: the smaller of $6\sqrt{f'_c}b_wd/f_y$ and $3\sqrt{f'_c}b_fd/f_y$).`
        }
      />
    ),
  },
  {
    id: 'rc-2014-15-4c',
    paper: '2014-15',
    sec: 'A',
    no: '4(c)',
    marks: 7,
    topics: ['rc-singly'],
    title: 'Under-reinforced, balanced and over-reinforced sections',
    pages: PG.A,
    theory: true,
    text: 'What do you mean by under-reinforced, balanced and over-reinforced section in RC design?',
    solution: () => (
      <AnsMd
        a={
          r`- **Balanced section** ($\rho = \rho_b$): the steel reaches $\varepsilon_y$ at the same moment the concrete reaches $\varepsilon_{cu} = 0.003$. $c_b = \dfrac{0.003}{0.003 + \varepsilon_y}d$, $\rho_b = 0.85\beta_1\dfrac{f'_c}{f_y}\dfrac{87}{87 + f_y}$ ($f_y$ in ksi). For 4 ksi / 60 ksi: $\rho_b = 0.0285$.
` + ANS.underOver
        }
      />
    ),
  },
  {
    id: 'rc-2014-15-5a',
    paper: '2014-15',
    sec: 'B',
    no: '5(a)',
    marks: 8,
    topics: ['rc-basics'],
    title: 'Concrete stress–strain curves and design parameters',
    pages: PG.B,
    theory: true,
    text: 'Draw the stress-strain curve of concrete in compression (for different strengths) and indicate different design parameters on it.',
    solution: () => (
      <AnsMd
        a={r`- Curves rise almost linearly up to about $0.4$–$0.5f'_c$, then curve over to the peak $f'_c$ at $\varepsilon_0 \approx 0.002$, then descend; crushing at about 0.003–0.004.
- **Higher strength** → steeper initial slope (larger $E_c$), peak strain slightly larger, **steeper descending branch** (more brittle) and smaller ultimate strain.
- Design parameters marked: $f'_c$ (28-day cylinder strength); $E_c = 57\,000\sqrt{f'_c}$ psi (secant modulus to about $0.45f'_c$); **$0.45f'_c$** — elastic limit / WSD allowable; **$\varepsilon_{cu} = 0.003$** — ACI crushing strain at nominal strength; **$0.85f'_c$** — Whitney block stress (also the sustained-load strength); $f_r = 7.5\sqrt{f'_c}$ in tension.`}
        fig={<StressStrainFig />}
      />
    ),
  },
  {
    id: 'rc-2014-15-5b',
    paper: '2014-15',
    sec: 'B',
    no: '5(b)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Reasons for minimum cover (ACI)',
    pages: PG.B,
    theory: true,
    text: 'Give reasons for the minimum cover requirements in the ACI code.',
    solution: () => <AnsMd a={ANS.cover} />,
  },
  // solve: WSD — cracked section, allowable M from fc = 0.45f'c and fs = 24 ksi, then W = 8M/L²
  {
    id: 'rc-2014-15-5c',
    paper: '2014-15',
    sec: 'B',
    no: '5(c)',
    marks: 20,
    topics: ['rc-elastic'],
    title: 'Maximum working load W on a 20 ft beam (10 × 24, 3 No. 8)',
    pages: [54, 55],
    text: r`The beam shown in Fig. 5, loaded by total working load of $W$ kip/ft, has a rectangular section of width 10″ and total depth 24″. Bottom reinforcement consists of 3 No. 8 in one layer. Determine the maximum value of $W$ that can be applied without stressing concrete and steel beyond the allowable values.

Given: $f'_c = 4000$ psi and $f_y = 60\,000$ psi. (Fig. 5: simple span 20′-0″.)`,
    given: [],
    figure: Fig5,
    checks: () => {
      const { a, W } = w5c()
      return [
        { key: 'kd', label: 'Cracked neutral axis kd', value: a.kd, unit: 'in' },
        { key: 'm', label: 'Allowable moment', value: a.M, unit: 'k-ft' },
        { key: 'w', label: 'Maximum total working load W', value: W, unit: 'k/ft' },
      ]
    },
    solution: () => {
      const { a, W } = w5c()
      return (
        <Sol>
          <Note>Not printed, assumed: allowable $f_c = 0.45f'_c = 1800$ psi, $f_s = 24$ ksi (Grade 60), $n = E_s/E_c = 8$, $d = 24 − 2.5 = 21.5$ in. W is the total load, so it includes self-weight.</Note>
          <SolSteps steps={a.steps} />
          <SolSteps steps={[st('Maximum load', `W = \\frac{8M_{all}}{L^2} = \\frac{8(${f(a.M, 1)})}{20^2} = ${f(W)}\\text{ k/ft}`)]} start={a.steps.length + 1} />
          <Ans>{`$M_{all} = ${f(a.M, 1)}$ k-ft (${a.governs} governs) → **W = ${f(W)} k/ft** (total, including the ${f((10 * 24 / 144) * 0.15)} k/ft self-weight).`}</Ans>
        </Sol>
      )
    },
    notes: ['The allowable stresses, n and d are not given: fc = 0.45f′c, fs = 24 ksi, n = 8, d ≈ 21.5 in assumed.'],
  },
  {
    id: 'rc-2014-15-6a',
    paper: '2014-15',
    sec: 'B',
    no: '6(a)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Why DL and LL have different load factors',
    pages: PG.B,
    theory: true,
    text: 'State why the load factor for dead load and live load is different in USD method?',
    solution: () => (
      <AnsMd
        a={r`- A load factor covers the chance that the actual load **exceeds** its specified value; that chance depends on how variable the load is.
- **Dead load** is computed from member sizes and known unit weights; it is controlled by the designer and varies little → small factor, **1.2** (1.4D alone).
- **Live load** depends on occupancy, is controlled by the owner/user, can change with use (storage, crowding, change of occupancy) and is placed in patterns → much more uncertain → larger factor, **1.6**.
- So $U = 1.2D + 1.6L$ gives about the same probability of overload for both kinds of load (≈ 1/1000). When wind/earthquake are combined, the LL factor is reduced (0.5–1.0) because full LL and the extreme W/E rarely occur together.`}
      />
    ),
  },
  {
    id: 'rc-2014-15-6b',
    paper: '2014-15',
    sec: 'B',
    no: '6(b)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Why φ is used and why it differs between cases',
    pages: PG.B,
    theory: true,
    text: 'Why strength reduction factor φ is used in strength design method? Why the value is different for different cases? Explain briefly.',
    solution: () => (
      <AnsMd
        a={r`### Why φ
- The real strength can be lower than the computed nominal strength $S_n$: material strengths below specified, smaller dimensions, misplaced bars, and approximations in the design equations.
- φ < 1 gives the **understrength** margin: design strength $\phi S_n \ge U$. It also reflects the **ductility** and **importance** of the member.

### Why it differs
- **Tension-controlled flexure, φ = 0.90**: ductile, warns before failure, strength predicted accurately and depends mainly on $f_y$ (reliable).
- **Compression-controlled tied columns, φ = 0.65; spiral, 0.75**: brittle, depend on concrete strength (more variable), and a column failure can bring down several floors; spirals give more ductility.
- **Shear and torsion, φ = 0.75**: brittle, less well understood, larger scatter in tests.
- **Bearing on concrete, φ = 0.65**; transition-zone flexure interpolates between 0.65 and 0.90 according to $\varepsilon_t$.`}
      />
    ),
  },
  // solve: (i) Mcr with n = 9, fr = 400; (ii) allowable working moment; (iii) USD Mn and φMn
  {
    id: 'rc-2014-15-6c',
    paper: '2014-15',
    sec: 'B',
    no: '6(c)',
    marks: 21,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Mcr, maximum working moment and φMn of 12 × 24 with 3 No. 9',
    pages: PG.B,
    text: r`A singly reinforced rectangular section has 12″ width and 24″ total depth. The tension reinforcement consists of 3 No. 9 bar. Given: $f'_c = 4000$ psi, $f_y = 60\,000$ psi, $f_s = 24\,000$ psi, $n = 9$ and $f_r = 400$ psi. Determine:
- (i) Cracking moment
- (ii) Maximum working moment
- (iii) Nominal flexural strength and design ultimate moment`,
    given: [],
    checks: () => {
      const u = uncracked(E6c)
      const a = allowableMoment(E6c, 1.8, 24)
      const g = review(I6c)
      return [
        { key: 'mcr', label: '(i) Cracking moment', value: u.Mcr, unit: 'k-ft' },
        { key: 'ma', label: '(ii) Maximum working moment', value: a.M, unit: 'k-ft' },
        { key: 'mn', label: '(iii) Nominal strength $M_n$', value: g.Mn, unit: 'k-ft' },
        { key: 'pmn', label: '(iii) Design moment $\\phi M_n$', value: g.phiMn, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <Sol>
        <McrAllowSol inp={E6c} fcAllow={1.8} fsAllow={24} note="d is not given: d = 24 − 2.5 = 21.5 in. Allowable fc not given: 0.45f′c = 1800 psi. n = 9 as printed (Es/Ec ≈ 8 for 4000 psi)." />
        <Hd>(iii) Ultimate strength (USD)</Hd>
        <SinglyReviewSol inp={I6c} />
      </Sol>
    ),
    notes: ['d not given (≈ 21.5 in); allowable fc not given (0.45f′c). Twin of 2016-17 Q5(a).'],
  },
  {
    id: 'rc-2014-15-7a',
    paper: '2014-15',
    sec: 'B',
    no: '7(a)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Factors affecting development length',
    pages: PG.B,
    theory: true,
    text: 'Explain briefly the factors which affect the development length of tension rebars.',
    solution: () => <AnsMd a={ANS.ldFactors} />,
  },
  {
    id: 'rc-2014-15-7b',
    paper: '2014-15',
    sec: 'B',
    no: '7(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Class A and class B tension splices',
    pages: PG.B,
    theory: true,
    text: 'Explain briefly the class A and class B splices for tension rebars.',
    solution: () => <AnsMd a={ANS.classAB} />,
  },
  // solve: ℓd for #6 and #9, top and other bars (simplified), and 90° hook ℓdh
  {
    id: 'rc-2014-15-7c',
    paper: '2014-15',
    sec: 'B',
    no: '7(c)',
    marks: 20,
    topics: ['rc-bond'],
    title: 'ℓd of #6 and #9 (top / other) vs 90° hooks',
    pages: PG.B,
    text: r`Calculate the development length (for tension rebars) by USD method for #6 and #9 bars when used as (i) top bars (ii) other bars. Compare the values, when these rebars are 90° hooked.

Given: $f'_c = 4000$ psi, $f_y = 60\,000$ psi, uncoated rebar and the beam section is 12″ × 20″. Use the simplified formula.`,
    given: [],
    checks: () => [
      { key: 't6', label: '#6 top bar ℓd', value: ldRow('#6', 4000, 60000, true).r.final, unit: 'in', tol: 0.03 },
      { key: 'o9', label: '#9 other bar ℓd', value: ldRow('#9', 4000, 60000, false).r.final, unit: 'in', tol: 0.03 },
      { key: 't9', label: '#9 top bar ℓd', value: ldRow('#9', 4000, 60000, true).r.final, unit: 'in', tol: 0.03 },
    ],
    solution: () => <LdSol ids={['#6', '#9']} fc={4000} fy={60000} hooks note="12 × 20 beam: with 1.5 in cover and No. 3 stirrups the clear cover exceeds db and normal bar spacing exceeds db, with code-minimum stirrups → first row of the simplified table. A 20 in beam has more than 12 in of concrete below the top bars, so ψt = 1.3 applies." />,
  },
  // solve: design (b = 12, ρ = 0.6ρmax, self-weight) then cut-off of half the bars from the moment diagram, ℓd check
  {
    id: 'rc-2014-15-8a',
    paper: '2014-15',
    sec: 'B',
    no: '8(a)',
    marks: 25,
    topics: ['rc-bond', 'rc-singly'],
    title: 'Design a 24 ft beam and locate bar cut-off points',
    pages: [54, 55],
    text: r`Design the singly reinforced beam shown in Fig. 6 (for flexure only) by USD method. Show the bar cut off points of rebars (if permitted by the code) using moment diagram. Use simplified equation for development length calculation. The loads are unfactored.

Given: $f'_c = 4000$ psi and $f_y = 60\,000$ psi. (Fig. 6: simple span 24′-0″; LL = 1.2 kip/ft; DL = 1.5 kip/ft excluding self-weight.)`,
    given: [],
    figure: Fig6,
    checks: () => {
      const { g, c } = cut8()
      return [
        { key: 'mu', label: 'Design moment $M_u$ (with self-weight)', value: g.Mu, unit: 'k-ft', tol: 0.03 },
        { key: 'as', label: 'Tension steel $A_s$', value: g.D.As, unit: 'in²', tol: 0.04 },
        ...(c ? [{ key: 'x', label: 'Theoretical cut-off point from the support', value: c.xTheo, unit: 'ft', tol: 0.04 }] : []),
      ]
    },
    solution: () => <Sol8a />,
    notes: ['No section is given, so b and h are chosen (b = 12 in, ρ = 0.6ρmax here).'],
  },
  {
    id: 'rc-2014-15-8b',
    paper: '2014-15',
    sec: 'B',
    no: '8(b)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'Curtailing bars in a cantilever of variable depth',
    pages: PG.B,
    theory: true,
    text: 'Explain the procedure, you may require for the curtailment of rebars in a cantilever beam with variable depth.',
    solution: () => (
      <AnsMd
        a={r`1. Draw the factored **moment diagram** $M_u(x)$ of the cantilever (maximum at the support face, zero at the tip).
2. Because the depth tapers, **d varies along the beam**: $d(x) = d_{support} - (d_{support} - d_{tip})\,x/L$. The capacity of a bar group is not constant: $\phi M_n(x) = \phi A_sf_y\,[d(x) - a/2]$.
3. Plot the **resisting-moment curves** $\phi M_n(x)$ for all bars, and for the bars left after each cut, on the same diagram as $M_u(x)$.
4. The **theoretical cut-off** of a group is where $M_u(x)$ meets the capacity curve of the bars that remain — found graphically or by solving $M_u(x) = \phi M_n(x)$ (unlike a prismatic beam, both sides change with x).
5. Extend each cut bar **d (at that section) or 12db**, whichever is larger, beyond the theoretical point; it must also have **ℓd** beyond the point of maximum stress (the support face).
6. The continuing bars must have **ℓd beyond the theoretical cut-off** of the cut bars; at least 1/3 of the top bars should reach the free end, anchored with cover/hooks.
7. Anchor all top bars into the support (column/backspan) by $\ell_d$ (top-bar factor 1.3) or a standard hook ($\ell_{dh}$).
8. Cutting in a tension zone needs one of the ACI shear conditions ($V_u \le \tfrac23\phi V_n$, extra stirrups, or twice the steel required). In a tapered member the inclined compression face also changes the effective shear ($V_u - \tfrac{M_u}{d}\tan\beta$).`}
        fig={<CantCurtailFig />}
      />
    ),
  },
]

