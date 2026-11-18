// Past-paper parts joined with the teacher maps (ta / rm / sn) that say how each one is answered.
import { EV_PAPERS, type EvPartMap, type EvQ } from '../types'
import { EV_PARTS } from './parts'

// Theory and number maps live in separate files per teacher (ta.tsx + ta-math.tsx …) so two authors never
// share a file; a part in both is merged field by field (topics and answers joined, Sol/final from the maths).
const maps = import.meta.glob<Record<string, Record<string, EvPartMap>>>('./*.tsx', { eager: true })

const uniq = <T,>(xs: T[]) => [...new Set(xs)]
export function mergeMaps(a: EvPartMap, b: EvPartMap): EvPartMap {
  return {
    ...a,
    ...b,
    topics: uniq([...a.topics, ...b.topics]),
    ans: uniq([...a.ans, ...b.ans]),
    extra: [a.extra, b.extra].filter(Boolean).join('\n\n') || undefined,
    from: a.from || b.from ? uniq([...(a.from ?? []), ...(b.from ?? [])]) : undefined,
    notes: a.notes || b.notes ? [...(a.notes ?? []), ...(b.notes ?? [])] : undefined,
    Sol: b.Sol ?? a.Sol,
    final: b.final ?? a.final,
    flag: [a.flag, b.flag].filter(Boolean).join(' · ') || undefined,
  }
}

export const EV_MAP: Record<string, EvPartMap> = {}
for (const [file, m] of Object.entries(maps))
  for (const v of Object.values(m)) {
    if (typeof v !== 'object' || !v) continue
    for (const [id, pm] of Object.entries(v)) {
      if (!pm || !Array.isArray(pm.topics)) throw new Error(`${file}: ${id} is not a part map`)
      EV_MAP[id] = EV_MAP[id] ? mergeMaps(EV_MAP[id], pm) : pm
    }
  }

const order = EV_PAPERS.map((p) => p.id as string)
const numKey = (no: string) => {
  const m = /^(\d+)(?:\(([a-z])\))?/.exec(no)
  return m ? +m[1] * 100 + (m[2] ? m[2].charCodeAt(0) - 96 : 0) : 0
}

export const EV_ALL: EvQ[] = EV_PARTS.map((p): EvQ => ({ ...(EV_MAP[p.id] ?? { topics: p.tags ?? [], ans: [] }), ...p })).sort(
  (a, b) => order.indexOf(a.paper) - order.indexOf(b.paper) || numKey(a.no) - numKey(b.no),
)

export const evQById = (id: string) => EV_ALL.find((q) => q.id === id)
export const evQForPaper = (paper: string) => EV_ALL.filter((q) => q.paper === paper)
export const evQForTopic = (topic: string) => EV_ALL.filter((q) => q.topics.includes(topic as never))
