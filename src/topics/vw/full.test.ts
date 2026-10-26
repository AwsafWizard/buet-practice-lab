import { describe, expect, it } from 'vitest'
import { FAMILIES, makeFull, solvable } from './full'

describe('VW full-problem generator', () => {
  for (const { v } of FAMILIES)
    it(`${v}: 80 seeds give stable, non-trivial problems`, () => {
      for (let s = 1; s <= 80; s++) {
        const p = makeFull(s, v)
        expect(p.family).toBe(v)
        expect(solvable(p)).toBe(true)
        for (const st of p.steps) expect(Number.isFinite(st.value), `${v} seed ${s} ${st.key}`).toBe(true)
        expect(Math.abs(p.steps.at(-1)!.value), `${v} seed ${s} answer`).toBeGreaterThan(1e-6)
      }
    })

  it('any-type mode reaches every family', () => {
    const seen = new Set(Array.from({ length: 60 }, (_, s) => makeFull(s + 1).family))
    expect(seen.size).toBe(FAMILIES.length)
  })

  it('settlement part of an overhang tip is the rigid-body rotation about A', () => {
    for (let s = 1; s <= 80; s++) {
      const p = makeFull(s, 'settle')
      const B = p.m.nodes.find((n) => n.id === 'B')!
      const C = p.m.nodes.find((n) => n.id === 'C')!
      if (p.m.supports[1]?.node !== 'B' || p.what !== 'Δ_C (+ = down)') continue
      const sB = -p.opts.settle!.B.dy! * 12
      expect(p.steps.find((x) => x.key === 'st')!.value).toBeCloseTo((sB * C.x) / B.x, 6)
      return
    }
    throw new Error('no overhang-settlement case in 80 seeds')
  })
})
