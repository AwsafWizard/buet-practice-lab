// CE 315 term final 2005-06 (held 28 Apr 2007), PDF pp. 101–106.
// Section A and B: 4 questions each, answer 3 (35 marks each). No design aids attached; the WSD T-beam
// K and Z formulas are printed in Q2(c). No load factors printed (BNBC 1993 / ACI 318-99 era).
// Shared figures/answers exported here are reused by r2004 / r2002.
import type { ReactNode } from 'react'
import { Md } from '../../../components/ui'
import type { RcGiven, RcQ } from '../../types'
import { allowableMoment, elasticAt, f, uncracked, wsdDesign, wsdDoublyDesign } from '../../engine/elastic'
import { designDoubly, pickBars as pickDoubly } from '../../engine/doubly'
import { designT, effectiveWidth, floorLoads, reviewT, wsdTDesign } from '../../engine/tbeam'
import { roundDown, shearAt, shearLimits, type ShearSection } from '../../engine/shear'
import { cantSlab } from '../../engine/oneway'
import { designAs, designSection, review } from '../../engine/singly'
import { bar, ldSimplified, standardCutoffs } from '../../engine/bond'
import { rhoLimits } from '../../engine/materials'
import {
  A_COVER,
  A_TS,
  Bars,
  CONC,
  Conc,
  DimH,
  DimV,
  Fig,
  Hatch,
  INK,
  LOAD,
  Ln,
  MUTE,
  PLoad,
  Pin,
  Roller,
  STEEL,
  T,
  ThreeStages,
  Udl,
  BrkV,
  Sol,
  ck,
  cantSlabSteps,
  SlabSketch,
  tDesignSteps,
  wsdTSteps,
  type St,
} from './r2006'

const G = (label: string, ref: string, what?: string, formula?: boolean): RcGiven => ({ label, ref, what, formula })
const FT = (v: number, d = 2) => f(v, d)
export const FLAG_OLD = 'Pre-2008 paper, no load factors printed (then 1.4D + 1.7L, φ shear 0.85) — solved with 1.2D + 1.6L, φ = 0.75'
export const FLAG_WSD = 'WSD design — not in the current slides'

// ================================================================ shared figures
/** slab strip on two supports with cantilevers both sides (beams or walls) */
export function SlabStripFig({ cant, clear, support, h, label, beams = true, note }: { cant: number; clear: number; support: number; h: string; label: string; beams?: boolean; note?: string }) {
  const bw = support / 12
  const tot = 2 * cant + 2 * bw + clear
  const s = 520 / tot
  const X = (ft: number) => 40 + ft * s
  const yS = 70
  const t = 14
  const x1 = X(cant)
  const x2 = X(cant + bw + clear)
  return (
    <Fig w={600} h={200}>
      <Udl x1={X(0)} x2={X(tot)} y={yS} label={label} n={22} />
      <rect x={X(0)} y={yS} width={tot * s} height={t} fill={CONC} stroke={INK} />
      {beams ? (
        <>
          <rect x={x1} y={yS + t - 1} width={bw * s} height={40} fill={CONC} stroke={INK} />
          <rect x={x2} y={yS + t - 1} width={bw * s} height={40} fill={CONC} stroke={INK} />
        </>
      ) : (
        <>
          <Hatch x={x1} y={yS + t} w={bw * s} h={40} />
          <Hatch x={x2} y={yS + t} w={bw * s} h={40} />
        </>
      )}
      <T x={(x1 + x2) / 2 + 10} y={yS + t + 26}>
        {h}
      </T>
      <DimH x1={X(0)} x2={x1} y={yS + t + 66} label={`${f(cant)}′-0″`} />
      <DimH x1={x1 + bw * s} x2={x2} y={yS + t + 66} label={`${f(clear)}′-0″ clear`} />
      <DimH x1={x2 + bw * s} x2={X(tot)} y={yS + t + 66} label={`${f(cant)}′-0″`} />
      <T x={x1 + (bw * s) / 2} y={yS + t + 86} s={11}>
        {`${support}″`}
      </T>
      <T x={x2 + (bw * s) / 2} y={yS + t + 86} s={11}>
        {`${support}″`}
      </T>
      {note && (
        <T x={300} y={192} s={11} c={MUTE}>
          {note}
        </T>
      )}
    </Fig>
  )
}

/** T-beam floor: slab hf over webs bw × hw below the slab at cc (ft); bars at cover above the web bottom */
export function TFloorFig({ hf, bw, hw, cc, cover, webs = 2, note }: { hf: number; bw: number; hw: number; cc: number; cover: number; webs?: number; note?: string }) {
  const sx = Math.min(2.6, 380 / (cc * 12 * (webs - 1)))
  const sy = 120 / (hf + hw)
  const yT = 40
  const xA = 130
  const xs = Array.from({ length: webs }, (_, i) => xA + i * cc * 12 * sx)
  return (
    <Fig w={600} h={250}>
      <rect x={30} y={yT} width={540} height={hf * sy} fill={CONC} stroke={INK} strokeWidth={1.2} />
      {xs.map((xc) => (
        <g key={xc}>
          <rect x={xc - (bw / 2) * sx} y={yT + hf * sy - 1} width={bw * sx} height={hw * sy + 1} fill={CONC} stroke={INK} strokeWidth={1.2} />
          <rect x={xc - (bw / 2) * sx + 1} y={yT + hf * sy - 1} width={bw * sx - 2} height={3} fill={CONC} />
        </g>
      ))}
      <Bars x1={xA - 3.5 * sx} x2={xA + 3.5 * sx} y={yT + (hf + hw - cover) * sy} n={3} r={3.2} />
      <BrkV x={30} y1={yT - 4} y2={yT + hf * sy + 4} />
      <BrkV x={570} y1={yT - 4} y2={yT + hf * sy + 4} />
      <T x={330} y={yT - 8}>
        {`${hf}″ slab`}
      </T>
      <DimV y1={yT + hf * sy} y2={yT + (hf + hw) * sy} x={xs[1] + (bw / 2) * sx + 14} label={`${hw}″`} />
      <DimV y1={yT + (hf + hw - cover) * sy} y2={yT + (hf + hw) * sy} x={xA - (bw / 2) * sx - 12} label={`${cover}″`} left />
      <DimH x1={xs[1] - (bw / 2) * sx} x2={xs[1] + (bw / 2) * sx} y={yT + (hf + hw) * sy + 16} label={`${bw}″`} below />
      <DimH x1={xs[0]} x2={xs[1]} y={yT + (hf + hw) * sy + 52} label={`${f(cc)}′-0″ c/c`} />
      {note && (
        <T x={300} y={240} s={11} c={MUTE}>
          {note}
        </T>
      )}
    </Fig>
  )
}

/** the overhanging beam of 2005-06 Fig. 3 / 2004-05 Fig. 5 (factored loads) */
export function OverhangFig() {
  const s = 10
  const X = (ft: number) => 60 + ft * s
  const y = 90
  return (
    <Fig w={600} h={250}>
      <rect x={X(0)} y={y - 8} width={48 * s} height={8} fill={CONC} stroke={INK} />
      <Udl x1={X(6)} x2={X(42)} y={y - 8} label="5.2 k/ft (between supports only)" />
      <PLoad x={X(0)} y={y - 8} label="45 k" len={46} />
      <PLoad x={X(48)} y={y - 8} label="45 k" len={46} />
      <PLoad x={X(24)} y={y - 26} label="90 k" len={32} />
      <Pin x={X(6)} y={y} />
      <Roller x={X(42)} y={y} />
      <DimH x1={X(0)} x2={X(6)} y={y + 40} label="6′" />
      <DimH x1={X(6)} x2={X(24)} y={y + 40} label="18′" />
      <DimH x1={X(24)} x2={X(42)} y={y + 40} label="18′" />
      <DimH x1={X(42)} x2={X(48)} y={y + 40} label="6′" />
      <Conc x={270} y={155} w={42} h={78} />
      <Bars x1={278} x2={304} y={222} n={3} r={3.4} />
      <DimV y1={155} y2={222} x={324} label="d = 30″" />
      <DimH x1={270} x2={312} y={244} label="b = 14″" below />
      <T x={470} y={200} s={11} c={MUTE}>
        All loads factored; neglect self-weight
      </T>
    </Fig>
  )
}

/** rectangular section with one row of n bars */
export function RectSecFig({ b, h, d, n, label, title, top = 0, topLabel, two = false }: { b: number; h: number; d: number; n: number; label: string; title?: string; top?: number; topLabel?: string; two?: boolean }) {
  const s = Math.min(7, 200 / h)
  const x0 = 220
  const y0 = 20
  return (
    <Fig w={600} h={h * s + 70} max={520}>
      <Conc x={x0} y={y0} w={b * s} h={h * s} />
      {two ? (
        <>
          <Bars x1={x0 + 2.4 * s} x2={x0 + b * s - 2.4 * s} y={y0 + (d + 1.25) * s} n={n} r={0.5 * s} />
          <Bars x1={x0 + 2.4 * s} x2={x0 + b * s - 2.4 * s} y={y0 + (d - 1.25) * s} n={n} r={0.5 * s} />
        </>
      ) : (
        <Bars x1={x0 + 2.4 * s} x2={x0 + b * s - 2.4 * s} y={y0 + d * s} n={n} r={0.5 * s} />
      )}
      {top > 0 && <Bars x1={x0 + 2.4 * s} x2={x0 + b * s - 2.4 * s} y={y0 + 2.5 * s} n={top} r={0.4 * s} />}
      <DimV y1={y0} y2={y0 + h * s} x={x0 - 16} label={`${h}″`} left />
      <DimV y1={y0} y2={y0 + d * s} x={x0 + b * s + 16} label={`d = ${d}″`} />
      <DimH x1={x0} x2={x0 + b * s} y={y0 + h * s + 16} label={`${b}″`} below />
      <T x={x0 + b * s + 70} y={y0 + d * s + 4} a="start" s={11}>
        {label}
      </T>
      {topLabel && (
        <T x={x0 + b * s + 70} y={y0 + 2.5 * s + 4} a="start" s={11}>
          {topLabel}
        </T>
      )}
      {title && (
        <T x={x0 - 60} y={y0 + h * s + 50} a="start" b>
          {title}
        </T>
      )}
    </Fig>
  )
}

