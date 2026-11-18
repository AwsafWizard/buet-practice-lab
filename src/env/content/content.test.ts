import { describe, expect, it } from 'vitest'
import { EV_ALL, EV_MAP } from '../pyq'
import { EV_PARTS } from '../pyq/parts'
import { EV_TOPICS } from '../registry'
import { EV_PAPERS } from '../types'
import { EV_ANSWERS, EV_CARDS, EV_LISTS } from './index'

const LABELS = new Set(EV_PAPERS.map((p) => p.label))
const TOPICS = new Set(EV_TOPICS.map((t) => t.id as string))

describe('CE 331 content', () => {
  it('ids are unique and well-prefixed', () => {
    const ids = [...EV_LISTS.map((x) => x.id), ...EV_CARDS.map((x) => x.id), ...EV_ANSWERS.map((x) => x.id)]
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i)
    expect(dup).toEqual([])
    for (const l of EV_LISTS) expect(l.id, l.id).toMatch(/^l-/)
    for (const c of EV_CARDS) expect(c.id, c.id).toMatch(/^c-/)
    for (const a of EV_ANSWERS) expect(a.id, a.id).toMatch(/^a-/)
  })
  it('topics and paper labels are real', () => {
    for (const x of [...EV_LISTS, ...EV_CARDS, ...EV_ANSWERS]) {
      expect(TOPICS.has(x.topic), `${x.id} topic ${x.topic}`).toBe(true)
      for (const s of x.seen ?? []) expect(LABELS.has(s), `${x.id} seen '${s}'`).toBe(true)
    }
  })
  it('lists have usable points', () => {
    for (const l of EV_LISTS) {
      expect(l.points.length, l.id).toBeGreaterThanOrEqual(2)
      for (const p of l.points) {
        expect(p.k.trim().length, `${l.id}: empty point`).toBeGreaterThan(0)
        expect(p.k.split(/\s+/).length, `${l.id}: '${p.k}' is too long for a keyword`).toBeLessThanOrEqual(9)
      }
    }
  })
  it('every answer contains its keys and uses real lists', () => {
    const lists = new Set(EV_LISTS.map((l) => l.id))
    const bad: string[] = []
    for (const a of EV_ANSWERS) {
      if (a.keys.length < 3) bad.push(`${a.id}: fewer than 3 keys`)
      const low = a.a.toLowerCase()
      for (const k of a.keys) if (!low.includes(k.toLowerCase())) bad.push(`${a.id}: key '${k}' not in the answer`)
      for (const l of a.lists ?? []) if (!lists.has(l)) bad.push(`${a.id}: unknown list ${l}`)
      if ((a.a.match(/\$/g) ?? []).length % 2) bad.push(`${a.id}: odd number of '$' (TeX)`)
    }
    expect(bad).toEqual([])
  })
  it('paper maps point at real parts and answers', () => {
    const parts = new Set(EV_PARTS.map((p) => p.id))
    const answers = new Set(EV_ANSWERS.map((a) => a.id))
    const bad: string[] = []
    for (const [id, m] of Object.entries(EV_MAP)) {
      if (!parts.has(id)) bad.push(`unknown part ${id}`)
      if (!m.topics.length) bad.push(`${id}: no topics`)
      for (const t of m.topics) if (!TOPICS.has(t)) bad.push(`${id}: unknown topic ${t}`)
      for (const a of m.ans) if (!answers.has(a)) bad.push(`${id} → missing answer ${a}`)
      const none = m.from?.[0] === 'none'
      if (!(m.ans.length || m.extra || m.Sol || none)) bad.push(`${id}: no answer (mark it from: ['none'] with a flag if no source solves it)`)
      if (none && !m.flag) bad.push(`${id}: from 'none' needs a flag saying why`)
      if (m.extra?.includes('$') && !/\$[^$]+\$/.test(m.extra)) bad.push(`${id}: stray '$' in extra`)
    }
    expect(bad).toEqual([])
  })
})

describe.skipIf(!process.env.EV_FULL)('CE 331 completeness (EV_FULL=1)', () => {
  it('every part with a number task has a worked solution or is marked unsolved', () => {
    const bad = EV_ALL.filter((q) => /math|design/.test(q.kind ?? '') && !q.Sol && q.from?.[0] !== 'none' && !q.extra).map((q) => q.id)
    expect(bad).toEqual([])
  })
  it('every past-paper part is mapped', () => {
    const missing = EV_ALL.filter((q) => !EV_MAP[q.id]).map((q) => q.id)
    expect(missing).toEqual([])
  })
  it('every topic has lists, cards and answers', () => {
    const bad: string[] = []
    for (const t of EV_TOPICS)
      for (const [kind, arr] of [['lists', EV_LISTS], ['cards', EV_CARDS], ['answers', EV_ANSWERS]] as const)
        if (!arr.some((x) => x.topic === t.id)) bad.push(`${t.id}: no ${kind}`)
    expect(bad).toEqual([])
  })
})
