// Weight–volume (three-phase) solver, AJK sir's way: assume a basis (V = 1 or Vs = 1) when no size is
// given, fill the weight column and the volume column of the block diagram step by step, then read
// e, n, S, w and the unit weights off the diagram ("No derived expression has been used!").
// A numeric least-squares solve backs the step propagation, so any consistent set of knowns works
// (e.g. γ + S + Gs, where two blocks are linked and one equation must be solved).
//
// Units: weights W, volumes V, γw in the same system. Ratios S, w, n, ac, na are fractions (0–1).

import { GW, GW_PCF } from './units'

export type PhaseKey = 'V' | 'Vs' | 'Vv' | 'Vw' | 'Va' | 'W' | 'Ws' | 'Ww' | 'e' | 'n' | 'S' | 'w' | 'Gs' | 'g' | 'gd' | 'gsat' | 'gsub' | 'ac' | 'na'

export const EXTENSIVE: PhaseKey[] = ['V', 'Vs', 'Vv', 'Vw', 'Va', 'W', 'Ws', 'Ww']
export const INTENSIVE: PhaseKey[] = ['e', 'n', 'S', 'w', 'Gs', 'g', 'gd', 'gsat', 'gsub', 'ac', 'na']
export const ALL_KEYS: PhaseKey[] = [...EXTENSIVE, ...INTENSIVE]
/** keys whose engine value is a fraction (shown as %) */
export const PERCENT_KEYS: PhaseKey[] = ['n', 'S', 'w', 'ac', 'na']

export const PHASE_TEX: Record<PhaseKey, string> = {
  V: 'V',
  Vs: 'V_s',
  Vv: 'V_v',
  Vw: 'V_w',
  Va: 'V_a',
  W: 'W',
  Ws: 'W_s',
  Ww: 'W_w',
  e: 'e',
  n: 'n',
  S: 'S',
  w: 'w',
  Gs: 'G_s',
  g: '\\gamma',
  gd: '\\gamma_d',
  gsat: '\\gamma_{sat}',
  gsub: "\\gamma'",
  ac: 'a_c',
  na: 'n_a',
}
export const PHASE_NAME: Record<PhaseKey, string> = {
  V: 'total volume',
  Vs: 'volume of solids',
  Vv: 'volume of voids',
  Vw: 'volume of water',
  Va: 'volume of air',
  W: 'total weight',
  Ws: 'weight of solids',
  Ww: 'weight of water',
  e: 'void ratio',
  n: 'porosity',
  S: 'degree of saturation',
  w: 'water content',
  Gs: 'specific gravity of solids',
  g: 'moist (bulk) unit weight',
  gd: 'dry unit weight',
  gsat: 'saturated unit weight',
  gsub: 'submerged unit weight',
  ac: 'air content Va/Vv',
  na: 'percent air voids Va/V',
}

export interface UnitSys {
  key: 'kN' | 'kg' | 't' | 'g' | 'lb'
  label: string
  gw: number
  W: string
  V: string
  g: string
  /** densities (mass per volume) rather than unit weights */
  mass: boolean
}
export const UNIT_SYSTEMS: UnitSys[] = [
  { key: 'kN', label: 'kN, m³ (γw = 9.81 kN/m³)', gw: GW, W: 'kN', V: 'm³', g: 'kN/m³', mass: false },
  { key: 'g', label: 'g, cm³ (ρw = 1 g/cm³)', gw: 1, W: 'g', V: 'cm³', g: 'g/cm³', mass: true },
  { key: 'kg', label: 'kg, m³ (ρw = 1000 kg/m³)', gw: 1000, W: 'kg', V: 'm³', g: 'kg/m³', mass: true },
  { key: 't', label: 't, m³ (ρw = 1 t/m³)', gw: 1, W: 't', V: 'm³', g: 't/m³', mass: true },
  { key: 'lb', label: 'lb, ft³ (γw = 62.4 pcf)', gw: GW_PCF, W: 'lb', V: 'ft³', g: 'pcf', mass: false },
]
export const unitSys = (k: UnitSys['key']) => UNIT_SYSTEMS.find((u) => u.key === k)!

/** unit of a quantity in a unit system ('' for ratios) */
export function unitOf(k: PhaseKey, u: UnitSys): string {
  if (k[0] === 'V') return u.V
  if (k[0] === 'W') return u.W
  if (k === 'g' || k === 'gd' || k === 'gsat' || k === 'gsub') return u.g
  if (PERCENT_KEYS.includes(k)) return '%'
  return ''
}

/** 1 in = 2.54 cm; cylinder volume in cm³ from D and H in inches (or cm with inch = false) */
export const IN_CM = 2.54
export function cylinderVolume(D: number, H: number, inch = true) {
  const f = inch ? IN_CM : 1
  return (Math.PI / 4) * (D * f) ** 2 * (H * f)
}

