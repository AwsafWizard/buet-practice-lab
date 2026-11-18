// Deep tubewell (DTW) design as Snigdha ma'am teaches it (CE 331 L4 Part 1, class units: ft, inch, mm, cusec, lph).
// Pure functions; every result carries its intermediate values so a solution can show each step.
//
// Sequence (M4 in lec_snigdha.md): gradation curve -> layer choice -> housing pipe -> strainer length & position ->
// gravel pack -> slot number -> open area -> yield (-> number of wells) -> well log.

export const FT_PER_M = 3.280839895
export const MM_PER_IN = 25.4
/** litres in one cubic foot */
export const L_PER_FT3 = 28.316846592
/** cusec (ft³/s) -> litres per hour */
export const cfsToLph = (cfs: number) => cfs * L_PER_FT3 * 3600
export const mToFt = (m: number) => m * FT_PER_M
export const ftToM = (ft: number) => ft / FT_PER_M

// ------------------------------------------------------------------ gradation curve
/** one sieve of a sieve analysis: weight retained in g (or %) */
export interface SieveRow {
  no: string
  /** opening, mm */
  size: number
  retained: number
}
export interface GradationRow extends SieveRow {
  /** % retained on this sieve */
  pct: number
  cumRetained: number
  finer: number
}
export interface CurvePoint {
  /** grain size, mm */
  size: number
  /** % finer */
  finer: number
}

/** sieve data (+ pan) -> % retained, cumulative % retained and % finer for every sieve, and the curve points */
export function sieveTable(rows: SieveRow[], pan: number) {
  const total = rows.reduce((s, r) => s + r.retained, 0) + pan
  let cum = 0
  const table: GradationRow[] = rows.map((r) => {
    const pct = (r.retained / total) * 100
    cum += pct
    return { ...r, pct, cumRetained: cum, finer: Math.max(0, 100 - cum) }
  })
  return { rows: table, total, pan, panPct: (pan / total) * 100, points: curveOf(table.map((r) => ({ size: r.size, finer: r.finer }))) }
}

/** curve points sorted by grain size ascending (finer is then non-decreasing) */
export function curveOf(pts: CurvePoint[]): CurvePoint[] {
  return [...pts].sort((a, b) => a.size - b.size)
}

/**
 * Size (mm) at which `p` % is finer, by straight-line interpolation of % finer against log size
 * (her shortcut: D_x = D1 (D2/D1)^((x - P1)/(P2 - P1))).
 */
export function dAt(points: CurvePoint[], p: number): { d: number; lo: CurvePoint; hi: CurvePoint; extrapolated: boolean } {
  const pts = curveOf(points)
  let i = 0
  for (let k = 0; k < pts.length - 1; k++) {
    if (pts[k].finer <= p && p <= pts[k + 1].finer && pts[k + 1].finer > pts[k].finer) {
      i = k
      break
    }
    i = k
  }
  let lo = pts[i]
  let hi = pts[i + 1]
  const extrapolated = p < pts[0].finer || p > pts[pts.length - 1].finer
  if (p < pts[0].finer) {
    lo = pts[0]
    hi = pts.find((q) => q.finer > lo.finer) ?? pts[1]
  }
  const d = lo.size * (hi.size / lo.size) ** ((p - lo.finer) / (hi.finer - lo.finer))
  return { d, lo, hi, extrapolated }
}

/** the standard sieves of the fineness modulus: #4, 8, 16, 30, 50, 100 (mm) */
export const FM_SIEVES = [4.75, 2.36, 1.18, 0.6, 0.3, 0.15]

/** % finer at an arbitrary size, interpolated on the log axis (100 above the coarsest point) */
export function finerAt(points: CurvePoint[], size: number): number {
  const pts = curveOf(points)
  if (size >= pts[pts.length - 1].size) return pts[pts.length - 1].finer >= 100 ? 100 : pts[pts.length - 1].finer
  if (size <= pts[0].size) return pts[0].finer
  for (let k = 0; k < pts.length - 1; k++) {
    if (size >= pts[k].size && size <= pts[k + 1].size) {
      const t = Math.log(size / pts[k].size) / Math.log(pts[k + 1].size / pts[k].size)
      return pts[k].finer + t * (pts[k + 1].finer - pts[k].finer)
    }
  }
  return 100
}

