import { describe, expect, it } from 'vitest'
import {
  avMv,
  casagrande,
  casagrandeFit,
  ccFromData,
  ccSkempton,
  combinedU,
  csFromCc,
  csFromData,
  deFromSpacing,
  e0FromWGs,
  eFromTable,
  envelope,
  fieldCurve,
  Fn,
  gammaSatFromGsE,
  genDial,
  kFromCv,
  kRatio,
  labCurve,
  pcTwoLines,
  sandDrain,
  scaleTime,
  secondary,
  settleAt,
  settleDe,
  settleNC,
  settlePrimary,
  settleProfile,
  simpson,
  taylorFit,
  trForUr,
  tvApprox,
  tvFromTable,
  tvFromU,
  TV_TABLE,
  uApprox,
  uFromTable,
  uFromTv,
  urBarron,
  uz,
  type OedPt,
  type SettleIn,
} from './consolidation'
import { stressAt } from './stresses'
import { GW } from './units'

const near = (a: number, b: number, tol: number) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThanOrEqual(tol)
const YR = 365 * 24 * 3600

describe('Tv–U', () => {
  it('exact series reproduces the printed table', () => {
    for (const [U, Tv] of TV_TABLE.slice(1)) near(tvFromU(U / 100), Tv, 0.0015)
    near(uFromTv(0.197), 0.5, 0.001)
  })
  it('approximations and their inverses', () => {
    near(tvApprox(50), 0.19635, 1e-4)
    near(tvApprox(90), 0.8481, 1e-3)
    for (const U of [5, 25, 45, 59, 61, 75, 95]) near(uApprox(tvApprox(U)), U, 1e-6)
  })
  it('table interpolation (handnote 2023-24 Q7(b)): Tv(75) = 0.485, Tv(65) = 0.345', () => {
    near(tvFromTable(75), 0.485, 1e-9)
    near(tvFromTable(65), 0.345, 1e-9)
    near(uFromTable(0.197), 50, 1e-9)
  })
  it('isochrones: Uz = 0 inside at Tv = 0+, layer average equals U(Tv)', () => {
    near(uz(1, 1e-4), 0, 1e-6)
    near(uz(0, 0.3), 1, 1e-9)
    for (const Tv of [0.05, 0.2, 0.6]) {
      let s = 0
      const n = 400
      for (let i = 0; i < n; i++) s += uz((2 * (i + 0.5)) / n, Tv)
      near(s / n, uFromTv(Tv), 2e-3)
    }
  })
})

