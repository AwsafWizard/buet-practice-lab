// Lateral earth pressure (AJK sir, Lecture 6 + the Lateral Earth Pressure handnote; flagged extras from old papers).
// Units: kN, m, kPa. Depth z is measured down from the top of the wall; arms are measured UP from the base.

import { circle, tangentPoint } from './mohr'
import { deg, GW, rad } from './units'

const sin = (d: number) => Math.sin(rad(d))
const cos = (d: number) => Math.cos(rad(d))
const tan = (d: number) => Math.tan(rad(d))

// ---------------------------------------------------------------- coefficients
/** Rankine active: tan²(45 − φ/2) = (1 − sinφ)/(1 + sinφ); φ = 0 → 1 */
export const Ka = (phi: number) => tan(45 - phi / 2) ** 2
/** Rankine passive: tan²(45 + φ/2) = 1/Ka */
export const Kp = (phi: number) => tan(45 + phi / 2) ** 2

/** AJK sir's five K0 formulas (Das eqs 13.5–13.9) */
export const K0 = {
  /** 13.5 Jaky — coarse-grained / loose sand */
  jaky: (phi: number) => 1 - sin(phi),
  /** 13.6 Sherif et al. — dense compacted sand */
  sherif: (phi: number, gd: number, gdMin: number) => 1 - sin(phi) + 5.5 * (gd / gdMin - 1),
  /** 13.7 Mayne & Kulhawy — OC soils, clay to gravel */
  mayne: (phi: number, OCR: number) => (1 - sin(phi)) * OCR ** sin(phi),
  /** 13.8 Massarsch — NC fine soils */
  massarsch: (PI: number) => 0.44 + 0.42 * (PI / 100),
  /** 13.9 OC clay from NC */
  ocSqrt: (K0nc: number, OCR: number) => K0nc * Math.sqrt(OCR),
}
export type K0Formula = 'jaky' | 'sherif' | 'mayne' | 'massarsch' | 'massarschOC'
export const K0_LABEL: Record<K0Formula, string> = {
  jaky: 'Jaky 1 − sin φ′ (13.5)',
  sherif: 'Sherif (13.6)',
  mayne: 'Mayne–Kulhawy (13.7)',
  massarsch: 'Massarsch (13.8)',
  massarschOC: 'Massarsch × √OCR (13.9)',
}
export function k0By(f: K0Formula, o: { phi: number; OCR?: number; gd?: number; gdMin?: number; PI?: number }) {
  if (f === 'jaky') return K0.jaky(o.phi)
  if (f === 'sherif') return K0.sherif(o.phi, o.gd ?? 1, o.gdMin ?? 1)
  if (f === 'mayne') return K0.mayne(o.phi, o.OCR ?? 1)
  if (f === 'massarsch') return K0.massarsch(o.PI ?? 0)
  return K0.ocSqrt(K0.massarsch(o.PI ?? 0), o.OCR ?? 1)
}

/** Das Table 13.1: wall movement ΔL/H to mobilise the active / passive state */
export const MOVE_TABLE: { soil: string; a: [number, number]; p: [number, number] }[] = [
  { soil: 'Loose sand', a: [0.001, 0.002], p: [0.01, 0.01] },
  { soil: 'Dense sand', a: [0.0005, 0.001], p: [0.005, 0.005] },
  { soil: 'Soft clay', a: [0.02, 0.02], p: [0.04, 0.04] },
  { soil: 'Stiff clay', a: [0.01, 0.01], p: [0.02, 0.02] },
]

// ---------------------------------------------------------------- the general Rankine wall
export type WallState = 'rest' | 'active' | 'passive'

export interface Layer {
  /** thickness (m) */
  h: number
  /** unit weight above the WT */
  gamma: number
  /** saturated unit weight below the WT (defaults to γ) */
  gammaSat?: number
  /** φ′ (deg); 0 with c > 0 = undrained clay */
  phi: number
  /** c′ (or cu when φ = 0) */
  c: number
  /** K0 for the at-rest state (defaults to Jaky) */
  K0?: number
  /** φ = 0 total-stress analysis: σa = σv(total) + q − 2cu, no separate water (handnote / 2021-22 Q8(c)) */
  total?: boolean
  name?: string
}

export interface FrontSoil {
  /** depth of soil in front of the wall (its bottom is the wall base) */
  D: number
  gamma: number
  phi: number
  c?: number
}

