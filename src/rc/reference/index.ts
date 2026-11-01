import type { RcRefItem } from './pane'
import { BOND_ITEMS } from './bond'
import { FLEX_ITEMS } from './flex'
import { FLEXA_ITEMS } from './flexA'
import { MAT_ITEMS } from './mat'
import { SHEAR_ITEMS } from './shear'
import { SLAB_ITEMS } from './slab'
import { STEP_ITEMS } from './steps'

export type { RcRefItem }
export const RC_REF_ITEMS: RcRefItem[] = [...MAT_ITEMS, ...FLEXA_ITEMS, ...FLEX_ITEMS, ...SHEAR_ITEMS, ...BOND_ITEMS, ...SLAB_ITEMS, ...STEP_ITEMS]
