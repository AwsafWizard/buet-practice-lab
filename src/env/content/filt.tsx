// ev-filt — filtration: SSF vs RSF vs roughing filter, removal mechanisms, dual / mixed media, backwashing (Tanvir sir T09).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-filt' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const water = 'var(--c-water)'
const soil = 'var(--c-soil)'
const accent = 'var(--c-accent)'
const panel2 = 'var(--c-panel2)'
const good = 'var(--c-good)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)
const Mk = ({ id }: { id: string }) => (
  <defs>
    <marker id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill={ink} />
    </marker>
  </defs>
)

// ---------- figures ----------
/** sections of a rapid and a slow sand filter */
const FilterSectionFig: FC = () => {
  const sand = (x: number, y: number, w: number, h: number, dens: number) =>
    Array.from({ length: Math.floor((w * h) / dens) }, (_, i) => {
      const cx = x + 5 + ((i * 37) % (w - 10))
      const cy = y + 4 + ((i * 53) % (h - 8))
      return <circle key={i} cx={cx} cy={cy} r={1.6} fill={ink} opacity={0.55} />
    })
  return (
    <svg viewBox="0 0 640 330" width="100%" role="img" aria-label="Sections of a rapid sand filter and a slow sand filter">
      <Mk id="ev-fl-a" />
      {/* RSF */}
      <Tx x={150} y={16} t="Rapid sand filter (gravity)" b />
      <rect x={30} y={30} width={240} height={250} fill="none" stroke={ink} strokeWidth={2} />
      <rect x={31} y={60} width={238} height={50} fill={water} opacity={0.25} />
      <Tx x={150} y={88} t="water 1–1.5 m" s={11} />
      <rect x={60} y={42} width={40} height={18} fill={panel2} stroke={mute} />
      <rect x={200} y={42} width={40} height={18} fill={panel2} stroke={mute} />
      <Tx x={80} y={55} t="trough" s={10} />
      <Tx x={220} y={55} t="trough" s={10} />
      <rect x={31} y={110} width={238} height={70} fill={soil} opacity={0.25} />
      {sand(31, 110, 238, 70, 200)}
      <Tx x={150} y={150} t="sand 0.6–1 m, d₁₀ 0.45–0.55 mm" s={11} />
      <rect x={31} y={180} width={238} height={50} fill={soil} opacity={0.5} />
      <Tx x={150} y={208} t="graded gravel 0.3–0.5 m" s={11} />
      <rect x={31} y={230} width={238} height={36} fill="none" stroke={mute} strokeDasharray="4 3" />
      <Tx x={150} y={252} t="underdrain (perforated laterals)" s={11} />
      <path d="M150,266 V300" stroke={ink} markerEnd="url(#ev-fl-a)" />
      <Tx x={150} y={318} t="filtered water (backwash comes up the same way)" s={11} c={mute} />
      <path d="M10,70 H30" stroke={ink} markerEnd="url(#ev-fl-a)" />
      <Tx x={20} y={62} t="in" s={10.5} />
      {/* SSF */}
      <Tx x={480} y={16} t="Slow sand filter" b />
      <rect x={360} y={30} width={240} height={250} fill="none" stroke={ink} strokeWidth={2} />
      <rect x={361} y={50} width={238} height={50} fill={water} opacity={0.25} />
      <Tx x={480} y={80} t="supernatant 1 m" s={11} />
      <rect x={361} y={100} width={238} height={8} fill={good} opacity={0.6} />
      <Tx x={480} y={96} t="" s={10} />
      <Tx x={606} y={107} t="Schmutzdecke" a="end" s={10.5} c={good} />
      <rect x={361} y={108} width={238} height={90} fill={soil} opacity={0.25} />
      {sand(361, 108, 238, 90, 130)}
      <Tx x={480} y={152} t="fine sand 1.0–1.4 m, d₁₀ 0.1–0.3 mm" s={11} />
      <rect x={361} y={198} width={238} height={44} fill={soil} opacity={0.5} />
      <Tx x={480} y={224} t="coarse gravel" s={11} />
      <rect x={361} y={242} width={238} height={24} fill="none" stroke={mute} strokeDasharray="4 3" />
      <Tx x={480} y={258} t="slotted pipe underdrain" s={11} />
      <path d="M480,266 V300" stroke={ink} markerEnd="url(#ev-fl-a)" />
      <Tx x={480} y={318} t="clear water (0.1–0.4 m/h)" s={11} c={mute} />
      <path d="M340,60 H360" stroke={ink} markerEnd="url(#ev-fl-a)" />
      <Tx x={350} y={52} t="in" s={10.5} />
    </svg>
  )
}

