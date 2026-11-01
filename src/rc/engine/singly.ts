// CE 315 singly reinforced rectangular beams by USD (Nilson Ch 4, ACI 318): review, design As, design b × d,
// bar selection and fit, beam loads → Mu, steel-ratio limits, and the loading-stage data (0 → Mcr → My → Mn).
// Inputs: lengths in in (spans in ft), areas in², f'c and fy in psi (like materials.ts). Outputs: ksi, k-ft.

import { AsMin, BARS, beta1, Ec, epsU, Es, GAMMA_RC, MM_BARS, phiFlex, rhoLimits } from './materials'
import { f, uncracked, type ElasticInput, type SolStep } from './elastic'

export type { SolStep }
export interface SteelLayer {
  As: number
  /** depth from the compression face */
  d: number
}

export function layersInfo(layers: SteelLayer[]) {
  const As = layers.reduce((s, l) => s + l.As, 0)
  const d = layers.reduce((s, l) => s + l.As * l.d, 0) / As
  const dt = Math.max(...layers.map((l) => l.d))
  return { As, d, dt }
}

export type Zone = 'tension' | 'transition' | 'compression'
export const zoneOf = (epsT: number, fy = 60000): Zone => (epsT >= 0.005 ? 'tension' : epsT > fy / 29e6 ? 'transition' : 'compression')
export const ZONE_LABEL: Record<Zone, string> = { tension: 'tension-controlled', transition: 'transition zone', compression: 'compression-controlled' }

/** ρ that gives a net tensile strain εt (singly, d = dt) */
export const rhoForEpsT = (fc: number, fy: number, epsT: number) => 0.85 * beta1(fc) * (fc / fy) * (epsU / (epsU + epsT))
/** εt for a steel ratio ρ (singly, d = dt) */
export const epsTForRho = (fc: number, fy: number, rho: number) => (epsU * 0.85 * beta1(fc) * fc) / (rho * fy) - epsU

/** φ with the class formula for Grade 60: 0.483 + 83.3εt in the transition zone */
export function phiSteps(epsT: number, fy = 60000): SolStep {
  const phi = phiFlex(epsT, fy)
  const z = zoneOf(epsT, fy)
  const tex =
    z === 'tension'
      ? `\\varepsilon_t = ${f(epsT, 5)} \\ge 0.005 \\Rightarrow \\text{tension-controlled},\\ \\phi = 0.90`
      : z === 'compression'
        ? `\\varepsilon_t = ${f(epsT, 5)} \\le \\varepsilon_y \\Rightarrow \\text{compression-controlled},\\ \\phi = 0.65`
        : fy === 60000
          ? `\\varepsilon_t = ${f(epsT, 5)}\\ (\\text{transition}):\\ \\phi = 0.483 + 83.3\\varepsilon_t = ${f(phi)}`
          : `\\varepsilon_t = ${f(epsT, 5)}\\ (\\text{transition}):\\ \\phi = 0.65 + 0.25\\frac{\\varepsilon_t - \\varepsilon_y}{0.005 - \\varepsilon_y} = ${f(phi)}`
  return { t: 'Strength reduction factor', tex, v: phi }
}

// ---------------------------------------------------------------- steel-ratio limits
export function limits(fc: number, fy: number) {
  const L = rhoLimits(fc, fy)
  const ey = fy / 29e6
  const k = `0.85(${f(L.b1, 3)})\\frac{${f(fc / 1000)}}{${f(fy / 1000)}}`
  const steps: SolStep[] = [
    { t: 'β₁', tex: `\\beta_1 = ${f(L.b1, 3)}`, md: fc <= 4000 ? "$f'_c \\le 4000$ psi → 0.85." : `$0.85 - 0.05(f'_c - 4000)/1000 \\ge 0.65$.`, v: L.b1 },
    { t: 'Balanced ratio', tex: `\\rho_b = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{\\varepsilon_u}{\\varepsilon_u + \\varepsilon_y} = ${k}\\frac{0.003}{0.003 + ${f(ey, 5)}} = ${f(L.rhoB, 4)}`, v: L.rhoB },
    { t: 'Maximum (εt = 0.004)', tex: `\\rho_{max} = \\rho_{0.004} = ${k}\\frac{0.003}{0.003 + 0.004} = ${f(L.rhoMax, 4)}`, v: L.rhoMax },
    { t: 'Tension-controlled (εt = 0.005)', tex: `\\rho_{0.005} = ${k}\\frac{0.003}{0.003 + 0.005} = ${f(L.rho005, 4)}`, v: L.rho005 },
    { t: 'Minimum', tex: `\\rho_{min} = \\frac{3\\sqrt{f'_c}}{f_y} \\ge \\frac{200}{f_y} = \\max\\left(\\frac{${f(3 * Math.sqrt(fc), 1)}}{${fy}},\\ \\frac{200}{${fy}}\\right) = ${f(L.rhoMin, 5)}`, v: L.rhoMin },
  ]
  return { ...L, epsY: ey, steps }
}

