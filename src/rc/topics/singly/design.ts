// Singly reinforced USD design problems, built the way the papers ask them: start from the beam and its loads.
// Families: section fixed by architecture (2023-24 Q3(a), 2012-13 Q3(b)); size the beam with self-weight
// excluded (2012-13 Q5(b), 2014-15 Q8(a)); ρ given with factored loads (2021-22 Q4(a), 2015-16 Q8(a));
// overhanging beam, top and bottom steel. Every number comes from engine/singly.

import { f, type SolStep } from '../../engine/elastic'
import { BARS, rhoLimits } from '../../engine/materials'
import { barFit, beamLoads, designAs, designSection, limits, pickBars, review, SUPPORT_LABEL, ZONE_LABEL, type Support } from '../../engine/singly'
import { pick, randInt, randStep, retry, rng, stepper, type DProblem, type Diff, type SolSec } from './designCore'

export type SFamily = 'fixed' | 'size' | 'rho' | 'overhang'
export const S_FAMILIES: { v: SFamily; label: string }[] = [
  { v: 'fixed', label: 'Section fixed (service loads)' },
  { v: 'size', label: 'Size the beam (self-wt excluded)' },
  { v: 'rho', label: 'ρ given, factored loads' },
  { v: 'overhang', label: 'Overhanging beam' },
]

const fcOf = (r: () => number, diff: Diff) => (diff === 'easy' ? 4000 : pick(r, diff === 'hard' ? [3000, 3500, 4000, 5000] : [3000, 3500, 4000]))
const fyOf = (r: () => number, diff: Diff) => (diff === 'hard' ? pick(r, [60000, 60000, 40000, 50000]) : 60000)
const ksi = (v: number) => f(v / 1000)
const zoneOpts = [
  { v: 'tension', label: 'tension-controlled' },
  { v: 'transition', label: 'transition' },
  { v: 'compression', label: 'compression-controlled' },
]
const minHFactor: Record<Support, number> = { ss: 16, cant: 8, fixed: 21 }

/** bars + review of the provided section (one or two layers, d to the centroid) */
function provide(AsReq: number, b: number, d: number, fc: number, fy: number) {
  const bars = pickBars(AsReq, b)
  const two = bars.layers === 2
  const layers = two
    ? [
        { As: bars.As / 2, d: d + 0.5 },
        { As: bars.As / 2, d: d - 1.5 },
      ]
    : [{ As: bars.As, d }]
  const rv = review({ b, fc, fy, layers })
  const fit = barFit(bars.n, bars.bar, b)
  const step: SolStep = {
    t: 'Select bars',
    tex: `${bars.n}\\ \\#${bars.bar}:\\ A_s = ${bars.n}\\times${f(BARS[+bars.bar].A, 2)} = ${f(bars.As, 2)}\\text{ in}^2 \\ge ${f(AsReq)}\\text{ in}^2`,
    md: two
      ? `One layer needs $b_{min} = ${f(fit.bmin, 2)}$ in $> b = ${f(b)}$ in → two layers of ${Math.ceil(bars.n / 2)}.`
      : `Fit in one layer: $b_{min} = 2(1.5) + 2(0.375) + ${bars.n}(${f(fit.db)}) + ${bars.n - 1}(${f(fit.req)}) = ${f(fit.bmin, 2)}$ in $\\le b = ${f(b)}$ in ✓ (clear spacing ${f(fit.clear, 2)} in).`,
    v: bars.As,
    u: 'in²',
  }
  return { bars, rv, two, step }
}

function rows(n: number, bar: number | string, d: number, two: boolean) {
  const db = BARS[+bar].d
  return two
    ? [
        { d: d + 0.5, n: Math.ceil(n / 2), db },
        { d: d - 1.5, n: n - Math.ceil(n / 2), db },
      ]
    : [{ d, n, db }]
}

