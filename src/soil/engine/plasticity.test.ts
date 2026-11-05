import { describe, expect, it } from 'vitest'
import { aLine, burmister, casagrandeZone, chartZone, coneLL, consistencyState, dryingChange, flowCurve, flowIndex2, indices, linearFromLength, linearFromVS, onePointCone, onePointCup, piFromLS, shrinkage, slFromE, slFromGs, srFromE, uLine, volShrink, waterContent, wFromMasses } from './plasticity'

const near = (a: number, b: number, rel = 0.003, abs = 0.01) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('slide 12: LL by cup, 5 specimens → LL = 57 %', () => {
  const rows = [
    { N: 15, tare: 10.4, wet: 44.12, dry: 31.48 },
    { N: 19, tare: 11.29, wet: 46.91, dry: 33.74 },
    { N: 24, tare: 6.93, wet: 48.37, dry: 33.17 },
    { N: 29, tare: 9.49, wet: 46.61, dry: 33.19 },
    { N: 33, tare: 7.22, wet: 46.74, dry: 32.63 },
  ]
  const ws = rows.map((r) => waterContent(r).w)
  it('water contents 59.96, 58.66, 57.93, 56.62, 55.53 %', () => [59.96, 58.66, 57.93, 56.62, 55.53].forEach((w, i) => near(ws[i], w, 0, 0.006)))
  it('flow curve gives LL = 57.3 % (boxed 57 %), flow index 12.4', () => {
    const f = flowCurve(rows.map((r, i) => ({ N: r.N, w: ws[i] })))
    near(f.LL, 57.3, 0.002)
    expect(Math.round(f.LL)).toBe(57)
    near(f.If, 12.36, 0.005)
  })
})

describe('slide 15: PL = 34 % (mean 33.93)', () => {
  it('three threads', () => {
    const w = [
      { tare: 10.54, wet: 47.26, dry: 37.95 },
      { tare: 11.22, wet: 47.77, dry: 38.51 },
      { tare: 9.29, wet: 46.43, dry: 37.03 },
    ].map((r) => waterContent(r).w)
    ;[33.97, 33.93, 33.89].forEach((v, i) => near(w[i], v, 0, 0.006))
    near((w[0] + w[1] + w[2]) / 3, 33.93, 0, 0.006)
  })
})

describe('slides 16–18: PI, Burmister, LI case study, chart', () => {
  it('PI = 57 − 34 = 23 → High plasticity; plots below the A-line (27.0) → MH', () => {
    const k = indices({ LL: 57, PL: 34 })
    expect(k.PI).toBe(23)
    expect(k.burmister).toBe('High plasticity')
    near(aLine(57), 27.01)
    expect(chartZone(57, 23).zone).toBe('MH')
    expect(casagrandeZone(57, 23).sym).toBe('MH')
  })
  it('LI case study wN 24, PL 22, LL 52 → LI = 0.067 (competent)', () => {
    near(indices({ LL: 52, PL: 22, w: 24 }).LI, 0.0667, 0.003, 0.0005)
  })
  it('slide 31 point LL 33, PI 21 → CL (A 9.5, U 22.5)', () => {
    const z = chartZone(33, 21)
    expect(z.zone).toBe('CL')
    near(z.aPI, 9.49)
    near(z.uPI, 22.5)
  })
  it('U-line PI = 0.9(LL − 8), CL-ML band', () => {
    near(uLine(16), 7.2)
    expect(chartZone(19, 5).zone).toBe('CL-ML')
    expect(chartZone(26, 6).zone).toBe('CL-ML')
    expect(chartZone(30, 3).zone).toBe('ML')
  })
})

