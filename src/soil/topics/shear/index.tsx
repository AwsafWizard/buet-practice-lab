// Shear strength of soil (AJK sir, Topic 05): Mohr circle and pole, Mohr–Coulomb, direct shear, triaxial, unconfined.
import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { circle, failurePlane } from '../../engine/mohr'
import { circleArea, cuOC, deviatorWithAB, directShear, fitCircles, phiFromCircle, sigma3ForDeviator, skemptonNC, squareArea, strengthAt, triaxCircles, unconfined, vaneCu, bjerrum } from '../../engine/shear'
import { openSmRef } from '../../reference/pane'
import type { SmQ, SmTopicModule } from '../../types'
import { MohrFig, TauSigmaFig } from './figs'
import { ShearLabSections } from './Lab'
import { SHEAR_PICKS } from './picks'
import { SHEAR_NEW } from './notAsked'
import { ShearProblems } from './Problems'
import { SHEAR_THEORY } from './theory'

const f2 = (v: number) => fmt(v, 2)
const R = String.raw

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Shear strength of soil (Das Ch. 12, AJK sir Topic 05)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-shear" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{R`\tau_f = c + \sigma\tan\varphi,\qquad \tau_f = c' + \sigma'\tan\varphi',\qquad \sigma' = \sigma - u`}</Tex>
            <Tex block>{R`\sigma_\theta = \tfrac{\sigma_1+\sigma_3}{2} + \tfrac{\sigma_1-\sigma_3}{2}\cos 2\theta,\quad \tau_\theta = \tfrac{\sigma_1-\sigma_3}{2}\sin 2\theta`}</Tex>
            <Tex block>{R`\sin\varphi = \frac{R}{\sigma_3 + R}\ (c=0),\quad \theta_f = 45 + \frac{\varphi}{2},\quad c_u = \frac{q_u}{2},\quad A = \frac{A_0}{1-\varepsilon}`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **Pole method**: line from the pole parallel to a plane meets the circle at (σ, τ) on that plane; σ1 vertical → pole at (σ3, 0).
- **Direct shear**: σ = N/A, τ = T/A, straight line through the points (regression) → c, φ.
- **Triaxial**: CD (S, slow, valve open) → c′, φ′; CU (R) → c, φ and, with u, c′, φ′; UU (Q) → φu = 0, cu; unconfined σ3 = 0.
- **Envelope through circles**: one NC circle → sin φ = R/C; two → common tangent; three or more → p–q line (say which).
- Skempton's A and B, vane shear, β-chart and Skempton's 0.11 + 0.0037PI appear in papers but **not** in AJK sir's slides — solved here and flagged.`}</Md>
          </div>
        </div>
        <Callout kind="exam">
          <Md>{`**How it is asked (13 papers, ~45 numerical parts, ~18 theory parts):**
- **CU triaxial with pore pressure** on 2–3 specimens: total and effective c, φ by Mohr circles on graph paper, failure-plane angle, Af (2023-24 Q3(a) 26⅔ marks, 2021-22 Q7(c), 2020-21 Q8(b) "modified failure envelope", 2017-18 Q3(b), 2011-12, 2008-09).
- **CD direct shear** with loads in kg on 63.5 mm specimens → c′, φ′, "comment on the stress history" (2021-22, 2020-21, Jan 2021, 2017-18 peak and residual).
- **NC clay CU vs CD** → φ′, φcu, uf, Af (2021-22 Q5(d), 2017-18 Q4(b), Jan 2021 Q8(b)); CD failure-plane stresses (Jan 2021 Q7(c), AJK CD Problem 3).
- **Strength at a point** before/after a water-table rise or a structure (AJK Problem 3, 2008-09, 2015-16, 2009-10).
- **Theory**: qualitative curves (4 papers), UU behaviour + triaxial advantages, UU/CU/CD field cases with sketches, True/False on test procedure (2023-24).`}</Md>
        </Callout>
        <button className="btn mt-2" onClick={() => openSmRef('s-mohr')}>
          Open the Mohr / pole formula sheet ↗
        </button>
      </Section>
      <Section title="Flagged (in the papers, not in AJK sir's slides)">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <Md>{`**Skempton A and B**: Δu = B[Δσ3 + A(Δσ1 − Δσ3)] — 2012-13 Q3, 2020-21 Q7(d), Af in CU problems, B and Af curves.`}</Md>
          <Md>{`**Vane shear**: T = cu πD²(H/2 + D/6), 6T/(7πD³), Bjerrum λ — 2009-10, 2012-13, Jan 2021, 2021-22 Q7(d).`}</Md>
          <Md>{`**cu of OC clay**: Skempton (cu/σ′)NC = 0.11 + 0.0037PI or the K0–Af expression, × β from the printed β–OCR chart — 2017-18, Jan 2021, 2021-22.`}</Md>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function DecisionChart() {
  const box = 'rounded-lg border border-line p-2 text-xs'
  return (
    <div className="grid cq-md:grid-cols-4 gap-2">
      <div className={box}>
        <b>Direct shear</b>
        <div>σ = N/A, τ = T/A (kg × 9.81).</div>
        <div>Plot τ–σ; line → c, φ. Through the origin for sand.</div>
        <div>Circle tangent at a point if σ1, σ3 are asked.</div>
      </div>
      <div className={box}>
        <b>CD</b>
        <div>u = 0 → circles are effective.</div>
        <div>NC: c′ = 0, one circle gives φ′. Given φ′ → σ3 = R/sin φ − R.</div>
      </div>
      <div className={box}>
        <b>CU</b>
        <div>Total circles (σ3, σ3 + Δσ) → c, φ.</div>
        <div>Shift left by uf → c′, φ′. Af = uf/Δσf.</div>
        <div>No u given but CD on the twin → tangent → uf.</div>
      </div>
      <div className={box}>
        <b>UU / unconfined</b>
        <div>φu = 0, cu = Δσf/2.</div>
        <div>Unconfined: ε = ΔH/H, A = A0/(1 − ε), qu = P/A, cu = qu/2, consistency table.</div>
      </div>
    </div>
  )
}

function Approach() {
  // AJK sir's lecture examples, every number from the engines
  const cd3 = circle(172 + 227, 172)
  const phi3 = phiFromCircle(172, 227)
  const fp3 = failurePlane(cd3, phi3)
  const ds2 = directShear(
    [200, 300, 400, 500].map((n, i) => ({ N: n / 1000, T: [150, 220, 260, 335][i] / 1000 })),
    squareArea(60),
  )
  const cu1 = { s3: 150, dev: 160, u: 54 }
  const p3B = strengthAt({ z: 46, zw: 26, gamma: 120, gammaSat: 123, gw: 62.4 }, { c: 0, phi: 30 })
  const p3C = strengthAt({ z: 46, zw: 14, gamma: 120, gammaSat: 123, gw: 62.4 }, { c: 0, phi: 30 })
  const uc = unconfined(0.127, 0.8, 76, 38)
  return (
    <div>
      <Section title="Recipe for a triaxial / direct-shear numerical">
        <Steps>
          <Step n={1} title="Table">σ3, deviator, σ1 = σ3 + Δσ; for CU uf, σ′3 = σ3 − uf, σ′1 = σ1 − uf. Direct shear: σ = N/A, τ = T/A.</Step>
          <Step n={2} title="Circles">C = (σ1 + σ3)/2, R = Δσ/2 for each specimen (total and effective).</Step>
          <Step n={3} title="Envelope">NC one circle: sin φ = R/C. Two: sin φ = (R2 − R1)/(C2 − C1), c = (R1 − C1 sin φ)/cos φ. Three or more: p–q line. Say which, and draw it to scale.</Step>
          <Step n={4} title="Failure plane">θ = 45 + φ/2 from the major principal (horizontal) plane; σf = C − R sin φ, τf = R cos φ (or AJK sir's x = R cos(180 − 2θ)).</Step>
          <Step n={5} title="Write the equation">τf = c + σ tan φ (total) and τf = c′ + σ′ tan φ′ (effective); comment on NC/OC.</Step>
        </Steps>
      </Section>
      <Section title="Which test am I in?">
        <DecisionChart />
        <Callout kind="trap">
          <Md>{`- Subtracting u from the **deviator** — u shifts both σ1 and σ3; the radius stays the same.
- Negative uf (OC / compacted) **increases** σ′: σ′3 = σ3 − (−u).
- Failure plane measured from the wrong plane: 45 + φ/2 is from the **major** principal plane (horizontal in a triaxial test).
- "φu" in a CU question (2017-18, 2021-22, Jan 2021) means φcu (total), not the UU φu = 0.
- Unconfined: forgetting the area correction A0/(1 − ε); loads in N with areas in mm² (convert to kN and m²).
- Direct shear loads in **kg** → × 9.81 N.
- Treating the τ–σ point of a direct shear test as σ1 or σ3 — it is the tangent point.`}</Md>
        </Callout>
      </Section>
      <Section title="AJK sir's lecture examples, through the engines">
        <div className="grid cq-lg:grid-cols-2 gap-4 text-sm">
          <div>
            <b>CD Problem 3 (slides 48–49):</b> NC clay, σ3 = 172, Δσf = 227 kPa.
            <MohrFig circles={[{ c: cd3, color: 'var(--c-accent)' }]} envs={[{ env: { c: 0, phi: phi3 }, color: 'var(--c-bad)', label: `φ′ = ${f2(phi3)}°` }]} points={[{ s: fp3.sigma, t: fp3.tau, color: 'var(--c-bad)', label: `(${f2(fp3.sigma)}, ${f2(fp3.tau)})` }]} height={220} />
            <Tex block>{`\\varphi' = \\sin^{-1}\\frac{113.5}{172 + 113.5} = ${f2(phi3)}^\\circ,\\ 2\\theta = 90 + \\varphi' = ${f2(fp3.twoTheta)}^\\circ,\\ \\theta = ${f2(fp3.theta)}^\\circ`}</Tex>
            <Tex block>{`x = R\\cos(180 - 2\\theta) = ${f2(fp3.x)},\\ \\tau_f = ${f2(fp3.tau)},\\ \\sigma_f = 285.5 - x = ${f2(fp3.sigma)}\\ \\text{kPa}`}</Tex>
            <p className="text-xs text-faint">Slide: 23.42°, 56.71°, 45.11, 104.15, 240.39 (θ rounded first).</p>
          </div>
          <div>
            <b>DS Problem #02 (slides 30–31):</b> 60 × 60 mm, N = 200–500 N, T = 150, 220, 260, 335 N.
            <TauSigmaFig pts={ds2.pts} env={ds2.env} height={220} />
            <p>
              Trend line τ = {fmt(ds2.fit.a, 4)} + {fmt(ds2.fit.b, 4)}σ (R² = {fmt(ds2.fit.r2, 4)}) → φ = {f2(ds2.env.phi)}°, c = {f2(ds2.env.c)} kPa; boxed "τ = 9 + σ tan 31".
            </p>
          </div>
          <div>
            <b>CU Problem 1 (slides 52–53):</b> σ3 = 150, Δσ = 160, uf = 54 kPa.
            <p>
              Total: φ = sin⁻¹(80/230) = {f2(phiFromCircle(cu1.s3, cu1.dev))}°. Effective σ′3 = 96, σ′1 = 256: φ′ = sin⁻¹(80/176) = {f2(phiFromCircle(cu1.s3 - cu1.u, cu1.dev))}° — "Note: φ′ {'>'} φ".
            </p>
            <b>CD Problems 1–2:</b> φ′ = sin⁻¹(87.5/212.5) = {f2(phiFromCircle(125, 175))}°; σ3 = 62/sin 31° − 62 = {f2(sigma3ForDeviator(124, { c: 0, phi: 31 }))} kPa.
          </div>
          <div>
            <b>Problem #03 (slides 32–34), psf:</b> A is 46 ft deep; WT at B (20 ft above A) then C (32 ft above A).
            <p>
              WT at B: σ = {f2(p3B.sigma)}, u = {f2(p3B.u)}, σ′ = {f2(p3B.sigmaP)}, τ = {f2(p3B.tauf)} psf. WT at C: σ = {f2(p3C.sigma)}, u = {f2(p3C.u)}, σ′ = {f2(p3C.sigmaP)}, τ = {f2(p3C.tauf)} psf — the strength at A falls {fmt((1 - p3C.tauf / p3B.tauf) * 100, 1)} %.
            </p>
            <b>UC problem (slides 61–62):</b> ε = {f2(uc.eps * 100)} %, A = {fmt(uc.A, 6)} m² (the slide prints 0.00146 — slip; 0.001146 is used), σ1 = {f2(uc.qu)} kPa, cu = {f2(uc.cu)} kPa → {uc.consistency.toLowerCase()} clay.
          </div>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- practice problems
const problems: SmQ[] = [
  {
    id: 'sm-own-shear-1',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '1',
    marks: 0,
    topics: ['sm-shear'],
    title: 'CU with pore pressure, three specimens (2023-24 style, consistent data)',
    text: 'CU tests on a saturated clay: σ3 = 100, 200, 400 kPa; deviator at failure 172, 270, 466 kPa; uf = 38, 92, 196 kPa. Find total and effective c, φ (p–q least squares), Af of each specimen and the failure-plane angle.',
    pages: [],
    checks: () => {
      const tc = triaxCircles([
        { s3: 100, dev: 172, u: 38 },
        { s3: 200, dev: 270, u: 92 },
        { s3: 400, dev: 466, u: 196 },
      ])
      const t = fitCircles(tc.total),
        e = fitCircles(tc.eff!)
      return [
        { key: 'pt', label: 'φ (total)', value: t.phi, unit: '°' },
        { key: 'ct', label: 'c (total)', value: t.c, unit: 'kPa', tol: 0.05 },
        { key: 'pe', label: 'φ′', value: e.phi, unit: '°' },
        { key: 'ce', label: 'c′', value: e.c, unit: 'kPa', tol: 0.05 },
        { key: 'af', label: 'Af, specimen 3', value: tc.Af[2]!, tol: 0.03 },
      ]
    },
    solution: () => {
      const tc = triaxCircles([
        { s3: 100, dev: 172, u: 38 },
        { s3: 200, dev: 270, u: 92 },
        { s3: 400, dev: 466, u: 196 },
      ])
      const t = fitCircles(tc.total),
        e = fitCircles(tc.eff!)
      return (
        <div className="text-sm space-y-1">
          <MohrFig height={260} circles={[...tc.total.map((c) => ({ c, color: 'var(--c-accent)' })), ...tc.eff!.map((c) => ({ c, color: 'var(--c-accent2)', dash: true }))]} envs={[{ env: t, color: 'var(--c-accent)', label: `c = ${f2(t.c)}, φ = ${f2(t.phi)}°` }, { env: e, color: 'var(--c-accent2)', dash: true, label: `c′ = ${f2(e.c)}, φ′ = ${f2(e.phi)}°` }]} />
          <p>
            p–q points (total): {tc.total.map((c) => `(${f2(c.C)}, ${f2(c.R)})`).join(', ')} → q = {f2(t.a)} + p tan {f2(t.alpha)}° → φ = {f2(t.phi)}°, c = {f2(t.c)} kPa.
          </p>
          <p>
            Effective: {tc.eff!.map((c) => `(${f2(c.C)}, ${f2(c.R)})`).join(', ')} → q = {f2(e.a)} + p tan {f2(e.alpha)}° → φ′ = {f2(e.phi)}°, c′ = {f2(e.c)} kPa. Af = {tc.Af.map((a) => fmt(a!, 3)).join(', ')}. Failure planes at 45 + φ′/2 = {f2(45 + e.phi / 2)}° from the major principal plane.
          </p>
        </div>
      )
    },
  },
  {
    id: 'sm-own-shear-2',
    paper: 'own',
    level: 'warm-up',
    sec: 'A',
    no: '2',
    marks: 0,
    topics: ['sm-shear'],
    title: 'CD direct shear, loads in kg (2021-22 style)',
    text: 'CD direct shear on 63.5 mm diameter specimens: normal loads 10, 20, 40 kg; peak shear forces 92, 141, 240 N. Find c′, φ′ and comment on the stress history.',
    pages: [],
    checks: () => {
      const r = directShear([10, 20, 40].map((m, i) => ({ N: (m * 9.81) / 1000, T: [92, 141, 240][i] / 1000 })), circleArea(63.5))
      return [
        { key: 'c', label: 'c′', value: r.env.c, unit: 'kPa', tol: 0.05 },
        { key: 'p', label: 'φ′', value: r.env.phi, unit: '°' },
      ]
    },
    solution: () => {
      const r = directShear([10, 20, 40].map((m, i) => ({ N: (m * 9.81) / 1000, T: [92, 141, 240][i] / 1000 })), circleArea(63.5))
      return (
        <div className="text-sm space-y-1">
          <TauSigmaFig pts={r.pts} env={r.env} />
          <p>
            A = π(63.5)²/4 = {fmt(circleArea(63.5) * 1e6, 1)} mm². σ = {r.pts.map((p) => f2(p.sigma)).join(', ')} kPa; τ = {r.pts.map((p) => f2(p.tau)).join(', ')} kPa. Line: c′ = <b>{f2(r.env.c)} kPa</b>, φ′ = <b>{f2(r.env.phi)}°</b>. A clear c′ → overconsolidated clay.
          </p>
        </div>
      )
    },
  },
  {
    id: 'sm-own-shear-3',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '3',
    marks: 0,
    topics: ['sm-shear'],
    flag: "Skempton's B and Af — not in AJK sir's slides this term.",
    title: 'Undrained cell increase then shear with B and Af (2020-21 Q7(d) style)',
    text: 'An NC clay consolidated at 200 kPa (u = 0); the cell pressure is raised undrained to 280 kPa, then the deviator is increased to failure. B = 0.97, Af = 0.6, φ′ = 28°, c′ = 0. Find the deviator and the pore pressure at failure.',
    pages: [],
    checks: () => {
      const r = deviatorWithAB({ s3c: 200, s3: 280, B: 0.97, Af: 0.6, env: { c: 0, phi: 28 } })
      return [
        { key: 'du', label: 'Δu from the cell increase', value: r.du1, unit: 'kPa' },
        { key: 'D', label: 'deviator at failure', value: r.D, unit: 'kPa' },
        { key: 'u', label: 'uf', value: r.uf, unit: 'kPa' },
      ]
    },
    solution: () => {
      const r = deviatorWithAB({ s3c: 200, s3: 280, B: 0.97, Af: 0.6, env: { c: 0, phi: 28 } })
      const Kp = Math.tan(((45 + 14) * Math.PI) / 180) ** 2
      return (
        <div className="text-sm space-y-1">
          <Tex block>{`\\Delta u_1 = B\\Delta\\sigma_3 = 0.97(80) = ${f2(r.du1)};\\quad \\Delta u_2 = BA_fD = ${fmt(0.97 * 0.6, 3)}D`}</Tex>
          <Tex block>{`\\sigma'_3 = 280 - ${f2(r.du1)} - ${fmt(0.97 * 0.6, 3)}D,\\quad \\sigma'_1 = \\sigma'_3 + D = \\sigma'_3K_p,\\ K_p = ${fmt(Kp, 4)}`}</Tex>
          <Tex block>{`D = \\frac{${f2(280 - r.du1)}(${fmt(Kp - 1, 4)})}{1 + ${fmt(0.97 * 0.6, 3)}(${fmt(Kp - 1, 4)})} = ${f2(r.D)}\\ \\text{kPa},\\quad u_f = ${f2(r.uf)}\\ \\text{kPa}`}</Tex>
        </div>
      )
    },
  },
  {
    id: 'sm-own-shear-4',
    paper: 'own',
    level: 'challenge',
    sec: 'A',
    no: '4',
    marks: 0,
    topics: ['sm-shear'],
    flag: 'Vane shear, Skempton’s correlation and the β chart — not in AJK sir’s slides this term.',
    title: 'Vane, Bjerrum and the β chart (2021-22 Q7(d) + Q8(a) style)',
    text: 'A 50 × 100 mm vane at the bottom of a borehole (one end shears) failed at 12 N·m in a clay with LL = 62, PL = 28. (a) In-situ and design cu. (b) The same clay at 9 m: WT at ground, γsat = 19.5 kN/m³, σ′c = 420 kPa. Estimate cu with Skempton’s (cu/σ′)NC and the average β curve.',
    pages: [],
    checks: () => {
      const v = vaneCu(0.012, 0.05, 0.1, 1)
      const o = cuOC({ z: 9, gammaSat: 19.5, pc: 420, ratioNC: skemptonNC(34) })
      return [
        { key: 'v', label: 'cu (vane)', value: v.cu, unit: 'kPa' },
        { key: 'd', label: 'design cu (Bjerrum)', value: v.cu * bjerrum(34), unit: 'kPa' },
        { key: 'ocr', label: 'OCR', value: o.OCR },
        { key: 'cu', label: 'cu from β (average curve)', value: o.cu, unit: 'kPa', tol: 0.05 },
      ]
    },
    solution: () => {
      const v = vaneCu(0.012, 0.05, 0.1, 1)
      const o = cuOC({ z: 9, gammaSat: 19.5, pc: 420, ratioNC: skemptonNC(34) })
      return (
        <div className="text-sm space-y-1">
          <Tex block>{`T = c_u\\pi D^2\\left(\\frac{H}{2} + \\frac{D}{12}\\right) \\Rightarrow c_u = \\frac{0.012}{\\pi(0.05)^2(0.05 + 0.00417)} = ${f2(v.cu)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`PI = 34,\\ \\lambda = 1.7 - 0.54\\log 34 = ${fmt(bjerrum(34), 3)},\\ c_{u,design} = ${f2(v.cu * bjerrum(34))}\\ \\text{kPa}`}</Tex>
          <Tex block>{`\\sigma'_0 = 9(19.5 - 9.81) = ${f2(o.sv)},\\ OCR = ${f2(o.OCR)},\\ (c_u/\\sigma')_{NC} = 0.11 + 0.0037(34) = ${fmt(skemptonNC(34), 4)}`}</Tex>
          <Tex block>{`\\beta(${f2(o.OCR)}) \\approx ${f2(o.beta)} \\Rightarrow c_u = ${f2(o.beta)} \\times ${fmt(skemptonNC(34), 4)} \\times ${f2(o.sv)} = ${f2(o.cu)}\\ \\text{kPa}`}</Tex>
          <p className="text-xs text-faint">Ladd's OCR^0.8 would give {f2(o.ladd)} kPa. Quote the band from the lower and upper curves too.</p>
        </div>
      )
    },
  },
  ...SHEAR_NEW,
]

const mod: SmTopicModule = {
  Overview,
  Approach,
  Lab: () => (
    <div className="space-y-6">
      <ShearLabSections />
      <PickSection topic="sm-shear" skills={SHEAR_PICKS} />
      <ShearProblems />
    </div>
  ),
  problems,
  theory: SHEAR_THEORY,
}
export default mod
