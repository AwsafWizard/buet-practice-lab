import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PauseButton } from '../components/TimeCounter'
import { Ring, Section, Seg } from '../components/ui'
import { useStore } from '../store'
import { dayRange, fmtShort, shiftDay, useTimer } from '../timer'

type Range = '7' | '14' | '30' | 'all'

const longDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

export default function ScreenTime() {
  const t = useTimer()
  const goalH = useStore((s) => s.timeGoal)
  const adjust = useStore((s) => s.timeAdjust)
  const goal = goalH * 3600
  const [range, setRange] = useState<Range>('14')

  const recorded = Object.keys(t.days).filter((d) => t.days[d] > 0).sort()
  const first = recorded[0] ?? t.day
  const allDays = dayRange(first < t.day ? first : t.day, t.day)
  const sec = (d: string) => t.days[d] ?? 0

  // finished days only: today is still running and would drag the average down
  const past = allDays.filter((d) => d < t.day && sec(d) > 0)
  const avgDays = past.length ? past : t.today > 0 ? [t.day] : []
  const avg = avgDays.length ? avgDays.reduce((a, d) => a + sec(d), 0) / avgDays.length : 0
  const last7 = dayRange(shiftDay(t.day, -6), t.day)
  const week = last7.reduce((a, d) => a + sec(d), 0)
  const weekGoals = last7.filter((d) => sec(d) >= goal).length
  const best = allDays.reduce((b, d) => (sec(d) > sec(b) ? d : b), allDays[0])
  const total = allDays.reduce((a, d) => a + sec(d), 0)
  const studied = allDays.filter((d) => sec(d) > 0).length
  // days in a row (ending yesterday, or today once it has time) with any study
  let streak = 0
  for (let d = t.today > 0 ? t.day : shiftDay(t.day, -1); sec(d) > 0; d = shiftDay(d, -1)) streak++

  const shown = range === 'all' ? allDays : dayRange(shiftDay(t.day, -(Number(range) - 1)), t.day)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold">Screen time</h1>
        <p className="text-sm text-mute">
          Time spent on this site each day. A day runs 2:00 AM to 2:00 AM, so a late night counts toward the day you started. Counting pauses on its own when the tab is hidden or after 10 min without a tap, scroll or key press, or whenever you hit Pause.
        </p>
      </div>

      <div className="grid grid-cols-2 cq-md:grid-cols-3 cq-xl:grid-cols-6 gap-3 mb-5">
        <div className="card p-4 col-span-2 flex items-center gap-3">
          <Ring value={goal ? t.today / goal : 0} size={52} stroke={5} label={`${Math.min(999, Math.round((t.today / Math.max(goal, 1)) * 100))}%`} />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-faint font-bold">Today</div>
            <div className="num text-xl font-bold whitespace-nowrap">{fmtShort(t.today)}</div>
            <div className="text-[11px] text-mute">{t.paused ? '❚❚ paused' : t.today >= goal ? '✓ goal reached' : `${fmtShort(goal - t.today)} to ${goalH}h goal`}</div>
          </div>
          <PauseButton paused={t.paused} className="ml-auto !px-2.5" />
        </div>
        <Tile label="Daily average" value={fmtShort(avg)} sub={past.length ? `of ${past.length} study day${past.length === 1 ? '' : 's'}, excl. today` : 'today so far'} />
        <Tile label="Last 7 days" value={fmtShort(week)} sub={`goal met ${weekGoals} of 7 days`} />
        <Tile label="Best day" value={fmtShort(sec(best))} sub={sec(best) ? longDate(best) : '—'} />
        <Tile label="All time" value={fmtShort(total)} sub={`${studied} day${studied === 1 ? '' : 's'} studied · ${streak}-day run`} />
      </div>

      <Section title="Daily screen time" sub={`Dashed lines: your ${goalH}h goal and the daily average.`}>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
          <GoalSetter />
          <Seg
            size="xs"
            value={range}
            onChange={setRange}
            items={[
              { v: '7', label: '7d' },
              { v: '14', label: '14d' },
              { v: '30', label: '30d' },
              { v: 'all', label: 'All' },
            ]}
          />
        </div>
        <DayChart days={shown} sec={sec} today={t.day} goal={goal} avg={avg} />
      </Section>

      <Section title="Every day" sub="Tap Edit to fix a day's total, or add a day the counter missed. Edits sync to your other devices.">
        <DayTable days={[...allDays].reverse()} sec={sec} tracked={t.tracked} today={t.day} goal={goal} avg={avg} edited={adjust} />
      </Section>
    </div>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="text-[11px] uppercase tracking-wider text-faint font-bold">{label}</div>
      <div className="num text-xl font-bold mt-0.5 whitespace-nowrap">{value}</div>
      <div className="text-[11px] text-mute mt-0.5 leading-snug">{sub}</div>
    </div>
  )
}

