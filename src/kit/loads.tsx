// Solution renderers for code-based load calculations (BNBC 2020) and determinacy.

import { useMemo, type ReactNode } from 'react'
import { determinacy } from '../engine/determinacy'
import { baseShear, Cs as CsFn, CT, floorSeismicWeight, importanceEQ, kExponent, period, SOIL, SYSTEMS, ZONE_Z, type FloorWeight, type SiteClass, type SystemKey } from '../engine/eq'
import { reducedLL } from '../engine/llr'
import type { Model } from '../engine/model'
import { CP_WINDWARD, cpLeeward, GCPI, gustRigid, importanceWind, KD_BUILDING, Kz, kzt as kztFn, qz, storeyForces, TERRAIN, type Enclosure, type Exposure, type KztInput } from '../engine/wind'
import { fmt } from '../components/DiagramView'
import { StructureView } from '../components/StructureView'
import { Tex } from '../components/ui'

const Row = ({ k, v, f }: { k: ReactNode; v: ReactNode; f?: string }) => (
  <tr>
    <td className="txt text-mute">{k}</td>
    <td className="txt">{f ? <Tex>{f}</Tex> : null}</td>
    <td className="font-semibold">{v}</td>
  </tr>
)

// ---------------------------------------------------------------- wind: analytical
export interface WindAnalyticalProps {
  V: number
  exp: Exposure
  occ?: 1 | 2 | 3 | 4
  I?: number
  Kzt?: number
  Kd?: number
  G?: number
  /** dimension normal to wind (B) and parallel (L), m */
  B: number
  L: number
  levels: number[]
  h?: number
  enclosure?: Enclosure
  parapet?: { height: number; GCpnWindward?: number; GCpnLeeward?: number }
  /** show the storey-force table (overall forces) */
  forces?: boolean
  note?: ReactNode
}

