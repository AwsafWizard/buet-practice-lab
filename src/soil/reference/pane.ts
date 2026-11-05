import { useSyncExternalStore, type FC } from 'react'
import type { SmGiven } from '../types'
import type { SmRefGroup } from '../registry'

export type { SmRefGroup }

// UI state of the CE 341 chart & table pane (right side). Per device, never synced.
export interface SmRefItem {
  /** prefix = group: c- index & classification, s- shear strength, e- earth pressure, w- compaction & water, k- consolidation, d- stress distribution, st- steps */
  id: string
  group: SmRefGroup
  title: string
  /** source, e.g. "Das Table 5.2" or "AASHTO M 145" */
  tag?: string
  /** printed with recent question papers */
  exam?: boolean
  keywords?: string
  Body: FC
}

interface PaneState {
  open: boolean
  group: SmRefGroup | null
  expanded: string[]
  wide: boolean
  /** pane width in px on screens ≥ 640 px (drag the left edge; the page shrinks beside it) */
  width: number
  /** past question whose attached tables lead the pane */
  focus: string | null
  focusGiven: SmGiven[]
  focusOpen: string[]
  jump: string | null
  /** what the current lab used, per item id (e.g. { 'k-tvu': { U: 60 } }) — tables highlight it */
  hl: Record<string, Record<string, number | string>>
}

const KEY = 'ce341-code-pane'
let state: PaneState = load()
const subs = new Set<() => void>()

function load(): PaneState {
  const base: PaneState = { open: false, group: null, expanded: [], wide: false, width: 440, focus: null, focusGiven: [], focusOpen: [], jump: null, hl: {} }
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { ...base, open: !!s.open, group: s.group ?? null, expanded: Array.isArray(s.expanded) ? s.expanded : [], wide: !!s.wide, width: typeof s.width === 'number' ? s.width : s.wide ? 760 : 440 }
  } catch {
    return base
  }
}

export function setPane(p: Partial<PaneState>) {
  state = { ...state, ...p }
  try {
    const { open, group, expanded, wide, width } = state
    localStorage.setItem(KEY, JSON.stringify({ open, group, expanded, wide, width }))
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

export const givenRefIds = (g: SmGiven[]) => [...new Set(g.flatMap((x) => (x.ref ? [x.ref] : [])))]

/** lead the pane with a past question's attached tables */
export function focusSmQuestion(id: string, given: SmGiven[], opts: { open?: boolean; jump?: string } = {}) {
  const refs = givenRefIds(given)
  const base = state.focus === id ? state.focusOpen : refs
  setPane({
    focus: id,
    focusGiven: given,
    focusOpen: opts.jump && !base.includes(opts.jump) ? [...base, opts.jump] : base,
    group: null,
    ...(opts.open ? { open: true } : {}),
    jump: opts.jump ?? null,
  })
}

/** a lab marks the table rows it used; call with the current values on every render (cheap when unchanged) */
export function markUsed(id: string, v: Record<string, number | string>) {
  const prev = state.hl[id]
  if (prev && JSON.stringify(prev) === JSON.stringify(v)) return
  setPane({ hl: { ...state.hl, [id]: v } })
}
export function useUsed(id: string) {
  return usePane().hl[id]
}

export function groupOfSmRef(id: string | undefined): SmRefGroup | null {
  const p = id?.split('-')[0]
  return p === 'c' ? 'idx' : p === 's' ? 'str' : p === 'e' ? 'lep' : p === 'w' ? 'wat' : p === 'k' ? 'con' : p === 'd' ? 'sd' : p === 'st' ? 'steps' : null
}

/** open the pane on one item (its group, expanded, scrolled to) */
export function openSmRef(id: string) {
  const group = groupOfSmRef(id)
  if (!group) return
  setPane({ open: true, focus: null, group, expanded: state.expanded.includes(id) ? state.expanded : [...state.expanded, id], jump: id })
}

export const SM_GROUP_LABEL: Record<SmRefGroup, string> = { idx: 'Index & classification', str: 'Shear strength', lep: 'Earth pressure', wat: 'Compaction & water', con: 'Consolidation', sd: 'Stress distribution', steps: 'Steps' }
export const SM_GROUP_ORDER: SmRefGroup[] = ['idx', 'str', 'lep', 'wat', 'con', 'sd', 'steps']

/** the width actually used: never more than leaves ~420 px of page beside it */
export function paneWidth(w: number) {
  const vw = typeof window === 'undefined' ? 1600 : window.innerWidth
  return Math.round(Math.max(320, Math.min(w, vw - 420, 1100)))
}
