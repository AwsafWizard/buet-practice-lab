// Classification "Which one?" drill skills: coarse/fine and G/S split, fines band, W/P grading, AASHTO subgroup
// and GI rule, USCS group name.
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { aashto, gradeOf, uscs } from '../../engine/classify'
import { nf } from '../../engine/phase'

const split: PickSkill = {
  key: 'split',
  label: 'Coarse or fine; G or S',
  gen: (r) => {
    const F200 = pick(r, [randInt(r, 52, 95), randInt(r, 3, 45)])
    const F4 = Math.max(F200 + 2, pick(r, [randInt(r, 40, 70), randInt(r, 75, 100)]))
    const opts = ['Fine-grained', 'Gravel (G)', 'Sand (S)']
    const gravel = 100 - F4
    const sand = F4 - F200
    const ans = F200 >= 50 ? opts[0] : gravel > sand ? opts[1] : opts[2]
    return {
      q: `${F4} % passes No. 4 and ${F200} % passes No. 200. USCS first letter?`,
      options: opts,
      ordered: true,
      answer: ans,
      why:
        F200 >= 50
          ? `${F200} % ≥ 50 % passes No. 200 → **fine-grained** (M, C, O by the plasticity chart).`
          : `Coarse fraction ${100 - F200} %: gravel = 100 − ${F4} = ${gravel} %, sand = ${F4} − ${F200} = ${sand} %. ${gravel > sand ? 'More than half the coarse fraction is retained on No. 4 → **G**.' : 'Half or more of the coarse fraction passes No. 4 → **S**.'} (Das Ex 5.6: 57.14 % of the coarse part is sand → S.)`,
      ref: 'c-uscs',
    }
  },
}

const band: PickSkill = {
  key: 'band',
  label: 'Fines band',
  gen: (r) => {
    let F = randInt(r, 1, 30)
    if (F === 5 || F === 12) F++
    const opts = ['Clean: W or P only', 'Dual symbol, e.g. SW-SM', 'With fines: M, C or C-M']
    const ans = F < 5 ? opts[0] : F <= 12 ? opts[1] : opts[2]
    return {
      q: `A sand with ${F} % passing No. 200. Which kind of USCS symbol?`,
      options: opts,
      ordered: true,
      answer: ans,
      why: `Fines < 5 %: clean (grading letter). 5–12 %: dual symbol (grading + fines letter, footnote b). > 12 %: SM / SC / SC-SM by the plasticity chart. ${F} % → **${ans}**.`,
      ref: 'c-uscs',
    }
  },
}

const grade: PickSkill = {
  key: 'grade',
  label: 'Well or poorly graded',
  gen: (r) => {
    const kind = pick(r, ['G', 'S'] as const)
    const D10 = randInt(r, 5, 30) / 100
    const Cu = pick(r, [randInt(r, 2, 3), randInt(r, 4, 5), randInt(r, 7, 30)]) + 0.1
    const Cc = pick(r, [0.4 + r() * 0.5, 1.1 + r() * 1.7, 3.3 + r() * 2])
    const D60 = D10 * Cu
    const D30 = Math.sqrt(Cc * D60 * D10)
    const g = gradeOf(Cu, Cc, kind)
    const o = [`${kind}W`, `${kind}P`]
    return {
      q: `A clean ${kind === 'G' ? 'gravel' : 'sand'}: D10 = ${nf(D10, 3)}, D30 = ${nf(D30, 3)}, D60 = ${nf(D60, 3)} mm. Symbol?`,
      options: o,
      ordered: true,
      answer: `${kind}${g.letter}`,
      why: `Cu = ${nf(Cu, 3)}, Cc = ${nf(Cc, 3)}. ${kind}W needs Cu ≥ ${kind === 'G' ? 4 : 6} **and** 1 ≤ Cc ≤ 3 → **${kind}${g.letter}**.`,
      ref: 'c-uscs',
    }
  },
}

