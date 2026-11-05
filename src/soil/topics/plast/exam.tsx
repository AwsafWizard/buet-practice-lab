// Plasticity exam-style problems: cup flow curve, fall cone + one-point, one-point LL + SL from e, shrinkage
// test, two-soil comparison, activity from linear shrinkage.
import { Md, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, rng } from '../../../labs/common'
import { nf } from '../../engine/phase'
import { activityClass, chartZone, coneLL, flowCurve, indices, linearFromLength, linearFromVS, onePointCone, onePointCup, piFromLS, shrinkage, slFromE, srFromE, volShrink, waterContent, wFromMasses } from '../../engine/plasticity'
import { ExamSet, rd, type ExProblem } from '../wv/ExamSet'
import { FlowPlot } from './figs'

type Fam = 'cup' | 'cone' | 'onept' | 'shrink' | 'two' | 'act'
const FAMILIES: { v: Fam; label: string }[] = [
  { v: 'cup', label: 'Cup flow curve' },
  { v: 'cone', label: 'Fall cone' },
  { v: 'onept', label: 'One-point + SL' },
  { v: 'shrink', label: 'Shrinkage test' },
  { v: 'two', label: 'Compare two soils' },
  { v: 'act', label: 'Activity' },
]

interface PP extends ExProblem<Fam> {
  plot?: { mode: 'cup' | 'cone'; pts: { x: number; w: number }[]; a: number; b: number; LL: number }
  sol: string
}

const ZONE_OPTS = ['CL', 'CL-ML', 'ML', 'CH', 'MH'].map((v) => ({ v, label: v }))
const STATE_OPTS = ['semi-solid', 'plastic', 'liquid'].map((v) => ({ v, label: v }))
const AB = [
  { v: 'A', label: 'Soil A' },
  { v: 'B', label: 'Soil B' },
]