describe('handnote: settlement magnitude', () => {
  it('2023-24 Q5(c): NC clay under a 2 × 3 m footing, 2:1 with Simpson → ≈ 37 mm (24 mm at mid-depth only)', () => {
    const e0 = e0FromWGs(0.4, 2.7)
    near(e0, 1.08, 1e-9)
    const gs = gammaSatFromGsE(2.7, e0)
    near(gs, 17.83, 0.01)
    const Cc = ccSkempton(45)
    near(Cc, 0.315, 1e-9)
    const inp: SettleIn = {
      layers: [
        { kind: 'sand', H: 8, gamma: 17, gammaSat: 10.5 + GW },
        { kind: 'clay', H: 6, gamma: gs, gammaSat: gs, e0, Cc, Cs: Cc / 6 },
      ],
      wt: 4,
      load: { kind: 'footing', shape: 'rect', B: 2, L: 3, Q: 250, Df: 8, method: '21' },
      avg: 'simpson',
    }
    const r = settleProfile(inp)
    const sub = r.layers[0].subs[0]
    near(sub.p0, 134.1, 0.1)
    near(sub.dpTop, 41.67, 0.01)
    near(sub.dpMid, 8.333, 0.001)
    near(sub.dpBot, 3.472, 0.001)
    near(sub.dp, 13.1, 0.05)
    near(r.S * 1000, 37, 0.6)
    near(settleProfile({ ...inp, avg: 'mid' }).S * 1000, 24, 0.6)
  })
  it('2021-22 Q3(a): two NC clays under a 5 m fill → 0.336 + 0.193 ≈ 0.53 m', () => {
    const e0 = e0FromWGs(0.34, 2.75)
    const g = gammaSatFromGsE(2.75, e0)
    near(g, 18.68, 0.01)
    const clay = { kind: 'clay' as const, H: 3, gamma: g, gammaSat: g, e0, Cc: 0.35, Cs: 0.05 }
    const r = settleProfile({ layers: [{ kind: 'sand', H: 2, gamma: 19, gammaSat: 19 }, clay, { kind: 'sand', H: 2, gamma: 20, gammaSat: 20 }, clay], wt: 0, load: { kind: 'fill', q: 100 } })
    near(r.layers[0].subs[0].p0, 31.7, 0.1)
    near(r.layers[1].subs[0].p0, 78.7, 0.1)
    near(r.layers[0].S, 0.336, 0.002)
    near(r.layers[1].S, 0.193, 0.002)
    near(r.S, 0.53, 0.005)
  })
  it('2020-21 Q3(a): OC clay crossing pc′ → ≈ 0.10 m with Cs = Cc/6 (89 mm with Cc/10)', () => {
    const Cc = ccSkempton(50)
    const base = { layers: [{ kind: 'sand' as const, H: 3, gamma: 16, gammaSat: 16 }, { kind: 'sand' as const, H: 3, gamma: 18.5, gammaSat: 18.5 }, { kind: 'clay' as const, H: 6, gamma: 19, gammaSat: 19, e0: 0.95, Cc, Cs: csFromCc(Cc), pc: 150 }], wt: 3, load: { kind: 'fill' as const, q: 72 } }
    const r = settleProfile(base)
    const s = r.layers[0].subs[0]
    near(s.p0, 101.6, 0.1)
    expect(s.branch).toBe('cross')
    near(r.S, 0.101, 0.002)
    base.layers[2].Cs = csFromCc(Cc, 10)
    near(settleProfile(base).S * 1000, 89, 1)
  })
  it('settlePrimary branches', () => {
    expect(settlePrimary({ Cc: 0.3, Cs: 0.05, H: 2, e0: 1, p0: 50, dp: 20, pc: 100 }).branch).toBe('recomp')
    expect(settlePrimary({ Cc: 0.3, Cs: 0.05, H: 2, e0: 1, p0: 50, dp: 20, pc: null }).branch).toBe('nc')
    const c = settlePrimary({ Cc: 0.3, Cs: 0.05, H: 2, e0: 1, p0: 50, dp: 100, pc: 100, eAtPc: 'ec' })
    expect(c.terms[1].e).toBeLessThan(1)
  })
  it('Jan 2021 Q3(b): OC from the oedometer data, recompression only → ≈ 7.5 mm', () => {
    const D: [number, number, OedPt['stage']][] = [
      [5, 0.755, 'load'], [25, 0.74, 'load'], [50, 0.734, 'load'], [100, 0.717, 'load'], [200, 0.67, 'load'],
      [100, 0.675, 'unload'], [50, 0.68, 'unload'], [25, 0.69, 'unload'],
      [100, 0.678, 'reload'], [200, 0.664, 'reload'], [400, 0.609, 'reload'], [800, 0.539, 'reload'],
    ]
    const pts = D.map(([p, e, stage]) => ({ p, e, stage }))
    expect(envelope(pts).map((q) => q.p)).toEqual([5, 25, 50, 100, 200, 400, 800])
    near(ccFromData(pts).Cc, 0.233, 0.001)
    near(csFromData(pts)!.Cs, 0.022, 0.0005)
    const two = pcTwoLines(pts)
    near(two.Cr, 0.021, 0.001)
    expect(two.pc).toBeGreaterThan(105)
    expect(two.pc).toBeLessThan(135)
    const cg = casagrande(pts)
    expect(cg.m.p).toBe(100)
    expect(cg.pc).toBeGreaterThan(100)
    expect(cg.pc).toBeLessThan(160)
    // profile: sand 0–2 (17 / 19), WT 1.5; clay 2–4 (18); footing D = 2 at 1 m, 500 kN, 2:1
    const p0 = stressAt({ layers: [{ name: 's', H: 2, gamma: 17, gammaSat: 19 }, { name: 'c', H: 2, gamma: 18, gammaSat: 18 }], wt: 1.5 }, 3).eff
    near(p0, 38.3, 0.1)
    const r = settleProfile({ layers: [{ kind: 'sand', H: 2, gamma: 17, gammaSat: 19 }, { kind: 'clay', H: 2, gamma: 18, gammaSat: 18, e0: 0.8, Cc: 0.233, Cs: 0.022, pc: two.pc }], wt: 1.5, load: { kind: 'footing', shape: 'circle', B: 2, L: 2, Q: 500, Df: 1, method: '21' } })
    const s = r.layers[0].subs[0]
    near(s.dp, 39.8, 0.05)
    expect(s.branch).toBe('recomp')
    near(r.S * 1000, 7.5, 0.15)
  })
  it('field curves: NC passes through 0.42e0 on the lab line; OC bends at pc′', () => {
    const lab = { a: 1.2, b: -0.3 }
    const nc = fieldCurve({ e0: 0.9, p0: 100, pc: 100, Cs: 0.05, lab })
    near(nc.eL, 0.378, 1e-9)
    near(lab.a + lab.b * Math.log10(nc.pL), 0.378, 1e-9)
    const oc = fieldCurve({ e0: 0.9, p0: 60, pc: 150, Cs: 0.05, lab })
    expect(oc.kind).toBe('oc')
    expect(oc.pts.length).toBe(3)
  })
  it('lab curve generator has the two slopes', () => {
    const f = labCurve({ pc: 100, ec: 0.8, Cc: 0.3, Cr: 0.03 })
    near((f(10) - f(20)) / Math.log10(2), 0.03, 0.003)
    near((f(1000) - f(2000)) / Math.log10(2), 0.3, 0.003)
  })
})

