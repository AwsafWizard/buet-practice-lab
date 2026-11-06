// SJMY sir's half of the seven older papers (2015-16 … 2007-08): every part has a valid id, finite checks, and renders
// cleanly; key answers against the Question Bank handnote (or the scan where the digest says the handnote misread it).
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SM_PAPERS, type SmQ } from '../../types'
import { SM_ALL } from '../index'
import { B2007 } from './s2007'
import { B2008 } from './s2008'
import { B2009 } from './s2009'
import { B2010 } from './s2010'
import { B2011 } from './s2011'
import { B2012 } from './s2012'
import { B2015 } from './s2015'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

const SETS: [string, SmQ[], number][] = [
  ['2015-16', B2015, 11],
  ['2012-13', B2012, 13],
  ['2011-12', B2011, 14],
  ['2010-11', B2010, 13],
  ['2009-10', B2009, 13],
  ['2008-09', B2008, 14],
  ['2007-08', B2007, 13],
]

const val = (q: SmQ | undefined, key: string) => q?.checks?.().find((c) => c.key === key)?.value ?? NaN
const byId = (id: string) => SETS.flatMap(([, s]) => s).find((q) => q.id === id)
const near = (a: number, b: number, t: number) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThanOrEqual(t)

describe("SJMY sir's half, older papers", () => {
  for (const [paper, set, n] of SETS) {
    it(`${paper}: ids, section, numbers`, () => {
      const p = SM_PAPERS.find((x) => x.id === paper)!
      const sjmy = p.ajk === 'A' ? 'B' : 'A'
      expect(set.length).toBe(n)
      const ids = set.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const q of set) {
        expect(q.paper).toBe(paper)
        expect(q.sec, q.id).toBe(sjmy)
        expect(q.id.startsWith(`sm-${paper}-`), q.id).toBe(true)
        expect(q.topics.length).toBeGreaterThan(0)
        expect(q.marks).toBeGreaterThan(0)
        expect(q.pages.every((pg) => p.pages.includes(pg)), q.id).toBe(true)
        if (!q.theory) {
          expect(q.checks, q.id).toBeTruthy()
          expect(q.checks!().length, q.id).toBeGreaterThan(0)
        }
        for (const c of q.checks?.() ?? []) expect(Number.isFinite(c.value), `${q.id} ${c.key}`).toBe(true)
      }
    })
    it(`${paper}: figures and solutions render without NaN`, () => {
      for (const q of set) {
        if (q.figure) expect(wrap(q.figure()), q.id).not.toContain('NaN')
        expect(q.solution, q.id).toBeTruthy()
        const html = wrap(q.solution!())
        expect(html, q.id).not.toContain('NaN')
        expect(html, q.id).not.toContain('Infinity')
        expect(html, q.id).not.toMatch(/undefined|\[object /)
      }
    })
  }

  it('ids are unique across every paper and both halves', () => {
    const ids = SM_ALL.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('oracle values from the handnote and digests: 2015-16', () => {
    near(val(byId('sm-2015-16-9a-ii'), 'z10'), 2.151, 0.002)
    near(val(byId('sm-2015-16-9a-iii'), 'rb'), 2.127, 0.002)
    near(val(byId('sm-2015-16-9a-iii'), 'w'), 15.35, 0.02)
    near(val(byId('sm-2015-16-9a-iii'), 'rd'), 1.844, 0.002)
    near(val(byId('sm-2015-16-9a-iii'), 'mdd'), 1.941, 0.002)
    near(val(byId('sm-2015-16-9b'), 'V'), 21.6, 0.05)
    near(val(byId('sm-2015-16-9b'), 'eB'), 0.572, 0.002)
    near(val(byId('sm-2015-16-9b'), 'SB'), 37.4, 0.2)
    near(val(byId('sm-2015-16-9b'), 'eE'), 0.746, 0.002)
    near(val(byId('sm-2015-16-9b'), 'SE'), 35.8, 0.2)
    near(val(byId('sm-2015-16-9b'), 'eN'), 0.676, 0.002)
    near(val(byId('sm-2015-16-10b'), 'eoc'), 0.54, 0.001)
    near(val(byId('sm-2015-16-10b'), 'enc'), 0.783, 0.001)
    near(val(byId('sm-2015-16-11b'), 'icr'), 0.923, 0.001)
    near(val(byId('sm-2015-16-11b'), 'g'), 9.06, 0.01)
    near(val(byId('sm-2015-16-11b'), 'kL'), 1.65, 0.01)
    near(val(byId('sm-2015-16-11b'), 'hm'), 277, 1)
    near(val(byId('sm-2015-16-11c'), 'e'), 0.878, 0.001)
    near(val(byId('sm-2015-16-11c'), 'gs'), 18.48, 0.02)
    near(val(byId('sm-2015-16-11c'), 'icr'), 0.884, 0.002)
    near(val(byId('sm-2015-16-11c'), 'qc'), 1.244, 0.002)
    const t200 = val(byId('sm-2015-16-10b'), 't200')
    expect(t200 > 0.5 && t200 < 500).toBe(true)
  })

  it('oracle values: 2012-13', () => {
    near(val(byId('sm-2012-13-9b'), 'ww'), 1.31, 0.01)
    near(val(byId('sm-2012-13-9b'), 'V'), 1.13, 0.005)
    near(val(byId('sm-2012-13-9c'), 'beta'), 39.23, 0.01)
    near(val(byId('sm-2012-13-9c'), 's'), 0.44, 0.005)
    near(val(byId('sm-2012-13-10c'), 'k'), 1.06, 0.01)
    near(val(byId('sm-2012-13-10c'), 'n'), 0.377, 0.002)
    near(val(byId('sm-2012-13-10c'), 'vs'), 7.5, 0.05)
    near(val(byId('sm-2012-13-10d'), 'g'), 10.52, 0.01)
    near(val(byId('sm-2012-13-10d'), 'fs0'), 0.745, 0.005)
    near(val(byId('sm-2012-13-10d'), 'z'), 2.11, 0.01)
    near(val(byId('sm-2012-13-11c'), 'Tv'), 0.0491, 0.0001)
    near(val(byId('sm-2012-13-11c'), 'de'), 3.384, 0.001)
    near(val(byId('sm-2012-13-11c'), 'n'), 11.28, 0.02)
    near(val(byId('sm-2012-13-11c'), 'Tr'), 0.154, 0.001)
    near(val(byId('sm-2012-13-11c'), 'U'), 64, 1.5)
    near(val(byId('sm-2012-13-12b'), 'e0'), 0.572, 0.001)
    near(val(byId('sm-2012-13-12b'), 'dpf'), 1008, 2)
    near(val(byId('sm-2012-13-12b'), 'S'), 13.9, 0.1)
    near(val(byId('sm-2012-13-12b'), 'th'), 19, 0.6)
    near(val(byId('sm-2012-13-12b'), 'S6'), 13.9, 0.1)
    near(val(byId('sm-2012-13-12c'), 'ba'), 7.93, 0.01)
    near(val(byId('sm-2012-13-12c'), 'cd'), 10.44, 0.01)
    near(val(byId('sm-2012-13-12c'), 's'), 28.8, 0.05)
  })

  it('oracle values: 2011-12', () => {
    near(val(byId('sm-2011-12-5b-i'), 'dp'), 42.9, 0.05)
    near(val(byId('sm-2011-12-5b-i'), 'p0'), 75.4, 0.1)
    near(val(byId('sm-2011-12-5b-i'), 'e0'), 0.7, 0.002)
    near(val(byId('sm-2011-12-5b-i'), 'e1'), 0.668, 0.002)
    near(val(byId('sm-2011-12-5b-i'), 'S'), 30.5, 1.0)
    near(val(byId('sm-2011-12-5b-ii'), 't'), 5.36, 0.05)
    near(val(byId('sm-2011-12-6b'), 'mv'), 4.58, 0.01)
    near(val(byId('sm-2011-12-6b'), 'cv'), 6.75, 0.001)
    near(val(byId('sm-2011-12-6b'), 'k'), 31, 0.2)
    near(val(byId('sm-2011-12-6c'), 't'), 84.9, 0.1)
    near(val(byId('sm-2011-12-7b'), 'rd'), 1.852, 0.001)
    near(val(byId('sm-2011-12-7b'), 'e'), 0.458, 0.001)
    near(val(byId('sm-2011-12-7b'), 'w'), 8.33, 0.01)
    near(val(byId('sm-2011-12-7b'), 'S'), 70.7, 0.1)
    near(val(byId('sm-2011-12-7b'), 'Vw'), 31.4, 0.05)
    near(val(byId('sm-2011-12-7c'), 's'), 46.5, 0.1)
    near(val(byId('sm-2011-12-8e'), 'H'), 10.5, 0.01)
    near(val(byId('sm-2011-12-8e'), 'r'), 0.27, 0.03)
    near(val(byId('sm-2011-12-8e'), 'Q'), 1.1e4, 0.12e4)
  })

  it('oracle values: 2010-11', () => {
    near(val(byId('sm-2010-11-5c'), 'VA'), 11135, 5)
    near(val(byId('sm-2010-11-5c'), 'VB'), 10517, 5)
    near(val(byId('sm-2010-11-5c'), 'cA'), 222700, 200)
    near(val(byId('sm-2010-11-5c'), 'cB'), 231360, 200)
    near(val(byId('sm-2010-11-5c'), 'w'), 15.0, 0.1)
    near(val(byId('sm-2010-11-6c'), 'cv'), 0.788, 0.001)
    near(val(byId('sm-2010-11-6c'), 'mv'), 2.59, 0.01)
    near(val(byId('sm-2010-11-6c'), 'S'), 571, 3)
    near(val(byId('sm-2010-11-6c'), 'S1'), 286, 2)
    near(val(byId('sm-2010-11-6c'), 'U2'), 75.1, 0.3)
    near(val(byId('sm-2010-11-6c'), 't2'), 2.43, 0.03)
    near(val(byId('sm-2010-11-7d'), 'H'), 4, 0.01)
    near(val(byId('sm-2010-11-7d'), 'r'), 0.44, 0.04)
    near(val(byId('sm-2010-11-7d'), 'Q'), 694, 60)
    near(val(byId('sm-2010-11-7d'), 'g'), 11.69, 0.01)
    near(val(byId('sm-2010-11-7d'), 'fs'), 4.5, 0.4)
    near(val(byId('sm-2010-11-8b'), 'Ic'), 0.0328, 0.0005)
    near(val(byId('sm-2010-11-8b'), 'sc'), 1.05, 0.01)
    near(val(byId('sm-2010-11-8b'), 'Ik'), 0.0931, 0.0005)
    near(val(byId('sm-2010-11-8b'), 'sk'), 0.75, 0.01)
    near(val(byId('sm-2010-11-8c'), 'Sp'), 2.15, 0.02)
    near(val(byId('sm-2010-11-8c'), 'Ss'), 0.74, 0.01)
    near(val(byId('sm-2010-11-8c'), 'St'), 2.9, 0.03)
  })

  it('oracle values: 2009-10', () => {
    near(val(byId('sm-2009-10-5d'), 'Ms'), 6.612, 0.002)
    near(val(byId('sm-2009-10-5d'), 'tA'), 491252, 2)
    near(val(byId('sm-2009-10-5d'), 'tB'), 452830, 2)
    near(val(byId('sm-2009-10-5d'), 'cA'), 497.2, 0.1)
    near(val(byId('sm-2009-10-5d'), 'cB'), 532.7, 0.1)
    near(val(byId('sm-2009-10-6c'), 'g'), 10.52, 0.01)
    near(val(byId('sm-2009-10-6c'), 'fs0'), 1.13, 0.005)
    near(val(byId('sm-2009-10-6c'), 'z'), 1.54, 0.01)
    near(val(byId('sm-2009-10-7c'), 'de'), 0.0475, 0.0002)
    near(val(byId('sm-2009-10-7c'), 'S'), 78, 0.5)
    near(val(byId('sm-2009-10-7c'), 't1'), 400, 5)
    near(val(byId('sm-2009-10-7c'), 't2'), 100, 2)
    near(val(byId('sm-2009-10-8c'), 'I'), 0.3129, 0.0005)
    near(val(byId('sm-2009-10-8c'), 'sa'), 37.5, 0.1)
    near(val(byId('sm-2009-10-8c'), 'N'), 63, 1)
  })

  it('oracle values: 2008-09', () => {
    near(val(byId('sm-2008-09-5c'), 'ww'), 131, 1)
    near(val(byId('sm-2008-09-5c'), 'V'), 1.13, 0.005)
    near(val(byId('sm-2008-09-6b-i'), 'dp'), 51.7, 0.1)
    near(val(byId('sm-2008-09-6b-i'), 'p0'), 72.3, 0.1)
    near(val(byId('sm-2008-09-6b-i'), 'e0'), 0.703, 0.002)
    near(val(byId('sm-2008-09-6b-i'), 'e1'), 0.663, 0.002)
    near(val(byId('sm-2008-09-6b-i'), 'S'), 38, 1)
    near(val(byId('sm-2008-09-6b-ii'), 't'), 5.2, 0.05)
    near(val(byId('sm-2008-09-6b-iii'), 'cv'), 1.33, 0.01)
    near(val(byId('sm-2008-09-6b-iii'), 'mv'), 4.59, 0.1)
    near(val(byId('sm-2008-09-6b-iii'), 'k'), 6.0, 0.2)
    near(val(byId('sm-2008-09-7b'), 'sa'), 43.8, 0.1)
    near(val(byId('sm-2008-09-7b'), 'N'), 117, 2)
    near(val(byId('sm-2008-09-8c'), 'k'), 1.06, 0.01)
    near(val(byId('sm-2008-09-8c'), 'v'), 2.83, 0.01)
    near(val(byId('sm-2008-09-8d'), 'H'), 6, 0.01)
  })

  it('oracle values: 2007-08', () => {
    near(val(byId('sm-2007-08-5b'), 'Vf'), 255000, 1)
    near(val(byId('sm-2007-08-5b'), 'M'), 405000, 1)
    near(val(byId('sm-2007-08-5c'), 'emax'), 0.963, 0.001)
    near(val(byId('sm-2007-08-5c'), 'emin'), 0.224, 0.001)
    near(val(byId('sm-2007-08-5c'), 'Dr'), 72.3, 0.1)
    near(val(byId('sm-2007-08-6c'), 'de'), 0.0475, 0.0002)
    near(val(byId('sm-2007-08-6c'), 'S'), 78, 0.5)
    near(val(byId('sm-2007-08-6c'), 't1'), 400, 5)
    near(val(byId('sm-2007-08-7c'), 'icr'), 0.93, 0.005)
    // the scanned net cannot be counted exactly: the handnote's values within the drawing-reading spread
    near(val(byId('sm-2007-08-8c'), 'r'), 0.25, 0.02)
    near(val(byId('sm-2007-08-8c'), 'Q'), 79, 6)
    near(val(byId('sm-2007-08-8c'), 'uA'), 68, 4)
    near(val(byId('sm-2007-08-8c'), 'sB'), 48, 3)
    near(val(byId('sm-2007-08-8c'), 'icr'), 1.14, 0.005)
  })
})
