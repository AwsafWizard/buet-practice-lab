// Field-book sheet helpers over the synced `fieldbook` store (each sheet: { meta, body }).
import { useStore, type FieldSheet } from '../../store'
import { kindOf } from './kinds'

export interface SheetMeta {
  /** date of performance, yyyy-mm-dd */
  date: string
  group: string
  place: string
  note: string
}

export interface SheetData {
  meta: SheetMeta
  body: unknown
}

const today = () => new Date().toISOString().slice(0, 10)

export function newSheet(kind: string, example = false): string {
  const k = kindOf(kind)
  if (!k) throw new Error('no sheet kind ' + kind)
  const id = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const now = Date.now()
  const count = Object.values(useStore.getState().fieldbook).filter((s) => s.kind === kind && !s.deleted).length
  const body = example && k.sample ? k.sample() : k.blank()
  const sheet: FieldSheet = {
    id,
    kind,
    title: example ? `${k.label} — seniors’ example` : `${k.label}${count ? ' ' + (count + 1) : ''}`,
    at: now,
    made: now,
    data: { meta: { date: today(), group: '', place: example ? '' : 'BUET playground', note: example ? (k.sampleNote ?? '') : '' }, body } satisfies SheetData,
  }
  useStore.getState().setSheet(sheet)
  return id
}

export function updateSheet(id: string, patch: Partial<Pick<FieldSheet, 'title' | 'data'>>) {
  const s = useStore.getState().fieldbook[id]
  if (!s) return
  useStore.getState().setSheet({ ...s, ...patch, at: Date.now() })
}

export function deleteSheet(id: string) {
  const s = useStore.getState().fieldbook[id]
  if (!s) return
  // keep a tombstone so another device's copy doesn't bring it back
  useStore.getState().setSheet({ ...s, deleted: true, data: null, at: Date.now() })
}

export function duplicateSheet(id: string): string | null {
  const s = useStore.getState().fieldbook[id]
  if (!s || s.deleted) return null
  const nid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const now = Date.now()
  useStore.getState().setSheet({ ...s, id: nid, title: s.title + ' (copy)', at: now, made: now, data: JSON.parse(JSON.stringify(s.data)) })
  return nid
}

export const sheetData = (s: FieldSheet): SheetData => {
  const d = s.data as SheetData | null
  return d && typeof d === 'object' && 'body' in d ? d : { meta: { date: '', group: '', place: '', note: '' }, body: s.data }
}
