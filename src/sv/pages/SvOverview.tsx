// CE 104 overview: what's on today, the next test, the field-day schedule, the marks, and every field work.
import { Link } from 'react-router-dom'
import { Ring } from '../../components/ui'
import { today, useStore, type SvTopicId } from '../../store'
import { INST_POOL, qKey, SV_CARDS, SV_QUESTIONS } from '../content'
import { SvTopicIcon } from '../components/icons'
import { DRILLS } from '../drills/gens'
import { KINDS } from '../field/kinds'
import { nextTest, SV_MARKS, SV_SCHEDULE } from '../plan'
import { SV_GROUP_LABEL, SV_GROUPS, SV_TOPICS, svTopicById } from '../registry'

const fmtDay = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

export default function SvOverview() {
  const attempts = useStore((s) => s.attempts)
  const book = useStore((s) => s.fieldbook)
  const t = today()
  const nt = nextTest(t)
  const days = Math.max(0, Math.round((new Date(nt.date + 'T12:00:00').getTime() - new Date(t + 'T12:00:00').getTime()) / 86400000))
  const todayRow = SV_SCHEDULE.find((d) => d.date === t)
  const nextRow = SV_SCHEDULE.find((d) => d.date > t && d.topics.length)
  const right = (ids: { id: string; topic: SvTopicId }[]) => ids.filter((q) => attempts[qKey(q)]?.correct).length
  const inst = INST_POOL()
  const sheets = Object.values(book).filter((s) => !s.deleted)
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="card p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none">
            <SvTopicIcon id="sv-inst" size={170} color="var(--c-accent)" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-accent">Next up</div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-5xl font-extrabold num text-accent">{days}</span>
            <span className="text-mute">
              day{days === 1 ? '' : 's'} to the <b className="text-ink">{nt.label}</b>
            </span>
          </div>
          <p className="text-sm text-mute mt-2 max-w-xl">
            {nt.date === '2026-11-25'
              ? 'Instruments quiz: 15 marks, the 18-batch got objective questions + fill in the blanks. Run the mock a couple of times, then drill the misses.'
              : 'Final quiz (6:30 am), then the practical and the viva with your group. Mix quizzes, the viva deck and a few maths drills each day.'}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to="/ce104/quiz" className="btn btn-primary">
              {nt.date === '2026-11-25' ? 'Instruments quiz mock' : 'Final quiz mock'}
            </Link>
            <Link to="/ce104/field" className="btn">
              📒 Field book
            </Link>
            <Link to="/ce104/viva" className="btn">
              🎤 Viva deck
            </Link>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-mute">{todayRow ? 'Today · ' + fmtDay(t) : nextRow ? 'Next field day · ' + fmtDay(nextRow.date) : 'Field days are over'}</div>
          {(todayRow ?? nextRow) && (
            <>
              <ul className="mt-2 space-y-1">
                {(todayRow ?? nextRow)!.items.map((it, i) => (
                  <li key={i} className="font-semibold">
                    {it}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-mute mt-1">
                {(todayRow ?? nextRow)!.time} · {(todayRow ?? nextRow)!.place}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(todayRow ?? nextRow)!.topics.map((id) => {
                  const tp = svTopicById(id)!
                  return (
                    <Link key={id} to={`/ce104/topic/${id}`} className="chip !text-xs hover:!border-accent" style={{ color: tp.color }}>
                      <SvTopicIcon id={id} color={tp.color} size={13} /> {tp.short}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Tile label="Instruments-quiz pool" value={`${right(inst)}/${inst.length}`} sub="right at least once" />
        <Tile label="Whole question bank" value={`${right(SV_QUESTIONS)}/${SV_QUESTIONS.length}`} sub="MCQ · T/F · blanks" />
        <Tile label="Viva cards" value={String(SV_CARDS.length)} sub="oral questions" />
        <Tile label="Field-book sheets" value={String(sheets.length)} sub={`${KINDS.length} kinds · ${DRILLS.length} drill types`} />
      </div>

      <section>
        <h2 className="font-bold text-lg mb-3">Field days · 24 Nov → 3 Dec</h2>
        <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {SV_SCHEDULE.map((d) => {
            const past = d.date < t
            const now = d.date === t
            return (
              <div key={d.date} className={'card p-3 ' + (now ? 'border-accent ring-2 ring-accent/30' : past ? 'opacity-60' : '')}>
                <div className="flex items-center gap-2 text-xs">
                  <b>{fmtDay(d.date)}</b>
                  {now && <span className="chip !text-[10px] text-accent">today</span>}
                  {d.test && <span className="chip !text-[10px] text-bad">test</span>}
                </div>
                <ul className="text-sm mt-1 space-y-0.5">
                  {d.items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
                {d.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {d.topics.map((id) => {
                      const tp = svTopicById(id)!
                      return (
                        <Link key={id} to={`/ce104/topic/${id}`} title={tp.title} className="w-6 h-6 rounded-md grid place-items-center hover:bg-panel2">
                          <SvTopicIcon id={id} color={tp.color} size={15} />
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-lg mb-3">Field works</h2>
        {SV_GROUPS.map((g) => (
          <div key={g} className="mb-4">
            <div className="text-[11px] uppercase tracking-wider text-faint font-bold mb-2">{SV_GROUP_LABEL[g]}</div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
              {SV_TOPICS.filter((x) => x.group === g).map((tp) => {
                const qs = SV_QUESTIONS.filter((q) => q.topic === tp.id)
                const r = right(qs)
                return (
                  <Link key={tp.id} to={`/ce104/topic/${tp.id}`} className="card p-4 flex gap-3 items-start hover:border-accent transition-colors">
                    <SvTopicIcon id={tp.id} color={tp.color} size={26} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{tp.short}</div>
                      <div className="text-xs text-mute line-clamp-2">{tp.blurb}</div>
                      <div className="text-[11px] text-faint mt-1">
                        {tp.days.map(fmtDay).join(' · ')} · {qs.length} questions
                      </div>
                    </div>
                    <Ring value={qs.length ? r / qs.length : 0} size={34} stroke={3.5} color={tp.color} />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-bold mb-2">Marks (150, 1.5 credits)</h2>
          {SV_MARKS.map((m) => (
            <div key={m.item} className="flex items-center gap-3 text-sm py-0.5">
              <span className="flex-1">{m.item}</span>
              <span className="w-28 h-1.5 bg-line rounded-full overflow-hidden">
                <span className="block h-full bg-accent" style={{ width: `${(m.marks / 30) * 100}%` }} />
              </span>
              <b className="num w-6 text-right">{m.marks}</b>
            </div>
          ))}
        </div>
        <div className="card p-4 text-sm space-y-2">
          <h2 className="font-bold">Every drawing sheet must show</h2>
          <ul className="list-disc pl-5 space-y-0.5 text-mute">
            <li>title of the survey and the course no. (CE 104)</li>
            <li>name, roll and group no., date of performance</li>
            <li>legend, N–S line</li>
            <li>numerical and graphical scale</li>
            <li>half-inch border</li>
          </ul>
          <div className="text-xs text-faint">Lecture sheet, field work 1 · submissions are due the following day unless the sheet says otherwise.</div>
        </div>
      </section>
    </div>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-3">
      <div className="text-xs text-mute">{label}</div>
      <div className="text-2xl font-extrabold num">{value}</div>
      <div className="text-[11px] text-faint">{sub}</div>
    </div>
  )
}
