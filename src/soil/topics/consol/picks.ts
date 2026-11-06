// Consolidation "Which one?" drill: NC / OC branch, the Tv formula, drainage path, which Δp, cv construction, time scaling.
import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { scaleTime, tvApprox } from '../../engine/consolidation'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

const branch: PickSkill = {
  key: 'branch',
  label: 'NC or OC branch?',
  gen: (r) => {
    const p0 = randInt(r, 30, 150)
    const dp = randInt(r, 10, 120)
    const kind = pick(r, ['nc', 'below', 'cross'] as const)
    const pc = kind === 'nc' ? p0 : kind === 'below' ? p0 + dp + randInt(r, 5, 80) : p0 + Math.max(1, Math.round(dp * (0.2 + 0.6 * r())))
    const opts = ['$\\frac{C_cH}{1+e_0}\\log\\frac{p_0\'+\\Delta p}{p_0\'}$', '$\\frac{C_sH}{1+e_0}\\log\\frac{p_0\'+\\Delta p}{p_0\'}$', '$\\frac{C_sH}{1+e_0}\\log\\frac{p_c\'}{p_0\'} + \\frac{C_cH}{1+e_0}\\log\\frac{p_0\'+\\Delta p}{p_c\'}$']
    const i = kind === 'nc' ? 0 : kind === 'below' ? 1 : 2
    return {
      q: `Clay at mid-depth: p0′ = ${p0} kPa, ${kind === 'nc' ? 'the clay has never carried more (pc′ = p0′)' : `pc′ = ${pc} kPa`}; the load adds Δp = ${dp} kPa. Which settlement formula?`,
      options: opts,
      answer: opts[i],
      why: kind === 'nc' ? 'pc′ = p0′ → normally consolidated: the path runs down the virgin line, **Cc** throughout.' : kind === 'below' ? `p0′ + Δp = ${p0 + dp} ≤ pc′ = ${pc}: the path stays on the flat recompression line — **Cs only**.` : `p0′ + Δp = ${p0 + dp} > pc′ = ${pc}: **Cs** from p0′ to pc′, then **Cc** from pc′ to ${p0 + dp}.`,
      ref: 'k-settle',
      ordered: true,
    }
  },
}

const tvForm: PickSkill = {
  key: 'tv',
  label: 'Which Tv formula?',
  gen: (r) => {
    const U = pick(r, [15, 22, 35, 45, 52, 58, 61, 65, 72, 80, 88, 93])
    const a = `$T_v = \\frac{\\pi}{4}(${f2(U / 100)})^2 = ${f3(tvApprox(Math.min(U, 59.999)))}$`
    const b = `$T_v = 1.781 - 0.933\\log(100-${U}) = ${f3(1.781 - 0.933 * Math.log10(100 - U))}$`
    const c = `$T_v = \\frac{\\pi}{4}(${U})^2$`
    const d = `$T_v = 1.781 - 0.933\\log(${f2(U / 100)})$`
    const ans = U < 60 ? a : b
    return {
      q: `U = ${U} %. Which expression gives Tv?`,
      options: [a, b, c, d],
      answer: ans,
      why: U < 60 ? `U below 60 %: Tv = (π/4)U² with **U as a fraction** (${f2(U / 100)}), not a percentage.` : `U ≥ 60 %: Tv = 1.781 − 0.933 log(100 − U%) with U **in percent**. (π/4)U² would give ${f3((Math.PI / 4) * (U / 100) ** 2)} — too small.`,
      ref: 'k-tvu',
    }
  },
}

const drain: PickSkill = {
  key: 'd',
  label: 'd = H or H/2?',
  gen: (r) => {
    const H = randInt(r, 2, 10)
    const cases: [string, 'H' | 'H/2', string][] = [
      ['between two sand layers', 'H/2', 'Water leaves through both faces: two-way drainage, d = H/2.'],
      ['on impervious rock with sand above', 'H', 'Only upward drainage: d = H (2017-18 Q6(a): 1.6 m clay on rock → d = 1.6 m).'],
      ['in the oedometer, porous stones top and bottom (specimen thickness H mm)', 'H/2', 'The standard test is double drained: d = half the specimen thickness.'],
      ['"drained at the top only"', 'H', 'One-way: the whole thickness is the drainage path.'],
      ['with sand below and a clay crust (impervious) above', 'H', 'Drains only downward: d = H.'],
      ['"permeable boundaries at top and bottom"', 'H/2', 'Two-way: d = H/2.'],
    ]
    const [txt, a, why] = pick(r, cases)
    const val = (x: 'H' | 'H/2') => `d = ${x === 'H' ? H : f2(H / 2)} m`
    return { q: `A ${H} m clay layer lies ${txt}. Drainage path for Tv = cv t/d²?`, options: [val('H'), val('H/2'), `d = ${2 * H} m`], answer: val(a), why, ref: 'st-consol', ordered: true }
  },
}

