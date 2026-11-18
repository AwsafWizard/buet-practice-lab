// Threads: resources and notes posted by the admins, per course ("All courses" threads show everywhere).
// Anyone can read, signed in or not; admins post, edit, pin and delete (checked by the database too).
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { courseOf } from '../App'
import { CLOUD } from '../cloud'
import {
  addPost,
  COURSE_NAME,
  coursePath,
  createThread,
  deletePost,
  deleteThread,
  isNew,
  markSeen,
  updatePost,
  updateThread,
  useAccount,
  useThreads,
  threadsFor,
  type Course,
  type Post,
  type Thread,
  type ThreadCourse,
} from './api'
import { mdPreview } from './markdown'
import { clearDraft, loadDraft, MdEditor, MdView } from './MdEditor'
import { TagPicker, TopicChips } from './TagPicker'
import { tagsFor, topicTag } from './topics'

const COURSES: ThreadCourse[] = ['all', 'ce331', 'ce301', 'ce341', 'ce315', 'ce311']

export function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: s > 86400 * 300 ? 'numeric' : undefined })
}
/** "Awsaf Rahman" → "AR"; a student ID → its last three digits */
const initials = (name: string | null) => {
  const n = (name ?? 'admin').trim()
  if (/^\d+$/.test(n)) return n.slice(-3)
  return n
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
export const initialsOf = initials
const fullDate = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export default function ThreadsPage() {
  const { pathname } = useLocation()
  const course = courseOf(pathname) as Course
  const { tid } = useParams()
  if (!CLOUD)
    return (
      <Shell course={course}>
        <div className="card p-6 text-sm text-mute">Threads live on the website (tf-practice-dashboard.vercel.app). This copy of the app has no connection to them.</div>
      </Shell>
    )
  return tid ? <ThreadView course={course} id={tid} /> : <ThreadList course={course} />
}

function Shell({ course, children, right }: { course: Course; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <h1 className="text-2xl font-extrabold">Threads</h1>
          <p className="text-sm text-mute">Resources, notes and announcements from the admins for {COURSE_NAME[course]}, plus the ones for all courses.</p>
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

function useStatusBlock() {
  const s = useThreads()
  const { admin } = useAccount()
  if (s.status === 'loading')
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-4 w-1/3 bg-line rounded mb-2" />
            <div className="h-3 w-2/3 bg-line/70 rounded" />
          </div>
        ))}
      </div>
    )
  if (s.status === 'missing')
    return (
      <div className="card p-6 text-sm text-mute">
        Threads aren't switched on yet.
        {admin && ' Run supabase/accounts.sql in the Supabase SQL editor once to create them.'}
      </div>
    )
  if (s.status === 'error') return <div className="card p-6 text-sm text-bad">Couldn't load Threads. Check your connection and reload.</div>
  return null
}