// ---------------------------------------------------------------- family: section fixed
function fixedFam(r: () => number, diff: Diff): DProblem<SFamily> {
  const draw = (r: () => number) => {
    const support: Support = diff === 'easy' ? 'ss' : pick(r, ['ss', 'ss', 'cant', ...(diff === 'hard' ? (['fixed'] as Support[]) : [])])
    const span = support === 'cant' ? randInt(r, 6, 12) : randInt(r, 16, 30)
    const fc = fcOf(r, diff),
      fy = fyOf(r, diff)
    const b = pick(r, [10, 12, 12, 14])
    const h = Math.ceil((span * 12) / minHFactor[support]) + randInt(r, 2, 8)
    const sdl = randStep(r, 0.6, 2, 0.1)
    const ll = randStep(r, 0.8, 2.5, 0.1)
    const P = diff === 'hard' && support !== 'fixed' && r() < 0.5 ? { D: randInt(r, 4, 12, 2), L: randInt(r, 2, 10, 2) } : null
    const px = support === 'cant' ? span : span / 2
    const loads = beamLoads({ span, support, b, h, sdl, ll, points: P ? [{ ...P, x: px }] : [] })
    const d = h - 2.5
    const des = designAs(loads.Mu, b, d, fc, fy)
    const pr = des.needsComp ? null : provide(des.As, b, d, fc, fy)
    return { support, span, fc, fy, b, h, sdl, ll, P, px, loads, d, des, pr }
  }
  const t = retry(r, draw, (t) => !!t.pr && !t.pr.two && t.pr.rv.maxOk && t.pr.rv.phiMn >= t.loads.Mu && t.des.rho > 0.004)
  const { support, span, fc, fy, b, h, sdl, ll, P, loads, d, des, pr } = t
  const L = limits(fc, fy)
  const S = stepper()
  S.group('Loads → Mu')
  S.num('sw', 'self-weight', loads.sw, 'k/ft')
  S.num('wu', 'w_u = 1.2D + 1.6L', loads.wu, 'k/ft')
  if (P) S.num('pu', 'P_u', loads.pts[0].Pu, 'k')
  S.num('mu', support === 'fixed' ? 'M_u (largest, at the supports)' : 'M_u', loads.Mu, 'k-ft')
  S.group('Steel')
  S.num('d', 'd (one layer)', d, 'in')
  S.num('rn', 'R_n = M_u/(φbd²)', des.Rn, 'psi')
  S.num('rho', 'ρ required', des.rho, '', { digits: 5 })
  S.num('rhomax', 'ρ_max (ε_t = 0.004)', L.rhoMax, '', { digits: 4 })
  S.choice('singly', 'ρ ≤ ρ_max — singly reinforced works?', [{ v: 'y', label: 'Yes' }, { v: 'n', label: 'No' }], 'y')
  S.num('asmin', 'A_s,min', des.AsMin, 'in²')
  S.num('as', 'A_s required', des.As, 'in²')
  S.group('Bars and check')
  S.num('n', `number of #${pr!.bars.bar} bars`, pr!.bars.n)
  S.num('a', 'a (provided bars)', pr!.rv.a, 'in')
  S.num('et', 'ε_t', pr!.rv.epsT, '', { digits: 5 })
  S.choice('zone', 'Section is', zoneOpts, pr!.rv.zone)
  S.num('pmn', 'φM_n (provided)', pr!.rv.phiMn, 'k-ft')
  const tens = support === 'cant' ? ' (tension at the top: steel at the top face)' : support === 'fixed' ? ' (design the support section: tension at the top)' : ''
  const ptxt = P ? ` and a ${support === 'cant' ? 'tip' : 'midspan'} point load of ${P.D} k dead + ${P.L} k live` : ''
  const sol: SolSec[] = [
    { title: 'Loads', steps: loads.steps },
    { title: 'Design As', steps: [{ t: 'Effective depth', tex: `d = h - 2.5 = ${f(h)} - 2.5 = ${f(d)}\\text{ in}`, md: '1.5 in cover + #3 stirrup + half a bar, one layer.' }, ...des.steps, { t: 'Minimum steel', tex: `A_{s,min} = \\frac{\\max(3\\sqrt{f'_c},200)}{f_y}bd = ${f(des.AsMin)}\\text{ in}^2${des.governedByMin ? '\\ \\text{governs}' : ''}` }] },
    { title: 'Bars and check', steps: [pr!.step, ...pr!.rv.steps] },
  ]
  return {
    family: 'fixed',
    title: `${SUPPORT_LABEL[support]} beam — section fixed`,
    text: `A ${SUPPORT_LABEL[support]} beam of span **${span} ft** carries a service live load of **${ll} k/ft** and an unfactored superimposed dead load of **${sdl} k/ft** in addition to its self-weight${ptxt}. For architectural reasons the section is limited to **${b} in × ${h} in**. $f'_c = ${ksi(fc)}$ ksi, $f_y = ${ksi(fy)}$ ksi. Design the beam for flexure by USD${tens} and check the minimum and maximum reinforcement. Use one layer of bars, #3 stirrups, 1.5 in cover.`,
    beam: { support, span, udl: `DL ${sdl} k/ft (excl. self-wt) · LL ${ll} k/ft`, points: P ? [{ x: t.px, label: `${P.D} k D + ${P.L} k L` }] : [] },
    section: { b, h, flip: support !== 'ss' },
    final: { b, h, rows: rows(pr!.bars.n, pr!.bars.bar, d, false), flip: support !== 'ss', tag: `${pr!.bars.n} #${pr!.bars.bar}` },
    steps: S.steps,
    sol,
    answer: `Provide ${pr!.bars.n} #${pr!.bars.bar} (${f(pr!.bars.As, 2)} in²) in the ${b} × ${h} section: φMn = ${f(pr!.rv.phiMn, 1)} k-ft ≥ Mu = ${f(loads.Mu, 1)} k-ft, εt = ${f(pr!.rv.epsT, 4)} (${ZONE_LABEL[pr!.rv.zone]}).`,
  }
}

