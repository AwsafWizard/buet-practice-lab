import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { CodeDrawer, usePageGroup } from './components/CodeDrawer'
import { CoursePicker, rememberCourseRoute } from './components/CoursePicker'
import { RailSidebar } from './components/RailSidebar'
import { TimeCounter } from './components/TimeCounter'
import { Ring } from './components/ui'
import { ALL_PYQ } from './pyq'
import { useDrawer } from './reference/drawer'
import { exportState, useStore } from './store'
import { ARTIFACT, useSyncStatus, type SyncStatus } from './sync'
import { CLOUD, sendMagicLink, signOut, useCloudUser } from './cloud'
import { SECTION_LABEL, TOPICS } from './topics/registry'
import { TopicIcon } from './topics/icons'
import { EXAM_DATE } from './pages/planner/template'

const Overview = lazy(() => import('./pages/Overview'))
const TopicPage = lazy(() => import('./pages/TopicPage'))
const Papers = lazy(() => import('./pages/Papers'))
const Formulas = lazy(() => import('./pages/Formulas'))
const QuestionPage = lazy(() => import('./pages/QuestionPage'))
const ScreenTime = lazy(() => import('./pages/ScreenTime'))

const RcApp = lazy(() => import('./rc/RcApp'))
const SmApp = lazy(() => import('./soil/SmApp'))

export type CourseKey = 'home' | 'ce311' | 'ce315' | 'ce341'
export const courseOf = (pathname: string): CourseKey =>
  pathname === '/' ? 'home' : pathname.startsWith('/ce315') ? 'ce315' : pathname.startsWith('/ce341') ? 'ce341' : 'ce311'

export default function App() {
  const theme = useStore((s) => s.theme)
  const loc = useLocation()
  const course = courseOf(loc.pathname)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    document.documentElement.dataset.course = course
    document.title = course === 'home' ? 'Practice Lab' : `CE ${course.slice(2)} Practice Lab`
  }, [course])
  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (course !== 'home') rememberCourseRoute(course, loc.pathname)
  }, [loc.pathname, course])
  return (
    <Suspense fallback={<div className="text-mute p-10">Loading…</div>}>
      {course === 'home' ? <CoursePicker /> : course === 'ce315' ? <RcApp /> : course === 'ce341' ? <SmApp /> : <Ce311App />}
    </Suspense>
  )
}

