// ev-intake — surface water intakes: types, dry vs wet, site selection, design (Rowshan ma'am L7).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-intake' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const soil = 'var(--c-soil)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

/** one intake tower in section: wet (water inside, inner shaft + conduit gate) or dry (no water, ports connect straight to the conduit) */
const Tower = ({ x0, dry }: { x0: number; dry?: boolean }) => (
  <g>
    <rect x={x0 - 150} y={90} width={300} height={170} fill={water} opacity={0.22} />
    <Tx x={x0 - 100} y={116} t="reservoir" c={mute} s={11} />
    <line x1={x0 - 150} x2={x0 + 150} y1={108} y2={108} stroke={ink} strokeDasharray="4 3" />
    {/* shell */}
    <rect x={x0 - 52} y={30} width={104} height={200} fill="none" stroke={ink} strokeWidth={3} />
    <rect x={x0 - 52} y={30} width={104} height={20} fill={panel2} stroke={ink} />
    <Tx x={x0} y={44} t="control room" s={10.5} />
    {/* ports in the shell */}
    {[120, 160, 200].map((y) => (
      <g key={y}>
        <rect x={x0 - 56} y={y} width={8} height={24} fill="var(--c-bg, var(--c-panel))" stroke={accent} strokeWidth={2} />
        <rect x={x0 + 48} y={y} width={8} height={24} fill="var(--c-bg, var(--c-panel))" stroke={accent} strokeWidth={2} />
      </g>
    ))}
    {dry ? (
      <g>
        {/* inside is dry: air */}
        <rect x={x0 - 48} y={56} width={96} height={174} fill="none" />
        <Tx x={x0} y={100} t="NO water inside" b s={11} />
        <Tx x={x0} y={116} t="when gates are closed" s={10.5} />
        {[132, 172, 212].map((y) => (
          <line key={y} x1={x0 - 48} x2={x0 + 48} y1={y} y2={y} stroke={accent} strokeDasharray="2 3" />
        ))}
        <rect x={x0 - 14} y={140} width={28} height={92} fill={water} opacity={0.45} stroke={ink} />
        <Tx x={x0} y={186} t="conduit" s={10} />
        <line x1={x0 - 48} x2={x0 - 14} y1={132} y2={150} stroke={accent} strokeWidth={2} />
        <line x1={x0 + 48} x2={x0 + 14} y1={132} y2={150} stroke={accent} strokeWidth={2} />
        <Tx x={x0 + 70} y={146} t="gated ports feed the" a="start" s={10.5} />
        <Tx x={x0 + 70} y={160} t="conduit directly" a="start" s={10.5} />
      </g>
    ) : (
      <g>
        <rect x={x0 - 48} y={108} width={96} height={122} fill={water} opacity={0.4} />
        <Tx x={x0} y={150} t="water fills the" s={10.5} />
        <Tx x={x0} y={164} t="outer shell" s={10.5} />
        {/* inner shaft */}
        <rect x={x0 - 18} y={60} width={36} height={172} fill="none" stroke={ink} strokeWidth={2} />
        <Tx x={x0} y={100} t="shaft" s={10.5} />
        <rect x={x0 - 22} y={190} width={6} height={24} fill={accent} />
        <Tx x={x0 + 26} y={204} t="gate" a="start" s={10.5} />
        <Tx x={x0 + 70} y={124} t="water enters the shell," a="start" s={10.5} />
        <Tx x={x0 + 70} y={138} t="then the shaft by a" a="start" s={10.5} />
        <Tx x={x0 + 70} y={152} t="separate gate port" a="start" s={10.5} />
      </g>
    )}
    <line x1={x0} x2={x0} y1={232} y2={260} stroke={ink} strokeWidth={4} />
    <line x1={x0 - 4} x2={x0 + 150} y1={262} y2={262} stroke={ink} strokeWidth={6} />
    <Tx x={x0 + 100} y={280} t="withdrawal conduit to the pump house" s={10.5} />
    <rect x={x0 - 150} y={262} width={300} height={14} fill={soil} opacity={0.5} />
  </g>
)

