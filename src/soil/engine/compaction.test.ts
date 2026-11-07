import { describe, expect, it } from 'vitest'
import { borrowPlan, checkSpec, coreCutter, eAfterSettlement, embankmentArea, energy, fieldTest, fillFromBorrow, gammaD, gdFromE, MODIFIED, proctorCurve, proctorPeak, rcFromDr, sandCone, satOf, shiftForEnergy, STANDARD, voidRatio, waterToSaturate, zav } from './compaction'

const near = (a: number, b: number, rel = 0.005, abs = 1e-3) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))
const pts = (w: number[], g: number[]) => w.map((x, k) => ({ w: x / 100, gd: g[k] }))

const STD1718 = pts([9.3, 11.8, 14.3, 17.6, 20.8, 23.0], [1.691, 1.715, 1.755, 1.747, 1.685, 1.619])
const MOD1718 = pts([9.3, 12.8, 15.5, 18.7, 21.1], [1.873, 1.91, 1.803, 1.699, 1.641])

describe('Proctor energy', () => {
  it('Standard 12,375 ft-lb/ft³ ≈ 592.5 kJ/m³; Modified 56,250 ≈ 2693 kJ/m³ (≈ 4.55×)', () => {
    near(energy(STANDARD).ftlb, 12375, 0.002)
    near(energy(STANDARD).kJ, 592.5, 0.005)
    near(energy(MODIFIED).ftlb, 56250, 0.002)
    near(energy(MODIFIED).kJ, 2693, 0.005)
    near(energy(MODIFIED).kJ / energy(STANDARD).kJ, 4.55, 0.01)
  })
})

describe('2017-18 Q5(a): curves, ZAV, field tests', () => {
  it('ZAV ρ = 2.64/(1 + 2.64w): 2.120, 1.973, 1.873, 1.767, 1.696, 1.643 t/m³', () => {
    const w = [9.3, 12.8, 15.5, 18.7, 21.1, 23.0]
    const r = [2.12, 1.973, 1.873, 1.767, 1.696, 1.643]
    w.forEach((x, k) => near(zav(x / 100, 2.64, 1), r[k], 0.001))
  })
  it('Standard MDD ≈ 1.76 at OMC ≈ 15.5 %; Modified ≈ 1.92 at ≈ 11.7 %', () => {
    const s = proctorPeak(STD1718)
    near(s.mdd, 1.76, 0.003)
    near(s.omc * 100, 15.5, 0.03)
    const m = proctorPeak(MOD1718)
    near(m.mdd, 1.92, 0.004)
    near(m.omc * 100, 11.7, 0.03)
    expect(s.bracketed && m.bracketed).toBe(true)
  })
  it('field tests: ρd 1.800 / 1.920 / 1.750, w 6.99 / 10.68 / 17.01 %; only test 2 passes', () => {
    const tests = [
      { V: 946, Wwet: 1822, Wdry: 1703 },
      { V: 980, Wwet: 2083, Wdry: 1882 },
      { V: 957, Wwet: 1960, Wdry: 1675 },
    ].map(fieldTest)
    ;[1.8, 1.92, 1.75].forEach((v, k) => near(tests[k].gd, v, 0.001))
    ;[1.926, 2.126, 2.048].forEach((v, k) => near(tests[k].gb, v, 0.001))
    ;[6.99, 10.68, 17.01].forEach((v, k) => near(tests[k].w * 100, v, 0.002))
    const spec = { mdd: 1.92, omc: 0.117, rcMin: 0.95, dw: 0.02 }
    const res = tests.map((t) => checkSpec(t.gd, t.w, spec))
    expect(res.map((r) => r.pass)).toEqual([false, true, false])
    expect(res[0].okW).toBe(false)
    expect(res[2].why.some((x) => x.startsWith('too wet'))).toBe(true)
    near(res[0].gdReq, 1.824, 0.001)
  })
  it('the plotted curve peaks exactly at (OMC, MDD) and never goes above it', () => {
    const c = proctorCurve(STD1718)
    const pk = proctorPeak(STD1718)
    near(Math.max(...c.map((p) => p.gd)), pk.mdd, 1e-9)
  })
  it('line of optimums: Standard peak shifted to Modified energy lands near the measured Modified peak', () => {
    const s = proctorPeak(STD1718)
    const m = shiftForEnergy(s, 2.64, 4.55, 1)
    near(m.mdd, 1.92, 0.01)
    near(m.omc * 100, 11.7, 0.05)
    near(satOf(s.omc, s.mdd, 2.64, 1), 0.82, 0.03)
  })
})

