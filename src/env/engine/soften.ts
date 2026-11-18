// Lime–soda softening as Tanvir sir does it (CE 331 T07 + the split-treatment sheet). Everything in mg/L as CaCO3.
//  selective Ca removal : lime = CO2 + alkalinity (+ excess), soda = Ca-NCH only if wanted
//  complete (practical limits Ca 30, Mg 10): lime = CO2 + alkalinity + Mg (+ excess), soda = NCH = TH − alk
//  split: X = (Mg_f − Mg_i)/(Mg_r − Mg_i) bypassed; doses weighted (1−X)·first stage + X·second stage (selective).
import { hardness, toCaCO3, type HardnessOut } from './chem'

export interface Water {
  co2: number
  ca: number
  mg: number
  na: number
  cl: number
  so4: number
  /** alkalinity (HCO3⁻) */
  alk: number
}
/** ions in mg/L as the ion → Water in mg/L as CaCO3 (alkalinity given directly as CaCO3, or as HCO3⁻ mg/L) */
export function waterFromIons(i: { co2?: number; ca?: number; mg?: number; na?: number; cl?: number; so4?: number; hco3?: number; alkCaCO3?: number }): Water {
  return {
    co2: toCaCO3('co2', i.co2 ?? 0),
    ca: toCaCO3('ca', i.ca ?? 0),
    mg: toCaCO3('mg', i.mg ?? 0),
    na: toCaCO3('na', i.na ?? 0),
    cl: toCaCO3('cl', i.cl ?? 0),
    so4: toCaCO3('so4', i.so4 ?? 0),
    alk: i.alkCaCO3 ?? toCaCO3('hco3', i.hco3 ?? 0),
  }
}
export const analyse = (w: Water): HardnessOut => hardness(w)

export const PRACTICAL = { ca: 30, mg: 10 }
/** CO2 above 10 mg/L (22.7 as CaCO3) is better stripped than neutralised with lime */
export const co2StripLimit = 22.7

export type Mode = 'selective' | 'complete'
/** slide p6: excess lime 20 for Ca removal, 20 for Mg removal 20–40, 40 for Mg removal > 40 */
export function slideExcess(w: Water, mode: Mode) {
  if (mode === 'selective') return 20
  return w.mg > 40 ? 40 : 20
}
/** "only the Mg above 40 mg/L as CaCO3 is worth removing" */
export const autoMode = (w: Water): Mode => (w.mg > 40 ? 'complete' : 'selective')

export interface Finished {
  ca: number
  mg: number
  na: number
  cl: number
  so4: number
  /** alkalinity left (CO3²⁻ / OH⁻) before recarbonation, by electroneutrality */
  alk: number
  co2: number
  th: number
}
export interface Treat {
  mode: Mode
  excess: number
  lime: number
  soda: number
  limeParts: { co2: number; alk: number; mg: number; excess: number }
  sodaPart: number
  h: HardnessOut
  /** after lime and soda, before recarbonation */
  after: Finished
  /** after recarbonation (excess lime gone, pH 8.4–8.6) */
  final: Finished
}
export function treat(w: Water, o: { mode: Mode; excess?: number; removeCaNch?: boolean }): Treat {
  const h = hardness(w)
  const excess = o.excess ?? 0
  let lime: number
  let soda: number
  let ca: number
  let mg: number
  const limeParts = { co2: w.co2, alk: w.alk, mg: 0, excess }
  if (o.mode === 'complete') {
    limeParts.mg = w.mg
    lime = w.co2 + w.alk + w.mg + excess
    soda = h.nch
    ca = PRACTICAL.ca
    mg = PRACTICAL.mg
  } else {
    lime = w.co2 + w.alk + excess
    soda = o.removeCaNch ? h.caNch : 0
    // the carbonate part of Ca falls to the practical limit; Ca-NCH stays unless soda removes it
    ca = o.removeCaNch ? Math.min(w.ca, PRACTICAL.ca) : h.caNch + Math.min(h.caH - h.caNch, PRACTICAL.ca)
    mg = w.mg
  }
  const na = w.na + soda
  const alk0 = ca + mg + na - w.cl - w.so4
  const mk = (extra: number): Finished => ({ ca: ca + extra, mg, na, cl: w.cl, so4: w.so4, alk: alk0 + extra, co2: 0, th: ca + extra + mg })
  return { mode: o.mode, excess, lime, soda, limeParts, sodaPart: soda, h, after: mk(excess), final: mk(0) }
}

