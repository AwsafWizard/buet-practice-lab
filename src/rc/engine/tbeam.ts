// CE 315 — T- and L-beams (USD + the WSD T-beam formulas of the older papers), floor-system helper.
// Units: in, kip, ksi (f'c, fy in ksi), spans in ft, Mu in k-ft, Mn in k-in.
//
// Class method (Ch 4 slides, Nilson Ex 3.14 / 3.15 / 4.15, class T-beam floor problem):
//  - beff: interior min(16hf + bw, span/4 [+ bw in the 15th-ed deck], c/c spacing); edge (slab one side)
//    min(bw + span/12, bw + 6hf, bw + ½ clear distance); isolated hf ≥ bw/2, b ≤ 4bw.
//  - review: a = As fy / 0.85f'c beff ≤ hf → rectangular with beff; else Asf = 0.85f'c(beff − bw)hf/fy,
//    a = (As − Asf)fy / 0.85f'c bw, Mn = Asf fy(d − hf/2) + (As − Asf)fy(d − a/2).
//  - design: trial a = hf → As = Mu/φfy(d − hf/2), check a; true T: φMn1 from Asf, φMn2 = Mu − φMn1 → As − Asf.
//  - support (−M): flange in tension → rectangle bw × d (two layers: d to centroid, dt to extreme layer).

import { beta1, epsU, GAMMA_RC, rhoLimits, wu as wuOf } from './materials'
import { ES_KSI, ESU, phiOf, zoneOf, type Zone } from './doubly'

// ---------------------------------------------------------------- effective flange width

export type FlangeKind = 'interior' | 'edge' | 'isolated'
/** 'aci14' = Nilson 15th ed / ACI 318-14 (overhang ≤ ln/8 each side → bw + L/4), 'aci08' = 14th ed slides (b ≤ L/4) */
export type FlangeRule = 'aci14' | 'aci08'

export interface BeffIn {
  kind: FlangeKind
  /** span (ft) */
  L: number
  bw: number
  hf: number
  /** centre-to-centre distance to the next beam (in); clear distance = cc − bw */
  cc?: number
  rule?: FlangeRule
  /** isolated beam: the actual flange width (in) */
  bActual?: number
}

export interface BeffOut {
  b: number
  cands: { key: string; label: string; value: number }[]
  governs: string
  /** isolated-beam checks */
  isolatedOk?: { hf: boolean; b: boolean }
}

export function effectiveWidth(p: BeffIn): BeffOut {
  const { kind, L, bw, hf } = p
  const rule = p.rule ?? 'aci14'
  const Lin = L * 12
  const cands: BeffOut['cands'] = []
  if (kind === 'interior') {
    cands.push({ key: '16hf', label: '16h_f + b_w', value: 16 * hf + bw })
    cands.push(rule === 'aci14' ? { key: 'L4', label: 'L/4 + b_w', value: Lin / 4 + bw } : { key: 'L4', label: 'L/4', value: Lin / 4 })
    if (p.cc) cands.push({ key: 'cc', label: 'c/c spacing', value: p.cc })
  } else if (kind === 'edge') {
    cands.push({ key: '6hf', label: '6h_f + b_w', value: 6 * hf + bw })
    cands.push({ key: 'L12', label: 'L/12 + b_w', value: Lin / 12 + bw })
    if (p.cc) cands.push({ key: 'half', label: '½ clear + b_w', value: (p.cc - bw) / 2 + bw })
  } else {
    cands.push({ key: '4bw', label: '4b_w', value: 4 * bw })
    if (p.bActual) cands.push({ key: 'act', label: 'actual flange', value: p.bActual })
  }
  let best = cands[0]
  for (const c of cands) if (c.value < best.value) best = c
  return {
    b: best.value,
    cands,
    governs: best.key,
    isolatedOk: kind === 'isolated' ? { hf: hf >= bw / 2, b: (p.bActual ?? 4 * bw) <= 4 * bw } : undefined,
  }
}

// ---------------------------------------------------------------- rectangular helpers (kept local on purpose)

