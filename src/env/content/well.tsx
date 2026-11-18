// ev-well — tubewells: technologies in Bangladesh, deep tubewell design steps and rules, hand pumps, sinking methods, development, failure (Snigdha ma'am L4a, L4b).
// Numbers (gradation curve, slot, gravel pack, yield, well log) live in engine/dtw.ts and the worked solutions in pyq/sn-dtw.tsx.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-well' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const soil = 'var(--c-soil)'
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
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={ink} />
    </marker>
    <pattern id={id + 'd'} width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill={soil} />
      <circle cx="6" cy="6" r="1" fill={soil} />
    </pattern>
    <pattern id={id + 'g'} width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2" fill="none" stroke={mute} />
    </pattern>
    <pattern id={id + 'h'} width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0,8 L8,0" stroke={mute} strokeWidth="1" />
    </pattern>
  </defs>
)

// ---------- figures ----------
/** section of a deep tubewell with the parts and the design depths (EXAMPLE 1: SWL 200 ft, aquifer to 660 ft) */
const DtwFig: FC = () => (
  <svg viewBox="0 0 700 520" width="100%" role="img" aria-label="Section of a deep tubewell: housing pipe, blind pipe, gravel pack, strainer, sand trap">
    <Defs id="dt" />
    <line x1={20} y1={30} x2={680} y2={30} stroke={ink} strokeWidth={2} />
    <Tx x={30} y={22} a="start" t="Ground level" c={mute} s={11} />
    {/* strata */}
    <rect x={20} y={30} width={660} height={90} fill={panel2} />
    <Tx x={44} y={80} a="start" t="clay / overburden" c={mute} s={11} />
    <rect x={20} y={120} width={660} height={370} fill="url(#dtd)" />
    {/* static water level */}
    <line x1={20} y1={120} x2={680} y2={120} stroke={water} strokeDasharray="6 4" strokeWidth={2} />
    <Tx x={30} y={114} a="start" t="static water level (SWL 200 ft)" c={water} s={11} />
    {/* borehole */}
    <rect x={260} y={30} width={110} height={460} fill="none" stroke={mute} strokeDasharray="5 4" />
    {/* grout */}
    <rect x={262} y={30} width={106} height={170} fill="var(--c-faint)" opacity={0.5} />
    {/* housing pipe */}
    <rect x={290} y={30} width={50} height={150} fill="var(--c-panel)" stroke={ink} strokeWidth={2.5} />
    {/* pump */}
    <rect x={302} y={95} width={26} height={60} fill={accent} opacity={0.65} stroke={ink} />
    <Tx x={315} y={92} t="pump" s={11} b />
    {/* reducing socket */}
    <path d="M290,180 L300,195 L330,195 L340,180" fill="var(--c-panel)" stroke={ink} strokeWidth={2} />
    {/* blind pipe */}
    <rect x={300} y={195} width={30} height={90} fill="var(--c-panel)" stroke={ink} strokeWidth={2.5} />
    {/* gravel pack */}
    <rect x={262} y={250} width={106} height={225} fill="url(#dtg)" />
    <rect x={262} y={250} width={106} height={225} fill="none" stroke={mute} />
    {/* strainer */}
    <rect x={300} y={285} width={30} height={150} fill="var(--c-panel)" stroke={ink} strokeWidth={2.5} />
    {[...Array(14)].map((_, i) => (
      <line key={i} x1={304} y1={290 + i * 10} x2={326} y2={290 + i * 10} stroke={ink} />
    ))}
    {/* sand trap */}
    <rect x={300} y={435} width={30} height={28} fill="var(--c-panel)" stroke={ink} strokeWidth={2.5} />
    <rect x={296} y={463} width={38} height={8} fill={ink} />
    {/* labels left */}
    <Tx x={250} y={70} a="end" t="bentonite / grout seal" s={11} c={mute} />
    <line x1={252} y1={70} x2={268} y2={70} stroke={mute} />
    <Tx x={250} y={262} a="end" t="gravel pack, top 20–50 ft" s={11} c={mute} />
    <Tx x={250} y={276} a="end" t="above the screen" s={11} c={mute} />
    <line x1={252} y1={262} x2={268} y2={262} stroke={mute} />
    <Tx x={250} y={380} a="end" t="gravel pack 3–8 in thick," s={11} c={mute} />
    <Tx x={250} y={394} a="end" t="D30(pack) = 4–6 × D30(sand)" s={11} c={mute} />
    {/* labels right */}
    <Tx x={385} y={60} a="start" t="HOUSING pipe: SWL + decline + drawdown" s={11} b c={sn} />
    <Tx x={385} y={75} a="start" t="+ safety = 200 + 40 + 15 + 15 = 270 ft" s={11} />
    <Tx x={385} y={90} a="start" t="ID = pump bowl OD + 2 in (10–16 in)" s={11} c={mute} />
    <line x1={342} y1={60} x2={380} y2={60} stroke={mute} />
    <Tx x={385} y={190} a="start" t="reducing socket" s={11} c={mute} />
    <Tx x={385} y={232} a="start" t="BLIND (rising) pipe" s={11} b c={sn} />
    <line x1={332} y1={232} x2={380} y2={232} stroke={mute} />
    <Tx x={385} y={350} a="start" t="STRAINER (screen), e.g. 6 in, 30-slot," s={11} b c={sn} />
    <Tx x={385} y={365} a="start" t="max length 100 ft (150 ft); 10 ft clearance" s={11} />
    <line x1={332} y1={350} x2={380} y2={350} stroke={mute} />
    <Tx x={385} y={448} a="start" t="SAND TRAP: blank pipe 5–10 ft, capped" s={11} b c={sn} />
    <line x1={332} y1={448} x2={380} y2={448} stroke={mute} />
    <Tx x={385} y={110} a="start" t="pumping water level (SWL + drawdown)" s={11} c={water} />
    <Tx x={400} y={500} a="start" t="Borehole = strainer dia + 2 × pack thickness" s={11} c={mute} />
  </svg>
)

