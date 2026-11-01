import type { RcTopicId } from '../store'

export interface RcTopicMeta {
  id: RcTopicId
  title: string
  short: string
  section: 'A' | 'B'
  blurb: string
  hours: number
  color: string
  /** code-pane group shown first on this topic */
  ref: RcRefGroup
}

export type RcRefGroup = 'mat' | 'flex' | 'shear' | 'bond' | 'slab' | 'steps'

// Section letters follow the 2023-24 paper: A = flexure, B = shear, torsion, bond, slabs.
export const RC_TOPICS: RcTopicMeta[] = [
  { id: 'rc-elastic', title: 'Elastic Analysis & WSD', short: 'Elastic & WSD', section: 'A', blurb: 'Uncracked and cracked transformed sections, Mcr, service stresses, allowable moment, the three loading stages.', hours: 2.5, color: '#f59e0b', ref: 'flex' },
  { id: 'rc-singly', title: 'Singly Reinforced Beams (USD)', short: 'Singly (USD)', section: 'A', blurb: 'Stress block, ρb / ρmax / ρmin, φ from εt, review φMn and design As (or b × d) for Mu.', hours: 2, color: '#fb923c', ref: 'flex' },
  { id: 'rc-doubly', title: 'Doubly Reinforced Beams', short: 'Doubly', section: 'A', blurb: 'Does A′s yield? Review and design with b × h fixed; the quadratic for c when it does not.', hours: 2.5, color: '#ef4444', ref: 'flex' },
  { id: 'rc-tbeam', title: 'T- and L-Beams', short: 'T / L beams', section: 'A', blurb: 'Effective flange width, a ≤ hf or true T, Asf + Asw, the negative-moment section at a support.', hours: 1.5, color: '#e879f9', ref: 'flex' },
  { id: 'rc-basics', title: 'Basics, Loads & Safety', short: 'Basics & safety', section: 'A', blurb: 'Why reinforced concrete, USD vs WSD, load factors and φ, cover, floor systems, serviceability.', hours: 1, color: '#a3a3a3', ref: 'mat' },
  { id: 'rc-shear', title: 'Shear & Diagonal Tension', short: 'Shear', section: 'B', blurb: 'Vc, φVc/2, the class Case A–D table, stirrup spacing zones and the layout sketch.', hours: 2.5, color: '#22d3ee', ref: 'shear' },
  { id: 'rc-torsion', title: 'Torsion (threshold check)', short: 'Torsion', section: 'B', blurb: 'Equilibrium vs compatibility torsion, Acp and pcp, Tcr and the threshold torsion that can be neglected.', hours: 0.75, color: '#2dd4bf', ref: 'shear' },
  { id: 'rc-bond', title: 'Bond, Anchorage & Detailing', short: 'Bond & detailing', section: 'B', blurb: 'ld (simplified + general), ψ factors, hooks, compression bars, splices, bar cut-off and bend points.', hours: 2.5, color: '#4ade80', ref: 'bond' },
  { id: 'rc-oneway', title: 'One-way Slabs', short: 'One-way slabs', section: 'B', blurb: 'Minimum thickness, ACI coefficients, cantilever live-load patterns, T&S steel, cranked-bar layout.', hours: 2.5, color: '#60a5fa', ref: 'slab' },
  { id: 'rc-twoway', title: 'Two-way Slabs (coefficient method)', short: 'Two-way slabs', section: 'B', blurb: 'Edge cases 1–9, Tables 12.3–12.6, middle and column strips, corner reinforcement, load on beams.', hours: 3, color: '#a78bfa', ref: 'slab' },
]

export const rcTopicById = (id: string) => RC_TOPICS.find((t) => t.id === id)

export const RC_SECTION_LABEL = {
  A: 'Section A — flexure',
  B: 'Section B — shear, bond & slabs',
}
