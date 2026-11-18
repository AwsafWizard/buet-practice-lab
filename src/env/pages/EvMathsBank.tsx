// Maths bank: every numerical, design and derivation part of the 14 papers in one place, grouped by topic, with
// the worked solutions the engines compute. Solve on paper, check the final answer, then open the working.

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { TopicIcon } from '../../topics/icons'
import { EvQuestionCard } from '../components/EvQuestionCard'
import { EV_LAB_TITLE, EV_LABS } from '../labs'
import { EV_ALL } from '../pyq'
import { EV_BLOCK_LABEL, EV_BLOCKS, EV_TOPICS, type EvBlock } from '../registry'
import type { EvQ } from '../types'

/** a part with numbers to work out: it has a worked solution, or the paper marks it as a calculation or design */
const isNumbers = (q: EvQ) => !!q.Sol || /math|design/.test(q.kind ?? '')
const isDerivation = (q: EvQ) => /derivation/.test(q.kind ?? '')

export const EV_MATHS: EvQ[] = EV_ALL.filter((q) => isNumbers(q) || isDerivation(q))

type Kind = 'all' | 'num' | 'deriv'
type Status = 'all' | 'open' | 'review' | 'solved'
const STATUS_LABEL: Record<Status, string> = { all: 'Any status', open: 'Not solved yet', review: 'Marked review', solved: 'Know it' }

export default function EvMathsBank() {
  const qStatus = useStore((s) => s.qStatus)
  const [block, setBlock] = useState<EvBlock | 'all'>('all')
  const [kind, setKind] = useState<Kind>('all')
  const [status, setStatus] = useState<Status>('all')
  const [focus, setFocus] = useState<string | null>(null)
  const { hash } = useLocation()

  const st = (q: EvQ) => qStatus[q.id] ?? 'todo'
  const list = EV_MATHS.filter((q) => {
    const t = EV_TOPICS.find((x) => x.id === q.topics[0])
    if (block !== 'all' && t?.block !== block) return false
    if (kind === 'num' && !isNumbers(q)) return false
    if (kind === 'deriv' && isNumbers(q)) return false
    const s = st(q)
    if (status === 'open') return s === 'todo' || s === 'tried'
    if (status === 'review') return s === 'review'
    if (status === 'solved') return s === 'solved'
    return true
  })
  const groups = EV_TOPICS.map((t) => ({ t, qs: list.filter((q) => q.topics[0] === t.id) })).filter((g) => g.qs.length)

  const solved = EV_MATHS.filter((q) => st(q) === 'solved').length
  const numbers = EV_MATHS.filter(isNumbers).length
  const worked = EV_MATHS.filter((q) => q.Sol).length

  const jump = (id: string) => {
    setFocus(id)
    setTimeout(() => document.getElementById('m-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  useEffect(() => {
    if (hash) jump(decodeURIComponent(hash.slice(1)))
  }, [hash])

  const random = () => {
    const pool = list.filter((q) => st(q) !== 'solved')
    const pick = (pool.length ? pool : list)[Math.floor(Math.random() * (pool.length || list.length))]
    if (pick) jump(pick.id)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Maths bank</h1>
      <p className="text-sm text-mute mb-4">
        Every calculation, design and derivation from the {new Set(EV_MATHS.map((q) => q.paper)).size} papers, grouped by topic, newest paper first. Work it on paper, check the final answer, and only then open the worked solution. If a type keeps beating you, go back to its Lab.
      </p>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <div className="text-xs text-mute">Solved</div>
          <div className="text-xl font-extrabold num">
            {solved}
            <span className="text-mute text-sm font-semibold">/{EV_MATHS.length}</span>
          </div>
        </div>
        <div className="flex-1 min-w-[10rem]">
          <div className="h-2 rounded-full bg-panel2 overflow-hidden">
            <div className="h-full bg-good transition-all" style={{ width: `${(solved / (EV_MATHS.length || 1)) * 100}%` }} />
          </div>
          <div className="text-xs text-faint mt-1.5">
            {numbers} with numbers ({worked} worked out step by step), {EV_MATHS.length - numbers} derivations. Mark one “Know it” when you can do it cold.
          </div>
        </div>
        <button className="btn !text-sm" onClick={random} disabled={!list.length} title="Jump to a random problem you haven't marked “Know it”">
          🎲 Random problem
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {(['all', ...EV_BLOCKS] as const).map((b) => (
          <button key={b} className={'btn !py-0.5 !px-2.5 !text-xs ' + (block === b ? '!border-accent text-accent' : '')} onClick={() => setBlock(b)}>
            {b === 'all' ? 'Everything' : EV_BLOCK_LABEL[b]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {(['all', 'num', 'deriv'] as const).map((k) => (
          <button key={k} className={'btn !py-0.5 !px-2.5 !text-xs ' + (kind === k ? '!border-accent text-accent' : '')} onClick={() => setKind(k)}>
            {k === 'all' ? 'Numbers + derivations' : k === 'num' ? 'Numbers only' : 'Derivations only'}
          </button>
        ))}
        <span className="w-px bg-line mx-1" aria-hidden />
        {(['all', 'open', 'review', 'solved'] as const).map((s) => (
          <button key={s} className={'btn !py-0.5 !px-2.5 !text-xs ' + (status === s ? '!border-accent text-accent' : '')} onClick={() => setStatus(s)}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {groups.length > 1 && (
        <nav className="flex flex-wrap gap-1.5 mb-5 text-xs" aria-label="Jump to a topic">
          {groups.map(({ t, qs }) => (
            <button key={t.id} onClick={() => document.getElementById('g-' + t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="chip hover:underline" style={{ color: t.color }}>
              {t.short} <span className="num text-faint">{qs.length}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="space-y-8">
        {groups.map(({ t, qs }) => {
          const Lab = EV_LABS[t.id]
          const papers = new Set(qs.map((q) => q.paper)).size
          const marks = qs.reduce((s, q) => s + q.marks, 0)
          const done = qs.filter((q) => st(q) === 'solved').length
          return (
            <section key={t.id} id={'g-' + t.id} className="scroll-mt-20">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <TopicIcon id={t.id} color={t.color} size={22} />
                <h2 className="text-lg font-bold" style={{ color: t.color }}>
                  <Link to={`/ce331/topic/${t.id}`} className="hover:underline">
                    {t.title}
                  </Link>
                </h2>
                <span className="text-xs text-mute">
                  {qs.length} problem{qs.length === 1 ? '' : 's'} · {papers} paper{papers === 1 ? '' : 's'} · <span className="num">{marks}</span> marks · <span className="num">{done}</span> solved
                </span>
                {Lab && (
                  <Link to={`/ce331/topic/${t.id}/lab`} className="btn !py-0.5 !px-2.5 !text-xs ml-auto">
                    🧪 {EV_LAB_TITLE[t.id] ?? 'Lab'}
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                {qs.map((q) => (
                  <div key={q.id} id={'m-' + q.id} className={'scroll-mt-20 rounded-2xl ' + (focus === q.id ? 'ring-2 ring-accent' : '')}>
                    <EvQuestionCard q={q} />
                  </div>
                ))}
              </div>
            </section>
          )
        })}
        {!groups.length && <div className="text-mute text-sm">Nothing matches these filters.</div>}
      </div>
    </div>
  )
}
