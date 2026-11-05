import { describe, expect, it } from 'vitest'
import { EW_PRESETS, runEarthwork } from './EarthworkLab'
import mod from './index'
import { makeCompProblem } from './Problems'

describe('compaction exam generator', () => {
  for (const fam of ['proctor', 'field', 'core', 'borrow', 'trucks', 'compare'] as const)
    for (const level of ['basic', 'exam', 'tough'] as const)
      it(`${fam} / ${level}: finite values, no NaN text`, () => {
        for (let seed = 1; seed <= 30; seed++) {
          const p = makeCompProblem(seed, fam, level)
          expect(p.text).not.toMatch(/NaN|undefined|Infinity/)
          for (const s of p.steps) if (s.value !== undefined) expect(Number.isFinite(s.value)).toBe(true)
        }
      })
})

describe('earthwork presets reproduce the handnote', () => {
  const by = (s: string) => runEarthwork(EW_PRESETS.find((p) => p.label.startsWith(s))!.ew).res
  it('2023-24 Q7(c): 1155 m³', () => expect(Math.abs(by('2023-24')[0].p.Vbank - 1155)).toBeLessThan(1))
  it('2021-22 Q3(c): Tk 13.69 million', () => expect(Math.abs(by('2021-22')[0].payCost / 1e6 - 13.69)).toBeLessThan(0.01))
  it('2016-17 Q1(b): 25 loads, 103.9 m³', () => {
    const r = by('2016-17')[0].p
    expect(r.trucks).toBe(25)
    expect(Math.abs(r.Vbank - 103.9)).toBeLessThan(0.05)
  })
  it('2015-16 Q9(b): 21.6 m³ per m', () => expect(Math.abs(by('2015-16')[0].p.Vbank - 21.6)).toBeLessThan(0.01))
  it('2012-13 Q9(b): 1.13 m³ per m³', () => expect(Math.abs(by('2012-13')[0].p.Vbank - 1.13)).toBeLessThan(0.005))
  it('2010-11 Q5(c): A Tk 222,700 cheaper than B Tk 231,360', () => {
    const r = by('2010-11')
    expect(Math.abs(r[0].total - 222700)).toBeLessThan(100)
    expect(Math.abs(r[1].total - 231360)).toBeLessThan(100)
  })
  it('2009-10 Q5(d): A Tk 497.2 M, B Tk 532.7 M', () => {
    const r = by('2009-10')
    expect(Math.abs(r[0].total / 1e6 - 497.2)).toBeLessThan(0.1)
    expect(Math.abs(r[1].total / 1e6 - 532.7)).toBeLessThan(0.1)
  })
})

describe('compaction practice problems', () => {
  for (const q of mod.problems) it(`${q.id}: checks finite`, () => q.checks!().forEach((c) => expect(Number.isFinite(c.value)).toBe(true)))
})
