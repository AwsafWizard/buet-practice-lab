// Shared pieces for AJK sir's half of the CE 341 past papers: solution wrappers, theory model answers
// borrowed from the topic modules, wall / Mohr / direct-shear / classification renderers. Every number comes
// from the engines in src/soil/engine.
import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Md, Tex } from '../../../components/ui'
import { aashto, type AashtoIn, uscs, type UscsIn } from '../../engine/classify'
import { crackForces, solveWall, type Wall, type WallResult } from '../../engine/earth'
import { failurePlane, type Circle, type Envelope } from '../../engine/mohr'
import { betaOCR, circleArea, cuOC, directShear, fitCircles, phiFromCircle, triaxCircles, ufFromEnvelope, type TriaxTest } from '../../engine/shear'
import { GW } from '../../engine/units'
import { BetaChart } from '../../reference/str'
import { AashtoGrid, UscsPath } from '../../topics/class/figs'
import { CLASS_THEORY } from '../../topics/class/theory'
import { WallFig } from '../../topics/lep/figs'
import { WallSolution } from '../../topics/lep/Solution'
import { LEP_THEORY } from '../../topics/lep/theory'
import { PLAST_THEORY } from '../../topics/plast/theory'
import { MohrFig, TauSigmaFig } from '../../topics/shear/figs'
import { SHEAR_THEORY } from '../../topics/shear/theory'
import { STRUCT_THEORY } from '../../topics/struct/theory'
import { WV_THEORY } from '../../topics/wv/theory'
import type { Check, SmTheoryItem } from '../../types'

export const f1 = (v: number) => fmt(v, 1)
export const f2 = (v: number) => fmt(v, 2)
export const f3 = (v: number) => fmt(v, 3)
export const f4 = (v: number) => fmt(v, 4)

// ---------------------------------------------------------------- wrappers
export function Sol({ children }: { children: ReactNode }) {
  return <div className="space-y-3 text-sm">{children}</div>
}
export function Result({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-accent/40 bg-accent/5 px-3 py-2">
      <Md>{children}</Md>
    </div>
  )
}
export function Head({ children }: { children: ReactNode }) {
  return <div className="text-xs font-bold uppercase tracking-wider text-faint pt-1">{children}</div>
}
export function Note({ children }: { children: string }) {
  return (
    <div className="text-xs text-mute rounded-lg bg-load/10 px-2 py-1.5">
      <Md>{children}</Md>
    </div>
  )
}
/** simple data table */
export function Tbl({ head, rows, cap }: { head: ReactNode[]; rows: ReactNode[][]; cap?: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="tbl w-auto text-sm">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j === 0 ? 'txt' : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {cap && <div className="text-[11px] text-faint mt-1">{cap}</div>}
    </div>
  )
}

// ---------------------------------------------------------------- theory model answers
const ALL_THEORY: SmTheoryItem[] = [...WV_THEORY, ...PLAST_THEORY, ...CLASS_THEORY, ...STRUCT_THEORY, ...SHEAR_THEORY, ...LEP_THEORY]
/** a topic theory item by topic and id (throws at render if it was renamed, so the card shows the boundary) */
export function th(topic: string, id: string): SmTheoryItem {
  const t = ALL_THEORY.find((x) => x.topic === topic && x.id === id)
  if (!t) throw new Error(`theory item ${topic}/${id} not found`)
  return t
}
/** a full-mark model answer: optional lead-in, the topic's answer (or our own markdown), its sketch, a tail */
export function Model({ md, item, pre, post, fig, noFig }: { md?: string; item?: SmTheoryItem; pre?: string; post?: string; fig?: ReactNode; noFig?: boolean }) {
  const Fig = !noFig ? item?.Fig : undefined
  return (
    <Sol>
      {pre && <Md>{pre}</Md>}
      {item && <Md>{item.a}</Md>}
      {md && <Md>{md}</Md>}
      {Fig && (
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <Fig />
        </div>
      )}
      {fig && <div className="rounded-xl bg-bg/60 border border-line p-2">{fig}</div>}
      {post && <Md>{post}</Md>}
    </Sol>
  )
}
/** answers drawn from several topic items, each under its own heading */
export function Models({ parts }: { parts: { title: string; item?: SmTheoryItem; md?: string; fig?: ReactNode; noFig?: boolean }[] }) {
  return (
    <Sol>
      {parts.map((p, i) => {
        const Fig = !p.noFig ? p.item?.Fig : undefined
        return (
          <div key={i} className="space-y-2">
            <Head>{p.title}</Head>
            {p.md && <Md>{p.md}</Md>}
            {p.item && <Md>{p.item.a}</Md>}
            {Fig && (
              <div className="rounded-xl bg-bg/60 border border-line p-2">
                <Fig />
              </div>
            )}
            {p.fig && <div className="rounded-xl bg-bg/60 border border-line p-2">{p.fig}</div>}
          </div>
        )
      })}
    </Sol>
  )
}

