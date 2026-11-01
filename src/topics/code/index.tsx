import { useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Callout, Md, Section, Step, Steps, Tex } from '../../components/ui'
import { KLL, reducedLL, roofLL } from '../../engine/llr'
import { LLRSolution } from '../../kit/loads'
import { pick, rng, Slider, TopicFrequency, useSeed } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

const CARDS: [string, string][] = [
  ['What was the Code of Hammurabi and why does it matter to structural engineers?', 'Babylonian law (~2000 BC). If a defective building collapsed and killed the owner, the builder was put to death (the builder’s son if the owner’s son died). First written rule making builders responsible for structural safety.'],
  ['Primary purpose of a building code?', 'To set minimum standards for design, construction, materials, use/occupancy, location and maintenance of buildings to safeguard life, limb, health, property and public welfare. It is for professionals; designers may exceed it.'],
  ['Why are codes called “minimum requirements”?', 'They give an acceptable level of safety, not the best design. When they work nobody notices; failures (fires, collapses) push society to demand stronger codes.'],
  ['Timeline of BNBC', 'Building Construction Act 1952 → first code drafted by HBRI 1993 → Act amended 2006, BNBC enacted by SRO 2006 → update project 2009 → submitted 2015 → gazetted as BNBC-2020 in February 2021.'],
  ['Which part of BNBC deals with structural design, and which chapter with loads?', 'Part 6 (Structural Design, Volume 2), Chapter 2: Loads on buildings and structures.'],
  ['Types of loads in BNBC Part 6 Ch 2', 'Dead, live, wind, earthquake, and miscellaneous: rain, flood/surge, temperature, soil & hydrostatic pressure, erection/construction, explosions, air-raid shelters, helicopter landing areas.'],
  ['Define dead load', 'Vertical load from the weight of permanent structural and non-structural components: walls, floors, ceilings, permanent partitions, fixed service equipment, etc.'],
  ['Dead load of a member is assessed from…', 'its own weight; materials it permanently supports; permanent partitions; fixed service equipment; net effect of prestressing.'],
  ['Partitions shown on the plans vs not shown', 'Shown → dead load as line loads at their actual positions. Not shown (anticipated) → live load placed to produce the most severe effect.'],
  ['Light partitions rule', 'If weight ≤ 5.5 kN per metre run, a UDL may replace the line loads: ≥ 33 % of the weight per metre run, minimum 1.2 kN/m².'],
  ['Define live load', 'Load superimposed by the use or occupancy of the building — excluding environmental loads (wind, rain, earthquake) and dead load.'],
  ['Concentrated live load application', 'Applied non-concurrently with the UDL, over 300 mm × 300 mm, at the position producing maximum stress (unless stated otherwise).'],
  ['Partial loading (pattern loading)', 'Full reduced live load on part of the structure if more unfavourable; for continuous members consider full DL with LL on adjacent spans and on alternate spans.'],
  ['Impact allowance for lifts / hoists (Table 6.2.6)', '100 % of the static load (light machinery 20 %, reciprocating machinery 50 %, hangers for floors/balconies 33 %).'],
  ['Live loads that may NOT be reduced', 'LL > 4.80 kN/m² (except 20 % for members supporting ≥ 2 floors); passenger-car garages (same exception); public assembly with LL ≤ 4.80; cyclone shelters (no reduction).'],
  ['Live-load reduction formula', 'L = L₀ (0.25 + 4.57/√(K_LL·A_T)), allowed when K_LL·A_T ≥ 37.16 m²; L ≥ 0.50 L₀ (one floor), ≥ 0.40 L₀ (two or more floors).'],
  ['What is K_LL?', 'Live load element factor = influence area / tributary area. Interior & exterior columns 4, edge column with cantilever slab 3, corner column with cantilever 2, interior & edge beams 2, slabs & others 1.'],
  ['Roof live-load reduction', 'L_r = L₀R₁R₂, 0.60 ≤ L_r ≤ 1.00 kN/m². R₁ from tributary area (1 for ≤ 18.58 m², 0.6 for ≥ 55.74 m²); R₂ from roof slope F (1 for F ≤ 4, 0.6 for F ≥ 12).'],
  ['One-way slab limitation for LLR', 'Tributary area A_T ≤ slab span × (1.5 × slab span).'],
  ['Strength load combinations (BNBC 2020)', '1.4(D+F); 1.2(D+F+T)+1.6(L+H)+0.5(Lr or R); 1.2D+1.6(Lr or R)+(L or 0.8W); 1.2D+1.6W+L+0.5(Lr or R); 1.2D+1.0E+1.0L; 0.9D+1.6W+1.6H; 0.9D+1.0E+1.6H.'],
]

