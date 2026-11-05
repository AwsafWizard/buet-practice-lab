// Theory drill: think of the answer, open the model answer, then say honestly whether you had it.

import { useState } from 'react'
import { Boundary } from '../../components/QuestionCard'
import { Md } from '../../components/ui'
import { useStore } from '../../store'
import { smTopicById } from '../registry'
import type { SmTheoryItem } from '../types'

const key = (it: SmTheoryItem) => `${it.topic}:th:${it.id}`

export function TheoryList({ items, showTopic = false }: { items: SmTheoryItem[]; showTopic?: boolean }) {
  const attempts = useStore((s) => s.attempts)
  const [filter, setFilter] = useState<'all' | 'new' | 'missed'>('all')
  const sorted = [...items].sort((a, b) => b.seen.length - a.seen.length)
  const list = sorted.filter((it) => {
    const a = attempts[key(it)]
    return filter === 'all' || (filter === 'new' ? !a : a && !a.correct)
  })
  const known = sorted.filter((it) => attempts[key(it)]?.correct).length
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">
          Most-asked first · <b className="num text-ink">{known}</b>/{items.length} remembered
        </span>
        {(['all', 'new', 'missed'] as const).map((f) => (
          <button key={f} className={'btn !py-0.5 !px-2.5 !text-xs ' + (filter === f ? '!border-accent text-accent' : '')} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${items.length})` : f === 'new' ? 'Not tried yet' : 'Missed last time'}
          </button>
        ))}
      </div>
      {list.map((it) => (
        <TheoryCard key={it.id} it={it} showTopic={showTopic} />
      ))}
      {!list.length && <div className="text-mute text-sm">Nothing here.</div>}
    </div>
  )
}

function TheoryCard({ it, showTopic }: { it: SmTheoryItem; showTopic: boolean }) {
  const record = useStore((s) => s.record)
  const a = useStore((s) => s.attempts[key(it)])
  const [open, setOpen] = useState(false)
  const t = smTopicById(it.topic)
  return (
    <article className="card p-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex-1 min-w-[14rem]">
          <div className="font-semibold leading-snug">
            <Md>{it.q}</Md>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {showTopic && t && (
              <span className="chip" style={{ color: t.color }}>
                {t.short}
              </span>
            )}
            <span className="chip" title={it.seen.join(', ')}>
              asked in {it.seen.length} paper{it.seen.length === 1 ? '' : 's'}
            </span>
            {it.seen.slice(0, 4).map((s) => (
              <span key={s} className="chip !text-[10px] text-faint">
                {s}
              </span>
            ))}
            {it.seen.length > 4 && <span className="chip !text-[10px] text-faint">+{it.seen.length - 4}</span>}
          </div>
        </div>
        {a && (
          <span className={'chip ' + (a.correct ? 'text-good' : 'text-bad')} style={{ borderColor: 'currentColor' }}>
            {a.correct ? '✓ remembered' : '✗ missed'}
          </span>
        )}
      </div>
      {!open ? (
        <button className="mt-3 btn !py-1 !px-3 !text-xs" onClick={() => setOpen(true)}>
          Think of your answer, then show the model answer
        </button>
      ) : (
        <div className="mt-3 border-t border-line/60 pt-3">
          <Md>{it.a}</Md>
          {it.Fig && (
            <Boundary label="sketch">
              <div className="mt-2 rounded-xl bg-bg/60 border border-line p-2">
                <it.Fig />
              </div>
            </Boundary>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-mute">Did you have it?</span>
            <button className="btn !py-0.5 !px-2 !text-xs text-good" onClick={() => record(key(it), true)}>
              ✓ Yes, the main points
            </button>
            <button className="btn !py-0.5 !px-2 !text-xs text-bad" onClick={() => record(key(it), false)}>
              ✗ Not really
            </button>
            <button className="ml-auto text-faint hover:text-ink" onClick={() => setOpen(false)}>
              hide
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