const WetDryFig: FC = () => (
  <svg viewBox="0 0 640 330" width="100%" role="img" aria-label="Wet intake and dry intake compared">
    <Tx x={160} y={16} t="WET intake (jack well)" b />
    <Tx x={490} y={16} t="DRY intake" b />
    <g transform="translate(0,0) scale(0.5)" />
    <svg x={0} y={20} width={320} height={300} viewBox="0 20 320 300">
      <Tower x0={160} />
    </svg>
    <svg x={320} y={20} width={320} height={300} viewBox="0 20 320 300">
      <Tower x0={160} dry />
    </svg>
    <line x1={320} x2={320} y1={24} y2={310} stroke={line} />
  </svg>
)

/** the intake classes at a glance */
const TypesFig: FC = () => (
  <svg viewBox="0 0 640 250" width="100%" role="img" aria-label="Types of intakes">
    {[
      { x: 20, t: 'By position', l: ['Submerged', 'Exposed'] },
      { x: 235, t: 'By source', l: ['River', 'Canal', 'Reservoir', 'Lake'] },
      { x: 450, t: 'By water in tower', l: ['Wet intake', 'Dry intake'] },
    ].map((c) => (
      <g key={c.t}>
        <rect x={c.x} y={20} width={170} height={36} rx={6} fill={panel2} stroke={accent} strokeWidth={2} />
        <Tx x={c.x + 85} y={43} t={c.t} b />
        {c.l.map((s, i) => (
          <g key={s}>
            <line x1={c.x + 85} x2={c.x + 85} y1={56 + i * 40} y2={72 + i * 40} stroke={ink} />
            <rect x={c.x + 20} y={72 + i * 40} width={130} height={28} rx={5} fill="none" stroke={ink} />
            <Tx x={c.x + 85} y={91 + i * 40} t={s} />
          </g>
        ))}
      </g>
    ))}
    <Tx x={320} y={238} t="an intake tower or well (exposed) can be wet or dry; a submerged intake sits wholly under water" s={11} c={mute} />
  </svg>
)

