// ev-trans — water transmission: pipes and valves, corrosion of metal pipes, water hammer, pipe laying (Rowshan ma'am L9).
// No Joukowsky formula and no surge-tank text appear in the CE22 slides, so those parts of the water-hammer answers are textbook (flagged in pyq/rm.tsx).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-trans' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

/** water hammer in four stages on a reservoir–pipe–valve line, with the pressure oscillation at the valve */
const HammerFig: FC = () => {
  const panels = [
    { t: '1  steady flow', v: 'valve open: V', col: water, wave: false, note: 'pressure normal' },
    { t: '2  valve shut suddenly', v: 'flow stops at the valve', col: bad, wave: true, note: 'pressure wave runs back at speed a; water compressed, pipe swells' },
    { t: '3  wave reaches the tank', v: 'tank relieves the pressure', col: accent, wave: true, note: 'flow reverses toward the tank; pressure drops' },
    { t: '4  rebound', v: 'wave returns to the valve', col: bad, wave: true, note: 'low pressure, possible vapour cavity; cycle repeats and dies out by friction' },
  ]
  return (
    <svg viewBox="0 0 640 400" width="100%" role="img" aria-label="Water hammer phenomenon in four stages">
      <defs>
        <marker id="ev-wh-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ink} />
        </marker>
      </defs>
      {panels.map((p, i) => {
        const y = 12 + i * 70
        return (
          <g key={p.t}>
            <Tx x={8} y={y + 12} t={p.t} a="start" b s={11} />
            {/* reservoir */}
            <rect x={8} y={y + 22} width={54} height={38} fill={water} opacity={0.35} stroke={ink} />
            <Tx x={35} y={y + 46} t="tank" s={10.5} />
            {/* pipe */}
            <rect x={62} y={y + 30} width={250} height={i === 1 ? 24 : 20} fill={p.col} opacity={0.3} stroke={ink} strokeWidth={2} />
            {/* valve */}
            <rect x={312} y={y + 24} width={8} height={32} fill={i === 0 ? 'none' : ink} stroke={ink} />
            <Tx x={316} y={y + 70} t="valve" s={10} c={mute} />
            {i === 0 ? (
              <line x1={90} y1={y + 40} x2={290} y2={y + 40} stroke={ink} strokeWidth={2} markerEnd="url(#ev-wh-a)" />
            ) : i === 2 ? (
              <line x1={290} y1={y + 40} x2={90} y2={y + 40} stroke={ink} strokeWidth={2} markerEnd="url(#ev-wh-a)" />
            ) : null}
            {p.wave && (
              <line x1={i === 1 ? 300 : i === 2 ? 120 : 110} y1={y + 18} x2={i === 1 ? 140 : i === 2 ? 60 : 300} y2={y + 18} stroke={p.col} strokeWidth={2.4} strokeDasharray="4 3" markerEnd="url(#ev-wh-a)" />
            )}
            <Tx x={330} y={y + 30} t={p.v} a="start" s={11} />
            <Tx x={330} y={y + 46} t={p.note.length > 40 ? p.note.slice(0, 38) + '…' : p.note} a="start" s={10.5} c={mute} />
          </g>
        )
      })}
      {/* pressure oscillation */}
      <line x1={420} y1={300} x2={420} y2={380} stroke={ink} />
      <Tx x={414} y={326} t="p" a="end" s={11} />
      <Tx x={330} y={296} t="pressure at the valve vs time" a="start" b s={11} />
      <line x1={420} y1={340} x2={630} y2={340} stroke={mute} strokeDasharray="3 3" />
      <polyline points={Array.from({ length: 60 }, (_, k) => `${420 + k * 3.5},${340 - 36 * Math.exp(-k / 25) * Math.sign(Math.sin(k / 3.2)) * (Math.abs(Math.sin(k / 3.2)) > 0.01 ? 1 : 0)}`).join(' ')} fill="none" stroke={bad} strokeWidth={2.4} />
      <Tx x={300} y={344} t="normal pressure" a="start" s={10.5} c={mute} />
      <Tx x={525} y={392} t="time →  (shock waves die out)" s={10.5} c={mute} />
      <rect x={8} y={296} width={300} height={90} rx={6} fill={panel2} stroke={line} />
      <Tx x={16} y={314} t="Water hammer: sudden change of flow" a="start" b s={11} />
      <Tx x={16} y={330} t="kinetic energy of the moving column turns into" a="start" s={10.5} />
      <Tx x={16} y={344} t="pressure energy: a shock (pressure) wave of" a="start" s={10.5} />
      <Tx x={16} y={358} t="high and low pressure travels along the pipe," a="start" s={10.5} />
      <Tx x={16} y={372} t="banging it and risking burst or collapse" a="start" s={10.5} />
    </svg>
  )
}

