import { describe, expect, it } from 'vitest'
import { aashto, ccOf, cuOf, dAt, fig52, fromCuCc, grading, groupIndex, pctFinerAt, sieveAnalysis, usda, usdaClass, uscs } from './classify'

const near = (a: number, b: number, rel = 0.003, abs = 0.005) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('AASHTO: Das Examples 5.2–5.4 (slides 15–24)', () => {
  it('5.2: No. 10 100, No. 40 80, No. 200 58, LL 30, PI 10 → A-4(3) (GI 3.45)', () => {
    const r = aashto({ P10: 100, P40: 80, P200: 58, LL: 30, PI: 10 })
    expect(r.part).toBe('silt-clay')
    expect(r.label).toBe('A-4(3)')
    near(r.gi.raw, 3.45)
  })
  it('5.3: 95 % passing No. 200, LL 60, PI 40 → A-7-6(42)', () => {
    const r = aashto({ P200: 95, LL: 60, PI: 40 })
    expect(r.label).toBe('A-7-6(42)')
    near(r.gi.t1, 18)
    near(r.gi.t2, 24)
  })
  it('5.4 (DIY): No. 10 90, No. 40 76, No. 200 34, LL 37, PI 12 → A-2-6(0), GI = 0.38', () => {
    const r = aashto({ P10: 90, P40: 76, P200: 34, LL: 37, PI: 12 })
    expect(r.label).toBe('A-2-6(0)')
    near(r.gi.raw, 0.38)
  })
})

describe('AASHTO M 145 §6.4 group-index examples and the nomograph example', () => {
  it('A-6: F 55, LL 40, PI 25 → 10', () => expect(groupIndex(55, 40, 25).gi).toBe(10))
  it('A-7: F 80, LL 90, PI 50 → 46', () => expect(groupIndex(80, 90, 50).gi).toBe(46))
  it('A-4: F 60, LL 25, PI 1 → −1.0 → 0', () => {
    const g = groupIndex(60, 25, 1)
    near(g.raw, -0.93, 0.01, 0.1)
    expect(g.gi).toBe(0)
  })
  it('A-2-7: F 30, LL 50, PI 30 → PI part only = 3', () => expect(groupIndex(30, 50, 30, 'A-2-7').gi).toBe(3))
  it('nomograph: F 82, LL 38, PI 21 → 8.9 + 7.4 = 16', () => {
    const g = groupIndex(82, 38, 21)
    near(g.t1, 8.93)
    near(g.t2, 7.37)
    expect(g.gi).toBe(16)
  })
  it('rounding: 3.5 → 4, A-1/A-3/A-2-4/A-2-5 → 0', () => {
    expect(groupIndex(40, 40, 10 + 3.5 / 0.25).gi).toBe(Math.round(5 * 0.2 + 3.5))
    expect(groupIndex(30, 45, 8, 'A-2-5').gi).toBe(0)
  })
})

describe('AASHTO past papers', () => {
  it('2007-08 Q1(b): F200 = 30 alone → only the A-2 subgroups are possible', () => {
    const r = aashto({ P200: 30 })
    expect(r.possible).toEqual(['A-2-4', 'A-2-5', 'A-2-6', 'A-2-7'])
  })
  it('2009-10 Q2(a): F 60, LL 43, PI 28 → A-7-6(13)', () => expect(aashto({ P40: 80, P200: 60, LL: 43, PI: 28 }).label).toBe('A-7-6(13)'))
  it('2010-11 Q2(b): F 96.9, LL 20, PI 6 → A-4(3)', () => expect(aashto({ P200: 96.9, LL: 20, PI: 6 }).label).toBe('A-4(3)'))
  it('2011-12 Q2(a) soil D: F ≈ 72, LL 62, PI 28 → A-7-5(22)', () => expect(aashto({ P200: 72, LL: 62, PI: 28 }).label).toBe('A-7-5(22)'))
  it('2012-13 Q2 soil B: F 52, LL 52, PI 33 → A-7-6(13)', () => expect(aashto({ P200: 52, LL: 52, PI: 33 }).label).toBe('A-7-6(13)'))
  it('2015-16 Q5: No. 10 80, No. 40 70, No. 200 52, LL 55, PI 22 → A-7-5(9)', () => expect(aashto({ P10: 80, P40: 70, P200: 52, LL: 55, PI: 22 }).label).toBe('A-7-5(9)'))
  it('2016-17 Q11(c): F 40, LL 38, PI 16.7 → A-6(3)', () => expect(aashto({ P200: 40, LL: 38, PI: 16.74 }).label).toBe('A-6(3)'))
  it('2017-18 Q3(a): F 90, LL 52, PL 25 → A-7-6(27)', () => expect(aashto({ P200: 90, LL: 52, PI: 27 }).label).toBe('A-7-6(27)'))
  it('2020-21 Q5(c): F 95, LL 53, PL 24 → A-7-6(31)', () => expect(aashto({ P200: 95, LL: 53, PI: 29 }).label).toBe('A-7-6(31)'))
  it('2021-22 Q6(b): No. 10 90, No. 40 38, No. 200 13, LL 23, PI 4 → A-1-b(0)', () => {
    const r = aashto({ P10: 90, P40: 38, P200: 13, LL: 23, PI: 4 })
    expect(r.label).toBe('A-1-b(0)')
    expect(r.checks[0].pass).toBe(false)
  })
  it('Jan 2021 Q6(b): F 92, LL 41, PI 10 (both on the boundary) → A-5(12)', () => expect(aashto({ P200: 92, LL: 41, PI: 10 }).label).toBe('A-5(12)'))
  it('A-3 needs a non-plastic fine sand', () => expect(aashto({ P10: 100, P40: 85, P200: 6, NP: true }).group).toBe('A-3'))
  it('Fig. 5.2 regions', () => {
    expect(fig52(30, 10)).toBe('A-4')
    expect(fig52(60, 40)).toBe('A-7-6')
    expect(fig52(62, 28)).toBe('A-7-5')
    expect(fig52(37, 12, 34)).toBe('A-2-6')
  })
})

