// T-beam "Which one?" drill: which beff rule governs, rectangular or true T, isolated-T checks.

import { fmt } from '../../../components/DiagramView'
import { pick } from '../../../labs/common'
import { type PickSkill } from '../../components/PickDrill'
import { effectiveWidth, reviewT, type FlangeKind } from '../../engine/tbeam'

const f = (v: number, d = 2) => fmt(v, d)

const beff: PickSkill = {
  key: 'beff',
  label: 'beff rule',
  gen: (r) => {
    const kind = pick(r, ['interior', 'interior', 'edge'] as FlangeKind[])
    const L = pick(r, [16, 20, 24, 28, 32])
    const bw = pick(r, [10, 12, 14])
    const hf = pick(r, [3.5, 4, 5, 6])
    const cc = pick(r, [5, 6, 8, 10, 12]) * 12
    const o = effectiveWidth({ kind, L, bw, hf, cc })
    const lab: Record<string, string> = { '16hf': '$16h_f + b_w$', L4: '$L/4 + b_w$', cc: 'c/c beam spacing', '6hf': '$6h_f + b_w$', L12: '$L/12 + b_w$', half: '$\\tfrac12$ clear distance $+ b_w$' }
    return {
      q: `${kind === 'interior' ? 'Interior T-beam (slab both sides)' : 'Edge L-beam (slab one side)'}: span L = ${L} ft, bw = ${bw} in, hf = ${hf} in, beams at ${cc / 12} ft c/c. Which limit gives beff?`,
      options: o.cands.map((c) => lab[c.key]),
      answer: lab[o.governs],
      why: `${o.cands.map((c) => `${c.label.replace('h_f', 'hf').replace('b_w', 'bw')} = ${f(c.value, 1)}`).join(', ')} in → least = **${f(o.b, 1)} in**. (Class: ACI 318-14 interior rule bw + L/4.)`,
      ref: 'f-beff',
    }
  },
}

const behave: PickSkill = {
  key: 'behave',
  label: 'Rectangular or T?',
  gen: (r) => {
    const A = { rb: 'Rectangular, width beff', rw: 'Rectangular, width bw', t: 'True T: split into Asf + web' }
    if (r() < 0.25)
      return {
        q: 'Continuous T-beam floor: designing the negative-moment steel at the face of an interior support. Which section?',
        options: Object.values(A),
        answer: A.rw,
        why: 'Negative moment puts the flange in **tension**; the compression zone is the web bottom → rectangle bw × d (bars in the slab, often two layers).',
        ref: 'st-tbeam',
      }
    const bf = pick(r, [36, 48, 60, 72])
    const bw = pick(r, [10, 12, 14])
    const hf = pick(r, [3, 4, 5])
    const d = pick(r, [18, 20, 22, 24])
    const As = pick(r, [3, 4, 5, 6.3, 8, 10])
    const t = reviewT({ beff: bf, bw, hf, d, As, fc: 4, fy: 60 })
    return {
      q: `Positive moment: beff = ${bf} in, bw = ${bw} in, hf = ${hf} in, d = ${d} in, As = ${As} in², f′c = 4 ksi, fy = 60 ksi. How do you analyse it?`,
      options: Object.values(A),
      answer: t.rect ? A.rb : A.t,
      why: `a = As fy / (0.85 f′c beff) = ${f(t.aRect, 2)} in ${t.rect ? '≤' : '>'} hf = ${hf} in → ${t.rect ? 'block inside the flange: rectangular beam of width beff' : 'block enters the web: Asf = 0.85f′c(beff − bw)hf/fy, then the web part'}.`,
      ref: 'st-tbeam',
    }
  },
}

const iso: PickSkill = {
  key: 'iso',
  label: 'Isolated T',
  gen: (r) => {
    const bw = pick(r, [8, 10, 12])
    const hf = pick(r, [3, 4, 5, 6])
    const b = pick(r, [24, 32, 40, 48, 56])
    const o = effectiveWidth({ kind: 'isolated', L: 20, bw, hf, bActual: b })!.isolatedOk!
    const A = { ok: 'Both checks pass', hf: 'Fails: hf < bw/2', b: 'Fails: b > 4bw', both: 'Fails both' }
    const ans = o.hf && o.b ? A.ok : !o.hf && !o.b ? A.both : !o.hf ? A.hf : A.b
    return {
      q: `Isolated T-beam (precast): bw = ${bw} in, flange ${b} in wide, hf = ${hf} in. ACI isolated-T requirements?`,
      options: Object.values(A),
      answer: ans,
      why: `Isolated T: hf ≥ bw/2 (${hf} vs ${bw / 2}) and flange width ≤ 4bw (${b} vs ${4 * bw}).`,
      ref: 'f-beff',
    }
  },
}

export const TBEAM_PICKS: PickSkill[] = [beff, behave, iso]