const lists: EvList[] = [
  {
    id: 'l-trans-flow',
    topic: T,
    title: 'Two classes of flow in water supply systems',
    points: [
      { k: 'Open channel flow', d: 'top surface at atmospheric pressure, flow by gravity: canals, flumes and aqueducts, gravity conduits, grade tunnels' },
      { k: 'Pressure flow', alt: ['pipe flow'], d: 'water in the pipe above atmospheric pressure, flow by head difference' },
    ],
    seen: [],
    src: 'RM L9 p2',
  },
  {
    id: 'l-trans-design',
    topic: T,
    title: 'Design considerations of a conveyance system (with remedy)',
    points: [
      { k: 'Hydraulic transitions', d: 'supercritical and subcritical regimes' },
      { k: 'Water quality', d: 'pollution in open channels' },
      { k: 'Erosion control', d: 'set a maximum permissible velocity' },
      { k: 'Seepage and evaporation loss', alt: ['seepage and evaporation'], d: 'arid regions, permeable soil' },
      { k: 'Air control', d: 'air accumulates at high points and raises friction loss; air release valves' },
      { k: 'Transient pressure wave', alt: ['water hammer', 'surge'], d: 'abrupt change of velocity or direction; surge towers and surge control valves' },
    ],
    seen: [],
    src: 'RM L9 p8',
  },
  {
    id: 'l-trans-qualities',
    topic: T,
    title: 'Desirable qualities of pressure pipes',
    ask: 'What are the desirable qualities of pressure pipes?',
    points: [
      { k: 'Durability of the pipe material', alt: ['durability'] },
      { k: 'Strength and thickness to resist stress', alt: ['strength'] },
      { k: 'Smooth inner surface to avoid friction loss', alt: ['smooth inner surface'] },
      { k: 'No effect on the water', alt: ['should not affect water quality'] },
      { k: 'Light weight for easy transport, handling and laying', alt: ['light weight', 'lightweight'] },
      { k: 'Low initial cost with maximum service period', alt: ['low initial cost'] },
      { k: 'Low maintenance cost, easy joints, good against corrosive environment', alt: ['low maintenance cost', 'easy jointing', 'corrosion resistant'] },
      { k: 'Good hydraulic properties', alt: ['hydraulic properties'] },
    ],
    hook: 'Durable, Strong, Smooth, Neutral, Light, Cheap, Maintainable, Hydraulic.',
    seen: ['2010-11'],
    src: 'RM L9 p9',
  },
  {
    id: 'l-trans-corrosive-pipes',
    topic: T,
    title: 'Pipes suited to a corrosive environment',
    ask: 'Which type of pipe would you choose in a corrosive environment?',
    points: [
      { k: 'PVC / plastic pipe', alt: ['PVC pipe', 'plastic pipe', 'PVC'], d: 'corrosion free, light; limited size, cannot take heat' },
      { k: 'FRP pipe', alt: ['fibreglass reinforced plastic', 'fiberglass pipe'], d: 'exceptional corrosion resistance and smooth flow' },
      { k: 'Ductile iron pipe', alt: ['DI pipe'], d: 'with bituminous or zinc coating; good internal and external corrosion resistance' },
      { k: 'Asbestos-cement pipe', alt: ['AC pipe'], d: 'resists corrosion, tuberculation and incrustation' },
      { k: 'Vitrified clay pipe', alt: ['clay pipe'], d: 'free from corrosion; gravity use only' },
      { k: 'Copper pipe', alt: ['copper'], d: 'expensive but useful where corrosion is likely' },
    ],
    seen: ['2010-11'],
    src: 'RM L9 p15–20',
  },
  {
    id: 'l-trans-pipe-types',
    topic: T,
    title: 'Types of pressure pipes',
    points: [
      { k: 'Steel pipe', d: 'riveted or welded plates; thin, painted' },
      { k: 'Cast-iron pipe', alt: ['CI pipe'], d: 'city supplies; cement-mortar lining' },
      { k: 'Ductile iron pipe', alt: ['DI pipe'], d: 'better CI; 30% lighter; lower pumping cost' },
      { k: 'Concrete pipe', alt: ['prestressed concrete'], d: 'good hydraulics; alkaline water attacks it' },
      { k: 'Asbestos-cement pipe', alt: ['AC pipe'], d: 'light; weak in bending' },
      { k: 'Vitrified clay pipe', d: 'low pressure; mostly gravity' },
      { k: 'PVC pipe', alt: ['PVC'], d: 'light; no high temperature' },
      { k: 'GI pipe', alt: ['galvanised iron'], d: 'lead poisoning risk with acidic water' },
      { k: 'Copper pipe' },
      { k: 'Plastic pipe', d: 'not strong, small sizes' },
      { k: 'FRP pipe', alt: ['fiberglass reinforced plastic'] },
    ],
    seen: [],
    src: 'RM L9 p15–20',
  },
  {
    id: 'l-trans-valves',
    topic: T,
    title: 'Valves in a transmission system',
    points: [
      { k: 'Shut-off (isolation) valves', alt: ['gate valve', 'ball valve', 'butterfly valve', 'isolation valve'], d: 'isolate segments; tight seal, low loss when open' },
      { k: 'Check valve', alt: ['non-return valve', 'reflux valve', 'one-way valve'], d: 'allows flow in one direction only' },
      { k: 'Air valve', alt: ['air-relief valve', 'air release valve'], d: 'releases air accumulated at high points' },
      { k: 'Surge control valve', alt: ['surge valve'], d: 'prevents transient pressure waves; opens fast, closes slowly' },
    ],
    seen: [],
    src: 'RM L9 p10–14',
  },
  {
    id: 'l-trans-corr-factors',
    topic: T,
    title: 'Factors that induce corrosion of metal pipes',
    ask: 'Discuss briefly the factors affecting corrosion of metallic pipes.',
    points: [
      { k: 'Low pH', alt: ['acidic water', 'pH'], d: 'corrosive water: low pH' },
      { k: 'Low alkalinity', alt: ['alkalinity'] },
      { k: 'Soft water or non-carbonate hardness', alt: ['soft water', 'low hardness'], d: 'no protective CaCO₃ scale' },
      { k: 'Dissolved oxygen', alt: ['oxygen', 'DO'], d: 'cathodic reaction; also with chloride causes pitting' },
      { k: 'Chloride', alt: ['chloride ion'], d: 'accelerates pitting' },
      { k: 'TDS (conductivity)', alt: ['total dissolved solids', 'TDS'], d: 'raises electrical conductivity' },
      { k: 'Temperature', alt: ['high temperature'], d: 'faster reaction rates' },
      { k: 'Velocity of water', alt: ['high velocity', 'turbulence'], d: 'shear removes tubercles; abrasion' },
      { k: 'Cavitation', d: 'bombardment by water and vapour' },
      { k: 'Microbial action', alt: ['bacteria', 'sulphate reducing bacteria'], d: 'sulphate to H₂S to H₂SO₄ (anaerobic)' },
      { k: 'Dissimilar metals (galvanic action)', alt: ['galvanic corrosion', 'different metals'] },
    ],
    seen: ['2015-16', '2017-18', '2020-21'],
    src: 'RM L9 p21–28',
  },
  {
    id: 'l-trans-galv-prev',
    topic: T,
    title: 'Prevention of galvanic corrosion',
    points: [
      { k: 'Using insulators', alt: ['insulating joint', 'dielectric union'] },
      { k: 'Protective materials (paint, bituminous compounds)', alt: ['paint', 'protective coating'] },
      { k: 'Materials with similar electric potentials', alt: ['similar metals', 'same galvanic potential'] },
      { k: 'Metallic coatings (zinc, tin, nickel, chromium)', alt: ['metallic coating', 'galvanising'] },
    ],
    seen: ['2010-11'],
    src: 'RM L9 p23',
  },
  {
    id: 'l-trans-corr-control',
    topic: T,
    title: 'Control of corrosion in metal pipes',
    ask: 'How can corrosion of metal pipes be controlled?',
    points: [
      { k: 'Make the water stable', alt: ['treat the water', 'stabilise the water', 'adjust pH and alkalinity'], d: 'raise pH and alkalinity with lime or soda ash so that LI is zero or slightly positive' },
      { k: 'Lining and coating of pipes', alt: ['cement mortar lining', 'protective coating', 'bituminous coating', 'painting'] },
      { k: 'Cathodic protection', alt: ['sacrificial anode', 'impressed current'], d: 'magnesium or zinc anodes on the pipe' },
      { k: 'Insulating joints and same-potential materials', alt: ['insulators', 'dielectric union'] },
      { k: 'Metallic coatings', alt: ['galvanising', 'zinc coating'] },
      { k: 'Corrosion inhibitors', alt: ['polyphosphate', 'silicate'], d: 'form a thin protective film' },
      { k: 'Remove dissolved oxygen', alt: ['deaeration'] },
      { k: 'Moderate velocity, avoid dead ends', alt: ['control velocity'] },
      { k: 'Use non-metallic or corrosion-resistant pipes', alt: ['PVC', 'ductile iron', 'FRP'] },
    ],
    seen: ['2015-16', '2017-18'],
    src: 'RM L9 p23, p27–30 (stable water, galvanic); cathodic protection and inhibitors: textbook',
    note: 'The slides give galvanic prevention and the aim of stable water (Bayliss curve, LI, RI); the rest is the standard textbook list.',
  },
  {
    id: 'l-trans-corr-water',
    topic: T,
    title: 'Corrosive vs scale-forming water',
    points: [
      { k: 'Corrosive: low pH, low alkalinity, soft water', alt: ['corrosive water'] },
      { k: 'Scale-forming: high pH, high alkalinity, hard water', alt: ['scale forming water'] },
    ],
    seen: [],
    src: 'RM L9 p28',
  },
  {
    id: 'l-trans-hammer-causes',
    topic: T,
    title: 'Causes of water hammer',
    ask: 'What are the causes of water hammer in a water supply pipeline?',
    points: [
      { k: 'Sudden or quick closing of a valve', alt: ['rapid valve closure', 'sudden valve closure'] },
      { k: 'Sudden opening of a valve', alt: ['rapid valve opening'] },
      { k: 'Sudden stopping of a pump or power failure', alt: ['pump failure', 'power failure', 'pump trip'] },
      { k: 'Sudden starting of a pump', alt: ['pump start up', 'pump starting'] },
      { k: 'Abrupt change of velocity or direction of flow', alt: ['change in velocity or direction'] },
      { k: 'Air trapped in the pipe', alt: ['air pockets', 'column separation'] },
      { k: 'Bursting of a pipe', alt: ['pipe burst'] },
    ],
    seen: ['2023-24', '2009-10', '2012-13', '2016-17', 'Jan 2021', '2020-21', '2021-22', '2022-23'],
    src: 'RM L9 p8, p31 (abrupt change of velocity / valve closure, pump rate change); the list of causes: textbook',
  },
  {
    id: 'l-trans-hammer-control',
    topic: T,
    title: 'Ways to prevent or reduce water hammer',
    ask: 'How can water hammer be reduced?',
    points: [
      { k: 'Surge tower (surge tank)', alt: ['surge tank', 'surge towers', 'standpipe'], d: 'tank open to the air that absorbs and supplies the surge' },
      { k: 'Air chamber (air vessel)', alt: ['air vessel', 'air chamber', 'entrapped air'], d: 'cushion of trapped air absorbs the pressure wave' },
      { k: 'Surge control valves', alt: ['surge relief valve', 'pressure relief valve'], d: 'open fast, close slowly' },
      { k: 'Slow closing of valves', alt: ['slow valve operation', 'gradual closure'], d: 'closing time longer than 2L/a' },
      { k: 'Check valve with by-pass', alt: ['non-return valve'] },
      { k: 'Flywheel on the pump', alt: ['flywheel'], d: 'keeps the pump turning on power failure' },
      { k: 'Limit the flow velocity', alt: ['low velocity in pipes'] },
      { k: 'Air-relief and vacuum valves', alt: ['air release valve'] },
    ],
    seen: ['2016-17', 'Jan 2021', '2023-24'],
    src: 'RM L9 p8, p14, p32 (surge towers, surge control valves, air chamber); the rest: textbook',
  },
  {
    id: 'l-trans-laying',
    topic: T,
    title: 'Pipe laying operation',
    ask: 'Describe the procedure of laying water pipes.',
    ordered: true,
    points: [
      { k: 'Preparation of detailed plans of roads and streets', alt: ['detailed plans', 'plans of roads'] },
      { k: 'Locating the proposed alignment on the ground', alt: ['locating the alignment', 'setting out'] },
      { k: 'Excavating trenches', alt: ['excavation of trench'] },
      { k: 'Preparation of the bottom of the trench', alt: ['bedding'] },
      { k: 'Lowering of pipes into the trench', alt: ['lowering of pipes'] },
      { k: 'Laying of pipes', alt: ['laying'] },
      { k: 'Jointing of pipes', alt: ['jointing'] },
      { k: 'Anchoring of pipes', alt: ['anchoring', 'thrust blocks'] },
      { k: 'Backfilling the trench with excavated material', alt: ['back filling', 'backfilling'] },
      { k: 'Pipe testing', alt: ['testing'], d: 'pressure and leakage test' },
    ],
    hook: 'Plan, Locate, Dig, Bed, Lower, Lay, Joint, Anchor, Backfill, Test.',
    seen: ['2015-16', 'Jan 2021'],
    src: 'RM L9 p42',
  },
  {
    id: 'l-trans-problems',
    topic: T,
    title: 'Common problems in conveyance systems',
    points: [
      { k: 'High head loss needing excessive pumping head', alt: ['high head loss'], d: 'partly closed valve, trapped air, slime, scale' },
      { k: 'Excessive loss of water', alt: ['leakage'], d: 'leakage, unauthorised connections' },
      { k: 'Corrosion in pipes', alt: ['corrosion'], d: 'aggressive water' },
    ],
    seen: [],
    src: 'RM L9 p43',
  },
  {
    id: 'l-trans-om',
    topic: T,
    title: 'Operation and maintenance of conveyance systems',
    points: [
      { k: 'Maintain a record of pumping head against flow', alt: ['head flow record'], d: 'shows pipeline deterioration' },
      { k: 'Regular inspection', alt: ['inspection'], d: 'illegal connections, encroachments, nearby construction, slime, leaks, damaged structures' },
      { k: 'Check the operation of air-release and vacuum valves', alt: ['check air valves'] },
      { k: 'Inspect pipe interiors', alt: ['inspect pipe interior'], d: 'slime and lining deterioration' },
    ],
    seen: [],
    src: 'RM L9 p44',
  },
  {
    id: 'l-trans-forces',
    topic: T,
    title: 'Forces acting on a transmission pipe',
    points: [
      { k: 'Hydrostatic pressure', d: 'internal; hoop stress pd/2t' },
      { k: 'Thrust force', d: 'internal; at bends, tees, valves and dead ends' },
      { k: 'Transient pressure', alt: ['water hammer'], d: 'internal; sudden valve closure or pump change' },
      { k: 'Gravity and earth loads', alt: ['earth loads'], d: 'external; pipe, water and backfill weight' },
      { k: 'Environmental loads', d: 'external; seismic, thermal, frost' },
    ],
    seen: [],
    src: 'RM L9 p34',
  },
]

