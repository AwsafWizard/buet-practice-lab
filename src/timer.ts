// Time-on-site counter. Counts while the page is visible and you have touched it within
// the last IDLE_MS; counted seconds go into the store once a minute (and when the page is
// hidden), so the synced progress isn't rewritten every second.
import { useSyncExternalStore } from 'react'
import { isoDate, useStore, type TimeAdjust, type TimeLog } from './store'

const IDLE_MS = 10 * 60_000
const FLUSH_S = 60

/** a study day runs 2:00 AM → 2:00 AM, so a late night counts toward the day it started */
export const DAY_START_HOUR = 2
export const studyDay = (d = new Date()) => isoDate(new Date(d.getTime() - DAY_START_HOUR * 3_600_000))

const DEVICE_KEY = 'ce311:device'
function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = Math.random().toString(36).slice(2, 10)
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return 'this-device'
  }
}

export const device = deviceId()
let pending = 0 // seconds counted but not yet in the store
let pendingDay = studyDay()
let pendingCourse: string | undefined = undefined
let session = 0
let lastInput = Date.now()
let lastTick = Date.now()
let active = true

// manual pause, per device; kept across reloads so a paused timer stays paused
const PAUSE_KEY = 'ce311:timerPaused'
let paused = (() => {
  try {
    return localStorage.getItem(PAUSE_KEY) === '1'
  } catch {
    return false
  }
})()

const listeners = new Set<() => void>()
let version = 0
const emit = () => {
  version++
  listeners.forEach((l) => l())
}

/** which course the open page belongs to (App sets html[data-course]) */
const courseNow = () => {
  const c = typeof document !== 'undefined' ? document.documentElement.dataset.course : undefined
  return c === 'ce311' || c === 'ce315' || c === 'ce341' || c === 'ce301' ? c : undefined
}

function flush() {
  if (pending > 0) useStore.getState().addTime(device, pendingDay, pending, pendingCourse)
  pending = 0
}

function tick() {
  const now = Date.now()
  // cap the step so a sleeping laptop or a throttled background tab adds nothing
  const step = Math.min(now - lastTick, 5000) / 1000
  lastTick = now
  const nowActive = !paused && document.visibilityState === 'visible' && now - lastInput < IDLE_MS
  if (nowActive) {
    const d = studyDay()
    const c = courseNow()
    if (d !== pendingDay || c !== pendingCourse) {
      flush()
      pendingDay = d
      pendingCourse = c
    }
    pending += step
    session += step
    if (pending >= FLUSH_S) flush()
  }
  if (nowActive || nowActive !== active) {
    active = nowActive
    emit()
  }
}

export function setPaused(p: boolean) {
  paused = p
  try {
    localStorage.setItem(PAUSE_KEY, p ? '1' : '0')
  } catch {
    /* storage blocked */
  }
  if (p) flush()
  lastTick = lastInput = Date.now()
  tick()
  emit()
}

declare const __PUBLIC_BUILD__: boolean
// hours studied before the counter existed (20 Oct: 8h 05m, 21 Oct: 7h before it went live).
// A fixed old timestamp, so any edit made on the page wins over this when syncing.
const SEED: Record<string, number> = { '2026-10-20': 8 * 3600 + 5 * 60, '2026-10-21': 7 * 3600 }
const SEED_AT = Date.UTC(2026, 9, 21)

export function startTimer() {
  if (typeof __PUBLIC_BUILD__ === 'undefined' || !__PUBLIC_BUILD__) {
    const st = useStore.getState()
    for (const [d, s] of Object.entries(SEED)) if (!st.timeAdjust[d]) st.setTimeAdjust(d, s, SEED_AT)
  }
  const poke = () => {
    const wasIdle = !active
    lastInput = Date.now()
    if (wasIdle) tick()
  }
  for (const ev of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'])
    window.addEventListener(ev, poke, { passive: true, capture: true })
  document.addEventListener('visibilitychange', () => {
    lastTick = Date.now()
    if (document.visibilityState === 'hidden') flush()
    else lastInput = Date.now()
    tick()
  })
  window.addEventListener('pagehide', flush)
  setInterval(tick, 1000)
}

/** tracked seconds per day across every device, including this device's unflushed seconds */
export function trackedTotals(log: TimeLog): Record<string, number> {
  const out: Record<string, number> = {}
  for (const days of Object.values(log)) for (const [d, n] of Object.entries(days)) out[d] = (out[d] ?? 0) + n
  if (pending > 0) out[pendingDay] = (out[pendingDay] ?? 0) + pending
  return out
}

/** tracked + manual edits, per day */
export function dailyTotals(log: TimeLog, adjust: TimeAdjust): Record<string, number> {
  const out = trackedTotals(log)
  for (const [d, a] of Object.entries(adjust)) out[d] = Math.max(0, (out[d] ?? 0) + a.s)
  return out
}

export function useTimer() {
  useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => version,
  )
  const log = useStore((s) => s.timeLog)
  const adjust = useStore((s) => s.timeAdjust)
  const days = dailyTotals(log, adjust)
  const tracked = trackedTotals(log)
  const day = studyDay()
  return { days, tracked, day, today: days[day] ?? 0, session, active, paused }
}

export function fmtClock(s: number) {
  s = Math.floor(s)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function fmtShort(s: number) {
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}

/** the study day n days after `day` (n may be negative) */
export function shiftDay(day: string, n: number) {
  const d = new Date(day + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

/** consecutive study days from first to last (yyyy-mm-dd), inclusive */
export function dayRange(first: string, last: string): string[] {
  const out: string[] = []
  const d = new Date(first + 'T12:00:00')
  for (let i = 0; i < 3660; i++) {
    const k = isoDate(d)
    out.push(k)
    if (k >= last) break
    d.setDate(d.getDate() + 1)
  }
  return out
}
