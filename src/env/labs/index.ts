// Interactive labs for the number-type topics (intuition first, then exam-style problems).
// A lab is a file named after its topic, `labs/ev-<topic>.tsx`, default-exporting a component; it is picked up
// here automatically (lazy), so lab authors never edit this file. A topic without a lab file has no Lab tab.
import { lazy, type FC, type LazyExoticComponent } from 'react'
import type { EvTopicId } from '../types'

const files = import.meta.glob<{ default: FC }>('./ev-*.tsx')

export const EV_LABS: Partial<Record<EvTopicId, LazyExoticComponent<FC>>> = {}
for (const [path, load] of Object.entries(files)) {
  const id = path.slice(2, -4) as EvTopicId
  EV_LABS[id] = lazy(load)
}

/** what each lab is called on the tab and on the overview */
export const EV_LAB_TITLE: Partial<Record<EvTopicId, string>> = {
  'ev-wq': 'Water chemistry bench',
  'ev-sed': 'Settling column',
  'ev-coag': 'Coagulant dose & alkalinity',
  'ev-soft': 'Softening bench',
  'ev-ix': 'Ion-exchange softener',
  'ev-dis': 'Breakpoint chlorination',
  'ev-gw': 'Cone of depression',
  'ev-well': 'Tubewell designer',
  'ev-dist': 'Network designer',
  'ev-pop': 'Population forecaster',
  'ev-demand': 'Demand & fire flow',
  'ev-pump': 'Pump & pipeline',
  'ev-rwh': 'Rainwater tank',
  'ev-trans': 'Water hammer',
}
