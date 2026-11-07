// CE 315 term final 2004-05 (held 26 May 2005), PDF pp. 107–111.
// Section A: 4 questions, answer 3 ("Assume reasonable value of any data if necessary"); Section B: 4, answer 3.
// Equations printed are the ACI 318-95/99 forms (ld/db = 3/40 · fy/√f'c · αβγλ/((c + Ktr)/db), lhb = 1200db/√f'c).
// Attached aid: "T beams: WSD Method" formula box (p. 111).
import { tipAxes } from '../../../components/PointTip'
import { Md } from '../../../components/ui'
import type { RcGiven, RcQ } from '../../types'
import { allowableMoment, f, uncracked } from '../../engine/elastic'
import { designDoubly, pickBars as pickDoubly, reviewDoubly, type DoublyReviewIn } from '../../engine/doubly'
import { designT, effectiveWidth, floorLoads, reviewT, wsdTDesign } from '../../engine/tbeam'
import { type ShearSection } from '../../engine/shear'
import { cantSlab } from '../../engine/oneway'
import { designAs } from '../../engine/singly'
import { bar, ldGeneral, ldhCalc } from '../../engine/bond'
import { beta1 } from '../../engine/materials'
import {
  A_LOAD_FACTORS,
  A_PHI_WHY,
  Bars,
  CONC,
  Conc,
  DimH,
  DimV,
  Fig,
  Head,
  INK,
  LOAD,
  Ln,
  MUTE,
  Pin,
  Roller,
  STEEL,
  T,
  Udl,
  Sol,
  ck,
  cantSlabSteps,
  SlabSketch,
  doublySteps,
  tDesignSteps,
  wsdTSteps,
} from './r2006'
import { A_LD_FACTORS, FLAG_OLD, FLAG_WSD, OH_R, OverhangFig, SlabStripFig, TFloorFig, overhangShearSol, overhangV } from './r2005'

const G = (label: string, ref: string, what?: string, formula?: boolean): RcGiven => ({ label, ref, what, formula })
const FT = (v: number, d = 2) => f(v, d)
const wsdBox = G('T beams: WSD Method (k, z, jd, M)', 'f-wsdT', 'p. 111', true)

// ================================================================ figures
function Fig1() {
  const s = 22
  const X = (ft: number) => 80 + ft * s
  return (
    <Fig w={600} h={150}>
      <Udl x1={X(0)} x2={X(21)} y={60} label="w k/ft (total working load)" />
      <rect x={X(0)} y={60} width={21 * s} height={9} fill={CONC} stroke={INK} />
      <Pin x={X(0)} y={69} />
      <Roller x={X(15)} y={69} />
      <DimH x1={X(0)} x2={X(15)} y={112} label="15′" />
      <DimH x1={X(15)} x2={X(21)} y={112} label="6′" />
      <T x={300} y={142} s={11} c={MUTE}>
        Section 10″ × 24″: bottom 6 #7 (two layers), top 3 #7 · f′c = 3000 psi, fs = 20,000 psi, n = 9
      </T>
    </Fig>
  )
}

/** Fig. 6: half elevation with bar groups and the linear moment envelope */
function Fig6() {
  const s = 26 // px per ft
  const xc = 60 // column face
  const yT = 60
  const h = 40
  const X = (ft: number) => xc + ft * s
  return (
    <Fig w={600} h={290}>
      <rect x={xc - 18 * (s / 12)} y={20} width={18 * (s / 12)} height={150} fill={CONC} stroke={INK} />
      <rect x={xc} y={yT} width={16 * s} height={h} fill={CONC} stroke={INK} />
      <Ln x1={X(16)} y1={yT - 30} x2={X(16)} y2={yT + h + 150} c={MUTE} dash="6 3" />
      <T x={X(16)} y={yT - 34} s={11} c={MUTE}>
        midspan
      </T>
      {/* top bars */}
      <polyline points={`${xc - 30},${yT + 24} ${xc - 30},${yT + 5} ${X(12)},${yT + 5}`} fill="none" stroke={STEEL} strokeWidth={2.4} />
      <polyline points={`${xc - 26},${yT + 22} ${xc - 26},${yT + 9} ${X(6)},${yT + 9}`} fill="none" stroke={STEEL} strokeWidth={2.4} />
      <T x={X(9)} y={yT - 4} s={11}>
        3-#9 (cut-off?)
      </T>
      <T x={X(3.5)} y={yT + 22} s={11}>
        2-#9 (cut-off?)
      </T>
      {/* bottom bars */}
      <Ln x1={xc - 6 * (s / 12)} y1={yT + h - 5} x2={X(16)} y2={yT + h - 5} c={LOAD} w={2.4} />
      <Ln x1={X(9)} y1={yT + h - 10} x2={X(16)} y2={yT + h - 10} c={LOAD} w={2.4} />
      <T x={X(4)} y={yT + h + 14} s={11}>
        3-#8 (6″ into column)
      </T>
      <T x={X(13)} y={yT + h - 14} s={11}>
        2-#8 (cut-off?)
      </T>
      {/* envelope */}
      <Ln x1={xc} y1={190} x2={X(16)} y2={190} c={MUTE} w={0.8} />
      <polygon points={`${xc},190 ${xc},140 ${X(10)},190`} fill="none" stroke={STEEL} strokeWidth={1.6} />
      <polygon points={`${X(6)},190 ${X(16)},240 ${X(16)},190`} fill="none" stroke={LOAD} strokeWidth={1.6} />
      <T x={xc + 30} y={168} s={11} c={STEEL}>
        −M (linear)
      </T>
      <T x={X(13)} y={222} s={11} c={LOAD}>
        +M (linear)
      </T>
      <DimH x1={xc} x2={X(6)} y={262} label="6′" />
      <DimH x1={X(6)} x2={X(10)} y={262} label="4′" />
      <DimH x1={X(10)} x2={X(16)} y={262} label="6′" />
      <DimH x1={xc} x2={X(16)} y={284} label="16′ (column face to midspan)" />
      <T x={xc - 12} y={16} s={11}>
        18″ col.
      </T>
    </Fig>
  )
}

// ================================================================ answer sketches
function StressStrainCurves() {
  const X = (e: number) => 60 + (e / 0.004) * 470
  const Y = (fc: number) => 230 - (fc / 12) * 200
  const curves = [3, 4, 6, 8, 12].map((fc) => {
    const e0 = 0.0017 + fc * 0.0001
    const pts: string[] = []
    const eu = fc <= 4 ? 0.004 : fc <= 8 ? 0.0034 : 0.0031
    for (let e = 0; e <= eu + 1e-9; e += 0.0001) {
      const r = e / e0
      const v = e <= e0 ? fc * (2 * r - r * r) : fc * (1 - ((fc <= 4 ? 0.12 : fc <= 8 ? 0.35 : 0.9) * (e - e0)) / (eu - e0 + 1e-9))
      pts.push(`${X(e)},${Y(Math.max(0, v))}`)
    }
    return { fc, d: pts.join(' '), e0 }
  })
  return (
    <Fig w={600} h={270} max={600}>
      <Ln x1={X(0)} y1={Y(0)} x2={X(0.004)} y2={Y(0)} />
      <Ln x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(12)} />
      <g {...tipAxes({ X, Y, x: 'εc', y: 'fc', yUnit: ' ksi' })}>
        {curves.map((c) => (
          <g key={c.fc} data-name={`f′c = ${c.fc} ksi`}>
            <polyline points={c.d} fill="none" stroke={c.fc <= 4 ? LOAD : STEEL} strokeWidth={1.8} />
            <T x={X(c.e0) - 4} y={Y(c.fc) - 6} s={11}>
              {`${c.fc} ksi`}
            </T>
          </g>
        ))}
      </g>
      {[0.001, 0.002, 0.003, 0.004].map((e) => (
        <T key={e} x={X(e)} y={Y(0) + 15} s={11}>
          {e}
        </T>
      ))}
      <T x={X(0.002)} y={262} s={11}>
        strain εc
      </T>
      <T x={30} y={Y(6)} s={11}>
        fc (ksi)
      </T>
      <Ln x1={X(0.003)} y1={Y(0)} x2={X(0.003)} y2={Y(12)} c={MUTE} dash="3 3" />
      <T x={X(0.003) + 4} y={Y(11)} a="start" s={11} c={MUTE}>
        εcu ≈ 0.003 (ACI)
      </T>
    </Fig>
  )
}

