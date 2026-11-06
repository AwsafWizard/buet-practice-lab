// Exam-style stress-distribution problems: seeded, step checks, engine solution on reveal.
import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Md, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { DesignProblems, type DProblem, type DStep, type Level } from '../../../rc/topics/tbeam/designShell'
import { boussinesq, circleCentre, cornerTerms, embankmentBlocks, embQ, Irect, KB, lineEnd, maxOnVertical, NEWMARK_IF, shapeI, simplifyTerms, twoToOneRect, type Embankment } from '../../engine/stressdist'
import { EmbFig, PlanFig } from './figs'
import { randomShape, type ShapeCase } from './shapes'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)

export type StressFamily = 'point' | 'rect' | 'shape' | 'emb' | 'circle' | 'line'
export const STRESS_FAMILIES: { v: StressFamily; label: string }[] = [
  { v: 'point', label: 'Point loads' },
  { v: 'rect', label: 'Rectangle: centre / corner' },
  { v: 'shape', label: 'L / T / notch (Fadum)' },
  { v: 'emb', label: 'Embankment (Osterberg)' },
  { v: 'circle', label: 'Circle + Newmark' },
  { v: 'line', label: 'Walls as line loads' },
]

export interface SProblem extends DProblem<StressFamily> {
  fig: () => ReactNode
  sol: () => ReactNode
}

