// CE 315 one-way slabs (class method, Nilson / ACI 318, US units).
// Conventions follow the slab handnote: d = h − 1 in, thickness rounded up (h > 6 in → ½ in, else ¼ in),
// spacing rounded DOWN to ½ in, alternate bars cranked + "extra top" bars, 1.2D + 1.6L, φ = 0.9 / 0.75.
// Also holds the slab helpers the two-way engine reuses (As iteration, spacing, extra top, T&S, φVc).

import { BARS, beta1, GAMMA_RC } from './materials'

export const PHI_F = 0.9
export const PHI_V = 0.75
const E = 1e-6

// ---------------------------------------------------------------- small helpers
/** class rounding of slab thickness: h > 6 in → next ½ in; h ≤ 6 in → next ¼ in */
export function roundSlabH(h: number) {
  if (h > 6 + E) return Math.ceil(h * 2 - E) / 2
  return Math.ceil(h * 4 - E) / 4
}
/** spacing rounded down to ½ in */
export const floorHalf = (s: number) => Math.floor(s * 2 + E) / 2
/** deflection factor for fy ≠ 60 ksi: 0.4 + fy/100 000 (fy in psi) */
export const fyFactor = (fy: number) => (Math.abs(fy - 60000) < 1 ? 1 : 0.4 + fy / 100000)
/** temperature & shrinkage ratio on gross area (ACI 24.4.3.2): Gr 40/50 0.0020, Gr 60 0.0018, fy > 60 ksi 0.0018·60/fy ≥ 0.0014 */
export function tsRatio(fy: number) {
  if (fy < 60000 - 1) return 0.002
  if (fy <= 60000 + 1) return 0.0018
  return Math.max(0.0014, (0.0018 * 60000) / fy)
}
/** As,min = T&S steel per ft (in²/ft) */
export const tsAs = (fy: number, h: number) => tsRatio(fy) * 12 * h
/** self-weight of a slab, psf */
export const slabSW = (h: number) => (h / 12) * GAMMA_RC
/** φVc per ft of slab (kip), λ = 1: 0.75 × 2√f'c × 12 × d */
export const phiVcSlab = (fc: number, d: number, b = 12) => (PHI_V * 2 * Math.sqrt(fc) * b * d) / 1000

/** the class's rule for the number of extra bars: round up, unless only a hair (≤ 0.1 bar) above a whole number */
export function roundBars(n: number) {
  if (n <= E) return 0
  const f = n - Math.floor(n)
  return f <= 0.1 + E ? Math.floor(n) : Math.ceil(n)
}

// ---------------------------------------------------------------- loads
export interface SlabLoadIn {
  h: number
  /** service live load, psf */
  ll: number
  /** floor finish, psf */
  ff?: number
  /** partition wall, psf */
  pw?: number
  /** any other superimposed dead load (terracing, ceiling …), psf */
  other?: number
  /** total service dead load INCLUDING self-weight (psf) when the paper gives it; overrides sw + ff + pw + other */
  dlTotal?: number
  fD?: number
  fL?: number
}
export interface SlabLoads {
  sw: number
  /** service DL and LL, psf */
  D: number
  L: number
  fD: number
  fL: number
  /** factored DL, LL and total, psf */
  wD: number
  wL: number
  wu: number
  /** the same in k/ft on a 1-ft strip */
  wDk: number
  wLk: number
  wuk: number
  given: boolean
}
export function slabLoads(p: SlabLoadIn): SlabLoads {
  const sw = slabSW(p.h)
  const given = p.dlTotal !== undefined && p.dlTotal > 0
  const D = given ? p.dlTotal! : sw + (p.ff ?? 0) + (p.pw ?? 0) + (p.other ?? 0)
  const L = p.ll
  const fD = p.fD ?? 1.2
  const fL = p.fL ?? 1.6
  const wD = fD * D
  const wL = fL * L
  const wu = wD + wL
  return { sw, D, L, fD, fL, wD, wL, wu, wDk: wD / 1000, wLk: wL / 1000, wuk: wu / 1000, given }
}

