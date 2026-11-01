import { describe, expect, it } from 'vitest'
import { ildAt } from './ild'
import { analyse, buildBeam, reactionILD, sectionILDs, type PlayBeam } from './playbeam'

const ss: PlayBeam = { L: 20, supports: [{ id: 1, x: 0, type: 'pin' }, { id: 2, x: 20, type: 'roller' }], hinges: [] }

describe('beam playground', () => {
  it('simply supported: reactions, section values and ILD agree', () => {
    const bb = buildBeam(ss)
    expect(bb.det.label).toBe('determinate')
    const r = analyse(bb, 5, 10, 8)
    expect(r.reactions[0].R).toBeCloseTo(7.5)
    expect(r.reactions[1].R).toBeCloseTo(2.5)
    expect(r.VS).toBeCloseTo(-2.5)
    expect(r.MS).toBeCloseTo(2.5 * 12)
    const ild = sectionILDs(bb, 8)
    expect(10 * ildAt(ild.V, 5)).toBeCloseTo(r.VS)
    expect(10 * ildAt(ild.M, 5)).toBeCloseTo(r.MS)
    expect(ildAt(ild.M, 8)).toBeCloseTo((8 * 12) / 20)
    // shear ILD jumps by 1 at the section
    expect(ildAt(ild.V, 8, 1) - ildAt(ild.V, 8, -1)).toBeCloseTo(1)
  })

  it('max BMD sits under the load', () => {
    const r = analyse(buildBeam(ss), 5, 10, 8)
    const peak = r.M.reduce((a, b) => (b.y > a.y ? b : a))
    expect(peak.x).toBeCloseTo(5)
    expect(peak.y).toBeCloseTo((10 * 5 * 15) / 20)
  })

  it('all rollers get a hidden horizontal restraint', () => {
    const bb = buildBeam({ ...ss, supports: ss.supports.map((s) => ({ ...s, type: 'roller' as const })) })
    expect(bb.hiddenX).toBe(true)
    expect(bb.det.stable).toBe(true)
    expect(analyse(bb, 10, 1, 4).reactions[0].R).toBeCloseTo(0.5)
  })

  it('Gerber beam: moment at the hinge is zero for any load position', () => {
    const bb = buildBeam({ L: 40, supports: [{ id: 1, x: 0, type: 'pin' }, { id: 2, x: 16, type: 'roller' }, { id: 3, x: 40, type: 'roller' }], hinges: [{ id: 4, x: 22 }] })
    expect(bb.det.label).toBe('determinate')
    const ild = sectionILDs(bb, 22)
    for (const p of ild.M.pts) expect(Math.abs(p.y)).toBeLessThan(1e-6)
    // a load right on the hinge is carried by the overhang of A–B, so the far roller feels nothing
    expect(ildAt(reactionILD(bb, 40, 'y'), 22)).toBeCloseTo(0)
    expect(ildAt(reactionILD(bb, 40, 'y'), 40)).toBeCloseTo(1)
  })

  it('propped cantilever (indeterminate): R_B = 5P/16 for a midspan load', () => {
    const bb = buildBeam({ L: 20, supports: [{ id: 1, x: 0, type: 'fixed' }, { id: 2, x: 20, type: 'roller' }], hinges: [] })
    expect(bb.det.label).toBe('indeterminate')
    expect(bb.det.dosi).toBe(1)
    const r = analyse(bb, 10, 16, 5)
    expect(r.reactions[1].R).toBeCloseTo(5)
    expect(r.reactions[0].M).toBeCloseTo((3 * 16 * 20) / 16)
    expect(ildAt(reactionILD(bb, 20, 'y'), 10)).toBeCloseTo(5 / 16)
  })

  it('a hinge too many is a mechanism', () => {
    const bb = buildBeam({ ...ss, hinges: [{ id: 3, x: 10 }] })
    expect(bb.det.stable).toBe(false)
  })

  it('load and section at a support or end do not throw', () => {
    const bb = buildBeam({ L: 30, supports: [{ id: 1, x: 5, type: 'pin' }, { id: 2, x: 25, type: 'roller' }], hinges: [] })
    for (const x of [0, 5, 25, 30])
      for (const s of [0, 5, 25, 30]) {
        expect(() => analyse(bb, x, 1, s)).not.toThrow()
        expect(() => sectionILDs(bb, s)).not.toThrow()
      }
    // overhang load lifts the far support
    expect(analyse(bb, 0, 10, 15).reactions[1].R).toBeCloseTo(-2.5)
  })
})
