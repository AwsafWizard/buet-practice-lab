// Permeability "Which one?" drill: lab method, layered k, typical k band, velocities, falling-head time scaling.

import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { kBand, layered, scaleFallTime } from '../../engine/permeability'

const f2 = (v: number) => fmt(v, 2)

const method: PickSkill = {
  key: 'method',
  label: 'Which test?',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Clean coarse sand, k ≈ 10⁻¹ cm/s, in the lab', a: 'Constant-head permeameter' },
      { t: 'Fine silty sand, k ≈ 10⁻⁴ cm/s, in the lab', a: 'Falling-head permeameter' },
      { t: 'Soft clay, k ≈ 10⁻⁸ cm/s', a: 'Indirect: k = cv·mv·γw from the oedometer' },
      { t: 'A stratified sand aquifer, the value for design of dewatering', a: 'Field pumping test' },
      { t: 'A quick first estimate for a clean uniform sand from its grading', a: "Hazen: k = C·D10²" },
    ])
    return {
      q: `${c.t}: how do you find k?`,
      options: ['Constant-head permeameter', 'Falling-head permeameter', 'Indirect: k = cv·mv·γw from the oedometer', 'Field pumping test', 'Hazen: k = C·D10²'],
      answer: c.a,
      why: 'Constant head needs a measurable flow quickly (coarse soils); falling head suits fine sand and silt; clays take too long and evaporation spoils a direct test, so use consolidation data; field tests represent stratified deposits; Hazen is only an estimate for clean sands.',
      ref: 'w-perm',
    }
  },
}

const layers: PickSkill = {
  key: 'layers',
  label: 'Layered k',
  gen: (r) => {
    const pool = [1e-2, 5e-3, 1e-3, 2e-4, 1e-5, 5e-6]
    const ls = [0, 1, 2].map(() => ({ H: randInt(r, 1, 6), k: pool.splice(Math.floor(r() * pool.length), 1)[0] }))
    const L = layered(ls)
    const dir = r() < 0.5 ? 'parallel to' : 'perpendicular to'
    const ans = dir === 'parallel to' ? L.kh : L.kv
    const S = (v: number) => `${v.toExponential(2)} cm/s`
    return {
      q: `Layers (top to bottom) H = ${ls.map((l) => l.H).join(', ')} m with k = ${ls.map((l) => l.k.toExponential(0)).join(', ')} cm/s. Equivalent k for flow ${dir} the bedding?`,
      options: [S(L.kh), S(L.kv), S(ls.reduce((s, l) => s + l.k, 0) / 3), S(Math.max(...ls.map((l) => l.k)))],
      answer: S(ans),
      why: `Along the layers (same i) $k_h = \\sum k_iH_i/H = ${L.kh.toExponential(2)}$; across them (same v) $k_v = H/\\sum(H_i/k_i) = ${L.kv.toExponential(2)}$ cm/s, governed by the least permeable layer.`,
      ref: 'w-perm',
    }
  },
}

const band: PickSkill = {
  key: 'band',
  label: 'Typical k',
  gen: (r) => {
    const e = randInt(r, -8, 0)
    const k = pick(r, [1, 2, 5]) * 10 ** e
    return {
      q: `A soil has k = ${k.toExponential(0)} cm/s. Most likely it is …`,
      options: ['Clean gravel', 'Coarse sand', 'Fine sand', 'Silty sand / silt', 'Clay'],
      ordered: true,
      answer: kBand(k),
      why: 'Class list: gravel > 10⁻¹; coarse sand 1–10⁻²; fine sand 10⁻²–10⁻³; silt 10⁻³–10⁻⁵; clay < 10⁻⁶ cm/s.',
      ref: 'w-k',
    }
  },
}

const velocity: PickSkill = {
  key: 'vel',
  label: 'Velocities',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Flow rate divided by the whole cross-section of soil', a: 'Discharge velocity v = ki' },
      { t: 'The average speed of water actually moving through the voids', a: 'Seepage velocity vs = v/n' },
      { t: 'What a tracer dye injected upstream travels at', a: 'Seepage velocity vs = v/n' },
      { t: 'The velocity in q = kiA', a: 'Discharge velocity v = ki' },
      { t: 'Seepage force on the grains per unit volume', a: 'iγw (not a velocity)' },
    ])
    return {
      q: `${c.t}: which is it?`,
      options: ['Discharge velocity v = ki', 'Seepage velocity vs = v/n', 'iγw (not a velocity)'],
      ordered: true,
      answer: c.a,
      why: 'v = q/A uses the gross area; the water only has the voids, area nA, so it moves faster: vs = v/n > v.',
      ref: 'w-perm',
    }
  },
}

const scale: PickSkill = {
  key: 'scale',
  label: 'Falling-head time',
  gen: (r) => {
    const h0 = randInt(r, 40, 100)
    const h1 = h0 - randInt(r, 2, 10)
    const t1 = randInt(r, 2, 10)
    const h2 = Math.round(h0 * (0.3 + 0.4 * r()))
    const t = scaleFallTime(t1, h0, h1, h2)
    const L = (v: number) => `${f2(v)} min`
    return {
      q: `Falling head: ${h0} cm drops to ${h1} cm in ${t1} min. Time from ${h0} to ${h2} cm in the same apparatus?`,
      options: [L(t), L((t1 * (h0 - h2)) / (h0 - h1)), L((t1 * Math.log(h0 / h2)) / Math.log(h1 / h2 + 1)), L(t1 * (h0 / h2))],
      answer: L(t),
      why: `$t \\propto \\ln(h_1/h_2)$: $t = ${t1}\\ln(${h0}/${h2})/\\ln(${h0}/${h1}) = ${f2(t)}$ min (the head falls exponentially, not linearly).`,
      ref: 'w-perm',
    }
  },
}

export const PERM_PICKS: PickSkill[] = [method, layers, band, velocity, scale]