// ---------------------------------------------------------------- flexure
export interface AsResult {
  Mu: number
  d: number
  /** required steel, in²/ft */
  As: number
  a: number
  /** the class's iteration from a = 0.5 in: [a tried, As found] */
  iters: { a: number; As: number }[]
  /** a = k·As with k = fy / (0.85 f'c b) */
  k: number
  c: number
  epsT: number
}
/** As for Mu (k-ft per ft) by iterating a: As = Mu·12 / [0.9 fy (d − a/2)], a = As fy / (0.85 f'c b). f'c, fy in psi. */
export function slabAs(Mu: number, d: number, fc: number, fy: number, b = 12): AsResult {
  const fyk = fy / 1000
  const fck = fc / 1000
  const k = fyk / (0.85 * fck * b)
  if (!(Mu > 0)) return { Mu, d, As: 0, a: 0, iters: [], k, c: 0, epsT: Infinity }
  let a = 0.5
  let As = 0
  const iters: { a: number; As: number }[] = []
  for (let i = 0; i < 60; i++) {
    const next = (Mu * 12) / (PHI_F * fyk * (d - a / 2))
    iters.push({ a, As: next })
    const done = Math.abs(next - As) < 1e-7
    As = next
    a = k * As
    if (done) break
  }
  const c = a / beta1(fc)
  return { Mu, d, As, a, iters: iters.slice(0, 4), k, c, epsT: (0.003 * (d - c)) / c }
}

/** ρ at εt = 0.005 and the effective depth it needs for Mu (the class's "is the depth enough?" check) */
export function depthCheck(Mu: number, fc: number, fy: number, b = 12) {
  const rho005 = 0.85 * beta1(fc) * (fc / fy) * (0.003 / 0.008)
  const fyk = fy / 1000
  const dreq = Math.sqrt((Math.max(Mu, 0) * 12) / (PHI_F * rho005 * fyk * b * (1 - (0.59 * rho005 * fy) / fc)))
  return { rho005, dreq, beta1: beta1(fc) }
}

// ---------------------------------------------------------------- bars & spacing
export interface Spacing {
  bar: number
  As: number
  /** Ab·12/As */
  raw: number
  smax: number
  /** chosen spacing: min(raw, smax) rounded down to ½ in */
  s: number
  /** As provided at s */
  prov: number
}
export function barSpacing(As: number, bar: number, smax: number): Spacing {
  const Ab = BARS[bar].A
  const raw = As > 0 ? (Ab * 12) / As : Infinity
  const s = floorHalf(Math.min(raw, smax))
  return { bar, As, raw, smax, s, prov: (Ab * 12) / s }
}
/** the class picks #3 unless that needs s below ≈ 4.5 in, then #4, … */
export function autoBar(As: number, minS = 4.5, sizes = [3, 4, 5, 6]) {
  for (const b of sizes) if ((BARS[b].A * 12) / As >= minS - E) return b
  return sizes[sizes.length - 1]
}

export interface ExtraTop {
  bar: number
  /** top steel needed at the support, in²/ft (already ≥ As,min) */
  As: number
  /** bottom spacing s; one cranked bar arrives per 2s */
  s: number
  width: number
  need: number
  cranked: number
  extra: number
  nRaw: number
  /** COUNT form: n extra bars between the alternate cranked bars */
  n: number
  /** SPACING form: As,extra = As − (Ab·12/s)/2 per ft, s_extra = Ab·12/As,extra (null when cranked bars suffice) */
  AsExtraFt: number
  sExtra: number | null
}
/** alternate bars cranked: in each 2s width one cranked bar (Ab) reaches the top; the rest is "extra top" */
export function extraTop(As: number, s: number, bar: number): ExtraTop {
  const Ab = BARS[bar].A
  const width = 2 * s
  const need = (As * width) / 12
  const extra = need - Ab
  const nRaw = extra / Ab
  const AsExtraFt = As - (Ab * 12) / s / 2
  return { bar, As, s, width, need, cranked: Ab, extra, nRaw, n: roundBars(nRaw), AsExtraFt, sExtra: AsExtraFt > E ? floorHalf((Ab * 12) / AsExtraFt) : null }
}

