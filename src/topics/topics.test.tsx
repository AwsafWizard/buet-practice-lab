import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { solve } from '../engine/frame2d'
import { buildTruss, type TrussType } from '../labs/trusses'
import { MODULES } from './modules'

describe('truss library', () => {
  for (const type of ['pratt', 'howe', 'warren', 'parker', 'roof'] as TrussType[])
    for (const n of [4, 6])
      it(`${type} n=${n} is stable`, () => {
        const { model } = buildTruss({ type, n, w: 10, h: 12, loads: Array(n - 1).fill(10) })
        expect(() => solve(model)).not.toThrow()
      })
})

describe('topic modules render', () => {
  for (const [id, load] of Object.entries(MODULES)) {
    it(id, async () => {
      const mod = await load()
      const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)
      wrap(<mod.Overview />)
      wrap(<mod.Approach />)
      wrap(<mod.Lab />)
      for (const q of mod.problems) {
        for (const c of q.checks?.() ?? []) expect(Number.isFinite(c.value), `${q.id} ${c.key}`).toBe(true)
        if (q.figure) wrap(q.figure())
        if (q.solution) expect(wrap(q.solution())).not.toContain('NaN')
      }
    })
  }
})
