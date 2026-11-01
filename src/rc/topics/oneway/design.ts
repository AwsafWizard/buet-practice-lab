// Random full one-way slab design problems for the Lab tab, written as the papers ask them:
// a floor on parallel beams (ACI coefficients), a grid of long panels on brick walls (classify → one-way),
// and a strip with cantilever(s) where the LL can occupy any position (statics + patterns).
// Every checkpoint value comes from the oneway engine (oneWayCoef / cantSlab).

import { pick, randInt, rng } from '../../../labs/common'
import { cantSlab, oneWayCoef, type CantSlabInput, type CantSlabResult, type EndSupport, type OneWayCoefInput, type OneWayCoefResult } from '../../engine/oneway'

export type Diff = 'paper' | 'tricky'
export const DIFFS: { v: Diff; label: string }[] = [
  { v: 'paper', label: 'As in the papers' },
  { v: 'tricky', label: 'Tricky (c/c, fy ≠ 60, unequal)' },
]

/** one checkpoint: a number (value) or a choice (options + answer) */
export interface DStep {
  key: string
  group: string
  label: string
  value?: number
  unit?: string
  abs?: number
  digits?: number
  options?: { v: string; label: string }[]
  answer?: string
}
export interface DesignBase {
  family: string
  title: string
  /** markdown statement */
  text: string
  /** stable hash of the problem data — used in the check ids */
  hash: string
  steps: DStep[]
}

/** plan figure: grid of bays (ft), support kind, which cells exist, captions */
export interface GridFig {
  cols: number[]
  rows: number[]
  mask?: boolean[][]
  support: 'beam' | 'wall'
  /** horizontal grid lines are supports too (false = free slab edges, one-way floor on parallel beams) */
  tb: boolean
  /** override the outermost left / right line (e.g. brick wall at one end of a beam floor) */
  sides?: { left?: 'beam' | 'wall'; right?: 'beam' | 'wall' }
  colTxt: string[]
  rowTxt: string[]
  target?: [number, number]
  /** draw a shaded 1-ft strip across the middle row */
  strip?: boolean
  labels?: Record<string, string>
  note?: string
}

