import { describe, expect, it } from 'vitest'
import { ildAt } from '../engine/ild'
import { analyseTruss, buildPlayTruss, jointShares, memberILD } from './playtruss'

describe('truss playground', () => {
  const t = buildPlayTruss({ type: 'pratt', n: 6, w: 10, h: 10, deck: 'bottom' })

  it('splits a load between deck joints by the lever rule', () => {
    const s = jointShares(t, 23, 10)
    expect(s.map((q) => q.node)).toEqual(['L2', 'L3'])
    expect(s[0].F).toBeCloseTo(7)
    expect(s[1].F).toBeCloseTo(3)
  })

  it('member force = P × ILD ordinate (+ dead load × sum of joint ordinates)', () => {
    for (const id of ['U2U3', 'L2L3', 'U2L3', 'L1U1']) {
      const ild = memberILD(t, id)
      const r = analyseTruss(t, 27, 12, 2)
      const dead = 2 * t.deckXY.reduce((s, q) => s + ildAt(ild, q.x), 0)
      expect(r.forces.get(id)!).toBeCloseTo(12 * ildAt(ild, 27) + dead)
    }
  })

  it('chord force matches the beam analogy M / h', () => {
    // top chord U2U3 is cut with moment centre L3 (x = 30): F = −M_L3 / h
    const r = analyseTruss(t, 30, 10)
    const M = 5 * 30 // R = 5 each for a central load
    expect(r.forces.get('U2U3')!).toBeCloseTo(-M / 10)
  })

  it('Pratt hanger L1U1 only works when the load is in its panels', () => {
    const ild = memberILD(t, 'L1U1')
    expect(ildAt(ild, 10)).toBeCloseTo(1)
    expect(ildAt(ild, 30)).toBeCloseTo(0)
  })

  it('every truss type and deck builds and solves', () => {
    for (const type of ['pratt', 'howe', 'warren', 'parker', 'roof', 'xbraced'] as const)
      for (const deck of ['bottom', 'top'] as const) {
        const b = buildPlayTruss({ type, n: 6, w: 12, h: 12, deck })
        expect(b.det.stable).toBe(true)
        expect(() => analyseTruss(b, 31, 10, 1)).not.toThrow()
      }
  })
})