// ---------------------------------------------------------------- review
export interface SinglyInput {
  b: number
  h?: number
  fc: number
  fy: number
  layers: SteelLayer[]
}

export interface SinglyReview {
  As: number
  d: number
  dt: number
  b1: number
  rho: number
  a: number
  c: number
  cOverDt: number
  epsT: number
  /** strain at the steel centroid */
  epsS: number
  epsY: number
  yields: boolean
  /** ksi */
  fs: number
  phi: number
  zone: Zone
  /** k-ft */
  Mn: number
  phiMn: number
  AsMin: number
  minOk: boolean
  /** εt ≥ 0.004 (ρ ≤ ρmax) — permitted for a beam */
  maxOk: boolean
  lim: ReturnType<typeof limits>
  steps: SolStep[]
}

export function review(inp: SinglyInput): SinglyReview {
  const { b, fc, fy } = inp
  const { As, d, dt } = layersInfo(inp.layers)
  const fck = fc / 1000,
    fyk = fy / 1000
  const b1 = beta1(fc)
  const lim = limits(fc, fy)
  const ey = fy / 29e6
  const rho = As / (b * d)
  let a = (As * fyk) / (0.85 * fck * b)
  let c = a / b1
  let epsS = (epsU * (d - c)) / c
  const steps: SolStep[] = [
    { t: 'Steel', tex: `A_s = ${f(As)}\\text{ in}^2,\\ d = ${f(d)}\\text{ in}${dt !== d ? `,\\ d_t = ${f(dt)}\\text{ in}` : ''},\\ \\rho = \\frac{A_s}{bd} = ${f(rho, 4)}`, v: rho },
    { t: 'Stress block (assume fs = fy)', tex: `a = \\frac{A_sf_y}{0.85f'_cb} = \\frac{${f(As)}\\times${f(fyk)}}{0.85\\times${f(fck)}\\times${f(b)}} = ${f(a)}\\text{ in},\\quad c = \\frac{a}{\\beta_1} = \\frac{${f(a)}}{${f(b1, 3)}} = ${f(c)}\\text{ in}`, v: a, u: 'in' },
  ]
  let yields = epsS >= ey
  let fs = fyk
  if (yields) {
    steps.push({ t: 'Check yield', tex: `\\varepsilon_s = 0.003\\frac{d - c}{c} = 0.003\\frac{${f(d)} - ${f(c)}}{${f(c)}} = ${f(epsS, 5)} \\ge \\varepsilon_y = ${f(ey, 5)}\\ \\checkmark`, v: epsS })
  } else {
    // over-reinforced: 0.85 f'c b β1 c² + As Es εu c − As Es εu d = 0
    const A = 0.85 * fck * b * b1
    const B = As * 29000 * epsU
    const C = -B * d
    c = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A)
    a = b1 * c
    epsS = (epsU * (d - c)) / c
    fs = 29000 * epsS
    steps.push(
      { t: 'Check yield', tex: `\\varepsilon_s = ${f((epsU * (d - a / b1)) / (a / b1), 5)} < \\varepsilon_y = ${f(ey, 5)}\\ \\Rightarrow\\ \\text{steel does not yield (over-reinforced)}` },
      {
        t: 'Solve for c (fs = Es εs)',
        tex: `0.85f'_c b\\beta_1 c = A_s(87)\\frac{d - c}{c} \\Rightarrow ${f(A, 3)}c^2 + ${f(B, 3)}c - ${f(-C, 1)} = 0 \\Rightarrow c = ${f(c)}\\text{ in},\\ a = ${f(a)}\\text{ in},\\ f_s = ${f(fs, 2)}\\text{ ksi}`,
        v: c,
        u: 'in',
      },
    )
    yields = false
  }
  const epsT = (epsU * (dt - c)) / c
  const phiSt = phiSteps(epsT, fy)
  const phi = phiSt.v!
  const zone = zoneOf(epsT, fy)
  const Mn = yields ? (As * fyk * (d - a / 2)) / 12 : (0.85 * fck * a * b * (d - a / 2)) / 12
  const asMin = AsMin(fc, fy, b, d)
  steps.push(
    { t: 'Net tensile strain', tex: `\\varepsilon_t = 0.003\\frac{d_t - c}{c} = 0.003\\frac{${f(dt)} - ${f(c)}}{${f(c)}} = ${f(epsT, 5)},\\quad \\frac{c}{d_t} = ${f(c / dt)}`, v: epsT },
    phiSt,
    yields
      ? { t: 'Nominal moment', tex: `M_n = A_sf_y\\left(d - \\frac a2\\right) = ${f(As)}\\times${f(fyk)}\\left(${f(d)} - \\frac{${f(a)}}{2}\\right) = ${f(Mn * 12, 0)}\\text{ in-k} = ${f(Mn, 1)}\\text{ k-ft}`, v: Mn, u: 'k-ft' }
      : { t: 'Nominal moment', tex: `M_n = 0.85f'_c ab\\left(d - \\frac a2\\right) = ${f(Mn * 12, 0)}\\text{ in-k} = ${f(Mn, 1)}\\text{ k-ft}`, v: Mn, u: 'k-ft' },
    { t: 'Design strength', tex: `\\phi M_n = ${f(phi)}\\times${f(Mn, 1)} = ${f(phi * Mn, 1)}\\text{ k-ft}`, v: phi * Mn, u: 'k-ft' },
    { t: 'Minimum steel', tex: `A_{s,min} = \\frac{\\max(3\\sqrt{f'_c},200)}{f_y}bd = ${f(asMin)}\\text{ in}^2\\ ${As >= asMin ? '\\le' : '>'}\\ A_s = ${f(As)}\\ ${As >= asMin ? '\\checkmark' : '\\times'}`, v: asMin, u: 'in²' },
    { t: 'Maximum steel', tex: `\\varepsilon_t = ${f(epsT, 5)}\\ ${epsT >= 0.004 ? '\\ge' : '<'}\\ 0.004\\ \\ (\\rho ${rho <= lim.rhoMax ? '\\le' : '>'} \\rho_{max} = ${f(lim.rhoMax, 4)})\\ ${epsT >= 0.004 ? '\\checkmark' : '\\times\\text{ not permitted for a beam}'}` },
  )
  return { As, d, dt, b1, rho, a, c, cOverDt: c / dt, epsT, epsS, epsY: ey, yields, fs, phi, zone, Mn, phiMn: phi * Mn, AsMin: asMin, minOk: As >= asMin, maxOk: epsT >= 0.004, lim, steps }
}

