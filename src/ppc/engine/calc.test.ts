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
    // class rule: equal combined scores → the firm with the greater technical score
    expect(r.tie).toBe(true)
    expect(r.winner).toBe('C')
  })
  it('senior notes’ "2018-19" airport question: 90 % technical weight, qualifying 75', () => {
    const r = qcbs(
      [
        { name: 'A', tech: 80, price: 100 },
        { name: 'B', tech: 70 },
        { name: 'C', tech: 90, price: 140 },
        { name: 'D', tech: 76, price: 110 },
      ],
      90,
      75,
    )
    const by = Object.fromEntries(r.rows.map((x) => [x.name, x]))
    expect(by.C.s).toBeCloseTo(88.14, 2)
    expect(by.A.s).toBeCloseTo(82, 6)
    expect(by.D.s).toBeCloseTo(77.49, 2)
    expect(by.B.qualified).toBe(false)
    expect([by.C.rank, by.A.rank, by.D.rank]).toEqual([1, 2, 3])
  })
  it('a firm exactly on the qualifying mark is qualified', () => {
    expect(qcbs([{ name: 'W', tech: 80, price: 1 }], 80, 80).rows[0].qualified).toBe(true)
  })
})

describe('tds (class formulas)', () => {
  it('the worked example of the term-final solve: Tk 50 crore, 48 months, 20 storeys', () => {
    const r = tds({ costCrore: 50, months: 48, storeys: 20 })
    expect(r.turnover).toBeCloseTo(37.5, 9)
    expect(r.gap).toBeCloseTo(7.8, 9)
    expect(r.liquidExact).toBeCloseTo(8.125, 9)
    expect(r.liquid).toBe(9)
    expect(r.security).toBeCloseTo(1, 9)
    expect(r.genYears).toBe(5)
    expect(r.lines.specific.entry).toContain('15 storied')
    expect(r.lines.specific.entry).toContain('Tk 40 crore')
    expect(r.lines.turnover.entry).toContain('Tk 37.5 crore')
    expect(r.lines.liquid.basis).toContain('8.13')
  })
  it('2023-24 Q7(a): 30-storey, Tk 120 crore, 60 months', () => {
    const r = tds({ costCrore: 120, months: 60, storeys: 30 })
    expect(r.annual).toBe(24)
    expect(r.gap).toBe(9)
    expect(r.security).toBeCloseTo(2.4, 9)
    expect(r.lines.turnover.entry).toContain('Tk 72 crore')
    expect(r.lines.liquid.entry).toContain('Tk 18 crore')
    expect(r.lines.specific.entry).toContain('22 storied')
    expect(r.lines.specific.entry).toContain('Tk 96 crore')
  })
  it('the other papers’ figures', () => {
    const a = tds({ costCrore: 80, months: 36, storeys: 20 }) // 2021-22 Q8(a)
    expect([a.turnover, a.liquid, a.security].map((x) => +x.toFixed(2))).toEqual([80, 15, 1.6])
    const b = tds({ costCrore: 1000, months: 36, lengthM: 1500 }) // 2013-14 Q3(a), a bridge
    expect([b.turnover, b.liquid, b.security, b.genYears].map((x) => +x.toFixed(2))).toEqual([1000, 184, 20, 10])
    expect(b.lines.specific.entry).toContain('1200 m')
    const c = tds({ costCrore: 200, months: 30 }) // 2012-13 Q2(a), 30 months assumed
    expect([c.turnover, c.liquid, c.security].map((x) => +x.toFixed(2))).toEqual([240, 40, 4])
    const d = tds({ costCrore: 100, months: 36 }) // 2011-12 Q6(a), 36 months assumed
    expect([d.turnover, d.liquid, d.security].map((x) => +x.toFixed(2))).toEqual([100, 19, 2])
    const e = tds({ costCrore: 80, months: 48, storeys: 20, billingPct: 10 }) // senior notes’ "2018-19" Q2(a)
    expect([e.turnover, e.liquid, e.security, e.spec].map((x) => +x.toFixed(2))).toEqual([60, 13, 1.6, 64])
  })
})
