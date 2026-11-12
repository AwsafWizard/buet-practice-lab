// CE 301 shell: collapsible topic rail on the left, grouped by teacher; no chart pane (nothing to look up).

import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Header, SidebarFooter } from '../App'
import { RailSidebar } from '../components/RailSidebar'
import { Ring } from '../components/ui'
import { useStore } from '../store'
import { TopicIcon } from '../topics/icons'
import { deckFor } from './content'
import { PC_EXAM_DATE } from './plan'
import { PC_BLOCK_LABEL, PC_TOPICS, type PcBlock } from './registry'

const PcOverview = lazy(() => import('./pages/PcOverview'))
const PcTopicPage = lazy(() => import('./pages/PcTopicPage'))
const PcGym = lazy(() => import('./pages/PcGym'))
const PcPapers = lazy(() => import('./pages/PcPapers'))
const PcQuestionPage = lazy(() => import('./pages/PcQuestionPage'))
const PcAnswerBank = lazy(() => import('./pages/PcAnswerBank'))
const ScreenTime = lazy(() => import('../pages/ScreenTime'))

export function PcLogo({ size = 30 }: { size?: number }) {
  // a contract page with a signature flourish
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="var(--c-accent)" opacity="0.15" />
      <path d="M9 6 H19 L24 11 V26 H9 Z" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 6 V11 H24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 15 H21 M12 18.5 H21" stroke="var(--c-accent)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 22.5 q1.5 -2.5 3 0 t3 0" fill="none" stroke="var(--c-accent2)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function PcApp() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  return (
    <div className="min-h-full flex">
      <PcSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenu={() => setOpen(true)} examDate={PC_EXAM_DATE} examLabel="17 Nov" />
        <main className="@container/page flex-1 px-4 md:px-8 py-6 max-w-[1180px] w-full mx-auto">
          <Suspense fallback={<div className="text-mute p-10">Loading…</div>}>
            <Routes>
              <Route path="/ce301" element={<PcOverview />} />
              <Route path="/ce301/gym" element={<PcGym />} />
              <Route path="/ce301/topic/:id" element={<PcTopicPage />} />
              <Route path="/ce301/topic/:id/:tab" element={<PcTopicPage />} />
              <Route path="/ce301/papers" element={<PcPapers />} />
              <Route path="/ce301/papers/:paper" element={<PcPapers />} />
              <Route path="/ce301/q/:qid" element={<PcQuestionPage />} />
              <Route path="/ce301/answers" element={<PcAnswerBank />} />
              <Route path="/ce301/time" element={<ScreenTime />} />
              <Route path="*" element={<PcOverview />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="text-xs text-faint px-8 py-6 text-center">
          CE 301 Practice Lab · answers follow IA sir’s procurement material, Tanvir sir’s slides (OIA Ma’am) and the communication class notes; where the old question bank differs, the class version is used. Check anything odd against your notes.
        </footer>
      </div>
    </div>
  )
}

function PcSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      brand={{ logo: <PcLogo />, title: 'CE 301 Practice Lab', sub: 'Professional practice · term final' }}
      main={[
        { to: '/ce301', icon: glyph('◎'), label: 'Overview & plan', title: 'Overview & plan', end: true },
        { to: '/ce301/gym', icon: glyph('🧠'), label: 'Memory gym', title: 'Memory gym — every flashcard and drill' },
        { to: '/ce301/papers', icon: glyph('▤'), label: 'Past papers & mocks', title: 'Past papers & mocks' },
        { to: '/ce301/answers', icon: glyph('✎'), label: 'Answer bank', title: 'Answer bank — model answers, most-asked first' },
        { to: '/ce301/time', icon: glyph('⏱'), label: 'Screen time', title: 'Screen time' },
      ]}
      groups={(['IA', 'OIA', 'AAN'] as PcBlock[]).map((b) => ({
        label: PC_BLOCK_LABEL[b],
        items: PC_TOPICS.filter((t) => t.block === b).map((t) => {
          const { total, known: k } = known(t.id)
          return {
            to: `/ce301/topic/${t.id}`,
            icon: <TopicIcon id={t.id} color={t.color} />,
            label: t.short,
            title: `${t.title} · ${k}/${total} cards known`,
            right: (
              <>
                <span className="text-[10px] text-faint num">{total}</span>
                <Ring value={total ? k / total : 0} size={18} stroke={2.6} color={t.color} />
              </>
            ),
          }
        }),
      }))}
      footer={<SidebarFooter course="ce301" />}
    />
  )
}
