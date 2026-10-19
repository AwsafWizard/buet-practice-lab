// BNBC 2020 equivalent static force method (Sec 2.5) as taught in CE 311.

export type SiteClass = 'SA' | 'SB' | 'SC' | 'SD' | 'SE'
export type SDC = 'B' | 'C' | 'D'

export const ZONE_Z: Record<1 | 2 | 3 | 4, number> = { 1: 0.12, 2: 0.2, 3: 0.28, 4: 0.36 }

export const SOIL: Record<SiteClass, { S: number; TB: number; TC: number; TD: number }> = {
  SA: { S: 1.0, TB: 0.15, TC: 0.4, TD: 2.0 },
  SB: { S: 1.2, TB: 0.15, TC: 0.5, TD: 2.0 },
  SC: { S: 1.15, TB: 0.2, TC: 0.6, TD: 2.0 },
  SD: { S: 1.35, TB: 0.2, TC: 0.8, TD: 2.0 },
  SE: { S: 1.4, TB: 0.15, TC: 0.5, TD: 2.0 },
}

/** Table 6.2.17 importance factor for earthquake */
export function importanceEQ(occ: 1 | 2 | 3 | 4) {
  return occ <= 2 ? 1.0 : occ === 3 ? 1.25 : 1.5
}

/** Table 6.2.18 seismic design category */
export function sdc(site: SiteClass, zone: 1 | 2 | 3 | 4, occ: 1 | 2 | 3 | 4): SDC {
  const t13: Record<SiteClass, SDC[]> = {
    SA: ['B', 'C', 'C', 'D'],
    SB: ['B', 'C', 'D', 'D'],
    SC: ['B', 'C', 'D', 'D'],
    SD: ['C', 'D', 'D', 'D'],
    SE: ['D', 'D', 'D', 'D'],
  }
  const t4: Record<SiteClass, SDC[]> = {
    SA: ['C', 'D', 'D', 'D'],
    SB: ['C', 'D', 'D', 'D'],
    SC: ['C', 'D', 'D', 'D'],
    SD: ['D', 'D', 'D', 'D'],
    SE: ['D', 'D', 'D', 'D'],
  }
  return (occ === 4 ? t4 : t13)[site][zone - 1]
}

/** Table 6.2.19 (moment resisting frames part) */
export const SYSTEMS = {
  SMF_steel: { name: 'Special steel moment frame', R: 8, Omega: 3, Cd: 5.5, limit: { B: 'NL', C: 'NL', D: 'NL' } },
  IMF_steel: { name: 'Intermediate steel moment frame', R: 4.5, Omega: 3, Cd: 4, limit: { B: 'NL', C: 'NL', D: '35' } },
  OMF_steel: { name: 'Ordinary steel moment frame', R: 3.5, Omega: 3, Cd: 3, limit: { B: 'NL', C: 'NL', D: 'NP' } },
  SMF_rc: { name: 'Special RC moment frame', R: 8, Omega: 3, Cd: 5.5, limit: { B: 'NL', C: 'NL', D: 'NL' } },
  IMF_rc: { name: 'Intermediate RC moment frame', R: 5, Omega: 3, Cd: 4.5, limit: { B: 'NL', C: 'NL', D: 'NP' } },
  OMF_rc: { name: 'Ordinary RC moment frame', R: 3, Omega: 3, Cd: 2.5, limit: { B: 'NL', C: 'NP', D: 'NP' } },
} as const
export type SystemKey = keyof typeof SYSTEMS

/** least-ductile RC frame permitted in an SDC (what exam answers expect) */
export function rcFrameFor(s: SDC): SystemKey {
  return s === 'B' ? 'OMF_rc' : s === 'C' ? 'IMF_rc' : 'SMF_rc'
}

