// Worked solutions for Snigdha ma'am's design / number parts on tubewells (ev-well) and distribution (ev-dist).
// Every number comes from ../engine/dtw and ../engine/network (the same call feeds `final`).
import type { ReactNode } from 'react'
import { Md, Step, Steps } from '../../components/ui'
import {
  curveOf,
  dAt,
  designDtw,
  designFromSieve,
  gradationStats,
  type CurvePoint,
  type DtwDesign,
  type Layer,
  type SieveRow,
} from '../engine/dtw'
import {
  cfsToM3s,
  designDemand,
  designTree,
  economicTank,
  fpsToMs,
  ftToM,
  hardyCross,
  IMP_GAL_FT3,
  US_GAL_FT3,
  type HcLoop,
  type HcPipe,
  type TreePipe,
  type TreeResult,
} from '../engine/network'
import { GradChart } from '../figs/well-grad'
import { WellLog } from '../figs/well-log'
import { LoopFig } from '../figs/net-loop'
import { PressureProfile } from '../figs/net-profile'
import { TreeFig, type NodePos } from '../figs/net-tree'
import type { EvPartMap } from '../types'

const n = (v: number, d = 2) => {
  const s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d)
  return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s
}
const comma = (v: number) => Math.round(v).toLocaleString('en')

// ------------------------------------------------------------------ layout bits
const Block = ({ children }: { children: ReactNode }) => <div className="space-y-3 text-sm">{children}</div>
const Head = ({ children }: { children: ReactNode }) => <div className="font-bold text-ink mt-4 mb-1">{children}</div>
const Final = ({ children }: { children: string }) => (
  <div className="rounded-xl border-2 border-accent/60 bg-accent/10 px-4 py-3 font-semibold">
    <Md>{children}</Md>
  </div>
)
const Figure = ({ children, cap }: { children: ReactNode; cap?: string }) => (
  <figure className="my-2">
    <div className="rounded-xl border border-line bg-panel p-2">{children}</div>
    {cap && <figcaption className="text-xs text-faint mt-1">{cap}</figcaption>}
  </figure>
)

// ====================================================================================================
// A. "Design a tubewell from sieve analysis" (2007-08 .. 2016-17)
// ====================================================================================================
export interface SieveCase {
  rows: SieveRow[]
  pan: number
  strainerMm?: number
  thicknessM?: number
  open?: number
  fb?: number
  assumed: string[]
}
const T0708 = [0.5, 1.0, 4.4, 64.8, 27.1]
const SIZES = [0.6, 0.425, 0.3, 0.15, 0.075]
const NOS = ['30', '40', '50', '100', '200']
const mkRows = (w: number[]): SieveRow[] => w.map((r, i) => ({ no: NOS[i], size: SIZES[i], retained: r }))

const C0708: SieveCase = { rows: mkRows(T0708), pan: 2.2, strainerMm: 100, thicknessM: 40, open: 0.1, assumed: ['F_B = 3 (class default when the paper gives none), entrance velocity 0.1 ft/s'] }
const C1112: SieveCase = { rows: mkRows(T0708), pan: 2.2, strainerMm: 100, thicknessM: 40, open: 0.15, assumed: ['aquifer thickness is not printed in this version: 40 m assumed (as in the 2007-08 version of the same table)', 'F_B = 3, entrance velocity 0.1 ft/s'] }
const C0809: SieveCase = { rows: mkRows([0.4, 1.7, 10.5, 73.6, 7.3]), pan: 6.5, assumed: ['the question asks only for the slot size and the gravel pack, so no yield is computed'] }
const C1213: SieveCase = { rows: mkRows([0.3, 1.2, 20.8, 69.4, 7.2]), pan: 1.1, strainerMm: 150, thicknessM: 40, open: 0.13, assumed: ['aquifer thickness is not printed: 40 m assumed', 'F_B = 3, entrance velocity 0.1 ft/s'] }
const C1516: SieveCase = { rows: mkRows([0.5, 2.5, 13.1, 71.8, 12.0]), pan: 0.1, strainerMm: 100, thicknessM: 40, open: 0.12, assumed: ['aquifer thickness is not printed: 40 m assumed', 'F_B = 3, entrance velocity 0.1 ft/s'] }

const runSieve = (c: SieveCase) => designFromSieve({ rows: c.rows, pan: c.pan, strainerMm: c.strainerMm, thicknessM: c.thicknessM, open: c.open, fb: c.fb })

const interpTex = (pts: CurvePoint[], p: number, name: string) => {
  const r = dAt(pts, p)
  return `${name} = ${n(r.lo.size, 3)}\\left(\\frac{${n(r.hi.size, 3)}}{${n(r.lo.size, 3)}}\\right)^{\\frac{${p}-${n(r.lo.finer, 1)}}{${n(r.hi.finer, 1)}-${n(r.lo.finer, 1)}}} = ${n(r.d, 3)}\\ \\text{mm}`
}

