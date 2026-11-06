// Shared pieces for AJK sir's half of the seven old papers (2007-08 … 2015-16): strength at a depth, CD test on
// sand, single CU test on NC clay, Culmann / trial wedge, lateral pressure from point and line loads, Rankine
// sloping backfill, critical height of cuts, and the figures those questions need. Every number comes from the
// engines in src/soil/engine; the general renderers come from ./kit.
import type { ReactNode } from 'react'
import { Md, Tex } from '../../../components/ui'
import { coulomb, criticalHeight, crackDepth, Ka, Kp, rankineSloping, trialWedge } from '../../engine/earth'
import { circle, failurePlane, fsOnPlane, obliquity, type Circle } from '../../engine/mohr'
import { phiFromCircle, strengthAt } from '../../engine/shear'
import { GW } from '../../engine/units'
import { MohrFig } from '../../topics/shear/figs'
import type { Check } from '../../types'
import { CE, CT, f1, f2, f3, f4, Head, MohrPlot, Result, Sol, Tbl } from './kit'

export * from './kit'

const rad = (d: number) => (d * Math.PI) / 180

/** a framed figure */
export function Frame({ children }: { children: ReactNode }) {
  return <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto">{children}</div>
}

// ---------------------------------------------------------------- strength on a horizontal plane (dry sand, before / after a structure)
export interface DepthLoad {
  z: number
  gamma: number
  phi: number
  /** added vertical stress and the shear stress on the horizontal plane after loading */
  dSigma: number
  tau: number
}
export function depthLoad(p: DepthLoad) {
  const prof = { z: p.z, zw: Number.POSITIVE_INFINITY, gamma: p.gamma, gammaSat: p.gamma }
  const before = strengthAt(prof, { c: 0, phi: p.phi })
  const after = strengthAt({ ...prof, q: p.dSigma }, { c: 0, phi: p.phi }, p.tau)
  return { before, after, FS: after.FS! }
}
export function depthLoadChecks(p: DepthLoad): Check[] {
  const r = depthLoad(p)
  return [
    { key: 's0', label: 'Vertical stress on the horizontal plane now, $\\sigma = \\gamma z$', value: r.before.sigma, unit: 'kPa' },
    { key: 't0', label: 'Shear strength now, $s = \\sigma\\tan\\varphi$', value: r.before.tauf, unit: 'kPa' },
    { key: 's1', label: 'Vertical stress after loading', value: r.after.sigma, unit: 'kPa' },
    { key: 't1', label: 'Shear strength after loading', value: r.after.tauf, unit: 'kPa' },
    { key: 'FS', label: 'Factor of safety against shear failure on the horizontal plane', value: r.FS, tol: 0.02 },
  ]
}
export function DepthLoadSolution({ p, tail }: { p: DepthLoad; tail?: string }) {
  const r = depthLoad(p)
  return (
    <Sol>
      <Md>{`Granular soil: $c = 0$, $\\tau_f = \\sigma'\\tan\\varphi$ (AJK sir's Problem 3). No water table is given, so $u = 0$ and $\\sigma' = \\sigma$. The normal stress on a **horizontal** plane is the vertical stress.`}</Md>
      <Tex block>{`\\sigma_v = \\gamma z = ${f2(p.gamma)}\\times${f2(p.z)} = ${f2(r.before.sigma)}\\ \\text{kPa},\\qquad s = ${f2(r.before.sigma)}\\tan ${f2(p.phi)}^\\circ = ${f2(r.before.tauf)}\\ \\text{kPa}`}</Tex>
      <Head>After the structure is built</Head>
      <Tex block>{`\\sigma_v = ${f2(r.before.sigma)} + ${f2(p.dSigma)} = ${f2(r.after.sigma)}\\ \\text{kPa},\\qquad s = ${f2(r.after.sigma)}\\tan ${f2(p.phi)}^\\circ = ${f2(r.after.tauf)}\\ \\text{kPa}`}</Tex>
      <Tex block>{`FS = \\frac{s}{\\tau} = \\frac{${f2(r.after.tauf)}}{${f2(p.tau)}} = ${f2(r.FS)}`}</Tex>
      <Frame>
        <MohrFig
          height={240}
          circles={[]}
          envs={[{ env: { c: 0, phi: p.phi }, color: CE, label: `τf = σ tan ${f2(p.phi)}°` }]}
          points={[
            { s: r.before.sigma, t: r.before.tauf, color: 'var(--c-mute)', label: `strength now ${f1(r.before.tauf)}` },
            { s: r.after.sigma, t: r.after.tauf, color: CE, label: `strength after ${f1(r.after.tauf)}` },
            { s: r.after.sigma, t: p.tau, color: 'var(--c-load)', label: `applied τ = ${f1(p.tau)}`, dy: 14 },
          ]}
        />
      </Frame>
      <Result>{`The applied shear stress ${f2(p.tau)} kPa ${p.tau < r.after.tauf ? '**does not exceed**' : '**exceeds**'} the strength ${f2(r.after.tauf)} kPa on the horizontal plane: FS = **${f2(r.FS)}**${r.FS > 1 ? ' > 1, so the soil is stable against failure on that plane' : ' < 1: failure'}. (The added vertical stress raises the strength too, which is why the check is done after loading.)`}</Result>
      {tail && <Md>{tail}</Md>}
    </Sol>
  )
}

