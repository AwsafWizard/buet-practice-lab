// Total, pore and effective stress with and without seepage; quick condition; filters; excavation heave.
// (SJMY sir, Lectures 10–11, 14; Question Bank §4.) kN, m, kPa; depths z measured down from the ground surface.

import { GW } from './units'

export interface SoilLayer {
  name: string
  H: number
  /** unit weight above the water table (and above the capillary zone) */
  gamma: number
  /** saturated unit weight (below the WT and in the capillary zone) */
  gammaSat: number
}

export interface ProfileIn {
  layers: SoilLayer[]
  /** water table depth below GL; negative = standing water above GL */
  wt: number
  /** height of the saturated capillary zone above the WT (u = −γw × height above WT there) */
  hc?: number
  /** seepage across one layer: excess head dh at its bottom (+ upward flow, − downward), zero at its top, carried below it */
  flow?: { layer: number; dh: number }
}

export interface StressPt {
  z: number
  sigma: number
  u: number
  eff: number
  label?: string
}

export function layerTops(p: ProfileIn) {
  const tops: number[] = []
  let z = 0
  for (const l of p.layers) {
    tops.push(z)
    z += l.H
  }
  return { tops, bottom: z }
}

/** σ, u, σ′ at depth z; side = 'above' takes the value just above a jump (top of the capillary zone) */
export function stressAt(p: ProfileIn, z: number, side: 'above' | 'below' = 'below'): StressPt {
  const hc = p.hc ?? 0
  const capTop = p.wt - hc
  const { tops } = layerTops(p)
  // total stress: standing water + soil above z
  let sigma = p.wt < 0 ? -p.wt * GW : 0
  p.layers.forEach((l, k) => {
    const a = tops[k]
    const b = Math.min(a + l.H, z)
    if (b <= a) return
    // split [a, b] at the capillary-zone top: moist above, saturated below
    const sTop = Math.max(0, Math.min(b, Math.max(a, capTop)) - a)
    sigma += sTop * l.gamma + (b - a - sTop) * l.gammaSat
  })
  // pore pressure: hydrostatic, capillary suction, plus seepage excess
  let u = 0
  if (p.wt < 0 || z >= p.wt) u = (z - p.wt) * GW
  else if (hc > 0 && (z > capTop || (Math.abs(z - capTop) < 1e-12 && side === 'below'))) u = -(p.wt - z) * GW
  if (p.flow) {
    const a = tops[p.flow.layer]
    const L = p.layers[p.flow.layer].H
    const t = Math.min(1, Math.max(0, (z - a) / L))
    u += p.flow.dh * t * GW
  }
  return { z, sigma, u, eff: sigma - u }
}

/** the controlling ordinates (with both sides of any jump) */
export function profile(p: ProfileIn): StressPt[] {
  const { tops, bottom } = layerTops(p)
  const hc = p.hc ?? 0
  const zs = new Set<number>([0, bottom, ...tops])
  if (p.wt > 0 && p.wt < bottom) zs.add(p.wt)
  if (hc > 0 && p.wt - hc > 0 && p.wt - hc < bottom) zs.add(p.wt - hc)
  if (p.flow) {
    zs.add(tops[p.flow.layer])
    zs.add(tops[p.flow.layer] + p.layers[p.flow.layer].H)
  }
  const out: StressPt[] = []
  for (const z of [...zs].sort((a, b) => a - b)) {
    const lab = z === 0 ? 'GL' : Math.abs(z - p.wt) < 1e-9 ? 'WT' : hc > 0 && Math.abs(z - (p.wt - hc)) < 1e-9 ? 'top of capillary zone' : tops.includes(z) ? 'layer boundary' : z === bottom ? 'bottom' : undefined
    if (hc > 0 && Math.abs(z - (p.wt - hc)) < 1e-9 && z > 0) {
      out.push({ ...stressAt(p, z, 'above'), label: lab + ' (just above)' })
      out.push({ ...stressAt(p, z, 'below'), label: lab + ' (just below)' })
    } else out.push({ ...stressAt(p, z), label: lab })
  }
  return out
}

// ---------------------------------------------------------------- quick condition, seepage force

/** critical gradient icr = γ′/γw = (Gs − 1)/(1 + e) */
export const icrFromGsE = (Gs: number, e: number) => (Gs - 1) / (1 + e)
export const icrFromGsat = (gsat: number) => (gsat - GW) / GW
export const gsatFromGsE = (Gs: number, e: number) => ((Gs + e) * GW) / (1 + e)
export const gsubFromGsE = (Gs: number, e: number) => ((Gs - 1) * GW) / (1 + e)
export const eFromN = (n: number) => n / (1 - n)

/** σ′ at depth z in a column with flow: no flow zγ′, upward zγ′ − izγw, downward zγ′ + izγw */
export function effWithFlow(z: number, gsub: number, i: number, dir: 'up' | 'down' | 'none') {
  const ps = i * z * GW
  return dir === 'up' ? z * gsub - ps : dir === 'down' ? z * gsub + ps : z * gsub
}

/** upward flow through a layer L with head loss h: FS against boiling = γ′L/(hγw) */
export const fsBoiling = (gsub: number, L: number, h: number) => (gsub * L) / (h * GW)

/** depth of a weighting filter (no head loss in it) for a target FS: FS = (γ′L + γ′f z)/(hγw) */
export function filterDepth(o: { gsub: number; L: number; h: number; FS: number; gsubFilter?: number }) {
  const gf = o.gsubFilter ?? o.gsub
  const FS0 = fsBoiling(o.gsub, o.L, o.h)
  return { FS0, z: Math.max(0, (o.FS * o.h * GW - o.gsub * o.L) / gf) }
}

// ---------------------------------------------------------------- excavation base heave

export interface HeaveIn {
  /** clay thickness from GL */
  Hc: number
  /** clay unit weights (saturated; moist above the WT) */
  gSat: number
  gMoist?: number
  /** WT depth below GL (for the clay's own weight split) */
  wt: number
  /** piezometric head in the sand, as height above the clay base; default hydrostatic from the WT (Hc − wt) */
  hp?: number
  /** depth of water kept standing in the pit (0 = pumped to the bottom) */
  pitWater?: number
}

/** stress the clay plug left below a pit of depth d presses onto its base */
export function plugStress(o: HeaveIn, d: number) {
  const gm = o.gMoist ?? o.gSat
  const above = Math.max(0, Math.min(o.Hc, o.wt) - d)
  return above * gm + (o.Hc - d - above) * o.gSat + (o.pitWater ?? 0) * GW
}

export const sandHead = (o: HeaveIn) => o.hp ?? o.Hc - o.wt

export function excavationHeave(o: HeaveIn, d: number, FSreq = 1) {
  const u = sandHead(o) * GW
  const W = plugStress(o, d)
  // deepest pit for FSreq (bisection on the monotone plug stress)
  const dFor = (fs: number) => {
    if (plugStress(o, 0) < fs * u) return 0
    let lo = 0
    let hi = o.Hc
    for (let k = 0; k < 80; k++) {
      const m = (lo + hi) / 2
      if (plugStress(o, m) >= fs * u) lo = m
      else hi = m
    }
    return lo
  }
  const hpAllowed = W / (FSreq * GW)
  return { u, W, FS: W / u, dMax: dFor(1), dSafe: dFor(FSreq), hpAllowed, drawdown: Math.max(0, sandHead(o) - hpAllowed) }
}
