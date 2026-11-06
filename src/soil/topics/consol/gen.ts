// Consolidation: lab presets (handnote / paper profiles) and the seeded exam-style generators.
import { fmt } from '../../../components/DiagramView'
import { pick, randInt, rng } from '../../../labs/common'
import { ccSkempton, csFromCc, e0FromWGs, gammaSatFromGsE, labCurve, type CLayer, type LoadIn, type OedPt, type SettleIn } from '../../engine/consolidation'
import { GW } from '../../engine/units'

const r2 = (v: number) => Math.round(v * 100) / 100
const r3 = (v: number) => Math.round(v * 1000) / 1000

export interface Preset {
  key: string
  label: string
  inp: SettleIn
  note?: string
}

const clayWG = (H: number, w: number, Gs: number, LL: number, extra: Partial<CLayer> = {}): CLayer => {
  const e0 = e0FromWGs(w, Gs)
  const g = gammaSatFromGsE(Gs, e0)
  const Cc = ccSkempton(LL)
  return { kind: 'clay', H, gamma: g, gammaSat: g, e0, Cc, Cs: csFromCc(Cc), ...extra }
}

export const SETTLE_PRESETS: Preset[] = [
  {
    key: '2324',
    label: '2023-24 Q5(c): 2 × 3 m footing on NC clay (2:1, Simpson)',
    inp: {
      layers: [{ kind: 'sand', H: 8, gamma: 17, gammaSat: 10.5 + GW }, clayWG(6, 0.4, 2.7, 45)],
      wt: 4,
      load: { kind: 'footing', shape: 'rect', B: 2, L: 3, Q: 250, Df: 8, method: '21' },
      avg: 'simpson',
    },
    note: 'Handnote: p0′ = 134.1 kPa, Δp (Simpson) = 13.1 kPa, S ≈ 37 mm (24 mm with mid-depth Δp only).',
  },
  {
    key: '2122',
    label: '2021-22 Q3(a): two NC clays under a 5 m wide fill',
    inp: {
      layers: [{ kind: 'sand', H: 2, gamma: 19, gammaSat: 19 }, clayWG(3, 0.34, 2.75, 0, { Cc: 0.35, Cs: 0.35 / 6 }), { kind: 'sand', H: 2, gamma: 20, gammaSat: 20 }, clayWG(3, 0.34, 2.75, 0, { Cc: 0.35, Cs: 0.35 / 6 })],
      wt: 0,
      load: { kind: 'fill', q: 100 },
    },
    note: 'Handnote: 0.336 + 0.193 ≈ 0.53 m.',
  },
  {
    key: '2021',
    label: '2020-21 Q3(a): OC clay crossing pc′ (4 m fill)',
    inp: {
      layers: [
        { kind: 'sand', H: 3, gamma: 16, gammaSat: 16 },
        { kind: 'sand', H: 3, gamma: 18.5, gammaSat: 18.5 },
        { kind: 'clay', H: 6, gamma: 19, gammaSat: 19, e0: 0.95, Cc: ccSkempton(50), Cs: csFromCc(ccSkempton(50)), pc: 150, cv: 3 },
      ],
      wt: 3,
      load: { kind: 'fill', q: 72 },
      baseDrains: true,
    },
    note: 'Cs not given: Cc/6 = 0.06 (handnote) → ≈ 0.10 m; Cc/10 → 89 mm.',
  },
  {
    key: 'jan21',
    label: 'Jan 2021 Q3(b): 2 m circle on OC clay (2:1)',
    inp: {
      layers: [{ kind: 'sand', H: 2, gamma: 17, gammaSat: 19 }, { kind: 'clay', H: 2, gamma: 18, gammaSat: 18, e0: 0.8, Cc: 0.233, Cs: 0.022, pc: 126 }],
      wt: 1.5,
      load: { kind: 'footing', shape: 'circle', B: 2, L: 2, Q: 500, Df: 1, method: '21' },
    },
    note: 'pc′ from the two-line intersection of the printed data (Casagrande ≈ 110–150 depending on the plot): p0′ + Δp = 78 kPa stays below it → recompression only, ≈ 7.5 mm.',
  },
  {
    key: 'twoclay',
    label: '2015-16 Q10(b) style: OC clay over NC clay, 2 m fill (thicknesses assumed)',
    inp: {
      layers: [
        { kind: 'sand', H: 2, gamma: 16, gammaSat: 19 },
        { kind: 'clay', H: 3, gamma: 20.6, gammaSat: gammaSatFromGsE(2.7, 0.54), e0: 0.54, Cc: 0.55, Cs: 0.06, pc: 50, cv: 13 },
        { kind: 'clay', H: 4, gamma: 19.2, gammaSat: gammaSatFromGsE(2.7, 0.783), e0: 0.783, Cc: 0.6, Cs: 0.1, cv: 2.5 },
      ],
      wt: 2,
      load: { kind: 'fill', q: 40 },
      baseDrains: true,
    },
    note: 'Fig. 2 is missing from the scan: thicknesses (2 m sand, 3 m OC, 4 m NC, sand below) are assumed here. Each layer keeps its own cv and drainage.',
  },
]

