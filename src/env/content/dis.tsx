// ev-dis — disinfection: chlorine chemistry, breakpoint chlorination, THMs and DBPs, the ideal disinfectant (Tanvir sir T10).
// Chick–Watson numbers live in engine/chlorine.ts.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-dis' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const accent = 'var(--c-accent)'
const accent2 = 'var(--c-accent2)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'
const water = 'var(--c-water)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

// ---------- figures ----------
/** breakpoint chlorination curve */
const BreakpointFig: FC = () => {
  const X = (v: number) => 70 + v * 44
  const Y = (v: number) => 250 - v * 42
  const pts: [number, number][] = [
    [0, 0], [1, 0.05], [1.6, 0.6], [2.5, 1.9], [3.5, 3.1], [4, 3.3], [4.6, 3.0], [5.6, 2.0], [6.6, 1.2], [7.6, 0.9], [8.6, 1.8], [9.6, 2.8], [10.6, 3.9],
  ]
  const d = pts.map(([x, v]) => `${X(x)},${Y(v)}`).join(' ')
  return (
    <svg viewBox="0 0 620 320" width="100%" role="img" aria-label="Breakpoint chlorination curve">
      <defs>
        <marker id="ev-bp-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ink} />
        </marker>
      </defs>
      <line x1={70} x2={70} y1={20} y2={250} stroke={ink} markerStart="url(#ev-bp-a)" />
      <line x1={70} x2={560} y1={250} y2={250} stroke={ink} markerEnd="url(#ev-bp-a)" />
      <text x={20} y={135} fontSize={11.5} fill={ink} textAnchor="middle" transform="rotate(-90 20 135)">
        chlorine residual (mg/L)
      </text>
      <Tx x={315} y={292} t="chlorine dose (mg/L) →" />
      <polyline points={`${X(0)},${Y(0)} ${X(10.6)},${Y(10.6 * 0.4)}`} fill="none" stroke={mute} strokeDasharray="5 4" />
      <Tx x={500} y={Y(4.1) - 10} t="chlorine applied" s={10.5} c={mute} />
      <rect x={X(1.2)} y={20} width={X(4.3) - X(1.2)} height={230} fill={accent2} opacity={0.12} />
      <rect x={X(4.3)} y={20} width={X(7.6) - X(4.3)} height={230} fill={bad} opacity={0.1} />
      <rect x={X(7.6)} y={20} width={X(11) - X(7.6)} height={230} fill={good} opacity={0.12} />
      <polyline points={d} fill="none" stroke={accent} strokeWidth={3} />
      <circle cx={X(4)} cy={Y(3.3)} r={4.5} fill={accent2} />
      <circle cx={X(7.6)} cy={Y(0.9)} r={5} fill={bad} />
      <Tx x={X(4)} y={Y(3.3) - 8} t="B: peak of combined residual" s={10.5} />
      <Tx x={X(7.6)} y={Y(0.9) + 18} t="breakpoint" b c={bad} />
      <Tx x={X(0.6)} y={236} t="1" b />
      <Tx x={X(2.7)} y={36} t="2: chloramines and" s={10.5} b />
      <Tx x={X(2.7)} y={50} t="chloro-organics formed" s={10.5} b />
      <Tx x={X(5.9)} y={36} t="3: chloramines and" s={10.5} b />
      <Tx x={X(5.9)} y={50} t="chloro-organics destroyed" s={10.5} b />
      <Tx x={X(9.3)} y={36} t="4: free chlorine" s={10.5} b />
      <Tx x={X(9.3)} y={50} t="residual rises" s={10.5} b />
      <Tx x={X(0.6)} y={226} t="reducing compounds (Fe²⁺, Mn²⁺, H₂S, organics) consume it" s={10} c={mute} a="start" />
    </svg>
  )
}

