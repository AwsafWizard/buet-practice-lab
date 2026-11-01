import type { RcQ } from '../types'
import { R2023 } from './papers/r2023'
import { R2021 } from './papers/r2021'
import { R2020 } from './papers/r2020'
import { RJAN21 } from './papers/rjan21'
import { R2017 } from './papers/r2017'
import { R2016 } from './papers/r2016'
import { R2015 } from './papers/r2015'
import { R2014 } from './papers/r2014'
import { R2013 } from './papers/r2013'
import { R2012 } from './papers/r2012'
import { R2011 } from './papers/r2011'
import { R2010 } from './papers/r2010'
import { R2009 } from './papers/r2009'
import { R2008 } from './papers/r2008'
import { R2007 } from './papers/r2007'
import { R2006 } from './papers/r2006'
import { R2005 } from './papers/r2005'
import { R2004 } from './papers/r2004'
import { R2002 } from './papers/r2002'

export const RC_ALL: RcQ[] = [...R2023, ...R2021, ...R2020, ...RJAN21, ...R2017, ...R2016, ...R2015, ...R2014, ...R2013, ...R2012, ...R2011, ...R2010, ...R2009, ...R2008, ...R2007, ...R2006, ...R2005, ...R2004, ...R2002]

export const rcQById = (id: string) => RC_ALL.find((q) => q.id === id)
export const rcQForTopic = (t: string) => RC_ALL.filter((q) => q.topics.includes(t as never))
export const rcQForPaper = (p: string) => RC_ALL.filter((q) => q.paper === p)
