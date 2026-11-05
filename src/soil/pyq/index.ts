import type { SmQ } from '../types'
import { SM_PAPERS } from '../types'
import { A2023 } from './ajk/s2023'
import { A2021 } from './ajk/s2021'
import { A2020 } from './ajk/s2020'
import { AJAN21 } from './ajk/sjan21'
import { A2017 } from './ajk/s2017'
import { A2016 } from './ajk/s2016'
import { A2015 } from './ajk/s2015'
import { A2012 } from './ajk/s2012'
import { A2011 } from './ajk/s2011'
import { A2010 } from './ajk/s2010'
import { A2009 } from './ajk/s2009'
import { A2008 } from './ajk/s2008'
import { A2007 } from './ajk/s2007'
import { B2023 } from './sjmy/s2023'
import { B2021 } from './sjmy/s2021'
import { B2020 } from './sjmy/s2020'
import { BJAN21 } from './sjmy/sjan21'
import { B2017 } from './sjmy/s2017'
import { B2016 } from './sjmy/s2016'
import { B2015 } from './sjmy/s2015'
import { B2012 } from './sjmy/s2012'
import { B2011 } from './sjmy/s2011'
import { B2010 } from './sjmy/s2010'
import { B2009 } from './sjmy/s2009'
import { B2008 } from './sjmy/s2008'
import { B2007 } from './sjmy/s2007'

/** question number → sortable key: '5(b)(ii)' → [5, 'b', 'ii'] */
const qKey = (no: string) => {
  const m = no.match(/^(\d+)(.*)$/)
  return { n: m ? +m[1] : 99, rest: m ? m[2] : no }
}
const paperRank = (p: string) => {
  const i = SM_PAPERS.findIndex((x) => x.id === p)
  return i < 0 ? 99 : i
}

/** every past part, newest paper first, then by question number (each half lives in its own file) */
export const SM_ALL: SmQ[] = [...A2023, ...B2023, ...A2021, ...B2021, ...A2020, ...B2020, ...AJAN21, ...BJAN21, ...A2017, ...B2017, ...A2016, ...B2016, ...A2015, ...B2015, ...A2012, ...B2012, ...A2011, ...B2011, ...A2010, ...B2010, ...A2009, ...B2009, ...A2008, ...B2008, ...A2007, ...B2007].sort((a, b) => {
  const pa = paperRank(a.paper) - paperRank(b.paper)
  if (pa) return pa
  const ka = qKey(a.no)
  const kb = qKey(b.no)
  return ka.n - kb.n || ka.rest.localeCompare(kb.rest)
})

export const smQById = (id: string) => SM_ALL.find((q) => q.id === id)
export const smQForTopic = (t: string) => SM_ALL.filter((q) => q.topics.includes(t as never))
export const smQForPaper = (p: string) => SM_ALL.filter((q) => q.paper === p)
