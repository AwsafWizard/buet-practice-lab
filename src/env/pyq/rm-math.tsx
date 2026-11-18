// Number-type parts from Rowshan ma'am's topics: pumps, rainwater harvesting, the elevated tank.
// Every solution calls the engines in ../engine; `final` is computed by the same call (see docs/CE331_AUTHORING.md).
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Step } from '../../components/ui'
import { NumIn } from '../../reference/common'
import { PumpCurvesTable } from '../figs/pump-curves-work'
import { LineChart } from '../figs/pump-chart'
import { PumpWork, Sheet, T, pumpFinal, sg, solvePump, type PCase } from '../figs/pump-work'
import { MassFigures, MassTable } from '../figs/rwh-work'
import { PumpProfile } from '../figs/pump-profile'
import {
  headFromKPa, interp, npshAvailable, operatingPoint, parallel, pipeFromDiameter, powerSI, series, staticHead, totalHead, G_SI, frictionHead, velocityHead,
} from '../engine/pump'
import { RAIN_TABLES, catchmentArea, demandSideBnbc, dryMonths, harvest, monthlyFromLpd, scaleRain, supplySide } from '../engine/rwh'
import { economicTank, galToFt3, tankCost, type GalKind } from '../engine/tank'
import type { EvCheck, EvPartMap } from '../types'

const tx = String.raw

// =================================================================== pumping mains
const lpsTex = (lps: number) => `${sg(lps, 4)}\\text{ L/s}`

/** 2007-08 Q2(b): 950 000 L/h, source RL 20, reservoir RL 50, 1500 m of 250 mm, f 0.01, 66 % */
const c0708: PCase = {
  sys: 'si',
  Q: 950 / 3600,
  d: 0.25,
  f: 0.01,
  L: 1500,
  hs: 50 - 20,
  eta: 0.66,
  power: 'si',
  given: [
    'Deliver 950 000 L/h from a clear-water source (3 m deep, maximum water level RL 20 m) to an elevated reservoir (MWL RL 50 m)',
    'Pipe: L = 1500 m, d = 250 mm; pump centre-line RL 15 m; f = 0.01; pumping-system efficiency 66 %',
  ],
  assume: ['The pump runs continuously (the flow is given per hour), so no pumping-hours step', 'The velocity head is included in the total head, as in the class Example 1'],
  qTex: [tx`Q = \frac{950\,000\text{ L/h}}{3600\text{ s/h} \times 1000} = 0.2639\text{ m}^3/\text{s}\;(${lpsTex((950000 / 3600))})`],
  hsTex: [
    tx`h_s = RL_{\text{reservoir}} - RL_{\text{source water}} = 50 - 20 = 30\text{ m}`,
    tx`\text{The pump axis (RL 15) is 5 m below the source water, so the suction is flooded: nothing is added for suction lift.}`,
  ],
  fig: { sourceWL: 20, sourceBottom: 17, pumpCL: 15, deliveryWL: 50, tankBase: 46, ground: undefined, sourceName: 'source, 3 m deep', tankName: 'elevated reservoir' },
  notes: ['A velocity of about 5.4 m/s is far above the usual 1.5 to 3 m/s for pumping mains, but it is what the 250 mm pipe in the question gives; say so in the script.'],
}

/** 2008-09 Q7(c): 4 ML/day in two 6 h shifts, 1200 m, 1.8 m/s, f 0.009, 68 % */
const c0809: PCase = {
  sys: 'si',
  Q: 4e6 / 1000 / (12 * 3600),
  v: 1.8,
  f: 0.009,
  L: 1200,
  hs: 70 - 30,
  eta: 0.68,
  power: 'si',
  dStd: 260,
  given: [
    '4 million litres per day, pumped in two shifts of 6 h each (12 h a day)',
    'Pump at RL 25 m; bottom of the underground reservoir RL 30 m; elevated reservoir MWL RL 70 m; L = 1200 m',
    'Pump efficiency 68 %, v = 1.8 m/s, f = 0.009',
  ],
  assume: [
    'The depth of water in the underground reservoir is not given: take the lowest water level at its bottom, RL 30 m (worst case, reservoir nearly empty)',
    'The pump (RL 25) is below the water, so the suction is flooded',
    'Velocity head included',
  ],
  qTex: [tx`Q = \frac{4\,000\,000\text{ L/day}}{12\text{ h} \times 3600 \times 1000} = 0.09259\text{ m}^3/\text{s}\;(${lpsTex((4e6 / (12 * 3600)))})`],
  hsTex: [tx`h_s = 70 - 30 = 40\text{ m}\quad(\text{delivery MWL} - \text{lowest water level in the source})`],
  fig: { sourceWL: 30, sourceBottom: 27, pumpCL: 25, deliveryWL: 70, tankBase: 66, sourceName: 'underground reservoir', tankName: 'elevated reservoir' },
}

/** 2009-10 Q6(c): 45 gpcd, 90 000 people, 12 h, v 2.5 m/s, 1100 m, f 0.011, pump 75 %, motor 90 % */
const GAL_L_PAPER = 0.16 * 28.3168
const c0910: PCase = {
  sys: 'si',
  Q: (45 * 90000 * GAL_L_PAPER) / 1000 / (12 * 3600),
  v: 2.5,
  f: 0.011,
  L: 1100,
  hs: 58.5 - 30,
  eta: 0.75,
  etaMotor: 0.9,
  power: 'si',
  dStd: 475,
  given: ['45 gpcd, population 90 000, pumped 12 h a day', 'Reservoir RL at the pump house 30 m; treatment plant RL 58.5 m; v = 2.5 m/s; L = 1100 m; f = 0.011', 'Pump efficiency 75 %, motor efficiency 90 %; minor losses neglected'],
  assume: ['Gallon as in the slides: 1 gal = 0.16 ft³ = 4.53 L', 'The pump lifts from the RL 30 m level to the RL 58.5 m level, so h_s = 28.5 m', 'Velocity head included'],
  qTex: [
    tx`\text{Demand} = 45 \times 90\,000 = 4.05 \times 10^{6}\text{ gal/day} = 4.05 \times 10^{6} \times 4.53 = ${sg((45 * 90000 * GAL_L_PAPER) / 1e6, 4)} \times 10^{6}\text{ L/day}`,
    tx`Q = \frac{${sg(45 * 90000 * GAL_L_PAPER, 5)}}{12 \times 3600 \times 1000} = ${sg((45 * 90000 * GAL_L_PAPER) / 1000 / (12 * 3600), 4)}\text{ m}^3/\text{s}`,
  ],
  hsTex: [tx`h_s = 58.5 - 30 = 28.5\text{ m}`],
  fig: { sourceWL: 30, sourceBottom: 27, pumpCL: 29, deliveryWL: 58.5, tankBase: 55, sourceName: 'reservoir at the pump house', tankName: 'treatment plant' },
}

/** 2011-12 Q2(b): 40 000 people, 100 lpcd, max day 1.5 x avg, 8 h, 1 km, level difference 20 m, v 2 m/s, f 0.01, 70 % */
const c1112: PCase = {
  sys: 'si',
  Q: (40000 * 100 * 1.5) / 1000 / (8 * 3600),
  v: 2,
  f: 0.01,
  L: 1000,
  hs: 20,
  eta: 0.7,
  power: 'si',
  given: ['River 1 km from the reservoir, maximum level difference 20 m', '40 000 people at 100 lpcd; maximum daily demand = 1.5 × average; pump runs 8 h a day', 'Efficiency 70 %, f = 0.01, v = 2 m/s'],
  assume: ['The pump is sized for the maximum daily demand', 'h_s = the 20 m maximum level difference', 'Velocity head included'],
  qTex: [
    tx`\text{Average demand} = 40\,000 \times 100 = 4 \times 10^{6}\text{ L/day};\quad \text{maximum day} = 1.5 \times 4 \times 10^{6} = 6 \times 10^{6}\text{ L/day}`,
    tx`Q = \frac{6 \times 10^{6}}{8 \times 3600 \times 1000} = 0.2083\text{ m}^3/\text{s}\;(208.3\text{ L/s})`,
  ],
  hsTex: [tx`h_s = 20\text{ m}\quad(\text{maximum level difference between river and reservoir})`],
  fig: { sourceWL: 0, sourceBottom: -2, pumpCL: 0.5, deliveryWL: 20, tankBase: 17, sourceName: 'river', tankName: 'reservoir' },
}

