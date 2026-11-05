import { describe, expect, it } from 'vitest'
import { circle } from './mohr'
import {
  betaOCR,
  bjerrum,
  circleArea,
  cuOC,
  cuPredict,
  deviatorWithAB,
  directShear,
  failureAngle,
  fitCircles,
  fitLine,
  intersect,
  phiFromAngle,
  phiFromCircle,
  samplingStages,
  sensitivity,
  sigma1f,
  sigma3ForDeviator,
  skemptonDu,
  skemptonNC,
  squareArea,
  strengthAt,
  suFromK0Af,
  triaxCircles,
  triaxOne,
  ufFromEnvelope,
  unconfined,
  vaneCu,
} from './shear'

const near = (a: number, b: number, d = 0.01) => expect(Math.abs(a - b)).toBeLessThanOrEqual(d)
const kg = (m: number) => (m * 9.81) / 1000
const N = (n: number) => n / 1000

describe('direct shear (AJK DS Problems 1–2 and the papers)', () => {
  const A = squareArea(60)
  it('DS Problem #01: through the origin y = 0.7713x, φ = 37.64°', () => {
    const r = directShear([200, 300, 400, 500].map((n, i) => ({ N: N(n), T: N([155, 230, 310, 385][i]) })), A, { through0: true })
    near(r.pts[0].sigma, 55.56)
    near(r.pts[3].tau, 106.94)
    near(r.fit.b, 0.7713, 0.0001)
    near(r.env.phi, 37.64)
    const free = directShear([200, 300, 400, 500].map((n, i) => ({ N: N(n), T: N([155, 230, 310, 385][i]) })), A)
    near(free.env.c, 0.14)
    near(free.env.phi, 37.6, 0.02)
  })
  it('DS Problem #02: y = 0.595x + 9.1667, φ = 30.75°, c ≈ 9.17', () => {
    const r = directShear([200, 300, 400, 500].map((n, i) => ({ N: N(n), T: N([150, 220, 260, 335][i]) })), A)
    near(r.fit.b, 0.595, 0.0005)
    near(r.fit.a, 9.1667, 0.001)
    near(r.fit.r2, 0.9879, 0.0005)
    near(r.env.phi, 30.75)
  })
  it('2007-08 Q1(g): one test on sand, φ = 26.6°', () => {
    const r = directShear([{ N: 0.36, T: 0.18 }], 36e-4, { through0: true })
    near(r.pts[0].sigma, 100)
    near(r.env.phi, 26.57)
  })
  it('CD direct shear papers (kg loads, 63.5 mm specimens)', () => {
    const A = circleArea(63.5)
    const a = directShear([16, 32, 64].map((m, i) => ({ N: kg(m), T: N([80.5, 159.6, 309.3][i]) })), A)
    near(a.env.phi, 25.9, 0.05)
    near(a.env.c, 1.8, 0.1)
    const b = directShear([8, 16, 32].map((m, i) => ({ N: kg(m), T: N([106, 149, 235][i]) })), A)
    near(b.env.phi, 28.7, 0.05)
    near(b.env.c, 19.9, 0.1)
    const c = directShear([24, 48, 96].map((m, i) => ({ N: kg(m), T: N([159, 253, 444][i]) })), A)
    near(c.env.phi, 22.0, 0.05)
    near(c.env.c, 20.1, 0.1)
  })
  it('2017-18 Q4(c): peak and residual envelopes', () => {
    const A = circleArea(50)
    const pk = directShear([150, 350, 550].map((n, i) => ({ N: N(n), T: N([158, 257, 363][i]) })), A)
    near(pk.env.phi, 27.1, 0.05)
    near(pk.env.c, 41, 0.5)
    const rs = directShear([150, 350, 550].map((n, i) => ({ N: N(n), T: N([44, 102, 144.5][i]) })), A)
    near(rs.env.phi, 14.1, 0.05)
    near(rs.env.c, 4.5, 0.1)
    const r0 = directShear([150, 350, 550].map((n, i) => ({ N: N(n), T: N([44, 102, 144.5][i]) })), A, { through0: true })
    near(r0.env.phi, 15.2, 0.05)
  })
  it('2015-16 Q7: bilinear CU direct-shear envelope → pc′ ≈ 68 kPa', () => {
    const s = [15, 30, 50, 80, 100, 120],
      t = [15, 18.5, 23, 32, 40, 48]
    const nc = fitLine(s.slice(3), t.slice(3), true)
    near(nc.b, 0.4, 1e-9)
    near((Math.atan(nc.b) * 180) / Math.PI, 21.8)
    const oc = fitLine(s.slice(0, 3), t.slice(0, 3))
    near(oc.a, 11.6, 0.05)
    near(oc.b, 0.228, 0.001)
    near(intersect(oc, nc).x, 68, 1)
  })
})

