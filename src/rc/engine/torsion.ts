// CE 315 torsion: theory + threshold check only (Jan 2026 slides, Torsion handnote). Torsion DESIGN is not taught.
// Units: section in in, f'c in psi, torques in ft-kip (in-lb ÷ 12 000), loads in lb/ft or psf as noted.

export type TorShape = 'rect' | 'L' | 'invL' | 'T' | 'invT' | 'box'

export const TOR_SHAPES: { v: TorShape; label: string }[] = [
  { v: 'rect', label: 'Rectangle' },
  { v: 'L', label: 'L (spandrel)' },
  { v: 'invL', label: 'Inverted L' },
  { v: 'T', label: 'T' },
  { v: 'invT', label: 'Inverted T' },
  { v: 'box', label: 'Box (hollow)' },
]

export interface TorSectionIn {
  shape: TorShape
  /** web width (box: outer width), in */
  bw: number
  /** total depth incl. the slab (box: outer depth), in */
  h: number
  /** slab / flange thickness (L, T shapes), in */
  hf?: number
  /** slab available beyond the web face on each flanged side, in (default: unlimited) */
  overhang?: number
  /** box wall thickness (side walls), in */
  tw?: number
  /** box top/bottom slab thickness, in (default tw) */
  tf?: number
}

export interface TorSection {
  shape: TorShape
  hollow: boolean
  /** flanged sides counted (0, 1 or 2) */
  sides: number
  /** projection of the beam above / below the slab, in */
  hw: number
  /** effective overhang per side = min(hw, 4hf, available), in */
  ohEff: number
  ohGov: 'hw' | '4hf' | 'slab' | '—'
  /** with the effective flanges */
  withFlange: { Acp: number; pcp: number; ratio: number }
  /** web only */
  web: { Acp: number; pcp: number; ratio: number }
  /** ACI 9.2.4.4: flanges are used only if they increase Acp²/pcp (handnote "side rule", beyond the slides) */
  useFlange: boolean
  Acp: number
  pcp: number
  /** gross concrete area (hollow: area of concrete only) */
  Ag: number
  /** Acp²/pcp (solid) or Ag²/pcp (hollow) used in Tth, in³ */
  ratio: number
}

export function torsionSection(s: TorSectionIn): TorSection {
  const { bw, h } = s
  if (s.shape === 'box') {
    const tw = s.tw ?? 5,
      tf = s.tf ?? tw
    const Acp = bw * h
    const pcp = 2 * (bw + h)
    const Ag = Acp - Math.max(0, bw - 2 * tw) * Math.max(0, h - 2 * tf)
    const r = { Acp, pcp, ratio: (Acp * Acp) / pcp }
    return { shape: s.shape, hollow: true, sides: 0, hw: 0, ohEff: 0, ohGov: '—', withFlange: r, web: r, useFlange: false, Acp, pcp, Ag, ratio: (Ag * Ag) / pcp }
  }
  const webA = bw * h,
    webP = 2 * (bw + h)
  const web = { Acp: webA, pcp: webP, ratio: (webA * webA) / webP }
  if (s.shape === 'rect') return { shape: s.shape, hollow: false, sides: 0, hw: 0, ohEff: 0, ohGov: '—', withFlange: web, web, useFlange: false, Acp: webA, pcp: webP, Ag: webA, ratio: web.ratio }
  const hf = s.hf ?? 0
  const sides = s.shape === 'T' || s.shape === 'invT' ? 2 : 1
  const hw = h - hf
  const avail = s.overhang ?? Infinity
  const ohEff = Math.max(0, Math.min(hw, 4 * hf, avail))
  const ohGov: TorSection['ohGov'] = ohEff === avail && avail < Math.min(hw, 4 * hf) ? 'slab' : hw <= 4 * hf ? 'hw' : '4hf'
  // an orthogonally convex outline has perimeter 2(total width + total depth)
  const A = webA + sides * ohEff * hf
  const p = 2 * (bw + sides * ohEff + h)
  const withFlange = { Acp: A, pcp: p, ratio: (A * A) / p }
  const useFlange = withFlange.ratio >= web.ratio
  const g = useFlange ? withFlange : web
  return { shape: s.shape, hollow: false, sides, hw, ohEff, ohGov, withFlange, web, useFlange, Acp: g.Acp, pcp: g.pcp, Ag: g.Acp, ratio: g.ratio }
}

export interface ThresholdOpts {
  /** psi */
  fc: number
  lambda?: number
  phi?: number
  /** factored axial force, kip (+ compression, − tension) */
  Nu?: number
  /** prestressed: average precompression fpc, psi (ACI 22.7.4.1, beyond the slides) */
  fpc?: number
}

export type TthCase = 'solid' | 'solid-axial' | 'hollow' | 'hollow-axial' | 'prestressed'

export interface Threshold {
  case: TthCase
  sqrtFc: number
  /** √(1 + Nu/(4Agλ√f'c)) or √(1 + fpc/(4λ√f'c)) */
  factor: number
  /** in-lb */
  TthInLb: number
  /** ft-kip */
  Tth: number
  phiTth: number
  /** cracking torque 4λ√f'c Acp²/pcp × factor (ACI 22.7.5.1; uses Acp even for a hollow section), ft-kip */
  Tcr: number
  phiTcr: number
  phi: number
}

