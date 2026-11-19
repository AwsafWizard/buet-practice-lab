import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { hardyCross, type HcLaw, type HcLoop, type HcPipe } from '../engine/network'
import { EX3_LOOPS, make } from '../labs/ev-dist'
import { HcWork } from './sn-hc-work'

const BAD = /NaN|undefined|Infinity|katex-error/

describe('worked Hardy Cross', () => {
  const pipes: HcPipe[] = [
    { id: 'AB', from: 'A', to: 'B', L: 400, D: 200, Q0: 2 },
    { id: 'BC', from: 'B', to: 'C', L: 300, D: 100, Q0: 1.2 },
    { id: 'DC', from: 'D', to: 'C', L: 400, D: 200, Q0: 1.8 },
    { id: 'AD', from: 'A', to: 'D', L: 300, D: 100, Q0: 3 },
    { id: 'BD', from: 'B', to: 'D', L: 500, D: 150, Q0: 0.8 },
  ]
  const loops: HcLoop[] = [
    { id: 'I', pipes: [{ id: 'AB', dir: 1 }, { id: 'BD', dir: 1 }, { id: 'AD', dir: -1 }] },
    { id: 'II', pipes: [{ id: 'BC', dir: 1 }, { id: 'DC', dir: -1 }, { id: 'BD', dir: -1 }] },
  ]
  const law: HcLaw = { kind: 'hw-lps-mm', coef: 1.59e6 }
  it('2012-13 Q2(c): k table, loop sums and the corrected flows from the engine', () => {
    const res = hardyCross(pipes, loops, law, { iterations: 2, tol: 0 })
    const html = renderToString(<HcWork pipes={pipes} loops={loops} law={law} res={res} />)
    expect(html).not.toMatch(BAD)
    expect(html).toContain('Trial 2')
    // the common pipe BD gets both corrections
    expect(html).toContain('BD (+ = B→D)')
  })
  it('renders the lab problems (k = 1) without NaN', () => {
    for (const seed of [1, 2, 3, 4, 5])
      for (const lv of ['basic', 'exam', 'tough'] as const) {
        const p = make(seed, 'hc', lv)
        const html = renderToString(<HcWork pipes={p.hc!.pipes} loops={EX3_LOOPS} law={{ kind: 'k' }} res={p.hc!.res} />)
        expect(html, `${lv} ${seed}`).not.toMatch(BAD)
      }
  })
})

