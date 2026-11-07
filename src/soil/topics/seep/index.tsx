import { useMemo } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { exitGradient, netLines, pointInfo, sheetPileExact, solveNet } from '../../engine/flownet'
import { excavationHeave, profile } from '../../engine/stresses'
import { GW } from '../../engine/units'
import { openSmRef } from '../../reference/pane'
import type { SmQ, SmTopicModule } from '../../types'
import { FlowNetLab, geomOf, NET_DEFAULT, netResults, NetSolution, type NetState } from './FlowNetLab'
import { ExSolution, HeaveLabs, type ExState } from './HeaveLab'
import { NetView } from './NetView'
import { SEEP_NEW } from './notAsked'
import { SEEP_PICKS } from './picks'
import { SeepProblems } from './Problems'
import { PROF_DEFAULT, ProfileFigure, ProfileLab, ProfileSolution, toProfileIn, type ProfState } from './ProfileLab'
import { SEEP_THEORY } from './theory'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Effective stress, seepage and flow nets (SJMY sir, Lectures 10–14)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-seep" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`\\sigma' = \\sigma - u,\\qquad \\sigma' = z\\gamma' \\mp iz\\gamma_w\\ (\\uparrow / \\downarrow\\ \\text{flow})`}</Tex>
            <Tex block>{`i_{cr} = \\frac{\\gamma'}{\\gamma_w} = \\frac{G_s - 1}{1 + e},\\qquad j = i\\gamma_w`}</Tex>
            <Tex block>{`q = kH\\frac{N_f}{N_d},\\quad h_P = H - n\\frac{H}{N_d},\\quad u = (h - z)\\gamma_w`}</Tex>
            <Tex block>{`FS_{Harza} = \\frac{i_{cr}}{i_e},\\qquad FS_{Terzaghi} = \\frac{D\\gamma'}{h_a\\gamma_w}`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **Stress profiles**: σ from the weights above, u from the water table (negative in the capillary zone, plus/minus the seepage excess), σ′ = σ − u at every change of slope.
- **Excavation heave**: the clay plug left under a pit must outweigh the water pressure in the sand below.
- **Quick condition / filters**: upward flow with i ≥ icr; a filter adds weight but no seepage force.
- **Flow nets** (sheet pile, dam with or without cut-off, gravity wall): q, head and pore pressure at a point, exit gradient, heave and piping, uplift.
- Theory: effective stress, seepage pressure and force, icr, quick sand, Laplace, flow-net properties, piping, filters.`}</Md>
          </div>
        </div>
        <Callout kind="exam">
          The biggest topic in SJMY sir's half. A flow net is set in 12 of the 13 papers: sheet piles (2023-24 Q6(c), 2020-21 Q1(c), Jan 2021 Q1(b), 2016-17 Q3(b), 2015-16 Q11(c), 2010-11 Q7(d)), dams and weirs with or without cut-offs (2021-22 Q4(c), 2017-18 Q7(a), 2011-12 Q8(e), 2008-09 Q8(d), 2007-08 Q8(c)) and a gravity wall (2023-24 Q8(a)). Excavation heave twice in the last three papers (2023-24 Q5(b), 2021-22 Q2(b)), a stress profile (2020-21 Q2(b)), filters for a target FS (2012-13, 2009-10), and 8–16 mark theory every year: icr derivation, quick sand, Laplace, flow-net properties, piping, filters.
        </Callout>
      </Section>
      <Section title="Where the labs are">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <Md>{`**Flow-net simulator.** Drag the pile, cut-offs, base, water levels; the net is solved live (finite differences, checked against the exact sheet-pile result). Click for a piezometer.`}</Md>
          <Md>{`**Profile builder.** Layers, water table or standing water, capillary zone, upward or downward seepage; σ, u and σ′ diagrams with the ordinates to fill in.`}</Md>
          <Md>{`**Heave and filters.** Excavation in clay over a sand aquifer (safe depth, drawdown) and the upward-flow column with its weighting filter.`}</Md>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function WhichCase() {
  const box = (t: string, d: string, c: string) => (
    <div className="rounded-xl border p-3 text-sm" style={{ borderColor: c }}>
      <div className="font-bold" style={{ color: c }}>
        {t}
      </div>
      <Md className="text-sm">{d}</Md>
    </div>
  )
  return (
    <div className="grid cq-md:grid-cols-3 gap-3">
      {box('Water still', 'σ′ = zγ′ below the WT; standing water cancels. Capillary zone: u = −hγw, γsat.', 'var(--c-accent)')}
      {box('1-D flow through a layer', 'Known head difference across a layer: u grows linearly by the excess; σ′ = zγ′ ∓ izγw. Quick if i ≥ icr.', 'var(--c-water)')}
      {box('Pit over an aquifer', 'Plug (H − d)γsat against hpγw at the clay base. No net needed.', 'var(--c-load)')}
      {box('Flow net printed', 'Count Nf and Nd yourself (fractions allowed), then q, h at points, exit gradient.', 'var(--c-good)')}
      {box('"Draw the flow net"', 'Draw to scale: impermeable = flow lines, beds = equipotentials; 3–4 channels; squares.', 'var(--c-good)')}
      {box('Anisotropic k', 'Transformed section x√(kz/kx); q uses √(kxkz). Pressures read on the true section.', 'var(--c-mute)')}
    </div>
  )
}

function Approach() {
  const ex = useMemo(() => {
    const st: NetState = { ...NET_DEFAULT, kind: 'pile', T: 18, s: 8, hU: 9, hD: 1.5, gsat: 20.4, k: 5e-9, Nf: 4 }
    const sol = solveNet(geomOf(st), 'final')
    const R = netResults(sol, st)
    const P = pointInfo(sol, -4, 10, 20.4, R.Nd)
    const Q = pointInfo(sol, 8, 8, 20.4, R.Nd)
    return { st, sol, R, P, Q, net: netLines(sol, 4) }
  }, [])
  const prof = profile(toProfileIn(PROF_DEFAULT))
  return (
    <div>
      <Section title="Recipe: stress profile">
        <Steps>
          <Step n={1} title="Draw the column">Layers with γ above and γsat below the WT; mark the WT (▽), the capillary zone, any standing water and any layer with seepage.</Step>
          <Step n={2} title="Controlling depths">GL, top of capillary zone (two values), WT, every layer boundary, top and bottom of a seepage layer, the bottom.</Step>
          <Step n={3} title="σ, u, σ′ at each">σ = Σγh (+ standing water); u = zwγw below the WT, −hγw in the capillary zone, + excess head × γw where water flows; σ′ = σ − u.</Step>
          <Step n={4} title="Three diagrams">Straight lines between the ordinates; write the values on them.</Step>
        </Steps>
      </Section>
      <Section title="Recipe: flow-net question (Lectures 12–13)">
        <Steps>
          <Step n={1} title="H and boundaries">H = U/S level − D/S level. Impermeable boundaries are flow lines, submerged beds are equipotentials.</Step>
          <Step n={2} title="Net">3–4 flow channels, equipotentials making squares; count Nf, Nd. Δh = H/Nd.</Step>
          <Step n={3} title="Seepage">q = kH·Nf/Nd per metre; × length × time if asked (1 day = 86 400 s; 1 cm/s = 10⁻² m/s).</Step>
          <Step n={4} title="A point">n drops to reach it → hP = H − nΔh (head left above tail water). Seepage pressure hPγw; pore pressure u = (depth below the D/S water + hP)γw; σ′ = σ − u.</Step>
          <Step n={5} title="Safety">Exit gradient Δh/l of the last field → Harza FS = icr/ie. Sheet pile: Terzaghi prism D × D/2, ha at the tip level → FS = Dγ′/(haγw). Dam: uplift u = (pressure head)γw along the base, U = area.</Step>
          <Step n={6} title="Comment">FS ≥ 3–4 (piping) / 4–5 (heave) is adequate; otherwise deeper cut-off, longer floor, filter.</Step>
        </Steps>
        <button className="chip mt-2 hover:!border-load" onClick={() => openSmRef('st-flownet')}>
          Chart pane: flow-net checklist ↗
        </button>
      </Section>
      <Section title="Which case am I in?">
        <WhichCase />
        <Callout kind="trap">
          <Md>{`- **Datum mix-ups.** Head "left" at P is measured above the **tail water**; the pore pressure adds the depth of P below the **downstream water level** (not below the ground).
- **Seepage pressure ≠ pore pressure.** Lecture 13: seepage pressure at P = hPγw only.
- **γ vs γsat**: the capillary zone is saturated (γsat) though u is negative there.
- **Standing water**: adds to σ and u equally; never to σ′.
- **Excavation**: the sand pressure is set by the water table (or the artesian level), not by the pit; the pit is pumped dry, so no water weight on the plug.
- **Counting Nd**: count the drops (spaces), not the lines; partial squares are fine (e.g. 7.5).
- **Exit gradient**: use the last field next to the structure (where it is largest), not the average H/L.
- **Units**: k in cm/s → ×10⁻² for m/s; cm³ → m³; "6 months" = 182.5 days.`}</Md>
        </Callout>
      </Section>
      <Section title="2016-17 Q3(b), stepped through" sub="k = 5 × 10⁻⁷ cm/s, impermeable at 18 m, pile 8 m, water 9 m upstream and 1.5 m downstream, γsat = 20.4 kN/m³. P is 4 m upstream at 8 m depth, Q 8 m downstream at 10 m.">
        <NetView sol={ex.sol} net={ex.net} kind="pile" probe={{ x: -4, z: 10, h: ex.P.h }} prism={ex.R.heave} />
        <Md>{`- $H = 9 - 1.5 = 7.5$ m; net: $N_f/N_d = ${f3(ex.sol.shape)}$ (exact for one pile ${f3(sheetPileExact(8, 18))}; e.g. 4 channels and ${f2(ex.R.Nd)} drops).
- (i) $q = 5\\times10^{-9} \\times 7.5 \\times ${f3(ex.sol.shape)} = ${(5e-9 * 7.5 * ex.sol.shape).toExponential(2)}$ m³/s per m → **${f3(5e-9 * 7.5 * ex.sol.shape * 30 * 86400)} m³ per m in 30 days**.
- (ii) P: head left above tail water $h_P = ${f2(ex.P.excess)}$ m → seepage pressure **${f2(ex.P.excess * GW)} kPa**; $u_P = (8 + 1.5 + ${f2(ex.P.excess)}) \\times 9.81 =$ **${f2(ex.P.u)} kPa**.
- (iii) Q: $h_Q = ${f2(ex.Q.excess)}$ m → $u_Q = (10 + 1.5 + ${f2(ex.Q.excess)}) \\times 9.81 =$ **${f2(ex.Q.u)} kPa**; $\\sigma_Q = 1.5 \\times 9.81 + 10 \\times 20.4 = ${f2(ex.Q.sigma)}$ → **σ′ = ${f2(ex.Q.sigmaEff)} kPa**.
- (iv) $\\gamma' = 10.59$, $i_{cr} = ${f3(ex.R.icr)}$. Terzaghi: $h_a = ${f2(ex.R.heave!.ha)}$ m → $FS = \\frac{8 \\times 10.59}{${f2(ex.R.heave!.ha)} \\times 9.81} =$ **${f2(ex.R.heave!.FS)}**. Harza: $i_e = ${f3(ex.R.ie)}$ → FS = **${f2(ex.R.icr / ex.R.ie)}**. Both ≥ 3: safe.`}</Md>
        <p className="text-xs text-faint">Handnote: Nf/Nd ≈ 0.54, 0.052 m³, 54 and 147 kPa at P, 129 and 90 kPa at Q, FS 3.4 and 3.8 — the same to rounding.</p>
      </Section>
      <Section title="2020-21 Q2(b), stepped through" sub="Clay to 3 m (15 kN/m³ above the WT at 2 m, 18 below), sand below (20 kN/m³), to 10 m.">
        <ProfileFigure s={PROF_DEFAULT} pts={prof} />
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>depth (m)</th>
              <th>σ (kPa)</th>
              <th>u (kPa)</th>
              <th>σ′ (kPa)</th>
            </tr>
          </thead>
          <tbody>
            {prof.map((p) => (
              <tr key={p.z}>
                <td>{f2(p.z)}</td>
                <td>{f2(p.sigma)}</td>
                <td>{f2(p.u)}</td>
                <td>{f2(p.eff)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- practice problems
const capProf: ProfState = {
  layers: [
    { name: 'Silt', H: 4, gamma: 17, gammaSat: 19.2 },
    { name: 'Sand', H: 6, gamma: 18.5, gammaSat: 20.4 },
  ],
  wt: 3,
  hc: 1.2,
  flow: 'none',
  flowLayer: 0,
  dh: 1,
}
const pileSt: NetState = { ...NET_DEFAULT, kind: 'pile', T: 12, s: 6, hU: 7, hD: 1, gsat: 19.5, k: 3e-5, Nf: 4 }
const exSt: ExState = { Hc: 10, gSat: 18, wt: 0, art: 2, pit: 0, d: 4, FS: 1.2 }
const damSt: NetState = { ...NET_DEFAULT, kind: 'dam', T: 10, B: 16, hU: 6, hD: 0.5, embed: 1, embedD: 1, cutU: 0, cutD: 3, gsat: 20, k: 2e-5, Nf: 4 }

function netQ(st: NetState) {
  const sol = solveNet(geomOf(st), 'final')
  return { sol, R: netResults(sol, st) }
}

const problems: SmQ[] = [
  {
    id: 'sm-own-seep-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'B',
    no: '1',
    marks: 0,
    topics: ['sm-seep'],
    title: 'Profile with a capillary zone',
    text: 'Silt 4 m thick (γ = 17 kN/m³ above the capillary zone, γsat = 19.2 kN/m³) over sand (γsat = 20.4 kN/m³) to 10 m. The water table is 3 m below the ground and the silt is saturated by capillary rise for 1.2 m above it. Find σ, u and σ′ just above and just below the top of the capillary zone, at the water table and at 10 m.',
    pages: [],
    checks: () => {
      const p = toProfileIn(capProf)
      const pts = profile(p)
      const a = pts.find((x) => x.label?.includes('just above'))!
      const b = pts.find((x) => x.label?.includes('just below'))!
      const wt = pts.find((x) => x.z === 3)!
      const bot = pts[pts.length - 1]
      return [
        { key: 'ea', label: 'σ′ just above 1.8 m', value: a.eff, unit: 'kPa' },
        { key: 'eb', label: 'σ′ just below 1.8 m', value: b.eff, unit: 'kPa' },
        { key: 'ew', label: 'σ′ at the WT', value: wt.eff, unit: 'kPa' },
        { key: 'e10', label: 'σ′ at 10 m', value: bot.eff, unit: 'kPa' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <ProfileFigure s={capProf} pts={profile(toProfileIn(capProf))} />
        <ProfileSolution s={capProf} />
      </div>
    ),
  },
  {
    id: 'sm-own-seep-2',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '2',
    marks: 0,
    topics: ['sm-seep'],
    title: 'Sheet pile: seepage, heave and piping',
    text: 'A sheet pile penetrates 6 m into a 12 m thick sand layer (k = 3 × 10⁻⁵ m/s, γsat = 19.5 kN/m³) over an impermeable stratum. Water is 7 m above the ground upstream and 1 m downstream. Draw the flow net and find the seepage per metre per day, the pore pressure at the pile tip on the downstream side, and FS against heave (Terzaghi) and piping (Harza).',
    pages: [],
    checks: () => {
      const { sol, R } = netQ(pileSt)
      const tip = pointInfo(sol, 0.05, sol.g.tipU!, pileSt.gsat, R.Nd)
      return [
        { key: 'nd', label: 'Nd for Nf = 4', value: R.Nd, tol: 0.1 },
        { key: 'q', label: 'q (m³/day per m)', value: R.q * 86400, unit: 'm³/day', tol: 0.08 },
        { key: 'u', label: 'u at the tip, D/S side', value: tip.u, unit: 'kPa', tol: 0.05 },
        { key: 'fs', label: 'FS heave', value: R.heave!.FS, tol: 0.08 },
        { key: 'fp', label: 'FS piping (Harza)', value: R.icr / R.ie, tol: 0.15 },
      ]
    },
    solution: () => {
      const { sol, R } = netQ(pileSt)
      const tip = pointInfo(sol, 0.05, sol.g.tipU!, pileSt.gsat, R.Nd)
      return (
        <div className="space-y-2">
          <NetView sol={sol} net={netLines(sol, 4)} kind="pile" probe={{ x: 0.05, z: sol.g.tipU!, h: tip.h }} prism={R.heave} />
          <NetSolution st={pileSt} R={R} probe={{ info: tip, depth: 6 }} />
        </div>
      )
    },
  },
  {
    id: 'sm-own-seep-3',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '3',
    marks: 0,
    topics: ['sm-seep'],
    title: 'Excavation over an artesian sand',
    text: 'A 10 m clay layer (γsat = 18 kN/m³) overlies a sand in which a piezometer rises 2 m above the ground surface. A pit is to be dug to 4 m and kept dry by pumping. Find the FS against base heave, the depth possible with FS = 1.2, and how far the head in the sand must be lowered to dig 4 m with FS = 1.2.',
    pages: [],
    checks: () => {
      const r = excavationHeave({ Hc: 10, gSat: 18, wt: 0, hp: 12 }, 4, 1.2)
      return [
        { key: 'fs', label: 'FS at 4 m', value: r.FS },
        { key: 'd', label: 'safe depth (FS 1.2)', value: r.dSafe, unit: 'm' },
        { key: 'dd', label: 'drawdown needed', value: r.drawdown, unit: 'm' },
      ]
    },
    solution: () => <ExSolution s={exSt} />,
  },
  {
    id: 'sm-own-seep-4',
    paper: 'own',
    level: 'challenge',
    sec: 'B',
    no: '4',
    marks: 0,
    topics: ['sm-seep'],
    title: 'Weir with a toe cut-off: uplift and exit',
    text: 'A 16 m wide weir is founded 1 m below the river bed on a sand 10 m thick (below the upstream bed) over rock; k = 2 × 10⁻⁵ m/s, γsat = 20 kN/m³. A sheet pile goes 3 m below the base at the toe. Headwater 6 m above the upstream bed, tail water 0.5 m above the downstream bed. Find the seepage per day per metre, the uplift at the heel and the toe and the total uplift, and FS against heave at the toe cut-off.',
    pages: [],
    checks: () => {
      const { R } = netQ(damSt)
      return [
        { key: 'q', label: 'q (m³/day per m)', value: R.q * 86400, tol: 0.08 },
        { key: 'uh', label: 'uplift at the heel', value: R.up!.heel, unit: 'kPa', tol: 0.04 },
        { key: 'ut', label: 'uplift at the toe', value: R.up!.toe, unit: 'kPa', tol: 0.04 },
        { key: 'U', label: 'total uplift', value: R.up!.U, unit: 'kN/m', tol: 0.04 },
        { key: 'fs', label: 'FS heave at the toe pile', value: R.heave!.FS, tol: 0.08 },
      ]
    },
    solution: () => {
      const { sol, R } = netQ(damSt)
      return (
        <div className="space-y-2">
          <NetView sol={sol} net={netLines(sol, 4)} kind="dam" prism={R.heave} exit={exitGradient(sol, R.Nd)} />
          <NetSolution st={damSt} R={R} probe={null} />
        </div>
      )
    },
  },
  ...SEEP_NEW,
]

// ---------------------------------------------------------------- lab page
function SeepLab() {
  return (
    <div className="space-y-6">
      <PickSection topic="sm-seep" skills={SEEP_PICKS} />
      <SeepProblems />
      <Section title="Flow-net simulator" sub="A finite-difference Laplace solver under sheet piles, dams, cut-offs and gravity walls. Drag, click, compare with your hand-drawn net.">
        <FlowNetLab />
      </Section>
      <Section title="σ / u / σ′ profile builder" sub="Layers, water table or standing water, capillary rise, seepage across a layer. Fill the ordinates, then open the solution.">
        <ProfileLab />
      </Section>
      <Section title="Heave and quick condition" sub="Excavation over a sand aquifer, and the upward-flow column with its weighting filter.">
        <HeaveLabs />
      </Section>
    </div>
  )
}

const mod: SmTopicModule = { Overview, Approach, Lab: SeepLab, problems, theory: SEEP_THEORY }
export default mod
