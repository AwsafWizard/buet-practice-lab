// Seepage exam-style problems: stress profile, sheet pile net, dam with cut-off, excavation heave, quick condition + filter.
// Every number from the engines (flownet, stresses).

import { fmt } from '../../../components/DiagramView'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { netLines, pointInfo, solveNet } from '../../engine/flownet'
import { eFromN, excavationHeave, filterDepth, gsubFromGsE, profile } from '../../engine/stresses'
import { GW } from '../../engine/units'
import { ExamProblems, type Level, type XProblem, type XStep } from './examShell'
import { geomOf, NET_DEFAULT, netResults, NetSolution, type NetState } from './FlowNetLab'
import { ExFigure, ExSolution, QuickFigure, QuickSolution, type ExState, type QState } from './HeaveLab'
import { NetView } from './NetView'
import { ProfileFigure, ProfileSolution, randomProfile, toProfileIn, type ProfState } from './ProfileLab'

const f2 = (v: number) => fmt(v, 2)

export type SFam = 'profile' | 'pile' | 'dam' | 'heave' | 'filter'
const FAMS: { v: SFam; label: string }[] = [
  { v: 'profile', label: 'σ, u, σ′ profile' },
  { v: 'pile', label: 'Sheet pile net' },
  { v: 'dam', label: 'Dam / weir net' },
  { v: 'heave', label: 'Excavation heave' },
  { v: 'filter', label: 'Quick condition, filter' },
]

interface SP extends XProblem<SFam> {
  prof?: ProfState
  net?: { st: NetState; probe: { x: number; z: number } }
  ex?: ExState
  q?: QState
}

const kTxt = (k: number) => {
  const e = Math.floor(Math.log10(k))
  const m = +(k / 10 ** e).toFixed(2)
  return `${m} × 10⁻${String(-e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])}`
}