// ---------------------------------------------------------------- rapid (CU) vs slow (CD) strength at depth (2009-10 Q4(a), 2011-12 Q4(b))
export interface CuCdDepth {
  z: number
  gsat: number
  ccu: number
  phicu: number
  cd: number
  phid: number
}
export function cuCdDepth(p: CuCdDepth) {
  const prof = { z: p.z, zw: 0, gamma: p.gsat, gammaSat: p.gsat }
  const rapid = strengthAt(prof, { c: p.ccu, phi: p.phicu })
  const slow = strengthAt(prof, { c: p.cd, phi: p.phid })
  const rapidTotal = p.ccu + rapid.sigma * Math.tan(rad(p.phicu))
  return { s: rapid, rapidTotal, rapidEff: rapid.tauf, slow: slow.tauf }
}
export function cuCdChecks(p: CuCdDepth): Check[] {
  const r = cuCdDepth(p)
  return [
    { key: 'sig', label: 'Total vertical stress at the layer $\\sigma$', value: r.s.sigma, unit: 'kPa' },
    { key: 'u', label: 'Pore pressure $u$', value: r.s.u, unit: 'kPa' },
    { key: 'sp', label: "Effective stress $\\sigma'$", value: r.s.sigmaP, unit: 'kPa' },
    { key: 'r', label: '(i) Rapid loading: $c_{cu} + \\sigma\\tan\\varphi_{cu}$', value: r.rapidTotal, unit: 'kPa' },
    { key: 'd', label: "(ii) Slow loading: $c'_d + \\sigma'\\tan\\varphi'_d$", value: r.slow, unit: 'kPa' },
  ]
}
export function CuCdSolution({ p }: { p: CuCdDepth }) {
  const r = cuCdDepth(p)
  return (
    <Sol>
      <Md>{`Water table at the ground surface, so everything above the layer is saturated: $\\sigma = \\gamma_{sat}z$, $u = \\gamma_w z$.`}</Md>
      <Tex block>{`\\sigma = ${f2(p.gsat)}\\times${f2(p.z)} = ${f2(r.s.sigma)},\\quad u = ${GW}\\times${f2(p.z)} = ${f2(r.s.u)},\\quad \\sigma' = ${f2(r.s.sigmaP)}\\ \\text{kPa}`}</Tex>
      <Head>(i) Shear stress builds up rapidly</Head>
      <Md>{`Rapid loading of a saturated clay is **undrained**: no time for the excess pore pressure to dissipate. The clay was consolidated in the field under its overburden, so the **consolidated-undrained** parameters apply, with the total stress on the plane (the textbook answer):`}</Md>
      <Tex block>{`s = c_{cu} + \\sigma\\tan\\varphi_{cu} = ${f2(p.ccu)} + ${f2(r.s.sigma)}\\tan ${f2(p.phicu)}^\\circ = ${f2(r.rapidTotal)}\\ \\text{kPa}`}</Tex>
      <Head>(ii) Shear stress builds up very slowly</Head>
      <Md>{`Slow loading is **drained**: the excess pore pressure dissipates as it is generated, so the effective-stress (CD) parameters apply with σ′:`}</Md>
      <Tex block>{`s = c'_d + \\sigma'\\tan\\varphi'_d = ${f2(p.cd)} + ${f2(r.s.sigmaP)}\\tan ${f2(p.phid)}^\\circ = ${f2(r.slow)}\\ \\text{kPa}`}</Tex>
      <Result>{`(i) rapid: **${f1(r.rapidTotal)} kPa**; (ii) slow: **${f1(r.slow)} kPa**.`}</Result>
      <Md>{`*Comment:* strictly, a CU envelope plotted against the consolidation pressure should be entered with the stress the clay was consolidated under (σ′ = ${f2(r.s.sigmaP)} kPa), which gives ${f2(p.ccu)} + ${f2(r.s.sigmaP)} tan ${f2(p.phicu)}° = ${f1(r.rapidEff)} kPa — then the rapid case is the weaker one, as expected for a normally loaded clay. Write the textbook value and mention this.`}</Md>
    </Sol>
  )
}

