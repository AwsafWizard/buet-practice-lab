// Persistent progress / planner / settings state (browser localStorage, exportable).

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setClockwise } from './engine/sign'

export type TopicId =
  | 'frames'
  | 'truss'
  | 'ild'
  | 'floor'
  | 'wheel'
  | 'lateral'
  | 'vertical'
  | 'stability'
  | 'code'
  | 'wind'
  | 'eq'
  | 'vw'
  | 'cable'

/** CE 315 (RCC) topics; the rc- prefix keeps their check ids apart from CE 311's */
export type RcTopicId =
  | 'rc-basics'
  | 'rc-elastic'
  | 'rc-singly'
  | 'rc-doubly'
  | 'rc-tbeam'
  | 'rc-shear'
  | 'rc-torsion'
  | 'rc-bond'
  | 'rc-oneway'
  | 'rc-twoway'

export interface Attempt {
  tries: number
  correct: boolean
  firstTry: boolean
  at: number
}

export interface PlanBlock {
  id: string
  topic: TopicId | RcTopicId | 'mixed' | 'mock' | 'setup'
  title: string
  hours: number
  kind: 'learn' | 'practice' | 'revise' | 'mock'
  how?: string
  /** ISO date (yyyy-mm-dd) when pinned manually; otherwise auto-packed */
  day?: string
  done?: boolean
}

export interface PlannerState {
  startDate: string
  examDate: string
  defaultHours: number
  hoursByDay: Record<string, number>
  blocks: PlanBlock[]
  revisionDays: number
}

/** seconds on the site, per device per day (each device only writes its own entry, so syncing never double-counts) */
export type TimeLog = Record<string, Record<string, number>>
/** manual correction per day in seconds (added to what was tracked); the later edit wins when syncing */
export type TimeAdjust = Record<string, { s: number; at: number }>

interface State {
  theme: 'dark' | 'light'
  bmdSide: 'compression' | 'tension'
  /** which sense of rotation is positive (moment reactions, rotations, couples) */
  rotSign: 'cw' | 'ccw'
  attempts: Record<string, Attempt> // key: check id
  revealed: Record<string, boolean> // solutions opened
  xp: number
  streak: { last: string; count: number }
  activity: Record<string, number> // yyyy-mm-dd -> checks done
  planner: PlannerState | null
  /** CE 315's own study plan */
  planner315: PlannerState | null
  qStatus: Record<string, 'todo' | 'tried' | 'solved' | 'review'>
  mockScores: Record<string, { at: number; secA: number; secB: number; note?: string }>
  timeLog: TimeLog
  timeAdjust: TimeAdjust
  timeGoal: number // hours per day
  /** when each setting / question status last changed (keys: planner, planner315, timeGoal, bmdSide, rotSign, q:<id>), so syncing keeps the later one */
  stamps: Record<string, number>
  setTheme(t: 'dark' | 'light'): void
  setBmdSide(s: 'compression' | 'tension'): void
  setRotSign(s: 'cw' | 'ccw'): void
  record(id: string, correct: boolean, topic?: string): Attempt
  reveal(id: string): void
  setPlanner(p: PlannerState): void
  setPlanner315(p: PlannerState): void
  setQStatus(id: string, s: 'todo' | 'tried' | 'solved' | 'review'): void
  saveMock(id: string, secA: number, secB: number, note?: string): void
  addTime(device: string, day: string, seconds: number): void
  setTimeAdjust(day: string, seconds: number, at?: number): void
  setTimeGoal(hours: number): void
  importState(json: string): void
  reset(): void
}

export const today = () => isoDate(new Date())
export function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const initial = {
  theme: 'dark' as const,
  bmdSide: 'compression' as const,
  rotSign: 'cw' as 'cw' | 'ccw',
  attempts: {},
  revealed: {},
  xp: 0,
  streak: { last: '', count: 0 },
  activity: {},
  planner: null,
  planner315: null as PlannerState | null,
  qStatus: {},
  mockScores: {},
  timeLog: {} as TimeLog,
  timeAdjust: {} as TimeAdjust,
  timeGoal: 8,
  stamps: {} as Record<string, number>,
}

