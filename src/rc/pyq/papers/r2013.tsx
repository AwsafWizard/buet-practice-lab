// 2013-14 term final (held 30 Jul 2015), PDF pp. 58–62. No design aids attached.
// Sec B (Q5–Q9, answer 4 of 5, 26¼ marks each) is entirely about the Fig. 4 cantilever test beam.
import type { RcQ } from '../../types'
import { SolSteps } from '../../topics/elastic/ui'
import { f, allowableMoment, uncracked, type ElasticInput } from '../../engine/elastic'
import { concreteStress, limits, review, type SinglyInput } from '../../engine/singly'
import { effectiveWidth, type BeffIn } from '../../engine/tbeam'
import { cantSlab, type CantSlabInput } from '../../engine/oneway'
import { bar, beamBarGeometry, columnAnchorage, cutoff, hookFactors, hookGeometry, ktr, ldGeneral, ldhCalc, tensionLap } from '../../engine/bond'
import { designShear, type ShearBeam, type ShearSection } from '../../engine/shear'
import { Ec } from '../../engine/materials'
import {
  ANS,
  Ans,
  AnsMd,
  Arrow,
  beffSteps,
  C,
  CantSlabSol,
  CutoffFig,
  DimChain,
  DimH,
  DimV,
  FloorSystemsFig,
  Hd,
  HoopFig,
  LdSol,
  ldRow,
  Ln,
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
  StagesFig,
  StressStrainFig,
  Svg,
  T,
  Tbl,
  tDesignSteps,
  TFloor,
} from './r2017'

const PG = { A1: [58], A2: [58], A3: [58], A4: [58], B5: [59, 62], B6: [59, 62], B7: [59, 62], B8: [60, 62], B9: [60, 62] }

// ================================================================ Fig. 4 data (all of Sec B)
const L4 = 8 // ft, cantilever from the column face
const SW = ((12 * 21) / 144) * 0.15 // 0.2625 k/ft
const E4: ElasticInput = { b: 12, h: 21, d: 18, As: 3.0, fc: 4000, n: 8, frPsi: 400 }
const I4: SinglyInput = { b: 12, h: 21, fc: 4000, fy: 60000, layers: [{ As: 3.0, d: 18 }] }
const MSW = (SW * L4 * L4) / 2 // k-ft at the face from self-weight

// ================================================================ figures
function Fig1() {
  const k = 14
  const x0 = 30
  const X = (ft: number) => x0 + ft * k
  const tot = 26
  return (
    <div className="space-y-2">
      <Svg w={X(tot) + 30} h={200}>
        <rect x={X(0)} y={30} width={tot * k} height={120} fill={C.conc} stroke={C.ink} />
        {[5.5, 20.5].map((x) => (
          <g key={x}>
            <Ln x1={X(x) - 7} y1={30} x2={X(x) - 7} y2={150} c={C.mute} dash="6 3" />
            <Ln x1={X(x) + 7} y1={30} x2={X(x) + 7} y2={150} c={C.mute} dash="6 3" />
            <rect x={X(x) - 8} y={30} width={16} height={12} fill={C.mute} stroke={C.ink} />
            <rect x={X(x) - 8} y={138} width={16} height={12} fill={C.mute} stroke={C.ink} />
            <T x={X(x) + 30} y={70} s={11}>
              BEAM
            </T>
          </g>
        ))}
        <T x={X(13)} y={18} s={11}>
          Free edge
        </T>
        <Ln x1={X(0) - 10} y1={95} x2={X(tot) + 10} y2={95} c={C.load} dash="8 4" />
        <T x={X(0) - 14} y={95} s={11} c={C.load}>
          B
        </T>
        <DimChain xs={[X(0), X(5), X(6), X(20), X(21), X(26)]} y={172} labels={["5'-0\"", '12″', "14'-0\"", '12″', "5'-0\""]} />
        <T x={X(13)} y={192} w={600}>
          Fig. 1 — plan
        </T>
      </Svg>
      <SlabStrip
        L={26}
        supports={[
          { x: 5.5, w: 12, kind: 'beam' },
          { x: 20.5, w: 12, kind: 'beam' },
        ]}
        dims={[
          { a: 0, b: 5, label: "5'-0\"" },
          { a: 6, b: 20, label: "14'-0\"" },
          { a: 21, b: 26, label: "5'-0\"" },
        ]}
        udl="DL 180 psf (incl. self-weight) + LL 80 psf, working"
        title="Section B-B — ONE WAY SLAB"
      />
    </div>
  )
}
const Fig2 = () => (
  <div className="flex flex-wrap items-end justify-center gap-4">
    <div className="flex-1 min-w-[18rem]">
      <SSBeam
        L={36}
        segs={[10, 16, 10]}
        udl={['2.0 kip/ft (including self-wt.)']}
        points={[
          { x: 10, label: '40 kip' },
          { x: 26, label: '40 kip' },
        ]}
        note="ALL LOADS ARE FACTORED — Fig. 2"
      />
    </div>
    <div className="w-44">
      <RectSec b={14} h={26.5} rows={[{ y: 24, n: 1, db: 1.4, label: 'As' }]} right={[{ y1: 0, y2: 24, label: '24″' }]} s={5} title="BEAM SECTION" />
    </div>
  </div>
)
const Fig3 = () => <TFloor hf={3} bw={12} sp={50} n={3} h={27} d={24} dAt={2} notes={['SPAN OF BEAMS = 30′-0″ · Mu = 700 kip-ft', 'Fig. 3']} />

/** Fig. 4 — cantilever test beam fixed at the column face, load P at the tip */
function Fig4() {
  const k = 26 // px per ft
  const cx = 60 // column left face
  const cw = 18 / 12
  const X = (ft: number) => cx + cw * k + ft * k
  const yT = 70
  const hb = (21 / 12) * k
  return (
    <div className="space-y-2">
      <Svg w={X(8) + 170} h={250}>
        <rect x={cx} y={20} width={cw * k} height={210} fill={C.conc} stroke={C.ink} />
        <rect x={X(0)} y={yT} width={8 * k} height={hb} fill={C.conc} stroke={C.ink} />
        {/* top bars */}
        <Ln x1={cx + 6} y1={yT + 6} x2={X(8) - 4} y2={yT + 6} c={C.steel} w={2.4} />
        <Ln x1={cx + 6} y1={yT + 6} x2={cx + 6} y2={yT + 40} c={C.steel} w={2.4} />
        <Ln x1={cx + 10} y1={yT + 10} x2={X(4.2)} y2={yT + 10} c={C.load} w={2.2} />
        <T x={X(4.2) + 4} y={yT + 24} s={11} c={C.load} a="start">
          centre bar discontinued
        </T>
        <T x={X(2)} y={yT - 10} s={11}>
          3-#9 → 2-#9 continue to the tip
        </T>
        <T x={cx - 4} y={yT + 30} s={11} a="end">
          standard hook
        </T>
        <DimH x1={cx} x2={cx + 6} y={yT + 52} label="2½″" below />
        <Arrow x1={X(8) - 2} y1={yT - 44} x2={X(8) - 2} y2={yT - 2} w={2.2} head={9} />
        <T x={X(8) - 2} y={yT - 52} w={700} c={C.load}>
          P
        </T>
        <DimV x={X(8) + 12} y1={yT} y2={yT + hb} label="21″" side="r" />
        <DimH x1={X(0)} x2={X(8)} y={yT + hb + 26} label="8′-0″" />
        <Ln x1={X(0)} y1={yT - 18} x2={X(0)} y2={yT + hb + 12} c={C.mute} dash="4 3" />
        <T x={X(0) + 4} y={yT + hb + 6} s={11} a="start" c={C.mute}>
          1–1 (column face)
        </T>
        <T x={cx + (cw * k) / 2} y={238} s={11}>
          column 18″ × 18″
        </T>
      </Svg>
      <div className="grid grid-cols-2 gap-2">
        <RectSec b={12} h={21} rows={[{ y: 3, n: 3, db: 1.128, label: '3-#9 (top)' }]} right={[{ y1: 3, y2: 21, label: 'd = 18″' }]} s={6} title="Sec. 1-1 (tension at the top)" />
        <RectSec
          b={18}
          h={18}
          cover={2.5}
          rows={[
            { y: 2.5, n: 2, db: 1.27, label: '4-#10' },
            { y: 15.5, n: 2, db: 1.27 },
          ]}
          stirrup
          s={5}
          title="Column section, #3 ties @ 10″"
        />
      </div>
      <Note>f′c = 4000 psi, fy = 60 000 psi, fr = 400 psi, n = 8; self-weight 12 × 21/144 × 0.150 = 0.2625 k/ft.</Note>
    </div>
  )
}