describe('grading curve from sieve data (2023-24 Q4(a))', () => {
  const { total, lines, pts } = sieveAnalysis(
    [
      { d: 4.75, ret: 0 },
      { d: 2.0, ret: 40 },
      { d: 0.85, ret: 60 },
      { d: 0.425, ret: 89 },
      { d: 0.25, ret: 140 },
      { d: 0.18, ret: 122 },
      { d: 0.15, ret: 210 },
      { d: 0.075, ret: 56 },
    ],
    12,
  )
  const g = grading(pts)
  it('total 729 g; % finer 94.51, 86.28, 74.07, 54.87, 38.13, 9.33, 1.65', () => {
    expect(total).toBe(729)
    ;[100, 94.51, 86.28, 74.07, 54.87, 38.13, 9.33, 1.65].forEach((v, i) => near(lines[i].pf, v, 0, 0.006))
  })
  it('USCS gravel 0, sand 98.35, fines 1.65; AASHTO gravel 5.49, sand 92.87', () => {
    near(g.uscs.gravel, 0)
    near(g.uscs.sand, 98.35, 0, 0.006)
    near(g.aashto.gravel, 5.49, 0, 0.006)
    near(g.aashto.sand, 92.87, 0, 0.006)
  })
  it('D10 0.151, D30 0.171, D60 0.288 mm → Cu 1.9, Cc 0.67 (poorly graded, SP)', () => {
    near(g.D10, 0.1506, 0.003)
    near(g.D30, 0.171, 0.003)
    near(g.D60, 0.288, 0.003)
    near(g.Cu, 1.91, 0.01)
    near(g.Cc, 0.674, 0.01)
    const u = uscs({ F200: g.P200, F4: g.P4, NP: true, Cu: g.Cu, Cc: g.Cc })
    expect(u.symbol).toBe('SP')
    expect(u.name).toBe('Poorly graded sand')
  })
  it('linear interpolation gives 0.151 / 0.172 / 0.297', () => {
    const l = grading(pts, 'linear')
    near(l.D10, 0.151, 0.003)
    near(l.D30, 0.172, 0.003)
    near(l.D60, 0.297, 0.003)
  })
})

describe('USCS: Das Examples 5.5 and 5.6 (slides 30–39)', () => {
  it('5.5 soil A: F200 8, all sand, Cu 1.59, Cc 1.25, LL 30, PL 22 → SP-SC, poorly graded sand with clay', () => {
    const u = uscs({ F200: 8, F4: 100, LL: 30, PL: 22, Cu: 0.135 / 0.085, Cc: 0.12 ** 2 / (0.135 * 0.085) })
    near(u.PI, 8)
    expect(u.symbol).toBe('SP-SC')
    expect(u.name).toBe('Poorly graded sand with clay')
  })
  it('5.5 soil B: F200 61, LL 26, PL 20 → CL-ML, sandy silty clay', () => {
    const u = uscs({ F200: 61, F4: 100, LL: 26, PL: 20 })
    expect(u.symbol).toBe('CL-ML')
    expect(u.name).toBe('Sandy silty clay')
  })
  it('5.6: No. 4 70, No. 200 30, LL 33, PL 12 → SC, clayey sand with gravel (sand 57.14 % of the coarse fraction)', () => {
    const u = uscs({ F200: 30, F4: 70, LL: 33, PL: 12 })
    expect(u.symbol).toBe('SC')
    expect(u.name).toBe('Clayey sand with gravel')
    near((100 * u.sand) / (100 - u.fines), 57.14, 0.001)
  })
})

