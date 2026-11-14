// CE 301's "Extract as PDF" documents: a past-paper part, or a model answer from the bank.
// The machinery (off-screen render, page cutting, the ⋮ menu) is shared: src/components/ExportPdf.tsx.

import type { ReactNode } from 'react'
import { exportPdf as exportAny, KebabMenu, pdfName, PrintHead as Head, PrintLabel as Label, today } from '../../components/ExportPdf'
import { Md } from '../../components/ui'
import { answerById, listById } from '../content'
import { pcTopicById } from '../registry'
import { pcPaperById, pcPaperLabel, type PcAnswer, type PcQ } from '../types'
import { AnswerBody } from './Blurt'
import { PartAnswer, partKeys } from './PcQuestionCard'

export { KebabMenu, pdfName }

export const exportPdf = (doc: ReactNode, filename: string) => exportAny(doc, filename, 'CE 301 Practice Lab')

function Keys({ keys }: { keys: string[] }) {
  if (!keys.length) return null
  return (
    <>
      <Label>Examiner keywords</Label>
      <div className="pc-keep" style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {keys.map((k) => (
          <span key={k} className="chip" style={{ fontSize: 11 }}>
            {k}
          </span>
        ))}
      </div>
    </>
  )
}

function ListsUsed({ ids }: { ids: string[] }) {
  const lists = ids.map((id) => listById(id)).filter(Boolean)
  if (!lists.length) return null
  return (
    <>
      <Label>Lists to remember</Label>
      {lists.map((l) => (
        <div key={l!.id} className="pc-keep" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>
            {l!.title}
            {l!.ordered ? ' (in order)' : ''}
          </div>
          <ol style={{ margin: '4px 0 0 20px', listStyle: 'decimal' }}>
            {l!.points.map((p, i) => (
              <li key={i}>
                <b>{p.k}</b>
                {p.d ? ` — ${p.d}` : ''}
              </li>
            ))}
          </ol>
          {l!.hook && <div style={{ fontSize: 12, color: 'var(--c-accent2)', marginTop: 3 }}>Memory hook: {l!.hook.replace(/\*\*/g, '')}</div>}
        </div>
      ))}
    </>
  )
}

/** a past-paper part: question, keywords, model answer, where else it was asked */
export function QuestionDoc({ q }: { q: PcQ }) {
  const paper = pcPaperById(q.paper)
  const answers = q.ans.map((id) => answerById(id)).filter(Boolean) as PcAnswer[]
  const seen = [...new Set(answers.flatMap((a) => a.seen))]
  const lists = [...new Set(answers.flatMap((a) => a.lists ?? []))]
  return (
    <div style={{ padding: '8px 0 24px' }}>
      <Head
        kicker={`CE 301 · Professional Practice and Communication · ${paper?.label ?? q.paper} term final (${paper?.held ?? ''})`}
        title={`Section ${q.sec} · Q${q.no} · ${q.marks} marks`}
        chips={[...q.topics.map((t) => pcTopicById(t)?.title ?? t), q.flag ? `⚑ ${q.flag}` : '']}
      />
      <Label>Question</Label>
      <div style={{ fontSize: 15 }}>
        <Md>{q.text}</Md>
      </div>
      {seen.length > 1 && (
        <div style={{ fontSize: 12, color: 'var(--c-mute)', marginTop: 6 }}>Also asked in: {seen.filter((s) => s !== pcPaperLabel(q.paper)).join(', ')}</div>
      )}
      <Keys keys={partKeys(q)} />
      <Label>Model answer</Label>
      <PartAnswer q={q} />
      <ListsUsed ids={lists} />
      <div style={{ fontSize: 11, color: 'var(--c-faint)', marginTop: 20 }}>Exported {today()} from CE 301 Practice Lab. Answers follow the class material; check anything odd against your notes.</div>
    </div>
  )
}

/** a model answer from the bank */
export function AnswerDoc({ a }: { a: PcAnswer }) {
  return (
    <div style={{ padding: '8px 0 24px' }}>
      <Head kicker="CE 301 · Professional Practice and Communication · model answer" title={a.q} chips={[pcTopicById(a.topic)?.title ?? a.topic, a.seen.length ? `asked in ${a.seen.join(', ')}` : 'not asked yet']} />
      <Keys keys={a.keys} />
      <Label>Model answer</Label>
      <AnswerBody a={a} />
      <ListsUsed ids={a.lists ?? []} />
      <div style={{ fontSize: 11, color: 'var(--c-faint)', marginTop: 20 }}>Exported {today()} from CE 301 Practice Lab.</div>
    </div>
  )
}
