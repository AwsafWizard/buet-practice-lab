// Wall-builder state, conversion to the engine's Wall, presets and the seeded exam-style generator.
import { pick, randInt, rng } from '../../../labs/common'
import { k0By, solveWall, type K0Formula, type Wall, type WallState } from '../../engine/earth'

export interface LabLayer {
  h: number
  gamma: number
  gammaSat: number
  phi: number
  c: number
  /** φ = 0 total-stress analysis (no separate water) */
  total: boolean
  k0f: K0Formula
  OCR: number
  PI: number
  gd: number
  gdMin: number
}
export interface LabWall {
  state: WallState
  layers: LabLayer[]
  wt: boolean
  zw: number
  q: number
  front: boolean
  D: number
  fGamma: number
  fPhi: number
  fC: number
}

export const layer = (o: Partial<LabLayer> & { h: number; gamma: number; phi: number }): LabLayer => ({ gammaSat: o.gamma, c: 0, total: false, k0f: 'jaky', OCR: 1, PI: 20, gd: 16, gdMin: 15, ...o })

export function toWall(p: LabWall): Wall {
  return {
    state: p.state,
    layers: p.layers.map((l) => ({
      h: l.h,
      gamma: l.gamma,
      gammaSat: l.gammaSat,
      phi: l.phi,
      c: l.c,
      total: l.phi === 0 && l.total,
      K0: k0By(l.k0f, { phi: l.phi, OCR: l.OCR, PI: l.PI, gd: l.gd, gdMin: l.gdMin }),
    })),
    zw: p.wt ? p.zw : null,
    q: p.q,
    front: p.front && p.state === 'active' ? { D: p.D, gamma: p.fGamma, phi: p.fPhi, c: p.fC } : null,
  }
}

const base = (o: Partial<LabWall> & { layers: LabLayer[] }): LabWall => ({ state: 'active', wt: false, zw: 2, q: 0, front: false, D: 2, fGamma: 16, fPhi: 30, fC: 0, ...o })

export const PRESETS: { key: string; label: string; w: LabWall }[] = [
  { key: 'p1', label: 'Lecture #01 dry sand', w: base({ layers: [layer({ h: 5, gamma: 16, phi: 30 })] }) },
  { key: 'p2', label: 'Lecture #02 WT at 2 m', w: base({ layers: [layer({ h: 5, gamma: 16, phi: 30 })], wt: true, zw: 2 }) },
  { key: 'p3', label: 'Lecture #03 + q = 10', w: base({ layers: [layer({ h: 5, gamma: 16, phi: 30 })], wt: true, zw: 2, q: 10 }) },
  { key: 'pp', label: 'Lecture passive side', w: base({ layers: [layer({ h: 5, gamma: 16, phi: 30 })], wt: true, zw: 2, q: 10, front: true, D: 2, fGamma: 16, fPhi: 30 }) },
  { key: 'ex135', label: 'Das Ex 13.5 (φ = 0)', w: base({ layers: [layer({ h: 6, gamma: 16.5, phi: 0, c: 10 })] }) },
  { key: 'h3', label: 'Handnote P3 (γsat ≠ γ)', w: base({ layers: [layer({ h: 6, gamma: 17, gammaSat: 19.5, phi: 30 })], wt: true, zw: 2.5 }) },
  { key: 'h4', label: 'Handnote P4 (two layers + q)', w: base({ layers: [layer({ h: 3, gamma: 16, phi: 30 }), layer({ h: 3, gamma: 18, phi: 36 })], q: 20 }) },
  { key: 'h5', label: 'Handnote P5 (c′–φ′ crack)', w: base({ layers: [layer({ h: 6, gamma: 18, phi: 20, c: 12 })] }) },
  { key: 'h6', label: 'Handnote P6 (φ = 0 + q)', w: base({ layers: [layer({ h: 7, gamma: 18, phi: 0, c: 15 })], q: 10 }) },
  { key: 'h7', label: 'Handnote P7 (full check)', w: base({ layers: [layer({ h: 6, gamma: 17, gammaSat: 19, phi: 32 })], wt: true, zw: 2, q: 12, front: true, D: 1.5, fGamma: 17, fPhi: 32 }) },
  { key: '2324', label: '2023-24 Q2(a)', w: base({ layers: [layer({ h: 6, gamma: 16, gammaSat: 18, phi: 35, c: 10 })], wt: true, zw: 2, q: 20 }) },
  { key: '2021', label: '2020-21 Q8(c)', w: base({ layers: [layer({ h: 3, gamma: 17, phi: 30 }), layer({ h: 5, gamma: 20, phi: 28, c: 10 })], wt: true, zw: 3 }) },
  { key: 'j21', label: 'Jan 2021 Q8(c) passive', w: base({ state: 'passive', layers: [layer({ h: 2, gamma: 16, phi: 30 }), layer({ h: 4, gamma: 20, phi: 27, c: 25 })], wt: true, zw: 2 }) },
  { key: '1213', label: '2012-13 Q7 basement (K0)', w: base({ state: 'rest', layers: [layer({ h: 2.5, gamma: 18.5, phi: 33, k0f: 'mayne', OCR: 1 }), layer({ h: 3, gamma: 19.5, phi: 38, k0f: 'mayne', OCR: 2 })], wt: true, zw: 2.5 }) },
  { key: '2122', label: '2021-22 Q8(c) φ = 0 total', w: base({ layers: [layer({ h: 5, gamma: 21, phi: 0, c: 17, total: true })], q: 11 }) },
]

