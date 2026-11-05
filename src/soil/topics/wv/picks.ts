// Weight–volume "Which one?" drill skills: basis to assume, which relation, Dr class, Dr formula, specimen volume.
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { cylinderVolume, DR_LAMBE, DR_SLIDE, drClass, drFromE, nf, PHASE_NAME, solvePhase, type PhaseKey } from '../../engine/phase'
import { GW } from '../../engine/units'

const BASIS_SETS: { keys: PhaseKey[]; vals: number[]; txt: string }[] = [
  { keys: ['g', 'w', 'Gs'], vals: [18.6, 0.14, 2.68], txt: 'γ = 18.6 kN/m³, w = 14 %, Gs = 2.68' },
  { keys: ['e', 'w', 'Gs'], vals: [0.72, 0.2, 2.7], txt: 'e = 0.72, w = 20 %, Gs = 2.70' },
  { keys: ['gd', 'w', 'S'], vals: [16.2, 0.25, 1], txt: 'γd = 16.2 kN/m³, w = 25 %, saturated' },
  { keys: ['n', 'S', 'Gs'], vals: [0.4, 0.6, 2.65], txt: 'n = 40 %, S = 60 %, Gs = 2.65' },
  { keys: ['e', 'S', 'Gs'], vals: [0.8, 0.9, 2.72], txt: 'e = 0.80, S = 90 %, Gs = 2.72' },
  { keys: ['V', 'W', 'w', 'Gs'], vals: [1.2, 23, 0.086, 2.71], txt: 'V = 1.2 m³, W = 23 kN, w = 8.6 %, Gs = 2.71' },
  { keys: ['V', 'W', 'Ws', 'Gs'], vals: [86.87, 186.5, 160, 2.65], txt: 'a 1.5 in × 3 in cylinder weighing 186.5 g wet and 160 g dry, Gs = 2.65' },
  { keys: ['gsat', 'w', 'S'], vals: [19.8, 0.3, 1], txt: 'γsat = 19.8 kN/m³ and w = 30 % for a saturated clay' },
]

const basis: PickSkill = {
  key: 'basis',
  label: 'Basis to assume',
  gen: (r) => {
    const s = pick(r, BASIS_SETS)
    const g = Object.fromEntries(s.keys.map((k, i) => [k, s.vals[i]]))
    const sol = solvePhase(g, GW)
    const opts = ['Assume V = 1', 'Assume Vs = 1', 'No assumption: a size is given']
    const ans = !sol.basis ? opts[2] : sol.basis.key === 'V' ? opts[0] : opts[1]
    return {
      q: `Phase-diagram problem with ${s.txt}. What do you assume before filling the blocks?`,
      options: opts,
      ordered: true,
      answer: ans,
      why: !sol.basis
        ? 'A total volume (or weight) is already fixed, so every block follows from it: no assumption.'
        : sol.basis.key === 'V'
          ? 'A unit weight or porosity is "per unit total volume", so take **V = 1**: then W = γ (or Ws = γd, Vv = n) straight away.'
          : 'The void ratio is "per unit volume of solids", so take **Vs = 1**: then Vv = e and Ws = Gsγw.',
      ref: 'c-phase',
    }
  },
}

const FORMULAS: { q: string; a: string; wrong: string[]; why: string }[] = [
  { q: 'A saturated soil, w and Gs known. e = ?', a: '$wG_s$', wrong: ['$w/G_s$', '$G_s/w$', '$wG_s/(1+w)$'], why: 'Vs = 1: Ws = Gsγw, Ww = wGsγw, Vw = wGs = Vv (saturated) = e. In general Se = wGs.' },
  { q: 'e known. Porosity n = ?', a: '$e/(1+e)$', wrong: ['$e/(1-e)$', '$(1+e)/e$', '$1/(1+e)$'], why: 'Vs = 1, Vv = e, V = 1 + e, so n = Vv/V = e/(1 + e). Back: e = n/(1 − n).' },
  { q: 'γ and w known. γd = ?', a: '$\\gamma/(1+w)$', wrong: ['$\\gamma(1+w)$', '$\\gamma/w$', '$\\gamma(1-w)$'], why: 'W = Ws + Ww = (1 + w)Ws, so Ws/V = (W/V)/(1 + w).' },
  { q: 'Gs and e known. γsat = ?', a: '$(G_s+e)\\gamma_w/(1+e)$', wrong: ['$G_s\\gamma_w/(1+e)$', '$(G_s+e)\\gamma_w/e$', '$(G_s-1)\\gamma_w/(1+e)$'], why: 'Vs = 1: Ws = Gsγw, voids full of water Ww = eγw, V = 1 + e.' },
  { q: "Gs and e known. Submerged unit weight γ′ = ?", a: '$(G_s-1)\\gamma_w/(1+e)$', wrong: ['$(G_s+e)\\gamma_w/(1+e)$', '$G_s\\gamma_w/(1+e)$', '$(G_s-1)\\gamma_w/e$'], why: "γ′ = γsat − γw = [(Gs + e) − (1 + e)]γw/(1 + e)." },
  { q: 'γd and Gs known. e = ?', a: '$G_s\\gamma_w/\\gamma_d - 1$', wrong: ['$\\gamma_d/(G_s\\gamma_w) - 1$', '$G_s\\gamma_w/\\gamma_d$', '$1 - \\gamma_d/(G_s\\gamma_w)$'], why: 'γd = Gsγw/(1 + e) → e = Gsγw/γd − 1. Use it for e_max from γd,min.' },
  { q: 'S, w and Gs known. γd = ?', a: '$G_s\\gamma_w/(1+wG_s/S)$', wrong: ['$G_s\\gamma_w/(1+wG_s)$', '$G_s\\gamma_w S/(1+w)$', '$G_s\\gamma_w/(1+S/(wG_s))$'], why: 'γd = Gsγw/(1 + e) with e = wGs/S (2021-22 Q1(a)). S = 1 gives the zero-air-void line.' },
  { q: 'Ws and Gs known. Vs = ?', a: '$W_s/(G_s\\gamma_w)$', wrong: ['$W_sG_s/\\gamma_w$', '$W_s/\\gamma_w$', '$G_s\\gamma_w/W_s$'], why: 'Gs = γs/γw and γs = Ws/Vs, so Vs = Ws/(Gsγw).' },
  { q: 'W (moist) and w known. Ws = ?', a: '$W/(1+w)$', wrong: ['$W(1-w)$', '$W - w$', '$wW$'], why: 'Ww = wWs and W = Ws + Ww = (1 + w)Ws — the first line of Das Ex 3.2 on the slide.' },
]
const formula: PickSkill = {
  key: 'formula',
  label: 'Which relation',
  gen: (r) => {
    const f = pick(r, FORMULAS)
    return { q: f.q, options: [f.a, ...f.wrong], answer: f.a, why: f.why + ' (Check only: on the script, show it on the block diagram.)', ref: 'c-phase' }
  },
}

