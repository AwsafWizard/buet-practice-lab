import type { SmTopicId } from '../../store'
import type { SmTopicModule } from '../types'

export const SM_MODULES: Record<SmTopicId, () => Promise<SmTopicModule>> = {
  'sm-wv': () => import('./wv').then((m) => m.default),
  'sm-plast': () => import('./plast').then((m) => m.default),
  'sm-class': () => import('./class').then((m) => m.default),
  'sm-struct': () => import('./struct').then((m) => m.default),
  'sm-shear': () => import('./shear').then((m) => m.default),
  'sm-lep': () => import('./lep').then((m) => m.default),
  'sm-comp': () => import('./comp').then((m) => m.default),
  'sm-perm': () => import('./perm').then((m) => m.default),
  'sm-seep': () => import('./seep').then((m) => m.default),
  'sm-consol': () => import('./consol').then((m) => m.default),
  'sm-stress': () => import('./stress').then((m) => m.default),
}