/** biaxial strength envelope (Kupfer) */
function BiaxialFig() {
  const W = 400
  const H = 360
  const o = { x: 300, y: 70 } // origin (σ1 = σ2 = 0); compression to the left/down
  const s = 180 // px per f'c
  const P = (a: number, b: number) => `${o.x + a * s},${o.y - b * s}` // a = σ1/f'c, b = σ2/f'c (tension +)
  const env = [
    [0.09, 0.09],
    [0.1, 0],
    [0.05, -0.6],
    [0, -1.0],
    [-0.4, -1.2],
    [-0.8, -1.25],
    [-1.16, -1.16],
    [-1.25, -0.8],
    [-1.2, -0.4],
    [-1.0, 0],
    [-0.6, 0.05],
    [0, 0.1],
    [0.09, 0.09],
  ]
  return (
    <Svg w={W} h={H}>
      <Ln x1={20} y1={o.y} x2={W - 10} y2={o.y} />
      <Ln x1={o.x} y1={10} x2={o.x} y2={H - 10} />
      <polygon points={env.map(([a, b]) => P(a, b)).join(' ')} fill={C.accent} opacity={0.12} stroke={C.accent} strokeWidth={2} />
      <T x={W - 14} y={o.y - 10} a="end" s={11}>
        σ1 (tension +)
      </T>
      <T x={o.x + 8} y={18} a="start" s={11}>
        σ2
      </T>
      <T x={o.x - 1.0 * s} y={o.y - 12} s={11}>
        −f′c
      </T>
      <T x={o.x - 0.62 * s} y={o.y + 0.62 * s} s={11}>
        compression–compression
      </T>
      <T x={o.x - 0.62 * s} y={o.y + 0.75 * s} s={11}>
        up to ≈ 1.25f′c
      </T>
      <T x={o.x + 50} y={o.y + 0.5 * s} s={11}>
        C–T
      </T>
      <T x={o.x - 0.5 * s} y={o.y - 26} s={11}>
        C–T
      </T>
      <T x={o.x + 40} y={o.y - 30} s={11}>
        T–T ≈ ft
      </T>
      <circle cx={o.x - 1.0 * s} cy={o.y} r={5} fill={C.load} />
      <T x={o.x - 1.0 * s} y={o.y + 16} s={11} c={C.load}>
        cylinder
      </T>
      <circle cx={o.x - 1.18 * s} cy={o.y + 0.25 * s} r={5} fill={C.bad} />
      <T x={o.x - 1.18 * s - 6} y={o.y + 0.25 * s + 16} s={11} c={C.bad} a="start">
        cube (platen-confined)
      </T>
    </Svg>
  )
}

/** strain and stress at the balanced condition */
function RhoBFig() {
  const W = 480
  const H = 220
  const y0 = 30
  const h = 150
  const d = 130
  const cb = 0.59 * d
  return (
    <Svg w={W} h={H}>
      <rect x={30} y={y0} width={70} height={h} fill={C.conc} stroke={C.ink} />
      {[45, 65, 85].map((x) => (
        <circle key={x} cx={x} cy={y0 + d} r={4} fill={C.steel} />
      ))}
      <DimH x1={30} x2={100} y={y0 + h + 18} label="b" below />
      <DimV x={18} y1={y0} y2={y0 + d} label="d" side="l" />
      {/* strain */}
      <Ln x1={190} y1={y0} x2={190} y2={y0 + h} c={C.mute} />
      <path d={`M 190 ${y0} L 160 ${y0} L 240 ${y0 + d} L 190 ${y0 + d}`} fill={C.accent} opacity={0.15} stroke={C.accent} />
      <Ln x1={130} y1={y0 + cb} x2={260} y2={y0 + cb} c={C.mute} dash="4 3" />
      <T x={160} y={y0 - 10} s={11}>
        εu = 0.003
      </T>
      <T x={245} y={y0 + d + 12} s={11}>
        εy = fy/Es
      </T>
      <DimV x={130} y1={y0} y2={y0 + cb} label="cb" side="l" />
      {/* stress */}
      <Ln x1={360} y1={y0} x2={360} y2={y0 + h} c={C.mute} />
      <rect x={325} y={y0} width={35} height={0.85 * cb} fill={C.comp} opacity={0.25} stroke={C.comp} />
      <T x={330} y={y0 - 10} s={11}>
        0.85f′c
      </T>
      <DimV x={312} y1={y0} y2={y0 + 0.85 * cb} label="a = β1cb" side="l" />
      <Arrow x1={360} y1={y0 + d} x2={420} y2={y0 + d} c={C.ten} />
      <T x={440} y={y0 + d} s={11} a="start">
        T = Asfy
      </T>
      <Arrow x1={400} y1={y0 + 0.42 * cb} x2={362} y2={y0 + 0.42 * cb} c={C.comp} />
      <T x={404} y={y0 + 0.42 * cb} s={11} a="start">
        C = 0.85f′c ab
      </T>
    </Svg>
  )
}

// ================================================================ data
const S1a: CantSlabInput = { span: 14, support: 12, cantL: 5, cantR: 5, dlTotal: 180, ll: 80, fc: 3000, fy: 60000 }
const bm2a: ShearBeam = {
  kind: 'ss',
  L: 36,
  wD: 2.0,
  P: [
    { x: 10, P: 40 },
    { x: 26, P: 40 },
  ],
  factored: true,
}
const sec2a: ShearSection = { bw: 14, d: 24, fc: 3500, fy: 60000 }
const B4b: BeffIn = { kind: 'interior', L: 30, bw: 12, hf: 3, cc: 50 }
const T4b = (beff: number) => ({ Mu: 700, beff, bw: 12, hf: 3, d: 24, dt: 25, fc: 3, fy: 60 })

/** Q5(b): axially loaded 18 × 18 column with 4 #10 — elastic, at ε = 0.001, and ultimate (fast / slow) */
function col5b() {
  const Ag = 18 * 18
  const Ast = 4 * 1.27
  const Ac = Ag - Ast
  const n = 8
  // (i) elastic, fc = 1000 psi
  const fc1 = 1.0
  const P1 = fc1 * (Ag + (n - 1) * Ast)
  const Ps1 = n * fc1 * Ast
  // (ii) ε = 0.001: concrete from the Hognestad curve (f'c = 4 ksi), steel Es ε
  const eps = 0.001
  const fc2 = concreteStress(eps, 4000)
  const fs2 = 29000 * eps
  const P2 = fc2 * Ac + fs2 * Ast
  // (iii) ultimate: fast loading ≈ f'c, slow (sustained) 0.85 f'c
  const Pfast = 4 * Ac + 60 * Ast
  const Pslow = 0.85 * 4 * Ac + 60 * Ast
  return { Ag, Ast, Ac, n, fc1, P1, Ps1, eps, fc2, fs2, P2, Ps2: fs2 * Ast, Pfast, Pslow, Ps3: 60 * Ast, Ec: Ec(4000) / 1000 }
}