export interface GradationStats {
  d10: number
  d30: number
  d60: number
  cu: number
  /** coefficient of curvature */
  cc: number
  fm: number
  /** cumulative % retained on #4, 8, 16, 30, 50, 100 */
  fmTerms: number[]
}

/** effective size, D30, D60, uniformity coefficient and fineness modulus of a curve */
export function gradationStats(points: CurvePoint[]): GradationStats {
  const d10 = dAt(points, 10).d
  const d30 = dAt(points, 30).d
  const d60 = dAt(points, 60).d
  const fmTerms = FM_SIEVES.map((s) => 100 - finerAt(points, s))
  return { d10, d30, d60, cu: d60 / d10, cc: d30 ** 2 / (d10 * d60), fm: fmTerms.reduce((a, b) => a + b, 0) / 100, fmTerms }
}

/** MIT class of a grain size (mm) */
export function mitClass(d: number): 'silt/clay' | 'fine sand' | 'medium sand' | 'coarse sand' | 'fine gravel' {
  if (d < 0.06) return 'silt/clay'
  if (d < 0.2) return 'fine sand'
  if (d < 0.6) return 'medium sand'
  if (d <= 2) return 'coarse sand'
  return 'fine gravel'
}

// ------------------------------------------------------------------ layers
export interface Layer {
  top: number
  bot: number
  label?: string
  kind?: 'clay' | 'sand'
  fm?: number
  d10?: number
  d30?: number
  d60?: number
  cu?: number
  /** keep out of the screen zone for a reason other than grading (saline water above a clay seal, say) */
  exclude?: string
}

export type LayerClass = 'clay' | 'fine' | 'nonuniform' | 'borderline' | 'good' | 'excluded'

export interface RatedLayer extends Layer {
  cu: number
  d30: number
  cls: LayerClass
  /** can a screen sit in it? */
  usable: boolean
  why: string
}

/** her layer test: FM below 1 is silt/clay, Cu above 2.5 is too non-uniform; Cu = 2.5 is "borderline" (struck in her sheet) */
export function rateLayer(l: Layer): RatedLayer {
  const d10 = l.d10 ?? NaN
  const d60 = l.d60 ?? NaN
  const cu = l.cu ?? d60 / d10
  // log interpolation between D10 and D60 when D30 is not printed
  const d30 = l.d30 ?? d10 * (d60 / d10) ** 0.4
  const base = { ...l, cu, d30 }
  if (l.kind === 'clay' || l.fm === undefined) return { ...base, cls: 'clay', usable: false, why: 'clay: no screen' }
  if (l.exclude) return { ...base, cls: 'excluded', usable: false, why: l.exclude }
  if (l.fm < 1) return { ...base, cls: 'fine', usable: false, why: `FM ${l.fm} < 1: silt and fine sand` }
  if (cu > 2.5) return { ...base, cls: 'nonuniform', usable: false, why: `Cu ${r(cu, 2)} > 2.5: non-uniform` }
  if (cu >= 2.5 - 1e-9) return { ...base, cls: 'borderline', usable: false, why: 'Cu = 2.5: borderline, skipped' }
  return { ...base, cls: 'good', usable: true, why: `FM ${l.fm} ≥ 1 and Cu ${r(cu, 2)} < 2.5` }
}

const r = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d

/** the longest run of touching usable layers below `from` (ft); its top is clipped to `from` when the run starts above it */
export function chooseZone(layers: RatedLayer[], from: number): { top: number; bot: number; layers: RatedLayer[]; topIsInterface: boolean } | null {
  const sorted = [...layers].sort((a, b) => a.top - b.top)
  const runs: RatedLayer[][] = []
  let cur: RatedLayer[] = []
  for (const l of sorted) {
    if (l.usable && l.bot > from) {
      if (cur.length && Math.abs(cur[cur.length - 1].bot - l.top) < 1e-6) cur.push(l)
      else {
        if (cur.length) runs.push(cur)
        cur = [l]
      }
    } else {
      if (cur.length) runs.push(cur)
      cur = []
    }
  }
  if (cur.length) runs.push(cur)
  if (!runs.length) return null
  const spans = runs.map((run) => {
    const top = Math.max(run[0].top, from)
    return { top, bot: run[run.length - 1].bot, layers: run, topIsInterface: run[0].top >= from }
  })
  spans.sort((a, b) => b.bot - b.top - (a.bot - a.top))
  return spans[0]
}