export function SieveSol({ c }: { c: SieveCase }) {
  const d = runSieve(c)
  const pts = d.tab.points
  const st = d.stats
  const packPts = pts.map((p) => ({ size: p.size * d.factor, finer: p.finer }))
  const rowsMd = [
    '| Sieve | Size (mm) | Retained (g) | % retained | Cum. % retained | % finer |',
    '|---|---|---|---|---|---|',
    ...d.tab.rows.map((r) => `| #${r.no} | ${r.size} | ${r.retained} | ${n(r.pct, 1)} | ${n(r.cumRetained, 1)} | ${n(r.finer, 1)} |`),
    `| Pan | – | ${c.pan} | ${n(d.tab.panPct, 1)} | 100 | 0 |`,
  ].join('\n')
  const y = d.yield
  const sc = d.screen
  return (
    <Block>
      <Md>{`**Given.** Sieve analysis of the aquifer sample (total ${n(d.tab.total, 1)} g).${c.strainerMm ? ` Strainer diameter ${c.strainerMm} mm; open area ${n((c.open ?? 0) * 100, 0)}% of the strainer surface.` : ''}${c.thicknessM ? ` Aquifer thickness ${n(c.thicknessM, 0)} m.` : ''}`}</Md>
      <Md>{`**Assumed.** ${c.assumed.join('; ')}. Sizes are rounded down to a standard slot (#20, #30, #40).`}</Md>
      <Steps>
        <Step n={1} title="Percent finer for every sieve">
          <Md>{rowsMd}</Md>
        </Step>
        <Step n={2} title="Gradation curve: D10, D30, D60 and Cu">
          <Md>{`Read the sizes at 10, 30 and 60 % finer (log interpolation between the two sieves that enclose the percentage):

$$${interpTex(pts, 10, 'D_{10}')}$$
$$${interpTex(pts, 30, 'D_{30}')}$$
$$${interpTex(pts, 60, 'D_{60}')}$$
$$C_u = \\frac{D_{60}}{D_{10}} = \\frac{${n(st.d60, 3)}}{${n(st.d10, 3)}} = ${n(st.cu, 2)}$$

Effective size ${n(st.d10, 3)} mm; ${d.mit} on the MIT scale; ${st.cu <= 2.5 ? 'C_u ≤ 2.5, so the sand is uniform enough to use as the design sample' : 'C_u > 2.5: the sand is graded wide, so the pack curve is flattened to C_u ≤ 2.5'}.`}</Md>
        </Step>
        <Step n={3} title="Gravel pack from the finest sand">
          <Md>{`Multiplying factor on $D_{30}$ (4 for $C_u \\le 1.5$, 6 for $C_u \\ge 2.5$, straight line between):
$$f = 4 + 2(C_u - 1.5) = 4 + 2(${n(st.cu, 2)} - 1.5) = ${n(d.factorExact, 2)} \\approx ${d.factor}$$
$$D_{30,\\text{pack}} = ${d.factor} \\times ${n(st.d30, 3)} = ${n(d.pack.d30, 3)}\\ \\text{mm}$$
Draw the pack curve through that point parallel to the sand curve, so $D_{10,\\text{pack}} = ${d.factor} \\times ${n(st.d10, 3)} = ${n(d.pack.d10, 3)}$ mm and $D_{60,\\text{pack}} = ${n(d.pack.d60, 3)}$ mm, $C_u$(pack) $= ${n(d.pack.cu, 2)} \\le 2.5$ ✓. Pack thickness 3–8 in (8 in is usual); it runs about 40 ft above the screen.`}</Md>
          <Figure cap="Aquifer curve (solid, from the sieves) and the gravel-pack curve drawn parallel to it through D30 × factor.">
            <GradChart
              curves={[
                { label: 'aquifer sand', pts },
                { label: 'gravel pack', pts: packPts, dashed: true, color: 'var(--c-load)' },
              ]}
              mark={[
                { size: st.d10, finer: 10, label: `D10 ${n(st.d10, 2)}` },
                { size: st.d30, finer: 30, label: `D30 ${n(st.d30, 2)}` },
                { size: st.d60, finer: 60, label: `D60 ${n(st.d60, 2)}` },
              ]}
            />
          </Figure>
        </Step>
        <Step n={4} title="Slot size">
          <Md>{`The slot must hold back about 90 % of the pack, so use $D_{10}$ of the pack:
$$\\text{slot no.} = \\frac{D_{10,\\text{pack}}}{25.4} \\times 1000 = \\frac{${n(d.pack.d10, 3)}}{25.4} \\times 1000 = ${n(d.slot.raw, 1)}$$
Round **down** to a standard slot: **#${d.slot.slot}** (opening ${n(d.slot.widthIn, 3)} in = ${n(d.slot.widthMm, 2)} mm).`}</Md>
        </Step>
        {sc && (
          <Step n={5} title="Screen length">
            <Md>{`Aquifer thickness $${n(c.thicknessM ?? 0, 0)}$ m $= ${n(sc.thicknessFt, 1)}$ ft ($> 50$ ft), so up to **80 %** can be screened: $0.8 \\times ${n(sc.thicknessFt, 1)} = ${n(sc.lenByShare, 1)}$ ft. A longer screen than **100 ft** is hard to keep vertical, so adopt **L = ${n(sc.Lft, 0)} ft** (${n(sc.Lm, 1)} m).`}</Md>
          </Step>
        )}
        {y && (
          <Step n={6} title="Open area and yield">
            <Md>{`Opening ${n(y.eta * 100, 0)} % (given), $D = ${n(c.strainerMm ?? 0, 0)}$ mm $= ${n(y.dFt, 3)}$ ft, entrance velocity $V_c = 0.1$ ft/s, blockage factor $F_B = ${y.fb}$:
$$Q = \\frac{\\eta\\,\\pi D L\\,V_c}{F_B} = \\frac{${n(y.eta, 2)} \\times \\pi \\times ${n(y.dFt, 3)} \\times ${n(y.L, 0)} \\times 0.1}{${y.fb}} = ${n(y.cfs, 3)}\\ \\text{cusec}$$
$$Q = ${n(y.cfs, 3)} \\times 28.317 \\times 3600 = ${comma(y.lph)}\\ \\text{L/h} = ${n(y.m3h, 1)}\\ \\text{m}^3\\text{/h}$$`}</Md>
          </Step>
        )}
      </Steps>
      <Final>
        {y
          ? `Slot #${d.slot.slot}; gravel pack D30 = ${n(d.pack.d30, 2)} mm, D10 = ${n(d.pack.d10, 2)} mm; screen ${n(d.screen!.Lft, 0)} ft; Q = ${n(y.cfs, 3)} cusec (${comma(y.lph)} L/h).`
          : `Slot #${d.slot.slot}; gravel pack: D30 = ${n(d.pack.d30, 2)} mm, D10 = ${n(d.pack.d10, 2)} mm, D60 = ${n(d.pack.d60, 2)} mm.`}
      </Final>
    </Block>
  )
}
const finalSieve = (c: SieveCase) => {
  const d = runSieve(c)
  return d.yield
    ? `Slot #${d.slot.slot}; pack D30 ${n(d.pack.d30, 2)} mm, D10 ${n(d.pack.d10, 2)} mm; screen ${n(d.screen!.Lft, 0)} ft; Q = ${n(d.yield.cfs, 3)} cusec (${comma(d.yield.lph)} L/h)`
    : `Slot #${d.slot.slot}; pack D30 ${n(d.pack.d30, 2)} mm, D10 ${n(d.pack.d10, 2)} mm, D60 ${n(d.pack.d60, 2)} mm`
}

