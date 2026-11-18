// ev-dist — distribution network: requirements, methods and layouts with merits and demerits, continuous vs intermittent, service reservoirs, dead-end design, Hardy Cross (Snigdha ma'am L5).
// Numbers (reservoir size, branch design, Hardy Cross iterations) live in engine/network.ts and pyq/sn-dtw.tsx.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-dist' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'
const sn = 'var(--c-sn)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 12 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)
const Defs = ({ id }: { id: string }) => (
  <defs>
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill={ink} />
    </marker>
  </defs>
)

// ---------- figures ----------
/** the four layouts: dead-end (branched), grid iron, ring, radial */
const LayoutsFig: FC = () => {
  const Res = ({ x, y }: { x: number; y: number }) => <rect x={x - 11} y={y - 9} width={22} height={18} rx={3} fill={water} opacity={0.55} stroke={ink} />
  const Dot = ({ x, y, c = ink }: { x: number; y: number; c?: string }) => <circle cx={x} cy={y} r={3.5} fill={c} />
  const main = { stroke: ink, strokeWidth: 3.5, fill: 'none' } as const
  const sub = { stroke: ink, strokeWidth: 2, fill: 'none' } as const
  const thin = { stroke: mute, strokeWidth: 1.4, fill: 'none' } as const
  return (
    <svg viewBox="0 0 780 420" width="100%" role="img" aria-label="Layouts of a distribution network: dead-end, grid iron, ring and radial">
      <Defs id="ly" />
      {/* (a) dead end */}
      <g transform="translate(10,10)">
        <rect width={370} height={190} rx={8} fill={panel2} stroke={line} />
        <Tx x={185} y={20} t="(a) Branched / dead-end" b c={sn} />
        <Res x={30} y={100} />
        <path d="M41,100 L330,100" {...main} />
        {[90, 150, 210, 270].map((x, i) => (
          <g key={x}>
            <path d={`M${x},100 L${x},${i % 2 ? 160 : 48}`} {...sub} />
            <path d={`M${x},${i % 2 ? 130 : 72} L${x + 38},${i % 2 ? 130 : 72}`} {...thin} />
            <Dot x={x} y={i % 2 ? 160 : 48} c={bad} />
            <Dot x={x + 38} y={i % 2 ? 130 : 72} c={bad} />
          </g>
        ))}
        <Dot x={330} y={100} c={bad} />
        <Tx x={185} y={182} t="every end is a dead end" s={11} c={bad} />
      </g>
      {/* (b) grid iron */}
      <g transform="translate(400,10)">
        <rect width={370} height={190} rx={8} fill={panel2} stroke={line} />
        <Tx x={185} y={20} t="(b) Grid iron (looped)" b c={sn} />
        <Res x={30} y={100} />
        <path d="M41,100 L80,100" {...main} />
        <path d="M80,45 L80,160" {...main} />
        {[45, 100, 160].map((y) => (
          <path key={y} d={`M80,${y} L330,${y}`} {...sub} />
        ))}
        {[140, 200, 260, 330].map((x) => (
          <path key={x} d={`M${x},45 L${x},160`} {...sub} />
        ))}
        {[45, 100, 160].flatMap((y) => [80, 140, 200, 260, 330].map((x) => <Dot key={`${x}${y}`} x={x} y={y} />))}
        <Tx x={205} y={182} t="no dead ends: water from two sides" s={11} c={good} />
      </g>
      {/* (c) ring */}
      <g transform="translate(10,220)">
        <rect width={370} height={190} rx={8} fill={panel2} stroke={line} />
        <Tx x={185} y={20} t="(c) Ring (circular)" b c={sn} />
        <rect x={80} y={40} width={210} height={125} rx={4} {...main} />
        <Res x={60} y={102} />
        <path d="M71,102 L80,102" {...main} />
        {[130, 185, 240].map((x) => (
          <path key={x} d={`M${x},40 L${x},165`} {...thin} />
        ))}
        <path d="M80,102 L290,102" {...sub} />
        {[[80, 40], [290, 40], [80, 165], [290, 165], [185, 102]].map(([x, y]) => (
          <Dot key={`${x}${y}`} x={x} y={y} />
        ))}
        <Tx x={185} y={183} t="main around the periphery; sub-mains branch inside" s={11} c={mute} />
      </g>
      {/* (d) radial */}
      <g transform="translate(400,220)">
        <rect width={370} height={190} rx={8} fill={panel2} stroke={line} />
        <Tx x={185} y={20} t="(d) Radial" b c={sn} />
        {[100, 270].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={100} r={62} fill="none" stroke={line} strokeDasharray="5 4" />
            <Res x={cx} y={100} />
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const r = (deg * Math.PI) / 180
              return (
                <g key={deg}>
                  <path d={`M${cx + 11 * Math.cos(r)},${100 + 11 * Math.sin(r)} L${cx + 58 * Math.cos(r)},${100 + 58 * Math.sin(r)}`} {...sub} />
                  <Dot x={cx + 58 * Math.cos(r)} y={100 + 58 * Math.sin(r)} />
                </g>
              )
            })}
          </g>
        ))}
        <Tx x={185} y={183} t="a reservoir at the centre of each zone" s={11} c={mute} />
      </g>
      <Tx x={390} y={415} t="reservoir (blue box), main (thick), sub-main (thin), dead end (red dot)" s={11} c={mute} />
    </svg>
  )
}

