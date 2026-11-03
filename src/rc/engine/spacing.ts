// CE 315 slab bar-spacing checks for the spacing simulators (one-way and two-way labs).
// Same rules as the slab engines: s = Ab·12/As rounded DOWN to ½ in, s ≤ 3h & 18 in (one-way main),
// 5h & 18 in (T&S), 2h & 18 in (two-way); column strips 1.5 × middle-strip spacing, ≥ As,min, ≤ 2h.

import { autoBar, extraTop, floorHalf } from './oneway'
import { BARS } from './materials'

const E = 1e-6

export type SpRole = 'oneway' | 'ts' | 'twoway'
export const SMAX_MULT: Record<SpRole, number> = { oneway: 3, ts: 5, twoway: 2 }
export const smaxOf = (role: SpRole, h: number) => Math.min(SMAX_MULT[role] * h, 18)
/** below ≈ 4.5 in the class goes up a bar size (bars too crowded to place and vibrate) */
export const S_PRACTICAL = 4.5
/** As provided per ft of slab, in²/ft */
export const asPerFt = (bar: number, s: number) => (BARS[bar].A * 12) / s

export interface SpCheck {
  key: string
  label: string
  ok: boolean
  /** a soft rule: failing it is a warning, not a wrong answer */
  soft?: boolean
  detail: string
}
export type Verdict = 'fail' | 'ok' | 'best'

const f2 = (v: number) => (Math.round(v * 100) / 100).toString()
const f3 = (v: number) => (Math.round(v * 1000) / 1000).toString()
const isHalf = (s: number) => Math.abs(s * 2 - Math.round(s * 2)) < E

function common(bar: number, s: number) {
  const db = BARS[bar].d
  const clear = s - db
  const clrMin = Math.max(1, db)
  return {
    db,
    clear,
    checks: [
      { key: 'half', label: 'Whole ½ in', ok: isHalf(s), soft: true, detail: isHalf(s) ? `${s} in` : `${s} in is not a ½-in step — round down` },
      { key: 'prac', label: 'Practical (≥ 4.5 in)', ok: s >= S_PRACTICAL - E, soft: true, detail: s >= S_PRACTICAL - E ? `${s} ≥ 4.5 in` : `${s} in is crowded — the class goes up a bar size` },
      { key: 'clear', label: 'Clear spacing ≥ db, 1 in', ok: clear >= clrMin - E, detail: `${f2(clear)} in clear vs ${f2(clrMin)} in (ACI 25.2.1)` },
    ] as SpCheck[],
  }
}

export interface SpEval {
  bar: number
  s: number
  Ab: number
  /** As provided at s, in²/ft */
  prov: number
  /** steel the layout must give: max(As req, As,min) */
  need: number
  smax: number
  /** Ab·12/need */
  raw: number
  /** class pick for this bar: min(raw, smax) rounded down to ½ in */
  best: number
  /** class bar size for this steel (#3 unless s < 4.5 in) */
  classBar: number
  /** steel above need, as a fraction */
  over: number
  checks: SpCheck[]
  ok: boolean
  verdict: Verdict
}
/** a bar spacing that must give `need` in²/ft and stay within `smax` */
export function evalSpacing(p: { bar: number; s: number; need: number; smax: number; strengthLabel?: string }): SpEval {
  const { bar, s, need, smax } = p
  const Ab = BARS[bar].A
  const prov = asPerFt(bar, s)
  const raw = (Ab * 12) / need
  const best = floorHalf(Math.min(raw, smax))
  const c = common(bar, s)
  const checks: SpCheck[] = [
    { key: 'as', label: p.strengthLabel ?? 'As provided ≥ As needed', ok: prov >= need - E, detail: `${f3(prov)} vs ${f3(need)} in²/ft` },
    { key: 'smax', label: `s ≤ s_max`, ok: s <= smax + E, detail: `${s} vs ${f2(smax)} in` },
    ...c.checks,
  ]
  const ok = checks.every((x) => x.ok || x.soft)
  const verdict: Verdict = !ok ? 'fail' : Math.abs(s - best) < E ? 'best' : 'ok'
  return { bar, s, Ab, prov, need, smax, raw, best, classBar: autoBar(need), over: prov / need - 1, checks, ok, verdict }
}

