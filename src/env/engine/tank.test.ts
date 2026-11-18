import { describe, expect, it } from 'vitest'
import { costCurve, economicTank, galToFt3, tankCost } from './tank'

const near = (a: number, b: number, rel = 0.002) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.abs(b) * rel)

describe('economic cylindrical tank', () => {
  it('2020-21 Q2(c): 1 lac gallon, Tk 1200 floor, Tk 1800 wall (her 0.16 ft3 gallon)', () => {
    const V = galToFt3(100000)
    near(V, 16000, 1e-9)
    const t = economicTank(V, 1200, 1800)
    near(t.D, Math.cbrt((8 * 1.5 * 16000) / Math.PI), 1e-9)
    near(t.D, 39.4, 0.003)
    near(t.H, t.D / 3, 1e-9) // H = D cf / 2 cw = D/3
    near(t.floorArea * t.H, V * 4 / Math.PI * Math.PI / 4, 1e-9)
    near((Math.PI * t.D * t.D * t.H) / 4, V, 1e-9)
  })
  it('equal floor and wall cost per sft gives H = D/2', () => {
    const t = economicTank(1000, 300, 300)
    near(t.H, t.D / 2, 1e-9)
  })
  it('it is the minimum: every other diameter costs more', () => {
    const t = economicTank(16000, 1200, 1800)
    for (const D of [t.D * 0.8, t.D * 0.95, t.D * 1.05, t.D * 1.3]) expect(tankCost(16000, D, 1200, 1800).cost).toBeGreaterThan(t.cost)
    const c = costCurve(16000, 1200, 1800, 20, 60)
    expect(Math.min(...c.map((p) => p.cost))).toBeGreaterThanOrEqual(t.cost - 1e-6)
  })
  it('at the optimum the floor costs half of what the wall costs', () => {
    const t = economicTank(9000, 200, 250)
    near(t.floorCost * 2, t.wallCost, 1e-9)
  })
  it('US gallons for the 2 lac US gal papers', () => {
    near(galToFt3(200000, 'us'), 26736.1, 0.0005)
  })
})
