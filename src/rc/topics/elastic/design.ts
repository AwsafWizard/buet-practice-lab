// WSD / service-load design problems, as the older papers ask them: size a beam by WSD from its loads
// (2005-06 Q8(c), 2002-03 Q8(c)); WSD design of an architecturally fixed section that may need compression
// steel (2006-07 Q1(c)(i)); service-load check of a USD-designed beam (Mcr, fc and fs against the allowables).
// Numbers from engine/elastic (psi in, ksi / k-ft out) and engine/singly (beamLoads, designAs, pickBars).

import { crackedStresses, f, modular, uncracked, wsdAllowables, wsdDesign, wsdDoublyDesign, type ElasticInput, type SolStep } from '../../engine/elastic'
import { BARS, GAMMA_RC } from '../../engine/materials'
import { beamLoads, designAs, pickBars } from '../../engine/singly'
import { pick, randInt, randStep, retry, rng, stepper, type DProblem, type Diff, type SolSec } from '../singly/designCore'

export type EFamily = 'wsd' | 'wsdFixed' | 'service'
export const E_FAMILIES: { v: EFamily; label: string }[] = [
  { v: 'wsd', label: 'WSD: size the beam' },
  { v: 'wsdFixed', label: 'WSD: section fixed' },
  { v: 'service', label: 'Service check of a USD beam' },
]

const yesNo = [
  { v: 'y', label: 'Yes' },
  { v: 'n', label: 'No' },
]

/** service moment of a simply supported beam (D + L), with the self-weight from b × h when given */
function service(span: number, sdl: number, ll: number, b?: number, h?: number) {
  const l = beamLoads({ span, support: 'ss', sdl, ll, b, h, factored: true })
  const steps: SolStep[] = []
  if (l.sw) steps.push({ t: 'Self-weight', tex: `w_{sw} = \\frac{${f(b!)}\\times${f(h!)}}{144}\\times0.150 = ${f(l.sw)}\\text{ k/ft}`, v: l.sw, u: 'k/ft' })
  steps.push(
    { t: 'Service load (WSD: no load factors)', tex: `w = D + L = ${f(l.wD)} + ${f(l.wL)} = ${f(l.wu)}\\text{ k/ft}`, v: l.wu, u: 'k/ft' },
    { t: 'Service moment', tex: `M = \\frac{wL^2}{8} = \\frac{${f(l.wu)}\\times${span}^2}{8} = ${f(l.Mu, 1)}\\text{ k-ft}`, v: l.Mu, u: 'k-ft' },
  )
  return { sw: l.sw, w: l.wu, M: l.Mu, steps }
}

function mats(r: () => number, diff: Diff) {
  const fc = diff === 'easy' ? 3000 : pick(r, [3000, 3000, 3500, 4000])
  const fy = diff === 'easy' ? 60000 : pick(r, [60000, 40000])
  const al = wsdAllowables(fc, fy)
  const nGiven = diff === 'easy' || r() < 0.5
  const n = modular({ b: 1, h: 1, d: 1, As: 0, fc }).n
  return { fc, fy, fcA: al.fc, fsA: al.fs, n, nGiven }
}
const matTxt = (m: ReturnType<typeof mats>) => `$f'_c = ${m.fc}$ psi, $f_y = ${m.fy}$ psi; allowables $f_c = 0.45f'_c = ${f(m.fcA)}$ ksi, $f_s = ${f(m.fsA)}$ ksi${m.nGiven ? `, $n = ${m.n}$` : ' (take n = Es/Ec rounded)'}`

