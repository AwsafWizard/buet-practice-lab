// T-beam design problems from the physical floor system (as the papers ask): slab + beams → beff, loads
// (slab and web self-weight, SDL, LL) → wu → Mu (simple span, ACI coefficients, or + a girder point load)
// → As at midspan (rectangular or true T) → bars → εt; continuous beams add the support (−M) section
// as a bw × d rectangle with two layers of top bars. Every number from src/rc/engine/tbeam.ts.
// Units: in, kip, ksi; spans ft; moments k-ft.

import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { BARS, wu as wuOf } from '../../engine/materials'
import { barFit } from '../../engine/singly'
import { aciMoment, designRect, designT, effectiveWidth, floorLoads, reviewRect, reviewT, type BeffIn, type BeffOut, type FloorOut, type RectDesign, type RectReview, type TDesign, type TReview } from '../../engine/tbeam'
import { COUNT, STRAIN, type DProblem, type DStep, type Level } from './designShell'

export type TFamily = 'simple' | 'continuous' | 'girder'
export const T_FAMILIES: { v: TFamily; label: string }[] = [
  { v: 'simple', label: 'Simply supported floor beam' },
  { v: 'continuous', label: 'Continuous beam (ACI coefficients)' },
  { v: 'girder', label: 'Beam + girder point load' },
]

export interface TGiven {
  hf: number
  /** beam spacing c/c (ft) */
  s: number
  /** span used for beff and moments (ft): simple = effective span, continuous = clear span ln */
  L: number
  /** continuous: c/c span (ft), column width (in), number of spans, which span */
  Lcc?: number
  col?: number
  nSpans?: number
  span?: 'end' | 'interior'
  bw: number
  h: number
  sdl: number
  ll: number
  fc: number
  fy: number
  bar: number
  supBar?: number
  PD?: number
  PL?: number
}

export interface TPart {
  Mu: number
  d: number
  dt: number
  layers: 1 | 2
  n: number
  As: number
}

export interface TProblem extends DProblem<TFamily> {
  g: TGiven
  beffIn: BeffIn
  beff: BeffOut
  fl: FloorOut
  Pu: number
  coefPos: number
  coefPosLabel: string
  coefNeg: number
  coefNegLabel: string
  mid: TPart & { des: TDesign; rev: TReview }
  sup?: TPart & { des: RectDesign; rev: RectReview }
}

const r2 = (v: number) => Math.round(v * 100) / 100

/** bars for As (≥ 2); one layer if they fit in bw, else two (d = h − 3.5, dt = h − 2.5) */
function midspan(Mu: number, beff: number, g: TGiven, layersWanted?: 1 | 2) {
  for (const layers of layersWanted ? [layersWanted] : ([1, 2] as const)) {
    const d = g.h - (layers === 1 ? 2.5 : 3.5)
    const dt = g.h - 2.5
    const des = designT({ Mu, beff, bw: g.bw, hf: g.hf, d, dt, fc: g.fc, fy: g.fy })
    if (!des.possible) return null
    const n = Math.max(2, Math.ceil(Math.max(des.As, des.AsMin) / BARS[g.bar].A - 1e-9))
    const fits = barFit(layers === 1 ? n : Math.ceil(n / 2), g.bar, g.bw).fits
    if (!fits) continue
    const As = n * BARS[g.bar].A
    const rev = reviewT({ beff, bw: g.bw, hf: g.hf, d, dt, As, fc: g.fc, fy: g.fy })
    return { Mu, d, dt, layers, n, As, des, rev }
  }
  return null
}

function support(Mu: number, g: TGiven) {
  const d = g.h - 3.5,
    dt = g.h - 2.5
  const bar = g.supBar ?? g.bar
  const des = designRect(Mu, g.bw, d, dt, g.fc, g.fy)
  if (!des.possible) return null
  const n = Math.max(4, Math.ceil(Math.max(des.As, des.AsMin) / BARS[bar].A - 1e-9))
  if (!barFit(Math.ceil(n / 2), bar, g.bw).fits) return null
  const As = n * BARS[bar].A
  const rev = reviewRect(g.bw, d, dt, As, g.fc, g.fy)
  return { Mu, d, dt, layers: 2 as const, n, As, des, rev }
}

