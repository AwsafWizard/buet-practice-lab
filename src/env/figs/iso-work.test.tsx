import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { rng } from '../../labs/common'
import { CHART_2017, CHART_2021, CHART_2324, isoFromCurves, minTimeForRemoval, randomChart } from '../engine/settle'
import { bottomTime, IsoReading, MinTimeWork } from './iso-work'

describe('worked iso-removal readings', () => {
  it('bottomTime: 2017-18 curves meet the 3 m floor where the printed 3 m row says (45 % at 90, 70 % at 180)', () => {
    const at = (r: number) => bottomTime(CHART_2017.curves.find((c) => c.r === r)!, 3)
    expect(at(45)).toBeCloseTo(90, 1)
    expect(at(70)).toBeCloseTo(180, 1)
    expect(at(90)).toBeNull()
  })
  for (const ch of [CHART_2017, CHART_2021, CHART_2324])
    it(`${ch.id}: reading renders cleanly`, () => {
      const html = renderToString(<IsoReading ch={ch} t0={ch.tMax / 2} />)
      expect(html).not.toMatch(/NaN|undefined|Infinity|katex-error/)
    })
  it('random lab charts: R at t0 and the minimum-time work render cleanly, trials are distinct and bracket the target', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const ch = randomChart(rng(seed))
      const t0 = Math.round(ch.tMax * 0.6)
      const target = Math.round(isoFromCurves(ch.curves, ch.H, t0).R)
      for (const el of [<IsoReading ch={ch} t0={t0} />, <MinTimeWork ch={ch} target={target} />]) expect(renderToString(el), `seed ${seed}`).not.toMatch(/NaN|undefined|Infinity|katex-error/)
      const tm = minTimeForRemoval((t) => isoFromCurves(ch.curves, ch.H, t).R, target, ch.tMax * 3)!
      const lo = Math.max(5, Math.floor(tm / 5) * 5)
      expect(isoFromCurves(ch.curves, ch.H, lo).R, `seed ${seed}`).toBeLessThanOrEqual(target + 1e-6)
      expect(isoFromCurves(ch.curves, ch.H, lo + 5).R, `seed ${seed}`).toBeGreaterThanOrEqual(target - 1e-6)
      const html = renderToString(<MinTimeWork ch={ch} target={target} />)
      const trials = [...html.matchAll(/Trial \d: (?:guess )?t₀ = <!-- -->(\d+)/g)].map((m) => m[1])
      expect(trials.length, `seed ${seed}`).toBe(3)
      expect(new Set(trials).size, `seed ${seed} trials ${trials}`).toBe(3)
    }
  }, 30000)
})