/** "architect's Beam A": slab on edge beams and a central brick wall standing on Beam A */
export function BeamAFig({ hf }: { hf: number }) {
  const s = 1.6 // px per in horizontally
  const xc = 300
  const yS = 50
  const t = hf * 3
  return (
    <Fig w={600} h={270}>
      <rect x={xc - 144 * s - 15} y={yS} width={288 * s + 30} height={t} fill={CONC} stroke={INK} />
      <rect x={xc - 144 * s - 15} y={yS + t - 1} width={22} height={40} fill={CONC} stroke={INK} />
      <rect x={xc + 144 * s - 7} y={yS + t - 1} width={22} height={40} fill={CONC} stroke={INK} />
      <Hatch x={xc - 10} y={yS + t} w={20} h={70} />
      <rect x={xc - 10} y={yS + t + 70} width={20} height={100} fill={CONC} stroke={INK} />
      <DimH x1={xc - 144 * s} x2={xc} y={yS - 14} label="12′-0″" />
      <DimH x1={xc} x2={xc + 144 * s} y={yS - 14} label="12′-0″" />
      <T x={xc + 30} y={yS + t + 40} a="start" s={11}>
        12″ brickwork, 3′-0″ high
      </T>
      <T x={xc + 30} y={yS + t + 115} a="start" s={11}>
        Beam ‘A’ 12″ × 36″, span 30 ft (simply supported)
      </T>
      <T x={xc - 150} y={yS + t + 20} s={11}>
        {`${hf}″ slab`}
      </T>
      <DimV y1={yS + t + 70} y2={yS + t + 170} x={xc - 26} label="36″" left />
      <DimH x1={xc - 10} x2={xc + 10} y={yS + t + 186} label="12″" below />
    </Fig>
  )
}

/** 4-span beam + 12 ft cantilever (Fig. 7 / 2002-03 Fig. 8) */
export function FourSpanFig({ children }: { children?: ReactNode }) {
  const s = 4
  const cw = 2 * s
  const X0 = 40
  const cols = [0, 1, 2, 3, 4].map((i) => X0 + i * (28 * s + cw))
  const yB = 60
  return (
    <Fig w={600} h={children ? 260 : 170}>
      <rect x={X0} y={yB} width={cols[4] + cw + 12 * s - X0} height={20} fill={CONC} stroke={INK} />
      {cols.map((x, i) => (
        <g key={i}>
          <Hatch x={x} y={yB + 20} w={cw} h={40} />
          <T x={x + cw / 2} y={yB - 10} b>
            {'ABCDE'[i]}
          </T>
        </g>
      ))}
      {cols.slice(0, 4).map((x, i) => (
        <DimH key={i} x1={x + cw} x2={cols[i + 1]} y={yB + 76} label="28′" />
      ))}
      <DimH x1={cols[4] + cw} x2={cols[4] + cw + 12 * s} y={yB + 76} label="12′" />
      <T x={300} y={yB + 104} s={11} c={MUTE}>
        Beam 12″ × 30″, columns 24″ × 24″ (clear spans face to face)
      </T>
      {children}
    </Fig>
  )
}

/** simple span with DL (excl. self-weight) and LL */
export function SSBeamFig({ L, dl, ll }: { L: number; dl: number; ll: number }) {
  return (
    <Fig w={600} h={150}>
      <Udl x1={80} x2={520} y={70} label={`DL = ${dl} k/ft (excluding self-wt of beam), LL = ${ll} k/ft`} />
      <rect x={80} y={70} width={440} height={10} fill={CONC} stroke={INK} />
      <Pin x={80} y={80} />
      <Roller x={520} y={80} />
      <DimH x1={80} x2={520} y={124} label={`${L}′`} />
    </Fig>
  )
}

// ================================================================ shared model answers
export const A_LD_FACTORS = String.raw`Development length $\ell_d$ = embedment needed to develop the bar's yield force $A_bf_y$ by bond (resisted by pull-out or splitting). It is governed by:
1. **Concrete strength** — bond and splitting resistance grow with tensile strength, i.e. with $\sqrt{f'_c}$ ($\sqrt{f'_c} \le 100$ psi).
2. **Steel yield strength $f_y$** — higher stress to develop → longer $\ell_d$ (proportional).
3. **Bar diameter $d_b$** — force ∝ $d_b^2$, bonded perimeter ∝ $d_b$ → $\ell_d \propto d_b$. Small bars (#6 and smaller) get $\psi_s = 0.8$.
4. **Cover and bar spacing** ($c_b$) — thin cover or close bars split the concrete along the bars; more cover/spacing → shorter $\ell_d$ (up to $(c_b + K_{tr})/d_b = 2.5$, beyond which pull-out governs).
5. **Transverse reinforcement** ($K_{tr}$) — stirrups crossing the splitting plane restrain splitting cracks.
6. **Bar location (casting position)** — top bars with more than 12 in of fresh concrete below: bleed water and air collect under the bar → weaker bond, $\psi_t = 1.3$.
7. **Coating** — epoxy-coated bars lose adhesion and friction: $\psi_e = 1.5$ (small cover/spacing) or 1.2.
8. **Lightweight concrete** — lower tensile strength: $\lambda = 0.75$.
9. **Excess reinforcement** — if $A_{s,prov} > A_{s,req}$ the actual bar stress is lower: multiply by $A_{s,req}/A_{s,prov}$.
10. **Bar deformations (ribs)** and the state of stress around the bar (confinement, transverse compression at supports, nearby cracks).

ACI: $\ell_d = \left(\frac{3}{40}\frac{f_y}{\lambda\sqrt{f'_c}}\frac{\psi_t\psi_e\psi_s}{(c_b + K_{tr})/d_b}\right)d_b \ge 12$ in.`

export const A_MIN_H = String.raw`Minimum thickness $h$ of non-prestressed beams and one-way slabs unless deflections are computed (ACI Table 9.5(a); normal-weight concrete, Grade 60; $l$ = span in inches):

Order: simply supported, one end continuous, both ends continuous, cantilever.
- **Solid one-way slabs:** $l/20$, $l/24$, $l/28$, $l/10$
- **Beams or ribbed one-way slabs:** $l/16$, $l/18.5$, $l/21$, $l/8$

Notes:
- For $f_y \ne 60$ ksi multiply by $(0.4 + f_y/100{,}000)$ (e.g. 0.8 for Grade 40, 0.9 for Grade 50).
- Lightweight concrete (90–115 pcf): multiply by $(1.65 - 0.005w_c) \ge 1.09$.
- Applies to members **not supporting or attached to partitions or other construction likely to be damaged by large deflections**; otherwise deflections must be computed.
- Why: these depths keep immediate + long-term (creep, shrinkage) deflection within acceptable limits without a deflection calculation. Round slabs up to ½ in, beams to whole inches.`

// ================================================================ shear of the overhanging beam (Fig. 3 here, Fig. 5 in 2004-05)
/** factored shear of the 6 + 36 + 6 ft beam (x from the left end, ft) */
export function overhangV(x: number): number {
  const R = (45 * 2 + 90 + 5.2 * 36) / 2
  let V = -45
  if (x > 6) V += R - 5.2 * (Math.min(x, 42) - 6)
  if (x > 24) V -= 90
  if (x > 42) V += R
  return V
}
export const OH_R = (45 * 2 + 90 + 5.2 * 36) / 2

/** stirrup zones along a run where |Vu| decreases away from the face: V(u) with u in ft from the face */
export function shearZones(V: (u: number) => number, len: number, sec: ShearSection, step = 0.5) {
  const dft = sec.d / 12
  const Vat = (u: number) => Math.abs(V(Math.max(u, dft)))
  const rows: { u: number; Vu: number; cs: string; s: number }[] = []
  const pts = [0, dft, ...Array.from({ length: Math.floor(len / 2) }, (_, i) => 2 * (i + 1)).filter((u) => u > dft && u < len), len]
  for (const u of pts) {
    const a = shearAt(Vat(u), sec)
    rows.push({ u, Vu: Vat(u), cs: a.case, s: a.s })
  }
  // zones: segment by segment, the spacing required at the segment start (largest shear)
  const zones: { from: number; to: number; s: number }[] = []
  for (let u = 0; u < len - 1e-9; u += step) {
    const a = shearAt(Vat(u), sec)
    const s = Number.isFinite(a.s) ? roundDown(a.s, 0.5) : Infinity
    const to = Math.min(len, u + step)
    const last = zones[zones.length - 1]
    if (last && last.s === s) last.to = to
    else zones.push({ from: u, to, s })
  }
  return { rows, zones: zones.map((z) => ({ ...z, n: Number.isFinite(z.s) ? Math.ceil(((z.to - z.from) * 12) / z.s - 1e-6) : 0 })) }
}