// ---------------------------------------------------------------- 🎲 random profiles

export type ConsolFamily = 'fill' | 'footing' | 'table' | 'rate' | 'drain'
export const CONSOL_FAMILIES: { v: ConsolFamily; label: string }[] = [
  { v: 'fill', label: 'Wide fill, NC / OC' },
  { v: 'footing', label: 'Footing on clay' },
  { v: 'table', label: 'e–p table + t90' },
  { v: 'rate', label: 'Time rate' },
  { v: 'drain', label: 'Sand drains' },
]

export function randomProfile(seed: number, kind?: 'fill' | 'footing', level: 'basic' | 'exam' | 'tough' = 'exam'): { inp: SettleIn; story: string } {
  const r = rng(seed * 9973 + 17)
  const k = kind ?? pick(r, ['fill', 'footing'] as const)
  const sandH = randInt(r, 2, 6)
  const wt = Math.min(sandH, randInt(r, 0, 3, 0.5))
  const gs = randInt(r, 160, 180) / 10
  const gsat = r2(gs + randInt(r, 15, 30) / 10)
  const w = randInt(r, 25, 50) / 100
  const Gs = pick(r, [2.65, 2.68, 2.7, 2.72, 2.75])
  const LL = randInt(r, 35, 70)
  const e0 = r3(w * Gs)
  const gc = r2(gammaSatFromGsE(Gs, e0))
  const Cc = r3(ccSkempton(LL))
  const H = randInt(r, 2, level === 'basic' ? 4 : 8)
  const oc = level !== 'basic' && r() < 0.55
  const div = pick(r, [5, 6, 10])
  const Cs = r3(Cc / div)
  const cv = randInt(r, 10, 60) / 10
  const layers: CLayer[] = [
    { kind: 'sand', H: sandH, gamma: gs, gammaSat: gsat },
    { kind: 'clay', H, gamma: gc, gammaSat: gc, e0, Cc, Cs, cv },
  ]
  const two = level === 'tough' && r() < 0.6
  if (two) layers.push({ kind: 'sand', H: randInt(r, 1, 3), gamma: gs, gammaSat: gsat }, { kind: 'clay', H: randInt(r, 2, 5), gamma: gc, gammaSat: gc, e0, Cc, Cs, cv })
  const load: LoadIn =
    k === 'fill'
      ? { kind: 'fill', q: randInt(r, 2, 6) * pick(r, [18, 19, 20]) }
      : pick(r, [
          { kind: 'footing' as const, shape: 'rect' as const, B: randInt(r, 2, 4), L: randInt(r, 2, 6), Q: randInt(r, 4, 20) * 100, Df: Math.min(sandH, randInt(r, 1, 3) / 2 + 0.5), method: pick(r, ['21', 'elastic'] as const) },
          { kind: 'footing' as const, shape: 'circle' as const, B: randInt(r, 2, 6), L: 0, Q: randInt(r, 5, 30) * 100, Df: Math.min(sandH, randInt(r, 1, 3) / 2 + 0.5), method: pick(r, ['21', 'elastic'] as const) },
        ])
  const inp: SettleIn = { layers, wt, load, avg: k === 'footing' && level !== 'basic' ? 'simpson' : 'mid', baseDrains: r() < 0.5 }
  if (oc) {
    // pc′ so that the path stays below or crosses it, both possible
    const zMid = sandH + H / 2
    const p0 = wt >= sandH ? gs * sandH + (gc - GW) * (H / 2) : gs * wt + (gsat - GW) * (sandH - wt) + (gc - GW) * (H / 2)
    layers[1].pc = Math.round(p0 * (1.3 + r() * 1.7))
    void zMid
  }
  const loadTxt =
    load.kind === 'fill'
      ? `A wide fill is placed on the ground, adding Δp = ${fmt(load.q, 1)} kPa at every depth.`
      : `A ${load.shape === 'circle' ? `${fmt(load.B, 2)} m diameter circular` : `${fmt(load.B, 2)} m × ${fmt(load.L, 2)} m`} footing carrying ${fmt(load.Q, 0)} kN rests ${fmt(load.Df, 2)} m below the ground. Use ${load.method === '21' ? 'the 2:1 method' : 'Boussinesq (below the centre)'}${inp.avg === 'simpson' ? " with Simpson's average over the clay" : ' at the mid-depth of the clay'}.`
  const story = `Sand (γ = ${gs}, γsat = ${gsat} kN/m³) extends to ${sandH} m, WT at ${fmt(wt, 1)} m. Below lies ${H} m of saturated clay: w = ${fmt(w * 100, 0)} %, Gs = ${Gs}, LL = ${LL}${oc ? `, pc′ = ${layers[1].pc} kPa, Cs = Cc/${div}` : ' (normally consolidated)'}${two ? `, then ${layers[2].H} m of the same sand and ${layers[3].H} m of the same clay${oc ? ' (NC)' : ''}` : ''}. ${loadTxt} Find the primary consolidation settlement.`
  return { inp, story }
}

