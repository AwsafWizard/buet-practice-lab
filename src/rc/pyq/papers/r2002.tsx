// CE 315 term final 2002-03 (held 28 Aug 2004), PDF pp. 112–116.
// Section A and B: 4 questions each, answer 3 (35 marks). Figs 1–4 on a separate sheet (p. 116), Figs 5–10 inline.
// No design aids; WSD constants j = 0.874, R = 223 psi given inline (they belong to fs = 20 ksi, n = 9).
// "ρ = 0.7ρmax" (Q2(b)(ii)) is the pre-2002 ρmax = 0.75ρb.
import { Md } from '../../../components/ui'
import type { RcGiven, RcQ } from '../../types'
import { allowableMoment, f, uncracked, wsdParams } from '../../engine/elastic'
import { pickBars as pickDoubly } from '../../engine/doubly'
import { designT, effectiveWidth, floorLoads, reviewT, wsdTDesign } from '../../engine/tbeam'
import { designShear, type ShearSection } from '../../engine/shear'
import { cantSlab } from '../../engine/oneway'
import { designAs, designSection, review } from '../../engine/singly'
import { rhoLimits } from '../../engine/materials'
import {
  A_PHI_WHY,
  A_OVER_UNDER,
  A_TS,
  CONC,
  DimH,
  DimV,
  Fig,
  INK,
  LOAD,
  MUTE,
  PLoad,
  Pin,
  Roller,
  STEEL,
  T,
  Udl,
  Hatch,
  Bars,
  ThreeStages,
  ShearSol,
  Sol,
  ck,
  cantSlabSteps,
  SlabSketch,
  tDesignSteps,
  wsdTSteps,
  type St,
} from './r2006'
import { A_LD_FACTORS, A_THREE, BeamAFig, FLAG_OLD, FLAG_WSD, FourSpanFig, RectSecFig, SSBeamFig, SlabStripFig, TFloorFig, beamADesign, beamASols, detailSol, ssBeamDesign, ssBeamSteps } from './r2005'
import { DiagCrackFBD } from './r2004'

const G = (label: string, ref: string, what?: string, formula?: boolean): RcGiven => ({ label, ref, what, formula })
const FT = (v: number, d = 2) => f(v, d)

// ================================================================ figures
function Fig2() {
  const s = 9
  const X = (ft: number) => 60 + ft * s
  const yB = 90
  return (
    <Fig w={600} h={200}>
      <Udl x1={X(0)} x2={X(49)} y={yB} label="DL = 1.5 k/ft (incl. own wt), LL = 0.8 k/ft" />
      <rect x={X(0)} y={yB} width={49 * s} height={12} fill={CONC} stroke={INK} />
      {[0, 24.5, 49].map((x, i) => (
        <g key={i}>
          <rect x={X(x) - 4} y={yB + 12} width={8} height={40} fill={CONC} stroke={INK} />
          <T x={X(x)} y={yB + 66} b>
            {'ABC'[i]}
          </T>
        </g>
      ))}
      {[
        [1, '−1/16'],
        [12, '+1/14'],
        [23, '−1/9'],
        [26, '−1/9'],
        [37, '+1/14'],
        [48, '−1/16'],
      ].map(([x, l], i) => (
        <T key={i} x={X(x as number)} y={yB - 34} s={11} c={STEEL}>
          {l as string}
        </T>
      ))}
      <DimH x1={X(0.5)} x2={X(24)} y={yB + 82} label="24′-0″ clear" />
      <DimH x1={X(25)} x2={X(48.5)} y={yB + 82} label="24′-0″ clear" />
      <T x={540} y={40} s={11} c={MUTE}>
        T-section, 5″ slab
      </T>
    </Fig>
  )
}

function Fig6() {
  const s = 1.4
  const yS = 120
  return (
    <Fig w={600} h={190}>
      <rect x={60} y={yS} width={24 * 12 * s + 12 * s} height={5 * 2.4} fill={CONC} stroke={INK} />
      {[0, 12, 24].map((ft, i) => (
        <rect key={i} x={60 + ft * 12 * s} y={yS - 60} width={12 * s} height={61} fill={CONC} stroke={INK} />
      ))}
      <DimH x1={60 + 6 * s} x2={60 + 150 * s} y={yS + 34} label="12′" />
      <DimH x1={60 + 150 * s} x2={60 + 294 * s} y={yS + 34} label="12′" />
      <T x={330} y={yS - 70} s={11}>
        upstand (inverted) beams 12″ wide, depth not given
      </T>
      <T x={330} y={yS + 26} s={11}>
        5″ slab at the bottom
      </T>
      <T x={480} y={60} a="start" s={11} c={MUTE}>
        16 ft cantilever
      </T>
      <T x={480} y={76} a="start" s={11} c={MUTE}>
        from the support face
      </T>
    </Fig>
  )
}

function Fig9() {
  const s = 11
  const X = (ft: number) => 70 + ft * s
  const y = 80
  return (
    <Fig w={600} h={210}>
      <rect x={X(-0.5)} y={y} width={41 * s} height={24} fill={CONC} stroke={INK} />
      <Udl x1={X(-0.5)} x2={X(40.5)} y={y} label="3 k/ft (factored)" />
      {[10, 20, 30].map((x) => (
        <PLoad key={x} x={X(x)} y={y - 18} label="30 k" len={30} />
      ))}
      <Hatch x={X(-1)} y={y + 24} w={s} h={40} />
      <Hatch x={X(40)} y={y + 24} w={s} h={40} />
      {[0, 10, 20, 30].map((x) => (
        <DimH key={x} x1={X(x)} x2={X(x + 10)} y={y + 84} label="10′" />
      ))}
      <T x={300} y={y + 108} s={11} c={MUTE}>
        supports: 12″ × 12″ columns · section bw = 15″, d = 24″ · f′c = 3000 psi, fy = 50,000 psi
      </T>
    </Fig>
  )
}

