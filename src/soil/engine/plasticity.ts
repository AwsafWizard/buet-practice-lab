// Atterberg limits and consistency (AJK sir's Topic 2): water contents from container weights, flow curve
// (w against log N, LL at N = 25, flow index), BS fall cone (LL at 20 mm, 80 g cone), one-point methods,
// PI, LI, CI, toughness index, activity, shrinkage limit (with and without Gs), shrinkage ratio,
// volumetric and linear shrinkage, Burmister descriptions and the plasticity-chart zones.
// Water contents and limits are in PERCENT here.

export interface WcRow {
  /** container */
  tare: number
  /** container + wet soil */
  wet: number
  /** container + dry soil */
  dry: number
}
export function waterContent(r: WcRow) {
  const Ww = r.wet - r.dry
  const Ws = r.dry - r.tare
  return { Ww, Ws, w: (100 * Ww) / Ws }
}
/** w from wet and oven-dry soil masses (no container) */
export const wFromMasses = (wet: number, dry: number) => (100 * (wet - dry)) / dry

/** least squares y = a + b·x */
export function lsq(xs: number[], ys: number[]) {
  const n = xs.length
  const mx = xs.reduce((s, v) => s + v, 0) / n
  const my = ys.reduce((s, v) => s + v, 0) / n
  const sxx = xs.reduce((s, v) => s + (v - mx) ** 2, 0)
  const sxy = xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0)
  const syy = ys.reduce((s, v) => s + (v - my) ** 2, 0)
  const b = sxy / sxx
  const a = my - b * mx
  return { a, b, r2: syy > 0 ? (sxy * sxy) / (sxx * syy) : 1 }
}

// ---------------------------------------------------------------- Casagrande cup
export interface CupPt {
  N: number
  w: number
}
export interface FlowCurve {
  /** w = a + b·log10 N */
  a: number
  b: number
  r2: number
  LL: number
  /** flow index = drop of w per log cycle of N (positive) */
  If: number
  wAt: (N: number) => number
  /** LL by straight-line interpolation between the two points that bracket N = 25 (if any) */
  interp: number
}
export function flowCurve(pts: CupPt[]): FlowCurve {
  const p = pts.filter((q) => q.N > 0 && Number.isFinite(q.w))
  const { a, b, r2 } = lsq(
    p.map((q) => Math.log10(q.N)),
    p.map((q) => q.w),
  )
  const s = [...p].sort((x, y) => x.N - y.N)
  let interp = NaN
  for (let i = 0; i + 1 < s.length; i++)
    if (s[i].N <= 25 && s[i + 1].N >= 25 && s[i + 1].N > s[i].N) {
      const t = (Math.log10(25) - Math.log10(s[i].N)) / (Math.log10(s[i + 1].N) - Math.log10(s[i].N))
      interp = s[i].w + t * (s[i + 1].w - s[i].w)
      break
    }
  return { a, b, r2, LL: a + b * Math.log10(25), If: -b, wAt: (N) => a + b * Math.log10(N), interp }
}
/** slide 11: If = (w1 − w2)/log(N2/N1) */
export const flowIndex2 = (N1: number, w1: number, N2: number, w2: number) => (w1 - w2) / Math.log10(N2 / N1)
/** one-point cup method (ASTM/Das): LL = wN (N/25)^0.121 — not on AJK sir's slides */
export const onePointCup = (w: number, N: number, tanB = 0.121) => w * (N / 25) ** tanB

// ---------------------------------------------------------------- fall cone (BS 1377, 80 g / 0.78 N, 30°)
export interface ConePt {
  /** penetration, mm */
  d: number
  w: number
}
export interface ConeFit {
  a: number
  b: number
  r2: number
  /** LL = w at 20 mm on the best-fit line */
  LL: number
  /** straight-line interpolation between the readings that bracket 20 mm */
  interp: number
  wAt: (d: number) => number
  mode: 'linear' | 'log'
}
/** w against penetration: 'linear' (BS 1377 plot) or 'log' (penetration on a log axis, as slide 13 draws it) */
export function coneLL(pts: ConePt[], mode: 'linear' | 'log' = 'linear'): ConeFit {
  const p = pts.filter((q) => q.d > 0 && Number.isFinite(q.w))
  const X = (d: number) => (mode === 'log' ? Math.log10(d) : d)
  const { a, b, r2 } = lsq(
    p.map((q) => X(q.d)),
    p.map((q) => q.w),
  )
  const s = [...p].sort((x, y) => x.d - y.d)
  let interp = NaN
  for (let i = 0; i + 1 < s.length; i++)
    if (s[i].d <= 20 && s[i + 1].d >= 20 && s[i + 1].d > s[i].d) {
      const t = (X(20) - X(s[i].d)) / (X(s[i + 1].d) - X(s[i].d))
      interp = s[i].w + t * (s[i + 1].w - s[i].w)
      break
    }
  return { a, b, r2, LL: a + b * X(20), interp, wAt: (d) => a + b * X(d), mode }
}
/** one-point cone (IS 2720-5, Nagaraj–Jayadeva): wL = wy / (0.77 log10 y), y = 14–28 mm — not on the slides */
export const onePointCone = (w: number, d: number) => w / (0.77 * Math.log10(d))

