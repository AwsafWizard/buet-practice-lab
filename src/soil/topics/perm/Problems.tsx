// Permeability exam-style problems: constant head (with seepage velocity), falling head, time scaling, layered
// permeameter, pumping test, capillary rise. Every number from engine/permeability.

import { fmt } from '../../../components/DiagramView'
import { Md } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { capRiseSoil, capRiseTube, darcy, layered, pumpConfined, pumpUnconfined, scaleFallTime, type KLayer } from '../../engine/permeability'
import { ExamProblems, type Level, type XProblem } from '../seep/examShell'
import { LayeredSolution, PermSolution, permResults, sciTex, type PermState } from './Labs'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

export type PFam = 'const' | 'fall' | 'scale' | 'layers' | 'pump' | 'cap'
const FAMS: { v: PFam; label: string }[] = [
  { v: 'const', label: 'Constant head' },
  { v: 'fall', label: 'Falling head' },
  { v: 'scale', label: 'Time to fall' },
  { v: 'layers', label: 'Layered sample' },
  { v: 'pump', label: 'Pumping test' },
  { v: 'cap', label: 'Capillary rise' },
]

interface PP extends XProblem<PFam> {
  perm?: PermState
  scale?: { h0: number; h1: number; t1: number; h2: number }
  layers?: { ls: KLayer[]; Lp: number; D: number; t: number }
  pump?: { conf: boolean; q: number; r1: number; r2: number; h1: number; h2: number; T: number }
  cap?: { d: number; e: number; D10: number; C: number }
}

