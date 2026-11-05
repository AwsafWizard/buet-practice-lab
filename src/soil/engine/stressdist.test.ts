import { describe, expect, it } from 'vitest'
import {
  annulusCentre,
  boussinesq,
  boussinesqRectCentre,
  bulbDepth,
  bulbRatio,
  circleAt,
  circleCentre,
  cornerTerms,
  embankmentAt,
  embankmentBlocks,
  inPoly,
  Irect,
  KB,
  K_MAX,
  KW,
  lineEnd,
  lineFinite,
  lineInfinite,
  linearStrip,
  maxOnVertical,
  NEWMARK_RZ,
  newmarkCount,
  osterberg,
  piBranch,
  rectI,
  rectsInside,
  shapeI,
  simplifyTerms,
  stripAngles,
  stripAt,
  triStripAt,
  twoToOneCircle,
  twoToOneRect,
  type Rect,
} from './stressdist'

const near = (a: number, b: number, tol: number) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThanOrEqual(tol)
const R = (x1: number, y1: number, x2: number, y2: number): Rect => ({ x1, y1, x2, y2 })

describe('point loads', () => {
  it('KB(0) = 0.4775, KW below KB near the axis, max on a vertical line', () => {
    near(KB(0), 0.4775, 1e-4)
    near(KW(0), 0.3183, 1e-4)
    expect(KW(0.5) / KB(0.5)).toBeLessThan(0.8)
    near(K_MAX, 0.0888, 1e-4)
    const m = maxOnVertical(20, 2)
    near(m.beta, 39.23, 0.01)
    near(m.z, 2.449, 0.001)
    near(m.sigma, 0.444, 0.001) // 2012-13 Q9(c): 0.44 kPa
    // numerically the max on r = 2
    let best = 0
    for (let z = 0.5; z < 6; z += 0.001) best = Math.max(best, boussinesq(20, 2, z))
    near(best, m.sigma, 1e-5)
  })
  it('2017-18 Q8(b): 60.7 kPa at (7.5, 15); max 78.9 kPa at z = 9.19 m', () => {
    near(boussinesq(50000, 7.5, 15), 60.7, 0.05)
    const m = maxOnVertical(50000, 7.5)
    near(m.z, 9.19, 0.01)
    near(m.sigma, 78.9, 0.05)
  })
  it('2021-22 Q4(a): two footings as point loads → ≈ 2.9 kPa', () => {
    near(boussinesq(300, 0, 8.5), 1.98, 0.01)
    near(boussinesq(300, 5, 8.5), 0.94, 0.01)
    near(boussinesq(300, 0, 8.5) + boussinesq(300, 5, 8.5), 2.92, 0.01)
  })
})

describe('line and strip loads', () => {
  it('finite line formula = integral; long line → half the infinite value; 2012-13 Q12(c) 28.8 kPa', () => {
    near(lineEnd(75, 9, 3), 7.93, 0.01)
    near(lineEnd(100, 6, 3), 10.44, 0.01)
    near(lineEnd(75, 9, 3) + 2 * lineEnd(100, 6, 3), 28.8, 0.05)
    near(lineFinite(75, 0, 0, 9, 3), lineEnd(75, 9, 3), 1e-9)
    near(lineFinite(10, 2, -1e4, 1e4, 3), lineInfinite(10, 2, 3), 1e-6)
    near(lineEnd(10, 1e5, 3), lineInfinite(10, 0, 3) / 2, 1e-6)
  })
  it('strip: closed form = textbook angle formula = numeric integral of line loads', () => {
    for (const [x, z] of [[0, 1], [1.5, 2], [-3, 0.7], [4, 5]]) {
      const B = 3
      const { alpha, delta } = stripAngles(B, x, z)
      near(stripAt(100, B, x, z), (100 / Math.PI) * (alpha + Math.sin(alpha) * Math.cos(alpha + 2 * delta)), 1e-9)
      let s = 0
      const n = 4000
      for (let i = 0; i < n; i++) s += lineInfinite((100 * B) / n, x - (-B / 2 + (B * (i + 0.5)) / n), z)
      near(stripAt(100, B, x, z), s, 1e-4)
    }
    near(stripAt(1, 2, 0, 1e-6), 1, 1e-6)
  })
  it('triangular strip = numeric integral; Das textbook check under the high edge', () => {
    let s = 0
    const n = 4000
    for (let i = 0; i < n; i++) {
      const r = (4 * (i + 0.5)) / n
      s += lineInfinite((100 * r) / 4 * (4 / n), 3 - r, 2)
    }
    near(triStripAt(100, 4, 3, 2), s, 1e-4)
    near(linearStrip(0, 0, 4, 100, 4, 1e-6), 50, 0.01) // at the surface, under the high edge: half the jump
  })
})