export interface Wall {
  layers: Layer[]
  /** WT depth below the top (null → no water in the backfill) */
  zw: number | null
  /** uniform surcharge on the backfill (kPa) */
  q: number
  state: WallState
  front?: FrontSoil | null
  gw?: number
}

export type PieceKind = 'soil' | 'cohesion' | 'surcharge' | 'water' | 'net' | 'passive'
export interface Piece {
  kind: PieceKind
  label: string
  shape: 'rect' | 'tri'
  /** depth range (from the top of the wall) */
  z1: number
  z2: number
  /** ordinate used (kPa): rectangle height or the triangle's base */
  base: number
  F: number
  /** arm above the base */
  arm: number
  M: number
}

export interface Ordinate {
  z: number
  /** 'top' (just below this depth), 'bot' (just above) — at an interface both are listed */
  at: 'top' | 'bot'
  layer: number
  K: number
  sv: number
  u: number
  svP: number
  /** σ′vK */
  soil: number
  /** −2c√K (active), +2c√K (passive), 0 at rest */
  coh: number
  /** qK */
  sur: number
  /** soil + coh + sur */
  earth: number
  water: number
  total: number
}

export interface Segment {
  z1: number
  z2: number
  layer: number
  K: number
  top: Ordinate
  bot: Ordinate
}

export interface WallResult {
  H: number
  K: number[]
  segs: Segment[]
  ords: Ordinate[]
  /** pieces after the crack (what the handnote calls the design value) */
  pieces: Piece[]
  /** pieces with the tension zone kept (only differs when there is a crack) */
  piecesBefore: Piece[]
  /** 'net' = soil, cohesion and surcharge combined (c > 0 somewhere); 'split' = handnote rectangles and triangles */
  mode: 'net' | 'split'
  tension: { from: number; to: number }[]
  /** first crack depth from the top (null if none) */
  zc: number | null
  front: { Kp: number; sp: number; coh: number; P: number; arm: number; pieces: Piece[] } | null
  /** driving thrust (after crack), before passive */
  Fdrive: number
  Mdrive: number
  /** before-crack thrust */
  Fbefore: number
  Mbefore: number
  /** net sliding force and overturning moment (passive in front subtracted) */
  Fs: number
  MOT: number
  /** resultant location above the base */
  zbar: number
  zbarBefore: number
  waterF: number
}

const EPS = 1e-9

export function kFor(l: Layer, state: WallState) {
  if (state === 'rest') return l.K0 ?? K0.jaky(l.phi)
  return state === 'active' ? Ka(l.phi) : Kp(l.phi)
}

function tri(kind: PieceKind, label: string, z1: number, z2: number, base: number, H: number, increasingDown = true): Piece {
  const h = z2 - z1
  const F = 0.5 * base * h
  const arm = H - z2 + (increasingDown ? h / 3 : (2 * h) / 3)
  return { kind, label, shape: 'tri', z1, z2, base, F, arm, M: F * arm }
}
function rect(kind: PieceKind, label: string, z1: number, z2: number, base: number, H: number): Piece {
  const h = z2 - z1
  const F = base * h
  const arm = H - z2 + h / 2
  return { kind, label, shape: 'rect', z1, z2, base, F, arm, M: F * arm }
}

const rng = (a: number, b: number) => `${+a.toFixed(2)}–${+b.toFixed(2)} m`