describe('fall cone (BS 1377, LL at 20 mm)', () => {
  it('2009-10 Q3(a): 80 g cone → LL ≈ 58 %, LI = 0.22 with PL 35, w 40', () => {
    const f = coneLL([
      { d: 7.8, w: 45 },
      { d: 14.8, w: 53 },
      { d: 22, w: 60 },
      { d: 32, w: 68 },
    ])
    near(f.interp, 58.06, 0.001)
    expect(f.LL).toBeGreaterThan(57.3)
    expect(f.LL).toBeLessThan(59.2)
    near(indices({ LL: f.interp, PL: 35, w: 40 }).LI, 0.22, 0.02)
  })
  it('2017-18 Q1(a): w = 3.53p − 23.7 → LL = 46.8 %; one-point from 18 mm = 41.4, 22 mm = 52.2', () => {
    const f = coneLL([16, 18, 22, 25, 30].map((d, i) => ({ d, w: [33, 40, 54, 63, 83][i] })))
    near(f.b, 3.53, 0.003)
    near(f.LL, 46.8, 0.003)
    near(f.interp, 47.0, 0.001)
    near(onePointCone(40, 18), 41.4, 0.002)
    near(onePointCone(54, 22), 52.2, 0.002)
  })
  it('2021-22 Q5(b): masses → 33.10, 40.22, 53.88, 62.75 %; LL = 46.7 %', () => {
    const w = [
      [193.8, 145.6],
      [190.7, 136.0],
      [186.5, 121.2],
      [181.3, 111.4],
    ].map(([a, b]) => wFromMasses(a, b))
    ;[33.1, 40.22, 53.88, 62.75].forEach((v, i) => near(w[i], v, 0, 0.01))
    const f = coneLL([16, 18, 22, 25].map((d, i) => ({ d, w: w[i] })))
    near(f.b, 3.306, 0.003)
    near(f.LL, 46.7, 0.003)
    near(onePointCone(w[1], 18), 41.6, 0.003)
    near(onePointCone(w[2], 22), 52.1, 0.003)
  })
  it('Jan 2021 Q6(a): LL = 54.9 %, one-point at 19.3 mm = 54.7 %', () => {
    const f = coneLL([16.1, 17.8, 19.3, 21.6, 22.6].map((d, i) => ({ d, w: [50, 52.1, 54.1, 57, 58.2][i] })))
    near(f.a, 29.57, 0.003)
    near(f.b, 1.268, 0.003)
    near(f.LL, 54.9, 0.002)
    near(onePointCone(54.1, 19.3), 54.7, 0.002)
  })
})

describe('Casagrande cup papers', () => {
  it('2023-24 Q4(b): w = 68.89 … 57.03; w = 92.49 − 22.04 log N → LL 61.7, If 22.0; PI 34.7 → CH', () => {
    const rows = [
      [11, 7.1, 29.9, 20.6],
      [17, 7.0, 30.1, 20.9],
      [23, 6.9, 30.8, 21.6],
      [30, 10.6, 34.0, 25.2],
      [38, 10.9, 31.0, 23.7],
    ]
    const pts = rows.map(([N, tare, wet, dry]) => ({ N, w: waterContent({ tare, wet, dry }).w }))
    ;[68.89, 66.19, 62.59, 60.27, 57.03].forEach((v, i) => near(pts[i].w, v, 0, 0.006))
    const f = flowCurve(pts)
    near(f.a, 92.49, 0.002)
    near(f.If, 22.04, 0.003)
    near(f.LL, 61.7, 0.002)
    const PI = f.LL - 27
    near(PI, 34.7, 0.005)
    expect(chartZone(f.LL, PI).zone).toBe('CH')
  })
  it('2020-21 Q5(b): w = 93.08 − 22.26 log N → LL 62.0, If 22.3', () => {
    const f = flowCurve([15, 19, 24, 30, 35].map((N, i) => ({ N, w: [66.9, 64.6, 62.4, 60.2, 58.7][i] })))
    near(f.a, 93.08, 0.002)
    near(f.If, 22.26, 0.003)
    near(f.LL, 62.0, 0.002)
  })
  it('slide 11 two-point flow index', () => near(flowIndex2(10, 50, 100, 38), 12))
})