export function overhangShearSol(sec: ShearSection, sfdOnly = false) {
  const k = shearLimits(sec)
  const span = shearZones((u) => overhangV(6 + u), 18, sec)
  const oh = shearZones(() => 45, 6, sec)
  const tbl = (rows: typeof span.rows) => rows.map((r) => `- $u = ${FT(r.u)}$ ft: $V_u = ${FT(r.Vu, 1)}$ k → Case ${r.cs}${Number.isFinite(r.s) ? `, $s = ${FT(r.s)}$ in` : ''}`).join('\n')
  const zt = (z: typeof span.zones) => z.map((q) => (q.n ? `${q.n} @ ${FT(q.s, 1)} in (${FT(q.from)}–${FT(q.to)} ft)` : `none (${FT(q.from)}–${FT(q.to)} ft)`)).join(', ')
  const sfd: St = {
    t: 'Reactions and shear-force diagram',
    tex: `R_A = R_B = \\frac{2(45) + 90 + 5.2(36)}{2} = ${FT(OH_R, 1)}\\text{ k}`,
    md: `$V$: −45 k on the left overhang; just right of A: $−45 + ${FT(OH_R, 1)} = ${FT(overhangV(6.0001), 1)}$ k; just left of midspan: ${FT(overhangV(23.9999), 1)} k; just right: ${FT(overhangV(24.0001), 1)} k; just left of B: ${FT(overhangV(41.9999), 1)} k; right overhang: +45 k. Antisymmetric about midspan.`,
  }
  if (sfdOnly) return { steps: [sfd], span, oh }
  const steps: St[] = [
    sfd,
    {
      t: 'Concrete capacity',
      tex: `\\phi V_c = ${f(k.phi)}(2)\\sqrt{${sec.fc}}(${sec.bw})(${sec.d}) = ${FT(k.phiVc)}\\text{ k},\\quad \\tfrac12\\phi V_c = ${FT(k.halfPhiVc)}\\text{ k},\\quad V_{u,max} = \\phi 10\\sqrt{f'_c}b_wd = ${FT(k.VuMax, 1)}\\text{ k}`,
      md: `Stirrups: #4 two-legged, $A_v = ${FT(k.Av)}$ in² (#3 would need s below 3 in near the supports). Minimum $A_v/s = ${f(k.avsMin, 4)}$ in²/in.`,
    },
    { t: 'Span (from a support face toward midspan)', md: tbl(span.rows) },
    { t: 'Overhang (constant 45 k)', md: tbl(oh.rows) },
    { t: 'Zones (spacing rounded down to ½ in)', md: `Span: ${zt(span.zones)}.\n\nOverhang: ${zt(oh.zones)}.` },
  ]
  return { steps, span, oh }
}

// ================================================================ local helpers (WSD / USD rectangular design)
function wsdRect(M: number, b: number, d: number, n: number, fcA: number, fsA: number) {
  const W = wsdDoublyDesign(M, b, d, 2.5, n, fcA, fsA)
  const S = wsdDesign(M, b, n, fcA, fsA, d)
  return { W, S, needs: W.needsComp }
}

// ================================================================ solutions
const SEC4 = { b: 12, h: 27, d: 24, As: 4 * 1.0, fc: 4000, n: 8, frPsi: 475 }
const q5b = { U: uncracked(SEC4), E: elasticAt(SEC4, 60) }
const q5c = elasticAt(SEC4, 120)
const SEC5 = { b: 12, h: 27, d: 24, As: 4 * 0.79, fc: 4000, n: 8 }
const q6b = allowableMoment(SEC5, 1.8, 24)
const q6c = review({ b: 12, fc: 4000, fy: 60000, layers: [{ As: SEC5.As, d: 24 }] })

const q1c = cantSlab({ span: 14, support: 10, cantL: 5, cantR: 5, ll: 80, dlTotal: 130, fc: 3000, fy: 60000, h: 6.5 })

const q2 = (() => {
  const B = effectiveWidth({ kind: 'interior', L: 24, bw: 12, hf: 4, cc: 84, rule: 'aci08' })
  const B14 = effectiveWidth({ kind: 'interior', L: 24, bw: 12, hf: 4, cc: 84, rule: 'aci14' })
  const FL = floorLoads({ hf: 4, spacing: 7, bw: 12, h: 26, sdl: 120, ll: 100, slabIncluded: true })
  const P = 10
  const Pu = 1.6 * P
  const Mu = (FL.wu * 24 * 24) / 8 + (Pu * 24) / 4
  const tin = { Mu, beff: B.b, bw: 12, hf: 4, d: 23, fc: 3, fy: 60 }
  const TD = designT(tin)
  const bars = pickDoubly(TD.As, 12)
  const RT = reviewT({ beff: B.b, bw: 12, hf: 4, d: 23, As: bars.A, fc: 3, fy: 60 })
  const M = ((FL.wD + FL.wL) * 24 * 24) / 8 + (P * 24) / 4
  const win = { M, beff: B.b, hf: 4, d: 23, n: 9, fcAllow: 1.35, fsAllow: 24 }
  const WT = wsdTDesign(win)
  const wbars = pickDoubly(WT.As, 12)
  return { B, B14, FL, P, Pu, Mu, tin, TD, bars, RT, M, win, WT, wbars }
})()

const SEC3: ShearSection = { bw: 14, d: 30, fc: 3000, fy: 50000, Av: 0.4 }
const q3c = overhangShearSol(SEC3)

const q4d = (['16mm', '25mm'] as const).map((id) => {
  const b = bar(id)
  const top = ldSimplified({ db: b.db, small: b.small, fc: 3000, fy: 40000, met: true, psiT: 1.3 })
  const oth = ldSimplified({ db: b.db, small: b.small, fc: 3000, fy: 40000, met: true })
  return { b, top, oth }
})

// Beam A (Fig. 6): reaction of a 2-span continuous slab = 1.25 wL; 12 in brick wall 3 ft high at 120 pcf
export function beamALoads(hf: number, ff: number, ll: number) {
  const slabD = ((hf / 12) * 150 + ff) / 1000 // ksf
  const slabL = ll / 1000
  const R = 1.25 * 12 // ft of slab per ft of beam (interior reaction of two equal spans)
  const wall = 1 * 3 * 0.12
  const sw = (12 * 36) / 144 * 0.15
  const wD = slabD * R + wall + sw
  const wL = slabL * R
  return { slabD, slabL, R, wall, sw, wD, wL, w: wD + wL, M: ((wD + wL) * 900) / 8, wu: 1.2 * wD + 1.6 * wL, Mu: ((1.2 * wD + 1.6 * wL) * 900) / 8 }
}
export function beamALoadSteps(L: ReturnType<typeof beamALoads>, hf: number, ff: number, ll: number): St[] {
  return [
    {
      t: 'Load path',
      md: `The slab spans 12 ft + 12 ft, continuous over the wall, so the wall (and Beam A) takes the interior reaction of a two-span beam: $1.25wL = 1.25w(12) = ${FT(L.R)}w$ per ft. (Simple tributary width would give 12w — 25% less; state your choice.)`,
    },
    { t: 'Slab loads', tex: `w_{D,slab} = \\frac{${hf}}{12}(150) + ${ff} = ${FT(L.slabD * 1000, 1)}\\text{ psf},\\quad w_{L} = ${ll}\\text{ psf}` },
    {
      t: 'Line loads on Beam A',
      tex: `w_D = ${FT(L.R)}(${FT(L.slabD, 4)}) + \\underbrace{1(3)(0.120)}_{\\text{wall}} + \\underbrace{\\tfrac{12\\times36}{144}(0.15)}_{\\text{beam}} = ${FT(L.wD, 3)}\\text{ k/ft},\\quad w_L = ${FT(L.R)}(${FT(L.slabL, 3)}) = ${FT(L.wL, 3)}\\text{ k/ft}`,
      md: 'Brick 120 pcf (class value; not given in the paper).',
    },
  ]
}
/** Beam A: loads, WSD (fs 24, d = 32.5) and USD designs */
export function beamADesign(hf: number, ff: number, ll: number, fc: number, n: number) {
  const L = beamALoads(hf, ff, ll)
  const d = 32.5
  const fcA = (0.45 * fc) / 1000
  const w = wsdRect(L.M, 12, d, n, fcA, 24)
  const tW = pickDoubly(w.W.As, 12)
  const cW = w.needs ? pickDoubly(w.W.Asp, 12, [5, 6, 7, 8, 9], 1) : null
  const D = designAs(L.Mu, 12, d, fc, 60000, 33.5)
  const DD = D.needsComp ? designDoubly({ b: 12, d, dt: 33.5, dp: 2.5, fc: fc / 1000, fy: 60, Mu: L.Mu }) : null
  const bU = pickDoubly(DD ? DD.As : D.As, 12)
  const R = review({ b: 12, fc, fy: 60000, layers: [{ As: bU.A, d }] })
  return { hf, ff, ll, n, fcA, L, d, w, tW, cW, D, DD, bU, R }
}
const q7 = beamADesign(6, 25, 100, 4000, 8)

/** the two Beam A parts as solution objects */
export function beamASols(q: ReturnType<typeof beamADesign>): [Pick<RcQ, 'checks' | 'solution'>, Pick<RcQ, 'checks' | 'solution'>] {
  return [
    {
      checks: () => [ck('wD', 'Service dead load on Beam A', q.L.wD, 'k/ft'), ck('M', 'Service moment', q.L.M, 'k-ft'), ck('As', 'Tension steel (WSD)', q.w.needs ? q.w.W.As : q.w.S.As, 'in²', 0.04)],
      solution: () => (
        <Sol
          steps={[
            ...beamALoadSteps(q.L, q.hf, q.ff, q.ll),
            { t: 'Service moment', tex: `M = \\frac{(${FT(q.L.wD, 3)} + ${FT(q.L.wL, 3)})(30)^2}{8} = ${FT(q.L.M, 1)}\\text{ k-ft}` },
            { t: 'Depth', md: `$d = 36 - 3.5 = ${q.d}$ in (two layers), $f_c = 0.45f'_c = ${FT(q.fcA, 3)}$ ksi, $f_s = 24$ ksi, $n = ${q.n}$.` },
            ...(q.w.needs ? q.w.W.steps : q.w.S.steps),
          ]}
          end={q.w.needs ? `Compression steel needed: tension **${q.tW.n} #${q.tW.no}**, compression **${q.cW!.n} #${q.cW!.no}**.` : `$A_s = ${FT(q.w.S.As)}$ in² → **${q.tW.n} #${q.tW.no}**.`}
        />
      ),
    },
    {
      checks: () => [ck('Mu', 'Mu', q.L.Mu, 'k-ft'), ck('As', 'Required As', q.DD ? q.DD.As : q.D.As, 'in²', 0.03)],
      solution: () => (
        <Sol
          steps={[
            { t: 'Loads (from part i)', tex: `w_u = 1.2(${FT(q.L.wD, 3)}) + 1.6(${FT(q.L.wL, 3)}) = ${FT(q.L.wu, 3)}\\text{ k/ft},\\quad M_u = \\frac{w_uL^2}{8} = ${FT(q.L.Mu, 1)}\\text{ k-ft}` },
            { t: 'Depth', md: `$d = ${q.d}$ in, $d_t = 33.5$ in.` },
            ...q.D.steps,
            { t: 'Bars', md: `${q.bU.n} #${q.bU.no} = ${FT(q.bU.A)} in²; $\\phi M_n = ${FT(q.R.phiMn, 1)}$ k-ft.` },
          ]}
          end={`USD: **${q.bU.n} #${q.bU.no}**${q.DD ? ' (compression steel needed)' : ' singly reinforced'}; by WSD the same beam ${q.w.needs ? 'needed compression steel' : `needed ${FT(q.w.S.As)} in²`}.`}
        />
      ),
    },
  ]
}