/** True / False set: each statement with its answer and a one-line reason */
export function TrueFalse({ items }: { items: { s: string; a: boolean; why: string }[] }) {
  return (
    <ol className="list-[upper-roman] pl-6 space-y-1 text-sm">
      {items.map((x, i) => (
        <li key={i}>
          <span className="text-mute">{x.s}</span> → <b className={x.a ? 'text-good' : 'text-bad'}>{x.a ? 'True' : 'False'}</b>. <Md className="inline [&>p]:inline">{x.why}</Md>
        </li>
      ))}
    </ol>
  )
}

// ---------------------------------------------------------------- retaining walls (solveWall + the lep renderers)
export function WallQFig({ w }: { w: Wall }) {
  return (
    <div className="max-w-[480px] mx-auto">
      <WallFig w={w} r={null} showDiagrams={false} width={460} />
    </div>
  )
}
export function WallSolved({ w, r, lead, tail }: { w: Wall; r?: WallResult; lead?: string; tail?: string }) {
  const res = r ?? solveWall(w)
  return (
    <Sol>
      {lead && <Md>{lead}</Md>}
      <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto">
        <div className="min-w-[640px]">
          <WallFig w={w} r={res} />
        </div>
      </div>
      <WallSolution w={w} r={res} />
      {tail && <Md>{tail}</Md>}
    </Sol>
  )
}
/** K, every pressure ordinate, crack, force, arm and moment */
export function wallChecks(w: Wall, o: { ords?: boolean; before?: boolean; moment?: boolean } = {}): Check[] {
  const r = solveWall(w)
  const kn = w.state === 'rest' ? 'K_0' : w.state === 'active' ? 'K_a' : 'K_p'
  const out: Check[] = r.K.map((K, i) => ({ key: `K${i}`, label: `$${kn}$${w.layers.length > 1 ? ` (layer ${i + 1})` : ''}`, value: K, tol: 0.01 }))
  if (o.ords !== false)
    r.ords.forEach((x, i) => {
      if (i === 0 && Math.abs(x.earth) < 1e-9) return
      const dup = r.ords.filter((y) => Math.abs(y.z - x.z) < 1e-9).length > 1
      out.push({ key: `o${i}`, label: `${w.layers.some((l) => l.total) ? 'σh' : 'σ′h'} at ${f2(x.z)} m${dup ? (x.at === 'bot' ? ' (just above)' : ' (just below)') : ''}`, value: x.earth, unit: 'kPa', tol: 0.02 })
    })
  const last = r.ords[r.ords.length - 1]
  if (last.water > 0) out.push({ key: 'u', label: 'Water pressure at the base', value: last.water, unit: 'kPa' })
  if (r.zc !== null) out.push({ key: 'zc', label: 'Tension-crack depth $z_c$', value: r.zc, unit: 'm' })
  if (o.before && r.tension.length) out.push({ key: 'fb', label: 'Force before the crack', value: r.Fbefore, unit: 'kN/m' })
  out.push({ key: 'F', label: w.state === 'passive' ? 'Total passive force $P_p$' : r.tension.length ? 'Total force after the crack' : 'Total force per metre', value: r.Fs, unit: 'kN/m' })
  out.push({ key: 'zb', label: 'Resultant above the base', value: r.zbar, unit: 'm' })
  if (o.moment) out.push({ key: 'M', label: 'Moment about the base (toe level)', value: r.MOT, unit: 'kN·m/m' })
  return out
}

// ---------------------------------------------------------------- Mohr circles
export const CT = 'var(--c-accent)'
export const CE = 'var(--c-accent2)'

