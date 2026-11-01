// Shared (pure, React-free) pieces of the "Design problems" generators used by the singly, doubly and elastic
// labs: seeded random helpers (same xorshift as labs/common), the problem / step / figure types.
// Every number in a generated problem comes from the rc engines; this file only holds the shapes.

import type { SolStep } from '../../engine/elastic'

export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 1_000_000) / 1_000_000
  }
}
export const pick = <T>(r: () => number, arr: readonly T[]) => arr[Math.floor(r() * arr.length)]
export const randInt = (r: () => number, lo: number, hi: number, step = 1) => lo + step * Math.floor(r() * ((hi - lo) / step + 1))
/** random value on a grid, rounded clean (avoids 1.2000000002) */
export const randStep = (r: () => number, lo: number, hi: number, step: number) => Math.round(randInt(r, lo, hi, step) * 1000) / 1000

export type Diff = 'easy' | 'exam' | 'hard'
export const DIFFS: { v: Diff; label: string }[] = [
  { v: 'easy', label: 'Easy' },
  { v: 'exam', label: 'Exam' },
  { v: 'hard', label: 'Hard' },
]

/** one checkpoint: a number (Answer) or a choice (Choice) */
export interface DStep {
  key: string
  /** group heading shown above the first step of each group */
  group: string
  label: string
  value?: number
  unit?: string
  digits?: number
  tol?: number
  choice?: { options: { v: string; label: string }[]; answer: string }
}

export interface BeamFigSpec {
  support: 'ss' | 'cant' | 'fixed' | 'overhang'
  /** main span (ft) */
  span: number
  /** overhang length (ft) for 'overhang' */
  over?: number
  /** UDL label, e.g. "DL 1.5 k/ft (excl. self-wt), LL 1.2 k/ft" */
  udl: string
  /** point loads: x in ft from the left end (cantilever: from the fixed end) */
  points?: { x: number; label: string }[]
}

export interface SectionSpec {
  b: number
  h: number
  /** depths of bar rows from the top (drawn as placeholders when not yet designed) */
  rows?: { d: number; n: number; db: number }[]
  /** tension at the top (cantilever / support moment): draw rows from the bottom up */
  flip?: boolean
  tag?: string
}

export interface SolSec {
  title: string
  steps: SolStep[]
}

export interface DProblem<F extends string = string> {
  family: F
  title: string
  /** markdown statement */
  text: string
  beam?: BeamFigSpec
  /** section shown with the statement (only what is given) */
  section?: SectionSpec
  /** final section with the chosen bars (shown in the solution) */
  final?: SectionSpec
  steps: DStep[]
  sol: SolSec[]
  /** short closing line (the answer in words) */
  answer: string
}

/** builds the step list with a running group heading */
export function stepper() {
  const steps: DStep[] = []
  let group = ''
  return {
    steps,
    group(g: string) {
      group = g
    },
    num(key: string, label: string, value: number, unit?: string, o: { digits?: number; tol?: number } = {}) {
      steps.push({ key, group, label, value, unit, ...o })
    },
    choice(key: string, label: string, options: { v: string; label: string }[], answer: string) {
      steps.push({ key, group, label, choice: { options, answer } })
    },
  }
}

/** retry a generator draw until `ok`, falling back to the last draw */
export function retry<T>(r: () => number, draw: (r: () => number) => T, ok: (t: T) => boolean, n = 60): T {
  let t = draw(r)
  for (let i = 0; i < n && !ok(t); i++) t = draw(r)
  return t
}