/** detail drawing of the 4-span + cantilever beam from an As list */
export function detailSol(list: readonly (readonly [string, number])[], note = ''): Pick<RcQ, 'checks' | 'solution'> {
  const SC = standardCutoffs(28)
  const picks = list.map(([k, As]) => ({ k, As, p: pickDoubly(As, 12, [7, 8, 9, 10], 2) }))
  return {
    checks: () => [ck('top', 'Top bars at an interior support extend past the face (ln/3)', SC.topInterior, 'ft'), ck('bot', 'Half the bottom bars stop this far from the face (ln/8)', SC.bottomCut, 'ft')],
    solution: () => (
      <Sol
        steps={[
          { t: 'Bars for each As (12 in width, #3 stirrups, 1.5 in cover)', md: picks.map((p) => `- ${p.k}: ${FT(p.As)} in² → **${p.p.n} #${p.p.no}** (${FT(p.p.A)} in², ${p.p.layers} layer${p.p.layers > 1 ? 's' : ''})`).join('\n') + (note ? `\n\n${note}` : '') },
          {
            t: 'Cut-off / bend points (approximately equal spans, UDL; ln = 28 ft)',
            md: `Top bars at interior supports B, C, D: extend $l_n/3 = ${FT(SC.topInterior)}$ ft past each face (at least ⅓ of them past the inflection point by d, 12db, ln/16). At the exterior end A: $l_n/4 = ${FT(SC.topExterior)}$ ft, hooked into the column. Bottom bars: half stop $l_n/8 = ${FT(SC.bottomCut)}$ ft from the faces, the rest run 6 in into the supports. Support E: the cantilever top steel runs the full 12 ft cantilever (hooked down at the tip) and $l_n/3$ into span D–E; 2 bottom bars continue in the cantilever as stirrup hangers.`,
          },
          { t: 'Sections', md: 'Draw a cross-section at each support (top bars over 2 bottom bars continuing as stirrup hangers) and at each midspan (bottom bars, 2 top hanger bars), #3 stirrups, 1.5 in cover.' },
        ]}
      >
        <FourSpanFig>
          {picks.map((p, i) => {
            const s = 4
            const cw = 8
            const cols = [0, 1, 2, 3, 4].map((j) => 40 + j * (28 * s + cw))
            const neg = p.k.startsWith('−')
            const idx = neg ? 'ABCDE'.indexOf(p.k[1]) : 'ABCD'.indexOf(p.k[1])
            const x = neg ? cols[idx] + cw / 2 : cols[idx] + cw + 14 * s
            return (
              <T key={i} x={x} y={neg ? 196 : 222} s={11} c={neg ? STEEL : LOAD}>
                {`${p.p.n}#${p.p.no}`}
              </T>
            )
          })}
          <T x={20} y={196} a="start" s={11} c={STEEL}>
            top:
          </T>
          <T x={20} y={222} a="start" s={11} c={LOAD}>
            bottom:
          </T>
        </FourSpanFig>
      </Sol>
    ),
  }
}
const sol7 = beamASols(q7)
const sol8b = detailSol([
  ['+A–B', 4.34],
  ['+B–C', 2.96],
  ['+C–D', 2.96],
  ['+D–E', 2.36],
  ['−A', 1.77],
  ['−B', 4.78],
  ['−C', 4.34],
  ['−D', 4.34],
  ['−E', 5.2],
])

/** design a singly reinforced simple-span beam (self-weight iterated once) */
export function ssBeamDesign(L: number, dl: number, ll: number, fc: number, fy: number, b: number, fsA: number, n: number) {
  const lim = rhoLimits(fc, fy)
  const rho = 0.75 * lim.rhoMax
  const h0 = Math.ceil((L * 12) / 16)
  const sw0 = (b * h0) / 144 * 0.15
  const Mu0 = ((1.2 * (dl + sw0) + 1.6 * ll) * L * L) / 8
  const S0 = designSection(Mu0, fc, fy, rho, { b, layers: 2 })
  const h = S0.h
  const sw = (b * h) / 144 * 0.15
  const wu = 1.2 * (dl + sw) + 1.6 * ll
  const Mu = (wu * L * L) / 8
  const d = h - 3.5
  const D = designAs(Mu, b, d, fc, fy, d + 1)
  const bars = pickDoubly(D.As, b)
  const R = review({ b, fc, fy, layers: [{ As: bars.A, d }] })
  const M = ((dl + sw + ll) * L * L) / 8
  const W = wsdDesign(M, b, n, (0.45 * fc) / 1000, fsA)
  return { lim, rho, h0, sw0, Mu0, S0, h, sw, wu, Mu, d, D, bars, R, M, W }
}
const q8c = ssBeamDesign(36, 1.5, 1.4, 3000, 60000, 14, 24, 9)
export function ssBeamSteps(r: ReturnType<typeof ssBeamDesign>, L: number, dl: number, ll: number, b: number): St[] {
  return [
    { t: 'Trial size', md: `Minimum beam depth (simply supported) $l/16 = ${FT((L * 12) / 16, 1)}$ in → trial $h = ${r.h0}$ in, $b = ${b}$ in: self-weight $${FT(r.sw0, 3)}$ k/ft, $M_u = ${FT(r.Mu0, 1)}$ k-ft.` },
    { t: 'Choose ρ', md: `$\\rho = 0.75\\rho_{max} = 0.75(${FT(r.lim.rhoMax, 4)}) = ${FT(r.rho, 5)}$ — moderate ρ keeps the beam stiff (deflection) and tension-controlled.` },
    ...r.S0.steps,
    { t: 'Final loads', tex: `w_{sw} = \\frac{${b}\\times${r.h}}{144}(0.15) = ${FT(r.sw, 3)},\\quad w_u = 1.2(${dl} + ${FT(r.sw, 3)}) + 1.6(${ll}) = ${FT(r.wu, 3)}\\text{ k/ft},\\quad M_u = \\frac{w_uL^2}{8} = ${FT(r.Mu, 1)}\\text{ k-ft}` },
    { t: 'Steel at d = h − 3.5', md: `$d = ${FT(r.d)}$ in (two layers).` },
    ...r.D.steps,
    { t: 'Bars and check', md: `${r.bars.n} #${r.bars.no} = ${FT(r.bars.A)} in² (${r.bars.layers} layer${r.bars.layers > 1 ? 's' : ''}); review: $\\phi M_n = ${FT(r.R.phiMn, 1)}$ k-ft ≥ $M_u = ${FT(r.Mu, 1)}$ ✓, $\\varepsilon_t = ${FT(r.R.epsT, 4)}$.` },
    { t: 'WSD alternative (same b)', md: `Service $M = ${FT(r.M, 1)}$ k-ft; $k = ${FT(r.W.k, 3)}$, $j = ${FT(r.W.j, 3)}$, $R = ${FT(r.W.R * 1000, 0)}$ psi → $d_{req} = \\sqrt{M/Rb} = ${FT(r.W.dReq, 1)}$ in (WSD needs a deeper section).` },
  ]
}