function make(seed: number, family?: SFam, level: Level = 'exam'): SP {
  const r = rng(seed * 6007 + 13)
  const fam = family ?? pick(r, ['profile', 'pile', 'pile', 'dam', 'heave', 'filter'] as SFam[])
  if (fam === 'profile') {
    const prof = randomProfile(seed, level)
    const pts = profile(toProfileIn(prof))
    const tot = prof.layers.reduce((s, l) => s + l.H, 0)
    const mid = pts.find((p) => p.z > 0 && p.z < tot && p.label !== undefined) ?? pts[1]
    const bot = pts[pts.length - 1]
    const steps: XStep[] = [
      { key: 'sm', group: `At ${f2(mid.z)} m (${mid.label})`, label: 'σ', value: mid.sigma, unit: 'kPa', abs: 0.3 },
      { key: 'um', group: `At ${f2(mid.z)} m (${mid.label})`, label: 'u', value: mid.u, unit: 'kPa', abs: 0.3 },
      { key: 'em', group: `At ${f2(mid.z)} m (${mid.label})`, label: 'σ′', value: mid.eff, unit: 'kPa', abs: 0.3 },
      { key: 'sb', group: `At the bottom (${f2(bot.z)} m)`, label: 'σ', value: bot.sigma, unit: 'kPa', abs: 0.3 },
      { key: 'ub', group: `At the bottom (${f2(bot.z)} m)`, label: 'u', value: bot.u, unit: 'kPa', abs: 0.3 },
      { key: 'eb', group: `At the bottom (${f2(bot.z)} m)`, label: 'σ′', value: bot.eff, unit: 'kPa', abs: 0.3 },
    ]
    const lay = prof.layers.map((l, k) => `${k ? 'then ' : ''}${l.name.toLowerCase()} ${f2(l.H)} m thick (γ = ${l.gamma} kN/m³ above the water table, γsat = ${l.gammaSat} kN/m³ below)`).join(', ')
    const wtT = prof.wt < 0 ? `Water stands ${f2(-prof.wt)} m above the ground surface.` : `The water table is ${f2(prof.wt)} m below the ground surface${prof.hc > 0 ? `, and the soil above it is saturated by capillary rise for ${f2(prof.hc)} m` : ''}.`
    const flowT = prof.flow !== 'none' ? ` Water seeps ${prof.flow === 'up' ? 'upward' : 'downward'} through the ${prof.layers[prof.flowLayer].name.toLowerCase()} layer under a head difference of ${f2(prof.dh)} m (the piezometric level in the layer below is ${f2(prof.dh)} m ${prof.flow === 'up' ? 'above' : 'below'} the hydrostatic one).` : ''
    return {
      family: fam,
      level,
      title: 'Total, pore and effective stress',
      text: `The soil profile from the ground surface is ${lay}. ${wtT}${flowT} Draw the soil profile and the total stress, pore water pressure and effective stress diagrams to ${f2(tot)} m, showing the controlling ordinates.`,
      hash: hashKey(JSON.stringify(['p', prof])),
      steps,
      prof,
    }
  }
  if (fam === 'pile' || fam === 'dam') {
    const st: NetState = { ...NET_DEFAULT, kind: fam, Nf: 4, gsat: randInt(r, 180, 210) / 10, k: pick(r, [2e-6, 5e-6, 1e-5, 2.5e-5, 4e-5]) }
    if (fam === 'pile') {
      st.T = randInt(r, 12, 36) / 2
      st.s = Math.round(st.T * (0.3 + 0.4 * r()) * 2) / 2
      st.hU = randInt(r, 6, 20) / 2
      st.hD = randInt(r, 0, Math.min(6, st.hU * 2 - 4)) / 2
    } else {
      st.T = randInt(r, 16, 30) / 2
      st.B = randInt(r, 10, 28)
      st.hU = randInt(r, 8, 22) / 2
      st.hD = level === 'basic' ? 0 : randInt(r, 0, 2) / 2
      st.embed = level === 'tough' ? pick(r, [1, 1.5, 2]) : 0
      st.embedD = st.embed
      st.cutU = level === 'basic' ? 0 : Math.round(st.T * (0.3 + 0.25 * r()) * 2) / 2
      st.cutD = level === 'tough' ? Math.round(st.T * (0.2 + 0.2 * r()) * 2) / 2 : 0
    }
    const g = geomOf(st)
    const sol = solveNet(g, 'final')
    const R = netResults(sol, st)
    const B = Math.max(0, g.B)
    const probe = fam === 'pile' ? { x: pick(r, [-1, 1]) * randInt(r, 2, 8) / 2, z: Math.max(0.5, g.zD - randInt(r, 2, Math.floor(st.T * 1.5)) / 2) } : { x: B * pick(r, [0.25, 0.5, 0.75]), z: (g.zB ?? g.zD) - 0.01 }
    const pi = pointInfo(sol, probe.x, probe.z, st.gsat, R.Nd)
    const depth = (probe.x < 0 ? g.zU : probe.x > B ? g.zD : g.zB ?? g.zD) - probe.z
    const steps: XStep[] = [
      { key: 'H', group: 'Flow net', label: 'head lost H', value: R.H, unit: 'm' },
      { key: 'nd', group: 'Flow net', label: 'Nd for Nf = 4 (your net, ±10 %)', value: R.Nd, tol: 0.1, digits: 1 },
      { key: 'q', group: 'Flow net', label: 'seepage (m³/day per m)', value: R.q * 86400, tol: 0.1, digits: 4 },
      { key: 'u', group: 'Point P', label: 'pore pressure at P', value: pi.u, unit: 'kPa', tol: 0.06, digits: 1 },
      { key: 'icr', group: 'Safety', label: 'icr', value: R.icr, digits: 3 },
      { key: 'ie', group: 'Safety', label: 'exit gradient (last field)', value: R.ie, tol: 0.15, digits: 3 },
    ]
    if (R.heave) steps.push({ key: 'fs', group: 'Safety', label: 'FS against heave (Terzaghi)', value: R.heave.FS, tol: 0.1, digits: 2 })
    if (R.up) steps.push({ key: 'U', group: 'Uplift', label: 'uplift force on the base', value: R.up.U, unit: 'kN/m', tol: 0.06, digits: 0 })
    const text =
      fam === 'pile'
        ? `A single row of sheet piles penetrates ${f2(st.s)} m into a permeable stratum (k = ${kTxt(st.k)} m/s, γsat = ${st.gsat} kN/m³) that extends ${f2(st.T)} m below the ground to an impermeable layer. Water stands ${f2(st.hU)} m above the ground upstream and ${f2(st.hD)} m downstream. Draw the flow net and find (i) the seepage per metre run per day, (ii) the pore water pressure at P, ${f2(Math.abs(probe.x))} m ${probe.x < 0 ? 'upstream' : 'downstream'} of the piles and ${f2(depth)} m below the ground, (iii) the exit gradient and the factors of safety against piping (Harza) and heave (Terzaghi).`
        : `A concrete weir with a ${f2(st.B)} m base ${st.embed ? `founded ${f2(st.embed)} m below the river bed ` : 'resting on the river bed '}sits on a permeable layer ${f2(st.T)} m thick (k = ${kTxt(st.k)} m/s, γsat = ${st.gsat} kN/m³) over an impermeable stratum.${st.cutU ? ` A sheet-pile cut-off goes ${f2(st.cutU)} m below the base at the heel.` : ''}${st.cutD ? ` Another goes ${f2(st.cutD)} m below the base at the toe.` : ''} Headwater is ${f2(st.hU)} m above the upstream bed and tail water ${f2(st.hD)} m above the downstream bed. Draw the flow net; find the seepage per metre per day, the pore pressure under the base at P (${f2(probe.x)} m from the heel), the exit gradient and FS against piping${st.cutD ? ' and heave' : ''}, and the uplift force on the base.`
    return { family: fam, level, title: fam === 'pile' ? 'Sheet pile: draw the net' : 'Weir / dam: draw the net', text, hash: hashKey(JSON.stringify([fam, st, probe])), steps, net: { st, probe } }
  }
  if (fam === 'heave') {
    const Hc = randInt(r, 6, 16)
    const art = level === 'tough' ? randInt(r, 1, 6) / 2 : null
    const ex: ExState = { Hc, gSat: randInt(r, 165, 200) / 10, wt: art === null && level !== 'basic' ? pick(r, [0, 0, 1]) : 0, art, pit: 0, d: Math.round(Hc * (0.35 + 0.45 * r()) * 2) / 2, FS: level === 'basic' ? 1 : pick(r, [1, 1.2, 1.5]) }
    const o = { Hc: ex.Hc, gSat: ex.gSat, wt: ex.wt, hp: ex.art === null ? undefined : ex.Hc + ex.art }
    const res = excavationHeave(o, ex.d, ex.FS)
    return {
      family: fam,
      level,
      title: 'Excavation over a sand aquifer',
      text: `A ${Hc} m clay layer (γsat = ${ex.gSat} kN/m³) extends from the ground surface and is underlain by sand. ${art === null ? `The water table is ${ex.wt ? `${ex.wt} m below` : 'at'} the ground surface` : `The sand is under artesian pressure: a piezometer in it rises ${f2(art)} m above the ground`}. An excavation is planned to ${f2(ex.d)} m with the water in it kept at its bottom by pumping. Is it possible without lowering the head in the sand${ex.FS > 1 ? ` (required FS = ${ex.FS})` : ''}? Find the safe depth and the drawdown needed.`,
      hash: hashKey(JSON.stringify(['h', ex])),
      steps: [
        { key: 'u', group: 'At the clay base', label: 'water pressure u', value: res.u, unit: 'kPa' },
        { key: 'W', group: 'At the clay base', label: 'stress from the clay left', value: res.W, unit: 'kPa' },
        { key: 'fs', group: 'Verdict', label: 'FS', value: res.FS, digits: 3 },
        { key: 'd', group: 'Verdict', label: ex.FS > 1 ? `safe depth (FS ${ex.FS})` : 'maximum safe depth', value: ex.FS > 1 ? res.dSafe : res.dMax, unit: 'm' },
        { key: 'dd', group: 'Verdict', label: 'drawdown needed in the sand', value: res.drawdown, unit: 'm', abs: 0.02 },
      ],
      ex,
    }
  }
  const q: QState = { L: randInt(r, 5, 30) / 10, h: 0, Gs: randInt(r, 260, 272) / 100, n: randInt(r, 30, 42) / 100, FS: pick(r, [1.5, 2, 2.5, 3]) }
  const gsub = gsubFromGsE(q.Gs, eFromN(q.n))
  q.h = Math.round(((gsub * q.L) / GW) * (0.7 + 0.8 * r()) * 20) / 20
  const fd = filterDepth({ gsub, L: q.L, h: q.h, FS: q.FS })
  return {
    family: 'filter',
    level,
    title: 'Upward seepage and a weighting filter',
    text: `A ${f2(q.L)} m layer of soil (Gs = ${q.Gs}, porosity ${Math.round(q.n * 100)} %) is subjected to an upward seepage head of ${f2(q.h)} m. What depth of coarse sand is needed above it for a factor of safety of ${q.FS} against piping? The sand has the same porosity and Gs, and the head loss in it is negligible.`,
    hash: hashKey(JSON.stringify(['f', q])),
    steps: [
      { key: 'g', group: 'Soil', label: 'γ′', value: gsub, unit: 'kN/m³' },
      { key: 'fs0', group: 'Without filter', label: 'FS = γ′L/(hγw)', value: fd.FS0, digits: 3 },
      { key: 'z', group: 'Filter', label: 'depth of coarse sand', value: fd.z, unit: 'm', abs: 0.02 },
    ],
    q,
  }
}

