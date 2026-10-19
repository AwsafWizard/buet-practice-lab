// BNBC 2020 (Part 6, Ch 2, Sec 2.4) wind load provisions used in CE 311.
// SI units: V in m/s, heights in m, pressures in kN/m².

export type Exposure = 'A' | 'B' | 'C'

/** Table 6.2.10 terrain exposure constants */
export const TERRAIN: Record<
  Exposure,
  { alpha: number; zg: number; ahat: number; bhat: number; abar: number; bbar: number; c: number; l: number; ebar: number; zmin: number }
> = {
  A: { alpha: 7.0, zg: 365.76, ahat: 1 / 7, bhat: 0.84, abar: 1 / 4.0, bbar: 0.45, c: 0.3, l: 97.54, ebar: 1 / 3.0, zmin: 9.14 },
  B: { alpha: 9.5, zg: 274.32, ahat: 1 / 9.5, bhat: 1.0, abar: 1 / 6.5, bbar: 0.65, c: 0.2, l: 152.4, ebar: 1 / 5.0, zmin: 4.57 },
  C: { alpha: 11.5, zg: 213.36, ahat: 1 / 11.5, bhat: 1.07, abar: 1 / 9.0, bbar: 0.8, c: 0.15, l: 198.12, ebar: 1 / 8.0, zmin: 2.13 },
}

/** Velocity pressure exposure coefficient (Case 2 formula given in the exams) */
export function Kz(z: number, exp: Exposure) {
  const { alpha, zg } = TERRAIN[exp]
  const zz = Math.max(z, 4.57)
  return 2.01 * Math.pow(Math.min(zz, zg) / zg, 2 / alpha)
}

/** Table 6.2.9 importance factor for wind */
export function importanceWind(occ: 1 | 2 | 3 | 4, V: number) {
  if (occ === 1) return V > 44 ? 0.77 : 0.87
  if (occ === 2) return 1.0
  return 1.15
}

export const KD_BUILDING = 0.85

export function qz(p: { Kz: number; Kzt: number; Kd: number; V: number; I: number }) {
  return 0.000613 * p.Kz * p.Kzt * p.Kd * p.V * p.V * p.I
}

/** wall external pressure coefficients (Fig 6.2.6) */
export function cpLeeward(LoverB: number) {
  if (LoverB <= 1) return -0.5
  if (LoverB >= 4) return -0.2
  if (LoverB <= 2) return -0.5 + (LoverB - 1) * 0.2
  return -0.3 + ((LoverB - 2) * 0.1) / 2
}
export const CP_WINDWARD = 0.8
export const CP_SIDE = -0.7

export type Enclosure = 'open' | 'partially' | 'enclosed'
export const GCPI: Record<Enclosure, number> = { open: 0, partially: 0.55, enclosed: 0.18 }

// ---------------- topographic factor ----------------
export type Hill = 'ridge' | 'escarpment' | 'hill3d'
export const KZT_PARAMS: Record<Hill, { K1: Record<Exposure, number>; gamma: number; muUp: number; muDown: number; name: string }> = {
  ridge: { K1: { A: 1.3, B: 1.45, C: 1.55 }, gamma: 3, muUp: 1.5, muDown: 1.5, name: '2-D ridge' },
  escarpment: { K1: { A: 0.75, B: 0.85, C: 0.95 }, gamma: 2.5, muUp: 1.5, muDown: 4, name: '2-D escarpment' },
  hill3d: { K1: { A: 0.95, B: 1.05, C: 1.15 }, gamma: 4, muUp: 1.5, muDown: 1.5, name: '3-D axisymmetric hill' },
}

export interface KztInput {
  hill: Hill
  exp: Exposure
  H: number // hill height
  Lh: number // distance upwind of crest to where ground is half the height
  x: number // distance (upwind or downwind) from crest to building
  downwind: boolean
  z: number // height above local ground
}

export function kzt(i: KztInput) {
  const p = KZT_PARAMS[i.hill]
  let ratio = i.H / i.Lh
  let Lh = i.Lh
  const capped = ratio > 0.5
  if (capped) {
    ratio = 0.5
    Lh = 2 * i.H
  }
  const K1 = p.K1[i.exp] * ratio
  const mu = i.downwind ? p.muDown : p.muUp
  const K2 = Math.max(0, 1 - Math.abs(i.x) / (mu * Lh))
  const K3 = Math.exp((-p.gamma * i.z) / Lh)
  const Kzt = (1 + K1 * K2 * K3) ** 2
  return { ratio, Lh, capped, K1, K2, K3, mu, gamma: p.gamma, K1ratio: p.K1[i.exp], Kzt }
}

