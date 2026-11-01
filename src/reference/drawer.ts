import { useSyncExternalStore } from 'react'

// UI state of the "Code tables" drawer. Per device (never synced): open flag, group, expanded items.
export type RefGroup = 'wind' | 'eq' | 'loads' | 'vw'

interface DrawerState {
  open: boolean
  group: RefGroup | null // null → follow the page's topic
  expanded: string[] // ids of expanded items
  wide: boolean // 760 px instead of 440 px, for the wide tables
  focus: string | null // past question whose attached tables lead the drawer (not saved)
  focusOpen: string[] // expanded items while focused, starts as that question's attached tables
  jump: string | null // item to scroll to once the panel renders
}

const KEY = 'ce311-ref-drawer'
let state: DrawerState = load()
const subs = new Set<() => void>()

function load(): DrawerState {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { open: !!s.open, group: s.group ?? null, expanded: Array.isArray(s.expanded) ? s.expanded : [], wide: !!s.wide, focus: null, focusOpen: [], jump: null }
  } catch {
    return { open: false, group: null, expanded: [], wide: false, focus: null, focusOpen: [], jump: null }
  }
}

export function setDrawer(p: Partial<DrawerState>) {
  state = { ...state, ...p }
  try {
    const { open, group, expanded, wide } = state
    localStorage.setItem(KEY, JSON.stringify({ open, group, expanded, wide }))
  } catch {
    // storage blocked: state still works for this visit
  }
  subs.forEach((f) => f())
}

export function useDrawer() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => state,
  )
}

/** lead the drawer with a past question's attached tables, all of them open and everything else shut */
export function focusQuestion(id: string, refs: string[], opts: { open?: boolean; jump?: string } = {}) {
  // keep the reader's own toggles while the same question stays in focus
  const base = state.focus === id ? state.focusOpen : refs
  setDrawer({
    focus: id,
    focusOpen: opts.jump && !base.includes(opts.jump) ? [...base, opts.jump] : base,
    group: null,
    ...(opts.open ? { open: true } : {}),
    jump: opts.jump ?? null,
  })
}

/** which reference group belongs to a topic (null → no drawer on that topic) */
export function groupForTopic(topic: string | undefined): RefGroup | null {
  if (topic === 'wind') return 'wind'
  if (topic === 'eq') return 'eq'
  if (topic === 'code') return 'loads'
  if (topic === 'vw') return 'vw'
  return null
}

/** group of a drawer item from its id prefix (keeps the tables themselves out of the main bundle) */
export function groupOfRef(id: string | undefined): RefGroup | null {
  return ({ w: 'wind', e: 'eq', l: 'loads', v: 'vw' } as const)[id?.split('-')[0] as 'w'] ?? null
}

export const GROUP_LABEL: Record<RefGroup, string> = { wind: 'Wind', eq: 'Earthquake', loads: 'Live loads', vw: '∫ chart' }
export const GROUP_ORDER: RefGroup[] = ['wind', 'eq', 'loads', 'vw']
