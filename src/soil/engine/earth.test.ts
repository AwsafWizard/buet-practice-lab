import { describe, expect, it } from 'vitest'
import { coulomb, crackDepth, crackForces, criticalHeight, integrateWall, K0, Ka, Kp, lineLoadSigma, pointLoadSigma, pointLoadWholeWall, rankineSloping, sheetPileD, solveWall, stateCircles, trialWedge, type Layer, type Wall } from './earth'

const near = (a: number, b: number, d = 0.01) => expect(Math.abs(a - b)).toBeLessThanOrEqual(d)
const sand = (h: number, gamma: number, phi: number, gammaSat?: number): Layer => ({ h, gamma, gammaSat, phi, c: 0 })

describe('coefficients', () => {
  it('handnote Ka / Kp tables', () => {
    const phis = [20, 25, 28, 30, 32, 34, 35, 36, 40]
    const ka = [0.49, 0.406, 0.361, 0.333, 0.307, 0.283, 0.271, 0.26, 0.217]
    const kp = [2.04, 2.46, 2.77, 3.0, 3.25, 3.54, 3.69, 3.85, 4.6]
    phis.forEach((p, i) => {
      near(Ka(p), ka[i], 0.0006)
      near(Kp(p), kp[i], 0.006)
    })
    expect(Ka(0)).toBeCloseTo(1, 12)
  })
  it('handnote Problem 1: all K0 formulas, φ′ = 32°, H = 6, γ = 17.5', () => {
    const a = K0.jaky(32),
      b = K0.mayne(32, 2),
      c = K0.sherif(32, 16.2, 15.5)
    near(a, 0.47, 0.001)
    near(b, 0.679, 0.001)
    near(c, 0.718, 0.001)
    const P = (k: number) => 0.5 * k * 17.5 * 36
    near(P(a), 148.1, 0.1)
    near(P(b), 213.8, 0.1)
    near(P(c), 226.3, 0.1)
    near(P(Ka(32)), 96.8, 0.1)
  })
  it('2008-09 Q1(h): Massarsch × √OCR', () => {
    near(K0.massarsch(15), 0.503, 0.0005)
    near(K0.ocSqrt(K0.massarsch(15), 2.5), 0.795, 0.001)
  })
  it('handnote quick example: K0 = 0.5, P0 = 68 kN/m at 1.33 m', () => {
    const r = solveWall({ layers: [{ ...sand(4, 17, 30), K0: 0.5 }], zw: null, q: 0, state: 'rest' })
    near(r.Fs, 68)
    near(r.zbar, 4 / 3)
  })
  it('2008-09 Q1(d): passive thrust ratio 0.770', () => near((17.8 * Kp(30)) / (18.8 * Kp(35)), 0.77, 0.001))
})

describe('AJK lecture problems (H = 5 m, φ = 30°, γ = 16)', () => {
  const base: Wall = { layers: [sand(5, 16, 30)], zw: null, q: 0, state: 'active' }
  it('Problem #01 dry: Fs = 66.67, MOT = 111.1', () => {
    const r = solveWall(base)
    near(r.Fs, 66.67)
    near(r.MOT, 111.11)
  })
  it('Problem #02 WT at 2 m: pieces and Fs = 96.10, MOT = 140.54', () => {
    const r = solveWall({ ...base, zw: 2 })
    expect(r.pieces.map((p) => +p.F.toFixed(2))).toEqual([10.67, 32, 9.29, 44.14]) // slide prints 44.15
    near(r.Fs, 96.1)
    near(r.MOT, 140.54)
    expect(r.mode).toBe('split')
  })
  it('Problem #03 + q = 10: Fs = 112.76, MOT = 182.2', () => {
    const r = solveWall({ ...base, zw: 2, q: 10 })
    near(r.Fs, 112.76)
    near(r.MOT, 182.21)
  })
  it('passive-side problem: Pp = 96, net Fs = 16.76, MOT = 118.21', () => {
    const r = solveWall({ ...base, zw: 2, q: 10, front: { D: 2, gamma: 16, phi: 30 } })
    near(r.front!.P, 96)
    near(r.front!.arm, 2 / 3)
    near(r.Fs, 16.77)
    near(r.MOT, 118.21)
  })
  it('Das Ex 13.5: φ = 0, cu = 10, γ = 16.5, H = 6', () => {
    const r = solveWall({ layers: [{ h: 6, gamma: 16.5, phi: 0, c: 10 }], zw: null, q: 0, state: 'active' })
    near(r.ords[0].earth, -20)
    near(r.ords[r.ords.length - 1].earth, 79)
    near(r.zc!, 1.21)
    near(r.Fbefore, 177)
    near(r.Fs, 189.2, 0.1) // 189.12 exact; Das rounds zc to 1.21 first
    near(r.zbar, 1.6, 0.005)
    const f = crackForces({ H: 6, gamma: 16.5, phi: 0, c: 10 })
    near(f.before, 177)
    near(f.after, 189.2, 0.1)
  })
})