export function threshold(sec: TorSection, o: ThresholdOpts): Threshold {
  const lam = o.lambda ?? 1
  const phi = o.phi ?? 0.75
  const sqrtFc = Math.min(Math.sqrt(o.fc), 100)
  const ls = lam * sqrtFc
  let factor = 1
  let cs: TthCase = sec.hollow ? 'hollow' : 'solid'
  if (o.fpc) {
    factor = Math.sqrt(Math.max(0, 1 + o.fpc / (4 * ls)))
    cs = 'prestressed'
  } else if (o.Nu) {
    factor = Math.sqrt(Math.max(0, 1 + (o.Nu * 1000) / (4 * sec.Ag * ls)))
    cs = sec.hollow ? 'hollow-axial' : 'solid-axial'
  }
  const TthInLb = ls * sec.ratio * factor
  const Tth = TthInLb / 12000
  const Tcr = (4 * ls * ((sec.Acp * sec.Acp) / sec.pcp) * factor) / 12000
  return { case: cs, sqrtFc, factor, TthInLb, Tth, phiTth: phi * Tth, Tcr, phiTcr: phi * Tcr, phi }
}

// ---------------------------------------------------------------- torque from an eccentric slab load (lecture example)
export interface SpandrelIn {
  /** clear span between column faces, ft (both ends restrained against twist) */
  L: number
  /** web width and total depth (incl. slab), in */
  bw: number
  h: number
  /** slab thickness, in */
  hf: number
  /** slab cantilevering beyond the web face, ft */
  overhang: number
  /** superimposed dead load on the slab, psf */
  slabSDL?: number
  /** live load on the slab, psf */
  slabLL: number
  /** live line load on the beam centreline, lb/ft */
  lineLL?: number
  /** extra dead line load on the beam centreline, lb/ft */
  lineDL?: number
  /** effective depth, in */
  d: number
  fD?: number
  fL?: number
  /** concrete, pcf */
  gamma?: number
}

export interface SpandrelOut {
  /** overhang (eccentric) loads, lb/ft */
  ecc: { D: number; L: number; uD: number; uL: number; u: number }
  /** eccentricity of the overhang load from the beam centreline, ft */
  e: number
  /** loads on the beam centreline, lb/ft */
  cl: { web: number; D: number; L: number; uD: number; uL: number; u: number }
  /** total factored beam load, lb/ft */
  wu: number
  /** distributed torque, ft-lb/ft */
  tu: number
  /** at the column face (kip, ft-kip) */
  VuFace: number
  TuFace: number
  /** at d from the face */
  Vud: number
  Tud: number
  /** (L/2 − d)/(L/2) */
  ratio: number
}

/** loads, uniform torque and Vu, Tu at the face and at d (handnote steps 1–7) */
export function spandrelTorque(s: SpandrelIn): SpandrelOut {
  const g = s.gamma ?? 150
  const fD = s.fD ?? 1.2,
    fL = s.fL ?? 1.6
  const slabDL = (g * s.hf) / 12 + (s.slabSDL ?? 0) // psf
  const D = slabDL * s.overhang
  const Lv = s.slabLL * s.overhang
  const ecc = { D, L: Lv, uD: fD * D, uL: fL * Lv, u: fD * D + fL * Lv }
  const e = s.bw / 24 + s.overhang / 2
  const web = ((s.bw * s.h) / 144) * g
  const clD = web + (s.slabSDL ?? 0) * (s.bw / 12) + (s.lineDL ?? 0)
  const clL = (s.lineLL ?? 0) + s.slabLL * (s.bw / 12)
  const cl = { web, D: clD, L: clL, uD: fD * clD, uL: fL * clL, u: fD * clD + fL * clL }
  const wu = cl.u + ecc.u
  const tu = ecc.u * e
  const half = s.L / 2
  const ratio = (half - s.d / 12) / half
  const VuFace = (wu * half) / 1000
  const TuFace = (tu * half) / 1000
  return { ecc, e, cl, wu, tu, VuFace, TuFace, Vud: VuFace * ratio, Tud: TuFace * ratio, ratio }
}

// ---------------------------------------------------------------- the decision
export type TorsionKind = 'equilibrium' | 'compatibility'

export interface TorsionCheck {
  Tu: number
  phiTth: number
  neglect: boolean
  kind: TorsionKind
  /** torque to design for: Tu (equilibrium) or min(Tu, φTcr) (compatibility, ACI 22.7.3.2, beyond the slides); 0 if neglected */
  Tdesign: number
  reduced: boolean
  /** Tu ≥ φTcr: the member will crack in torsion */
  cracks: boolean
}

export function torsionCheck(Tu: number, th: Threshold, kind: TorsionKind = 'equilibrium'): TorsionCheck {
  const T = Math.abs(Tu)
  const neglect = T <= th.phiTth + 1e-9
  const reduced = !neglect && kind === 'compatibility' && T > th.phiTcr
  const Tdesign = neglect ? 0 : reduced ? th.phiTcr : T
  return { Tu: T, phiTth: th.phiTth, neglect, kind, Tdesign, reduced, cracks: T >= th.phiTcr }
}
