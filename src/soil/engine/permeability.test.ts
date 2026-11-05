import { describe, expect, it } from 'vitest'
import { capRiseTube, constantHead, darcy, fallingHead, fallTime, hazen, kAtTemp, layered, porosityFromDry, pumpConfined, pumpUnconfined, qConfined, qUnconfined, scaleFallTime, viscosity } from './permeability'

const near = (a: number, b: number, rel = 0.005, abs = 1e-12) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('permeameters', () => {
  it('2012-13 Q10(c) / 2008-09 Q8(c): k = 1.06e-2 cm/s, v = 0.0283, n = 0.377, vs = 0.075 cm/s', () => {
    const c = constantHead({ Q: 500, L: 15, h: 40, t: 900, D: 5 })
    near(c.A, 19.63, 0.001)
    near(c.k, 1.06e-2, 0.005)
    near(c.v, 0.0283, 0.003)
    const n = porosityFromDry(486, 2.65, c.A * 15)
    near(n, 0.377, 0.003)
    near(darcy({ k: c.k, i: c.i, n }).vs, 0.075, 0.005)
  })
  it('2011-12 Q6(c): 50 → 48 cm in 5 min, so 50 → 25 cm takes 84.9 min', () => near(scaleFallTime(5, 50, 48, 25), 84.9, 0.001))
  it('falling head k and time are inverses', () => {
    const f = fallingHead({ L: 10, h1: 100, h2: 40, t: 600, d: 0.5, D: 7.5 })
    near(fallTime({ k: f.k, a: f.a, A: f.A, L: 10, h1: 100, h2: 40 }), 600, 1e-9)
  })
})

describe('layered deposits', () => {
  it('2020-21 Q2(a): kv = 4.0e-4 cm/s; 6.79 cm³ in 5 min with i = 2', () => {
    const l = layered([
      { H: 5, k: 3e-4 },
      { H: 5, k: 4e-4 },
      { H: 5, k: 6e-4 },
    ])
    near(l.kv, 4e-4, 1e-9)
    near(darcy({ k: l.kv, i: 30 / 15, A: (Math.PI / 4) * 36 }).q * 300, 6.79, 0.002)
    const s = l.hShare.reduce((a, b) => a + b, 0)
    near(s, 1, 1e-12)
  })
  it('Das 5.20: kh/kv ≈ 134 and kh ≥ kv always', () => {
    const l = layered([
      { H: 3, k: 1e-4 },
      { H: 4, k: 3.2e-2 },
      { H: 6, k: 4.1e-5 },
    ])
    near(l.ratio, 134.2, 0.003)
    expect(l.kh).toBeGreaterThan(l.kv)
  })
})

describe('other', () => {
  it('temperature: k27 = k20 η20/η27 (η20 = 1.002, η27 = 0.852 cP)', () => {
    near(viscosity(20), 1.002, 1e-9)
    near(kAtTemp(1e-3, 20, 27), 1e-3 * (1.002 / 0.852), 1e-9)
  })
  it('Hazen: D10 = 0.1 mm → k ≈ 0.01 cm/s (C = 100)', () => near(hazen(0.1), 0.01, 1e-9))
  it('pumping tests invert', () => {
    const k = pumpUnconfined({ q: 0.02, r1: 15, r2: 60, h1: 5.5, h2: 6.2 })
    near(qUnconfined({ k, r1: 15, r2: 60, h1: 5.5, h2: 6.2 }), 0.02, 1e-9)
    const kc = pumpConfined({ q: 0.02, r1: 15, r2: 60, h1: 5.5, h2: 6.2, T: 4 })
    near(qConfined({ k: kc, r1: 15, r2: 60, h1: 5.5, h2: 6.2, T: 4 }), 0.02, 1e-9)
  })
  it('capillary rise: d = 0.01 mm → ≈ 2.97 m (hc ≈ 0.3/d cm with d in cm)', () => {
    near(capRiseTube(1e-5), 2.97, 0.003)
    near(capRiseTube(1e-5) * 100, 0.3 / 1e-3, 0.02)
  })
})