describe('handnote practice problems', () => {
  it('Problem 2: dense sand Pa = 91.6, MOT = 183.2, wedge 3.19 m', () => {
    const r = solveWall({ layers: [sand(6, 18, 34)], zw: null, q: 0, state: 'active' })
    near(Ka(34), 0.2827, 0.0001)
    near(r.Fs, 91.6, 0.05)
    near(r.MOT, 183.2, 0.1)
    near(6 * stateCircles({ sv: 1, phi: 34, c: 0 }).wedgeA, 3.19)
  })
  it('Problem 3: WT 2.5 m, γsat 19.5 → 147.16, 256.69, z̄ = 1.74', () => {
    const r = solveWall({ layers: [sand(6, 17, 30, 19.5)], zw: 2.5, q: 0, state: 'active' })
    near(r.Fs, 147.16, 0.02)
    near(r.MOT, 256.69, 0.05)
    near(r.zbar, 1.74, 0.005)
  })
  it('Problem 4: two layers + q = 20 → ordinates, 117.99, 286.47', () => {
    const r = solveWall({ layers: [sand(3, 16, 30), sand(3, 18, 36)], zw: null, q: 20, state: 'active' })
    const tot = r.ords.map((o) => +o.total.toFixed(2))
    expect(tot).toEqual([6.67, 22.67, 17.65, 31.67])
    near(r.Fs, 117.99, 0.02)
    near(r.MOT, 286.47, 0.05)
    near(r.zbar, 2.43, 0.005)
  })
  it('Problem 5: c′–φ′ backfill, crack', () => {
    const r = solveWall({ layers: [{ h: 6, gamma: 18, phi: 20, c: 12 }], zw: null, q: 0, state: 'active' })
    near(r.ords[0].earth, -16.8, 0.005)
    near(r.ords[1].earth, 36.15, 0.005)
    near(r.zc!, 1.904, 0.001)
    near(r.Fbefore, 58.0, 0.05)
    near(r.Fs, 74.0, 0.05)
    near(r.MOT, 101.1, 0.1)
  })
  it('Problem 6: φ = 0 with surcharge', () => {
    const r = solveWall({ layers: [{ h: 7, gamma: 18, phi: 0, c: 15 }], zw: null, q: 10, state: 'active' })
    near(r.zc!, 1.11, 0.005)
    near(r.Fbefore, 301)
    near(r.Fs, 312.1, 0.05)
    near(r.MOT, 612.7, 0.3)
    near(crackDepth(15, 18, 0, 10), 1.111, 0.001)
  })
  it('Problem 7: complete wall check → net 113.18, 302.33', () => {
    const r = solveWall({ layers: [sand(6, 17, 32, 19)], zw: 2, q: 12, state: 'active', front: { D: 1.5, gamma: 17, phi: 32 } })
    near(r.front!.P, 62.24, 0.02)
    near(r.Fdrive, 175.42, 0.05)
    near(r.Fs, 113.18, 0.03)
    near(r.MOT, 302.33, 0.1)
  })
  it('Problem 8: Mohr circles for at-rest, active, passive', () => {
    const s = stateCircles({ sv: 72, phi: 30, c: 10 })
    near(s.rest.sh, 36)
    near(s.active.sh, 12.45, 0.005)
    near(s.passive.sh, 250.64, 0.005)
    near(s.active.C, 42.23, 0.005)
    near(s.active.R, 29.77, 0.005)
    near(s.passive.C, 161.32, 0.005)
    near(s.passive.R, 89.32, 0.005)
    near(s.active.check, s.active.R, 1e-9)
    near(s.passive.check, s.passive.R, 1e-9)
    near(s.active.tp.sigma, 27.34, 0.01)
    near(s.active.tp.tau, 25.78, 0.01)
    near(s.passive.tp.sigma, 116.66, 0.01)
    near(s.passive.tp.tau, 77.35, 0.01)
    expect(s.thActive).toBe(60)
    expect(s.thPassive).toBe(30)
  })
})

