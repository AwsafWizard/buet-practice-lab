// Plasticity "Which one?" drill skills: consistency state, Burmister description, chart zone, which limit, stronger soil.
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { nf } from '../../engine/phase'
import { BURMISTER, burmister, chartZone, consistencyState, indices } from '../../engine/plasticity'

const state: PickSkill = {
  key: 'state',
  label: 'State of the soil',
  gen: (r) => {
    const SL = randInt(r, 10, 18)
    const PL = SL + randInt(r, 6, 14)
    const LL = PL + randInt(r, 10, 30)
    const w = pick(r, [randInt(r, 4, SL - 1), randInt(r, SL + 1, PL - 1), randInt(r, PL + 1, LL - 1), randInt(r, LL + 1, LL + 15)])
    const s = consistencyState(w, { SL, PL, LL })
    return {
      q: `SL = ${SL} %, PL = ${PL} %, LL = ${LL} %. The natural water content is ${w} %. State of the soil?`,
      options: ['solid', 'semi-solid', 'plastic', 'liquid'],
      ordered: true,
      answer: s,
      why: `Order of the limits (slide 7): solid < SL < semi-solid < PL < plastic < LL < liquid. w = ${w} % → **${s}**. LI = (w − PL)/PI = ${nf((w - PL) / (LL - PL), 2)}.`,
      ref: 'c-atterberg',
    }
  },
}

const burm: PickSkill = {
  key: 'burm',
  label: 'Burmister description',
  gen: (r) => {
    let PI = pick(r, [0, randInt(r, 1, 4), randInt(r, 6, 9), randInt(r, 11, 19), randInt(r, 21, 39), randInt(r, 41, 60)])
    if ([5, 10, 20, 40].includes(PI)) PI++
    const LL = PI + randInt(r, 15, 40)
    return {
      q: `LL = ${LL} %, PL = ${LL - PI} %. Describe the plasticity (Burmister, slide 16).`,
      options: BURMISTER.map((b) => b.label),
      ordered: true,
      answer: burmister(PI),
      why: `PI = ${LL} − ${LL - PI} = ${PI} → **${burmister(PI)}** (0 non-plastic, 1–5 slight, 5–10 low, 10–20 medium, 20–40 high, > 40 very high).`,
      ref: 'c-burmister',
    }
  },
}

const zone: PickSkill = {
  key: 'zone',
  label: 'Plasticity chart',
  gen: (r) => {
    const want = pick(r, ['CL', 'ML', 'CH', 'MH', 'CL-ML'] as const)
    let LL = 0
    let PI = 0
    for (let k = 0; k < 50; k++) {
      LL = want === 'CL-ML' ? randInt(r, 16, 27) : want[1] === 'H' ? randInt(r, 52, 90) : randInt(r, 26, 48)
      PI = want === 'CL-ML' ? randInt(r, 5, 7) : randInt(r, 2, Math.max(3, Math.round(0.9 * (LL - 8)) - 1))
      if (chartZone(LL, PI).zone === want && Math.abs(PI - 0.73 * (LL - 20)) > 1.2) break
    }
    const z = chartZone(LL, PI)
    return {
      q: `Inorganic fines with LL = ${LL}, PI = ${PI}. USCS symbol from the plasticity chart?`,
      options: ['CL', 'CL-ML', 'ML', 'CH', 'MH'],
      answer: z.zone,
      why: `A-line at LL ${LL}: 0.73(${LL} − 20) = ${nf(z.aPI, 3)}; PI = ${PI} is ${z.aboveA ? 'on/above' : 'below'} it; LL ${LL >= 50 ? '≥' : '<'} 50 → **${z.zone}**${z.zone === 'CL-ML' ? ' (4 ≤ PI ≤ 7, hatched band)' : ''}.`,
      ref: 'c-plchart',
    }
  },
}

