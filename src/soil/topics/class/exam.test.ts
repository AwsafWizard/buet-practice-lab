import { describe, expect, it } from 'vitest'
import { makeClassExam } from './exam'

describe('classification exam generator', () => {
  it('every family gives finite step values and valid choice answers', () => {
    for (const fam of ['sieve', 'uscs2', 'aashto', 'both', 'usda', 'back'] as const)
      for (let seed = 1; seed <= 60; seed++) {
        const p = makeClassExam(seed, fam)
        expect(p.text + (p.after ?? '') + p.sol).not.toMatch(/NaN|undefined|Infinity/)
        for (const s of p.steps) {
          if (s.options) expect(s.options.map((o) => o.v)).toContain(s.answer)
          else expect(Number.isFinite(s.value)).toBe(true)
        }
      }
  })
})