export type LepFamily = 'sand' | 'cphi' | 'clay' | 'layers' | 'passive' | 'rest'
export const LEP_FAMILIES: { v: LepFamily; label: string }[] = [
  { v: 'sand', label: 'Sand + WT + q' },
  { v: 'cphi', label: 'c′–φ′ fill, crack' },
  { v: 'clay', label: 'Undrained clay φ = 0' },
  { v: 'layers', label: 'Two layers (active)' },
  { v: 'passive', label: 'Passive' },
  { v: 'rest', label: 'At rest (basement)' },
]

/** seeded exam-style wall: the families the papers use */
export function randomWall(seed: number, fam?: LepFamily, level: 'basic' | 'exam' | 'tough' = 'exam'): { w: LabWall; story: string; family: LepFamily } {
  const r = rng(seed)
  const f = fam ?? pick(r, ['sand', 'sand', 'cphi', 'clay', 'layers', 'layers', 'passive', 'rest'] as LepFamily[])
  const half = (lo: number, hi: number) => randInt(r, lo * 2, hi * 2) / 2
  if (f === 'sand') {
    const H = randInt(r, 5, 8)
    const phi = randInt(r, 28, 36)
    const g = randInt(r, 16, 18)
    const gs = g + randInt(r, 1, 3)
    const wt = level !== 'basic'
    const zw = half(1.5, 3)
    const q = level === 'basic' ? 0 : pick(r, [0, 10, 15, 20])
    const front = level === 'tough' || (level === 'exam' && r() < 0.35)
    const D = half(1, 2)
    const w0 = base({ layers: [layer({ h: H, gamma: g, gammaSat: gs, phi })], wt, zw, q, front, D, fGamma: g, fPhi: phi })
    // the paper's walls always have a net push: drop the front soil if it would out-resist the fill
    const w = front && solveWall(toWall(w0)).Fs < 0.3 * solveWall(toWall({ ...w0, front: false })).Fs ? { ...w0, front: false } : w0
    const front2 = w.front
    return {
      w,
      family: f,
      story: `A ${H} m smooth vertical wall retains sand (c′ = 0, φ′ = ${phi}°) with γ = ${g} kN/m³${wt ? ` above the water table and γsat = ${gs} kN/m³ below it; the WT is ${zw} m below the top` : ' (dry)'}.${q ? ` A surcharge of ${q} kN/m² acts on the backfill.` : ''}${front2 ? ` ${D} m of the same sand (dry) lies in front of the wall.` : ''} Draw the pressure diagrams and find the ${front2 ? 'net ' : ''}sliding force, the overturning moment about the base and the location of the resultant.`,
    }
  }
  if (f === 'cphi') {
    const H = 6
    const phi = randInt(r, 25, 35)
    const c = randInt(r, 5, 15)
    const g = randInt(r, 16, 18),
      gs = g + 2
    const zw = level === 'basic' ? 6 : 2
    const q = level === 'basic' ? 0 : randInt(r, 10, 20, 5)
    const w = base({ layers: [layer({ h: H, gamma: g, gammaSat: gs, phi, c })], wt: level !== 'basic', zw, q })
    return {
      w,
      family: f,
      story: `A retaining wall is ${H} m high.${level !== 'basic' ? ` The water table is ${zw} m below the top of the fill; the fill weighs ${g} kN/m³ above and ${gs} kN/m³ below it.` : ` The fill weighs ${g} kN/m³ (dry).`} φ′ = ${phi}°, c′ = ${c} kN/m².${q ? ` Surcharge ${q} kN/m².` : ''} Draw the active earth pressure and hydrostatic diagrams, find the tension crack depth, the sliding force and the overturning moment about the base (after cracking).`,
    }
  }
  if (f === 'clay') {
    const H = randInt(r, 5, 10)
    const cu = randInt(r, 15, 35)
    const g = half(16, 21)
    const q = level === 'basic' ? 0 : pick(r, [0, 10, 11, 15])
    const w = base({ layers: [layer({ h: H, gamma: g, phi: 0, c: cu, total: true })], q })
    return {
      w,
      family: f,
      story: `A ${H} m smooth vertical wall retains saturated soft clay, γ = ${g} kN/m³, cu = ${cu} kN/m² (undrained, φ = 0, total stress).${q ? ` Surcharge ${q} kN/m².` : ''} Find the tension crack depth, the unsupported height of a cut, and the active force and its location before and after the crack.`,
    }
  }
  if (f === 'layers') {
    const h1 = pick(r, [2, 3, 3, 4]),
      h2 = randInt(r, 3, 5)
    const p1 = randInt(r, 28, 34),
      p2 = randInt(r, 24, 30)
    const g1 = randInt(r, 16, 18),
      g2 = randInt(r, 19, 20)
    const c2 = level === 'basic' ? 0 : pick(r, [0, 10, 15])
    const q = level === 'tough' ? pick(r, [20, 30]) : 0
    const w = base({ layers: [layer({ h: h1, gamma: g1, phi: p1 }), layer({ h: h2, gamma: g2, gammaSat: g2, phi: p2, c: c2 })], wt: level !== 'basic', zw: h1, q })
    return {
      w,
      family: f,
      story: `A ${h1 + h2} m wall: top ${h1} m sand (γ = ${g1} kN/m³, c′ = 0, φ′ = ${p1}°)${level !== 'basic' ? ', water table at the interface,' : ''} over ${h2} m of ${c2 ? `c′–φ′ soil (γsat = ${g2} kN/m³, c′ = ${c2} kN/m², φ′ = ${p2}°)` : `sand (γ${level !== 'basic' ? 'sat' : ''} = ${g2} kN/m³, φ′ = ${p2}°)`}.${q ? ` Surcharge ${q} kN/m².` : ''} Draw Rankine's active pressure diagram (both sides of the interface) and find the total active force and its location.`,
    }
  }
  if (f === 'passive') {
    const h1 = pick(r, [2, 3]),
      h2 = pick(r, [3, 4])
    const p1 = 30,
      p2 = randInt(r, 24, 28)
    const g1 = randInt(r, 16, 17),
      g2 = 20
    const c2 = randInt(r, 10, 25, 5)
    const q = level === 'basic' ? 0 : pick(r, [0, 10, 20])
    const w = base({ state: 'passive', layers: [layer({ h: h1, gamma: g1, phi: p1 }), layer({ h: h2, gamma: g2, phi: p2, c: c2 })], wt: true, zw: h1, q })
    return {
      w,
      family: f,
      story: `Rankine passive state on a ${h1 + h2} m wall: top ${h1} m γ = ${g1} kN/m³, c′ = 0, φ′ = ${p1}°; WT at ${h1} m; lower ${h2} m γsat = ${g2} kN/m³, c′ = ${c2} kN/m², φ′ = ${p2}°.${q ? ` Surcharge ${q} kN/m².` : ''} Find the total passive force per metre and its location.`,
    }
  }
  const h1 = pick(r, [2, 2.5]),
    h2 = pick(r, [3, 4])
  const p1 = randInt(r, 30, 34),
    p2 = randInt(r, 34, 38)
  const g1 = pick(r, [16.5, 18, 18.5]),
    g2 = pick(r, [18.5, 19.5])
  const ocr2 = pick(r, [1.5, 2, 3])
  const w = base({ state: 'rest', layers: [layer({ h: h1, gamma: g1, phi: p1, k0f: 'mayne', OCR: 1 }), layer({ h: h2, gamma: g2, phi: p2, k0f: 'mayne', OCR: ocr2 })], wt: true, zw: h1 })
  return {
    w,
    family: 'rest',
    story: `A basement wall (cannot move): soil 1, ${h1} m, γ = ${g1} kN/m³, φ′ = ${p1}°, OCR = 1; water table at the interface; soil 2, ${h2} m, γsat = ${g2} kN/m³, φ′ = ${p2}°, OCR = ${ocr2}. Use K0 = (1 − sin φ′)OCR^(sin φ′). Draw the lateral pressure diagram and find the total thrust and its location.`,
  }
}
