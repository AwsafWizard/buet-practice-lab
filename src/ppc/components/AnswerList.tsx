// Model answers, most-asked first: think of it, open it, say honestly whether you had it.

import { useState } from 'react'
import { Md } from '../../components/ui'
import { useStore } from '../../store'
import { pcTopicById } from '../registry'
import type { PcAnswer } from '../types'
import { AnswerBody } from './Blurt'

const key = (a: PcAnswer) => `${a.topic}:th:${a.id}`

export function AnswerList({ answers, showTopic = false }: { answers: PcAnswer[]; showTopic?: boolean }) {
  const attempts = useStore((s) => s.attempts)
  const [filter, setFilter] = useState<'all' | 'new' | 'missed'>('all')
  const sorted = [...answers].sort((a, b) => b.seen.length - a.seen.length)
  const list = sorted.filter((a) => {
    const at = attempts[key(a)]
    return filter === 'all' || (filter === 'new' ? !at : at && !at.correct)
  })
  const known = sorted.filter((a) => attempts[key(a)]?.correct).length
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">
          Most-asked first · <b className="num text-ink">{known}</b>/{answers.length} remembered
        </span>
        {(['all', 'new', 'missed'] as const).map((f) => (
          <button key={f} className={'btn !py-0.5 !px-2.5 !text-xs ' + (filter === f ? '!border-accent text-accent' : '')} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${answers.length})` : f === 'new' ? 'Not tried yet' : 'Missed last time'}
          </button>
        ))}
      </div>
      {list.map((a) => (
        <AnswerCard key={a.id} a={a} showTopic={showTopic} />
      ))}
      {!list.length && <div className="text-mute text-sm">Nothing here.</div>}
    </div>
  )
}

function AnswerCard({ a, showTopic }: { a: PcAnswer; showTopic: boolean }) {
  const record = useStore((s) => s.record)
  const at = useStore((s) => s.attempts[key(a)])
  const [open, setOpen] = useState(false)
  const t = pcTopicById(a.topic)
  return (
    <article className="card p-4" id={a.id}>
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex-1 min-w-[14rem]">
          <div className="font-semibold leading-snug">
            <Md>{a.q}</Md>
          </div>
          <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
            {showTopic && t && (
              <span className="chip" style={{ color: t.color }}>
                {t.short}
              </span>
            )}
            <span className="chip" title={a.seen.join(', ')}>
              {a.seen.length ? `asked in ${a.seen.length} paper${a.seen.length === 1 ? '' : 's'}` : 'not asked yet'}
            </span>
            {at && <span className={'chip ' + (at.correct ? 'text-good' : 'text-bad')}>{at.correct ? '✓ remembered' : '✗ missed'}</span>}
          </div>
        </div>
        <button className="btn !text-sm" onClick={() => setOpen(!open)}>
          {open ? 'Hide' : 'Show answer'}
        </button>
      </div>
      {open && (
        <div className="mt-3 border-t border-line pt-3">
          <div className="flex flex-wrap gap-1 mb-3">
            {a.keys.map((k) => (
              <span key={k} className="chip !text-[11px] text-accent">
                {k}
              </span>
            ))}
          </div>
          <AnswerBody a={a} />
          <div className="flex gap-2 mt-3">
            <span className="text-sm text-mute self-center">Did you have it?</span>
            <button className="btn !text-sm !border-good/50 text-good" onClick={() => record(key(a), true)}>
              Yes
            </button>
            <button className="btn !text-sm !border-bad/50 text-bad" onClick={() => record(key(a), false)}>
              Not really
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
