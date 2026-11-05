// Cross-device progress sync for the private Artifact build.
// Every device keeps its own db document (progress/dev-<id>) and only ever writes that one;
// what a device shows is the merge of its local progress with every device's document.
// The merge only adds (later record wins, counts take the max), so a device that comes
// back with an old copy can't wipe what other devices did meanwhile. The old shared
// document progress/main is still read as one more source but never written.
import { useSyncExternalStore } from 'react'
import { useStore, type Attempt, type TimeAdjust, type TimeLog } from './store'
import { device } from './timer'

declare const __ARTIFACT__: boolean
export const ARTIFACT = typeof __ARTIFACT__ !== 'undefined' && __ARTIFACT__

type Snap = { id: string; exists: boolean; data(): Record<string, unknown> | undefined }
type DocRef = { id: string; set(data: Record<string, unknown>): Promise<void> }
type Coll = {
  doc(id: string): DocRef
  onSnapshot(next: (s: { docs: Snap[] }) => void, error?: (e: unknown) => void): () => void
}
type ClaudeWindow = { claude?: { use(name: 'db'): Promise<{ collection(path: string): Coll } | null> } }

export type SyncStatus = 'off' | 'connecting' | 'local' | 'saving' | 'synced' | 'error'
let status: SyncStatus = 'off'
const listeners = new Set<() => void>()
function setStatus(s: SyncStatus) {
  status = s
  listeners.forEach((l) => l())
}
export function useSyncStatus() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => status,
  )
}

// everything except the theme, which stays per device
const KEYS = ['attempts', 'revealed', 'xp', 'streak', 'activity', 'planner', 'planner315', 'planner341', 'qStatus', 'mockScores', 'timeLog', 'courseLog', 'timeAdjust', 'timeGoal', 'stamps', 'bmdSide', 'rotSign'] as const
export type Progress = Pick<ReturnType<typeof useStore.getState>, (typeof KEYS)[number]>

function progress(): Progress {
  const s = useStore.getState()
  return Object.fromEntries(KEYS.map((k) => [k, s[k]])) as Progress
}
const payload = () => JSON.stringify(progress())

/** time only ever grows, so the larger count per device per day is the right one */
function mergeTime(a: TimeLog = {}, b: TimeLog = {}): TimeLog {
  const out: TimeLog = { ...a }
  for (const [dev, days] of Object.entries(b)) {
    const mine = { ...out[dev] }
    for (const [d, n] of Object.entries(days)) mine[d] = Math.max(mine[d] ?? 0, n)
    out[dev] = mine
  }
  return out
}

const later = <T extends { at: number }>(x: Record<string, T> = {}, y: Record<string, T> = {}) => {
  const out = { ...x }
  for (const [k, v] of Object.entries(y)) if (!out[k] || v.at > out[k].at) out[k] = v
  return out
}
const maxEach = (x: Record<string, number> = {}, y: Record<string, number> = {}) => {
  const out = { ...x }
  for (const [k, n] of Object.entries(y)) out[k] = Math.max(out[k] ?? 0, n)
  return out
}

/** xp as record() hands it out: 15 for a check right first time, 8 when right later */
const xpOf = (attempts: Record<string, Attempt>) => Object.values(attempts).reduce((s, a) => s + (a.correct ? (a.firstTry ? 15 : 8) : 0), 0)

/**
 * Union of two copies of the progress, keeping the later record wherever they overlap.
 * `a` wins ties, so merging something that adds nothing gives back `a` unchanged.
 */
export function merge(a: Progress, b: Progress): Progress {
  const sa = a.stamps ?? {}
  const sb = b.stamps ?? {}
  // a setting or question status: the one changed later (unstamped = before stamps existed)
  const pick = <T>(key: string, x: T, y: T) => ((sb[key] ?? 0) > (sa[key] ?? 0) && y !== undefined ? y : (x ?? y))
  const qStatus = { ...a.qStatus }
  for (const [id, s] of Object.entries(b.qStatus ?? {})) qStatus[id] = pick('q:' + id, qStatus[id], s)
  const attempts = later<Attempt>(a.attempts, b.attempts)
  const sx = a.streak
  const sy = b.streak
  return {
    attempts,
    revealed: { ...b.revealed, ...a.revealed },
    xp: Math.max(a.xp ?? 0, b.xp ?? 0, xpOf(attempts)),
    streak: !sy || sx.last > sy.last || (sx.last === sy.last && sx.count >= sy.count) ? sx : sy,
    activity: maxEach(a.activity, b.activity),
    planner: pick('planner', a.planner, b.planner),
    planner315: pick('planner315', a.planner315, b.planner315),
    planner341: pick('planner341', a.planner341 ?? null, b.planner341 ?? null),
    qStatus,
    mockScores: later(a.mockScores, b.mockScores),
    timeLog: mergeTime(a.timeLog, b.timeLog),
    courseLog: mergeTime(a.courseLog, b.courseLog),
    timeAdjust: later<TimeAdjust[string]>(a.timeAdjust, b.timeAdjust),
    timeGoal: pick('timeGoal', a.timeGoal, b.timeGoal),
    stamps: maxEach(sa, sb),
    bmdSide: pick('bmdSide', a.bmdSide, b.bmdSide),
    rotSign: pick('rotSign', a.rotSign, b.rotSign),
  }
}

export async function startSync() {
  if (!ARTIFACT) return
  setStatus('connecting')
  const db = await (window as unknown as ClaudeWindow).claude?.use('db').catch(() => null)
  if (!db) return setStatus('local')
  const coll = db.collection('progress')
  const mine = coll.doc('dev-' + device)

  let ready = false // true once the first snapshot has been merged in
  let applying = false
  let written = '' // what this device's document holds

  // one write at a time; changes made during a write go out right after it
  let writing = false
  let again = false
  async function push() {
    if (writing) return void (again = true)
    writing = true
    try {
      do {
        again = false
        const state = payload()
        if (state === written) continue
        setStatus('saving')
        await mine.set({ state, updatedAt: Date.now() })
        written = state
      } while (again)
      setStatus('synced')
    } catch {
      setStatus('error')
    } finally {
      writing = false
    }
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(push, 1500)
  }

  useStore.subscribe(() => {
    if (!applying && ready && payload() !== written) schedule() // a theme switch changes nothing here
  })
  // phones kill background tabs: flush a pending save when the page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && ready && timer) {
      clearTimeout(timer)
      timer = undefined
      void push()
    }
  })

  coll.onSnapshot(
    (snap) => {
      let p = progress()
      const before = JSON.stringify(p)
      for (const d of snap.docs) {
        const raw = d.exists ? (d.data()?.state as string | undefined) : undefined
        if (!raw) continue
        if (d.id === mine.id && !writing) written = raw
        try {
          p = merge(p, JSON.parse(raw) as Progress)
        } catch {
          /* a damaged document adds nothing */
        }
      }
      if (JSON.stringify(p) !== before) {
        applying = true
        useStore.setState(p)
        applying = false
      }
      ready = true
      if (payload() !== written) schedule()
      else if (!writing) setStatus('synced')
    },
    () => setStatus('error'),
  )
}