describe('field checks', () => {
  it('2020-21 Q1(b): γd = 107.6 pcf, RC = 91.2 % → acceptable', () => {
    const gd = gammaD(121, 0.125)
    near(gd, 107.6, 0.001)
    const c = checkSpec(gd, 0.125, { mdd: 118, omc: 0.14, rcMin: 0.9 })
    near(c.rc * 100, 91.2, 0.001)
    expect(c.pass).toBe(true)
  })
  it('Jan 2021 Q2(b): V 429.8 cm³, γb 18.63, w 13.50 %, γd 16.41; MDD ≈ 17.19 at ≈ 12.0 %; RC 95.5 % → satisfied', () => {
    const c = coreCutter({ D: 6, L: 15.2, W: 816, wWet: 102.96, wDry: 90.71 })
    near(c.V, 429.8, 0.001)
    near(c.rhoB * 9.81, 18.63, 0.001)
    near(c.w * 100, 13.5, 0.001)
    const gd = c.rhoD * 9.81
    near(gd, 16.41, 0.001)
    const pk = proctorPeak(pts([5.9, 9.6, 11.5, 14.2, 15.2, 17.4], [16.54, 17.03, 17.18, 17.06, 16.88, 16.52]))
    near(pk.mdd, 17.19, 0.001)
    near(pk.omc * 100, 12.0, 0.02)
    const s = checkSpec(gd, c.w, { mdd: pk.mdd, omc: pk.omc, rcMin: 0.95 })
    expect(s.pass).toBe(true)
    near(s.rc * 100, 95.5, 0.002)
  })
  it('2015-16 Q9(a)(iii): ρb 2.127, w 15.35 %, ρd 1.844 g/cm³; needs MDD ≤ 1.941', () => {
    const f = fieldTest({ V: 450, Wwet: 957, gb: undefined, w: (26.3 - 22.8) / 22.8 })
    const t = { gb: 957 / 450, w: (26.3 - 22.8) / 22.8 }
    near(t.gb, 2.127, 0.001)
    near(t.w * 100, 15.35, 0.001)
    near(fieldTest(t).gd, 1.844, 0.001)
    near(fieldTest(t).gd / 0.95, 1.941, 0.001)
    expect(Number.isNaN(f.gd)).toBe(true)
  })
  it('2015-16 Q9(a)(ii): ZAV for Gs = 2.74 at 10, 14, 18, 22 % → 2.15, 1.98, 1.84, 1.71 (the handnote prints 1.93, 1.77, 1.64, 1.53, which do not satisfy ρ = Gs/(1 + wGs))', () => {
    ;[
      [0.1, 2.151],
      [0.14, 1.98],
      [0.18, 1.835],
      [0.22, 1.71],
    ].forEach(([w, r]) => near(zav(w, 2.74, 1), r, 0.001))
  })
  it('Das Ex 4.3 sand cone: γd ≈ 18.55 kN/m³, RC ≈ 98 %', () => {
    const s = sandCone({ rhoSand: 1570, Wcone: 0.545, W3: 7.59, W5: 4.78, Wwet: 3.007, w: 0.102 })
    near(s.W6, 2.265, 0.001)
    near(s.rhoD * 9.81 / 1000, 18.56, 0.002)
    const pk = proctorPeak(pts([6, 8, 9, 11, 12, 14], [14.8, 17.45, 18.52, 18.9, 18.5, 16.9]))
    near((s.rhoD * 9.81) / 1000 / pk.mdd, 0.98, 0.01)
  })
  it('Das 4.9: Dr = 64 % with γd 15.25 / 18.31 → RC = 93.3 %', () => near(rcFromDr(0.64, 15.25, 18.31) * 100, 93.27, 0.001))
})

