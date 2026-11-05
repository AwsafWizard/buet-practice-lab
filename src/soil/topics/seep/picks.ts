// Seepage "Which one?" drill: boundary types in a flow net, σ′ with seepage, which safety check, icr, excavation heave.

import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { excavationHeave, gsubFromGsE, icrFromGsE } from '../../engine/stresses'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

const bound: PickSkill = {
  key: 'bound',
  label: 'Flow line or equipotential?',
  gen: (r) => {
    const c = pick(r, [
      { t: 'The base of a concrete dam resting on the permeable layer', a: 'Flow line', w: 'Water cannot cross the concrete, so it flows along the base: the base is the first flow line.' },
      { t: 'The impermeable stratum under the permeable layer', a: 'Flow line', w: 'No flow crosses it, so the bottom boundary is the last flow line.' },
      { t: 'Both faces of a sheet pile', a: 'Flow line', w: 'The pile is impermeable: water runs down one face, round the tip and up the other. The pile is the first flow line.' },
      { t: 'The submerged ground surface upstream of a sheet pile', a: 'Equipotential', w: 'Every point of the bed under the reservoir has the same total head (the upstream water level): an equipotential, h = H.' },
      { t: 'The downstream bed under the tail water', a: 'Equipotential', w: 'Total head = tail-water level everywhere on it: the last equipotential (h = 0 above tail water).' },
      { t: 'The water table at the surface of the retained soil behind a wall (2023-24 Q8(a))', a: 'Equipotential', w: 'The class treats it as fixed head (the top of the water table), where the flow lines start at right angles.' },
      { t: 'The vertical upstream face of a dam embedded below the upstream bed', a: 'Flow line', w: 'Concrete again: no flow through it.' },
      { t: 'The top flow line through an earth dam', a: 'Neither (phreatic line, unconfined flow)', w: 'Its position is not known in advance (u = 0 on it): unconfined flow, not in this course (CE 447).' },
    ])
    return {
      q: `${c.t}. In the flow net, this boundary is …`,
      options: ['Flow line', 'Equipotential', 'Neither (phreatic line, unconfined flow)'],
      ordered: true,
      answer: c.a,
      why: `${c.w} Rule: impermeable boundaries are flow lines; submerged permeable surfaces are equipotentials.`,
      ref: 'w-flownet',
    }
  },
}

const eff: PickSkill = {
  key: 'eff',
  label: 'σ′ with seepage',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Soil below a pond, water percolating down into it', a: "$z\\gamma' + iz\\gamma_w$" },
      { t: 'Downstream of a sheet pile, water rising to the bed', a: "$z\\gamma' - iz\\gamma_w$" },
      { t: 'Saturated sand under 6 m of still sea water', a: "$z\\gamma'$" },
      { t: 'Clay above an artesian sand, water rising through the clay', a: "$z\\gamma' - iz\\gamma_w$" },
      { t: 'Soil above an aquifer being pumped (water drawn down through it)', a: "$z\\gamma' + iz\\gamma_w$" },
      { t: 'Upstream side of a sheet pile, water moving down towards the tip', a: "$z\\gamma' + iz\\gamma_w$" },
    ])
    return {
      q: `${c.t}. Effective vertical stress at depth z in the soil?`,
      options: ["$z\\gamma'$", "$z\\gamma' - iz\\gamma_w$", "$z\\gamma' + iz\\gamma_w$", '$z\\gamma_{sat}$'],
      answer: c.a,
      why: 'Seepage pressure $iz\\gamma_w$ acts along the flow: downward flow presses the grains together (σ′ up), upward flow lifts them (σ′ down). Still water of any depth leaves σ′ = zγ′.',
      ref: 'w-eff',
    }
  },
}