export function makeStressProblem(seed: number, family?: StressFamily, level: Level = 'exam'): SProblem {
  const r = rng(seed * 13 + 5)
  const fam = family ?? pick(r, STRESS_FAMILIES.map((f) => f.v))
  const title = STRESS_FAMILIES.find((f) => f.v === fam)!.label
  const mk = (text: string, steps: DStep[], fig: () => ReactNode, sol: () => ReactNode): SProblem => ({ family: fam, level, title, text, hash: hashKey(`${fam}|${seed}|${level}|${text}`), steps, fig, sol })
  if (fam === 'point') {
    const Q = randInt(r, 2, 8) * 100
    const s = randInt(r, 3, 8)
    const Df = randInt(r, 2, 4) / 2
    const zc = randInt(r, 6, 14)
    const z = zc - Df
    const n = level === 'tough' ? 3 : 2
    const rs = Array.from({ length: n }, (_, i) => i * s)
    const parts = rs.map((rr) => boussinesq(Q, rr, z))
    const tot = parts.reduce((a, b) => a + b, 0)
    const m = maxOnVertical(Q, s)
    const steps: DStep[] = [
      { key: 'z', group: 'Geometry', label: 'z below the footing base', value: z, unit: 'm', abs: 0.01 },
      ...rs.map((rr, i) => ({ key: `k${i}`, group: 'Influence', label: `KB at r = ${rr} m`, value: KB(rr / z), digits: 4, abs: 0.002 })),
      { key: 's', group: 'Stress', label: 'Δσz below footing 1', value: tot, unit: 'kPa', abs: 0.02 },
      ...(level !== 'basic' ? [{ key: 'mx', group: 'Stress', label: `max σz from one load on a vertical ${s} m away`, value: m.sigma, unit: 'kPa', abs: 0.02 }] : []),
    ]
    const text = `${n} column footings in a row, ${s} m c/c, each transmit ${Q} kN at ${f2(Df)} m below GL. Treating them as point loads, find the stress increase at ${zc} m below GL directly under the first footing.${level !== 'basic' ? ` Also the maximum vertical stress from one load on a vertical line ${s} m from it, and its depth.` : ''}`
    return mk(
      text,
      steps,
      () => <div className="text-xs text-faint">Sketch: footings at r = {rs.join(', ')} m; point {f2(z)} m below the base of footing 1.</div>,
      () => (
        <Md>{`z = ${zc} − ${f2(Df)} = ${f2(z)} m. ${rs.map((rr, i) => `r = ${rr}: r/z = ${f3(rr / z)}, KB = ${f4(KB(rr / z))}, σ = ${f4(KB(rr / z))} × ${Q}/${f2(z)}² = ${f3(parts[i])}`).join('; ')}. **Δσz = ${f3(tot)} kPa.**${level !== 'basic' ? ` Max on r = ${s} m at z = r/0.8165 = ${f2(m.z)} m: 0.0888 × ${Q}/${s}² = **${f3(m.sigma)} kPa**.` : ''}`}</Md>
      ),
    )
  }
  if (fam === 'rect') {
    const B = randInt(r, 2, 6)
    const L = B + randInt(r, 0, 4)
    const P = randInt(r, 10, 60) * 100
    const z = randInt(r, 2, 10)
    const q = P / (B * L)
    const Ic = Irect(B / 2 / z, L / 2 / z)
    const Ik = Irect(B / z, L / z)
    const steps: DStep[] = [
      { key: 'q', group: 'Pressure', label: 'q = P/A', value: q, unit: 'kPa', abs: 0.05 },
      { key: 'ic', group: 'Centre', label: 'I per quarter (m = B/2z, n = L/2z)', value: Ic, digits: 4, abs: 0.002 },
      { key: 'sc', group: 'Centre', label: 'σz below the centre', value: 4 * q * Ic, unit: 'kPa', abs: 0.1 },
      { key: 'sk', group: 'Corner', label: 'σz below a corner', value: q * Ik, unit: 'kPa', abs: 0.1 },
      ...(level !== 'basic' ? [{ key: 's21', group: '2:1 check', label: 'σz by 2:1 (average)', value: twoToOneRect(P, B, L, z), unit: 'kPa', abs: 0.1 }] : []),
    ]
    const text = `A ${B} m × ${L} m foundation transmits ${P} kN. Find the vertical stress increase ${z} m below (i) its centre, (ii) a corner (Fadum's / Steinbrenner's chart)${level !== 'basic' ? ', and (iii) the 2:1 estimate' : ''}.`
    return mk(
      text,
      steps,
      () => <PlanFig rects={[{ x1: -B / 2, y1: -L / 2, x2: B / 2, y2: L / 2 }]} P={[0, 0]} w={300} />,
      () => (
        <Md>{`q = ${P}/(${B} × ${L}) = ${f2(q)} kPa. Centre: four ${f2(B / 2)} × ${f2(L / 2)} rectangles, m = ${f3(B / 2 / z)}, n = ${f3(L / 2 / z)}, I = ${f4(Ic)} → **${f2(4 * q * Ic)} kPa**. Corner: m = ${f3(B / z)}, n = ${f3(L / z)}, I = ${f4(Ik)} → **${f2(q * Ik)} kPa**. 2:1: ${P}/((${B} + ${z})(${L} + ${z})) = ${f2(twoToOneRect(P, B, L, z))} kPa.`}</Md>
      ),
    )
  }
  if (fam === 'shape') {
    const c: ShapeCase = randomShape(seed * 5 + (level === 'basic' ? 1 : 2))
    const terms = simplifyTerms(c.rects.flatMap((rr) => cornerTerms(rr, c.P[0], c.P[1], c.z)))
    const I = shapeI(c.rects, c.P[0], c.P[1], c.z)
    const steps: DStep[] = [
      ...terms.map((t, i) => ({ key: `t${i}`, group: 'Corner rectangles', label: `${t.sign > 0 ? '+' : '−'} ${f2(t.B)} × ${f2(t.L)}: I`, value: t.I, digits: 4, abs: 0.002 })),
      { key: 'I', group: 'Result', label: 'ΣI', value: I, digits: 4, abs: 0.003 },
      { key: 's', group: 'Result', label: 'σz', value: c.q * I, unit: 'kPa', abs: 0.2 },
      { key: 'N', group: 'Result', label: 'Newmark meshes N', value: I / NEWMARK_IF, abs: 1, digits: 1 },
    ]
    const text = `The plan shown (grid 1 m) carries ${c.q} kPa. Find the vertical stress increase ${c.z} m below P analytically (Fadum's chart with superposition), and the number of Newmark meshes the plan would cover.`
    return mk(
      text,
      steps,
      () => <PlanFig rects={c.rects} P={c.P} w={420} />,
      () => (
        <div className="space-y-2">
          <PlanFig rects={c.rects} P={c.P} terms={terms} w={420} />
          <Md>{`Rectangles with a corner at P (green +, red −): ${terms.map((t) => `${t.sign > 0 ? '+' : '−'}I(${f3(t.m)}, ${f3(t.n)}) = ${f4(t.I)}`).join('; ')}. ΣI = **${f4(I)}** → σz = ${c.q} × ${f4(I)} = **${f2(c.q * I)} kPa**; N = ΣI/0.005 ≈ ${fmt(I / NEWMARK_IF, 1)}.`}</Md>
        </div>
      ),
    )
  }
  if (fam === 'emb') {
    const e: Embankment = { c: randInt(r, 4, 12), h: randInt(r, 3, 8), gamma: pick(r, [18, 19, 20]), aL: randInt(r, 2, 6) * 2, aR: randInt(r, 2, 12) * 2 }
    const xa = e.aL
    const xb = e.aL + e.c / 2
    const za = randInt(r, 2, 5)
    const zb = randInt(r, 2, 8)
    const A = embankmentBlocks(e, xa, za)!
    const Bk = embankmentBlocks(e, xb, zb)!
    const steps: DStep[] = [
      { key: 'q', group: 'Load', label: 'q = γH', value: embQ(e), unit: 'kPa', abs: 0.05 },
      ...A.blocks.map((b) => ({ key: `a${b.side}`, group: 'Point A (below the left crest edge)', label: `Iz, ${b.side} block`, value: b.I, digits: 4, abs: 0.003 })),
      { key: 'sa', group: 'Point A (below the left crest edge)', label: 'σz at A', value: A.sigma, unit: 'kPa', abs: 0.3 },
      ...Bk.blocks.map((b) => ({ key: `b${b.side}`, group: 'Point B (below the crest centre)', label: `Iz, ${b.side} half`, value: b.I, digits: 4, abs: 0.003 })),
      { key: 'sb', group: 'Point B (below the crest centre)', label: 'σz at B', value: Bk.sigma, unit: 'kPa', abs: 0.3 },
    ]
    const text = `An embankment ${e.h} m high (γ = ${e.gamma} kN/m³) has a ${e.c} m crest, left slope ${e.aL} m horizontal and right slope ${e.aR} m horizontal. Using Osterberg's chart find the stress increase at A, ${za} m below the left edge of the crest, and B, ${zb} m below the crest centre.`
    const line = (o: typeof A, name: string) => `${name}: ${o.blocks.map((b) => `${b.side} a = ${f2(b.a)}, b = ${f2(b.b)} (a/z ${f3(b.az)}, b/z ${f3(b.bz)}) → Iz = ${f4(b.I)}`).join('; ')}; σz = ${f2(embQ(e))} × ${f4(o.I)} = **${f2(o.sigma)} kPa**.`
    return mk(
      text,
      steps,
      () => <EmbFig e={e} pts={[{ x: xa, z: za, label: 'A' }, { x: xb, z: zb, label: 'B' }]} />,
      () => <Md>{`q = ${e.h} × ${e.gamma} = ${f2(embQ(e))} kPa. Split at the vertical through each point; each side is a block (flat b + slope a).\n\n${line(A, 'A')}\n\n${line(Bk, 'B')}`}</Md>,
    )
  }
  if (fam === 'circle') {
    const D = randInt(r, 4, 16)
    const q = randInt(r, 10, 30) * 10
    const z = randInt(r, 2, 12)
    const s = circleCentre(q, D / 2, z)
    const steps: DStep[] = [
      { key: 'rz', group: 'Circle formula', label: 'R/z', value: D / 2 / z, digits: 4, abs: 0.002 },
      { key: 's', group: 'Circle formula', label: 'σz below the centre', value: s, unit: 'kPa', abs: 0.2 },
      { key: 'N', group: 'Newmark check', label: 'meshes N (σz/q ÷ 0.005)', value: s / q / NEWMARK_IF, abs: 1, digits: 1 },
      ...(level !== 'basic' ? [{ key: 'ring', group: 'Newmark check', label: 'complete rings inside the raft', value: Math.floor((s / q) * 10 + 1e-9), digits: 0, abs: 0.4, tol: 0 }] : []),
    ]
    const text = `A tank on a ${D} m diameter circular raft applies ${q} kPa. Find the vertical stress increase ${z} m below the centre from the circle formula, and check it with Newmark's chart (influence value 0.005): how many meshes, how many complete rings?`
    return mk(
      text,
      steps,
      () => <div className="text-xs text-faint">Raft radius {f2(D / 2)} m; on the chart with AB = {z} m it has radius {f3(D / 2 / z)} AB.</div>,
      () => (
        <Tex block>{String.raw`\sigma_z = q\left\{1 - \left[\frac{1}{1+(R/z)^2}\right]^{3/2}\right\} = ${q}\{1 - [1/(1 + ${f3(D / 2 / z)}^2)]^{1.5}\} = ${f2(s)}\ \text{kPa};\quad N = \frac{${f4(s / q)}}{0.005} = ${fmt(s / q / NEWMARK_IF, 1)}\ \text{meshes}`}</Tex>
      ),
    )
  }
  // walls as line loads meeting at A
  const q1 = randInt(r, 5, 12) * 10
  const L1 = randInt(r, 4, 12)
  const q2 = randInt(r, 5, 12) * 10
  const L2 = randInt(r, 3, 8)
  const z = randInt(r, 2, 6)
  const s1 = lineEnd(q1, L1, z)
  const s2 = 2 * lineEnd(q2, L2, z)
  const steps: DStep[] = [
    { key: 's1', group: 'Wall BA (ends at A)', label: 'σz from BA', value: s1, unit: 'kPa', abs: 0.05 },
    { key: 's2', group: 'Wall CD (through A)', label: 'σz from CD (two segments)', value: s2, unit: 'kPa', abs: 0.05 },
    { key: 's', group: 'Total', label: 'σz at A', value: s1 + s2, unit: 'kPa', abs: 0.1 },
  ]
  const text = `Two load-bearing walls meet at A in a T. Wall BA carries ${q1} kN/m, is ${L1} m long and ends at A. Wall CD carries ${q2} kN/m and passes through A with ${L2} m on each side. Treating the walls as line loads, find the vertical stress ${z} m below A.`
  return mk(
    text,
    steps,
    () => <div className="text-xs text-faint">Plan: CD horizontal through A ({L2} m each side), BA perpendicular, ending at A.</div>,
    () => (
      <Md>{`Finite line, point below one end: σz = q′L(3z² + 2L²)/[2πz(z² + L²)^1.5]. BA: ${f3(s1)} kPa. CD = two ${L2} m segments ending at A: 2 × ${f3(s2 / 2)} = ${f3(s2)} kPa. **σz = ${f3(s1 + s2)} kPa** (2012-13 Q12(c)).`}</Md>
    ),
  )
}

export function StressProblems() {
  return (
    <DesignProblems
      topic="sm-stress"
      families={STRESS_FAMILIES}
      make={makeStressProblem}
      figure={(p) => p.fig()}
      solution={(p) => p.sol()}
      sub="A full exam-style problem: work it on paper (charts allowed), check each step, then open the solution."
      foot="Chart readings are accepted within the step tolerance; the engine uses the exact formulas behind each chart."
    />
  )
}