export function makePlastExam(seed: number, family?: Fam): PP {
  const r = rng(seed * 7919 + 13)
  const fam = family ?? pick(r, FAMILIES.map((f) => f.v))
  if (fam === 'cup') {
    const LL0 = 40 + 25 * r()
    const If0 = 10 + 14 * r()
    const Ns = pick(r, [
      [11, 17, 23, 30, 38],
      [15, 19, 24, 30, 35],
      [13, 18, 26, 34],
    ])
    const rows = Ns.map((N) => {
      const w = LL0 - If0 * Math.log10(N / 25) + (r() - 0.5)
      const tare = rd(6.5 + 4.5 * r(), 2)
      const dry = rd(tare + 12 + 6 * r(), 2)
      const wet = rd(dry + ((dry - tare) * w) / 100, 2)
      return { N, tare, wet, dry }
    })
    const ws = rows.map((x) => waterContent(x).w)
    const f = flowCurve(rows.map((x, i) => ({ N: x.N, w: ws[i] })))
    const PL = Math.round(f.LL * (0.38 + 0.2 * r()))
    const k = indices({ LL: f.LL, PL })
    const z = chartZone(f.LL, k.PI)
    return {
      family: fam,
      title: '2023-24 Q4(b) / 2020-21 Q5(b) type · 18–20 marks',
      text: 'Data from a liquid limit test (Casagrande cup) on an inorganic soil:',
      table: { head: ['Trial', ...rows.map((_, i) => i + 1)], rows: [['No. of blows', ...rows.map((x) => x.N)], ['Container (g)', ...rows.map((x) => x.tare)], ['Container + wet soil (g)', ...rows.map((x) => x.wet)], ['Container + dry soil (g)', ...rows.map((x) => x.dry)]] },
      after: `Plot the flow curve and determine the liquid limit and the flow index. The plastic limit is **${PL} %**. Using the plasticity chart, determine the type of the soil.`,
      hash: hashKey(JSON.stringify(rows) + PL),
      plot: { mode: 'cup', pts: rows.map((x, i) => ({ x: x.N, w: ws[i] })), a: f.a, b: f.b, LL: f.LL },
      sol: `Water contents: ${ws.map((w) => nf(w, 4)).join(', ')} %.\n\nLeast-squares line on log N: $w = ${nf(f.a, 4)} - ${nf(f.If, 4)}\\log N$ → **LL = w(25) = ${nf(f.LL, 4)} %**, flow index **$I_F$ = ${nf(f.If, 4)}** (drop per log cycle). A hand-drawn best line gives about the same (± 1 %).\n\nPI = ${nf(f.LL, 4)} − ${PL} = **${nf(k.PI, 4)}** (${k.burmister}). A-line PI = 0.73(${nf(f.LL, 3)} − 20) = ${nf(z.aPI, 3)} → ${z.aboveA ? 'above' : 'below'}, LL ${f.LL >= 50 ? '≥' : '<'} 50 → **${z.zone}**.`,
      steps: [
        { key: 'w1', group: 'Water contents', label: `w at ${rows[0].N} blows`, value: ws[0], unit: '%' },
        { key: 'wl', group: 'Water contents', label: `w at ${rows[rows.length - 1].N} blows`, value: ws[ws.length - 1], unit: '%' },
        { key: 'LL', group: 'Flow curve', label: 'LL', value: f.LL, unit: '%', tol: 0.015 },
        { key: 'If', group: 'Flow curve', label: 'flow index', value: f.If, tol: 0.06 },
        { key: 'PI', group: 'Type', label: 'PI', value: k.PI, unit: '%', tol: 0.04 },
        { key: 'z', group: 'Type', label: 'plasticity chart', options: ZONE_OPTS, answer: z.zone },
      ],
    }
  }
  if (fam === 'cone') {
    const LL0 = 40 + 20 * r()
    const slope = 1.2 + 2.2 * r()
    const masses = r() < 0.5
    const ds = pick(r, [
      [16, 18, 22, 25],
      [16.1, 17.8, 19.3, 21.6, 22.6],
      [15, 18, 21, 24, 27],
    ])
    const rows = ds.map((d) => {
      const w = LL0 + slope * (d - 20) + (r() - 0.5) * 0.6
      const dry = rd(110 + 40 * r(), 1)
      return { d, w: masses ? NaN : rd(w, 1), wet: rd(dry * (1 + w / 100), 1), dry }
    })
    const ws = rows.map((x) => (masses ? wFromMasses(x.wet, x.dry) : x.w))
    const f = coneLL(rows.map((x, i) => ({ d: x.d, w: ws[i] })))
    const i0 = ds.reduce((b, d, i) => (Math.abs(d - 20) < Math.abs(ds[b] - 20) ? i : b), 0)
    const one = onePointCone(ws[i0], ds[i0])
    const PL = Math.round(f.LL * (0.45 + 0.15 * r()))
    const wn = rd(PL + (f.LL - PL) * (0.1 + 0.8 * r()), 0)
    const k = indices({ LL: f.LL, PL, w: wn })
    return {
      family: fam,
      title: masses ? '2021-22 Q5(b) type · 17 marks' : 'Jan 2021 Q6(a) / 2017-18 Q1(a) type',
      text: 'A cone penetration test (BS, 80 g cone) on a silty clay gave:',
      table: { head: ['Trial', ...rows.map((_, i) => i + 1)], rows: masses ? [['Penetration (mm)', ...ds], ['Weight of wet soil (g)', ...rows.map((x) => x.wet)], ['Weight of oven-dry soil (g)', ...rows.map((x) => x.dry)]] : [['Penetration (mm)', ...ds], ['Water content (%)', ...rows.map((x) => x.w)]] },
      after: `Determine the liquid limit and check it by the single-point method using the relevant reading. If PL = **${PL} %** and the natural water content is **${wn} %**, find the liquidity index and the state.`,
      hash: hashKey(JSON.stringify(rows) + PL + wn),
      plot: { mode: 'cone', pts: ds.map((d, i) => ({ x: d, w: ws[i] })), a: f.a, b: f.b, LL: f.LL },
      sol: `${masses ? `Water contents: ${ws.map((w) => nf(w, 4)).join(', ')} %.\n\n` : ''}Best straight line of w on penetration: $w = ${nf(f.a, 4)} + ${nf(f.b, 4)}d$ → **LL = w(20 mm) = ${nf(f.LL, 4)} %** (interpolating between the readings either side of 20 mm: ${nf(f.interp, 4)} %).\n\nOne-point check (reading at ${ds[i0]} mm, w = ${nf(ws[i0], 4)} %): $w_L = w_y/(0.77\\log y) = ${nf(one, 4)}\\%$ — IS 2720-5 form; the slides show only the cone plot.\n\nPI = ${nf(k.PI, 4)}, LI = (${wn} − ${PL})/${nf(k.PI, 4)} = **${nf(k.LI, 3)}** → ${k.state}.`,
      steps: [
        ...(masses ? [{ key: 'w1', group: 'Water contents', label: `w at ${ds[0]} mm`, value: ws[0], unit: '%' }] : []),
        { key: 'LL', group: 'Liquid limit', label: 'LL at 20 mm', value: f.LL, unit: '%', tol: 0.02 },
        { key: 'one', group: 'Liquid limit', label: `one-point LL from ${ds[i0]} mm`, value: one, unit: '%' },
        { key: 'LI', group: 'Consistency', label: 'LI', value: k.LI, tol: 0.05, abs: 0.02 },
        { key: 'st', group: 'Consistency', label: 'state', options: STATE_OPTS, answer: k.state === 'solid' ? 'semi-solid' : k.state },
      ],
    }
  }
  if (fam === 'onept') {
    const N = pick(r, [22, 23, 27, 28, 30])
    const wN = rd(38 + 15 * r(), 0)
    const LL = onePointCup(wN, N)
    const PL = rd(16 + 8 * r(), 1)
    const wn = rd(PL + (LL - PL) * (0.3 + 0.7 * r()), 0)
    const e = rd(0.35 + 0.2 * r(), 2)
    const G = pick(r, [2.65, 2.68, 2.7, 2.72])
    const k = indices({ LL, PL, w: wn })
    const SL = slFromE(e, G)
    const SR = srFromE(e, G)
    const VS = volShrink(LL, SL, SR)
    const LS = linearFromVS(VS)
    return {
      family: fam,
      title: '2010-11 Q1(a) type · 23⅓ marks',
      text: `In a liquid limit test by the one-point method, a soil showed a water content of **${wN} %** at **${N} blows**. The plastic limit is **${PL} %** and the natural moisture content **${wn} %**. What is the state of consistency? What is the shrinkage limit if the void ratio at the shrinkage limit is **${e}** (Sr = wG/e, G = **${G}**)? Also calculate the linear shrinkage (from the LL).`,
      hash: hashKey(`${wN}|${N}|${PL}|${wn}|${e}|${G}`),
      sol: `$LL = w_N(N/25)^{0.121} = ${wN}(${N}/25)^{0.121} = ${nf(LL, 4)}\\%$ (one-point formula, not on the slides).\n\nPI = ${nf(k.PI, 4)}, LI = **${nf(k.LI, 3)}**, CI = ${nf(k.CI, 3)} → **${k.state}** (${k.ciDesc}).\n\nAt the SL the soil is saturated: $SL = e/G = ${e}/${G} = ${nf(SL, 4)}\\%$. Shrinkage ratio $SR = G/(1+e) = ${nf(SR, 4)}$; volumetric shrinkage from the LL $VS = (LL - SL)SR = ${nf(VS, 4)}\\%$; linear shrinkage $LS = [1 - (100/(VS+100))^{1/3}]\\times100 = ${nf(LS, 4)}\\%$ (≈ PI/2.13 = ${nf(k.PI / 2.13, 3)} % as a check).`,
      steps: [
        { key: 'LL', group: 'Consistency', label: 'LL', value: LL, unit: '%' },
        { key: 'LI', group: 'Consistency', label: 'LI', value: k.LI, abs: 0.01 },
        { key: 'st', group: 'Consistency', label: 'state', options: STATE_OPTS, answer: k.state === 'solid' ? 'semi-solid' : k.state },
        { key: 'SL', group: 'Shrinkage', label: 'SL', value: SL, unit: '%' },
        { key: 'LS', group: 'Shrinkage', label: 'linear shrinkage', value: LS, unit: '%', tol: 0.03 },
      ],
    }
  }
  if (fam === 'shrink') {
    const m2 = rd(9 + 4 * r(), 1)
    const G = 2.62 + 0.12 * r()
    const SL0 = 9 + 10 * r()
    const V2 = rd(m2 * (SL0 / 100 + 1 / G), 2)
    const w1 = 40 + 20 * r()
    const m1 = rd(m2 * (1 + w1 / 100), 1)
    const V1 = rd(V2 + ((w1 - SL0) / 100) * m2, 2)
    const s = shrinkage({ m1, V1, m2, V2 })
    return {
      family: fam,
      title: '2011-12 Q4(a) type · 25 marks',
      text: `In a shrinkage limit test: volume of the saturated soil pat **${V1} ml**, its mass **${m1} g**; volume after oven drying **${V2} ml**, dry mass **${m2} g**. Compute the shrinkage limit and the specific gravity of the solids.`,
      hash: hashKey(`${m1}|${V1}|${m2}|${V2}`),
      sol: `$w_1 = (${m1} - ${m2})/${m2} = ${nf(s.w1, 4)}\\%$.\n\n$SL = \\dfrac{(m_1 - m_2) - (V_1 - V_2)\\rho_w}{m_2} = \\dfrac{${rd(m1 - m2, 2)} - ${rd(V1 - V2, 2)}}{${m2}} = ${nf(s.SL, 4)}\\%$ — water lost while the volume was still shrinking is $(V_1 - V_2)\\rho_w$; what remains at the SL fills the dry voids.\n\nAt the SL the pat is saturated at volume $V_2$: $V_2\\rho_w/m_2 = SL + 1/G_s$ → $G_s = 1/(${nf(V2 / m2, 4)} - ${nf(s.SL / 100, 4)}) = ${nf(s.Gs, 4)}$. Shrinkage ratio $SR = m_2/(V_2\\rho_w) = ${nf(s.SR, 4)}$.`,
      steps: [
        { key: 'w1', group: 'Shrinkage test', label: 'initial w', value: s.w1, unit: '%' },
        { key: 'SL', group: 'Shrinkage test', label: 'SL', value: s.SL, unit: '%' },
        { key: 'Gs', group: 'Shrinkage test', label: 'Gs', value: s.Gs, digits: 3, tol: 0.01 },
      ],
    }
  }
  if (fam === 'two') {
    const A = { LL: rd(28 + 10 * r(), 0), PL: rd(15 + 6 * r(), 0), If: rd(9 + 5 * r(), 0), w: 0 }
    const B = { LL: rd(48 + 12 * r(), 0), PL: rd(18 + 6 * r(), 0), If: rd(5 + 3 * r(), 0), w: 0 }
    A.w = rd(A.LL + 2 * r() - 1, 0)
    B.w = rd(B.PL + (B.LL - B.PL) * (0.3 + 0.4 * r()), 0)
    const swap = r() < 0.5
    const [S1, S2] = swap ? [B, A] : [A, B]
    const k1 = indices({ ...S1, If: S1.If })
    const k2 = indices({ ...S2, If: S2.If })
    const more = k1.PI > k2.PI ? 'A' : 'B'
    const found = k1.CI > k2.CI ? 'A' : 'B'
    const flat = S1.If < S2.If ? 'A' : 'B'
    const tough = k1.It > k2.It ? 'A' : 'B'
    return {
      family: fam,
      title: '2012-13 Q2 / 2016-17 Q5 type · 23⅓ marks',
      text: 'Consistency tests on two fine-grained soils:',
      table: { head: ['', 'Soil A', 'Soil B'], rows: [['Liquid limit (%)', S1.LL, S2.LL], ['Plastic limit (%)', S1.PL, S2.PL], ['Flow index', S1.If, S2.If], ['Natural water content (%)', S1.w, S2.w]] },
      after: `Which soil is (i) more plastic, (ii) a better foundation material on remoulding, (iii) of better strength as a function of water content, (iv) of better shear strength at the plastic limit?`,
      hash: hashKey(JSON.stringify([S1, S2])),
      sol: `- PI = LL − PL: A ${nf(k1.PI, 3)}, B ${nf(k2.PI, 3)} → (i) **${more}** is more plastic.\n- Consistency index CI = (LL − w)/PI: A ${nf(k1.CI, 3)}, B ${nf(k2.CI, 3)} → (ii) **${found}** (higher CI = stiffer; CI < 0 means w > LL, liquid on remoulding).\n- Flow index: A ${S1.If}, B ${S2.If} → (iii) **${flat}** (flatter flow curve: strength changes less with w).\n- Toughness index $I_T = PI/I_F$: A ${nf(k1.It, 3)}, B ${nf(k2.It, 3)} → (iv) **${tough}** (higher shear strength at the PL).`,
      steps: [
        { key: 'PIa', group: 'Indices', label: 'PI of A', value: k1.PI },
        { key: 'CIa', group: 'Indices', label: 'CI of A', value: k1.CI, abs: 0.02 },
        { key: 'CIb', group: 'Indices', label: 'CI of B', value: k2.CI, abs: 0.02 },
        { key: 'ITb', group: 'Indices', label: 'toughness index of B', value: k2.It, abs: 0.02 },
        { key: 'i', group: 'Which soil', label: '(i) more plastic', options: AB, answer: more },
        { key: 'ii', group: 'Which soil', label: '(ii) better on remoulding', options: AB, answer: found },
        { key: 'iii', group: 'Which soil', label: '(iii) strength vs w', options: AB, answer: flat },
        { key: 'iv', group: 'Which soil', label: '(iv) strength at PL', options: AB, answer: tough },
      ],
    }
  }
  // activity from linear shrinkage (2016-17 Q11)
  const LL = rd(32 + 12 * r(), 0)
  const Ld = rd(126 + 8 * r(), 0)
  const clay = rd(15 + 25 * r(), 1)
  const LS = linearFromLength(Ld)
  const PI = piFromLS(LS)
  const PL = LL - PI
  const wn = rd(PL + PI * (0.2 + 0.6 * r()), 0)
  const k = indices({ LL, PL, w: wn, clay })
  return {
    family: 'act',
    title: '2016-17 Q11(a)–(b) type · 14 marks',
    text: `Tests on a fine soil: LL = **${LL} %**; clay content (finer than 2 µm) = **${clay} %**; dry length of the linear-shrinkage bar = **${Ld} mm** (standard 140 mm mould); natural moisture content = **${wn} %**. (a) Calculate the activity. (b) Calculate the liquidity index and comment on the consistency.`,
    hash: hashKey(`${LL}|${Ld}|${clay}|${wn}`),
    sol: `No PL is given, so PI comes from the linear shrinkage (not on the slides): $LS = (1 - ${Ld}/140)\\times100 = ${nf(LS, 4)}\\%$, $PI \\approx 2.13\\,LS = ${nf(PI, 4)}$, so PL ≈ ${nf(PL, 4)} %.\n\n(a) Activity $A = PI/\\%\\text{clay} = ${nf(PI, 4)}/${clay} = ${nf(k.A, 3)}$ → **${activityClass(k.A)}** (Skempton: < 0.75 inactive, 0.75–1.25 normal, > 1.25 active).\n\n(b) LI = (${wn} − ${nf(PL, 4)})/${nf(PI, 4)} = **${nf(k.LI, 3)}** → ${k.state}.`,
    steps: [
      { key: 'LS', group: 'Linear shrinkage', label: 'LS', value: LS, unit: '%' },
      { key: 'PI', group: 'Linear shrinkage', label: 'PI ≈ 2.13 LS', value: PI },
      { key: 'A', group: 'Answers', label: 'activity', value: k.A, abs: 0.01 },
      { key: 'LI', group: 'Answers', label: 'LI', value: k.LI, abs: 0.02 },
    ],
  }
}

function Solution({ p }: { p: PP }) {
  return (
    <div className="space-y-2 text-sm">
      {p.plot && <FlowPlot mode={p.plot.mode} pts={p.plot.pts} a={p.plot.a} b={p.plot.b} LL={p.plot.LL} w={460} />}
      <Md>{p.sol}</Md>
    </div>
  )
}

export function PlastExams() {
  return <ExamSet topic="sm-plast" families={FAMILIES} make={makePlastExam} solution={(p) => <Solution p={p} />} foot="LL from your best line: answers within 1.5–2 % are accepted." />
}
void Tex