// ---------------------------------------------------------------- indices
export interface Limits {
  LL: number
  PL: number
  /** natural water content */
  w?: number
  SL?: number
  /** flow index (for the toughness index) */
  If?: number
  /** % clay (finer than 2 µm) for activity */
  clay?: number
}
export function indices(l: Limits) {
  const PI = l.LL - l.PL
  const LI = l.w !== undefined ? (l.w - l.PL) / PI : NaN
  const CI = l.w !== undefined ? (l.LL - l.w) / PI : NaN
  const It = l.If ? PI / l.If : NaN
  const A = l.clay ? PI / l.clay : NaN
  return {
    PI,
    LI,
    CI,
    It,
    A,
    burmister: burmister(PI),
    state: l.w !== undefined ? consistencyState(l.w, l) : '—',
    ciDesc: Number.isFinite(CI) ? ciDescription(CI) : '—',
    activity: Number.isFinite(A) ? activityClass(A) : '—',
  }
}

export type ConsistencyState = 'solid' | 'semi-solid' | 'plastic' | 'liquid'
/** w below SL solid, SL–PL semi-solid, PL–LL plastic, above LL liquid (slides 4–7) */
export function consistencyState(w: number, l: { SL?: number; PL: number; LL: number }): ConsistencyState {
  if (w >= l.LL) return 'liquid'
  if (w >= l.PL) return 'plastic'
  if (l.SL !== undefined && w < l.SL) return 'solid'
  return 'semi-solid'
}
/** slide 18: LI ≈ 0 high strength (competent), LI ≈ 1 low strength (incompetent) */
export function liComment(LI: number) {
  if (!Number.isFinite(LI)) return '—'
  if (LI < 0) return 'LI < 0: drier than the PL — semi-solid or solid, very stiff'
  if (LI <= 0.25) return 'LI ≈ 0: near the PL — high strength, competent'
  if (LI < 0.75) return 'plastic state — medium strength'
  if (LI <= 1) return 'LI ≈ 1: near the LL — low strength, incompetent'
  return 'LI > 1: wetter than the LL — liquid; collapses when remoulded (sensitive)'
}
/** consistency index scale (IS 1498 — not on the slides) */
export function ciDescription(CI: number) {
  if (CI < 0) return 'liquid'
  if (CI < 0.25) return 'very soft'
  if (CI < 0.5) return 'soft'
  if (CI < 0.75) return 'medium stiff'
  if (CI <= 1) return 'stiff'
  return 'very stiff (semi-solid)'
}
/** Skempton activity classes (not on the slides) */
export function activityClass(A: number) {
  if (A < 0.75) return 'inactive'
  if (A <= 1.25) return 'normal'
  return 'active'
}

/** Burmister (1949), slide 16 */
export const BURMISTER: { lo: number; hi: number; label: string; soil: string }[] = [
  { lo: 0, hi: 0, label: 'Non-plastic', soil: 'gravel / sand' },
  { lo: 0, hi: 5, label: 'Slightly plastic', soil: 'silt' },
  { lo: 5, hi: 10, label: 'Low plasticity', soil: 'silt' },
  { lo: 10, hi: 20, label: 'Medium plasticity', soil: 'clay' },
  { lo: 20, hi: 40, label: 'High plasticity', soil: 'clay' },
  { lo: 40, hi: Infinity, label: 'Very high plasticity', soil: 'clay' },
]
export function burmisterIndex(PI: number) {
  if (!Number.isFinite(PI)) return -1
  if (PI <= 0) return 0
  for (let i = 1; i < BURMISTER.length; i++) if (PI <= BURMISTER[i].hi) return i
  return BURMISTER.length - 1
}
export const burmister = (PI: number) => BURMISTER[burmisterIndex(PI)]?.label ?? '—'