const RHO_LBL = { '0.5rhob': '0.5ρ_b', rho005: 'ρ_0.005', '0.6max': '0.6ρ_max', '0.7max': '0.7ρ_max' } as const

// ---------------------------------------------------------------- family: size the beam (self-weight excluded)
function sizeFam(r: () => number, diff: Diff): DProblem<SFamily> {
  const draw = (r: () => number) => {
    const span = randInt(r, 18, 36, 2)
    const fc = fcOf(r, diff),
      fy = fyOf(r, diff)
    const sdl = randStep(r, 1, 2, 0.1)
    const ll = randStep(r, 0.8, 1.6, 0.1)
    const b = pick(r, [12, 12, 14])
    const kind = diff === 'easy' ? '0.5rhob' : pick(r, ['0.5rhob', '0.5rhob', 'rho005', '0.6max', '0.7max'] as const)
    const lim = rhoLimits(fc, fy)
    const rho = kind === '0.5rhob' ? 0.5 * lim.rhoB : kind === 'rho005' ? lim.rho005 : kind === '0.6max' ? 0.6 * lim.rhoMax : 0.7 * lim.rhoMax
    const hMin = Math.ceil((span * 12) / 16)
    const l1 = beamLoads({ span, support: 'ss', b, h: hMin, sdl, ll })
    const sec = designSection(l1.Mu, fc, fy, rho, { b })
    const h = Math.max(sec.h, hMin)
    const d = h - 2.5
    const l2 = beamLoads({ span, support: 'ss', b, h, sdl, ll })
    const des = designAs(l2.Mu, b, d, fc, fy)
    const pr = des.needsComp ? null : provide(des.As, b, d, fc, fy)
    return { span, fc, fy, sdl, ll, b, kind, rho, hMin, l1, sec, h, d, l2, des, pr }
  }
  const t = retry(r, draw, (t) => !!t.pr && !t.pr.two && t.pr.rv.maxOk && t.pr.rv.phiMn >= t.l2.Mu && t.h <= 48)
  const { span, fc, fy, sdl, ll, b, kind, rho, hMin, l1, sec, h, d, l2, des, pr } = t
  const rhoTxt = kind === '0.5rhob' ? '0.5\\rho_b' : kind === 'rho005' ? '\\rho_{0.005}' : kind === '0.6max' ? '0.6\\rho_{max}' : '0.7\\rho_{max}'
  const S = stepper()
  S.group('Trial section and loads')
  S.num('hmin', 'trial h = L/16 (whole inches)', hMin, 'in')
  S.num('sw1', 'self-weight (trial h)', l1.sw, 'k/ft')
  S.num('mu1', 'M_u (trial)', l1.Mu, 'k-ft')
  S.group('Size from the chosen ρ')
  S.num('rho', `ρ = ${RHO_LBL[kind]}`, rho, '', { digits: 5 })
  S.num('R', 'R = ρf_y(1 − 0.59ρf_y/f′c)', sec.Rn, 'ksi', { digits: 4 })
  S.num('dreq', 'd required', sec.d, 'in')
  S.num('h', 'h chosen = max(d + 2.5 rounded up, L/16)', h, 'in')
  S.group('Redesign at the final section')
  S.num('mu2', 'M_u with the final self-weight', l2.Mu, 'k-ft')
  S.num('as', 'A_s at d = h − 2.5', des.As, 'in²')
  S.num('n', `number of #${pr!.bars.bar} bars`, pr!.bars.n)
  S.num('et', 'ε_t (provided)', pr!.rv.epsT, '', { digits: 5 })
  S.num('pmn', 'φM_n (provided)', pr!.rv.phiMn, 'k-ft')
  const sol: SolSec[] = [
    { title: 'Trial section (self-weight unknown)', steps: [{ t: 'Minimum depth (ACI, simply supported)', tex: `h_{min} = \\frac{L}{16} = \\frac{${span}\\times12}{16} = ${f((span * 12) / 16, 2)} \\to ${hMin}\\text{ in}`, md: `Trial section ${b} × ${hMin} in for the self-weight.` }, ...l1.steps] },
    { title: 'Section from ρ', steps: [{ t: 'Steel ratio limits', tex: `\\rho_b = ${f(rhoLimits(fc, fy).rhoB, 4)},\\ \\rho_{max} = ${f(rhoLimits(fc, fy).rhoMax, 4)}\\ \\Rightarrow\\ \\rho = ${rhoTxt} = ${f(rho, 5)}` }, ...sec.steps, { t: 'Final h', tex: `h = \\max(${sec.h},\\ ${hMin}) = ${h}\\text{ in},\\quad d = ${h} - 2.5 = ${f(d)}\\text{ in}` }] },
    { title: 'Redesign with the final self-weight', steps: [...l2.steps, ...des.steps] },
    { title: 'Bars and check', steps: [pr!.step, ...pr!.rv.steps] },
  ]
  return {
    family: 'size',
    title: 'Size a singly reinforced beam',
    text: `Design a singly reinforced, simply supported rectangular beam of span **${span} ft** for a uniform **DL = ${sdl} k/ft** (excluding self-weight) and **LL = ${ll} k/ft**. Use $b = ${b}$ in and $\\rho = ${rhoTxt}$. $f'_c = ${ksi(fc)}$ ksi, $f_y = ${ksi(fy)}$ ksi. Take a trial depth from the ACI minimum (L/16) for the self-weight, find d and h (whole inches, one layer, d = h − 2.5), then redesign A_s at the final section and select bars.`,
    beam: { support: 'ss', span, udl: `DL ${sdl} k/ft (excl. self-wt) · LL ${ll} k/ft` },
    section: { b, h: hMin, tag: 'h = ?' },
    final: { b, h, rows: rows(pr!.bars.n, pr!.bars.bar, d, false), tag: `${pr!.bars.n} #${pr!.bars.bar}` },
    steps: S.steps,
    sol,
    answer: `Use ${b} × ${h} in with ${pr!.bars.n} #${pr!.bars.bar} (${f(pr!.bars.As, 2)} in²): φMn = ${f(pr!.rv.phiMn, 1)} k-ft ≥ Mu = ${f(l2.Mu, 1)} k-ft.`,
  }
}

