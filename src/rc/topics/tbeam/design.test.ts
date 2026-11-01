import { describe, expect, it } from 'vitest'
import { LEVELS } from './designShell'
import { makeTDesign, T_FAMILIES } from './design'

describe('T-beam design generator', () => {
  for (const f of T_FAMILIES)
    for (const l of LEVELS)
      it(`${f.v} / ${l.v}: 20 seeds, finite and sensible`, () => {
        for (let s = 1; s <= 20; s++) {
          const p = makeTDesign(s, f.v, l.v)
          expect(p.family).toBe(f.v)
          for (const st of p.steps) if (!st.options) expect(Number.isFinite(st.value), `${s} ${st.key}`).toBe(true)
          expect(p.beff.b).toBeGreaterThan(p.g.bw)
          expect(p.fl.wu).toBeGreaterThan(0.5)
          expect(p.mid.Mu).toBeGreaterThan(20)
          expect(p.mid.n).toBeGreaterThanOrEqual(2)
          expect(p.mid.n).toBeLessThanOrEqual(10)
          expect(p.mid.rev.phiMn).toBeGreaterThanOrEqual(p.mid.Mu - 1e-6)
          expect(p.mid.rev.epsT).toBeGreaterThanOrEqual(0.004)
          if (f.v === 'continuous') expect(p.sup!.rev.phiMn).toBeGreaterThanOrEqual(p.sup!.Mu - 1e-6)
          expect(p.text).not.toMatch(/undefined|NaN/)
        }
      })
  it('level mix', () => {
    const rect = Array.from({ length: 20 }, (_, i) => makeTDesign(i + 1, 'girder', 'tough')).filter((p) => !p.mid.des.rect).length
    expect(rect).toBeGreaterThan(0)
    expect(Array.from({ length: 20 }, (_, i) => makeTDesign(i + 1, 'simple', 'basic')).every((p) => p.mid.des.rect)).toBe(true)
  })
})
