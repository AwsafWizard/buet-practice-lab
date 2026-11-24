// CE 104 shell: topic rail on the left grouped by kind of field work; Gruvbox theme (styles.css, data-course='ce104').

import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { accountRoutes, useAccountLinks } from '../account/nav'
import { Header, SidebarFooter } from '../App'
import { RailSidebar } from '../components/RailSidebar'
import { Ring } from '../components/ui'
import { today, useStore } from '../store'
import { questionsFor, qKey } from './content'
import { nextTest } from './plan'
import { SV_GROUP_LABEL, SV_GROUPS, SV_TOPICS } from './registry'
import { SvTopicIcon } from './components/icons'

const SvOverview = lazy(() => import('./pages/SvOverview'))
const SvTopicPage = lazy(() => import('./pages/SvTopicPage'))
const SvQuiz = lazy(() => import('./pages/SvQuiz'))
const SvDrills = lazy(() => import('./pages/SvDrills'))
const SvViva = lazy(() => import('./pages/SvViva'))
const SvField = lazy(() => import('./pages/SvField'))
const SvFormulas = lazy(() => import('./pages/SvFormulas'))
const ScreenTime = lazy(() => import('../pages/ScreenTime'))

export function SvLogo({ size = 30 }: { size?: number }) {
  // a level on its tripod, with a ranging rod
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="var(--c-accent)" opacity="0.15" />
      <path d="M8 9 H20 V13 H8 Z M14 13 V16 M14 16 L8.5 26 M14 16 V26 M14 16 L19.5 26" fill="none" stroke="var(--c-accent)" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M25 6 V26" stroke="var(--c-accent2)" strokeWidth="2.4" strokeDasharray="3 3" />
    </svg>
  )
}

export default function SvApp() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  const nt = nextTest(today())
  return (
    <div className="min-h-full flex">
      <SvSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenu={() => setOpen(true)} examDate={nt.date} examLabel={nt.short} />
        <main className="@container/page flex-1 px-4 md:px-8 py-6 max-w-[1180px] w-full mx-auto">
          <Suspense fallback={<div className="text-mute p-10">Loading…</div>}>
            <Routes>
              <Route path="/ce104" element={<SvOverview />} />
              <Route path="/ce104/topic/:id" element={<SvTopicPage />} />
              <Route path="/ce104/topic/:id/:tab" element={<SvTopicPage />} />
              <Route path="/ce104/quiz" element={<SvQuiz />} />
              <Route path="/ce104/maths" element={<SvDrills />} />
              <Route path="/ce104/viva" element={<SvViva />} />
              <Route path="/ce104/field" element={<SvField />} />
              <Route path="/ce104/field/:sheet" element={<SvField />} />
              <Route path="/ce104/formulas" element={<SvFormulas />} />
              <Route path="/ce104/time" element={<ScreenTime />} />
              {accountRoutes('ce104')}
              <Route path="*" element={<SvOverview />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="text-xs text-faint px-8 py-6 text-center">
          CE 104 Practice Lab · built from this term’s lecture sheet and field-work details, the class notes and the 18-batch reports. Field-book sheets are saved on this device (and synced when you sign in). Check anything odd against your teacher’s instructions.
        </footer>
      </div>
    </div>
  )
}

function SvSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const accountLinks = useAccountLinks('ce104')
  const attempts = useStore((s) => s.attempts)
  const book = useStore((s) => s.fieldbook)
  const sheets = Object.values(book).filter((s) => !s.deleted).length
  const glyph = (g: string) => <span className="text-center">{g}</span>
  const stat = (id: string) => {
    const qs = questionsFor(id)
    return { total: qs.length, right: qs.filter((q) => attempts[qKey(q)]?.correct).length }
  }
  return (
    <RailSidebar
      open={open}
      onClose={onClose}
      brand={{ logo: <SvLogo />, title: 'CE 104 Practice Lab', sub: 'Practical surveying · field days' }}
      main={[
        { to: '/ce104', icon: glyph('◎'), label: 'Overview & field days', title: 'Overview & field-day schedule', end: true },
        { to: '/ce104/field', icon: glyph('📒'), label: 'Field book', title: 'Field book — data sheets with live calculations and checks', right: sheets ? <span className="text-[10px] text-faint num">{sheets}</span> : undefined },
        { to: '/ce104/quiz', icon: glyph('☑'), label: 'Quiz arena', title: 'Quiz arena — MCQ, fill in the blanks, true/false' },
        { to: '/ce104/maths', icon: glyph('∑'), label: 'Maths drills', title: 'Maths drills — short field sums with worked steps' },
        { to: '/ce104/viva', icon: glyph('🎤'), label: 'Viva deck', title: 'Viva deck — oral questions as flashcards' },
        { to: '/ce104/formulas', icon: glyph('ƒ'), label: 'Formula sheet', title: 'Formula sheet — every formula and table on one page' },
        ...accountLinks,
      ]}
      groups={SV_GROUPS.map((g) => ({
        label: SV_GROUP_LABEL[g],
        items: SV_TOPICS.filter((t) => t.group === g).map((t) => {
          const { total, right } = stat(t.id)
          return {
            to: `/ce104/topic/${t.id}`,
            icon: <SvTopicIcon id={t.id} color={t.color} />,
            label: t.short,
            title: `${t.title} · ${right}/${total} questions right`,
            right: (
              <>
                <span className="text-[10px] text-faint num">{total}</span>
                <Ring value={total ? right / total : 0} size={18} stroke={2.6} color={t.color} />
              </>
            ),
          }
        }),
      }))}
      footer={<SidebarFooter course="ce104" />}
    />
  )
}
