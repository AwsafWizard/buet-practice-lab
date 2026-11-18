// ev-att — advanced treatment: membranes (RO, ED) and adsorption on activated carbon (Tanvir sir T11–T12).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-att' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const accent = 'var(--c-accent)'
const accent2 = 'var(--c-accent2)'
const water = 'var(--c-water)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

// ---------- figures ----------
/** RO (pressure-driven) and ED (voltage-driven) schematics */
const RoEdFig: FC = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Reverse osmosis compared with electrodialysis">
    <defs>
      <marker id="ev-ro-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={ink} />
      </marker>
    </defs>
    <Tx x={150} y={18} t="Reverse osmosis (pressure)" b />
    <rect x={20} y={90} width={60} height={70} rx={4} fill={water} opacity={0.3} stroke={mute} />
    <Tx x={50} y={128} t="feed" s={11} />
    <rect x={92} y={104} width={40} height={42} rx={4} fill={panel2} stroke={ink} />
    <Tx x={112} y={129} t="pump" s={10.5} />
    <path d="M80,125 H92" stroke={ink} markerEnd="url(#ev-ro-a)" />
    <path d="M132,125 H168" stroke={ink} markerEnd="url(#ev-ro-a)" />
    <Tx x={150} y={112} t="high p" s={10.5} c={mute} />
    <rect x={168} y={70} width={14} height={110} fill={accent} opacity={0.5} stroke={ink} />
    <Tx x={175} y={64} t="semipermeable membrane" s={10.5} />
    <path d="M182,100 H250" stroke={ink} markerEnd="url(#ev-ro-a)" />
    <Tx x={250} y={90} t="permeate (water)" a="end" s={11} />
    <path d="M150,170 V220" stroke={ink} markerEnd="url(#ev-ro-a)" />
    <Tx x={150} y={236} t="brine / concentrate" s={11} />
    <Tx x={150} y={258} t="pressure above osmotic pressure drives water" s={10.5} c={mute} />
    <Tx x={150} y={272} t="300–400 psi brackish, 800–1000 psi sea" s={10.5} c={mute} />
    <Tx x={470} y={18} t="Electrodialysis (electric field)" b />
    <rect x={340} y={50} width={260} height={150} fill="none" stroke={mute} />
    <rect x={340} y={50} width={14} height={150} fill={accent2} opacity={0.4} />
    <rect x={586} y={50} width={14} height={150} fill={accent} opacity={0.4} />
    <Tx x={347} y={44} t="anode (+)" s={10.5} />
    <Tx x={593} y={44} t="cathode (−)" s={10.5} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <line x1={400 + i * 70} x2={400 + i * 70} y1={50} y2={200} stroke={i % 2 ? ink : accent} strokeWidth={4} />
        <Tx x={400 + i * 70} y={214} t={i % 2 ? 'A' : 'C'} s={11} b />
      </g>
    ))}
    <Tx x={470} y={236} t="C = cation membrane (passes Na⁺ to the cathode)" s={11} />
    <Tx x={470} y={252} t="A = anion membrane (passes Cl⁻ to the anode)" s={11} />
    <Tx x={470} y={274} t="alternate cells: dilute product and concentrated brine" s={10.5} c={mute} />
    <Tx x={470} y={120} t="ions move, water stays" s={11} c={mute} />
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-att-desal',
    topic: T,
    title: 'Methods of desalination',
    ask: 'Mention the different methods of desalination.',
    points: [
      { k: 'Reverse osmosis', alt: ['RO'] },
      { k: 'Electrodialysis', alt: ['ED'] },
      { k: 'Distillation', alt: ['multi-stage flash', 'multiple effect', 'solar distillation', 'evaporation'] },
      { k: 'Freezing', alt: ['crystallisation', 'freeze desalination'] },
      { k: 'Ion exchange', alt: ['ion exchange demineralisation'] },
    ],
    seen: ['2009-10', '2010-11'],
    src: 'TA T11 (RO, ED), T08 (ion exchange); distillation and freezing from textbook (Peavy 6-14)',
    note: 'T11 covers only RO and ED. The other methods are the textbook list.',
  },
  {
    id: 'l-att-desal-lim',
    topic: T,
    title: 'Limitations of desalination methods',
    points: [
      { k: 'High energy and operating cost', alt: ['expensive', 'energy intensive', 'high cost'] },
      { k: 'Brine (concentrate) disposal', alt: ['concentrate disposal', 'waste brine'] },
      { k: 'Pretreatment against fouling and scaling', alt: ['membrane fouling', 'scaling', 'pretreatment needed'] },
      { k: 'Chlorine and oxidant damage to membranes', alt: ['polyamide degraded by chlorine'], d: 'polyamide membranes' },
      { k: 'Product water is aggressive', alt: ['corrosive product', 'needs re-mineralisation'] },
      { k: 'Skilled operation and maintenance', alt: ['skilled operators'] },
    ],
    seen: ['2010-11'],
    src: 'TA T11 p7 + Notes-S p2; textbook',
  },
  {
    id: 'l-att-ro-apps',
    topic: T,
    title: 'Typical applications of reverse osmosis',
    ask: 'What are the typical applications of reverse osmosis?',
    points: [
      { k: 'Desalination of brackish water', alt: ['brackish water desalination', 'TDS < 10000'], d: 'to provide potable water' },
      { k: 'Pretreatment before ion-exchange deionisation', alt: ['boiler feed', 'ultrapure water'], d: 'municipal water TDS 500–1000 mg/L, for ultrapure water' },
      { k: 'Recovery of valuable materials from waste', alt: ['recovery of reusable materials', 'RO reject stream'] },
      { k: 'Reduction in volume of waste', alt: ['waste volume reduction'] },
      { k: 'Water conservation or recovery', alt: ['cooling tower blowdown', 'water reuse'] },
    ],
    seen: ['2017-18'],
    src: 'TA T11 p4',
  },
  {
    id: 'l-att-membrane-config',
    topic: T,
    title: 'Membrane configurations',
    points: [
      { k: 'Spiral wound membrane', alt: ['spiral wound'] },
      { k: 'Tubular membrane', alt: ['tubular'] },
      { k: 'Hollow fine fibre module', alt: ['hollow fibre', 'hollow fiber'] },
      { k: 'Plate and frame membrane', alt: ['plate and frame'] },
    ],
    seen: [],
    src: 'TA T11 p5',
  },
  {
    id: 'l-att-membrane-ideal',
    topic: T,
    title: 'Properties of an ideal membrane',
    points: [
      { k: 'Thin and imperfection-free', alt: ['thin'] },
      { k: 'Water passes with little hindrance', alt: ['high water flux'] },
      { k: 'Impermeable to ions', alt: ['rejects salts', 'high rejection'] },
      { k: 'Withstands pressure', alt: ['capable of withstanding pressure', 'mechanically strong'] },
    ],
    seen: [],
    src: 'TA T11 p7',
  },
  {
    id: 'l-att-ac-adv',
    topic: T,
    title: 'Advantages (applications) of activated carbon filtration',
    ask: 'What are the advantages of activated carbon filtration in water treatment?',
    points: [
      { k: 'Removes taste and odour', alt: ['taste and odor control', 'odour removal'] },
      { k: 'Removes dissolved organics and micropollutants', alt: ['pesticides', 'synthetic organics', 'VOC', 'organic removal'] },
      { k: 'Removes colour', alt: ['colour removal'] },
      { k: 'Removes THM precursors and chlorine', alt: ['dechlorination', 'THMs'] },
      { k: 'Carbon can be regenerated', alt: ['regenerable', 'reusable'], d: 'GAC reactivated in a furnace' },
      { k: 'Huge surface area 500–1500 m²/g', alt: ['large surface area', 'porous'] },
    ],
    seen: ['2008-09', '2015-16'],
    src: 'TA T12 p7–8 + textbook (Davis 6-12)',
  },
  {
    id: 'l-att-mech',
    topic: T,
    title: 'Mechanisms of adsorption',
    ask: 'Briefly explain the mechanisms of the adsorption process.',
    points: [
      { k: 'Physical adsorption', alt: ['physisorption', 'van der Waals'] },
      { k: 'Chemisorption', alt: ['chemical adsorption', 'chemical bonding'] },
      { k: 'Adsorption of electrolytes', alt: ['electrostatic adsorption', 'ion exchange adsorption'] },
    ],
    seen: ['2023-24', '2022-23'],
    src: 'TA T12 p5–6',
  },
  {
    id: 'l-att-kinetics',
    topic: T,
    title: 'Steps of adsorption on a carbon particle',
    ordered: true,
    points: [
      { k: 'Bulk transport to the boundary layer', alt: ['bulk transport'] },
      { k: 'Transport across the boundary layer', alt: ['film transport', 'boundary layer diffusion'] },
      { k: 'Pore and surface diffusion, then adsorption', alt: ['diffusion into pores', 'intraparticle diffusion'] },
    ],
    seen: [],
    src: 'TA T12 p4',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-att-ro', topic: T, front: 'What is reverse osmosis?', back: 'Hydrostatic pressure greater than the osmotic pressure drives feed water through a semipermeable membrane against the natural flow, leaving most impurities behind in the brine. 300–400 psi for brackish water, 800–1000 psi for sea water.', src: 'TA T11 p2–3' },
  { id: 'c-att-osmotic', topic: T, front: 'Osmosis, osmotic pressure, reverse osmosis?', back: 'Osmosis: water flows through a membrane from low to high salt concentration. Osmotic pressure: the pressure that stops the flow (equilibrium). Reverse osmosis: apply more than that pressure and the flow reverses.', src: 'TA T11 p3' },
  { id: 'c-att-ro-ed', topic: T, front: 'RO vs electrodialysis in one line?', back: 'RO: pressure forces water through a semipermeable membrane, ions stay behind (water moves). ED: an electric field pulls ions through alternate cation / anion selective membranes (ions move, water stays).', seen: ['2007-08', '2008-09', '2011-12', '2012-13', '2016-17', '2017-18', 'Jan 2021', '2020-21'], src: 'TA T11 p2, p8' },
  { id: 'c-att-ed', topic: T, front: 'How does electrodialysis work?', back: 'Electric energy transfers ionised salts through selective membranes. Cation- and anion-selective membranes alternate to form a stack; dilute (product) and concentrated cells alternate between them.', src: 'TA T11 p8–9' },
  { id: 'c-att-brackish', topic: T, front: 'What is brackish water?', back: 'Water with high TDS but below sea water (RO slide: TDS < 10,000 mg/L). RO is applied to brackish water to give potable water.', src: 'TA T11 p4; Notes-S p22' },
  { id: 'c-att-ca-pa', topic: T, front: 'Cellulose acetate vs polyamide membranes?', back: 'CA: cheaper, tolerates Cl₂, but is attacked biologically. Polyamide: degraded by Cl₂ and oxidants, not attacked biologically, no hydrolysis, best at pH 4–11, longer life (3–5 years).', src: 'TA T11 p7' },
  { id: 'c-att-test-ro', topic: T, front: 'Why test RO water before distribution?', back: 'Distilled-type water has almost no TDS, is slightly acidic and highly reactive: it tries to dissolve everything (corrosive), so it must be stabilised or blended.', src: 'Notes-S p2' },
  { id: 'c-att-uf', topic: T, front: 'Other pressure membranes (MF, UF, NF)?', back: 'Microfiltration (0.1–10 µm, bacteria, turbidity), ultrafiltration (0.01–0.1 µm, viruses, colloids), nanofiltration (about 0.001 µm, softening, organics), RO (ions). Not covered in the CE22 slides.', src: 'textbook (Davis 6-13)' },
  { id: 'c-att-def', topic: T, front: 'Define adsorption, adsorbate, adsorbent. Adsorption vs absorption?', back: 'Adsorption: a substance accumulates at the interface of two phases. Adsorbate: the substance removed; adsorbent: the solid (activated carbon). Absorption: uniform distribution throughout the bulk.', src: 'TA T12 p2–3' },
  { id: 'c-att-ac-make', topic: T, front: 'How is activated carbon made?', back: 'Carbonaceous material (wood, coal, coconut shell) is roasted in the absence of air to a char, then oxidised (activated) at higher temperature with steam or CO₂ to create a very porous structure of 500–1500 m²/g.', seen: ['2022-23'], src: 'TA T12 p7' },
  { id: 'c-att-gac-pac', topic: T, front: 'GAC vs PAC sizes and use?', back: 'GAC: grains 0.1–2 mm in fixed or moving beds (contactors); regenerated in a furnace. PAC: powder added to water in open vessels for a contact time and removed by settling/filtration; not regenerated easily.', seen: ['2016-17', '2022-23'], src: 'TA T12 p7–9' },
  { id: 'c-att-phys-chem', topic: T, front: 'Physical adsorption vs chemisorption?', back: 'Physical: weak forces (van der Waals, dipole, H-bond, hydrophobic), multilayer, reversible, mobile, not site specific. Chemisorption: chemical (electrostatic/covalent) bond, monolayer, specific sites, may be irreversible.', seen: ['2022-23'], src: 'TA T12 p5' },
  { id: 'c-att-ac-prop', topic: T, front: 'Which properties matter for PAC and GAC?', back: 'PAC: filterability (product contamination) and bulk density (removal capacity). GAC: hardness (attrition losses in runs and backwash) and particle size (bulk transport, head loss).', src: 'TA T12 p7' },
  { id: 'c-att-gac-breakthrough', topic: T, front: 'Mass-transfer zone and breakthrough in a GAC bed?', back: 'The zone where adsorption occurs moves down the bed; effluent stays low until the zone reaches the bottom (breakthrough), then climbs to the feed concentration (exhaustion).', src: 'TA T12 p8' },
  { id: 'c-att-pac-use', topic: T, front: 'When is PAC chosen over GAC?', back: 'For seasonal or occasional taste and odour problems or spills: low capital cost, dose as needed. GAC suits continuous organics removal and can be regenerated.', src: 'textbook (Davis 6-12)' },
  { id: 'c-att-sw-train', topic: T, front: 'Where is adsorption in the surface-water treatment train?', back: 'After filtration if dissolved organics are present: activated-carbon columns or PAC dosed in an operation similar to coagulation; before disinfection.', src: 'TA T03 p10' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-att-ro-ed',
    topic: T,
    q: 'How does the desalination mechanism through reverse osmosis differ from that through electrodialysis?',
    seen: ['2007-08', '2008-09', '2011-12', '2012-13', '2016-17', '2017-18', 'Jan 2021', '2020-21'],
    a: `### RO vs ED
| | **Reverse osmosis** | **Electrodialysis** |
|---|---|---|
| Driving force | **hydrostatic pressure** above the osmotic pressure (300–400 psi brackish; 800–1000 psi sea water) | **electric potential** (DC voltage) |
| What moves | **water** is forced through a semipermeable membrane; salts and impurities are left behind | **ions** are pulled through **selective membranes**; water stays |
| Membranes | one type, semipermeable (cellulose acetate or polyamide) | alternating cation- and anion-selective membranes in a stack between electrodes |
| Products | permeate (low salt) and brine (concentrate) | dilute product and concentrated cells |
| Removes | dissolved salts, also organics, bacteria, viruses (non-ionic substances too) | only **ionised** salts, no non-ionic matter (organics, bacteria) |
| Suitable | brackish and sea water, ultrapure water | brackish water |
| Energy | pump pressure | electric current, increases with salt |
| Problems | fouling, scaling, chlorine damage | scaling, electrode and membrane maintenance |`,
    keys: ['hydrostatic pressure', 'semipermeable membrane', 'electric', 'selective membranes', 'water', 'ions', 'brine', 'osmotic pressure'],
    lists: ['l-att-ro-apps', 'l-att-membrane-config'],
    src: 'TA T11 p2–9',
    Fig: RoEdFig,
  },
  {
    id: 'a-att-ro-apps',
    topic: T,
    q: 'What are the typical applications of reverse osmosis?',
    seen: ['2017-18'],
    a: `### Applications of RO
1. **Desalination of brackish water** (TDS below 10,000 mg/L) to provide potable water.
2. **Pretreatment of municipal water** (TDS 500–1000 mg/L) preceding ion-exchange deionisation to make **ultrapure water** for uses such as boiler feed.
3. **Recovery of valuable or reusable materials** from a waste through the RO reject stream.
4. **Reduction in the volume of waste** if required.
5. **Water conservation or recovery**, such as cooling-tower blowdown.
Operating pressure 300–400 psi (brackish) or 800–1000 psi (sea water); configurations: spiral wound, tubular, hollow fine fibre, plate and frame.`,
    keys: ['brackish water', 'ultrapure water', 'Recovery', 'Reduction in the volume of waste', 'cooling-tower blowdown', 'ion-exchange'],
    lists: ['l-att-ro-apps'],
    src: 'TA T11 p4',
  },
  {
    id: 'a-att-desal',
    topic: T,
    q: 'What are the alternative methods of desalination of water and what are their limitations?',
    seen: ['2009-10', '2010-11'],
    a: `### Desalination methods
1. **Reverse osmosis**: pressure drives water through a semipermeable membrane. Limits: high pump energy, fouling and scaling need pretreatment, polyamide damaged by chlorine, brine disposal.
2. **Electrodialysis**: ions move through selective membranes under DC voltage. Limits: removes only ionised matter (not organics or bacteria), economic for brackish water only, power use rises with salinity, electrode scaling.
3. **Distillation** (multi-stage flash, multiple-effect, solar still): evaporate and condense. Limits: very high energy and capital cost, corrosion and scaling of the plant, large brine volume.
4. **Freezing**: ice crystals exclude salt. Limits: difficult to separate and wash crystals, energy for refrigeration.
5. **Ion exchange**: cation then anion resins. Limits: regenerant chemicals, only for low TDS.
Common limits: **cost**, **brine disposal**, aggressive product water that must be stabilised or blended.`,
    keys: ['Reverse osmosis', 'Electrodialysis', 'Distillation', 'Freezing', 'Ion exchange', 'brine disposal', 'cost'],
    lists: ['l-att-desal', 'l-att-desal-lim'],
    src: 'TA T11 + textbook (Peavy 6-14); distillation and freezing not in the CE22 slides',
  },
  {
    id: 'a-att-ac-use',
    topic: T,
    q: 'What are the advantages / applications of activated carbon filtration in water treatment?',
    seen: ['2008-09', '2015-16'],
    a: `### Activated carbon applications and advantages
1. **Taste and odour removal**: adsorbs the organics (algal oils, phenols, H₂S products).
2. **Removal of dissolved organics**: synthetic organics, pesticides, solvents (VOC), THM precursors, hence lower THMs.
3. **Colour removal** (humic matter) and removal of residual chlorine.
4. **Enormous surface area** (500–1500 m²/g) so high capacity in a small unit.
5. **Regenerable**: GAC is reactivated in a furnace similar to its activation; PAC is cheap and flexible for seasonal problems.
6. Placed after filtration in surface-water trains (columns or PAC), before final disinfection.
Limits: does not remove salts or hardness; needs regeneration and the bed can plug with SS (backwash provided).`,
    keys: ['Taste and odour', 'organics', 'THM', 'Colour', 'surface area', 'Regenerable'],
    lists: ['l-att-ac-adv'],
    src: 'TA T12 p7–8 + textbook',
  },
  {
    id: 'a-att-prep',
    topic: T,
    q: 'How is activated carbon prepared?',
    seen: ['2022-23'],
    a: `### Preparation of activated carbon
1. A **carbonaceous raw material** (wood, coal, lignite, coconut shell) is **roasted in the absence of air** to form a **char** (carbonisation).
2. The char is then **oxidised ("activated") at a higher temperature** with steam, CO₂ or air; this burns out tars and creates a **very porous structure**.
3. Surface area of 500–1500 m²/g is reached.
4. Product is **crushed into granules** of 0.1–2 mm (**GAC**) or **pulverised into powder** (**PAC**).
5. Spent carbon is cleaned or **regenerated in a furnace** in a similar manner to the original activation.`,
    keys: ['absence of air', 'char', 'oxidised', 'porous', '500–1500 m²/g', 'GAC', 'PAC'],
    src: 'TA T12 p7',
  },
  {
    id: 'a-att-gac-pac',
    topic: T,
    q: 'What are the advantages and disadvantages of GAC and PAC? What are the advantages of GAC over PAC?',
    seen: ['2022-23', '2016-17'],
    a: `### GAC vs PAC
| | **GAC (granular, 0.1–2 mm)** | **PAC (powder)** |
|---|---|---|
| Use | fixed or moving **bed** (contactor) in a cylindrical tank; water passes through | dosed into water in an open vessel, contact time in suspension, then removed by sedimentation or filtration |
| Advantages | **regenerable** by furnace, long life; consistent quality; low head loss; high capacity; no sludge; good for continuous removal | **low capital cost**, flexible dose for seasonal taste and odour, no special contactor |
| Disadvantages | high capital cost; bed can plug with SS (needs backwash, fluidised operation); breakthrough monitoring; attrition | cannot be used in a fixed bed (high head loss); **regeneration much more difficult**; adds sludge; higher carbon use; product contamination if not filtered |
| Properties that matter | hardness (attrition) and particle size (head loss, macropores) | filterability and bulk density |

**Advantages of GAC over PAC**: regeneration and reuse, better use of capacity in a column (mass-transfer zone), no carbon carry-over, treats continuous flow, lower long-run cost.`,
    keys: ['regenerable', 'fixed or moving', 'low capital cost', 'high head loss', 'regeneration much more difficult', 'filterability', 'bulk density', 'hardness'],
    lists: ['l-att-ac-adv'],
    src: 'TA T12 p7–9',
  },
  {
    id: 'a-att-phys-chem',
    topic: T,
    q: 'Differentiate between physical adsorption and chemisorption.',
    seen: ['2022-23'],
    a: `### Physical adsorption vs chemisorption
| | **Physical adsorption** | **Chemisorption** |
|---|---|---|
| Forces | weak: dipole–dipole, hydrogen bonding, **van der Waals**, hydrophobic bonding | **chemical (electrostatic / covalent) bond** between adsorbate and adsorbent |
| Layers | **multilayers** possible | **monolayer** only |
| Sites | free to move on the surface, not site-specific | **specific to a site** |
| Reversibility | **always reversible** | can be **irreversible** |
| Bond energy | low | high |
| Water treatment | typical (fatty acids on carbon) | e.g. ROH + SOH → SOR + H₂O (metal ion on metal oxide) |`,
    keys: ['van der Waals', 'multilayers', 'monolayer', 'reversible', 'irreversible', 'specific'],
    lists: ['l-att-mech'],
    src: 'TA T12 p5',
  },
  {
    id: 'a-att-ads-mech',
    topic: T,
    q: 'Briefly explain the mechanisms of adsorption processes.',
    seen: ['2023-24'],
    a: `### Adsorption
Adsorption is the accumulation of a substance (adsorbate) at the interface of a solid adsorbent (activated carbon); the adsorbate has **less free energy** on the surface than in solution.
1. **Transport steps**: bulk transport to the boundary layer, diffusion across the boundary layer to the surface, then **pore diffusion and surface diffusion** into the pores where adsorption occurs.
2. **Physical adsorption**: dipole–dipole, van der Waals and hydrogen bonds, hydrophobic bonding; multilayer and reversible.
3. **Chemisorption**: electrostatic or covalent chemical bond; monolayer, site-specific, possibly irreversible.
4. **Adsorption of electrolytes**: ions held by electrostatic attraction; strongly dependent on **pH and ionic strength**.
Increasing bond energy: dipole–dipole < van der Waals and hydrogen bonding < covalent or electrostatic chemical bonding.`,
    keys: ['less free energy', 'pore diffusion', 'Physical adsorption', 'Chemisorption', 'electrolytes', 'pH', 'boundary layer'],
    lists: ['l-att-mech', 'l-att-kinetics'],
    src: 'TA T12 p4–6',
  },
  {
    id: 'a-att-ac-vs-ix',
    topic: T,
    q: 'How does the activated carbon adsorption process differ from the ion exchange process?',
    seen: ['2012-13', '2016-17'],
    a: `### Activated carbon adsorption vs ion exchange
| | **Activated carbon adsorption** | **Ion exchange** |
|---|---|---|
| Mechanism | accumulation of molecules on the surface (physical, some chemical), no exchange | stoichiometric **exchange of ions** between resin sites and water |
| Removes | non-polar **organics**: taste, odour, colour, pesticides, THM precursors | **ionic** species: Ca²⁺, Mg²⁺ (softening), all ions (demineralisation) |
| Medium | activated carbon (GAC / PAC) | synthetic resin or zeolite |
| Capacity | surface area 500–1500 m²/g | exchange capacity kg CaCO₃ per m³ resin |
| Regeneration | heat (furnace) / replace | chemical: brine, acid or alkali |
| TDS | not changed | softening no change; demineralisation removes |`,
    keys: ['surface', 'exchange of ions', 'organics', 'ionic', 'furnace', 'brine'],
    lists: ['l-att-mech'],
    src: 'TA T08, T12',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
