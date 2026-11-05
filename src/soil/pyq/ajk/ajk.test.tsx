// AJK sir's half of the six recent papers: every part has a valid id, finite checks, and renders cleanly.
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SM_PAPERS, type SmQ } from '../../types'
import { A2016 } from './s2016'
import { A2017 } from './s2017'
import { A2020 } from './s2020'
import { A2021 } from './s2021'
import { A2023 } from './s2023'
import { AJAN21 } from './sjan21'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

const SETS: [string, SmQ[]][] = [
  ['2023-24', A2023],
  ['2021-22', A2021],
  ['2020-21', A2020],
  ['jan-2021', AJAN21],
  ['2017-18', A2017],
  ['2016-17', A2016],
]

const val = (q: SmQ | undefined, key: string) => q?.checks?.().find((c) => c.key === key)?.value ?? NaN
const byId = (id: string) => SETS.flatMap(([, s]) => s).find((q) => q.id === id)

describe("AJK sir's half, recent papers", () => {
  for (const [paper, set] of SETS) {
    it(`${paper}: ids, section, numbers`, () => {
      const p = SM_PAPERS.find((x) => x.id === paper)!
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
    const near = (a: number, b: number, t: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(t)
    near(val(byId('sm-2023-24-1a'), 'w'), 16.56, 0.01)
    near(val(byId('sm-2023-24-2a'), 'F'), 112.5, 0.1)
    near(val(byId('sm-2023-24-2a'), 'M'), 164.4, 0.1)
    near(val(byId('sm-2023-24-4b'), 'LL'), 61.7, 0.05)
  })
})