const LIMITS = [
  { t: 'the water content at which a groove in the Casagrande cup closes over 12.7 mm at 25 blows', a: 'Liquid limit' },
  { t: 'the water content at which the 80 g, 30° cone penetrates 20 mm in 5 s', a: 'Liquid limit' },
  { t: 'the water content at which a thread rolled to 3.2 mm (⅛ in) just crumbles', a: 'Plastic limit' },
  { t: 'the water content below which the soil does not shrink any more on drying', a: 'Shrinkage limit' },
  { t: 'the range of water content over which the soil behaves plastically', a: 'Plasticity index' },
  { t: 'the slope of the w – log N line (drop per log cycle)', a: 'Flow index' },
  { t: 'the boundary between the semi-solid and the plastic state', a: 'Plastic limit' },
  { t: 'the boundary between the solid and the semi-solid state', a: 'Shrinkage limit' },
]
const which: PickSkill = {
  key: 'which',
  label: 'Which limit',
  gen: (r) => {
    const l = pick(r, LIMITS)
    return {
      q: `Name it: ${l.t}.`,
      options: ['Liquid limit', 'Plastic limit', 'Shrinkage limit', 'Plasticity index', 'Flow index'],
      answer: l.a,
      why: `**${l.a}.** LL by cup (25 blows) or BS cone (20 mm), PL by thread rolling, SL by drying a pat (ASTM D427); PI = LL − PL; flow index $I_F = (w_1 - w_2)/\\log(N_2/N_1)$.`,
      ref: 'c-atterberg',
    }
  },
}

const stronger: PickSkill = {
  key: 'stronger',
  label: 'Which is stronger',
  gen: (r) => {
    const kind = pick(r, ['w', 'it', 'if'] as const)
    if (kind === 'w') {
      const PL = randInt(r, 18, 30)
      const LL = PL + randInt(r, 20, 40)
      const w1 = randInt(r, PL + 1, PL + Math.floor((LL - PL) / 2) - 1)
      const w2 = randInt(r, w1 + 4, LL - 1)
      const o = [`w = ${w1} %`, `w = ${w2} %`, 'the same']
      return {
        q: `A high-plasticity clay (PL ${PL} %, LL ${LL} %). At which natural water content is its shear strength higher?`,
        options: o,
        ordered: true,
        answer: o[0],
        why: `Closer to the PL (LI ${nf((w1 - PL) / (LL - PL), 2)} vs ${nf((w2 - PL) / (LL - PL), 2)}) → **stronger**. Slide 18: LI ≈ 0 high strength, competent; LI ≈ 1 low strength, incompetent (strength falls about 100 times from PL to LL).`,
        ref: 'c-atterberg',
      }
    }
    const A = { LL: randInt(r, 30, 45), PL: randInt(r, 15, 22), If: randInt(r, 8, 14) }
    const B = { LL: randInt(r, 48, 65), PL: randInt(r, 18, 26), If: randInt(r, 4, 9) }
    const kA = indices({ ...A, If: A.If })
    const kB = indices({ ...B, If: B.If })
    if (kind === 'it') {
      const ans = kA.It > kB.It ? 'Soil A' : 'Soil B'
      return {
        q: `Soil A: LL ${A.LL}, PL ${A.PL}, flow index ${A.If}. Soil B: LL ${B.LL}, PL ${B.PL}, flow index ${B.If}. Which has the higher shear strength at the plastic limit?`,
        options: ['Soil A', 'Soil B'],
        ordered: true,
        answer: ans,
        why: `Toughness index $I_T = PI/I_F$: A ${nf(kA.It, 3)}, B ${nf(kB.It, 3)} → **${ans}** (2012-13 Q2(iv), 2016-17 Q5(d)). Not on the slides.`,
        ref: 'c-atterberg',
      }
    }
    const ans = A.If < B.If ? 'Soil A' : 'Soil B'
    return {
      q: `Soil A has flow index ${A.If}, soil B ${B.If}. Whose strength changes less with water content?`,
      options: ['Soil A', 'Soil B'],
      ordered: true,
      answer: ans,
      why: `The flatter flow curve (smaller $I_F$) → **${ans}**: the number of blows (a measure of shear strength) changes more slowly with w, so the soil loses strength more slowly as it gets wetter (2012-13 Q2(iii)).`,
      ref: 'c-atterberg',
    }
  },
}

export const PLAST_PICKS: PickSkill[] = [state, burm, zone, which, stronger]
