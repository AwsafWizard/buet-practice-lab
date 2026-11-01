import { describe, expect, it } from 'vitest'
import { FAMILIES, makeOneWay, type Diff } from './design'

describe('one-way design problems', () => {
  for (const { v } of FAMILIES)
    for (const diff of ['paper', 'tricky'] as Diff[])
      it(`${v} / ${diff}: 20 seeds, finite and sensible`, () => {
        const hashes = new Set<string>()
        for (let seed = 1; seed <= 20; seed++) {
          const p = makeOneWay(seed, v, diff)
          expect(p.family).toBe(v)
          hashes.add(p.hash)
          for (const s of p.steps) {
            if (s.options) expect(s.options.map((o) => o.v)).toContain(s.answer)
            else expect(Number.isFinite(s.value), `${s.key} seed ${seed}`).toBe(true)
          }
          const h = p.steps.find((s) => s.key === 'h')!.value!
          expect(h).toBeGreaterThanOrEqual(4)
          expect(h).toBeLessThanOrEqual(10)
          for (const s of p.steps.filter((x) => /^(s0|s1|sp|ts)$/.test(x.key))) {
            expect(s.value!).toBeGreaterThanOrEqual(3)
            expect(s.value!).toBeLessThanOrEqual(18)
          }
          for (const s of p.steps.filter((x) => /^M|^m[np]$/.test(x.key))) expect(s.value!).toBeGreaterThan(0)
          expect(p.text).not.toMatch(/NaN|undefined/)
        }
        expect(hashes.size).toBeGreaterThan(10)
      })
  it('walls family classifies as one-way', () => {
    for (let seed = 1; seed <= 20; seed++) expect(makeOneWay(seed, 'walls', 'paper').steps.find((s) => s.key === 'cls')!.answer).toBe('one')
  })
})