describe('past papers (lep)', () => {
  it('2023-24 Q2(a): c′ = 10, q = 20, WT 2 m', () => {
    const r = solveWall({ layers: [{ h: 6, gamma: 16, gammaSat: 18, phi: 35, c: 10 }], zw: 2, q: 20, state: 'active' })
    near(r.ords[0].earth, -4.99, 0.01)
    near(r.zc!, 1.15, 0.005)
    near(r.Fs, 112.5, 0.1)
    near(r.MOT, 164.4, 0.2)
    near(r.zbar, 1.46, 0.005)
    near(r.Fbefore, 109.6, 0.1)
    near(r.Mbefore, 148.3, 0.2)
  })
  it('2007-08 Q3(b): clay over sand', () => {
    const r = solveWall({ layers: [{ h: 4.5, gamma: 19, phi: 0, c: 18 }, sand(3, 20, 30)], zw: null, q: 0, state: 'active' })
    near(r.zc!, 1.89, 0.005)
    near(r.Fs, 180.0, 0.1)
    near(r.zbar, 2.27, 0.005)
    near(r.Fbefore, 145.9, 0.1)
  })
  it('2010-11 Q3(a): two φ = 0 layers', () => {
    const r = solveWall({ layers: [{ h: 4, gamma: 18.6, phi: 0, c: 18 }, { h: 6, gamma: 20, phi: 0, c: 24 }], zw: null, q: 0, state: 'active' })
    near(r.zc!, 1.94, 0.005)
    near(r.Fs, 558.0, 0.1)
    near(r.zbar, 2.62, 0.005)
    near(r.Fbefore, 523.2, 0.1)
  })
  it('2008-09 Q4(a): sand over c–φ clay, WT at the interface', () => {
    const r = solveWall({ layers: [sand(5.5, 18.5, 34), { h: 2.5, gamma: 20.3, phi: 28, c: 17 }], zw: 5.5, q: 0, state: 'active' })
    near(r.Fs, 162.4, 0.2)
    near(r.zbar, 2.64, 0.01)
  })
  it('2011-12 Q3(b): surcharge 30 + WT at 2 m', () => {
    const r = solveWall({ layers: [sand(10, 18.5, 32)], zw: 2, q: 30, state: 'active' })
    near(r.Fs, 594, 1)
    near(r.zbar, 3.35, 0.01)
  })
  it('2012-13 Q7 and 2016-17 Q8: at-rest basement walls (Mayne–Kulhawy)', () => {
    const a = solveWall({ layers: [{ ...sand(2.5, 18.5, 33), K0: K0.mayne(33, 1) }, { ...sand(3, 19.5, 38), K0: K0.mayne(38, 2) }], zw: 2.5, q: 0, state: 'rest' })
    near(a.Fs, 177.9, 0.1)
    near(a.zbar, 1.65, 0.01)
    const b = solveWall({ layers: [{ ...sand(2, 16.5, 33), K0: K0.mayne(33, 1) }, { ...sand(4, 18.5, 35), K0: K0.mayne(35, 2) }], zw: 2, q: 0, state: 'rest' })
    near(b.Fs, 221.4, 0.2)
    near(b.zbar, 1.81, 0.01)
  })
  it('2012-13 Q8: passive, two c–φ layers', () => {
    const L: Layer[] = [
      { h: 2, gamma: 18, phi: 14, c: 20 },
      { h: 4, gamma: 19, phi: 17, c: 25 },
    ]
    const r = solveWall({ layers: L, zw: 2, q: 0, state: 'passive' })
    near(r.Fs, 907, 1)
    near(r.zbar, 2.36, 0.01)
    near(solveWall({ layers: L, zw: 2, q: 10, state: 'passive' }).Fs, 1013, 1)
  })
  it('2015-16 Q4: three layers, crack, WT (H = 9 and 11)', () => {
    const L = (h3: number): Layer[] => [{ h: 3, gamma: 15, phi: 30, c: 10 }, sand(2, 16, 32), sand(h3, 18, 32)]
    const a = solveWall({ layers: L(4), zw: 5, q: 0, state: 'active' })
    near(a.zc!, 2.31, 0.005)
    near(a.Fs, 231.9, 0.2)
    near(a.zbar, 2.21, 0.01)
    const b = solveWall({ layers: L(6), zw: 5, q: 0, state: 'active' })
    near(b.Fs, 402.5, 0.3)
    near(b.zbar, 2.83, 0.01)
  })
  it('2017-18 Q3(d): passive, WT, then q = 20', () => {
    const L: Layer[] = [sand(3, 17, 30), { h: 3, gamma: 20, phi: 26, c: 15 }]
    const r = solveWall({ layers: L, zw: 3, q: 0, state: 'passive' })
    near(r.Fs, 927, 0.5)
    near(r.zbar, 2.03, 0.01)
    near(solveWall({ layers: L, zw: 3, q: 20, state: 'passive' }).Fs, 1260.6, 0.5)
  })
  it('2020-21 Q8(c): active, two layers, + q = 30 adds 84.2', () => {
    const L: Layer[] = [sand(3, 17, 30), { h: 5, gamma: 20, phi: 28, c: 10 }]
    const r = solveWall({ layers: L, zw: 3, q: 0, state: 'active' })
    near(r.Fs, 226.1, 0.2)
    near(r.zbar, 2.27, 0.01)
    near(solveWall({ layers: L, zw: 3, q: 30, state: 'active' }).Fs - r.Fs, 84.2, 0.1)
  })
  it('Jan 2021 Q8(c): passive, + q = 10 adds 166.5', () => {
    const L: Layer[] = [sand(2, 16, 30), { h: 4, gamma: 20, phi: 27, c: 25 }]
    const r = solveWall({ layers: L, zw: 2, q: 0, state: 'passive' })
    near(r.Fs, 1059, 1)
    near(r.zbar, 2.06, 0.01)
    near(solveWall({ layers: L, zw: 2, q: 10, state: 'passive' }).Fs - r.Fs, 166.5, 0.2)
  })
  it('2021-22 Q8(c): φ = 0 total stress with surcharge', () => {
    const r = solveWall({ layers: [{ h: 5, gamma: 21, phi: 0, c: 17, total: true }], zw: 0, q: 11, state: 'active' })
    near(r.zc!, 1.1, 0.005)
    near(r.Fbefore, 147.5, 0.05)
    near(r.zbarBefore, 1.02, 0.01)
    near(r.Fs, 160.1, 0.1)
    near(r.zbar, 1.3, 0.005)
    expect(r.waterF).toBe(0)
  })
  it('φ = 0 clay: 2017-18 Q2(d), 2020-21 Q7(b), Jan 2021 Q8(a), cuts', () => {
    const a = crackForces({ H: 8, gamma: 17, phi: 0, c: 30 })
    near(a.zc, 3.53, 0.005)
    near(a.before, 64, 0.01)
    near(a.after, 169.9, 0.1)
    const b = crackForces({ H: 10, gamma: 16.5, phi: 0, c: 35 })
    near(b.zc, 4.24, 0.005)
    near(b.Hc, 8.48, 0.005)
    near(b.after, 273.5, 0.1)
    near(b.armAfter, 1.92, 0.005)
    near(b.before, 125, 0.01)
    const c = crackForces({ H: 9, gamma: 17.5, phi: 0, c: 26 })
    near(c.Hc, 5.94, 0.005)
    near(c.after, 318.0, 0.1)
    near(criticalHeight(40, 16), 10)
    near((22 * 4) / 4, 22) // 2008-09 Q1(g): c = γHc/4
  })
  it('2009-10 Q3(b): cinder layer, extra height ≈ 1.85 m', () => {
    const ka = (2 * 75) / (16.2 * 6.3 ** 2)
    near(ka, 0.233, 0.001)
    const phi = (Math.asin((1 - ka) / (1 + ka)) * 180) / Math.PI
    const P = (h: number) => solveWall({ layers: [sand(2.8 + h, 8.2, phi), sand(3.5, 16.2, phi)], zw: null, q: 0, state: 'active' }).Fs
    near(P(0), 49.4, 0.1)
    let lo = 0,
      hi = 5
    for (let i = 0; i < 60; i++) {
      const m = (lo + hi) / 2
      if (P(m) < 75) lo = m
      else hi = m
    }
    near(lo, 1.85, 0.02)
  })
})