// ---------------------------------------------------------------- family: ρ given, factored loads
function rhoFam(r: () => number, diff: Diff): DProblem<SFamily> {
  const draw = (r: () => number) => {
    const support: Support = diff === 'easy' ? 'ss' : pick(r, ['ss', 'ss', 'cant'])
    const span = support === 'cant' ? randInt(r, 6, 12) : randInt(r, 20, 32, 2)
    const fc = fcOf(r, diff),
      fy = fyOf(r, diff)
    const D = randStep(r, 1.5, 3, 0.5)
    const Lv = randStep(r, 1, 2.5, 0.5)
    const P = diff === 'easy' ? 0 : randInt(r, 10, support === 'cant' ? 20 : 50, 5)
    const b = pick(r, [12, 12, 14, 16])
    const k = pick(r, [0.5, 0.6, 0.7, 0.75])
    const px = support === 'cant' ? span : span / 2
    const loads = beamLoads({ span, support, sdl: D, ll: Lv, factored: true, points: P ? [{ D: P, L: 0, x: px }] : [] })
    const lim = rhoLimits(fc, fy)
    const rho = k * lim.rhoMax
    const sec = designSection(loads.Mu, fc, fy, rho, { b })
    const d = sec.dAct
    const pr = provide(sec.As, b, d, fc, fy)
    return { support, span, fc, fy, D, Lv, P, px, b, k, loads, rho, sec, d, pr }
  }
  const t = retry(r, draw, (t) => !t.pr.two && t.pr.rv.maxOk && t.pr.rv.phiMn >= t.loads.Mu && t.sec.h <= 44 && t.sec.h >= 14)
  const { support, span, fc, fy, D, Lv, P, b, k, loads, rho, sec, d, pr } = t
  const lim = limits(fc, fy)
  const S = stepper()
  S.group('Loads → Mu')
  S.num('wu', 'w_u', loads.wu, 'k/ft')
  S.num('mu', 'M_u', loads.Mu, 'k-ft')
  S.group('Section from ρ')
  S.num('rhomax', 'ρ_max (ε_t = 0.004)', lim.rhoMax, '', { digits: 4 })
  S.num('rho', `ρ = ${k}ρ_max`, rho, '', { digits: 5 })
  S.num('phi', 'φ at this ρ', sec.phi, '', { digits: 3 })
  S.num('R', 'R = ρf_y(1 − 0.59ρf_y/f′c)', sec.Rn, 'ksi', { digits: 4 })
  S.num('d', 'd required', sec.d, 'in')
  S.num('h', 'h (rounded up, d + 2.5)', sec.h, 'in')
  S.num('as', 'A_s = ρbd (d required)', sec.As, 'in²')
  S.group('Bars and check')
  S.num('n', `number of #${pr.bars.bar} bars`, pr.bars.n)
  S.num('et', 'ε_t (provided, d = h − 2.5)', pr.rv.epsT, '', { digits: 5 })
  S.num('pmn', 'φM_n (provided)', pr.rv.phiMn, 'k-ft')
  const ptxt = P ? ` and a ${support === 'cant' ? 'tip' : 'midspan'} point load of ${P} k` : ''
  return {
    family: 'rho',
    title: `${SUPPORT_LABEL[support]} — ρ given`,
    text: `Design a singly reinforced ${SUPPORT_LABEL[support]} beam of span **${span} ft** for a uniform load **DL = ${D} k/ft, LL = ${Lv} k/ft**${ptxt}. **All loads are factored; the dead load includes the self-weight.** $f'_c = ${fc}$ psi, $f_y = ${fy}$ psi, $b = ${b}$ in, $\\rho = ${k}\\rho_{max}$. Find d, h and A_s and select bars (one layer).`,
    beam: { support, span, udl: `DL ${D} k/ft · LL ${Lv} k/ft (factored)`, points: P ? [{ x: t.px, label: `${P} k` }] : [] },
    section: { b, h: Math.max(12, sec.h), tag: 'h = ?', flip: support === 'cant' },
    final: { b, h: sec.h, rows: rows(pr.bars.n, pr.bars.bar, d, false), flip: support === 'cant', tag: `${pr.bars.n} #${pr.bars.bar}` },
    steps: S.steps,
    sol: [
      { title: 'Loads', steps: loads.steps },
      { title: 'Limits', steps: lim.steps.slice(0, 3) },
      { title: 'Section', steps: sec.steps },
      { title: 'Bars and check', steps: [pr.step, ...pr.rv.steps] },
    ],
    answer: `${b} × ${sec.h} in, ${pr.bars.n} #${pr.bars.bar} (${f(pr.bars.As, 2)} in²): φMn = ${f(pr.rv.phiMn, 1)} k-ft ≥ Mu = ${f(loads.Mu, 1)} k-ft.`,
  }
}

