import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Ring, Section } from '../../components/ui'
import { BlockChip, Planner, usePlanner } from '../../pages/planner/Planner'
import { pack } from '../../pages/planner/template'
import { today, useStore } from '../../store'
import { TopicIcon } from '../../topics/icons'
import { boxCounts } from '../engine/leitner'
import { BoxBar } from '../components/Flashcards'
import { deckFor, EV_ANSWERS, EV_DECK, EV_LISTS } from '../content'
import { EV_EXAM_DATE } from '../plan'
import { EV_ALL } from '../pyq'
import { EV_BLOCK_LABEL, EV_BLOCKS, EV_TOPICS, evTopicById } from '../registry'
import { EV_LAB_TITLE, EV_LABS } from '../labs'
import { sourcesOf } from '../components/EvQuestionCard'
import { EV_PAPERS } from '../types'
import { CourseThreads } from '../../account/TopicThreads'
import { TotalCell, TotalHead } from '../../components/TotalCell'

export default function EvOverview() {
  const [p, setP] = usePlanner('ce331')
  const map = useMemo(() => pack(p), [p])
  const t = today()
  const todays = map.get(t) ?? []
  const cards = useStore((s) => s.cards)
  const attempts = useStore((s) => s.attempts)
  const ids = EV_DECK.map((c) => c.id)
  const boxes = boxCounts(ids, cards)
  const due = EV_DECK.filter((c) => cards[c.id] && cards[c.id].due <= Date.now()).length
  const listsDone = EV_LISTS.filter((l) => attempts[`${l.topic}:kw:${l.id}`]?.correct).length
  const days = Math.max(0, Math.ceil((new Date(EV_EXAM_DATE + 'T09:00:00').getTime() - Date.now()) / 86400000))
  const hour = new Date().getHours()
  const greet = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <CourseThreads course="ce331" />
      <div className="grid cq-lg:grid-cols-[1.5fr_1fr] gap-5 mb-5">
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-6 opacity-[0.09]" aria-hidden>
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth={0.5}>
              <path d="M12 3 C9 8 7 10.5 7 13.5 A5 5 0 0 0 17 13.5 C17 10.5 15 8 12 3 Z M3 20.5 Q7.5 18.5 12 20.5 T21 20.5" />
            </svg>
          </div>
          <div className="text-sm text-mute">{greet} 🌊</div>
          <h1 className="text-2xl cq-md:text-3xl font-extrabold mt-1">
            <span className="text-accent num">{days}</span> day{days === 1 ? '' : 's'} to CE 331
          </h1>
          <p className="text-mute mt-1 text-sm">
            Term final on Monday, 23 November: 210 marks, 3 hours, 3 of 4 questions in each section. About half of it is numbers (settling, softening, ion exchange, wells, DTW design, pumps, RWH, networks) and half recall, so each topic has a Lab for the numbers and the Memory Well for the rest.
          </p>
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-faint mb-2">Today’s plan</div>
            {todays.length ? (
              <div className="space-y-1.5">
                {todays.map((b) => (
                  <BlockChip
                    key={b.id}
                    b={b}
                    course="ce331"
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
              <div className="text-sm text-mute">Nothing scheduled today. The plan starts 18 November; the Memory Well is always open.</div>
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
            <Stat label="lists recalled in full" v={`${listsDone}/${EV_LISTS.length}`} />
          </div>
          <Link to="/ce331/well" className="btn btn-primary justify-center">
            🪣 Open the Memory Well
          </Link>
        </div>
      </div>

      <Section title="Your plan to 23 November" sub="8 hours a day: Tanvir sir on the 18th and 19th (with the water safety plan), Snigdha ma’am on the 20th, Rowshan ma’am on the 21st, the 22nd kept for the 2023-24 mock and a sweep. Drag blocks between days, change hours, tick them off.">
        <Planner course="ce331" />
      </Section>

      <Section title="Labs for the numbers" sub="Play first, then the exam-style problems under each lab. Every number in a worked solution comes from these engines.">
        <LabStrip />
      </Section>

      <Section title="Asked again and again" sub="Model answers ranked by how many papers asked them. Know these cold.">
        <MostAsked />
      </Section>

      <Section title="What the exam asks" sub={`${EV_ALL.length} parts from ${EV_PAPERS.length} term finals (2007-08 → 2023-24). Darker = more marks.`}>
        <Heatmap />
        <div className="grid cq-md:grid-cols-3 gap-3 mt-4 text-sm">
          <Insight title="2023-24 = this term’s teachers">
            Section A: Tanvir sir (hardness and alkalinity, Henry’s law, Type II settling, filtration, CO₂ pH, split-treatment softening, destabilisation, adsorption, ion exchange) with Rowshan ma’am’s ecosystem, HtR areas, service ladder, SDG 6.1, RWH and WSP. Section B: Snigdha ma’am (aquifers, DTW yield and well log, fire demand, dead-end network, population methods, well interference) with Rowshan ma’am’s intake, submersible pump and water hammer.
          </Insight>
          <Insight title="Almost every paper">
            A settling-column problem, a lime–soda or ion-exchange problem, a pump capacity problem, a well-yield derivation, an RWH tank, water hammer, the elements of a water supply system and the water safety plan steps.
          </Insight>
          <Insight title="Unsolved parts are marked">
            Every past question says where its answer comes from: this term’s slides, class notes, older slides, seniors’ notes or a textbook. <b className="text-bad">{EV_ALL.filter((q) => sourcesOf(q)[0] === 'none').length}</b> parts have no solution in any source yet; the Papers page can list them.
          </Insight>
        </div>
      </Section>

      {EV_BLOCKS.map((g) => (
        <Section key={g} title={EV_BLOCK_LABEL[g]}>
          <div className="grid cq-sm:grid-cols-2 cq-lg:grid-cols-3 gap-3">
            {EV_TOPICS.filter((x) => x.block === g).map((tp) => {
              const deck = deckFor(tp.id)
              const known = deck.filter((c) => (cards[c.id]?.box ?? 0) >= 4).length
              const n = EV_ALL.filter((q) => q.topics.includes(tp.id)).length
              return (
                <Link key={tp.id} to={`/ce331/topic/${tp.id}`} className="card p-4 hover:border-accent transition-colors group">
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
  const top = useMemo(() => [...EV_ANSWERS].sort((a, b) => b.seen.length - a.seen.length).slice(0, 15), [])
  if (!top.length) return <div className="text-sm text-mute">Answers are still being added.</div>
  const max = top[0].seen.length || 1
  return (
    <ol className="card divide-y divide-line">
      {top.map((a, i) => {
        const t = evTopicById(a.topic)
        return (
          <li key={a.id} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="num text-faint w-5">{i + 1}</span>
            <Link to={`/ce331/answers#${a.id}`} className="flex-1 min-w-0 hover:text-accent truncate" title={a.q}>
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

function LabStrip() {
  const ids = Object.keys(EV_LABS) as (keyof typeof EV_LABS)[]
  if (!ids.length) return <div className="text-sm text-mute">The labs are being built.</div>
  return (
    <div className="grid cq-sm:grid-cols-2 cq-lg:grid-cols-4 gap-3">
      {ids.map((id) => {
        const tp = evTopicById(id)!
        return (
          <Link key={id} to={`/ce331/topic/${id}/lab`} className="card p-3 hover:border-accent flex items-center gap-3">
            <TopicIcon id={tp.id} color={tp.color} size={22} />
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{EV_LAB_TITLE[id] ?? tp.short}</div>
              <div className="text-[11px] text-faint truncate">{tp.short}</div>
            </div>
          </Link>
        )
      })}
    </div>
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
    for (const q of EV_ALL) for (const tp of q.topics) m.set(`${tp}|${q.paper}`, (m.get(`${tp}|${q.paper}`) ?? 0) + q.marks)
    return m
  }, [])
  const max = Math.max(1, ...data.values())
  const top = Math.max(1, ...EV_TOPICS.map((tp) => EV_PAPERS.reduce((a, p) => a + (data.get(`${tp.id}|${p.id}`) ?? 0), 0)))
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="text-xs border-separate border-spacing-[3px]">
        <thead>
          <tr>
            <th />
            {EV_PAPERS.map((p) => (
              <th key={p.id} className="font-semibold text-faint px-1 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                <Link to={`/ce331/papers/${p.id}`} className="hover:text-accent">
                  {p.label}
                </Link>
              </th>
            ))}
            <TotalHead label="marks" />
          </tr>
        </thead>
        <tbody>
          {EV_TOPICS.map((tp) => {
            const row = EV_PAPERS.map((p) => data.get(`${tp.id}|${p.id}`) ?? 0)
            const sum = row.reduce((a, b) => a + b, 0)
            return (
              <tr key={tp.id}>
                <td className="pr-2 whitespace-nowrap">
                  <Link to={`/ce331/topic/${tp.id}`} className="hover:text-accent font-semibold">
                    {tp.short}
                  </Link>
                </td>
                {row.map((v, i) => (
                  <td key={i} className="w-8 h-6 text-center rounded num" style={{ background: v ? `color-mix(in oklab, ${tp.color} ${12 + (v / max) * 60}%, transparent)` : 'var(--c-panel2)', color: v ? 'var(--c-ink)' : 'transparent' }}>
                    {v || '·'}
                  </td>
                ))}
                <TotalCell v={sum} max={top} color={tp.color} />
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="text-[11px] text-faint mt-1">Numbers are marks per paper (a part counted under each topic it touches).</div>
    </div>
  )
}