/** removal mechanisms around one sand grain */
const MechanismFig: FC = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Particle removal mechanisms around a filter grain">
    <Mk id="ev-fm-a" />
    <circle cx={200} cy={150} r={70} fill={panel2} stroke={ink} strokeWidth={2} />
    <Tx x={200} y={154} t="sand grain" b />
    {[-55, -30, 0, 30, 55].map((d) => (
      <path key={d} d={`M60,${150 + d * 1.6} Q200,${150 + d * 2.6} 340,${150 + d * 1.6}`} fill="none" stroke={water} strokeWidth={1.4} />
    ))}
    <path d="M110,100 L160,92" stroke={accent} strokeWidth={2} markerEnd="url(#ev-fm-a)" />
    <circle cx={106} cy={101} r={4} fill={accent} />
    <Tx x={80} y={84} t="1 inertial impaction" a="start" s={11} />
    <circle cx={165} cy={72} r={4} fill={accent} />
    <Tx x={175} y={62} t="2 interception" a="start" s={11} />
    <path d="M250,92 q8,-10 14,0 t14,0" fill="none" stroke={accent} />
    <circle cx={248} cy={92} r={3.5} fill={accent} />
    <Tx x={270} y={78} t="3 diffusion (Brownian)" a="start" s={11} />
    <circle cx={160} cy={222} r={4} fill={accent} />
    <path d="M160,226 v14" stroke={accent} markerEnd="url(#ev-fm-a)" />
    <Tx x={90} y={262} t="4 sedimentation (pore = tiny basin)" a="start" s={11} />
    <circle cx={258} cy={186} r={4} fill={accent} />
    <Tx x={270} y={188} t="5 electrostatic / van der Waals attraction" a="start" s={11} />
    <rect x={380} y={40} width={250} height={230} rx={6} fill="none" stroke={mute} />
    <Tx x={392} y={62} t="Granular media filtration" a="start" b />
    <Tx x={392} y={86} t="A. Physicochemical" a="start" s={11.5} b />
    <Tx x={400} y={104} t="mechanical straining (surface mat)" a="start" s={11} />
    <Tx x={400} y={120} t="non-straining: 1–5 transport" a="start" s={11} />
    <Tx x={400} y={136} t="attachment: coagulation, adhesion," a="start" s={11} />
    <Tx x={400} y={152} t="adsorption" a="start" s={11} />
    <Tx x={392} y={182} t="B. Biological" a="start" s={11.5} b />
    <Tx x={400} y={200} t="microbial film (Schmutzdecke) on grains" a="start" s={11} />
    <Tx x={400} y={216} t="predation, digestion of bacteria" a="start" s={11} />
    <Tx x={392} y={250} t="Particles < 1 µm are removed too" a="start" s={11} c={mute} />
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-filt-why',
    topic: T,
    title: 'Why filtration is needed',
    points: [
      { k: 'Sedimentation alone does not give clear, safe water', alt: ['sedimentation will not give sparkling water'] },
      { k: 'Filter media retain fine and colloidal particles', alt: ['retain clay and silt'] },
      { k: 'Aids removal of colour, odour, iron and manganese', alt: ['colour, odor, iron and manganese'] },
      { k: 'May serve as primary turbidity removal', alt: ['direct filtration'] },
    ],
    seen: [],
    src: 'TA T09 p2',
  },
  {
    id: 'l-filt-types',
    topic: T,
    title: 'Types of filters',
    points: [
      { k: 'Granular media filters', alt: ['SSF RSF roughing filter', 'sand filters'], d: 'slow sand, rapid sand, roughing; sand, anthracite, coal, magnetite 0.1–10 mm' },
      { k: 'Diatomaceous earth', alt: ['diatomite'], d: '7–50 µm' },
      { k: 'Membrane filtration', alt: ['membranes'], d: '0.45–0.2 µm' },
    ],
    seen: [],
    src: 'TA T09 p3',
  },
  {
    id: 'l-filt-nonstrain',
    topic: T,
    title: 'Non-straining mechanisms of particle removal',
    ask: 'Describe the non-straining mechanisms of particle removal in filtration.',
    points: [
      { k: 'Impaction', alt: ['inertial impaction'], d: 'inertia of the particle' },
      { k: 'Hydrodynamic forces', alt: ['non-uniform shear'], d: 'non-uniform shear distribution in pores' },
      { k: 'Interception', d: 'particle on a streamline passing within one radius of the grain' },
      { k: 'Diffusion', alt: ['Brownian motion'] },
      { k: 'Attraction forces', alt: ['van der Waals', 'electrostatic attraction'] },
      { k: 'Sedimentation', alt: ['settling in pores'], d: 'pores act as small settling basins' },
    ],
    hook: 'I-H-I-D-A-S: Impaction, Hydrodynamic, Interception, Diffusion, Attraction, Sedimentation.',
    seen: ['2009-10', '2010-11', '2016-17', '2021-22', '2023-24', 'Jan 2021'],
    src: 'TA T09 p8–9',
  },
  {
    id: 'l-filt-attach',
    topic: T,
    title: 'Attachment mechanisms',
    points: [
      { k: 'Coagulation' },
      { k: 'Adhesion' },
      { k: 'Adsorption' },
    ],
    seen: [],
    src: 'TA T09 p9',
  },
  {
    id: 'l-filt-backwash',
    topic: T,
    title: 'When is filter backwashing done (run terminated when…)',
    ask: 'When is filter backwashing done?',
    points: [
      { k: 'Available driving force (head) is used up', alt: ['head loss reaches limit', 'maximum head loss', 'driving force used up'] },
      { k: 'Filtering velocity drops below a set level', alt: ['filtration rate falls', 'flow drops'] },
      { k: 'Storage capacity exhausted: solids break through', alt: ['turbidity breakthrough', 'effluent quality deteriorates', 'solids begin to break through'] },
    ],
    seen: ['2022-23', '2017-18'],
    src: 'TA T09 p11',
  },
  {
    id: 'l-filt-rsf-problems',
    topic: T,
    title: 'Operational difficulties in rapid sand filters',
    points: [
      { k: 'Negative head and air binding', alt: ['air binding', 'negative head'] },
      { k: 'Formation of mud balls', alt: ['mud balls'] },
      { k: 'Cracking of filter bed', alt: ['cracking'] },
      { k: 'Jetting and sand boils', alt: ['sand boils', 'jetting'] },
      { k: 'Sand leakage', alt: ['loss of sand'] },
    ],
    seen: [],
    src: 'TA T09 p23–24',
  },
  {
    id: 'l-filt-rough-types',
    topic: T,
    title: 'Types of roughing filter',
    points: [
      { k: 'Down-flow roughing filter', alt: ['DRF', 'downflow'] },
      { k: 'Up-flow roughing filter', alt: ['URF', 'upflow'], d: 'hydraulic cleaning is favourable' },
      { k: 'Horizontal-flow roughing filter', alt: ['HRF', 'horizontal flow'] },
    ],
    seen: [],
    src: 'TA T09 p13',
  },
  {
    id: 'l-filt-rough-adv',
    topic: T,
    title: 'Advantages of roughing filtration',
    ask: 'What are the purposes (advantages) of a roughing filter?',
    points: [
      { k: 'Pretreats high-turbidity water', alt: ['pretreatment', 'reduces turbidity before SSF'], d: 'SS removal up to 95 %, turbidity 50–90 %' },
      { k: 'Deep penetration of filter material', alt: ['deep penetration'] },
      { k: 'Large silt storage capacity', alt: ['silt storage'] },
      { k: 'More effective than pre-sedimentation before SSF', alt: ['used before SSF', 'protects SSF'] },
    ],
    seen: ['2020-21', '2022-23'],
    src: 'TA T09 p13–15',
  },
  {
    id: 'l-filt-ssf-char',
    topic: T,
    title: 'Characteristics of slow sand filtration',
    points: [
      { k: 'Very low rate of filtration', alt: ['0.1–0.4 m/h'] },
      { k: 'High turbidity (80–85 %) and colour (95–99.9 %) removal', alt: ['high removal of turbidity and colour'] },
      { k: 'No pretreatment for water below 30 NTU', alt: ['no pretreatment generally required'] },
      { k: 'Poor for colloids, algae, turbidity above 30 NTU', alt: ['not effective for colloidal matter', 'limitations'] },
      { k: 'Low cost operation and maintenance', alt: ['low cost'] },
      { k: 'Ripening 2–4 weeks', alt: ['ripening period'], d: 'later cleaning regains activity in hours' },
      { k: 'Cleaned by scraping top 1.5–2 cm', alt: ['scraping', 'surface scraping'] },
      { k: 'Best under continuous constant flow', alt: ['continuous operation'] },
    ],
    seen: ['2012-13'],
    src: 'TA T09 p18',
  },
  {
    id: 'l-filt-rsf-char',
    topic: T,
    title: 'Characteristics of rapid sand filtration',
    points: [
      { k: 'High filtration rate 5–15 m/h', alt: ['5–10 m/h', 'high rate'] },
      { k: 'Turbidity 80–85 % and colour 85–95 % removal', alt: ['high removal of turbidity and colour'] },
      { k: 'Pretreatment (coagulation, flocculation, sedimentation) required', alt: ['pretreatment required'] },
      { k: 'Suitable for all types of turbid and coloured water', alt: ['all types of water'] },
      { k: 'Relatively high operating cost', alt: ['high cost'] },
      { k: 'Cleaned by backwashing', alt: ['backwash'] },
    ],
    seen: ['2012-13', '2023-24'],
    src: 'TA T09 p19–20',
  },
  {
    id: 'l-filt-gradation',
    topic: T,
    title: 'Effect of gradation in a rapid sand filter',
    points: [
      { k: 'Backwash leaves smallest grains at the top', alt: ['natural gradation fine at top'] },
      { k: 'Strong flocs clog the fine surface', alt: ['rapid head loss build-up', 'frequent backwashing'] },
      { k: 'Reversing the gradation helps', alt: ['coarse to fine', 'dual and mixed media'] },
      { k: 'Uses whole depth, longer runs, higher rates', alt: ['entire depth', 'less head loss', 'larger SS storage'] },
    ],
    seen: ['2020-21', 'Jan 2021', '2022-23'],
    src: 'TA T09 p21–22',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-filt-straining', topic: T, front: 'What is mechanical straining and why is it undesirable in granular filters?', back: 'Particles larger than the pores are caught at the surface (screens, membranes). In sand filters it forms a surface mat and head loss climbs rapidly, so depth filtration (non-straining) is preferred.', seen: ['2021-22', '2023-24'], src: 'TA T09 p7' },
  { id: 'c-filt-schmutz', topic: T, front: 'What is the Schmutzdecke?', back: 'A thin biological film (microbial slime) on the top 25–50 mm of a slow sand filter that traps and digests bacteria and colloids. It forms in 2–4 weeks (ripening) and is lost when the top layer is scraped.', seen: ['2007-08', '2008-09', '2011-12', '2015-16'], src: 'TA T09 p6, p17' },
  { id: 'c-filt-ssf-vs-rsf-removal', topic: T, front: 'SSF vs RSF: bacteria removal mechanism?', back: 'SSF: removal by the biological layer (Schmutzdecke). RSF: removal by the Al-floc layer (coagulated floc, physicochemical).', seen: ['2012-13', '2023-24'], src: 'TA T09 p17' },
  { id: 'c-filt-rates', topic: T, front: 'Filtration rates of SSF, RSF, roughing filter?', back: 'SSF 0.1–0.4 m/h; RSF 5–10 m/h (up to 15 per slide p20); URF 1–2 m/h.', seen: ['2012-13'], src: 'TA T09 p25' },
  { id: 'c-filt-d10', topic: T, front: 'Effective size D₁₀ and uniformity coefficient: SSF, RSF, URF?', back: 'SSF 0.1–0.3 mm, U 2–3; RSF 0.45–0.55 mm, U 1.2–1.7; URF 5–8 mm, U 1.7–2.5.', seen: ['2012-13'], src: 'TA T09 p25' },
  { id: 'c-filt-clean', topic: T, front: 'Method of cleaning SSF, RSF, URF?', back: 'SSF: scraping the top 1.5–2 cm. RSF: backwashing. URF: flushing (hydraulic shock drainage) or manual excavation.', seen: ['2012-13'], src: 'TA T09 p14, p25' },
  { id: 'c-filt-run', topic: T, front: 'Filter run, ripening and thickness: SSF, RSF, URF?', back: 'Run: SSF 40–60 days, RSF 1–3 days, URF 21–28 days. Ripening: SSF 0.25–30 days, RSF 5–10 min, URF 3–10 days. Bed: SSF 1.0–1.4 m, RSF 0.3 to over 1 m, URF 0.6–1.0 m.', src: 'TA T09 p25' },
  { id: 'c-filt-suit', topic: T, front: 'Turbidity suitability and pretreatment: SSF, RSF, URF?', back: 'SSF: below 50 NTU (30 for no pretreatment), pretreat with URF or plain sedimentation. RSF: above 50 NTU after coagulation, flocculation, sedimentation. URF: 50–150 NTU, needs none.', src: 'TA T09 p25' },
  { id: 'c-filt-underdrain', topic: T, front: 'Underdrains of SSF, RSF, URF?', back: 'SSF: slotted pipe grid. RSF: gravel layers and perforated tiles / laterals. URF: perforated RCC slab.', src: 'TA T09 p4, p25' },
  { id: 'c-filt-area', topic: T, front: 'Which filter needs the most area?', back: 'The slow sand filter (large), RSF is small, URF moderate, because of the very low rate.', src: 'TA T09 p25' },
  { id: 'c-filt-gravel', topic: T, front: 'Why graded gravel under the sand?', back: 'It supports the sand, prevents loss of media into the underdrain and spreads backwash water evenly.', src: 'TA T09 p4' },
  { id: 'c-filt-backwash-how', topic: T, front: 'How does backwashing clean a filter?', back: 'Clean water is forced upward through the media, expanding the bed so grains no longer touch; hydrodynamic shear scrubs off the deposits. Wash water runs to waste and may be recycled.', seen: ['2017-18', '2022-23'], src: 'TA T09 p11–12' },
  { id: 'c-filt-valves', topic: T, front: 'Valve operation of a rapid filter?', back: 'Filtering: influent A and effluent B open. Backwash: wash water C and waste D open. Filter-to-waste (ripening): A and E open until effluent quality is good.', src: 'TA T09 p12' },
  { id: 'c-filt-rose', topic: T, front: 'What does the Rose equation say about head loss?', back: 'Head loss in a clean sand bed is proportional to the square of the filtration rate and depth, inversely to grain size, and very strongly inverse to porosity ε⁴.', src: 'TA T09 p10' },
  { id: 'c-filt-airbind', topic: T, front: 'What are air binding and negative head?', back: 'Late in a run, head loss in the upper bed exceeds the water depth, so pressure in the bed falls below atmospheric; dissolved gases come out as bubbles that block pores, increasing head loss and causing breakthrough.', src: 'TA T09 p23' },
  { id: 'c-filt-direct-fe', topic: T, front: 'Why is direct filtration of aerated iron water not recommended?', back: 'Iron precipitate clogs the sand surface, requiring backwash twice a day, wasting 30–40 % of water, changing sand every 3–4 months and using extra power.', src: 'TA T13 p3' },
  { id: 'c-filt-dual', topic: T, front: 'What is a dual-media filter and a mixed (multi) media filter?', back: 'Dual: coarse light anthracite or coal above fine dense sand. Mixed: coal, sand and garnet (finest and densest at the bottom). Both give coarse-to-fine gradation after backwash.', seen: ['2020-21', 'Jan 2021', '2022-23'], src: 'TA T09 p21–22' },
  { id: 'c-filt-rough-eff', topic: T, front: 'Efficiency of roughing filters?', back: 'SS removal up to 95 %, turbidity 50–90 %, colour 20–50 %, faecal coliform 0.65–2.5 log, iron and manganese up to 50 %. Limited to 20–150 NTU to avoid frequent clogging.', src: 'TA T09 p14–15' },
  { id: 'c-filt-pond', topic: T, front: 'What is a pond sand filter (PSF)?', back: 'A low-cost SSF at pond edges for rural Bangladesh: pond water passes through a roughing and fine sand bed under gravity, giving microbe-free water for a village (treats pond water, not arsenic).', src: 'textbook; PSF is also in Rowshan ma\u2019am L5' },
  { id: 'c-filt-ssf-suit', topic: T, front: 'Why is SSF suitable for developing countries?', back: 'Simple, no chemicals, low cost operation and maintenance, high removal of turbidity (80–85 %), colour and bacteria; suited to surface-water-based supplies if turbidity is low.', src: 'TA T09 p16, p18' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-filt-mech',
    topic: T,
    q: 'What are the mechanisms of removal of turbidity and microorganisms through granular media filtration? Describe straining and non-straining mechanisms. Explain with diagram.',
    seen: ['2009-10', '2010-11', '2015-16', '2016-17', '2021-22', '2023-24', 'Jan 2021'],
    a: `### Mechanisms of particle removal
In filtration particles either accumulate on the surface or are collected through the bed depth. A well-designed filter removes virtually all solids down to the submicron size.

**A. Physicochemical**
1. **Mechanical straining**: particles larger than the pores are held at the surface (principal in screens and membranes). Undesirable in granular filters: a mat forms and **head loss** rises quickly.
2. **Non-straining (transport) mechanisms**:
   - **Impaction**: inertia carries particles off the streamlines onto the grain.
   - **Hydrodynamic forces**: non-uniform shear in the pores.
   - **Interception**: a particle on a streamline passing within a radius of the grain.
   - **Diffusion**: Brownian motion of very small particles.
   - **Attraction forces**: van der Waals and electrostatic attraction.
   - **Sedimentation**: denser particles deviate from streamlines, **pores act as small settling basins**.
3. **Attachment mechanisms**: coagulation, adhesion, adsorption hold the particle once it touches the grain.

**B. Biological**: a microbial film (**Schmutzdecke**) on the grains in a slow sand filter traps and digests bacteria.

Flocculation also occurs as the flow converges through the pores.`,
    keys: ['Mechanical straining', 'Non-straining', 'Impaction', 'Hydrodynamic', 'Interception', 'Diffusion', 'Attraction forces', 'Sedimentation', 'Schmutzdecke', 'adsorption'],
    lists: ['l-filt-nonstrain', 'l-filt-attach'],
    src: 'TA T09 p6–9, p17',
    Fig: MechanismFig,
  },
  {
    id: 'a-filt-ssf-removal',
    topic: T,
    q: 'Explain briefly, with diagram, the mechanisms of removal of colloidal particles and bacteria in slow sand filtration.',
    seen: ['2007-08', '2008-09', '2011-12', '2015-16'],
    a: `### Slow sand filtration (SSF) mechanisms
1. **Schmutzdecke (biological layer)**: in the top 25–50 mm of sand a thin slime of bacteria, algae and protozoa forms during ripening (2–4 weeks). It is the main agent of removal.
2. **Adsorption / interception**: colloidal particles and bacteria meet the sticky biological film and the sand grains and are **adsorbed** (van der Waals and electrostatic attraction, interception).
3. **Biological action**: predators, bacteria and enzymes digest the trapped bacteria and **oxidise dissolved organic compounds**.
4. **Sedimentation** in the pore spaces (pores act as tiny settling basins) and **flocculation** as the flow converges through the pores; some straining at the surface.
5. Result: turbidity removal 80–85 %, colour 95–99.9 % and almost complete bacterial removal. Cleaning by scraping the top 1.5–2 cm; the layer regenerates in hours (ripening 2–4 weeks when new).
6. By contrast, removal in an RSF is by the **Al-floc layer**.`,
    keys: ['Schmutzdecke', 'biological', 'adsorption', 'interception', 'Sedimentation', 'flocculation', 'oxidise', 'scraping'],
    lists: ['l-filt-ssf-char'],
    src: 'TA T09 p6, p16–18',
    Fig: FilterSectionFig,
  },
  {
    id: 'a-filt-ssf-rsf',
    topic: T,
    q: 'Compare slow sand filter with rapid sand filter in respect of bacteria removal mechanism, cleaning, rate of filtration, effective size D₁₀.',
    seen: ['2012-13', '2023-24'],
    a: `### SSF vs RSF
| Characteristic | **Slow sand filter** | **Rapid sand filter** |
|---|---|---|
| Bacteria / particle removal | biological layer (**Schmutzdecke**), adsorption | **Al-floc layer**, physicochemical (non-straining) |
| Rate of filtration | **0.1–0.4 m/h** | **5–10 m/h** (5–15 m³/m²h) |
| Effective size D₁₀ | **0.1–0.3 mm**, U = 2–3 | **0.45–0.55 mm** (0.4–1.2), U = 1.2–1.7 |
| Method of cleaning | **surface scraping** (top 1.5–2 cm) | **backwashing** (reverse flow) |
| Bed depth | 1.0–1.4 m fine sand | 0.3 to over 1 m medium-coarse sand |
| Pretreatment | roughing filter / plain sedimentation | coagulation, flocculation, sedimentation |
| Suitability | turbidity below 50 NTU | turbidity above 50 NTU, any turbid or coloured water |
| Ripening | 0.25–30 days | 5–10 min |
| Filter run | 40–60 days | 1–3 days |
| Area / cost | large area, low O&M | small area, high O&M |
| Underdrain | slotted pipe grid | gravel and perforated laterals |`,
    keys: ['Schmutzdecke', 'Al-floc layer', '0.1–0.4 m/h', '5–10 m/h', 'D₁₀', 'scraping', 'backwashing'],
    lists: ['l-filt-ssf-char', 'l-filt-rsf-char'],
    src: 'TA T09 p17–20, p25',
    Fig: FilterSectionFig,
  },
  {
    id: 'a-filt-media',
    topic: T,
    q: 'How do the filter materials used in SSF and RSF differ?',
    seen: ['2020-21'],
    a: `### Filter materials
| | **SSF** | **RSF** |
|---|---|---|
| Sand | **fine to medium** sand, D₁₀ 0.1–0.3 mm, uniformity coefficient 2–3 | **medium to coarse** sand, D₁₀ 0.45–0.55 mm (0.4–1.2), **uniform** U = 1.2–1.7 |
| Depth | 1.0–1.4 m (about 1 m) | 0.3 to over 1 m (about 0.6–1 m) |
| Support | coarse gravel / aggregate | graded gravel 15–24 in (0.3–0.5 m) |
| Medium | sand only, with biological layer | sand, or dual (anthracite + sand) and mixed (coal, sand, garnet) media |
| Underdrain | slotted pipe grid | perforated laterals or tiles, strainers |
Fine sand traps the biology in SSF; coarse uniform sand lets RSF run at high rate and backwash cleanly.`,
    keys: ['fine to medium', 'medium to coarse', 'D₁₀', 'uniformity coefficient', 'graded gravel'],
    src: 'TA T09 p4, p19, p25',
  },
  {
    id: 'a-filt-rough',
    topic: T,
    q: 'What are the purposes of a roughing filter? Write a short note on roughing filtration.',
    seen: ['2020-21', '2022-23'],
    a: `### Roughing filtration
1. **Purpose**: pretreating water of **high turbidity** (20–150 NTU) before a slow sand filter; protects the SSF from clogging.
2. **Types**: down-flow, **up-flow** (hydraulic cleaning easy) and horizontal-flow; compartments of decreasing gravel size (D₁₀ 5–8 mm).
3. **Efficiency**: SS removal up to 95 %, turbidity 50–90 %, colour 20–50 %, faecal coliform 0.65–2.5 log, Fe and Mn about 50 %. Rate 1–2 m/h, run 21–28 days.
4. **Advantages**: deep penetration of solids, **large silt storage capacity**, more effective pretreatment than plain sedimentation, no chemicals.
5. **Disadvantage**: limited to turbidity 20–150 NTU, otherwise it clogs too often.
6. **Cleaning**: hydraulically (shock drainage, flushing) or manually (excavate, wash, refill).`,
    keys: ['high turbidity', 'slow sand filter', 'Up-flow', 'silt storage', '95 %', 'shock drainage'],
    lists: ['l-filt-rough-types', 'l-filt-rough-adv'],
    src: 'TA T09 p13–15, p25',
  },
  {
    id: 'a-filt-dual',
    topic: T,
    q: 'Explain how dual and mixed-media filters increase the effectiveness of filtration, and how they keep the desired gradation after backwashing.',
    seen: ['2020-21', 'Jan 2021', '2022-23'],
    a: `### Why dual and mixed media
1. After a normal backwash the **finest grains settle at the top**; strong floc blocks that surface, head loss builds quickly and runs are short.
2. If the gradation is **reversed (coarse above, fine below)** the **whole depth** of the bed is used: larger volumes of SS are stored between backwashes, **longer filter runs, less head loss and higher filtration rates**.
3. **Dual media**: a layer of coarse, light **anthracite or coal** over fine, dense **sand**.
4. **Mixed (multi) media**: coal, sand and **garnet**: the grain size falls and the density rises with depth, with overlapping zones, so pore size decreases smoothly with depth.

### Gradation after backwashing
Backwash fluidises the bed and each grain settles according to its **size and density**: the large light coal stays on top and the small dense sand and garnet go to the bottom, so selecting media by size and density **re-establishes the coarse-to-fine gradation** every time.`,
    keys: ['finest grains', 'whole depth', 'longer filter runs', 'anthracite', 'garnet', 'size and density', 'head loss'],
    lists: ['l-filt-gradation'],
    src: 'TA T09 p21–22; Notes-S p20',
  },
  {
    id: 'a-filt-backwash',
    topic: T,
    q: 'When is filter backwashing done? Write a short note on filter backwashing.',
    seen: ['2022-23', '2017-18'],
    a: `### Backwashing
1. **When**: the run is ended when enough solids have accumulated to (a) use up the available **driving force (head)**, (b) cause the **filtering velocity** to fall below a set level, or (c) exhaust the storage capacity so that solids **break through** into the effluent.
2. **How**: close the influent and effluent valves, open the wash-water supply (C) and waste (D); clean water flows **upward** through the media at a rate that **expands the bed** so the grains no longer touch.
3. **Cleaning action**: **hydrodynamic shear** on the exposed grain surfaces removes the deposits; wash water goes to the trough and waste.
4. Afterwards the filter is put back (filter-to-waste, A and E open, until the effluent quality is acceptable).
5. Wash water can be re-run through coagulation and sedimentation (the solids are stabilised).
6. Problems if poorly done: mud balls, cracking, jetting, sand loss.`,
    keys: ['driving force', 'filtering velocity', 'break through', 'upward', 'expands the bed', 'hydrodynamic shear', 'mud balls'],
    lists: ['l-filt-backwash', 'l-filt-rsf-problems'],
    src: 'TA T09 p11–12, p23–24',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
