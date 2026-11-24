// One field work: Learn (notes, procedure, submission, traps, what to carry), Field book, Quiz, Maths, Viva.
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TopicThreads } from '../../account/TopicThreads'
import { Md, Tabs } from '../../components/ui'
import { useStore } from '../../store'
import { cardsFor, questionsFor, qKey, SV_LEARN } from '../content'
import { Flashcards } from '../components/Flashcards'
import { SvTopicIcon } from '../components/icons'
import { kindsFor } from '../field/kinds'
import { DRILLS } from '../drills/gens'
import { SV_SCHEDULE } from '../plan'
import { svTopicById } from '../registry'
import { DrillDeck } from './SvDrills'
import { NewSheetButtons, SheetList } from './SvField'
import { QuizArena } from './SvQuiz'
import { deckOf } from './SvViva'

type Tab = 'learn' | 'field' | 'quiz' | 'maths' | 'viva'

const day = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

export default function SvTopicPage() {
  const { id = '', tab } = useParams()
  const nav = useNavigate()
  const t = svTopicById(id)
  const attempts = useStore((s) => s.attempts)
  const qs = useMemo(() => questionsFor(id), [id])
  const deck = useMemo(() => deckOf(id), [id])
  if (!t) return <div className="card p-6">No such topic.</div>
  const learn = SV_LEARN[t.id]
  const kinds = kindsFor(t.id)
  const drills = DRILLS.filter((d) => d.topic === t.id)
  const right = qs.filter((q) => attempts[qKey(q)]?.correct).length
  const cur = (tab as Tab) || 'learn'
  const items: { v: Tab; label: string; badge?: React.ReactNode }[] = [
    { v: 'learn', label: 'Learn' },
    ...(kinds.length ? [{ v: 'field' as Tab, label: 'Field book' }] : []),
    { v: 'quiz', label: 'Quiz', badge: <span className="num text-[10px] text-faint">{qs.length}</span> },
    ...(drills.length ? [{ v: 'maths' as Tab, label: 'Maths', badge: <span className="num text-[10px] text-faint">{drills.length}</span> }] : []),
    { v: 'viva', label: 'Viva', badge: <span className="num text-[10px] text-faint">{cardsFor(t.id).length}</span> },
  ]
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 shrink-0 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${t.color} 16%, transparent)` }}>
          <SvTopicIcon id={t.id} color={t.color} size={24} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold leading-tight">{t.title}</h1>
          <p className="text-sm text-mute mt-1 max-w-3xl">{t.blurb}</p>
          <div className="flex flex-wrap gap-1.5 mt-2 text-[11px]">
            {t.days.map((d) => (
              <span key={d} className="chip">
                🗓 {day(d)}
              </span>
            ))}
            <span className="chip">
              {right}/{qs.length} questions right
            </span>
          </div>
        </div>
      </div>
      <Tabs value={cur} onChange={(v) => nav(`/ce104/topic/${t.id}/${v}`)} items={items} />

      {cur === 'learn' && (
        <>
          <TopicThreads topic={t.id} />
          {learn ? <Learn id={t.id} /> : <div className="text-faint">Notes coming.</div>}
        </>
      )}
      {cur === 'field' && (
        <div className="space-y-6">
          {kinds.map((k) => (
            <div key={k.kind} className="space-y-2">
              <div className="font-bold">{k.label}</div>
              <div className="text-sm text-mute">{k.does}.</div>
              <NewSheetButtons kind={k.kind} />
              <SheetList kind={k.kind} />
            </div>
          ))}
        </div>
      )}
      {cur === 'quiz' && <QuizArena lockTopic={t.id} />}
      {cur === 'maths' && <DrillDeck topic={t.id} lock />}
      {cur === 'viva' && <Flashcards pool={deck} />}
    </div>
  )
}

function Learn({ id }: { id: string }) {
  const l = SV_LEARN[id as keyof typeof SV_LEARN]!
  const today = new Date().toISOString().slice(0, 10)
  const onToday = SV_SCHEDULE.find((d) => d.date === today)?.topics.includes(id as never)
  const kinds = kindsFor(id)
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4 min-w-0">
        {onToday && kinds.length > 0 && (
          <div className="card p-4 border-accent/60">
            <div className="text-xs font-bold text-accent uppercase tracking-wider">This is today’s field work</div>
            <div className="text-sm mt-1">Open a field-book sheet and type the readings as you take them — it checks the book for you.</div>
            <NewSheetButtons kind={kinds[0].kind} />
          </div>
        )}
        {l.steps && l.steps.length > 0 && (
          <section className="card p-4">
            <h2 className="font-bold mb-2">In the field — step by step</h2>
            <ol className="space-y-1.5">
              {l.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[15px]">
                  <span className="num text-xs font-bold text-bg bg-accent rounded-full w-5 h-5 grid place-items-center shrink-0 mt-0.5">{i + 1}</span>
                  <div className="min-w-0">
                    <Md>{s}</Md>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
        {l.notes.map((s, i) => (
          <section key={i} className="card p-4">
            <h2 className="font-bold mb-2">{s.title}</h2>
            <Md>{s.md}</Md>
            {s.Fig && <s.Fig />}
          </section>
        ))}
      </div>
      <div className="space-y-4">
        {l.submit && <Side title="Hand in" icon="📄" items={l.submit} />}
        {l.traps && <Side title="Marks lost for" icon="⚠" items={l.traps} tone="text-bad" />}
        {l.carry && <Side title="Carry" icon="🎒" items={l.carry} />}
      </div>
    </div>
  )
}

function Side({ title, icon, items, tone }: { title: string; icon: string; items: string[]; tone?: string }) {
  return (
    <section className="card p-4">
      <h3 className={'font-bold mb-2 ' + (tone ?? '')}>
        {icon} {title}
      </h3>
      <ul className="space-y-1.5 text-sm">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-faint">•</span>
            <div className="min-w-0">
              <Md>{s}</Md>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
