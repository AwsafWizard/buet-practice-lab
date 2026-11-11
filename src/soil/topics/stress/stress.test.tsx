import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { newmarkCount, rectsInside, shapeI } from '../../engine/stressdist'
import { SD_ITEMS } from '../../reference/sd'
import { CircleCalc, EmbCalc, StripCalc, TwoOneCalc } from './CalcSections'
import { LineCalc, NewmarkCalc, PointCalc, RectCalc } from './Calculators'
import { PlanFig } from './figs'
import mod from './index'
import { makeStressProblem, STRESS_FAMILIES } from './Problems'
import { randomShape, SHAPES } from './shapes'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

describe('stress-distribution module renders', () => {
  it('Overview, Approach, Lab without NaN', () => {
    for (const C of [mod.Overview, mod.Approach, mod.Lab]) expect(wrap(<C />)).not.toMatch(/NaN|Infinity/)
  })
  it('drawable calculators render every tab without NaN', () => {
    for (const C of [PointCalc, LineCalc, RectCalc, NewmarkCalc, StripCalc, EmbCalc, CircleCalc, TwoOneCalc]) expect(wrap(<C />), C.name).not.toMatch(/NaN|Infinity/)
  })
  it('practice problems: finite checks, solutions render', () => {
    for (const q of mod.problems) {
      for (const c of q.checks?.() ?? []) expect(Number.isFinite(c.value), `${q.id} ${c.key}`).toBe(true)
      if (q.figure) wrap(q.figure())
      if (q.solution) expect(wrap(q.solution())).not.toContain('NaN')
    }
  })
  it('theory: ids unique, sketches render', () => {
    expect(new Set(mod.theory.map((t) => t.id)).size).toBe(mod.theory.length)
    for (const t of mod.theory) if (t.Fig) expect(wrap(<t.Fig />)).not.toContain('NaN')
  })
  it('chart-pane ids exist', () => {
    for (const id of ['d-kb', 'd-fadum', 'd-newmark', 'd-osterberg', 'd-steinbrenner', 'd-strip', 'd-circle', 'd-21']) expect(SD_ITEMS.some((x) => x.id === id)).toBe(true)
  })
})

describe('plans and generators', () => {
  it('paper plans: Newmark count agrees with Fadum superposition', () => {
    for (const s of SHAPES) {
      const I = shapeI(s.rects, s.P[0], s.P[1], s.z)
      const N = newmarkCount((x, y) => rectsInside(s.rects)(x + s.P[0], y + s.P[1]), s.z, 8).N
      expect(Math.abs(N * 0.005 - I), s.key).toBeLessThan(0.006)
    }
  })
  it('random plans render and give finite influence', () => {
    for (let k = 1; k <= 60; k++) {
      const s = randomShape(k)
      expect(Number.isFinite(shapeI(s.rects, s.P[0], s.P[1], s.z))).toBe(true)
      expect(wrap(<PlanFig rects={s.rects} P={s.P} />)).not.toContain('NaN')
    }
  })
  it('exam problems: every family and level gives finite steps and renders', () => {
    for (const f of STRESS_FAMILIES)
      for (const lvl of ['basic', 'exam', 'tough'] as const)
        for (let s = 1; s <= 15; s++) {
          const p = makeStressProblem(s, f.v, lvl)
          expect(p.text).not.toMatch(/NaN|undefined|Infinity/)
          for (const st of p.steps) if (st.value !== undefined) expect(Number.isFinite(st.value), `${f.v} ${lvl} ${s} ${st.key}`).toBe(true)
          if (s <= 3) expect(wrap(<>{p.fig()}{p.sol()}</>)).not.toMatch(/NaN/)
        }
  })
})
