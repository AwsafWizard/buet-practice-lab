import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Boundary, QuestionCard } from '../components/QuestionCard'
import { Ring, Tabs } from '../components/ui'
import { pyqForTopic } from '../pyq'
import { PAPERS } from '../pyq/types'
import { topicStats, useStore, type TopicId } from '../store'
import { TopicIcon } from '../topics/icons'
import { MODULES, type TopicModule } from '../topics/modules'
import { topicById } from '../topics/registry'

type Tab = 'overview' | 'approach' | 'lab' | 'pyq' | 'own'

export default function TopicPage() {
  const { id = 'frames', tab = 'overview' } = useParams()
  const nav = useNavigate()
  const meta = topicById(id)
  const [mod, setMod] = useState<TopicModule | null>(null)
  const attempts = useStore((s) => s.attempts)
  const qStatus = useStore((s) => s.qStatus)
  useEffect(() => {
    setMod(null)
    MODULES[id as TopicId]?.().then(setMod)
  }, [id])
  const pyqs = useMemo(() => pyqForTopic(id), [id])
  if (!meta) return <div>Unknown topic</div>
  const st = topicStats(attempts, id)
  const solved = pyqs.filter((q) => qStatus[q.id] === 'solved').length
  const setTab = (t: Tab) => nav(`/topic/${id}/${t}`)
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
      <div className="mb-5 sticky top-14 z-10 py-2 -mx-1 px-1 bg-bg/85 backdrop-blur">
        <Tabs<Tab>
          value={tab as Tab}
          onChange={setTab}
          items={[
            { v: 'overview', label: 'Overview' },
            { v: 'approach', label: 'Approach' },
            { v: 'lab', label: '🧪 Lab' },
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
          {tab === 'pyq' && <PYQList topic={id} />}
          {tab === 'own' && (
            <div className="space-y-3">
              <p className="text-sm text-mute">Original problems in exam style, from warm-up to challenge. Same drill: answer first, then expand.</p>
              {mod.problems.map((q) => (
                <QuestionCard key={q.id} q={q} topic={id} />
              ))}
            </div>
          )}
        </Boundary>
      )}
    </div>
  )
}

function PYQList({ topic }: { topic: string }) {
  const all = useMemo(() => pyqForTopic(topic), [topic])
  const qStatus = useStore((s) => s.qStatus)
  const [filter, setFilter] = useState<'all' | 'todo' | 'review'>('all')
  const order = PAPERS.map((p) => p.id).reverse()
  const list = all
    .filter((q) => filter === 'all' || (filter === 'todo' ? (qStatus[q.id] ?? 'todo') !== 'solved' : qStatus[q.id] === 'review'))
    .sort((a, b) => order.indexOf(a.paper as never) - order.indexOf(b.paper as never))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Newest first.</span>
        {(['all', 'todo', 'review'] as const).map((f) => (
          <button key={f} className={'btn !py-0.5 !px-2.5 !text-xs ' + (filter === f ? '!border-accent text-accent' : '')} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${all.length})` : f === 'todo' ? 'Not solved yet' : 'Marked for review'}
          </button>
        ))}
      </div>
      {list.map((q) => (
        <QuestionCard key={q.id} q={q} topic={topic} />
      ))}
      {!list.length && <div className="text-mute text-sm">Nothing here.</div>}
    </div>
  )
}
