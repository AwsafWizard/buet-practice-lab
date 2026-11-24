import { describe, expect, it } from 'vitest'
import { fmtDMS, parseDMS, reducedBearing, wcbOf, bearingOf, RAD } from './angle'
import { reduceLevels } from './level'
import { solveTraverse, acres } from './traverse'
import { stadiaConstants, stadiaPoints, stadiaReduce } from './stadia'
import { aerialDistance, heron, locateTarget, spaceTriangle, towerHeight } from './height'
import { solveCurve, chords, simpleCurve } from './curve'
import { contourSegments, levels, pickInterval } from './contour'

describe('angles', () => {
  it('reads and writes DMS', () => {
    expect(parseDMS('123 30 15')).toBeCloseTo(123.50417, 4)
    expect(parseDMS("45°20'")).toBeCloseTo(45.3333, 4)
    expect(parseDMS('-2-30')).toBeCloseTo(-2.5, 6)
    expect(fmtDMS(123.5041667)).toBe('123°30′15″')
    expect(fmtDMS(59.99999)).toBe('60°00′00″')
    expect(Number.isNaN(parseDMS(''))).toBe(true)
  })
  it('converts bearings both ways', () => {
    for (const b of [10, 95, 181, 300]) {
      const r = reducedBearing(b)
      expect(wcbOf(r.ns, r.angle, r.ew)).toBeCloseTo(b, 9)
    }
    expect(reducedBearing(215.5).text).toBe('S 35°30′00″ W')
    expect(bearingOf(1, 0)).toBeCloseTo(90, 9)
    expect(bearingOf(-1, -1)).toBeCloseTo(225, 9)
  })
})

describe('level book', () => {
  const rows = [
    { stn: 'BM', bs: 1.585 },
    { is: 1.425 },
    { is: 1.87 },
    { stn: 'CP1', fs: 2.105, bs: 0.985 },
    { is: 1.1 },
    { fs: 1.5 },
  ]
  it('rise & fall and HI give the same RLs and the checks hold', () => {
    const r = reduceLevels(rows, 100)
    expect(r.rows.map((x) => +x.rl!.toFixed(3))).toEqual([100, 100.16, 99.715, 99.48, 99.365, 98.965])
    expect(r.dBSFS).toBeCloseTo(-1.035, 6)
    expect(r.ok).toBe(true)
    expect(r.hiCheck.ok).toBe(true)
    expect(r.hiCheck.lhs).toBeCloseTo(497.685, 6)
    expect(r.setups).toBe(2)
    // HI of the change point row is the old set-up's (its FS was read from there)
    expect(r.rows[3].hi).toBeCloseTo(101.585, 6)
    expect(r.rows[4].hi).toBeCloseTo(100.465, 6)
  })
  it('spreads a misclosure over the set-ups', () => {
    const r = reduceLevels(rows, 100, 98.975)
    expect(r.misclosure).toBeCloseTo(-0.01, 6)
    expect(r.rows[5].adj).toBeCloseTo(98.975, 6)
    expect(r.rows[1].adj! - r.rows[1].rl!).toBeCloseTo(0.005, 6)
  })
})