const cards: EvCard[] = [
  { id: 'c-trans-corr-def', topic: T, front: 'Define corrosion of metal pipes.', back: 'A process by which metals and their alloys are **destroyed by chemical, electrochemical means or by the action of physical forces**. Anode: $Fe \\to Fe^{2+} + 2e^-$; the ferrous ion then forms $Fe(OH)_2$, rust.', src: 'RM L9 p21' },
  { id: 'c-trans-tuber', topic: T, front: 'What is tuberculation?', back: 'Formation of **granular insoluble Fe(OH)₃ deposits** (tubercles) inside the pipe; it raises roughness and head loss and shelters bacteria.', src: 'RM L9 p21' },
  { id: 'c-trans-galvanic', topic: T, front: 'Galvanic corrosion: what and what decides the rate?', back: 'When two metals are in an electrolyte the **more active metal becomes the anode and corrodes**. Rate depends on (1) the relative position in the **galvanic series** and (2) the relative **surface areas** of anode and cathode.', seen: ['2010-11'], src: 'RM L9 p22–23' },
  { id: 'c-trans-galvanic-where', topic: T, front: 'Where does galvanic corrosion occur in a pipe system?', back: 'In pipes and fittings of **different metals** (copper joined to galvanised pipe) and between the pipe metal and **impurities** in the pipe metal.', src: 'RM L9 p23' },
  { id: 'c-trans-pitting', topic: T, front: 'What is pitting corrosion?', back: 'A localised electrochemical redox process in small holes on the metal surface, **worse than uniform corrosion**; starts from mechanical damage to the protective surface; **chloride and dissolved oxygen accelerate it**.', src: 'RM L9 p24' },
  { id: 'c-trans-micro', topic: T, front: 'Mechanism of pipe corrosion by microbial action.', back: 'In an **anaerobic** environment with nutrients, sulphate-reducing bacteria (*Vibrio desulphuricans*) reduce **sulphate to hydrogen sulphide**, which with water gives **sulphuric acid**; Fe²⁺ goes to FeS or FeSO₄ at the anode. Low pH (and alkaline conditions) help corrosion.', seen: ['2010-11'], src: 'RM L9 p25' },
  { id: 'c-trans-stable', topic: T, front: 'What is stable water?', back: 'Water on the Bayliss curve (pH against alkalinity): neither corrosive nor scale forming. A little scale protects the pipe; too much scale raises friction and clogs. **The aim of treatment is stable water.**', src: 'RM L9 p27' },
  { id: 'c-trans-lsi', topic: T, front: 'Langelier Saturation Index: formula and meaning.', back: '$LI = pH - pH_S$, $pH_S = (pK_2 - pK_S) + pCa^{2+} + pAlk$. **LI below 0 corrosive, above 0 scale forming.**', src: 'RM L9 p29' },
  { id: 'c-trans-ri', topic: T, front: 'Ryznar index scale.', back: '$RI = 2pH_S - pH$. Under 5.5 heavy scale; 5.5–6.2 some scale; **6.2–6.8 non-scaling, non-corrosive**; 6.8–8.5 corrosive; over 8.5 very corrosive.', src: 'RM L9 p30' },
  { id: 'c-trans-hazen', topic: T, front: 'Hazen–Williams velocity formula (British units) and C values.', back: '$V = 1.318\\,C\\,R^{0.63} h_L^{0.54}$, or $V = 0.55\\,C\\,D^{0.63} h_L^{0.54}$. C = 140 smooth steel, 130 good CI, 120 CI 5 years, 110 CI 10 years, 100 CI 15–20 years, 95 unlined riveted steel.', src: 'RM L9 p6' },
  { id: 'c-trans-manning', topic: T, front: 'Manning and Chezy for open channels.', back: 'Chezy $V = C\\sqrt{RS}$; Manning $V = \\frac{1}{n}R^{2/3}S^{1/2}$ (SI) or with 1.49 (British); $R$ = A/P; e.g. n = 0.011 cement plaster, 0.012 troweled concrete.', src: 'RM L9 p4–5' },
  { id: 'c-trans-hoop', topic: T, front: 'Hoop and longitudinal stress in a pipe.', back: 'Hoop $S_h = pd/2t$; longitudinal $S_t = pd/4t$ (half the hoop); thermal $\\sigma = E\\alpha\\Delta T$ is relieved by expansion joints.', src: 'RM L9 p35–36' },
  { id: 'c-trans-earth', topic: T, front: 'Earth load on a buried pipe.', back: 'Rigid pipe $w = c\\gamma B^2$; flexible pipe $w = c\\gamma B D$ (c from the table against H/B, B trench width, D pipe diameter). Superimposed loads include an impact factor (highway 1.5, railway 1.75, airfield 1.0).', src: 'RM L9 p37–39' },
  { id: 'c-trans-hammer-def', topic: T, front: 'Define water hammer.', back: 'The **pressure surge (shock wave)** in a pipe when the velocity or direction of flow is **changed abruptly**, for example by quick valve closure or pump stoppage: the kinetic energy of the moving water column turns into pressure energy that bangs the pipe.', seen: ['2016-17', 'Jan 2021', '2020-21', '2021-22', '2022-23', '2023-24', '2009-10', '2012-13'], src: 'RM L9 p8, p31' },
  { id: 'c-trans-hammer-wave', topic: T, front: 'Water hammer pressure rise (Joukowsky).', back: '$\\Delta p = \\rho a \\Delta V$ for closure faster than $2L/a$ (a = wave speed about 1000–1400 m/s in water pipes). Not in the CE22 slides; standard textbook.', src: 'textbook (Peavy; Aziz)' },
  { id: 'c-trans-surge', topic: T, front: 'Surge tank vs air chamber.', back: 'A **surge tank** is an open-top tank at a high point of the main that absorbs or supplies water to damp pressure waves. An **air chamber** is closed, with entrapped air that acts as a cushion near the pump or valve.', seen: ['2016-17', 'Jan 2021'], src: 'RM L9 p32–33 (picture); text: textbook' },
  { id: 'c-trans-valves', topic: T, front: 'Check valve: what and why?', back: 'A one-way (non-return, reflux) valve that **lets water flow in one direction only**. Needed where backflow can damage equipment, e.g. at a pump discharge.', src: 'RM L9 p13' },
  { id: 'c-trans-di', topic: T, front: 'Why ductile iron over cast iron?', back: 'Better **tensile strength**, high impact and wear resistance, ductility and corrosion resistance; smoother surface, bituminous or zinc coating, **about 30% lighter** and lower pumping cost because of less friction.', src: 'RM L9 p18' },
  { id: 'c-trans-gi', topic: T, front: 'Drawback of GI pipes with acidic water?', back: 'Acidic water dissolves the zinc coating and the pipe, which may cause **lead poisoning** (lead in joints and impurities).', src: 'RM L9 p19' },
  { id: 'c-trans-air', topic: T, front: 'Why are air valves placed at high points?', back: 'Air accumulates at high points in pressure pipes, reducing the flow area and **adding friction loss**; air-relief (release) valves discharge it, vacuum valves let air in when the pipe drains.', src: 'RM L9 p8, p14' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-trans-pipes',
    topic: T,
    q: 'What are the desirable qualities of pressure pipes? Which type of pipe would you choose in a corrosive environment?',
    seen: ['2010-11'],
    a: `### Desirable qualities of pressure pipes
1. **Durability** of the pipe material.
2. **Strength and thickness** to resist the stresses (internal pressure, earth load, water hammer).
3. **Smooth inner surface** to avoid friction loss.
4. **No effect on the water** (no taste, toxicity or contamination).
5. **Light weight** for easy transport, handling and laying.
6. **Low initial cost** with a maximum service period.
7. **Low maintenance cost**, joints that can be made easily, and good resistance to a **corrosive environment**.
8. **Good hydraulic properties**.

### Pipe for a corrosive environment
1. **PVC / plastic** pipe, **FRP** (glass-fibre reinforced plastic) pipe: no corrosion, light, smooth, long life (limits: size, strength, heat).
2. **Ductile iron** with bituminous or zinc coating and cement-mortar lining, or **asbestos-cement** and **concrete** pipe with suitable cement, are also resistant; **copper** is expensive but useful where corrosion is likely.
3. For steel or CI, use lining, coating and cathodic protection.
Choice: **PVC / FRP (or coated DI)** for small and large mains in aggressive soil or water.`,
    keys: ['Durability', 'Strength and thickness', 'Smooth inner surface', 'No effect on the water', 'Light weight', 'Low initial cost', 'Low maintenance cost', 'hydraulic properties', 'PVC', 'FRP', 'Ductile iron'],
    lists: ['l-trans-qualities', 'l-trans-corrosive-pipes', 'l-trans-pipe-types'],
    src: 'RM L9 p9, p15–20',
  },
  {
    id: 'a-trans-corr-factors',
    topic: T,
    q: 'Discuss briefly the factors that induce (affect) corrosion of metal pipes.',
    seen: ['2015-16', '2017-18', '2020-21'],
    a: `### Corrosion
Corrosion is the destruction of a metal by chemical, electrochemical means or physical forces: the pipe wall acts as **anode** ($Fe \\to Fe^{2+} + 2e^-$), the water as **electrolyte**, with a **cathodic** reaction using $H^+$ or oxygen; the product is rust, and granular Fe(OH)₃ deposits (**tuberculation**) form.

### Factors
1. **Water quality**: **low pH**, **low alkalinity** and **soft or non-carbonate hardness** make the water corrosive (high pH, high alkalinity and carbonate hardness form protective scale).
2. **Dissolved oxygen** and **chloride** accelerate pitting.
3. **TDS** raises electrical conductivity; **temperature** raises reaction rates.
4. **Velocity of water**: high velocity shear removes tubercles, exposes fresh metal; turbulence abrades.
5. **Cavitation**: bombardment by water and vapour.
6. **Microbial action**: sulphate-reducing bacteria in anaerobic soil or deposits produce H₂S and H₂SO₄.
7. **Dissimilar metals** (galvanic action) and impurities in the metal.
8. External: **soil** that is acidic, wet, high in sulphate or chloride, and stray currents (textbook).`,
    keys: ['anode', 'electrolyte', 'tuberculation', 'low pH', 'low alkalinity', 'Dissolved oxygen', 'chloride', 'TDS', 'Temperature', 'Velocity', 'Cavitation', 'Microbial', 'Dissimilar metals'],
    lists: ['l-trans-corr-factors', 'l-trans-corr-water'],
    src: 'RM L9 p21–28; soil and stray current: textbook',
  },
  {
    id: 'a-trans-corr-control',
    topic: T,
    q: 'How can corrosion of metal pipes be controlled?',
    seen: ['2015-16', '2017-18'],
    a: `### Control of corrosion
1. **Make the water stable**: adjust pH and alkalinity with lime or soda ash so the **Langelier index is zero or slightly positive** (Ryznar 6.2–6.8); a thin protective CaCO₃ scale is useful, too much scale is not. This is the objective of water treatment.
2. **Lining and coating**: cement-mortar lining inside, bituminous, coal-tar or epoxy coating and painting outside.
3. **Cathodic protection**: connect the pipe to a **sacrificial anode** (magnesium, zinc) or use impressed current.
4. **Galvanic control**: **insulators** (dielectric unions) between different metals, **materials with similar potentials**, **metallic coatings** (zinc, tin, nickel, chromium).
5. **Corrosion inhibitors**: polyphosphates and silicates form a protective film.
6. **Remove oxygen** (deaeration), keep **velocity moderate** and avoid dead ends.
7. **Use corrosion-resistant pipes** (PVC, FRP, ductile iron, asbestos-cement) where water or soil is aggressive.`,
    keys: ['stable', 'Langelier', 'Lining and coating', 'Cathodic protection', 'sacrificial anode', 'insulators', 'metallic coatings', 'inhibitors', 'deaeration', 'corrosion-resistant pipes'],
    lists: ['l-trans-corr-control', 'l-trans-galv-prev'],
    src: 'RM L9 p23, p27–30; cathodic protection, inhibitors: textbook',
  },
  {
    id: 'a-trans-corr-galvanic',
    topic: T,
    q: 'Write a short note on galvanic corrosion.',
    seen: ['2010-11'],
    a: `### Galvanic corrosion
1. When **two metals are immersed in an electrolyte**, the comparatively **more active metal becomes the anode and corrodes**; the more noble metal is the cathode.
2. The **rate** depends on (1) the **relative position of the metals in the galvanic series** (the wider apart, the faster) and (2) the **relative surface areas** of anode and cathode (a small anode with a large cathode corrodes fast).
3. **Where**: pipes and fittings of different metals (copper joined to galvanised steel) and between the pipe metal and impurities inside it.
4. **Prevention**: use **insulators** (dielectric union), **protective materials** (paint, bituminous compounds), **materials of similar electric potential**, **metallic coatings** (zinc, tin, nickel, chromium).`,
    keys: ['two metals', 'electrolyte', 'anode', 'galvanic series', 'surface areas', 'insulators', 'similar electric potential', 'metallic coatings'],
    lists: ['l-trans-galv-prev'],
    src: 'RM L9 p22–23',
  },
  {
    id: 'a-trans-corr-micro',
    topic: T,
    q: 'What is the mechanism of pipe corrosion by microbial action? (external corrosion)',
    seen: ['2010-11', '2012-13'],
    a: `### Microbial (external) corrosion
1. In the soil around buried metal pipes, **sulphate** is present with nutrients and **no oxygen** (anaerobic).
2. **Sulphate-reducing bacteria** (*Vibrio desulphuricans*) reduce **sulphate to hydrogen sulphide**.
3. With water, hydrogen sulphide gives **sulphuric acid**; the acid lowers the pH and attacks the pipe.
4. At the anode **Fe²⁺** forms **FeS or FeSO₄**, and the metal is lost; the pit grows.
5. An acidic (low pH) environment, and alkaline conditions as printed in the slide, help the corrosion.
6. **Control**: coat and wrap the pipe, cathodic protection, a clean, well-drained, non-sulphate backfill (sand), keep the pipe out of waterlogged organic soil.`,
    keys: ['sulphate', 'anaerobic', 'Sulphate-reducing bacteria', 'hydrogen sulphide', 'sulphuric acid', 'FeS', 'low pH'],
    lists: ['l-trans-corr-factors'],
    src: 'RM L9 p25; control: textbook',
  },
  {
    id: 'a-trans-hammer',
    topic: T,
    q: 'What is water hammer? Explain the phenomenon of water hammer with sketches.',
    seen: ['2009-10', '2012-13', '2016-17', 'Jan 2021', '2020-21', '2021-22', '2022-23'],
    a: `### Water hammer
**Water hammer** (hydraulic transient) is the **pressure surge (shock wave) set up in a pipeline when the velocity or direction of flow is changed abruptly**, for example by quick closing of a valve or sudden stopping of a pump. The kinetic energy of the flowing column is converted into pressure energy and the pipe is hit like with a hammer, with banging noise, vibration and possible burst.

### The phenomenon (reservoir, pipe, valve at the end)
1. **Steady flow**: the valve is open, water flows at velocity V with normal pressure.
2. **Sudden valve closure**: the layer at the valve stops; the water behind it is still moving, so it is **compressed** and the pipe expands. A **high-pressure wave travels back** along the pipe at the wave speed (about 1000–1400 m/s) until the column is stopped.
3. **Wave reaches the tank**: the tank is at constant pressure, so the compressed water flows back toward the tank and the pressure drops; the wave reflects as a **low-pressure wave** back down.
4. **Rebound**: at the valve the low pressure may fall to vapour pressure (column separation), then the water slams back; the pressure **oscillates** between high and low, and **dies out** by friction. The slide shows it as phases: valve closed (rest), valve open (free flow), column slams against the quickly closed valve, shock wave rebounds in the branch line.
5. **Magnitude** (textbook): $\\Delta p = \\rho a \\Delta V$ for fast closure.`,
    keys: ['pressure surge', 'abruptly', 'kinetic energy', 'valve', 'compressed', 'high-pressure wave', 'low-pressure wave', 'oscillates', 'dies out'],
    lists: ['l-trans-hammer-causes'],
    src: 'RM L9 p8, p31; wave speed and formula: textbook',
    Fig: HammerFig,
  },
  {
    id: 'a-trans-hammer-control',
    topic: T,
    q: 'What are the causes of water hammer? How can the water hammer effect be reduced (solved)?',
    seen: ['2016-17', 'Jan 2021', '2023-24'],
    a: `### Causes
1. **Quick closing** (or sudden opening) of a **valve**.
2. **Sudden stopping of a pump** (power failure) or **sudden starting** of a pump: a change of pumping rate.
3. Any **abrupt change of velocity or direction** of flow.
4. **Air trapped** in the pipe (and column separation), pipe bursts.

### Remedies
1. **Close and open valves slowly** (closure time longer than 2L/a); use slow-closing **check valves** with a by-pass.
2. **Surge tower (surge tank)**: a tank open to the air connected to the line that absorbs the rise and supplies water in the fall.
3. **Air chamber (air vessel)**: closed vessel with **entrapped air** as a cushion near the pump or valve.
4. **Surge control (relief) valves**: globe or plug valves that **open fast and close slowly** to stop the pressure wave from propagating.
5. **Flywheel** on the pump to prolong run-down on power failure.
6. **Limit the velocity** in the pipe and avoid sharp bends and high points.
7. **Air-relief and vacuum valves** at high points; pipe designed for the surge pressure (thick wall, anchorage).`,
    keys: ['Quick closing', 'valve', 'pump', 'abrupt change', 'Air trapped', 'slowly', 'Surge tower', 'Air chamber', 'Surge control', 'Flywheel', 'velocity'],
    lists: ['l-trans-hammer-causes', 'l-trans-hammer-control'],
    src: 'RM L9 p8, p14, p32; the rest: textbook',
  },
  {
    id: 'a-trans-laying',
    topic: T,
    q: 'Describe briefly the procedure of laying large underground water pipes in city areas.',
    seen: ['2015-16', 'Jan 2021'],
    a: `### Pipe laying operation
1. **Preparation of detailed plans** of roads and streets (utilities, levels, valves).
2. **Locating the proposed alignment** on the ground and marking it out.
3. **Excavating trenches** with the proper width and depth (cover for traffic loads), with shoring and traffic management in the city.
4. **Preparation of the bottom of the trench**: level, compact, a bed of sand or gravel.
5. **Lowering of the pipes** into the trench with cranes or slings.
6. **Laying of the pipes** to line and grade, socket ends facing uphill, working from the lower end.
7. **Jointing** the pipes (spigot and socket, flanged, welded, depending on the material).
8. **Anchoring** the pipes at bends, tees and dead ends with thrust blocks.
9. **Backfilling** the trench with excavated material in compacted layers.
10. **Pipe testing**: hydrostatic (pressure) test and leakage test, flushing and disinfection before use.`,
    keys: ['detailed plans', 'alignment', 'Excavating trenches', 'bottom of the trench', 'Lowering', 'Laying', 'Jointing', 'Anchoring', 'Backfilling', 'testing'],
    lists: ['l-trans-laying'],
    src: 'RM L9 p42',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
