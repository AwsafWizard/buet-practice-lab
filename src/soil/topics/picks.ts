// every topic's "Which one?" skills, for the drill tests
import type { PickSkill } from '../components/PickDrill'
import { WV_PICKS } from './wv/picks'
import { PLAST_PICKS } from './plast/picks'
import { CLASS_PICKS } from './class/picks'
import { STRUCT_PICKS } from './struct/picks'
import { SHEAR_PICKS } from './shear/picks'
import { LEP_PICKS } from './lep/picks'
import { COMP_PICKS } from './comp/picks'
import { PERM_PICKS } from './perm/picks'
import { SEEP_PICKS } from './seep/picks'
import { CONSOL_PICKS } from './consol/picks'
import { STRESS_PICKS } from './stress/picks'

export const SM_PICKS: Record<string, PickSkill[]> = { WV_PICKS, PLAST_PICKS, CLASS_PICKS, STRUCT_PICKS, SHEAR_PICKS, LEP_PICKS, COMP_PICKS, PERM_PICKS, SEEP_PICKS, CONSOL_PICKS, STRESS_PICKS }
