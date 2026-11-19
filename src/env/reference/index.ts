import type { EvRefItem } from './pane'
import { CHEM_ITEMS } from './chem'
import { TREAT_ITEMS } from './treat'
import { RM_ITEMS } from './rm'
import { SN_ITEMS } from './sn'
import { STEP_ITEMS } from './steps'

export type { EvRefItem }
export const EV_REF_ITEMS: EvRefItem[] = [...CHEM_ITEMS, ...TREAT_ITEMS, ...RM_ITEMS, ...SN_ITEMS, ...STEP_ITEMS]