// ------------------------------------------------------------------ housing pipe
export interface HousingInput {
  /** static water level, ft below ground */
  swl: number
  /** water-level decline, ft/yr (default 2) */
  decline?: number
  /** design life, yr (default 20) */
  years?: number
  /** drawdown while pumping, ft (10-15, default 15) */
  drawdown?: number
  /** extra safety, ft (10-15, default 15) */
  safety?: number
  /** pump bowl outside diameter, inch; the housing ID is this + 2 */
  bowlOD?: number
}
export function housingPipe(h: HousingInput) {
  const decline = h.decline ?? 2
  const years = h.years ?? 20
  const drawdown = h.drawdown ?? 15
  const safety = h.safety ?? 15
  const totalDecline = decline * years
  const length = h.swl + totalDecline + drawdown + safety
  return { swl: h.swl, decline, years, totalDecline, drawdown, safety, length, id: h.bowlOD !== undefined ? h.bowlOD + 2 : undefined }
}

// ------------------------------------------------------------------ strainer length
/** recommended share of the aquifer thickness that can be screened: 70 / 75 / 80 % for under 25 / 25-50 / over 50 ft */
export function screenShare(thickness: number) {
  return thickness < 25 ? 0.7 : thickness <= 50 ? 0.75 : 0.8
}

// ------------------------------------------------------------------ gravel pack
/** multiplying factor on D30 of the finest sand: 4 for Cu <= 1.5, 6 for Cu >= 2.5, straight line between */
export function packFactorExact(cu: number) {
  if (cu <= 1.5) return 4
  if (cu >= 2.5) return 6
  return 4 + 2 * (cu - 1.5)
}
export const packFactor = (cu: number, rounding: 'nearest' | 'none' = 'nearest') => (rounding === 'none' ? packFactorExact(cu) : Math.round(packFactorExact(cu)))

export interface PackCurve {
  d10: number
  d30: number
  d60: number
  cu: number
  /** how it was found */
  how: 'given' | 'parallel'
}

/**
 * Gravel pack gradation from the finest aquifer sample: D30 of the pack = factor x D30 of the sand, and the pack curve
 * drawn parallel to the sand curve (D10 and D60 scale by the same factor), flattened to Cu <= 2.5 if the sand is wider.
 */
export function gravelPackCurve(sand: { d10: number; d30: number; d60: number }, factor: number): PackCurve {
  const d10 = factor * sand.d10
  const d30 = factor * sand.d30
  let d60 = factor * sand.d60
  if (d60 / d10 > 2.5) d60 = 2.5 * d10
  return { d10, d30, d60, cu: d60 / d10, how: 'parallel' }
}

// ------------------------------------------------------------------ slot and open area
export const STD_SLOTS = [20, 30, 40]
export const STEEL_OPEN: Record<number, number> = { 20: 0.1, 30: 0.15, 40: 0.2 }

/** slot number = D10 of the pack (mm) / 25.4 x 1000 */
export const slotRaw = (d10mm: number) => (d10mm / MM_PER_IN) * 1000
/** round the raw slot number DOWN to a standard slot (the smallest one if it is below them all) */
export function slotChoice(d10mm: number, slots: number[] = STD_SLOTS) {
  const raw = slotRaw(d10mm)
  const sorted = [...slots].sort((a, b) => a - b)
  const below = sorted.filter((s) => s <= raw + 1e-9)
  const slot = below.length ? below[below.length - 1] : sorted[0]
  return { raw, slot, tooFine: !below.length, widthIn: slot / 1000, widthMm: (slot / 1000) * MM_PER_IN }
}

/** open-area fraction of a slot number; uPVC / PVC has half the steel value */
export function openFraction(slot: number, material: 'steel' | 'uPVC' = 'steel', table: Record<number, number> = STEEL_OPEN) {
  let f = table[slot]
  if (f === undefined) {
    const ks = Object.keys(table).map(Number).sort((a, b) => a - b)
    const lo = [...ks].reverse().find((k) => k <= slot) ?? ks[0]
    const hi = ks.find((k) => k >= slot) ?? ks[ks.length - 1]
    f = lo === hi ? table[lo] : table[lo] + ((slot - lo) / (hi - lo)) * (table[hi] - table[lo])
  }
  return material === 'uPVC' ? f / 2 : f
}

