import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { casagrandeFit, settleProfile, taylorFit } from '../../engine/consolidation'
import { CON_ITEMS } from '../../reference/con'
import { ProfileFig } from './figs'
import { CONSOL_FAMILIES, randomOed, randomProfile, SETTLE_PRESETS } from './gen'
import mod from './index'
import { makeConsolProblem } from './Problems'
import { SettleSolution } from './Solution'
import { casagrande, ccFromData, csFromData } from '../../engine/consolidation'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

describe('consolidation module renders', () => {
  it('Overview, Approach, Lab without NaN', () => {
    for (const C of [mod.Overview, mod.Approach, mod.Lab]) expect(wrap(<C />)).not.toMatch(/NaN|Infinity/)
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
    for (const id of ['k-tvu', 'k-cc', 'k-fit', 'k-barron', 'k-settle']) expect(CON_ITEMS.some((x) => x.id === id)).toBe(true)
  })
})

describe('profiles and generators', () => {
  it('presets and random profiles: finite, positive, figures without NaN', () => {
    const inps = SETTLE_PRESETS.map((p) => p.inp)
    for (let s = 1; s <= 80; s++) for (const lvl of ['basic', 'exam', 'tough'] as const) inps.push(randomProfile(s, s % 2 ? 'fill' : 'footing', lvl).inp)
    for (const inp of inps) {
      const out = settleProfile(inp)
      expect(Number.isFinite(out.S)).toBe(true)
      expect(out.S).toBeGreaterThan(0)
      const html = wrap(
        <>
          <ProfileFig inp={inp} out={out} />
          <SettleSolution inp={inp} out={out} />
        </>,
      )
      expect(html).not.toMatch(/NaN|Infinity/)
    }
  })
  it('exam problems: every family and level gives finite steps', () => {
    for (const f of CONSOL_FAMILIES)
      for (const lvl of ['basic', 'exam', 'tough'] as const)
        for (let s = 1; s <= 25; s++) {
          const p = makeConsolProblem(s, f.v, lvl)
          expect(p.text).not.toMatch(/NaN|undefined|Infinity/)
          for (const st of p.steps) if (st.value !== undefined) expect(Number.isFinite(st.value), `${f.v} ${lvl} ${s} ${st.key}`).toBe(true)
        }
  })
  it('random oedometer tests: Cc recovered, pc′ in a sensible range', () => {
    for (let s = 1; s <= 60; s++) {
      const g = randomOed(s)
      const cc = ccFromData(g.pts).Cc
      expect(Math.abs(cc - g.truth.Cc) / g.truth.Cc).toBeLessThan(0.12)
      expect(csFromData(g.pts)!.Cs).toBeGreaterThan(0)
      const pc = casagrande(g.pts).pc
      expect(pc).toBeGreaterThan(g.truth.pc / 2.5)
      expect(pc).toBeLessThan(g.truth.pc * 2.5)
    }
  })
  it('fits stay finite on many generated increments', async () => {
    const { genDial } = await import('../../engine/consolidation')
    for (let s = 1; s <= 40; s++) {
      const cv = 0.5 + (s % 9)
      const pts = genDial({ cv, d: 10, di: 0.05, dp: 1, ds: 0.04 })
      const t = taylorFit(pts, 10)
      const c = casagrandeFit(pts, 10)
      expect(Math.abs(t.cv / cv - 1)).toBeLessThan(0.12)
      expect(Math.abs(c.cv / cv - 1)).toBeLessThan(0.2)
    }
  })
})