function Ce311App() {
  const rotSign = useStore((s) => s.rotSign)
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const pageGroup = usePageGroup()
  const drawer = useDrawer()
  const drawerOpen = drawer.open && pageGroup !== null
  useEffect(() => {
    setOpen(false)
  }, [loc.pathname])
  return (
    <div className="min-h-full flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {/* wide screens: the open code-tables drawer pushes the page instead of covering it (the wide drawer only on very wide screens) */}
      <div className={'flex-1 min-w-0 flex flex-col transition-[padding] duration-200 ' + (drawerOpen ? (drawer.wide ? 'min-[1800px]:pr-[760px]' : 'xl:pr-[440px]') : '')}>
        <Header onMenu={() => setOpen(true)} />
        <main className="@container/page flex-1 px-4 md:px-8 py-6 max-w-[1180px] w-full mx-auto">
          <Suspense fallback={<div className="text-mute p-10">Loading…</div>}>
            {/* re-mount the page when the rotation sign convention flips so every value and label follows */}
            <Routes key={rotSign}>
              <Route path="/ce311" element={<Overview />} />
              <Route path="/topic/:id" element={<TopicPage />} />
              <Route path="/topic/:id/:tab" element={<TopicPage />} />
              <Route path="/papers" element={<Papers />} />
              <Route path="/papers/:paper" element={<Papers />} />
              <Route path="/q/:qid" element={<QuestionPage />} />
              <Route path="/formulas" element={<Formulas />} />
              <Route path="/time" element={<ScreenTime />} />
              <Route path="*" element={<Overview />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="text-xs text-faint px-8 py-6 text-center">
          CE 311 Practice Lab · solutions computed by built-in solvers · BNBC 2020 provisions as taught in class. Double-check anything that looks off against your notes.
        </footer>
      </div>
      {pageGroup && <CodeDrawer pageGroup={pageGroup} />}
    </div>
  )
}

export function Ce311Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="var(--c-accent)" opacity="0.15" />
      <path d="M5 24 L16 8 L27 24 Z M10.5 24 L16 16 L21.5 24" fill="none" stroke="var(--c-accent)" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  )
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qStatus = useStore((s) => s.qStatus)
  const groups: ('B' | 'A' | 'X')[] = ['B', 'A', 'X']
  // ring = share of this topic's term-final questions marked solved
  const pyqStats = (id: string) => {
    const qs = ALL_PYQ.filter((q) => q.topics.includes(id as never))
    return { total: qs.length, solved: qs.filter((q) => qStatus[q.id] === 'solved').length }
  }
  const glyph = (g: string) => <span className="text-center">{g}</span>
  return (
    <RailSidebar
      open={open}
      onClose={onClose}
      brand={{ logo: <Ce311Logo />, title: 'CE 311 Practice Lab', sub: 'Structural Analysis · term final' }}
      main={[
        { to: '/ce311', icon: glyph('◎'), label: 'Overview & plan', title: 'Overview & plan', end: true },
        { to: '/papers', icon: glyph('▤'), label: 'Past papers & mocks', title: 'Past papers & mocks' },
        { to: '/formulas', icon: glyph('∑'), label: 'Formulas & tables', title: 'Formulas & tables' },
        { to: '/time', icon: glyph('⏱'), label: 'Screen time', title: 'Screen time' },
      ]}
      groups={groups.map((g) => ({
        label: SECTION_LABEL[g],
        items: TOPICS.filter((t) => t.section === g).map((t) => {
          const { total, solved } = pyqStats(t.id)
          const pct = total ? Math.round((solved / total) * 100) : 0
          return {
            to: `/topic/${t.id}`,
            icon: <TopicIcon id={t.id} color={t.color} />,
            label: t.short,
            title: `${t.title} · ${solved}/${total} solved`,
            right: (
              <>
                <span className="text-[10px] text-faint num">{total}Q</span>
                <span title={`${solved}/${total} TF questions solved (${pct}%)`}>
                  <Ring value={total ? solved / total : 0} size={18} stroke={2.6} color={t.color} />
                </span>
              </>
            ),
          }
        }),
      }))}
      footer={<SidebarFooter course="ce311" />}
    />
  )
}

type ArtifactWindow = {
  claude?: { use(name: 'downloads'): Promise<{ save(r: { filename: string; data: string }): Promise<unknown> } | null> }
}

export function SidebarFooter({ course }: { course: 'ce311' | 'ce315' | 'ce341' }) {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const side = useStore((s) => s.bmdSide)
  const setSide = useStore((s) => s.setBmdSide)
  const rotSign = useStore((s) => s.rotSign)
  const setRotSign = useStore((s) => s.setRotSign)
  const importState = useStore((s) => s.importState)
  const download = async () => {
    const filename = `${course}-progress-${new Date().toISOString().slice(0, 10)}.json`
    if (ARTIFACT) {
      // the Artifact viewer blocks plain downloads; its save prompt asks the viewer first
      const downloads = await (window as unknown as ArtifactWindow).claude?.use('downloads')
      await downloads?.save({ filename, data: exportState() }).catch(() => {})
      return
    }
    const blob = new Blob([exportState()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }
  const upload = () => {
    const inp = document.createElement('input')
    inp.type = 'file'
    inp.accept = 'application/json'
    inp.onchange = async () => {
      const f = inp.files?.[0]
      if (f) importState(await f.text())
    }
    inp.click()
  }
  return (
    <div className="border-t border-line p-3 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-mute">Theme</span>
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☾ Dark' : '☀ Light'}
        </button>
      </div>
      {course === 'ce311' && (
      <>
      <div className="flex items-center justify-between">
        <span className="text-mute" title="Where positive (sagging) moment is drawn">BMD drawn on</span>
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setSide(side === 'compression' ? 'tension' : 'compression')}>
          {side === 'compression' ? 'compression side' : 'tension side'}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-mute" title="Positive sense for moment reactions, rotations and unit couples (bending moment stays sagging +, shear stays clockwise +)">Rotation +</span>
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setRotSign(rotSign === 'cw' ? 'ccw' : 'cw')}>
          {rotSign === 'cw' ? '↻ clockwise' : '↺ counter-clockwise'}
        </button>
      </div>
      </>
      )}
      {ARTIFACT && <SyncLine />}
      {CLOUD && <CloudLine />}
      <div className="flex gap-2">
        <button className="btn !py-0.5 !px-2 !text-xs flex-1 justify-center" onClick={download}>
          ⤓ Export progress
        </button>
        <button className="btn !py-0.5 !px-2 !text-xs flex-1 justify-center" onClick={upload}>
          ⤒ Import
        </button>
      </div>
    </div>
  )
}

