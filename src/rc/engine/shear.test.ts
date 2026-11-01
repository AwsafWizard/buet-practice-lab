import { describe, expect, it } from 'vitest'
import { autoSpacings, bwdRequired, checkLayout, designShear, layoutRun, positionsOf, shearAt, shearDiagram, shearLimits, shearRuns, type ShearBeam } from './shear'

const near = (a: number, b: number, rel = 0.005, abs = 0.02) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('Nilson Ex 5.1: size without web steel', () => {
  it('bw·d = 569 in² (none) and 284.6 in² (with Av,min)', () => {
    near(bwdRequired(27, 4000), 569.2, 0.002)
    near(bwdRequired(27, 4000, { withMin: true }), 284.6, 0.002)
  })
})

describe('Nilson Ex 5.2 / 5.3: 20 ft span, wu = 9.4 k/ft, 16 × 22, #3 U', () => {
  const bm: ShearBeam = { kind: 'ss', L: 20, wD: 9.4, factored: true }
  const sec = { bw: 16, d: 22, fc: 4000, fy: 60000, Av: 0.22 }
  const lim = shearLimits(sec)
  const runs = shearRuns(shearDiagram(bm), bm, sec)
  const r = runs.find((x) => x.id === 'sL')!
  it('Vc, φVc, φVc/2, Vu at the face and at d', () => {
    near(lim.Vc, 44.5, 0.003)
    near(lim.phiVc, 33.4, 0.003)
    near(lim.halfPhiVc, 16.7, 0.003)
    near(r.Vface, 94)
    near(r.Vd, 76.8, 0.002)
  })
  it('zero excess at 6.45 ft, min steel to 8.22 ft, s_max from 4.35 ft', () => {
    near(r.uPhiVc! / 12, 6.45, 0.002)
    near(r.uHalf! / 12, 8.22, 0.002)
    near(r.uSmax! / 12, 4.34, 0.003)
  })
  it('Case C at d: Av/s = 0.0438, s = 5.02 in, s_max = 11 in; min-steel spacings 17.4 / 16.5 in', () => {
    const a = shearAt(r.Vd, sec)
    expect(a.case).toBe('C')
    near(a.avs, 0.0438, 0.005)
    near(a.sCalc, 5.02, 0.004)
    expect(a.sMax).toBe(11)
    near(0.22 / lim.avsMin1, 17.4, 0.005)
    near(0.22 / lim.avsMin2, 16.5, 0.002)
    near(lim.phiVs4, 66.8, 0.003)
  })
  it('book pattern with spacings 5, 7, 11: 2 in + 7 @ 5 + 2 @ 7 + 4 @ 11 = 95 in, 14 stirrups', () => {
    const lay = layoutRun(r, [5, 7, 11])
    expect(lay.first).toBe(2)
    expect(lay.zones.map((z) => [z.s, z.n])).toEqual([
      [5, 7],
      [7, 2],
      [11, 4],
    ])
    near(lay.last, 95)
    expect(lay.count).toBe(14)
    expect(checkLayout(r, lay).ok).toBe(true)
  })
  it('the checker flags a too-wide zone', () => {
    const bad = positionsOf(2, [
      { s: 7, n: 5 },
      { s: 11, n: 6 },
    ])
    const c = checkLayout(r, bad)
    expect(c.ok).toBe(false)
    expect(c.spaces[0].ok).toBe(false)
  })
  it('auto layout with 3 sets starts at 5 in and ends at 11 in with no violation', () => {
    const sp = autoSpacings(r, 3)
    expect(sp[0]).toBe(5)
    expect(sp.at(-1)).toBe(11)
    const lay = layoutRun(r, sp)
    expect(checkLayout(r, lay).ok).toBe(true)
    expect(lay.count).toBeLessThanOrEqual(14)
  })
  it('symmetric: the right-hand run is the mirror image', () => {
    const d = designShear(bm, sec)
    expect(d.layouts.sR.count).toBe(d.layouts.sL.count)
  })
})

describe('class example (B pp 42–47): midspan Pu, b = 10, d = 20, f′c = 4 ksi', () => {
  const sec = { bw: 10, d: 20, fc: 4000, fy: 60000, Av: 0.22 }
  const lim = shearLimits(sec)
  it('common values', () => {
    near(lim.Vc, 25.3, 0.002)
    near(lim.phiVc, 18.97, 0.002)
    near(lim.halfPhiVc, 9.49, 0.002)
    near(lim.phiVs4, 37.95, 0.002)
    near(lim.phiVs8, 75.89, 0.002)
    near(lim.VuMax, 94.87, 0.002)
    near(lim.avsMin1, 0.0079, 0.01)
    near(lim.avsMin2, 0.0083, 0.01)
  })
  const cases: [number, string, number | null][] = [
    [16, 'A', null],
    [30, 'B', 10],
    [60, 'C', 10],
    [100, 'C', 6.38],
    [160, 'D', 3.24],
    [190, 'redesign', null],
  ]
  for (const [Pu, cs, s] of cases)
    it(`Pu = ${Pu}: case ${cs}${s ? `, s = ${s}` : ''}`, () => {
      const a = shearAt(Pu / 2, sec)
      expect(a.case).toBe(cs)
      if (s) near(a.s, s, 0.004)
    })
  it('Pu = 30 needs 26.4 in by Av,min, capped at d/2 = 10; Pu = 60 sCalc 18.0', () => {
    near(shearAt(15, sec).sCalc, 26.4, 0.004)
    near(shearAt(30, sec).sCalc, 18.0, 0.004)
    near(shearAt(30, sec).avs, 0.01225, 0.005)
  })
  it('as a beam: Vu = Pu/2 constant, layout by run reaches midspan', () => {
    const bm: ShearBeam = { kind: 'ss', L: 20, P: [{ x: 10, P: 100 }], factored: true }
    const d = designShear(bm, sec, { nSets: 1 })
    const r = d.runs.find((x) => x.id === 'sL')!
    near(r.Vd, 50)
    near(r.len, 120)
    expect(d.spacings.sL).toEqual([6])
    expect(checkLayout(r, d.layouts.sL).ok).toBe(true)
  })
})

