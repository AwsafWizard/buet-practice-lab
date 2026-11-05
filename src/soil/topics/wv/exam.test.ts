import { describe, expect, it } from 'vitest'
import { makeWvExam } from './exam'

describe('weight–volume exam generator', () => {
  it('every family gives finite step values and a valid choice answer', () => {
    for (const fam of ['ucs', 'dr', 'water', 'cone', 'sat'] as const)
      for (let seed = 1; seed <= 60; seed++) {
        const p = makeWvExam(seed, fam)
        expect(p.text).not.toMatch(/NaN|undefined|Infinity/)
        for (const s of p.steps) {
          if (s.options) expect(s.options.map((o) => o.v)).toContain(s.answer)
          else expect(Number.isFinite(s.value)).toBe(true)
        }
        if (fam === 'dr') {
          const dr = p.steps.find((s) => s.key === 'Dr')!.value!
          expect(dr).toBeGreaterThan(0)
          expect(dr).toBeLessThan(100)
        }
        if (fam === 'ucs') expect(p.steps.find((s) => s.key === 'S')!.value!).toBeLessThanOrEqual(100.6)
      }
  })
})
