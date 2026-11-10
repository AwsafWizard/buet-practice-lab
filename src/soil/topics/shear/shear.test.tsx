import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { STR_ITEMS } from '../../reference/str'
import mod from './index'
import { randomTest } from './Lab'
import { packing, R, RV } from './MicroView'
import { volShape } from '../../engine/testsim'
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
  it('grain view: no two grains overlap in any state, and both packings end at the same void ratio', () => {
    const gap = (a: number, h: number, slip: number) => {
      // nearest grain in the next row: offset a (or 2R − a); across the slip plane any offset can occur
      const x = slip > 0 ? 0 : Math.min(Math.abs(a), 2 * R - Math.abs(a))
      return Math.hypot(x, h)
    }
    for (const dilative of [true, false])
      for (const undrained of [true, false])
        for (let i = 0; i <= 100; i++) {
          const u01 = i / 100
          const p = packing({ dilative, stage: 2, u01, undrained, w: volShape(u01, dilative) })
          expect(gap(p.a, p.h, p.slip), `${dilative} ${undrained} ${u01}`).toBeGreaterThanOrEqual(2 * RV - 1e-9)
          if (undrained) expect(p.h).toBeCloseTo(packing({ dilative, stage: 0, u01: 0, undrained, w: 0 }).h, 9)
        }
    const end = (dilative: boolean) => packing({ dilative, stage: 2, u01: 1, undrained: false, w: 1 })
    expect(end(true).h).toBeCloseTo(end(false).h, 6)
    expect(end(true).h).toBeGreaterThan(packing({ dilative: true, stage: 0, u01: 0, undrained: false, w: 0 }).h)
    expect(end(false).h).toBeLessThan(packing({ dilative: false, stage: 0, u01: 0, undrained: false, w: 0 }).h)
  })
})
