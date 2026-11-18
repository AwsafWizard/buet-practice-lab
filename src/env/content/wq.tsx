// ev-wq — water quality parameters, sanitary significance, standards, alkalinity / hardness / carbonate system (Tanvir sir T01–T03).
// Sources: CE22 slides T01–T03 (digest lec_tanvir.md), CE19 slides (ECR 1997 vs WHO 2011 table), textbook where marked.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-wq' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'

// ---------- figures ----------
/** carbonic acid species vs pH (K1 = 10^-6.3, K2 = 10^-10.3) */
const CarbonicFig: FC = () => {
  const K1 = 10 ** -6.3
  const K2 = 10 ** -10.3
  const X = (ph: number) => 60 + ((ph - 4) / 8) * 510
  const Y = (f: number) => 240 - f * 210
  const frac = (ph: number) => {
    const h = 10 ** -ph
    const d = 1 + K1 / h + (K1 * K2) / (h * h)
    return [1 / d, K1 / h / d, (K1 * K2) / (h * h) / d]
  }
  const pts = (i: number) =>
    Array.from({ length: 81 }, (_, k) => {
      const ph = 4 + k * 0.1
      return `${X(ph).toFixed(1)},${Y(frac(ph)[i]).toFixed(1)}`
    }).join(' ')
  const cols = ['var(--c-bad)', 'var(--c-water)', 'var(--c-accent2)']
  return (
    <svg viewBox="0 0 600 300" width="100%" role="img" aria-label="Carbonic acid species against pH">
      <rect x={60} y={30} width={510} height={210} fill="none" stroke={line} />
      {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((p) => (
        <g key={p}>
          <text x={X(p)} y={258} textAnchor="middle" fontSize={11} fill={mute}>
            {p}
          </text>
        </g>
      ))}
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={60} x2={570} y1={Y(v / 100)} y2={Y(v / 100)} stroke={line} strokeDasharray="3 4" />
          <text x={54} y={Y(v / 100) + 4} textAnchor="end" fontSize={11} fill={mute}>
            {v}
          </text>
        </g>
      ))}
      {[
        [6.3, 'pK₁ = 6.3'],
        [10.3, 'pK₂ = 10.3'],
      ].map(([p, t]) => (
        <g key={String(p)}>
          <line x1={X(Number(p))} x2={X(Number(p))} y1={30} y2={240} stroke={mute} strokeDasharray="5 4" />
          <text x={X(Number(p))} y={24} textAnchor="middle" fontSize={11} fill={ink}>
            {t}
          </text>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <polyline key={i} points={pts(i)} fill="none" stroke={cols[i]} strokeWidth={2.4} />
      ))}
      <text x={96} y={62} fontSize={12} fontWeight={700} fill={cols[0]}>
        H₂CO₃* (natural / carbonic acidity)
      </text>
      <text x={250} y={102} fontSize={12} fontWeight={700} fill={cols[1]}>
        HCO₃⁻ (bicarbonate alkalinity)
      </text>
      <text x={470} y={62} textAnchor="middle" fontSize={12} fontWeight={700} fill={cols[2]}>
        CO₃²⁻
      </text>
      <text x={315} y={280} textAnchor="middle" fontSize={12} fill={ink}>
        pH (P end-point 8.3, M end-point 4.5)
      </text>
      <text x={14} y={135} fontSize={11} fill={mute} transform="rotate(-90 14 135)">
        % of total carbonate species
      </text>
    </svg>
  )
}

