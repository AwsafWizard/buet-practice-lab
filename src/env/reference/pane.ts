import { useSyncExternalStore, type FC } from 'react'
import type { EvTopicId } from '../../store'

// UI state of the CE 331 chart & method pane (right side). Per device, never synced.

/** pane groups: c- water chemistry, t- treatment units, r- Rowshan ma'am (RWH, pumps, pipes, WSP), s- Snigdha ma'am (demand, population, wells, networks), m- methods (step-by-step recipes) */
export type EvRefGroup = 'chem' | 'treat' | 'rm' | 'sn' | 'steps'

export interface EvRefItem {
  id: string
  group: EvRefGroup
  title: string
  /** source, e.g. "TA T05" or "SN L5 notes" */
  tag?: string
  /** asked in past papers */
  exam?: boolean
  keywords?: string
  Body: FC
}

interface PaneState {
  open: boolean
  group: EvRefGroup | null
  expanded: string[]
  /** pane width in px on screens ≥ 640 px (drag the left edge; the page shrinks beside it) */
  width: number
  jump: string | null
}

const KEY = 'ce331-chart-pane'
let state: PaneState = load()
const subs = new Set<() => void>()

function load(): PaneState {
  const base: PaneState = { open: false, group: null, expanded: [], width: 460, jump: null }
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { ...base, open: !!s.open, group: s.group ?? null, expanded: Array.isArray(s.expanded) ? s.expanded : [], width: typeof s.width === 'number' ? s.width : 460 }
  } catch {
    return base
  }
}

export function setPane(p: Partial<PaneState>) {
  state = { ...state, ...p }
  try {
    const { open, group, expanded, width } = state
    localStorage.setItem(KEY, JSON.stringify({ open, group, expanded, width }))
  } catch {
    /* storage blocked */
  }
  subs.forEach((f) => f())
}

export function usePane() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => state,
  )
}

const PREFIX: Record<string, EvRefGroup> = { c: 'chem', t: 'treat', r: 'rm', s: 'sn', m: 'steps' }
export const groupOfEvRef = (id: string | undefined): EvRefGroup | null => PREFIX[id?.split('-')[0] ?? ''] ?? null

/** open the pane on one item (its group, expanded, scrolled to) */
export function openEvRef(id: string) {
  const group = groupOfEvRef(id)
  if (!group) return
  setPane({ open: true, group, expanded: state.expanded.includes(id) ? state.expanded : [...state.expanded, id], jump: id })
}

export const EV_GROUP_LABEL: Record<EvRefGroup, string> = {
  chem: 'Water chemistry',
  treat: 'Treatment units',
  rm: 'RWH, pumps & pipes',
  sn: 'Demand, wells & networks',
  steps: 'Methods (step by step)',
}
export const EV_GROUP_ORDER: EvRefGroup[] = ['chem', 'treat', 'rm', 'sn', 'steps']

/** which pane group a topic opens on */
export const EV_TOPIC_GROUP: Record<EvTopicId, EvRefGroup> = {
  'ev-wq': 'chem',
  'ev-aer': 'chem',
  'ev-sed': 'treat',
  'ev-coag': 'treat',
  'ev-soft': 'treat',
  'ev-ix': 'treat',
  'ev-filt': 'treat',
  'ev-dis': 'treat',
  'ev-att': 'treat',
  'ev-fe': 'treat',
  'ev-eco': 'rm',
  'ev-climate': 'rm',
  'ev-bdws': 'rm',
  'ev-rwh': 'rm',
  'ev-intake': 'rm',
  'ev-pump': 'rm',
  'ev-trans': 'rm',
  'ev-wsp': 'rm',
  'ev-ws': 'sn',
  'ev-demand': 'sn',
  'ev-pop': 'sn',
  'ev-gw': 'sn',
  'ev-well': 'sn',
  'ev-dist': 'sn',
}

/** the width actually used: never more than leaves ~420 px of page beside it */
export function paneWidth(w: number) {
  const vw = typeof window === 'undefined' ? 1600 : window.innerWidth
  return Math.round(Math.max(320, Math.min(w, vw - 420, 1100)))
}
