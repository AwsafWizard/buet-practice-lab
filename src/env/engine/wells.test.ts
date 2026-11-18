import { describe, expect, it } from 'vitest'
import { dAtWell, drawdownAt, drawdownCurve, dupuitK, dupuitQ, dupuitR, interferenceConfinedQ, kObsConfined, kObsUnconfined, qObsConfined, storageVolume, thiemK, thiemQ, unconfinedInterferenceChain, yieldFor, type Aquifer } from './wells'

describe('wells (SN L3 exercises as oracles)', () => {
  it('Ex-1 unconfined: Q = 34.1 L/s, specific capacity 17.03 L/s per m', () => {
    const Q = dupuitQ({ K: 0.51, D: 35, s: 2, rw: 0.05, R: 30 })
    expect(Q).toBeCloseTo(34.06, 1)
    expect(Q / 2).toBeCloseTo(17.03, 1)
  })
  it('Ex-2 confined: K = 3.46 ≈ 3.5; Q′ = 205.8 (K = 3.5, slide 206) / 203.7 (K unrounded)', () => {
    const K = thiemK({ Q: 230, b: 30, s: 3, rw: 0.15, R: 750 })
    expect(K).toBeCloseTo(3.46, 2)
    expect(thiemQ({ K: 3.5, b: 30, s: 3, rw: 0.05, R: 750 })).toBeCloseTo(205.8, 0)
    expect(thiemQ({ K, b: 30, s: 3, rw: 0.05, R: 750 })).toBeCloseTo(203.7, 0)
  })
  it('Ex-3 unconfined interference: K = 3.52, R ≈ 289, each well 1058.5 L/min', () => {
    const c = unconfinedInterferenceChain({ Q: 1600, D: 61, s: 9.15, rw: 0.23, a: 7.5, h: 56.5, s2: 9.15 })
    expect(c.K).toBeCloseTo(3.52, 2)
    expect(c.R).toBeGreaterThan(285)
    expect(c.R).toBeLessThan(293)
    expect(c.each).toBeGreaterThan(1050)
    expect(c.each).toBeLessThan(1068)
  })
  it('Ex-3 with the slide’s rounded K = 3.52, R = 289: each = 1058.5 (π, not 2π)', () => {
    const num = Math.PI * 3.52 * (61 ** 2 - 51.85 ** 2)
    expect(num / Math.log((289 * 289) / (0.23 * 7.5))).toBeCloseTo(1058.5, 0)
  })
  it('Ex-4: K = 43.5 m/d, drawdown at the well 1.23 m', () => {
    const K = kObsUnconfined({ Q: 1550, r1: 25, h1: 32.7, r2: 50, h2: 32.82 })
    expect(K).toBeCloseTo(43.5, 1)
    const d = dAtWell({ Q: 1550, K, h1: 32.7, r1: 25, rw: 0.125 })
    expect(33 - d).toBeCloseTo(1.23, 2)
  })
  it('notes variant of Ex-4: K = 37.1, drawdown 1.2 m', () => {
    const K = kObsUnconfined({ Q: 1000, r1: 50, h1: 29.7, r2: 100, h2: 29.8 })
    expect(K).toBeCloseTo(37.08, 1)
    expect(30 - dAtWell({ Q: 1000, K, h1: 29.7, r1: 50, rw: 0.1 })).toBeCloseTo(1.2, 1)
  })
  it('round trips', () => {
    const Q = dupuitQ({ K: 12, D: 40, s: 5, rw: 0.1, R: 300 })
    expect(dupuitK({ Q, D: 40, s: 5, rw: 0.1, R: 300 })).toBeCloseTo(12, 10)
    expect(dupuitR({ Q, K: 12, D: 40, s: 5, rw: 0.1 })).toBeCloseTo(300, 6)
    expect(kObsConfined({ Q: 100, b: 10, r1: 5, h1: 20, r2: 50, h2: 23 })).toBeCloseTo((100 * Math.log(10)) / (2 * Math.PI * 10 * 3), 10)
    expect(qObsConfined({ K: 1e-3, b: 2.5, r1: 8, s1: 2.5, r2: 50, s2: 0.6 })).toBeCloseTo((2 * Math.PI * 1e-3 * 2.5 * 1.9) / Math.log(50 / 8), 10)
  })
  it('confined interference raises ln term: two wells give less each', () => {
    const one = thiemQ({ K: 3.5, b: 30, s: 3, rw: 0.15, R: 750 })
    const each = interferenceConfinedQ({ K: 3.5, b: 30, s: 3, rw: 0.15, R: 750, a: 30 })
    expect(each).toBeLessThan(one)
    expect(each).toBeGreaterThan(one / 2)
  })
  it('storage volume 2022-23: 0.14 × 23 km² × 2.6 m = 8.372 × 10⁶ m³', () => {
    expect(storageVolume(0.14, 23e6, 2.6)).toBeCloseTo(8.372e6, 0)
  })
})

describe('drawdown curves', () => {
  const conf: Aquifer = { kind: 'confined', K: 3, thick: 30, rw: 0.15, R: 500 }
  const unc: Aquifer = { kind: 'unconfined', K: 3, thick: 30, rw: 0.15, R: 500 }
  it('curve hits the single-well drawdown at rw and zero at R', () => {
    for (const a of [conf, unc]) {
      const Q = yieldFor(a, 4)
      const c = drawdownCurve(a, Q)
      expect(c[0].s).toBeCloseTo(4, 6)
      expect(c[c.length - 1].s).toBeCloseTo(0, 6)
    }
  })
  it('two wells superpose: drawdown at one well exceeds the single-well drawdown', () => {
    const Q = yieldFor(conf, 4)
    const s2 = drawdownAt(conf, [{ x: 0, Q }, { x: 40, Q }], 0)
    expect(s2).toBeGreaterThan(4)
    expect(s2).toBeCloseTo(4 + (Q * Math.log(500 / 40)) / (2 * Math.PI * 3 * 30), 8)
    const u = drawdownAt(unc, [{ x: 0, Q }, { x: 40, Q }], 0)
    expect(u).toBeGreaterThan(4)
  })
})

describe('past-paper chains', () => {
  it('2023-24 Q7(b): Q = 2π K b s / ln(R/rw) = 2.23 ft³/s, both wells → drawdown 21.5 ft', () => {
    const p = { K: 0.001, b: 100, s: 18, rw: 0.5, R: 80 }
    const Q = thiemQ(p)
    expect(Q).toBeCloseTo(2.228, 2)
    const extra = (Q * Math.log(80 / 30)) / (2 * Math.PI * 0.001 * 100)
    expect(18 + extra).toBeCloseTo(21.48, 1)
  })
  it('2022-23 Q5(a): K = 7.26 m/d', () => {
    expect(thiemK({ Q: 950 * 1.44, b: 35, s: 7.5, rw: 0.15, R: 950 })).toBeCloseTo(7.26, 1)
  })
  it('2021-22 Q6(b): 52,000 m³/d', () => {
    expect(dupuitQ({ K: 40.5, D: 100, s: 20, rw: 0.15, R: 1000 })).toBeCloseTo(52022, -1)
  })
  it('2010-11 Q7(d): 16.3 L/s', () => {
    expect(qObsConfined({ K: 1e-3, b: 2.5, r1: 8, s1: 2.5, r2: 50, s2: 0.6 }) * 1000).toBeCloseTo(16.29, 1)
  })
})