const SOL: Record<string, Pick<RcQ, 'checks' | 'solution'>> = {
  'rc-2005-06-1c': {
    checks: () => [ck('wu', 'Factored load wu', q1c.loads.wu, 'psf'), ck('Mneg', '−Mu at the beam face', q1c.Mneg, 'k-ft/ft'), ck('Mpos', '+Mu in the span', q1c.Mpos, 'k-ft/ft'), ck('s', 'Bottom bar spacing', q1c.pos.s, 'in', 0.05)],
    solution: () => (
      <Sol steps={cantSlabSteps(q1c)} end={`$M_u^- = ${FT(q1c.Mneg)}$ k-ft/ft over each beam, $M_u^+ = ${FT(q1c.Mpos)}$ k-ft/ft at midspan.`}>
        <SlabSketch r={q1c} beams />
      </Sol>
    ),
  },
  'rc-2005-06-2a': {
    checks: () => [ck('beff', 'Effective flange width', q2.B.b, 'in')],
    solution: () => (
      <Sol
        steps={[
          { t: 'Interior T-beam', tex: q2.B.cands.map((c) => `${c.label} = ${FT(c.value, 1)}`).join(',\\quad ') + '\\text{ in}', md: 'L/4 = 24(12)/4 = 72 in; 16(4) + 12 = 76 in; c/c = 84 in.' },
          { t: 'Current slides (ACI 318-14)', md: `${q2.B14.cands.map((c) => `$${c.label} = ${FT(c.value, 1)}$`).join(', ')} → ${FT(q2.B14.b, 1)} in.` },
        ]}
        end={`$b_{eff} = ${FT(q2.B.b)}$ in.`}
      />
    ),
  },
  'rc-2005-06-2b': {
    checks: () => [ck('wu', 'Factored UDL per beam', q2.FL.wu, 'k/ft'), ck('Mu', 'Mu (UDL + midspan load)', q2.Mu, 'k-ft'), ck('As', 'Required As', q2.TD.As, 'in²', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Loads per beam (7 ft strip)', tex: `w_D = \\underbrace{0.120(7)}_{\\text{120 psf incl. slab}} + \\underbrace{\\tfrac{12\\times22}{144}(0.15)}_{\\text{web}} = ${FT(q2.FL.wD, 3)}\\text{ k/ft},\\quad w_L = 0.100(7) = ${FT(q2.FL.wL, 3)}\\text{ k/ft}` },
          { t: 'Factored', tex: `w_u = 1.2(${FT(q2.FL.wD, 3)}) + 1.6(${FT(q2.FL.wL, 3)}) = ${FT(q2.FL.wu, 3)}\\text{ k/ft},\\quad P_u = 1.6(10) = ${FT(q2.Pu)}\\text{ k}`, md: 'The 10 kip midspan load is taken as a service **live** load (not stated in the paper).' },
          { t: 'Moment', tex: `M_u = \\frac{w_uL^2}{8} + \\frac{P_uL}{4} = \\frac{${FT(q2.FL.wu, 3)}(24)^2}{8} + \\frac{${FT(q2.Pu)}(24)}{4} = ${FT(q2.Mu, 1)}\\text{ k-ft}` },
          { t: 'Section', md: `$b_{eff} = ${FT(q2.B.b)}$ in, $b_w = 12$, $h_f = 4$, $d = 26 - 3 = 23$ in.` },
          ...tDesignSteps(q2.tin, q2.TD),
          { t: 'Bars', md: `${q2.bars.n} #${q2.bars.no} = ${FT(q2.bars.A)} in²; $\\phi M_n = ${FT(q2.RT.phiMn, 1)}$ k-ft ≥ $M_u$ ✓.` },
        ]}
        end={`$A_s = ${FT(q2.TD.As)}$ in² → **${q2.bars.n} #${q2.bars.no}**.`}
      />
    ),
  },
  'rc-2005-06-2c': {
    checks: () => [ck('M', 'Service moment', q2.M, 'k-ft'), ck('As', 'Required As (WSD)', q2.WT.As, 'in²', 0.03)],
    solution: () => (
      <Sol
        steps={[{ t: 'Service moment', tex: `M = \\frac{(${FT(q2.FL.wD, 3)} + ${FT(q2.FL.wL, 3)})(24)^2}{8} + \\frac{10(24)}{4} = ${FT(q2.M, 1)}\\text{ k-ft}` }, ...wsdTSteps(q2.win, q2.WT), { t: 'Bars', md: `${q2.wbars.n} #${q2.wbars.no} = ${FT(q2.wbars.A)} in².` }]}
        end={`WSD: $A_s = ${FT(q2.WT.As)}$ in² → **${q2.wbars.n} #${q2.wbars.no}** (USD: ${FT(q2.TD.As)} in²).`}
      />
    ),
  },
  'rc-2005-06-3c': {
    checks: () => [ck('R', 'Support reaction', OH_R, 'k'), ck('Vd', 'Vu at d from the support (span side)', q3c.span.rows[1].Vu, 'k'), ck('s1', 'Stirrup spacing at d (#4, 2 legs)', q3c.span.rows[1].s, 'in', 0.05)],
    solution: () => <Sol steps={q3c.steps} end={`#4 two-legged stirrups. Span (each half, from the support face): ${q3c.span.zones.filter((z) => z.n).map((z) => `${z.n} @ ${FT(z.s, 1)}″`).join(', ')}; overhangs: ${q3c.oh.zones.filter((z) => z.n).map((z) => `${z.n} @ ${FT(z.s, 1)}″`).join(', ')}. First stirrup 2 in from the face. Mirror about midspan; draw the sketch with these groups.`} />,
  },
  'rc-2005-06-4d': {
    checks: () => [ck('16t', '16 mm top bar ld', q4d[0].top.final, 'in', 0.03), ck('16o', '16 mm other bar ld', q4d[0].oth.final, 'in', 0.03), ck('25t', '25 mm top bar ld', q4d[1].top.final, 'in', 0.03), ck('25o', '25 mm other bar ld', q4d[1].oth.final, 'in', 0.03)],
    solution: () => (
      <Sol
        steps={[
          { t: 'Assumption', md: 'Cover and spacing are not given: assume clear spacing ≥ $d_b$, clear cover ≥ $d_b$ with minimum stirrups (first row of the simplified table). Uncoated, normal weight.' },
          ...q4d.map((r): St => ({
            t: `${r.b.label} (db = ${FT(r.b.db, 3)} in, ${r.b.small ? 'like #6 or smaller → 1/25' : 'like #7 or larger → 1/20'})`,
            tex: `\\ell_d = \\frac{f_y\\psi_t\\psi_e}{${r.b.small ? 25 : 20}\\sqrt{f'_c}}d_b:\\quad \\text{top } (\\psi_t = 1.3) = ${FT(r.top.final, 1)}\\text{ in},\\quad \\text{other} = ${FT(r.oth.final, 1)}\\text{ in}`,
          })),
        ]}
        end={q4d.map((r) => `${r.b.label}: top **${Math.ceil(r.top.final)} in**, other **${Math.ceil(r.oth.final)} in**`).join(' · ')}
      />
    ),
  },
  'rc-2005-06-5b': {
    checks: () => [ck('Mcr', 'Mcr (uncracked transformed)', q5b.U.Mcr, 'k-ft'), ck('fc', 'Concrete stress at 60 k-ft', q5b.E.fc * 1000, 'psi'), ck('fs', 'Steel stress at 60 k-ft', q5b.E.fs * 1000, 'psi')],
    solution: () => (
      <Sol
        steps={q5b.E.steps}
        end={`$M_{cr} = ${FT(q5b.U.Mcr, 1)}$ k-ft (transformed) > 60 k-ft → **uncracked**: $f_c = ${FT(q5b.E.fc * 1000, 0)}$ psi, $f_s = ${FT(q5b.E.fs * 1000, 0)}$ psi. On the gross section $M_{cr} = ${FT(q5b.U.McrG, 1)}$ k-ft < 60 — borderline; state which section you use.`}
      />
    ),
  },
  'rc-2005-06-5c': {
    checks: () => [ck('kd', 'Neutral axis kd', q5c.na, 'in'), ck('Icr', 'Icr', q5c.I, 'in⁴', 0.02), ck('fc', 'Concrete stress', q5c.fc, 'ksi'), ck('fs', 'Steel stress', q5c.fs, 'ksi')],
    solution: () => <Sol steps={q5c.steps} end={`Cracked: $kd = ${FT(q5c.na)}$ in, $I_{cr} = ${FT(q5c.I, 0)}$ in⁴, $f_c = ${FT(q5c.fc, 3)}$ ksi, $f_s = ${FT(q5c.fs, 2)}$ ksi.`} />,
  },
  'rc-2005-06-6b': {
    checks: () => [ck('kd', 'kd', q6b.kd, 'in'), ck('M', 'Allowable moment', q6b.M, 'k-ft')],
    solution: () => <Sol steps={[{ t: 'Data', md: "$A_s = 4(0.79) = 3.16$ in², $f_c = 0.45(4) = 1.8$ ksi (not printed), $f_s = 24$ ksi, $n = 8$." }, ...q6b.steps]} end={`$M_{all} = ${FT(q6b.M, 1)}$ k-ft (${q6b.governs} governs).`} />,
  },
  'rc-2005-06-6c': {
    checks: () => [ck('a', 'Depth of stress block a', q6c.a, 'in'), ck('phiMn', 'φMn', q6c.phiMn, 'k-ft')],
    solution: () => <Sol steps={q6c.steps} end={`$M_n = ${FT(q6c.Mn, 1)}$ k-ft, $\\phi M_n = ${FT(q6c.phiMn, 1)}$ k-ft (compare WSD allowable ${FT(q6b.M, 1)} k-ft).`} />,
  },
  'rc-2005-06-7b-i': sol7[0],
  'rc-2005-06-7b-ii': sol7[1],
  'rc-2005-06-8b': sol8b,
  'rc-2005-06-8c': {
    checks: () => [ck('h', 'Total depth chosen', q8c.h, 'in', 0.05), ck('Mu', 'Mu with final self-weight', q8c.Mu, 'k-ft'), ck('As', 'Required As', q8c.D.As, 'in²', 0.04)],
    solution: () => <Sol steps={ssBeamSteps(q8c, 36, 1.5, 1.4, 14)} end={`USD: **14″ × ${q8c.h}″**, ${q8c.bars.n} #${q8c.bars.no}. (Open design: other b and ρ are equally valid — check with the same steps.)`} />,
  },
}

// ================================================================ questions
const PG = { A1: [101], A1f: [101, 105], A2: [101, 105], A2c: [102, 105], A3: [102], A3f: [102, 105], A4: [102], B5: [102], B5f: [103, 106], B6: [103], B6f: [103, 106], B7: [103], B7f: [103, 106], B8: [103], B8f: [104, 106] }

const T_Q2 = String.raw`A floor slab 4″ thick is supported by reinforced concrete beams, 7 ft centre to centre, which together with slab act as T-beams. The cross-section of each beam below the slab is 12″ × 22″ as shown in Fig. 2. The beams are simply supported and their span is 24 ft. The effective depth will be taken 3 inch less than the total depth. The slab supports a service live load of 100 psf and a superimposed dead load of 120 psf including self weight of slab. Moreover, each of the beam supports a concentrated load of 10.0 kip at midspan in addition to the load from slab. Given: $f'_c = 3$ ksi, $f_c = 1.35$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi and $n = 9$. Using ACI Code provisions,`
const T_Q5 = String.raw`A rectangular beam has the dimensions $b = 12''$, $h = 27''$ and $d = 24''$ and is reinforced with four No. 9 (1⅛″ dia) bars. The concrete cylinder strength $f'_c = 4000$ psi and the tensile strength in bending (modulus of rupture) is 475 psi. The yield stress of steel $f_y = 60000$ psi. ($n = 8$, $E_s = 29\times10^6$ psi; beam section in Fig. 4.)`
const T_Q7 = String.raw`Due to certain reasons the architect has proposed the beams supporting a floor slab as shown in Fig. 6. Span of Beam 'A' is 30 ft. The slab supports floor finish (FF) = 25 psf and live load (LL) = 100 psf. Given: $f'_c = 4$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $n = 8$.`

