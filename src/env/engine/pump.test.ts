import { describe, expect, it } from 'vitest'
import {
  cfsFromGpm, design, effCurve, frictionHead, gpmFromGpd, headFromKPa, interp, npshAvailable, operatingPoint, parallel, pipeFromDiameter, pipeFromVelocity,
  powerFps, powerGpm, powerSI, quadPump, series, staticHead, systemCurve, systemK, totalHead, velocityHead, waterHpGpm, G_FPS, G_SI, FT3_L,
} from './pump'

const near = (a: number, b: number, rel = 0.005, abs = 1e-6) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('RM L8 Example 1 (p41): 7200 gpm, L 800 ft, hs 60 ft, v 12 fps, f 0.0075, 70 %', () => {
  it('follows the slide with its rounded d = 1.4 ft', () => {
    // the slide prints Q = 19.26 cfs, A = 1.605, d = 1.4, hf = 9.58, hv = 2.24, H = 71.82, P = 130.58, BHP = 186.5
    const hf = frictionHead(0.0075, 800, 12, 1.4, G_FPS)
    near(hf, 9.58, 0.002)
    const hv = velocityHead(12, G_FPS)
    near(hv, 2.24, 0.005)
    const H = 60 + hf + hv
    near(H, 71.82, 0.002)
    const p = powerGpm(H, 7200, 0.7)
    near(waterHpGpm(H, 7200), 130.58, 0.002)
    near(p.inputHp, 186.54, 0.003)
  })
  it('the engine path from the exact Q = 19.2 cfs lands within 2 % of every printed value', () => {
    const Q = cfsFromGpm(7200)
    near(Q, 19.2, 1e-9) // slide prints 19.26 (0.1605 ft3/gal); 0.16 gives exactly 19.2
    const o = design({ system: 'fps', Q, v: 12, f: 0.0075, L: 800, hs: 60 })
    near(o.pipe.d, 1.4, 0.03)
    near(o.H, 71.82, 0.02)
    near(powerGpm(o.H, 7200, 0.7).inputHp, 186.5, 0.03)
  })
})

describe('RM L8 Example 2 (p42), the digest derivation: 40 gpcd, 85000 people, 10 h, 8 fps, f 0.01, 65 %', () => {
  const gpm = gpmFromGpd(40 * 85000, 10)
  const Q = cfsFromGpm(gpm)
  const o = design({ system: 'fps', Q, v: 8, f: 0.01, L: 3500, hs: 193 - 102.5 })
  it('discharge, diameter and heads', () => {
    near(gpm, 5666.7, 1e-4)
    near(Q, 15.11, 0.001)
    near(o.pipe.d, 1.551, 0.002)
    near(o.hs, 90.5, 1e-9)
    near(o.hf, 22.43, 0.003)
    near(o.hv, 0.99, 0.01)
    near(o.H, 113.92, 0.002)
  })
  it('power', () => {
    const p = powerGpm(o.H, gpm, 0.65)
    near(p.waterHp, 163.0, 0.003)
    near(p.inputHp, 250.8, 0.003)
  })
})

describe('pipe and unit helpers', () => {
  it('diameter / velocity are inverses', () => {
    const a = pipeFromVelocity(0.2, 2)
    const b = pipeFromDiameter(0.2, a.d)
    near(b.v, 2, 1e-12)
  })
  it('static head from levels, lift vs flooded', () => {
    const s = staticHead({ sourceWL: 38, pumpCL: 40, deliveryWL: 60 })
    expect(s.hs).toBe(22)
    expect(s.Hs).toBe(-2)
    expect(s.lift).toBe(true)
    const f = staticHead({ sourceWL: 20, pumpCL: 15, deliveryWL: 50 })
    expect(f.hs).toBe(30)
    expect(f.lift).toBe(false)
  })
  it('SI power: 1 m3/s over 10 m is 98.1 kW, a 70 % pump needs 140.1 kW', () => {
    const p = powerSI(1, 10, 0.7)
    near(p.waterKW, 98.1, 1e-9)
    near(p.inputKW, 140.14, 0.001)
    near(p.waterHpMetric!, 133.3, 0.001) // 1000 H Q / 75
  })
  it('FPS exact power: 1 cfs over 10 ft = 1.13 hp; litres give the same as US gpm / 3960', () => {
    near(powerFps(1, 10, 1).waterHp, 1.1345, 0.001)
    const gpmUS = 1 * 7.4805 * 60
    near(waterHpGpm(10, gpmUS), 1.1335, 0.002)
    near(FT3_L, 28.3168, 1e-9)
  })
})

