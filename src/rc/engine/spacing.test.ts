import { describe, expect, it } from 'vitest'
import { oneWayCoef } from './oneway'
import { twoWay } from './twoway'
import { barPositions, evalColumn, evalSpacing, evalTop, smaxOf } from './spacing'

describe('slab spacing checks', () => {
  // Lecture Ex 12.1: #3 @ 7.5 in, 2 + 1 extra top bars, T&S #3 @ 9 in
  const r = oneWayCoef({ spans: [15, 15], ends: ['spandrel', 'spandrel'], ll: 100, fc: 4000, fy: 60000, h: 6.5, bar: 3 })
  const pos = r.sections.find((s) => s.id === 'p0')!
  const int = r.supports.find((s) => s.sec.id === 's1')!

  it('class pick matches the one-way engine', () => {
    const e = evalSpacing({ bar: 3, s: 7.5, need: pos.AsD, smax: smaxOf('oneway', r.h) })
    expect(e.best).toBe(r.spanBars[0].s)
    expect(e.verdict).toBe('best')
    expect(e.classBar).toBe(3)
  })
  it('too wide fails strength, too tight is ok but not best', () => {
    expect(evalSpacing({ bar: 3, s: 9, need: pos.AsD, smax: 19.5 }).verdict).toBe('fail')
    const t = evalSpacing({ bar: 3, s: 6, need: pos.AsD, smax: 19.5 })
    expect(t.verdict).toBe('ok')
    expect(t.over).toBeGreaterThan(0)
  })
  it('s_max governs light steel', () => {
    const e = evalSpacing({ bar: 4, s: 18, need: 0.1, smax: smaxOf('oneway', 5) })
    expect(e.best).toBe(15)
    expect(e.checks.find((c) => c.key === 'smax')!.ok).toBe(false)
  })
  it('extra top count matches the engine', () => {
    const t = evalTop({ bar: 3, s: int.sBottom, n: int.extra.n, need: int.sec.AsD })
    expect(t.classN).toBe(int.extra.n)
    expect(t.verdict).toBe('best')
    expect(evalTop({ bar: 3, s: int.sBottom, n: int.extra.n - 1, need: int.sec.AsD }).verdict).toBe('fail')
  })
  it('T&S pick matches tsBars', () => {
    const e = evalSpacing({ bar: 3, s: r.ts.s, need: r.ts.As, smax: smaxOf('ts', r.h) })
    expect(e.verdict).toBe('best')
  })
  it('two-way middle and column strips match the two-way engine', () => {
    const tw = twoWay({ lx: 25, ly: 20, edges: { top: false, right: false, bottom: true, left: true }, ll: 60, ff: 25, pw: 40, fc: 3000, fy: 60000 })
    const a = evalSpacing({ bar: 3, s: tw.midA.s, need: tw.st.aPos.AsD, smax: smaxOf('twoway', tw.h) })
    expect(a.best).toBe(tw.midA.s)
    const c = evalColumn({ bar: 3, sMid: tw.midA.s, s: tw.col.a.s, AsMin: tw.AsMin, h: tw.h })
    expect(c.best).toBe(tw.col.a.s)
    expect(c.verdict).toBe('best')
  })
  it('bar positions', () => {
    expect(barPositions(36, 6)).toEqual([3, 9, 15, 21, 27, 33])
  })
})