// ------------------------------------------------------------------ yield
export interface YieldInput {
  /** open-area fraction (0.15 = 15 %) */
  eta: number
  /** strainer diameter, inch */
  dIn: number
  /** screen length, ft */
  L: number
  /** permissible entrance velocity, ft/s (default 0.1) */
  vc?: number
  /** blockage factor (default 3 unless the paper says otherwise; her example uses 2.5) */
  fb?: number
}
/** Q = eta pi D L Vc / F_B  (ft^3/s) */
export function screenYield(y: YieldInput) {
  const vc = y.vc ?? 0.1
  const fb = y.fb ?? 3
  const dFt = y.dIn / 12
  const area = y.eta * Math.PI * dFt * y.L
  const cfs = (area * vc) / fb
  return { eta: y.eta, dFt, L: y.L, vc, fb, area, cfs, lph: cfsToLph(cfs), lps: cfs * L_PER_FT3, m3h: (cfs * L_PER_FT3 * 3600) / 1000 }
}
/** actual entrance velocity (ft/s) at a pumping rate Q (cfs), with or without the blockage factor */
export function entranceVelocity(Qcfs: number, eta: number, dIn: number, L: number, fb = 1) {
  return (Qcfs * fb) / (eta * Math.PI * (dIn / 12) * L)
}
/** daily yield of one well pumped `hours` a day, litres per day */
export const dailyYield = (lph: number, hours = 8) => lph * hours
/** wells needed = demand / yield, rounded up */
export const wellsNeeded = (demandLpd: number, yieldLpd: number) => Math.ceil(demandLpd / yieldLpd - 1e-9)

// ------------------------------------------------------------------ the whole design (borehole log + sieve curves per layer)
export interface DtwInput {
  layers: Layer[]
  housing: HousingInput
  /** strainer inside diameter, inch */
  strainerDia: number
  material?: 'steel' | 'uPVC'
  /** gravel pack thickness, inch (3-8) */
  packThickness: number
  /** the pack gradation, when the question gives it; otherwise it is derived from the finest sand in the screen zone */
  pack?: { d10: number; d30: number; d60: number }
  slots?: number[]
  open?: Record<number, number>
  vc?: number
  fb?: number
  /** longest practical screen, ft (100; 150 for high-yield, wide pipes) */
  maxScreen?: number
  /** clearance below a layer interface or the housing pipe, ft (10) */
  clearance?: number
  sandTrap?: number
  /** gravel pack extends this far above the screen, ft (20-50; default 40) */
  packAbove?: number
  /** put the screen at the top of the zone (+ clearance) or centred in it */
  placement?: 'top' | 'centre'
  /** pick the zone by hand [top, bot] instead of the longest run of good layers */
  zone?: [number, number]
  /** how the factor 4..6 is rounded: nearest whole number (as she does) or not at all */
  factorRounding?: 'nearest' | 'none'
  /** hours of pumping per day */
  hours?: number
  /** manual overrides (the lab): screen top depth, screen length, slot number */
  screenTop?: number
  screenLength?: number
  slotNo?: number
}

export interface DtwDesign {
  input: DtwInput
  layers: RatedLayer[]
  housing: ReturnType<typeof housingPipe>
  zone: { top: number; bot: number; topIsInterface: boolean } | null
  /** aquifer thickness available (zone bottom - zone top) */
  avail: number
  share: number
  /** screen length possible by the % rule and the length chosen */
  lenByShare: number
  maxScreen: number
  length: number
  clearance: number
  strainer: { top: number; bot: number }
  trap: { top: number; bot: number }
  blind: { top: number; bot: number }
  /** the finest layer in the screen zone */
  finest: RatedLayer | null
  factorExact: number
  factor: number
  pack: PackCurve
  packRange: { top: number; bot: number }
  boreholeDia: number
  slot: ReturnType<typeof slotChoice>
  eta: number
  yield: ReturnType<typeof screenYield>
  dailyLpd: number
  warnings: string[]
}