export function DiagCrackFBD() {
  return (
    <Fig w={600} h={250} max={600}>
      <rect x={60} y={40} width={300} height={140} fill={CONC} stroke={INK} />
      <polyline points="150,180 200,150 250,110 290,70" fill="none" stroke={LOAD} strokeWidth={2} />
      <T x={255} y={100} a="start" s={11} c={LOAD}>
        diagonal crack (projection p ≈ d)
      </T>
      {[170, 200, 230, 260].map((x) => (
        <Ln key={x} x1={x} y1={50} x2={x} y2={172} c={STEEL} w={1.6} />
      ))}
      <Ln x1={60} y1={168} x2={360} y2={168} c={STEEL} w={2.4} />
      <T x={215} y={36} s={11}>
        stirrups Av at spacing s, each Av fyt
      </T>
      {/* forces */}
      <Ln x1={290} y1={70} x2={350} y2={70} c={INK} w={1.6} />
      <Head x={356} y={70} dir="r" />
      <T x={362} y={74} a="start" s={11}>
        Cc (compression zone)
      </T>
      <Ln x1={300} y1={60} x2={300} y2={20} c={INK} w={1.6} />
      <Head x={300} y={16} dir="u" />
      <T x={306} y={24} a="start" s={11}>
        Vcz
      </T>
      <Ln x1={150} y1={168} x2={420} y2={168} c={INK} w={1.2} dash="4 3" />
      <Head x={424} y={168} dir="r" />
      <T x={430} y={172} a="start" s={11}>
        T = As fs
      </T>
      <Ln x1={150} y1={190} x2={150} y2={222} c={INK} w={1.6} />
      <Head x={150} y={226} dir="d" />
      <T x={156} y={222} a="start" s={11}>
        Vd (dowel)
      </T>
      <Ln x1={225} y1={130} x2={205} y2={150} c={INK} w={1.4} />
      <Head x={202} y={153} dir="d" s={5} />
      <T x={150} y={134} a="end" s={11}>
        Vi (interlock)
      </T>
      <Ln x1={70} y1={240} x2={70} y2={196} c={LOAD} w={1.8} />
      <Head x={70} y={192} dir="u" c={LOAD} />
      <T x={78} y={240} a="start" s={11} c={LOAD}>
        V (reaction side)
      </T>
    </Fig>
  )
}

function SectionSketch({ kind }: { kind: 'T' | 'R' }) {
  if (kind === 'T') {
    const s = 9
    const x0 = 150
    const bw = 13 * s
    return (
      <Fig w={600} h={300} max={520}>
        <rect x={40} y={20} width={420} height={5 * s} fill={CONC} stroke={INK} />
        <rect x={x0} y={20 + 5 * s - 1} width={bw} height={20 * s + 1} fill={CONC} stroke={INK} />
        <rect x={x0 + 1.5 * s} y={20 + 1.5 * s} width={bw - 3 * s} height={25 * s - 3 * s} fill="none" stroke={STEEL} strokeWidth={2} rx={6} />
        <Bars x1={x0 + 2.5 * s} x2={x0 + bw - 2.5 * s} y={20 + 25 * s - 2.5 * s} n={4} r={0.5 * s} />
        <Bars x1={x0 + 2.5 * s} x2={x0 + bw - 2.5 * s} y={20 + 25 * s - 2.5 * s - 2 * s} n={3} r={0.5 * s} />
        <Bars x1={x0 + 2.4 * s} x2={x0 + bw - 2.4 * s} y={20 + 2.4 * s} n={3} r={0.375 * s} />
        <DimV y1={20} y2={20 + 25 * s} x={x0 - 16} label="25″" left />
        <DimV y1={20} y2={20 + 5 * s} x={30} label="5″" left />
        <DimH x1={x0} x2={x0 + bw} y={20 + 25 * s + 16} label="13″" below />
        <T x={x0 + bw + 50} y={20 + 23 * s} a="start" s={11}>
          7 #8: 4 bottom + 3 in 2nd layer, 1″ clear between layers
        </T>
        <T x={x0 + bw + 50} y={20 + 3 * s} a="start" s={11}>
          3 #6 compression (in stirrup corners)
        </T>
        <T x={x0 + bw + 50} y={20 + 12 * s} a="start" s={11}>
          #4 closed stirrup, 1½″ clear cover
        </T>
      </Fig>
    )
  }
  const s = 6
  const x0 = 120
  const b = 18 * s
  const h = 40 * s
  return (
    <Fig w={600} h={h + 50} max={520}>
      <Conc x={x0} y={15} w={b} h={h} />
      <rect x={x0 + 1.5 * s} y={15 + 1.5 * s} width={b - 3 * s} height={h - 3 * s} fill="none" stroke={STEEL} strokeWidth={1.8} rx={5} />
      <rect x={x0 + 5.5 * s} y={15 + 1.5 * s} width={b - 11 * s} height={h - 3 * s} fill="none" stroke={STEEL} strokeWidth={1.4} rx={5} />
      <Bars x1={x0 + 2.4 * s} x2={x0 + b - 2.4 * s} y={15 + h - 2.4 * s} n={7} r={0.5 * s} />
      <Bars x1={x0 + 2.3 * s} x2={x0 + b - 2.3 * s} y={15 + h - 2.4 * s - 1.9 * s} n={8} r={0.375 * s} />
      <Bars x1={x0 + 2.3 * s} x2={x0 + b - 2.3 * s} y={15 + 2.3 * s} n={8} r={0.44 * s} />
      {[0.4, 0.6].map((k) => (
        <g key={k}>
          <circle cx={x0 + 1.9 * s} cy={15 + h * k} r={0.3 * s} fill={STEEL} />
          <circle cx={x0 + b - 1.9 * s} cy={15 + h * k} r={0.3 * s} fill={STEEL} />
        </g>
      ))}
      <DimV y1={15} y2={15 + h} x={x0 - 16} label="40″" left />
      <DimH x1={x0} x2={x0 + b} y={15 + h + 14} label="18″" below />
      <T x={x0 + b + 20} y={15 + h - 6} a="start" s={11}>
        7 #8 (1st layer, 1.2″ clear)
      </T>
      <T x={x0 + b + 20} y={15 + h - 22} a="start" s={11}>
        8 #6 (2nd layer, 1″ clear above)
      </T>
      <T x={x0 + b + 20} y={15 + 16} a="start" s={11}>
        8 #7 top (1.04″ clear)
      </T>
      <T x={x0 + b + 20} y={15 + h / 2} a="start" s={11}>
        4-legged #3: outer + inner closed stirrup
      </T>
      <T x={x0 + b + 20} y={15 + h / 2 + 16} a="start" s={11}>
        skin bars on side faces (h {'>'} 36″)
      </T>
    </Fig>
  )
}

// ================================================================ solutions
const q1b = (() => {
  const pos: Parameters<typeof allowableMoment>[0] = { b: 10, h: 24, d: 20.5, As: 6 * 0.6, Asp: 3 * 0.6, dp: 2.5, fc: 3000, n: 9 }
  const neg: Parameters<typeof allowableMoment>[0] = { b: 10, h: 24, d: 21.5, As: 3 * 0.6, Asp: 6 * 0.6, dp: 3.5, fc: 3000, n: 9 }
  const P = allowableMoment(pos, 1.35, 20)
  const N = allowableMoment(neg, 1.35, 20)
  const RA = (21 * 21) / 2 / 15 // × w : moment about B... computed below
  const RAw = (15 * 15) / 2 / 15 - (6 * 6) / 2 / 15 // R_A per unit w = (w·15²/2 − w·6²/2)/15
  const xMax = RAw
  const cPos = (RAw * RAw) / 2 // M+ = R_A²/(2w) per unit w
  const cNeg = 36 / 2
  const wPos = P.M / cPos
  const wNeg = N.M / cNeg
  return { pos, neg, P, N, RA, RAw, xMax, cPos, cNeg, wPos, wNeg, w: Math.min(wPos, wNeg) }
})()

const SEC2: Parameters<typeof uncracked>[0] = { b: 12, h: 30, d: 26.5, As: 8 * 0.44, fc: 3500, n: 9 }
const q2a = { U: uncracked(SEC2), A: allowableMoment(SEC2, 0.45 * 3.5, 20) }

const q3a = (() => {
  const FL = floorLoads({ hf: 5, spacing: 12, bw: 10, h: 24, sdl: 65, ll: 40 })
  const Mu = (FL.wu * 40 * 40) / 11
  const MuP = (FL.wu * 40 * 40) / 16
  const DD = designDoubly({ b: 10, d: 20.5, dt: 21.5, dp: 2.5, fc: 2.5, fy: 40, Mu })
  return { FL, Mu, MuP, DD }
})()

const q4a = (() => {
  const Lc = 6 // assumed projection (ft)
  const FL = floorLoads({ hf: 4, spacing: 10, bw: 10, h: 18, sdl: 30, ll: 25 })
  const Mu = (FL.wu * Lc * Lc) / 2
  const D = designAs(Mu, 10, 15.5, 4000, 60000)
  const bars = pickDoubly(D.As, 10, [5, 6, 7, 8])
  return { Lc, FL, Mu, D, bars }
})()

const q4b = (() => {
  const At = 4 * 0.6 + 4 * 0.44
  const yT = (4 * 0.6 * 2.5 + 4 * 0.44 * 4.5) / At // from the bottom
  const p: DoublyReviewIn = { b: 14, d: 21 - yT, dt: 18.5, dp: 2.5, As: At, Asp: 3 * 0.6 + 3 * 0.44, fc: 3.5, fy: 60 }
  return { At, yT, p, r: reviewDoubly(p) }
})()