/** 2016-17 Q7(c): 40 gpcd, 2.5 million, hs 100 ft, 10 fps, 3000 ft, f 0.01, combined 65 %, 10 h */
const gpmA = (40 * 2.5e6) / (10 * 60)
const c1617: PCase = {
  sys: 'fps',
  Q: (gpmA * 0.16) / 60,
  gpm: gpmA,
  v: 10,
  f: 0.01,
  L: 3000,
  hs: 100,
  eta: 0.65,
  power: 'gpm',
  dStd: 7.5,
  given: ['40 gpcd, population 2.5 million, pumping 10 h a day', 'Static head 100 ft; v = 10 ft/s; L = 3000 ft; f = 0.01; combined efficiency 65 %; minor losses neglected'],
  assume: ['Her slide method for gallons: 1 gal = 0.16 ft³, and water hp = H Q(gpm)/3960', 'The combined (pump + motor) efficiency gives the brake / input power directly'],
  qTex: [
    tx`\text{Demand} = 40 \times 2.5 \times 10^{6} = 10^{8}\text{ gal/day};\quad Q = \frac{10^{8}}{10 \times 60} = ${sg(gpmA, 6)}\text{ gpm}`,
    tx`Q = ${sg(gpmA, 6)} \times \frac{0.16}{60} = ${sg((gpmA * 0.16) / 60, 4)}\text{ ft}^3/\text{s}`,
  ],
  hsTex: [tx`h_s = 100\text{ ft (given)}`],
}

/** 2020-21 Q4(b): 750 000 L/day, 8 h, WT 20 m, drawdown 5 m, tank 30 m high, 4 m deep, 50 m, 200 mm, 70 % */
const c2021: PCase = {
  sys: 'si',
  Q: 750000 / 1000 / (8 * 3600),
  d: 0.2,
  f: 0.01,
  L: 50 + 25 + 30,
  hs: 25 + 30 + 4,
  eta: 0.7,
  power: 'si',
  given: [
    'Daily demand 750 000 L, pumped 8 h a day',
    'Water table 20 m below ground, maximum drawdown 5 m; tank 30 m above ground with water up to 4 m deep; 50 m from the pump station',
    'Suction and discharge pipe 200 mm; pump efficiency 70 %; Darcy friction loss',
  ],
  assume: ['Friction factor not given: f = 0.01, as in the other papers', 'Pipe length = 50 m horizontal + the vertical run from the pumping level to the tank base (25 m + 30 m)', 'Velocity head included; minor losses neglected'],
  qTex: [tx`Q = \frac{750\,000}{8 \times 3600 \times 1000} = 0.02604\text{ m}^3/\text{s}\;(26.04\text{ L/s})`],
  hsTex: [
    tx`\text{Pumping water level} = 20 + 5 = 25\text{ m below ground}`,
    tx`\text{Water surface in the tank} = 30 + 4 = 34\text{ m above ground}`,
    tx`h_s = 25 + 34 = 59\text{ m}`,
  ],
  lTex: [tx`L = 50 + 25 + 30 = 105\text{ m}\;(\text{horizontal} + \text{vertical run})`],
  alts: [{ label: 'Horizontal distance only, L = 50 m', patch: { L: 50 } }],
  fig: { ground: 25, sourceWL: 0, sourceBottom: -3, pumpCL: 0.5, deliveryWL: 59, tankBase: 55, sourceName: 'pumping level', tankName: 'elevated tank' },
}

/** 2021-22 Q1(c): 750 000 L/day, 9 h, reservoir 15 ft below ground, tank 80 ft + 15 ft, v 12 ft/s, 200 ft horizontal, f 0.01, 70 % */
const q2122 = 750000 / 9 / 3600 / 28.3168 // L/s to cfs
const c2122: PCase = {
  sys: 'fps',
  Q: q2122,
  v: 12,
  f: 0.01,
  L: 200 + 110,
  hs: 15 + 80 + 15,
  eta: 0.7,
  power: 'fps',
  given: [
    'Submersible pump in an underground reservoir 15 ft below ground (reservoir height 8 ft); elevated tank 80 ft above ground, 15 ft high',
    '750 000 L/day pumped in 9 h/day; v = 12 ft/s; horizontal pipe length 200 ft; f = 0.01; pump efficiency 70 %; minor losses neglected',
    'Find the water power and the input power',
  ],
  assume: [
    'Water surface in the reservoir 15 ft below ground, tank full: water surface at 80 + 15 = 95 ft above ground',
    'The rising main also climbs the static lift, so L = 200 ft horizontal + 110 ft vertical',
    'The flow is in litres, so hp = γQH/550 with γ = 62.4 lb/ft³ (the same as H Q(US gpm)/3960)',
  ],
  qTex: [tx`Q = \frac{750\,000\text{ L/day}}{9 \times 3600\text{ s}} = 23.15\text{ L/s} = \frac{23.15}{28.32} = ${sg(q2122, 4)}\text{ ft}^3/\text{s}`],
  hsTex: [tx`h_s = 15 + (80 + 15) = 110\text{ ft}\quad(\text{water level in the reservoir to water level in the tank})`],
  lTex: [tx`L = 200 + 110 = 310\text{ ft}\;(\text{horizontal} + \text{vertical})`],
  alts: [
    { label: 'Horizontal length only, L = 200 ft', patch: { L: 200 } },
    { label: 'Reservoir nearly empty (water 8 ft lower), h_s = 118 ft, L = 318 ft', patch: { hs: 118, L: 318 } },
  ],
  fig: { ground: 15, sourceWL: 0, sourceBottom: -8, pumpCL: -7, deliveryWL: 110, tankBase: 95, sourceName: 'underground reservoir', tankName: 'elevated tank' },
}

/** 2022-23 Q1(b): 8000 m3/day, 8 h, RL 200 / 195 / 250, 500 m, f 0.01, 8 ft/s, 75 % */
const c2223: PCase = {
  sys: 'si',
  Q: 8000 / (8 * 3600),
  v: 8 * 0.3048,
  f: 0.01,
  L: 500,
  hs: 250 - 200,
  eta: 0.75,
  power: 'si',
  dStd: 400,
  given: ['8000 m³ a day pumped 8 h a day, from a treatment plant (RL 200 m) through a pump station (RL 195 m) to an elevated tank (RL 250 m)', 'Total pipe length 500 m; f = 0.01; v = 8 ft/s; pump efficiency 75 %'],
  assume: ['v = 8 ft/s = 2.438 m/s', 'The treatment-plant level (RL 200) is the water level the pump draws from, and the pump (RL 195) sits below it: flooded suction', 'The tank level RL 250 is its water surface; velocity head included, minor losses neglected'],
  qTex: [tx`Q = \frac{8000\text{ m}^3}{8 \times 3600\text{ s}} = 0.2778\text{ m}^3/\text{s}\;(1000\text{ m}^3/\text{h})`],
  hsTex: [tx`h_s = 250 - 200 = 50\text{ m}`],
  fig: { sourceWL: 200, sourceBottom: 196, pumpCL: 195, deliveryWL: 250, tankBase: 246, sourceName: 'treatment plant', tankName: 'elevated tank' },
}

