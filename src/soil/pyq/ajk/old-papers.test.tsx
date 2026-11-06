// AJK sir's half of the seven old papers (2007-08 … 2015-16): every part has a valid id, finite checks, renders
// cleanly, and the key numbers match the digests' quick checks.
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SM_PAPERS, type SmQ } from '../../types'
import { A2007 } from './s2007'
import { A2008 } from './s2008'
import { A2009 } from './s2009'
import { A2010 } from './s2010'
import { A2011 } from './s2011'
import { A2012 } from './s2012'
import { A2015 } from './s2015'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

const SETS: [string, SmQ[]][] = [
  ['2015-16', A2015],
  ['2012-13', A2012],
  ['2011-12', A2011],
  ['2010-11', A2010],
  ['2009-10', A2009],
  ['2008-09', A2008],
  ['2007-08', A2007],
]

const all = SETS.flatMap(([, s]) => s)
const val = (id: string, key: string) => all.find((q) => q.id === id)?.checks?.().find((c) => c.key === key)?.value ?? NaN

describe("AJK sir's half, old papers", () => {
  for (const [paper, set] of SETS) {
    it(`${paper}: ids, section, numbers`, () => {
      const p = SM_PAPERS.find((x) => x.id === paper)!
      expect(set.length).toBeGreaterThan(0)
      const ids = set.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const q of set) {
        expect(q.paper).toBe(paper)
        expect(q.sec, q.id).toBe(p.ajk)
        expect(q.id.startsWith(`sm-${paper}-`), q.id).toBe(true)
        expect(q.topics.length).toBeGreaterThan(0)
        expect(q.pages.every((pg) => p.pages.includes(pg)), q.id).toBe(true)
        if (!q.theory) expect(q.checks, q.id).toBeTruthy()
        for (const c of q.checks?.() ?? []) expect(Number.isFinite(c.value), `${q.id} ${c.key}`).toBe(true)
      }
    })
    it(`${paper}: figures and solutions render without NaN`, () => {
      for (const q of set) {
        if (q.figure) expect(wrap(q.figure()), q.id).not.toContain('NaN')
        expect(q.solution, q.id).toBeTruthy()
        expect(wrap(q.solution!()), q.id).not.toContain('NaN')
      }
    })
  }

  it('oracle values from the digests', () => {
    const near = (a: number, b: number, t: number) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThanOrEqual(t)
    near(val('sm-2015-16-1', 'FS'), 1.86, 0.01)
    near(val('sm-2015-16-2', 'phiE'), 30.7, 0.05)
    near(val('sm-2015-16-3', 'P'), 25.5, 0.1)
    near(val('sm-2015-16-4', 'F'), 402.5, 0.2)
    near(val('sm-2015-16-6', 'P'), 1099, 2)
    near(val('sm-2015-16-7', 'pc'), 68, 1)
  })
})