describe('flagged extras', () => {
  it('Rankine sloping backfill: 2007-08 Q1(h), 2010-11 Q3(b)', () => {
    const a = rankineSloping(32, 15)
    near(a.ka, 0.3405, 0.0005)
    near(0.5 * 16 * 64 * a.ka, 174.3, 0.2)
    near(0.5 * 16 * 64 * a.kaH, 168.4, 0.2)
    const b = rankineSloping(33, 18)
    near(b.ka, 0.3415, 0.0005)
    near(0.5 * 18 * 36 * b.ka, 110.7, 0.1)
    near(K0.mayne(33, 3), 0.828, 0.001)
  })
  it('Coulomb and Culmann: 2008-09 Q2(a), 2012-13 Q6, 2015-16 Q6', () => {
    const c = coulomb(32, 20)
    near(c.ka, 0.2755, 0.0002)
    near(0.5 * 18.6 * 4.5 ** 2 * c.ka, 51.9, 0.05)
    const w = trialWedge({ H: 4.5, gamma: 18.6, phi: 32, delta: 20, state: 'active', step: 0.01 })
    near(w.P, 51.9, 0.05)
    const r = trialWedge({ H: 6, gamma: 16, phi: 35, state: 'active', step: 0.01 })
    near(r.K, Ka(35), 0.0005)
    near(r.rho, 62.5, 0.05)
    const p = trialWedge({ H: 6, gamma: 18, phi: 33, state: 'passive', step: 0.01 })
    near(p.K, 3.392, 0.002)
    near(p.P, 1099, 1)
    near(coulomb(33, 0).kp, 3.392, 0.001)
  })
  it('point and line loads: 2007-08 Q4(a), 2009-10 Q2(b), 2010-11 Q4(a), 2015-16 Q3', () => {
    const one = integrateWall((z) => pointLoadSigma(200, 5, 9, z), 9)
    near(one.P, 11.4, 0.1)
    near(9 - (9 - one.arm), one.arm)
    near(one.arm, 4.47, 0.05)
    const line = integrateWall((z) => lineLoadSigma(25, 3.5, 6, z), 6)
    near(line.P, 11.8, 0.1)
    near(line.arm, 3.15, 0.05)
    const s = (z: number) => pointLoadSigma(300, 1.2, 6, z) + lineLoadSigma(100, 2.4, 6, z)
    near(s(0.6), 16.5, 0.1)
    near(s(1.2), 28.6, 0.1)
    near(s(3.0), 18.5, 0.1)
    near(s(6.0), 4.0, 0.1)
    near(integrateWall((z) => pointLoadSigma(300, 1.2, 6, z), 6).P, 39.4, 0.2)
    near(integrateWall((z) => lineLoadSigma(100, 2.4, 6, z), 6).P, 54.7, 0.2)
    near(pointLoadWholeWall(100, 1.5, 3), 25.5, 0.05)
    near(integrateWall((z) => pointLoadSigma(100, 1.5, 3, z), 3).P, 19.9, 0.1)
  })
  it('2009-10 Q4(b): sheet-pile D by force balance', () => {
    const s = rankineSloping(30, 18.2)
    near(s.ka, 0.3965, 0.0005)
    near(sheetPileD({ H: 6, kaH: s.kaH, kp: Kp(30) }), 3.29, 0.01)
    near(sheetPileD({ H: 6, kaH: s.kaH, kp: Kp(30) }) + 6, 9.29, 0.01)
  })
})