const stamp = (stamps: Record<string, number> = {}, key: string) => ({ ...stamps, [key]: Date.now() })

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setTheme: (theme) => set({ theme }),
      setBmdSide: (bmdSide) => set({ bmdSide, stamps: stamp(get().stamps, 'bmdSide') }),
      setRotSign: (rotSign) => set({ rotSign, stamps: stamp(get().stamps, 'rotSign') }),
      record(id, correct) {
        const prev = get().attempts[id]
        const a: Attempt = prev
          ? { ...prev, tries: prev.tries + 1, correct: prev.correct || correct, at: Date.now() }
          : { tries: 1, correct, firstTry: correct, at: Date.now() }
        const gained = correct && !(prev && prev.correct) ? (a.tries === 1 ? 15 : 8) : 0
        const t = today()
        const st = get().streak
        let streak = st
        if (st.last !== t) {
          const y = new Date()
          y.setDate(y.getDate() - 1)
          streak = { last: t, count: st.last === isoDate(y) ? st.count + 1 : 1 }
        }
        set({
          attempts: { ...get().attempts, [id]: a },
          xp: get().xp + gained,
          streak,
          activity: { ...get().activity, [t]: (get().activity[t] ?? 0) + 1 },
        })
        return a
      },
      reveal: (id) => set({ revealed: { ...get().revealed, [id]: true } }),
      setPlanner: (planner) => set({ planner, stamps: stamp(get().stamps, 'planner') }),
      setPlanner315: (planner315) => set({ planner315, stamps: stamp(get().stamps, 'planner315') }),
      setQStatus: (id, s) => set({ qStatus: { ...get().qStatus, [id]: s }, stamps: stamp(get().stamps, 'q:' + id) }),
      saveMock: (id, secA, secB, note) => set({ mockScores: { ...get().mockScores, [id]: { at: Date.now(), secA, secB, note } } }),
      addTime(device, day, seconds) {
        const log = get().timeLog
        const mine = log[device] ?? {}
        set({ timeLog: { ...log, [device]: { ...mine, [day]: (mine[day] ?? 0) + seconds } } })
      },
      setTimeAdjust: (day, seconds, at = Date.now()) => set({ timeAdjust: { ...get().timeAdjust, [day]: { s: seconds, at } } }),
      setTimeGoal: (timeGoal) => set({ timeGoal, stamps: stamp(get().stamps, 'timeGoal') }),
      importState(json) {
        const data = JSON.parse(json)
        set({ ...data })
      },
      reset: () => set({ ...initial }),
    }),
    { name: 'ce311-dashboard-v1' },
  ),
)

// the engine's display helpers follow the stored convention (set before any page renders)
setClockwise(useStore.getState().rotSign !== 'ccw')
useStore.subscribe((s) => setClockwise(s.rotSign !== 'ccw'))

export function exportState(): string {
  const s = useStore.getState()
  const { attempts, revealed, xp, streak, activity, planner, planner315, qStatus, mockScores, timeLog, timeAdjust, timeGoal, stamps, theme, bmdSide, rotSign } = s
  return JSON.stringify({ attempts, revealed, xp, streak, activity, planner, planner315, qStatus, mockScores, timeLog, timeAdjust, timeGoal, stamps, theme, bmdSide, rotSign }, null, 1)
}

/** mastery of a topic: correct checks / total checks seen with that topic prefix */
export function topicStats(attempts: Record<string, Attempt>, topic: string) {
  let tried = 0,
    correct = 0,
    first = 0
  for (const [k, a] of Object.entries(attempts)) {
    if (!k.startsWith(topic + ':')) continue
    tried++
    if (a.correct) correct++
    if (a.firstTry) first++
  }
  return { tried, correct, first, acc: tried ? correct / tried : 0 }
}
