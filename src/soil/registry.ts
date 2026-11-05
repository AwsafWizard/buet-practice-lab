import type { SmTopicId } from '../store'

export interface SmTopicMeta {
  id: SmTopicId
  title: string
  short: string
  /** A = AJK sir's half, B = SJMY sir's half (the 2023-24 layout) */
  section: 'A' | 'B'
  blurb: string
  hours: number
  color: string
  /** chart-pane group shown first on this topic */
  ref: SmRefGroup
}

export type SmRefGroup = 'idx' | 'str' | 'lep' | 'wat' | 'con' | 'sd' | 'steps'

export const SM_TOPICS: SmTopicMeta[] = [
  { id: 'sm-wv', title: 'Weight–Volume & Relative Density', short: 'Weight–volume', section: 'A', blurb: 'The three-phase diagram, e, n, S, w and the unit weights, Se = wGs, relative density, sand cone.', hours: 2, color: '#84cc16', ref: 'idx' },
  { id: 'sm-plast', title: 'Plasticity & Consistency', short: 'Plasticity', section: 'A', blurb: 'Atterberg limits by cup and fall cone, flow curve, PI, LI, consistency and toughness, shrinkage limit.', hours: 2, color: '#eab308', ref: 'idx' },
  { id: 'sm-class', title: 'Soil Classification', short: 'Classification', section: 'A', blurb: 'Grading curve, Cu and Cc, USCS symbol and group name, AASHTO group and group index, USDA triangle.', hours: 3, color: '#f97316', ref: 'idx' },
  { id: 'sm-struct', title: 'Soil Structure, Mineralogy & Origin', short: 'Structure & minerals', section: 'A', blurb: 'Single-grained, honeycomb, flocculated and dispersed structures; kaolinite, illite, montmorillonite; soil deposits.', hours: 1, color: '#a8a29e', ref: 'idx' },
  { id: 'sm-shear', title: 'Shear Strength', short: 'Shear strength', section: 'A', blurb: 'Mohr circle and pole, Mohr–Coulomb, direct shear, triaxial CD / CU / UU, unconfined, vane, pore-pressure parameters.', hours: 5, color: '#ef4444', ref: 'str' },
  { id: 'sm-lep', title: 'Lateral Earth Pressure', short: 'Earth pressure', section: 'A', blurb: 'At-rest, Rankine active and passive, tension crack, layers, water table and surcharge, force and overturning moment.', hours: 4, color: '#d946ef', ref: 'lep' },
  { id: 'sm-comp', title: 'Compaction & Earthwork', short: 'Compaction', section: 'B', blurb: 'Proctor curves, zero-air-void line, relative compaction, field control, rollers, borrow-pit and truck problems.', hours: 2.5, color: '#22c55e', ref: 'wat' },
  { id: 'sm-perm', title: 'Permeability & Capillarity', short: 'Permeability', section: 'B', blurb: 'Darcy, constant and falling head, layered deposits, pumping tests, seepage velocity, capillary rise.', hours: 1.5, color: '#06b6d4', ref: 'wat' },
  { id: 'sm-seep', title: 'Effective Stress, Seepage & Flow Nets', short: 'Seepage & flow nets', section: 'B', blurb: 'σ′ = σ − u with and without flow, quick condition, excavation heave, flow nets, piping, heave, uplift, filters.', hours: 4.5, color: '#3b82f6', ref: 'wat' },
  { id: 'sm-consol', title: 'Consolidation & Settlement', short: 'Consolidation', section: 'B', blurb: 'e–log p, NC and OC settlement, pc′ and field curves, Terzaghi theory, Tv–U, cv fitting, secondary, sand drains.', hours: 5.5, color: '#8b5cf6', ref: 'con' },
  { id: 'sm-stress', title: 'Stress Distribution', short: 'Stress distribution', section: 'B', blurb: 'Boussinesq point, line and strip loads, embankments (Osterberg), circles, rectangles (Fadum), Newmark chart, 2:1.', hours: 3.5, color: '#14b8a6', ref: 'sd' },
]

export const smTopicById = (id: string) => SM_TOPICS.find((t) => t.id === id)

export const SM_SECTION_LABEL = {
  A: 'Section A — AJK sir',
  B: 'Section B — SJMY sir',
}
