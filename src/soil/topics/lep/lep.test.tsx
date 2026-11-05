import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { solveWall } from '../../engine/earth'
import { LEP_ITEMS } from '../../reference/lep'
import { WallFig } from './figs'
import { LEP_FAMILIES, PRESETS, randomWall, toWall } from './gen'
import mod from './index'
import { WallSolution } from './Solution'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

describe('earth pressure module renders', () => {
  it('Overview, Approach, Lab', () => {
    for (const C of [mod.Overview, mod.Approach, mod.Lab]) expect(wrap(<C />)).not.toContain('NaN')
  })
  it('problems: finite checks, solutions without NaN', () => {
    for (const q of mod.problems) {
      for (const c of q.checks?.() ?? []) expect(Number.isFinite(c.value), `${q.id} ${c.key}`).toBe(true)
      if (q.figure) wrap(q.figure())
      if (q.solution) expect(wrap(q.solution())).not.toContain('NaN')
    }
  })
  it('theory sketches and chart-pane items', () => {
    for (const t of mod.theory) if (t.Fig) expect(wrap(<t.Fig />)).not.toContain('NaN')
    // pane bodies use useSyncExternalStore (client only): just check the ids exist
    for (const id of ['e-ka', 'e-k0', 'e-move', 'e-coulomb', 'e-wallload']) expect(LEP_ITEMS.some((x) => x.id === id)).toBe(true)
  })
  it('presets and random walls: finite results, drawings without NaN', () => {
    const walls = [...PRESETS.map((p) => p.w)]
    for (let s = 1; s <= 120; s++) for (const lvl of ['basic', 'exam', 'tough'] as const) walls.push(randomWall(s, LEP_FAMILIES[s % LEP_FAMILIES.length].v, lvl).w)
    for (const lw of walls) {
      const w = toWall(lw)
      const r = solveWall(w)
      for (const v of [r.Fs, r.MOT, r.zbar, r.Fbefore]) expect(Number.isFinite(v)).toBe(true)
      expect(r.Fs).toBeGreaterThan(0)
      const html = wrap(
        <>
          <WallFig w={w} r={r} />
          <WallSolution w={w} r={r} />
        </>,
      )
      expect(html).not.toContain('NaN')
    }
  })
})
