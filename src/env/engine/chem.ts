// Water chemistry as Tanvir sir does it (CE 331, T01–T04): ions to mg/L as CaCO3, hardness split, alkalinity species,
// Henry's law (TCE example), carbonate equilibria and the pH of CO2 water, Langelier / Ryznar indices.
// Equivalent-weight factors are his rounded ones, so the slides' own numbers (238, 90.6, 56.2, 95.6, 76, 12.5) come out exactly.

export type Ion = 'ca' | 'mg' | 'na' | 'k' | 'hco3' | 'co3' | 'so4' | 'cl' | 'co2' | 'oh' | 'no3'

/** mg/L as CaCO3 = mg/L of the ion × factor (50 / equivalent weight), as he rounds them */
export const TO_CACO3: Record<Ion, number> = {
  ca: 2.5,
  mg: 4.12,
  na: 2.174,
  k: 1.279,
  hco3: 0.82,
  co3: 50 / 30,
  so4: 1.042,
  cl: 1.41,
  co2: 2.27,
  oh: 50 / 17,
  no3: 50 / 62,
}
export const ION_LABEL: Record<Ion, string> = { ca: 'Ca²⁺', mg: 'Mg²⁺', na: 'Na⁺', k: 'K⁺', hco3: 'HCO₃⁻', co3: 'CO₃²⁻', so4: 'SO₄²⁻', cl: 'Cl⁻', co2: 'CO₂', oh: 'OH⁻', no3: 'NO₃⁻' }
/** molecular (or atomic) weights he uses */
export const MW = { CaCO3: 100, Ca: 40.08, Mg: 24.3, Na: 23, HCO3: 61, CO3: 60, SO4: 96, Cl: 35.45, CO2: 44, OH: 17, H2O: 18, water_molL: 55.6 }

export const toCaCO3 = (ion: Ion, mgL: number) => mgL * TO_CACO3[ion]

export interface HardnessIn {
  /** Ca²⁺ as CaCO3 */
  ca: number
  /** Mg²⁺ as CaCO3 */
  mg: number
  /** alkalinity as CaCO3 */
  alk: number
}
export interface HardnessOut {
  th: number
  caH: number
  mgH: number
  alk: number
  /** carbonate hardness = the part of TH matched by alkalinity */
  ch: number
  /** non-carbonate hardness */
  nch: number
  /** Ca part of the NCH (Ca − alk when positive) */
  caNch: number
  /** Mg part of the NCH */
  mgNch: number
  /** alkalinity beyond the hardness ("Na2CO3 alkalinity") */
  excessAlk: number
}
/** TH, CH, NCH: if TH > alk then CH = alk, NCH = TH − alk; if TH ≤ alk then CH = TH, NCH = 0 */
export function hardness(w: HardnessIn): HardnessOut {
  const th = w.ca + w.mg
  const ch = Math.min(th, w.alk)
  const nch = Math.max(th - w.alk, 0)
  const caNch = Math.max(w.ca - w.alk, 0)
  return { th, caH: w.ca, mgH: w.mg, alk: w.alk, ch, nch, caNch, mgNch: nch - caNch, excessAlk: Math.max(w.alk - th, 0) }
}

