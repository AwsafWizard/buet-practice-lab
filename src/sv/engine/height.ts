// Height & distance with a theodolite (lecture sheet pp 13–24):
//  • height of an inaccessible tower, both stations in line with it, instrument at different heights;
//  • aerial (spatial) distance between two elevated points F and G seen from a base AB;
//  • area of a space triangle FGH.
// The aerial-distance / space-triangle solver follows the sheet's chain: horizontal triangles by the sine rule
// (ABC, ABD, …), vertical triangles for the heights (CF = AC·tan∠CAF), the cosine rule for the ground
// distance between two feet, then FG = √(CD² + (CF − DG)²) and Heron's formula.

import { RAD } from './angle'

export interface TowerInput {
  /** distance between the two instrument stations (in line with the tower) */
  a: number
  /** angle of elevation to the top from the far station (θ₁) and the near station (θ₂), degrees */
  th1: number
  th2: number
  /** height of the line of sight (instrument axis) at the far station (h₁) and the near station (h₂) */
  h1: number
  h2: number
}

/**
 * Lecture sheet p14: H = h₁ + (a + x)·tanθ₁ (far station) = h₂ + x·tanθ₂ (near station)
 * ⇒ x = (h₂ − h₁ − a·tanθ₁)/(tanθ₁ − tanθ₂), the near station's horizontal distance to the tower.
 */
export function towerHeight({ a, th1, th2, h1, h2 }: TowerInput) {
  const t1 = Math.tan(th1 * RAD)
  const t2 = Math.tan(th2 * RAD)
  const x = (h2 - h1 - a * t1) / (t1 - t2)
  const H = h2 + x * t2
  const Hcheck = h1 + (a + x) * t1
  return { x, H, Hcheck, t1, t2 }
}

/** same-level stations (h₁ = h₂ = h): the textbook form x = a·tanθ₁/(tanθ₂ − tanθ₁) */
export function towerSameLevel(a: number, th1: number, th2: number, h: number) {
  return towerHeight({ a, th1, th2, h1: h, h2: h })
}

/** one elevated point seen from both ends of the base AB */
export interface TargetObs {
  name: string
  /** horizontal angle at A between B and the target's foot (∠BAP), degrees */
  atA: number
  /** horizontal angle at B between A and the target (∠ABP) */
  atB: number
  /** vertical angle at A to the target (∠ elevation) */
  vA: number
}

export interface TargetSol {
  name: string
  /** angle at the target in triangle ABP */
  atP: number
  /** horizontal distances from A and B (sine rule) */
  AP: number
  BP: number
  /** height of the target above A's line of sight: AP·tan(vA) */
  h: number
  /** plan position, A at the origin, B on +x, targets on +y */
  x: number
  y: number
}

export function locateTarget(AB: number, t: TargetObs): TargetSol {
  const atP = 180 - t.atA - t.atB
  const AP = (AB * Math.sin(t.atB * RAD)) / Math.sin(atP * RAD)
  const BP = (AB * Math.sin(t.atA * RAD)) / Math.sin(atP * RAD)
  const h = AP * Math.tan(t.vA * RAD)
  return { name: t.name, atP, AP, BP, h, x: AP * Math.cos(t.atA * RAD), y: AP * Math.sin(t.atA * RAD) }
}

/** horizontal angle at A between two targets' feet (∠PAQ) = |∠BAP − ∠BAQ| when both lie on the same side of AB */
export const angleAtA = (p: TargetObs, q: TargetObs) => Math.abs(p.atA - q.atA)

/** the sheet's FG: ground distance between the feet by the cosine rule, then the 3-D distance */
export function aerialDistance(AB: number, p: TargetObs, q: TargetObs) {
  const P = locateTarget(AB, p)
  const Q = locateTarget(AB, q)
  const ang = angleAtA(p, q)
  const ground = Math.sqrt(Math.max(0, P.AP ** 2 + Q.AP ** 2 - 2 * P.AP * Q.AP * Math.cos(ang * RAD)))
  const space = Math.hypot(ground, P.h - Q.h)
  return { P, Q, ang, ground, space }
}

