// ev-soft — lime-soda softening, split treatment, recarbonation and stabilisation (Tanvir sir T07).
// Dose calculations live in engine/soften.ts; this file holds the recall content.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-soft' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const accent2 = 'var(--c-accent2)'

const Defs = ({ id }: { id: string }) => (
  <defs>
    <marker id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill={ink} />
    </marker>
  </defs>
)
const Box = ({ x, y, w, h = 34, t, hi }: { x: number; y: number; w: number; h?: number; t: string[]; hi?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={5} fill={panel2} stroke={hi ? accent : mute} strokeWidth={hi ? 2.2 : 1.4} />
    {t.map((s, i) => (
      <text key={s} x={x + w / 2} y={y + h / 2 + 4 - ((t.length - 1) * 7) + i * 14} textAnchor="middle" fontSize={11.5} fill={ink}>
        {s}
      </text>
    ))}
  </g>
)
const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

// ---------- figures ----------
/** split-treatment flow sheet */
const SplitFig: FC = () => (
  <svg viewBox="0 0 660 280" width="100%" role="img" aria-label="Split treatment flow scheme">
    <Defs id="ev-sf-a" />
    <Box x={8} y={60} w={74} t={['Raw water', 'Q, Mg_r']} />
    <line x1={82} y1={77} x2={110} y2={77} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <line x1={110} y1={77} x2={110} y2={44} stroke={ink} />
    <line x1={110} y1={77} x2={110} y2={200} stroke={ink} />
    <line x1={110} y1={44} x2={132} y2={44} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <Tx x={120} y={34} t="(1−X)Q" a="start" b />
    <Box x={134} y={22} w={110} h={44} t={['1st stage', 'lime + soda ash', '(Ca + Mg removal)']} hi />
    <line x1={244} y1={44} x2={270} y2={44} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <Box x={272} y={26} w={86} t={['Settling', '(Mg_i = 10)']} />
    <line x1={358} y1={44} x2={400} y2={44} stroke={ink} />
    <line x1={400} y1={44} x2={400} y2={100} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <line x1={110} y1={200} x2={400} y2={200} stroke={ink} />
    <line x1={400} y1={200} x2={400} y2={140} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <Tx x={250} y={216} t="bypass X·Q  (no treatment, X = (Mg_f − Mg_i)/(Mg_r − Mg_i))" b />
    <Box x={344} y={102} w={112} h={36} t={['Blend']} />
    <line x1={456} y1={120} x2={480} y2={120} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <Box x={482} y={96} w={96} h={48} t={['2nd stage', 'lime only (Ca)', 'if hardness high']} />
    <line x1={530} y1={144} x2={530} y2={170} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <Box x={470} y={172} w={120} h={40} t={['Recarbonation', 'CO₂, pH 8.4–8.6']} />
    <line x1={590} y1={192} x2={612} y2={192} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <Box x={500} y={228} w={150} h={36} t={['Settling → filter →', 'chlorine → finished Q']} />
    <line x1={530} y1={212} x2={530} y2={226} stroke={ink} markerEnd="url(#ev-sf-a)" />
    <Tx x={14} y={262} t="treat (1−X) fully, blend with X, polish Ca if the blend is too hard" a="start" c={mute} />
  </svg>
)

/** precipitative softening train when alkalinity < hardness */
const SoftTrainFig: FC = () => {
  const steps: [string[], boolean][] = [
    [['Raw water'], false],
    [['Rapid mix', 'lime + soda ash'], true],
    [['Flocculation'], false],
    [['Sedimentation', '(sludge out)'], false],
    [['Recarbonation', 'CO₂'], true],
    [['Filtration'], false],
    [['Disinfection', 'Cl₂'], false],
    [['Storage'], false],
  ]
  return (
    <svg viewBox="0 0 640 210" width="100%" role="img" aria-label="Precipitative softening flow diagram">
      <Defs id="ev-st-a" />
      {steps.map(([t, hi], i) => {
        const row = i < 4 ? 0 : 1
        const col = row === 0 ? i : 7 - i
        const x = 18 + col * 150
        const y = 20 + row * 100
        return (
          <g key={i}>
            <Box x={x} y={y} w={120} h={46} t={t} hi={hi} />
            {i < 3 && <line x1={x + 120} y1={y + 23} x2={x + 148} y2={y + 23} stroke={ink} markerEnd="url(#ev-st-a)" />}
            {i > 4 && <line x1={x} y1={y + 23} x2={x - 28} y2={y + 23} stroke={ink} markerEnd="url(#ev-st-a)" />}
          </g>
        )
      })}
      <path d="M528,66 V118" stroke={ink} markerEnd="url(#ev-st-a)" fill="none" />
      <Tx x={320} y={196} t="hardness above alkalinity: lime removes carbonate hardness, soda ash supplies CO₃²⁻ for the non-carbonate hardness" c={mute} />
    </svg>
  )
}

/** bar diagram of a raw water (T07-C split-treatment sample) */
const BarFig: FC = () => {
  const X = (v: number) => 70 + v * 1.25
  const cat: [string, number, number][] = [
    ['Ca²⁺', 0, 238],
    ['Mg²⁺', 238, 328.6],
    ['Na⁺', 328.6, 384.8],
  ]
  const an: [string, number, number][] = [
    ['HCO₃⁻', 0, 198],
    ['Cl⁻', 198, 293.8],
    ['SO₄²⁻', 293.8, 369.8],
  ]
  const row = (arr: [string, number, number][], y: number, cols: string[]) =>
    arr.map(([n, a, b], i) => (
      <g key={n}>
        <rect x={X(a)} y={y} width={(b - a) * 1.25} height={34} fill={cols[i]} opacity={0.35} stroke={ink} />
        <text x={X((a + b) / 2)} y={y + 22} textAnchor="middle" fontSize={12} fontWeight={700} fill={ink}>
          {n}
        </text>
      </g>
    ))
  return (
    <svg viewBox="0 0 600 270" width="100%" role="img" aria-label="Bar diagram of a water: cations above, anions below">
      <text x={8} y={50} fontSize={11.5} fill={ink}>
        cations
      </text>
      <text x={8} y={118} fontSize={11.5} fill={ink}>
        anions
      </text>
      {row(cat, 30, [water, accent2, mute])}
      {row(an, 98, [accent, mute, water])}
      <rect x={X(-12.5)} y={30} width={12.5 * 1.25} height={34} fill="none" stroke={ink} strokeDasharray="3 2" />
      <Tx x={X(-12.5) + 8} y={26} t="CO₂ 12.5" s={10.5} />
      {[0, 100, 198, 238, 300, 328.6, 385].map((v) => (
        <g key={v}>
          <line x1={X(v)} x2={X(v)} y1={64} y2={98} stroke={mute} strokeDasharray="2 3" />
          <Tx x={X(v)} y={82} t={String(v)} s={10} c={mute} />
        </g>
      ))}
      <line x1={X(0)} x2={X(328.6)} y1={160} y2={160} stroke={ink} markerStart="url(#ev-bar-a)" markerEnd="url(#ev-bar-a)" />
      <defs>
        <marker id="ev-bar-a" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={6} markerHeight={6} orient="auto">
          <circle cx={5} cy={5} r={4} fill={ink} />
        </marker>
      </defs>
      <Tx x={X(164)} y={154} t="Total hardness TH = Ca + Mg = 328.6" b />
      <line x1={X(0)} x2={X(198)} y1={180} y2={180} stroke={accent} strokeWidth={3} />
      <Tx x={X(99)} y={198} t="CH = alkalinity = 198" c={accent} b />
      <line x1={X(198)} x2={X(328.6)} y1={180} y2={180} stroke={accent2} strokeWidth={3} />
      <Tx x={X(263)} y={198} t="NCH = 130.6" c={accent2} b />
      <Tx x={300} y={226} t="all values in mg/L as CaCO₃: Ca 0→238, Mg 238→328.6, Na →384.8;  HCO₃ 0→198, Cl →293.8, SO₄ →369.8" s={11} c={mute} />
      <Tx x={300} y={246} t="order: Ca, Mg, Na above; HCO₃, then Cl, then SO₄ below; CO₂ drawn left of zero" s={11} c={mute} />
    </svg>
  )
}

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-soft-obj',
    topic: T,
    title: 'Objectives of lime–soda softening',
    points: [
      { k: 'Reduce soap consumption', alt: ['soap consumption'], d: 'acceptability issue' },
      { k: 'Remove heavy metals, NOM, turbidity and pathogens', alt: ['improve water quality', 'reduce corrosion'], d: 'also less distribution corrosion, boiler and heater scaling' },
      { k: 'Concurrent removal of As, Cr, Fe, Pb, Mn, Hg', alt: ['arsenic chromium iron lead manganese mercury'], d: 'bonus of lime softening' },
    ],
    seen: [],
    src: 'TA T07 p3',
  },
  {
    id: 'l-soft-methods',
    topic: T,
    title: 'Methods of softening',
    points: [
      { k: 'Chemical precipitation', alt: ['lime-soda', 'precipitation softening'] },
      { k: 'Ion exchange', alt: ['cation exchange', 'zeolite'] },
    ],
    seen: [],
    src: 'TA T07 p3',
  },
  {
    id: 'l-soft-limits',
    topic: T,
    title: 'Practical limits in lime–soda softening',
    points: [
      { k: 'Minimum Ca-hardness 30 mg/L as CaCO₃', alt: ['30 mg/L Ca', 'Ca 30'] },
      { k: 'Minimum Mg-hardness 10 mg/L as CaCO₃', alt: ['10 mg/L Mg', 'Mg 10'] },
      { k: 'Remove only Mg above 40 mg/L as CaCO₃', alt: ['Mg > 40', 'Mg removal is expensive'] },
      { k: 'Excess lime 20 mg/L for Ca removal', alt: ['excess lime 20'] },
      { k: 'Excess lime 20 mg/L for Mg 20–40', alt: ['excess 20 for Mg 20-40'] },
      { k: 'Excess lime 40 mg/L for Mg above 40', alt: ['excess 40'] },
      { k: 'Air-strip CO₂ above 10 mg/L (22.7 as CaCO₃)', alt: ['CO2 > 10 mg/L stripping'] },
    ],
    seen: [],
    src: 'TA T07 p6–7',
  },
  {
    id: 'l-soft-dose',
    topic: T,
    title: 'Chemical additions in lime–soda softening (as CaCO₃)',
    ask: 'How is the lime and soda ash dose built up?',
    ordered: true,
    points: [
      { k: 'Lime = CO₂', alt: ['lime equals CO2'], d: 'neutralise H₂CO₃' },
      { k: 'Lime = HCO₃⁻ (alkalinity)', alt: ['lime = bicarbonate', 'lime equals alkalinity'], d: 'raise pH, convert HCO₃⁻ to CO₃²⁻' },
      { k: 'Lime = Mg²⁺ to be removed', alt: ['lime = magnesium'], d: 'raise pH, precipitate Mg(OH)₂' },
      { k: 'Lime = required excess', alt: ['excess lime'], d: 'drive the reactions' },
      { k: 'Soda = non-carbonate hardness removed', alt: ['soda = NCH'], d: 'provide CO₃²⁻' },
    ],
    seen: [],
    src: 'TA T07 p8',
  },
  {
    id: 'l-soft-split-adv',
    topic: T,
    title: 'Advantages of split treatment',
    ask: 'What are the advantages of split treatment in softening?',
    points: [
      { k: 'Water tailored to a desired Mg-hardness', alt: ['desired Mg hardness', 'control Mg-hardness'] },
      { k: 'Reduced capital cost of tankage', alt: ['lower capital cost', 'entire flow need not be treated'], d: 'entire flow need not be treated' },
      { k: 'Minimised chemical cost', alt: ['lower operating cost', 'less chemical'] },
      { k: 'Uses natural alkalinity to lower pH of product', alt: ['natural alkalinity', 'assists stabilization', 'less recarbonation'] },
    ],
    hook: 'T-C-C-A: Tailored Mg, Capital, Chemicals, Alkalinity.',
    seen: ['2017-18', 'Jan 2021', '2021-22'],
    src: 'TA T07 p10',
  },
  {
    id: 'l-soft-co2-src',
    topic: T,
    title: 'Sources of CO₂ for recarbonation',
    points: [
      { k: 'Exhaust from combustion of natural gas', alt: ['flue gas', 'combustion gas'] },
      { k: 'Liquefied CO₂', alt: ['liquid CO2', 'bottled CO2'] },
      { k: 'Recalcination of CaCO₃ sludge', alt: ['recalcification', 'lime recovery'], d: 'needs substantial investment' },
    ],
    seen: [],
    src: 'TA T07 p16',
  },
  {
    id: 'l-soft-basin',
    topic: T,
    title: 'Softening basin practice',
    points: [
      { k: 'Flash mixing G 300–700 s⁻¹, 10–30 s', alt: ['flash mixing'], d: 'radial flow impellers' },
      { k: 'Flocculation G 130–300 s⁻¹, 30–45 min', alt: ['flocculation mixing'], d: 'axial flow impellers / paddles; Gt 200,000–400,000' },
      { k: 'Recycle part of the precipitate', alt: ['sludge recycle', 'solids contact'], d: 'speeds up precipitation' },
    ],
    seen: [],
    src: 'TA T07 p13–14',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-soft-def', topic: T, front: 'Why soften water and what is the rule for a hardness bar diagram?', back: 'To cut soap use and scale. Hardness comes from Ca²⁺ and Mg²⁺; TH = CH + NCH. Bar diagram: cations (Ca, Mg, Na) in one row, anions (HCO₃, Cl, SO₄) in the row below, all in mg/L as CaCO₃; CH ends where HCO₃ ends.', src: 'TA T02 p6, T07 p2' },
  { id: 'c-soft-asCaCO3', topic: T, front: 'Factors to convert mg/L of ion to mg/L as CaCO₃?', back: 'Multiply by 50/(equivalent weight): Ca ×2.5, Mg ×4.115, Na ×2.174, HCO₃ ×0.82, SO₄ ×1.042, Cl ×1.41, CO₂ ×2.27.', src: 'Math procedures' },
  { id: 'c-soft-ph', topic: T, front: 'pH needed to precipitate calcium and magnesium?', back: 'CaCO₃ precipitates at pH about 10.3; Mg(OH)₂ at pH 11–11.3. Lime is always added at least equal to the bicarbonate present, otherwise pH 10.3 is not reached.', seen: ['2010-11', '2016-17'], src: 'TA T07 p5–7' },
  { id: 'c-soft-solub', topic: T, front: 'Solubility of CaCO₃ and Mg(OH)₂ (mg/L as CaCO₃)?', back: 'CaCO₃ 15 and Mg(OH)₂ 17 at 0 °C, which is why they precipitate; the practical limits are higher (Ca 30, Mg 10).', src: 'TA T07 p5' },
  { id: 'c-soft-slaking', topic: T, front: 'What are slaking and the CO₂ reaction in softening?', back: 'CO₂ + Ca(OH)₂ → CaCO₃ ↓ + H₂O: lime first neutralises carbonic acid (class note: CaO + H₂O → Ca(OH)₂ slaking converts quicklime to hydrated lime).', src: 'TA T07 p4' },
  { id: 'c-soft-selective', topic: T, front: 'Selective calcium removal vs removal to practical limits?', back: 'Selective Ca: lime = CO₂ + HCO₃⁻ only (carbonate Ca hardness; Mg > 40 not touched). Practical limits: remove Ca and Mg: lime = CO₂ + HCO₃ + Mg; soda = NCH; final hardness about 40 mg/L (Ca 30 + Mg 10).', src: 'Notes-S p14' },
  { id: 'c-soft-nch', topic: T, front: 'Which chemical removes non-carbonate hardness?', back: 'Soda ash (Na₂CO₃), which supplies CO₃²⁻: Ca²⁺ + Na₂CO₃ → CaCO₃↓ + 2Na⁺. For Mg-NCH, lime first converts Mg to Mg(OH)₂ (releasing Ca²⁺) and soda then removes that Ca.', seen: ['2007-08'], src: 'TA T07 p4' },
  { id: 'c-soft-excess', topic: T, front: 'Why add excess lime?', back: 'Extra lime beyond the stoichiometric amount drives the precipitation of Mg(OH)₂ and gets reasonable hardness removal (20 mg/L for Ca; 20 or 40 for Mg). It leaves Ca²⁺ that recarbonation must remove.', src: 'TA T07 p6–7' },
  { id: 'c-soft-recarb', topic: T, front: 'What is recarbonation and why?', back: 'CO₂ is bubbled into limed water to lower the pH to about 8.4–8.6 and stop precipitation, converting CO₃²⁻ and excess lime to soluble bicarbonate, so that CaCO₃ does not deposit on filter sand and pipes (stabilisation).', seen: ['2008-09', '2015-16', '2022-23'], src: 'TA T07 p15' },
  { id: 'c-soft-recarb-prac', topic: T, front: 'Recarbonation basin practice?', back: 'CO₂ under pressure by submerged burner or diffuser; two chambers: mixing 3–5 min, reaction; total detention about 20 min.', src: 'TA T07 p16' },
  { id: 'c-soft-stab', topic: T, front: 'What is water stabilisation?', back: 'Making treated water neither scale-forming nor corrosive in the distribution system, by adjusting pH (recarbonation) so CaCO₃ saturation is balanced (Langelier / Ryznar index near zero).', seen: ['2022-23'], src: 'TA T07 p15' },
  { id: 'c-soft-split-x', topic: T, front: 'Fraction bypassed in split treatment?', back: '$X=(Mg_f-Mg_i)/(Mg_r-Mg_i)$ with Mg_f = 40 (final), Mg_i = 10 (first stage), Mg_r raw, all as CaCO₃. Treated fraction = 1 − X.', src: 'TA T07 p10' },
  { id: 'c-soft-split-when', topic: T, front: 'When is split treatment usually done?', back: 'When the raw water has high Mg hardness (and so needs a lot of lime) and a Mg-hardness of about 40 mg/L (not zero) in the finished water is acceptable; Mg is removed in the treated part and the bypass blends it back to the desired level.', seen: ['2017-18'], src: 'TA T07 p10 + textbook' },
  { id: 'c-soft-co2strip', topic: T, front: 'When is CO₂ air-stripped instead of removed by lime?', back: 'When CO₂ exceeds 10 mg/L (22.7 mg/L as CaCO₃): stripping is cheaper than spending lime on it. Below 10 mg/L (e.g. 6.6) lime is used.', src: 'TA T07 p7; Notes-S p14' },
  { id: 'c-soft-noalum', topic: T, front: 'Is coagulation needed after lime-soda softening?', back: 'No; the CaCO₃ and Mg(OH)₂ flocs do the sweeping. Slow mixing can be vigorous (G 130–300 s⁻¹) because softening floc is strong.', src: 'Notes-S p13–14' },
  { id: 'c-soft-solids', topic: T, front: 'Why recycle sludge in a softening basin?', back: 'Existing CaCO₃ crystals seed the precipitation, speeding it and making bigger, denser particles (solids-contact upflow clarifier with a sludge blanket).', src: 'TA T07 p13–14' },
  { id: 'c-soft-nonfinal', topic: T, front: 'Finished-water check in split treatment?', back: 'Blended hardness = X × raw hardness + (1 − X) × 40. If it exceeds the allowed range (e.g. 80–120), add a second stage of selective Ca removal (no more Mg removal). Economic analysis decides between a 2nd unit and treating more in the 1st.', src: 'TA T07 p11; split sheet' },
  { id: 'c-soft-vs-ix', topic: T, front: 'Lime-soda vs ion-exchange softening in one line?', back: 'Lime-soda: large chemical sludge, for big plants, no TDS-free water. Ion exchange: no sludge, small plant, near zero hardness (blended), but needs clear water and salt regeneration.', src: 'TA T08 p3' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-soft-nch',
    topic: T,
    q: 'How can calcium non-carbonate hardness be removed from water? Explain with appropriate equation.',
    seen: ['2007-08'],
    a: `### Removal of calcium non-carbonate hardness (CaSO₄, CaCl₂)
1. Non-carbonate hardness has no bicarbonate, so lime alone cannot remove it; **soda ash (Na₂CO₃)** supplies the carbonate ion.
2. **Reaction**: $Ca^{2+} + Na_2CO_3 \\rightleftharpoons CaCO_3(s) + 2Na^+$ (e.g. $CaSO_4 + Na_2CO_3 \\rightarrow CaCO_3\\downarrow + Na_2SO_4$).
3. CaCO₃ is nearly insoluble (15 mg/L) and precipitates at **pH above 10.3**; the lime dose that precedes it provides this pH.
4. **Dose**: soda = non-carbonate hardness removed (as CaCO₃) = (Ca − alkalinity).
5. The precipitate is flocculated, settled and filtered; the water is recarbonated to stop scaling.
6. An alternative is **ion exchange** (Ca²⁺ exchanged for Na⁺ on the resin).`,
    keys: ['soda ash', 'Na₂CO₃', 'CaCO₃', 'pH above 10.3', 'non-carbonate hardness'],
    lists: ['l-soft-dose'],
    src: 'TA T07 p4, p8',
  },
  {
    id: 'a-soft-soda',
    topic: T,
    q: 'Under which environmental conditions is soda ash used and recarbonation required in a precipitation softening process?',
    seen: ['2009-10', '2011-12', '2012-13', '2016-17'],
    a: `### Soda ash is used when…
1. The water has **non-carbonate hardness**: total hardness exceeds alkalinity (Ca or Mg associated with SO₄²⁻, Cl⁻). There is not enough bicarbonate to supply CO₃²⁻.
2. Lime removes only carbonate hardness (and Mg); soda ash = (TH − alkalinity) removed, $Ca^{2+} + Na_2CO_3 \\rightarrow CaCO_3\\downarrow + 2Na^+$.
3. If alkalinity ≥ hardness no soda ash is required.

### Recarbonation is required when…
1. The water has been treated to **high pH** (excess lime, Mg removal at pH 11) or after selective Ca removal (pH about 10.3): the finished water is supersaturated with CaCO₃ and has excess lime.
2. CO₂ lowers the pH to **8.4–8.6**, converts CO₃²⁻ and OH⁻ to HCO₃⁻, and stops CaCO₃ **depositing on filter sand and distribution pipes**.
3. $Ca^{2+}+2OH^-+CO_2\\rightarrow CaCO_3\\downarrow+H_2O$, then $CaCO_3+CO_2+H_2O\\rightarrow Ca^{2+}+2HCO_3^-$.
4. Not needed when split treatment's natural alkalinity brings the pH down enough.`,
    keys: ['non-carbonate hardness', 'alkalinity', 'soda ash', 'high pH', 'excess lime', '8.4–8.6', 'depositing'],
    lists: ['l-soft-dose'],
    src: 'TA T07 p4–8, p15',
  },
  {
    id: 'a-soft-recarb',
    topic: T,
    q: 'What do you mean by recarbonation (and water stabilisation) and when does it become necessary?',
    seen: ['2008-09', '2015-16', '2022-23'],
    a: `### Water stabilisation and recarbonation
1. Water in the distribution system must be **neither scale-forming nor corrosive**. Lime softening leaves water at pH 10.3–11 and supersaturated with CaCO₃ (scale) with excess lime.
2. **Recarbonation** is the addition of **CO₂** (preferred) to lower the pH and **stop the precipitation reaction**, down to **pH 8.4–8.6**.
3. After selective calcium removal: $Ca^{2+}+CO_3^{2-}+CO_2+H_2O\\rightleftharpoons Ca^{2+}+2HCO_3^-$.
4. After excess lime treatment (Ca and Mg removal): $Ca^{2+}+2OH^-+CO_2\\rightleftharpoons CaCO_3\\downarrow+H_2O$; $Mg^{2+}+2OH^-+CO_2\\rightleftharpoons Mg^{2+}+CO_3^{2-}+H_2O$; then $CaCO_3+CO_2+H_2O\\rightleftharpoons Ca^{2+}+2HCO_3^-$.
5. **When necessary**: after lime-soda softening at high pH, before filtration and distribution, to prevent CaCO₃ deposition on sand and pipes (post-precipitation).
6. **Practice**: CO₂ from combustion gas, liquefied CO₂ or recalcination, added under pressure in two chambers (mixing 3–5 min, reaction, total about 20 min).`,
    keys: ['neither scale-forming nor corrosive', 'CO₂', 'stop the precipitation reaction', 'pH 8.4–8.6', 'excess lime', 'distribution'],
    lists: ['l-soft-co2-src'],
    src: 'TA T07 p15–16',
  },
  {
    id: 'a-soft-twostage',
    topic: T,
    q: 'When is recarbonation required, and what are the advantages of two-stage over single-stage recarbonation?',
    seen: ['2015-16'],
    a: `### Two-stage recarbonation
1. **When**: after excess-lime softening (high pH, supersaturated with CaCO₃ and Mg(OH)₂).
2. **Single stage**: all CO₂ is added at once to bring the pH down to about 8.4–8.6; the Mg(OH)₂ and excess lime are neutralised together with the CaCO₃ and the sludge is not removed.
3. **Two stage**: the first CO₂ dose lowers the pH to about 10.3 (excess lime converted to CaCO₃, which is **settled and removed**); the second dose lowers it to **8.4–8.6** for stabilisation.
4. **Advantages of two stage**: CaCO₃ and Mg(OH)₂ sludge is separated before the second dose, so **less CO₂** is needed (no re-dissolving of the precipitate), **less hardness is returned** to the water, finished water is lower in hardness, and the filter load is smaller.`,
    keys: ['Single stage', 'Two stage', 'pH to about 10.3', 'settled and removed', 'less CO₂', 'excess-lime'],
    src: 'textbook (Peavy 6-6, Davis 6-4); two-stage not in the CE22 slides',
  },
  {
    id: 'a-soft-ph-alk',
    topic: T,
    q: 'How do pH value and alkalinity of water affect the precipitation softening process?',
    seen: ['2010-11', '2016-17'],
    a: `### Effect of pH
1. **Ca²⁺** precipitates as CaCO₃ only when pH is raised to about **10.3**, where its solubility is a minimum (about 30 mg/L practical limit).
2. **Mg²⁺** precipitates as Mg(OH)₂ at **pH 11–11.3** (practical limit 10 mg/L), so extra lime (excess) is needed.
3. Lime is always added at least equal to the bicarbonate present, or pH 10.3 is never reached.
4. Final pH is high, so recarbonation to 8.4–8.6 is needed.

### Effect of alkalinity
1. **Alkalinity (HCO₃⁻) = carbonate hardness**: lime alone converts HCO₃⁻ to CO₃²⁻ and removes it.
2. If **alkalinity ≥ total hardness**: only lime (no soda ash) and extra alkalinity is non-hardness.
3. If **alkalinity < total hardness**: non-carbonate hardness remains: **soda ash** is needed to supply CO₃²⁻.
4. High alkalinity means a high lime dose (lime = CO₂ + alkalinity + Mg) and more sludge.
5. Split treatment uses natural alkalinity to bring pH down.`,
    keys: ['10.3', '11–11.3', 'Mg(OH)₂', 'excess', 'Alkalinity', 'soda ash', 'non-carbonate hardness', 'lime'],
    lists: ['l-soft-limits', 'l-soft-dose'],
    src: 'TA T07 p5–8',
  },
  {
    id: 'a-soft-split',
    topic: T,
    q: 'What are the advantages of split treatment in softening? When is it usually done? Show the flow scheme.',
    seen: ['2017-18', 'Jan 2021', '2021-22', '2023-24'],
    a: `### Split treatment
Only part of the raw water is softened to the practical limit (Mg removed); the rest bypasses and is blended back.

### Advantages
1. **Water tailored to the desired Mg-hardness** (blend gives Mg about 40 mg/L as CaCO₃).
2. **Lower capital cost**: the entire flow need not be treated, so smaller tanks.
3. **Minimised chemical cost** (less lime and soda).
4. **Natural alkalinity** of the bypass lowers the pH of the product water and helps stabilisation (less CO₂ for recarbonation).

### When
For waters with **high Mg-hardness** (Mg removal needs much lime) when a residual Mg-hardness of 40 mg/L is acceptable.

### Design
$X=\\dfrac{Mg_f-Mg_i}{Mg_r-Mg_i}$ with Mg_f = 40, Mg_i = 10; bypass XQ, treated (1−X)Q. Lime = (1−X)·lime₁ + X·lime₂; soda = (1−X)·soda₁. If the blend is harder than required, a **second stage** of selective Ca removal (lime only) follows, then **recarbonation**, settling, filtration, disinfection.`,
    keys: ['tailored', 'capital cost', 'chemical cost', 'natural alkalinity', 'high Mg-hardness', 'bypass', 'second stage', 'recarbonation'],
    lists: ['l-soft-split-adv'],
    src: 'TA T07 p10–12; split-treatment sheet',
    Fig: SplitFig,
  },
  {
    id: 'a-soft-flow-lowalk',
    topic: T,
    q: 'Draw the flow diagram of the unit processes for precipitative softening of hard water having lower alkalinity than hardness. Give short notes for your selection.',
    seen: ['2008-09'],
    a: `### Flow diagram (see figure)
Raw water → **rapid mix** (lime + soda ash) → **flocculation** → **sedimentation** (sludge removal) → **recarbonation** (CO₂) → **filtration** → **disinfection** (Cl₂) → storage and distribution.

### Notes
1. **Alkalinity < hardness** means non-carbonate hardness is present, so **lime** (removes CO₂, carbonate hardness and Mg) and **soda ash** (non-carbonate hardness) are both fed.
2. **Rapid mix** (G 300–700 s⁻¹, 10–30 s) disperses the chemicals; **flocculation** (G 130–300 s⁻¹, 30–45 min) grows CaCO₃ and Mg(OH)₂ particles; a solids-contact basin recycles sludge.
3. **Sedimentation** removes the heavy precipitate; no alum coagulation is needed.
4. **Recarbonation** lowers pH from 10.3–11 to 8.4–8.6 so scale does not form.
5. **Filtration** removes the carry-over CaCO₃ crystals and Mg(OH)₂ floc; **chlorine** disinfects and stops growth.
6. If ground water: **aeration** first removes CO₂ (above 10 mg/L), H₂S, and oxidises Fe and Mn.`,
    keys: ['rapid mix', 'flocculation', 'sedimentation', 'recarbonation', 'filtration', 'disinfection', 'soda ash', 'Alkalinity < hardness'],
    lists: ['l-soft-basin'],
    src: 'TA T03 p9, T07 p4–16',
    Fig: SoftTrainFig,
  },
  {
    id: 'a-soft-bar',
    topic: T,
    q: 'Draw the bar diagram of a water (and of the finished water) for a softening problem.',
    seen: ['2021-22'],
    a: `### How Tanvir sir draws a bar diagram
1. Convert every ion to **mg/L as CaCO₃**.
2. **Cations bar** (top): Ca²⁺ first, then Mg²⁺, then Na⁺, marking the cumulative values; **CO₂** is drawn as a block to the left of zero.
3. **Anions bar** (below): HCO₃⁻ first, then Cl⁻ and SO₄²⁻ (this order).
4. **Total hardness** = end of Mg²⁺; **carbonate hardness** = end of HCO₃⁻ (alkalinity) if TH is larger; **non-carbonate hardness** = the part of the Ca/Mg bar beyond it (Ca-NCH = Ca − alkalinity, remaining is Mg).
5. For the **finished water**, redraw with the remaining Ca (30 at practical limit or selective removal value) and Mg (10 or unchanged); shrink HCO₃ accordingly and add the Na⁺ from soda ash.
6. Cations and anions should balance (the printed problems may not be exactly ion-balanced).`,
    keys: ['mg/L as CaCO₃', 'Cations bar', 'Anions bar', 'Total hardness', 'carbonate hardness', 'non-carbonate hardness', 'finished water'],
    src: 'TA T07 p2 + Math §2 (class note sketch)',
    Fig: BarFig,
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