// ---------------------------------------------------------------- design As for Mu (b, d known)
export interface DesignAs {
  Mu: number
  phi: number
  Rn: number
  rho: number
  AsCalc: number
  As: number
  AsMin: number
  governedByMin: boolean
  a: number
  c: number
  epsT: number
  /** ρ > ρmax: a singly reinforced section cannot work */
  needsComp: boolean
  /** handnote iteration on a (guess a = 0.2d) */
  iter: { a: number; As: number }[]
  lim: ReturnType<typeof limits>
  steps: SolStep[]
}

export function designAs(Mu: number, b: number, d: number, fc: number, fy: number, dt = d): DesignAs {
  const fck = fc / 1000,
    fyk = fy / 1000
  const b1 = beta1(fc)
  const lim = limits(fc, fy)
  let phi = 0.9
  let rho = NaN,
    Rn = NaN,
    As = NaN,
    a = NaN,
    c = NaN,
    epsT = NaN
  for (let i = 0; i < 30; i++) {
    Rn = (Mu * 12000) / (phi * b * d * d) // psi
    const disc = 1 - (2 * Rn) / (0.85 * fc)
    rho = disc < 0 ? NaN : ((0.85 * fc) / fy) * (1 - Math.sqrt(disc))
    As = rho * b * d
    a = (As * fyk) / (0.85 * fck * b)
    c = a / b1
    epsT = (epsU * (dt - c)) / c
    const p = phiFlex(epsT, fy)
    if (!Number.isFinite(p) || Math.abs(p - phi) < 1e-5) break
    phi = p
  }
  const needsComp = !Number.isFinite(rho) || epsT < 0.004
  const asMin = AsMin(fc, fy, b, d)
  const asUse = Number.isFinite(As) ? Math.max(As, asMin) : NaN
  // handnote iteration
  const iter: { a: number; As: number }[] = []
  let ai = 0.2 * d
  for (let i = 0; i < 4; i++) {
    const Asi = (Mu * 12) / (0.9 * fyk * (d - ai / 2))
    iter.push({ a: ai, As: Asi })
    ai = (Asi * fyk) / (0.85 * fck * b)
  }
  const steps: SolStep[] = [
    { t: 'Assume tension-controlled', tex: `\\phi = 0.90${phi !== 0.9 ? `\\ \\to\\ \\text{iterated: } \\phi = ${f(phi)}` : ''}` },
    { t: 'Required resistance', tex: `R_n = \\frac{M_u}{\\phi bd^2} = \\frac{${f(Mu * 12000, 0)}}{${f(phi)}\\times${f(b)}\\times${f(d)}^2} = ${f(Rn, 0)}\\text{ psi}`, v: Rn, u: 'psi' },
    Number.isFinite(rho)
      ? { t: 'Steel ratio', tex: `\\rho = \\frac{0.85f'_c}{f_y}\\left(1 - \\sqrt{1 - \\frac{2R_n}{0.85f'_c}}\\right) = \\frac{0.85(${fc})}{${fy}}\\left(1 - \\sqrt{1 - \\frac{2(${f(Rn, 0)})}{${f(0.85 * fc, 0)}}}\\right) = ${f(rho, 5)}`, v: rho }
      : { t: 'Steel ratio', md: `$2R_n > 0.85f'_c$: no singly reinforced solution — the section is too small; use compression steel (doubly reinforced) or a bigger section.` },
  ]
  if (Number.isFinite(rho)) {
    steps.push(
      { t: 'Steel area', tex: `A_s = \\rho bd = ${f(rho, 5)}\\times${f(b)}\\times${f(d)} = ${f(As)}\\text{ in}^2`, v: As, u: 'in²' },
      { t: 'Check limits', tex: `\\rho_{min} = ${f(lim.rhoMin, 5)}\\ ${rho >= lim.rhoMin ? '\\le' : '>'}\\ \\rho = ${f(rho, 5)}\\ ${rho <= lim.rhoMax ? '\\le' : '>'}\\ \\rho_{max} = ${f(lim.rhoMax, 4)}${rho <= lim.rho005 ? `\\ (\\le \\rho_{0.005} = ${f(lim.rho005, 4)}: \\phi = 0.9\\ \\checkmark)` : ''}`, md: needsComp ? '**ρ > ρmax → compression steel is needed (design as doubly reinforced).**' : As < asMin ? `Use $A_{s,min} = ${f(asMin)}$ in².` : undefined },
      { t: 'Check strain', tex: `a = ${f(a)}\\text{ in},\\ c = ${f(c)}\\text{ in},\\ \\varepsilon_t = 0.003\\frac{${f(dt)} - ${f(c)}}{${f(c)}} = ${f(epsT, 5)}`, v: epsT },
    )
  }
  return { Mu, phi, Rn, rho, AsCalc: As, As: asUse, AsMin: asMin, governedByMin: As < asMin, a, c, epsT, needsComp, iter, lim, steps }
}