describe('handnote: e from the lab table (2008-09 / 2011-12 / 2016-17 / 2017-18 circular raft)', () => {
  const ps = [50, 100, 200, 300, 400]
  const raft = (o: { D: number; sand: number; q: number; g1: number; g2: number; gc: number; es: number[] }) => {
    const z = o.sand + 0.8
    const dp = (o.q * o.D * o.D) / (o.D + z) ** 2
    const p0 = 1.5 * o.g1 + (o.sand - 1.5) * (o.g2 - GW) + 0.8 * (o.gc - GW)
    const e0 = eFromTable(ps, o.es, p0)
    const e1 = eFromTable(ps, o.es, p0 + dp)
    return { dp, p0, e0, e1, S: settleDe(e0 - e1, 1.6, e0) }
  }
  it('2017-18 Q6(a): 42 mm; t90 5.84 yr; 35.5 mm at 4.5 yr', () => {
    const r = raft({ D: 6, sand: 5.5, q: 270, g1: 19.2, g2: 20.8, gc: 19.9, es: [0.73, 0.68, 0.625, 0.58, 0.54] })
    near(r.dp, 64.3, 0.06)
    near(r.p0, 80.8, 0.05)
    near(r.e0, 0.695, 0.001)
    near(r.e1, 0.651, 0.001)
    near(r.S * 1000, 42.4, 0.3)
    const t90 = scaleTime(2, 10, 1600) // hours
    near(t90 / (365 * 24), 5.84, 0.01)
    const cv = (0.848 * 0.01 ** 2) / 7200
    near(cv, 1.18e-8, 0.01e-8)
    const Tv = (cv * 4.5 * 365.25 * 24 * 3600) / 1.6 ** 2
    near(Tv, 0.653, 0.002)
    near(uApprox(Tv), 83.8, 0.2)
    near((uApprox(Tv) / 100) * r.S * 1000, 35.5, 0.3)
  })
  it('2016-17 Q2(b): 37 mm; t90 ≈ 5.2 yr; two-way ≈ 1.3 yr', () => {
    const r = raft({ D: 6, sand: 5, q: 200, g1: 19.2, g2: 20.8, gc: 19.9, es: [0.73, 0.68, 0.625, 0.58, 0.54] })
    near(r.dp, 51.7, 0.05)
    near(r.p0, 75.3, 0.05)
    near(r.e0, 0.7, 0.001)
    near(r.e1, 0.661, 0.001)
    near(r.S * 1000, 37, 0.5)
    const t = scaleTime(106, 10, 1600) / (60 * 24 * 365)
    near(t, 5.16, 0.02)
    near(scaleTime(106, 10, 800) / (60 * 24 * 365), 1.29, 0.02)
  })
  it('2011-12 Q5(b): 30.5 mm; 5.4 yr', () => {
    const r = raft({ D: 5, sand: 5, q: 200, g1: 19.2, g2: 20.8, gc: 20, es: [0.73, 0.68, 0.63, 0.58, 0.54] })
    near(r.dp, 42.9, 0.05)
    near(r.p0, 75.4, 0.05)
    near(r.e1, 0.668, 0.001)
    near(r.S * 1000, 30.5, 0.3)
    near(scaleTime(110, 10, 1600) / (60 * 24 * 365), 5.36, 0.02)
  })
  it('2008-09 Q6(b): 38 mm; k ≈ 6.0 × 10⁻¹¹ m/s', () => {
    const r = raft({ D: 6, sand: 5, q: 200, g1: 18.34, g2: 20.4, gc: 19.5, es: [0.73, 0.68, 0.625, 0.58, 0.54] })
    near(r.p0, 72.3, 0.05)
    near(r.e0, 0.703, 0.001)
    near(r.e1, 0.663, 0.001)
    near(r.S * 1000, 38, 0.5)
    const cv = (0.848 * 0.01 ** 2) / (106 * 60)
    const mv = (r.e0 - r.e1) / ((1 + r.e0) * r.dp)
    near(mv, 4.59e-4, 0.03e-4)
    near(kFromCv(cv, mv), 6.0e-11, 0.1e-11)
  })
})

