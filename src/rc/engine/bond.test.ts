import { describe, expect, it } from 'vitest'
import {
  bar, beamBarGeometry, bundleFactor, columnAnchorage, compressionLap, cutoff, dbEquivalent, flexuralBond, hookFactors, hookGeometry, inflectionPoint, ktr,
  ldcCalc, ldGeneral, ldhCalc, ldSimplified, ldtHeaded, momentAt, psiFactors, simplifiedCase, spliceClass, standardCutoffs, stirrupAnchor, tableA10, tableA11,
  tensionLap, tieAreaCheck, upIn, xWhereMoment,
} from './bond'

/** |a − b| ≤ tol (absolute) */
const near = (a: number, b: number, tol = 0.06) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol)

describe('bars', () => {
  it('US and metric bars', () => {
    expect(bar('#11').db).toBe(1.41)
    expect(bar('#6').small).toBe(true)
    expect(bar('#7').small).toBe(false)
    expect(bar('16mm').small).toBe(true) // ≈ No. 5
    expect(bar('20mm').small).toBe(true) // 0.79 in ≈ No. 6
    expect(bar('25mm').small).toBe(false) // ≈ No. 8
    expect(bar('25mm').no).toBe(8)
  })
})

describe('handnote Example 6.1 — 2 No. 11 top bars, f′c 4000', () => {
  const b11 = bar('#11')
  const g = beamBarGeometry({ b: 10, cover: 1.5, ds: 0.375, db: b11.db, n: 2, faceCenter: 3.0 })
  const psi = psiFactors({ db: b11.db, small: false, top: true })
  const excess = 2.9 / 3.12
  it('geometry', () => {
    near(g.clearSpacing, 3.43, 0.01)
    near(g.clearSpacing / b11.db, 2.43, 0.01)
    near(g.clearSide, 1.875, 0.001)
    near(g.clearFace, 2.295, 0.01)
    near(g.spacingCC, 4.84, 0.001)
    near(g.cb, 2.42, 0.001)
    expect(g.governs).toBe('spacing')
    expect(g.legs).toBe(2)
  })
  it('(a) simplified Table 6.1 → 87 in, 81 in after excess steel', () => {
    const c = simplifiedCase({ db: b11.db, clearSpacing: g.clearSpacing, clearCover: g.clearCover, stirrupsMin: true })
    expect(c.met).toBe(true)
    const r = ldSimplified({ db: b11.db, small: false, fc: 4000, fy: 60000, met: c.met, psiT: psi.psiT, psiE: psi.psiE, excess })
    near(r.ratio, 61.7, 0.1)
    near(r.ld0, 86.9, 0.1)
    near(r.ld, 80.8, 0.1)
    expect(upIn(r.ld)).toBe(81)
  })
  it('(b) Table A.10 gives the same ld/db = 62', () => {
    expect(tableA10(4000, 60, false, true, true)).toBe(62)
  })
  it('(c) general Eq. 6.4 → 55.7 in, 52 in after excess steel', () => {
    const K = ktr(2 * 0.11, 5, 2)
    near(K, 0.88, 0.001)
    const r = ldGeneral({ db: b11.db, fc: 4000, fy: 60000, psiT: 1.3, psiE: 1, psiS: 1, cb: g.cb, Ktr: K, excess })
    near(r.conf, 2.34, 0.01)
    expect(r.capped).toBe(false)
    near(r.ratio, 39.5, 0.1)
    near(r.ld0, 55.7, 0.1)
    near(r.ld, 51.8, 0.1)
    expect(upIn(r.ld)).toBe(52)
  })
})

describe('handnote Example 6.2 — hooked No. 11 into a 21 in column', () => {
  const b11 = bar('#11')
  it('ldh = 18 in, fits in 19 in, hook details', () => {
    const f = hookFactors({ no: 11, sideCover: 4.9, tailCover: 2, confined: false })
    expect(f.psiC).toBe(0.7)
    expect(f.psiR).toBe(1)
    const r = ldhCalc({ db: b11.db, fc: 4000, fy: 60000, psiE: f.psiE, psiC: f.psiC, psiR: f.psiR, excess: 2.9 / 3.12 })
    near(r.ld0, 18.7, 0.05)
    near(r.ld, 17.4, 0.05)
    expect(upIn(r.final)).toBe(18)
    near(r.min, 11.28, 0.01)
    const fit = columnAnchorage({ colDepth: 21, backCover: 2, ldStraight: 52, ldh: r.final })
    expect(fit.available).toBe(19)
    expect(fit.hookOK).toBe(true)
    expect(fit.straightOK).toBe(false)
    const h = hookGeometry(11, b11.db, 90)
    near(h.D, 11.28, 0.01)
    near(h.tail, 16.92, 0.01)
  })
})

