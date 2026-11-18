// Rooftop rainwater harvesting the way Rowshan ma'am teaches it (RM L6 p7-27, Math procedures M1-M3).
// Pure functions, no React. Volumes in m3 (series) or litres (demand side), rainfall in mm, areas in m2.

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** runoff coefficients (RM L6 p8, Pacey et al. 1989): [low, high] */
export const RUNOFF: { name: string; lo: number; hi: number }[] = [
  { name: 'Roof: tiles', lo: 0.8, hi: 0.9 },
  { name: 'Roof: corrugated metal sheet', lo: 0.7, hi: 0.8 },
  { name: 'Concrete surface', lo: 0.6, hi: 0.8 },
  { name: 'Brick pavement', lo: 0.5, hi: 0.6 },
  { name: 'Soil on slope less than 10 %', lo: 0, hi: 0.3 },
  { name: 'Rocky natural catchment', lo: 0.2, hi: 0.5 },
]

/** BNBC 2020 numbers on her slides (p4, p9-14, p21) */
export const BNBC = {
  /** every building with this much roof area should have an RWH system (m2) */
  thresholdM2: 300,
  /** dry days (scarcity period) for drinking, cooking, utensil cleaning, bathing and ablution */
  dryDaysPotable: 90,
  /** dry days for other purposes */
  dryDaysOther: 210,
  freeboard: 0.1,
  wallShare: 0.5,
  minRdp: 2,
  minRdpDiameterMm: 50,
  firstFlushMin: { Dhaka: 20, Sylhet: 15, Chittagong: 15, 'Other urban areas': 15 } as Record<string, number>,
}

// ------------------------------------------------------------------ catchment
/** BNBC 2020 catchment: flat terraces count their plan area plus 50 % of the adjoining vertical wall; an inclined roof counts its inclined area */
export function catchmentArea(o: { terraces?: number[]; walls?: number[]; inclined?: number[] }) {
  const plan = (o.terraces ?? []).reduce((s, a) => s + a, 0)
  const wall = (o.walls ?? []).reduce((s, a) => s + a, 0)
  const inclined = (o.inclined ?? []).reduce((s, a) => s + a, 0)
  return { plan, wallRaw: wall, wallShare: BNBC.wallShare * wall, inclined, total: plan + BNBC.wallShare * wall + inclined }
}

/** volume harvested in a period: A (m2) x rain (mm) / 1000 x C, in m3 */
export const harvest = (area: number, rainMm: number, C: number) => (area * rainMm * C) / 1000

/** monthly harvest series (m3) */
export const harvestMonthly = (area: number, rain: number[], C: number) => rain.map((r) => harvest(area, r, C))

// ------------------------------------------------------------------ demand side (M1)
export interface DemandSide {
  /** litres */
  V: number
  freeboard: number
  design: number
  /** m3 */
  designM3: number
}
/** V = n d q, plus 10 % freeboard (RWH-1: 6 x 10 x 100 = 6000 L, +600 L = 6.6 m3) */
export function demandSide(o: { users: number; perCapita: number; days: number; freeboard?: number }): DemandSide {
  const V = o.users * o.perCapita * o.days
  const fb = V * (o.freeboard ?? BNBC.freeboard)
  return { V, freeboard: fb, design: V + fb, designM3: (V + fb) / 1000 }
}
/** BNBC split: potable uses for 90 days, other uses for 210 days */
export function demandSideBnbc(o: { users: number; potable: number; other: number; freeboard?: number }) {
  const a = demandSide({ users: o.users, perCapita: o.potable, days: BNBC.dryDaysPotable, freeboard: 0 })
  const b = demandSide({ users: o.users, perCapita: o.other, days: BNBC.dryDaysOther, freeboard: 0 })
  const V = a.V + b.V
  const fb = V * (o.freeboard ?? BNBC.freeboard)
  return { potable: a.V, other: b.V, V, freeboard: fb, design: V + fb, designM3: (V + fb) / 1000 }
}
/** "tank for N dry months": demand over N x 30 days plus freeboard (2023-24 Q3(d)) */
export function dryMonths(o: { users: number; perCapita: number; months: number; daysPerMonth?: number; freeboard?: number }) {
  const days = o.months * (o.daysPerMonth ?? 30)
  return { days, ...demandSide({ users: o.users, perCapita: o.perCapita, days, freeboard: o.freeboard }) }
}