// ---------------------------------------------------------------- the diagram from 4 numbers
export interface PhaseState {
  Vs: number
  Vv: number
  Vw: number
  Gs: number
}

export function derive(s: PhaseState, gw: number): Record<PhaseKey, number> {
  const V = s.Vs + s.Vv
  const Va = s.Vv - s.Vw
  const Ws = s.Gs * gw * s.Vs
  const Ww = gw * s.Vw
  const W = Ws + Ww
  const gsat = (Ws + gw * s.Vv) / V
  return {
    V,
    Vs: s.Vs,
    Vv: s.Vv,
    Vw: s.Vw,
    Va,
    W,
    Ws,
    Ww,
    e: s.Vv / s.Vs,
    n: s.Vv / V,
    S: s.Vv > 0 ? s.Vw / s.Vv : 0,
    w: Ww / Ws,
    Gs: s.Gs,
    g: W / V,
    gd: Ws / V,
    gsat,
    gsub: gsat - gw,
    ac: s.Vv > 0 ? Va / s.Vv : 0,
    na: Va / V,
  }
}

// ---------------------------------------------------------------- number formatting for the steps
/** compact number: 4 significant figures, no exponent in the usual range */
export function nf(x: number, sig = 4): string {
  if (!Number.isFinite(x)) return '—'
  if (x === 0) return '0'
  const a = Math.abs(x)
  const d = Math.max(0, sig - 1 - Math.floor(Math.log10(a)))
  let s = x.toFixed(Math.min(d, 8))
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '')
  return s === '-0' ? '0' : s
}

// ---------------------------------------------------------------- numeric least-squares solve
type Known = Partial<Record<PhaseKey, number>>

const RATIO_REF: Partial<Record<PhaseKey, number>> = { S: 1, w: 0.1, n: 0.1, ac: 1, na: 0.1, e: 0.1 }

function fromX(x: number[]): PhaseState {
  const Vs = Math.exp(x[0])
  const e = Math.exp(x[1])
  return { Vs, Vv: e * Vs, Vw: x[2] * e * Vs, Gs: x[3] }
}

function residuals(x: number[], known: Known, gw: number): number[] {
  const v = derive(fromX(x), gw)
  return (Object.keys(known) as PhaseKey[]).map((k) => {
    const t = known[k]!
    const ref = Math.max(Math.abs(t), RATIO_REF[k] ?? 1e-9)
    return (v[k] - t) / ref
  })
}