// ---------------------------------------------------------------- design b × d for a chosen ρ
export function designSection(Mu: number, fc: number, fy: number, rho: number, opts: { b?: number; dOverB?: number; layers?: 1 | 2 } = {}) {
  const fck = fc / 1000,
    fyk = fy / 1000
  const epsT = epsTForRho(fc, fy, rho)
  const phi = phiFlex(epsT, fy)
  const Rn = rho * fyk * (1 - (0.59 * rho * fyk) / fck) // ksi
  const bd2 = (Mu * 12) / (phi * Rn)
  let b: number, d: number
  if (opts.b) {
    b = opts.b
    d = Math.sqrt(bd2 / b)
  } else {
    const r = opts.dOverB ?? 2
    b = Math.cbrt(bd2 / (r * r))
    d = r * b
  }
  const cov = opts.layers === 2 ? 3.5 : 2.5
  const h = Math.ceil(d + cov)
  const dAct = h - cov
  const As = rho * b * d
  const steps: SolStep[] = [
    { t: 'Chosen ρ', tex: `\\rho = ${f(rho, 5)}\\ \\Rightarrow\\ \\varepsilon_t = ${f(epsT, 5)},\\ \\phi = ${f(phi)}`, v: rho },
    { t: 'Resistance factor', tex: `R = \\rho f_y\\left(1 - 0.59\\frac{\\rho f_y}{f'_c}\\right) = ${f(rho, 5)}(${f(fyk)})\\left(1 - 0.59\\frac{${f(rho, 5)}(${f(fyk)})}{${f(fck)}}\\right) = ${f(Rn, 4)}\\text{ ksi}`, v: Rn, u: 'ksi' },
    { t: 'Required bd²', tex: `bd^2 = \\frac{M_u}{\\phi R} = \\frac{${f(Mu * 12, 0)}}{${f(phi)}\\times${f(Rn, 4)}} = ${f(bd2, 0)}\\text{ in}^3`, v: bd2, u: 'in³' },
    opts.b
      ? { t: 'Effective depth', tex: `d = \\sqrt{\\frac{${f(bd2, 0)}}{${f(b)}}} = ${f(d, 2)}\\text{ in}`, v: d, u: 'in' }
      : { t: 'Section', tex: `d = ${f(opts.dOverB ?? 2)}b \\Rightarrow b = \\sqrt[3]{\\frac{${f(bd2, 0)}}{${f((opts.dOverB ?? 2) ** 2)}}} = ${f(b, 2)}\\text{ in},\\ d = ${f(d, 2)}\\text{ in}`, v: d, u: 'in' },
    { t: 'Steel', tex: `A_s = \\rho bd = ${f(rho, 5)}\\times${f(b, 2)}\\times${f(d, 2)} = ${f(As)}\\text{ in}^2`, v: As, u: 'in²' },
    { t: 'Round the section', tex: `h = d + ${cov} = ${f(d + cov, 2)} \\to ${h}\\text{ in},\\ d = ${f(dAct)}\\text{ in}`, md: 'Round b and h up to whole inches (often even); then re-design As for the actual d.' },
  ]
  return { rho, epsT, phi, Rn, bd2, b, d, h, dAct, As, steps }
}

