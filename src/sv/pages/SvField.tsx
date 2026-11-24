// Field book: every data sheet you've started, grouped by job; open one to fill it in the field.
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { exportPdf, PrintHead } from '../../components/ExportPdf'
import { useStore, type FieldSheet } from '../../store'
import { SvTopicIcon } from '../components/icons'
import { ReadOnly } from '../field/Grid'
import { KINDS, kindOf } from '../field/kinds'
import { deleteSheet, duplicateSheet, newSheet, sheetData, updateSheet, type SheetData } from '../field/sheets'
import { SV_SCHEDULE } from '../plan'
import { svTopicById } from '../registry'

export default function SvField() {
  const { sheet } = useParams()
  return sheet ? <SheetPage id={sheet} /> : <FieldHome />
}

/** buttons to start a sheet of one kind (used on topic pages too) */
export function NewSheetButtons({ kind, compact }: { kind: string; compact?: boolean }) {
  const nav = useNavigate()
  const k = kindOf(kind)
  if (!k) return null
  return (
    <div className={'flex flex-wrap gap-2 ' + (compact ? '' : 'mt-2')}>
      <button className="btn btn-primary !text-xs" onClick={() => nav(`/ce104/field/${newSheet(kind)}`)}>
        + New blank {k.label.toLowerCase()}
      </button>
      {k.sample && (
        <button className="btn !text-xs" onClick={() => nav(`/ce104/field/${newSheet(kind, true)}`)} title={k.sampleNote}>
          Open the worked example
        </button>
      )}
    </div>
  )
}

export function SheetList({ kind }: { kind?: string }) {
  const book = useStore((s) => s.fieldbook)
  const list = Object.values(book)
    .filter((s) => !s.deleted && (!kind || s.kind === kind))
    .sort((a, b) => b.at - a.at)
  if (!list.length) return <div className="text-sm text-faint">No sheets yet.</div>
  return (
    <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
      {list.map((s) => (
        <SheetCard key={s.id} s={s} />
      ))}
    </div>
  )
}