/** Q6(b): first crack at the column face (uncracked transformed section, self-weight included) */
const crack6b = () => {
  const u = uncracked(E4)
  return { u, P: (u.Mcr - MSW) / L4, PG: (u.McrG - MSW) / L4 }
}
/** Q7(b): allowable P from 0.45f'c and 0.4fy on the cracked section */
const allow7b = () => {
  const a = allowableMoment(E4, 1.8, 24)
  return { a, P: (a.M - MSW) / L4 }
}
/** Q8(c): φMn and the largest live P (1.2D + 1.6L) */
const cap8c = () => {
  const g = review(I4)
  const Pmax = (g.phiMn - 1.2 * MSW) / (1.6 * L4)
  return { g, Pmax }
}
/** Q9(a): P = 30 k live at the tip, self-weight dead */
const bm9a: ShearBeam = { kind: 'cant', L: 8, selfWeight: { b: 12, h: 21 }, P: [{ x: 8, P: 0, PL: 30 }] }
const sec9a: ShearSection = { bw: 12, d: 18, fc: 4000, fy: 60000 }
/** detailed Vc = (1.9√f'c + 2500ρw Vu d/Mu) bw d ≤ 3.5√f'c bw d at d from the face */
const vcDetailed = () => {
  const x = 18 / 12
  const wu = 1.2 * SW
  const Pu = 1.6 * 30
  const Vu = Pu + wu * (L4 - x)
  const Mu = Pu * (L4 - x) + (wu * (L4 - x) ** 2) / 2
  const rhoW = 3.0 / (12 * 18)
  const ratio = Math.min(1, (Vu * 18) / (Mu * 12))
  const sq = Math.sqrt(4000)
  const Vc1 = ((1.9 * sq + 2500 * rhoW * ratio) * 12 * 18) / 1000
  const cap = (3.5 * sq * 12 * 18) / 1000
  const Vc = Math.min(Vc1, cap)
  const Vs = Vu / 0.75 - Vc
  const s = (0.22 * 60 * 18) / Vs
  const VcS = (2 * sq * 12 * 18) / 1000
  return { x, wu, Pu, Vu, Mu, rhoW, ratio, Vc1, cap, Vc, Vs, s, VcS, sS: (0.22 * 60 * 18) / (Vu / 0.75 - VcS) }
}
/** Q9(b): anchorage of the top #9 bars in the 18 in column */
const anch9b = () => {
  const b9 = bar('#9')
  const straight = ldRow('#9', 4000, 60000, true).r
  const hf = hookFactors({ no: 9, sideCover: 2.5, tailCover: 2.5, hook: 90 })
  const h = ldhCalc({ db: b9.db, fc: 4000, fy: 60000, psiC: hf.psiC, psiR: hf.psiR })
  const geo = hookGeometry(9, b9.db, 90)
  const col = columnAnchorage({ colDepth: 18, backCover: 2.5, ldStraight: straight.final, ldh: h.final })
  return { b9, straight, hf, h, geo, col }
}
/** Q9(c): cut-off of the centre bar at the P of Q8(c) (section fully used) */
const cut9c = () => {
  const { Pmax } = cap8c()
  const b9 = bar('#9')
  const ld = ldRow('#9', 4000, 60000, true).r.final
  const c = cutoff({ dg: { kind: 'cant', L: 8, wu: 1.2 * SW, P: 1.6 * Pmax }, b: 12, d: 18, fc: 4000, fy: 60000, bar: b9, nTotal: 3, nCut: 1, ld, endEmbed: 2 })
  return { Pmax, ld, c }
}
/** Q9(d): Class B lap of the centre #9 with #3 @ 4 in stirrups (general ld equation) */
const lap9d = () => {
  const b9 = bar('#9')
  const geo = beamBarGeometry({ b: 12, cover: 1.5, ds: 0.375, db: b9.db, n: 3, faceCenter: 3 })
  const K = ktr(geo.legs * 0.11, 4, 3)
  const ld = ldGeneral({ db: b9.db, fc: 4000, fy: 60000, psiT: 1.3, psiS: 1, cb: geo.cb, Ktr: K })
  const lap = tensionLap(ld.ld0, 'B')
  return { b9, geo, K, ld, lap }
}