function attempt(r: () => number, family: TFamily, level: Level): TProblem | null {
  const tough = level === 'tough'
  const fc = pick(r, tough ? [3, 3, 4] : [3, 3.5, 4, 4, 5])
  const fy = 60
  const hf = pick(r, tough ? [3, 3.5, 4] : [4, 4.5, 5, 5.5, 6])
  const bw = pick(r, [10, 12, 12, 14, 15, 16])
  const s = tough ? randInt(r, 5, 8) : randInt(r, 7, 14)
  const sdl = randInt(r, 20, 60, 5)
  const ll = pick(r, [60, 80, 100, 125, 150, 200])
  const bar = pick(r, [7, 8, 9, 10])
  const g: TGiven = { hf, s, L: 0, bw, h: 0, sdl, ll, fc, fy, bar }
  let coefPos = 1 / 8,
    coefPosLabel = '\\tfrac18',
    coefNeg = 0,
    coefNegLabel = ''
  let Pu = 0
  if (family === 'continuous') {
    g.nSpans = pick(r, [2, 3, 4, 5])
    g.span = g.nSpans === 2 ? 'end' : pick(r, ['end', 'interior'] as const)
    g.Lcc = randInt(r, 20, 32, 2)
    g.col = pick(r, [12, 14, 16, 18])
    g.L = r2(g.Lcc - g.col / 12)
    g.h = randInt(r, 18, 28, 2)
    g.supBar = pick(r, [7, 8, 9])
    if (g.span === 'end') {
      coefPos = 1 / 14
      coefPosLabel = '\\tfrac1{14}'
      coefNeg = g.nSpans === 2 ? 1 / 9 : 1 / 10
      coefNegLabel = g.nSpans === 2 ? '\\tfrac19' : '\\tfrac1{10}'
    } else {
      coefPos = 1 / 16
      coefPosLabel = '\\tfrac1{16}'
      coefNeg = 1 / 11
      coefNegLabel = '\\tfrac1{11}'
    }
  } else {
    g.L = randInt(r, tough ? 20 : 16, family === 'girder' ? 32 : 30, 2)
    g.h = randInt(r, 18, 30, 2)
    if (family === 'girder') {
      g.PD = randInt(r, tough ? 20 : 8, tough ? 50 : 30, 2)
      g.PL = randInt(r, tough ? 20 : 6, tough ? 50 : 30, 2)
      Pu = wuOf(g.PD, g.PL)
    }
  }
  const beffIn: BeffIn = { kind: 'interior', L: g.L, bw, hf, cc: s * 12, rule: 'aci14' }
  const beff = effectiveWidth(beffIn)
  const fl = floorLoads({ hf, spacing: s, bw, h: g.h, sdl, ll })
  const MuPos = aciMoment(fl.wu, g.L, coefPos) + (Pu * g.L) / 4
  const mid = midspan(MuPos, beff.b, g)
  if (!mid || mid.des.tooHeavy || mid.rev.epsT < 0.004 || mid.rev.phiMn < MuPos - 1e-6) return null
  let sup: TProblem['sup']
  if (family === 'continuous') {
    const MuNeg = aciMoment(fl.wu, g.L, coefNeg)
    const sp = support(MuNeg, g)
    if (!sp || sp.des.tooHeavy || sp.rev.epsT < 0.004 || sp.n > 10) return null
    sup = sp
  }
  if (mid.n > 10) return null
  return {
    family,
    level,
    title: '',
    text: '',
    hash: hashKey(JSON.stringify([family, g])),
    steps: [],
    g,
    beffIn,
    beff,
    fl,
    Pu,
    coefPos,
    coefPosLabel,
    coefNeg,
    coefNegLabel,
    mid,
    sup,
  }
}

const accept = (p: TProblem, level: Level) => (level === 'basic' ? p.mid.des.rect && p.mid.layers === 1 : level === 'tough' ? !p.mid.des.rect || p.mid.layers === 2 : true)

export function makeTDesign(seed: number, only?: TFamily, level: Level = 'exam'): TProblem {
  const r = rng(seed * 7919 + 101)
  const family = only ?? pick(r, T_FAMILIES.map((f) => f.v))
  let fallback: TProblem | null = null
  let p: TProblem | null = null
  for (let i = 0; i < 400 && !p; i++) {
    const a = attempt(r, family, level)
    if (!a) continue
    fallback ??= a
    if (accept(a, level)) p = a
  }
  p ??= fallback
  // last resort: a known-good exam-level beam (never reached in the tests, kept for safety)
  for (let i = 0; !p && i < 2000; i++) p = attempt(r, family, 'exam')
  return describe(p!)
}