const SYNC_TEXT: Record<SyncStatus, [string, string]> = {
  off: ['', ''],
  connecting: ['text-faint', 'Connecting…'],
  local: ['text-faint', 'This device only (sign in to sync)'],
  saving: ['text-mute', 'Saving…'],
  synced: ['text-good', '✓ Synced across devices'],
  error: ['text-bad', 'Sync failed, saved on this device'],
}

/** public build: sign in by email link to sync progress across devices; works without an account too */
function CloudLine() {
  const user = useCloudUser()
  const [cls, text] = SYNC_TEXT[useSyncStatus()]
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  if (user)
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-mute truncate" title={user.email}>
            {user.email}
          </span>
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
        <div className={'text-right ' + cls}>{text}</div>
      </div>
    )
  if (!open)
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-faint">Saved on this device</span>
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setOpen(true)} title="Sync your progress across devices">
          Sign in
        </button>
      </div>
    )
  return (
    <form
      className="space-y-1.5"
      onSubmit={async (e) => {
        e.preventDefault()
        setMsg('Sending…')
        const err = await sendMagicLink(email.trim())
        setMsg(err ? `Could not send: ${err}` : 'Check your email for the sign-in link.')
      }}
    >
      <div className="text-mute">Sign in to sync across devices. No password: we email you a link.</div>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-md border border-line bg-panel px-2 py-1 text-xs" />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary !py-0.5 !px-2 !text-xs flex-1 justify-center">
          Email me a link
        </button>
        <button type="button" className="btn !py-0.5 !px-2 !text-xs" onClick={() => (setOpen(false), setMsg(null))}>
          Cancel
        </button>
      </div>
      {msg && <div className="text-faint">{msg}</div>}
    </form>
  )
}

function SyncLine() {
  const [cls, text] = SYNC_TEXT[useSyncStatus()]
  return (
    <div className="flex items-center justify-between">
      <span className="text-mute">Progress</span>
      <span className={cls}>{text}</span>
    </div>
  )
}

export function Header({ onMenu, examDate = EXAM_DATE, examLabel = '31 Oct' }: { onMenu: () => void; examDate?: string; examLabel?: string }) {
  const xp = useStore((s) => s.xp)
  const streak = useStore((s) => s.streak)
  const exam = new Date(examDate + 'T09:00:00')
  const days = Math.max(0, Math.ceil((exam.getTime() - Date.now()) / 86400000))
  const level = Math.floor(xp / 200) + 1
  return (
    <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur border-b border-line">
      <div className="max-w-[1180px] mx-auto px-4 md:px-8 h-14 flex items-center gap-3">
        <button className="lg:hidden btn btn-ghost !px-2" onClick={onMenu} aria-label="menu">
          ☰
        </button>
        <div className="text-sm">
          <span className="font-bold num text-accent">{days}</span> <span className="text-mute">days to go<span className="hidden sm:inline"> · exam {examLabel}</span></span>
        </div>
        <div className="ml-auto flex items-center gap-3 sm:gap-4 text-sm">
          <TimeCounter />
          <span className="text-mute" title="Daily streak — check at least one answer a day">
            🔥 <span className="num text-ink font-semibold">{streak.count}</span>
          </span>
          <span className="hidden sm:flex items-center gap-2" title="XP: 15 for a first-try correct answer, 8 otherwise">
            <span className="text-mute">Lv</span>
            <span className="num font-bold">{level}</span>
            <span className="w-20 h-1.5 rounded-full bg-line overflow-hidden">
              <span className="block h-full bg-accent transition-all" style={{ width: `${((xp % 200) / 200) * 100}%` }} />
            </span>
            <span className="num text-xs text-mute">{xp} XP</span>
          </span>
        </div>
      </div>
    </header>
  )
}