/** temperature & shrinkage bars (#3 unless told), spacing ≤ 5h and 18 in */
export function tsBars(fy: number, h: number, bar = 3) {
  const As = tsAs(fy, h)
  return { ratio: tsRatio(fy), ...barSpacing(As, bar, Math.min(5 * h, 18)) }
}

// ---------------------------------------------------------------- minimum thickness (ACI Table 7.3.1.1)
export type HminRule = 'ss' | 'one' | 'both' | 'cant'
export const HMIN_DIV: Record<HminRule, number> = { ss: 20, one: 24, both: 28, cant: 10 }
export const HMIN_LABEL: Record<HminRule, string> = { ss: 'simply supported', one: 'one end continuous', both: 'both ends continuous', cant: 'cantilever' }
/** l (ft, clear span as the class uses) → h_min (in), × (0.4 + fy/100 000) for fy ≠ 60 ksi */
export const hminOneWay = (l: number, rule: HminRule, fy = 60000) => ((l * 12) / HMIN_DIV[rule]) * fyFactor(fy)

// ---------------------------------------------------------------- ACI moment coefficients
export type EndSupport = 'spandrel' | 'column' | 'unrestrained'
export const END_LABEL: Record<EndSupport, string> = { spandrel: 'spandrel beam (integral)', column: 'column (integral)', unrestrained: 'brick wall / unrestrained' }

export interface CoefSection {
  id: string
  label: string
  kind: 'neg' | 'pos'
  /** support index (neg) or span index (pos) */
  at: number
  /** 1/C as a whole number, e.g. 24 for 1/24 (8 for the single-span wl²/8) */
  den: number
  ln: number
  Mu: number
  /** true when the same as a section on the left (symmetric slab) */
  mirror: boolean
}

function symmetric(spans: number[], ends: [EndSupport, EndSupport]) {
  return ends[0] === ends[1] && spans.every((s, i) => Math.abs(s - spans[spans.length - 1 - i]) < 1e-9)
}

/** ACI coefficients (Table 12.1 / 11.1): Mu = wu ln² / den, ln = clear span (average of the two adjacent spans at interior supports) */
export function aciMoments(spans: number[], ends: [EndSupport, EndSupport], wuk: number, opts: { short?: boolean } = {}): CoefSection[] {
  const n = spans.length
  const out: CoefSection[] = []
  const sym = symmetric(spans, ends)
  const many = n > 2
  if (n === 1) {
    out.push({ id: 'p0', label: 'Midspan (+), simple span', kind: 'pos', at: 0, den: 8, ln: spans[0], Mu: (wuk * spans[0] ** 2) / 8, mirror: false })
    return out
  }
  for (let i = 0; i <= n; i++) {
    // support i
    const ext = i === 0 || i === n
    if (ext) {
      const e = ends[i === 0 ? 0 : 1]
      if (e !== 'unrestrained') {
        const den = opts.short ? 12 : e === 'spandrel' ? 24 : 16
        const ln = spans[i === 0 ? 0 : n - 1]
        out.push({ id: `s${i}`, label: 'Exterior support (−)', kind: 'neg', at: i, den, ln, Mu: (wuk * ln * ln) / den, mirror: sym && i > n / 2 })
      }
    } else {
      const first = i === 1 || i === n - 1
      const den = opts.short ? 12 : first ? (many ? 10 : 9) : 11
      const ln = (spans[i - 1] + spans[i]) / 2
      const label = !many ? 'Interior support (−)' : first ? 'First interior support (−)' : 'Other interior support (−)'
      out.push({ id: `s${i}`, label, kind: 'neg', at: i, den, ln, Mu: (wuk * ln * ln) / den, mirror: sym && i > n / 2 })
    }
    // span i
    if (i < n) {
      const end = i === 0 || i === n - 1
      const e = i === 0 ? ends[0] : ends[1]
      const den = end ? (e === 'unrestrained' ? 11 : 14) : 16
      const label = !many ? 'Midspan (+)' : end ? 'End span (+)' : 'Interior span (+)'
      out.push({ id: `p${i}`, label, kind: 'pos', at: i, den, ln: spans[i], Mu: (wuk * spans[i] ** 2) / den, mirror: sym && i + 0.5 > n / 2 })
    }
  }
  return out
}