export interface RectReview {
  b1: number
  a: number
  c: number
  epsS: number
  tensionYields: boolean
  fs: number
  epsT: number
  cdt: number
  phi: number
  zone: Zone
  /** k-in */
  Mn: number
  /** k-ft */
  phiMn: number
  AsMin: number
  rho: number
  rhoMax: number
}

const asMin = (fc: number, fy: number, bw: number, d: number) => (Math.max(3 * Math.sqrt(fc * 1000), 200) * bw * d) / (fy * 1000)

/** singly reinforced rectangle (b × d) review; over-reinforced sections solved by strain compatibility */
export function reviewRect(b: number, d: number, dt: number, As: number, fc: number, fy: number): RectReview {
  const b1 = beta1(fc * 1000)
  let a = (As * fy) / (0.85 * fc * b)
  let c = a / b1
  let fs = fy
  if ((epsU * (d - c)) / c < fy / ES_KSI) {
    // 0.85f'c β1 b c² + As Es εu c − As Es εu d = 0
    const A = 0.85 * fc * b1 * b
    const B = As * ESU
    const C = -As * ESU * d
    c = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A)
    a = b1 * c
    fs = (ESU * (d - c)) / c
  }
  const epsS = (epsU * (d - c)) / c
  const epsT = (epsU * (dt - c)) / c
  const phi = phiOf(epsT, fy)
  const Mn = As * fs * (d - a / 2)
  return {
    b1,
    a,
    c,
    epsS,
    tensionYields: fs >= fy - 1e-9,
    fs,
    epsT,
    cdt: c / dt,
    phi,
    zone: zoneOf(epsT, fy),
    Mn,
    phiMn: (phi * Mn) / 12,
    AsMin: asMin(fc, fy, b, d),
    rho: As / (b * d),
    rhoMax: rhoLimits(fc * 1000, fy * 1000).rhoMax,
  }
}

export interface RectDesign {
  As: number
  phi: number
  /** class-style trial values (a from the converged As) */
  a: number
  c: number
  epsT: number
  AsMin: number
  /** NaN As → section too small */
  possible: boolean
  /** εt < 0.004: needs compression steel or a bigger section */
  tooHeavy: boolean
}

const asFor = (Mn: number, b: number, d: number, fc: number, fy: number) => {
  const k = fy / (1.7 * fc * b)
  const disc = d * d - (4 * k * Mn) / fy
  return disc < 0 ? NaN : (d - Math.sqrt(disc)) / (2 * k)
}

/** As for Mu (k-ft) on a rectangle; φ starts at 0.9 and is re-evaluated from εt (fixed point) */
export function designRect(Mu: number, b: number, d: number, dt: number, fc: number, fy: number): RectDesign {
  const b1 = beta1(fc * 1000)
  let phi = 0.9
  let As = NaN
  for (let i = 0; i < 30; i++) {
    As = asFor((Mu * 12) / phi, b, d, fc, fy)
    if (!Number.isFinite(As)) break
    const c = (As * fy) / (0.85 * fc * b) / b1
    const np = phiOf((epsU * (dt - c)) / c, fy)
    if (Math.abs(np - phi) < 1e-7) break
    phi = np
  }
  const a = (As * fy) / (0.85 * fc * b)
  const c = a / b1
  const epsT = (epsU * (dt - c)) / c
  return { As, phi, a, c, epsT, AsMin: asMin(fc, fy, b, d), possible: Number.isFinite(As), tooHeavy: !(epsT >= 0.004) }
}

// ---------------------------------------------------------------- T-beam review

export interface TIn {
  beff: number
  bw: number
  hf: number
  d: number
  dt?: number
  As: number
  fc: number
  fy: number
}

export interface TReview {
  b1: number
  /** a assuming the whole block sits in the flange (b = beff) */
  aRect: number
  rect: boolean
  a: number
  c: number
  Asf: number
  Asw: number
  /** flange-overhang compression 0.85f'c(beff − bw)hf (kip), 0 if rectangular */
  Cf: number
  /** web compression 0.85f'c bw a (or beff·a if rectangular) */
  Cw: number
  /** k-in */
  Mn1: number
  Mn2: number
  Mn: number
  /** k-ft */
  phiMn: number
  epsS: number
  tensionYields: boolean
  epsT: number
  cdt: number
  phi: number
  zone: Zone
  AsMin: number
  AsMinOk: boolean
}

