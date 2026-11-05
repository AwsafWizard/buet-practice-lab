// Shared constants for the CE 341 solvers.

/** unit weight of water, kN/m³ (as taught; ρw = 1 t/m³ = 1 g/cm³) */
export const GW = 9.81
/** unit weight of water in pcf (US-unit papers) */
export const GW_PCF = 62.4
export const deg = (rad: number) => (rad * 180) / Math.PI
export const rad = (d: number) => (d * Math.PI) / 180
export const log10 = Math.log10
