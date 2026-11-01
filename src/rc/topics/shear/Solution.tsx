// Full worked solution of a stirrup design, every number from the shear engine.
import { fmt } from '../../../components/DiagramView'
import { Tex } from '../../../components/ui'
import { checkLayout, shearAt, type RunLayout, type ShearBeam, type ShearDesign, type ShearRun, type ShearSection } from '../../engine/shear'
import { BeamLoads, SpacingChart, StirrupSketch, VuDiagram } from './figs'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)

/** runs that are mirror images of an earlier run are reported once */
export function distinctRuns(dsg: ShearDesign) {
  const out: { run: ShearRun; same: ShearRun[] }[] = []
  for (const r of dsg.runs) {
    const twin = out.find((o) => Math.abs(o.run.Vd - r.Vd) < 1e-6 && Math.abs(o.run.len - r.len) < 1e-6 && Math.abs(o.run.uReqEnd - r.uReqEnd) < 1e-6 && Math.abs(o.run.VuAt(o.run.len / 2) - r.VuAt(r.len / 2)) < 1e-6)
    if (twin) twin.same.push(r)
    else out.push({ run: r, same: [] })
  }
  return out
}

export function layoutText(lay: RunLayout) {
  if (!lay.count) return 'no stirrups required'
  return [`1 @ ${fmt(lay.first, 1)} in`, ...lay.zones.map((z) => `${z.n} @ ${fmt(z.s, 1)} in`)].join(', ') + ` = ${fmt(lay.last, 1)} in (${lay.count} stirrups)`
}