describe('handnote Example 6.5 — compression lap No. 11 below / No. 10 above', () => {
  it('splice 38 in; 32 in with ties at 12 in', () => {
    const ldc11 = ldcCalc({ db: 1.41, fc: 4000, fy: 60000 })
    near(ldc11.a, 26.75, 0.01)
    near(ldc11.b, 25.38, 0.01)
    const t16 = tieAreaCheck(21, 16, 0.4)
    near(t16.req, 0.504, 0.001)
    expect(t16.ok).toBe(false)
    near(t16.sMax, 12.7, 0.01)
    const r = compressionLap({ db: 1.27, fy: 60000, fc: 4000, dbLarge: 1.41, tiedOK: t16.ok })
    near(r.base, 38.1, 0.01)
    near(r.final, 38.1, 0.01)
    expect(r.governs).toBe('lsc')
    const t12 = tieAreaCheck(21, 12, 0.4)
    expect(t12.ok).toBe(true)
    const r2 = compressionLap({ db: 1.27, fy: 60000, fc: 4000, dbLarge: 1.41, tiedOK: t12.ok })
    near(r2.final, 31.6, 0.05)
  })
})

describe('handnote practice problems P1–P10', () => {
  it('P1 flexural bond', () => {
    const r = flexuralBond(50, 20, 0.9, 3 * Math.PI * 1.0)
    near(r.U, 2.78, 0.005)
    near(r.u * 1000, 295, 1)
  })
  it('P2 simplified 49 in vs general 32 in', () => {
    const g = beamBarGeometry({ b: 12, cover: 1.5, ds: 0.375, db: 1, n: 3 })
    near(g.clearSpacing, 2.625, 0.001)
    near(g.cb, 1.8125, 0.001)
    expect(g.legs).toBe(2)
    const c = simplifiedCase({ db: 1, clearSpacing: g.clearSpacing, clearCover: g.clearCover, stirrupsMin: true })
    expect(c.met).toBe(true)
    const ex = 2.1 / 2.37
    const a = ldSimplified({ db: 1, small: false, fc: 3000, fy: 60000, met: true, excess: ex })
    near(a.ld0, 54.8, 0.05)
    expect(upIn(a.ld)).toBe(49)
    const K = ktr(0.22, 6, 3)
    near(K, 0.49, 0.005)
    const b = ldGeneral({ db: 1, fc: 3000, fy: 60000, cb: g.cb, Ktr: K, excess: ex })
    near(b.conf, 2.30, 0.01)
    near(b.ld0, 35.7, 0.1)
    expect(upIn(b.ld)).toBe(32)
  })
  it('P3 epoxy top bars, product cap 1.7 → 82 in', () => {
    const g = beamBarGeometry({ b: 14, cover: 1.5, ds: 0.375, db: 1.128, n: 2 })
    const p = psiFactors({ db: 1.128, small: false, top: true, epoxy: true, clearCover: g.clearCover, clearSpacing: g.clearSpacing })
    expect(p.psiE).toBe(1.5)
    expect(p.capped).toBe(true)
    expect(p.psiTE).toBe(1.7)
    const r = ldSimplified({ db: 1.128, small: false, fc: 5000, fy: 60000, met: true, psiT: p.psiT, psiE: p.psiE })
    near(r.ratio, 72.1, 0.1)
    expect(upIn(r.ld)).toBe(82)
    const u = ldSimplified({ db: 1.128, small: false, fc: 5000, fy: 60000, met: true, psiT: 1.3 })
    near(u.ld, 62.2, 0.1)
  })
  it('P4 hooked No. 8 into an 18 in column', () => {
    const fa = hookFactors({ no: 8, sideCover: 2.5, tailCover: 2 })
    const a = ldhCalc({ db: 1, fc: 3000, fy: 60000, psiC: fa.psiC, psiR: fa.psiR, excess: 0.9 })
    near(a.ld0, 15.3, 0.05)
    expect(upIn(a.final)).toBe(14)
    const fb = hookFactors({ no: 8, sideCover: 2, tailCover: 2 })
    expect(fb.psiC).toBe(1)
    const b = ldhCalc({ db: 1, fc: 3000, fy: 60000, psiC: fb.psiC, psiR: fb.psiR, excess: 0.9 })
    near(b.final, 19.7, 0.05)
    expect(columnAnchorage({ colDepth: 18, backCover: 2, ldStraight: 99, ldh: b.final }).hookOK).toBe(false)
    const fc = hookFactors({ no: 8, sideCover: 2, tailCover: 2, confined: true })
    expect(fc.psiR).toBe(0.8)
    const c = ldhCalc({ db: 1, fc: 3000, fy: 60000, psiC: fc.psiC, psiR: fc.psiR, excess: 0.9 })
    near(c.final, 15.8, 0.05)
    expect(columnAnchorage({ colDepth: 18, backCover: 2, ldStraight: 99, ldh: c.final }).hookOK).toBe(true)
    // Fig. 6.11 case: no credit for ties
    expect(hookFactors({ no: 8, sideCover: 2, confined: true, discontinuousSmallCover: true }).psiR).toBe(1)
  })
  it('P5 headed vs hooked vs straight', () => {
    near(ldtHeaded(1.128, 5000, 60000), 15.3, 0.05)
    near(ldhCalc({ db: 1.128, fc: 5000, fy: 60000, psiC: 0.7 }).final, 13.4, 0.05)
    near(ldSimplified({ db: 1.128, small: false, fc: 5000, fy: 60000, met: true }).ld, 47.9, 0.05)
  })
  it('P6 stirrup anchorage', () => near(stirrupAnchor(0.75, 4000, 60000), 9.96, 0.01))
  it('P7 compression ld with ties and excess steel → 16 in', () => {
    const r = ldcCalc({ db: 1.128, fc: 3000, fy: 60000, confined: true, excess: 0.85 })
    near(r.a, 24.7, 0.05)
    near(r.b, 20.3, 0.05)
    near(r.final, 15.8, 0.05)
    expect(upIn(r.final)).toBe(16)
  })
  it('P8 Class A vs B', () => {
    const ld = ldSimplified({ db: 0.875, small: false, fc: 4000, fy: 60000, met: true }).ld
    near(ld, 41.5, 0.05)
    const a = spliceClass(2.4 / 1.8, 100)
    expect(a.cls).toBe('B')
    expect(upIn(tensionLap(ld, a.cls).final)).toBe(54)
    const b = spliceClass(2.4 / 1.1, 50)
    expect(b.cls).toBe('A')
    expect(upIn(tensionLap(ld, b.cls).final)).toBe(42)
  })
  it('P9 compression lap fy 75 ksi, f′c 2500, spiral → 44 in', () => {
    const r = compressionLap({ db: 1.0, fy: 75000, fc: 2500, spiral: true })
    near(r.base, 43.5, 0.01)
    near(r.lsc0, 58.0, 0.01)
    near(r.final, 43.5, 0.01)
  })
  it('P10 bundled bars', () => {
    const ld = ldSimplified({ db: 1.27, small: false, fc: 4000, fy: 60000, met: true }).ld
    near(ld, 60.2, 0.05)
    near(ld * bundleFactor(3), 72.3, 0.1)
    near(dbEquivalent(3, 1.27), 2.20, 0.01)
    near(40 * 1.27, 50.8, 0.01)
  })
})