// ---------------------------------------------------------------- 🎲 oedometer data

export const JAN21_OED: OedPt[] = (
  [
    [5, 0.755, 'load'],
    [25, 0.74, 'load'],
    [50, 0.734, 'load'],
    [100, 0.717, 'load'],
    [200, 0.67, 'load'],
    [100, 0.675, 'unload'],
    [50, 0.68, 'unload'],
    [25, 0.69, 'unload'],
    [100, 0.678, 'reload'],
    [200, 0.664, 'reload'],
    [400, 0.609, 'reload'],
    [800, 0.539, 'reload'],
  ] as [number, number, OedPt['stage']][]
).map(([p, e, stage]) => ({ p, e, stage }))

export const TABLE_1718: OedPt[] = [50, 100, 200, 300, 400].map((p, i) => ({ p, e: [0.73, 0.68, 0.625, 0.58, 0.54][i], stage: 'load' as const }))

export function randomOed(seed: number) {
  const r = rng(seed * 31 + 7)
  const pc = pick(r, [60, 80, 100, 120, 150, 200, 250])
  const Cc = randInt(r, 18, 45) / 100
  const Cr = r3(Cc / randInt(r, 6, 10))
  const ec = randInt(r, 70, 110) / 100
  const f = labCurve({ pc, ec, Cc, Cr, w: 0.1 + r() * 0.08 })
  const loads = [12.5, 25, 50, 100, 200, 400, 800, 1600]
  const peakI = randInt(r, 4, 5)
  const pts: OedPt[] = []
  loads.slice(0, peakI + 1).forEach((p) => pts.push({ p, e: r3(f(p)), stage: 'load' }))
  const peak = loads[peakI]
  const ePeak = f(peak)
  const Cs = r3(Cr * (0.8 + 0.4 * r()))
  for (const p of [peak / 4, peak / 16]) pts.push({ p, e: r3(ePeak + Cs * Math.log10(peak / p)), stage: 'unload' })
  for (const p of [peak / 4, peak]) pts.push({ p, e: r3(ePeak + Cs * Math.log10(peak / p) * (p === peak ? 0.15 : 0.6)), stage: 'reload' })
  loads.slice(peakI + 1).forEach((p) => pts.push({ p, e: r3(f(p)), stage: 'reload' }))
  const z = randInt(r, 3, 10)
  return { pts, truth: { pc, Cc, Cr, Cs }, e0: r3(f(pc / (1.5 + r() * 2)) + 0.02), p0: Math.round(pc / (1 + r() * 2.5)), z }
}