// ─────────────────────────────────────────────────────────────── list
function ThreadList({ course }: { course: Course }) {
  const s = useThreads()
  const { admin } = useAccount()
  const [q, setQ] = useState('')
  const [topic, setTopic] = useState('')
  const [composing, setComposing] = useState(() => !!loadDraft(`thread-new-${course}`) || !!loadDraft(`thread-new-${course}-title`))
  const statusBlock = useStatusBlock()
  const list = useMemo(() => {
    const all = threadsFor(s.threads, course, (id) => topicTag(id)?.course).filter((t) => !topic || (topic === '-' ? !(t.topics ?? []).length : (t.topics ?? []).includes(topic)))
    const needle = q.trim().toLowerCase()
    if (!needle) return all
    return all.filter((t) => t.title.toLowerCase().includes(needle) || s.posts.some((p) => p.thread_id === t.id && p.body.toLowerCase().includes(needle)))
  }, [s.threads, s.posts, course, q, topic])
  // topics that have at least one thread, for the filter
  const usedTopics = useMemo(
    () => tagsFor(course).filter((tg) => s.threads.some((t) => (t.topics ?? []).includes(tg.id))),
    [s.threads, course],
  )
  const postsOf = (t: Thread) => s.posts.filter((p) => p.thread_id === t.id)

  return (
    <Shell
      course={course}
      right={
        admin &&
        s.status === 'ready' &&
        !composing && (
          <button className="btn btn-primary" onClick={() => setComposing(true)}>
            ＋ New thread
          </button>
        )
      }
    >
      {composing && admin && <NewThread course={course} where={course} onClose={() => setComposing(false)} />}
      {statusBlock ?? (
        <>
          {(s.threads.length > 3 || usedTopics.length > 0) && (
            <div className="flex gap-2 flex-wrap mb-4">
              {s.threads.length > 3 && <input className="field flex-1 min-w-[200px] max-w-sm !font-sans" placeholder="Search threads…" value={q} onChange={(e) => setQ(e.target.value)} />}
              {usedTopics.length > 0 && (
                <select className="field !font-sans" value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Filter by topic">
                  <option value="">Every topic</option>
                  <option value="-">Not tagged (course-wide)</option>
                  {usedTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      # {t.short}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          {list.length === 0 ? (
            <div className="card p-8 text-center text-sm text-mute">
              {q ? 'No thread matches that.' : admin ? 'Nothing posted for this course yet. Start the first thread.' : 'Nothing posted for this course yet. Check back later.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {list.map((t) => {
                const posts = postsOf(t)
                const fresh = isNew(t, s.seen)
                return (
                  <Link key={t.id} to={coursePath(course, `threads/${t.id}`)} className="card p-4 flex gap-3 hover:border-accent transition-colors group">
                    <div className="w-9 h-9 shrink-0 rounded-lg grid place-items-center bg-accent/12 text-accent text-base">{t.pinned ? '📌' : '💬'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold group-hover:text-accent transition-colors">{t.title}</span>
                        {fresh && <span className="chip !border-accent !text-accent !py-0 !text-[10px]">NEW</span>}
                        {t.course === 'all' && <span className="chip !py-0 !text-[10px]">All courses</span>}
                        <TopicChips ids={t.topics ?? []} link={false} small />
                      </div>
                      {posts[0] && <div className="text-sm text-mute mt-0.5 line-clamp-2">{mdPreview(posts[0].body)}</div>}
                      <div className="text-[11px] text-faint mt-1.5">
                        {t.author_name ?? 'admin'} · {posts.length} post{posts.length === 1 ? '' : 's'} · updated {ago(t.updated_at)}
                      </div>
                    </div>
                    <span className="self-center text-faint group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </Shell>
  )
}

/** new-thread form; from a topic page it starts tagged with that topic and stays on the page after posting */
export function NewThread({
  course,
  where: startWhere,
  topics: startTopics = [],
  draft = `thread-new-${course}`,
  onClose,
  onPosted,
}: {
  course: Course
  where: ThreadCourse
  topics?: string[]
  draft?: string
  onClose: () => void
  onPosted?: (id: string) => void
}) {
  const key = draft
  const nav = useNavigate()
  const [title, setTitle] = useState(() => loadDraft(key + '-title'))
  const [where, setWhereRaw] = useState<ThreadCourse>(startWhere)
  const [topics, setTopics] = useState<string[]>(startTopics)
  // moving the thread to another course drops tags that course doesn't have
  const setWhere = (c: ThreadCourse) => {
    setWhereRaw(c)
    const ok = new Set(tagsFor(c).map((t) => t.id))
    setTopics((ts) => ts.filter((id) => ok.has(id)))
  }
  const [body, setBody] = useState(() => loadDraft(key))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    try {
      if (title) localStorage.setItem('draft:' + key + '-title', title)
      else localStorage.removeItem('draft:' + key + '-title')
    } catch {
      /* storage blocked */
    }
  }, [title, key])
  const discard = () => {
    if ((title || body) && !confirm('Discard this draft?')) return
    clearDraft(key)
    clearDraft(key + '-title')
    onClose()
  }
  return (
    <form
      className="card p-4 mb-5 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!title.trim() || !body.trim()) return setErr('Add a title and some text.')
        setBusy(true)
        setErr(null)
        try {
          const id = await createThread(where, title, body, topics)
          clearDraft(key)
          clearDraft(key + '-title')
          onClose()
          if (onPosted) onPosted(id)
          else nav(coursePath(course, `threads/${id}`))
        } catch (e) {
          setErr((e as Error).message)
        } finally {
          setBusy(false)
        }
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div className="font-bold mr-auto">New thread</div>
        <label className="text-sm text-mute flex items-center gap-2">
          Show in
          <select className="field !font-sans" value={where} onChange={(e) => setWhere(e.target.value as ThreadCourse)}>
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {COURSE_NAME[c]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <input className="field w-full !font-sans !text-base !py-2 font-semibold" placeholder="Title, e.g. Wind load slides + worked examples" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <TagPicker course={where} value={topics} onChange={setTopics} />
      <MdEditor value={body} onChange={setBody} draftKey={key} placeholder={'Write the first post in Markdown.\n\nLinks, tables, $maths$, checklists… Paste or drop PDFs and images to attach them.'} />
      {err && <div className="text-sm text-bad">{err}</div>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn" onClick={discard}>
          Discard
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Posting…' : 'Post thread'}
        </button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────── one thread
function ThreadView({ course, id }: { course: Course; id: string }) {
  const s = useThreads()
  const { admin } = useAccount()
  const nav = useNavigate()
  const statusBlock = useStatusBlock()
  const t = s.threads.find((x) => x.id === id)
  const posts = s.posts.filter((p) => p.thread_id === id)
  useEffect(() => {
    if (t) markSeen(t)
  }, [t])
  const back = (
    <Link to={coursePath(course, 'threads')} className="text-sm text-mute hover:text-ink">
      ← All threads
    </Link>
  )
  if (statusBlock) return <Shell course={course}>{statusBlock}</Shell>
  if (!t)
    return (
      <Shell course={course}>
        <div className="card p-6 text-sm text-mute space-y-2">
          <div>This thread was deleted or the link is wrong.</div>
          {back}
        </div>
      </Shell>
    )
  return (
    <div className="max-w-[860px]">
      <div className="mb-3">{back}</div>
      <ThreadHead t={t} admin={admin} onDeleted={() => nav(coursePath(course, 'threads'))} />
      <div className="space-y-3 mt-4">
        {posts.map((p, i) => (
          <PostCard key={p.id} p={p} admin={admin} first={i === 0} />
        ))}
      </div>
      {admin && <Reply threadId={t.id} />}
    </div>
  )
}

function ThreadHead({ t, admin, onDeleted }: { t: Thread; admin: boolean; onDeleted: () => void }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(t.title)
  const [tagging, setTagging] = useState(false)
  const [tags, setTags] = useState<string[]>(t.topics ?? [])
  const [err, setErr] = useState<string | null>(null)
  const act = (f: () => Promise<unknown>) => async () => {
    setErr(null)
    try {
      await f()
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  return (
    <div>
      {editing ? (
        <form
          className="flex gap-2 flex-wrap"
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim()) return
            void act(() => updateThread(t.id, { title: title.trim() }))().then(() => setEditing(false))
          }}
        >
          <input className="field flex-1 min-w-[240px] !font-sans !text-lg font-bold" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <button className="btn btn-primary">Save</button>
          <button type="button" className="btn" onClick={() => (setEditing(false), setTitle(t.title))}>
            Cancel
          </button>
        </form>
      ) : (
        <h1 className="text-2xl font-extrabold leading-snug">
          {t.pinned && <span title="Pinned">📌 </span>}
          {t.title}
        </h1>
      )}
      <div className="flex items-center gap-2 flex-wrap mt-2 text-xs text-mute">
        <span className="chip">{COURSE_NAME[t.course]}</span>
        <TopicChips ids={t.topics ?? []} />
        <span>
          started by <b className="text-ink">{t.author_name ?? 'admin'}</b> · {fullDate(t.created_at)}
        </span>
        {admin && !editing && (
          <span className="ml-auto flex gap-1.5 flex-wrap">
            <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setEditing(true)}>
              ✎ Rename
            </button>
            <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => (setTags(t.topics ?? []), setTagging(!tagging))}>
              # Topics
            </button>
            <button className="btn !py-0.5 !px-2 !text-xs" onClick={act(() => updateThread(t.id, { pinned: !t.pinned }))}>
              {t.pinned ? 'Unpin' : '📌 Pin'}
            </button>
            <select
              className="btn !py-0.5 !px-2 !text-xs"
              value={t.course}
              title="Which course this thread shows in"
              onChange={(e) => {
                const c = e.target.value as ThreadCourse
                const ok = new Set(tagsFor(c).map((x) => x.id))
                void act(() => updateThread(t.id, { course: c, topics: (t.topics ?? []).filter((id) => ok.has(id)) }))()
              }}
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  Show in {COURSE_NAME[c]}
                </option>
              ))}
            </select>
            <button
              className="btn !py-0.5 !px-2 !text-xs !text-bad"
              onClick={() => {
                if (confirm(`Delete “${t.title}” and all its posts? This can't be undone.`)) void act(() => deleteThread(t.id).then(onDeleted))()
              }}
            >
              Delete
            </button>
          </span>
        )}
      </div>
      {tagging && (
        <div className="mt-3 space-y-2">
          <TagPicker course={t.course} value={tags} onChange={setTags} />
          <div className="flex gap-2 justify-end">
            <button className="btn !py-1" onClick={() => setTagging(false)}>
              Cancel
            </button>
            <button className="btn btn-primary !py-1" onClick={() => void act(() => updateThread(t.id, { topics: tags }))().then(() => setTagging(false))}>
              Save topics
            </button>
          </div>
        </div>
      )}
      {err && <div className="text-sm text-bad mt-2">{err}</div>}
    </div>
  )
}

export function PostCard({ p, admin, first }: { p: Post; admin: boolean; first: boolean }) {
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(p.body)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    if (!editing) setBody(p.body)
  }, [p.body, editing])
  return (
    <article className="card overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-2 border-b border-line bg-panel2/50 text-xs text-mute">
        <span className="w-6 h-6 rounded-full bg-accent/15 text-accent grid place-items-center font-bold text-[10px]">{initials(p.author_name)}</span>
        <b className="text-ink">{p.author_name ?? 'admin'}</b>
        <span title={fullDate(p.created_at)}>{ago(p.created_at)}</span>
        {p.edited_at && <span title={'Edited ' + fullDate(p.edited_at)}>· edited</span>}
        {admin && !editing && (
          <span className="ml-auto flex gap-1">
            <button className="btn btn-ghost !py-0 !px-1.5 !text-xs" onClick={() => setEditing(true)}>
              ✎ Edit
            </button>
            {!first && (
              <button
                className="btn btn-ghost !py-0 !px-1.5 !text-xs !text-bad"
                onClick={() => {
                  if (confirm('Delete this post?')) deletePost(p.id).catch((e) => setErr((e as Error).message))
                }}
              >
                Delete
              </button>
            )}
          </span>
        )}
      </header>
      <div className="p-4">
        {editing ? (
          <div className="space-y-2">
            <MdEditor value={body} onChange={setBody} minRows={6} draftKey={`post-edit-${p.id}`} />
            <div className="flex gap-2 justify-end">
              <button
                className="btn"
                onClick={() => {
                  clearDraft(`post-edit-${p.id}`)
                  setEditing(false)
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={busy || !body.trim()}
                onClick={async () => {
                  setBusy(true)
                  setErr(null)
                  try {
                    await updatePost(p.id, body)
                    clearDraft(`post-edit-${p.id}`)
                    setEditing(false)
                  } catch (e) {
                    setErr((e as Error).message)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <MdView src={p.body} />
        )}
        {err && <div className="text-sm text-bad mt-2">{err}</div>}
      </div>
    </article>
  )
}

function Reply({ threadId }: { threadId: string }) {
  const key = `thread-reply-${threadId}`
  const [body, setBody] = useState(() => loadDraft(key))
  const [open, setOpen] = useState(() => !!body)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  if (!open)
    return (
      <button className="btn mt-4 w-full justify-center !py-2.5 border-dashed" onClick={() => setOpen(true)}>
        ＋ Add a post to this thread
      </button>
    )
  return (
    <div className="card p-4 mt-4 space-y-2">
      <div className="font-bold text-sm">Add a post</div>
      <MdEditor value={body} onChange={setBody} draftKey={key} minRows={6} autoFocus />
      {err && <div className="text-sm text-bad">{err}</div>}
      <div className="flex gap-2 justify-end">
        <button
          className="btn"
          onClick={() => {
            if (body.trim() && !confirm('Discard this post?')) return
            clearDraft(key)
            setBody('')
            setOpen(false)
          }}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          disabled={busy || !body.trim()}
          onClick={async () => {
            setBusy(true)
            setErr(null)
            try {
              await addPost(threadId, body)
              clearDraft(key)
              setBody('')
              setOpen(false)
            } catch (e) {
              setErr((e as Error).message)
            } finally {
              setBusy(false)
            }
          }}
        >
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
