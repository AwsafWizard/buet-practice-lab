import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { groupOfRef } from '../reference/drawer'
import { REF_ITEMS } from '../reference'
import { GIVEN, givenRefs } from './given'
import { ALL_PYQ } from './index'

// Usage: npx vitest run src/pyq            (all papers)
//        PAPER=2022-23 npx vitest run src/pyq   (one paper, prints check values)
const only = process.env.PAPER
const list = ALL_PYQ.filter((q) => !only || q.paper === only)

describe('past questions render and compute', () => {
  for (const q of list) {
    it(q.id, () => {
      expect(q.text.length).toBeGreaterThan(10)
      expect(q.topics.length).toBeGreaterThan(0)
      const checks = q.checks?.() ?? []
      for (const c of checks) {
        expect(Number.isFinite(c.value), `${q.id} check ${c.key} = ${c.value}`).toBe(true)
      }
      if (only) console.log(q.id, checks.map((c) => `${c.key}=${+c.value.toFixed(4)}${c.unit ? ' ' + c.unit : ''}`).join(' | '))
      if (q.figure) renderToString(<MemoryRouter>{q.figure()}</MemoryRouter>)
      if (q.solution) {
        const html = renderToString(<MemoryRouter>{q.solution()}</MemoryRouter>)
        expect(html).not.toContain('NaN')
        expect(html).not.toContain('Couldn’t render')
      }
    })
  }
})

describe('tables printed with the papers', () => {
  it('every code question has a "given" list and every list points at real things', () => {
    const ids = new Set(REF_ITEMS.map((i) => i.id))
    for (const q of ALL_PYQ.filter((q) => q.paper !== 'own' && q.topics.some((t) => t === 'wind' || t === 'eq' || t === 'code')))
      expect(GIVEN[q.id], q.id).toBeDefined()
    for (const [qid, list] of Object.entries(GIVEN)) {
      expect(ALL_PYQ.some((q) => q.id === qid), qid).toBe(true)
      for (const g of list) if (g.ref) expect(ids.has(g.ref), `${qid} → ${g.ref}`).toBe(true)
      for (const ref of givenRefs(qid)) expect(groupOfRef(ref), ref).toBe(REF_ITEMS.find((i) => i.id === ref)!.group)
    }
  })
})
