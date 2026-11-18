import { describe, expect, it } from 'vitest'
import { closureTimeFor, criticalTime, hammerRise, simulate, waveSpeed, waveSpeedRigid, G } from './hammer'

const near = (a: number, b: number, rel = 0.01) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.abs(b) * rel)

describe('wave speed and Joukowsky (textbook)', () => {
  it('rigid pipe: 1480 m/s', () => near(waveSpeedRigid(), 1479.9, 0.001))
  it('steel pipe D 0.5 m, t 10 mm, E 200 GPa: 1190 m/s', () => {
    near(waveSpeed({ D: 0.5, t: 0.01, E: 200e9 }), 1189.6, 0.002)
  })
  it('dp = rho a dv: 2 m/s stopped at a = 1000 m/s is 2 MPa, 204 m of water', () => {
    const r = hammerRise({ L: 1000, a: 1000, dv: 2, T: 1 })
    expect(r.rapid).toBe(true)
    near(r.dp, 2e6, 1e-9)
    near(r.dH, 2e6 / (1000 * G), 1e-9)
  })
  it('critical time 2L/a; slower closing gives a smaller rise, proportional to 1/T', () => {
    near(criticalTime(1000, 1000), 2, 1e-12)
    const a = hammerRise({ L: 1000, a: 1000, dv: 2, T: 10 })
    expect(a.rapid).toBe(false)
    near(a.dp, 2e6 / 5, 1e-9)
    const b = hammerRise({ L: 1000, a: 1000, dv: 2, T: 20 })
    near(b.dp, a.dp / 2, 1e-9)
  })
  it('closureTimeFor inverts Michaud', () => {
    const T = closureTimeFor(1000, 2, 40)
    near(hammerRise({ L: 1000, a: 1000, dv: 2, T }).dH, 40, 1e-9)
  })
})

describe('method of characteristics', () => {
  const base = { L: 1000, a: 1000, D: 0.5, v0: 2, H0: 50, tEnd: 20 }
  it('sudden closure: the valve head jumps by a v0 / g (about 204 m) and the wave returns every 4L/a = 4 s', () => {
    const s = simulate({ ...base, T: 1e-6 })
    near(s.Hmax - 50, (1000 * 2) / G, 0.01)
    // the head at the valve is high for the first 2L/a then drops back
    const iHalf = Math.round(1 / s.dt) // t = 1 s
    near(s.Hv[iHalf] - 50, (1000 * 2) / G, 0.01)
    const iAfter = Math.round(3 / s.dt) // t = 3 s, after the reflection from the reservoir the head has fallen
    expect(s.Hv[iAfter]).toBeLessThan(50)
  })
  it('slow closure (10 x 2L/a) gives a peak near the Michaud figure, far below Joukowsky', () => {
    const T = 20
    const s = simulate({ ...base, T, tEnd: 30 })
    const mich = hammerRise({ L: 1000, a: 1000, dv: 2, T }).dH
    expect(s.Hmax - 50).toBeLessThan(0.35 * ((1000 * 2) / G))
    // Michaud is the conservative textbook estimate: the simulated peak sits below it but within a factor of about three
    expect(s.Hmax - 50).toBeLessThan(mich)
    expect(s.Hmax - 50).toBeGreaterThan(0.3 * mich)
  })
  it('a surge tank at the valve cuts the peak; a relief valve cuts it too', () => {
    const plain = simulate({ ...base, T: 1, tEnd: 10 })
    const tank = simulate({ ...base, T: 1, tEnd: 10, protect: { surgeArea: 20 } })
    const relief = simulate({ ...base, T: 1, tEnd: 10, protect: { reliefSet: 80, reliefSize: 1 } })
    expect(tank.Hmax).toBeLessThan(0.8 * plain.Hmax)
    expect(relief.Hmax).toBeLessThan(0.9 * plain.Hmax)
  })
  it('an open valve leaves the line at rest equilibrium (no spurious waves)', () => {
    const s = simulate({ ...base, T: 1e9, tEnd: 5 })
    near(s.Hmax, 50, 1e-6)
    near(s.Hmin, 50, 1e-6)
  })
})
