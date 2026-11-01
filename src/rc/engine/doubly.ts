// CE 315 — doubly reinforced rectangular beams (USD, ACI 318 / Nilson + Hassoun as taught in class).
// Units: in, kip, ksi. f'c and fy are given in **ksi** here (materials.ts helpers take psi, converted inside).
// Moments: Mn in kip-in, φMn / Mu in kip-ft (the class's habit: compute in k-in, quote k-ft).
//
// Class method (Ch 4 slides, Nilson Ex 3.12 / Hassoun Ex 3.10 / Nilson Ex 3.13 handnotes):
//  - review: assume A's yields → a = (As − A's)fy / 0.85f'c b, c = a/β1, ε's = 0.003(c − d')/c.
//    Equivalent to the ρ ≥ ρ̄cy test, ρ̄cy = 0.85β1 (f'c/fy)(d'/d) εu/(εu − εy) + ρ'.
//    If it does not yield: As fy = 0.85f'c β1 b c + A's(Es εu (c − d')/c − 0.85f'c) → quadratic in c
//    (the handnotes subtract the displaced concrete 0.85f'c·A's in this branch only).
//  - Mn = Cc(d − a/2) + Cs(d − d'), εt at dt (extreme layer), φ from εt.
//  - design with b × h fixed: As1 = ρ0.005·b·d (the handnotes use d), φMn1; φMn2 = Mu − φMn1;
//    A's = Mn2 / f's(d − d'), As2 = A's f's / fy, As = As1 + As2; pick bars; review the provided section.

import { BARS, beta1, epsU, phiFlex, rhoLimits } from './materials'

export const ES_KSI = 29000
/** Es·εu = 87 ksi */
export const ESU = ES_KSI * epsU

export type Displaced = 'class' | 'always' | 'never'
export type Zone = 'tension' | 'transition' | 'compression'

export const zoneOf = (epsT: number, fy: number): Zone => (epsT >= 0.005 ? 'tension' : epsT > fy / ES_KSI ? 'transition' : 'compression')
export const phiOf = (epsT: number, fy: number) => phiFlex(epsT, fy * 1000)

export interface DoublyReviewIn {
  b: number
  /** depth to the centroid of the tension steel */
  d: number
  /** depth to the extreme tension layer (defaults to d) */
  dt?: number
  /** d′: depth to the compression steel centroid */
  dp: number
  As: number
  /** A′s */
  Asp: number
  fc: number
  fy: number
  /** subtract the displaced concrete 0.85f'c·A′s: 'class' = only when A′s has not yielded (handnotes), default */
  displaced?: Displaced
}

export interface DoublyReview {
  b1: number
  ey: number
  rho: number
  rhoP: number
  /** ρ̄cy: minimum ρ for A′s to yield */
  rhoCy: number
  rhoMax: number
  rhoMin: number
  /** trial assuming both steels yield */
  trial: { a: number; c: number; epsSp: number }
  compYields: boolean
  tensionYields: boolean
  method: 'both-yield' | 'quadratic' | 'general'
  /** A c² + B c + C = 0 (kip, in), only for the quadratic branch */
  quad?: { A: number; B: number; C: number }
  /** displaced concrete was subtracted */
  dispUsed: boolean
  c: number
  a: number
  epsSp: number
  /** f′s (ksi, ≤ fy) */
  fsp: number
  /** stress in the tension steel (= fy unless over-reinforced) */
  fs: number
  epsS: number
  Cc: number
  Cs: number
  T: number
  epsT: number
  cdt: number
  phi: number
  zone: Zone
  /** k-in */
  Mn: number
  /** k-ft */
  MnFt: number
  /** k-ft */
  phiMn: number
  /** ρ − ρ′ f′s/fy (class check against ρmax) */
  rhoBar: number
  /** εt ≥ 0.004 */
  ductileOk: boolean
}

