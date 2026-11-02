import { describe, expect, it } from 'vitest'
import { rng } from '../../labs/common'
import { BASICS_PICKS } from '../topics/basics/picks'
import { BOND_PICKS } from '../topics/bond/picks'
import { DOUBLY_PICKS } from '../topics/doubly/picks'
import { ELASTIC_PICKS } from '../topics/elastic/picks'
import { ONEWAY_PICKS } from '../topics/oneway/picks'
import { SHEAR_PICKS } from '../topics/shear/picks'
import { SINGLY_PICKS } from '../topics/singly/picks'
import { TBEAM_PICKS } from '../topics/tbeam/picks'
import { TORSION_PICKS } from '../topics/torsion/picks'
import { TWOWAY_PICKS } from '../topics/twoway/picks'
import { RC_REF_ITEMS } from '../reference'
import { choices } from './PickDrill'

const ALL = { BASICS_PICKS, BOND_PICKS, DOUBLY_PICKS, ELASTIC_PICKS, ONEWAY_PICKS, SHEAR_PICKS, SINGLY_PICKS, TBEAM_PICKS, TORSION_PICKS, TWOWAY_PICKS }

describe('"Which one?" drills', () => {
  for (const [name, skills] of Object.entries(ALL))
    for (const s of skills)
      it(`${name} / ${s.key}: answer is an option, options distinct, no NaN`, () => {
        for (let seed = 1; seed <= 300; seed++) {
          const r = rng(seed)
          const q = s.gen(r)
          const opts = choices(r, q.answer, q.options, q.options.length)
          expect(opts).toContain(q.answer)
          expect(new Set(opts).size).toBe(opts.length)
          expect(opts.length).toBeGreaterThanOrEqual(2)
          for (const t of [q.q, q.why, ...opts]) expect(t).not.toMatch(/NaN|undefined|Infinity|—/)
          if (q.ref) expect(RC_REF_ITEMS.some((it) => it.id === q.ref)).toBe(true)
        }
      })
})

describe('spot checks against the engines', () => {
  const find = (key: string) => BOND_PICKS.find((s) => s.key === key)!
  it('Table 6.1: every row/column shows up', () => {
    const seen = new Set<string>()
    for (let seed = 1; seed <= 400; seed++) seen.add(find('t61').gen(rng(seed)).answer)
    expect(seen.size).toBe(4)
  })
  it('splice class: both classes and the No. 14 case show up', () => {
    const seen = new Set<string>()
    for (let seed = 1; seed <= 400; seed++) seen.add(find('splice').gen(rng(seed)).answer)
    expect(seen.size).toBe(3)
  })
  it('shear case: all five outcomes show up', () => {
    const s = SHEAR_PICKS.find((x) => x.key === 'case')!
    const seen = new Set<string>()
    for (let seed = 1; seed <= 400; seed++) seen.add(s.gen(rng(seed)).answer)
    expect(seen.size).toBe(5)
  })
})
