// ev-fe — iron, manganese and arsenic removal; catalytic contact oxidation; process flow diagrams; surface vs ground water trains
// (Tanvir sir T13 and T03 p9–10). The T13 slides are scanned images, so the equations are textbook forms (see digest Doubts 20).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-fe' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const accent = 'var(--c-accent)'

interface Step {
  t: string[]
  hi?: boolean
}
interface Row {
  label?: string
  steps: Step[]
}

/** rows of process boxes joined by arrows: used for every flow diagram in this topic */
const Train = ({ rows, note, label }: { rows: Row[]; note?: string[]; label: string }) => {
  const rowH = 84
  const H = 18 + rows.length * rowH + (note?.length ?? 0) * 18 + 8
  return (
    <svg viewBox={`0 0 660 ${H}`} width="100%" role="img" aria-label={label}>
      <defs>
        <marker id="ev-fe-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ink} />
        </marker>
      </defs>
      {rows.map((r, ri) => {
        const n = r.steps.length
        const gap = 16
        const w = (644 - (n - 1) * gap) / n
        const y0 = 16 + ri * rowH
        return (
          <g key={ri}>
            {r.label && (
              <text x={8} y={y0 + 2} fontSize={11.5} fontWeight={700} fill={ink}>
                {r.label}
              </text>
            )}
            {r.steps.map((s, i) => {
              const x = 8 + i * (w + gap)
              return (
                <g key={i}>
                  <rect x={x} y={y0 + 10} width={w} height={46} rx={5} fill={panel2} stroke={s.hi ? accent : mute} strokeWidth={s.hi ? 2.2 : 1.3} />
                  {s.t.map((line, li) => (
                    <text key={li} x={x + w / 2} y={y0 + 33 - (s.t.length - 1) * 6.5 + li * 13} textAnchor="middle" fontSize={n > 6 ? 10 : 11} fill={ink}>
                      {line}
                    </text>
                  ))}
                  {i < n - 1 && <line x1={x + w} y1={y0 + 33} x2={x + w + gap - 1} y2={y0 + 33} stroke={ink} markerEnd="url(#ev-fe-a)" />}
                </g>
              )
            })}
          </g>
        )
      })}
      {note?.map((s, i) => (
        <text key={i} x={8} y={18 + rows.length * rowH + 12 + i * 18} fontSize={11} fill={mute}>
          {s}
        </text>
      ))}
    </svg>
  )
}

const aer: Step = { t: ['Aeration', 'CO₂ out, O₂ in'] }
const floc: Step = { t: ['Flocculation'] }
const sed: Step = { t: ['Sedimentation'] }
const filt: Step = { t: ['Filtration'] }
const cl: Step = { t: ['Chlorination', 'Cl₂, storage'] }

// ---------- figures ----------
const IronLowAlkFig: FC = () => (
  <Train
    label="Flow diagrams for iron removal from low-alkalinity ground water"
    rows={[
      { label: '1. Aeration + alkaline chemical', steps: [{ t: ['Raw water'] }, aer, { t: ['Ca(OH)₂ or', 'Na₂CO₃'], hi: true }, { t: ['Rapid mix'] }, floc, sed, filt, cl] },
      { label: '2. Aeration + strong oxidant', steps: [{ t: ['Raw water'] }, aer, { t: ['Cl₂, O₃, ClO₂', 'or KMnO₄'], hi: true }, { t: ['Rapid mix'] }, floc, sed, filt, cl] },
      { label: '3. Multiple-tray catalytic contact oxidation', steps: [{ t: ['Raw water'] }, { t: ['Tray aerator,', 'coated coarse', 'media'], hi: true }, floc, sed, filt, cl] },
    ]}
    note={['alkalinity below 130 mg/L as CaCO₃ (pH stays too low): raise pH above 7.3, oxidise chemically, or catalyse', 'Fe²⁺ (soluble) → Fe(III) (insoluble) precipitate, then solid separation: floc, settle, filter']}
  />
)

const IronHighAlkFig: FC = () => (
  <Train
    label="Flow diagram for iron and arsenic removal from high-alkalinity ground water"
    rows={[
      { label: 'Fe + As, alkalinity above 130 mg/L, no organic matter', steps: [{ t: ['Raw water'] }, { t: ['Aeration', 'strips CO₂,', 'pH above 7.3'], hi: true }, { t: ['Oxidant', 'Cl₂ / KMnO₄', 'As(III)→As(V)'], hi: true }, { t: ['Flocculation', 'Fe(OH)₃ flocs', 'adsorb As'] }, sed, filt, cl] },
      { label: 'With high Mn: add', steps: [{ t: ['Higher pH', 'above 8.5–9'] }, { t: ['Cl₂ or KMnO₄', '2–4 h contact'], hi: true }, { t: ['Recycle Fe/Mn', 'oxide sludge'] }, { t: ['MnO₂-coated', 'catalytic filter'], hi: true }] },
    ]}
    note={['aeration alone does not oxidise As(III), so a chemical oxidant is added; Fe(OH)₃ flocs then co-precipitate arsenate']}
  />
)

const IronAsLowAlkFig: FC = () => (
  <Train
    label="Flow diagram for iron and arsenic removal from low-alkalinity ground water"
    rows={[
      { label: 'Fe + As, low alkalinity, no organic matter', steps: [{ t: ['Raw water'] }, { t: ['Aeration', 'CO₂ out, O₂ in'] }, { t: ['Lime / soda ash', 'alkalinity, pH 9'], hi: true }, { t: ['Oxidant', 'Cl₂ (As(III))'], hi: true }, { t: ['Rapid mix', 'and flocculation'] }, sed, filt, cl] },
    ]}
    note={['lime supplies alkalinity and raises the pH above 9 (ionises As(III), precipitates Fe); iron flocs co-precipitate arsenic', 'if the water is also low in iron, add FeCl₃ or alum before flocculation']}
  />
)

