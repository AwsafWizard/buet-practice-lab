import { describe, expect, it } from 'vitest'
import { H, model, Mm, Pm, W, Wn, Wv, Wx } from '../kit/builders'
import { solve } from './frame2d'
import { engineAt, inclinedWork, isInclined } from './inclined'
import type { Model } from './model'

const close = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-6 * Math.max(1, Math.abs(b)))

const s = Math.SQRT1_2
const CASES: [string, Model][] = [
  [
    'trapezoidal three-hinged frame',
    model('A:0,0 B:14,14 C*:34,14 D:54,14 E:68,0', 'A-B B-C C-D D-E', 'A:pin E:pin', [
      { kind: 'point', member: 'AB', a: 7 * Math.SQRT2, fx: 20 * s, fy: -20 * s },
      { kind: 'point', member: 'DE', a: 7 * Math.SQRT2, fx: -10 * s, fy: -10 * s },
      W('BC', 2),
      W('CD', 2),
    ]),
  ],
  ['inclined leg, load per horizontal ft', model('A:0,0 B:0,16 C:16,16 D:28,0', 'A-B B-C C-D', 'A:pin D:roller', [Pm('BC', 8, 20), { kind: 'dist', member: 'CD', w1: -2, dir: 'y', proj: true }])],
  ['gable frame, fixed bases, mixed loads', model('A:0,0 B:0,12 C:15,20 D:30,12 E:30,0', 'A-B B-C C-D E-D', 'A:fixed E:fixed', [Wv('BC', 1, 3, { a: 2, b: 12 }), Wn('CD', 1.5), Mm('BC', 5, 30), Pm('CD', 4, 10), H('B', 6)])],
  ['cantilever strut pointing down-right', model('A:0,10 B:12,2', 'A-B', 'A:fixed', [Wx('AB', 2, 0.5), Pm('AB', 9, 8), W('AB', 1, { a: 3, b: 11 })])],
]

describe('inclined member walk-through matches the solver', () => {
  for (const [name, m] of CASES)
    it(name, () => {
      const r = solve(m)
      const ids = m.members.filter((x) => isInclined(m, x.id)).map((x) => x.id)
      expect(ids.length).toBeGreaterThan(0)
      for (const id of ids) {
        const w = inclinedWork(m, r, id)
        const mr = r.member(id)
        const mem = m.members.find((x) => x.id === id)!
        const flip = w.start !== mem.i
        expect(w.cuts.length).toBeGreaterThanOrEqual(2)
        for (const c of [...w.cuts, ...w.peaks]) {
          const e = engineAt(mr, flip, c.t, c.side)
          close(c.N, e.N)
          close(c.Vs, e.V)
          close(c.M, e.M)
        }
        for (const p of w.peaks) expect(Math.abs(p.Vs)).toBeLessThan(1e-6)
      }
    })
})