const lists: EvList[] = [
  {
    id: 'l-intake-site',
    topic: T,
    title: 'Factors governing the location of an intake',
    ask: 'What factors should be considered in selecting the intake location?',
    points: [
      { k: 'Near the treatment plant', alt: ['nearer to the treatment plant', 'reduce conveyance cost'], d: 'cuts the cost of conveying the water' },
      { k: 'Place with less impurities', alt: ['less impurities', 'good raw water quality'] },
      { k: 'Water available in the driest season', alt: ['driest season', 'dry season availability'] },
      { k: 'Possibility of future expansion', alt: ['future expansion'], d: 'without much increase in cost' },
      { k: 'Not downstream of the sewage disposal point', alt: ['upstream of sewage disposal', 'not downstream of sewage outfall'] },
      { k: 'Not affected by heavy flood', alt: ['flood should not enter the intake', 'flood safety'] },
      { k: 'Not near navigation channels such as a harbour', alt: ['away from navigation channels'] },
      { k: 'No interference with river traffic', alt: ['river traffic'] },
      { k: 'Not on sharp curves of meandering rivers', alt: ['sharp curves', 'meandering river'], d: 'figure: outside of the bend, never the inside where silt builds up' },
    ],
    hook: 'Near plant, Clean, Dry season, Expand, Upstream of sewage, Flood-safe, Not at harbour, Not in traffic, Not on a bend.',
    seen: ['2008-09', '2009-10', '2012-13', '2016-17', 'Jan 2021', '2023-24'],
    src: 'RM L7 p3–4',
  },
  {
    id: 'l-intake-design',
    topic: T,
    title: 'Design considerations of an intake',
    ask: 'Discuss briefly the intake design considerations.',
    points: [
      { k: 'Intake velocity below 0.3 fps', alt: ['intake velocity', '0.3 fps', 'low velocity'], d: 'lets fish escape, reduces ice problems and entrainment of suspended matter' },
      { k: 'Intake port location', alt: ['multiple ports', 'port location'], d: 'several elevations, by water quality testing; top port at least 2 m below the surface, bottom port at least 1 m above the bed' },
      { k: 'Gates', alt: ['sluice gates'], d: 'sluice gates control flow from source to conveyance' },
      { k: 'Control of ice', alt: ['ice control'], d: 'cold regions: ports well below the surface, steam piping, compressed air, heaters' },
    ],
    seen: ['2009-10', '2016-17', '2008-09', 'Jan 2021'],
    src: 'RM L7 p18',
  },
  {
    id: 'l-intake-criteria',
    topic: T,
    title: 'Intake design criteria',
    points: [
      { k: 'Factor of safety against external forces', alt: ['factor of safety'], d: 'floating materials, pressure, heavy currents' },
      { k: 'Self-weight to withstand water pressure', alt: ['self weight'] },
      { k: 'Safety near navigation channels', alt: ['safety'] },
      { k: 'Substructure: foundation against water pressure', alt: ['sub structure', 'foundation'] },
      { k: 'Size suitable for future expansion', alt: ['size'] },
    ],
    seen: ['2009-10', '2016-17'],
    src: 'RM L7 p17',
  },
  {
    id: 'l-intake-comp',
    topic: T,
    title: 'Intake components',
    points: [{ k: 'Intake gates', alt: ['gates'] }, { k: 'Valves and pumps', alt: ['valves, pumps'] }, { k: 'Chemical feeders' }, { k: 'Flow meters' }, { k: 'Offices' }, { k: 'Machine shops' }],
    seen: [],
    src: 'RM L7 p5',
  },
  {
    id: 'l-intake-types-pos',
    topic: T,
    title: 'Intakes by position',
    points: [{ k: 'Submerged intake' }, { k: 'Exposed intake' }],
    seen: ['2020-21'],
    src: 'RM L7 p6',
  },
  {
    id: 'l-intake-types-src',
    topic: T,
    title: 'Intakes by type of source',
    points: [{ k: 'River intake' }, { k: 'Canal intake' }, { k: 'Reservoir intake' }, { k: 'Lake intake' }],
    seen: ['2020-21'],
    src: 'RM L7 p7',
  },
  {
    id: 'l-intake-types-water',
    topic: T,
    title: 'Intakes by presence of water in the tower',
    points: [{ k: 'Wet intake' }, { k: 'Dry intake' }],
    seen: ['2020-21', '2021-22', '2022-23', '2023-24'],
    src: 'RM L7 p8',
  },
  {
    id: 'l-intake-submerged',
    topic: T,
    title: 'Features of a submerged intake',
    points: [
      { k: 'Constructed entirely under water', alt: ['entirely under water'] },
      { k: 'Simple concrete block supporting the withdrawal pipe', alt: ['concrete block'] },
      { k: 'Covered by a screen against debris', alt: ['screen'] },
      { k: '2–2.5 m above the bed level to avoid silt', alt: ['2 to 2.5 m above bed'] },
      { k: 'Used for small-scale projects', alt: ['small scale'] },
      { k: 'Not easily accessible for cleaning and repair', alt: ['not accessible'] },
    ],
    seen: [],
    src: 'RM L7 p9',
  },
  {
    id: 'l-intake-wet',
    topic: T,
    title: 'Features of a wet intake',
    points: [
      { k: 'Concrete shell filled with water to reservoir level', alt: ['filled with water'] },
      { k: 'Vertical inside shaft connected to the withdrawal pipe', alt: ['inside shaft'] },
      { k: 'Withdrawal pipe on bed or in tunnel', alt: ['withdrawal pipe'] },
      { k: 'Openings in outer shell and inside shaft', alt: ['openings'] },
      { k: 'Gates on the shaft control the flow', alt: ['gates on the shaft'] },
      { k: 'Water goes to the pump house for lift', alt: ['pump house'] },
      { k: 'Also called a jack well, the most common', alt: ['jack well'] },
    ],
    seen: ['2021-22', '2022-23', '2023-24'],
    src: 'RM L7 p12',
  },
  {
    id: 'l-intake-dry',
    topic: T,
    title: 'Features of a dry intake',
    points: [
      { k: 'Water drawn directly into conduit through gated ports', alt: ['directly drawn into the conduit'] },
      { k: 'No water inside the tower if gates are closed', alt: ['no water inside'] },
      { k: 'Buoyant forces: heavier than a wet intake', alt: ['heavier construction', 'buoyancy'] },
    ],
    seen: ['2021-22', '2023-24'],
    src: 'RM L7 p13',
  },
  {
    id: 'l-intake-reservoir',
    topic: T,
    title: 'Features of a reservoir intake',
    points: [
      { k: 'Used when river flow is not guaranteed', alt: ['dam across the river'] },
      { k: 'Near the upstream face of the dam', alt: ['upstream face of the dam'] },
      { k: 'Access by footbridge', alt: ['foot bridge'] },
      { k: 'Water level same as the reservoir level', alt: ['same water level'] },
    ],
    seen: [],
    src: 'RM L7 p15',
  },
  {
    id: 'l-intake-canal',
    topic: T,
    title: 'Features of a canal intake',
    points: [
      { k: 'Intake well in the canal bank', alt: ['intake well on bank'] },
      { k: 'Inlet pipe covered with a fine screen', alt: ['fine screen'] },
      { k: 'Screen top at minimum water level', alt: ['0.15 m above the canal bed'] },
      { k: 'Bell-mouth inlet', alt: ['bell mouth'] },
      { k: 'Outlet velocity about 1.5 m/s', alt: ['1.5 m/s'] },
      { k: 'Coarse screen velocity as low as 0.15 m/s', alt: ['0.15 m/s'] },
    ],
    seen: [],
    src: 'RM L7 p16',
  },
  {
    id: 'l-intake-screens',
    topic: T,
    title: 'Screens at an intake',
    points: [
      { k: 'Coarse screen', d: 'bar racks, 2–3 in clear spacing, outside, cleaned' },
      { k: 'Fine screen', d: 'wire mesh with 0.25 in openings, velocity 0.4–0.8 m/s, travelling screens' },
      { k: 'Microstrainer', d: 'fine fabric drum to remove plankton and algae; not for sand and silt' },
    ],
    seen: [],
    src: 'RM L7 p21',
  },
]

