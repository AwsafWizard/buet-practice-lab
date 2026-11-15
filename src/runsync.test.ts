import { afterEach, describe, expect, it, vi } from 'vitest'
import { useStore } from './store'
import { canon, merge, runSync, type Progress, type SyncBackend } from './sync'
import { pack, unpack } from './pack'

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

const base = () => JSON.parse(JSON.stringify(useStore.getState())) as Progress
const att = (at: number, correct: boolean) => ({ tries: 1, correct, firstTry: correct, at })

describe('merge', () => {
  // two tabs of one browser write the same row; each used to keep its own version of a tie (and its own
  // key order), so they rewrote the row back and forth every few seconds
  const a: Progress = { ...base(), attempts: { k1: att(5, true), k2: att(7, false) }, qStatus: { q1: 'solved' }, stamps: { 'q:q1': 3 }, streak: { last: '2026-11-15', count: 2 } }
  const b: Progress = { ...base(), attempts: { k2: att(7, true), k1: att(5, true) }, qStatus: { q1: 'review' }, stamps: { 'q:q1': 3 }, streak: { last: '2026-11-15', count: 2 } }

  it('gives the same result whichever copy is local', () => {
    expect(canon(merge(a, b))).toBe(canon(merge(b, a)))
  })
  it('adds nothing the second time', () => {
    const m = merge(a, b)
    expect(canon(merge(m, b))).toBe(canon(m))
    expect(canon(merge(m, a))).toBe(canon(m))
  })
  it('still lets the later change win', () => {
    const later = { ...b, stamps: { 'q:q1': 9 } }
    expect(merge(a, later).qStatus.q1).toBe('review')
    expect(merge(later, a).qStatus.q1).toBe('review')
  })
  it('ignores key order when comparing', () => {
    expect(canon({ x: 1, y: { p: 1, q: 2 } })).toBe(canon({ y: { q: 2, p: 1 }, x: 1 }))
  })
})

describe('runSync with a row holding the same progress in another key order', () => {
  it('does not rewrite it', async () => {
    vi.useFakeTimers()
    useStore.setState({ attempts: { k1: att(5, true), k2: att(7, true) }, xp: 30 })
    const mine = base()
    const reordered = { ...mine, attempts: { k2: mine.attempts.k2, k1: mine.attempts.k1 } }
    const rows = new Map([['dev-me', JSON.stringify(reordered)]])
    const { b, writes, refresh } = fakeBackend(rows, 'dev-me')
    const stop = runSync(b)
    await vi.advanceTimersByTimeAsync(5000)
    expect(writes.length).toBe(0)
    for (let i = 0; i < 5; i++) {
      refresh()
      await vi.advanceTimersByTimeAsync(5000)
    }
    expect(writes.length).toBe(0)
    stop()
  })
})

describe('pack', () => {
  it('round-trips and shrinks a progress-like copy', async () => {
    const attempts = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`sm-2023-24-q${i}-part-a`, att(1763200000000 + i, i % 3 > 0)]))
    const text = JSON.stringify({ ...base(), attempts })
    const packed = await pack(text)
    expect(packed.startsWith('gz1:')).toBe(true)
    expect(packed.length).toBeLessThan(text.length / 4)
    expect(await unpack(packed)).toBe(text)
  })
  it('passes rows saved before packing through unchanged', async () => {
    expect(await unpack('{"xp":3}')).toBe('{"xp":3}')
  })
})
