// ev-pump — pump types, centrifugal / submersible / air-lift pumps, performance and system curves, priming, cavitation, NPSH, selection (Rowshan ma'am L8).
// The numbers (pump capacity, power, operating point, NPSH) live in engine/pump.ts and pyq/rm-math.tsx.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-pump' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const accent2 = 'var(--c-accent2)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

/** centrifugal pump: casing section with impeller, eye, volute, suction and discharge; shaft and seal on the side */
const PartsFig: FC = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Centrifugal pump parts">
    <defs>
      <marker id="ev-pm-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={ink} />
      </marker>
    </defs>
    <Tx x={160} y={18} t="Section across the impeller" b />
    {/* volute casing: spiral */}
    <path d="M160,40 C250,40 280,100 280,150 C280,215 225,262 160,262 C95,262 40,215 40,150 C40,90 95,40 160,40 Z" fill={water} opacity={0.25} stroke={ink} strokeWidth={2.4} />
    {/* discharge nozzle */}
    <rect x={266} y={40} width={80} height={26} fill={panel2} stroke={ink} strokeWidth={2} />
    <line x1={270} y1={53} x2={360} y2={53} stroke={ink} markerEnd="url(#ev-pm-a)" />
    <Tx x={310} y={34} t="discharge nozzle" s={11} />
    {/* impeller */}
    <circle cx={160} cy={150} r={62} fill={panel2} stroke={accent} strokeWidth={2.4} />
    <circle cx={160} cy={150} r={18} fill="none" stroke={ink} strokeWidth={1.6} />
    <Tx x={160} y={154} t="eye" s={10.5} />
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3
      const a2 = a + 0.9
      return <path key={i} d={`M${160 + 18 * Math.cos(a)},${150 + 18 * Math.sin(a)} Q${160 + 48 * Math.cos(a + 0.2)},${150 + 48 * Math.sin(a + 0.2)} ${160 + 62 * Math.cos(a2)},${150 + 62 * Math.sin(a2)}`} fill="none" stroke={accent} strokeWidth={2.2} />
    })}
    <path d="M130,100 a40,40 0 0 1 -10,40" fill="none" stroke={bad} strokeWidth={2} markerEnd="url(#ev-pm-a)" />
    <Tx x={100} y={86} t="rotation" s={10.5} c={bad} />
    <Tx x={160} y={236} t="volute (casing)" s={11} />
    <Tx x={220} y={214} t="vanes" s={10.5} c={accent} />
    {/* suction */}
    <rect x={150} y={262} width={20} height={34} fill={panel2} stroke={ink} strokeWidth={2} />
    <Tx x={200} y={288} t="suction (axial, into the eye)" a="start" s={11} />
    {/* side view with shaft */}
    <Tx x={500} y={18} t="Parts" b />
    {[
      ['Impeller', 'vanes push the liquid; gives it energy (open, semi-open, closed)'],
      ['Volute / casing', 'widening spiral; cuts velocity, raises pressure'],
      ['Shaft', 'transmits torque, carries the impeller; protected by a renewable sleeve'],
      ['Stuffing box, packing', 'seal where the shaft leaves the casing'],
      ['Casing wear ring', 'limits leakage from discharge back to suction'],
      ['Suction and discharge nozzles', 'water enters at the eye, leaves tangentially'],
    ].map(([k, d], i) => (
      <g key={k}>
        <Tx x={372} y={46 + i * 36} t={k} a="start" b s={11} />
        <Tx x={372} y={61 + i * 36} t={d.length > 52 ? d.slice(0, 50) + '…' : d} a="start" s={10.5} c={mute} />
      </g>
    ))}
  </svg>
)

/** qualitative performance curves: H, efficiency, power and NPSHr against Q */
const PerfFig: FC = () => {
  const X = (q: number) => 70 + q * 520
  const Y = (v: number) => 250 - v * 210
  const path = (f: (q: number) => number) => Array.from({ length: 41 }, (_, i) => `${X(i / 40)},${Y(f(i / 40))}`).join(' ')
  const H = (q: number) => 0.95 - 0.35 * q * q - 0.25 * q ** 4
  const E = (q: number) => 0.9 * Math.exp(-(((q - 0.62) / 0.3) ** 2))
  const P = (q: number) => 0.3 + 0.55 * q - 0.1 * q * q
  const N = (q: number) => 0.1 + 0.5 * q * q
  return (
    <svg viewBox="0 0 640 310" width="100%" role="img" aria-label="Centrifugal pump performance curves">
      <line x1={70} y1={30} x2={70} y2={250} stroke={ink} />
      <line x1={70} y1={250} x2={600} y2={250} stroke={ink} />
      <Tx x={335} y={286} t="discharge Q →" />
      <text x={20} y={140} fontSize={11.5} fill={ink} textAnchor="middle" transform="rotate(-90 20 140)">
        H, power, efficiency, NPSHr
      </text>
      <polyline points={path(H)} fill="none" stroke={ink} strokeWidth={2.6} />
      <polyline points={path(E)} fill="none" stroke={good} strokeWidth={2.6} />
      <polyline points={path(P)} fill="none" stroke={accent} strokeWidth={2.6} />
      <polyline points={path(N)} fill="none" stroke={bad} strokeWidth={2.4} strokeDasharray="5 3" />
      <line x1={X(0.62)} y1={Y(E(0.62))} x2={X(0.62)} y2={250} stroke={mute} strokeDasharray="4 3" />
      <circle cx={X(0.62)} cy={Y(E(0.62))} r={4} fill={good} />
      <Tx x={X(0.62)} y={266} t="BEP" b s={11} />
      <Tx x={X(0)} y={Y(H(0)) - 6} t="H–Q: shut-off head at Q = 0" a="start" s={11} />
      <Tx x={X(0.78)} y={Y(H(0.8)) - 8} t="head H" a="start" b s={11} />
      <Tx x={X(0.38)} y={Y(E(0.38)) - 8} t="efficiency η" a="end" b c={good} s={11} />
      <Tx x={X(0.95)} y={Y(P(0.95)) - 6} t="power P" a="end" b c={accent} s={11} />
      <Tx x={X(1)} y={Y(N(1)) + 14} t="NPSHr" a="end" b c={bad} s={11} />
      <Tx x={80} y={50} t="efficiency peaks at one flow (BEP); power rises with Q; NPSHr rises with Q" a="start" s={11} c={mute} />
    </svg>
  )
}

