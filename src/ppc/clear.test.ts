// "Clear all" in keyword recall: results read as never tried, the clear survives a sync with an older
// copy, and doing a cleared list again starts fresh without paying xp twice.
import { beforeEach, describe, expect, it } from 'vitest'
import { topicStats, useStore } from '../store'
import { merge, type Progress } from '../sync'

const K = 'pc-law:kw:l-test'

describe('clearing keyword-recall results', () => {
  beforeEach(() => useStore.getState().reset())

  it('a cleared list reads as untried and is not counted', () => {
    useStore.getState().record(K, true)
    expect(useStore.getState().attempts[K].correct).toBe(true)
    useStore.getState().clearAttempts([K, 'pc-law:kw:never-tried'])
    const a = useStore.getState().attempts
    expect(a[K]).toMatchObject({ cleared: true, correct: false, tries: 0 })
    expect(a['pc-law:kw:never-tried']).toBeUndefined()
    expect(topicStats(a, 'pc-law').tried).toBe(0)
  })

  it('doing it again starts fresh, without new xp', () => {
    useStore.getState().record(K, true)
    const xp = useStore.getState().xp
    useStore.getState().clearAttempts([K])
    useStore.getState().record(K, true)
    const a = useStore.getState().attempts[K]
    expect(a).toMatchObject({ tries: 1, correct: true })
    expect(a.cleared).toBeUndefined()
    expect(useStore.getState().xp).toBe(xp)
  })

  it('the clear wins over an older synced copy', () => {
    const fill = (attempts: Progress['attempts']): Progress => ({ attempts, revealed: {}, xp: 15, streak: { last: '', count: 0 }, activity: {}, planner: null, planner315: null, planner341: null, planner301: null, cards: {}, qStatus: {}, mockScores: {}, timeLog: {}, courseLog: {}, timeAdjust: {}, timeGoal: 8, stamps: {}, bmdSide: 'compression', rotSign: 'cw' })
    const old = fill({ [K]: { tries: 1, correct: true, firstTry: true, at: 1 } })
    const now = fill({ [K]: { tries: 0, correct: false, firstTry: false, at: 2, cleared: true } })
    expect(merge(old, now).attempts[K].cleared).toBe(true)
    expect(merge(now, old).attempts[K].cleared).toBe(true)
  })
})