// ================================================================ solutions
const SEC1 = { b: 12, h: 24, d: 21, As: 3 * 1.0, fc: 3000, n: 9, frPsi: 300 }
const q1 = { U: uncracked(SEC1), A: allowableMoment(SEC1, 1.35, 20), R: review({ b: 12, fc: 3000, fy: 50000, layers: [{ As: 3.0, d: 21 }] }) }

const q2 = (() => {
  const w = 1.5 + 0.8
  const MB = (w * 24 * 24) / 9
  const MP = (w * 24 * 24) / 14
  const MA = (w * 24 * 24) / 16
  const R = 0.223
  const j = 0.874
  const dReq = Math.sqrt((MB * 12) / (R * 12))
  const h = Math.ceil(dReq + 2.5)
  const d = h - 2.5
  const AsB = (MB * 12) / (24 * j * d)
  const AsA = (MA * 12) / (24 * j * d)
  const B = effectiveWidth({ kind: 'interior', L: 24, bw: 12, hf: 5, rule: 'aci08' })
  const win = { M: MP, beff: B.b, hf: 5, d, n: 9, fcAllow: 1.35, fsAllow: 24 }
  const WT = wsdTDesign(win)
  const P24 = wsdParams(9, 1.35, 24)
  // USD
  const wu = 1.2 * 1.5 + 1.6 * 0.8
  const MuB = (wu * 576) / 9
  const MuP = (wu * 576) / 14
  const MuA = (wu * 576) / 16
  const L = rhoLimits(3000, 60000)
  const rho = 0.7 * 0.75 * L.rhoB
  const S = designSection(MuB, 3000, 60000, rho, { b: 12, layers: 1 })
  const dU = S.dAct
  const DB = designAs(MuB, 12, dU, 3000, 60000)
  const DA = designAs(MuA, 12, dU, 3000, 60000)
  const tin = { Mu: MuP, beff: B.b, bw: 12, hf: 5, d: dU, fc: 3, fy: 60 }
  const TD = designT(tin)
  const pk = (As: number) => pickDoubly(As, 12)
  return { w, MB, MP, MA, R, j, dReq, h, d, AsB, AsA, B, win, WT, P24, wu, MuB, MuP, MuA, L, rho, S, dU, DB, DA, tin, TD, pk }
})()

const q3 = cantSlab({ span: 14, support: 12, cantL: 6, cantR: 6, ll: 80, ff: 25, pw: 30, fc: 3000, fy: 50000, h: 6 })

const q4 = (() => {
  const B = effectiveWidth({ kind: 'interior', L: 30, bw: 12, hf: 5, cc: 144, rule: 'aci08' })
  const As = 8 * 0.79
  const d = 30 - 3.5
  const RT = reviewT({ beff: B.b, bw: 12, hf: 5, d, dt: 27.5, As, fc: 3, fy: 60 })
  const FL = floorLoads({ hf: 5, spacing: 12, bw: 12, h: 30, sdl: 50, ll: 0 })
  const wu = (8 * RT.phiMn) / 900
  const wL = (wu - 1.2 * FL.wD) / 1.6
  const psf = (wL / 12) * 1000
  return { B, As, d, RT, FL, wu, wL, psf }
})()

const q5a = allowableMoment({ b: 12, h: 32, d: 28, As: 8 * 0.79, Asp: 2 * 0.44, dp: 2.5, fc: 3000, n: 9 }, 1.35, 20)

const q5b = (() => {
  const h = 28
  const L = 16
  const FL = floorLoads({ hf: 5, spacing: 12, bw: 12, h, sdl: 20, ll: 100 })
  const Mu = (FL.wu * L * L) / 2
  const B = effectiveWidth({ kind: 'interior', L, bw: 12, hf: 5, cc: 144, rule: 'aci08' })
  const d = h - 3.5
  const tin = { Mu, beff: B.b, bw: 12, hf: 5, d, dt: h - 2.5, fc: 3, fy: 60 }
  const TD = designT(tin)
  const bars = pickDoubly(TD.As, 12)
  const sec: ShearSection = { bw: 12, d, fc: 3000, fy: 60000 }
  const D = designShear({ kind: 'cant', L, wD: FL.slab + FL.sdl, wL: FL.wL, selfWeight: { b: 12, h: h - 5 } }, sec)
  return { h, L, FL, Mu, B, d, tin, TD, bars, sec, D }
})()

const q6 = beamADesign(5, 20, 150, 3000, 9)
const sol6 = beamASols(q6)
const sol7a = detailSol(
  [
    ['+A–B', 4.3],
    ['+B–C', 2.96],
    ['+C–D', 2.96],
    ['+D–E', 2.3],
    ['−B', 4.8],
    ['−C', 4.4],
    ['−D', 4.4],
    ['−E', 5.2],
  ],
  'No −As(A) is listed: provide at least 2 bars (e.g. 2 #6) hooked into column A, and ¼ of +As(A–B) into the support.',
)

const SEC7: ShearSection = { bw: 15, d: 24, fc: 3000, fy: 50000 }
const q7b = designShear({ kind: 'ss', L: 40, wD: 3, P: [10, 20, 30].map((x) => ({ x, P: 30 })), factored: true, supportWidth: 12 }, SEC7)

const q8c = ssBeamDesign(36, 1.5, 1.0, 3000, 50000, 14, 20, 9)