export function reviewT(p: TIn): TReview {
  const { beff, bw, hf, d, As, fc, fy } = p
  const dt = p.dt ?? d
  const b1 = beta1(fc * 1000)
  const aRect = (As * fy) / (0.85 * fc * beff)
  const AsMin = asMin(fc, fy, bw, d)
  if (aRect <= hf) {
    const r = reviewRect(beff, d, dt, As, fc, fy)
    return {
      b1,
      aRect,
      rect: true,
      a: r.a,
      c: r.c,
      Asf: 0,
      Asw: As,
      Cf: 0,
      Cw: 0.85 * fc * r.a * beff,
      Mn1: 0,
      Mn2: r.Mn,
      Mn: r.Mn,
      phiMn: r.phiMn,
      epsS: r.epsS,
      tensionYields: r.tensionYields,
      epsT: r.epsT,
      cdt: r.cdt,
      phi: r.phi,
      zone: r.zone,
      AsMin,
      AsMinOk: As >= AsMin,
    }
  }
  const Cf = 0.85 * fc * (beff - bw) * hf
  const Asf = Cf / fy
  const Asw = As - Asf
  const a = (Asw * fy) / (0.85 * fc * bw)
  const c = a / b1
  const Mn1 = Asf * fy * (d - hf / 2)
  const Mn2 = Asw * fy * (d - a / 2)
  const Mn = Mn1 + Mn2
  const epsS = (epsU * (d - c)) / c
  const epsT = (epsU * (dt - c)) / c
  const phi = phiOf(epsT, fy)
  return {
    b1,
    aRect,
    rect: false,
    a,
    c,
    Asf,
    Asw,
    Cf,
    Cw: 0.85 * fc * bw * a,
    Mn1,
    Mn2,
    Mn,
    phiMn: (phi * Mn) / 12,
    epsS,
    tensionYields: epsS >= fy / ES_KSI,
    epsT,
    cdt: c / dt,
    phi,
    zone: zoneOf(epsT, fy),
    AsMin,
    AsMinOk: As >= AsMin,
  }
}

// ---------------------------------------------------------------- T-beam design

export interface TDesignIn {
  Mu: number
  beff: number
  bw: number
  hf: number
  d: number
  dt?: number
  fc: number
  fy: number
}

export interface TDesign {
  /** class trial: a = hf → As = Mu/φfy(d − hf/2), then a with beff */
  trial: { As: number; a: number }
  /** φMn when the whole flange (beff × hf) is stressed, k-ft */
  phiMnFlange: number
  rect: boolean
  As: number
  Asf: number
  Asw: number
  /** k-ft */
  phiMn1: number
  phiMn2: number
  a: number
  c: number
  epsT: number
  phi: number
  AsMin: number
  possible: boolean
  tooHeavy: boolean
}

