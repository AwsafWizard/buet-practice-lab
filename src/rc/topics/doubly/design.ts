// Doubly reinforced design problems, as the papers ask them: b × h fixed (architecture), two layers of tension
// steel (d = h − 4, dt = h − 2.5, d′ = 2.5 — the 12 × 25 / d = 21 / dt = 22.5 family), Mu given or from loads,
// singly capacity exceeded → compression steel, f′s from the strain. Numbers from engine/doubly (ksi!) and
// engine/singly.beamLoads.

import { designDoubly, ES_KSI, singlyMax } from '../../engine/doubly'
import { f, type SolStep } from '../../engine/elastic'
import { BARS, GAMMA_RC } from '../../engine/materials'
import { beamLoads, SUPPORT_LABEL, type Support } from '../../engine/singly'
import { pick, randInt, randStep, retry, rng, stepper, type DProblem, type Diff, type SolSec } from '../singly/designCore'

export type DFamily = 'mu' | 'loads' | 'cant'
export const D_FAMILIES: { v: DFamily; label: string }[] = [
  { v: 'mu', label: 'b × h limited, Mu given' },
  { v: 'loads', label: 'Beam with service loads' },
  { v: 'cant', label: 'Cantilever / support moment' },
]

const SECTIONS: [number, number][] = [
  [12, 25],
  [12, 24],
  [16, 30],
  [14, 26],
  [12, 22],
  [10, 22],
  [14, 28],
]

function matOf(r: () => number, diff: Diff) {
  if (diff === 'easy') return { fc: 4, fy: 60 }
  if (diff === 'hard') return { fc: pick(r, [3, 4, 5]), fy: pick(r, [60, 72.5, 72.5]) }
  return { fc: pick(r, [3, 3.5, 4, 5]), fy: pick(r, [50, 60, 60]) }
}

