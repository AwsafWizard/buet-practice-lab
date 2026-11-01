import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { RcFrequency } from '../../components/Frequency'
import { bwdRequired, designShear, layoutRun, shearAt, shearLimits, type ShearBeam, type ShearSection } from '../../engine/shear'
import type { Check, RcQ, RcTopicModule } from '../../types'
import { CaseChart } from './figs'
import { ShearDesignProblems } from './DesignProblems'
import { ShearLab } from './Lab'
import { layoutText, ShearSolution } from './Solution'
import { SHEAR_THEORY } from './theory'

const f2 = (v: number) => fmt(v, 2)

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Shear & diagonal tension (Nilson Ch 5)" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic="rc-shear" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`V_u \\le \\phi V_n = \\phi(V_c + V_s),\\quad \\phi = 0.75`}</Tex>
            <Tex block>{`V_c = 2\\lambda\\sqrt{f'_c}\\,b_wd\\ \\ (\\sqrt{f'_c} \\le 100\\text{ psi})`}</Tex>
            <Tex block>{`\\frac{A_v}{s} = \\max\\left[\\frac{V_u - \\phi V_c}{\\phi f_yd},\\ \\frac{0.75\\sqrt{f'_c}b_w}{f_y},\\ \\frac{50b_w}{f_y}\\right]`}</Tex>
            <Tex block>{`s_{\\max} = \\min(d/2,\\,24'')\\ \\text{or}\\ \\min(d/4,\\,12'')\\ \\text{if}\\ V_s > 4\\sqrt{f'_c}b_wd`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **Vu at d** from the support face (unless a point load is within d).
- **Case A** Vu ≤ φVc/2 → none · **B** ≤ φVc → Av,min · **C** Vs ≤ 4√f'c bw d → s ≤ d/2 · **D** Vs ≤ 8√f'c bw d → s ≤ d/4 · beyond → **redesign**.
- #3 two-legged stirrups (Av = 0.22 in²) unless told; practical minimum spacing 3 in.
- Answer = SFD with φVc and φVc/2 lines, the case for each zone, spacings, and a **neat layout sketch** ("1 @ 2 in, 7 @ 5 in, …").`}</Md>
          </div>
        </div>
        <Callout kind="exam">
          Every modern paper has one 20–26 mark stirrup design: a simply supported 30–36 ft beam with two symmetric factored point loads (or one at midspan) plus 2 k/ft, b = 12–14 in, d = 24–26 in, "design the stirrups with **3 sets of spacing** and show them in a neat sketch" (2023-24 Q5(c), 2021-22 Q3(a), 2020-21 Q6(b), Jan 2021 Q11(a), 2016-17, 2015-16, 2014-15, 2013-14). Older papers add cantilevers (2006-07, 2011-12), overhangs (2005-06, 2004-05), sizing b × d from shear limits (2008-09) and theory: s_max rules, critical section at d, seismic hoops, forces at a diagonal crack.
        </Callout>
      </Section>
      <Section title="What changes between the papers">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <Md>{`**Self-weight.** "2 k/ft (including self-wt)" → use as given. "(excluding self-wt)" (2023-24) → assume h ≈ d + 3 in and add 1.2 × self-weight.`}</Md>
          <Md>{`**Point loads.** Vu drops by P at each load. Between two symmetric loads Vu is small, often below φVc/2 → no stirrups needed there (nominal ones at s_max are good practice).`}</Md>
          <Md>{`**Older papers.** φ = 0.85 and 1.4D + 1.7L before ACI 318-02; Grade-40 stirrups (fyt = 40 ksi, 2009-10). Solve as asked, note the change.`}</Md>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Approach() {
  const sec10 = { bw: 10, d: 20, fc: 4000, fy: 60000 }
  const lim = shearLimits(sec10)
  const six = [16, 30, 60, 100, 160, 190].map((Pu) => ({ Pu, a: shearAt(Pu / 2, sec10) }))
  const exBm: ShearBeam = { kind: 'ss', L: 20, wD: 9.4, factored: true }
  const exSec: ShearSection = { bw: 16, d: 22, fc: 4000, fy: 60000 }
  const ex = designShear(exBm, exSec)
  const bookLay = layoutRun(ex.runs.find((r) => r.id === 'sL')!, [5, 7, 11])
  const layouts = { sL: bookLay, sR: layoutRun(ex.runs.find((r) => r.id === 'sR')!, [5, 7, 11]) }
  return (
    <div>
      <Section title="Recipe (class slides 47–50, handwritten steps i–vii)">
        <Steps>
          <Step n={1} title="Loads → SFD">Factored wu and Pu (add 1.2 × self-weight if excluded). Reactions, the shear at every load point, and Vu at d from the face: V<sub>u,d</sub> = V<sub>face</sub> − w<sub>u</sub>·d.</Step>
          <Step n={2} title="φVc, φVc/2, φ4√f′c bd, φ8√f′c bd">Draw φVc and φVc/2 on the SFD. If Vu,d &gt; φ10√f′c·bd → redesign.</Step>
          <Step n={3} title="Locate zone boundaries">Where Vu = φVc and Vu = φVc/2 (similar triangles: x = (L/2)(V<sub>face</sub> − V*)/V<sub>face</sub> for a UDL), and the jumps at point loads.</Step>
          <Step n={4} title="φVs = Vu − φVc → Case A/B/C/D" />
          <Step n={5} title="Av/s = max(3 terms)">Excess term with fy in ksi and Vu in kip; minimum terms with √f′c and fy in psi. "Max value will govern."</Step>
          <Step n={6} title="s = Av/(Av/s); final s = min(s, d/2, 24) [Case D: d/4, 12]">Round down (whole or ½ in). If s &lt; 3 in, go to #4 or 4 legs.</Step>
          <Step n={7} title="3 sets of spacing + sketch">s at d near the support, an intermediate spacing, then s_max; each zone ends where the next spacing is enough. First stirrup at s/2 (or 2 in). Count stirrups, mirror about midspan, draw the elevation.</Step>
        </Steps>
      </Section>
      <Section title="Which case am I in?">
        <CaseChart />
        <Callout kind="trap">
          <Md>{`- Forgetting **φ** in the case limits: compare φVs with **φ**4√f'c·bd (the class slides drop it in places).
- Using **fy = 60** (ksi) in the minimum-steel terms: those need **60 000 psi** and √f'c in psi.
- Taking Vu at the face when it should be at d — or at d when a point load sits inside d.
- Rounding s **up**, or forgetting s_max = d/2 in Case B (min steel gives a large s like 26 in).
- Stopping stirrups at the φVc point: minimum steel is needed until Vu = φVc/2.
- No sketch — the layout sketch carries marks.`}</Md>
        </Callout>
      </Section>
      <Section title="Class example: midspan Pu, b = 10 in, d = 20 in, f′c = 4 ksi, #3 two-legged" sub={`φVc = ${f2(lim.phiVc)} k, φVc/2 = ${f2(lim.halfPhiVc)} k, φ4√f′c bd = ${f2(lim.phiVs4)} k, φ8√f′c bd = ${f2(lim.phiVs8)} k, Vu,max = ${f2(lim.VuMax)} k`}>
        <table className="tbl w-auto text-sm">
          <thead>
            <tr>
              <th>Pu (k)</th>
              <th>Vu = Pu/2</th>
              <th>φVs</th>
              <th>Case</th>
              <th>Av/s</th>
              <th>s calc (in)</th>
              <th>s_max</th>
              <th>design</th>
            </tr>
          </thead>
          <tbody>
            {six.map(({ Pu, a }) => (
              <tr key={Pu}>
                <td>{Pu}</td>
                <td>{f2(a.Vu)}</td>
                <td>{a.case === 'A' || a.case === 'B' ? '—' : f2(a.phiVs)}</td>
                <td>{a.case}</td>
                <td>{a.avs ? fmt(a.avs, 4) : '—'}</td>
                <td>{Number.isFinite(a.sCalc) ? f2(a.sCalc) : '—'}</td>
                <td>{Number.isFinite(a.sMax) && a.case !== 'redesign' ? f2(a.sMax) : '—'}</td>
                <td className="txt">{a.case === 'A' ? 'no stirrups' : a.case === 'redesign' ? 'redesign section' : `#3 @ ${fmt(Math.floor(a.s * 2) / 2, 1)} in`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-faint mt-1">The handwritten sheet rounds Av/s first (18.3 and 6.47 in instead of 18.0 and 6.38): both accepted.</p>
      </Section>
      <Section title="Nilson Ex 5.2 / 5.3, stepped through" sub="16 × 22 in, 20 ft clear span, wu = 9.4 k/ft, f′c = 4 ksi, #3 U stirrups — book pattern 2 in + 7 @ 5 + 2 @ 7 + 4 @ 11">
        <ShearSolution bm={exBm} sec={exSec} dsg={ex} layouts={layouts} />
        <p className="text-sm mt-2">
          Book layout per half-span: {layoutText(bookLay)}. The engine's own 3-set choice: {layoutText(ex.layouts.sL)}.
        </p>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
function designQ(o: { id: string; level: RcQ['level']; title: string; text: string; bm: ShearBeam; sec: ShearSection; nominal?: boolean; extra?: (d: ReturnType<typeof designShear>) => Check[] }): RcQ {
  const run = () => designShear(o.bm, o.sec, { nominal: o.nominal })
  return {
    id: `rc-own-shear-${o.id}`,
    paper: 'own',
    level: o.level,
    sec: 'B',
    no: o.id,
    marks: 0,
    topics: ['rc-shear'],
    title: o.title,
    text: o.text,
    pages: [],
    checks: () => {
      const d = run()
      const r = d.runs.find((x) => x.id === 'sL' || x.id === 'c')!
      const a = shearAt(r.Vd, o.sec)
      return [
        { key: 'vd', label: 'Vu at d', value: r.Vd, unit: 'k' },
        { key: 'pvc', label: 'φVc', value: d.lim.phiVc, unit: 'k' },
        ...(Number.isFinite(a.s) ? [{ key: 's', label: 'required s at d', value: a.s, unit: 'in' }] : []),
        ...(r.uHalf !== null ? [{ key: 'xh', label: 'stirrups needed up to (ft from face)', value: r.uHalf / 12, unit: 'ft', tol: 0.03 }] : []),
        ...(o.extra?.(d) ?? []),
      ]
    },
    solution: () => <ShearSolution bm={o.bm} sec={o.sec} dsg={run()} />,
  }
}

const problems: RcQ[] = [
  {
    id: 'rc-own-shear-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'B',
    no: '1',
    marks: 0,
    topics: ['rc-shear'],
    title: 'Size a beam from the shear limits (2008-09 style)',
    text: 'Maximum factored shear Vu = 45 k, f′c = 4000 psi, fy = 60 ksi, d = 2b, Vc = 2√f′c bw d. Find the required b × d (a) with no web reinforcement, (b) with minimum web reinforcement only. Give b (in, before rounding).',
    pages: [],
    checks: () => [
      { key: 'a', label: '(a) b with no stirrups', value: Math.sqrt(bwdRequired(45, 4000) / 2), unit: 'in' },
      { key: 'b', label: '(b) b with Av,min', value: Math.sqrt(bwdRequired(45, 4000, { withMin: true }) / 2), unit: 'in' },
    ],
    solution: () => {
      const A = bwdRequired(45, 4000),
        B = bwdRequired(45, 4000, { withMin: true })
      return (
        <div className="text-sm space-y-1">
          <Tex block>{`(a)\\ V_u \\le \\tfrac12\\phi(2\\sqrt{f'_c}b_wd) \\Rightarrow b_wd \\ge \\frac{45000}{0.5(0.75)(2)(63.25)} = ${f2(A)}\\ \\text{in}^2 = 2b^2 \\Rightarrow b = ${f2(Math.sqrt(A / 2))}\\ \\text{in}`}</Tex>
          <Tex block>{`(b)\\ V_u \\le \\phi(2\\sqrt{f'_c}b_wd) \\Rightarrow b_wd \\ge ${f2(B)}\\ \\text{in}^2 \\Rightarrow b = ${f2(Math.sqrt(B / 2))}\\ \\text{in}`}</Tex>
          <p>Round up to whole inches (e.g. (a) {Math.ceil(Math.sqrt(A / 2))} × {2 * Math.ceil(Math.sqrt(A / 2))} in, (b) {Math.ceil(Math.sqrt(B / 2))} × {2 * Math.ceil(Math.sqrt(B / 2))} in). With stirrups giving Vs = 2Vc the requirement drops to Vu ≤ φ(3Vc).</p>
        </div>
      )
    },
  },
  designQ({
    id: '2',
    level: 'exam',
    title: '36 ft beam, two 45 k loads (3 sets of spacing)',
    text: 'Simply supported 36 ft beam; factored point loads 45 k at 12 ft from each support; factored UDL 2.2 k/ft including self-weight. b = 14 in, d = 25 in, f′c = 4 ksi, fy = 60 ksi, #3 two-legged stirrups. Design the stirrups with 3 sets of spacing and sketch them.',
    bm: { kind: 'ss', L: 36, wD: 2.2, P: [{ x: 12, P: 45 }, { x: 24, P: 45 }], factored: true },
    sec: { bw: 14, d: 25, fc: 4000, fy: 60000 },
    extra: (d) => [{ key: 'n', label: 'stirrups in each end zone (auto layout)', value: d.layouts.sL.count, tol: 0.001 }],
  }),
  designQ({
    id: '3',
    level: 'exam',
    title: 'Service loads, self-weight excluded (2017-18 / 2023-24 style)',
    text: 'Simply supported 30 ft span, service DL 1.8 k/ft (excluding self-weight) and LL 1.5 k/ft. b = 12 in, h = 24 in, d = 21.5 in, f′c = 3 ksi, fy = 60 ksi, #3 two-legged. Find Vu at d, where stirrups are needed, and design them.',
    bm: { kind: 'ss', L: 30, wD: 1.8, wL: 1.5, selfWeight: { b: 12, h: 24 } },
    sec: { bw: 12, d: 21.5, fc: 3000, fy: 60000 },
  }),
  designQ({
    id: '4',
    level: 'challenge',
    title: 'Overhanging beam, very high shear (2005-06 style)',
    text: 'Supports 30 ft apart with 6 ft overhangs. Factored loads: 35 k at each tip, 80 k at midspan, 5 k/ft over the whole length; neglect self-weight. b = 14 in, d = 28 in, f′c = 3 ksi, fy = 60 ksi, #3 two-legged (switch to 4 legs if s < 3 in). Classify each zone and design the stirrups.',
    bm: { kind: 'ss', L: 30, ohL: 6, ohR: 6, wD: 5, P: [{ x: 0, P: 35 }, { x: 21, P: 80 }, { x: 42, P: 35 }], factored: true },
    sec: { bw: 14, d: 28, fc: 3000, fy: 60000 },
    extra: (d) => [{ key: 'vo', label: 'Vu at d in the overhang', value: d.runs.find((r) => r.id === 'ohL')!.Vd, unit: 'k' }],
  }),
]

const mod: RcTopicModule = { Overview, Approach, Lab: () => <ShearLabPage />, problems, theory: SHEAR_THEORY }
export default mod

function ShearLabPage() {
  return (
    <div className="space-y-6">
      <ShearDesignProblems />
    <Section title="Stirrup design lab" sub="Build the beam (or 🎲), fill the checkpoints, then make the layout pass and open the full solution. The code pane highlights the case you are in.">
      <ShearLab />
    </Section>
    </div>
  )
}
