import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { STR_ITEMS } from '../../reference/str'
import mod from './index'
import { randomTest } from './Lab'
import { makeShearProblem } from './Problems'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

describe('shear module renders', () => {
  it('Overview, Approach, Lab', () => {
    for (const C of [mod.Overview, mod.Approach, mod.Lab]) expect(wrap(<C />)).not.toContain('NaN')
  })
  it('problems: finite checks, solutions without NaN', () => {
    for (const q of mod.problems) {
      for (const c of q.checks?.() ?? []) expect(Number.isFinite(c.value), `${q.id} ${c.key}`).toBe(true)
      if (q.solution) expect(wrap(q.solution())).not.toContain('NaN')
    }
  })
  it('theory sketches; chart-pane ids', () => {
    for (const t of mod.theory) if (t.Fig) expect(wrap(<t.Fig />)).not.toContain('NaN')
    for (const id of ['s-phi', 's-tests', 's-mohr', 's-ab', 's-beta', 's-vane', 's-cu']) expect(STR_ITEMS.some((x) => x.id === id)).toBe(true)
  })
  it('random test data and exam problems are finite', () => {
    for (let s = 1; s <= 150; s++) {
      for (const k of ['ds', 'cd', 'cu', 'uu', 'uc'] as const) {
        const t = randomTest(s, k)
        for (const r of t.tri) expect(r.dev).toBeGreaterThan(0)
      }
      for (const fam of ['ds', 'cd', 'cu', 'cucd', 'uc', 'depth'] as const)
        for (const lvl of ['basic', 'exam', 'tough'] as const) {
          const p = makeShearProblem(s, fam, lvl)
          for (const st of p.steps) if (st.value !== undefined) expect(Number.isFinite(st.value), `${fam} ${st.key} seed ${s}`).toBe(true)
          if (s % 25 === 0) expect(wrap(p.sol())).not.toContain('NaN')
        }
    }
  })
})