// ---------------------------------------------------------------- alkalinity
/** alkalinity from a titration, class way: P and M in mL of 0.02 N acid for a sample of `vol` mL (1 mL = 1 mg as CaCO3) */
export function alkalinityTitration(p: { vol: number; M: number; P: number; pH?: number }) {
  const total = (p.M * 1000) / p.vol
  const out: { total: number; oh: number; co3: number; hco3: number; mlOH: number; mlCO3: number; mlHCO3: number; viaPH: boolean; rule: string } = { total, oh: 0, co3: 0, hco3: 0, mlOH: 0, mlCO3: 0, mlHCO3: 0, viaPH: false, rule: '' }
  const slideRule = (): string => {
    if (p.P === 0) return 'P = 0: all alkalinity is HCO₃⁻'
    if (Math.abs(p.P - p.M) < 1e-9) return 'P = M: all alkalinity is OH⁻'
    if (Math.abs(p.P - p.M / 2) < 1e-9) return 'P = M/2: all alkalinity is CO₃²⁻'
    return p.P < p.M / 2 ? 'P < M/2: HCO₃⁻ and CO₃²⁻' : 'P > M/2: OH⁻ and CO₃²⁻'
  }
  out.rule = slideRule()
  if (p.pH !== undefined && p.pH >= 9.5) {
    // class way: the OH⁻ of a pH ≥ ~10 sample is counted: [OH⁻] = 10^(pH−14) mol/L, × 17 g/mol, × 50/17 → mg/L as CaCO3
    const ohCC = Math.pow(10, p.pH - 14) * 17 * 1000 * (50 / 17)
    out.viaPH = true
    out.oh = ohCC
    out.mlOH = (ohCC * p.vol) / 1000
    out.mlCO3 = 2 * (p.P - out.mlOH)
    out.mlHCO3 = p.M - out.mlOH - out.mlCO3
    out.co3 = (out.mlCO3 * 1000) / p.vol
    out.hco3 = (out.mlHCO3 * 1000) / p.vol
  } else {
    out.mlCO3 = 2 * p.P
    out.mlHCO3 = p.M - 2 * p.P
    out.co3 = (out.mlCO3 * 1000) / p.vol
    out.hco3 = (out.mlHCO3 * 1000) / p.vol
  }
  return out
}

/** fractions of total carbonate (H2CO3*, HCO3⁻, CO3²⁻) at a pH */
export function carbonateFractions(pH: number, pK1 = 6.3, pK2 = 10.3) {
  const h = Math.pow(10, -pH)
  const k1 = Math.pow(10, -pK1)
  const k2 = Math.pow(10, -pK2)
  const d = h * h + k1 * h + k1 * k2
  return { a0: (h * h) / d, a1: (k1 * h) / d, a2: (k1 * k2) / d }
}

export interface AlkFromBicarb {
  hcoM: number
  coM: number
  ohM: number
  hM: number
  /** mg/L as CaCO3 */
  hco3: number
  co3: number
  oh: number
  total: number
  th: number
  ch: number
  nch: number
  ratio: number
}
/** 2020-21 Q8(b): given HCO3⁻ (mg/L), pH, and K2, Kw: CO3²⁻ = K2·HCO3⁻/H⁺; alkalinity = HCO3 + 2CO3 + OH − H (eq/L) */
export function alkalinityFromBicarbonate(p: { hco3mgL: number; pH: number; pK2: number; th?: number }): AlkFromBicarb {
  const hcoM = p.hco3mgL / MW.HCO3 / 1000
  const hM = Math.pow(10, -p.pH)
  const ratio = Math.pow(10, p.pH - p.pK2) // [CO3]/[HCO3] = K2/[H]
  const coM = hcoM * ratio
  const ohM = Math.pow(10, p.pH - 14)
  const eq = hcoM + 2 * coM + ohM - hM
  const total = eq * 50000
  const th = p.th ?? NaN
  return { hcoM, coM, ohM, hM, hco3: hcoM * 50000, co3: 2 * coM * 50000, oh: ohM * 50000, total, th, ch: Number.isFinite(th) ? Math.min(th, total) : NaN, nch: Number.isFinite(th) ? Math.max(th - total, 0) : NaN, ratio }
}

// ---------------------------------------------------------------- Henry's law
/** mg of gas per litre of water for a mole fraction x (mol gas per mol water): x × 55.6 mol/L × MW × 1000 */
export const mgLFromMoleFraction = (x: number, mw: number) => x * MW.water_molL * mw * 1000
/** µg/L */
export const ugLFromMoleFraction = (x: number, mw: number) => mgLFromMoleFraction(x, mw) * 1000

/**
 * TCE example (T04-C, 2023-24 Q1(b)): the water holds x mol gas per mol water; it is put in contact with n_air mol of air that
 * carries the gas away. At equilibrium P (mol/mol air) = H · C (mol/mol water): (X/n_air) = H (x − X)  →  X = H x / (1/n_air + H)... as he writes:
 * H = [X/n_air]/[x − X]  ⇒  X = H x /(1/n_air + H).
 */
