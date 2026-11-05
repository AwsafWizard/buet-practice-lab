import { describe, expect, it } from 'vitest'
import { makePlastExam } from './exam'

describe('plasticity exam generator', () => {
  it('every family gives finite step values and valid choice answers', () => {
    for (const fam of ['cup', 'cone', 'onept', 'shrink', 'two', 'act'] as const)
      for (let seed = 1; seed <= 60; seed++) {
        const p = makePlastExam(seed, fam)
        expect(p.text + (p.after ?? '') + p.sol).not.toMatch(/NaN|undefined|Infinity/)
        for (const s of p.steps) {
          if (s.options) expect(s.options.map((o) => o.v)).toContain(s.answer)
          else expect(Number.isFinite(s.value)).toBe(true)
        }
        if (fam === 'shrink') {
          const SL = p.steps.find((s) => s.key === 'SL')!.value!
          expect(SL).toBeGreaterThan(5)
          expect(SL).toBeLessThan(25)
        }
      }
  })
})
