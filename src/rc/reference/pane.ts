import { useSyncExternalStore, type FC } from 'react'
import type { RcGiven } from '../types'
import type { RcRefGroup } from '../registry'

export type { RcRefGroup }

// UI state of the CE 315 code pane (right side). Per device, never synced.
export interface RcRefItem {
  /** prefix = group: m- materials, f- flexure, s- shear/torsion, b- bond, sl- slabs, st- steps */
  id: string
  group: RcRefGroup
  title: string
  /** source, e.g. "Table 12.3" or "ACI 9.6.1" */
  tag?: string
  /** printed with recent question papers */
  exam?: boolean
  keywords?: string
  Body: FC
}

interface PaneState {
  open: boolean
  group: RcRefGroup | null
  expanded: string[]
  wide: boolean
  /** past question whose attached tables lead the pane */
  focus: string | null
  focusGiven: RcGiven[]
  focusOpen: string[]
  jump: string | null
  /** what the current lab used, per item id (e.g. { 'sl-t123': { case: 4, m: 0.8 } }) — tables highlight it */
  hl: Record<string, Record<string, number | string>>
}

const KEY = 'ce315-code-pane'
let state: PaneState = load()
const subs = new Set<() => void>()

function load(): PaneState {
  const base: PaneState = { open: false, group: null, expanded: [], wide: false, focus: null, focusGiven: [], focusOpen: [], jump: null, hl: {} }
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { ...base, open: !!s.open, group: s.group ?? null, expanded: Array.isArray(s.expanded) ? s.expanded : [], wide: !!s.wide }
  } catch {
    return base
  }
}

export function setPane(p: Partial<PaneState>) {
  state = { ...state, ...p }
  try {
    const { open, group, expanded, wide } = state
    localStorage.setItem(KEY, JSON.stringify({ open, group, expanded, wide }))
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

export const givenRefIds = (g: RcGiven[]) => [...new Set(g.flatMap((x) => (x.ref ? [x.ref] : [])))]

/** lead the pane with a past question's attached tables */
export function focusRcQuestion(id: string, given: RcGiven[], opts: { open?: boolean; jump?: string } = {}) {
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

export function groupOfRcRef(id: string | undefined): RcRefGroup | null {
  const p = id?.split('-')[0]
  return p === 'm' ? 'mat' : p === 'f' ? 'flex' : p === 's' ? 'shear' : p === 'b' ? 'bond' : p === 'sl' ? 'slab' : p === 'st' ? 'steps' : null
}

export const RC_GROUP_LABEL: Record<RcRefGroup, string> = { mat: 'Materials & bars', flex: 'Flexure', shear: 'Shear & torsion', bond: 'Bond', slab: 'Slabs', steps: 'Steps' }
export const RC_GROUP_ORDER: RcRefGroup[] = ['mat', 'flex', 'shear', 'bond', 'slab', 'steps']
