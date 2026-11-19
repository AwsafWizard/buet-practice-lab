// CE 331 shell: collapsible topic rail on the left, grouped by teacher (Tanvir sir, Rowshan ma'am, Snigdha ma'am).

import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { accountRoutes, useAccountLinks } from '../account/nav'
import { Header, SidebarFooter } from '../App'
import { RailSidebar } from '../components/RailSidebar'
import { Ring } from '../components/ui'
import { useStore } from '../store'
import { TopicIcon } from '../topics/icons'
import { CodePane, useEvPageGroup } from './components/CodePane'
import { deckFor } from './content'
import { EV_LABS } from './labs'
import { EV_EXAM_DATE } from './plan'
import { EV_MATHS } from './pyq'
import { paneWidth, usePane } from './reference/pane'
import { EV_BLOCK_LABEL, EV_BLOCKS, EV_TOPICS } from './registry'

const EvOverview = lazy(() => import('./pages/EvOverview'))
const EvTopicPage = lazy(() => import('./pages/EvTopicPage'))
const EvWell = lazy(() => import('./pages/EvWell'))
const EvPapers = lazy(() => import('./pages/EvPapers'))
const EvQuestionPage = lazy(() => import('./pages/EvQuestionPage'))
const EvAnswerBank = lazy(() => import('./pages/EvAnswerBank'))
const EvMathsBank = lazy(() => import('./pages/EvMathsBank'))
const ScreenTime = lazy(() => import('../pages/ScreenTime'))

export function EvLogo({ size = 30 }: { size?: number }) {
  // a water drop over ripples
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="var(--c-accent)" opacity="0.15" />
      <path d="M16 5 C12.5 10.5 10 13.5 10 17 A6 6 0 0 0 22 17 C22 13.5 19.5 10.5 16 5 Z" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13.2 17.5 a3 3 0 0 0 2.6 2.6" fill="none" stroke="var(--c-accent)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 26 q2.5 -2 5 0 t5 0 t5 0 t5 0" fill="none" stroke="var(--c-accent2)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function EvApp() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const pageGroup = useEvPageGroup()
  const pane = usePane()
  useEffect(() => setOpen(false), [loc.pathname])
  return (
    <div className="min-h-full flex">
      <EvSidebar open={open} onClose={() => setOpen(false)} />
      {/* from lg up the open chart pane sits beside the page (side by side), never on top of it */}
      <div
        className={'flex-1 min-w-0 flex flex-col transition-[padding] duration-200 ' + (pane.open ? 'lg:pr-[var(--pw)]' : '')}
        style={{ '--pw': `${paneWidth(pane.width)}px` } as React.CSSProperties}
      >
        <Header onMenu={() => setOpen(true)} examDate={EV_EXAM_DATE} examLabel="23 Nov" />
        <main className="@container/page flex-1 px-4 md:px-8 py-6 max-w-[1180px] w-full mx-auto">
          <Suspense fallback={<div className="text-mute p-10">Loading…</div>}>
            <Routes>
              <Route path="/ce331" element={<EvOverview />} />
              <Route path="/ce331/well" element={<EvWell />} />
              <Route path="/ce331/gym" element={<EvWell />} />
              <Route path="/ce331/topic/:id" element={<EvTopicPage />} />
              <Route path="/ce331/topic/:id/:tab" element={<EvTopicPage />} />
              <Route path="/ce331/papers" element={<EvPapers />} />
              <Route path="/ce331/papers/:paper" element={<EvPapers />} />
              <Route path="/ce331/q/:qid" element={<EvQuestionPage />} />
              <Route path="/ce331/answers" element={<EvAnswerBank />} />
              <Route path="/ce331/maths" element={<EvMathsBank />} />
              <Route path="/ce331/time" element={<ScreenTime />} />
              {accountRoutes('ce331')}
              <Route path="*" element={<EvOverview />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="text-xs text-faint px-8 py-6 text-center">
          CE 331 Practice Lab · answers follow this term’s (CE22) slides of Tanvir sir, Rowshan ma’am and Snigdha ma’am and the class notes; every past question says where its answer comes from. Numbers are computed by built-in solvers. Check anything odd against your notes.
        </footer>
      </div>
      <CodePane pageGroup={pageGroup} />
    </div>
  )
}

/** what a topic's maths is: past-paper calculations/derivations (as in the Maths bank) and/or a lab */
function mathsNote(id: string) {
  const n = EV_MATHS.filter((q) => q.topics[0] === id).length
  const lab = id in EV_LABS
  if (!n && !lab) return null
  const parts = [n ? `${n} past-paper maths part${n > 1 ? 's' : ''}` : '', lab ? 'a lab' : ''].filter(Boolean)
  return `Has maths: ${parts.join(' + ')}`
}

function MathsMark({ note }: { note: string }) {
  return (
    <span title={note} aria-label={note} className="text-[10px] font-bold leading-none px-1 py-0.5 rounded bg-accent/15 text-accent">
      ∑
    </span>
  )
}

function EvSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const accountLinks = useAccountLinks('ce331')
  const cards = useStore((s) => s.cards)
  const glyph = (g: string) => <span className="text-center">{g}</span>
  const known = (id: string) => {
    const d = deckFor(id)
    return { total: d.length, known: d.filter((c) => (cards[c.id]?.box ?? 0) >= 4).length }
  }
  return (
    <RailSidebar
      open={open}
      onClose={onClose}
      brand={{ logo: <EvLogo />, title: 'CE 331 Practice Lab', sub: 'Environmental engg I · term final' }}
      main={[
        { to: '/ce331', icon: glyph('◎'), label: 'Overview & plan', title: 'Overview & plan', end: true },
        { to: '/ce331/well', icon: glyph('🪣'), label: 'Memory Well', title: 'Memory Well — every flashcard and recall drill' },
        { to: '/ce331/papers', icon: glyph('▤'), label: 'Past papers & mocks', title: 'Past papers & mocks' },
        { to: '/ce331/answers', icon: glyph('✎'), label: 'Answer bank', title: 'Answer bank — model answers, most-asked first' },
        { to: '/ce331/maths', icon: glyph('∑'), label: 'Maths bank', title: 'Maths bank — every past calculation, design and derivation with worked solutions' },
        ...accountLinks,
      ]}
      groups={EV_BLOCKS.map((b) => ({
        label: EV_BLOCK_LABEL[b],
        items: EV_TOPICS.filter((t) => t.block === b).map((t) => {
          const { total, known: k } = known(t.id)
          const maths = mathsNote(t.id)
          return {
            to: `/ce331/topic/${t.id}`,
            icon: <TopicIcon id={t.id} color={t.color} />,
            label: t.short,
            title: `${t.title} · ${k}/${total} cards known${maths ? ' · ∑ ' + maths.toLowerCase() : ''}`,
            right: (
              <>
                {maths && <MathsMark note={maths} />}
                <span className="text-[10px] text-faint num">{total}</span>
                <Ring value={total ? k / total : 0} size={18} stroke={2.6} color={t.color} />
              </>
            ),
          }
        }),
      }))}
      footer={<SidebarFooter course="ce331" />}
    />
  )
}