export interface Masses {
  /** mg/L of each chemical at its purity */
  CaO: number
  CaOH2: number
  Na2CO3: number
}
export function masses(lime: number, soda: number, purityLime = 1, puritySoda = 1): Masses {
  return { CaO: (lime * 0.56) / purityLime, CaOH2: (lime * 0.74) / purityLime, Na2CO3: (soda * 1.06) / puritySoda }
}

// ---------------------------------------------------------------- split treatment
export interface Split {
  X: number
  treated: number
  first: Treat
  second: Treat
  mgFinal: number
  /** TH after blending raw (X) with first-stage water (1−X) */
  blended: number
  secondNeeded: boolean
  lime: number
  soda: number
  /** finished hardness: the blend, or after the second stage removes Ca-CH from the bypassed part */
  finalTH: number
  rawTH: number
  firstTH: number
}
/** Mg-controlled split: X = (Mg_f − Mg_i)/(Mg_r − Mg_i) */
export function splitTreatment(w: Water, o: { mgFinal?: number; thMax?: number; excess?: number }): Split {
  const mgFinal = o.mgFinal ?? 40
  const X = w.mg <= mgFinal ? 1 : Math.max(0, Math.min(1, (mgFinal - PRACTICAL.mg) / (w.mg - PRACTICAL.mg)))
  return splitAt(w, X, { thMax: o.thMax, excess: o.excess, mgFinal })
}
/** split with a chosen bypass X (for a total-hardness target: X = (TH_f − 40)/(TH_raw − 40)) */
export function splitAt(w: Water, X: number, o: { thMax?: number; excess?: number; mgFinal?: number }): Split {
  const first = treat(w, { mode: 'complete', excess: o.excess })
  const second = treat(w, { mode: 'selective', excess: o.excess })
  const rawTH = w.ca + w.mg
  const firstTH = first.final.th
  const blended = X * rawTH + (1 - X) * firstTH
  const secondNeeded = o.thMax !== undefined && blended > o.thMax + 1e-9
  const lime = (1 - X) * first.lime + (secondNeeded ? X * second.lime : 0)
  const soda = (1 - X) * first.soda
  const finalTH = secondNeeded ? X * second.final.th + (1 - X) * firstTH : blended
  return { X, treated: 1 - X, first, second, mgFinal: o.mgFinal ?? NaN, blended, secondNeeded, lime, soda, finalTH, rawTH, firstTH }
}
/** bypass needed to hit a total hardness target with complete treatment (40) of the rest */
export const bypassForHardness = (rawTH: number, target: number, treatedTH = 40) => Math.max(0, Math.min(1, (target - treatedTH) / (rawTH - treatedTH)))

// ---------------------------------------------------------------- bar diagram
export interface Seg {
  k: string
  from: number
  to: number
}
export interface Bars {
  cations: Seg[]
  anions: Seg[]
  co2: number
}
/** Ca → Mg → Na on the cation line; HCO3 → Cl → SO4 on the anion line; CO2 to the left of zero */
export function bars(c: { ca: number; mg: number; na: number; cl: number; so4: number; alk: number; co2: number }): Bars {
  const line = (items: [string, number][]) => {
    let at = 0
    const out: Seg[] = []
    for (const [k, v] of items) {
      if (v > 1e-9) out.push({ k, from: at, to: at + v })
      at += Math.max(v, 0)
    }
    return out
  }
  return { cations: line([['Ca', c.ca], ['Mg', c.mg], ['Na', c.na]]), anions: line([['HCO₃', c.alk], ['Cl', c.cl], ['SO₄', c.so4]]), co2: c.co2 }
}
