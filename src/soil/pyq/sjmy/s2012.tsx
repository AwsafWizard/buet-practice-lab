// CE 341 term final 2012-13 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section B (Q9–Q12, any THREE), held 7 Jun 2014, PDF pp. 27–29 (Fig. 4 Barron chart p. 28, Figs. 5–6 p. 29).
import { Md, Tex } from '../../../components/ui'
import { borrowPlan, gdOf } from '../../engine/compaction'
import { combinedU, deFromSpacing, Fn, settleNC, timeFactor, tvApprox, uApprox, urBarron } from '../../engine/consolidation'
import { filterDepth, gsubFromGsE, eFromN } from '../../engine/stresses'
import { boussinesqRectCentre, Irect, lineEnd, maxOnVertical, twoToOneRect } from '../../engine/stressdist'
import { BarronChart } from '../../reference/con'
import { PERM_DEFAULT, permResults, PermSolution } from '../../topics/perm/Labs'
import { Q_DEFAULT, QuickFigure, QuickSolution } from '../../topics/seep/HeaveLab'
import type { SmQ } from '../../types'
import { f0, f2, f3, f4, Frm, Head, Model, Note, PointLoadFig, Result, Sol, SoilColumn, th, WallPlanFig } from './old-kit'

const P = '2012-13' as const

// ---------------------------------------------------------------- Q9(b) borrow soil → embankment (t/m³)
const r9b = () => {
  const bank = { gb: 1.8, w: 0.1 }
  const fill = { gd: 1.85, w: 0.18 }
  const gdB = gdOf(bank, 1)
  const p = borrowPlan({ Vfill: 1, fill, bank, gw: 1 })
  const water10 = (fill.w - bank.w) * gdB * 10
  return { gdB, p, water10, Ws10: gdB * 10 }
}

// ---------------------------------------------------------------- Q9(c) maximum σz on a vertical line
const m9 = () => maxOnVertical(20, 2)

// ---------------------------------------------------------------- Q10(c) constant head (same data as 2008-09 Q8(c))
const perm = () => permResults(PERM_DEFAULT)

// ---------------------------------------------------------------- Q10(d) filter depth for FS = 2
const r10d = () => {
  const e = eFromN(Q_DEFAULT.n)
  const gsub = gsubFromGsE(Q_DEFAULT.Gs, e)
  return { e, gsub, ...filterDepth({ gsub, L: Q_DEFAULT.L, h: Q_DEFAULT.h, FS: Q_DEFAULT.FS }) }
}

// ---------------------------------------------------------------- Q11(c) sand drains, square 3 m, rw 0.15 m, H = 6 m one-way
const r11c = () => {
  const Uv = 0.25
  const Tv = tvApprox(25)
  const d = 6
  const de = deFromSpacing(3, 'square')
  const re = de / 2
  const n = re / 0.15
  const Tr = Tv * (d / de) ** 2
  const Ur = urBarron(Tr, n)
  const Ur10 = urBarron(Tr, 10)
  return { Uv, Tv, d, de, re, n, Tr, F: Fn(n), Ur, Ur10, U: combinedU(Uv, Ur), U10: combinedU(Uv, Ur10) }
}

// ---------------------------------------------------------------- Q12(b) footing + fill on NC silty clay (US units)
const C12 = { Q: 75000, B: 5, fillH: 4, gFill: 135, H: 10, w: 0.22, Gs: 2.6, Cc: 0.3, g: 102, cvPrint: 7.8e3, cvHand: 7.8e-3 }
const r12 = () => {
  const e0 = C12.w * C12.Gs
  const q = C12.Q / (C12.B * C12.B)
  const z = C12.H / 2
  const p0 = z * C12.g
  const dpF = boussinesqRectCentre(q, C12.B, C12.B, z)
  const I = Irect(C12.B / 2 / z, C12.B / 2 / z)
  const dpFill = C12.fillH * C12.gFill
  const dp = dpF + dpFill
  const S = settleNC(C12.Cc, C12.H * 12, e0, p0, dp)
  const dp21 = twoToOneRect(C12.Q, C12.B, C12.B, z) + dpFill
  const S21 = settleNC(C12.Cc, C12.H * 12, e0, p0, dp21)
  const U = (6 / S) * 100
  const Tv = tvApprox(U)
  const d = (C12.H * 12) / 2
  const tPrint = (Tv * d * d) / C12.cvPrint
  const tHand = (Tv * d * d) / C12.cvHand
  const t6 = 0.5 * 365 * 86400
  const U6p = uApprox(timeFactor(C12.cvPrint, t6, d))
  const U6h = uApprox(timeFactor(C12.cvHand, t6, d))
  return { e0, q, z, p0, I, dpF, dpFill, dp, S, dp21, S21, U, Tv, d, tPrint, tHand, U6p, U6h, S6p: (U6p / 100) * S, S6h: (U6h / 100) * S }
}