// ---------------------------------------------------------------- CD test on sand (2012-13 Q4, 2010-11 Q4(b))
export function cdSand(s3: number, dev: number) {
  const c = circle(s3 + dev, s3)
  const phi = phiFromCircle(s3, dev)
  const fp = failurePlane(c, phi)
  const tmaxObl = obliquity(c.C, c.R)
  const FS = fsOnPlane(c.C, c.R, { c: 0, phi })
  return { c, phi, fp, tauMax: c.R, sigTauMax: c.C, tmaxObl, FS }
}
export function cdSandChecks(s3: number, dev: number, extra = false): Check[] {
  const r = cdSand(s3, dev)
  const out: Check[] = [
    { key: 'phi', label: "Angle of shearing resistance $\\varphi'$", value: r.phi, unit: '°', tol: 0.01 },
    { key: 'th', label: 'Failure plane to the horizontal, $45 + \\varphi\'/2$', value: r.fp.theta, unit: '°', tol: 0.01 },
    { key: 'sf', label: 'Normal stress on the failure plane', value: r.fp.sigma, unit: 'kPa' },
    { key: 'tf', label: 'Shear stress on the failure plane', value: r.fp.tau, unit: 'kPa' },
    { key: 'tm', label: 'Maximum shear stress $\\tau_{max}$', value: r.tauMax, unit: 'kPa' },
  ]
  if (extra) {
    out.push({ key: 'ob', label: 'Obliquity on the $\\tau_{max}$ plane', value: r.tmaxObl, unit: '°', tol: 0.01 })
    out.push({ key: 'FS', label: 'FS against shear on the $\\tau_{max}$ plane', value: r.FS, tol: 0.01 })
  }
  return out
}
export function CDSandSolution({ s3, dev, extra, initial }: { s3: number; dev: number; extra?: boolean; initial?: boolean }) {
  const r = cdSand(s3, dev)
  const strength = r.sigTauMax * Math.tan(rad(r.phi))
  return (
    <Sol>
      <Md>{`Drained test on saturated sand: no excess pore pressure, so total = effective stress, and $c' = 0$. At failure $\\sigma'_3 = ${f2(s3)}$ kPa, $\\sigma'_1 = ${f2(s3)} + ${f2(dev)} = ${f2(r.c.s1)}$ kPa: centre $C = ${f2(r.c.C)}$, radius $R = ${f2(r.c.R)}$ kPa.`}</Md>
      <Tex block>{`\\sin\\varphi' = \\frac{\\sigma'_1 - \\sigma'_3}{\\sigma'_1 + \\sigma'_3} = \\frac{${f2(dev)}}{${f2(r.c.s1 + s3)}} = ${f4(Math.sin(rad(r.phi)))} \\Rightarrow \\varphi' = ${f2(r.phi)}^\\circ`}</Tex>
      <Md>{`**Failure plane.** In a triaxial specimen σ′1 acts on the horizontal plane (major principal plane), so the failure plane is inclined at $\\theta = 45 + \\varphi'/2 = ${f2(r.fp.theta)}^\\circ$ to the **horizontal**.`}</Md>
      <Tex block>{`\\sigma'_f = C - R\\sin\\varphi' = ${f2(r.c.C)} - ${f2(r.c.R)}(${f4(Math.sin(rad(r.phi)))}) = ${f2(r.fp.sigma)}\\ \\text{kPa},\\qquad \\tau_f = R\\cos\\varphi' = ${f2(r.fp.tau)}\\ \\text{kPa}`}</Tex>
      <Md>{`**Maximum shear stress** = the radius, $\\tau_{max} = R = ${f2(r.tauMax)}$ kPa, on the planes at **45°** to the principal planes (45° to the horizontal), where $\\sigma' = C = ${f2(r.c.C)}$ kPa.`}</Md>
      {extra && (
        <>
          <Md>{`**Obliquity.** The maximum obliquity is on the failure plane, $\\tan^{-1}(\\tau_f/\\sigma'_f) = \\tan^{-1}(${f2(r.fp.tau)}/${f2(r.fp.sigma)}) = ${f2(obliquity(r.fp.sigma, r.fp.tau))}^\\circ = \\varphi'$. On the τmax plane it is $\\tan^{-1}(${f2(r.tauMax)}/${f2(r.c.C)}) = ${f2(r.tmaxObl)}^\\circ$ — smaller, which is why failure does **not** occur on the plane of maximum shear stress.`}</Md>
          <Tex block>{`FS_{\\tau_{max}} = \\frac{\\sigma'\\tan\\varphi'}{\\tau_{max}} = \\frac{${f2(r.c.C)}\\tan ${f2(r.phi)}^\\circ}{${f2(r.tauMax)}} = \\frac{${f2(strength)}}{${f2(r.tauMax)}} = ${f3(r.FS)} > 1`}</Tex>
        </>
      )}
      <Frame>
        <MohrFig
          height={270}
          circles={[{ c: r.c, color: CT, label: 'failure' }]}
          envs={[{ env: { c: 0, phi: r.phi }, color: CE, label: `τ = σ′ tan ${f2(r.phi)}°` }]}
          points={[
            ...(initial ? [{ s: s3, t: 0, color: 'var(--c-mute)', label: `initial (point circle) ${f1(s3)}`, dy: -8 }] : []),
            { s: r.fp.sigma, t: r.fp.tau, color: CE, label: `failure plane (${f1(r.fp.sigma)}, ${f1(r.fp.tau)})`, dx: -150 },
            { s: r.c.C, t: r.c.R, color: 'var(--c-load)', label: `τmax (${f1(r.c.C)}, ${f1(r.c.R)})` },
          ]}
          lines={[{ s1: r.c.C, t1: 0, s2: r.fp.sigma, t2: r.fp.tau, color: 'var(--c-mute)', dash: true }]}
        />
      </Frame>
      {initial && <Md>{`*Initial state:* before the deviator is applied σ1 = σ3 = ${f2(s3)} kPa (isotropic), so the "circle" is a point at ${f2(s3)} kPa on the σ-axis; it grows to the right as the axial stress increases until it touches the envelope.`}</Md>}
    </Sol>
  )
}

