// One past-paper part: the question as printed, where its answer comes from, a blurt box with its examiner
// keywords, and the model answer or the worked solution (numbers from the engines).

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Answer, Md } from '../../components/ui'
import { useStore } from '../../store'
import { answerById } from '../content'
import { evTopicById } from '../registry'
import { EV_SOURCE_LABEL, evPaperLabel, type EvQ, type EvSource } from '../types'
import { AnswersById, Blurt } from './Blurt'
import { exportPdf, KebabMenu, pdfName, QuestionDoc } from './ExportPdf'

export const scan331 = (pg: number) => `scans331/p-${String(pg).padStart(3, '0')}.jpg`

type St = 'todo' | 'tried' | 'solved' | 'review'
const ST: { v: St; label: string; cls: string }[] = [
  { v: 'todo', label: 'To do', cls: '' },
  { v: 'tried', label: 'Tried', cls: 'text-load' },
  { v: 'solved', label: 'Know it', cls: 'text-good' },
  { v: 'review', label: 'Review', cls: 'text-bad' },
]

/** keywords for a part: its answers' keys, de-duplicated */
export function partKeys(q: EvQ): string[] {
  const out: string[] = []
  for (const id of q.ans) for (const k of answerById(id)?.keys ?? []) if (!out.some((x) => x.toLowerCase() === k.toLowerCase())) out.push(k)
  return out
}

