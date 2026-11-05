import { describe, expect, it } from 'vitest'
import { circle, circleFromTangentPoint, elementFromPrincipal, failurePlane, fsOnPlane, maxObliquity, mohr, obliquity, onPlane, onPlaneFromPrincipal, touches } from './mohr'
import { phiFromCircle } from './shear'

const near = (a: number, b: number, d = 0.01) => expect(Math.abs(a - b)).toBeLessThanOrEqual(d)

describe('Mohr circle and pole', () => {
  it('AJK CD Problem 3 (slides 48–49): σ3 = 172, Δσ = 227', () => {
    const c = circle(399, 172)
    const phi = phiFromCircle(172, 227)
    near(phi, 23.42)
    const fp = failurePlane(c, phi)
    near(fp.theta, 56.71)
    near(fp.x, 45.11, 0.02) // slide rounds θ first
    near(fp.tau, 104.15)
    near(fp.sigma, 240.39, 0.02)
    // eq. 10.8 at θ gives the same σ
    near(onPlaneFromPrincipal(399, 172, fp.theta).sigma, 240.39, 0.02)
  })
  it('2012-13 Q4: CD sand σ3 = 100, Δσ = 250 — failure plane, τmax, obliquity, FS on the τmax plane', () => {
    const c = circle(350, 100)
    const phi = phiFromCircle(100, 250)
    near(phi, 33.75, 0.01)
    const fp = failurePlane(c, phi)
    near(fp.theta, 61.9, 0.05)
    near(fp.sigma, 155.6, 0.1)
    near(fp.tau, 103.9, 0.1)
    const m = mohr(elementFromPrincipal(350, 100))
    near(m.tauMax, 125)
    const p45 = onPlane(elementFromPrincipal(350, 100), 45)
    near(p45.sigma, 225)
    near(obliquity(p45.sigma, p45.tau), 29.05)
    near(maxObliquity(c), phi)
    near(fsOnPlane(p45.sigma, p45.tau, { c: 0, phi }), 1.2, 0.005)
  })
  it('2012-13 Q5: circle tangent at the direct-shear point (200, 130), c = 30', () => {
    const phi = (Math.atan(100 / 200) * 180) / Math.PI
    near(phi, 26.57)
    const c = circleFromTangentPoint(200, 130, phi)
    near(c.C, 265, 0.05)
    near(c.R, 145.3, 0.05)
    near(c.s1, 410.3, 0.1)
    near(c.s3, 119.7, 0.1)
    expect(touches(c, { c: 30, phi }).margin).toBeCloseTo(0, 6)
  })
  it('general element: principal stresses, pole property for every plane', () => {
    const st = { sx: 50, sz: 100, txz: 20 }
    const m = mohr(st)
    near(m.C, 75)
    near(m.R, Math.hypot(25, 20))
    const pm = onPlane(st, m.thMajor)
    near(pm.sigma, m.s1, 1e-9)
    near(pm.tau, 0, 1e-9)
    const pn = onPlane(st, m.thMinor)
    near(pn.sigma, m.s3, 1e-9)
    for (const th of [-70, -30, 10, 40, 80]) {
      const p = onPlane(st, th)
      const ang = (Math.atan2(p.tau - m.pole.tau, p.sigma - m.pole.sigma) * 180) / Math.PI
      const diff = (((ang - th) % 180) + 180) % 180
      expect(Math.min(diff, 180 - diff)).toBeLessThan(1e-6)
      // on the circle
      near(Math.hypot(p.sigma - m.C, p.tau), m.R, 1e-9)
    }
  })
  it('principal element: pole at (σ3, 0) when σ1 is vertical', () => {
    const m = mohr(elementFromPrincipal(300, 100, 0))
    near(m.pole.sigma, 100, 1e-9)
    near(m.pole.tau, 0, 1e-9)
    near(m.thMajor, 0, 1e-9)
    const r = mohr(elementFromPrincipal(300, 100, 30))
    near(r.thMajor, 30, 1e-9)
  })
})