/** how rain water picks up hardness and alkalinity */
const NaturalHardnessFig: FC = () => {
  const B = ({ x, y, w, t, h = 34 }: { x: number; y: number; w: number; t: string[]; h?: number }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={panel2} stroke={mute} />
      {t.map((s, i) => (
        <text key={s} x={x + w / 2} y={y + 15 + i * 14} textAnchor="middle" fontSize={11.5} fill={ink}>
          {s}
        </text>
      ))}
    </g>
  )
  return (
    <svg viewBox="0 0 600 270" width="100%" role="img" aria-label="Natural processes giving hardness and alkalinity">
      <defs>
        <marker id="ev-wq-arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={mute} />
        </marker>
      </defs>
      <B x={20} y={10} w={110} t={['Rain', '(CO₂ from air)']} />
      <B x={20} y={85} w={110} t={['Top soil', 'bacteria → CO₂']} />
      <B x={20} y={160} w={110} t={['Sub-soil', 'CO₂ + H₂O → H₂CO₃']} h={44} />
      <B x={20} y={225} w={110} t={['Limestone / dolomite']} h={30} />
      {[44, 119, 204].map((y) => (
        <line key={y} x1={75} x2={75} y1={y} y2={y + 41 - (y === 204 ? 11 : 0)} stroke={mute} markerEnd="url(#ev-wq-arr)" strokeWidth={1.5} />
      ))}
      <text x={150} y={245} fontSize={12} fill={ink}>
        CaCO₃(s) + H₂CO₃ → Ca²⁺ + 2HCO₃⁻
      </text>
      <text x={150} y={262} fontSize={12} fill={ink}>
        MgCO₃(s) + H₂CO₃ → Mg²⁺ + 2HCO₃⁻
      </text>
      <B x={330} y={20} w={250} t={['Ca²⁺, Mg²⁺ in solution = HARDNESS']} h={30} />
      <B x={330} y={70} w={250} t={['HCO₃⁻ in solution = ALKALINITY']} h={30} />
      <B x={330} y={120} w={250} t={['Carbonate hardness (CH)', 'when alkalinity ≤ total hardness']} h={40} />
      <B x={330} y={180} w={250} t={['Non-carbonate hardness (NCH)', 'Ca/Mg with SO₄²⁻, Cl⁻, NO₃⁻']} h={40} />
      <text x={455} y={242} textAnchor="middle" fontSize={11.5} fill={mute}>
        TH = CH + NCH
      </text>
    </svg>
  )
}

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-wq-groups',
    topic: T,
    title: 'Water quality parameters (three groups)',
    ask: 'Classify water quality parameters, with examples.',
    points: [
      { k: 'Physical', alt: ['physical parameters'], d: 'respond to sight, touch, smell: suspended solids, turbidity, colour, taste and odour, temperature' },
      { k: 'Chemical', alt: ['chemical parameters'], d: 'related to solvent capability: TDS, alkalinity, hardness, dissolved metals, fluoride, organics, nutrients' },
      { k: 'Biological', alt: ['biological parameters', 'pathogens'], d: 'water as a medium for biological species: pathogens' },
    ],
    seen: [],
    src: 'TA T01 p3',
  },
  {
    id: 'l-wq-physical',
    topic: T,
    title: 'Physical water quality parameters',
    points: [
      { k: 'Suspended solids', alt: ['SS'] },
      { k: 'Turbidity' },
      { k: 'Color', alt: ['colour'] },
      { k: 'Taste and odor', alt: ['taste and odour', 'odour and taste'] },
      { k: 'Temperature' },
    ],
    hook: 'STCOT: Solids, Turbidity, Colour, Odour/taste, Temperature.',
    seen: [],
    src: 'TA T01 p3',
  },
  {
    id: 'l-wq-chemical',
    topic: T,
    title: 'Chemical water quality parameters',
    points: [
      { k: 'Total dissolved solids', alt: ['TDS'] },
      { k: 'Alkalinity' },
      { k: 'Hardness' },
      { k: 'Dissolved metals' },
      { k: 'Fluoride' },
      { k: 'Organics' },
      { k: 'Nutrients', alt: ['nitrogen and phosphorus'] },
    ],
    seen: [],
    src: 'TA T01 p3',
  },
  {
    id: 'l-wq-turb-sig',
    topic: T,
    title: 'Environmental significance of turbidity',
    ask: 'Why does turbidity matter in a water supply?',
    points: [
      { k: 'Aesthetic quality affected', alt: ['aesthetically displeasing', 'opaqueness'], d: 'opaque, unattractive water' },
      { k: 'Interferes with light penetration', alt: ['photosynthesis'], d: 'in natural waters, reduces photosynthesis' },
      { k: 'Increases filtration cost', alt: ['filtration cost'], d: 'SSF operation becomes difficult; RSF depends on turbidity removal' },
      { k: 'Affects disinfection', alt: ['protects pathogens'], d: 'organisms encased in particles are shielded from the disinfectant' },
      { k: 'First line of defense against resistant organisms', alt: ['Cryptosporidium', 'Giardia'], d: 'removing turbidity removes Cryptosporidium parvum and Giardia lamblia' },
    ],
    seen: ['2008-09', '2009-10', '2011-12'],
    src: 'TA T01 p6',
  },
  {
    id: 'l-wq-color-src',
    topic: T,
    title: 'Sources of colour in water',
    points: [
      { k: 'Iron and manganese in groundwater', alt: ['Fe and Mn', 'metallic substances'] },
      { k: 'Plankton and weeds', alt: ['algae'] },
      { k: 'Humus and peat', alt: ['humus', 'peat'] },
      { k: 'Colored wastes', alt: ['coloured wastes', 'industrial wastes'] },
    ],
    seen: ['2007-08', '2008-09', '2009-10', '2010-11', '2015-16'],
    src: 'TA T01 p7',
  },
  {
    id: 'l-wq-color-sig',
    topic: T,
    title: 'Significance of colour',
    points: [
      { k: 'Aesthetic quality affected', alt: ['yellow brownish appearance'] },
      { k: 'Exerts chlorine demand', alt: ['chlorine demand'], d: 'organic compounds consume chlorine' },
      { k: 'Harmful by-products with chlorine', alt: ['THM', 'trihalomethanes'], d: 'chlorine + colour-producing organics gives THMs, objectionable taste and odour' },
    ],
    seen: [],
    src: 'TA T01 p7',
  },
  {
    id: 'l-wq-taste-src',
    topic: T,
    title: 'Sources of taste and odour',
    points: [
      { k: 'Inorganics', alt: ['alkaline materials', 'metallic salts'], d: 'taste without odour: alkaline materials bitter, metallic salts salty or bitter' },
      { k: 'Organics', alt: ['petroleum products', 'decomposition of organics', 'H2S', 'algae oils'], d: 'taste and odour: petroleum products, biological decomposition (H₂S), oily substances secreted by algae' },
      { k: 'Combination of two products', alt: ['combination'], d: 'neither alone gives taste/odour' },
    ],
    seen: ['2009-10', '2010-11', '2012-13', '2015-16'],
    src: 'TA T01 p8',
  },
  {
    id: 'l-wq-temp-sig',
    topic: T,
    title: 'Significance of temperature',
    points: [
      { k: 'Biological activity doubles per 10 °C', alt: ['biological activity', 'algal bloom'], d: 'accelerated growth, algal bloom' },
      { k: 'Influences dissolved oxygen', alt: ['DO levels', 'fish survival'] },
      { k: 'Affects reaction rates and solubility', alt: ['solubility of chemicals'] },
      { k: 'Viscosity increases as temperature falls', alt: ['viscosity'] },
      { k: 'Affects density', alt: ['density stratification'] },
    ],
    seen: [],
    src: 'TA T01 p9',
  },
  {
    id: 'l-wq-tds-sig',
    topic: T,
    title: 'Significance of total dissolved solids',
    points: [
      { k: 'Colour, taste and odour', alt: ['aesthetically displeasing'] },
      { k: 'Some TDS toxic or carcinogenic', alt: ['toxic'] },
      { k: 'TDS above 500 mg/L causes scaling', alt: ['scaling'], d: 'pipes, heaters, boilers, appliances' },
      { k: 'Decides the softening procedure', alt: ['type of softening'] },
      { k: 'Corrosion control by pH adjustment', alt: ['stabilization pH'], d: 'stabilisation pH depends on TDS, alkalinity, temperature' },
      { k: 'Not all dissolved substances are undesirable', alt: ['distilled water flat taste'], d: 'distilled water tastes flat; undersaturated water is aggressive' },
    ],
    seen: [],
    src: 'TA T01 p10',
  },
  {
    id: 'l-wq-major-ions',
    topic: T,
    title: 'Major constituents of TDS (common ions)',
    ask: 'Name the six major ions that make up most of the TDS in natural water (1–1000 mg/L).',
    points: [
      { k: 'Sodium', alt: ['Na'] },
      { k: 'Calcium', alt: ['Ca'] },
      { k: 'Magnesium', alt: ['Mg'] },
      { k: 'Bicarbonate', alt: ['HCO3'] },
      { k: 'Sulfate', alt: ['sulphate', 'SO4'] },
      { k: 'Chloride', alt: ['Cl'] },
    ],
    hook: 'Na-Ca-Mg cations, then three anions HCO₃-SO₄-Cl.',
    seen: [],
    src: 'TA T01 p12',
  },
  {
    id: 'l-wq-alk-classes',
    topic: T,
    title: 'Three classes of material causing alkalinity',
    points: [
      { k: 'Bicarbonate', alt: ['HCO3-', 'HCO3'] },
      { k: 'Carbonate', alt: ['CO3 2-', 'CO3'] },
      { k: 'Hydroxide', alt: ['OH-', 'OH'] },
    ],
    seen: ['2007-08'],
    src: 'TA T02 p1',
  },
  {
    id: 'l-wq-alk-rules',
    topic: T,
    title: 'Alkalinity species from P and M',
    ask: 'How do you tell the species of alkalinity from P and M?',
    points: [
      { k: 'P = M: all hydroxide', alt: ['P=M', 'OH only'] },
      { k: 'P = M/2: all carbonate', alt: ['P=M/2', 'CO3 only'] },
      { k: 'P = 0: all bicarbonate', alt: ['P=0', 'HCO3 only'] },
      { k: 'P < M/2: bicarbonate and carbonate', alt: ['P<M/2'] },
      { k: 'P > M/2: hydroxide and carbonate', alt: ['P>M/2'] },
    ],
    seen: [],
    src: 'TA T02 p4',
  },
  {
    id: 'l-wq-hard-sig',
    topic: T,
    title: 'Significance of hardness',
    points: [
      { k: 'Soap consumption', alt: ['soap'], d: 'less of a problem now with detergents' },
      { k: 'Scaling', alt: ['scale', 'fouling'], d: 'water heaters, hot water pipes, boilers' },
      { k: 'Laxative effect of magnesium sulfate', alt: ['laxative'] },
      { k: 'Beneficial to cardiovascular system', alt: ['cardiovascular', 'heart'] },
    ],
    seen: ['2016-17'],
    src: 'TA T02 p5',
  },
  {
    id: 'l-wq-toxic-metals',
    topic: T,
    title: 'Toxic metals in water',
    points: [
      { k: 'Arsenic', alt: ['As'] },
      { k: 'Barium', alt: ['Ba'] },
      { k: 'Cadmium', alt: ['Cd'] },
      { k: 'Chromium', alt: ['Cr'] },
      { k: 'Lead', alt: ['Pb'] },
      { k: 'Mercury', alt: ['Hg'] },
      { k: 'Silver', alt: ['Ag'] },
    ],
    hook: 'A BC CLMS: As Ba Cd Cr Pb Hg Ag.',
    seen: [],
    src: 'TA T02 p12',
  },
  {
    id: 'l-wq-nontoxic-metals',
    topic: T,
    title: 'Non-toxic metals in water',
    points: [
      { k: 'Calcium', alt: ['Ca'] },
      { k: 'Magnesium', alt: ['Mg'] },
      { k: 'Sodium', alt: ['Na'], d: 'the most abundant' },
      { k: 'Iron', alt: ['Fe'] },
      { k: 'Manganese', alt: ['Mn'] },
      { k: 'Aluminum', alt: ['aluminium', 'Al'] },
      { k: 'Copper', alt: ['Cu'] },
      { k: 'Zinc', alt: ['Zn'] },
    ],
    seen: [],
    src: 'TA T02 p10',
  },
  {
    id: 'l-wq-pathogens',
    topic: T,
    title: 'Groups of waterborne pathogens',
    points: [
      { k: 'Bacteria', d: 'typhoid, paratyphoid, cholera, shigellosis' },
      { k: 'Virus', alt: ['viruses'], d: 'polio, infectious hepatitis' },
      { k: 'Protozoa', d: 'amoebic dysentery, giardiasis' },
      { k: 'Helminths', alt: ['parasitic worms'], d: 'guinea worm, schistosomiasis' },
    ],
    seen: [],
    src: 'TA T03 p1–3',
  },
  {
    id: 'l-wq-ideal-indicator',
    topic: T,
    title: 'Characteristics of an ideal pathogen indicator',
    ask: 'What makes a good indicator organism?',
    points: [
      { k: 'Applicable to all types of water' },
      { k: 'Present or absent with the pathogens', alt: ['present when pathogens are present and absent when they are absent', 'always present or absent with pathogens'] },
      { k: 'Routine quantitative testing without interference', alt: ['easy to test', 'no interference from other organisms'] },
      { k: 'Not a pathogen itself', alt: ['safe for laboratory personnel'] },
    ],
    seen: ['2010-11'],
    src: 'TA T03 p1',
  },
  {
    id: 'l-wq-organic-types',
    topic: T,
    title: 'Types of organics in water',
    points: [
      { k: 'Biodegradable', d: 'food for microorganisms, measured by BOD' },
      { k: 'Non-biodegradable', d: 'resistant (pesticides, tannic and lignic acids), estimated by COD or TOC' },
    ],
    seen: [],
    src: 'TA T02 p13',
  },
  {
    id: 'l-wq-sw-gw',
    topic: T,
    title: 'Surface water vs ground water quality (parameters compared)',
    ask: 'What are the typical differences between the quality of surface water and ground water?',
    points: [
      { k: 'Temperature', d: 'SW varies with season; GW relatively constant' },
      { k: 'Turbidity and suspended solids', alt: ['turbidity'], d: 'SW varies, sometimes high; GW usually low or nil' },
      { k: 'Mineral content', d: 'SW varies; GW constant at a high value' },
      { k: 'Dissolved Fe and Mn', alt: ['iron and manganese'], d: 'SW some; GW always high' },
      { k: 'Aggressive CO2', alt: ['carbon dioxide'], d: 'SW none; GW always some' },
      { k: 'Dissolved oxygen', alt: ['DO'], d: 'SW near saturation; GW low, needs aeration' },
      { k: 'Ammonia', d: 'SW only if polluted; GW increasing' },
      { k: 'Hydrogen sulfide', alt: ['H2S'], d: 'SW none; GW usually some' },
      { k: 'Living organisms', alt: ['microorganisms'], d: 'SW may be high; GW usually none' },
    ],
    seen: ['2017-18'],
    src: 'TA T03 p8',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-wq-ss', topic: T, front: 'What may suspended solids consist of, and why do they matter?', back: 'Inorganic (clay, silt), organic (plant fibre, biological solids) or immiscible liquids (oil, grease). Displeasing, give adsorption sites for chemicals and microbes; biologically active SS can degrade and carry pathogens.', src: 'TA T01 p4' },
  { id: 'c-wq-turb', topic: T, front: 'Define turbidity. Is it the same as suspended solids?', back: '"A measure of the extent to which light is either absorbed or scattered by suspended material in water." Not a direct measure of SS, but used as a proxy for SS in potable water.', src: 'TA T01 p5', seen: ['2007-08', '2008-09'] },
  { id: 'c-wq-turb-colour', topic: T, front: 'Distinguish turbidity from colour.', back: 'Turbidity = cloudiness from suspended and colloidal particles that scatter or absorb light (clay, silt, microbes). Colour = tint from dissolved or colloidal matter (humus, Fe, Mn, algae), still seen after the particles are filtered off (true colour); apparent colour includes the turbidity effect.', seen: ['2007-08', '2008-09'], src: 'TA T01 p5–7 + textbook' },
  { id: 'c-wq-colour-true', topic: T, front: 'Apparent colour vs true colour?', back: 'Apparent colour is the colour of the sample as it is, including suspended matter. True colour is the colour after the turbidity is removed (filtered or centrifuged), due to dissolved and colloidal substances.', src: 'TA T01 p7' },
  { id: 'c-wq-tds-ec', topic: T, front: 'How are TDS and electrical conductivity related?', back: 'TDS (mg/L) ≈ (0.55–0.90) × EC (µS/cm); class factor 0.6–0.7 for normal water. Non-ionised and organic dissolved molecules do not add to EC, so EC does not perfectly represent TDS.', src: 'TA T01 p11 + Notes' },
  { id: 'c-wq-tds-minor', topic: T, front: 'Minor constituents of TDS (0.01–10 mg/L)?', back: 'Iron, strontium, potassium, carbonate, nitrate, fluoride, boron, silica.', src: 'TA T01 p12' },
  { id: 'c-wq-alk-def', topic: T, front: 'Define alkalinity. Does it have a public-health significance?', back: 'A measure of water’s capacity to absorb H⁺ (neutralise acids), due to HCO₃⁻, CO₃²⁻, OH⁻. No public-health significance; very high alkalinity is unpalatable. It buffers natural waters and is a process-control variable in coagulation and softening.', src: 'TA T02 p1' },
  { id: 'c-wq-p-m', topic: T, front: 'What are P-alkalinity and M-alkalinity?', back: 'P = acid needed to bring the sample to pH 8.3 (phenolphthalein end-point: all OH⁻ and half the CO₃²⁻ done). M = acid needed to reach pH 4.5 (methyl-orange end-point) = total alkalinity.', seen: ['2007-08'], src: 'TA T02 p3' },
  { id: 'c-wq-alk-titr', topic: T, front: 'In the alkalinity titration, what does 1 mL of 0.02 N H₂SO₄ equal?', back: '1 mg of alkalinity as CaCO₃. So alkalinity (mg/L as CaCO₃) = mL acid × 1000 / mL sample. For pH below 9: CO₃²⁻ = 2P, HCO₃⁻ = M − 2P.', src: 'TA T02 p3' },
  { id: 'c-wq-hard-def', topic: T, front: 'What is hardness, and which ions cause it?', back: 'Mainly Ca²⁺ and Mg²⁺ (also Sr²⁺, Fe²⁺, Mn²⁺), expressed as mg/L CaCO₃. Total hardness = Ca-hardness + Mg-hardness = carbonate hardness + non-carbonate hardness.', src: 'TA T02 p5–6' },
  { id: 'c-wq-ch-nch', topic: T, front: 'Carbonate vs non-carbonate hardness?', back: 'CH: Ca²⁺ and Mg²⁺ with HCO₃⁻ (removed by heating or lime). NCH: with SO₄²⁻, Cl⁻, NO₃⁻, SiO₃²⁻ (needs soda ash or ion exchange). If TH > alkalinity, CH = alkalinity; if TH ≤ alkalinity, CH = TH.', src: 'TA T02 p6' },
  { id: 'c-wq-chloride', topic: T, front: 'Chloride: significance and sources?', back: 'Harmless up to ~2000 mg/L if adapted; salty taste; corrosive to metals; high value suggests sewage or saline intrusion; conservative, so it is a tracer. Sources: sea spray, saltwater intrusion, industrial wastes. Bangladesh limit 150–600 mg/L.', src: 'TA T02 p7 + CE19 table', seen: ['2023-24'] },
  { id: 'c-wq-fluoride', topic: T, front: 'Fluoride: optimum, excess and effects?', back: 'About 1 mg/L (min 0.6) reduces dental caries. Above 1.5–2 mg/L: dental fluorosis (mottled teeth); 3–6 mg/L: skeletal (bone) fluorosis. Natural source only (rocks). BD limit 1 mg/L; WHO 1.5.', seen: ['2008-09', '2009-10', '2012-13', '2015-16', '2023-24'], src: 'TA T02 p8' },
  { id: 'c-wq-sulfate', topic: T, front: 'Sulfate: why undesirable and where from?', back: 'Laxative effect (Mg or Na sulfate), bitter taste. From leaching of Epsom salt (MgSO₄) or Glauber’s salt (Na₂SO₄). BD limit 400 mg/L.', seen: ['2011-12', '2012-13', '2016-17'], src: 'TA T02 p9' },
  { id: 'c-wq-nitrate', topic: T, front: 'Why is nitrate dangerous to infants?', back: 'Blue-baby syndrome: nitrate is reduced to nitrite, which binds haemoglobin and cuts oxygen transport (methaemoglobinaemia). Ammonia oxidation to nitrate also exerts oxygen demand. Limits: BD 10 mg/L (1997) or 45 (ECR 2023), WHO 50 mg/L as NO₃⁻.', seen: ['2023-24'], src: 'TA T02 p14' },
  { id: 'c-wq-phosphate', topic: T, front: 'Significance of phosphorus in water?', back: 'Non-toxic, but the limiting nutrient: more P causes eutrophication (algal bloom, toxins, O₂ depletion on decay) and as little as 0.2 mg/L interferes with coagulation. Sources: wastes, fertilisers, detergents.', src: 'TA T02 p15' },
  { id: 'c-wq-fe-mn', topic: T, front: 'Do iron and manganese harm health?', back: 'Not at normal concentrations, but they give colour, metallic taste, stains, and feed slime bacteria that cause taste and odour. BD limits: Fe 0.3–1.0, Mn 0.1 mg/L.', src: 'TA T02 p11' },
  { id: 'c-wq-arsenic', topic: T, front: 'Arsenic: standards and effect?', back: 'Chronic poison in the ppb range, causes arsenicosis (skin lesions, cancers). Bangladesh standard 0.05 mg/L, WHO guideline 0.01 mg/L. Occurs naturally and from timber treatment and pesticides.', seen: ['2012-13', '2015-16'], src: 'TA T02 p12 + CE19 table' },
  { id: 'c-wq-lead', topic: T, front: 'Lead: why is it a concern?', back: 'Cumulative poison, chronic effects on the nervous system (and kidneys); prolonged exposure to even small amounts can kill. Bangladesh 0.05 mg/L, WHO 0.01 mg/L.', seen: ['2008-09'], src: 'TA T02 p12' },
  { id: 'c-wq-ecoli', topic: T, front: 'Why is E. coli (faecal coliform) used as an indicator?', back: 'Non-pathogenic, lives only in the gut of warm-blooded animals, excreted in large numbers, survives longer than most pathogens, easy to count. Its presence means faecal contamination and possible pathogens. Standard: 0 per 100 mL.', seen: ['2008-09', '2010-11'], src: 'TA T03 p1–2' },
  { id: 'c-wq-coliform', topic: T, front: 'Total coliform = ? What does a coliform test not tell you?', back: 'Total = faecal + non-faecal (soil, vegetation). The test does not identify pathogens; it shows the water has recently touched soil, vegetation or the intestines of warm-blooded animals.', src: 'TA T03 p2' },
  { id: 'c-wq-gv-vs-std', topic: T, front: 'Guideline value vs standard?', back: 'GV (WHO): concentration with no significant lifetime health risk; a recommendation, not mandatory. Standard: value adopted by a country and legally binding there (ECR in Bangladesh).', src: 'TA T03 p4' },
  { id: 'c-wq-ecr', topic: T, front: 'Bangladesh drinking-water standards (ECR 1997) for common parameters?', back: 'pH 6.5–8.5; TDS 1000; Fe 0.3–1.0; Mn 0.1; As 0.05; Cl 150–600; hardness 200–500; SO₄ 400; NO₃ 10; F 1; turbidity 10 JTU; coliform 0/100 mL; colour 15 Hazen; residual Cl₂ 0.2 mg/L (mg/L unless stated).', src: 'CE19 slides WQ p~25', seen: ['2015-16'] },
  { id: 'c-wq-who', topic: T, front: 'WHO 2011 guideline values to remember?', back: 'As 0.01; Pb 0.01; F 1.5; NO₃ 50 (as NO₃⁻); NO₂ 3; Cd 0.003; Hg 0.006; Cu 2; Ba 0.7; B 2.4; Ni 0.07; residual Cl₂ 5 mg/L; coliform 0.', src: 'CE19 slides WQ' },
  { id: 'c-wq-ecr23', topic: T, front: 'ECR 2023 drinking-water values on the slide?', back: 'Faecal and total coliform 0; free residual Cl₂ 0.20 mg/L; NO₃⁻ 45; As 0.05; turbidity 5 NTU; Al 0.20; NH₃ 1.5; Ba 0.7; benzene 0.01; B 1.0; Cd 0.003. 55 parameters in all.', src: 'TA T03 p6' },
  { id: 'c-wq-sw-std', topic: T, front: 'Which class of inland surface water can be a drinking source after disinfection only?', back: 'Class 1 (ECR 2023): pH 6.5–8.5, DO ≥ 6, BOD ≤ 2, faecal coliform ≤ 100 CFU/100 mL. Water for drinking after conventional treatment (class 3) allows DO ≥ 5, BOD ≤ 3, coliform ≤ 5000.', src: 'TA T03 p5' },
  { id: 'c-wq-rain', topic: T, front: 'Why is rain water "aggressive"?', back: 'Very low mineral content (soft, undersaturated), so it dissolves metals from pipes and tanks; it may also pick up contaminants from the roof catchment.', src: 'TA T03 p7' },
  { id: 'c-wq-gw-surface', topic: T, front: 'Why is ground water usually free of microbes and suspended solids?', back: 'The long, slow travel through soil strains and filters it, but it dissolves minerals, so it is rich in dissolved salts, Fe, Mn and CO₂.', src: 'TA T03 p7' },
  { id: 'c-wq-carbonic', topic: T, front: 'Which carbonic species dominate below pH 6.3, between 6.3–10.3, and above 10.3?', back: 'Below 6.3: H₂CO₃* (natural acidity). 6.3–10.3: HCO₃⁻. Above 10.3: CO₃²⁻. P end-point pH 8.3 and M end-point pH 4.5.', seen: ['2010-11', '2011-12', '2012-13', '2016-17'], src: 'TA T02 p2' },
  { id: 'c-wq-mineral-acidity', topic: T, front: 'Mineral acidity vs natural (CO₂) acidity?', back: 'Natural acidity is from dissolved CO₂ (H₂CO₃*), weak acid, titrated to pH 8.3. Mineral acidity is from strong acids (H₂SO₄, HCl, HNO₃) from mine or industrial waste, present when pH is below 4.5.', seen: ['2008-09'], src: 'textbook (Peavy)' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-wq-significance',
    topic: T,
    q: 'Describe the sanitary / environmental significance of the following impurities in water (turbidity, Mn, F, Pb, E. coli, SO₄, DO, CO₂, As, hardness, chloride, nitrogen, pesticides).',
    seen: ['2007-08', '2008-09', '2009-10', '2011-12', '2012-13', '2015-16', '2016-17', '2023-24', '2010-11'],
    a: `### Significance of impurities (write only the ones asked, one row each)
| Impurity | Sanitary / environmental significance |
|---|---|
| **Turbidity** | spoils appearance; cuts light penetration and photosynthesis; raises filtration cost; shields pathogens from the disinfectant; first defence against *Cryptosporidium* and *Giardia* |
| **Manganese** | no health effect at normal levels; black-brown colour, stains laundry and fixtures, metallic taste; feeds slime bacteria that give taste and odour (BD limit 0.1 mg/L) |
| **Fluoride** | about 1 mg/L prevents dental caries; above 1.5–2 mg/L dental fluorosis (mottled teeth); 3–6 mg/L skeletal (bone) fluorosis |
| **Lead** | cumulative poison; nervous-system and kidney damage, worst for children; WHO 0.01 mg/L |
| **E. coli** | indicator of faecal contamination; pathogens (typhoid, cholera, dysentery) may be present; standard 0 per 100 mL |
| **Sulfate** | laxative effect with Mg or Na; bitter taste; corrosion and scaling (BD 400 mg/L) |
| **Dissolved oxygen** | needed by fish and aquatic life; low DO means organic pollution and septic, foul-smelling water; high DO makes water corrosive |
| **Carbon dioxide** | forms carbonic acid, so water is aggressive and corrodes pipes; lowers pH; common in ground water, removed by aeration |
| **Arsenic** | chronic poison at ppb level: arsenicosis, skin lesions, cancers; BD 0.05 mg/L, WHO 0.01 mg/L |
| **Hardness** | soap wastage; scale in heaters and boilers; laxative effect of Mg; hard water is considered good for the heart |
| **Chloride** | harmless to about 2000 mg/L but salty taste and corrosive; high value hints at sewage or saline intrusion; used as a tracer |
| **Nitrogen** (NH₃, NO₂⁻, NO₃⁻) | nitrate causes blue-baby syndrome (methaemoglobinaemia); ammonia means recent pollution; nitrification exerts oxygen demand; nutrient for algae |
| **Pesticides** | toxic, persistent, bioaccumulate in the food chain; carcinogenic, affect nervous and endocrine systems; kill aquatic life |

Quote the standard value with each impurity to gain marks.`,
    keys: ['Turbidity', 'Manganese', 'Fluoride', 'fluorosis', 'Lead', 'E. coli', 'Sulfate', 'laxative', 'Dissolved oxygen', 'Carbon dioxide', 'Arsenic', 'Hardness', 'Chloride', 'Nitrogen', 'blue-baby', 'Pesticides'],
    lists: ['l-wq-turb-sig', 'l-wq-hard-sig'],
    src: 'TA T01–T02 (CE22); DO, CO₂, pesticides from textbook (Peavy 5-2)',
  },
  {
    id: 'a-wq-sources',
    topic: T,
    q: 'What are the sources (origin) of the following impurities in water: NO₃, E. coli / coliform, colour, Cr, Pb, Fe, CO₂, H₂S, odour and taste, arsenic?',
    seen: ['2007-08', '2008-09', '2009-10', '2011-12', '2012-13', '2015-16', '2016-17'],
    a: `### Sources of common impurities
| Impurity | Source / origin |
|---|---|
| **Nitrate (NO₃)** | animal wastes, chemical fertilisers, wastewater discharges; oxidation of ammonia by microbes |
| **E. coli / Coliform** | faeces of warm-blooded animals and humans: sewage, leaking latrines, animal waste; non-faecal coliform from soil and decaying vegetation |
| **Colour** | iron and manganese in ground water; plankton and weeds; humus and peat; coloured industrial wastes |
| **Chromium** | industrial wastes (tanneries, electroplating, dyes, metal finishing), mining; rock leaching |
| **Lead** | corrosion of lead pipes and solder, paints, petrol, battery and mining wastes |
| **Iron** | dissolution of iron-bearing minerals in reducing ground water; corrosion of iron pipes |
| **CO₂** | atmosphere, bacterial action and respiration in top soil, decay of organics; rich in ground water |
| **H₂S** | anaerobic decomposition of organic matter and reduction of sulfate, mainly ground water |
| **Odour and taste** | inorganics (alkaline and metallic salts), organics (petroleum products, decomposition, algal oils), combinations |
| **Arsenic** | natural geological source (reductive dissolution of iron oxy-hydroxides in sediments); timber treatment and pesticides |`,
    keys: ['Nitrate', 'fertilisers', 'E. coli', 'faeces', 'Colour', 'humus', 'Chromium', 'Lead', 'Iron', 'CO₂', 'H₂S', 'Odour and taste', 'Arsenic'],
    lists: ['l-wq-color-src', 'l-wq-taste-src'],
    src: 'TA T01–T03 (CE22); Cr, Pb, Fe, CO₂ rows from textbook',
  },
  {
    id: 'a-wq-causes',
    topic: T,
    q: 'List the impurities responsible for turbidity, colour, odour and taste in a water supply.',
    seen: ['2010-11'],
    a: `### Impurities responsible
1. **Turbidity**: clay, silt and rock fragments, metal oxides (erosion of soil), vegetable fibres, microorganisms, household and industrial wastewater.
2. **Colour**: iron and manganese, plankton and weeds (algae), humus and peat, coloured wastes.
3. **Odour**: organics (petroleum products, H₂S from decomposition, algal oils, phenolic compounds with chlorine).
4. **Taste**: inorganics (alkaline materials give bitter, metallic salts give salty or bitter taste), zinc, organics, and combinations.`,
    keys: ['clay', 'silt', 'microorganisms', 'humus', 'plankton', 'petroleum', 'phenolic', 'alkaline'],
    lists: ['l-wq-color-src', 'l-wq-taste-src'],
    src: 'TA T01 p5–8',
  },
  {
    id: 'a-wq-carbonic',
    topic: T,
    q: 'Show the variation of carbonic acid species (natural acidity, bicarbonate, carbonate) with pH.',
    seen: ['2010-11', '2011-12', '2012-13', '2016-17'],
    a: `### Carbonic acid system
$$CO_2 + H_2O \\rightleftharpoons H_2CO_3^*\\ (K_1=10^{-6.3})\\rightleftharpoons HCO_3^- + H^+\\ (K_2=10^{-10.3})\\rightleftharpoons CO_3^{2-}+H^+$$
1. **pH below 4.5**: only H₂CO₃* (mineral acidity possible).
2. **pH 4.5–6.3**: H₂CO₃* (natural acidity, free CO₂) dominates; equal to HCO₃⁻ at **pH 6.3 = pK₁**.
3. **pH 6.3–10.3**: **bicarbonate** HCO₃⁻ dominates (most natural waters, pH 7–8); P end-point **8.3**.
4. **pH 10.3 = pK₂**: HCO₃⁻ = CO₃²⁻; above 10.3 **carbonate** dominates and OH⁻ appears (above 9).
5. Total alkalinity is measured by titrating to **pH 4.5** (M); P-alkalinity to pH 8.3.`,
    keys: ['natural acidity', 'bicarbonate', 'carbonate', 'pH 6.3', 'pH 10.3', '8.3', '4.5'],
    lists: ['l-wq-alk-classes'],
    src: 'TA T02 p2 (alkalinity species vs pH)',
    Fig: CarbonicFig,
  },
  {
    id: 'a-wq-pm-alk',
    topic: T,
    q: 'Distinguish between P-alkalinity and M-alkalinity.',
    seen: ['2007-08'],
    a: `### P vs M alkalinity
| | **P-alkalinity** | **M-alkalinity** |
|---|---|---|
| Titrated to | pH 8.3 (phenolphthalein) | pH 4.5 (methyl orange) |
| Counts | all OH⁻ + half of CO₃²⁻ | OH⁻ + CO₃²⁻ + HCO₃⁻ |
| Meaning | phenolphthalein alkalinity | **total alkalinity** |
| Not present | when initial pH < 8.3 (P = 0) | always measured |

Reactions: OH⁻ + H⁺ → H₂O; CO₃²⁻ + H⁺ → HCO₃⁻ (P); HCO₃⁻ + H⁺ → H₂CO₃ (M). For pH below 9: CO₃²⁻ = 2P, HCO₃⁻ = M − 2P. 1 mL of 0.02 N H₂SO₄ = 1 mg as CaCO₃.`,
    keys: ['pH 8.3', 'pH 4.5', 'total alkalinity', 'phenolphthalein', 'CO₃²⁻', 'HCO₃⁻'],
    lists: ['l-wq-alk-rules'],
    src: 'TA T02 p3–4',
  },
  {
    id: 'a-wq-turb-colour',
    topic: T,
    q: 'Distinguish between colour and turbidity.',
    seen: ['2007-08', '2008-09'],
    a: `### Turbidity vs colour
| | **Turbidity** | **Colour** |
|---|---|---|
| Cause | suspended and colloidal particles (clay, silt, microbes, metal oxides) | dissolved and colloidal organics (humus, peat), Fe, Mn, plankton, coloured wastes |
| Effect on light | scatters or absorbs light | selective absorption (tint) |
| Measure | NTU / JTU turbidity meter | Hazen (Pt-Co) units, comparator |
| Types | single type | **apparent** (with turbidity) and **true** (after removal of turbidity) |
| Removal | coagulation, sedimentation, filtration | coagulation, adsorption, oxidation |
| Significance | shields pathogens, filtration load | aesthetic, chlorine demand, THM formation |`,
    keys: ['scatters', 'Hazen', 'apparent', 'true', 'chlorine demand'],
    lists: ['l-wq-turb-sig', 'l-wq-color-sig'],
    src: 'TA T01 p5–7',
  },
  {
    id: 'a-wq-acidity',
    topic: T,
    q: 'Distinguish between mineral acidity and natural acidity of water.',
    seen: ['2008-09'],
    a: `### Acidity
| | **Natural acidity** | **Mineral acidity** |
|---|---|---|
| Caused by | dissolved CO₂ (carbonic acid) | strong mineral acids (H₂SO₄, HCl, HNO₃) |
| Source | atmosphere, soil bacteria, decomposition | mine drainage, industrial waste, acid rain |
| Strength | weak acid, pH about 4.5–8.3 | strong acid, pH below 4.5 |
| Titrated to | pH 8.3 | pH 4.5 |
| Result | **aggressive**, corrodes pipes | very corrosive, toxic to aquatic life |`,
    keys: ['CO₂', 'carbonic acid', 'strong', 'pH 4.5', 'pH 8.3', 'corrosive'],
    src: 'textbook (Peavy 5-2)',
  },
  {
    id: 'a-wq-indicator',
    topic: T,
    q: 'What are the sanitary significances of the presence of indicator organisms in a domestic water supply?',
    seen: ['2010-11'],
    a: `### Indicator organisms
1. **Presumption of contamination**: the presence of the indicator (faecal coliform, *E. coli*) presumes that faecal contamination has occurred and suggests its nature and extent.
2. **Cheaper than pathogens**: testing for each pathogen is difficult, so indicators are used unless a specific pathogen is suspected.
3. **Ideal indicator**: applicable to all waters; present when pathogens are present and absent when they are not; easily counted without interference; not itself a pathogen.
4. **Faecal coliform** nearly meets these: non-pathogenic, lives only in the gut of warm-blooded animals, excreted in large numbers and survives longer than most pathogens.
5. **Total coliform** = faecal + non-faecal (soil, vegetation): shows recent contact with soil or intestines but does not identify pathogens.
6. Standard for drinking water: **0 per 100 mL**.`,
    keys: ['presumes', 'faecal coliform', 'E. coli', 'total coliform', 'not itself a pathogen', '0 per 100 mL'],
    lists: ['l-wq-ideal-indicator', 'l-wq-pathogens'],
    src: 'TA T03 p1–2',
  },
  {
    id: 'a-wq-pops',
    topic: T,
    q: 'With regard to water pollutants, what do you understand by POPs and CECs? Give examples.',
    seen: ['2020-21'],
    a: `### POPs and CECs
1. **POPs: persistent organic pollutants**: toxic organic chemicals that resist degradation, persist for years, bioaccumulate in fatty tissue and travel long distances. Examples: DDT, aldrin, dieldrin, chlordane, PCBs, dioxins and furans, HCB.
2. **CECs: contaminants of emerging concern**: chemicals or microbes recently found in water, not yet regulated, whose health effects are not fully known and which conventional treatment removes poorly. Examples: pharmaceuticals (antibiotics), personal-care products, hormones and endocrine disruptors, PFAS, microplastics, nanomaterials, artificial sweeteners, new pesticides.
3. Control: source control, advanced treatment (activated carbon, membranes, advanced oxidation).`,
    keys: ['persistent', 'bioaccumulate', 'DDT', 'PCBs', 'emerging concern', 'pharmaceuticals', 'microplastics'],
    src: 'textbook (Davis & Cornwell)',
  },
  {
    id: 'a-wq-natural-hardness',
    topic: T,
    q: 'With a neat sketch, describe the natural processes that contribute to hardness and alkalinity in groundwater.',
    seen: ['2023-24'],
    a: `### How ground water picks up hardness and alkalinity
1. **Rain** falls with a little dissolved CO₂ from the air.
2. In the **top soil**, bacterial decay and root respiration release a lot of CO₂ which dissolves: CO₂ + H₂O → H₂CO₃.
3. The **carbonic acid** percolates into the sub-soil and meets limestone and dolomite.
4. It dissolves them: $CaCO_3 + H_2CO_3 \\rightarrow Ca^{2+} + 2HCO_3^-$ and $MgCO_3 + H_2CO_3 \\rightarrow Mg^{2+} + 2HCO_3^-$.
5. **Ca²⁺ and Mg²⁺ give hardness; HCO₃⁻ gives alkalinity.** Where Ca/Mg come with SO₄²⁻ or Cl⁻ (gypsum, salts) the hardness is **non-carbonate**.
6. TH = CH + NCH; if alkalinity ≥ TH, all hardness is carbonate hardness and extra alkalinity is from Na⁺ (sodium bicarbonate).`,
    keys: ['CO₂', 'top soil', 'carbonic acid', 'limestone', 'hardness', 'alkalinity', 'non-carbonate'],
    src: 'TA T07 p2 + T02 p1',
    Fig: NaturalHardnessFig,
  },
  {
    id: 'a-wq-sw-gw',
    topic: T,
    q: 'What are the typical differences between water quality of surface and ground water?',
    seen: ['2017-18'],
    a: `### Surface vs ground water quality
| Parameter | Surface water | Ground water |
|---|---|---|
| Temperature | varies with season | relatively constant |
| Turbidity and SS | varies, sometimes high | usually low or nil |
| Mineral content | varies with soil, rainfall, effluents | constant at a high value |
| Dissolved Fe and Mn | some | always high |
| Aggressive CO₂ | none | always some |
| Dissolved oxygen | near saturation unless polluted | usually low, needs aeration |
| Ammonia | only in polluted water | increasing |
| Hydrogen sulfide | none | usually some |
| Living organisms | may be high | usually none |

So surface water needs coagulation, settling and filtration for turbidity and microbes; ground water needs aeration for Fe, Mn, CO₂, H₂S and sometimes softening.`,
    keys: ['Temperature', 'Turbidity', 'Mineral content', 'Dissolved Fe and Mn', 'Aggressive CO₂', 'Dissolved oxygen', 'Hydrogen sulfide', 'Living organisms'],
    lists: ['l-wq-sw-gw'],
    src: 'TA T03 p8',
  },
  {
    id: 'a-wq-bd-health',
    topic: T,
    q: 'Mention the adverse physiological effects on human health of any three common ground water impurities in Bangladesh.',
    seen: ['2010-11'],
    a: `### Common GW impurities in Bangladesh and their health effects
1. **Arsenic**: chronic exposure causes arsenicosis: skin pigmentation and keratosis, gangrene, and cancers of skin, lung and bladder; BD limit 0.05 mg/L (WHO 0.01).
2. **Iron and manganese**: not toxic, but cause colour, metallic taste, staining and slime; Mn at high levels has been linked to neurological effects.
3. **Fluoride** (in some areas): dental fluorosis above 1.5–2 mg/L, skeletal fluorosis at 3–6 mg/L.
4. **Chloride / salinity** (coastal): salty taste, hypertension and pre-eclampsia risk from sodium.
5. **Nitrate**: blue-baby syndrome in infants.
(Choose any three; state the standard with each.)`,
    keys: ['Arsenic', 'arsenicosis', 'Iron and manganese', 'Fluoride', 'fluorosis', 'Nitrate', 'blue-baby'],
    src: 'TA T02 p8–14 (CE22); BD context from textbook',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