// ------------------------------------------------------------------ supply side (M2)
export interface MassRow {
  month: string
  /** index 0-11 into the calendar year */
  idx: number
  rain: number
  harvest: number
  cumHarvest: number
  demand: number
  cumDemand: number
  /** cum harvest - cum demand */
  diff: number
  /** storage left at the end of the month under the sequent-peak (spill allowed) simulation */
  deficit: number
}
export interface SupplySide {
  rows: MassRow[]
  startIdx: number
  annualHarvest: number
  /** demand asked for, m3 per mean month */
  demandAsked: number
  /** demand actually used per month (cut to the supply when the supply is less) */
  demandUsed: number
  supplyGoverns: boolean
  /** maximum of the cum-harvest-minus-cum-demand column (her "maximum difference") */
  maxDiff: number
  maxDiffMonth: string
  /** storage that never runs dry (sequent-peak); equals maxDiff when demand is cut to the supply */
  tank: number
  /** harvest that spills over a tank of that size in a normal year */
  spill: number
}

/**
 * Mass curve (RWH-2). `demandPerMonth` in m3 per mean month (e.g. 715 L/d -> 21.75). When the annual demand exceeds the annual
 * harvest it is replaced by harvest/12 each month ("supply side governs"). The table starts at `start` (0-11), by default the first
 * month after the cumulative balance bottoms out, i.e. the start of the dry season (October for the dispensary example).
 */
export function supplySide(o: { area: number; C: number; rain: number[]; demandPerMonth: number; start?: number }): SupplySide {
  const h = harvestMonthly(o.area, o.rain, o.C)
  const annualHarvest = h.reduce((s, x) => s + x, 0)
  const supplyGoverns = o.demandPerMonth * 12 > annualHarvest
  const dUsed = supplyGoverns ? annualHarvest / 12 : o.demandPerMonth
  // start of the dry season: month after the lowest cumulative (harvest - demand)
  let start = o.start
  if (start == null) {
    let c = 0
    let best = Infinity
    let bi = 0
    h.forEach((x, i) => {
      c += x - dUsed
      if (c < best - 1e-6) {
        best = c
        bi = i
      }
    })
    start = (bi + 1) % 12
  }
  const order = Array.from({ length: 12 }, (_, k) => (start! + k) % 12)
  const rows: MassRow[] = []
  let ch = 0
  let cd = 0
  for (const i of order) {
    ch += h[i]
    cd += dUsed
    rows.push({ month: MONTHS[i], idx: i, rain: o.rain[i], harvest: h[i], cumHarvest: ch, demand: dUsed, cumDemand: cd, diff: ch - cd, deficit: 0 })
  }
  // sequent peak over two years, empty tank at the start of the table
  let s = 0
  let K = 0
  for (let pass = 0; pass < 2; pass++)
    order.forEach((i) => {
      s = Math.max(0, s + dUsed - h[i])
      K = Math.max(K, s)
    })
  // spill: simulate a tank of size K starting full at the table start's equivalent steady state (two passes, report the second)
  let level = K
  let spill = 0
  for (let pass = 0; pass < 2; pass++) {
    spill = 0
    order.forEach((i) => {
      level = level + h[i] - dUsed
      if (level > K) {
        spill += level - K
        level = K
      }
      if (level < 0) level = 0
    })
  }
  // deficit column for plotting: how much is missing from full at month end (second pass)
  let lv = K
  for (let pass = 0; pass < 2; pass++)
    order.forEach((i, k) => {
      lv = Math.min(K, Math.max(0, lv + h[i] - dUsed))
      if (pass === 1) rows[k].deficit = K - lv
    })
  let mi = 0
  rows.forEach((r, k) => {
    if (r.diff > rows[mi].diff + 1e-9) mi = k
  })
  return { rows, startIdx: start, annualHarvest, demandAsked: o.demandPerMonth, demandUsed: dUsed, supplyGoverns, maxDiff: rows[mi].diff, maxDiffMonth: rows[mi].month, tank: K, spill }
}

