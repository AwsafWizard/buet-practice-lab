import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { dayRange, fmtClock, fmtShort, setPaused, shiftDay, useTimer } from '../timer'

/** header pill: time on the site today, ticking live; click for session / week / total */
export function TimeCounter() {
  const t = useTimer()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', close)
    }
  }, [open])

  const week = dayRange(shiftDay(t.day, -6), t.day).map((key) => ({
    key,
    label: new Date(key + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
    s: t.days[key] ?? 0,
  }))
  const max = Math.max(...week.map((w) => w.s), 1)
  const total = Object.values(t.days).reduce((a, b) => a + b, 0)
  const weekTotal = week.reduce((a, w) => a + w.s, 0)

  return (
    <div className="relative" ref={box}>
      <button
        className={'flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-panel2 ' + (t.active ? 'text-ink' : 'text-faint')}
        onClick={() => setOpen((o) => !o)}
        title={t.active ? 'Time on the site today' : t.paused ? 'Paused by you: open to resume' : 'Paused: tab hidden or no activity for 10 min'}
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className={t.active ? 'text-accent' : ''}>
          <circle cx="8" cy="9" r="5.8" />
          <path d="M8 5.8V9l2 1.4M6.4 1.6h3.2" strokeLinecap="round" />
        </svg>
        <span className="num font-semibold tabular-nums">{fmtClock(t.today)}</span>
        {t.paused && <span className="text-[10px] font-bold uppercase tracking-wider">❚❚</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[260px] max-w-[calc(100vw-32px)] rounded-xl border border-line bg-panel shadow-xl p-4 text-sm z-30">
          <div className="flex items-baseline justify-between">
            <span className="font-bold">Time on site</span>
            <span className={'text-[11px] ' + (t.active ? 'text-good' : 'text-faint')}>{t.active ? '● counting' : t.paused ? '❚❚ paused by you' : '❚❚ paused (idle)'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <Stat label="Session" value={fmtShort(t.session)} />
            <Stat label="Today" value={fmtShort(t.today)} />
            <Stat label="All time" value={fmtShort(total)} />
          </div>
          <div className="mt-4 flex items-end gap-1.5 h-16">
            {week.map((w, i) => (
              <div key={w.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end" title={`${w.key}: ${fmtShort(w.s)}`}>
                <div className={'w-full rounded-sm ' + (i === 6 ? 'bg-accent' : 'bg-accent/40')} style={{ height: `${Math.max(w.s ? 6 : 2, (w.s / max) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-1">
            {week.map((w) => (
              <span key={w.key} className="flex-1 text-center text-[10px] text-faint">
                {w.label}
              </span>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-faint leading-snug">
            Last 7 days: <span className="text-mute num">{fmtShort(weekTotal)}</span>. Pauses when the tab is hidden or after 10 min with no taps, scrolls or keys. Days run 2 AM to 2 AM.
          </div>
          <div className="flex gap-2 mt-3">
            <PauseButton paused={t.paused} className="flex-1" />
            <Link to="/time" onClick={() => setOpen(false)} className="btn !text-xs flex-1 justify-center">
              Details →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function PauseButton({ paused, className = '' }: { paused: boolean; className?: string }) {
  return (
    <button className={(paused ? 'btn btn-primary' : 'btn') + ' !text-xs justify-center ' + className} onClick={() => setPaused(!paused)}>
      {paused ? '▶ Resume' : '❚❚ Pause'}
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-panel2 py-2">
      <div className="num font-bold">{value}</div>
      <div className="text-[10.5px] text-faint">{label}</div>
    </div>
  )
}