// ---------------------------------------------------------------- family: overhanging beam
function overhangFam(r: () => number, diff: Diff): DProblem<SFamily> {
  const draw = (r: () => number) => {
    const span = randInt(r, 16, 26, 2)
    const over = randInt(r, 5, 9)
    const fc = fcOf(r, diff),
      fy = fyOf(r, diff)
    const b = pick(r, [12, 12, 14])
    const h = randInt(r, Math.max(18, Math.ceil((over * 12) / 8) + 2), 28, 2)
    const sdl = randStep(r, 0.8, 1.8, 0.1)
    const ll = randStep(r, 0.8, 2, 0.1)
    const P = diff === 'hard' ? randInt(r, 4, 10, 2) : 0
    // the overhang B–C acts as a cantilever from B
    const neg = beamLoads({ span: over, support: 'cant', b, h, sdl, ll, points: P ? [{ D: P, L: 0, x: over }] : [] })
    const wu = neg.wu
    const Pu = P ? neg.pts[0].Pu : 0
    const Mneg = neg.Mu
    // span A–B, everything loaded: RA = wuL/2 − M_B/L, M+ = RA²/(2wu)
    const RA = (wu * span) / 2 - Mneg / span
    const Mpos = RA > 0 ? (RA * RA) / (2 * wu) : 0
    const d = h - 2.5
    const top = designAs(Mneg, b, d, fc, fy)
    const bot = designAs(Mpos, b, d, fc, fy)
    const prT = top.needsComp ? null : provide(top.As, b, d, fc, fy)
    const prB = bot.needsComp ? null : provide(bot.As, b, d, fc, fy)
    return { span, over, fc, fy, b, h, sdl, ll, P, neg, wu, Pu, Mneg, RA, Mpos, d, top, bot, prT, prB }
  }
  const ok = (t: ReturnType<typeof draw>) => !!t.prT && !!t.prB && !t.prT.two && !t.prB.two && t.prT.rv.maxOk && t.prB.rv.maxOk && t.Mpos > 20 && t.prT.rv.phiMn >= t.Mneg && t.prB.rv.phiMn >= t.Mpos
  const t = retry(r, draw, ok)
  const { span, over, fc, fy, b, h, sdl, ll, P, neg, wu, Mneg, RA, Mpos, d, top, bot, prT, prB } = t
  const S = stepper()
  S.group('Loads and moments')
  S.num('sw', 'self-weight', neg.sw, 'k/ft')
  S.num('wu', 'w_u', wu, 'k/ft')
  S.num('mneg', 'M_u⁻ at B (overhang)', Mneg, 'k-ft')
  S.num('ra', 'R_A (all spans loaded)', RA, 'k')
  S.num('mpos', 'M_u⁺ in A–B', Mpos, 'k-ft')
  S.group('Top steel at B')
  S.num('ast', 'A_s (top)', top.As, 'in²')
  S.num('nt', `number of #${prT!.bars.bar} bars (top)`, prT!.bars.n)
  S.group('Bottom steel in A–B')
  S.num('asb', 'A_s (bottom)', bot.As, 'in²')
  S.num('nb', `number of #${prB!.bars.bar} bars (bottom)`, prB!.bars.n)
  S.num('pmnb', 'φM_n (bottom, provided)', prB!.rv.phiMn, 'k-ft')
  const sol: SolSec[] = [
    { title: 'Overhang B–C as a cantilever from B', steps: neg.steps },
    {
      title: 'Span A–B',
      steps: [
        { t: 'Reaction at A', tex: `R_A = \\frac{w_uL}{2} - \\frac{M_B}{L} = \\frac{${f(wu)}\\times${span}}{2} - \\frac{${f(Mneg, 1)}}{${span}} = ${f(RA, 2)}\\text{ k}`, v: RA, u: 'k' },
        { t: 'Maximum positive moment', tex: `x = \\frac{R_A}{w_u} = ${f(RA / wu, 2)}\\text{ ft},\\quad M_u^+ = \\frac{R_A^2}{2w_u} = \\frac{${f(RA, 2)}^2}{2\\times${f(wu)}} = ${f(Mpos, 1)}\\text{ k-ft}`, v: Mpos, u: 'k-ft', md: 'Full factored load on both parts, as the papers do. (Pattern live load — LL off the overhang — raises M⁺ a little.)' },
      ],
    },
    { title: 'Top steel (d = h − 2.5)', steps: [...top.steps, prT!.step] },
    { title: 'Bottom steel', steps: [...bot.steps, prB!.step, ...prB!.rv.steps.slice(-4)] },
  ]
  return {
    family: 'overhang',
    title: 'Overhanging beam — top and bottom steel',
    text: `Beam **A–B–C** is simply supported at A and B (span **${span} ft**) and overhangs **${over} ft** beyond B. It carries a service DL of **${sdl} k/ft** (excluding self-weight) and LL of **${ll} k/ft** over its full length${P ? `, plus a dead point load of **${P} k** at the tip C` : ''}. Section **${b} in × ${h} in**, $f'_c = ${ksi(fc)}$ ksi, $f_y = ${ksi(fy)}$ ksi. Design the top steel at B and the bottom steel in span A–B by USD (one layer each, d = h − 2.5).`,
    beam: { support: 'overhang', span, over, udl: `DL ${sdl} k/ft (excl. self-wt) · LL ${ll} k/ft`, points: P ? [{ x: span + over, label: `${P} k D` }] : [] },
    section: { b, h },
    final: { b, h, rows: [{ d: 2.5, n: prT!.bars.n, db: BARS[+prT!.bars.bar].d }, { d, n: prB!.bars.n, db: BARS[+prB!.bars.bar].d }], tag: `top ${prT!.bars.n} #${prT!.bars.bar}, bot ${prB!.bars.n} #${prB!.bars.bar}` },
    steps: S.steps,
    sol,
    answer: `Top at B: ${prT!.bars.n} #${prT!.bars.bar} (Mu⁻ = ${f(Mneg, 1)} k-ft). Bottom in A–B: ${prB!.bars.n} #${prB!.bars.bar} (Mu⁺ = ${f(Mpos, 1)} k-ft).`,
  }
}

export function makeSinglyDesign(seed: number, fam?: SFamily, diff: Diff = 'exam'): DProblem<SFamily> {
  const r = rng(seed)
  const which = fam ?? pick(r, S_FAMILIES.map((x) => x.v))
  if (which === 'fixed') return fixedFam(r, diff)
  if (which === 'size') return sizeFam(r, diff)
  if (which === 'rho') return rhoFam(r, diff)
  return overhangFam(r, diff)
}