export function solveWall(w: Wall): WallResult {
  const gw = w.gw ?? GW
  const H = w.layers.reduce((s, l) => s + l.h, 0)
  const K = w.layers.map((l) => kFor(l, w.state))
  const zw = w.zw === null || w.zw >= H - EPS ? null : Math.max(0, w.zw)
  // key depths
  const tops: number[] = []
  let acc = 0
  for (const l of w.layers) {
    tops.push(acc)
    acc += l.h
  }
  const keys = [...new Set([...tops, H, ...(zw !== null ? [zw] : [])].map((z) => +z.toFixed(9)))].sort((a, b) => a - b)
  const layerAt = (zMid: number) => {
    for (let i = w.layers.length - 1; i >= 0; i--) if (zMid >= tops[i] - EPS) return i
    return 0
  }
  // σv and u at depth z (σv integrates layers; below the WT uses γsat)
  const sv = (z: number) => {
    let s = w.q
    for (let i = 0; i < w.layers.length; i++) {
      const l = w.layers[i]
      const a = tops[i],
        b = Math.min(z, tops[i] + l.h)
      if (b <= a) continue
      const dry = zw === null ? b - a : Math.max(0, Math.min(b, zw) - a)
      const wet = b - a - dry
      s += l.gamma * dry + (l.gammaSat ?? l.gamma) * wet
    }
    return s
  }
  const uAt = (z: number) => (zw === null ? 0 : gw * Math.max(0, z - zw))
  const ordAt = (z: number, i: number, at: 'top' | 'bot'): Ordinate => {
    const l = w.layers[i]
    const k = K[i]
    const s = sv(z)
    const u = uAt(z)
    const svTot = s - w.q
    const svP = svTot - u
    const cc = w.state === 'rest' ? 0 : (w.state === 'active' ? -2 : 2) * l.c * Math.sqrt(k)
    if (l.total) {
      // φ = 0 total stress: σ = (q + σv)·K ∓ 2cu, water included in γsat
      const soil = svTot * k
      const sur = w.q * k
      const earth = soil + cc + sur
      return { z, at, layer: i, K: k, sv: svTot, u, svP, soil, coh: cc, sur, earth, water: 0, total: earth }
    }
    const soil = svP * k
    const sur = w.q * k
    const earth = soil + cc + sur
    return { z, at, layer: i, K: k, sv: svTot, u, svP, soil, coh: cc, sur, earth, water: u, total: earth + u }
  }
  const segs: Segment[] = []
  const ords: Ordinate[] = []
  for (let j = 0; j + 1 < keys.length; j++) {
    const z1 = keys[j],
      z2 = keys[j + 1]
    if (z2 - z1 < 1e-9) continue
    const i = layerAt((z1 + z2) / 2)
    const top = ordAt(z1, i, 'top'),
      bot = ordAt(z2, i, 'bot')
    segs.push({ z1, z2, layer: i, K: K[i], top, bot })
  }
  // ordinates: at each key depth, the value just above (bot of the segment above) and just below
  for (let j = 0; j < segs.length; j++) {
    if (j === 0) ords.push(segs[0].top)
    else {
      const prev = segs[j - 1].bot,
        cur = segs[j].top
      ords.push(prev)
      if (Math.abs(prev.total - cur.total) > 1e-6 || prev.layer !== cur.layer) ords.push(cur)
    }
  }
  if (segs.length) ords.push(segs[segs.length - 1].bot)

  const anyC = w.state !== 'rest' && w.layers.some((l) => l.c > 0)
  const mode: 'net' | 'split' = anyC ? 'net' : 'split'
  const pieces: Piece[] = []
  const piecesBefore: Piece[] = []
  const tension: { from: number; to: number }[] = []
  for (const s of segs) {
    const name = w.layers.length > 1 ? `layer ${s.layer + 1}` : ''
    const tag = (what: string) => `${what}${name ? ` (${name}` : ' ('}${name ? ', ' : ''}${rng(s.z1, s.z2)})`
    if (mode === 'net') {
      const a = s.top.earth,
        b = s.bot.earth
      // before crack: rectangle of the top value + triangle of the increase
      if (Math.abs(a) > EPS) piecesBefore.push(rect('net', tag(a < 0 ? 'Tension zone, rectangle' : 'Earth, rectangle'), s.z1, s.z2, a, H))
      if (Math.abs(b - a) > EPS) piecesBefore.push(tri('net', tag('Earth, triangle'), s.z1, s.z2, b - a, H, b - a > 0))
      if (a >= -EPS) {
        if (Math.abs(a) > EPS) pieces.push(rect('net', tag('Earth, rectangle'), s.z1, s.z2, a, H))
        if (Math.abs(b - a) > EPS) pieces.push(tri('net', tag('Earth, triangle'), s.z1, s.z2, b - a, H, b - a > 0))
      } else if (b > EPS) {
        const z0 = s.z1 + ((s.z2 - s.z1) * -a) / (b - a)
        tension.push({ from: s.z1, to: z0 })
        pieces.push(tri('net', tag('Earth below the crack, triangle').replace(rng(s.z1, s.z2), rng(z0, s.z2)), z0, s.z2, b, H))
      } else tension.push({ from: s.z1, to: s.z2 })
    } else {
      const a = s.top.soil,
        b = s.bot.soil
      const P: Piece[] = []
      if (a > EPS) P.push(rect('soil', tag('Soil, rectangle'), s.z1, s.z2, a, H))
      if (Math.abs(b - a) > EPS) P.push(tri('soil', tag('Soil, triangle'), s.z1, s.z2, b - a, H, b - a > 0))
      if (s.top.coh > EPS) P.push(rect('cohesion', tag('Cohesion 2c′√K'), s.z1, s.z2, s.top.coh, H))
      if (s.top.sur > EPS) P.push(rect('surcharge', tag('Surcharge qK'), s.z1, s.z2, s.top.sur, H))
      pieces.push(...P)
      piecesBefore.push(...P)
    }
    // water (always separate, K = 1)
    const wa = s.top.water,
      wb = s.bot.water
    const W: Piece[] = []
    if (wa > EPS) W.push(rect('water', tag('Water, rectangle'), s.z1, s.z2, wa, H))
    if (wb - wa > EPS) W.push(tri('water', tag('Water, triangle'), s.z1, s.z2, wb - wa, H))
    pieces.push(...W)
    piecesBefore.push(...W)
  }
  // merge adjacent tension zones
  const tz: { from: number; to: number }[] = []
  for (const t of tension) {
    const last = tz[tz.length - 1]
    if (last && Math.abs(last.to - t.from) < 1e-6) last.to = t.to
    else tz.push({ ...t })
  }
  const zc = tz.length && tz[0].from < 1e-6 ? tz[0].to : null

  // passive soil in front
  let front: WallResult['front'] = null
  if (w.front && w.front.D > 0) {
    const f = w.front
    const kp = Kp(f.phi)
    const coh = 2 * (f.c ?? 0) * Math.sqrt(kp)
    const sp = f.gamma * f.D * kp
    const z1 = H - f.D
    const fp: Piece[] = []
    if (coh > EPS) fp.push(rect('passive', `Passive in front, rectangle 2c√Kp (${rng(z1, H)})`, z1, H, coh, H))
    fp.push(tri('passive', `Passive in front, triangle (${rng(z1, H)})`, z1, H, sp, H))
    for (const p of fp) {
      p.F = -p.F
      p.M = -p.M
    }
    const P = -fp.reduce((s, p) => s + p.F, 0)
    const Mp = -fp.reduce((s, p) => s + p.M, 0)
    front = { Kp: kp, sp: sp + coh, coh, P, arm: Mp / P, pieces: fp }
  }
  const sum = (ps: Piece[]) => ({ F: ps.reduce((s, p) => s + p.F, 0), M: ps.reduce((s, p) => s + p.M, 0) })
  const d = sum(pieces),
    bf = sum(piecesBefore)
  const Fs = d.F - (front?.P ?? 0)
  const MOT = d.M - (front ? front.P * front.arm : 0)
  return {
    H,
    K,
    segs,
    ords,
    pieces: [...pieces, ...(front?.pieces ?? [])],
    piecesBefore: [...piecesBefore, ...(front?.pieces ?? [])],
    mode,
    tension: tz,
    zc,
    front,
    Fdrive: d.F,
    Mdrive: d.M,
    Fbefore: bf.F,
    Mbefore: bf.M,
    Fs,
    MOT,
    zbar: MOT / Fs,
    zbarBefore: bf.M / bf.F,
    waterF: pieces.filter((p) => p.kind === 'water').reduce((s, p) => s + p.F, 0),
  }
}

/** net earth pressure (soil + cohesion + surcharge) and water at any depth — for drawing */
export function pressureAt(r: WallResult, z: number) {
  const s = r.segs.find((g) => z >= g.z1 - 1e-9 && z <= g.z2 + 1e-9) ?? r.segs[r.segs.length - 1]
  const t = s.z2 > s.z1 ? (z - s.z1) / (s.z2 - s.z1) : 0
  const lerp = (a: number, b: number) => a + t * (b - a)
  return { soil: lerp(s.top.soil, s.bot.soil), coh: s.top.coh, sur: s.top.sur, earth: lerp(s.top.earth, s.bot.earth), water: lerp(s.top.water, s.bot.water) }
}

// ---------------------------------------------------------------- tension crack and cuts (single c–φ layer)
/** crack depth zc = (2c/√Ka − q)/γ ; undrained (φ = 0): (2cu − q)/γ */
export const crackDepth = (c: number, gamma: number, phi: number, q = 0) => Math.max(0, (2 * c / Math.sqrt(Ka(phi)) - q) / gamma)
/** critical height of an unsupported vertical cut Hc = 4c/(γ√Ka) (= 2zc); φ = 0 → 4cu/γ */
export const criticalHeight = (c: number, gamma: number, phi = 0) => (4 * c) / (gamma * Math.sqrt(Ka(phi)))
/** single layer, before and after the crack (handnote formulas) */
export function crackForces(o: { H: number; gamma: number; phi: number; c: number; q?: number }) {
  const ka = Ka(o.phi),
    q = o.q ?? 0
  const top = q * ka - 2 * o.c * Math.sqrt(ka)
  const base = (q + o.gamma * o.H) * ka - 2 * o.c * Math.sqrt(ka)
  const zc = crackDepth(o.c, o.gamma, o.phi, q)
  const before = ((top + base) / 2) * o.H
  const after = zc < o.H ? 0.5 * (o.H - zc) * base : 0
  return { ka, top, base, zc, before, after, armAfter: (o.H - zc) / 3, Hc: criticalHeight(o.c, o.gamma, o.phi) }
}

// ---------------------------------------------------------------- one soil element in the three states (Problem 8, 2023-24 Q2(c))
export function stateCircles(o: { sv: number; phi: number; c: number; K0?: number }) {
  const ka = Ka(o.phi),
    kp = Kp(o.phi)
  const k0 = o.K0 ?? K0.jaky(o.phi)
  const sa = o.sv * ka - 2 * o.c * Math.sqrt(ka)
  const sp = o.sv * kp + 2 * o.c * Math.sqrt(kp)
  const s0 = o.sv * k0
  const mk = (sh: number) => {
    const cc = circle(Math.max(o.sv, sh), Math.min(o.sv, sh))
    return { sh, ...cc, tp: tangentPoint(cc, o.phi), check: cc.C * sin(o.phi) + o.c * cos(o.phi) }
  }
  return {
    rest: mk(s0),
    active: mk(sa),
    passive: mk(sp),
    k0,
    ka,
    kp,
    /** failure planes to the horizontal */
    thActive: 45 + o.phi / 2,
    thPassive: 45 - o.phi / 2,
    /** distance from the wall where the failure plane meets the surface (H = 1) */
    wedgeA: 1 / tan(45 + o.phi / 2),
    wedgeP: 1 / tan(45 - o.phi / 2),
  }
}

/** lateral pressure ratio vs wall tilt (qualitative curve through Das Fig. 13.2; x = ΔL/H, + = into the soil) */
export function kVsTilt(x: number, o: { k0: number; ka: number; kp: number; xa: number; xp: number }) {
  if (x <= 0) {
    const t = Math.min(1, -x / o.xa)
    return o.ka + (o.k0 - o.ka) * (1 - t) ** 3
  }
  const t = Math.min(1, x / o.xp)
  return o.k0 + (o.kp - o.k0) * (1 - (1 - t) ** 2.2)
}

// ---------------------------------------------------------------- flagged extras (not in AJK sir's slides)
/** Rankine active / passive with a backfill sloping at β (cohesionless): thrust parallel to the slope */
export function rankineSloping(phi: number, beta: number) {
  const cb = cos(beta),
    r = Math.sqrt(Math.max(0, cb * cb - cos(phi) ** 2))
  const ka = (cb * (cb - r)) / (cb + r)
  const kp = (cb * (cb + r)) / (cb - r)
  return { ka, kp, kaH: ka * cb, kpH: kp * cb }
}

/** Coulomb Ka, Kp (Das eqs 13.62, 13.70): θ = wall back from vertical, β = backfill slope, δ = wall friction */
export function coulomb(phi: number, delta: number, theta = 0, beta = 0) {
  const ka = cos(phi - theta) ** 2 / (cos(theta) ** 2 * cos(delta + theta) * (1 + Math.sqrt((sin(delta + phi) * sin(phi - beta)) / (cos(delta + theta) * cos(theta - beta)))) ** 2)
  const kp = cos(phi + theta) ** 2 / (cos(theta) ** 2 * cos(delta - theta) * (1 - Math.sqrt((sin(phi + delta) * sin(phi + beta)) / (cos(delta - theta) * cos(beta - theta)))) ** 2)
  return { ka, kp }
}

/** Culmann / trial-wedge search behind a vertical smooth or rough wall (δ), backfill at β, optional surcharge q.
 *  P(ρ) = W sin(ρ − φ)/cos(ρ − φ − δ) (active, max) or W sin(ρ + φ)/cos(ρ + φ + δ) (passive, min). */
export function trialWedge(o: { H: number; gamma: number; phi: number; delta?: number; beta?: number; q?: number; state: 'active' | 'passive'; step?: number }) {
  const d = o.delta ?? 0,
    b = o.beta ?? 0,
    q = o.q ?? 0
  const step = o.step ?? 0.05
  const curve: { rho: number; W: number; P: number }[] = []
  const lo = o.state === 'active' ? Math.max(o.phi, b) + step : Math.max(b, 0) + step
  const hi = o.state === 'active' ? 89.9 : 90 - o.phi - d - step
  for (let rho = lo; rho <= hi; rho += step) {
    const x = o.H / (tan(rho) - tan(b))
    if (!(x > 0)) continue
    const W = 0.5 * o.gamma * o.H * x + q * x
    const P = o.state === 'active' ? (W * sin(rho - o.phi)) / cos(rho - o.phi - d) : (W * sin(rho + o.phi)) / cos(rho + o.phi + d)
    if (Number.isFinite(P) && P > 0) curve.push({ rho, W, P })
  }
  const best = curve.reduce((m, c) => (o.state === 'active' ? (c.P > m.P ? c : m) : c.P < m.P ? c : m), curve[0])
  return { ...best, Ph: best.P * cos(d), Pv: best.P * sin(d), curve, K: (2 * best.P) / (o.gamma * o.H * o.H) }
}

/** lateral pressure on a wall from a surface point load (modified Boussinesq, Terzaghi / Gerber–Spangler) at depth z.
 *  m = x/H, n = z/H; m ≤ 0.4: 0.28Q/H²·n²/(0.16 + n²)³ ; m > 0.4: 1.77Q/H²·m²n²/(m² + n²)³ ; off the section: ×cos²(1.1α) */
export function pointLoadSigma(Q: number, x: number, H: number, z: number, alphaDeg = 0) {
  const m = x / H,
    n = z / H
  const s = m <= 0.4 ? ((0.28 * Q) / (H * H)) * (n * n) / (0.16 + n * n) ** 3 : ((1.77 * Q) / (H * H)) * (m * m * n * n) / (m * m + n * n) ** 3
  return s * cos(1.1 * alphaDeg) ** 2
}
/** line load q (kN/m) parallel to the wall at x: m ≤ 0.4: 0.203q/H·n/(0.16 + n²)² ; m > 0.4: 1.27q/H·m²n/(m² + n²)² */
export function lineLoadSigma(q: number, x: number, H: number, z: number) {
  const m = x / H,
    n = z / H
  return m <= 0.4 ? ((0.203 * q) / H) * n / (0.16 + n * n) ** 2 : ((1.27 * q) / H) * (m * m * n) / (m * m + n * n) ** 2
}
/** integrate a pressure function over the wall height (Simpson): force per m and its height above the base */
export function integrateWall(f: (z: number) => number, H: number, n = 400) {
  const h = H / n
  let F = 0,
    M = 0
  for (let i = 0; i <= n; i++) {
    const z = i * h
    const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2
    const v = f(z)
    F += w * v
    M += w * v * (H - z)
  }
  F *= h / 3
  M *= h / 3
  return { P: F, arm: M / F }
}
/** Boussinesq (ν = 0.5) point load: total horizontal force on the whole wall (both directions) = (Q/π)·H²/(x² + H²) */
export const pointLoadWholeWall = (Q: number, x: number, H: number) => (Q / Math.PI) * (H * H) / (x * x + H * H)

/** sheet-pile embedment by horizontal force balance (2009-10 Q4(b)): ½γ(H + D)²Ka,h = ½γD²Kp */
export function sheetPileD(o: { H: number; kaH: number; kp: number }) {
  const ra = Math.sqrt(o.kaH),
    rp = Math.sqrt(o.kp)
  return (o.H * ra) / (rp - ra)
}

export { deg }