/** total (solid) and effective (dashed) circles with their envelopes */
export function MohrPlot({ total = [], eff = [], envT, envE, height = 280, extra }: { total?: Circle[]; eff?: Circle[]; envT?: Envelope; envE?: Envelope; height?: number; extra?: { env: Envelope; color: string; label: string; dash?: boolean }[] }) {
  return (
    <div className="rounded-xl bg-bg/60 border border-line p-2">
      <MohrFig
        height={height}
        circles={[...total.map((c, i) => ({ c, color: CT, label: total.length > 1 ? `${i + 1}` : undefined })), ...eff.map((c, i) => ({ c, color: CE, dash: true, label: eff.length > 1 ? `${i + 1}′` : undefined }))]}
        envs={[
          ...(envT ? [{ env: envT, color: CT, label: `total: c = ${f2(envT.c)}, φ = ${f2(envT.phi)}°` }] : []),
          ...(envE ? [{ env: envE, color: CE, dash: true, label: `effective: c′ = ${f2(envE.c)}, φ′ = ${f2(envE.phi)}°` }] : []),
          ...(extra ?? []),
        ]}
      />
    </div>
  )
}

/** the circle table of a triaxial series */
export function TriaxTable({ tests }: { tests: TriaxTest[] }) {
  const tc = triaxCircles(tests)
  const hasU = !!tc.eff
  return (
    <Tbl
      head={['Specimen', 'σ3', 'σ1 = σ3 + Δσ', 'C, R (total)', ...(hasU ? ['σ′3 = σ3 − u', 'σ′1', 'C′, R'] : [])]}
      rows={tests.map((t, i) => [
        `${i + 1}`,
        f2(t.s3),
        f2(tc.total[i].s1),
        `${f2(tc.total[i].C)}, ${f2(tc.total[i].R)}`,
        ...(hasU ? [f2(tc.eff![i].s3), f2(tc.eff![i].s1), `${f2(tc.eff![i].C)}, ${f2(tc.eff![i].R)}`] : []),
      ])}
      cap="kPa. C = (σ1 + σ3)/2 is the centre, R = (σ1 − σ3)/2 the radius."
    />
  )
}

/** how an envelope was fitted, in words + tex */
export function FitText({ cs, prime }: { cs: Circle[]; prime?: boolean }) {
  const f = fitCircles(cs)
  const p = prime ? "'" : ''
  if (f.method === 'tangent') {
    const [a, b] = cs
    return (
      <div className="space-y-1">
        <p>Two circles: the exact common tangent.</p>
        <Tex block>{`\\sin\\varphi${p} = \\frac{R_2 - R_1}{C_2 - C_1} = \\frac{${f2(b.R)} - ${f2(a.R)}}{${f2(b.C)} - ${f2(a.C)}} = ${f4(Math.sin((f.phi * Math.PI) / 180))} \\Rightarrow \\varphi${p} = ${f2(f.phi)}^\\circ`}</Tex>
        <Tex block>{`c${p} = \\frac{R_1 - C_1\\sin\\varphi${p}}{\\cos\\varphi${p}} = \\frac{${f2(a.R)} - ${f2(a.C)}(${f4(Math.sin((f.phi * Math.PI) / 180))})}{${f4(Math.cos((f.phi * Math.PI) / 180))}} = ${f2(f.c)}\\ \\text{kPa}`}</Tex>
      </div>
    )
  }
  return (
    <div className="space-y-1">
      <p>
        {cs.length} circles: least squares on the circle tops (p{p}, q) = (C, R) — the K<sub>f</sub> line q = a + p tan α — then sin φ{p} = tan α and c{p} = a/cos φ{p}.
      </p>
      <Tex block>{`q = ${f2(f.a)} + p\\,(${f4(Math.tan((f.alpha * Math.PI) / 180))}) \\Rightarrow \\alpha = ${f2(f.alpha)}^\\circ,\\ \\varphi${p} = \\sin^{-1}(\\tan\\alpha) = ${f2(f.phi)}^\\circ,\\ c${p} = \\frac{${f2(f.a)}}{\\cos ${f2(f.phi)}^\\circ} = ${f2(f.c)}\\ \\text{kPa}`}</Tex>
    </div>
  )
}

/** failure-plane stresses of a circle tangent to an envelope */
export function planeTex(c: Circle, phi: number, prime = true) {
  const fp = failurePlane(c, phi)
  const p = prime ? "'" : ''
  return `\\theta = 45 + \\frac{\\varphi${p}}{2} = ${f2(fp.theta)}^\\circ,\\quad \\sigma${p}_f = C - R\\sin\\varphi${p} = ${f2(c.C)} - ${f2(c.R)}\\sin ${f2(phi)}^\\circ = ${f2(fp.sigma)},\\quad \\tau_f = R\\cos\\varphi${p} = ${f2(fp.tau)}\\ \\text{kPa}`
}