/** ACI shear: 1.15 wu ln/2 at the face of the first interior support (end span side), wu ln/2 elsewhere; Vu at d from the face */
export function aciShear(spans: number[], wuk: number, d: number) {
  const n = spans.length
  const rows = spans.flatMap((ln, j) => {
    const cL = n > 1 && j === n - 1 ? 1.15 : 1
    const cR = n > 1 && j === 0 ? 1.15 : 1
    return [
      { span: j, side: 'L' as const, c: cL, V: (cL * wuk * ln) / 2, Vd: (cL * wuk * ln) / 2 - (wuk * d) / 12 },
      { span: j, side: 'R' as const, c: cR, V: (cR * wuk * ln) / 2, Vd: (cR * wuk * ln) / 2 - (wuk * d) / 12 },
    ]
  })
  const gov = rows.reduce((m, r) => (r.Vd > m.Vd ? r : m), rows[0])
  return { rows, gov }
}

// ---------------------------------------------------------------- continuous one-way slab (ACI coefficients)
export interface OneWayCoefInput {
  /** clear spans, ft */
  spans: number[]
  ends: [EndSupport, EndSupport]
  /** spans ≤ 10 ft: −1/12 at all supports */
  short?: boolean
  ll: number
  ff?: number
  pw?: number
  other?: number
  dlTotal?: number
  /** psi */
  fc: number
  fy: number
  /** given thickness (in); otherwise from the minimum-thickness rule */
  h?: number
  bar?: number | 'auto'
  fD?: number
  fL?: number
  /** override the coefficient denominators (paper prints its own), keyed by section id */
  den?: Record<string, number>
}

export interface DesignSection extends CoefSection {
  as: AsResult
  /** max(As, As,min) */
  AsD: number
  usesMin: boolean
  /** straight-bar spacing for this section's steel */
  sp: Spacing
}

export function oneWayCoef(p: OneWayCoefInput) {
  const n = p.spans.length
  const hmin = p.spans.map((l, j) => {
    const rule: HminRule = n === 1 ? 'ss' : j === 0 || j === n - 1 ? 'one' : 'both'
    return { span: j, l, rule, h: hminOneWay(l, rule, p.fy) }
  })
  const hReq = Math.max(...hmin.map((x) => x.h))
  const h = p.h ?? roundSlabH(hReq)
  const d = h - 1
  const loads = slabLoads({ h, ll: p.ll, ff: p.ff, pw: p.pw, other: p.other, dlTotal: p.dlTotal, fD: p.fD, fL: p.fL })
  const coef = aciMoments(p.spans, p.ends, loads.wuk, { short: p.short }).map((s) => {
    const den = p.den?.[s.id]
    return den ? { ...s, den, Mu: (loads.wuk * s.ln * s.ln) / den } : s
  })
  const AsMin = tsAs(p.fy, h)
  const smax = Math.min(3 * h, 18)
  const Mumax = Math.max(...coef.map((s) => s.Mu))
  const depth = depthCheck(Mumax, p.fc, p.fy)
  const posMax = Math.max(...coef.filter((s) => s.kind === 'pos').map((s) => Math.max(slabAs(s.Mu, d, p.fc, p.fy).As, AsMin)))
  const bar = p.bar === undefined || p.bar === 'auto' ? autoBar(posMax) : p.bar
  const sections: DesignSection[] = coef.map((s) => {
    const as = slabAs(s.Mu, d, p.fc, p.fy)
    const AsD = Math.max(as.As, AsMin)
    return { ...s, as, AsD, usesMin: as.As < AsMin, sp: barSpacing(AsD, bar, smax) }
  })
  const posOf = (j: number) => sections.find((s) => s.kind === 'pos' && s.at === j)!
  const spanBars = p.spans.map((_, j) => posOf(j).sp)
  const supports = sections
    .filter((s) => s.kind === 'neg')
    .map((s) => {
      const adj = [s.at - 1, s.at].filter((j) => j >= 0 && j < n)
      const sb = Math.min(...adj.map((j) => spanBars[j].s))
      return { sec: s, sBottom: sb, extra: extraTop(s.AsD, sb, bar), straight: s.sp }
    })
  const ts = tsBars(p.fy, h)
  const sh = aciShear(p.spans, loads.wuk, d)
  const phiVc = phiVcSlab(p.fc, d)
  const big = sections.reduce((m, s) => (s.AsD > m.AsD ? s : m), sections[0])
  const warnings: string[] = []
  for (let j = 1; j < n; j++) {
    const r = Math.max(p.spans[j], p.spans[j - 1]) / Math.min(p.spans[j], p.spans[j - 1])
    if (r > 1.2 + E) warnings.push(`Adjacent spans differ by more than 20 % (${r.toFixed(2)}): the ACI coefficients are not strictly applicable.`)
  }
  if (loads.L > 3 * loads.D) warnings.push('LL > 3 DL: the ACI coefficients are not applicable.')
  if (n === 1) warnings.push('Single span: the ACI coefficients need two or more spans, so M = wu ln²/8 (simply supported).')
  return { input: p, n, hmin, hReq, h, hGiven: p.h !== undefined, d, loads, sections, AsMin, smax, depth, Mumax, bar, spanBars, supports, ts, shear: { ...sh.gov, rows: sh.rows, phiVc, ok: phiVc >= sh.gov.Vd }, epsT: big.as.epsT, warnings }
}
export type OneWayCoefResult = ReturnType<typeof oneWayCoef>

