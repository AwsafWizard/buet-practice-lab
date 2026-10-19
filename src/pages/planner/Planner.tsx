import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TopicIcon } from '../../topics/icons'
import { topicById } from '../../topics/registry'
import { today, useStore, type PlanBlock, type PlannerState, type TopicId } from '../../store'
import { daysBetween, defaultPlanner, pack } from './template'

const KIND_COLOR: Record<PlanBlock['kind'], string> = {
  learn: 'var(--c-accent)',
  practice: 'var(--c-load)',
  revise: 'var(--c-good)',
  mock: 'var(--c-bad)',
}

export function usePlanner(): [PlannerState, (p: PlannerState) => void] {
  const planner = useStore((s) => s.planner)
  const setPlanner = useStore((s) => s.setPlanner)
  const p = useMemo(() => planner ?? defaultPlanner(), [planner])
  return [p, setPlanner]
}

export function blockLink(b: PlanBlock) {
  if (b.topic === 'mock') return '/papers'
  if (b.topic === 'mixed' || b.topic === 'setup') return '/'
  return `/topic/${b.topic}`
}

export function BlockChip({ b, onToggle, compact }: { b: PlanBlock; onToggle?: () => void; compact?: boolean }) {
  const t = topicById(b.topic)
  return (
    <div className={'flex items-start gap-2 rounded-lg border border-line bg-panel2/60 px-2.5 py-2 ' + (b.done ? 'opacity-55' : '')} style={{ borderLeft: `3px solid ${KIND_COLOR[b.kind]}` }}>
      {onToggle && <input type="checkbox" checked={!!b.done} onChange={onToggle} className="mt-1 accent-[var(--c-accent)]" />}
      <div className="min-w-0 flex-1">
        <Link to={blockLink(b)} className={'text-sm font-semibold leading-snug hover:text-accent ' + (b.done ? 'line-through' : '')}>
          {t && <TopicIcon id={t.id as TopicId} color={t.color} size={14} />} {b.title}
        </Link>
        {!compact && <div className="text-[11px] text-faint mt-0.5">{b.how}</div>}
      </div>
      <span className="num text-xs text-mute shrink-0">{b.hours}h</span>
    </div>
  )
}