/** the design of a fixed section for Mu, with the checks (shared by all families) */
function designPart(S: ReturnType<typeof stepper>, b: number, h: number, fc: number, fy: number, Mu: number) {
  const d = h - 4,
    dt = h - 2.5,
    dp = 2.5
  const des = designDoubly({ b, d, dt, dp, fc, fy, Mu })
  const sm = des.sm
  S.group('Largest singly reinforced section (ρ₀.₀₀₅)')
  S.num('rho005', 'ρ_0.005', sm.rho005, '', { digits: 5 })
  S.num('as1', 'A_s1 = ρ_0.005 b d', sm.As1, 'in²')
  S.num('c', 'c (singly part)', sm.c, 'in')
  S.num('pmn1', 'φM_n1', sm.phiMn1, 'k-ft')
  S.choice('need', 'Compression steel needed?', [{ v: 'y', label: 'Yes' }, { v: 'n', label: 'No' }], des.needed ? 'y' : 'n')
  S.group('Compression steel')
  S.num('pmn2', 'φM_n2 = M_u − φM_n1', des.phiMn2, 'k-ft')
  S.num('esp', "ε′_s at c", des.epsSp, '', { digits: 5 })
  S.choice('yield', 'Does A′s yield?', [{ v: 'y', label: 'Yes (f′s = fy)' }, { v: 'n', label: 'No (f′s = Es ε′s)' }], des.compYields ? 'y' : 'n')
  S.num('fsp', 'f′_s', des.fsp, 'ksi')
  S.num('asp', 'A′_s required', des.Asp, 'in²')
  S.num('as', 'A_s = A_s1 + A′_s f′_s / f_y', des.As, 'in²')
  S.group('Bars and review')
  S.num('nt', `number of #${des.tension.no} tension bars`, des.tension.n)
  S.num('nc', `number of #${des.comp!.no} compression bars`, des.comp!.n)
  S.num('cr', 'c (provided section)', des.review.c, 'in')
  S.num('et', 'ε_t (at d_t)', des.review.epsT, '', { digits: 5 })
  S.num('pmn', 'φM_n (provided)', des.review.phiMn, 'k-ft')
  const sm2 = sm
  const steps1: SolStep[] = [
    { t: 'Depths', tex: `d = h - 4 = ${f(d)}\\text{ in (two layers)},\\ d_t = h - 2.5 = ${f(dt)}\\text{ in},\\ d' = ${dp}\\text{ in}` },
    { t: 'ρ₀.₀₀₅ and A_s1', tex: `\\rho_{0.005} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.008} = ${f(sm2.rho005, 5)},\\quad A_{s1} = ${f(sm2.rho005, 5)}(${f(b)})(${f(d)}) = ${f(sm2.As1)}\\text{ in}^2`, v: sm2.As1, u: 'in²' },
    { t: 'Stress block', tex: `a = \\frac{A_{s1}f_y}{0.85f'_cb} = \\frac{${f(sm2.As1)}(${f(fy)})}{0.85(${f(fc)})(${f(b)})} = ${f(sm2.a)}\\text{ in},\\quad c = ${f(sm2.c)}\\text{ in},\\ \\varepsilon_t = ${f(sm2.epsT, 5)},\\ \\phi = ${f(sm2.phi)}`, v: sm2.c, u: 'in' },
    { t: 'Singly capacity', tex: `\\phi M_{n1} = ${f(sm2.phi)}\\,A_{s1}f_y\\left(d - \\frac a2\\right) = ${f(sm2.phi)}(${f(sm2.As1)})(${f(fy)})(${f(d)} - ${f(sm2.a / 2)})/12 = ${f(sm2.phiMn1, 1)}\\text{ k-ft}`, v: sm2.phiMn1, u: 'k-ft', md: `$M_u = ${f(Mu, 1)}$ k-ft $>$ ${f(sm2.phiMn1, 1)} k-ft → **compression steel is required**.` },
  ]
  const steps2: SolStep[] = [
    { t: 'Moment for the steel couple', tex: `\\phi M_{n2} = ${f(Mu, 1)} - ${f(sm2.phiMn1, 1)} = ${f(des.phiMn2, 1)}\\text{ k-ft},\\quad M_{n2} = \\frac{${f(des.phiMn2, 1)}\\times12}{0.9} = ${f(des.Mn2, 0)}\\text{ in-k}`, v: des.phiMn2, u: 'k-ft' },
    { t: 'Stress in A′s (strain at c)', tex: `\\varepsilon'_s = 0.003\\frac{c - d'}{c} = 0.003\\frac{${f(sm2.c)} - ${dp}}{${f(sm2.c)}} = ${f(des.epsSp, 5)}\\ ${des.compYields ? '\\ge' : '<'}\\ \\varepsilon_y = ${f(fy / ES_KSI, 5)}\\ \\Rightarrow\\ f'_s = ${f(des.fsp, 2)}\\text{ ksi}`, v: des.fsp, u: 'ksi' },
    { t: 'Compression steel', tex: `A'_s = \\frac{M_{n2}}{f'_s(d - d')} = \\frac{${f(des.Mn2, 0)}}{${f(des.fsp, 2)}(${f(d)} - ${dp})} = ${f(des.Asp)}\\text{ in}^2`, v: des.Asp, u: 'in²' },
    { t: 'Tension steel', tex: `A_s = A_{s1} + \\frac{A'_sf'_s}{f_y} = ${f(sm2.As1)} + ${f(des.As2)} = ${f(des.As)}\\text{ in}^2`, v: des.As, u: 'in²' },
  ]
  const t = des.tension,
    c = des.comp!
  const rv = des.review
  const steps3: SolStep[] = [
    { t: 'Bars', tex: `\\text{Tension: } ${t.n}\\ \\#${t.no} = ${f(t.A, 2)}\\text{ in}^2\\ (${t.layers}\\text{ layer${t.layers > 1 ? 's' : ''}}),\\quad \\text{compression: } ${c.n}\\ \\#${c.no} = ${f(c.A, 2)}\\text{ in}^2`, md: des.bumped ? `${c.n - des.bumped} #${c.no} first; the review (displaced concrete, φ from εt) fell short, so ${des.bumped} bar${des.bumped > 1 ? 's were' : ' was'} added.` : undefined },
    {
      t: 'Review the provided section',
      tex: `c = ${f(rv.c)}\\text{ in},\\ f'_s = ${f(rv.fsp, 2)}\\text{ ksi}${rv.compYields ? '\\ (\\text{yields})' : ''},\\ \\varepsilon_t = 0.003\\frac{${f(dt)} - ${f(rv.c)}}{${f(rv.c)}} = ${f(rv.epsT, 5)},\\ \\phi = ${f(rv.phi)}`,
      v: rv.epsT,
      md: rv.dispUsed ? 'A′s has not yielded: the displaced concrete $0.85f\'_cA\'_s$ is subtracted (class handnotes).' : undefined,
    },
    { t: 'Capacity', tex: `\\phi M_n = ${f(rv.phi)}\\times${f(rv.MnFt, 1)} = ${f(rv.phiMn, 1)}\\text{ k-ft}\\ \\ge\\ M_u = ${f(Mu, 1)}\\ \\checkmark,\\quad \\varepsilon_t ${rv.epsT >= 0.004 ? '\\ge' : '<'} 0.004`, v: rv.phiMn, u: 'k-ft' },
  ]
  const sol: SolSec[] = [
    { title: 'Singly reinforced capacity', steps: steps1 },
    { title: 'Compression steel', steps: steps2 },
    { title: 'Bars and review', steps: steps3 },
  ]
  const rows = [
    { d: dp, n: c.n, db: BARS[c.no].d },
    ...(t.layers > 1
      ? [
          { d: dt, n: Math.ceil(t.n / 2), db: BARS[t.no].d },
          { d: dt - 1 - BARS[t.no].d, n: t.n - Math.ceil(t.n / 2), db: BARS[t.no].d },
        ]
      : [{ d: dt, n: t.n, db: BARS[t.no].d }]),
  ]
  return { des, d, dt, dp, sol, rows }
}