describe('earthwork (solids conserved)', () => {
  it('2023-24 Q7(c): γd,borrow 13.98, Ws 16,150 kN, V ≈ 1155 m³', () => {
    const p = borrowPlan({ Vfill: 1000, fill: { rc: 0.95, mdd: 17, w: 0.15 }, bank: { gb: 16.5, w: 0.18 } })
    near(p.gdBank, 13.98, 0.001)
    near(p.Ws, 16150, 0.0001)
    near(p.Vbank, 1155, 0.001)
    expect(p.water).toBeLessThan(0)
  })
  it('2021-22 Q3(c): borrow γd 13.58, 27,387 m³, Tk 13.69 million', () => {
    const p = borrowPlan({ Vfill: 20000, fill: { gd: 18.6 }, bank: { e: 0.95, Gs: 2.7 } })
    near(p.gdBank, 13.58, 0.001)
    near(p.Vbank, 27387, 0.001)
    near(p.Vbank * 500, 13.69e6, 0.001)
  })
  it('2016-17 Q1(b): Ws 1596.5 kN, loose 147.2 m³ → 25 truck loads, pit 103.9 m³', () => {
    const p = borrowPlan({ Vfill: 100, fill: { gb: 18.2, w: 0.14 }, bank: { gb: 16.6, w: 0.08 }, loose: { gb: 11.5, w: 0.06 }, truck: 6 })
    near(p.Ws, 1596.5, 0.001)
    near(p.Vloose, 147.2, 0.001)
    expect(p.trucks).toBe(25)
    near(p.Vbank, 103.9, 0.001)
  })
  it('2015-16 Q9(b): 24 m²/m, 21.6 m³/m; e 0.572 / 0.746, S 37.4 / 35.8 %; e after settlement 0.676', () => {
    const a = embankmentArea(2, 4, 1)
    expect(a.bottom).toBe(10)
    near(a.area, 24, 1e-9)
    const p = borrowPlan({ Vfill: a.area, fill: { gd: 15, w: 0.1 }, bank: { gb: 18, w: 0.08 } })
    near(p.Vbank, 21.6, 0.001)
    const eB = voidRatio(18 / 1.08, 2.67)
    near(eB, 0.572, 0.002)
    near((0.08 * 2.67) / eB * 100, 37.4, 0.003)
    const eF = voidRatio(15, 2.67)
    near(eF, 0.746, 0.002)
    near((0.1 * 2.67) / eF * 100, 35.8, 0.003)
    near(eAfterSettlement(eF, 0.12, 3), 0.676, 0.002)
  })
  it('2012-13 Q9(b) / 2008-09 Q5(c): 1.31 t of water per 10 m³; 1.13 m³ per m³', () => {
    const gdB = 1.8 / 1.1
    near((0.18 - 0.1) * gdB * 10, 1.31, 0.003)
    const p = borrowPlan({ Vfill: 1, fill: { gd: 1.85, w: 0.18 }, bank: { gb: 1.8, w: 0.1 }, gw: 1 })
    near(p.Vbank, 1.13, 0.002)
  })
  it('2010-11 Q5(c): A 11,135 m³ (Tk 222,700), B 10,517 m³ (Tk 231,360); 15.0 t to saturate 100 m³ of A', () => {
    const fill = { gb: 2, w: 0.22 }
    const A = borrowPlan({ Vfill: 10000, fill, bank: { e: 0.8, Gs: 2.65, w: 0.2 }, gw: 1 })
    const B = borrowPlan({ Vfill: 10000, fill, bank: { e: 0.7, Gs: 2.65, w: 0.15 }, gw: 1 })
    near(A.Vbank, 11135, 0.0005)
    near(B.Vbank, 10517, 0.0005)
    near((A.Vbank / 100) * 2000, 222700, 0.0005)
    near((B.Vbank / 100) * 2200, 231360, 0.0005)
    near(waterToSaturate({ V: 100, e: 0.8, Gs: 2.65, w: 0.2, gw: 1 }).water, 15.0, 0.005)
  })
  it('2009-10 Q5(d) Purbachal: A Tk 497.2 M vs B Tk 532.7 M (water per 10 m³ truck)', () => {
    const fill = { gb: 2, w: 0.21 }
    const cost = (e: number, w: number, perTruck: number) => {
      const p = borrowPlan({ Vfill: 4e6, fill, bank: { e, Gs: 2.65, w }, bulking: 0.1, truck: 10, gw: 1 })
      return { p, total: p.trucks * perTruck + p.waterTrucks * 300 }
    }
    const A = cost(0.79, 0.18, 1000)
    const B = cost(0.65, 0.15, 1150)
    near(A.p.Ws, 6.612e6, 0.001)
    // 491,252.1 → 491,253 loads (the handnote rounds to 491,252)
    expect(Math.abs(A.p.trucks - 491252)).toBeLessThanOrEqual(1)
    expect(Math.abs(B.p.trucks - 452830)).toBeLessThanOrEqual(1)
    near(A.p.water, 198347, 0.0005)
    near(A.total / 1e6, 497.2, 0.001)
    near(B.total / 1e6, 532.7, 0.001)
  })
  it('2007-08 Q5(b): 255,000 m³ of fill, 405,000 t of dry soil', () => {
    near(fillFromBorrow(330000, 1.2, 0.7), 255000, 1e-9)
    near((330000 / 2.2) * 2.7, 405000, 1e-9)
    near(gdFromE(1.2, 2.7, 1) * 330000, 405000, 1e-9)
  })
})

import { rubberBalloon } from './compaction'
describe('rubber balloon', () => {
  it('hole volume from the volumeter readings', () => {
    const r = rubberBalloon({ R1: 85, R2: 1318, Wwet: 2390, w: 0.124 })
    expect(r.V).toBe(1233)
    expect(r.rhoB).toBeCloseTo(2390 / 1233, 12)
    expect(r.rhoD).toBeCloseTo(2390 / 1233 / 1.124, 12)
    expect(rubberBalloon({ R1: 0, R2: 1000, Wwet: 2000, Wdry: 1800 }).w).toBeCloseTo(200 / 1800, 12)
  })
})
