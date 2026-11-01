import { describe, expect, it } from 'vitest'
import type { Diff } from '../oneway/design'
import { FAMILIES, makeTwoWay } from './design'

describe('two-way design problems', () => {
  for (const { v } of FAMILIES)
    for (const diff of ['paper', 'tricky'] as Diff[])
      it(`${v} / ${diff}: 20 seeds, finite and sensible`, () => {
        for (let seed = 1; seed <= 20; seed++) {
          const p = makeTwoWay(seed, v, diff)
          expect(p.r.geo.ratio).toBeLessThan(2)
          for (const s of p.steps) {
            if (s.options) expect(s.options.map((o) => o.v)).toContain(s.answer)
            else expect(Number.isFinite(s.value), `${s.key} seed ${seed}`).toBe(true)
          }
          expect(p.r.h).toBeGreaterThanOrEqual(3.5)
          expect(p.r.h).toBeLessThanOrEqual(10)
          for (const k of ['sa', 'sb', 'ca', 'cb']) {
            const s = p.steps.find((x) => x.key === k)!.value!
            expect(s).toBeGreaterThanOrEqual(3)
            expect(s).toBeLessThanOrEqual(18)
          }
          if (v === 'corner') expect(p.r.case).toBe(4)
          if (v === 'interior') expect(p.r.case).toBe(2)
          if (v === 'edge') expect([8, 9]).toContain(p.r.case)
          expect(p.text).not.toMatch(/NaN|undefined/)
        }
      })
})