describe('USCS past papers', () => {
  it('2007-08 Q3(a): F200 10, F40 30, F4 60, LL 45, PL 21 → SP-SC, poorly graded sand with clay and gravel', () => {
    const pts = [
      { d: 4.75, pf: 60 },
      { d: 0.425, pf: 30 },
      { d: 0.075, pf: 10 },
    ]
    const g = grading(pts)
    near(g.D10, 0.075)
    near(g.D30, 0.425)
    near(g.D60, 4.75)
    near(g.Cu, 63.3, 0.003)
    near(g.Cc, 0.51, 0.01)
    const u = uscs({ F200: 10, F4: 60, LL: 45, PL: 21, Cu: g.Cu, Cc: g.Cc })
    expect(u.symbol).toBe('SP-SC')
    expect(u.name).toBe('Poorly graded sand with clay and gravel')
  })
  it('2008-09 Q1(b): F200 60, LL 19, PL 14 → CL-ML', () => expect(uscs({ F200: 60, LL: 19, PL: 14 }).symbol).toBe('CL-ML'))
  it('2008-09 Q2(b): no No. 4 value, 60 % passes No. 10 → S; D 0.15 / 0.425 / 2.0 → SP-SC', () => {
    const g = grading([
      { d: 2.0, pf: 60 },
      { d: 0.425, pf: 30 },
      { d: 0.15, pf: 10 },
      { d: 0.075, pf: 8 },
    ])
    near(g.D10, 0.15)
    near(g.Cu, 13.33, 0.003)
    near(g.Cc, 0.602, 0.003)
    const u = uscs({ F200: 8, F4min: 60, LL: 27, PL: 15, Cu: g.Cu, Cc: g.Cc })
    expect(u.symbol).toBe('SP-SC')
    expect(u.nameNote).toBeTruthy()
  })
  it('2009-10 Q2(a): back-calculated D10 0.025, D30 0.060 mm', () => {
    const d = fromCuCc(0.075, 3, 1.92)
    near(d.D10, 0.025)
    near(d.D30, 0.06)
    near(cuOf(d.D60, d.D10), 3)
    near(ccOf(d.D10, d.D30, d.D60), 1.92)
  })
  it('2010-11 Q2(b): F 96.9, LL 20, PI 6 → CL-ML (silty clay)', () => {
    const u = uscs({ F200: 96.9, F4: 100, LL: 20, PL: 14, Cu: 1.4, Cc: 1.03 })
    expect(u.symbol).toBe('CL-ML')
    expect(u.name).toBe('Silty clay')
  })
  it('2012-13 Q2 soil A: F 52, LL 30, PL 16 → CL, name needs the split', () => {
    const u = uscs({ F200: 52, LL: 30, PL: 16 })
    expect(u.symbol).toBe('CL')
    expect(u.nameNote).toBeTruthy()
  })
  it('2015-16 Q5: LL oven 45 / air 55 = 0.82 → inorganic; MH, sandy elastic silt', () => {
    const u = uscs({ F200: 52, F4: 98, LL: 55, PL: 33, LLoven: 45 })
    expect(u.symbol).toBe('MH')
    expect(u.name).toBe('Sandy elastic silt')
  })
  it('2016-17 Q5: LL 52, PL 19 → CH', () => expect(uscs({ F200: 90, LL: 52, PL: 19 }).symbol).toBe('CH'))
  it('2017-18 Q2(b): A (F 93, LL 58, PL 23) → CH fat clay; B → SW-SM', () => {
    expect(uscs({ F200: 93, F4: 100, LL: 58, PL: 23 }).name).toBe('Fat clay')
    const g = grading([
      { d: 4.75, pf: 92 },
      { d: 2.0, pf: 60 },
      { d: 0.425, pf: 30 },
      { d: 0.075, pf: 10 },
    ])
    near(g.Cu, 26.67, 0.003)
    near(g.Cc, 1.204, 0.003)
    const u = uscs({ F200: 10, F4: 92, LL: 37, PL: 26, Cu: g.Cu, Cc: g.Cc })
    expect(u.symbol).toBe('SW-SM')
    expect(u.name).toBe('Well-graded sand with silt')
  })
  it('2020-21 Q6(a): A → CH; B (D 1.8 / 0.5 / 0.08, LL 38, PL 27) → SW-SM', () => {
    expect(uscs({ F200: 93, F4: 100, LL: 53, PL: 23 }).symbol).toBe('CH')
    const u = uscs({ F200: 10, F4: 92, LL: 38, PL: 27, Cu: 1.8 / 0.08, Cc: 0.25 / (1.8 * 0.08) })
    expect(u.symbol).toBe('SW-SM')
  })
  it('2020-21 Q6(d): LL 84 air / 58 oven, PL 45 → OH, organic silt', () => {
    const u = uscs({ F200: 100, F4: 100, LL: 84, PL: 45, LLoven: 58 })
    expect(u.symbol).toBe('OH')
    expect(u.name).toBe('Organic silt')
  })
  it('2021-22 Q6(b): sieve → SC-SM, silty clayey sand', () => {
    const u = uscs({ F200: 13, F4: 100, LL: 23, PL: 19 })
    expect(u.symbol).toBe('SC-SM')
    expect(u.name).toBe('Silty clayey sand')
  })
  it('Jan 2021 Q7(a): A → MH elastic silt; B → SW-SC well-graded sand with clay', () => {
    expect(uscs({ F200: 95, F4: 100, LL: 53, PL: 32 }).name).toBe('Elastic silt')
    const u = uscs({ F200: 11, F4: 90, LL: 37, PL: 21, Cu: 1.8 / 0.07, Cc: 0.16 / (1.8 * 0.07) })
    expect(u.symbol).toBe('SW-SC')
    expect(u.name).toBe('Well-graded sand with clay')
  })
  it('2011-12 Q2(a) soil A (digitised curve) → GW, well-graded gravel with sand', () => {
    const pts = [
      [50, 100],
      [40, 98],
      [30, 91],
      [25, 84],
      [20, 75],
      [15, 64],
      [12, 56],
      [10, 50],
      [8, 42],
      [6, 35],
      [4.75, 30],
      [3, 22],
      [2, 16],
      [1.16, 10],
      [0.85, 7.6],
      [0.425, 4.4],
      [0.075, 0.5],
    ].map(([d, pf]) => ({ d, pf }))
    const g = grading(pts)
    near(g.D10, 1.16)
    near(g.D30, 4.75, 0.02)
    near(g.D60, 13.5, 0.02)
    const u = uscs({ F200: g.P200, F4: g.P4, NP: true, Cu: g.Cu, Cc: g.Cc })
    expect(u.symbol).toBe('GW')
    expect(u.name).toBe('Well-graded gravel with sand')
  })
  it('interpolation helpers: % finer between sieves, D beyond the data is NaN', () => {
    near(pctFinerAt([{ d: 2, pf: 60 }, { d: 0.2, pf: 20 }], Math.sqrt(0.4)), 40)
    expect(Number.isNaN(dAt([{ d: 2, pf: 60 }, { d: 0.2, pf: 20 }], 10))).toBe(true)
  })
})