function make(seed: number, family?: PFam, level: Level = 'exam'): PP {
  const r = rng(seed * 5813 + 29)
  const fam = family ?? pick(r, FAMS.map((f) => f.v))
  if (fam === 'const' || fam === 'fall') {
    const p: PermState = { mode: fam, D: pick(r, [5, 6, 7.5, 10]), L: pick(r, [10, 12, 15, 20]), h: randInt(r, 20, 80), Q: randInt(r, 100, 900), t: pick(r, [300, 600, 900]), d: pick(r, [0.4, 0.5, 0.8, 1]), h1: randInt(r, 50, 120), h2: 0, Ws: 0, Gs: pick(r, [2.65, 2.67, 2.7]) }
    if (fam === 'fall') p.h2 = Math.round(p.h1 * (0.4 + 0.4 * r()))
    if (fam === 'const' && level !== 'basic') p.Ws = Math.round((Math.PI / 4) * p.D * p.D * p.L * (1 - randInt(r, 30, 42) / 100) * p.Gs)
    const R = permResults(p)
    const steps =
      fam === 'const'
        ? [
            { key: 'k', group: 'Permeability', label: 'k (cm/s)', value: R.k, digits: 6 },
            { key: 'v', group: 'Velocities', label: 'discharge velocity (cm/s)', value: R.v, digits: 5 },
            ...(p.Ws ? [{ key: 'n', group: 'Velocities', label: 'porosity n', value: R.n, digits: 3 }, { key: 'vs', group: 'Velocities', label: 'seepage velocity (cm/s)', value: R.vs, digits: 5 }] : []),
          ]
        : [
            { key: 'k', group: 'Permeability', label: 'k (cm/s)', value: R.k, digits: 6 },
            { key: 't2', group: 'Time', label: `time to fall from ${p.h1} to ${f2(p.h1 / 2)} cm (s)`, value: scaleFallTime(p.t, p.h1, p.h2, p.h1 / 2) },
          ]
    const text =
      fam === 'const'
        ? `${p.Q} ml of water was collected in ${p.t / 60} min from a constant-head permeameter of ${p.D} cm internal diameter. The head difference between two gauging points ${p.L} cm apart is ${p.h} cm. Find k and comment on its value, and the discharge velocity.${p.Ws ? ` The dry mass of the ${p.L} cm sample between the points is ${p.Ws} g (Gs = ${p.Gs}); find the seepage velocity.` : ''}`
        : `In a falling-head test on a sample ${p.D} cm in diameter and ${p.L} cm long, the head in a standpipe of ${p.d} cm internal diameter fell from ${p.h1} cm to ${p.h2} cm in ${p.t / 60} min. Find k, and the time for the head to fall from ${p.h1} cm to half of it.`
    return { family: fam, level, title: fam === 'const' ? 'Constant-head test' : 'Falling-head test', text, hash: hashKey(JSON.stringify(p)), steps, perm: p }
  }
  if (fam === 'scale') {
    const h0 = randInt(r, 40, 100)
    const h1 = h0 - randInt(r, 2, 8)
    const t1 = randInt(r, 3, 10)
    const h2 = Math.round(h0 * (0.3 + 0.4 * r()))
    return {
      family: fam,
      level,
      title: 'Time for the head to fall (2011-12 Q6(c) style)',
      text: `In a falling-head test the head causing flow was initially ${h0} cm and dropped by ${h0 - h1} cm in ${t1} minutes. How much time is required for the head to fall to ${h2} cm?`,
      hash: hashKey(JSON.stringify(['s', h0, h1, t1, h2])),
      steps: [{ key: 't', group: 'Time', label: 'time (min)', value: scaleFallTime(t1, h0, h1, h2) }],
      scale: { h0, h1, t1, h2 },
    }
  }
  if (fam === 'layers') {
    const n = level === 'basic' ? 2 : 3
    const ls = Array.from({ length: n }, () => ({ H: randInt(r, 3, 8), k: randInt(r, 2, 9) * 10 ** -randInt(r, 3, 5) }))
    const Hs = ls.reduce((s, l) => s + l.H, 0)
    const Lp = Hs + randInt(r, 5, 20)
    const D = pick(r, [5, 6, 8, 10])
    const t = pick(r, [300, 600, 900])
    const L = layered(ls)
    const q = darcy({ k: L.kv, i: Lp / Hs, A: (Math.PI / 4) * D * D }).q
    return {
      family: fam,
      level,
      title: 'Layered sand in a pipe (2020-21 Q2(a) style)',
      text: `A pipe ${Lp} cm long and ${D} cm in internal diameter, with a screen at the bottom and open at the top, holds ${n} sand layers (top to bottom) ${ls.map((l) => `${l.H} cm thick with k = ${l.k.toExponential(0)} cm/s`).join(', ')}, resting on the screen. Water is kept at the top of the pipe. Find the equivalent k and the volume of water flowing in ${t / 60} minutes. Also give the equivalent k for flow parallel to the layers.`,
      hash: hashKey(JSON.stringify(['l', ls, Lp, D, t])),
      steps: [
        { key: 'kv', group: 'Equivalent k', label: 'kv,eq (cm/s)', value: L.kv, digits: 7 },
        { key: 'kh', group: 'Equivalent k', label: 'kh,eq (cm/s)', value: L.kh, digits: 7 },
        { key: 'Q', group: 'Flow', label: `volume in ${t / 60} min (cm³)`, value: q * t, digits: 3 },
      ],
      layers: { ls, Lp, D, t },
    }
  }
  if (fam === 'pump') {
    const conf = level === 'tough' ? true : r() < 0.4
    const pp = { conf, q: randInt(r, 5, 60) / 1000, r1: randInt(r, 5, 20), r2: 0, h1: randInt(r, 30, 80) / 10, h2: 0, T: randInt(r, 3, 12) }
    pp.r2 = pp.r1 + randInt(r, 15, 60)
    pp.h2 = Math.round((pp.h1 + randInt(r, 3, 20) / 10) * 100) / 100
    const k = conf ? pumpConfined(pp) : pumpUnconfined(pp)
    return {
      family: fam,
      level,
      title: conf ? 'Pumping test, confined aquifer' : 'Pumping test, unconfined',
      text: conf
        ? `A well fully penetrates a confined aquifer ${pp.T} m thick. At steady pumping of ${pp.q} m³/s the piezometric heads in observation wells ${pp.r1} m and ${pp.r2} m away are ${pp.h1} m and ${pp.h2} m above the aquifer base. Find k.`
        : `A well fully penetrates an unconfined sand on an impermeable base. At a steady discharge of ${pp.q} m³/s the water levels in observation wells ${pp.r1} m and ${pp.r2} m away stand ${pp.h1} m and ${pp.h2} m above the impermeable base. Find k.`,
      hash: hashKey(JSON.stringify(pp)),
      steps: [{ key: 'k', group: 'Permeability', label: 'k (m/s)', value: k, digits: 7 }],
      pump: pp,
    }
  }
  const cap = { d: pick(r, [0.005, 0.01, 0.02, 0.05]), e: randInt(r, 45, 90) / 100, D10: pick(r, [0.005, 0.01, 0.02, 0.05, 0.1]), C: pick(r, [0.1, 0.2, 0.3, 0.5]) }
  return {
    family: 'cap',
    level,
    title: 'Capillary rise',
    text: `(i) How high will water rise in a clean glass tube of ${cap.d} mm bore (σ = 0.0728 N/m, θ = 0)? (ii) Estimate the capillary rise in a soil with e = ${cap.e} and D10 = ${cap.D10} mm (C = ${cap.C} cm²), and the pore pressure at the top of its capillary zone.`,
    hash: hashKey(JSON.stringify(cap)),
    steps: [
      { key: 't', group: 'Tube', label: 'rise (m)', value: capRiseTube(cap.d / 1000), digits: 3 },
      { key: 's', group: 'Soil', label: 'rise (m)', value: capRiseSoil(cap.e, cap.D10 / 10, cap.C) / 100, digits: 3 },
      { key: 'u', group: 'Soil', label: 'u at the top (kPa)', value: (-capRiseSoil(cap.e, cap.D10 / 10, cap.C) / 100) * 9.81, digits: 2 },
    ],
    cap,
  }
}

