// Exam-style full shear problems: seeded, step checks, engine solution on reveal.
import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { DesignProblems, type DProblem, type DStep, type Level } from '../../../rc/topics/tbeam/designShell'
import { circle, circleFromTangentPoint, failurePlane, type Circle } from '../../engine/mohr'
import { circleArea, consistencyFromQu, directShear, fitCircles, phiFromCircle, squareArea, strengthAt, triaxCircles, ufFromEnvelope, unconfined } from '../../engine/shear'
import { MohrFig, TauSigmaFig } from './figs'
import { randomTest } from './Lab'

const f2 = (v: number) => fmt(v, 2)
type Fam = 'ds' | 'cd' | 'cu' | 'cucd' | 'uc' | 'depth'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'ds', label: 'Direct shear' },
  { v: 'cd', label: 'CD, NC clay' },
  { v: 'cu', label: 'CU, total + effective' },
  { v: 'cucd', label: 'CU vs CD → Af' },
  { v: 'uc', label: 'Unconfined' },
  { v: 'depth', label: 'Strength at depth' },
]

interface SProblem extends DProblem<Fam> {
  fig: () => ReactNode
  sol: () => ReactNode
}

const Mohr = ({ cs, effs, env, envE }: { cs: Circle[]; effs?: Circle[]; env?: { c: number; phi: number }; envE?: { c: number; phi: number } }) => (
  <MohrFig
    height={260}
    circles={[...cs.map((c) => ({ c, color: 'var(--c-accent)' })), ...(effs ?? []).map((c) => ({ c, color: 'var(--c-accent2)', dash: true }))]}
    envs={[...(env ? [{ env, color: 'var(--c-accent)', label: `c = ${f2(env.c)}, φ = ${f2(env.phi)}°` }] : []), ...(envE ? [{ env: envE, color: 'var(--c-accent2)', dash: true, label: `c′ = ${f2(envE.c)}, φ′ = ${f2(envE.phi)}°` }] : [])]}
  />
)

