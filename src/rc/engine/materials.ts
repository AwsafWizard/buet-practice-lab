// CE 315 shared material and bar data (ACI 318 / Nilson, US units: in, kip, ksi; f'c and fy in psi where noted).

/** US bar sizes: nominal diameter (in) and area (in²), ACI Table A.1 */
export const BARS: Record<number, { d: number; A: number }> = {
  3: { d: 0.375, A: 0.11 },
  4: { d: 0.5, A: 0.2 },
  5: { d: 0.625, A: 0.31 },
  6: { d: 0.75, A: 0.44 },
  7: { d: 0.875, A: 0.6 },
  8: { d: 1.0, A: 0.79 },
  9: { d: 1.128, A: 1.0 },
  10: { d: 1.27, A: 1.27 },
  11: { d: 1.41, A: 1.56 },
  14: { d: 1.693, A: 2.25 },
  18: { d: 2.257, A: 4.0 },
}
export const BAR_SIZES = [3, 4, 5, 6, 7, 8, 9, 10, 11]

/** metric bars used in a few papers (mm → in, in²) */
export const MM_BARS: Record<number, { d: number; A: number }> = Object.fromEntries(
  [10, 12, 16, 20, 22, 25, 28, 32].map((mm) => {
    const d = mm / 25.4
    return [mm, { d, A: (Math.PI * d * d) / 4 }]
  }),
)

export const barA = (no: number) => BARS[no].A
export const barD = (no: number) => BARS[no].d
export const As = (n: number, no: number) => n * BARS[no].A

/** ACI 22.2.2.4.3: β1 = 0.85 up to 4000 psi, −0.05 per 1000 psi, not below 0.65 (f'c in psi) */
export function beta1(fc: number) {
  if (fc <= 4000) return 0.85
  return Math.max(0.65, 0.85 - (0.05 * (fc - 4000)) / 1000)
}

/** Ec = 57000√f'c (psi) */
export const Ec = (fc: number) => 57000 * Math.sqrt(fc)
/** modulus of rupture fr = 7.5√f'c (psi) */
export const fr = (fc: number) => 7.5 * Math.sqrt(fc)
export const Es = 29e6 // psi
/** modular ratio n = Es / Ec (classes round to the nearest whole number) */
export const modRatio = (fc: number) => Es / Ec(fc)
export const epsU = 0.003
export const epsY = (fy: number) => fy / Es

/** ACI 21.2.2 (Grade 60): φ = 0.65 for εt ≤ εy, 0.90 for εt ≥ 0.005, linear between (0.483 + 83.3εt for Grade 60) */
export function phiFlex(epsT: number, fy = 60000) {
  const ey = epsY(fy)
  if (epsT >= 0.005) return 0.9
  if (epsT <= ey) return 0.65
  return 0.65 + (0.25 * (epsT - ey)) / (0.005 - ey)
}

/** ACI 9.6.1.2: As,min = max(3√f'c, 200) bw d / fy  (psi units for f'c, fy) */
export const AsMin = (fc: number, fy: number, bw: number, d: number) => (Math.max(3 * Math.sqrt(fc), 200) * bw * d) / fy

/** balanced and limiting steel ratios (singly reinforced rectangular) */
export function rhoLimits(fc: number, fy: number) {
  const b1 = beta1(fc)
  const k = 0.85 * b1 * (fc / fy)
  const ey = epsY(fy)
  return {
    b1,
    rhoB: k * (epsU / (epsU + ey)),
    /** ρ at εt = 0.004 (ACI minimum strain for beams = ρmax) */
    rhoMax: k * (epsU / (epsU + 0.004)),
    /** ρ at εt = 0.005 (tension-controlled limit, φ = 0.9) */
    rho005: k * (epsU / (epsU + 0.005)),
    rhoMin: Math.max(3 * Math.sqrt(fc), 200) / fy,
  }
}

/** factored load: the class uses 1.2D + 1.6L (older papers 1.4D + 1.7L) */
export const wu = (D: number, L: number, fD = 1.2, fL = 1.6) => Math.max(fD * D + fL * L, 1.4 * D)

/** unit weight of normal-weight reinforced concrete (pcf) */
export const GAMMA_RC = 150

/** round to the class's usual precision for display */
export const r2 = (v: number) => Math.round(v * 100) / 100
export const r3 = (v: number) => Math.round(v * 1000) / 1000
