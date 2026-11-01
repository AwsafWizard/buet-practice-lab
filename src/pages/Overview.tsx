import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Ring, Section } from '../components/ui'
import { ALL_PYQ } from '../pyq'
import { PAPERS } from '../pyq/types'
import { today, topicStats, useStore, type TopicId } from '../store'
import { TopicIcon } from '../topics/icons'
import { SECTION_LABEL, TOPICS } from '../topics/registry'
import { BlockChip, Planner, usePlanner } from './planner/Planner'
import { EXAM_DATE, pack } from './planner/template'

export default function Overview() {
  const [p, setP] = usePlanner()
  const map = useMemo(() => pack(p), [p])
  const t = today()
  const todays = map.get(t) ?? []
  const attempts = useStore((s) => s.attempts)
  const qStatus = useStore((s) => s.qStatus)
  const solved = Object.values(qStatus).filter((s) => s === 'solved').length
  const checks = Object.values(attempts)
  const acc = checks.length ? checks.filter((a) => a.correct).length / checks.length : 0
  const days = Math.max(0, Math.ceil((new Date(EXAM_DATE + 'T09:00:00').getTime() - Date.now()) / 86400000))
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="grid cq-lg:grid-cols-[1.5fr_1fr] gap-5 mb-5">
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-[0.07]">
            <svg width="260" height="200" viewBox="0 0 24 18">
              <path d="M1 16 L5 6 L9 16 L13 6 L17 16 L21 6 L23 16 Z M5 6 H21" fill="none" stroke="var(--c-accent)" strokeWidth={0.6} />
            </svg>
          </div>
          <div className="text-sm text-mute">{greet} 👋</div>
          <h1 className="text-2xl cq-md:text-3xl font-extrabold mt-1">
            <span className="text-accent num">{days}</span> days to CE 311
          </h1>
          <p className="text-mute mt-1 text-sm">Term final on Saturday, 31 October. One topic at a time — learn it, play with it, then beat the past papers.</p>
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-faint mb-2">Today’s plan</div>
            {todays.length ? (
              <div className="space-y-1.5">
                {todays.map((b) => (
                  <BlockChip
                    key={b.id}
                    b={b}
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
              <div className="text-sm text-mute">Nothing scheduled today — check the planner below.</div>
            )}
          </div>
        </div>
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Ring value={acc} size={64} stroke={6} label={`${Math.round(acc * 100)}%`} />
            <div>
              <div className="font-bold">Answer accuracy</div>
              <div className="text-xs text-mute">{checks.length} checks so far</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Past questions marked solved" v={`${solved}/${ALL_PYQ.length}`} />
            <Stat label="Papers in the vault" v={`${PAPERS.length}`} />
          </div>
          <div className="text-xs text-mute leading-relaxed border-t border-line pt-3">
            <b className="text-ink">How to use a topic tab:</b> read <i>Overview</i> → follow the <i>Approach</i> → play in the <i>Lab</i> until it’s automatic → solve <i>Past Questions</i> (answer first, then expand) → finish with <i>My Problems</i>.
          </div>
        </div>
      </div>

      <Section title="Your 12-day plan" sub="Customise anything: dates, hours per day, drag blocks between days, tick them off. Saved in this browser.">
        <Planner />
      </Section>

      <Section title="What the exam actually asks" sub="Every sub-question of 13 term finals (2007-08 → 2023-24), sorted by topic. Darker = more questions.">
        <Heatmap />
        <div className="grid cq-md:grid-cols-3 gap-3 mt-4 text-sm">
          <Insight title="Format since 2020-21">Two sections, 4 questions each, answer any 3 per section — roughly 46⅔ marks per question, ~30 minutes each.</Insight>
          <Insight title="Latest paper (2023-24)">Section A: virtual work, wind, earthquake, live-load reduction, DOSI/DOKI, building codes. Section B: portal, cantilever, wheel loads, truss, truss ILD, floor beam, Müller-Breslau.</Insight>
          <Insight title="Never skipped">Wheel loads, lateral loads (portal/cantilever) and influence lines appear in every recent paper. Wind has 11 parts in the last 3 papers alone.</Insight>
        </div>
      </Section>

      {(['B', 'A', 'X'] as const).map((g) => (
        <Section key={g} title={SECTION_LABEL[g]}>
          <div className="grid cq-sm:grid-cols-2 cq-lg:grid-cols-3 gap-3">
            {TOPICS.filter((x) => x.section === g).map((tp) => {
              const st = topicStats(attempts, tp.id)
              const n = ALL_PYQ.filter((q) => q.topics.includes(tp.id)).length
              return (
                <Link key={tp.id} to={`/topic/${tp.id}`} className="card p-4 hover:border-accent transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${tp.color} 15%, transparent)` }}>
                      <TopicIcon id={tp.id as TopicId} color={tp.color} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold group-hover:text-accent truncate">{tp.title}</div>
                      <div className="text-xs text-faint">
                        {n} past questions · ~{tp.hours} h
                      </div>
                    </div>
                    <Ring value={st.tried ? st.acc : 0} size={30} stroke={3.5} color={tp.color} />
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
    for (const q of ALL_PYQ) for (const tp of q.topics) m.set(`${tp}|${q.paper}`, (m.get(`${tp}|${q.paper}`) ?? 0) + 1)
    return m
  }, [])
  const max = Math.max(1, ...data.values())
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="text-xs border-separate border-spacing-[3px]">
        <thead>
          <tr>
            <th />
            {PAPERS.map((p) => (
              <th key={p.id} className="font-semibold text-faint px-1 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                <Link to={`/papers/${p.id}`} className="hover:text-accent">
                  {p.id === '2019-20' ? 'Jan 2021' : p.id}
                </Link>
              </th>
            ))}
            <th className="text-faint px-2">Σ</th>
          </tr>
        </thead>
        <tbody>
          {TOPICS.map((tp) => {
            const row = PAPERS.map((p) => data.get(`${tp.id}|${p.id}`) ?? 0)
            const sum = row.reduce((a, b) => a + b, 0)
            return (
              <tr key={tp.id}>
                <td className="pr-2 whitespace-nowrap">
                  <Link to={`/topic/${tp.id}`} className="hover:text-accent font-semibold">
                    {tp.short}
                  </Link>
                </td>
                {row.map((v, i) => (
                  <td key={i} className="w-7 h-6 text-center rounded num" style={{ background: v ? `color-mix(in oklab, ${tp.color} ${15 + (v / max) * 70}%, transparent)` : 'var(--c-panel2)', color: v ? 'var(--c-ink)' : 'transparent' }}>
                    {v || '·'}
                  </td>
                ))}
                <td className="text-center num font-bold">{sum}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