// ---------------------------------------------------------------- WSD: size the beam
function wsdFam(r: () => number, diff: Diff): DProblem<EFamily> {
  const draw = (r: () => number) => {
    const span = randInt(r, 16, 30, 2)
    const b = pick(r, [12, 12, 14, 16])
    const sdl = randStep(r, 1, 2, 0.1)
    const ll = randStep(r, 0.8, 1.6, 0.1)
    const m = mats(r, diff)
    const s0 = service(span, sdl, ll)
    const w0 = wsdDesign(s0.M, b, m.n, m.fcA, m.fsA)
    const h0 = Math.ceil(w0.dReq + 2.5)
    const s1 = service(span, sdl, ll, b, h0)
    const w1 = wsdDesign(s1.M, b, m.n, m.fcA, m.fsA)
    const h = Math.ceil(w1.dReq + 2.5)
    const d = h - 2.5
    const wd = wsdDesign(s1.M, b, m.n, m.fcA, m.fsA, d)
    const bars = pickBars(wd.As, b)
    const chk = crackedStresses({ b, h, d, As: bars.As, fc: m.fc, n: m.n }, s1.M)
    return { span, b, sdl, ll, m, s0, w0, h0, s1, w1, h, d, wd, bars, chk }
  }
  const t = retry(r, draw, (t) => t.bars.layers === 1 && t.h <= 48 && t.chk.fs <= t.m.fsA * 1.0001)
  const { span, b, sdl, ll, m, s0, w0, h0, s1, w1, h, d, wd, bars, chk } = t
  const S = stepper()
  S.group('WSD constants')
  if (!m.nGiven) S.num('n', 'n = Es/Ec (rounded)', m.n)
  S.num('k', 'k = n/(n + fs/fc)', wd.k, '', { digits: 4 })
  S.num('j', 'j = 1 − k/3', wd.j, '', { digits: 4 })
  S.num('R', 'R = ½ fc k j', wd.R, 'ksi', { digits: 4 })
  S.group('First pass (no self-weight)')
  S.num('m0', 'M (superimposed loads only)', s0.M, 'k-ft')
  S.num('d0', 'd = √(M/Rb)', w0.dReq, 'in')
  S.num('h0', 'trial h = d + 2.5 rounded up', h0, 'in')
  S.group('With self-weight')
  S.num('sw', 'self-weight (trial h)', s1.sw, 'k/ft')
  S.num('m', 'service M', s1.M, 'k-ft')
  S.num('dreq', 'd required', w1.dReq, 'in')
  S.num('h', 'h chosen', h, 'in')
  S.num('as', 'A_s = M/(fs j d)', wd.As, 'in²')
  S.num('nb', `number of #${bars.bar} bars`, bars.n)
  S.group('Check the stresses')
  S.num('fs', 'f_s (provided, cracked section)', chk.fs, 'ksi')
  S.num('fc', 'f_c (provided)', chk.fc, 'ksi')
  const sol: SolSec[] = [
    { title: 'WSD constants', steps: [...(m.nGiven ? [] : [{ t: 'Modular ratio', tex: `n = \\frac{29{,}000}{57\\sqrt{${m.fc}}} = ${f(modular({ b, h, d, As: 0, fc: m.fc }).exact, 2)} \\to ${m.n}`, v: m.n }]), ...wd.steps.slice(0, 4)] },
    { title: 'First pass without self-weight', steps: [...s0.steps, wsdDesign(s0.M, b, m.n, m.fcA, m.fsA).steps[4], { t: 'Trial h', tex: `h = ${f(w0.dReq, 2)} + 2.5 \\to ${h0}\\text{ in}` }] },
    { title: 'Second pass with self-weight', steps: [...s1.steps, w1.steps[4], { t: 'Choose h', tex: `h = ${f(w1.dReq, 2)} + 2.5 \\to ${h}\\text{ in},\\ d = ${f(d)}\\text{ in}`, md: h > h0 ? `h grew from ${h0} in; the extra self-weight (${f((((h - h0) * b) / 144) * (GAMMA_RC / 1000), 3)} k/ft) is small — rounding up covers it.` : undefined }, wd.steps[5]] },
    {
      title: 'Bars and stress check',
      steps: [
        { t: 'Bars', tex: `${bars.n}\\ \\#${bars.bar} = ${f(bars.As, 2)}\\text{ in}^2 \\ge ${f(wd.As)}\\text{ in}^2` },
        ...chk.steps,
        ...chk.stressSteps,
        { t: 'Compare with allowables', tex: `f_s = ${f(chk.fs)} ${chk.fs <= m.fsA ? '\\le' : '>'} ${f(m.fsA)}\\text{ ksi},\\quad f_c = ${f(chk.fc)} ${chk.fc <= m.fcA ? '\\le' : '>'} ${f(m.fcA)}\\text{ ksi}` },
      ],
    },
  ]
  return {
    family: 'wsd',
    title: 'WSD design — choose the section',
    text: `Design a singly reinforced, simply supported rectangular beam of span **${span} ft** by the **working stress method**. DL = **${sdl} k/ft** (excluding self-weight), LL = **${ll} k/ft**, $b = ${b}$ in. ${matTxt(m)}. Find the required d (first without, then with the self-weight), choose h (whole inches, d = h − 2.5), find A_s and select bars; check the service stresses of the provided section.`,
    beam: { support: 'ss', span, udl: `DL ${sdl} k/ft (excl. self-wt) · LL ${ll} k/ft` },
    section: { b, h: h0, tag: 'h = ?' },
    final: { b, h, rows: [{ d, n: bars.n, db: BARS[+bars.bar].d }], tag: `${bars.n} #${bars.bar}` },
    steps: S.steps,
    sol,
    answer: `${b} × ${h} in with ${bars.n} #${bars.bar} (${f(bars.As, 2)} in²): f_s = ${f(chk.fs)} ksi, f_c = ${f(chk.fc)} ksi under M = ${f(s1.M, 1)} k-ft.`,
  }
}

