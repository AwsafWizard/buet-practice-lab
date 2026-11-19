import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { RAIN_TABLES, monthlyFromLpd, supplySide } from '../engine/rwh'
import { MassWork, shortfallRun } from './rm-mass-work'

describe('worked mass-curve table', () => {
  it('the tabulated running shortfall reproduces the engine tank when the roof is plentiful', () => {
    const s = supplySide({ area: 2340, C: 0.8, rain: RAIN_TABLES[3].rain, demandPerMonth: monthlyFromLpd(30 * 120) })
    expect(s.supplyGoverns).toBe(false)
    expect(Math.abs(s.tank - s.maxDiff)).toBeGreaterThan(0.01)
    expect(shortfallRun(s).max).toBeCloseTo(s.tank, 9)
  })
  it('the difference column gives the tank when the supply governs', () => {
    const s = supplySide({ area: 250, C: 0.8, rain: RAIN_TABLES[1].rain, demandPerMonth: monthlyFromLpd(715) })
    expect(Math.abs(s.tank - s.maxDiff)).toBeLessThan(0.01)
  })
  it('renders without NaN / KaTeX errors in both cases', () => {
    for (const [area, lpd, rain] of [[250, 715, RAIN_TABLES[1].rain], [2340, 30 * 120, RAIN_TABLES[3].rain], [190, 315, RAIN_TABLES[0].rain]] as const) {
      const s = supplySide({ area, C: 0.8, rain: [...rain], demandPerMonth: monthlyFromLpd(lpd) })
      const html = renderToString(<MassWork s={s} area={area} C={0.8} />)
      expect(html, `area ${area}`).not.toMatch(/NaN|undefined|Infinity|katex-error/)
    }
  })
})
