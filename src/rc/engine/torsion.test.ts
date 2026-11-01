import { describe, expect, it } from 'vitest'
import { shearDiagram, shearRuns } from './shear'
import { spandrelTorque, threshold, torsionCheck, torsionSection } from './torsion'

const near = (a: number, b: number, rel = 0.005, abs = 0.02) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('lecture L-beam (Nilson Ex 7.1, Jan 2026 slides pp 13–14)', () => {
  const sp = spandrelTorque({ L: 28, bw: 12, h: 24, hf: 6, overhang: 5.5, slabLL: 50, lineLL: 900, d: 21.5 })
  it('loads and torque', () => {
    near(sp.ecc.uD, 495)
    near(sp.ecc.uL, 440)
    near(sp.ecc.u, 935)
    near(sp.e, 3.25)
    near(sp.cl.uD, 360)
    near(sp.cl.uL, 1520)
    near(sp.wu, 2815)
    near(sp.tu, 3040, 0.001)
  })
  it('Vu, Tu at the face and at d', () => {
    near(sp.VuFace, 39.4, 0.002)
    near(sp.TuFace, 42.6, 0.003)
    near(sp.Vud, 34.4, 0.002)
    near(sp.Tud, 37.2, 0.004)
  })
  const sec = torsionSection({ shape: 'L', bw: 12, h: 24, hf: 6, overhang: 66 })
  it('section: overhang 18 in (hw governs), Acp 396, pcp 108, flange helps', () => {
    expect(sec.ohEff).toBe(18)
    expect(sec.ohGov).toBe('hw')
    expect(sec.Acp).toBe(396)
    expect(sec.pcp).toBe(108)
    near(sec.withFlange.ratio, 1452, 0.001)
    // handnote prints 288²/96 = 864: the web perimeter is 2(12 + 24) = 72, so 1152 (still < 1452)
    near(sec.web.ratio, 1152)
    expect(sec.useFlange).toBe(true)
  })
  it('φTth = 6.4 ft-k, Tcr = 34.2 ft-k, cannot neglect', () => {
    const th = threshold(sec, { fc: 5000 })
    near(th.phiTth, 6.4, 0.005)
    near(th.Tcr, 34.2, 0.004)
    const c = torsionCheck(sp.Tud, th)
    expect(c.neglect).toBe(false)
    expect(c.Tdesign).toBeCloseTo(sp.Tud, 6)
  })
  it('shear side: φVc = 27.4 k reached about 4.26 ft from the face', () => {
    const bm = { kind: 'ss' as const, L: 28, wD: sp.wu / 1000, factored: true }
    const r = shearRuns(shearDiagram(bm), bm, { bw: 12, d: 21.5, fc: 5000, fy: 60000 })[0]
    near(r.uPhiVc! / 12, 4.26, 0.006)
  })
})

describe('handnote practice problems', () => {
  it('P1 rectangle 12 × 20, f′c 4000: Tth 4.74, φTth 3.56, Tcr 18.97 ft-k', () => {
    const s = torsionSection({ shape: 'rect', bw: 12, h: 20 })
    expect(s.Acp).toBe(240)
    expect(s.pcp).toBe(64)
    const th = threshold(s, { fc: 4000 })
    near(th.Tth, 4.74, 0.003)
    near(th.phiTth, 3.56, 0.003)
    near(th.Tcr, 18.97, 0.002)
  })
  it('P2 with Nu = 100 k compression: factor 1.627, Tth 7.72, φTth 5.79', () => {
    const th = threshold(torsionSection({ shape: 'rect', bw: 12, h: 20 }), { fc: 4000, Nu: 100 })
    expect(th.case).toBe('solid-axial')
    near(th.factor, 1.627, 0.002)
    near(th.Tth, 7.72, 0.003)
    near(th.phiTth, 5.79, 0.003)
  })
  it('axial tension lowers the threshold', () => {
    const th = threshold(torsionSection({ shape: 'rect', bw: 12, h: 20 }), { fc: 4000, Nu: -30 })
    expect(th.factor).toBeLessThan(1)
  })
  it('P3 box 24 × 36, 5 in walls, f′c 5000: Ag 500, Tth 12.3, φTth 9.2 (solid would be 36.7)', () => {
    const s = torsionSection({ shape: 'box', bw: 24, h: 36, tw: 5 })
    expect(s.Ag).toBe(500)
    expect(s.pcp).toBe(120)
    const th = threshold(s, { fc: 5000 })
    expect(th.case).toBe('hollow')
    near(th.Tth, 12.3, 0.003)
    near(th.phiTth, 9.2, 0.004)
    const solid = threshold(torsionSection({ shape: 'rect', bw: 24, h: 36 }), { fc: 5000 })
    near(solid.Tth, 36.7, 0.003)
  })
  it('P4 symmetric T 14 × 28, hf 5, f′c 4000, Tu 12: overhang 20 (4hf), Acp 592, pcp 164, φTth 8.45 → consider torsion', () => {
    const s = torsionSection({ shape: 'T', bw: 14, h: 28, hf: 5 })
    expect(s.ohEff).toBe(20)
    expect(s.ohGov).toBe('4hf')
    expect(s.Acp).toBe(592)
    expect(s.pcp).toBe(164)
    near(s.ratio, 2137, 0.001)
    near(s.web.ratio, 1829, 0.001)
    const th = threshold(s, { fc: 4000 })
    near(th.phiTth, 8.45, 0.003)
    expect(torsionCheck(12, th).neglect).toBe(false)
  })
  it('flange ignored when it lowers Acp²/pcp (thin wide slab)', () => {
    const s = torsionSection({ shape: 'L', bw: 16, h: 30, hf: 2 })
    // 4hf = 8: Acp = 496, pcp = 108 → 2278 vs web 480²/92 = 2504
    expect(s.useFlange).toBe(false)
    near(s.ratio, 2504.3, 0.001)
  })
  it('compatibility torsion may be reduced to φTcr', () => {
    const th = threshold(torsionSection({ shape: 'rect', bw: 12, h: 20 }), { fc: 4000 })
    const c = torsionCheck(20, th, 'compatibility')
    expect(c.reduced).toBe(true)
    near(c.Tdesign, th.phiTcr)
  })
})