// ---------------------------------------------------------------- one CU test on NC clay (2015-16 Q2, 2007-08 Q4(b))
export function ncCu(s3: number, dev: number, u: number) {
  const tot = circle(s3 + dev, s3)
  const eff = circle(s3 + dev - u, s3 - u)
  return { tot, eff, phiE: phiFromCircle(s3 - u, dev), phiT: phiFromCircle(s3, dev), cu: dev / 2, Af: u / dev }
}
export function NcCuPlot({ s3, dev, u, phiU0 }: { s3: number; dev: number; u: number; phiU0?: boolean }) {
  const r = ncCu(s3, dev, u)
  return (
    <MohrPlot
      total={[r.tot]}
      eff={[r.eff]}
      envT={phiU0 ? undefined : { c: 0, phi: r.phiT }}
      envE={{ c: 0, phi: r.phiE }}
      extra={phiU0 ? [{ env: { c: r.cu, phi: 0 }, color: CT, label: `φu = 0: τ = cu = ${f1(r.cu)} kPa` }] : undefined}
    />
  )
}

// ---------------------------------------------------------------- Culmann / trial wedge (flagged)
export function CulmannCurve({ H, gamma, phi, delta = 0, state }: { H: number; gamma: number; phi: number; delta?: number; state: 'active' | 'passive' }) {
  const tw = trialWedge({ H, gamma, phi, delta, state, step: 0.25 })
  const pts = tw.curve
  const W = 520,
    Hh = 250,
    L = 50,
    B = 32,
    T = 14,
    R = 14
  const r0 = pts[0].rho,
    r1 = pts[pts.length - 1].rho
  const show = state === 'passive' ? pts.filter((p) => p.P <= tw.P * 3) : pts
  const pMax = Math.max(...show.map((p) => p.P)) * 1.08
  const X = (r: number) => L + ((r - r0) / (r1 - r0)) * (W - L - R)
  const Y = (P: number) => Hh - B - (P / pMax) * (Hh - B - T)
  const xt: number[] = []
  for (let a = Math.ceil(r0 / 10) * 10; a <= r1; a += 10) xt.push(a)
  const step = [10, 20, 25, 50, 100, 200, 250, 500, 1000].find((s) => pMax / s <= 6) ?? 1000
  const yt: number[] = []
  for (let v = 0; v <= pMax; v += step) yt.push(v)
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full" style={{ maxWidth: W }} role="img" aria-label="Culmann (trial-wedge) curve">
      {yt.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="var(--c-line)" strokeWidth={0.5} />
          <text x={L - 4} y={Y(v) + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
            {v}
          </text>
        </g>
      ))}
      {xt.map((a) => (
        <text key={a} x={X(a)} y={Hh - B + 13} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
          {a}°
        </text>
      ))}
      <line x1={L} x2={W - R} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" />
      <line x1={L} x2={L} y1={T} y2={Y(0)} stroke="var(--c-ink)" />
      <text x={(L + W) / 2} y={Hh - 4} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
        trial plane angle ρ from the horizontal
      </text>
      <text x={L + 4} y={T + 8} fontSize={10} fill="var(--c-ink)">
        P on the wall (kN/m)
      </text>
      <polyline points={show.map((p) => `${X(p.rho).toFixed(1)},${Y(Math.min(p.P, pMax)).toFixed(1)}`).join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
      <line x1={X(tw.rho)} x2={X(tw.rho)} y1={Y(0)} y2={Y(tw.P)} stroke="var(--c-load)" strokeDasharray="4 3" />
      <circle cx={X(tw.rho)} cy={Y(tw.P)} r={4} fill="var(--c-load)" />
      <text x={X(tw.rho) + 6} y={Y(tw.P) - 6} fontSize={10} fill="var(--c-load)">
        {state === 'active' ? 'max' : 'min'}: P = {f1(tw.P)} at ρ = {f1(tw.rho)}°
      </text>
    </svg>
  )
}
export function culmann(H: number, gamma: number, phi: number, delta: number, state: 'active' | 'passive') {
  const tw = trialWedge({ H, gamma, phi, delta, state, step: 0.05 })
  const co = coulomb(phi, delta)
  const K = state === 'active' ? co.ka : co.kp
  const Pc = 0.5 * gamma * H * H * K
  const Kr = state === 'active' ? Ka(phi) : Kp(phi)
  return { tw, K, Pc, Kr, Pr: 0.5 * gamma * H * H * Kr }
}
export function culmannChecks(H: number, gamma: number, phi: number, delta: number, state: 'active' | 'passive'): Check[] {
  const r = culmann(H, gamma, phi, delta, state)
  const a = state === 'active'
  return [
    { key: 'rho', label: `Critical (${a ? 'maximum' : 'minimum'}) trial plane ρ from the horizontal`, value: r.tw.rho, unit: '°', tol: 0.02 },
    { key: 'P', label: `${a ? 'Active' : 'Passive'} thrust by the wedge (Culmann) method`, value: r.tw.P, unit: 'kN/m', tol: 0.02 },
    { key: 'K', label: `Coulomb $K_${a ? 'a' : 'p'}$${delta ? ` (δ = ${delta}°)` : ''}`, value: r.K, tol: 0.01 },
    { key: 'Pc', label: `Coulomb ${a ? 'Pa' : 'Pp'} = ½γH²K`, value: r.Pc, unit: 'kN/m', tol: 0.01 },
  ]
}
export function CulmannSolution({ H, gamma, phi, delta = 0, state, compare }: { H: number; gamma: number; phi: number; delta?: number; state: 'active' | 'passive'; compare: 'rankine' | 'coulomb' }) {
  const r = culmann(H, gamma, phi, delta, state)
  const a = state === 'active'
  const sg = a ? '-' : '+'
  return (
    <Sol>
      <Md>{`**Culmann's construction** (graphical form of Coulomb's trial wedge): from the heel draw the **φ-line** at φ = ${f2(phi)}° to the horizontal${a ? '' : ' (below the horizontal for the passive case)'} and the **pressure line** at ψ = 90° − δ${delta ? ` = ${f2(90 - delta)}°` : ' = 90°'} to the φ-line. For trial planes through the heel at angles ρ, lay off each wedge weight W along the φ-line and draw a line parallel to the pressure line to the trial plane; the curve through those points is the Culmann line. The ${a ? 'largest' : 'smallest'} ordinate (parallel to the pressure line) is ${a ? '$P_a$' : '$P_p$'}.`}</Md>
      <Md>{`The same search done numerically (vertical wall, level fill, wedge of height H = ${f2(H)} m with its top at x = H cot ρ):`}</Md>
      <Tex block>{`W(\\rho) = \\tfrac12\\gamma H^2\\cot\\rho,\\qquad P(\\rho) = W\\,\\frac{\\sin(\\rho ${sg} \\varphi)}{\\cos(\\rho ${sg} \\varphi ${sg} \\delta)}`}</Tex>
      <Frame>
        <CulmannCurve H={H} gamma={gamma} phi={phi} delta={delta} state={state} />
      </Frame>
      <Tbl
        head={['ρ (°)', 'W (kN/m)', 'P (kN/m)']}
        rows={[-10, -5, 0, 5, 10].map((d) => {
          const rho = r.tw.rho + d
          const x = H / Math.tan(rad(rho))
          const W = 0.5 * gamma * H * x
          const P = a ? (W * Math.sin(rad(rho - phi))) / Math.cos(rad(rho - phi - delta)) : (W * Math.sin(rad(rho + phi))) / Math.cos(rad(rho + phi + delta))
          return [f1(rho), f2(W), f2(P)]
        })}
        cap={`A few trial wedges around the critical one (ρ = ${f2(r.tw.rho)}°${a ? `; theory 45 + φ/2 = ${f2(45 + phi / 2)}° when δ = 0` : `; theory 45 − φ/2 = ${f2(45 - phi / 2)}° when δ = 0`}).`}
      />
      <Result>{`Culmann (trial wedge): **${a ? 'Pa' : 'Pp'} = ${f1(r.tw.P)} kN/m** on the critical plane at ρ = ${f1(r.tw.rho)}°${delta ? `, inclined at δ = ${f2(delta)}° to the wall normal (horizontal ${f1(r.tw.Ph)}, vertical ${f1(r.tw.Pv)} kN/m)` : ', horizontal (smooth wall)'}, acting H/3 = ${f2(H / 3)} m above the base.`}</Result>
      <Head>Comparison</Head>
      {compare === 'rankine' ? (
        <Tex block>{`\\text{Rankine: } K_a = \\tan^2(45 - ${f2(phi / 2)}) = ${f4(r.Kr)},\\quad P_a = \\tfrac12(${f2(gamma)})(${f2(H)})^2(${f4(r.Kr)}) = ${f2(r.Pr)}\\ \\text{kN/m}`}</Tex>
      ) : (
        <Tex block>{`\\text{Coulomb } (\\delta = ${f2(delta)}^\\circ,\\ \\text{vertical back, level fill}): K = ${f4(r.K)},\\quad P = \\tfrac12(${f2(gamma)})(${f2(H)})^2(${f4(r.K)}) = ${f2(r.Pc)}\\ \\text{kN/m}`}</Tex>
      )}
      <Md>{
        delta
          ? `Coulomb's formula gives ${f1(r.Pc)} kN/m — the same as the Culmann construction (Culmann *is* Coulomb's wedge done graphically). Rankine (δ = 0) would give ${f1(r.Pr)} kN/m${a ? ' horizontal' : ''}.`
          : `With a smooth vertical wall and a level backfill the critical wedge is at 45 ${a ? '+' : '−'} φ/2 and the wedge method reproduces ${compare === 'rankine' ? "Rankine's" : "Coulomb's (= Rankine's)"} value exactly: ${f1(r.tw.P)} vs ${f1(compare === 'rankine' ? r.Pr : r.Pc)} kN/m. A drawn construction lands within a few per cent.`
      }</Md>
    </Sol>
  )
}