/** pump curve and system curve cross at the operating point; two pumps in parallel and in series */
const OperatingFig: FC = () => {
  const X = (q: number) => 70 + q * 520
  const Y = (v: number) => 250 - v * 210
  const path = (f: (q: number) => number, q1 = 1) => Array.from({ length: 41 }, (_, i) => `${X((i / 40) * q1)},${Y(f((i / 40) * q1))}`).join(' ')
  const pump = (q: number) => 0.95 - 0.5 * q * q
  const sys = (q: number) => 0.32 + 0.45 * q * q
  const par = (q: number) => pump(q / 2)
  // intersection of pump and system: 0.95-0.5q²=0.32+0.45q² -> q²=0.63/0.95
  const q1 = Math.sqrt(0.63 / 0.95)
  // parallel: 0.95-0.5(q/2)^2 = 0.32+0.45 q^2 -> 0.63 = q²(0.45+0.125)
  const q2 = Math.sqrt(0.63 / 0.575)
  return (
    <svg viewBox="0 0 640 310" width="100%" role="img" aria-label="Pump curve, system curve and operating point">
      <line x1={70} y1={30} x2={70} y2={250} stroke={ink} />
      <line x1={70} y1={250} x2={600} y2={250} stroke={ink} />
      <Tx x={335} y={286} t="discharge Q →" />
      <text x={22} y={140} fontSize={11.5} fill={ink} textAnchor="middle" transform="rotate(-90 22 140)">
        head H
      </text>
      <line x1={70} y1={Y(0.32)} x2={600} y2={Y(0.32)} stroke={mute} strokeDasharray="4 3" />
      <Tx x={74} y={Y(0.32) + 14} t="static head" a="start" s={11} c={mute} />
      <polyline points={path(sys, 1.18)} fill="none" stroke={bad} strokeWidth={2.6} />
      <Tx x={X(1.1)} y={Y(sys(1.1)) - 6} t="system curve" a="end" b c={bad} s={11} />
      <polyline points={path(pump)} fill="none" stroke={ink} strokeWidth={2.6} />
      <Tx x={X(0.04)} y={Y(pump(0)) - 6} t="pump (H–Q) curve" a="start" b s={11} />
      <polyline points={path(par, 1.9)} fill="none" stroke={accent} strokeWidth={2.2} strokeDasharray="5 3" />
      <Tx x={X(1.0)} y={Y(par(1.0)) - 10} t="two pumps in parallel (Q added at the same H)" a="start" s={10.5} c={accent} />
      <circle cx={X(q1)} cy={Y(sys(q1))} r={5} fill={good} />
      <line x1={X(q1)} y1={Y(sys(q1))} x2={X(q1)} y2={250} stroke={mute} strokeDasharray="3 3" />
      <Tx x={X(q1) - 8} y={Y(sys(q1)) - 10} t="operating point (one pump)" a="end" b c={good} s={11} />
      <circle cx={X(q2)} cy={Y(sys(q2))} r={4} fill={accent2} />
      <Tx x={X(q2) + 8} y={Y(sys(q2)) + 14} t="Q₂ is less than 2Q₁" a="start" s={10.5} />
      <Tx x={X(q1)} y={266} t="Q₁" s={11} />
      <Tx x={X(q2)} y={266} t="Q₂" s={11} />
    </svg>
  )
}

const CharFig: FC = () => (
  <>
    <PartsFig />
    <PerfFig />
  </>
)

