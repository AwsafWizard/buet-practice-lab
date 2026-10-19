// Persistent progress / planner / settings state (browser localStorage, exportable).

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export interface Attempt {
  tries: number
  correct: boolean
  firstTry: boolean
  at: number
}

export interface PlanBlock {
  id: string
  topic: TopicId | 'mixed' | 'mock' | 'setup'
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

interface State {
  theme: 'dark' | 'light'
  bmdSide: 'compression' | 'tension'
  attempts: Record<string, Attempt> // key: check id
  revealed: Record<string, boolean> // solutions opened
  xp: number
  streak: { last: string; count: number }
  activity: Record<string, number> // yyyy-mm-dd -> checks done
  planner: PlannerState | null
  qStatus: Record<string, 'todo' | 'tried' | 'solved' | 'review'>
  mockScores: Record<string, { at: number; secA: number; secB: number; note?: string }>
  setTheme(t: 'dark' | 'light'): void
  setBmdSide(s: 'compression' | 'tension'): void
  record(id: string, correct: boolean, topic?: string): Attempt
  reveal(id: string): void
  setPlanner(p: PlannerState): void
  setQStatus(id: string, s: 'todo' | 'tried' | 'solved' | 'review'): void
  saveMock(id: string, secA: number, secB: number, note?: string): void
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
  attempts: {},
  revealed: {},
  xp: 0,
  streak: { last: '', count: 0 },
  activity: {},
  planner: null,
  qStatus: {},
  mockScores: {},
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setTheme: (theme) => set({ theme }),
      setBmdSide: (bmdSide) => set({ bmdSide }),
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
      setPlanner: (planner) => set({ planner }),
      setQStatus: (id, s) => set({ qStatus: { ...get().qStatus, [id]: s } }),
      saveMock: (id, secA, secB, note) => set({ mockScores: { ...get().mockScores, [id]: { at: Date.now(), secA, secB, note } } }),
      importState(json) {
        const data = JSON.parse(json)
        set({ ...data })
      },
      reset: () => set({ ...initial }),
    }),
    { name: 'ce311-dashboard-v1' },
  ),
)

export function exportState(): string {
  const s = useStore.getState()
  const { attempts, revealed, xp, streak, activity, planner, qStatus, mockScores, theme, bmdSide } = s
  return JSON.stringify({ attempts, revealed, xp, streak, activity, planner, qStatus, mockScores, theme, bmdSide }, null, 1)
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