function Figure({ p }: { p: SP }) {
  if (p.prof) {
    const blank = { ...p.prof }
    return (
      <div>
        <ProfileFigure s={blank} pts={profile(toProfileIn(blank)).map((x) => ({ ...x, sigma: 0, u: 0, eff: 0 }))} />
        <p className="text-xs text-faint">Diagrams left blank: draw them, then check.</p>
      </div>
    )
  }
  if (p.net) {
    const sol = solveNet(geomOf(p.net.st), 'live')
    // P is marked without its piezometer level (that is the answer)
    return <NetView sol={sol} kind={p.net.st.kind} probe={{ ...p.net.probe, h: p.net.probe.z }} />
  }
  if (p.ex) return <ExFigure s={{ ...p.ex }} />
  if (p.q) return <QuickFigure s={p.q} zf={0} />
  return null
}

function Solution({ p }: { p: SP }) {
  if (p.prof) return <ProfileSolution s={p.prof} />
  if (p.net) {
    const sol = solveNet(geomOf(p.net.st), 'final')
    const R = netResults(sol, p.net.st)
    const pi = pointInfo(sol, p.net.probe.x, p.net.probe.z, p.net.st.gsat, R.Nd)
    return (
      <div className="space-y-2">
        <NetView sol={sol} net={netLines(sol, p.net.st.Nf)} kind={p.net.st.kind} probe={{ ...p.net.probe, h: pi.h }} prism={R.heave} />
        <NetSolution st={p.net.st} R={R} probe={{ info: pi, depth: 0 }} />
      </div>
    )
  }
  if (p.ex) return <ExSolution s={p.ex} />
  if (p.q) return <QuickSolution s={p.q} />
  return null
}

export function SeepProblems() {
  return <ExamProblems topic="sm-seep" families={FAMS} make={make} figure={(p) => <Figure p={p} />} solution={(p) => <Solution p={p} />} foot="Flow-net answers come from a finite-difference solution of the Laplace equation (checked against the exact sheet-pile result); a careful hand-drawn net lands within about ±10 %, so those checks allow 10 %." />
}

export { make as makeSeepProblem }
