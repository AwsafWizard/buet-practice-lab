// Stirrup-design problems as the papers set them: a beam with point loads + UDL (service D and L with
// self-weight, or already factored), simply supported, overhanging or cantilever, b, d, f'c, fyt →
// Vu diagram, Vu at d, φVc, Case A–D, spacing zones, number of stirrups. Every number from engine/shear.ts.

import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { designShear, shearAt, stirrupAv, type PointLoad, type ShearAt, type ShearBeam, type ShearDesign, type ShearRun, type ShearSection } from '../../engine/shear'
import { COUNT, type DProblem, type DStep, type Level } from '../tbeam/designShell'

export type SFamily = 'service' | 'factored' | 'overhang' | 'cantilever'
export const S_FAMILIES: { v: SFamily; label: string }[] = [
  { v: 'service', label: 'Simple beam, service D + L' },
  { v: 'factored', label: 'Simple beam, factored loads' },
  { v: 'overhang', label: 'Overhanging beam' },
  { v: 'cantilever', label: 'Cantilever' },
]

export interface SProblem extends DProblem<SFamily> {
  bm: ShearBeam
  sec: ShearSection
  h: number
  bar: number
  legs: number
  nSets: number
  dsg: ShearDesign
  main: ShearRun
  at: ShearAt
  oh?: { run: ShearRun; at: ShearAt }
}

const ft = (v: number) => `${+v.toFixed(2)} ft`

function attempt(r: () => number, family: SFamily, level: Level): SProblem | null {
  const fc = pick(r, [3000, 3000, 4000, 4000, 5000])
  const fy = pick(r, [40000, 60000, 60000])
  const bw = pick(r, level === 'tough' ? [10, 12, 12] : [10, 12, 12, 14, 15, 16])
  const h = randInt(r, 18, 30, 2)
  const d = h - 2.5
  const bar = level === 'tough' && r() < 0.4 ? 4 : 3
  const legs = 2
  const nP = level === 'basic' ? (r() < 0.5 ? 0 : 1) : level === 'exam' ? randInt(r, 1, 2) : randInt(r, 2, 3)
  const nSets = level === 'basic' ? 2 : 3
  const supportWidth = pick(r, [0, 0, 12, 16])
  let bm: ShearBeam
  if (family === 'cantilever') {
    const L = randInt(r, 6, 12)
    const P: PointLoad[] = nP ? [{ x: L, P: randInt(r, 4, 16, 2), PL: randInt(r, 4, 16, 2) }] : []
    if (nP > 1) P.push({ x: L / 2, P: randInt(r, 4, 12, 2), PL: randInt(r, 2, 10, 2) })
    bm = { kind: 'cant', L, wD: randInt(r, 5, 25) / 10, wL: randInt(r, 5, 30) / 10, P, selfWeight: { b: bw, h } }
  } else {
    const L = randInt(r, 16, 30, 2)
    const pos = [L / 4, L / 3, L / 2, (2 * L) / 3, (3 * L) / 4].map((x) => Math.round(x))
    const xs = [...new Set(Array.from({ length: nP }, () => pick(r, pos)))].sort((a, b) => a - b)
    if (family === 'service') {
      const P = xs.map((x) => ({ x, P: randInt(r, 6, 24, 2), PL: randInt(r, 4, 20, 2) }))
      bm = { kind: 'ss', L, wD: randInt(r, 5, 25) / 10, wL: randInt(r, 5, 30) / 10, P, selfWeight: { b: bw, h }, supportWidth }
    } else if (family === 'factored') {
      const P = xs.map((x) => ({ x, P: randInt(r, 10, 50, 2) }))
      bm = { kind: 'ss', L, wD: randInt(r, 15, 60) / 10, P, factored: true, supportWidth }
    } else {
      const oh = randInt(r, 4, 8)
      const P: PointLoad[] = xs.map((x) => ({ x, P: randInt(r, 10, 40, 2) }))
      P.push({ x: L + oh, P: randInt(r, 8, 30, 2) })
      bm = { kind: 'ss', L, ohR: oh, wD: randInt(r, 15, 50) / 10, P, factored: true, supportWidth }
    }
  }
  const sec: ShearSection = { bw, d, fc, fy, Av: stirrupAv(bar, legs) }
  const dsg = designShear(bm, sec, { nSets })
  const main = dsg.runs.find((x) => x.id === 'sL' || x.id === 'c')
  if (!main || dsg.runs.some((x) => x.redesign) || dsg.total > 60) return null
  const at = shearAt(main.Vd, sec)
  if (at.case === 'A' || at.case === 'redesign' || at.s < 3 || dsg.runs.some((x) => x.sMin < 3)) return null
  let oh: SProblem['oh']
  if (family === 'overhang') {
    const run = dsg.runs.find((x) => x.id === 'ohR')
    if (!run) return null
    const a = shearAt(run.Vd, sec)
    oh = { run, at: a }
  }
  return { family, level, title: '', text: '', hash: hashKey(JSON.stringify([family, bm, sec, nSets, h])), steps: [], bm, sec, h, bar, legs, nSets, dsg, main, at, oh }
}

