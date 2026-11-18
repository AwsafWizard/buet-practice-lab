import { describe, expect, it } from 'vitest'
import { annualGrowth, arithmetic, decreasing, expo, geometric, growthRates, incremental, leastSquaresParabola, logistic, polyFit, ratioMethod, runAll } from './population'

const ex2 = [1980, 1990, 2000, 2010, 2020].map((year, i) => ({ year, pop: [72, 79, 89, 97, 120][i] * 1000 }))
const ex5 = [1980, 1990, 2000, 2010, 2020].map((year, i) => ({ year, pop: [25, 28, 34, 42, 47][i] * 1000 }))

describe('population (slide L2 oracles)', () => {
  it('arithmetic Ex-2: 132,000 and 144,000', () => {
    const m = arithmetic(ex2)
    expect(m.params.K).toBeCloseTo(1200, 6)
    expect(m.at(2030)).toBeCloseTo(132000, 3)
    expect(m.at(2040)).toBeCloseTo(144000, 3)
  })
  it('constant percentage Ex-3: 136,346 / 154,918 (K = 0.01277)', () => {
    const m = expo(ex2)
    expect(m.params.K).toBeCloseTo(0.012771, 5)
    expect(Math.round(m.at(2030))).toBeGreaterThanOrEqual(136345)
    expect(Math.round(m.at(2030))).toBeLessThanOrEqual(136350)
    expect(m.at(2040)).toBeCloseTo(154918, -1)
  })
  it('geometric Ex-4 (end-to-end, r = 0.01285): 136,342 / 154,912', () => {
    const m = geometric(ex2, 'end')
    expect(m.params.r).toBeCloseTo(0.012853, 5)
    expect(m.at(2030)).toBeCloseTo(136342, -2)
    expect(m.at(2040)).toBeCloseTo(154912, -2) // exact 154,919; the slide rounds r
  })
  it('geometric, her handwritten mean of the decade rates (r = 0.01287): ~136,370 / 154,973', () => {
    const m = geometric(ex2, 'mean')
    expect(m.params.r).toBeCloseTo(0.01287, 4)
    expect(m.at(2030)).toBeCloseTo(136370, -2)
    expect(m.at(2040)).toBeCloseTo(154973, -2)
  })
  it('decreasing rate Ex-5 (data from the notes): 2030 = 52,578; 2040 = 58,802 with constant s (slide prints 58,818)', () => {
    const g = growthRates(ex5)
    expect(g.rates[0]).toBeCloseTo(12, 2)
    expect(g.rates[3]).toBeCloseTo(11.905, 2)
    expect(g.s).toBeCloseTo(0.0333, 2) // exact 0.0317; she rounds the rates first
    const m = decreasing(ex5)
    expect(m.at(2030)).toBeGreaterThan(52570)
    expect(m.at(2030)).toBeLessThan(52582)
    expect(m.at(2040)).toBeGreaterThan(58795)
    expect(m.at(2040)).toBeLessThan(58815)
  })
  it('ratio method Ex-6: 0.1232 → 87,248 / 95,338 / 103,562', () => {
    const r = ratioMethod(78855, 640054, [708185, 773854, 840603])
    expect(r.ratio).toBe(0.1232)
    expect(Math.round(r.projections[0])).toBe(87248)
    expect(Math.abs(r.projections[1] - 95338)).toBeLessThan(1) // 95,338.5: the slide truncates
    expect(Math.round(r.projections[2])).toBe(103562)
  })
})

describe('least squares (the seniors’ coded-x worked example)', () => {
  // 20, 26, 34, 48, 70 million, 1970..2010: Y = 1196/35 + 61/5 x + 19/7 x², x = (year-1990)/10
  const d = [1970, 1980, 1990, 2000, 2010].map((year, i) => ({ year, pop: [20, 26, 34, 48, 70][i] }))
  it('coefficients and forecasts 95.2 / 126.4', () => {
    const f = polyFit(d, 2)
    expect(f.coef[0]).toBeCloseTo(1196 / 35, 8)
    expect(f.coef[1]).toBeCloseTo(61 / 5, 8)
    expect(f.coef[2]).toBeCloseTo(19 / 7, 8)
    expect(f.sums.sx[2]).toBeCloseTo(10, 8)
    expect(f.sums.sx[4]).toBeCloseTo(34, 8)
    expect(f.at(2020)).toBeCloseTo(95.2, 1)
    expect(f.at(2030)).toBeCloseTo(126.4, 1)
    expect(leastSquaresParabola(d).at(2020)).toBeCloseTo(95.2, 1)
  })
  it('a line through exact line data', () => {
    const l = polyFit([{ year: 2000, pop: 10 }, { year: 2010, pop: 20 }, { year: 2020, pop: 30 }], 1)
    expect(l.at(2030)).toBeCloseTo(40, 8)
  })
})

describe('other methods', () => {
  it('annual growth Dhaka 8 → 12 million in 10 yr', () => {
    const g = annualGrowth(8, 2010, 12, 2020)
    expect(g.geometric).toBeCloseTo(0.04138, 4)
    expect(g.arithmetic).toBeCloseTo(0.05, 8)
    expect(g.continuous).toBeCloseTo(0.040547, 5)
  })
  it('seniors’ example Mymensingh: 124,000 → 156,000 gives r = 0.0231 (they print 0.023)', () => {
    expect(annualGrowth(124000, 1950, 156000, 1960).geometric).toBeCloseTo(0.0231, 3)
  })
  it('incremental increase: X = mean increase, Y = mean change of increase', () => {
    const q = [0, 1, 2, 3].map((i) => ({ year: 2000 + 10 * i, pop: 100 + 10 * i + 5 * i * i }))
    const m = incremental(q)
    expect(m.params.X).toBeCloseTo(25, 8)
    expect(m.params.Y).toBeCloseTo(10, 8)
    expect(m.at(2040)).toBeCloseTo(175 + 25 + 10, 8)
  })
  it('logistic recovers a synthetic S-curve', () => {
    const Ps = 1000
    const d = [0, 1, 2, 3, 4].map((i) => ({ year: 1980 + 10 * i, pop: Ps / (1 + Math.exp(2 - 0.6 * i)) }))
    const lg = logistic(d)!
    expect(lg.Ps).toBeCloseTo(Ps, 3)
    expect(lg.at(2050)).toBeCloseTo(Ps / (1 + Math.exp(2 - 0.6 * 7)), 3)
  })
  it('runAll returns every applicable method', () => {
    const ids = runAll(ex2).map((m) => m.id)
    expect(ids).toEqual(expect.arrayContaining(['arith', 'expo', 'geom', 'decr', 'incr', 'line', 'parab']))
  })
})
