// Water demand and fire flow. Per-capita and peak factors as Snigdha ma'am teaches them (SN L2, L5);
// fire formulas are the textbook ones (Kuichling, Freeman, NBFU, Buston) — her slides do not print them, her class notes only name Kuichling.
// Units: P in THOUSANDS for every fire formula; gpm = US gallons per minute (1 gpm = 3.785 L/min).

export const GPM_TO_LPM = 3.78541
export const lpmToGpm = (l: number) => l / GPM_TO_LPM
export const gpmToLpm = (g: number) => g * GPM_TO_LPM
/** one fire stream: 250 gpm = 950 L/min (the value 2022-23 Q6(b) gives; it is also what makes N × 250 = 700 √P) */
export const STREAM_GPM = 250
export const STREAM_LPM = 950

// ---------------------------------------------------------------- consumption
export interface MixRow {
  label: string
  /** fraction of the population (0–1) */
  frac: number
  lpcd: number
}

/** BNBC 2020 Table 8.5.1(a), cities and big district towns (lpcd) — used by the lab's mix picker */
export const BNBC_CITY: { cat: string; label: string; full?: number; restricted?: number; group: 'X' | 'Y' | 'Z' }[] = [
  { cat: 'A1', label: 'Single-family dwelling with garden and car washing', full: 260, restricted: 200, group: 'X' },
  { cat: 'A3', label: 'Big multi-family apartment (above 2500 sft)', full: 200, restricted: 150, group: 'X' },
  { cat: 'Y1', label: 'Officer’s quarter / colony, moderate apartment (below 2000 sft)', full: 180, restricted: 135, group: 'Y' },
  { cat: 'Y2', label: 'Small building / staff quarter, small apartment (below 1500 sft)', restricted: 120, group: 'Y' },
  { cat: 'Z1', label: 'Junior staff quarter / flat (below 1000 sft), temporary shade', restricted: 80, group: 'Z' },
  { cat: 'Z2', label: 'Stand-post connection in the fringe area', restricted: 65, group: 'Z' },
  { cat: 'Z3', label: 'Common yard (stand post) connection, fringe area', restricted: 50, group: 'Z' },
  { cat: 'Z4', label: 'Slum dwellers, road-side public stand post', restricted: 40, group: 'Z' },
]

/** BNBC fire protection flow requirements (SN L2 p6) */
export const BNBC_FIRE: { hazard: string; sprinkler: number; standpipe: number; minutes: number }[] = [
  { hazard: 'Light hazard I', sprinkler: 1000, standpipe: 1000, minutes: 30 },
  { hazard: 'Light hazard II', sprinkler: 1900, standpipe: 1900, minutes: 50 },
  { hazard: 'Ordinary hazard I', sprinkler: 2650, standpipe: 1900, minutes: 75 },
  { hazard: 'Ordinary hazard II', sprinkler: 3200, standpipe: 1900, minutes: 75 },
  { hazard: 'Ordinary hazard III', sprinkler: 4800, standpipe: 1900, minutes: 75 },
]

/** population-weighted lpcd and each row's share of the total demand */
export function weightedDemand(P: number, mix: MixRow[], lossFrac = 0) {
  const rows = mix.map((m) => ({ ...m, lpcdShare: m.frac * m.lpcd, Lpd: P * m.frac * m.lpcd }))
  const lpcd = rows.reduce((s, r) => s + r.lpcdShare, 0)
  const net = P * lpcd // L/d
  const gross = net * (1 + lossFrac)
  return { rows, lpcd, netLpd: net, grossLpd: gross, MLD: gross / 1e6, share: (pred: (r: MixRow) => boolean) => (rows.filter(pred).reduce((s, r) => s + r.lpcdShare, 0) / lpcd) * 100 }
}

/** Q_f = P_f · q (+ losses as a fraction of the net demand) */
export function totalDemand(P: number, lpcd: number, lossFrac = 0) {
  const net = P * lpcd
  return { net, loss: net * lossFrac, gross: net * (1 + lossFrac) }
}

/** per capita demand from yearly use: lpcd = L per year / (P × 365) */
export const perCapita = (litresPerYear: number, P: number) => litresPerYear / (P * 365)

export const PEAK_FACTOR = { residential: 2.5, industrial: 1.4, commercial: 4, fire: 1 } as const

/**
 * Peak hourly demand = ADC/24 × PF × TF (SN L5 p8–9). TF = 24 / hours of consumption (1 for residential; "no time factor if a reservoir is present").
 * `adc` is the average daily demand in any volume unit; the result is that volume per hour.
 */
