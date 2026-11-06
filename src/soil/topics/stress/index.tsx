// Stress distribution (SJMY sir, Lectures 21–25): Boussinesq / Westergaard point loads, line and strip loads, embankments
// (Osterberg), circles, rectangles (Fadum / Steinbrenner), Newmark's chart, 2:1, contact pressure.
import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { boussinesq, cornerTerms, embankmentAt, embankmentBlocks, embQ, NEWMARK_IF, newmarkCount, rectsInside, shapeI, simplifyTerms, type Embankment, type Rect } from '../../engine/stressdist'
import { openSmRef } from '../../reference/pane'
import type { SmQ, SmTopicModule } from '../../types'
import { BulbLab } from './BulbLab'
import { FadumBuilder, NewmarkLab } from './FadumLab'
import { EmbFig, PlanFig, ShapeCompareFig } from './figs'
import { LoadLab } from './LoadLab'
import { STRESS_PICKS } from './picks'
import { StressProblems } from './Problems'
import { SHAPES } from './shapes'
import { STRESS_THEORY } from './theory'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)
const R = String.raw

function Overview() {
  return (
    <div>
      <Section title="Stress distribution (SJMY sir, Lectures 21–25)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-stress" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{R`\sigma_z = K_B\frac{Q}{z^2},\ K_B = \frac{3/2\pi}{[1+(r/z)^2]^{5/2}},\qquad \sigma_{z,max} = \frac{0.0888Q}{r^2}\ \text{at}\ r/z = 0.8165`}</Tex>
            <Tex block>{R`\text{rectangle corner: } \sigma_z = qI(m,n),\ m = B/z,\ n = L/z;\qquad \text{Newmark: } \sigma_z = 0.005\,N\,q`}</Tex>
            <Tex block>{R`\text{embankment: } I_z = \frac1\pi\left[\frac{a+b}{a}(\alpha_1+\alpha_2) - \frac ba\alpha_2\right];\quad \text{circle: } q\{1-[1+(R/z)^2]^{-3/2}\}`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **Elastic (Boussinesq) theory**: homogeneous, isotropic, linearly elastic, semi-infinite, weightless soil, initially unstressed, load on a shear-free surface. Westergaard (thin rigid layers, μ = 0) gives ≈ ⅔ of KB near the axis.
- Every other case is an **integral of the point load**: line, strip, triangular strip, embankment, circle, rectangle; any shape by **superposition** or Newmark's chart.
- **2:1** gives the average stress on a spread area — quick, used for settlement.
- Recent papers print the chart with the question (Fadum, Newmark, Osterberg, Steinbrenner) and expect it attached.`}</Md>
          </div>
        </div>
        <Callout kind="exam">
          <Md>{`**How it is asked (12 of 13 papers, 25 sub-parts):**
- **Chart questions every modern paper:** T at the re-entrant corner by Newmark *and* Fadum (2021-22 Q1(c)/2(c)); notched area by Newmark (2023-24 Q7(a)); 4 × 6 m by Steinbrenner (2023-24 Q8(b)); point outside a rectangle by Fadum (2020-21 Q4(d)); unsymmetric flood embankment by Osterberg (Jan 2021 Q4(b)).
- **Point loads:** two footings as point loads (2021-22 Q4(a)); max σz on a vertical line (2017-18, 2012-13, 2011-12).
- **Older:** L-shaped buildings (2008-09, 2011-12), T by Newmark (2009-10), walls as line loads (2012-13), Newmark chart construction (2007-08).
- **Theory:** circle vs square vs strip (3 recent papers), contact pressure (3), Newmark construction, max-stress derivation.`}</Md>
        </Callout>
        <div className="flex flex-wrap gap-2 mt-2">
          <button className="btn" onClick={() => openSmRef('d-fadum')}>
            Fadum chart ↗
          </button>
          <button className="btn" onClick={() => openSmRef('d-newmark')}>
            Newmark chart ↗
          </button>
          <button className="btn" onClick={() => openSmRef('d-osterberg')}>
            Osterberg chart ↗
          </button>
        </div>
      </Section>
      <Section title="Circle, square, strip (asked in 3 recent papers)">
        <div className="grid cq-md:grid-cols-2 gap-4 items-center">
          <ShapeCompareFig />
          <Md className="text-sm">{`Same q and width B. All start at q; the circle dies fastest, then the square, the strip slowest. 0.1q bulb: ≈ 2B (square / circle), ≈ 4B or more (strip).`}</Md>
        </div>
      </Section>
      <Section title="Read the figure carefully: 2023-24 Q7(a)">
        <Md className="text-sm">{`The plan's labels put P **3 m from the left edge** and 1.5 m below the top of the notch — with a 3 m deep notch that is the notch's inner edge (ΣI = 0.534 → **≈ 80 kPa** at 150 kPa). The handnote placed P at the notch centre, 1.5 m from the edge (ΣI = 0.358 → 54 kPa), which matches the drawing but not its "3 m" label; the drawing is not to scale (it shows a notch ≈ 6 m deep). The dashboard follows the scan's labels and shows the handnote's reading as the alternative — write your reading on the script.`}</Md>
      </Section>
    </div>
  )
}

function Approach() {
  const T = SHAPES[0]
  const termsT = simplifyTerms(T.rects.flatMap((r) => cornerTerms(r, T.P[0], T.P[1], T.z)))
  const IT = shapeI(T.rects, T.P[0], T.P[1], T.z)
  const e: Embankment = { c: 8, h: 5, gamma: 19, aL: 10, aR: 25 }
  const A = embankmentBlocks(e, 10, 2)!
  const B = embankmentBlocks(e, 14, 3)!
  const out: Rect[] = [{ x1: 0, y1: -1, x2: 3, y2: 1 }]
  const termsO = simplifyTerms(cornerTerms(out[0], -1, 0, 2))
  const N = newmarkCount(rectsInside(T.rects), 5, 8).N
  return (
    <div>
      <Section title="Recipe">
        <Steps>
          <Step n={1} title="Identify the load">Point, line, strip / triangle, embankment, circle, rectangle, irregular.</Step>
          <Step n={2} title="Depth z from the loaded surface">For a footing at depth Df, z = depth − Df.</Step>
          <Step n={3} title="Choose the tool">KB; line / strip formulas; Osterberg (split at the point); circle formula; Fadum / Steinbrenner with corner rectangles; Newmark for any shape; 2:1 for a quick average.</Step>
          <Step n={4} title="Superpose">Rectangles with a corner at the point: + loaded, − fictitious; embankment blocks either side of the point; several loads add.</Step>
          <Step n={5} title="σz = q × ΣI">Write every m, n (a/z, b/z) and I in a table — that is where the marks are.</Step>
        </Steps>
        <Callout kind="trap">
          <Md>{`- m = B/z with the **full** B for a centre point — split into four first (m = B/2z).
- Forgetting the **+π** in Fadum's formula when m²n² > m² + n² + 1 (the chart is right, the calculator is not).
- Outside point: subtracting the wrong rectangle — every rectangle must have a corner **at P**.
- Embankment centre: one block's Iz only (symmetric → 2Iz).
- Newmark: drawing the plan to the wrong scale — **AB = z**, a new plan for each depth.
- z from the ground surface instead of the footing base; the 2:1 spread starts at the base too.`}</Md>
        </Callout>
      </Section>
      <Section title="2021-22 Q1(c)/2(c): T at the re-entrant corner (Fadum and Newmark)">
        <div className="grid cq-md:grid-cols-2 gap-4">
          <PlanFig rects={T.rects} P={T.P} terms={termsT} w={380} />
          <Md className="text-sm">{`z = 5 m. Rectangles with a corner at P: ${termsT.map((t) => `${f2(t.B)} × ${f2(t.L)} (m ${f3(t.m)}, n ${f3(t.n)}) I = ${f4(t.I)}`).join('; ')}.
ΣI = **${f4(IT)}**.
- Fadum, q = 200: σz = **${f2(200 * IT)} kPa** (handnote 66).
- Newmark, q = 150: N ≈ ${fmt(N, 1)} meshes (= ΣI/0.005) → σz = 0.005 × ${fmt(N, 1)} × 150 = **${f2(NEWMARK_IF * N * 150)} kPa** (handnote 49.5).`}</Md>
        </div>
      </Section>
      <Section title="2020-21 Q4(d): point outside the rectangle">
        <div className="grid cq-md:grid-cols-2 gap-4">
          <PlanFig rects={out} P={[-1, 0]} terms={termsO} w={340} />
          <Md className="text-sm">{`P is 1 m outside AD on the mid-line; z = 2 m. Two halves, each = (4 × 1, +) − (1 × 1, −): ${termsO.map((t) => `${t.sign > 0 ? '+' : '−'}I(${f3(t.m)}, ${f3(t.n)}) = ${f4(t.I)}`).join('; ')}. σz = 150 × ${f4(termsO.reduce((s, t) => s + t.sign * t.I, 0))} = **${f2(150 * termsO.reduce((s, t) => s + t.sign * t.I, 0))} kPa**.`}</Md>
        </div>
      </Section>
      <Section title="Jan 2021 Q4(b): unsymmetric embankment (Osterberg)">
        <EmbFig e={e} pts={[{ x: 10, z: 2, label: 'A' }, { x: 14, z: 3, label: 'B' }]} />
        <Md className="text-sm">{`q = 5 × 19 = ${f2(embQ(e))} kPa. Split at the vertical through each point.
- **A** (z = 2 m, below the left crest edge): ${A.blocks.map((b) => `${b.side} a = ${b.a}, b = ${b.b} → Iz = ${f3(b.I)}`).join('; ')} → σA = **${f2(A.sigma)} kPa** (handnote ≈ 89).
- **B** (z = 3 m, below the crest centre): ${B.blocks.map((b) => `${b.side} a = ${b.a}, b = ${b.b} → Iz = ${f3(b.I)}`).join('; ')} → σB = **${f2(B.sigma)} kPa** (handnote ≈ 93). Exact integral check: ${f2(embankmentAt(e, 14, 3))} kPa.`}</Md>
      </Section>
      <Section title="2021-22 Q4(a): two footings as point loads">
        <Md className="text-sm">{`z = 10 − 1.5 = 8.5 m. Own footing: KB(0) = 0.4775 → ${f3(boussinesq(300, 0, 8.5))} kPa; the other (r/z = ${f3(5 / 8.5)}): ${f3(boussinesq(300, 5, 8.5))} kPa. **Δσz = ${f3(boussinesq(300, 0, 8.5) + boussinesq(300, 5, 8.5))} kPa.**`}</Md>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- practice problems
const LOUT: Rect[] = [
  { x1: 0, y1: 0, x2: 12, y2: 6 },
  { x1: 0, y1: 6, x2: 6, y2: 14 },
]
const EMB2: Embankment = { c: 6, h: 6, gamma: 20, aL: 12, aR: 18 }

const problems: SmQ[] = [
  {
    id: 'sm-own-stress-1',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '1',
    marks: 0,
    topics: ['sm-stress'],
    title: 'L-shaped raft: a point outside the re-entrant corner',
    text: 'An L-shaped raft (a 12 m × 6 m base with a 6 m × 8 m wing rising from its left half, see the plan) carries 120 kPa. Find σz 6 m below P, which lies 3 m right of the wing and 2 m above the base strip (outside the loaded area). Analytically by Fadum, and the Newmark mesh count.',
    pages: [],
    figure: () => <PlanFig rects={LOUT} P={[9, 8]} w={360} />,
    checks: () => {
      const I = shapeI(LOUT, 9, 8, 6)
      return [
        { key: 'I', label: 'ΣI', value: I },
        { key: 's', label: 'σz', value: 120 * I, unit: 'kPa' },
        { key: 'N', label: 'Newmark meshes N', value: I / NEWMARK_IF },
      ]
    },
    solution: () => {
      const terms = simplifyTerms(LOUT.flatMap((r) => cornerTerms(r, 9, 8, 6)))
      const I = shapeI(LOUT, 9, 8, 6)
      return (
        <div className="space-y-2">
          <PlanFig rects={LOUT} P={[9, 8]} terms={terms} w={360} />
          <Md>{`Each loaded rectangle as ± rectangles with a corner at P: ${terms.map((t) => `${t.sign > 0 ? '+' : '−'}${f2(t.B)}×${f2(t.L)} I(${f3(t.m)}, ${f3(t.n)}) = ${f4(t.I)}`).join('; ')}. ΣI = **${f4(I)}** → σz = **${f2(120 * I)} kPa**; N = ${fmt(I / NEWMARK_IF, 1)}.`}</Md>
        </div>
      )
    },
  },
  {
    id: 'sm-own-stress-2',
    paper: 'own',
    level: 'challenge',
    sec: 'B',
    no: '2',
    marks: 0,
    topics: ['sm-stress'],
    title: 'Unsymmetric embankment: below the crest and below a slope',
    text: 'An embankment 6 m high (γ = 20 kN/m³) has a 6 m crest, a 12 m left slope and an 18 m right slope (horizontal lengths). Find σz 4 m below (a) the right edge of the crest (Osterberg) and (b) the middle of the left slope (superposition of the exact strip solutions).',
    pages: [],
    figure: () => <EmbFig e={EMB2} pts={[{ x: 18, z: 4, label: 'a' }, { x: 6, z: 4, label: 'b' }]} />,
    checks: () => [
      { key: 'a', label: 'σz at (a)', value: embankmentBlocks(EMB2, 18, 4)!.sigma, unit: 'kPa' },
      { key: 'b', label: 'σz at (b)', value: embankmentAt(EMB2, 6, 4), unit: 'kPa' },
    ],
    solution: () => {
      const a = embankmentBlocks(EMB2, 18, 4)!
      return (
        <Md>{`q = 120 kPa. (a) Split at the right crest edge: ${a.blocks.map((b) => `${b.side} a = ${b.a}, b = ${b.b} → Iz = ${f4(b.I)}`).join('; ')} → **${f2(a.sigma)} kPa**.
(b) Below the slope the load at the point is only 60 kPa; the Osterberg split needs a subtracted wedge, so sum the exact pieces (left ramp, crest, right ramp — each an integral of the line-load formula): **${f2(embankmentAt(EMB2, 6, 4))} kPa**. (Chart route: whole section as blocks about the point minus the missing triangle.)`}</Md>
      )
    },
  },
  {
    id: 'sm-own-stress-3',
    paper: 'own',
    level: 'warm-up',
    sec: 'B',
    no: '3',
    marks: 0,
    topics: ['sm-stress'],
    title: 'Point load: stress below, beside, and the worst depth',
    text: 'A 1500 kN column load acts at the surface. Find σz at 3 m depth (i) on the axis, (ii) 2 m from it; (iii) the depth and value of the maximum σz on the vertical line 2 m from the axis; (iv) Westergaard\'s value for (ii).',
    pages: [],
    checks: () => [
      { key: 'a', label: 'σz on the axis', value: boussinesq(1500, 0, 3), unit: 'kPa' },
      { key: 'b', label: 'σz at r = 2 m', value: boussinesq(1500, 2, 3), unit: 'kPa' },
      { key: 'z', label: 'depth of the maximum', value: 2 / Math.sqrt(2 / 3), unit: 'm' },
      { key: 'm', label: 'maximum', value: (0.0888 * 1500) / 4, unit: 'kPa', tol: 0.01 },
    ],
    solution: () => <Md>{`(i) 0.4775 × 1500/9 = **${f2(boussinesq(1500, 0, 3))} kPa**. (ii) r/z = 0.667, KB = ${f4((boussinesq(1500, 2, 3) * 9) / 1500)} → **${f2(boussinesq(1500, 2, 3))} kPa**. (iii) z = 1.225r = **${f2(2 / Math.sqrt(2 / 3))} m**, σmax = 0.0888 × 1500/4 = **${f2((0.0888 * 1500) / 4)} kPa**. (iv) KW = (1/π)/[1 + 2(0.667)²]^1.5 → ${f2((1500 / 9) * (1 / Math.PI) / (1 + 2 * (2 / 3) ** 2) ** 1.5)} kPa.`}</Md>,
  },
]

const mod: SmTopicModule = {
  Overview,
  Approach,
  Lab: () => (
    <div className="space-y-6">
      <Section title="One load at a time" sub="Point, line, strip, embankment, circle, rectangle: the formula with your numbers, the influence value and σz against depth (with 2:1 or Westergaard to compare).">
        <LoadLab />
      </Section>
      <Section title="Fadum superposition builder" sub="Draw L, T or notched plans from rectangles, put P anywhere (inside, on an edge, outside): the ± corner rectangles and ΣI appear; fill in each I.">
        <FadumBuilder />
      </Section>
      <Section title="Newmark's chart" sub="The plan drawn at AB = z with P at the centre, meshes counted ring by ring — or hide them and count yourself.">
        <NewmarkLab />
      </Section>
      <Section title="Pressure bulbs" sub="σz/q under a strip, square or circle; where the 0.1q bulb ends.">
        <BulbLab />
      </Section>
      <PickSection topic="sm-stress" skills={STRESS_PICKS} />
      <StressProblems />
    </div>
  ),
  problems,
  theory: STRESS_THEORY,
}
export default mod