const cards: EvCard[] = [
  { id: 'c-intake-def', topic: T, front: 'What is an intake?', back: 'The device or structure installed to **draw water from the source** (surface water collection device). It safely withdraws water over predetermined pool levels and discharges it into the withdrawal (intake) conduit that carries it to the treatment plant.', seen: ['2009-10', '2020-21'], src: 'RM L7 p2' },
  { id: 'c-intake-wet-dry', topic: T, front: 'Wet vs dry intake: the one-line difference.', back: 'In a **wet** intake water enters the tower through ports and then passes into the conduit through a **separate gate**, so it is full even when gates are closed. In a **dry** intake water goes straight from the ports into the conduit, so the tower is **empty** when gates are closed.', seen: ['2021-22', '2023-24'], src: 'RM L7 p14' },
  { id: 'c-intake-dry-heavy', topic: T, front: 'Why must a dry intake be heavier than a wet intake?', back: 'With the ports closed it is an empty shell and is subject to **additional buoyant forces**, so it needs a heavier construction.', seen: ['2021-22'], src: 'RM L7 p13' },
  { id: 'c-intake-tower', topic: T, front: 'Where are intake towers used and what are ports for?', back: 'On large projects with **large water-level fluctuation** (rivers, reservoirs). **Gate-controlled ports at various levels** regulate flow and allow selection of the best quality water; access by a footbridge.', src: 'RM L7 p11' },
  { id: 'c-intake-jack', topic: T, front: 'What is another name for a wet intake?', back: 'A **jack well**: the most commonly used form of intake tower.', src: 'RM L7 p12' },
  { id: 'c-intake-submerged', topic: T, front: 'Why is a submerged intake placed 2–2.5 m above the bed?', back: 'To **avoid the entry of silt**; it sits under a screen on a concrete block, is used for small schemes and is hard to clean and repair.', src: 'RM L7 p9' },
  { id: 'c-intake-bend', topic: T, front: 'River bend: inside or outside curve for an intake?', back: 'The figure says **outside** of the curve, where water flows faster and silt and sand are less likely to build up; never the inside. The text also advises not to use sharp curves of meandering rivers.', seen: ['Jan 2021'], src: 'RM L7 p3–4' },
  { id: 'c-intake-velocity', topic: T, front: 'Design intake velocity and why so low?', back: 'Below **0.3 fps (about 8 cm/s)**: it lets fish escape, reduces ice problems and reduces entrainment of suspended matter. Fine screen velocity 0.2 m/s in the design example.', src: 'RM L7 p18, p35' },
  { id: 'c-intake-ports', topic: T, front: 'Port levels in an intake tower.', back: 'Multiple ports at several elevations, located by testing water quality; **top port at least 2 m below the water surface, bottom port at least 1 m above the bottom**.', src: 'RM L7 p18' },
  { id: 'c-intake-headloss', topic: T, front: 'Head loss formulas at an intake.', back: 'Port (orifice): $H_L = \\frac{1}{2g}\\left(\\frac{v}{C_d}\\right)^2$ with $C_d$ = 0.6–0.9. Screen: $H_L = \\frac{v^2 - v_a^2}{2g}\\times\\frac{1}{0.7}$ ($v_a$ approach velocity, usually 0).', src: 'RM L7 p22' },
  { id: 'c-intake-pipe', topic: T, front: 'Intake pipe design basics.', back: '$Q = A V$; diameter from **Darcy–Weisbach**; conduit velocity 1.0–1.5 m/s. Gravity conduits: open channel, flume, aqueduct. Pressure conduit: pipe.', src: 'RM L7 p19–20' },
  { id: 'c-intake-flume', topic: T, front: 'Open channel, flume, aqueduct: what are they?', back: '**Open channel**: gravity flow cut in ground with a uniform slope (rarely used for raw water). **Flume**: open channel carried on trestles over valleys or drains. **Aqueduct / conduit**: channel above, below or on the ground carrying water to a plant, velocity 1.0–1.5 m/s.', src: 'RM L7 p20' },
  { id: 'c-intake-microstrainer', topic: T, front: 'What does a microstrainer remove?', back: 'Plankton and algae (improves sedimentation and chlorination) through a fine fabric drum with backwash; it cannot handle sand, silt and abrasives.', src: 'RM L7 p21, p24' },
  { id: 'c-intake-sarulia', topic: T, front: 'Which Dhaka WASA intakes are in the slides?', back: '**Sarulia intake** on the Sitalakhya (to Saidabad WTP through DND canal, culverts and transmission mains; gated bays, bar screens, river training works) and **Padma Jashaldia** WTP intake.', src: 'RM L7 p25–34' },
  { id: 'c-intake-example', topic: T, front: 'Slide design example: dry tower intake for 113,500 m³/day.', back: 'Reservoir 70–90 m, bottom 60 m: **dry tower with four gate levels**, coarse screen on each gate (45 spaces at 8 cm), fine screen at the pump station; bar rack velocity under 8 cm/s (0.3 fps), fine screen under 0.2 m/s; suction conduit 152 cm.', src: 'RM L7 p35–37' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-intake-def',
    topic: T,
    q: 'What is an intake? Write a short note on intakes (types).',
    seen: ['2009-10', '2020-21'],
    a: `### Intake
1. An **intake** is the device or structure installed to **draw water from the source**; its basic function is to **safely withdraw water over predetermined pool levels** and discharge it into the **withdrawal (intake) conduit** that carries it to the treatment plant.
2. **Components**: gates, valves and pumps, chemical feeders, flow meters, offices and machine shops, with screens at the entry.

### Types
| Basis | Types |
|---|---|
| Position | **submerged** (wholly under water, small schemes), **exposed** (tower or well near the bank) |
| Source | **river**, **canal**, **reservoir**, **lake** intake |
| Water in the tower | **wet** (jack well) and **dry** intake |

An exposed tower is used on large projects where the water level fluctuates a lot, with gated ports at several levels to select the best water.`,
    keys: ['draw water from the source', 'withdrawal', 'submerged', 'exposed', 'river', 'canal', 'reservoir', 'lake', 'wet', 'dry'],
    lists: ['l-intake-types-pos', 'l-intake-types-src', 'l-intake-types-water', 'l-intake-comp'],
    src: 'RM L7 p2–11',
    Fig: TypesFig,
  },
  {
    id: 'a-intake-site',
    topic: T,
    q: 'What factors should be considered in selecting the location of a raw water intake?',
    seen: ['2008-09', '2009-10', '2012-13', '2016-17', 'Jan 2021', '2023-24'],
    a: `### Factors governing the location of an intake
1. **Near the treatment plant** to reduce the cost of conveying the water.
2. A place with **fewer impurities** (good raw water quality).
3. Water must be available in the **driest season** of the year.
4. Possibility of **future expansion** without much extra cost.
5. **Not downstream of the sewage disposal point**.
6. Safe from **heavy floods**, and the flood must not enter through the intake.
7. **Not near navigation channels** such as a harbour.
8. **No interference with river traffic**.
9. **Not on sharp curves of meandering rivers**: choose the **outside of a bend** where flow is faster and silt, sand and gravel do not build up; never the inside.`,
    keys: ['Near the treatment plant', 'fewer impurities', 'driest season', 'future expansion', 'sewage disposal point', 'heavy floods', 'navigation channels', 'river traffic', 'sharp curves', 'outside of a bend'],
    lists: ['l-intake-site'],
    src: 'RM L7 p3–4',
  },
  {
    id: 'a-intake-design',
    topic: T,
    q: 'Discuss briefly the design considerations of an intake structure.',
    seen: ['2009-10', '2008-09', '2016-17', 'Jan 2021'],
    a: `### Design considerations
1. **Intake velocity** below **0.3 fps (8 cm/s)**: lets fish escape, reduces ice trouble and entrainment of suspended matter.
2. **Port location**: **multiple ports at several elevations**, positioned by testing water quality; **top port not less than 2 m below the surface, bottom port at least 1 m above the bed**.
3. **Gates**: sluice gates control the flow from the source into the conveyance.
4. **Ice control** (cold regions): ports well below the surface, steam piping, compressed air, space heaters.
5. **Structural criteria**: **factor of safety** against external forces (floating materials, pressure, heavy currents); **self-weight** to withstand water pressure; **safety** near navigation channels; **substructure** foundation against water pressure; **size** suitable for future expansion.
6. **Screening**: coarse bar rack (2–3 in spacing, outside, cleaned), fine screen (0.25 in mesh, 0.4–0.8 m/s) and microstrainer for algae.
7. **Hydraulics**: intake pipe sized by Darcy–Weisbach ($Q=AV$), head loss through ports $H_L=\\frac{1}{2g}(v/C_d)^2$ and screens.
8. The location factors (near the plant, driest season, flood-free, upstream of sewage) are also part of siting.`,
    keys: ['Intake velocity', '0.3 fps', 'Port location', '2 m below the surface', 'Gates', 'Ice control', 'factor of safety', 'self-weight', 'substructure', 'Screening'],
    lists: ['l-intake-design', 'l-intake-criteria', 'l-intake-screens'],
    src: 'RM L7 p17–22',
  },
  {
    id: 'a-intake-dry-wet',
    topic: T,
    q: 'Differentiate between a dry intake and a wet intake with sketches.',
    seen: ['2021-22', '2022-23', '2023-24'],
    a: `### Wet intake (jack well)
1. A circular concrete shell **filled with water up to the reservoir level**, with a **vertical inside shaft** connected to the withdrawal pipe.
2. Openings in the outer shell and in the shaft; **gates on the shaft** control flow into the conduit.
3. Withdrawal pipe on the bed or in a tunnel below the river bed; water goes to the pump house.
4. Most commonly used; lighter construction.

### Dry intake
1. Water is **drawn directly into the withdrawal conduit through gated entry ports**.
2. **No water inside the tower** when the gates are closed.
3. With the ports closed it suffers **additional buoyant forces**, so it must be **heavier** than a wet intake.

### Difference
| | **Wet intake** | **Dry intake** |
|---|---|---|
| Water in tower | enters shell, then the conduit through separate gate openings | goes straight from entry ports to the conduit |
| Gates closed | tower stays full of water | tower is empty |
| Construction | lighter | heavier (buoyancy) |
| Use | most common, jack well | towers with a dry operating chamber, big projects |`,
    keys: ['filled with water', 'vertical inside shaft', 'gates on the shaft', 'directly into the withdrawal conduit', 'No water inside', 'buoyant', 'heavier'],
    lists: ['l-intake-wet', 'l-intake-dry'],
    src: 'RM L7 p12–14',
    Fig: WetDryFig,
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