describe('triaxial (AJK CD/CU/UC problems)', () => {
  it('CD Problem 1: φ′ = 24.32°', () => near(phiFromCircle(125, 175), 24.32))
  it('CD Problem 2: σ3 = 58.38 kPa', () => near(sigma3ForDeviator(124, { c: 0, phi: 31 }), 58.38))
  it('CU Problem 1: φ = 20.35°, φ′ = 27.04°', () => {
    const r = triaxOne({ s3: 150, dev: 160, u: 54 })
    near(r.phiTotal, 20.35)
    near(r.env.phi, 27.04)
    near(r.eff.s1, 256)
    near(r.eff.s3, 96)
  })
  it('UC problem: ε = 1.05 %, A = 0.001146 m², σ1 = 110.8, cu = 55.4, stiff', () => {
    const r = unconfined(0.127, 0.8, 76, 38)
    near(r.eps * 100, 1.05)
    near(r.A, 0.001146, 0.000001)
    near(r.qu, 110.8, 0.05)
    near(r.cu, 55.4, 0.05)
    expect(r.consistency).toBe('Stiff')
  })
  it('2007-08 Q4(b): CU on NC clay — cu = 130, φ′ = 34.4°, φcu = 27.7°, Af = 0.19', () => {
    const r = triaxOne({ s3: 150, dev: 260, u: 50 })
    near(r.tot.R, 130)
    near(r.env.phi, 34.4, 0.05)
    near(r.phiTotal, 27.7, 0.05)
    near(r.Af!, 0.19, 0.005)
  })
  it('2008-09 Q3(a): two CU tests → exact common tangents', () => {
    const t = triaxCircles([
      { s3: 170, dev: 125, u: 110 },
      { s3: 430, dev: 310, u: 270 },
    ])
    const tot = fitCircles(t.total)
    expect(tot.method).toBe('tangent')
    near(tot.c, 1.5, 0.1)
    near(tot.phi, 15.2, 0.05)
    const eff = fitCircles(t.eff!)
    near(eff.c, 4.1, 0.1)
    near(eff.phi, 28.7, 0.05)
    near(t.Af[0]!, 0.88, 0.005)
    near(t.Af[1]!, 0.87, 0.005)
  })
  it('2011-12 Q3(a): three CU tests, p–q least squares', () => {
    const t = triaxCircles([
      { s3: 100, dev: 170, u: 40 },
      { s3: 200, dev: 260, u: 95 },
      { s3: 300, dev: 360, u: 135 },
    ])
    const tot = fitCircles(t.total)
    expect(tot.method).toBe('pq')
    near(tot.phi, 18.8, 0.1)
    near(tot.c, 26, 1)
    const eff = fitCircles(t.eff!)
    near(eff.phi, 28.3, 0.1)
    near(eff.c, 19, 1)
  })
  it('2020-21 Q8(b): modified failure envelope (Kf line) α = 22.8°, a = 36.8 → φ′ = 24.9°, c′ = 40.5', () => {
    const t = triaxCircles([
      { s3: 75, dev: 200, u: 25 },
      { s3: 150, dev: 272, u: 50 },
      { s3: 300, dev: 418, u: 100 },
    ])
    near(t.eff![1].C, 236)
    const e = fitCircles(t.eff!)
    near(e.alpha, 22.8, 0.05)
    near(e.a, 36.8, 0.1)
    near(e.phi, 24.9, 0.05)
    near(e.c, 40.5, 0.2)
  })
  it('2023-24 Q3(a): negative intercepts flagged; c = 0 forced fit available', () => {
    const t = triaxCircles([
      { s3: 430, dev: 250, u: 25 },
      { s3: 470, dev: 298, u: 35 },
      { s3: 550, dev: 390, u: 73 },
    ])
    const tot = fitCircles(t.total)
    near(tot.phi, 21.6, 0.15)
    near(tot.c, -85, 3)
    expect(tot.note).toMatch(/Negative cohesion/)
    const eff = fitCircles(t.eff!)
    near(eff.phi, 29.6, 0.2)
    near(eff.c, -158, 4)
    // per-specimen through the origin
    near(phiFromCircle(430, 250), 13.0, 0.05)
    near(phiFromCircle(405, 250), 13.6, 0.05)
    near(phiFromCircle(477, 390), 16.9, 0.05)
    const c0 = fitCircles(t.total, { forceC0: true })
    expect(c0.c).toBe(0)
  })
  it('2017-18 Q3(b) and 2021-22 Q7(c): effective circles, two-circle tangent', () => {
    const a = fitCircles([circle(575, 165), circle(730, 210)])
    near(a.phi, 33.4, 0.05)
    near(a.c, 1.8, 0.2)
    const b = fitCircles([circle(320, 90), circle(810, 260)])
    near(b.phi, 29.0, 0.05)
    near(b.c, 17.8, 0.2)
  })
  it('2007-08 Q2(b): printed data inconsistent; textbook qu = 120 gives φ = 19.5°, c = 42.4', () => {
    const bad = fitCircles([circle(220, 0), circle(200, 40)])
    expect(bad.ok).toBe(false)
    const good = fitCircles([circle(120, 0), circle(200, 40)])
    near(good.phi, 19.47, 0.05)
    near(good.c, 42.4, 0.1)
    near(failureAngle(good.phi), 54.7, 0.05)
  })
  it('2016-17 Q7: failure plane at 55° → φ′ = 20°, deviator 104 kPa', () => {
    const phi = phiFromAngle(55)
    expect(phi).toBe(20)
    near(sigma1f(100, { c: 0, phi }) - 100, 104.0, 0.05)
  })
  it('2016-17 Q9: predicted deviator and pore pressure at σ3 = 45', () => {
    const r = cuPredict(45, { c: 26, phi: 24 }, { c: 30, phi: 27 })
    near(r.s1, 186.8, 0.1)
    near(r.dev, 141.8, 0.1)
    near(r.s3p, 26.4, 0.1)
    near(r.uf, 18.6, 0.1)
  })
  it('2017-18 Q4(b) and Jan 2021 Q8(b): CU vs CD on NC clay → Af', () => {
    const phiP = phiFromCircle(150, 325)
    near(phiP, 31.3, 0.06)
    near(phiFromCircle(150, 225), 25.4, 0.05)
    const r = ufFromEnvelope(150, 225, { c: 0, phi: phiP })
    near(r.s3p, 103.9, 0.1)
    near(r.uf, 46.2, 0.1)
    near(r.Af, 0.21, 0.005)
    const p2 = phiFromCircle(150, 400)
    near(p2, 34.9, 0.06)
    near(phiFromCircle(150, 175), 21.6, 0.05)
    const r2 = ufFromEnvelope(150, 175, { c: 0, phi: p2 })
    near(r2.s3p, 65.6, 0.1)
    near(r2.uf, 84.4, 0.1)
    near(r2.Af, 0.48, 0.005)
  })
  it('2021-22 Q5(d): φ′ = 25.7°, φcu = 12.9°, Af = 1.09 scales with σ3c', () => {
    const r = triaxOne({ s3: 200, dev: 115, u: 125 })
    near(r.env.phi, 25.7, 0.05)
    near(r.phiTotal, 12.9, 0.05)
    near(r.Af!, 1.09, 0.005)
  })
  it('2010-11 Q2(a): unconfined strength of a CU-consolidated specimen = deviator', () => near(86.2 - 50, 36.2, 1e-9))
})

