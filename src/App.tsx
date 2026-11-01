import { lazy, Suspense, useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { CodeDrawer, usePageGroup } from './components/CodeDrawer'
import { TimeCounter } from './components/TimeCounter'
import { Ring } from './components/ui'
import { ALL_PYQ } from './pyq'
import { useDrawer } from './reference/drawer'
import { exportState, useStore } from './store'
import { ARTIFACT, useSyncStatus, type SyncStatus } from './sync'
import { SECTION_LABEL, TOPICS } from './topics/registry'
import { TopicIcon } from './topics/icons'
import { EXAM_DATE } from './pages/planner/template'

const Overview = lazy(() => import('./pages/Overview'))
const TopicPage = lazy(() => import('./pages/TopicPage'))
const Papers = lazy(() => import('./pages/Papers'))
const Formulas = lazy(() => import('./pages/Formulas'))
const QuestionPage = lazy(() => import('./pages/QuestionPage'))
const ScreenTime = lazy(() => import('./pages/ScreenTime'))

export default function App() {
  const theme = useStore((s) => s.theme)
  const rotSign = useStore((s) => s.rotSign)
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const pageGroup = usePageGroup()
  const drawer = useDrawer()
  const drawerOpen = drawer.open && pageGroup !== null
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
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
              <Route path="/" element={<Overview />} />
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

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qStatus = useStore((s) => s.qStatus)
  const groups: ('B' | 'A' | 'X')[] = ['B', 'A', 'X']
  // ring = share of this topic's term-final questions marked solved
  const pyqStats = (id: string) => {
    const qs = ALL_PYQ.filter((q) => q.topics.includes(id as never))
    return { total: qs.length, solved: qs.filter((q) => qStatus[q.id] === 'solved').length }
  }
  const link = (to: string, label: React.ReactNode, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ' + (isActive ? 'bg-accent/15 text-ink font-semibold' : 'text-mute hover:text-ink hover:bg-panel2')
      }
    >
      {label}
    </NavLink>
  )
  return (
    <>
      <div className={'fixed inset-0 bg-black/40 z-30 lg:hidden ' + (open ? '' : 'hidden')} onClick={onClose} />
      <aside
        className={
          'fixed lg:sticky top-0 z-40 h-screen w-[270px] shrink-0 bg-panel border-r border-line flex flex-col transition-transform ' +
          (open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }
      >
        <div className="px-4 py-4 flex items-center gap-2.5 border-b border-line">
          <svg width="30" height="30" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="var(--c-accent)" opacity="0.15" />
            <path d="M5 24 L16 8 L27 24 Z M10.5 24 L16 16 L21.5 24" fill="none" stroke="var(--c-accent)" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="font-extrabold leading-tight">CE 311 Practice Lab</div>
            <div className="text-[11px] text-faint">Structural Analysis · term final</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto scroll-thin px-2 py-3 space-y-4">
          <div className="space-y-0.5">
            {link('/', <><span className="w-6 text-center">◎</span> Overview & plan</>, true)}
            {link('/papers', <><span className="w-6 text-center">▤</span> Past papers & mocks</>)}
            {link('/formulas', <><span className="w-6 text-center">∑</span> Formulas & tables</>)}
            {link('/time', <><span className="w-6 text-center">⏱</span> Screen time</>)}
          </div>
          {groups.map((g) => (
            <div key={g}>
              <div className="px-3 text-[10.5px] uppercase tracking-wider text-faint font-bold mb-1">{SECTION_LABEL[g]}</div>
              <div className="space-y-0.5">
                {TOPICS.filter((t) => t.section === g).map((t) => {
                  const { total, solved } = pyqStats(t.id)
                  const pct = total ? Math.round((solved / total) * 100) : 0
                  return (
                    <NavLink
                      key={t.id}
                      to={`/topic/${t.id}`}
                      className={({ isActive }) =>
                        'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ' + (isActive ? 'bg-accent/15 text-ink font-semibold' : 'text-mute hover:text-ink hover:bg-panel2')
                      }
                    >
                      <TopicIcon id={t.id} color={t.color} />
                      <span className="flex-1 truncate">{t.short}</span>
                      <span className="text-[10px] text-faint num">{total}Q</span>
                      <span title={`${solved}/${total} TF questions solved (${pct}%)`}>
                        <Ring value={total ? solved / total : 0} size={18} stroke={2.6} color={t.color} />
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <SidebarFooter />
      </aside>
    </>
  )
}

type ArtifactWindow = {
  claude?: { use(name: 'downloads'): Promise<{ save(r: { filename: string; data: string }): Promise<unknown> } | null> }
}

function SidebarFooter() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const side = useStore((s) => s.bmdSide)
  const setSide = useStore((s) => s.setBmdSide)
  const rotSign = useStore((s) => s.rotSign)
  const setRotSign = useStore((s) => s.setRotSign)
  const importState = useStore((s) => s.importState)
  const download = async () => {
    const filename = `ce311-progress-${new Date().toISOString().slice(0, 10)}.json`
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
      {ARTIFACT && <SyncLine />}
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

function SyncLine() {
  const [cls, text] = SYNC_TEXT[useSyncStatus()]
  return (
    <div className="flex items-center justify-between">
      <span className="text-mute">Progress</span>
      <span className={cls}>{text}</span>
    </div>
  )
}

function Header({ onMenu }: { onMenu: () => void }) {
  const xp = useStore((s) => s.xp)
  const streak = useStore((s) => s.streak)
  const exam = new Date(EXAM_DATE + 'T09:00:00')
  const days = Math.max(0, Math.ceil((exam.getTime() - Date.now()) / 86400000))
  const level = Math.floor(xp / 200) + 1
  return (
    <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur border-b border-line">
      <div className="max-w-[1180px] mx-auto px-4 md:px-8 h-14 flex items-center gap-3">
        <button className="lg:hidden btn btn-ghost !px-2" onClick={onMenu} aria-label="menu">
          ☰
        </button>
        <div className="text-sm">
          <span className="font-bold num text-accent">{days}</span> <span className="text-mute">days to go<span className="hidden sm:inline"> · exam 31 Oct</span></span>
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
