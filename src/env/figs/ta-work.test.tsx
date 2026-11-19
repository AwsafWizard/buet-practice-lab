// Render every worked solution of Tanvir sir's block: each past-paper Sol, and each lab problem family over many seeds.
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as coag from '../labs/ev-coag'
import * as dis from '../labs/ev-dis'
import * as ix from '../labs/ev-ix'
import * as sed from '../labs/ev-sed'
import * as soft from '../labs/ev-soft'
import * as wq from '../labs/ev-wq'
import { TA_MATH } from '../pyq/ta-math'

const BAD = /NaN|undefined|Infinity|katex-error/

describe('Tanvir sir: worked past-paper solutions', () => {
  for (const [id, m] of Object.entries(TA_MATH)) {
    it(`${id} renders cleanly`, () => {
      const Sol = m.Sol!
      const html = renderToString(<Sol />)
      expect(html).not.toMatch(BAD)
      expect(html.length).toBeGreaterThan(500)
    })
  }
})

// each lab module exports { FAMS, make, Solution } for this test
const LABS = { wq, sed, coag, soft, ix, dis } as unknown as Record<string, { FAMS: { v: string }[]; make: (seed: number, family?: string) => unknown; Solution: (props: { p: unknown }) => ReactNode }>

describe('Tanvir sir: lab problem solutions', () => {
  for (const [name, lab] of Object.entries(LABS)) {
    for (const fam of lab.FAMS) {
      it(`${name} / ${fam.v} renders cleanly for 12 seeds`, () => {
        for (let seed = 1; seed <= 12; seed++) {
          const p = lab.make(seed, fam.v)
          const html = renderToString(<lab.Solution p={p} />)
          expect(html, `seed ${seed}`).not.toMatch(BAD)
        }
      })
    }
  }
})
