// Elastic / WSD "Which one?" drill: cracked or not, n, allowable stresses, transformed areas, governing stress.

import { fmt } from '../../../components/DiagramView'
import { pick } from '../../../labs/common'
import { choices, type PickSkill } from '../../components/PickDrill'
import { allowableMoment, uncracked, wsdAllowables } from '../../engine/elastic'
import { modRatio } from '../../engine/materials'

const f = (v: number, d = 2) => fmt(v, d)

const crack: PickSkill = {
  key: 'crack',
  label: 'Cracked or uncracked',
  gen: (r) => {
    const sec = { b: pick(r, [10, 12, 14]), h: pick(r, [18, 20, 24]), As: pick(r, [1.58, 2.37, 3.16]), fc: pick(r, [3000, 4000, 5000]) }
    const inp = { ...sec, d: sec.h - 2.5 }
    const u = uncracked(inp)
    const M = Math.round(u.Mcr * pick(r, [0.5, 0.8, 1.3, 2.5, 4]))
    const A = { u: 'Uncracked: transformed (n − 1)As, I_ut', c: 'Cracked: nAs, I_cr (concrete in tension ignored)' }
    return {
      q: `b × h = ${sec.b} × ${sec.h} in, d = ${inp.d} in, As = ${sec.As} in², f′c = ${sec.fc} psi → Mcr = ${f(u.Mcr, 1)} k-ft. Service moment M = ${M} k-ft. Which section for the stresses?`,
      options: Object.values(A),
      answer: M <= u.Mcr ? A.u : A.c,
      why: M <= u.Mcr ? 'M ≤ Mcr → the concrete has not cracked; use the uncracked transformed section.' : 'M > Mcr → cracked; use kd from b(kd)²/2 = nAs(d − kd) and I_cr.',
      ref: 'f-elastic',
    }
  },
}

const nQ: PickSkill = {
  key: 'n',
  label: 'Modular ratio n',
  gen: (r) => {
    const fc = pick(r, [2500, 3000, 3500, 4000, 4500, 5000, 6000])
    const ex = modRatio(fc)
    const ans = String(Math.round(ex))
    return {
      q: `f′c = ${fc} psi, Es = 29 000 ksi, Ec = 57 000√f′c psi. n (class rounding) = ?`,
      options: choices(r, ans, ['6', '7', '8', '9', '10', '11']),
      answer: ans,
      why: `Ec = ${f(57 * Math.sqrt(fc), 0)} ksi → n = ${f(ex, 2)} → nearest whole number **${ans}**.`,
      ref: 'm-props',
    }
  },
}

const allow: PickSkill = {
  key: 'allow',
  label: 'WSD allowables',
  gen: (r) => {
    if (r() < 0.5) {
      const fy = pick(r, [40000, 50000, 60000])
      const a = wsdAllowables(4000, fy)
      return { q: `WSD, Grade ${fy / 1000} steel (no other instruction). Allowable steel stress fs = ?`, options: ['20 ksi', '24 ksi', '30 ksi', '0.5fy'], answer: `${a.fs} ksi`, why: 'Grade 40 or 50 → 20 ksi; Grade 60 and higher → 24 ksi (= 0.4fy for Grade 60).', ref: 'f-wsd' }
    }
    const fc = pick(r, [3000, 3500, 4000, 5000])
    const a = wsdAllowables(fc).fc
    const L = (x: number) => `${f(x, 3)} ksi`
    return { q: `WSD, f′c = ${fc} psi. Allowable concrete stress in flexure fc = ?`, options: choices(r, L(a), [L(0.4 * fc / 1000), L(0.5 * fc / 1000), L(0.85 * fc / 1000), L(0.6 * fc / 1000)]), answer: L(a), why: `fc = 0.45f′c = **${f(a, 3)} ksi**.`, ref: 'f-wsd' }
  },
}

const trans: PickSkill = {
  key: 'trans',
  label: 'Transformed area',
  gen: (r) => {
    const c = pick(r, [
      { t: 'tension steel, uncracked section', a: '$(n-1)A_s$' },
      { t: 'tension steel, cracked section', a: '$nA_s$' },
      { t: "compression steel, uncracked section", a: "$(n-1)A'_s$" },
      { t: "compression steel, cracked section (class / WSD, creep)", a: "$(2n-1)A'_s$" },
    ])
    return { q: `Transformed area for the ${c.t}?`, options: ['$nA_s$', '$(n-1)A_s$', "$(n-1)A'_s$", "$(2n-1)A'_s$"], answer: c.a, why: 'Uncracked: the steel replaces concrete that is already counted → (n − 1). Cracked tension steel: concrete there is ignored → n. Compression steel in a cracked WSD section: 2n for creep, minus the 1 for displaced concrete → (2n − 1).', ref: 'f-elastic' }
  },
}

const gov: PickSkill = {
  key: 'gov',
  label: 'Which stress governs',
  gen: (r) => {
    const b = pick(r, [10, 12, 14]),
      d = pick(r, [16, 18, 20, 22])
    const As = pick(r, [1.2, 1.8, 2.4, 3.16, 4, 5])
    const inp = { b, h: d + 2.5, d, As, fc: 4000 }
    const m = allowableMoment(inp, 1.8, 24)
    const nn = Math.round(modRatio(4000))
    const kb = nn / (nn + 24 / 1.8)
    const A = { c: 'Concrete reaches 0.45f′c first', s: 'Steel reaches fs first' }
    return {
      q: `Allowable moment, b = ${b} in, d = ${d} in, As = ${As} in², f′c = 4 ksi (fc = 1.8 ksi), fs = 24 ksi, n = ${nn}. Which limit governs?`,
      options: Object.values(A),
      answer: m.governs === 'concrete' ? A.c : A.s,
      why: `ρ = ${(As / (b * d)).toFixed(4)} → k = ${f(m.kd / d, 3)}; balanced k = n/(n + fs/fc) = ${f(kb, 3)}. ${m.governs === 'concrete' ? 'k > k_bal (over-reinforced in WSD terms) → concrete governs' : 'k < k_bal → steel governs'}: Mc = ${f(m.Mc, 1)}, Ms = ${f(m.Ms, 1)} k-ft.`,
      ref: 'f-wsd',
    }
  },
}

export const ELASTIC_PICKS: PickSkill[] = [crack, nQ, allow, trans, gov]