function make(seed: number, family?: Fam, level: Level = 'exam'): SProblem {
  const r = rng(seed * 13 + 5)
  const fam = family ?? pick(r, ['ds', 'cd', 'cu', 'cu', 'cucd', 'uc', 'depth'] as Fam[])
  const sub = Math.floor(r() * 1e9)
  const steps: DStep[] = []
  if (fam === 'ds') {
    const t = randomTest(sub, 'ds')
    const A = t.shape === 'square' ? squareArea(t.size) : circleArea(t.size)
    const res = directShear(
      t.ds.map((x) => ({ N: t.nUnit === 'kg' ? (x.N * 9.81) / 1000 : x.N / 1000, T: x.T / 1000 })),
      A,
      { through0: t.through0 },
    )
    res.pts.forEach((p, i) => {
      steps.push({ key: `s${i}`, group: 'Stresses', label: `σ, test ${i + 1}`, value: p.sigma, unit: 'kPa', abs: 0.1 })
      steps.push({ key: `t${i}`, group: 'Stresses', label: `τf, test ${i + 1}`, value: p.tau, unit: 'kPa', abs: 0.1 })
    })
    if (!t.through0) steps.push({ key: 'c', group: 'Envelope', label: 'c', value: res.env.c, unit: 'kPa', abs: 0.3 })
    steps.push({ key: 'phi', group: 'Envelope', label: 'φ', value: res.env.phi, unit: '°', abs: 0.15 })
    const last = res.pts[res.pts.length - 1]
    const circ = level !== 'basic' ? circleFromTangentPoint(last.sigma, last.tau, res.env.phi) : null
    if (circ) steps.push({ key: 's1', group: 'Mohr circle of the last test', label: 'σ1 at failure', value: circ.s1, unit: 'kPa' })
    const rows = t.ds.map((x, i) => `${i + 1}: normal ${x.N} ${t.nUnit}, shear ${x.T} N`).join('; ')
    return {
      family: fam,
      level,
      title: 'Direct shear',
      text: `A direct shear test (${t.shape === 'square' ? `${t.size} mm × ${t.size} mm box` : `${t.size} mm diameter, 25 mm high specimens`}) gave at failure — ${rows}. Determine the shear-strength parameters${t.through0 ? ' (sand, c = 0)' : ''} and write the Mohr–Coulomb equation.${circ ? ' Find the principal stresses at failure in the last test (circle tangent at its point).' : ''}`,
      hash: hashKey(JSON.stringify(t)),
      steps,
      fig: () => null,
      sol: () => (
        <div className="space-y-2 text-sm">
          <TauSigmaFig pts={res.pts} env={res.env} />
          <p>
            A = {fmt(A * 1e6, 1)} mm². σ = N/A, τf = T/A: {res.pts.map((p) => `(${f2(p.sigma)}, ${f2(p.tau)})`).join(', ')} kPa. {t.through0 ? `Through the origin: tan φ = ${fmt(res.fit.b, 4)}` : `Least squares τ = ${f2(res.fit.a)} + ${fmt(res.fit.b, 4)}σ`} → φ = <b>{f2(res.env.phi)}°</b>, c = <b>{f2(res.env.c)} kPa</b>: τf = {f2(res.env.c)} + σ tan {f2(res.env.phi)}°.
          </p>
          {circ && (
            <p>
              Last test: centre = σ + τ tan φ = {f2(circ.C)}, radius = τ/cos φ = {f2(circ.R)} → σ1 = <b>{f2(circ.s1)}</b>, σ3 = {f2(circ.s3)} kPa.
            </p>
          )}
        </div>
      ),
    }
  }
  if (fam === 'cd') {
    const s3 = randInt(r, 70, 300, 5)
    const phi = randInt(r, 20, 34)
    const Kp = Math.tan(((45 + phi / 2) * Math.PI) / 180) ** 2
    const dev = Math.round(s3 * (Kp - 1))
    const ph = phiFromCircle(s3, dev)
    const c = circle(s3 + dev, s3)
    const fp = failurePlane(c, ph)
    steps.push({ key: 'phi', group: 'Friction angle', label: 'φ′', value: ph, unit: '°', abs: 0.1 })
    steps.push({ key: 'th', group: 'Failure plane', label: 'θ from the major principal plane', value: fp.theta, unit: '°', abs: 0.1 })
    steps.push({ key: 'sf', group: 'Failure plane', label: 'σ′f', value: fp.sigma, unit: 'kPa' })
    steps.push({ key: 'tf', group: 'Failure plane', label: 'τf', value: fp.tau, unit: 'kPa' })
    if (level !== 'basic') steps.push({ key: 'tm', group: 'Failure plane', label: 'τmax (on the 45° plane)', value: c.R, unit: 'kPa' })
    return {
      family: fam,
      level,
      title: 'CD test, NC clay (AJK CD Problem 3 style)',
      text: `A consolidated-drained triaxial test on a normally consolidated clay: σ3 = ${s3} kN/m², deviator stress at failure ${dev} kN/m². Find (a) φ′, (b) the angle θ of the failure plane with the major principal plane, (c) σ′f and τf on the failure plane${level !== 'basic' ? ', and τmax' : ''}.`,
      hash: hashKey(`cd${s3},${dev}`),
      steps,
      fig: () => null,
      sol: () => (
        <div className="space-y-1 text-sm">
          <Mohr cs={[c]} env={{ c: 0, phi: ph }} />
          <Tex block>{`R = ${dev}/2 = ${f2(c.R)},\\quad \\varphi' = \\sin^{-1}\\frac{${f2(c.R)}}{${s3} + ${f2(c.R)}} = ${f2(ph)}^\\circ`}</Tex>
          <Tex block>{`180 = 90 + \\varphi' + (180 - 2\\theta) \\Rightarrow 2\\theta = ${f2(90 + ph)}^\\circ,\\ \\theta = ${f2(fp.theta)}^\\circ`}</Tex>
          <Tex block>{`x = R\\cos(180 - 2\\theta) = ${f2(fp.x)},\\ \\tau_f = R\\sin(180-2\\theta) = ${f2(fp.tau)},\\ \\sigma'_f = (\\sigma_3 + R) - x = ${f2(fp.sigma)}\\ \\text{kPa}`}</Tex>
          <p>τmax = R = {f2(c.R)} kPa on planes at 45°.</p>
        </div>
      ),
    }
  }
  if (fam === 'cu') {
    let t = randomTest(sub, 'cu')
    for (let k = 1; t.tri.length < 2 && k < 20; k++) t = randomTest(sub + k, 'cu')
    if (level === 'basic') t = { ...t, tri: t.tri.slice(0, 2) }
    const tc = triaxCircles(t.tri.map((x) => ({ s3: x.s3, dev: x.dev, u: x.u })))
    const fT = fitCircles(tc.total),
      fE = fitCircles(tc.eff!)
    tc.eff!.forEach((c, i) => steps.push({ key: `e${i}`, group: 'Effective circles', label: `σ′3, specimen ${i + 1}`, value: c.s3, unit: 'kPa', abs: 0.1 }))
    steps.push({ key: 'pT', group: 'Total envelope', label: 'φ (total)', value: fT.phi, unit: '°', abs: 0.2 })
    steps.push({ key: 'cT', group: 'Total envelope', label: 'c (total)', value: fT.c, unit: 'kPa', abs: 1 })
    steps.push({ key: 'pE', group: 'Effective envelope', label: 'φ′', value: fE.phi, unit: '°', abs: 0.2 })
    steps.push({ key: 'cE', group: 'Effective envelope', label: 'c′', value: fE.c, unit: 'kPa', abs: 1 })
    steps.push({ key: 'af', group: 'Pore pressure', label: 'Af, specimen 1', value: tc.Af[0]!, digits: 3, abs: 0.01 })
    const rows = t.tri.map((x, i) => `specimen ${i + 1}: σ3 = ${x.s3}, (σ1 − σ3)f = ${x.dev}, uf = ${x.u} kPa`).join('; ')
    return {
      family: fam,
      level,
      title: `CU test, ${t.tri.length} specimens`,
      text: `CU triaxial tests with pore-pressure measurement on a saturated clay gave at failure — ${rows}. Determine the total and effective stress parameters (${t.tri.length > 2 ? 'p–q least squares / modified failure envelope' : 'common tangent'}) and Af of specimen 1.`,
      hash: hashKey(JSON.stringify(t.tri)),
      steps,
      fig: () => null,
      sol: () => (
        <div className="space-y-1 text-sm">
          <Mohr cs={tc.total} effs={tc.eff!} env={fT.ok ? fT : undefined} envE={fE.ok ? fE : undefined} />
          <p>
            Effective circles: {tc.eff!.map((c, i) => `(${f2(c.s3)}, ${f2(c.s1)})${i < tc.eff!.length - 1 ? ', ' : ''}`)} kPa.
          </p>
          <p>
            {fT.method === 'tangent' ? 'Common tangent' : 'p–q least squares'}: total c = <b>{f2(fT.c)}</b> kPa, φ = <b>{f2(fT.phi)}°</b>; effective c′ = <b>{f2(fE.c)}</b> kPa, φ′ = <b>{f2(fE.phi)}°</b>
            {fT.method === 'pq' ? ` (Kf line: q = ${f2(fE.a)} + p tan ${f2(fE.alpha)}°)` : ''}.
          </p>
          <p>Af = uf/(σ1 − σ3)f = {t.tri[0].u}/{t.tri[0].dev} = {fmt(tc.Af[0]!, 3)}.</p>
          {(fT.note || fE.note) && <p className="text-load">{fT.note ?? fE.note}</p>}
        </div>
      ),
    }
  }
  if (fam === 'cucd') {
    const s3 = pick(r, [100, 150, 200])
    const phi = randInt(r, 24, 34)
    const Kp = Math.tan(((45 + phi / 2) * Math.PI) / 180) ** 2
    const devD = Math.round(s3 * (Kp - 1))
    const Af = pick(r, [0.3, 0.5, 0.7, 0.9])
    const devU = Math.round((s3 * (Kp - 1)) / (1 + Af * (Kp - 1)))
    const ph = phiFromCircle(s3, devD)
    const phU = phiFromCircle(s3, devU)
    const u = ufFromEnvelope(s3, devU, { c: 0, phi: ph })
    steps.push({ key: 'p', group: 'Angles', label: "φ′ (from the CD test)", value: ph, unit: '°', abs: 0.1 })
    steps.push({ key: 'pu', group: 'Angles', label: 'φcu (total, CU test)', value: phU, unit: '°', abs: 0.1 })
    steps.push({ key: 's3p', group: 'Pore pressure', label: "σ′3 at failure in the CU test", value: u.s3p, unit: 'kPa' })
    steps.push({ key: 'uf', group: 'Pore pressure', label: 'uf', value: u.uf, unit: 'kPa' })
    steps.push({ key: 'af', group: 'Pore pressure', label: 'Af', value: u.Af, digits: 3, abs: 0.01 })
    return {
      family: fam,
      level,
      title: 'Identical NC specimens: CU and CD (2017-18 Q4(b) / Jan 2021 Q8(b))',
      text: `Two identical saturated NC clay specimens were consolidated under ${s3} kN/m² (u = 0 at the end). One was sheared undrained, the other drained; the deviator stresses at failure were ${devU} kN/m² (undrained) and ${devD} kN/m² (drained). Find φ′ and φcu, and the pore-pressure parameter Af in the undrained test.`,
      hash: hashKey(`cucd${s3},${devU},${devD}`),
      steps,
      fig: () => null,
      sol: () => (
        <div className="space-y-1 text-sm">
          <Mohr cs={[circle(s3 + devU, s3)]} effs={[circle(u.s1p, u.s3p), circle(s3 + devD, s3)]} env={{ c: 0, phi: phU }} envE={{ c: 0, phi: ph }} />
          <Tex block>{`\\text{CD: }\\sin\\varphi' = \\frac{${devD}/2}{${s3} + ${devD}/2} \\Rightarrow \\varphi' = ${f2(ph)}^\\circ;\\quad \\text{CU total: } \\varphi_{cu} = ${f2(phU)}^\\circ`}</Tex>
          <Tex block>{`\\text{CU effective circle tangent to } \\varphi':\\ \\sigma'_3 = \\frac{R(1-\\sin\\varphi')}{\\sin\\varphi'} = ${f2(u.s3p)}\\ \\Rightarrow u_f = ${s3} - ${f2(u.s3p)} = ${f2(u.uf)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`A_f = \\frac{u_f}{(\\sigma_1-\\sigma_3)_f} = \\frac{${f2(u.uf)}}{${devU}} = ${fmt(u.Af, 3)}`}</Tex>
          <p className="text-xs text-faint">Skempton's Af is not in AJK sir's slides (flagged); the circles are.</p>
        </div>
      ),
    }
  }
  if (fam === 'uc') {
    const t = randomTest(sub, 'uc')
    const u = unconfined(t.P / 1000, t.dH, t.H0, t.D)
    steps.push({ key: 'e', group: 'Strain and area', label: 'ε', value: u.eps * 100, unit: '%', abs: 0.01 })
    steps.push({ key: 'A', group: 'Strain and area', label: 'corrected area', value: u.A * 1e6, unit: 'mm²' })
    steps.push({ key: 'q', group: 'Strength', label: 'σ1 = qu', value: u.qu, unit: 'kPa' })
    steps.push({ key: 'c', group: 'Strength', label: 'cu', value: u.cu, unit: 'kPa' })
    steps.push({ key: 'k', group: 'Strength', label: 'consistency', options: ['Very soft', 'Soft', 'Medium', 'Stiff', 'Very stiff', 'Hard'].map((v) => ({ v, label: v })), answer: consistencyFromQu(u.qu) })
    return {
      family: fam,
      level,
      title: 'Unconfined compression (AJK UC problem style)',
      text: `An unconfined compression test on a saturated clay (${t.D} mm × ${t.H0} mm): maximum load ${t.P} N at a vertical displacement of ${t.dH} mm. Find (a) ε, (b) σ1 at failure using A = A0/(1 − ε), (c) cu, and the consistency.`,
      hash: hashKey(`uc${t.P},${t.dH}`),
      steps,
      fig: () => null,
      sol: () => (
        <div className="space-y-1 text-sm">
          <Tex block>{`\\varepsilon = ${t.dH}/${t.H0} = ${f2(u.eps * 100)}\\%,\\quad A = \\frac{${fmt(u.A0, 7)}}{1 - ${fmt(u.eps, 5)}} = ${fmt(u.A, 7)}\\ \\text{m}^2`}</Tex>
          <Tex block>{`q_u = \\frac{${fmt(t.P / 1000, 4)}}{${fmt(u.A, 7)}} = ${f2(u.qu)}\\ \\text{kPa},\\quad c_u = q_u/2 = ${f2(u.cu)}\\ \\text{kPa}`}</Tex>
          <p>
            Consistency: <b>{u.consistency}</b> (Das Table 12.4).
          </p>
        </div>
      ),
    }
  }
  // strength at depth: WT rise (SI version of AJK Problem 3)
  const z = randInt(r, 8, 16)
  const zw1 = randInt(r, Math.ceil(z / 2), z - 2),
    zw2 = randInt(r, 0, zw1 - 2)
  const g = randInt(r, 16, 18),
    gs = g + randInt(r, 1, 3)
  const phi = randInt(r, 26, 34)
  const c = level === 'tough' ? randInt(r, 5, 15) : 0
  const A1 = strengthAt({ z, zw: zw1, gamma: g, gammaSat: gs }, { c, phi })
  const A2 = strengthAt({ z, zw: zw2, gamma: g, gammaSat: gs }, { c, phi })
  ;[
    ['σ′ (WT low)', A1.sigmaP],
    ['τf (WT low)', A1.tauf],
    ['σ′ (WT high)', A2.sigmaP],
    ['τf (WT high)', A2.tauf],
  ].forEach(([l, v], i) => steps.push({ key: `d${i}`, group: 'Point A', label: l as string, value: v as number, unit: 'kPa' }))
  steps.push({ key: 'drop', group: 'Point A', label: 'loss of strength', value: ((A1.tauf - A2.tauf) / A1.tauf) * 100, unit: '%', abs: 0.3 })
  return {
    family: 'depth',
    level,
    title: 'Water-table rise and strength (AJK Problem 3, SI)',
    text: `A potential slip surface passes through point A, ${z} m below a slope surface. γ = ${g} kN/m³ above the WT, ${gs} below; c′ = ${c}, φ′ = ${phi}°. Find the shear strength at A when the WT is ${zw1} m below the surface and after it rises to ${zw2} m. By what percentage does the strength drop?`,
    hash: hashKey(`wt${z},${zw1},${zw2},${g},${gs},${phi},${c}`),
    steps,
    fig: () => null,
    sol: () => (
      <div className="space-y-1 text-sm">
        {[
          [zw1, A1],
          [zw2, A2],
        ].map(([zw, a], i) => {
          const s = a as typeof A1
          return (
            <Tex key={i} block>{`\\text{WT at } ${zw}\\text{ m: } \\sigma = ${g}(${zw}) + ${gs}(${z - (zw as number)}) = ${f2(s.sigma)},\\ u = 9.81(${z - (zw as number)}) = ${f2(s.u)},\\ \\sigma' = ${f2(s.sigmaP)},\\ \\tau_f = ${c} + ${f2(s.sigmaP)}\\tan ${phi}^\\circ = ${f2(s.tauf)}\\ \\text{kPa}`}</Tex>
          )
        })}
        <p>The rise cuts σ′ and so the strength by {f2(((A1.tauf - A2.tauf) / A1.tauf) * 100)} %; the factor of safety of the slip surface drops with it.</p>
      </div>
    ),
  }
}

export function ShearProblems() {
  return (
    <DesignProblems
      topic="sm-shear"
      families={FAMS}
      make={make}
      figure={(p) => p.fig() ?? <div className="text-xs text-faint">No figure: draw the Mohr circles to scale on graph paper.</div>}
      solution={(p) => p.sol()}
      sub="A full exam-style shear problem from the paper families: work it on graph paper, check each step, then open the solution."
      foot="γw = 9.81 kN/m³. Two circles: exact common tangent; three or more: p–q least squares."
    />
  )
}
export { make as makeShearProblem }