export function reviewDoubly(p: DoublyReviewIn): DoublyReview {
  const { b, d, dp, As, Asp, fc, fy } = p
  const dt = p.dt ?? d
  const disp = p.displaced ?? 'class'
  const b1 = beta1(fc * 1000)
  const ey = fy / ES_KSI
  const lim = rhoLimits(fc * 1000, fy * 1000)
  const rho = As / (b * d)
  const rhoP = Asp / (b * d)
  const rhoCy = 0.85 * b1 * (fc / fy) * (dp / d) * (epsU / (epsU - ey)) + rhoP
  const k = 0.85 * fc
  // trial: both steels yield (no displaced concrete, as the class's ρ̄cy test)
  const aT = ((As - Asp) * fy) / (k * b)
  const cT = aT / b1
  const epsSpT = cT > 0 ? (epsU * (cT - dp)) / cT : -Infinity
  const compYields = Asp <= 0 || epsSpT >= ey - 1e-12
  let c: number
  let fsp: number
  let method: DoublyReview['method']
  let quad: DoublyReview['quad']
  let dispUsed = false
  if (compYields) {
    dispUsed = disp === 'always' && Asp > 0
    c = (As * fy - Asp * (fy - (dispUsed ? k : 0))) / (k * b * b1)
    fsp = fy
    method = 'both-yield'
  } else {
    dispUsed = disp !== 'never'
    const A = k * b1 * b
    const B = Asp * ESU - As * fy - (dispUsed ? k * Asp : 0)
    const C = -Asp * ESU * dp
    c = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A)
    fsp = Math.min(fy, (ESU * (c - dp)) / c)
    method = 'quadratic'
    quad = { A, B, C }
  }
  let epsS = (epsU * (d - c)) / c
  let fs = fy
  if (epsS < ey) {
    // tension steel has not yielded: general strain compatibility (bisection on c)
    method = 'general'
    quad = undefined
    const forces = (cc: number) => {
      const fspc = Math.max(-fy, Math.min(fy, (ESU * (cc - dp)) / cc))
      const del = disp === 'always' || (disp === 'class' && fspc < fy) ? (b1 * cc > dp ? k : 0) : 0
      const fsc = Math.min(fy, (ESU * (d - cc)) / cc)
      return { fspc, del, fsc, net: k * b * b1 * cc + Asp * (fspc - del) - As * fsc }
    }
    let lo = 1e-4
    let hi = 3 * d
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2
      if (forces(mid).net > 0) hi = mid
      else lo = mid
    }
    c = (lo + hi) / 2
    const f = forces(c)
    fsp = f.fspc
    fs = f.fsc
    dispUsed = f.del > 0 && Asp > 0
    epsS = (epsU * (d - c)) / c
  }
  const a = b1 * c
  const epsSp = (epsU * (c - dp)) / c
  const Cc = k * a * b
  const Cs = Asp * (fsp - (dispUsed ? k : 0))
  const T = As * fs
  const Mn = Cc * (d - a / 2) + Cs * (d - dp)
  const epsT = (epsU * (dt - c)) / c
  const phi = phiOf(epsT, fy)
  return {
    b1,
    ey,
    rho,
    rhoP,
    rhoCy,
    rhoMax: lim.rhoMax,
    rhoMin: lim.rhoMin,
    trial: { a: aT, c: cT, epsSp: epsSpT },
    compYields: method === 'general' ? fsp >= fy : compYields,
    tensionYields: fs >= fy,
    method,
    quad,
    dispUsed,
    c,
    a,
    epsSp,
    fsp,
    fs,
    epsS,
    Cc,
    Cs,
    T,
    epsT,
    cdt: c / dt,
    phi,
    zone: zoneOf(epsT, fy),
    Mn,
    MnFt: Mn / 12,
    phiMn: (phi * Mn) / 12,
    rhoBar: rho - (rhoP * fsp) / fy,
    ductileOk: epsT >= 0.004 - 1e-9,
  }
}

// ---------------------------------------------------------------- is compression steel needed?

export type LimitBasis = 'rho-d' | 'c-dt'

export interface SinglyMax {
  basis: LimitBasis
  /** ρ0.005 (from d) */
  rho005: number
  As1: number
  a: number
  c: number
  epsT: number
  phi: number
  /** k-in */
  Mn1: number
  /** k-ft */
  phiMn1: number
}