const okDes = (des: ReturnType<typeof designDoubly>, diff: Diff) => des.needed && des.ok && des.tension.layers <= 2 && des.tension.n <= 8 && !!des.comp && des.comp.n <= 5 && (diff === 'hard' ? !des.compYields : diff === 'easy' ? des.compYields : true)

function muFam(r: () => number, diff: Diff): DProblem<DFamily> {
  const draw = (r: () => number) => {
    const [b, h] = pick(r, SECTIONS)
    const { fc, fy } = matOf(r, diff)
    const sm = singlyMax(b, h - 4, h - 2.5, fc, fy)
    const Mu = Math.round((sm.phiMn1 * (1.2 + 0.5 * r())) / 5) * 5
    const des = designDoubly({ b, d: h - 4, dt: h - 2.5, dp: 2.5, fc, fy, Mu })
    return { b, h, fc, fy, Mu, des }
  }
  const t0 = retry(r, draw, (t) => okDes(t.des, diff))
  const { b, h, fc, fy, Mu } = t0
  const S = stepper()
  const P = designPart(S, b, h, fc, fy, Mu)
  return {
    family: 'mu',
    title: 'Doubly design — b × h limited',
    text: `A rectangular beam is limited to **b = ${b} in, h = ${h} in** and must carry a factored moment **M_u = ${Mu} k-ft**. Tension steel in two layers: $d = ${f(P.d)}$ in, $d_t = ${f(P.dt)}$ in; $d' = 2.5$ in if compression steel is required. $f'_c = ${f(fc)}$ ksi, $f_y = ${f(fy)}$ ksi. Find the required reinforcement (use $\\rho_{0.005}$ for the singly part, f′s from the strain) and select bars.`,
    section: { b, h, tag: `d = ${f(P.d)}, dt = ${f(P.dt)}` },
    final: { b, h, rows: P.rows, tag: `${P.des.tension.n} #${P.des.tension.no} + ${P.des.comp!.n} #${P.des.comp!.no}` },
    steps: S.steps,
    sol: P.sol,
    answer: `A_s = ${f(P.des.As)} in² → ${P.des.tension.n} #${P.des.tension.no}; A′_s = ${f(P.des.Asp)} in² → ${P.des.comp!.n} #${P.des.comp!.no}. φMn = ${f(P.des.review.phiMn, 1)} k-ft ≥ ${Mu} k-ft.`,
  }
}

