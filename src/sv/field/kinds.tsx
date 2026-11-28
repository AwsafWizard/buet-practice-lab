// Every field-book sheet kind: its blank data, the seniors' example, and the editor.
import type { ComponentType } from 'react'
import type { SvTopicId } from '../../store'
import { chainBlank, chainSample, ChainSheet } from './ChainSheet'
import { levelBlank, levelSample, LevelSheet } from './LevelSheet'
import { traverseBlank, traverseSample, TraverseSheet } from './TraverseSheet'
import { stadiaBlank, stadiaSample, StadiaSheet } from './StadiaSheet'
import { heightBlank, heightSample, HeightSheet } from './HeightSheet'
import { contourBlank, contourSample, ContourSheet } from './ContourSheet'
import { curveBlank, curveSample, CurveSheet } from './CurveSheet'
import { houseBlank, houseSample, HouseSheet } from './HouseSheet'
import { routeBlank, routeSample, RouteSheet } from './RouteSheet'
import { bearingBlank, bearingSample, BearingSheet } from './BearingSheet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Editor = ComponentType<{ data: any; set: (d: any) => void }>

export interface SheetKind {
  kind: string
  label: string
  topic: SvTopicId
  /** one line: what the sheet computes */
  does: string
  blank: () => unknown
  /** worked example from the seniors' reports / the lecture sheet */
  sample?: () => unknown
  sampleNote?: string
  Editor: Editor
  /** the name printed on the drawing's title block */
  sheetTitle: string
}

export const KINDS: SheetKind[] = [
  { kind: 'chain', label: 'Chain survey', topic: 'sv-chain', sheetTitle: 'CHAIN SURVEYING', does: 'triangle from its sides, offsets, check lines vs plot, field-book pages', blank: chainBlank, sample: chainSample, sampleNote: '18-batch (Nafim, Group 17): AB 130 ft, BC 62 ft, CA 100 ft', Editor: ChainSheet },
  { kind: 'level', label: 'Level book', topic: 'sv-level', sheetTitle: 'LEVELLING', does: 'rise & fall + HI, book checks, profile and cross-sections', blank: levelBlank, sample: levelSample, sampleNote: '18-batch level book (Nafim): BM 100, two set-ups, cross-sections at 0, 20, 40, 60 m', Editor: LevelSheet },
  { kind: 'bearing', label: 'Compass traverse', topic: 'sv-compass', sheetTitle: 'COMPASS TRAVERSE', does: 'fore & back bearings → local attraction, corrected bearings, included angles', blank: bearingBlank, sample: bearingSample, sampleNote: 'textbook-style example with local attraction at two stations', Editor: BearingSheet },
  { kind: 'traverse', label: 'Closed traverse', topic: 'sv-traverse', sheetTitle: 'CLOSED TRAVERSE', does: 'angle check → bearings → lat/dep → Bowditch → coordinates → area (acres, decimals)', blank: traverseBlank, sample: traverseSample, sampleNote: '18-batch pentagon (Nafim): sides 16, 17, 18, 19, 15.9 m', Editor: TraverseSheet },
  { kind: 'stadia', label: 'Stadia survey', topic: 'sv-stadia', sheetTitle: 'STADIA SURVEY', does: 'K and C from known distances, then distance, RL and plot of every staff position', blank: stadiaBlank, sample: stadiaSample, sampleNote: '18-batch stadia (Nafim): K = 100, C = 0, 25 staff positions', Editor: StadiaSheet },
  { kind: 'height', label: 'Height & distance', topic: 'sv-height', sheetTitle: 'HEIGHT AND DISTANCE PROBLEM', does: 'inaccessible tower, aerial distance, space-triangle area (Heron)', blank: heightBlank, sample: heightSample, sampleNote: '18-batch space triangle (Nafim): AB = 30 m, three buildings, in the lecture sheet’s angles', Editor: HeightSheet },
  { kind: 'house', label: 'House setting', topic: 'sv-house', sheetTitle: 'HOUSE SETTING', does: 'centre-line grid → footing and trench pegs, diagonals for squaring', blank: houseBlank, sample: houseSample, sampleNote: 'this year’s plan (lecture sheet): grids 14′-10″ + 18′-10″ by 13′-10″ + 15′-10″, F1 5′-4″ square', Editor: HouseSheet },
  { kind: 'curve', label: 'Curve setting', topic: 'sv-curve', sheetTitle: 'CURVE SETTING', does: 'R, h, Lₜ, Sₐ, shift, tangent length, chainages, deflection tables, checks', blank: curveBlank, sample: curveSample, sampleNote: 'the class problem sheet: Δ 29.33°, 32 mph, h/b 0.15, b 9 ft, 1 in 50, PI 1662 ft', Editor: CurveSheet },
  { kind: 'contour', label: 'Contour grid', topic: 'sv-contour', sheetTitle: 'CONTOUR SURVEY', does: 'grid readings from two set-ups → RLs → contour map (≥ 7 lines)', blank: contourBlank, sample: contourSample, sampleNote: 'a 7 × 7 grid at 5 m like the 18-batch sheet (readings made up for practice)', Editor: ContourSheet },
  { kind: 'route', label: 'Route project', topic: 'sv-route', sheetTitle: 'ROUTE PROJECT SURVEY', does: 'alignment of 3 straights, CL + cross levels, details strip, profile', blank: routeBlank, sample: routeSample, sampleNote: 'a worked 3 × 50 m alignment (made-up readings for practice)', Editor: RouteSheet },
]

export const kindOf = (k: string) => KINDS.find((x) => x.kind === k)
export const kindsFor = (topic: string) => KINDS.filter((k) => k.topic === topic)
