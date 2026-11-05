import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Ring, Section } from '../../components/ui'
import { BlockChip, Planner, usePlanner } from '../../pages/planner/Planner'
import { pack } from '../../pages/planner/template'
import { today, topicStats, useStore } from '../../store'
import { TopicIcon } from '../../topics/icons'
import { SM_EXAM_DATE } from '../plan'
import { SM_ALL } from '../pyq'
import { SM_SECTION_LABEL, SM_TOPICS } from '../registry'
import { SM_PAPERS } from '../types'

export default function SmOverview() {
  const [p, setP] = usePlanner('ce341')
  const map = useMemo(() => pack(p), [p])
  const t = today()
  const todays = map.get(t) ?? []
  const attempts = useStore((s) => s.attempts)
  const qStatus = useStore((s) => s.qStatus)
  const solved = SM_ALL.filter((q) => qStatus[q.id] === 'solved').length
  const checks = Object.entries(attempts).filter(([k]) => k.startsWith('sm-'))
  const acc = checks.length ? checks.filter(([, a]) => a.correct).length / checks.length : 0
  const days = Math.max(0, Math.ceil((new Date(SM_EXAM_DATE + 'T09:00:00').getTime() - Date.now()) / 86400000))
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="grid cq-lg:grid-cols-[1.5fr_1fr] gap-5 mb-5">
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-8 opacity-[0.08]">
            <svg width="220" height="220" viewBox="0 0 24 24">
              <rect x="8" y="3" width="8" height="3" fill="none" stroke="var(--c-accent)" strokeWidth={0.6} />
              {[6, 9, 12.5, 16.5].map((r) => (
                <path key={r} d={`M${12 - r} 6 a${r} ${r * 0.9} 0 0 0 ${2 * r} 0`} fill="none" stroke="var(--c-accent)" strokeWidth={0.4} />
              ))}
            </svg>
          </div>
          <div className="text-sm text-mute">{greet} 👋</div>
          <h1 className="text-2xl cq-md:text-3xl font-extrabold mt-1">
            <span className="text-accent num">{days}</span> day{days === 1 ? '' : 's'} to CE 341
          </h1>
          <p className="text-mute mt-1 text-sm">Term final on Thursday, 12 November. Section A is AJK sir’s half (index properties, classification, shear strength, earth pressure), Section B is SJMY sir’s (compaction, water flow, consolidation, stress distribution); answer 3 of 4 in each.</p>
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-faint mb-2">Today’s plan</div>
            {todays.length ? (
              <div className="space-y-1.5">
                {todays.map((b) => (
                  <BlockChip
                    key={b.id}
                    b={b}
                    course="ce341"
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
              <div className="text-xs text-mute">{checks.length} CE 341 checks so far</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Past questions marked solved" v={`${solved}/${SM_ALL.length}`} />
            <Stat label="Papers in the vault" v={`${SM_PAPERS.length}`} />
          </div>
          <div className="text-xs text-mute leading-relaxed border-t border-line pt-3">
            <b className="text-ink">Each topic:</b> <i>Approach</i> (recipe + which-case chart) → <i>Lab</i> (pick every value or 🎲, fill the checkpoints) → <i>Theory</i> → <i>Past questions</i>. Press <kbd className="chip !py-0">T</kbd> for the chart pane.
          </div>
        </div>
      </div>

      <Section title="Your plan to 12 November" sub="8 hours a day, Section A first, 11 November kept for a mock and revision. Drag blocks between days, change hours, tick them off.">
        <Planner course="ce341" />
      </Section>

      <Section title="What the exam actually asks" sub={`${SM_ALL.length} sub-questions from ${SM_PAPERS.length} term finals (2007-08 → 2023-24). Darker = more parts.`}>
        <Heatmap />
        <div className="grid cq-md:grid-cols-3 gap-3 mt-4 text-sm">
          <Insight title="2023-24 Section A = AJK sir">Phase relations of a test specimen, phase diagrams at PL and LL, Rankine with surcharge and water table, a CU triaxial, sieve → AASHTO / USCS, cup LL. None of the older Coulomb, vane or Skempton items.</Insight>
          <Insight title="Every recent Section B">A flow net (sheet pile or dam), a settlement or time-rate numerical, a Newmark / Fadum / Osterberg chart question, a compaction or borrow-pit problem, and the ZAV / sand cone theory.</Insight>
          <Insight title="Theory ≈ 42%">Compaction curves and the ZAV line (8 papers), piping and its remedies (8), the consolidation theory (5), soil structures (4), the field e–log p curve (3), circle vs square vs strip footings (3), sand cone (2 of the last 3).</Insight>
        </div>
      </Section>

      {(['A', 'B'] as const).map((g) => (
        <Section key={g} title={SM_SECTION_LABEL[g]}>
          <div className="grid cq-sm:grid-cols-2 cq-lg:grid-cols-3 gap-3">
            {SM_TOPICS.filter((x) => x.section === g).map((tp) => {
              const st = topicStats(attempts, tp.id)
              const n = SM_ALL.filter((q) => q.topics.includes(tp.id)).length
              return (
                <Link key={tp.id} to={`/ce341/topic/${tp.id}`} className="card p-4 hover:border-accent transition-colors group">
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
    for (const q of SM_ALL) for (const tp of q.topics) m.set(`${tp}|${q.paper}`, (m.get(`${tp}|${q.paper}`) ?? 0) + 1)
    return m
  }, [])
  const max = Math.max(1, ...data.values())
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="text-xs border-separate border-spacing-[3px]">
        <thead>
          <tr>
            <th />
            {SM_PAPERS.map((p) => (
              <th key={p.id} className="font-semibold text-faint px-1 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                <Link to={`/ce341/papers/${p.id}`} className="hover:text-accent">
                  {p.label}
                </Link>
              </th>
            ))}
            <th className="text-faint px-2">Σ</th>
          </tr>
        </thead>
        <tbody>
          {SM_TOPICS.map((tp) => {
            const row = SM_PAPERS.map((p) => data.get(`${tp.id}|${p.id}`) ?? 0)
            const sum = row.reduce((a, b) => a + b, 0)
            return (
              <tr key={tp.id}>
                <td className="pr-2 whitespace-nowrap">
                  <Link to={`/ce341/topic/${tp.id}`} className="hover:text-accent font-semibold">
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
