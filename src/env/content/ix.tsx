// ev-ix — ion exchange: softening, demineralisation, capacity, breakthrough and regeneration (Tanvir sir T08).
// Bypass / run-length / brine numbers live in engine/ix.ts.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-ix' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const accent = 'var(--c-accent)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)
const Box = ({ x, y, w, h = 40, t, hi }: { x: number; y: number; w: number; h?: number; t: string[]; hi?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={5} fill={panel2} stroke={hi ? accent : mute} strokeWidth={hi ? 2.2 : 1.4} />
    {t.map((s, i) => (
      <text key={s} x={x + w / 2} y={y + h / 2 + 4 - (t.length - 1) * 7 + i * 14} textAnchor="middle" fontSize={11.5} fill={ink}>
        {s}
      </text>
    ))}
  </g>
)

// ---------- figures ----------
/** breakthrough (capacity) curve of an ion-exchange bed */
const BreakthroughFig: FC = () => {
  const pts = [
    [70, 60], [90, 205], [130, 222], [250, 226], [330, 218], [372, 190], [405, 120], [440, 78], [490, 64], [540, 60],
  ]
  const d = pts.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <svg viewBox="0 0 620 300" width="100%" role="img" aria-label="Breakthrough curve of an ion exchange bed">
      <defs>
        <marker id="ev-ix-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ink} />
        </marker>
      </defs>
      <line x1={60} x2={60} y1={20} y2={250} stroke={ink} markerStart="url(#ev-ix-a)" />
      <line x1={60} x2={580} y1={250} y2={250} stroke={ink} markerEnd="url(#ev-ix-a)" />
      <text x={20} y={140} fontSize={11.5} fill={ink} textAnchor="middle" transform="rotate(-90 20 140)">
        effluent hardness (residual)
      </text>
      <Tx x={320} y={282} t="volume of water treated (run length) →" />
      <line x1={60} x2={560} y1={60} y2={60} stroke={mute} strokeDasharray="5 4" />
      <Tx x={566} y={55} t="feed hardness C₀" a="start" s={11} />
      <line x1={60} x2={560} y1={165} y2={165} stroke={bad} strokeDasharray="5 4" />
      <Tx x={566} y={170} t="quality limit" a="start" c={bad} s={11} />
      <polyline points={d} fill="none" stroke={accent} strokeWidth={2.8} />
      <line x1={385} x2={385} y1={165} y2={250} stroke={mute} strokeDasharray="3 3" />
      <circle cx={385} cy={165} r={5} fill={bad} />
      <Tx x={385} y={158} t="breakthrough point" b c={bad} s={11} />
      <line x1={500} x2={500} y1={64} y2={250} stroke={mute} strokeDasharray="3 3" />
      <Tx x={500} y={264} t="exhaustion" s={11} />
      <Tx x={80} y={236} t="rinse" s={10.5} c={mute} />
      <line x1={110} x2={385} y1={238} y2={238} stroke={good} strokeWidth={2.4} markerEnd="url(#ev-ix-a)" markerStart="url(#ev-ix-a)" />
      <Tx x={248} y={254} t="useful run (operating capacity)" s={11} c={good} b />
      <Tx x={248} y={206} t="low leakage" s={11} c={mute} />
      <rect x={385} y={90} width={115} height={150} fill={accent} opacity={0.08} />
      <Tx x={443} y={112} t="exchange zone" s={11} c={mute} />
      <Tx x={443} y={126} t="moves through bed" s={10.5} c={mute} />
    </svg>
  )
}

