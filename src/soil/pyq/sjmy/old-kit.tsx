// Shared pieces for SJMY sir's half of the seven older papers (2007-08 … 2015-16): flow nets from any simulator preset
// (or a paper's own geometry), the Cc / k oedometer chain, the circular block on sand over clay (1H:2V spread, e from a
// lab e–p table), Newmark chart construction, a few plan / section sketches and a "figure missing" placeholder.
// Every number comes from the engines in src/soil/engine.
import type { ReactNode } from 'react'
import { Md, Tex } from '../../../components/ui'
import { avMv, cvFromK, cvTaylor, eFromTable, footingDp, kFromCv, scaleTime, settleDe, timeFor, tvFromTable } from '../../engine/consolidation'
import { solveNet } from '../../engine/flownet'
import { stressAt, type ProfileIn } from '../../engine/stresses'
import { NEWMARK_IF, NEWMARK_RZ } from '../../engine/stressdist'
import { GW } from '../../engine/units'
import { sci } from '../../topics/perm/Labs'
import { geomOf, NET_DEFAULT, NET_PRESETS, netResults, type NetState } from '../../topics/seep/FlowNetLab'
import { STRESS_THEORY } from '../../topics/stress/theory'
import type { SmTheoryItem } from '../../types'
import { f0, f2, f3, f4, Frm, Head, type NetCase, Note, Result, sciTex, SoilColumn, Sol, Tbl, th } from './kit'

export * from './kit'

const R = String.raw

// ---------------------------------------------------------------- theory (water + consolidation via the kit, plus stress distribution)
export function thx(topic: string, id: string): SmTheoryItem {
  if (topic === 'sm-stress') {
    const t = STRESS_THEORY.find((x) => x.id === id)
    if (!t) throw new Error(`theory item ${topic}/${id} not found`)
    return t
  }
  return th(topic, id)
}

// ---------------------------------------------------------------- flow nets: any preset id of the simulator, with overrides
const cache = new Map<string, NetCase>()
export function oldNet(id: string, over: Partial<NetState> = {}): NetCase {
  const key = id + JSON.stringify(over)
  const hit = cache.get(key)
  if (hit) return hit
  const p = NET_PRESETS.find((x) => x.id === id)
  const st: NetState = { ...NET_DEFAULT, ...(p?.st ?? {}), ...over }
  const sol = solveNet(geomOf(st), 'final')
  const c = { st, sol, R: netResults(sol, st) }
  cache.set(key, c)
  return c
}

