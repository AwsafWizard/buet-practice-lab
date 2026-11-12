// Leitner boxes squeezed to fit five days before an exam: box 1 comes back in minutes, box 5 in days.
import type { CardState } from '../../store'

export type Grade = 'again' | 'shaky' | 'got'

const MIN = 60_000
/** wait after a review, by box (index = box) */
export const INTERVAL = [0, 5 * MIN, 30 * MIN, 4 * 60 * MIN, 24 * 60 * MIN, 3 * 24 * 60 * MIN]
export const BOX_LABEL = ['new', 'learning', 'shaky', 'getting there', 'known', 'mastered']

export function rate(prev: CardState | undefined, g: Grade, now = Date.now()): CardState {
  const box0 = prev?.box ?? 0
  const n = (prev?.n ?? 0) + 1
  const miss = (prev?.miss ?? 0) + (g === 'again' ? 1 : 0)
  if (g === 'again') return { box: 1, due: now + MIN, at: now, n, miss }
  if (g === 'shaky') {
    const box = Math.max(1, Math.min(box0, 2))
    return { box, due: now + INTERVAL[box] / 2, at: now, n, miss }
  }
  // known straight away on first sight → skip the learning box
  const box = Math.min(5, box0 === 0 ? 2 : box0 + 1)
  return { box, due: now + INTERVAL[box], at: now, n, miss }
}

export interface Queued {
  id: string
  /** higher = asked in more papers */
  weight: number
}

/** cards due now (oldest first), then new ones (most-asked first), at most `fresh` new cards */
export function buildQueue(all: Queued[], states: Record<string, CardState>, now = Date.now(), fresh = 20): string[] {
  const due = all.filter((c) => states[c.id] && states[c.id].due <= now).sort((a, b) => states[a.id].due - states[b.id].due)
  const neu = all.filter((c) => !states[c.id]).sort((a, b) => b.weight - a.weight)
  return [...due.map((c) => c.id), ...neu.slice(0, fresh).map((c) => c.id)]
}

/** how many cards sit in each box (0 = never seen) */
export function boxCounts(ids: string[], states: Record<string, CardState>): number[] {
  const out = [0, 0, 0, 0, 0, 0]
  for (const id of ids) out[states[id]?.box ?? 0]++
  return out
}

/** when the next card falls due (ms), or null when none is waiting */
export function nextDue(ids: string[], states: Record<string, CardState>): number | null {
  let t: number | null = null
  for (const id of ids) {
    const s = states[id]
    if (s && (t === null || s.due < t)) t = s.due
  }
  return t
}