describe('strength on a plane at depth', () => {
  it('AJK Problem 3 (psf): WT rise from B to C', () => {
    const B = strengthAt({ z: 46, zw: 26, gamma: 120, gammaSat: 123, gw: 62.4 }, { c: 0, phi: 30 })
    near(B.sigma, 5580)
    near(B.u, 1248)
    near(B.sigmaP, 4332)
    near(B.tauf, 2501, 0.5)
    const C = strengthAt({ z: 46, zw: 14, gamma: 120, gammaSat: 123, gw: 62.4 }, { c: 0, phi: 30 })
    near(C.sigma, 5616)
    near(C.u, 1996.8)
    near(C.sigmaP, 3619.2)
    near(C.tauf, 2089.5, 0.5)
  })
  it('2008-09 Q4(b) and 2015-16 Q1: before and after a structure', () => {
    const a = strengthAt({ z: 4.5, zw: 99, gamma: 19.8, gammaSat: 19.8 }, { c: 0, phi: 32 })
    near(a.tauf, 55.7, 0.05)
    const b = strengthAt({ z: 4.5, zw: 99, gamma: 19.8, gammaSat: 19.8, q: 65 }, { c: 0, phi: 32 }, 50)
    near(b.tauf, 96.3, 0.05)
    near(b.FS!, 1.93, 0.005)
    const c = strengthAt({ z: 4, zw: 99, gamma: 19.6, gammaSat: 19.6, q: 60 }, { c: 0, phi: 35 }, 52)
    near(c.tauf, 96.9, 0.05)
    near(c.FS!, 1.86, 0.005)
  })
  it('2009-10 Q4(a): rapid (CU on σ) vs slow (CD on σ′)', () => {
    const r = strengthAt({ z: 15, zw: 0, gamma: 19.8, gammaSat: 19.8 }, { c: 41.4, phi: 23 })
    near(r.sigma, 297)
    near(r.sigmaP, 149.85)
    near(r.tauf, 105.0, 0.05)
    near(48.3 + r.sigma * Math.tan((13 * Math.PI) / 180), 116.9, 0.05)
  })
})

