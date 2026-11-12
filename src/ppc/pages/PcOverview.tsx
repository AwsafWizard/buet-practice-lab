import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Ring, Section } from '../../components/ui'
import { BlockChip, Planner, usePlanner } from '../../pages/planner/Planner'
import { pack } from '../../pages/planner/template'
import { today, useStore } from '../../store'
import { TopicIcon } from '../../topics/icons'
import { boxCounts } from '../engine/leitner'
import { BoxBar } from '../components/Flashcards'
import { deckFor, PC_ANSWERS, PC_DECK, PC_LISTS } from '../content'
import { PC_EXAM_DATE } from '../plan'
import { PC_ALL } from '../pyq'
import { PC_BLOCK_LABEL, PC_TOPICS, pcTopicById, type PcBlock } from '../registry'
import { PC_PAPERS } from '../types'

export default function PcOverview() {
  const [p, setP] = usePlanner('ce301')
  const map = useMemo(() => pack(p), [p])
  const t = today()
  const todays = map.get(t) ?? []
  const cards = useStore((s) => s.cards)
  const attempts = useStore((s) => s.attempts)
  const ids = PC_DECK.map((c) => c.id)
  const boxes = boxCounts(ids, cards)
  const due = PC_DECK.filter((c) => cards[c.id] && cards[c.id].due <= Date.now()).length
  const listsDone = PC_LISTS.filter((l) => attempts[`${l.topic}:kw:${l.id}`]?.correct).length
  const days = Math.max(0, Math.ceil((new Date(PC_EXAM_DATE + 'T09:00:00').getTime() - Date.now()) / 86400000))
  const hour = new Date().getHours()
  const greet = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="grid cq-lg:grid-cols-[1.5fr_1fr] gap-5 mb-5">
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-6 opacity-[0.09]" aria-hidden>
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth={0.5}>
              <path d="M6 3 H15 L19 7 V21 H6 Z M15 3 V7 H19 M9 11 H16 M9 14 H16 M9 18 q1.5 -2.5 3 0 t3 0" />
            </svg>
          </div>
          <div className="text-sm text-mute">{greet} 🦇</div>
          <h1 className="text-2xl cq-md:text-3xl font-extrabold mt-1">
            <span className="text-accent num">{days}</span> day{days === 1 ? '' : 's'} to CE 301
          </h1>
          <p className="text-mute mt-1 text-sm">
            Term final on Tuesday, 17 November: 210 marks, 3 hours, 3 of 4 questions in each section. It is all recall — lists, definitions, flow charts, a TDS and a QCBS sheet — so the Lab here is built for memorizing.
          </p>
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-faint mb-2">Today’s plan</div>
            {todays.length ? (
              <div className="space-y-1.5">
                {todays.map((b) => (
                  <BlockChip
                    key={b.id}
                    b={b}
                    course="ce301"
                    onToggle={() => {
                      const q = structuredClone(p)
                      const x = q.blocks.find((y) => y.id === b.id)!
                      x.done = !x.done
                      if (!x.day) x.day = t
                      setP(q)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-mute">Nothing scheduled today. The plan starts 13 November; the Memory gym is always open.</div>
            )}
          </div>
        </div>
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Ring value={ids.length ? (boxes[4] + boxes[5]) / ids.length : 0} size={64} stroke={6} label={`${boxes[4] + boxes[5]}`} />
            <div>
              <div className="font-bold">Cards you know</div>
              <div className="text-xs text-mute">of {ids.length} flashcards (box 4–5)</div>
            </div>
          </div>
          <BoxBar boxes={boxes} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="cards due now" v={`${due}`} />
            <Stat label="lists recalled in full" v={`${listsDone}/${PC_LISTS.length}`} />
          </div>
          <Link to="/ce301/gym" className="btn btn-primary justify-center">
            🧠 Open the Memory gym
          </Link>
        </div>
      </div>

      <Section title="Your plan to 17 November" sub="8 hours a day: IA sir on the 13th, OIA Ma’am on the 14th, AAN sir on the 15th, the 16th kept for a mock and a sweep. Drag blocks between days, change hours, tick them off.">
        <Planner course="ce301" />
      </Section>

      <Section title="Asked again and again" sub="Model answers ranked by how many of the 12 papers asked them. Know these cold.">
        <MostAsked />
      </Section>

      <Section title="What the exam asks" sub={`${PC_ALL.length} parts from ${PC_PAPERS.length} term finals (2011-12 → 2023-24). Darker = more parts.`}>
        <Heatmap />
        <div className="grid cq-md:grid-cols-3 gap-3 mt-4 text-sm">
          <Insight title="2023-24 = this term’s teachers">
            Section A: communication process, slanted abstract, short-report formats, ASCE ethics cases, meeting leadership, PDS/procurement/contract format, fiduciary risk, contract risk, PLI concerns, surety, think-twice. Section B: Act vs Regulation, OTM, tender flow chart, intellectual services, a TDS, forfeiture, ASCE definition, brief.
          </Insight>
          <Insight title="Almost every paper">
            The ASCE definition of a civil engineer, think-twice clauses, the tender process flow chart, documents in order of priority, a TDS or a BoQ, the seven C’s, contract-risk guidelines and PLI concerns.
          </Insight>
          <Insight title="How marks are given">
            Roughly one point per 2–3 marks: the keyword first, then one line of explanation. Flow charts and tables score better than paragraphs. Blurt drills check exactly that.
          </Insight>
        </div>
      </Section>

      {(['IA', 'OIA', 'AAN'] as PcBlock[]).map((g) => (
        <Section key={g} title={PC_BLOCK_LABEL[g]}>
          <div className="grid cq-sm:grid-cols-2 cq-lg:grid-cols-3 gap-3">
            {PC_TOPICS.filter((x) => x.block === g).map((tp) => {
              const deck = deckFor(tp.id)
              const known = deck.filter((c) => (cards[c.id]?.box ?? 0) >= 4).length
              const n = PC_ALL.filter((q) => q.topics.includes(tp.id)).length
              return (
                <Link key={tp.id} to={`/ce301/topic/${tp.id}`} className="card p-4 hover:border-accent transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${tp.color} 15%, transparent)` }}>
                      <TopicIcon id={tp.id} color={tp.color} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold group-hover:text-accent truncate">{tp.title}</div>
                      <div className="text-xs text-faint">
                        {n} past parts · {deck.length} cards · ~{tp.hours} h
                      </div>
                    </div>
                    <Ring value={deck.length ? known / deck.length : 0} size={30} stroke={3.5} color={tp.color} />
                  </div>
                  <p className="text-xs text-mute mt-2 leading-relaxed">{tp.blurb}</p>
                </Link>
              )
            })}
          </div>
        </Section>
      ))}
    </div>
  )
}

function MostAsked() {
  const top = useMemo(() => [...PC_ANSWERS].sort((a, b) => b.seen.length - a.seen.length).slice(0, 15), [])
  if (!top.length) return <div className="text-sm text-mute">Answers are still being added.</div>
  const max = top[0].seen.length || 1
  return (
    <ol className="card divide-y divide-line">
      {top.map((a, i) => {
        const t = pcTopicById(a.topic)
        return (
          <li key={a.id} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="num text-faint w-5">{i + 1}</span>
            <Link to={`/ce301/answers#${a.id}`} className="flex-1 min-w-0 hover:text-accent truncate" title={a.q}>
              {a.q}
            </Link>
            <span className="text-[11px] hidden cq-sm:inline" style={{ color: t?.color }}>
              {t?.short}
            </span>
            <span className="w-24 h-1.5 rounded-full bg-panel2 overflow-hidden hidden cq-sm:block">
              <span className="block h-full bg-accent" style={{ width: `${(a.seen.length / max) * 100}%` }} />
            </span>
            <span className="num text-xs text-mute w-8 text-right">{a.seen.length}×</span>
          </li>
        )
      })}
    </ol>
  )
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-xl bg-panel2 border border-line p-3">
      <div className="num text-xl font-bold">{v}</div>
      <div className="text-xs text-mute">{label}</div>
    </div>
  )
}

function Insight({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-panel2 border border-line p-3">
      <div className="font-bold mb-1">{title}</div>
      <div className="text-mute text-[13px] leading-relaxed">{children}</div>
    </div>
  )
}

function Heatmap() {
  const data = useMemo(() => {
    const m = new Map<string, number>()
    for (const q of PC_ALL) for (const tp of q.topics) m.set(`${tp}|${q.paper}`, (m.get(`${tp}|${q.paper}`) ?? 0) + q.marks)
    return m
  }, [])
  const max = Math.max(1, ...data.values())
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="text-xs border-separate border-spacing-[3px]">
        <thead>
          <tr>
            <th />
            {PC_PAPERS.map((p) => (
              <th key={p.id} className="font-semibold text-faint px-1 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                <Link to={`/ce301/papers/${p.id}`} className="hover:text-accent">
                  {p.label}
                </Link>
              </th>
            ))}
            <th className="text-faint px-2">marks</th>
          </tr>
        </thead>
        <tbody>
          {PC_TOPICS.map((tp) => {
            const row = PC_PAPERS.map((p) => data.get(`${tp.id}|${p.id}`) ?? 0)
            const sum = row.reduce((a, b) => a + b, 0)
            return (
              <tr key={tp.id}>
                <td className="pr-2 whitespace-nowrap">
                  <Link to={`/ce301/topic/${tp.id}`} className="hover:text-accent font-semibold">
                    {tp.short}
                  </Link>
                </td>
                {row.map((v, i) => (
                  <td key={i} className="w-8 h-6 text-center rounded num" style={{ background: v ? `color-mix(in oklab, ${tp.color} ${12 + (v / max) * 60}%, transparent)` : 'var(--c-panel2)', color: v ? 'var(--c-ink)' : 'transparent' }}>
                    {v || '·'}
                  </td>
                ))}
                <td className="text-center num font-bold">{sum}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="text-[11px] text-faint mt-1">Numbers are marks per paper (a part counted under each topic it touches).</div>
    </div>
  )
}