function describe(p: TProblem): TProblem {
  const { g, mid, sup, family } = p
  const mat = `$f'_c = ${g.fc}$ ksi, $f_y = ${g.fy}$ ksi. Concrete 150 pcf; load factors 1.2D + 1.6L.`
  const loads = `Superimposed dead load (floor finish + partitions) = ${g.sdl} psf, live load = ${g.ll} psf, both in addition to self-weight.`
  const lay = (x: TPart, no: number) => `No. ${no} bars in ${x.layers === 1 ? 'one layer ($d = h - 2.5$ in)' : 'two layers ($d = h - 3.5$ in to the centroid, $d_t = h - 2.5$ in)'}`
  if (family === 'continuous') {
    p.title = `Continuous T-beam floor — ${g.span} span`
    p.text = `A ${g.hf} in slab is cast monolithically with beams spaced **${g.s} ft c/c**. The beams are continuous over ${g.nSpans} equal spans of ${g.Lcc} ft c/c, built integrally with ${g.col} in square columns (clear span $\\ell_n = ${g.L}$ ft). Beam web $b_w = ${g.bw}$ in, overall depth $h = ${g.h}$ in. ${loads} ${mat}\n\nUsing the ACI moment coefficients, design an interior beam of the **${g.span} span**: (a) the midspan section with ${lay(mid, g.bar)}; (b) the negative section at the ${g.span === 'end' ? 'first interior' : 'interior'} support with No. ${g.supBar} top bars in two layers ($d = h - 3.5$, $d_t = h - 2.5$ in). Check $\\varepsilon_t$ for the bars provided.`
  } else if (family === 'girder') {
    p.title = 'Simply supported T-beam with a girder load'
    p.text = `A ${g.hf} in slab is supported on simply supported beams spaced **${g.s} ft c/c**, span ${g.L} ft. Each interior beam also carries a cross-girder reaction at midspan of ${g.PD} k dead + ${g.PL} k live. Beam web $b_w = ${g.bw}$ in, overall depth $h = ${g.h}$ in. ${loads} ${mat}\n\nDesign the midspan section of an interior beam using ${lay(mid, g.bar)}; check $\\varepsilon_t$ for the bars provided.`
  } else {
    p.title = 'Simply supported T-beam floor'
    p.text = `A floor is made of a ${g.hf} in slab cast monolithically with beams spaced **${g.s} ft c/c**; the beams are simply supported with a span of ${g.L} ft. Web $b_w = ${g.bw}$ in, overall depth $h = ${g.h}$ in. ${loads} ${mat}\n\nDesign an interior beam for flexure at midspan using ${lay(mid, g.bar)}; check $\\varepsilon_t$ for the bars provided.`
  }
  const st: DStep[] = []
  const G1 = '1 — Effective flange width',
    G2 = '2 — Loads on one interior beam',
    G3 = '3 — Design moment' + (sup ? 's' : ''),
    G4 = (sup ? '4 — Midspan (+M) section' : '4 — Midspan section'),
    G5 = '5 — Support (−M) section: rectangle bw × d'
  st.push({ key: 'beff', group: G1, label: 'beff', value: p.beff.b, unit: 'in' })
  st.push({ key: 'slab', group: G2, label: 'slab self-weight', value: p.fl.slab, unit: 'k/ft' })
  st.push({ key: 'web', group: G2, label: 'web self-weight (below slab)', value: p.fl.web, unit: 'k/ft' })
  st.push({ key: 'wD', group: G2, label: 'wD', value: p.fl.wD, unit: 'k/ft' })
  st.push({ key: 'wL', group: G2, label: 'wL', value: p.fl.wL, unit: 'k/ft' })
  st.push({ key: 'wu', group: G2, label: 'wu', value: p.fl.wu, unit: 'k/ft' })
  if (family === 'girder') st.push({ key: 'Pu', group: G2, label: 'Pu (girder)', value: p.Pu, unit: 'k' })
  st.push({ key: 'Mu', group: G3, label: sup ? 'Mu+ at midspan' : 'Mu at midspan', value: mid.Mu, unit: 'k-ft' })
  if (sup) st.push({ key: 'Mneg', group: G3, label: 'Mu− at the support', value: sup.Mu, unit: 'k-ft' })
  st.push({ key: 'pmf', group: G4, label: 'φMn with the whole flange (a = hf)', value: mid.des.phiMnFlange, unit: 'k-ft' })
  st.push({ key: 'beh', group: G4, label: 'Section behaves as', options: [{ v: 'rect', label: 'rectangular (a ≤ hf)' }, { v: 'T', label: 'true T (a > hf)' }], answer: mid.des.rect ? 'rect' : 'T' })
  if (!mid.des.rect) st.push({ key: 'Asf', group: G4, label: 'Asf (flange overhangs)', value: mid.des.Asf, unit: 'in²' })
  st.push({ key: 'As', group: G4, label: 'As required', value: mid.des.As, unit: 'in²' })
  st.push({ key: 'n', group: G4, label: `number of No. ${g.bar} bars`, value: mid.n, ...COUNT })
  st.push({ key: 'et', group: G4, label: 'εt with the bars provided', value: mid.rev.epsT, ...STRAIN })
  st.push({ key: 'pmn', group: G4, label: 'φMn provided', value: mid.rev.phiMn, unit: 'k-ft' })
  if (sup) {
    st.push({ key: 'sAs', group: G5, label: 'As required (top)', value: sup.des.As, unit: 'in²' })
    st.push({ key: 'sn', group: G5, label: `number of No. ${g.supBar} top bars`, value: sup.n, ...COUNT })
    st.push({ key: 'set', group: G5, label: 'εt with the bars provided', value: sup.rev.epsT, ...STRAIN })
    st.push({ key: 'spm', group: G5, label: 'φMn provided', value: sup.rev.phiMn, unit: 'k-ft' })
  }
  p.steps = st
  return p
}