const AsMethodsFig: FC = () => (
  <Train
    label="Three alternative methods of arsenic removal by co-precipitation"
    rows={[
      { label: 'A. Oxidise As(III) to As(V) + iron / alum floc', steps: [{ t: ['Raw water'] }, { t: ['Oxidant', 'Cl₂ / KMnO₄'], hi: true }, { t: ['FeCl₃ or alum'], hi: true }, { t: ['Rapid mix', 'flocculation'] }, sed, filt, cl] },
      { label: 'B. Lime (pH above 9) ionises As(III) + floc', steps: [{ t: ['Raw water'] }, { t: ['Lime', 'pH above 9'], hi: true }, { t: ['Alum or FeCl₃'], hi: true }, { t: ['Rapid mix', 'flocculation'] }, sed, filt, cl] },
      { label: 'C. Oxidise, then adsorb on iron / alumina media', steps: [{ t: ['Raw water'] }, { t: ['Oxidant', 'As(III)→As(V)'], hi: true }, { t: ['Adsorptive filter', 'Fe₂O₃ / Fe(OH)₃,', 'activated alumina'], hi: true }, cl] },
    ]}
    note={['A and B for low-iron ground water; iron-rich water needs no added coagulant (aeration makes Fe(OH)₃)']}
  />
)

const MnCatalyticFig: FC = () => (
  <Train
    label="Catalytic contact oxidation of manganese"
    rows={[
      { label: 'Process', steps: [{ t: ['Raw water', 'Mn²⁺'] }, { t: ['Tray aerator:', 'coarse media coated', 'with Fe/Mn oxides'], hi: true }, floc, sed, { t: ['Filter', 'MnO₂-coated sand'], hi: true }, cl] },
      { label: 'On the coated surface', steps: [{ t: ['1 Sorption', 'Mn²⁺ + MnO₂(s)', '→ Mn²⁺·MnO₂(s)'] }, { t: ['2 Oxidation', 'sorbed Mn²⁺ + O₂', '→ new MnO₂(s)'], hi: true }, { t: ['3 Catalysis', 'product oxide', 'speeds the next cycle'] }] },
    ]}
    note={['previously precipitated Fe and Mn oxides catalyse Mn(II) → Mn(IV); this is fast even at pH below 9']}
  />
)