// ---------------- gust effect factor ----------------
export function gustRigid(p: { h: number; B: number; exp: Exposure }) {
  const t = TERRAIN[p.exp]
  const zbar = Math.max(0.6 * p.h, t.zmin)
  const Iz = t.c * Math.pow(10 / zbar, 1 / 6)
  const Lz = t.l * Math.pow(zbar / 10, t.ebar)
  const Q = Math.sqrt(1 / (1 + 0.63 * Math.pow((p.B + p.h) / Lz, 0.63)))
  const gQ = 3.4,
    gv = 3.4
  const G = (0.925 * (1 + 1.7 * gQ * Iz * Q)) / (1 + 1.7 * gv * Iz)
  return { zbar, Iz, Lz, Q, gQ, gv, G }
}

export function gustFlexible(p: { h: number; B: number; L: number; exp: Exposure; V: number; n1: number; beta: number }) {
  const r = gustRigid(p)
  const t = TERRAIN[p.exp]
  const Vz = t.bbar * Math.pow(r.zbar / 10, t.abar) * p.V
  const N1 = (p.n1 * r.Lz) / Vz
  const Rn = (7.47 * N1) / Math.pow(1 + 10.3 * N1, 5 / 3)
  const Rl = (eta: number) => (eta > 0 ? 1 / eta - (1 / (2 * eta * eta)) * (1 - Math.exp(-2 * eta)) : 1)
  const etaH = (4.6 * p.n1 * p.h) / Vz
  const etaB = (4.6 * p.n1 * p.B) / Vz
  const etaL = (15.4 * p.n1 * p.L) / Vz
  const Rh = Rl(etaH),
    RB = Rl(etaB),
    RL = Rl(etaL)
  const R = Math.sqrt((1 / p.beta) * Rn * Rh * RB * (0.53 + 0.47 * RL))
  const ln = Math.log(3600 * p.n1)
  const gR = Math.sqrt(2 * ln) + 0.577 / Math.sqrt(2 * ln)
  const Gf = (0.925 * (1 + 1.7 * r.Iz * Math.sqrt(r.gQ ** 2 * r.Q ** 2 + gR ** 2 * R ** 2))) / (1 + 1.7 * r.gv * r.Iz)
  return { ...r, Vz, N1, Rn, etaH, etaB, etaL, Rh, RB, RL, R, gR, Gf }
}

// ---------------- classification helpers ----------------
export function isLowRise(h: number, leastDim: number) {
  return { ok: h <= 18 && h <= leastDim, h, leastDim }
}

export interface WallOpening {
  wall: 'windward' | 'leeward' | 'side1' | 'side2' | 'roof'
  gross: number // gross wall area Ag
  open: number // total openings Ao
}

/** BNBC 2020 Sec 2.1.3 enclosure classification for wind toward the windward wall */
export function classifyEnclosure(walls: WallOpening[], smallArea = 0.37 /* m² (4 ft²) */) {
  const ww = walls.find((w) => w.wall === 'windward')!
  const others = walls.filter((w) => w !== ww)
  const Ao = ww.open
  const Ag = ww.gross
  const Aoi = others.reduce((s, w) => s + w.open, 0)
  const Agi = others.reduce((s, w) => s + w.gross, 0)
  const allOpen = walls.filter((w) => w.wall !== 'roof').every((w) => w.open >= 0.8 * w.gross)
  const c1 = Ao > 1.1 * Aoi
  const c2 = Ao > Math.min(smallArea, 0.01 * Ag)
  const c3 = Agi > 0 ? Aoi / Agi <= 0.2 : true
  const cls: Enclosure = allOpen ? 'open' : c1 && c2 && c3 ? 'partially' : 'enclosed'
  return { Ao, Ag, Aoi, Agi, allOpen, c1, c2, c3, ratio: Agi ? Aoi / Agi : 0, cls }
}

// ---------------- analytical procedure: storey forces ----------------
export interface StoreyWindInput {
  V: number
  exp: Exposure
  I: number
  Kzt?: number | ((z: number) => number)
  Kd?: number
  G: number
  /** building dimensions: B normal to wind, L parallel to wind */
  B: number
  L: number
  /** floor levels heights above ground (top of each storey), bottom→top */
  levels: number[]
  /** mean roof height (default top level) */
  h?: number
  GCpi?: number // internal pressure cancels for overall storey forces, kept for reporting
  parapet?: { height: number; GCpnWindward?: number; GCpnLeeward?: number }
}

