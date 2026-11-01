import { describe, expect, it } from 'vitest'
import { dailyTotals, dayRange, shiftDay, studyDay } from './timer'

describe('screen-time days', () => {
  it('a day runs 2 AM to 2 AM', () => {
    expect(studyDay(new Date(2026, 9, 21, 1, 59))).toBe('2026-10-20')
    expect(studyDay(new Date(2026, 9, 21, 2, 0))).toBe('2026-10-21')
    expect(studyDay(new Date(2026, 9, 21, 23, 30))).toBe('2026-10-21')
  })
  it('walks days across month ends', () => {
    expect(shiftDay('2026-11-01', -1)).toBe('2026-10-31')
    expect(dayRange('2026-10-30', '2026-11-02')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'])
    expect(dayRange('2026-10-21', '2026-10-21')).toEqual(['2026-10-21'])
  })
  it('adds devices together and applies manual edits on top', () => {
    const log = { a: { '2026-10-21': 600 }, b: { '2026-10-21': 300, '2026-10-20': 100 } }
    const adjust = { '2026-10-21': { s: 3600, at: 1 }, '2026-10-20': { s: -500, at: 1 }, '2026-10-19': { s: 7200, at: 1 } }
    expect(dailyTotals(log, adjust)).toEqual({ '2026-10-21': 4500, '2026-10-20': 0, '2026-10-19': 7200 })
  })
})