// ---------------------------------------------------------------- slab strip with cantilever(s): statics + live-load patterns
export type LLPattern = 'cant' | 'span' | 'all'
export const PATTERN_LABEL: Record<LLPattern, string> = { cant: 'LL on cantilever(s) only', span: 'LL on span only', all: 'LL everywhere' }

export interface StripGeo {
  /** c/c of supports (ft) */
  L: number
  /** cantilever lengths to the support centre (ft) */
  acL: number
  acR: number
}
/** beam on two supports (A at x = 0, B at x = L) with overhangs; uniform w per segment (k/ft) */
export function stripStatics(g: StripGeo, w: { l: number; s: number; r: number }) {
  const { L, acL, acR } = g
  const MA = (-w.l * acL * acL) / 2
  const MB = (-w.r * acR * acR) / 2
  const RB = ((w.s * L * L) / 2 + w.r * acR * (L + acR / 2) - (w.l * acL * acL) / 2) / L
  const RA = w.l * acL + w.s * L + w.r * acR - RB
  const V0 = RA - w.l * acL
  /** bending moment anywhere (sagging +), x from support A */
  const M = (x: number) => {
    if (x <= 0) return (-w.l * (x + acL) ** 2) / 2
    if (x >= L) return (-w.r * (L + acR - x) ** 2) / 2
    return MA + V0 * x - (w.s * x * x) / 2
  }
  const xm = w.s > 0 ? Math.min(Math.max(V0 / w.s, 0), L) : V0 > 0 ? L : 0
  const Mmax = M(xm)
  // sagging region inside the span (roots of M = 0)
  const disc = V0 * V0 + 2 * w.s * MA
  let x1: number | null = null
  let x2: number | null = null
  if (w.s > 0 && disc > 0 && Mmax > 0) {
    x1 = Math.max(0, (V0 - Math.sqrt(disc)) / w.s)
    x2 = Math.min(L, (V0 + Math.sqrt(disc)) / w.s)
  }
  return { RA, RB, MA, MB, M, xm, Mmax, Mmid: M(L / 2), x1, x2 }
}

export interface CantSlabInput {
  /** clear span between support faces, ft */
  span: number
  /** support (beam / wall) width, in */
  support: number
  /** cantilever lengths from the support FACE, ft (0 = none) */
  cantL: number
  cantR: number
  ll: number
  ff?: number
  pw?: number
  other?: number
  dlTotal?: number
  fc: number
  fy: number
  h?: number
  bar?: number | 'auto'
  fD?: number
  fL?: number
}