// ====================================================================================================
// B. Deep tubewell from a borehole log (2022-23 Q6(c), 2023-24 Q5(b))
// ====================================================================================================
export function DtwSol({ d, given, assumed, curve, extra }: { d: DtwDesign; given: string[]; assumed: string[]; curve?: { pts: CurvePoint[]; label: string }; extra?: string }) {
  const h = d.housing
  const y = d.yield
  const layerMd = [
    '| Depth (ft) | FM | Cu | Verdict |',
    '|---|---|---|---|',
    ...d.layers.map((l) => `| ${l.top}–${l.bot} | ${l.fm ?? '–'} | ${l.cls === 'clay' ? '–' : n(l.cu, 2)} | ${l.usable ? '✓ ' : '✗ '}${l.why} |`),
  ].join('\n')
  const z = d.zone!
  const porous = d.input.material === 'uPVC'
  return (
    <Block>
      <Md>{`**Given.** ${given.join('; ')}.`}</Md>
      <Md>{`**Assumed.** ${assumed.join('; ')}.`}</Md>
      <Steps>
        <Step n={1} title="Housing pipe length (= least depth of the strainer)">
          <Md>{`$$L_h = \\text{SWL} + \\text{decline} \\times \\text{life} + \\text{drawdown} + \\text{safety}$$
$$L_h = ${h.swl} + ${h.decline} \\times ${h.years} + ${h.drawdown} + ${h.safety} = ${n(h.length, 0)}\\ \\text{ft}$$
The pump stays below water for the whole life; the strainer must start below ${n(h.length, 0)} ft.${d.input.housing.bowlOD ? ` Housing ID ${h.id} in (pump bowl ${d.input.housing.bowlOD} in + 2 in).` : ''}`}</Md>
        </Step>
        <Step n={2} title="Choose the water-bearing zone (FM ≥ 1, Cu < 2.5, no clay)">
          <Md>{layerMd}</Md>
          <Md>{`Zone chosen: **${z.top}–${z.bot} ft** (${n(d.avail, 0)} ft of usable aquifer${z.topIsInterface ? '' : ', cut by the bottom of the housing pipe'}).`}</Md>
        </Step>
        <Step n={3} title="Strainer length and position">
          <Md>{`Thickness ${n(d.avail, 0)} ft $> 50$ ft → ${n(d.share * 100, 0)} % may be screened: $${n(d.share, 2)} \\times ${n(d.avail, 0)} = ${n(d.lenByShare, 0)}$ ft. A screen is hard to keep vertical beyond 100 ft, so **L = ${n(d.length, 0)} ft** (maximum allowable). ${d.input.placement === 'centre' ? `The 100 ft screen is centred in the layer (${n((d.avail - d.length) / 2, 0)} ft clear above and below)` : z.topIsInterface ? `Keep ${d.clearance} ft clear of the layer boundary (finer soil above)` : 'Start 20 ft under the housing pipe so the blind pipe and pack fit'}, so the strainer lies **${d.strainer.top}–${d.strainer.bot} ft**. Sand trap ${d.input.sandTrap ?? 10} ft below: ${d.trap.top}–${d.trap.bot} ft. Blind pipe ${d.blind.top}–${d.blind.bot} ft.`}</Md>
        </Step>
        <Step n={4} title="Gravel pack">
          <Md>
            {d.pack.how === 'given'
              ? `The pack gradation is given: $D_{60} = ${d.pack.d60}$, $D_{30} = ${d.pack.d30}$, $D_{10} = ${d.pack.d10}$ mm, $C_u = ${n(d.pack.cu, 2)} \\le 2.5$ ✓.`
              : `Finest sand in the screened depth (lowest FM): the layer with $D_{10} = ${n(d.finest!.d10 ?? 0, 3)}$, $D_{30} = ${n(d.finest!.d30, 3)}$, $D_{60} = ${n(d.finest!.d60 ?? 0, 3)}$ mm, $C_u = ${n(d.finest!.cu, 2)}$.
$$f = 4 + 2(C_u - 1.5) = ${n(d.factorExact, 2)} \\approx ${d.factor}, \\qquad D_{30,\\text{pack}} = ${d.factor} \\times ${n(d.finest!.d30, 3)} = ${n(d.pack.d30, 3)}\\ \\text{mm}$$
Pack curve drawn parallel to the sand curve: $D_{10,\\text{pack}} = ${n(d.pack.d10, 3)}$, $D_{60,\\text{pack}} = ${n(d.pack.d60, 3)}$ mm, $C_u = ${n(d.pack.cu, 2)} \\le 2.5$ ✓.`}
          </Md>
          {curve && (
            <Figure cap={`${curve.label} (read by eye from the printed chart) and the gravel-pack curve through D30 × ${d.factor}.`}>
              <GradChart
                curves={[
                  { label: curve.label, pts: curve.pts },
                  { label: 'gravel pack', pts: curve.pts.map((p) => ({ size: p.size * d.factor, finer: p.finer })), dashed: true, color: 'var(--c-load)' },
                ]}
                mark={[
                  { size: gradationStats(curve.pts).d10, finer: 10, label: 'D10' },
                  { size: gradationStats(curve.pts).d30, finer: 30, label: 'D30' },
                  { size: gradationStats(curve.pts).d60, finer: 60, label: 'D60' },
                ]}
              />
            </Figure>
          )}
          <Md>{`Pack thickness ${d.input.packThickness} in all round the strainer: borehole ${d.input.strainerDia} + 2 × ${d.input.packThickness} = **${d.boreholeDia} in**. It extends above the screen to ${d.packRange.top} ft and down to ${d.packRange.bot} ft (sand trap bottom); bentonite / grout seal above it.`}</Md>
        </Step>
        <Step n={5} title="Slot number and open area">
          <Md>{`$$\\text{slot no.} = \\frac{D_{10,\\text{pack}}}{25.4}\\times 1000 = \\frac{${n(d.pack.d10, 3)}}{25.4}\\times 1000 = ${n(d.slot.raw, 2)}\\ \\to\\ \\textbf{${d.slot.slot}-slot}\\ \\text{(round down)}$$
Open area of a ${d.slot.slot}-slot ${porous ? 'steel' : ''} screen ${n(((porous ? 2 : 1) * y.eta) * 100, 0)} %${porous ? `; uPVC takes half: **${n(y.eta * 100, 1)} %**` : ''}.`}</Md>
        </Step>
        <Step n={6} title="Yield">
          <Md>{`$D = ${d.input.strainerDia}$ in $= ${n(y.dFt, 3)}$ ft, $L = ${n(y.L, 0)}$ ft, $V_c = 0.1$ ft/s, $F_B = ${y.fb}$:
$$Q = \\frac{\\eta\\,\\pi D L V_c}{F_B} = \\frac{${n(y.eta, 3)} \\times \\pi \\times ${n(y.dFt, 3)} \\times ${n(y.L, 0)} \\times 0.1}{${y.fb}} = ${n(y.cfs, 4)}\\ \\text{cusec}$$
$$Q = ${n(y.cfs, 4)} \\times 28.317 \\times 3600 = ${comma(y.lph)}\\ \\text{L/h}\\quad(${comma(d.dailyLpd)}\\ \\text{L/day at 8 h pumping})$$${extra ? `\n\n${extra}` : ''}`}</Md>
        </Step>
        <Step n={7} title="Well log">
          <Figure cap="Section through the designed well (depths to scale, pipe widths exaggerated).">
            <WellLog d={d} />
          </Figure>
        </Step>
      </Steps>
      <Final>{`Housing ${n(h.length, 0)} ft; strainer ${d.strainer.top}–${d.strainer.bot} ft (${n(d.length, 0)} ft, ${d.input.strainerDia} in, ${d.slot.slot}-slot); pack ${d.packRange.top}–${d.packRange.bot} ft; Q = ${n(y.cfs, 3)} cusec (${comma(y.lph)} L/h).`}</Final>
    </Block>
  )
}
const finalDtw = (d: DtwDesign) => `Housing ${n(d.housing.length, 0)} ft; strainer ${d.strainer.top}–${d.strainer.bot} ft (${d.slot.slot}-slot, ${d.input.strainerDia} in); pack ${d.packRange.top}–${d.packRange.bot} ft; Q = ${n(d.yield.cfs, 3)} cusec (${comma(d.yield.lph)} L/h)`

