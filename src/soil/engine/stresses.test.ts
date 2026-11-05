import { describe, expect, it } from 'vitest'
import { GW } from './units'
import { eFromN, excavationHeave, filterDepth, gsubFromGsE, icrFromGsat, icrFromGsE, profile, stressAt } from './stresses'

const near = (a: number, b: number, rel = 0.005, abs = 0.01) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('stress profiles', () => {
  const p2021 = {
    layers: [
      { name: 'Clay', H: 3, gamma: 15, gammaSat: 18 },
      { name: 'Sand', H: 7, gamma: 20, gammaSat: 20 },
    ],
    wt: 2,
  }
  it('2020-21 Q2(b): (σ, u, σ′) = (30, 0, 30) at 2 m, (48, 9.81, 38.2) at 3 m, (188, 78.5, 109.5) at 10 m', () => {
    const at = (z: number) => stressAt(p2021, z)
    near(at(2).sigma, 30)
    near(at(2).u, 0)
    near(at(3).sigma, 48)
    near(at(3).u, 9.81)
    near(at(3).eff, 38.19)
    near(at(10).sigma, 188)
    near(at(10).u, 78.48)
    near(at(10).eff, 109.52)
    expect(profile(p2021).map((x) => x.z)).toEqual([0, 2, 3, 10])
  })
  it('2012-13 Q10(b): σ′ under standing water does not depend on its depth', () => {
    const p = (wt: number) => ({ layers: [{ name: 's', H: 6, gamma: 19, gammaSat: 19 }], wt })
    near(stressAt(p(-1), 4).eff, stressAt(p(-10), 4).eff, 1e-12)
    near(stressAt(p(-10), 4).eff, 4 * (19 - GW))
  })
  it('lecture 14 (Das Fig 6.7): water 0.7 m above a 2 m layer, 1.5 m upward head: σ′A = 3.43, σ′B = 6.85 kPa', () => {
    const p = { layers: [{ name: 'sand', H: 2, gamma: 20.58, gammaSat: 20.58 }], wt: -0.7, flow: { layer: 0, dh: 1.5 } }
    near(stressAt(p, 1).sigma, 27.46)
    near(stressAt(p, 1).u, 24.03)
    near(stressAt(p, 2).u, 41.2)
    near(stressAt(p, 2).eff, 48.05 - 41.2, 0.01, 0.02)
  })
  it('capillary zone: u jumps from 0 to −hcγw at its top, σ′ jumps by hcγw', () => {
    const p = { layers: [{ name: 'silt', H: 8, gamma: 17, gammaSat: 19 }], wt: 4, hc: 1.5 }
    const a = stressAt(p, 2.5, 'above')
    const b = stressAt(p, 2.5, 'below')
    near(a.u, 0)
    near(b.u, -1.5 * GW)
    near(b.eff - a.eff, 1.5 * GW)
    near(stressAt(p, 4).sigma, 2.5 * 17 + 1.5 * 19)
    expect(profile(p).length).toBe(5)
  })
})

describe('quick condition and filters', () => {
  it('2007-08 Q7(c): icr = 1.68/1.80 = 0.93', () => near(icrFromGsE(2.68, 0.8), 0.933, 0.001))
  it('2023-24 Q6(c): γsat 18 → icr = 0.835', () => near(icrFromGsat(18), 0.835, 0.001))
  it('2012-13 Q10(d): γ′ = 10.52, FS0 = 0.74, filter 2.11 m for FS = 2', () => {
    const gsub = gsubFromGsE(2.65, eFromN(0.35))
    near(gsub, 10.52, 0.001)
    const f = filterDepth({ gsub, L: 1.25, h: 1.8, FS: 2 })
    near(f.FS0, 0.74, 0.01)
    near(f.z, 2.11, 0.003)
  })
  it('2009-10 Q6(c): FS0 = 1.13, filter 1.54 m', () => {
    const f = filterDepth({ gsub: gsubFromGsE(2.65, eFromN(0.35)), L: 2, h: 1.9, FS: 2 })
    near(f.FS0, 1.13, 0.005)
    near(f.z, 1.54, 0.005)
  })
})

describe('excavation heave', () => {
  it('2023-24 Q5(b): u = 68.67 kPa, safe depth 2.96 m (2.15 m with FS 1.2)', () => {
    const o = { Hc: 7, gSat: 17, wt: 0 }
    const r = excavationHeave(o, 0, 1.2)
    near(r.u, 68.67)
    near(r.dMax, 2.96, 0.002)
    near(r.dSafe, 2.15, 0.003)
  })
  it('2021-22 Q2(b): at 9 m, 55.5 vs 117.7 kPa, FS 0.47; dmax 5.64 m; head must drop ≥ 6.34 m', () => {
    const r = excavationHeave({ Hc: 12, gSat: 18.5, wt: 0 }, 9)
    near(r.W, 55.5)
    near(r.u, 117.72)
    near(r.FS, 0.471, 0.003)
    near(r.dMax, 5.64, 0.002)
    near(r.drawdown, 6.34, 0.002)
  })
})
