import { describe, expect, it } from 'vitest'
import { aciMoment, designRect, designT, effectiveWidth, floorLoads, reviewRect, reviewT, wsdT, wsdTDesign, wsdTj, wsdTReview } from './tbeam'

const near = (v: number, ref: number, tol = 0.01) => expect(Math.abs(v - ref)).toBeLessThanOrEqual(Math.abs(ref) * tol + 1e-9)

describe('effective flange width', () => {
  it('Nilson Ex 4.15: 16hf + bw = 59, 2(ln/8) + bw = 83, c/c 47 → 47', () => {
    const r = effectiveWidth({ kind: 'interior', L: 24, bw: 11, hf: 3, cc: 47 })
    expect(r.b).toBe(47)
    expect(r.governs).toBe('cc')
    expect(r.cands.find((c) => c.key === 'L4')!.value).toBe(83)
  })
  it('class floor problem: min(116, 84, 240) = 84', () => {
    expect(effectiveWidth({ kind: 'interior', L: 24, bw: 12, hf: 6.5, cc: 240 }).b).toBe(84)
  })
  it('2006-07 Q3(a)(i) with the 14th-ed rule: min(75, 76, 120) = 75', () => {
    expect(effectiveWidth({ kind: 'interior', L: 25, bw: 12, hf: 4, cc: 120, rule: 'aci08' }).b).toBe(75)
  })
  it('2016-17 Q8(a): T-beam 79 in, edge L-beam 39 in', () => {
    expect(effectiveWidth({ kind: 'interior', L: 32, bw: 15, hf: 4, cc: 144 }).b).toBe(79)
    const e = effectiveWidth({ kind: 'edge', L: 32, bw: 15, hf: 4, cc: 72 })
    expect(e.b).toBe(39)
    expect(e.governs).toBe('6hf')
  })
})

describe('T-beam review', () => {
  it('Nilson Ex 3.14 isolated T: Asf = 4.59, a = 7.13, φMn = 9370 in-k', () => {
    const r = reviewT({ beff: 28, bw: 10, hf: 6, d: 26, dt: 27.5, As: 7.62, fc: 3, fy: 60 })
    expect(r.rect).toBe(false)
    near(r.aRect, 6.4, 0.003)
    near(r.Asf, 4.59, 0.003)
    near(r.Mn1, 6330, 0.002)
    near(r.a, 7.13, 0.003)
    near(r.Mn2, 4080, 0.003)
    near(r.c, 8.39, 0.003)
    near(r.phiMn * 12, 9370, 0.002)
  })
  it('2017-18 Q3(a): As = 6 → rectangular, As = 9 → true T', () => {
    const g = { beff: 48, bw: 12, hf: 3, d: 20, fc: 4, fy: 60 }
    const r1 = reviewT({ ...g, As: 6 })
    expect(r1.rect).toBe(true)
    near(r1.a, 2.206, 0.003)
    const r2 = reviewT({ ...g, As: 9 })
    expect(r2.rect).toBe(false)
    expect(r2.epsT).toBeGreaterThan(0.005)
  })
  it('2021-22 Q7(b) support: 6 #7, a = 5.29, εt = 0.0093, φMn = 346 k-ft', () => {
    const r = reviewRect(12, 24, 25.5, 3.6, 4, 60)
    near(r.a, 5.294, 0.002)
    near(r.epsT, 0.0093, 0.01)
    near(r.phiMn, 345.9, 0.002)
  })
  it('2023-24 Q4(b) support: 6 #9, a = 7.06, transition φ ≈ 0.87, φMn ≈ 456 k-ft', () => {
    const r = reviewRect(12, 21, 22.5, 6, 5, 60)
    near(r.a, 7.059, 0.002)
    expect(r.zone).toBe('transition')
    near(r.phi, 0.870, 0.003)
    near(r.phiMn, 456, 0.004)
  })
})