/** Hardy Cross: two loops sharing a common pipe, clockwise positive */
const HardyFig: FC = () => {
  const P = ({ x1, y1, x2, y2, l, dx = 0, dy = -7 }: { x1: number; y1: number; x2: number; y2: number; l: string; dx?: number; dy?: number }) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={2.5} />
      <Tx x={(x1 + x2) / 2 + dx} y={(y1 + y2) / 2 + dy} t={l} s={11} c={accent} b />
    </g>
  )
  const N = ({ x, y, n }: { x: number; y: number; n: string }) => (
    <g>
      <circle cx={x} cy={y} r={13} fill="var(--c-panel)" stroke={ink} strokeWidth={2} />
      <Tx x={x} y={y + 4} t={n} s={12} b />
    </g>
  )
  return (
    <svg viewBox="0 0 640 330" width="100%" role="img" aria-label="Two-loop pipe network for the Hardy Cross method">
      <Defs id="hx" />
      <P x1={110} y1={70} x2={310} y2={70} l="Q₁" />
      <P x1={310} y1={70} x2={510} y2={70} l="Q₂" />
      <P x1={110} y1={230} x2={310} y2={230} l="Q₄" dy={18} />
      <P x1={310} y1={230} x2={510} y2={230} l="Q₅" dy={18} />
      <P x1={110} y1={70} x2={110} y2={230} l="Q₆" dx={-16} dy={4} />
      <P x1={310} y1={70} x2={310} y2={230} l="Q₃ (common)" dx={42} dy={4} />
      <P x1={510} y1={70} x2={510} y2={230} l="Q₇" dx={16} dy={4} />
      <N x={110} y={70} n="A" />
      <N x={310} y={70} n="B" />
      <N x={510} y={70} n="C" />
      <N x={110} y={230} n="D" />
      <N x={310} y={230} n="E" />
      <N x={510} y={230} n="F" />
      {/* inflow / outflow */}
      <line x1={30} y1={40} x2={96} y2={62} stroke={good} strokeWidth={3} markerEnd="url(#hx)" />
      <Tx x={36} y={34} a="start" t="inflow" c={good} s={11} b />
      <line x1={523} y1={236} x2={600} y2={260} stroke={bad} strokeWidth={3} markerEnd="url(#hx)" />
      <Tx x={560} y={282} t="outflows at nodes" c={bad} s={11} b />
      <line x1={310} y1={243} x2={310} y2={290} stroke={bad} strokeWidth={3} markerEnd="url(#hx)" />
      {/* clockwise arrows */}
      <path d="M170,115 A55,40 0 1,1 170,185" fill="none" stroke={water} strokeWidth={2} markerEnd="url(#hx)" transform="rotate(0)" />
      <Tx x={210} y={155} t="Loop I" b c={sn} />
      <Tx x={210} y={171} t="(+ clockwise)" s={11} c={mute} />
      <Tx x={410} y={155} t="Loop II" b c={sn} />
      <Tx x={410} y={171} t="(+ clockwise)" s={11} c={mute} />
      <Tx x={320} y={20} t="Σ inflow = Σ outflow at each node;  Σ head loss around each loop = 0" s={12} c={ink} />
    </svg>
  )
}

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-dist-requirements',
    topic: T,
    title: 'Requirements of a good distribution system',
    ask: 'What are the requirements of a good distribution system?',
    points: [
      { k: 'Water quality must not deteriorate in the pipes', alt: ['no deterioration of quality', 'keep water quality'] },
      { k: 'Sufficient pressure head at all places', alt: ['adequate pressure', 'sufficient pressure'], d: 'at all the intended places' },
      { k: 'Supply for fire fighting', alt: ['fire fighting demand', 'fire demand'], d: 'the requisite amount while maintaining acceptable pressure for normal service' },
      { k: 'No consumer without water during repair', alt: ['layout allows repair', 'during repair of any section'], d: 'the layout must give an alternative path' },
      { k: 'Pipes laid 1 m away from or above sewers', alt: ['away from sewer lines', 'above the sewer'], d: 'preferably one metre away or above the sewer lines' },
      { k: 'Fairly water-tight', alt: ['minimum leakage', 'water tight', 'low leakage'], d: 'keep losses due to leakage to the minimum' },
    ],
    seen: ['2009-10'],
    src: 'SN L5 p2',
    note: 'The question printed in 2009-10 Q2(a) is partly lost; this is the likely reading ("requirements of a distribution system").',
  },
  {
    id: 'l-dist-categories',
    topic: T,
    title: 'Pipes of a distribution network by function',
    points: [
      { k: 'Trunk (transmission) mains', alt: ['transmission mains', 'trunk mains'], d: 'largest, from the treatment plant, > 600 mm; pumping or gravity main' },
      { k: 'Feeder (principal) mains', alt: ['feeder mains', 'principal mains'], d: 'reticulation: 400–600 mm, from the service reservoir into demand areas' },
      { k: 'Distribution mains', alt: ['reticulation mains', 'distribution main'], d: '150–300 mm, supply the consumers’ connections; peak hourly demand' },
      { k: 'Service connections', alt: ['service pipes', 'house connections'], d: 'from the distribution main to the house or facility' },
    ],
    seen: [],
    src: 'SN L5 p2–3; class note C#12 gives slightly different ranges',
  },
  {
    id: 'l-dist-reservoir-functions',
    topic: T,
    title: 'Functions of a service reservoir',
    points: [
      { k: 'Balance the fluctuating demand', alt: ['equalise demand', 'balancing storage'], d: 'lets the source give a steady or differently phased output' },
      { k: 'Give suitable pressure', alt: ['maintain pressure', 'reduce pressure fluctuation'], d: 'and reduce pressure fluctuations in the system' },
      { k: 'Supply during failure or shutdown', alt: ['breakdown storage', 'emergency supply'], d: 'of the plant, pumps or trunk main' },
      { k: 'Reserve for fire and other emergencies', alt: ['fire reserve', 'fire storage'] },
    ],
    seen: [],
    src: 'SN L5 p3',
  },
  {
    id: 'l-dist-storage-parts',
    topic: T,
    title: 'Components of the total reservoir capacity',
    points: [
      { k: 'Balancing (daily consumption) storage', alt: ['daily consumption', 'balancing storage', 'equalising storage'], d: 'the maximum cumulative storage from the hour-by-hour mass table' },
      { k: 'Breakdown (emergency) storage', alt: ['emergency storage', 'breakdown storage'], d: 'about 25% of the total, or 1.5 to 2 times the average hourly supply' },
      { k: 'Fire storage', alt: ['fire reserve'], d: 'in class a separate ground reservoir, not added to the elevated tank' },
    ],
    seen: [],
    src: 'SN L5 p10',
  },
  {
    id: 'l-dist-methods',
    topic: T,
    title: 'Methods of water distribution',
    ask: 'Name the methods of water distribution.',
    points: [
      { k: 'Gravity flow system', alt: ['gravity system', 'gravity'], d: 'source at enough elevation above the consumers' },
      { k: 'Direct pumping (direct connection to the main)', alt: ['direct pumping', 'system with direct connection to water main'], d: 'pumped straight into the mains' },
      { k: 'Indirect pumping and storage (combined)', alt: ['indirect pumping with storage', 'combined gravity and pumping', 'pumping with storage'], d: 'with a balancing roof tank or a ground tank: the most common' },
      { k: 'Individual water source', alt: ['individual source', 'own well'], d: 'drilled, dug or driven well, spring, infiltration gallery' },
    ],
    seen: ['2022-23', '2023-24', '2011-12'],
    src: 'SN L5 p4–5',
  },
  {
    id: 'l-dist-gravity-adv',
    topic: T,
    title: 'Advantages of the gravity system',
    points: [
      { k: 'Needs no energy to operate', alt: ['no energy', 'no power cost'] },
      { k: 'No pumps, very few moving parts', alt: ['few moving parts', 'no pumps'] },
      { k: 'Simple construction, operation and maintenance', alt: ['simple', 'easy to maintain'] },
    ],
    seen: [],
    src: 'SN L5 p4',
  },
  {
    id: 'l-dist-gravity-dis',
    topic: T,
    title: 'Disadvantages of the gravity system',
    points: [
      { k: 'Not suitable for flat country', alt: ['flat terrain', 'no elevated source'], d: 'where an elevated source is not available' },
      { k: 'Higher loss by leakage and wastage', alt: ['more leakage', 'wastage'], d: 'constant pressure at the taps' },
    ],
    seen: [],
    src: 'SN L5 p4',
  },
  {
    id: 'l-dist-direct-adv',
    topic: T,
    title: 'Advantages of direct pumping (direct connection)',
    points: [
      { k: 'Water pumped only when required', alt: ['pump on demand'] },
      { k: 'Low water loss due to leakage', alt: ['low leakage', 'less leakage'] },
    ],
    seen: ['2023-24'],
    src: 'SN L5 p4',
  },
  {
    id: 'l-dist-direct-dis',
    topic: T,
    title: 'Disadvantages of direct pumping (direct connection)',
    points: [
      { k: 'Least desirable: power failure stops the supply', alt: ['power failure', 'interrupted supply', 'unreliable'] },
      { k: 'Uniform pumping cannot meet varying demand and pressure', alt: ['cannot meet demand variation', 'pressure varies'] },
      { k: 'High maintenance and operation cost', alt: ['high cost', 'expensive operation'] },
    ],
    seen: ['2023-24'],
    src: 'SN L5 p4',
  },
  {
    id: 'l-dist-indirect-adv',
    topic: T,
    title: 'Advantages of indirect pumping with storage (combined)',
    points: [
      { k: 'More reliable, copes with demand fluctuation', alt: ['reliable', 'meets demand variation', 'balances demand'] },
      { k: 'Pumps run at rated capacity: efficient and economical', alt: ['high efficiency', 'uniform pumping', 'economy'] },
      { k: 'Reasonable pressure with varying demand', alt: ['steady pressure', 'no inflow of polluted water'], d: 'and no inflow of polluted water' },
    ],
    seen: ['2023-24', '2022-23'],
    src: 'SN L5 p5',
  },
  {
    id: 'l-dist-indirect-dis',
    topic: T,
    title: 'Disadvantages of indirect pumping with storage (combined)',
    points: [
      { k: 'Higher initial cost', alt: ['high capital cost', 'costly storage tank'] },
      { k: 'Higher loss by leakage and wastage', alt: ['more leakage', 'wastage'] },
    ],
    seen: ['2023-24', '2022-23'],
    src: 'SN L5 p5',
  },
  {
    id: 'l-dist-delivery',
    topic: T,
    title: 'Delivery systems',
    points: [
      { k: 'Continuous system', alt: ['continuous supply', '24 h supply'], d: 'water available 24 hours a day' },
      { k: 'Intermittent system', alt: ['intermittent supply'], d: 'only fixed hours, for example 2–4 h morning and evening' },
    ],
    seen: [],
    src: 'SN L5 p5',
  },
  {
    id: 'l-dist-cont-merits',
    topic: T,
    title: 'Why continuous supply is better than intermittent',
    ask: '"A continuous method of water supply is always better than intermittent supply": justify.',
    points: [
      { k: 'Water available whenever needed', alt: ['always available', 'available as and when needed'], d: 'also for fire fighting at any time' },
      { k: 'Fresh water, never stagnant in the pipes', alt: ['no stagnation', 'fresh water'] },
      { k: 'Positive pressure: less risk of contamination', alt: ['less contamination', 'no ingress of pollutants', 'positive pressure'], d: 'no suction of dirty water through leaks when the pipes are empty' },
      { k: 'No need for household storage', alt: ['less domestic storage', 'no storage at home'], d: 'stored water can be contaminated' },
      { k: 'Smaller pipe sizes', alt: ['smaller diameter', 'lower capital cost'], d: 'a steady flow needs smaller pipes than a few-hour supply' },
      { k: 'Fewer operating staff and valve operations', alt: ['less manpower', 'less labour'] },
      { k: 'Less wastage by consumers', alt: ['no wastage by hoarding', 'no tap left open'], d: 'consumers do not leave taps open to catch the water' },
    ],
    seen: ['2007-08', '2009-10', '2010-11', '2017-18'],
    src: 'SN L5 p5; Delwar sir note (comparison table)',
    note: 'The slide gives continuous = best (always available, fresh, not stagnant) but wasteful with leaks, and the drawbacks of intermittent: more storage, contamination, larger pipes.',
  },
  {
    id: 'l-dist-int-drawbacks',
    topic: T,
    title: 'Drawbacks of the intermittent system',
    points: [
      { k: 'Sufficient storage needed for fire and emergencies', alt: ['need storage', 'fire fighting not possible'] },
      { k: 'Contamination through leaks while the pipes are empty', alt: ['contamination', 'ingress of dirty water'] },
      { k: 'Larger pipe sizes needed', alt: ['greater pipe sizes', 'bigger pipes'] },
    ],
    seen: ['2007-08', '2009-10', '2010-11', '2017-18'],
    src: 'SN L5 p5',
  },
  {
    id: 'l-dist-layouts',
    topic: T,
    title: 'Layouts of distribution systems',
    ask: 'Describe the various layouts of a distribution network.',
    points: [
      { k: 'Branched (dead-end, tree) system', alt: ['dead end system', 'dead-end system', 'tree system', 'branched network'] },
      { k: 'Grid iron system', alt: ['gridiron system', 'reticulation system', 'interlaced system', 'grid system'] },
      { k: 'Ring (circular) system', alt: ['ring system', 'circular system'] },
      { k: 'Radial system', alt: ['radial'] },
    ],
    hook: 'Branch, Grid, Ring, Radial: the last three are looped (the radial feeds from reservoirs in zones).',
    seen: ['2008-09', '2009-10', '2010-11', '2011-12', '2015-16', '2021-22', '2012-13'],
    src: 'SN L5 p6–7',
    note: 'Looped network = grid iron, ring, radial (slide classification).',
  },
  {
    id: 'l-dist-deadend-adv',
    topic: T,
    title: 'Advantages of the dead-end (branched) layout',
    points: [
      { k: 'Relatively cheap: less pipe length', alt: ['cheap', 'low cost', 'shorter pipe length'] },
      { k: 'Easy determination of discharges and pressures', alt: ['easy design', 'simple calculation'], d: 'fewer valves' },
      { k: 'Easily extended to new areas', alt: ['easy expansion', 'can be extended'] },
    ],
    seen: ['2007-08', '2008-09', '2010-11', '2011-12', '2012-13', '2015-16', '2017-18', '2021-22'],
    src: 'SN L5 p6',
    note: 'Suitable for old towns and cities with no definite road pattern.',
  },
  {
    id: 'l-dist-deadend-dis',
    topic: T,
    title: 'Disadvantages of the dead-end (branched) layout',
    points: [
      { k: 'Many dead ends: stagnation, sedimentation and contamination', alt: ['stagnation', 'dead ends', 'contamination'] },
      { k: 'Frequent blow-off or flushing needed', alt: ['flushing', 'blow off'] },
      { k: 'A repair cuts off supply downstream', alt: ['supply interrupted during repair', 'repair work cuts supply'], d: 'in the main or sub-main' },
    ],
    seen: ['2007-08', '2008-09', '2010-11', '2011-12', '2012-13', '2015-16', '2017-18', '2021-22'],
    src: 'SN L5 p6',
    note: 'Also: pressure drops and fire fighting is weak towards the ends.',
  },
  {
    id: 'l-dist-grid-adv',
    topic: T,
    title: 'Advantages of the grid iron layout',
    points: [
      { k: 'Good circulation of water: no dead ends', alt: ['no dead ends', 'good circulation'] },
      { k: 'Water from another direction during a breakdown', alt: ['supply from other direction', 'repair without cutting supply'] },
      { k: 'Good control over flow', alt: ['good fire fighting', 'good flow control'] },
    ],
    seen: ['2008-09', '2009-10', '2010-11', '2011-12', '2015-16', '2021-22'],
    src: 'SN L5 p7',
    note: 'Suited to cities with a rectangular layout / well-planned road pattern.',
  },
  {
    id: 'l-dist-grid-dis',
    topic: T,
    title: 'Disadvantages of the grid iron layout',
    points: [
      { k: 'Higher initial cost', alt: ['high initial cost', 'costly', 'more pipe length'] },
      { k: 'Large number of valves', alt: ['many valves'] },
      { k: 'Pipe sizes cannot be calculated exactly', alt: ['difficult design', 'difficult analysis'], d: 'valves on all branches: Hardy Cross is needed' },
    ],
    seen: ['2008-09', '2009-10', '2010-11', '2011-12', '2015-16', '2021-22'],
    src: 'SN L5 p7',
  },
  {
    id: 'l-dist-ring',
    topic: T,
    title: 'Ring (circular) system: merits and demerits',
    points: [
      { k: 'All grid iron advantages', alt: ['good circulation', 'no dead ends'] },
      { k: 'Supply to any point from at least two directions', alt: ['two directions', 'supply from two sides'], d: 'the supply main runs round the periphery' },
      { k: 'Pipe sizing is easy', alt: ['easy design'], d: 'the flow pattern resembles the dead-end system' },
      { k: 'High initial cost and many valves', alt: ['high cost', 'many valves'], d: 'the demerits' },
    ],
    seen: ['2008-09', '2010-11', '2015-16'],
    src: 'SN L5 p7',
  },
  {
    id: 'l-dist-radial',
    topic: T,
    title: 'Radial system: merits and demerit',
    points: [
      { k: 'Quick service', alt: ['fast supply', 'rapid service'] },
      { k: 'Pipe size calculation is easy', alt: ['easy calculation', 'simple design'] },
      { k: 'Several reservoirs meet emergency demand easily', alt: ['emergency demand', 'many reservoirs'] },
      { k: 'More distribution reservoirs raise the cost', alt: ['higher cost', 'cost of reservoirs'], d: 'the demerit' },
    ],
    seen: ['2008-09', '2010-11', '2015-16'],
    src: 'SN L5 p7',
  },
  {
    id: 'l-dist-hardy-conditions',
    topic: T,
    title: 'Conditions to be satisfied in a looped pipe network (Hardy Cross)',
    ask: 'What are the conditions that must be satisfied in any looped pipe network?',
    points: [
      { k: 'Inflow equals outflow at every junction', alt: ['continuity at each junction', 'sum of inflow = sum of outflow', 'flow entering a junction = flow leaving', 'continuity'], d: 'continuity: ΣQ in = ΣQ out' },
      { k: 'Head loss around a closed loop is zero', alt: ['algebraic sum of head losses in a loop is zero', 'sum of head loss around loop = 0', 'energy balance'], d: 'clockwise losses = anticlockwise losses' },
    ],
    seen: ['2007-08', '2012-13'],
    src: 'SN L5 p14',
    note: 'The same two statements are the "two guiding principles" of the Hardy Cross method.',
  },
  {
    id: 'l-dist-hardy-assume',
    topic: T,
    title: 'Assumptions of the Hardy Cross method',
    ask: 'What are the basic assumptions made in the Hardy Cross method?',
    points: [
      { k: 'Initial flows satisfy continuity at each junction', alt: ['assumed flow satisfies continuity', 'assume flow in each pipe'], d: 'a flow Qa is assumed in each pipe so that inflow = outflow at every node' },
      { k: 'Head loss is H = kQ^x', alt: ['head loss law', 'head loss proportional to Q^x', 'H = kQ^n'], d: 'k and x constant for each pipe (x = 1.85 Hazen–Williams, 2 Darcy)' },
      { k: 'Same correction Δ for every pipe in a loop', alt: ['the same correction applies to every pipe of a loop', 'same correction for all pipes in a loop', 'constant correction'] },
      { k: 'Δ is small, so higher-order terms are neglected', alt: ['neglect second order terms', 'Δ small compared with Q'], d: 'binomial expansion kept to the first order' },
      { k: 'Steady flow, constant withdrawals at the nodes', alt: ['steady state', 'constant demands'] },
    ],
    seen: ['2011-12', '2016-17'],
    src: 'SN L5 p14–15 (continuity, $H=kQ^x$, correction); the "small Δ, same Δ" assumptions are the textbook derivation',
    note: 'The slide gives the two conditions and the steps, not an "assumptions" list.',
  },
  {
    id: 'l-dist-hardy-steps',
    topic: T,
    title: 'Procedure of the Hardy Cross method',
    ask: 'State the procedure of the Hardy Cross method.',
    points: [
      { k: 'Assume a flow in each pipe satisfying continuity', alt: ['assume flows', 'assume Qa'], d: 'clockwise = +' },
      { k: 'Compute H = kQ^x and H/Q for each pipe', alt: ['compute head loss and H/Q'], d: 'for all pipes in each loop' },
      { k: 'Sum the head losses with sign', alt: ['sum H around the loop', 'algebraic sum of H'], d: 'clockwise positive' },
      { k: 'Sum H/Q without sign', alt: ['sum H/Q absolute', 'sum H/Q'], d: 'absolute values' },
      { k: 'Apply the correction Δ and repeat', alt: ['correct the flows', 'repeat until Δ small', 'compute correction'], d: 'Δ = −ΣH / (x Σ H/Q); pipes common to two loops get both corrections' },
    ],
    ordered: true,
    seen: ['2016-17'],
    src: 'SN L5 p14–15',
  },
  {
    id: 'l-dist-branched-steps',
    topic: T,
    title: 'Design procedure of a branched (dead-end) network',
    points: [
      { k: 'Prepare a map of the area', alt: ['map of the area', 'prepare map'], d: 'roads, streets and other features' },
      { k: 'Make the layout of mains, sub-mains and branches', alt: ['layout of mains', 'layout'], d: 'with valves, hydrants and appurtenances' },
      { k: 'Estimate the peak flow at each point', alt: ['peak flow', 'flow in each section'], d: 'and the flow Q in each section' },
      { k: 'Calculate the pipe sizes', alt: ['pipe size', 'D from Q = AV'], d: 'Q = AV, V = 1 m/s (3 fps) in class, minimum diameter' },
      { k: 'Calculate the head loss', alt: ['frictional head loss', 'head loss'], d: 'hf = 4fLv²/2gD, f = 0.01; 2.31 ft = 1 psi' },
      { k: 'Check the terminal pressure', alt: ['terminal pressure', 'check pressure'], d: '≥ 30 psi (BNBC); enlarge the pipe if below' },
    ],
    ordered: true,
    seen: [],
    src: 'SN L5 p11–13',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-dist-def', topic: T, front: 'What is a water distribution system?', back: 'The facilities that supply water from its source to the point of use: a network of pipes with appurtenances from the treatment plant to the consumer’s tap, plus storage, service or balancing reservoirs. Its performance is judged by the pressures available for a specific rate of flow.', src: 'SN L5 p1' },
  { id: 'c-dist-parts', topic: T, front: 'The two parts of a distribution system.', back: 'Distribution / transmission: bigger trunk mains, reservoirs and sometimes pumping. Reticulation: the interconnected pipe network through which water finally reaches the consumers.', src: 'SN L5 p2' },
  { id: 'c-dist-diameters', topic: T, front: 'Pipe diameters: trunk, feeder, distribution main.', back: 'Trunk (transmission) main > 600 mm; feeder (principal) main 400–600 mm; distribution main 150–300 mm; BNBC minimum for a distribution main 4 in; supply pipe to a house 2 to 1.5 in. Class note: reticulation 300–600 mm, service ≤ 150 mm.', src: 'SN L5 p2–3, p11; class note C#12' },
  { id: 'c-dist-sewer', topic: T, front: 'Separation between water pipes and sewers.', back: 'Lay the distribution pipes preferably 1 m away from, or above, the sewer lines (class note: 1 m horizontal and vertical gap, supply above sewer).', src: 'SN L5 p2; class note C#12' },
  { id: 'c-dist-velocity', topic: T, front: 'Design velocity of distribution pipes (BNBC) and in this class.', back: '13 and 50 mm: 0.30–0.60 m/s; 75 and 100 mm: 0.75–0.90 m/s; 150 and 200 mm: 1.15–1.30 m/s (head loss 1.5–1.6 m per 100 m). For this class assume V = 1 m/s (3 fps) for every size.', src: 'SN L5 p11; class note C#14' },
  { id: 'c-dist-hf', topic: T, front: 'Head loss formula for the dead-end design and the pressure conversion.', back: '$h_f=\\dfrac{4fLv^2}{2gD}$ with Fanning $f=0.01$; 2.31 ft of water = 1 psi, so $h_f(\\text{psi})=h_f(\\text{ft})\\times62.4/144$.', src: 'SN L5 p12' },
  { id: 'c-dist-min-p', topic: T, front: 'Minimum pressure for domestic demand in peak hour.', back: 'At least 30 psi (BNBC); a small town about 40 psi is sufficient. If the terminal pressure is below 30 psi, enlarge the pipe sizes.', src: 'SN L5 p12–13' },
  { id: 'c-dist-dmin', topic: T, front: 'Minimum pipe diameter used in class.', back: 'BNBC: distribution main 4 in. Class note C#14: D_min = 2 in; round a calculated D up to the nearest commercial size. If the calculated D is below the minimum, use the minimum.', src: 'SN L5 p11; class note C#14' },
  { id: 'c-dist-hardy-delta', topic: T, front: 'Hardy Cross correction formula.', back: '$\\Delta=-\\dfrac{\\sum H}{x\\sum (H/Q_a)}$ with $H=kQ^x$, $x=1.85$ (Hazen–Williams), $k=1$ in class; the denominator uses absolute values. $Q=Q_a+\\Delta$.', seen: ['2007-08'], src: 'SN L5 p14' },
  { id: 'c-dist-hardy-common', topic: T, front: 'Hardy Cross: pipes common to two loops and sign rule.', back: 'Clockwise flow is positive. If Δ is positive, increase the clockwise flows and decrease the anticlockwise ones (and the reverse for negative Δ). A pipe common to two loops gets the correction of both loops (Δ_I − Δ_II). Stop when the corrections are below about 0.01 lps. Common pipe takes the higher size.', src: 'SN L5 p14; class note C#13' },
  { id: 'c-dist-hw', topic: T, front: 'Hazen–Williams head loss used in the Hardy Cross design.', back: '$H=\\dfrac{10.67\\,L}{C^{1.85}D^{4.87}}Q^{1.85}$ (SI). Pipe size after the flows: $D=[10.67Q^{1.85}/(C^{1.85}S)]^{1/4.87}$, C = 130 and S = 0.005 m/m in the worked example; adopt the next standard size.', src: 'SN L5 p14–15' },
  { id: 'c-dist-direct-worst', topic: T, front: 'Which distribution method is worst and which best?', back: 'Direct pumping is the least desirable ("shobche baje system": a power failure stops the supply). The combined method (indirect pumping with storage) is the most desirable and most common.', src: 'SN L5 p4–5; class note C#12' },
  { id: 'c-dist-gravity-def', topic: T, front: 'Gravity distribution: when is it used?', back: 'When the source is at sufficient elevation relative to the consumption; the most reliable if the piping is adequate and safeguarded against breaks. Higher fire pressure needs mobile pumpers or booster pumps.', src: 'SN L5 p4' },
  { id: 'c-dist-continuous', topic: T, front: 'Continuous vs intermittent supply: one-line each.', back: 'Continuous: 24 h a day, best (available when needed, fresh, not stagnant) but wasteful if there are leaks, and needs enough quantity. Intermittent: fixed hours (2–4 h morning and evening), used when pressure or quantity is not enough.', seen: ['2007-08', '2009-10', '2010-11', '2017-18'], src: 'SN L5 p5' },
  { id: 'c-dist-reservoir-def', topic: T, front: 'What is a service reservoir?', back: 'A facility to store water from the transmission main and supply the reticulation system as the demand requires. Ground storage discharges by pump; elevated storage is placed to give the required pressure and dedicated fire storage.', src: 'SN L5 p3' },
  { id: 'c-dist-breakdown', topic: T, front: 'Breakdown (emergency) storage rule.', back: 'About 25% of the total storage, or 1.5 to 2 times the average hourly supply (1.5 × 62,125 = 93,188 L in the worked example). Total = balancing storage + breakdown storage; fire storage is a separate ground tank.', src: 'SN L5 p10–11' },
  { id: 'c-dist-reservoir-size', topic: T, front: 'How to size the elevated reservoir.', back: 'Daily demand = P × lpcd; supply hours = daily demand ÷ pump capacity (rounded up); tabulate storage = previous + supply − demand from empty; balancing storage = maximum cumulative storage; add breakdown storage; D = 8 m example gives depth about 7 m plus freeboard.', src: 'SN L5 p10–11' },
  { id: 'c-dist-peak-mains', topic: T, front: 'Feeder vs distribution mains: design flow.', back: 'Both are designed for peak hour demand. Feeder mains use a smaller hourly peak factor than distribution mains because of a diversity factor. Distribution mains meet the peak hourly demand of the maximum day (DPC).', src: 'SN L5 p2' },
  { id: 'c-dist-looped-def', topic: T, front: 'Looped network: what is it and when is it used?', back: 'An improvement over the dead-end layout in which the ends of mains and sub-mains are connected. Suitable for a well-planned, developed area with a definite road pattern. Types: grid iron, ring, radial.', seen: ['2012-13', '2009-10'], src: 'SN L5 p6' },
  { id: 'c-dist-deadend-use', topic: T, front: 'Dead-end (branched) layout: where is it used?', back: 'Old towns and cities with no definite road pattern: a transmission main runs along the main road from the service reservoir and sub-mains branch off along the other roads, like a tree.', src: 'SN L5 p6' },
  { id: 'c-dist-grid-use', topic: T, front: 'Grid iron layout: where is it used?', back: 'Cities with a rectangular layout: mains and branches laid in rectangles (also called reticulation or interlaced system).', src: 'SN L5 p7' },
  { id: 'c-dist-ring-use', topic: T, front: 'Ring layout: how is it laid?', back: 'The supply main runs round the peripheral roads and the sub-mains branch out from it; it follows the grid iron, with a flow pattern similar to the dead-end system, so pipe sizing is easy.', src: 'SN L5 p7' },
  { id: 'c-dist-radial-use', topic: T, front: 'Radial layout: how is it laid?', back: 'The area is divided into zones; water is pumped to a distribution reservoir in the middle of each zone and supply pipes run radially towards the periphery.', src: 'SN L5 p7' },
  { id: 'c-dist-time', topic: T, front: 'No time factor when…?', back: 'When a service reservoir is present (it balances the daily demand). With no storage a non-residential supply is multiplied by TF = 24 / hours of consumption.', src: 'class note C#13; SN L5 p9' },
  { id: 'c-dist-3e', topic: T, front: 'The three E’s of sustainability (class note).', back: 'Equity, Economy, Environment.', src: 'class note C#13' },
  { id: 'c-dist-exam-hint', topic: T, front: 'Exam hints from the class notes for distribution.', back: 'Looped network is VVI; one math from the Hardy Cross part is a must; the big network map will not come in the exam, only a part of it; V = 3 fps (1 m/s) is fixed; D_min = 2 in; round the diameter to the nearest upper size.', src: 'class notes C#13–C#14' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-dist-requirements',
    topic: T,
    q: 'What are the requirements of a good distribution system?',
    seen: ['2009-10'],
    a: String.raw`### Requirements
1. **Water quality must not deteriorate** in the distribution pipes.
2. It must supply water at all the intended places with **sufficient pressure head**.
3. It must supply the requisite amount for **fire fighting** while keeping acceptable pressure for normal service.
4. The **layout** must be such that **no consumer is without water** during the repair of any section.
5. Pipes laid preferably **1 m away from or above the sewer lines**.
6. It should be fairly **water-tight** to keep leakage loss to a minimum.

### Parts
The system has the **transmission** part (trunk mains, reservoirs, pumping) and the **reticulation** part (feeder and distribution mains, service connections).`,
    keys: ['quality', 'sufficient pressure', 'fire fighting', 'no consumer is without water', 'sewer', 'water-tight', 'reticulation'],
    lists: ['l-dist-requirements', 'l-dist-categories'],
    src: 'SN L5 p2',
  },
  {
    id: 'a-dist-layouts',
    topic: T,
    q: 'Describe the various layouts of a water distribution network with their advantages and disadvantages (with sketches).',
    seen: ['2008-09', '2010-11', '2011-12', '2015-16', '2021-22'],
    a: String.raw`Pipes are laid under the road pavements, so the layout follows the roads. Four layouts, singly or combined.

### 1. Branched (dead-end, tree) system
A transmission main from the reservoir along the main road, with sub-mains branching along the other roads. For **old towns with no definite road pattern**.
- **Advantages**: cheap (less pipe); discharge and pressure easy to determine (few valves); **easily extended**.
- **Disadvantages**: **dead ends** cause stagnation, sedimentation and contamination; **flushing** needed; a **repair cuts off** the supply downstream.

### 2. Looped networks (ends connected), for planned areas with a definite road pattern
**(a) Grid iron** (reticulation, interlaced): mains and branches in rectangles, for rectangular cities.
- Advantages: good **circulation**, no dead ends; water from another direction in a breakdown; good control over flow.
- Disadvantages: high initial cost; many valves; exact pipe sizes cannot be calculated.

**(b) Ring (circular)**: supply main round the peripheral roads with sub-mains branching in.
- Advantages: all grid iron advantages plus supply to any point from **at least two directions**; pipe sizing easy.
- Disadvantages: high initial cost; many valves.

**(c) Radial**: area divided into zones, a distribution reservoir in the middle of each zone, pipes radiating to the periphery.
- Advantages: **quick service**; pipe sizing easy; several reservoirs meet emergency demand.
- Disadvantage: the number of reservoirs increases the cost.`,
    keys: ['Branched', 'dead-end', 'dead ends', 'flushing', 'Grid iron', 'circulation', 'Ring', 'two directions', 'Radial', 'quick service', 'valves', 'extended'],
    lists: ['l-dist-layouts', 'l-dist-deadend-adv', 'l-dist-deadend-dis', 'l-dist-grid-adv', 'l-dist-grid-dis', 'l-dist-ring', 'l-dist-radial'],
    src: 'SN L5 p6–7',
    Fig: LayoutsFig,
  },
  {
    id: 'a-dist-methods',
    topic: T,
    q: 'Describe the methods of water distribution (gravity, direct pumping, indirect pumping with storage) with their merits and demerits.',
    seen: ['2011-12', '2022-23', '2023-24'],
    a: String.raw`### 1. Gravity flow system
Source at sufficient elevation above the consumers; most reliable if the piping is adequate and safe from breaks.
- **Merits**: needs **no energy**; no pumps, few moving parts; simple to build, operate and maintain.
- **Demerits**: not suitable for **flat** country with no elevated source; more loss by **leakage and wastage** (constant pressure).

### 2. System with direct connection to the main (direct pumping)
Pumps feed the mains directly and must give continuous supply at sufficient pressure for all fixtures in the peak period; for small communities.
- **Merits**: water is pumped **only when required**; low loss by leakage.
- **Demerits**: **least desirable**: a **power failure** stops the supply; a uniform pumping rate **cannot meet** the varying demand and pressure; maintenance and operation cost high.

### 3. System with indirect pumping and storage (combined gravity and pumping)
An elevated storage tank on high ground "floats on the system": the pumps run at a **uniform rate** and the storage takes up the difference. With a balancing **roof tank** or a **ground storage tank**; the **most common**.
- **Merits**: **more reliable**, copes with demand fluctuation; pumps work at rated capacity (efficient, economical); reasonable pressure with varying demand and no inflow of polluted water.
- **Demerits**: higher **initial cost**; higher loss by leakage and wastage.

### 4. Individual water source
Drilled, dug or driven well, spring or infiltration gallery; water boosted to a roof tank to feed the fixtures.`,
    keys: ['Gravity', 'no energy', 'flat', 'direct pumping', 'power failure', 'least desirable', 'indirect pumping', 'storage', 'uniform rate', 'reliable', 'initial cost', 'leakage and wastage'],
    lists: ['l-dist-methods', 'l-dist-gravity-adv', 'l-dist-gravity-dis', 'l-dist-direct-adv', 'l-dist-direct-dis', 'l-dist-indirect-adv', 'l-dist-indirect-dis'],
    src: 'SN L5 p4–5',
  },
  {
    id: 'a-dist-continuous',
    topic: T,
    q: '"A continuous method of water supply is always better than the intermittent method": justify the statement.',
    seen: ['2007-08', '2009-10', '2010-11', '2017-18'],
    a: String.raw`### Continuous system
Water is available to the consumers **24 hours a day**, as and when it is needed, and it is not stagnant in the pipes, so **fresh water** is always available.

### Intermittent system
Water is supplied only in **fixed hours** (for example 2–4 h in the morning and in the evening); adopted only when pressure or quantity is insufficient.

### Comparison
| | Continuous | Intermittent |
|---|---|---|
| **Fire demand** | water always available | may not be available when a fire starts |
| **Storage at home** | little needed | consumers store water, which can be **contaminated** |
| **Contamination** | pipes stay under **positive pressure** | empty pipes draw in dirty water through leaks |
| **Pipe size** | smaller pipes | **larger pipes** for the same daily quantity |
| **Staff, operation** | less labour (no valve changes) | more manpower and operation |
| **Capital cost** | lower | higher |
| **Wastage** | consumers do not hoard water | taps left open and storage overflows |

### Conclusion
Continuous supply is better for health, fire safety and economy of the pipes; its only drawback is the **waste through leaks** if the network is poor and the quantity needed is larger. So it is better **where the source and the network can support it**.`,
    keys: ['24 hours', 'fresh water', 'fixed hours', 'Fire demand', 'contaminated', 'positive pressure', 'larger pipes', 'manpower', 'waste'],
    lists: ['l-dist-cont-merits', 'l-dist-int-drawbacks', 'l-dist-delivery'],
    src: 'SN L5 p5; table adapted from Delwar sir note',
  },
  {
    id: 'a-dist-deadend',
    topic: T,
    q: 'Discuss the dead-end layout of a water distribution network with its merits and demerits.',
    seen: ['2007-08', '2011-12', '2017-18'],
    a: String.raw`### Dead-end (branched, tree) layout
A **transmission main** runs from the service reservoir along the main road and **sub-mains** and laterals branch along the other roads like the limbs of a tree; the pipe ends are **dead ends**. Used for **old towns and cities with no definite road pattern**.

### Merits
1. **Relatively cheap**: the pipe length is less.
2. **Easy to design**: discharges and pressures are easy to find because there are few valves; the flow in each pipe is fixed by the demands downstream.
3. **Easily extended** to newly developed areas.

### Demerits
1. **Stagnation** at the many dead ends gives sedimentation and contamination of the water.
2. **Frequent flushing** or blow-off is needed at the ends.
3. A **repair** in a main or sub-main **cuts off** the supply downstream.
4. Pressure falls and fire-fighting flow is poor towards the ends, since each point is fed from one direction only.

### Design
Sizes follow from Q = AV with V = 1 m/s (3 fps); head loss $h_f=4fLv^2/2gD$ with f = 0.01; the terminal pressure must be at least 30 psi.`,
    keys: ['transmission main', 'sub-mains', 'no definite road pattern', 'cheap', 'valves', 'extended', 'Stagnation', 'flushing', 'repair', 'cuts off'],
    lists: ['l-dist-deadend-adv', 'l-dist-deadend-dis', 'l-dist-branched-steps'],
    src: 'SN L5 p6; the pressure and fire point is the standard consequence of one-direction feed',
    Fig: LayoutsFig,
  },
  {
    id: 'a-dist-looped',
    topic: T,
    q: 'Describe the looped (grid iron / ring / radial) layout of a distribution network, with its merits and demerits.',
    seen: ['2009-10', '2012-13'],
    a: String.raw`### Looped network
An improvement on the dead-end system: the **ends of the mains and sub-mains are connected**, forming loops. Suitable for a **well-planned, developed area with a definite road pattern**. Types: grid iron, ring, radial.

### Merits
1. Good **circulation**: no dead ends, so little stagnation and a fresher supply.
2. In a **breakdown** water reaches the area from **another direction**; a repair cuts only a short section.
3. **Good control** of flow and good fire fighting: each point is fed from at least two directions and pressure is more even.
4. Pressure drop is smaller because the flow divides between paths.

### Demerits
1. **High initial cost**: more pipe length and many **valves**.
2. **Exact pipe sizes cannot be calculated** with simple methods: the flow in each pipe depends on all the others and needs the **Hardy Cross** (trial) method.
3. Operation and repair need more valves and careful control.

For the network of Fig. 1 of the paper (loops closed by cross pipes) the layout is a **looped (grid iron) network**: name it so and give the merits and demerits above.`,
    keys: ['ends', 'connected', 'definite road pattern', 'circulation', 'another direction', 'High initial cost', 'valves', 'Hardy Cross', 'grid iron'],
    lists: ['l-dist-grid-adv', 'l-dist-grid-dis', 'l-dist-ring', 'l-dist-radial'],
    src: 'SN L5 p6–7',
    Fig: LayoutsFig,
  },
  {
    id: 'a-dist-branched-looped',
    topic: T,
    q: 'Discuss branched and looped distribution networks with their merits and demerits. What are the two guiding principles of computing flow in a piped network by the Hardy Cross method?',
    seen: ['2012-13'],
    a: String.raw`### Branched vs looped
| | **Branched (dead-end)** | **Looped (grid iron, ring, radial)** |
|---|---|---|
| Layout | tree: one path from the reservoir to each point | the ends of mains are connected: loops |
| Suited to | old towns, **no definite road pattern** | **planned** areas with a definite road pattern |
| Merits | **cheap** (less pipe), easy discharge and pressure calculation, **easy to extend** | good **circulation**, no dead ends, water from two directions in a breakdown, good fire fighting |
| Demerits | **dead ends**: stagnation, sedimentation and contamination; flushing; a repair **cuts off** downstream supply | **costly**, many **valves**, pipe sizes need the **Hardy Cross** method |

### Two guiding principles of Hardy Cross
1. **Continuity**: at every junction the flow entering equals the flow leaving, $\sum Q_{in}=\sum Q_{out}$.
2. **Energy**: the algebraic sum of the head losses around any closed loop is zero, $\sum H=0$ (clockwise losses = anticlockwise losses).
Flows are assumed to satisfy (1) and are corrected loop by loop until (2) holds.`,
    keys: ['Branched', 'Looped', 'no definite road pattern', 'cheap', 'dead ends', 'circulation', 'valves', 'Hardy Cross', 'Continuity', 'Energy', 'closed loop'],
    lists: ['l-dist-layouts', 'l-dist-hardy-conditions'],
    src: 'SN L5 p6–7, p14',
  },
  {
    id: 'a-dist-hardy-assume',
    topic: T,
    q: 'What are the basic assumptions of the Hardy Cross method? State its procedure with a sketch of a two-loop network.',
    seen: ['2011-12', '2016-17'],
    a: String.raw`### Assumptions
1. A flow $Q_a$ is **assumed in each pipe** so that **continuity** is satisfied at every junction (inflow = outflow).
2. The head loss in a pipe follows $H=kQ^x$, with $k$ and $x$ **constant** ($x=1.85$ for Hazen–Williams, 2 for Darcy; $k=1$ in class).
3. The **same correction $\Delta$** is applied to every pipe of a loop; $\Delta$ is **small** compared with $Q_a$, so higher-order terms are neglected.
4. Flow is **steady** and the withdrawals at the nodes are constant.

### Procedure (see the two-loop sketch: clockwise flow positive)
1. Assume $Q_a$ in each pipe satisfying continuity at each junction.
2. In each loop compute $H=kQ_a^x$ and $H/Q_a$ for every pipe.
3. Sum $H$ **with sign** around each loop: $\sum H$ (clockwise positive).
4. Sum $H/Q_a$ **without regard to sign**.
5. Correction $$\Delta=-\frac{\sum H}{x\sum (H/Q_a)}$$ and $Q=Q_a+\Delta$. If $\Delta$ is positive, increase the clockwise flows and decrease the anticlockwise ones. A pipe **common to two loops** gets the correction of both loops (double correction).
6. Repeat with the new flows until $\Delta$ is acceptably small; then read the pipe sizes from the head-loss chart or the Hazen–Williams formula.`,
    keys: ['assumed in each pipe', 'continuity', 'H=kQ^x', 'same correction', 'small', 'clockwise', 'sum $H$', 'without regard to sign', 'common to two loops', 'Repeat'],
    lists: ['l-dist-hardy-assume', 'l-dist-hardy-steps'],
    src: 'SN L5 p14–15; assumptions 3–4 from the textbook derivation',
    Fig: HardyFig,
  },
  {
    id: 'a-dist-hardy-derive',
    topic: T,
    q: 'What conditions must be satisfied in any looped pipe network? Deduce the expression $\\Delta Q=-\\Sigma H/(x\\,\\Sigma H/Q)$.',
    seen: ['2007-08'],
    a: String.raw`### Conditions
1. **Continuity**: the flow entering a junction equals the flow leaving it, $\sum Q_{in}=\sum Q_{out}$.
2. **Energy**: the algebraic sum of the head losses around a closed loop is **zero**, $\sum H=0$.

### Derivation
1. The head loss in a pipe is $H=kQ^x$ ($x=1.85$ Hazen–Williams; $k$ constant for the pipe).
2. Assume a flow $Q_a$ in each pipe satisfying continuity. The true flow is $Q=Q_a+\Delta$, where $\Delta$ is the same correction for every pipe of the loop.
3. Then $$H=k\,(Q_a+\Delta)^x=k\,Q_a^x\Big(1+\frac{\Delta}{Q_a}\Big)^x$$
4. Expand and neglect the terms of second and higher order in $\Delta/Q_a$ ($\Delta$ is small): $$H\approx kQ_a^x+x\,k\,Q_a^{x-1}\,\Delta$$
5. The true flows satisfy condition 2 round the loop: $$\sum H=\sum kQ_a^x+\Delta\,x\sum kQ_a^{x-1}=0$$
6. Solve for $\Delta$: $$\Delta=-\frac{\sum kQ_a^x}{x\sum kQ_a^{x-1}}$$
7. Since $kQ_a^x=H_a$ and $kQ_a^{x-1}=H_a/Q_a$ (the second sum is taken without regard to sign): $$\boxed{\Delta Q=-\frac{\sum H}{x\sum H/Q}}$$
with $x=1.85$ for the Hazen–Williams law. Add $\Delta$ to the clockwise flows of the loop and subtract it from the anticlockwise ones; repeat until it is small.`,
    keys: ['Continuity', 'Energy', 'H=kQ^x', 'Q=Q_a+\\Delta', 'second and higher order', 'same correction', 'without regard to sign', '1.85'],
    lists: ['l-dist-hardy-conditions'],
    src: 'SN L5 p14; the expansion step is the textbook derivation',
    Fig: HardyFig,
  },
  {
    id: 'a-dist-reservoir',
    topic: T,
    q: 'What are the functions of a service reservoir and how is its capacity made up?',
    seen: [],
    a: String.raw`### Functions of a service reservoir
1. **Balance the fluctuating demand** so the source gives a steady or differently phased output.
2. Give a **suitable pressure** and reduce pressure fluctuations.
3. Supply during a **failure or shutdown** of the plant, pumps or trunk main.
4. Keep a **reserve for fire** and other emergencies.
Ground storage discharges by pump; elevated storage gives the required pressure.

### Capacity
Total = **daily (balancing) storage** (maximum cumulative storage from the hour-by-hour table) + **breakdown (emergency) storage** (about 25% of the total, or 1.5 to 2 times the average hourly supply) + **fire storage** (a separate ground reservoir in class).`,
    keys: ['Balance', 'pressure', 'failure or shutdown', 'fire', 'balancing', 'breakdown', '25%', 'average hourly supply'],
    lists: ['l-dist-reservoir-functions', 'l-dist-storage-parts'],
    src: 'SN L5 p3, p10',
  },
  {
    id: 'a-dist-branched-design',
    topic: T,
    q: 'State the procedure of designing a branched (dead-end) distribution network.',
    seen: [],
    a: String.raw`### Procedure
1. Prepare a **map** of the area with roads, streets and other features.
2. Make the **layout** of mains, sub-mains and branches with the valves, fire hydrants and appurtenances.
3. Estimate the **peak flow** at each point (average demand × peak factor, plus loss and wastage) and the flow Q in each section: the flow in a pipe is the sum of all the demands downstream.
4. Calculate the **pipe size** from $Q=AV$ with $V=1$ m/s (3 fps) in class; if the calculated D is below the minimum use the minimum (BNBC: 4 in main), and round up to the nearest commercial size.
5. Calculate the **frictional head loss** $h_f=\dfrac{4fLv^2}{2gD}$ with $f=0.01$ (Fanning); convert to psi with 2.31 ft = 1 psi.
6. **Check the terminal pressure** $P_{terminal}=P_{start}-\sum h_f$ (allow for elevation): it must be at least **30 psi** (BNBC); if not, enlarge the pipes.`,
    keys: ['map', 'layout', 'peak flow', 'pipe size', 'Q=AV', 'frictional head loss', 'terminal pressure', '30 psi'],
    lists: ['l-dist-branched-steps'],
    src: 'SN L5 p11–13',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