// ---------------------------------------------------------------- direct shear (kg loads on 63.5 mm specimens)
export interface DSRow {
  /** normal load (kg) or force (N) */
  N: number
  /** shear force (N) */
  T: number
}
export function dsSolve(rows: DSRow[], dia: number, unit: 'kg' | 'N') {
  const A = circleArea(dia)
  return { A, ...directShear(rows.map((r) => ({ N: unit === 'kg' ? (r.N * GW) / 1000 : r.N / 1000, T: r.T / 1000 })), A) }
}
export function dsChecks(rows: DSRow[], dia: number, unit: 'kg' | 'N', prime = true): Check[] {
  const d = dsSolve(rows, dia, unit)
  const p = prime ? "'" : ''
  return [
    ...d.pts.flatMap((x, i) => [
      { key: `s${i}`, label: `σ (specimen ${i + 1})`, value: x.sigma, unit: 'kPa' },
      { key: `t${i}`, label: `τf (specimen ${i + 1})`, value: x.tau, unit: 'kPa' },
    ]),
    { key: 'phi', label: `$\\varphi${p}$`, value: d.env.phi, unit: '°', tol: 0.03 },
    { key: 'c', label: `$c${p}$`, value: d.env.c, unit: 'kPa', tol: 0.15 },
  ]
}
export function DSSolution({ rows, dia, unit, history }: { rows: DSRow[]; dia: number; unit: 'kg' | 'N'; history?: boolean }) {
  const d = dsSolve(rows, dia, unit)
  return (
    <Sol>
      <Tex block>{`A = \\frac{\\pi}{4}(${dia})^2 = ${f1(d.A * 1e6)}\\ \\text{mm}^2 = ${fmt(d.A, 6)}\\ \\text{m}^2`}</Tex>
      <Tbl
        head={['Specimen', unit === 'kg' ? 'Normal load (kg)' : 'Normal force (N)', 'N (kN)', 'Shear force (N)', 'σ = N/A (kPa)', 'τf = T/A (kPa)']}
        rows={rows.map((r, i) => [`${i + 1}`, f2(r.N), fmt(unit === 'kg' ? (r.N * GW) / 1000 : r.N / 1000, 4), f2(r.T), f2(d.pts[i].sigma), f2(d.pts[i].tau)])}
        cap={unit === 'kg' ? 'kg × 9.81 = N; 1 kN/m² = 1 kPa.' : undefined}
      />
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <TauSigmaFig pts={d.pts} env={d.env} />
      </div>
      <p>
        Best straight line through the three points (least squares, as the slides' trend line): τf = {f2(d.fit.a)} + {f4(d.fit.b)}σ → <b>φ′ = tan⁻¹({f4(d.fit.b)}) = {f2(d.env.phi)}°</b>, <b>c′ = {f2(d.env.c)} kPa</b> (r² = {f4(d.fit.r2)}).
        A hand-drawn line on graph paper should land within about ±1° and ±3 kPa.
      </p>
      <Tex block>{`\\tau_f = ${f2(d.env.c)} + \\sigma'\\tan ${f2(d.env.phi)}^\\circ\\ \\text{kPa}`}</Tex>
      {history && (
        <p>
          <b>Stress history:</b>{' '}
          {d.env.c < 5
            ? `the cohesion intercept is practically zero (${f2(d.env.c)} kPa), so the envelope passes through the origin: the clay behaves as normally consolidated.`
            : `there is a clear cohesion intercept c′ = ${f2(d.env.c)} kPa at these low normal stresses, which a drained test gives only for an overconsolidated clay (the NC envelope passes through the origin). The sample is overconsolidated (preconsolidation pressure above the test stresses).`}
        </p>
      )}
    </Sol>
  )
}

// ---------------------------------------------------------------- classification
export function UscsSolved({ inp, lead }: { inp: UscsIn; lead?: string }) {
  const u = uscs(inp)
  return (
    <div className="space-y-2">
      {lead && <Md>{lead}</Md>}
      <ol className="list-decimal pl-5 space-y-0.5">
        {u.steps.map((s, i) => (
          <li key={i}>
            <Md className="inline [&>p]:inline">{s.text}</Md>
          </li>
        ))}
      </ol>
      <UscsPath u={u} />
      {u.nameNote && <Note>{u.nameNote}</Note>}
      {u.flags.length > 0 && <Note>{u.flags.join(' ')}</Note>}
    </div>
  )
}
export function AashtoSolved({ inp, lead }: { inp: AashtoIn; lead?: string }) {
  const a = aashto(inp)
  return (
    <div className="space-y-2">
      {lead && <Md>{lead}</Md>}
      <ol className="list-decimal pl-5 space-y-0.5">
        {a.steps.map((s, i) => (
          <li key={i}>
            <Md className="inline [&>p]:inline">{s}</Md>
          </li>
        ))}
      </ol>
      <AashtoGrid a={a} />
      <Result>{`**${a.label}** — ${a.material.toLowerCase()}; general rating as subgrade: ${a.rating.toLowerCase()}.`}</Result>
    </div>
  )
}

// ---------------------------------------------------------------- φ = 0 clay behind a smooth wall (no surcharge)
export const clayWall = (H: number, gamma: number, cu: number): Wall => ({ layers: [{ h: H, gamma, phi: 0, c: cu }], zw: null, q: 0, state: 'active' })
export function clayChecks(H: number, gamma: number, cu: number, o: { before?: boolean; after?: boolean; hc?: boolean } = {}): Check[] {
  const k = crackForces({ H, gamma, phi: 0, c: cu })
  const out: Check[] = [{ key: 'zc', label: 'Tension-crack depth $z_c = 2c_u/\\gamma$', value: k.zc, unit: 'm' }]
  if (o.hc) out.push({ key: 'hc', label: 'Unsupported height $H_c = 4c_u/\\gamma$', value: k.Hc, unit: 'm' })
  out.push({ key: 'sb', label: 'σa at the base, γH − 2cu', value: k.base, unit: 'kPa' })
  if (o.before) out.push({ key: 'pb', label: 'Active force before the crack', value: k.before, unit: 'kN/m' })
  if (o.after !== false) {
    out.push({ key: 'pa', label: 'Active force after the crack', value: k.after, unit: 'kN/m' })
    out.push({ key: 'arm', label: 'Its line of action above the base', value: k.armAfter, unit: 'm' })
  }
  return out
}
export function ClaySolution({ H, gamma, cu, hc, before }: { H: number; gamma: number; cu: number; hc?: boolean; before?: boolean }) {
  const k = crackForces({ H, gamma, phi: 0, c: cu })
  const w = clayWall(H, gamma, cu)
  return (
    <Sol>
      <Md>{`Undrained (φ = 0): $K_a = \\tan^2 45° = 1$, so $\\sigma_a = \\gamma z - 2c_u$ (total stress).`}</Md>
      <Tex block>{`\\sigma_a(0) = -2c_u = -${f2(2 * cu)}\\ \\text{kPa},\\qquad \\sigma_a(H) = ${f2(gamma)}(${f2(H)}) - 2(${f2(cu)}) = ${f2(k.base)}\\ \\text{kPa}`}</Tex>
      <Tex block>{`z_c = \\frac{2c_u}{\\gamma} = \\frac{2(${f2(cu)})}{${f2(gamma)}} = ${f2(k.zc)}\\ \\text{m}`}</Tex>
      {hc && (
        <Md>{`**Unsupported height** (net thrust zero, $\\tfrac12\\gamma H_c^2 = 2c_uH_c$): $H_c = 4c_u/\\gamma = 4(${f2(cu)})/${f2(gamma)} = 2z_c$ = **${f2(k.Hc)} m**. A vertical cut in this clay stands unsupported up to this height (theoretically; with the crack Terzaghi's safer value is 2.67c/γ = ${f2((2.67 * cu) / gamma)} m).`}</Md>
      )}
      {before && <Md>{`**Before the crack** (tension zone included): $P_a = \\tfrac12\\gamma H^2 - 2c_uH = \\tfrac12(${f2(gamma)})(${f2(H)})^2 - 2(${f2(cu)})(${f2(H)})$ = **${f2(k.before)} kN/m**.`}</Md>}
      <Md>{`**After the crack** the negative zone is dropped: a triangle from $z_c$ to the base, $P_a = \\tfrac12(H - z_c)(\\gamma H - 2c_u) = \\tfrac12(${f2(H - k.zc)})(${f2(k.base)})$ = **${f2(k.after)} kN/m**, acting $(H - z_c)/3 = ${f2(k.armAfter)}$ m above the base.`}</Md>
      <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto">
        <div className="min-w-[560px]">
          <WallFig w={w} r={solveWall(w)} />
        </div>
      </div>
    </Sol>
  )
}

// ---------------------------------------------------------------- undrained strength of OC clay (β chart; not in AJK sir's slides)
export function CuOCSolution({ z, gsat, pc, LL, PL, ratio, ratioTex }: { z: number; gsat: number; pc: number; LL?: number; PL?: number; ratio: number; ratioTex: string }) {
  const r = cuOC({ z, gammaSat: gsat, pc, ratioNC: ratio })
  const up = betaOCR(r.OCR, 'upper'),
    lo = betaOCR(r.OCR, 'lower')
  return (
    <Sol>
      {LL !== undefined && PL !== undefined && <Md>{`PI = LL − PL = ${f2(LL)} − ${f2(PL)} = ${f2(LL - PL)}.`}</Md>}
      <Tex block>{`\\sigma'_0 = z(\\gamma_{sat} - \\gamma_w) = ${f2(z)}(${f2(gsat)} - ${GW}) = ${f2(r.sv)}\\ \\text{kPa},\\qquad \\text{OCR} = \\frac{p'_c}{\\sigma'_0} = \\frac{${f2(pc)}}{${f2(r.sv)}} = ${f2(r.OCR)}`}</Tex>
      <Tex block>{`\\left(\\frac{c_u}{\\sigma'_0}\\right)_{NC} = ${ratioTex} = ${f4(ratio)}\\ \\Rightarrow\\ c_{u,NC} = ${f4(ratio)}\\times${f2(r.sv)} = ${f2(r.cuNC)}\\ \\text{kPa}`}</Tex>
      <div className="rounded-xl bg-bg/60 border border-line p-2 max-w-[360px]">
        <BetaChart ocr={r.OCR} />
      </div>
      <Md>{`From the attached chart at OCR = ${f2(r.OCR)}: β ≈ **${f2(r.beta)}** on the average curve (${f2(lo)} lower limit, ${f2(up)} upper limit), where $\\beta = (c_u/\\sigma'_0)_{OC}/(c_u/\\sigma'_0)_{NC}$.`}</Md>
      <Result>{`$c_u = \\beta\\,c_{u,NC} = ${f2(r.beta)}\\times${f2(r.cuNC)} = $ **${f1(r.cu)} kPa** (band ${f1(lo * r.cuNC)}–${f1(up * r.cuNC)} kPa). Ladd's $\\text{OCR}^{0.8}$ instead of the chart gives ${f1(r.ladd)} kPa.`}</Result>
    </Sol>
  )
}
export function cuOCChecks(z: number, gsat: number, pc: number, ratio: number): Check[] {
  const r = cuOC({ z, gammaSat: gsat, pc, ratioNC: ratio })
  return [
    { key: 'sv', label: "Effective overburden $\\sigma'_0$", value: r.sv, unit: 'kPa' },
    { key: 'ocr', label: 'OCR', value: r.OCR },
    { key: 'ratio', label: '$(c_u/\\sigma\'_0)_{NC}$', value: ratio, tol: 0.01 },
    { key: 'beta', label: 'β from the chart (average curve)', value: r.beta, tol: 0.06 },
    { key: 'cu', label: 'Undrained shear strength $c_u$', value: r.cu, unit: 'kPa', tol: 0.08 },
  ]
}

// ---------------------------------------------------------------- CU and CD on identical NC specimens → φ′, φcu, Af (Skempton A flagged)
export function nccucd(s3: number, devU: number, devD: number) {
  const phiE = phiFromCircle(s3, devD)
  const phiT = phiFromCircle(s3, devU)
  const u = ufFromEnvelope(s3, devU, { c: 0, phi: phiE })
  return { phiE, phiT, ...u }
}
export function NcCuCdSolution({ s3, devU, devD }: { s3: number; devU: number; devD: number }) {
  const r = nccucd(s3, devU, devD)
  const cd = { C: s3 + devD / 2, R: devD / 2, s1: s3 + devD, s3 }
  const cuT = { C: s3 + devU / 2, R: devU / 2, s1: s3 + devU, s3 }
  const cuE = { C: r.s3p + devU / 2, R: devU / 2, s1: r.s1p, s3: r.s3p }
  return (
    <Sol>
      <Md>{`NC clay: both envelopes pass through the origin (c = c′ = 0), so one circle fixes each angle, $\\sin\\varphi = R/C$.`}</Md>
      <Tex block>{`\\text{CD (}u = 0\\text{, total = effective): } \\sin\\varphi' = \\frac{${f2(devD / 2)}}{${f2(s3)} + ${f2(devD / 2)}} \\Rightarrow \\varphi' = ${f2(r.phiE)}^\\circ`}</Tex>
      <Tex block>{`\\text{CU (total circle): } \\sin\\varphi_{cu} = \\frac{${f2(devU / 2)}}{${f2(s3)} + ${f2(devU / 2)}} \\Rightarrow \\varphi_{cu} = ${f2(r.phiT)}^\\circ`}</Tex>
      <Md>{`**Pore pressure at failure in the CU test:** the effective CU circle has the same radius ${f2(devU / 2)} kPa and must touch the effective envelope (φ′ = ${f2(r.phiE)}°): $\\sigma'_{3f} = R/\\sin\\varphi' - R = ${f2(devU / 2)}/${f4(Math.sin((r.phiE * Math.PI) / 180))} - ${f2(devU / 2)} = ${f2(r.s3p)}$ kPa, so $u_f = \\sigma_3 - \\sigma'_{3f} = ${f2(s3)} - ${f2(r.s3p)} = ${f2(r.uf)}$ kPa.`}</Md>
      <Tex block>{`A_f = \\frac{\\Delta u_f}{\\Delta\\sigma_f} = \\frac{${f2(r.uf)}}{${f2(devU)}} = ${f3(r.Af)}`}</Tex>
      <MohrPlot total={[cd, cuT]} eff={[cuE]} envT={{ c: 0, phi: r.phiT }} envE={{ c: 0, phi: r.phiE }} />
      <p className="text-xs text-faint">Solid: CD circle (also effective) and the CU total circle; dashed: the CU effective circle, shifted left by uf.</p>
    </Sol>
  )
}

// ---------------------------------------------------------------- p′–q plot (modified failure envelope, Kf line)
export function PQPlot({ pts, a, alpha, width = 520, height = 260 }: { pts: { p: number; q: number }[]; a: number; alpha: number; width?: number; height?: number }) {
  const L = 44,
    B = 30,
    Tm = 12,
    Rm = 12
  const pmax = Math.max(10, ...pts.map((x) => x.p)) * 1.15
  const ta = Math.tan((alpha * Math.PI) / 180)
  const qmax = Math.max(10, ...pts.map((x) => x.q), a + pmax * ta) * 1.1
  const k = Math.min((width - L - Rm) / pmax, (height - B - Tm) / qmax)
  const X = (p: number) => L + p * k
  const Y = (q: number) => height - B - q * k
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="p′–q diagram">
      <line x1={L} x2={width - Rm} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" />
      <line x1={L} x2={L} y1={Tm} y2={Y(0)} stroke="var(--c-ink)" />
      <text x={width - Rm} y={Y(0) + 14} fontSize={10} textAnchor="end" fill="var(--c-ink)">
        p′ = (σ′1 + σ′3)/2 (kPa)
      </text>
      <text x={L + 4} y={Tm + 8} fontSize={10} fill="var(--c-ink)">
        q = (σ1 − σ3)/2 (kPa)
      </text>
      <line x1={X(0)} y1={Y(a)} x2={X(pmax)} y2={Y(a + pmax * ta)} stroke="var(--c-accent2)" strokeWidth={1.6} />
      <text x={X(pmax) - 4} y={Y(a + pmax * ta) + 14} fontSize={9.5} textAnchor="end" fill="var(--c-accent2)">
        Kf line: q = {f2(a)} + p′ tan {f2(alpha)}°
      </text>
      <circle cx={X(0)} cy={Y(a)} r={3} fill="var(--c-accent2)" />
      <text x={X(0) + 5} y={Y(a) - 5} fontSize={9.5} fill="var(--c-accent2)">
        a = {f2(a)}
      </text>
      {pts.map((x, i) => (
        <g key={i}>
          <circle cx={X(x.p)} cy={Y(x.q)} r={4} fill="var(--c-load)" />
          <text x={X(x.p) + 5} y={Y(x.q) + 13} fontSize={9} fill="var(--c-mute)">
            ({f1(x.p)}, {f1(x.q)})
          </text>
        </g>
      ))}
    </svg>
  )
}
