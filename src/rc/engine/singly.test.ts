import { describe, expect, it } from 'vitest'
import { barFit, beamLoads, designAs, designSection, epsTForRho, limits, pickBars, review, rhoForEpsT, stageAt, stagesData } from './singly'

const close = (v: number, target: number, rel = 0.01) => expect(Math.abs(v - target) / Math.abs(target)).toBeLessThan(rel)

describe('steel-ratio limits — 2023-24 Q2(b) / 2020-21 Q2(b)', () => {
  const L = limits(4000, 60000)
  it('ρb = 0.0285, ρ0.004 = 0.0206, ρ0.005 = 0.0181, ρmin = 0.00333', () => {
    close(L.rhoB, 0.0285, 0.003)
    close(L.rhoMax, 0.0206, 0.003)
    close(L.rho005, 0.0181, 0.003)
    close(L.rhoMin, 0.00333, 0.003)
  })
  it('ρ(εt) and εt(ρ) are inverses', () => {
    close(epsTForRho(4000, 60000, rhoForEpsT(4000, 60000, 0.0062)), 0.0062, 1e-9)
  })
  it('f′c = 5 ksi: ρ0.004 = 0.0243', () => close(limits(5000, 60000).rhoMax, 0.0243, 0.005))
})

describe('review — Nilson Ex 4.4 (b = 10, d = 23, 3 #8)', () => {
  const r = review({ b: 10, fc: 4000, fy: 60000, layers: [{ As: 2.37, d: 23 }] })
  it('a = 4.18, c = 4.92, c/dt = 0.215', () => {
    close(r.a, 4.18, 0.003)
    close(r.c, 4.92, 0.003)
    close(r.cOverDt, 0.215, 0.01)
  })
  it('Mn = 2970 in-k = 248 k-ft, φ = 0.9', () => {
    close(r.Mn * 12, 2970, 0.003)
    expect(r.phi).toBe(0.9)
    expect(r.zone).toBe('tension')
  })
})

describe('review — Nilson Ex 4.5 transition zone (b = 12, d = 17.5, 4 #9)', () => {
  const r = review({ b: 12, fc: 4000, fy: 60000, layers: [{ As: 4, d: 17.5 }] })
  it('a = 5.88, c = 6.92, εt = 0.00458', () => {
    close(r.a, 5.88, 0.003)
    close(r.c, 6.92, 0.003)
    close(r.epsT, 0.00458, 0.005)
  })
  it('Mn = 3490 in-k; φ ≈ 0.87 (0.483 + 83.3εt); φMn ≈ 3040 in-k', () => {
    close(r.Mn * 12, 3490, 0.003)
    expect(Math.abs(r.phi - (0.483 + 83.3 * r.epsT))).toBeLessThan(0.002)
    expect(Math.abs(r.phi - 0.87)).toBeLessThan(0.01)
    close(r.phiMn * 12, 3040, 0.012)
    expect(r.zone).toBe('transition')
  })
})

describe('review — past papers', () => {
  it('2023-24 Q1(b)(iv): a 2.66, c 3.54, Mn 271 k-ft, εs 0.0127', () => {
    const r = review({ b: 14, fc: 6000, fy: 60000, layers: [{ As: 3.16, d: 18.5 }] })
    close(r.b1, 0.75, 1e-9)
    close(r.a, 2.66, 0.005)
    close(r.c, 3.54, 0.005)
    close(r.Mn, 271, 0.005)
    close(r.epsS, 0.0127, 0.01)
  })
  it('2021-22 Q5(b)(iv): Mn ≈ 300 k-ft, c ≈ 5.93, εs ≈ 0.0059', () => {
    const r = review({ b: 14, fc: 4000, fy: 60000, layers: [{ As: 4, d: 17.5 }] })
    close(r.Mn, 300, 0.01)
    close(r.c, 5.93, 0.005)
    close(r.epsS, 0.0059, 0.01)
  })
  it('2020-21 Q4(b): two rows, c 10.1, εt 0.0046, φ 0.866, Mn 799, φMn 691', () => {
    const r = review({ b: 14, fc: 5000, fy: 60000, layers: [{ As: 4, d: 25.5 }, { As: 4, d: 22.5 }] })
    close(r.d, 24, 1e-9)
    close(r.dt, 25.5, 1e-9)
    close(r.c, 10.1, 0.005)
    close(r.epsT, 0.0046, 0.01)
    close(r.phi, 0.866, 0.003)
    close(r.Mn, 799, 0.003)
    close(r.phiMn, 691, 0.005)
  })
  it('over-reinforced: steel does not yield → quadratic, φ = 0.65', () => {
    const r = review({ b: 10, fc: 4000, fy: 60000, layers: [{ As: 8, d: 18 }] })
    expect(r.yields).toBe(false)
    expect(r.fs).toBeLessThan(60)
    // equilibrium 0.85 f'c a b = As fs
    close(0.85 * 4 * r.a * 10, 8 * r.fs, 1e-6)
    expect(r.phi).toBe(0.65)
    expect(r.maxOk).toBe(false)
  })
})

