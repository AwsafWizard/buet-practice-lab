import { describe, expect, it } from 'vitest'
import { DIFFS } from '../singly/designCore'
import { checkProblem } from '../singly/designCheck'
import { D_FAMILIES, makeDoublyDesign } from './design'

describe('doubly design problems', () => {
  for (const fam of D_FAMILIES)
    for (const diff of DIFFS)
      it(`${fam.v} / ${diff.v}: 20 seeds`, () => {
        for (let seed = 1; seed <= 20; seed++) {
          const p = makeDoublyDesign(seed * 7919, fam.v, diff.v)
          const ctx = `${fam.v}/${diff.v}/${seed}`
          const val = checkProblem(p, ctx)
          expect(p.steps.find((s) => s.key === 'need')!.choice!.answer, ctx).toBe('y')
          expect(val('pmn')!, ctx).toBeGreaterThanOrEqual(val('pmn1')! * 1.1)
          expect(val('et')!, ctx).toBeGreaterThanOrEqual(0.004 - 1e-9)
          expect(val('fsp')!, ctx).toBeLessThanOrEqual(72.5)
          expect(val('nt')!, ctx).toBeLessThanOrEqual(8)
          expect(val('nc')!, ctx).toBeLessThanOrEqual(6)
          if (diff.v === 'hard') expect(p.steps.find((s) => s.key === 'yield')!.choice!.answer, ctx).toBe('n')
        }
      })
})
