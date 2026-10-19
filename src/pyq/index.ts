import type { PYQ } from './types'
import { Q2007 } from './papers/p2007'
import { Q2008 } from './papers/p2008'
import { Q2009 } from './papers/p2009'
import { Q2010 } from './papers/p2010'
import { Q2011 } from './papers/p2011'
import { Q2012 } from './papers/p2012'
import { Q2015 } from './papers/p2015'
import { Q2016 } from './papers/p2016'
import { Q2019 } from './papers/p2019'
import { Q2020 } from './papers/p2020'
import { Q2021 } from './papers/p2021'
import { Q2022 } from './papers/p2022'
import { Q2023 } from './papers/p2023'

export const ALL_PYQ: PYQ[] = [...Q2023, ...Q2022, ...Q2021, ...Q2020, ...Q2019, ...Q2016, ...Q2015, ...Q2012, ...Q2011, ...Q2010, ...Q2009, ...Q2008, ...Q2007]

export const pyqById = (id: string) => ALL_PYQ.find((q) => q.id === id)
export const pyqForTopic = (t: string) => ALL_PYQ.filter((q) => q.topics.includes(t as never))
export const pyqForPaper = (p: string) => ALL_PYQ.filter((q) => q.paper === p)