function SheetCard({ s }: { s: FieldSheet }) {
  const k = kindOf(s.kind)
  const t = k ? svTopicById(k.topic) : undefined
  const meta = sheetData(s).meta
  return (
    <Link to={`/ce104/field/${s.id}`} className="card p-3 hover:border-accent transition-colors flex gap-3 items-start">
      {t && <SvTopicIcon id={t.id} color={t.color} size={22} />}
      <div className="min-w-0">
        <div className="font-bold truncate">{s.title}</div>
        <div className="text-xs text-mute">
          {k?.label} · {meta.date || new Date(s.made).toLocaleDateString()} · edited {new Date(s.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </Link>
  )
}

function FieldHome() {
  const today = new Date().toISOString().slice(0, 10)
  const day = SV_SCHEDULE.find((d) => d.date === today)
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold">Field book</h1>
        <p className="text-mute text-sm mt-1 max-w-3xl">
          Type the readings as you take them — every sheet reduces itself as you go and runs the checks the teachers look for (ΣBS − ΣFS, angle sums, closing error, check lines…), then draws the plot. Sheets save on this phone at once and sync to your other devices when you are signed in. Each one exports as a PDF.
        </p>
      </div>
      {day && day.topics.length > 0 && (
        <div className="card p-4 border-accent/60">
          <div className="text-xs font-bold text-accent uppercase tracking-wider">Today in the field</div>
          <div className="font-bold mt-0.5">{day.items.join(' · ')}</div>
          <div className="flex flex-wrap gap-4 mt-2">
            {KINDS.filter((k) => day.topics.includes(k.topic)).map((k) => (
              <div key={k.kind}>
                <div className="text-sm font-semibold">{k.label}</div>
                <NewSheetButtons kind={k.kind} compact />
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="font-bold mb-2">My sheets</div>
        <SheetList />
      </div>
      <div>
        <div className="font-bold mb-2">Start a sheet</div>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {KINDS.map((k) => {
            const t = svTopicById(k.topic)
            return (
              <div key={k.kind} className="card p-4 flex flex-col">
                <div className="flex items-center gap-2">
                  {t && <SvTopicIcon id={t.id} color={t.color} size={20} />}
                  <div className="font-bold">{k.label}</div>
                </div>
                <div className="text-xs text-mute mt-1 flex-1">{k.does}</div>
                {k.sampleNote && <div className="text-[11px] text-faint mt-1">Example: {k.sampleNote}</div>}
                <NewSheetButtons kind={k.kind} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SheetPage({ id }: { id: string }) {
  const s = useStore((st) => st.fieldbook[id])
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  if (!s || s.deleted)
    return (
      <div className="card p-6">
        This sheet isn’t here (deleted, or not synced to this device yet). <Link to="/ce104/field" className="text-accent font-semibold">Back to the field book</Link>
      </div>
    )
  const k = kindOf(s.kind)
  if (!k) return <div className="card p-6">Unknown sheet kind “{s.kind}”.</div>
  const d = sheetData(s)
  const setBody = (body: unknown) => updateSheet(id, { data: { ...d, body } satisfies SheetData })
  const setMeta = (p: Partial<SheetData['meta']>) => updateSheet(id, { data: { ...d, meta: { ...d.meta, ...p } } })
  const t = svTopicById(k.topic)
  const Editor = k.Editor
  const pdf = async () => {
    setBusy(true)
    try {
      await exportPdf(
        <ReadOnly.Provider value={true}>
          <PrintHead kicker={`CE 104 · ${k.sheetTitle}`} title={s.title} chips={[d.meta.date, d.meta.group && 'Group ' + d.meta.group, d.meta.place].filter(Boolean) as string[]} />
          {d.meta.note && <p className="text-sm mb-3">{d.meta.note}</p>}
          <Editor data={d.body} set={() => {}} />
        </ReadOnly.Provider>,
        `CE104 ${s.title}.pdf`.replace(/[\\/:*?"<>|]/g, '-'),
        'CE 104 field book · BUET Practice Lab',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[16rem]">
          <Link to="/ce104/field" className="text-xs text-mute hover:text-accent">
            ← Field book
          </Link>
          <input className="block w-full bg-transparent text-2xl font-extrabold outline-none border-b border-transparent focus:border-accent mt-1" value={s.title} onChange={(e) => updateSheet(id, { title: e.target.value })} aria-label="Sheet title" />
          <div className="text-xs text-mute mt-1">
            {k.label} · {t && <Link to={`/ce104/topic/${t.id}`} className="hover:text-accent">how to do it in the field →</Link>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn !text-xs" onClick={pdf} disabled={busy}>
            {busy ? 'Making PDF…' : '⤓ PDF'}
          </button>
          <button
            className="btn !text-xs"
            onClick={() => {
              const nid = duplicateSheet(id)
              if (nid) nav(`/ce104/field/${nid}`)
            }}
          >
            Duplicate
          </button>
          <button
            className="btn !text-xs hover:!border-bad"
            onClick={() => {
              if (confirm(`Delete “${s.title}”? This removes it from every synced device.`)) {
                deleteSheet(id)
                nav('/ce104/field')
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-end text-xs">
        <label className="flex flex-col gap-0.5">
          <span className="text-mute font-semibold">Date of performance</span>
          <input className="field" type="date" value={d.meta.date} onChange={(e) => setMeta({ date: e.target.value })} />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-mute font-semibold">Group</span>
          <input className="field w-20" value={d.meta.group} onChange={(e) => setMeta({ group: e.target.value })} />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-mute font-semibold">Place</span>
          <input className="field w-48" value={d.meta.place} onChange={(e) => setMeta({ place: e.target.value })} />
        </label>
        <label className="flex flex-col gap-0.5 flex-1 min-w-[12rem]">
          <span className="text-mute font-semibold">Notes</span>
          <input className="field w-full" value={d.meta.note} onChange={(e) => setMeta({ note: e.target.value })} placeholder="weather, instrument no., anything odd" />
        </label>
      </div>
      <Editor data={d.body} set={setBody} />
      <div className="text-[11px] text-faint">Saved on this device as you type. Title block on the drawing: “{k.sheetTitle}”, CE 104, your name / roll / group, date of performance, legend, N–S line, numerical and graphical scale, ½″ border.</div>
    </div>
  )
}
