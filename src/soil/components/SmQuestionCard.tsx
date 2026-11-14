import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boundary, SHOW_SCANS } from '../../components/QuestionCard'
import { Answer, Md, Reveal } from '../../components/ui'
import { useStore } from '../../store'
import { smTopicById } from '../registry'
import { focusSmQuestion } from '../reference/pane'
import { smPaperById, smPaperLabel, type SmQ } from '../types'
import { pdfName, ProblemDoc, ProblemMenu } from '../../components/ExportPdf'

const STATUS: { v: 'todo' | 'tried' | 'solved' | 'review'; label: string; c: string }[] = [
  { v: 'todo', label: 'To do', c: 'var(--c-faint)' },
  { v: 'tried', label: 'Tried', c: 'var(--c-load)' },
  { v: 'solved', label: 'Solved', c: 'var(--c-good)' },
  { v: 'review', label: 'Review again', c: 'var(--c-bad)' },
]

export const scan341 = (pg: number) => `scans341/p-${String(pg).padStart(3, '0')}.jpg`

export function SmQuestionCard({ q, topic, showPaper = true, defaultOpen = false, solutionOpen = false }: { q: SmQ; topic?: string; showPaper?: boolean; defaultOpen?: boolean; solutionOpen?: boolean }) {
  const status = useStore((s) => s.qStatus[q.id] ?? 'todo')
  const setStatus = useStore((s) => s.setQStatus)
  const [scan, setScan] = useState(false)
  const [open, setOpen] = useState(defaultOpen)
  const tp = topic ?? q.topics[0]
  // opening a card puts its attached charts at the top of the chart pane
  useEffect(() => {
    if (open && q.given) focusSmQuestion(q.id, q.given)
  }, [open, q])
  const checks = useMemo(() => {
    if (!open || !q.checks) return []
    try {
      return q.checks()
    } catch (e) {
      console.error(q.id, e)
      return []
    }
  }, [q, open])
  const st = STATUS.find((s) => s.v === status)!
  return (
    <article className="card overflow-hidden">
      <div className="flex items-start">
      <button className="flex-1 min-w-0 text-left pl-5 pr-2 py-4 flex flex-wrap items-center gap-2 hover:bg-panel2/40" onClick={() => setOpen(!open)}>
        <span className={'inline-block transition-transform text-mute ' + (open ? 'rotate-90' : '')}>▸</span>
        {q.paper === 'own' ? (
          <span className="chip" style={{ color: 'var(--c-accent2)' }}>
            {q.level ?? 'practice'}
          </span>
        ) : (
          <>
            {showPaper && <span className="chip">{smPaperLabel(q.paper)}</span>}
            <span className="chip">
              Sec {q.sec} · Q{q.no}
            </span>
            <span className="chip num">{q.marks} marks</span>
          </>
        )}
        {q.theory && <span className="chip" style={{ color: 'var(--c-accent2)' }}>theory</span>}
        <span className="font-semibold flex-1 min-w-[12rem]">{q.title}</span>
        {smTopicById(q.topics[0])?.note && (
          <span className="chip" style={{ color: 'var(--c-load)' }} title={smTopicById(q.topics[0])?.note}>
            ⚑ not in this year’s syllabus
          </span>
        )}
        {q.flag && (
          <span className="chip" style={{ color: 'var(--c-load)' }} title={q.flag}>
            ⚑ {q.flag.length > 28 ? q.flag.slice(0, 26) + '…' : q.flag}
          </span>
        )}
        {q.topics.map((t) => (
          <span key={t} className="chip" style={{ color: smTopicById(t)?.color }}>
            {smTopicById(t)?.short}
          </span>
        ))}
        <span className="chip" style={{ color: st.c, borderColor: st.c }}>
          {st.label}
        </span>
      </button>
        <div className="pt-3 pr-3 shrink-0">
          <Menu q={q} />
        </div>
      </div>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-line/60 pt-4">
          <Md>{q.text}</Md>
          {q.given && <GivenStrip q={q} />}
          {smTopicById(q.topics[0])?.note && <div className="text-xs rounded-lg p-2 bg-load/10 text-mute">⚑ {smTopicById(q.topics[0])?.note}</div>}
          {q.flag && <div className="text-xs rounded-lg p-2 bg-load/10 text-mute">⚑ {q.flag}</div>}
          {q.figure && (
            <Boundary label="figure">
              <div className="rounded-xl bg-bg/60 border border-line p-2">{q.figure()}</div>
            </Boundary>
          )}
          {SHOW_SCANS && q.paper !== 'own' && q.pages.length > 0 && (
            <div>
              <button className="text-xs text-accent underline" onClick={() => setScan(!scan)}>
                {scan ? 'Hide original paper' : 'Show original paper (scan)'}
              </button>
              {scan && (
                <div className="mt-2 grid cq-md:grid-cols-2 gap-2">
                  {q.pages.map((pg) => (
                    <a key={pg} href={scan341(pg)} target="_blank" rel="noreferrer">
                      <img src={scan341(pg)} alt={`page ${pg}`} className="rounded-lg border border-line w-full bg-white" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          {checks.length > 0 && (
            <div className="rounded-xl border border-line p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Try it first — enter your key answers</div>
              {checks.map((c) => (
                <Answer key={c.key} id={`${tp}:${q.id}:${c.key}`} label={<Md>{c.label}</Md>} value={c.value} unit={c.unit} tol={c.tol} magnitude={c.magnitude} hint={c.hint} />
              ))}
            </div>
          )}
          {q.solution && (
            <Reveal id={q.id} title={q.theory ? 'Show model answer' : 'Show full solution'} defaultOpen={solutionOpen}>
              <Boundary label="solution">{q.solution()}</Boundary>
            </Reveal>
          )}
          {q.notes && q.notes.length > 0 && (
            <div className="text-xs text-mute">
              <b>Assumptions / reading of the paper:</b>
              <ul className="list-disc pl-5">
                {q.notes.map((n, i) => (
                  <li key={i}>
                    <Md>{n}</Md>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-mute">Mark as:</span>
            {STATUS.map((s) => (
              <button key={s.v} className={'btn !py-0.5 !px-2 !text-xs ' + (status === s.v ? '!border-current' : '')} style={{ color: status === s.v ? s.c : undefined }} onClick={() => setStatus(q.id, s.v)}>
                {s.label}
              </button>
            ))}
            <Link to={`/ce341/q/${encodeURIComponent(q.id)}`} className="ml-auto text-xs text-faint hover:text-accent">
              permalink
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}

function GivenStrip({ q }: { q: SmQ }) {
  const given = q.given!
  return (
    <div className="rounded-xl border border-load/40 bg-load/5 px-3 py-2 text-xs flex flex-wrap items-center gap-1.5">
      <span className="font-bold text-load mr-1">Given with the paper:</span>
      {given.length === 0 && <span className="text-mute">no tables attached — every value is in the question text</span>}
      {given.map((g, i) =>
        g.ref ? (
          <button key={i} className="chip hover:!border-load hover:text-ink" title={`${g.what ?? g.label} — open in the chart pane`} onClick={() => focusSmQuestion(q.id, given, { open: true, jump: g.ref })}>
            {g.formula ? '∑' : '▦'} {g.label}
            {g.what && <span className="text-faint font-normal">· {g.what}</span>}
          </button>
        ) : (
          <span key={i} className="chip text-mute" title="Not in the chart pane">
            {g.formula ? '∑' : '▦'} {g.label}
            {g.what && <span className="text-faint">· {g.what}</span>}
          </span>
        ),
      )}
    </div>
  )
}

/** ⋮ menu: Extract as PDF (question, figure, key answers, full solution / model answer), open, copy */
function Menu({ q }: { q: SmQ }) {
  const own = q.paper === 'own'
  const label = own ? 'Practice' : smPaperLabel(q.paper)
  const syllabus = smTopicById(q.topics[0])?.note
  return (
    <ProblemMenu
      label={own ? `More for “${q.title}”` : `More for ${label} Q${q.no}`}
      filename={own ? pdfName('CE341', 'practice', q.title) : pdfName('CE341', label, 'Q' + q.no)}
      footer="CE 341 Practice Lab"
      permalink={`/ce341/q/${encodeURIComponent(q.id)}`}
      copy={own ? `CE 341 practice: ${q.title}\n${q.text}` : `CE 341 ${label} Q${q.no} (${q.marks} marks)\n${q.text}`}
      doc={() => (
        <ProblemDoc
          course="CE 341 · Principles of Soil Mechanics"
          source={own ? `Practice problem (${q.level ?? 'practice'})` : `${label} term final (held ${smPaperById(q.paper)?.held ?? '—'})`}
          title={q.title}
          chips={[own ? '' : `Section ${q.sec} · Q${q.no}`, own ? '' : `${q.marks} marks`, q.theory ? 'theory' : '', ...q.topics.map((t) => smTopicById(t)?.title ?? t)]}
          text={q.text}
          given={q.given}
          flag={[q.flag, syllabus].filter(Boolean).join(' · ') || undefined}
          figure={q.figure}
          checks={q.checks}
          solution={q.solution}
          solutionLabel={q.theory ? 'Model answer' : 'Full solution'}
          notes={q.notes}
          from="CE 341 Practice Lab"
        />
      )}
    />
  )
}