/** Table 6.2.20 */
export const CT = {
  rc_mrf: { Ct: 0.0466, m: 0.9, name: 'Concrete moment-resisting frames' },
  steel_mrf: { Ct: 0.0724, m: 0.8, name: 'Steel moment-resisting frames' },
  ebf: { Ct: 0.0731, m: 0.75, name: 'Eccentrically braced steel frame' },
  other: { Ct: 0.0488, m: 0.75, name: 'All other structural systems' },
} as const

export function period(kind: keyof typeof CT, hn: number) {
  const { Ct, m } = CT[kind]
  return { Ct, m, T: Ct * Math.pow(hn, m) }
}

export function etaFromDamping(xi = 5) {
  return Math.max(Math.sqrt(10 / (5 + xi)), 0.55)
}

/** normalised acceleration response spectrum Cs(T) */
export function Cs(T: number, site: SiteClass, eta = 1) {
  const { S, TB, TC, TD } = SOIL[site]
  if (T <= TB) return { Cs: S * (1 + (T / TB) * (2.5 * eta - 1)), branch: 1 as const }
  if (T <= TC) return { Cs: 2.5 * S * eta, branch: 2 as const }
  if (T <= TD) return { Cs: 2.5 * S * eta * (TC / T), branch: 3 as const }
  return { Cs: 2.5 * S * eta * ((TC * TD) / (T * T)), branch: 4 as const }
}

/** site class from harmonic-mean SPT (top 30 m) */
export function siteFromN(N: number): SiteClass {
  return N > 50 ? 'SB' : N >= 15 ? 'SC' : 'SD'
}

/** harmonic average N = Σd / Σ(d/N). layers: thickness and N */
export function harmonicN(layers: { d: number; N: number }[]) {
  const sd = layers.reduce((s, l) => s + l.d, 0)
  const sdn = layers.reduce((s, l) => s + (l.N > 0 ? l.d / l.N : 0), 0)
  return { sumD: sd, sumDN: sdn, N: sd / sdn }
}

export function kExponent(T: number) {
  if (T <= 0.5) return 1
  if (T >= 2.5) return 2
  return 1 + (T - 0.5) / 2
}

export interface FloorWeight {
  name: string
  h: number // height above base
  w: number // seismic weight
}

export interface EQInput {
  Z: number
  I: number
  R: number
  site: SiteClass
  T: number
  eta?: number
  floors: FloorWeight[] // includes base-level items with h = 0 (pedestals)
}

export function baseShear(inp: EQInput) {
  const eta = inp.eta ?? 1
  const c = Cs(inp.T, inp.site, eta)
  const IR = Math.min(inp.I / inp.R, 1)
  const SaRaw = (2 / 3) * inp.Z * IR * c.Cs
  const beta = 0.11
  const SaMin = 0.67 * beta * inp.Z * inp.I * SOIL[inp.site].S
  const Sa = Math.max(SaRaw, SaMin)
  const W = inp.floors.reduce((s, f) => s + f.w, 0)
  const V = Sa * W
  const k = kExponent(inp.T)
  const wh = inp.floors.map((f) => f.w * Math.pow(f.h, k))
  const sum = wh.reduce((a, b) => a + b, 0)
  const rows = inp.floors.map((f, i) => ({ ...f, whk: wh[i], ratio: wh[i] / sum, F: (V * wh[i]) / sum }))
  // storey shear from the top down
  const sorted = [...rows].sort((a, b) => b.h - a.h)
  let acc = 0
  const shear = new Map<string, number>()
  for (const r of sorted) {
    acc += r.F
    shear.set(r.name, acc)
  }
  return { eta, Cs: c.Cs, branch: c.branch, IR, SaRaw, SaMin, Sa, W, V, k, sum, rows: rows.map((r) => ({ ...r, Vx: shear.get(r.name)! })) }
}

/** seismic weight of a floor: DL + (25% or 50%) LL */
export function floorSeismicWeight(area: number, DL: number, LL: number) {
  const f = LL <= 3 ? 0.25 : 0.5
  return { f, w: area * (DL + f * LL), DLpart: area * DL, LLpart: area * f * LL }
}
