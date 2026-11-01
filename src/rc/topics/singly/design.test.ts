import { describe, expect, it } from 'vitest'
import { DIFFS } from './designCore'
import { checkProblem } from './designCheck'
import { makeSinglyDesign, S_FAMILIES } from './design'

describe('singly design problems', () => {
  for (const fam of S_FAMILIES)
    for (const diff of DIFFS)
      it(`${fam.v} / ${diff.v}: 20 seeds`, () => {
        for (let seed = 1; seed <= 20; seed++) {
          const p = makeSinglyDesign(seed * 7919, fam.v, diff.v)
          const ctx = `${fam.v}/${diff.v}/${seed}`
          const val = checkProblem(p, ctx)
          expect(p.family).toBe(fam.v)
          const mu = val('mu') ?? val('mu2') ?? val('mneg')!
          expect(mu, ctx).toBeGreaterThan(20)
          expect(mu, ctx).toBeLessThan(1500)
          for (const k of ['n', 'nt', 'nb']) {
            const n = val(k)
            if (n !== undefined) {
              expect(n, ctx).toBeGreaterThanOrEqual(2)
              expect(n, ctx).toBeLessThanOrEqual(8)
            }
          }
          const et = val('et')
          if (et !== undefined) expect(et, ctx).toBeGreaterThanOrEqual(0.004)
          if (p.final) {
            expect(p.final.h, ctx).toBeGreaterThanOrEqual(12)
            expect(p.final.h, ctx).toBeLessThanOrEqual(48)
          }
        }
      })
  it('is deterministic for a seed', () => {
    expect(makeSinglyDesign(42, undefined, 'exam').text).toBe(makeSinglyDesign(42, undefined, 'exam').text)
  })
})