describe('2010-11 Q1(a): one-point LL, consistency, SL from e, linear shrinkage', () => {
  const LL = onePointCup(45, 28)
  const k = indices({ LL, PL: 18.2, w: 40 })
  it('LL = 45.6 %, PI = 27.4, LI = 0.80, CI = 0.20 → plastic (very soft)', () => {
    near(LL, 45.62, 0.001)
    near(k.PI, 27.42, 0.002)
    near(k.LI, 0.795, 0.003)
    near(k.CI, 0.205, 0.01)
    expect(k.state).toBe('plastic')
    expect(k.ciDesc).toBe('very soft')
  })
  it('SL = e/G = 14.8 %, SR = 1.93, VS = 59.4 %, LS = 14.4 %', () => {
    const SL = slFromE(0.4, 2.7)
    const SR = srFromE(0.4, 2.7)
    near(SL, 14.81, 0.001)
    near(SR, 1.929, 0.001)
    const VS = volShrink(LL, SL, SR)
    near(VS, 59.4, 0.003)
    near(linearFromVS(VS), 14.4, 0.003)
    near(slFromGs(2.7, SR), SL, 1e-6)
  })
})

describe('2011-12 Q4(a): shrinkage test (Gs unknown)', () => {
  it('V1 9.75 ml, m1 16.5 g, V2 5.40 ml, m2 10.9 g → w1 51.4 %, SL 11.5 %, Gs 2.63', () => {
    const s = shrinkage({ m1: 16.5, V1: 9.75, m2: 10.9, V2: 5.4 })
    near(s.w1, 51.4, 0.002)
    near(s.SL, 11.47, 0.002)
    near(s.Gs, 2.63, 0.003)
    near(slFromGs(s.Gs, s.SR), s.SL, 1e-6)
  })
})

describe('2008-09 Q1(c): dried from 8 % with SL 12 % → no volume change', () => {
  it('0 %', () => {
    const d = dryingChange(8, 0, 12, 1.9)
    expect(d.belowSL).toBe(true)
    expect(d.pctOfInitial).toBe(0)
  })
  it('from 30 % with SL 12 %, SR 1.9: ΔV = 34.2 % of the dry volume', () => near(dryingChange(30, 0, 12, 1.9).pctOfDry, 34.2))
})

describe('two-soil comparisons (2012-13 Q2, 2016-17 Q5)', () => {
  it('2012-13: A (30, 16, If 12, w 32), B (52, 19, If 6, w 40)', () => {
    const A = indices({ LL: 30, PL: 16, w: 32, If: 12 })
    const B = indices({ LL: 52, PL: 19, w: 40, If: 6 })
    expect([A.PI, B.PI]).toEqual([14, 33])
    near(A.CI, -0.143, 0.01)
    near(B.CI, 0.364, 0.01)
    near(A.It, 1.167, 0.003)
    near(B.It, 5.5, 0.001)
    expect(A.state).toBe('liquid')
  })
  it('2016-17: A (52, 19, If 11, w 32), B (30, 22, If 6, w 40)', () => {
    const A = indices({ LL: 52, PL: 19, w: 32, If: 11 })
    const B = indices({ LL: 30, PL: 22, w: 40, If: 6 })
    near(A.CI, 0.606, 0.003)
    near(B.CI, -1.25, 0.001)
    near(A.It, 3.0, 0.001)
    near(B.It, 1.333, 0.001)
    expect(burmister(A.PI)).toBe('High plasticity')
    expect(chartZone(52, 33).zone).toBe('CH')
  })
})

describe('2016-17 Q11: activity from linear shrinkage', () => {
  it('129 mm of 140 mm → LS 7.86 %, PI ≈ 16.7, A = 0.69 (inactive); LI 0.46', () => {
    const LS = linearFromLength(129)
    near(LS, 7.857, 0.001)
    const PI = piFromLS(LS)
    near(PI, 16.74, 0.002)
    const k = indices({ LL: 38, PL: 38 - PI, w: 29, clay: 24.2 })
    near(k.A, 0.69, 0.005)
    expect(k.activity).toBe('inactive')
    near(k.LI, 0.46, 0.01)
  })
})

describe('states', () => {
  it('solid / semi-solid / plastic / liquid', () => {
    const l = { SL: 12, PL: 22, LL: 45 }
    expect(consistencyState(8, l)).toBe('solid')
    expect(consistencyState(15, l)).toBe('semi-solid')
    expect(consistencyState(30, l)).toBe('plastic')
    expect(consistencyState(50, l)).toBe('liquid')
  })
})