const accept = (p: SProblem, level: Level) => (level === 'basic' ? p.at.case === 'B' || p.at.case === 'C' : level === 'tough' ? p.main.cases.includes('D') : true)

export function makeSDesign(seed: number, only?: SFamily, level: Level = 'exam'): SProblem {
  const r = rng(seed * 7919 + 202)
  const family = only ?? pick(r, S_FAMILIES.map((f) => f.v))
  let fallback: SProblem | null = null
  let p: SProblem | null = null
  for (let i = 0; i < 400 && !p; i++) {
    const a = attempt(r, family, level)
    if (!a) continue
    fallback ??= a
    if (accept(a, level)) p = a
  }
  p ??= fallback
  for (let i = 0; !p && i < 2000; i++) p = attempt(r, family, 'exam')
  return describe(p!)
}

function describe(p: SProblem): SProblem {
  const { bm, sec } = p
  const P = bm.P ?? []
  const pts = P.map((q) => `${q.P}${q.PL ? ` k dead + ${q.PL} k live` : ' k'} at ${ft(q.x)} from the ${bm.kind === 'cant' ? 'fixed end' : 'left end'}`).join('; ')
  const sup = bm.supportWidth ? ` Supports are ${bm.supportWidth} in wide (dimensions to the support centrelines).` : ' Supports are narrow (take the face at the centreline).'
  const mat = `$b_w = ${sec.bw}$ in, $h = ${p.h}$ in, $d = ${sec.d}$ in, $f'_c = ${sec.fc}$ psi, $f_{yt} = ${sec.fy}$ psi. Use No. ${p.bar} ${p.legs}-legged vertical stirrups${p.nSets > 2 ? ` and up to ${p.nSets} sets of spacing` : ' and two spacing sets'} (round spacings down to ½ in).`
  if (p.family === 'cantilever') {
    p.title = 'Stirrups for a cantilever'
    p.text = `A cantilever of ${bm.L} ft projects from a fixed support and carries a uniform service load of ${bm.wD} k/ft dead + ${bm.wL} k/ft live in addition to its self-weight${P.length ? `, plus point loads ${pts}` : ''}. ${mat}\n\nDesign the shear reinforcement (1.2D + 1.6L): Vu diagram, critical section, case, spacings and the number of stirrups.`
  } else if (p.family === 'service') {
    p.title = 'Stirrups for a simple beam (service loads)'
    p.text = `A simply supported beam spans ${bm.L} ft and carries a uniform service load of ${bm.wD} k/ft dead + ${bm.wL} k/ft live in addition to its self-weight${P.length ? `, plus point loads: ${pts}` : ''}.${sup} ${mat}\n\nDesign the stirrups (1.2D + 1.6L) and sketch the layout.`
  } else if (p.family === 'factored') {
    p.title = 'Stirrups for a simple beam (factored loads)'
    p.text = `A simply supported beam of span ${bm.L} ft carries **factored** loads (self-weight included): a uniform ${bm.wD} k/ft${P.length ? ` and point loads ${pts}` : ''}.${sup} ${mat}\n\nDesign the stirrups and sketch the layout.`
  } else {
    p.title = 'Stirrups for an overhanging beam'
    p.text = `A beam is supported over a span of ${bm.L} ft with a ${bm.ohR} ft overhang at the right. It carries **factored** loads (self-weight included): a uniform ${bm.wD} k/ft over the whole length and point loads ${pts}.${sup} ${mat}\n\nDesign the stirrups for the span and the overhang.`
  }
  const st: DStep[] = []
  const { dsg, main, at } = p
  const G1 = '1 — Shear force',
    G2 = '2 — Concrete and the case at the critical section',
    G3 = '3 — Spacing at the critical section',
    G4 = '4 — Zones (distance from the support face)',
    G5 = '5 — Layout'
  st.push({ key: 'R', group: G1, label: p.family === 'cantilever' ? 'Vu at the fixed end (reaction)' : 'left reaction (factored)', value: dsg.dg.R[0], unit: 'k' })
  st.push({ key: 'vf', group: G1, label: 'Vu at the face', value: main.Vface, unit: 'k' })
  st.push({ key: 'vd', group: G1, label: main.critAtFace ? 'Vu at the critical section (face: load within d)' : 'Vu at d from the face', value: main.Vd, unit: 'k' })
  st.push({ key: 'pvc', group: G2, label: 'φVc', value: dsg.lim.phiVc, unit: 'k' })
  st.push({ key: 'hvc', group: G2, label: '½φVc', value: dsg.lim.halfPhiVc, unit: 'k' })
  st.push({ key: 'case', group: G2, label: 'Case at d', options: (['A', 'B', 'C', 'D'] as const).map((v) => ({ v, label: v })), answer: at.case })
  st.push({ key: 'avs', group: G3, label: 'Av/s required', value: at.avs, unit: 'in²/in', digits: 4, abs: 0.0003 })
  st.push({ key: 'smax', group: G3, label: 's_max', value: at.sMax, unit: 'in' })
  st.push({ key: 's', group: G3, label: 'required s at d', value: at.s, unit: 'in' })
  if (main.uPhiVc !== null) st.push({ key: 'xb', group: G4, label: 'Vu = φVc at', value: main.uPhiVc / 12, unit: 'ft', abs: 0.05 })
  if (main.uHalf !== null) st.push({ key: 'xc', group: G4, label: 'Vu = ½φVc (stirrups end) at', value: main.uHalf / 12, unit: 'ft', abs: 0.05 })
  const lay = dsg.layouts[main.id]
  st.push({ key: 'nm', group: G5, label: `stirrups from the ${p.family === 'cantilever' ? 'fixed end' : 'left face'} (layout in the solution)`, value: lay.count, ...COUNT })
  if (p.oh) {
    const G6 = '6 — Overhang'
    st.push({ key: 'ovd', group: G6, label: 'Vu at d on the overhang', value: p.oh.run.Vd, unit: 'k' })
    st.push({ key: 'ocase', group: G6, label: 'Case', options: (['A', 'B', 'C', 'D'] as const).map((v) => ({ v, label: v })), answer: p.oh.at.case === 'redesign' ? 'D' : p.oh.at.case })
    if (Number.isFinite(p.oh.at.s)) st.push({ key: 'os', group: G6, label: 'required s at d', value: p.oh.at.s, unit: 'in' })
  }
  st.push({ key: 'tot', group: G5 + (p.oh ? ' (whole beam)' : ''), label: 'total stirrups in the beam', value: dsg.total, ...COUNT })
  p.steps = st
  return p
}