// ---------------------------------------------------------------- bars
export interface BarFit {
  n: number
  bar: number | string
  db: number
  As: number
  /** clear spacing provided (in) */
  clear: number
  /** clear spacing required = max(1 in, db) */
  req: number
  /** minimum width for one layer */
  bmin: number
  fits: boolean
}

export function barProps(bar: number | string) {
  if (typeof bar === 'string' && bar.endsWith('mm')) {
    const mm = parseInt(bar)
    return MM_BARS[mm]
  }
  return BARS[+bar]
}

/** one-layer fit: b ≥ 2(cover) + 2(stirrup) + n·db + (n − 1)·max(1, db) */
export function barFit(n: number, bar: number | string, b: number, opts: { cover?: number; stirrup?: number } = {}): BarFit {
  const p = barProps(bar)
  const cover = opts.cover ?? 1.5
  const ds = BARS[opts.stirrup ?? 3].d
  const req = Math.max(1, p.d)
  const clear = n > 1 ? (b - 2 * cover - 2 * ds - n * p.d) / (n - 1) : Infinity
  const bmin = 2 * cover + 2 * ds + n * p.d + (n - 1) * req
  return { n, bar, db: p.d, As: n * p.A, clear, req, bmin, fits: b >= bmin - 1e-9 }
}

/** candidate bar sets for As required: count per size and whether it fits in one layer (else two) */
export function barOptions(AsReq: number, b: number, sizes: (number | string)[] = [6, 7, 8, 9, 10, 11], opts: { cover?: number; stirrup?: number } = {}) {
  return sizes.map((bar) => {
    const p = barProps(bar)
    const n = Math.max(2, Math.ceil(AsReq / p.A - 1e-9))
    const one = barFit(n, bar, b, opts)
    const two = barFit(Math.ceil(n / 2), bar, b, opts)
    return { ...one, layers: one.fits ? 1 : two.fits ? 2 : 0, excess: one.As / AsReq - 1 }
  })
}