describe('closed traverse', () => {
  // a pentagon walked anticlockwise (interior on the left)
  const pts = [
    [0, 0],
    [60, -10],
    [95, 35],
    [55, 80],
    [-5, 50],
  ] // [e, n]
  const n = pts.length
  const names = ['A', 'B', 'C', 'D', 'E']
  const lengths = pts.map((p, i) => Math.hypot(pts[(i + 1) % n][0] - p[0], pts[(i + 1) % n][1] - p[1]))
  const brg = pts.map((p, i) => bearingOf(pts[(i + 1) % n][0] - p[0], pts[(i + 1) % n][1] - p[1]))
  // interior angle at i between the lines to i−1 and i+1
  const angles = pts.map((_, i) => {
    const back = (brg[(i - 1 + n) % n] + 180) % 360
    let a = (brg[i] - back + 360) % 360 // anticlockwise walk: fwd = back + angle
    if (a > 180) a = 360 - a
    return a
  })
  it('closes exactly with exact data and gets the area', () => {
    expect(angles.reduce((s, a) => s + a, 0)).toBeCloseTo(540, 6)
    const r = solveTraverse({ names, angles, lengths, bearing0: brg[0], dir: 'acw' })
    expect(r.angError).toBeCloseTo(0, 6)
    expect(r.closing).toBeLessThan(1e-6)
    let twice = 0
    for (let i = 0; i < n; i++) twice += pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1]
    expect(r.area).toBeCloseTo(Math.abs(twice) / 2, 4)
    const dmdArea = Math.abs(r.dmd.reduce((s, d) => s + d.dblArea, 0)) / 2
    expect(dmdArea).toBeCloseTo(r.area, 4)
    r.legs.forEach((l, i) => expect(l.wcb).toBeCloseTo(brg[i], 6))
  })
  it('distributes angular and linear errors, flags the wrong direction', () => {
    const noisy = angles.map((a, i) => a + (i === 2 ? 50 / 3600 : 0))
    const len2 = lengths.map((l, i) => l + (i === 1 ? 0.12 : 0))
    const r = solveTraverse({ names, angles: noisy, lengths: len2, bearing0: brg[0], dir: 'acw' })
    expect(r.angError * 3600).toBeCloseTo(50, 6)
    expect(r.closing).toBeGreaterThan(0.05)
    expect(Math.abs(r.legs.reduce((s, l) => s + l.adjLat, 0))).toBeLessThan(1e-9)
    expect(Math.abs(r.legs.reduce((s, l) => s + l.adjDep, 0))).toBeLessThan(1e-9)
    const last = r.coords[r.coords.length - 1]
    expect(last.n + r.legs[4].adjLat).toBeCloseTo(0, 9)
    const wrong = solveTraverse({ names, angles, lengths, bearing0: brg[0], dir: 'cw', compass: brg.map((b) => b + 0.5) })
    expect(wrong.closing).toBeLessThan(1e-6) // the mirror image closes too
    expect(wrong.dirHint).toBeTruthy()
  })
  it('converts to acres and decimals', () => {
    expect(acres(4046.8564224, 'm').decimals).toBeCloseTo(100, 6)
    expect(acres(43560, 'ft').acres).toBeCloseTo(1, 9)
  })
})

describe('stadia', () => {
  it('finds K and C from two shots and reduces inclined sights', () => {
    const k = stadiaConstants([
      { d: 50.3, s: 0.5 },
      { d: 100.3, s: 1.0 },
    ])!
    expect(k.K).toBeCloseTo(100, 9)
    expect(k.C).toBeCloseTo(0.3, 9)
    const r = stadiaReduce(1.5, 10, 100, 0.3)
    expect(r.hd).toBeCloseTo(150 * Math.cos(10 * RAD) ** 2 + 0.3 * Math.cos(10 * RAD), 9)
    const [p] = stadiaPoints([{ bearing: 90, upper: 1.8, lower: 1.2, va: 0 }], 100, 0, { rl: 10, hi: 1.4 })
    expect(p.hd).toBeCloseTo(60, 9)
    expect(p.e).toBeCloseTo(60, 9)
    expect(p.rl).toBeCloseTo(10 + 1.4 - 1.5, 9)
  })
})

describe('height & distance', () => {
  it('recovers a tower built backwards', () => {
    const H = 30,
      x = 20,
      a = 10,
      h1 = 1.5,
      h2 = 1.2
    const th1 = Math.atan((H - h1) / (a + x)) / RAD
    const th2 = Math.atan((H - h2) / x) / RAD
    const r = towerHeight({ a, th1, th2, h1, h2 })
    expect(r.x).toBeCloseTo(20, 9)
    expect(r.H).toBeCloseTo(30, 9)
    expect(r.Hcheck).toBeCloseTo(30, 9)
  })
  it('aerial distance and space triangle from a base', () => {
    // A at origin, B at (40, 0); targets at plan points with heights above A's line of sight
    const AB = 40
    const make = (name: string, x: number, y: number, h: number) => {
      const atA = Math.atan2(y, x) / RAD
      const atB = Math.atan2(y, AB - x) / RAD
      const vA = Math.atan(h / Math.hypot(x, y)) / RAD
      return { name, atA, atB, vA }
    }
    const F = make('F', 5, 30, 8)
    const G = make('G', 30, 45, 12)
    const Hh = make('H', 45, 20, 5)
    const P = locateTarget(AB, F)
    expect(P.x).toBeCloseTo(5, 9)
    expect(P.h).toBeCloseTo(8, 9)
    const fg = aerialDistance(AB, F, G)
    expect(fg.space).toBeCloseTo(Math.hypot(25, 15, 4), 9)
    const st = spaceTriangle(AB, F, G, Hh)
    const v1 = [25, 15, 4],
      v2 = [40, -10, -3]
    const cr = [v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]]
    expect(st.area).toBeCloseTo(Math.hypot(...cr) / 2, 6)
    expect(heron(3, 4, 5).area).toBeCloseTo(6, 12)
  })
})