export function henryWithAir(p: { x: number; H: number; nAir: number; mw: number }) {
  const X = (p.H * p.x) / (1 / p.nAir + p.H)
  const xLeft = p.x - X
  return { X, xLeft, gAir: X / p.nAir, mgL0: mgLFromMoleFraction(p.x, p.mw), mgLLeft: mgLFromMoleFraction(xLeft, p.mw), ugL0: ugLFromMoleFraction(p.x, p.mw), ugLLeft: ugLFromMoleFraction(xLeft, p.mw), fractionLeft: xLeft / p.x }
}
/** equilibrium water concentration (mole fraction) for a partial pressure P (atm) when H is in atm: x = P/H */
export const henryEquilibriumX = (P: number, H: number) => P / H

// ---------------------------------------------------------------- pH of CO2 water
export interface Co2pH {
  h2co3: number
  H: number
  pH: number
  approxPH: number
  hco3: number
  co3: number
}
/**
 * 2023-24 Q2(b): [H2CO3*] = K_H·P, then pH from the charge balance H⁺ = HCO3⁻ + 2CO3²⁻ + OH⁻ (bisection),
 * and the textbook shortcut [H⁺] = √(K1 [H2CO3*]).  K1 is not printed in that paper: 10^-6.3 is the value on Tanvir sir's 2020-21 Q8(b) sheet.
 */
export function phOfCo2Water(p: { KH: number; P: number; pK1?: number; pK2?: number }): Co2pH {
  const k1 = Math.pow(10, -(p.pK1 ?? 6.3))
  const k2 = Math.pow(10, -(p.pK2 ?? 10.3))
  const h2 = p.KH * p.P
  const bal = (pH: number) => {
    const h = Math.pow(10, -pH)
    return h - (k1 * h2) / h - (2 * k1 * k2 * h2) / (h * h) - 1e-14 / h
  }
  let lo = 1
  let hi = 7
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (bal(mid) > 0) lo = mid
    else hi = mid
  }
  const pH = (lo + hi) / 2
  const H = Math.pow(10, -pH)
  return { h2co3: h2, H, pH, approxPH: -Math.log10(Math.sqrt(k1 * h2)), hco3: (k1 * h2) / H, co3: (k1 * k2 * h2) / (H * H) }
}

// ---------------------------------------------------------------- Langelier / Ryznar (2012-13 Q1(c); textbook)
export interface Langelier {
  pCa: number
  pAlk: number
  pHs: number
  lsi: number
  rsi: number
  lsiVerdict: string
  rsiVerdict: string
}
/** pHs = (pK2 − pKs) + pCa + pAlk, with Ca in mol/L and alkalinity in eq/L; LSI = pH − pHs; RSI = 2 pHs − pH */
export function langelier(p: { pH: number; pK2minusPKs: number; caMgL: number; alkCaCO3: number }): Langelier {
  const pCa = -Math.log10(p.caMgL / MW.Ca / 1000)
  const pAlk = -Math.log10(p.alkCaCO3 / 50 / 1000)
  const pHs = p.pK2minusPKs + pCa + pAlk
  const lsi = p.pH - pHs
  const rsi = 2 * pHs - p.pH
  const lsiVerdict = Math.abs(lsi) < 0.1 ? 'about in equilibrium (balanced)' : lsi > 0 ? 'supersaturated with CaCO₃: scale-forming' : 'undersaturated: corrosive (no protective scale)'
  const rsiVerdict = rsi < 6 ? 'heavy scale' : rsi < 6.8 ? 'scale-forming' : rsi <= 7.0 ? 'balanced' : rsi < 7.5 ? 'slightly corrosive' : rsi < 8.5 ? 'corrosive' : 'heavily corrosive'
  return { pCa, pAlk, pHs, lsi, rsi, lsiVerdict, rsiVerdict }
}
