import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
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