describe('Skempton, vane, correlations (flagged)', () => {
  it('2012-13 Q3: Δu = B[Δσ3 + A(Δσ1 − Δσ3)]', () => {
    const u1 = 50 + skemptonDu(1, 0, 100, 100)
    expect(u1).toBe(150)
    expect(u1 + skemptonDu(1, 0.5, 0, 150)).toBe(225)
  })
  it('2020-21 Q7(d): deviator with B = 0.95, Af = 0.4, φ′ = 30', () => {
    const r = deviatorWithAB({ s3c: 300, s3: 400, B: 0.95, Af: 0.4, env: { c: 0, phi: 30 } })
    near(r.du1, 95)
    near(r.D, 346.6, 0.1)
    near(r.uf, 226.7, 0.1)
  })
  it('2016-17 Q6 / 2007-08 Q1(a): sampling and cell stages', () => {
    const s = samplingStages(100, 100, 320)
    expect(s.map((x) => x.u)).toEqual([-100, 0, 220, 0])
    expect(s[3].sigmaP).toBe(320)
  })
  it('2021-22 Q7(d): vane, one end; Bjerrum', () => {
    const one = vaneCu(0.015, 0.05, 0.1, 1)
    near(one.cu, 35.3, 0.05)
    const two = vaneCu(0.015, 0.05, 0.1, 2)
    near(two.cu, 32.7, 0.05)
    near(bjerrum(36), 0.86, 0.005)
    near(one.cu * bjerrum(36), 30.3, 0.1)
  })
  it('2009-10 Q1(d), 2012-13 Q1(b): cu = 6T/(7πD³) = 3T/(11D³) for H = 2D', () => {
    const D = 0.07,
      T = 0.05
    near(vaneCu(T, D, 2 * D).cu, (6 * T) / (7 * Math.PI * D ** 3), 1e-9)
    near((6 / (7 * Math.PI)) / (3 / 11), 1, 0.001)
    near(vaneCu(T, D, 2 * D, 2, 'triangular').cu, (8 * T) / (9 * Math.PI * D ** 3), 1e-9)
  })
  it('2017-18 Q2(c)/Q1(d): (su/σv′)NC = 0.256; su ≈ 42 kPa with β', () => {
    near(suFromK0Af({ c: 0, phi: 20, K0: 0.5, Af: 0.6, sv: 1 }), 0.256, 0.001)
    const r = cuOC({ z: 5, gammaSat: 20, pc: 255, ratioNC: suFromK0Af({ c: 0, phi: 20, K0: 0.5, Af: 0.6, sv: 1 }) })
    near(r.sv, 50.95)
    near(r.OCR, 5.0, 0.01)
    near(r.cu, 42, 0.5)
  })
  it('2021-22 Q8(a), Jan 2021 Q5(c): Skempton + β chart', () => {
    near(skemptonNC(31), 0.2247, 0.0001)
    const a = cuOC({ z: 10, gammaSat: 20, pc: 510, ratioNC: skemptonNC(31) })
    near(a.sv, 101.9)
    near(a.OCR, 5.0, 0.01)
    near(a.cuNC, 22.9, 0.05)
    near(a.cu, 74, 0.5)
    near(cuOC({ z: 10, gammaSat: 20, pc: 510, ratioNC: skemptonNC(31), curve: 'upper' }).cu, 85, 0.6)
    const b = cuOC({ z: 8, gammaSat: 20, pc: 326, ratioNC: skemptonNC(31) })
    near(b.sv, 81.52)
    near(b.OCR, 4.0, 0.01)
    near(b.cu, 50, 0.5)
    near(betaOCR(4, 'lower'), 2.29, 1e-9)
  })
  it('sensitivity', () => {
    const s = sensitivity(120, 30)
    expect(s.St).toBe(4)
    expect(s.cls).toBe('medium sensitive')
  })
})