function loadsFam(r: () => number, diff: Diff, cant: boolean): DProblem<DFamily> {
  const draw = (r: () => number) => {
    const [b, h] = pick(r, SECTIONS)
    const { fc, fy } = matOf(r, diff)
    const support: Support = cant ? pick(r, ['cant', 'cant', 'fixed']) : 'ss'
    const sm = singlyMax(b, h - 4, h - 2.5, fc, fy)
    const target = sm.phiMn1 * (1.2 + 0.5 * r())
    const coef = support === 'cant' ? 2 : support === 'fixed' ? 12 : 8
    const sw = ((b * h) / 144) * (GAMMA_RC / 1000)
    const sdl = randStep(r, 1, 3, 0.1)
    const ll = randStep(r, 1.5, 4, 0.1)
    // realistic loads; the span is chosen so that Mu lands above the singly limit
    const span = Math.round(Math.sqrt((coef * target) / Math.max(1.2 * (sdl + sw) + 1.6 * ll, 1.4 * (sdl + sw))))
    const loads = beamLoads({ span, support, b, h, sdl, ll })
    const des = designDoubly({ b, d: h - 4, dt: h - 2.5, dp: 2.5, fc, fy, Mu: loads.Mu })
    return { b, h, fc, fy, support, span, sdl, ll, loads, des }
  }
  const t = retry(r, draw, (t) => t.span >= (t.support === 'cant' ? 6 : 16) && t.span <= (t.support === 'cant' ? 16 : 40) && okDes(t.des, diff))
  const { b, h, fc, fy, support, span, sdl, ll, loads } = t
  const S = stepper()
  S.group('Loads → Mu')
  S.num('sw', 'self-weight', loads.sw, 'k/ft')
  S.num('wu', 'w_u = 1.2D + 1.6L', loads.wu, 'k/ft')
  S.num('mu', support === 'fixed' ? 'M_u at the supports' : 'M_u', loads.Mu, 'k-ft')
  const P = designPart(S, b, h, fc, fy, loads.Mu)
  const top = support !== 'ss'
  return {
    family: cant ? 'cant' : 'loads',
    title: `Doubly design — ${SUPPORT_LABEL[support]} beam`,
    text: `A ${SUPPORT_LABEL[support]} beam of span **${span} ft** carries a service live load of **${ll} k/ft** and a superimposed dead load of **${sdl} k/ft** in addition to its self-weight. Architecture limits the section to **${b} in × ${h} in**. ${top ? 'Design the section at the support (tension at the top; d measured from the bottom face). ' : ''}Use two layers of tension steel ($d = h - 4 = ${f(P.d)}$ in, $d_t = ${f(P.dt)}$ in) and $d' = 2.5$ in. $f'_c = ${f(fc)}$ ksi, $f_y = ${f(fy)}$ ksi. Design the flexural reinforcement, using compression steel if necessary.`,
    beam: { support, span, udl: `DL ${sdl} k/ft (excl. self-wt) · LL ${ll} k/ft` },
    section: { b, h, flip: top },
    final: { b, h, rows: P.rows, flip: top, tag: `${P.des.tension.n} #${P.des.tension.no} + ${P.des.comp!.n} #${P.des.comp!.no}` },
    steps: S.steps,
    sol: [{ title: 'Loads', steps: loads.steps }, ...P.sol],
    answer: `Mu = ${f(loads.Mu, 1)} k-ft > φMn1 = ${f(P.des.sm.phiMn1, 1)} k-ft → tension ${P.des.tension.n} #${P.des.tension.no} (${f(P.des.tension.A, 2)} in²), compression ${P.des.comp!.n} #${P.des.comp!.no} (${f(P.des.comp!.A, 2)} in²).`,
  }
}

export function makeDoublyDesign(seed: number, fam?: DFamily, diff: Diff = 'exam'): DProblem<DFamily> {
  const r = rng(seed)
  const which = fam ?? pick(r, D_FAMILIES.map((x) => x.v))
  if (which === 'mu') return muFam(r, diff)
  return loadsFam(r, diff, which === 'cant')
}