function Flashcards() {
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)
  const [known, setKnown] = useState<Set<number>>(new Set())
  const c = CARDS[i]
  const go = (d: number) => {
    setI((i + d + CARDS.length) % CARDS.length)
    setFlip(false)
  }
  return (
    <div className="max-w-2xl">
      <button onClick={() => setFlip(!flip)} className="card w-full p-6 min-h-44 text-left hover:border-accent transition-colors" style={{ perspective: 800 }}>
        <div className="text-xs text-faint mb-2">
          Card {i + 1}/{CARDS.length} · {flip ? 'answer' : 'question — click to flip'}
        </div>
        <div className={'text-lg ' + (flip ? 'text-ink' : 'font-semibold')}>{flip ? c[1] : c[0]}</div>
      </button>
      <div className="flex items-center gap-2 mt-3">
        <button className="btn" onClick={() => go(-1)}>
          ←
        </button>
        <button className="btn" onClick={() => go(1)}>
          →
        </button>
        <button
          className={'btn ' + (known.has(i) ? '!border-good text-good' : '')}
          onClick={() => {
            const k = new Set(known)
            if (k.has(i)) k.delete(i)
            else k.add(i)
            setKnown(k)
          }}
        >
          {known.has(i) ? '✓ I know this' : 'Mark as known'}
        </button>
        <span className="text-xs text-mute ml-auto">
          {known.size}/{CARDS.length} known
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- LLR grid game
function LLRGame() {
  const { seed, next } = useSeed(5)
  const g = useMemo(() => {
    const r = rng(seed)
    const xs = [0]
    const ys = [0]
    for (let k = 0; k < 3; k++) xs.push(xs[xs.length - 1] + pick(r, [4, 5, 6, 7, 8]))
    for (let k = 0; k < 2; k++) ys.push(ys[ys.length - 1] + pick(r, [4, 5, 6, 7]))
    return { xs, ys, floors: pick(r, [1, 2, 3]), L0: pick(r, [2.4, 3.0, 2.0, 4.0]) }
  }, [seed])
  const [sel, setSel] = useState<[number, number]>([1, 1])
  const [i, j] = sel
  const half = (arr: number[], k: number) => ((k > 0 ? arr[k] - arr[k - 1] : 0) + (k < arr.length - 1 ? arr[k + 1] - arr[k] : 0)) / 2
  const AT1 = half(g.xs, i) * half(g.ys, j)
  const interior = i > 0 && i < g.xs.length - 1 && j > 0 && j < g.ys.length - 1
  const K = 4 // interior and exterior columns without cantilever slabs
  const AT = AT1 * g.floors
  const res = reducedLL({ L0: g.L0, KLL: K, AT, floorsSupported: g.floors })
  const S = 34
  const X = (x: number) => 30 + x * S
  const Y = (y: number) => 30 + y * S
  const x0 = i > 0 ? (g.xs[i - 1] + g.xs[i]) / 2 : g.xs[i]
  const x1 = i < g.xs.length - 1 ? (g.xs[i] + g.xs[i + 1]) / 2 : g.xs[i]
  const y0 = j > 0 ? (g.ys[j - 1] + g.ys[j]) / 2 : g.ys[j]
  const y1 = j < g.ys.length - 1 ? (g.ys[j] + g.ys[j + 1]) / 2 : g.ys[j]
  const key = `${seed}-${i}-${j}`
  return (
    <div className="grid cq-lg:grid-cols-[1fr_1fr] gap-4">
      <div>
        <svg viewBox={`0 0 ${X(g.xs[g.xs.length - 1]) + 50} ${Y(g.ys[g.ys.length - 1]) + 40}`} className="w-full h-auto">
          <rect x={X(x0)} y={Y(y0)} width={(x1 - x0) * S} height={(y1 - y0) * S} fill="var(--c-accent)" opacity={0.22} />
          {g.xs.map((x, k) => (
            <g key={'x' + k}>
              <line x1={X(x)} x2={X(x)} y1={Y(0) - 10} y2={Y(g.ys[g.ys.length - 1]) + 10} stroke="var(--c-faint)" strokeDasharray="4 4" />
              {k > 0 && (
                <text x={(X(x) + X(g.xs[k - 1])) / 2} y={Y(g.ys[g.ys.length - 1]) + 26} fontSize={11} textAnchor="middle" fill="var(--c-mute)">
                  {x - g.xs[k - 1]} m
                </text>
              )}
            </g>
          ))}
          {g.ys.map((y, k) => (
            <g key={'y' + k}>
              <line y1={Y(y)} y2={Y(y)} x1={X(0) - 10} x2={X(g.xs[g.xs.length - 1]) + 10} stroke="var(--c-faint)" strokeDasharray="4 4" />
              {k > 0 && (
                <text x={X(g.xs[g.xs.length - 1]) + 30} y={(Y(y) + Y(g.ys[k - 1])) / 2 + 4} fontSize={11} fill="var(--c-mute)">
                  {y - g.ys[k - 1]} m
                </text>
              )}
            </g>
          ))}
          {g.xs.flatMap((x, a) =>
            g.ys.map((y, b) => (
              <rect key={`${a}${b}`} x={X(x) - 7} y={Y(y) - 7} width={14} height={14} rx={2} fill={a === i && b === j ? 'var(--c-load)' : 'var(--c-panel2)'} stroke="var(--c-mute)" style={{ cursor: 'pointer' }} onClick={() => setSel([a, b])} />
            )),
          )}
        </svg>
        <div className="text-xs text-faint">Click a column. The shaded area is its tributary area on one floor.</div>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          Building: {g.floors} floor(s) above this column level, office/residential live load <b>L₀ = {g.L0} kN/m²</b>, no cantilever slabs → K<sub>LL</sub> = 4 for every column ({interior ? 'interior' : 'exterior/corner'} column).
        </div>
        <Answer key={key + 'a'} id={`code:llr:${key}:AT`} label="A_T (all floors)" value={AT} unit="m²" />
        <Answer key={key + 'l'} id={`code:llr:${key}:L`} label="Reduced L" value={res.L} unit="kN/m²" />
        <details>
          <summary className="cursor-pointer text-accent">show working</summary>
          <Tex block>{`A_T = ${fmt(AT1)}\\times${g.floors} = ${fmt(AT)}\\ \\text{m}^2,\\ K_{LL}A_T = ${fmt(res.KA)} ${res.applies ? '\\ge' : '<'} 37.16`}</Tex>
          {res.applies ? (
            <Tex block>{`L = ${g.L0}\\left(0.25 + \\frac{4.57}{\\sqrt{${fmt(res.KA)}}}\\right) = ${fmt(res.raw, 3)}\\ \\to\\ \\max(\\cdot, ${res.minFrac}L_0 = ${fmt(res.min, 3)}) = \\mathbf{${fmt(res.L, 3)}}`}</Tex>
          ) : (
            <div>No reduction allowed (K_LL·A_T &lt; 37.16 m²) → L = L₀.</div>
          )}
        </details>
        <button className="btn" onClick={next}>
          ↻ New building
        </button>
      </div>
    </div>
  )
}

function RoofCalc() {
  const [At, setAt] = useState(40)
  const [F, setF] = useState(3)
  const [L0, setL0] = useState(1)
  const r = roofLL({ L0, At, F })
  return (
    <div className="grid cq-md:grid-cols-2 gap-4 text-sm">
      <div className="space-y-2">
        <Slider label="Tributary area A_t" value={At} min={5} max={80} onChange={setAt} unit=" m²" />
        <Slider label="F (0.12 × slope %)" value={F} min={0} max={14} step={0.5} onChange={setF} />
        <Slider label="L₀" value={L0} min={0.5} max={1.5} step={0.05} onChange={setL0} unit=" kN/m²" />
      </div>
      <div>
        <Tex block>{`R_1 = ${fmt(r.R1, 3)},\\quad R_2 = ${fmt(r.R2, 3)}`}</Tex>
        <Tex block>{`L_r = L_0R_1R_2 = ${fmt(r.raw, 3)} \\Rightarrow \\text{clamped to } [0.6, 1.0]: \\mathbf{${fmt(r.Lr, 3)}}\\ \\text{kN/m}^2`}</Tex>
      </div>
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Why building codes" right={<div className="w-72 hidden cq-md:block"><TopicFrequency topic="code" /></div>}>
        <Md>{`Codes protect people from everyday disasters — fire (Chawkbazar, Feb 2019; FR Tower, Mar 2019), floods, cyclones, earthquakes and collapse from deterioration. They are **minimum requirements**: “an ounce of prevention today vs. a pound of suffering in the future.” When they work nobody notices; when they fail, society demands stronger codes.

The oldest example is the **Code of Hammurabi** (~2000 BC): a builder whose building collapsed and killed the owner was put to death.`}</Md>
      </Section>
      <Section title="BNBC 2020 in one screen">
        <div className="grid cq-md:grid-cols-2 gap-4">
          <Md>{`**History**: BC Act 1952 → HBRI draft 1993 → Act amended 2006 + BNBC by SRO 2006 → update project 2009 → submitted 2015 → **gazetted as BNBC-2020, February 2021**.

**Structure**: Vol 1 — Parts 2–5 (administration, general requirements, fire protection, materials); **Vol 2 — Part 6 Structural Design**, Part 7 construction practice & safety; Vol 3 — Parts 8–10 (services, alterations, signs).

**Part 6, Chapter 2 — Loads**: dead, live, wind, earthquake + miscellaneous (rain, flood/surge, temperature, soil & hydrostatic, construction, explosions, air-raid shelters, helipads).`}</Md>
          <Md>{`**Dead load** = permanent components and fixed equipment (Tables 6.2.1–6.2.2 for unit weights).

**Live load** = load from use/occupancy (Table 6.2.3), uniform *or* concentrated (300 × 300 mm), whichever is critical; roof live load from Table 6.2.4; miscellaneous (handrails, parapets…) Table 6.2.5; impact Table 6.2.6.

**Partitions**: shown → dead load; not shown → live load (light ones: UDL ≥ 33 % of weight/m, min 1.2 kN/m²).`}</Md>
        </div>
      </Section>
      <Section title="Live-load reduction (Sec 2.3.13)">
        <Tex block>{`L = L_0\\left(0.25 + \\frac{4.57}{\\sqrt{K_{LL}A_T}}\\right)\\quad\\text{for } K_{LL}A_T \\ge 37.16\\text{ m}^2,\\qquad L \\ge \\begin{cases}0.50L_0 & \\text{one floor}\\\\0.40L_0 & \\text{two or more}\\end{cases}`}</Tex>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <table className="tbl">
            <thead>
              <tr>
                <th>Element</th>
                <th>K_LL</th>
              </tr>
            </thead>
            <tbody>
              {KLL.map((k) => (
                <tr key={k.element}>
                  <td className="txt">{k.element}</td>
                  <td>{k.K}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Md>{`**Not reduced**: LL > 4.80 kN/m² (but members supporting ≥ 2 floors may take 20 %), passenger-car garages (same exception), public assembly ≤ 4.80 kN/m², **cyclone shelters**. One-way slabs: $A_T \\le$ span × 1.5 span.

**Influence vs tributary area**: $K_{LL} = A_I/A_T$ — the influence area of an interior column is the four surrounding panels (4× its tributary area).

**Roof**: $L_r = L_0R_1R_2$, $0.60 \\le L_r \\le 1.00$ kN/m².`}</Md>
        </div>
        <Callout kind="exam">2023-24 Q3(b): reduced live load for an interior column at two levels (10 marks). Q4(a): Hammurabi + purpose of codes (5⅔ marks).</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Live-load reduction recipe">
        <Steps>
          <Step n={1} title="Tributary area per floor">Half the bay on each side in both directions (a corner column gets a quarter panel).</Step>
          <Step n={2} title="Add floors">A column at a lower level carries every floor above it: A_T = (area per floor) × (number of floors supported). Roof live load is handled separately.</Step>
          <Step n={3} title="K_LL from the table">Interior/exterior columns 4 (no cantilever slab).</Step>
          <Step n={4} title="Check K_LL·A_T ≥ 37.16 m²">Otherwise no reduction.</Step>
          <Step n={5} title="Formula + limit">0.5L₀ for one floor, 0.4L₀ for two or more. Report % reduction = 1 − L/L₀.</Step>
        </Steps>
      </Section>
      <Section title="Lecture example (Plan 3 @ 8 m × 2 @ 7 m, L₀ = 2.4 kN/m²)">
        <LLRSolution
          L0={2.4}
          rows={[
            { label: 'Corner column, level 2', AT: 14, KLL: 4, floors: 1 },
            { label: 'Corner column, level 1', AT: 28, KLL: 4, floors: 2 },
            { label: 'Interior shear wall, level 2', AT: 112, KLL: 1, floors: 1 },
            { label: 'Interior shear wall, level 1', AT: 224, KLL: 1, floors: 2 },
          ]}
        />
        <p className="text-xs text-faint mt-2">Matches the lecture table: 2.06 / 1.64 kN/m² (corner column) and 1.64 / 1.33 kN/m² (shear wall).</p>
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Flashcards" sub="Theory marks are free marks — flip until you know them all.">
        <Flashcards />
      </Section>
      <Section title="Live-load reduction on a column grid" sub="Click a column, compute A_T and the reduced live load.">
        <LLRGame />
      </Section>
      <Section title="Roof live load explorer">
        <RoofCalc />
      </Section>
    </div>
  )
}

const llrProblem = (id: string, level: PYQ['level'], title: string, text: string, L0: number, rows: { label: string; AT: number; KLL: number; floors: number }[]): PYQ => ({
  id: `own-code-${id}`,
  paper: 'own',
  level,
  sec: 'A',
  no: id,
  marks: 0,
  topics: ['code'],
  title,
  text,
  pages: [],
  checks: () => rows.map((r, k) => ({ key: `r${k}`, label: `Reduced L — ${r.label}`, value: reducedLL({ L0, KLL: r.KLL, AT: r.AT, floorsSupported: r.floors }).L, unit: 'kN/m²' })),
  solution: () => <LLRSolution L0={L0} rows={rows} />,
})

const problems: PYQ[] = [
  llrProblem('1', 'warm-up', 'Interior column, one floor', 'An interior column supports a tributary area of 6 m × 5 m of an office floor (L₀ = 2.4 kN/m²) on one floor. Find the reduced live load.', 2.4, [{ label: 'interior column', AT: 30, KLL: 4, floors: 1 }]),
  llrProblem('2', 'exam', 'Edge column of a 4-storey residence', 'Bays are 6 m (x) and 5 m (y). An edge column (no cantilever slab) carries floors 2, 3 and 4 at the ground storey. L₀ = 2.0 kN/m². Find the reduced live load for the ground-storey column and for the top-storey column (one floor).', 2.0, [
    { label: 'ground storey (3 floors)', AT: 3 * 3 * 5, KLL: 4, floors: 3 },
    { label: 'top storey (1 floor)', AT: 3 * 5, KLL: 4, floors: 1 },
  ]),
  llrProblem('3', 'exam', 'Interior beam vs slab', 'An interior beam has a tributary area of 24 m² and a one-way slab panel 12 m², both L₀ = 3.0 kN/m², one floor. Find the reduced live loads (note which one is not reducible).', 3.0, [
    { label: 'interior beam (K=2)', AT: 24, KLL: 2, floors: 1 },
    { label: 'slab (K=1)', AT: 12, KLL: 1, floors: 1 },
  ]),
  {
    id: 'own-code-4',
    paper: 'own',
    level: 'warm-up',
    sec: 'A',
    no: '4',
    marks: 0,
    topics: ['code'],
    title: 'Roof live load of a pitched roof',
    text: 'A pitched roof (slope 25 %) has a member with a tributary area of 30 m². Basic roof live load L₀ = 1.0 kN/m². Find R₁, R₂ and L_r.',
    pages: [],
    checks: () => {
      const r = roofLL({ L0: 1, At: 30, F: 0.12 * 25 })
      return [
        { key: 'R1', label: 'R₁', value: r.R1 },
        { key: 'Lr', label: 'L_r', value: r.Lr, unit: 'kN/m²' },
      ]
    },
    solution: () => {
      const r = roofLL({ L0: 1, At: 30, F: 3 })
      return <Tex block>{`F = 0.12\\times25 = 3 \\le 4 \\Rightarrow R_2 = 1;\\ R_1 = 1.2 - 0.011(30) = ${fmt(r.R1, 3)};\\ L_r = 1.0\\times${fmt(r.R1, 3)}\\times1 = ${fmt(r.raw, 3)} \\Rightarrow \\mathbf{${fmt(r.Lr, 3)}}\\text{ kN/m}^2`}</Tex>
    },
    notes: ['R₁ uses 1.2 − 0.011·A_t (continuous between 18.58 and 55.74 m²). The Lec 4-5 slide prints 0.001, which would give R₁ = 1.17 here; mention the constant you use in the exam.'],
  },
]

const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