// 2022-23 Q6(c): finest-sand curve read from Figure 2 (transcription's readings)
const CURVE_2223: CurvePoint[] = curveOf([
  { size: 0.076, finer: 2 }, { size: 0.1, finer: 5 }, { size: 0.132, finer: 8 }, { size: 0.14, finer: 10 }, { size: 0.177, finer: 20 },
  { size: 0.203, finer: 30 }, { size: 0.231, finer: 40 }, { size: 0.275, finer: 50 }, { size: 0.313, finer: 60 }, { size: 0.357, finer: 70 },
  { size: 0.389, finer: 80 }, { size: 0.47, finer: 90 }, { size: 0.56, finer: 95 }, { size: 0.8, finer: 98 },
])
const st2223 = gradationStats(CURVE_2223)
const D2223 = designDtw({
  layers: [{ top: 180, bot: 350, label: 'water-bearing strata', fm: Math.round(st2223.fm * 100) / 100, d10: st2223.d10, d30: st2223.d30, d60: st2223.d60 }],
  housing: { swl: 150, bowlOD: 12 },
  strainerDia: 6,
  packThickness: 6,
  material: 'steel',
})

const CHANDPUR: Layer[] = [
  { top: 200, bot: 400, kind: 'clay', label: 'clayey soil' },
  { top: 400, bot: 550, fm: 1.12, d60: 0.27, d10: 0.14, cu: 1.59, exclude: 'saline: shallow aquifer above the clay seal' },
  { top: 550, bot: 640, fm: 1.34, d60: 0.3, d10: 0.17, cu: 1.76, exclude: 'saline: shallow aquifer above the clay seal' },
  { top: 640, bot: 740, fm: 0.67, d60: 0.2, d10: 0.09, cu: 2.22, exclude: 'saline, and FM < 1' },
  { top: 740, bot: 880, kind: 'clay', label: 'clayey soil (seal)' },
  { top: 880, bot: 930, fm: 1.28, d60: 0.28, d10: 0.16, cu: 1.75 },
  { top: 930, bot: 1020, fm: 1.38, d60: 0.31, d10: 0.18, cu: 1.72 },
  { top: 1020, bot: 1090, fm: 0.73, d60: 0.23, d10: 0.13, cu: 1.77 },
  { top: 1090, bot: 1150, kind: 'clay', label: 'clayey soil' },
]
const D2324 = designDtw({
  layers: CHANDPUR,
  housing: { swl: 80 },
  strainerDia: 8,
  material: 'uPVC',
  packThickness: 8,
  pack: { d60: 1.35, d30: 1.0, d10: 0.7 },
  fb: 2.5,
  placement: 'centre',
  packAbove: 50,
})

// ====================================================================================================
// C. Branched networks (2022-23 Q7(c), 2023-24 Q6(a))
// ====================================================================================================
export function TreeTables({ res }: { res: TreeResult }) {
  const rows = [
    '| Pipe | Q | D calc (in) | Adopted (in) | v (fps) | L (ft) | h_f (ft) | h_f (psi) |',
    '|---|---|---|---|---|---|---|---|',
    ...res.pipes.map((p) => `| ${p.id} | ${n(p.Qlps, 3)} L/s | ${n(p.DcalcIn, 2)} | **${p.Din}**${p.rule === 'min' ? ' (min)' : ''} | ${n(p.vfps, 2)} | ${n(p.Lft, 0)} | ${n(p.hfFt, 3)} | ${n(p.hfPsi, 3)} |`),
  ].join('\n')
  const term = [
    '| Terminal | Path | Σ h_f (psi) | Pressure (psi) | Required | Check |',
    '|---|---|---|---|---|---|',
    ...res.terminals.map((t) => `| ${t.node} | ${t.path.join('–')} | ${n(t.sumHfPsi, 2)} | **${n(t.p, 2)}** | ${res.minPsi} | ${t.ok ? '✓ OK' : '✗ low: enlarge'} |`),
  ].join('\n')
  return (
    <>
      <Md>{rows}</Md>
      <Md>{term}</Md>
    </>
  )
}

const BCD_c = designDemand(0.15, 1.8, 0.1)
const BCD_d = designDemand(0.1, 1.8, 0.1)
const R2223_7c = designTree({
  pipes: [{ id: 'BC', from: 'B', to: 'C', L: ftToM(450) }, { id: 'CD', from: 'C', to: 'D', L: ftToM(375) }],
  demand: { C: cfsToM3s(BCD_c), D: cfsToM3s(BCD_d) },
  root: 'B', V: fpsToMs(3), f: 0.01, Dmin: 4, startPsi: 40, minPsi: 30,
})
const R2223_7c_alt = designTree({
  pipes: [{ id: 'BC', from: 'B', to: 'C', L: ftToM(450) }, { id: 'CD', from: 'C', to: 'D', L: ftToM(375) }],
  demand: { C: cfsToM3s(BCD_c), D: cfsToM3s(BCD_d) },
  root: 'B', V: fpsToMs(3), f: 0.01, Dmin: 4, hfVelocity: 'design', startPsi: 40, minPsi: 30,
})
const POS_BCD: NodePos = { B: [70, 240], C: [70, 80], D: [360, 80] }