export function EvQuestionCard({ q, showPaper = true, open: open0 = false }: { q: EvQ; showPaper?: boolean; open?: boolean }) {
  const status = useStore((s) => s.qStatus[q.id] ?? 'todo') as St
  const setStatus = useStore((s) => s.setQStatus)
  const [mode, setMode] = useState<'none' | 'blurt' | 'answer'>(open0 ? 'answer' : 'none')
  const keys = useMemo(() => partKeys(q), [q])
  const checks = useMemo(() => {
    try {
      return q.checks?.() ?? []
    } catch (e) {
      console.error(q.id, e)
      return []
    }
  }, [q])
  const model = <PartAnswer q={q} />
  return (
    <article className="card p-4">
      <div className="flex flex-wrap items-center gap-1.5 text-xs mb-2">
        {showPaper && (
          <Link to={`/ce331/papers/${q.paper}`} className="chip hover:text-accent">
            {evPaperLabel(q.paper)}
          </Link>
        )}
        <Link to={`/ce331/q/${encodeURIComponent(q.id)}`} className="font-bold hover:text-accent">
          Q{q.no}
        </Link>
        <span className="chip num">{q.marks} marks</span>
        {q.topics.map((t) => {
          const m = evTopicById(t)
          return m ? (
            <Link key={t} to={`/ce331/topic/${t}`} className="chip hover:underline" style={{ color: m.color }}>
              {m.short}
            </Link>
          ) : null
        })}
        <SourceChips q={q} />
        {q.flag && (
          <span className="chip text-load !whitespace-normal !rounded-lg max-w-full" title={q.flag}>
            ⚑ {q.flag}
          </span>
        )}
        <div className="ml-auto flex gap-0.5" role="group" aria-label="status">
          {ST.map((s) => (
            <button key={s.v} className={'btn !py-0 !px-2 !text-[11px] ' + (status === s.v ? '!border-accent ' + (s.cls || 'text-accent') : 'text-faint')} onClick={() => setStatus(q.id, s.v)}>
              {s.label}
            </button>
          ))}
        </div>
        <QuestionMenu q={q} />
      </div>
      <div className="text-[15px]">
        <Md>{q.text}</Md>
      </div>
      {checks.length > 0 && (
        <div className="rounded-xl border border-line p-3 mt-3">
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Try it first — enter your key answers</div>
          {checks.map((c) => (
            <Answer key={c.key} id={`${q.topics[0] ?? 'ev'}:${q.id}:${c.key}`} label={<Md>{c.label}</Md>} value={c.value} unit={c.unit} tol={c.tol} abs={c.abs} magnitude={c.magnitude} hint={c.hint} />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        <button className={'btn !text-sm ' + (mode === 'blurt' ? '!border-accent text-accent' : '')} onClick={() => setMode(mode === 'blurt' ? 'none' : 'blurt')} disabled={!keys.length}>
          ✍ Blurt it first
        </button>
        {q.final && (
          <details className="text-sm self-center">
            <summary className="cursor-pointer text-mute hover:text-accent">Final answer only</summary>
            <span className="num">{q.final}</span>
          </details>
        )}
        <button className={'btn !text-sm ' + (mode === 'answer' ? '!border-accent text-accent' : '')} onClick={() => setMode(mode === 'answer' ? 'none' : 'answer')}>
          {mode === 'answer' ? 'Hide' : 'Show'} {q.Sol ? 'worked solution' : 'model answer'}
        </button>
        {keys.length > 0 && mode === 'none' && <span className="text-xs text-faint self-center">{keys.length} examiner keywords</span>}
      </div>
      {mode === 'blurt' && (
        <div className="mt-3 rounded-xl border border-line p-3 bg-bg/40">
          <Blurt id={q.id} topic={q.topics[0] ?? 'pc'} q={<span className="text-sm text-mute">Write your answer for Q{q.no} below.</span>} marks={q.marks} keys={keys} model={model} />
        </div>
      )}
      {mode === 'answer' && <div className="mt-3 rounded-xl border border-accent/40 p-4">{model}</div>}
    </article>
  )
}

function QuestionMenu({ q }: { q: EvQ }) {
  const nav = useNavigate()
  return (
    <KebabMenu
      label={`More for Q${q.no}`}
      items={[
        { icon: '⤓', label: 'Extract as PDF', onClick: () => exportPdf(<QuestionDoc q={q} />, pdfName('CE331', evPaperLabel(q.paper), 'Q' + q.no)) },
        { icon: '↗', label: 'Open on its own page', onClick: () => nav(`/ce331/q/${encodeURIComponent(q.id)}`) },
        { icon: '⧉', label: 'Copy the question text', onClick: () => navigator.clipboard?.writeText(`CE 331 ${evPaperLabel(q.paper)} Q${q.no} (${q.marks} marks)\n${q.text}`) },
      ]}
    />
  )
}

export function PartAnswer({ q }: { q: EvQ }) {
  return (
    <div className="space-y-4">
      {q.extra && (
        <div>
          <Md>{q.extra}</Md>
        </div>
      )}
      {q.Sol && <q.Sol />}
      {q.ans.length > 0 && <AnswersById ids={q.ans} />}
      {sourcesOf(q)[0] === 'none' && !q.ans.length && !q.Sol && (
        <div className="text-sm text-bad">⚠ No solution could be built from the course material for this part{q.flag ? `: ${q.flag}` : '.'}</div>
      )}
      {!q.ans.length && !q.extra && !q.Sol && sourcesOf(q)[0] !== 'none' && <div className="text-sm text-mute">The answer for this part is still being written.</div>}
      {q.notes?.map((n, i) => (
        <div key={i} className="text-xs text-mute">
          ⓘ {n}
        </div>
      ))}
    </div>
  )
}

/** where a part's answer comes from; [] = not mapped yet (pending), which is not the same as 'none' (checked: no source solves it) */
export function sourcesOf(q: EvQ): EvSource[] {
  if (q.from?.length) return q.from
  return q.ans.length || q.Sol || q.extra ? ['ce22'] : []
}

const SRC_CLS: Record<EvSource, string> = {
  ce22: 'text-good',
  notes: 'text-accent',
  'old-slides': 'text-load',
  seniors: 'text-load',
  textbook: 'text-mute',
  none: 'text-bad !border-bad/60',
}

export function SourceChips({ q }: { q: EvQ }) {
  const src = sourcesOf(q)
  if (!src.length) return <span className="chip text-faint" title="This part has not been mapped to an answer yet">answer pending</span>
  return (
    <>
      {src.map((s) => (
        <span key={s} className={'chip ' + SRC_CLS[s]} title={'Where this answer comes from: ' + EV_SOURCE_LABEL[s]}>
          {s === 'none' ? EV_SOURCE_LABEL[s] : '◆ ' + EV_SOURCE_LABEL[s]}
        </span>
      ))}
    </>
  )
}
