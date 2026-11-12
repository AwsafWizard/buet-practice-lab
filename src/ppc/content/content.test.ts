import { describe, expect, it } from 'vitest'
import { PC_ALL, PC_MAP } from '../pyq'
import { PC_PARTS } from '../pyq/skeleton'
import { PC_TOPICS } from '../registry'
import { PC_PAPERS } from '../types'
import { PC_ANSWERS, PC_CARDS, PC_LISTS } from './index'

const LABELS = new Set(PC_PAPERS.map((p) => p.label))
const TOPICS = new Set(PC_TOPICS.map((t) => t.id as string))

describe('CE 301 content', () => {
  it('ids are unique and well-prefixed', () => {
    const ids = [...PC_LISTS.map((x) => x.id), ...PC_CARDS.map((x) => x.id), ...PC_ANSWERS.map((x) => x.id)]
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i)
    expect(dup).toEqual([])
    for (const l of PC_LISTS) expect(l.id, l.id).toMatch(/^l-/)
    for (const c of PC_CARDS) expect(c.id, c.id).toMatch(/^c-/)
    for (const a of PC_ANSWERS) expect(a.id, a.id).toMatch(/^a-/)
  })
  it('topics and paper labels are real', () => {
    for (const x of [...PC_LISTS, ...PC_CARDS, ...PC_ANSWERS]) {
      expect(TOPICS.has(x.topic), `${x.id} topic ${x.topic}`).toBe(true)
      for (const s of x.seen ?? []) expect(LABELS.has(s), `${x.id} seen '${s}'`).toBe(true)
    }
  })
  it('lists have usable points', () => {
    for (const l of PC_LISTS) {
      expect(l.points.length, l.id).toBeGreaterThanOrEqual(2)
      for (const p of l.points) {
        expect(p.k.trim().length, `${l.id}: empty point`).toBeGreaterThan(0)
        expect(p.k.split(/\s+/).length, `${l.id}: '${p.k}' is too long for a keyword`).toBeLessThanOrEqual(9)
      }
    }
  })
  it('every answer contains its keys and uses real lists', () => {
    const lists = new Set(PC_LISTS.map((l) => l.id))
    const bad: string[] = []
    for (const a of PC_ANSWERS) {
      if (a.keys.length < 3) bad.push(`${a.id}: fewer than 3 keys`)
      const low = a.a.toLowerCase()
      for (const k of a.keys) if (!low.includes(k.toLowerCase())) bad.push(`${a.id}: key '${k}' not in the answer`)
      for (const l of a.lists ?? []) if (!lists.has(l)) bad.push(`${a.id}: unknown list ${l}`)
      if (a.a.includes('$')) bad.push(`${a.id}: '$' starts TeX`)
    }
    expect(bad).toEqual([])
  })
  it('paper maps point at real parts and answers', () => {
    const parts = new Set(PC_PARTS.map((p) => p.id))
    const answers = new Set(PC_ANSWERS.map((a) => a.id))
    const bad: string[] = []
    for (const [id, m] of Object.entries(PC_MAP)) {
      if (!parts.has(id)) bad.push(`unknown part ${id}`)
      if (!m.topics.length) bad.push(`${id}: no topics`)
      for (const t of m.topics) if (!TOPICS.has(t)) bad.push(`${id}: unknown topic ${t}`)
      for (const a of m.ans) if (!answers.has(a)) bad.push(`${id} → missing answer ${a}`)
      if (!(m.ans.length || m.extra || m.calc)) bad.push(`${id}: no answer`)
    }
    expect(bad).toEqual([])
  })
})

describe.skipIf(!process.env.PC_FULL)('CE 301 completeness (PC_FULL=1)', () => {
  it('every past-paper part is mapped', () => {
    const missing = PC_ALL.filter((q) => !PC_MAP[q.id]).map((q) => q.id)
    expect(missing).toEqual([])
  })
  it('every topic has lists, cards and answers', () => {
    const bad: string[] = []
    for (const t of PC_TOPICS)
      for (const [kind, arr] of [['lists', PC_LISTS], ['cards', PC_CARDS], ['answers', PC_ANSWERS]] as const)
        if (!arr.some((x) => x.topic === t.id)) bad.push(`${t.id}: no ${kind}`)
    expect(bad).toEqual([])
  })
})
