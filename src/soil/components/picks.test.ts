import { describe, expect, it } from 'vitest'
import { rng } from '../../labs/common'
import { SM_REF_ITEMS } from '../reference'
import { SM_PICKS } from '../topics/picks'
import { choices } from './PickDrill'

describe('"Which one?" drills', () => {
  it('registry loads', () => expect(Object.keys(SM_PICKS).length).toBe(11))
  for (const [name, skills] of Object.entries(SM_PICKS))
    for (const s of skills)
      it(`${name} / ${s.key}: answer is an option, options distinct, no NaN`, () => {
        for (let seed = 1; seed <= 300; seed++) {
          const r = rng(seed)
          const q = s.gen(r)
          const opts = choices(r, q.answer, q.options, q.options.length)
          expect(opts).toContain(q.answer)
          expect(new Set(opts).size).toBe(opts.length)
          expect(opts.length).toBeGreaterThanOrEqual(2)
          for (const t of [q.q, q.why, ...opts]) expect(t).not.toMatch(/NaN|undefined|Infinity/)
          if (q.ref) expect(SM_REF_ITEMS.some((it) => it.id === q.ref)).toBe(true)
        }
      })
})
