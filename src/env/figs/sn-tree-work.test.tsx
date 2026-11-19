import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { designTree, fpsToMs } from '../engine/network'
import { make } from '../labs/ev-dist'
import { TreeWork } from './sn-tree-work'

const BAD = /NaN|undefined|Infinity|katex-error/

describe('worked branched network', () => {
  it('2023-24 Q6(a): pressures in the table are the engine pressures', () => {
    const m3d = (v: number) => v / 86400
    const res = designTree({
      pipes: [
        { id: '0-1', from: '0', to: '1', L: 290 },
        { id: '1-2', from: '1', to: '2', L: 140 },
        { id: '2-3', from: '2', to: '3', L: 125 },
        { id: '1-4', from: '1', to: '4', L: 205 },
        { id: '4-5', from: '4', to: '5', L: 210 },
        { id: '4-6', from: '4', to: '6', L: 165 },
      ],
      demand: { '2': m3d(275), '3': m3d(195.5), '5': m3d(135.5), '6': m3d(205) },
      root: '0', V: fpsToMs(5), f: 0.01, Dmin: 4, startPsi: 70, minPsi: 30,
    })
    const html = renderToString(<TreeWork res={res} unit="m3d" V={fpsToMs(5)} f={0.01} />)
    expect(html).not.toMatch(BAD)
    expect(html).toContain('275 (node 2) + 195.5 (2-3) = ')
    for (const t of res.terminals) expect(html).toContain(`${Math.round(t.p * 100) / 100}`)
  })
  it('renders the lab problems (cusec, lph with enlargement) without NaN', () => {
    for (const seed of [1, 2, 3, 4, 5, 6])
      for (const lv of ['basic', 'exam', 'tough'] as const)
        for (const fam of ['cusec', 'lph'] as const) {
          const p = make(seed, fam, lv)
          const html = renderToString(<TreeWork res={p.tree!} unit={fam === 'cusec' ? 'cfs' : 'lph'} V={fam === 'cusec' ? fpsToMs(3) : 1} f={0.01} />)
          expect(html, `${fam} ${lv} ${seed}`).not.toMatch(BAD)
        }
  })
})
