// Permeability and capillarity (SJMY sir, Lectures 7–9; Question Bank §3).
// Any consistent length/time units (the papers use cm and s); helpers say where a unit is fixed.

/** constant head: k = QL/(Aht) */
export function constantHead(o: { Q: number; L: number; h: number; t: number; A?: number; D?: number }) {
  const A = o.A ?? (Math.PI / 4) * (o.D ?? 0) ** 2
  const i = o.h / o.L
  const k = (o.Q * o.L) / (A * o.h * o.t)
  return { A, i, k, q: o.Q / o.t, v: o.Q / (A * o.t) }
}

/** falling head: k = (aL/At) ln(h1/h2) = 2.303 (aL/At) log(h1/h2) */
export function fallingHead(o: { L: number; h1: number; h2: number; t: number; a?: number; d?: number; A?: number; D?: number }) {
  const a = o.a ?? (Math.PI / 4) * (o.d ?? 0) ** 2
  const A = o.A ?? (Math.PI / 4) * (o.D ?? 0) ** 2
  return { a, A, k: ((a * o.L) / (A * o.t)) * Math.log(o.h1 / o.h2) }
}

/** time for the standpipe to fall from h1 to h2 */
export const fallTime = (o: { k: number; a: number; A: number; L: number; h1: number; h2: number }) => ((o.a * o.L) / (o.A * o.k)) * Math.log(o.h1 / o.h2)

/** same apparatus, t ∝ ln(h1/h2): it fell from h0 to h1 in t1; time from h0 to h2 */
export const scaleFallTime = (t1: number, h0: number, h1: number, h2: number) => (t1 * Math.log(h0 / h2)) / Math.log(h0 / h1)

/** head after time t (falling head) */
export const headAfter = (o: { k: number; a: number; A: number; L: number; h1: number; t: number }) => o.h1 * Math.exp(-(o.A * o.k * o.t) / (o.a * o.L))

/** Darcy: v = ki, q = kiA; seepage velocity vs = v/n */
export function darcy(o: { k: number; i: number; A?: number; n?: number }) {
  const v = o.k * o.i
  return { v, q: v * (o.A ?? 1), vs: o.n ? v / o.n : NaN }
}

/** porosity of a specimen from its dry mass: n = 1 − Ws/(Gs ρw V) */
export const porosityFromDry = (Ws: number, Gs: number, V: number, rhoW = 1) => 1 - Ws / (Gs * rhoW * V)

export interface KLayer {
  H: number
  k: number
}

/** equivalent permeability of a layered deposit, both directions, and the flow split / head split */
export function layered(ls: KLayer[]) {
  const H = ls.reduce((s, l) => s + l.H, 0)
  const kh = ls.reduce((s, l) => s + l.k * l.H, 0) / H
  const kv = H / ls.reduce((s, l) => s + l.H / l.k, 0)
  // flow parallel: same i, flow share ∝ kH; flow normal: same v, head share ∝ H/k
  const qShare = ls.map((l) => (l.k * l.H) / (kh * H))
  const hShare = ls.map((l) => l.H / l.k / (H / kv))
  return { H, kh, kv, ratio: kh / kv, qShare, hShare }
}

/** dynamic viscosity of water, mPa·s (= cP), by temperature °C */
export const VISCOSITY: [number, number][] = [
  [4, 1.567],
  [10, 1.307],
  [15, 1.139],
  [20, 1.002],
  [25, 0.89],
  [27, 0.852],
  [30, 0.798],
  [35, 0.719],
  [40, 0.653],
]
export function viscosity(T: number) {
  const V = VISCOSITY
  if (T <= V[0][0]) return V[0][1]
  for (let k = 1; k < V.length; k++)
    if (T <= V[k][0]) {
      const [t0, m0] = V[k - 1]
      const [t1, m1] = V[k]
      return m0 + ((T - t0) / (t1 - t0)) * (m1 - m0)
    }
  return V[V.length - 1][1]
}
/** k at T1 from k at T: k_T1 = k_T (η_T/η_T1) */
export const kAtTemp = (kT: number, T: number, T1: number) => (kT * viscosity(T)) / viscosity(T1)

/** Hazen: k (cm/s) = C·D10² with D10 in cm (C ≈ 100–150), i.e. ≈ D10² with D10 in mm */
export const hazen = (D10mm: number, C = 100) => C * (D10mm / 10) ** 2

/** pumping test, unconfined aquifer: k = q ln(r2/r1)/[π(h2² − h1²)] (h measured above the impermeable base) */
export const pumpUnconfined = (o: { q: number; r1: number; r2: number; h1: number; h2: number }) => (o.q * Math.log(o.r2 / o.r1)) / (Math.PI * (o.h2 * o.h2 - o.h1 * o.h1))
/** pumping test, confined aquifer of thickness T: k = q ln(r2/r1)/[2πT(h2 − h1)] */
export const pumpConfined = (o: { q: number; r1: number; r2: number; h1: number; h2: number; T: number }) => (o.q * Math.log(o.r2 / o.r1)) / (2 * Math.PI * o.T * (o.h2 - o.h1))

/** inverse: discharge a well gives for a known k */
export const qUnconfined = (o: { k: number; r1: number; r2: number; h1: number; h2: number }) => (o.k * Math.PI * (o.h2 * o.h2 - o.h1 * o.h1)) / Math.log(o.r2 / o.r1)
export const qConfined = (o: { k: number; r1: number; r2: number; h1: number; h2: number; T: number }) => (o.k * 2 * Math.PI * o.T * (o.h2 - o.h1)) / Math.log(o.r2 / o.r1)

/** surface tension of water, N/m (20 °C) */
export const SIGMA_W = 0.0728

/** capillary rise in a tube: hc = 4σcosθ/(dγw); d in m → hc in m */
export const capRiseTube = (dM: number, thetaDeg = 0, sigma = SIGMA_W, gw = 9810) => (4 * sigma * Math.cos((thetaDeg * Math.PI) / 180)) / (dM * gw)

/** capillary rise in soil (Hazen): hc = C/(e D10), C = 0.1–0.5 cm², D10 in cm → hc in cm */
export const capRiseSoil = (e: number, D10cm: number, C = 0.3) => C / (e * D10cm)

/** suction (negative pore pressure) at height y above the water table inside the capillary zone, kPa */
export const capSuction = (y: number, gw = 9.81) => -y * gw

/** typical k (cm/s), as the class lists them (Question Bank formula sheet) */
export const TYPICAL_K: { soil: string; lo: number; hi: number }[] = [
  { soil: 'Clean gravel', lo: 1e-1, hi: 100 },
  { soil: 'Coarse sand', lo: 1e-2, hi: 1 },
  { soil: 'Fine sand', lo: 1e-3, hi: 1e-2 },
  { soil: 'Silty sand / silt', lo: 1e-5, hi: 1e-3 },
  { soil: 'Clay', lo: 1e-9, hi: 1e-6 },
]

/** typical capillary rise (m) */
export const TYPICAL_HC: { soil: string; lo: number; hi: number }[] = [
  { soil: 'Coarse sand', lo: 0.03, hi: 0.15 },
  { soil: 'Fine sand', lo: 0.3, hi: 1.2 },
  { soil: 'Silt', lo: 0.75, hi: 7.5 },
  { soil: 'Clay', lo: 7.5, hi: 25 },
]

/** which typical-k band a value sits in */
export const kBand = (k: number) => TYPICAL_K.find((b) => k >= b.lo && k <= b.hi)?.soil ?? (k > 100 ? 'Clean gravel' : 'Clay')
