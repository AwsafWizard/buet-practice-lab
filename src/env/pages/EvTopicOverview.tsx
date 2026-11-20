// A CE 331 topic on one screen: the admins' threads first, then how the exam asks it, your progress,
// and a short look at each of the other tabs (Recall, Keyword sheet, Learn, Past questions).
// Built from the topic's data, so every topic gets one without hand-written text.

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { mdPreview } from '../../account/preview'
import { TopicThreads } from '../../account/TopicThreads'
import { Ring } from '../../components/ui'
import { useStore } from '../../store'
import { FIG_RE } from '../components/EvQuestionCard'
import { BoxBar } from '../components/Flashcards'
import { answersFor, cardsFor, deckFor, listsFor } from '../content'
import { boxCounts } from '../engine/leitner'
import { evQForTopic } from '../pyq'
import { evTopicById } from '../registry'
import { EV_PAPERS, evPaperLabel } from '../types'

export function EvTopicOverview({ topic, go }: { topic: string; go: (tab: 'lab' | 'sheet' | 'answers' | 'pyq') => void }) {
  const meta = evTopicById(topic)!
  const cards = useStore((s) => s.cards)
  const attempts = useStore((s) => s.attempts)
  const qStatus = useStore((s) => s.qStatus)
  const deck = useMemo(() => deckFor(topic), [topic])
  const lists = useMemo(() => [...listsFor(topic)].sort((a, b) => b.seen.length - a.seen.length), [topic])
  const facts = useMemo(() => cardsFor(topic), [topic])
  const answers = useMemo(() => [...answersFor(topic)].sort((a, b) => b.seen.length - a.seen.length), [topic])
  const pyqs = useMemo(() => evQForTopic(topic), [topic])

  // marks per paper, newest paper first (EV_PAPERS order)
  const perPaper = useMemo(() => EV_PAPERS.map((p) => ({ p, marks: pyqs.filter((q) => q.paper === p.id).reduce((a, q) => a + q.marks, 0) })), [pyqs])
  const asked = perPaper.filter((x) => x.marks > 0)
  const totalMarks = asked.reduce((a, x) => a + x.marks, 0)
  const maxMarks = Math.max(1, ...perPaper.map((x) => x.marks))
  const latest = asked[0]?.p
  const recent4 = perPaper.slice(0, 4).filter((x) => x.marks > 0).length

  const boxes = boxCounts(
    deck.map((c) => c.id),
    cards,
  )
  const known = boxes[4] + boxes[5]
  const due = deck.filter((c) => cards[c.id] && cards[c.id].due <= Date.now()).length
  const listsDone = lists.filter((l) => attempts[`${l.topic}:kw:${l.id}`]?.correct).length
  const ansDone = answers.filter((a) => attempts[`${a.topic}:th:${a.id}`]?.correct).length
  const pyqDone = pyqs.filter((q) => qStatus[q.id] === 'solved').length

  return (
    <div>
      <TopicThreads topic={topic} />

      <div className="grid cq-lg:grid-cols-[1.4fr_1fr] gap-4 mb-5">
        <section className="card p-5">
          <h2 className="font-extrabold text-base mb-1">How the exam asks it</h2>
          <p className="text-sm text-mute mb-4">
            {asked.length ? (
              <>
                In <b className="text-ink num">{asked.length}</b> of the {EV_PAPERS.length} term finals, <b className="text-ink num">{pyqs.length}</b> part{pyqs.length === 1 ? '' : 's'} worth <b className="text-ink num">{totalMarks}</b> marks in all
                {latest && (
                  <>
                    ; last in <b className="text-ink">{latest.label}</b>
                  </>
                )}
                . {recent4 >= 3 ? 'Asked in almost every recent paper: expect it.' : recent4 >= 1 ? `In ${recent4} of the last 4 papers.` : 'Not in the last 4 papers, but the lists still come up inside other questions.'}
              </>
            ) : (
              'No past-paper part maps to this topic yet; its lists still turn up inside other questions.'
            )}
          </p>
          <div className="flex items-end gap-1.5 h-24" aria-label="Marks per paper, newest on the left">
            {perPaper.map(({ p, marks }) => (
              <Link key={p.id} to={`/ce331/papers/${p.id}`} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1 group" title={`${p.label}: ${marks} marks`}>
                <span className="num text-[10px] text-mute">{marks || ''}</span>
                <span
                  className="w-full rounded-t-md transition-opacity group-hover:opacity-80"
                  style={{ height: marks ? `${Math.max(8, (marks / maxMarks) * 100)}%` : 3, background: marks ? meta.color : 'var(--c-line)' }}
                />
              </Link>
            ))}
          </div>
          <div className="flex gap-1.5 mt-1">
            {perPaper.map(({ p }) => (
              <span key={p.id} className="flex-1 min-w-0 text-center text-[9px] text-faint" title={p.label}>
                <span className="hidden cq-md:inline">{p.label.replace(/^20(\d\d)-(\d\d)$/, '$1-$2').replace('Jan 2021', 'J21')}</span>
                <span className="cq-md:hidden">{p.label.replace(/^20(\d\d)-\d\d$/, '$1').replace('Jan 2021', 'J')}</span>
              </span>
            ))}
          </div>
          <div className="text-[11px] text-faint mt-2">Marks per paper, newest on the left. Tap a bar to open that paper.</div>
        </section>

        <section className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Ring value={deck.length ? known / deck.length : 0} size={60} stroke={6} color={meta.color} label={`${known}`} />
            <div>
              <div className="font-bold">Your progress</div>
              <div className="text-xs text-mute">
                {known} of {deck.length} cards known · ~{meta.hours} h to learn
              </div>
            </div>
          </div>
          <BoxBar boxes={boxes} />
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini v={`${listsDone}/${lists.length}`} label="lists recalled" />
            <Mini v={`${ansDone}/${answers.length}`} label="answers had" />
            <Mini v={`${pyqDone}/${pyqs.length}`} label="past parts known" />
          </div>
          <button className="btn btn-primary justify-center mt-auto" onClick={() => go('lab')}>
            🪣 {due ? `${due} card${due === 1 ? '' : 's'} due — open Recall` : 'Open Recall'}
          </button>
        </section>
      </div>

      <Block title="Lists to know" sub={`${lists.length} lists and ${facts.length} facts, most-asked first. The keywords only: the explanations are on the sheet.`} more="Keyword sheet" onMore={() => go('sheet')}>
        {lists.length ? (
          <div className="grid cq-md:grid-cols-2 gap-2.5">
            {lists.map((l) => {
              const done = attempts[`${l.topic}:kw:${l.id}`]?.correct
              return (
                <article key={l.id} className="card px-3.5 py-2.5">
                  <div className="flex items-start gap-2">
                    <h3 className="font-bold text-sm leading-snug flex-1">{l.title}</h3>
                    {done && (
                      <span className="text-good text-xs" title="Recalled in full">
                        ✓
                      </span>
                    )}
                    <span className="chip !py-0 !text-[10px] num shrink-0" title={l.seen.join(', ') || 'not asked yet'}>
                      {l.seen.length ? `${l.seen.length}×` : 'new'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {l.points.map((p, i) => (
                      <span key={i} className="text-[11px] rounded-md px-1.5 py-0.5 bg-panel2 text-mute">
                        {l.ordered && <span className="num text-faint mr-0.5">{i + 1}.</span>}
                        {p.k}
                      </span>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <Empty />
        )}
      </Block>

      <Block title="Learn: model answers" sub="The questions this topic answers, most-asked first." more={`All ${answers.length}`} onMore={() => go('answers')}>
        {answers.length ? (
          <ol className="card divide-y divide-line">
            {answers.slice(0, 8).map((a) => {
              const at = attempts[`${a.topic}:th:${a.id}`]
              return (
                <li key={a.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <span className={'w-4 text-center text-xs ' + (at ? (at.correct ? 'text-good' : 'text-bad') : 'text-faint')}>{at ? (at.correct ? '✓' : '✗') : '·'}</span>
                  <Link to={`/ce331/answers#${a.id}`} className="flex-1 min-w-0 truncate hover:text-accent" title={a.q}>
                    {a.q}
                  </Link>
                  <span className="num text-xs text-mute shrink-0">{a.seen.length ? `${a.seen.length}×` : 'new'}</span>
                </li>
              )
            })}
          </ol>
        ) : (
          <Empty />
        )}
      </Block>

      <Block title="Latest past questions" sub="The newest parts first. Blurt each one before you open its answer." more={`All ${pyqs.length}`} onMore={() => go('pyq')}>
        {pyqs.length ? (
          <div className="card divide-y divide-line">
            {pyqs.slice(0, 5).map((q) => (
              <button key={q.id} className="w-full text-left flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-panel2/50 transition-colors" onClick={() => go('pyq')}>
                <span className="shrink-0 w-20 text-xs">
                  <b>{evPaperLabel(q.paper)}</b>
                  <span className="block text-faint">
                    {q.sec} · {q.no} · <span className="num">{q.marks}</span>
                  </span>
                </span>
                <span className="flex-1 min-w-0 text-mute line-clamp-2">{mdPreview(q.text.replace(FIG_RE, ''), 220)}</span>
                {qStatus[q.id] === 'solved' && <span className="text-good text-xs shrink-0">✓</span>}
              </button>
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </Block>
    </div>
  )
}

function Block({ title, sub, more, onMore, children }: { title: string; sub: string; more: string; onMore: () => void; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="flex items-end gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-base">{title}</h2>
          <p className="text-xs text-mute">{sub}</p>
        </div>
        <button className="text-xs text-accent hover:underline shrink-0" onClick={onMore}>
          {more} →
        </button>
      </div>
      {children}
    </section>
  )
}

function Mini({ v, label }: { v: string; label: string }) {
  return (
    <div className="rounded-xl bg-panel2 border border-line px-2 py-2">
      <div className="num font-bold">{v}</div>
      <div className="text-[10px] text-mute leading-tight">{label}</div>
    </div>
  )
}

function Empty() {
  return <div className="text-sm text-mute">Nothing here yet.</div>
}