function Sol2223_7c() {
  const r = R2223_7c
  const bc = r.pipes[0]
  const cd = r.pipes[1]
  return (
    <Block>
      <Md>{`**Given.** Average demand 0.15 cusec at C and 0.10 cusec at D; peak factor 1.8; losses and wastage 10 %; pressure at B = 40 psi; required terminal pressure 30 psi; BC = 450 ft, CD = 375 ft; $h_f = 4fLv^2/2gD$.`}</Md>
      <Md>{`**Assumed.** B is the supply point; flat ground; the class design velocity $V = 3$ fps for every size; Fanning $f = 0.01$; smallest distribution main 4 in; commercial sizes 2, 3, 4, 6, 8, 10 in…; $g = 32.2$ ft/s².`}</Md>
      <Steps>
        <Step n={1} title="Design demand at each node">
          <Md>{`$$q = \\text{avg} \\times PF \\times (1 + \\text{loss})$$
$$q_C = 0.15 \\times 1.8 \\times 1.10 = ${n(BCD_c, 3)}\\ \\text{cusec},\\qquad q_D = 0.10 \\times 1.8 \\times 1.10 = ${n(BCD_d, 3)}\\ \\text{cusec}$$`}</Md>
        </Step>
        <Step n={2} title="Flow in each pipe (accumulate from the tail)">
          <Md>{`CD carries only D: $Q_{CD} = ${n(cd.Qcfs, 3)}$ cusec. BC carries C and D: $Q_{BC} = ${n(BCD_c, 3)} + ${n(BCD_d, 3)} = ${n(bc.Qcfs, 3)}$ cusec.`}</Md>
        </Step>
        <Step n={3} title="Diameter from continuity, then round up">
          <Md>{`$$D = \\sqrt{\\frac{4Q}{\\pi V}}$$
$$D_{BC} = \\sqrt{\\frac{4 \\times ${n(bc.Qcfs, 3)}}{\\pi \\times 3}} = ${n(bc.DcalcIn / 12, 3)}\\ \\text{ft} = ${n(bc.DcalcIn, 2)}\\ \\text{in} \\to \\textbf{${bc.Din}\\ in}$$
$$D_{CD} = \\sqrt{\\frac{4 \\times ${n(cd.Qcfs, 3)}}{\\pi \\times 3}} = ${n(cd.DcalcIn / 12, 3)}\\ \\text{ft} = ${n(cd.DcalcIn, 2)}\\ \\text{in} \\to \\textbf{${cd.Din}\\ in}\\ (\\text{4 in minimum})$$`}</Md>
        </Step>
        <Step n={4} title="Head loss, h_f = 4 f L v² / 2 g D (velocity in the adopted pipe)">
          <Md>{`$$v_{BC} = \\frac{Q}{A} = \\frac{${n(bc.Qcfs, 3)}}{\\pi (${bc.Din}/12)^2/4} = ${n(bc.vfps, 2)}\\ \\text{fps},\\qquad h_{f,BC} = \\frac{4(0.01)(450)(${n(bc.vfps, 2)})^2}{2(32.2)(${bc.Din}/12)} = ${n(bc.hfFt, 2)}\\ \\text{ft} = ${n(bc.hfPsi, 2)}\\ \\text{psi}$$
$$v_{CD} = ${n(cd.vfps, 2)}\\ \\text{fps},\\qquad h_{f,CD} = \\frac{4(0.01)(375)(${n(cd.vfps, 2)})^2}{2(32.2)(${cd.Din}/12)} = ${n(cd.hfFt, 2)}\\ \\text{ft} = ${n(cd.hfPsi, 2)}\\ \\text{psi}$$
(1 psi = 2.31 ft; $h_f\\,[\\text{psi}] = h_f\\,[\\text{ft}] \\times 62.4/144$.)`}</Md>
        </Step>
        <Step n={5} title="Pressure at the end of the line">
          <Md>{`$$P_D = 40 - ${n(bc.hfPsi, 2)} - ${n(cd.hfPsi, 2)} = ${n(r.pressure.D, 2)}\\ \\text{psi} \\;\\ge\\; 30\\ \\text{psi}\\ \\checkmark$$
No enlargement needed. (If $h_f$ is computed with the design velocity 3 fps instead of $Q/A$, $P_D = ${n(R2223_7c_alt.pressure.D, 1)}$ psi: still above 30.)`}</Md>
        </Step>
      </Steps>
      <Figure cap="Branch B–C–D with the adopted sizes, flows and the pressure at each node.">
        <TreeFig res={r} pos={POS_BCD} root="B" flowUnit="cfs" viewBox={[480, 290]} />
      </Figure>
      <Final>{`BC = ${bc.Din} in, CD = ${cd.Din} in; P at D = ${n(r.pressure.D, 1)} psi (≥ 30 psi)`}</Final>
    </Block>
  )
}

// 2023-24 Q6(a): node demands from the table (m³/d), V = 5 fps
const m3d = (v: number) => v / 86400
const PIPES_2324: TreePipe[] = [
  { id: '0-1', from: '0', to: '1', L: 290 },
  { id: '1-2', from: '1', to: '2', L: 140 },
  { id: '2-3', from: '2', to: '3', L: 125 },
  { id: '1-4', from: '1', to: '4', L: 205 },
  { id: '4-5', from: '4', to: '5', L: 210 },
  { id: '4-6', from: '4', to: '6', L: 165 },
]
const R2324_6a = designTree({
  pipes: PIPES_2324,
  demand: { '2': m3d(275), '3': m3d(195.5), '5': m3d(135.5), '6': m3d(205) },
  root: '0', V: fpsToMs(5), f: 0.01, Dmin: 4, startPsi: 70, minPsi: 30,
})
const POS_2324: NodePos = { '0': [40, 150], '1': [170, 150], '2': [170, 55], '3': [340, 55], '4': [300, 215], '5': [200, 275], '6': [480, 215] }

