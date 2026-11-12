import { describe, expect, it } from 'vitest'
import { qcbs } from './qcbs'
import { tds } from './tds'

describe('qcbs', () => {
  it('2016-17 Q3(c): 80 % technical weight, qualifying 75', () => {
    const r = qcbs(
      [
        { name: 'A', tech: 70 },
        { name: 'B', tech: 85, price: 2 },
        { name: 'C', tech: 90, price: 2.5 },
        { name: 'D', tech: 80, price: 2 },
      ],
      80,
      75,
    )
    expect(r.rows[0].qualified).toBe(false)
    expect(r.fm).toBe(2)
    const by = Object.fromEntries(r.rows.map((x) => [x.name, x]))
    expect(by.B.s).toBeCloseTo(88, 6) // 0.8×85 + 0.2×100
    expect(by.C.s).toBeCloseTo(88, 6) // 0.8×90 + 0.2×80
    expect(by.D.s).toBeCloseTo(84, 6)
  })
})

describe('tds', () => {
  it('2023-24 Q7(a): 30-storey, Tk 120 crore, 60 months', () => {
    const r = tds({ costCrore: 120, months: 60, storeys: 30 })
    expect(r.annual).toBe(24)
    expect(r.security).toBeCloseTo(2.3, 6) // under 3% (3.6) and slightly under 2% (2.4)
    expect(r.security).toBeLessThanOrEqual(0.03 * 120)
    expect(r.lines.turnover.entry).toContain('Tk 36 crore')
    expect(r.lines.liquid.entry).toContain('Tk 12 crore')
    expect(r.lines.specific.entry).toContain('20 storeys')
  })
  it('matches the digest’s worked cases for tender security', () => {
    expect(tds({ costCrore: 80, months: 36 }).security).toBeCloseTo(1.55, 6)
    expect(tds({ costCrore: 100, months: 36 }).security).toBeCloseTo(1.95, 6)
    expect(tds({ costCrore: 1000, months: 36 }).security).toBeCloseTo(19.5, 6)
  })
})