function GoalSetter() {
  const goal = useStore((s) => s.timeGoal)
  const setGoal = useStore((s) => s.setTimeGoal)
  return (
    <label className="flex items-center gap-2 text-sm text-mute">
      Daily goal
      <input
        type="number"
        min={0.5}
        max={16}
        step={0.5}
        value={goal}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (v > 0 && v <= 16) setGoal(v)
        }}
        className="field w-20"
      />
      hours
    </label>
  )
}

// ---------------------------------------------------------------- chart

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(600)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.clientWidth)
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

function DayChart({ days, sec, today, goal, avg }: { days: string[]; sec: (d: string) => number; today: string; goal: number; avg: number }) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const H = 240
  const pad = { l: 34, r: 8, t: 14, b: 26 }
  const maxS = Math.max(goal, avg, ...days.map(sec), 3600)
  const topH = Math.ceil(maxS / 3600 / 2) * 2 // whole even hours
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const y = (s: number) => pad.t + ih - (s / (topH * 3600)) * ih
  const slot = iw / days.length
  const gap = Math.min(8, Math.max(2, slot * 0.25))
  const bw = Math.max(2, slot - gap)
  const labelEvery = Math.ceil(days.length / Math.max(1, Math.floor(iw / 34)))
  const ticks = Array.from({ length: topH / 2 + 1 }, (_, i) => i * 2)
  const h = hover !== null ? days[hover] : null
  const close = avg > 0 && Math.abs(y(avg) - y(goal)) < 16

  return (
    <div ref={ref} className="relative select-none" onPointerLeave={() => setHover(null)}>
      <svg width={W} height={H} role="img" aria-label="Bar chart of screen time per day">
        {ticks.map((hr) => (
          <g key={hr}>
            <line x1={pad.l} x2={W - pad.r} y1={y(hr * 3600)} y2={y(hr * 3600)} stroke="var(--c-line)" strokeWidth={1} />
            <text x={pad.l - 6} y={y(hr * 3600)} dominantBaseline="central" textAnchor="end" fontSize={10.5} fill="var(--c-faint)" className="num">
              {hr}h
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const s = sec(d)
          const x = pad.l + i * slot + gap / 2
          const top = y(s)
          const hgt = pad.t + ih - top
          const r = Math.min(4, bw / 2, hgt)
          return (
            <g key={d}>
              {s > 0 && (
                <path
                  d={`M${x},${pad.t + ih} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${pad.t + ih} Z`}
                  fill="var(--c-accent)"
                  opacity={hover === null || hover === i ? (d === today ? 0.75 : 1) : 0.45}
                />
              )}
              {(i % labelEvery === 0 || d === today) && (days.length - 1 - i >= labelEvery || d === today) && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize={10.5} fill={d === today ? 'var(--c-ink)' : 'var(--c-faint)'} fontWeight={d === today ? 700 : 400}>
                  {d === today ? 'Today' : new Date(d + 'T12:00:00').getDate()}
                </text>
              )}
              {/* hit target: the whole column, wider than the bar */}
              <rect x={pad.l + i * slot} y={pad.t} width={slot} height={ih} fill="transparent" onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} />
            </g>
          )
        })}
        {/* when the two lines nearly meet, the lower one's label goes under its line */}
        <RefLine y={y(goal)} x1={pad.l} x2={W - pad.r} label={`goal ${+(goal / 3600).toFixed(1)}h`} dash="6 4" below={close && goal <= avg} />
        {avg > 0 && <RefLine y={y(avg)} x1={pad.l} x2={W - pad.r} label={`avg ${fmtShort(avg)}`} dash="2 3" below={close && avg < goal} />}
      </svg>
      {h && (
        <div
          className="absolute pointer-events-none rounded-lg border border-line bg-panel shadow-lg px-3 py-2 text-xs whitespace-nowrap"
          style={{ left: Math.min(Math.max(pad.l + (hover! + 0.5) * slot - 70, 0), W - 140), top: Math.max(0, y(sec(h)) - 62) }}
        >
          <div className="text-mute">{h === today ? 'Today' : longDate(h)}</div>
          <div className="num font-bold text-sm text-ink">{fmtShort(sec(h))}</div>
          <div className="text-faint">{sec(h) >= goal ? '✓ goal met' : `${fmtShort(goal - sec(h))} short of goal`}</div>
        </div>
      )}
    </div>
  )
}