// ---------------------------------------------------------------- lateral pressure from surcharge loads (flagged)
/** σh(z) profiles on a wall face, z down from the top */
export function ProfilePlot({ H, curves, width = 460, height = 300, step }: { H: number; curves: { f: (z: number) => number; color: string; label: string; dash?: boolean }[]; width?: number; height?: number; step?: number }) {
  const L = 70,
    T = 22,
    B = 26,
    R = 20
  const N = 120
  const data = curves.map((c) => Array.from({ length: N + 1 }, (_, i) => ({ z: (i * H) / N, s: c.f((i * H) / N) })))
  const smax = Math.max(1, ...data.flat().map((p) => p.s)) * 1.1
  const X = (s: number) => L + (s / smax) * (width - L - R)
  const Y = (z: number) => T + (z / H) * (height - T - B)
  const sStep = step ?? ([1, 2, 5, 10, 20, 25, 50, 100].find((v) => smax / v <= 6) ?? 100)
  const xt: number[] = []
  for (let v = 0; v <= smax; v += sStep) xt.push(v)
  const zStep = H <= 4 ? 0.5 : H <= 8 ? 1 : 1.5
  const zt: number[] = []
  for (let z = 0; z <= H + 1e-9; z += zStep) zt.push(+z.toFixed(2))
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxWidth: width }} role="img" aria-label="lateral pressure on the wall">
      <rect x={L - 16} y={T} width={14} height={height - T - B} fill="var(--c-line)" stroke="var(--c-ink)" />
      <text x={L - 22} y={T - 8} fontSize={9.5} fill="var(--c-mute)" textAnchor="end">
        wall
      </text>
      {xt.map((v) => (
        <g key={v}>
          <line x1={X(v)} x2={X(v)} y1={T} y2={height - B} stroke="var(--c-line)" strokeWidth={0.5} />
          <text x={X(v)} y={T - 6} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
            {v}
          </text>
        </g>
      ))}
      {zt.map((z) => (
        <text key={z} x={L - 20} y={Y(z) + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
          {z}
        </text>
      ))}
      <line x1={L} x2={L} y1={T} y2={height - B} stroke="var(--c-ink)" />
      <text x={width - R} y={height - 8} fontSize={10} textAnchor="end" fill="var(--c-ink)">
        σh (kPa) across the top, depth z (m) down the wall
      </text>
      {data.map((d, i) => (
        <g key={i}>
          <polygon points={`${X(0)},${Y(0)} ${d.map((p) => `${X(p.s).toFixed(1)},${Y(p.z).toFixed(1)}`).join(' ')} ${X(0)},${Y(H)}`} fill={curves[i].color} fillOpacity={i === data.length - 1 ? 0.12 : 0} stroke="none" />
          <polyline points={d.map((p) => `${X(p.s).toFixed(1)},${Y(p.z).toFixed(1)}`).join(' ')} fill="none" stroke={curves[i].color} strokeWidth={1.7} strokeDasharray={curves[i].dash ? '5 3' : undefined} />
          <line x1={width - 150} x2={width - 132} y1={T + 14 + i * 14} y2={T + 14 + i * 14} stroke={curves[i].color} strokeWidth={1.7} strokeDasharray={curves[i].dash ? '5 3' : undefined} />
          <text x={width - 128} y={T + 17 + i * 14} fontSize={9.5} fill={curves[i].color}>
            {curves[i].label}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** section through a wall with loads on the backfill surface (point / line), drawn to scale */
export function SurchargeFig({ H, loads, soil, caption, wheel }: { H: number; loads: { x: number; label: string; kind: 'point' | 'line' }[]; soil?: string[]; caption?: ReactNode; wheel?: boolean }) {
  const xmax = Math.max(H * 0.9, ...loads.map((l) => l.x)) + 1.5
  const k = Math.min(300 / xmax, 220 / H)
  const x0 = 90,
    y0 = 50
  const X = (x: number) => x0 + x * k
  const Y = (z: number) => y0 + z * k
  const W = X(xmax) + 30
  const Hh = Y(H) + 40
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full" style={{ maxWidth: W }} role="img" aria-label="wall with surface loads">
        <rect x={X(0)} y={Y(0)} width={X(xmax) - X(0)} height={Y(H) - Y(0)} fill="var(--c-soil)" opacity={0.55} />
        <rect x={X(0) - 18} y={Y(0) - 4} width={18} height={Y(H) - Y(0) + 14} fill="var(--c-line)" stroke="var(--c-ink)" />
        <line x1={X(0)} x2={X(xmax)} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" strokeWidth={1.4} />
        <line x1={X(0) - 18} x2={X(0) - 18} y1={Y(0) - 4} y2={Y(H) + 10} stroke="var(--c-ink)" />
        {/* height */}
        <g stroke="var(--c-mute)" fill="var(--c-mute)">
          <line x1={X(0) - 40} x2={X(0) - 40} y1={Y(0)} y2={Y(H)} />
          <line x1={X(0) - 46} x2={X(0) - 34} y1={Y(0)} y2={Y(0)} />
          <line x1={X(0) - 46} x2={X(0) - 34} y1={Y(H)} y2={Y(H)} />
          <text x={X(0) - 46} y={(Y(0) + Y(H)) / 2 + 4} fontSize={11} textAnchor="end" stroke="none">
            H = {H} m
          </text>
        </g>
        {loads.map((l, i) => (
          <g key={i}>
            {wheel && l.kind === 'point' && <circle cx={X(l.x)} cy={Y(0) - 32} r={9} fill="none" stroke="var(--c-load)" strokeWidth={2} />}
            <line x1={X(l.x)} x2={X(l.x)} y1={Y(0) - (wheel ? 22 : 36)} y2={Y(0) - 7} stroke="var(--c-load)" strokeWidth={2.2} />
            <polygon points={`${X(l.x) - 5},${Y(0) - 9} ${X(l.x) + 5},${Y(0) - 9} ${X(l.x)},${Y(0)}`} fill="var(--c-load)" />
            {l.kind === 'line' && <circle cx={X(l.x)} cy={Y(0) - 40} r={4} fill="none" stroke="var(--c-load)" />}
            <text x={X(l.x) + 7} y={Y(0) - 26 - (i % 2) * 14} fontSize={10.5} fill="var(--c-load)">
              {l.label}
            </text>
            <g stroke="var(--c-mute)" fill="var(--c-mute)">
              <line x1={X(i ? loads[i - 1].x : 0)} x2={X(l.x)} y1={Y(H) + 18} y2={Y(H) + 18} />
              <line x1={X(l.x)} x2={X(l.x)} y1={Y(H) + 12} y2={Y(H) + 24} />
              <line x1={X(i ? loads[i - 1].x : 0)} x2={X(i ? loads[i - 1].x : 0)} y1={Y(H) + 12} y2={Y(H) + 24} />
              <text x={(X(i ? loads[i - 1].x : 0) + X(l.x)) / 2} y={Y(H) + 34} fontSize={10} textAnchor="middle" stroke="none">
                {f2(l.x - (i ? loads[i - 1].x : 0))} m
              </text>
            </g>
          </g>
        ))}
        {soil?.map((s, i) => (
          <text key={i} x={X(xmax) - 6} y={Y(H) - 12 - (soil.length - 1 - i) * 14} fontSize={10.5} textAnchor="end" fill="var(--c-ink)">
            {s}
          </text>
        ))}
      </svg>
      {caption && <figcaption className="text-xs text-mute text-center mt-1">{caption}</figcaption>}
    </figure>
  )
}

// ---------------------------------------------------------------- Rankine with a sloping backfill (flagged)
export function SlopingSolution({ H, gamma, phi, beta }: { H: number; gamma: number; phi: number; beta: number }) {
  const s = rankineSloping(phi, beta)
  const Pa = 0.5 * gamma * H * H * s.ka
  const cb = Math.cos(rad(beta))
  return (
    <div className="space-y-2">
      <Md>{`Rankine, backfill sloping at β = ${f2(beta)}°, c = 0 (Das eq. 13.21): the pressure acts **parallel to the backfill surface**.`}</Md>
      <Tex block>{`K_a = \\cos\\beta\\,\\frac{\\cos\\beta - \\sqrt{\\cos^2\\beta - \\cos^2\\varphi}}{\\cos\\beta + \\sqrt{\\cos^2\\beta - \\cos^2\\varphi}} = ${f4(cb)}\\,\\frac{${f4(cb)} - \\sqrt{${f4(cb * cb)} - ${f4(Math.cos(rad(phi)) ** 2)}}}{${f4(cb)} + \\sqrt{${f4(cb * cb)} - ${f4(Math.cos(rad(phi)) ** 2)}}} = ${f4(s.ka)}`}</Tex>
      <Tex block>{`P_a = \\tfrac12\\gamma H^2K_a = \\tfrac12(${f2(gamma)})(${f2(H)})^2(${f4(s.ka)}) = ${f2(Pa)}\\ \\text{kN/m at } ${f2(beta)}^\\circ \\text{ to the horizontal},\\ \\tfrac{H}{3} = ${f2(H / 3)}\\ \\text{m above the base}`}</Tex>
      <Tex block>{`P_h = P_a\\cos\\beta = ${f2(Pa)}\\times${f4(cb)} = ${f2(Pa * cb)}\\ \\text{kN/m},\\qquad P_v = P_a\\sin\\beta = ${f2(Pa * Math.sin(rad(beta)))}\\ \\text{kN/m}`}</Tex>
      <Md>{`(Level backfill for comparison: $K_a = ${f4(Ka(phi))}$, $P_a = ${f2(0.5 * gamma * H * H * Ka(phi))}$ kN/m — the slope adds about ${f1((100 * (Pa * cb)) / (0.5 * gamma * H * H * Ka(phi)) - 100)} % to the horizontal thrust.)`}</Md>
    </div>
  )
}
export function slopingChecks(H: number, gamma: number, phi: number, beta: number): Check[] {
  const s = rankineSloping(phi, beta)
  const Pa = 0.5 * gamma * H * H * s.ka
  return [
    { key: 'ka', label: '$K_a$ for the sloping backfill', value: s.ka, tol: 0.01 },
    { key: 'pa', label: 'Active thrust $P_a$ (parallel to the slope)', value: Pa, unit: 'kN/m' },
    { key: 'ph', label: 'Horizontal thrust $P_a\\cos\\beta$', value: Pa * Math.cos(rad(beta)), unit: 'kN/m' },
  ]
}

// ---------------------------------------------------------------- critical height of a vertical cut in clay (flagged)
export function cutNumbers(cu: number, gamma: number) {
  return { zc: crackDepth(cu, gamma, 0), Hc: criticalHeight(cu, gamma, 0), Ht: (2.67 * cu) / gamma }
}

// ---------------------------------------------------------------- figures
/** cantilever sheet pile with a sloping backfill (2009-10 Q4(b), Fig. 1) */
export function SheetPileFig({ H, D, beta, soil }: { H: number; D: number; beta: number; soil: string[] }) {
  const k = 26
  const x0 = 200,
    y0 = 60
  const Y = (z: number) => y0 + z * k
  const xr = x0 + 9 * k
  const tb = Math.tan(rad(beta))
  return (
    <svg viewBox="0 0 470 360" className="w-full" style={{ maxWidth: 470 }} role="img" aria-label="sheet pile wall with sloping backfill">
      {/* backfill */}
      <polygon points={`${x0},${Y(0)} ${xr},${Y(0) - (xr - x0) * tb} ${xr},${Y(H + D) + 20} ${x0},${Y(H + D) + 20}`} fill="var(--c-soil)" opacity={0.55} />
      <line x1={x0} y1={Y(0)} x2={xr} y2={Y(0) - (xr - x0) * tb} stroke="var(--c-ink)" strokeWidth={1.4} />
      {/* front soil */}
      <rect x={20} y={Y(H)} width={x0 - 20} height={D * k + 20} fill="var(--c-soil)" opacity={0.55} />
      <line x1={20} x2={x0} y1={Y(H)} y2={Y(H)} stroke="var(--c-ink)" strokeWidth={1.4} />
      {/* pile */}
      <rect x={x0 - 4} y={Y(0) - 6} width={8} height={(H + D) * k + 6} fill="var(--c-ink)" />
      {/* slope angle */}
      <path d={`M${x0 + 60},${Y(0)} A60,60 0 0 0 ${x0 + 60 * Math.cos(rad(beta))},${Y(0) - 60 * Math.sin(rad(beta))}`} fill="none" stroke="var(--c-accent)" />
      <line x1={x0} x2={x0 + 80} y1={Y(0)} y2={Y(0)} stroke="var(--c-mute)" strokeDasharray="3 3" />
      <text x={x0 + 66} y={Y(0) - 6} fontSize={11} fill="var(--c-accent)">
        β = {beta}°
      </text>
      <text x={xr - 4} y={Y(0) - (xr - x0) * tb - 8} fontSize={10.5} textAnchor="end" fill="var(--c-ink)">
        backfill surface
      </text>
      <text x={24} y={Y(H) - 6} fontSize={10.5} fill="var(--c-ink)">
        front-side ground surface
      </text>
      {/* dims */}
      <g stroke="var(--c-mute)" fill="var(--c-mute)">
        <line x1={x0 - 30} x2={x0 - 30} y1={Y(0)} y2={Y(H)} />
        <line x1={x0 - 36} x2={x0 - 24} y1={Y(0)} y2={Y(0)} />
        <line x1={x0 - 36} x2={x0 - 24} y1={Y(H)} y2={Y(H)} />
        <text x={x0 - 36} y={(Y(0) + Y(H)) / 2} fontSize={11} textAnchor="end" stroke="none">
          {H} m
        </text>
        <line x1={x0 - 30} x2={x0 - 30} y1={Y(H)} y2={Y(H + D)} />
        <line x1={x0 - 36} x2={x0 - 24} y1={Y(H + D)} y2={Y(H + D)} />
        <text x={x0 - 36} y={(Y(H) + Y(H + D)) / 2 + 4} fontSize={12} textAnchor="end" stroke="none" fontStyle="italic">
          D = ?
        </text>
      </g>
      {soil.map((s, i) => (
        <text key={i} x={xr - 6} y={Y(H) + 10 + i * 15} fontSize={11} textAnchor="end" fill="var(--c-ink)">
          {s}
        </text>
      ))}
      <text x={x0 + 10} y={Y(H + D) - 4} fontSize={10} fill="var(--c-mute)">
        sheet pile
      </text>
    </svg>
  )
}

/** plan: two column loads behind a wall (2007-08 Q4(a)) */
export function TwoColumnPlan({ x, s }: { x: number; s: number }) {
  const k = 26
  const x0 = 40,
    y0 = 30
  const Yc1 = y0 + 30,
    Yc2 = Yc1 + s * k
  const Ym = (Yc1 + Yc2) / 2
  return (
    <svg viewBox={`0 0 360 ${Yc2 + 60}`} className="w-full" style={{ maxWidth: 360 }} role="img" aria-label="plan of the columns behind the wall">
      <rect x={x0} y={y0} width={10} height={Yc2 - y0 + 30} fill="var(--c-line)" stroke="var(--c-ink)" />
      <text x={x0 - 4} y={y0 - 8} fontSize={10} fill="var(--c-mute)">
        wall (plan)
      </text>
      {[Yc1, Yc2].map((y, i) => (
        <g key={i}>
          <rect x={x0 + 10 + x * k - 7} y={y - 7} width={14} height={14} fill="var(--c-load)" />
          <text x={x0 + 10 + x * k + 12} y={y + 4} fontSize={10.5} fill="var(--c-load)">
            Q = 200 kN
          </text>
          <line x1={x0 + 10} x2={x0 + 10 + x * k} y1={y} y2={y} stroke="var(--c-mute)" strokeDasharray="3 3" />
        </g>
      ))}
      <line x1={x0 + 10} x2={x0 + 10 + x * k} y1={Ym} y2={Yc1} stroke="var(--c-accent)" />
      <line x1={x0 + 10} x2={x0 + 10 + x * k} y1={Ym} y2={Yc2} stroke="var(--c-accent)" />
      <circle cx={x0 + 10} cy={Ym} r={3.5} fill="var(--c-accent)" />
      <text x={x0 + 18} y={Ym + 4} fontSize={10} fill="var(--c-accent)">
        section midway (α each)
      </text>
      <text x={x0 + 10 + (x * k) / 2} y={Yc1 - 6} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        {x} m
      </text>
      <g stroke="var(--c-mute)" fill="var(--c-mute)">
        <line x1={x0 + 10 + x * k + 110} x2={x0 + 10 + x * k + 110} y1={Yc1} y2={Yc2} />
        <text x={x0 + 10 + x * k + 104} y={Ym + 4} fontSize={10.5} textAnchor="end" stroke="none">
          {s} m
        </text>
      </g>
    </svg>
  )
}