/** sensible pick: one layer, fewest bars ≥ 2 and least excess; else two layers */
export function pickBars(AsReq: number, b: number, opts: { cover?: number; stirrup?: number } = {}) {
  const opt = barOptions(AsReq, b, [6, 7, 8, 9, 10, 11], opts).filter((o) => o.layers > 0)
  const one = opt.filter((o) => o.layers === 1 && o.n >= 2 && o.n <= 6)
  const pool = one.length ? one : opt
  return pool.sort((x, y) => x.excess - y.excess)[0]
}

// ---------------------------------------------------------------- loads → Mu
export type Support = 'ss' | 'cant' | 'fixed'
export const SUPPORT_LABEL: Record<Support, string> = { ss: 'simply supported', cant: 'cantilever', fixed: 'fixed–fixed' }

export interface PointLoad {
  /** service dead / live (kip) — or factored total in `D` when `factored` */
  D: number
  L: number
  /** ft from the left support (SS / fixed) or from the fixed support (cantilever) */
  x: number
}

export interface LoadInput {
  span: number
  support: Support
  /** section for self-weight (in); omit to skip self-weight */
  b?: number
  h?: number
  /** superimposed service dead load (k/ft), excluding self-weight */
  sdl: number
  ll: number
  points?: PointLoad[]
  /** loads in the question are already factored: wu = sdl + ll, Pu = D + L */
  factored?: boolean
  fD?: number
  fL?: number
}

export function beamLoads(inp: LoadInput) {
  const fD = inp.fD ?? 1.2,
    fL = inp.fL ?? 1.6
  const L = inp.span
  const sw = inp.b && inp.h ? ((inp.b * inp.h) / 144) * (GAMMA_RC / 1000) : 0
  const wD = inp.sdl + sw
  const wL = inp.ll
  const fac = (D: number, Lv: number) => (inp.factored ? D + Lv : Math.max(fD * D + fL * Lv, 1.4 * D))
  const wu = fac(wD, wL)
  const pts = (inp.points ?? []).map((p) => ({ ...p, Pu: fac(p.D, p.L) }))
  let Mu = 0,
    MuNeg = 0,
    MuPos = 0,
    Vu = 0,
    xMax = 0
  if (inp.support === 'cant') {
    MuNeg = (wu * L * L) / 2 + pts.reduce((s, p) => s + p.Pu * p.x, 0)
    Mu = MuNeg
    Vu = wu * L + pts.reduce((s, p) => s + p.Pu, 0)
  } else {
    // simply supported moment diagram M0(x)
    const RA = (wu * L) / 2 + pts.reduce((s, p) => s + (p.Pu * (L - p.x)) / L, 0)
    const RB = wu * L + pts.reduce((s, p) => s + p.Pu, 0) - RA
    const M0 = (x: number) => RA * x - (wu * x * x) / 2 - pts.reduce((s, p) => s + (x > p.x ? p.Pu * (x - p.x) : 0), 0)
    let MA = 0,
      MB = 0
    if (inp.support === 'fixed') {
      MA = (wu * L * L) / 12 + pts.reduce((s, p) => s + (p.Pu * p.x * (L - p.x) ** 2) / L ** 2, 0)
      MB = (wu * L * L) / 12 + pts.reduce((s, p) => s + (p.Pu * p.x ** 2 * (L - p.x)) / L ** 2, 0)
    }
    for (let i = 0; i <= 600; i++) {
      const x = (L * i) / 600
      const m = M0(x) - MA - ((MB - MA) * x) / L
      if (m > MuPos) {
        MuPos = m
        xMax = x
      }
    }
    MuNeg = Math.max(MA, MB)
    Mu = Math.max(MuPos, MuNeg)
    Vu = Math.max(RA, RB)
  }
  const steps: SolStep[] = []
  if (sw) steps.push({ t: 'Self-weight', tex: `w_{sw} = \\frac{${f(inp.b!)}\\times${f(inp.h!)}}{144}\\times0.150 = ${f(sw)}\\text{ k/ft}`, v: sw, u: 'k/ft' })
  steps.push(
    inp.factored
      ? { t: 'Factored load (given factored)', tex: `w_u = ${f(inp.sdl)} + ${f(inp.ll)} = ${f(wu)}\\text{ k/ft}`, v: wu, u: 'k/ft' }
      : {
          t: 'Factored load',
          tex: `w_u = ${fD}D + ${fL}L = ${fD}(${f(wD)}) + ${fL}(${f(wL)}) = ${f(fD * wD + fL * wL)}\\text{ k/ft}${1.4 * wD > fD * wD + fL * wL ? `\\ <\\ 1.4D = ${f(1.4 * wD)}` : `\\ \\ (\\ge 1.4D = ${f(1.4 * wD)})`}`,
          v: wu,
          u: 'k/ft',
        },
  )
  if (pts.length) steps.push({ t: 'Point loads', tex: pts.map((p) => `P_u = ${inp.factored ? `${f(p.D + p.L)}` : `${fD}(${f(p.D)}) + ${fL}(${f(p.L)}) = ${f(p.Pu)}`}\\text{ k at } x = ${f(p.x)}\\text{ ft}`).join(',\\quad ') })
  if (inp.support === 'ss')
    steps.push({
      t: 'Design moment',
      tex: pts.length ? `M_u = ${f(MuPos, 1)}\\text{ k-ft at } x = ${f(xMax, 2)}\\text{ ft}` : `M_u = \\frac{w_uL^2}{8} = \\frac{${f(wu)}\\times${f(L)}^2}{8} = ${f(Mu, 1)}\\text{ k-ft}`,
      md: pts.length === 1 && Math.abs(pts[0].x - L / 2) < 1e-9 ? `$= w_uL^2/8 + P_uL/4 = ${f((wu * L * L) / 8, 1)} + ${f((pts[0].Pu * L) / 4, 1)}$` : undefined,
      v: Mu,
      u: 'k-ft',
    })
  else if (inp.support === 'cant') steps.push({ t: 'Design moment (support)', tex: `M_u = \\frac{w_uL^2}{2}${pts.length ? ' + \\sum P_u x' : ''} = ${f(Mu, 1)}\\text{ k-ft}`, v: Mu, u: 'k-ft', md: 'Tension at the **top**: the steel goes at the top, d measured from the bottom face.' })
  else steps.push({ t: 'Design moments', tex: `M_u^- = ${pts.length ? '' : `\\frac{w_uL^2}{12} = `}${f(MuNeg, 1)}\\text{ k-ft (supports)},\\quad M_u^+ = ${pts.length ? '' : `\\frac{w_uL^2}{24} = `}${f(MuPos, 1)}\\text{ k-ft (span)}`, v: Mu, u: 'k-ft' })
  return { sw, wD, wL, wu, pts, Mu, MuPos, MuNeg, Vu, steps }
}