export function peakHourly(adc: number, pf: number, tfHours = 24, reservoir = false) {
  const avgHour = adc / 24
  const tf = reservoir ? 1 : 24 / tfHours
  return { avgHour, pf, tf, peak: avgHour * pf * tf }
}

// ---------------------------------------------------------------- fire flow (P in thousands)
export type FireFormula = 'kuichling' | 'freeman' | 'nbfu' | 'buston'

export const FIRE_FORMULAS: { id: FireFormula; label: string; tex: string; unit: 'gpm' | 'L/min' }[] = [
  { id: 'kuichling', label: 'Kuichling', tex: 'Q = 3182\\sqrt{P}', unit: 'gpm' },
  { id: 'freeman', label: 'Freeman', tex: 'Q = 1021\\left(\\tfrac{P}{5}+10\\right)', unit: 'gpm' },
  { id: 'nbfu', label: 'NBFU', tex: 'Q = 1020\\sqrt{P}\\,(1-0.01\\sqrt{P})', unit: 'gpm' },
  { id: 'buston', label: 'Buston', tex: 'Q = 5663\\sqrt{P}', unit: 'L/min' },
]

/** fire flow in gpm for population P (thousands) */
export function fireFlowGpm(f: FireFormula, P: number): number {
  const r = Math.sqrt(P)
  switch (f) {
    case 'kuichling':
      return 3182 * r
    case 'freeman':
      return 1021 * (P / 5 + 10)
    case 'nbfu':
      return 1020 * r * (1 - 0.01 * r)
    case 'buston':
      return lpmToGpm(5663 * r)
  }
}
export const fireFlowLpm = (f: FireFormula, P: number) => (f === 'buston' ? 5663 * Math.sqrt(P) : gpmToLpm(fireFlowGpm(f, P)))

/** Kuichling's number of fire streams N = 2.8 √P (P in thousands), rounded UP to a whole stream (the seniors' notes: 22.4 → 23) */
export function fireStreams(P: number) {
  const exact = 2.8 * Math.sqrt(P)
  return { exact, n: Math.ceil(exact - 1e-9), totalGpm: Math.ceil(exact - 1e-9) * STREAM_GPM, totalLpm: Math.ceil(exact - 1e-9) * STREAM_LPM }
}

/** the whole fire demand block for one population (thousands) */
export function fireDemand(P: number, hours = 0) {
  const kui = fireFlowGpm('kuichling', P)
  const st = fireStreams(P)
  return {
    P,
    kuichlingGpm: kui,
    kuichlingLpm: gpmToLpm(kui),
    kuichlingMLD: (gpmToLpm(kui) * 1440) / 1e6,
    streams: st,
    /** streams-based flow: N × 950 L/min (the N × 250 gpm version, = 700 √P before rounding N) */
    streamFlowLpm: st.totalLpm,
    /** storage for `hours` of fire at the stream-based flow (L) */
    storageL: st.totalLpm * 60 * hours,
    storageKuichlingL: gpmToLpm(kui) * 60 * hours,
  }
}

/** storage for N hours at a flow in L/min (litres) */
export const fireStorage = (lpm: number, hours: number) => lpm * 60 * hours

/** Pitot formula for a hydrant: Q(gpm) = 29.83 C d² √P (d inches, P psi) */
export function pitotGpm(P: number, C = 0.9, d = 3) {
  return 29.83 * C * d * d * Math.sqrt(P)
}

// ---------------------------------------------------------------- overhead tank (2008-09 Q3(v))
/**
 * Most economic cylindrical tank of volume V: floor cost cf per area, wall cost cw per area (roof ignored).
 * C = cf πD²/4 + cw πD H, H = 4V/(πD²) → dC/dD = 0 → D³ = 8 cw V /(π cf), H = 4V/(πD²).
 */
export function economicTank(V: number, cf: number, cw: number) {
  const D = Math.cbrt((8 * cw * V) / (Math.PI * cf))
  const H = (4 * V) / (Math.PI * D * D)
  const cost = cf * (Math.PI * D * D) / 4 + cw * Math.PI * D * H
  return { D, H, cost, ratioHD: H / D }
}

export const GAL_FT3 = 7.48052 // US gallons per cubic foot
export const IMPGAL_FT3 = 6.22884
export const L_PER_FT3 = 28.3168
