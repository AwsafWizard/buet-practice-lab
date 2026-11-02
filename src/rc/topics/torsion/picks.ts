// Torsion "Which one?" drill: Tth form, flange overhang, neglect / design decision.

import { fmt } from '../../../components/DiagramView'
import { pick } from '../../../labs/common'
import { choices, type PickSkill } from '../../components/PickDrill'
import { threshold, torsionCheck, torsionSection, type TorShape, type TthCase } from '../../engine/torsion'

const f = (v: number, d = 2) => fmt(v, d)

const TTH: Record<Exclude<TthCase, 'prestressed'>, string> = {
  solid: "$\\lambda\\sqrt{f'_c}\\,A_{cp}^2/p_{cp}$",
  'solid-axial': "$\\lambda\\sqrt{f'_c}\\frac{A_{cp}^2}{p_{cp}}\\sqrt{1 + \\frac{N_u}{4A_g\\lambda\\sqrt{f'_c}}}$",
  hollow: "$\\lambda\\sqrt{f'_c}\\,A_g^2/p_{cp}$",
  'hollow-axial': "$\\lambda\\sqrt{f'_c}\\frac{A_g^2}{p_{cp}}\\sqrt{1 + \\frac{N_u}{4A_g\\lambda\\sqrt{f'_c}}}$",
}

const tth: PickSkill = {
  key: 'tth',
  label: 'Which Tth',
  gen: (r) => {
    const shape = pick(r, ['rect', 'L', 'T', 'box'] as TorShape[])
    const Nu = pick(r, [0, 0, 60, -40])
    const sec = torsionSection({ shape, bw: 14, h: 24, hf: 5, tw: 5 })
    const th = threshold(sec, { fc: 4000, Nu })
    const c = th.case as keyof typeof TTH
    const what = { rect: 'Solid rectangular beam', L: 'Spandrel L-beam (solid)', T: 'Interior T-beam (solid)', invL: '', invT: '', box: 'Hollow box girder' }[shape]
    return {
      q: `${what}${Nu > 0 ? `, factored axial compression Nu = ${Nu} k` : Nu < 0 ? `, factored axial tension Nu = ${-Nu} k` : ', no axial load'}. Threshold torsion Tth = ?`,
      options: Object.values(TTH),
      answer: TTH[c],
      why: `${sec.hollow ? 'Hollow → use Ag (concrete area) in the numerator, pcp still the outside perimeter' : 'Solid → Acp²/pcp'}${Nu ? `; axial load → the √(1 + Nu/4Agλ√f′c) factor (Nu negative in tension, so it shrinks)` : ''}. Neglect torsion if Tu ≤ φTth, φ = 0.75.`,
      ref: 's-tth',
    }
  },
}

const oh: PickSkill = {
  key: 'oh',
  label: 'Flange overhang',
  gen: (r) => {
    const hf = pick(r, [4, 5, 6])
    const h = pick(r, [16, 20, 24, 28, 32])
    const avail = pick(r, [12, 18, 30, 60])
    const shape = pick(r, ['L', 'T'] as TorShape[])
    const s = torsionSection({ shape, bw: 12, h, hf, overhang: avail })
    const L = (x: number) => `${f(x)} in`
    return {
      q: `${shape === 'L' ? 'Spandrel L-beam' : 'T-beam'}: total depth h = ${h} in, slab hf = ${hf} in, slab extends ${avail} in beyond the web face. Overhang counted in Acp (per side) = ?`,
      options: choices(r, L(s.ohEff), [L(s.hw), L(4 * hf), L(avail), L(8 * hf), L(6 * hf)]),
      answer: L(s.ohEff),
      why: `Overhang = min(hw, 4hf, available) with hw = h − hf = ${f(s.hw)} in, 4hf = ${4 * hf} in → **${f(s.ohEff)} in**. Then use the flanges only if they increase Acp²/pcp (${f(s.withFlange.ratio, 0)} vs web alone ${f(s.web.ratio, 0)} in³ → ${s.useFlange ? 'use flanges' : 'web alone'}).`,
      ref: 's-tth',
    }
  },
}

const neglect: PickSkill = {
  key: 'neglect',
  label: 'Neglect or design?',
  gen: (r) => {
    const sec = torsionSection({ shape: 'rect', bw: pick(r, [12, 14, 16]), h: pick(r, [20, 24, 28]) })
    const th = threshold(sec, { fc: pick(r, [3000, 4000, 5000]) })
    const kind = pick(r, ['equilibrium', 'compatibility'] as const)
    const mult = pick(r, [0.6, 0.9, 1.6, 3, 6])
    const Tu = Math.round(th.phiTth * mult * 10) / 10
    const c = torsionCheck(Tu, th, kind)
    const A = { n: 'Neglect torsion', full: 'Design for the full Tu', red: 'May design for φTcr (reduced)' }
    const ans = c.neglect ? A.n : c.reduced ? A.red : A.full
    return {
      q: `${kind === 'equilibrium' ? 'Equilibrium torsion (cantilevered canopy: the torque is needed for equilibrium)' : 'Compatibility torsion (spandrel twisted by a continuous slab)'}. φTth = ${f(th.phiTth)} ft-k, φTcr = ${f(th.phiTcr)} ft-k, Tu = ${f(Tu)} ft-k. Decision?`,
      options: [A.n, A.full, A.red],
      answer: ans,
      why: c.neglect
        ? `Tu ≤ φTth → torsion may be neglected, whatever the type.`
        : kind === 'equilibrium'
          ? 'Equilibrium torsion cannot be redistributed → design for the full Tu.'
          : c.reduced
            ? 'Compatibility torsion above φTcr: the member cracks and the torque redistributes, so Tu may be reduced to φTcr (ACI 22.7.3.2, beyond the slides).'
            : 'Compatibility torsion but Tu < φTcr → no reduction; design for Tu.',
      ref: 's-tth',
    }
  },
}

export const TORSION_PICKS: PickSkill[] = [tth, oh, neglect]
