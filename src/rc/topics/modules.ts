import type { RcTopicId } from '../../store'
import type { RcTopicModule } from '../types'

export const RC_MODULES: Record<RcTopicId, () => Promise<RcTopicModule>> = {
  'rc-basics': () => import('./basics').then((m) => m.default),
  'rc-elastic': () => import('./elastic').then((m) => m.default),
  'rc-singly': () => import('./singly').then((m) => m.default),
  'rc-doubly': () => import('./doubly').then((m) => m.default),
  'rc-tbeam': () => import('./tbeam').then((m) => m.default),
  'rc-shear': () => import('./shear').then((m) => m.default),
  'rc-torsion': () => import('./torsion').then((m) => m.default),
  'rc-bond': () => import('./bond').then((m) => m.default),
  'rc-oneway': () => import('./oneway').then((m) => m.default),
  'rc-twoway': () => import('./twoway').then((m) => m.default),
}