function Sol2324_6a() {
  const r = R2324_6a
  const p = (id: string) => r.pipes.find((x) => x.id === id)!
  return (
    <Block>
      <Md>{`**Given.** Dead-end network from the OH tank (node 0): pipe lengths 0-1 = 290 m, 1-2 = 140 m, 2-3 = 125 m, 1-4 = 205 m, 4-5 = 210 m, 4-6 = 165 m; tank pressure 70 psi; minimum 30 psi at the end of every branch; $V = 5$ fps; $f = 0.01$.`}</Md>
      <Md>{`**Assumed.** The table's "supply" is the demand drawn off at the end node of each listed pipe (2, 3, 5, 6); nodes 1 and 4 draw nothing. The unlabelled stub at node 2 has no length or demand, so it is ignored. Flat ground; BNBC smallest distribution main 4 in; commercial sizes 2, 3, 4, 6, 8…; $h_f = 4fLv^2/2gD$ with the velocity in the adopted pipe.`}</Md>
      <Steps>
        <Step n={1} title="Flow in each pipe (accumulate from the ends)">
          <Md>{`$Q_{2\\text{-}3} = 195.5$; $Q_{1\\text{-}2} = 275 + 195.5 = 470.5$; $Q_{4\\text{-}5} = 135.5$; $Q_{4\\text{-}6} = 205$; $Q_{1\\text{-}4} = 135.5 + 205 = 340.5$; $Q_{0\\text{-}1} = 470.5 + 340.5 = 811$ m³/d (${n(p('0-1').Qlps, 2)} L/s).`}</Md>
        </Step>
        <Step n={2} title="Diameter at V = 5 fps (1.524 m/s), then the size checks">
          <Md>{`$$D = \\sqrt{\\frac{4Q}{\\pi V}}, \\qquad \\text{e.g. } D_{0\\text{-}1} = \\sqrt{\\frac{4 \\times ${n(p('0-1').Q, 5)}}{\\pi \\times 1.524}} = ${n(p('0-1').Dcalc * 1000, 1)}\\ \\text{mm} = ${n(p('0-1').DcalcIn, 2)}\\ \\text{in}$$
Check 1: calculated size below the 4 in minimum → adopt 4 in. Check 2 (velocity): with the adopted pipe v is below 5 fps in every pipe.`}</Md>
        </Step>
        <Step n={3} title="Head loss and pressure down each branch; pressure check">
          <TreeTables res={r} />
          <Md>{`Pressure at a node = pressure at the tank − Σ h_f along the path. Every terminal ends above 30 psi, so **no pipe needs enlarging**.`}</Md>
        </Step>
      </Steps>
      <Figure cap="Sizes and the pressure at each node (green = meets 30 psi).">
        <TreeFig res={r} pos={POS_2324} root="0" flowUnit="lps" />
      </Figure>
      <Figure cap="Pressure down each branch against the required pressure.">
        <PressureProfile res={r} />
      </Figure>
      <Final>{`Pipes ${r.pipes.map((x) => `${x.id}: ${x.Din} in`).join(', ')}; terminal pressures ${r.terminals.map((t) => `${t.node}: ${n(t.p, 1)} psi`).join(', ')}`}</Final>
    </Block>
  )
}
const final2324_6a = `${R2324_6a.pipes.map((x) => `${x.id} ${x.Din} in`).join(', ')}; terminals ${R2324_6a.terminals.map((t) => `${t.node}: ${n(t.p, 1)} psi`).join(', ')} (all ≥ 30)`

// ====================================================================================================
// D. Hardy Cross (2012-13 Q2(c))
// ====================================================================================================
const HC_PIPES_1213: HcPipe[] = [
  { id: 'AB', from: 'A', to: 'B', L: 400, D: 200, Q0: 2 },
  { id: 'BC', from: 'B', to: 'C', L: 300, D: 100, Q0: 1.2 },
  { id: 'DC', from: 'D', to: 'C', L: 400, D: 200, Q0: 1.8 },
  { id: 'AD', from: 'A', to: 'D', L: 300, D: 100, Q0: 3 },
  { id: 'BD', from: 'B', to: 'D', L: 500, D: 150, Q0: 0.8 },
]
const HC_LOOPS_1213: HcLoop[] = [
  { id: 'I', pipes: [{ id: 'AB', dir: 1 }, { id: 'BD', dir: 1 }, { id: 'AD', dir: -1 }] },
  { id: 'II', pipes: [{ id: 'BC', dir: 1 }, { id: 'DC', dir: -1 }, { id: 'BD', dir: -1 }] },
]
const HC_1213 = hardyCross(HC_PIPES_1213, HC_LOOPS_1213, { kind: 'hw-lps-mm', coef: 1.59e6 }, { iterations: 2, tol: 0 })
const POS_1213: NodePos = { A: [90, 60], B: [380, 60], C: [380, 230], D: [90, 230] }

function Sol2012_2c() {
  const r = HC_1213
  const lbl: Record<string, string> = { AB: 'A→B', BD: 'B→D', AD: 'D→A', BC: 'B→C', DC: 'C→D' }
  return (
    <Block>
      <Md>{`**Given.** Inflow 5 lps at A, outflow 2 lps at D and 3 lps at C; pipes AB 400 m / 200 mm, BC 300 / 100, CD 400 / 200, DA 300 / 100, BD 500 / 150; first guesses AB 2, BC 1.2, CD 1.8, DA 3, BD 0.8 lps; $h_L = 1.59\\times10^{6}\\,Q^{1.85}D^{-4.87}$ (Q in lps, D in mm, $h_L$ in m/m).`}</Md>
      <Md>{`**Assumed.** The first guesses must satisfy continuity: A sends 2 to B and 3 to D; B sends 1.2 to C and 0.8 to D; D passes 1.8 on to C (so CD flows D→C). Loop I = A-B-D-A and loop II = B-C-D-B, both clockwise (+); both loops are corrected together each trial; BD is common (it gets $\\Delta_I - \\Delta_{II}$ with its sign by direction).`}</Md>
      <Md>{`For a pipe, $H = k\\,Q^{1.85}$ with $k = 1.59\\times10^{6}\\,L\\,D^{-4.87}$ (H in m). Then $\\Delta = -\\dfrac{\\sum H}{1.85\\sum |H/Q|}$ for each loop.`}</Md>
      <Steps>
        {r.iters.map((it) => (
          <Step key={it.n} n={it.n} title={`Trial ${it.n}`}>
            {it.loops.map((l) => (
              <Md key={l.id}>{`**Loop ${l.id}** (clockwise)

| Pipe | Q (lps) | H = kQ^1.85 (m) | H/Q |
|---|---|---|---|
${l.rows.map((x) => `| ${lbl[x.pipe] ?? x.pipe} | ${n(x.q, 3)} | ${n(x.H, 3)} | ${n(x.Hq, 3)} |`).join('\n')}

$\\sum H = ${n(l.sumH, 3)}$ m, $\\sum |H/Q| = ${n(l.sumHq, 3)}$, $\\ \\Delta_{${l.id}} = -\\dfrac{${n(l.sumH, 3)}}{1.85 \\times ${n(l.sumHq, 3)}} = \\mathbf{${n(l.delta, 4)}}$ lps`}</Md>
            ))}
            <Md>{`New flows (lps): ${Object.entries(it.end).map(([id, q]) => `${id} = ${n(q, 3)}`).join(', ')}. BD, common to both loops, gets $\\Delta_I - \\Delta_{II} = ${n(it.pipeDelta.BD, 4)}$ lps in the B→D sense.`}</Md>
          </Step>
        ))}
      </Steps>
      <Figure cap="Flows after two trials (lps). Arrows show the direction; AB 400 m, BC 300 m, CD 400 m, DA 300 m, BD 500 m.">
        <LoopFig pipes={HC_PIPES_1213} pos={POS_1213} flows={r.flows} ext={{ A: 5, D: -2, C: -3 }} loops={HC_LOOPS_1213} loopAt={{ I: [190, 120], II: [290, 180] }} viewBox={[480, 290]} />
      </Figure>
      <Final>{`After 2 trials (lps): ${HC_PIPES_1213.map((p) => `${p.id} ${n(Math.abs(r.flows[p.id]), 2)}`).join(', ')}`}</Final>
    </Block>
  )
}
const final1213_2c = `After two trials (lps): AB ${n(HC_1213.flows.AB, 2)}, BC ${n(HC_1213.flows.BC, 2)}, DC ${n(HC_1213.flows.DC, 2)}, AD ${n(HC_1213.flows.AD, 2)}, BD ${n(HC_1213.flows.BD, 2)}; last corrections ${n(HC_1213.iters[1].loops[0].delta, 3)} and ${n(HC_1213.iters[1].loops[1].delta, 3)} lps`

