// Doubly "Which one?" drill: is A′s needed, does A′s yield, which expression.

import { fmt } from '../../../components/DiagramView'
import { pick } from '../../../labs/common'
import { type PickSkill } from '../../components/PickDrill'
import { ES_KSI } from '../../engine/doubly'
import { rhoLimits } from '../../engine/materials'

const f = (v: number, d = 2) => fmt(v, d)

const need: PickSkill = {
  key: 'need',
  label: 'Need A′s?',
  gen: (r) => {
    const b = pick(r, [12, 14, 16])
    const d = pick(r, [18, 20, 22, 24])
    const fc = pick(r, [4000, 5000])
    const fy = 60000
    const L = rhoLimits(fc, fy)
    const As1 = L.rho005 * b * d
    const a = (As1 * fy) / (0.85 * fc * b)
    const phiMn1 = (0.9 * As1 * fy * (d - a / 2)) / 12000
    const Mu = Math.round(phiMn1 * pick(r, [0.7, 0.9, 1.15, 1.4]))
    const A = { s: 'Singly reinforced is enough', d: 'Compression steel A′s needed' }
    return {
      q: `b × h fixed by the architect: b = ${b} in, d = ${d} in, f′c = ${fc} psi, Grade 60. With ρ0.005 the section gives φMn1 = ${f(phiMn1, 1)} k-ft. Mu = ${Mu} k-ft. Which design?`,
      options: [A.s, A.d],
      answer: Mu <= phiMn1 ? A.s : A.d,
      why: Mu <= phiMn1 ? 'Mu ≤ φMn1 → design as singly (ρ ≤ ρ0.005, φ = 0.9).' : `Mu > φMn1 → A′s carries φMn2 = Mu − φMn1 = ${f(Mu - phiMn1, 1)} k-ft; As = As1 + As2.`,
      ref: 'st-doubly',
    }
  },
}

const yieldQ: PickSkill = {
  key: 'yield',
  label: 'Does A′s yield?',
  gen: (r) => {
    const fy = pick(r, [40, 60, 60, 75])
    const dp = pick(r, [2.5, 2.5, 3])
    const c = pick(r, [4.2, 5.1, 6, 7.4, 8.8, 10.5])
    const esp = (0.003 * (c - dp)) / c
    const ey = fy / ES_KSI
    const A = { y: "$f'_s = f_y$ (A′s yields)", n: "$f'_s = 87\\,\\frac{c - d'}{c}$ ksi", w: "$f'_s = 2n f_c\\frac{kd - d'}{kd}$" }
    return {
      q: `Doubly reinforced review: c = ${c} in, d′ = ${dp} in, fy = ${fy} ksi. f′s = ?`,
      options: [A.y, A.n, A.w],
      answer: esp >= ey ? A.y : A.n,
      why: `ε′s = 0.003(c − d′)/c = ${esp.toFixed(5)} vs εy = fy/Es = ${ey.toFixed(5)} → ${esp >= ey ? 'yields, f′s = fy' : `does not yield: f′s = Es·ε′s = 87(c − d′)/c = ${f(87 * (c - dp) / c, 1)} ksi, and c must come from the quadratic`}. The 2n form is the WSD (elastic) one.`,
      ref: 'f-asyield',
    }
  },
}

const recall: PickSkill = {
  key: 'recall',
  label: 'Which expression',
  gen: (r) => {
    const c = pick(r, [
      { q: 'Force in the compression steel (class, displaced concrete subtracted):', a: "$C_s = A'_s(f'_s - 0.85f'_c)$", w: ["$C_s = A'_sf_y$", "$C_s = (2n-1)A'_sf'_s$", "$C_s = A'_sf'_s(d - d')$"] },
      { q: 'Lever arm of Cs about the tension steel:', a: "$d - d'$", w: ["$d - a/2$", "$d' - a/2$", "$d_t - d'$"] },
      { q: 'Net tensile strain for φ is measured at:', a: '$d_t$ (extreme tension layer)', w: ['$d$ (centroid of the tension steel)', "$d'$", '$h$'] },
      { q: 'When A′s does not yield, c comes from:', a: '$0.85f\'_c\\beta_1bc + A\'_s(87\\frac{c-d\'}{c} - 0.85f\'_c) = A_sf_y$', w: ["$a = \\frac{(A_s - A'_s)f_y}{0.85f'_cb}$", "$a = \\frac{A_sf_y}{0.85f'_cb}$", "$\\frac{b(kd)^2}{2} = nA_s(d - kd)$"] },
      { q: 'In design, the extra tension steel that balances A′s is:', a: "$A_{s2} = A'_sf'_s/f_y$", w: ["$A_{s2} = A'_s$", "$A_{s2} = \\rho_{0.005}bd$", "$A_{s2} = M_u/\\phi f_y(d - a/2)$"] },
    ])
    return { q: c.q, options: [c.a, ...c.w], answer: c.a, why: `**${c.a}**.`, ref: 'st-doubly' }
  },
}

export const DOUBLY_PICKS: PickSkill[] = [need, yieldQ, recall]
