import type { RefItem } from './common'
import { EQ_ITEMS } from './eq'
import { LOAD_ITEMS } from './loads'
import { VW_ITEMS } from './vw'
import { WIND_ITEMS } from './wind'

export type { RefItem }
export const REF_ITEMS: RefItem[] = [...WIND_ITEMS, ...EQ_ITEMS, ...LOAD_ITEMS, ...VW_ITEMS]