function RefLine({ y, x1, x2, label, dash, below }: { y: number; x1: number; x2: number; label: string; dash: string; below?: boolean }) {
  return (
    <g pointerEvents="none">
      <line x1={x1} x2={x2} y1={y} y2={y} stroke="var(--c-mute)" strokeWidth={1.5} strokeDasharray={dash} />
      <text x={x1 + 4} y={below ? y + 13 : y - 5} textAnchor="start" fontSize={10.5} fill="var(--c-mute)" stroke="var(--c-panel)" strokeWidth={3} paintOrder="stroke" className="num">
        {label}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------- table + editing

function DayTable({
  days,
  sec,
  tracked,
  today,
  goal,
  avg,
  edited,
}: {
  days: string[]
  sec: (d: string) => number
  tracked: Record<string, number>
  today: string
  goal: number
  avg: number
  edited: Record<string, unknown>
}) {
  const setAdjust = useStore((s) => s.setTimeAdjust)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const max = Math.max(goal, ...days.map(sec), 1)
  // the stored edit is relative to tracked time, so a day keeps counting after you set it
  const save = (d: string, total: number) => setAdjust(d, total - (tracked[d] ?? 0))

  return (
    <div>
      <div className="divide-y divide-line">
        {days.map((d) => (
          <div key={d} className="py-2.5 flex items-center gap-3 text-sm">
            <div className="w-[104px] shrink-0">
              <div className={d === today ? 'font-bold' : ''}>{d === today ? 'Today' : longDate(d)}</div>
              {edited[d] !== undefined && <div className="text-[10.5px] text-faint">includes manual entry</div>}
            </div>
            {editing === d ? (
              <TimeInput initial={sec(d)} onSave={(s) => (save(d, s), setEditing(null))} onCancel={() => setEditing(null)} />
            ) : (
              <>
                <div className="flex-1 min-w-0 hidden cq-sm:block">
                  <div className="h-1.5 rounded-full bg-line overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(sec(d) / max) * 100}%` }} />
                  </div>
                </div>
                <div className="num font-semibold w-[68px] text-right ml-auto cq-sm:ml-0">{fmtShort(sec(d))}</div>
                <div className="w-[76px] text-[11px] text-right hidden cq-sm:block">
                  {sec(d) >= goal ? <span className="text-good">✓ goal</span> : avg > 0 && sec(d) > 0 ? <span className="text-faint">{sec(d) >= avg ? '+' : '−'}{fmtShort(Math.abs(sec(d) - avg))} avg</span> : null}
                </div>
                <button className="btn btn-ghost !px-2 !py-0.5 !text-xs" onClick={() => setEditing(d)}>
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3">{adding ? <AddDay onAdd={(d, s) => (save(d, s), setAdding(false))} onCancel={() => setAdding(false)} today={today} /> : <button className="btn !text-xs" onClick={() => setAdding(true)}>+ Add a day</button>}</div>
    </div>
  )
}

function TimeInput({ initial, onSave, onCancel }: { initial: number; onSave: (s: number) => void; onCancel: () => void }) {
  const [h, setH] = useState(String(Math.floor(initial / 3600)))
  const [m, setM] = useState(String(Math.floor((initial % 3600) / 60)))
  const hRef = useRef<HTMLInputElement>(null)
  useEffect(() => hRef.current?.select(), [])
  const ok = () => {
    const s = (Number(h) || 0) * 3600 + (Number(m) || 0) * 60
    if (s >= 0 && s <= 24 * 3600) onSave(s)
  }
  return (
    <form
      className="flex items-center gap-1.5 flex-1 justify-end flex-wrap"
      onSubmit={(e) => {
        e.preventDefault()
        ok()
      }}
    >
      <input ref={hRef} className="field w-14" type="number" min={0} max={24} value={h} onChange={(e) => setH(e.target.value)} aria-label="hours" />
      <span className="text-mute text-xs">h</span>
      <input className="field w-14" type="number" min={0} max={59} value={m} onChange={(e) => setM(e.target.value)} aria-label="minutes" />
      <span className="text-mute text-xs">m</span>
      <button className="btn btn-primary !px-2 !py-0.5 !text-xs" type="submit">
        Save
      </button>
      <button className="btn btn-ghost !px-2 !py-0.5 !text-xs" type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}

function AddDay({ onAdd, onCancel, today }: { onAdd: (d: string, s: number) => void; onCancel: () => void; today: string }) {
  const [d, setD] = useState(shiftDay(today, -1))
  return (
    <div className="flex items-center gap-2 flex-wrap text-sm">
      <input className="field" type="date" max={today} value={d} onChange={(e) => setD(e.target.value)} aria-label="day" />
      {d && d <= today && <TimeInput initial={0} onSave={(s) => onAdd(d, s)} onCancel={onCancel} />}
    </div>
  )
}
