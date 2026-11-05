import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SHOW_SCANS } from '../../components/QuestionCard'
import { Md, Section } from '../../components/ui'
import { useStore } from '../../store'
import { SmQuestionCard, scan341 } from '../components/SmQuestionCard'
import { smQForPaper } from '../pyq'
import { smTopicById } from '../registry'
import { smPaperById, SM_PAPERS, type SmQ } from '../types'

const mockKey = (id: string) => 'sm-' + id

export default function SmPapers() {
  const { paper } = useParams()
  if (paper) return <PaperView id={paper} />
  return <PaperList />
}

function PaperList() {
  const qStatus = useStore((s) => s.qStatus)
  const mocks = useStore((s) => s.mockScores)
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Past papers & mock exams</h1>
      <p className="text-sm text-mute mb-5">
        All {SM_PAPERS.length} CE 341 term finals, newest first. 2023-24’s Section A looks like AJK sir’s own paper, so it is the best guide to this term. Older papers (Prof. Abu Siddique’s half) also ask Coulomb / Culmann, sloped backfill, wall loads, vane and Skempton A/B: those parts are solved and flagged ⚑ as outside this term’s slides. Which printed section is AJK sir’s half changes from year to year; each paper says.
      </p>
      <div className="grid cq-sm:grid-cols-2 cq-lg:grid-cols-3 gap-3">
        {SM_PAPERS.map((p) => {
          const qs = smQForPaper(p.id)
          const solved = qs.filter((q) => qStatus[q.id] === 'solved').length
          const topics = [...new Set(qs.flatMap((q) => q.topics))]
          const m = mocks[mockKey(p.id)]
          return (
            <Link key={p.id} to={`/ce341/papers/${p.id}`} className="card p-4 hover:border-accent transition-colors">
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-extrabold">{p.label}</div>
                <div className="text-xs text-faint">{p.held}</div>
              </div>
              <div className="text-xs text-mute">
                {p.marks} marks · {p.time} · {qs.length} parts · AJK sir’s half = Sec {p.ajk}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {topics.map((t) => (
                  <span key={t} className="chip !text-[10px]" style={{ color: smTopicById(t)?.color }}>
                    {smTopicById(t)?.short}
                  </span>
                ))}
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-good" style={{ width: `${qs.length ? (solved / qs.length) * 100 : 0}%` }} />
              </div>
              <div className="text-xs text-mute mt-1 flex justify-between">
                <span>
                  {solved}/{qs.length} solved
                </span>
                {m && (
                  <span className="text-accent">
                    mock: {m.secA + m.secB}/{p.marks}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function PaperView({ id }: { id: string }) {
  const p = smPaperById(id)
  const qs = useMemo(() => smQForPaper(id), [id])
  const [mock, setMock] = useState(false)
  if (!p) return <div>Unknown paper</div>
  return (
    <div>
      <Link to="/ce341/papers" className="text-sm text-accent">
        ← all papers
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-2 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">CE 341 — {p.label}</h1>
          <div className="text-sm text-mute">
            held {p.held} · {p.marks} marks · {p.time}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setMock(!mock)}>
          {mock ? 'Back to browsing' : '⏱ Start timed mock'}
        </button>
      </div>
      {!qs.length && <div className="card p-4 text-sm text-mute mb-4">This paper’s questions are still being added. The scans are below.</div>}
      {mock ? (
        <Mock paperId={p.id} qs={qs} marks={p.marks} />
      ) : (
        <>
          {(['A', 'B'] as const).map((sec) => (
            <Section key={sec} title={`Section ${sec}`} sub={p.format[sec]}>
              <div className="space-y-3">
                {qs
                  .filter((q) => q.sec === sec)
                  .map((q) => (
                    <SmQuestionCard key={q.id} q={q} showPaper={false} />
                  ))}
              </div>
            </Section>
          ))}
          {SHOW_SCANS && (
            <Section title="Original paper (scans)" sub="Including the attached design aids">
              <details>
                <summary className="text-sm text-accent cursor-pointer">Show all {p.pages.length} pages</summary>
                <div className="mt-2 grid cq-md:grid-cols-2 gap-2">
                  {p.pages.map((pg) => (
                    <a key={pg} href={scan341(pg)} target="_blank" rel="noreferrer">
                      <img src={scan341(pg)} alt={`page ${pg}`} className="rounded-lg border border-line w-full bg-white" loading="lazy" />
                    </a>
                  ))}
                </div>
              </details>
            </Section>
          )}
        </>
      )}
    </div>
  )
}

function Mock({ paperId, qs, marks }: { paperId: string; qs: SmQ[]; marks: number }) {
  const p = smPaperById(paperId)!
  const total = p.time.startsWith('2.5') ? 150 * 60 : 180 * 60
  const [start] = useState(() => Date.now())
  const [now, setNow] = useState(Date.now())
  const [done, setDone] = useState(false)
  const [got, setGot] = useState<Record<string, number>>({})
  const save = useStore((s) => s.saveMock)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, total - Math.floor((now - start) / 1000))
  const hh = Math.floor(left / 3600)
  const mm = Math.floor((left % 3600) / 60)
  const ss = left % 60
  const sum = (sec: 'A' | 'B') => qs.filter((q) => q.sec === sec).reduce((s, q) => s + (got[q.id] ?? 0), 0)
  return (
    <div>
      <div className="sticky top-14 z-10 bg-bg/90 backdrop-blur py-2 mb-4 flex items-center gap-4">
        <div className={'num text-3xl font-extrabold ' + (left < 900 ? 'text-bad' : 'text-accent')}>
          {hh}:{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
        </div>
        <div className="text-sm text-mute">Work on paper; answer 3 of 4 per section. The attached charts are in the chart pane (T).</div>
        <button className="btn ml-auto" onClick={() => setDone(true)}>
          Finish & self-mark
        </button>
      </div>
      {(['A', 'B'] as const).map((sec) => (
        <Section key={sec} title={`Section ${sec}`} sub={p.format[sec]}>
          <div className="space-y-4">
            {qs
              .filter((q) => q.sec === sec)
              .map((q) => (
                <div key={q.id} className="border-b border-line pb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold">Q{q.no}</span>
                    <span className="chip num">{q.marks}</span>
                  </div>
                  <Md>{q.text}</Md>
                  {q.figure && <div className="rounded-xl bg-bg/60 border border-line p-2 mt-2">{q.figure()}</div>}
                  {SHOW_SCANS && q.pages[0] && (
                    <details className="mt-1">
                      <summary className="text-xs text-accent cursor-pointer">original scan</summary>
                      <img src={scan341(q.pages[0])} className="rounded-lg mt-2 max-w-xl w-full bg-white" />
                    </details>
                  )}
                  {done && (
                    <div className="mt-3 space-y-2">
                      <label className="text-sm flex items-center gap-2">
                        Marks you’d give yourself:
                        <input type="number" className="field w-20" min={0} max={q.marks} value={got[q.id] ?? ''} onChange={(e) => setGot({ ...got, [q.id]: Math.min(q.marks, Math.max(0, +e.target.value)) })} />/ {q.marks}
                      </label>
                      <Link to={`/ce341/q/${encodeURIComponent(q.id)}`} className="text-xs text-accent underline">
                        open the solution
                      </Link>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Section>
      ))}
      {done && (
        <div className="card p-4 flex items-center gap-4">
          <div>
            Section A answered: <b className="num">{sum('A')}</b> · Section B: <b className="num">{sum('B')}</b> (count only the questions you chose)
          </div>
          <button className="btn btn-primary ml-auto" onClick={() => save(mockKey(paperId), sum('A'), sum('B'))}>
            Save score (/{marks})
          </button>
        </div>
      )}
    </div>
  )
}