// ====================================================================================================
// E. Economic dimensions of an overhead cylindrical tank (textbook)
// ====================================================================================================
export interface TankCase {
  gal: number
  gallon: 'US' | 'imperial'
  cF: number
  cW: number
  equalCost?: boolean
}
const tankRun = (t: TankCase) => {
  const V = t.gal * (t.gallon === 'US' ? US_GAL_FT3 : IMP_GAL_FT3)
  return economicTank(V, t.cF, t.cW)
}
const finalTank = (t: TankCase) => {
  const r = tankRun(t)
  return `D = ${n(r.D, 1)} ft, H = ${n(r.H, 1)} ft (V = ${comma(r.V)} ft³)${t.equalCost ? ' (equal unit cost of floor and wall assumed)' : ''}`
}
export function TankSol({ t }: { t: TankCase }) {
  const r = tankRun(t)
  const Dadopt = Math.round(r.D * 2) / 2
  const Hadopt = (4 * r.V) / (Math.PI * Dadopt * Dadopt)
  return (
    <Block>
      <Md>{`**Given.** Capacity ${comma(t.gal)} ${t.gallon === 'US' ? 'US' : 'imperial'} gallons; cost of concrete per sft: floor Tk ${t.cF}, wall Tk ${t.cW}${t.equalCost ? ' (not printed: equal unit cost assumed for floor and wall)' : ''}.`}</Md>
      <Md>{`**Assumed.** Open-top cylinder: only the floor and the wall are costed (roof and staging cost the same whatever the shape). 1 ${t.gallon === 'US' ? 'US' : 'imperial'} gallon = ${t.gallon === 'US' ? '0.13368' : '0.16054'} ft³.`}</Md>
      <Steps>
        <Step n={1} title="Volume">
          <Md>{`$V = ${comma(t.gal)} \\times ${t.gallon === 'US' ? '0.13368' : '0.16054'} = ${comma(r.V)}$ ft³ $= \\dfrac{\\pi D^2 H}{4}$, so $H = \\dfrac{4V}{\\pi D^2}$.`}</Md>
        </Step>
        <Step n={2} title="Cost as a function of D, and its minimum">
          <Md>{`$$C = c_f\\,\\frac{\\pi D^2}{4} + c_w\\,\\pi D H = c_f\\,\\frac{\\pi D^2}{4} + \\frac{4 c_w V}{D}$$
$$\\frac{dC}{dD} = \\frac{c_f \\pi D}{2} - \\frac{4 c_w V}{D^2} = 0 \\;\\Rightarrow\\; D^3 = \\frac{8\\,c_w V}{\\pi\\,c_f}$$
$$D = \\left(\\frac{8 \\times ${t.cW} \\times ${comma(r.V)}}{\\pi \\times ${t.cF}}\\right)^{1/3} = ${n(r.D, 2)}\\ \\text{ft}$$
$$H = \\frac{4V}{\\pi D^2} = \\frac{4 \\times ${comma(r.V)}}{\\pi \\times ${n(r.D, 2)}^2} = ${n(r.H, 2)}\\ \\text{ft}\\qquad (H/D = c_f/2c_w = ${n(r.ratio, 3)})$$`}</Md>
        </Step>
        <Step n={3} title="Adopt convenient dimensions">
          <Md>{`Adopt $D = ${n(Dadopt, 1)}$ ft (${n(ftToM(Dadopt), 2)} m); then $H = 4V/\\pi D^2 = ${n(Hadopt, 2)}$ ft (${n(ftToM(Hadopt), 2)} m). The cost is flat near the minimum, so rounding costs almost nothing.`}</Md>
          <Md>{`Check: floor ${n(r.floorArea, 0)} sft × Tk ${t.cF} = Tk ${comma(r.floorCost)}; wall ${n(r.wallArea, 0)} sft × Tk ${t.cW} = Tk ${comma(r.wallCost)}; total Tk ${comma(r.cost)}. At the optimum the wall costs twice the floor.`}</Md>
        </Step>
      </Steps>
      <Final>{`D = ${n(r.D, 1)} ft (≈ ${n(Dadopt, 1)} ft), H = ${n(r.H, 1)} ft (≈ ${n(Hadopt, 1)} ft); minimum shell cost Tk ${comma(r.cost)}`}</Final>
    </Block>
  )
}
const TANK_0910: TankCase = { gal: 200000, gallon: 'US', cF: 300, cW: 400 }
const TANK_1112: TankCase = { gal: 200000, gallon: 'US', cF: 1, cW: 1, equalCost: true }
const TANK_1617: TankCase = { gal: 200000, gallon: 'US', cF: 500, cW: 750 }
const TANK_2021: TankCase = { gal: 100000, gallon: 'US', cF: 1200, cW: 1800 }
const TANK_FLAG = 'Not in this term’s slides: the minimum-cost cylinder is a textbook calculus result (older papers only).'

