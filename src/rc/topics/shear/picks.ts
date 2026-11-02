// Shear "Which one?" drill: Case A–D, s_max, governing Av/s, critical section, λ and φ.

import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import { choices, type PickSkill } from '../../components/PickDrill'
import { shearAt, shearLimits, type ShearCase } from '../../engine/shear'

const f = (v: number, d = 2) => fmt(v, d)

const CASE_LABEL: Record<ShearCase, string> = {
  A: 'Case A: no stirrups',
  B: 'Case B: minimum stirrups',
  C: 'Case C: designed, s ≤ d/2, 24 in',
  D: 'Case D: designed, s ≤ d/4, 12 in',
  redesign: 'Enlarge the section',
}

function beam(r: () => number) {
  const bw = pick(r, [10, 12, 14, 15, 16])
  const d = pick(r, [16.5, 18.5, 20.5, 21.5, 24, 27.5])
  const fc = pick(r, [3000, 4000, 5000])
  return { bw, d, fc, fy: 60000 }
}

const cases: PickSkill = {
  key: 'case',
  label: 'Case A–D',
  gen: (r) => {
    const sec = beam(r)
    const k = shearLimits(sec)
    const want = pick(r, ['A', 'B', 'C', 'C', 'D', 'D', 'redesign'] as ShearCase[])
    const lo = { A: 0.15 * k.phiVc, B: k.halfPhiVc, C: k.phiVc, D: 3 * k.phiVc, redesign: 5 * k.phiVc }[want]
    const hi = { A: k.halfPhiVc, B: k.phiVc, C: 3 * k.phiVc, D: 5 * k.phiVc, redesign: 6.5 * k.phiVc }[want]
    const Vu = Math.round(lo + (0.15 + 0.7 * r()) * (hi - lo))
    const a = shearAt(Vu, sec)
    return {
      q: `bw = ${sec.bw} in, d = ${sec.d} in, f′c = ${sec.fc} psi → φVc = ${f(k.phiVc, 1)} k. Vu at the section = ${Vu} k. Which case?`,
      options: Object.values(CASE_LABEL),
      ordered: true,
      answer: CASE_LABEL[a.case],
      why: `Limits: φVc/2 = ${f(k.halfPhiVc, 1)}, φVc = ${f(k.phiVc, 1)}, 3φVc = ${f(3 * k.phiVc, 1)} (Vs = 4√f′c bw d), 5φVc = ${f(5 * k.phiVc, 1)} k (Vs = 8√f′c bw d). Vu = ${Vu} k → **${CASE_LABEL[a.case]}**.`,
      ref: 's-cases',
    }
  },
}

const smax: PickSkill = {
  key: 'smax',
  label: 's_max',
  gen: (r) => {
    const sec = beam(r)
    const k = shearLimits(sec)
    const cs = pick(r, ['B', 'C', 'D'] as const)
    const ans = cs === 'D' ? k.smaxD : k.smaxC
    const L = (x: number) => `${f(x, 3)} in`
    return {
      q: `Case ${cs} region, d = ${sec.d} in. Maximum stirrup spacing = ?`,
      options: choices(r, L(ans), [L(sec.d / 2), L(24), L(sec.d / 4), L(12)]),
      answer: L(ans),
      why: cs === 'D' ? `Vs > 4√f′c bw d → halve the limits: min(d/4, 12 in) = **${f(ans, 3)} in**.` : `Case ${cs}: min(d/2, 24 in) = **${f(ans, 3)} in**.`,
      ref: 's-cases',
    }
  },
}

const avs: PickSkill = {
  key: 'avs',
  label: 'Governing Av/s',
  gen: (r) => {
    const sec = beam(r)
    const k = shearLimits(sec)
    const Vu = Math.round(k.phiVc * (1.05 + 1.6 * r()))
    const a = shearAt(Vu, sec)
    const T = {
      ex: '$\\dfrac{V_u - \\phi V_c}{\\phi f_y d}$',
      m1: "$\\dfrac{0.75\\sqrt{f'_c}\\,b_w}{f_y}$",
      m2: '$\\dfrac{50\\,b_w}{f_y}$',
    }
    const vals = { ex: a.avsExcess, m1: a.avsMin1, m2: a.avsMin2 }
    const gov = (Object.keys(vals) as (keyof typeof vals)[]).reduce((x, y) => (vals[y] > vals[x] ? y : x), 'ex')
    return {
      q: `bw = ${sec.bw} in, d = ${sec.d} in, f′c = ${sec.fc} psi, fy = 60 ksi, φVc = ${f(k.phiVc, 1)} k, Vu = ${Vu} k. Which Av/s term governs?`,
      options: [T.ex, T.m1, T.m2],
      answer: T[gov],
      why: `(Vu − φVc)/(φfy d) = ${f(a.avsExcess, 4)}, 0.75√f′c bw/fy = ${f(a.avsMin1, 4)}, 50bw/fy = ${f(a.avsMin2, 4)} in²/in → the largest governs. Between the two minimums, 0.75√f′c wins only above f′c ≈ 4444 psi.`,
      ref: 's-cases',
    }
  },
}

const crit: PickSkill = {
  key: 'crit',
  label: 'Critical section',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Beam resting on a bearing wall, UDL on top.', a: 'd from the face' },
      { t: 'Beam framing into a column (support in compression), UDL on top.', a: 'd from the face' },
      { t: 'A 40 k point load sits 8 in from the support face; d = 18 in.', a: 'At the face' },
      { t: 'Load hung from the bottom of the beam (ledger).', a: 'At the face' },
      { t: 'Beam carried by a girder of about the same depth.', a: 'At the face' },
      { t: 'Support member in tension (beam hanging from a tie).', a: 'At the face' },
    ])
    return {
      q: `${c.t} Where do you take the design Vu?`,
      options: ['d from the face', 'At the face', 'd/2 from the face', 'At the support centreline'],
      answer: c.a,
      why: 'Vu may be taken at d only when the support reaction puts the end region in compression and the load is applied at the top with no concentrated load inside d. Otherwise use the face.',
      ref: 's-vc',
    }
  },
}

const lam: PickSkill = {
  key: 'lam',
  label: 'λ and φ',
  gen: (r) => {
    if (r() < 0.5) {
      const c = pick(r, [
        { t: 'normal-weight', a: '1.0' },
        { t: 'sand-lightweight', a: '0.85' },
        { t: 'all-lightweight', a: '0.75' },
      ])
      return { q: `Vc = 2λ√f′c bw d for ${c.t} concrete. λ = ?`, options: ['1.0', '0.85', '0.75', '0.65'], answer: c.a, why: 'Normal weight 1.0, sand-lightweight 0.85, all-lightweight 0.75.', ref: 's-vc' }
    }
    const old = r() < 0.4
    const yr = old ? randInt(r, 2002, 2010) : randInt(r, 2014, 2024)
    return {
      q: `${old ? `An old paper (${yr}) using ACI 318-99 with 1.4D + 1.7L.` : 'Current ACI (1.2D + 1.6L).'} φ for shear = ?`,
      options: ['0.75', '0.85', '0.90', '0.65'],
      answer: old ? '0.85' : '0.75',
      why: old ? 'Before ACI 318-02 shear used φ = 0.85 with the 1.4D + 1.7L factors. Solve old papers as asked.' : 'φ = 0.75 for shear and torsion (ACI 318-02 onward).',
      ref: 's-vc',
    }
  },
}

export const SHEAR_PICKS: PickSkill[] = [cases, smax, avs, crit, lam]