export function heron(a: number, b: number, c: number) {
  const s = (a + b + c) / 2
  return { s, area: Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c))) }
}

/** area of the space triangle formed by three elevated points */
export function spaceTriangle(AB: number, f: TargetObs, g: TargetObs, h: TargetObs) {
  const FG = aerialDistance(AB, f, g)
  const GH = aerialDistance(AB, g, h)
  const FH = aerialDistance(AB, f, h)
  const { s, area } = heron(FG.space, GH.space, FH.space)
  return { FG, GH, FH, s, area }
}

// ── The lecture sheet's own angle sets (pp 017–024). Stations A and B; C, D (and E) are the feet, F, G (and H) the tops.
// Horizontal angles are read between neighbouring lines, as in the manual's figure (A–B along the front,
// C and D behind): ∠BAC = ∠BAD + ∠CAD, ∠ABD = ∠ABC + ∠CBD. Vertical angles are elevations at A.

const sin = (d: number) => Math.sin(d * RAD)
const cos = (d: number) => Math.cos(d * RAD)
const tan = (d: number) => Math.tan(d * RAD)

/** triangle on base AB with known angles at A and B: the third angle and the two sides by the sine rule */
function baseTri(AB: number, atA: number, atB: number) {
  const atP = 180 - atA - atB
  return { atP, fromA: (AB / sin(atP)) * sin(atB), fromB: (AB / sin(atP)) * sin(atA) }
}
const cosRule = (p: number, q: number, ang: number) => Math.sqrt(Math.max(0, p * p + q * q - 2 * p * q * cos(ang)))

/** the six angles of the aerial-distance sheet (degrees; CAF, DAG as elevation angles) */
export interface AerialAngles {
  CAD: number
  BAD: number
  CAF: number
  DAG: number
  ABC: number
  CBD: number
}

/** aerial distance FG step by step, exactly as the sheet sets it out */
export function aerialFG(AB: number, a: AerialAngles) {
  const BAC = a.BAD + a.CAD
  const c = baseTri(AB, BAC, a.ABC)
  const CF = c.fromA * tan(a.CAF)
  const ABD = a.ABC + a.CBD
  const d = baseTri(AB, a.BAD, ABD)
  const DG = d.fromA * tan(a.DAG)
  const CD = cosRule(c.fromA, d.fromA, a.CAD)
  const CDb = cosRule(c.fromB, d.fromB, a.CBD)
  const FG = Math.hypot(CD, CF - DG)
  return { BAC, ACB: c.atP, AC: c.fromA, BC: c.fromB, CF, ABD, ADB: d.atP, AD: d.fromA, BD: d.fromB, DG, CD, CDb, EF: Math.abs(CF - DG), FG }
}

/** the nine angles of the space-triangle sheet */
export interface TriangleAngles extends AerialAngles {
  DAE: number
  BAE: number
  EAH: number
  DBE: number
}

/** space triangle FGH: the sheet's chain of horizontal and vertical triangles, then Heron */
export function spaceFGH(AB: number, a: Omit<TriangleAngles, 'BAD'>) {
  const BAD = a.BAE + a.DAE
  const fg = aerialFG(AB, { ...a, BAD })
  const ABE = a.ABC + a.CBD + a.DBE
  const e = baseTri(AB, a.BAE, ABE)
  const EH = e.fromA * tan(a.EAH)
  const DE = cosRule(fg.AD, e.fromA, a.DAE)
  const DEb = cosRule(fg.BD, e.fromB, a.DBE)
  const CAE = a.CAD + a.DAE
  const CBE = a.CBD + a.DBE
  const CE = cosRule(fg.AC, e.fromA, CAE)
  const CEb = cosRule(fg.BC, e.fromB, CBE)
  const GH = Math.hypot(DE, fg.DG - EH)
  const FH = Math.hypot(CE, fg.CF - EH)
  const { s, area } = heron(fg.FG, GH, FH)
  return { ...fg, BAD, ABE, AEB: e.atP, AE: e.fromA, BE: e.fromB, EH, DE, DEb, CAE, CBE, CE, CEb, GH, FH, s, area }
}