export function djb2(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
/** 14.1667 → 14′-2″ */
export function ftIn(x: number) {
  let ft = Math.floor(x + 1e-9)
  let inch = Math.round((x - ft) * 12)
  if (inch === 12) {
    ft += 1
    inch = 0
  }
  return `${ft}′-${inch}″`
}
const ksi = (v: number) => `${v / 1000} ksi`
const loadTxt = (ll: number, ff: number, pw: number, dl?: number) =>
  dl ? `service DL = ${dl} psf (including self-weight), LL = ${ll} psf` : [`service LL = ${ll} psf`, ff ? `floor finish = ${ff} psf` : '', pw ? `partition wall = ${pw} psf` : ''].filter(Boolean).join(', ') + ' + self-weight'

export type Family = 'beams' | 'walls' | 'cant'
export const FAMILIES: { v: Family; label: string }[] = [
  { v: 'beams', label: 'Floor on parallel beams (ACI coef.)' },
  { v: 'walls', label: 'Panels on brick walls (classify)' },
  { v: 'cant', label: 'Strip with cantilever(s)' },
]

export interface CoefProblem extends DesignBase {
  kind: 'coef'
  input: OneWayCoefInput
  r: OneWayCoefResult
  fig: GridFig
}
export interface CantProblem extends DesignBase {
  kind: 'cant'
  input: CantSlabInput
  r: CantSlabResult
}
export type OneWayProblem = CoefProblem | CantProblem

// ---------------------------------------------------------------- generators
function beams(r: () => number, diff: Diff) {
  const tricky = diff === 'tricky'
  const n = tricky ? pick(r, [3, 4, 5]) : pick(r, [2, 2, 3, 4])
  const ll = pick(r, [60, 80, 100, 120])
  const ff = pick(r, [25, 30, 30])
  const pw = pick(r, [0, 40, 50, 60])
  const fc = pick(r, [3000, 3000, 3500, 4000])
  const fy = tricky ? pick(r, [60000, 40000, 50000]) : 60000
  const L2 = pick(r, [24, 25, 30])
  let spans: number[]
  let colTxt: string[]
  let ends: [EndSupport, EndSupport] = ['spandrel', 'spandrel']
  let geoTxt: string
  if (!tricky) {
    const S = randInt(r, 12, 16)
    spans = Array(n).fill(S)
    colTxt = spans.map((s) => `${ftIn(s)} clear`)
    geoTxt = `The floor slab of Fig. 1 is cast monolithically with ${n + 1} parallel beams (the outer ones are spandrel beams), giving **${n} equal clear spans of ${S} ft**; the beams span ${L2} ft between girders.`
  } else {
    const Sc = randInt(r, 12, 16)
    const bw = pick(r, [10, 12, 15])
    const Si = Sc + pick(r, [0, 1, 2])
    const cc = Array.from({ length: n }, (_, j) => (j === 0 || j === n - 1 ? Sc : Si))
    spans = cc.map((s) => s - bw / 12)
    colTxt = cc.map((s) => `${s}′-0″ c/c`)
    if (r() < 0.4) ends = ['spandrel', 'unrestrained']
    geoTxt = `In the floor of Fig. 1 the slab is cast monolithically with ${bw} in wide beams spaced at **${Sc} ft c/c** in the end bays${Si !== Sc ? ` and **${Si} ft c/c** in the interior bays` : ''} (${n} bays)${ends[1] === 'unrestrained' ? '; the right-hand edge of the slab rests on a 10 in brick wall instead of a beam' : '; the outer beams are spandrel beams'}.`
  }
  const input: OneWayCoefInput = { spans, ends, ll, ff, pw, fc, fy, bar: 'auto' }
  const text = `${geoTxt} Loads: ${loadTxt(ll, ff, pw)}. f'c = ${ksi(fc)}, fy = ${ksi(fy)}. Design the slab by USD using the **ACI moment coefficients** and show the reinforcement with neat sketches (plan and section).`
  const fig: GridFig = { cols: spans.map((s, j) => (tricky ? s + 1 : s)), rows: [L2 / 2], support: 'beam', tb: false, sides: ends[1] === 'unrestrained' ? { right: 'wall' } : undefined, colTxt, rowTxt: [`${L2}′`], strip: true, note: 'dashed = beams below the slab · shaded = 1-ft design strip' }
  return { title: tricky ? 'Floor on beams — c/c spacing' : 'Continuous floor slab on beams', text, input, fig }
}

function walls(r: () => number, diff: Diff) {
  const tricky = diff === 'tricky'
  const A = randInt(r, 11, 14)
  const B = pick(r, [28, 30, 32])
  const nA = pick(r, [2, 2, 3])
  const nB = pick(r, [1, 2])
  const ll = pick(r, [40, 60, 80])
  const ff = pick(r, [20, 25, 30])
  const pw = tricky ? pick(r, [0, 50]) : 0
  const fc = pick(r, [3000, 3500])
  const fy = tricky ? pick(r, [40000, 50000]) : pick(r, [60000, 40000])
  const input: OneWayCoefInput = { spans: Array(nA).fill(A), ends: ['unrestrained', 'unrestrained'], ll, ff, pw, fc, fy, bar: 'auto' }
  const text = `The roof slab of Fig. 1 consists of ${nA * nB} panels, each **${B}′-0″ × ${A}′-0″ (clear)**, resting on 10 in brick walls all round (${nA} panels across the short direction${nB > 1 ? `, ${nB} along the long direction` : ''}). Loads: ${loadTxt(ll, ff, pw)}. f'c = ${ksi(fc)}, fy = ${ksi(fy)}. Decide how the slab acts, design it by USD (ACI coefficients) and draw the reinforcement in plan and in a section.`
  const fig: GridFig = { cols: Array(nA).fill(A), rows: Array(nB).fill(B / 2), support: 'wall', tb: true, colTxt: Array(nA).fill(`${A}′-0″`), rowTxt: Array(nB).fill(`${B}′-0″`), strip: true, note: 'hatched = 10 in brick walls · shaded = 1-ft design strip (row scale halved)' }
  return { title: 'Long panels on brick walls', text, input, fig, ratio: B / A }
}

function cant(r: () => number, diff: Diff) {
  const tricky = diff === 'tricky'
  const span = tricky ? randInt(r, 12, 16) : pick(r, [14, 14, 12, 15])
  const support = tricky ? pick(r, [10, 12]) : 12
  let cantL: number
  let cantR: number
  if (!tricky) {
    const a = pick(r, [5, 5, 6, 5.5])
    const both = r() < 0.65
    cantL = both ? a : 0
    cantR = a
  } else {
    const kind = pick(r, ['one', 'unequal', 'both'] as const)
    const a = randInt(r, 4, 6.5, 0.5)
    cantR = a
    cantL = kind === 'one' ? 0 : kind === 'unequal' ? Math.max(3, a - pick(r, [1, 1.5, 2])) : a
  }
  const ll = pick(r, [60, 80, 100])
  const given = tricky && r() < 0.5
  const ff = given ? 0 : pick(r, [25, 30])
  const pw = given ? 0 : pick(r, [30, 50, 60])
  const dl = given ? pick(r, [125, 140, 150, 180]) : 0
  const h = given ? pick(r, [6, 6.5, 7]) : undefined
  const fc = pick(r, [3000, 3000, 3500, 4000])
  const fy = tricky ? pick(r, [60000, 50000]) : 60000
  const input: CantSlabInput = { span, support, cantL, cantR, ll, ff, pw, dlTotal: dl || undefined, fc, fy, h, bar: 'auto' }
  const sup = support === 10 && tricky ? '10 in brick walls' : `${support} in wide beams`
  const geo = cantL > 0 ? `a ${span}′-0″ clear span between two ${sup}, with cantilevers of **${cantL} ft** (left) and **${cantR} ft** (right) measured from the support faces` : `a ${span}′-0″ clear span between two ${sup} and a **${cantR} ft** cantilever beyond the right support`
  const text = `A one-way slab (Fig. 1) has ${geo}; the other edges are free. ${h ? `Slab thickness = ${h} in. ` : ''}Loads: ${loadTxt(ll, ff, pw, dl || undefined)}. The live load can occupy **any portion or position**. f'c = ${ksi(fc)}, fy = ${ksi(fy)}. Calculate the critical moments, design the slab by USD and show the reinforcement in neat sketches.`
  return { title: cantL > 0 ? (cantL === cantR ? 'Slab with two equal cantilevers' : 'Slab with two unequal cantilevers') : 'Slab with one cantilever', text, input }
}

// ---------------------------------------------------------------- checkpoints
const G = { cls: 'Step 1 — classify', h: 'Step 2 — thickness & load', m: 'Step 3 — design moments', as: 'Step 4 — depth & steel', bar: 'Step 5 — bars', v: 'Step 6 — shear' }
const asTol = { abs: 0.003, digits: 3 }
const mTol = { abs: 0.03, digits: 2 }

function coefSteps(r: OneWayCoefResult, ratio?: number, cc?: boolean): DStep[] {
  const out: DStep[] = []
  if (ratio) {
    out.push({ key: 'ratio', group: G.cls, label: 'lb/la of a panel', value: ratio, abs: 0.005 })
    out.push({ key: 'cls', group: G.cls, label: 'The slab acts as', options: [{ v: 'one', label: 'one-way' }, { v: 'two', label: 'two-way' }], answer: ratio >= 2 ? 'one' : 'two' })
  }
  if (cc) out.push({ key: 'ln', group: G.h, label: 'clear span of an end bay, ln (ft)', value: r.input.spans[0], abs: 0.01 })
  out.push({ key: 'hreq', group: G.h, label: 'governing h_min (in)', value: r.hReq, abs: 0.02 })
  out.push({ key: 'h', group: G.h, label: 'h used (in)', value: r.h })
  out.push({ key: 'wu', group: G.h, label: 'wu (psf)', value: r.loads.wu, abs: 0.6 })
  for (const s of r.sections.filter((x) => !x.mirror)) out.push({ key: `M${s.id}`, group: G.m, label: `Mu, ${s.label.replace(' (−)', '').replace(' (+)', '')} ${s.kind === 'neg' ? '(−)' : '(+)'} (k-ft/ft)`, value: s.Mu, ...mTol })
  out.push({ key: 'dreq', group: G.as, label: 'd required for ρ0.005 (in)', value: r.depth.dreq, abs: 0.03 })
  out.push({ key: 'asmin', group: G.as, label: 'As,min = T&S (in²/ft)', value: r.AsMin, ...asTol })
  for (const s of r.sections.filter((x) => !x.mirror)) out.push({ key: `A${s.id}`, group: G.as, label: `As design, ${s.label.replace(' (−)', '').replace(' (+)', '')} ${s.kind === 'neg' ? '(−)' : '(+)'} (in²/ft)`, value: s.AsD, ...asTol })
  out.push({ key: 's0', group: G.bar, label: `bottom bar spacing, ${r.n > 2 ? 'end span' : 'span'} (#${r.bar}, in)`, value: r.spanBars[0].s })
  if (r.n > 2 && Math.abs(r.spanBars[1].s - r.spanBars[0].s) > 1e-9) out.push({ key: 's1', group: G.bar, label: `bottom bar spacing, interior span (#${r.bar}, in)`, value: r.spanBars[1].s })
  for (const sp of r.supports.filter((x) => !x.sec.mirror)) out.push({ key: `x${sp.sec.id}`, group: G.bar, label: `extra top #${r.bar} bars between cranked bars, ${sp.sec.label.replace(' (−)', '').toLowerCase()}`, value: sp.extra.n })
  out.push({ key: 'ts', group: G.bar, label: `T&S #${r.ts.bar} spacing (in)`, value: r.ts.s })
  out.push({ key: 'vu', group: G.v, label: 'Vu at d from the face (k/ft)', value: r.shear.Vd, abs: 0.03 })
  out.push({ key: 'vc', group: G.v, label: 'φVc (k/ft)', value: r.shear.phiVc, abs: 0.03 })
  return out
}

function cantSteps(r: CantSlabResult): DStep[] {
  const out: DStep[] = []
  if (!r.hGiven) out.push({ key: 'hreq', group: G.h, label: 'governing h_min (in)', value: r.hReq, abs: 0.02 })
  out.push({ key: 'h', group: G.h, label: 'h used (in)', value: r.h })
  out.push({ key: 'wu', group: G.h, label: 'wu (psf)', value: r.loads.wu, abs: 0.6 })
  out.push({ key: 'mn', group: G.m, label: '−Mu at the support face (LL on the cantilever) (k-ft/ft)', value: r.Mneg, ...mTol })
  out.push({ key: 'mp', group: G.m, label: '+Mu in the span (LL on the span only) (k-ft/ft)', value: r.Mpos, ...mTol })
  if (r.nC === 2) out.push({ key: 'up', group: G.m, label: 'uplift pattern (DL on span, full load on cantilevers): M at midspan (k-ft/ft)', value: r.uplift.Mmid, ...mTol })
  else out.push({ key: 'up', group: G.m, label: 'uplift pattern: reaction at the far support (k/ft)', value: r.input.cantL > 0 ? r.uplift.RB : r.uplift.RA, abs: 0.02, digits: 3 })
  out.push({ key: 'dreq', group: G.as, label: 'd required for ρ0.005 (in)', value: r.depth.dreq, abs: 0.03 })
  out.push({ key: 'asp', group: G.as, label: 'As+ required (in²/ft)', value: r.asPos.As, ...asTol })
  out.push({ key: 'asn', group: G.as, label: 'As− required (in²/ft)', value: r.asNeg.As, ...asTol })
  out.push({ key: 'asmin', group: G.as, label: 'As,min (in²/ft)', value: r.AsMin, ...asTol })
  out.push({ key: 'sp', group: G.bar, label: `bottom bar spacing (#${r.bar}, in)`, value: r.pos.s })
  out.push({ key: 'ex', group: G.bar, label: `extra top #${r.bar} bars per 2s over the support`, value: r.extra.n })
  out.push({ key: 'ts', group: G.bar, label: `T&S #${r.ts.bar} spacing (in)`, value: r.ts.s })
  out.push({ key: 'vc', group: G.v, label: 'Vu on the cantilever at d (k/ft)', value: r.shear.Vcant, abs: 0.03 })
  out.push({ key: 'pv', group: G.v, label: 'φVc (k/ft)', value: r.shear.phiVc, abs: 0.03 })
  return out
}

// ---------------------------------------------------------------- assemble
export function makeOneWay(seed: number, only: Family | undefined, diff: Diff): OneWayProblem {
  const r = rng(seed * 7919 + 101)
  const family = only ?? pick(r, ['beams', 'beams', 'walls', 'cant', 'cant'] as Family[])
  if (family === 'cant') {
    const g = cant(r, diff)
    const res = cantSlab(g.input)
    return { kind: 'cant', family, title: g.title, text: g.text, input: g.input, r: res, hash: djb2(JSON.stringify(['ow-cant', g.input])), steps: cantSteps(res) }
  }
  const g = family === 'beams' ? beams(r, diff) : walls(r, diff)
  const res = oneWayCoef(g.input)
  const ratio = 'ratio' in g ? (g.ratio as number) : undefined
  return { kind: 'coef', family, title: g.title, text: g.text, input: g.input, r: res, fig: g.fig, hash: djb2(JSON.stringify(['ow', family, g.input])), steps: coefSteps(res, ratio, family === 'beams' && diff === 'tricky') }
}
