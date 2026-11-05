import { describe, expect, it } from 'vitest'
import { GW } from './units'
import { dam, ellipK, equipotential, exitGradient, flatDamExact, flowLine, headAt, netLines, pointInfo, sheetPile, sheetPileExact, solveFlow, solveNet, terzaghiHeave, uplift, type FlowGeom } from './flownet'

const near = (a: number, b: number, rel = 0.01, abs = 1e-3) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('exact results', () => {
  it('K(0) = π/2, K(1/√2) = 1.85407', () => {
    near(ellipK(0), Math.PI / 2, 1e-12)
    near(ellipK(Math.SQRT1_2), 1.854075, 1e-6)
  })
  it('one sheet pile: q/kH = K(cos)/2K(sin); 0.5 at s/T = 0.5', () => near(sheetPileExact(5, 10), 0.5, 1e-12))
})

describe('solver vs the exact single sheet pile', () => {
  for (const r of [0.25, 0.5, 0.75])
    it(`s/T = ${r}: final within 0.3 %, live within 1 %`, () => {
      const g = sheetPile({ T: 10, s: 10 * r, hU: 5, hD: 1.5 })
      near(solveNet(g, 'final').shape, sheetPileExact(10 * r, 10), 0.003)
      near(solveNet(g, 'live').shape, sheetPileExact(10 * r, 10), 0.01)
    })
  it('a single grid is first order (≈1 % low at n = 48), extrapolation removes it', () => {
    const g = sheetPile({ T: 10, s: 5, hU: 5, hD: 1.5 })
    const s = solveFlow(g, { n: 48 })
    expect(s.shape).toBeLessThan(0.5)
    near(s.shape, 0.5, 0.02)
  })
  it('flat dam on a layer vs exact (B/T = 0.4, 1.67, 3.3)', () => {
    for (const B of [5, 20, 40]) near(solveNet(dam({ T: 12, B, hU: 5, hD: 0 })).shape, flatDamExact(B, 12), 0.005)
  })
  it('anisotropic = transformed section: kx = 4kz is the isotropic net with x halved', () => {
    const a = solveNet({ ...sheetPile({ T: 10, s: 5, hU: 4, hD: 0 }), kx: 4, kz: 1 })
    // a pile alone has no horizontal length, so only the far field changes: shape barely moves
    near(a.shape, 0.5, 0.01)
    const d = solveNet({ ...dam({ T: 10, B: 20, hU: 4, hD: 0 }), kx: 4, kz: 1 })
    near(d.shape, solveNet(dam({ T: 10, B: 10, hU: 4, hD: 0 })).shape, 0.005)
  })
  it('speed target (< ~150 ms final, < ~25 ms live in a browser): a loose bound so a busy machine cannot flake the suite', () => {
    const g = dam({ T: 15, B: 27, hU: 10.5, hD: 0, cutU: 9 })
    solveNet(g, 'live')
    // best of three, generous ceilings: this guards against an accidental slowdown of 10× or more, not jitter
    const best = (q: 'live' | 'final') => Math.min(...[0, 1, 2].map(() => solveNet(g, q).ms))
    expect(best('live')).toBeLessThan(300)
    expect(best('final')).toBeLessThan(1500)
  })
})