const q5 = (() => {
  const B = effectiveWidth({ kind: 'interior', L: 28, bw: 11, hf: 4.5, cc: 108, rule: 'aci08' })
  const FL = floorLoads({ hf: 4.5, spacing: 9, bw: 11, h: 29.5, sdl: 25, ll: 250 })
  const Mu = (FL.wu * 28 * 28) / 8
  const tin = { Mu, beff: B.b, bw: 11, hf: 4.5, d: 26, fc: 3, fy: 50 }
  const TD = designT(tin)
  const bars = pickDoubly(TD.As, 11)
  const RT = reviewT({ beff: B.b, bw: 11, hf: 4.5, d: 26, As: bars.A, fc: 3, fy: 50 })
  const M = ((FL.wD + FL.wL) * 28 * 28) / 8
  const win = { M, beff: B.b, hf: 4.5, d: 26, n: 9, fcAllow: 1.35, fsAllow: 20 }
  const WT = wsdTDesign(win)
  const wbars = pickDoubly(WT.As, 11)
  const sq = Math.sqrt(3000)
  const Vu = (FL.wu * 28) / 2
  const V = ((FL.wD + FL.wL) * 28) / 2
  const vu = (Vu * 1000) / (11 * 26)
  const v = (V * 1000) / (11 * 26)
  return { B, FL, Mu, tin, TD, bars, RT, M, win, WT, wbars, sq, Vu, V, vu, v }
})()

const q6 = cantSlab({ span: 14, support: 10, cantL: 5, cantR: 5, ll: 140, fc: 3500, fy: 55000 })

const SEC7: ShearSection = { bw: 14, d: 30, fc: 3000, fy: 50000, Av: 0.4 }
const q7b = overhangShearSol(SEC7, true)
const q7c = overhangShearSol(SEC7)

const q8 = (() => {
  const b9 = bar('#9')
  const b8 = bar('#8')
  const fc = 4500
  const fy = 55000
  const ld9 = ldGeneral({ db: b9.db, fc, fy, psiT: 1.3, cb: 1.5 * b9.db, Ktr: 0 })
  const ld8 = ldGeneral({ db: b8.db, fc, fy, cb: 1.5 * b8.db, Ktr: 0 })
  const d = 24
  // negative: M linear from max at the face to 0 at 10 ft; As,req at face 4.7 in²
  const xT2 = 10 * (1 - 3.0 / 4.7) // where 3 #9 suffice → the 2 #9 can stop
  const ext9 = Math.max(d, 12 * b9.db)
  const cut2 = Math.max(xT2 + ext9 / 12, ld9.final / 12)
  const ipExt = Math.max(d, 12 * b9.db, (32 * 12) / 16)
  const cut3 = 10 + ipExt / 12
  // positive: M linear from 0 at 6 ft to max at 16 ft; As,req at centre 3.8 in²
  const xT8 = 6 + 10 * ((3 * 0.79) / 3.8) // where 3 #8 suffice (ft from face)
  const ext8 = Math.max(d, 12 * b8.db)
  const cut8 = xT8 - ext8 / 12
  const avail8 = (16 - cut8) * 12
  // hook (ACI 318-99): lhb = 1200 db/√f'c × fy/60,000 (× 0.7 cover)
  const lhb = (1200 * b9.db) / Math.sqrt(fc)
  const fyF = fy / 60000
  const lh = ldhCalc({ db: b9.db, fc, fy })
  const lh7 = ldhCalc({ db: b9.db, fc, fy, psiC: 0.7 })
  const avail = 18 - 2
  return { b9, b8, ld9, ld8, d, xT2, ext9, cut2, ipExt, cut3, xT8, ext8, cut8, avail8, lhb, fyF, lh, lh7, avail }
})()