const TrainsFig: FC = () => (
  <Train
    label="Treatment trains for ground water and surface water"
    rows={[
      { label: 'Ground water', steps: [{ t: ['Raw GW'] }, { t: ['Aeration', 'gases, Fe, Mn'], hi: true }, { t: ['Softening', 'lime, soda ash'] }, filt, { t: ['Disinfection', 'Cl₂'] }, { t: ['Storage'] }] },
      { label: 'Surface water', steps: [{ t: ['Raw SW'] }, { t: ['Presedimen-', 'tation'], hi: true }, { t: ['Mix, floc,', 'settle (alum)'], hi: true }, filt, { t: ['Adsorption', 'activated C'] }, { t: ['Disinfection'] }, { t: ['Storage'] }] },
    ]}
    note={['GW is clear but rich in dissolved gases, Fe, Mn, hardness: aerate, soften, filter lightly', 'SW is turbid and microbially polluted: coagulate, settle, filter, adsorb organics, disinfect']}
  />
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-fe-conditions',
    topic: T,
    title: 'Conditions for effective oxidation and precipitation of iron',
    ask: 'Mention the three major environmental conditions that must be maintained for effective oxidation and precipitation of soluble iron.',
    points: [
      { k: 'pH above 7.3', alt: ['pH > 7.3', 'pH above 7.5', 'high pH'], d: 'raised by aeration stripping CO₂ or by adding alkali' },
      { k: 'Alkalinity above 130 mg/L', alt: ['high alkalinity', 'alkalinity > 130 mg/L as CaCO3', 'sufficient alkalinity'] },
      { k: 'Absence of organic matter', alt: ['no organic matter', 'low organic content'], d: 'organics complex Fe and use up oxidant' },
    ],
    hook: 'P-A-O: pH, Alkalinity, Organics.',
    seen: ['2007-08', '2011-12', '2012-13'],
    src: 'TA T13 p2',
  },
  {
    id: 'l-fe-factors',
    topic: T,
    title: 'Factors affecting iron oxidation and precipitation',
    ask: 'What are the factors affecting Iron oxidation and precipitation processes?',
    points: [
      { k: 'pH', d: 'above 7.3–7.5 for aeration' },
      { k: 'Alkalinity', d: 'above 130 mg/L as CaCO₃' },
      { k: 'Organic matter', alt: ['organics'], d: 'absence needed' },
      { k: 'Dissolved oxygen or oxidant', alt: ['aeration', 'oxidising agents', 'chlorine'] },
      { k: 'Catalyst (previously precipitated iron oxide)', alt: ['catalytic contact', 'catalysis', 'oxide coated media'] },
      { k: 'Temperature and contact time', alt: ['temperature', 'time'] },
    ],
    seen: ['2011-12', '2012-13'],
    src: 'TA T13 p2, p4–5; Notes (textbook for temperature)',
  },
  {
    id: 'l-fe-lowalk',
    topic: T,
    title: 'Iron removal strategies when alkalinity is low (below 130 mg/L)',
    ask: 'What are the three alternative methods of iron removal from low-alkalinity ground water?',
    points: [
      { k: 'Aeration then alkaline chemical', alt: ['aeration and lime', 'aeration then Ca(OH)2 or Na2CO3', 'lime / caustic soda'], d: 'lime or soda ash to raise pH and alkalinity' },
      { k: 'Aeration then oxidising chemical', alt: ['aeration and chlorine', 'chlorine / ozone / chlorine dioxide / KMnO4', 'strong oxidant'], d: 'chlorine, potash (KMnO₄), ozone, ClO₂' },
      { k: 'Multiple-tray catalytic contact oxidation', alt: ['catalytic contact oxidation', 'tray aerator with coated media'], d: 'coarse media coated with Fe/Mn oxides' },
    ],
    hook: 'Alkali, Oxidant, Catalyst.',
    seen: ['2008-09', '2009-10', '2017-18'],
    src: 'TA T13 p2, p4–5',
  },
  {
    id: 'l-fe-direct',
    topic: T,
    title: 'Problems of direct filtration of aerated iron water',
    points: [
      { k: 'Clogging of the filter sand top', alt: ['clogging'] },
      { k: 'Frequent backwash (twice a day)', alt: ['frequent backwash'] },
      { k: 'Wastage of 30–40 % water', alt: ['wastage of water'], d: 'for backwash and rinsing' },
      { k: 'Less useful water after backwash', alt: ['less useful water'] },
      { k: 'Sand change every 3–4 months', alt: ['changing of sand'] },
      { k: 'Excess power consumption', alt: ['power'] },
    ],
    seen: [],
    src: 'TA T13 p3',
  },
  {
    id: 'l-fe-mn-kinetics',
    topic: T,
    title: 'Kinetics of manganese oxidation and removal',
    points: [
      { k: 'Aeration is negligible below pH 9', alt: ['slow oxidation by aeration', 'pH 9'], d: 'much slower than iron' },
      { k: 'Chemical oxidation needs pH above 8.5', alt: ['pH > 8.5', 'chlorine'], d: '1 mg Cl₂ oxidises about 0.77 mg Mn; takes 2–4 h' },
      { k: 'Catalytic oxidation by Fe and Mn oxides', alt: ['catalyse', 'previously precipitated oxides'] },
      { k: 'Sorption on hydrous Fe(OH)₃ and MnO₂', alt: ['sorption'], d: 'fast reaction, speeds removal; Fe(II) above Mn(II) makes removal mainly sorption on iron precipitate' },
    ],
    seen: ['2010-11', '2011-12', '2012-13', '2015-16', 'Jan 2021'],
    src: 'TA T13 p6',
  },
  {
    id: 'l-fe-mn-criteria',
    topic: T,
    title: 'Criteria for manganese removal (oxidation of Mn(II) to Mn(IV))',
    points: [
      { k: 'Aeration at pH above 9.0', alt: ['aeration at high pH'] },
      { k: 'Chemical oxidation at pH above 8.5', alt: ['chlorine or potash oxidation', 'BP / potash'] },
      { k: 'Multiple-tray catalytic contact oxidation', alt: ['catalytic contact oxidation'] },
      { k: 'Direct sorption on coated coarse media', alt: ['sorption on Fe(OH)3 and MnO2', 'direct sorption'] },
    ],
    hook: 'High-pH air, Chemical, Catalytic, Sorption.',
    seen: ['2021-22'],
    src: 'TA T13 p7',
  },
  {
    id: 'l-fe-as-steps',
    topic: T,
    title: 'Arsenic removal in two steps',
    ordered: true,
    points: [
      { k: 'Oxidation and ionisation of As(III) to As(V)', alt: ['oxidation and ionization', 'ionise arsenite', 'raise pH above 9'], d: 'by chlorine / potash, or lime to pH above 9' },
      { k: 'Co-precipitation or adsorption on oxy-hydroxide flocs', alt: ['co-precipitation', 'adsorption on Fe(OH)3', 'adsorb on iron, aluminium, manganese oxides'], d: 'negative arsenic ion on positive Fe(OH)₃ / Al(OH)₃ flocs, then solid separation' },
    ],
    seen: ['2017-18', '2021-22', '2016-17', '2011-12', '2012-13'],
    src: 'TA T13 p9–10',
  },
  {
    id: 'l-fe-as-ionize',
    topic: T,
    title: 'Options of ionisation / dissociation of arsenic in water',
    ask: 'What are the options of ionisation / dissociation of arsenic compounds in water?',
    points: [
      { k: 'Oxidise As(III) to As(V) by chlorine or potash', alt: ['oxidation to arsenate', 'chemical oxidation'], d: 'arsenate ion H₂AsO₄⁻ / HAsO₄²⁻ (negative)' },
      { k: 'Raise pH above 9 with lime', alt: ['pH > 9', 'ionise As(III) directly', 'direct ionisation of arsenite'], d: 'arsenious acid H₃AsO₃ → H₂AsO₃⁻ arsenite ion' },
    ],
    seen: ['2007-08', '2010-11'],
    src: 'TA T13 p8–10',
  },
  {
    id: 'l-fe-trains-gw',
    topic: T,
    title: 'Ground-water treatment train',
    ordered: true,
    points: [
      { k: 'Aeration', d: 'removes gases, oxidises Fe and Mn' },
      { k: 'Softening', d: 'removes Ca and Mg hardness (lime, soda ash)' },
      { k: 'Filtration', d: 'removes residual CaCO₃ and Mg(OH)₂ floc' },
      { k: 'Disinfection', d: 'chlorine, with residual' },
      { k: 'Storage', d: 'contact time and peak-demand water' },
    ],
    seen: ['2017-18'],
    src: 'TA T03 p9',
  },
  {
    id: 'l-fe-trains-sw',
    topic: T,
    title: 'Surface-water treatment train',
    ordered: true,
    points: [
      { k: 'Presedimentation', d: 'larger suspended solids from fast streams' },
      { k: 'Mixing, flocculation, settling', d: 'coagulate colloids with alum or polymer: turbidity and colour' },
      { k: 'Filtration', d: 'polishes remaining turbidity' },
      { k: 'Adsorption', d: 'activated carbon if dissolved organics present' },
      { k: 'Disinfection', d: 'chlorine with residual' },
      { k: 'Storage', d: 'contact time and peak demand' },
    ],
    seen: ['2017-18'],
    src: 'TA T03 p10',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-fe-why', topic: T, front: 'Why does Bangladesh ground water need Fe, Mn and As removal?', back: 'Ground water is anoxic and reducing: it dissolves Fe²⁺, Mn²⁺ and As(III) from sediments. Fe, Mn give colour, taste, stains; As causes arsenicosis (BD limit 0.05, WHO 0.01 mg/L).', src: 'TA T03 p8; T13' },
  { id: 'c-fe-oxrx', topic: T, front: 'Iron oxidation by aeration (equation)?', back: '4Fe²⁺ + O₂ + 10H₂O → 4Fe(OH)₃↓ + 8H⁺. Soluble Fe(II) becomes insoluble Fe(III); acid is made, so alkalinity is needed to hold pH above 7.3. (Equation is the textbook form.)', src: 'textbook; TA T13 p2' },
  { id: 'c-fe-ph-rate', topic: T, front: 'Why is high pH needed for iron oxidation?', back: 'The rate of Fe(II) oxidation by O₂ rises very steeply with pH (about a hundredfold per pH unit); aeration also strips CO₂, raising the pH above 7.3.', src: 'TA T13 p2 + textbook' },
  { id: 'c-fe-mn-vs-fe', topic: T, front: 'Why is manganese removal harder than iron?', back: 'Mn oxidises much more slowly by aeration (negligible below pH 9), chemical oxidation needs pH above 8.5 and 2–4 h; it needs catalysis (oxide-coated media) or sorption on Fe(OH)₃ / MnO₂.', seen: ['2007-08', '2016-17', '2022-23'], src: 'TA T13 p6–7, p11' },
  { id: 'c-fe-catalytic', topic: T, front: 'What is catalytic contact oxidation?', back: 'Water trickles over coarse media coated with Fe and Mn oxides; the oxide surface sorbs Mn²⁺/Fe²⁺ and catalyses their oxidation by O₂, so oxidation is fast at lower pH. Precipitate builds up on the media.', seen: ['2010-11', '2011-12', '2012-13', '2015-16', 'Jan 2021'], src: 'TA T13 p4–6' },
  { id: 'c-fe-mn-rx', topic: T, front: 'Mn oxidation and sorption equations?', back: 'Chemical: Mn²⁺ + Cl₂ + 2H₂O → MnO₂↓ + 2Cl⁻ + 4H⁺. Sorption: Mn(II) + MnO₂(s) → Mn(II)·MnO₂(s) (fast); the sorbed Mn²⁺ is then oxidised to new MnO₂ by O₂ or Cl₂.', src: 'TA T13 p6; textbook' },
  { id: 'c-fe-cl-mn', topic: T, front: 'How much chlorine does Mn need?', back: 'Stoichiometry: 1 mg Cl₂ oxidises about 0.77 mg Mn (1.3 mg Cl₂ per mg Mn). The slide prints it swapped ("1.0 mg of chlorine can oxidise 1.3 mg of Mn").', src: 'TA T13 p6; Doubts' },
  { id: 'c-fe-sorb', topic: T, front: 'Which solids sorb arsenic?', back: 'Hydrous oxides of iron (Fe(OH)₃, iron oxy-hydroxides), aluminium (Al(OH)₃, activated alumina), manganese, and clay minerals. Arsenate adsorbs strongly, arsenite less efficiently.', src: 'TA T13 p9' },
  { id: 'c-fe-as3', topic: T, front: 'Arsenite As(III) vs arsenate As(V) in water?', back: 'As(III): reducing conditions, un-ionised H₃AsO₃ at pH 2–9 (H₂AsO₃⁻ above 8, HAsO₃²⁻ above 11). As(V): oxic, strong acid ionised: H₂AsO₄⁻ below pH 7, HAsO₄²⁻ pH 7–11.5, AsO₄³⁻ above 11.5.', src: 'TA T13 p8' },
  { id: 'c-fe-as-first', topic: T, front: 'First step of arsenic removal?', back: 'Oxidation and ionisation of non-ionised As(III) to negative As(V) with chlorine or potash, or direct ionisation by raising the pH above 9 with lime. Aeration alone does not oxidise As(III).', seen: ['2017-18', '2021-22'], src: 'TA T13 p9–11' },
  { id: 'c-fe-as-co', topic: T, front: 'How is arsenic co-precipitated?', back: 'Negative arsenic ions adsorb on the positively charged surfaces of Fe(OH)₃ or Al(OH)₃ flocs (from aeration of iron water or alum / FeCl₃ coagulation) and settle with them.', src: 'TA T13 p9–10' },
  { id: 'c-fe-lowiron', topic: T, front: 'What if the ground water is low in iron?', back: 'Add an iron salt (FeCl₃) or alum as the source of floc; for iron-rich water the aeration itself forms the Fe(OH)₃ that co-precipitates arsenic.', src: 'TA T13 p9' },
  { id: 'c-fe-direct', topic: T, front: 'Why not direct filtration of aerated iron water?', back: 'Iron precipitate clogs the sand top, so twice-daily backwash, 30–40 % water wasted, sand changed every 3–4 months, extra power (AWWA does not recommend it for turbidity above 60 NTU).', src: 'TA T13 p3' },
  { id: 'c-fe-last-cl', topic: T, front: 'Why is chlorine dosed at the end of every iron train?', back: 'Final disinfection and residual after filtration; pathogens are not removed by the iron process.', src: 'TA T13 p4–5' },
  { id: 'c-fe-gw-aer', topic: T, front: 'Why does the ground-water train start with aeration?', back: 'To remove undesirable gases (CO₂, H₂S) and oxidise Fe and Mn; GW is low in DO, so these would otherwise pass into the distribution system.', src: 'TA T03 p9' },
  { id: 'c-fe-sw-pre', topic: T, front: 'Why presedimentation in surface-water treatment?', back: 'Water from fast-flowing streams carries large suspended solids that are settled first to relieve the coagulation basins; chemicals (Cl₂, NH₃) may be added to oxidise organics.', src: 'TA T03 p10' },
  { id: 'c-fe-bd-tech', topic: T, front: 'Technologies for Fe-As problem areas in Bangladesh?', back: 'Aeration, coagulation (alum / ferric), sedimentation and filtration in community arsenic-iron removal plants (AIRP), household 3-bucket / sand-filter (SIDKO) units, and iron-coated media. Iron-rich water self-removes As by coprecipitation.', seen: ['2022-23'], src: 'RM L5 (alternative options); textbook' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-fe-conditions',
    topic: T,
    q: 'Mention the three major environmental conditions for effective oxidation and precipitation of soluble iron. What factors affect iron oxidation and precipitation?',
    seen: ['2007-08', '2011-12', '2012-13'],
    a: `### Conditions and factors
Oxidation of soluble Fe(II) to insoluble Fe(III) and its precipitation need:
1. **pH above 7.3**: the oxidation rate rises very steeply with pH; aeration strips CO₂ and lifts pH. $4Fe^{2+}+O_2+10H_2O\\rightarrow4Fe(OH)_3\\downarrow+8H^+$.
2. **Alkalinity above 130 mg/L as CaCO₃** (sufficient alkalinity buffers the acid formed and keeps the pH up after CO₂ stripping).
3. **Absence of organic matter**: organics complex iron as soluble chelates and consume oxidant.
### Other factors
4. **Dissolved oxygen or oxidant** (aeration, chlorine, potash, ozone).
5. **Catalysis** by previously precipitated iron oxide or oxide-coated media.
6. **Temperature and contact time**; then the **separation** of the precipitate by flocculation, sedimentation and filtration.
If alkalinity is low or organics are present, add alkali, add a strong oxidant, or use catalytic contact oxidation.`,
    keys: ['pH above 7.3', 'Alkalinity above 130 mg/L', 'Absence of organic matter', 'oxidant', 'Catalysis', 'Temperature', 'flocculation'],
    lists: ['l-fe-conditions', 'l-fe-factors'],
    src: 'TA T13 p2',
  },
  {
    id: 'a-fe-ph',
    topic: T,
    q: 'How does pH affect the removal of iron, manganese and arsenic from water?',
    seen: ['2008-09'],
    a: `### Effect of pH
| | **Iron** | **Manganese** | **Arsenic** |
|---|---|---|---|
| Oxidation | needs **pH above 7.3 (7.5)**; below this Fe²⁺ stays soluble | aeration negligible below **pH 9**; chemical (Cl₂, potash) oxidation needs **pH above 8.5** | aeration does not oxidise As(III); chemical oxidation works over pH 2–11.5 |
| Ionisation | not needed | not needed | As(III) stays as un-ionised H₃AsO₃ up to pH 9; **pH above 9** (lime) ionises it to H₂AsO₃⁻; As(V) is ionised: H₂AsO₄⁻ below 7, HAsO₄²⁻ at 7–11.5 |
| Precipitation / sorption | Fe(OH)₃ precipitates at neutral pH | MnO₂ forms above 8.5–9; sorption on Fe(OH)₃ / MnO₂ is fast | negative ions co-precipitate on positive Fe(OH)₃ or Al(OH)₃ flocs; sorption falls if pH is too high |
Low pH (low alkalinity) is the main difficulty, so lime or soda ash is added.`,
    keys: ['pH above 7.3', 'pH 9', 'pH above 8.5', 'pH above 9', 'H₃AsO₃', 'ionises', 'Fe(OH)₃'],
    lists: ['l-fe-mn-kinetics'],
    src: 'TA T13 p2, p6–10',
  },
  {
    id: 'a-fe-lowalk',
    topic: T,
    q: 'Explain with flow diagrams the three alternative methods of removal of iron from ground water having low alkalinity (below 130 mg/L as CaCO₃).',
    seen: ['2008-09', '2009-10', '2017-18'],
    a: `### Low alkalinity: three alternatives (all end with flocculation, sedimentation, filtration and chlorination)
1. **Aeration + alkaline chemical**: aeration (CO₂ out, O₂ in) then **lime Ca(OH)₂ or soda ash Na₂CO₃** to add alkalinity and raise the pH above 7.3 so that Fe²⁺ oxidises and precipitates as Fe(OH)₃.
2. **Aeration + oxidising chemical**: **chlorine, ozone, chlorine dioxide or KMnO₄ (potash)** gives rapid chemical oxidation when alkalinity is low or organic matter is present (organics hold iron).
3. **Multiple-tray catalytic contact oxidation**: water cascades through trays of **coarse media coated with Fe/Mn oxides**; the oxide film **catalyses** oxidation, so it is fast even with low alkalinity.
Common downstream: **flocculation** to grow Fe(OH)₃ particles, **sedimentation**, **rapid sand filtration** to catch the residue and **chlorine** for disinfection. Direct filtration of aerated iron water is not advised (clogging, frequent backwash).`,
    keys: ['Aeration + alkaline chemical', 'lime', 'soda ash', 'Aeration + oxidising chemical', 'potash', 'catalytic contact oxidation', 'coarse media', 'flocculation', 'sedimentation'],
    lists: ['l-fe-lowalk', 'l-fe-direct'],
    src: 'TA T13 p2–5',
    Fig: IronLowAlkFig,
  },
  {
    id: 'a-fe-asfe-high',
    topic: T,
    q: 'Draw the process flow diagram for simultaneous removal of iron and arsenic from ground water of high alkalinity (above 130 mg/L) and no organic matter. What modifications if Mn is also high? State the purpose of each step.',
    seen: ['2020-21'],
    a: `### Flow diagram (see figure) and purpose of each step
1. **Aeration**: strips CO₂, raises pH above 7.3 and supplies O₂ to oxidise Fe²⁺ to insoluble Fe(III); alkalinity is high so the pH stays up (no alkali needed).
2. **Oxidant dose (chlorine or potash)**: aeration does not oxidise As(III), so it is oxidised and ionised to As(V) (arsenate, negative).
3. **Flocculation**: Fe(OH)₃ macro-flocs form (positive surface) and **co-precipitate / adsorb** the arsenate.
4. **Sedimentation**: removes most of the Fe(OH)₃-arsenic floc.
5. **Filtration** (rapid sand): removes the remaining floc.
6. **Chlorination and storage**: disinfection and residual.

### If Mn is also high
Mn(II) oxidises slowly: raise the pH above 8.5–9 or dose **Cl₂ / KMnO₄** with **2–4 h contact**, use **catalytic contact oxidation or MnO₂-coated filter media**, recycle precipitated Fe/Mn oxide, and exploit sorption of Mn²⁺ on the iron floc (Fe above Mn).`,
    keys: ['Aeration', 'Oxidant dose', 'As(III)', 'Flocculation', 'co-precipitate', 'Sedimentation', 'Filtration', 'Chlorination', 'catalytic contact oxidation', 'pH above 8.5'],
    lists: ['l-fe-conditions', 'l-fe-as-steps', 'l-fe-mn-criteria'],
    src: 'TA T13 p4–11',
    Fig: IronHighAlkFig,
  },
  {
    id: 'a-fe-asfe-low',
    topic: T,
    q: 'Draw an appropriate process flow diagram for simultaneous removal of iron and arsenic from ground water with low alkalinity and no organic matter.',
    seen: ['2023-24'],
    a: `### Flow diagram (see figure) and purpose
1. **Aeration** (multiple tray): O₂ in, CO₂ out; starts Fe²⁺ oxidation.
2. **Lime / soda ash**: adds alkalinity and raises pH (above 7.3 for Fe, above 9 to ionise As(III)).
3. **Chlorine (oxidant)**: oxidises As(III) to ionised As(V).
4. **Rapid mix and flocculation**: Fe(OH)₃ flocs form and **co-precipitate** the arsenic (add FeCl₃ or alum if the iron is too low).
5. **Sedimentation**, then **filtration** remove the floc.
6. **Chlorination** and storage for disinfection.
Low alkalinity would otherwise let the pH fall as Fe²⁺ oxidises (8H⁺ formed), so the alkaline chemical is the key difference from the high-alkalinity plant.`,
    keys: ['Aeration', 'Lime / soda ash', 'alkalinity', 'Chlorine', 'flocculation', 'co-precipitate', 'Sedimentation', 'filtration', 'FeCl₃'],
    lists: ['l-fe-lowalk', 'l-fe-as-steps'],
    src: 'TA T13 p2–5, p9–10',
    Fig: IronAsLowAlkFig,
  },
  {
    id: 'a-fe-mn-cat',
    topic: T,
    q: 'Explain the mechanism of removal of manganese by catalytic contact oxidation and sorption, with equations (and diagram).',
    seen: ['2010-11', '2011-12', '2012-13', '2015-16', 'Jan 2021'],
    a: `### Manganese removal
Mn(II) is oxidised to insoluble Mn(IV): $2Mn^{2+}+O_2+2H_2O\\rightarrow2MnO_2\\downarrow+4H^+$, or with chlorine $Mn^{2+}+Cl_2+2H_2O\\rightarrow MnO_2\\downarrow+2Cl^-+4H^+$. By aeration this is very slow (**negligible below pH 9**); chemical oxidation needs **pH above 8.5** and 2–4 h.
1. **Catalytic contact oxidation**: water trickles through a multiple-tray aerator or filter of **coarse media coated with hydrous oxides** of Fe(III) and Mn(IV). The **previously precipitated oxide catalyses** the oxidation Mn(II) → Mn(IV), which becomes fast at lower pH and short contact.
2. **Sorption**: both hydrous Fe(OH)₃ and MnO₂ **sorb** Mn²⁺: $Mn^{2+}+MnO_2(s)\\rightarrow Mn^{2+}\\cdot MnO_2(s)$ (**fast**). The sorbed Mn²⁺ is oxidised on the surface by O₂ or Cl₂ to give more MnO₂ (autocatalysis).
3. If **Fe(II) is greater than Mn(II)**, removal is mainly **sorption of Mn²⁺ on the incipient iron precipitate**.
4. Precipitate is separated by flocculation, sedimentation and filtration (MnO₂-coated sand).`,
    keys: ['negligible below pH 9', 'pH above 8.5', 'Catalytic contact oxidation', 'coarse media', 'catalyses', 'Sorption', 'MnO₂', 'Fe(II) is greater than Mn(II)'],
    lists: ['l-fe-mn-kinetics', 'l-fe-mn-criteria'],
    src: 'TA T13 p6–7; equations textbook (slides are images with no equations)',
    Fig: MnCatalyticFig,
  },
  {
    id: 'a-fe-diff',
    topic: T,
    q: 'How do Fe, Mn and As oxidation (and precipitation) differ?',
    seen: ['2007-08', '2009-10', '2016-17', '2022-23'],
    a: `### Fe vs Mn vs As
| | **Iron** | **Manganese** | **Arsenic** |
|---|---|---|---|
| Change | Fe(II) soluble → Fe(III) insoluble ppt | Mn(II) soluble → Mn(IV) insoluble ppt | As(III) arsenite, soluble and **non-ionised** → As(V) arsenate, soluble and **ionised** (negative); no insoluble form |
| Oxidant | aeration (O₂) | aeration (very slow), Cl₂, potash | aeration **does not work**; Cl₂, potash |
| pH | above 7.3–7.5 | above 9 (aeration), above 8.5 (chemical) | pH 2–11.5 for As(III)→As(V); or lime to pH above 9 to ionise As(III) |
| Speed | fast | slow, needs catalysis and 2–4 h | fast with chlorine |
| Removal step | precipitate, floc, settle, filter | catalytic contact / sorption on Fe(OH)₃ / MnO₂, adsorptive precipitate | **co-precipitation** or adsorption on Fe(OH)₃ / Al(OH)₃ flocs and oxide-coated media |
| Special | needs alkalinity and no organics | Fe above Mn helps (sorption) | needs oxidation or ionisation **before** removal |`,
    keys: ['Fe(II)', 'Mn(IV)', 'non-ionised', 'ionised', 'does not work', 'co-precipitation', 'catalysis', 'above 9'],
    src: 'TA T13 p6–11',
  },
  {
    id: 'a-fe-as-ioniz',
    topic: T,
    q: 'What are the options of ionisation / dissociation of arsenic compounds in water?',
    seen: ['2007-08', '2010-11'],
    a: `### Arsenic species
1. **Arsenite As(III)**: reducing conditions (low redox potential); present as the un-dissociated weak acid **arsenious acid H₃AsO₃** at pH 2–9; above pH 8 forms **H₂AsO₃⁻**, above pH 11 **HAsO₃²⁻**.
2. **Arsenate As(V)**: oxic conditions; a strong acid, fully dissociated: **H₂AsO₄⁻** (pH below 7), **HAsO₄²⁻** (pH 7–11.5), **AsO₄³⁻** (above 11.5).
Non-ionised As(III) adsorbs poorly, so it must be converted to a negative ion first. Options:
3. **Option 1: oxidation and ionisation**: oxidise As(III) to As(V) with an oxidant (**chlorine or potash**): $H_3AsO_3+HOCl\\rightarrow H_2AsO_4^-+Cl^-+2H^+$.
4. **Option 2: direct ionisation of As(III)** by raising the **pH above 9 with lime** to arsenite ions (H₂AsO₃⁻).`,
    keys: ['Arsenite', 'H₃AsO₃', 'Arsenate', 'H₂AsO₄⁻', 'oxidation and ionisation', 'chlorine or potash', 'pH above 9', 'lime'],
    lists: ['l-fe-as-ionize'],
    src: 'TA T13 p8–10',
  },
  {
    id: 'a-fe-as-methods',
    topic: T,
    q: 'What are the (three / two) alternative methods of arsenic removal from low-iron ground water by co-precipitation? Explain with flow diagrams.',
    seen: ['2007-08', '2010-11', '2011-12', '2012-13'],
    a: `### Arsenic removal: co-precipitation methods
Principle: ionised (negative) arsenic is adsorbed on the **positive surface of metal-hydroxide flocs** (Fe(OH)₃, Al(OH)₃) and removed with them. Low-iron water has too little iron of its own, so a coagulant is added.
1. **Method A: oxidation + floc**: oxidise As(III) to As(V) with **chlorine or potash**, add **FeCl₃ or alum**, rapid mix, flocculation, sedimentation, filtration, chlorination.
2. **Method B: lime ionisation + floc**: raise the pH above 9 with **lime** to ionise As(III) as arsenite, then **alum or FeCl₃** floc (lowering pH for the floc), settle, filter, chlorinate.
3. **Method C: oxidation + adsorptive filtration**: oxidise As(III), then filter through **iron oxide / Fe(OH)₃-coated media or activated alumina**, which adsorb arsenate; chlorinate.
(Two-method questions: A and B.) Aeration of **iron-rich** water forms Fe(OH)₃ itself, so no extra coagulant is needed.`,
    keys: ['co-precipitation', 'positive', 'FeCl₃ or alum', 'chlorine or potash', 'lime', 'pH above 9', 'activated alumina', 'flocculation'],
    lists: ['l-fe-as-steps', 'l-fe-as-ionize'],
    src: 'TA T13 p9–10; three-way split is the exam convention',
    Fig: AsMethodsFig,
  },
  {
    id: 'a-fe-as-theory',
    topic: T,
    q: 'Describe the theory, criteria and process of arsenic removal.',
    seen: ['2017-18', '2021-22'],
    a: `### Theory
1. Arsenate and arsenite (less efficiently) **adsorb strongly on hydrous oxides** of iron, aluminium, manganese and on clay minerals.
2. **Therefore the first step** is **oxidation and ionisation** of non-ionised As(III) to ionised As(V) with chlorine or potash, or **direct ionisation** of As(III) by **pH above 9**.
3. Arsenic ions are also adsorbed on solid chemical floc surfaces and removed by **co-precipitation**; aeration of iron water or **alum coagulation** gives macro-flocs of Fe(OH)₃ / Al(OH)₃.

### Criteria
- **1st**: oxidation and ionisation of As(III) to negative As(V) (chlorine / potash), or lime to pH above 9.
- **2nd**: co-precipitation of the negative arsenic ion with settleable flocs having free **positive surface charge**, or adsorption on Fe₂O₃, Fe(OH)₃, activated alumina and clay during filtration.

### Process
Raw water → oxidant (or lime) → Fe/Al coagulant → rapid mix → flocculation → sedimentation → filtration → chlorination.`,
    keys: ['adsorb strongly', 'oxidation and ionisation', 'pH above 9', 'co-precipitation', 'positive surface charge', 'activated alumina', 'alum coagulation'],
    lists: ['l-fe-as-steps'],
    src: 'TA T13 p9–10',
  },
  {
    id: 'a-fe-mn-theory',
    topic: T,
    q: 'Describe the theory and criteria of Mn removal.',
    seen: ['2021-22'],
    a: `### Theory
1. Mn is oxidised far more slowly than iron by aeration (negligible below pH 9). Chemical oxidation needs pH above 8.5 and 2–4 h.
2. Previously precipitated Fe and Mn oxides **catalyse** Mn(II) → Mn(IV); Fe(OH)₃ and MnO₂ also **sorb** Mn²⁺ quickly.

### Criteria
- **1st**: oxidise soluble Mn(II) to insoluble Mn(IV) by (1) **aeration at pH above 9.0**, (2) **chemical oxidation (chlorine / potash) at pH above 8.5**, (3) **multiple-tray catalytic contact oxidation**, or (4) **direct sorption** on Fe(OH)₃ / MnO₂-coated coarse media.
- **2nd**: separate the precipitated Fe(III) and Mn(IV) particles by **flocculation, sedimentation and filtration**.`,
    keys: ['catalyse', 'sorb', 'aeration at pH above 9.0', 'chemical oxidation', 'catalytic contact oxidation', 'direct sorption', 'flocculation, sedimentation and filtration'],
    lists: ['l-fe-mn-criteria', 'l-fe-mn-kinetics'],
    src: 'TA T13 p6–7',
  },
  {
    id: 'a-fe-as-ph-iron',
    topic: T,
    q: 'How is arsenic removal affected by pH and the presence of iron in water?',
    seen: ['2016-17'],
    a: `### Effect of iron
1. **Iron helps**: Fe(OH)₃ flocs, made by aeration of iron-containing water, have a **positive surface** that adsorbs and co-precipitates ionised arsenic. Iron-rich water removes arsenic almost on its own.
2. In **low-iron water** an iron salt (FeCl₃) or alum must be added, otherwise little floc forms.
3. Oxidising As(III) to As(V) first improves the adsorption on the iron floc.
### Effect of pH
1. **pH controls the species**: As(III) is un-ionised (H₃AsO₃) up to pH 9; **pH above 9 (lime)** ionises it. As(V) is ionised over the whole range (H₂AsO₄⁻ below 7, HAsO₄²⁻ at 7–11.5).
2. **pH controls the floc**: Fe(OH)₃ forms above pH 7.3 and is positive at neutral pH; at very high pH the surface turns negative and arsenic adsorption falls, so pH is adjusted back.
3. Low alkalinity lets pH fall during oxidation, so lime or soda ash is added.`,
    keys: ['Iron helps', 'positive surface', 'low-iron water', 'FeCl₃', 'pH controls the species', 'pH above 9', 'lime'],
    lists: ['l-fe-as-steps'],
    src: 'TA T13 p8–10',
  },
  {
    id: 'a-fe-trains',
    topic: T,
    q: 'What are the typical differences between water quality of surface and ground water? Delineate the treatment process diagrams for surface and ground water, highlighting the differences.',
    seen: ['2017-18'],
    a: `### Quality differences (summary)
Surface water: variable temperature, high and variable turbidity and SS, some Fe/Mn, DO near saturation, microorganisms and pollution. Ground water: constant temperature, low turbidity, **high Fe and Mn**, aggressive CO₂, H₂S, low DO, few microbes, high minerals.

### Ground water train
**Aeration** (gases out, Fe/Mn oxidised) → **softening** (lime, soda ash; if hard) → **filtration** (residual CaCO₃ and Mg(OH)₂) → **disinfection** (chlorine) → **storage**.

### Surface water train
**Presedimentation** (large SS) → **mixing, flocculation, settling** (alum, turbidity and colour) → **filtration** → **adsorption** (activated carbon if organics) → **disinfection** → **storage**.

### Differences
- GW starts with **aeration and softening**; SW starts with **presedimentation and coagulation-flocculation-settling**.
- SW needs **adsorption** for organics; GW has no coagulation unless iron/arsenic floc is made.
- Both end with filtration, disinfection and storage.`,
    keys: ['Aeration', 'softening', 'Presedimentation', 'flocculation', 'adsorption', 'disinfection', 'storage', 'filtration'],
    lists: ['l-fe-trains-gw', 'l-fe-trains-sw', 'l-wq-sw-gw'],
    src: 'TA T03 p8–10',
    Fig: TrainsFig,
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
