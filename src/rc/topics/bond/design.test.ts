import { describe, expect, it } from 'vitest'
import { LEVELS } from '../tbeam/designShell'
import { B_FAMILIES, makeBDesign } from './design'

describe('bond design generator', () => {
  for (const f of B_FAMILIES)
    for (const l of LEVELS)
      it(`${f.v} / ${l.v}: 20 seeds, finite and sensible`, () => {
        for (let s = 1; s <= 20; s++) {
          const p = makeBDesign(s, f.v, l.v)
          expect(p.family).toBe(f.v)
          for (const st of p.steps) if (!st.options) expect(Number.isFinite(st.value), `${s} ${st.key}`).toBe(true)
          expect(p.n).toBeGreaterThanOrEqual(2)
          expect(p.n).toBeLessThanOrEqual(6)
          expect(p.ld.r.final).toBeGreaterThanOrEqual(12)
          expect(p.ld.r.final).toBeLessThan(150)
          expect(p.ld.method).toBe(l.v === 'tough' ? 'general' : 'simplified')
          if (p.co) {
            expect(p.co.xCut).toBeGreaterThan(0)
            expect(p.co.xCut).toBeLessThan(p.L)
          }
          if (p.lap) expect(p.lap.final).toBeGreaterThanOrEqual(p.ld.r.ld0 - 1e-9)
          expect(p.text).not.toMatch(/undefined|NaN/)
        }
      })
  it('splice classes both appear', () => {
    const cls = new Set(Array.from({ length: 30 }, (_, i) => makeBDesign(i + 1, 'splice', 'exam').cls!.cls))
    expect(cls.size).toBe(2)
  })
})
