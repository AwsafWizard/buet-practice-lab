import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SHOW_SCANS } from '../../components/QuestionCard'
import { Md, Section } from '../../components/ui'
import { useStore } from '../../store'
import { partKeys, PartAnswer, PcQuestionCard, scan301 } from '../components/PcQuestionCard'
import { pcQForPaper } from '../pyq'
import { pcTopicById } from '../registry'
import { pcPaperById, PC_PAPERS, type PcQ } from '../types'

const mockKey = (id: string) => 'pc-' + id

export default function PcPapers() {
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
        All {PC_PAPERS.length} CE 301 term finals, newest first. 2023-24 is the one set by this term’s group of teachers, so it is the mock to sit on 16 November. Every part links to its model answer and can be blurted against the clock.
      </p>
      <div className="grid cq-sm:grid-cols-2 cq-lg:grid-cols-3 gap-3">
        {PC_PAPERS.map((p) => {
          const qs = pcQForPaper(p.id)
          const known = qs.filter((q) => qStatus[q.id] === 'solved').length
          const topics = [...new Set(qs.flatMap((q) => q.topics))]
          const m = mocks[mockKey(p.id)]
          return (
            <Link key={p.id} to={`/ce301/papers/${p.id}`} className="card p-4 hover:border-accent transition-colors">
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-extrabold">{p.label}</div>
                <div className="text-xs text-faint">{p.held}</div>
              </div>
              <div className="text-xs text-mute">
                {p.marks} marks · {p.time} · {qs.length} parts
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {topics.slice(0, 10).map((t) => (
                  <span key={t} className="chip !text-[10px]" style={{ color: pcTopicById(t)?.color }}>
                    {pcTopicById(t)?.short}
                  </span>
                ))}
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-good" style={{ width: `${qs.length ? (known / qs.length) * 100 : 0}%` }} />
              </div>
              <div className="text-xs text-mute mt-1 flex justify-between">
                <span>
                  {known}/{qs.length} known
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
  const p = pcPaperById(id)
  const qs = useMemo(() => pcQForPaper(id), [id])
  const [mock, setMock] = useState(false)
  if (!p) return <div>Unknown paper</div>
  return (
    <div>
      <Link to="/ce301/papers" className="text-sm text-accent">
        ← all papers
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-2 mb-3">
        <div>
          <h1 className="text-2xl font-extrabold">CE 301 — {p.label}</h1>
          <div className="text-sm text-mute">
            held {p.held} · {p.marks} marks · {p.time}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setMock(!mock)}>
          {mock ? 'Back to browsing' : '⏱ Start timed mock'}
        </button>
      </div>
      {p.note && <div className="mb-4 rounded-xl border border-accent/40 bg-accent/5 px-4 py-2.5 text-sm">{p.note}</div>}
      {mock ? (
        <Mock paperId={p.id} qs={qs} />
      ) : (
        <>
          {(['A', 'B'] as const).map((sec) => (
            <Section key={sec} title={`Section ${sec}`} sub={p.format[sec]}>
              <div className="space-y-3">
                {qs
                  .filter((q) => q.sec === sec)
                  .map((q) => (
                    <PcQuestionCard key={q.id} q={q} showPaper={false} />
                  ))}
              </div>
            </Section>
          ))}
          {SHOW_SCANS && (
            <Section title="Original paper (scans)">
              <details>
                <summary className="text-sm text-accent cursor-pointer">Show all {p.pages.length} pages</summary>
                <div className="mt-2 grid cq-md:grid-cols-2 gap-2">
                  {p.pages.map((pg) => (
                    <a key={pg} href={scan301(pg)} target="_blank" rel="noreferrer">
                      <img src={scan301(pg)} alt={`page ${pg}`} className="rounded-lg border border-line w-full bg-white" loading="lazy" />
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

/** group parts into whole questions (Q5 = 5(a), 5(b)…) */
const qnum = (q: PcQ) => q.no.replace(/\(.*$/, '')

function Mock({ paperId, qs }: { paperId: string; qs: PcQ[] }) {
  const p = pcPaperById(paperId)!
  // '3 hours' or '2 hours 30 minutes'
  const total = (parseInt(p.time) * 60 + (parseInt(p.time.split('hours')[1] ?? '') || 0)) * 60
  const [start] = useState(() => Date.now())
  const [now, setNow] = useState(Date.now())
  const [done, setDone] = useState(false)
  const [got, setGot] = useState<Record<string, number>>({})
  const [ticks, setTicks] = useState<Record<string, boolean[]>>({})
  const save = useStore((s) => s.saveMock)
  useEffect(() => {
    if (done) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [done])
  const left = Math.max(0, total - Math.floor((now - start) / 1000))
  const hh = Math.floor(left / 3600)
  const mm = Math.floor((left % 3600) / 60)
  const ss = left % 60
  // count only the best 3 whole questions per section (5 in 2011-12), as the examiner would
  const best = (sec: 'A' | 'B') => {
    const per = new Map<string, number>()
    for (const q of qs.filter((x) => x.sec === sec)) per.set(qnum(q), (per.get(qnum(q)) ?? 0) + (got[q.id] ?? 0))
    const n = p.format[sec].includes('any 5') ? 5 : 3
    // Jan 2021, Section B: Q5 is compulsory, then the best 2 of the rest
    const must = /Q(\d+) is compulsory/.exec(p.format[sec])?.[1]
    if (must) {
      const first = per.get(must) ?? 0
      per.delete(must)
      return first + [...per.values()].sort((a, b) => b - a).slice(0, n - 1).reduce((a, b) => a + b, 0)
    }
    return [...per.values()].sort((a, b) => b - a).slice(0, n).reduce((a, b) => a + b, 0)
  }
  return (
    <div>
      <div className="sticky top-14 z-10 bg-bg/90 backdrop-blur py-2 mb-4 flex flex-wrap items-center gap-4">
        <div className={'num text-3xl font-extrabold ' + (left < 900 ? 'text-bad' : 'text-accent')}>
          {hh}:{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
        </div>
        <div className="text-sm text-mute flex-1 min-w-[12rem]">Write on paper. About 60 minutes per section question set (≈ 0.85 min a mark). Flow charts and tables where they fit.</div>
        {!done && (
          <button className="btn" onClick={() => setDone(true)}>
            Finish & self-mark
          </button>
        )}
      </div>
      {(['A', 'B'] as const).map((sec) => (
        <Section key={sec} title={`Section ${sec}`} sub={p.format[sec]}>
          <div className="space-y-4">
            {qs
              .filter((q) => q.sec === sec)
              .map((q) => {
                const keys = partKeys(q)
                const tk = ticks[q.id] ?? keys.map(() => false)
                return (
                  <div key={q.id} className="border-b border-line pb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold">Q{q.no}</span>
                      <span className="chip num">{q.marks}</span>
                    </div>
                    <Md>{q.text}</Md>
                    {done && (
                      <div className="mt-3 rounded-xl bg-panel2 border border-line p-3 space-y-2">
                        {keys.length > 0 && (
                          <>
                            <div className="text-xs text-mute">Tick the keywords your script has (skip the parts you didn’t attempt):</div>
                            <div className="flex flex-wrap gap-1">
                              {keys.map((k, i) => (
                                <label key={k} className={'chip !text-xs cursor-pointer ' + (tk[i] ? '!border-good/60 text-good' : '')}>
                                  <input
                                    type="checkbox"
                                    className="mr-1"
                                    checked={tk[i]}
                                    onChange={() => {
                                      const nt = tk.map((v, j) => (j === i ? !v : v))
                                      setTicks({ ...ticks, [q.id]: nt })
                                      setGot({ ...got, [q.id]: Math.round(((q.marks * nt.filter(Boolean).length) / keys.length) * 2) / 2 })
                                    }}
                                  />
                                  {k}
                                </label>
                              ))}
                            </div>
                          </>
                        )}
                        <label className="text-sm flex items-center gap-2">
                          Marks you’d give yourself:
                          <input type="number" className="field w-20" min={0} max={q.marks} step={0.5} value={got[q.id] ?? ''} onChange={(e) => setGot({ ...got, [q.id]: Math.min(q.marks, Math.max(0, +e.target.value)) })} />/ {q.marks}
                        </label>
                        <details>
                          <summary className="text-xs text-accent cursor-pointer">model answer</summary>
                          <div className="mt-2">
                            <PartAnswer q={q} />
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </Section>
      ))}
      {done && (
        <div className="card p-4 flex flex-wrap items-center gap-4">
          <div>
            Best {p.format.A.includes('any 5') ? 5 : 3} questions — Section A: <b className="num">{best('A')}</b> · Section B: <b className="num">{best('B')}</b>
          </div>
          <button className="btn btn-primary ml-auto" onClick={() => save(mockKey(paperId), best('A'), best('B'))}>
            Save score (/{p.marks})
          </button>
        </div>
      )}
    </div>
  )
}