describe('papers: two point loads + UDL (3 sets of spacing)', () => {
  it('2021-22 Q3(a): 36 ft, 40 k at 10 and 26 ft, 2 k/ft incl. sw, 14 × 26, f′c 4 ksi', () => {
    const bm: ShearBeam = { kind: 'ss', L: 36, wD: 2, P: [{ x: 10, P: 40 }, { x: 26, P: 40 }], factored: true }
    const sec = { bw: 14, d: 26, fc: 4000, fy: 60000 }
    const dg = shearDiagram(bm)
    near(dg.R[0], 76)
    near(dg.V(10, 'R'), 16)
    const d = designShear(bm, sec)
    const r = d.runs.find((x) => x.id === 'sL')!
    near(r.Vd, 71.67, 0.002)
    near(d.lim.phiVc, 34.53, 0.002)
    expect(shearAt(r.Vd, sec).case).toBe('C')
    // between the loads Vu ≤ 16 < φVc/2 = 17.3: no stirrups needed, required region ends at the load
    near(r.uReqEnd / 12, 10, 0.01)
    expect(checkLayout(r, d.layouts.sL).ok).toBe(true)
  })
  it('2023-24 Q5(c): 35 ft, 40 k at 10 and 25 ft, 2 k/ft + 1.2 × self-weight (h = 28), 14 × 25, f′c 3.5 ksi', () => {
    const bm: ShearBeam = { kind: 'ss', L: 35, wD: 2, P: [{ x: 10, P: 40 }, { x: 25, P: 40 }], factored: true, selfWeight: { b: 14, h: 28 } }
    const sec = { bw: 14, d: 25, fc: 3500, fy: 60000 }
    const dg = shearDiagram(bm)
    near(dg.R[0], 83.6, 0.002)
    near(dg.V(10, 'R'), 18.7, 0.003)
    const d = designShear(bm, sec)
    const r = d.runs.find((x) => x.id === 'sL')!
    near(r.Vd, 78.4, 0.002)
    near(d.lim.phiVc, 31.06, 0.002)
    expect(checkLayout(r, d.layouts.sL).ok).toBe(true)
    // nominal stirrups between the loads
    const dn = designShear(bm, sec, { nominal: true })
    expect(dn.layouts.sL.last).toBeGreaterThan(17.5 * 12 - 13)
  })
})

describe('overhang, cantilever, patterns, factors', () => {
  it('2005-06 Q3(c)-style overhang: reactions and overhang run', () => {
    // symmetric: 45 k at both tips, 93.6 k at midspan? use a simple check of statics instead
    const bm: ShearBeam = { kind: 'ss', L: 20, ohL: 5, ohR: 5, wD: 2, P: [{ x: 0, P: 10 }, { x: 30, P: 10 }], factored: true }
    const dg = shearDiagram(bm)
    near(dg.R[0], 40)
    near(dg.V(5, 'L'), -20)
    near(dg.V(5, 'R'), 20)
    const sec = { bw: 12, d: 18, fc: 4000, fy: 60000 }
    const runs = shearRuns(dg, bm, sec)
    expect(runs.map((r) => r.id)).toEqual(['ohL', 'sL', 'sR', 'ohR'])
    near(runs[0].Vface, 20)
  })
  it('cantilever: Vu at the fixed end = wu L', () => {
    const bm: ShearBeam = { kind: 'cant', L: 10, wD: 1.5, wL: 2 }
    const dg = shearDiagram(bm)
    near(dg.V(0, 'R'), (1.2 * 1.5 + 1.6 * 2) * 10)
    near(dg.wu, 5)
  })
  it('1.4D governs with no live load', () => {
    const bm: ShearBeam = { kind: 'ss', L: 10, wD: 2 }
    near(shearDiagram(bm).Vmax(0, 'R'), 14)
  })
  it('live-load patterns raise the span shear when the overhang is unloaded', () => {
    const bm: ShearBeam = { kind: 'ss', L: 20, ohR: 8, wD: 1, wL: 2, patterns: true }
    const full = shearDiagram({ ...bm, patterns: false })
    const pat = shearDiagram(bm)
    expect(pat.Vmax(0, 'R')).toBeGreaterThan(full.V(0, 'R') + 0.5)
  })
  it('φ = 0.85 flag for old papers', () => {
    const d = designShear({ kind: 'ss', L: 20, wD: 5, factored: true }, { bw: 12, d: 20, fc: 3000, fy: 40000, phi: 0.85 })
    expect(d.flags.some((f) => f.includes('0.85'))).toBe(true)
  })
})
