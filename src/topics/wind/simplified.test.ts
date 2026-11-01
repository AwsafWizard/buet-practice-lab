import { describe, expect, it } from 'vitest'
import { PS30_SPEEDS, randomSimp, solveSimp, type SimpProblem } from './simplified'

const base: SimpProblem = { city: 'Narayanganj', V: 61.1, exp: 'B', occ: 4, use: 'office', B: 15.24, L: 15.24, eave: 9.144, rise: 0, enclosed: true }

describe('simplified procedure practice', () => {
  it('matches the 2020-21 Q4(a) flat-roof zone A within the table rounding', () => {
    // paper: λ = 1.4, I = 1.15, 136.7 mph between the printed 130 (26.8) and 140 (31.1) rows
    const s = solveSimp(base)
    expect(s.vLo).toBe(130)
    expect(s.vHi).toBe(140)
    const paperA = 26.8 + (31.1 - 26.8) * ((61.1 * 2.237 - 130) / 10)
    expect(s.p30[0]).toBeCloseTo(paperA, 0)
  })

  it('a value on a table row needs no interpolation', () => {
    const s = solveSimp({ ...base, V: 120 / 2.23694, rise: (15.24 / 2) * Math.tan((10 * Math.PI) / 180) })
    expect(s.given).toHaveLength(1)
    expect(s.p30[0]).toBeCloseTo(s.given[0].p[0], 6)
  })

  it('end zone a = min(0.1·least, 0.4h), not below 0.04·least or 0.9 m', () => {
    expect(solveSimp({ ...base, B: 20, L: 80, eave: 10, rise: 2 }).a).toBeCloseTo(2, 6)
    expect(solveSimp({ ...base, B: 12, L: 20, eave: 2, rise: 0 }).a).toBeCloseTo(0.9, 6)
  })

  it('generated problems stay on the printed tables and about a quarter fail a condition', () => {
    let fails = 0
    for (let seed = 1; seed <= 400; seed++) {
      const p = randomSimp(seed)
      const s = solveSimp(p)
      expect(s.Vmph).toBeLessThan(170)
      expect(PS30_SPEEDS).toContain(s.vLo)
      expect(s.theta).toBeLessThanOrEqual(20 + 1e-9)
      expect(s.ps.every(Number.isFinite)).toBe(true)
      if (!s.allowed) fails++
    }
    expect(fails).toBeGreaterThan(60)
    expect(fails).toBeLessThan(160)
  })
})
