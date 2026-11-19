// Every worked solution of Snigdha ma'am's block renders cleanly (no NaN / undefined / KaTeX errors).
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { make as makeWell } from '../labs/ev-well'
import { SN_DTW } from '../pyq/sn-dtw'
import { SN_MATH } from '../pyq/sn-math'
import { DtwSol, SieveSol } from '../pyq/sn-dtw'
import { curveFromD } from '../engine/dtw'

const BAD = /NaN|undefined|Infinity|katex-error/

describe('SN worked solutions', () => {
  for (const [id, part] of Object.entries({ ...SN_MATH, ...SN_DTW }))
    if (part.Sol)
      it(id, () => {
        const Sol = part.Sol!
        expect(renderToString(<Sol />)).not.toMatch(BAD)
      })
  it('the well lab problems render through the shared solutions', () => {
    for (const seed of [1, 2, 3, 4])
      for (const lv of ['basic', 'exam', 'tough'] as const)
        for (const fam of ['log', 'saline', 'sieve'] as const) {
          const p = makeWell(seed, fam, lv)
          const html = renderToString(
            p.sieve ? <SieveSol c={p.sieve} /> : <DtwSol d={p.d!} given={p.given!} assumed={p.assumed!} curve={p.figure ? { pts: curveFromD(p.figure.d10, p.figure.d30, p.figure.d60), label: 'finest sand' } : undefined} />,
          )
          expect(html, `${fam} ${lv} ${seed}`).not.toMatch(BAD)
        }
  })
})