describe('recent papers', () => {
  it('2020-21 Q8(b): 16 mm and 25 mm, f′c 3.5 ksi', () => {
    const b16 = bar('16mm'),
      b25 = bar('25mm')
    const a = ldSimplified({ db: b16.db, small: b16.small, fc: 3500, fy: 60000, met: true })
    near(a.ratio, 40.6, 0.05)
    near(a.ld, 25.6, 0.05)
    const b = ldSimplified({ db: b25.db, small: b25.small, fc: 3500, fy: 60000, met: true })
    near(b.ratio, 50.7, 0.05)
    near(b.ld, 49.9, 0.05)
  })
  it('Jan 2021 Q6 / 2014-15 Q7(c): #6 and #9 top / other, and 90° hooks', () => {
    const r = (id: string, top: boolean) => {
      const b = bar(id)
      return ldSimplified({ db: b.db, small: b.small, fc: 4000, fy: 60000, met: true, psiT: top ? 1.3 : 1 }).ld
    }
    near(r('#6', false), 28.5, 0.05)
    near(r('#6', true), 37.0, 0.05)
    near(r('#9', false), 53.5, 0.05)
    near(r('#9', true), 69.6, 0.05)
    near(ldhCalc({ db: 0.75, fc: 4000, fy: 60000 }).basic, 14.2, 0.05)
    near(ldhCalc({ db: 1.128, fc: 4000, fy: 60000 }).basic, 21.4, 0.05)
  })
  it('2013-14 Q9(b): #9 top hooked into 18 in column, 2.5 in back cover', () => {
    const h = ldhCalc({ db: 1.128, fc: 4000, fy: 60000, psiC: 0.7 })
    near(h.final, 14.98, 0.02)
    expect(columnAnchorage({ colDepth: 18, backCover: 2.5, ldStraight: 69.6, ldh: h.final }).hookOK).toBe(true)
  })
  it('Jan 2021 Q7(b): Class A / B from ld = 50 in', () => {
    expect(tensionLap(50, 'A').final).toBe(50)
    expect(tensionLap(50, 'B').final).toBe(65)
  })
  it('2009-10 Q6(d): minimum column width for hooked 20 mm bars', () => {
    const h = ldhCalc({ db: bar('20mm').db, fc: 3000, fy: 60000 })
    near(h.final, 17.25, 0.02)
    near(columnAnchorage({ colDepth: 0, backCover: 2, ldStraight: 0, ldh: h.final }).minColumn, 19.25, 0.02)
  })
})

