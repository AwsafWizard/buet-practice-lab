import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Ring, Section } from '../../components/ui'
import { BlockChip, Planner, usePlanner } from '../../pages/planner/Planner'
import { pack } from '../../pages/planner/template'
import { today, topicStats, useStore } from '../../store'
import { TopicIcon } from '../../topics/icons'
import { RC_EXAM_DATE } from '../plan'
import { RC_ALL } from '../pyq'
import { RC_SECTION_LABEL, RC_TOPICS } from '../registry'
import { RC_PAPERS } from '../types'

export default function RcOverview() {
  const [p, setP] = usePlanner('ce315')
  const map = useMemo(() => pack(p), [p])
  const t = today()
  const todays = map.get(t) ?? []
  const attempts = useStore((s) => s.attempts)
  const qStatus = useStore((s) => s.qStatus)
  const solved = RC_ALL.filter((q) => qStatus[q.id] === 'solved').length
  const checks = Object.entries(attempts).filter(([k]) => k.startsWith('rc-'))
  const acc = checks.length ? checks.filter(([, a]) => a.correct).length / checks.length : 0
  const days = Math.max(0, Math.ceil((new Date(RC_EXAM_DATE + 'T09:00:00').getTime() - Date.now()) / 86400000))
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="grid cq-lg:grid-cols-[1.5fr_1fr] gap-5 mb-5">
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-8 opacity-[0.08]">
            <svg width="220" height="220" viewBox="0 0 24 24">
              <rect x="6" y="2" width="12" height="20" rx="1" fill="none" stroke="var(--c-accent)" strokeWidth={0.6} />
              <path d="M6 7 H18 M6 12 H18 M6 17 H18" stroke="var(--c-accent)" strokeWidth={0.3} strokeDasharray="0.6 0.6" />
              {[9, 12, 15].map((x) => (
                <circle key={x} cx={x} cy={19} r={0.9} fill="var(--c-accent)" />
              ))}
            </svg>
          </div>
          <div className="text-sm text-mute">{greet} 👋</div>
          <h1 className="text-2xl cq-md:text-3xl font-extrabold mt-1">
            <span className="text-accent num">{days}</span> day{days === 1 ? '' : 's'} to CE 315
          </h1>
          <p className="text-mute mt-1 text-sm">Term final on Thursday, 5 November. Section A is flexure, Section B is shear, bond and slabs; answer 3 of 4 in each.</p>
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-faint mb-2">Today’s plan</div>
            {todays.length ? (
              <div className="space-y-1.5">
                {todays.map((b) => (
                  <BlockChip
                    key={b.id}
                    b={b}
                    course="ce315"
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
              <div className="text-sm text-mute">Nothing scheduled today. Check the planner below.</div>
            )}
          </div>
        </div>
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Ring value={acc} size={64} stroke={6} label={`${Math.round(acc * 100)}%`} />
            <div>
              <div className="font-bold">Answer accuracy</div>
              <div className="text-xs text-mute">{checks.length} CE 315 checks so far</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Past questions marked solved" v={`${solved}/${RC_ALL.length}`} />
            <Stat label="Papers in the vault" v={`${RC_PAPERS.length}`} />
          </div>
          <div className="text-xs text-mute leading-relaxed border-t border-line pt-3">
            <b className="text-ink">Each topic:</b> <i>Approach</i> (recipe + which-case chart) → <i>Lab</i> (pick every value or 🎲, fill the checkpoints) → <i>Theory</i> → <i>Past questions</i>. Press <kbd className="chip !py-0">T</kbd> for the code pane.
          </div>
        </div>
      </div>

      <Section title="Your plan to 5 November" sub="8 hours a day, 4 November kept for a mock and revision. Drag blocks between days, change hours, tick them off.">
        <Planner course="ce315" />
      </Section>

      <Section title="What the exam actually asks" sub={`${RC_ALL.length} sub-questions from ${RC_PAPERS.length} term finals (2002-03 → 2023-24). Darker = more parts.`}>
        <Heatmap />
        <div className="grid cq-md:grid-cols-3 gap-3 mt-4 text-sm">
          <Insight title="In every paper">An elastic-analysis part (cracked section or the stage sketch), a doubly reinforced design or review, a T-beam, a stirrup design, bond theory and a one-way slab.</Insight>
          <Insight title="Two-way slabs">In every paper since 2020-21: a corner or edge panel by Tables 12.3–12.6, plus corner reinforcement or load on the beams.</Insight>
          <Insight title="Theory ≈ 28%">Temperature & shrinkage steel (18 of 19 papers), factors affecting ld (15), stress–strain stages (13), splices (12), cut-off rules (11), under- vs over-reinforced (10).</Insight>
        </div>
      </Section>

      {(['A', 'B'] as const).map((g) => (
        <Section key={g} title={RC_SECTION_LABEL[g]}>
          <div className="grid cq-sm:grid-cols-2 cq-lg:grid-cols-3 gap-3">
            {RC_TOPICS.filter((x) => x.section === g).map((tp) => {
              const st = topicStats(attempts, tp.id)
              const n = RC_ALL.filter((q) => q.topics.includes(tp.id)).length
              return (
                <Link key={tp.id} to={`/ce315/topic/${tp.id}`} className="card p-4 hover:border-accent transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${tp.color} 15%, transparent)` }}>
                      <TopicIcon id={tp.id} color={tp.color} size={22} />
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
    for (const q of RC_ALL) for (const tp of q.topics) m.set(`${tp}|${q.paper}`, (m.get(`${tp}|${q.paper}`) ?? 0) + 1)
    return m
  }, [])
  const max = Math.max(1, ...data.values())
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="text-xs border-separate border-spacing-[3px]">
        <thead>
          <tr>
            <th />
            {RC_PAPERS.map((p) => (
              <th key={p.id} className="font-semibold text-faint px-1 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                <Link to={`/ce315/papers/${p.id}`} className="hover:text-accent">
                  {p.label}
                </Link>
              </th>
            ))}
            <th className="text-faint px-2">Σ</th>
          </tr>
        </thead>
        <tbody>
          {RC_TOPICS.map((tp) => {
            const row = RC_PAPERS.map((p) => data.get(`${tp.id}|${p.id}`) ?? 0)
            const sum = row.reduce((a, b) => a + b, 0)
            return (
              <tr key={tp.id}>
                <td className="pr-2 whitespace-nowrap">
                  <Link to={`/ce315/topic/${tp.id}`} className="hover:text-accent font-semibold">
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
