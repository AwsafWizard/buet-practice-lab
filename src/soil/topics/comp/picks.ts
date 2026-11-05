// Compaction "Which one?" drill: spec verdicts, which unit weight to use, rollers, energy / ZAV effects, γzav.

import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { checkSpec, zav } from '../../engine/compaction'

const f2 = (v: number) => fmt(v, 2)

const spec: PickSkill = {
  key: 'spec',
  label: 'Spec verdict',
  gen: (r) => {
    const mdd = randInt(r, 165, 195) / 10
    const omc = randInt(r, 10, 20) / 100
    const rcMin = pick(r, [0.9, 0.95])
    const dw = pick(r, [0.015, 0.02])
    const want = pick(r, ['pass', 'rc', 'dry', 'wet', 'both'])
    const gd = Math.round(mdd * (want === 'rc' || want === 'both' ? rcMin - 0.01 - 0.04 * r() : rcMin + 0.005 + 0.05 * r()) * 100) / 100
    const w = Math.round((want === 'dry' || want === 'both' ? omc - dw - 0.005 - 0.02 * r() : want === 'wet' ? omc + dw + 0.005 + 0.02 * r() : omc + (r() - 0.5) * 1.6 * dw) * 1000) / 1000
    const c = checkSpec(gd, w, { mdd, omc, rcMin, dw })
    const ans = c.pass ? 'Passes' : !c.okRC && !c.okW ? 'Fails on density and water content' : !c.okRC ? 'Fails: not dense enough' : w < c.lo ? 'Fails: too dry' : 'Fails: too wet'
    return {
      q: `Spec: RC ≥ ${rcMin * 100} % and w = OMC ± ${dw * 100} %. Lab: MDD = ${mdd} kN/m³, OMC = ${f2(omc * 100)} %. Field: γd = ${gd} kN/m³, w = ${f2(w * 100)} %.`,
      options: ['Passes', 'Fails: not dense enough', 'Fails: too dry', 'Fails: too wet', 'Fails on density and water content'],
      ordered: true,
      answer: ans,
      why: `RC = ${gd}/${mdd} = ${f2(c.rc * 100)} % (need ${rcMin * 100} %); window ${f2(c.lo * 100)}–${f2(c.hi * 100)} %.`,
      ref: 'w-field',
    }
  },
}

const which: PickSkill = {
  key: 'which',
  label: 'Which unit weight?',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Volume to dig from the borrow pit for a known fill', a: '$W_s/\\gamma_{d,pit}$', w: 'Solids are conserved: Ws from the fill, divided by the pit’s **dry** unit weight.' },
      { t: 'Solids needed for a compacted fill of volume V', a: '$\\gamma_{d,fill}V$', w: 'Ws = γd,fill × V, with γd,fill = γ/(1+w), RC × MDD or Gsγw/(1+e).' },
      { t: 'Loose volume carried in the trucks', a: '$W_s/\\gamma_{d,loose}$', w: 'Same solids at the loose dry unit weight (or pit volume × (1 + bulking)).' },
      { t: 'Water to add to reach the placement water content', a: '$(w_{fill} - w_{pit})W_s$', w: 'Water is a fraction of the solids weight; divide by γw for its volume.' },
      { t: 'Water to fully saturate the pit soil (volume constant)', a: '$(e/G_s - w)W_s$', w: 'At S = 1, w_sat = e/Gs.' },
    ])
    return {
      q: `${c.t}?`,
      options: ['$W_s/\\gamma_{d,pit}$', '$\\gamma_{d,fill}V$', '$W_s/\\gamma_{d,loose}$', '$(w_{fill} - w_{pit})W_s$', '$(e/G_s - w)W_s$', '$W_s/\\gamma_{pit}$ (bulk)'],
      answer: c.a,
      why: c.w,
      ref: 'w-field',
    }
  },
}

const roller: PickSkill = {
  key: 'roller',
  label: 'Roller for the soil',
  gen: (r) => {
    const c = pick(r, [
      { t: 'A plastic clay embankment core', a: 'Sheepsfoot roller' },
      { t: 'A clean sand fill in thick lifts', a: 'Vibratory roller' },
      { t: 'Proof rolling a finished sub-grade', a: 'Smooth steel-drum roller' },
      { t: 'Granular backfill in a narrow trench beside a wall', a: 'Vibratory plate compactor' },
      { t: 'A mixed sandy-clayey fill and asphalt layers (kneading wanted)', a: 'Pneumatic rubber-tyred roller' },
      { t: 'A deep loose sand deposit (several metres)', a: 'Vibroflot' },
    ])
    return {
      q: `${c.t}: which compactor?`,
      options: ['Sheepsfoot roller', 'Vibratory roller', 'Smooth steel-drum roller', 'Vibratory plate compactor', 'Pneumatic rubber-tyred roller', 'Vibroflot'],
      answer: c.a,
      why: 'Clays need high pressure and kneading (sheepsfoot, compacting from the bottom of the lift up); granular soils need vibration; smooth drums finish and proof-roll thin lifts; pneumatic tyres knead mixed soils; vibroflots reach deep sands.',
      ref: 'w-rollers',
    }
  },
}

const effect: PickSkill = {
  key: 'effect',
  label: 'What happens to the curve?',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Compactive energy is raised from Standard to Modified Proctor', a: 'MDD up, OMC down' },
      { t: 'A well-graded sand replaces a poorly graded one (same energy)', a: 'MDD up, sharper peak' },
      { t: 'A fat clay (LL 80) replaces a sandy clay (same energy)', a: 'MDD down, OMC up' },
      { t: 'A test point plots above the zero-air-void line', a: 'A mistake in Gs, w or γ' },
      { t: 'Water is added beyond OMC at the same energy', a: 'γd falls, curve runs parallel to ZAV' },
    ])
    return {
      q: `${c.t}. What do you expect?`,
      options: ['MDD up, OMC down', 'MDD up, sharper peak', 'MDD down, OMC up', 'A mistake in Gs, w or γ', 'γd falls, curve runs parallel to ZAV', 'MDD down, OMC down'],
      answer: c.a,
      why: 'More energy pushes the peak up and left along the line of optimums; coarse well-graded soils give high, sharp peaks at low OMC, plastic clays low, flat peaks at high OMC; nothing can lie above S = 100 %; beyond OMC the water takes up room the solids could use.',
      ref: 'w-proctor',
    }
  },
}

const zavSkill: PickSkill = {
  key: 'zav',
  label: 'γzav',
  gen: (r) => {
    const Gs = randInt(r, 264, 275) / 100
    const w = randInt(r, 8, 25) / 100
    const ans = zav(w, Gs)
    const L = (v: number) => `${f2(v)} kN/m³`
    return {
      q: `$G_s = ${Gs}$, $w = ${f2(w * 100)}$ %. Dry unit weight on the zero-air-void line?`,
      options: [L(ans), L((Gs * 9.81) / (1 + w)), L(9.81 * (Gs + w * Gs) / (1 + w * Gs)), L((Gs * 9.81) / (1 + Gs) * (1 + w))],
      answer: L(ans),
      why: `$\\gamma_{zav} = G_s\\gamma_w/(1 + wG_s) = ${Gs} \\times 9.81/(1 + ${f2(w * Gs)}) = ${f2(ans)}$ kN/m³ (S = 1 in γd = Gsγw/(1 + wGs/S)).`,
      ref: 'w-proctor',
    }
  },
}

export const COMP_PICKS: PickSkill[] = [spec, which, roller, effect, zavSkill]
