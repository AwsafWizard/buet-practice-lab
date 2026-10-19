import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { paperLabel, QuestionCard, SHOW_SCANS } from '../components/QuestionCard'
import { Md, Section } from '../components/ui'
import { pyqForPaper } from '../pyq'
import { paperById, PAPERS, type PYQ } from '../pyq/types'
import { useStore } from '../store'
import { topicById } from '../topics/registry'

export default function Papers() {
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
      <p className="text-sm text-mute mb-5">All 13 term finals, newest first. Open a paper to browse it question by question, or start a timed mock.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...PAPERS].reverse().map((p) => {
          const qs = pyqForPaper(p.id)
          const solved = qs.filter((q) => qStatus[q.id] === 'solved').length
          const topics = [...new Set(qs.flatMap((q) => q.topics))]
          const m = mocks[p.id]
          return (
            <Link key={p.id} to={`/papers/${p.id}`} className="card p-4 hover:border-accent transition-colors">
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-extrabold">{paperLabel(p.id)}</div>
                <div className="text-xs text-faint">{p.held}</div>
              </div>
              <div className="text-xs text-mute">
                {p.marks} marks · {p.time} · {qs.length} parts
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {topics.map((t) => (
                  <span key={t} className="chip !text-[10px]" style={{ color: topicById(t)?.color }}>
                    {topicById(t)?.short}
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
  const p = paperById(id)
  const qs = useMemo(() => pyqForPaper(id), [id])
  const [mock, setMock] = useState(false)
  if (!p) return <div>Unknown paper</div>
  return (
    <div>
      <Link to="/papers" className="text-sm text-accent">
        ← all papers
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-2 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">CE 311 — {paperLabel(p.id)}</h1>
          <div className="text-sm text-mute">
            {p.title} · held {p.held} · {p.marks} marks · {p.time}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setMock(!mock)}>
          {mock ? 'Back to browsing' : '⏱ Start timed mock'}
        </button>
      </div>
      {mock ? (
        <Mock paperId={p.id} qs={qs} marks={p.marks} />
      ) : (
        (['A', 'B'] as const).map((sec) => (
          <Section key={sec} title={`Section ${sec}`} sub={p.format[sec]}>
            <div className="space-y-3">
              {qs
                .filter((q) => q.sec === sec)
                .map((q) => (
                  <QuestionCard key={q.id} q={q} showPaper={false} />
                ))}
            </div>
          </Section>
        ))
      )}
    </div>
  )
}

function Mock({ paperId, qs, marks }: { paperId: string; qs: PYQ[]; marks: number }) {
  const p = paperById(paperId)
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
        <div className="text-sm text-mute">Work on paper. Solutions are hidden until you finish.</div>
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
                      <img src={`scans/p-${String(q.pages[q.pages.length - 1]).padStart(2, '0')}.jpg`} className="rounded-lg mt-2 max-w-xl w-full bg-white" />
                    </details>
                  )}
                  {done && (
                    <div className="mt-3 space-y-2">
                      <label className="text-sm flex items-center gap-2">
                        Marks you’d give yourself:
                        <input type="number" className="field w-20" min={0} max={q.marks} value={got[q.id] ?? ''} onChange={(e) => setGot({ ...got, [q.id]: Math.min(q.marks, Math.max(0, +e.target.value)) })} />/ {q.marks}
                      </label>
                      <Link to={`/q/${q.id}`} target="_blank" className="text-xs text-accent underline">
                        open solution in a new tab
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
          <button className="btn btn-primary ml-auto" onClick={() => save(paperId, sum('A'), sum('B'))}>
            Save score (/{marks})
          </button>
        </div>
      )}
    </div>
  )
}
