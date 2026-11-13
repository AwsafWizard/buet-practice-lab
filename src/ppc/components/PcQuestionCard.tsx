// One past-paper part: the question as printed, a blurt box with its examiner keywords, the model answer.

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Md } from '../../components/ui'
import { useStore } from '../../store'
import { answerById } from '../content'
import { pcTopicById } from '../registry'
import { pcPaperLabel, type PcQ } from '../types'
import { AnswersById, Blurt } from './Blurt'
import { CalcSolution } from './Calc'
import { exportPdf, KebabMenu, pdfName, QuestionDoc } from './ExportPdf'

export const scan301 = (pg: number) => `scans301/p-${String(pg).padStart(3, '0')}.jpg`

type St = 'todo' | 'tried' | 'solved' | 'review'
const ST: { v: St; label: string; cls: string }[] = [
  { v: 'todo', label: 'To do', cls: '' },
  { v: 'tried', label: 'Tried', cls: 'text-load' },
  { v: 'solved', label: 'Know it', cls: 'text-good' },
  { v: 'review', label: 'Review', cls: 'text-bad' },
]

/** keywords for a part: its answers' keys, de-duplicated */
export function partKeys(q: PcQ): string[] {
  const out: string[] = []
  for (const id of q.ans) for (const k of answerById(id)?.keys ?? []) if (!out.some((x) => x.toLowerCase() === k.toLowerCase())) out.push(k)
  return out
}

export function PcQuestionCard({ q, showPaper = true, open: open0 = false }: { q: PcQ; showPaper?: boolean; open?: boolean }) {
  const status = useStore((s) => s.qStatus[q.id] ?? 'todo') as St
  const setStatus = useStore((s) => s.setQStatus)
  const [mode, setMode] = useState<'none' | 'blurt' | 'answer'>(open0 ? 'answer' : 'none')
  const keys = useMemo(() => partKeys(q), [q])
  const model = <PartAnswer q={q} />
  return (
    <article className="card p-4">
      <div className="flex flex-wrap items-center gap-1.5 text-xs mb-2">
        {showPaper && (
          <Link to={`/ce301/papers/${q.paper}`} className="chip hover:text-accent">
            {pcPaperLabel(q.paper)}
          </Link>
        )}
        <Link to={`/ce301/q/${encodeURIComponent(q.id)}`} className="font-bold hover:text-accent">
          Q{q.no}
        </Link>
        <span className="chip num">{q.marks} marks</span>
        {q.topics.map((t) => {
          const m = pcTopicById(t)
          return m ? (
            <Link key={t} to={`/ce301/topic/${t}`} className="chip hover:underline" style={{ color: m.color }}>
              {m.short}
            </Link>
          ) : null
        })}
        {q.flag && <span className="chip text-load" title={q.flag}>⚑ {q.flag}</span>}
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
      <div className="flex flex-wrap gap-2 mt-3">
        <button className={'btn !text-sm ' + (mode === 'blurt' ? '!border-accent text-accent' : '')} onClick={() => setMode(mode === 'blurt' ? 'none' : 'blurt')} disabled={!keys.length}>
          ✍ Blurt it first
        </button>
        <button className={'btn !text-sm ' + (mode === 'answer' ? '!border-accent text-accent' : '')} onClick={() => setMode(mode === 'answer' ? 'none' : 'answer')}>
          {mode === 'answer' ? 'Hide' : 'Show'} model answer
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

function QuestionMenu({ q }: { q: PcQ }) {
  const nav = useNavigate()
  return (
    <KebabMenu
      label={`More for Q${q.no}`}
      items={[
        { icon: '⤓', label: 'Extract as PDF', onClick: () => exportPdf(<QuestionDoc q={q} />, pdfName('CE301', pcPaperLabel(q.paper), 'Q' + q.no)) },
        { icon: '↗', label: 'Open on its own page', onClick: () => nav(`/ce301/q/${encodeURIComponent(q.id)}`) },
        { icon: '⧉', label: 'Copy the question text', onClick: () => navigator.clipboard?.writeText(`CE 301 ${pcPaperLabel(q.paper)} Q${q.no} (${q.marks} marks)\n${q.text}`) },
      ]}
    />
  )
}

export function PartAnswer({ q }: { q: PcQ }) {
  return (
    <div className="space-y-4">
      {q.extra && (
        <div>
          <Md>{q.extra}</Md>
        </div>
      )}
      {q.calc && <CalcSolution calc={q.calc} />}
      {q.ans.length > 0 && <AnswersById ids={q.ans} />}
      {!q.ans.length && !q.extra && !q.calc && <div className="text-sm text-mute">The model answer for this part is still being written.</div>}
      {q.notes?.map((n, i) => (
        <div key={i} className="text-xs text-mute">
          ⓘ {n}
        </div>
      ))}
    </div>
  )
}