const fig1 = () => <SlabStripFig cant={5} clear={14} support={10} h="6.5″ slab" label="DL 130 psf (incl. self-wt) + LL 80 psf on any portion" note="Plan: 5′-5″ | 14′-10″ | 5′-5″ to beam centrelines. f′c = 3000 psi, fy = 60,000 psi." />
const fig2 = () => <TFloorFig hf={4} bw={12} hw={22} cc={7} cover={3} note="f′c = 3 ksi, fy = 60 ksi, fc = 1.35 ksi, fs = 24 ksi, n = 9 · span 24 ft · 10 k at midspan" />
const fig4 = () => <RectSecFig b={12} h={27} d={24} n={4} label="4 #9 (1⅛″ dia)" title="Fig. 4" />
const fig5 = () => <RectSecFig b={12} h={27} d={24} n={4} label="4 #8 (1″ dia)" title="Fig. 5" />

const BASE: RcQ[] = [
  {
    id: 'rc-2005-06-1a',
    paper: '2005-06',
    sec: 'A',
    no: '1(a)',
    marks: 8,
    topics: ['rc-oneway', 'rc-basics'],
    title: 'Minimum thickness of beams and one-way slabs (ACI)',
    text: 'Write down the minimum thickness for RC beams and one-way slabs for different end conditions as per ACI Code.',
    pages: PG.A1,
    theory: true,
    given: [G('One-way minimum thickness', 'sl-hmin')],
    solution: () => <Md>{A_MIN_H}</Md>,
  },
  {
    id: 'rc-2005-06-1b',
    paper: '2005-06',
    sec: 'A',
    no: '1(b)',
    marks: 8,
    topics: ['rc-oneway'],
    title: 'Temperature & shrinkage steel in one-way slabs',
    text: 'Discuss why and how temperature and shrinkage reinforcement is provided in one-way slabs. What are the recommended (ACI) ratios for such steel?',
    pages: PG.A1,
    theory: true,
    given: [G('T&S steel', 'sl-ts')],
    solution: () => <Md>{A_TS}</Md>,
  },
  {
    id: 'rc-2005-06-1c',
    paper: '2005-06',
    sec: 'A',
    no: '1(c)',
    marks: 19,
    topics: ['rc-oneway'],
    title: 'Slab on two beams with 5 ft cantilevers both sides — moments and steel',
    text: String.raw`A 6.5″ thick slab (one-way) is supported on RC beams as shown in Fig. 1. The calculated dead load on the slab is 130 psf (including self weight) and the slab is subjected to a working live load of 80 psf. The live load can occupy any portion or any position on the slab. Calculate the critical design moments and show the necessary reinforcements in sketches. Use USD. Given: $f'_c = 3000$ psi and $f_y = 60{,}000$ psi.`,
    pages: PG.A1f,
    flag: FLAG_OLD,
    given: [G('T&S steel', 'sl-ts'), G('As per ft for bar spacing', 'm-asft')],
    figure: fig1,
    notes: ['Section A-A: 5′-0″ cantilevers from the beam faces (the left label looks like 5′-6″ on the scan; the plan gives 5′-5″ to the beam centreline, i.e. 5′-0″ + 5″), 10″ beams, 14′-0″ clear.'],
  },
  {
    id: 'rc-2005-06-2a',
    paper: '2005-06',
    sec: 'A',
    no: '2(a)',
    marks: 5,
    topics: ['rc-tbeam'],
    title: 'T-beam floor: effective flange width',
    text: `${T_Q2}\n\n**(a)** find the effective width of flange.`,
    pages: PG.A2,
    given: [G('Effective flange width', 'f-beff')],
    figure: fig2,
  },
  {
    id: 'rc-2005-06-2b',
    paper: '2005-06',
    sec: 'A',
    no: '2(b)',
    marks: 18,
    topics: ['rc-tbeam'],
    title: 'T-beam with a 10 k midspan load: As by USD',
    text: `${T_Q2}\n\n**(b)** find the tensile steel area and select bars for a typical interior beam by USD method.`,
    pages: PG.A2,
    flag: FLAG_OLD,
    given: [G('Effective flange width', 'f-beff')],
    figure: fig2,
    notes: ['The 10 kip midspan load is not labelled dead or live: taken as service live load.', '120 psf includes the slab self-weight; the web below the slab (12 × 22) is added.'],
  },
  {
    id: 'rc-2005-06-2c',
    paper: '2005-06',
    sec: 'A',
    no: '2(c)',
    marks: 12,
    topics: ['rc-tbeam', 'rc-elastic'],
    title: 'Same T-beam: As by WSD (K and Z given)',
    text:
      `${T_Q2}\n\n**(c)** find the tensile steel area and select bars for interior beam by WSD method. Given:` +
      String.raw`
$$K = \frac{np + \tfrac12 (t/d)^2}{np + (t/d)};\qquad Z = \frac{3kd - 2t}{2kd - t}\cdot\frac t3$$`,
    pages: PG.A2c,
    flag: FLAG_WSD,
    given: [G('WSD T-beam k, j, z', 'f-wsdT', 'printed in the question', true)],
    figure: fig2,
  },
  {
    id: 'rc-2005-06-3a',
    paper: '2005-06',
    sec: 'A',
    no: '3(a)',
    marks: 7,
    topics: ['rc-shear'],
    title: 'Maximum stirrup spacing: Vs ≤ 4√f′c bw d and above',
    text: String.raw`What are the maximum spacing of stirrups in shear design for the following cases: (i) when $V_s \le 4\sqrt{f'_c}\,b_wd$; (ii) when $V_s > 4\sqrt{f'_c}\,b_wd$.`,
    pages: PG.A3,
    theory: true,
    given: [G('Case A–D table', 's-cases')],
    solution: () => (
      <Md>{String.raw`**(i) $V_s \le 4\sqrt{f'_c}\,b_wd$** (Cases B and C):
$$s_{max} = \min\left(\frac d2,\ 24\text{ in},\ \frac{A_vf_{yt}}{0.75\sqrt{f'_c}\,b_w},\ \frac{A_vf_{yt}}{50b_w}\right)$$
$d/2$ makes every potential 45° crack (running from mid-depth to the tension steel, horizontal projection ≈ d) cross at least one stirrup; the last two terms keep $A_v \ge A_{v,min}$.

**(ii) $4\sqrt{f'_c}\,b_wd < V_s \le 8\sqrt{f'_c}\,b_wd$** (Case D): the limits are **halved**,
$$s_{max} = \min\left(\frac d4,\ 12\text{ in}\right)$$
so that each crack is crossed by at least two stirrups — high shear means wider, more frequent diagonal cracks.

**$V_s > 8\sqrt{f'_c}\,b_wd$**: not permitted — the web would crush; enlarge the section.

With the class's simple $V_c = 2\sqrt{f'_c}b_wd$, the two limits are $\phi V_s = 2\phi V_c$ and $4\phi V_c$. Stirrups are also needed only where $V_u > \tfrac12\phi V_c$.`}</Md>
    ),
  },
  {
    id: 'rc-2005-06-3b',
    paper: '2005-06',
    sec: 'A',
    no: '3(b)',
    marks: 6,
    topics: ['rc-shear'],
    title: 'Hoops in beams in regions of moderate seismic risk',
    text: 'What are the ACI Code requirements for shear reinforcements (hoops) for beams in regions of moderate seismic risk?',
    pages: PG.A3,
    theory: true,
    flag: 'Seismic detailing (ACI ch. 21, intermediate moment frames) — not in the current slides',
    given: [],
    solution: () => (
      <Md>{String.raw`ACI 318-99/02 §21.10 (frames in regions of **moderate** seismic risk = intermediate moment frames):

**Hoops at the member ends**
- Closed **hoops** (not open stirrups) over a length **$2h$** from the face of the supporting member at both ends of the beam.
- First hoop not more than **2 in** from the support face.
- Spacing in that zone not more than the smallest of **$d/4$**, **8 × diameter of the smallest longitudinal bar**, **24 × hoop bar diameter**, and **12 in**.
- Elsewhere: stirrups at **$s \le d/2$** throughout the length.
- Hoops have **135° seismic hooks** with extensions of $6d_b$ (≥ 3 in) anchored into the core.

**Design shear** — not less than the smaller of
- the shear from the nominal moment strengths at both ends ($M_{nl} + M_{nr})/l_n$ plus the factored gravity shear, and
- the maximum shear from the design load combinations with the earthquake effect **doubled**.

This forces a flexural (ductile) hinge before a shear failure.

**Related longitudinal rules:** positive moment strength at a joint face ≥ ⅓ of the negative moment strength there; at any section, both positive and negative strength ≥ ⅕ of the maximum at either joint face.`}</Md>
    ),
  },
  {
    id: 'rc-2005-06-3c',
    paper: '2005-06',
    sec: 'A',
    no: '3(c)',
    marks: 22,
    topics: ['rc-shear'],
    title: 'Overhanging beam with factored point loads — stirrup design and sketch',
    text: String.raw`Using USD method, design the shear reinforcement for the beam of Fig. 3. Show the shear reinforcement details in a neat sketch. The loads shown in the figure are factored. Neglect self weight of the beam. Given: $f'_c = 3000$ psi and $f_y = 50{,}000$ psi.`,
    pages: PG.A3f,
    flag: FLAG_OLD,
    given: [G('Vc and limits', 's-vc'), G('Case A–D table', 's-cases')],
    figure: () => <OverhangFig />,
    notes: ['Support widths not given: faces taken at the support centrelines. The UDL acts only between the supports.', 'Stirrup size not given: #4 two-legged used because #3 would need s ≈ 2.7 in near the supports.'],
  },
  {
    id: 'rc-2005-06-4a',
    paper: '2005-06',
    sec: 'A',
    no: '4(a)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Standard cut-off / bend points for equal spans with UDL (sketch)',
    text: 'Show with neat sketches cut off or bend points for bars in approximately equal spans with uniformly distributed loads.',
    pages: PG.A4,
    theory: true,
    given: [G('Cut-off rules', 'b-cutoff')],
    solution: () => (
      <div className="space-y-3">
        <Md>{String.raw`For continuous beams/slabs with approximately equal spans (longer span ≤ 1.2 × shorter) and uniform load, ACI/CRSI standard details may be used instead of computing cut-offs ($l_n$ = clear span):

**Straight bars**
- **Top bars at interior supports:** extend $l_n/3$ past the face (at least ⅓ of them past the inflection point by $d$, $12d_b$ or $l_n/16$).
- **Top bars at the exterior (discontinuous) support:** extend $l_n/4$, with a standard hook into the column or spandrel.
- **Bottom bars:** about half stop at $l_n/8$ from each support face; the rest (at least ¼, ⅓ for simple spans) run at least 6 in into the support.

**Bent (cranked) bars**
- Bend up at about $l_n/4$ from an interior support face and $l_n/7$ from an exterior face, carry over the support and down on the other side at the same distance.

The rules envelope the usual live-load patterns and give the $d$ / $12d_b$ extensions automatically.`}</Md>
        <CutoffSketch />
      </div>
    ),
  },
  {
    id: 'rc-2005-06-4b',
    paper: '2005-06',
    sec: 'A',
    no: '4(b)',
    marks: 8,
    topics: ['rc-bond'],
    title: 'Minimum lap lengths: tension, compression and column splices',
    text: 'What are the minimum length of lap for tension splices, compression splices and column splices as per ACI Code?',
    pages: PG.A4,
    theory: true,
    given: [G('Class A/B splices', 'b-splice'), G('Compression ld', 'b-ldc')],
    solution: () => (
      <Md>{String.raw`**Tension lap splices** (deformed bars, #11 and smaller):
- **Class A: $1.0\ell_d$** — only if $A_{s,prov} \ge 2A_{s,req}$ over the whole splice **and** at most 50% of the bars are spliced within the lap length.
- **Class B: $1.3\ell_d$** — all other cases (the default).
- $\ell_d$ computed with all ψ factors but **without** the excess-steel reduction; lap $\ge 12$ in. Avoid splicing at points of maximum stress; stagger splices.

**Compression lap splices:**
- $f_y \le 60$ ksi: $l_{sc} = 0.0005f_yd_b$; $f_y > 60$ ksi: $(0.0009f_y - 24)d_b$; $\ge 12$ in.
- Increase by ⅓ if $f'_c < 3000$ psi.
- Different bar sizes: the larger of $\ell_{dc}$ of the larger bar and $l_{sc}$ of the smaller bar.

**Column splices:**
- Bars in compression: compression lap as above; × **0.83** in tied columns with tie area ≥ $0.0015hs$ in both directions, × **0.75** in spiral columns (still ≥ 12 in).
- Bars in tension, stress ≤ $0.5f_y$: Class A if ≤ half the bars are spliced at a section and alternate splices are staggered by $\ell_d$; otherwise Class B. Stress > $0.5f_y$: Class B.
- End-bearing splices (compression only): ends square within 1.5°, bearing within 3°, with enough continuing bars in each face (tensile capacity ≥ $0.25f_yA_s$ of that face).`}</Md>
    ),
  },
  {
    id: 'rc-2005-06-4c',
    paper: '2005-06',
    sec: 'A',
    no: '4(c)',
    marks: 9,
    topics: ['rc-bond'],
    title: 'Factors that influence development length',
    text: 'Discuss briefly the factors that influence development length of a reinforcing bar.',
    pages: PG.A4,
    theory: true,
    given: [G('ψ factors', 'b-psi')],
    solution: () => <Md>{A_LD_FACTORS}</Md>,
  },
  {
    id: 'rc-2005-06-4d',
    paper: '2005-06',
    sec: 'A',
    no: '4(d)',
    marks: 10,
    topics: ['rc-bond'],
    title: 'ld of 16 mm and 25 mm bars: top bars and others',
    text: String.raw`Calculate the development lengths of 16 mm and 25 mm uncoated bars in USD for (i) top bars; and (ii) for other bars. Given: $f'_c = 3$ ksi and $f_y = 40$ ksi.`,
    pages: PG.A4,
    given: [G('ld simplified + general', 'b-ld'), G('ψ factors', 'b-psi')],
    notes: ['Cover and spacing not given: first row of the simplified table assumed.'],
  },
  {
    id: 'rc-2005-06-5a',
    paper: '2005-06',
    sec: 'B',
    no: '5(a)',
    marks: 9,
    topics: ['rc-elastic', 'rc-singly'],
    title: 'Stress and strain diagrams: uncracked, cracked, ultimate',
    text: 'Draw sketches for stress distribution and strain distribution diagrams of a RC beam section when subjected to bending for uncracked condition, cracked condition and ultimate condition.',
    pages: PG.B5,
    theory: true,
    given: [],
    solution: () => (
      <div className="space-y-3">
        <Md>{A_THREE}</Md>
        <ThreeStages />
      </div>
    ),
  },
  {
    id: 'rc-2005-06-5b',
    paper: '2005-06',
    sec: 'B',
    no: '5(b)',
    marks: 14,
    topics: ['rc-elastic'],
    title: 'Stresses at M = 60 k-ft (cracked or not?)',
    text: `${T_Q5}\n\nDetermine the stresses of concrete and steel caused by a bending moment $M = 60$ k-ft.`,
    pages: PG.B5f,
    given: [G('Cracked / uncracked section formulas', 'f-elastic')],
    figure: fig4,
    notes: ['Borderline: Mcr on the gross section ≈ 57.7 k-ft (< 60, cracked) but on the uncracked transformed section ≈ 70 k-ft (> 60, uncracked). The class uses the transformed section.'],
  },
  {
    id: 'rc-2005-06-5c',
    paper: '2005-06',
    sec: 'B',
    no: '5(c)',
    marks: 12,
    topics: ['rc-elastic'],
    title: 'Same beam at M = 120 k-ft: cracked properties and stresses',
    text: `${T_Q5}\n\nFor the same beam as in Fig. 4 if the applied moment is 120 k-ft, calculate the relevant properties and stresses in concrete and steel.`,
    pages: PG.B5f,
    given: [G('Cracked / uncracked section formulas', 'f-elastic')],
    figure: fig4,
  },
  {
    id: 'rc-2005-06-6a',
    paper: '2005-06',
    sec: 'B',
    no: '6(a)',
    marks: 8,
    topics: ['rc-doubly'],
    title: 'Singly vs doubly reinforced; does A′s always add capacity?',
    text: "What is meant by 'singly reinforced beam' and 'doubly reinforced beam'? Do you think addition of bars in compression zone of a singly reinforced beam will always increase the moment capacity of the particular section? Justify your answer.",
    pages: PG.B6,
    theory: true,
    given: [],
    solution: () => <Md>{A_SINGLY_DOUBLY}</Md>,
  },
  {
    id: 'rc-2005-06-6b',
    paper: '2005-06',
    sec: 'B',
    no: '6(b)',
    marks: 13,
    topics: ['rc-elastic'],
    title: 'Allowable (WSD) moment of a 12×27 section with 4 #8',
    text: String.raw`Calculate the allowable moment capacity of the beam section shown in Fig. 5. Given: $f'_c = 4$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $n = 8$.`,
    pages: PG.B6f,
    given: [G('WSD allowable stresses', 'f-wsd'), G('Cracked / uncracked section formulas', 'f-elastic')],
    figure: fig5,
    notes: ['Allowable concrete stress not printed: 0.45f′c = 1.8 ksi.'],
  },
  {
    id: 'rc-2005-06-6c',
    paper: '2005-06',
    sec: 'B',
    no: '6(c)',
    marks: 14,
    topics: ['rc-singly'],
    title: 'Same section: design (ultimate) moment capacity',
    text: 'Calculate the design (ultimate) moment capacity of the same beam section in Fig. 5. Material properties are same as in Q. 6(b).',
    pages: PG.B6f,
    given: [G('φ factors and φ–εt chart', 'm-phi')],
    figure: fig5,
  },
  {
    id: 'rc-2005-06-7a',
    paper: '2005-06',
    sec: 'B',
    no: '7(a)',
    marks: 5,
    topics: ['rc-singly'],
    title: 'Why under-reinforced sections are used',
    text: 'In the design of reinforced concrete beams the usual practice is to use underreinforced beam sections. Explain.',
    pages: PG.B7,
    theory: true,
    given: [],
    solution: () => (
      <Md>{String.raw`An under-reinforced section ($\rho < \rho_b$) has its steel yield before the concrete crushes. That is preferred because:
1. **Ductile failure with warning** — after yielding the beam deflects a lot and cracks widen visibly long before collapse; an over-reinforced beam fails suddenly by concrete crushing.
2. **Reliable strength** — $M_n \approx A_sf_y(d - a/2)$ depends mainly on the steel strength, which is well controlled; variation of $f'_c$ hardly changes it.
3. **Redistribution of moments** in continuous structures needs plastic rotation, which only yielding steel provides.
4. **Economy** — steel is used to its full yield stress; over-reinforcing adds costly steel that never yields, and congests the section.
5. **Code requirement** — ACI requires $\varepsilon_t \ge 0.004$ for beams (formerly $\rho \le 0.75\rho_b$), and gives the highest $\phi = 0.90$ only when $\varepsilon_t \ge 0.005$ (tension-controlled).
6. Lower ρ also means stiffer, deeper sections with smaller deflections.`}</Md>
    ),
  },
  {
    id: 'rc-2005-06-7b-i',
    paper: '2005-06',
    sec: 'B',
    no: '7(b)(i)',
    marks: 16,
    topics: ['rc-elastic'],
    title: "Architect's Beam 'A' under a brick wall — design by WSD",
    text: `${T_Q7}\n\n**(i)** Design the Beam 'A' by WSD. Only flexural design is required.`,
    pages: PG.B7f,
    flag: FLAG_WSD,
    given: [G('WSD allowable stresses', 'f-wsd')],
    figure: () => <BeamAFig hf={6} />,
    notes: ['Brick unit weight not given: 120 pcf. Slab reaction on the wall taken as the interior reaction of a two-span continuous slab, 1.25wL.'],
  },
  {
    id: 'rc-2005-06-7b-ii',
    paper: '2005-06',
    sec: 'B',
    no: '7(b)(ii)',
    marks: 14,
    topics: ['rc-singly'],
    title: "Same Beam 'A' — design by USD",
    text: `${T_Q7}\n\n**(ii)** Design the same Beam 'A' by USD. Only flexural design is required.`,
    pages: PG.B7f,
    flag: FLAG_OLD,
    given: [G('ρ limits (Table A.4)', 'f-rho')],
    figure: () => <BeamAFig hf={6} />,
  },
  {
    id: 'rc-2005-06-8a',
    paper: '2005-06',
    sec: 'B',
    no: '8(a)',
    marks: 5,
    topics: ['rc-basics'],
    title: 'Concrete protection for reinforcement (with sketches)',
    text: 'What do you mean by concrete protection for reinforcements? Discuss making sketches.',
    pages: PG.B8,
    theory: true,
    given: [G('Cover & spacing rules', 'm-cover')],
    solution: () => (
      <div className="space-y-3">
        <Md>{"**Concrete protection** = the clear cover of concrete between the outside of the reinforcement (stirrups/ties included) and the nearest concrete surface.\n\n" + A_COVER}</Md>
        <CoverSketch />
      </div>
    ),
  },
  {
    id: 'rc-2005-06-8b',
    paper: '2005-06',
    sec: 'B',
    no: '8(b)',
    marks: 14,
    topics: ['rc-bond', 'rc-basics'],
    title: '4-span beam + cantilever: detail drawing from the As list',
    text: String.raw`A 4-span beam with a cantilever on one end is shown in Fig. 7. For a certain loading system the required flexural reinforcement areas calculated from corresponding design moments at different locations are given as following. Make a detail drawing showing all the reinforcements. Make sections also.

Beam size 12″ × 30″; column size 24″ × 24″.
- $+A_s$(A-B) = 4.34 in², $+A_s$(B-C) = 2.96 in², $+A_s$(C-D) = 2.96 in², $+A_s$(D-E) = 2.36 in²
- $-A_s$(A) = 1.77 in², $-A_s$(B) = 4.78 in², $-A_s$(C) = 4.34 in², $-A_s$(D) = 4.34 in², $-A_s$(E) = 5.2 in²`,
    pages: PG.B8f,
    given: [G('Cut-off rules', 'b-cutoff'), G('Bar areas', 'm-bars')],
    figure: () => <FourSpanFig />,
    notes: ['Student ink strikes through several values on the scan; every printed value is still legible and used as printed. f′c, fy not given.'],
  },
  {
    id: 'rc-2005-06-8c',
    paper: '2005-06',
    sec: 'B',
    no: '8(c)',
    marks: 16,
    topics: ['rc-singly'],
    title: 'Design a singly reinforced 36 ft simple-span beam (WSD or USD)',
    text: String.raw`Design a singly reinforced rectangular beam shown in Fig. 8 either by WSD or USD. The dead load does not include the self wt. of the beam. Given: $f'_c = 3$ ksi, $f_y = 60$ ksi, $f_s = 24$ ksi, $n = 9$.`,
    pages: PG.B8f,
    flag: FLAG_OLD,
    given: [G('ρ limits (Table A.4)', 'f-rho')],
    figure: () => <SSBeamFig L={36} dl={1.5} ll={1.4} />,
  },
]