/**
 * Largest singly reinforced capacity with φ = 0.9 (tension-controlled limit).
 * 'rho-d' (class handnotes): As1 = ρ0.005·b·d.  'c-dt': c = 0.375·dt exactly (εt = 0.005 at the extreme layer).
 */
export function singlyMax(b: number, d: number, dt: number, fc: number, fy: number, basis: LimitBasis = 'rho-d'): SinglyMax {
  const b1 = beta1(fc * 1000)
  const rho005 = rhoLimits(fc * 1000, fy * 1000).rho005
  let As1: number, a: number, c: number
  if (basis === 'rho-d') {
    As1 = rho005 * b * d
    a = (As1 * fy) / (0.85 * fc * b)
    c = a / b1
  } else {
    c = (epsU / (epsU + 0.005)) * dt
    a = b1 * c
    As1 = (0.85 * fc * a * b) / fy
  }
  const epsT = (epsU * (dt - c)) / c
  const phi = phiOf(epsT, fy)
  const Mn1 = As1 * fy * (d - a / 2)
  return { basis, rho005, As1, a, c, epsT, phi, Mn1, phiMn1: (phi * Mn1) / 12 }
}

/** As for a singly reinforced rectangle at a given φ (exact solution of Mn = As fy (d − As fy / 1.7f'c b)); NaN if impossible */
export function singlyAs(MuFt: number, b: number, d: number, fc: number, fy: number, phi = 0.9) {
  const Mn = (MuFt * 12) / phi
  const k = fy / (1.7 * fc * b)
  const disc = d * d - (4 * k * Mn) / fy
  return disc < 0 ? NaN : (d - Math.sqrt(disc)) / (2 * k)
}

// ---------------------------------------------------------------- bars

/** bars that fit in one layer: 1.5 in cover + #3 stirrup each side, clear spacing max(1 in, db) */
export function maxPerLayer(b: number, no: number, cover = 1.5, stirrup = 0.375) {
  const db = BARS[no].d
  const s = Math.max(1, db)
  return Math.max(1, Math.floor((b - 2 * (cover + stirrup) + s) / (db + s)))
}

export interface BarPick {
  n: number
  no: number
  A: number
  layers: number
}

/** smallest bar size from `sizes` whose count fits in `layers` layers, preferring ≤ `prefMax` bars (then ≤ 10) */
export function pickBars(Areq: number, b: number, sizes = [8, 9, 10, 11], layers = 2, minN = 2, prefMax = layers === 1 ? 4 : 8): BarPick {
  for (const no of sizes) {
    const n = Math.max(minN, Math.ceil(Areq / BARS[no].A - 1e-9))
    const per = maxPerLayer(b, no)
    if (n <= per * layers && n <= prefMax) return { n, no, A: n * BARS[no].A, layers: Math.ceil(n / per) }
  }
  for (const no of [...sizes].reverse()) {
    const n = Math.max(minN, Math.ceil(Areq / BARS[no].A - 1e-9))
    const per = maxPerLayer(b, no)
    if (n <= per * layers && n <= 10) return { n, no, A: n * BARS[no].A, layers: Math.ceil(n / per) }
  }
  const no = sizes[sizes.length - 1]
  const n = Math.max(minN, Math.ceil(Areq / BARS[no].A - 1e-9))
  return { n, no, A: n * BARS[no].A, layers: Math.ceil(n / maxPerLayer(b, no)) }
}

/** bars of one given size */
export function barsOf(Areq: number, no: number, minN = 2): BarPick {
  const n = Math.max(minN, Math.ceil(Areq / BARS[no].A - 1e-9))
  return { n, no, A: n * BARS[no].A, layers: 1 }
}

// ---------------------------------------------------------------- design, b × h fixed