describe('handnote: time rate', () => {
  it('2023-24 Q7(b): U = 29 %; t75 = 1.28 yr (table), t65 two-way = 0.227 yr ≈ 83 days', () => {
    near((90 / 310) * 100, 29.03, 0.01)
    near((tvFromTable(75) * 25) / 9.5, 1.276, 0.002)
    const t = (tvFromTable(65) * 2.5 ** 2) / 9.5
    near(t, 0.227, 0.001)
    near(t * 365, 83, 0.5)
    near((tvApprox(75) * 25) / 9.5, 1.26, 0.01)
  })
  it('2021-22 Q1(b): 100 mm after ≈ 635 days', () => near((100 * tvFromTable(50)) / tvFromTable(20), 635.5, 0.5))
  it('2020-21 Q3(b): tB = 135.4 days', () => near(scaleTime(130, 2, 2.5, 1, 1.5), 135.4, 0.1))
  it('2017-18 Q8(a): kA/kB ≈ 2.48', () => near(kRatio({ eA: [0.65, 0.48], eB: [0.71, 0.59], dp: 225, dA: 3, dB: 4, tA: 1, tB: 3 }).kRatio, 2.48, 0.01))
  it('2011-12 Q6(b): kA/kB ≈ 31', () => near(kRatio({ eA: [0.572, 0.505], eB: [0.612, 0.597], dp: 60, dA: 1.5, dB: 1, tA: 1, tB: 3 }).kRatio, 30.9, 0.1))
  it('2010-11 Q6(c) (read as 50 % in one year): S = 0.57 m, 286 mm at 1 yr, 429 mm at ≈ 2.4 yr', () => {
    const cv = (tvFromTable(50) * 2 ** 2) / 1
    near(cv, 0.788, 1e-6)
    const mv = 0.02 / (cv * GW)
    near(mv, 2.59e-3, 0.01e-3)
    const S = mv * 55 * 4
    near(S, 0.571, 0.003)
    near(S * 500, 286, 2)
    const t = (tvApprox((0.429 / S) * 100) * 4) / cv
    near(t, 2.4, 0.06)
  })
  it('2009-10 / 2007-08: Δe = 0.0475, S ≈ 78 mm, t50 ≈ 400 days (one-way), 100 days (two-way)', () => {
    const de = 0.27 * Math.log10(187.5 / 125)
    near(de, 0.0475, 1e-4)
    near(settleNC(0.27, 5, 2.04, 125, 62.5) * 1000, 78, 0.3)
    const { mv } = avMv(2.04, 2.04 - de, 125, 187.5)
    near(mv, 2.5e-4, 0.01e-4)
    const cv = 3.5e-10 / (mv * GW)
    near(cv, 1.43e-7, 0.01e-7)
    near((0.197 * 25) / cv / 86400, 400, 3)
    near((0.197 * 6.25) / cv / 86400, 100, 1)
  })
  it('2010-11 Q8(c): primary 0.179 ft + secondary 0.061 ft ≈ 0.24 ft', () => {
    const Sp = settleNC(0.28, 8.5, 0.8, 2650, 970)
    near(Sp, 0.179, 0.001)
    const ep = 0.8 - 0.28 * Math.log10(3620 / 2650)
    const s = secondary({ Ca: 0.02, ep, H: 8.5, t1: 1.5, t2: 6.5 })
    near(s.Cap, 0.01135, 1e-5)
    near(s.S, 0.0614, 3e-4)
    near(Sp + s.S, 0.24, 0.002)
  })
  it('2012-13 Q12(b) (US units): 13.9 in; 6 in after ≈ 19 h', () => {
    const S = settleNC(0.3, 120, 0.572, 510, 1548)
    near(S, 13.9, 0.05)
    const t = (tvApprox((6 / S) * 100) * 60 ** 2) / 7.8e-3
    near(t / 3600, 18.8, 0.3)
  })
  it('S² ∝ t below 60 %', () => {
    const r1 = uApprox(0.05) / uApprox(0.2)
    near(r1 * r1, 0.25, 1e-9)
  })
  it('profile settlement-time: two layers with own cv', () => {
    const inp: SettleIn = { layers: [{ kind: 'sand', H: 2, gamma: 18, gammaSat: 20 }, { kind: 'clay', H: 4, gamma: 19, gammaSat: 19, e0: 0.9, Cc: 0.3, Cs: 0.05, cv: 2 }], wt: 2, load: { kind: 'fill', q: 50 }, baseDrains: true }
    const out = settleProfile(inp)
    expect(out.layers[0].d).toBe(2)
    near(settleAt(inp, out, 1e6), out.S, 1e-9)
    near(settleAt(inp, out, (0.197 * 4) / 2), out.S / 2, 1e-3)
  })
})