describe('RM L8 Example 3 style (2012-13 Q3(b) data): power and NPSH', () => {
  const Q = 0.2
  const pipe = pipeFromDiameter(Q, 0.25)
  const sumK = 0.1 + 2 * 0.2 + 2 * 0.25 + 0.04
  const h = totalHead({ hs: 60 - 38, f: 0.022, L: 30, v: pipe.v, d: 0.25, g: G_SI, sumK })
  it('total head and power', () => {
    near(pipe.v, 4.074, 0.001)
    near(h.hv, 0.846, 0.002)
    near(h.hf, 2.233, 0.002)
    near(h.hm, 0.880, 0.003)
    near(h.H, 25.96, 0.002)
    near(powerSI(Q, h.H, 1, { gamma: 9.982 }).waterKW, 51.8, 0.002)
  })
  it('NPSH available', () => {
    const Habs = headFromKPa(101.3, 9982)
    const Hvp = headFromKPa(2.3, 9982)
    near(Habs, 10.148, 0.001)
    near(npshAvailable({ Habs, Hs: -2, hL: 3.113, Hvp }), 4.80, 0.01)
  })
})

describe('2012-13 Q1(b): pump curve vs system curve, parallel and series', () => {
  const pump = interp([[0, 40], [0.02, 39], [0.04, 36], [0.06, 29], [0.08, 20], [0.1, 8]])
  const sysMin = interp([[0, 30], [0.02, 32], [0.04, 34], [0.06, 37], [0.08, 40], [0.1, 44]])
  const sysMax: (Q: number) => number = (Q) => sysMin(Q) + 2
  it('one pump', () => {
    const a = operatingPoint(pump, sysMin, 0, 0.1)!
    near(a.Q, 0.044, 0.001)
    near(a.H, 34.6, 0.002)
    const b = operatingPoint(pump, sysMax, 0, 0.1)!
    expect(b.Q).toBeLessThan(a.Q)
    expect(b.H).toBeGreaterThan(a.H)
  })
  it('two in series meet the minimum-level system curve exactly at the table point (0.08, 40)', () => {
    const a = operatingPoint(series(pump), sysMin, 0, 0.1)!
    near(a.Q, 0.08, 1e-4)
    near(a.H, 40, 1e-4)
  })
  it('two in parallel: capacity less than doubled', () => {
    const one = operatingPoint(pump, sysMin, 0, 0.1)!
    const two = operatingPoint(parallel(pump), sysMin, 0, 0.2)!
    expect(two.Q).toBeGreaterThan(one.Q)
    expect(two.Q).toBeLessThan(2 * one.Q)
    near(two.Q, 0.0622, 0.01)
  })
})

describe('lab curves', () => {
  it('the operating point moves left and up when the static lift rises', () => {
    const p = quadPump(60, 0.12)
    const a = operatingPoint(p, systemCurve(20, 900), 0, 0.12)!
    const b = operatingPoint(p, systemCurve(30, 900), 0, 0.12)!
    expect(b.Q).toBeLessThan(a.Q)
    expect(b.H).toBeGreaterThan(a.H)
    near(p(a.Q), a.H, 1e-6)
  })
  it('efficiency peaks at the best-efficiency discharge', () => {
    const e = effCurve(0.8, 0.06)
    near(e(0.06), 0.8, 1e-12)
    expect(e(0.03)).toBeLessThan(0.8)
    expect(e(0.09)).toBeLessThan(0.8)
  })
  it('systemK reproduces hf + hv at the design flow', () => {
    const k = systemK({ f: 0.01, L: 500, d: 0.3, g: G_SI })
    const Q = 0.1
    const pipe = pipeFromDiameter(Q, 0.3)
    near(k * Q * Q, totalHead({ hs: 0, f: 0.01, L: 500, v: pipe.v, d: 0.3, g: G_SI }).H, 1e-9)
  })
})
