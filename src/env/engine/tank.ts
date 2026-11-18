// Most economic dimensions of a cylindrical elevated (overhead) tank of given capacity.
// Floor and wall of the shell are costed per sft of concrete work (2020-21 Q2(c): 1 lac gallon, Tk 1200 floor, Tk 1800 wall).
// Cost C = cf (pi D^2/4) + cw (pi D H), with V = pi D^2 H/4 fixed:  dC/dD = 0  gives  D^3 = 8 cw V / (pi cf)  and  H = D cf / (2 cw).
// Standard textbook derivation (Garg / Birdie / Duggal); not worked on Rowshan ma'am's CE22 slides.

import { GAL_FT3 } from './pump'

/** US gallon in ft3 */
export const US_GAL_FT3 = 1 / 7.4805

export type GalKind = 'british' | 'us'
export const galToFt3 = (gal: number, kind: GalKind = 'british') => gal * (kind === 'british' ? GAL_FT3 : US_GAL_FT3)

export interface TankOut {
  V: number
  D: number
  H: number
  floorArea: number
  wallArea: number
  floorCost: number
  wallCost: number
  cost: number
  /** the optimum puts wall cost / floor cost at cw/cf ... H/D = cf/(2 cw) */
  ratioHD: number
}

export function tankCost(V: number, D: number, cf: number, cw: number): TankOut {
  const H = (4 * V) / (Math.PI * D * D)
  const floorArea = (Math.PI * D * D) / 4
  const wallArea = Math.PI * D * H
  return { V, D, H, floorArea, wallArea, floorCost: cf * floorArea, wallCost: cw * wallArea, cost: cf * floorArea + cw * wallArea, ratioHD: H / D }
}

/** economic dimensions for volume V (any length^3 unit) and floor / wall costs per unit area */
export function economicTank(V: number, cf: number, cw: number): TankOut {
  const D = Math.cbrt((8 * cw * V) / (Math.PI * cf))
  return tankCost(V, D, cf, cw)
}

/** cost against diameter for a plot, V fixed */
export function costCurve(V: number, cf: number, cw: number, Dlo: number, Dhi: number, n = 60) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const D = Dlo + ((Dhi - Dlo) * i) / n
    return { D, cost: tankCost(V, D, cf, cw).cost }
  })
}