/** No. 6 shallow handpump (suction) and Tara deep-set handpump */
const HandpumpFig: FC = () => (
  <svg viewBox="0 0 720 420" width="100%" role="img" aria-label="No. 6 handpump tubewell and Tara deep-set handpump">
    <Defs id="hp" />
    {[0, 360].map((ox, k) => (
      <g key={k}>
        <line x1={ox + 10} y1={80} x2={ox + 350} y2={80} stroke={ink} strokeWidth={2} />
        <rect x={ox + 10} y={80} width={340} height={300} fill="url(#hpd)" />
        <line x1={ox + 10} y1={k === 0 ? 150 : 200} x2={ox + 350} y2={k === 0 ? 150 : 200} stroke={water} strokeDasharray="6 4" strokeWidth={2} />
        <rect x={ox + 10} y={k === 0 ? 150 : 200} width={340} height={k === 0 ? 230 : 180} fill={water} opacity={0.18} />
      </g>
    ))}
    {/* No.6 */}
    <Tx x={180} y={22} t="No. 6 handpump tubewell (suction mode)" b c={sn} />
    <rect x={160} y={44} width={40} height={36} fill={accent} opacity={0.6} stroke={ink} />
    <path d="M200,52 L250,40 L262,48" fill="none" stroke={ink} strokeWidth={3} />
    <Tx x={150} y={58} a="end" t="pump head, piston ⌀ 6 in" s={11} />
    <rect x={172} y={80} width={16} height={250} fill="none" stroke={ink} strokeWidth={2.5} />
    <Tx x={196} y={118} a="start" t="blind pipe 38 mm" s={11} b c={sn} />
    <Tx x={196} y={132} a="start" t="(GI top 5 ft, PVC below)" s={11} c={mute} />
    <rect x={170} y={330} width={20} height={56} fill="var(--c-panel)" stroke={ink} strokeWidth={2.5} />
    {[...Array(5)].map((_, i) => (
      <line key={i} x1={173} y1={336 + i * 10} x2={187} y2={336 + i * 10} stroke={ink} />
    ))}
    <Tx x={196} y={355} a="start" t="strainer 38 mm, 2 m" s={11} b c={sn} />
    <Tx x={196} y={369} a="start" t="slot No. 8 / 10 / 12" s={11} c={mute} />
    <rect x={172} y={386} width={16} height={22} fill="var(--c-panel)" stroke={ink} strokeWidth={2.5} />
    <Tx x={196} y={402} a="start" t="sand trap 4–6 ft" s={11} b c={sn} />
    <Tx x={20} y={146} a="start" t="static level" s={11} c={water} />
    <line x1={110} y1={150} x2={110} y2={80} stroke={bad} markerStart="url(#hp)" markerEnd="url(#hp)" />
    <Tx x={104} y={118} a="end" t="≤ 7.5 m" s={11} c={bad} b />
    <Tx x={104} y={132} a="end" t="suction lift" s={11} c={bad} />
    {/* Tara */}
    <Tx x={540} y={22} t="Tara deep-set handpump (force mode)" b c={sn} />
    <rect x={520} y={44} width={40} height={36} fill={accent} opacity={0.6} stroke={ink} />
    <path d="M560,52 L610,40 L622,48" fill="none" stroke={ink} strokeWidth={3} />
    <rect x={534} y={80} width={12} height={150} fill="none" stroke={ink} strokeWidth={2} />
    <Tx x={554} y={114} a="start" t="casing 75 mm, PVC rod 32 mm" s={11} b c={sn} />
    <rect x={528} y={230} width={24} height={50} fill={accent} opacity={0.35} stroke={ink} strokeWidth={2} />
    <Tx x={558} y={252} a="start" t="cylinder 50 mm: piston below SWL" s={11} b c={sn} />
    <Tx x={558} y={266} a="start" t="(cylinder at 18 m, foot valve)" s={11} c={mute} />
    <rect x={532} y={280} width={16} height={60} fill="none" stroke={ink} strokeWidth={2} />
    <Tx x={558} y={300} a="start" t="lower casing 38 mm PVC" s={11} c={mute} />
    <rect x={530} y={340} width={20} height={44} fill="var(--c-panel)" stroke={ink} strokeWidth={2.5} />
    {[...Array(4)].map((_, i) => (
      <line key={i} x1={533} y1={346 + i * 10} x2={547} y2={346 + i * 10} stroke={ink} />
    ))}
    <Tx x={558} y={362} a="start" t="screen 38 mm, sand trap" s={11} c={mute} />
    <Tx x={382} y={196} a="start" t="static level" s={11} c={water} />
    <line x1={470} y1={200} x2={470} y2={80} stroke={good} markerStart="url(#hp)" markerEnd="url(#hp)" />
    <Tx x={464} y={140} a="end" t="up to 30 m" s={11} c={good} b />
    <Tx x={464} y={154} a="end" t="from SWL" s={11} c={good} />
  </svg>
)

