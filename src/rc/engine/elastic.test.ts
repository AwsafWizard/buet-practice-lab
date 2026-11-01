import { describe, expect, it } from 'vitest'
import { allowableMoment, cracked, crackedStresses, elasticAt, modular, uncracked, uncrackedStresses, wsdDesign, wsdDoublyDesign, wsdParams } from './elastic'

const close = (v: number, target: number, rel = 0.01) => expect(Math.abs(v - target) / Math.abs(target)).toBeLessThan(rel)

// Nilson 15th ed. Ex 4.1 / 4.2 (class slides A p11–24): b = 10, h = 25, d = 23, 3 #8, f'c = 4000, fr = 475, n = 8
const ex41 = { b: 10, h: 25, d: 23, As: 2.37, fc: 4000, frPsi: 475 }

describe('uncracked transformed section — Nilson Ex 4.1', () => {
  const u = uncracked(ex41)
  it('n = 8 from 57000√f′c', () => expect(modular(ex41).n).toBe(8))
  it('(n − 1)As = 16.59, ȳ ≈ 13.2 in, I ≈ 14,740 in⁴', () => {
    close(u.At_s, 16.59, 0.001)
    close(u.ybar, 13.2, 0.005)
    close(u.I, 14740, 0.003)
  })
  it('Mcr = 49.2 k-ft (class slide)', () => close(u.Mcr, 49.2, 0.005))
  it('stresses at M = 45 k-ft: fc ≈ 484 psi, fct ≈ 432 psi, fs ≈ 2870 psi', () => {
    const s = uncrackedStresses(ex41, 45)
    close(s.fcTop * 1000, 484, 0.01)
    close(s.fct * 1000, 432, 0.01)
    close(s.fs * 1000, 2870, 0.01)
    expect(s.cracked).toBe(false)
  })
})

describe('cracked transformed section — Nilson Ex 4.2', () => {
  const c = cracked(ex41)
  it('ρ = 0.0103, k = 0.332, kd = 7.63 in, j = 0.889', () => {
    close(c.rho, 0.0103, 0.005)
    close(c.k, 0.332, 0.003)
    close(c.kd, 7.63, 0.003)
    close(c.j, 0.889, 0.002)
  })
  // book prints 5910 (rounded kd); exact kd = 7.63 gives 5960
  it('Icr ≈ 5910 in⁴', () => close(c.Icr, 5910, 0.01))
  it('M = 90 k-ft: fs ≈ 22,300 psi, fc ≈ 1390 psi', () => {
    const s = crackedStresses(ex41, 90)
    close(s.fs, 22.3, 0.005)
    close(s.fc, 1.39, 0.005)
  })
  it('elasticAt picks the right section', () => {
    expect(elasticAt(ex41, 45).state).toBe('uncracked')
    expect(elasticAt(ex41, 90).state).toBe('cracked')
  })
})

// 2023-24 Q1(b): b = 14, h = 21, d = 18.5, 4 #8, f'c = 6 ksi, fr = 581 psi, Ec = 4415 ksi, n = 7
describe('2023-24 Q1(b)(i)–(iii)', () => {
  const sec = { b: 14, h: 21, d: 18.5, As: 3.16, fc: 6000, frPsi: 581, n: 7 }
  const u = uncracked(sec)
  it('Mcr ≈ 57.7 k-ft transformed (49.8 gross)', () => {
    close(u.Mcr, 57.7, 0.005)
    close(u.McrG, 49.8, 0.005)
  })
  it('fs ≈ 3.05 ksi, εs ≈ 1.05e-4 just before cracking', () => {
    close(u.fsCr, 3.05, 0.01)
    close(u.epsSCr, 1.05e-4, 0.01)
  })
  it('allowable M: kd 6.23, Icr ≈ 4460, concrete 161, steel 104 → steel governs', () => {
    const a = allowableMoment(sec, 2.7, 24)
    close(a.kd, 6.23, 0.003)
    close(a.Icr, 4460, 0.005)
    close(a.Mc, 161, 0.01)
    close(a.Ms, 104, 0.01)
    expect(a.governs).toBe('steel')
  })
})

describe('2021-22 Q5(b) and Jan 2021 Q1 — concrete governs', () => {
  it('2021-22: kd ≈ 6.96, Mc ≈ 111, Ms ≈ 121', () => {
    const a = allowableMoment({ b: 14, h: 20, d: 17.5, As: 4, fc: 4000, frPsi: 474, EcPsi: 3600e3 }, 1.8, 24)
    expect(a.n).toBe(8)
    close(a.kd, 6.96, 0.005)
    close(a.Mc, 111, 0.01)
    close(a.Ms, 121, 0.01)
    expect(a.governs).toBe('concrete')
  })
  it('Jan 2021: n = 8, kd ≈ 9.0, Icr ≈ 10,700, Mc ≈ 134, Ms ≈ 168', () => {
    const sec = { b: 12, h: 28, d: 25, As: 3.81, fc: 3000, n: 8 }
    const a = allowableMoment(sec, 1.35, 24)
    close(a.kd, 9.0, 0.01)
    close(a.Icr, 10700, 0.01)
    close(a.Mc, 134, 0.01)
    close(a.Ms, 168, 0.01)
    close(uncracked(sec).McrG, 53.7, 0.01)
  })
})

describe('compression steel conventions', () => {
  const sec = { b: 12, h: 24, d: 21.5, As: 4, Asp: 1.2, dp: 2.5, fc: 4000 }
  it('2n convention moves the NA up versus n', () => {
    const a = cracked(sec)
    const b = cracked({ ...sec, compN: 'n' })
    expect(a.nc).toBe(16)
    expect(b.nc).toBe(8)
    expect(a.kd).toBeLessThan(b.kd)
    // equilibrium of first moments
    expect(Math.abs((12 * a.kd ** 2) / 2 + 15 * 1.2 * (a.kd - 2.5) - 8 * 4 * (21.5 - a.kd))).toBeLessThan(1e-6)
  })
  it('without A′s reduces to the singly formula', () => {
    const s = crackedStresses({ ...sec, Asp: 0 }, 100)
    close(s.fs, (100 * 12) / (4 * s.j * 21.5), 1e-6)
  })
})

describe('WSD design helpers', () => {
  it('f′c 4000, fc = 1.8, fs = 24, n = 8 → k = 0.375, j = 0.875, R = 0.295 ksi', () => {
    const p = wsdParams(8, 1.8, 24)
    close(p.k, 0.375, 1e-6)
    close(p.j, 0.875, 1e-6)
    close(p.R, 0.2953, 0.001)
  })
  it('d and As for M = 100 k-ft, b = 12', () => {
    const w = wsdDesign(100, 12, 8, 1.8, 24)
    close(w.dReq, Math.sqrt(1200 / (0.2953 * 12)), 0.001)
    close(w.As, 1200 / (24 * 0.875 * w.dReq), 1e-6)
  })
  it('2010-11 Q5(a): 12 × 18, M = 200 k-ft needs compression steel', () => {
    const w = wsdDoublyDesign(200, 12, 15.5, 2.5, 8, 1.8, 20)
    expect(w.needsComp).toBe(true)
    expect(w.M1).toBeGreaterThan(70)
    expect(w.M1).toBeLessThan(90)
    expect(w.Asp).toBeGreaterThan(0)
  })
})
