import { describe, expect, it } from 'vitest'
import { touches } from './mohr'
import { fitCircles } from './shear'
import { dsEnvelope, dsPeak, dsState, dsUltimate, failAt, mobilised, SIM_SOILS, totalEnvelope, txCircles, txFailure, txState, U_PEAK, volShape, type SimSoil, type SimTest } from './testsim'

const SOILS: SimSoil[] = ['nc', 'oc', 'loose', 'dense']
const TESTS: SimTest[] = ['uu', 'cu', 'cd']
const S3 = [100, 200, 300, 400]

describe('test bench soil model', () => {
  it('CD: the failure circle is tangent to the effective envelope; u = 0', () => {
    for (const soil of SOILS)
      for (const s3 of S3) {
        const f = txFailure(soil, 'cd', s3)
        expect(f.u).toBe(0)
        expect(Math.abs(touches(txCircles(f).eff, SIM_SOILS[soil].peak).margin)).toBeLessThan(1e-6)
      }
  })

  it('CU: effective circle on the effective envelope, total circle on the total envelope, Af as set', () => {
    for (const soil of ['nc', 'oc'] as const)
      for (const s3 of S3) {
        const f = txFailure(soil, 'cu', s3)
        const c = txCircles(f)
        expect(Math.abs(touches(c.eff, SIM_SOILS[soil].peak).margin)).toBeLessThan(1e-6)
        expect(Math.abs(touches(c.total, totalEnvelope(soil)).margin)).toBeLessThan(1e-6)
        expect(f.du / f.dev).toBeCloseTo(SIM_SOILS[soil].Af, 6)
      }
    // NC: φ′ > φcu, both through the origin; heavily OC: negative uf
    expect(totalEnvelope('nc').phi).toBeLessThan(SIM_SOILS.nc.peak.phi)
    expect(totalEnvelope('nc').c).toBeCloseTo(0, 9)
    expect(txFailure('oc', 'cu', 200).u).toBeLessThan(0)
  })

  it('CU: an envelope fitted through three specimens recovers the model', () => {
    for (const soil of ['nc', 'oc'] as const) {
      const cs = [100, 200, 300].map((s3) => txCircles(txFailure(soil, 'cu', s3)))
      const t = fitCircles(cs.map((c) => c.total)),
        e = fitCircles(cs.map((c) => c.eff))
      expect(t.phi).toBeCloseTo(totalEnvelope(soil).phi, 4)
      expect(t.c).toBeCloseTo(totalEnvelope(soil).c, 4)
      expect(e.phi).toBeCloseTo(SIM_SOILS[soil].peak.phi, 4)
      expect(e.c).toBeCloseTo(SIM_SOILS[soil].peak.c, 4)
    }
  })

  it('UU: the same deviator and one effective circle whatever the cell pressure (φu = 0)', () => {
    for (const soil of ['nc', 'oc'] as const) {
      const fs = S3.map((s3) => txFailure(soil, 'uu', s3))
      for (const f of fs) {
        expect(f.dev).toBeCloseTo(fs[0].dev, 9)
        expect(f.s3p).toBeCloseTo(fs[0].s3p, 9)
        expect(f.u).toBeCloseTo(f.s3 - fs[0].s3p, 9)
      }
      const fit = fitCircles(fs.map((f) => txCircles(f).total))
      expect(fit.phi).toBeCloseTo(0, 6)
      expect(fit.c).toBeCloseTo(fs[0].dev / 2, 6)
    }
  })

  it('sand is always drained', () => {
    for (const soil of ['loose', 'dense'] as const) for (const t of TESTS) expect(txFailure(soil, t, 200)).toEqual(txFailure(soil, 'cd', 200))
  })

  it('no state lies beyond the effective envelope, and readings stay finite', () => {
    for (const soil of SOILS)
      for (const test of TESTS)
        for (const s3 of S3)
          for (let i = 0; i <= 100; i++) {
            const s = txState(soil, test, s3, i / 100)
            for (const v of Object.values(s)) expect(Number.isFinite(v)).toBe(true)
            expect(s.s3p).toBeGreaterThan(0)
            expect(touches(txCircles(s).eff, SIM_SOILS[soil].peak).margin).toBeLessThan(1e-6)
          }
  })

  it('curve shapes: peak then ultimate; dip then dilation, fastest at the peak', () => {
    expect(mobilised(U_PEAK, 0.7)).toBeCloseTo(1, 9)
    expect(mobilised(1, 0.7)).toBeCloseTo(0.7, 4)
    expect(mobilised(1, 1)).toBeCloseTo(1, 9)
    expect(volShape(1, true)).toBeCloseTo(1, 3)
    expect(volShape(1, false)).toBeCloseTo(1, 9)
    let min = 0,
      steep = 0,
      at = 0
    for (let i = 1; i <= 200; i++) {
      const u = i / 200
      min = Math.min(min, volShape(u, true))
      const sl = volShape(u, true) - volShape(u - 0.005, true)
      if (sl > steep) (steep = sl), (at = u)
    }
    expect(min).toBeLessThan(0)
    expect(min).toBeGreaterThan(-0.15)
    expect(Math.abs(at - U_PEAK)).toBeLessThan(0.05)
    // dense sand: drained peak above the ultimate; OC clay undrained: small rise in u before it goes negative
    expect(txFailure('dense', 'cd', 200).dev).toBeGreaterThan(txState('dense', 'cd', 200, 1).dev)
    expect(txState('oc', 'cu', 200, 0.06).du).toBeGreaterThan(0)
    expect(failAt('dense', 'cd')).toBe(U_PEAK)
    expect(failAt('oc', 'cu')).toBe(1)
  })

  it('shear box: points on the reported line; quick tests show no height change', () => {
    for (const soil of SOILS)
      for (const test of TESTS)
        for (const sn of [50, 150, 300]) {
          const e = dsEnvelope(soil, test)
          expect(dsPeak(soil, test, sn)).toBeCloseTo(e.c + sn * Math.tan((e.phi * Math.PI) / 180), 9)
          expect(dsUltimate(soil, test, sn)).toBeLessThanOrEqual(dsPeak(soil, test, sn) + 1e-9)
          const end = dsState(soil, test, sn, 1)
          expect(end.tau).toBeCloseTo(dsUltimate(soil, test, sn), 2)
          if (SIM_SOILS[soil].clay && test !== 'cd') expect(end.dH).toBe(0)
        }
    expect(dsEnvelope('nc', 'uu').phi).toBe(0)
    expect(dsState('dense', 'cd', 100, 1).dH).toBeGreaterThan(0)
    expect(dsState('loose', 'cd', 100, 1).dH).toBeLessThan(0)
  })
})