/** 2023-24 Q8(b): deep tubewell, 65 gpcd, 3800 people, ground RL 100 ft, reservoir RL 103.5, WT 120 ft, pump 30 ft below WT, 8 h, 700 ft, 8 fps, f 0.01, 70 % */
const gpmB = (65 * 3800) / (8 * 60)
const c2324: PCase = {
  sys: 'fps',
  Q: (gpmB * 0.16) / 60,
  gpm: gpmB,
  v: 8,
  f: 0.01,
  L: 700 + 153.5,
  hs: 103.5 - (100 - 120),
  eta: 0.7,
  power: 'gpm',
  given: [
    'Submersible pump in a deep tubewell; 65 gpcd, population 3800, pumping 8 h a day',
    'Ground RL 100.0 ft, reservoir RL 103.5 ft, water table 120 ft below ground, pump 30 ft below the water table',
    'Horizontal pipe length 700 ft; f = 0.01; v = 8 ft/s; pump efficiency 70 %; minor losses neglected',
  ],
  assume: [
    'Her gallon: 1 gal = 0.16 ft³, and water hp = H Q(gpm)/3960 as on her slides',
    'Water table = pumping water level (drawdown not given); the 30 ft of submergence gives suction pressure, so it is not added to the lift',
    'The discharge column also runs from the pump up to the reservoir: L = 700 ft horizontal + 153.5 ft vertical',
  ],
  qTex: [
    tx`\text{Demand} = 65 \times 3800 = 247\,000\text{ gal/day};\quad Q = \frac{247\,000}{8 \times 60} = ${sg(gpmB, 5)}\text{ gpm}`,
    tx`Q = ${sg(gpmB, 5)} \times \frac{0.16}{60} = ${sg((gpmB * 0.16) / 60, 4)}\text{ ft}^3/\text{s}`,
  ],
  hsTex: [
    tx`\text{Water table RL} = 100 - 120 = -20\text{ ft}`,
    tx`h_s = RL_{\text{reservoir}} - RL_{\text{water table}} = 103.5 - (-20) = 123.5\text{ ft}`,
    tx`\text{Pump axis RL} = -20 - 30 = -50\text{ ft: the pump is submerged, flooded suction}`,
  ],
  lTex: [tx`L = 700 + (103.5 + 50) = 853.5\text{ ft}\;(\text{horizontal} + \text{column from the pump to the reservoir level})`],
  alts: [{ label: 'Horizontal length only, L = 700 ft', patch: { L: 700 } }],
  fig: { ground: 100, sourceWL: -20, sourceBottom: -60, pumpCL: -50, deliveryWL: 103.5, tankBase: 100, sourceName: 'water table (tubewell)', tankName: 'reservoir', submerged: true },
}

// --- Jan 2021 Q6(b): the distance depends on the student ID
const jan6 = (R: number): PCase => ({
  sys: 'fps',
  Q: 25,
  v: 8,
  f: 0.01,
  L: 300 + R + 50,
  hs: 50,
  eta: 0.7,
  power: 'fps',
  dStd: 2,
  given: [
    'Submersible pump in a wet intake well, 50 ft below ground, delivering 25 cusec to a reservoir (300 + R) ft away horizontally',
    'v = 8 ft/s; f = 0.01; pump efficiency 70 %; R = last three digits of the student ID (sample R = ' + R + ')',
  ],
  assume: ['The reservoir water level is at ground level, so h_s = 50 ft (water in the well at the pump level)', 'Pipe length = (300 + R) ft horizontal + 50 ft vertical', 'Velocity head included; minor losses neglected', 'The flow is in cusec, so hp = γQH/550 with γ = 62.4 lb/ft³'],
  qTex: [tx`Q = 25\text{ cusec} = 25\text{ ft}^3/\text{s}`],
  hsTex: [tx`h_s = 50\text{ ft}\quad(\text{from the well water level to ground level})`],
  lTex: [tx`L = (300 + ${R}) + 50 = ${300 + R + 50}\text{ ft}`],
  alts: [{ label: 'Horizontal distance only', patch: { L: 300 + R } }],
  fig: { ground: 50, sourceWL: 0, sourceBottom: -4, pumpCL: -3, deliveryWL: 52, tankBase: 50, sourceName: 'wet intake well', tankName: 'reservoir', submerged: true },
})
function Jan6Sol() {
  const [R, setR] = useState(100)
  return (
    <PumpWork
      c={jan6(R)}
      extra={
        <div className="rounded-lg border border-line bg-panel2/40 px-3 py-2 text-xs flex flex-wrap items-center gap-3">
          <NumIn label="R (last three digits of your ID)" value={R} onChange={(v) => setR(Number.isFinite(v) ? Math.max(0, v) : 0)} step={1} w="w-20" />
          <span className="text-mute">The solution recomputes with your own R.</span>
        </div>
      }
    />
  )
}

/** the numbers a marker looks for in a pumping-main part: Q, the pipe size or velocity, the total head and the power */
const pumpChecks = (c: PCase, withQ = true): EvCheck[] => {
  const { des, pw } = solvePump(c)
  const si = c.sys === 'si'
  const out: EvCheck[] = []
  if (withQ) out.push(si ? { key: 'Q', label: 'Discharge $Q$', value: c.Q * 1000, unit: 'L/s' } : { key: 'Q', label: 'Discharge $Q$', value: c.Q, unit: 'ft³/s' })
  if (c.d != null) out.push({ key: 'v', label: 'Velocity $v$ in the pipe', value: des.pipe.v, unit: si ? 'm/s' : 'ft/s' })
  else out.push(si ? { key: 'd', label: 'Pipe diameter $d$', value: des.pipe.d * 1000, unit: 'mm' } : { key: 'd', label: 'Pipe diameter $d$', value: des.pipe.d, unit: 'ft' })
  out.push({ key: 'H', label: 'Total head $H$', value: des.H, unit: si ? 'm' : 'ft' })
  if (si) {
    out.push({ key: 'Pw', label: 'Water power', value: pw.waterKW, unit: 'kW' })
    out.push(pw.motorKW != null ? { key: 'Pm', label: 'Motor input power', value: pw.motorKW, unit: 'kW' } : { key: 'Pin', label: 'Pump input power', value: pw.inputKW, unit: 'kW' })
  } else {
    out.push({ key: 'Pw', label: 'Water horsepower', value: pw.waterHp, unit: 'hp' })
    out.push({ key: 'Pin', label: 'Input horsepower', value: pw.inputHp, unit: 'hp' })
  }
  return out
}
const pumpPart = (c: PCase, topics: EvPartMap['topics'] = ['ev-pump'], flag?: string): EvPartMap => ({ topics, ans: [], from: ['ce22'], final: pumpFinal(c), Sol: () => <PumpWork c={c} />, checks: () => pumpChecks(c), flag })

