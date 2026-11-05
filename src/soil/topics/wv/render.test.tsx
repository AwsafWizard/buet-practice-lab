import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { IDX_ITEMS } from '../../reference/idx'
import type { SmTopicModule } from '../../types'
import cls from '../class/index'
import plast from '../plast/index'
import struct from '../struct/index'
import wv from './index'

const wrap = (el: React.ReactNode) => renderToString(<MemoryRouter>{el}</MemoryRouter>)

const mods: [string, SmTopicModule][] = [
  ['wv', wv],
  ['plast', plast],
  ['class', cls],
  ['struct', struct],
]

describe('index topics render', () => {
  for (const [name, mod] of mods) {
    it(`${name}: Overview, Approach, Lab without NaN`, () => {
      for (const C of [mod.Overview, mod.Approach, mod.Lab]) expect(wrap(<C />)).not.toContain('NaN')
    })
    it(`${name}: problems have finite checks and clean solutions`, () => {
      expect(mod.problems.length).toBeGreaterThanOrEqual(2)
      for (const q of mod.problems) {
        expect(q.id.startsWith(`sm-own-${name}-`)).toBe(true)
        for (const c of q.checks?.() ?? []) expect(Number.isFinite(c.value), `${q.id} ${c.key}`).toBe(true)
        if (q.solution) expect(wrap(q.solution())).not.toContain('NaN')
      }
    })
    it(`${name}: theory items unique, sketches clean`, () => {
      const ids = mod.theory.map((t) => t.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const t of mod.theory) if (t.Fig) expect(wrap(<t.Fig />)).not.toContain('NaN')
    })
  }
  it('canonical chart-pane ids exist', () => {
    for (const id of ['c-phase', 'c-dr', 'c-sizes', 'c-burmister', 'c-plchart', 'c-aashto', 'c-uscs', 'c-uscs-names', 'c-usda', 'c-minerals']) expect(IDX_ITEMS.some((x) => x.id === id)).toBe(true)
  })
})

import { solvePhase, unitSys } from '../../engine/phase'
import { aashto, grading, uscs } from '../../engine/classify'
import { coneLL, flowCurve } from '../../engine/plasticity'
import { givensOf, randomWv } from './Lab'
import { randomPlast, trialW } from '../plast/Lab'
import { randomClass } from '../class/Lab'

describe('🎲 lab generators', () => {
  it('random specimens solve', () => {
    for (let s = 1; s <= 200; s++) {
      const p = randomWv(s)
      const r = solvePhase(givensOf(p), unitSys(p.u).gw)
      expect(r.status, JSON.stringify(p)).toBe('ok')
      expect(r.vals.S).toBeLessThanOrEqual(1.01)
    }
  })
  it('random Atterberg data give an LL above the PL', () => {
    for (let s = 1; s <= 200; s++) {
      const p = randomPlast(s)
      const pts = p.trials.map((t) => ({ x: t.x, w: trialW(p, t) }))
      const LL = p.mode === 'cup' ? flowCurve(pts.map((q) => ({ N: q.x, w: q.w }))).LL : coneLL(pts.map((q) => ({ d: q.x, w: q.w }))).LL
      expect(LL).toBeGreaterThan(p.PL)
    }
  })
  it('random soils classify', () => {
    for (let s = 1; s <= 200; s++) {
      const p = randomClass(s)
      const pts = p.mode === 'sieve' ? undefined : p.pf
      if (!pts) continue
      const g = grading(pts)
      expect(Number.isFinite(g.P200)).toBe(true)
      expect(uscs({ F200: g.P200, F4: g.P4, LL: p.LL, PL: p.PL, NP: p.NP, Cu: g.Cu, Cc: g.Cc }).symbol).toMatch(/^[A-Z]/)
      expect(aashto({ P10: g.P10, P40: g.P40, P200: g.P200, LL: p.LL, PI: p.LL - p.PL, NP: p.NP }).group).not.toBe('—')
    }
  })
})
