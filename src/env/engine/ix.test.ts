import { describe, expect, it } from 'vitest'
import { breakthrough, fixedBed, homeSoftener } from './ix'

describe('ix (TA T08 oracles)', () => {
  it('T08-A: 30 % bypass (30.4 exactly), 14.5 days with the class’s rounded 30 %', () => {
    const e = homeSoftener({ V: 0.1, cap: 57, Qlpd: 2000, Hraw: 280, Hdes: 85 })
    expect(e.bypass).toBeCloseTo(0.3036, 3)
    expect(e.days).toBeCloseTo(14.62, 1)
    const c = homeSoftener({ V: 0.1, cap: 57, Qlpd: 2000, Hraw: 280, Hdes: 85, bypass: 0.3 })
    expect(c.loadKgD).toBeCloseTo(0.392, 3)
    expect(c.days).toBeCloseTo(14.54, 2)
  })
  it('Jan 2021 Q4(b): 34.6 % bypass, 25.5 days', () => {
    const e = homeSoftener({ V: 0.1, cap: 65, Qlpd: 1500, Hraw: 260, Hdes: 90 })
    expect(e.bypass).toBeCloseTo(0.346, 3)
    expect(e.days).toBeCloseTo(25.5, 0)
  })
  it('2022-23 Q2(c): 23.4 % bypass, 22.3 days', () => {
    const e = homeSoftener({ V: 0.2, cap: 82, Qlpd: 3000, Hraw: 320, Hdes: 75 })
    expect(e.bypass).toBeCloseTo(0.234, 3)
    expect(e.days).toBeCloseTo(22.3, 0)
  })
  it('T08-B per metre of depth: 900 min; brine 1.5 m³ per m³ resin', () => {
    const f = fixedBed({ Q: 1000, Hraw: 250, Hdes: 0.0001, cap: 90, loading: 0.4, depth: 1, regen: 150, strength: 0.1 })
    expect(f.runMin).toBeCloseTo(900, 3)
    expect(f.brineM3 / f.V).toBeCloseTo(1.5, 6)
  })
  it('2023-24 Q4(c): 27.2 % bypass, A ≈ 36.1 m², run ≈ 15.4 h at 1.5 m', () => {
    const f = fixedBed({ Q: 25000, Hraw: 440.4, Hdes: 120, cap: 95, loading: 0.35, depth: 1.5, regen: 150, strength: 0.1 })
    expect(f.bypass).toBeCloseTo(0.2725, 3)
    expect(f.A).toBeCloseTo(36.1, 0)
    expect(f.runH).toBeCloseTo(15.4, 0)
    expect(f.saltKg).toBeCloseTo(8130, -2)
  })
  it('breakthrough stays low then rises to the feed', () => {
    expect(breakthrough(0.3)).toBeLessThan(0.05)
    expect(breakthrough(1.1)).toBeGreaterThan(0.9)
  })
})
