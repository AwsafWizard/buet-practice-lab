import type { TopicId } from '../store'

export interface TopicMeta {
  id: TopicId
  title: string
  short: string
  section: 'B' | 'A' | 'X'
  blurb: string
  hours: number
  color: string
}

// Section letters follow the latest paper (2023-24): A = loads & codes (+ virtual work), B = analysis.
export const TOPICS: TopicMeta[] = [
  { id: 'frames', title: 'Determinate Frames', short: 'Frames', section: 'B', blurb: 'Reactions and SFD / BMD / AFD of frames and beams with internal hinges.', hours: 4, color: '#38bdf8' },
  { id: 'truss', title: 'Truss Analysis', short: 'Truss', section: 'B', blurb: 'Joints & sections, zero-force members, K-trusses, X-braced trusses by approximation.', hours: 5, color: '#22d3ee' },
  { id: 'ild', title: 'Influence Lines', short: 'ILD', section: 'B', blurb: 'Beams with hinges, Müller-Breslau, frames, and maximum effects of moving uniform + roving loads.', hours: 6, color: '#a78bfa' },
  { id: 'floor', title: 'Floor Beam & Girder', short: 'Floor beam', section: 'B', blurb: 'Panel loading: floor-beam reactions, panel shear, panel-point moments, and bridge-truss ILDs.', hours: 6, color: '#c084fc' },
  { id: 'wheel', title: 'Wheel Loads', short: 'Wheel loads', section: 'B', blurb: 'Series of moving concentrated loads: max shear/moment at a section, absolute max moment, max reaction.', hours: 4.5, color: '#f472b6' },
  { id: 'lateral', title: 'Lateral Loads (Portal & Cantilever)', short: 'Lateral loads', section: 'B', blurb: 'Approximate analysis of building frames for wind / earthquake: portal and cantilever methods.', hours: 5, color: '#fb923c' },
  { id: 'vertical', title: 'Vertical Loads (Approximate)', short: 'Vertical loads', section: 'B', blurb: 'Approximate analysis of building frames for gravity loads with 0.1L inflection points.', hours: 1.5, color: '#fbbf24' },
  { id: 'stability', title: 'Stability & Determinacy', short: 'Stability', section: 'A', blurb: 'DOSI, DOKI, statically vs geometrically unstable structures.', hours: 2, color: '#4ade80' },
  { id: 'code', title: 'Building Code & Live Loads', short: 'Building code', section: 'A', blurb: 'Why codes, BNBC 2020 structure, dead / live loads, live load & roof live load reduction.', hours: 2, color: '#34d399' },
  { id: 'wind', title: 'Wind Load (BNBC 2020)', short: 'Wind', section: 'A', blurb: 'Exposure, Kz, Kzt, gust factor, pressures, parapets, enclosure, simplified & analytical procedures.', hours: 8, color: '#2dd4bf' },
  { id: 'eq', title: 'Earthquake Load (BNBC 2020)', short: 'Earthquake', section: 'A', blurb: 'Equivalent static force method: site class, SDC, R, T, Cs, Sa, base shear, storey forces.', hours: 4.5, color: '#f87171' },
  { id: 'vw', title: 'Virtual Work (Deflections)', short: 'Virtual work', section: 'X', blurb: 'Unit-load method for beams, frames and trusses — bending, shear and axial energy, jacks and fabrication errors.', hours: 7.5, color: '#60a5fa' },
  { id: 'cable', title: 'Cables, Suspension Bridges & Arches', short: 'Cables & arches', section: 'X', blurb: 'General cable theorem, parabolic cables, stiffening girders, three-hinged arches.', hours: 3, color: '#94a3b8' },
]

export const topicById = (id: string) => TOPICS.find((t) => t.id === id)

export const SECTION_LABEL = {
  B: 'Analysis — Section B topics',
  A: 'Loads & Codes — Section A topics',
  X: 'Also in past papers',
}
