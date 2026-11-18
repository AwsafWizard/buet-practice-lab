// Ion-exchange softening (CE 331 T08): bypass fraction, run length, salt, fixed-bed sizing. The exchanger is taken to remove all hardness.

export interface Home {
  /** bypass fraction (exact H_des/H_raw, or the rounded one passed in) */
  bypass: number
  treated: number
  /** treated flow, L/d */
  treatedLpd: number
  /** hardness load on the resin, kg/d */
  loadKgD: number
  /** resin capacity, kg as CaCO3 */
  capKg: number
  days: number
}
/** home softener (T08-A, Jan 2021 Q4(b), 2022-23 Q2(c)): V m³ resin of `cap` kg/m³, Q L/d, hardness raw → desired mg/L */
export function homeSoftener(p: { V: number; cap: number; Qlpd: number; Hraw: number; Hdes: number; bypass?: number }): Home {
  const bypass = p.bypass ?? p.Hdes / p.Hraw
  const treated = 1 - bypass
  const treatedLpd = p.Qlpd * treated
  const loadKgD = (treatedLpd * p.Hraw) / 1e6
  const capKg = p.V * p.cap
  return { bypass, treated, treatedLpd, loadKgD, capKg, days: capKg / loadKgD }
}

export interface FixedBed {
  bypass: number
  /** flow through the exchanger, m³/d and m³/min */
  Qtreated: number
  QtreatedMin: number
  /** bed area for the full treated flow (m²) */
  A: number
  D: number
  /** resin volume of one bed */
  V: number
  /** hardness applied per m² of bed, kg/min */
  loadPerM2: number
  /** run time between regenerations (min and h) */
  runMin: number
  runH: number
  /** salt per regeneration (kg) and brine (m³ at the strength, 1 kg/L) per bed */
  saltKg: number
  brineM3: number
  cyclesPerDay: number
  saltKgPerDay: number
  /** hardness removed per cycle (kg) */
  removedKg: number
}
/** T08-B / 2023-24 Q4(c): plant flow Q (m³/d), raw and desired hardness, capacity kg/m³, loading m³/min·m², bed depth, regen kg NaCl per m³ resin, brine strength */
export function fixedBed(p: { Q: number; Hraw: number; Hdes: number; cap: number; loading: number; depth: number; regen: number; strength: number }): FixedBed {
  const bypass = Math.min(1, p.Hdes / p.Hraw)
  const Qtreated = p.Q * (1 - bypass)
  const QtreatedMin = Qtreated / 1440
  const A = QtreatedMin / p.loading
  const V = A * p.depth
  const loadPerM2 = (p.loading * p.Hraw) / 1000
  const runMin = (p.cap * p.depth) / loadPerM2
  const saltKg = p.regen * V
  const cyclesPerDay = 1440 / runMin
  return { bypass, Qtreated, QtreatedMin, A, D: p.depth, V, loadPerM2, runMin, runH: runMin / 60, saltKg, brineM3: saltKg / p.strength / 1000, cyclesPerDay, saltKgPerDay: saltKg * cyclesPerDay, removedKg: p.cap * V }
}

/** a qualitative breakthrough curve: effluent hardness (fraction of feed) against the fraction of capacity used */
export function breakthrough(used: number, leak = 0.02, sharp = 28) {
  const f = 1 / (1 + Math.exp(-sharp * (used - 0.92)))
  return leak + (1 - leak) * f
}