const agroup: PickSkill = {
  key: 'agroup',
  label: 'AASHTO group / GI rule',
  gen: (r) => {
    if (r() < 0.5) {
      const F = randInt(r, 40, 95)
      const LL = randInt(r, 42, 75)
      const PI = randInt(r, 12, Math.max(14, LL - 15))
      const a = aashto({ P200: F, LL, PI })
      return {
        q: `F200 = ${F} %, LL = ${LL}, PI = ${PI}. AASHTO group?`,
        options: ['A-5', 'A-6', 'A-7-5', 'A-7-6'],
        ordered: true,
        answer: a.group,
        why: `Silt-clay (F > 35). LL ≥ 41 and PI ≥ 11 → A-7. LL − 30 = ${LL - 30}; PI ${PI} ${PI <= LL - 30 ? '≤' : '>'} LL − 30 → **${a.group}** (GI ${a.gi.gi}).`,
        ref: 'c-aashto',
      }
    }
    const g = pick(r, ['A-1-a', 'A-1-b', 'A-3', 'A-2-4', 'A-2-5', 'A-2-6', 'A-2-7', 'A-4', 'A-6', 'A-7-6'])
    const opts = ['Full eq. 5.1', 'PI term only (eq. 5.2)', 'Always 0']
    const ans = ['A-2-6', 'A-2-7'].includes(g) ? opts[1] : ['A-1-a', 'A-1-b', 'A-3', 'A-2-4', 'A-2-5'].includes(g) ? opts[2] : opts[0]
    return {
      q: `The soil is ${g}. How do you get its group index?`,
      options: opts,
      ordered: true,
      answer: ans,
      why: 'Slide 13 rules: A-1-a, A-1-b, A-2-4, A-2-5, A-3 → GI = 0; A-2-6, A-2-7 → 0.01(F − 15)(PI − 10) only; others the full (F − 35)[0.2 + 0.005(LL − 40)] + 0.01(F − 15)(PI − 10). Negative → 0, round to a whole number.',
      ref: 'c-aashto',
    }
  },
}

const name: PickSkill = {
  key: 'name',
  label: 'USCS group name',
  gen: (r) => {
    const kind = pick(r, ['sand', 'fine'] as const)
    if (kind === 'sand') {
      const F200 = randInt(r, 14, 35)
      const F4 = randInt(r, Math.max(F200 + 30, 60), 100)
      const LL = randInt(r, 25, 45)
      const PI = pick(r, [randInt(r, 1, 3), randInt(r, 12, 20)])
      const u = uscs({ F200, F4, LL, PL: LL - PI })
      if (u.symbol[0] !== 'S') return name.gen(r)
      const base = u.symbol === 'SM' ? 'Silty sand' : u.symbol === 'SC' ? 'Clayey sand' : 'Silty clayey sand'
      return {
        q: `${u.symbol}: gravel ${100 - F4} %, sand ${F4 - F200} %, fines ${F200} %. Group name (Fig. 5.4)?`,
        options: [base, `${base} with gravel`, `Gravelly ${base.toLowerCase()}`, `${base} with silt`],
        answer: u.name,
        why: `Sands split on % gravel: ${100 - F4} % ${100 - F4 >= 15 ? '≥' : '<'} 15 % → **${u.name}**.`,
        ref: 'c-uscs-names',
      }
    }
    const F200 = randInt(r, 52, 97)
    const F4 = randInt(r, F200 + 1, 100)
    const LL = randInt(r, 30, 45)
    const PI = randInt(r, 15, 22)
    const u = uscs({ F200, F4, LL, PL: LL - PI })
    const opts = ['Lean clay', 'Lean clay with sand', 'Lean clay with gravel', 'Sandy lean clay', 'Sandy lean clay with gravel', 'Gravelly lean clay', 'Gravelly lean clay with sand']
    return {
      q: `CL with ${F200} % passing No. 200, ${F4} % passing No. 4. Group name (Fig. 5.5)?`,
      options: opts.includes(u.name) ? opts : [...opts, u.name],
      answer: u.name,
      why: `Plus No. 200 = ${100 - F200} %; sand ${F4 - F200} %, gravel ${100 - F4} %. ${100 - F200 < 15 ? '< 15 % → just the base name' : 100 - F200 < 30 ? '15–29 % → "with sand" or "with gravel", whichever is more' : '≥ 30 % → "sandy" or "gravelly" prefix; add the other if it is ≥ 15 %'} → **${u.name}**.`,
      ref: 'c-uscs-names',
    }
  },
}

export const CLASS_PICKS: PickSkill[] = [split, band, grade, agroup, name]
