// Topic tags on a thread: chips to show them, and a picker for admins.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ThreadCourse } from './api'
import { tagsFor, topicPath, topicTag, type TagTopic } from './topics'

const chipStyle = (t: TagTopic) => ({
  borderColor: `color-mix(in oklab, ${t.color} 45%, transparent)`,
  background: `color-mix(in oklab, ${t.color} 12%, transparent)`,
})

/** the topics a thread is tagged with; links go to the topic pages */
export function TopicChips({ ids, link = true, small }: { ids: string[]; link?: boolean; small?: boolean }) {
  const tags = ids.map(topicTag).filter((t): t is TagTopic => !!t)
  if (!tags.length) return null
  const cls = 'chip !text-ink ' + (small ? '!py-0 !text-[10px]' : '')
  return (
    <>
      {tags.map((t) =>
        link ? (
          <Link key={t.id} to={topicPath(t)} className={cls + ' hover:!border-accent'} style={chipStyle(t)} title={t.title} onClick={(e) => e.stopPropagation()}>
            # {t.short}
          </Link>
        ) : (
          <span key={t.id} className={cls} style={chipStyle(t)} title={t.title}>
            # {t.short}
          </span>
        ),
      )}
    </>
  )
}

/** choose topics for a thread; only the thread's course's topics (every topic for "All courses") */
export function TagPicker({ course, value, onChange }: { course: ThreadCourse; value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const options = tagsFor(course)
  const needle = q.trim().toLowerCase()
  const shown = needle ? options.filter((t) => t.short.toLowerCase().includes(needle) || t.title.toLowerCase().includes(needle)) : options
  const groups = [...new Set(shown.map((t) => (course === 'all' ? `${t.course.toUpperCase().replace('CE', 'CE ')} · ${t.group}` : t.group)))]
  const groupOf = (t: TagTopic) => (course === 'all' ? `${t.course.toUpperCase().replace('CE', 'CE ')} · ${t.group}` : t.group)
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])
  return (
    <div className="rounded-xl border border-line bg-bg/60 px-3 py-2">
      <div className="flex items-center gap-1.5 flex-wrap text-sm">
        <span className="text-mute mr-1">Topics</span>
        {value.length === 0 && <span className="text-faint text-xs">none: shows in the Threads tab only</span>}
        {value.map((id) => {
          const t = topicTag(id)
          if (!t) return null
          return (
            <button key={id} type="button" className="chip !text-ink hover:!border-bad" style={chipStyle(t)} onClick={() => toggle(id)} title="Remove this tag">
              # {t.short} <span className="text-faint">✕</span>
            </button>
          )
        })}
        <button type="button" className="btn !py-0.5 !px-2 !text-xs ml-auto" onClick={() => setOpen(!open)}>
          {open ? 'Done' : value.length ? '＋ More topics' : '＋ Tag topics'}
        </button>
      </div>
      {open && (
        <div className="mt-2 pt-2 border-t border-line space-y-2.5">
          {options.length > 12 && <input className="field w-full max-w-xs !py-1 !text-xs !font-sans" placeholder="Filter topics…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />}
          {groups.map((g) => (
            <div key={g}>
              <div className="text-[10.5px] uppercase tracking-wider text-faint font-bold mb-1">{g}</div>
              <div className="flex flex-wrap gap-1.5">
                {shown
                  .filter((t) => groupOf(t) === g)
                  .map((t) => {
                    const on = value.includes(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggle(t.id)}
                        title={t.title}
                        className={'chip transition-colors ' + (on ? '!text-ink font-bold' : 'hover:!text-ink')}
                        style={on ? { ...chipStyle(t), borderColor: t.color } : undefined}
                      >
                        {on ? '✓' : '+'} {t.short}
                      </button>
                    )
                  })}
              </div>
            </div>
          ))}
          {!shown.length && <div className="text-xs text-faint">No topic matches.</div>}
        </div>
      )}
    </div>
  )
}
