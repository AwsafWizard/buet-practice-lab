// Opening screen: one card per course. Adding a course = one entry in COURSES + its own route tree.

import { Link } from 'react-router-dom'
import { ALL_PYQ } from '../pyq'
import { RC_ALL } from '../rc/pyq'
import { RC_EXAM_DATE } from '../rc/plan'
import { SM_ALL } from '../soil/pyq'
import { SM_EXAM_DATE } from '../soil/plan'
import { EXAM_DATE } from '../pages/planner/template'
import { today, useStore } from '../store'
import { Ring } from './ui'

interface Course {
  key: 'ce311' | 'ce315' | 'ce341'
  code: string
  name: string
  exam: string
  home: string
  qids: string[]
  checkPrefix: (k: string) => boolean
  /** card colours (fixed, so each card looks like its course in either theme) */
  light: { bg: string; ink: string; mute: string; acc: string; line: string }
  dark: { bg: string; ink: string; mute: string; acc: string; line: string }
}

export const COURSES: Course[] = [
  {
    key: 'ce341',
    code: 'CE 341',
    name: 'Principles of Soil Mechanics',
    exam: SM_EXAM_DATE,
    home: '/ce341',
    qids: SM_ALL.map((q) => q.id),
    checkPrefix: (k) => k.startsWith('sm-'),
    light: { bg: '#fbfcf5', ink: '#20261a', mute: '#5c6650', acc: '#4d7c0f', line: '#d6dcc6' },
    dark: { bg: '#161b12', ink: '#e9efdd', mute: '#a3ad92', acc: '#a3e635', line: '#2f3a26' },
  },
  {
    key: 'ce315',
    code: 'CE 315',
    name: 'Design of Concrete Structures I',
    exam: RC_EXAM_DATE,
    home: '/ce315',
    qids: RC_ALL.map((q) => q.id),
    checkPrefix: (k) => k.startsWith('rc-'),
    light: { bg: '#fffcf6', ink: '#2a2418', mute: '#6b6250', acc: '#b45309', line: '#ddd2bd' },
    dark: { bg: '#1f1b13', ink: '#f2eadb', mute: '#b3a68c', acc: '#fbbf24', line: '#3a3223' },
  },
  {
    key: 'ce311',
    code: 'CE 311',
    name: 'Structural Analysis',
    exam: EXAM_DATE,
    home: '/ce311',
    qids: ALL_PYQ.map((q) => q.id),
    checkPrefix: (k) => !k.startsWith('rc-') && !k.startsWith('sm-'),
    light: { bg: '#fffdf8', ink: '#1d2433', mute: '#5e6575', acc: '#0e7490', line: '#ddd5c4' },
    dark: { bg: '#111a2b', ink: '#e6edf7', mute: '#96a3ba', acc: '#38bdf8', line: '#23314c' },
  },
]

/** last page visited inside each course (per device), so "Continue" lands where you left off */
export function rememberCourseRoute(course: string, path: string) {
  try {
    localStorage.setItem('lastRoute:' + course, path)
  } catch {
    /* storage blocked */
  }
}
function lastCourseRoute(c: Course) {
  try {
    return localStorage.getItem('lastRoute:' + c.key) || c.home
  } catch {
    return c.home
  }
}

export const REPO_URL = 'https://github.com/AwsafWizard/buet-practice-lab'

const fmtH = (s: number) => (s >= 3600 ? `${(s / 3600).toFixed(1)} h` : `${Math.round(s / 60)} min`)

export function CoursePicker() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const qStatus = useStore((s) => s.qStatus)
  const attempts = useStore((s) => s.attempts)
  const timeLog = useStore((s) => s.timeLog)
  const streak = useStore((s) => s.streak)
  const xp = useStore((s) => s.xp)
  const t = today()
  const todaySec = Object.values(timeLog).reduce((s, d) => s + (d[t] ?? 0), 0)
  const totalSec = Object.values(timeLog).reduce((s, d) => s + Object.values(d).reduce((a, b) => a + b, 0), 0)
  return (
    <div className="min-h-full flex flex-col items-center px-4 py-10 md:py-16">
      <div className="w-full max-w-[920px]">
        <div className="flex items-center gap-3 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-faint font-bold">BUET · L-3/T-1 · Civil</div>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Practice Lab</h1>
            <p className="text-mute text-sm mt-1">Pick a course. Progress, streak and XP are shared; each course keeps its own plan.</p>
          </div>
          <a className="ml-auto btn !py-1 !px-2.5 !text-xs inline-flex items-center gap-1.5" href={REPO_URL} target="_blank" rel="noopener noreferrer" title="Source code on GitHub">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
          <button className="btn !py-1 !px-2.5 !text-xs" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☾ Dark' : '☀ Light'}
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {COURSES.map((c) => {
            const col = theme === 'dark' ? c.dark : c.light
            const total = c.qids.length
            const solved = c.qids.filter((id) => qStatus[id] === 'solved').length
            const checks = Object.entries(attempts).filter(([k]) => c.checkPrefix(k))
            const ok = checks.filter(([, a]) => a.correct).length
            const days = Math.ceil((new Date(c.exam + 'T09:00:00').getTime() - Date.now()) / 86400000)
            const over = days < 0
            return (
              <Link
                key={c.key}
                to={lastCourseRoute(c)}
                className="group rounded-2xl border p-6 flex flex-col gap-4 transition-transform hover:-translate-y-0.5 shadow-sm hover:shadow-lg"
                style={{ background: col.bg, color: col.ink, borderColor: col.line }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold tracking-wider" style={{ color: col.acc }}>
                      {c.code}
                    </div>
                    <div className="text-xl font-extrabold leading-snug">{c.name}</div>
                  </div>
                  <Ring value={total ? solved / total : 0} size={54} stroke={5} color={col.acc} label={total ? `${Math.round((solved / total) * 100)}%` : '–'} />
                </div>
                <div className="flex items-baseline gap-2">
                  {over ? (
                    <span className="text-sm" style={{ color: col.mute }}>
                      Exam was {new Date(c.exam + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold num" style={{ color: col.acc }}>
                        {days}
                      </span>
                      <span className="text-sm" style={{ color: col.mute }}>
                        day{days === 1 ? '' : 's'} to the exam · {new Date(c.exam + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: col.mute }}>
                  <div>
                    <div className="num text-base font-bold" style={{ color: col.ink }}>
                      {solved}/{total}
                    </div>
                    past questions solved
                  </div>
                  <div>
                    <div className="num text-base font-bold" style={{ color: col.ink }}>
                      {ok}/{checks.length}
                    </div>
                    checks correct
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between text-sm font-bold" style={{ color: col.acc }}>
                  <span>{lastCourseRoute(c) === c.home ? 'Open' : 'Continue where you left off'}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
          <span>
            ⏱ Today <b className="num text-ink">{fmtH(todaySec)}</b> · all time <b className="num text-ink">{fmtH(totalSec)}</b>
          </span>
          <span>
            🔥 Streak <b className="num text-ink">{streak.count}</b>
          </span>
          <span>
            Lv <b className="num text-ink">{Math.floor(xp / 200) + 1}</b> · <span className="num">{xp}</span> XP
          </span>
        </div>
      </div>
    </div>
  )
}