export function cantSlab(p: CantSlabInput) {
  const nC = (p.cantL > 0 ? 1 : 0) + (p.cantR > 0 ? 1 : 0)
  const ff = fyFactor(p.fy)
  const spanRule: HminRule = nC === 2 ? 'both' : nC === 1 ? 'one' : 'ss'
  const aMax = Math.max(p.cantL, p.cantR)
  const hSpan = hminOneWay(p.span, spanRule, p.fy)
  const hCant = nC ? hminOneWay(aMax, 'cant', p.fy) : 0
  const hReq = Math.max(hSpan, hCant)
  const h = p.h ?? roundSlabH(hReq)
  const d = h - 1
  const loads = slabLoads({ h, ll: p.ll, ff: p.ff, pw: p.pw, other: p.other, dlTotal: p.dlTotal, fD: p.fD, fL: p.fL })
  const bw = p.support / 12
  const g: StripGeo = { L: p.span + bw, acL: p.cantL > 0 ? p.cantL + bw / 2 : 0, acR: p.cantR > 0 ? p.cantR + bw / 2 : 0 }
  const { wDk, wuk } = loads
  const pat = (t: LLPattern) => stripStatics(g, t === 'cant' ? { l: wuk, s: wDk, r: wuk } : t === 'span' ? { l: wDk, s: wuk, r: wDk } : { l: wuk, s: wuk, r: wuk })
  const patterns = { cant: pat('cant'), span: pat('span'), all: pat('all') }
  // class design moments
  const MnegL = (wuk * p.cantL ** 2) / 2
  const MnegR = (wuk * p.cantR ** 2) / 2
  const Mneg = Math.max(MnegL, MnegR)
  const Mpos = patterns.span.Mmax
  // "relief" form the handnote shows (symmetric case) and the one-overhang reaction form
  const simple = (wuk * g.L * g.L) / 8
  const reliefSym = (wDk * g.acL * g.acL) / 2
  const Mc = (wDk * Math.max(g.acL, g.acR) ** 2) / 2
  const uplift = patterns.cant
  const negThrough = uplift.Mmax <= 0
  const AsMin = tsAs(p.fy, h)
  const smax = Math.min(3 * h, 18)
  const depth = depthCheck(Math.max(Mpos, Mneg), p.fc, p.fy)
  const asPos = slabAs(Mpos, d, p.fc, p.fy)
  const asNeg = slabAs(Mneg, d, p.fc, p.fy)
  const AsPosD = Math.max(asPos.As, AsMin)
  const AsNegD = Math.max(asNeg.As, AsMin)
  const bar = p.bar === undefined || p.bar === 'auto' ? autoBar(AsPosD) : p.bar
  const pos = barSpacing(AsPosD, bar, smax)
  const extra = extraTop(AsNegD, pos.s, bar)
  const straight = barSpacing(AsNegD, bar, smax)
  const ts = tsBars(p.fy, h)
  // shear (class): cantilever at d from the face; span side ≈ wu L/2 + M/L
  const Vcant = wuk * (aMax - d / 12)
  const Vspan = (wuk * g.L) / 2 + Mneg / g.L
  const phiVc = phiVcSlab(p.fc, d)
  // how far the top steel must reach into the span (uplift pattern), with the class's ln/3 and ≥ cantilever length
  const xNegA = uplift.x1 ?? g.L
  const xNegB = uplift.x2 !== null ? g.L - uplift.x2 : g.L
  const topExt = Math.max(p.span / 3, aMax, ...(negThrough ? [] : [p.cantL > 0 ? xNegA - bw / 2 : 0, p.cantR > 0 ? xNegB - bw / 2 : 0]))
  return {
    input: p,
    nC,
    spanRule,
    hSpan,
    hCant,
    hReq,
    fyF: ff,
    h,
    hGiven: p.h !== undefined,
    d,
    loads,
    geo: g,
    patterns,
    MnegL,
    MnegR,
    Mneg,
    Mpos,
    simple,
    reliefSym,
    Mc,
    uplift: { Mmid: uplift.Mmid, RA: uplift.RA, RB: uplift.RB, Mmax: uplift.Mmax, negThrough },
    AsMin,
    smax,
    depth,
    asPos,
    asNeg,
    AsPosD,
    AsNegD,
    bar,
    pos,
    extra,
    straight,
    ts,
    shear: { Vcant, Vspan, phiVc, ok: phiVc >= Math.max(Vcant, Vspan) },
    topExt,
  }
}
export type CantSlabResult = ReturnType<typeof cantSlab>
