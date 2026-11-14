// A recall result saved as "cleared" (by the store-wide Clear all that was live briefly on 14 Nov) reads as
// never tried, and doing the list again starts fresh without paying xp twice.
import { beforeEach, describe, expect, it } from 'vitest'
import { topicStats, useStore } from '../store'

const K = 'pc-law:kw:l-test'
const cleared = { tries: 0, correct: false, firstTry: false, at: 2, cleared: true }

describe('a saved "cleared" recall result', () => {
  beforeEach(() => useStore.getState().reset())

  it('is not counted as tried', () => {
    useStore.setState({ attempts: { [K]: cleared } })
    expect(topicStats(useStore.getState().attempts, 'pc-law').tried).toBe(0)
  })

  it('doing the list again starts fresh, without new xp', () => {
    useStore.setState({ attempts: { [K]: cleared }, xp: 15 })
    useStore.getState().record(K, true)
    const a = useStore.getState().attempts[K]
    expect(a).toMatchObject({ tries: 1, correct: true })
    expect(a.cleared).toBeUndefined()
    expect(useStore.getState().xp).toBe(15)
  })
})
