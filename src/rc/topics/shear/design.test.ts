import { describe, expect, it } from 'vitest'
import { LEVELS } from '../tbeam/designShell'
import { makeSDesign, S_FAMILIES } from './design'

describe('shear design generator', () => {
  for (const f of S_FAMILIES)
    for (const l of LEVELS)
      it(`${f.v} / ${l.v}: 20 seeds, finite and sensible`, () => {
        for (let s = 1; s <= 20; s++) {
          const p = makeSDesign(s, f.v, l.v)
          expect(p.family).toBe(f.v)
          for (const st of p.steps) if (!st.options) expect(Number.isFinite(st.value), `${s} ${st.key}`).toBe(true)
          expect(['B', 'C', 'D']).toContain(p.at.case)
          expect(p.at.s).toBeGreaterThanOrEqual(3)
          expect(p.at.s).toBeLessThanOrEqual(24)
          expect(p.main.Vd).toBeGreaterThan(p.dsg.lim.halfPhiVc)
          expect(p.dsg.total).toBeGreaterThan(1)
          expect(p.dsg.total).toBeLessThanOrEqual(60)
          expect(p.text).not.toMatch(/undefined|NaN/)
        }
      })
  it('tough level reaches Case D', () => {
    expect(Array.from({ length: 20 }, (_, i) => makeSDesign(i + 1, 'factored', 'tough')).some((p) => p.main.cases.includes('D'))).toBe(true)
  })
})