// ---------------------------------------------------------------- loading stages (0 → Mcr → My → Mn)
export type Stage = 'uncracked' | 'cracked' | 'inelastic' | 'yielded' | 'ultimate'
export const STAGE_LABEL: Record<Stage, string> = {
  uncracked: 'Uncracked, elastic',
  cracked: 'Cracked, elastic (service)',
  inelastic: 'Cracked, concrete non-linear',
  yielded: 'Steel yielded',
  ultimate: 'Ultimate: εc = 0.003',
}

export interface StagePoint {
  epsTop: number
  c: number
  M: number
  epsS: number
  fs: number
  fcTop: number
}

export interface StageInput extends ElasticInput {
  fy: number
}

/** Hognestad parabola (peak f'c at ε0 = 2f'c/Ec) with a linear descent to 0.85f'c at 0.0038 — ksi */
export function concreteStress(eps: number, fcPsi: number, EcPsi = Ec(fcPsi)) {
  const fck = fcPsi / 1000
  const e0 = (2 * fcPsi) / EcPsi
  if (eps <= 0) return 0
  if (eps <= e0) return fck * (2 * (eps / e0) - (eps / e0) ** 2)
  return fck * (1 - (0.15 * (eps - e0)) / (0.0038 - e0))
}

function crackedState(inp: StageInput, epsTop: number) {
  const { b, d, As, fc, fy } = inp
  const Asp = inp.Asp ?? 0,
    dp = inp.dp ?? 2.5
  const fyk = fy / 1000
  const E = inp.EcPsi ?? Ec(fc)
  const N = 48
  const forces = (c: number) => {
    let C = 0,
      Mt = 0
    for (let i = 0; i < N; i++) {
      const y = ((i + 0.5) * c) / N
      const s = concreteStress((epsTop * (c - y)) / c, fc, E)
      C += (s * b * c) / N
      Mt += (s * b * c * y) / N
    }
    const esp = (epsTop * (c - dp)) / c
    const Cs = Asp * Math.max(-fyk, Math.min(fyk, 29000 * esp))
    const es = (epsTop * (d - c)) / c
    const fs = Math.min(fyk, 29000 * es)
    return { C, Mt, Cs, T: As * fs, es, fs }
  }
  let lo = 1e-4,
    hi = d
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2
    const r = forces(mid)
    if (r.C + r.Cs - r.T > 0) hi = mid
    else lo = mid
  }
  const c = (lo + hi) / 2
  const r = forces(c)
  const M = (r.T * d - r.Mt - r.Cs * dp) / 12
  return { epsTop, c, M, epsS: r.es, fs: r.fs, fcTop: concreteStress(epsTop, fc, E) }
}