// ====================================================================================================
// the map
// ====================================================================================================
export const SN_DTW: Record<string, EvPartMap> = {
  'ev-2007-08-3a': {
    topics: ['ev-well'],
    ans: [],
    from: ['ce22'],
    final: finalSieve(C0708),
    Sol: () => <SieveSol c={C0708} />,
    notes: ['The older sieve-data form is not worked in the CE22 slides; this applies her gravel-pack (D30 × 4–6) and slot-number rules to the sieve table. The aquifer thickness (40 m) and the 10 % open area are as printed. The first half of this question (direct vs reverse rotary drilling) is theory.'],
  },
  'ev-2008-09-8a': {
    topics: ['ev-well'],
    ans: [],
    from: ['ce22'],
    final: finalSieve(C0809),
    Sol: () => <SieveSol c={C0809} />,
    notes: ['No strainer diameter, open area or aquifer thickness is printed, and only the slot size and gravel pack are asked, so no yield is worked out.'],
  },
  'ev-2011-12-4b': {
    topics: ['ev-well'],
    ans: [],
    from: ['ce22'],
    final: finalSieve(C1112),
    Sol: () => <SieveSol c={C1112} />,
    notes: ['The aquifer thickness is not printed; 40 m is assumed (it is the value in the 2007-08 version of the same table).'],
  },
  'ev-2012-13-7c': {
    topics: ['ev-well'],
    ans: [],
    from: ['ce22'],
    final: finalSieve(C1213),
    Sol: () => <SieveSol c={C1213} />,
    notes: ['The aquifer thickness is not printed; 40 m is assumed.'],
  },
  'ev-2015-16-3b': {
    topics: ['ev-well'],
    ans: [],
    from: ['ce22'],
    final: finalSieve(C1516),
    Sol: () => <SieveSol c={C1516} />,
    notes: ['The aquifer thickness is not printed; 40 m is assumed.'],
  },
  'ev-2016-17-3a': {
    topics: ['ev-well'],
    ans: [],
    from: ['ce22'],
    final: finalSieve(C1213),
    Sol: () => <SieveSol c={C1213} />,
    notes: ['Same table and data as 2012-13 Q7(c). The aquifer thickness is not printed; 40 m is assumed.'],
  },
  'ev-2022-23-6c': {
    topics: ['ev-well'],
    ans: [],
    from: ['ce22'],
    final: finalDtw(D2223),
    notes: [
      'The gradation curve of Figure 2 is read by eye from the transcription (D10 ≈ 0.14, D30 ≈ 0.203, D60 ≈ 0.313 mm, Cu ≈ 2.2): ±0.01 mm. The pack factor 5.48 is rounded to 5 as she rounds 5.36 to 5; with 5.5 the slot would be #30, so state the rounding you use.',
      'F_B = 3 (class default when none is given). Housing: 6-in strainer, 14-in housing pipe (bowl 12 in).',
    ],
    Sol: () => (
      <DtwSol
        d={D2223}
        curve={{ pts: CURVE_2223, label: 'finest sand (Fig. 2)' }}
        given={['static water level 150 ft', 'water-bearing strata 180–350 ft, drinking-quality water', 'gradation curve of the finest sand from Fig. 2 (D10 ≈ 0.14, D30 ≈ 0.203, D60 ≈ 0.313 mm)', '6 in strainer, 14 in housing pipe', 'open area 20 / 15 / 10 % for 40 / 30 / 20-slot']}
        assumed={['water-level decline 2 ft/yr over 20 yr', 'drawdown 15 ft and safety margin 15 ft', 'entrance velocity 0.1 ft/s, blockage factor F_B = 3', 'steel strainer; sand trap 10 ft; pack thickness 6 in', 'FM of the layer read from the curve (≈ 1.4); no clay inside 180–350 ft']}
        extra={`(With the class's other tip F_B = 2.5 the yield is ${n(designDtw({ layers: D2223.input.layers, housing: D2223.input.housing, strainerDia: 6, packThickness: 6, fb: 2.5 }).yield.cfs, 3)} cusec.)`}
      />
    ),
  },
  'ev-2023-24-5b': {
    topics: ['ev-well'],
    ans: [],
    from: ['ce22', 'notes'],
    final: finalDtw(D2324),
    notes: ['Follows her typed Chandpur solution (Doubts and M4 step 9): strainer 900–1000 ft with the 100 ft screen centred in the 880–1020 ft layer, pack from 850 ft, F_B = 2.5, uPVC. With the class default F_B = 3 the yield is 0.349 cusec (35,600 L/h).'],
    Sol: () => (
      <DtwSol
        d={D2324}
        given={['piezometric (static) level 80 ft', 'very saline water in the shallow aquifer', 'strainer 8 in uPVC', 'gravel pack D60 / D30 / D10 = 1.35 / 1.0 / 0.7 mm, thickness 8 in', 'open area 20 / 15 / 10 % (steel) for 40 / 30 / 20-slot, half for uPVC']}
        assumed={['decline 2 ft/yr over 20 yr, drawdown 15 ft, safety 15 ft', 'entrance velocity 0.1 ft/s, F_B = 2.5 (as in her typed solution)', 'layers 1–3 (400–740 ft) lie above the 740–880 ft clay seal and carry the saline water, so they are left out', 'sand trap 10 ft; the screen is centred in the 880–1020 ft layer, pack 50 ft above the screen']}
      />
    ),
  },

  'ev-2022-23-7c': {
    topics: ['ev-dist'],
    ans: [],
    from: ['ce22'],
    final: `BC = ${R2223_7c.pipes[0].Din} in, CD = ${R2223_7c.pipes[1].Din} in; P at D = ${n(R2223_7c.pressure.D, 1)} psi (≥ 30)`,
    Sol: () => <Sol2223_7c />,
    notes: ['Design velocity 3 fps and f = 0.01 are her class values; the paper does not state them. "10 % loss and wastage" is applied as × 1.10.'],
  },
  'ev-2023-24-6a': {
    topics: ['ev-dist'],
    ans: [],
    from: ['ce22'],
    final: final2324_6a,
    Sol: () => <Sol2324_6a />,
    notes: ['The table lists "1-2, 2-2 [sic], 4-5, 4-6"; it is read as the demand at nodes 2, 3, 5 and 6. The stub left of node 2 has no length or demand and is ignored. 70 psi is taken at the base of the OH tank.'],
  },
  'ev-2012-13-2c': {
    topics: ['ev-dist'],
    ans: [],
    from: ['ce22'],
    final: final1213_2c,
    Sol: () => <Sol2012_2c />,
    notes: ['Hardy Cross with the printed head-loss law instead of her k = 1. The figure transcription fixes the external flows; the first-guess directions (CD flows D→C) follow from continuity.'],
  },
  'ev-2009-10-2b': {
    topics: ['ev-dist'],
    ans: [],
    from: ['none'],
    flag: 'The network figure cannot be read: the pipe topology is hidden by a watermark, the inflow (6 cfs) and outflows (3 × 1 cfs) do not balance, and the head loss must be read off a printed Hazen–Williams nomograph (C = 100). Method: assume flows that satisfy continuity, take h_f per 1000 ft from the nomograph, ΣH/1.85Σ|H/Q| per loop, repeat (see the Hardy Cross lab).',
    notes: ['Pipe sizes as read: 8 in and 4 in, lengths 2500–5000 ft.'],
  },


  // 2009-10 Q1(d) and 2020-21 Q2(c) (plain "gallon" = British, as on Rowshan ma'am's slides) are solved in rm-math.tsx
  'ev-2011-12-8d': {
    topics: ['ev-dist'],
    ans: [],
    from: ['textbook'],
    flag: TANK_FLAG,
    final: finalTank(TANK_1112),
    Sol: () => <TankSol t={TANK_1112} />,
    notes: ['No unit costs are printed: equal cost for floor and wall is assumed, which gives D = 2H. The question text is "0.20 million gallons (US)".'],
  },
  'ev-2016-17-6c': {
    topics: ['ev-dist'],
    ans: [],
    from: ['textbook'],
    flag: TANK_FLAG,
    final: finalTank(TANK_1617),
    Sol: () => <TankSol t={TANK_1617} />,
  },

}
