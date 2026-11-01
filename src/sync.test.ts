import { describe, expect, it } from 'vitest'
import { merge, type Progress } from './sync'

const base = (over: Partial<Progress> = {}): Progress => ({
  attempts: {},
  revealed: {},
  xp: 0,
  streak: { last: '', count: 0 },
  activity: {},
  planner: null,
  qStatus: {},
  mockScores: {},
  timeLog: {},
  timeAdjust: {},
  timeGoal: 8,
  stamps: {},
  bmdSide: 'compression',
  rotSign: 'cw',
  ...over,
})

describe('progress merge', () => {
  // the 22 Oct loss: a device with a 20 Oct copy must not wipe newer work
  const old = base({
    attempts: { 'ild:a': { tries: 1, correct: true, firstTry: true, at: 1 } },
    xp: 15,
    streak: { last: '2026-10-20', count: 1 },
    activity: { '2026-10-20': 1 },
    qStatus: { q1: 'tried' },
  })
  const fresh = base({
    attempts: {
      'ild:a': { tries: 2, correct: true, firstTry: true, at: 5 },
      'truss:b': { tries: 1, correct: false, firstTry: false, at: 6 },
    },
    xp: 15,
    streak: { last: '2026-10-22', count: 3 },
    activity: { '2026-10-20': 1, '2026-10-22': 4 },
    qStatus: { q1: 'solved', q2: 'review' },
    stamps: { 'q:q1': 9, 'q:q2': 9 },
  })

  it('keeps newer work whichever side it is on', () => {
    for (const m of [merge(old, fresh), merge(fresh, old)]) {
      expect(m.attempts['ild:a'].at).toBe(5)
      expect(m.attempts['truss:b']).toBeDefined()
      expect(m.streak).toEqual({ last: '2026-10-22', count: 3 })
      expect(m.activity['2026-10-22']).toBe(4)
      expect(m.qStatus).toEqual({ q1: 'solved', q2: 'review' })
    }
  })

  it('a later status change wins, even back to an earlier status', () => {
    const redo = merge(fresh, base({ qStatus: { q1: 'review' }, stamps: { 'q:q1': 20 } }))
    expect(redo.qStatus.q1).toBe('review')
    expect(merge(redo, fresh).qStatus.q1).toBe('review')
  })

  it('settings follow their stamps', () => {
    const a = base({ rotSign: 'ccw', stamps: { rotSign: 3 } })
    const b = base({ rotSign: 'cw', stamps: { rotSign: 7 } })
    expect(merge(a, b).rotSign).toBe('cw')
    expect(merge(b, a).rotSign).toBe('cw')
  })

  it('is a no-op when the other side adds nothing', () => {
    expect(merge(fresh, old)).toEqual(merge(merge(fresh, old), old))
    expect(JSON.stringify(merge(fresh, base()))).toBe(JSON.stringify(fresh))
  })

  it('xp never drops below what the attempts earned', () => {
    expect(merge(old, fresh).xp).toBe(15)
    expect(merge(base({ attempts: { x: { tries: 2, correct: true, firstTry: false, at: 1 } } }), old).xp).toBe(23)
  })
})
