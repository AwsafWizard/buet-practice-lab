// Lateral earth pressure (AJK sir, Topic 06): at rest, Rankine active and passive, crack, layers, water, surcharge.
import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { coulomb, K0, Ka, solveWall, trialWedge, type Wall } from '../../engine/earth'
import { openSmRef } from '../../reference/pane'
import type { SmQ, SmTopicModule } from '../../types'
import { WallFig } from './figs'
import { toWall } from './gen'
import { LepLabSections } from './Lab'
import { LEP_PICKS } from './picks'
import { LepProblems } from './Problems'
import { WallSolution } from './Solution'
import { LEP_THEORY } from './theory'

const f2 = (v: number) => fmt(v, 2)
const R = String.raw

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Lateral earth pressure (Das Ch. 13, AJK sir Topic 06)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-lep" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{R`\sigma'_h = K\sigma'_v,\qquad K_a = \tan^2(45-\varphi'/2),\quad K_p = \tan^2(45+\varphi'/2),\quad K_0 = 1-\sin\varphi'`}</Tex>
            <Tex block>{R`\sigma'_a = \sigma'_0K_a - 2c'\sqrt{K_a},\qquad \sigma'_p = \sigma'_0K_p + 2c'\sqrt{K_p}`}</Tex>
            <Tex block>{R`z_c = \frac{2c'/\sqrt{K_a} - q}{\gamma},\quad H_c = \frac{4c}{\gamma\sqrt{K_a}},\quad P_a^{\text{after}} = \tfrac12(H-z_c)(\gamma HK_a - 2c'\sqrt{K_a})`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **Water separately** (K = 1), surcharge as a rectangle qK, each layer's K just above and just below an interface.
- Cut each diagram into rectangles and triangles → force, arm **above the base**, moment. Passive soil in front is **subtracted**.
- Answer = diagrams drawn to scale + pieces table + Fs, M_OT (and z̄ = M/F when asked).
- Only AJK sir's at-rest and Rankine material is in the slides; Coulomb, Culmann, sloping backfill, wall loads and sheet piles appear in older papers and are **flagged**.`}</Md>
          </div>
        </div>
        <Callout kind="exam">
          <Md>{`**How it is asked (13 papers, ~21 numericals, 14 theory parts):**
- **Every modern paper** has one wall numerical worth 12–30 marks: c′–φ′ fill with q and a WT inside the fill (2023-24 Q2(a), 30 marks); two layers with the WT at the interface, active (2020-21 Q8(c)) or passive (Jan 2021 Q8(c), 2017-18 Q3(d)), then "add a surcharge — by how much does the force increase?"; undrained clay φ = 0: crack depth, unsupported height, force before / after cracking (2021-22 Q8(c), 2020-21 Q7(b), Jan 2021 Q8(a), 2017-18 Q2(d)).
- **At-rest basement walls** with two layers and OCR (2012-13 Q7, 2016-17 Q8) — Mayne–Kulhawy K0.
- **Theory**: pressure vs wall tilt (4 papers), principal/failure planes in each state (2023-24), Rankine derivation with c and the crack (5 papers), K0 factors.`}</Md>
        </Callout>
        <button className="btn mt-2" onClick={() => openSmRef('e-rankine')}>
          Open the Rankine formula sheet ↗
        </button>
      </Section>
      <Section title="Flagged (older papers, outside AJK sir's slides)">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <Md>{`**Coulomb / Culmann** (2008-09, 2012-13, 2015-16, 2020-21, Jan 2021, 2021-22): wall friction δ, trial wedges. With δ = 0 and a level fill they reproduce Rankine.`}</Md>
          <Md>{`**Sloping backfill** (2007-08, 2010-11) and **sheet-pile embedment** by force balance (2009-10 Q4(b)).`}</Md>
          <Md>{`**Point / line loads behind a wall** (2007-08, 2009-10, 2010-11, 2015-16): Terzaghi–Spangler modified Boussinesq formulas (printed with the question).`}</Md>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function DecisionChart() {
  const box = 'rounded-lg border border-line p-2 text-xs'
  return (
    <div className="grid cq-md:grid-cols-3 gap-2">
      <div className={box}>
        <b>Does the wall move?</b>
        <div>No (basement, abutment, propped) → <b>K0</b> (which formula: loose sand Jaky, compacted Sherif, OC Mayne–Kulhawy, NC clay Massarsch, OC clay ×√OCR)</div>
        <div>Away from the fill → <b>Ka</b> · Pushed into the fill / soil in front → <b>Kp</b></div>
      </div>
      <div className={box}>
        <b>Is there c′ or cu?</b>
        <div>No → triangle(s) + rectangles; no crack.</div>
        <div>Yes, active → check the top: qKa − 2c√Ka {'<'} 0 → crack to zc, drop the tension zone (design). φ = 0 → Ka = 1.</div>
        <div>Yes, passive → +2c√Kp rectangle, no crack.</div>
      </div>
      <div className={box}>
        <b>Water? Layers? q?</b>
        <div>WT → γ′ below it for σ′0, plus u = 9.81hw (K = 1).</div>
        <div>Layers → K changes, compute twice at the interface.</div>
        <div>q → qK rectangle in every layer (and it shrinks zc).</div>
        <div>φ = 0 total-stress clay → γsat, no separate water.</div>
      </div>
    </div>
  )
}

function Approach() {
  const w3: Wall = toWall({ state: 'active', layers: [{ h: 5, gamma: 16, gammaSat: 16, phi: 30, c: 0, total: false, k0f: 'jaky', OCR: 1, PI: 20, gd: 16, gdMin: 15 }], wt: true, zw: 2, q: 10, front: true, D: 2, fGamma: 16, fPhi: 30, fC: 0 })
  const r3 = solveWall(w3)
  const w5: Wall = { state: 'active', layers: [{ h: 6, gamma: 16, gammaSat: 18, phi: 35, c: 10 }], zw: 2, q: 20 }
  const r5 = solveWall(w5)
  return (
    <div>
      <Section title="Recipe (handnote §5, 11 steps)">
        <Steps>
          <Step n={1} title="Sketch">Wall, H, WT, layer boundaries, q, passive soil in front.</Step>
          <Step n={2} title="K for each layer">Ka = tan²(45 − φ′/2), Kp = tan²(45 + φ′/2) or the right K0 formula.</Step>
          <Step n={3} title="Key depths">Top, each interface, the WT, the base.</Step>
          <Step n={4} title="σ′0 at each key depth">q + γh above the WT, + γ′h below (γ′ = γsat − 9.81).</Step>
          <Step n={5} title="Soil pressure σ′0K ∓ 2c′√K">Twice at an interface (upper K just above, lower K just below).</Step>
          <Step n={6} title="Water u = 9.81 hw">K = 1 — never multiply water by Ka.</Step>
          <Step n={7} title="Surcharge qK">A rectangle over each layer's height.</Step>
          <Step n={8} title="Crack?">Negative at the top → zc; design force drops the tension zone (larger).</Step>
          <Step n={9} title="Pieces">Rectangle b·h at h/2, triangle ½b·h at h/3 above its own bottom; arm = height of the bottom above the base + that.</Step>
          <Step n={10} title="Fs = ΣF − Pp, MOT = ΣF·arm − Pp·armp" />
          <Step n={11} title="z̄ = MOT/Fs">Draw the diagrams to scale with every ordinate written.</Step>
        </Steps>
      </Section>
      <Section title="Which case am I in?">
        <DecisionChart />
        <Callout kind="trap">
          <Md>{`- Multiplying **water by Ka**, or using γsat (not γ′) with Ka below the WT.
- One Ka for two layers — compute the pressure twice at the interface.
- Surcharge drawn as a triangle, or forgotten in the lower layer.
- Including the **negative zone** in the design force after the crack; or forgetting that q shrinks zc: zc = (2c/√Ka − q)/γ.
- Adding the passive force instead of subtracting it; arms measured from the top.
- Active failure plane 45 + φ′/2 (steep) vs passive 45 − φ′/2 to the horizontal.
- Jaky's K0 for compacted or OC soil (underestimates). Slide 4's "K0 ≤ 1" holds for NC sand only.`}</Md>
        </Callout>
      </Section>
      <Section title="Lecture Problem #03 + passive side (slides 15, 23), stepped through" sub={`H = 5 m, φ′ = 30°, γ = 16, WT at 2 m, q = 10 kPa, 2 m of the same sand in front. Slides: Fs = 16.77 kN/m, M_OT = 118.25 kN·m/m (the 118.25 carries a rounding slip from Problem #02's 140.62; exact ${f2(r3.MOT)}).`}>
        <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto mb-3">
          <div className="min-w-[640px]">
            <WallFig w={w3} r={r3} />
          </div>
        </div>
        <WallSolution w={w3} r={r3} />
      </Section>
      <Section title="2023-24 Q2(a), the latest paper's wall (30 marks)" sub="H = 6 m, WT at 2 m, γ = 16 / 18, φ′ = 35°, c′ = 10, q = 20 kPa: c′ makes a crack even with the surcharge.">
        <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto mb-3">
          <div className="min-w-[640px]">
            <WallFig w={w5} r={r5} />
          </div>
        </div>
        <WallSolution w={w5} r={r5} />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- practice problems
function wallQ(o: { n: string; level: SmQ['level']; title: string; text: string; w: Wall; flag?: string }): SmQ {
  const run = () => solveWall(o.w)
  return {
    id: `sm-own-lep-${o.n}`,
    paper: 'own',
    level: o.level,
    sec: 'A',
    no: o.n,
    marks: 0,
    topics: ['sm-lep'],
    title: o.title,
    text: o.text,
    pages: [],
    flag: o.flag,
    figure: () => <WallFig w={o.w} r={null} showDiagrams={false} width={460} />,
    checks: () => {
      const r = run()
      return [
        ...(r.zc !== null ? [{ key: 'zc', label: 'crack depth zc', value: r.zc, unit: 'm' }] : []),
        { key: 'fs', label: o.w.state === 'passive' ? 'total passive force' : 'sliding force (design)', value: r.Fs, unit: 'kN/m' },
        { key: 'm', label: 'moment about the base', value: r.MOT, unit: 'kN·m/m' },
        { key: 'z', label: 'z̄ above the base', value: r.zbar, unit: 'm' },
      ]
    },
    solution: () => {
      const r = run()
      return (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <WallFig w={o.w} r={r} />
            </div>
          </div>
          <WallSolution w={o.w} r={r} />
        </div>
      )
    },
  }
}

const problems: SmQ[] = [
  wallQ({
    n: '1',
    level: 'exam',
    title: 'c′–φ′ fill, surcharge, WT inside the fill (2023-24 style)',
    text: 'A 7 m wall retains a fill with φ′ = 30°, c′ = 8 kN/m², γ = 17 kN/m³ above the water table (2.5 m below the top) and 19.5 kN/m³ below it. Surcharge 15 kN/m². Draw the active and water pressure diagrams, find the crack depth, the sliding force and the overturning moment about the base (after cracking), and the resultant location.',
    w: { state: 'active', layers: [{ h: 7, gamma: 17, gammaSat: 19.5, phi: 30, c: 8 }], zw: 2.5, q: 15 },
  }),
  wallQ({
    n: '2',
    level: 'exam',
    title: 'Basement wall, at rest, clay over OC sand (2016-17 style)',
    text: `A rigid basement wall retains 2 m of NC clay (γ = 17 kN/m³, PI = 25, K0 by Massarsch) over 4 m of sand (γsat = 19 kN/m³, φ′ = 34°, OCR = 2.5, K0 by Mayne–Kulhawy). The WT is at the interface. Find the total thrust and its location.`,
    w: { state: 'rest', layers: [{ h: 2, gamma: 17, phi: 0, c: 0, K0: K0.massarsch(25) }, { h: 4, gamma: 19, gammaSat: 19, phi: 34, c: 0, K0: K0.mayne(34, 2.5) }], zw: 2, q: 0 },
  }),
  wallQ({
    n: '3',
    level: 'challenge',
    title: 'Passive, two layers, WT and surcharge (Jan 2021 style)',
    text: 'Rankine passive state on a 7 m wall: top 3 m γ = 17 kN/m³, c′ = 0, φ′ = 32°; WT at 3 m; lower 4 m γsat = 20 kN/m³, c′ = 20 kN/m², φ′ = 25°; surcharge 15 kN/m². Find the total passive force and its location.',
    w: { state: 'passive', layers: [{ h: 3, gamma: 17, phi: 32, c: 0 }, { h: 4, gamma: 20, phi: 25, c: 20 }], zw: 3, q: 15 },
  }),
  {
    id: 'sm-own-lep-4',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '4',
    marks: 0,
    topics: ['sm-lep'],
    title: 'Coulomb vs Rankine vs trial wedge (2008-09 / 2012-13 style)',
    flag: "Coulomb's theory and Culmann's method — not in AJK sir's slides this term.",
    text: 'A 6 m vertical wall retains dry sand, γ = 18 kN/m³, φ = 34°, wall friction δ = 20°, level backfill. Find the active thrust by (a) Rankine (δ ignored), (b) Coulomb, (c) a trial-wedge (Culmann) search, and the critical plane angle.',
    pages: [],
    checks: () => {
      const tw = trialWedge({ H: 6, gamma: 18, phi: 34, delta: 20, state: 'active', step: 0.01 })
      return [
        { key: 'r', label: 'Rankine Pa', value: 0.5 * 18 * 36 * Ka(34), unit: 'kN/m' },
        { key: 'c', label: 'Coulomb Pa', value: 0.5 * 18 * 36 * coulomb(34, 20).ka, unit: 'kN/m' },
        { key: 'rho', label: 'critical plane (deg to horizontal)', value: tw.rho, unit: '°', tol: 0.01 },
      ]
    },
    solution: () => {
      const ka = Ka(34),
        kc = coulomb(34, 20).ka
      const tw = trialWedge({ H: 6, gamma: 18, phi: 34, delta: 20, state: 'active', step: 0.01 })
      return (
        <div className="text-sm space-y-1">
          <Tex block>{`(a)\\ K_a = \\tan^2 28^\\circ = ${fmt(ka, 4)},\\quad P_a = \\tfrac12(18)(6^2)(${fmt(ka, 4)}) = ${f2(0.5 * 18 * 36 * ka)}\\ \\text{kN/m (horizontal)}`}</Tex>
          <Tex block>{`(b)\\ K_a^{C} = \\frac{\\cos^2 34}{\\cos 20\\,[1 + \\sqrt{\\sin 54\\sin 34/\\cos 20}]^2} = ${fmt(kc, 4)},\\quad P_a = ${f2(0.5 * 18 * 36 * kc)}\\ \\text{kN/m at } 20^\\circ`}</Tex>
          <p>
            (c) Trial wedges from the heel: W = ½γH² cot ρ, P = W sin(ρ − φ)/cos(ρ − φ − δ). The maximum is P = {f2(tw.P)} kN/m at ρ = {fmt(tw.rho, 1)}° (horizontal component {f2(tw.Ph)}, vertical {f2(tw.Pv)} kN/m) — the same as Coulomb. Wall friction lowers Ka and tilts the thrust.
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
      <LepLabSections />
      <PickSection topic="sm-lep" skills={LEP_PICKS} />
      <LepProblems />
    </div>
  ),
  problems,
  theory: LEP_THEORY,
}
export default mod
