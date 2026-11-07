// Practice problem on a lecture topic never asked in the 13 past papers: field density by core cutter and rubber balloon
// (procedure + one numerical each), contrasted with the sand cone.
import { fmt } from '../../../components/DiagramView'
import { Md } from '../../../components/ui'
import { checkSpec, coreCutter, rubberBalloon } from '../../engine/compaction'
import type { SmQ } from '../../types'
import { SandConeFig } from './figs'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

// (a) core cutter on a compacted clayey subgrade
const CC = { D: 10, L: 13, Wcut: 1286, Wtot: 3240, wWet: 48.6, wDry: 42.5, mdd: 1.78, omc: 0.15 }
// (b) rubber balloon on a gravelly sand base course
const RB = { R1: 85, R2: 1318, Wwet: 2390, w: 0.124, mdd: 1.86, omc: 0.11 }
const SPEC = { rcMin: 0.95, dw: 0.02 }

const runCC = () => coreCutter({ D: CC.D, L: CC.L, W: CC.Wtot - CC.Wcut, wWet: CC.wWet, wDry: CC.wDry })
const runRB = () => rubberBalloon({ R1: RB.R1, R2: RB.R2, Wwet: RB.Wwet, w: RB.w })

export const COMP_NEW: SmQ[] = [
  {
    id: 'sm-own-comp-new1',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: 'N1',
    marks: 0,
    topics: ['sm-comp'],
    title: 'Field density by core cutter and rubber balloon (vs sand cone) · not asked yet',
    text: `*${NOT_ASKED}*

(a) **Core cutter.** A cylindrical core cutter ${CC.D} cm in internal diameter and ${CC.L} cm long weighs ${CC.Wcut} g empty. Driven into a compacted clayey subgrade and dug out, cutter + soil weigh ${CC.Wtot} g. A water-content sample from the core weighs ${CC.wWet} g wet and ${CC.wDry} g oven-dry. Find the bulk and dry density and the relative compaction (lab MDD ${CC.mdd} t/m³ at OMC ${CC.omc * 100} %).

(b) **Rubber balloon.** On a gravelly sand base course the balloon volumeter reads ${RB.R1} cm³ with its base plate on the levelled surface and ${RB.R2} cm³ when the balloon is pressed into the excavated hole. The soil dug out of the hole weighs ${RB.Wwet} g at a water content of ${RB.w * 100} %. Find the dry density and check it against a spec of RC ≥ ${SPEC.rcMin * 100} % (MDD ${RB.mdd} t/m³) and w = OMC ± 2 % (OMC ${RB.omc * 100} %).

(c) Outline the procedure of each test, and state where each is preferred to the sand cone method.`,
    pages: [],
    checks: () => {
      const a = runCC()
      const b = runRB()
      return [
        { key: 'ca', label: '(a) bulk density', value: a.rhoB, unit: 'g/cm³' },
        { key: 'cw', label: '(a) water content', value: a.w * 100, unit: '%' },
        { key: 'cd', label: '(a) dry density', value: a.rhoD, unit: 'g/cm³' },
        { key: 'crc', label: '(a) relative compaction', value: (a.rhoD / CC.mdd) * 100, unit: '%' },
        { key: 'bv', label: '(b) hole volume', value: b.V, unit: 'cm³' },
        { key: 'bd', label: '(b) dry density', value: b.rhoD, unit: 'g/cm³' },
        { key: 'brc', label: '(b) relative compaction', value: (b.rhoD / RB.mdd) * 100, unit: '%' },
      ]
    },
    solution: () => {
      const a = runCC()
      const b = runRB()
      const ca = checkSpec(a.rhoD, a.w, { mdd: CC.mdd, omc: CC.omc, ...SPEC })
      const cb = checkSpec(b.rhoD, b.w, { mdd: RB.mdd, omc: RB.omc, ...SPEC })
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**(a) Core cutter.** Volume of the cutter $V = \\dfrac{\\pi}{4}D^2L = \\dfrac{\\pi}{4}(${CC.D})^2(${CC.L}) = ${f2(a.V)}$ cm³. Soil in it $= ${CC.Wtot} - ${CC.Wcut} = ${CC.Wtot - CC.Wcut}$ g.

$$\\rho = \\frac{${CC.Wtot - CC.Wcut}}{${f2(a.V)}} = ${f3(a.rhoB)}\\ \\text{g/cm}^3,\\quad w = \\frac{${CC.wWet} - ${CC.wDry}}{${CC.wDry}} = ${f2(a.w * 100)}\\ \\%,\\quad \\rho_d = \\frac{\\rho}{1 + w} = ${f3(a.rhoD)}\\ \\text{g/cm}^3$$

$\\gamma_d = ${f2(a.rhoD * 9.81)}$ kN/m³; RC $= ${f3(a.rhoD)}/${CC.mdd} = ${f2(ca.rc * 100)}$ % → ${ca.pass ? '**passes** a 95 % spec' : `**fails** a 95 % spec (${ca.why.join('; ')})`}.`}</Md>
          <Md>{`**(b) Rubber balloon.** Hole volume $V = R_2 - R_1 = ${RB.R2} - ${RB.R1} = ${b.V}$ cm³.

$$\\rho = \\frac{${RB.Wwet}}{${b.V}} = ${f3(b.rhoB)}\\ \\text{g/cm}^3,\\qquad \\rho_d = \\frac{${f3(b.rhoB)}}{1 + ${RB.w}} = ${f3(b.rhoD)}\\ \\text{g/cm}^3$$

RC $= ${f3(b.rhoD)}/${RB.mdd} = ${f2(cb.rc * 100)}$ %; w = ${f2(RB.w * 100)} % is ${cb.okW ? 'inside' : 'outside'} ${f2(cb.lo * 100)}–${f2(cb.hi * 100)} % → ${cb.pass ? '**passes**' : `**fails**: ${cb.why.join('; ')}. Re-roll the layer (more passes) and retest.`}`}</Md>
          <Md>{`**(c) Procedures.**
- **Core cutter** (IS 2720-29 type): level the surface, place the dolly on the cutter and drive it in with the rammer until only about 15 mm of the dolly shows; dig the cutter out, trim both ends flush, weigh; take a water-content sample from the core. ρ = (mass of soil)/(volume of cutter). Quick and cheap, but only for **soft to medium, fine-grained soils free of gravel** (clays, silty soils) — it cannot be driven into stony or very hard ground and disturbs loose sands.
- **Rubber balloon** (ASTM D2167): seat the base plate on the levelled surface and take the volumeter reading with the balloon pressed against the surface ($R_1$); dig a hole through the plate, keep all the soil (weigh it, take w); press the balloon into the hole with the water (or air) pressure of the volumeter and read $R_2$. V = $R_2 - R_1$. Needs no calibrated sand; suits **firm soils and gravelly soils** whose hole walls stand, but sharp stones can puncture the membrane and soft soils deform under the balloon pressure.
- **Sand cone** (the method on SJMY sir's slide): the hole volume comes from the mass of calibrated, uniform dry sand that fills it ($W_6 = W_3 - W_5 - W_{cone}$, $V = W_6/\\rho_{sand}$). It works in almost any soil whose hole stands, including gravelly soil, but is slow, needs the sand to be recalibrated, and vibration nearby makes the sand densify (V too large, ρ too small).`}</Md>
          <SandConeFig />
        </div>
      )
    },
    notes: [NOT_ASKED, 'SJMY sir\'s Lecture 6 lists sand cone, rubber balloon and nuclear methods and works only the sand cone; the core cutter (IS 2720 Part 29) is not on either teacher\'s slides but is the standard alternative in fine-grained soils.'],
  },
]