function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length
  const M = A.map((r, i) => [...r, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    if (Math.abs(M[p][c]) < 1e-300) return null
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((r, i) => r[n] / r[i])
}

function jacobian(x: number[], known: Known, gw: number) {
  const r0 = residuals(x, known, gw)
  return {
    r0,
    J: r0.map(() => [0, 0, 0, 0]).map((row, i) =>
      row.map((_, j) => {
        const h = 1e-7 * Math.max(1, Math.abs(x[j]))
        const xp = [...x]
        xp[j] += h
        return (residuals(xp, known, gw)[i] - r0[i]) / h
      }),
    ),
  }
}

function rank(J: number[][], tol = 1e-6): number {
  const M = J.map((r) => [...r])
  const m = M.length
  const n = 4
  let rk = 0
  const scale = Math.max(1e-300, ...M.flat().map(Math.abs))
  for (let c = 0; c < n && rk < m; c++) {
    let p = rk
    for (let r = rk + 1; r < m; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    if (Math.abs(M[p][c]) <= tol * scale) continue
    ;[M[rk], M[p]] = [M[p], M[rk]]
    for (let r = rk + 1; r < m; r++) {
      const f = M[r][c] / M[rk][c]
      for (let k = c; k < n; k++) M[r][k] -= f * M[rk][k]
    }
    rk++
  }
  return rk
}

function lm(x0: number[], known: Known, gw: number) {
  let x = [...x0]
  let lam = 1e-3
  let { r0, J } = jacobian(x, known, gw)
  let cost = r0.reduce((s, v) => s + v * v, 0)
  for (let it = 0; it < 200 && cost > 1e-26; it++) {
    const JtJ = [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => J.reduce((s, row) => s + row[i] * row[j], 0)))
    const Jtr = [0, 1, 2, 3].map((i) => J.reduce((s, row, k) => s + row[i] * r0[k], 0))
    let improved = false
    for (let tries = 0; tries < 12; tries++) {
      const A = JtJ.map((row, i) => row.map((v, j) => (i === j ? v + lam * (v + 1e-12) + 1e-14 : v)))
      const dx = solveLinear(A, Jtr.map((v) => -v))
      if (!dx) {
        lam *= 10
        continue
      }
      const xn = x.map((v, i) => v + Math.max(-3, Math.min(3, dx[i])))
      if (!xn.every(Number.isFinite)) {
        lam *= 10
        continue
      }
      const rn = residuals(xn, known, gw)
      const cn = rn.reduce((s, v) => s + v * v, 0)
      if (cn < cost) {
        x = xn
        cost = cn
        lam = Math.max(1e-12, lam / 5)
        improved = true
        break
      }
      lam *= 8
    }
    if (!improved) break
    ;({ r0, J } = jacobian(x, known, gw))
  }
  const r = residuals(x, known, gw)
  return { x, cost: r.reduce((s, v) => s + v * v, 0), r }
}

function guessVs(known: Known, gw: number): number {
  const k = known
  if (k.Vs) return k.Vs
  if (k.V) return k.V / 1.7
  if (k.Ws) return k.Ws / (2.65 * gw)
  if (k.W) return k.W / (3 * gw)
  if (k.Vv) return k.Vv / 0.7
  if (k.Vw) return k.Vw / 0.5
  if (k.Ww) return k.Ww / (0.5 * gw)
  if (k.Va) return k.Va / 0.3
  return 1
}

// ---------------------------------------------------------------- step propagation (the block diagram)
export interface PhaseStep {
  key: PhaseKey
  value: number
  /** tex of the working, e.g. W_s = W/(1+w) = 2350/1.086 = 2164 */
  tex: string
  kind: 'given' | 'basis' | 'weight' | 'volume' | 'convert' | 'solve' | 'result'
  note?: string
}

type V = Partial<Record<PhaseKey, number>>
interface Rule {
  out: PhaseKey
  ins: PhaseKey[]
  kind: PhaseStep['kind']
  ok?: (v: V) => boolean
  f: (v: Required<V>, gw: number) => number
  /** working with numbers */
  tex: (v: Required<V>, gw: number, r: number) => string
}

const T = PHASE_TEX
const n4 = (x: number) => nf(x, 4)

const RULES: Rule[] = [
  // weight column
  { out: 'Ws', ins: ['W', 'w'], kind: 'weight', f: (v) => v.W / (1 + v.w), tex: (v, _g, r) => `W = W_s + W_w = (1+w)W_s \\Rightarrow W_s = \\dfrac{${n4(v.W)}}{${n4(1 + v.w)}} = ${n4(r)}` },
  { out: 'Ww', ins: ['Ws', 'w'], kind: 'weight', f: (v) => v.w * v.Ws, tex: (v, _g, r) => `W_w = wW_s = ${n4(v.w)}\\times ${n4(v.Ws)} = ${n4(r)}` },
  { out: 'Ws', ins: ['Ww', 'w'], kind: 'weight', ok: (v) => (v.w ?? 0) > 0, f: (v) => v.Ww / v.w, tex: (v, _g, r) => `W_s = W_w/w = ${n4(v.Ww)}/${n4(v.w)} = ${n4(r)}` },
  { out: 'Ww', ins: ['W', 'Ws'], kind: 'weight', f: (v) => v.W - v.Ws, tex: (v, _g, r) => `W_w = W - W_s = ${n4(v.W)} - ${n4(v.Ws)} = ${n4(r)}` },
  { out: 'Ws', ins: ['W', 'Ww'], kind: 'weight', f: (v) => v.W - v.Ww, tex: (v, _g, r) => `W_s = W - W_w = ${n4(v.W)} - ${n4(v.Ww)} = ${n4(r)}` },
  { out: 'W', ins: ['Ws', 'Ww'], kind: 'weight', f: (v) => v.Ws + v.Ww, tex: (v, _g, r) => `W = W_s + W_w = ${n4(v.Ws)} + ${n4(v.Ww)} = ${n4(r)}` },
  { out: 'Ws', ins: ['gd', 'V'], kind: 'weight', f: (v) => v.gd * v.V, tex: (v, _g, r) => `W_s = \\gamma_d V = ${n4(v.gd)}\\times ${n4(v.V)} = ${n4(r)}` },
  { out: 'W', ins: ['g', 'V'], kind: 'weight', f: (v) => v.g * v.V, tex: (v, _g, r) => `W = \\gamma V = ${n4(v.g)}\\times ${n4(v.V)} = ${n4(r)}` },
  // volume column
  { out: 'Vs', ins: ['Ws', 'Gs'], kind: 'volume', f: (v, gw) => v.Ws / (v.Gs * gw), tex: (v, gw, r) => `V_s = \\dfrac{W_s}{G_s\\gamma_w} = \\dfrac{${n4(v.Ws)}}{${n4(v.Gs)}\\times ${n4(gw)}} = ${n4(r)}` },
  { out: 'Vw', ins: ['Ww'], kind: 'volume', f: (v, gw) => v.Ww / gw, tex: (v, gw, r) => `V_w = W_w/\\gamma_w = ${n4(v.Ww)}/${n4(gw)} = ${n4(r)}` },
  { out: 'Ww', ins: ['Vw'], kind: 'weight', f: (v, gw) => v.Vw * gw, tex: (v, gw, r) => `W_w = \\gamma_w V_w = ${n4(gw)}\\times ${n4(v.Vw)} = ${n4(r)}` },
  { out: 'Ws', ins: ['Vs', 'Gs'], kind: 'weight', f: (v, gw) => v.Gs * gw * v.Vs, tex: (v, gw, r) => `W_s = G_s\\gamma_w V_s = ${n4(v.Gs)}\\times ${n4(gw)}\\times ${n4(v.Vs)} = ${n4(r)}` },
  { out: 'Vv', ins: ['V', 'Vs'], kind: 'volume', f: (v) => v.V - v.Vs, tex: (v, _g, r) => `V_v = V - V_s = ${n4(v.V)} - ${n4(v.Vs)} = ${n4(r)}` },
  { out: 'Vs', ins: ['V', 'Vv'], kind: 'volume', f: (v) => v.V - v.Vv, tex: (v, _g, r) => `V_s = V - V_v = ${n4(v.V)} - ${n4(v.Vv)} = ${n4(r)}` },
  { out: 'V', ins: ['Vs', 'Vv'], kind: 'volume', f: (v) => v.Vs + v.Vv, tex: (v, _g, r) => `V = V_s + V_v = ${n4(v.Vs)} + ${n4(v.Vv)} = ${n4(r)}` },
  { out: 'Vv', ins: ['e', 'Vs'], kind: 'volume', f: (v) => v.e * v.Vs, tex: (v, _g, r) => `V_v = eV_s = ${n4(v.e)}\\times ${n4(v.Vs)} = ${n4(r)}` },
  { out: 'Vs', ins: ['Vv', 'e'], kind: 'volume', ok: (v) => (v.e ?? 0) > 0, f: (v) => v.Vv / v.e, tex: (v, _g, r) => `V_s = V_v/e = ${n4(v.Vv)}/${n4(v.e)} = ${n4(r)}` },
  { out: 'Vv', ins: ['n', 'V'], kind: 'volume', f: (v) => v.n * v.V, tex: (v, _g, r) => `V_v = nV = ${n4(v.n)}\\times ${n4(v.V)} = ${n4(r)}` },
  { out: 'V', ins: ['Vv', 'n'], kind: 'volume', ok: (v) => (v.n ?? 0) > 0, f: (v) => v.Vv / v.n, tex: (v, _g, r) => `V = V_v/n = ${n4(v.Vv)}/${n4(v.n)} = ${n4(r)}` },
  { out: 'Vw', ins: ['S', 'Vv'], kind: 'volume', f: (v) => v.S * v.Vv, tex: (v, _g, r) => `V_w = SV_v = ${n4(v.S)}\\times ${n4(v.Vv)} = ${n4(r)}` },
  { out: 'Vv', ins: ['Vw', 'S'], kind: 'volume', ok: (v) => (v.S ?? 0) > 0, f: (v) => v.Vw / v.S, tex: (v, _g, r) => `V_v = V_w/S = ${n4(v.Vw)}/${n4(v.S)} = ${n4(r)}` },
  { out: 'Va', ins: ['Vv', 'Vw'], kind: 'volume', f: (v) => v.Vv - v.Vw, tex: (v, _g, r) => `V_a = V_v - V_w = ${n4(v.Vv)} - ${n4(v.Vw)} = ${n4(r)}` },
  { out: 'Vw', ins: ['Vv', 'Va'], kind: 'volume', f: (v) => v.Vv - v.Va, tex: (v, _g, r) => `V_w = V_v - V_a = ${n4(v.Vv)} - ${n4(v.Va)} = ${n4(r)}` },
  { out: 'Vv', ins: ['Vw', 'Va'], kind: 'volume', f: (v) => v.Vw + v.Va, tex: (v, _g, r) => `V_v = V_w + V_a = ${n4(v.Vw)} + ${n4(v.Va)} = ${n4(r)}` },
  { out: 'Va', ins: ['ac', 'Vv'], kind: 'volume', f: (v) => v.ac * v.Vv, tex: (v, _g, r) => `V_a = a_cV_v = ${n4(v.ac)}\\times ${n4(v.Vv)} = ${n4(r)}` },
  { out: 'Va', ins: ['na', 'V'], kind: 'volume', f: (v) => v.na * v.V, tex: (v, _g, r) => `V_a = n_aV = ${n4(v.na)}\\times ${n4(v.V)} = ${n4(r)}` },
  { out: 'V', ins: ['W', 'g'], kind: 'volume', f: (v) => v.W / v.g, tex: (v, _g, r) => `V = W/\\gamma = ${n4(v.W)}/${n4(v.g)} = ${n4(r)}` },
  { out: 'V', ins: ['Ws', 'gd'], kind: 'volume', f: (v) => v.Ws / v.gd, tex: (v, _g, r) => `V = W_s/\\gamma_d = ${n4(v.Ws)}/${n4(v.gd)} = ${n4(r)}` },
  {
    out: 'Vv',
    ins: ['gsat', 'V', 'Ws'],
    kind: 'volume',
    f: (v, gw) => (v.gsat * v.V - v.Ws) / gw,
    tex: (v, gw, r) => `\\gamma_{sat}V = W_s + \\gamma_wV_v \\Rightarrow V_v = \\dfrac{${n4(v.gsat)}\\times ${n4(v.V)} - ${n4(v.Ws)}}{${n4(gw)}} = ${n4(r)}`,
  },
  { out: 'Ws', ins: ['gsat', 'V', 'Vv'], kind: 'weight', f: (v, gw) => v.gsat * v.V - gw * v.Vv, tex: (v, gw, r) => `W_s = \\gamma_{sat}V - \\gamma_wV_v = ${n4(v.gsat)}\\times ${n4(v.V)} - ${n4(gw)}\\times ${n4(v.Vv)} = ${n4(r)}` },
  { out: 'Gs', ins: ['Ws', 'Vs'], kind: 'result', f: (v, gw) => v.Ws / (v.Vs * gw), tex: (v, gw, r) => `G_s = \\dfrac{\\gamma_s}{\\gamma_w} = \\dfrac{W_s}{V_s\\gamma_w} = \\dfrac{${n4(v.Ws)}}{${n4(v.Vs)}\\times ${n4(gw)}} = ${n4(r)}` },
]

const CONVERSIONS: Rule[] = [
  { out: 'gsat', ins: ['gsub'], kind: 'convert', f: (v, gw) => v.gsub + gw, tex: (v, gw, r) => `\\gamma_{sat} = \\gamma' + \\gamma_w = ${n4(v.gsub)} + ${n4(gw)} = ${n4(r)}` },
  { out: 'e', ins: ['n'], kind: 'convert', f: (v) => v.n / (1 - v.n), tex: (v, _g, r) => `\\text{take } V = 1:\\ V_v = n,\\ V_s = 1-n \\Rightarrow e = \\dfrac{${n4(v.n)}}{${n4(1 - v.n)}} = ${n4(r)}` },
  { out: 'S', ins: ['ac'], kind: 'convert', f: (v) => 1 - v.ac, tex: (v, _g, r) => `S = 1 - a_c = ${n4(r)}` },
]

const RESULT_ORDER: PhaseKey[] = ['w', 'e', 'n', 'S', 'g', 'gd', 'gsat', 'gsub', 'Gs', 'na', 'ac']
const RESULT_TEX: Record<string, (v: Required<V>, gw: number) => string> = {
  w: (v) => `w = \\dfrac{W_w}{W_s} = \\dfrac{${n4(v.Ww)}}{${n4(v.Ws)}} = ${n4(v.w)} = ${nf(v.w * 100)}\\%`,
  e: (v) => `e = \\dfrac{V_v}{V_s} = \\dfrac{${n4(v.Vv)}}{${n4(v.Vs)}} = ${nf(v.e)}`,
  n: (v) => `n = \\dfrac{V_v}{V} = \\dfrac{${n4(v.Vv)}}{${n4(v.V)}} = ${nf(v.n)} = ${nf(v.n * 100)}\\%`,
  S: (v) => `S = \\dfrac{V_w}{V_v} = \\dfrac{${n4(v.Vw)}}{${n4(v.Vv)}} = ${nf(v.S)} = ${nf(v.S * 100)}\\%`,
  g: (v) => `\\gamma = \\dfrac{W}{V} = \\dfrac{${n4(v.W)}}{${n4(v.V)}} = ${n4(v.g)}`,
  gd: (v) => `\\gamma_d = \\dfrac{W_s}{V} = \\dfrac{${n4(v.Ws)}}{${n4(v.V)}} = ${n4(v.gd)}`,
  gsat: (v, gw) => `\\gamma_{sat} = \\dfrac{W_s + \\gamma_wV_v}{V} = \\dfrac{${n4(v.Ws)} + ${n4(gw)}\\times ${n4(v.Vv)}}{${n4(v.V)}} = ${n4(v.gsat)}`,
  gsub: (v, gw) => `\\gamma' = \\gamma_{sat} - \\gamma_w = ${n4(v.gsat)} - ${n4(gw)} = ${n4(v.gsub)}`,
  Gs: (v, gw) => `G_s = \\dfrac{W_s}{V_s\\gamma_w} = ${n4(v.Gs)}`,
  na: (v) => `n_a = \\dfrac{V_a}{V} = \\dfrac{${n4(v.Va)}}{${n4(v.V)}} = ${nf(v.na * 100)}\\%`,
  ac: (v) => `a_c = \\dfrac{V_a}{V_v} = \\dfrac{${n4(v.Va)}}{${n4(v.Vv)}} = ${nf(v.ac * 100)}\\%`,
}

export interface PhaseSolution {
  status: 'ok' | 'under' | 'inconsistent' | 'invalid'
  msg?: string
  /** every quantity (NaN where unknown) */
  vals: Record<PhaseKey, number>
  basis?: { key: 'V' | 'Vs'; value: number }
  steps: PhaseStep[]
  given: Known
  /** largest relative mismatch among the givens (over-determined data) */
  misfit: number
}

const NAN_VALS = () => Object.fromEntries(ALL_KEYS.map((k) => [k, NaN])) as Record<PhaseKey, number>

/**
 * Solve the phase diagram from the given quantities.
 * @param basis 'auto' (V = 1 if a unit weight or n is given, else Vs = 1), or force one
 */
export function solvePhase(given: Known, gw: number, opts: { basis?: 'auto' | 'V' | 'Vs' } = {}): PhaseSolution {
  const known: Known = {}
  for (const [k, v] of Object.entries(given)) if (v !== undefined && Number.isFinite(v)) known[k as PhaseKey] = v
  const bad = Object.entries(known).find(([k, v]) => (k === 'gsub' ? false : k === 'S' || k === 'w' || k === 'ac' || k === 'na' || k === 'Va' || k === 'Vw' || k === 'Ww' ? v! < 0 : v! <= 0))
  if (bad) return { status: 'invalid', msg: `${PHASE_NAME[bad[0] as PhaseKey]} must be positive`, vals: NAN_VALS(), steps: [], given: known, misfit: NaN }
  let basis: PhaseSolution['basis']
  const hasExt = EXTENSIVE.some((k) => known[k] !== undefined)
  if (!hasExt) {
    const wantV = opts.basis === 'V' || (opts.basis !== 'Vs' && ['g', 'gd', 'gsat', 'gsub', 'n', 'na'].some((k) => known[k as PhaseKey] !== undefined))
    basis = wantV ? { key: 'V', value: 1 } : { key: 'Vs', value: 1 }
  }
  const eqs: Known = { ...known, ...(basis ? { [basis.key]: basis.value } : {}) }
  const nEq = Object.keys(eqs).length
  // numeric solve from a few starting points
  const vs0 = guessVs(eqs, gw)
  let best: ReturnType<typeof lm> | null = null
  for (const e0 of [0.7, 0.35, 1.5])
    for (const S0 of [0.6, 1])
      for (const G0 of [2.65, 2.2]) {
        const r = lm([Math.log(eqs.Vs ?? vs0), Math.log(e0), eqs.S ?? S0, eqs.Gs ?? G0], eqs, gw)
        if (!best || r.cost < best.cost) best = r
        if (best.cost < 1e-24) break
      }
  const sol = best!
  const { J } = jacobian(sol.x, eqs, gw)
  const rk = rank(J)
  const vals = derive(fromX(sol.x), gw)
  const misfit = Math.max(0, ...sol.r.map(Math.abs))
  if (nEq < 4 || rk < 4) {
    return { status: 'under', msg: `Not enough independent data: ${rk} of the 4 needed (with ${basis ? `the basis ${basis.key} = 1` : 'the size given'}). Add one more quantity${rk < nEq ? ' (some of the givens repeat each other, e.g. e and n)' : ''}.`, vals: NAN_VALS(), basis, steps: [], given: known, misfit }
  }
  if (misfit > 0.005) {
    return { status: 'inconsistent', msg: `The givens contradict each other (best fit still misses one by ${nf(misfit * 100, 2)} %). Remove one.`, vals, basis, steps: [], given: known, misfit }
  }
  const steps = propagate(known, basis, vals, gw)
  return { status: 'ok', vals, basis, steps, given: known, misfit }
}

function propagate(known: Known, basis: PhaseSolution['basis'], solved: Record<PhaseKey, number>, gw: number): PhaseStep[] {
  const v: V = { ...known }
  const steps: PhaseStep[] = (Object.keys(known) as PhaseKey[]).map((k) => ({ key: k, value: known[k]!, kind: 'given', tex: `${T[k]} = ${PERCENT_KEYS.includes(k) ? `${nf(known[k]! * 100)}\\%` : nf(known[k]!)}`, note: 'given' }))
  if (basis) {
    v[basis.key] = basis.value
    steps.push({ key: basis.key, value: basis.value, kind: 'basis', tex: `\\text{assume } ${T[basis.key]} = 1`, note: basis.key === 'V' ? 'no size given and a unit weight/porosity is known: take unit total volume' : 'no size given: take unit volume of solids' })
  }
  const blocks: PhaseKey[] = ['V', 'Vs', 'Vv', 'Vw', 'Va', 'W', 'Ws', 'Ww', 'Gs']
  const usable = (r: Rule) => v[r.out] === undefined && r.ins.every((k) => v[k] !== undefined) && (!r.ok || r.ok(v))
  for (let guard = 0; guard < 60 && blocks.some((k) => v[k] === undefined); guard++) {
    const r = RULES.find(usable) ?? CONVERSIONS.find(usable)
    if (r) {
      const val = r.f(v as Required<V>, gw)
      v[r.out] = val
      steps.push({ key: r.out, value: val, kind: r.kind, tex: r.tex(v as Required<V>, gw, val) })
      continue
    }
    // stuck: two blocks are linked; solve one equation for the first missing block
    const k = (['Vs', 'Vv', 'Ws', 'Vw', 'Gs', 'V', 'W'] as PhaseKey[]).find((q) => v[q] === undefined)!
    const pending = (Object.keys(known) as PhaseKey[]).filter((q) => !['V', 'Vs', 'Vv', 'Vw', 'Va', 'W', 'Ws', 'Ww', 'Gs'].includes(q))
    v[k] = solved[k]
    steps.push({
      key: k,
      value: solved[k],
      kind: 'solve',
      tex: `\\text{let } ${T[k]} = x;\\ \\text{express the other blocks in } x \\text{ and impose } ${pending.map((q) => T[q]).join(',\\ ') || '\\text{the givens}'} \\Rightarrow ${T[k]} = ${n4(solved[k])}`,
      note: 'two unknown blocks are linked: one equation in one unknown',
    })
  }
  // read the answers off the diagram
  const full = { ...solved, ...v } as Required<V>
  for (const k of RESULT_ORDER) {
    if (known[k] !== undefined || steps.some((s) => s.key === k)) continue
    steps.push({ key: k, value: solved[k], kind: 'result', tex: RESULT_TEX[k]({ ...full, [k]: solved[k] } as Required<V>, gw) })
  }
  return steps
}

// ---------------------------------------------------------------- the formula route (check)
export interface RouteLine {
  label: string
  tex: string
  value: number
  key: PhaseKey
}
/** Se = wGs and the γ formulas from e, as a check on the block-diagram answers */
export function formulaRoute(v: Record<PhaseKey, number>, gw: number): RouteLine[] {
  const { e, S, w, Gs } = v
  const Se = S * e
  return [
    { key: 'S', label: 'Se = wGs', tex: `S = \\dfrac{wG_s}{e} = \\dfrac{${n4(w)}\\times ${n4(Gs)}}{${n4(e)}} = ${nf((w * Gs) / e)}`, value: (w * Gs) / e },
    { key: 'n', label: 'n = e/(1+e)', tex: `n = \\dfrac{e}{1+e} = \\dfrac{${n4(e)}}{${n4(1 + e)}} = ${nf(e / (1 + e))}`, value: e / (1 + e) },
    { key: 'g', label: 'γ = (Gs+Se)γw/(1+e)', tex: `\\gamma = \\dfrac{(G_s+Se)\\gamma_w}{1+e} = \\dfrac{(${n4(Gs)}+${n4(Se)})\\times ${n4(gw)}}{${n4(1 + e)}} = ${n4(((Gs + Se) * gw) / (1 + e))}`, value: ((Gs + Se) * gw) / (1 + e) },
    { key: 'gd', label: 'γd = Gsγw/(1+e)', tex: `\\gamma_d = \\dfrac{G_s\\gamma_w}{1+e} = \\dfrac{${n4(Gs)}\\times ${n4(gw)}}{${n4(1 + e)}} = ${n4((Gs * gw) / (1 + e))}`, value: (Gs * gw) / (1 + e) },
    { key: 'gsat', label: 'γsat = (Gs+e)γw/(1+e)', tex: `\\gamma_{sat} = \\dfrac{(G_s+e)\\gamma_w}{1+e} = ${n4(((Gs + e) * gw) / (1 + e))}`, value: ((Gs + e) * gw) / (1 + e) },
    { key: 'gsub', label: "γ′ = (Gs−1)γw/(1+e)", tex: `\\gamma' = \\dfrac{(G_s-1)\\gamma_w}{1+e} = ${n4(((Gs - 1) * gw) / (1 + e))}`, value: ((Gs - 1) * gw) / (1 + e) },
  ]
}

/** 2008-09 Q5(b): Sr = w / [(ρw/ρ)(1 + w) − 1/Gs] */
export const srFromRho = (w: number, rho: number, rhoW: number, Gs: number) => w / ((rhoW / rho) * (1 + w) - 1 / Gs)
/** 2021-22 Q1(a): γd = Gsγw/(1 + wGs/S) */
export const gdFromSwG = (S: number, w: number, Gs: number, gw: number) => (Gs * gw) / (1 + (w * Gs) / S)
/** e from a dry unit weight: e = Gsγw/γd − 1 */
export const eFromGd = (gd: number, Gs: number, gw: number) => (Gs * gw) / gd - 1
export const gdFromE = (e: number, Gs: number, gw: number) => (Gs * gw) / (1 + e)
export const eFromN = (n: number) => n / (1 - n)
export const nFromE = (e: number) => e / (1 + e)

// ---------------------------------------------------------------- relative density
export const drFromE = (e: number, emax: number, emin: number) => (emax - e) / (emax - emin)
/** Dr = [(γd − γd,min)/(γd,max − γd,min)]·(γd,max/γd) */
export const drFromGd = (gd: number, gdMin: number, gdMax: number) => ((gd - gdMin) / (gdMax - gdMin)) * (gdMax / gd)

export interface DrClass {
  lo: number
  hi: number
  label: string
}
/** Das Table 3.3 as printed on AJK sir's slide 28 (red rule under Medium: "Good for EQ" below it) */
export const DR_SLIDE: DrClass[] = [
  { lo: 0, hi: 15, label: 'Very loose' },
  { lo: 15, hi: 50, label: 'Loose' },
  { lo: 50, hi: 70, label: 'Medium' },
  { lo: 70, hi: 85, label: 'Dense' },
  { lo: 85, hi: 100, label: 'Very dense' },
]
/** the other common scale (Lambe & Whitman / Das's later editions / QBank): 15–35–65–85 */
export const DR_LAMBE: DrClass[] = [
  { lo: 0, hi: 15, label: 'Very loose' },
  { lo: 15, hi: 35, label: 'Loose' },
  { lo: 35, hi: 65, label: 'Medium' },
  { lo: 65, hi: 85, label: 'Dense' },
  { lo: 85, hi: 100, label: 'Very dense' },
]
/** class of a relative density in % */
export function drClass(Dr: number, scale: DrClass[] = DR_SLIDE): string {
  if (!Number.isFinite(Dr)) return '—'
  if (Dr < 0) return 'Looser than the loosest lab state (Dr < 0)'
  if (Dr > 100) return 'Denser than the densest lab state (Dr > 100)'
  return (scale.find((c) => Dr < c.hi) ?? scale[scale.length - 1]).label
}
export const drIndex = (Dr: number, scale: DrClass[] = DR_SLIDE) => Math.max(0, scale.findIndex((c) => Dr < c.hi) < 0 ? scale.length - 1 : scale.findIndex((c) => Dr < c.hi))

export interface DrResult {
  emax: number
  emin: number
  e: number
  Dr: number
  /** Dr in % */
  pct: number
  cls: string
  clsLambe: string
}
/** relative density from any of: e directly, n, or γd; limits as e or as γd */
export function relDensity(p: { e?: number; n?: number; gd?: number; emax?: number; emin?: number; gdMin?: number; gdMax?: number; Gs?: number; gw?: number }): DrResult {
  const gw = p.gw ?? GW
  const G = p.Gs ?? NaN
  const emax = p.emax ?? eFromGd(p.gdMin ?? NaN, G, gw)
  const emin = p.emin ?? eFromGd(p.gdMax ?? NaN, G, gw)
  const e = p.e ?? (p.n !== undefined ? eFromN(p.n) : eFromGd(p.gd ?? NaN, G, gw))
  let Dr = drFromE(e, emax, emin)
  if (!Number.isFinite(Dr) && p.gd !== undefined && p.gdMin !== undefined && p.gdMax !== undefined) Dr = drFromGd(p.gd, p.gdMin, p.gdMax)
  return { emax, emin, e, Dr, pct: Dr * 100, cls: drClass(Dr * 100), clsLambe: drClass(Dr * 100, DR_LAMBE) }
}

// ---------------------------------------------------------------- sand cone (ASTM D1556, slide 26 symbols)
export interface SandCone {
  /** jar + cone + sand before */
  W1: number
  /** jar + cone + sand left */
  W4: number
  /** sand to fill the cone only */
  Wc: number
  /** dry unit weight (or density) of the Ottawa sand */
  gdSand: number
  /** moist soil from the hole */
  W2: number
  /** its water content (fraction) */
  w: number
  /** optional lab maximum for relative compaction */
  gdMax?: number
}
export function sandCone(p: SandCone) {
  const W5 = p.W1 - p.W4
  const V = (W5 - p.Wc) / p.gdSand
  const W3 = p.W2 / (1 + p.w)
  const gd = W3 / V
  const g = p.W2 / V
  return { W5, V, W3, gd, g, RC: p.gdMax ? gd / p.gdMax : NaN }
}

// ---------------------------------------------------------------- water bookkeeping (2011-12 Q7(b) type)
/** water to add (volume) to raise w from w1 to w2 for solids Ws */
export const waterToRaise = (Ws: number, w1: number, w2: number, gw: number) => (Ws * (w2 - w1)) / gw
/** water volume needed to saturate a total volume V at void ratio e (currently at S) */
export const waterToSaturate = (V: number, e: number, S = 0) => ((V * e) / (1 + e)) * (1 - S)