export function ShearSolution({ bm, sec, dsg, layouts, barLabel = '#3 two-legged' }: { bm: ShearBeam; sec: ShearSection; dsg: ShearDesign; layouts?: Record<string, RunLayout>; barLabel?: string }) {
  const { dg, lim } = dsg
  const lays = layouts ?? dsg.layouts
  const phi = lim.phi
  const sw = bm.selfWeight
  const sqrt = lim.sqrtFc
  return (
    <div className="space-y-3 text-sm">
      <div className="font-bold">1. Factored loads and shear-force diagram</div>
      {sw && (
        <Tex block>{`w_{sw} = \\frac{${sw.b}\\times${sw.h}}{144}(0.150) = ${f3(dg.wsw)}\\ \\text{k/ft}\\ \\ (\\times ${bm.factored ? bm.swFactor ?? 1.2 : bm.fD ?? 1.2})`}</Tex>
      )}
      {!bm.factored && (
        <Tex block>{`w_u = 1.2(${f2((bm.wD ?? 0) + dg.wsw)}) + 1.6(${f2(bm.wL ?? 0)}) = ${f3(dg.wu)}\\ \\text{k/ft}${(bm.P ?? []).length ? ',\\ \\ P_u = 1.2P_D + 1.6P_L' : ''}`}</Tex>
      )}
      {bm.factored && <Tex block>{`w_u = ${f3(dg.wu)}\\ \\text{k/ft}${dg.Pu.length ? `,\\ \\ P_u = ${dg.Pu.map((p) => f2(p.P)).join(',\\ ')}\\ \\text{k}` : ''}\\ \\ (\\text{given factored})`}</Tex>}
      {dg.cases.length > 1 && <p className="text-mute">Load cases considered: {dg.cases.join('; ')}. The design uses the envelope of |V|.</p>}
      <p>
        Reactions (full load): {dg.R.map((R, i) => `R${dg.fixed ? '' : i === 0 ? 'A' : 'B'} = ${f2(R)} k`).join(', ')}.
      </p>
      <div className="rounded-xl border border-line bg-bg/60 p-2 space-y-1">
        <BeamLoads bm={bm} dsg={dsg} />
        <VuDiagram dsg={dsg} d={sec.d} />
      </div>
      <div className="font-bold">2. Concrete shear strength (φ = {phi})</div>
      <Tex block>{`\\phi V_c = \\phi\\,2\\lambda\\sqrt{f'_c}\\,b_wd = ${phi}\\times2\\times${lim.lambda}\\times${f2(sqrt)}\\times${sec.bw}\\times${sec.d}/1000 = ${f2(lim.phiVc)}\\ \\text{k},\\quad \\tfrac12\\phi V_c = ${f2(lim.halfPhiVc)}\\ \\text{k}`}</Tex>
      <Tex block>{`\\phi4\\sqrt{f'_c}b_wd = ${f2(lim.phiVs4)}\\ \\text{k},\\quad \\phi8\\sqrt{f'_c}b_wd = ${f2(lim.phiVs8)}\\ \\text{k},\\quad V_{u,\\max} = \\phi V_c + \\phi8\\sqrt{f'_c}b_wd = ${f2(lim.VuMax)}\\ \\text{k}`}</Tex>
      <Tex block>{`\\left(\\tfrac{A_v}{s}\\right)_{\\min} = \\max\\left(\\frac{0.75\\sqrt{f'_c}b_w}{f_y}, \\frac{50b_w}{f_y}\\right) = \\max(${f4(lim.avsMin1)},\\ ${f4(lim.avsMin2)}) = ${f4(lim.avsMin)}\\ \\text{in}^2/\\text{in};\\quad A_v = ${f2(lim.Av)}\\ \\text{in}^2\\ (${barLabel})`}</Tex>
      {distinctRuns(dsg).map(({ run: r, same }, k) => {
        const a = shearAt(r.Vd, sec)
        const lay = lays[r.id]
        const chk = lay ? checkLayout(r, lay) : null
        const title = same.length ? `${r.label} (same for ${same.map((s) => s.label.toLowerCase()).join(', ')})` : r.label
        return (
          <div key={r.id} className="space-y-1.5 border-l-2 border-accent/40 pl-3">
            <div className="font-bold">
              3.{k + 1} {title}
            </div>
            {r.critAtFace ? (
              <p>
                Critical section at the face (point load within d): V<sub>u</sub> = {f2(r.Vd)} k.
              </p>
            ) : (
              <Tex block>{`V_u\\ \\text{at } d = ${sec.d}\\text{ in from the face}: \\ V_{u,d} = ${f2(r.Vd)}\\ \\text{k}\\ \\ (V_{face} = ${f2(r.Vface)}\\ \\text{k})`}</Tex>
            )}
            {a.case === 'A' && <p>V<sub>u,d</sub> ≤ φV<sub>c</sub>/2 → Case A: no shear reinforcement needed in this run.</p>}
            {a.case === 'redesign' && (
              <p className="text-bad font-semibold">
                V<sub>u,d</sub> = {f2(r.Vd)} k {'>'} V<sub>u,max</sub> = {f2(lim.VuMax)} k → redesign (enlarge the section).
              </p>
            )}
            {a.case !== 'A' && a.case !== 'redesign' && (
              <>
                <Tex block>{`\\phi V_s = V_u - \\phi V_c = ${f2(r.Vd)} - ${f2(lim.phiVc)} = ${f2(a.phiVs)}\\ \\text{k}\\ \\Rightarrow\\ \\text{Case } ${a.case}${a.case === 'B' ? '\\ (\\text{low shear, minimum steel})' : a.case === 'C' ? `\\ (${f2(a.phiVs)} \\le ${f2(lim.phiVs4)},\\ \\text{high shear})` : `\\ (${f2(lim.phiVs4)} < ${f2(a.phiVs)} \\le ${f2(lim.phiVs8)},\\ \\text{very high shear})`}`}</Tex>
                <Tex block>{`\\frac{A_v}{s} = \\max\\left[${a.case === 'B' ? '' : `\\frac{${f2(a.phiVs)}}{${phi}\\times${sec.fy / 1000}\\times${sec.d}} = ${f4(a.avsExcess)},\\ `}${f4(lim.avsMin1)},\\ ${f4(lim.avsMin2)}\\right] = ${f4(a.avs)}\\ \\text{in}^2/\\text{in}`}</Tex>
                <Tex block>{`s = \\frac{${f2(lim.Av)}}{${f4(a.avs)}} = ${f2(a.sCalc)}\\ \\text{in};\\quad s_{\\max} = ${a.case === 'D' ? `\\min(d/4, 12) = ${f2(a.sMax)}` : `\\min(d/2, 24) = ${f2(a.sMax)}`}\\ \\text{in}\\ \\Rightarrow\\ s_{req} = ${f2(a.s)}\\ \\text{in}`}</Tex>
              </>
            )}
            {a.case !== 'redesign' && (
              <ul className="list-disc ml-5">
                {r.uPhiVc !== null && (
                  <li>
                    V<sub>u</sub> = φV<sub>c</sub> = {f2(lim.phiVc)} k at <b>{f2(r.uPhiVc / 12)} ft</b> from the face (beyond it: minimum steel only).
                  </li>
                )}
                {r.uSmax !== null && (
                  <li>
                    Excess-shear spacing reaches s<sub>max</sub> = {f2(Math.min(lim.smaxC, lim.sMinSteel))} in where V<sub>u</sub> = φV<sub>c</sub> + φA<sub>v</sub>f<sub>y</sub>d/s<sub>max</sub> = {f2(lim.phiVc + (phi * lim.Av * sec.fy * sec.d) / (Math.min(lim.smaxC, lim.sMinSteel) * 1000))} k, at <b>{f2(r.uSmax / 12)} ft</b>.
                  </li>
                )}
                {r.uHalf !== null && (
                  <li>
                    V<sub>u</sub> = φV<sub>c</sub>/2 = {f2(lim.halfPhiVc)} k at <b>{f2(r.uHalf / 12)} ft</b>: no stirrups required beyond (Case A){r.uReqEnd >= r.len - 0.1 ? ' — nominal stirrups provided anyway' : ''}.
                  </li>
                )}
                {r.uLoads.length > 0 && <li>Point loads at {r.uLoads.map((u) => `${f2(u / 12)} ft`).join(', ')} from the face (jumps in Vu).</li>}
                <li>
                  Stirrups required from the face to <b>{f2(r.uReqEnd / 12)} ft</b> ({f2(r.uReqEnd)} in).
                </li>
              </ul>
            )}
            {lay && lay.count > 0 && (
              <>
                <div className="font-semibold">Zones (spacings rounded down; each zone stops where the next spacing becomes enough)</div>
                <table className="tbl w-auto">
                  <thead>
                    <tr>
                      <th>spaces</th>
                      <th>@ s (in)</th>
                      <th>length (in)</th>
                      <th>ends at (in)</th>
                      <th>next spacing OK from</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>{fmt(lay.first, 1)}</td>
                      <td>{fmt(lay.first, 1)}</td>
                      <td>{fmt(lay.first, 1)}</td>
                      <td className="txt">first stirrup ≈ s/2</td>
                    </tr>
                    {lay.zones.map((z, i) => {
                      const nxt = lay.zones[i + 1]
                      const Vs = nxt ? lim.phiVc + (phi * lim.Av * sec.fy * sec.d) / (nxt.s * 1000) : null
                      return (
                        <tr key={i}>
                          <td>{z.n}</td>
                          <td>{fmt(z.s, 1)}</td>
                          <td>{fmt(z.n * z.s, 1)}</td>
                          <td>{fmt(z.to, 1)}</td>
                          <td className="txt">{nxt ? (Vs !== null && nxt.s < Math.min(lim.smaxC, lim.sMinSteel) - 1e-6 ? `s = ${fmt(nxt.s, 1)} in where Vu ≤ ${f2(Vs)} k` : `s = ${fmt(nxt.s, 1)} in where Vu ≤ φVc (or beyond the load jump)`) : `cover to ${f2(r.uReqEnd)} in (within s/2)`}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p>
                  <b>{layoutText(lay)}</b>
                  {chk && !chk.ok && <span className="text-bad"> — this layout violates the requirement (red in the sketch)</span>}
                </p>
              </>
            )}
          </div>
        )
      })}
      <div className="font-bold">4. Layout</div>
      <div className="rounded-xl border border-line bg-bg/60 p-2 space-y-1">
        <SpacingChart dsg={dsg} layouts={lays} />
        <StirrupSketch dsg={dsg} layouts={lays} h={bm.selfWeight?.h} />
      </div>
      <p>
        <b>Design:</b> {barLabel} stirrups,{' '}
        {distinctRuns(dsg)
          .map(({ run, same }) => `${[run, ...same].map((r) => r.label.toLowerCase()).join(' & ')}: ${layoutText(lays[run.id])}`)
          .join('; ')}
        {dsg.midStirrup ? '; plus one stirrup at the zero-shear point' : ''}. Total {runsTotal(dsg, lays)} stirrups.
      </p>
      {dsg.flags.length > 0 && (
        <ul className="list-disc ml-5 text-bad">
          {dsg.flags.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const runsTotal = (dsg: ShearDesign, lays: Record<string, RunLayout>) => dsg.runs.reduce((s, r) => s + (lays[r.id]?.count ?? 0), 0) + (dsg.midStirrup ? 1 : 0)