describe('Question Bank flow nets (its computed Nf/Nd are the oracles)', () => {
  it('2023-24 Q6(c): Nf/Nd 0.50, ha 1.17 m, heave FS 3.57, ie ≈ 0.21, Harza ≈ 4', () => {
    const s = solveNet(sheetPile({ T: 10, s: 5, hU: 5, hD: 1.5 }))
    near(s.shape, 0.5, 0.005)
    const t = terzaghiHeave(s, 18 - GW)!
    near(t.ha, 1.17, 0.01)
    near(t.FS, 3.57, 0.01)
    const e = exitGradient(s, 8)
    near(e.ie, 0.21, 0.05)
    near((18 - GW) / GW / e.ie, 4.0, 0.06)
  })
  it('2020-21 Q1(c): 0.50, q = 1.08 m³/day/m, ie ≈ 0.37, heave ha 1.66 (FS ≈ 2.4 with icr = 1)', () => {
    const s = solveNet(sheetPile({ T: 8, s: 4, hU: 6, hD: 1 }))
    near(5e-6 * s.H * s.shape * 86400, 1.08, 0.01)
    near(exitGradient(s, 8).ie, 0.37, 0.05)
    const t = terzaghiHeave(s, GW)!
    near(t.ha, 1.66, 0.02)
    near(t.FS, 2.4, 0.02)
  })
  it('2016-17 Q3(b): 0.54; P excess 5.5 m, u 147 kPa; Q excess 1.63 m, u 129, σ′ 90; FS 3.4 / 3.8', () => {
    const s = solveNet(sheetPile({ T: 18, s: 8, hU: 9, hD: 1.5 }))
    near(s.shape, 0.54, 0.01)
    const Nd = 4 / s.shape
    const P = pointInfo(s, -4, 18 - 8, 20.4, Nd)
    near(P.excess, 5.5, 0.01)
    near(P.u, 147, 0.01)
    const Q = pointInfo(s, 8, 18 - 10, 20.4, Nd)
    near(Q.excess, 1.63, 0.02)
    near(Q.u, 129, 0.01)
    near(Q.sigmaEff, 90, 0.01)
    near(terzaghiHeave(s, 20.4 - GW)!.FS, 3.4, 0.01)
    near((20.4 - GW) / GW / exitGradient(s, Nd).ie, 3.8, 0.06)
  })
  it('2010-11 Q7(d): 0.44, 694 m³ per m in 6 months, ha 1.31, FS 4.5', () => {
    const s = solveNet(sheetPile({ T: 8.6, s: 5, hU: 4.5, hD: 0.5 }))
    near(s.shape, 0.44, 0.01)
    near(2.5e-5 * s.H * s.shape * 182.5 * 86400, 694, 0.01)
    const t = terzaghiHeave(s, 21.5 - GW)!
    near(t.ha, 1.31, 0.015)
    near(t.FS, 4.5, 0.01)
  })
  it('Jan 2021 Q1(b): exact net 0.735 (QBank 0.72); h1 between P1 and P2 ≈ 0.65 m (digest: ≈ 0.66)', () => {
    const s = solveNet(sheetPile({ T: 6, s: 1.5, hU: 3, hD: 0.5 }))
    near(s.shape, sheetPileExact(1.5, 6), 0.005)
    near(s.shape, 0.72, 0.03)
    const h1 = headAt(s, 0.35, 6 - 3.3) - headAt(s, 2.3, 6 - 2.1)
    near(h1, 0.66, 0.03)
  })
  it('2021-22 Q4(c): 0.39 (QBank 0.40), 0.21 m³/day for 25 m', () => {
    const s = solveNet(dam({ T: 12, B: 20, hU: 5, hD: 0 }))
    near(s.shape, 0.4, 0.025)
    near(5e-8 * 5 * s.shape * 25 * 86400, 0.21, 0.03)
  })
  it('2011-12 Q8(e): 0.27, ≈ 1.1 × 10⁴ m³ per m in 6 months', () => {
    const s = solveNet(dam({ T: 15, B: 27, hU: 10.5, hD: 0, cutU: 9 }))
    near(s.shape, 0.27, 0.01)
    near(2.5e-4 * 10.5 * s.shape * 182.5 * 86400, 1.1e4, 0.02)
  })
  it('2017-18 Q7(a): 0.28, 0.26 m³/day/m; uplift 42.3 → 29.5 kPa, 316 kN/m; ie ≈ 0.18', () => {
    const s = solveNet(dam({ T: 6, B: 8.5, hU: 4.5, hD: 0.5, embedU: 1, embedD: 2, cutU: 2 }))
    near(s.shape, 0.28, 0.02)
    near(3.6e-6 * 3 * s.shape * 86400, 0.26, 0.03)
    const u = uplift(s)!
    near(u.heel, 42.3, 0.01)
    near(u.toe, 29.5, 0.025)
    near(u.U, 316, 0.01)
    near(exitGradient(s, 3 / s.shape).ie, 0.18, 0.06)
  })
  it('2007-08 Q8(c): 0.25, 79 m³/m/yr; uA ≈ 68 kPa; at B excess 0.77 m, σ′ 48 kPa', () => {
    const s = solveNet(dam({ T: 12, B: 20, hU: 10, hD: 0, embedU: 2, embedD: 2, cutU: 5 }))
    near(s.shape, 0.25, 0.01)
    near(1e-6 * 10 * s.shape * 365 * 86400, 79, 0.01)
    const Nd = 3 / s.shape
    near(pointInfo(s, 6, 10 - 1e-3, 21, Nd).u, 68, 0.01)
    const B = pointInfo(s, 24.5, 7, 21, Nd)
    near(B.excess, 0.77, 0.02)
    near(B.sigmaEff, 48, 0.015)
  })
  it('2023-24 Q8(a) gravity wall: ≈ 0.36, excess head at A 1.99 m, seepage 19.5 kPa, pore pressure 78.4 kPa', () => {
    const g: FlowGeom = { zU: 17, zD: 10, hU: 17, hD: 10, B: 6, zB: 7 }
    const s = solveNet(g)
    near(s.shape, 0.36, 0.03)
    const A = pointInfo(s, 6, 4, 20, 4 / s.shape)
    near(A.excess, 1.99, 0.01)
    near(A.excess * GW, 19.5, 0.01)
    near(A.u, 78.4, 0.005)
  })
})

describe('net drawing', () => {
  const s = solveNet(sheetPile({ T: 10, s: 5, hU: 5, hD: 1.5 }))
  it('Nf = 4 gives Nd = 8 and 7 interior equipotentials, 3 flow lines', () => {
    const n = netLines(s, 4)
    near(n.Nd, 8, 0.005)
    expect(n.equip.length).toBe(7)
    expect(n.flow.length).toBe(3)
    for (const l of [...n.equip, ...n.flow]) expect(l.lines.length).toBeGreaterThan(0)
  })
  it('the middle equipotential is the vertical line below the pile tip (symmetric net)', () => {
    const mid = equipotential(s, (s.g.hU + s.g.hD) / 2)
    const xs = mid.flat().map((p) => p[0])
    for (const x of xs) expect(Math.abs(x)).toBeLessThan(0.3)
  })
  it('flow lines stay in the soil and dip below the tip', () => {
    const fl = flowLine(s, s.Qgrid / 2)
    const zs = fl.flat().map((p) => p[1])
    expect(Math.min(...zs)).toBeGreaterThan(0)
    expect(Math.min(...zs)).toBeLessThan(5)
  })
  it('head is hU on the upstream bed and hD on the downstream bed', () => {
    near(headAt(s, -3, 10), s.g.hU, 1e-9)
    near(headAt(s, 3, 10), s.g.hD, 1e-9)
    expect(Number.isNaN(headAt(s, 0.5, 11))).toBe(false)
  })
})