export function WindAnalytical(p: WindAnalyticalProps) {
  const I = p.I ?? importanceWind(p.occ ?? 2, p.V)
  const Kd = p.Kd ?? KD_BUILDING
  const G = p.G ?? 0.85
  const r = useMemo(() => storeyForces({ V: p.V, exp: p.exp, I, Kzt: p.Kzt ?? 1, Kd, G, B: p.B, L: p.L, levels: p.levels, h: p.h, parapet: p.parapet }), [p, I, Kd, G])
  const gcpi = GCPI[p.enclosure ?? 'enclosed']
  const t = TERRAIN[p.exp]
  return (
    <div className="space-y-3 text-sm">
      <table className="tbl w-auto">
        <tbody>
          <Row k="Basic wind speed" v={`${fmt(p.V)} m/s`} />
          <Row k="Importance factor" v={fmt(I)} f={`I`} />
          <Row k="Directionality factor (buildings)" v={fmt(Kd)} f="K_d" />
          <Row k="Topographic factor" v={fmt(p.Kzt ?? 1, 3)} f="K_{zt}" />
          <Row k={`Exposure ${p.exp}: α, z_g`} v={`${t.alpha}, ${t.zg} m`} />
          <Row k="Gust effect factor" v={fmt(G, 3)} f="G" />
          <Row k={`Wall Cp (L/B = ${fmt(p.L / p.B, 2)})`} v={`windward ${CP_WINDWARD}, leeward ${fmt(cpLeeward(p.L / p.B), 2)}`} />
          <Row k={`Internal pressure (${p.enclosure ?? 'enclosed'})`} v={`±${gcpi}`} f="GC_{pi}" />
          <Row k="Mean roof height" v={`${fmt(r.h)} m`} f="h" />
        </tbody>
      </table>
      <Tex block>{`q_z = 0.000613\\,K_z K_{zt} K_d V^2 I\\ \\text{(kN/m}^2),\\quad K_z = 2.01\\left(\\tfrac{z}{z_g}\\right)^{2/\\alpha}\\ (z\\ge 4.57\\text{ m})`}</Tex>
      <Tex block>{`p = q\\,G\\,C_p - q_i(GC_{pi}),\\qquad q_h = ${fmt(r.qh, 4)}\\ \\text{kN/m}^2\\ (K_h = ${fmt(r.Kh, 4)}),\\quad p_{leeward} = q_h G C_p = ${fmt(r.pl, 4)}`}</Tex>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Level</th>
              <th>z (m)</th>
              <th>Kz</th>
              <th>qz</th>
              <th>p windward</th>
              <th>p leeward</th>
              <th>net (ext.)</th>
              {p.forces !== false && (
                <>
                  <th>Trib. h (m)</th>
                  <th>Area (m²)</th>
                  <th>Force (kN)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {r.rows.map((x) => (
              <tr key={x.level}>
                <td>{x.level}</td>
                <td>{fmt(x.z)}</td>
                <td>{fmt(x.Kz, 4)}</td>
                <td>{fmt(x.qz, 4)}</td>
                <td>{fmt(x.pw, 4)}</td>
                <td>{fmt(x.pl, 4)}</td>
                <td>{fmt(x.net, 4)}</td>
                {p.forces !== false && (
                  <>
                    <td>{fmt(x.trib)}</td>
                    <td>{fmt(x.area)}</td>
                    <td>{fmt(x.F)}</td>
                  </>
                )}
              </tr>
            ))}
            {r.parapet && (
              <tr className="hl">
                <td className="txt">Parapet</td>
                <td>{fmt(r.parapet.zp)}</td>
                <td>{fmt(r.parapet.Kz, 4)}</td>
                <td>{fmt(r.parapet.qp, 4)}</td>
                <td>{fmt(r.parapet.pw, 4)}</td>
                <td>{fmt(r.parapet.pl, 4)}</td>
                <td>{fmt(r.parapet.net, 4)}</td>
                {p.forces !== false && (
                  <>
                    <td>{fmt(p.parapet!.height)}</td>
                    <td>{fmt(r.parapet.area)}</td>
                    <td>{fmt(r.parapet.F)}</td>
                  </>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {r.parapet && (
        <div>
          Parapet: <Tex>{`p_p = q_p (GC_{pn})`}</Tex> with q_p at the top of the parapet: windward = {fmt(r.parapet.qp, 4)} × {p.parapet?.GCpnWindward ?? 1.5} = <b className="num">{fmt(r.parapet.pw, 3)} kN/m²</b>, leeward ={' '}
          {fmt(r.parapet.qp, 4)} × ({p.parapet?.GCpnLeeward ?? -1}) = <b className="num">{fmt(r.parapet.pl, 3)} kN/m²</b>.
        </div>
      )}
      {p.forces !== false && (
        <div className="text-base">
          Base shear (sum of storey forces) = <b className="num">{fmt(r.base)} kN</b>
        </div>
      )}
      <p className="text-xs text-faint">Internal pressure acts equally on the windward and leeward walls, so it cancels in the overall storey force; it matters for individual walls / frames ({'±'}q_h·GC_pi = ±{fmt(r.qh * gcpi, 3)} kN/m²).</p>
      {p.note}
    </div>
  )
}

export function KztSolution(p: KztInput & { zLabel?: string; unit?: string }) {
  const r = kztFn(p)
  const u = p.unit ?? 'm'
  return (
    <div className="text-sm space-y-1">
      <div>
        Shape: <b>{p.hill === 'escarpment' ? '2-D escarpment' : p.hill === 'ridge' ? '2-D ridge' : '3-D axisymmetric hill'}</b>, exposure {p.exp}. Check H/L<sub>h</sub> = {fmt(p.H)}/{fmt(p.Lh)} = {fmt(p.H / p.Lh, 3)}
        {r.capped ? ` > 0.5 → use H/Lh = 0.5 and Lh = 2H = ${fmt(r.Lh)} ${u}` : ' (≤ 0.5, use as is)'} (and ≥ 0.2 ✓).
      </div>
      <Tex block>{`K_1 = \\left(\\tfrac{K_1}{H/L_h}\\right)\\frac{H}{L_h} = ${r.K1ratio}\\times ${fmt(r.ratio, 3)} = ${fmt(r.K1, 4)}`}</Tex>
      <Tex block>{`K_2 = 1 - \\frac{|x|}{\\mu L_h} = 1 - \\frac{${fmt(p.x)}}{${r.mu}\\times ${fmt(r.Lh)}} = ${fmt(r.K2, 4)}\\quad(\\mu = ${r.mu},\\ ${p.downwind ? 'downwind' : 'upwind'}\\text{ of crest})`}</Tex>
      <Tex block>{`K_3 = e^{-\\gamma z/L_h} = e^{-${r.gamma}\\times ${fmt(p.z, 3)}/${fmt(r.Lh)}} = ${fmt(r.K3, 4)}`}</Tex>
      <Tex block>{`K_{zt} = (1 + K_1K_2K_3)^2 = \\mathbf{${fmt(r.Kzt, 4)}}`}</Tex>
    </div>
  )
}

export function GustRigidSolution({ h, B, exp }: { h: number; B: number; exp: Exposure }) {
  const g = gustRigid({ h, B, exp })
  const t = TERRAIN[exp]
  return (
    <div className="text-sm">
      <Tex block>{`\\bar z = \\max(0.6h, z_{min}) = \\max(${fmt(0.6 * h)}, ${t.zmin}) = ${fmt(g.zbar, 3)}\\text{ m}`}</Tex>
      <Tex block>{`I_{\\bar z} = c\\left(\\tfrac{10}{\\bar z}\\right)^{1/6} = ${t.c}\\left(\\tfrac{10}{${fmt(g.zbar, 3)}}\\right)^{1/6} = ${fmt(g.Iz, 4)}`}</Tex>
      <Tex block>{`L_{\\bar z} = l\\left(\\tfrac{\\bar z}{10}\\right)^{\\bar\\epsilon} = ${t.l}\\left(\\tfrac{${fmt(g.zbar, 3)}}{10}\\right)^{${fmt(t.ebar, 4)}} = ${fmt(g.Lz, 3)}\\text{ m}`}</Tex>
      <Tex block>{`Q = \\sqrt{\\frac{1}{1 + 0.63\\left(\\frac{B+h}{L_{\\bar z}}\\right)^{0.63}}} = ${fmt(g.Q, 4)}`}</Tex>
      <Tex block>{`G = 0.925\\left(\\frac{1 + 1.7 g_Q I_{\\bar z} Q}{1 + 1.7 g_v I_{\\bar z}}\\right) = \\mathbf{${fmt(g.G, 4)}}\\quad(g_Q = g_v = 3.4)`}</Tex>
    </div>
  )
}

// ---------------------------------------------------------------- earthquake
export interface EQSolutionProps {
  zone?: 1 | 2 | 3 | 4
  Z?: number
  occ: 1 | 2 | 3 | 4
  I?: number
  site: SiteClass
  system: SystemKey
  R?: number
  ct?: keyof typeof CT
  hn: number
  eta?: number
  floors: FloorWeight[]
  /** what to highlight */
  levels?: string[]
  weightNote?: ReactNode
  sdcNote?: ReactNode
}

export function EQSolution(p: EQSolutionProps) {
  const Z = p.Z ?? ZONE_Z[p.zone ?? 2]
  const I = p.I ?? importanceEQ(p.occ)
  const sys = SYSTEMS[p.system]
  const R = p.R ?? sys.R
  const per = period(p.ct ?? (p.system.endsWith('steel') ? 'steel_mrf' : 'rc_mrf'), p.hn)
  const eta = p.eta ?? 1
  const s = SOIL[p.site]
  const r = useMemo(() => baseShear({ Z, I, R, site: p.site, T: per.T, eta, floors: p.floors }), [Z, I, R, p.site, per.T, eta, p.floors])
  const branchF = ['', `S\\left(1+\\tfrac{T}{T_B}(2.5\\eta-1)\\right)`, `2.5S\\eta`, `2.5S\\eta\\tfrac{T_C}{T}`, `2.5S\\eta\\tfrac{T_CT_D}{T^2}`][r.branch]
  return (
    <div className="space-y-3 text-sm">
      <table className="tbl w-auto">
        <tbody>
          <Row k="Seismic zone coefficient" v={fmt(Z)} f="Z" />
          <Row k={`Occupancy category ${['', 'I', 'II', 'III', 'IV'][p.occ]} → importance factor`} v={fmt(I)} f="I" />
          <Row k={`Site class ${p.site}`} v={`S = ${s.S}, T_B = ${s.TB}, T_C = ${s.TC}, T_D = ${s.TD} s`} />
          <Row k={`${sys.name}`} v={`R = ${R}, Ω₀ = ${sys.Omega}, Cd = ${sys.Cd}`} />
          <Row k="Period" v={`${fmt(per.T, 4)} s`} f={`T = C_t h_n^m = ${per.Ct}\\times ${fmt(p.hn)}^{${per.m}}`} />
          <Row k="Damping correction" v={fmt(eta)} f="\eta" />
        </tbody>
      </table>
      {p.sdcNote}
      <Tex block>{`C_s = ${branchF} = ${fmt(r.Cs, 4)}\\quad(\\text{branch ${r.branch}: } ${['', '0\\le T\\le T_B', 'T_B\\le T\\le T_C', 'T_C\\le T\\le T_D', 'T_D\\le T\\le 4s'][r.branch]})`}</Tex>
      <Tex block>{`S_a = \\frac{2}{3}\\frac{ZI}{R}C_s = \\frac{2}{3}\\cdot\\frac{${fmt(Z)}\\times${fmt(I)}}{${fmt(R)}}\\times ${fmt(r.Cs, 4)} = ${fmt(r.SaRaw, 5)}\\ \\ (\\ge 0.67\\beta ZIS = ${fmt(r.SaMin, 5)})\\Rightarrow S_a = \\mathbf{${fmt(r.Sa, 5)}}`}</Tex>
      {p.weightNote}
      <Tex block>{`W = ${fmt(r.W)}\\text{ kN}\\qquad V = S_aW = \\mathbf{${fmt(r.V)}}\\text{ kN}\\ \\ (${fmt(r.Sa * 100, 3)}\\%\\text{ of }W)`}</Tex>
      <Tex block>{`k = ${r.k === 1 ? '1\\ (T\\le0.5)' : r.k === 2 ? '2\\ (T\\ge2.5)' : `1 + \\tfrac{T-0.5}{2} = ${fmt(r.k, 4)}`},\\qquad F_x = V\\frac{w_x h_x^k}{\\sum w_i h_i^k}`}</Tex>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Level</th>
              <th>w (kN)</th>
              <th>h (m)</th>
              <th>w·h^k</th>
              <th>ratio</th>
              <th>Fx (kN)</th>
              <th>Storey shear (kN)</th>
            </tr>
          </thead>
          <tbody>
            {[...r.rows]
              .sort((a, b) => b.h - a.h)
              .map((x) => (
                <tr key={x.name} className={p.levels?.includes(x.name) ? 'hl' : ''}>
                  <td className="txt">{x.name}</td>
                  <td>{fmt(x.w)}</td>
                  <td>{fmt(x.h)}</td>
                  <td>{fmt(x.whk, 1)}</td>
                  <td>{fmt(x.ratio, 4)}</td>
                  <td>{fmt(x.F)}</td>
                  <td>{fmt(x.Vx)}</td>
                </tr>
              ))}
            <tr>
              <td className="txt font-bold">Σ</td>
              <td>{fmt(r.W)}</td>
              <td />
              <td>{fmt(r.sum, 1)}</td>
              <td>1</td>
              <td>{fmt(r.V)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function eqResult(p: EQSolutionProps) {
  const Z = p.Z ?? ZONE_Z[p.zone ?? 2]
  const I = p.I ?? importanceEQ(p.occ)
  const R = p.R ?? SYSTEMS[p.system].R
  const per = period(p.ct ?? (p.system.endsWith('steel') ? 'steel_mrf' : 'rc_mrf'), p.hn)
  return { ...baseShear({ Z, I, R, site: p.site, T: per.T, eta: p.eta ?? 1, floors: p.floors }), T: per.T }
}

/**
 * Typical BUET building: GF slab at `base` height above foundation (pedestal level 0), n storeys of height h.
 * Floor i (1..n) weight = area(DL + f·LL) except roof (roof DL, f·roofLL). GF level (h = base) carries typical floor loads if gfFloor.
 */
export function buildingFloors(o: { area: number; DL: number; LL: number; roofLL: number; roofDL?: number; storeys: number; h: number; base: number; gfFloor?: boolean; pedestal?: number }) {
  const out: FloorWeight[] = []
  if (o.pedestal) out.push({ name: 'Base (pedestals)', h: 0, w: o.pedestal })
  const typ = floorSeismicWeight(o.area, o.DL, o.LL).w
  const roof = o.area * ((o.roofDL ?? o.DL) + (o.roofLL <= 3 ? 0.25 : 0.5) * o.roofLL)
  if (o.gfFloor !== false && o.base > 0) out.push({ name: 'GF (L1)', h: o.base, w: typ })
  for (let i = 1; i <= o.storeys; i++) {
    const hh = o.base + i * o.h
    out.push({ name: i === o.storeys ? 'Roof' : `L${o.base > 0 ? i + 1 : i}`, h: hh, w: i === o.storeys ? roof : typ })
  }
  return out
}

export function SpectrumPlot({ site, T, eta = 1 }: { site: SiteClass; T?: number; eta?: number }) {
  const W = 520,
    H = 220,
    pad = 36
  const tmax = 4
  const cmax = 2.5 * 1.4 * eta * 1.1
  const X = (t: number) => pad + (t / tmax) * (W - 2 * pad)
  const Y = (c: number) => H - pad - (c / cmax) * (H - 2 * pad)
  const pts: string[] = []
  for (let i = 0; i <= 400; i++) {
    const t = (tmax * i) / 400
    pts.push(`${X(t)},${Y(CsFn(t, site, eta).Cs)}`)
  }
  const s = SOIL[site]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--c-faint)" />
      <line x1={pad} y1={pad / 2} x2={pad} y2={H - pad} stroke="var(--c-faint)" />
      {[s.TB, s.TC, s.TD].map((t, i) => (
        <g key={i}>
          <line x1={X(t)} x2={X(t)} y1={pad / 2} y2={H - pad} stroke="var(--c-line)" strokeDasharray="3 4" />
          <text x={X(t)} y={H - pad + 14} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
            {['T_B', 'T_C', 'T_D'][i]}={t}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((t) => (
        <text key={t} x={X(t)} y={H - 6} fontSize={10} textAnchor="middle" fill="var(--c-faint)">
          {t}s
        </text>
      ))}
      <polyline points={pts.join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth={2.2} />
      <text x={pad + 4} y={pad / 2 + 10} fontSize={11} fill="var(--c-mute)">
        Cs (site {site})
      </text>
      {T !== undefined && (
        <g>
          <line x1={X(T)} x2={X(T)} y1={Y(CsFn(T, site, eta).Cs)} y2={H - pad} stroke="var(--c-load)" strokeDasharray="4 3" />
          <circle cx={X(T)} cy={Y(CsFn(T, site, eta).Cs)} r={5} fill="var(--c-load)" />
          <text x={X(T) + 7} y={Y(CsFn(T, site, eta).Cs) - 7} fontSize={11} fill="var(--c-load)" fontWeight={700}>
            T={fmt(T, 3)}s, Cs={fmt(CsFn(T, site, eta).Cs, 3)}
          </text>
        </g>
      )}
    </svg>
  )
}

export { kExponent }

// ---------------------------------------------------------------- live-load reduction
export function LLRSolution({ rows, L0 }: { L0: number; rows: { label: string; AT: number; KLL: number; floors: number; ATnote?: string }[] }) {
  return (
    <div className="text-sm space-y-2">
      <Tex block>{`L = L_0\\left(0.25 + \\frac{4.57}{\\sqrt{K_{LL}A_T}}\\right),\\quad K_{LL}A_T \\ge 37.16\\text{ m}^2;\\quad L \\ge 0.5L_0\\ (\\text{one floor}),\\ 0.4L_0\\ (\\text{two or more})`}</Tex>
      <table className="tbl">
        <thead>
          <tr>
            <th>Member / level</th>
            <th>A_T (m²)</th>
            <th>K_LL</th>
            <th>K_LL·A_T</th>
            <th>factor</th>
            <th>limit</th>
            <th>L (kN/m²)</th>
            <th>reduction</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const x = reducedLL({ L0, KLL: r.KLL, AT: r.AT, floorsSupported: r.floors })
            return (
              <tr key={r.label}>
                <td className="txt">
                  {r.label}
                  {r.ATnote && <div className="text-[11px] text-faint">{r.ATnote}</div>}
                </td>
                <td>{fmt(r.AT)}</td>
                <td>{r.KLL}</td>
                <td>{fmt(x.KA)}</td>
                <td>{x.applies ? fmt(x.factor, 4) : 'no reduction'}</td>
                <td>{fmt(x.min, 3)}</td>
                <td className="font-bold">{fmt(x.L, 3)}</td>
                <td>{fmt(x.reductionPct, 1)}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------- determinacy
export function DeterminacyCard({ m, label, unit = '′', noAxial = true }: { m: Model; label?: string; unit?: string; noAxial?: boolean }) {
  const d = useMemo(() => determinacy(m), [m])
  return (
    <div className="rounded-xl border border-line p-3">
      {label && <div className="font-bold mb-1">{label}</div>}
      <StructureView model={m} showLoads={false} nodeLabels={false} maxHeight={170} lenUnit={unit} />
      <div className="text-sm space-y-0.5 mt-1">
        <div>
          {d.kind === 'truss' ? (
            <Tex>{`b = ${d.m},\\ r = ${d.r},\\ j = ${d.j}`}</Tex>
          ) : (
            <Tex>{`m = ${d.m},\\ r = ${d.r},\\ j = ${d.j},\\ c = ${d.c}`}</Tex>
          )}
        </div>
        <div>
          <Tex>{`\\text{DOSI} = ${d.formula.replace('−', '-')} = ${d.dosiFormula}`}</Tex>{' '}
          {!d.stable ? <b className="text-bad">→ unstable{d.geometricallyUnstable ? ' (geometrically)' : ''}</b> : <b className="text-good">→ {d.dosi === 0 ? 'determinate' : `indeterminate to degree ${d.dosi}`}</b>}
        </div>
        <div>
          DOKI = <b className="num">{d.doki}</b>
          {noAxial && d.kind === 'frame' && (
            <>
              {' '}
              (ignoring axial deformation: <b className="num">{d.dokiNoAxial}</b>)
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** the four MWFRS wind load cases (BNBC 2020 Fig 6.2.9 / ASCE 7-05 Fig 6-9) drawn in plan */
export function WindLoadCases() {
  const box = (x: number, y: number, title: string, arrows: { side: 'W' | 'S'; f: string; ecc?: boolean }[], torsion?: boolean) => {
    const s = 90
    return (
      <g transform={`translate(${x},${y})`}>
        <rect x={40} y={30} width={s} height={s} fill="var(--c-panel2)" stroke="var(--c-mute)" strokeWidth={1.5} />
        <text x={85} y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--c-ink)">
          {title}
        </text>
        {arrows.map((a, i) =>
          a.side === 'W' ? (
            <g key={i}>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1={8} y1={30 + s * f + (a.ecc ? -8 : 0)} x2={36} y2={30 + s * f + (a.ecc ? -8 : 0)} stroke="var(--c-load)" strokeWidth={2} markerEnd="url(#arw)" />
              ))}
              <text x={20} y={140} fontSize={10.5} fill="var(--c-load)" textAnchor="middle">
                {a.f}
              </text>
            </g>
          ) : (
            <g key={i}>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1={40 + s * f + (a.ecc ? 8 : 0)} y1={150} x2={40 + s * f + (a.ecc ? 8 : 0)} y2={124} stroke="var(--c-accent)" strokeWidth={2} markerEnd="url(#arw)" />
              ))}
              <text x={150} y={150} fontSize={10.5} fill="var(--c-accent)">
                {a.f}
              </text>
            </g>
          ),
        )}
        {torsion && <path d="M70,75 a15,15 0 1,1 30,0" fill="none" stroke="var(--c-accent2)" strokeWidth={2} markerEnd="url(#arw)" />}
      </g>
    )
  }
  return (
    <svg viewBox="0 0 760 175" className="w-full h-auto">
      <defs>
        <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>
      {box(0, 0, 'Case 1: full, each direction alone', [{ side: 'W', f: 'P_W' }])}
      {box(190, 0, 'Case 2: 0.75P + torsion', [{ side: 'W', f: '0.75P_W', ecc: true }], true)}
      {box(380, 0, 'Case 3: 0.75P both ways', [{ side: 'W', f: '0.75P_W' }, { side: 'S', f: '0.75P_L' }])}
      {box(570, 0, 'Case 4: 0.563P both + torsion', [{ side: 'W', f: '0.563P_W', ecc: true }, { side: 'S', f: '0.563P_L', ecc: true }], true)}
    </svg>
  )
}