export function stagesData(inp: StageInput) {
  const u = uncracked(inp)
  const pts: StagePoint[] = []
  for (let i = 1; i <= 150; i++) pts.push(crackedState(inp, (0.003 * i) / 150))
  const ey = inp.fy / 29e6
  const yi = pts.findIndex((p) => p.epsS >= ey)
  let My: number | null = null
  if (yi > 0) {
    const p0 = pts[yi - 1],
      p1 = pts[yi]
    My = p0.M + ((p1.M - p0.M) * (ey - p0.epsS)) / (p1.epsS - p0.epsS)
  }
  const Mmax = Math.max(...pts.map((p) => p.M))
  const rv = review({ b: inp.b, fc: inp.fc, fy: inp.fy, layers: [{ As: inp.As, d: inp.d }] })
  return { u, pts, My, Mmax, Mult: pts[pts.length - 1].M, Mn: rv.Mn, rv, ey }
}

export interface StageAt {
  stage: Stage
  M: number
  /** neutral axis depth from top */
  na: number
  epsTop: number
  /** concrete strain at the bottom face (+ tension) */
  epsBot: number
  epsS: number
  fcTop: number
  /** concrete tension at the bottom (uncracked only), ksi */
  fct: number
  fs: number
  /** compression-zone stress profile [depth from top, ksi] */
  profile: [number, number][]
}

export function stageAt(data: ReturnType<typeof stagesData>, inp: StageInput, M: number): StageAt {
  const { u } = data
  const E = inp.EcPsi ?? Ec(inp.fc)
  if (M <= u.Mcr) {
    const Mi = M * 12000
    const fcTop = (Mi * u.ybar) / u.I / 1000
    const fct = (Mi * u.yt) / u.I / 1000
    const fs = (u.n * Mi * (inp.d - u.ybar)) / u.I / 1000
    return { stage: 'uncracked', M, na: u.ybar, epsTop: (fcTop * 1000) / E, epsBot: (fct * 1000) / E, epsS: (fs * 1000) / Es, fcTop, fct, fs, profile: [[0, fcTop], [u.ybar, 0], [inp.h, -fct]] }
  }
  const pts = data.pts
  let p: StagePoint = pts[pts.length - 1]
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].M >= M) {
      if (i === 0) {
        p = pts[0]
        break
      }
      const a = pts[i - 1],
        b = pts[i]
      const t = (M - a.M) / (b.M - a.M)
      const lerp = (x: number, y: number) => x + (y - x) * t
      p = { epsTop: lerp(a.epsTop, b.epsTop), c: lerp(a.c, b.c), M, epsS: lerp(a.epsS, b.epsS), fs: lerp(a.fs, b.fs), fcTop: lerp(a.fcTop, b.fcTop) }
      break
    }
  }
  const prof: [number, number][] = []
  for (let i = 0; i <= 16; i++) {
    const y = (p.c * i) / 16
    prof.push([y, concreteStress((p.epsTop * (p.c - y)) / p.c, inp.fc, E)])
  }
  const ey = data.ey
  const stage: Stage = p.epsTop >= 0.003 - 1e-6 ? 'ultimate' : p.epsS >= ey - 1e-9 ? 'yielded' : p.fcTop > (0.5 * inp.fc) / 1000 ? 'inelastic' : 'cracked'
  return { stage, M: p.M, na: p.c, epsTop: p.epsTop, epsBot: (p.epsTop * (inp.h - p.c)) / p.c, epsS: p.epsS, fcTop: p.fcTop, fct: 0, fs: p.fs, profile: prof }
}