const lists: EvList[] = [
  {
    id: 'l-pump-why',
    topic: T,
    title: 'Purposes of pumps in a water supply system',
    ask: 'State the purposes of pumps in a water supply system.',
    points: [
      { k: 'To increase or boost up pressure in the main', alt: ['boost pressure', 'increase pressure'] },
      { k: 'To lift water from one level to another', alt: ['lift water', 'lift water to a higher level'] },
      { k: 'To supply water under pressure instead of gravity', alt: ['supply under pressure'] },
    ],
    seen: ['2011-12'],
    src: 'RM L8 p3',
  },
  {
    id: 'l-pump-mech',
    topic: T,
    title: 'Pump types by mechanical principle of operation',
    ask: 'State the names of the different types of pumps on the basis of mechanical properties.',
    points: [
      { k: 'Displacement pumps', alt: ['positive displacement pump', 'reciprocating pump'], d: 'reciprocating or rotary' },
      { k: 'Centrifugal pumps', alt: ['centrifugal'], d: 'extensively used in modern water works' },
      { k: 'Air lift pumps', alt: ['airlift pump', 'air lift'] },
    ],
    hook: 'Displace, Centrifuge, Air lift.',
    seen: ['2008-09', '2011-12'],
    src: 'RM L8 p4',
  },
  {
    id: 'l-pump-service',
    topic: T,
    title: 'Pump types by type of service',
    points: [
      { k: 'Deep well pumps', d: 'in tubewells' },
      { k: 'Low lift pumps', d: 'small heads, at the treatment plant' },
      { k: 'High lift pumps', d: 'large head, clear water reservoir to elevated tank' },
      { k: 'Booster pumps', d: 'raise pressure in the distribution system' },
      { k: 'Fire service pumps', d: 'build up pressure for fire fighting' },
      { k: 'Stand-by pumps', alt: ['standby pumps'], d: 'for power failure; steam, diesel' },
    ],
    seen: ['2008-09'],
    src: 'RM L8 p4–5',
  },
  {
    id: 'l-pump-power',
    topic: T,
    title: 'Pump types by power used',
    points: [
      { k: 'Steam pumps' },
      { k: 'Gasoline pumps', alt: ['petrol pumps'] },
      { k: 'Diesel pumps' },
      { k: 'Electric pumps', d: 'most common in water works: no smoke, dust or noise, economical, small floor space' },
    ],
    seen: ['2008-09'],
    src: 'RM L8 p4',
  },
  {
    id: 'l-pump-cent-adv',
    topic: T,
    title: 'Advantages (merits) of centrifugal pumps',
    ask: 'What are the advantages of a centrifugal pump?',
    points: [
      { k: 'Low initial cost', alt: ['low initial costs', 'cheap'] },
      { k: 'Simple mechanism, simple operation and repair', alt: ['simple operation and repair', 'simple'] },
      { k: 'Stability of flow', alt: ['steady flow', 'uniform flow'] },
      { k: 'Safe against high pressures', alt: ['safe against high pressure'] },
      { k: 'Adaptability to high heads', alt: ['high heads'] },
      { k: 'Small space requirement', alt: ['compact', 'small space'] },
      { k: 'Good durability', alt: ['durable'] },
    ],
    hook: 'Cheap, Simple, Steady, Safe, High-head, Small, Durable.',
    seen: ['2007-08', '2008-09', '2011-12'],
    src: 'RM L8 p12',
  },
  {
    id: 'l-pump-cent-dis',
    topic: T,
    title: 'Disadvantages (demerits) of centrifugal pumps',
    ask: 'What are the disadvantages of a centrifugal pump?',
    points: [
      { k: 'Limited suction lift', alt: ['limited suction'], d: 'cannot lift water more than about 7–8 m' },
      { k: 'No self-priming arrangement', alt: ['not self-priming', 'needs priming'] },
      { k: 'Speed regulating gears needed to adjust speed', alt: ['speed regulating gears'] },
      { k: 'Low efficiency over wide H and Q range', alt: ['low efficiency'] },
    ],
    seen: ['2007-08', '2008-09', '2011-12'],
    src: 'RM L8 p12',
  },
  {
    id: 'l-pump-cent-parts',
    topic: T,
    title: 'Major parts of a centrifugal pump',
    points: [
      { k: 'Impeller', d: 'vanes push the liquid, giving it energy' },
      { k: 'Volute casing', alt: ['casing', 'volute'], d: 'curved, widening; reduces velocity, raises pressure' },
      { k: 'Shaft', d: 'transmits torque, protected by a renewable sleeve' },
      { k: 'Shaft sleeve' },
      { k: 'Stuffing box and packing', alt: ['stuffing box', 'packing'] },
      { k: 'Casing wear ring', alt: ['wear ring'] },
      { k: 'Eye of the impeller', alt: ['impeller eye'] },
      { k: 'Discharge nozzle' },
    ],
    seen: ['2016-17', '2017-18'],
    src: 'RM L8 p8–10',
  },
  {
    id: 'l-pump-impeller',
    topic: T,
    title: 'Impeller types',
    points: [{ k: 'Open impeller', alt: ['open'] }, { k: 'Semi-open impeller', alt: ['semi open', 'semi-open'] }, { k: 'Closed impeller', alt: ['closed'] }],
    seen: [],
    src: 'RM L8 p9',
  },
  {
    id: 'l-pump-work',
    topic: T,
    title: 'How a centrifugal pump works',
    ordered: true,
    points: [
      { k: 'Liquid is forced into the impeller', alt: ['liquid enters the impeller eye'] },
      { k: 'Vanes pass kinetic energy; liquid leaves the impeller', alt: ['kinetic energy imparted by vanes'] },
      { k: 'Volute casing converts kinetic energy to pressure energy', alt: ['velocity head converted to pressure head'] },
    ],
    seen: ['2016-17', '2017-18'],
    src: 'RM L8 p6–7',
  },
  {
    id: 'l-pump-curves',
    topic: T,
    title: 'Performance (operational) curves of a centrifugal pump',
    ask: 'Discuss briefly the operational curves for centrifugal pumps with sketches.',
    points: [
      { k: 'Head–discharge (H–Q) curve', alt: ['H-Q curve', 'head capacity curve'], d: 'falls from the shut-off head as Q rises' },
      { k: 'Efficiency curve', alt: ['efficiency–discharge curve', 'η–Q'], d: 'peaks at the best efficiency point' },
      { k: 'Power (brake horsepower) curve', alt: ['power curve', 'BHP curve'], d: 'rises with discharge' },
      { k: 'NPSH required curve', alt: ['NPSHr curve', 'NPSH curve'], d: 'rises with discharge' },
    ],
    hook: 'Head, Efficiency, Power, NPSH vs Q.',
    seen: ['2015-16', '2016-17', '2017-18', '2022-23'],
    src: 'RM L8 p26–31; separate curves: textbook',
    note: 'The CE22 slides show only the H–Q curve, the system curve, the operating point and the vendor family chart (iso-efficiency, hp and NPSHr lines); the standalone η, P and NPSH curves are the standard textbook sketch.',
  },
  {
    id: 'l-pump-priming-cav',
    topic: T,
    title: 'Cavitation: causes',
    points: [
      { k: 'Low NPSH available', alt: ['low net positive suction head'] },
      { k: 'Clogged or blocked suction filters, strainers or inlet pipes', alt: ['clogged strainer', 'blocked suction'] },
      { k: 'Excessively high fluid temperature or viscosity', alt: ['high temperature'] },
      { k: 'Pump running too far right on its curve', alt: ['operating at too high a flow'] },
      { k: 'Long inlet piping', alt: ['long suction pipe'] },
    ],
    seen: ['2021-22', '2023-24'],
    src: 'RM L8 p24–25',
  },
  {
    id: 'l-pump-cav-prevent',
    topic: T,
    title: 'How to prevent cavitation',
    ask: 'How is cavitation avoided?',
    points: [
      { k: 'Clean clogged filters and clear blocked suction lines', alt: ['clean strainers'] },
      { k: 'Increase inlet pipe diameter to cut friction loss', alt: ['larger suction pipe'] },
      { k: 'Lower the fluid temperature or reduce motor speed (RPM)', alt: ['reduce speed', 'lower temperature'] },
      { k: 'Decrease the flow rate', alt: ['reduce flow'] },
      { k: 'Increase NPSH available', alt: ['raise NPSH available'], d: 'see the NPSH list below' },
    ],
    seen: ['2021-22', '2023-24'],
    src: 'RM L8 p25, p23',
  },
  {
    id: 'l-pump-npsh-fix',
    topic: T,
    title: 'Adjustments when NPSH available is close to NPSH required',
    points: [
      { k: 'Raise the water surface level in the suction well', alt: ['raise suction well level'] },
      { k: 'Lower the pump centreline elevation', alt: ['lower the pump', 'lower pump centerline'] },
      { k: 'Reduce head loss by increasing suction pipe size', alt: ['larger suction pipe'] },
      { k: 'Select a different model or type of pump', alt: ['different pump'] },
    ],
    seen: ['2020-21'],
    src: 'RM L8 p23',
  },
  {
    id: 'l-pump-select',
    topic: T,
    title: 'Factors for pump selection',
    ask: 'What factors should be considered in the selection of a pump?',
    points: [
      { k: 'System head capacity curve', alt: ['system head-capacity curve'], d: 'operate smoothly over variable static head' },
      { k: 'Suction head (NPSH)', alt: ['NPSH', 'suction head'], d: 'NPSH required at least 1 m less than NPSH available' },
      { k: 'Efficiency', d: 'operate near peak efficiency at normal conditions' },
      { k: 'Shut-off and run-out', alt: ['shut off and run out'], d: 'operate in the middle of the H–Q curve' },
      { k: 'Solids', d: 'pass only very small solids; use screens' },
    ],
    hook: 'System curve, Suction, Efficiency, Shut-off, Solids.',
    seen: ['2012-13', '2020-21'],
    src: 'RM L8 p45',
  },
  {
    id: 'l-pump-airlift',
    topic: T,
    title: 'Advantages and disadvantages of an air-lift pump',
    points: [
      { k: 'Advantage: no moving parts under water', alt: ['no submerged moving parts', 'simple'], d: 'simple and cheap to build' },
      { k: 'Advantage: can lift sandy, dirty or gritty water', alt: ['handles sand', 'handles sludge'], d: 'floc, raw sewage, grit, sludge' },
      { k: 'Advantage: works in crooked or small-diameter wells', alt: ['crooked wells'] },
      { k: 'Disadvantage: low efficiency', alt: ['low efficiency'], d: 'about 20–40%' },
      { k: 'Disadvantage: needs deep submergence', alt: ['large submergence'], d: 'well deeper than the lift' },
      { k: 'Disadvantage: needs an air compressor and its power', alt: ['compressor needed'] },
    ],
    seen: ['2007-08', '2010-11'],
    src: 'RM L8 p21 (principle, uses); merits and demerits: textbook',
    note: 'The slide gives only the principle and the uses; the advantages and disadvantages are the standard textbook ones.',
  },
  {
    id: 'l-pump-station',
    topic: T,
    title: 'Types of pump station',
    points: [
      { k: 'Wet-pit pumping station', alt: ['wet pit', 'wet well'], d: 'pump in or above the wet well, motor above' },
      { k: 'Dry-pit pumping station', alt: ['dry pit'], d: 'pump in a dry pit beside the wet well' },
    ],
    seen: [],
    src: 'RM L8 p48',
  },
]