describe('USDA (slides 4–7)', () => {
  it('slide 4 soil A (30/40/30) → clay loam; soil B (20 % gravel) → gravelly clay (12.5/37.5/50)', () => {
    expect(usdaClass(30, 40, 30)).toBe('Clay loam')
    const b = usda({ gravel: 20, sand: 10, silt: 30, clay: 40 })
    near(b.sand, 12.5)
    near(b.clay, 50)
    expect(b.name).toBe('Gravelly clay')
  })
  it('Das Ex 5.1: A gravelly clay loam, B gravelly silty clay, C clay, D gravelly clay', () => {
    const r = [
      { gravel: 10, sand: 20, silt: 41, clay: 29 },
      { gravel: 21, sand: 12, silt: 35, clay: 32 },
      { gravel: 0, sand: 18, silt: 24, clay: 58 },
      { gravel: 12, sand: 22, silt: 26, clay: 40 },
    ].map((p) => usda(p))
    expect(r.map((x) => x.name)).toEqual(['Gravelly clay loam', 'Gravelly silty clay', 'Clay', 'Gravelly clay'])
    near(r[0].sand, 22.2, 0.003)
    near(r[1].silt, 44.3, 0.003)
    near(r[3].clay, 45.45, 0.003)
  })
  it('slide 3 curve (sand 80, silt 15, clay 5) → loamy sand; "loam" 40/40/20 → loam', () => {
    expect(usdaClass(80, 15, 5)).toBe('Loamy sand')
    expect(usdaClass(40, 40, 20)).toBe('Loam')
    expect(usdaClass(10, 85, 5)).toBe('Silt')
    expect(usdaClass(60, 10, 30)).toBe('Sandy clay loam')
  })
})
