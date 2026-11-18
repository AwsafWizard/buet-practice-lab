// ev-sed — settling / solids separation (Tanvir sir T05). Column analyses and iso-removal numbers live in engine/settle.ts.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-sed' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const water = 'var(--c-water)'
const soil = 'var(--c-soil)'
const accent = 'var(--c-accent)'

const Defs = () => (
  <defs>
    <marker id="ev-sed-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill={ink} />
    </marker>
  </defs>
)

/** ideal sedimentation basin with the critical-particle trajectory */
const IdealBasinFig: FC = () => (
  <svg viewBox="0 0 620 290" width="100%" role="img" aria-label="Ideal sedimentation basin and surface overflow rate">
    <Defs />
    <rect x={40} y={40} width={420} height={140} fill={water} opacity={0.18} stroke={mute} />
    <rect x={40} y={180} width={420} height={22} fill={soil} opacity={0.5} />
    <line x1={140} x2={140} y1={40} y2={180} stroke={mute} strokeDasharray="4 4" />
    <line x1={380} x2={380} y1={40} y2={180} stroke={mute} strokeDasharray="4 4" />
    <text x={90} y={30} textAnchor="middle" fontSize={11.5} fill={ink}>
      inlet zone
    </text>
    <text x={260} y={30} textAnchor="middle" fontSize={11.5} fill={ink}>
      settling zone (L)
    </text>
    <text x={420} y={30} textAnchor="middle" fontSize={11.5} fill={ink}>
      outlet zone
    </text>
    <text x={250} y={196} textAnchor="middle" fontSize={11.5} fill={ink}>
      sludge zone
    </text>
    <line x1={140} y1={46} x2={380} y2={176} stroke={accent} strokeWidth={2.4} markerEnd="url(#ev-sed-a)" />
    <text x={190} y={92} fontSize={11.5} fill={accent} fontWeight={700}>
      critical particle, v₀
    </text>
    <path d="M40,100 H100" stroke={ink} markerEnd="url(#ev-sed-a)" />
    <text x={60} y={92} fontSize={11.5} fill={ink}>
      Q
    </text>
    <line x1={470} x2={470} y1={40} y2={180} stroke={ink} markerStart="url(#ev-sed-a)" markerEnd="url(#ev-sed-a)" />
    <text x={480} y={115} fontSize={11.5} fill={ink}>
      h₀ (depth)
    </text>
    <text x={310} y={230} textAnchor="middle" fontSize={13} fill={ink} fontWeight={700}>
      SOR: v₀ = h₀/t₀ = Q/A (A = L × W)
    </text>
    <text x={310} y={250} textAnchor="middle" fontSize={11.5} fill={mute}>
      v_s ≥ v₀: all removed;  v_s {'<'} v₀: fraction v_s/v₀ removed
    </text>
    <text x={310} y={270} textAnchor="middle" fontSize={11.5} fill={mute}>
      efficiency depends on surface area A, not on depth
    </text>
  </svg>
)