function Solution({ p }: { p: PP }) {
  if (p.perm) return <PermSolution s={p.perm} />
  if (p.scale) {
    const s = p.scale
    return <Md>{`For one apparatus $k = \\frac{aL}{At}\\ln\\frac{h_1}{h_2}$ with everything but t fixed, so $t \\propto \\ln(h_1/h_2)$: $$t = ${s.t1} \\times \\frac{\\ln(${s.h0}/${s.h2})}{\\ln(${s.h0}/${s.h1})} = ${f2(scaleFallTime(s.t1, s.h0, s.h1, s.h2))}\\ \\text{min}$$ (not ${f2((s.t1 * (s.h0 - s.h2)) / (s.h0 - s.h1))} min: the head falls exponentially).`}</Md>
  }
  if (p.layers) {
    const l = p.layers
    const Hs = l.ls.reduce((s, x) => s + x.H, 0)
    const A = (Math.PI / 4) * l.D * l.D
    const L = layered(l.ls)
    return (
      <div className="space-y-1">
        <LayeredSolution ls={l.ls} h={l.Lp} A={A} />
        <Md>{`Water stands at the top of the ${l.Lp} cm pipe and leaves freely at the screen, so the whole ${l.Lp} cm of head is lost across ${Hs} cm of sand: $i = ${f3(l.Lp / Hs)}$. Volume in ${l.t} s $= ${sciTex(L.kv * (l.Lp / Hs) * A, 3)} \\times ${l.t} = ${f3(L.kv * (l.Lp / Hs) * A * l.t)}$ cm³.`}</Md>
      </div>
    )
  }
  if (p.pump) {
    const s = p.pump
    const k = s.conf ? pumpConfined(s) : pumpUnconfined(s)
    return <Md>{s.conf ? `$$k = \\frac{q\\ln(r_2/r_1)}{2\\pi T(h_2 - h_1)} = \\frac{${s.q}\\ln(${s.r2}/${s.r1})}{2\\pi(${s.T})(${s.h2} - ${s.h1})} = ${sciTex(k, 3)}\\ \\text{m/s}$$` : `$$k = \\frac{q\\ln(r_2/r_1)}{\\pi(h_2^2 - h_1^2)} = \\frac{${s.q}\\ln(${s.r2}/${s.r1})}{\\pi(${s.h2}^2 - ${s.h1}^2)} = ${sciTex(k, 3)}\\ \\text{m/s}$$`}</Md>
  }
  if (p.cap) {
    const c = p.cap
    const ht = capRiseTube(c.d / 1000)
    const hs = capRiseSoil(c.e, c.D10 / 10, c.C) / 100
    return <Md>{`(i) $h_c = \\dfrac{4\\sigma}{d\\gamma_w} = \\dfrac{4 \\times 0.0728}{${c.d / 1000} \\times 9810} = ${f3(ht)}$ m.
(ii) $h_c = \\dfrac{C}{eD_{10}} = \\dfrac{${c.C}}{${c.e} \\times ${c.D10 / 10}} = ${f2(hs * 100)}$ cm $= ${f3(hs)}$ m; at the top $u = -h_c\\gamma_w = ${f2(-hs * 9.81)}$ kPa (suction: σ′ is larger than σ there).`}</Md>
  }
  return null
}

export function PermProblems() {
  return <ExamProblems topic="sm-perm" families={FAMS} make={make} solution={(p) => <Solution p={p} />} />
}

export { make as makePermProblem }
