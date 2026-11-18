import { describe, expect, it } from 'vitest'
import { CHART_2017, CHART_2021, CHART_2324, GRID_T05C, curveDepthAt, isoFromCurves, isoFromGrid, isoRemoval, minTimeForRemoval, tankSize, terminalVelocity, typeIColumn, waterAt } from './settle'

const t05b = [
  { t: 60, C: 189 },
  { t: 80, C: 180 },
  { t: 100, C: 168 },
  { t: 130, C: 156 },
  { t: 200, C: 111 },
  { t: 240, C: 78 },
  { t: 420, C: 27 },
]

describe('settle (TA T05 oracles)', () => {
  it('T05-A: 0.5 mm, SG 2.65, 20 °C: Stokes 0.224 m/s (Re 112, invalid); iteration converges to 0.090 m/s (slide says 0.11)', () => {
    const r = terminalVelocity({ d: 0.5e-3, sg: 2.65 })
    expect(r.vStokes).toBeCloseTo(0.224, 2)
    expect(r.reStokes).toBeGreaterThan(100)
    expect(r.stokesValid).toBe(false)
    expect(r.v).toBeCloseTo(0.09, 2)
    expect(r.Re).toBeCloseTo(45, -1)
    expect(r.CD).toBeCloseTo(1.32, 1)
    expect(r.regime).toBe('transition')
  })
  it('Stokes is valid for fine silt (0.01 mm → 1e-4 m/s, Table 4-1)', () => {
    const r = terminalVelocity({ d: 1e-5, sg: 2.65 })
    expect(r.stokesValid).toBe(true)
    expect(r.v).toBeCloseTo(9e-5, 5)
  })
  it('water properties interpolate', () => {
    expect(waterAt(20).mu).toBeCloseTo(1.002e-3, 6)
    expect(waterAt(22.5).mu).toBeLessThan(1.002e-3)
  })
  it('T05-B with H/t exact: x0 = 0.554, R ≈ 70 %', () => {
    const r = typeIColumn({ H: 1.8, C0: 300, data: t05b, v0: 25 / 1440 })
    expect(r.x0).toBeCloseTo(0.554, 2)
    expect(r.R).toBeGreaterThan(0.69)
    expect(r.R).toBeLessThan(0.715)
  })
  it('T05-B with the class velocity column (3, 2.5, 2, 1.55, 1, 0.83, 0.43): x0 ≈ 0.54 and R ≈ 72 %', () => {
    const r = typeIColumn({ H: 1.8, C0: 300, data: t05b, v0: 25 / 1440, v: [3, 2.5, 2, 1.55, 1, 0.83, 0.43].map((v) => v / 100) })
    expect(r.x0).toBeCloseTo(0.54, 2)
    expect(r.R).toBeGreaterThan(0.705)
    expect(r.R).toBeLessThan(0.735)
  })
  it('T05-C by interpolating the grid: r0 ≈ 42.4, five strips, R ≈ 63 % (class 63 %)', () => {
    const r = isoFromGrid(GRID_T05C, 3, 105)
    expect(r.r0).toBeGreaterThan(42)
    expect(r.r0).toBeLessThan(43)
    expect(r.strips.length).toBe(6)
    expect(r.strips[0].zMid).toBeCloseTo(2.55, 1)
    expect(r.strips[1].zMid).toBeCloseTo(1.75, 1)
    expect(r.R).toBeGreaterThan(62.5)
    expect(r.R).toBeLessThan(64.2)
  })
  it('T05-C with the class strips: r0 0.43 + 0.622/3 = 63.7 % (written 0.61 → 63.3 %)', () => {
    const z = [2.6, 1.8, 1.2, 0.8, 0.45, 0.15]
    const dr = [0.07, 0.1, 0.1, 0.1, 0.1, 0.1]
    const s = dr.reduce((a, d, i) => a + d * z[i], 0)
    expect(s).toBeCloseTo(0.622, 3)
    expect(43 + (s / 3) * 100).toBeCloseTo(63.7, 1)
  })
  it('T05-D: 15 000 m³/d, v0 20 m/d, 3.5 m → A 750 m², V 2625 m³, t 4.2 h, overflow 0.83 m/h', () => {
    const t = tankSize({ Q: 15000, v0: 20, depth: 3.5, n: 2, LW: 3.1 })
    expect(t.A).toBe(750)
    expect(t.V).toBe(2625)
    expect(t.tHours).toBeCloseTo(4.2, 1)
    expect(t.overflowMh).toBeCloseTo(0.833, 2)
    expect(t.Aunit).toBe(375)
  })
  it('2017-18 Q3(b) from the curves: t = 90 min → 66.5 %, t = 180 min → 84.2 %', () => {
    const a = isoFromCurves(CHART_2017.curves, 3, 90)
    expect(a.r0).toBe(45)
    expect(a.R).toBeCloseTo(66.5, 0)
    const b = isoFromCurves(CHART_2017.curves, 3, 180)
    expect(b.r0).toBe(70)
    expect(b.R).toBeCloseTo(84.2, 0)
  })
  it('2017-18 Q3(b) from the printed grid agrees within 2 points', () => {
    const a = isoFromGrid(CHART_2017.grid!, 3, 90)
    const b = isoFromGrid(CHART_2017.grid!, 3, 180)
    expect(Math.abs(a.R - 66.5)).toBeLessThan(2)
    expect(Math.abs(b.R - 84.2)).toBeLessThan(2.5)
  })
  it('2020-21 Q5(a): 3 m, 20 min → r0 20 %, ΔR strips, R ≈ 40 %', () => {
    const r = isoFromCurves(CHART_2021.curves, 3, 20)
    expect(r.r0).toBe(20)
    expect(r.R).toBeGreaterThan(39)
    expect(r.R).toBeLessThan(41.5)
  })
  it('2023-24 Q1(c): 85 % needs the 80 % curve extended: t ≈ 165–175 min, flagged extrapolated', () => {
    const f = (t: number) => isoFromCurves(CHART_2324.curves, 2.5, t).R
    const t = minTimeForRemoval(f, 85, 400)!
    expect(t).toBeGreaterThan(150)
    expect(t).toBeLessThan(190)
    expect(isoFromCurves(CHART_2324.curves, 2.5, t).extrapolated).toBe(true)
    expect(isoFromCurves(CHART_2324.curves, 2.5, 90).extrapolated).toBe(false)
  })
  it('curveDepthAt interpolates and extends', () => {
    expect(curveDepthAt({ r: 1, pts: [[0, 0], [10, 1], [20, 3]] }, 15).z).toBe(2)
    const e = curveDepthAt({ r: 1, pts: [[0, 0], [10, 1], [20, 3]] }, 25)
    expect(e.z).toBe(4)
    expect(e.extrapolated).toBe(true)
  })
  it('isoRemoval: no curve at the bottom → r0 = 0 and the last strip runs to the surface', () => {
    const r = isoRemoval({ H: 2, t0: 10, r0: 0, levels: [{ r: 50, z: 1 }] })
    expect(r.R).toBeCloseTo((50 * 1.5 + 50 * 0.5) / 2, 6)
  })
})
