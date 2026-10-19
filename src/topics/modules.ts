import type { FC } from 'react'
import type { PYQ } from '../pyq/types'
import type { TopicId } from '../store'

export interface TopicModule {
  Overview: FC
  Approach: FC
  Lab: FC
  problems: PYQ[]
}

export const MODULES: Record<TopicId, () => Promise<TopicModule>> = {
  frames: () => import('./frames').then((m) => m.default),
  truss: () => import('./truss').then((m) => m.default),
  ild: () => import('./ild').then((m) => m.default),
  floor: () => import('./floor').then((m) => m.default),
  wheel: () => import('./wheel').then((m) => m.default),
  lateral: () => import('./lateral').then((m) => m.default),
  vertical: () => import('./vertical').then((m) => m.default),
  stability: () => import('./stability').then((m) => m.default),
  code: () => import('./code').then((m) => m.default),
  wind: () => import('./wind').then((m) => m.default),
  eq: () => import('./eq').then((m) => m.default),
  vw: () => import('./vw').then((m) => m.default),
  cable: () => import('./cable').then((m) => m.default),
}