describe('embankments (Osterberg)', () => {
  it('formula limits: b/z = 0, a/z = 5 → 0.437; b/z → ∞ → 0.5', () => {
    near(osterberg(5, 0, 1), 0.437, 0.001)
    near(osterberg(1, 1e6, 1), 0.5, 1e-5)
    near(osterberg(0, 2, 1), stripAt(1, 2, 1, 1), 1e-9) // vertical face = edge of a strip of width b
  })
  it('Das Ex. 7.7 (SJMY Lecture 23): a = 30, b = 10, z = 10 ft, q = 2300 psf → Iz = 0.480, σ = 2208 psf', () => {
    near(osterberg(30, 10, 10), 0.48, 0.001)
    near(2 * osterberg(30, 10, 10) * 2300, 2205, 1) // the lecture rounds Iz to 0.480 → 2208
    const e = { c: 20, h: 1, gamma: 2300, aL: 30, aR: 30 }
    near(embankmentAt(e, 40, 10), 2 * osterberg(30, 10, 10) * 2300, 1e-6)
  })
  it('2017-18 Q8(c): half Iz = 0.426, σ = 3.41 ksf', () => {
    near(osterberg(20, 15, 21), 0.426, 0.001)
    near(2 * osterberg(20, 15, 21) * 4, 3.41, 0.01)
  })
  it('Jan 2021 Q4(b): A ≈ 89 kPa, B ≈ 93 kPa; blocks = exact integral', () => {
    const e = { c: 8, h: 5, gamma: 19, aL: 10, aR: 25 }
    const A = embankmentBlocks(e, 10, 2)!
    near(A.blocks[1].I, 0.5, 0.001)
    near(A.blocks[0].I, 0.437, 0.001)
    near(A.sigma, 89, 0.5)
    near(embankmentAt(e, 10, 2), A.sigma, 1e-6)
    const B = embankmentBlocks(e, 14, 3)!
    near(B.blocks[0].I, 0.488, 0.001)
    near(B.blocks[1].I, 0.495, 0.001)
    near(B.sigma, 93.3, 0.3)
    near(embankmentAt(e, 14, 3), B.sigma, 1e-6)
    expect(embankmentBlocks(e, 3, 2)).toBeNull()
  })
})

describe('circles', () => {
  it('centre formula, annulus, off-centre numeric', () => {
    near(circleCentre(200, 4, 4), 129.3, 0.05) // 2007-08 Q2(a)
    near(annulusCentre(1, 0, 3, 2), circleCentre(1, 3, 2), 1e-12)
    near(circleAt(100, 2, 0.001, 2, 80, 144), circleCentre(100, 2, 2), 0.1)
    expect(circleAt(100, 2, 4, 2)).toBeLessThan(circleAt(100, 2, 1, 2))
  })
  it('Newmark radii', () => {
    const want = [0.27, 0.4, 0.518, 0.637, 0.766, 0.918, 1.11, 1.387, 1.908]
    NEWMARK_RZ.forEach((v, i) => near(v, want[i], 0.001))
  })
})

