import { describe, expect, it } from 'vitest'
import { breakpointModel, chickWatson, chlorineDose, residualAt, timeAtOtherC, timeForLogKill } from './chlorine'

describe('chlorine (TA T10)', () => {
  it('T10-A: k_cw ≈ 0.208 L/mg·s (class 0.208)', () => {
    const r = chickWatson({ C: 1.8, data: [{ t: 0, N: 6152 }, { t: 2, N: 3000 }, { t: 4, N: 1200 }, { t: 6, N: 710 }, { t: 8, N: 300 }] })
    expect(r.pts[1].lnR).toBeCloseTo(-0.718, 2)
    expect(r.pts[4].lnR).toBeCloseTo(-3.02, 2)
    expect(r.k).toBeGreaterThan(0.2)
    expect(r.k).toBeLessThan(0.215)
  })
  it('dose = demand + residual', () => {
    expect(chlorineDose(1.2, 0.5)).toBeCloseTo(1.7, 10)
  })
  it('Ct scaling and log kill', () => {
    expect(timeAtOtherC(1, 10, 2)).toBe(5)
    expect(timeForLogKill(0.208, 1.8, 3)).toBeCloseTo(18.5, 0)
  })
  it('breakpoint zones in order', () => {
    const m = breakpointModel(0.5, 0.8)
    expect(residualAt(m, 0.3).zone).toBe('demand')
    expect(residualAt(m, m.peakDose - 0.1).zone).toBe('chloramine')
    expect(residualAt(m, (m.peakDose + m.bpDose) / 2).zone).toBe('destruction')
    expect(residualAt(m, m.bpDose + 1).free).toBeCloseTo(1, 10)
    expect(residualAt(m, m.peakDose).residual).toBeGreaterThan(residualAt(m, m.bpDose).residual)
  })
})