/** reverse rotary recirculation drilling */
const ReverseRotaryFig: FC = () => (
  <svg viewBox="0 0 720 420" width="100%" role="img" aria-label="Reverse rotary recirculation drilling of a well">
    <Defs id="rr" />
    <line x1={10} y1={170} x2={710} y2={170} stroke={ink} strokeWidth={2} />
    <rect x={10} y={170} width={700} height={240} fill="url(#rrd)" />
    {/* borehole */}
    <rect x={280} y={170} width={100} height={220} fill="var(--c-panel)" stroke={ink} strokeWidth={1.5} />
    <rect x={282} y={178} width={96} height={210} fill={water} opacity={0.3} />
    {/* drill pipe */}
    <rect x={312} y={40} width={36} height={340} fill="none" stroke={ink} strokeWidth={2.5} />
    <rect x={312} y={380} width={36} height={10} fill={ink} />
    <Tx x={330} y={402} t="cutting bit (rotates)" s={11} />
    {/* rotary table + derrick */}
    <rect x={290} y={150} width={80} height={14} fill="var(--c-faint)" stroke={ink} />
    <Tx x={250} y={160} a="end" t="rotary table" s={11} c={mute} />
    <path d="M300,150 L330,20 L360,150" fill="none" stroke={mute} strokeWidth={2} />
    <Tx x={330} y={14} t="mast" s={11} c={mute} />
    {/* pump + pit */}
    <path d="M348,70 L430,70" stroke={ink} strokeWidth={3} />
    <circle cx={445} cy={70} r={15} fill={accent} opacity={0.6} stroke={ink} />
    <Tx x={445} y={46} t="suction / air-lift pump" s={11} b />
    <path d="M460,70 L520,70 L520,118" fill="none" stroke={ink} strokeWidth={3} markerEnd="url(#rr)" />
    <path d="M500,118 L600,118 L600,170 L500,170 z" fill="var(--c-panel)" stroke={ink} />
    <rect x={502} y={140} width={96} height={30} fill={water} opacity={0.35} />
    <Tx x={550} y={110} t="settling pit (cuttings drop out)" s={11} />
    <path d="M500,155 L440,155 L440,165 L383,165" fill="none" stroke={good} strokeWidth={3} markerEnd="url(#rr)" />
    <Tx x={440} y={188} t="clean water back" c={good} s={11} b />
    {/* arrows inside */}
    <path d="M296,185 L296,370" stroke={good} strokeWidth={3} markerEnd="url(#rr)" />
    <path d="M330,360 L330,60" stroke={bad} strokeWidth={3} markerEnd="url(#rr)" opacity={0.8} />
    <Tx x={60} y={250} a="start" t="Fluid flows DOWN the annulus" s={12} b c={good} />
    <Tx x={60} y={266} a="start" t="(by gravity from the pit)" s={11} c={good} />
    <Tx x={60} y={300} a="start" t="Cuttings go UP the drill pipe" s={12} b c={bad} />
    <Tx x={60} y={316} a="start" t="(large bore pipe, high velocity)" s={11} c={bad} />
    <Tx x={540} y={320} a="middle" t="water level in the borehole kept" s={11} c={mute} />
    <Tx x={540} y={334} a="middle" t="above the water table" s={11} c={mute} />
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-well-types',
    topic: T,
    title: 'Tubewell technologies in Bangladesh (three categories)',
    ask: 'What are the different types of tubewell technologies used in Bangladesh?',
    points: [
      { k: 'Shallow tubewells', alt: ['shallow tubewell', 'STW', 'suction mode handpump'], d: 'No. 6, Rower pump, Disco pump: suction mode, up to about 7.5 m' },
      { k: 'Deep-set intermediate technology', alt: ['deep set handpumps', 'deep-set tubewells', 'deep set'], d: 'Tara, Tara II, Moon, Bangla, Mark-II: water from beyond the suction limit, up to about 30 m from the static level' },
      { k: 'Deep tubewells', alt: ['deep tubewell', 'DTW', 'production well'], d: 'deeper than 75 m (246 ft), power-operated, for community and municipal supply' },
    ],
    seen: ['2017-18', '2022-23'],
    src: 'SN L4a p1, L4b p1',
  },
  {
    id: 'l-well-shallow',
    topic: T,
    title: 'Shallow (suction mode) handpump tubewells',
    points: [
      { k: 'No. 6 handpump tubewell', alt: ['No. 6', 'no 6 handpump'], d: 'most common, named by the barrel (piston) diameter in inches' },
      { k: 'Rower pump tubewell', alt: ['rower pump'] },
      { k: 'Disco pump tubewell', alt: ['disco pump'] },
    ],
    seen: ['2022-23'],
    src: 'SN L4a p1, L4b p1',
  },
  {
    id: 'l-well-deepset',
    topic: T,
    title: 'Deep-set (intermediate technology) handpump tubewells',
    ask: 'What type of handpump tubewell can be used when the water level drops below the suction limit?',
    points: [
      { k: 'Tara handpump tubewell', alt: ['Tara handpump', 'Tara pump', 'Tara'], d: 'UNICEF / UNDP–World Bank; displacement (force-mode) pump' },
      { k: 'Tara II handpump tubewell', alt: ['Tara II'] },
      { k: 'Moon handpump tubewell', alt: ['Moon pump', 'Moon'] },
      { k: 'Bangla handpump tubewell', alt: ['Bangla pump', 'Bangla'] },
      { k: 'Mark-II handpump tubewell', alt: ['Mark II', 'Mark-2'], d: 'named in the L4a list only' },
    ],
    seen: ['2022-23'],
    src: 'SN L4a p1, L4b p3',
  },
  {
    id: 'l-well-components',
    topic: T,
    title: 'Components of a tubewell',
    points: [
      { k: 'Well casing / housing pipe', alt: ['housing pipe', 'well casing', 'bore pipe'], d: 'large plain pipe on top housing the pump bowl and motor' },
      { k: 'Well screen / strainer', alt: ['strainer', 'screen'], d: 'slotted pipe letting water in at low velocity and keeping sand out' },
      { k: 'Blind pipe / rising pipe', alt: ['blind pipe', 'rising pipe', 'well pipe'], d: 'plain pipe between housing and screen' },
      { k: 'Sand trap', alt: ['sand trap'], d: 'capped blank pipe under the strainer, 5–10 ft, holds fine sand' },
    ],
    seen: [],
    src: 'SN L4a p2',
  },
  {
    id: 'l-well-prestudies',
    topic: T,
    title: 'Studies before selecting a groundwater collection option',
    points: [
      { k: 'Collection of available hydrological information', alt: ['hydrological information'], d: 'for the study area' },
      { k: 'Geological survey of the area', alt: ['geological survey'] },
      { k: 'Hydrogeological map', alt: ['hydro geological map'], d: 'aquifers, springs, depth of water tables and piezometric levels' },
    ],
    seen: [],
    src: 'SN L4a p1',
    note: 'The survey is preferably made towards the end of the dry season.',
  },
  {
    id: 'l-well-design-steps',
    topic: T,
    title: 'Steps for production (deep tubewell) design',
    ask: 'Write down the steps that should be followed in designing a filter-pack tubewell.',
    points: [
      { k: 'Grain size distribution of the aquifer layers', alt: ['grain size distribution', 'sieve analysis', 'gradation curve', 'test boring and sampling'], d: 'D10, D30, D60, Cu, FM per layer' },
      { k: 'Locate the aquifer and water-bearing strata', alt: ['locating the aquifer', 'select aquifer layer'], d: 'reject FM below 1 or Cu above 2.5' },
      { k: 'Housing pipe size and length; screen position', alt: ['size and length of housing pipe', 'housing pipe length'], d: 'SWL + decline + drawdown + safety' },
      { k: 'Strainer length and position', alt: ['strainer length', 'screen length'] },
      { k: 'Design the gravel pack', alt: ['gravel pack design', 'design of gravel pack material'], d: 'D30 × 4 to 6, thickness 3–8 in' },
      { k: 'Select strainer material and slot number', alt: ['slot size', 'strainer material and size', 'slot number'], d: 'slot = D10 of pack / 25.4 × 1000, rounded down' },
      { k: 'Estimate yield and number of tubewells', alt: ['estimation of well yield', 'yield of tubewell', 'number of tubewells'], d: 'Q = A_s V_c / F_B' },
    ],
    ordered: true,
    hook: 'Grain, Locate, House, Strain, Gravel, Slot, Yield.',
    seen: ['2009-10'],
    src: 'SN L4a p3',
  },
  {
    id: 'l-well-housing-factors',
    topic: T,
    title: 'Factors fixing the housing pipe length',
    points: [
      { k: 'Present static water level', alt: ['static water level', 'SWL in the dry season'], d: 'dry-season level' },
      { k: 'Pumping water level (drawdown)', alt: ['pumping level', 'drawdown'], d: 'assume 10 to 15 ft' },
      { k: 'Total water-level decline over the design life', alt: ['water level declination', 'decline per year × design life'], d: 'about 2 ft a year × 20 years' },
      { k: 'Extra safety depth', alt: ['safety depth', 'factor of safety'], d: '10 to 15 ft' },
    ],
    seen: [],
    src: 'SN L4a p6–7',
  },
  {
    id: 'l-well-screen-should',
    topic: T,
    title: 'What a proper screen (strainer) should do',
    points: [
      { k: 'Allow water to enter freely at low velocity', alt: ['low entrance velocity'] },
      { k: 'Prevent sand from entering with the water', alt: ['keep sand out', 'sand control'] },
      { k: 'Support the loose formation', alt: ['structural retainer', 'support the formation'], d: 'serve as the structural retainer' },
    ],
    seen: [],
    src: 'SN L4a p2–3',
  },
  {
    id: 'l-well-gravel',
    topic: T,
    title: 'Purposes of a gravel pack',
    points: [
      { k: 'Prevent formation sand moving to the screen', alt: ['retain formation material', 'prevent sand entry'] },
      { k: 'Prevent clogging of the screen', alt: ['prevent clogging'] },
      { k: 'Increase the effective hydraulic diameter of the well', alt: ['increase effective borehole diameter', 'increase hydraulic diameter'] },
    ],
    seen: [],
    src: 'SN L4a p8',
  },
  {
    id: 'l-well-blank',
    topic: T,
    title: 'Uses of blank (blind) pipe in a tubewell',
    points: [
      { k: 'Between two strainers of a discontinuous aquifer', alt: ['between two strainers'] },
      { k: 'Between housing pipe and screen', alt: ['between the end of the housing and the start of the screen'] },
      { k: '10 ft blank pipe at the bottom', alt: ['sand trap at the bottom', 'sand trap'], d: 'traps particles entering by upward converging flow' },
    ],
    seen: [],
    src: 'SN L4a p11',
  },
  {
    id: 'l-well-dev-functions',
    topic: T,
    title: 'Functions (purposes) of well development',
    ask: 'What are the purposes of tubewell development?',
    points: [
      { k: 'Clears the formation clogged by drilling mud', alt: ['clears mud', 'remove drilling fluid'], d: 'mud (drilling fluid) left by the drilling operation' },
      { k: 'Settles and compacts the gravel pack and formation', alt: ['makes tubewell structure stable', 'compacts gravel pack'], d: 'against the screen' },
      { k: 'Gives sand-free water', alt: ['sand free water', 'stabilizes sand formation'] },
      { k: 'Reduces head loss near the screen', alt: ['reduces head losses', 'increases yield'] },
      { k: 'Increases the useful life of the screen', alt: ['increase life of strainer'] },
    ],
    seen: ['2009-10'],
    src: 'SN L4a p11',
  },
  {
    id: 'l-well-dev-methods',
    topic: T,
    title: 'Methods of well development',
    points: [
      { k: 'Development by pumping', alt: ['pumping'], d: 'at about 1.5 × the rated capacity until the water is clear' },
      { k: 'Development by compressed air', alt: ['compressed air', 'air lift'] },
      { k: 'Development by surging', alt: ['surging', 'surge block'] },
      { k: 'Development by back-washing', alt: ['backwashing', 'back washing'] },
      { k: 'Development by high velocity jetting', alt: ['jetting', 'high velocity jetting'] },
      { k: 'Development using chemicals', alt: ['chemicals', 'chemical development'] },
    ],
    seen: ['2009-10'],
    src: 'SN L4a p11–12; Delwar sir note',
  },
  {
    id: 'l-well-sinking',
    topic: T,
    title: 'Methods of sinking (drilling) tubewells',
    ask: 'Discuss briefly the methods of tubewell sinking.',
    points: [
      { k: 'Standard (cable tool, percussion) method', alt: ['percussion', 'cable tool', 'standard method'], d: 'hammering bit on a cable; for rock and clay, not loose sands' },
      { k: 'Jetting (wash boring) method', alt: ['jetting', 'wash boring', 'wash boring method'], d: 'water jet loosens soft alluvium; depths to 400–500 ft; widely used in Bangladesh' },
      { k: 'Core-drill method', alt: ['core drill', 'core drilling'], d: 'hollow bit leaves an intact core' },
      { k: 'Rotary drilling method', alt: ['rotary', 'rotary method'], d: 'rotating bit with drilling fluid (mud) circulation' },
    ],
    seen: ['Jan 2021', '2010-11'],
    src: 'SN L4b p6–8; Delwar sir note adds the California (stovepipe) and hydraulic rotary methods',
    note: 'Her note C#11: test boring by jetting, main boring by rotary.',
  },
  {
    id: 'l-well-mud-functions',
    topic: T,
    title: 'Functions of drilling mud (rotary drilling)',
    points: [
      { k: 'Reduces loss of drilling fluid into permeable formations', alt: ['reduces fluid loss', 'seals the wall'] },
      { k: 'Lubricates and cools the drill pipe and bit', alt: ['lubricates', 'cools the bit'] },
      { k: 'Binds the wall against caving', alt: ['supports the borehole wall', 'prevents caving'] },
      { k: 'Suspends and carries the cuttings', alt: ['carries cuttings to the surface', 'suspends cuttings'] },
    ],
    seen: [],
    src: 'SN L4b p8',
  },
  {
    id: 'l-well-failure',
    topic: T,
    title: 'Reasons for tubewell failure',
    ask: 'What are the major reasons of tubewell failure?',
    points: [
      { k: 'Incrustation', alt: ['encrustation', 'scale deposition', 'deposition of alkali salts'], d: 'CaCO₃, Ca and Mg sulphates and silicates deposit inside the pipe and screen, reducing diameter and discharge' },
      { k: 'Corrosion', alt: ['corrosion of pipe'], d: 'acid, chloride and sulphate in the groundwater attack the pipe' },
      { k: 'Clogging of the screen by fines', alt: ['screen clogging', 'sand and silt entry', 'wrong slot size'], d: 'wrong slot or gravel pack, poor development' },
      { k: 'Falling water table', alt: ['lowering of water table', 'depletion'], d: 'the pump or hand pump can no longer reach the water' },
      { k: 'Mechanical failure of pump and pipe', alt: ['pump failure', 'pump breakdown', 'poor maintenance'] },
    ],
    seen: ['2023-24'],
    src: 'SN L4b p8 (incrustation and corrosion); the other three are textbook additions',
    note: 'A normal tubewell lasts about 15 to 20 years.',
  },
  {
    id: 'l-well-gw-issues',
    topic: T,
    title: 'Problems (issues) of groundwater in Bangladesh',
    ask: 'Name the major issues associated with groundwater extraction in Bangladesh.',
    points: [
      { k: 'Arsenic in water', alt: ['arsenic', 'arsenic contamination'], d: 'widespread, mainly shallow aquifers: only 1% of deep tubewells exceed the Bangladesh standard, 5% the WHO guideline' },
      { k: 'Rapid decline in groundwater storage', alt: ['falling water table', 'depletion', 'over-extraction'], d: 'especially Dhaka and the Barind Tract' },
      { k: 'Excessive dissolved iron', alt: ['iron', 'high iron'], d: 'shallow aquifers above 1.0 mg/L (ECR 2023)' },
      { k: 'Salinity', alt: ['salinity in coastal areas', 'salt water intrusion'], d: 'coastal areas; sea-level rise and pumping raise it' },
      { k: 'Faecal bacteria', alt: ['faecal contamination', 'bacterial contamination'], d: 'a large share of shallow tubewells contaminated' },
      { k: 'Rock and stony layers in hilly areas', alt: ['hard formations in hill tracts', 'Chittagong Hill Tracts drilling'], d: 'drilling is difficult in the Chittagong Hill Tracts' },
    ],
    hook: 'A Rapid Iron Salt Fouls Rock: Arsenic, Rapid decline, Iron, Salinity, Faecal, Rock.',
    seen: ['2007-08', '2017-18', '2023-24'],
    src: 'SN L4b p6; L1 p9',
  },
  {
    id: 'l-well-tara-problems',
    topic: T,
    title: 'Problems of Tara handpumps',
    ask: 'List the problems of Tara pumps.',
    points: [
      { k: 'Direct action: no mechanical advantage', alt: ['no mechanical advantage', 'force applied directly'], d: 'the operator applies the force directly' },
      { k: 'Buoyancy not always available', alt: ['leakage in the pump rod'], d: 'leakage in the pump rod removes the buoyancy help' },
      { k: 'Low output at high lift', alt: ['moderate output', 'low discharge'], d: 'max 4 m³/d at 7 m lift and 1.5 m³/d at 12 m lift' },
      { k: 'Failure of key components at high daily output', alt: ['component failure', 'frequent breakdown'] },
      { k: 'Repair of underground parts is difficult', alt: ['difficult repair', 'opening the assembled pump'], d: 'a major part of the assembled pump has to be opened' },
    ],
    seen: ['2009-10'],
    src: 'SN L4b p3',
  },
  {
    id: 'l-well-maintenance',
    topic: T,
    title: 'Well maintenance measures',
    points: [
      { k: 'Keep records of yield and water level', alt: ['record keeping', 'monitor yield and water levels'], d: 'a falling specific capacity warns of clogging' },
      { k: 'Periodic pumping test and inspection', alt: ['periodic inspection', 'pumping test'] },
      { k: 'Clean and redevelop the well', alt: ['redevelopment', 'cleaning the strainer', 'surging'] },
      { k: 'Acid treatment against incrustation', alt: ['acid treatment', 'titration', 'acidising'], d: 'force acid into the well, then pump out' },
      { k: 'Do not leave the tubewell unused for long', alt: ['regular use', 'use regularly'] },
      { k: 'Protect the well head and disinfect', alt: ['chlorinate', 'protect the wellhead', 'sanitary seal'] },
      { k: 'Repair or replace worn pump parts', alt: ['repair pump', 'replace worn parts'] },
    ],
    seen: ['2010-11'],
    src: 'SN L4b p8 (incrustation remedy, not leaving a well unused); the rest is textbook',
    note: 'Not a list in the slides.',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-well-dtw-def', topic: T, front: 'Define a deep tubewell (DPHE) and where it is used.', back: 'A tubewell deeper than 75 m (about 246 ft) that passes through at least one impermeable rock or clay layer; usually penetrates more than one aquifer. Class note: both the depth-based and aquifer-based definitions are correct. Large-diameter power-operated ones are production wells.', src: 'SN L4a p2; class note C#8' },
  { id: 'c-well-stw-def', topic: T, front: 'Shallow tubewell: depth and operating mode.', back: 'Draws water from a shallow depth (practically up to 7.5 m) under suction. Aquifer typically 20 to 70 m deep; Bangladesh STWs are 10–70 m, cheap but liable to surface contamination.', src: 'SN L4a p1, L4b p1' },
  { id: 'c-well-no6-limit', topic: T, front: 'Maximum static water level for a No. 6 handpump, and why?', back: 'About 7.5 m (practically 22–25 ft; theoretical 32.8 ft = 10 m). A suction pump lifts water by atmospheric pressure (14.7 psi) acting on the water; vacuum pressure and friction losses cut the practical lift below the theoretical 10 m.', seen: ['2022-23'], src: 'SN L4b p1–2' },
  { id: 'c-well-no6-num', topic: T, front: 'No. 6 pump: output, life, count.', back: 'Average discharge 30–40 L/min; serves 15–20 years; over 8 million in Bangladesh (mostly private). Named for its barrel (piston) diameter in inches: 6 in.', src: 'SN L4b p2' },
  { id: 'c-well-no6-parts', topic: T, front: 'No. 6 handpump tubewell: parts and pipe sizes.', back: 'Hand pump (piston and bucket and seat valves), blind pipe 38 mm (GI only for the top 5 ft, PVC below), strainer 38 mm PVC about 2 m, sand trap 4–6 ft. Slot sizes 8, 10 or 12 (0.008, 0.010, 0.012 in).', src: 'SN L4b p2' },
  { id: 'c-well-no6-work', topic: T, front: 'Working principle of a No. 6 handpump.', back: 'Suction (vacuum) mode: raising the piston makes a vacuum in the cylinder and atmospheric pressure pushes water in; on the down stroke water passes to the upper chamber and then out of the spout.', seen: ['2010-11'], src: 'SN L4b p2' },
  { id: 'c-well-tara-limit', topic: T, front: 'Deep-set handpumps: abstraction limit.', back: 'They abstract water from as deep as about 100 ft (30 m) below the ground / from the static level. The Tara pump is for water up to about 15 m below ground; its cylinder is set at 18 m. The piston works below the static water level, so there is no suction limit.', seen: ['2022-23'], src: 'SN L4b p3' },
  { id: 'c-well-tara-work', topic: T, front: 'Working principle of the Tara handpump.', back: 'A displacement (force-mode) pump: the piston and cylinder are below the static water level and a hollow PVC rod operates the piston, forcing water up the rising main; so lift is not limited by atmospheric pressure. Built from 75 mm casing, 50 mm cylinder, 38 mm lower casing / screen, 32 mm PVC rod.', seen: ['2009-10', '2010-11'], src: 'SN L4b p3' },
  { id: 'c-well-tara-vs-no6', topic: T, front: 'Tara vs No. 6: key difference?', back: 'No. 6: suction pump, cylinder at the top, limited by atmospheric pressure to about 7.5 m. Tara: force pump with the piston below the static level, works to about 15 m below ground (deep-set up to 30 m), but needs more effort and is harder to repair.', seen: ['2010-11'], src: 'SN L4b p1–3' },
  { id: 'c-well-housing-id', topic: T, front: 'Housing pipe size rule.', back: 'Inside diameter about 2 inches larger than the outside diameter of the pump bowl; 10–16 in is common for high-capacity wells. Joined to the blind pipe by a tapered reducing socket; water-tight; extends from the surface to a safe depth below the anticipated pumping level.', src: 'SN L4a p2' },
  { id: 'c-well-housing-len', topic: T, front: 'Housing pipe length (example numbers).', back: 'SWL + decline × design life + drawdown + safety. Example: 200 + 2 × 20 + 15 + 15 = 270 ft. Defaults: decline 2 ft/yr, design life 20 yr, drawdown 10–15 ft, safety 10–15 ft.', src: 'SN L4a p6–7' },
  { id: 'c-well-sand-trap', topic: T, front: 'Sand trap length in a DTW vs a No. 6 well.', back: 'DTW: a blank pipe 5 to 10 ft long (10 ft in the design), capped at the bottom. No. 6 handpump tubewell: about 4–6 ft. It holds fine sand and sediment that enters, so the screen does not clog.', src: 'SN L4a p2, L4b p2' },
  { id: 'c-well-screen-len', topic: T, front: 'Screen length rules.', back: 'Aquifer below 25 ft: 70%; 25–50 ft: 75%; above 50 ft: 80% of the aquifer. Not practical beyond 100 ft (150 ft maximum for high yield with larger pipes). Keep it off the aquifer bottom for upward converging flow, with 10 ft clearance from a finer layer.', seen: ['2009-10'], src: 'SN L4a p7' },
  { id: 'c-well-length-dia', topic: T, front: 'Length or diameter: which raises the yield?', back: 'In a thick aquifer, doubling the screen diameter raises yield only 10–15%, while doubling the screen length almost doubles it. So length is the controlling factor.', seen: ['2009-10'], src: 'SN L4a p7' },
  { id: 'c-well-bottom', topic: T, front: 'Why complete a well to the bottom of the aquifer?', back: 'More aquifer thickness is used as intake, so greater specific capacity; more drawdown is available for yield; yield holds up in drought or over-pumping. Exceptions: centre the screen in a uniform confined aquifer; an extremely thick aquifer; poor-quality water in part of it.', src: 'SN L4a p5' },
  { id: 'c-well-test-boring', topic: T, front: 'Test boring details.', back: 'A 1.5 to 2 inch test boring before the main well, samples at about 10 ft intervals, sieve analysis on selected layers, giving the bore log; a test tubewell gives a water sample. Class note: test boring by jetting, main boring by rotary.', src: 'SN L4a p4; class note C#11' },
  { id: 'c-well-cu', topic: T, front: 'Cu, FM and what they tell you about an aquifer layer.', back: '$C_u=D_{60}/D_{10}$ (uniform if ≤ 2); $FM=\\sum$ cumulative % retained on #4, 8, 16, 30, 50, 100 / 100. High effective size and low Cu mean high conductivity. Prefer Cu ≤ 2.5 and FM > 1 (FM < 1 clay and silt; FM = 1 fine sand with silt; FM > 1 medium to coarse sand).', src: 'SN L4a p4–6' },
  { id: 'c-well-gp-factor', topic: T, front: 'Gravel pack design factor.', back: 'D30 of the pack = D30 of the FINEST sand layer in the screen zone × a factor of 4 (Cu ≤ 1.5) to 6 (Cu ≥ 2.5), interpolated between. Draw a curve roughly parallel to the aquifer curve through that point, with pack Cu ≤ 2.5.', src: 'SN L4a p7–8' },
  { id: 'c-well-gp-dim', topic: T, front: 'Gravel pack thickness, length and tolerance.', back: 'Thickness 3 to 8 in around the screen; extends at least 20–50 ft above the screen; gradation specified on 4–5 sieves with ±8% on percent retained; material clean and well-rounded; 2–6 mm well-sorted gravel or coarse sand.', src: 'SN L4a p8–9' },
  { id: 'c-well-slot', topic: T, front: 'Slot number formula and the limit on slot width.', back: 'Slot number = D10 of the gravel pack (mm) / 25.4 × 1000, rounded DOWN to a standard slot (#20, #25, #30, #35, #40). The slot retains at least 90% of the pack. No slot wider than 0.03 in (0.8 mm). Use the lowest D10 for natural wells.', src: 'SN L4a p9; class notes C#8–C#9' },
  { id: 'c-well-open', topic: T, front: 'Open area of the strainer by slot number.', back: 'Steel or GI: 40-slot 20%, 30-slot 15%, 20-slot 10%. uPVC or PVC: half of these (10%, 7.5%, 5%).', seen: ['2022-23', '2023-24'], src: 'SN L4a p10' },
  { id: 'c-well-yield', topic: T, front: 'Yield of a deep tubewell and the default numbers.', back: '$Q=\\dfrac{\\eta\\pi D L V_c}{F_B}$ with entrance velocity $V_c\\le0.1$ ft/s and blockage factor $F_B=2.5$–3 (use 3 if not stated). Example: 6 in, 100 ft, 15% open: 0.942 cusec = about 96,000 L/h. Quick: 1 cusec ≈ 100 m³/h.', src: 'SN L4a p10; class note C#10' },
  { id: 'c-well-no-wells', topic: T, front: 'How many tubewells does the demand need?', back: 'Number = demand ÷ daily yield of one well (8 h of pumping a day for 96,000 L/h gives 768,000 L/d). Repeat for the present demand and for 10 and 20 years ahead.', src: 'SN L4a p10' },
  { id: 'c-well-dev-pump', topic: T, front: 'Development by pumping: rate and time.', back: 'Pump at about 1.5 times the rated capacity until the water is clear; development / constant-rate testing continues for at least 72 hours.', src: 'SN L4a p12; class note C#11' },
  { id: 'c-well-jetting-depth', topic: T, front: 'Jetting method: ground and depth.', back: 'For soft, unconsolidated alluvial deposits to depths of 400–500 ft; in suitable ground it is faster than any other method; the most used in Bangladesh.', src: 'SN L4b p7' },
  { id: 'c-well-cable', topic: T, front: 'Cable tool (percussion) method: where is it suited?', back: 'It cuts consolidated rock from soft clay to the hardest rock but is unsuitable in loose formations (unconsolidated sand, gravel, quicksand); casing follows the bit and a drive head protects its top.', src: 'SN L4b p6' },
  { id: 'c-well-incrust', topic: T, front: 'Incrustation and corrosion: causes and remedies.', back: 'Incrustation: deposits of CaCO₃, Ca and Mg sulphates and silicates reduce pipe diameter; test the water, force acid into the well then pump out; do not leave the well idle. Corrosion: acid, chloride and sulphate in water; use thick pipes, galvanised or coated pipe, periodic cleaning with sulphuric acid.', seen: ['2023-24'], src: 'SN L4b p8' },
  { id: 'c-well-life', topic: T, front: 'Normal life of a tubewell?', back: 'About 15 to 20 years; it fails mainly by incrustation or corrosion.', src: 'SN L4b p8' },
  { id: 'c-well-aq', topic: T, front: 'Bangladesh aquifer system: shares and zones.', back: 'The alluvial system supports 90% of irrigation and 99% of drinking water. Shallow aquifer (to 60 m south, arsenic-prone), main aquifer (5 m in the NW to 140 m in the south, medium to coarse sand), deep aquifer (150 to 300+ m, under thick clay, safer).', src: 'SN L4b p4–5' },
  { id: 'c-well-dhaka-dtw', topic: T, front: 'Dhaka deep tubewells.', back: 'About 850+ individual DTWs across 11 zones; average depth 800 ft, pumps now going to 1,200 ft; Savar–Vakurta field: about 42 pumps, 150 ML/d from the deep aquifer at about 250 m.', src: 'SN L1 p10' },
  { id: 'c-well-rotary-types', topic: T, front: 'Direct vs reverse rotary: one-line difference.', back: 'Direct: drilling fluid pumped DOWN the drill pipe, cuttings return UP the annulus. Reverse circulation: fluid flows DOWN the annulus and the cuttings are drawn UP the large-bore drill pipe by a suction or air-lift pump.', seen: ['2007-08', '2008-09', '2015-16', '2016-17', '2017-18'], src: 'textbook; not in this term’s slides' },
  { id: 'c-well-sludger', topic: T, front: 'Sludger method (hand sinking).', back: 'A manual method for shallow tubewells: a pipe with a flap or ball valve at its lower end (the sludger) is raised and dropped by hand while water is poured in to loosen the soil, and the slurry is bailed out as the casing is driven down. Cheap, but limited to soft soil and shallow depth.', seen: ['2010-11'], src: 'textbook (hand-boring); not in this term’s slides' },
  { id: 'c-well-inverted', topic: T, front: 'Inverted tubewell (class note).', back: 'A gravel-filter pit with a pump (sketch in the class note C#12): a filter for places with a shallow water table and clayey ground. Pahari lalche soil (Dupitila formation) was noted in the same class.', src: 'class note C#12' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-well-types',
    topic: T,
    q: 'What are the different types of tubewell technologies used in Bangladesh? (and the abstraction limit of each)',
    seen: ['2017-18', '2022-23'],
    a: String.raw`### Categories by construction and aquifer tapped
| Category | Examples | Depth / limit |
|---|---|---|
| **Shallow tubewells** (suction mode) | **No. 6** handpump TW, **Rower** pump TW, **Disco** pump TW | aquifer typically 20–70 m; the pump lifts water only from **7.5 m** (practical) below the pump |
| **Deep-set intermediate technology** | **Tara**, **Tara II**, **Moon**, **Bangla**, **Mark-II** handpump TWs | water from beyond the suction limit: up to about **30 m (100 ft)** from the static level; Tara to about 15 m below ground |
| **Deep tubewells** | power-operated production wells | deeper than **75 m (246 ft)**, through at least one impermeable layer |

- The choice depends on the aquifer location, geology, water quality and cost.
- Shallow tubewells are cheap but more exposed to surface contamination and depend on the dry-season water level; deep tubewells give safer, more reliable water (coastal DTWs reach about 300 m).
- No. 6 pumps are the most common: over 8 million, mostly private.`,
    keys: ['Shallow tubewells', 'No. 6', 'Rower', 'Disco', 'Deep-set', 'Tara', 'Moon', 'Bangla', 'Mark-II', 'Deep tubewells', '75 m'],
    lists: ['l-well-types', 'l-well-shallow', 'l-well-deepset'],
    src: 'SN L4a p1, L4b p1–3',
  },
  {
    id: 'a-well-no6',
    topic: T,
    q: 'Describe the No. 6 handpump tubewell: components, working principle and the suction limit. (Maximum static water level and the alternative when it drops.)',
    seen: ['2010-11', '2022-23'],
    a: String.raw`### Components
**Hand pump** (base, barrel, handle, piston rod, plunger, bucket and seat valves), **blind (rising) pipe** (38 mm; GI for the top 5 ft, PVC below), **strainer** (38 mm PVC, about 2 m, slot **No. 8, 10 or 12**), **sand trap** (blank pipe 4–6 ft, capped). Named by its **barrel diameter in inches**.

### Working principle (suction mode)
Raising the piston makes a **vacuum** in the cylinder, and atmospheric pressure pushes water in; on the down stroke the water goes to the upper chamber and out of the spout. Discharge 30–40 L/min; life 15–20 years.

### Maximum static water level
The pump can lift water only by **atmospheric pressure**: 14.7 psi supports a theoretical **32.8 ft (10 m)**, but because of vacuum pressure and friction losses the practical lift is **22–25 ft**, so a No. 6 pump works only when the static water level is within about **7.5 m**.

### When the level falls below it (dry season)
Use a **deep-set** handpump (**Tara**, Tara II, Moon, Bangla, Mark-II) whose piston is **below the static water level**. Abstraction limit: up to about **30 m (100 ft)** from the static level (Tara: about 15 m below ground, cylinder at 18 m).`,
    keys: ['hand pump', 'blind', 'strainer', 'sand trap', 'vacuum', 'atmospheric pressure', '32.8 ft', '7.5 m', 'deep-set', 'Tara', '30 m'],
    lists: ['l-well-shallow', 'l-well-deepset'],
    src: 'SN L4b p1–3',
    Fig: HandpumpFig,
  },
  {
    id: 'a-well-tara',
    topic: T,
    q: 'Describe the working principle of a Tara handpump and list its problems.',
    seen: ['2009-10', '2010-11'],
    a: String.raw`### Tara handpump
Developed in Bangladesh by UNICEF and the UNDP–World Bank programme for water up to about **15 m** below ground; a **displacement (force-mode) pump**.
- **Components**: hand pump, top connector, pump rod, piston assembly, foot-valve assembly, cylinder, well casing, strainer and sand trap. Installed in a **75 mm** casing holding a **50 mm** cylinder and rising main; **38 mm** PVC lower casing to a slotted internally ribbed screen; **32 mm** hollow PVC pump rod. All parts except the head and handle are PVC.
- **Working principle**: the **piston operates below the static water level** (cylinder at about 18 m), so there is no suction limit. The PVC rod moves the piston: on the up stroke water is lifted into the rising main, on the down stroke the piston valve opens and the water passes through it. The pump pushes water up (force mode), unlike the No. 6 which sucks.

### Problems
1. **Direct action**: the force is applied by the operator with **no mechanical advantage**.
2. **Buoyancy** help is not always available because of **leakage** in the pump rod.
3. **Moderate output**: max 4 m³/d at 7 m lift, only **1.5 m³/d at 12 m**.
4. **Failure of key components** at moderately high daily output.
5. **Repair** of parts below ground needs a major part of the pump to be opened: inconvenient.`,
    keys: ['displacement', 'force', 'below the static water level', 'piston', 'foot-valve', '75 mm', 'Direct action', 'mechanical advantage', 'leakage', '1.5 m³/d', 'Repair'],
    lists: ['l-well-tara-problems'],
    src: 'SN L4b p3',
    Fig: HandpumpFig,
  },
  {
    id: 'a-well-tara-vs-no6',
    topic: T,
    q: 'What is the difference between the working principles of a Tara handpump tubewell and a No. 6 handpump tubewell?',
    seen: ['2010-11'],
    a: String.raw`### Tara vs No. 6
| | **No. 6 handpump** | **Tara handpump** |
|---|---|---|
| Category | shallow tubewell | deep-set intermediate technology |
| Mode | **suction (vacuum)** pump: cylinder at the top | **force (displacement)** pump: piston and cylinder **below static water level** |
| How it lifts | raising the piston creates a vacuum; **atmospheric pressure** pushes water up | the piston, driven by a PVC rod, **pushes** the water up the rising main |
| Lift limit | theoretical 32.8 ft, practically **22–25 ft** (about 7.5 m static level) | works from the static level down to about **15 m** below ground (deep-set up to 30 m) |
| Pump rod | steel rod / handle on the pump head | hollow PVC rod, buoyancy helps |
| Output | 30–40 L/min | 4 m³/d at 7 m, 1.5 m³/d at 12 m |
| Repair | easy: all moving parts at the surface | hard: parts below ground |`,
    keys: ['suction', 'vacuum', 'atmospheric pressure', 'force', 'below static water level', '22–25 ft', '15 m', 'piston', 'Repair'],
    lists: ['l-well-shallow', 'l-well-deepset'],
    src: 'SN L4b p1–3; the "repair" and "pump rod" rows are our comparison from the slide text',
  },
  {
    id: 'a-well-sinking',
    topic: T,
    q: 'Discuss briefly the methods of tubewell sinking (drilling).',
    seen: ['Jan 2021', '2010-11'],
    a: String.raw`### Methods (choice depends on soil, depth and resources)
1. **Standard (cable tool, percussion) method**: a heavy chisel-shaped steel bit on a cable or rod is lifted and dropped; the crushed material mixes with water to a slurry removed by a sand pump or bailer. Cuts **consolidated rock** from soft clay to hardest rock; **unsuitable** in loose sand, gravel and quicksand. Casing follows the bit and carries a drive head.
2. **Jetting (wash boring) method**: water pumped down the drill pipe leaves through the bit, loosens the soil as a slurry which rises in the annulus into a settling tank and the clear water is recirculated. Suits **soft alluvial** deposits to **400–500 ft**; fastest, **widely used in Bangladesh**.
3. **Core-drill method**: a hollow cylindrical bit with diamond or steel teeth cuts an annular ring leaving an intact **core** inside the drill pipe; water removes the cuttings. Used for hard rock and for samples.
4. **Rotary drilling method**: a cutting bit on hollow drill rod is rotated by an engine; **water or drilling mud** (colloidal clay) is pumped down, flows out through the bit and carries the cuttings up. The mud cools the bit, lubricates, binds the wall against caving and suspends cuttings. Direct or reverse circulation.

Class tip: **test boring by jetting, main boring by rotary.**`,
    keys: ['Standard', 'percussion', 'Jetting', 'wash boring', '400–500 ft', 'Core-drill', 'Rotary', 'drilling mud', 'consolidated rock', 'widely used in Bangladesh'],
    lists: ['l-well-sinking', 'l-well-mud-functions'],
    src: 'SN L4b p6–8; California and hydraulic-rotary methods in Delwar sir note',
  },
  {
    id: 'a-well-rotary',
    topic: T,
    q: 'Differentiate between the direct rotary method and the reverse (recirculation) rotary method of drilling deep tubewells. Sketch the reverse rotary method.',
    seen: ['2007-08', '2008-09', '2015-16', '2016-17', '2017-18'],
    a: String.raw`### Common basis
A rotating cutting bit on a hollow drill pipe cuts the hole while a **drilling fluid** (water or bentonite mud) circulates to cool the bit, remove cuttings and support the borehole wall.

### Difference
| | **Direct rotary** | **Reverse (recirculation) rotary** |
|---|---|---|
| Fluid path | pumped **down inside the drill pipe**, comes out at the bit, carries cuttings **up the annulus** | flows **down the annulus** (by gravity from the pit); cuttings are drawn **up the large-bore drill pipe** by a suction or air-lift pump |
| Upward velocity | low (large annulus), needs **thick mud** to lift cuttings | high in the pipe, so **clean water** with little clay is enough |
| Borehole wall | supported by a thick mud cake | supported by water pressure: level kept above the water table |
| Formation | mud cake invades the aquifer: harder to **develop** | little invasion, easy development, better yield |
| Hole size | small and medium diameter | large diameter holes in soft, unconsolidated ground |
| Cuttings | settle in the pit and fluid is re-pumped | settle in the pit and clean water returns to the hole (**recirculation**) |

### Sketch
Draw the mast and rotary table, the hollow drill pipe with the bit, the **annulus** filled with water, the **pump** at the top, the **settling pit** and the channel returning the clean water; arrows down the annulus and up the pipe.`,
    keys: ['Direct rotary', 'Reverse', 'drilling fluid', 'down inside the drill pipe', 'annulus', 'large-bore', 'suction', 'air-lift', 'settling pit', 'develop'],
    lists: ['l-well-mud-functions'],
    src: 'textbook (Aziz / Peavy); the CE22 slides only name the rotary method — flagged on the papers page',
    Fig: ReverseRotaryFig,
  },
  {
    id: 'a-well-sludger',
    topic: T,
    q: 'Describe the sludger method of sinking a tubewell.',
    seen: ['2010-11'],
    a: String.raw`### Sludger (hand boring) method
Used in Bangladesh for **shallow tubewells** in soft alluvium.
1. A **sludger**: a pipe 3–4 m long (bamboo or GI) with a **flap or ball valve** at its lower end, plus a rope or handle.
2. The first length of **casing** is set and **water** is poured in to soften the soil.
3. The sludger is **dropped and lifted by hand**; the soil enters as slurry and is held by the valve.
4. It is lifted and the slurry is emptied; the casing and later pipes are driven down as the hole deepens.
5. At the aquifer the **strainer** is lowered, the casing withdrawn and the well is developed and the pump head fitted.
Cheap and quick, but only for shallow depth in loose soil.`,
    keys: ['sludger', 'flap', 'casing', 'water', 'slurry', 'strainer', 'shallow'],
    lists: [],
    src: 'textbook (hand boring); not in this term’s slides',
  },
  {
    id: 'a-well-failure',
    topic: T,
    q: 'What are the major reasons of tubewell failure? Explain briefly.',
    seen: ['2023-24'],
    a: String.raw`### Reasons for failure
A normal tubewell lasts **15 to 20 years**; it fails by:
1. **Incrustation**: deposition of alkali salts (**calcium carbonate**, Ca and Mg sulphates, silicates) on the inside of the pipe and screen, reducing the effective diameter and discharge. Remedy: test the water for alkali salts; force sufficient **acid** into the well and wash by pumping; do not leave the well unused for long.
2. **Corrosion**: caused by **acid, chloride and sulphate** in the groundwater. Measures: thick pipes; **galvanised or coated** pipes; periodic cleaning with sulphuric acid.
3. **Clogging by fines**: a wrong slot size or gravel pack, or poor development, lets sand and silt in or blocks the openings.
4. **Falling water table**: the pump or hand pump can no longer reach the water (Dhaka, Barind).
5. **Mechanical failure** of the pump, motor or hand-pump parts, and poor maintenance.`,
    keys: ['15 to 20 years', 'Incrustation', 'calcium carbonate', 'acid', 'Corrosion', 'chloride', 'sulphate', 'galvanised', 'Clogging', 'water table'],
    lists: ['l-well-failure'],
    src: 'SN L4b p8 (incrustation, corrosion); items 3–5 textbook',
  },
  {
    id: 'a-well-bd-issues',
    topic: T,
    q: 'What are the major issues (problems) of groundwater development and extraction in Bangladesh?',
    seen: ['2007-08', '2017-18', '2023-24'],
    a: String.raw`### Major issues
1. **Arsenic**: widespread, mainly in shallow aquifers (above the WHO 10 µg/L standard); only 1% of deep tubewells exceed the Bangladesh standard and 5% the WHO guideline. Worst districts: Chandpur, Munshiganj, Gopalganj, Noakhali.
2. **Rapid decline of groundwater storage** by over-extraction, especially in **Dhaka** (DTWs now go to 1,200 ft) and the **Barind Tract**.
3. **Excessive dissolved iron**: shallow aquifers above 1.0 mg/L.
4. **Salinity**: in coastal areas; sea-level rise and intensive pumping increase the salinity of shallow groundwater.
5. **Faecal bacteria**: a substantial share of shallow tubewells is contaminated, chiefly by leaching from pit latrines.
6. **Rock and stony layers** in hilly areas (Chittagong Hill Tracts): drilling is difficult.
Related: hardness and bicarbonate in Meherpur cause CaCO₃ scaling in pipes.`,
    keys: ['Arsenic', 'decline', 'Dhaka', 'Barind', 'iron', 'Salinity', 'Faecal', 'Rock', 'Chittagong Hill Tracts'],
    lists: ['l-well-gw-issues'],
    src: 'SN L4b p6, L1 p6–9',
  },
  {
    id: 'a-well-design-steps',
    topic: T,
    q: 'Write down the steps that should be followed in designing a filter-pack (deep) tubewell, with a sketch of the well.',
    seen: ['2009-10'],
    a: String.raw`### Steps
1. **Grain size distribution** of the soil layers in the aquifer zone from the test boring (10 ft samples): D10, D30, D60, $C_u=D_{60}/D_{10}$, FM.
2. **Locate the aquifer / water-bearing strata**: reject layers with FM below 1 or $C_u>2.5$; choose coarse, uniform sand.
3. **Housing pipe length** = static level + water-level decline × design life + drawdown (10–15 ft) + safety (10–15 ft); inside diameter = pump bowl OD + 2 in.
4. **Strainer length and position**: 70 / 75 / 80% of aquifer thickness (below 25 ft / 25–50 ft / above 50 ft); at most **100 ft** (150 ft); 10 ft clearance from a finer layer; sand trap below.
5. **Gravel pack**: $D_{30}^{pack}=(4\text{ to }6)\,D_{30}$ of the finest layer, a curve roughly parallel to the aquifer curve with $C_u\le 2.5$; **3–8 in** thick, extending 20–50 ft above the screen.
6. **Strainer material and slot number**: slot no. $=D_{10}^{pack}/25.4\times1000$, rounded down; open area 20 / 15 / 10% for 40 / 30 / 20 slot (half for PVC); diameter by use (6 in community DTW).
7. **Estimate the yield** $Q=\eta\pi D L V_c/F_B$ ($V_c=0.1$ ft/s, $F_B=2.5$–3) and the **number of tubewells** = demand ÷ yield of one well; draw the well log.

### Well log
Housing pipe, reducing socket, blind pipe, grout seal, gravel pack, strainer and sand trap, with depths and the static level.`,
    keys: ['Grain size distribution', 'Locate the aquifer', 'Housing pipe', 'Strainer length', 'Gravel pack', 'slot', 'Estimate the yield', 'sand trap', 'well log'],
    lists: ['l-well-design-steps', 'l-well-housing-factors'],
    src: 'SN L4a p3–11',
    Fig: DtwFig,
  },
  {
    id: 'a-well-dtw',
    topic: T,
    q: 'Describe the components of a deep tubewell with a neat sketch.',
    seen: [],
    a: String.raw`### Deep tubewell
A tubewell deeper than **75 m (246 ft)** through at least one impermeable layer, power-operated with a submersible or turbine pump.

### Components (top to bottom)
1. **Housing pipe** (well casing): large plain pipe holding the pump bowl and motor; ID = bowl OD + 2 in; extends to a safe depth below the pumping level.
2. **Reducing socket** joining the housing to the blind pipe.
3. **Blind (rising) pipe**: non-perforated pipe between housing and screen.
4. **Well screen (strainer)**: slotted pipe allowing water in at low velocity and keeping sand out; supports the loose formation.
5. **Sand trap**: blank capped pipe, 5–10 ft, to hold fine sand.
Around them: the **gravel pack** (3–8 in) and a **bentonite / grout seal** at the top of the borehole to keep surface water out.`,
    keys: ['Housing pipe', 'Reducing socket', 'Blind', 'screen', 'Sand trap', 'gravel pack', 'grout'],
    lists: ['l-well-components'],
    src: 'SN L4a p2–3',
    Fig: DtwFig,
  },
  {
    id: 'a-well-development',
    topic: T,
    q: 'Write a short note on well (tubewell) development: purposes and methods.',
    seen: ['2009-10'],
    a: String.raw`### Why develop a well
A tubewell is not ready right after construction: flow lines crowd near the well, causing resistance and low yield. **Development** removes the finer particles around the screen to increase the permeability of the formation and give non-turbulent flow into the well.

### Functions
1. Clears the formation clogged by **drilling mud**.
2. Settles and **compacts the gravel pack** and formation against the screen, making the structure stable.
3. Gives **sand-free water**.
4. **Reduces head loss** near the screen.
5. Increases the **useful life** of the screen.

### Methods
1. **Pumping**: at about **1.5 × the rated capacity** until the water is clear (at least 72 hours for the constant-rate test).
2. **Compressed air** (air lift).
3. **Surging** (surge block).
4. **Back-washing**.
5. **High-velocity jetting**.
6. Use of **chemicals** (dispersing agents, acid).`,
    keys: ['drilling mud', 'compacts', 'sand-free', 'head loss', 'useful life', 'Pumping', '1.5', 'Compressed air', 'Surging', 'Back-washing', 'jetting', 'chemicals'],
    lists: ['l-well-dev-functions', 'l-well-dev-methods'],
    src: 'SN L4a p11–12',
  },
  {
    id: 'a-well-screen-length',
    topic: T,
    q: 'Write a short note on well screen length.',
    seen: ['2009-10'],
    a: String.raw`### Well screen length
- The optimum length depends on the **aquifer thickness**, the **available drawdown** and the **stratification**; place the intake in the zones of highest hydraulic conductivity.
- In a thick aquifer yield is raised far more by **length than by diameter**: doubling the diameter adds only 10–15%, doubling the length almost **doubles the yield**.
- Common practice: **70%** of an aquifer under 25 ft, **75%** for 25–50 ft, **80%** above 50 ft.
- A very long strainer is hard to keep vertical: at most **100 ft** (150 ft for high yield with larger pipes).
- Do not extend the screen to the aquifer bottom (allow **upward converging** flow) and keep **10 ft** clearance from a finer layer.
- The wells should be completed to the aquifer bottom where possible: more drawdown and a higher specific capacity.`,
    keys: ['aquifer thickness', 'drawdown', 'length than by diameter', '10–15%', '70%', '75%', '80%', '100 ft', 'clearance'],
    lists: [],
    src: 'SN L4a p5–7',
  },
  {
    id: 'a-well-maintenance',
    topic: T,
    q: 'Write a short note on well maintenance.',
    seen: ['2010-11'],
    a: String.raw`### Well maintenance
A well keeps its yield only if it is looked after:
1. **Keep records** of discharge, pumping and static water levels, and specific capacity: a falling specific capacity shows clogging or incrustation.
2. **Inspect** and test periodically (pumping test, pump and motor check).
3. **Clean and redevelop** the well (surging, back-washing, jetting) when the screen clogs.
4. **Acid treatment** for incrustation: force acid into the well and pump out; a coated or galvanised pipe against corrosion.
5. **Do not leave** the tubewell unused for a long time.
6. **Protect the well head** (sanitary seal, platform, drain) and **disinfect** with chlorine after repair.
7. **Repair or replace** worn pump parts in time.
Normal life is 15 to 20 years.`,
    keys: ['records', 'specific capacity', 'Inspect', 'redevelop', 'Acid', 'unused', 'well head', 'disinfect', '15 to 20 years'],
    lists: ['l-well-maintenance'],
    src: 'textbook; SN L4b p8 for incrustation and unused wells',
  },
  {
    id: 'a-well-sst',
    topic: T,
    q: 'Write a short note on a Shallow Shrouded Tubewell (SST).',
    seen: ['2012-13'],
    a: String.raw`### Shallow shrouded tubewell (SST)
- A **shallow tubewell** (suction-mode, drawing from the upper aquifer) whose **screen is surrounded by a gravel "shroud"** (filter pack) instead of being placed directly in the formation.
- The **shroud** keeps fine sand out, so a **wider slot** can be used, the entrance velocity falls and the **yield rises**; the well pumps clear water and lasts longer.
- Suited to **fine and medium sand** aquifers, where a plain strainer would clog or pump sand; used for irrigation and community supply with a centrifugal pump.
- Limited by the **suction lift** (about 7.5 m), the same limit as any shallow tubewell.
- Compared with a deep tubewell it is cheaper, but more exposed to surface contamination and arsenic.`,
    keys: ['shallow', 'shroud', 'screen', 'gravel', 'medium sand', 'suction lift', 'yield'],
    lists: [],
    src: 'textbook; not in this term’s slides (the gravel-pack ideas follow SN L4a p8)',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
