// Past-paper parts joined with the block maps that say how each one is answered.
import { PC_PAPERS, type PcPartMap, type PcQ } from '../types'
import { PC_PARTS } from './skeleton'

const maps = import.meta.glob<Record<string, Record<string, PcPartMap>>>(['./ia.ts', './oia.ts', './aan.ts'], { eager: true })

export const PC_MAP: Record<string, PcPartMap> = {}
for (const m of Object.values(maps)) for (const v of Object.values(m)) Object.assign(PC_MAP, v)

const order = PC_PAPERS.map((p) => p.id as string)
const numKey = (no: string) => {
  const m = /^(\d+)(?:\(([a-z])\))?/.exec(no)
  return m ? +m[1] * 100 + (m[2] ? m[2].charCodeAt(0) - 96 : 0) : 0
}

export const PC_ALL: PcQ[] = PC_PARTS.map((p): PcQ => ({ ...(PC_MAP[p.id] ?? { topics: [], ans: [] }), ...p })).sort(
  (a, b) => order.indexOf(a.paper) - order.indexOf(b.paper) || numKey(a.no) - numKey(b.no),
)

export const pcQById = (id: string) => PC_ALL.find((q) => q.id === id)
export const pcQForPaper = (paper: string) => PC_ALL.filter((q) => q.paper === paper)
export const pcQForTopic = (topic: string) => PC_ALL.filter((q) => q.topics.includes(topic as never))