export function Planner() {
  const [p, setP] = usePlanner()
  const [drag, setDrag] = useState<string | null>(null)
  const [edit, setEdit] = useState<string | null>(null)
  const map = useMemo(() => pack(p), [p])
  const days = daysBetween(p.startDate, p.examDate)
  const t = today()
  const update = (fn: (q: PlannerState) => PlannerState) => setP(fn(structuredClone(p)))
  const totalHours = p.blocks.reduce((s, b) => s + b.hours, 0)
  const doneHours = p.blocks.filter((b) => b.done).reduce((s, b) => s + b.hours, 0)
  const capacity = days.reduce((s, d) => s + (p.hoursByDay[d] ?? p.defaultHours), 0)

  const rollForward = () =>
    update((q) => {
      // unpin unfinished blocks on past days so they re-pack into today and later
      for (const blk of q.blocks) if (!blk.done && blk.day && blk.day < t) delete blk.day
      for (const [d, list] of pack(q)) if (d < t) for (const blk of list) if (!blk.done) blk.day = undefined
      q.startDate = t > q.startDate && t < q.examDate ? t : q.startDate
      return q
    })

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-mute">Start</span>
          <input type="date" className="field" value={p.startDate} onChange={(e) => update((q) => ({ ...q, startDate: e.target.value }))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-mute">Exam</span>
          <input type="date" className="field" value={p.examDate} onChange={(e) => update((q) => ({ ...q, examDate: e.target.value }))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-mute">Hours / day</span>
          <input type="number" min={1} max={14} step={0.5} className="field w-20" value={p.defaultHours} onChange={(e) => update((q) => ({ ...q, defaultHours: +e.target.value || 7 }))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-mute">Protected revision days</span>
          <input type="number" min={0} max={5} className="field w-20" value={p.revisionDays} onChange={(e) => update((q) => ({ ...q, revisionDays: Math.max(0, +e.target.value) }))} />
        </label>
        <button className="btn" onClick={rollForward} title="Move unfinished blocks from past days into today onward">
          ↻ Roll unfinished forward
        </button>
        <button
          className="btn"
          onClick={() => {
            if (confirm('Reset the plan to the default template? Your checked-off blocks will be cleared.')) setP(defaultPlanner())
          }}
        >
          Reset to default
        </button>
        <div className="ml-auto text-xs text-mute text-right">
          <div>
            Planned <span className="num text-ink">{totalHours}h</span> · capacity <span className="num text-ink">{capacity}h</span>
          </div>
          <div>
            Done <span className="num text-good">{doneHours}h</span> ({totalHours ? Math.round((doneHours / totalHours) * 100) : 0}%)
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden mb-4">
        <div className="h-full bg-good transition-all" style={{ width: `${totalHours ? (doneHours / totalHours) * 100 : 0}%` }} />
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {days.map((d, i) => {
          const list = map.get(d) ?? []
          const hrs = list.reduce((s, b) => s + b.hours, 0)
          const cap = p.hoursByDay[d] ?? p.defaultHours
          const isToday = d === t
          const past = d < t
          const prot = i >= days.length - p.revisionDays
          return (
            <div
              key={d}
              className={'card p-3 ' + (isToday ? 'ring-2 ring-accent' : '') + (past ? ' opacity-75' : '')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!drag) return
                update((q) => {
                  const blk = q.blocks.find((x) => x.id === drag)!
                  blk.day = d
                  return q
                })
                setDrag(null)
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs text-faint">
                    Day {i + 1}
                    {prot && ' · revision'}
                    {isToday && ' · today'}
                  </div>
                  <div className="font-bold">{new Date(d + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                </div>
                <label className="text-xs text-mute flex items-center gap-1">
                  <span className={'num ' + (hrs > cap + 0.3 ? 'text-bad font-bold' : 'text-ink')}>{hrs}</span>/
                  <input
                    type="number"
                    className="field !px-1 !py-0 w-12 text-xs"
                    value={cap}
                    step={0.5}
                    onChange={(e) =>
                      update((q) => {
                        q.hoursByDay[d] = +e.target.value
                        return q
                      })
                    }
                  />
                  h
                </label>
              </div>
              <div className="space-y-1.5 min-h-10">
                {list.map((blk) => (
                  <div key={blk.id} draggable onDragStart={() => setDrag(blk.id)} className="cursor-grab active:cursor-grabbing">
                    {edit === blk.id ? (
                      <BlockEditor
                        b={blk}
                        onDone={(nb) => {
                          update((q) => {
                            const i = q.blocks.findIndex((x) => x.id === blk.id)
                            if (nb) q.blocks[i] = nb
                            else q.blocks.splice(i, 1)
                            return q
                          })
                          setEdit(null)
                        }}
                      />
                    ) : (
                      <div className="group relative">
                        <BlockChip
                          b={blk}
                          compact
                          onToggle={() =>
                            update((q) => {
                              const x = q.blocks.find((y) => y.id === blk.id)!
                              x.done = !x.done
                              if (x.done && !x.day) x.day = d
                              return q
                            })
                          }
                        />
                        <button className="absolute right-9 top-1.5 hidden group-hover:block text-xs text-mute hover:text-accent" onClick={() => setEdit(blk.id)}>
                          edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="mt-2 text-xs text-faint hover:text-accent"
                onClick={() =>
                  update((q) => {
                    q.blocks.push({ id: 'u' + Date.now(), topic: 'mixed', title: 'Custom block', hours: 1, kind: 'practice', day: d, how: 'Your own block' })
                    return q
                  })
                }
              >
                + add block
              </button>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-faint mt-3">Drag blocks between days to pin them. Unpinned blocks auto-flow in order into each day’s hours; the last {p.revisionDays} days are kept for mocks and revision.</p>
    </div>
  )
}

function BlockEditor({ b, onDone }: { b: PlanBlock; onDone: (b: PlanBlock | null) => void }) {
  const [x, setX] = useState(b)
  return (
    <div className="rounded-lg border border-accent p-2 space-y-1.5 bg-panel">
      <input className="field w-full !font-sans" value={x.title} onChange={(e) => setX({ ...x, title: e.target.value })} />
      <div className="flex gap-2 items-center text-xs">
        <input type="number" step={0.5} className="field w-16" value={x.hours} onChange={(e) => setX({ ...x, hours: +e.target.value })} />h
        <select className="field" value={x.kind} onChange={(e) => setX({ ...x, kind: e.target.value as PlanBlock['kind'] })}>
          <option value="learn">learn</option>
          <option value="practice">practice</option>
          <option value="revise">revise</option>
          <option value="mock">mock</option>
        </select>
        <button className="btn !py-0.5 !px-2 !text-xs ml-auto" onClick={() => onDone(x)}>
          save
        </button>
        <button className="btn !py-0.5 !px-2 !text-xs text-bad" onClick={() => onDone(null)}>
          delete
        </button>
      </div>
    </div>
  )
}
