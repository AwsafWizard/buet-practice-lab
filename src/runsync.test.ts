import { afterEach, describe, expect, it, vi } from 'vitest'
import { useStore } from './store'
import { runSync, type SyncBackend } from './sync'

/** an in-memory backend shared by "devices": rows keyed by device id, like the Supabase table */
function fakeBackend(rows: Map<string, string>, mineId: string) {
  const writes: string[] = []
  let push: ((docs: { id: string; state?: string }[]) => void) | null = null
  const b: SyncBackend = {
    mineId,
    async write(state) {
      writes.push(state)
      rows.set(mineId, state)
    },
    watch(next) {
      push = next
      next([...rows].map(([id, state]) => ({ id, state })))
      return () => (push = null)
    },
  }
  return { b, writes, refresh: () => push?.([...rows].map(([id, state]) => ({ id, state }))) }
}

afterEach(() => vi.useRealTimers())

describe('runSync', () => {
  it('merges another device’s row in and writes only its own row after a change', async () => {
    vi.useFakeTimers()
    const other = { ...JSON.parse(JSON.stringify(useStore.getState())), qStatus: { 'sm-2023-24-1a': 'solved' }, stamps: { 'q:sm-2023-24-1a': 5 } }
    const rows = new Map([['dev-other', JSON.stringify(other)]])
    const { b, writes } = fakeBackend(rows, 'dev-me')
    const stop = runSync(b)
    expect(useStore.getState().qStatus['sm-2023-24-1a']).toBe('solved')
    // the merged state differs from this device's (missing) row, so it is written once
    await vi.advanceTimersByTimeAsync(2000)
    expect(writes.length).toBe(1)
    expect(rows.has('dev-me')).toBe(true)
    expect(JSON.parse(rows.get('dev-other')!).qStatus['sm-2023-24-1a']).toBe('solved')
    useStore.getState().setQStatus('sm-2023-24-2a', 'review')
    await vi.advanceTimersByTimeAsync(2000)
    expect(writes.length).toBe(2)
    expect(JSON.parse(rows.get('dev-me')!).qStatus['sm-2023-24-2a']).toBe('review')
    stop()
    useStore.getState().setQStatus('sm-2023-24-3a', 'tried')
    await vi.advanceTimersByTimeAsync(2000)
    expect(writes.length).toBe(2) // stopped: nothing more goes out
  })
})