describe('sand drains (2012-13 Q11(c))', () => {
  it('de, n, Tr, Ur = 51.7 %, U ≈ 64 %', () => {
    near(deFromSpacing(3, 'square'), 3.384, 1e-9)
    near(deFromSpacing(1, 'triangular'), 1.05, 1e-9)
    const Tv = tvApprox(25)
    near(Tv, 0.0491, 1e-4)
    const de = deFromSpacing(3, 'square')
    const n = de / 2 / 0.15
    near(n, 11.28, 0.01)
    near(Fn(n), 1.694, 0.001)
    const Tr = Tv * (6 / de) ** 2
    near(Tr, 0.154, 0.001)
    const Ur = urBarron(Tr, n)
    near(Ur, 0.517, 0.001)
    near(combinedU(0.25, Ur), 0.638, 0.001)
    near(trForUr(Ur, n), Tr, 1e-9)
    const r = sandDrain({ s: 3, pattern: 'square', rw: 0.15, cv: 1, t: Tv * 36, dv: 6, tv: 'approx' })
    near(r.U, 0.638, 0.001)
  })
})

describe('cv fitting on generated dial data', () => {
  it('Taylor and Casagrande recover cv within a few percent', () => {
    const cv = 0.5 // mm²/min
    const d = 10
    const pts = genDial({ cv, d, di: 0.05, dp: 1.2, ds: 0.04 })
    const t = taylorFit(pts, d)
    near(t.d0, 0.05, 0.01)
    near(t.cv / cv, 1, 0.06)
    const c = casagrandeFit(pts, d)
    near(c.cv / cv, 1, 0.1)
    expect(c.d100).toBeGreaterThan(c.d0)
  })
})