// ================================================================ more shared answers / sketches
export const A_THREE = String.raw`Take a singly reinforced beam under increasing positive moment (compression at the top).

**1. Uncracked** ($M < M_{cr}$): the tensile stress at the bottom is below $f_r$; the whole section works. Strain is linear (plane sections) and so is stress (both materials elastic). Steel is transformed as $(n-1)A_s$; $f_s = n f_c$ at the steel level.

**2. Cracked, elastic** ($M_{cr} < M$, service range, $f_c \lesssim 0.5f'_c$): tension cracks rise to near the neutral axis; concrete below it is ignored. Strain linear; concrete compression stress linear (triangle) over $kd$; steel carries all tension $T = A_sf_s$, $f_s < f_y$. Neutral axis $kd$ from $b(kd)^2/2 = nA_s(d - kd)$. This is the WSD state.

**3. Ultimate** ($M = M_n$): strain still linear, top strain $\varepsilon_{cu} = 0.003$; concrete stress is curved (parabolic, maximum ≈ $0.85f'_c$), replaced by the Whitney block $0.85f'_c$ over $a = \beta_1c$. Under-reinforced: steel has yielded, $T = A_sf_y$, $M_n = A_sf_y(d - a/2)$.`

export const A_SINGLY_DOUBLY = String.raw`**Singly reinforced beam:** steel only on the tension side (any top "hanger" bars are ignored in strength). **Doubly reinforced beam:** steel on both faces, the compression steel $A'_s$ counted in the strength — used when the section size is fixed and $M_u$ exceeds the singly-reinforced maximum ($\rho \le \rho_{max}$), for stress reversal, or to reduce long-term deflection.

**Does adding compression bars always increase the capacity? Not significantly — it depends on the steel ratio.**
- In an **under-reinforced** beam the tension steel yields and fixes the total force: $C = T = A_sf_y$. Adding $A'_s$ only shares that same compression between concrete and steel, so $a$ drops a little and the lever arm grows slightly — typically a gain of only a few percent, and $A'_s$ may not even yield (it sits near the neutral axis). **To gain real capacity, tension steel must be added together with the compression steel** ($A_s = A_{s1} + A'_sf'_s/f_y$).
- In an **over-reinforced** (or heavily reinforced) beam, adding $A'_s$ relieves the concrete, raises the neutral axis, lets the tension steel yield and increases both strength and ductility substantially.
- Other benefits even when strength gain is small: less creep deflection (sustained load moves to the steel), more ductility, holds stirrups, resists moment reversal.`