const SOL: Record<string, Pick<RcQ, 'checks' | 'solution'>> = {
  'rc-2004-05-1b': {
    checks: () => [ck('Mp', 'Allowable +M (span section)', q1b.P.M, 'k-ft'), ck('Mn', 'Allowable −M (support B)', q1b.N.M, 'k-ft'), ck('w', 'Maximum working load w', q1b.w, 'k/ft')],
    solution: () => (
      <Sol
        steps={[
          { t: 'Statics (per unit w)', tex: `R_A = \\frac{w(15^2/2 - 6^2/2)}{15} = ${FT(q1b.RAw, 3)}w,\\quad M^+_{max} = \\frac{R_A^2}{2w} = ${FT(q1b.cPos, 3)}w\\ (x = ${FT(q1b.xMax)}\\text{ ft}),\\quad M^-_B = \\frac{w(6)^2}{2} = ${FT(q1b.cNeg)}w` },
          { t: 'Depths', md: 'Bottom 6 #7 in two layers: $d = 24 - 3.5 = 20.5$ in; top 3 #7: $d = 24 - 2.5 = 21.5$ in for −M. The bars on the other face act as compression steel (2n rule). Allowables $f_c = 0.45(3000) = 1350$ psi, $f_s = 20$ ksi, $n = 9$.' },
          { t: 'Positive-moment section (tension bottom)', md: '' },
          ...q1b.P.steps,
          { t: 'Negative-moment section at B (tension top)', md: '' },
          ...q1b.N.steps,
          { t: 'Allowable w', tex: `w^+ = \\frac{${FT(q1b.P.M, 1)}}{${FT(q1b.cPos, 3)}} = ${FT(q1b.wPos, 3)},\\quad w^- = \\frac{${FT(q1b.N.M, 1)}}{${FT(q1b.cNeg)}} = ${FT(q1b.wNeg, 3)}\\text{ k/ft}` },
        ].filter((s) => s.md !== '' || s.tex)}
        end={`**w = ${FT(q1b.w, 3)} k/ft** (${q1b.wPos < q1b.wNeg ? 'span' : 'support'} section governs). Treating each section as singly reinforced is also accepted; it gives a slightly smaller w.`}
      />
    ),
  },
  'rc-2004-05-2a-i': {
    checks: () => [ck('Mcr', 'Cracking moment (uncracked transformed)', q2a.U.Mcr, 'k-ft'), ck('McrG', 'Cracking moment (gross section)', q2a.U.McrG, 'k-ft')],
    solution: () => <Sol steps={[{ t: 'Data assumed', md: '8 #6 ($A_s = 3.52$ in²) need two layers in 12 in: $d = 30 - 3.5 = 26.5$ in. $f_r = 7.5\\sqrt{3500}$ (not given).' }, ...q2a.U.steps]} end={`$M_{cr} = ${FT(q2a.U.Mcr, 1)}$ k-ft (transformed) — ${FT(q2a.U.McrG, 1)} k-ft on the gross section.`} />,
  },
  'rc-2004-05-2a-ii': {
    checks: () => [ck('kd', 'kd', q2a.A.kd, 'in'), ck('M', 'Maximum working moment', q2a.A.M, 'k-ft')],
    solution: () => <Sol steps={[{ t: 'Allowables', md: '$f_c = 0.45(3500) = 1575$ psi, $f_s = 20$ ksi, $n = 9$, $d = 26.5$ in.' }, ...q2a.A.steps]} end={`$M_{all} = ${FT(q2a.A.M, 1)}$ k-ft (${q2a.A.governs} governs).`} />,
  },
  'rc-2004-05-3a': {
    checks: () => [ck('wu', 'Factored load on beam AB', q3a.FL.wu, 'k/ft'), ck('Mu', '−Mu near the column (wu ln²/11)', q3a.Mu, 'k-ft'), ck('As', 'Tension steel', q3a.DD.As, 'in²', 0.04), ck('Asp', 'Compression steel', q3a.DD.Asp, 'in²', 0.05)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Loads on an interior beam (12 ft strip)', tex: `w_D = \\underbrace{${FT(q3a.FL.slab, 3)}}_{5''\\text{ slab}} + \\underbrace{${FT(q3a.FL.web, 3)}}_{10\\times19\\text{ web}} + \\underbrace{${FT(q3a.FL.sdl, 3)}}_{40 + 25\\text{ psf}} = ${FT(q3a.FL.wD, 3)},\\quad w_L = ${FT(q3a.FL.wL, 3)}\\text{ k/ft}` },
          { t: 'Moments', tex: `w_u = ${FT(q3a.FL.wu, 3)}\\text{ k/ft},\\quad M_u^- = \\frac{w_ul_n^2}{11} = ${FT(q3a.Mu, 1)}\\text{ k-ft},\\quad (M_u^+ = w_ul_n^2/16 = ${FT(q3a.MuP, 1)}\\text{ k-ft, T-section})`, md: '40 ft taken as the clear span. Near the column the slab (flange) is in tension: design the 10 × 24 rectangle, $d = 20.5$ in (two layers), $d_t = 21.5$, $d\' = 2.5$.' },
          { t: 'Singly reinforced maximum (εt = 0.005)', tex: `A_{s1} = \\rho_{0.005}bd = ${FT(q3a.DD.sm.As1)}\\text{ in}^2,\\quad \\phi M_{n1} = ${FT(q3a.DD.sm.phiMn1, 1)}\\text{ k-ft} ${q3a.DD.needed ? '<' : '\\ge'} M_u` },
          ...(q3a.DD.needed
            ? [
                { t: 'Compression steel', tex: `\\phi M_{n2} = ${FT(q3a.DD.phiMn2, 1)}\\text{ k-ft},\\ \\varepsilon'_s = ${FT(q3a.DD.epsSp, 5)} \\Rightarrow f'_s = ${FT(q3a.DD.fsp, 1)}\\text{ ksi},\\ A'_s = \\frac{M_{n2}}{f'_s(d-d')} = ${FT(q3a.DD.Asp)}\\text{ in}^2` },
                { t: 'Tension steel', tex: `A_s = A_{s1} + \\frac{A'_sf'_s}{f_y} = ${FT(q3a.DD.sm.As1)} + ${FT(q3a.DD.As2)} = ${FT(q3a.DD.As)}\\text{ in}^2` },
              ]
            : []),
          { t: 'Bars and check', md: `Top ${q3a.DD.tension.n} #${q3a.DD.tension.no} (${FT(q3a.DD.tension.A)} in²)${q3a.DD.comp ? `, bottom ${q3a.DD.comp.n} #${q3a.DD.comp.no} (${FT(q3a.DD.comp.A)} in²)` : ''}; review $\\phi M_n = ${FT(q3a.DD.review.phiMn, 1)}$ k-ft, $\\varepsilon_t = ${FT(q3a.DD.review.epsT, 4)}$ ${q3a.DD.ok ? '✓' : '✗'}.` },
        ]}
        end={`Near the column: **top ${q3a.DD.tension.n} #${q3a.DD.tension.no}**${q3a.DD.comp ? `, **bottom ${q3a.DD.comp.n} #${q3a.DD.comp.no}** as compression steel (run the bottom bars into the column)` : ''}. f′c = 2.5 ksi makes this small web heavily stressed — the section is doubly reinforced.`}
      />
    ),
  },
  'rc-2004-05-4a': {
    checks: () => [ck('wu', 'Factored load on the central beam', q4a.FL.wu, 'k/ft'), ck('Mu', 'Mu at the wall face (6 ft assumed)', q4a.Mu, 'k-ft'), ck('As', 'As (top)', q4a.D.As, 'in²', 0.04)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Assumption', md: `Projection not given: assume **${q4a.Lc} ft** from the building face. Central beam carries a 10 ft strip.` },
          { t: 'Loads', tex: `w_D = ${FT(q4a.FL.slab, 3)} + ${FT(q4a.FL.web, 3)} + ${FT(q4a.FL.sdl, 3)} = ${FT(q4a.FL.wD, 3)},\\quad w_L = ${FT(q4a.FL.wL, 3)},\\quad w_u = ${FT(q4a.FL.wu, 3)}\\text{ k/ft}` },
          { t: 'Moment', tex: `M_u = \\frac{w_uL^2}{2} = \\frac{${FT(q4a.FL.wu, 3)}(${q4a.Lc})^2}{2} = ${FT(q4a.Mu, 1)}\\text{ k-ft}`, md: 'Hogging: tension at the top, the slab (at the top) is in tension, so design the 10 × 18 rectangle, $d = 18 - 2.5 = 15.5$ in.' },
          ...q4a.D.steps,
          { t: 'Bars', md: `${q4a.bars.n} #${q4a.bars.no} (${FT(q4a.bars.A)} in²) at the top, anchored into the building beam/wall by ld or a hook; 2 #4 bottom hangers; #3 stirrups.` },
        ]}
        end={`Top **${q4a.bars.n} #${q4a.bars.no}** for ${q4a.Lc} ft projection (scale $M_u$ with $L^2$ for your assumed length).`}
      />
    ),
  },
  'rc-2004-05-4b': {
    checks: () => [ck('c', 'Neutral axis c', q4b.r.c, 'in'), ck('Mn', 'Nominal Mn', q4b.r.MnFt, 'k-ft'), ck('phiMn', 'φMn', q4b.r.phiMn, 'k-ft')],
    solution: () => (
      <Sol
        steps={[
          { t: 'Layout (assumed)', md: `Tension: 4 #7 + 4 #6 = ${FT(q4b.At)} in² do not fit in one layer of 14 in → #7s at 2.5 in, #6s at 4.5 in from the bottom: centroid ${FT(q4b.yT)} in → $d = ${FT(q4b.p.d)}$ in, $d_t = 18.5$ in. Compression: 3 #7 + 3 #6 = ${FT(q4b.p.Asp)} in² in one layer, $d' = 2.5$ in. $\\beta_1 = ${FT(beta1(3500), 3)}$.` },
          ...doublySteps(q4b.p, q4b.r),
        ]}
        end={`Ultimate capacity $M_n = ${FT(q4b.r.MnFt, 1)}$ k-ft; design strength $\\phi M_n = ${FT(q4b.r.phiMn, 1)}$ k-ft.`}
      />
    ),
  },
  'rc-2004-05-5a': {
    checks: () => [ck('beff', 'Effective flange width', q5.B.b, 'in'), ck('Mu', 'Mu', q5.Mu, 'k-ft'), ck('As', 'As (USD)', q5.TD.As, 'in²', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Effective width', tex: q5.B.cands.map((c) => `${c.label} = ${FT(c.value, 1)}`).join(',\\ ') + `\\Rightarrow b_{eff} = ${FT(q5.B.b)}\\text{ in}` },
          { t: 'Loads (9 ft strip)', tex: `w_D = ${FT(q5.FL.slab, 3)} + ${FT(q5.FL.web, 3)} + ${FT(q5.FL.sdl, 3)} = ${FT(q5.FL.wD, 3)},\\ w_L = ${FT(q5.FL.wL, 3)},\\ w_u = ${FT(q5.FL.wu, 3)}\\text{ k/ft},\\ M_u = \\frac{w_u(28)^2}{8} = ${FT(q5.Mu, 1)}\\text{ k-ft}` },
          ...tDesignSteps(q5.tin, q5.TD),
          { t: 'Bars', md: `${q5.bars.n} #${q5.bars.no} = ${FT(q5.bars.A)} in²; $\\phi M_n = ${FT(q5.RT.phiMn, 1)}$ k-ft ✓.` },
        ]}
        end={`USD: $A_s = ${FT(q5.TD.As)}$ in² → **${q5.bars.n} #${q5.bars.no}**.`}
      />
    ),
  },
  'rc-2004-05-5b': {
    checks: () => [ck('M', 'Service moment', q5.M, 'k-ft'), ck('As', 'As (WSD)', q5.WT.As, 'in²', 0.03)],
    solution: () => <Sol steps={[{ t: 'Service moment', tex: `M = \\frac{(${FT(q5.FL.wD, 3)} + ${FT(q5.FL.wL, 3)})(28)^2}{8} = ${FT(q5.M, 1)}\\text{ k-ft}` }, ...wsdTSteps(q5.win, q5.WT), { t: 'Bars', md: `${q5.wbars.n} #${q5.wbars.no} = ${FT(q5.wbars.A)} in².` }]} end={`WSD: $A_s = ${FT(q5.WT.As)}$ in² → **${q5.wbars.n} #${q5.wbars.no}**.`} />,
  },
  'rc-2004-05-5c': {
    checks: () => [ck('vu', 'USD: vu / √f′c', q5.vu / q5.sq, '', 0.03), ck('v', 'WSD: v / √f′c', q5.v / q5.sq, '', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'USD', tex: `V_u = \\frac{w_uL}{2} = ${FT(q5.Vu, 1)}\\text{ k},\\quad v_u = \\frac{V_u}{b_wd} = \\frac{${FT(q5.Vu * 1000, 0)}}{11(26)} = ${FT(q5.vu, 0)}\\text{ psi} = ${FT(q5.vu / q5.sq)}\\sqrt{f'_c}` },
          { t: 'WSD', tex: `V = \\frac{wL}{2} = ${FT(q5.V, 1)}\\text{ k},\\quad v = \\frac{V}{b_wd} = ${FT(q5.v, 0)}\\text{ psi} = ${FT(q5.v / q5.sq)}\\sqrt{f'_c}` },
        ]}
        end={`At the support: $v_u ≈ ${FT(q5.vu / q5.sq, 1)}\\sqrt{f'_c}$ (USD, above $2\\phi\\sqrt{f'_c}$: stirrups needed) and $v ≈ ${FT(q5.v / q5.sq, 1)}\\sqrt{f'_c}$ (WSD, compare the old allowable $v_c = 1.1\\sqrt{f'_c}$).`}
      />
    ),
  },
  'rc-2004-05-6b-i': {
    checks: () => [ck('h', 'Slab thickness chosen', q6.h, 'in', 0.05), ck('Mpos', 'Max +Mu (no LL on cantilevers)', q6.Mpos, 'k-ft/ft'), ck('Mneg', 'Max −Mu (LL everywhere)', q6.Mneg, 'k-ft/ft')],
    solution: () => <Sol steps={cantSlabSteps(q6).slice(0, 6)} end={`$M_u^+ = ${FT(q6.Mpos)}$ k-ft/ft, $M_u^- = ${FT(q6.Mneg)}$ k-ft/ft (at the wall faces).`} />,
  },
  'rc-2004-05-6b-ii': {
    checks: () => [ck('Aspos', 'As for +M', q6.asPos.As, 'in²/ft', 0.04), ck('s', 'Bottom bar spacing', q6.pos.s, 'in', 0.05)],
    solution: () => (
      <Sol steps={cantSlabSteps(q6).slice(6)} end={`h = ${FT(q6.h)} in; bottom #${q6.bar} @ ${FT(q6.pos.s)} in, alternate bars cranked over the walls${q6.extra.sExtra ? ` + extra top #${q6.bar} @ ${FT(q6.extra.sExtra)} in` : ''}; T&S #3 @ ${FT(q6.ts.s)} in.`}>
        <SlabSketch r={q6} />
      </Sol>
    ),
  },
  'rc-2004-05-7b': {
    checks: () => [ck('R', 'Each reaction', OH_R, 'k'), ck('VA', 'V just right of the left support', overhangV(6.0001), 'k'), ck('Vm', 'V just left of midspan', overhangV(23.9999), 'k')],
    solution: () => <Sol steps={q7b.steps} end={`Ordinates: ∓45, +${FT(overhangV(6.0001), 1)}, +${FT(overhangV(23.9999), 1)} | −${FT(-overhangV(24.0001), 1)}, −${FT(-overhangV(41.9999), 1)}, +45 k.`} />,
  },
  'rc-2004-05-7c': {
    checks: () => [ck('Vd', 'Vu at d (span side)', q7c.span.rows[1].Vu, 'k'), ck('s1', 'Spacing at d (#4, 2 legs)', q7c.span.rows[1].s, 'in', 0.05)],
    solution: () => <Sol steps={q7c.steps} end={`#4 two-legged stirrups — span: ${q7c.span.zones.filter((z) => z.n).map((z) => `${z.n} @ ${FT(z.s, 1)}″`).join(', ')}; overhangs: ${q7c.oh.zones.filter((z) => z.n).map((z) => `${z.n} @ ${FT(z.s, 1)}″`).join(', ')}.`} />,
  },
  'rc-2004-05-8c-i': {
    checks: () => [ck('ld9', 'ld of #9 top bars', q8.ld9.final, 'in', 0.03), ck('c2', '2 #9 cut-off from the face', q8.cut2, 'ft', 0.03), ck('c3', '3 #9 cut-off from the face', q8.cut3, 'ft', 0.03), ck('c8', '2 #8 cut-off from the face', q8.cut8, 'ft', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Development lengths ((c + Ktr)/db = 1.5)', tex: `\\frac{\\ell_d}{d_b} = \\frac{3}{40}\\frac{55{,}000}{\\sqrt{4500}}\\frac{\\alpha\\beta\\gamma\\lambda}{1.5}:\\quad \\#9\\text{ top } (\\alpha = 1.3) = ${FT(q8.ld9.final, 1)}\\text{ in},\\quad \\#8\\text{ bottom} = ${FT(q8.ld8.final, 1)}\\text{ in}` },
          { t: 'Top: 2 #9 (−M linear, zero at 10 ft)', tex: `\\text{3 \\#9 suffice where } M = \\tfrac{3.0}{4.7}M_{max}:\\ x = 10\\left(1 - \\tfrac{3.0}{4.7}\\right) = ${FT(q8.xT2)}\\text{ ft};\\ +\\max(d, 12d_b) = ${FT(q8.ext9)}\\text{ in} \\Rightarrow ${FT(q8.xT2 + q8.ext9 / 12)}\\text{ ft}`, md: `Also ≥ ld = ${FT(q8.ld9.final / 12)} ft from the face (point of max stress) → cut at **${FT(q8.cut2)} ft**. (Using As ratios for the moment ratio; 4.7 in² required at the face.)` },
          { t: 'Top: 3 #9', md: `Moment zero at 10 ft; extend past the inflection point by $\\max(d, 12d_b, l_n/16) = ${FT(q8.ipExt)}$ in → **${FT(q8.cut3)} ft** from the face. Check: ${FT((q8.cut3 - q8.xT2) * 12, 1)} in beyond the 2 #9 theoretical point ≥ ld ${FT(q8.ld9.final, 1)} in ✓.` },
          { t: 'Bottom: 2 #8 (+M linear, 0 at 6 ft, max at 16 ft)', tex: `\\text{3 \\#8 suffice where } M = \\tfrac{2.37}{3.8}M_{max}:\\ x = 6 + 10\\left(\\tfrac{2.37}{3.8}\\right) = ${FT(q8.xT8)}\\text{ ft};\\ -${FT(q8.ext8)}\\text{ in} \\Rightarrow ${FT(q8.cut8)}\\text{ ft}`, md: `From the cut to midspan (max stress) ${FT(q8.avail8, 1)} in ≥ ld ${FT(q8.ld8.final, 1)} in ✓. The 3 #8 continue 6 in into the column (≥ ¼ of +As).` },
        ]}
        end={`Cut-offs from the column face: 2 #9 at **${FT(q8.cut2)} ft**, 3 #9 at **${FT(q8.cut3)} ft**, 2 #8 at **${FT(q8.cut8)} ft** (they run from there to midspan and symmetrically beyond).`}
      />
    ),
  },
  'rc-2004-05-8c-ii': {
    checks: () => [ck('lhb', 'lhb × fy/60,000', q8.lh.final, 'in', 0.03), ck('lh7', 'with 0.7 cover factor', q8.lh7.final, 'in', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Basic hook length', tex: `l_{hb} = \\frac{1200d_b}{\\sqrt{f'_c}} = \\frac{1200(${FT(q8.b9.db, 3)})}{\\sqrt{4500}} = ${FT(q8.lhb, 1)}\\text{ in}` },
          { t: 'Modification factors', tex: `\\times\\frac{f_y}{60{,}000} = ${FT(q8.fyF, 3)} \\Rightarrow ${FT(q8.lh.final, 1)}\\text{ in};\\quad \\times 0.7\\ (\\text{side cover} \\ge 2.5'',\\ \\text{tail cover} \\ge 2'') \\Rightarrow ${FT(q8.lh7.final, 1)}\\text{ in}`, md: `Minimum $8d_b = ${FT(8 * q8.b9.db, 1)}$ in and 6 in.` },
          { t: 'Available', tex: `18 - 2 = ${q8.avail}\\text{ in}` },
        ]}
        end={`Available ${q8.avail} in ${q8.lh.final <= q8.avail ? '≥' : '<'} ${FT(q8.lh.final, 1)} in without the cover factor; with 0.7: ${FT(q8.lh7.final, 1)} in ✓. **Adequate** provided the 2.5 in side cover and 2 in tail cover are kept (otherwise ${q8.lh.final <= q8.avail ? 'still adequate' : 'tight — use ties around the hook'}).`}
      />
    ),
  },
}

// ================================================================ questions
const PG = { A1: [107], A2: [107], A3: [108], A4: [108, 109], A4b: [109], B5: [109], B5b: [109, 111], B6: [109], B6b: [109, 110], B6c: [110], B7: [110], B8: [111] }
const T5 = String.raw`A concrete floor system consists of parallel simply supported T beams spaced 9 ft on centres and spanning 28 ft between supports. The 4.5″ slab is monolithic with T beam webs having $b_w = 11''$ and depth, measured from bottom of slab, of $h = 25''$. The effective depth to be taken 3.5″ less than total depth. In addition to its own weight the floor system is to carry floor finish of 25 psf and service live load of 250 psf. Material strengths are $f_y = 50{,}000$ psi, $f_s = 20{,}000$ psi, $f'_c = 3000$ psi and $n = 9$. Determine the following (using ACI recommendations) for the beams:`
const T6 = String.raw`Fig. 4 shows the plan view and section of a horizontal slab supported on four 10″ vertical brick walls as shown. The service live load is 140 psf and 3500 psi concrete is specified for use with steel yield strength of 55,000 psi.`
const T8c = String.raw`Fig. 6 shows a beam connected to two columns at the ends. The beam width is 12″ and the effective depth for both tension and compression steels is 24″. Columns are 18″ × 18″ in size. The negative steel required at the end of the beam is 4.7 in² and positive steel required at centre span is 3.8 in². The re-bars provided are shown in the figure. The moment envelope indicating the variation of design positive and negative moments are as shown. $f'_c = 4{,}500$ psi and $f_y = 55{,}000$ psi.`
const slabFig = () => <SlabStripFig cant={5} clear={14} support={10} h="h = ? (choose)" beams={false} label="service LL 140 psf (+ self-weight)" note="Plan: 14′ × 32′ inside the walls; slab cantilevers 5′ beyond both long walls." />

const BASE: RcQ[] = [
  {
    id: 'rc-2004-05-1a-i',
    paper: '2004-05',
    sec: 'A',
    no: '1(a)(i)',
    marks: 5,
    topics: ['rc-basics', 'rc-singly'],
    title: 'Fundamental assumptions of RC mechanics',
    text: 'Write down the fundamental assumptions of reinforced concrete mechanics.',
    pages: PG.A1,
    theory: true,
    given: [],
    solution: () => (
      <Md>{String.raw`1. **Equilibrium:** internal forces (concrete compression, steel forces) balance the external moment and axial force at every section.
2. **Perfect bond / compatibility:** the strain in a bar equals the strain in the surrounding concrete — no slip.
3. **Plane sections remain plane** after bending: strain varies linearly with distance from the neutral axis (valid except in deep beams).
4. **Concrete carries no tension** (in strength calculations; its tensile strength ≈ 1/10 of $f'_c$ and it cracks).
5. **The stress–strain curves of the materials are known** (actual or simplified): steel elastic–perfectly plastic ($E_s = 29{,}000$ ksi, flat at $f_y$); concrete per its curve.

For flexural strength (ACI) in addition:
- Maximum usable concrete strain $\varepsilon_{cu} = 0.003$.
- The concrete stress distribution may be replaced by the equivalent rectangular block $0.85f'_c$ over $a = \beta_1c$.
- Steel stress $= E_s\varepsilon_s \le f_y$.

The theory is checked against tests.`}</Md>
    ),
  },
  {
    id: 'rc-2004-05-1a-ii',
    paper: '2004-05',
    sec: 'A',
    no: '1(a)(ii)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Stress–strain curves of concrete for various strengths',
    text: 'Draw the stress-strain diagram of concrete in compression (for various strengths) and indicate important features on it.',
    pages: PG.A1,
    theory: true,
    given: [],
    solution: () => (
      <div className="space-y-3">
        <StressStrainCurves />
        <Md>{String.raw`**Features**
- Nearly **linear up to about 40–50% of $f'_c$** (elastic range, used for WSD and the transformed section); then curved as micro-cracks grow.
- **Peak stress $f'_c$ at a strain of about 0.002**, rising slightly with strength (≈ 0.0019 for 3 ksi to ≈ 0.003 for 12 ksi).
- **Initial modulus rises with strength**: $E_c = 57{,}000\sqrt{f'_c}$ psi (steeper curves).
- **Descending branch:** long and flat for low-strength concrete (ductile), short and steep for high-strength concrete (brittle, sudden failure).
- Crushing strain ≈ 0.003–0.004; ACI uses $\varepsilon_{cu} = 0.003$.
- Slow (sustained) loading gives a lower, flatter curve (creep) with maximum ≈ $0.85f'_c$ — the origin of the 0.85 in the stress block.`}</Md>
      </div>
    ),
  },
  {
    id: 'rc-2004-05-1b',
    paper: '2004-05',
    sec: 'A',
    no: '1(b)',
    marks: 25,
    topics: ['rc-elastic'],
    title: 'Overhanging beam: maximum working load w (WSD)',
    text: String.raw`The overhang beam shown in Fig. 1, loaded by total working load of w k/ft, has rectangular section of width 10″ and total depth 24″. Bottom reinforcement consists of 6 #7 bars in two layers while the top reinforcement consists of three #7 bars. Determine the maximum magnitude of w that may be allowed on it. Given $f'_c = 3000$ psi and $f_s = 20{,}000$ psi, $n = 9$.`,
    pages: PG.A1,
    flag: FLAG_WSD,
    given: [G('WSD allowable stresses', 'f-wsd'), G('Cracked / uncracked section formulas', 'f-elastic')],
    figure: () => <Fig1 />,
    notes: ['Effective depths not given: 20.5 in (two bottom layers), 21.5 in (top layer). Allowable fc = 0.45f′c = 1350 psi.'],
  },
  {
    id: 'rc-2004-05-2a-i',
    paper: '2004-05',
    sec: 'A',
    no: '2(a)(i)',
    marks: 15,
    topics: ['rc-elastic'],
    title: '12×30 section with 8 #6: cracking moment',
    text: String.raw`A singly reinforced rectangular section has 12″ width and 30″ total depth. The tension reinforcement consists of 8 #6 bars. Given $f'_c = 3500$ psi and $f_y = 40{,}000$ psi ($f_s = 20000$ psi), $n = 9$. Determine (i) Cracking moment.`,
    pages: PG.A2,
    given: [G('Cracked / uncracked section formulas', 'f-elastic')],
    notes: ['fr and d not given: fr = 7.5√f′c, d = 26.5 in (two layers). A pencil "54" beside the question is a student note.'],
  },
  {
    id: 'rc-2004-05-2a-ii',
    paper: '2004-05',
    sec: 'A',
    no: '2(a)(ii)',
    marks: 10,
    topics: ['rc-elastic'],
    title: 'Same section: maximum working moment',
    text: String.raw`A singly reinforced rectangular section has 12″ width and 30″ total depth. The tension reinforcement consists of 8 #6 bars. Given $f'_c = 3500$ psi and $f_y = 40{,}000$ psi ($f_s = 20000$ psi), $n = 9$. Determine (ii) Maximum working moment.`,
    pages: PG.A2,
    given: [G('WSD allowable stresses', 'f-wsd')],
  },
  {
    id: 'rc-2004-05-2b-i',
    paper: '2004-05',
    sec: 'A',
    no: '2(b)(i)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Why different load factors for DL and LL?',
    text: 'State why the load factor for dead and live load are different in USD method.',
    pages: PG.A2,
    theory: true,
    given: [G('Load combinations', 'm-loads')],
    solution: () => <Md>{A_LOAD_FACTORS}</Md>,
  },
  {
    id: 'rc-2004-05-2b-ii',
    paper: '2004-05',
    sec: 'A',
    no: '2(b)(ii)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Why φ is used and why it differs',
    text: 'Why strength reduction factor φ is used? Why it is different for different design conditions?',
    pages: PG.A2,
    theory: true,
    given: [G('φ factors and φ–εt chart', 'm-phi')],
    solution: () => <Md>{A_PHI_WHY}</Md>,
  },
  {
    id: 'rc-2004-05-3a',
    paper: '2004-05',
    sec: 'A',
    no: '3(a)',
    marks: 25,
    topics: ['rc-doubly', 'rc-tbeam'],
    title: 'Continuous T-beam floor: design beam AB near the column (−wl²/11)',
    text: String.raw`A floor system is shown in Fig. 2 where the slab carries 40 psf permanent partition, 25 psf floor finish and 40 psf live load. Moment co-efficient for negative moment is 1/11 while the same for positive moment is 1/16. The slab is 5″ thick and the beams are of 10″ width and 24″ total depth. Given $f'_c = 2500$ psi and $f_y = 40{,}000$ psi. Taking into account the self weight of the structure, design flexural reinforcement for the beam AB near column and show the reinforcement in neat sketches. Follow USD method.`,
    pages: PG.A3,
    flag: FLAG_OLD,
    given: [G('ACI moment coefficients', 'sl-aci')],
    figure: () => <TFloorFig hf={5} bw={10} hw={19} cc={12} cover={2.5} webs={3} note="Section a–a: beams 12′ c/c, span AB = 40′ between columns; slab 5″, beams 10″ × 24″" />,
    notes: ['40 ft taken as the clear span. The "1/16" subscript is faint (1/10 possible).'],
  },
  {
    id: 'rc-2004-05-3b-i',
    paper: '2004-05',
    sec: 'A',
    no: '3(b)(i)',
    marks: 5,
    topics: ['rc-basics', 'rc-tbeam'],
    title: 'Sketch a detailed T-section (13″ web, 7 #8 + 3 #6, #4 stirrups)',
    text: 'Neatly sketch, showing the details, the following beam section: (i) A T section having total depth of 25″, web width of 13″ and slab thickness 5″ reinforced with 7 #8 bars in tension and 3 #6 bars in compression. Stirrups consists of #4 bars.',
    pages: PG.A3,
    theory: true,
    given: [G('Cover & spacing rules', 'm-cover')],
    solution: () => (
      <div className="space-y-3">
        <SectionSketch kind="T" />
        <Md>{String.raw`- Width available for bars: $13 - 2(1.5 + 0.5) = 9$ in. #8 bars need ≥ 1 in clear: $n \cdot 1 + (n - 1)\cdot 1 \le 9 \Rightarrow n \le 5$, so **4 #8 in the bottom layer** (clear ≈ 1.67 in) and **3 #8 in a second layer**, directly above, 1 in clear between layers.
- 3 #6 compression bars at the top inside the stirrup corners (also hold the stirrups).
- #4 closed stirrups with 135° hooks; 1.5 in clear cover to the stirrup; flange (5 in slab) with its own slab steel.`}</Md>
      </div>
    ),
  },
  {
    id: 'rc-2004-05-3b-ii',
    paper: '2004-05',
    sec: 'A',
    no: '3(b)(ii)',
    marks: 5,
    topics: ['rc-basics', 'rc-doubly'],
    title: 'Sketch a detailed 18×40 section (7 #8 + 8 #6 bottom, 8 #7 top, 4-leg #3)',
    text: 'Neatly sketch, showing the details, the following beam section: (ii) A rectangular section of width 18″ and total depth of 40″ reinforced with 7 #8 bars and 8 #6 bars at bottom and 8 #7 bars at top. Stirrup consists of 4 legged #3 bars.',
    pages: PG.A3,
    theory: true,
    given: [G('Cover & spacing rules', 'm-cover')],
    solution: () => (
      <div className="space-y-3">
        <SectionSketch kind="R" />
        <Md>{String.raw`- Width for bars: $18 - 2(1.5 + 0.375) = 14.25$ in.
- 7 #8: $7(1) + 6s = 14.25 \Rightarrow s = 1.21$ in ≥ 1 in ✓ → one bottom layer.
- 8 #6: $8(0.75) + 7s = 14.25 \Rightarrow s = 1.18$ in ≥ 1 in ✓ → second layer, 1 in clear above the first.
- 8 #7 top: $8(0.875) + 7s = 14.25 \Rightarrow s = 1.04$ in ≥ 1 in ✓ → one top layer.
- 4-legged #3 stirrups = an outer closed stirrup + an inner closed stirrup (or a two-legged inner tie), all legs hooked 135°.
- $h = 40$ in > 36 in: provide **skin reinforcement** on both side faces over the tension half of the depth.`}</Md>
      </div>
    ),
  },
  {
    id: 'rc-2004-05-4a',
    paper: '2004-05',
    sec: 'A',
    no: '4(a)',
    marks: 20,
    topics: ['rc-singly', 'rc-tbeam'],
    title: 'Porch: cantilever central beam 10″ × 18″ — flexural design',
    text: String.raw`A porch of a building consists of 4″ thick slab supported by three beams spaced 10′ on centres as shown in Fig. 3. The beams have width of 10″ and total depth of 18″. In addition to self weight, the porch slab carries 30 psf lime concrete and 25 psf nominal live load. Design flexural reinforcement for the central beam and show the reinforcements in neat sketches. Given $f'_c = 4000$ psi, $f_y = 60000$ psi. Follow USD method.`,
    pages: PG.A4,
    flag: FLAG_OLD,
    given: [],
    figure: () => <TFloorFig hf={4} bw={10} hw={14} cc={10} cover={2.5} webs={3} note="Porch section: 4″ slab on three 10″ × 18″ beams at 10′ c/c, cantilevering from the building (length not given)" />,
    notes: ['The cantilever length is not given in the figure or text: 6 ft assumed.'],
  },
  {
    id: 'rc-2004-05-4b',
    paper: '2004-05',
    sec: 'A',
    no: '4(b)',
    marks: 15,
    topics: ['rc-doubly'],
    title: '14×21 doubly reinforced section with mixed bars: ultimate capacity',
    text: String.raw`A rectangular section having 14″ width and 21″ total depth is reinforced with 4 #7 and 4 #6 bars at bottom (tension side) and 3 #7 and 3 #6 bars at top (compression side). Given $f'_c = 3500$ psi and $f_y = 60000$ psi, determine the ultimate moment capacity of this section.`,
    pages: PG.A4b,
    given: [G('Stress block & β1', 'f-block')],
    notes: ['d and d′ not given: tension bars in two layers (2.5 and 4.5 in from the bottom), compression bars in one layer at 2.5 in.'],
  },
  {
    id: 'rc-2004-05-5a',
    paper: '2004-05',
    sec: 'B',
    no: '5(a)',
    marks: 17,
    topics: ['rc-tbeam'],
    title: 'T-beams 9 ft c/c, 28 ft span, LL 250 psf: As by USD',
    text: `${T5}\n\n**(a)** Tensile steel area and bar sizes by USD method.`,
    pages: PG.B5,
    flag: FLAG_OLD,
    given: [G('Effective flange width', 'f-beff')],
  },
  {
    id: 'rc-2004-05-5b',
    paper: '2004-05',
    sec: 'B',
    no: '5(b)',
    marks: 12,
    topics: ['rc-tbeam', 'rc-elastic'],
    title: 'Same T-beams: As by WSD',
    text: `${T5}\n\n**(b)** Tensile steel area and bar sizes by WSD method.`,
    pages: PG.B5b,
    flag: FLAG_WSD,
    given: [wsdBox],
  },
  {
    id: 'rc-2004-05-5c',
    paper: '2004-05',
    sec: 'B',
    no: '5(c)',
    marks: 6,
    topics: ['rc-shear'],
    title: 'Average shear stress in terms of √f′c (USD and WSD)',
    text: String.raw`${T5}

**(c)** The average shear stress in term of $\sqrt{f'_c}$ for both of the above cases (a) and (b).`,
    pages: PG.B5,
    given: [G('Vc and limits', 's-vc')],
  },
  {
    id: 'rc-2004-05-6a',
    paper: '2004-05',
    sec: 'B',
    no: '6(a)',
    marks: 10,
    topics: ['rc-oneway'],
    title: 'Minimum and maximum slab reinforcement (ACI) and why',
    text: 'What are the recommendations of ACI Code regarding minimum and maximum permissible reinforcement in slabs? Explain the necessity for these.',
    pages: PG.B6,
    theory: true,
    given: [G('T&S steel', 'sl-ts')],
    solution: () => (
      <Md>{String.raw`**Minimum steel (= temperature & shrinkage steel), ratio to gross area $bh$:**
- Grade 40/50 deformed bars: 0.0020; Grade 60 or welded wire fabric: 0.0018; $f_y > 60$ ksi: $0.0018 \times 60{,}000/f_y \ge 0.0014$.
- Main bars: spacing $\le 3h$ and 18 in; T&S bars (perpendicular): spacing $\le 5h$ and 18 in.

*Why:* slabs are restrained, so shrinkage and temperature change cause tension and cracking; minimum steel keeps cracks fine and distributed. It also ensures the slab does not fail suddenly when it first cracks (strength after cracking > cracking moment), spreads concentrated loads and ties the main bars. (The beam minimum $200bd/f_y$ is not required for slabs.)

**Maximum steel:** as for beams — the section must be under-reinforced:
- ACI 318-02 onward: net tensile strain $\varepsilon_t \ge 0.004$ (i.e. $\rho \le \rho_{max}$); for $\phi = 0.9$, $\varepsilon_t \ge 0.005$.
- Older code (this paper's era): $\rho \le 0.75\rho_b$.

*Why:* a ductile, steel-yielding failure with warning; reliable strength; and in practice slab ρ is far below the limit — the thickness is set by deflection (minimum h), so slabs are lightly reinforced (ρ ≈ 0.3–0.8%). Maximum spacing limits ($3h$, 18 in) also control crack width and make the slab act as a continuous plate between bars.`}</Md>
    ),
  },
  {
    id: 'rc-2004-05-6b-i',
    paper: '2004-05',
    sec: 'B',
    no: '6(b)(i)',
    marks: 5,
    topics: ['rc-oneway'],
    title: 'Slab on 4 brick walls with 5 ft cantilevers: specified load patterns',
    text: `${T6}\n\n**(i)** Find the maximum positive design moment with no live load on cantilever portion of slab and the maximum negative design moment with live load on whole slab. Use factored loads.`,
    pages: PG.B6b,
    flag: FLAG_OLD,
    given: [G('One-way minimum thickness', 'sl-hmin')],
    figure: slabFig,
    notes: ['Slab thickness and floor finish not given: h from the ACI minimum (× (0.4 + fy/100,000) for fy = 55 ksi), no finish.', 'The solutions PDF uses f′c = 3592 psi; the scan reads 3500 psi.'],
  },
  {
    id: 'rc-2004-05-6b-ii',
    paper: '2004-05',
    sec: 'B',
    no: '6(b)(ii)',
    marks: 20,
    topics: ['rc-oneway'],
    title: 'Same slab: USD design and reinforcement sketch',
    text: `${T6}\n\n**(ii)** Using USD method, design the slab following provisions of ACI Code and assuming the slab simply supported on brick walls. Show the reinforcement details in sketches.`,
    pages: PG.B6c,
    flag: FLAG_OLD,
    given: [G('T&S steel', 'sl-ts'), G('As per ft for bar spacing', 'm-asft')],
    figure: slabFig,
  },
  {
    id: 'rc-2004-05-7a',
    paper: '2004-05',
    sec: 'B',
    no: '7(a)',
    marks: 10,
    topics: ['rc-shear'],
    title: 'Forces at a diagonal crack; derive the stirrup spacing formula',
    text: 'Draw a sketch showing all forces at a diagonal crack in a beam with vertical stirrups. Explain all the forces. Using this diagram derive a formula for spacing of stirrups by USD method.',
    pages: PG.B7,
    theory: true,
    given: [G('Vc and limits', 's-vc')],
    solution: () => (
      <div className="space-y-3">
        <DiagCrackFBD />
        <Md>{String.raw`**Forces on the free body left of the crack**
- $V_{cz}$ — shear carried by the **uncracked compression zone** above the crack tip.
- $V_d$ — **dowel action** of the longitudinal bars crossing the crack.
- $V_{iy}$ — vertical component of **aggregate interlock** $V_i$ along the rough crack faces.
- $V_s$ — the **stirrups** crossing the crack, each at yield: $A_vf_{yt}$.
- $C$ and $T = A_sf_s$ — the flexural couple; $T$ is set by the moment at the **top** of the crack.

**Equilibrium:** $V_{ext} = V_{cz} + V_d + V_{iy} + V_s$. ACI lumps the first three as $V_c$ (taken as the diagonal-cracking load, $2\lambda\sqrt{f'_c}b_wd$).

**Stirrup contribution:** the crack's horizontal projection is $p \approx d$ (45°), so it crosses $n = d/s$ stirrups:
$$V_s = n A_vf_{yt} = \frac{A_vf_{yt}d}{s}$$

**Design ($V_u \le \phi V_n = \phi(V_c + V_s)$):**
$$V_u = \phi V_c + \phi\frac{A_vf_{yt}d}{s} \;\Rightarrow\; s = \frac{\phi A_vf_{yt}d}{V_u - \phi V_c}$$
with $\phi = 0.75$ (0.85 in older codes), subject to $s \le d/2$, 24 in (halved when $V_s > 4\sqrt{f'_c}b_wd$), $A_v \ge A_{v,min}$, and $V_s \le 8\sqrt{f'_c}b_wd$.`}</Md>
      </div>
    ),
  },
  {
    id: 'rc-2004-05-7b',
    paper: '2004-05',
    sec: 'B',
    no: '7(b)',
    marks: 5,
    topics: ['rc-shear'],
    title: 'Ordinates of the shear-force diagram (factored loads)',
    text: 'Neglecting self weight find the ordinates of shear force diagram for the beam shown in Fig. 5. The loads shown in the figure are factored.',
    pages: PG.B7,
    given: [],
    figure: () => <OverhangFig />,
  },
  {
    id: 'rc-2004-05-7c',
    paper: '2004-05',
    sec: 'B',
    no: '7(c)',
    marks: 20,
    topics: ['rc-shear'],
    title: 'Same beam: stirrup design and sketch',
    text: String.raw`Using USD method design the shear reinforcement for the beam of Fig. 5 and show details in a sketch. $f'_c = 3000$ psi, $f_y = 50{,}000$ psi.`,
    pages: PG.B7,
    flag: FLAG_OLD,
    given: [G('Vc and limits', 's-vc'), G('Case A–D table', 's-cases')],
    figure: () => <OverhangFig />,
    notes: ['Same beam as 2005-06 Q3(c). Support faces at the centrelines; #4 two-legged stirrups.'],
  },
  {
    id: 'rc-2004-05-8a',
    paper: '2004-05',
    sec: 'B',
    no: '8(a)',
    marks: 5,
    topics: ['rc-bond'],
    title: 'Factors influencing development length',
    text: 'Name the factors influencing the development length of reinforcing steel.',
    pages: PG.B8,
    theory: true,
    given: [G('ψ factors', 'b-psi')],
    solution: () => <Md>{A_LD_FACTORS}</Md>,
  },
  {
    id: 'rc-2004-05-8b',
    paper: '2004-05',
    sec: 'B',
    no: '8(b)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'Terms of the ACI 318-99 ld equation; when (c + Ktr)/db = 1.5 or 1.0',
    text: String.raw`Explain, indicating limitations, all the terms in the following equation for development of tension bars:
$$\frac{l_d}{d_b} = \frac{3}{40}\cdot\frac{f_y}{\sqrt{f'_c}}\cdot\frac{\alpha\beta\gamma\lambda}{\left(\dfrac{c + K_{tr}}{d_b}\right)}$$
Discuss under what conditions the term $(c + K_{tr})/d_b$ may be set equal to 1.5 or 1.0.`,
    pages: PG.B8,
    theory: true,
    flag: 'ACI 318-99 notation (α, β, γ, λ); the slides use ψt, ψe, ψs, λ',
    given: [G('ld simplified + general', 'b-ld'), G('ψ factors', 'b-psi')],
    solution: () => (
      <Md>{String.raw`**Terms**
- $l_d$ — development length (in), **not less than 12 in**; $d_b$ — bar diameter.
- $f_y$ — specified yield strength (psi); $\sqrt{f'_c}$ in psi, **limited to 100 psi**.
- **α — bar location:** 1.3 for top bars (more than 12 in of fresh concrete cast below); 1.0 otherwise. (Now $\psi_t$.)
- **β — coating:** 1.5 for epoxy-coated bars with cover < $3d_b$ or clear spacing < $6d_b$; 1.2 other epoxy-coated; 1.0 uncoated. **αβ ≤ 1.7.** (Now $\psi_e$.)
- **γ — bar size:** 0.8 for #6 and smaller bars and deformed wire; 1.0 for #7 and larger. (Now $\psi_s$.)
- **λ — lightweight concrete:** 1.3 (or $6.7\sqrt{f'_c}/f_{ct} \ge 1.0$ when $f_{ct}$ is specified); 1.0 normal weight. (Now λ = 0.75 in the denominator.)
- **c** — the smaller of (distance from bar centre to the nearest concrete surface) and (half the centre-to-centre spacing of the bars being developed).
- **$K_{tr} = A_{tr}f_{yt}/(1500\,s\,n)$** — transverse-reinforcement index ($A_{tr}$ = stirrup area within s crossing the splitting plane, n = bars developed). $K_{tr} = 0$ may always be used.
- $(c + K_{tr})/d_b \le 2.5$ — beyond that, pull-out governs and more confinement does not help.
- Excess reinforcement: multiply by $A_{s,req}/A_{s,prov}$.

**$(c + K_{tr})/d_b = 1.5$** may be used when **clear spacing ≥ $d_b$, clear cover ≥ $d_b$, and stirrups/ties along $l_d$ ≥ the code minimum**, or when **clear spacing ≥ $2d_b$ and clear cover ≥ $d_b$**. Then $l_d/d_b = f_y\alpha\beta\lambda/(20\sqrt{f'_c})$ for #7 and larger ($/25$ for #6 and smaller).

**$(c + K_{tr})/d_b = 1.0$** for **all other cases** (closer bars or thinner cover): $l_d/d_b = 3f_y\alpha\beta\lambda/(40\sqrt{f'_c})$ (#7+), $3f_y\alpha\beta\lambda/(50\sqrt{f'_c})$ (#6 and smaller).`}</Md>
    ),
  },
  {
    id: 'rc-2004-05-8c-i',
    paper: '2004-05',
    sec: 'B',
    no: '8(c)(i)',
    marks: 15,
    topics: ['rc-bond'],
    title: 'Bar cut-off locations from a linear moment envelope',
    text: `${T8c}\n\n**(i)** Determine the bar cut off locations shown in the figure. Use the formula mentioned in question No. 8(b) with $(c + K_{tr})/d_b = 1.5$.`,
    pages: PG.B8,
    given: [G('Cut-off rules', 'b-cutoff'), G('ld simplified + general', 'b-ld')],
    figure: () => <Fig6 />,
    notes: ['Fig. 6 is hand-drawn: read as 3-#9 (longer) + 2-#9 (shorter) top bars, 3-#8 continuous + 2-#8 cut bottom bars, both envelopes linear (−M zero at 10 ft, +M from 6 ft to midspan at 16 ft).', 'Moment at a section taken proportional to the steel required (As,req 4.7 in² at the face, 3.8 in² at midspan).'],
  },
  {
    id: 'rc-2004-05-8c-ii',
    paper: '2004-05',
    sec: 'B',
    no: '8(c)(ii)',
    marks: 5,
    topics: ['rc-bond'],
    title: 'Hooked top bars in the 18″ column: adequate?',
    text: String.raw`${T8c}

**(ii)** Check whether the top bars have adequate development length at hooked end inside the column. Use the formula below with proper modification factors:
$$l_{hb} = \frac{1200\,d_b}{\sqrt{f'_c}}$$`,
    pages: PG.B8,
    flag: 'ACI 318-99 hook formula (lhb × modifiers); current ldh = fy ψ db/(50λ√f′c) gives the same base value',
    given: [G('Hook ldh', 'b-hook')],
    figure: () => <Fig6 />,
    notes: ['Cover in the column not given: 2 in to the far face assumed.'],
  },
]

export const R2004: RcQ[] = BASE.map((q) => (SOL[q.id] ? { ...q, ...SOL[q.id] } : q))

