// Coagulation numbers (CE 331 T06): alkalinity consumed, pH with no alkalinity, G and Gt.
export interface Coagulant {
  id: 'alum' | 'alum18' | 'fecl3'
  label: string
  mw: number
  /** mol HCO3⁻ consumed per mol coagulant */
  hco3: number
  /** mol strong acid (H2SO4 or HCl) made per mol when there is no alkalinity */
  acid: number
  acidProtons: number
}
export const COAGULANTS: Record<Coagulant['id'], Coagulant> = {
  alum: { id: 'alum', label: 'Alum Al₂(SO₄)₃·14H₂O (slides)', mw: 594, hco3: 6, acid: 3, acidProtons: 2 },
  alum18: { id: 'alum18', label: 'Alum Al₂(SO₄)₃·18H₂O (class notes)', mw: 666, hco3: 6, acid: 3, acidProtons: 2 },
  fecl3: { id: 'fecl3', label: 'Ferric chloride FeCl₃', mw: 55.85 + 3 * 35.45, hco3: 3, acid: 3, acidProtons: 1 },
}
export interface AlkUse {
  mmol: number
  /** mg/L as CaCO3 consumed */
  alk: number
  perMg: number
  /** as HCO3⁻ mg/L */
  hco3: number
}
export function alkConsumed(id: Coagulant['id'], dose: number): AlkUse {
  const c = COAGULANTS[id]
  const mmol = dose / c.mw
  const alk = mmol * c.hco3 * 50
  return { mmol, alk, perMg: alk / dose, hco3: mmol * c.hco3 * 61 }
}
/** alkalinity to add when the water has too little: shortfall in mg/L as CaCO3, as Ca(OH)2 (×74/100) and Na2CO3 (×106/100) */
export function alkShortfall(p: { id: Coagulant['id']; dose: number; alk: number; reserve?: number }) {
  const use = alkConsumed(p.id, p.dose)
  const need = use.alk + (p.reserve ?? 0)
  const short = Math.max(need - p.alk, 0)
  return { use, need, short, lime: short * 0.74, soda: short * 1.06 }
}
/** T06-B: 100 mg/L alum in water with no alkalinity: all acid stays, pH from [H⁺]; NaOH to bring it to 7 */
export function alumNoAlkalinity(p: { dose: number; id?: Coagulant['id'] }) {
  const c = COAGULANTS[p.id ?? 'alum']
  const mmol = p.dose / c.mw
  const acid = c.acid * mmol
  const H = c.acidProtons * acid * 1e-3
  return { mmol, acidMmol: acid, H, pH: -Math.log10(H), naohMmol: c.acidProtons * acid, naohMgL: c.acidProtons * acid * 40 }
}
/** G = √(P/(µV)) in s⁻¹ (P watt, µ Pa·s, V m³) */
export const velocityGradient = (P: number, mu: number, V: number) => Math.sqrt(P / (mu * V))
export const powerForG = (G: number, mu: number, V: number) => G * G * mu * V
