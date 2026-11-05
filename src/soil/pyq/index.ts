import type { SmQ } from '../types'
import { S2023 } from './papers/s2023'
import { S2021 } from './papers/s2021'
import { S2020 } from './papers/s2020'
import { SJAN21 } from './papers/sjan21'
import { S2017 } from './papers/s2017'
import { S2016 } from './papers/s2016'
import { S2015 } from './papers/s2015'
import { S2012 } from './papers/s2012'
import { S2011 } from './papers/s2011'
import { S2010 } from './papers/s2010'
import { S2009 } from './papers/s2009'
import { S2008 } from './papers/s2008'
import { S2007 } from './papers/s2007'

export const SM_ALL: SmQ[] = [...S2023, ...S2021, ...S2020, ...SJAN21, ...S2017, ...S2016, ...S2015, ...S2012, ...S2011, ...S2010, ...S2009, ...S2008, ...S2007]

export const smQById = (id: string) => SM_ALL.find((q) => q.id === id)
export const smQForTopic = (t: string) => SM_ALL.filter((q) => q.topics.includes(t as never))
export const smQForPaper = (p: string) => SM_ALL.filter((q) => q.paper === p)
