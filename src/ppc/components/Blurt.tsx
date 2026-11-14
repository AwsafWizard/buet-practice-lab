// Blurt: write the whole answer from memory against the exam clock, then see which examiner keywords you hit.

import { useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { inline, Md, PrintMode } from '../../components/ui'
import { useStore } from '../../store'
import { keysFound } from '../engine/match'
import { answerById, listById } from '../content'
import { pcTopicById } from '../registry'
import type { PcAnswer, PcList } from '../types'

/** 210 marks in 180 minutes */
export const MIN_PER_MARK = 180 / 210

const draftKey = (id: string) => 'ce301:blurt:' + id
const loadDraft = (id: string) => {
  try {
    return localStorage.getItem(draftKey(id)) ?? ''
  } catch {
    return ''
  }
}
const saveDraft = (id: string, v: string) => {
  try {
    if (v) localStorage.setItem(draftKey(id), v)
    else localStorage.removeItem(draftKey(id))
  } catch {
    /* storage blocked */
  }
}

export interface BlurtProps {
  /** check id (topic-prefixed) */
  id: string
  topic: string
  q: ReactNode
  marks: number
  keys: string[]
  model: ReactNode
  /** allow choosing the marks (answers from the bank have no fixed marks) */
  pickMarks?: boolean
}

export function Blurt({ id, topic, q, marks: m0, keys, model, pickMarks }: BlurtProps) {
  const record = useStore((s) => s.record)
  const [text, setText] = useState(() => loadDraft(id))
  const [marks, setMarks] = useState(m0)
  const [start, setStart] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [checked, setChecked] = useState<boolean[] | null>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (start === null || checked) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [start, checked])
  useEffect(() => saveDraft(id, text), [id, text])

  const target = Math.round(marks * MIN_PER_MARK * 60)
  const used = start === null ? 0 : Math.floor(((checked ? now : Date.now()) - start) / 1000)
  const over = used > target
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const hits = checked?.filter(Boolean).length ?? 0
  const est = checked ? Math.round((marks * hits) / Math.max(1, keys.length) * 2) / 2 : 0

  const check = () => {
    const f = keysFound(text, keys)
    setChecked(f)
    setNow(Date.now())
    record(`${topic}:bl:${id}`, f.filter(Boolean).length >= Math.ceil(keys.length * 0.7))
  }

  return (
    <div className="space-y-3">
      <div className="font-semibold leading-snug">{q}</div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {pickMarks ? (
          <label className="flex items-center gap-1 text-mute">
            for
            <select className="field !py-0.5 !text-sm" value={marks} onChange={(e) => setMarks(+e.target.value)}>
              {[5, 7, 10, 12, 15, 18, 20, 25, 35].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            marks
          </label>
        ) : (
          <span className="chip num">{marks} marks</span>
        )}
        <span className="text-mute">
          exam pace ≈ <b className="text-ink num">{fmt(target)}</b>
        </span>
        <span className={'num font-bold ' + (over ? 'text-bad' : 'text-accent')}>{start === null ? '0:00' : fmt(used)}</span>
        <span className="text-faint text-xs">~1 point per 2–3 marks: aim for about {Math.max(3, Math.round(marks / 2.5))} points</span>
      </div>
      <textarea
        className="field w-full min-h-[11rem] font-[inherit] leading-relaxed"
        placeholder="Write it as you would in the script: headings, numbered points, the keyword first…"
        value={text}
        onChange={(e) => {
          if (start === null) setStart(Date.now())
          setText(e.target.value)
          if (checked) setChecked(null)
        }}
        aria-label="Your answer"
      />
      <div className="flex flex-wrap gap-2 items-center">
        <button className="btn btn-primary" onClick={check} disabled={!text.trim()}>
          Check my keywords
        </button>
        <button className="btn" onClick={() => setShow(!show)}>
          {show ? 'Hide' : 'Show'} model answer
        </button>
        {text && (
          <button
            className="btn btn-ghost !text-xs ml-auto"
            onClick={() => {
              setText('')
              setChecked(null)
              setStart(null)
            }}
          >
            clear
          </button>
        )}
      </div>
      {checked && (
        <div className="rounded-xl border border-line bg-panel2 p-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-bold">
              {hits}/{keys.length} keywords
            </span>
            <span className="text-sm text-mute">
              rough mark ≈ <b className="num text-ink">{est}</b>/{marks}
            </span>
            {start !== null && <span className={'text-xs ' + (over ? 'text-bad' : 'text-good')}>{over ? `${fmt(used - target)} over exam pace` : 'within exam pace'}</span>}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {keys.map((k, i) => (
              <span key={k} className={'chip !text-xs ' + (checked[i] ? '!border-good/60 text-good' : '!border-bad/50 text-bad')}>
                {checked[i] ? '✓' : '✗'} {k}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-faint mt-2">The check looks for the keywords (forgiving spelling), not for sense. An examiner also wants each point explained in a line.</div>
        </div>
      )}
      {show && <div className="rounded-xl border border-accent/40 p-4">{model}</div>}
    </div>
  )
}

/** blurt over the model-answer bank of a topic (or the whole course) */
export function BlurtBank({ answers, showTopic = false }: { answers: PcAnswer[]; showTopic?: boolean }) {
  const sorted = useMemo(() => [...answers].sort((a, b) => b.seen.length - a.seen.length), [answers])
  const attempts = useStore((s) => s.attempts)
  const [id, setId] = useState(sorted[0]?.id ?? '')
  useEffect(() => setId(sorted[0]?.id ?? ''), [sorted])
  const a = sorted.find((x) => x.id === id)
  if (!a) return <div className="text-mute text-sm">No model answers here yet.</div>
  const t = pcTopicById(a.topic)
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select className="field !py-1 text-sm max-w-full" value={id} onChange={(e) => setId(e.target.value)}>
          {sorted.map((x) => {
            const at = attempts[`${x.topic}:bl:${x.id}`]
            return (
              <option key={x.id} value={x.id}>
                {!at ? '○' : at.correct ? '●' : '◐'} {x.q.slice(0, 90)}
                {x.seen.length ? ` · asked ${x.seen.length}×` : ''}
              </option>
            )
          })}
        </select>
        <button className="btn !py-1 !text-xs" onClick={() => setId(sorted[(sorted.findIndex((x) => x.id === id) + 1) % sorted.length].id)}>
          Next →
        </button>
      </div>
      <div className="card p-5">
        {showTopic && t && (
          <div className="text-xs mb-1" style={{ color: t.color }}>
            {t.short}
          </div>
        )}
        <Blurt key={a.id} id={a.id} topic={a.topic} q={<Md>{a.q}</Md>} marks={10} pickMarks keys={a.keys} model={<AnswerBody a={a} />} />
      </div>
    </div>
  )
}

export function AnswerBody({ a }: { a: PcAnswer }) {
  return (
    <div>
      <Md>{a.a}</Md>
      {a.Fig && (
        <div className="rounded-xl bg-panel2 border border-line p-2 mt-2">
          <a.Fig />
        </div>
      )}
      <AnswerHooks a={a} />
      <div className="text-[11px] text-faint mt-2">Source: {a.src}</div>
    </div>
  )
}

/** the memory hooks of the lists an answer is built on (the PDF prints them with the lists instead) */
function AnswerHooks({ a }: { a: PcAnswer }) {
  const print = useContext(PrintMode)
  const lists = (a.lists ?? []).map(listById).filter((l): l is PcList => !!l?.hook)
  if (print || !lists.length) return null
  return (
    <div className="mt-3 rounded-xl border border-accent2/40 bg-accent2/5 px-3 py-2 text-sm space-y-1">
      <div className="text-[11px] font-bold uppercase tracking-wider text-accent2">💡 Memory hook{lists.length > 1 ? 's' : ''}</div>
      {lists.map((l) => (
        <div key={l.id}>
          <span className="text-mute">
            {l.title}
            {l.ordered ? ' (in order)' : ''}:
          </span>{' '}
          <span className="text-accent2">{inline(l.hook!)}</span>
        </div>
      ))}
    </div>
  )
}

/** model answers for a list of answer ids (past-paper parts) */
export function AnswersById({ ids }: { ids: string[] }) {
  return (
    <div className="space-y-4">
      {ids.map((id) => {
        const a = answerById(id)
        if (!a) return null
        return (
          <div key={id}>
            {ids.length > 1 && <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">{a.q}</div>}
            <AnswerBody a={a} />
          </div>
        )
      })}
    </div>
  )
}