describe('T-beam design', () => {
  it('Nilson Ex 3.15 / 4.15: b = 47, Mu = 6400 in-k → Asf = 4.59, As − Asf = 1.86, As = 6.45', () => {
    const r = designT({ Mu: 6400 / 12, beff: 47, bw: 11, hf: 3, d: 20, fc: 3, fy: 60 })
    near(r.trial.As, 6.41, 0.003)
    near(r.trial.a, 3.21, 0.005)
    expect(r.rect).toBe(false)
    near(r.Asf, 4.59, 0.003)
    near(r.phiMn1 * 12, 4590, 0.003)
    near(r.Asw, 1.86, 0.005)
    near(r.As, 6.45, 0.003)
    near(r.a, 3.98, 0.005)
    near(r.c, 4.68, 0.005)
  })
  it('class floor problem: wu = 4.62, +Mu = wu L²/14 = 190 → As = 2.14 (rectangular, b = 84); −Mu = wu L²/9 = 296 → As = 3.83', () => {
    const wu = 1.2 * 3.24 + 1.6 * 0.459
    near(wu, 4.62, 0.002)
    const Mp = aciMoment(wu, 24, 1 / 14)
    near(Mp, 190, 0.003)
    const p = designT({ Mu: Mp, beff: 84, bw: 12, hf: 6.5, d: 20, dt: 21.5, fc: 4, fy: 60 })
    near(p.trial.As, 2.52, 0.005)
    near(p.trial.a, 0.53, 0.01)
    expect(p.rect).toBe(true)
    near(p.As, 2.14, 0.005)
    const Mn = aciMoment(wu, 24, 1 / 9)
    near(Mn, 296, 0.003)
    const s = designRect(Mn, 12, 20, 21.5, 4, 60)
    near(s.As, 3.83, 0.003)
    const rv = reviewRect(12, 20, 21.5, 3.95, 4, 60)
    near(rv.a, 5.81, 0.003)
    near(rv.c, 6.83, 0.003)
    near(rv.epsT, 0.00644, 0.005)
  })
  it('2023-24 Q4(a): true T, As ≈ 7.02 in²', () => {
    const r = designT({ Mu: 700, beff: 48, bw: 10, hf: 3, d: 24, fc: 3, fy: 60 })
    expect(r.rect).toBe(false)
    near(r.phiMnFlange, 619.6, 0.002)
    near(r.Asf, 4.845, 0.002)
    near(r.As, 7.015, 0.003)
  })
  it('2020-21 Q3(a): beff 87 (15th-ed rule), rectangular behaviour', () => {
    const b = effectiveWidth({ kind: 'interior', L: 25, bw: 12, hf: 6, cc: 150 }).b
    expect(b).toBe(87)
    const r = designT({ Mu: 500, beff: b, bw: 12, hf: 6, d: 21, fc: 3, fy: 60 })
    expect(r.rect).toBe(true)
    expect(r.As).toBeGreaterThan(5.2)
    expect(r.As).toBeLessThan(5.7)
  })
})

describe('WSD T-beam', () => {
  it('closed-form j equals (d − z)/d', () => {
    const w = wsdT({ beff: 75, hf: 4, d: 20, As: 3.5, n: 9 })
    if (!w.rect) near(w.j, wsdTj(w.rho, 9, 4, 20), 1e-6)
  })
  it('kd in the web uses the flange formula; review and design are consistent', () => {
    const w = wsdT({ beff: 30, hf: 3, d: 24, As: 6, n: 9 })
    expect(w.rect).toBe(false)
    near(w.j, wsdTj(w.rho, 9, 3, 24), 1e-6)
    const d = wsdTDesign({ M: 150, beff: 30, hf: 3, d: 24, n: 9, fcAllow: 1.35, fsAllow: 24 })
    near(d.sec.Ms, 150, 1e-4)
    const r = wsdTReview({ beff: 30, hf: 3, d: 24, As: d.As, n: 9, fcAllow: 1.35, fsAllow: 24, M: 150 })
    near(r.fsAct!, 24, 1e-4)
  })
})

describe('floor loads', () => {
  it('2006-07 Q3(a)(ii): 4 in slab, 10 ft spacing, 12 × 24 web, SDL 75, LL 100', () => {
    const f = floorLoads({ hf: 4, spacing: 10, bw: 12, h: 24, sdl: 75, ll: 100 })
    near(f.slab, 0.5, 1e-6)
    near(f.web, 0.25, 1e-6)
    near(f.wD, 1.5, 1e-6)
    near(f.wL, 1.0, 1e-6)
    near(f.wu, 3.4, 1e-6)
  })
})