// ---------------------------------------------------------------- Q12(c) T-junction of wall line loads
const r12c = () => {
  const ba = lineEnd(75, 9, 3)
  const cd = lineEnd(100, 6, 3)
  return { ba, cd, s: ba + 2 * cd }
}

export const B2012: SmQ[] = [
  {
    id: 'sm-2012-13-9a',
    paper: P,
    sec: 'B',
    no: '9(a)',
    marks: 16.67,
    topics: ['sm-wv'],
    title: 'Derive the submerged density in terms of w, e, G, ρw; define S',
    text: 'Derive an expression for the submerged density of soil in terms of its water content, void ratio, specific gravity and density of water. Define the term degree of saturation.',
    pages: [27],
    theory: true,
    solution: () => <Model item={th('sm-wv', 't-sub')} />,
  },
  {
    id: 'sm-2012-13-9b',
    paper: P,
    sec: 'B',
    no: '9(b)',
    marks: 15,
    topics: ['sm-comp', 'sm-wv'],
    title: 'Borrow soil at 10 % → embankment at 18 %, ρd 1.85 t/m³: water to add, excavation per m³',
    text: 'A borrow soil has a natural water content of 10% and bulk density of 1.8 t/m³. This soil is used for an embankment to be compacted at 18% moisture content to a dry density of 1.85 t/m³. Determine the weight of water to be added to 10 m³ of borrow soil. How many cubic metres of excavation is required for 1.0 m³ of compacted embankment?',
    pages: [27],
    given: [],
    checks: () => {
      const r = r9b()
      return [
        { key: 'gd', label: 'Dry density of the borrow soil', value: r.gdB, unit: 't/m³' },
        { key: 'ww', label: 'Water to add to 10 m³ of borrow soil', value: r.water10, unit: 't' },
        { key: 'V', label: 'Excavation per 1.0 m³ of embankment', value: r.p.Vbank, unit: 'm³' },
      ]
    },
    solution: () => {
      const r = r9b()
      return (
        <Sol>
          <Tex block>{`\\rho_{d,borrow} = \\frac{\\rho}{1 + w} = \\frac{1.8}{1.10} = ${f3(r.gdB)}\\ \\text{t/m}^3 \\Rightarrow \\text{solids in 10 m}^3 = ${f3(r.Ws10)}\\ \\text{t}`}</Tex>
          <Tex block>{`\\text{Water to add} = (w_{req} - w_{nat})W_s = (0.18 - 0.10) \\times ${f3(r.Ws10)} = ${f3(r.water10)}\\ \\text{t} \\ (\\approx ${f2(r.water10)}\\ \\text{m}^3)`}</Tex>
          <Md>{`**Excavation.** The solids in 1 m³ of embankment, $1.85 \\times 1 = 1.85$ t, must be dug out at $\\rho_d = ${f3(r.gdB)}$:`}</Md>
          <Tex block>{`V = \\frac{1.85}{${f3(r.gdB)}} = ${f3(r.p.Vbank)}\\ \\text{m}^3`}</Tex>
          <Result>{`Water to add ≈ **${f2(r.water10)} t** (${f0(r.water10 * 100)} kg per m³ of borrow soil); excavation ≈ **${f2(r.p.Vbank)} m³** per m³ of embankment.`}</Result>
        </Sol>
      )
    },
    notes: ['Same data as 2008-09 Q5(c) (there per 1.0 m³ of borrow soil).'],
  },
  {
    id: 'sm-2012-13-9c',
    paper: P,
    sec: 'B',
    no: '9(c)',
    marks: 15,
    topics: ['sm-stress'],
    title: 'Angle β for the maximum σz on a vertical line at radius r; value for Q = 20 kN, r = 2 m',
    text: 'For what value of β (see Fig. 3) will the vertical stress be maximum on a line at a constant radial distance r from the axis of a vertical load Q? Find also the maximum vertical stress on a line at r = 2 m from the axis of a concentrated load of 20 kN.',
    pages: [27],
    given: [],
    figure: () => <PointLoadFig beta={m9().beta} />,
    checks: () => {
      const m = m9()
      return [
        { key: 'beta', label: 'β for the maximum', value: m.beta, unit: '°' },
        { key: 'z', label: 'Depth of the maximum (r = 2 m)', value: m.z, unit: 'm' },
        { key: 's', label: 'Maximum vertical stress (Q = 20 kN, r = 2 m)', value: m.sigma, unit: 'kPa' },
      ]
    },
    solution: () => {
      const m = m9()
      return (
        <Sol>
          <Tex block>{`\\sigma_z = \\frac{3Q}{2\\pi}\\frac{z^3}{(r^2 + z^2)^{5/2}}\\quad (r\\ \\text{fixed})`}</Tex>
          <Tex block>{`\\frac{d\\sigma_z}{dz} = \\frac{3Q}{2\\pi}\\frac{3z^2(r^2 + z^2) - 5z^4}{(r^2 + z^2)^{7/2}} = 0 \\Rightarrow 3r^2 = 2z^2 \\Rightarrow \\frac{r}{z} = \\sqrt{\\tfrac{2}{3}} = 0.8165`}</Tex>
          <Tex block>{`\\tan\\beta = \\frac{r}{z} = 0.8165 \\Rightarrow \\beta = ${f2(m.beta)}^\\circ\\ (39^\\circ 14')`}</Tex>
          <Tex block>{`\\sigma_{z,max} = \\frac{3Q}{2\\pi z^2}\\left[\\frac{1}{1 + 2/3}\\right]^{5/2} = \\frac{0.0888\\,Q}{r^2} = \\frac{0.0888 \\times 20}{2^2} = ${f3(m.sigma)}\\ \\text{kPa}\\quad (z = r\\sqrt{3/2} = ${f2(m.z)}\\ \\text{m})`}</Tex>
          <Result>{`β = **${f2(m.beta)}°**; σz,max = 0.0888Q/r² = **${f2(m.sigma)} kPa** at z = ${f2(m.z)} m.`}</Result>
        </Sol>
      )
    },
    notes: ['Fig. 3 (hand-drawn) shows Q on the surface, its axis, a vertical line at radius r and β between the axis and the line to the point; redrawn.'],
  },
  {
    id: 'sm-2012-13-10a',
    paper: P,
    sec: 'B',
    no: '10(a)',
    marks: 8.67,
    topics: ['sm-seep'],
    title: 'Properties and utility of the flow net',
    text: 'Briefly discuss the properties and utility of the flow net diagram.',
    pages: [27],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-flownet-props')} />,
  },
  {
    id: 'sm-2012-13-10b',
    paper: P,
    sec: 'B',
    no: '10(b)',
    marks: 8,
    topics: ['sm-seep'],
    title: 'σ′ in a submerged soil is independent of the water height above it',
    text: 'Prove that the effective stress at a point in a submerged saturated soil is independent of the height of water above the soil sample.',
    pages: [27],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-submerged')} />,
  },
  {
    id: 'sm-2012-13-10c',
    paper: P,
    sec: 'B',
    no: '10(c)',
    marks: 15,
    topics: ['sm-perm'],
    title: 'Constant-head test: k, comment, seepage velocity from the dry mass',
    text: '500 ml of water was collected from a constant head permeameter in a period of 15 minutes. The internal diameter of the permeameter is 5 cm and the measured difference in head between two gauging points 15 cm vertically apart is 40 cm. Calculate the coefficient of permeability and comment on its value. If the dry weight of the 15 cm long sample is 486 g and the specific gravity of the solids is 2.65, calculate the seepage velocity.',
    pages: [28],
    given: [],
    checks: () => {
      const r = perm()
      return [
        { key: 'k', label: 'Coefficient of permeability k', value: r.k * 100, unit: '× 10⁻² cm/s' },
        { key: 'v', label: 'Discharge velocity v = ki', value: r.v * 100, unit: '× 10⁻² cm/s' },
        { key: 'n', label: 'Porosity n', value: r.n },
        { key: 'vs', label: 'Seepage velocity', value: r.vs * 100, unit: '× 10⁻² cm/s' },
      ]
    },
    solution: () => {
      const r = perm()
      return (
        <Sol>
          <PermSolution s={PERM_DEFAULT} />
          <Result>{`k ≈ **${f2(r.k * 100)} × 10⁻² cm/s** — typical of clean (medium to coarse) sand, good drainage; seepage velocity ≈ **${f3(r.vs)} cm/s** (n = ${f3(r.n)}).`}</Result>
        </Sol>
      )
    },
    notes: ['Same data as 2008-09 Q8(c).'],
  },
  {
    id: 'sm-2012-13-10d',
    paper: P,
    sec: 'B',
    no: '10(d)',
    marks: 15,
    topics: ['sm-seep'],
    title: 'Depth of a coarse-sand filter for FS = 2 against piping (1.25 m layer, 1.80 m upward head)',
    text: 'A 1.25 m layer of soil ($G_s$ = 2.65 and porosity = 35%) is subjected to an upward seepage head of 1.80 m. What depth of coarse sand would be required above the soil to provide a factor of safety of 2.0 against piping? Assume that the coarse sand has the same void ratio and specific gravity as the soil, and that there is negligible head loss in the sand.',
    pages: [28],
    given: [],
    figure: () => <QuickFigure s={Q_DEFAULT} zf={r10d().z} />,
    checks: () => {
      const r = r10d()
      return [
        { key: 'g', label: "$\\gamma'$", value: r.gsub, unit: 'kN/m³' },
        { key: 'fs0', label: 'FS without the filter', value: r.FS0 },
        { key: 'z', label: 'Depth of coarse sand for FS = 2.0', value: r.z, unit: 'm' },
      ]
    },
    solution: () => (
      <Sol>
        <QuickSolution s={Q_DEFAULT} />
        <Result>{`Without a filter FS = ${f2(r10d().FS0)} (< 1: the layer would boil); a coarse-sand filter about **${f2(r10d().z)} m** deep gives FS = 2.0.`}</Result>
      </Sol>
    ),
    notes: ['"fitler" (sic) in the print.'],
  },
  {
    id: 'sm-2012-13-11a',
    paper: P,
    sec: 'B',
    no: '11(a)',
    marks: 13.67,
    topics: ['sm-consol'],
    title: 'Coefficient of consolidation: meaning, use, determination',
    text: 'What is the co-efficient of consolidation? What is its use and how is it determined?',
    pages: [28],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-cv')} post="**Determination in detail.** *Taylor (√t):* plot dial reading against √t; extend the initial straight part back to get the corrected zero; draw a second line from that point with abscissae 1.15 times the first; it cuts the curve at √t90; $c_v = 0.848d^2/t_{90}$. *Casagrande (log t):* plot dial reading against log t; d0 from two early readings at t and 4t; d100 where the tangents to the steep part and the secondary tail meet; d50 = (d0 + d100)/2 gives t50; $c_v = 0.197d^2/t_{50}$." />,
  },
  {
    id: 'sm-2012-13-11b',
    paper: P,
    sec: 'B',
    no: '11(b)',
    marks: 13,
    topics: ['sm-consol'],
    title: 'Sand drains: description, design, use',
    text: 'Describe sand drains. How are these designed? Discuss their use.',
    pages: [28],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-drains')} />,
  },
  {
    id: 'sm-2012-13-11c',
    paper: P,
    sec: 'B',
    no: '11(c)',
    marks: 20,
    topics: ['sm-consol'],
    title: 'Sand drains (30 cm, square 3 m) in 6 m of clay: U when vertical drainage alone gives 25 %',
    text: 'A soft clay layer near the sea coast of Chittagong port is to be consolidated by using sand drains and surcharge load. The compressible stratum is 6 m deep and rests on an impermeable base. Sand drains of 30 cm diameter are provided in a square grid pattern 3 m apart. Compute the average degree of consolidation of the clay with sand drains at the time when the degree of consolidation without drains would be 25%. Assume that the soil is isotropic. Use Fig. 4.',
    pages: [28],
    given: [{ label: 'Fig. 4 Barron chart', what: 'Ur vs Tr for n = 5, 10, 40, 100', ref: 'k-barron' }],
    checks: () => {
      const r = r11c()
      return [
        { key: 'Tv', label: '$T_v$ for $U_v$ = 25 % (d = 6 m)', value: r.Tv },
        { key: 'de', label: 'Equivalent diameter $d_e = 1.128s$', value: r.de, unit: 'm' },
        { key: 'n', label: '$n = r_e/r_w$', value: r.n },
        { key: 'Tr', label: '$T_r = T_v(d/d_e)^2$', value: r.Tr },
        { key: 'Ur', label: '$U_r$ (chart between the n = 10 and 40 curves, n = 11.3)', value: r.Ur * 100, unit: '%', tol: 0.08 },
        { key: 'U', label: 'Average U with drains', value: r.U * 100, unit: '%', tol: 0.04 },
      ]
    },
    solution: () => {
      const r = r11c()
      return (
        <Sol>
          <Md>{`**Vertical drainage only.** Impermeable base → single drainage, $d = H = 6$ m. $U_v = 25\\%$ (< 60 %): $T_v = \\frac{\\pi}{4}(0.25)^2 = ${f4(r.Tv)}$.`}</Md>
          <Md>{`**Radial drainage.** Square grid: $d_e = 1.128s = 1.128 \\times 3 = ${f3(r.de)}$ m, $r_e = ${f3(r.re)}$ m, $r_w = 0.15$ m → $n = r_e/r_w = ${f2(r.n)}$ (read the n = 10 curve).`}</Md>
          <Md>{`Isotropic soil, $c_{vr} = c_v$, same time t: $T_r = \\dfrac{c_vt}{d_e^2} = T_v\\left(\\dfrac{d}{d_e}\\right)^2 = ${f4(r.Tv)}\\left(\\dfrac{6}{${f3(r.de)}}\\right)^2 = ${f3(r.Tr)}$.`}</Md>
          <Frm>
            <div className="max-w-[420px] mx-auto">
              <BarronChart n={r.n} Tr={r.Tr} />
            </div>
          </Frm>
          <Md>{`From Fig. 4 at $T_r = ${f3(r.Tr)}$: n = ${f2(r.n)} lies just to the right of the n = 10 curve (which reads ${f0(r.Ur10 * 100)} %), so $U_r ≈ ${f0(r.Ur * 100)}$ %. Barron's formula $U_r = 1 - e^{-8T_r/F(n)}$, F(n) = ${f3(r.F)}, gives ${f2(r.Ur * 100)} %.`}</Md>
          <Tex block>{`U = 1 - (1 - U_v)(1 - U_r) = 1 - (0.75)(1 - ${f3(r.Ur)}) = ${f3(r.U)}`}</Tex>
          <Result>{`Average degree of consolidation with sand drains ≈ **${f0(r.U * 100)} %** (vs 25 % without drains) — about 2.5 times the progress. Reading the n = 10 curve directly gives ${f0(r.U10 * 100)} %.`}</Result>
          <Note>Lecture 20 writes 0.564s for a square grid — that is re = de/2 (de = 1.128s).</Note>
        </Sol>
      )
    },
    notes: ['The handnote: Tv = 0.0491, de = 3.384 m, n = 11.3, Tr = 0.154, Ur ≈ 52 %, U ≈ 64 %.'],
  },
  {
    id: 'sm-2012-13-12a',
    paper: P,
    sec: 'B',
    no: '12(a)',
    marks: 16.67,
    topics: ['sm-consol'],
    title: 'The consolidation test; predicting the rate and magnitude of settlement',
    text: 'Describe the consolidation test. Show how its results are used to predict the rate and the magnitude of settlement.',
    pages: [28],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-test')} />,
  },
  {
    id: 'sm-2012-13-12b',
    paper: P,
    sec: 'B',
    no: '12(b)',
    marks: 15,
    topics: ['sm-consol', 'sm-stress'],
    title: '5′ × 5′ footing (75 kips) plus a 4 ft fill on 10 ft NC silty clay: S, time for 6″, S at 6 months',
    text: 'A footing is placed on the silty clay stratum with the properties as shown in Fig. 5. Then, a 4-foot fill layer is added, as shown. Find (i) the settlement of the silty clay layer, (ii) the time required for 6″ of settlement, (iii) the settlement in 6 months.\n\n(Fig. 5: 75 kips column on a 5′ × 5′ footing resting on the top of 10 ft of N.C. silty clay — w = 22%, $G_s$ = 2.6, $C_c$ = 0.30, γ = 102 pcf, $c_v$ = 7.8×10³ in²/sec; new fill 4 ft thick, γ = 135 pcf, placed around the column; water table at the base of the clay, on sand and gravel.)',
    pages: [28, 29],
    given: [],
    figure: () => (
      <SoilColumn
        unit="ft"
        layers={[
          { H: 4, name: 'New fill', kind: 'fill', props: ['γ = 135 pcf'] },
          { H: 10, name: 'Silty clay (N.C.)', kind: 'clay', props: ['w = 22 %, Gs = 2.6, Cc = 0.30', 'γ = 102 pcf, cv = 7.8×10³ in²/s'] },
          { H: 2, name: 'Sand and gravel', kind: 'sand' },
        ]}
        wt={14}
        footing={{ Df: 4, B: 5, label: '75 kips, 5′ × 5′' }}
        marks={[{ z: 9, label: 'mid-clay' }]}
      />
    ),
    checks: () => {
      const r = r12()
      return [
        { key: 'e0', label: '$e_0 = wG_s$', value: r.e0 },
        { key: 'p0', label: "$p'_0$ at mid-clay", value: r.p0, unit: 'psf' },
        { key: 'dpf', label: 'Δp from the footing at mid-clay (Boussinesq, centre)', value: r.dpF, unit: 'psf' },
        { key: 'dp', label: 'Total Δp (footing + fill)', value: r.dp, unit: 'psf' },
        { key: 'S', label: '(i) Consolidation settlement', value: r.S, unit: 'in', tol: 0.03 },
        { key: 'Tv', label: '(ii) $T_v$ for 6″', value: r.Tv, tol: 0.03 },
        { key: 'tp', label: '(ii) Time for 6″ with cv as printed (7.8×10³ in²/s)', value: r.tPrint, unit: 's', tol: 0.04 },
        { key: 'th', label: '(ii) Time for 6″ if cv = 7.8×10⁻³ in²/s', value: r.tHand / 3600, unit: 'hours', tol: 0.04 },
        { key: 'S6', label: '(iii) Settlement in 6 months', value: r.S6p, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => {
      const r = r12()
      return (
        <Sol>
          <Md>{`US units, $\\gamma_w$ = 62.4 pcf. The clay is taken as saturated, $e_0 = wG_s = 0.22 \\times 2.6 = ${f3(r.e0)}$ (as the handnote; the WT is drawn at its base). Mid-clay is $z = 5$ ft below the footing base; the clay is above the WT, so $p'_0 = 5 \\times 102 = ${f0(r.p0)}$ psf (the new fill is the load, not overburden).`}</Md>
          <Head>(i) Δp and settlement</Head>
          <Md>{`Footing: $q = 75000/25 = ${f0(r.q)}$ psf. Below the centre at z = 5 ft: four 2.5 ft × 2.5 ft rectangles, $m = n = 2.5/5 = 0.5$, $I = ${f4(r.I)}$ → $\\Delta p_f = 4 \\times ${f4(r.I)} \\times ${f0(r.q)} = ${f0(r.dpF)}$ psf. Fill (wide): $\\Delta p = 4 \\times 135 = ${f0(r.dpFill)}$ psf. Total $\\Delta p = ${f0(r.dp)}$ psf.`}</Md>
          <Tex block>{`S = \\frac{C_cH}{1 + e_0}\\log\\frac{p'_0 + \\Delta p}{p'_0} = \\frac{0.30 \\times 120}{${f3(1 + r.e0)}}\\log\\frac{${f0(r.p0 + r.dp)}}{${f0(r.p0)}} = ${f2(r.S)}\\ \\text{in}`}</Tex>
          <Md>{`(With the 2:1 method, $\\Delta p_f = 75000/(10 \\times 10) = 750$ psf, S = ${f2(r.S21)} in.)`}</Md>
          <Head>(ii) Time for 6 in</Head>
          <Md>{`Drained at both faces (granular fill above, sand and gravel below): $d = H/2 = 5$ ft = ${f0(r.d)} in. $U = 6/${f2(r.S)} = ${f2(r.U)}$ % (< 60 %) → $T_v = \\frac{\\pi}{4}(${f4(r.U / 100)})^2 = ${f4(r.Tv)}$.`}</Md>
          <Tex block>{`t = \\frac{T_vd^2}{c_v} = \\frac{${f4(r.Tv)} \\times ${f0(r.d)}^2}{7.8\\times10^{3}} = ${f3(r.tPrint)}\\ \\text{s (as printed)};\\qquad \\text{with } 7.8\\times10^{-3}:\\ ${f0(r.tHand)}\\ \\text{s} = ${f2(r.tHand / 3600)}\\ \\text{h}`}</Tex>
          <Head>(iii) In 6 months</Head>
          <Md>{`$T_v = c_vt/d^2$ is enormous for either reading of cv (U = ${f0(r.U6p)} %, ${f0(r.U6h)} % with 10⁻³), so consolidation is complete: $S_{6\\,mo} ≈ ${f2(r.S6p)}$ in.`}</Md>
          <Result>{`(i) S ≈ **${f2(r.S)} in** (${f0(r.S * 25.4)} mm); (ii) 6″ in **${f2(r.tPrint)} s** with cv as printed — practically instantly — or ≈ **${f2(r.tHand / 3600)} hours** if cv = 7.8 × 10⁻³ in²/s; (iii) ≈ **${f2(r.S6p)} in** (complete) at 6 months.`}</Result>
          <Note>The scan prints cv = 7.8×10³ in²/sec with no minus sign; the handnote reads 7.8×10⁻³. Both are far too fast for a silty clay (10⁻³ in²/s is about 1700 ft²/yr), so only (i) and (iii) are robust.</Note>
        </Sol>
      )
    },
    notes: [
      'cv: the scan clearly shows "7.8×10³ in²/sec" (no minus sign). The main answer follows the scan; the handnote reads 7.8×10⁻³ in²/s (≈ 19 hours for 6″). Either way the 6-month settlement is the full settlement.',
      'Saturated e0 = wGs is assumed although the WT is drawn at the clay base (as the handnote). Δp is taken at mid-depth below the footing centre (Boussinesq); the 2:1 method gives 12.5 in.',
    ],
  },
  {
    id: 'sm-2012-13-12c',
    paper: P,
    sec: 'B',
    no: '12(c)',
    marks: 15,
    topics: ['sm-stress'],
    title: 'T-shaped wall line loads (75 and 100 kN/m) meeting at A: σz 3 m below A',
    text: 'Two load bearing walls (BA and CD) meet at a point A as shown in Fig. 6. Assume that the loads act as line loads. Determine the vertical stress at a point 3 m below A.\n\n(Fig. 6: wall BA, 9 m long, 75 kN/m, ending at A; wall CD, 100 kN/m, passing through A with 6 m from A to D and 6 m from A to C.)',
    pages: [29],
    given: [],
    figure: () => (
      <WallPlanFig
        P={[0, 0]}
        segs={[
          { a: [-9, 0], b: [0, 0], text: 'BA: 75 kN/m, 9 m', ends: ['B', ''] },
          { a: [0, 0], b: [0, 6], text: '100 kN/m, 6 m', ends: ['', 'D'] },
          { a: [0, 0], b: [0, -6], text: '100 kN/m, 6 m', ends: ['', 'C'] },
        ]}
      />
    ),
    checks: () => {
      const r = r12c()
      return [
        { key: 'ba', label: 'σz from BA (end of a 9 m line)', value: r.ba, unit: 'kPa' },
        { key: 'cd', label: 'σz from one 6 m half of CD', value: r.cd, unit: 'kPa' },
        { key: 's', label: 'Total σz 3 m below A', value: r.s, unit: 'kPa' },
      ]
    },
    solution: () => {
      const r = r12c()
      return (
        <Sol>
          <Md>{`Integrating Boussinesq's point load along a line of length L, the stress below **one end** of the line is`}</Md>
          <Tex block>{`\\sigma_z = \\frac{q'L(3z^2 + 2L^2)}{2\\pi z(z^2 + L^2)^{3/2}}`}</Tex>
          <Md>{`A is the end of BA and splits CD into two 6 m lines that each end at A, so superpose three end-of-line cases (z = 3 m):`}</Md>
          <Tex block>{`BA:\\ \\frac{75 \\times 9(27 + 162)}{2\\pi \\times 3(9 + 81)^{3/2}} = ${f2(r.ba)}\\ \\text{kPa};\\qquad AD = AC:\\ \\frac{100 \\times 6(27 + 72)}{2\\pi \\times 3(9 + 36)^{3/2}} = ${f2(r.cd)}\\ \\text{kPa each}`}</Tex>
          <Tex block>{`\\sigma_z = ${f2(r.ba)} + 2(${f2(r.cd)}) = ${f2(r.s)}\\ \\text{kPa}`}</Tex>
          <Result>{`Vertical stress 3 m below A ≈ **${f2(r.s)} kPa**. (Check: as L → ∞ the end formula tends to q′/(πz), half the infinite-line value.)`}</Result>
        </Sol>
      )
    },
  },
]

