// Admin threads inside the course: on a topic page (its Overview tab) and the course-wide ones on the course overview.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CLOUD } from '../cloud'
import { coursePath, isNew, markSeen, threadsForTopic, useAccount, useThreads, type Course, type Thread } from './api'
import { MdView } from './MdEditor'
import { mdPreview } from './preview'
import { ago, initialsOf, NewThread } from './ThreadsPage'
import { topicTag } from './topics'

/** threads tagged with this topic (count used for CE 301's tab badge) */
export function useTopicThreads(topic: string) {
  const s = useThreads()
  const list = s.status === 'ready' ? threadsForTopic(s.threads, topic) : []
  return { list, fresh: list.filter((t) => isNew(t, s.seen)).length }
}

export function TopicThreads({ topic, variant = 'overview' }: { topic: string; variant?: 'overview' | 'tab' }) {
  const tag = topicTag(topic)
  const s = useThreads()
  const { admin } = useAccount()
  const [composing, setComposing] = useState(false)
  const [justPosted, setJustPosted] = useState<string | null>(null)
  if (!CLOUD || !tag) return null
  const list = s.status === 'ready' ? threadsForTopic(s.threads, topic) : []
  if (variant === 'overview' && !list.length && !admin) return null
  if (variant === 'overview' && s.status !== 'ready') return null
  const tab = variant === 'tab'
  return (
    <section className={tab ? '' : 'mb-6'}>
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <h2 className={'font-extrabold ' + (tab ? 'text-lg' : 'text-base')}>💬 From the admins</h2>
        {list.length > 0 && <span className="chip !py-0 num">{list.length}</span>}
        {!tab && list.length === 0 && <span className="text-xs text-faint">Nothing posted for {tag.short} yet.</span>}
        {admin && !composing && (
          <button className="btn !py-0.5 !px-2.5 !text-xs ml-auto" onClick={() => setComposing(true)}>
            ＋ Post to {tag.short}
          </button>
        )}
      </div>
      {composing && (
        <NewThread
          course={tag.course}
          where={tag.course}
          topics={[topic]}
          draft={`thread-new-topic-${topic}`}
          onClose={() => setComposing(false)}
          onPosted={(id) => setJustPosted(id)}
        />
      )}
      {tab && s.status === 'loading' && <div className="text-sm text-mute">Loading…</div>}
      {tab && s.status === 'missing' && <div className="card p-5 text-sm text-mute">Threads aren't switched on yet.</div>}
      {tab && s.status === 'ready' && !list.length && !composing && (
        <div className="card p-6 text-sm text-mute text-center">Nothing posted for {tag.short} yet. Resources the admins share for this topic will show up here.</div>
      )}
      <div className="space-y-2.5">
        {list.map((t) => (
          <ThreadCard key={t.id} t={t} course={tag.course} startOpen={t.id === justPosted || (isNew(t, s.seen) && list.length <= 3) || (tab && list.length === 1)} />
        ))}
      </div>
    </section>
  )
}

function ThreadCard({ t, course, startOpen }: { t: Thread; course: Course; startOpen: boolean }) {
  const s = useThreads()
  const [open, setOpen] = useState(startOpen)
  const posts = s.posts.filter((p) => p.thread_id === t.id)
  const fresh = isNew(t, s.seen)
  useEffect(() => {
    if (open) markSeen(t)
  }, [open, t])
  return (
    <article className={'card overflow-hidden ' + (fresh ? 'border-accent/60' : '')}>
      <button className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-panel2/50 transition-colors" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="w-8 h-8 shrink-0 rounded-lg grid place-items-center bg-accent/12 text-accent">{t.pinned ? '📌' : '💬'}</span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-bold">{t.title}</span>
            {fresh && <span className="chip !border-accent !text-accent !py-0 !text-[10px]">NEW</span>}
          </span>
          {!open && posts[0] && <span className="block text-sm text-mute truncate">{mdPreview(posts[0].body, 160)}</span>}
          <span className="block text-[11px] text-faint mt-0.5">
            {t.author_name ?? 'admin'} · {posts.length} post{posts.length === 1 ? '' : 's'} · {ago(t.updated_at)}
          </span>
        </span>
        <span className={'text-faint transition-transform mt-1.5 ' + (open ? 'rotate-90' : '')}>›</span>
      </button>
      {open && (
        <div className="border-t border-line">
          {posts.map((p, i) => (
            <div key={p.id} className={'px-4 py-3 ' + (i ? 'border-t border-line border-dashed' : '')}>
              {posts.length > 1 && (
                <div className="flex items-center gap-2 text-[11px] text-faint mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-accent/15 text-accent grid place-items-center font-bold text-[9px]">{initialsOf(p.author_name)}</span>
                  <b className="text-mute">{p.author_name ?? 'admin'}</b> {ago(p.created_at)}
                  {p.edited_at && ' · edited'}
                </div>
              )}
              <MdView src={p.body} />
            </div>
          ))}
          <div className="px-4 py-2 border-t border-line text-right">
            <Link to={coursePath(course, `threads/${t.id}`)} className="text-xs text-accent hover:underline">
              Open thread →
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}

/** course-wide threads (not tagged with a topic) at the top of the course overview */
export function CourseThreads({ course }: { course: Course }) {
  const s = useThreads()
  if (!CLOUD || s.status !== 'ready') return null
  const list = s.threads
    .filter((t) => (t.course === course || t.course === 'all') && !(t.topics ?? []).length)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated_at.localeCompare(a.updated_at))
  if (!list.length) return null
  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-extrabold text-base">💬 From the admins</h2>
        <Link to={coursePath(course, 'threads')} className="ml-auto text-xs text-accent hover:underline">
          All threads →
        </Link>
      </div>
      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {list.slice(0, 3).map((t) => {
          const first = s.posts.find((p) => p.thread_id === t.id)
          return (
            <Link key={t.id} to={coursePath(course, `threads/${t.id}`)} className={'card px-3.5 py-2.5 hover:border-accent transition-colors ' + (isNew(t, s.seen) ? 'border-accent/60' : '')}>
              <div className="flex items-center gap-2 text-[11px] text-faint">
                <span>{t.pinned ? '📌' : '💬'}</span>
                <span>{ago(t.updated_at)}</span>
                {isNew(t, s.seen) && <span className="text-accent font-bold">NEW</span>}
              </div>
              <div className="font-bold text-sm truncate">{t.title}</div>
              {first && <div className="text-xs text-mute truncate">{mdPreview(first.body, 120)}</div>}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
