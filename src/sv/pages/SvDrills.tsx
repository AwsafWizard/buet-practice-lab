// Maths drills: pick a kind of sum (or "mixed"), answer, check, see the worked steps, get a fresh one.
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Md } from '../../components/ui'
import { useStore } from '../../store'
import { parseDMS, fmtDMS } from '../engine/angle'
import { DRILLS, drillsFor, rng, type DrillAnswer, type DrillGen } from '../drills/gens'
import { SvTopicIcon } from '../components/icons'
import { SV_TOPICS, svTopicById } from '../registry'

export default function SvDrills() {
  const [params] = useSearchParams()
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Maths drills</h1>
        <p className="text-mute text-sm mt-1 max-w-3xl">
          The short sums of the daily assessments and the quizzes — chainage, tape corrections, bearings, rise & fall, latitudes and departures, closing error, stadia constants, tower height, curve elements, contour interpolation. Every “New numbers” makes a fresh one; angles can be typed as <span className="num">35 30 15</span>.
        </p>
      </div>
      <DrillDeck topic={params.get('topic') ?? undefined} />
    </div>
  )
}

export function DrillDeck({ topic, lock }: { topic?: string; lock?: boolean }) {
  const [sel, setSel] = useState<string>(topic ?? '')
  const pool = drillsFor(sel || undefined)
  const [gid, setGid] = useState<string>('')
  const gen = pool.find((g) => g.id === gid) ?? pool[0]
  const topics = SV_TOPICS.filter((t) => DRILLS.some((d) => d.topic === t.id))
  if (!pool.length) return <div className="text-sm text-faint">No drills for this topic — its maths lives in the field-book sheet.</div>
  return (
    <div className="space-y-4">
      {!lock && (
        <div className="flex flex-wrap gap-1.5">
          <button className={'rounded-lg border px-2.5 py-1.5 text-xs font-semibold ' + (!sel ? 'border-accent bg-accent/10' : 'border-line')} onClick={() => (setSel(''), setGid(''))}>
            All · {DRILLS.length}
          </button>
          {topics.map((t) => (
            <button key={t.id} className={'rounded-lg border px-2.5 py-1.5 text-xs flex items-center gap-1.5 ' + (sel === t.id ? 'border-accent bg-accent/10' : 'border-line hover:border-accent')} onClick={() => (setSel(t.id), setGid(''))}>
              <SvTopicIcon id={t.id} color={t.color} size={14} />
              {t.short} <span className="num text-faint">{drillsFor(t.id).length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {pool.map((g) => (
          <button key={g.id} className={'chip !text-xs cursor-pointer ' + (gen.id === g.id ? '!border-accent text-accent' : 'hover:text-ink')} onClick={() => setGid(g.id)}>
            {g.title}
          </button>
        ))}
        <button className="chip !text-xs cursor-pointer hover:text-ink" onClick={() => setGid(pool[Math.floor(Math.random() * pool.length)].id)}>
          🎲 surprise me
        </button>
      </div>
      <DrillCard key={gen.id} gen={gen} />
    </div>
  )
}

function ok(a: DrillAnswer, typed: string) {
  const v = a.angle ? parseDMS(typed) : Number(typed.replace(/,/g, '').trim())
  if (!typed.trim() || !isFinite(v)) return false
  const tol = Math.max(Math.abs(a.value) * (a.tol ?? 0.005), a.abs ?? 1e-9)
  return Math.abs(v - a.value) <= tol
}

function show(a: DrillAnswer) {
  if (a.angle) return fmtDMS(a.value)
  const abs = Math.abs(a.value)
  const dp = abs >= 1000 ? 1 : abs >= 100 ? 2 : abs >= 1 ? 3 : 4
  return +a.value.toFixed(dp) + (a.unit ? ' ' + a.unit : '')
}

function DrillCard({ gen }: { gen: DrillGen }) {
  const record = useStore((s) => s.record)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9))
  const d = useMemo(() => gen.make(rng(seed)), [gen, seed])
  const [typed, setTyped] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [reveal, setReveal] = useState(false)
  const t = svTopicById(gen.topic)
  const fresh = () => {
    setSeed(Math.floor(Math.random() * 1e9))
    setTyped([])
    setChecked(false)
    setReveal(false)
  }
  const check = () => {
    setChecked(true)
    const all = d.answers.every((a, i) => ok(a, typed[i] ?? ''))
    record(`${gen.topic}:drill:${gen.id}`, all, gen.topic)
    if (all) setReveal(true)
  }
  return (
    <div className="card p-5 max-w-3xl">
      <div className="flex items-center gap-2 text-[11px] mb-2">
        {t && (
          <span className="chip" style={{ color: t.color }}>
            {t.short}
          </span>
        )}
        <span className="chip">{gen.title}</span>
      </div>
      <div className="text-[16px] leading-snug mb-4">
        <Md>{d.q}</Md>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {d.answers.map((a, i) => {
          const right = checked && ok(a, typed[i] ?? '')
          return (
            <label key={i} className="flex flex-col gap-0.5 text-xs">
              <span className="text-mute font-semibold">
                {a.label}
                {a.unit ? ` (${a.unit})` : ''}
              </span>
              <span className="flex items-center gap-2">
                <input
                  className={'field w-40 ' + (checked ? (right ? '!border-good' : '!border-bad') : '')}
                  inputMode={a.angle ? 'text' : 'decimal'}
                  value={typed[i] ?? ''}
                  onChange={(e) => setTyped((x) => Object.assign([...x], { [i]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && check()}
                />
                {checked && <span className={right ? 'text-good' : 'text-bad'}>{right ? '✓' : reveal ? show(a) : '✗'}</span>}
              </span>
            </label>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="btn btn-primary" onClick={check}>
          Check
        </button>
        <button className="btn" onClick={() => setReveal(true)}>
          Show the working
        </button>
        <button className="btn btn-ghost" onClick={fresh}>
          ↻ New numbers
        </button>
      </div>
      {reveal && (
        <div className="mt-4 rounded-xl bg-panel2 p-3 text-sm">
          <Md>{d.steps}</Md>
        </div>
      )}
    </div>
  )
}
