// Disinfection numbers (CE 331 T10): dose = demand + residual, Chick–Watson, and a qualitative breakpoint curve for the lab.
export const chlorineDose = (demand: number, residual: number) => demand + residual

/** k_cw from −ln(N/N0) = k·C^n·t by least squares through the origin (T10-A) */
export function chickWatson(p: { C: number; n?: number; data: { t: number; N: number }[] }) {
  const n = p.n ?? 1
  const N0 = p.data[0].N
  const pts = p.data.map((d) => ({ t: d.t, N: d.N, lnR: Math.log(d.N / N0), ct: Math.pow(p.C, n) * d.t }))
  const num = pts.reduce((s, q) => s - q.lnR * q.ct, 0)
  const den = pts.reduce((s, q) => s + q.ct * q.ct, 0)
  return { pts, k: num / den }
}
/** time for a log-kill (e.g. 3 log = 99.9 %) at concentration C: t = ln(10^log)/(k C^n) */
export const timeForLogKill = (k: number, C: number, logKill: number, n = 1) => (logKill * Math.LN10) / (k * Math.pow(C, n))
/** C^n t = constant: new time at another concentration */
export const timeAtOtherC = (C1: number, t1: number, C2: number, n = 1) => t1 * Math.pow(C1 / C2, n)

export type Zone = 'demand' | 'chloramine' | 'destruction' | 'free'
export interface Breakpoint {
  /** immediate demand by reducing compounds (Fe²⁺, Mn²⁺, H2S, organics) */
  d0: number
  /** ammonia-N, mg/L */
  N: number
  peakDose: number
  peakRes: number
  bpDose: number
  bpRes: number
}
/** qualitative: Cl2:N of 5.07 (mole 1:1) at the combined-residual peak, 7.6 (mole 1.5) at the breakpoint */
export function breakpointModel(d0: number, N: number): Breakpoint {
  const peakDose = d0 + 5.07 * N
  const bpDose = d0 + 7.6 * N
  const peakRes = peakDose - d0
  return { d0, N, peakDose, peakRes, bpDose, bpRes: 0.25 * peakRes }
}
export function residualAt(m: Breakpoint, dose: number): { residual: number; free: number; combined: number; zone: Zone } {
  if (dose <= m.d0) return { residual: 0, free: 0, combined: 0, zone: 'demand' }
  if (dose <= m.peakDose) return { residual: dose - m.d0, free: 0, combined: dose - m.d0, zone: 'chloramine' }
  if (dose <= m.bpDose) {
    const r = m.peakRes + ((dose - m.peakDose) / (m.bpDose - m.peakDose)) * (m.bpRes - m.peakRes)
    return { residual: r, free: 0, combined: r, zone: 'destruction' }
  }
  const free = dose - m.bpDose
  return { residual: m.bpRes + free, free: free, combined: m.bpRes, zone: 'free' }
}