// ---------------------------------------------------------------- plasticity chart
export const aLine = (LL: number) => 0.73 * (LL - 20)
export const uLine = (LL: number) => 0.9 * (LL - 8)

export interface ChartZone {
  zone: 'CL' | 'ML' | 'CL-ML' | 'CH' | 'MH'
  /** O alternative printed on the chart (OL / OH) */
  alt: 'OL' | 'OH'
  aPI: number
  uPI: number
  aboveA: boolean
  aboveU: boolean
}
/** USCS plasticity chart (Das Fig. 5.3) for inorganic fines */
export function chartZone(LL: number, PI: number): ChartZone {
  const aPI = aLine(LL)
  const uPI = uLine(LL)
  const aboveA = PI >= aPI
  const hi = LL >= 50
  let zone: ChartZone['zone']
  if (hi) zone = aboveA ? 'CH' : 'MH'
  else if (PI > 7 && aboveA) zone = 'CL'
  else if (PI >= 4 && PI <= 7 && aboveA) zone = 'CL-ML'
  else zone = 'ML'
  return { zone, alt: hi ? 'OH' : 'OL', aPI, uPI, aboveA, aboveU: PI > uPI }
}
/** Casagrande (1932) chart of slide 17: LL boundaries 30 and 50, lecturer's labels */
export function casagrandeZone(LL: number, PI: number) {
  const above = PI >= aLine(LL)
  const band = LL < 30 ? 'L' : LL < 50 ? 'M' : 'H'
  const sym = (above ? 'C' : 'M') + band
  const words: Record<string, string> = {
    CL: 'inorganic clay of low plasticity',
    CM: 'inorganic clay of medium plasticity',
    CH: 'inorganic clay of high plasticity',
    ML: 'inorganic silt of low compressibility',
    MM: 'inorganic silt of medium compressibility and organic silt',
    MH: 'inorganic silt of high compressibility and organic clay',
  }
  return { sym, words: words[sym] }
}

// ---------------------------------------------------------------- shrinkage
/** wet pat (m1, V1) dried to (m2, V2): SL = [(m1 − m2) − (V1 − V2)ρw]/m2 × 100 (Gs unknown) */
export function shrinkage(p: { m1: number; V1: number; m2: number; V2: number; rw?: number }) {
  const rw = p.rw ?? 1
  const w1 = (100 * (p.m1 - p.m2)) / p.m2
  const SL = (100 * (p.m1 - p.m2 - (p.V1 - p.V2) * rw)) / p.m2
  const SR = p.m2 / (p.V2 * rw)
  // at the SL the pat is saturated at the dry volume: V2ρw/m2 = SL/100 + 1/Gs
  const Gs = 1 / (1 / SR - SL / 100)
  const VS = (w1 - SL) * SR
  return { w1, SL, SR, Gs, VS, LS: linearFromVS(VS) }
}
/** SL with Gs known: SL = (V2ρw/m2 − 1/Gs) × 100 = (1/SR − 1/Gs) × 100 */
export const slFromGs = (Gs: number, SR: number) => 100 * (1 / SR - 1 / Gs)
/** SL from the void ratio at the shrinkage limit (saturated there): SL = e/Gs */
export const slFromE = (e: number, Gs: number) => (100 * e) / Gs
/** shrinkage ratio from e at SL: SR = Gs/(1 + e) */
export const srFromE = (e: number, Gs: number) => Gs / (1 + e)
/** volumetric shrinkage (% of dry volume) from w1 down to SL */
export const volShrink = (w1: number, SL: number, SR: number) => (w1 - SL) * SR
/** linear shrinkage (%) from volumetric shrinkage: LS = [1 − (100/(VS + 100))^(1/3)] × 100 */
export const linearFromVS = (VS: number) => 100 * (1 - (100 / (VS + 100)) ** (1 / 3))
/** linear shrinkage from bar lengths (standard mould 140 mm) */
export const linearFromLength = (Ld: number, L0 = 140) => 100 * (1 - Ld / L0)
/** PI ≈ 2.13 × LS (BS) */
export const piFromLS = (LS: number) => 2.13 * LS

/** volume change on drying from w0 to wf (both %, SL known, SR known) */
export function dryingChange(w0: number, wf: number, SL: number, SR: number) {
  const rel = (w: number) => 1 + (Math.max(w, SL) - SL) * SR / 100 // V/Vdry
  const V0 = rel(w0)
  const Vf = rel(wf)
  return { pctOfInitial: (100 * (V0 - Vf)) / V0, pctOfDry: 100 * (V0 - Vf), belowSL: w0 <= SL }
}
