import { describe, expect, it } from 'vitest'
import { BNBC, catchmentArea, compare, demandSide, demandSideBnbc, dryMonths, harvest, monthlyFromLpd, RAIN_TABLES, scaleRain, supplySide, tankYear } from './rwh'

const near = (a: number, b: number, abs = 0.02) => expect(Math.abs(a - b)).toBeLessThanOrEqual(abs)

describe('RM L6 RWH-1 (demand side): 6 people, 10 L/c/d, 100 dry days', () => {
  it('6000 L + 600 L freeboard = 6.6 m3', () => {
    const r = demandSide({ users: 6, perCapita: 10, days: 100 })
    expect(r.V).toBe(6000)
    near(r.freeboard, 600, 1e-9)
    near(r.designM3, 6.6, 1e-9)
  })
  it('BNBC 90 / 210 days rule', () => {
    const r = demandSideBnbc({ users: 36, potable: 20, other: 100 })
    expect(r.potable).toBe(36 * 20 * 90)
    expect(r.other).toBe(36 * 100 * 210)
    near(r.designM3, 902.88, 0.01)
  })
})

describe('RM L6 RWH-2 (supply side): medical dispensary, 190 m2, C 0.9, 1056 mm', () => {
  const rain = RAIN_TABLES[0].rain
  const dem = (7 * 45 + 40 * 10) / 1000 // 0.715 m3/d
  const r = supplySide({ area: 190, C: 0.9, rain, demandPerMonth: monthlyFromLpd(715) })
  it('annual harvest and demand', () => {
    near(r.annualHarvest, 180.58, 0.005)
    near(monthlyFromLpd(715), 21.75, 0.005)
    near(dem * 365, 261, 0.5)
    expect(r.supplyGoverns).toBe(true)
    near(r.demandUsed, 15.05, 0.005)
  })
  it('the table starts in October and matches the slide', () => {
    expect(r.rows[0].month).toBe('Oct')
    expect(r.rows[11].month).toBe('Sep')
    const row = (m: string) => r.rows.find((x) => x.month === m)!
    near(row('Oct').harvest, 15.05, 0.005)
    near(row('Nov').harvest, 21.2, 0.01)
    near(row('Apr').harvest, 36.59, 0.01)
    near(row('Apr').cumHarvest, 155.78, 0.02)
    near(row('Sep').cumHarvest, 180.58, 0.01)
    near(row('Apr').diff, 50.45, 0.02)
    near(row('Sep').diff, 0, 0.01)
    near(row('Dec').diff, 14.02, 0.03)
  })
  it('the tank is the maximum difference, April, 50.45 m3', () => {
    near(r.maxDiff, 50.45, 0.02)
    expect(r.maxDiffMonth).toBe('Apr')
    near(r.tank, 50.45, 0.02)
  })
})

describe('when the supply is plentiful the demand is not cut and the tank is the largest run of deficit', () => {
  it('big roof, small demand', () => {
    const r = supplySide({ area: 800, C: 0.8, rain: RAIN_TABLES[1].rain, demandPerMonth: monthlyFromLpd(715) })
    expect(r.supplyGoverns).toBe(false)
    near(r.demandUsed, 21.75, 0.005)
    expect(r.tank).toBeGreaterThan(0)
    // dry months Dec-Feb-ish: the tank never needs more than the demand of a year
    expect(r.tank).toBeLessThan(21.75 * 12)
    expect(r.spill).toBeGreaterThan(0)
  })
  it('a tank of that size never runs dry (checked by simulating three years)', () => {
    const rain = RAIN_TABLES[1].rain
    const r = supplySide({ area: 800, C: 0.8, rain, demandPerMonth: monthlyFromLpd(715) })
    let lv = r.tank
    let min = Infinity
    for (let y = 0; y < 3; y++)
      for (let m = 0; m < 12; m++) {
        lv = Math.min(r.tank, lv + (800 * rain[m] * 0.8) / 1000 - monthlyFromLpd(715))
        min = Math.min(min, lv)
      }
    expect(min).toBeGreaterThanOrEqual(-1e-9)
    // and a tank 3 % smaller does run dry
    lv = r.tank * 0.97
    min = Infinity
    for (let y = 0; y < 3; y++)
      for (let m = 0; m < 12; m++) {
        lv = Math.min(r.tank * 0.97, lv + (800 * rain[m] * 0.8) / 1000 - monthlyFromLpd(715))
        min = Math.min(min, lv)
      }
    expect(min).toBeLessThan(0)
  })
})

describe('BNBC catchment (RM L6 p9, 2020-21 Q3(b) figure)', () => {
  it('terrace plan areas plus half of the adjoining wall', () => {
    const c = catchmentArea({ terraces: [22 * 15, 22 * 6], walls: [8 * 22] })
    near(c.total, 330 + 132 + 88, 1e-9)
  })
  it('thresholds', () => {
    expect(BNBC.thresholdM2).toBe(300)
    expect(BNBC.firstFlushMin.Dhaka).toBe(20)
  })
})

describe('papers', () => {
  it('2023-24 Q3(d): 7 people x 15 L x 90 dry days + 10 % = 10.4 m3; the roof gives 112 m3 a year', () => {
    const r = dryMonths({ users: 7, perCapita: 15, months: 3 })
    near(r.V, 9450, 1e-9)
    near(r.designM3, 10.395, 1e-6)
    near(harvest(150, 1070, 0.7), 112.35, 0.01)
  })
  it('2020-21 Q3(b): supply side governs and gives a tank smaller than the demand-side figure', () => {
    const rain = RAIN_TABLES[2].rain
    const area = catchmentArea({ terraces: [330, 132], walls: [176] }).total
    const c = compare({ area, C: 0.8, rain, users: 36, potable: 20, other: 100 })
    near(c.harvestYear, 1071.4, 0.2)
    expect(c.governs).toBe('supply')
    expect(c.supply.tank).toBeLessThan(c.demandSide)
    expect(c.supply.rows[0].month).toBe('May')
  })
  it('scaleRain keeps the pattern and hits the annual total', () => {
    const s = scaleRain(RAIN_TABLES[1].rain, 1100)
    near(s.reduce((a, b) => a + b, 0), 1100, 1e-9)
  })
})

describe('a tank of a chosen size', () => {
  const s = supplySide({ area: 190, C: 0.9, rain: RAIN_TABLES[0].rain, demandPerMonth: monthlyFromLpd(715) })
  it('the mass-curve tank (50.45 m3) just meets the cut-down demand every month', () => {
    const y = tankYear(s, s.tank + 0.01)
    expect(y.short).toBeLessThan(0.05)
    expect(y.reliability).toBeGreaterThan(0.995)
  })
  it('a smaller tank falls short, a bigger one adds nothing', () => {
    const small = tankYear(s, s.tank * 0.5)
    expect(small.short).toBeGreaterThan(5)
    expect(small.monthsShort).toBeGreaterThan(0)
    const big = tankYear(s, s.tank * 2)
    expect(big.short).toBeLessThan(0.05)
  })
})
