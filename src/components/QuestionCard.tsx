import { Component, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { givenFor, givenRefs } from '../pyq/given'
import type { PYQ } from '../pyq/types'
import { focusQuestion } from '../reference/drawer'
import { useStore } from '../store'
import { topicById } from '../topics/registry'
import { Answer, Md, Reveal } from './ui'

declare const __PUBLIC_BUILD__: boolean
export const SHOW_SCANS = typeof __PUBLIC_BUILD__ === 'undefined' ? true : !__PUBLIC_BUILD__

export class Boundary extends Component<{ children: ReactNode; label?: string }, { err: Error | null }> {
  state = { err: null as Error | null }
  static getDerivedStateFromError(err: Error) {
    return { err }
  }
  render() {
    if (this.state.err)
      return (
        <div className="text-sm text-bad rounded-lg border border-bad/40 p-3">
          Couldn’t render {this.props.label ?? 'this part'}: {this.state.err.message}
        </div>
      )
    return this.props.children
  }
}

const STATUS: { v: 'todo' | 'tried' | 'solved' | 'review'; label: string; c: string }[] = [
  { v: 'todo', label: 'To do', c: 'var(--c-faint)' },
  { v: 'tried', label: 'Tried', c: 'var(--c-load)' },
  { v: 'solved', label: 'Solved', c: 'var(--c-good)' },
  { v: 'review', label: 'Review again', c: 'var(--c-bad)' },
]

export function paperLabel(id: string) {
  return id === '2019-20' ? 'Jan 2021' : id
}

export function QuestionCard({ q, topic, showPaper = true, defaultOpen = false, solutionOpen = false }: { q: PYQ; topic?: string; showPaper?: boolean; defaultOpen?: boolean; solutionOpen?: boolean }) {
  const status = useStore((s) => s.qStatus[q.id] ?? 'todo')
  const setStatus = useStore((s) => s.setQStatus)
  const [scan, setScan] = useState(false)
  const [open, setOpen] = useState(defaultOpen)
  const tp = topic ?? q.topics[0]
  const given = givenFor(q.id)
  // opening a card puts its attached tables at the top of the code-tables drawer
  useEffect(() => {
    if (open && given) focusQuestion(q.id, givenRefs(q.id))
  }, [open, given, q.id])
  const checks = useMemo(() => {
    if (!open || !q.checks) return []
    try {
      return q.checks()
    } catch (e) {
      console.error(q.id, e)
      return []
    }
  }, [q, open])
  return (
    <article className="card overflow-hidden">
      <button className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-2 hover:bg-panel2/40" onClick={() => setOpen(!open)}>
        <span className={'inline-block transition-transform text-mute ' + (open ? 'rotate-90' : '')}>▸</span>
        {q.paper === 'own' ? (
          <span className="chip" style={{ color: 'var(--c-accent2)' }}>
            {q.level ?? 'practice'}
          </span>
        ) : (
          <>
            {showPaper && <span className="chip">{paperLabel(q.paper)}</span>}
            <span className="chip">
              Sec {q.sec} · Q{q.no}
            </span>
            <span className="chip num">{q.marks} marks</span>
          </>
        )}
        <span className="font-semibold flex-1 min-w-[12rem]">{q.title}</span>
        {q.legacy && <span className="chip" style={{ color: 'var(--c-load)' }}>old code → BNBC 2020</span>}
        {q.topics.map((t) => (
          <span key={t} className="chip" style={{ color: topicById(t)?.color }}>
            {topicById(t)?.short}
          </span>
        ))}
        <span className="chip" style={{ color: STATUS.find((s) => s.v === status)!.c, borderColor: STATUS.find((s) => s.v === status)!.c }}>
          {STATUS.find((s) => s.v === status)!.label}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-line/60 pt-4">
          <Md>{q.text}</Md>
          {given && <GivenStrip id={q.id} />}
          {q.legacy && <div className="text-xs rounded-lg p-2 bg-load/10 text-mute">{q.legacy}</div>}
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
                    <a key={pg} href={`scans/p-${String(pg).padStart(2, '0')}.jpg`} target="_blank" rel="noreferrer">
                      <img src={`scans/p-${String(pg).padStart(2, '0')}.jpg`} alt={`page ${pg}`} className="rounded-lg border border-line w-full bg-white" loading="lazy" />
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
            <Reveal id={q.id} title="Show full solution" defaultOpen={solutionOpen}>
              <Boundary label="solution">{q.solution()}</Boundary>
            </Reveal>
          )}
          {q.notes && q.notes.length > 0 && (
            <div className="text-xs text-mute">
              <b>Assumptions / reading of the figure:</b>
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
            <Link to={`/q/${q.id}`} className="ml-auto text-xs text-faint hover:text-accent">
              permalink
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}

/** what the paper printed with this question; each chip opens that table in the drawer */
function GivenStrip({ id }: { id: string }) {
  const given = givenFor(id)!
  const refs = givenRefs(id)
  return (
    <div className="rounded-xl border border-load/40 bg-load/5 px-3 py-2 text-xs flex flex-wrap items-center gap-1.5">
      <span className="font-bold text-load mr-1">Given with the paper:</span>
      {given.length === 0 && <span className="text-mute">no tables or formulas attached — every value is in the question text</span>}
      {given.map((g, i) =>
        g.ref ? (
          <button
            key={i}
            className="chip hover:!border-load hover:text-ink"
            title={`${g.what ?? g.label} — open in the code tables`}
            onClick={() => focusQuestion(id, refs, { open: true, jump: g.ref })}
          >
            {g.formula ? '∑' : '▦'} {g.label}
            {g.what && <span className="text-faint font-normal">· {g.what}</span>}
          </button>
        ) : (
          <span key={i} className="chip text-mute" title="Not in the code tables drawer">
            {g.formula ? '∑' : '▦'} {g.label}
            {g.what && <span className="text-faint">· {g.what}</span>}
          </span>
        ),
      )}
    </div>
  )
}