export function storeyForces(inp: StoreyWindInput) {
  const Kd = inp.Kd ?? KD_BUILDING
  const kzt = (z: number) => (typeof inp.Kzt === 'function' ? inp.Kzt(z) : inp.Kzt ?? 1)
  const h = inp.h ?? inp.levels[inp.levels.length - 1]
  const Cpl = cpLeeward(inp.L / inp.B)
  const Kh = Kz(h, inp.exp)
  const qh = qz({ Kz: Kh, Kzt: kzt(h), Kd, V: inp.V, I: inp.I })
  const pl = qh * inp.G * Cpl // leeward (negative = suction)
  const rows = inp.levels.map((z, k) => {
    const below = k === 0 ? 0 : inp.levels[k - 1]
    const above = k === inp.levels.length - 1 ? z : inp.levels[k + 1]
    const trib = (z - below) / 2 + (above - z) / 2
    const K = Kz(z, inp.exp)
    const q = qz({ Kz: K, Kzt: kzt(z), Kd, V: inp.V, I: inp.I })
    const pw = q * inp.G * CP_WINDWARD
    const net = pw - pl
    return { level: k + 1, z, trib, Kz: K, Kzt: kzt(z), qz: q, pw, pl, net, area: trib * inp.B, F: net * trib * inp.B }
  })
  let parapet: null | { zp: number; Kz: number; qp: number; pw: number; pl: number; net: number; area: number; F: number } = null
  if (inp.parapet) {
    const zp = h + inp.parapet.height
    const K = Kz(zp, inp.exp)
    const qp = qz({ Kz: K, Kzt: kzt(zp), Kd, V: inp.V, I: inp.I })
    const pw = qp * (inp.parapet.GCpnWindward ?? 1.5)
    const plp = qp * (inp.parapet.GCpnLeeward ?? -1.0)
    const net = pw - plp
    parapet = { zp, Kz: K, qp, pw, pl: plp, net, area: inp.parapet.height * inp.B, F: net * inp.parapet.height * inp.B }
  }
  const base = rows.reduce((s, r) => s + r.F, 0) + (parapet?.F ?? 0)
  return { h, Kh, qh, Cpl, pl, rows, parapet, base, Kd }
}

// ---------------- simplified procedure ----------------
/** Fig 6.2.2 adjustment factor λ (mean roof height in m), exposures A/B/C */
export const LAMBDA_TABLE: { h: number; A: number; B: number; C: number }[] = [
  { h: 4.6, A: 1.0, B: 1.21, C: 1.47 },
  { h: 6.1, A: 1.0, B: 1.29, C: 1.55 },
  { h: 7.6, A: 1.0, B: 1.35, C: 1.61 },
  { h: 9.1, A: 1.0, B: 1.4, C: 1.66 },
  { h: 10.7, A: 1.05, B: 1.45, C: 1.7 },
  { h: 12.2, A: 1.09, B: 1.49, C: 1.74 },
  { h: 13.7, A: 1.12, B: 1.53, C: 1.78 },
  { h: 15.2, A: 1.16, B: 1.56, C: 1.81 },
  { h: 16.8, A: 1.19, B: 1.59, C: 1.84 },
  { h: 18.3, A: 1.22, B: 1.62, C: 1.87 },
]

export function lambdaFactor(hm: number, exp: Exposure) {
  const t = LAMBDA_TABLE
  if (hm <= t[0].h) return t[0][exp]
  for (let i = 0; i < t.length - 1; i++)
    if (hm <= t[i + 1].h) return t[i][exp] + ((t[i + 1][exp] - t[i][exp]) * (hm - t[i].h)) / (t[i + 1].h - t[i].h)
  return t[t.length - 1][exp]
}

/**
 * ps30 (psf) at 90 mph for MWFRS zones A–H, EOH, GOH (Fig 6.2.10 / ASCE 7-05 Fig 6-2),
 * other speeds scale with V². Values for roof angle ranges; load case 2 only for 25° and 30–45°.
 */
export const PS30_90: Record<string, number[]> = {
  '0-5': [12.8, -6.7, 8.5, -4.0, -15.4, -8.8, -10.7, -6.8, -21.6, -16.9],
  '10': [14.5, -6.0, 9.6, -3.5, -15.4, -9.4, -10.7, -7.2, -21.6, -16.9],
  '15': [16.1, -5.4, 10.7, -3.0, -15.4, -10.1, -10.7, -7.7, -21.6, -16.9],
  '20': [17.8, -4.7, 11.9, -2.6, -15.4, -10.7, -10.7, -8.1, -21.6, -16.9],
  '25': [16.1, 2.6, 11.7, 2.7, -7.2, -9.8, -5.2, -7.8, -13.3, -11.4],
  '25-2': [NaN, NaN, NaN, NaN, -2.7, -5.3, -0.7, -3.4, NaN, NaN],
  '30-45': [14.4, 9.9, 11.5, 7.9, 1.1, -8.8, 0.4, -7.5, -5.1, -5.8],
  '30-45-2': [14.4, 9.9, 11.5, 7.9, 5.6, -4.3, 4.8, -3.1, -5.1, -5.8],
}
export const ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'EOH', 'GOH']
export const PSF_TO_KPA = 0.04788

export function ps30(Vmph: number, roof: keyof typeof PS30_90) {
  const f = (Vmph / 90) ** 2
  return PS30_90[roof].map((v) => (Number.isNaN(v) ? NaN : Math.round(v * f * 10) / 10))
}

export const MS_TO_MPH = 2.23694
