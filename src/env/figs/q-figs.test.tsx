// Every figure a paper prints is redrawn: parts whose text carries a [FIG …] note have a question figure, and each
// figure renders clean in place of that note.
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { FIG_RE, QuestionText } from '../components/EvQuestionCard'
import { EV_ALL } from '../pyq'
import { EV_PARTS } from '../pyq/parts'
import { EV_QFIGS } from './q-figs'

const BAD = /NaN|undefined|Infinity|katex-error/

describe('question figures', () => {
  it('every part with a [FIG …] note, or that points at Fig./Figure, has a redrawn figure', () => {
    const missing = EV_PARTS.filter((p) => (/\[FIG/.test(p.text) || /\b(Fig\.|Figure)\s*\d/.test(p.text)) && !EV_QFIGS[p.id]).map((p) => p.id)
    expect(missing).toEqual([])
  })
  it('every figure belongs to a real part', () => {
    const ids = new Set(EV_PARTS.map((p) => p.id))
    expect(Object.keys(EV_QFIGS).filter((id) => !ids.has(id))).toEqual([])
  })
  it('the figure replaces the note and renders clean', () => {
    for (const q of EV_ALL.filter((x) => x.qfig)) {
      const html = renderToString(
        <MemoryRouter>
          <QuestionText q={q} />
        </MemoryRouter>,
      )
      expect(html, q.id).not.toMatch(BAD)
      expect(html, q.id).toContain('<svg')
      expect(html, q.id).toContain(q.qfig!.cap.slice(0, 20))
      // the note only appears folded under "How the printed figure was read", never inline in the question
      const pdf = renderToString(<QuestionText q={q} pdf />)
      expect(pdf, q.id).not.toContain('[FIG')
    }
  })
  it('the FIG note is one bracketed block (nothing of it left behind in the text)', () => {
    for (const p of EV_PARTS.filter((x) => /\[FIG/.test(x.text))) expect(p.text.replace(FIG_RE, ''), p.id).not.toMatch(/FIG/)
  })
})