describe('Tables A.10 / A.11 match the printed values', () => {
  it('A.10 rows (fy 60 ksi)', () => {
    // bottom, case a/b: #6- 38 34 31 ; #7+ 47 42 39
    expect([4000, 5000, 6000].map((f) => tableA10(f, 60, true, false, true))).toEqual([38, 34, 31])
    expect([4000, 5000, 6000].map((f) => tableA10(f, 60, false, false, true))).toEqual([47, 42, 39])
    // top, other cases: #6- 74 66 60 ; #7+ 92 83 76
    expect([4000, 5000, 6000].map((f) => tableA10(f, 60, true, true, false))).toEqual([74, 66, 60])
    expect([4000, 5000, 6000].map((f) => tableA10(f, 60, false, true, false))).toEqual([92, 83, 76])
    // fy 40, bottom other #7+: 47 42 39 ; fy 50 top case a #6-: 41 37 34
    expect([4000, 5000, 6000].map((f) => tableA10(f, 40, false, false, false))).toEqual([47, 42, 39])
    expect([4000, 5000, 6000].map((f) => tableA10(f, 50, true, true, true))).toEqual([41, 37, 34])
  })
  it('A.11 cells', () => {
    expect(tableA11(3, 3000, 60)).toEqual({ basic: 8, confined: 8 })
    expect(tableA11(5, 3000, 60)).toEqual({ basic: 14, confined: 10 })
    expect(tableA11(8, 3000, 60)).toEqual({ basic: 22, confined: 16 })
    expect(tableA11(11, 4000, 60)).toEqual({ basic: 27, confined: 20 })
    expect(tableA11(18, 5000, 40)).toEqual({ basic: 27, confined: 20 })
    expect(tableA11(9, 3000, 60)).toEqual({ basic: 25, confined: 19 })
  })
})

describe('cut-off', () => {
  it('simply supported: theoretical point where M = φMn of the remaining bars', () => {
    const b8 = bar('#8')
    const ld = ldSimplified({ db: 1, small: false, fc: 4000, fy: 60000, met: true }).ld
    const r = cutoff({ dg: { kind: 'ss', L: 20, wu: 5 }, b: 12, d: 17, fc: 4000, fy: 60000, bar: b8, nTotal: 3, nCut: 1, ld })
    near(momentAt({ kind: 'ss', L: 20, wu: 5 }, r.xTheo), r.remain.phiMn, 1e-6)
    near(r.ext, 17, 1e-9)
    expect(r.extGov).toBe('d')
    expect(r.xCut).toBeLessThanOrEqual(r.xExt)
    expect(r.fracOK).toBe(true)
    expect(r.ssCheck).toBeDefined()
  })
  it('cantilever: point measured from the fixed face, ld from the face governs', () => {
    const b9 = bar('#9')
    const dg = { kind: 'cant' as const, L: 8, wu: 2.5, P: 10 }
    const r = cutoff({ dg, b: 12, d: 18, fc: 4000, fy: 60000, bar: b9, nTotal: 3, nCut: 1, ld: 69.6 })
    near(momentAt(dg, r.xTheo), r.remain.phiMn, 1e-6)
    near(r.ext, 18, 1e-9)
    expect(r.xCut * 12).toBeGreaterThanOrEqual(69.6 - 1e-6)
    expect(r.ldGoverns).toBe(true)
  })
  it('continuous: inflection point and xWhereMoment are consistent', () => {
    const dg = { kind: 'cont' as const, L: 24, wu: 4, cl: 11, cr: 11 }
    const ip = inflectionPoint(dg)
    near(momentAt(dg, ip), 0, 1e-6)
    near(xWhereMoment(dg, 0), ip, 1e-6)
    const sc = standardCutoffs(24)
    expect(sc.topInterior).toBe(8)
    expect(sc.bottomCut).toBe(3)
  })
})
