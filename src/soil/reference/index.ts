import type { SmRefItem } from './pane'
import { IDX_ITEMS } from './idx'
import { STR_ITEMS } from './str'
import { LEP_ITEMS } from './lep'
import { WAT_ITEMS } from './wat'
import { CON_ITEMS } from './con'
import { SD_ITEMS } from './sd'
import { STEP_ITEMS } from './steps'

export type { SmRefItem }
export const SM_REF_ITEMS: SmRefItem[] = [...IDX_ITEMS, ...STR_ITEMS, ...LEP_ITEMS, ...WAT_ITEMS, ...CON_ITEMS, ...SD_ITEMS, ...STEP_ITEMS]