// =================================================================== 2012-13 Q3(b): power and NPSH
const npshCase = (Ls: number) => {
  const Q = 0.2
  const d = 0.25
  const pipe = pipeFromDiameter(Q, d)
  const sumK = 0.1 + 2 * 0.2 + 2 * 0.25 + 0.04
  const gamma = 9.982
  const h = totalHead({ hs: 60 - 38, f: 0.022, L: 30, v: pipe.v, d, g: G_SI, sumK })
  const pw = powerSI(Q, h.H, 1, { gamma })
  const hv = velocityHead(pipe.v, G_SI)
  const hLs = frictionHead(0.022, Ls, pipe.v, d, G_SI) + 0.04 * hv
  const hLall = h.hf + h.hm
  const Habs = headFromKPa(101.3, gamma * 1000)
  const Hvp = headFromKPa(2.3, gamma * 1000)
  const st = staticHead({ sourceWL: 38, pumpCL: 40, deliveryWL: 60 })
  const npsh = npshAvailable({ Habs, Hs: st.Hs, hL: hLs, Hvp })
  const npshWorst = npshAvailable({ Habs, Hs: st.Hs, hL: hLall, Hvp })
  return { pipe, sumK, h, pw, hv, hLs, hLall, Habs, Hvp, st, npsh, npshWorst, gamma }
}
const npshFinal = () => {
  const r = npshCase(5)
  return `v = ${sg(r.pipe.v, 3)} m/s; H = ${sg(r.h.H, 4)} m; power supplied to the flow ${sg(r.pw.waterKW, 3)} kW (${sg(r.pw.waterHp, 3)} hp); NPSH available ≈ ${sg(r.npsh, 3)} m (with 5 m of suction pipe; ${sg(r.npshWorst, 3)} m if all the losses were on the suction side)`
}
function NpshSol() {
  const [Ls, setLs] = useState(5)
  const r = npshCase(Ls)
  return (
    <Sheet
      given={[
        'Q = 0.2 m³/s of water at 20 °C through a 25 cm steel pipe; wet-well level 38 m, pump at 40 m, discharge level 60 m (all above m.s.l.)',
        'Total pipe length 30 m; f = 0.022; K: gate valve 0.10, two 45° elbows 0.20 each, two 90° elbows 0.25 each, entrance bell 0.04',
        'γ = 9982 N/m³; vapour pressure 2.3 kPa; atmospheric pressure 101.3 kPa',
      ]}
      assume={['"Power supplied by the pump" is the water power γQH (no efficiency is given)', 'Only the entrance bell and a short suction pipe are on the suction side; the paper does not split the 30 m, so the suction length is an input below (sample 5 m)', 'The velocity head V²/2g at the discharge is counted once (it is the exit loss), as in her total-head formula']}
      after={
        <div className="space-y-3 mb-3">
          <div className="rounded-xl border border-line p-2 bg-panel2/30">
            <PumpProfile unit="m" sourceWL={38} sourceBottom={35} pumpCL={40} deliveryWL={60} tankBase={57} hf={r.h.hf} hv={r.h.hv} hm={r.h.hm} sourceName="wet well" tankName="discharge unit" />
          </div>
          <div className="rounded-lg border border-line bg-panel2/40 px-3 py-2 text-xs flex flex-wrap items-center gap-3">
            <NumIn label="Suction pipe length" value={Ls} onChange={(v) => setLs(Number.isFinite(v) ? Math.min(30, Math.max(0, v)) : 0)} step={1} unit="m" w="w-16" />
            <span className="text-mute">NPSH recomputes; the power does not depend on it.</span>
          </div>
        </div>
      }
      answer={<>{npshFinal()}</>}
      notes={['If the whole 30 m and every fitting were counted on the suction side (the worst case) NPSH available would be ' + sg(r.npshWorst, 3) + ' m; the manufacturer\'s NPSH required must be at least 1 m less than the figure you quote.']}
    >
      <Step n={1} title="Velocity and velocity head">
        <T>{tx`A = \frac{\pi (0.25)^2}{4} = ${sg(r.pipe.A, 4)}\text{ m}^2,\qquad v = \frac{Q}{A} = \frac{0.2}{${sg(r.pipe.A, 4)}} = ${sg(r.pipe.v, 4)}\text{ m/s}`}</T>
        <T>{tx`\frac{v^2}{2g} = \frac{${sg(r.pipe.v, 4)}^2}{2 \times 9.81} = ${sg(r.hv, 4)}\text{ m}`}</T>
      </Step>
      <Step n={2} title="Static head from the levels">
        <T>{tx`h_s = 60 - 38 = 22\text{ m}\qquad(\text{pump axis 2 m above the wet-well level: a lift suction, } H_S = -2\text{ m})`}</T>
      </Step>
      <Step n={3} title="Losses">
        <T>{tx`h_f = f\frac{L}{d}\frac{v^2}{2g} = 0.022 \times \frac{30}{0.25} \times ${sg(r.hv, 4)} = ${sg(r.h.hf, 4)}\text{ m}`}</T>
        <T>{tx`\sum K = 0.10 + 2(0.20) + 2(0.25) + 0.04 = ${sg(r.sumK, 3)},\qquad h_m = \sum K\frac{v^2}{2g} = ${sg(r.h.hm, 4)}\text{ m}`}</T>
      </Step>
      <Step n={4} title="Total head and power">
        <T>{tx`H = h_s + \frac{v^2}{2g} + h_f + h_m = 22 + ${sg(r.hv, 4)} + ${sg(r.h.hf, 4)} + ${sg(r.h.hm, 4)} = ${sg(r.h.H, 4)}\text{ m}`}</T>
        <T>{tx`P = \gamma Q H = 9982 \times 0.2 \times ${sg(r.h.H, 4)} = ${sg(r.pw.waterKW * 1000, 5)}\text{ W} = ${sg(r.pw.waterKW, 4)}\text{ kW} = ${sg(r.pw.waterHp, 3)}\text{ hp}`}</T>
      </Step>
      <Step n={5} title="Net positive suction head available">
        <T>{tx`H_{abs} = \frac{101.3 \times 10^{3}}{9982} = ${sg(r.Habs, 4)}\text{ m},\qquad H_{vp} = \frac{2.3 \times 10^{3}}{9982} = ${sg(r.Hvp, 3)}\text{ m}`}</T>
        <T>{tx`h_L = h_{f,suction} + K_{bell}\frac{v^2}{2g} = 0.022 \times \frac{${sg(Ls, 3)}}{0.25} \times ${sg(r.hv, 4)} + 0.04 \times ${sg(r.hv, 4)} = ${sg(r.hLs, 4)}\text{ m}`}</T>
        <T>{tx`NPSH_{av} = H_{abs} + H_S - h_L - H_{vp} = ${sg(r.Habs, 4)} - 2 - ${sg(r.hLs, 3)} - ${sg(r.Hvp, 3)} = ${sg(r.npsh, 4)}\text{ m}`}</T>
      </Step>
    </Sheet>
  )
}

// =================================================================== 2012-13 Q1(b): pump curves, parallel and series
const PUMP_PTS: [number, number][] = [[0, 40], [0.02, 39], [0.04, 36], [0.06, 29], [0.08, 20], [0.1, 8]]
const SYS_PTS: [number, number][] = [[0, 30], [0.02, 32], [0.04, 34], [0.06, 37], [0.08, 40], [0.1, 44]]
function curvesCase() {
  const p = interp(PUMP_PTS)
  const smin = interp(SYS_PTS)
  const smax = (Q: number) => smin(Q) + 2
  const cfg = [
    { name: 'One pump', c: p, hi: 0.1 },
    { name: 'Two in parallel', c: parallel(p), hi: 0.2 },
    { name: 'Two in series', c: series(p), hi: 0.1 },
  ]
  const rows = cfg.map((k) => ({ name: k.name, min: operatingPoint(k.c, smin, 0, k.hi)!, max: operatingPoint(k.c, smax, 0, k.hi)! }))
  return { p, smin, smax, rows }
}
const curvesFinal = () => {
  const r = curvesCase().rows
  return r.map((x) => `${x.name.toLowerCase()}: min level ${sg(x.min.Q, 3)} m³/s at ${sg(x.min.H, 3)} m, max level ${sg(x.max.Q, 3)} m³/s at ${sg(x.max.H, 3)} m`).join('; ')
}
function CurvesSol() {
  const { p, smin, smax, rows } = curvesCase()
  const grid = Array.from({ length: 41 }, (_, i) => i * 0.005)
  const cols = ['var(--c-accent)', 'var(--c-accent2)', 'var(--c-good)']
  const mkPts = (f: (Q: number) => number, hi: number) => grid.filter((q) => q <= hi + 1e-9).map((q) => [q, f(q)] as [number, number])
  return (
    <Sheet
      given={['Pump head–capacity data and system head–capacity data at the minimum reservoir level (table in the question)', 'Maximum minus minimum reservoir level = 2 m']}
      assume={['Both curves are read as straight lines between the tabulated points', 'At the maximum reservoir level the whole system curve moves up by the 2 m of extra static head', 'Two identical pumps: in parallel the capacities add at the same head, H(Q) = H₁(Q/2); in series the heads add at the same capacity, H(Q) = 2H₁(Q)']}
      answer={<>{curvesFinal()}</>}
      after={
        <div className="space-y-3 mb-3">
          <div className="rounded-xl border border-line p-2">
            <LineChart
              series={[
                { pts: mkPts(p, 0.1), color: cols[0], label: 'one pump' },
                { pts: mkPts(parallel(p), 0.2), color: cols[1], label: 'two in parallel', dash: '7 4' },
                { pts: mkPts((Q) => 2 * p(Q), 0.1), color: cols[2], label: 'two in series', dash: '2 3' },
                { pts: mkPts(smin, 0.15), color: 'var(--c-ink)', label: 'system, minimum level' },
                { pts: mkPts(smax, 0.15), color: 'var(--c-bad)', label: 'system, maximum level' },
              ]}
              xmax={0.15}
              ymax={80}
              xlabel="capacity (m³/s)"
              ylabel="head (m)"
              marks={rows.flatMap((r, i) => [
                { x: r.min.Q, y: r.min.H, color: cols[i] },
                { x: r.max.Q, y: r.max.H, color: cols[i] },
              ])}
            />
          </div>
          <PumpCurvesTable rows={rows} />
        </div>
      }
    >
      <Step n={1} title="Draw the pump curve and the two system curves">
        <T>{tx`H_{sys,max}(Q) = H_{sys,min}(Q) + 2`}</T>
      </Step>
      <Step n={2} title="One pump: where H_pump = H_system">
        <T>{tx`\text{minimum level: } Q = ${sg(rows[0].min.Q, 3)}\text{ m}^3/\text{s},\; H = ${sg(rows[0].min.H, 3)}\text{ m};\qquad \text{maximum level: } Q = ${sg(rows[0].max.Q, 3)},\; H = ${sg(rows[0].max.H, 3)}`}</T>
      </Step>
      <Step n={3} title="Two pumps in parallel: add the capacities at each head">
        <T>{tx`\text{minimum level: } Q = ${sg(rows[1].min.Q, 3)},\; H = ${sg(rows[1].min.H, 3)};\qquad \text{maximum level: } Q = ${sg(rows[1].max.Q, 3)},\; H = ${sg(rows[1].max.H, 3)}`}</T>
        <div className="text-xs text-mute">The capacity is less than twice the single-pump value ({sg(2 * rows[0].min.Q, 3)}) because the larger flow loses more head in the pipes.</div>
      </Step>
      <Step n={4} title="Two pumps in series: add the heads at each capacity">
        <T>{tx`\text{minimum level: } Q = ${sg(rows[2].min.Q, 3)},\; H = ${sg(rows[2].min.H, 3)};\qquad \text{maximum level: } Q = ${sg(rows[2].max.Q, 3)},\; H = ${sg(rows[2].max.H, 3)}`}</T>
      </Step>
    </Sheet>
  )
}

