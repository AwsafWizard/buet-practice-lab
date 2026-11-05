// CE 341 shell: collapsible topic rail on the left, chart & table pane on the right.

import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Header, SidebarFooter } from '../App'
import { RailSidebar } from '../components/RailSidebar'
import { Ring } from '../components/ui'
import { useStore } from '../store'
import { TopicIcon } from '../topics/icons'
import { CodePane, useSmPageGroup } from './components/CodePane'
import { SM_EXAM_DATE } from './plan'
import { SM_ALL } from './pyq'
import { paneWidth, usePane } from './reference/pane'
import { SM_SECTION_LABEL, SM_TOPICS } from './registry'

const SmOverview = lazy(() => import('./pages/SmOverview'))
const SmTopicPage = lazy(() => import('./pages/SmTopicPage'))
const SmPapers = lazy(() => import('./pages/SmPapers'))
const SmQuestionPage = lazy(() => import('./pages/SmQuestionPage'))
const SmTheoryBank = lazy(() => import('./pages/SmTheoryBank'))
const ScreenTime = lazy(() => import('../pages/ScreenTime'))

export function SmLogo({ size = 30 }: { size?: number }) {
  // soil profile: three strata under a footing, water table mark
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="var(--c-accent)" opacity="0.15" />
      <rect x="11" y="5" width="10" height="4" rx="1" fill="var(--c-accent)" />
      <path d="M5 13 Q11 11 16 13 T27 13" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 19 Q11 21 16 19 T27 19" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 25 Q11 23 16 25 T27 25" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M22 15.5 h4 l-2 2.5 z" fill="var(--c-accent)" />
    </svg>
  )
}

export default function SmApp() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const pageGroup = useSmPageGroup()
  const pane = usePane()
  useEffect(() => setOpen(false), [loc.pathname])
  return (
    <div className="min-h-full flex">
      <SmSidebar open={open} onClose={() => setOpen(false)} />
      {/* from lg up the open chart pane sits beside the page (side by side), never on top of it */}
      <div
        className={'flex-1 min-w-0 flex flex-col transition-[padding] duration-200 ' + (pane.open ? 'lg:pr-[var(--pw)]' : '')}
        style={{ '--pw': `${paneWidth(pane.width)}px` } as React.CSSProperties}
      >
        <Header onMenu={() => setOpen(true)} examDate={SM_EXAM_DATE} examLabel="12 Nov" />
        <main className="@container/page flex-1 px-4 md:px-8 py-6 max-w-[1180px] w-full mx-auto">
          <Suspense fallback={<div className="text-mute p-10">Loading…</div>}>
            <Routes>
              <Route path="/ce341" element={<SmOverview />} />
              <Route path="/ce341/topic/:id" element={<SmTopicPage />} />
              <Route path="/ce341/topic/:id/:tab" element={<SmTopicPage />} />
              <Route path="/ce341/papers" element={<SmPapers />} />
              <Route path="/ce341/papers/:paper" element={<SmPapers />} />
              <Route path="/ce341/q/:qid" element={<SmQuestionPage />} />
              <Route path="/ce341/theory" element={<SmTheoryBank />} />
              <Route path="/ce341/time" element={<ScreenTime />} />
              <Route path="*" element={<SmOverview />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="text-xs text-faint px-8 py-6 text-center">
          CE 341 Practice Lab · soil mechanics as taught by AJK sir and SJMY sir (Das, SI units) · numbers come from the built-in solvers. Check anything odd against your notes.
        </footer>
      </div>
      <CodePane pageGroup={pageGroup} />
    </div>
  )
}

function SmSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qStatus = useStore((s) => s.qStatus)
  const glyph = (g: string) => <span className="text-center">{g}</span>
  const stats = (id: string) => {
    const qs = SM_ALL.filter((q) => q.topics.includes(id as never))
    return { total: qs.length, solved: qs.filter((q) => qStatus[q.id] === 'solved').length }
  }
  return (
    <RailSidebar
      open={open}
      onClose={onClose}
      brand={{ logo: <SmLogo />, title: 'CE 341 Practice Lab', sub: 'Soil Mechanics · term final' }}
      main={[
        { to: '/ce341', icon: glyph('◎'), label: 'Overview & plan', title: 'Overview & plan', end: true },
        { to: '/ce341/papers', icon: glyph('▤'), label: 'Past papers & mocks', title: 'Past papers & mocks' },
        { to: '/ce341/theory', icon: glyph('✎'), label: 'Theory bank', title: 'Theory bank' },
        { to: '/ce341/time', icon: glyph('⏱'), label: 'Screen time', title: 'Screen time' },
      ]}
      groups={(['A', 'B'] as const).map((sec) => ({
        label: SM_SECTION_LABEL[sec],
        items: SM_TOPICS.filter((t) => t.section === sec).map((t) => {
          const { total, solved } = stats(t.id)
          return {
            to: `/ce341/topic/${t.id}`,
            icon: <TopicIcon id={t.id} color={t.color} />,
            label: t.short,
            title: `${t.title} · ${solved}/${total} solved`,
            right: (
              <>
                <span className="text-[10px] text-faint num">{total}Q</span>
                <Ring value={total ? solved / total : 0} size={18} stroke={2.6} color={t.color} />
              </>
            ),
          }
        }),
      }))}
      footer={<SidebarFooter course="ce341" />}
    />
  )
}