export interface TopEval {
  /** bottom spacing; one cranked bar per 2s */
  s: number
  n: number
  /** top As provided: (1 + n)·Ab over 2s → per ft */
  prov: number
  need: number
  /** class count of extra bars (round up, a hair ≤ 0.1 bar rounds down) */
  classN: number
  nRaw: number
  over: number
  checks: SpCheck[]
  ok: boolean
  verdict: Verdict
}
/** top steel over a support from alternate cranked bars + n extra bars in each 2s */
export function evalTop(p: { bar: number; s: number; n: number; need: number }): TopEval {
  const { bar, s, n, need } = p
  const Ab = BARS[bar].A
  const ex = extraTop(need, s, bar)
  const prov = ((1 + n) * Ab * 12) / (2 * s)
  const short = prov < need - E
  const accepted = n >= ex.n
  const checks: SpCheck[] = [
    {
      key: 'as',
      label: 'Top As ≥ As needed',
      ok: accepted,
      detail: `${f3(prov)} vs ${f3(need)} in²/ft` + (short && accepted ? ` (short by ${f2(ex.nRaw - n)} bar ≤ 0.1 — class accepts)` : ''),
    },
  ]
  const ok = accepted
  return { s, n, prov, need, classN: ex.n, nRaw: ex.nRaw, over: prov / need - 1, checks, ok, verdict: !ok ? 'fail' : n === ex.n ? 'best' : 'ok' }
}

export interface ColEval {
  sMid: number
  s: number
  prov: number
  AsMin: number
  /** the three limits: 1.5 × middle strip, As,min spacing, 2h & 18 in */
  s15: number
  sMin: number
  smax: number
  best: number
  checks: SpCheck[]
  ok: boolean
  verdict: Verdict
}
/** two-way column strip: spacing ≤ 1.5 × middle-strip spacing, As ≥ As,min, s ≤ 2h and 18 in */
export function evalColumn(p: { bar: number; sMid: number; s: number; AsMin: number; h: number }): ColEval {
  const { bar, sMid, s, AsMin, h } = p
  const Ab = BARS[bar].A
  const prov = asPerFt(bar, s)
  const s15 = 1.5 * sMid
  const sMin = (Ab * 12) / AsMin
  const smax = smaxOf('twoway', h)
  const best = floorHalf(Math.min(s15, sMin, smax))
  const c = common(bar, s)
  const checks: SpCheck[] = [
    { key: 's15', label: 's ≤ 1.5 × middle strip', ok: s <= s15 + E, detail: `${s} vs 1.5 × ${sMid} = ${f2(s15)} in` },
    { key: 'min', label: 'As ≥ As,min', ok: prov >= AsMin - E, detail: `${f3(prov)} vs ${f3(AsMin)} in²/ft` },
    { key: 'smax', label: 's ≤ 2h, 18 in', ok: s <= smax + E, detail: `${s} vs ${f2(smax)} in` },
    ...c.checks.filter((x) => x.key !== 'prac'),
  ]
  const ok = checks.every((x) => x.ok || x.soft)
  return { sMid, s, prov, AsMin, s15, sMin, smax, best, checks, ok, verdict: !ok ? 'fail' : Math.abs(s - best) < E ? 'best' : 'ok' }
}

/** bar positions (in) across a width W for spacing s, starting s/2 in from the left edge (as drawn in the sketches) */
export function barPositions(W: number, s: number, start = s / 2) {
  const out: number[] = []
  for (let x = start; x <= W - 1e-9 && out.length < 400; x += s) out.push(x)
  return out
}