// =================================================================== rainwater harvesting
const lpd715 = 7 * 45 + 40 * 10

/** Jan 2021 Q1(b): clinic, A = R + 150 */
const janRwh = (R: number) => {
  const area = R + 150
  const C = 0.8
  const rain = RAIN_TABLES[1].rain
  return { R, area, C, rain, s: supplySide({ area, C, rain, demandPerMonth: monthlyFromLpd(lpd715) }) }
}
const janFinal = () => {
  const r = janRwh(100)
  return `Tank ≈ ${sg(r.s.tank, 4)} m³ (sample R = 100: A = ${r.area} m², harvest ${sg(r.s.annualHarvest, 4)} m³/yr; ${r.s.supplyGoverns ? 'supply governs, demand cut to ' + sg(r.s.demandUsed, 4) + ' m³/month' : 'demand met in full'}; largest gap in ${r.s.maxDiffMonth})`
}
function SupplySteps({ s, from, area, C }: { s: ReturnType<typeof supplySide>; from: number; area: number; C: number }) {
  void area
  void C
  return (
    <>
      <Step n={from} title="Annual harvest against annual demand">
        <T>{tx`V_{harvest} = A \times R \times C = ${sg(area, 5)} \times ${sg(s.rows.reduce((a, r) => a + r.rain, 0) / 1000, 4)} \times ${C} = ${sg(s.annualHarvest, 5)}\text{ m}^3/\text{yr}`}</T>
        <T>{tx`\text{Demand asked} = ${sg(s.demandAsked, 4)}\text{ m}^3/\text{month} \times 12 = ${sg(s.demandAsked * 12, 5)}\text{ m}^3/\text{yr}`}</T>
        {s.supplyGoverns ? (
          <div className="text-sm">
            The demand exceeds the supply, so the supply side governs: the demand is replaced by {sg(s.annualHarvest, 5)}/12 = <b>{sg(s.demandUsed, 4)} m³ per month</b>, constant through the year.
          </div>
        ) : (
          <div className="text-sm">The roof gives more than is asked for, so the demand of {sg(s.demandUsed, 4)} m³ per month is met in full; the tank only has to carry the dry months.</div>
        )}
      </Step>
      <Step n={from + 1} title={`Mass-curve table, starting in ${s.rows[0].month} (the tank is empty at the start)`}>
        <MassTable s={s} />
        <div className="text-xs text-mute mt-1">harvest = A × rain × C; difference = cumulative harvest − cumulative demand.</div>
      </Step>
      <Step n={from + 2} title="Storage = the largest value of the difference column">
        <T>{tx`V_{tank} = \max(\text{difference}) = ${sg(s.maxDiff, 4)}\text{ m}^3\quad(\text{${s.maxDiffMonth}})`}</T>
        {Math.abs(s.tank - s.maxDiff) > 0.01 && <div className="text-xs text-mute">The roof is plentiful, so the largest dry-spell shortfall (running deficit) is what the tank must hold: {sg(s.tank, 4)} m³.</div>}
      </Step>
    </>
  )
}
function JanSol() {
  const [R, setR] = useState(100)
  const r = janRwh(R)
  return (
    <Sheet
      given={[
        'Community clinic: 7 staff at 45 L/c/d and 40 patients a day at 10 L/c/d',
        'Roof area = (last three digits of the student number + 150) m²; C = 0.8; rainfall 1032 mm a year, monthly values in the table (Jan 14 … Dec 3)',
      ]}
      assume={['Roof area uses a sample R = ' + R + ' (change it below); the answer recomputes', 'Mean month = 365/12 days', 'The year is started where the tank is empty (end of the dry spell), as in the class example']}
      after={
        <div className="space-y-3 mb-3">
          <MassFigures s={r.s} />
          <div className="rounded-lg border border-line bg-panel2/40 px-3 py-2 text-xs flex flex-wrap items-center gap-3">
            <NumIn label="R (last three digits of your ID)" value={R} onChange={(v) => setR(Number.isFinite(v) ? Math.max(0, v) : 0)} step={1} w="w-20" />
            <span className="text-mute">roof area = {R + 150} m²</span>
          </div>
        </div>
      }
      answer={<>Tank ≈ {sg(r.s.tank, 4)} m³ (R = {R}: A = {r.area} m², harvest {sg(r.s.annualHarvest, 4)} m³/yr)</>}
    >
      <Step n={1} title="Demand">
        <T>{tx`7 \times 45 + 40 \times 10 = ${lpd715}\text{ L/day} = ${sg(monthlyFromLpd(lpd715), 4)}\text{ m}^3\text{ per mean month}`}</T>
      </Step>
      <Step n={2} title="Roof area">
        <T>{tx`A = ${R} + 150 = ${r.area}\text{ m}^2`}</T>
      </Step>
      <SupplySteps s={r.s} from={3} area={r.area} C={r.C} />
    </Sheet>
  )
}

/** 2020-21 Q3(b): two-level building, demand and supply approach */
const rw2021 = () => {
  const cat = catchmentArea({ terraces: [22 * 15, 22 * 6], walls: [8 * 22] })
  const C = 0.8
  const rain = RAIN_TABLES[2].rain
  const users = 36
  const bn = demandSideBnbc({ users, potable: 20, other: 100 })
  const lpd = users * 120
  const s = supplySide({ area: cat.total, C, rain, demandPerMonth: monthlyFromLpd(lpd) })
  return { cat, C, rain, users, bn, lpd, s }
}
const rw2021Final = () => {
  const r = rw2021()
  return `Demand side: ${sg(r.bn.designM3, 4)} m³ (BNBC 90 / 210 days + 10 %); supply side: ${sg(r.s.tank, 4)} m³ (A = ${sg(r.cat.total, 4)} m², harvest ${sg(r.s.annualHarvest, 5)} m³/yr); the supply-side tank is the economical one`
}
function Rw2021Sol() {
  const r = rw2021()
  return (
    <Sheet
      given={[
        'Two-level six-storey concrete building (Figure 1): upper roof 22 m × 15 m, lower roof strip 22 m × 6 m, step between them 8 m high',
        '36 residents; potable demand 20 lpcd, non-potable 100 lpcd; monthly rainfall in Table 1 (total 2435 mm)',
        'Underground tank, demand-side and supply-side approaches; which is more economical?',
      ]}
      assume={['Concrete roof: C = 0.8 (RM L6 p8 range 0.6–0.8)', 'BNBC catchment: plan area of both terraces plus 50 % of the 8 m wall between them', 'Both terraces drain to the one tank; no first-flush loss deducted', 'Demand-side days from BNBC: 90 for potable, 210 for other uses']}
      after={
        <div className="space-y-3 mb-3">
          <MassFigures s={r.s} />
        </div>
      }
      answer={<>{rw2021Final()}</>}
    >
      <Step n={1} title="Catchment area (BNBC 2020)">
        <T>{tx`A = 22 \times 15 + 22 \times 6 + 0.5 \times (8 \times 22) = 330 + 132 + 88 = ${sg(r.cat.total, 4)}\text{ m}^2`}</T>
      </Step>
      <Step n={2} title="Demand-side approach: V = n d q">
        <T>{tx`V = n(d_p q_p + d_o q_o) = 36(90 \times 20 + 210 \times 100) = ${sg(r.bn.V, 6)}\text{ L}`}</T>
        <T>{tx`V_{design} = 1.10 \times ${sg(r.bn.V / 1000, 5)} = ${sg(r.bn.designM3, 5)}\text{ m}^3\;(10\%\text{ freeboard})`}</T>
        <div className="text-sm">
          Check against what the roof can fill: the whole year's harvest is only {sg(r.s.annualHarvest, 5)} m³, and a tank of {sg(r.bn.designM3, 4)} m³ would have to catch {sg((r.bn.designM3 / r.s.annualHarvest) * 100, 3)} % of it.
        </div>
      </Step>
      <SupplySteps s={r.s} from={3} area={r.cat.total} C={r.C} />
      <Step n={6} title="Which approach to adopt?">
        <div className="text-sm">
          The annual demand ({sg((r.lpd * 365) / 1000, 5)} m³) is more than the roof can supply ({sg(r.s.annualHarvest, 5)} m³), so the supply side governs. The supply-side tank ({sg(r.s.tank, 4)} m³) is the economical one: it is
          {' '}{sg((1 - r.s.tank / r.bn.designM3) * 100, 3)} % smaller than the demand-side tank, which would hardly ever fill, and it is sized for the water that really falls. Put the potable and non-potable shares of the harvest through the dual plumbing.
        </div>
      </Step>
    </Sheet>
  )
}

