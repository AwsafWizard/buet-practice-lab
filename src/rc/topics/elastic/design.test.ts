import { describe, expect, it } from 'vitest'
import { DIFFS } from '../singly/designCore'
import { checkProblem } from '../singly/designCheck'
import { E_FAMILIES, makeElasticDesign } from './design'

describe('elastic / WSD design problems', () => {
  for (const fam of E_FAMILIES)
    for (const diff of DIFFS)
      it(`${fam.v} / ${diff.v}: 20 seeds`, () => {
        for (let seed = 1; seed <= 20; seed++) {
          const p = makeElasticDesign(seed * 7919, fam.v, diff.v)
          const ctx = `${fam.v}/${diff.v}/${seed}`
          const val = checkProblem(p, ctx)
          const M = val('m')!
          expect(M, ctx).toBeGreaterThan(20)
          expect(M, ctx).toBeLessThan(1000)
          const k = val('k')
          if (k !== undefined) {
            expect(k, ctx).toBeGreaterThan(0.25)
            expect(k, ctx).toBeLessThan(0.5)
          }
          if (fam.v === 'wsd') {
            expect(val('h')!, ctx).toBeLessThanOrEqual(48)
            expect(val('fs')!, ctx).toBeLessThanOrEqual(24.01)
          }
          if (fam.v === 'service') {
            expect(val('mcr')!, ctx).toBeLessThan(M)
            expect(val('fs')!, ctx).toBeGreaterThan(15)
            expect(val('fs')!, ctx).toBeLessThan(50)
          }
          if (fam.v === 'wsdFixed' && diff.v === 'hard') expect(p.steps.find((s) => s.key === 'comp')!.choice!.answer, ctx).toBe('y')
        }
      })
})