/** the three hypotheses: what chlorine does to a cell */
const CellFig: FC = () => (
  <svg viewBox="0 0 620 270" width="100%" role="img" aria-label="Three disinfection hypotheses on a microbial cell">
    <defs>
      <marker id="ev-ce-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={bad} />
      </marker>
    </defs>
    <ellipse cx={170} cy={125} rx={120} ry={85} fill={panel2} stroke={ink} strokeWidth={3} />
    <ellipse cx={170} cy={125} rx={106} ry={72} fill="none" stroke={mute} strokeWidth={2} strokeDasharray="6 3" />
    <ellipse cx={170} cy={125} rx={60} ry={38} fill={water} opacity={0.25} stroke={mute} />
    <Tx x={170} y={129} t="protoplasm, enzymes" s={11} />
    <Tx x={170} y={22} t="cell wall" s={11} c={mute} />
    <Tx x={170} y={46} t="cell membrane" s={11} c={mute} />
    <text x={30} y={80} fontSize={22} fill={bad}>
      HOCl
    </text>
    <path d="M70,92 L96,112" stroke={bad} markerEnd="url(#ev-ce-a)" strokeWidth={2} />
    <rect x={330} y={20} width={280} height={228} rx={6} fill="none" stroke={line} />
    <Tx x={342} y={44} t="1. Damage to the cell wall" a="start" b />
    <Tx x={352} y={60} t="oxidant destroys the wall, cell lyses" a="start" s={11} c={mute} />
    <Tx x={342} y={92} t="2. Change of cell permeability" a="start" b />
    <Tx x={352} y={108} t="membrane leaks nutrients, cell dies" a="start" s={11} c={mute} />
    <Tx x={342} y={140} t="3. Alteration of the colloidal nature" a="start" b />
    <Tx x={352} y={156} t="of protoplasm (enzyme inactivation)" a="start" s={11} c={mute} />
    <Tx x={342} y={196} t="Low dose: HOCl penetrates the cell and" a="start" s={11} />
    <Tx x={342} y={212} t="reacts with enzymes and protoplasm;" a="start" s={11} />
    <Tx x={342} y={228} t="high dose: cell wall is oxidised." a="start" s={11} />
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-dis-agents',
    topic: T,
    title: 'Common disinfectants in drinking water',
    points: [
      { k: 'Free chlorine', alt: ['chlorine', 'HOCl', 'hypochlorous acid'] },
      { k: 'Combined chlorine', alt: ['chloramines', 'chloramine'] },
      { k: 'Ozone', alt: ['O3'] },
      { k: 'Chlorine dioxide', alt: ['ClO2'] },
      { k: 'Ultraviolet irradiation', alt: ['UV', 'ultraviolet'] },
    ],
    seen: [],
    src: 'TA T10 p2',
  },
  {
    id: 'l-dis-ideal',
    topic: T,
    title: 'Characteristics of an ideal disinfectant',
    ask: 'What are the characteristics of an ideal disinfectant?',
    points: [
      { k: 'Destroys pathogens in a practicable time', alt: ['kills all pathogens', 'destroy pathogens within practicable period', 'over temperature range'], d: 'over the expected range of water temperature' },
      { k: 'Copes with fluctuations in water composition', alt: ['meets fluctuations in concentration and condition'] },
      { k: 'Neither toxic nor unpalatable', alt: ['non-toxic to humans and animals', 'not objectionable'] },
      { k: 'Concentration determined easily and quickly', alt: ['easy to measure', 'automatic monitoring', 'easy detection'] },
      { k: 'Reasonable cost', alt: ['cheap', 'economical'] },
    ],
    hook: 'D-F-N-M-C: Destroys, Fluctuations, Non-toxic, Measurable, Cost.',
    seen: ['2021-22'],
    src: 'TA T10 p3',
  },
  {
    id: 'l-dis-mech',
    topic: T,
    title: 'Hypotheses (mechanisms) of disinfection by chemical oxidants',
    ask: 'What are the three theories (hypotheses) of water disinfection?',
    points: [
      { k: 'Damage to the cell wall', alt: ['destruction of cell wall', 'cell wall destruction', 'oxidation of cell wall'] },
      { k: 'Alteration of cell permeability', alt: ['change in cell membrane permeability', 'cell membrane permeability'] },
      { k: 'Alteration of colloidal nature of protoplasm', alt: ['inactivation of enzymes', 'enzyme inhibition', 'protoplasm', 'damage to nucleic acid', 'alteration of DNA or RNA'], d: 'chlorine reacts with enzymes and protoplasm' },
    ],
    hook: 'Wall, Membrane, Protoplasm: outside in.',
    seen: ['2007-08', '2008-09', '2009-10', '2010-11', '2012-13', '2016-17'],
    src: 'TA T10 p4 (cell wall, enzymes and protoplasm); textbook (Peavy 6-9) for the three-way split',
    note: 'The CE22 slides give only the effect of chlorine on enzymes, protoplasm and cell wall; the three named hypotheses are the standard textbook list the examiner uses.',
  },
  {
    id: 'l-dis-factors',
    topic: T,
    title: 'Factors affecting disinfection',
    points: [
      { k: 'Form of chlorine', alt: ['HOCl is better than OCl-'], d: 'HOCl more effective than hypochlorite ion' },
      { k: 'pH', d: 'sets HOCl / OCl⁻ ratio; design 6.5–7.5' },
      { k: 'Concentration', alt: ['dose'], d: 'Chick–Watson' },
      { k: 'Contact time', alt: ['time'], d: 'Cⁿt = constant' },
      { k: 'Type of organism', alt: ['organism'], d: 'viruses, cysts, ova more resistant than bacteria' },
      { k: 'Temperature' },
    ],
    seen: [],
    src: 'TA T10 p8',
  },
  {
    id: 'l-dis-dbp',
    topic: T,
    title: 'Disinfection by-products (DBPs)',
    ask: 'Write a short note on disinfection by-products.',
    points: [
      { k: 'Chlorine + NOM gives carcinogenic by-products', alt: ['THM', 'HAA', 'trihalomethanes', 'haloacetic acids'], d: 'THMs, HAAs, haloacetonitriles, haloketones, haloaldehydes, chloropicrin, cyanogen chloride, chlorophenols' },
      { k: 'Chloramines give DBPs at lower concentrations', alt: ['chloramines'] },
      { k: 'ClO₂ and O₃ avoid THMs and HAAs', alt: ['chlorine dioxide and ozone'], d: 'but ClO₂ and chlorite are toxic; ozone with bromide forms bromate and brominated by-products' },
      { k: 'No known DBPs from UV', alt: ['UV radiation'] },
    ],
    seen: ['2017-18'],
    src: 'TA T10 p5',
  },
  {
    id: 'l-dis-bp-zones',
    topic: T,
    title: 'Zones of the breakpoint chlorination curve',
    ordered: true,
    points: [
      { k: 'Destruction of residual by reducing compounds', alt: ['reducing agents Fe Mn H2S', 'initial demand'], d: 'Fe²⁺, Mn²⁺, H₂S, organics' },
      { k: 'Formation of chloramines and chloro-organics', alt: ['combined residual formation'], d: 'combined residual rises to a peak' },
      { k: 'Destruction of chloramines and chloro-organics', alt: ['dip', 'breakpoint approach'], d: 'residual falls to the breakpoint' },
      { k: 'Free chlorine residual', alt: ['formation of free chlorine'], d: 'residual rises parallel to the dose' },
    ],
    seen: ['2008-09', '2011-12', '2015-16'],
    src: 'TA T10 p10–11',
  },
  {
    id: 'l-dis-bp-adv',
    topic: T,
    title: 'Advantages of breakpoint chlorination',
    ask: 'What are the advantages of break-point chlorination?',
    points: [
      { k: 'Destroys taste and odour compounds', alt: ['removes taste and odour', 'oxidises phenols and organics'], d: 'chloramines and chloro-organics are destroyed' },
      { k: 'Oxidises Fe, Mn, H₂S and colour', alt: ['removes colour', 'oxidises iron manganese'] },
      { k: 'Gives free chlorine residual', alt: ['free residual', 'strong disinfection'], d: 'HOCl kills all pathogens quickly' },
      { k: 'Destroys ammonia and chloramines', alt: ['removes ammonia'] },
      { k: 'Assures complete satisfaction of chlorine demand', alt: ['stable residual', 'protection against regrowth'], d: 'any extra dose appears as residual' },
    ],
    seen: ['2008-09', '2011-12', '2015-16'],
    src: 'TA T10 p10–11 + textbook (Davis 6-10)',
    note: 'The slides show the curve and the reactions; the advantages are the textbook consequences.',
  },
  {
    id: 'l-dis-thm',
    topic: T,
    title: 'Ways to control THM formation',
    ask: 'How can THM formation be controlled in a chlorination process?',
    points: [
      { k: 'Remove precursors before chlorination', alt: ['remove NOM first', 'coagulation and filtration before chlorination', 'remove organics'], d: 'enhanced coagulation, GAC / PAC adsorption, aeration' },
      { k: 'Move the point of chlorination', alt: ['avoid pre-chlorination', 'post-chlorination only', 'chlorinate after filtration'], d: 'apply chlorine after sedimentation and filtration' },
      { k: 'Use an alternative disinfectant', alt: ['chloramine', 'ozone', 'chlorine dioxide', 'UV'], d: 'ClO₂, O₃, UV make no THMs; chloramines react little with organics' },
      { k: 'Add ammonia to form chloramine', alt: ['ammonia'], d: 'chloramines do not react with organics and phenols' },
      { k: 'Reduce dose, contact time and pH', alt: ['lower chlorine dose', 'control pH'] },
    ],
    seen: ['2008-09', '2011-12', '2012-13', '2015-16'],
    src: 'TA T10 p5, p11 + textbook (Peavy 6-9)',
  },
  {
    id: 'l-dis-chloramine-rx',
    topic: T,
    title: 'Chloramine formation reactions',
    ordered: true,
    points: [
      { k: 'NH₃ + HOCl → NH₂Cl (monochloramine)', alt: ['monochloramine'] },
      { k: 'NH₂Cl + HOCl → NHCl₂ (dichloramine)', alt: ['dichloramine'] },
      { k: 'NHCl₂ + HOCl → NCl₃ (nitrogen trichloride)', alt: ['nitrogen trichloride', 'trichloramine'] },
    ],
    seen: [],
    src: 'TA T10 p11',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-dis-def', topic: T, front: 'Disinfection vs sterilisation?', back: 'Disinfection reduces pathogens to an acceptable level; sterilisation destroys all micro-organisms. Drinking water need not be sterile. Disinfection must kill bacteria, viruses and amoebic cysts.', src: 'TA T10 p2; Notes-S p20' },
  { id: 'c-dis-chem', topic: T, front: 'Chlorine chemistry in water?', back: 'Cl₂ + H₂O ⇌ HOCl + H⁺ + Cl⁻; HOCl ⇌ H⁺ + OCl⁻. HOCl and OCl⁻ together are free available chlorine. HOCl is the better disinfectant.', src: 'TA T10 p4' },
  { id: 'c-dis-ph', topic: T, front: 'Which pH is best for chlorination and why?', back: 'pH 6.5–7.5: HOCl (strong) dominates below about 7.5 (equal to OCl⁻ at pH 7.5) and drops quickly above; above pH 8 mostly weak OCl⁻.', src: 'TA T10 p4' },
  { id: 'c-dis-mech', topic: T, front: 'How does chlorine kill cells?', back: 'Low concentration: penetrates the cell and reacts with enzymes and protoplasm. High concentration: oxidises the cell wall and destroys the organism.', seen: ['2008-09', '2010-11'], src: 'TA T10 p4' },
  { id: 'c-dis-chick', topic: T, front: 'Chick’s law and the Chick–Watson law?', back: 'Chick: dN/dt = −k N (first order in organisms). Chick–Watson: ln(N/N₀) = −k_cw Cⁿ t; for a given kill Cⁿt = constant (organism, temperature and pH dependent).', src: 'TA T10 p6' },
  { id: 'c-dis-resist', topic: T, front: 'Which organisms resist chlorine most?', back: 'Cysts (Giardia, Cryptosporidium), viruses and ova resist more than bacteria such as E. coli; so turbidity removal before disinfection is essential.', src: 'TA T10 p8; T01 p6' },
  { id: 'c-dis-temp', topic: T, front: 'Effect of temperature on disinfection?', back: 'Kill is faster in warm water: the time for 99 % kill at 20–24 °C is much lower than at 0–5 °C for the same free chlorine.', src: 'TA T10 p9' },
  { id: 'c-dis-combined', topic: T, front: 'Free vs combined chlorine?', back: 'Free: HOCl and OCl⁻, fast, strong. Combined: chloramines, weaker (more concentration and contact time) but persistent, so they give continuous protection in the distribution system.', src: 'TA T10 p11' },
  { id: 'c-dis-bp', topic: T, front: 'What is the breakpoint?', back: 'The dose at which all ammonia, reducing compounds and chloramines have been oxidised; further chlorine appears as free residual. The residual first rises, dips to the breakpoint, then rises again.', src: 'TA T10 p10–11' },
  { id: 'c-dis-organic', topic: T, front: 'What does chlorine form with organics and phenols?', back: 'Chlorine + humic / fulvic acids gives chlorinated hydrocarbons (carcinogenic, THMs); chlorine + phenolic compounds gives objectionable odour (chlorophenols). Adding ammonia prevents this.', src: 'TA T10 p10' },
  { id: 'c-dis-thm', topic: T, front: 'What are THMs and why are they a concern?', back: 'Trihalomethanes (chloroform, bromodichloromethane …) formed when chlorine reacts with natural organic matter (precursors such as humic acid, bromide). They are suspected carcinogens; BD limit for chloroform 0.09 mg/L (WHO 0.3).', seen: ['2008-09', '2011-12', '2012-13', '2015-16'], src: 'TA T10 p5; CE19 table' },
  { id: 'c-dis-uv', topic: T, front: 'UV disinfection: pros and cons?', back: 'No known DBPs and effective on bacteria, viruses and cysts; but gives no residual, needs clear water (turbidity shields), and requires electric power and lamp maintenance.', src: 'TA T10 p5 + textbook' },
  { id: 'c-dis-ozone', topic: T, front: 'Ozone and chlorine dioxide as disinfectants?', back: 'Both strong, oxidise organics without THMs or HAAs. Drawbacks: ClO₂ and chlorite are toxic; ozone forms bromate / brominated DBPs if bromide is present, and gives no lasting residual.', src: 'TA T10 p5' },
  { id: 'c-dis-order', topic: T, front: 'Where in the plant is disinfection and why last?', back: 'After filtration, because it works best on clear water and gives a residual in the distribution system; storage then gives contact time and peak-demand volume.', src: 'TA T03 p9–10; Notes-S p7' },
  { id: 'c-dis-pre-post', topic: T, front: 'Pre-chlorination vs post-chlorination?', back: 'Pre: chlorine added at the intake or before coagulation; helps coagulation, controls algae, oxidises Fe, Mn, but raises THM formation. Post: applied after filtration for final disinfection and the residual in the distribution system.', seen: ['2007-08'], src: 'textbook (Garg, Peavy)' },
  { id: 'c-dis-demand', topic: T, front: 'What is chlorine demand?', back: 'Dose applied minus residual remaining after the contact time: the chlorine consumed by reducing compounds, ammonia and organics.', src: 'TA T10 p10' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-dis-mech',
    topic: T,
    q: 'Explain briefly, with diagram, the three disinfection mechanisms (hypotheses) using chemical oxidants.',
    seen: ['2007-08', '2008-09', '2009-10', '2010-11', '2012-13', '2016-17'],
    a: `### How a chemical oxidant (chlorine) kills a cell
Chlorine reaches the cell as hypochlorous acid HOCl (neutral, small molecule that penetrates the cell). Three hypotheses explain the kill:
1. **Damage to the cell wall**: the oxidant attacks and oxidises the cell wall (high concentration), so the cell loses its shape and is destroyed.
2. **Alteration of cell permeability**: the cytoplasmic membrane is damaged, selective permeability is lost, nutrients and vital contents leak out and the cell dies.
3. **Alteration of the colloidal nature of the protoplasm** (inactivation of enzymes): at low concentration HOCl penetrates the cell and reacts with **enzymes and protoplasm**, stopping metabolism. Some texts add damage to nucleic acids (DNA, RNA).
Which operates depends on the dose; chlorine penetrates the cell wall and acts internally at low concentration. HOCl is far more effective than OCl⁻.`,
    keys: ['Damage to the cell wall', 'cell permeability', 'colloidal nature of the protoplasm', 'enzymes', 'HOCl', 'penetrates'],
    lists: ['l-dis-mech'],
    src: 'TA T10 p4; textbook for the three-way split',
    Fig: CellFig,
  },
  {
    id: 'a-dis-pre-post',
    topic: T,
    q: 'How does the post-chlorination process differ from pre-chlorination?',
    seen: ['2007-08'],
    a: `### Pre- vs post-chlorination
| | **Pre-chlorination** | **Post-chlorination** |
|---|---|---|
| Point of application | at the intake or before coagulation / sedimentation | after filtration, before storage and distribution |
| Purpose | control algae and slime in basins, aid coagulation, oxidise Fe, Mn, H₂S, taste and odour | final **disinfection** and a **residual** in the distribution system |
| Water | raw, turbid, high organic matter: large chlorine demand | clear, low demand |
| Dose / by-products | high dose, **THM** formation | low dose, fewer DBPs |
| Contact | long contact through the plant | contact tank / clear well 30 min |
Post-chlorination is the normal minimum; pre-chlorination is avoided where THM precursors are high.`,
    keys: ['intake', 'after filtration', 'residual', 'THM', 'final'],
    src: 'textbook (Peavy 6-9); not in the CE22 slides',
  },
  {
    id: 'a-dis-bp',
    topic: T,
    q: 'Explain the breakpoint chlorination curve. What are the advantages of breakpoint chlorination?',
    seen: ['2008-09', '2011-12', '2015-16'],
    a: `### Breakpoint curve (residual against dose)
1. **Zone 1**: reducing compounds (Fe²⁺, Mn²⁺, H₂S, organics) **destroy** the chlorine; residual about zero.
2. **Zone 2**: chlorine reacts with ammonia: $NH_3+HOCl\\rightarrow NH_2Cl+H_2O$, $NH_2Cl+HOCl\\rightarrow NHCl_2$, $NHCl_2+HOCl\\rightarrow NCl_3$; **chloramines and chloro-organics** form, the combined residual rises to a peak.
3. **Zone 3**: more chlorine **destroys** chloramines and chloro-organics; residual **falls to the breakpoint**.
4. **Zone 4**: beyond the breakpoint all demand is satisfied and the **free chlorine residual** rises with the dose.

### Advantages
1. Destroys taste- and odour-producing compounds (chloramines, phenols, organics).
2. Oxidises Fe, Mn, H₂S and colour; removes ammonia.
3. Gives **free** chlorine residual (HOCl): rapid, positive kill of pathogens, also resistant ones.
4. Assures complete satisfaction of chlorine demand and a stable residual against re-growth.
5. Care: the free chlorine reacts with organics to form THMs.`,
    keys: ['Zone 1', 'chloramines', 'breakpoint', 'free chlorine residual', 'taste', 'odour', 'residual', 'THM'],
    lists: ['l-dis-bp-zones', 'l-dis-bp-adv', 'l-dis-chloramine-rx'],
    src: 'TA T10 p10–11 + textbook',
    Fig: BreakpointFig,
  },
  {
    id: 'a-dis-thm',
    topic: T,
    q: 'How can the formation of trihalomethanes (THMs) be controlled in a chlorination process?',
    seen: ['2008-09', '2011-12', '2012-13', '2015-16'],
    a: `### THMs
Chlorine + natural organic matter (humic and fulvic acids, colour; bromide) → **THMs** (chloroform …), haloacetic acids: carcinogenic.

### Control
1. **Remove the precursors first**: improve coagulation, sedimentation and filtration; adsorb organics with **activated carbon**; aeration for volatile organics.
2. **Move the point of chlorination**: avoid pre-chlorination, apply chlorine **after filtration** when organics are low.
3. **Use an alternative disinfectant**: **ozone, chlorine dioxide or UV** give no THMs or HAAs (watch ClO₂ / chlorite toxicity and bromate); **chloramine** (add ammonia) reacts very little with organics and phenols.
4. Lower the chlorine **dose and contact time**; keep pH in 6.5–7.5; use breakpoint with a minimum free residual.
5. Remove THMs after formation by GAC or air stripping (less effective).`,
    keys: ['precursors', 'activated carbon', 'after filtration', 'ozone', 'chlorine dioxide', 'chloramine', 'ammonia', 'dose'],
    lists: ['l-dis-thm', 'l-dis-dbp'],
    src: 'TA T10 p5, p11 + textbook (Peavy 6-9)',
  },
  {
    id: 'a-dis-dbp',
    topic: T,
    q: 'Write a short note on disinfection by-products (DBPs).',
    seen: ['2017-18'],
    a: `### Disinfection by-products
1. **Chlorine** reacts with natural organic matter (NOM) to form carcinogenic by-products: **trihalomethanes (THMs)**, haloacetic acids (HAAs), haloacetonitriles, haloketones, haloaldehydes, chloropicrin, cyanogen chloride, chlorophenols.
2. **Chloramines** react with NOM to form by-products at **lower concentrations**.
3. **Chlorine dioxide and ozone** oxidise organics without producing THMs or HAAs, but ClO₂ and its chlorite ion are **toxic**, and if bromide is present, ozonation forms hypobromite then **brominated by-products** (bromate).
4. **No known DBPs** result from **UV** radiation.
Control: remove precursors before disinfection, optimise dose and point of application, or change the disinfectant, while never compromising microbial safety.`,
    keys: ['trihalomethanes', 'haloacetic acids', 'Chloramines', 'Chlorine dioxide', 'ozone', 'bromide', 'UV'],
    lists: ['l-dis-dbp'],
    src: 'TA T10 p5',
  },
  {
    id: 'a-dis-ideal',
    topic: T,
    q: 'What are the characteristics of an ideal disinfectant?',
    seen: ['2021-22'],
    a: `### Ideal disinfectant
1. It must **destroy the kinds and numbers of pathogens** that may enter the water within a practicable time, over the expected range of water temperature.
2. It must cope with **fluctuations in composition, concentration and condition** of the water treated.
3. It must be **neither toxic** to humans and domestic animals **nor unpalatable** or otherwise objectionable at the concentration needed.
4. Its concentration in the treated water must be determined **easily, quickly and preferably automatically**.
5. Its **cost must be reasonable**.
(Also useful: leaves a lasting residual, safe to handle and store, no harmful by-products.)`,
    keys: ['destroy the kinds and numbers of pathogens', 'fluctuations', 'neither toxic', 'unpalatable', 'automatically', 'cost'],
    lists: ['l-dis-ideal'],
    src: 'TA T10 p3',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