// ---------------------------------------------------------------- WSD: section fixed (compression steel?)
function wsdFixedFam(r: () => number, diff: Diff): DProblem<EFamily> {
  const draw = (r: () => number) => {
    const [b, h] = pick(r, [
      [12, 30],
      [12, 28],
      [14, 30],
      [12, 26],
    ] as [number, number][])
    const span = randInt(r, 22, 30, 2)
    const m = mats(r, diff)
    const d = h - 2.5,
      dp = 2.5
    const p0 = wsdDoublyDesign(1, b, d, dp, m.n, m.fcA, m.fsA)
    const k = diff === 'easy' ? 0.7 + 0.25 * r() : diff === 'hard' ? 1.15 + 0.35 * r() : 0.75 + 0.7 * r()
    const sw = ((b * h) / 144) * (GAMMA_RC / 1000)
    const sdl = randStep(r, 0.6, 1.4, 0.1)
    const ll = Math.round(((8 * k * p0.M1) / (span * span) - sdl - sw) * 10) / 10
    const s = service(span, sdl, ll, b, h)
    const dd = wsdDoublyDesign(s.M, b, d, dp, m.n, m.fcA, m.fsA)
    const sd = wsdDesign(s.M, b, m.n, m.fcA, m.fsA, d)
    const As = dd.needsComp ? dd.As : sd.As
    const bars = pickBars(As, b)
    const cb = dd.needsComp ? pickBars(dd.Asp, b) : null
    return { b, h, span, m, d, dp, sdl, ll, s, dd, sd, As, bars, cb }
  }
  const t = retry(r, draw, (t) => t.ll >= 0.5 && t.ll <= 3 && !!t.bars && (!t.cb || t.dd.Asp > 0.3) && t.bars.layers <= 2 && (diff !== 'hard' || t.dd.needsComp))
  const { b, h, span, m, d, sdl, ll, s, dd, sd, As, bars, cb } = t
  const S = stepper()
  S.group('Loads')
  S.num('sw', 'self-weight', s.sw, 'k/ft')
  S.num('m', 'service M', s.M, 'k-ft')
  S.group('Capacity without compression steel')
  if (!m.nGiven) S.num('n', 'n (rounded)', m.n)
  S.num('k', 'k (balanced)', dd.k, '', { digits: 4 })
  S.num('j', 'j', dd.j, '', { digits: 4 })
  S.num('R', 'R = ½ fc k j', dd.R, 'ksi', { digits: 4 })
  S.num('m1', 'M₁ = R b d²', dd.M1, 'k-ft')
  S.choice('comp', 'Compression steel needed?', yesNo, dd.needsComp ? 'y' : 'n')
  if (dd.needsComp) {
    S.group('Compression steel (f′s = 2n fc (kd − d′)/kd ≤ fs)')
    S.num('as1', 'A_s1 = M₁/(fs j d)', dd.As1, 'in²')
    S.num('m2', 'M₂ = M − M₁', dd.M2, 'k-ft')
    S.num('fsp', 'f′_s', dd.fsp, 'ksi')
    S.num('asp', 'A′_s', dd.Asp, 'in²')
    S.num('as', 'A_s total', dd.As, 'in²')
    S.num('nc', `number of #${cb!.bar} compression bars`, cb!.n)
  } else {
    S.group('Tension steel')
    S.num('as', 'A_s = M/(fs j d)', sd.As, 'in²')
  }
  S.num('nb', `number of #${bars.bar} tension bars`, bars.n)
  const sol: SolSec[] = [
    { title: 'Loads', steps: s.steps },
    {
      title: dd.needsComp ? 'WSD design with compression steel' : 'WSD design (singly)',
      steps: [
        ...(m.nGiven ? [] : [{ t: 'Modular ratio', tex: `n = E_s/E_c \\to ${m.n}`, v: m.n } as SolStep]),
        { t: 'Depth', tex: `d = h - 2.5 = ${f(d)}\\text{ in}` },
        ...(dd.needsComp ? dd.steps : [...dd.steps.slice(0, 5), { t: 'Singly enough', tex: `M = ${f(s.M, 1)} \\le M_1 = ${f(dd.M1, 1)}\\text{ k-ft}` }, sd.steps[sd.steps.length - 1]]),
        { t: 'Bars', tex: `\\text{Tension: } ${bars.n}\\ \\#${bars.bar} = ${f(bars.As, 2)}\\text{ in}^2${bars.layers === 2 ? '\\ (2\\text{ layers})' : ''}${cb ? `,\\quad \\text{compression: } ${cb.n}\\ \\#${cb.bar} = ${f(cb.As, 2)}\\text{ in}^2` : ''}` },
      ],
    },
  ]
  return {
    family: 'wsdFixed',
    title: 'WSD design — section fixed',
    text: `A simply supported beam of span **${span} ft** carries a service LL of **${ll} k/ft** and an unfactored superimposed DL of **${sdl} k/ft** in addition to its self-weight. The section is fixed at **${b} in × ${h} in** for architectural reasons (take d = h − 2.5, d′ = 2.5 in). ${matTxt(m)}. Design the beam for flexure by the **WSD** method (compression steel if needed, f′s = 2n fc (kd − d′)/kd ≤ fs) and select bars.`,
    beam: { support: 'ss', span, udl: `DL ${sdl} k/ft (excl. self-wt) · LL ${ll} k/ft` },
    section: { b, h },
    final: { b, h, rows: [...(cb ? [{ d: 2.5, n: cb.n, db: BARS[+cb.bar].d }] : []), { d, n: Math.min(bars.n, bars.layers === 2 ? Math.ceil(bars.n / 2) : bars.n), db: BARS[+bars.bar].d }], tag: `${bars.n} #${bars.bar}${cb ? ` + ${cb.n} #${cb.bar}` : ''}` },
    steps: S.steps,
    sol,
    answer: dd.needsComp ? `M = ${f(s.M, 1)} k-ft > M₁ = ${f(dd.M1, 1)} k-ft: A_s = ${f(As)} in² (${bars.n} #${bars.bar}), A′_s = ${f(dd.Asp)} in² (${cb!.n} #${cb!.bar}).` : `M = ${f(s.M, 1)} k-ft ≤ M₁ = ${f(dd.M1, 1)} k-ft: singly, A_s = ${f(As)} in² (${bars.n} #${bars.bar}).`,
  }
}

// ---------------------------------------------------------------- service check of a USD-designed beam
function serviceFam(r: () => number, diff: Diff): DProblem<EFamily> {
  const draw = (r: () => number) => {
    const span = randInt(r, 16, 28, 2)
    const b = pick(r, [10, 12, 12, 14])
    const h = Math.ceil((span * 12) / 16) + randInt(r, 2, 8)
    const fc = diff === 'easy' ? 4000 : pick(r, [3000, 3500, 4000, 5000])
    const fy = 60000
    const sdl = randStep(r, 0.6, 1.8, 0.1)
    const ll = randStep(r, 0.8, 2.2, 0.1)
    const d = h - 2.5
    const lu = beamLoads({ span, support: 'ss', b, h, sdl, ll })
    const des = designAs(lu.Mu, b, d, fc, fy)
    const bars = des.needsComp ? null : pickBars(des.As, b)
    const inp: ElasticInput = { b, h, d, As: bars ? bars.As : 1, fc, fy }
    const u = uncracked(inp)
    const s = service(span, sdl, ll, b, h)
    const c = crackedStresses(inp, s.M)
    return { span, b, h, fc, fy, sdl, ll, d, lu, des, bars, inp, u, s, c }
  }
  const t = retry(r, draw, (t) => !!t.bars && t.bars.layers === 1 && t.s.M > t.u.Mcr * 1.2)
  const { span, b, h, fc, fy, sdl, ll, d, lu, bars, u, s, c } = t
  const al = wsdAllowables(fc, fy)
  const fsAll = 0.4 * (fy / 1000)
  const S = stepper()
  S.group('Uncracked section')
  S.num('n', 'n = Es/Ec (rounded)', u.n)
  S.num('ybar', 'ȳ from the top (uncracked transformed)', u.ybar, 'in')
  S.num('I', 'I_ut', u.I, 'in⁴')
  S.num('mcr', 'M_cr', u.Mcr, 'k-ft')
  S.group('Service moment')
  S.num('sw', 'self-weight', s.sw, 'k/ft')
  S.num('m', 'service M = (D + L)L²/8', s.M, 'k-ft')
  S.choice('cr', 'M > M_cr — section cracked?', yesNo, s.M > u.Mcr ? 'y' : 'n')
  S.group('Cracked section stresses')
  S.num('kd', 'kd', c.kd, 'in')
  S.num('icr', 'I_cr', c.Icr, 'in⁴')
  S.num('fc', 'f_c (top)', c.fc, 'ksi')
  S.num('fs', 'f_s', c.fs, 'ksi')
  S.choice('okc', `f_c ≤ 0.45f′c = ${f(al.fc)} ksi?`, yesNo, c.fc <= al.fc ? 'y' : 'n')
  S.choice('oks', `f_s ≤ 0.4f_y = ${f(fsAll)} ksi?`, yesNo, c.fs <= fsAll ? 'y' : 'n')
  return {
    family: 'service',
    title: 'Service-load check of a USD beam',
    text: `A simply supported beam of span **${span} ft** (service DL **${sdl} k/ft** excluding self-weight, LL **${ll} k/ft**) was designed by USD as **${b} in × ${h} in** with **${bars!.n} #${bars!.bar}** at $d = ${f(d)}$ in (φMn ≥ Mu = ${f(lu.Mu, 1)} k-ft). $f'_c = ${fc}$ psi, $f_y = ${fy}$ psi, $f_r = 7.5\\sqrt{f'_c}$. (i) Find the cracking moment (uncracked transformed section). (ii) Check the concrete and steel stresses under the full service load against $0.45f'_c$ and $0.4f_y$.`,
    beam: { support: 'ss', span, udl: `DL ${sdl} k/ft (excl. self-wt) · LL ${ll} k/ft` },
    section: { b, h, rows: [{ d, n: bars!.n, db: BARS[+bars!.bar].d }], tag: `${bars!.n} #${bars!.bar}` },
    final: { b, h, rows: [{ d, n: bars!.n, db: BARS[+bars!.bar].d }], tag: `kd = ${f(c.kd, 2)} in` },
    steps: S.steps,
    sol: [
      { title: 'Uncracked section and Mcr', steps: u.steps },
      { title: 'Service moment', steps: [...s.steps, { t: 'Cracked?', tex: `M = ${f(s.M, 1)} ${s.M > u.Mcr ? '>' : '\\le'} M_{cr} = ${f(u.Mcr, 1)}\\text{ k-ft}${s.M > u.Mcr ? '\\Rightarrow\\text{ cracked section}' : ''}` }] },
      { title: 'Cracked section', steps: [...c.steps, ...c.stressSteps, { t: 'Allowables', tex: `f_c = ${f(c.fc)} ${c.fc <= al.fc ? '\\le' : '>'} 0.45f'_c = ${f(al.fc)}\\text{ ksi},\\quad f_s = ${f(c.fs)} ${c.fs <= fsAll ? '\\le' : '>'} 0.4f_y = ${f(fsAll)}\\text{ ksi}`, md: 'A USD beam is usually fine in the concrete; f_s at service is about 0.55–0.65 fy, so the 0.4fy (24 ksi) check often fails — the WSD/USD contrast the papers like to ask about.' }] },
    ] as SolSec[],
    answer: `Mcr = ${f(u.Mcr, 1)} k-ft; under M = ${f(s.M, 1)} k-ft: f_c = ${f(c.fc)} ksi (${c.fc <= al.fc ? 'OK' : 'exceeds'}), f_s = ${f(c.fs)} ksi (${c.fs <= fsAll ? 'OK' : 'exceeds 0.4fy'}).`,
  }
}

export function makeElasticDesign(seed: number, fam?: EFamily, diff: Diff = 'exam'): DProblem<EFamily> {
  const r = rng(seed)
  const which = fam ?? pick(r, E_FAMILIES.map((x) => x.v))
  if (which === 'wsd') return wsdFam(r, diff)
  if (which === 'wsdFixed') return wsdFixedFam(r, diff)
  return serviceFam(r, diff)
}
