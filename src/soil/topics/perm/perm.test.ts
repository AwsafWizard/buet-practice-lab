import { describe, expect, it } from 'vitest'
import mod from './index'
import { permResults, PERM_DEFAULT } from './Labs'
import { makePermProblem } from './Problems'

describe('permeability exam generator', () => {
  for (const fam of ['const', 'fall', 'scale', 'layers', 'pump', 'cap'] as const)
    for (const level of ['basic', 'exam', 'tough'] as const)
      it(`${fam} / ${level}`, () => {
        for (let seed = 1; seed <= 30; seed++) {
          const p = makePermProblem(seed, fam, level)
          expect(p.text).not.toMatch(/NaN|undefined|Infinity/)
          for (const s of p.steps) if (s.value !== undefined) expect(Number.isFinite(s.value)).toBe(true)
        }
      })
  it('2012-13 Q10(c) preset: k 1.06e-2, vs 0.075', () => {
    const r = permResults(PERM_DEFAULT)
    expect(Math.abs(r.k - 1.06e-2)).toBeLessThan(5e-5)
    expect(Math.abs(r.vs - 0.075)).toBeLessThan(5e-4)
  })
  for (const q of mod.problems) it(`${q.id} checks finite`, () => q.checks!().forEach((c) => expect(Number.isFinite(c.value)).toBe(true)))
})