export function designDtw(inp: DtwInput): DtwDesign {
  const warnings: string[] = []
  const material = inp.material ?? 'steel'
  const clearance = inp.clearance ?? 10
  const sandTrap = inp.sandTrap ?? 10
  const maxScreen = inp.maxScreen ?? 100
  const hours = inp.hours ?? 8
  const housing = housingPipe(inp.housing)
  const layers = inp.layers.map(rateLayer)

  let zone: { top: number; bot: number; topIsInterface: boolean; layers: RatedLayer[] } | null
  if (inp.zone) zone = { top: inp.zone[0], bot: inp.zone[1], topIsInterface: inp.zone[0] >= housing.length, layers: layers.filter((l) => l.bot > inp.zone![0] && l.top < inp.zone![1]) }
  else zone = chooseZone(layers, housing.length)
  const manual = inp.screenTop !== undefined || inp.screenLength !== undefined || inp.slotNo !== undefined
  if (!zone && manual) {
    const bot = Math.max(...layers.map((l) => l.bot))
    zone = { top: housing.length, bot, topIsInterface: false, layers: [] }
  }
  if (!zone) throw new Error('no usable layer below the housing pipe')

  const avail = zone.bot - zone.top
  const share = screenShare(avail)
  const lenByShare = avail * share
  const length = inp.screenLength ?? Math.min(lenByShare, maxScreen)
  // position: clearance below the interface (or the housing bottom); centred if asked
  const spare = avail - length
  // below a layer interface: clearance. Directly below the housing pipe the pack needs at least 20 ft above the screen
  // (blind pipe length), so start there if the screen and trap still fit above the bottom of the zone.
  const minAbove = 20
  let sTop: number
  if (inp.placement === 'centre') sTop = zone.top + spare / 2
  else if (zone.topIsInterface) sTop = zone.top + clearance
  else sTop = Math.max(zone.top + clearance, Math.min(zone.top + Math.max(clearance, minAbove), zone.bot - sandTrap - length))
  if (inp.screenTop !== undefined) sTop = inp.screenTop
  const strainer = { top: sTop, bot: sTop + length }
  const trap = { top: strainer.bot, bot: strainer.bot + sandTrap }
  if (trap.bot > zone.bot + 1e-6) warnings.push('the sand trap passes the bottom of the zone: shorten the screen')
  const blind = { top: housing.length, bot: strainer.top }

  // finest sand within the screened depth: the lowest FM
  let within = layers.filter((l) => l.usable && l.bot > strainer.top && l.top < strainer.bot)
  if (manual) {
    // by hand the screen may sit in poor layers: design the pack for the finest sand it touches, else the last sand layer
    within = [...within, ...layers.filter((l) => !l.usable && l.kind !== 'clay' && l.fm !== undefined && l.bot > strainer.top && l.top < strainer.bot)]
    if (!within.length) within = layers.filter((l) => l.kind !== 'clay' && l.fm !== undefined).slice(-1)
  }
  const finest = within.length ? within.reduce((a, b) => ((a.fm ?? 9) <= (b.fm ?? 9) ? a : b)) : null
  const exactFactor = finest ? packFactorExact(finest.cu) : NaN
  const factor = finest ? packFactor(finest.cu, inp.factorRounding ?? 'nearest') : NaN
  let pack: PackCurve
  if (inp.pack) pack = { ...inp.pack, cu: inp.pack.d60 / inp.pack.d10, how: 'given' }
  else if (finest) pack = gravelPackCurve({ d10: finest.d10 ?? NaN, d30: finest.d30, d60: finest.d60 ?? NaN }, factor)
  else throw new Error('no pack data')
  if (pack.cu > 2.5) warnings.push(`pack Cu ${r(pack.cu, 2)} > 2.5`)

  const slot = slotChoice(pack.d10, inp.slots)
  if (inp.slotNo !== undefined) {
    slot.slot = inp.slotNo
    slot.widthIn = inp.slotNo / 1000
    slot.widthMm = (inp.slotNo / 1000) * MM_PER_IN
    slot.tooFine = false
  }
  if (slot.tooFine) warnings.push('D10 of the pack is finer than the smallest slot')
  const eta = openFraction(slot.slot, material, inp.open ?? STEEL_OPEN)
  const y = screenYield({ eta, dIn: inp.strainerDia, L: length, vc: inp.vc, fb: inp.fb })
  if (length > 100) warnings.push('screen longer than 100 ft is hard to keep vertical')

  const packAbove = inp.packAbove ?? 40
  // the pack stops at the bottom of the housing pipe
  const packRange = { top: Math.max(strainer.top - packAbove, housing.length), bot: trap.bot }
  if (strainer.top - packRange.top < 20) warnings.push('the gravel pack is less than 20 ft above the screen: the housing pipe is too close')

  return {
    input: inp,
    layers,
    housing,
    zone: { top: zone.top, bot: zone.bot, topIsInterface: zone.topIsInterface },
    avail,
    share,
    lenByShare,
    maxScreen,
    length,
    clearance,
    strainer,
    trap,
    blind,
    finest,
    factorExact: exactFactor,
    factor,
    pack,
    packRange,
    boreholeDia: inp.strainerDia + 2 * inp.packThickness,
    slot,
    eta,
    yield: y,
    dailyLpd: dailyYield(y.lph, hours),
    warnings,
  }
}