describe('curve setting', () => {
  // the 18-batch curve-setting sheet and Nafim's worked solution
  const r = solveCurve({ delta: 29.33, v: (32 * 5280) / 3600, ratio: 0.15, b: 9, N: 50, peg: 10, chPI: 1662, g: 32.2 })
  it("matches the seniors' worked numbers", () => {
    expect(r.R).toBe(455)
    expect(r.h).toBeCloseTo(1.35, 9)
    expect(r.L).toBeCloseTo(67.5, 9)
    expect(r.phiS).toBeCloseTo(4.25, 2)
    expect(r.Lc).toBeCloseTo(165.4, 1)
    expect(r.shift).toBeCloseTo(0.42, 2)
    expect(r.T).toBeCloseTo(152.9, 1)
    expect(r.trans.map((t) => t.chord)).toEqual([10, 10, 10, 10, 10, 17.5])
    expect(r.trans[1].defMin).toBeCloseTo(7.46, 2)
    expect(r.trans[5].defMin).toBeCloseTo(85.0, 1)
    expect(r.circ.length).toBe(8)
    expect(r.circ[7].chord).toBeCloseTo(12.7, 1)
    expect(r.circ[0].defMin).toBeCloseTo(37.8, 1)
    expect(r.checks.E).toBeCloseTo(15.33, 1)
    expect(r.ch.A).toBeCloseTo(1509.1, 1)
  })
  it('checks hold', () => {
    expect(r.checks.lastTransDefMin).toBeCloseTo(r.checks.phiSover3Min, 9)
    expect(r.checks.totalCircMin).toBeCloseTo(r.checks.quarterMin, 1)
    expect(r.ch.D - r.ch.A).toBeCloseTo(2 * r.L + r.Lc, 9)
    expect(r.trans[r.trans.length - 1].sup).toBeCloseTo(r.h, 9)
  })
  it('chords put the odd length on the last chord', () => {
    expect(chords(45, 20)).toEqual([20, 25])
    expect(chords(45, 20, true)).toEqual([20, 20, 5])
    expect(chords(40, 20)).toEqual([20, 20])
    expect(chords(7, 10)).toEqual([7])
  })
  it('simple curve elements', () => {
    const s = simpleCurve(300, 30, 1000, 20)
    expect(s.T).toBeCloseTo(300 * Math.tan(15 * RAD), 9)
    expect(s.first).toBeCloseTo(20 - ((1000 - s.T) % 20), 6)
  })
})

describe('contours', () => {
  it('picks an interval giving at least 7 lines', () => {
    const i = pickInterval(98.2, 99.1, 7)
    expect(levels(98.2, 99.1, i).length).toBeGreaterThanOrEqual(7)
  })
  it('traces straight contours on a sloping plane', () => {
    const z = [0, 1, 2].map(() => [0, 1, 2, 3].map((c) => 100 + c * 0.5))
    const segs = contourSegments(z, 5, [100.25, 100.75])
    expect(segs.length).toBe(4)
    for (const s of segs) expect(s.a[0]).toBeCloseTo(s.b[0], 9)
    expect(segs.find((s) => s.level === 100.25)!.a[0]).toBeCloseTo(2.5, 9)
  })
})

describe("seniors' space triangle (Nafim, AB = 30 m)", () => {
  const t = (name: string, a: string, b: string, z: string) => ({ name, atA: parseDMS(a), atB: parseDMS(b), vA: 90 - parseDMS(z) })
  const F = t('F', '80 15 50', '92 05 46', '80 38 10')
  const G = t('G', '53 28 40', '121 34 00', '75 24 40')
  const H = t('H', '-2 20 10', '183 02 30', '84 34 50')
  it('reproduces the sheet', () => {
    expect(locateTarget(30, F).AP).toBeCloseTo(225.5, 0)
    expect(locateTarget(30, G).AP).toBeCloseTo(295.9, 0)
    // the sheet rounds the 0°42′ angle at E (a very thin triangle), so AE = 128.77 there vs 129.27 exact
    expect(Math.abs(locateTarget(30, H).AP - 128.77)).toBeLessThan(0.6)
    expect(locateTarget(30, F).h).toBeCloseTo(37.2, 0)
    const st = spaceTriangle(30, F, G, H)
    expect(st.FG.ground).toBeCloseTo(138.84, 0)
    expect(st.FG.space).toBeCloseTo(144.44, 0)
    expect(st.GH.space).toBeCloseTo(255.97, 0)
    expect(st.FH.space).toBeCloseTo(246.12, 0)
    expect(st.area / 17324).toBeCloseTo(1, 2)
  })
})
