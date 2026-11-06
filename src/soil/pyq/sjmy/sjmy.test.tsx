// SJMY sir's half of the six recent papers: every part has a valid id, finite checks, and renders cleanly;
// key answers against the Question Bank handnote / digest values.
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SM_PAPERS, type SmQ } from '../../types'
import { B2016 } from './s2016'
import { B2017 } from './s2017'
import { B2020 } from './s2020'
import { B2021 } from './s2021'
import { B2023 } from './s2023'
import { BJAN21 } from './sjan21'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

const SETS: [string, SmQ[]][] = [
  ['2023-24', B2023],
  ['2021-22', B2021],
  ['2020-21', B2020],
  ['jan-2021', BJAN21],
  ['2017-18', B2017],
  ['2016-17', B2016],
]

const COUNT: Record<string, number> = { '2023-24': 14, '2021-22': 13, '2020-21': 15, 'jan-2021': 8, '2017-18': 12, '2016-17': 11 }

const val = (q: SmQ | undefined, key: string) => q?.checks?.().find((c) => c.key === key)?.value ?? NaN
const byId = (id: string) => SETS.flatMap(([, s]) => s).find((q) => q.id === id)

describe("SJMY sir's half, recent papers", () => {
  for (const [paper, set] of SETS) {
    it(`${paper}: ids, section, numbers`, () => {
      expect(set.length, paper).toBe(COUNT[paper])
      const p = SM_PAPERS.find((x) => x.id === paper)!
      const sjmy = p.ajk === 'A' ? 'B' : 'A'
      const ids = set.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const q of set) {
        expect(q.paper).toBe(paper)
        expect(q.sec, q.id).toBe(sjmy)
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

  it('ids are unique across both halves', () => {
    const ids = SETS.flatMap(([, s]) => s.map((q) => q.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('oracle values from the handnote and digests', () => {
    const near = (a: number, b: number, t: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(t)
    // 2023-24
    near(val(byId('sm-2023-24-5b'), 'd'), 2.96, 0.01)
    near(val(byId('sm-2023-24-5b'), 'd12'), 2.15, 0.01)
    near(val(byId('sm-2023-24-5c'), 'p0'), 134.1, 0.1)
    near(val(byId('sm-2023-24-5c'), 'S'), 37, 1)
    near(val(byId('sm-2023-24-5c'), 'Sm'), 24, 1)
    near(val(byId('sm-2023-24-6c'), 'icr'), 0.835, 0.002)
    near(val(byId('sm-2023-24-6c'), 'fsh'), 3.57, 0.05)
    near(val(byId('sm-2023-24-7a'), 's'), 53.1, 1)
    near(val(byId('sm-2023-24-7b'), 'U'), 29.0, 0.05)
    near(val(byId('sm-2023-24-7b'), 't75'), 1.28, 0.01)
    near(val(byId('sm-2023-24-7b'), 't65'), 0.227, 0.002)
    near(val(byId('sm-2023-24-7c'), 'V'), 1155, 1)
    near(val(byId('sm-2023-24-8a'), 'ps'), 19.5, 0.5)
    near(val(byId('sm-2023-24-8a'), 'u'), 78.4, 0.5)
    near(val(byId('sm-2023-24-8b'), 's'), 49.0, 0.1)
    // 2021-22
    near(val(byId('sm-2021-22-1b'), 't'), 635, 1)
    near(val(byId('sm-2021-22-1c'), 's'), 49.5, 1)
    near(val(byId('sm-2021-22-2b'), 'fs'), 0.47, 0.005)
    near(val(byId('sm-2021-22-2b'), 'dm'), 5.64, 0.01)
    near(val(byId('sm-2021-22-2b'), 'dd'), 6.34, 0.01)
    near(val(byId('sm-2021-22-2c'), 's'), 66.0, 0.1)
    near(val(byId('sm-2021-22-3a'), 'p1'), 31.7, 0.1)
    near(val(byId('sm-2021-22-3a'), 'p2'), 78.7, 0.1)
    near(val(byId('sm-2021-22-3a'), 'S'), 530, 3)
    near(val(byId('sm-2021-22-3c'), 'V'), 27387, 5)
    near(val(byId('sm-2021-22-4a'), 'sum'), 2.92, 0.01)
    near(val(byId('sm-2021-22-4c'), 'Q'), 0.21, 0.02)
    // 2020-21
    near(val(byId('sm-2020-21-1b'), 'rc'), 91.2, 0.1)
    near(val(byId('sm-2020-21-1c'), 'q'), 1.07, 0.03)
    near(val(byId('sm-2020-21-1c'), 'ie'), 0.37, 0.03)
    near(val(byId('sm-2020-21-2a'), 'k'), 4.0, 0.001)
    near(val(byId('sm-2020-21-2a'), 'Q'), 6.79, 0.01)
    near(val(byId('sm-2020-21-2b'), 's10'), 188, 0.5)
    near(val(byId('sm-2020-21-2b'), 'e10'), 109.5, 0.1)
    near(val(byId('sm-2020-21-3a'), 'p0'), 101.6, 0.1)
    near(val(byId('sm-2020-21-3a'), 'S'), 100, 3)
    near(val(byId('sm-2020-21-3b'), 't'), 135.4, 0.1)
    near(val(byId('sm-2020-21-4d'), 's'), 15.3, 0.05)
    // Jan 2021 (Nf = 4 from the scan, not the handnote's 3)
    near(val(byId('sm-jan-2021-1b'), 'q'), 5.76, 0.01)
    near(val(byId('sm-jan-2021-1b'), 'h1'), 0.833, 0.001)
    near(val(byId('sm-jan-2021-1b'), 'ie'), 0.51, 0.01)
    near(val(byId('sm-jan-2021-2b'), 'V'), 429.8, 0.1)
    near(val(byId('sm-jan-2021-2b'), 'gb'), 18.63, 0.01)
    near(val(byId('sm-jan-2021-2b'), 'gd'), 16.41, 0.01)
    near(val(byId('sm-jan-2021-2b'), 'mdd'), 17.19, 0.01)
    near(val(byId('sm-jan-2021-2b'), 'rc'), 95.5, 0.1)
    near(val(byId('sm-jan-2021-3b'), 'p0'), 38.3, 0.05)
    near(val(byId('sm-jan-2021-3b'), 'dp'), 39.8, 0.05)
    near(val(byId('sm-jan-2021-3b'), 'S'), 7.5, 0.2)
    near(val(byId('sm-jan-2021-4b'), 'sA'), 89, 0.5)
    near(val(byId('sm-jan-2021-4b'), 'sB'), 93, 0.6)
    // 2017-18
    near(val(byId('sm-2017-18-5a'), 'sm'), 1.76, 0.01)
    near(val(byId('sm-2017-18-5a'), 'so'), 15.5, 0.6)
    near(val(byId('sm-2017-18-5a'), 'mm'), 1.92, 0.01)
    near(val(byId('sm-2017-18-5a'), 'mo'), 11.7, 0.6)
    near(val(byId('sm-2017-18-5a'), 'd1'), 1.8, 0.001)
    near(val(byId('sm-2017-18-5a'), 'd2'), 1.92, 0.001)
    near(val(byId('sm-2017-18-5a'), 'w3'), 17.0, 0.05)
    near(val(byId('sm-2017-18-5b'), 'S'), 67.7, 0.1)
    near(val(byId('sm-2017-18-5b'), 'Dr'), 75.2, 0.1)
    near(val(byId('sm-2017-18-5b'), 'gsat'), 20.0, 0.05)
    near(val(byId('sm-2017-18-6a'), 'dp'), 64.3, 0.1)
    near(val(byId('sm-2017-18-6a'), 'p0'), 80.8, 0.1)
    near(val(byId('sm-2017-18-6a'), 'S'), 42, 1)
    near(val(byId('sm-2017-18-6a'), 't'), 5.84, 0.01)
    near(val(byId('sm-2017-18-6a'), 'S45'), 35.5, 0.6)
    near(val(byId('sm-2017-18-7a'), 'q'), 0.26, 0.02)
    near(val(byId('sm-2017-18-7a'), 'icr'), 0.922, 0.001)
    near(val(byId('sm-2017-18-7a'), 'uh'), 42.3, 1)
    near(val(byId('sm-2017-18-7a'), 'ut'), 29.5, 1)
    near(val(byId('sm-2017-18-7a'), 'U'), 316, 5)
    near(val(byId('sm-2017-18-8a'), 'k'), 2.48, 0.01)
    near(val(byId('sm-2017-18-8b'), 's'), 60.7, 0.1)
    near(val(byId('sm-2017-18-8b'), 'm'), 78.9, 0.1)
    near(val(byId('sm-2017-18-8b'), 'z'), 9.19, 0.01)
    near(val(byId('sm-2017-18-8c'), 's'), 3.41, 0.01)
    // 2016-17
    near(val(byId('sm-2016-17-1aiii'), 'Id'), 31.0, 0.1)
    near(val(byId('sm-2016-17-1b'), 'Ws'), 1596.5, 0.5)
    near(val(byId('sm-2016-17-1b'), 'Vl'), 147.2, 0.1)
    near(val(byId('sm-2016-17-1b'), 'n'), 25, 0)
    near(val(byId('sm-2016-17-1b'), 'Vb'), 103.9, 0.1)
    near(val(byId('sm-2016-17-2b'), 'dp'), 51.7, 0.1)
    near(val(byId('sm-2016-17-2b'), 'p0'), 75.3, 0.1)
    near(val(byId('sm-2016-17-2b'), 'S'), 37, 1)
    near(val(byId('sm-2016-17-2b'), 't'), 5.2, 0.05)
    near(val(byId('sm-2016-17-2b'), 't2'), 1.3, 0.02)
    near(val(byId('sm-2016-17-3b'), 'm'), 52, 2)
    near(val(byId('sm-2016-17-3b'), 'sp'), 54, 1.5)
    near(val(byId('sm-2016-17-3b'), 'uP'), 147, 1.5)
    near(val(byId('sm-2016-17-3b'), 'uQ'), 129, 1)
    near(val(byId('sm-2016-17-3b'), 'eQ'), 90, 1)
    near(val(byId('sm-2016-17-3b'), 'ft'), 3.4, 0.05)
    near(val(byId('sm-2016-17-3b'), 'fh'), 3.8, 0.3)
  })
})