const cards: EvCard[] = [
  { id: 'c-pump-def', topic: T, front: 'What is a pump?', back: 'A machine that **increases the total energy of a fluid**: it transfers to the fluid the energy it gets from the driving motor. Used in domestic, commercial, industrial, agricultural services and in water supply and wastewater drainage.', src: 'RM L8 p2' },
  { id: 'c-pump-cent', topic: T, front: 'Principle of a centrifugal pump?', back: 'Centrifugal force from the rotating **impeller** gives energy to the water; the **volute casing** (an area increasing spiral) converts the kinetic energy into pressure energy (static head).', seen: ['2016-17'], src: 'RM L8 p6' },
  { id: 'c-pump-priming', topic: T, front: 'Why does a centrifugal pump need priming?', back: 'It **cannot create suction at the start unless the impeller is filled with water**; air trapped in the casing gives no suction. Priming fills the impeller and suction pipe with water, especially at first start-up.', seen: ['2021-22', '2023-24'], src: 'RM L8 p11' },
  { id: 'c-pump-sub-prime', topic: T, front: 'Why is priming not required in a submersible pump?', back: 'The pump and motor are **always submerged below the water level**, so the impeller is permanently flooded with water and no air is trapped; the water is pushed up instead of being sucked up.', seen: ['2023-24'], src: 'RM L8 p14' },
  { id: 'c-pump-sub-vs-turb', topic: T, front: 'Deep well turbine vs submersible pump.', back: 'Turbine: motor at **ground level** (easy service, high efficiency). Submersible: motor **below the bowls and submerged** (whole assembly lifted for service, somewhat lower efficiency, water cools the motor).', src: 'RM L8 p14' },
  { id: 'c-pump-cav-def', topic: T, front: 'What is cavitation?', back: 'The **rapid formation and violent collapse of vapour bubbles** in the liquid. Local pressure falls below the vapour pressure, the liquid flashes to vapour, then implodes in a higher-pressure zone; it pits the impeller, makes noise and vibration and cuts efficiency.', seen: ['2021-22', '2023-24'], src: 'RM L8 p24' },
  { id: 'c-pump-npsh-def', topic: T, front: 'Define NPSH, NPSH required and NPSH available.', back: 'NPSH = absolute pressure head at the impeller eye (pump suction) above vapour pressure. **NPSHr**: needed by the pump (manufacturer test). **NPSHa** $= H_{abs} + H_S - h_L - H_{vp}$ from the suction piping layout.', seen: ['2012-13', '2020-21'], src: 'RM L8 p22' },
  { id: 'c-pump-npsh-why', topic: T, front: 'Why must NPSH available exceed NPSH required?', back: 'Inside the pump the pressure drops by NPSHr before the impeller adds energy. If the supply (NPSHa) is smaller, the pressure at the vanes falls below vapour pressure and the pump **cavitates**. Keep NPSHa above NPSHr, at least **1 m** more.', seen: ['2020-21'], src: 'RM L8 p22–23, p45' },
  { id: 'c-pump-npsh-terms', topic: T, front: 'Terms of the NPSHa equation.', back: '$H_{abs}$ absolute (atmospheric) head on the suction well surface; $H_S$ static suction head (+ flooded, − lift); $h_L$ suction pipe losses; $H_{vp}$ vapour pressure head (2.3 kPa at 20 °C).', src: 'RM L8 p22' },
  { id: 'c-pump-pd', topic: T, front: 'Centrifugal vs positive displacement pump.', back: 'Centrifugal: converts KE to pressure, flow varies with pressure, **low head and high flow**, efficiency peaks at one point. PD: fixed volume per stroke, **flow constant with pressure**, high pressure and low flow, handles viscous fluid; rotary types are limited in water works as grit damages gears.', src: 'RM L8 p19' },
  { id: 'c-pump-airlift-def', topic: T, front: 'Working principle of an air-lift pump.', back: 'Compressed air is injected near the bottom of a **submerged riser pipe**; the air bubbles mix with water making the mixture **lighter than the surrounding water**, so it rises and flows out of the pipe. No submerged moving parts.', seen: ['2008-09', '2010-11'], src: 'RM L8 p21' },
  { id: 'c-pump-head', topic: T, front: 'Static head: lift suction vs flooded suction.', back: 'Lift suction (pump above the source): $H_{stat} = H_D + H_S$. Flooded suction (pump below the water level): $H_{stat} = H_D - H_S$. Total dynamic head $h_p = h + V^2/2g + h_L$.', src: 'RM L8 p33–35' },
  { id: 'c-pump-power', topic: T, front: 'Pump power formulas.', back: 'Water power $P_W = \\gamma h_p Q$; $P_W = h_p Q/3960$ hp (ft and gpm); $= \\gamma h_p Q/75$ hp (m, m³/s, kg/m³). Input (brake) power $P_P = P_W/\\eta$.', src: 'RM L8 p40' },
  { id: 'c-pump-parallel', topic: T, front: 'Pumps in parallel and in series: what adds?', back: '**Parallel**: discharges add at the same head (operating Q is **less than double**, since friction rises). **Series**: heads add at the same discharge.', seen: ['2012-13'], src: 'RM L8 p46–47' },
  { id: 'c-pump-oversize', topic: T, front: 'What happens when a pump is oversized and throttled?', back: 'A throttle valve raises the system curve, so head rises and the operating point moves away from the BEP (82% falls to 77% in the slide). Better: **reduce speed or trim the impeller**, or fit a pump whose BEP is at the needed point.', src: 'RM L8 p31' },
  { id: 'c-pump-system', topic: T, front: 'What is the system curve?', back: 'Total static head plus friction (and minor) head rising as a parabola with Q: $H_{sys} = H_{stat} + h_L(Q)$. Where it crosses the pump H–Q curve is the **operating point**.', seen: ['2010-11'], src: 'RM L8 p27–28' },
  { id: 'c-pump-bep', topic: T, front: 'What is the best efficiency point (BEP)?', back: 'The flow at which pump efficiency is highest. The pump should operate near it; operating near shut-off or run-out can damage the pump.', src: 'RM L8 p29, p45' },
  { id: 'c-pump-pumpstation', topic: T, front: 'Wet pit vs dry pit station.', back: 'Wet pit: pump (submersible or vertical) in the wet well with the motor above. Dry pit: pump in a dry chamber beside the wet well with gate, check and butterfly valves on a common header.', src: 'RM L8 p48' },
  { id: 'c-pump-ex1', topic: T, front: 'Slide Example 1 (7200 gpm, 800 ft, 12 ft/s, f = 0.0075, 70%): the answer.', back: 'd = 1.4 ft; $H = 60 + 9.58 + 2.24 = 71.82$ ft; water power 130.58 hp; **brake horsepower 186.5 hp** (uses constant 3960).', src: 'RM L8 p41' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-pump-types',
    topic: T,
    q: 'State the purposes of pumps in a water supply system. What are the different types of pumps?',
    seen: ['2008-09', '2011-12'],
    a: `### Purposes of pumps
1. To **increase or boost up the pressure** in the main.
2. To **lift water from one level to another** (from tubewell, intake or clear-water reservoir to treatment plant or elevated tank).
3. To **supply water under pressure** instead of by gravity.

### Types
| Basis | Types |
|---|---|
| **Mechanical principle** | **displacement** (reciprocating, rotary), **centrifugal**, **air lift** |
| **Service** | deep well, low lift (plant, small head), high lift (clear-water reservoir to elevated tank), booster (distribution), fire service, stand-by |
| **Power used** | steam, gasoline, diesel, **electric** (most common in water works) |

Centrifugal pumps are extensively used in modern water works; electric drive is clean, quiet, economical and compact.`,
    keys: ['increase or boost up the pressure', 'lift water', 'under pressure', 'displacement', 'centrifugal', 'air lift', 'deep well', 'low lift', 'high lift', 'booster', 'electric'],
    lists: ['l-pump-why', 'l-pump-mech', 'l-pump-service', 'l-pump-power'],
    src: 'RM L8 p3–5',
  },
  {
    id: 'a-pump-cent-adv-dis',
    topic: T,
    q: 'What are the advantages and disadvantages of a centrifugal pump?',
    seen: ['2007-08', '2008-09', '2011-12'],
    a: `### Advantages
1. **Low initial cost**.
2. **Simple mechanism**, simple operation and repair.
3. **Stability of flow**.
4. **Safe against high pressures** (a closed valve does not burst it).
5. **Adaptability to high heads** (multistage).
6. **Small space requirement**.
7. **Good durability**; many kinds of power drive it.

### Disadvantages
1. **Limited suction lift**.
2. **No self-priming arrangement**: must be primed before starting.
3. **Speed regulating gears** are required to adjust the speed.
4. **Low efficiency over a wide range of head and discharge** (efficiency is high only near the best efficiency point).`,
    keys: ['Low initial cost', 'Simple mechanism', 'Stability of flow', 'high pressures', 'high heads', 'Small space', 'Limited suction lift', 'self-priming', 'Speed regulating gears', 'Low efficiency'],
    lists: ['l-pump-cent-adv', 'l-pump-cent-dis'],
    src: 'RM L8 p12',
  },
  {
    id: 'a-pump-airlift',
    topic: T,
    q: 'What is the working principle of an air-lift pump? What are its advantages and disadvantages?',
    seen: ['2007-08', '2008-09', '2010-11'],
    a: `### Principle
1. An **air-lift pump** uses **compressed air** to lift water without any submerged moving parts.
2. A vertical **riser pipe** is submerged in the water and compressed air from a compressor or blower is injected into it near the bottom.
3. The **rising air bubbles mix with the water**, making the mixture **lighter than the surrounding water**, so it flows upward and out of the pipe.
4. Used for chemical floc, raw sewage, grit, primary and return sludge, mixed liquor (and for developing tubewells).

### Advantages (textbook)
1. **No moving parts** in the water: simple, cheap, little maintenance.
2. Handles **sandy, gritty, dirty water** and sludge; works in **crooked or small wells**.

### Disadvantages (textbook)
1. **Low efficiency** (about 20–40%).
2. Needs **deep submergence** (the well must be deeper than the lift) and an **air compressor** with power; delivery head is small.`,
    keys: ['compressed air', 'riser pipe', 'lighter than the surrounding water', 'No moving parts', 'sandy', 'Low efficiency', 'submergence', 'compressor'],
    lists: ['l-pump-airlift'],
    src: 'RM L8 p21; advantages and disadvantages: textbook',
  },
  {
    id: 'a-pump-cent-char',
    topic: T,
    q: 'What are the characteristics of centrifugal pumps? State with necessary diagrams.',
    seen: ['2016-17', '2017-18'],
    a: `### Working
1. A **centrifugal pump** has two main parts, the **impeller** and the **volute casing**; the impeller is driven by a shaft.
2. Liquid is forced into the impeller eye; **vanes pass kinetic energy** to it, it rotates and leaves the impeller.
3. The **volute casing** (widening spiral) **reduces velocity and increases pressure**, converting kinetic energy to pressure energy.
4. It must be **primed** (impeller full of water) before starting; suction lift is limited.

### Characteristics (the curves)
1. **Head–discharge (H–Q)**: head is highest at shut-off and falls as Q increases.
2. **Efficiency–discharge**: rises to a peak at the **best efficiency point** and falls again; efficiency is highest at one particular flow.
3. **Power–discharge**: brake horsepower rises with Q.
4. **NPSH required–discharge**: rises with Q.
5. **Operating point** where the system curve crosses the H–Q curve; pumps in **parallel** add Q at the same H, in **series** add H at the same Q.
6. Family chart: curves for several impeller diameters with iso-efficiency, hp and NPSHr lines.

### Merits
Low cost, simple, steady flow, high heads, compact; demerits: limited suction lift, no self-priming, low efficiency away from BEP.`,
    keys: ['impeller', 'volute casing', 'kinetic energy', 'pressure energy', 'primed', 'Head–discharge', 'Efficiency–discharge', 'best efficiency point', 'Power–discharge', 'NPSH required', 'parallel', 'series'],
    lists: ['l-pump-cent-parts', 'l-pump-work', 'l-pump-curves'],
    src: 'RM L8 p6–12, p26–31, p46; separate η, P curves: textbook',
    Fig: CharFig,
  },
  {
    id: 'a-pump-curves',
    topic: T,
    q: 'Discuss briefly the operational (performance) curves of a centrifugal pump with sketches.',
    seen: ['2015-16', '2022-23'],
    a: `### Performance curves (at constant speed)
A series of curves that show how a pump performs under various conditions, drawn against discharge Q:
1. **Head–capacity (H–Q) curve**: the pump produces its **shut-off head at Q = 0**, and the head falls as discharge rises (flat at low Q, steeper at high Q).
2. **Efficiency curve**: rises, reaches a maximum at the **best efficiency point (BEP)** and falls. Efficiency is highest at one particular flow rate; run near the BEP, never near shut-off or run-out.
3. **Power (brake horsepower) curve**: power required rises with discharge (in a radial pump it is low at shut-off), and is used to size the motor.
4. **NPSH required curve**: rises with discharge; it must stay below NPSH available to avoid cavitation.
5. **Family of curves** from the vendor: several impeller diameters, with **iso-efficiency lines**, hp lines and NPSHr lines.
6. **System curve** (static head plus friction head) crosses the H–Q curve at the **operating point**.`,
    keys: ['Head–capacity', 'shut-off head', 'Efficiency curve', 'best efficiency point', 'Power', 'NPSH required', 'iso-efficiency', 'operating point'],
    lists: ['l-pump-curves'],
    src: 'RM L8 p26–31; separate η, P, NPSH curves: textbook',
    Fig: PerfFig,
  },
  {
    id: 'a-pump-system',
    topic: T,
    q: 'Write a short note on the pump curve and the system curve (operating point, pumps in combination).',
    seen: ['2010-11', '2012-13'],
    a: `### Pump curve
The **H–Q curve** of a centrifugal pump at fixed speed: head falls as discharge increases.

### System curve
1. **Static head** (horizontal line, lift between the two water levels) plus the **friction and minor losses**, which rise as a parabola with flow: $H_{sys} = H_{stat} + h_L(Q)$, $h_L \\propto Q^2$.

### Operating point
1. Where the pump curve and the system curve **intersect**: the head and discharge at which the pump actually works.
2. A **throttling valve** raises the system curve; a **trimmed impeller or lower speed** lowers the pump curve. An oversized pump throttled away from its BEP wastes energy.
3. **Parallel**: discharges add at the same head; the operating capacity is **less than doubled** because of extra friction. **Series**: heads add at the same discharge.`,
    keys: ['H–Q curve', 'static head', 'friction', 'intersect', 'operating point', 'throttling', 'Parallel', 'Series'],
    lists: ['l-pump-curves'],
    src: 'RM L8 p27–31, p46–47',
    Fig: OperatingFig,
  },
  {
    id: 'a-pump-priming-cav',
    topic: T,
    q: 'Why is priming not required in a submersible pump? What is cavitation? How are priming and cavitation avoided in a submersible pump?',
    seen: ['2021-22', '2023-24'],
    a: `### Priming
1. A **centrifugal pump cannot create suction at the start unless its impeller is filled with water**; trapped air gives no suction. **Priming** = filling the impeller and suction line fully with liquid, free of air.
2. In a **submersible pump** the pump and motor are installed **below the water level and submerged at all times**, so the impeller is always flooded and no air is trapped: **no priming is needed**, and no suction lift is involved. Avoid priming problems by keeping the pump **always submerged** (below the lowest drawdown level, with a margin).

### Cavitation
**Cavitation** is the **rapid formation and violent collapse of vapour bubbles**: local pressure falls below the vapour pressure, the liquid flashes to vapour and then implodes in a higher-pressure zone, causing pitting, noise, vibration and loss of efficiency.

**Causes**: low NPSH available; clogged strainers or suction pipes; high temperature or viscosity; operating too far right on the curve; long inlet piping.

### How it is avoided in a submersible pump
1. Keep **NPSH available well above NPSH required** (at least 1 m more): set the pump **deep below the pumping water level**, so submergence head is large.
2. **Clean the strainers** and suction screens and keep the intake from clogging.
3. Use a **larger inlet pipe** or a short intake to reduce friction loss.
4. Keep the **water cool**, reduce speed (RPM) and decrease the flow rate, so the pump does not run beyond the right of its curve.
5. Select a pump whose **BEP** matches the duty.`,
    keys: ['impeller is filled with water', 'Priming', 'submerged at all times', 'no priming is needed', 'Cavitation', 'vapour bubbles', 'NPSH available', 'strainers', 'larger inlet pipe', 'reduce speed', 'decrease the flow rate'],
    lists: ['l-pump-priming-cav', 'l-pump-cav-prevent', 'l-pump-npsh-fix'],
    src: 'RM L8 p11, p14, p22–25',
  },
  {
    id: 'a-pump-selection',
    topic: T,
    q: 'What factors should be considered in the selection of the type of pump?',
    seen: ['2012-13', '2020-21'],
    a: `### Factors for pump selection
1. **System head–capacity curve**: the pump must operate **smoothly over variable static-head conditions** (reservoir levels vary).
2. **Suction head**: **NPSH required should be at least 1 m less than NPSH available**.
3. **Efficiency**: choose a pump that works **near peak efficiency (BEP)** at the normal operating condition.
4. **Shut-off and run-out**: operate in the **middle of the H–Q curve**; operating near the shut-off or run-out heads can damage the pump.
5. **Solids**: water supply pumps pass only very small solids; use **screens** to remove them.
6. Also: type of service (deep well, low lift, high lift, booster), power source, capacity and head required, initial and running cost, space and reliability.`,
    keys: ['System head–capacity curve', 'Suction head', 'NPSH required', '1 m less', 'Efficiency', 'Shut-off and run-out', 'middle of the H–Q curve', 'Solids', 'screens'],
    lists: ['l-pump-select'],
    src: 'RM L8 p45',
  },
  {
    id: 'a-pump-npsh',
    topic: T,
    q: 'Why should NPSH available be greater than NPSH required? Explain.',
    seen: ['2020-21'],
    a: `### Definitions
1. **NPSH** is the absolute pressure head of the fluid at the pump centreline or impeller eye as it enters the pump suction, above the vapour pressure.
2. **NPSH required** is what the pump needs for smooth, efficient operation (determined by the manufacturer's test).
3. **NPSH available** depends on the suction layout: $NPSH_{av} = H_{abs} + H_S - h_L - H_{vp}$.

### Why NPSHa greater than NPSHr
1. Between the suction flange and the impeller vanes the pressure **drops by an amount equal to NPSHr** (entrance loss and acceleration).
2. If NPSHa is not larger than NPSHr, the pressure at the vane inlet falls below the **vapour pressure**, vapour bubbles form and collapse: **cavitation** damages the impeller and drops head and efficiency.
3. So the safe rule is **NPSHa greater than NPSHr** (at least **1 m** more).
4. If NPSHa is close to NPSHr: raise the water level in the suction well, **lower the pump**, reduce suction head loss with a larger suction pipe, or choose another pump.`,
    keys: ['NPSH required', 'NPSH available', 'vapour pressure', 'cavitation', '1 m', 'lower the pump', 'larger suction pipe'],
    lists: ['l-pump-npsh-fix'],
    src: 'RM L8 p22–25, p45',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
