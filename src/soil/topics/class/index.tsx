// Soil classification (AJK sir's Topic 3): grading, USDA, AASHTO + GI, USCS symbol and name.
import { Link } from 'react-router-dom'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { aashto, grading, sieveAnalysis, usda, uscs } from '../../engine/classify'
import { nf } from '../../engine/phase'
import { AashtoFig52, PlasticityChart, UsdaTriangle } from '../../reference/idx'
import type { SmQ, SmTopicModule } from '../../types'
import { ClassExams } from './exam'
import { AashtoGrid, GradingCurve, UscsPath } from './figs'
import { ClassLab } from './Lab'
import { CLASS_PICKS } from './picks'
import { CLASS_THEORY } from './theory'

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Classification of soils (Topic 3)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-class" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`C_u = \\frac{D_{60}}{D_{10}},\\qquad C_c = \\frac{D_{30}^2}{D_{60}D_{10}}`}</Tex>
            <Tex block>{`GI = (F-35)[0.2+0.005(LL-40)] + 0.01(F-15)(PI-10)`}</Tex>
            <Tex block>{`\\text{A-line: } PI = 0.73(LL-20),\\quad \\text{U-line: } PI = 0.9(LL-8)`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **USDA:** remove gravel (× 100/(100 − %G)), read the triangle, add "gravelly".
- **AASHTO:** F200 ≤ 35 granular / > 35 silt-clay; Table 5.1 left to right; A-7-5 vs A-7-6 by LL − 30; GI in brackets. "We need Table 5.1, Figure 5.2, Group Index."
- **USCS:** F200 ≥ 50 fine; gravel vs sand on the coarse fraction; fines < 5 / 5–12 / > 12 %; Cu, Cc; plasticity chart; organic if LL(oven)/LL < 0.75; group name from Figs 5.4–5.6.`}</Md>
            <Link to="/ce341/topic/sm-class/lab" className="btn btn-primary mt-2 inline-block">
              Open the classification lab →
            </Link>
          </div>
        </div>
        <Callout kind="exam">
          About 25 parts in all 13 papers — the most-asked topic in AJK sir's half. **USCS of two soils** (one fine, one sand with 5–12 % fines and a dual symbol: 2017-18, 2020-21, Jan 2021, 2007-08, 2008-09). **AASHTO + GI** from F200, LL, PL with the table attached (2017-18, 2020-21, Jan 2021, 2016-17, 2012-13). **Both systems** from % passing (2021-22 Q6(b), 2015-16 with the organic test, 2010-11, 2009-10 with D's back-calculated from Cu and Cc). **Sieve analysis** to a semi-log curve, fractions by both systems, Cu, Cc, grading comment (2023-24 Q4(a), 26⅔ marks). **Theory:** draw the plasticity chart (2017-18, 2020-21), features of AASHTO/USCS, ASTM size classes.
        </Callout>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Approach() {
  const e52 = aashto({ P10: 100, P40: 80, P200: 58, LL: 30, PI: 10 })
  const e53 = aashto({ P200: 95, LL: 60, PI: 40 })
  const e54 = aashto({ P10: 90, P40: 76, P200: 34, LL: 37, PI: 12 })
  const e56 = uscs({ F200: 30, F4: 70, LL: 33, PL: 12 })
  const e55a = uscs({ F200: 8, F4: 100, LL: 30, PL: 22, Cu: 0.135 / 0.085, Cc: 0.12 ** 2 / (0.135 * 0.085) })
  const e55b = uscs({ F200: 61, F4: 100, LL: 26, PL: 20 })
  const sB = usda({ gravel: 20, sand: 10, silt: 30, clay: 40 })
  const sa = sieveAnalysis(
    [4.75, 2.0, 0.85, 0.425, 0.25, 0.18, 0.15, 0.075].map((d, i) => ({ d, ret: [0, 40, 60, 89, 140, 122, 210, 56][i] })),
    12,
  )
  const g = grading(sa.pts)
  return (
    <div>
      <Section title="Recipe">
        <Steps>
          <Step n={1} title="Grading">% finer at every sieve (cumulative); semi-log curve; D10, D30, D60 by log interpolation; Cu, Cc.</Step>
          <Step n={2} title="Fractions">USCS: gravel = 100 − F4, sand = F4 − F200, fines = F200. AASHTO: gravel = 100 − F10, sand = F10 − F200.</Step>
          <Step n={3} title="AASHTO">Part 1 or 2 by F200 (35 %); left to right through Table 5.1; A-7 subgroup by LL − 30; check on Fig. 5.2; GI (rules on slide 13).</Step>
          <Step n={4} title="USCS symbol">Table 5.2: fine or coarse → G or S → fines band → W/P and/or M/C (plasticity chart) → symbol; organic test if two LLs are given.</Step>
          <Step n={5} title="USCS name">Fig. 5.4 (coarse: 15 % split on the other coarse fraction) or Figs 5.5 / 5.6 (fines: plus-No. 200 tree).</Step>
        </Steps>
      </Section>
      <Section title="Which case am I in?">
        <div className="grid cq-md:grid-cols-2 gap-3 text-sm">
          <Md>{`- **Only F200, LL, PL** → AASHTO (Part 2 if F > 35) or USCS fine (chart). Name needs the sand/gravel split — say so.
- **F200 between 5 and 12 %** → USCS dual symbol: need Cu, Cc (from D's or the curve) and the fines' position on the chart.
- **4 ≤ PI ≤ 7 above the A-line** → CL-ML (fine) or SC-SM / GC-GM (coarse, > 12 % fines).`}</Md>
          <Md>{`- **No No. 4 value** (2008-09) → if ≥ half the coarse fraction certainly passes a finer sieve, it is sand.
- **Two LLs** (air and oven) → organic test first.
- **Cu, Cc and one D given** (2009-10) → back-calculate D10 = D60/Cu, D30 = √(Cc·D60·D10).
- **Mass retained** → total includes the pan; % finer = 100 − cumulative %.`}</Md>
        </div>
        <Callout kind="trap">
          <Md>{`- Gravel/sand by the **whole** sample instead of the coarse fraction (fine here, since both use the same base, but say "of the coarse fraction").
- AASHTO with 4.75 mm or USCS with 2.0 mm boundaries.
- A-2-6/A-2-7: full GI formula instead of the PI term only; forgetting GI = 0 for A-1, A-3, A-2-4, A-2-5.
- A-7: comparing PI with LL instead of LL − 30.
- Cu ≥ 4 is the **gravel** limit; sands need Cu ≥ 6.
- Dual symbol letters in the wrong order (SW-SM, not SM-SW).
- Reading D's by straight-line interpolation on a log plot — use log interpolation (the difference is small but real: 2023-24 D60 0.288 vs 0.297 mm).`}</Md>
        </Callout>
      </Section>
      <Section title="AASHTO: Das Examples 5.2–5.4 (slides 15–24)">
        <div className="grid cq-lg:grid-cols-2 gap-4 items-start">
          <div className="text-sm space-y-2">
            {[
              ['5.2', e52],
              ['5.3', e53],
              ['5.4 (DIY)', e54],
            ].map(([n, a]) => {
              const r = a as ReturnType<typeof aashto>
              return (
                <div key={n as string}>
                  <b>Ex {n as string} → {r.label}</b>
                  <ol className="list-decimal pl-5">
                    {r.steps.map((s, i) => (
                      <li key={i}>
                        <Md>{s}</Md>
                      </li>
                    ))}
                  </ol>
                </div>
              )
            })}
          </div>
          <div className="space-y-2">
            <AashtoGrid a={e52} />
            <AashtoFig52 pt={{ LL: 30, PI: 10 }} F200={58} w={380} />
          </div>
        </div>
      </Section>
      <Section title="USCS: Das Examples 5.5 and 5.6 (slides 30–39)">
        <div className="grid cq-lg:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-bold mb-1">Ex 5.6 (70 % passing No. 4, 30 % No. 200, LL 33, PL 12)</div>
              <UscsPath u={e56} />
              <ol className="text-sm list-decimal pl-5 mt-1">
                {e56.steps.map((s, i) => (
                  <li key={i}>
                    <Md>{s.text}</Md>
                  </li>
                ))}
              </ol>
            </div>
            <div className="text-sm">
              <b>Ex 5.5 soil A:</b> {e55a.symbol}, {e55a.name.toLowerCase()} · <b>soil B:</b> {e55b.symbol}, {e55b.name.toLowerCase()}.
            </div>
          </div>
          <PlasticityChart
            pts={[
              { LL: 33, PI: 21, label: '5.6' },
              { LL: 30, PI: 8, label: '5.5A', color: 'var(--c-accent)' },
              { LL: 26, PI: 6, label: '5.5B', color: 'var(--c-accent2)' },
            ]}
            w={420}
          />
        </div>
      </Section>
      <Section title="Grading curve: 2023-24 Q4(a)" sub={`D10 = ${nf(g.D10, 3)}, D30 = ${nf(g.D30, 3)}, D60 = ${nf(g.D60, 3)} mm → Cu = ${nf(g.Cu, 3)}, Cc = ${nf(g.Cc, 3)}: poorly graded (uniform) sand`}>
        <GradingCurve curves={[{ pts: sa.pts }]} D={g} />
      </Section>
      <Section title="USDA: slide 4 soil B" sub={`20 % gravel, 10/30/40 → × 100/80 → ${nf(sB.sand, 3)} / ${nf(sB.silt, 3)} / ${nf(sB.clay, 3)} → ${sB.name}`}>
        <UsdaTriangle pt={{ sand: sB.sand, silt: sB.silt, clay: sB.clay, label: 'B' }} w={380} />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const problems: SmQ[] = [
  {
    id: 'sm-own-class-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'A',
    no: '1',
    marks: 0,
    topics: ['sm-class'],
    title: 'AASHTO with group index (three soils)',
    text: 'Classify by AASHTO: (a) F200 = 72 %, LL = 46, PL = 29; (b) F200 = 28 %, LL = 44, PL = 26 (No. 10 = 85 %, No. 40 = 55 %); (c) F200 = 64 %, LL = 33, PL = 25.',
    pages: [],
    checks: () => [
      { key: 'a', label: '(a) GI', value: aashto({ P200: 72, LL: 46, PI: 17 }).gi.gi, tol: 0, hint: aashto({ P200: 72, LL: 46, PI: 17 }).label },
      { key: 'b', label: '(b) GI', value: aashto({ P10: 85, P40: 55, P200: 28, LL: 44, PI: 18 }).gi.gi, tol: 0 },
      { key: 'c', label: '(c) GI', value: aashto({ P200: 64, LL: 33, PI: 8 }).gi.gi, tol: 0 },
    ],
    solution: () => (
      <div className="text-sm space-y-2">
        {[
          aashto({ P200: 72, LL: 46, PI: 17 }),
          aashto({ P10: 85, P40: 55, P200: 28, LL: 44, PI: 18 }),
          aashto({ P200: 64, LL: 33, PI: 8 }),
        ].map((a, i) => (
          <div key={i}>
            <b>
              ({'abc'[i]}) {a.label}
            </b>
            <ol className="list-decimal pl-5">
              {a.steps.map((s, j) => (
                <li key={j}>
                  <Md>{s}</Md>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'sm-own-class-2',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '2',
    marks: 0,
    topics: ['sm-class'],
    title: 'USCS: a sandy soil with 7 % fines and a clay',
    text: 'Soil A: % passing No. 4 = 85, No. 200 = 7; D10 = 0.07, D30 = 0.35, D60 = 1.5 mm; fines LL 41, PL 22. Soil B: % passing No. 4 = 96, No. 200 = 68; LL 58, PL 34. Give the USCS symbol and name of each.',
    pages: [],
    checks: () => [
      { key: 'cu', label: 'Cu of A', value: 1.5 / 0.07 },
      { key: 'cc', label: 'Cc of A', value: 0.35 ** 2 / (1.5 * 0.07) },
      { key: 'pi', label: 'A-line PI at LL 58', value: 0.73 * 38 },
    ],
    solution: () => {
      const A = uscs({ F200: 7, F4: 85, LL: 41, PL: 22, Cu: 1.5 / 0.07, Cc: 0.35 ** 2 / (1.5 * 0.07) })
      const B = uscs({ F200: 68, F4: 96, LL: 58, PL: 34 })
      return (
        <div className="text-sm space-y-2">
          {[A, B].map((u, i) => (
            <div key={i}>
              <b>
                Soil {'AB'[i]}: {u.symbol}, {u.name}
              </b>
              <ol className="list-decimal pl-5">
                {u.steps.map((s, j) => (
                  <li key={j}>
                    <Md>{s.text}</Md>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )
    },
  },
  {
    id: 'sm-own-class-3',
    paper: 'own',
    level: 'challenge',
    sec: 'A',
    no: '3',
    marks: 0,
    topics: ['sm-class'],
    title: 'Sieve analysis to both systems',
    text: 'Masses retained (g): No. 4 30, No. 10 55, No. 20 70, No. 40 85, No. 60 95, No. 100 80, No. 200 60, pan 45. Fines: LL 34, PL 25. Find % finer, D10, D30, D60, Cu, Cc and classify by USCS and AASHTO.',
    pages: [],
    checks: () => {
      const sa = sieveAnalysis(
        [4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.075].map((d, i) => ({ d, ret: [30, 55, 70, 85, 95, 80, 60][i] })),
        45,
      )
      const g = grading(sa.pts)
      return [
        { key: 'f200', label: '% finer No. 200', value: g.P200, unit: '%' },
        { key: 'D10', label: 'D10', value: g.D10, unit: 'mm', tol: 0.04 },
        { key: 'D60', label: 'D60', value: g.D60, unit: 'mm', tol: 0.04 },
        { key: 'cu', label: 'Cu', value: g.Cu, tol: 0.05 },
        { key: 'gi', label: 'AASHTO GI', value: aashto({ P10: g.P10, P40: g.P40, P200: g.P200, LL: 34, PI: 9 }).gi.gi, tol: 0 },
      ]
    },
    solution: () => {
      const sa = sieveAnalysis(
        [4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.075].map((d, i) => ({ d, ret: [30, 55, 70, 85, 95, 80, 60][i] })),
        45,
      )
      const g = grading(sa.pts)
      const u = uscs({ F200: g.P200, F4: g.P4, LL: 34, PL: 25, Cu: g.Cu, Cc: g.Cc })
      const a = aashto({ P10: g.P10, P40: g.P40, P200: g.P200, LL: 34, PI: 9 })
      return (
        <div className="text-sm space-y-1">
          <p>% finer: {sa.lines.map((l) => nf(l.pf, 4)).join(', ')}.</p>
          <GradingCurve curves={[{ pts: sa.pts }]} D={g} w={480} />
          <Tex block>{`D_{10} = ${nf(g.D10, 3)},\\ D_{30} = ${nf(g.D30, 3)},\\ D_{60} = ${nf(g.D60, 3)};\\ C_u = ${nf(g.Cu, 3)},\\ C_c = ${nf(g.Cc, 3)}`}</Tex>
          <p>
            USCS: <b>{u.symbol}</b>, {u.name}. AASHTO: <b>{a.label}</b> ({a.material.toLowerCase()}).
          </p>
        </div>
      )
    },
  },
]

const mod: SmTopicModule = {
  Overview,
  Approach,
  Lab: () => (
    <div className="space-y-6">
      <Section title="Classification lab" sub="Pick a past-paper soil or type your own sieve data. The curve marks D10, D30, D60; step through USCS (the chart pane highlights the Table 5.2 rows and the name chart) and AASHTO (left-to-right grid, Fig. 5.2, GI).">
        <ClassLab />
      </Section>
      <PickSection topic="sm-class" skills={CLASS_PICKS} />
      <ClassExams />
    </div>
  ),
  problems,
  theory: CLASS_THEORY,
}
export default mod