const dpWhich: PickSkill = {
  key: 'dp',
  label: 'Which Δp?',
  gen: (r) => {
    const opts = ['Δp = γh at every depth', '2:1 / Boussinesq, Simpson over the layer', 'Δp = qD²/(D + z)² (1H:2V spread)', 'Boussinesq point load KB Q/z²']
    const cases: [string, number, string][] = [
      ['A 4 m fill (18 kN/m³) is placed over the whole site.', 0, 'A **wide** fill loads every depth equally: Δp = 4 × 18 = 72 kPa.'],
      ['The entire site is raised by 5 m of fill.', 0, '"Large area" → Δp = γh, no decay with depth.'],
      ['A 2 m × 3 m footing (250 kN) sits on top of a 6 m clay layer.', 1, 'A small footing: Δp decays fast with depth — 2:1 (or Boussinesq) at top, middle and bottom, Simpson average (handnote: 37 mm vs 24 mm with mid-depth only).'],
      ['A rigid 6 m circular raft (270 kPa) on 5.5 m of sand over 1.6 m of clay; "load spread 1H:2V".', 2, 'The paper fixes the method: 1H:2V spread on a circle → Δp = q D²/(D + z)², z to the clay mid-depth.'],
      ['Two column footings 5 m apart, "consider the column loads as point loads".', 3, 'Point loads → Boussinesq KB, add both footings (2021-22 Q4(a)).'],
    ]
    const [q, i, why] = pick(r, cases)
    return { q: q + ' How do you get Δp in the clay?', options: opts, answer: opts[i], why, ref: 'k-settle' }
  },
}

const fit: PickSkill = {
  key: 'fit',
  label: 'cv construction',
  gen: (r) => {
    const d = pick(r, [9.5, 10, 12.7])
    const t = randInt(r, 5, 60)
    const which = pick(r, ['taylor', 'cas'] as const)
    const T = (0.848 * d * d) / t
    const C = (0.197 * d * d) / t
    const opts = [`${f3(T)} mm²/min`, `${f3(C)} mm²/min`, `${f3((0.848 * 4 * d * d) / t)} mm²/min`, `${f3((0.197 * 4 * d * d) / t)} mm²/min`]
    return {
      q: which === 'taylor' ? `√t method on a double-drained ${f2(2 * d)} mm specimen gives √t90 = ${f2(Math.sqrt(t))} √min. cv?` : `log t method on a double-drained ${f2(2 * d)} mm specimen gives t50 = ${t} min. cv?`,
      options: opts,
      answer: which === 'taylor' ? opts[0] : opts[1],
      why: which === 'taylor' ? `t90 = ${f2(Math.sqrt(t))}² = ${t} min; d = ${f2(d)} mm (half the thickness); cv = 0.848d²/t90 = ${f3(T)}.` : `cv = 0.197d²/t50 with d = ${f2(d)} mm (half of ${f2(2 * d)}) = ${f3(C)}. Using the full thickness gives 4× too much.`,
      ref: 'k-fit',
    }
  },
}

const scale: PickSkill = {
  key: 'scale',
  label: 'Time scaling',
  gen: (r) => {
    const tl = randInt(r, 60, 180)
    const Hl = pick(r, [20, 25])
    const Hf = randInt(r, 2, 8)
    const way = pick(r, ['one', 'two'] as const)
    const df = way === 'one' ? Hf * 1000 : (Hf * 1000) / 2
    const ty = scaleTime(tl, Hl / 2, df) / (60 * 24 * 365)
    const wrong1 = scaleTime(tl, Hl, df) / (60 * 24 * 365)
    const wrong2 = scaleTime(tl, Hl / 2, way === 'one' ? df / 2 : df * 2) / (60 * 24 * 365)
    const o = (v: number) => `${fmt(v, 2)} years`
    return {
      q: `A ${Hl} mm lab specimen (double drained) reached 90 % in ${tl} min. The ${Hf} m field layer drains ${way === 'one' ? 'only at the top' : 'top and bottom'}. Time for 90 % in the field?`,
      options: [o(ty), o(wrong1), o(wrong2), o(ty / 60)],
      answer: o(ty),
      why: `Same soil and U: t_f = t_lab (d_f/d_lab)² = ${tl} × (${df}/${Hl / 2})² min = ${o(ty)}. d_lab = half the specimen; d_field = ${way === 'one' ? 'H (one-way)' : 'H/2 (two-way)'}.`,
      ref: 'st-consol',
    }
  },
}

export const CONSOL_PICKS: PickSkill[] = [branch, tvForm, drain, dpWhich, fit, scale]