// ------------------------------------------------------------------ the older papers: "design a tubewell from sieve analysis"
export interface SieveDesignInput {
  rows: SieveRow[]
  pan: number
  /** strainer diameter, mm */
  strainerMm?: number
  /** aquifer thickness, m */
  thicknessM?: number
  /** open area, as printed (fraction) */
  open?: number
  slots?: number[]
  fb?: number
  vc?: number
  maxScreen?: number
  factorRounding?: 'nearest' | 'none'
}
/**
 * Older-paper variant (2007-08 .. 2016-17): the sieve data are the aquifer sample; the screen length is the % rule on the
 * given aquifer thickness (capped at 100 ft); the same pack factor and slot rules; yield with the printed open area.
 */
export function designFromSieve(inp: SieveDesignInput) {
  const tab = sieveTable(inp.rows, inp.pan)
  const st = gradationStats(tab.points)
  const exact = packFactorExact(st.cu)
  const factor = packFactor(st.cu, inp.factorRounding ?? 'nearest')
  const pack = gravelPackCurve({ d10: st.d10, d30: st.d30, d60: st.d60 }, factor)
  const slot = slotChoice(pack.d10, inp.slots)
  let screen: null | { thicknessFt: number; share: number; lenByShare: number; maxScreen: number; Lft: number; Lm: number } = null
  let y: ReturnType<typeof screenYield> | null = null
  if (inp.thicknessM !== undefined) {
    const thicknessFt = mToFt(inp.thicknessM)
    const share = screenShare(thicknessFt)
    const lenByShare = thicknessFt * share
    const maxScreen = inp.maxScreen ?? 100
    const Lft = Math.min(lenByShare, maxScreen)
    screen = { thicknessFt, share, lenByShare, maxScreen, Lft, Lm: ftToM(Lft) }
    if (inp.strainerMm !== undefined && inp.open !== undefined) y = screenYield({ eta: inp.open, dIn: inp.strainerMm / MM_PER_IN, L: Lft, vc: inp.vc, fb: inp.fb })
  }
  return { tab, stats: st, mit: mitClass(dAt(tab.points, 50).d), factorExact: exact, factor, pack, slot, screen, yield: y }
}

// ------------------------------------------------------------------ hand pumps (L4 Part 2, M8)
export const SUCTION = { theoreticalFt: 32.8, practicalFt: [22, 25] as const, practicalM: 7.5, patmPsi: 14.7, ftPerPsi: 2.31 }
export interface HandPumpResult {
  swlM: number
  swlFt: number
  no6: boolean
  tara: boolean
  best: 'No. 6' | 'Tara' | 'motorised / deeper pump'
  why: string
}
/** which hand pump can lift from a static water level (m below the pump base): No. 6 suction ≤ 7.5 m; deep-set (Tara, force mode) to 30 m */
export function handPumpChoice(swlM: number): HandPumpResult {
  const no6 = swlM <= SUCTION.practicalM
  const tara = swlM <= 30
  const best = no6 ? 'No. 6' : tara ? 'Tara' : 'motorised / deeper pump'
  const why = no6
    ? `SWL ${swlM} m is within the 7.5 m practical suction limit, so a shallow No. 6 tubewell works`
    : tara
      ? `${swlM} m is beyond suction (7.5 m practical, 10 m theoretical); a deep-set pump with the piston below the water level (Tara, force mode) reaches up to about 30 m`
      : `${swlM} m is beyond even the deep-set limit (about 30 m): use a submersible / deep tubewell pump`
  return { swlM, swlFt: mToFt(swlM), no6, tara, best, why }
}
/** theoretical suction lift (ft of water) from atmospheric pressure in psi */
export const suctionLiftFt = (patmPsi = 14.7) => patmPsi * 2.31

