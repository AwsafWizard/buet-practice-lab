// CE 315 shell: collapsible topic rail on the left, code pane on the right.

import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Header, SidebarFooter } from '../App'
import { RailSidebar } from '../components/RailSidebar'
import { Ring } from '../components/ui'
import { useStore } from '../store'
import { TopicIcon } from '../topics/icons'
import { CodePane, useRcPageGroup } from './components/CodePane'
import { RC_EXAM_DATE } from './plan'
import { RC_ALL } from './pyq'
import { paneWidth, usePane } from './reference/pane'
import { RC_SECTION_LABEL, RC_TOPICS } from './registry'

const RcOverview = lazy(() => import('./pages/RcOverview'))
const RcTopicPage = lazy(() => import('./pages/RcTopicPage'))
const RcPapers = lazy(() => import('./pages/RcPapers'))
const RcQuestionPage = lazy(() => import('./pages/RcQuestionPage'))
const RcTheoryBank = lazy(() => import('./pages/RcTheoryBank'))
const ScreenTime = lazy(() => import('../pages/ScreenTime'))

export function RcLogo({ size = 30 }: { size?: number }) {
  // beam section: concrete box, two compression bars, three tension bars
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="var(--c-accent)" opacity="0.15" />
      <rect x="9" y="5" width="14" height="22" rx="1.5" fill="none" stroke="var(--c-accent)" strokeWidth="2" />
      <circle cx="13" cy="9.5" r="1.4" fill="var(--c-accent)" />
      <circle cx="19" cy="9.5" r="1.4" fill="var(--c-accent)" />
      <circle cx="12.6" cy="22.5" r="1.7" fill="var(--c-accent)" />
      <circle cx="16" cy="22.5" r="1.7" fill="var(--c-accent)" />
      <circle cx="19.4" cy="22.5" r="1.7" fill="var(--c-accent)" />
    </svg>
  )
}

export default function RcApp() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const pageGroup = useRcPageGroup()
  const pane = usePane()
  useEffect(() => setOpen(false), [loc.pathname])
  return (
    <div className="min-h-full flex">
      <RcSidebar open={open} onClose={() => setOpen(false)} />
      {/* from lg up the open code pane sits beside the page (side by side), never on top of it */}
      <div
        className={'flex-1 min-w-0 flex flex-col transition-[padding] duration-200 ' + (pane.open ? 'lg:pr-[var(--pw)]' : '')}
        style={{ '--pw': `${paneWidth(pane.width)}px` } as React.CSSProperties}
      >
        <Header onMenu={() => setOpen(true)} examDate={RC_EXAM_DATE} examLabel="5 Nov" />
        <main className="@container/page flex-1 px-4 md:px-8 py-6 max-w-[1180px] w-full mx-auto">
          <Suspense fallback={<div className="text-mute p-10">Loading…</div>}>
            <Routes>
              <Route path="/ce315" element={<RcOverview />} />
              <Route path="/ce315/topic/:id" element={<RcTopicPage />} />
              <Route path="/ce315/topic/:id/:tab" element={<RcTopicPage />} />
              <Route path="/ce315/papers" element={<RcPapers />} />
              <Route path="/ce315/papers/:paper" element={<RcPapers />} />
              <Route path="/ce315/q/:qid" element={<RcQuestionPage />} />
              <Route path="/ce315/theory" element={<RcTheoryBank />} />
              <Route path="/ce315/time" element={<ScreenTime />} />
              <Route path="*" element={<RcOverview />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="text-xs text-faint px-8 py-6 text-center">
          CE 315 Practice Lab · ACI 318 / BNBC 2020 as taught in class (Nilson, US units) · numbers come from the built-in solvers. Check anything odd against your notes.
        </footer>
      </div>
      <CodePane pageGroup={pageGroup} />
    </div>
  )
}

function RcSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qStatus = useStore((s) => s.qStatus)
  const glyph = (g: string) => <span className="text-center">{g}</span>
  const stats = (id: string) => {
    const qs = RC_ALL.filter((q) => q.topics.includes(id as never))
    return { total: qs.length, solved: qs.filter((q) => qStatus[q.id] === 'solved').length }
  }
  return (
    <RailSidebar
      open={open}
      onClose={onClose}
      brand={{ logo: <RcLogo />, title: 'CE 315 Practice Lab', sub: 'Concrete Structures I · term final' }}
      main={[
        { to: '/ce315', icon: glyph('◎'), label: 'Overview & plan', title: 'Overview & plan', end: true },
        { to: '/ce315/papers', icon: glyph('▤'), label: 'Past papers & mocks', title: 'Past papers & mocks' },
        { to: '/ce315/theory', icon: glyph('✎'), label: 'Theory bank', title: 'Theory bank' },
        { to: '/ce315/time', icon: glyph('⏱'), label: 'Screen time', title: 'Screen time' },
      ]}
      groups={(['A', 'B'] as const).map((sec) => ({
        label: RC_SECTION_LABEL[sec],
        items: RC_TOPICS.filter((t) => t.section === sec).map((t) => {
          const { total, solved } = stats(t.id)
          return {
            to: `/ce315/topic/${t.id}`,
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
      footer={<SidebarFooter course="ce315" />}
    />
  )
}
