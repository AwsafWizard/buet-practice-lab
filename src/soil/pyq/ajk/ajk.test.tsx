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
    near(val(byId('sm-2023-24-3a'), 'phie'), 29.7, 0.1)
    near(val(byId('sm-2023-24-4a'), 'cu'), 1.91, 0.01)
    // 2021-22
    near(val(byId('sm-2021-22-5b'), 'LL'), 46.7, 0.05)
    near(val(byId('sm-2021-22-5d'), 'af2'), 1.087, 0.002)
    near(val(byId('sm-2021-22-7a'), 'phi'), 25.86, 0.02)
    near(val(byId('sm-2021-22-7c'), 'c'), 17.8, 0.1)
    near(val(byId('sm-2021-22-7d'), 'cu'), 35.26, 0.02)
    near(val(byId('sm-2021-22-8a'), 'cu'), 73.8, 0.2)
    near(val(byId('sm-2021-22-8c'), 'pa'), 160.1, 0.1)
    // 2020-21
    near(val(byId('sm-2020-21-5b'), 'LL'), 62.0, 0.05)
    near(val(byId('sm-2020-21-5c'), 'gi'), 31, 0)
    near(val(byId('sm-2020-21-6b'), 'c'), 19.9, 0.05)
    near(val(byId('sm-2020-21-7b'), 'pa'), 273.5, 0.1)
    near(val(byId('sm-2020-21-7d'), 'D'), 346.6, 0.1)
    near(val(byId('sm-2020-21-8b'), 'phi'), 24.9, 0.05)
    near(val(byId('sm-2020-21-8c'), 'F'), 226.1, 0.1)
    near(val(byId('sm-2020-21-8c'), 'dF'), 84.2, 0.1)
    // Jan 2021
    near(val(byId('sm-jan-2021-5a'), 'phi'), 22.0, 0.05)
    near(val(byId('sm-jan-2021-6a'), 'LL'), 54.9, 0.05)
    near(val(byId('sm-jan-2021-6b'), 'gi'), 12, 0)
    near(val(byId('sm-jan-2021-7c'), 'sf'), 209.3, 0.1)
    near(val(byId('sm-jan-2021-8a'), 'pa'), 318.0, 0.1)
    near(val(byId('sm-jan-2021-8b'), 'af'), 0.482, 0.002)
    near(val(byId('sm-jan-2021-8c'), 'F'), 1058.8, 0.5)
    near(val(byId('sm-jan-2021-8c'), 'dF'), 166.5, 0.1)
    // 2017-18
    near(val(byId('sm-2017-18-1a'), 'LL'), 46.8, 0.05)
    near(val(byId('sm-2017-18-1d'), 'cu'), 42.0, 0.2)
    near(val(byId('sm-2017-18-2d'), 'pb'), 64.0, 0.1)
    near(val(byId('sm-2017-18-3b'), 'phi'), 33.4, 0.05)
    near(val(byId('sm-2017-18-3d'), 'F'), 927.0, 0.5)
    near(val(byId('sm-2017-18-3d'), 'Fq'), 1260.6, 0.5)
    near(val(byId('sm-2017-18-4b'), 'af'), 0.205, 0.002)
    near(val(byId('sm-2017-18-4c'), 'pr'), 14.1, 0.05)
    // 2016-17
    near(val(byId('sm-2016-17-7'), 'dev'), 104.0, 0.1)
    near(val(byId('sm-2016-17-8'), 'F'), 221.4, 0.1)
    near(val(byId('sm-2016-17-9'), 'uf'), 18.6, 0.1)
    near(val(byId('sm-2016-17-11a'), 'a'), 0.69, 0.005)
    near(val(byId('sm-2016-17-11c'), 'gi'), 3, 0)
    near(val(byId('sm-2016-17-12a'), 'phi'), 34.4, 0.05)
  })
})