const SOL: Record<string, Pick<RcQ, 'checks' | 'solution'>> = {
  'rc-2002-03-1b': {
    checks: () => [ck('Mcr', 'Cracking moment (uncracked transformed)', q1.U.Mcr, 'k-ft'), ck('Mall', 'Allowable (working) moment', q1.A.M, 'k-ft'), ck('Mn', 'Nominal strength Mn', q1.R.Mn, 'k-ft')],
    solution: () => (
      <Sol
        steps={[
          { t: 'First crack', md: '$f_r = 300$ psi and $n = 9$ as given.' },
          ...q1.U.steps,
          { t: 'Allowable moment (fc = 0.45f′c = 1.35 ksi, fs = 20 ksi)', md: '' },
          ...q1.A.steps,
          { t: 'Nominal strength (fy = 50 ksi)', md: '' },
          ...q1.R.steps,
        ].filter((x: St) => x.md !== '' || x.tex)}
        end={`$M_{cr} = ${FT(q1.U.Mcr, 1)}$ k-ft (gross: ${FT(q1.U.McrG, 1)}); $M_{all} = ${FT(q1.A.M, 1)}$ k-ft; $M_n = ${FT(q1.R.Mn, 1)}$ k-ft.`}
      />
    ),
  },
  'rc-2002-03-2b-i': {
    checks: () => [ck('MB', 'Service moment at B (wl²/9)', q2.MB, 'k-ft'), ck('d', 'd required (b = 12, R = 223)', q2.dReq, 'in'), ck('AsB', 'As at B', q2.AsB, 'in²', 0.03), ck('AsP', 'As at midspan (T)', q2.WT.As, 'in²', 0.04)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Service moments (w = 1.5 + 0.8 = 2.3 k/ft, ln = 24 ft)', tex: `M_B = \\frac{wl_n^2}{9} = ${FT(q2.MB, 1)},\\quad M^+ = \\frac{wl_n^2}{14} = ${FT(q2.MP, 1)},\\quad M_A = M_C = \\frac{wl_n^2}{16} = ${FT(q2.MA, 1)}\\text{ k-ft}` },
          { t: 'Size from the support moment (rectangle, flange in tension)', tex: `d = \\sqrt{\\frac{M_B}{Rb}} = \\sqrt{\\frac{${FT(q2.MB * 12, 0)}}{0.223(12)}} = ${FT(q2.dReq)}\\text{ in} \\Rightarrow h = ${q2.h}\\text{ in},\\ d = ${FT(q2.d)}\\text{ in}`, md: `Using the printed $j = 0.874$, $R = 223$ psi (these are the $f_s = 20$ ksi values; with $f_s = 24$ ksi the engine gives $k = ${FT(q2.P24.k, 3)}$, $j = ${FT(q2.P24.j, 3)}$, $R = ${FT(q2.P24.R * 1000, 0)}$ psi — solve as printed and say so).` },
          { t: 'Top steel at B', tex: `A_s = \\frac{M}{f_sjd} = \\frac{${FT(q2.MB * 12, 0)}}{24(0.874)(${FT(q2.d)})} = ${FT(q2.AsB)}\\text{ in}^2` },
          { t: 'Top steel at A and C', tex: `A_s = \\frac{${FT(q2.MA * 12, 0)}}{24(0.874)(${FT(q2.d)})} = ${FT(q2.AsA)}\\text{ in}^2` },
          { t: 'Midspan (T-section, beff)', md: `$b_{eff} = \\min(L/4 = 72,\\ 16h_f + b_w = 92) = ${FT(q2.B.b)}$ in (spacing not given).` },
          ...wsdTSteps(q2.win, q2.WT),
        ]}
        end={`WSD: 12″ × ${q2.h}″; top at B **${q2.pk(q2.AsB).n} #${q2.pk(q2.AsB).no}**, top at A/C **${q2.pk(q2.AsA).n} #${q2.pk(q2.AsA).no}**, bottom in each span **${q2.pk(q2.WT.As).n} #${q2.pk(q2.WT.As).no}**.`}
      />
    ),
  },
  'rc-2002-03-2b-ii': {
    checks: () => [ck('rho', 'ρ = 0.7ρmax (ρmax = 0.75ρb)', q2.rho, '', 0.01), ck('MuB', 'Mu at B', q2.MuB, 'k-ft'), ck('AsB', 'As at B', q2.DB.As, 'in²', 0.03), ck('AsP', 'As at midspan', q2.TD.As, 'in²', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Factored moments', tex: `w_u = 1.2(1.5) + 1.6(0.8) = ${FT(q2.wu, 3)}\\text{ k/ft};\\ M_{uB} = ${FT(q2.MuB, 1)},\\ M_u^+ = ${FT(q2.MuP, 1)},\\ M_{uA} = ${FT(q2.MuA, 1)}\\text{ k-ft}` },
          { t: 'Steel ratio as asked', tex: `\\rho_b = ${FT(q2.L.rhoB, 4)},\\ \\rho_{max} = 0.75\\rho_b = ${FT(0.75 * q2.L.rhoB, 4)},\\ \\rho = 0.7\\rho_{max} = ${FT(q2.rho, 5)}`, md: 'ρmax = 0.75ρb is the pre-2002 limit the paper refers to (today ρmax is set by εt = 0.004).' },
          ...q2.S.steps,
          { t: 'Top steel at B', md: '' },
          ...q2.DB.steps,
          { t: 'Top steel at A, C', tex: `A_s = ${FT(q2.DA.As)}\\text{ in}^2` },
          { t: 'Midspan T-section', md: `$b_{eff} = ${FT(q2.B.b)}$ in.` },
          ...tDesignSteps(q2.tin, q2.TD),
        ].filter((x: St) => x.md !== '' || x.tex)}
        end={`USD: 12″ × ${q2.S.h}″; top at B **${q2.pk(q2.DB.As).n} #${q2.pk(q2.DB.As).no}**, at A/C **${q2.pk(q2.DA.As).n} #${q2.pk(q2.DA.As).no}**, bottom **${q2.pk(q2.TD.As).n} #${q2.pk(q2.TD.As).no}** per span.`}
      />
    ),
  },
  'rc-2002-03-3b': {
    checks: () => [ck('wu', 'Factored load wu', q3.loads.wu, 'psf'), ck('Mneg', '−Mu at the beam faces', q3.Mneg, 'k-ft/ft'), ck('Mpos', '+Mu in the span', q3.Mpos, 'k-ft/ft')],
    solution: () => (
      <Sol steps={cantSlabSteps(q3, 'USD chosen (either was allowed).')} end={`$M_u^- = ${FT(q3.Mneg)}$ k-ft/ft over each beam, $M_u^+ = ${FT(q3.Mpos)}$ k-ft/ft at midspan.`}>
        <SlabSketch r={q3} beams />
      </Sol>
    ),
  },
  'rc-2002-03-4a': {
    checks: () => [ck('beff', 'beff', q4.B.b, 'in'), ck('phiMn', 'Ultimate design moment φMn', q4.RT.phiMn, 'k-ft'), ck('psf', 'Allowable live load', q4.psf, 'psf', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Section', md: `$b_{eff} = \\min(L/4 = 90,\\ 16h_f + b_w = 92,\\ 144) = ${FT(q4.B.b)}$ in; 8 #8 = ${FT(q4.As)} in² in two rows: $d = 30 - 3.5 = 26.5$ in, $d_t = 27.5$ in.` },
          {
            t: q4.RT.rect ? 'Stress block in the flange' : 'True T-beam',
            tex: q4.RT.rect
              ? `a = \\frac{A_sf_y}{0.85f'_cb_{eff}} = ${FT(q4.RT.a)}\\text{ in} \\le h_f = 5`
              : `A_{sf} = ${FT(q4.RT.Asf)},\\ a = ${FT(q4.RT.a)}\\text{ in}`,
          },
          { t: 'Strength', tex: `M_n = ${FT(q4.RT.Mn / 12, 1)}\\text{ k-ft},\\ \\varepsilon_t = ${FT(q4.RT.epsT, 4)} \\Rightarrow \\phi = ${FT(q4.RT.phi)},\\ \\phi M_n = ${FT(q4.RT.phiMn, 1)}\\text{ k-ft}` },
          { t: 'Dead load per beam (12 ft strip)', tex: `w_D = ${FT(q4.FL.slab, 3)} + ${FT(q4.FL.web, 3)} + ${FT(q4.FL.sdl, 3)}\\ (20 + 30\\text{ psf}) = ${FT(q4.FL.wD, 3)}\\text{ k/ft}` },
          { t: 'Live load', tex: `w_u = \\frac{8\\phi M_n}{L^2} = ${FT(q4.wu, 3)} = 1.2(${FT(q4.FL.wD, 3)}) + 1.6w_L \\Rightarrow w_L = ${FT(q4.wL, 3)}\\text{ k/ft} = \\frac{${FT(q4.wL * 1000, 0)}}{12} = ${FT(q4.psf, 0)}\\text{ psf}` },
        ]}
        end={`$\\phi M_n = ${FT(q4.RT.phiMn, 1)}$ k-ft → allowable **LL ≈ ${FT(q4.psf, 0)} psf**. (With 1.4D + 1.7L of the paper's era the answer is lower — say which factors you use.)`}
      />
    ),
  },
  'rc-2002-03-5a': {
    checks: () => [ck('kd', 'kd (2n rule)', q5a.kd, 'in'), ck('M', 'Allowable moment', q5a.M, 'k-ft')],
    solution: () => <Sol steps={[{ t: 'Data', md: "$A_s = 8(0.79) = 6.32$ in², $A'_s = 2(0.44) = 0.88$ in² at $d' = 2.5$ in (assumed), $d = 28$ in, $f_c = 1.35$ ksi, $f_s = 20$ ksi, $n = 9$; compression steel at 2n." }, ...q5a.steps]} end={`$M_{all} = ${FT(q5a.M, 1)}$ k-ft (${q5a.governs} governs). Check $f'_s = 2nf_c(kd - d')/kd \\le f_s$.`} />,
  },
  'rc-2002-03-5b': {
    checks: () => [ck('Mu', 'Mu at the support face', q5b.Mu, 'k-ft'), ck('As', 'Top steel As', q5b.TD.As, 'in²', 0.04), ck('Vd', 'Vu at d', q5b.D.runs[0].Vd, 'k')],
    solution: () => (
      <div className="space-y-3">
        <Sol
          steps={[
            { t: 'Assumption', md: `Beam depth not given: cantilever minimum $l/8 = 24$ in → take **h = ${q5b.h} in** (two layers of top bars, $d = ${FT(q5b.d)}$ in). USD.` },
            { t: 'Why "inverted" matters', md: 'Hogging moment puts the TOP in tension and the BOTTOM in compression — the 5 in slab is at the bottom, so it is a **compression flange**: T-beam action under negative moment.' },
            { t: 'Loads (12 ft strip)', tex: `w_D = \\underbrace{${FT(q5b.FL.slab, 3)}}_{\\text{slab}} + \\underbrace{${FT(q5b.FL.web, 3)}}_{\\text{web}} + \\underbrace{${FT(q5b.FL.sdl, 3)}}_{\\text{FF}} = ${FT(q5b.FL.wD, 3)},\\ w_L = ${FT(q5b.FL.wL, 3)},\\ w_u = ${FT(q5b.FL.wu, 3)}\\text{ k/ft}` },
            { t: 'Moment', tex: `M_u = \\frac{w_uL^2}{2} = \\frac{${FT(q5b.FL.wu, 3)}(16)^2}{2} = ${FT(q5b.Mu, 1)}\\text{ k-ft}`, md: `$b_{eff} = ${FT(q5b.B.b)}$ in (L/4 with L = 16 ft).` },
            ...tDesignSteps(q5b.tin, q5b.TD),
            { t: 'Bars', md: `Top ${q5b.bars.n} #${q5b.bars.no} (${FT(q5b.bars.A)} in²), anchored into the support by ld/hook; 2 bars in the slab-side (bottom) corners as stirrup hangers.` },
          ]}
        />
        <ShearSol D={q5b.D} sec={q5b.sec} end={`Flexure: top **${q5b.bars.n} #${q5b.bars.no}**. Shear: #3 two-legged stirrups as laid out above.`} />
      </div>
    ),
  },
  'rc-2002-03-6b-i': sol6[0],
  'rc-2002-03-6b-ii': sol6[1],
  'rc-2002-03-7a': sol7a,
  'rc-2002-03-7b': {
    checks: () => [ck('R', 'Reaction', q7b.dg.R[0], 'k'), ck('Vd', 'Vu at d from the face', q7b.runs.find((r) => r.id === 'sL')!.Vd, 'k'), ck('phiVc', 'φVc', q7b.lim.phiVc, 'k')],
    solution: () => (
      <ShearSol
        D={q7b}
        sec={SEC7}
        pre={[{ t: 'Reactions', tex: `R = \\frac{3(40) + 3(30)}{2} = ${FT(q7b.dg.R[0], 1)}\\text{ k}`, md: '40 ft taken centre to centre of the 12 in columns (faces 6 in in from each end). Loads factored; no self-weight added.' }]}
        end="#3 two-legged stirrups; mirror the layout about midspan and sketch the zones."
      />
    ),
  },
  'rc-2002-03-8c': {
    checks: () => [ck('h', 'Total depth chosen', q8c.h, 'in', 0.05), ck('Mu', 'Mu', q8c.Mu, 'k-ft'), ck('As', 'Required As', q8c.D.As, 'in²', 0.04)],
    solution: () => <Sol steps={ssBeamSteps(q8c, 36, 1.5, 1.0, 14)} end={`USD: **14″ × ${q8c.h}″**, ${q8c.bars.n} #${q8c.bars.no}. (Open design.)`} />,
  },
}

