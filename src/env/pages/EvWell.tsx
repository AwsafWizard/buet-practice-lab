// Memory Well: every recall drill over the whole course, or one teacher's half, or one topic.
import { useState } from 'react'
import { GYM_SCOPES, GymLab } from '../components/LabPanel'

const KEY = 'ce331:wellScope'

export default function EvWell() {
  const [scope, setScope] = useState(() => {
    try {
      return localStorage.getItem(KEY) ?? 'all'
    } catch {
      return 'all'
    }
  })
  const pick = (v: string) => {
    setScope(v)
    try {
      localStorage.setItem(KEY, v)
    } catch {
      /* storage blocked */
    }
  }
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">🪣 Memory Well</h1>
      <p className="text-sm text-mute mb-4">
        Draw up what you know. Flashcards first (what’s due, then new cards, most-asked first), then type the lists from memory, put the steps and flow diagrams in order, fill the blanks, and blurt whole answers. Everything you miss comes back sooner. The numbers live in each topic’s Lab.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {GYM_SCOPES.map((s, i) => (
          <button key={s.v} className={'btn !py-0.5 !px-2.5 !text-xs ' + (scope === s.v ? '!border-accent text-accent' : '') + (i === 4 ? ' ml-2' : '')} onClick={() => pick(s.v)}>
            {s.label}
          </button>
        ))}
      </div>
      <GymLab key={scope} scope={scope} />
    </div>
  )
}