/** plain tank vs inclined plates */
const PlateFig: FC = () => {
  const plates = [0, 1, 2, 3, 4]
  return (
    <svg viewBox="0 0 620 290" width="100%" role="img" aria-label="Plain tank compared with inclined plate settler">
      <Defs />
      <text x={130} y={18} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={ink}>
        Plain tank
      </text>
      <rect x={30} y={30} width={200} height={140} fill={water} opacity={0.18} stroke={mute} />
      <line x1={30} y1={30} x2={230} y2={170} stroke={accent} strokeWidth={2.2} markerEnd="url(#ev-sed-a)" />
      <line x1={242} x2={242} y1={30} y2={170} stroke={ink} markerStart="url(#ev-sed-a)" markerEnd="url(#ev-sed-a)" />
      <text x={252} y={105} fontSize={11.5} fill={ink}>
        H
      </text>
      <text x={130} y={192} textAnchor="middle" fontSize={11.5} fill={mute}>
        particle settles the full depth H
      </text>
      <text x={430} y={18} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={ink}>
        Inclined parallel plates (about 55–60°)
      </text>
      <rect x={290} y={30} width={280} height={140} fill={water} opacity={0.12} stroke={mute} />
      {plates.map((i) => (
        <line key={i} x1={320 + i * 45} y1={165} x2={380 + i * 45} y2={35} stroke={ink} strokeWidth={2.4} />
      ))}
      {plates.slice(0, 4).map((i) => (
        <g key={i}>
          <line x1={340 + i * 45} y1={160} x2={394 + i * 45} y2={110} stroke={accent} strokeWidth={1.8} markerEnd="url(#ev-sed-a)" />
        </g>
      ))}
      <path d="M296,150 H318" stroke={ink} markerEnd="url(#ev-sed-a)" />
      <text x={298} y={142} fontSize={11.5} fill={ink}>
        flow up
      </text>
      <text x={430} y={192} textAnchor="middle" fontSize={11.5} fill={mute}>
        settling distance only h (plate spacing, 5–10 cm)
      </text>
      <text x={310} y={225} textAnchor="middle" fontSize={12.5} fill={ink}>
        effective area = Σ horizontal projections of all plates
      </text>
      <text x={310} y={245} textAnchor="middle" fontSize={12} fill={mute}>
        small footprint, short detention time, laminar flow, sludge slides down plates
      </text>
      <text x={310} y={265} textAnchor="middle" fontSize={12} fill={mute}>
        same Q with much smaller tank: SOR = Q/A is met with a large A in a small plan area
      </text>
    </svg>
  )
}

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-sed-types',
    topic: T,
    title: 'Types of settling in a clarifier',
    ask: 'Name the four types of settling and where each occurs.',
    points: [
      { k: 'Type I: discrete (free) settling', alt: ['discrete settling', 'free settling', 'type 1'], d: 'size, shape, density constant: plain sedimentation, grit chamber' },
      { k: 'Type II: flocculent settling', alt: ['flocculent', 'type 2'], d: 'particles aggregate as they settle: floc after coagulation' },
      { k: 'Type III: zone (hindered) settling', alt: ['hindered settling', 'zone settling', 'type 3'], d: 'secondary clarifiers' },
      { k: 'Type IV: compression settling', alt: ['compression', 'type 4'], d: 'solids thickened at the bottom of secondary clarifiers' },
    ],
    hook: 'Discrete, Flocculent, Hindered, Compression: D-F-H-C, free to squeezed.',
    seen: [],
    src: 'TA T05 p5',
  },
  {
    id: 'l-sed-ideal',
    topic: T,
    title: 'Assumptions of the ideal sedimentation basin',
    points: [
      { k: 'Uniform distribution of particles and velocity across the cross-section', alt: ['uniform distribution', 'uniformly distributed'] },
      { k: 'Liquid moves as an ideal slug (plug flow)', alt: ['plug flow', 'ideal slug'] },
      { k: 'Any particle hitting the bottom is removed', alt: ['particle reaching the bottom is removed'] },
    ],
    seen: [],
    src: 'TA T05 p7',
  },
  {
    id: 'l-sed-design',
    topic: T,
    title: 'Design criteria for sedimentation tanks',
    points: [
      { k: 'Number of units: at least 2', alt: ['multiple units'] },
      { k: 'Overflow rate: 1–2.5 m/h discrete, 0.6–1 m/h flocculent', alt: ['overflow rate'] },
      { k: 'Detention time: 2–4 h discrete, 4–6 h flocculent', alt: ['detention time'] },
      { k: 'Horizontal velocity: 36 m/h discrete, 9 m/h flocculent (max)', alt: ['horizontal velocity'] },
      { k: 'Weir overflow rate: 14 or 6 m³/h per m', alt: ['weir overflow rate', 'weir loading'] },
    ],
    seen: [],
    src: 'TA T05 p15',
  },
  {
    id: 'l-sed-plate-adv',
    topic: T,
    title: 'Advantages of inclined parallel-plate (tube) settlers over a plain settling tank',
    ask: 'What are the advantages of inclined parallel plates separator over a single-storied plain settling tank?',
    points: [
      { k: 'Much larger effective settling area per unit plan area', alt: ['increased surface area', 'large surface area', 'more area'], d: 'effective area = sum of horizontal projections of the plates' },
      { k: 'Short settling distance, so short detention time', alt: ['shorter settling depth', 'less detention time', 'smaller settling depth'], d: 'a particle has to fall only the plate spacing' },
      { k: 'Compact tank, small footprint and capital cost', alt: ['smaller tank', 'less space', 'low cost'], d: 'same Q in a smaller basin' },
      { k: 'Higher overflow rate / loading for same efficiency', alt: ['higher loading rate', 'higher efficiency'] },
      { k: 'Laminar flow conditions', alt: ['low Reynolds number', 'stable laminar flow'], d: 'no short-circuiting or turbulence' },
      { k: 'Sludge slides down the plates', alt: ['self-cleaning'], d: 'continuous sludge removal' },
      { k: 'Can upgrade an existing overloaded basin', alt: ['retrofit'] },
    ],
    seen: ['2008-09', '2010-11', '2011-12', '2015-16', '2016-17'],
    src: 'TA T05 + Notes-I p10 (plate sketch); advantages: textbook (Peavy 6-4)',
    note: 'The CE22 slides only show the plate-settler sketch in the class note; the advantage list is the standard textbook one.',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-sed-colloid', topic: T, front: 'Why do colloids not settle?', back: 'Settling velocity falls with d²: a 0.0001 mm colloid settles at 10⁻⁷ m/s (0.3 m per year); a 0.01 mm silt at 10⁻⁴ m/s. They also carry a negative charge and repel one another, so they must be coagulated first.', src: 'TA T06 p2' },
  { id: 'c-sed-stokes', topic: T, front: 'Stokes’ law for settling velocity?', back: '$v_s = g(\\rho_s-\\rho_w)d^2/(18\\mu)$, valid for Re ≤ 1 (C_D = 24/Re). Velocity rises with the square of the diameter and falls with viscosity (cold water settles slower).', src: 'TA T05 p3' },
  { id: 'c-sed-cd', topic: T, front: 'C_D for the three Reynolds-number ranges?', back: 'Re ≤ 1: 24/Re. 1 < Re < 10⁴: 24/Re + 3/√Re + 0.34. 10⁴ < Re < 10⁵: 0.4. Most particles in water treatment are in the Re ≤ 1 range.', src: 'TA T05 p3' },
  { id: 'c-sed-column', topic: T, front: 'Why use a settling column?', back: 'Stokes’ equation is seldom usable (irregular, flocculating particles), so Camp’s settling column measures settleability directly: v_s = Z₀/t₀, and the fraction at depth Z_p is read from samples.', src: 'TA T05 p4' },
  { id: 'c-sed-sor', topic: T, front: 'What is surface overflow rate (SOR)?', back: '$v_0 = Q/A = h_0/t_0$: the flow per unit surface area; it is the settling velocity of the smallest particle fully removed. It is THE design parameter of a settling basin; typical 1–2.5 m/h (discrete), 0.6–1 m/h (flocculent).', seen: ['2007-08', '2009-10', '2012-13', '2015-16', '2021-22'], src: 'TA T05 p8, p15' },
  { id: 'c-sed-removal', topic: T, front: 'Removal fraction of a particle of settling velocity v_s < v₀?', back: 'v_s/v₀ (= h/h₀), because only particles entering low enough reach the bottom. Total $R=(1-x_0)+\\frac{1}{v_0}\\int_0^{x_0}v\\,dx$ (ideal basin only).', src: 'TA T05 p8–9' },
  { id: 'c-sed-depth', topic: T, front: '"Surface area, not depth, controls removal in plain sedimentation." Why?', back: 'Removal depends on v₀ = Q/A. Doubling the depth doubles the detention time but also doubles the distance a particle must fall, so the fraction removed is unchanged; only a bigger area (lower SOR) improves removal.', seen: ['2009-10'], src: 'TA T05 p7–8' },
  { id: 'c-sed-typeII', topic: T, front: 'How is flocculent (Type II) settling analysed?', back: 'A multi-port column gives % removal at depths and times; iso-removal curves are drawn (steeper with depth). For detention time t₀: $R = r_0 + \\sum \\Delta r\\,Z_i/Z_0$.', src: 'TA T05 p11–13' },
  { id: 'c-sed-rect', topic: T, front: 'Dimensions of a rectangular sedimentation tank?', back: 'L : W = 2:1 to 4:1; W max 12 m; L max 48 m; depth 2.5–3 m (discrete) or 3–4 m (flocculent). Inlet zone with baffles, settling zone, outlet zone with weirs, sludge zone.', src: 'TA T05 p14' },
  { id: 'c-sed-circ', topic: T, front: 'Advantages of a circular settling tank?', back: 'Easier sludge removal and maintenance (centre feed, conical bottom, scraper); excess weir overflow rate is not a problem.', src: 'TA T05 p14' },
  { id: 'c-sed-multiple', topic: T, front: 'Why have at least two sedimentation units?', back: 'So one can be cleaned or repaired while the other runs; good practice for flexibility and reliability.', src: 'TA T05 p15' },
  { id: 'c-sed-presed', topic: T, front: 'When is plain (pre-)sedimentation used?', back: 'For waters with coarse settleable solids (fast rivers, high turbidity in the monsoon), before coagulation or a slow sand filter. Removes larger SS and reduces load, with no chemicals.', src: 'TA T03 p10, T09 p25' },
  { id: 'c-sed-density', topic: T, front: 'How do density and viscosity of water affect settling?', back: 'Settling velocity rises with density difference (ρ_s − ρ_w) and falls as viscosity rises (colder water). Flocculation increases size, so velocity changes during the settling.', src: 'Notes-S p2, p4' },
  { id: 'c-sed-camp', topic: T, front: 'Which settling type applies to plain sedimentation and which to alum floc?', back: 'Plain sedimentation (sand, silt) = Type I discrete. Floc after coagulation = Type II flocculent. Zone and compression types occur only in secondary clarifiers of wastewater treatment.', src: 'TA T05 p5' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-sed-sor',
    topic: T,
    q: 'How does surface overflow rate (SOR) affect the performance of plain sedimentation? Why is surface area, not depth, important? Show with a diagram.',
    seen: ['2007-08', '2009-10', '2012-13', '2015-16', '2021-22'],
    a: `### Surface overflow rate
1. **Definition**: $v_0 = \\dfrac{Q}{A} = \\dfrac{h_0}{t_0}$ (A = surface area of the tank, Q = flow). It is the settling velocity of the **critical particle**, one that enters at the top of the inlet zone and just reaches the bottom at the outlet.
2. **Ideal basin** (uniform velocity and concentration, plug flow, particle reaching the bottom is removed).
3. A particle with $v_s \\ge v_0$ is **completely removed**; one with $v_s < v_0$ is removed in the proportion $v_s/v_0$ (those entering low enough).
4. **Effect on performance**: a lower SOR (larger area for the same Q) lowers $v_0$, so smaller particles are fully removed and **efficiency rises**; a higher SOR lowers efficiency. Total removal $R=(1-x_0)+\\frac{1}{v_0}\\int_0^{x_0}v\\,dx$.
5. **Depth does not matter**: $v_0 = h_0/t_0$; a deeper tank has a longer detention time but the particle must fall farther, so the ratio is unchanged. Only **surface area** (SOR = Q/A) governs removal. Depth only provides sludge and flow volume.
6. **Design**: SOR 1–2.5 m/h for discrete and 0.6–1 m/h for flocculent suspensions; $A = Q/v_0$.`,
    keys: ['critical particle', 'completely removed', 'v_s/v_0', 'surface area', 'Q/A', 'efficiency', 'depth'],
    lists: ['l-sed-ideal', 'l-sed-design'],
    src: 'TA T05 p7–9, p15',
    Fig: IdealBasinFig,
  },
  {
    id: 'a-sed-plate',
    topic: T,
    q: 'What are the advantages of the inclined parallel-plate (tube) separator over a single-storied plain settling tank? Show with a diagram.',
    seen: ['2008-09', '2010-11', '2011-12', '2015-16', '2016-17'],
    a: `### Plate / tube settler
A plain tank removes particles with $v_s \\ge v_0 = Q/A$; one tray of plates is a tank of depth only $h$. Stacking inclined plates (about 55–60°) is like putting many shallow tanks in one footprint.

### Advantages
1. **Large effective settling area**: the sum of horizontal projections of all plates, so SOR = Q/A is met with a much smaller plan area.
2. **Short settling distance**: a particle falls only the plate spacing (5–10 cm), so detention time falls from hours to minutes.
3. **Compact and cheaper**: smaller tank, less land and capital cost.
4. **Higher loading rate** for the same efficiency, so better performance of an overloaded tank (upgrade / retrofit).
5. **Laminar flow** (low Reynolds number), little short-circuiting.
6. **Sludge slides down** the inclined plates into the sludge zone (self-cleaning).
Counter-current flow: water flows up between the plates, solids slide down.`,
    keys: ['effective settling area', 'settling distance', 'Compact', 'loading rate', 'Laminar', 'Sludge slides down', 'detention time'],
    lists: ['l-sed-plate-adv'],
    src: 'TA T05 Notes-I p9–10; textbook (Peavy 6-4)',
    Fig: PlateFig,
  },
  {
    id: 'a-sed-types',
    topic: T,
    q: 'Describe the types of settling met in water and wastewater treatment.',
    seen: [],
    a: `### Types of settling
| Type | Name | Description | Example |
|---|---|---|---|
| I | **Discrete (free)** | size, shape, density constant; velocity constant (Stokes) | plain sedimentation, grit |
| II | **Flocculent** | particles aggregate, grow and speed up as they fall | settling after coagulation |
| III | **Zone (hindered)** | particles so concentrated they settle as a mass with a clear interface | secondary clarifier |
| IV | **Compression** | particles touch; settling by compaction | bottom of thickener |

Type I is analysed with a single sample port (Camp's column); Type II needs a multi-port column and iso-removal curves.`,
    keys: ['Discrete', 'Flocculent', 'Zone', 'Compression', 'iso-removal'],
    lists: ['l-sed-types'],
    src: 'TA T05 p5–6, p11',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