describe('design', () => {
  it('Nilson Ex 4.6: wu = 4.96, Mu = 1670 in-k, bd² ≈ 2040, d = 14.3 (b = 10), As = 2.59', () => {
    const L = beamLoads({ span: 15, support: 'ss', sdl: 1.27, ll: 2.15 })
    close(L.wu, 4.96, 0.002)
    close(L.Mu * 12, 1670, 0.005) // book rounds wu to 4.96
    const s = designSection(L.Mu, 4000, 60000, limits(4000, 60000).rho005, { b: 10 })
    close(s.bd2, 2040, 0.005)
    close(s.d, 14.3, 0.005)
    close(s.As, 2.59, 0.005)
    expect(s.phi).toBe(0.9)
  })
  it('Ex 4.6 refined at d = 15.5 in: As ≈ 2.31 in² (handnote iteration converges to it)', () => {
    const d = designAs(1670 / 12, 10, 15.5, 4000, 60000)
    close(d.As, 2.31, 0.01)
    close(d.iter[3].As, d.AsCalc, 0.005)
    expect(d.phi).toBe(0.9)
  })
  it('2023-24 Q3(a): 12 × 25, 25 ft, SDL 1.0, LL 2.0 → wu 4.78, Mu 373, ρ ≈ 0.0159 (d = 22.5)', () => {
    const L = beamLoads({ span: 25, support: 'ss', b: 12, h: 25, sdl: 1, ll: 2 })
    close(L.sw, 0.3125, 1e-6)
    close(L.wu, 4.775, 0.002)
    close(L.Mu, 373, 0.003)
    const d = designAs(L.Mu, 12, 22.5, 4000, 60000)
    close(d.rho, 0.0159, 0.01)
    expect(d.needsComp).toBe(false)
    expect(d.epsT).toBeGreaterThan(0.005)
  })
  it('2021-22 Q4(a): factored loads, b = 12, ρ = 0.6ρmax → Mu 912, d ≈ 41.8', () => {
    const L = beamLoads({ span: 32, support: 'ss', sdl: 2.5, ll: 1.5, points: [{ D: 50, L: 0, x: 16 }], factored: true })
    close(L.Mu, 912, 0.002)
    const rho = 0.6 * limits(3500, 60000).rhoMax
    close(rho, 0.01084, 0.01)
    close(designSection(L.Mu, 3500, 60000, rho, { b: 12 }).d, 41.8, 0.01)
  })
  it('2020-21 Q6(a): third-point loads → Mu = 1128 k-ft', () => {
    const L = beamLoads({ span: 36, support: 'ss', sdl: 2.4, ll: 1.6, points: [{ D: 40, L: 0, x: 12 }, { D: 40, L: 0, x: 24 }], factored: true })
    close(L.Mu, 1128, 0.002)
  })
  it('too small a section flags compression steel', () => {
    expect(designAs(600, 12, 18, 4000, 60000).needsComp).toBe(true)
  })
  it('cantilever and fixed-end moments', () => {
    close(beamLoads({ span: 10, support: 'cant', sdl: 1, ll: 0, factored: true }).Mu, 50, 1e-9)
    const fx = beamLoads({ span: 12, support: 'fixed', sdl: 1, ll: 1, factored: true })
    close(fx.MuNeg, (2 * 144) / 12, 1e-9)
    close(fx.MuPos, (2 * 144) / 24, 1e-3)
  })
})

describe('bars', () => {
  it('4 #8 in a 12 in beam fits (b_min = 11.75), 5 #9 in 12 in does not', () => {
    const a = barFit(4, 8, 12)
    close(a.bmin, 3 + 0.75 + 4 + 3, 1e-9)
    expect(a.fits).toBe(true)
    expect(barFit(5, 9, 12).fits).toBe(false)
  })
  it('pickBars gives at least As', () => {
    const p = pickBars(3.5, 12)
    expect(p.As).toBeGreaterThanOrEqual(3.5)
  })
  it('mm bars', () => close(barFit(3, '20mm', 12).db, 20 / 25.4, 1e-9))
})

describe('loading stages', () => {
  const inp = { b: 10, h: 25, d: 23, As: 2.37, fc: 4000, fy: 60000, frPsi: 475 }
  const data = stagesData(inp)
  it('Mcr < My < Mult ≈ Mn (Whitney)', () => {
    expect(data.u.Mcr).toBeLessThan(data.My!)
    expect(data.My!).toBeLessThan(data.Mult)
    close(data.Mult, data.Mn, 0.03)
  })
  it('stages along the way', () => {
    expect(stageAt(data, inp, 30).stage).toBe('uncracked')
    const s90 = stageAt(data, inp, 90)
    expect(s90.stage).toBe('cracked')
    // fiber model at service ≈ cracked transformed section (Ex 4.2: fs 22.3 ksi, kd 7.6)
    close(s90.fs, 22.3, 0.04)
    close(s90.na, 7.63, 0.06)
    expect(stageAt(data, inp, data.Mult).stage).toBe('ultimate')
  })
})
