import { describe, expect, it } from 'vitest'
import { ildAt } from '../engine/ild'
import { analyseFloor, buildFloor, floorILDs, floorPickILD, type PlayFloor } from './playfloor'

const ss = (fbs: number[]): PlayFloor => ({ girder: { L: 40, supports: [{ id: 1, x: 0, type: 'pin' }, { id: 2, x: 40, type: 'roller' }], hinges: [] }, floorBeams: fbs })

describe('floor-system playground', () => {
  it('stringer splits the load by the lever rule onto two floor beams', () => {
    const b = buildFloor(ss([0, 10, 20, 30, 40]))
    const r = analyseFloor(b, 14, 10, 15)
    const loads = Object.fromEntries(r.fbLoads.map((f) => [f.x, f.F]))
    expect(loads[10]).toBeCloseTo(6)
    expect(loads[20]).toBeCloseTo(4)
    expect(loads[0] + loads[30] + loads[40]).toBeCloseTo(0)
    expect(r.reactions[0].R + r.reactions[1].R).toBeCloseTo(10)
  })

  it('panel ILD is the direct ILD straightened between panel points', () => {
    const b = buildFloor(ss([0, 10, 20, 30, 40]))
    const ild = floorILDs(b, 15)
    // at panel points the two agree
    for (const x of [0, 10, 20, 30, 40]) expect(ildAt(ild.M, x)).toBeCloseTo(ildAt(ild.directM, x))
    // mid-panel at S the floor system gives less than the direct peak
    expect(ildAt(ild.M, 15)).toBeCloseTo((ildAt(ild.M, 10) + ildAt(ild.M, 20)) / 2)
    expect(ildAt(ild.M, 15)).toBeLessThan(ildAt(ild.directM, 15))
    // panel shear is the same anywhere inside one panel
    expect(ildAt(ild.V, 12)).toBeCloseTo(ildAt(floorILDs(b, 18).V, 12))
  })

  it('section value = P × ILD ordinate', () => {
    const b = buildFloor(ss([0, 8, 16, 24, 32, 40]))
    const r = analyseFloor(b, 21, 12, 13)
    const ild = floorILDs(b, 13)
    expect(12 * ildAt(ild.M, 21)).toBeCloseTo(r.MS)
    expect(12 * ildAt(ild.V, 21)).toBeCloseTo(r.VS)
  })

  it('floor-beam load ILD is a triangle of height 1 over its two panels', () => {
    const b = buildFloor(ss([0, 10, 20, 30, 40]))
    const ild = floorPickILD(b, { kind: 'fb', x: 20 })
    expect(ildAt(ild, 20)).toBeCloseTo(1)
    expect(ildAt(ild, 15)).toBeCloseTo(0.5)
    expect(ildAt(ild, 10)).toBeCloseTo(0)
  })

  it('Gerber girder with a hinge works; a mechanism is flagged', () => {
    const g = buildFloor({ girder: { L: 40, supports: [{ id: 1, x: 0, type: 'pin' }, { id: 2, x: 16, type: 'roller' }, { id: 3, x: 40, type: 'roller' }], hinges: [{ id: 4, x: 24 }] }, floorBeams: [0, 8, 16, 24, 32, 40] })
    expect(g.fs).not.toBeNull()
    expect(() => analyseFloor(g, 30, 1, 28)).not.toThrow()
    const bad = buildFloor({ ...ss([0, 20, 40]), girder: { ...ss([]).girder, hinges: [{ id: 3, x: 20 }] } })
    expect(bad.fs).toBeNull()
  })
})