/** monthly demand (m3 per mean month) from litres per day */
export const monthlyFromLpd = (lpd: number) => (lpd * 365) / 12 / 1000

// ------------------------------------------------------------------ the three answers side by side
export interface RwhCompare {
  harvestYear: number
  demandYear: number
  /** 90 / 210 day rule; m3 incl. freeboard */
  demandSide: number
  supply: SupplySide
  /** N dry months; m3 incl. freeboard */
  dryMonths: number
  /** which side limits the system */
  governs: 'supply' | 'demand'
}
export function compare(o: { area: number; C: number; rain: number[]; users: number; potable: number; other: number; dryMonthsN?: number }): RwhCompare {
  const perCap = o.potable + o.other
  const lpd = o.users * perCap
  const supply = supplySide({ area: o.area, C: o.C, rain: o.rain, demandPerMonth: monthlyFromLpd(lpd) })
  const ds = demandSideBnbc({ users: o.users, potable: o.potable, other: o.other })
  const dm = dryMonths({ users: o.users, perCapita: perCap, months: o.dryMonthsN ?? 3 })
  return { harvestYear: supply.annualHarvest, demandYear: (lpd * 365) / 1000, demandSide: ds.designM3, supply, dryMonths: dm.designM3, governs: supply.supplyGoverns ? 'supply' : 'demand' }
}

// ------------------------------------------------------------------ rainfall tables used by the papers
export const RAIN_TABLES: { id: string; label: string; rain: number[] }[] = [
  { id: 'dispensary', label: 'Class example (dispensary), 1056 mm', rain: [114, 101, 136, 214, 75, 3, 5, 15, 47, 88, 124, 134] },
  { id: 'jan2021', label: 'Jan 2021 Q1(b), 1032 mm', rain: [14, 10, 86, 114, 136, 124, 200, 150, 88, 47, 60, 3] },
  { id: '2020-21', label: '2020-21 Q3(b), 2435 mm', rain: [5, 24, 53, 200, 250, 400, 590, 490, 210, 140, 61, 12] },
  { id: '2021-22', label: '2021-22 Q8(c), 2918 mm', rain: [5.6, 24.4, 54.7, 147.4, 298.6, 607.3, 727, 530, 259.3, 184.4, 67.5, 11.9] },
]

/** scale a monthly pattern to a given annual total (used when a paper gives only the annual rainfall) */
export const scaleRain = (rain: number[], annual: number) => {
  const s = rain.reduce((a, b) => a + b, 0)
  return rain.map((r) => (r * annual) / s)
}

// ------------------------------------------------------------------ a tank of a chosen size through the year
export interface TankYear {
  /** storage at the end of every month in table order (m3) */
  level: number[]
  /** water the roof could not put in (tank full), m3 per year */
  spill: number
  /** demand that could not be met (tank empty), m3 per year */
  short: number
  /** share of the demand that was met */
  reliability: number
  /** months with any shortfall */
  monthsShort: number
}
/** run a tank of `size` (m3) through the 12 months of a mass-curve table (two years, the second reported), starting empty */
export function tankYear(s: SupplySide, size: number, demandPerMonth = s.demandUsed): TankYear {
  let lv = 0
  let out: TankYear = { level: [], spill: 0, short: 0, reliability: 1, monthsShort: 0 }
  for (let pass = 0; pass < 2; pass++) {
    const level: number[] = []
    let spill = 0
    let short = 0
    let monthsShort = 0
    s.rows.forEach((r) => {
      lv += r.harvest - demandPerMonth
      if (lv > size) {
        spill += lv - size
        lv = size
      }
      if (lv < -1e-9) {
        short += -lv
        monthsShort++
        lv = 0
      }
      lv = Math.max(0, lv)
      level.push(lv)
    })
    out = { level, spill, short, monthsShort, reliability: 1 - short / (demandPerMonth * 12 || 1) }
  }
  return out
}