/** 2021-22 Q8(c): 7-storey, 2340 m2, 2918 mm; occupancy assumed */
const rw2122 = (n: number, qp: number, qo: number, C: number) => {
  const area = 2340
  const rain = RAIN_TABLES[3].rain
  const lpd = n * (qp + qo)
  const bn = demandSideBnbc({ users: n, potable: qp, other: qo })
  const s = supplySide({ area, C, rain, demandPerMonth: monthlyFromLpd(lpd) })
  return { area, rain, lpd, bn, s, C }
}
const rw2122Final = () => {
  const r = rw2122(140, 20, 100, 0.8)
  return `Tank ≈ ${sg(r.s.tank, 4)} m³ (assumed 140 people at 20 + 100 lpcd, C = 0.8: harvest ${sg(r.s.annualHarvest, 5)} m³/yr, ${r.s.supplyGoverns ? 'supply governs' : 'demand governs'}); demand-side check ${sg(r.bn.designM3, 4)} m³`
}
function Rw2122Sol() {
  const [n, setN] = useState(140)
  const [qp, setQp] = useState(20)
  const [qo, setQo] = useState(100)
  const [C, setC] = useState(0.8)
  const r = rw2122(n, qp, qo, C)
  return (
    <Sheet
      given={['7-storey residential building, roof area 2340 m²; annual rainfall 2918 mm with the monthly distribution given (Jan 5.6 … Dec 11.9)', 'Recommend a rainwater storage tank size; assume any reasonable data']}
      assume={['Concrete roof, C = 0.8', 'Occupancy is not given: sample 140 people (7 floors × 4 flats × 5), potable 20 and non-potable 100 lpcd; change the inputs below', 'Roof taken as the catchment (no wall share)']}
      after={
        <div className="space-y-3 mb-3">
          <MassFigures s={r.s} />
          <div className="rounded-lg border border-line bg-panel2/40 px-3 py-2 text-xs flex flex-wrap items-center gap-x-4 gap-y-2">
            <NumIn label="People" value={n} onChange={(v) => setN(Number.isFinite(v) ? Math.max(1, v) : 1)} step={10} w="w-16" />
            <NumIn label="Potable" value={qp} onChange={(v) => setQp(Number.isFinite(v) ? Math.max(0, v) : 0)} step={5} unit="lpcd" w="w-14" />
            <NumIn label="Non-potable" value={qo} onChange={(v) => setQo(Number.isFinite(v) ? Math.max(0, v) : 0)} step={5} unit="lpcd" w="w-14" />
            <NumIn label="C" value={C} onChange={(v) => setC(Number.isFinite(v) ? Math.min(1, Math.max(0.1, v)) : 0.8)} step={0.05} w="w-14" />
          </div>
        </div>
      }
      answer={<>Tank ≈ {sg(r.s.tank, 4)} m³ ({r.s.supplyGoverns ? 'supply side governs' : 'demand side governs'}; demand-side check {sg(r.bn.designM3, 4)} m³)</>}
    >
      <Step n={1} title="Demand">
        <T>{tx`${n} \times (${qp} + ${qo}) = ${sg(r.lpd, 6)}\text{ L/day} = ${sg(monthlyFromLpd(r.lpd), 4)}\text{ m}^3\text{ per mean month}`}</T>
      </Step>
      <SupplySteps s={r.s} from={2} area={r.area} C={r.C} />
      <Step n={5} title="Demand-side check (BNBC 90 / 210 days)">
        <T>{tx`V = ${n}(90 \times ${qp} + 210 \times ${qo}) = ${sg(r.bn.V, 6)}\text{ L},\quad 1.10 V = ${sg(r.bn.designM3, 5)}\text{ m}^3`}</T>
        <div className="text-sm">Take the smaller of the two, since a tank bigger than the roof can fill is wasted: recommend about {sg(Math.min(r.s.tank, r.bn.designM3), 3)} m³.</div>
      </Step>
    </Sheet>
  )
}

/** 2022-23 Q2(a): annual rainfall only; figure in ft */
const rw2223 = () => {
  const ft2 = 0.092903
  const cat = catchmentArea({ terraces: [30 * 20 * ft2, 30 * 15 * ft2], walls: [(35 - 25) * 30 * ft2] })
  const C = 0.8
  const rain = scaleRain(RAIN_TABLES[1].rain, 1100)
  const s = supplySide({ area: cat.total, C, rain, demandPerMonth: Infinity })
  return { ft2, cat, C, rain, s }
}
const rw2223Final = () => {
  const r = rw2223()
  return `Tank ≈ ${sg(r.s.tank, 3)} m³ (catchment ${sg(r.cat.total, 4)} m² = ${sg(r.cat.total / r.ft2, 4)} ft², harvest ${sg(r.s.annualHarvest, 4)} m³/yr; monthly pattern assumed)`
}
function Rw2223Sol() {
  const r = rw2223()
  return (
    <Sheet
      given={['Two-step concrete building (Figure 1, feet): upper roof 30′ × 20′, lower roof strip 30′ × 15′, lower block 25′ high, upper block 35′ high', 'Average annual rainfall 1100 mm; find the volume of the storage tank']}
      assume={[
        'Concrete roof, C = 0.8; the lower strip is 30′ long (the paper does not label it)',
        'Only the annual rainfall is given, so the monthly pattern of the Jan 2021 table (a typical Bangladesh year) is scaled to 1100 mm',
        'No demand is given: the tank is sized to deliver the whole annual harvest evenly through the year (supply side governs)',
      ]}
      after={
        <div className="space-y-3 mb-3">
          <MassFigures s={r.s} />
        </div>
      }
      answer={<>{rw2223Final()}</>}
      notes={['The paper gives no monthly rainfall and no demand; this answer is only as good as those two assumptions.']}
    >
      <Step n={1} title="Catchment area (BNBC 2020)">
        <T>{tx`A = 30(20) + 30(15) + 0.5 \times 30(35 - 25) = 600 + 450 + 150 = 1200\text{ ft}^2 = ${sg(r.cat.total, 4)}\text{ m}^2`}</T>
      </Step>
      <Step n={2} title="Annual harvest">
        <T>{tx`V = A R C = ${sg(r.cat.total, 4)} \times 1.100 \times 0.8 = ${sg(r.s.annualHarvest, 4)}\text{ m}^3/\text{yr}`}</T>
      </Step>
      <Step n={3} title="Monthly harvest and mass curve">
        <MassTable s={r.s} />
      </Step>
      <Step n={4} title="Storage">
        <T>{tx`V_{tank} = \max(\text{difference}) = ${sg(r.s.maxDiff, 3)}\text{ m}^3\quad(\text{${r.s.maxDiffMonth}})`}</T>
      </Step>
    </Sheet>
  )
}