// ================================================================ questions
export const R2013: RcQ[] = [
  // solve: one-way slab 5 + 14 + 5 ft on beams, total DL 180 psf, LL 80 psf patterns
  {
    id: 'rc-2013-14-1a',
    paper: '2013-14',
    sec: 'A',
    no: '1(a)',
    marks: 20,
    topics: ['rc-oneway'],
    title: 'One-way slab with 5 ft overhangs both sides (DL 180, LL 80 psf)',
    pages: [58, 61],
    text: r`A one-way slab supported on RC beams is shown in Fig. 1. The calculated dead load on the slab is 180 psf (working) and the slab is subjected to a working live load of 80 psf. The live load can occupy any portion or any position on the slab. Calculate the critical moments and design the slab using USD method. Show the slab reinforcements with neat sketches.

Given: $f'_c = 3$ ksi and $f_y = 60$ ksi. (Fig. 1: 5′-0″ | 12″ beam | 14′-0″ | 12″ beam | 5′-0″.)`,
    given: [],
    figure: Fig1,
    checks: () => {
      const c = cantSlab(S1a)
      return [
        { key: 'wu', label: 'Factored load $w_u$', value: c.loads.wu, unit: 'psf' },
        { key: 'mn', label: 'Max negative moment (support face)', value: c.Mneg, unit: 'k-ft/ft' },
        { key: 'mp', label: 'Max positive moment (LL on the span only)', value: c.Mpos, unit: 'k-ft/ft', tol: 0.03 },
      ]
    },
    solution: () => <CantSlabSol p={S1a} note="DL 180 psf is the total working dead load including self-weight, so h only sets d." />,
    notes: ['h is not given (it only affects d, since the DL is given).'],
  },
  {
    id: 'rc-2013-14-1b',
    paper: '2013-14',
    sec: 'A',
    no: '1(b)',
    marks: 6,
    topics: ['rc-basics'],
    title: 'Meaning of serviceability',
    pages: PG.A1,
    theory: true,
    text: 'What do you understand by the term "serviceability" in RC design?',
    solution: () => <AnsMd a={ANS.serviceability} />,
  },
  {
    id: 'rc-2013-14-1c',
    paper: '2013-14',
    sec: 'A',
    no: '1(c)',
    marks: 9,
    topics: ['rc-oneway'],
    title: 'Why and how T&S steel is provided; ACI/BNBC values',
    pages: PG.A1,
    theory: true,
    text: 'Discuss why and how temperature and shrinkage reinforcement is provided in one-way slabs. What are the ACI/BNBC recommended values for such steel?',
    solution: () => <AnsMd a={ANS.ts} />,
  },
  // solve: stirrups, SS 36 ft, two 40 k loads at 10 ft + 2.0 k/ft, 14 × d24, 3 sets
  {
    id: 'rc-2013-14-2a',
    paper: '2013-14',
    sec: 'A',
    no: '2(a)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Stirrups, 3 sets: 36 ft beam, two 40 k loads + 2.0 k/ft',
    pages: [58, 61],
    text: r`Design the stirrups for the beam shown in Fig. 2. Use $f'_c = 3.5$ ksi, $f_y = 60$ ksi. Calculate stirrups with 3 sets of spacing. Show the stirrups in a neat sketch.

(Fig. 2: span 10′ + 16′ + 10′ = 36 ft; $P_u = 40$ kip at 10 ft from each support; $w_u = 2.0$ kip/ft including self-weight; all factored; $b = 14$ in, $d = 24$ in.)`,
    given: [],
    figure: Fig2,
    checks: () => {
      const { R, at, g } = shearKey(bm2a, sec2a)
      return [
        { key: 'vd', label: 'Vu at d from the support', value: R.Vd, unit: 'k' },
        { key: 'pvc', label: 'φVc', value: g.lim.phiVc, unit: 'k' },
        { key: 's', label: 'Required spacing at the critical section', value: at.s, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => <ShearSol bm={bm2a} sec={sec2a} />,
    notes: ['The 24″ is dimensioned to the steel, so it is d (h not given). R = 76 kip.'],
  },
  {
    id: 'rc-2013-14-2b',
    paper: '2013-14',
    sec: 'A',
    no: '2(b)',
    marks: 9,
    topics: ['rc-shear'],
    title: 'Seismic hoops in beams, moderate seismic zone (Dhaka)',
    pages: PG.A2,
    theory: true,
    flag: 'Seismic detailing (IMRF hoops) — not in the current CE 315 slides',
    text: 'What are the BNBC/ACI code provisions for beam stirrups (hoops) for moderate seismic risk region e.g. Dhaka.',
    solution: () => <AnsMd a={ANS.hoops} fig={<HoopFig />} />,
  },
  {
    id: 'rc-2013-14-2c',
    paper: '2013-14',
    sec: 'A',
    no: '2(c)',
    marks: 6,
    topics: ['rc-shear'],
    title: 'Functions of stirrups',
    pages: PG.A2,
    theory: true,
    text: 'What are the function of stirrups in beams?',
    solution: () => (
      <AnsMd
        a={r`- **Carry shear / diagonal tension** beyond the concrete's share: $V_s = A_vf_{yt}d/s$.
- **Restrain diagonal cracks** — keep them narrow, so the compression zone ($V_{cz}$) and aggregate interlock ($V_a$) keep working.
- **Tie the longitudinal bars**: increase dowel action and prevent splitting/peeling of the cover along the bars.
- **Confine the concrete** (closed hoops): more ductility — essential in seismic regions.
- **Resist torsion** (closed stirrups with longitudinal bars).
- **Hold the bars in position** as a cage during concreting and give lateral support against buckling of compression bars.`}
      />
    ),
  },
  {
    id: 'rc-2013-14-3a',
    paper: '2013-14',
    sec: 'A',
    no: '3(a)',
    marks: 9,
    topics: ['rc-bond'],
    title: 'Standard cut-off / bend points, nearly equal spans with UDL',
    pages: PG.A3,
    theory: true,
    text: 'Show with neat sketches cut off or bend points for bars in approximately equal spans with uniformly distributed loads.',
    solution: () => <AnsMd a={ANS.cutoff} fig={<CutoffFig />} />,
  },
  {
    id: 'rc-2013-14-3b',
    paper: '2013-14',
    sec: 'A',
    no: '3(b)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'Factors affecting development length',
    pages: PG.A3,
    theory: true,
    text: 'Discuss briefly the factors that influence development length of a reinforcing bar.',
    solution: () => <AnsMd a={ANS.ldFactors} />,
  },
  // solve: ℓd of 20 mm and 25 mm, top and other bars, f'c = 3 ksi
  {
    id: 'rc-2013-14-3c',
    paper: '2013-14',
    sec: 'A',
    no: '3(c)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'ℓd of 20 mm and 25 mm bars, top and other',
    pages: PG.A3,
    text: r`Calculate the development length of 20 mm and 25 mm uncoated top bars in USD. Repeat the calculation for other bars also. Use $f'_c = 3$ ksi and $f_y = 60$ ksi and assume appropriate value for any missing data.`,
    given: [],
    checks: () => [
      { key: 't20', label: '20 mm top bar ℓd', value: ldRow('20mm', 3000, 60000, true).r.final, unit: 'in', tol: 0.03 },
      { key: 't25', label: '25 mm top bar ℓd', value: ldRow('25mm', 3000, 60000, true).r.final, unit: 'in', tol: 0.03 },
      { key: 'o25', label: '25 mm other bar ℓd', value: ldRow('25mm', 3000, 60000, false).r.final, unit: 'in', tol: 0.03 },
    ],
    solution: () => <LdSol ids={['20mm', '25mm']} fc={3000} fy={60000} note="Assumed: clear spacing ≥ 2db and clear cover ≥ db (simplified first row), uncoated, normal weight." />,
  },
  {
    id: 'rc-2013-14-3d',
    paper: '2013-14',
    sec: 'A',
    no: '3(d)',
    marks: 6,
    topics: ['rc-bond'],
    title: 'Minimum lap length for column splices (ACI/BNBC)',
    pages: PG.A3,
    theory: true,
    text: 'What is the minimum length of lap for column splices as per ACI/BNBC code?',
    solution: () => <AnsMd a={ANS.colSplice} />,
  },
  {
    id: 'rc-2013-14-4a',
    paper: '2013-14',
    sec: 'A',
    no: '4(a)',
    marks: 10,
    topics: ['rc-basics'],
    title: 'Five RC floor systems used in Bangladesh',
    pages: PG.A4,
    theory: true,
    text: 'Describe with neat sketches five reinforced concrete floor systems commonly used in Bangladesh.',
    solution: () => <AnsMd a={ANS.floorSystems} fig={<FloorSystemsFig />} />,
  },
  // solve: T-beam design, Mu = 700 k-ft, beff = 50 in, true T
  {
    id: 'rc-2013-14-4b',
    paper: '2013-14',
    sec: 'A',
    no: '4(b)',
    marks: 25,
    topics: ['rc-tbeam'],
    title: 'T-beam midspan steel for Mu = 700 kip-ft (50 in c/c, 30 ft span)',
    pages: [58, 61],
    text: r`A floor system consists of a 3 inch slab supported by continuous T-beams with 30 ft span, 50 inch on centres as shown in Fig. 3. Web dimensions as determined by negative moment requirement at the support area is $b_w = 12''$ and $d = 24''$. What tensile area is required at midspan to resist a factored moment $M_u$ of 700 kip-ft; if $f_y = 60$ ksi and $f'_c = 3$ ksi?`,
    given: [],
    figure: Fig3,
    checks: () => {
      const b = effectiveWidth(B4b).b
      const { t } = tDesignSteps(T4b(b))
      return [
        { key: 'beff', label: 'Effective flange width', value: b, unit: 'in' },
        { key: 'pf', label: 'φMn with the whole flange stressed', value: t.phiMnFlange, unit: 'k-ft' },
        { key: 'as', label: 'Required $A_s$', value: t.As, unit: 'in²', tol: 0.03 },
      ]
    },
    solution: () => {
      const { o, s } = beffSteps(B4b)
      const { t, s: s2 } = tDesignSteps(T4b(o.b))
      return (
        <Sol>
          <Note>dt = 25 in assumed for εt.</Note>
          <SolSteps steps={[...s, ...s2]} />
          <Ans>{`$b_{eff} = ${f(o.b)}$ in; flange alone ${f(t.phiMnFlange, 1)} k-ft < 700 → true T: **$A_s = ${f(t.As)}$ in²** ($\\varepsilon_t = ${f(t.epsT, 4)}$, φ = ${f(t.phi)}).`}</Ans>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2013-14-5a',
    paper: '2013-14',
    sec: 'B',
    no: '5(a)',
    marks: 9,
    topics: ['rc-basics'],
    title: 'σ–ε curves of the Fig. 4 concrete and steel, design levels marked',
    pages: PG.B5,
    theory: true,
    text: 'Draw the typical stress-strain curve for concrete (in compression) and steel (in tension) used in beam of Fig. 4. Also, show the different stress-strain levels (considered as design parameters) on these curves.',
    figure: Fig4,
    solution: () => (
      <AnsMd
        a={r`### Concrete, $f'_c = 4000$ psi
- Nearly linear to about $0.45f'_c = 1800$ psi (elastic / WSD allowable), $E_c = 57\,000\sqrt{4000} = 3.6\times10^6$ psi.
- Peak $f'_c = 4000$ psi at $\varepsilon_0 \approx 0.002$; descending branch; ACI crushing strain **0.003**.
- Design levels: $0.85f'_c = 3400$ psi (stress block), $f_r = 400$ psi (given) in tension, $\varepsilon_{cu} = 0.003$.

### Steel, Grade 60
- Linear to $f_y = 60$ ksi at $\varepsilon_y = 60/29\,000 = 0.00207$ ($E_s = 29\,000$ ksi), yield plateau to about 0.01, strain hardening to $f_u \approx 90$ ksi at ≈ 0.08, rupture ≈ 0.12+.
- Design idealisation: **elastic–perfectly plastic** — $f_s = E_s\varepsilon_s \le f_y$; allowable $0.4f_y = 24$ ksi for WSD.`}
        fig={<StressStrainFig steel />}
      />
    ),
  },
  // solve: axial column (18 × 18, 4 #10): elastic P at fc = 1000 psi, P at ε = 0.001, fast/slow ultimate, steel shares
  {
    id: 'rc-2013-14-5b',
    paper: '2013-14',
    sec: 'B',
    no: '5(b)',
    marks: 17.25,
    topics: ['rc-basics'],
    title: 'Fig. 4 column: elastic, ε = 0.001 and ultimate axial loads',
    pages: PG.B5,
    text: r`(i) Determine the axial load that will stress the concrete of column of Fig. 4 to 1000 psi.
(ii) Determine the axial load that will produce a strain or unit shortening $\varepsilon_c = \varepsilon_s = 0.0010$ in the column of Fig. 4. Use your stress-strain curve for calculation.
(iii) Calculate the maximum axial load that the column of Fig. 4 can carry. Consider both fast rate loading and slow rate loading for your calculation. Also, calculate the share of the total load carried by the reinforcement of column at these three stages.

(Column 18″ × 18″, 4 #10; $f'_c = 4000$ psi, $f_y = 60\,000$ psi, $n = 8$.)`,
    given: [],
    figure: Fig4,
    checks: () => {
      const c = col5b()
      return [
        { key: 'p1', label: '(i) P at fc = 1000 psi', value: c.P1, unit: 'k' },
        { key: 'p2', label: '(ii) P at ε = 0.001', value: c.P2, unit: 'k', tol: 0.04 },
        { key: 'pf', label: '(iii) maximum P, fast loading', value: c.Pfast, unit: 'k' },
        { key: 'ps', label: '(iii) maximum P, slow loading', value: c.Pslow, unit: 'k' },
      ]
    },
    solution: () => {
      const c = col5b()
      return (
        <Sol>
          <SolSteps
            steps={[
              st('Areas', `A_g = 18^2 = ${f(c.Ag)}\\text{ in}^2,\\ A_{st} = 4(1.27) = ${f(c.Ast)}\\text{ in}^2,\\ A_c = ${f(c.Ac)}\\text{ in}^2`),
              st('(i) Elastic, transformed section', `P = f_c[A_g + (n-1)A_{st}] = 1.0[${f(c.Ag)} + 7(${f(c.Ast)})] = ${f(c.P1, 1)}\\text{ k}`, `Steel: $f_s = nf_c = 8$ ksi, $P_s = ${f(c.Ps1, 1)}$ k → **${f((100 * c.Ps1) / c.P1, 1)} %** of the load.`),
              st('(ii) ε = 0.001 (inelastic)', `f_c = ${f(c.fc2, 3)}\\text{ ksi (from the curve)},\\ f_s = E_s\\varepsilon = 29\\text{ ksi} \\Rightarrow P = ${f(c.fc2, 3)}(${f(c.Ac)}) + 29(${f(c.Ast)}) = ${f(c.P2, 1)}\\text{ k}`, `Concrete stress read from the Hognestad parabola ($\\varepsilon_0 = 2f'_c/E_c$). Steel share ${f(c.Ps2, 1)} k = **${f((100 * c.Ps2) / c.P2, 1)} %**.`),
              st('(iii) Ultimate, fast loading', `P_n = f'_cA_c + f_yA_{st} = 4(${f(c.Ac)}) + 60(${f(c.Ast)}) = ${f(c.Pfast, 1)}\\text{ k}`, `Steel share ${f(c.Ps3, 1)} k = **${f((100 * c.Ps3) / c.Pfast, 1)} %**.`),
              st('(iii) Ultimate, slow (sustained) loading', `P_n = 0.85f'_cA_c + f_yA_{st} = 3.4(${f(c.Ac)}) + ${f(c.Ps3, 1)} = ${f(c.Pslow, 1)}\\text{ k}`, `Steel share **${f((100 * c.Ps3) / c.Pslow, 1)} %** — creep under slow loading shifts load to the steel.`),
            ]}
          />
          <Ans>{`(i) ${f(c.P1, 0)} k (steel ${f((100 * c.Ps1) / c.P1, 0)} %); (ii) ${f(c.P2, 0)} k (steel ${f((100 * c.Ps2) / c.P2, 0)} %); (iii) fast ${f(c.Pfast, 0)} k, slow ${f(c.Pslow, 0)} k (steel ${f((100 * c.Ps3) / c.Pfast, 0)}–${f((100 * c.Ps3) / c.Pslow, 0)} %).`}</Ans>
        </Sol>
      )
    },
    notes: ['(ii) depends on the concrete curve drawn in Q5(a): the Hognestad parabola is used here. (iii) follows the class convention f′c (fast) vs 0.85f′c (slow). Axial capacity is local arithmetic (no column engine).'],
  },
  {
    id: 'rc-2013-14-6a',
    paper: '2013-14',
    sec: 'B',
    no: '6(a)',
    marks: 8,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Strain and stress through the stages for the Fig. 4 section',
    pages: PG.B6,
    theory: true,
    text: 'Show the distribution of stresses and strains in concrete and steel over the depth of the beam section shown in Fig. 4 under increasing load (P).',
    figure: Fig4,
    solution: () => (
      <AnsMd
        a={
          r`For the cantilever the **tension face is the top** (3 #9 at d = 18 in from the bottom compression face). Sketches below are drawn that way.

` + ANS.behaviour
        }
        fig={<StagesFig flip />}
      />
    ),
  },
  // solve: P at first crack — Mcr (uncracked transformed, fr = 400, n = 8) = P·L + w L²/2
  {
    id: 'rc-2013-14-6b',
    paper: '2013-14',
    sec: 'B',
    no: '6(b)',
    marks: 9.25,
    topics: ['rc-elastic'],
    title: 'Load P that causes the first crack at the column face',
    pages: PG.B6,
    text: r`Compute the load P that will produce the first crack at the column face. Consider self wt. of beam for your calculation.

(Fig. 4: 12″ × 21″ cantilever, 8 ft, 3 #9 top at $d = 18''$; $f_r = 400$ psi, $n = 8$.)`,
    given: [],
    figure: Fig4,
    checks: () => {
      const g = crack6b()
      return [
        { key: 'mcr', label: 'Cracking moment (transformed section)', value: g.u.Mcr, unit: 'k-ft' },
        { key: 'p', label: 'Tip load P at first cracking', value: g.P, unit: 'k', tol: 0.03 },
      ]
    },
    solution: () => {
      const g = crack6b()
      return (
        <Sol>
          <SolSteps steps={g.u.steps} />
          <SolSteps
            steps={[st('Moment at the face', `M = PL + \\frac{wL^2}{2} = 8P + \\frac{0.2625(8)^2}{2} = 8P + ${f(MSW, 2)}\\text{ k-ft}`), st('First crack', `8P + ${f(MSW, 2)} = M_{cr} = ${f(g.u.Mcr, 2)} \\Rightarrow P = ${f(g.P, 2)}\\text{ k}`, `Gross section ($M_{cr} = ${f(g.u.McrG, 2)}$ k-ft): $P = ${f(g.PG, 2)}$ k.`)]}
            start={g.u.steps.length + 1}
          />
          <Ans>{`$M_{cr} = ${f(g.u.Mcr, 1)}$ k-ft → **P ≈ ${f(g.P, 2)} k** (gross-section value ${f(g.PG, 2)} k).`}</Ans>
        </Sol>
      )
    },
  },
  // solve: SFD/BMD of the cantilever, P = 10 k + self-weight
  {
    id: 'rc-2013-14-6c',
    paper: '2013-14',
    sec: 'B',
    no: '6(c)',
    marks: 9,
    topics: ['rc-basics'],
    title: 'SFD and BMD of the Fig. 4 cantilever for P = 10 k',
    pages: PG.B6,
    text: r`Draw bending moment and shear force diagram for the cantilever beam shown in Fig. 4, when $P = 10^k$. Consider self wt. of the beam for your calculation.`,
    given: [],
    figure: Fig4,
    checks: () => [
      { key: 'v', label: 'Shear at the column face', value: 10 + SW * L4, unit: 'k' },
      { key: 'm', label: 'Moment at the column face', value: 10 * L4 + MSW, unit: 'k-ft' },
    ],
    solution: () => {
      const xs = [0, 2, 4, 6, 8]
      const V = (x: number) => 10 + SW * (L4 - x)
      const M = (x: number) => 10 * (L4 - x) + (SW * (L4 - x) ** 2) / 2
      const W = 520
      const X = (x: number) => 60 + x * 52
      return (
        <Sol>
          <SolSteps steps={[st('Shear (x from the column face)', `V(x) = P + w(L - x) = 10 + 0.2625(8 - x)`), st('Moment (hogging)', `M(x) = P(L - x) + \\frac{w(L - x)^2}{2}`)]} />
          <Tbl head={['x (ft)', 'V (k)', 'M (k-ft)']} rows={xs.map((x) => [f(x), f(V(x), 2), f(M(x), 2)])} />
          <Svg w={W} h={220}>
            <Ln x1={X(0)} y1={30} x2={X(8)} y2={30} />
            <polygon points={`${X(0)},30 ${X(0)},${30 - V(0) * 4} ${X(8)},${30 - V(8) * 4} ${X(8)},30`} fill={C.accent} opacity={0.2} stroke={C.accent} />
            <T x={X(0) - 6} y={30 - V(0) * 4} a="end" s={11}>
              {f(V(0), 2)} k
            </T>
            <T x={X(8) + 6} y={30 - V(8) * 4} a="start" s={11}>
              10 k
            </T>
            <T x={X(4)} y={44} s={11}>
              SFD
            </T>
            <Ln x1={X(0)} y1={120} x2={X(8)} y2={120} />
            <polyline points={xs.map((x) => `${X(x)},${120 + M(x) * 0.9}`).join(' ') + ` ${X(8)},120 ${X(0)},120`} fill={C.load} opacity={0.2} stroke={C.load} />
            <T x={X(0) - 6} y={120 + M(0) * 0.9} a="end" s={11}>
              −{f(M(0), 1)} k-ft
            </T>
            <T x={X(4)} y={108} s={11}>
              BMD (hogging, tension on top)
            </T>
          </Svg>
          <Ans>{`At the column face: $V = ${f(V(0), 2)}$ k, $M = -${f(M(0), 1)}$ k-ft; at the tip $V = 10$ k, $M = 0$.`}</Ans>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2013-14-7a',
    paper: '2013-14',
    sec: 'B',
    no: '7(a)',
    marks: 13,
    topics: ['rc-basics'],
    title: 'Biaxial failure surface; cylinder vs cube strength',
    pages: PG.B7,
    theory: true,
    flag: 'Biaxial strength of concrete — not in the current CE 315 slides',
    text: 'Show a typical biaxial failure surface of normal density concrete. Identify the Compression-Compression, Compression-Tension and Tension-Tension regions on the surface. Using this failure surface, explain why the cylinder and cube specimens provide different compressive strength and failure mode for same concrete? Also, show the failure points of cylinder and cube on this surface.',
    solution: () => (
      <AnsMd
        a={r`### Biaxial failure envelope (Kupfer et al.)
- **Compression–compression** (third quadrant): lateral compression **raises** strength — up to about $1.25f'_c$ at $\sigma_2/\sigma_1 \approx 0.5$ and about $1.16f'_c$ for equal biaxial compression.
- **Compression–tension**: a small lateral tension sharply **reduces** the compressive strength (nearly straight line from $-f'_c$ to $f_t$).
- **Tension–tension**: strength ≈ uniaxial tensile strength $f_t$ (≈ 0.1 f′c), almost independent of the other stress.

### Cylinder vs cube
- A **cylinder** (h/d = 2) has a middle portion free of platen restraint → nearly **uniaxial** compression → fails at $-f'_c$ on the σ axis by splitting/shear cones.
- A **cube** (h/b = 1) is restrained over its whole height by **friction at the steel platens**, which induces lateral compression → it sits in the **compression–compression** region of the envelope → higher strength (cube ≈ 1.2–1.25 × cylinder) and an hour-glass (double pyramid) failure.
- Hence the same concrete gives different "strengths"; design uses the cylinder value $f'_c$.`}
        fig={<BiaxialFig />}
      />
    ),
  },
  // solve: allowable P — cracked section, fc ≤ 0.45f'c, fs ≤ 0.4fy, minus self-weight moment
  {
    id: 'rc-2013-14-7b',
    paper: '2013-14',
    sec: 'B',
    no: '7(b)',
    marks: 13.25,
    topics: ['rc-elastic'],
    title: 'Allowable tip load P (0.45f′c, 0.4fy)',
    pages: PG.B7,
    text: r`Compute the load 'P' that can be applied without stressing the concrete of beam (Fig. 4) beyond $0.45f'_c$ or the steel above $0.4f_y$. Consider self wt. of beam for your calculation.`,
    given: [],
    figure: Fig4,
    checks: () => {
      const g = allow7b()
      return [
        { key: 'kd', label: 'Cracked neutral axis kd', value: g.a.kd, unit: 'in' },
        { key: 'm', label: 'Allowable moment at the face', value: g.a.M, unit: 'k-ft' },
        { key: 'p', label: 'Allowable tip load P', value: g.P, unit: 'k', tol: 0.03 },
      ]
    },
    solution: () => {
      const g = allow7b()
      return (
        <Sol>
          <SolSteps steps={g.a.steps} />
          <SolSteps steps={[st('Tip load', `8P + ${f(MSW, 2)} = ${f(g.a.M, 2)} \\Rightarrow P = ${f(g.P, 2)}\\text{ k}`)]} start={g.a.steps.length + 1} />
          <Ans>{`$M_{all} = ${f(g.a.M, 1)}$ k-ft (${g.a.governs} governs) → **P = ${f(g.P, 2)} k**.`}</Ans>
        </Sol>
      )
    },
  },
  {
    id: 'rc-2013-14-8a',
    paper: '2013-14',
    sec: 'B',
    no: '8(a)',
    marks: 6,
    topics: ['rc-singly'],
    title: 'Derive the balanced steel ratio ρb',
    pages: PG.B8,
    theory: true,
    text: 'Derive the expression for balanced steel ratio (ρb). Show the appropriate stress and strain distribution diagrams for your derivation.',
    solution: () => (
      <AnsMd
        a={r`- **Balanced condition**: concrete reaches $\varepsilon_u = 0.003$ at the same time the steel reaches $\varepsilon_y = f_y/E_s$.
- **Strain compatibility** (similar triangles): $\dfrac{c_b}{d} = \dfrac{\varepsilon_u}{\varepsilon_u + \varepsilon_y} = \dfrac{0.003}{0.003 + f_y/E_s} = \dfrac{87}{87 + f_y}$ ($f_y$ in ksi, $E_s\varepsilon_u = 87$ ksi).
- **Equilibrium**: $C = T \Rightarrow 0.85f'_c\,b\,(\beta_1c_b) = \rho_b\,b\,d\,f_y$.
- Hence $\rho_b = 0.85\beta_1\dfrac{f'_c}{f_y}\dfrac{c_b}{d} = 0.85\beta_1\dfrac{f'_c}{f_y}\dfrac{\varepsilon_u}{\varepsilon_u + \varepsilon_y} = 0.85\beta_1\dfrac{f'_c}{f_y}\dfrac{87}{87 + f_y}$.
- Example: $f'_c = 4$, $f_y = 60$ ksi → $\rho_b = 0.85(0.85)(4/60)(87/147) = 0.0285$.`}
        fig={<RhoBFig />}
      />
    ),
  },
  {
    id: 'rc-2013-14-8b',
    paper: '2013-14',
    sec: 'B',
    no: '8(b)',
    marks: 7,
    topics: ['rc-singly', 'rc-doubly'],
    title: 'Under-, over- and doubly reinforced; status of the Fig. 4 beam',
    pages: PG.B8,
    theory: true,
    text: "Explain the terms 'Under reinforced', 'Over reinforced' and 'Doubly reinforced' beams. Identify the status of beam of Fig. 4 in respect of these three.",
    figure: Fig4,
    solution: () => {
      const lim = limits(4000, 60000)
      const rho = 3.0 / (12 * 18)
      return (
        <AnsMd
          a={
            ANS.underOver +
            `
- **Doubly reinforced**: has compression steel $A'_s$ as well as tension steel — used when the size is restricted and $\\rho > \\rho_{max}$, or for ductility, long-term deflection and moment reversal.

### Fig. 4 beam
- $\\rho = \\dfrac{3.00}{12 \\times 18} = ${f(rho, 4)}$; $\\rho_b = ${f(lim.rhoB, 4)}$, $\\rho_{max} = ${f(lim.rhoMax, 4)}$.
- $\\rho < \\rho_b$ (and $< \\rho_{max}$) → **under-reinforced** (steel yields first; not over-reinforced).
- Only the top tension bars (3 #9) are provided, no compression steel at the bottom → **singly reinforced**, not doubly.`
          }
        />
      )
    },
  },
  // solve: φMn of the cantilever section, then max live P with 1.2D + 1.6L
  {
    id: 'rc-2013-14-8c',
    paper: '2013-14',
    sec: 'B',
    no: '8(c)',
    marks: 13.25,
    topics: ['rc-singly'],
    title: 'Design moment capacity and maximum live P (Fig. 4)',
    pages: PG.B8,
    text: r`Compute the design moment capacity ($M_u$) of the beam shown in Fig. 4. Calculate the maximum value of P which will produce such stress condition in concrete and steel of the beam. Use appropriate load factors and consider 'P' as live load. Include self wt. of the beam in your calculation.`,
    given: [],
    figure: Fig4,
    checks: () => {
      const { g, Pmax } = cap8c()
      return [
        { key: 'a', label: 'Depth of stress block a', value: g.a, unit: 'in' },
        { key: 'pmn', label: 'Design moment capacity φMn', value: g.phiMn, unit: 'k-ft' },
        { key: 'p', label: 'Maximum live load P', value: Pmax, unit: 'k', tol: 0.03 },
      ]
    },
    solution: () => {
      const { g, Pmax } = cap8c()
      return (
        <Sol>
          <SinglyReviewSol inp={I4} />
          <SolSteps steps={[st('Load factors (1.2D + 1.6L)', `1.2\\frac{wL^2}{2} + 1.6PL = \\phi M_n \\Rightarrow 1.2(${f(MSW, 2)}) + 1.6(8)P = ${f(g.phiMn, 1)} \\Rightarrow P = ${f(Pmax, 2)}\\text{ k}`)]} start={g.steps.length + 1} />
          <Ans>{`$\\phi M_n = ${f(g.phiMn, 1)}$ k-ft → **P = ${f(Pmax, 2)} k** (live).`}</Ans>
        </Sol>
      )
    },
    notes: ['Load factors not stated: 1.2D + 1.6L used.'],
  },
  // solve: cantilever stirrups for P = 30 k (live) + self-weight; Vc simple and detailed
  {
    id: 'rc-2013-14-9a',
    paper: '2013-14',
    sec: 'B',
    no: '9(a)',
    marks: 7.25,
    topics: ['rc-shear'],
    title: 'Web reinforcement for P = 30 k: simple vs detailed Vc',
    pages: PG.B9,
    flag: 'Detailed Vc equation (ACI 318-14 and earlier) — class uses the simple 2√f′c bw d',
    text: r`If the beam of Fig. 4 carries $P = 30^k$ (unfactored) what part of the beam is web reinforcement required? Design the web reinforcement, basing $V_c$ on both approximate and more elaborate equation. Also, compare the results. Consider self wt. of the beam.`,
    given: [],
    figure: Fig4,
    checks: () => {
      const { R, g } = shearKey(bm9a, sec9a, 'c')
      const v = vcDetailed()
      return [
        { key: 'vd', label: 'Vu at d from the column face', value: R.Vd, unit: 'k', tol: 0.03 },
        { key: 'pvc', label: 'φVc (simple 2√f′c bw d)', value: g.lim.phiVc, unit: 'k' },
        { key: 'vcd', label: 'Vc by the detailed equation at d', value: v.Vc, unit: 'k', tol: 0.03 },
      ]
    },
    solution: () => {
      const v = vcDetailed()
      return (
        <Sol>
          <Hd>Approximate Vc = 2√f′c bw d (class method)</Hd>
          <ShearSol bm={bm9a} sec={sec9a} run="c" note="P = 30 k treated as live load (×1.6), self-weight ×1.2. Vu ≫ φVc everywhere, so stirrups are needed over the whole cantilever." />
          <Hd>Detailed Vc at the critical section (x = d from the face)</Hd>
          <SolSteps
            steps={[
              st('Vu and Mu at d', `V_u = ${f(v.Pu)} + ${f(v.wu, 3)}(8 - ${f(v.x, 2)}) = ${f(v.Vu, 2)}\\text{ k},\\quad M_u = ${f(v.Pu)}(${f(8 - v.x, 2)}) + \\frac{${f(v.wu, 3)}(${f(8 - v.x, 2)})^2}{2} = ${f(v.Mu, 1)}\\text{ k-ft}`),
              st('Vc', `V_c = \\left(1.9\\sqrt{f'_c} + 2500\\rho_w\\frac{V_ud}{M_u}\\right)b_wd = \\left(1.9(63.25) + 2500(${f(v.rhoW, 4)})(${f(v.ratio, 3)})\\right)\\frac{12(18)}{1000} = ${f(v.Vc1, 2)}\\text{ k}\\ \\le\\ 3.5\\sqrt{f'_c}b_wd = ${f(v.cap, 2)}`),
              st('Spacing (No. 3 U)', `V_s = \\frac{V_u}{\\phi} - V_c = ${f(v.Vs, 2)}\\text{ k} \\Rightarrow s = \\frac{A_vf_yd}{V_s} = ${f(v.s, 2)}\\text{ in}\\quad (\\text{simple } V_c = ${f(v.VcS, 2)}\\text{ k: } s = ${f(v.sS, 2)}\\text{ in})`),
            ]}
          />
          <Ans>{`Stirrups are required over the **whole 8 ft**. The detailed equation gives $V_c = ${f(v.Vc, 2)}$ k vs ${f(v.VcS, 2)} k, so a slightly larger spacing (${f(v.s, 2)} vs ${f(v.sS, 2)} in) — a small saving for more work; both are limited by $s_{max}$.`}</Ans>
        </Sol>
      )
    },
  },
  // solve: anchorage of 3 #9 top bars into the 18 in column — straight ld vs available, 90° hook ldh, hook geometry
  {
    id: 'rc-2013-14-9b',
    paper: '2013-14',
    sec: 'B',
    no: '9(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Anchorage of the top bars in the column; hook details',
    pages: PG.B9,
    text: r`What are the factors that affect the development length of rebars in tension. Check to see if adequate embedment length is available for rebars in the beam (Fig. 4) to develop $f_y$ at the column face. If hooks are required, specify detailed dimensions. You can consider simplified equations for your calculation.`,
    given: [],
    figure: Fig4,
    checks: () => {
      const a = anch9b()
      return [
        { key: 'ld', label: 'Straight ℓd of a #9 top bar', value: a.straight.final, unit: 'in', tol: 0.03 },
        { key: 'av', label: 'Embedment available in the column', value: a.col.available, unit: 'in' },
        { key: 'ldh', label: 'ℓdh of the 90° hook (with ψc)', value: a.h.final, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => {
      const a = anch9b()
      return (
        <Sol>
          <Hd>Factors (brief)</Hd>
          <Note>{`f′c (√f′c), fy, bar size db, bar position (top bars ψt = 1.3), coating, cover and spacing (cb), transverse steel (Ktr), lightweight concrete (λ), excess steel — see Q3(b).`}</Note>
          <SolSteps
            steps={[
              st('Straight bar (top bar, simplified)', `\\ell_d = \\frac{f_y\\psi_t}{20\\sqrt{f'_c}}d_b = \\frac{60\\,000(1.3)}{20(63.25)}(1.128) = ${f(a.straight.final, 1)}\\text{ in}`),
              st('Available', `\\text{column depth} - \\text{back cover} = 18 - 2.5 = ${f(a.col.available)}\\text{ in}\\ ${a.col.straightOK ? '\\ge' : '<'}\\ ${f(a.straight.final, 1)}`, a.col.straightOK ? 'Straight bars are enough.' : '**Not enough for straight bars → standard hooks needed.**'),
              st('Hooked bar', `\\ell_{dh} = \\frac{f_y}{50\\sqrt{f'_c}}d_b \\times \\psi_c = \\frac{60\\,000}{50(63.25)}(1.128)\\times${a.hf.psiC} = ${f(a.h.final, 1)}\\text{ in}\\ ${a.col.hookOK ? '\\le' : '>'}\\ ${f(a.col.available)}\\text{ in}`, `${a.hf.cNote}. Basic ${f(a.h.basic, 1)} in.`),
              st('Hook geometry (90°, No. 9)', `\\text{inside bend diameter } ${a.geo.Dk}d_b = ${f(a.geo.D, 2)}\\text{ in},\\ \\text{extension } 12d_b = ${f(a.geo.tail, 2)}\\text{ in}`),
            ]}
          />
          <Ans>{`Straight ℓd = ${f(a.straight.final, 0)} in ≫ ${f(a.col.available)} in available → use **90° standard hooks**: ℓdh = ${f(a.h.final, 1)} in ${a.col.hookOK ? '≤' : '>'} ${f(a.col.available)} in ${a.col.hookOK ? '✓' : '✗ (needs ties at ≤ 3db, ψr = 0.8, or a deeper column)'}; bend diameter ${f(a.geo.D, 2)} in, tail ${f(a.geo.tail, 1)} in turned down into the column.`}</Ans>
        </Sol>
      )
    },
    notes: ['Hook outer face 2½″ from the far column face (as drawn); side cover ≥ 2.5 in and tail cover ≥ 2 in assumed so ψc = 0.7.'],
  },
  // solve: cut-off of the centre bar — φMn of 2 #9, theoretical point on the cantilever BMD, + d/12db, ℓd checks
  {
    id: 'rc-2013-14-9c',
    paper: '2013-14',
    sec: 'B',
    no: '9(c)',
    marks: 6,
    topics: ['rc-bond'],
    title: 'Where the centre bar can stop; embedment checks',
    pages: PG.B9,
    text: r`Calculate the point where the centre rebar can be terminated. Check to be sure that adequate embedment length is provided for both continued and discontinued rebars.`,
    given: [],
    figure: Fig4,
    checks: () => {
      const { c } = cut9c()
      return [
        { key: 'm2', label: 'φMn of the 2 continuing #9 bars', value: c.remain.phiMn, unit: 'k-ft' },
        { key: 'x', label: 'Theoretical cut-off from the column face', value: c.xTheo, unit: 'ft', tol: 0.03 },
        { key: 'xc', label: 'Actual cut-off point from the face', value: c.xCut, unit: 'ft', tol: 0.03 },
      ]
    },
    solution: () => {
      const { Pmax, ld, c } = cut9c()
      return (
        <Sol>
          <Note>{`Load taken as the largest live P of Q8(c), P = ${f(Pmax, 2)} k (the section is then fully used at the face): Pu = 1.6P, wu = 1.2 × 0.2625 k/ft.`}</Note>
          <SolSteps
            steps={[
              st('Capacity of 2 #9', `a = ${f(c.remain.a)}\\text{ in},\\ \\phi M_n = ${f(c.remain.phiMn, 1)}\\text{ k-ft (all 3 bars: } ${f(c.all.phiMn, 1)})`),
              st('Theoretical cut-off', `M_u(x) = P_u(8 - x) + \\frac{w_u(8 - x)^2}{2} = ${f(c.remain.phiMn, 1)} \\Rightarrow x = ${f(c.xTheo, 2)}\\text{ ft from the face}`),
              st('Extend', `\\max(d, 12d_b) = ${f(c.ext, 2)}\\text{ in} \\Rightarrow x = ${f(c.xExt, 2)}\\text{ ft};\\quad \\ell_d = ${f(ld, 1)}\\text{ in from the face} \\Rightarrow \\text{cut at } ${f(c.xCut, 2)}\\text{ ft}`, c.ldGoverns ? 'ℓd from the point of maximum stress (column face) governs.' : undefined),
              st('Continuing bars', `\\text{available beyond the theoretical cut-off} = ${f(c.availCont, 1)}\\text{ in}\\ ${c.contOK ? '\\ge' : '<'}\\ \\ell_d = ${f(ld, 1)}\\text{ in}`, c.contOK ? 'OK.' : 'Not enough: hook or extend the bars to the tip (they do run to the tip, end anchorage by hook if required).'),
            ]}
          />
          <Ans>{`Centre bar may stop **${f(c.xCut, 2)} ft** from the column face (theoretical ${f(c.xTheo, 2)} ft); it is anchored in the column by the hook of Q9(b).`}</Ans>
        </Sol>
      )
    },
    notes: ['The cut-off location is not dimensioned in the figure; it is computed here for the load of Q8(c).'],
  },
  // solve: Class B lap of the centre #9 — general ℓd with cb and Ktr from #3 @ 4 in, ×1.3
  {
    id: 'rc-2013-14-9d',
    paper: '2013-14',
    sec: 'B',
    no: '9(d)',
    marks: 5,
    topics: ['rc-bond'],
    title: 'Splice length of the centre #9 (stirrups #3 @ 4 in)',
    pages: PG.B9,
    text: r`The centre rebar of the beam needs to be spliced away from the critical section. Shear reinforcement consists of No. 3 at 4 in. spacing. All rebars are assumed to be fully stressed. Calculate the required splice length.`,
    given: [],
    figure: Fig4,
    checks: () => {
      const g = lap9d()
      return [
        { key: 'ktr', label: 'Ktr', value: g.K, tol: 0.03 },
        { key: 'ld', label: 'ℓd (general equation, top bar)', value: g.ld.ld0, unit: 'in', tol: 0.03 },
        { key: 'lap', label: 'Class B splice length', value: g.lap.final, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => {
      const g = lap9d()
      return (
        <Sol>
          <SolSteps
            steps={[
              st('Bar geometry', `c_{side} = 1.5 + 0.375 + \\frac{1.128}{2} = ${f(g.geo.cSide)}\\text{ in},\\ \\text{c/c spacing} = ${f(g.geo.spacingCC)}\\text{ in} \\Rightarrow c_b = \\min(${f(g.geo.cSide)},\\ ${f(g.geo.cFace)},\\ ${f(g.geo.halfSpacing)}) = ${f(g.geo.cb)}\\text{ in}`),
              st('Confinement', `K_{tr} = \\frac{40A_{tr}}{sn} = \\frac{40(${g.geo.legs}\\times0.11)}{4(3)} = ${f(g.K)}\\text{ in},\\quad \\frac{c_b + K_{tr}}{d_b} = ${f(g.ld.conf)}${g.ld.capped ? ' \\to 2.5' : ''}`),
              st('ℓd (general)', `\\ell_d = \\frac{3}{40}\\frac{f_y}{\\lambda\\sqrt{f'_c}}\\frac{\\psi_t\\psi_e\\psi_s}{(c_b + K_{tr})/d_b}d_b = \\frac{3}{40}\\frac{60\\,000}{63.25}\\frac{1.3}{${f(g.ld.confUsed)}}(1.128) = ${f(g.ld.ld0, 1)}\\text{ in}`, 'Top bar ψt = 1.3; no excess-steel factor for splices.'),
              st('Splice class', `\\text{all bars fully stressed } (A_{s,prov}/A_{s,req} < 2) \\Rightarrow \\text{Class B: } \\ell_{st} = 1.3\\ell_d = ${f(g.lap.final, 1)}\\text{ in}`),
            ]}
          />
          <Ans>{`Class B lap **${Math.ceil(g.lap.final)} in** (${f(g.lap.final / 12, 2)} ft), placed away from the column face.`}</Ans>
        </Sol>
      )
    },
  },
]