// ================================================================ questions
const PG = { A1: [112], A1f: [112, 116], A2: [112], A2f: [112, 116], A3: [112], A3f: [112, 116], A4: [113, 116], A4b: [113], B5: [113], B6: [114], B7: [114], B7b: [115], B8: [115] }
const T2 = String.raw`A two span beam supported on columns carries a dead load of 1.5 kip/ft including its own weight and a live load of 0.8 kip/ft as shown in Fig. 2. Given: slab thickness = 5″; $f'_c = 3$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi; $j = 0.874$, $R = 223$ and $n = 9$. (ACI moment coefficients: −1/16 at A and C, +1/14 in the spans, −1/9 at B.)`
const T6 = String.raw`Due to certain reasons the architect has proposed the beams supporting a slab as shown in Fig. 7. Span of each beam is 30 ft. The slab supports floor finish (FF) = 20 psf and live load (LL) = 150 psf. Given $f'_c = 3$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $n = 9$.`
const fig1 = () => <RectSecFig b={12} h={24} d={21} n={3} label="3 #9 bars (one row)" title="Fig. 1" />

const BASE: RcQ[] = [
  {
    id: 'rc-2002-03-1a',
    paper: '2002-03',
    sec: 'A',
    no: '1(a)',
    marks: 9,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Strain and stress diagrams: uncracked, cracked, ultimate',
    text: 'Draw sketches for strain and stress distribution diagrams of a reinforced concrete beam section when subjected to bending for uncracked, cracked and ultimate condition.',
    pages: PG.A1,
    theory: true,
    given: [],
    solution: () => (
      <div className="space-y-3">
        <Md>{A_THREE}</Md>
        <ThreeStages />
      </div>
    ),
  },
  {
    id: 'rc-2002-03-1b',
    paper: '2002-03',
    sec: 'A',
    no: '1(b)',
    marks: 26,
    topics: ['rc-elastic', 'rc-singly'],
    title: '12×24 beam with 3 #9: Mcr, allowable moment and Mn',
    text: String.raw`Find the moment that will produce the first crack in a rectangular beam, 12″ × 24″ in cross section, reinforced with 3 – #9 bars in one row as shown in Fig. 1. Also calculate the allowable (working) moment capacity and nominal flexural strength (ultimate) for the beam section. Given: $f'_c = 3$ ksi; $f_y = 50$ ksi; $f_s = 20$ ksi, $f_r$ (modulus of rupture) = 300 psi and $n = 9$.`,
    pages: PG.A1f,
    given: [G('Cracked / uncracked section formulas', 'f-elastic'), G('WSD allowable stresses', 'f-wsd')],
    figure: fig1,
    notes: ['Fig. 1 width label is degraded on the scan (looks like 17″); the text says 12″. d = 21″ from the figure.'],
  },
  {
    id: 'rc-2002-03-2a',
    paper: '2002-03',
    sec: 'A',
    no: '2(a)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Factors that influence development length',
    text: 'Discuss in brief the factors that influence the development length.',
    pages: PG.A2,
    theory: true,
    given: [G('ψ factors', 'b-psi')],
    solution: () => <Md>{A_LD_FACTORS}</Md>,
  },
  {
    id: 'rc-2002-03-2b-i',
    paper: '2002-03',
    sec: 'A',
    no: '2(b)(i)',
    marks: 14,
    topics: ['rc-elastic', 'rc-tbeam'],
    title: 'Two-span beam with ACI coefficients — design by WSD',
    text: `${T2}\n\n**(i)** Design the beam by WSD method and show all the flexural reinforcements.`,
    pages: PG.A2f,
    flag: FLAG_WSD,
    given: [G('ACI moment coefficients', 'sl-aci'), G('WSD T-beam k, j, z', 'f-wsdT')],
    figure: () => <Fig2 />,
    notes: ['Printed marks 28 cover (i) + (ii); split 14 / 14.', 'j = 0.874 and R = 223 psi correspond to fs = 20 ksi, not the stated 24 ksi. Web b not given: b = 12 in chosen.'],
  },
  {
    id: 'rc-2002-03-2b-ii',
    paper: '2002-03',
    sec: 'A',
    no: '2(b)(ii)',
    marks: 14,
    topics: ['rc-singly', 'rc-tbeam'],
    title: 'Same beam — design by USD with ρ = 0.7ρmax',
    text: `${T2}\n\n**(ii)** Design the beam by USD method assuming $\\rho = 0.7\\rho_{max}$ and show all the flexural reinforcements.`,
    pages: PG.A2f,
    flag: 'Pre-2002: ρmax = 0.75ρb, then 1.4D + 1.7L — solved with ρmax = 0.75ρb as asked and 1.2D + 1.6L',
    given: [G('ρ limits (Table A.4)', 'f-rho'), G('ACI moment coefficients', 'sl-aci')],
    figure: () => <Fig2 />,
  },
  {
    id: 'rc-2002-03-3a',
    paper: '2002-03',
    sec: 'A',
    no: '3(a)',
    marks: 7,
    topics: ['rc-basics'],
    title: 'Values of φ for different strength conditions — why different?',
    text: 'Write down the values of strength reduction factors for different strength condition in the ACI code. Why are they different?',
    pages: PG.A3,
    theory: true,
    given: [G('φ factors and φ–εt chart', 'm-phi')],
    solution: () => (
      <Md>{String.raw`**ACI 318-99 (the code of this paper):**
- Flexure without axial load: **0.90**
- Axial tension, and axial tension with flexure: **0.90**
- Axial compression, with or without flexure: spirally reinforced **0.75**, other (tied) **0.70** (may rise linearly to 0.90 as the axial load falls to zero)
- Shear and torsion: **0.85**
- Bearing on concrete: **0.70**
- Plain (unreinforced) concrete, flexure etc.: **0.65**

**ACI 318-02 onward (current slides):** tension-controlled 0.90; compression-controlled 0.65 tied / 0.75 spiral (0.70 in 318-02), linear between by $\varepsilon_t$; shear and torsion **0.75**; bearing 0.65; plain concrete 0.60.

` + A_PHI_WHY}</Md>
    ),
  },
  {
    id: 'rc-2002-03-3b',
    paper: '2002-03',
    sec: 'A',
    no: '3(b)',
    marks: 28,
    topics: ['rc-oneway'],
    title: 'Slab on two beams with 6 ft cantilevers — moments and steel (WSD or USD)',
    text: String.raw`A 6″ thick slab (one-way) is supported on RC beams as shown in Fig. 3. The slab is subjected to a working live load of 80 psf in addition to its own self weight, floor finish of 25 psf and light partition wall of 30 psf. The live load can occupy any portion or any position on the slab. Calculate the critical design moments in slab and show the necessary reinforcements in sketches. Use either WSD or USD. Given: $f'_c = 3$ ksi; $f_y = 50$ ksi; $f_s = 20$ ksi; $n = 9$; $j = 0.874$ and $R = 223$.`,
    pages: PG.A3f,
    flag: FLAG_OLD,
    given: [G('T&S steel', 'sl-ts'), G('As per ft for bar spacing', 'm-asft')],
    figure: () => <SlabStripFig cant={6} clear={14} support={12} h="6″ slab" label="self-wt + FF 25 + PW 30 psf; LL 80 psf on any portion" note="Plan: 6′-6″ | 15′-0″ | 6′-6″ to beam centrelines, slab 20′-0″ long." />,
    notes: ['Section 2-2: 6′-0″ cantilevers from the beam faces (6′-6″ to the centrelines). The solutions PDF uses 6′-6″ from the face; the scan is followed.'],
  },
  {
    id: 'rc-2002-03-4a',
    paper: '2002-03',
    sec: 'A',
    no: '4(a)',
    marks: 27,
    topics: ['rc-tbeam'],
    title: 'T-beam floor with 8 #8: ultimate design moment → allowable live load (psf)',
    text: String.raw`A floor slab, 5″ thick, supported by simply supported T-beams having span of 30 ft and spaced 12 ft c/c is shown in Fig. 4. The beams are reinforced with 8 – #8 bars as shown in Fig. 4. Compute ultimate design moment for the beam and then determine the allowable live load per square foot of the floor slab. Given: $f'_c = 3.0$ ksi; $f_y = 60$ ksi & $n = 9$. Floor finish = 20 psf & partition wall = 30 psf.`,
    pages: PG.A4,
    flag: FLAG_OLD,
    given: [G('Effective flange width', 'f-beff')],
    figure: () => <TFloorFig hf={5} bw={12} hw={25} cc={12} cover={3.5} webs={3} note="Webs 12″, total depth 30″, 12′-0″ c/c (11′-0″ clear); middle web: 8 #8 in two rows of 4" />,
    notes: ['d not given: 30 − 3.5 = 26.5 in (two rows), dt = 27.5 in. n is not needed for USD.'],
  },
  {
    id: 'rc-2002-03-4b',
    paper: '2002-03',
    sec: 'A',
    no: '4(b)',
    marks: 8,
    topics: ['rc-singly', 'rc-doubly'],
    title: 'Singly vs doubly; over- vs under-reinforced',
    text: "What do you mean by (i) 'singly reinforced' and 'doubly reinforced' beam; (ii) 'over-reinforced' and 'under reinforced' beam?",
    pages: PG.A4b,
    theory: true,
    given: [],
    solution: () => (
      <Md>{String.raw`**(i)** A **singly reinforced** beam has longitudinal steel only on the tension side (any top bars are just stirrup hangers, ignored in strength). A **doubly reinforced** beam also has compression steel $A'_s$ that is counted in the strength — used when the section is limited in size and $M_u$ exceeds the singly-reinforced maximum, for moment reversal, or to reduce long-term deflection. Capacity: $M_n = 0.85f'_cab(d - a/2) + A'_sf'_s(d - d')$.

**(ii)** ` + A_OVER_UNDER}</Md>
    ),
  },
  {
    id: 'rc-2002-03-5a',
    paper: '2002-03',
    sec: 'B',
    no: '5(a)',
    marks: 12,
    topics: ['rc-doubly', 'rc-elastic'],
    title: 'Allowable moment of a doubly reinforced 12×32 section (WSD, 2n)',
    text: String.raw`Calculate the allowable moment capacity of the beam section shown in Fig. 5. Given: $f'_c = 3$ ksi, $f_s = 20$ ksi, $f_y = 40$ ksi, $n = 9$, $d = 28''$.`,
    pages: PG.B5,
    flag: FLAG_WSD,
    given: [G('Cracked / uncracked section formulas', 'f-elastic'), G('WSD allowable stresses', 'f-wsd')],
    figure: () => <RectSecFig b={12} h={32} d={28} n={4} two top={2} label="8 #8 (1″ φ), two rows" topLabel="2 #6 (¾″ φ)" title="Fig. 5" />,
    notes: ["d′ not given: 2.5 in."],
  },
  {
    id: 'rc-2002-03-5b',
    paper: '2002-03',
    sec: 'B',
    no: '5(b)',
    marks: 23,
    topics: ['rc-tbeam', 'rc-shear'],
    title: '16 ft cantilever slab on inverted beams: design the middle beam (flexure + shear)',
    text: String.raw`A 16 ft cantilever slab, 5″ thick is supported by 3 inverted beams as shown in Fig. 6. The slab supports a floor finish (FF) = 20 psf and a live load (LL) = 100 psf. Design the middle beam for both flexure and shear. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $n = 9$. Use either WSD or USD.`,
    pages: PG.B5,
    flag: FLAG_OLD,
    given: [G('Effective flange width', 'f-beff'), G('Case A–D table', 's-cases')],
    figure: () => <Fig6 />,
    notes: ['Beam depth not given: h = 28 in assumed (≥ l/8 = 24 in).'],
  },
  {
    id: 'rc-2002-03-6a',
    paper: '2002-03',
    sec: 'B',
    no: '6(a)',
    marks: 7,
    topics: ['rc-bond'],
    title: 'Why longer ld for bundled bars? Recommended increases',
    text: 'Why does ACI code recommend increased development lengths for bars in a bundled group of reinforcements? Mention the recommended increased lengths for such bars.',
    pages: PG.B6,
    theory: true,
    given: [G('ld simplified + general', 'b-ld')],
    solution: () => (
      <Md>{String.raw`**Why.** In a bundle (2–4 bars tied in contact) part of each bar's perimeter touches the other bars instead of concrete. The bundle behaves like one large bar: there is **less concrete–steel contact surface per bar** to transfer bond, the bond stress on the remaining surface is higher, and the large concentrated force splits the cover more easily. The core between the bars is also poorly filled. So each bar needs a longer embedment.

**ACI increases (tension and compression), applied to the ld of an individual bar:**
- 2-bar bundle: no increase
- **3-bar bundle: +20%** (× 1.20)
- **4-bar bundle: +33%** (× 1.33)

**Related rules**
- For spacing, cover, the simplified-table row, $c_b$, $K_{tr}$ and $\psi_e$, treat the bundle as **one bar** with the diameter of the equivalent total area, $d_{b,eq} = \sqrt{4nA_b/\pi}$.
- Not more than 4 bars per bundle, enclosed by stirrups/ties; bars larger than #11 not bundled in beams.
- Bars within a bundle are cut off at different points, staggered at least **40 $d_b$**.`}</Md>
    ),
  },
  {
    id: 'rc-2002-03-6b-i',
    paper: '2002-03',
    sec: 'B',
    no: '6(b)(i)',
    marks: 14,
    topics: ['rc-elastic'],
    title: "Architect's Beam 'A' (5″ slab, LL 150) — design by WSD",
    text: `${T6}\n\n**(i)** Design the beam 'A' by WSD. Only flexural design is required.`,
    pages: PG.B6,
    flag: FLAG_WSD,
    given: [G('WSD allowable stresses', 'f-wsd')],
    figure: () => <BeamAFig hf={5} />,
    notes: ['Printed marks 28 cover (i) + (ii); split 14 / 14.', 'Brick unit weight not given: 120 pcf. Slab reaction on the wall = 1.25wL (two-span continuous slab).'],
  },
  {
    id: 'rc-2002-03-6b-ii',
    paper: '2002-03',
    sec: 'B',
    no: '6(b)(ii)',
    marks: 14,
    topics: ['rc-singly'],
    title: "Same Beam 'A' — design by USD",
    text: `${T6}\n\n**(ii)** Design the same beam 'A' by USD. Only flexural design is required.`,
    pages: PG.B6,
    flag: FLAG_OLD,
    given: [G('ρ limits (Table A.4)', 'f-rho')],
    figure: () => <BeamAFig hf={5} />,
  },
  {
    id: 'rc-2002-03-7a',
    paper: '2002-03',
    sec: 'B',
    no: '7(a)',
    marks: 16,
    topics: ['rc-bond', 'rc-basics'],
    title: '4-span beam + cantilever: detail drawing from the As list',
    text: String.raw`A 4-span beam with a cantilever on one side is shown in Fig. 8. For a certain loading system the required flexural reinforcement areas calculated from corresponding design moments at different positions are given as following. Make a detail drawing showing all the reinforcements. Make sections also.

- $+A_s$(A-B) = 4.3 in², $-A_s$(B) = 4.8 in², $+A_s$(B-C) = 2.96 in², $-A_s$(C) = 4.4 in², $+A_s$(C-D) = 2.96 in², $-A_s$(D) = 4.40 in²
- $+A_s$(D-E) = 2.3 in², $-A_s$(E) = 5.2 in²
- Beam size 12″ × 30″; columns 24″ × 24″.`,
    pages: PG.B7,
    given: [G('Cut-off rules', 'b-cutoff'), G('Bar areas', 'm-bars')],
    figure: () => <FourSpanFig />,
    notes: ['No −As(A) is listed (2005-06 version: 1.77 in²). f′c, fy not given.'],
  },
  {
    id: 'rc-2002-03-7b',
    paper: '2002-03',
    sec: 'B',
    no: '7(b)',
    marks: 19,
    topics: ['rc-shear'],
    title: '40 ft beam with three 30 k loads + 3 k/ft (factored) — stirrups and sketch',
    text: String.raw`A simply supported beam carries the factored load as shown in the Fig. 9. Design the stirrups and make a neat sketch showing the stirrups. Given $f'_c = 3000$ psi, $f_y = 50000$ psi.`,
    pages: PG.B7b,
    flag: FLAG_OLD,
    given: [G('Vc and limits', 's-vc'), G('Case A–D table', 's-cases')],
    figure: () => <Fig9 />,
    notes: ['Span read as 40 ft centre to centre of the 12″ × 12″ columns; the 10 ft panel dimensions are taken from the column centrelines.'],
  },
  {
    id: 'rc-2002-03-8a',
    paper: '2002-03',
    sec: 'B',
    no: '8(a)',
    marks: 8,
    topics: ['rc-shear'],
    title: 'Redistribution of forces when a diagonal crack forms',
    text: 'Discuss the redistribution of internal forces and stresses produced in a RC beam when the diagonal crack is formed in the beam. Use sketch to explain.',
    pages: PG.B8,
    theory: true,
    given: [],
    solution: () => (
      <div className="space-y-3">
        <DiagCrackFBD />
        <Md>{String.raw`**Before cracking** the shear is carried by the whole uncracked web (parabolic shear stress, max at the neutral axis), and the steel force at any section follows the moment there, $T = M/z$.

**After the diagonal crack forms**, the free body left of the crack must still carry the external shear $V_{ext}$, but the concrete across the crack can carry no tension. The forces redistribute:
1. **Compression zone ($V_{cz}$):** the uncracked concrete above the crack tip now carries a large share of the shear on a smaller area → its shear and compressive stresses **increase** sharply.
2. **Aggregate interlock ($V_{iy}$):** friction across the rough crack faces carries some shear while the crack stays narrow.
3. **Dowel action ($V_d$):** the longitudinal bars are bent across the crack; this pries off the cover and can split the concrete along the bars.
4. **Steel tension increases:** taking moments about the compression resultant at the crack top (point a), $T_b \approx M_a/z$ — the bar force at the bottom of the crack is set by the **larger moment at the crack top**, not by the moment at its own section ("shift" of the tension force).
5. **Stirrups**, if present, are almost unstressed before cracking; after it they pick up $V_s = A_vf_yd/s$, restrain crack widening (keeping interlock), support the bars against dowel splitting and confine the compression zone.

Without web steel, a slight further load causes **failure** by crushing of the reduced compression zone (shear-compression), splitting along the bars (dowel/bond) or diagonal tension — usually sudden.`}</Md>
      </div>
    ),
  },
  {
    id: 'rc-2002-03-8b',
    paper: '2002-03',
    sec: 'B',
    no: '8(b)',
    marks: 12,
    topics: ['rc-oneway'],
    title: 'Temperature & shrinkage reinforcement: importance, ACI limits',
    text: 'What is meant by temperature and shrinkage reinforcement. Discuss their importances mentioning the limitations for minimum amount and spacing of such reinforcements as per ACI code.',
    pages: PG.B8,
    theory: true,
    given: [G('T&S steel', 'sl-ts')],
    solution: () => <Md>{A_TS}</Md>,
  },
  {
    id: 'rc-2002-03-8c',
    paper: '2002-03',
    sec: 'B',
    no: '8(c)',
    marks: 15,
    topics: ['rc-singly'],
    title: 'Design a singly reinforced 36 ft beam (DL 1.5 excl. self-wt, LL 1.0)',
    text: String.raw`Design a singly reinforced beam shown in Fig. 10. The dead load does not include self wt. of the beam. Given $f'_c = 3$ ksi, $f_y = 50$ ksi, $f_s = 20$ ksi, $n = 9$. Use either WSD or USD.`,
    pages: PG.B8,
    flag: FLAG_OLD,
    given: [G('ρ limits (Table A.4)', 'f-rho')],
    figure: () => <SSBeamFig L={36} dl={1.5} ll={1} />,
  },
]

export const R2002: RcQ[] = BASE.map((q) => (SOL[q.id] ? { ...q, ...SOL[q.id] } : q))