/** 2023-24 Q3(d): 7 people, 15 lpcd, 150 m2, 1070 mm, C 0.7, 3 dry months */
const rw2324 = () => {
  const dm = dryMonths({ users: 7, perCapita: 15, months: 3 })
  const harv = harvest(150, 1070, 0.7)
  return { dm, harv, yearDemand: (7 * 15 * 365) / 1000 }
}
const rw2324Final = () => {
  const r = rw2324()
  return `V = ${sg(r.dm.V, 5)} L + 10 % = ${sg(r.dm.design, 5)} L ≈ ${sg(r.dm.designM3, 3)} m³ (the roof gives ${sg(r.harv, 4)} m³/yr against ${sg(r.yearDemand, 3)} m³/yr demand)`
}
function Rw2324Sol() {
  const r = rw2324()
  return (
    <Sheet
      given={['Household of 7; drinking and cooking demand 15 lpcd; concrete roof 150 m²; annual rainfall 1070 mm; C = 0.7', 'Tank for 3 dry months of storage']}
      assume={['3 dry months = 3 × 30 = 90 days (BNBC: 90 days for drinking, cooking, utensil cleaning, bathing and ablution)', '10 % freeboard as on the slide']}
      answer={<>{rw2324Final()}</>}
    >
      <Step n={1} title="Demand-side volume V = n d q">
        <T>{tx`V = 7 \times 90 \times 15 = ${sg(r.dm.V, 5)}\text{ L}`}</T>
      </Step>
      <Step n={2} title="Freeboard">
        <T>{tx`V_{design} = 1.10 \times ${sg(r.dm.V, 5)} = ${sg(r.dm.design, 5)}\text{ L} = ${sg(r.dm.designM3, 4)}\text{ m}^3`}</T>
      </Step>
      <Step n={3} title="Can the roof fill it?">
        <T>{tx`V_{harvest} = A R C = 150 \times 1.070 \times 0.7 = ${sg(r.harv, 4)}\text{ m}^3/\text{yr}`}</T>
        <div className="text-sm">
          The annual demand is {sg(r.yearDemand, 3)} m³ and the harvest is {sg(r.harv, 4)} m³, so the roof supplies about {sg(r.harv / r.yearDemand, 2)} times the demand and the rains of the wet months will refill the {sg(r.dm.designM3, 3)} m³ tank. Adopt a tank of about
          {' '}{sg(Math.ceil(r.dm.designM3 * 10) / 10, 3)} m³ (10.4 m³).
        </div>
      </Step>
    </Sheet>
  )
}

// =================================================================== economic dimensions of an elevated tank
interface TankCase {
  gal: number
  kind: GalKind
  cf: number
  cw: number
  given: string[]
  assume?: string[]
}
const tankSol = (c: TankCase) => {
  const V = galToFt3(c.gal, c.kind)
  return { V, t: economicTank(V, c.cf, c.cw) }
}
const tankFinal = (c: TankCase) => {
  const { t } = tankSol(c)
  return `D = ${sg(t.D, 4)} ft, H = ${sg(t.H, 4)} ft (H = D/${sg(t.D / t.H, 3)}); cost Tk ${sg(t.cost, 5)}`
}
function TankWork({ c }: { c: TankCase }) {
  const { V, t } = tankSol(c)
  const gk = c.kind === 'british' ? 0.16 : 0.1337
  return (
    <Sheet
      given={c.given}
      assume={[
        c.kind === 'british' ? 'Gallon as on her slides: 1 gal = 0.16 ft³' : 'US gallon: 1 gal = 0.1337 ft³ (7.48 gal/ft³)',
        'Only the floor and the wall of the shell are costed, per sft of concrete work (the roof slab and the legs are left out)',
        ...(c.assume ?? []),
      ]}
      notes={['Textbook method (not in this term\'s slides): minimise cost with the volume fixed. The result depends only on the ratio of the two unit costs.']}
      after={
        <div className="space-y-3 mb-3">
          <div className="rounded-xl border border-line p-2">
            <LineChart
              series={[{ pts: Array.from({ length: 61 }, (_, i) => { const D = t.D * (0.5 + (i / 60) * 1.1); return [D, tankCost(V, D, c.cf, c.cw).cost / 1000] as [number, number] }), color: 'var(--c-accent2)', label: 'floor + wall cost' }]}
              xmin={t.D * 0.5}
              xmax={t.D * 1.6}
              ymin={0}
              ymax={Math.ceil((tankCost(V, t.D * 0.5, c.cf, c.cw).cost / 1000) * 1.05)}
              xlabel="diameter D (ft)"
              ylabel="cost (Tk thousand)"
              marks={[{ x: t.D, y: t.cost / 1000, label: `minimum at D = ${fmt(t.D, 1)} ft`, color: 'var(--c-good)', dx: 10, dy: -12 }]}
              height={230}
            />
          </div>
        </div>
      }
      answer={<>{tankFinal(c)}</>}
    >
      <Step n={1} title="Volume">
        <T>{tx`V = ${sg(c.gal, 6)} \times ${gk} = ${sg(V, 6)}\text{ ft}^3`}</T>
      </Step>
      <Step n={2} title="Cost in terms of D (H eliminated)">
        <T>{tx`H = \frac{4V}{\pi D^2},\qquad C = c_f \frac{\pi D^2}{4} + c_w \pi D H = c_f \frac{\pi D^2}{4} + \frac{4 c_w V}{D}`}</T>
      </Step>
      <Step n={3} title="Minimise">
        <T>{tx`\frac{dC}{dD} = c_f \frac{\pi D}{2} - \frac{4 c_w V}{D^2} = 0 \;\Rightarrow\; D^3 = \frac{8 c_w V}{\pi c_f} \;\Rightarrow\; H = \frac{c_f}{2 c_w} D`}</T>
      </Step>
      <Step n={4} title="Numbers">
        <T>{tx`D^3 = \frac{8 \times ${c.cw} \times ${sg(V, 6)}}{\pi \times ${c.cf}} = ${sg(t.D ** 3, 6)}\;\Rightarrow\; D = ${sg(t.D, 4)}\text{ ft}`}</T>
        <T>{tx`H = \frac{${c.cf}}{2 \times ${c.cw}} \times ${sg(t.D, 4)} = ${sg(t.H, 4)}\text{ ft}`}</T>
        <T>{tx`\text{Check: } \frac{\pi D^2 H}{4} = ${sg((Math.PI * t.D * t.D * t.H) / 4, 6)}\text{ ft}^3 \approx V`}</T>
      </Step>
      <Step n={5} title="Cost">
        <T>{tx`C = ${c.cf} \times ${sg(t.floorArea, 5)} + ${c.cw} \times ${sg(t.wallArea, 5)} = \text{Tk } ${sg(t.floorCost, 5)} + ${sg(t.wallCost, 5)} = \text{Tk } ${sg(t.cost, 6)}`}</T>
        <div className="text-xs text-mute">At the optimum the floor costs half what the wall costs, and the tank is {sg(t.D, 3)} ft across and {sg(t.H, 3)} ft deep. Round to D = {Math.round(t.D)} ft, H = {sg(t.H, 3)} ft.</div>
      </Step>
    </Sheet>
  )
}
const TANKS: Record<string, TankCase> = {
  '2020-21-2c': { gal: 100000, kind: 'british', cf: 1200, cw: 1800, given: ['Elevated cylindrical tank of 1 lac gallon capacity', 'Concrete work per sft: floor Tk 1200, wall of the shell Tk 1800'] },
  '2009-10-1d': { gal: 200000, kind: 'british', cf: 300, cw: 400, given: ['Rajuk: 2 lac gallon overhead cylindrical tank, Uttara', 'Concrete work per sft: floor Tk 300, wall Tk 400'] },
  '2011-12-8d': { gal: 200000, kind: 'us', cf: 300, cw: 400, given: ['Cylindrical overhead tank of 0.20 million gallons (US)'], assume: ['Unit costs are not given: floor Tk 300 and wall Tk 400 per sft (as in 2009-10); the dimensions depend only on their ratio'] },
  '2016-17-6c': { gal: 200000, kind: 'us', cf: 500, cw: 750, given: ['Elevated cylindrical tank of 2 lac US gallons', 'Concrete work per sft: floor Tk 500, wall Tk 750'] },
}
const tankPart = (k: string): EvPartMap => ({
  topics: ['ev-dist'],
  ans: [],
  from: ['textbook'],
  flag: 'The economic-dimension method is not in Rowshan ma\'am\'s or Snigdha ma\'am\'s CE22 slides; this is the standard textbook minimisation.',
  final: tankFinal(TANKS[k]),
  Sol: () => <TankWork c={TANKS[k]} />,
  checks: () => {
    const { V, t } = tankSol(TANKS[k])
    return [
      { key: 'V', label: 'Volume $V$', value: V, unit: 'ft³' },
      { key: 'D', label: 'Optimum diameter $D$', value: t.D, unit: 'ft' },
      { key: 'H', label: 'Optimum depth $H$', value: t.H, unit: 'ft' },
      { key: 'cost', label: 'Minimum cost (floor + wall)', value: t.cost, unit: 'Tk' },
    ]
  },
})