export interface DoublyDesignIn {
  b: number
  d: number
  dt: number
  dp: number
  fc: number
  fy: number
  /** factored moment, k-ft */
  Mu: number
  basis?: LimitBasis
  /** 'strain' (default): f′s from the strain at c of the singly part; 'assume-yield': f′s = fy (handnote shortcut, checked later) */
  fsMode?: 'strain' | 'assume-yield'
  /** bar sizes; omitted → smallest that fits (tension in ≤ 2 layers) */
  tBar?: number
  cBar?: number
  displaced?: Displaced
}

export interface DoublyDesign {
  sm: SinglyMax
  needed: boolean
  /** singly design when compression steel is not needed */
  singly?: { As: number; review: DoublyReview }
  /** k-ft */
  phiMn2: number
  /** k-in */
  Mn2: number
  epsSp: number
  compYields: boolean
  /** f′s used to size A′s */
  fsp: number
  Asp: number
  As2: number
  As: number
  tension: BarPick
  comp: BarPick | null
  /** compression bars added after the first choice failed the review */
  bumped: number
  review: DoublyReview
  ok: boolean
}

export function designDoubly(p: DoublyDesignIn): DoublyDesign {
  const { b, d, dt, dp, fc, fy, Mu } = p
  const sm = singlyMax(b, d, dt, fc, fy, p.basis ?? 'rho-d')
  const ey = fy / ES_KSI
  if (Mu <= sm.phiMn1) {
    // singly reinforced is enough (φ = 0.9 assumed; εt checked in the review)
    const As = singlyAs(Mu, b, d, fc, fy)
    const tension = p.tBar ? barsOf(As, p.tBar) : pickBars(As, b)
    const review = reviewDoubly({ b, d, dt, dp, As: tension.A, Asp: 0, fc, fy, displaced: p.displaced })
    return {
      sm,
      needed: false,
      singly: { As, review },
      phiMn2: 0,
      Mn2: 0,
      epsSp: NaN,
      compYields: true,
      fsp: fy,
      Asp: 0,
      As2: 0,
      As,
      tension,
      comp: null,
      bumped: 0,
      review,
      ok: review.phiMn >= Mu * 0.999 && review.ductileOk,
    }
  }
  const phiMn2 = Mu - sm.phiMn1
  const Mn2 = (phiMn2 * 12) / 0.9
  const epsSp = (epsU * (sm.c - dp)) / sm.c
  const compYields = epsSp >= ey
  const fsp = p.fsMode === 'assume-yield' ? fy : Math.min(fy, ES_KSI * epsSp)
  const Asp = Mn2 / (fsp * (d - dp))
  const As2 = (Asp * fsp) / fy
  const As = sm.As1 + As2
  const tension = p.tBar ? barsOf(As, p.tBar) : pickBars(As, b)
  const comp = { ...(p.cBar ? barsOf(Asp, p.cBar) : pickBars(Asp, b, [5, 6, 7, 8, 9, 10], 1)) }
  let review = reviewDoubly({ b, d, dt, dp, As: tension.A, Asp: comp.A, fc, fy, displaced: p.displaced })
  // the review subtracts the displaced concrete and uses φ from εt: if the first choice falls short, add compression bars
  let bumped = 0
  while ((review.phiMn < Mu * 0.999 || !review.ductileOk) && bumped < 6) {
    comp.n += 1
    comp.A = comp.n * BARS[comp.no].A
    bumped++
    review = reviewDoubly({ b, d, dt, dp, As: tension.A, Asp: comp.A, fc, fy, displaced: p.displaced })
  }
  return { sm, needed: true, phiMn2, Mn2, epsSp, compYields, fsp, Asp, As2, As, tension, comp, bumped, review, ok: review.phiMn >= Mu * 0.999 && review.ductileOk }
}

/** Table 3.2 (Nilson): minimum d for A′s to yield, for d′ and εt (fy in ksi) */
export function minDepthForYield(dp: number, fy: number, epsT = 0.004) {
  const ey = fy / ES_KSI
  // c = εu d′/(εu − εy) must be ≤ εu dt/(εu + εt) → d ≥ d′ (εu + εt)/(εu − εy)
  const ratio = (epsU - ey) / (epsU + epsT)
  return { maxRatio: ratio, dMin: dp / ratio }
}
