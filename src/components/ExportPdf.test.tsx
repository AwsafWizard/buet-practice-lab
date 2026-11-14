// Every course's problems carry the ⋮ menu, and every problem renders as a printable document
// (with collapsible steps forced open, as "Extract as PDF" renders them).

import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { PcQuestionCard } from '../ppc/components/PcQuestionCard'
import { PC_ALL } from '../ppc/pyq'
import { ALL_PYQ } from '../pyq'
import { RcQuestionCard } from '../rc/components/RcQuestionCard'
import { TheoryList as RcTheoryList } from '../rc/components/TheoryList'
import { RC_ALL } from '../rc/pyq'
import { RC_MODULES } from '../rc/topics/modules'
import { SmQuestionCard } from '../soil/components/SmQuestionCard'
import { TheoryList as SmTheoryList } from '../soil/components/TheoryList'
import { SM_ALL } from '../soil/pyq'
import { SM_MODULES } from '../soil/topics/modules'
import { ProblemDoc } from './ExportPdf'
import { MODULES } from '../topics/modules'
import { QuestionCard } from './QuestionCard'
import { PrintMode } from './ui'

const html = (n: ReactNode) => renderToString(<MemoryRouter>{n}</MemoryRouter>)
const printed = (n: ReactNode) => html(<PrintMode.Provider value={true}>{n}</PrintMode.Provider>)
const MENU = 'aria-label="More for'

// the topic modules (practice problems, theory banks) load lazily in the app
const load = async <M,>(mods: Record<string, () => Promise<M>>) => Promise.all(Object.values(mods).map((f) => f()))
let own: { course: string; q: (typeof ALL_PYQ)[number] | (typeof RC_ALL)[number] | (typeof SM_ALL)[number] }[] = []
let rcTheory: Awaited<ReturnType<(typeof RC_MODULES)[keyof typeof RC_MODULES]>>['theory'] = []
let smTheory: Awaited<ReturnType<(typeof SM_MODULES)[keyof typeof SM_MODULES]>>['theory'] = []
beforeAll(async () => {
  const [a, b, c] = await Promise.all([load(MODULES), load(RC_MODULES), load(SM_MODULES)])
  own = [...a.flatMap((m) => m.problems.map((q) => ({ course: 'CE 311', q }))), ...b.flatMap((m) => m.problems.map((q) => ({ course: 'CE 315', q }))), ...c.flatMap((m) => m.problems.map((q) => ({ course: 'CE 341', q })))]
  rcTheory = b.flatMap((m) => m.theory)
  smTheory = c.flatMap((m) => m.theory)
}, 60_000)

describe('every course card has the ⋮ menu', () => {
  it('CE 311', () => expect(html(<QuestionCard q={ALL_PYQ[0]} />)).toContain(MENU))
  it('CE 315', () => expect(html(<RcQuestionCard q={RC_ALL[0]} />)).toContain(MENU))
  it('CE 341', () => expect(html(<SmQuestionCard q={SM_ALL[0]} />)).toContain(MENU))
  it('CE 301', () => expect(html(<PcQuestionCard q={PC_ALL[0]} />)).toContain(MENU))
  it('CE 315 and CE 341 theory banks', () => {
    expect(rcTheory.length).toBeGreaterThan(0)
    expect(html(<RcTheoryList items={rcTheory.slice(0, 1)} />)).toContain(MENU)
    expect(html(<SmTheoryList items={smTheory.slice(0, 1)} />)).toContain(MENU)
  })
})

const ok = (out: string) => {
  expect(out).not.toContain('Couldn’t print')
  expect(out).not.toContain('NaN')
}

describe('every problem prints', () => {
  it('practice problems from the topic pages', () => {
    expect(own.length).toBeGreaterThan(0)
    for (const { course, q } of own)
      ok(printed(<ProblemDoc course={course} source="practice" title={q.title} text={q.text} figure={q.figure} checks={q.checks} solution={q.solution} notes={q.notes} from="test" />))
   }, 60_000) // one test for every practice problem in all courses
  const all = [
    ...ALL_PYQ.map((q) => ({ course: 'CE 311', q })),
    ...RC_ALL.map((q) => ({ course: 'CE 315', q })),
    ...SM_ALL.map((q) => ({ course: 'CE 341', q })),
  ]
  for (const { course, q } of all)
    it(`${course} ${q.id}`, () => {
      const out = printed(
        <ProblemDoc course={course} source="test" title={q.title} text={q.text} figure={q.figure} checks={q.checks} solution={q.solution} notes={q.notes} from="test" />,
      )
      ok(out)
    })
})