// =================================================================== the map
export const RM_MATH: Record<string, EvPartMap> = {
  'ev-2007-08-2b': pumpPart(c0708),
  'ev-2008-09-7c': pumpPart(c0809),
  'ev-2009-10-6c': pumpPart(c0910, ['ev-pump', 'ev-trans']),
  'ev-2011-12-2b': pumpPart(c1112),
  'ev-2012-13-1b': { topics: ['ev-pump'], ans: [], from: ['ce22'], final: curvesFinal(), Sol: CurvesSol, checks: () => {
    const [one, par, ser] = curvesCase().rows
    return [
      { key: 'Q1', label: 'One pump, min level: $Q$', value: one.min.Q, unit: 'm³/s', tol: 0.03 },
      { key: 'H1', label: 'One pump, min level: $H$', value: one.min.H, unit: 'm', tol: 0.03 },
      { key: 'Qp', label: 'Two in parallel, min level: $Q$', value: par.min.Q, unit: 'm³/s', tol: 0.03 },
      { key: 'Qs', label: 'Two in series, min level: $Q$', value: ser.min.Q, unit: 'm³/s', tol: 0.03 },
      { key: 'Hs', label: 'Two in series, min level: $H$', value: ser.min.H, unit: 'm', tol: 0.03 },
    ]
  } },
  'ev-2012-13-3b': { topics: ['ev-pump'], ans: [], from: ['ce22'], final: npshFinal(), Sol: NpshSol, checks: () => {
    const r = npshCase(5)
    return [
      { key: 'v', label: 'Velocity $v$ in the 250 mm pipe', value: r.pipe.v, unit: 'm/s' },
      { key: 'H', label: 'Total head $H$ (with minor losses)', value: r.h.H, unit: 'm' },
      { key: 'P', label: 'Power supplied to the flow', value: r.pw.waterKW, unit: 'kW' },
      { key: 'npsh', label: 'NPSH available (5 m of suction pipe)', value: r.npsh, unit: 'm', tol: 0.03 },
    ]
  }, notes: ['The paper does not say how much of the 30 m of pipe is on the suction side; the NPSH figure depends on that split (adjustable in the solution).'] },
  'ev-2016-17-7c': pumpPart(c1617, ['ev-pump', 'ev-trans']),
  'ev-jan-2021-1b': { topics: ['ev-rwh'], ans: [], from: ['ce22'], final: janFinal(), Sol: JanSol, checks: () => {
    const r = janRwh(100)
    return [
      { key: 'A', label: 'Catchment area, sample $R = 100$', value: r.area, unit: 'm²' },
      { key: 'Vh', label: 'Annual harvest', value: r.s.annualHarvest, unit: 'm³/yr' },
      { key: 'dem', label: 'Monthly demand used', value: r.s.demandUsed, unit: 'm³/month' },
      { key: 'tank', label: 'Tank volume', value: r.s.tank, unit: 'm³', tol: 0.03 },
    ]
  } },
  'ev-jan-2021-6b': { topics: ['ev-pump'], ans: [], from: ['ce22'], final: pumpFinal(jan6(100)) + ' (sample R = 100)', Sol: Jan6Sol, checks: () => pumpChecks(jan6(100), false).map((k) => ({ ...k, label: k.label + ' (R = 100)' })), notes: ['R is the last three digits of your student ID; the sample solution uses R = 100.'] },
  'ev-2020-21-3b': { topics: ['ev-rwh'], ans: [], from: ['ce22'], final: rw2021Final(), Sol: Rw2021Sol, checks: () => {
    const r = rw2021()
    return [
      { key: 'A', label: 'Effective catchment area', value: r.cat.total, unit: 'm²' },
      { key: 'dem', label: 'Demand-side tank (BNBC, +10 %)', value: r.bn.designM3, unit: 'm³' },
      { key: 'Vh', label: 'Annual harvest', value: r.s.annualHarvest, unit: 'm³/yr' },
      { key: 'tank', label: 'Supply-side tank volume', value: r.s.tank, unit: 'm³', tol: 0.03 },
    ]
  } },
  'ev-2020-21-4b': pumpPart(c2021),
  'ev-2021-22-1c': { ...pumpPart(c2122), notes: ['Only the numbers sub-ask is solved here; priming and cavitation are theory.'] },
  'ev-2021-22-8c': { topics: ['ev-rwh'], ans: [], from: ['ce22'], final: rw2122Final(), Sol: Rw2122Sol, checks: () => {
    const r = rw2122(140, 20, 100, 0.8)
    return [
      { key: 'dem', label: 'Demand-side design volume (BNBC, +10 %)', value: r.bn.designM3, unit: 'm³' },
      { key: 'Vh', label: 'Annual harvest', value: r.s.annualHarvest, unit: 'm³/yr' },
      { key: 'tank', label: 'Supply-side tank volume', value: r.s.tank, unit: 'm³', tol: 0.03 },
    ]
  }, notes: ['Occupancy and the potable / non-potable split are not given in the paper: they are assumed (and editable).'] },
  'ev-2022-23-1b': pumpPart(c2223),
  'ev-2022-23-2a': { topics: ['ev-rwh'], ans: [], from: ['ce22'], final: rw2223Final(), Sol: Rw2223Sol, checks: () => {
    const r = rw2223()
    return [
      { key: 'A', label: 'Effective catchment area', value: r.cat.total, unit: 'm²' },
      { key: 'Vh', label: 'Annual harvest', value: r.s.annualHarvest, unit: 'm³/yr' },
      { key: 'tank', label: 'Tank volume', value: r.s.tank, unit: 'm³', tol: 0.03 },
    ]
  }, flag: 'The paper gives only the annual rainfall and no demand: the monthly pattern and the use of the whole harvest are assumptions.' },
  'ev-2023-24-3d': { topics: ['ev-rwh'], ans: [], from: ['ce22'], final: rw2324Final(), Sol: Rw2324Sol, checks: () => {
    const r = rw2324()
    return [
      { key: 'V', label: 'Demand volume $V = n d q$', value: r.dm.V, unit: 'L' },
      { key: 'Vd', label: 'Design volume with 10 % freeboard', value: r.dm.design, unit: 'L' },
      { key: 'Vh', label: 'Annual roof harvest', value: r.harv, unit: 'm³/yr' },
    ]
  } },
  'ev-2023-24-8b': { ...pumpPart(c2324), notes: ['Only the design numbers are solved here; priming and cavitation are theory.'] },
  'ev-2020-21-2c': { ...tankPart('2020-21-2c'), notes: [`The paper just says "gallon": Rowshan ma'am's slides take 1 (British) gallon = 0.16 ft³, used here. Read as US gallons (0.1337 ft³) the same method gives D ≈ 37.1 ft, H ≈ 12.4 ft. State which gallon you use.`] },
  'ev-2009-10-1d': { ...tankPart('2009-10-1d'), notes: [`The paper just says "gallon": Rowshan ma'am's slides take 1 (British) gallon = 0.16 ft³, used here. Read as US gallons (0.1337 ft³) the same method gives D ≈ 44.9 ft, H ≈ 16.9 ft. State which gallon you use.`] },
  // 2011-12 Q8(d) and 2016-17 Q6(c) print US gallons: solved in sn-dtw.tsx
}