// ------------------------------------------------------------------ a sketch of a curve from D10, D30, D60 (labs)
/** a smooth-looking gradation curve through (D10, 10), (D30, 30), (D60, 60), extended at both ends along the nearer slope */
export function curveFromD(d10: number, d30: number, d60: number): CurvePoint[] {
  const l10 = Math.log10(d10)
  const l30 = Math.log10(d30)
  const l60 = Math.log10(d60)
  const s1 = (l30 - l10) / 20
  const s2 = (l60 - l30) / 30
  const at = (p: number) => (p <= 30 ? l30 + (p - 30) * s1 : l30 + (p - 30) * s2)
  const ps = [1, 5, 10, 20, 30, 45, 60, 80, 95, 100]
  return ps.map((p) => ({ size: 10 ** at(p), finer: p }))
}

// ------------------------------------------------------------------ rule checks for a (possibly hand-made) design
export interface DtwCheck {
  level: 'bad' | 'warn' | 'ok'
  text: string
}
/** the rules she teaches, applied to a design; `pumpCfs` is the rate you intend to pump (entrance velocity check) */
export function dtwChecks(d: DtwDesign, pumpCfs?: number): DtwCheck[] {
  const out: DtwCheck[] = []
  const { strainer, housing } = d
  if (strainer.top < housing.length) out.push({ level: 'bad', text: `the screen starts at ${r(strainer.top, 0)} ft, above the bottom of the housing pipe (${housing.length} ft): the pump could run dry or the pipe cannot hold the screen` })
  const touched = d.layers.filter((l) => l.bot > strainer.top && l.top < strainer.bot)
  for (const l of touched) {
    const ov = Math.min(l.bot, strainer.bot) - Math.max(l.top, strainer.top)
    if (l.kind === 'clay') out.push({ level: 'bad', text: `${r(ov, 0)} ft of the screen sits in clay (${l.top}–${l.bot} ft)` })
    else if (l.cls === 'excluded') out.push({ level: 'bad', text: `${r(ov, 0)} ft of the screen sits in the layer ${l.top}–${l.bot} ft: ${l.exclude}` })
    else if (!l.usable) out.push({ level: 'warn', text: `${r(ov, 0)} ft of the screen sits in ${l.top}–${l.bot} ft: ${l.why}` })
  }
  // clearance below a poor layer above the screen
  const above = d.layers.find((l) => Math.abs(l.bot - strainer.top) < 1e-6 || (l.bot > strainer.top - d.clearance && l.bot <= strainer.top))
  if (above && !above.usable) out.push({ level: 'warn', text: `only ${r(strainer.top - above.bot, 0)} ft below the ${above.kind === 'clay' ? 'clay' : 'poor'} layer ending at ${above.bot} ft: keep ${d.clearance} ft so converging flow does not draw its fines in` })
  if (d.length > d.maxScreen) out.push({ level: 'warn', text: `a ${r(d.length, 0)} ft screen is hard to keep vertical (limit ${d.maxScreen} ft)` })
  const bottom = Math.max(...d.layers.filter((l) => l.kind !== 'clay').map((l) => l.bot))
  if (d.trap.bot > bottom + 1e-6) out.push({ level: 'warn', text: `the sand trap ends at ${r(d.trap.bot, 0)} ft, below the aquifer (${bottom} ft)` })
  if (d.packRange.top >= strainer.top) out.push({ level: 'warn', text: 'the gravel pack does not rise above the screen' })
  if (d.pack.cu > 2.5) out.push({ level: 'warn', text: `the pack is too graded (Cu ${r(d.pack.cu, 2)} > 2.5)` })
  const raw = d.slot.raw
  if (d.slot.slot > raw + 1e-9) out.push({ level: 'bad', text: `slot ${d.slot.slot} is wider than D10 of the pack (${r(raw, 1)}): more than 10 % of the pack runs through, so sand will pump` })
  else if (d.slot.slot < 0.55 * raw) out.push({ level: 'warn', text: `slot ${d.slot.slot} is far finer than ${r(raw, 1)}: the openings choke and the entrance loss grows` })
  if (pumpCfs !== undefined) {
    const v = entranceVelocity(pumpCfs, d.eta, d.input.strainerDia, d.length, d.yield.fb)
    if (v > (d.yield.vc ?? 0.1) + 1e-9) out.push({ level: 'bad', text: `entrance velocity ${r(v, 3)} ft/s at this pumping rate exceeds ${d.yield.vc} ft/s: incrustation, corrosion and sand` })
  }
  if (!out.length) out.push({ level: 'ok', text: 'every rule is met' })
  return out
}