const drcls: PickSkill = {
  key: 'drcls',
  label: 'Dr class',
  gen: (r) => {
    let Dr = randInt(r, 3, 97)
    while ([15, 35, 50, 65, 70, 85].includes(Dr)) Dr++
    const a = drClass(Dr)
    const b = drClass(Dr, DR_LAMBE)
    return {
      q: `A sand has a relative density of ${Dr} %. Describe it (AJK sir's slide 28 scale).`,
      options: DR_SLIDE.map((c) => c.label),
      ordered: true,
      answer: a,
      why: `Slide scale 0–15–50–70–85–100 → **${a}**${a !== b ? `. On the 15/35/65/85 scale (QBank, Lambe) it would be ${b.toLowerCase()} — name the scale you use.` : '.'}${Dr > 70 ? ' Above 70 %: "good for EQ".' : ''}`,
      ref: 'c-dr',
    }
  },
}

const drcalc: PickSkill = {
  key: 'drcalc',
  label: 'Dr from e',
  gen: (r) => {
    const emin = randInt(r, 40, 55) / 100
    const emax = emin + randInt(r, 30, 45) / 100
    const e = Math.round((emin + (emax - emin) * (0.15 + 0.7 * r())) * 100) / 100
    const ans = drFromE(e, emax, emin) * 100
    const L = (x: number) => `${nf(x, 3)} %`
    return {
      q: `e_max = ${emax.toFixed(2)}, e_min = ${emin.toFixed(2)}, in-situ e = ${e.toFixed(2)}. Dr = ?`,
      options: [L(ans), L(((e - emin) / (emax - emin)) * 100), L(((emax - e) / emax) * 100), L(((emax - e) / (emax + emin)) * 100)],
      answer: L(ans),
      why: `Dr = (e_max − e)/(e_max − e_min) = (${emax.toFixed(2)} − ${e.toFixed(2)})/(${(emax - emin).toFixed(2)}) = **${nf(ans, 3)} %**. Using (e − e_min) gives the "looseness", 100 − Dr.`,
      ref: 'c-dr',
    }
  },
}

const cyl: PickSkill = {
  key: 'cyl',
  label: 'Specimen volume',
  gen: (r) => {
    const D = pick(r, [1.4, 1.5, 2.0, 2.8])
    const H = 2 * D
    const V = cylinderVolume(D, H)
    const L = (x: number) => `${nf(x, 4)} cm³`
    const wrongIn = (Math.PI / 4) * D * D * H
    return {
      q: `A UCS specimen is ${D} in in diameter and ${H} in high. Its volume in cm³ = ?`,
      options: [L(V), L(wrongIn), L(Math.PI * (D * 2.54) ** 2 * H * 2.54), L(wrongIn * 2.54)],
      answer: L(V),
      why: `V = (π/4)(${D} × 2.54)²(${H} × 2.54) = **${nf(V, 4)} cm³**. 1 in³ = 16.39 cm³ — convert both D and H. With masses in g and ρw = 1 g/cc, the unit weights come out in g/cc (2023-24 Q1(a)).`,
      ref: 'c-phase',
    }
  },
}

export const WV_PICKS: PickSkill[] = [basis, formula, drcls, drcalc, cyl]
void PHASE_NAME