/** typical cut-off / bend points sketch, equal spans with UDL */
export function CutoffSketch() {
  const sc = 7.5
  const L = 20
  const x0 = 40
  const cols = [0, 1, 2].map((i) => x0 + i * (L * sc + 12))
  const yT = 60
  const h = 26
  return (
    <Fig w={420} h={190} max={600}>
      <rect x={x0 - 6} y={yT} width={cols[2] - x0 + 18} height={h} fill={CONC} stroke={INK} />
      {cols.map((x, i) => (
        <rect key={i} x={x - 6} y={yT + h} width={12} height={30} fill={CONC} stroke={INK} />
      ))}
      {/* top bars */}
      <Ln x1={cols[1] - (L / 3) * sc} y1={yT + 5} x2={cols[1] + (L / 3) * sc} y2={yT + 5} c={STEEL} w={2.2} />
      <Ln x1={cols[0] - 2} y1={yT + 5} x2={cols[0] + (L / 4) * sc} y2={yT + 5} c={STEEL} w={2.2} />
      <Ln x1={cols[0] - 2} y1={yT + 5} x2={cols[0] - 2} y2={yT + 20} c={STEEL} w={2.2} />
      {/* bottom bars */}
      <Ln x1={cols[0] - 3} y1={yT + h - 5} x2={cols[2] + 3} y2={yT + h - 5} c={LOAD} w={2} />
      {[0, 1].map((i) => (
        <Ln key={i} x1={cols[i] + 6 + (L / 8) * sc} y1={yT + h - 9} x2={cols[i + 1] - 6 - (L / 8) * sc} y2={yT + h - 9} c={LOAD} w={2} dash="5 2" />
      ))}
      <T x={cols[1]} y={yT - 8} s={11}>
        ln/3 each side
      </T>
      <T x={cols[0] + 30} y={yT - 8} s={11}>
        ln/4
      </T>
      <T x={cols[0] + 6 + (L / 16) * sc} y={yT + h + 48} s={11}>
        ln/8
      </T>
      <T x={210} y={yT + h + 70} s={11} c={MUTE}>
        solid bottom bars: 6″ into supports; dashed: half the bottom bars, stop ln/8 from faces
      </T>
      <T x={210} y={yT + h + 86} s={11} c={MUTE}>
        bent bars instead: bend up at ln/4 (interior) and ln/7 (exterior) from the faces
      </T>
    </Fig>
  )
}

/** cover sketch: beam section and slab */
export function CoverSketch() {
  return (
    <Fig w={520} h={200} max={520}>
      <Conc x={60} y={20} w={110} h={160} />
      <rect x={72} y={32} width={86} height={136} fill="none" stroke={STEEL} strokeWidth={2} rx={4} />
      <Bars x1={84} x2={146} y={155} n={3} r={6} />
      <Bars x1={82} x2={148} y={44} n={2} r={4} />
      <DimH x1={60} x2={72} y={110} label="" />
      <T x={66} y={100} s={11}>
        1½″
      </T>
      <T x={115} y={196} s={11}>
        beam: 1½″ clear to stirrup
      </T>
      <rect x={260} y={90} width={220} height={40} fill={CONC} stroke={INK} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Ln key={i} x1={275 + i * 38} y1={124} x2={275 + i * 38} y2={124} />
      ))}
      <Bars x1={275} x2={465} y={122} n={6} r={3.5} />
      <DimV y1={125.5} y2={130} x={490} label="¾″ clear" />
      <T x={370} y={160} s={11}>
        slab: ¾″ clear cover
      </T>
      <T x={370} y={180} s={11} c={MUTE}>
        exposed to earth/weather 1½–2″, cast against earth 3″
      </T>
    </Fig>
  )
}

export const R2005: RcQ[] = BASE.map((q) => (SOL[q.id] ? { ...q, ...SOL[q.id] } : q))