export function designT(p: TDesignIn): TDesign {
  const { Mu, beff, bw, hf, d, fc, fy } = p
  const dt = p.dt ?? d
  const b1 = beta1(fc * 1000)
  const trialAs = (Mu * 12) / (0.9 * fy * (d - hf / 2))
  const trial = { As: trialAs, a: (trialAs * fy) / (0.85 * fc * beff) }
  const phiMnFlange = (0.9 * 0.85 * fc * beff * hf * (d - hf / 2)) / 12
  const AsMin = asMin(fc, fy, bw, d)
  if (Mu <= phiMnFlange) {
    const r = designRect(Mu, beff, d, dt, fc, fy)
    return { trial, phiMnFlange, rect: true, As: r.As, Asf: 0, Asw: r.As, phiMn1: 0, phiMn2: Mu, a: r.a, c: r.c, epsT: r.epsT, phi: r.phi, AsMin, possible: r.possible, tooHeavy: r.tooHeavy }
  }
  const Asf = (0.85 * fc * (beff - bw) * hf) / fy
  const Mn1 = Asf * fy * (d - hf / 2)
  let phi = 0.9
  let Asw = NaN
  for (let i = 0; i < 30; i++) {
    Asw = asFor((Mu * 12) / phi - Mn1, bw, d, fc, fy)
    if (!Number.isFinite(Asw)) break
    const c = (Asw * fy) / (0.85 * fc * bw) / b1
    const np = phiOf((epsU * (dt - c)) / c, fy)
    if (Math.abs(np - phi) < 1e-7) break
    phi = np
  }
  const a = (Asw * fy) / (0.85 * fc * bw)
  const c = a / b1
  const epsT = (epsU * (dt - c)) / c
  const phiMn1 = (phi * Mn1) / 12
  return {
    trial,
    phiMnFlange,
    rect: false,
    As: Asf + Asw,
    Asf,
    Asw,
    phiMn1,
    phiMn2: Mu - phiMn1,
    a,
    c,
    epsT,
    phi,
    AsMin,
    possible: Number.isFinite(Asw),
    tooHeavy: !(epsT >= 0.004),
  }
}

// ---------------------------------------------------------------- WSD T-beam (older papers: 2006-07 Q3, 2005-06 Q2, 2004-05 Q5)

export interface WsdTIn {
  beff: number
  /** flange thickness t */
  hf: number
  d: number
  As: number
  n: number
}

export interface WsdT {
  rho: number
  /** neutral axis falls inside the flange → rectangular formulas with b = beff */
  rect: boolean
  k: number
  kd: number
  /** distance from the top to the resultant compression */
  z: number
  jd: number
  j: number
}

/** k, z, jd of a cracked T-section, compression in the web neglected (Nilson / the printed formula box) */
export function wsdT(p: WsdTIn): WsdT {
  const { beff, hf: t, d, As, n } = p
  const rho = As / (beff * d)
  const rn = rho * n
  const kr = Math.sqrt(rn * rn + 2 * rn) - rn
  if (kr * d <= t) return { rho, rect: true, k: kr, kd: kr * d, z: (kr * d) / 3, jd: d - (kr * d) / 3, j: 1 - kr / 3 }
  const td = t / d
  const k = (rn + 0.5 * td * td) / (rn + td)
  const kd = k * d
  const z = ((3 * kd - 2 * t) / (2 * kd - t)) * (t / 3)
  const jd = d - z
  return { rho, rect: false, k, kd, z, jd, j: jd / d }
}

/** the printed closed form j = [6 − 6(t/d) + 2(t/d)² + (t/d)³/(2ρn)] / [6 − 3(t/d)] (equals jd/d above) */
export function wsdTj(rho: number, n: number, t: number, d: number) {
  const td = t / d
  return (6 - 6 * td + 2 * td * td + (td * td * td) / (2 * rho * n)) / (6 - 3 * td)
}

export interface WsdTReview extends WsdT {
  /** allowable moment by steel As fs jd (k-ft) */
  Ms: number
  /** allowable moment by concrete fc(1 − t/2kd) b t jd (k-ft); rectangular: ½ fc k j b d² */
  Mc: number
  Mallow: number
  governs: 'steel' | 'concrete'
  /** stresses under a service moment M (k-ft) if given */
  fsAct?: number
  fcAct?: number
}

export function wsdTReview(p: WsdTIn & { fcAllow: number; fsAllow: number; M?: number }): WsdTReview {
  const w = wsdT(p)
  const { beff, hf: t, d, As, n, fcAllow, fsAllow } = p
  const Ms = (As * fsAllow * w.jd) / 12
  const Mc = w.rect ? (0.5 * fcAllow * w.k * w.j * beff * d * d) / 12 : (fcAllow * (1 - t / (2 * w.kd)) * beff * t * w.jd) / 12
  const out: WsdTReview = { ...w, Ms, Mc, Mallow: Math.min(Ms, Mc), governs: Ms <= Mc ? 'steel' : 'concrete' }
  if (p.M != null) {
    out.fsAct = (p.M * 12) / (As * w.jd)
    out.fcAct = (out.fsAct * w.k) / (n * (1 - w.k))
  }
  return out
}

