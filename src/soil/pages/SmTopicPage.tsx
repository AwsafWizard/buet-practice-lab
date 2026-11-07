import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Boundary } from '../../components/QuestionCard'
import { Ring, Tabs } from '../../components/ui'
import { topicStats, useStore, type SmTopicId } from '../../store'
import { TopicIcon } from '../../topics/icons'
import { SmQuestionCard } from '../components/SmQuestionCard'
import { TheoryList } from '../components/TheoryList'
import { smQForTopic } from '../pyq'
import { smTopicById } from '../registry'
import { SM_MODULES } from '../topics/modules'
import { SM_PAPERS, type SmTopicModule } from '../types'

type Tab = 'overview' | 'approach' | 'lab' | 'theory' | 'pyq' | 'own'

export default function SmTopicPage() {
  const { id = 'sm-doubly', tab = 'overview' } = useParams()
  const nav = useNavigate()
  const meta = smTopicById(id)
  const [mod, setMod] = useState<SmTopicModule | null>(null)
  const attempts = useStore((s) => s.attempts)
  const qStatus = useStore((s) => s.qStatus)
  useEffect(() => {
    setMod(null)
    SM_MODULES[id as SmTopicId]?.().then(setMod)
  }, [id])
  const pyqs = useMemo(() => smQForTopic(id), [id])
  if (!meta) return <div>Unknown topic</div>
  const st = topicStats(attempts, id)
  const solved = pyqs.filter((q) => qStatus[q.id] === 'solved').length
  const setTab = (t: Tab) => nav(`/ce341/topic/${id}/${t}`)
  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl grid place-items-center" style={{ background: `color-mix(in oklab, ${meta.color} 16%, transparent)` }}>
          <TopicIcon id={meta.id} color={meta.color} size={30} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold">{meta.title}</h1>
          <p className="text-sm text-mute">{meta.blurb}</p>
        </div>
        <div className="hidden cq-sm:flex items-center gap-3">
          <div className="text-right text-xs text-mute">
            <div>
              <span className="num text-ink font-semibold">{solved}</span>/{pyqs.length} past questions solved
            </div>
            <div>
              <span className="num text-ink font-semibold">{st.correct}</span>/{st.tried} checks correct
            </div>
          </div>
          <Ring value={st.tried ? st.acc : 0} size={46} stroke={5} color={meta.color} label={st.tried ? `${Math.round(st.acc * 100)}` : '–'} />
        </div>
      </div>
      {meta.note && <div className="mb-4 rounded-xl border border-load/40 bg-load/10 px-4 py-2.5 text-sm">⚑ {meta.note}</div>}
      <div className="mb-5 sticky top-14 z-10 py-2 -mx-1 px-1 bg-bg/85 backdrop-blur">
        <Tabs<Tab>
          value={tab as Tab}
          onChange={setTab}
          items={[
            { v: 'overview', label: 'Overview' },
            { v: 'approach', label: 'Approach' },
            { v: 'lab', label: '🧪 Lab' },
            { v: 'theory', label: 'Theory', badge: mod ? <span className="chip !py-0 num">{mod.theory.length}</span> : null },
            { v: 'pyq', label: 'Past questions', badge: <span className="chip !py-0 num">{pyqs.length}</span> },
            { v: 'own', label: 'My problems', badge: mod ? <span className="chip !py-0 num">{mod.problems.length}</span> : null },
          ]}
        />
      </div>
      {!mod ? (
        <div className="text-mute">Loading topic…</div>
      ) : (
        <Boundary label={tab}>
          {tab === 'overview' && <mod.Overview />}
          {tab === 'approach' && <mod.Approach />}
          {tab === 'lab' && <mod.Lab />}
          {tab === 'theory' && <TheoryList items={mod.theory} />}
          {tab === 'pyq' && <PYQList topic={id} />}
          {tab === 'own' && (
            <div className="space-y-3">
              <p className="text-sm text-mute">Practice problems in exam style, from warm-up to challenge. Answer first, then expand.</p>
              {mod.problems.map((q) => (
                <SmQuestionCard key={q.id} q={q} topic={id} />
              ))}
              {!mod.problems.length && <div className="text-mute text-sm">None yet.</div>}
            </div>
          )}
        </Boundary>
      )}
    </div>
  )
}

function PYQList({ topic }: { topic: string }) {
  const all = useMemo(() => smQForTopic(topic), [topic])
  const qStatus = useStore((s) => s.qStatus)
  const [filter, setFilter] = useState<'all' | 'num' | 'theory' | 'todo' | 'review'>('all')
  const order = SM_PAPERS.map((p) => p.id as string)
  const list = all
    .filter((q) => {
      if (filter === 'num') return !q.theory
      if (filter === 'theory') return q.theory
      if (filter === 'todo') return (qStatus[q.id] ?? 'todo') !== 'solved'
      if (filter === 'review') return qStatus[q.id] === 'review'
      return true
    })
    .sort((a, b) => order.indexOf(a.paper) - order.indexOf(b.paper))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Newest first.</span>
        {(
          [
            ['all', `All (${all.length})`],
            ['num', 'Numerical'],
            ['theory', 'Theory'],
            ['todo', 'Not solved yet'],
            ['review', 'Marked for review'],
          ] as const
        ).map(([f, label]) => (
          <button key={f} className={'btn !py-0.5 !px-2.5 !text-xs ' + (filter === f ? '!border-accent text-accent' : '')} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
      </div>
      {list.map((q) => (
        <SmQuestionCard key={q.id} q={q} topic={topic} />
      ))}
      {!list.length && <div className="text-mute text-sm">Nothing here yet.</div>}
    </div>
  )
}