const check: PickSkill = {
  key: 'check',
  label: 'Which safety check?',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Sheet pile wall: will the soil beside the pile on the downstream side be lifted?', a: "Terzaghi prism: $FS = D\\gamma'/(h_a\\gamma_w)$", w: 'Heave of the D × D/2 prism beside the pile, with h_a the average head left at the tip level.' },
      { t: 'Weir floor: will grains wash out where the water comes up at the toe?', a: 'Harza: $FS = i_{cr}/i_e$', w: 'Piping starts at the exit: compare the exit gradient Δh/l of the last field with icr.' },
      { t: 'Concrete apron: is it heavy enough not to float?', a: 'Uplift: $FS = W/U$', w: 'Integrate u = (pressure head)γw along the base to get U, compare with the weight.' },
      { t: 'A filter blanket is placed over boiling ground beside a cofferdam', a: "$FS = (W' + W_f)/U$", w: 'The filter adds weight but no seepage force (negligible head loss in it).' },
      { t: 'Excavation in clay over a sand under artesian head', a: "$FS = (H_c - d)\\gamma_{sat}/(h_p\\gamma_w)$", w: 'The clay plug must outweigh the water pressure in the sand below it.' },
    ])
    return {
      q: c.t,
      options: ["Terzaghi prism: $FS = D\\gamma'/(h_a\\gamma_w)$", 'Harza: $FS = i_{cr}/i_e$', 'Uplift: $FS = W/U$', "$FS = (W' + W_f)/U$", "$FS = (H_c - d)\\gamma_{sat}/(h_p\\gamma_w)$"],
      answer: c.a,
      why: c.w,
      ref: c.a.startsWith('$FS = (H') ? 'w-eff' : 'w-flownet',
    }
  },
}

const icr: PickSkill = {
  key: 'icr',
  label: 'Critical gradient',
  gen: (r) => {
    const Gs = randInt(r, 260, 275) / 100
    const e = randInt(r, 45, 100) / 100
    const ic = icrFromGsE(Gs, e)
    const L = (v: number) => f3(v)
    const asked = r() < 0.5
    if (asked) {
      return {
        q: `Sand with $G_s = ${Gs}$, $e = ${e}$. Critical hydraulic gradient?`,
        options: [L(ic), L((Gs - 1) / e), L(Gs / (1 + e)), L((Gs + e) / (1 + e))],
        answer: L(ic),
        why: `$i_{cr} = \\gamma'/\\gamma_w = (G_s - 1)/(1 + e) = ${f2(Gs - 1)}/${f2(1 + e)} = ${f3(ic)}$.`,
        ref: 'w-eff',
      }
    }
    const L1 = randInt(r, 4, 20) / 10
    const h = Math.round(ic * L1 * (0.6 + 0.8 * r()) * 100) / 100
    const quick = h / L1 >= ic
    return {
      q: `Upward flow through ${L1} m of sand ($G_s = ${Gs}$, $e = ${e}$) under a head difference of ${h} m. Quick condition?`,
      options: ['Yes, it boils', 'No'],
      ordered: true,
      answer: quick ? 'Yes, it boils' : 'No',
      why: `$i = ${h}/${L1} = ${f3(h / L1)}$ vs $i_{cr} = ${f3(ic)}$ → ${quick ? 'i ≥ icr, σ′ = 0' : 'i < icr'} (FS = ${f2(ic / (h / L1))}). γ′ = ${f2(gsubFromGsE(Gs, e))} kN/m³.`,
      ref: 'w-eff',
    }
  },
}

const pit: PickSkill = {
  key: 'pit',
  label: 'Excavation heave',
  gen: (r) => {
    const Hc = randInt(r, 6, 15)
    const g = randInt(r, 165, 200) / 10
    const d = Math.round(Hc * (0.2 + 0.6 * r()) * 2) / 2
    const res = excavationHeave({ Hc, gSat: g, wt: 0 }, d)
    const ans = res.FS >= 1.2 ? 'Safe (FS ≥ 1.2)' : res.FS >= 1 ? 'Just stands (1 ≤ FS < 1.2)' : 'Base heaves (FS < 1)'
    return {
      q: `Clay ${Hc} m thick (γsat = ${g} kN/m³) over sand, WT at GL; a pit is dug to ${d} m and pumped dry. Verdict?`,
      options: ['Safe (FS ≥ 1.2)', 'Just stands (1 ≤ FS < 1.2)', 'Base heaves (FS < 1)'],
      ordered: true,
      answer: ans,
      why: `Plug $(${Hc} - ${d}) \\times ${g} = ${f2(res.W)}$ kPa vs uplift $${Hc} \\times 9.81 = ${f2(res.u)}$ kPa → FS = ${f3(res.FS)}; the deepest pit is ${f2(res.dMax)} m.`,
      ref: 'w-eff',
    }
  },
}

export const SEEP_PICKS: PickSkill[] = [bound, eff, check, icr, pit]