/** two-stage demineralisation */
const DeminFig: FC = () => (
  <svg viewBox="0 0 640 250" width="100%" role="img" aria-label="Two-stage ion exchange demineralisation with regeneration">
    <defs>
      <marker id="ev-dm-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={ink} />
      </marker>
    </defs>
    <Box x={6} y={50} w={96} h={54} t={['Raw water', 'Ca²⁺ Mg²⁺ Na⁺', 'HCO₃⁻ SO₄²⁻ Cl⁻']} />
    <line x1={102} y1={77} x2={150} y2={77} stroke={ink} markerEnd="url(#ev-dm-a)" />
    <Box x={152} y={40} w={140} h={74} t={['Cation exchanger', 'strong acid, H-form', 'R-H + M⁺ → R-M + H⁺']} hi />
    <line x1={292} y1={77} x2={340} y2={77} stroke={ink} markerEnd="url(#ev-dm-a)" />
    <Tx x={316} y={66} t="H₂CO₃ H₂SO₄ HCl" s={10} c={mute} />
    <Box x={342} y={40} w={140} h={74} t={['Anion exchanger', 'strong base, OH-form', 'R-OH + A⁻ → R-A + OH⁻']} hi />
    <line x1={482} y1={77} x2={526} y2={77} stroke={ink} markerEnd="url(#ev-dm-a)" />
    <Box x={528} y={50} w={106} h={54} t={['H⁺ + OH⁻ → H₂O', '(demineralised)']} />
    <Tx x={222} y={160} t="regenerant: H₂SO₄ or HCl" s={11} />
    <Tx x={222} y={176} t="waste: CaSO₄, MgSO₄, Na₂SO₄" s={10.5} c={mute} />
    <line x1={222} y1={146} x2={222} y2={116} stroke={ink} markerEnd="url(#ev-dm-a)" />
    <Tx x={412} y={160} t="regenerant: NaOH" s={11} />
    <Tx x={412} y={176} t="waste: Na₂SO₄, Na₂CO₃, NaCl" s={10.5} c={mute} />
    <line x1={412} y1={146} x2={412} y2={116} stroke={ink} markerEnd="url(#ev-dm-a)" />
    <rect x={6} y={196} width={628} height={46} rx={6} fill="none" stroke={line} />
    <Tx x={320} y={214} t="cations removed first, then anions; the exchanged ions (H⁺, OH⁻) combine to water, so no TDS" s={11.5} />
    <Tx x={320} y={232} t="completely demineralised water is aggressive: a portion is bypassed and blended with the effluent" s={11.5} c={mute} />
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-ix-materials',
    topic: T,
    title: 'Ion-exchange materials',
    points: [
      { k: 'Synthetic resins', alt: ['resin', 'synthetic organic resins'], d: 'more effective, easily regenerated, more exchange sites' },
      { k: 'Natural zeolite', alt: ['greensand', 'sodium alumino-silicate', 'zeolite'], d: 'sodium alumino-silicate (greensand)' },
    ],
    seen: [],
    src: 'TA T08 p2',
  },
  {
    id: 'l-ix-adv',
    topic: T,
    title: 'Advantages of ion exchange over lime–soda softening',
    ask: 'State the advantages of ion exchange for softening compared with lime–soda softening.',
    points: [
      { k: 'No large quantities of sludge', alt: ['avoids sludge generation', 'no sludge'] },
      { k: 'Smaller and simpler apparatus', alt: ['physical-mechanical apparatus smaller', 'simple to operate', 'compact'] },
      { k: 'Can produce near zero hardness', alt: ['zero hardness', 'complete softening'], d: 'a portion is bypassed to reach the target' },
    ],
    seen: ['2020-21'],
    src: 'TA T08 p3',
  },
  {
    id: 'l-ix-disadv',
    topic: T,
    title: 'Disadvantages of ion exchange softening',
    points: [
      { k: 'Water must be free of turbidity and organics', alt: ['free from turbidity', 'free from organic content', 'fouling by turbidity'] },
      { k: 'Fe and Mn precipitates foul the resin', alt: ['iron and manganese fouling', 'Fe/Mn fouling'] },
      { k: 'No net decrease in TDS', alt: ['TDS not reduced'], d: 'Ca²⁺ is replaced by 2Na⁺' },
      { k: 'Brine regeneration waste disposal', alt: ['regenerant waste', 'salt cost'] },
    ],
    seen: ['2020-21'],
    src: 'TA T08 p3, p7 + textbook',
  },
  {
    id: 'l-ix-demin',
    topic: T,
    title: 'Key points of demineralisation by ion exchange',
    points: [
      { k: 'Softening gives no net decrease in TDS', alt: ['no net decrease in TDS'] },
      { k: 'Exchange H⁺ for cations and OH⁻ for anions', alt: ['hydrogen for cations hydroxide for anions', 'H and OH exchange'], d: 'H⁺ + OH⁻ → H₂O, no residual, pH not affected' },
      { k: 'Two steps: cations first, then anions', alt: ['cation exchanger then anion exchanger', 'two stage'] },
      { k: 'Bypass and blend part of the water', alt: ['blending', 'bypass'], d: 'completely demineralised water is aggressive' },
    ],
    seen: ['2017-18', '2021-22'],
    src: 'TA T08 p7',
  },
  {
    id: 'l-ix-regenerants',
    topic: T,
    title: 'Regenerants in demineralisation',
    points: [
      { k: 'Strong acid (H₂SO₄ or HCl) for cation exchanger', alt: ['H2SO4', 'HCl', 'acid'] },
      { k: 'NaOH for anion exchanger', alt: ['caustic soda', 'sodium hydroxide'] },
      { k: 'NaCl brine for softening resin', alt: ['brine', 'salt', 'NaCl'] },
    ],
    seen: ['2017-18'],
    src: 'TA T08 p6–8',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-ix-def', topic: T, front: 'What is ion exchange and where does the reaction take place?', back: 'Dissolved ions are swapped for ions held on a solid; reaction occurs at the solid interface and the solid does not itself enter the reaction. Water is forced under pressure through an enclosed bed. Used for softening and demineralisation.', src: 'TA T08 p2' },
  { id: 'c-ix-soft-rx', topic: T, front: 'Softening reaction by ion exchange?', back: '2R-Na⁺ + Ca²⁺ ⇌ R₂-Ca²⁺ + 2Na⁺ (also Mg²⁺). Each Ca²⁺ displaces two Na⁺, so hardness is exchanged for sodium and TDS is not reduced.', src: 'TA T08 p4' },
  { id: 'c-ix-regen', topic: T, front: 'How is a softening resin regenerated?', back: 'Strong brine (NaCl, high Na⁺) reverses the reaction: R-Ca + 2Na⁺ → 2R-Na + Ca²⁺; the Ca/Mg leave in the waste. A strong brine means a small waste volume.', seen: ['2017-18'], src: 'TA T08 p6; Notes-S p18' },
  { id: 'c-ix-place', topic: T, front: 'Where is ion exchange placed in a treatment train?', back: 'For ground water, before aeration (Fe/Mn would otherwise precipitate and foul the resin). For surface water, after all necessary treatment but before chlorination (chlorine damages resin).', src: 'TA T08 p3' },
  { id: 'c-ix-cap', topic: T, front: 'What is exchange capacity (units)?', back: 'Hardness a unit volume of resin removes before exhaustion, in kg as CaCO₃ per m³ of resin (e.g. 57, 90, 95 kg/m³).', src: 'TA T08 p9' },
  { id: 'c-ix-bypass', topic: T, front: 'Bypass fraction in IE softening and the run length?', back: 'Resin gives zero hardness, so bypass fraction = desired hardness / raw hardness. Run length = (resin volume × capacity) / (hardness load of the treated flow).', src: 'Math §12' },
  { id: 'c-ix-break', topic: T, front: 'What is breakthrough in an IE bed?', back: 'The point when the effluent hardness first rises above the quality limit because the exchange zone has reached the bottom of the bed. Run is stopped and the bed regenerated; later the effluent reaches the feed hardness (exhaustion).', seen: ['Jan 2021'], src: 'TA T08 p5' },
  { id: 'c-ix-continuous', topic: T, front: 'How is continuous operation achieved with fixed beds?', back: 'Use two or more beds (or moving beds): while one is regenerated (backwash, brine, rinse) the other runs. Single units suit household softeners where flow can be interrupted.', src: 'TA T08 p2; Math §12' },
  { id: 'c-ix-brinevol', topic: T, front: 'Regeneration of 150 kg NaCl per m³ resin at 10 % solution means?', back: '150/0.10 = 1500 kg of brine, about 1.5 m³ of brine per m³ of resin (density about 1).', src: 'Math §12' },
  { id: 'c-ix-demin-rx', topic: T, front: 'Cation and anion exchange reactions in demineralisation?', back: 'Cation (H-form, strong acid): R-H + Na⁺ → R-Na + H⁺. Anion (OH-form, strong base): R-OH + Cl⁻ → R-Cl + OH⁻. H⁺ + OH⁻ → H₂O.', src: 'TA T08 p7–8' },
  { id: 'c-ix-aggressive', topic: T, front: 'Why is completely demineralised water blended?', back: 'It has no minerals or alkalinity, so it is highly aggressive (corrosive, tends to dissolve everything), and tastes flat; a portion of raw water is bypassed and mixed with the product.', src: 'TA T08 p7; Notes-S p2' },
  { id: 'c-ix-ix-vs-ac', topic: T, front: 'Ion exchange vs activated carbon in one line?', back: 'Ion exchange removes charged ions by stoichiometric exchange with a resin (hardness, demineralisation); activated carbon adsorbs mainly non-polar organics by surface adsorption (taste, odour, micropollutants).', seen: ['2012-13', '2016-17'], src: 'TA T08, T12' },
  { id: 'c-ix-leak', topic: T, front: 'What is leakage and how is it reduced?', back: 'Small amount of hardness passing the bed before breakthrough, because the reaction is reversible. Reduced by deeper beds, higher regenerant level and lower flow rate.', src: 'TA T08 p5 + textbook' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-ix-softening',
    topic: T,
    q: 'Write a short note on ion exchange for softening.',
    seen: ['Jan 2021'],
    a: `### Ion exchange softening
1. **Principle**: hardness ions Ca²⁺, Mg²⁺ are exchanged for Na⁺ held on a **synthetic resin** (or natural zeolite / greensand).
2. **Reactions**: $2R\\text{-}Na^+ + Ca^{2+} \\rightleftharpoons R_2\\text{-}Ca^{2+} + 2Na^+$; $2R\\text{-}Na^+ + Mg^{2+} \\rightleftharpoons R_2\\text{-}Mg^{2+} + 2Na^+$ (also with CaCl₂, CaSO₄, Ca(HCO₃)₂).
3. **Practice**: water is passed under pressure through an enclosed bed. Single bed for household use; two or more beds (or moving bed) for continuous flow. Part of the water **bypasses** the bed and is blended to give the target hardness (bypass = H_desired/H_raw).
4. **Regeneration**: when exhausted, strong **brine (NaCl)** reverses the reaction (high Na⁺): $R_2\\text{-}Ca + 2Na^+ \\rightarrow 2R\\text{-}Na + Ca^{2+}$; the strong brine makes the waste volume small; then rinse.
5. **Advantages**: no sludge, small simple plant. **Disadvantages**: water must be free of turbidity and organics, Fe/Mn foul the resin, no TDS reduction.
6. **Position**: ground water before aeration; surface water after treatment, before chlorination.`,
    keys: ['synthetic resin', 'Na⁺', 'bypass', 'brine', 'regeneration', 'sludge', 'before aeration'],
    lists: ['l-ix-materials', 'l-ix-adv', 'l-ix-disadv'],
    src: 'TA T08 p2–6, p9',
  },
  {
    id: 'a-ix-breakthrough',
    topic: T,
    q: 'Write a short note on the breakthrough curve (ion exchange / adsorption).',
    seen: ['Jan 2021'],
    a: `### Breakthrough curve
Plot of **effluent concentration (residual hardness)** against **volume of water treated** (run length).
1. At first, the fresh resin gives a **very low residual** (small leakage after the initial rinse-down).
2. The **exchange zone** (zone where the exchange is taking place) moves down the bed as the resin at the top is exhausted (Na-form to Ca-form).
3. When the zone reaches the bottom, the effluent hardness starts to rise: the **breakthrough point** (the quality limit is reached). The run length up to here is the **operating capacity**.
4. The curve then rises steeply to the feed value C₀: **exhaustion** (the bed has no capacity left).
5. The run is stopped at breakthrough and the bed is **regenerated** (brine); the same curve applies to activated carbon (mass-transfer zone).
Sharp curve means an efficient bed; a flat curve means wasted capacity.`,
    keys: ['effluent', 'volume of water treated', 'leakage', 'exchange zone', 'breakthrough point', 'exhaustion', 'regenerated'],
    lists: ['l-ix-materials'],
    src: 'TA T08 p5; TA T12 p8',
    Fig: BreakthroughFig,
  },
  {
    id: 'a-ix-demin',
    topic: T,
    q: 'Explain the process of ion exchange for demineralisation (with diagram). How is the ion-exchange media regenerated?',
    seen: ['2017-18', '2021-22'],
    a: `### Demineralisation by ion exchange
1. In softening Ca²⁺ is swapped for 2Na⁺, so there is **no net decrease in TDS**. In demineralisation the exchanged ions must not add to TDS: **H⁺ is exchanged for every cation and OH⁻ for every anion**; H⁺ + OH⁻ → H₂O, leaving no residual and not affecting the pH.
2. **Two steps, cations first**: (a) hydrogen-cycle **strong-acid cation exchanger**: $R\\text{-}H + Na^+ \\rightarrow R\\text{-}Na + H^+$; the effluent contains H₂CO₃, H₂SO₄, HCl, HNO₃. (b) hydroxide-cycle **strong-base anion exchanger**: $R\\text{-}OH + Cl^- \\rightarrow R\\text{-}Cl + OH^-$; the effluent is H₂O.
3. Completely demineralised water is aggressive, so a portion of raw water is **bypassed and blended**.
4. **Regeneration**: cation exchanger with **H₂SO₄ or HCl**: $R(Ca,Mg,Na_2)+H_2SO_4 \\rightleftharpoons RH_2 + (Ca,Mg,Na_2)SO_4$ (waste CaSO₄, MgSO₄, Na₂SO₄); anion exchanger with **NaOH**: $R(SO_4,Cl,CO_3)+NaOH \\rightleftharpoons R\\cdot OH+(Na_2SO_4,NaCl,Na_2CO_3)$. A rinse follows each.
5. A softening resin is regenerated with strong **NaCl brine** (high Na⁺ drives the reaction backwards, small waste volume).`,
    keys: ['no net decrease in TDS', 'H⁺', 'OH⁻', 'cation exchanger', 'anion exchanger', 'bypassed and blended', 'H₂SO₄ or HCl', 'NaOH', 'brine'],
    lists: ['l-ix-demin', 'l-ix-regenerants'],
    src: 'TA T08 p6–8',
    Fig: DeminFig,
  },
  {
    id: 'a-ix-vs-lime',
    topic: T,
    q: 'State the advantages and disadvantages of ion exchange for softening compared with lime–soda softening.',
    seen: ['2020-21'],
    a: `### Ion exchange vs lime–soda softening
| | **Ion exchange** | **Lime-soda** |
|---|---|---|
| Sludge | **none / avoids large quantities of sludge** | large quantity of CaCO₃ and Mg(OH)₂ sludge |
| Plant | **physical-mechanical apparatus much smaller and simpler** to operate | large basins, chemical feed, recarbonation |
| Hardness produced | near zero (blended), no pH rise | limited by solubility (Ca 30, Mg 10) and needs recarbonation |
| Raw water | **must be free of turbidity and organics**; Fe and Mn foul the surface | tolerates turbid water, also removes Fe, Mn, As, turbidity, pathogens |
| TDS | no net decrease (Na⁺ added) | TDS reduced |
| Regeneration | brine waste disposal, salt cost | none, but sludge disposal |
| Suitable scale | household, small | large plants |`,
    keys: ['sludge', 'smaller and simpler', 'free of turbidity and organics', 'Fe and Mn foul', 'no net decrease'],
    lists: ['l-ix-adv', 'l-ix-disadv'],
    src: 'TA T08 p3; TA T07 p3',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
