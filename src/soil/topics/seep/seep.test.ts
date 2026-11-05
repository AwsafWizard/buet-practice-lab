import { describe, expect, it } from 'vitest'
import mod from './index'
import { makeSeepProblem } from './Problems'

describe('seepage exam generator', () => {
  for (const fam of ['profile', 'pile', 'dam', 'heave', 'filter'] as const)
    for (const level of ['basic', 'exam', 'tough'] as const)
      it(`${fam} / ${level}: finite step values, no NaN in the text`, () => {
        for (let seed = 1; seed <= (fam === 'pile' || fam === 'dam' ? 3 : 25); seed++) {
          const p = makeSeepProblem(seed, fam, level)
          expect(p.text).not.toMatch(/NaN|undefined|Infinity/)
          for (const s of p.steps) if (s.value !== undefined) expect(Number.isFinite(s.value)).toBe(true)
        }
      })
})

describe('seepage practice problems', () => {
  for (const q of mod.problems)
    it(`${q.id}: checks are finite`, () => {
      for (const c of q.checks!()) expect(Number.isFinite(c.value)).toBe(true)
    })
  it('theory ids unique', () => expect(new Set(mod.theory.map((t) => t.id)).size).toBe(mod.theory.length))
})