describe('rectangles (Fadum)', () => {
  it('I(m, n) spot values and symmetry; +π branch', () => {
    near(Irect(1, 1), 0.1752, 1e-4)
    near(Irect(0.6, 0.6), 0.1069, 1e-4)
    near(Irect(0.6, 1.2), 0.1431, 1e-4)
    near(Irect(0.6, 0.4), 0.0801, 1e-4)
    near(Irect(0.5, 0.5), 0.084, 1e-4)
    near(Irect(2, 0.5), 0.135, 1e-4)
    near(Irect(1.25, 1.25), 0.2, 0.0005)
    near(Irect(3.75, 1.25), 0.2196, 1e-4)
    near(Irect(3, 1.5), Irect(1.5, 3), 1e-12)
    expect(piBranch(3, 3)).toBe(true)
    near(Irect(50, 50), 0.25, 1e-3)
    // continuity across the branch
    near(Irect(1.5, 1.8027), Irect(1.5, 1.8028), 1e-4)
    near(Irect(Infinity, Infinity), 0.25, 1e-12)
  })
  it('rectI: centre = 4 corners, point outside by ± rectangles', () => {
    near(rectI(R(-1, -2, 1, 2), 0, 0, 5), 4 * Irect(0.2, 0.4), 1e-12)
    near(rectI(R(0, 0, 2, 3), 0, 0, 2), Irect(1, 1.5), 1e-12)
    const t = simplifyTerms(cornerTerms(R(0, 0, 2, 3), 0, 0, 2))
    expect(t.length).toBe(1)
  })
  it('2010-11 Q8(b): 2 × 4 m, 8 t/m², z = 5 → centre 1.05, corner 0.75 t/m²', () => {
    near(8 * rectI(R(-1, -2, 1, 2), 0, 0, 5), 1.05, 0.005)
    near(8 * Irect(0.4, 0.8), 0.745, 0.005)
  })
  it('2023-24 Q8(b): 4 × 6 m, 4800 kN, 6 m below the centre → 49 kPa (I = 0.0612)', () => {
    near(Irect(2 / 6, 3 / 6), 0.0612, 1e-4)
    near(boussinesqRectCentre(200, 4, 6, 6), 49, 0.05)
  })
  it('2020-21 Q4(d): P 1 m outside AD on the mid-line → 15.3 kPa', () => {
    // ABCD: x 0..3, y −1..1; P at (−1, 0)
    near(150 * rectI(R(0, -1, 3, 1), -1, 0, 2), 15.3, 0.05)
  })
  it('2021-22 Q1(c)/2(c): T at the re-entrant corner → ΣI = 0.330, 66 kPa (200) and 49.5 kPa (150)', () => {
    // P at origin; bar: x −3..6, y 0..3; stem: x 0..3, y −2..0
    const T = [R(-3, 0, 6, 3), R(0, -2, 3, 0)]
    near(shapeI(T, 0, 0, 5), 0.3301, 2e-4)
    near(200 * shapeI(T, 0, 0, 5), 66, 0.1)
    near(150 * shapeI(T, 0, 0, 5), 49.5, 0.1)
  })
  it('2009-10 Q8(c): stem 1.5 m → 37.5 kPa', () => near(120 * shapeI([R(-3, 0, 6, 3), R(0, -1.5, 3, 0)], 0, 0, 5), 37.5, 0.1))
  it('2011-12 Q7(c): L-shape, 8 m below the interior corner → 46.5 kPa', () => {
    const L = [R(-10, 0, 0, 10), R(-10, -10, 0, 0), R(0, -10, 30, 0)]
    near(75 * shapeI(L, 0, 0, 8), 46.5, 0.1)
  })
  it('2008-09 Q7(b): L-shape, 10 m below P → 43.8 kPa', () => {
    const L = [R(-10, 0, 0, 10), R(-10, -15, 15, 0)]
    near(shapeI(L, 0, 0, 10), 0.5845, 5e-4)
    near(75 * shapeI(L, 0, 0, 10), 43.8, 0.1)
  })
  it('2023-24 Q7(a): notched 6 × 9 m — reading A (scan labels: P 3 m from the left edge) 80 kPa; handnote reading B 54 kPa', () => {
    // outline x 0..6, y 0..9 (y down from the top); notch x 0..3, y 3..6
    const shape = [R(0, 0, 6, 3), R(3, 3, 6, 6), R(0, 6, 6, 9)]
    near(shapeI(shape, 3, 4.5, 3), 0.534, 0.001)
    near(150 * shapeI(shape, 3, 4.5, 3), 80.1, 0.1)
    near(shapeI(shape, 1.5, 4.5, 3), 0.358, 0.001)
    near(150 * shapeI(shape, 1.5, 4.5, 3), 53.7, 0.2)
  })
})

describe('Newmark mesh counting', () => {
  it('circle under its centre: 2007-08 Q2(a) N ≈ 129 meshes', () => {
    const c = newmarkCount((x, y) => x * x + y * y <= 16, 4, 10)
    near(c.N, 129.3, 1)
    expect(c.perRing.slice(0, 6).every((v) => Math.abs(v - 20) < 1e-9)).toBe(true)
  })
  it('T at the re-entrant corner: N ≈ 66 (= ΣI/0.005)', () => {
    const T = [R(-3, 0, 6, 3), R(0, -2, 3, 0)]
    const c = newmarkCount(rectsInside(T), 5, 10)
    near(c.N, shapeI(T, 0, 0, 5) / 0.005, 1)
  })
  it('polygon test', () => {
    const sq: [number, number][] = [[0, 0], [2, 0], [2, 2], [0, 2]]
    expect(inPoly(sq, 1, 1)).toBe(true)
    expect(inPoly(sq, 3, 1)).toBe(false)
  })
})

describe('2:1 and pressure bulbs', () => {
  it('2:1 formulas', () => {
    near(twoToOneRect(250, 2, 3, 3), 8.333, 1e-3)
    near(twoToOneCircle(500, 2, 2), 39.79, 0.01)
  })
  it('0.1q bulb: ≈ 2B for square / circle, ≈ 6B for strip (SJMY: 0.1q at ≈ 3B–4B on the slides)', () => {
    const sq = bulbDepth('square', 1)
    expect(sq).toBeGreaterThan(1.8)
    expect(sq).toBeLessThan(2.2)
    const ci = bulbDepth('circle', 1)
    expect(ci).toBeGreaterThan(1.6)
    expect(ci).toBeLessThan(2.1)
    const st = bulbDepth('strip', 1)
    expect(st).toBeGreaterThan(5)
    // at z = 2B: square ≈ 0.08–0.1, strip ≈ 0.3
    near(bulbRatio('strip', 1, 0, 2), 0.31, 0.02)
    expect(bulbRatio('square', 1, 0, 2)).toBeLessThan(0.11)
  })
})