export interface WsdTDesign {
  /** iteration history: As, jd */
  iters: { As: number; jd: number }[]
  As: number
  sec: WsdTReview
  /** concrete stress under M (ksi) vs allowable */
  fcAct: number
  concreteOk: boolean
}

/** WSD design: start jd = d − t/2, As = M/fs jd, recompute k, z, jd until As settles; then check fc */
export function wsdTDesign(p: { M: number; beff: number; hf: number; d: number; n: number; fcAllow: number; fsAllow: number }): WsdTDesign {
  const { M, beff, hf, d, n, fcAllow, fsAllow } = p
  let jd = d - hf / 2
  let As = (M * 12) / (fsAllow * jd)
  const iters = [{ As, jd }]
  for (let i = 0; i < 25; i++) {
    jd = wsdT({ beff, hf, d, As, n }).jd
    const nA = (M * 12) / (fsAllow * jd)
    iters.push({ As: nA, jd })
    if (Math.abs(nA - As) < 1e-6) {
      As = nA
      break
    }
    As = nA
  }
  const sec = wsdTReview({ beff, hf, d, As, n, fcAllow, fsAllow, M })
  return { iters, As, sec, fcAct: sec.fcAct!, concreteOk: sec.fcAct! <= fcAllow * 1.0001 }
}

// ---------------------------------------------------------------- floor system → wu → Mu

export interface FloorIn {
  /** slab thickness (in) */
  hf: number
  /** beam spacing c/c = tributary width (ft) */
  spacing: number
  bw: number
  /** overall beam depth (in) */
  h: number
  /** superimposed dead load: floor finish + partitions (psf) */
  sdl: number
  /** live load (psf) */
  ll: number
  /** extra dead line load (k/ft) */
  extraD?: number
  fD?: number
  fL?: number
  /** slab self-weight already included in sdl (some papers) */
  slabIncluded?: boolean
}

export interface FloorOut {
  slab: number
  web: number
  sdl: number
  wD: number
  wL: number
  wu: number
}

/** line loads on an interior T-beam (k/ft): slab + web (below the slab) self-weight at 150 pcf, area loads × spacing */
export function floorLoads(p: FloorIn): FloorOut {
  const g = GAMMA_RC / 1000
  const slab = p.slabIncluded ? 0 : (p.hf / 12) * g * p.spacing
  const web = ((p.bw * (p.h - p.hf)) / 144) * g
  const sdl = (p.sdl / 1000) * p.spacing
  const wD = slab + web + sdl + (p.extraD ?? 0)
  const wL = (p.ll / 1000) * p.spacing
  return { slab, web, sdl, wD, wL, wu: wuOf(wD, wL, p.fD ?? 1.2, p.fL ?? 1.6) }
}

/** ACI coefficient moment: coef × wu ln² (k-ft) */
export const aciMoment = (wu: number, ln: number, coef: number) => coef * wu * ln * ln

export const ACI_COEFS: { key: string; label: string; v: number; sign: 1 | -1 }[] = [
  { key: 'ss', label: '+1/8 (simply supported)', v: 1 / 8, sign: 1 },
  { key: 'p11', label: '+1/11 (end span, discontinuous end unrestrained)', v: 1 / 11, sign: 1 },
  { key: 'p14', label: '+1/14 (end span, integral with support)', v: 1 / 14, sign: 1 },
  { key: 'p16', label: '+1/16 (interior span)', v: 1 / 16, sign: 1 },
  { key: 'n9', label: '−1/9 (first interior support, two spans)', v: 1 / 9, sign: -1 },
  { key: 'n10', label: '−1/10 (first interior support, > 2 spans)', v: 1 / 10, sign: -1 },
  { key: 'n11', label: '−1/11 (other interior supports)', v: 1 / 11, sign: -1 },
  { key: 'n16', label: '−1/16 (exterior support, column)', v: 1 / 16, sign: -1 },
  { key: 'n24', label: '−1/24 (exterior support, spandrel beam)', v: 1 / 24, sign: -1 },
]
