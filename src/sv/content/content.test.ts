import { describe, expect, it } from 'vitest'
import { SV_TOPICS } from '../registry'
import { INST_POOL, SV_CARDS, SV_LEARN, SV_QUESTIONS } from './index'
import { blankOk } from '../components/Quiz'
import { DRILLS, rng } from '../drills/gens'
import { KINDS } from '../field/kinds'

const dollars = (s: string) => (s.replace(/\\\$/g, '').match(/\$/g) ?? []).length

describe('CE 104 question bank', () => {
  it('has every topic covered', () => {
    for (const t of SV_TOPICS) {
      expect(SV_QUESTIONS.filter((q) => q.topic === t.id).length, t.id).toBeGreaterThanOrEqual(25)
      expect(SV_CARDS.filter((c) => c.topic === t.id).length, t.id).toBeGreaterThanOrEqual(10)
      expect(SV_LEARN[t.id], t.id).toBeTruthy()
    }
    expect(INST_POOL().length).toBeGreaterThanOrEqual(80)
  })
  it('ids are unique and well formed', () => {
    const q = SV_QUESTIONS.map((x) => x.id)
    expect(new Set(q).size).toBe(q.length)
    for (const id of q) expect(id).toMatch(/^q-[a-z]+-\d+$/)
    const c = SV_CARDS.map((x) => x.id)
    expect(new Set(c).size).toBe(c.length)
  })
  it('every question is answerable', () => {
    for (const q of SV_QUESTIONS) {
      expect(q.why.length, q.id).toBeGreaterThan(5)
      expect(dollars(q.q) % 2, q.id + ' unbalanced $').toBe(0)
      if (q.kind === 'mcq') {
        expect(q.opts.length, q.id).toBeGreaterThanOrEqual(3)
        expect(new Set(q.opts).size, q.id + ' duplicate options').toBe(q.opts.length)
        expect(q.a >= 0 && q.a < q.opts.length, q.id).toBe(true)
      } else if (q.kind === 'blank') {
        expect(q.q.match(/_{3,}/g)?.length, q.id + ' needs one ___').toBe(1)
        expect(q.a.length, q.id).toBeGreaterThan(0)
        for (const a of q.a) expect(blankOk(a, q.a), q.id + ' accepts its own answer').toBe(true)
      } else expect(typeof q.a, q.id).toBe('boolean')
    }
  })
  it('typed answers are matched loosely but not too loosely', () => {
    expect(blankOk('Optical  Square', ['optical square'])).toBe(true)
    expect(blankOk('540', ['540°'])).toBe(true)
    expect(blankOk('0.0673', ['0.0673'])).toBe(true)
    expect(blankOk('100', ['66'])).toBe(false)
    expect(blankOk('', ['x'])).toBe(false)
  })
})

describe('CE 104 drills', () => {
  it('every generator gives finite answers for many seeds', () => {
    for (const g of DRILLS)
      for (let s = 1; s <= 40; s++) {
        const d = g.make(rng(s * 7919))
        expect(d.answers.length, g.id).toBeGreaterThan(0)
        for (const a of d.answers) expect(isFinite(a.value), `${g.id} seed ${s} ${a.label}`).toBe(true)
        expect(d.q.length).toBeGreaterThan(10)
      }
  })
})

describe('CE 104 field-book kinds', () => {
  it('blank and example data build', () => {
    for (const k of KINDS) {
      expect(k.blank()).toBeTruthy()
      if (k.sample) expect(k.sample()).toBeTruthy()
    }
  })
})