// ---------------------------------------------------------------- the scan lacks the figure
export function MissingFig({ what, children }: { what: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-line px-3 py-4 text-center text-sm text-mute space-y-1">
      <div className="font-semibold">{what} is missing from the scanned paper</div>
      {children && <div className="text-xs">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------- Newmark chart construction (circle formula inverted)
export function NewmarkRadii({ AB }: { AB?: number }) {
  return (
    <div className="space-y-1">
      <Md>{R`Invert the circle formula: $\dfrac{r}{z} = \sqrt{\left(1 - \dfrac{\sigma_z}{q}\right)^{-2/3} - 1}$. Each ring adds 0.1q; 20 radial lines (18° apart) cut each ring into meshes of influence $0.1/20 = ${NEWMARK_IF}$ (200 meshes in all).`}</Md>
      <Tbl
        head={['σz/q', ...NEWMARK_RZ.map((_, i) => f2((i + 1) / 10)), '1.0']}
        rows={[['r/z', ...NEWMARK_RZ.map((v) => f3(v)), '∞'], ...(AB ? [[`r (cm) for AB = ${f2(AB)} cm`, ...NEWMARK_RZ.map((v) => f2(v * AB)), '—']] : [])]}
        cap="Draw the 9 circles with these radii (AB = the depth z on the drawing scale) and 20 radials."
      />
    </div>
  )
}

// ---------------------------------------------------------------- Cc, k → Δe, S, mv, cv, t50 (2007-08 Q6(c), 2009-10 Q7(c))
export const CK = { Cc: 0.27, e0: 2.04, p0: 125, p1: 187.5, kcm: 3.5e-8, H: 5 }
export function ckSolve() {
  const de = CK.Cc * Math.log10(CK.p1 / CK.p0)
  const S = settleDe(de, CK.H, CK.e0)
  const m = avMv(CK.e0, CK.e0 - de, CK.p0, CK.p1)
  const k = CK.kcm / 100
  const cv = cvFromK(k, m.mv)
  const T50 = tvFromTable(50)
  const t1 = timeFor(T50, CK.H, cv)
  const t2 = timeFor(T50, CK.H / 2, cv)
  return { de, S, av: m.av, mv: m.mv, k, cv, T50, t1, t2 }
}
export function CkSolution({ twoWay }: { twoWay?: boolean }) {
  const r = ckSolve()
  return (
    <Sol>
      <Tex block>{R`\text{(i)}\quad \Delta e = C_c\log\frac{p_1}{p_0} = 0.27\log\frac{187.5}{125} = 0.27 \times ${f4(Math.log10(1.5))} = ${f4(r.de)}`}</Tex>
      <Tex block>{R`\text{(ii)}\quad S = \frac{\Delta e\,H}{1 + e_0} = \frac{${f4(r.de)} \times 5}{1 + 2.04} = ${f4(r.S)}\ \text{m} = ${f2(r.S * 1000)}\ \text{mm}`}</Tex>
      <Md>{R`**(iii)** The rate needs $c_v = k/(m_v\gamma_w)$:`}</Md>
      <Tex block>{R`a_v = \frac{\Delta e}{\Delta p} = \frac{${f4(r.de)}}{62.5} = ${sciTex(r.av, 3)}\ \text{m}^2/\text{kN},\quad m_v = \frac{a_v}{1 + e_0} = \frac{${sciTex(r.av, 3)}}{3.04} = ${sciTex(r.mv, 3)}\ \text{m}^2/\text{kN}`}</Tex>
      <Tex block>{R`k = 3.5\times10^{-8}\ \text{cm/s} = ${sciTex(r.k, 1)}\ \text{m/s},\quad c_v = \frac{${sciTex(r.k, 1)}}{${sciTex(r.mv, 3)} \times 9.81} = ${sciTex(r.cv, 3)}\ \text{m}^2/\text{s}\ (= ${f3(r.cv * 3.156e7)}\ \text{m}^2/\text{yr})`}</Tex>
      <Tex block>{R`\text{One-way: } d = H = 5\ \text{m},\ T_{50} = ${f3(r.T50)}:\quad t_{50} = \frac{T_vd^2}{c_v} = \frac{${f3(r.T50)} \times 25}{${sciTex(r.cv, 3)}} = ${sciTex(r.t1, 3)}\ \text{s} = ${f0(r.t1 / 86400)}\ \text{days} \approx ${f2(r.t1 / 86400 / 365)}\ \text{yr}`}</Tex>
      {twoWay && (
        <>
          <Head>Both-way drainage</Head>
          <Md>{R`(i) Δe and (ii) S do **not change**: the magnitude depends only on the stress change, not on drainage. (iii) The drainage path halves, $d = H/2 = 2.5$ m, so the time falls to a quarter: $t_{50} = ${f3(r.T50)} \times 2.5^2/${sciTex(r.cv, 3)} = ${sciTex(r.t2, 3)}$ s ≈ **${f0(r.t2 / 86400)} days**.`}</Md>
        </>
      )}
      <Result>{`(i) Δe = **${f4(r.de)}**; (ii) S ≈ **${f0(r.S * 1000)} mm**; (iii) t50 ≈ **${f0(r.t1 / 86400)} days** (≈ ${f2(r.t1 / 86400 / 365)} years) with one-way drainage${twoWay ? `; ≈ ${f0(r.t2 / 86400)} days with two-way drainage` : ''}.`}</Result>
    </Sol>
  )
}

// ---------------------------------------------------------------- rigid circular block on sand over clay (2008-09 Q6(b), 2011-12 Q5(b))
export interface CircBlock {
  D: number
  q: number
  /** sand thickness, WT depth, unit weights (kN/m³) */
  Hs: number
  wt: number
  gs: number
  gsSat: number
  /** clay */
  Hc: number
  gcSat: number
  /** lab e–p table */
  ps: number[]
  es: number[]
  /** lab t90 (min), lab drainage path (m) */
  t90: number
  dLab: number
}
export const profOf = (c: CircBlock): ProfileIn => ({
  layers: [
    { name: 'sand', H: c.Hs, gamma: c.gs, gammaSat: c.gsSat },
    { name: 'clay', H: c.Hc, gamma: c.gcSat, gammaSat: c.gcSat },
  ],
  wt: c.wt,
})
export function circBlock(c: CircBlock) {
  const z = c.Hs + c.Hc / 2
  const Q = (c.q * Math.PI * c.D * c.D) / 4
  const dp = footingDp({ shape: 'circle', B: c.D, L: c.D, Q, Df: 0, method: '21' }, z)
  const p0 = stressAt(profOf(c), z).eff
  const e0 = eFromTable(c.ps, c.es, p0)
  const e1 = eFromTable(c.ps, c.es, p0 + dp)
  const S = settleDe(e0 - e1, c.Hc, e0)
  // field: sand above, impervious rock below → one-way, d = Hc
  const tField = scaleTime(c.t90, c.dLab, c.Hc)
  const cv = cvTaylor(c.dLab, c.t90 * 60)
  const mv = (e0 - e1) / ((1 + e0) * dp)
  const k = kFromCv(cv, mv)
  return { z, Q, dp, p0, e0, e1, de: e0 - e1, S, tField, cv, mv, k }
}
export function CircBlockFig({ c }: { c: CircBlock }) {
  return (
    <SoilColumn
      layers={[
        { H: c.Hs, name: 'Compact sand', kind: 'sand', props: [`γ = ${c.gs} kN/m³ above GWL`, `γsat = ${c.gsSat} kN/m³`] },
        { H: c.Hc, name: 'Clay', kind: 'clay', props: [`γsat = ${c.gcSat} kN/m³`] },
        { H: 0.6, name: 'Impervious bed rock', kind: 'rock' },
      ]}
      wt={c.wt}
      footing={{ Df: 0.15, B: c.D, label: `rigid circular block, D = ${c.D} m, q = ${c.q} kPa` }}
      marks={[{ z: c.Hs + c.Hc / 2, label: 'mid-clay' }]}
    />
  )
}
export function CircBlockSettle({ c }: { c: CircBlock }) {
  const r = circBlock(c)
  const tops = c.wt
  return (
    <Sol>
      <Frm>
        <div className="max-w-[520px] mx-auto">
          <CircBlockFig c={c} />
        </div>
      </Frm>
      <Md>{R`**Δp at mid-clay (1H : 2V spread).** The load spreads 1 horizontally in 2 vertically on every side, so at depth z the diameter is D + z. Mid-clay is $z = ${f2(c.Hs)} + ${f2(c.Hc)}/2 = ${f2(r.z)}$ m below the block.`}</Md>
      <Tex block>{R`Q = q\frac{\pi D^2}{4} = ${f2(c.q)} \times \frac{\pi (${f2(c.D)})^2}{4} = ${f2(r.Q)}\ \text{kN},\qquad \Delta p = \frac{Q}{\pi(D + z)^2/4} = \frac{${f2(c.q)} \times ${f2(c.D)}^2}{(${f2(c.D)} + ${f2(r.z)})^2} = ${f2(r.dp)}\ \text{kPa}`}</Tex>
      <Md>{R`**p′0 at mid-clay** (GWL ${f2(tops)} m below the sand surface):`}</Md>
      <Tex block>{R`p'_0 = ${f2(c.wt)}(${f2(c.gs)}) + ${f2(c.Hs - c.wt)}(${f2(c.gsSat)} - 9.81) + ${f2(c.Hc / 2)}(${f2(c.gcSat)} - 9.81) = ${f2(r.p0)}\ \text{kPa}`}</Tex>
      <Md>{R`**e from the lab table** (interpolate linearly in log p between neighbouring loads, as on the e–log p plot): $p'_0 = ${f2(r.p0)}$ → $e_0 = ${f4(r.e0)}$; $p'_0 + \Delta p = ${f2(r.p0 + r.dp)}$ kPa → $e_1 = ${f4(r.e1)}$.`}</Md>
      <Tbl head={['p (kPa)', ...c.ps.map(String)]} rows={[['e', ...c.es.map((e) => f3(e))]]} cap="Laboratory consolidation test (20 mm specimen, drained top and bottom)." />
      <Tex block>{R`S = \frac{\Delta e}{1 + e_0}H = \frac{${f4(r.e0)} - ${f4(r.e1)}}{1 + ${f4(r.e0)}} \times ${f2(c.Hc * 1000)} = ${f2(r.S * 1000)}\ \text{mm}`}</Tex>
    </Sol>
  )
}
export function CircBlockTime({ c }: { c: CircBlock }) {
  const r = circBlock(c)
  return (
    <Sol>
      <Md>{R`Same U ⇒ same $T_v = c_vt/d^2$, so with the same soil $t \propto d^2$. Lab: 20 mm drained top and bottom → $d_{lab} = 10$ mm. Field: sand above, impervious rock below → one-way drainage, $d = H = ${f2(c.Hc)}$ m.`}</Md>
      <Tex block>{R`t_{field} = t_{lab}\left(\frac{d_{field}}{d_{lab}}\right)^2 = ${f2(c.t90)}\ \text{min} \times \left(\frac{${f0(c.Hc * 1000)}}{10}\right)^2 = ${sciTex(r.tField, 3)}\ \text{min} = ${f2(r.tField / 60 / 24 / 365)}\ \text{years}`}</Tex>
      <Result>{`Time for 90 % of the field settlement ≈ **${f2(r.tField / 60 / 24 / 365)} years** (${f0(r.tField / 60 / 24)} days).`}</Result>
    </Sol>
  )
}
export function CircBlockK({ c }: { c: CircBlock }) {
  const r = circBlock(c)
  return (
    <Sol>
      <Tex block>{R`c_v = \frac{0.848\,d_{lab}^2}{t_{90}} = \frac{0.848 \times (0.010)^2}{${f2(c.t90)} \times 60} = ${sciTex(r.cv, 3)}\ \text{m}^2/\text{s}`}</Tex>
      <Tex block>{R`m_v = \frac{\Delta e}{(1 + e_0)\Delta p} = \frac{${f4(r.de)}}{${f4(1 + r.e0)} \times ${f2(r.dp)}} = ${sciTex(r.mv, 3)}\ \text{m}^2/\text{kN}`}</Tex>
      <Tex block>{R`k = c_vm_v\gamma_w = ${sciTex(r.cv, 3)} \times ${sciTex(r.mv, 3)} \times 9.81 = ${sciTex(r.k, 3)}\ \text{m/s} = ${sciTex(r.k * 100, 2)}\ \text{cm/s}`}</Tex>
      <Result>{`k ≈ **${sci(r.k, 2)} m/s** (${sci(r.k * 100, 2)} cm/s) — a typical clay value (practically impervious).`}</Result>
      <Note>{`mv uses the field stress increment (p′0 = ${f2(r.p0)} → ${f2(r.p0 + r.dp)} kPa) from the lab table; cv from Taylor's √t value of the lab t90.`}</Note>
    </Sol>
  )
}

// ---------------------------------------------------------------- small sketches
/** point load Q on the surface, vertical line at radius r, angle β from the load axis */
export function PointLoadFig({ r = 2, Q = 20, beta }: { r?: number; Q?: number; beta: number }) {
  const W = 300
  const H = 220
  const x0 = 80
  const y0 = 50
  const k = 55
  const z = r / Math.tan((beta * Math.PI) / 180)
  const X = x0 + r * k
  const Y = y0 + z * k
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[320px]" role="img" aria-label="point load and a vertical line at radius r">
      <line x1={10} x2={W - 10} y1={y0} y2={y0} stroke="var(--c-ink)" strokeWidth={1.4} />
      <rect x={10} y={y0} width={W - 20} height={H - y0 - 6} fill="var(--c-soil)" opacity={0.12} />
      <path d={`M${x0},${y0 - 36}l0,32m-5,-8l5,8l5,-8`} stroke="var(--c-load)" strokeWidth={2.2} fill="none" />
      <text x={x0 + 8} y={y0 - 24} fontSize={11} fill="var(--c-load)">
        Q = {Q} kN
      </text>
      <line x1={x0} x2={x0} y1={y0} y2={H - 10} stroke="var(--c-mute)" strokeDasharray="5 4" />
      <line x1={X} x2={X} y1={y0} y2={H - 10} stroke="var(--c-accent)" strokeWidth={1.4} />
      <text x={X + 5} y={H - 14} fontSize={10} fill="var(--c-accent)">
        r = constant
      </text>
      <line x1={x0} y1={y0} x2={X} y2={Y} stroke="var(--c-ink)" />
      <path d={`M${x0},${y0 + 30} A30,30 0 0 0 ${x0 + 30 * Math.sin((beta * Math.PI) / 180)},${y0 + 30 * Math.cos((beta * Math.PI) / 180)}`} fill="none" stroke="var(--c-ink)" />
      <text x={x0 + 6} y={y0 + 46} fontSize={11} fill="var(--c-ink)">
        β
      </text>
      <circle cx={X} cy={Y} r={4} fill="var(--c-accent)" />
      <line x1={X + 14} x2={X + 14} y1={y0} y2={Y} stroke="var(--c-mute)" strokeWidth={0.8} />
      <text x={X + 18} y={(y0 + Y) / 2} fontSize={10} fill="var(--c-mute)">
        z
      </text>
      <line x1={x0} x2={X} y1={y0 + 12} y2={y0 + 12} stroke="var(--c-mute)" strokeWidth={0.8} />
      <text x={(x0 + X) / 2} y={y0 + 24} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        r = {f2(r)} m
      </text>
    </svg>
  )
}

/** plan of line loads (walls) meeting at a point; segments in metres, labels */
export function WallPlanFig({ segs, P, label = 'A' }: { segs: { a: [number, number]; b: [number, number]; text: string; ends?: [string, string] }[]; P: [number, number]; label?: string }) {
  const xs = segs.flatMap((s) => [s.a[0], s.b[0]])
  const ys = segs.flatMap((s) => [s.a[1], s.b[1]])
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  const W = 360
  const m = 40
  const k = (W - 2 * m) / Math.max(x1 - x0, y1 - y0)
  const H = (y1 - y0) * k + 2 * m
  const X = (x: number) => m + (x - x0) * k
  const Y = (y: number) => H - m - (y - y0) * k
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[380px]" role="img" aria-label="plan of the wall line loads">
      {segs.map((s, i) => {
        const horiz = Math.abs(s.a[1] - s.b[1]) < 1e-9
        return (
          <g key={i}>
            <line x1={X(s.a[0])} y1={Y(s.a[1])} x2={X(s.b[0])} y2={Y(s.b[1])} stroke="var(--c-load)" strokeWidth={6} opacity={0.7} strokeLinecap="round" />
            <text x={(X(s.a[0]) + X(s.b[0])) / 2 + (horiz ? 0 : 10)} y={(Y(s.a[1]) + Y(s.b[1])) / 2 + (horiz ? -10 : 4)} fontSize={10.5} textAnchor={horiz ? 'middle' : 'start'} fill="var(--c-ink)">
              {s.text}
            </text>
            {s.ends && (
              <>
                <text x={X(s.a[0]) + (horiz ? -12 : 8)} y={Y(s.a[1]) + (horiz ? 4 : s.a[1] > s.b[1] ? -6 : 14)} fontSize={11} fontWeight={700} fill="var(--c-mute)">
                  {s.ends[0]}
                </text>
                <text x={X(s.b[0]) + (horiz ? 6 : 8)} y={Y(s.b[1]) + (horiz ? 4 : s.b[1] > s.a[1] ? -6 : 14)} fontSize={11} fontWeight={700} fill="var(--c-mute)">
                  {s.ends[1]}
                </text>
              </>
            )}
          </g>
        )
      })}
      <circle cx={X(P[0])} cy={Y(P[1])} r={5} fill="var(--c-accent)" />
      <text x={X(P[0]) + 8} y={Y(P[1]) - 8} fontSize={12} fontWeight={700} fill="var(--c-accent)">
        {label}
      </text>
    </svg>
  )
}

/** a k value as "a.bc × 10⁻ⁿ" for the Answer boxes: mantissa scaled to a fixed exponent */
export const scaled = (v: number, exp: number) => v / 10 ** exp
export const expLabel = (exp: number) => `× 10${String(exp).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])}`

export { GW, sci }
